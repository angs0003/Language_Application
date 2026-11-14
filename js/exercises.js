"use strict";
/* Language Steps: exercises.js. Question building, checking and rendering (meaning, listen, type, speak, grammar choice).
   Files load in the order listed in js/loader.js (APP_FILES); they share one global scope. */
/* ---------- Questions ---------- */
function mkQ(type,w,l){
  if(type==="speak"&&!S.settings.speaking)type="listen";
  const q={type,word:w,lang:l,answered:false,correct:false,sel:null,input:"",explain:null};
  if(type==="meaning"||type==="listen"){
    const used=new Set([w.m]);const dis=[];
    for(const x of shuffle(allWords(l))){if(x.w!==w.w&&!used.has(x.m)){used.add(x.m);dis.push(x);}if(dis.length===3)break;}
    q.opts=shuffle([w,...dis]);q.ans=q.opts.indexOf(w);
  }
  return q;
}
function canCheck(q){if(q.answered)return false;if(q.type==="build")return q.placed.length>0;if(q.type==="meaning"||q.type==="listen"||q.type==="gram"||q.type==="blank")return q.sel!==null;if(q.type==="type")return q.input.trim().length>0;return false;}
function checkQ(q){if(q.type==="build")checkBuild(q);else if(q.type==="type")q.correct=readingMatch(q.lang,q.input,q.word);else q.correct=q.sel===q.ans;q.answered=true;onAnswer(q);}
function dontKnow(q){q.dk=true;q.sel=-1;q.answered=true;q.correct=false;onAnswer(q);}
/* ---------- Mistakes (sentence and grammar questions answered wrongly) ---------- */
const MIS_MAX=50;
function misKind(q){if(q.kk||q.vitem)return null;return q.type==="build"||q.type==="blank"||q.type==="gram"?q.type:null;}
function misId(q){const k=misKind(q);if(k==="gram")return "gram|"+q.question+"|"+q.opts.map(o=>o.text).sort().join("/");if(k==="build")return "build|"+q.mode+"|"+q.sent.english+"|"+q.answer.join("/");return "blank|"+q.sent.english+"|"+q.idx;}
function misList(l){return S[l].mis||(S[l].mis=[]);}
function misSnap(q){const k=misKind(q);
  if(k==="gram")return {question:q.question,plain:q.plain,why:q.why,big:q.big||"",opts:q.opts.map(o=>({text:o.text,reading:o.reading,english:o.english,ok:o.ok}))};
  if(k==="build")return {mode:q.mode,sent:q.sent,word:q.word,answer:q.answer,tiles:q.tiles};
  return {sent:q.sent,idx:q.idx,opts:q.opts,word:q.word};}
function misAdd(q){const k=misKind(q);if(!k)return;const l=q.lang,id=q.mid||misId(q),list=misList(l);
  if(list.some(x=>x.id===id))return;
  list.push(Object.assign({id,k,t:Date.now()},misSnap(q)));while(list.length>MIS_MAX)list.shift();save();}
function misRemove(l,id){const list=misList(l),i=list.findIndex(x=>x.id===id);if(i>=0){list.splice(i,1);save();}}
function misRebuild(x,l){
  try{
    if(x.k==="gram"){const sh=shuffle(x.opts.map(o=>Object.assign({},o)));const q=mkGramQ({question:x.question,options:sh.map(o=>({text:o.text,reading:o.reading,english:o.english})),answer:sh.findIndex(o=>o.ok),why:x.why},l,x.plain);if(x.big)q.big=x.big;q.mid=x.id;return q;}
    if(x.k==="build"){if(!x.sent||!x.tiles||!x.answer)return null;return {type:"build",mode:x.mode,lang:l,sent:x.sent,placed:[],word:x.word||null,answered:false,correct:false,sel:null,input:"",answer:x.answer,tiles:shuffle(x.tiles.map(t=>Object.assign({},t))),mid:x.id};}
    if(x.k==="blank"){if(!x.sent||!x.opts||!x.word)return null;const opts=shuffle(x.opts.map(o=>Object.assign({},o)));return {type:"blank",lang:l,sent:x.sent,idx:x.idx,opts,ans:opts.findIndex(o=>o.text===x.word.w),word:x.word,answered:false,correct:false,sel:null,input:"",mid:x.id};}
  }catch(e){/* an item that cannot be rebuilt is dropped by the caller */}
  return null;}
