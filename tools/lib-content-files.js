/* Reads and writes the content as parts (content/parts/*.js, in the order of content/manifest.js).
   The parts are plain scripts that share one global scope; read together, in manifest order, they are the same program as the old single file content/content.js.
   Every part starts with the line  / *@part NAME* /  (written without the spaces), so that a tool can edit the whole text and write it back to the right files.
   readContent()          the whole text (all parts, in order, markers included)
   writeContent(text)     splits the text at the markers and rewrites the parts that changed; the parts must be the ones of the manifest, in the same order
   partNames()            the part names in order
   partFile(name)         the path of a part */
const fs = require("fs"), path = require("path");
const dir = path.join(__dirname, "..", "content"), pdir = path.join(dir, "parts"), manifest = path.join(dir, "manifest.js");
const MARK = /^\/\*@part ([\w.-]+)\*\/\n/m;
function partNames() { const t = fs.readFileSync(manifest, "utf8"); return JSON.parse(t.slice(t.indexOf("["), t.lastIndexOf("]") + 1)); }
const partFile = name => path.join(pdir, name + ".js");
function readContent() { return partNames().map(n => fs.readFileSync(partFile(n), "utf8").replace(/\r\n/g, "\n")).join(""); }
function writeContent(text) {
  const names = partNames(), pieces = text.split(/^(?=\/\*@part [\w.-]+\*\/\n)/m).filter(Boolean);
  const got = pieces.map(p => (p.match(MARK) || [])[1]);
  if (JSON.stringify(got) !== JSON.stringify(names)) throw new Error("The parts in the text (" + got.join(", ") + ") are not the parts of content/manifest.js (" + names.join(", ") + ")");
  pieces.forEach((p, i) => { const f = partFile(names[i]); if (!fs.existsSync(f) || fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n") !== p) fs.writeFileSync(f, p); });
}
module.exports = { readContent, writeContent, partNames, partFile, manifest, pdir };
