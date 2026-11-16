/* Wrong options never repeat a right answer; Japanese words are spoken from kana; typing accepts z/j for dz/dj. Run: node tests/exercise-options.test.js */
const { makeDom, ready, tools } = require("./helpers");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
(async () => {
  const dom = makeDom({ db: null, failures }); await ready(dom);
  const { W, click, lang } = tools(dom, failures);
  const E = c => { try { return W.eval(c); } catch (e) { return undefined; } };
  lang("ja"); click("Skip and start");
  // fixed word set: target + a bad option + 2 good ones, so the old code offers the bad option every time
  const setWords = ws => E("window.__cur=CUR.ja;CUR.ja=[{title:'T',words:" + JSON.stringify(ws) + "}]");
  const restore = () => E("CUR.ja=window.__cur");
  const W_ = (w, k, m) => ({ w, k, r: k, m });
  const run = (ws, kind) => { setWords(ws); const r = E(`(()=>{const t=allWords('ja')[0];let bad=0;for(let i=0;i<20;i++){const q=mkQ('${kind}',t,'ja');if(q.opts.some(o=>o!==t&&o.bad))bad++;}return bad;})()`); restore(); return r; };
  const bd = (w, k, m) => ({ ...W_(w, k, m), bad: true });
  check(run([W_("手伝う", "てつだう", "to help"), bd("助ける", "たすける", "to help, to rescue"), W_("食べる", "たべる", "to eat"), W_("飲む", "のむ", "to drink")], "meaning") === 0, "synonym 助ける (to help, to rescue) is never offered for 手伝う (to help)");
  check(run([W_("直す", "なおす", "repair"), bd("修理する", "しゅうりする", "to fix, to repair"), W_("食べる", "たべる", "to eat"), W_("飲む", "のむ", "to drink")], "meaning") === 0, "synonym 'to fix, to repair' is never offered for 'repair'");
  check(E("sameMeaning('repair','to fix, to repair')") === true && E("sameMeaning('to eat','to drink')") === false && E("sameMeaning('bank (money)','bank (river)')") === true, "sameMeaning compares comma parts and ignores bracketed text");
  check(run([W_("橋", "はし", "bridge"), bd("箸", "はし", "chopsticks"), W_("食べる", "たべる", "to eat"), W_("飲む", "のむ", "to drink")], "listen") === 0, "homophone 箸 is never offered for 橋 in a Listen question");
  check(run([W_("橋", "はし", "bridge"), bd("箸", "はし", "chopsticks"), W_("食べる", "たべる", "to eat"), W_("飲む", "のむ", "to drink")], "meaning") === 20, "a homophone is still allowed in a meaning question (only Listen rejects it)");
  // kanji quiz: fixed kanji set
  E("window.__kj=KANJI_JA.slice();KANJI_JA.length=0;KANJI_JA.push({c:'人',m:['Person']},{c:'者',m:['Someone','Person']},{c:'水',m:['Water']},{c:'火',m:['Fire']})");
  const kj = E(`(()=>{let n=0;const k=KJ()[0];for(let i=0;i<20;i++){kanjiQuestions([k]).forEach(q=>{if(q.question&&q.question.startsWith('Which kanji')&&q.opts.some(o=>o.text==='者'))n++;if(q.question==='What does this kanji mean?'&&q.opts.some(o=>/Someone/.test(o.text)))n++;});}return n;})()`);
  E("KANJI_JA.length=0;__kj.forEach(x=>KANJI_JA.push(x))");
  check(kj === 0, "kanji quiz never offers 者 (Someone, Person) for 人 (Person)");
  // speech uses kana
  E("window.__s=[];speechSynthesis.speak=u=>{__s.push(u.text);};window.__w=allWords('ja').find(x=>x.k&&x.k!==x.w);");
  E("sayWord(__w,'ja')");
  check(E("__s[0]===__w.k"), "sayWord speaks the kana of a Japanese word");
  E("__s.length=0;sayText(__w.w,'ja')");
  check(E("__s[0]===__w.k"), "sayText speaks the kana when the text is a known Japanese word");
  E("__s.length=0;S.settings.autoRead=true;view={s:'review',qs:[mkQ('meaning',__w,'ja')],i:0,finished:false};readQuestion()");
  check(E("__s[0]===__w.k"), "question autoplay speaks the kana");
  E("__s.length=0;sayWord({w:'你好',r:'ni hao'},'zh')");
  check(E("__s[0]==='你好'"), "Chinese is spoken unchanged");
  // typing
  check(E("readingMatch('ja','tsuzukeru',{w:'続ける',k:'つづける',r:'tsudzukeru'})"), "typing tsuzukeru is accepted for tsudzukeru");
  check(E("readingMatch('ja','tsudzukeru',{w:'続ける',k:'つづける',r:'tsudzukeru'})"), "typing tsudzukeru is accepted");
  check(E("readingMatch('ja','chijimu',{w:'縮む',k:'ちぢむ',r:'chidjimu'})"), "typing chijimu is accepted for chidjimu");
  check(E("readingMatch('ja','toukyou',{w:'東京',k:'とうきょう',r:'tokyo'})"), "ou and o are equal");
  check(!E("readingMatch('ja','tsukeru',{w:'続ける',k:'つづける',r:'tsudzukeru'})"), "a different word is still rejected");
  check(E("WHOLE_READING.has('今年')&&WHOLE_READING.has('時計')"), "今年 and 時計 are whole-word readings");
  if (failures.length) { console.log("FAILURES:\n" + failures.join("\n")); process.exit(1); }
  console.log("exercise-options tests passed"); process.exit(0);
})();