function misTrack(q){if(view.s==="place"||view.s==="test"||view.s==="casual")return;if(!misKind(q))return;
  if(q.correct){if(view.mis)misRemove(q.lang,q.mid||misId(q));}else misAdd(q);}
function onAnswer(q){buzz(q.correct?30:[40,60,40]);misTrack(q);if(q.kk){kSet(q.kk.store,q.kk.key,q.correct);save();}else if(q.vitem){srsStep(q.vitem,q.correct);save();}else if(view.s==="review"&&!view.mis&&q.word){srsSet(q.lang,q.word.w,q.correct);save();}if(view.s==="place"){view.streak=q.correct?0:view.streak+1;}}

function qHTML(q,opts){
  if(q.type==="match"||q.type==="blank"||q.type==="build")return exHTML(q,opts);
  const l=q.lang,w=q.word;let h="";
  if(q.type==="gram"){
    h=`<p class="q">${esc(q.question)}</p>${q.big?glyph(l,{w:q.big}):""}${q.audio?`<p class="center" style="margin:8px 0"><button class="btn pri" data-a="${A(()=>say(q.audio,l))}">🔊 Play audio</button></p>`:""}<div class="stack">`;
    q.opts.forEach((o,i)=>{let cls="opt",tag="";
      if(q.answered){if(i===q.ans){cls+=" right";tag="Correct answer";}else if(i===q.sel){cls+=" wrong";tag="Your answer";}}else if(q.sel===i)cls+=" sel";
      h+=`<button class="${cls}" ${q.answered?"disabled":""} data-a="${A(()=>{q.sel=i;render();})}" aria-pressed="${q.sel===i}">${tag?`<span class="tag">${tag}</span>`:""}${q.plain?`<span>${esc(o.text)}</span>`:`<span class="cjk2" lang="${L[l].hl}">${esc(o.text)}</span>`}${S.settings.showReading&&o.reading?`<span class="tr2">${esc(o.reading)}</span>`:""}${o.english&&S.settings.showEnglish?`<span class="tr2">${esc(o.english)}</span>`:""}</button>`;});
    if(!q.answered)h+=`<button class="opt dk" data-a="${A(()=>{dontKnow(q);render();})}">I do not know</button>`;
    return h+`</div>`+fbHTML(q,opts||{});
  }
  const playBtn=`<button class="play" data-a="${A(()=>say(w.w,l))}" aria-label="Play audio" title="Play audio">${PLAY}</button>`;
  if(q.type==="meaning"){
    h+=`<p class="q">What does this word mean?</p>${glyph(l,w)}${readingHTML(l,w)}<p class="center">${playBtn}</p>`;
  }else if(q.type==="listen"){
    h+=`<p class="q">Listen. Which word did you hear?</p><p class="center" style="margin:10px 0"><button class="btn pri" data-a="${A(()=>say(w.w,l))}">${PLAY.replace('aria-hidden','style="width:16px;height:16px;fill:currentColor;vertical-align:-2px;margin-right:8px" aria-hidden')}Play audio</button></p>`;
  }else if(q.type==="type"){
    h+=`<p class="q">Type the reading of this word in ${L[l].rd}${l==="ja"?" or hiragana":""}.</p>${glyph(l,w)}<p class="meaning">${esc(w.m)}</p>
    <p class="small muted">${l==="zh"?"Tone marks are not required. Spaces are ignored.":"Long vowels can be typed as “ou”, “oo” or “o”. Spaces are ignored."}</p>
    <label class="sr" for="tin">Your answer</label><input id="tin" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" ${q.answered?"disabled":""} value="${esc(q.input)}" placeholder="Type here">`;
  }else if(q.type==="speak"){
    h+=`<p class="q">Say this word aloud.</p>${glyph(l,w)}${readingHTML(l,w,true)}<p class="meaning">${esc(w.m)}</p><p class="center">${playBtn}</p>`+speakHTML(q);
  }
  if(q.type==="meaning"||q.type==="listen"){
    h+=`<div class="opts">`;
    q.opts.forEach((o,i)=>{
      let cls="opt",tag="";
      if(q.answered){if(i===q.ans){cls+=" right";tag="Correct answer";}else if(i===q.sel){cls+=" wrong";tag="Your answer";}}
      else if(q.sel===i)cls+=" sel";
      const label=q.type==="meaning"?esc(o.m):cjk(l,o.w)+(S.settings.showReading?`<span class="tr2">${esc(o.r)}</span>`:"");
      h+=`<button class="${cls}" ${q.answered?"disabled":""} data-a="${A(()=>{q.sel=i;render();})}" aria-pressed="${q.sel===i}">${tag?`<span class="tag">${tag}</span>`:""}${label}</button>`;
    });
    if(!q.answered)h+=`<button class="opt dk" data-a="${A(()=>{dontKnow(q);render();})}">I do not know</button>`;
    h+=`</div>`;
  }
  if(q.type==="type"&&!q.answered)h+=`<button class="opt dk" data-a="${A(()=>{dontKnow(q);render();})}">I do not know</button>`;
  h+=fbHTML(q,opts||{});
  return h;
}
function speakHTML(q){
  const m=speakMode();let h=`<div style="margin-top:14px">`;
  if(q.srMsg)h+=`<p class="small"><strong>${esc(q.srMsg)}</strong></p>`;
  if(m==="recognize"){
    if(q.listening)h+=`<button class="btn sec full" disabled>Listening. Say the word now.</button>`;
    else if(!q.answered)h+=`<button class="btn pri full" data-a="${A(()=>startListen(q))}">🎤 Start speaking</button>`;
    else h+=`<button class="btn sec full" data-a="${A(()=>startListen(q))}">Try again for practice</button>`;
    if(q.practice)h+=`<p class="small">Practice attempt: ${q.practice.ok?"matched":"not matched"}. The app heard “${esc(q.practice.heard)}”.</p>`;
  }else if(m==="record"){
    if(!q.answered){
      if(q.recording)h+=`<button class="btn pri full" data-a="${A(()=>q.mr.stop())}">Stop recording</button>`;
      else h+=`<button class="btn ${q.recUrl?"sec":"pri"} full" data-a="${A(()=>startRec(q))}">${q.recUrl?"Record again":"Start recording"}</button>`;
      if(q.recUrl){h+=`<div class="inline" style="margin-top:10px"><button class="play" data-a="${A(()=>new Audio(q.recUrl).play())}">${PLAY}Play my recording</button><button class="play" data-a="${A(()=>say(q.word.w,q.lang))}" aria-label="Play audio" title="Play audio">${PLAY}</button></div>`+selfMark(q,"Compare the two recordings. Then choose one option.");}
    }
  }else{
    if(!q.answered)h+=selfMark(q,"Play the audio. Say the word aloud. Then choose one option.");
  }
  return h+`</div>`;
}
function selfMark(q,txt){return `<p class="small" style="margin:6px 0">${txt}</p><div class="stack"><button class="opt" data-a="${A(()=>{q.answered=true;q.correct=true;q.self=true;onAnswer(q);render();})}">My pronunciation matched</button><button class="opt" data-a="${A(()=>{q.answered=true;q.correct=false;q.self=true;onAnswer(q);render();})}">My pronunciation did not match</button></div>`;}
function fbHTML(q,o){
  if(!q.answered)return "";
  if(q.type==="gram"){const ps=[];if(q.dk)ps.push("You chose “I do not know”.");else if(!q.correct)ps.push(`You chose: ${q.plain?esc(q.opts[q.sel].text):cjk(q.lang,q.opts[q.sel].text)}`);if(!q.correct)ps.push(`The correct answer is: ${q.plain?esc(q.opts[q.ans].text):cjk(q.lang,q.opts[q.ans].text)}`);if(q.why)ps.push(esc(q.why));return `<div class="fb ${q.correct?"ok":"no"}" role="status"><strong>${q.correct?"✅ Correct.":"❌ Incorrect."}</strong>${ps.map(p=>`<p>${p}</p>`).join("")}</div>`;}
  const l=q.lang,w=q.word,ps=[];
  const detail=`${cjk(l,w.w)} (${esc(l==="ja"&&w.k&&w.k!==w.w?w.k+", "+w.r:w.r)}) means “${esc(w.m)}”.`;
  if(q.type==="meaning"||q.type==="listen"){
    if(q.dk)ps.push("You chose “I do not know”.");
    else if(!q.correct)ps.push(q.type==="meaning"?`You chose “${esc(q.opts[q.sel].m)}”.`:`You chose ${cjk(l,q.opts[q.sel].w)}.`);
    if(!q.correct)ps.push(q.type==="meaning"?`The correct answer is “${esc(w.m)}”.`:`The correct answer is ${cjk(l,w.w)}.`);
  }else if(q.type==="type"){
    if(q.dk)ps.push("You chose “I do not know”.");else ps.push(`You typed “${esc(q.input)}”.`);
    ps.push(`The correct reading is “${esc(w.r)}”${l==="ja"&&w.k?" or “"+esc(w.k)+"”":""}.`);
  }else if(q.type==="speak"){
    if(q.self)ps.push(q.correct?"You marked your pronunciation as matched.":"You marked your pronunciation as not matched.");
    else{ps.push(`The app heard “${esc(q.heard)}”.`);if(!q.correct)ps.push(`The expected word is ${cjk(l,w.w)}. Speech recognition can mishear words. Play the audio to compare. The first attempt is the one that counts. You can try again for practice.`);}
  }
  ps.push(detail);
  let h=`<div class="fb ${q.correct?"ok":"no"}" role="status"><strong>${q.correct?"✅ Correct.":(q.type==="speak"&&!q.self?"❌ Not matched.":"❌ Incorrect.")}</strong>${ps.map(p=>`<p>${p}</p>`).join("")}`;
  if(!q.correct&&!o.noAI&&!q.self&&!AI_OFF){
    if(q.explain===null)h+=`<p style="margin-top:10px"><button class="play" data-a="${A(()=>explain(q))}">Explain with AI</button></p>`;
    else if(q.explain==="loading")h+=`<p class="small" style="margin-top:10px">Writing the explanation. This takes up to 20 seconds.</p>`;
    else h+=`<p style="margin-top:10px"><strong>Explanation:</strong> ${esc(q.explain)}</p>`;
  }
  return h+`</div>`;
}
async function explain(q){
  q.explain="loading";render();
  const s=await hasAI();if(!s){q.explain="AI is not available in this view.";render();return;}
  const w=q.word,l=q.lang;let given=q.dk?"I do not know":"";
  if(!q.dk){if(q.type==="meaning")given=q.opts[q.sel].m;else if(q.type==="listen")given=q.opts[q.sel].w;else if(q.type==="type")given=q.input;else given="spoken: "+(q.heard||"");}
  const prompt=`A learner of ${L[l].full} answered a quiz question incorrectly.
Question type: ${q.type==="meaning"?"choose the English meaning of a word":q.type==="listen"?"hear audio and choose the written word":q.type==="type"?"type the "+L[l].rd+" reading":"say the word aloud"}.
Target word: ${w.w}${w.k?" ("+w.k+")":""}, reading ${w.r}, meaning "${w.m}".
Learner's answer: ${given}.
Explain in 2 or 3 short, literal sentences why the target answer is correct and how to tell the learner's answer apart from it (for example a different character, tone, sound or meaning). Rules: no idioms, no metaphors, no sarcasm, no praise or encouragement phrases, no questions. Plain text only.`;
  try{q.explain=(await aiText(prompt,{modelTier:"quick"})).trim();}catch(e){q.explain=aiErr(e);}
  render();
}

