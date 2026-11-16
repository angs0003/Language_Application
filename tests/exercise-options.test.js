/* Wrong options never repeat a right answer; Japanese words are spoken from kana; typing accepts z/j for dz/dj. Run: node tests/exercise-options.test.js */
const { makeDom, ready, tools } = require("./helpers");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
(async () => {
  const dom = makeDom({ db: null, failures }); await ready(dom);
  const { W, click, lang } = tools(dom, failures);
  lang("ja"); click("Skip and start");
  // synonyms: "to help" vs "to help, to rescue"
  W.eval("CUR.ja[0].words.push({w:'助けるX',k:'たすけるx',r:'tasukeru x',m:'to help, to rescue'},{w:'手伝うX',k:'てつだうx',r:'tetsudau x',m:'To help (someone)'});");
  const bad = W.eval(`(()=>{let n=0;const w={w:'手伝うY',k:'てつだうy',r:'tetsudau y',m:'to help'};for(let i=0;i<150;i++){const q=mkQ('meaning',w,'ja');if(q.opts.some(o=>o!==w&&/help/i.test(o.m)))n++;}return n;})()`);
  check(bad === 0, "meaning question never offers a synonym (shared comma part) as a wrong option");
  W.eval("CUR.ja[0].words.length-=2");
  check(W.eval("sameMeaning('repair','to fix, to repair')") === true && W.eval("sameMeaning('to eat','to drink')") === false && W.eval("sameMeaning('bank (money)','bank (river)')") === true, "sameMeaning compares comma parts and ignores bracketed text");
  // homophones in listen questions
  const hom = W.eval(`(()=>{const ws=allWords('ja'),by={};ws.forEach(x=>{if(x.k)(by[x.k]=by[x.k]||[]).push(x);});const g=Object.values(by).find(a=>a.length>1);if(!g)return -1;let n=0;for(let i=0;i<150;i++){const q=mkQ('listen',g[0],'ja');if(q.opts.some(o=>o!==g[0]&&o.k===g[0].k))n++;}return n;})()`);
  check(hom === 0 || hom === -1, "listen question never offers a homophone (same kana) as a wrong option (" + hom + ")");
  // kanji quiz
  const kj = W.eval(`(()=>{let n=0;KJ().forEach(k=>{for(let r=0;r<3;r++){kanjiQuestions([k]).forEach(q=>{if(q.question&&q.question.startsWith('Which kanji')){q.opts.forEach((o,i)=>{if(i===q.ans)return;const x=KJ().find(y=>y.c===o.text);if(x&&x.m.some(m=>k.m.some(t=>t.toLowerCase()===m.toLowerCase())))n++;});}});}});return n;})()`);
  check(kj === 0, "Which kanji quiz never offers a kanji that shares a meaning with the target (" + kj + ")");
  // speech uses kana
  W.eval("window.__s=[];speechSynthesis.speak=u=>{__s.push(u.text);};window.__w=allWords('ja').find(x=>x.k&&x.k!==x.w);");
  W.eval("sayWord(__w,'ja')");
  check(W.eval("__s[0]===__w.k"), "sayWord speaks the kana of a Japanese word");
  W.eval("__s.length=0;sayText(__w.w,'ja')");
  check(W.eval("__s[0]===__w.k"), "sayText speaks the kana when the text is a known Japanese word");
  W.eval("__s.length=0;S.settings.autoRead=true;view={s:'review',qs:[mkQ('meaning',__w,'ja')],i:0,finished:false};readQuestion()");
  check(W.eval("__s[0]===__w.k"), "question autoplay speaks the kana");
  W.eval("__s.length=0;sayWord({w:'你好',r:'ni hao'},'zh')");
  check(W.eval("__s[0]==='你好'"), "Chinese is spoken unchanged");
  // typing
  check(W.eval("readingMatch('ja','tsuzukeru',{w:'続ける',k:'つづける',r:'tsudzukeru'})"), "typing tsuzukeru is accepted for tsudzukeru");
  check(W.eval("readingMatch('ja','tsudzukeru',{w:'続ける',k:'つづける',r:'tsudzukeru'})"), "typing tsudzukeru is accepted");
  check(W.eval("readingMatch('ja','chijimu',{w:'縮む',k:'ちぢむ',r:'chidjimu'})"), "typing chijimu is accepted for chidjimu");
  check(W.eval("readingMatch('ja','toukyou',{w:'東京',k:'とうきょう',r:'tokyo'})"), "ou and o are equal");
  check(!W.eval("readingMatch('ja','tsukeru',{w:'続ける',k:'つづける',r:'tsudzukeru'})"), "a different word is still rejected");
  check(W.eval("WHOLE_READING.has('今年')&&WHOLE_READING.has('時計')"), "今年 and 時計 are whole-word readings");
  if (failures.length) { console.log("FAILURES:\n" + failures.join("\n")); process.exit(1); }
  console.log("exercise-options tests passed"); process.exit(0);
})();
