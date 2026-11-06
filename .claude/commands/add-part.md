---
description: Add one content part (150 words, 10 grammar points, 15 chapters) for a language and level
argument-hint: <ja|zh> <level number> <part number>
---
Add a content part for Language Steps: language, level and part = $ARGUMENTS.

Do this in order:
1. Read CLAUDE.md sections 6, 7 and 9. Read the end of content/content.js to see how earlier parts are appended and the PARTS and LEVELS entries.
2. Use the content-writer subagent to write 15 themes (10 words each with example sentences), 10 grammar points and 15 story chapters for this part, continuing the story characters. Words must come from the level’s official list where one exists (HSK), or from common JLPT lists.
3. Append the new arrays, add the PARTS entry (t = number of themes before, g = number of grammar points before, n = 10) and update LEVELS.
4. Use the content-reviewer subagent to review the new content. Fix every problem it reports.
5. Run npm test. Fix failures.
6. Report: themes added, total words per language, and the exact commands to release (/release).
Do not release in this command.
