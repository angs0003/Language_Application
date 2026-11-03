/* Tests for the player, My words and the video player. Run: node tests/features.test.js */
const { makeDom, wait, ready, tools } = require("./helpers");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
(async () => {
  const dom = makeDom({ db: null, failures }); await ready(dom);
  const { d, W, M, click, tab } = tools(dom, failures);
  click("Japanese"); click("Skip and start");
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
  W.eval('openPlayer("trip",0)'); check(M().includes("Local") || d.getElementById("prog").textContent.includes("Local"), "travel conversation opens in the player with speaker labels");
  // tap a word in the player and save it with its sentence
  W.eval('openPlayer("story",1)'); d.querySelector(".plline .tk:not(.pu)").click(); click("Save word");
  check(W.eval("S.ja.saved.length") === 1 && W.eval("S.ja.saved[0].tk && S.ja.saved[0].tk.length > 1"), "word saved from the player keeps its sentence tokens");
  check(W.eval("S.ja.saved[0].src").startsWith("Story chapter"), "saved word records its source");
  d.querySelector(".scrim").click();
  W.eval('openTrip(0)'); W.eval('openPlayer("trip",0)'); d.querySelector(".plline .tk:not(.pu)").click(); click("Save word"); d.querySelector(".scrim").click();
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
  // --- Video player ---
  const calls = [];
  W.eval(`window.YT={Player:function(el,o){this.t=0;this.getCurrentTime=()=>this.t;this.setPlaybackRate=r=>window.__calls.push("rate:"+r);this.seekTo=s=>{this.t=s;window.__calls.push("seek:"+s);};this.playVideo=()=>{};this.destroy=()=>{};window.__p=this;}};window.__calls=[];`);
  W.eval(`VIDS.ja.push({id:"BBBBBBBBBBB",title:"Test video",ch:"Test channel",lvn:1,len:"5 minutes",has:"Test.",transcript:[{t:0,line:"こんにちは|konnichiwa|hello / 。 = Hello."},{t:5,line:"ありがとう|arigatou|thank you / 。 = Thank you."}]});`);
  W.eval("goHome()"); tab("Listen"); check(M().includes("Test video"), "Listen shows the catalogue video as a tile");
  click("Test video"); await wait(400);
  check(W.eval("view.s") === "video" && !!d.getElementById("ytp"), "video opens in the in-app player");
  W.eval("__p.t=6"); await wait(400); check(d.getElementById("vsub").textContent.includes("ありがとう"), "subtitles follow the video time");
  click("0.75×"); check(W.eval("__calls").includes("rate:0.75"), "speed control sets the playback rate");
  W.eval("__p.t=10"); click("Set start here"); W.eval("__p.t=20"); click("Set end here"); click("Loop: off");
  W.eval("__p.t=21"); await wait(400); check(W.eval("__p.t") === 10, "section loop jumps back to the start point");
  click("Mark as watched"); check(W.eval("S.ja.videosWatched.BBBBBBBBBBB") === true, "watched state is saved");
  failures.forEach(f => console.log("FAIL:", f));
  console.log(failures.length ? failures.length + " failure(s)." : "Feature test OK.");
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.log("FAIL:", e.message); process.exit(1); });
