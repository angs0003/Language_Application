/* Hook: after any edit to content/content.js, run the content validator.
   Exit code 2 sends the error text back to Claude so it fixes the content before continuing. */
const { execSync } = require("child_process");
let input = "";
process.stdin.on("data", d => (input += d));
process.stdin.on("end", () => {
  let file = "";
  try { file = JSON.parse(input).tool_input.file_path || ""; } catch (e) {}
  if (!/content[\\/]content\.js$/.test(file)) process.exit(0);
  try {
    execSync("node tools/validate-content.js", { stdio: "pipe", encoding: "utf8" });
    process.exit(0);
  } catch (e) {
    process.stderr.write("Content check failed after editing content/content.js:\n" + (e.stdout || "") + (e.stderr || "") + "\nFix the content before doing anything else.");
    process.exit(2);
  }
});
