/* Tests for the safety-rail hooks in .claude/hooks (guard-release.js, guard-files.js). Run: node tests/hooks.test.js
   Each hook gets the same JSON on stdin as Claude Code sends; exit code 2 means "blocked". */
const { spawnSync } = require("child_process");
const path = require("path");
const HOOKS = path.join(__dirname, "..", ...(process.env.GUARD_HOOKS_DIR || ".claude/hooks").split("/")); // set GUARD_HOOKS_DIR to test a copy of the hooks in another folder
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
const run = (hook, tool_input, env) => spawnSync("node", [path.join(HOOKS, hook)], { input: JSON.stringify({ tool_input }), env: Object.assign({}, process.env, { GUARD_SKIP_TESTS: "1", ALLOW_PROTECTED_EDIT: "", GUARD_BRANCH: "feature/x" }, env || {}), encoding: "utf8" });
const bash = (command, env) => run("guard-release.js", { command }, env).status;
const edit = (file_path, extra) => run("guard-files.js", Object.assign({ file_path }, extra || {})).status;
const UP = "npm run " + "upload"; // written in two parts so that this file is not itself blocked by the guard

// git rails
check(bash("git push origin main") === 2, "a push to main is blocked");
check(bash("git push origin HEAD:main") === 2 && bash("git push origin HEAD:refs/heads/master") === 2, "a push to main or master by refspec is blocked");
check(bash("git push --force origin feature/x") === 2 && bash("git push -f origin feature/x") === 2 && bash("git push --force-with-lease origin feature/x") === 2, "a force-push is blocked");
check(bash("git push origin --delete main") === 2, "deleting main on the remote is blocked");
check(bash("git push -u origin feature/x") === 0 && bash("git push origin --delete feature/x") === 0 && bash("git push") === 0, "pushing or deleting a feature branch is allowed");
check(bash("git push", { GUARD_BRANCH: "main" }) === 2 && bash("git push origin", { GUARD_BRANCH: "main" }) === 2, "a push with no target while on main is blocked");
check(bash("git commit -m x", { GUARD_BRANCH: "main" }) === 2 && bash("git add . && git commit -m x", { GUARD_BRANCH: "master" }) === 2, "a commit on main or master is blocked");
check(bash("git commit -m x") === 0 && bash("git status && git log --oneline -3") === 0, "a commit on a feature branch and read-only git commands are allowed");
check(bash(UP) === 2 && bash("node tools/upload-" + "content.js") === 2, "a content upload is blocked");
check(bash("git add -A && git push origin main") === 2 && bash("echo hi; git push origin main") === 2, "a push to main inside a longer command is blocked");
check(bash("npm test") === 0 && bash("ls -la") === 0 && bash("git push origin feature/main-menu") === 0, "other commands (and a branch name that contains main) are allowed");

// protected files
check(edit("C:/repo/.env") === 2 && edit("/repo/.env.local") === 2 && edit(".env.production") === 2, "editing .env files is blocked");
check(edit("/repo/.env.example") === 0, ".env.example can be edited");
check(edit("/repo/.github/workflows/test.yml") === 2 && edit("C:\\repo\\.github\\workflows\\deploy.yml") === 2, "editing workflows is blocked");
check(edit("/repo/.claude/settings.json") === 2 && edit("/repo/.claude/settings.local.json") === 2 && edit("/repo/.claude/hooks/guard-files.js") === 2 && edit("/repo/.claude/hooks/guard-release.js") === 2, "editing the safety rails is blocked");
check(edit("/repo/.claude/hooks/validate-content.js") === 0 && edit("/repo/.claude/commands/ship.md") === 0, "other files in .claude can be edited");
check(edit("/repo/sw.js", { old_string: "const CACHE=\"ls-1\"", new_string: "const CACHE=\"ls-2\"" }) === 2 && edit("/repo/sw.js", { content: "x" }) === 2, "changing CACHE in sw.js is blocked");
check(edit("/repo/sw.js", { old_string: "fetch(e.request)", new_string: "fetch(e.request, {})" }) === 0, "other edits to sw.js are allowed");
check(edit("/repo/js/ui.js", { old_string: "a", new_string: "b" }) === 0 && edit("/repo/content/content.js") === 0, "normal app and content files can be edited");
check(run("guard-files.js", { file_path: "/repo/.env" }, { ALLOW_PROTECTED_EDIT: "1" }).status === 0, "ALLOW_PROTECTED_EDIT=1 lets the owner allow a protected edit");
check(spawnSync("node", [path.join(HOOKS, "guard-files.js")], { input: "not json", encoding: "utf8" }).status === 0, "unreadable input does not block");

