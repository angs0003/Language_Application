/* Checks a JSON file of story chapters before it is merged into content/content.js.
   Usage: node tools/check-chapters.js <ja|zh> <file.json> <firstThemeIndex>
   The file is an array with one chapter per theme, starting at theme index firstThemeIndex (the first theme of the app is index 0).
   Chapter: {t:"English title", l:[6 to 8 sentence strings], q:[[afterLineIndex, "Question?", ["correct","wrong","wrong"], 0, "Literal reason."], ...]}
   Line: "token|reading|meaning / token|reading|meaning / ： / 。 = English". Speaker labels (name, ：) are allowed in chapters.
   ERROR lines must be fixed. WARN lines should be fixed unless there is a good reason. */
const fs = require("fs");
const { PUN, knownFor, formMatcher } = require("./lib-known");
const [lang, file, startArg] = process.argv.slice(2);
if (!lang || !file || startArg === undefined) { console.log("Usage: node tools/check-chapters.js <ja|zh> <file.json> <firstThemeIndex>"); process.exit(2); }
const start = +startArg, G = require("./load-content")();
const themes = lang === "ja" ? G.JA : G.ZH, kanjiSet = new Set((G.KANJI_JA || []).map(k => k.c));
const data = JSON.parse(fs.readFileSync(file, "utf8"));
let errors = 0, warns = 0;
const err = (...m) => { errors++; console.log("ERROR:", ...m); }, warn = (...m) => { warns++; console.log("WARN:", ...m); };
if (!Array.isArray(data)) { err("file must be a JSON array"); process.exit(1); }
data.forEach((c, k) => {
  const ti = start + k, th = themes[ti], where = `chapter ${ti + 1} (${th ? th[0] : "?"})`;
  if (!th) return err(where, "has no matching theme");
  if (!c || typeof c.t !== "string" || !c.t || !Array.isArray(c.l) || !Array.isArray(c.q)) return err(where, "needs {t, l, q}");
  if (c.l.length < 6 || c.l.length > 8) err(where, "needs 6 to 8 lines, has", c.l.length);
  if (c.q.length < 2) err(where, "needs at least 2 questions");
  const known = knownFor(G, lang, ti);
  const used = new Set();
  c.l.forEach((ln, li) => {
    const w = `${where} line ${li + 1}`;
    if (typeof ln !== "string") return err(w, "not a string");
    const cut = ln.lastIndexOf(" = ");
    if (cut < 0) return err(w, "missing ' = English'");
    if (!ln.slice(cut + 3).trim()) err(w, "empty English");
    if (/\p{Extended_Pictographic}/u.test(ln)) err(w, "contains emoji");
    if (/["']/.test(ln.slice(cut + 3))) warn(w, "use curly quotes ’ “ ” in English");
    let content = 0;
    ln.slice(0, cut).split(" / ").map(t => t.split("|")).forEach(p => {
      if (PUN.test(p[0])) return;
      if (p.length !== 3 || !p[0] || !p[1] || !p[2]) return err(w, "bad token", JSON.stringify(p.join("|")));
      content++;
      th[1].forEach(x => { if (formMatcher(lang, [x])(p[0])) used.add(x[0]); });
      if (!known.has(p[0])) warn(w, `word not taught yet: ${p[0]} (${p[1]}, ${p[2]})`);
      if (lang === "ja") {
        if (p[0] === "は" && p[1] !== "wa") err(w, "particle は must have reading wa");
        if (p[0] === "を" && p[1] !== "o") err(w, "particle を must have reading o");
        if (p[0] === "へ" && p[1] !== "e") err(w, "particle へ must have reading e");
        [...p[0]].forEach(ch => { if (/[一-鿿]/.test(ch) && !kanjiSet.has(ch)) warn(w, `kanji ${ch} is not in KANJI_JA`); });
        if (/[぀-ヿ一-鿿]/.test(p[1])) err(w, "reading must be romaji:", p[1]);
      } else {
        if (/[一-鿿]/.test(p[1])) err(w, "reading must be pinyin:", p[1]);
        if (/[1-5]$/.test(p[1])) warn(w, "pinyin should use tone marks:", p[1]);
      }
    });
    if (content < 1) err(w, "has no words");
  });
  if (used.size < 6) warn(where, `uses only ${used.size} of the theme's 10 words (aim for at least 6). Unused: ${th[1].filter(x => !used.has(x[0])).map(x => x[0]).join(" ")}`);
  c.q.forEach((q, qi) => {
    const w = `${where} question ${qi + 1}`;
    if (!(Array.isArray(q) && Number.isInteger(q[0]) && q[0] >= 0 && q[0] < c.l.length && typeof q[1] === "string" && q[1] && Array.isArray(q[2]) && q[2].length === 3 && q[2].every(x => typeof x === "string" && x) && q[3] === 0 && typeof q[4] === "string" && q[4])) return err(w, "must be [afterLineIndex, \"Question?\", [correct, wrong, wrong], 0, \"Literal reason.\"] (the correct answer is first and the index is 0)");
    if (!/\?$/.test(q[1])) warn(w, "question should end with ?");
    if (new Set(q[2]).size !== 3) err(w, "options must be different");
  });
});
console.log(`Checked ${data.length} chapter(s) of ${lang}. ${errors} error(s), ${warns} warning(s).`);
process.exit(errors ? 1 : 0);
