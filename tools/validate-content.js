/* Checks content.js for structural errors. Run: node tools/validate-content.js
   Exit code 1 if any error is found. */
const fs = require("fs"), vm = require("vm"), path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "content", "content.js"), "utf8");
const ctx = {}; vm.createContext(ctx);
vm.runInContext(src + "\n;this.__={ZH,JA,GR,STORY_ZH,STORY_JA,TRIP_JA,TRIP_ZH,VIDS,CASUAL};", ctx);
const { ZH, JA, GR, STORY_ZH, STORY_JA, TRIP_JA, TRIP_ZH, VIDS, CASUAL } = ctx.__;
const { formMatcher } = require("./lib-known");
const PUN = /^[\s。、，,.!?！？：:；;「」『』“”"'（）()…·\-]+$/;
let errors = 0; const err = (...m) => { errors++; console.log("ERROR:", ...m); };
/* Optional last element of a word entry: the example sentence with word breaks (checked by tools/lib-word-breaks.js). */
const { checkWordBreak } = require("./lib-word-breaks");
function checkWordBreaks(name, ti, wi, w, width) {
  checkWordBreak(name, w.slice(0, width), w[width]).forEach(m => err(`${name} theme ${ti + 1} word ${wi + 1} (${w[0]}) word breaks:`, m));
}
function checkLine(where, ln) {
  if (typeof ln !== "string") return err(where, "line is not a string");
  const k = ln.lastIndexOf(" = ");
  if (k < 0) err(where, "missing ' = English'");
  ln.slice(0, k).split(" / ").forEach(t => {
    const p = t.split("|");
    if (PUN.test(p[0])) return;
    if (p.length !== 3 || !p[0] || !p[1] || !p[2]) err(where, "bad token:", JSON.stringify(t));
  });
}
for (const [name, themes, width] of [["zh", ZH, 6], ["ja", JA, 7]]) {
  const seen = new Map();
  themes.forEach((t, ti) => {
    if (!Array.isArray(t) || typeof t[0] !== "string" || !Array.isArray(t[1])) return err(name, "theme", ti, "bad shape");
    t[1].forEach((w, wi) => {
      if (!Array.isArray(w) || (w.length !== width && w.length !== width + 1) || w.some(x => typeof x !== "string" || !x)) err(name, `theme ${ti + 1} word ${wi + 1}`, "bad word entry", JSON.stringify(w));
      else if (w.length === width) err(name, `theme ${ti + 1} word ${wi + 1} (${w[0]})`, "has no word breaks for its example sentence (run node tools/add-word-breaks.js)");
      else checkWordBreaks(name, ti, wi, w, width);
      if (seen.has(w[0])) err(name, "duplicate word", w[0], "in themes", seen.get(w[0]) + 1, "and", ti + 1);
      else seen.set(w[0], ti);
    });
    if (t[2] !== undefined) {
      if (!Array.isArray(t[2])) err(name, "theme", ti + 1, "sentences must be an array");
      else {
        if (t[2].length !== 6) err(name, "theme", ti + 1, "has", t[2].length, "sentences, expected 6");
        t[2].forEach((ln, li) => {
          checkLine(`${name} theme ${ti + 1} sentence ${li + 1}`, ln);
          if (typeof ln === "string" && !ln.split(" = ")[0].split(" / ").some(tok => formMatcher(name, t[1])(tok.split("|")[0]))) err(name, `theme ${ti + 1} sentence ${li + 1}`, "uses none of the theme's words");
        });
      }
    }
  });
  const story = name === "zh" ? STORY_ZH : STORY_JA;
  if (story.length !== themes.length) err(name, `story chapters (${story.length}) must equal themes (${themes.length})`);
  story.forEach((c, ci) => {
    if (!c.t || !Array.isArray(c.l) || !Array.isArray(c.q)) return err(name, "chapter", ci + 1, "bad shape");
    c.l.forEach((ln, li) => checkLine(`${name} chapter ${ci + 1} line ${li + 1}`, ln));
    c.q.forEach((q, qi) => { if (!(Number.isInteger(q[0]) && q[0] < c.l.length && typeof q[1] === "string" && Array.isArray(q[2]) && Number.isInteger(q[3]) && q[3] < q[2].length)) err(name, "chapter", ci + 1, "question", qi + 1, "bad"); });
  });
  GR[name].forEach((g, gi) => { if (!Array.isArray(g) || g.length !== 5 || !Array.isArray(g[3])) err(name, "grammar", gi + 1, "bad shape"); });
  const trip = name === "zh" ? TRIP_ZH : TRIP_JA;
  trip.forEach((d, i) => {
    d.hear.forEach((x, j) => checkLine(`${name} travel ${i + 1} hear ${j + 1}`, x));
    d.say.forEach((x, j) => { checkLine(`${name} travel ${i + 1} say ${j + 1}`, x[0]); if (x[1]) checkLine(`${name} travel ${i + 1} casual ${j + 1}`, x[1]); });
    d.drill.forEach(([h, s]) => { if (!d.hear[h] || !d.say[s]) err(name, "travel", i + 1, "drill reference", h, s); });
    d.role.forEach(r => { const a = r[0] === "h" ? d.hear : d.say; if (!a[+r.slice(1)]) err(name, "travel", i + 1, "role reference", r); });
  });
  (VIDS[name] || []).forEach((x, i) => {
    if (x.id && !/^[A-Za-z0-9_-]{11}$/.test(x.id)) err(name, "video", i + 1, "bad YouTube id");
    (x.transcript || []).forEach((ln, j) => { if (typeof ln.t !== "number") err(name, "video", i + 1, "transcript line", j + 1, "needs a start time t in seconds"); checkLine(`${name} video ${i + 1} transcript ${j + 1}`, ln.line); });
  });
  (CASUAL[name] || []).forEach((c, i) => {
    const w = `${name} casual lesson ${i + 1}`;
    if (!c || typeof c.t !== "string" || !c.t || typeof c.e !== "string" || !c.e || !Array.isArray(c.p) || c.p.length < 4 || c.p.length > 6) return err(w, "needs t, e and 4 to 6 pairs in p");
    c.p.forEach((x, j) => { if (!Array.isArray(x) || x.length !== 3 || typeof x[2] !== "string" || !x[2]) return err(w, "pair", j + 1, "must be [polite, casual, who]"); checkLine(`${w} polite ${j + 1}`, x[0]); checkLine(`${w} casual ${j + 1}`, x[1]); if (x[0] === x[1]) err(w, "pair", j + 1, "polite and casual are the same"); });
  });
  console.log(`${name}: ${themes.length} themes, ${seen.size} words, ${story.length} chapters, ${GR[name].length} grammar points, ${trip.length} travel situations, ${themes.reduce((n, t) => n + t[1].filter(w => w.length === width + 1).length, 0)} of ${seen.size} example sentences with word breaks`);
}
{
  /* Romaji of each Japanese word must convert to its kana (the app builds furigana from the romaji). Warning only. */
  const ks = fs.readFileSync(path.join(__dirname, "..", "js", "kanji.js"), "utf8");
  const toHira = new Function(ks.slice(ks.indexOf("const R2H_MAP"), ks.indexOf("const hasKanji")) + "; return toHira;")();
  let n = 0; JA.forEach((t, ti) => t[1].forEach(w => { if (/^[ぁ-ゖ]+$/.test(w[1]) && toHira(w[2]) !== (w[2].endsWith("wa") ? w[1].replace(/は$/, "わ") : w[1])) { n++; console.log(`WARN: ja theme ${ti + 1} word ${w[0]}: romaji ${w[2]} gives ${toHira(w[2])}, kana is ${w[1]}`); } }));
  if (!n) console.log("Romaji matches kana for every Japanese word.");
}
{
  const K = require("./load-content")();
  const kSeen = new Set(); K.KANJI_JA.forEach((k, i) => { if (!k.c || !Array.isArray(k.m) || !k.m.length || k.n !== k.p.length) err("kanji", i + 1, "bad entry", k.c); if (kSeen.has(k.c)) err("duplicate kanji", k.c); kSeen.add(k.c); });
  K.JA.forEach(t => t[1].forEach(w => [...w[0]].forEach(c => { if (/[\u4e00-\u9fff]/.test(c) && !kSeen.has(c)) err("kanji missing from KANJI_JA:", c, "(word " + w[0] + ")"); })));
  for (const s of ["hira", "kata"]) { const n = K.KANA[s].reduce((a, r) => a + r[1].length, 0); if (n !== 71) err("kana", s, "has", n, "characters, expected 71"); }
  console.log(`kanji: ${K.KANJI_JA.length}, kana: 71 + 71, TV titles: ${K.TVREC.ja.length + K.TVREC.zh.length}`);
}
if (errors) { console.log(`${errors} error(s).`); process.exit(1); } else console.log("Content OK.");
/* Round trip: content -> database rows -> content must be identical. */
{
  const loadContent = require("./load-content"), { buildRows, buildContent } = require("../js/content-rows");
  const G = loadContent(), back = buildContent(buildRows(G, "test"));
  for (const k of ["ZH", "JA", "GR", "STORY_ZH", "STORY_JA", "TRIP_ZH", "TRIP_JA", "PARTS", "LEVELS", "VIDS", "KANJI_JA", "KANA", "TVREC", "CASUAL"])
    if (JSON.stringify(G[k]) !== JSON.stringify(back[k])) { console.log("ERROR: database round trip changed", k); process.exitCode = 1; }
  if (!process.exitCode) console.log("Database round trip OK.");
}
