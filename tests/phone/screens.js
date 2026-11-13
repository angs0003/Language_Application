/* Registry of every screen of the app and how to open it (JavaScript run in the page after the language is set and marked as placed).
   Used by:
   - tests/phone/phone.spec.js: opens every registered screen in both languages and at both phone sizes and checks that it has no script errors,
     no sideways scrolling, at most one primary button and no new touch target under 44 px (CLAUDE.md section 3);
   - tests/screens.test.js: fails when a screenX or homeX function of the app is in neither \`screens\` (covers) nor \`skip\`.
   When you add a screen, add it here. A feature that appears on many screens should also be tested on each of them (see the callout and podcast tests in phone.spec.js).
   open: JavaScript. langs: ["ja"] when the screen exists only for Japanese. setup: JavaScript run first.
   maxPrimary: a KNOWN breach of design rule 2 (one primary button per screen): the number of primary buttons the screen has today. The test fails if it gets worse. Fix the screen, then remove the field. */
const LEARNED = "themes(S.lang)[0].words.forEach(w=>{S[S.lang].srs[w.w]={b:3,d:Date.now()+1e9,u:Date.now()};});";
const LESSON = (step, i) => `{const t=themes(S.lang)[0];startLesson(t.words.slice(0,5),t.title);view.step=${step};view.i=${i||0};render();}`;
module.exports = {
  screens: [
    { name: "Learn tab", covers: ["homeLearn", "screenHome"], open: "setTab('learn')" },
    { name: "Practise tab", covers: ["homePractise"], open: "setTab('practise')" },
    { name: "Listen tab", covers: ["homeListen"], open: "setTab('listen')" },
    { name: "Travel tab", covers: ["homeTravel"], open: "setTab('travel')" },
    { name: "Settings", covers: ["screenSettings"], open: "view={s:'settings'};render()" },
    { name: "All themes", covers: ["screenLib", "homePath"], open: "openSub('themes')" },
    { name: "Grammar guide", covers: ["homeGrammar"], open: "openSub('grammar')" },
    { name: "Your videos", covers: ["homeWatch"], maxPrimary: 8, open: "openSub('watchadd')" },
    { name: "Phrases to review", covers: ["homeReal"], open: "openSub('real')" },
    { name: "Casual speech list", covers: ["homeCasual"], open: "openSub('casual')" },
    { name: "Casual speech lesson", covers: ["screenCasual"], open: "if(CASUAL[S.lang]&&CASUAL[S.lang].length)openCasual(0)" },
    { name: "Kanji list", covers: ["homeKanji"], langs: ["ja"], maxPrimary: 2, open: "openSub('kanji')" },
    { name: "Kana list", covers: [], langs: ["ja"], open: "openSub('kana')" },
    { name: "Kana lesson", covers: ["screenKana"], langs: ["ja"], open: "startKana('hira',0)" },
    { name: "Kanji card", covers: ["screenKanjiCard"], langs: ["ja"], open: "openKanji('私')" },
    { name: "Kanji lesson", covers: ["screenKanjiLearn"], langs: ["ja"], open: "startKanjiLesson()" },
    { name: "Theme page", covers: ["screenTheme"], open: "openTheme(0)" },
    { name: "Grammar point", covers: ["screenGram"], open: "openGram(0)" },
    { name: "Lesson: new word", covers: ["screenLesson"], open: LESSON(0, 0) },
    { name: "Lesson: grammar", covers: [], open: LESSON(1, 0) },
    { name: "Lesson: sentences", covers: [], open: LESSON(2, 0) },
    { name: "Lesson: story", covers: [], open: LESSON(3, 0) },
    { name: "Lesson: quiz", covers: [], open: LESSON(4, 0) },
    { name: "Lesson: summary", covers: [], maxPrimary: 2, open: LESSON(5, 0) },
    { name: "Story reader", covers: ["screenStory"], open: "openChapter(0)" },
    { name: "Story reader: all lines", covers: [], open: "{openChapter(1);view.shown=chapter(S.lang,1).lines.length;render();}" },
    { name: "Story reader: questions", covers: [], open: "{openChapter(0);view.phase='q';view.k=0;render();}" },
    { name: "Story player", covers: ["screenPlayer"], open: "openPlayer('story',0)" },
    { name: "Podcast player", covers: [], open: "openPlayer('pod',0)" },
    { name: "Travel player", covers: [], open: "openPlayer('trip',0)" },
    { name: "Podcast episode", covers: ["screenPod"], open: "openPod(0)" },
    { name: "Travel situation", covers: ["screenTrip"], open: "openTrip(0)" },
    { name: "My words", covers: ["screenVocab"], open: "openVocab()" },
    { name: "My words: flashcards", covers: ["screenCards"], setup: "{const w=themes(S.lang)[0].words[0];S[S.lang].saved=[{w:w.w,r:w.r,m:w.m,s:'',src:'',b:0,d:0,t:Date.now(),u:Date.now(),tk:null}];}", open: "startCards()" },
    { name: "Review session", covers: ["screenReview"], setup: LEARNED, open: "startMixed(true)" },
    { name: "Test out", covers: ["screenTest"], open: "startTest(0)" },
    { name: "Placement quiz", covers: ["screenPlace"], open: "startPlacement()" }
  ],
  /* Functions that are not screens of their own, or that need something the test cannot give. Give the reason. */
  skip: {
    screenVideo: "needs the YouTube player, which the tests block (no network); covered by tests/features.test.js with a fake player",
    screenTalk: "AI conversation: AI_OFF is true, so the screen cannot be opened",
    homeStories: "not used anywhere (old library section)",
    homePod: "not used anywhere (old library section)",
    homeTalk: "not used anywhere (old library section)",
    homeReview: "not used anywhere (old library section)",
    homeTrip: "not used anywhere (old library section)"
  }
};
