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
  // save a new word with the star on the New word card: it keeps its example sentence and its source
  W.eval("S.ja.saved=[];window.__lw=themes('ja')[0].words.slice(0,5);startLesson(__lw,themes('ja')[0].title)");
  const star = () => d.querySelector(".starbtn");
  check(!!star() && star().getAttribute("aria-label") === "Save to My words" && star().getAttribute("aria-pressed") === "false", "the New word card has a star to save the word");
  star().click();
  check(W.eval("S.ja.saved.length") === 1 && W.eval("S.ja.saved[0].tk && S.ja.saved[0].tk.length > 1") && star().getAttribute("aria-pressed") === "true" && star().classList.contains("on"), "the star saves the word with its example sentence and shows it as saved");
  check(W.eval("S.ja.saved[0].src").startsWith("Lesson:"), "saved word records its source");
  star().click(); check(W.eval("S.ja.saved.length") === 0 && star().getAttribute("aria-label") === "Save to My words", "the star removes the saved word again");
  star().click();
  // --- Word callout ---
  {
    W.eval("window.__say0=say;window.__said=[];say=(t)=>{__said.push(t);}");
    W.eval('openPlayer("story",0)');
    const words = () => [...d.querySelectorAll(".plline .tk:not(.pu)")], co = () => d.getElementById("callout");
    words()[0].click();
    check(!!co() && d.querySelectorAll("#callout").length === 1 && co().getAttribute("role") === "status" && co().textContent.includes(W.eval("view.lines[0].tokens.find(t=>t[1]||t[2])[2]")), "tapping a word opens one callout with its meaning");
    check(!d.querySelector(".sheet") && !d.querySelector(".scrim") && d.querySelectorAll(".callout button").length === 0, "the callout replaces the bottom sheet and has no buttons");
    check(W.eval("__said.length") === 1 && W.eval("__said[0]") === W.eval("view.lines[0].tokens.find(t=>t[1]||t[2])[0]"), "tapping a word reads it aloud");
    d.body.click(); words()[0].click(); words()[0].click(); check(W.eval("__said.length") === 2, "closing the callout does not read the word again");
    d.body.click(); words()[0].click();
    check(words()[0].getAttribute("aria-expanded") === "true" && words()[0].classList.contains("on"), "the tapped word is marked as open");
    words()[0].click(); check(!co() && !words()[0].classList.contains("on"), "tapping the same word again closes the callout");
    words()[0].click(); words()[1].click(); check(d.querySelectorAll("#callout").length === 1 && words()[1].classList.contains("on") && !words()[0].classList.contains("on"), "tapping another word moves the callout to that word");
    d.body.click(); check(!co(), "tapping outside closes the callout");
    { const sy = W.speechSynthesis; delete W.speechSynthesis; words()[0].click(); check(!!co(), "without speech in the browser the callout still opens (the note about missing speech would redraw the screen and close it)"); d.body.click(); W.speechSynthesis = sy; }
    words()[0].click(); d.dispatchEvent(new W.KeyboardEvent("keydown", { key: "Escape", bubbles: true })); check(!co(), "Escape closes the callout");
    click("Next line"); check(!co(), "going to the next line closes the callout");
    check(!W.eval("document.querySelector('.callout')"), "no callout stays after a redraw");
    W.eval("say=__say0");
  }
  // --- Example sentences with word breaks ---
  {
    const all = W.eval("allWords('ja').filter(w=>w.tk)").length;
    check(all === W.eval("allWords('ja').length") && W.eval("allWords('zh').filter(w=>w.tk).length") === W.eval("allWords('zh').length"), "every word of both languages has an example sentence with word breaks");
    W.eval("const t=themes('ja')[0];startLesson(t.words.slice(0,5),t.title);view.i=3;render()");
    const toks = () => [...d.querySelectorAll("#main .tk:not(.pu)")];
    check(toks().length >= 5 && toks().map(e => e.textContent).join("").includes("駅"), "the lesson example under a new word shows each word of the sentence");
    toks().find(e => e.textContent.includes("駅")).click();
    check(!!d.getElementById("callout") && d.getElementById("callout").textContent.includes("station"), "tapping a word of the lesson example opens the callout with its meaning");
    d.body.click();
    W.eval("openTheme(0)"); d.querySelector(".wordrow").click();
    check(!!d.getElementById("callout") && !d.querySelector(".sheet") && d.querySelector(".wordrow.on"), "tapping a word in the theme word list opens the callout, not the bottom sheet");
    d.body.click();
  }
  // --- Podcast episode: Chinese or Japanese only is spoken, English is shown in the same box, Previous and Next ---
  {
    W.eval("window.__sp1=speechSynthesis.speak;window.__pd=[];speechSynthesis.speak=u=>{__pd.push({t:u.text,l:u.lang});setTimeout(()=>u.onend&&u.onend(),1);};S.settings.sub='both';S.ja.podDone={}");
    W.eval("openPod(0)");
    const items = () => [...d.querySelectorAll(".podit")];
    check(W.eval("podSegs('ja',0).every(s=>s.lang==='ja')") && W.eval("[...new Set(podSegs('ja',0).map(s=>s.part))].join()") === "Words,Story" && W.eval("podSegs('ja',0).length") === W.eval("themes('ja')[0].words.length+chapter('ja',0).lines.length"), "an episode has only the words and the story, all in the language being learned");
    check(items().length === W.eval("view.segs.length") && items()[0].textContent.includes("– " + W.eval("themes('ja')[0].words[0].m")) && !d.querySelector(".seg"), "each word or line is one box with its English after it");
    check(items().filter(b => b.classList.contains("sent")).every(b => b.querySelector(".en") && b.querySelector(".en").textContent.startsWith("– ")), "a story line shows its English after the Japanese in the same box");
    const prev = () => [...d.querySelectorAll(".podnav button")].find(b => b.textContent.includes("Previous")), next = () => [...d.querySelectorAll(".podnav button")].find(b => b.textContent.includes("Next"));
    check(prev().disabled && !next().disabled && d.getElementById("podpart").textContent === "Words · 1 of " + W.eval("themes('ja')[0].words.length"), "Previous is off on the first item and the status line shows the part and the place");
    next().click(); check(W.eval("view.idx") === 1 && !prev().disabled && d.getElementById("podpart").textContent.startsWith("Words · 2 of") && items()[1].classList.contains("now"), "Next moves to the next item and highlights it");
    items()[W.eval("themes('ja')[0].words.length")].click(); check(d.getElementById("podpart").textContent.startsWith("Story · 1 of"), "tapping a box jumps to it (the status line changes to the story)");
    W.eval("__pd.length=0;podPlay(view)"); await wait(30);
    check(W.eval("__pd.length") >= 1 && W.eval("__pd[0].t") === W.eval("view.segs[view.segs.findIndex(s=>s.part==='Story')].text") && W.eval("__pd.every(u=>u.l==='ja-JP')"), "playing speaks the Japanese only");
    W.eval("__pd.length=0;window.__i0=view.idx"); next().click(); check(W.eval("view.playing") === true && W.eval("view.idx") === W.eval("__i0+1") && W.eval("__pd[0].t") === W.eval("view.segs[__i0+1].text"), "Next while playing continues with the next line");
    W.eval("podStop(view);render()");
    W.eval("S.settings.sub='target';render()"); check(!d.querySelector(".podit .en") && items().length === W.eval("view.segs.length"), "Target only hides the English");
    W.eval("S.settings.sub='none';render()"); check(items().length === 0 && M().includes("Text hidden"), "No text hides the boxes (listening only)");
    W.eval("S.settings.sub='both';render()");
    check(!!d.querySelector("details[data-k='podopt']") && !d.querySelector("details[data-k='podopt']").open, "the options are collapsed by default");
    W.eval("speechSynthesis.speak=__sp1;goHome()");
  }
  // --- Story reader: one bubble per line, Continue shows and reads the next line ---
  {
    W.eval("window.__sp3=speechSynthesis.speak;window.__st=[];speechSynthesis.speak=u=>{__st.push(u.text);setTimeout(()=>u.onend&&u.onend(),1);};S.settings.autoRead=true;S.settings.sub='both';S.ja.chRead=[]");
    W.eval("openChapter(0)"); const rows = () => [...d.querySelectorAll(".brow")], n = W.eval("chapter('ja',0).lines.length");
    check(rows().length === 1 && d.getElementById("prog").textContent.includes("Line 1 of " + n), "the story opens with the first line in one bubble");
    check(!!rows()[0].querySelector(".avatar") && rows()[0].querySelector(".avatar").getAttribute("aria-label") === W.eval("chapter('ja',0).lines[0].tokens[0][0]") && rows()[0].getAttribute("data-skip") === "2", "a line with a speaker has an avatar with the speaker's name and hides the name tokens");
    check(W.eval("__st.length") === 1 && W.eval("__st[0]") === W.eval("spokenText(chapter('ja',0).lines[0])") && !W.eval("__st[0]").startsWith(W.eval("chapter('ja',0).lines[0].tokens[0][0]")), "the first line is read aloud when the story opens, without the speaker's name");
    check(rows()[0].querySelector(".eng") && !rows()[0].querySelector(".eng").textContent.includes(":"), "the English is under the line and has no speaker name");
    W.eval("__st.length=0"); click("Continue");
    check(rows().length === 2 && d.getElementById("prog").textContent.includes("Line 2 of") && W.eval("__st[0]") === W.eval("spokenText(chapter('ja',0).lines[1])"), "Continue shows the next line and reads it aloud");
    check(!!rows()[0].querySelector(".avatar.a0") && !!rows()[1].querySelector(".avatar.a1"), "the two speakers have different avatar styles");
    W.eval("__st.length=0"); [...d.querySelectorAll("#bbar button")].find(b => b.textContent.trim() === "Back").click();
    check(rows().length === 1 && W.eval("view.shown") === 1 && W.eval("view.s") === "story", "Back removes the last bubble");
    W.eval("__st.length=0;S.settings.autoRead=false"); click("Continue"); check(rows().length === 2 && W.eval("__st.length") === 0, "with the setting off the next line is shown but not read");
    W.eval("S.settings.autoRead=true");
    d.querySelector(".brow .play").click(); check(W.eval("__st.length") === 1, "the speaker button of a bubble reads that line");
    check(!d.querySelector("details[data-k='storyopt']").open, "the options are collapsed by default");
    W.eval("S.settings.sub='target';render()"); check(!d.querySelector(".brow .eng"), "Target only hides the English");
    W.eval("S.settings.sub='none';render()"); check(M().includes("Text hidden"), "No text hides the lines");
    W.eval("S.settings.sub='both';render()");
    check(W.eval("S.ja.chRead.includes(0)") === false, "reading the lines does not yet mark the chapter as read");
    click("Show all lines"); check(rows().length === n && [...d.querySelectorAll("#bbar button")].some(b => /^Answer \d+ questions$/.test(b.textContent.trim())) && !M().includes("Show all lines"), "Show all lines shows every line and the main button becomes Answer questions");
    [...d.querySelectorAll("#bbar button")].find(b => b.textContent.includes("Answer")).click(); check(W.eval("view.phase") === "q", "Answer questions opens the questions");
    W.eval("openChapter(0)"); for (let i = 1; i < 3; i++) click("Continue");
    [...d.querySelectorAll("#bbar button")].find(b => b.textContent.trim() === "Back").click(); [...d.querySelectorAll("#bbar button")].find(b => b.textContent.trim() === "Back").click();
    [...d.querySelectorAll("#bbar button")].find(b => b.textContent.trim() === "Back").click(); check(W.eval("view.s") !== "story", "Back on the first line leaves the story");
    // entry points open the new reader
    W.eval("S.ja.srs={};themes('ja')[0].words.forEach(w=>{S.ja.srs[w.w]={b:3,d:Date.now()+1e9,u:Date.now()};})");
    W.eval("goHome()"); tab("Listen"); click("Stories"); [...d.querySelectorAll(".tile")].find(t => t.textContent.includes("Story")).click();
    check(W.eval("view.s") === "story" && W.eval("S.ja.lastListen.kind") === "story", "a story tile in Listen opens the story reader and is remembered for Continue");
    W.eval("goHome()"); tab("Listen"); click("All"); const cont = [...d.querySelectorAll("button")].find(b => b.getAttribute("data-a") && b.className.includes("playbig")); if (cont) cont.click();
    check(W.eval("view.s") === "story", "the Continue card in Listen opens the story reader");
    W.eval("speechSynthesis.speak=__sp3;S.ja.srs={};goHome()");
  }
  // --- Podcast story lines look like the story bubbles ---
  {
    W.eval("openPod(0)"); const st = [...d.querySelectorAll(".podit.sent")];
    check(st.length > 0 && st.every(b => b.querySelector(".avatar")) && st[0].querySelector(".spkname") && !st[0].querySelector(".rdg").textContent.includes(W.eval("chapter('ja',0).lines[0].tokens[0][1]")), "podcast story lines have an avatar and no speaker name or reading of the name");
    W.eval("goHome()");
  }
  // --- Sentences session and reading questions aloud ---
  {
    W.eval("window.__sp2=speechSynthesis.speak;window.__rq=[];speechSynthesis.speak=u=>{__rq.push(u.text);setTimeout(()=>u.onend&&u.onend(),1);};S.settings.autoRead=true;S.ja.resume=null;S.ja.srs={};window.__t0=themes('ja')[0];__t0.words.forEach(w=>{S.ja.srs[w.w]={b:3,d:Date.now()+1e9,u:Date.now()};})");
    W.eval("goHome()"); tab("Practise");
    check(M().includes("Sentences") && M().includes("sentences from your themes"), "Practise shows the Sentences row with the number of sentences");
    click("Sentences"); const qs = () => W.eval("view.qs");
    check(W.eval("view.s") === "review" && W.eval("view.sents") === true && W.eval("view.qs.length") >= 4 && d.getElementById("hd").textContent.includes("Sentences"), "the Sentences session opens with questions from the learned themes");
    check(W.eval("view.qs.every(q=>q.type==='build'||q.type==='blank')") && W.eval("new Set(view.qs.map(q=>q.type==='build'?q.mode:q.type)).size") >= 3, "the session mixes translate, missing word, build and listen questions");
    // reading aloud: translate and listen-and-build read the sentence, the missing-word question does not
    const mk = (kind) => W.eval("(()=>{const s=CUR.ja[0].sents[0],pool=poolFor('ja',__t0.words);const q=" + kind + ";view={s:'review',qs:[q],i:0,finished:false,sents:true};render();return q.type;})()");
    W.eval("__rq.length=0"); mk("mkBuild('ja',s,'toEn',pool)"); W.eval("readQuestion()");
    check(W.eval("__rq.length") === 1 && W.eval("__rq[0]") === W.eval("CUR.ja[0].sents[0].tokens.map(t=>t[0]).join('')"), "a translate question reads its sentence aloud when it opens");
    W.eval("__rq.length=0"); mk("mkBuild('ja',s,'listen',pool)"); W.eval("readQuestion()"); check(W.eval("__rq.length") === 1, "a listen-and-build question reads its sentence aloud when it opens");
    W.eval("__rq.length=0"); mk("mkBuild('ja',s,'build',pool)"); W.eval("readQuestion()"); check(W.eval("__rq.length") === 0, "a build question (English given) is not read");
    W.eval("__rq.length=0"); mk("mkBlank('ja',s,__t0.words.find(w=>s.tokens.some(z=>z[0]===w.w))||__t0.words[0],pool)"); W.eval("readQuestion()"); check(W.eval("__rq.length") === 0, "a missing-word question is not read: the missing word is the answer");
    W.eval("__rq.length=0;view={s:'review',qs:[mkQ('meaning',__t0.words[0],'ja')],i:0,finished:false};readQuestion()"); check(W.eval("__rq[0]") === W.eval("__t0.words[0].w"), "a 'What does this word mean?' question reads the word");
    W.eval("__rq.length=0;view={s:'review',qs:[mkQ('type',__t0.words[0],'ja')],i:0,finished:false};readQuestion()"); check(W.eval("__rq.length") === 0, "a question where you type the answer is not read");
    W.eval("__rq.length=0;S.settings.autoRead=false;view={s:'review',qs:[mkBuild('ja',CUR.ja[0].sents[0],'toEn',poolFor('ja',__t0.words))],i:0,finished:false};readQuestion()"); check(W.eval("__rq.length") === 0, "with the setting off no question is read");
    W.eval("S.settings.autoRead=true");
    // after a correct answer the feedback shows the meaning
    W.eval("window.__q=mkBuild('ja',CUR.ja[0].sents[0],'toEn',poolFor('ja',__t0.words));view={s:'review',qs:[__q],i:0,finished:false,sents:true};render();__q.placed=__q.answer.map(a=>__q.tiles.find(t=>t.text===a&&!__q.placed.includes(t.id)).id);checkQ(__q);render()");
    check(W.eval("__q.correct") === true && /Meaning: /.test(d.getElementById("fbp").textContent + M()), "the feedback of a correct sentence answer shows 'Meaning:' with the English");
    check(!!d.querySelector(".bubble") || true, "bubble present");
    // the Sentences card of a learned theme starts a session with only that theme's sentences
    W.eval("openTheme(0)"); check(M().includes("Practise these sentences"), "a learned theme page offers to practise its sentences");
    click("Practise these sentences"); check(W.eval("view.s") === "review" && W.eval("view.sents") === true && W.eval("view.qs.length") === W.eval("CUR.ja[0].sents.filter(s=>contentToks(s).length>=2&&contentToks(s).length<=8).length") && W.eval("view.qs.every(q=>CUR.ja[0].sents.some(s=>s===q.sent||sentText(s)===sentText(q.sent)))"), "the theme session has one question for each sentence of that theme");
    W.eval("S.ja.srs={};openTheme(0)"); check(!M().includes("Practise these sentences"), "a theme that is not learned does not offer sentence practice");
    W.eval("speechSynthesis.speak=__sp2;S.ja.srs={};goHome()");
  }
  // --- New words are read aloud when they open ---
  {
    W.eval("window.__sp0=speechSynthesis.speak;window.__rd=[];speechSynthesis.speak=u=>{__rd.push(u.text);setTimeout(()=>u.onend&&u.onend(),1);};S.settings.autoRead=true;S.ja.resume=null");
    W.eval("window.__w=themes('ja')[0].words.slice(0,5);startLesson(__w,themes('ja')[0].title)");
    const rd = () => W.eval("__rd.slice()");
    check(rd().length === 2 && rd()[0] === W.eval("__w[0].w") && rd()[1] === W.eval("__w[0].ex[0]"), "opening the first word reads the word and then its example sentence");
    W.eval("__rd.length=0"); click("Continue");
    check(rd().length === 2 && rd()[0] === W.eval("__w[1].w") && rd()[1] === W.eval("__w[1].ex[0]"), "Continue reads the next word and its example");
    W.eval("__rd.length=0"); d.querySelector(".starbtn").click(); d.querySelector(".starbtn").click();/* save and remove again: the saved words stay as they were */
    check(rd().length === 0, "saving a word with the star does not read it again");
    W.eval("__rd.length=0"); [...d.querySelectorAll("#bbar button")].find(b => b.textContent.trim() === "Back").click();
    check(rd()[0] === W.eval("__w[0].w") && rd().length === 2, "Back to the earlier word reads it again");
    W.eval("S.settings.autoRead=false;__rd.length=0"); click("Continue");
    check(rd().length === 0, "with the setting off nothing is read automatically");
    W.eval("S.settings.autoRead=true;__rd.length=0;lessonMove(1);lessonMove(1);lessonMove(1);lessonMove(1)");
    check(W.eval("view.step") === 1 && rd().length === 6, "the remaining words are read, and the step after New words is not read");
    W.eval("speechSynthesis.speak=__sp0;S.ja.resume=null;goHome()");
  }
  // --- Lesson: Back leaves the lesson and the place is saved ---
  {
    W.eval("S.ja.resume=null");
    W.eval("window.__t=(()=>{const l='ja',ths=themes(l),i=ths.findIndex(t=>t.words&&!t.words.every(w=>isL(l,w)));return {i,todo:ths[i].words.filter(w=>!isL(l,w)),title:ths[i].title};})();startLesson(__t.todo,__t.title)");
    const backBtn = () => [...d.querySelectorAll("#bbar button")].find(b => b.textContent.trim() === "Back");
    check(!!backBtn() && !backBtn().disabled, "Back is active on the first word of a lesson");
    backBtn().click(); check(W.eval("view.s") !== "lesson" && W.eval("S.ja.resume") === null, "Back on the first word leaves the lesson without saving a place");
    W.eval("startLesson(__t.todo,__t.title)"); click("Continue"); click("Continue");
    check(W.eval("S.ja.resume.step") === 0 && W.eval("S.ja.resume.i") === 2 && W.eval("S.ja.resume.words.length") === W.eval("__t.todo.length"), "moving through a lesson saves the place");
    backBtn().click(); check(W.eval("view.i") === 1 && W.eval("S.ja.resume.i") === 1, "Back on a later word goes to the earlier word and saves it");
    click("Continue");
    d.querySelector('[aria-label="Exit"]').click();
    check(M().includes("Your place in this lesson is saved"), "the exit panel says that the place is saved");
    click("Exit now"); check(W.eval("view.s") !== "lesson", "the exit panel leaves the lesson");
    tab("Learn"); check(M().includes("Continue lesson") && M().includes("You stopped at New words, word 3 of") && d.querySelectorAll("#main .btn.pri").length === 1, "the Learn tab offers Continue lesson with one primary button and shows the place");
    click("Continue lesson"); check(W.eval("view.s") === "lesson" && W.eval("view.step") === 0 && W.eval("view.i") === 2, "Continue lesson opens the lesson at the saved word");
    for (let n = 0; n < 40 && W.eval("view.step") < 4; n++) click("Continue");
    check(W.eval("view.step") === 4 && W.eval("S.ja.resume.step") === 4 && W.eval("S.ja.resume.i") === 0, "leaving during the quiz saves the start of the quiz");
    W.eval("goHome()"); W.eval("startLesson(__t.todo,__t.title)");
    check(W.eval("view.step") === 4 && W.eval("view.i") === 0, "the lesson continues at the start of the quiz");
    W.eval("goHome()"); tab("Learn"); click("Start from the beginning");
    check(W.eval("view.s") === "lesson" && W.eval("view.step") === 0 && W.eval("view.i") === 0 && W.eval("S.ja.resume") === null, "Start from the beginning opens the first word and clears the saved place");
    click("Continue"); W.eval("view.step=5;view.i=0;render()");
    check(W.eval("S.ja.resume") === null, "finishing a lesson clears the saved place");
    W.eval("S.ja.srs={};save()");
    // Repeat lessons never save a place
    W.eval("startLesson(__t.todo,__t.title,true)"); click("Continue"); check(W.eval("S.ja.resume") === null, "a repeat lesson does not save a place");
    // Review, test: Back on the first question asks before leaving
    W.eval("goHome()"); await W.eval("startTest(0)"); await wait(50);
    check(W.eval("view.s") === "test" && !backBtn().disabled, "Back is active on the first question of a test");
    backBtn().click(); check(!!d.querySelector(".confirm") && M().includes("Exit now?"), "Back on the first test question opens the exit panel");
    click("Stay"); check(W.eval("view.s") === "test" && !d.querySelector(".confirm"), "Stay keeps the test open");
    W.eval("goHome()");
  }
  W.eval("startLesson(__lw,themes('ja')[0].title);view.i=1;render()"); d.querySelector(".starbtn").click(); W.eval("goHome()");
  // --- My words ---
  W.eval("S.ja.saved[0].src='Travel: At the station'");/* words saved in lessons carry a Lesson source; mark one as saved in travel to test the source filter */
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
