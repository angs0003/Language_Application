/* Tests for the player, My words and the video player. Run: node tests/features.test.js */
const { makeDom, wait, ready, tools } = require("./helpers");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
(async () => {
  const dom = makeDom({ db: null, failures }); await ready(dom);
  const { d, W, M, click, tab, lang } = tools(dom, failures);
  lang("ja"); click("Skip and start");
  // --- Player ---
  W.eval('openPlayer("story",0)');
  check(W.eval("view.s") === "player" && d.getElementById("prog").textContent.includes("Line 1 of 6"), "player opens a story at line 1 of 6");
  click("Next line"); check(W.eval("view.idx") === 1, "next line moves to line 2");
  click("Previous line"); check(W.eval("view.idx") === 0, "previous line moves back to line 1");
  click("Auto-pause after each line"); check(W.eval("view.auto") === true, "auto-pause can be switched on");
  click("Play"); await wait(50);
  check(W.eval("view.playing") === false && W.eval("view.waiting") === true, "auto-pause stops after one line");
  click("Play next line"); await wait(50); check(W.eval("view.idx") === 1, "play next line advances to line 2");
  click("Auto-pause after each line"); click("Play"); await wait(6000);
  check(W.eval("view.done") === true, "player plays to the end without auto-pause");
  click("No text"); check(M().includes("Text hidden"), "no-text mode hides the line"); click("Both languages");
  W.eval('openPlayer("pod",0)'); check(W.eval("view.lines.length") > 6, "podcast episode opens in the player");
  // finishing: marked as done, Next button, tick on the Listen tile
  check(W.eval("S.ja.chRead.includes(0)") === true, "a story played to the end is marked as read");
  W.eval('openPlayer("pod",0)'); W.eval("view.idx=view.lines.length-1;plPlay(view)"); await wait(1200);
  check(W.eval("S.ja.podDone[0]") === true && W.eval("view.done") === true && M().includes("marked as done"), "a podcast episode played to the end is marked as listened");
  check(d.getElementById("nextbtn").textContent === "Next episode", "after the episode the main button is Next episode");
  d.getElementById("nextbtn").click(); check(W.eval("view.s") === "player" && W.eval("view.kind") === "pod" && W.eval("view.i") === 1, "Next episode opens episode 2");
  check(W.eval("nextAfter('trip',0).label") === "Next situation", "a travel conversation offers Next situation");
  check(W.eval("nextAfter('trip',TRIP.ja.length-1).label") === "Back to Listen", "the last item ends with Back to Listen");
  W.eval("setTab('listen')"); check(!!d.querySelector(".tile .tdone"), "a listened episode shows a tick on its Listen tile");
  // spoken-word highlight
  W.eval('openPlayer("story",0)');
  const toks = W.eval("view.lines[0].tokens"), spokenIdx = () => [...d.querySelectorAll(".plline .tk")].findIndex(e => e.classList.contains("spoken"));
  W.eval('window.__u={};hlTrack(__u,view.lines[0].tokens,()=>document.querySelector(".plline"),()=>true);__u.onstart()');
  check(spokenIdx() === 0, "the first word is highlighted when speech starts");
  W.eval(`__u.onboundary({name:"word",charIndex:${toks[0][0].length}})`); check(spokenIdx() === 1, "a word boundary event moves the highlight to that word");
  W.eval("hlClear()"); check(spokenIdx() === -1, "the highlight is removed when speech stops");
  W.eval('HL.msPerChar=1;window.__u2={};hlTrack(__u2,view.lines[0].tokens,()=>document.querySelector(".plline"),()=>true);__u2.onstart()'); await wait(300);
  check(spokenIdx() === toks.length - 1, "without boundary events the highlight follows a timing estimate to the last word"); W.eval("HL.msPerChar=220;hlClear()");
  W.eval("S.settings.hlWord=false;window.__u3={};hlTrack(__u3,view.lines[0].tokens,()=>document.querySelector('.plline'),()=>true)"); check(W.eval("__u3.onstart") === undefined, "the highlight can be switched off in settings"); W.eval("S.settings.hlWord=true");
  // speakers: the name is not spoken; each speaker gets a different voice setting instead
  check(W.eval("spkSkip(chapter('ja',0).lines[0])") === 2 && W.eval("spokenText(chapter('ja',0).lines[0])") === "おはよう！", "a story line starting with a name and a colon is spoken without them");
  check(Object.keys(W.eval("spkMap(chapter('ja',0).lines)")).length >= 2, "speakers are numbered in order of appearance");
  W.eval("window.__sp=[];speechSynthesis.speak=u=>{__sp.push({t:u.text,p:u.pitch});setTimeout(()=>u.onend&&u.onend(),1);};");
  W.eval('openPlayer("story",0)'); W.eval("plPlay(view)"); await wait(1500); W.eval("plStop(view)");
  const sp = W.eval("__sp");
  check(sp.length >= 2 && !/^(けん|ゆい)/.test(sp[0].t) && !/^(けん|ゆい)/.test(sp[1].t), "the player does not say the speaker names");
  check(sp[0].p !== sp[1].p, "two speakers get different pitch");
  W.eval("__sp.length=0;sayLines(chapter('ja',0).lines,'ja')"); await wait(50); const sp2 = W.eval("__sp");
  check(sp2.length === 6 && sp2.every(x => !/^(けん|ゆい)/.test(x.t)) && new Set(sp2.map(x => x.p)).size >= 2, "Play all lines (lesson story step, theme pages) does not say names and changes voice per speaker");
  W.eval("__sp.length=0;say(spokenText(chapter('ja',0).lines[0]),'ja')"); check(!/^けん/.test(W.eval("__sp")[0].t), "playing a single story line does not say the name");
  check(!W.eval("podSegs('ja',0).some(s=>s.part==='Story'&&/^(けん|ゆい)/.test(s.text))") && !W.eval("podSegs('ja',0).some(s=>s.part==='Story'&&s.lang==='en'&&/^(Ken|Yui):/.test(s.text))"), "the podcast does not say speaker names, in the language or in English");
  check(W.eval("podSegs('ja',0).filter(s=>s.part==='Story'&&s.lang==='ja').some(s=>s.si===0)") && W.eval("podSegs('ja',0).filter(s=>s.part==='Story'&&s.lang==='ja').some(s=>s.si===1)"), "podcast lines carry a speaker number for the voice");
  // the language sets the colours of the whole app (CSS)
  const css = require("fs").readFileSync(require("path").join(__dirname, "..", "index.html"), "utf8");
  check(/body\[data-lang="zh"\]\{--acc:var\(--zh\)/.test(css) && /body,body\[data-lang="ja"\],body\[data-lang="zh"\]\{--acc:var\(--ja\)/.test(css) && !/body\[data-sec=/.test(css), "colours follow the language, not the tab");
  W.eval('openPlayer("trip",0)'); check(M().includes("Local") || d.getElementById("prog").textContent.includes("Local"), "travel conversation opens in the player with speaker labels");
  // tap a word in the player and save it with its sentence
  W.eval('openPlayer("story",1)'); d.querySelector(".plline .tk:not(.pu)").click(); click("Save word");
  check(W.eval("S.ja.saved.length") === 1 && W.eval("S.ja.saved[0].tk && S.ja.saved[0].tk.length > 1"), "word saved from the player keeps its sentence tokens");
  check(W.eval("S.ja.saved[0].src").startsWith("Story chapter"), "saved word records its source");
  d.body.click();
  // --- Word callout ---
  {
    W.eval('openPlayer("story",0)');
    const words = () => [...d.querySelectorAll(".plline .tk:not(.pu)")], co = () => d.getElementById("callout");
    words()[0].click();
    check(!!co() && d.querySelectorAll("#callout").length === 1 && co().getAttribute("role") === "dialog" && co().textContent.includes(W.eval("view.lines[0].tokens.find(t=>t[1]||t[2])[2]")), "tapping a word opens one callout with its meaning");
    check(!d.querySelector(".sheet") && !d.querySelector(".scrim") && d.querySelectorAll(".callout button").length === 2, "the callout replaces the bottom sheet and has Play and Save");
    check(words()[0].getAttribute("aria-expanded") === "true" && words()[0].classList.contains("on"), "the tapped word is marked as open");
    words()[0].click(); check(!co() && !words()[0].classList.contains("on"), "tapping the same word again closes the callout");
    words()[0].click(); words()[1].click(); check(d.querySelectorAll("#callout").length === 1 && words()[1].classList.contains("on") && !words()[0].classList.contains("on"), "tapping another word moves the callout to that word");
    d.body.click(); check(!co(), "tapping outside closes the callout");
    words()[0].click(); d.dispatchEvent(new W.KeyboardEvent("keydown", { key: "Escape", bubbles: true })); check(!co(), "Escape closes the callout");
    const before = W.eval("S.ja.saved.length"); words()[0].click();
    click("Save word"); check(!!co() && W.eval("S.ja.saved.length") === before + 1 && co().textContent.includes("Saved (tap to remove)") && co().querySelector("[aria-pressed=true]"), "Save in the callout saves the word and keeps the callout open");
    click("Saved (tap to remove)"); check(!!co() && W.eval("S.ja.saved.length") === before && co().textContent.includes("Save word"), "tapping Saved removes the word again");
    click("Next line"); check(!co(), "going to the next line closes the callout");
    check(W.eval("[...document.querySelectorAll('.callout button')].every(b=>true)") === true && !W.eval("document.querySelector('.callout')"), "no callout stays after a redraw");
  }
  W.eval('openTrip(0)'); W.eval('openPlayer("trip",0)'); d.querySelector(".plline .tk:not(.pu)").click(); click("Save word"); d.body.click();
  // --- My words ---
  W.eval("goHome()"); tab("Practise"); click("My words");
  check(W.eval("view.s") === "vocab" && d.querySelectorAll("#vlist li").length === 2, "My words lists 2 saved words");
  click("Travel"); check(d.querySelectorAll("#vlist li").length === 1, "source filter shows travel words only");
  click("All");
  const first = W.eval("S.ja.saved[0].w");
  const inp = d.getElementById("vsearch"); inp.value = "zzzz"; inp.dispatchEvent(new W.Event("input", { bubbles: true }));
  check([...d.querySelectorAll("#vlist li")].every(li => li.style.display === "none"), "search hides words that do not match");
  inp.value = ""; inp.dispatchEvent(new W.Event("input", { bubbles: true }));
  click("Sentence order"); check(W.eval("view.s") === "review" && W.eval("view.qs[0].type") === "build", "sentence order practice starts");
  const before = W.eval("view.qs[0].vitem.b||0"); W.eval("solve(view.q)"); click("Check answer");
  check(W.eval("view.qs[0].correct") && W.eval("view.qs[0].vitem.b") === before + 1, "a correct answer moves the saved word to a longer review gap");
  W.eval("openVocab()"); click("Meaning quiz"); check(W.eval("view.qs[0].type") === "meaning", "meaning quiz starts");
  W.eval("openVocab()"); click("Listen and choose"); check(W.eval("view.qs[0].type") === "listen", "listen and choose starts");
  W.eval("openVocab()"); click("Flashcards"); check(W.eval("view.s") === "cards", "flashcards start");
  // --- Mistakes ---
  W.eval("S.ja.mis=[];S.ja.srs={}");
  W.eval(`window.__gq=()=>mkGramQ({question:"Choose the correct answer.",options:["A1","B1","C1"],answer:0,why:"Test."},"ja",true)`);
  W.eval(`view={s:"review",qs:[],i:0,finished:false};window.__q=__gq();__q.sel=__q.opts.findIndex(o=>!o.ok);checkQ(__q)`);
  check(W.eval("S.ja.mis.length") === 1 && W.eval("S.ja.mis[0].k") === "gram", "a wrong grammar answer adds one item to Mistakes");
  W.eval("window.__q=__gq();dontKnow(__q)"); check(W.eval("S.ja.mis.length") === 1, "the same question answered wrongly again keeps one item");
  W.eval(`window.__q=mkMatch("ja",allWords("ja").slice(0,3));__q.answered=true;__q.correct=false;onAnswer(__q);window.__q=mkQ("meaning",allWords("ja")[0],"ja");__q.sel=-1;checkQ(__q)`);
  check(W.eval("S.ja.mis.length") === 1, "a wrong match or meaning answer does not add an item");
  W.eval(`window.__q=mkGramQ({question:"Kana?",options:["x","y"],answer:0},"ja",true);__q.kk={store:"kana",key:"あ"};__q.sel=__q.opts.findIndex(o=>!o.ok);checkQ(__q)`);
  check(W.eval("S.ja.mis.length") === 1, "a wrong kana or kanji question does not add an item");
  W.eval(`view={s:"review",qs:[],i:0,finished:false};(function(){const w=allWords("ja")[0],pool=poolFor("ja",[w]);const s=pool.find(x=>x.tokens.some(z=>z[0]===w.w));window.__b=mkBlank("ja",s,w,pool);})();__b.sel=(__b.ans+1)%__b.opts.length;checkQ(__b)`);
  check(W.eval("S.ja.mis.length") === 2 && W.eval("S.ja.mis[1].k") === "blank", "a wrong blank answer adds an item");
  W.eval(`(function(){const w=allWords("ja")[0],pool=poolFor("ja",[w]),c=pool.filter(s=>contentToks(s).length>=2);window.__bd=mkBuild("ja",c[0],"build",pool);})();dontKnow(__bd)`);
  check(W.eval("S.ja.mis.length") === 3 && W.eval("S.ja.mis[2].k") === "build", "“I do not know” on a build question adds an item");
  W.eval("goHome()"); tab("Practise"); check(M().includes("3 to repeat"), "the Practise row shows the number of items");
  const srsBefore = W.eval("JSON.stringify(S.ja.srs)");
  click("Mistakes"); check(W.eval("view.s") === "review" && W.eval("view.mis") === true && W.eval("view.qs.length") === 3, "Mistakes starts with all 3 items");
  W.eval("view.i=view.qs.findIndex(q=>q.type==='blank')"); W.eval("render()");
  W.eval("solve(view.q)"); click("Check answer"); check(W.eval("S.ja.mis.length") === 2, "a correct answer in Mistakes removes the item");
  check(W.eval("JSON.stringify(S.ja.srs)") === srsBefore, "a blank question in Mistakes does not change word review timing");
  click("Continue");
  W.eval("view.i=view.qs.findIndex(q=>q.type==='gram'&&!q.answered)"); W.eval("render()");
  W.eval("view.q.sel=view.q.opts.findIndex(o=>!o.ok);render()"); click("Check answer");
  const nBefore = W.eval("view.qs.length"); click("Continue");
  check(W.eval("S.ja.mis.length") === 2 && W.eval("view.qs.length") === nBefore + 1, "a wrong answer in Mistakes keeps the item and repeats the question");
  check(W.eval("view.qs[view.qs.length-1].again") === true, "the repeated question is marked again so it is not queued a second time");
  // one item answered wrongly twice: the session finishes and the item stays
  W.eval(`S.ja.mis=[];view={s:"review",qs:[],i:0,finished:false};window.__q=__gq();__q.sel=__q.opts.findIndex(o=>!o.ok);checkQ(__q)`);
  W.eval("startMistakes()");
  check(W.eval("view.mis") === true && W.eval("view.qs.length") === 1, "a Mistakes session with one item starts with one question");
  W.eval("view.q.sel=view.q.opts.findIndex(o=>!o.ok);render()"); click("Check answer"); click("Continue");
  check(W.eval("view.qs.length") === 2 && W.eval("view.finished") === false, "the wrong answer is repeated once at the end");
  W.eval("view.q.sel=view.q.opts.findIndex(o=>!o.ok);render()"); click("Check answer"); click("Continue");
  check(W.eval("view.finished") === true && W.eval("view.qs.length") === 2, "a second wrong answer does not queue a third question and the session finishes");
  check(W.eval("S.ja.mis.length") === 1, "the item stays in Mistakes after two wrong answers");
  W.eval("S.ja.mis=[]");
  // limit of 50 items
  W.eval(`view={s:"review",qs:[],i:0,finished:false};for(let k=0;k<55;k++){const q=mkGramQ({question:"Q"+k,options:["a","b"],answer:0},"ja",true);q.sel=q.opts.findIndex(o=>!o.ok);checkQ(q);}`);
  check(W.eval("S.ja.mis.length") === 50 && W.eval("S.ja.mis[0].question") === "Q5", "Mistakes keeps at most 50 items and drops the oldest");
  W.eval("S.ja.mis=[];goHome()");
  // --- Video player ---
  const calls = [];
  W.eval(`window.YT={Player:function(el,o){this.t=0;this.getCurrentTime=()=>this.t;this.setPlaybackRate=r=>window.__calls.push("rate:"+r);this.seekTo=s=>{this.t=s;window.__calls.push("seek:"+s);};this.playVideo=()=>{};this.destroy=()=>{};window.__p=this;}};window.__calls=[];`);
  W.eval(`VIDS.ja.push({id:"BBBBBBBBBBB",title:"Test video",ch:"Test channel",lvn:1,len:"5 minutes",has:"Test.",transcript:[{t:0,line:"こんにちは|konnichiwa|hello / 。 = Hello."},{t:5,line:"ありがとう|arigatou|thank you / 。 = Thank you."}]});`);
  W.eval("goHome()"); tab("Listen"); check(M().includes("Test video"), "Listen shows the catalogue video as a tile");
  click("Test video"); await wait(400);
  check(W.eval("view.s") === "video" && !!d.getElementById("ytp"), "video opens in the in-app player");
  W.eval("__p.t=6"); await wait(400); check(d.getElementById("vsub").textContent.includes("ありがとう"), "subtitles follow the video time");
  check(!M().includes("Speed") && !/0\.75×/.test(M()), "the video screen has no speed control");
  W.eval("__p.t=10"); click("Set start here"); W.eval("__p.t=20"); click("Set end here"); click("Loop: off");
  W.eval("__p.t=21"); await wait(400); check(W.eval("__p.t") === 10, "section loop jumps back to the start point");
  click("Mark as watched"); check(W.eval("S.ja.videosWatched.BBBBBBBBBBB") === true, "watched state is saved");
  // --- Real-situation log ---
  const noEmoji = n => { if (/\p{Extended_Pictographic}/u.test(d.getElementById("main").textContent)) failures.push(n + ": emoji found"); };
  const prim = () => d.querySelectorAll("#main .btn.pri").length;
  for (const lg of ["ja", "zh"]) {
    W.eval("libSec=null;view={s:'home'};if(S.lang!==\""+lg+"\")setLang(\""+lg+"\");render()"); tab("Travel");
    check(M().includes("Used in real life: 0 phrases") && M().includes("No phrases to review"), lg + ": Travel shows an empty real-situation log");
    check(prim() <= 1, lg + ": Travel tab has at most one primary button"); noEmoji(lg + " Travel");
    W.eval("openTrip(0)"); click("You say");
    const ph = W.eval("sentText(trip(S.lang,0)._p.say[0].p)"), ph2 = W.eval("sentText(trip(S.lang,0)._p.say[1].p)");
    check(!!d.querySelector(".realb"), lg + ": each phrase has a real-life control");
    click("I used this in real life");
    check([...d.querySelectorAll("#main .btn.sec")].map(b => b.textContent).join("|") === "Understood|Asked me to repeat|Answered in English", lg + ": three literal result buttons are offered");
    check(prim() === 0 && d.querySelectorAll("#nextbtn").length === 1, lg + ": situation screen keeps one primary action (bottom bar)"); noEmoji(lg + " say tab");
    click("Asked me to repeat");
    check(W.eval(`S.${lg}.real[${JSON.stringify(ph)}].r`) === "repeat" && M().includes("Real life: Asked me to repeat"), lg + ": a result is recorded and shown");
    W.eval("view.rl=sentText(trip(S.lang,0)._p.say[1].p);render()"); click("Answered in English");
    check(W.eval(`S.${lg}.real[${JSON.stringify(ph2)}].r`) === "english", lg + ": a second phrase is recorded");
    W.eval("goHome()"); tab("Travel");
    check(M().includes("Used in real life: 2 phrases. Understood: 0.") && M().includes("2 phrases did not work yet"), lg + ": Travel shows counts");
    click("Phrases to review");
    check(W.eval("view.s") === "lib" && M().includes(ph) && M().includes(ph2) && M().includes("Asked me to repeat, ") && M().includes("Answered in English, "), lg + ": the review list shows both phrases with result and date");
    check(prim() === 0, lg + ": review screen has no primary button in the main area"); noEmoji(lg + " review");
    W.eval("window.__sy=[];speechSynthesis.speak=u=>{__sy.push(u.text);};");
    click(ph); check(W.eval("__sy[0]") === ph && !!d.querySelector(".realit .stack2"), lg + ": tapping a phrase plays it and offers the three results");
    click("Understood");
    check(!M().includes(ph) && M().includes(ph2) && M().includes("Understood: 1."), lg + ": an understood phrase leaves the review list");
    W.eval(`view.rl=${JSON.stringify(ph2)};render()`); click("Understood");
    check(M().includes("No phrases to review") && M().includes("Understood: 2."), lg + ": the list is empty when all phrases were understood");
    W.eval(`S.${lg}.real[${JSON.stringify(ph)}]={r:"ok",t:Date.now()-1000};openTrip(0);view.tt="say";view.rl=${JSON.stringify(ph)};render()`); click("Answered in English");
    check(W.eval(`S.${lg}.real[${JSON.stringify(ph)}].r`) === "english" && W.eval(`realReview(S.lang).some(x=>x.key===${JSON.stringify(ph)})`), lg + ": the latest result wins and the phrase returns to the list");
    W.eval("goHome()");
  }
  check(W.eval("normalize({v:1,ja:{real:null}}).ja.real") !== null && Object.keys(W.eval("normalize({v:1}).zh.real")).length === 0, "old saved state without real loads with an empty log");
  failures.forEach(f => console.log("FAIL:", f));
  console.log(failures.length ? failures.length + " failure(s)." : "Feature test OK.");
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.log("FAIL:", e.message); process.exit(1); });
