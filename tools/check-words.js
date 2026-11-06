/* Checks a JSON file of new Japanese themes before it is merged into content/content.js.
   Usage: node tools/check-words.js <file.json>
   The file is an array of themes: ["Title", [word, word, ...]]. Each Japanese word is
   [word, kana, romaji, meaning, example, example romaji, example English].
   ERROR lines must be fixed. WARN lines should be fixed unless there is a good reason. */
const fs = require("fs"), path = require("path");
const file = process.argv[2];
if (!file) { console.log("Usage: node tools/check-words.js <file.json>"); process.exit(2); }
const G = require("./load-content")();
const ks = fs.readFileSync(path.join(__dirname, "..", "js", "kanji.js"), "utf8");
const toHira = new Function(ks.slice(ks.indexOf("const R2H_MAP"), ks.indexOf("const hasKanji")) + "; return toHira;")();
const data = JSON.parse(fs.readFileSync(file, "utf8"));
let errors = 0, warns = 0;
const err = (...m) => { errors++; console.log("ERROR:", ...m); }, warn = (...m) => { warns++; console.log("WARN:", ...m); };
const existing = new Map(); G.JA.forEach((t, i) => t[1].forEach(w => existing.set(w[0], i + 1)));
const mine = new Map();
if (!Array.isArray(data)) { err("file must be a JSON array"); process.exit(1); }
data.forEach((t, ti) => {
  const where = `theme ${ti + 1} in file (${Array.isArray(t) ? t[0] : "?"})`;
  if (!Array.isArray(t) || typeof t[0] !== "string" || !Array.isArray(t[1])) return err(where, "must be [\"Title\", [words]]");
  if (t.length !== 2) err(where, "must have only a title and a word list; no sentences yet");
  if (t[1].length !== 10) err(where, "needs exactly 10 words, has", t[1].length);
  t[1].forEach((w, wi) => {
    const ww = `${where} word ${wi + 1}`;
    if (!Array.isArray(w) || w.length !== 7 || w.some(x => typeof x !== "string" || !x.trim())) return err(ww, "needs 7 non-empty text fields", JSON.stringify(w));
    const [word, kana, romaji, meaning, ex, exr, exe] = w;
    if (existing.has(word)) err(ww, `duplicate of existing word ${word} (theme ${existing.get(word)})`);
    if (mine.has(word)) err(ww, `duplicate of ${word} in file theme ${mine.get(word)}`); else mine.set(word, ti + 1);
    if (/[ぁ-ゖ]/.test(kana) && !/[゠-ヿ一-鿿]/.test(kana)) {
      const exp = romaji.endsWith("wa") ? kana.replace(/は$/, "わ") : kana;
      if (toHira(romaji) !== exp) err(ww, `romaji ${romaji} gives ${toHira(romaji)} but kana is ${kana}`);
    } else if (!/^[゠-ヿ]+$/.test(kana)) err(ww, "kana field must be only hiragana or only katakana:", kana);
    if (/[一-鿿]/.test(kana)) err(ww, "kana field contains kanji");
    if (!/[A-Za-z]/.test(romaji) || /[^A-Za-z’' -]/.test(romaji)) err(ww, "romaji has odd characters:", romaji);
    if (!ex.includes(word) && !(kana && ex.includes(kana))) warn(ww, `the example does not contain ${word}`);
    if (!/[。？！]$/.test(ex)) warn(ww, "example should end with 。 ？ or ！");
    if (/\p{Extended_Pictographic}/u.test(w.join(""))) err(ww, "emoji");
    if (/["']/.test(exe + meaning)) warn(ww, "use curly quotes ’ “ ” in English");
  });
});
console.log(`Checked ${data.length} theme(s). ${errors} error(s), ${warns} warning(s).`);
process.exit(errors ? 1 : 0);
