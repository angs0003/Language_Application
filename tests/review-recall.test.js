/* Practise review: recall questions in startMixed and startReview (reviewQ). Run: node tests/review-recall.test.js */
const { makeDom, ready, tools } = require("./helpers");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
(async () => {
  const dom = makeDom({ db: null, failures }); await ready(dom);
  const { d, W, M, click, lang } = tools(dom, failures);
  lang("ja"); click("Skip and start");
  const due = (n, b) => W.eval(`S.ja.srs={};S.ja.saved=[];S.ja.kanji={};window.__ws=allWords('ja').slice(0,${n});__ws.forEach(w=>{S.ja.srs[w.w]={b:${b},d:0,u:Date.now()};})`);
  const btn = t => [...d.querySelectorAll("button")].find(b => b.textContent.trim() === t);
  const goHome = () => W.eval("goHome()");

  // (1) box 3 or higher is always a recall question
  due(5, 3);
  W.eval("startMixed(false)");
  check(W.eval("view.qs.length") === 5 && W.eval("view.qs.every(q=>q.recall===true&&q.type==='type')"), "due words in box 3 or higher are all recall questions");
  check(W.eval("(S.ja.srs[__ws[0].w].b=5,reviewQ(__ws[0],'ja',1).recall===true)"), "box 5 is recall at any position");

  // (2) box 0 to 2 rotates recall, meaning, listen
  goHome(); due(6, 1);
  W.eval("startMixed(false)");
  const kinds = W.eval("view.qs.map(q=>q.recall?'recall':q.type).sort().join()");
  check(kinds === "listen,listen,meaning,meaning,recall,recall", "box 1 words rotate recall, meaning, listen (" + kinds + ")");
  check(W.eval("[0,1,2].map(i=>{const q=reviewQ(__ws[0],'ja',i);return q.recall?'recall':q.type;}).join()") === "recall,meaning,listen", "reviewQ rotation by position is recall, meaning, listen");

  // (3) no plain type question for words in startMixed
  let plain = 0;
  for (const b of [0, 1, 2, 3, 4]) { goHome(); due(8, b); W.eval("startMixed(false)"); plain += W.eval("view.qs.filter(q=>q.type==='type'&&!q.recall).length"); }
  check(plain === 0, "startMixed has no non-recall type question for due words");
  goHome(); due(8, 2); W.eval("Object.values(S.ja.srs).forEach(e=>{e.d=Date.now()+1e9;})");
  W.eval("startMixed(true)");
  check(W.eval("view.qs.length>0&&view.qs.filter(q=>q.type==='type'&&!q.recall).length===0"), "Practise anyway has no non-recall type question");

  // (4) answers: correct raises the box, wrong or I do not know sets box 1 and due now
  goHome(); due(3, 3);
  W.eval("startMixed(false)");
  const w0 = W.eval("view.qs[0].word.w"), r0 = W.eval("view.qs[0].word.r");
  W.eval(`view.qs[0].input=${JSON.stringify(r0)};render()`); click("Check answer");
  check(W.eval(`S.ja.srs[${JSON.stringify(w0)}].b`) === 4, "a correct recall answer raises the box (3 to 4)");
  click("Continue");
  const w1 = W.eval("view.qs[1].word.w");
  W.eval("view.qs[1].input='zzzz';render()"); click("Check answer");
  check(W.eval(`S.ja.srs[${JSON.stringify(w1)}].b`) === 1 && W.eval(`S.ja.srs[${JSON.stringify(w1)}].d`) <= Date.now(), "a wrong recall answer sets box 1 and due now");
  click("Continue");
  const w2 = W.eval("view.qs[2].word.w");
  // (5) I do not know exists
  check(!!btn("I do not know") && !!d.getElementById("tin") && !M().includes(w2), "the review recall question has the input and I do not know, and does not show the word");
  click("I do not know");
  check(W.eval(`S.ja.srs[${JSON.stringify(w2)}].b`) === 1 && W.eval(`S.ja.srs[${JSON.stringify(w2)}].d`) <= Date.now(), "I do not know sets box 1 and due now");
  check(!/\p{Extended_Pictographic}/u.test(M()), "no emoji on the review recall question");

  // (6) setNoSpeak in a review
  goHome(); due(4, 1);
  W.eval("S.settings.speaking=true;recallCanSpeak=function(){return true}");
  W.eval("startReview(__ws,false)");
  check(W.eval("view.qs.some(q=>q.type==='speak')"), "startReview has a speak question when Speaking questions is on");
  W.eval("view.i=view.qs.findIndex(q=>q.recall);render()");
  check(M().includes("Say the word") && !!btn("I can’t speak right now"), "the recall question offers Say the word");
  click("I can’t speak right now");
  check(!M().includes("Say the word") && W.eval("view.qs.every(q=>q.type!=='speak')"), "setNoSpeak(true) hides Say the word and converts the speak questions in a review");
  W.eval("S.settings.speaking=false");

  // (7) the Recap session has no recall
  goHome(); due(8, 3);
  W.eval("startReview(__ws,true)");
  check(W.eval("view.qs.every(q=>!q.recall)") && W.eval("view.qs.some(q=>q.type==='type')"), "startReview(words,true) (Recap) has no recall question");
  goHome(); due(8, 3);
  W.eval("startReview(__ws,false)");
  check(W.eval("view.qs.some(q=>q.recall)"), "startReview(words,false) has recall questions");

  // (8) kanji and My words questions unchanged
  goHome(); due(1, 3);
  W.eval("const k=KJ().slice(0,3);S.ja.kanji={};k.forEach(x=>{S.ja.kanji[x.c]={b:1,d:0,u:Date.now()};});const w=allWords('ja')[20];S.ja.saved=[{w:w.w,r:w.r,m:w.m,s:'',src:'',b:0,d:0,t:Date.now(),u:Date.now(),tk:null}];");
  W.eval("startMixed(false)");
  check(W.eval("view.qs.some(q=>q.kk)") && W.eval("view.qs.filter(q=>q.kk).every(q=>!q.recall)"), "kanji questions are unchanged (no recall)");
  check(W.eval("view.qs.filter(q=>q.vitem).length") === 1 && W.eval("view.qs.filter(q=>q.vitem).every(q=>q.type==='meaning'&&!q.recall)"), "My words questions are unchanged (meaning)");

  failures.forEach(f => console.log("FAIL:", f));
  console.log(failures.length ? failures.length + " failure(s)." : "Review recall test OK.");
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.log("FAIL:", e.stack); process.exit(1); });
