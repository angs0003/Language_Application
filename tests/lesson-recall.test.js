/* Lesson Quiz step: recall questions, earlier words, repeat of wrong answers, Summary from first answers. Run: node tests/lesson-recall.test.js */
const { makeDom, ready, tools } = require("./helpers");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
const emoji = s => /\p{Extended_Pictographic}/u.test(s);
(async () => {
  const dom = makeDom({ db: null, failures }); await ready(dom);
  const { d, W, M, click, lang } = tools(dom, failures);
  lang("ja"); click("Skip and start");
  const open = () => { W.eval("S.ja.resume=null;window.__ws=themes('ja')[0].words.slice(0,5);startLesson(__ws,'T',false,true);view.step=4;view.i=0;render()"); };
  const setRecall = (i, wi) => { W.eval(`view.quiz[${i}]=mkRecall(__ws[${wi}],'ja');view.i=${i};render()`); };
  const BODY = () => d.body.textContent;

  // --- Recall question ---
  W.eval("S.ja.srs={}");
  open();
  // a word with a long reading, so the text check below is exact
  const wi = W.eval("__ws.findIndex(w=>w.r.length>=5)");
  setRecall(0, wi);
  const w = W.eval("({w:__ws[" + wi + "].w,r:__ws[" + wi + "].r,m:__ws[" + wi + "].m})");
  check(M().includes(w.m), "recall question shows the English meaning");
  check(!M().includes(w.w) && !M().toLowerCase().includes(w.r.toLowerCase()), "recall question shows neither the characters nor the reading before Check answer");
  check(!!d.getElementById("tin") && d.getElementById("nextbtn").textContent === "Check answer" && d.getElementById("nextbtn").disabled, "recall question has the input and Check answer (disabled while empty)");
  check([...d.querySelectorAll("button")].some(b => b.textContent.trim() === "I do not know"), "recall question has I do not know");
  check(!emoji(M()), "recall question has no emoji");
  W.eval("view.q.input=" + JSON.stringify(w.r) + ";render()"); click("Check answer");
  check(W.eval("view.q.correct") === true && !!d.querySelector("#fbp .fb.ok"), "the correct reading is accepted (green feedback)");
  check(d.getElementById("fbp").textContent.includes(w.w) && d.getElementById("fbp").textContent.includes(w.m), "feedback after the answer shows the characters, the reading and the meaning");
  // wrong answer
  setRecall(0, wi); W.eval("view.q.input='zzzz';render()"); click("Check answer");
  check(W.eval("view.q.correct") === false && !!d.querySelector("#fbp .fb.no"), "a wrong reading is incorrect (red feedback)");
  // I do not know
  setRecall(0, wi); click("I do not know");
  check(W.eval("view.q.dk") === true && W.eval("view.q.correct") === false && d.getElementById("fbp").textContent.includes("Incorrect"), "I do not know is Incorrect");
  // another word with exactly the same meaning
  W.eval("CUR.ja[1].words.push({w:'テスト語',r:'tesutogo',m:" + JSON.stringify(w.m) + "})");
  setRecall(0, wi); W.eval("view.q.input='tesutogo';render()"); click("Check answer");
  check(W.eval("view.q.correct") === true && BODY().includes("another word with the same meaning"), "the reading of another word with the same meaning is accepted");
  W.eval("CUR.ja[1].words.pop()");

  // --- I can't speak right now ---
  open();
  W.eval("recallCanSpeak=function(){return true}");
  setRecall(0, 0); setRecall(1, 1);
  W.eval("view.quiz.push(mkQ('speak',__ws[2],'ja'))");
  setRecall(0, 0);
  const btn = t => [...d.querySelectorAll("button")].find(b => b.textContent.trim() === t);
  check(M().includes("Say the word") && !!btn("I can’t speak right now"), "the speak option and the button “I can’t speak right now” are shown");
  check(btn("I can’t speak right now").getAttribute("aria-label") === "I can’t speak right now" && btn("I can’t speak right now").className.includes("link"), "the button has an aria-label and is a secondary link button");
  check(d.querySelectorAll("#main .btn.pri").length === 0, "the speak option adds no primary button");
  click("I can’t speak right now");
  check(W.eval("view.noSpeak") === true && !M().includes("Say the word") && !!btn("I can speak now"), "after the button the speak option is hidden and “I can speak now” is shown");
  check(W.eval("view.quiz.every(q=>q.type!=='speak')"), "unanswered speak questions became listen or type questions");
  W.eval("view.i=1;render()");
  check(!M().includes("Say the word") && !!btn("I can speak now"), "the speak option stays hidden on the next recall question");
  check(W.eval("JSON.stringify(S).includes('noSpeak')") === false, "the flag is not saved to progress");
  click("I can speak now");
  check(W.eval("view.noSpeak") === false && M().includes("Say the word") && !!btn("I can’t speak right now"), "“I can speak now” restores the speak option");
  W.eval("goHome()"); open(); check(W.eval("!view.noSpeak"), "the flag is cleared when the lesson closes");

  // --- Earlier words ---
  W.eval("S.ja.srs={};themes('ja')[1].words.slice(0,4).forEach(w=>{S.ja.srs[w.w]={b:1,d:0,u:Date.now()};});S.ja.srs[themes('ja')[0].words[0].w]={b:1,d:0,u:Date.now()};");
  let bad = 0;
  for (let k = 0; k < 8; k++) {
    W.eval("window.__q=buildQuiz('ja',themes('ja')[0].words.slice(0,5),0)");
    const ear = W.eval("__q.filter(q=>q.earlier).length"), mine = W.eval("__q.filter(q=>q.earlier&&themes('ja')[0].words.slice(0,5).includes(q.word)).length");
    if (ear !== 2 || mine !== 0) bad++;
  }
  check(bad === 0, "the quiz has 2 due earlier words and none from this lesson (8 builds)");
  check(W.eval("(()=>{const q=buildQuiz('ja',themes('ja')[0].words.slice(0,5),0);return q.filter(x=>x.earlier&&['type','meaning','listen'].includes(x.type)).length===q.filter(x=>x.earlier).length;})()"), "earlier words are recall, listen or meaning questions");
  W.eval("S.ja.srs={};");
  check(W.eval("buildQuiz('ja',themes('ja')[0].words.slice(0,5),0).filter(q=>q.earlier).length") === 0, "with no due words there are no earlier word questions");
  const n = W.eval("buildQuiz('ja',themes('ja')[0].words.slice(0,5),0).length");
  check(n >= 10 && n <= 14, "the quiz length is reasonable for a 5-word lesson (" + n + ")");
  W.eval("window.__q=buildQuiz('ja',themes('ja')[2].words,0)"); console.log("info: quiz length for a theme with " + W.eval("themes('ja')[2].words.length") + " words: " + W.eval("__q.length"));
  check(W.eval("__q.filter(q=>q.recall).length>=1&&__q.some(q=>q.type==='meaning'||q.type==='listen'||q.type==='blank')"), "recall questions are mixed with other question types");

  // --- Earlier word screen, repeat and Summary ---
  W.eval("S.ja.srs={};themes('ja')[1].words.slice(0,2).forEach(w=>{S.ja.srs[w.w]={b:1,d:0,u:Date.now()};});");
  open();
  check(W.eval("view.quiz.filter(q=>q.earlier).length") === 2, "the lesson quiz contains 2 earlier words");
  W.eval("view.i=view.quiz.findIndex(q=>q.earlier);render()");
  check(M().includes("Earlier word"), "an earlier word question is labelled “Earlier word”");
  // mark: first answers. Two lesson words wrong (A, B), the rest and both earlier words right.
  W.eval(`window.__bad=view.quiz.filter(q=>q.word&&!q.earlier&&["type","meaning","listen","blank"].includes(q.type)).slice(0,2);
    view.quiz.forEach(q=>{if(q.type==="match"){q.answered=true;q.correct=true;return;}if(__bad.includes(q)){dontKnow(q);return;}q.answered=true;q.correct=true;});
    window.__wA=__bad[0].word.w;window.__wB=__bad[1].word.w;window.__first=view.quiz.length;view.i=view.quiz.length-1;render()`);
  check(W.eval("view.quiz.filter(q=>q.earlier).every(q=>q.correct)"), "setup: earlier words answered correctly");
  const wBefore = parseInt(d.querySelector("#hd .bar i").style.width);
  click("Continue");
  check(W.eval("view.step") === 4 && W.eval("view.quiz.length") === W.eval("__first+2") && W.eval("view.quiz.slice(__first).every(q=>q.again&&!q.answered)"), "2 wrong answers are asked again at the end, as new questions");
  check(M().includes("2 questions to repeat. The first answer counts for your review."), "the line “2 questions to repeat...” is shown before the first repeat");
  check(d.getElementById("hd").textContent.includes("Repeat: question 1 of 2"), "progress text is “Repeat: question 1 of 2”");
  check(parseInt(d.querySelector("#hd .bar i").style.width) >= wBefore, "the progress bar does not move backwards when the repeats start");
  // repeat 1 right, repeat 2 wrong
  W.eval("solve(view.q)"); if (!W.eval("view.q.answered")) click("Check answer");
  check(W.eval("view.q.correct") === true, "setup: repeat 1 solved");
  click("Continue");
  check(d.getElementById("hd").textContent.includes("Repeat: question 2 of 2") && !M().includes("to repeat. The first answer"), "the second repeat shows its position and no second intro line");
  click("I do not know"); click("Continue");
  check(W.eval("view.step") === 5 && W.eval("view.quiz.length") === W.eval("__first+2"), "a wrong repeat is not repeated again; the Summary opens");
  check(M().includes("Quiz result:") && M().includes("of " + W.eval("view.quiz.filter(q=>!q.again&&!q.earlier).length") + " correct"), "Summary counts first answers only");
  check(M().includes("Earlier words: 2 of 2 correct. They moved to a longer review interval."), "Summary shows the earlier words line");
  check(W.eval("S.ja.srs[__wA].d") === 0 && W.eval("S.ja.srs[__wB].d") === 0, "a word wrong first and right on the repeat is still wrong for review (d=0)");
  const okW = W.eval("view.words.map(w=>w.w).filter(x=>x!==__wA&&x!==__wB)[0]");
  check(W.eval("S.ja.srs[" + JSON.stringify(okW) + "].d") > Date.now(), "a word right on the first answer gets a later review date");
  check(W.eval("themes('ja')[1].words.slice(0,2).every(w=>S.ja.srs[w.w].d>Date.now())"), "due earlier words answered correctly get a later review date");
  check(!emoji(M()), "Summary has no emoji");
  W.eval("goHome()");

  // Earlier word wrong: due again now
  W.eval("S.ja.srs={};themes('ja')[1].words.slice(0,1).forEach(w=>{S.ja.srs[w.w]={b:3,d:0,u:Date.now()};});");
  open();
  W.eval(`view.quiz.forEach(q=>{q.answered=true;q.correct=!q.earlier;if(q.earlier){q.dk=true;q.sel=-1;}});view.step=5;view.i=0;render()`);
  const ew = W.eval("view.quiz.find(q=>q.earlier).word.w");
  check(M().includes("Earlier words: 0 of 1 correct. It is due again now.") && W.eval("S.ja.srs[" + JSON.stringify(ew) + "].d") === 0 && W.eval("S.ja.srs[" + JSON.stringify(ew) + "].b") === 1, "a wrong earlier word is due again now (box 1)");
  W.eval("goHome()");

  // No wrong answer: no repeat
  W.eval("S.ja.srs={}"); open();
  W.eval("view.quiz.forEach(q=>{q.answered=true;q.correct=true});view.i=view.quiz.length-1;render()"); click("Continue");
  check(W.eval("view.step") === 5 && !M().includes("Earlier words"), "with no wrong answer there is no repeat and no Earlier words line");

  // Sentence question wrong in the lesson stays in Mistakes even when its repeat is right
  W.eval("goHome();S.ja.srs={};S.ja.mis=[]"); open();
  W.eval(`{const k=view.quiz.findIndex(q=>q.type==="build");view.quiz.forEach((q,j)=>{if(j===k)dontKnow(q);else{q.answered=true;q.correct=true;}});view.i=view.quiz.length-1;render();}`);
  click("Continue"); W.eval("solve(view.q)"); if (!W.eval("view.q.answered")) click("Check answer");
  check(W.eval("view.q.again===true&&view.q.correct===true&&S.ja.mis.length")===1, "a sentence question wrong in the lesson stays in Mistakes after a right repeat");

  // Chinese
  W.eval("goHome()"); lang("zh");
  W.eval("S.zh.srs={};window.__ws=themes('zh')[0].words.slice(0,5);startLesson(__ws,'T',false,true);view.step=4;view.i=0;view.quiz[0]=mkRecall(__ws[0],'zh');render()");
  check(M().includes(W.eval("__ws[0].m")) && !M().includes(W.eval("__ws[0].w")) && M().includes("pinyin"), "Chinese: recall question shows the meaning and asks for pinyin");
  W.eval("view.q.input=__ws[0].r;render()"); click("Check answer");
  check(W.eval("view.q.correct") === true, "Chinese: the reading is accepted");

  failures.forEach(f => console.log("FAIL:", f));
  console.log(failures.length ? failures.length + " failure(s)." : "Lesson recall test OK.");
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.log("FAIL:", e.stack); process.exit(1); });
