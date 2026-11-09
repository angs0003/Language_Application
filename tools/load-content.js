/* Loads content/content.js in Node and returns the content globals. */
const fs = require("fs"), vm = require("vm"), path = require("path");
module.exports = function loadContent() {
  const src = fs.readFileSync(path.join(__dirname, "..", "content", "content.js"), "utf8");
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(src + "\n;this.__={ZH,JA,GR,STORY_ZH,STORY_JA,STORY,TRIP_JA,TRIP_ZH,PARTS,LEVELS,VIDS,KANJI_JA,KANA,TVREC,CASUAL};", ctx);
  return JSON.parse(JSON.stringify(ctx.__));
};
