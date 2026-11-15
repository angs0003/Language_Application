/* Tests for review timing: hard words (lapses) come back sooner, kanji early practice, sync of lapses.
   Run: node tests/review-timing.test.js */
const { mockDB, makeDom, wait, ready, tools } = require("./helpers");
const loadContent = require("../tools/load-content");
const { buildRows } = require("../js/content-rows");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
(async () => {
  const store = {}; mockDB(store, null); store.tables.content = buildRows(loadContent(), "v-test");
  const user = { id: "u-rt", email: "ae@example.com" };
  const dom = makeDom({ db: mockDB(store, user), failures }); await ready(dom); await wait(100);
  const { W, lang, click } = tools(dom, failures);
  const E = s => W.eval(s);
  const DAY = 864e5;
  const near = (a, days) => Math.abs(a - Date.now() - days * DAY) < 60000;
  lang("ja"); click("Skip and start");

  // 1. Lapses
  E("globalThis.t1={b:3,d:Date.now()+1e6}; srsStep(t1,false); srsStep(t1,false);");
  check(E("t1.lp") === 1 && E("t1.b") === 1 && E("t1.d") === 0, "2 wrong answers in a row on a box-3 word add 1 lapse");
  E("globalThis.t2={b:3,d:Date.now()-1000,lp:1}; srsStep(t2,true);");
  check(E("t2.b") === 4 && near(E("t2.d"), 8), "with 1 lapse a correct due answer at box 3 keeps the normal gap (box 4, 8 days)");
  E("globalThis.t3={b:2,d:Date.now()-1000,lp:1}; srsStep(t3,true);");
  check(E("t3.b") === 3 && near(E("t3.d"), 4), "with 1 lapse box 3 is still 4 days");
  E("globalThis.t4={b:2,d:Date.now()-1000,lp:2}; srsStep(t4,true);");
  check(E("t4.b") === 3 && near(E("t4.d"), 2), "after 2 lapses a correct due answer to box 3 sets due 2 days ahead");
  E("globalThis.t5={b:0,d:Date.now()-1000,lp:5}; srsStep(t5,true);");
  check(E("t5.b") === 1 && near(E("t5.d"), 1), "the gap is never less than 1 day");
  E("globalThis.t6={b:3,d:Date.now()+5*864e5,lp:0}; srsStep(t6,true);");
  check(E("t6.b") === 3 && near(E("t6.d"), 5), "a correct answer before the due date keeps box and due date");

  // 2. Kanji early practice
  E("S.ja.kanji={};S.ja.kanji['私']={b:3,d:Date.now()+5*864e5}; kSet('kanji','私',true);");
  check(E("S.ja.kanji['私'].b") === 3 && near(E("S.ja.kanji['私'].d"), 5), "kSet at box 3 and not due keeps box and due date");
  E("S.ja.kanji['学']={b:1,d:Date.now()+864e5}; kSet('kanji','学',true);");
  check(E("S.ja.kanji['学'].b") === 2 && near(E("S.ja.kanji['学'].d"), 2), "kSet at box 1 and not due goes to box 2");
  E("S.ja.kanji['校']={b:3,d:Date.now()+5*864e5}; kSet('kanji','校',false);");
  check(E("S.ja.kanji['校'].b") === 1 && E("S.ja.kanji['校'].d") === 0 && E("S.ja.kanji['校'].lp") === 1, "kSet wrong gives box 1, due now, lapse +1");
  E("delete S.ja.kanji['新'];kSet('kanji','新',true);");
  check(E("S.ja.kanji['新'].b") === 1, "kSet on a new kanji goes to box 1");

  // 3. gradeCard counts a lapse on the saved entry
  E("S.ja.saved=[{w:'テスト',r:'',m:'test',s:'',src:'',b:3,d:Date.now()-1000,t:1,u:1}];view={s:'cards',list:S.ja.saved,k:0,res:[],show:false};gradeCard(view,false);");
  check(E("S.ja.saved[0].lp") === 1 && E("S.ja.saved[0].b") === 1, "gradeCard on a saved word counts a lapse on the saved entry");

  // 4. normalize
  E(`globalThis.nz=normalize({ja:{srs:{a:{b:1,d:0,lp:-1},b:{b:1,d:0,lp:"x"},c:{b:1,d:0,lp:3},d:{b:1,d:0,lp:1.5}},saved:[{w:'x',lp:-2},{w:'y',lp:4}],kana:{'あ':{b:1,d:0,lp:"q"}},kanji:{'私':{b:1,d:0,lp:2}}}})`);
  check(E("!('lp' in nz.ja.srs.a) && !('lp' in nz.ja.srs.b) && !('lp' in nz.ja.srs.d)"), "normalize removes lp of -1, \"x\" and 1.5");
  check(E("nz.ja.srs.c.lp") === 3 && E("nz.ja.saved[1].lp") === 4 && E("nz.ja.kanji['私'].lp") === 2, "normalize keeps valid lp");
  check(E("!('lp' in nz.ja.saved[0]) && !('lp' in nz.ja.kana['あ'])"), "normalize removes bad lp on saved and kana entries");

  // 5. stateRows and mergeRemote
  const st = E(`JSON.stringify(stateRows(normalize({ja:{srs:{'猫':{b:2,d:5000,u:5000,lp:3}},saved:[{w:'犬',r:'いぬ',m:'dog',s:'',src:'',b:1,d:6000,t:6000,u:6000,lp:2}],kana:{'あ':{b:2,d:7000,u:7000,lp:1}},kanji:{'私':{b:1,d:8000,u:8000,lp:4}}}}),'u1').words)`);
  const rows = JSON.parse(st), row = (l, w) => rows.find(r => r.lang === l && r.word === w);
  check(row("ja", "猫").lapses === 3 && row("ja", "猫").saved_lapses === 0, "stateRows writes lapses for a word");
  check(row("ja", "犬").saved_lapses === 2 && row("ja", "犬").lapses === 0, "stateRows writes saved_lapses for a saved word");
  check(row("ja-kana", "あ").lapses === 1 && row("ja-kanji", "私").lapses === 4 && row("ja-kanji", "私").saved_lapses === 0, "stateRows writes lapses for kana and kanji");
  E(`globalThis.mr=mergeRemote(normalize({}),${JSON.stringify(rows)},[],null)`);
  check(E("mr.ja.srs['猫'].lp") === 3, "mergeRemote restores lp of a word");
  check(E("mr.ja.saved.find(x=>x.w==='犬').lp") === 2, "mergeRemote restores lp of a saved word");
  check(E("mr.ja.kanji['私'].lp") === 4 && E("mr.ja.kana['あ'].lp") === 1, "mergeRemote restores lp of kanji and kana");
  const old = { user_id: "u1", lang: "ja", word: "鳥", box: 2, due: new Date(9000).toISOString(), saved: false, updated_at: new Date(9000).toISOString() };
  E(`globalThis.mo=mergeRemote(normalize({}),[${JSON.stringify(old)}],[],null)`);
  check(E("mo.ja.srs['鳥'].lp") === 0, "a row without a lapses key merges as lp 0");
  const a = E(`JSON.stringify(cmpW(${JSON.stringify(old)}))`), b = E(`JSON.stringify(cmpW(Object.assign({},${JSON.stringify(old)},{lapses:0,saved_lapses:0})))`);
  check(a === b, "cmpW treats a row without lapses as unchanged against lapses 0");
  const c2 = E(`JSON.stringify(cmpW(Object.assign({},${JSON.stringify(old)},{lapses:1})))`);
  check(a !== c2, "cmpW sees a changed lapses value");

  // 6. Simulated database round trip between two devices
  E("S.ja.srs['猫']={b:2,d:Date.now()+864e5,u:Date.now(),lp:3};save();"); await wait(2200);
  const dbRow = store.tables.word_progress.find(r => r.word === "猫" && r.lang === "ja");
  check(!!dbRow && dbRow.lapses === 3, "the database row of the word holds lapses 3");
  const dom2 = makeDom({ db: mockDB(store, user), failures }); await ready(dom2); await wait(300);
  const W2 = tools(dom2, failures).W;
  check(W2.eval("S.ja.srs['猫'].lp") === 3, "a second device receives lp 3");

  if (failures.length) { console.log("\nFAILED:\n" + failures.join("\n")); process.exit(1); }
  console.log("\nAll review timing tests passed.");
  process.exit(0);
})();
