/* Hook (before every Bash command): safety rails for git and uploads.   PROPOSED hardened version (see docs/proposed/README.md).
   1. Never push to main or master (CLAUDE.md sections 8 and 12): any push whose target is main or master, a push with no target while the current branch is main or master,
      and --all or --mirror (they push every branch, including main). Found also behind git options (git -C dir push, git -c x=y push), inside bash -c "...", sh -c, eval and $(...).
   2. Never force-push.
   3. Never commit on main or master: create a branch first.
   4. Never upload content from here (the npm upload script, tools/upload-content.js): the Deploy workflow does it after the merge.
   5. Before a git commit or git push: the full test suite must pass. The result is remembered for the exact contents of the working tree (tracked and untracked files,
      ignored files left out), so commit then push of the same files runs the suite once.
   Exit code 2 blocks the command and tells Claude why.
   Environment, used by tests/hooks.test.js only: GUARD_SKIP_TESTS=1 skips rule 5, GUARD_BRANCH fakes the current branch, GUARD_TEST_CMD replaces "npm test", GUARD_CACHE_FILE sets the result file. */
const { execSync } = require("child_process");
const fs = require("fs"), path = require("path"), crypto = require("crypto");
let input = "";
process.stdin.on("data", d => (input += d));
process.stdin.on("end", () => {
  let cmd = "";
  try { cmd = JSON.parse(input).tool_input.command || ""; } catch (e) {}
  const block = msg => { process.stderr.write("Blocked: " + msg + "\n"); process.exit(2); };
  const git = a => execSync("git " + a, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 1 << 28 });
  const branch = () => { if (process.env.GUARD_BRANCH !== undefined) return process.env.GUARD_BRANCH; try { return git("branch --show-current").trim(); } catch (e) { return ""; } };
  const protectedBranch = b => b === "main" || b === "master";

  if (/\bnpm\s+run\s+upload\b|upload-content\.js/.test(cmd)) block("never upload content from here. The Deploy workflow uploads it after the owner merges the pull request (CLAUDE.md section 8).");

  // Quotes, backticks and brackets around a command (bash -c "git push origin main", $(git push origin main)) are replaced by spaces so that the words can be read.
  const flat = cmd.replace(/['"`()]/g, " ").replace(/\$\{?/g, " ");
  const parts = flat.split(/&&|\|\||;|\||\n/).map(s => s.trim());
  // git, then any options (-C dir, -c key=value, --git-dir=x, -p ...), then the subcommand
  const GIT = sub => new RegExp("\\bgit\\s+(?:(?:-[cC]\\s+\\S+|--[\\w-]+(?:=\\S+)?|-\\S+)\\s+)*" + sub + "\\b(.*)$");
  for (const p of parts) {
    const push = p.match(GIT("push"));
    if (push) {
      const args = push[1].trim().split(/\s+/).filter(Boolean);
      if (args.some(a => a === "-f" || a === "--force" || /^--force-with-lease/.test(a) || /^\+/.test(a))) block("never force-push.");
      if (args.includes("--all") || args.includes("--mirror")) block("never push --all or --mirror: they push main as well. Push one branch by name.");
      const refs = args.filter(a => !a.startsWith("-"));
      const dests = refs.slice(1).map(a => a.replace(/^.*:/, "").replace(/^refs\/heads\//, "").replace(/^\+/, ""));
      if (dests.some(protectedBranch)) block("never push to main or master. Push a branch and open a pull request (CLAUDE.md section 8).");
      if (refs.length <= 1 && !args.includes("--delete") && !args.includes("-d") && protectedBranch(branch())) block("you are on " + branch() + ". Create a branch (git checkout -b ...) and push that branch, then open a pull request.");
    }
    if (GIT("commit").test(p) && protectedBranch(branch())) block("never commit on " + branch() + ". Create a branch first (git checkout -b chore/...).");
  }

  if (!/\bgit\s+(?:(?:-[cC]\s+\S+|--[\w-]+(?:=\S+)?|-\S+)\s+)*(commit|push)\b/.test(flat) || process.env.GUARD_SKIP_TESTS === "1") process.exit(0);

  // Remember a passing run for the exact contents of the working tree.
  let key = "";
  try {
    const files = git("ls-files -z --cached --others --exclude-standard").split("\0").filter(f => f && fs.existsSync(f));
    const h = crypto.createHash("sha1");
    for (const f of files.sort()) { h.update(f + "\0"); try { h.update(fs.readFileSync(f)); } catch (e) {} h.update("\0"); }
    key = h.digest("hex");
  } catch (e) {}
  const cacheFile = process.env.GUARD_CACHE_FILE || path.join("tmp", ".guard-tests-ok");
  try { if (key && fs.readFileSync(cacheFile, "utf8").trim() === key) process.exit(0); } catch (e) {}
  try {
    execSync(process.env.GUARD_TEST_CMD || "npm test", { stdio: "pipe", encoding: "utf8" });
    if (key) { try { fs.mkdirSync(path.dirname(cacheFile), { recursive: true }); fs.writeFileSync(cacheFile, key); } catch (e) {} }
    process.exit(0);
  } catch (e) {
    process.stderr.write("Blocked: npm test must pass before committing or pushing.\n" + (e.stdout || "").slice(-3000) + "\nFix the failures, run npm test, then try again.");
    process.exit(2);
  }
});
