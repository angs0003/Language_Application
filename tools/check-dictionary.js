/* Checks every vocabulary word against open dictionaries. Report only: it does not change content.
   Chinese: CC-CEDICT (npm package cedict-json, pinned in package.json).
   Japanese: JMdict (jmdict-simplified JSON). Get it with: npm run dict:get   (needs the GitHub CLI "gh")
             or download jmdict-eng-<version>.json.zip from https://github.com/scriptin/jmdict-simplified/releases,
             unzip it and pass the file with --jmdict <file> or the JMDICT_FILE environment variable.
   Usage: node tools/check-dictionary.js [--lang zh|ja] [--jmdict file] [--meanings] [--strict] [--md file]
   Result kinds, most serious first:
     READING  the reading does not match any dictionary reading for this word (likely an error)
     TONE     Chinese only: same letters, different tones (check; 一 and 不 tone changes are allowed)
     MISSING  the word is not a dictionary entry (often a phrase or an inflected form; check by hand)
     MEANING  only with --meanings: no English word in our meaning appears in the dictionary meanings (many are synonyms)
   Confirmed exceptions: tools/dictionary-exceptions.json  {"zh": {"word": "reason"}, "ja": {"word": "reason"}}
   --strict exits with code 1 if any READING result remains (for use as a check later). */
const fs = require("fs"), path = require("path");
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const only = opt("--lang"), strict = args.includes("--strict"), mdFile = opt("--md"), withMeanings = args.includes("--meanings");
const ROOT = path.join(__dirname, "..");
const G = require("./load-content")();
const exFile = path.join(__dirname, "dictionary-exceptions.json");
const EXC = fs.existsSync(exFile) ? JSON.parse(fs.readFileSync(exFile, "utf8")) : { zh: {}, ja: {} };
const results = [];
const add = (lang, kind, theme, w, detail) => { if (!(EXC[lang] || {})[w[0]]) results.push({ lang, kind, theme, word: w[0], detail }); };

