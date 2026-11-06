---
description: Monthly maintenance: dependency and tool versions, format drift, dead code, documentation drift
---
Monthly maintenance for Language Steps. Report first, change only after I approve.
1. Dependencies: read package.json and the pinned CDN versions in index.html (supabase-js) and in tools. For each, find the latest version and its release date (use web search). List upgrade candidates with risk (low: patch; medium: minor; high: major). Do not upgrade anything published in the last 14 days.
2. Claude Code: check the current documentation for subagent, command and hook file formats (code.claude.com/docs). Report any field in .claude/ that is no longer valid.
3. Dead code: list functions in js/ that no other file calls. Propose removal.
4. Documentation drift: compare CLAUDE.md sections 3 to 8 with the actual files (file list, command list, agent list, test names). List mismatches.
5. Content: run node tools/validate-content.js and report counts per language.
End with a numbered proposal of changes, each with: what, why, risk, and the command or file involved. Wait for approval.
