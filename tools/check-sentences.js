/* Checks a JSON file of theme sentences before it is merged into content/content.js.
   Usage: node tools/check-sentences.js <ja|zh> <file.json> <firstThemeIndex>
   The file is an array with one entry per theme, starting at theme number firstThemeIndex + 1 (counting from 0 in code,
   so the first theme of the app is index 0). Each entry is an array of 6 sentence strings:
   "token|reading|meaning / token|reading|meaning / 。 = English translation".
   ERROR lines must be fixed. WARN lines should be fixed unless there is a good reason. */
const fs = require("fs");
const { knownFor, formMatcher } = require("./lib-known");
const [lang, file, startArg] = process.argv.slice(2);
if (!lang || !file || startArg === undefined) { console.log("Usage: node tools/check-sentences.js <ja|zh> <file.json> <firstThemeIndex>"); process.exit(2); }
const start = +startArg;
const G = require("./load-content")();
const themes = lang === "ja" ? G.JA : G.ZH, story = lang === "ja" ? G.STORY_JA : G.STORY_ZH, gr = G.GR[lang], parts = G.PARTS[lang];
const kanjiSet = new Set((G.KANJI_JA || []).map(k => k.c));
const PUN = /^[\s。、，,.!?！？：:；;「」『』“”"'（）()…·\-]+$/;
const data = JSON.parse(fs.readFileSync(file, "utf8"));
let errors = 0, warns = 0;
const err = (...m) => { errors++; console.log("ERROR:", ...m); }, warn = (...m) => { warns++; console.log("WARN:", ...m); };
function partOf(i) { let p = parts[0]; parts.forEach(x => { if (i >= x.t) p = x; }); return p; }
function grammarUpTo(i) { const p = partOf(i); const gi = Math.min(gr.length - 1, p.g + ((i - p.t) % p.n)); const last = (i - p.t) >= p.n - 1 ? p.g + p.n - 1 : gi; return Math.max(gi, Math.min(gr.length - 1, last)); }
if (!Array.isArray(data)) { err("file must be a JSON array"); process.exit(1); }
data.forEach((arr, k) => {
  const ti = start + k, th = themes[ti], where = `theme ${ti + 1} (${th ? th[0] : "?"})`;
  if (!th) return err(where, "does not exist");
  if (!Array.isArray(arr) || arr.length !== 6) return err(where, "needs exactly 6 sentences, has", Array.isArray(arr) ? arr.length : "none");
  const known = knownFor(G, lang, ti);
  const isOwn = formMatcher(lang, th[1]), seenEn = new Set(), own = new Set(th[1].map(w => w[0]));
  arr.forEach((ln, si) => {
    const w = `${where} sentence ${si + 1}`;
    if (typeof ln !== "string") return err(w, "not a string");
    const cut = ln.lastIndexOf(" = ");
    if (cut < 0) return err(w, "missing ' = English'");
    const en = ln.slice(cut + 3).trim();
    if (!en) err(w, "empty English");
    if (/[\u{1F300}-\u{1FAFF}☀-➿]/u.test(ln)) err(w, "contains emoji");
    if (/["']/.test(en)) warn(w, "use curly quotes ’ “ ” in English");
    if (seenEn.has(en)) err(w, "duplicate English in this theme"); seenEn.add(en);
    const toks = ln.slice(0, cut).split(" / ").map(t => t.split("|"));
    let content = 0, usesOwn = false;
    toks.forEach(p => {
      if (PUN.test(p[0])) return;
      if (p.length !== 3 || !p[0] || !p[1] || !p[2]) return err(w, "bad token", JSON.stringify(p.join("|")));
      content++;
      if (isOwn(p[0])) usesOwn = true;
      if (!known.has(p[0])) warn(w, `word not taught yet: ${p[0]} (${p[1]}, ${p[2]})`);
      if (lang === "ja") {
        if (p[0] === "は" && p[1] !== "wa") err(w, "particle は must have reading wa");
        if (p[0] === "を" && p[1] !== "o") err(w, "particle を must have reading o");
        if (p[0] === "へ" && p[1] !== "e") err(w, "particle へ must have reading e");
        if (/[A-Z]/.test(p[1]) && !/^[A-Z]/.test(p[1])) warn(w, "odd capital letters in reading:", p[1]);
        [...p[0]].forEach(c => { if (/[一-鿿]/.test(c) && !kanjiSet.has(c)) warn(w, `kanji ${c} is not in KANJI_JA`); });
        if (/[一-鿿]/.test(p[1]) || /[぀-ヿ]/.test(p[1])) err(w, "reading must be romaji:", p[1]);
      } else {
        if (/[一-鿿]/.test(p[1])) err(w, "reading must be pinyin with tone marks:", p[1]);
        if (/[1-5]$/.test(p[1])) warn(w, "pinyin should use tone marks, not numbers:", p[1]);
        if (/[一-鿿]/.test(p[0]) && /[぀-ヿ]/.test(p[0])) err(w, "kana in Chinese sentence", p[0]);
      }
    });
    if (content < 2 || content > 8) err(w, `has ${content} content tokens, needs 2 to 8`);
    if (!usesOwn) err(w, "uses none of this theme's words");
    if (toks.some(p => p[0] === "：" || p[0] === ":")) err(w, "no speaker labels in lesson sentences");
  });
  const usedWords = new Set(); arr.forEach(ln => ln.slice(0, ln.lastIndexOf(" = ")).split(" / ").forEach(t => { const tk = t.split("|")[0]; th[1].forEach(w => { if (formMatcher(lang, [w])(tk)) usedWords.add(w[0]); }); }));
  const unused = [...own].filter(x => !usedWords.has(x));
  if (unused.length > Math.floor(own.size / 2)) warn(where, "the 6 sentences use only", usedWords.size, "of", own.size, "theme words; unused:", unused.join(" "));
});
console.log(`Checked ${data.length} theme(s) of ${lang}. ${errors} error(s), ${warns} warning(s).`);
process.exit(errors ? 1 : 0);
