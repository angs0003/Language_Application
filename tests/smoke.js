/* End-to-end flow test without a database (bundled content). Run: node tests/smoke.js */
const { makeDom, wait, ready, tools } = require("./helpers");
const failures = [];
(async () => {
  const dom = makeDom({ db: null, failures }); await ready(dom);
  const { d, W, M, click, answerUntil, doLesson, startNext, tab } = tools(dom, failures);
  if (W.eval("LS_CONTENT_SOURCE") !== "bundled") failures.push("expected bundled content");
  for (const lang of ["ja", "zh"]) {
    click(lang === "ja" ? "Japanese" : "Chinese"); click("Skip and start");
    for (let round = 0; round < 5; round++) {
      if (W.eval("view.s") !== "home") W.eval("goHome()"); tab("Learn"); startNext(); await wait(5); const s = W.eval("view.s");
      if (s === "lesson") await doLesson();
      else if (s === "story") { click("Answer"); await answerUntil(() => W.eval("view.phase==='done'")); click("Go to home"); }
      else if (s === "trip") { click("Practise this situation"); await answerUntil(() => W.eval("view.k>=view.items.length")); click("Go to home"); }
      else W.eval("goHome()");
    }
    const learned = W.eval(`learnedWords("${lang}").length`);
    if (learned < 10) failures.push(lang + ": expected at least 10 learned words, got " + learned);
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
  failures.forEach(f => console.log("FAIL:", f));
  console.log(failures.length ? failures.length + " failure(s)." : "Smoke test OK.");
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.log("FAIL:", e.message); process.exit(1); });
