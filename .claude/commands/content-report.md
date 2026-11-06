---
description: Summarise my learning progress and where content needs attention (local only: reads personal progress, never run in GitHub Actions; the monthly cloud run uses /content-gaps)
---
Produce a content and progress report for Language Steps.
If I give you database read access (SUPABASE_URL and the service role key in .env, read-only use), query word_progress and activity for my user: words learned per language, review accuracy by theme (box changes), chapters read, travel situations done, kanji learned. Otherwise ask me to paste the numbers from the app's Practise screen.
Then:
1. List themes where my review accuracy is lowest (bottom 5) and suggest one action each (repeat lesson, podcast episode, or extra practice).
2. List content gaps: levels or parts not built yet (PARTS and LEVELS), themes with fewer chapters than themes, catalogue videos missing per level.
3. List open content errors: gh issue list --label content-error --state open.
Report in numbered points. Do not change files.
