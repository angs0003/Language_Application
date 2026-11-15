/* Tests the PROPOSED hardened guards in docs/proposed/guards/ (not active yet; see docs/proposed/README.md).
   1. Every case of tests/hooks.test.js must still pass with the proposed scripts.
   2. The bypasses found in docs/research/agent-architecture.md must be blocked: git options before push, bash -c, sh -c, eval, $(...), --all, --mirror, Bash writes to protected files.
   3. The test result is remembered for the exact working tree (commit, then push, runs the suite once).
   After the owner copies the scripts into .claude/hooks/, move these cases into tests/hooks.test.js and delete this file.
   Run: node tests/proposed-guards.test.js */
const { spawnSync } = require("child_process");
const fs = require("fs"), path = require("path"), os = require("os");
const root = path.join(__dirname, "..");
const DIR = path.join(root, "docs", "proposed", "guards");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
const hook = (name, tool_input, env) => spawnSync("node", [path.join(DIR, name)], { cwd: root, input: JSON.stringify({ tool_input }), encoding: "utf8", env: Object.assign({}, process.env, { GUARD_SKIP_TESTS: "1", GUARD_BRANCH: "feature/x", ALLOW_PROTECTED_EDIT: "" }, env || {}) });
const rel = (cmd, env) => hook("guard-release.js", { command: cmd }, env).status;
const fil = (cmd, env) => hook("guard-files.js", { command: cmd }, env).status;

// 1. the existing hook tests, run against the proposed scripts
const old = spawnSync("node", [path.join(__dirname, "hooks.test.js")], { cwd: root, encoding: "utf8", env: Object.assign({}, process.env, { GUARD_HOOKS_DIR: "docs/proposed/guards" }) });
check(old.status === 0 && /Hooks test OK/.test(old.stdout), "all cases of tests/hooks.test.js pass with the proposed guards");

// 2a. pushes to main that the active guard misses
for (const c of ["git -C . push origin main", "git -c user.name=x push origin main", "git --no-pager push origin main", "bash -c 'git push origin main'", "sh -c \"git push origin main\"", "eval \"git push origin main\"", "echo $(git push origin main)", "git push --all", "git push --mirror origin", "git push origin +feature/x", "git -C /tmp push -f origin feature/x"])
  check(rel(c) === 2, "blocked: " + c);
check(rel("git -C /tmp commit -m x", { GUARD_BRANCH: "main" }) === 2 && rel("bash -c 'git commit -m x'", { GUARD_BRANCH: "main" }) === 2, "a commit on main behind git options or bash -c is blocked");
for (const c of ["git -C . push origin feature/x", "bash -c 'git status'", "git push origin feature/main-menu", "git -C . status", "git push -u origin chore/x", "echo main"])
  check(rel(c) === 0, "allowed: " + c);

// 2b. Bash writes to protected files
const protectedWrites = ["sed -i s/a/b/ .github/workflows/test.yml", "echo x >> .github/workflows/test.yml", "cp tmp/x .claude/settings.json", "node -e \"require('fs').writeFileSync('.claude/hooks/guard-release.js','')\"",
  "git checkout -- .claude/settings.json", "rm .env", "echo KEY=1 > .env", "tee .env.local < tmp/x", "mv tmp/x .claude/hooks/guard-files.js", "sed -i s/CACHE/x/ sw.js", "python -c \"open('.github/workflows/deploy.yml','w')\""];
for (const c of protectedWrites) check(fil(c) === 2, "blocked: " + c);
const reads = ["cat .github/workflows/test.yml", "grep -n uses .github/workflows/deploy.yml", "git diff .claude/settings.json", "git add .github/workflows/test.yml", "ls .claude/hooks", "cat .env.example", "git log -- .github/workflows", "sed -n 1,5p .claude/settings.json",
  "sed -i s/a/b/ js/ui.js", "npm test 2>&1 | tail -3", "git diff .github/workflows 2>&1", "node tests/hooks.test.js", "cp tmp/a tmp/b"];
for (const c of reads) check(fil(c) === 0, "allowed: " + c);
check(fil("sed -i s/a/b/ .github/workflows/test.yml", { ALLOW_PROTECTED_EDIT: "1" }) === 0, "ALLOW_PROTECTED_EDIT=1 still lets the owner allow it");
check(hook("guard-files.js", { file_path: "/repo/.github/workflows/test.yml", old_string: "a", new_string: "b" }).status === 2 && hook("guard-files.js", { file_path: "/repo/js/ui.js", old_string: "a", new_string: "b" }).status === 0, "the Edit and Write rules are unchanged");

// 3. the test result is remembered for the exact working tree
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "guard-")), counter = path.join(dir, "count"), cacheFile = path.join(dir, "ok");
const script = path.join(dir, "count.js"); fs.writeFileSync(script, "require('fs').appendFileSync(process.argv[2], 'x'); process.exit(+process.argv[3]);");
const counted = ok => `node "${script}" "${counter}" ${ok ? 0 : 1}`;
const gate = (ok) => hook("guard-release.js", { command: "git commit -m x" }, { GUARD_SKIP_TESTS: "", GUARD_TEST_CMD: counted(ok), GUARD_CACHE_FILE: cacheFile }).status;
const runs = () => (fs.existsSync(counter) ? fs.readFileSync(counter, "utf8").length : 0);
check(gate(false) === 2 && runs() === 1 && !fs.existsSync(cacheFile), "a failing suite blocks the commit and is not remembered");
check(gate(true) === 0 && runs() === 2 && fs.existsSync(cacheFile), "a passing suite allows the commit and is remembered");
check(gate(false) === 0 && runs() === 2, "the same working tree does not run the suite again (even a push after the commit)");
const dummy = path.join(root, "zz-guard-dummy.txt");
try { fs.writeFileSync(dummy, "x"); check(gate(true) === 0 && runs() === 3, "a changed working tree runs the suite again"); } finally { fs.rmSync(dummy, { force: true }); fs.rmSync(dir, { recursive: true, force: true }); }

failures.forEach(f => console.log("FAIL:", f));
console.log(failures.length ? failures.length + " failure(s)." : "Proposed guards test OK.");
process.exit(failures.length ? 1 : 0);
