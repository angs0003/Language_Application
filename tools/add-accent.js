/* Adds pitch accent numbers for the Japanese words to content/content.js (the block ACCENT_JA).
   Source: Kanjium accents.txt (CC BY-SA 4.0; accent data by Uros O., see Settings > Credits).
   Usage:  node tools/add-accent.js --get      downloads accents.txt to tmp/accent/ (network)
           node tools/add-accent.js            matches every Japanese word (word and kana reading) and writes the block
           node tools/add-accent.js --report   shows the counts and the words without accent, changes nothing
   A word gets the numbers of the entry with the same word and reading, and nothing else: a match by reading alone gave wrong pitch for common words
   (for example ありがとう and おはよう, which are written with kanji in the source). A number larger than the mora count of the reading is dropped. */
const fs = require("fs"), path = require("path"), https = require("https");
const SRC = path.join(__dirname, "..", "tmp", "accent", "accents.txt");
const URL_ = "https://raw.githubusercontent.com/mifunetoshiro/kanjium/master/data/source_files/raw/accents.txt";
if (process.argv.includes("--get")) {
  fs.mkdirSync(path.dirname(SRC), { recursive: true });
  https.get(URL_, r => { const out = fs.createWriteStream(SRC); r.pipe(out); out.on("finish", () => console.log("saved", SRC)); }).on("error", e => { console.log("ERROR", e.message); process.exit(1); });
} else main();
function main() {
if (!fs.existsSync(SRC)) { console.log("ERROR: run node tools/add-accent.js --get first"); process.exit(1); }
const { moras } = require("../js/content-rows"), loadContent = require("./load-content");
const exact = new Map();
for (const line of fs.readFileSync(SRC, "utf8").split(/\r?\n/)) {
  let [w, k, a] = line.split("\t");
  if (!w || !a) continue;
  if (!k) k = w;
  exact.set(w + "\t" + k, a);
}
const words = loadContent().JA.flatMap(t => t[1]);
const out = {}, missing = [];
for (const w of words) {
  let a = exact.get(w[0] + "\t" + w[1]);
  const m = moras(w[1]).length;
  const nums = a ? a.split(",").map(x => x.trim()).filter(x => /^\d+$/.test(x) && +x <= m) : [];
  if (nums.length) out[w[0]] = [...new Set(nums)].join(","); else missing.push(w[0] + "|" + w[1]);
}
console.log(`words ${words.length}, with accent ${Object.keys(out).length} without ${missing.length}`);
if (process.argv.includes("--report")) { console.log(missing.join("  ")); process.exit(0); }
const f = path.join(__dirname, "..", "content", "content.js");
let s = fs.readFileSync(f, "utf8"); const crlf = s.includes("\r\n"); if (crlf) s = s.replace(/\r\n/g, "\n");
const block = `/* ACCENT_JA:start (written by tools/add-accent.js; accent numbers: 0 = flat, n = the pitch drops after mora n) */\nconst ACCENT_JA=${JSON.stringify(out)};\n/* ACCENT_JA:end */\n`;
const a = s.indexOf("/* ACCENT_JA:start"), b = s.indexOf("/* ACCENT_JA:end */\n");
s = a >= 0 && b > a ? s.slice(0, a) + block + s.slice(b + "/* ACCENT_JA:end */\n".length) : s.replace(/\n*$/, "\n") + block;
fs.writeFileSync(f, crlf ? s.replace(/\n/g, "\r\n") : s);
console.log("written to content/content.js");
}
