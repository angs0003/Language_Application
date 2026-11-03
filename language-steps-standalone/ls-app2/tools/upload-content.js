/* Uploads content/content.js to the Supabase "content" table.
   Needs a .env file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example).
   Run: npm run upload   (after npm test passes) */
const fs = require("fs"), path = require("path");
const loadContent = require("./load-content");
const { buildRows } = require("../js/content-rows");
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) fs.readFileSync(envPath, "utf8").split(/\r?\n/).forEach(l => { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; });
const URL_ = (process.env.SUPABASE_URL || "").replace(/\/$/, ""), KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!URL_ || !KEY) { console.log("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Create .env from .env.example."); process.exit(1); }
const H = { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" };
(async () => {
  const version = new Date().toISOString();
  const rows = buildRows(loadContent(), version).map(r => ({ ...r, updated_at: version }));
  for (let i = 0; i < rows.length; i += 100) {
    const res = await fetch(`${URL_}/rest/v1/content`, { method: "POST", headers: { ...H, Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows.slice(i, i + 100)) });
    if (!res.ok) { console.log("Upload failed:", res.status, await res.text()); process.exit(1); }
  }
  const res = await fetch(`${URL_}/rest/v1/content?select=key`, { headers: H });
  const existing = (await res.json()).map(r => r.key), keep = new Set(rows.map(r => r.key));
  const old = existing.filter(k => !keep.has(k));
  for (const k of old) await fetch(`${URL_}/rest/v1/content?key=eq.${encodeURIComponent(k)}`, { method: "DELETE", headers: H });
  console.log(`Uploaded ${rows.length} rows (version ${version}). Removed ${old.length} old rows.`);
})().catch(e => { console.log("Upload failed:", e.message); process.exit(1); });
