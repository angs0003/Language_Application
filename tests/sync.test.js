/* Database test: sign-in screen, content loaded from the database, and progress synced
   between two devices through a simulated Supabase database. Run: node tests/sync.test.js */
const { mockDB, makeDom, wait, ready, tools } = require("./helpers");
const loadContent = require("../tools/load-content");
const { buildRows } = require("../js/content-rows");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
(async () => {
  const store = {}; mockDB(store, null);
  store.tables.content = buildRows(loadContent(), "v-test");
  // 1. Signed out: the sign-in screen is shown and the app does not start.
  const d0 = makeDom({ db: mockDB(store, null), failures }); await wait(300);
  check(d0.window.document.getElementById("main").textContent.includes("Send sign-in link"), "signed-out user sees the sign-in screen");
  check(d0.window.eval("typeof render") === "undefined", "app does not start before sign-in");
  // 2. Device A: content from the database, do a lesson, save a word, read a chapter.
  const user = { id: "user-1", email: "ae@example.com" };
  const a = makeDom({ db: mockDB(store, user), failures }); await ready(a); await wait(100);
  const A = tools(a, failures);
  check(A.W.eval("LS_CONTENT_SOURCE") === "database", "device A loads content from the database");
  A.click("Japanese"); A.click("Skip and start"); A.startNext(); await wait(5); await A.doLesson();
  A.W.eval("openChapter(0)"); A.d.querySelector(".tk:not(.pu)").click(); A.click("Save word");
  A.W.eval("S.ja.chRead.push(0);save()");
  await wait(2200);
  const T = store.tables;
  check(T.word_progress.filter(r => r.user_id === "user-1").length >= 5, "word progress rows were saved");
  check(T.word_progress.some(r => r.saved), "saved word row was saved");
  check(T.activity.some(r => r.kind === "chapter" && r.key === "0"), "chapter activity row was saved");
  check(T.user_settings.length === 1, "settings row was saved");
  const learnedA = A.W.eval('learnedWords("ja").length'), savedA = A.W.eval("S.ja.saved.length");
  // 3. Device B (empty device, same account): gets the same progress.
  const b = makeDom({ db: mockDB(store, user), failures }); await ready(b); await wait(300);
  const B = tools(b, failures);
  check(B.W.eval('learnedWords("ja").length') === learnedA, "device B has the same learned words (" + learnedA + ")");
  check(B.W.eval("S.ja.saved.length") === savedA, "device B has the same saved words");
  check(B.W.eval("S.ja.chRead.includes(0)"), "device B has the chapter marked as read");
  check(B.W.eval("S.ja.placed") === true, "device B has the placement setting");
  // 4. Removing a saved word on device B updates the database.
  const w = B.W.eval("S.ja.saved[0].w");
  B.W.eval("S.ja.saved.splice(0,1);save()"); await wait(2200);
  const row = T.word_progress.find(r => r.word === w);
  check(!row || row.saved === false, "removed saved word is no longer saved in the database");
  failures.forEach(f => console.log("FAIL:", f));
  console.log(failures.length ? failures.length + " failure(s)." : "Sync test OK.");
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.log("FAIL:", e.message); process.exit(1); });
