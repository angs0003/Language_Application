/* Romaji-to-kana consistency rule shared by tools/validate-content.js and tools/check-words.js.
   toHira(romaji) must equal the kana, with these allowances:
   1. a final "wa" stands for は;
   2. if the kana has づ or ぢ, the romaji may spell them "z" and "j" (standard) or "dz" and "dj" (old);
   3. if the kana has を, the romaji may spell it "o" (standard) or "wo".
   A kana without づ, ぢ or を is compared exactly, so ず must still be "zu" and じ must still be "ji". */
const plain = s => s.replace(/づ/g, "ず").replace(/ぢ/g, "じ").replace(/を/g, "お");
function romajiMatches(toHira, romaji, kana) {
  const exp = romaji.endsWith("wa") ? kana.replace(/は$/, "わ") : kana;
  const got = toHira(romaji);
  if (got === exp) return true;
  return /[づぢを]/.test(exp) && plain(got) === plain(exp);
}
module.exports = { romajiMatches };
