/* Runs the whole automatic test suite (npm test): the content validator, the smoke test, then every tests/*.test.js file in alphabetical order.
   A new test file is picked up by its name (tests/<feature>.test.js); nobody has to edit package.json, so parallel features do not conflict there.
   It stops at the first failing file and exits with its code. Run one file alone with: node tests/<name>.test.js */
const { spawnSync } = require("child_process"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const steps = [["tools/validate-content.js"], ["tests/smoke.js"], ...fs.readdirSync(__dirname).filter(f => f.endsWith(".test.js")).sort().map(f => ["tests/" + f])];
for (const [file] of steps) {
  console.log("\n=== " + file);
  const r = spawnSync(process.execPath, [file], { cwd: root, stdio: "inherit" });
  if (r.status !== 0) { console.log("\nFAILED: " + file + " (exit " + r.status + ")"); process.exit(r.status || 1); }
}
console.log("\nAll " + steps.length + " test files passed.");
