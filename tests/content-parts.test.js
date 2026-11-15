/* Checks the content parts (content/parts/*.js, order in content/manifest.js). Run: node tests/content-parts.test.js
   1. The manifest lists every part file once, and every listed file exists.
   2. Each part starts with its marker line, and parses as a script on its own (a cut inside a statement would not).
   3. Writing the text of all parts back changes no file (tools/lib-content-files.js).
   4. The manifest is a script that sets window.LS_CONTENT_PARTS (the loader reads it). */
const fs = require("fs"), path = require("path"), espree = require("espree"), vm = require("vm");
const lib = require("../tools/lib-content-files");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
const names = lib.partNames(), files = fs.readdirSync(lib.pdir).filter(f => f.endsWith(".js")).map(f => f.replace(/\.js$/, ""));
check(new Set(names).size === names.length, "the manifest lists no part twice");
check(names.every(n => files.includes(n)) && files.every(n => names.includes(n)), "the manifest and the folder content/parts/ list the same parts (" + names.length + ")");
for (const n of names) {
  const text = fs.readFileSync(lib.partFile(n), "utf8").replace(/\r\n/g, "\n");
  let ok = true; try { espree.parse(text, { ecmaVersion: "latest", sourceType: "script" }); } catch (e) { ok = false; console.log("  ", n, e.message); }
  check(text.startsWith("/*@part " + n + "*/\n") && ok, "part " + n + " starts with its marker and parses on its own");
}
const before = Object.fromEntries(names.map(n => [n, fs.statSync(lib.partFile(n)).mtimeMs]));
lib.writeContent(lib.readContent());
check(names.every(n => fs.statSync(lib.partFile(n)).mtimeMs === before[n]), "writing the text of all parts back changes no file");
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(lib.manifest, "utf8"), ctx);
check(JSON.stringify(ctx.window.LS_CONTENT_PARTS) === JSON.stringify(names), "content/manifest.js sets window.LS_CONTENT_PARTS to the same list");
failures.forEach(f => console.log("FAIL:", f));
console.log(failures.length ? failures.length + " failure(s)." : "Content parts test OK.");
process.exit(failures.length ? 1 : 0);
