# Real-situation log

Moved from CLAUDE.md section 5. Update this file when the feature changes.

**Real-situation log** (Travel tab; `S[lang].real`, `homeReal` and `realBlock` in js/sections.js): under each phrase in a situation's "You say" tab, "I used this in real life" opens 3 results
(`ok` Understood, `repeat` Asked me to repeat, `english` Answered in English). `S[lang].real` is `{ "<phrase text>": {r, t} }`, the latest result per phrase wins, and a phrase that
no longer exists in the content is skipped. The Travel tab shows counts and the row "Phrases to review" (sub-screen `openSub("real")`: phrases whose latest result is
`repeat` or `english`; tapping plays the phrase; "Understood" removes it). Synced inside `user_settings.data.per[lang]` like `mis` (last-write-wins for the whole object, no SQL change).
Because the key is the phrase text, replacing a phrase in the content resets its result.
