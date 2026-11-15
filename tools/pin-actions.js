/* Pins every GitHub Action in the workflow files by commit ID (supply-chain protection: a tag such as v4 can be moved to other code, a commit ID cannot).
   It rewrites  uses: owner/name@v4  to  uses: owner/name@<40-character commit ID> # v4  in .github/workflows/*.yml.
   Usage:  node tools/pin-actions.js            show what would change (changes nothing)
           node tools/pin-actions.js --write    rewrite the files
   The workflow files are protected files: run --write in your own terminal, or start Claude Code with ALLOW_PROTECTED_EDIT=1 (CLAUDE.md section 9).
   It needs network access and uses the GitHub credential that git has (git credential fill), which it never prints. Run it again to move the pins when a newer release is wanted. */
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const dir = path.join(__dirname, "..", ".github", "workflows");
const write = process.argv.includes("--write");
let token = "";
try { token = (execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8" }).match(/^password=(.*)$/m) || [])[1] || ""; } catch (e) { /* anonymous requests still work, with a lower rate limit */ }
const api = async p => { const r = await fetch("https://api.github.com/repos/" + p, { headers: Object.assign({ Accept: "application/vnd.github+json" }, token ? { Authorization: "Bearer " + token } : {}) }); if (!r.ok) throw new Error(p + ": " + r.status); return r.json(); };
const cache = {};
async function commitOf(repo, tag) {
  const key = repo + "@" + tag; if (cache[key]) return cache[key];
  let ref = await api(`${repo}/git/ref/tags/${tag}`), obj = ref.object;
  while (obj.type === "tag") obj = (await api(`${repo}/git/tags/${obj.sha}`)).object; // an annotated tag points to a tag object first
  return (cache[key] = obj.sha);
}
(async () => {
  let changed = 0;
  for (const f of fs.readdirSync(dir).filter(x => /\.ya?ml$/.test(x))) {
    const file = path.join(dir, f), crlf = fs.readFileSync(file, "utf8").includes("\r\n");
    const lines = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^(\s*-?\s*uses:\s*)([\w.-]+\/[\w./-]+)@([^\s#]+)\s*(#.*)?$/);
      if (!m || /^[0-9a-f]{40}$/.test(m[3])) continue;
      const sha = await commitOf(m[2].split("/").slice(0, 2).join("/"), m[3]);
      console.log(`${f}: ${m[2]}@${m[3]}  ->  ${sha}`);
      lines[i] = `${m[1]}${m[2]}@${sha} # ${m[3]}`; changed++;
    }
    if (write) fs.writeFileSync(file, lines.join(crlf ? "\r\n" : "\n").replace(/\n/g, crlf ? "\r\n" : "\n").replace(/\r\r\n/g, "\r\n"));
  }
  console.log(changed + " action reference(s) " + (write ? "pinned." : "would be pinned. Run with --write to change the files."));
})().catch(e => { console.log("ERROR:", e.message); process.exit(1); });
