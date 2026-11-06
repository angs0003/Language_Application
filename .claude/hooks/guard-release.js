/* Hook: before a git commit, git push or content upload, run the full test suite.
   Exit code 2 blocks the command and tells Claude why. */
const { execSync } = require("child_process");
let input = "";
process.stdin.on("data", d => (input += d));
process.stdin.on("end", () => {
  let cmd = "";
  try { cmd = JSON.parse(input).tool_input.command || ""; } catch (e) {}
  if (!/\bgit\s+(commit|push)\b|\bnpm\s+run\s+upload\b|upload-content\.js/.test(cmd)) process.exit(0);
  try {
    execSync("npm test", { stdio: "pipe", encoding: "utf8" });
    process.exit(0);
  } catch (e) {
    process.stderr.write("Blocked: npm test must pass before committing, pushing or uploading.\n" + (e.stdout || "").slice(-3000) + "\nFix the failures, run npm test, then try again.");
    process.exit(2);
  }
});
