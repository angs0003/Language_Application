---
description: Report missing content and open content errors (no personal progress data; safe for public logs)
---
Produce a content gaps report for Language Steps. Do not change files. Do not read any database.
1. Run node tools/validate-content.js and report the counts per language (themes, words, chapters, grammar points, kanji, catalogue videos).
2. Roadmap position: compare PARTS and LEVELS in content/content.js with CLAUDE.md section 10. List the next 3 content parts to build, in roadmap order.
3. Catalogue videos: count VIDS items with an id per language and level. List levels with fewer than 3 videos.
4. Open content errors: run gh issue list --label content-error --state open --json number,title. List them, oldest first.
5. Structure checks: themes without 6 practice sentences, languages where the number of chapters differs from the number of themes.
Report in numbered points under the headings above. End with one line: the single most useful next content task.
