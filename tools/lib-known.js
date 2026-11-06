/* Shared by tools/check-sentences.js and tools/check-chapters.js.
   Decides which words a learner has already met when a theme is reached, and whether a token is a form of a theme word. */
const PUN = /^[\s。、，,.!?！？：:；;「」『』“”"'（）()…·\-]+$/;
const isVerbJa = w => /to /.test(w[3] || "") && /[うくぐすつぬぶむる]$/.test(w[1]);
const isAdjJa = w => !/to /.test(w[3] || "") && /い$/.test(w[0]) && /い$/.test(w[1]);
/* Japanese: a token is a form of a word when it is the word itself, or the word's stem plus an ending of up to 6 characters
   (for verbs and い-adjectives: 食べます, 行って, 高くない, 楽しかった). */
function formMatcher(lang, words) {
  const exact = new Set(words.map(w => w[0])), stems = [];
  if (lang === "ja") words.forEach(w => { if ((isVerbJa(w) || isAdjJa(w)) && w[0].length >= 2) stems.push(w[0].slice(0, -1)); });
  return t => exact.has(t) || (lang === "ja" && stems.some(s => t.length > s.length && t.length - s.length <= 6 && t.startsWith(s)));
}
function partOf(parts, i) { let p = parts[0]; parts.forEach(x => { if (i >= x.t) p = x; }); return p; }
function grammarUpTo(parts, gr, i) { const p = partOf(parts, i); const gi = Math.min(gr.length - 1, p.g + ((i - p.t) % p.n)); const last = (i - p.t) >= p.n - 1 ? p.g + p.n - 1 : gi; return Math.max(gi, Math.min(gr.length - 1, last)); }
function knownFor(G, lang, ti) {
  const themes = lang === "ja" ? G.JA : G.ZH, story = lang === "ja" ? G.STORY_JA : G.STORY_ZH, gr = G.GR[lang], parts = G.PARTS[lang];
  const words = []; for (let i = 0; i <= ti && i < themes.length; i++) words.push(...themes[i][1]);
  const extra = new Set();
  story.forEach(ch => ch.l.forEach(ln => ln.slice(0, ln.lastIndexOf(" = ")).split(" / ").forEach(t => extra.add(t.split("|")[0]))));
  for (let g = 0; g <= grammarUpTo(parts, gr, ti) && g < gr.length; g++) (gr[g][3] || []).forEach(t => extra.add(Array.isArray(t) ? t[0] : String(t).split("|")[0]));
  const isForm = formMatcher(lang, words);
  return { has: t => extra.has(t) || isForm(t) };
}
module.exports = { PUN, formMatcher, knownFor, grammarUpTo, partOf };
