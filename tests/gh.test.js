/* Tests for tools/gh.js (the release helper) against a fake GitHub: no network, no real git. Run: node tests/gh.test.js */
const gh = require("../tools/gh.js");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };

/* A fake API: responds to the calls gh.js makes, from a mutable scenario, and records them. */
function fakeApi(sc) {
  const calls = [];
  const api = {
    calls,
    async call(method, path, body) {
      calls.push(method + " " + path.replace(/\?.*/, ""));
      if (method === "GET" && /^\/pulls\/\d+$/.test(path)) return { title: sc.title || "Test PR", state: sc.state || "open", merged: !!sc.merged, draft: sc.draft !== false, mergeable_state: sc.mergeable || "clean", node_id: "NODE", head: { sha: "abc1234", ref: sc.branch || "feature/x", repo: { owner: { login: "owner" } } }, base: { ref: sc.base || "main" } };
      if (method === "GET" && /check-runs$/.test(path)) return { check_runs: (sc.checks || [{ status: "completed", conclusion: "success" }, { status: "completed", conclusion: "success" }]).map(c => Object.assign({ name: "test" }, c)).concat([{ name: "review", status: "completed", conclusion: "skipped" }]) };
      if (method === "PUT" && /\/merge$/.test(path)) { sc.putBody = body; return sc.mergeFails ? { merged: false, message: "not mergeable" } : { merged: true, sha: "deadbeef00" }; }
      if (method === "GET" && /actions\/runs/.test(path)) return { workflow_runs: [{ name: "Deploy", status: "completed", conclusion: sc.deploy || "success" }] };
      throw new Error("unexpected call " + method + " " + path);
    },
    async graphql(q) { calls.push("GRAPHQL " + (/markPullRequestReadyForReview/.test(q) ? "ready" : "other")); return {}; }
  };
  return api;
}
const mkIo = () => { const git = []; return { git: a => { git.push(a.join(" ")); return ""; }, sleep: async () => {}, log: () => {}, gitCalls: git }; };
const fast = { pollMs: 1, tries: 3 };
const rejects = async (p, re) => { try { await p; return false; } catch (e) { return re.test(e.message); } };

(async () => {
  check(JSON.stringify(gh.parseRemote("https://github.com/angs0003/Language_Application.git")) === '{"owner":"angs0003","repo":"Language_Application"}', "an https remote is parsed");
  check(gh.parseRemote("git@github.com:angs0003/Language_Application.git").repo === "Language_Application", "an ssh remote is parsed");
  check(await rejects((async () => gh.parseRemote("https://example.com/x/y"))(), /not a GitHub/), "a remote that is not GitHub is rejected");

  // status
  let s = await gh.statusPr(fakeApi({}), 5);
  check(s.green && s.draft && s.branch === "feature/x" && s.checks.length === 2, "status reads the pull request and only the 'test' checks");
  s = await gh.statusPr(fakeApi({ checks: [{ status: "completed", conclusion: "failure" }] }), 5);
  check(!s.green, "a failed check is not green");
  s = await gh.statusPr(fakeApi({ checks: [{ status: "in_progress", conclusion: null }] }), 5);
  check(!s.green && /in_progress/.test(gh.fmt(s)), "a running check is not green and is shown");

  // merge: refusals
  let api = fakeApi({}), io = mkIo();
  check(await rejects(gh.mergePr(api, 5, {}, io), /needs --yes/) && !api.calls.some(c => c.startsWith("PUT")), "merge without --yes is refused and nothing is merged");
  api = fakeApi({ checks: [{ status: "completed", conclusion: "failure" }] }); io = mkIo();
  check(await rejects(gh.mergePr(api, 5, Object.assign({ yes: true }, fast), io), /not green/) && !api.calls.some(c => c.startsWith("PUT")) && !io.gitCalls.length, "merge with a failed check is refused");
  api = fakeApi({ checks: [{ status: "in_progress", conclusion: null }] }); io = mkIo();
  check(await rejects(gh.mergePr(api, 5, Object.assign({ yes: true }, fast), io), /not green/) && !api.calls.some(c => c.startsWith("PUT")), "merge while the checks still run times out and is refused");
  api = fakeApi({ mergeable: "dirty" }); io = mkIo();
  check(await rejects(gh.mergePr(api, 5, Object.assign({ yes: true }, fast), io), /merge conflict/) && !api.calls.some(c => c.startsWith("PUT")), "merge with a conflict is refused");
  api = fakeApi({ state: "closed" }); io = mkIo();
  check(await rejects(gh.mergePr(api, 5, Object.assign({ yes: true }, fast), io), /not open/), "a closed pull request is refused");
  api = fakeApi({ base: "develop" }); io = mkIo();
  check(await rejects(gh.mergePr(api, 5, Object.assign({ yes: true }, fast), io), /not main/), "a pull request that does not target main is refused");
  api = fakeApi({ mergeFails: true }); io = mkIo();
  check(await rejects(gh.mergePr(api, 5, Object.assign({ yes: true }, fast), io), /did not merge/) && !io.gitCalls.length, "when GitHub refuses to merge, nothing is deleted");

  // merge: success path and its order
  const sc = {}; api = fakeApi(sc); io = mkIo();
  const r = await gh.mergePr(api, 5, Object.assign({ yes: true }, fast), io);
  const order = api.calls.filter(c => /^(GRAPHQL|PUT)/.test(c));
  check(r.sha === "deadbeef00" && r.deploy === "success" && order[0] === "GRAPHQL ready" && order[1].startsWith("PUT"), "a draft is marked ready and then merged");
  check(sc.putBody.merge_method === "merge" && sc.putBody.commit_title === "Merge pull request #5 from owner/feature/x", "the merge uses a merge commit whose title names the pull request");
  check(JSON.stringify(io.gitCalls) === JSON.stringify(["checkout main", "pull -q origin main", "branch -d feature/x", "push origin --delete feature/x"]), "after the merge the branch is deleted and main is updated, in this order");
  api = fakeApi({ draft: false }); io = mkIo(); await gh.mergePr(api, 5, Object.assign({ yes: true }, fast), io);
  check(!api.calls.some(c => c === "GRAPHQL ready"), "a pull request that is already ready is not marked again");
  api = fakeApi({ deploy: "failure" }); io = mkIo();
  check((await gh.mergePr(api, 5, Object.assign({ yes: true }, fast), io)).deploy === "failure", "a failed Deploy is reported");

  // cleanup never touches main
  check(await rejects((async () => gh.cleanup("main", mkIo()))(), /refusing/) && await rejects((async () => gh.cleanup("master", mkIo()))(), /refusing/), "cleanup refuses to delete main or master");

  failures.forEach(f => console.log("FAIL:", f));
  console.log(failures.length ? failures.length + " failure(s)." : "gh helper test OK.");
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.log("FAIL:", e.stack); process.exit(1); });
