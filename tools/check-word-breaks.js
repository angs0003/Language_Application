/* Report (does not change anything): compares the meaning given to each token in the word-break example sentences
   with the app's own meaning for the same word (a token whose text is a taught word of the same language).
   A token is flagged when its meaning shares no content word with any taught meaning of that word, so it may mean something else.
   Usage: node tools/check-word-breaks.js [zh|ja] [--all]   (--all lists every flag; default lists the first 80 per language) */
const fs = require("fs"), vm = require("vm"), path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "content", "content.js"), "utf8");
const ctx = {}; vm.createContext(ctx); vm.runInContext(src + "\n;this.__={ZH,JA};", ctx);
const { PUN } = require("./lib-known");
const STOP = new Set("a an the to of and or in on at by for is are was be been it as that this with from one s polite past ongoing form used often usually someone something".split(" "));
const SAME = { am: "be", are: "be", is: "be", was: "be", were: "be", my: "i", me: "i", mine: "i", his: "he", her: "she", our: "we", us: "we", your: "you", their: "they", them: "they", movie: "film", tv: "television", pretty: "beautiful" };
const stem = w => (SAME[w] || w).slice(0, 4);
const raw = s => s.toLowerCase().split(/[^a-z]+/).filter(Boolean).map(stem);
const words = s => { const c = s.toLowerCase().split(/[^a-z]+/).filter(x => x && !STOP.has(x)).map(stem); return c.length ? c : raw(s); };
const only = process.argv[2] === "zh" || process.argv[2] === "ja" ? process.argv[2] : null, all = process.argv.includes("--all");
for (const [lang, themes, width, mi] of [["zh", ctx.__.ZH, 6, 2], ["ja", ctx.__.JA, 7, 3]]) {
  if (only && only !== lang) continue;
  const vocab = new Map();
  themes.forEach(t => t[1].forEach(w => { if (!vocab.has(w[0])) vocab.set(w[0], []); vocab.get(w[0]).push(w[mi]); }));
  let checked = 0, flagged = [];
  themes.forEach((t, ti) => t[1].forEach(w => {
    if (w.length <= width) return;
    const k = w[width].lastIndexOf(" = ");
    w[width].slice(0, k).split(" / ").forEach(tok => {
      const [text, rd, mean] = tok.split("|");
      if (PUN.test(text) || !vocab.has(text)) return;
      checked++;
      const g = new Set(words(mean)), ok = vocab.get(text).some(m => words(m).some(x => g.has(x)));
      if (!ok) flagged.push(`theme ${ti + 1} word ${w[0]}: ${text} (${rd}) glossed "${mean}" but taught as "${vocab.get(text).join(" / ")}"`);
    });
  }));
  const uniq = [...new Set(flagged)];
  console.log(`${lang}: ${checked} tokens that are taught words checked, ${flagged.length} flagged (${uniq.length} different)`);
  (all ? uniq : uniq.slice(0, 80)).forEach(m => console.log("  " + m));
}
