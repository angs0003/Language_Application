/* Helpers used by several area files in tests/phone/screens/. */
// Marks the words of the first theme as learned (so the review screens have items).
const LEARNED = "themes(S.lang)[0].words.forEach(w=>{S[S.lang].srs[w.w]={b:3,d:Date.now()+1e9,u:Date.now()};});";
// Opens the first 5 words of the first theme as a lesson at the given step and item.
const LESSON = (step, i) => `{const t=themes(S.lang)[0];startLesson(t.words.slice(0,5),t.title);view.step=${step};view.i=${i || 0};render();}`;
module.exports = { LEARNED, LESSON };
