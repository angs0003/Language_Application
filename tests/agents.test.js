/* Checks the subagent definitions in .claude/agents/: required fields, a model line, an output and done line, tools that exist, and the count in CLAUDE.md.
   Run: node tests/agents.test.js */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
let bad = 0;
const check = (ok, msg) => { if (ok) console.log("ok:", msg); else { bad++; console.log("FAIL:", msg); } };
const dir = path.join(root, ".claude", "agents"), files = fs.readdirSync(dir).filter(f => f.endsWith(".md"));
for (const f of files) {
  const s = fs.readFileSync(path.join(dir, f), "utf8").replace(/\r\n/g, "\n"), m = s.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) { check(false, f + " has front matter"); continue; }
  const fm = Object.fromEntries(m[1].split("\n").map(l => { const i = l.indexOf(":"); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
  const name = f.replace(/\.md$/, "");
  check(fm.name === name, `${f}: name matches the file name`);
  check(["opus", "sonnet", "haiku"].includes(fm.model), `${f}: model is opus, sonnet or haiku (${fm.model})`);
  check(!!fm.description && !!fm.tools, `${f}: has a description and tools`);
  check(/^Output:.*Done when:/m.test(m[2]), `${f}: has an Output and Done when line`);
  check(!/Bash\(gh /.test(fm.tools), `${f}: does not allow the gh command (it is not installed; use node tools/gh.js)`);
  const missing = [...fm.tools.matchAll(/node (tools\/[\w.-]+|tests\/)/g)].map(x => x[1]).filter(p => p.endsWith(".js") && !fs.existsSync(path.join(root, p)));
  check(!missing.length, `${f}: every tool script it may run exists ${missing.join(", ")}`);
}
const claude = fs.readFileSync(path.join(root, "CLAUDE.md"), "utf8");
const n = (claude.match(/Subagents \(`\.claude\/agents\/`, (\d+)/) || [])[1];
check(+n === files.length, `CLAUDE.md says ${n} subagents, the folder has ${files.length}`);
// CLAUDE.md is the short core; details live in docs/. Keep it short and keep every pointer valid.
check(Buffer.byteLength(claude) <= 14000, "CLAUDE.md is at most 14000 bytes (" + Buffer.byteLength(claude) + "); put details in docs/");
const texts = [["CLAUDE.md", claude]];
for (const d of [".claude/agents", ".claude/commands"]) for (const f of fs.readdirSync(path.join(root, d)).filter(x => x.endsWith(".md"))) texts.push([d + "/" + f, fs.readFileSync(path.join(root, d, f), "utf8")]);
for (const [name, t] of texts) {
  const gone = [...t.matchAll(/docs\/[A-Za-z0-9_\/.-]+\.md/g)].map(x => x[0]).filter(p => !/NNNN/.test(p) && !fs.existsSync(path.join(root, p)));
  check(!gone.length, name + ": every docs file it names exists " + [...new Set(gone)].join(", "));
  if (name !== "CLAUDE.md") check(!/CLAUDE\.md sections? (?:\d+, )*(?:3|4|5|6|7|10)\b/.test(t), name + ": does not point at sections of CLAUDE.md that moved to docs/ (3, 4, 5, 6, 7, 10)");
}
const featDir = path.join(root, "docs", "features"), idx = fs.readFileSync(path.join(featDir, "README.md"), "utf8");
const unlisted = fs.readdirSync(featDir).filter(f => f.endsWith(".md") && f !== "README.md" && !idx.includes("(" + f + ")"));
check(!unlisted.length, "docs/features/README.md lists every feature file " + unlisted.join(", "));
process.exit(bad ? 1 : 0);
