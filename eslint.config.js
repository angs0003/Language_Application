/* ESLint: catches real mistakes (unused variables, unreachable code) without fighting the app's style.
   The app files share one global scope, so undefined-name checks are off. */
module.exports = [
  { ignores: ["node_modules/**", "_old/**"] },
  {
    files: ["js/**/*.js", "tools/**/*.js", "tests/**/*.js", ".claude/hooks/**/*.js", "sw.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "script" },
    rules: {
      "no-unused-vars": ["warn", { args: "none", varsIgnorePattern: "^_" }],
      "no-unreachable": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-constant-condition": ["error", { checkLoops: false }],
      "eqeqeq": ["warn", "smart"]
    }
  }
];
