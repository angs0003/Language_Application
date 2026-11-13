/* Tests for the safety-rail hooks in .claude/hooks (guard-release.js, guard-files.js). Run: node tests/hooks.test.js
   Each hook gets the same JSON on stdin as Claude Code sends; exit code 2 means "blocked". */
const { spawnSync } = require("child_process");
const path = require("path");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
const run = (hook, tool_input, env) => spawnSync("node", [path.join(__dirname, "..", ".claude", "hooks", hook)], { input: JSON.stringify({ tool_input }), env: Object.assign({}, process.env, { GUARD_SKIP_TESTS: "1", ALLOW_PROTECTED_EDIT: "", GUARD_BRANCH: "feature/x" }, env || {}), encoding: "utf8" });
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
check(spawnSync("node", [path.join(__dirname, "..", ".claude", "hooks", "guard-files.js")], { input: "not json", encoding: "utf8" }).status === 0, "unreadable input does not block");

failures.forEach(f => console.log("FAIL:", f));
console.log(failures.length ? failures.length + " failure(s)." : "Hooks test OK.");
process.exit(failures.length ? 1 : 0);
