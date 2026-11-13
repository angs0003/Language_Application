/* Checks one word-break sentence ("text|reading|meaning / ... = English") against the word entry it belongs to.
   Used by tools/validate-content.js and tools/add-word-breaks.js. Returns a list of error texts (empty when it is correct). */
const { PUN, formMatcher } = require("./lib-known");
const WIDTH = { zh: 6, ja: 7 };
const stripRd = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
function checkWordBreak(lang, w, tk) {
  const e = [], width = WIDTH[lang];
  if (typeof tk !== "string") return ["not a string"];
  const k = tk.lastIndexOf(" = ");
  if (k < 0) return ["missing ' = English'"];
  const toks = tk.slice(0, k).split(" / ").map(t => t.split("|")), ex = w[width - 3], exr = w[width - 2], exe = w[width - 1];
  toks.forEach(p => { if (!PUN.test(p[0]) && (p.length !== 3 || !p[0] || !p[1] || !p[2])) e.push("bad token " + JSON.stringify(p.join("|"))); });
  const joined = toks.map(t => t[0]).join("");
  if (joined.replace(/\s/g, "") !== ex.replace(/\s/g, "")) e.push(`tokens join to ${JSON.stringify(joined)} but the example is ${JSON.stringify(ex)}`);
  if (tk.slice(k + 3) !== exe) e.push(`English ${JSON.stringify(tk.slice(k + 3))} differs from the example English ${JSON.stringify(exe)}`);
  const rd = toks.filter(t => !PUN.test(t[0])).map(t => t[1] || "").join("");
  if (stripRd(rd) !== stripRd(exr)) e.push(`readings join to ${JSON.stringify(rd)} but the example reading is ${JSON.stringify(exr)}`);
  if (!toks.some(t => formMatcher(lang, [w])(t[0]))) e.push("no token is the word itself");
  return e;
}
module.exports = { checkWordBreak, WIDTH };
