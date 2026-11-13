#!/usr/bin/env node
/* Release helper for pull requests (no gh CLI needed). It uses the GitHub credential that git already has (git credential fill) and never prints it.
   Usage:
     node tools/gh.js create --title "..." --body-file body.md [--head branch]   open a DRAFT pull request to main
     node tools/gh.js status 31                                                    state, mergeability and checks of a pull request
     node tools/gh.js merge 31 --yes                                               wait for green CI, mark ready, merge, wait for Deploy, delete the branch, sync main
     node tools/gh.js cleanup branch-name                                          delete a merged branch (local and remote) and sync main
   merge needs --yes: run it only after the owner said to merge. It refuses when the checks are not green, when there is a merge conflict,
   or when the pull request is not open. Nothing here pushes to main: the merge is done by GitHub on the pull request. */
const { execFileSync } = require("child_process");

function parseRemote(url) {
  const m = String(url).trim().match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (!m) throw new Error("origin is not a GitHub repository: " + url);
  return { owner: m[1], repo: m[2] };
}
function gitToken() {
  const out = execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8" });
  const t = (out.match(/^password=(.*)$/m) || [])[1];
  if (!t) throw new Error("no GitHub credential found (git credential fill gave no password)");
  return t.trim();
}
function createApi(token, repo, fetchImpl) {
  const f = fetchImpl || fetch;
  const call = async (method, path, body) => {
    const r = await f(path.startsWith("http") ? path : `https://api.github.com/repos/${repo.owner}/${repo.repo}${path}`, {
      method, headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const text = await r.text(); let j = {}; try { j = text ? JSON.parse(text) : {}; } catch (e) { j = { message: text }; }
    if (!r.ok) { const err = new Error(`${method} ${path}: ${r.status} ${j.message || ""}`); err.status = r.status; throw err; }
    return j;
  };
  return { call, graphql: query => call("POST", "https://api.github.com/graphql", { query }) };
}

async function checksOf(api, sha) {
  const j = await api.call("GET", `/commits/${sha}/check-runs`);
  return (j.check_runs || []).filter(r => r.name === "test").map(r => ({ status: r.status, conclusion: r.conclusion }));
}
async function statusPr(api, n) {
  const pr = await api.call("GET", `/pulls/${n}`);
  const checks = await checksOf(api, pr.head.sha);
  return { number: n, title: pr.title, state: pr.state, merged: !!pr.merged, draft: !!pr.draft, branch: pr.head.ref, base: pr.base.ref, sha: pr.head.sha,
    mergeable: pr.mergeable_state, checks, green: checks.length > 0 && checks.every(c => c.status === "completed" && c.conclusion === "success") };
}
const fmt = s => `#${s.number} ${s.title}\n  state: ${s.merged ? "merged" : s.state}${s.draft ? " (draft)" : ""}, branch ${s.branch} -> ${s.base}\n  mergeable: ${s.mergeable}\n  test checks: ${s.checks.length ? s.checks.map(c => c.status + " " + (c.conclusion || "")).join(" | ") : "none yet"}${s.green ? "  (green)" : ""}`;

/* io = { sleep(ms), git(args) -> string, log(text) }; injectable for tests */
async function mergePr(api, n, opts, io) {
  const o = Object.assign({ yes: false, pollMs: 30000, tries: 20 }, opts), log = io.log || (() => {});
  if (!o.yes) throw new Error("merge needs --yes. Run it only after the owner said to merge pull request #" + n + ".");
  let s = await statusPr(api, n);
  if (s.merged || s.state !== "open") throw new Error(`#${n} is not open (${s.merged ? "already merged" : s.state}).`);
  if (s.base !== "main") throw new Error(`#${n} targets ${s.base}, not main.`);
  for (let i = 0; (!s.checks.length || s.checks.some(c => c.status !== "completed")) && i < o.tries; i++) { log("waiting for the checks..."); await io.sleep(o.pollMs); s = await statusPr(api, n); }
  if (!s.green) throw new Error(`#${n}: the checks are not green (${s.checks.map(c => c.status + " " + c.conclusion).join(" | ") || "none"}). Not merging.`);
  for (let i = 0; s.mergeable === "unknown" && i < 6; i++) { await io.sleep(Math.min(o.pollMs, 5000)); s = await statusPr(api, n); }
  if (s.mergeable === "dirty") throw new Error(`#${n} has a merge conflict with main. Merge main into the branch, resolve it, run the tests, push, and try again.`);
  log(`checks green, mergeable: ${s.mergeable}`);
  const pr = await api.call("GET", `/pulls/${n}`);
  if (pr.draft) { await api.graphql(`mutation{markPullRequestReadyForReview(input:{pullRequestId:"${pr.node_id}"}){pullRequest{isDraft}}}`); await io.sleep(Math.min(o.pollMs, 5000)); log("marked ready for review"); }
  const m = await api.call("PUT", `/pulls/${n}/merge`, { merge_method: "merge", commit_title: `Merge pull request #${n} from ${pr.head.repo ? pr.head.repo.owner.login : "origin"}/${pr.head.ref}` });
  if (!m.merged) throw new Error("GitHub did not merge: " + (m.message || ""));
  log("merged " + m.sha.slice(0, 7));
  let deploy = "not found";
  for (let i = 0; i < o.tries; i++) {
    const runs = (await api.call("GET", `/actions/runs?head_sha=${m.sha}`)).workflow_runs || [], d = runs.find(r => r.name === "Deploy");
    if (d && d.status === "completed") { deploy = d.conclusion; break; }
    await io.sleep(o.pollMs);
  }
  log("Deploy workflow: " + deploy);
  cleanup(pr.head.ref, io, log);
  return { sha: m.sha, deploy, branch: pr.head.ref };
}
function cleanup(branch, io, log) {
  if (!branch || branch === "main" || branch === "master") throw new Error("refusing to delete " + branch);
  io.git(["checkout", "main"]); io.git(["pull", "-q", "origin", "main"]);
  for (const a of [["branch", "-d", branch], ["push", "origin", "--delete", branch]]) { try { io.git(a); } catch (e) { (log || (() => {}))("could not run git " + a.join(" ") + ": " + String(e.message).split("\n")[0]); } }
  (log || (() => {}))(`deleted branch ${branch} (local and remote), main is up to date`);
}

async function main(argv) {
  const [cmd, ...rest] = argv, flag = k => { const i = rest.indexOf("--" + k); return i >= 0 ? rest[i + 1] : undefined; }, has = k => rest.includes("--" + k);
  const git = args => execFileSync("git", args, { encoding: "utf8" }), log = t => console.log(t);
  const repo = parseRemote(git(["remote", "get-url", "origin"]));
  const api = createApi(gitToken(), repo);
  const io = { sleep: ms => new Promise(r => setTimeout(r, ms)), git, log };
  if (cmd === "status") { const s = await statusPr(api, +rest[0]); console.log(fmt(s)); return s.green ? 0 : 1; }
  if (cmd === "merge") { const r = await mergePr(api, +rest[0], { yes: has("yes") }, io); console.log(`done: merged ${r.sha.slice(0, 7)}, Deploy ${r.deploy}`); return r.deploy === "success" ? 0 : 1; }
  if (cmd === "cleanup") { cleanup(rest[0], io, log); return 0; }
  if (cmd === "create") {
    const head = flag("head") || git(["branch", "--show-current"]).trim();
    if (!head || head === "main" || head === "master") throw new Error("open the pull request from a branch, not from " + (head || "a detached HEAD"));
    const fs = require("fs"), body = flag("body-file") ? fs.readFileSync(flag("body-file"), "utf8") : "";
    if (!flag("title")) throw new Error("--title is required");
    const pr = await api.call("POST", "/pulls", { title: flag("title"), head, base: "main", draft: !has("ready"), body });
    console.log(`#${pr.number} ${pr.html_url}`); return 0;
  }
  console.log(fs_usage());
  return cmd ? 1 : 0;
}
const fs_usage = () => require("fs").readFileSync(__filename, "utf8").split("*/")[0].replace(/^#!.*\n/, "").replace(/^\/\* ?/, "");
if (require.main === module) main(process.argv.slice(2)).then(c => process.exit(c), e => { console.error("Error: " + e.message); process.exit(1); });
module.exports = { parseRemote, createApi, statusPr, mergePr, cleanup, fmt };