// Bypasses found by the agent review (docs/research/agent-architecture.md), now closed
const root = path.join(__dirname, "..");
const hook = (name, tool_input, env) => spawnSync("node", [path.join(HOOKS, name)], { cwd: root, input: JSON.stringify({ tool_input }), encoding: "utf8", env: Object.assign({}, process.env, { GUARD_SKIP_TESTS: "1", GUARD_BRANCH: "feature/x", ALLOW_PROTECTED_EDIT: "" }, env || {}) });
const rel = (cmd, env) => hook("guard-release.js", { command: cmd }, env).status;
const fil = (cmd, env) => hook("guard-files.js", { command: cmd }, env).status;
for (const c of ["git -C . push origin main", "git -c user.name=x push origin main", "git --no-pager push origin main", "bash -c 'git push origin main'", "sh -c \"git push origin main\"", "eval \"git push origin main\"", "echo $(git push origin main)", "git push --all", "git push --mirror origin", "git push origin +feature/x", "git -C /tmp push -f origin feature/x"])
  check(rel(c) === 2, "blocked: " + c);
check(rel("git -C /tmp commit -m x", { GUARD_BRANCH: "main" }) === 2 && rel("bash -c 'git commit -m x'", { GUARD_BRANCH: "main" }) === 2, "a commit on main behind git options or bash -c is blocked");
for (const c of ["git -C . push origin feature/x", "bash -c 'git status'", "git push origin feature/main-menu", "git -C . status", "git push -u origin chore/x", "echo main"])
  check(rel(c) === 0, "allowed: " + c);
const protectedWrites = ["sed -i s/a/b/ .github/workflows/test.yml", "echo x >> .github/workflows/test.yml", "cp tmp/x .claude/settings.json", "node -e \"require('fs').writeFileSync('.claude/hooks/guard-release.js','')\"",
  "git checkout -- .claude/settings.json", "rm .env", "echo KEY=1 > .env", "tee .env.local < tmp/x", "mv tmp/x .claude/hooks/guard-files.js", "sed -i s/CACHE/x/ sw.js", "python -c \"open('.github/workflows/deploy.yml','w')\""];
for (const c of protectedWrites) check(fil(c) === 2, "blocked: " + c);
const reads = ["cat .github/workflows/test.yml", "grep -n uses .github/workflows/deploy.yml", "git diff .claude/settings.json", "git add .github/workflows/test.yml", "ls .claude/hooks", "cat .env.example", "git log -- .github/workflows", "sed -n 1,5p .claude/settings.json",
  "sed -i s/a/b/ js/ui.js", "npm test 2>&1 | tail -3", "git diff .github/workflows 2>&1", "node tests/hooks.test.js", "cp tmp/a tmp/b"];
for (const c of reads) check(fil(c) === 0, "allowed: " + c);
check(fil("sed -i s/a/b/ .github/workflows/test.yml", { ALLOW_PROTECTED_EDIT: "1" }) === 0, "ALLOW_PROTECTED_EDIT=1 still lets the owner allow a protected shell edit");
check(hook("guard-files.js", { file_path: "/repo/.github/workflows/test.yml", old_string: "a", new_string: "b" }).status === 2 && hook("guard-files.js", { file_path: "/repo/js/ui.js", old_string: "a", new_string: "b" }).status === 0, "the Edit and Write rules are unchanged");

// The test result is remembered for the exact working tree (commit, then push, runs the suite once)
const os = require("os"), fs = require("fs");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "guard-")), counter = path.join(dir, "count"), cacheFile = path.join(dir, "ok");
const script = path.join(dir, "count.js"); fs.writeFileSync(script, "require('fs').appendFileSync(process.argv[2], 'x'); process.exit(+process.argv[3]);");
const counted = ok => `node "${script}" "${counter}" ${ok ? 0 : 1}`;
const gate = ok => hook("guard-release.js", { command: "git commit -m x" }, { GUARD_SKIP_TESTS: "", GUARD_TEST_CMD: counted(ok), GUARD_CACHE_FILE: cacheFile }).status;
const runs = () => (fs.existsSync(counter) ? fs.readFileSync(counter, "utf8").length : 0);
check(gate(false) === 2 && runs() === 1 && !fs.existsSync(cacheFile), "a failing suite blocks the commit and is not remembered");
check(gate(true) === 0 && runs() === 2 && fs.existsSync(cacheFile), "a passing suite allows the commit and is remembered");
check(gate(false) === 0 && runs() === 2, "the same working tree does not run the suite again (even a push after the commit)");
const dummy = path.join(root, "zz-guard-dummy.txt");
try { fs.writeFileSync(dummy, "x"); check(gate(true) === 0 && runs() === 3, "a changed working tree runs the suite again"); } finally { fs.rmSync(dummy, { force: true }); fs.rmSync(dir, { recursive: true, force: true }); }

failures.forEach(f => console.log("FAIL:", f));
console.log(failures.length ? failures.length + " failure(s)." : "Hooks test OK.");
process.exit(failures.length ? 1 : 0);
