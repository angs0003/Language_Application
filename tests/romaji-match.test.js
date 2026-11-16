/* Tests the romaji-to-kana consistency rule of tools/validate-content.js and tools/check-words.js. Run: node tests/romaji-match.test.js */
const fs = require("fs"), path = require("path");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
const ks = fs.readFileSync(path.join(__dirname, "..", "js", "kanji.js"), "utf8");
const toHira = new Function(ks.slice(ks.indexOf("const R2H_MAP"), ks.indexOf("const hasKanji")) + "; return toHira;")();
const { romajiMatches } = require("../tools/romaji-match");
const m = (kana, romaji) => romajiMatches(toHira, romaji, kana);
check(m("つづける", "tsuzukeru"), "づ with z passes (tsuzukeru)");
check(m("つづける", "tsudzukeru"), "づ with dz still passes");
check(m("こづつみ", "kozutsumi"), "づ with z passes (kozutsumi)");
check(m("はなぢ", "hanaji") && m("はなぢ", "hanadji"), "ぢ with j and dj passes");
check(m("ちぢむ", "chijimu"), "ぢ with j passes (chijimu)");
check(m("ずっと", "zutto"), "ず with zu passes");
check(!m("ずっと", "dzutto"), "ず with dzu is a mismatch");
check(m("すず", "suzu"), "ず with zu passes (suzu)");
check(!m("すず", "sudzu"), "ず with dzu is a mismatch (sudzu)");
check(!m("じかん", "dzikan") && m("じかん", "jikan"), "じ with ji passes, dzi is a mismatch");
check(!m("つづける", "tsukeru"), "a real mismatch still warns");
check(m("つずける", "tsuzukeru"), "ず kana with zu passes");
check(m("きをつける", "ki o tsukeru") && m("きをつける", "ki wo tsukeru"), "を with o and wo passes");
check(!m("きおつける", "ki wo tsukeru"), "お kana does not accept wo");
check(m("わたしは", "watashiwa"), "は written wa passes");
if (failures.length) { console.log("\nFAILED:\n" + failures.join("\n")); process.exit(1); }
console.log("\nAll romaji match checks passed.");
