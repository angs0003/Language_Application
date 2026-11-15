/* Tests for the placement quiz: two parts (words, sentences), an adaptive search, at most 14 questions (docs/features/placement-quiz.md).
   Run: node tests/placement.test.js   (PLACE_RUNS=100 node tests/placement.test.js runs more simulated learners per level; the checks use a fixed random seed) */
const { makeDom, ready, tools } = require("./helpers");
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); else console.log("ok:", msg); };
const RUNS = +process.env.PLACE_RUNS || 12, MIN_HIT = Math.ceil(RUNS * 10 / 12), MIN_LOW = Math.ceil(RUNS * 11 / 12);
(async () => {
  const dom = makeDom({ db: null, failures }); await ready(dom);
  const { d, W, M, click, lang } = tools(dom, failures);
  lang("ja"); click("Skip and start");
  W.eval("(()=>{let a=333;Math.random=()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296;};})()");
  /* A simulated learner who knows the words of the first tw themes and the sentences of the first ts themes (separate positions) and answers honestly:
     known theme: correct 90%, else wrong; unknown theme: "I do not know" 70% (words, blank) or 85% (tile questions), else wrong (words and blank: a guess that is right 1 time in 4). */
  W.eval(`window.simPlace=(tw,ts)=>{
    startPlacement();const log={sentQ:0,noDK:0,types:[],eng:[]};
    while(!view.finished){
      const q=view.qs[view.i],known=q.unit<(q.part===2?ts:tw),tile=q.type==="build";
      if(q.part===2){log.sentQ++;log.types.push(q.type==="blank"?"blank":q.mode);log.eng.push(q.sent.english);if(!document.getElementById("main").textContent.includes("I do not know"))log.noDK++;}
      if(known&&Math.random()<0.9){solve(q);if(!q.answered)checkQ(q);}
      else if(known){if(tile){q.placed=[q.tiles[0].id];checkQ(q);}else{q.sel=(q.ans+1)%q.opts.length;checkQ(q);}}
      else if(Math.random()<(tile?0.85:0.7))dontKnow(q);
      else if(tile){q.placed=[q.tiles[0].id];checkQ(q);}
      else{q.sel=Math.random()<0.25?q.ans:(q.ans+1)%q.opts.length;checkQ(q);}
      screenPlace().next.fn();
    }
    return Object.assign({},view.res,log);};`);
  const sim = (tw, ts) => JSON.parse(W.eval(`JSON.stringify(simPlace(${tw},${ts}))`));
  const stats = {};
  for (const lg of ["zh", "ja"]) {
    W.eval(`setLang("${lg}")`);
    const n = W.eval("CUR[S.lang].length");
    const runs = [0, 6, 40, 100, n].map(tr => [tr, Array.from({ length: RUNS }, () => sim(tr, tr))]);
    const all = runs.flatMap(([, rs]) => rs);
    stats[lg] = { n, avg: all.reduce((a, r) => a + r.n, 0) / all.length, max: Math.max(...all.map(r => r.n)), hit: runs.map(([tr, rs]) => tr + ":" + rs.filter(r => r.lo <= tr && tr <= r.hi).length + "/" + RUNS).join(" "), low: runs.map(([tr, rs]) => tr + ":" + rs.filter(r => r.start <= tr).length + "/" + RUNS).join(" ") };
    check(all.every(r => r.n >= 1 && r.n <= 14), lg + ": the placement quiz asks at most 14 questions (before: up to 248)");
    check(all.reduce((a, r) => a + r.n, 0) / all.length <= 12, lg + ": the placement quiz asks 12 questions or fewer on average");
    check(all.every(r => r.sentQ >= 4 && r.nS >= 4), lg + ": every full quiz has at least 4 sentence questions");
    check(runs.every(([tr, rs]) => rs.filter(r => r.lo - 1 <= tr && tr <= r.hi + 1).length >= MIN_HIT), lg + ": the 90% range of the result contains the true sentence position (within 1 theme at the two ends of the list, where one slip on the last question moves the range by 1) in at least " + MIN_HIT + " of " + RUNS + " simulated learners at each of 5 positions");
    check(runs.every(([tr, rs]) => rs.filter(r => r.start <= tr + 1).length >= MIN_LOW), lg + ": the starting theme is at or below the true sentence position plus 1 theme in at least " + MIN_LOW + " of " + RUNS + " runs at each position");
    const mixed = Array.from({ length: RUNS }, () => sim(100, 40));
    stats[lg].mixed = mixed.filter(r => r.start <= 45).length + "/" + RUNS;
    check(mixed.filter(r => r.start <= 45).length >= MIN_HIT, lg + ": a learner with words up to Theme 100 but sentences up to Theme 40 starts at or below Theme 46 in at least " + MIN_HIT + " of " + RUNS + " runs");
    check(all.every(r => r.noDK === 0 && new Set(r.eng).size === r.eng.length), lg + ": no sentence is repeated in one session and every sentence question has “I do not know”");
    const types = new Set(all.flatMap(r => r.types));
    check(["blank", "toEn", "listen", "build"].every(t => types.has(t)), lg + ": all four sentence question types are used");
    check(all.every(r => r.types.every((t, i) => i === 0 || r.types[i - 1] !== t)), lg + ": the sentence question types rotate");
  }
  console.log("simulation (seeded):", JSON.stringify(stats));
  // The screens show the part and the number of questions
  W.eval('setLang("zh")'); W.eval("startPlacement()");
  const prog = () => d.getElementById("prog").textContent;
  check(W.eval("view.qs.length") === 1 && W.eval("view.part") === 1 && M().includes("Finish now") && M().includes("What does this word mean"), "placement shows one question at a time with a Finish now button");
  check(prog().includes("Placement quiz, part 1 of 2: words. Question 1 of about 12") && prog().includes("At most 14 questions. No timer."), "part 1 states the part, the number of questions and the maximum");
  // Finish now in part 1: the word result, a rough estimate, no sentence line
  W.eval("dontKnow(view.q)"); click("Finish now");
  check(W.eval("view.finished") === true && W.eval("view.res.n") === 1 && W.eval("view.res.sx") === null && M().includes("rough estimate") && M().includes("Words: ") && !M().includes("Sentences: "), "Finish now in part 1 gives the word result and a rough estimate");
  // Part 1 ends with part 2: no separate screen, no auto-advance, the header changes
  W.eval("startPlacement()");
  W.eval(`(()=>{for(let k=0;k<20&&view.part===1;k++){const q=view.q;q.sel=q.unit<30?q.ans:(q.ans+1)%q.opts.length;checkQ(q);screenPlace().next.fn();}})()`);
  check(W.eval("view.part") === 2 && W.eval("view.qs[view.i].part") === 2 && W.eval("view.qs.filter(q=>q.part===1&&q.answered).length") <= 8 && W.eval("view.qs.filter(q=>q.part===1&&q.answered).length") >= 4, "part 1 asks 4 to 8 questions, then part 2 starts with a sentence question");
  check(prog().includes("part 2 of 2: sentences") && M().includes("Finish now") && W.eval("view.postS.length") <= W.eval("CUR[S.lang].length+1") && W.eval("Math.abs(view.postS.reduce((a,b)=>a+b,0)-1)<1e-9"), "part 2 shows its part in the header and has its own probability");
  // Back from part 2 to part 1 and forward again does not count an answer twice
  const part2Index = W.eval("view.i"), snap = () => W.eval("JSON.stringify([view.post,view.postS])");
  const flat = snap();
  W.eval("dontKnow(view.q)");
  click("Back");
  check(W.eval("view.i") === part2Index - 1 && W.eval("view.qs[view.i].part") === 1 && W.eval("view.qs[view.i].upd") === true, "Back from part 2 shows the last answer of part 1");
  click("Continue");
  check(W.eval("view.i") === part2Index && snap() === flat, "Back and Continue between the parts change no probability");
  click("Continue");
  const once = snap();
  check(once !== flat && JSON.parse(once)[0].join() === JSON.parse(flat)[0].join() && W.eval("view.qs[view.i-1].upd") === true, "the first answer of part 2 updates only the sentence probability, once");
  click("Back"); click("Continue");
  check(snap() === once, "Back to the answered question of part 2 and Continue does not update the probability twice");
  // Finish now in part 2: sentence result
  W.eval("startPlacement()");
  W.eval(`(()=>{for(let k=0;k<20&&view.part===1;k++){const q=view.q;q.sel=q.unit<30?q.ans:(q.ans+1)%q.opts.length;checkQ(q);screenPlace().next.fn();}})()`);
  W.eval("(()=>{const q=view.q;if(q.type==='build')solve(q);else q.sel=q.ans;checkQ(q);})()");
  click("Finish now");
  check(W.eval("view.finished") === true && W.eval("view.res.sx") !== null && W.eval("view.res.nS") === 1 && M().includes("Sentences: ") && M().includes("rough estimate") && M().includes("Your starting theme is Theme"), "Finish now in part 2 gives a result with the sentence line and a rough estimate");
  check(W.eval("view.res.start") <= W.eval("placeQuant(view.post,0.95)"), "the word result is the upper limit of the starting theme");
  // Full result text
  W.eval("placeOpenAt('result')");
  check(M().includes("Words: you know the words of about Themes 1 to 30.") && M().includes("Sentences: you can use the sentences of about Themes 1 to 24.") && M().includes("Your starting theme is Theme 21,"), "the result shows the word position, the sentence position and the starting theme");
  // Earlier themes are marked as learned with reviews spread over 4 weeks
  W.eval("S.zh.srs={};view.res={start:20,lo:15,hi:30,wx:30,sx:24,nS:6,n:14}");
  W.eval("screenPlace().next.fn()");
  const dues = JSON.parse(W.eval("JSON.stringify(Object.values(S.zh.srs).map(e=>Math.round((e.d-Date.now())/864e5)))"));
  check(W.eval("Object.keys(S.zh.srs).length") === W.eval("CUR.zh.slice(0,20).reduce((a,t)=>a+t.words.length,0)") && Math.max(...dues) >= 20 && Math.max(...dues) <= 28, "the themes before the starting theme are marked as learned and their reviews are spread over 4 weeks");
  W.eval("S.zh.srs={};goHome()");
  // Placement answers do not enter Mistakes
  W.eval("S.zh.mis=[];startPlacement()");
  W.eval("dontKnow(view.q)");
  W.eval("placeOpenAt('build')");
  W.eval("dontKnow(view.q)");
  check(W.eval("S.zh.mis.length") === 0, "wrong sentence answers in the placement quiz do not enter Mistakes");
  W.eval("goHome()");
  failures.forEach(f => console.log("FAIL:", f));
  console.log(failures.length ? failures.length + " failure(s)." : "Placement test OK.");
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.log("FAIL:", e.message); process.exit(1); });
