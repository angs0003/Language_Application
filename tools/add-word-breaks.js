/* Word breaks for the example sentences of words (content/content.js).
   Each word entry may end with one extra element: its example sentence split into words, written like a story line:
   "text|reading|meaning / text|reading|meaning / ， / ... = English"  (zh: 7th element, ja: 8th element).
   Punctuation is a bare token. The tokens must join to the example, the readings must join to the example reading,
   and the English must be the example English.

   Usage:
     node tools/add-word-breaks.js --todo zh 0 30        list the words of themes 0 to 29 (0-based, end not included) with their example, as JSON lines
     node tools/add-word-breaks.js --check file.json     check a file without changing content.js
     node tools/add-word-breaks.js file.json [more.json] add the sentences to content.js (nothing is added when a sentence is wrong)
   A JSON file is { "zh": { "word": "sentence string" }, "ja": { "word": "sentence string" } }.
   Run node tools/validate-content.js afterwards. */
const fs = require("fs"), vm = require("vm"), path = require("path");
const { checkWordBreak, WIDTH } = require("./lib-word-breaks");
const file = path.join(__dirname, "..", "content", "content.js");
let src = fs.readFileSync(file, "utf8");
const crlf = src.includes("\r\n");
if (crlf) src = src.replace(/\r\n/g, "\n");
const ctx = {}; vm.createContext(ctx);
vm.runInContext(src + "\n;this.__={ZH,JA};", ctx);
const G = ctx.__, args = process.argv.slice(2);

if (args[0] === "--todo") {
  const lang = args[1], from = +args[2], to = +args[3], themes = lang === "zh" ? G.ZH : G.JA, width = WIDTH[lang];
  if (!WIDTH[lang] || !(from >= 0) || !(to > from)) { console.log("Usage: --todo zh|ja from to"); process.exit(1); }
  themes.slice(from, to).forEach((t, i) => t[1].forEach(w => console.log(JSON.stringify({ theme: from + i, title: t[0], word: w[0], reading: lang === "zh" ? w[1] : w[2], meaning: w[lang === "zh" ? 2 : 3], example: w[width - 3], exampleReading: w[width - 2], english: w[width - 1], done: w.length > width }))));
  process.exit(0);
}

const check = args[0] === "--check", files = check ? args.slice(1) : args;
if (!files.length) { console.log("Usage: see the top of this file"); process.exit(1); }
let done = 0, failed = 0;
for (const jf of files) {
  const data = JSON.parse(fs.readFileSync(jf, "utf8"));
  for (const lang of Object.keys(data)) {
    if (!WIDTH[lang]) { console.log("ERROR: unknown language", lang); failed++; continue; }
    const themes = lang === "zh" ? G.ZH : G.JA, byWord = new Map();
    themes.forEach(t => t[1].forEach(w => byWord.set(w[0], w)));
    for (const [word, tk] of Object.entries(data[lang])) {
      const entry = byWord.get(word);
      if (!entry) { console.log("ERROR:", lang, word, "is not a word in the content"); failed++; continue; }
      const base = entry.slice(0, WIDTH[lang]), errs = checkWordBreak(lang, base, tk);
      if (errs.length) { errs.forEach(m => console.log(`ERROR: ${lang} ${word}: ${m}`)); failed++; continue; }
      if (check) { done++; continue; }
      const old = JSON.stringify(entry), nw = JSON.stringify([...base, tk]), n = src.split(old).length - 1;
      if (n !== 1) { console.log("ERROR:", lang, word, "entry found", n, "times in content.js (expected 1)"); failed++; continue; }
      src = src.replace(old, () => nw); done++;
    }
  }
}
if (!check) fs.writeFileSync(file, crlf ? src.replace(/\n/g, "\r\n") : src);
console.log(`${check ? "Checked" : "Added word breaks to"} ${done} entries${failed ? `, ${failed} failed` : ", all correct"}.`);
process.exit(failed ? 1 : 0);
