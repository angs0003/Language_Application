---
description: Verify one YouTube link against the curation rules and add it to the catalogue
argument-hint: <YouTube link> [level 1-4]
---
Use the video-curator subagent for this link and level: $ARGUMENTS
1. Extract the 11-character id, open the page, and fill the evidence table (efficient, straightforward, great feedback).
2. Show the table and the proposed VIDS entry. Wait for my approval.
3. After approval, add the entry to the matching language array in content/content.js, run node tools/validate-content.js, and tell me the result. Do not release.
