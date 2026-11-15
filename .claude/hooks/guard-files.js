/* Hook (before Edit, Write, MultiEdit and Bash): protected files.
   Some files change only when the owner asks for that file by name (CLAUDE.md section 12, rule 4), and secrets must never be written by an agent:
     .env and .env.* (not .env.example)   secrets (the service role key)
     .github/workflows/*                  what runs in GitHub with the owner's secrets
     .claude/settings.json, settings.local.json, .claude/hooks/guard-*.js   the safety rails themselves
     sw.js: any edit that touches CACHE   the Deploy workflow sets CACHE on every release
   New: a Bash command that names one of these paths and could write (redirect, tee, sed -i, cp, mv, rm, a script with writeFile, git checkout or restore, and similar) is blocked as well.
   Reading (cat, grep, git diff, ls, git add, git commit) stays allowed.
   Exit code 2 blocks the command and tells Claude why. The owner can allow an edit for one session by setting the environment variable ALLOW_PROTECTED_EDIT=1 before starting Claude Code. */
let input = "";
process.stdin.on("data", d => (input += d));
process.stdin.on("end", () => {
  if (process.env.ALLOW_PROTECTED_EDIT === "1") process.exit(0);
  let ti = {};
  try { ti = JSON.parse(input).tool_input || {}; } catch (e) { process.exit(0); }
  const PATHS = [
    [/(^|[\s/\\'"=:])\.env(\.(?!example\b)[\w.-]*)?(?=$|[\s'";|&)<>])/, "this file holds secrets"],
    [/\.github[/\\]workflows[/\\]/, "workflows run in GitHub with the owner's secrets"],
    [/\.claude[/\\](settings(\.local)?\.json|hooks[/\\]guard-[\w.-]*)/, "these are the safety rails"]
  ];
  const WRITES = /(>|\btee\b|\bsed\s+(-\w*\s+)*-\w*i|\bperl\s+(-\w*\s+)*-\w*i|\b(cp|mv|rm|dd|install|truncate|ln|chmod)\b|\bgit\s+(?:-\S+\s+)*(checkout|restore|apply|am|stash|reset|rm|mv|clean)\b|writeFile|appendFile|createWriteStream|\bopen\s*\(|\bnode\s+-e\b|\bpython\d?\b|\bperl\b|\bpowershell\b|\bpwsh\b|Set-Content|Add-Content|Out-File|\bsponge\b)/;
  let why = "", file = "";
  if (typeof ti.command === "string") {
    const cmd = ti.command, writes = WRITES.test(cmd.replace(/\d*>&\d+/g, " ").replace(/\d*>\s*\/dev\/null/g, " ")); // 2>&1 and > /dev/null are not writes
    file = "the command";
    for (const [re, w] of PATHS) if (re.test(cmd) && writes) why = w;
    if (!why && /(^|[\s/\\'"])sw\.js\b/.test(cmd) && /CACHE/.test(cmd) && writes) why = "the Deploy workflow sets CACHE on every release";
  } else {
    file = String(ti.file_path || "").replace(/\\/g, "/");
    const edits = [ti.old_string, ti.new_string, ti.content, ...(Array.isArray(ti.edits) ? ti.edits.flatMap(e => [e.old_string, e.new_string]) : [])].filter(x => typeof x === "string");
    if (/(^|\/)\.env(\.(?!example$)[^/]*)?$/.test(file)) why = "this file holds secrets";
    else if (/(^|\/)\.github\/workflows\//.test(file)) why = "workflows run in GitHub with the owner's secrets";
    else if (/(^|\/)\.claude\/(settings(\.local)?\.json|hooks\/guard-[^/]*)$/.test(file)) why = "these are the safety rails";
    else if (/(^|\/)sw\.js$/.test(file) && (ti.content !== undefined || edits.some(e => /CACHE/.test(e)))) why = "the Deploy workflow sets CACHE on every release";
  }
  if (!why) process.exit(0);
  process.stderr.write(`Blocked: ${file} touches a protected file (${why}). Change it only when the owner asks for this file by name (CLAUDE.md section 12). If the owner asked, tell them to set ALLOW_PROTECTED_EDIT=1 for this session, or make the change themselves.\n`);
  process.exit(2);
});
