/* Design rule 4 (docs/design-rules.md): no emoji in the interface source. Fails when js/*.js or index.html contain an emoji outside comments.
   Allowed: the safety net deEmoji() in js/ui.js (EMO_ICON, EMO_STATUS and its replace line), which must name the emoji it removes.
   Also checks plural(), the helper for count text ("1 word", "0 words"). Run: node tests/no-emoji.test.js */
const fs = require("fs"), path = require("path");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
const EMOJI = /[\u{1F000}-\u{1FFFF}☀-➿⬀-⯿⏩-⏿▶️]/u;
const root = path.join(__dirname, "..");
const files = fs.readdirSync(path.join(root, "js")).filter(f => f.endsWith(".js")).map(f => "js/" + f).concat("index.html");
let bad = 0;
for (const f of files) {
  const lines = fs.readFileSync(path.join(root, f), "utf8").split("\n");
  lines.forEach((ln, i) => {
    const code = ln.replace(/\/\*.*?\*\//g, "").replace(/<!--.*?-->/g, "").replace(/^\s*\/\/.*$/, "");
    if (!EMOJI.test(code)) return;
    if (f === "js/ui.js" && /EMO_ICON|EMO_STATUS|\.replace\(\/\(/.test(code)) return;
    bad++; failures.push(`${f}:${i + 1}: emoji in interface source: ${code.trim().slice(0, 80)}`);
  });
}
check(bad === 0, "no emoji in js/*.js and index.html outside comments and deEmoji()");
const core = fs.readFileSync(path.join(root, "js/core.js"), "utf8");
const m = core.match(/^const plural=.*$/m);
check(!!m, "plural() exists in js/core.js");
if (m) {
  const plural = new Function(m[0] + "; return plural;")();
  check(plural(0, "word") === "0 words" && plural(1, "word") === "1 word" && plural(2, "word") === "2 words", "plural: 0 words, 1 word, 2 words");
  check(plural(1, "new word") === "1 new word" && plural(3, "child", "children") === "3 children", "plural: two-word noun and irregular plural");
}
if (failures.length) { console.log("\nFAILURES:\n" + failures.join("\n")); process.exit(1); }
console.log("\nAll no-emoji checks passed.");
