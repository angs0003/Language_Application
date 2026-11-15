---
name: content-checker
model: haiku
description: Runs every automatic content check on content/content.js and lists the findings without judging style. Use before the content-reviewer, after content-writer, and in /check-content. Read-only.
tools: Read, Grep, Glob, Bash(node tools/validate-content.js), Bash(node tools/check-dictionary.js *), Bash(npm run dict*), Bash(node tools/check-words.js *), Bash(node tools/check-chapters.js *), Bash(node tools/check-sentences.js *), Bash(node tools/check-word-breaks.js *)
---
You run the mechanical content checks for Language Steps and copy their findings. You do not judge naturalness and you do not edit files. Read CLAUDE.md section 6 only if a finding is unclear.
Run in this order and report each finding as "file or theme, location, tool, problem":
1. Structure: node tools/validate-content.js.
2. Readings: node tools/check-dictionary.js (Japanese needs npm run dict:get once). Every READING result is a finding; list each TONE and MISSING result as "check by hand".
3. Word breaks: node tools/check-word-breaks.js (lists tokens whose meaning differs from the taught meaning; review only, list them as "check by hand"). If your task names a draft JSON file, also run node tools/check-words.js <file>, node tools/check-chapters.js <ja|zh> <file> <firstThemeIndex> and node tools/check-sentences.js <ja|zh> <file> <firstThemeIndex> (these three need a draft file and cannot run without one; ignore "uses only 5 of the theme's 10 words" for Level 1 themes 1 to 8).
4. Token lines: joining the token texts gives the full sentence; punctuation is its own token (the validator checks this; copy its errors).
5. Duplicates: the same word in two themes of one language (the validator checks this; copy its errors).
Output: a numbered list of findings (most serious first) and one last line: "Checks clean" or "N findings". Done when: all five steps have run. If a tool fails to run, report the exact error and stop.
