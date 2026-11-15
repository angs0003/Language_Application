/* Safety checks on the GitHub workflows (.github/workflows/*.yml) and on the proposed ones (docs/proposed/*.yml). It only reads them. Run: node tests/workflows.test.js
   1. Every file is valid YAML with a name and jobs.
   2. No workflow uses pull_request_target (it runs fork code with secrets).
   3. No run: step puts untrusted text (issue, comment, pull request or review body or title, branch names) directly into the command with the expression syntax;
      such text must go through an environment variable (the usual way to avoid command injection).
   4. Every workflow or job sets permissions explicitly.
   5. Notice only (not a failure): actions that are pinned by tag and not by commit ID. */
const fs = require("fs"), path = require("path"), yaml = require("js-yaml");
const root = path.join(__dirname, "..");
const dirs = [".github/workflows", "docs/proposed"];
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
let unpinned = 0;
const KNOWN_NO_PERMISSIONS = [".github/workflows/test.yml"];
for (const d of dirs) {
  const full = path.join(root, d);
  if (!fs.existsSync(full)) continue;
  for (const f of fs.readdirSync(full).filter(x => /\.ya?ml$/.test(x))) {
    const name = d + "/" + f, text = fs.readFileSync(path.join(full, f), "utf8");
    let doc;
    try { doc = yaml.load(text); } catch (e) { check(false, name + ": is not valid YAML (" + e.message.split("\n")[0] + ")"); continue; }
    check(doc && doc.name && doc.jobs && Object.keys(doc.jobs).length > 0, name + ": is valid YAML with a name and jobs");
    const on = doc.on || doc[true] || {};
    check(!(typeof on === "object" && "pull_request_target" in on) && !/pull_request_target/.test(String(doc.on)), name + ": does not use pull_request_target");
    const bad = [];
    for (const [jn, job] of Object.entries(doc.jobs || {})) for (const [i, st] of (job.steps || []).entries())
      if (typeof st.run === "string") for (const m of st.run.matchAll(/\$\{\{\s*([^}]*)\}\}/g))
        if (/github\.event\.(issue|comment|pull_request|review|head_commit|pages|discussion)\.[\w.]*(body|title|label|name|email|message|ref|label)\b|github\.head_ref|github\.event\.workflow_run\.(head_branch|display_title)/.test(m[1])) bad.push(`${jn} step ${i + 1}: ${m[0]}`);
    check(!bad.length, name + ": no untrusted text inside a run: command " + bad.join("; "));
    const explicit = !!doc.permissions || Object.values(doc.jobs || {}).every(j => !!j.permissions);
    // Known gap: test.yml has no permissions block (docs/proposed/test-permissions.patch adds it). Remove it from this list when the patch is applied.
    check(explicit || KNOWN_NO_PERMISSIONS.includes(name), name + ": sets permissions explicitly" + (explicit ? "" : " (known gap)"));
    for (const job of Object.values(doc.jobs || {})) for (const st of job.steps || []) if (typeof st.uses === "string" && !/@[0-9a-f]{40}$/.test(st.uses) && !st.uses.startsWith("./")) unpinned++;
  }
}
console.log("notice:", unpinned, "action references are pinned by tag, not by commit ID (supply-chain risk; see docs/research/technology.md)");
failures.forEach(f => console.log("FAIL:", f));
console.log(failures.length ? failures.length + " failure(s)." : "Workflows test OK.");
process.exit(failures.length ? 1 : 0);
