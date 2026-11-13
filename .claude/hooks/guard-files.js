/* Hook (before Edit, Write and MultiEdit): protected files.
   Some files change only when the owner asks for that file by name (CLAUDE.md section 12, rule 4), and secrets must never be written by an agent:
     .env and .env.* (not .env.example)   secrets (the service role key)
     .github/workflows/*                  what runs in GitHub with the owner's secrets
     .claude/settings.json, settings.local.json, .claude/hooks/guard-*.js   the safety rails themselves
     sw.js: any edit that touches CACHE   the Deploy workflow sets CACHE on every release
   Exit code 2 blocks the edit and tells Claude why. The owner can allow an edit for one session by setting the environment variable ALLOW_PROTECTED_EDIT=1. */
let input = "";
process.stdin.on("data", d => (input += d));
process.stdin.on("end", () => {
  if (process.env.ALLOW_PROTECTED_EDIT === "1") process.exit(0);
  let ti = {};
  try { ti = JSON.parse(input).tool_input || {}; } catch (e) { process.exit(0); }
  const file = String(ti.file_path || "").replace(/\\/g, "/");
  const edits = [ti.old_string, ti.new_string, ti.content, ...(Array.isArray(ti.edits) ? ti.edits.flatMap(e => [e.old_string, e.new_string]) : [])].filter(x => typeof x === "string");
  const why = (() => {
    if (/(^|\/)\.env(\.(?!example$)[^/]*)?$/.test(file)) return "this file holds secrets";
    if (/(^|\/)\.github\/workflows\//.test(file)) return "workflows run in GitHub with the owner's secrets";
    if (/(^|\/)\.claude\/(settings(\.local)?\.json|hooks\/guard-[^/]*)$/.test(file)) return "these are the safety rails";
    if (/(^|\/)sw\.js$/.test(file) && (ti.content !== undefined || edits.some(e => /CACHE/.test(e)))) return "the Deploy workflow sets CACHE on every release";
    return "";
  })();
  if (!why) process.exit(0);
  process.stderr.write(`Blocked: ${file} is a protected file (${why}). Change it only when the owner asks for this file by name (CLAUDE.md section 12). If the owner asked, tell them to set ALLOW_PROTECTED_EDIT=1 for this session, or make the change themselves.\n`);
  process.exit(2);
});
