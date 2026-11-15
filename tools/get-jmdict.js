/* Downloads the newest JMdict (English, jmdict-simplified JSON) to tmp/dict/ for tools/check-dictionary.js. Run: npm run dict:get
   Replaces the old script that needed the GitHub CLI (gh), which is not installed on every computer. It asks the GitHub API for the newest release of
   scriptin/jmdict-simplified, downloads the file jmdict-eng-<version>.json.zip and unpacks it with unzip, or with tar (Windows 10 and later can unpack zip files with tar).
   Source: https://github.com/scriptin/jmdict-simplified (JMdict by the EDRDG, CC BY-SA 4.0). It uses the GitHub credential that git has, if there is one, for a higher rate limit; it never prints it. */
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const dir = path.join(__dirname, "..", "tmp", "dict");
let token = "";
try { token = (execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }).match(/^password=(.*)$/m) || [])[1] || ""; } catch (e) { /* no credential: anonymous requests still work */ }
const headers = Object.assign({ Accept: "application/vnd.github+json", "User-Agent": "language-steps-dict" }, token ? { Authorization: "Bearer " + token } : {});
(async () => {
  const rel = await (await fetch("https://api.github.com/repos/scriptin/jmdict-simplified/releases/latest", { headers })).json();
  const asset = (rel.assets || []).find(a => /^jmdict-eng-\d[\w.+-]*\.json\.zip$/.test(a.name));
  if (!asset) throw new Error("no jmdict-eng-<version>.json.zip in the newest release (" + (rel.tag_name || rel.message || "unknown") + ")");
  fs.mkdirSync(dir, { recursive: true });
  const zip = path.join(dir, asset.name);
  console.log("downloading " + asset.name + " (" + Math.round(asset.size / 1048576) + " MB)");
  const r = await fetch(asset.browser_download_url, { headers: { "User-Agent": "language-steps-dict" } });
  if (!r.ok) throw new Error("download failed: " + r.status);
  fs.writeFileSync(zip, Buffer.from(await r.arrayBuffer()));
  try { execFileSync("unzip", ["-o", "-q", zip, "-d", dir], { stdio: "ignore" }); }
  catch (e) { execFileSync("tar", ["-xf", zip, "-C", dir], { stdio: "inherit" }); }
  const out = fs.readdirSync(dir).filter(f => /^jmdict-eng-\d.*\.json$/.test(f)).sort().pop();
  if (!out) throw new Error("the zip file did not contain jmdict-eng-<version>.json");
  console.log("ready: tmp/dict/" + out);
})().catch(e => { console.log("ERROR:", e.message); process.exit(1); });