/* ---------- shared: meaning overlap ---------- */
const STOP = new Set("a an the to of in on at for and or be is are am was sb sth with by as from do".split(" "));
const UK = { colour: "color", aeroplane: "airplane", mum: "mom", favourite: "favorite", centre: "center", metre: "meter", theatre: "theater", grey: "gray", flat: "apartment" };
const words = s => String(s).toLowerCase().replace(/\([^)]*\)/g, " ").split(/[^a-z']+/).filter(x => x.length > 1 && !STOP.has(x)).map(x => UK[x] || x);
const stem = x => x.replace(/(ing|ed|es|s)$/, "");
function meaningOverlaps(ours, glosses) {
  const g = new Set(words(glosses.join(" ")).map(stem));
  return words(ours).some(x => g.has(stem(x)));
}

/* ---------- Chinese ---------- */
const MARKS = { a: "āáǎàa", e: "ēéěèe", i: "īíǐìi", o: "ōóǒòo", u: "ūúǔùu", "ü": "ǖǘǚǜü" };
function syl(s) { // "lü4" -> "lǜ"
  const m = s.toLowerCase().replace(/u:|v/g, "ü").match(/^([a-zü]+)([1-5])$/);
  if (!m) return s.toLowerCase();
  let [, b, t] = m; t = +t; if (t === 5) return b;
  let i = b.indexOf("a"); if (i < 0) i = b.indexOf("e"); if (i < 0) i = b.indexOf("ou");
  if (i < 0) { for (let k = b.length - 1; k >= 0; k--) if ("aeiouü".includes(b[k])) { i = k; break; } }
  if (i < 0) return b;
  return b.slice(0, i) + MARKS[b[i]][t - 1] + b.slice(i + 1);
}
const markPinyin = p => p.split(/\s+/).map(syl).join("");
/* Spoken tone changes of 一 and 不 (tone sandhi), applied to the dictionary pinyin:
   不 before a 4th tone -> bu2; 一 before a 4th tone -> yi2, before tones 1 to 3 -> yi4. */
function sandhi(word, p) {
  const s = p.split(/\s+/), ch = [...word];
  if (ch.length !== s.length) return p;
  return s.map((x, i) => {
    const next = s[i + 1] ? +(s[i + 1].match(/[1-5]$/) || [0])[0] : 0;
    if (ch[i] === "不" && /^bu4$/i.test(x) && next === 4) return "bu2";
    if (ch[i] === "一" && /^yi1$/i.test(x) && next) return next === 4 ? "yi2" : next === 5 ? x : "yi4";
    return x;
  }).join(" ");
}
const flat = p => p.normalize("NFC").toLowerCase().replace(/[\s'’·\-,.!?，。！？]/g, "");
const toneless = p => flat(p).normalize("NFD").replace(/[̀-̏]/g, "").replace(/ü/g, "u").normalize("NFC");
function checkZh() {
  const D = require("cedict-json");
  const byWord = new Map();
  for (const e of D) { if (!byWord.has(e.simplified)) byWord.set(e.simplified, []); byWord.get(e.simplified).push(e); }
  let n = 0;
  G.ZH.forEach((t, ti) => t[1].forEach(w => {
    n++;
    const [word, pinyin, meaning] = w, theme = `${ti + 1} ${t[0]}`;
    const es = byWord.get(word);
    if (!es) return add("zh", "MISSING", theme, w, `not a CC-CEDICT entry (our pinyin: ${pinyin})`);
    const ours = flat(pinyin), cands = es.flatMap(e => [flat(markPinyin(e.pinyin)), flat(markPinyin(sandhi(word, e.pinyin)))]);
    if (!cands.includes(ours)) {
      const dict = [...new Set(es.map(e => markPinyin(e.pinyin)))].join(" or ");
      if (es.some(e => toneless(markPinyin(e.pinyin)) === toneless(pinyin))) {
        add("zh", "TONE", theme, w, `ours: ${pinyin}; dictionary: ${dict}`);
      } else add("zh", "READING", theme, w, `ours: ${pinyin}; dictionary: ${dict}`);
    }
    const gl = es.flatMap(e => e.english);
    if (withMeanings && !meaningOverlaps(meaning, gl)) add("zh", "MEANING", theme, w, `ours: "${meaning}"; dictionary: "${gl.slice(0, 4).join("; ")}"`);
  }));
  return n;
}

/* ---------- Japanese ---------- */
const kataToHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
function findJmdict() {
  const p = opt("--jmdict") || process.env.JMDICT_FILE;
  if (p) return p;
  const dir = path.join(ROOT, "tmp", "dict");
  if (!fs.existsSync(dir)) return null;
  const f = fs.readdirSync(dir).filter(x => /^jmdict-eng-\d.*\.json$/.test(x)).sort().pop();
  return f ? path.join(dir, f) : null;
}
function checkJa() {
  const file = findJmdict();
  if (!file) { console.log("Japanese skipped: no JMdict file. Run npm run dict:get, or pass --jmdict <file>."); return 0; }
  const J = JSON.parse(fs.readFileSync(file, "utf8"));
  const byForm = new Map(); // written form -> [{readings:Set, glosses:[]}]
  for (const e of J.words) {
    const kanji = (e.kanji || []).map(k => k.text), kana = (e.kana || []).map(k => k.text);
    const entry = { readings: new Set(kana.map(kataToHira)), glosses: (e.sense || []).flatMap(s => (s.gloss || []).map(g => g.text)) };
    for (const f of [...kanji, ...kana]) { if (!byForm.has(f)) byForm.set(f, []); byForm.get(f).push(entry); }
  }
  let n = 0;
  G.JA.forEach((t, ti) => t[1].forEach(w => {
    n++;
    const [word, kana, , meaning] = w, theme = `${ti + 1} ${t[0]}`;
    const es = byForm.get(word);
    if (!es) return add("ja", "MISSING", theme, w, `not a JMdict entry (often an inflected form such as ～ます, or a phrase; our kana: ${kana})`);
    if (!es.some(e => e.readings.has(kataToHira(kana)))) {
      const dict = [...new Set(es.flatMap(e => [...e.readings]))].slice(0, 6).join(", ");
      add("ja", "READING", theme, w, `ours: ${kana}; dictionary: ${dict}`);
    }
    const gl = es.flatMap(e => e.glosses);
    if (withMeanings && !meaningOverlaps(meaning, gl)) add("ja", "MEANING", theme, w, `ours: "${meaning}"; dictionary: "${gl.slice(0, 4).join("; ")}"`);
  }));
  return n;
}

/* ---------- run and report ---------- */
const counted = {};
if (!only || only === "zh") counted.zh = checkZh();
if (!only || only === "ja") counted.ja = checkJa();
const ORDER = ["READING", "TONE", "MISSING", "MEANING"];
results.sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || a.lang.localeCompare(b.lang));
const lines = ["# Dictionary check", ""];
for (const [l, n] of Object.entries(counted)) {
  const r = results.filter(x => x.lang === l), c = k => r.filter(x => x.kind === k).length;
  lines.push(`- ${l === "zh" ? "Chinese (CC-CEDICT)" : "Japanese (JMdict)"}: ${n} words checked. READING ${c("READING")}, ${l === "zh" ? `TONE ${c("TONE")}, ` : ""}MISSING ${c("MISSING")}, MEANING ${c("MEANING")}.`);
}
if (!withMeanings) lines.push("", "MEANING checks are off; add --meanings to include them (many results are synonyms).");
lines.push("", "Report only. READING is most likely an error. Check the others by hand; add confirmed exceptions to tools/dictionary-exceptions.json.", "");
for (const k of ORDER) {
  const r = results.filter(x => x.kind === k); if (!r.length) continue;
  lines.push(`## ${k} (${r.length})`, "", "| Language | Theme | Word | Detail |", "|---|---|---|---|");
  r.forEach(x => lines.push(`| ${x.lang} | ${x.theme} | ${x.word} | ${x.detail.replace(/\|/g, "/")} |`));
  lines.push("");
}
const out = lines.join("\n");
if (mdFile) fs.writeFileSync(mdFile, out);
console.log(out);
const credits = "Data: CC-CEDICT (MDBG, CC BY-SA 4.0); JMdict (EDRDG, CC BY-SA 4.0) via jmdict-simplified.";
console.log(credits);
if (strict && results.some(x => x.kind === "READING")) process.exit(1);
