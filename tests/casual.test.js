/* Casual speech section: row, list, lesson, quiz, progress and sync. Run: node tests/casual.test.js */
const { mockDB, makeDom, wait, ready, tools } = require("./helpers");
const loadContent = require("../tools/load-content");
const { buildRows } = require("../js/content-rows");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
const FIX = { t: "Talking to friends", e: "With friends, people drop です and ます.", p: [
  ["行|i|go / き|ki|(verb) / ます|masu|(polite) / 。 = I will go.", "行|i|go / く|ku|(verb) / 。 = I’m going.", "a friend"],
  ["食|ta|eat / べ|be|(verb) / ます|masu|(polite) / 。 = I will eat.", "食|ta|eat / べ|be|(verb) / る|ru|(verb) / 。 = I’m eating.", "a friend"],
  ["見|mi|see / ます|masu|(polite) / 。 = I will look.", "見|mi|see / る|ru|(verb) / 。 = I’m looking.", "your sister"],
  ["来|ki|come / ます|masu|(polite) / 。 = I will come.", "来|ku|come / る|ru|(verb) / 。 = I’m coming.", "your brother"]] };
const emoji = s => /\p{Extended_Pictographic}/u.test(s);
(async () => {
  const dom = makeDom({ db: null, failures }); await ready(dom);
  const { d, W, M, click, tab, lang } = tools(dom, failures);
  const designOk = label => {
    check(!emoji(M() + d.getElementById("hd").textContent), label + ": no emoji");
    check(d.querySelectorAll("#bbar .btn.pri").length + d.querySelectorAll("#main .btn.pri").length <= 1, label + ": at most one primary button");
    check([...d.querySelectorAll("button")].every(b => b.textContent.trim() || b.getAttribute("aria-label")), label + ": icon buttons have labels");
  };
  W.eval("CASUAL.ja.length=0");
  lang("ja"); click("Skip and start"); tab("Practise");
  check(!M().includes("Casual speech"), "the row is hidden when there are no lessons");
  W.eval("CASUAL.ja.push(" + JSON.stringify(FIX) + ")"); W.eval("render()");
  check(M().includes("Casual speech") && M().includes("0 of 1 lessons done"), "the row is shown when a lesson exists");
  check(W.eval("CASUAL.zh.length=0;delete CASUAL.zh;casualList('zh').length") === 0, "a missing language list is treated as empty"); W.eval("CASUAL.zh=[]");
  click("Casual speech");
  check(M().includes("Talking to friends") && M().includes("0 of 1 done") && M().includes("4 pairs"), "the list shows the lesson and the count");
  designOk("list");
  click("Talking to friends");
  check(W.eval("view.s") === "casual" && M().includes("With friends, people drop") && M().includes("Polite") && M().includes("Casual (a friend)"), "the lesson shows the explanation and both versions");
  check(d.querySelectorAll("#main .tk").length > 0 && d.querySelectorAll("#main .play").length === 8, "words are tappable and each version has a play button");
  designOk("lesson");
  check(d.getElementById("nextbtn").textContent === "Practise this lesson", "the primary action is Practise this lesson");
  click("Practise this lesson");
  check(W.eval("view.mode") === "quiz" && W.eval("view.items.length") === 8, "the quiz has 8 questions from 4 pairs");
  designOk("quiz");
  // correct answer
  const pick = i => d.querySelectorAll("#main .opt:not(.dk)")[i].click();
  pick(W.eval("view.items[view.k].ans")); click("Check answer");
  check(W.eval("view.items[0].correct") === true && !!d.querySelector("#fbp .fb.ok"), "a correct answer shows green feedback in the bottom panel");
  click("Continue");
  // wrong answer
  pick(1 - W.eval("view.items[view.k].ans")); click("Check answer");
  check(W.eval("view.items[1].correct") === false && !!d.querySelector("#fbp .fb"), "a wrong answer shows feedback");
  click("Continue");
  // I do not know
  click("I do not know"); check(W.eval("view.items[2].dk") === true && W.eval("view.items[2].correct") === false, "I do not know is available and counts as incorrect");
  click("Continue");
  check(W.eval("S.ja.mis.length") === 0, "wrong answers are not added to Mistakes");
  click("Back"); check(W.eval("view.k") === 2, "Back shows an earlier question"); click("Continue");
  for (let k = W.eval("view.k"); k < 8; k++) { W.eval("solve(view.items[view.k])"); click("Check answer"); click("Continue"); }
  check(M().includes("Practice finished") && M().includes("Correct: 6 of 8"), "the quiz ends with a result");
  check(W.eval("!!S.ja.casualDone[0]") === true, "the lesson is marked done");
  click("Back to the list");
  check(W.eval("view.s") === "lib" && M().includes("1 of 1 done") && !!d.querySelector(".lrow .st-ok"), "the list shows the done mark");
  check(W.eval("normalize({v:1,ja:{casualDone:[1]}}).ja.casualDone") !== null && Object.keys(W.eval("normalize({v:1}).zh.casualDone")).length === 0, "old saved state loads with an empty casualDone");
  // sync
  const store = {}; mockDB(store, null);
  store.tables.content = buildRows(loadContent(), "v-test");
  const user = { id: "user-1", email: "ae@example.com" };
  const a = makeDom({ db: mockDB(store, user), failures }); await ready(a); await wait(100);
  const A = tools(a, failures);
  A.lang("ja"); A.click("Skip and start");
  A.W.eval("CASUAL.ja.length=0");
  A.W.eval("CASUAL.ja.push(" + JSON.stringify(FIX) + ")");
  A.W.eval("casualMark('ja',0)"); await wait(2200);
  const T = store.tables;
  check(!!T.user_settings[0].data.per.ja.casualDone[0], "the done mark is saved in the database");
  const b = makeDom({ db: mockDB(store, user), failures }); await ready(b); await wait(300);
  const B = tools(b, failures);
  check(!!B.W.eval("S.ja.casualDone[0]"), "device B receives the done mark");
  failures.forEach(f => console.log("FAIL:", f));
  console.log(failures.length ? failures.length + " failure(s)." : "Casual test OK.");
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.log("FAIL:", e.message); process.exit(1); });
