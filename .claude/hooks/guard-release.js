/* Hook (before every Bash command): safety rails for git and uploads.
   1. Never push to main or master (CLAUDE.md sections 8 and 12): any push whose target is main or master, and a push with no target while the current branch is main or master.
   2. Never force-push.
   3. Never commit on main or master: create a branch first.
   4. Never upload content from here (npm run upload, upload-content.js): the Deploy workflow does it after the merge.
   5. Before a git commit or git push: the full test suite must pass.
   Exit code 2 blocks the command and tells Claude why. Set GUARD_SKIP_TESTS=1 to skip rule 5 and GUARD_BRANCH to fake the current branch (both used by tests/hooks.test.js only). */
const { execSync } = require("child_process");
let input = "";
process.stdin.on("data", d => (input += d));
process.stdin.on("end", () => {
  let cmd = "";
  try { cmd = JSON.parse(input).tool_input.command || ""; } catch (e) {}
  const block = msg => { process.stderr.write("Blocked: " + msg + "\n"); process.exit(2); };
  const branch = () => { if (process.env.GUARD_BRANCH !== undefined) return process.env.GUARD_BRANCH; try { return execSync("git branch --show-current", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch (e) { return ""; } };
  const protectedBranch = b => b === "main" || b === "master";

  if (/\bnpm\s+run\s+upload\b|upload-content\.js/.test(cmd)) block("never upload content from here. The Deploy workflow uploads it after the owner merges the pull request (CLAUDE.md section 8).");

  // each git command in the line (split on && ; | and newlines)
  const parts = cmd.split(/&&|\|\||;|\||\n/).map(s => s.trim());
  for (const p of parts) {
    const push = p.match(/\bgit\s+(?:-\S+\s+)*push\b(.*)$/);
    if (push) {
      const args = push[1].trim().split(/\s+/).filter(Boolean);
      if (args.some(a => a === "-f" || a === "--force" || /^--force-with-lease/.test(a))) block("never force-push.");
      const refs = args.filter(a => !a.startsWith("-"));
      const dests = refs.slice(1).map(a => a.replace(/^.*:/, "").replace(/^refs\/heads\//, "").replace(/^\+/, ""));
      if (dests.some(protectedBranch)) block("never push to main or master. Push a branch and open a pull request (CLAUDE.md section 8).");
      if (refs.length <= 1 && !args.includes("--delete") && !args.includes("-d") && protectedBranch(branch())) block("you are on " + branch() + ". Create a branch (git checkout -b ...) and push that branch, then open a pull request.");
    }
    if (/\bgit\s+(?:-\S+\s+)*commit\b/.test(p) && protectedBranch(branch())) block("never commit on " + branch() + ". Create a branch first (git checkout -b chore/...).");
  }

  if (!/\bgit\s+(commit|push)\b/.test(cmd) || process.env.GUARD_SKIP_TESTS === "1") process.exit(0);
  try {
    execSync("npm test", { stdio: "pipe", encoding: "utf8" });
    process.exit(0);
  } catch (e) {
    process.stderr.write("Blocked: npm test must pass before committing or pushing.\n" + (e.stdout || "").slice(-3000) + "\nFix the failures, run npm test, then try again.");
    process.exit(2);
  }
});
