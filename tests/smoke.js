/* End-to-end flow test without a database (bundled content). Run: node tests/smoke.js */
const { makeDom, wait, ready, tools } = require("./helpers");
const failures = [];
(async () => {
  const dom = makeDom({ db: null, failures }); await ready(dom);
  const { d, W, M, click, answerUntil, doLesson, startNext, tab, lang: pickLang } = tools(dom, failures);
  if (W.eval("LS_CONTENT_SOURCE") !== "bundled") failures.push("expected bundled content");
  for (const lang of ["ja", "zh"]) {
    pickLang(lang); click("Skip and start");
    for (let round = 0; round < 5; round++) {
      if (W.eval("view.s") !== "home") W.eval("goHome()"); tab("Learn"); startNext(); await wait(5); const s = W.eval("view.s");
      if (s === "lesson") await doLesson();
      else if (s === "story") { click("Answer"); await answerUntil(() => W.eval("view.phase==='done'")); click("Go to home"); }
      else if (s === "trip") { click("Practise this situation"); await answerUntil(() => W.eval("view.k>=view.items.length")); click("Go to home"); }
      else W.eval("goHome()");
    }
    const learned = W.eval(`learnedWords("${lang}").length`);
    if (learned < 10) failures.push(lang + ": expected at least 10 learned words, got " + learned);
    // Sentences step: 6 sentences per theme, shown before the story, and sentence questions in the quiz
    W.eval("goHome()"); W.eval("startLesson(themes(S.lang)[1].words,'Test',true)");
    if (W.eval("view.sents.length") !== 6) failures.push(lang + ": theme 2 should have 6 sentences");
    W.eval("view.step=2;view.i=0;render()");
    if (!M().includes("Play all sentences") || d.querySelectorAll("#main .line").length !== 6) failures.push(lang + ": Sentences step does not show 6 sentences");
    if (!d.getElementById("hd").textContent.includes("Step 3 of 6")) failures.push(lang + ": Sentences step should be step 3 of 6");
    if (W.eval("view.quiz.filter(q=>q.type==='build').length") < 3) failures.push(lang + ": quiz should have at least 3 sentence-building questions");
    W.eval("view.step=3;view.i=0;render()"); if (!M().includes("Play whole story")) failures.push(lang + ": Story step missing after Sentences");
    W.eval("goHome()");
    console.log(lang + ": flow OK, learned " + learned + " words");
  }
  W.eval("openPod(0)"); if (W.eval("view.segs.length") < 10) failures.push("podcast episode too short");
  W.eval("goHome()"); tab("Listen"); click("Add a video"); d.getElementById("vurl").value = "https://youtu.be/AAAAAAAAAAA"; click("Add video");
  if (!M().includes("Video 1")) failures.push("added video is not listed");
  // design rules on every main screen
  for (const [t, label] of [["Learn","learn"],["Practise","practise"],["Listen","listen"],["Travel","travel"]]) {
    W.eval("libSec=null;view={s:'home'};render()"); tab(t);
    const txt = d.body.textContent;
    if (/\p{Extended_Pictographic}/u.test(d.getElementById("main").textContent + d.getElementById("hd").textContent)) failures.push(t + ": emoji found in the interface");
    const primaries = d.querySelectorAll("#main .btn.pri").length; if (primaries > 1) failures.push(t + ": " + primaries + " primary buttons");
    const unlabeled = [...d.querySelectorAll("button")].filter(b => !b.textContent.trim() && !b.getAttribute("aria-label")).length; if (unlabeled) failures.push(t + ": " + unlabeled + " icon buttons without a label");
  }
  // real-situation log screens (Phrases to review, and the "You say" tab of a situation)
  W.eval("S.ja.real={};S.ja.real['x']=null;delete S.ja.real['x'];realSet('ja',sentText(trip('ja',0)._p.say[0].p),'repeat');libSec=null;view={s:'home'};render()"); tab("Travel"); click("Phrases to review");
  for (const [label, setup] of [["Phrases to review", () => {}], ["You say", () => { W.eval("openTrip(0);view.tt='say';render()"); }]]) {
    setup();
    if (/\p{Extended_Pictographic}/u.test(d.getElementById("main").textContent + d.getElementById("hd").textContent)) failures.push(label + ": emoji found in the interface");
    const primaries = d.querySelectorAll("#main .btn.pri").length; if (primaries > 1) failures.push(label + ": " + primaries + " primary buttons");
    const unlabeled = [...d.querySelectorAll("button")].filter(b => !b.textContent.trim() && !b.getAttribute("aria-label")).length; if (unlabeled) failures.push(label + ": " + unlabeled + " icon buttons without a label");
  }
  // casual speech screens (list, lesson, quiz) with a fixture lesson
  W.eval("CASUAL.ja.length=0;CASUAL.ja.push({t:'Fixture',e:'Explanation.',p:[['私|watashi|I / 。 = I.','俺|ore|I / 。 = I.','a friend'],['私|watashi|I / 。 = I.','僕|boku|I / 。 = I.','a friend']]});S.lang='ja';libSec=null;view={s:'home'};render()"); tab("Practise"); click("Casual speech");
  for (const [label, setup] of [["Casual speech list", () => {}], ["Casual speech lesson", () => { W.eval("openCasual(0)"); }], ["Casual speech quiz", () => { click("Practise this lesson"); }]]) {
    setup();
    if (/\p{Extended_Pictographic}/u.test(d.getElementById("main").textContent + d.getElementById("hd").textContent)) failures.push(label + ": emoji found in the interface");
    const primaries = d.querySelectorAll("#main .btn.pri").length + d.querySelectorAll("#bbar .btn.pri").length; if (primaries > 1) failures.push(label + ": " + primaries + " primary buttons");
    const unlabeled = [...d.querySelectorAll("button")].filter(b => !b.textContent.trim() && !b.getAttribute("aria-label")).length; if (unlabeled) failures.push(label + ": " + unlabeled + " icon buttons without a label");
  }
  W.eval("CASUAL.ja.length=0");
  failures.forEach(f => console.log("FAIL:", f));
  console.log(failures.length ? failures.length + " failure(s)." : "Smoke test OK.");
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.log("FAIL:", e.message); process.exit(1); });
