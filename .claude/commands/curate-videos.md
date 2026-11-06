---
description: Find 5 candidate videos for a language and level, with an evidence table
argument-hint: <ja|zh> <level 1-4>
---
Use the video-curator subagent for: $ARGUMENTS
1. From the preferred channels, find up to 8 candidates and open each page.
2. Score them with the 3 rule groups and show the evidence table, best first, keeping at most 5 that pass.
3. List the ones that failed and the rule they failed.
4. Wait for my approval of specific ids, then add only those to content/content.js and run node tools/validate-content.js. Do not release.
