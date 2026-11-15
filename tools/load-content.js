/* Loads the content (the parts in content/parts/, in the order of content/manifest.js) in Node and returns the content globals. */
const vm = require("vm");
module.exports = function loadContent() {
  const src = require("./lib-content-files").readContent();
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(src + "\n;this.__={ZH,JA,GR,STORY_ZH,STORY_JA,STORY,TRIP_JA,TRIP_ZH,PARTS,LEVELS,VIDS,KANJI_JA,KANA,TVREC,CASUAL,ACCENT_JA:typeof ACCENT_JA===\"undefined\"?{}:ACCENT_JA};", ctx);
  return JSON.parse(JSON.stringify(ctx.__));
};
