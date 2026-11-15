# Casual speech

Moved from CLAUDE.md section 5. Update this file when the feature changes.

**Casual speech** (Practise tab; `CASUAL[lang]`, `openSub("casual")`, `view.s="casual"`, `casualList`, `casualLesson`, `casualMark`, `screenCasual`, `startCasualQuiz` in js/sections.js): 12 lessons per language on how people really speak
(Japanese: plain-form questions, dropped particles, てる, ちゃった, じゃん, short replies, fillers, ね/よ, かな/でしょ, inviting, reactions, who gets which form; Chinese: 吧, 啊, 呢, 嘛, 儿化, dropped subject,
short replies, fillers, ordering, agreeing and refusing, reactions, 你 and 您). A lesson shows each pair as a Polite and a Casual line (audio, word taps, furigana), then a quiz ("Which would you say to ...?" and
"Which version is polite?") that reuses the grammar-choice engine; wrong answers are not added to Mistakes. The row is hidden when `CASUAL[lang]` is empty or missing (old cached content). Progress is
`S[lang].casualDone` = `{lessonIndex: timestamp}`, synced inside `user_settings.data.per[lang]` like `real` (last-write-wins for the whole object, no SQL change). Because the key is the lesson's position,
**only append new lessons to `CASUAL`; never insert or reorder them.**
