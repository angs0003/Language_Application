/* Tests for kana lessons, kanji lessons, fading furigana, the TV list and kanji sync. Run: node tests/kanji.test.js */
const { mockDB, makeDom, wait, ready, tools } = require("./helpers");
const loadContent = require("../tools/load-content");
const { buildRows } = require("../js/content-rows");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
async function solveAll(W, click) { for (let k = 0; k < 60 && !W.eval("view.finished"); k++) { W.eval("solve(view.q)"); if (!W.eval("view.q.answered")) click("Check answer"); click("Continue"); } }
(async () => {
  const store = {}; mockDB(store, null); store.tables.content = buildRows(loadContent(), "v-test");
  const user = { id: "u-k", email: "ae@example.com" };
  const dom = makeDom({ db: mockDB(store, user), failures }); await ready(dom); await wait(100);
  const { d, W, M, click, tab } = tools(dom, failures);
  // conversions
  const conv = { watashi: "わたし", gakkou: "がっこう", konnichiwa: "こんにちわ", isshuukan: "いっしゅうかん", juppun: "じゅっぷん", "kin'youbi": "きんようび", "benkyou shimasu": "べんきょうします" };
  for (const [r, h] of Object.entries(conv)) check(W.eval(`toHira(${JSON.stringify(r)})`) === h, `romaji ${r} converts to ${h}`);
  check(W.eval('toRomaji("しょく")') === "shoku" && W.eval('toRomaji("がっこう")') === "gakkou" && W.eval('toRomaji("わたし")') === "watashi", "kana readings convert to Hepburn romaji");
  // section visibility
  click("Chinese"); click("Skip and start"); tab("Practise"); check(!M().includes("Kana"), "Kanji and kana are hidden for Chinese");
  tab("Learn"); click("Japanese"); click("Skip and start"); tab("Practise"); click("Kana"); check(M().includes("Hiragana: 0 of 71"), "Kana screen shows hiragana progress");
  W.eval("openSub('kanji')"); check(M().includes("Kanji: 0 of 261"), "Kanji screen shows kanji progress");
  // kana lesson
  W.eval("startKana('hira',0)"); check(W.eval("view.s") === "kana" && M().includes("あ"), "kana lesson shows the first character");
  for (let i = 0; i < 4; i++) click("Next character");
  click("Practise these 5"); await solveAll(W, click);
  W.eval("startKana('hira',0)"); for (let i = 0; i < 4; i++) click("Next character"); click("Practise these 5"); await solveAll(W, click);
  check(W.eval("kanaLearned('あ')") === true, "a kana character counts as learned after 2 correct practices");
  // kanji lesson
  W.eval("openSub('kanji')"); click("Learn the next 5 kanji"); check(W.eval("view.s") === "klearn" && W.eval("view.list[0].c") === "私", "kanji lesson starts with 私");
  click("Show the stroke order"); check(d.getElementById("prog").textContent.includes("Kanji 1 of 5") && M().includes("Stroke 1 of 7"), "stroke order shows stroke 1 of 7 for 私");
  [...d.querySelectorAll("#main button")].filter(b=>b.textContent.includes("Stroke")&&!b.disabled).pop().click(); check(M().includes("Stroke 2 of 7"), "next stroke button advances");
  for (let i = 0; i < 4; i++) click("Next kanji");
  click("Practise these 5"); check(W.eval("view.qs.some(q=>q.question&&q.question.startsWith('How do you read'))"), "practice includes reading-in-a-word questions");
  await solveAll(W, click);
  check(W.eval("Object.keys(S.ja.kanji).length") === 5, "5 kanji have review timing after the lesson");
  // furigana fades
  W.eval("openChapter(1)");
  check(!!d.querySelector("ruby"), "furigana appears above kanji that are not learned");
  W.eval("S.ja.kanji['私']={b:2,d:Date.now()+9e9,u:Date.now()};render()");
  const rubies = [...d.querySelectorAll("ruby")].map(x => x.textContent);
  check(!rubies.some(t => t.startsWith("私")), "furigana disappears for a learned kanji");
  W.eval("S.settings.furi='never';render()"); check(!d.querySelector("ruby"), "furigana can be switched off");
  W.eval("S.settings.furi='fade';save()");
  // TV list
  W.eval("libSec=null;view={s:'home'};render()"); tab("Listen"); check(M().includes("TV and documentaries") && M().includes("IMDb 8.4"), "Listen shows TV recommendations with ratings");
  // sync of kanji progress to a second device
  await wait(2200);
  check(store.tables.word_progress.some(r => r.lang === "ja-kanji" && r.word === "私"), "kanji progress is saved to the database");
  const b = makeDom({ db: mockDB(store, user), failures }); await ready(b); await wait(300);
  check(b.window.eval("Object.keys(S.ja.kanji).length") === 5 && b.window.eval("kanaLearned('あ')"), "second device gets kanji and kana progress");
  failures.forEach(f => console.log("FAIL:", f));
  console.log(failures.length ? failures.length + " failure(s)." : "Kanji test OK.");
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.log("FAIL:", e.message); process.exit(1); });
