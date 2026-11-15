/* Shared global scope check. The app files (js/*.js), config.js and content/content.js are loaded as scripts that share one global scope, so two files that declare the same
   top-level name break the app after both are merged, even if each branch passed alone. This test parses every file and fails on a duplicate top-level function, class,
   const, let or var name. Run: node tests/globals.test.js */
const fs = require("fs"), path = require("path"), espree = require("espree");
const root = path.join(__dirname, "..");
const files = [...fs.readdirSync(path.join(root, "js")).filter(f => f.endsWith(".js") && f !== "content-rows.js").map(f => "js/" + f), "config.js", "content/content.js"].filter(f => fs.existsSync(path.join(root, f)));
const where = new Map();
const names = pat => !pat ? [] : pat.type === "Identifier" ? [pat.name] : pat.type === "ObjectPattern" ? pat.properties.flatMap(p => names(p.value || p.argument)) : pat.type === "ArrayPattern" ? pat.elements.flatMap(names) : pat.type === "RestElement" ? names(pat.argument) : pat.type === "AssignmentPattern" ? names(pat.left) : [];
let failed = 0;
for (const f of files) {
  let ast;
  try { ast = espree.parse(fs.readFileSync(path.join(root, f), "utf8"), { ecmaVersion: "latest", sourceType: "script" }); }
  catch (e) { console.log("FAIL:", f, "cannot be parsed:", e.message); failed++; continue; }
  for (const n of ast.body) {
    const ids = n.type === "FunctionDeclaration" || n.type === "ClassDeclaration" ? [n.id.name] : n.type === "VariableDeclaration" ? n.declarations.flatMap(d => names(d.id)) : [];
    for (const id of ids) { if (!where.has(id)) where.set(id, []); where.get(id).push(f); }
  }
}
const dup = [...where].filter(([, fs_]) => fs_.length > 1);
for (const [id, fs_] of dup) { console.log("FAIL: top-level name", id, "is declared more than once:", fs_.join(", ")); failed++; }
if (!failed) console.log("ok:", where.size, "top-level names in", files.length, "files, no duplicates");
process.exit(failed ? 1 : 0);
