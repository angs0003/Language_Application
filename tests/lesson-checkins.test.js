/* Lesson New words step: check-ins after groups of at most 3 words. Run: node tests/lesson-checkins.test.js */
const { makeDom, ready, tools } = require("./helpers");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
const emoji = s => /\p{Extended_Pictographic}/u.test(s);
(async () => {
  const dom = makeDom({ db: null, failures }); await ready(dom);
  const { d, W, M, click, lang } = tools(dom, failures);
  lang("ja"); click("Skip and start");
  const open = () => { W.eval("S.ja.srs={};S.ja.resume=null;window.__ws=themes('ja')[0].words.slice(0,5);startLesson(__ws,'T',false,true)"); };
  const kinds = () => W.eval("view.items0.map(it=>it.k==='word'?'w'+it.wi:'c')").join(",");
  const HD = () => d.getElementById("hd").textContent;
  const backBtn = () => [...d.querySelectorAll("#bbar button")].find(b => b.textContent.trim() === "Back");

  // --- Structure ---
  check(W.eval("[1,2,3,4,5,6,10,15].map(n=>checkinSizes(n).join('+')).join(' ')") === "1 2 3 2+2 3+2 3+3 3+3+2+2 3+3+3+3+3", "groups have at most 3 words and are as equal as possible (5 words: 3+2, 10 words: 3+3+2+2)");
  open();
  check(kinds() === "w0,w1,w2,c,c,c,w3,w4,c,c,c", "a 5-word lesson has a check after word 3 and after word 5 (6 more screens)");
  check(W.eval("view.items0.slice(3,6).map(it=>it.q.word.w).sort().join()") === W.eval("__ws.slice(0,3).map(w=>w.w).sort().join()"), "the first check asks one question for each of the first 3 words");
  const c2 = W.eval("view.items0.slice(8).map(it=>({w:it.q.word.w,e:!!it.q.earlier}))");
  check(c2.length === 3 && c2.filter(x => x.e).length === 1 && W.eval("__ws.slice(0,3).map(w=>w.w)").includes(c2.find(x => x.e).w), "the second check has 1 question on a word of the first group");
  check(W.eval("view.items0.slice(8).filter(it=>!it.q.earlier).map(it=>it.q.word.w).sort().join()") === W.eval("__ws.slice(3).map(w=>w.w).sort().join()"), "the second check also asks the words of its own group");
  check(W.eval("view.items0.filter(it=>it.k==='check').slice(0,3).map(it=>it.q.recall?'recall':it.q.type).join()") === "recall,listen,meaning", "question types rotate: recall, listen, meaning");

  // --- Screens ---
  W.eval("view.i=3;render()");
  check(HD().includes("Step 1 of 6: New words") && HD().includes("Check: question 1 of 3"), "progress text shows the step and Check: question N of M");
  check(!!d.getElementById("tin") && d.getElementById("nextbtn").textContent === "Check answer" && d.getElementById("nextbtn").disabled, "a check question has Check answer (disabled until answered)");
  check([...d.querySelectorAll("button")].some(b => b.textContent.trim() === "I do not know") && !emoji(M()), "a check question has I do not know and no emoji");
  check(d.querySelectorAll("#main .btn.pri,#bbar .btn.pri").length <= 1, "one primary button");

  // --- Check answers do not change review data ---
  const srs0 = W.eval("JSON.stringify(S.ja.srs)");
  W.eval("solve(view.q)"); click("Check answer");
  check(W.eval("view.q.correct") === true && !!d.querySelector("#fbp .fb.ok"), "a correct check answer shows green feedback");
  check(W.eval("JSON.stringify(S.ja.srs)") === srs0, "check answers do not change srs");
  click("Continue");
  check(W.eval("view.i") === 4 && W.eval("view.ck.n") === 1, "Continue moves to the next check question and counts the answer once");
  // Back to the answered question shows the answer again and does not count it twice
  backBtn().click();
  check(W.eval("view.i") === 3 && !!d.querySelector("#fbp .fb.ok") && d.getElementById("nextbtn").textContent === "Continue", "Back to an answered check question shows its answer and feedback");
  click("Continue");
  check(W.eval("view.ck.n") === 1, "the answered question is not counted twice");
  // I do not know
  W.eval("view.i=4;render()"); const w4 = W.eval("view.q.word.w");
  [...d.querySelectorAll("button")].find(b => b.textContent.trim() === "I do not know").click();
  check(!!d.querySelector("#fbp .fb.no") && d.getElementById("fbp").textContent.includes("Incorrect") && d.getElementById("fbp").textContent.includes(w4), "I do not know gives Incorrect and shows the word");
  check(W.eval("JSON.stringify(S.ja.srs)") === srs0, "I do not know does not change srs either");

  // --- Back, place, resume ---
  W.eval("view.i=3;render()");
  backBtn().click();
  check(W.eval("view.i") === 2 && M().includes("New word"), "Back from the first check question opens the last word card of the group");
  W.eval("view.i=4;render();lessonSave(view)");
  check(W.eval("S.ja.resume.step") === 0 && W.eval("S.ja.resume.i") === 2, "leaving on a check question saves step 0 and the last word of the group");
  W.eval("view=({s:'home'});startLesson(__ws,'T')");
  check(W.eval("view.step") === 0 && W.eval("view.items0[view.i].k") === "word" && W.eval("view.items0[view.i].wi") === 2, "continuing opens that word card");
  W.eval("view.i=9;render();lessonSave(view)");
  check(W.eval("S.ja.resume.i") === 4, "a place on the second check is saved as word 5");
  W.eval("S.ja.resume.step=0;S.ja.resume.i=3;view=({s:'home'});startLesson(__ws,'T')");
  check(W.eval("view.items0[view.i].k") === "word" && W.eval("view.items0[view.i].wi") === 3 && HD().includes("Word 4 of 5"), "an older saved place (step 0, i 3) opens word 4");

  // --- Whole lesson reaches the Quiz step; the Quiz keeps its own questions ---
  open();
  for (let k = 0; k < 40 && W.eval("view.step") < 4; k++) { if (W.eval("view.items0[view.i].k==='check'")) { W.eval("dontKnow(view.q);render()"); } click("Continue"); }
  check(W.eval("view.step") === 4 && W.eval("view.quiz.length") >= 10, "after the checks the Quiz step opens with its own questions");
  check(W.eval("JSON.stringify(S.ja.srs)") === "{}", "wrong check answers do not change srs and are not repeated in the check");

  // --- Chinese ---
  W.eval("S.zh.resume=null;S.zh.srs={};S.lang='zh';window.__wz=themes('zh')[0].words.slice(0,5);startLesson(__wz,'T',false,true);view.i=3;render()");
  check(HD().includes("Check: question 1 of 3") && M().includes("pinyin") && !!d.getElementById("tin"), "Chinese: the first check question is a recall question that asks for pinyin");

  failures.forEach(f => console.log("FAIL:", f));
  console.log(failures.length ? failures.length + " failure(s)." : "Lesson check-ins test OK.");
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.log("FAIL:", e.stack); process.exit(1); });
