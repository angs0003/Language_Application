/* Screens of the area "lessons" (fields: see tests/phone/screens.js). Add a new screen of this area at the end of the list. */
const { LESSON } = require("./shared.js");
module.exports = [
    { name: "Casual speech lesson", covers: ["screenCasual"], open: "if(CASUAL[S.lang]&&CASUAL[S.lang].length)openCasual(0)" },
    { name: "Theme page", covers: ["screenTheme"], open: "openTheme(0)" },
    { name: "Grammar point", covers: ["screenGram"], open: "openGram(0)" },
    { name: "Lesson: new word", covers: ["screenLesson"], open: LESSON(0, 0) },
    { name: "Lesson: new word, reading of the whole word", covers: [], langs: ["ja"], open: "{const t=themes('ja').find(x=>x.title==='Months and dates');startLesson(t.words,t.title);const k=view.words.findIndex(w=>w.w==='一日');view.i=view.items0.findIndex(it=>it.k==='word'&&it.wi===k);render();}" },
    { name: "Lesson: grammar", covers: [], open: LESSON(1, 0) },
    { name: "Lesson: sentences", covers: [], open: LESSON(2, 0) },
    { name: "Lesson: story", covers: [], open: LESSON(3, 0) },
    { name: "Lesson: quiz", covers: [], open: LESSON(4, 0) },
    { name: "Lesson: summary", covers: [], maxPrimary: 2, open: LESSON(5, 0) },
    { name: "Lesson: recall question", covers: [], open: "{const t=themes(S.lang)[0];startLesson(t.words.slice(0,5),t.title);view.step=4;view.quiz[0]=mkRecall(t.words[0],S.lang);view.i=0;render();}" },
    { name: "Lesson: quiz earlier word", covers: [], /* a recall question: the listen question has 2 primary buttons (Play audio and Check answer), a known breach that is not part of this screen */ setup: "{const w=themes(S.lang)[1].words[0];S[S.lang].srs[w.w]={b:1,d:0,u:Date.now()};}", open: "{const t=themes(S.lang)[0];startLesson(t.words.slice(0,5),t.title);view.step=4;const k=Math.max(0,view.quiz.findIndex(q=>q.earlier));view.quiz[k]=Object.assign(mkRecall(view.quiz[k].word,S.lang),{earlier:true});view.i=k;render();}" },
    { name: "Lesson: check question", covers: [], open: "{const t=themes(S.lang)[0];startLesson(t.words.slice(0,5),t.title,false,true);const k=view.items0.findIndex(it=>it.k==='check');view.items0[k].q=mkRecall(view.items0[k].q.word,S.lang);view.i=k;render();}" },
    { name: "Lesson: check question with earlier word", covers: [], open: "{const t=themes(S.lang)[0];startLesson(t.words.slice(0,5),t.title,false,true);const k=view.items0.findIndex(it=>it.k==='check'&&it.q.earlier);view.items0[k].q=Object.assign(mkRecall(view.items0[k].q.word,S.lang),{earlier:true});view.i=k;render();}" },
    { name: "Lesson: repeat question", covers: [], open: "{const t=themes(S.lang)[0];startLesson(t.words.slice(0,5),t.title);view.step=4;const k=view.quiz.findIndex(q=>q.type!=='match');view.quiz.forEach((q,j)=>{q.answered=true;q.correct=j!==k;if(j===k){q.dk=true;q.sel=-1;}});view.i=view.quiz.length-1;lessonMove(1);}" },
    { name: "Lesson: listen question", covers: [], open: "{const t=themes(S.lang)[0];startLesson(t.words.slice(0,5),t.title);view.step=4;view.i=0;view.quiz[0]=mkQ('listen',t.words[0],S.lang);render();}" }
];
