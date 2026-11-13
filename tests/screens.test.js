/* Fails when a screen of the app is missing from the screens registry (tests/phone/screens.js), so that every screen is covered by the
   generic phone checks (no script errors, no sideways scrolling, at most one primary button, touch targets). Run: node tests/screens.test.js */
const fs = require("fs"), path = require("path");
const reg = require("./phone/screens.js");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };

const dir = path.join(__dirname, "..", "js");
const found = new Set();
fs.readdirSync(dir).filter(f => f.endsWith(".js")).forEach(f => {
  for (const m of fs.readFileSync(path.join(dir, f), "utf8").matchAll(/^function ((?:screen|home)[A-Z]\w*)\s*\(/gm)) found.add(m[1]);
});
const covered = new Set(reg.screens.flatMap(s => s.covers)), skipped = new Set(Object.keys(reg.skip));
const missing = [...found].filter(n => !covered.has(n) && !skipped.has(n));
check(found.size >= 25, `the app has ${found.size} screen functions (screenX and homeX)`);
check(missing.length === 0, "every screen function is in the registry or in the skip list with a reason" + (missing.length ? ": missing " + missing.join(", ") + " (add it to tests/phone/screens.js)" : ""));
const stale = [...covered, ...skipped].filter(n => !found.has(n));
check(stale.length === 0, "the registry names only screen functions that exist" + (stale.length ? ": unknown " + stale.join(", ") : ""));
check(Object.values(reg.skip).every(r => typeof r === "string" && r.length > 10), "every skipped screen has a reason");
check(reg.screens.every(s => s.name && typeof s.open === "string" && Array.isArray(s.covers)) && new Set(reg.screens.map(s => s.name)).size === reg.screens.length, "every registry entry has a unique name, an open script and a covers list");

failures.forEach(f => console.log("FAIL:", f));
console.log(failures.length ? failures.length + " failure(s)." : "Screens registry test OK.");
process.exit(failures.length ? 1 : 0);
