"use strict";
/* Language Steps: exercise-types.js. Match pairs, build sentence, listen and build, build English, fill the blank.
   Files load in the order listed in js/loader.js (APP_FILES); they share one global scope. */
/* ---------- New exercise types ---------- */
const isPunctTok=t=>PUNCT.test(t[0])||(!t[1]&&!t[2]);
const contentToks=s=>s.tokens.filter(t=>!isPunctTok(t));
function stripSpk(s){const i=s.tokens.findIndex(t=>t[0]==="："||t[0]===":");if(i<0||i>4)return s;const e=s.english.replace(/^[^:]{1,40}:\s*/,"");return{tokens:s.tokens.slice(i+1),english:e};}
function enWords(e){return e.split(/\s+/).map(w=>w.replace(/^[“"(]+|[.,!?;:”")]+$/g,"")).filter(Boolean);}
const normW=x=>String(x).toLowerCase();
function themeIdxOf(l,w){const ths=themes(l);for(let i=0;i<ths.length;i++)if(ths[i].words&&ths[i].words.includes(w))return i;return 0;}
function poolFor(l,words){const idx=[...new Set(words.map(w=>themeIdxOf(l,w)))];return idx.flatMap(i=>{const c=chapter(l,i);return ((CUR[l][i]||{}).sents||[]).concat(c?c.lines:[]);}).map(stripSpk).filter(s=>contentToks(s).length>=1);}
function mkBuild(l,s,mode,pool,word){
  const base={type:"build",mode,lang:l,sent:s,placed:[],word:word||null,answered:false,correct:false,sel:null,input:""};
  if(mode==="toEn"){
    const words=enWords(s.english),have=new Set(words.map(normW)),dis=[];
    shuffle(pool.filter(x=>x!==s)).forEach(x=>enWords(x.english).forEach(w=>{if(!have.has(normW(w))&&!dis.some(d=>normW(d)===normW(w)))dis.push(w);}));
    return Object.assign(base,{answer:words,tiles:shuffle([...words,...dis.slice(0,3)].map((t,i)=>({id:i,text:t})))});
  }
  const ans=contentToks(s),have=new Set(ans.map(t=>t[0])),dis=[];
  shuffle(pool.filter(x=>x!==s)).forEach(x=>contentToks(x).forEach(t=>{if(!have.has(t[0])&&!dis.some(d=>d[0]===t[0]))dis.push(t);}));
  return Object.assign(base,{answer:ans.map(t=>t[0]),tiles:shuffle([...ans,...dis.slice(0,3)].map((t,i)=>({id:i,text:t[0],reading:t[1]})))});
}
function mkBlank(l,s,w,pool){
  const idx=s.tokens.findIndex(t=>t[0]===w.w);if(idx<0)return null;
  const c=[];shuffle(pool).forEach(x=>contentToks(x).forEach(t=>{if(t[0]!==w.w&&!c.some(k=>k[0]===t[0]))c.push(t);}));
  shuffle(allWords(l)).forEach(x=>{if(c.length<6&&x.w!==w.w&&!c.some(k=>k[0]===x.w))c.push([x.w,x.r,x.m]);});
  const opts=shuffle([s.tokens[idx],...c.slice(0,3)]).map(t=>({text:t[0],reading:t[1]}));
  return{type:"blank",lang:l,sent:s,idx,opts,ans:opts.findIndex(o=>o.text===w.w),word:w,answered:false,correct:false,sel:null,input:""};
}
function mkMatch(l,ws){const p=ws.slice(0,5);return{type:"match",lang:l,pairs:p,left:shuffle(p.map((w,i)=>i)),right:shuffle(p.map((w,i)=>i)),pick:null,done:[],wrong:null,mistakes:0,answered:false,correct:false,word:null,sel:null,input:""};}
function matchTap(q,side,i){
  if(q.answered||q.done.includes(i))return;q.wrong=null;
  if(side==="L")say(q.pairs[i].w,q.lang);
  if(!q.pick||q.pick.side===side){q.pick={side,i};render();return;}
  if(q.pick.i===i){q.done.push(i);}else{q.mistakes++;q.wrong={L:side==="L"?i:q.pick.i,R:side==="R"?i:q.pick.i};buzz([40,60,40]);}
  q.pick=null;
  if(q.done.length===q.pairs.length){q.answered=true;q.correct=q.mistakes===0;onAnswer(q);}
  render();
}
function buildQuiz(l,words,k){
  const pool=poolFor(l,words),qs=[];
  if(words.length>=3)qs.push(mkMatch(l,shuffle(words).slice(0,5)));
  const types=["meaning","blank","listen","type","speak"];
  words.forEach((w,i)=>{let t=types[i%types.length];if(t==="blank"){const s=pool.find(x=>x.tokens.some(z=>z[0]===w.w));const b=s&&mkBlank(l,s,w,pool);if(b){qs.push(b);return;}t="meaning";}qs.push(mkQ(t,w,l));});
  const cands=pool.filter(s=>{const n=contentToks(s).length;return n>=2&&n<=7;});
  const own=[...new Set(words.map(w=>themeIdxOf(l,w)))].flatMap(i=>(CUR[l][i]||{}).sents||[]).filter(s=>{const n=contentToks(s).length;return n>=2&&n<=8;});
  if(own.length){const modes=["build","listen","toEn","build"];shuffle(own).slice(0,4).forEach((s,j)=>qs.push(mkBuild(l,s,modes[j],pool)));return qs;}
  const pick=shuffle(cands.length?cands:pool).slice(0,2);
  if(pick[0])qs.push(mkBuild(l,pick[0],"build",pool));
  if(pick[1])qs.push(mkBuild(l,pick[1],(k||0)%2?"toEn":"listen",pool));
  return qs;
}
function tileHTML(q,t){return q.mode==="toEn"?esc(t.text):`<span class="cjk2" lang="${L[q.lang].hl}">${esc(t.text)}</span>${S.settings.showReading&&t.reading?`<span class="tr2">${esc(t.reading)}</span>`:""}`;}
function exHTML(q,opts){
  const l=q.lang;let h="";
  if(q.type==="match"){
    h=`<p class="q">🧩 Match the pairs</p><p class="small muted">Tap a word, then tap its meaning. 🔊 plays when you tap a word.</p><div class="mgrid"><div class="stack">`;
    q.left.forEach(i=>{const w=q.pairs[i],d=q.done.includes(i),wr=q.wrong&&q.wrong.L===i,pk=q.pick&&q.pick.side==="L"&&q.pick.i===i;
      h+=`<button class="opt${d?" right":wr?" wrong":pk?" sel":""}" ${d||q.answered?"disabled":""} data-a="${A(()=>matchTap(q,"L",i))}">${d?'<span class="tag">✅</span>':wr?'<span class="tag">❌</span>':""}<span class="cjk2" lang="${L[l].hl}">${esc(w.w)}</span>${S.settings.showReading?`<span class="tr2">${esc(w.r)}</span>`:""}</button>`;});
    h+=`</div><div class="stack">`;
    q.right.forEach(i=>{const w=q.pairs[i],d=q.done.includes(i),wr=q.wrong&&q.wrong.R===i,pk=q.pick&&q.pick.side==="R"&&q.pick.i===i;
      h+=`<button class="opt${d?" right":wr?" wrong":pk?" sel":""}" ${d||q.answered?"disabled":""} data-a="${A(()=>matchTap(q,"R",i))}">${d?'<span class="tag">✅</span>':wr?'<span class="tag">❌</span>':""}${esc(w.m)}</button>`;});
    h+=`</div></div>`;
    if(q.answered)h+=`<div class="fb ${q.correct?"ok":"no"}" role="status"><strong>${q.correct?"✅ All pairs matched with no mistakes.":`🟡 All pairs matched. Mistakes: ${q.mistakes}.`}</strong></div>`;
    return h;
  }
  if(q.type==="blank"){
    const s=q.sent;
    h=`<p class="q">✏️ Choose the missing word</p><p class="ex" lang="${L[l].hl}">${s.tokens.map((t,i)=>i===q.idx?`<span class="blank">${q.answered?esc(t[0]):"＿＿"}</span>`:esc(t[0])).join("")}</p>${S.settings.showReading?`<p class="muted" style="margin:0 0 4px">${esc(s.tokens.map((t,i)=>i===q.idx&&!q.answered?"___":t[1]).filter(Boolean).join(" "))}</p>`:""}${S.settings.showEnglish?`<p class="eng">${esc(s.english)}</p>`:""}<div class="opts">`;
    q.opts.forEach((o,i)=>{let cls="opt",tag="";if(q.answered){if(i===q.ans){cls+=" right";tag="Correct answer";}else if(i===q.sel){cls+=" wrong";tag="Your answer";}}else if(q.sel===i)cls+=" sel";
      h+=`<button class="${cls}" ${q.answered?"disabled":""} data-a="${A(()=>{q.sel=i;render();})}">${tag?`<span class="tag">${tag}</span>`:""}<span class="cjk2" lang="${L[l].hl}">${esc(o.text)}</span>${S.settings.showReading&&o.reading?`<span class="tr2">${esc(o.reading)}</span>`:""}</button>`;});
    if(!q.answered)h+=`<button class="opt dk" data-a="${A(()=>{dontKnow(q);render();})}">I do not know</button>`;
    h+=`</div>`;
    if(q.answered)h+=`<div class="fb ${q.correct?"ok":"no"}" role="status"><strong>${q.correct?"✅ Correct.":"❌ Incorrect."}</strong>${q.correct?"":`<p>The missing word is ${cjk(l,q.sent.tokens[q.idx][0])} (${esc(q.sent.tokens[q.idx][1])}).</p>`}<div style="margin-top:6px">${sentHTML(l,q.sent,q.word?[q.word]:[])}</div></div>`;
    return h;
  }
  /* build, listen-build, to English */
  const s=q.sent,text=sentText(s);
  if(q.mode==="build")h=`<p class="q">🔨 Build this sentence in ${L[l].name}</p><p class="meaning" style="text-align:left">${esc(s.english)}</p>`;
  else if(q.mode==="listen")h=`<p class="q">👂 Listen, then build what you hear</p><div class="inline" style="justify-content:center;margin:6px 0"><button class="play" aria-label="Play audio" title="Play audio" data-a="${A(()=>sayAt(text,l,1))}">${PLAY}</button></div>`;
  else h=`<p class="q">🔁 Build the English meaning</p><div class="sent"><div class="sbody"><p class="ex" lang="${L[l].hl}">${esc(text)}</p>${S.settings.showReading?`<p class="muted" style="margin:0">${esc(s.tokens.map(t=>t[1]).filter(Boolean).join(" "))}</p>`:""}</div><button class="play" aria-label="Play audio" title="Play audio" data-a="${A(()=>sayAt(text,l,1))}">${PLAY}</button></div>`;
  const placed=q.placed.map(id=>q.tiles.find(t=>t.id===id));
  h+=`<div class="ansrow">${placed.length?placed.map(t=>`<button class="tile" ${q.answered?"disabled":""} data-a="${A(()=>{q.placed=q.placed.filter(x=>x!==t.id);render();})}">${tileHTML(q,t)}</button>`).join(""):`<span class="small muted">Tap the words below in the correct order. Tap a word here to remove it.</span>`}</div>`;
  h+=`<div class="bank">${q.tiles.map(t=>q.placed.includes(t.id)?`<span class="tile ghost">${tileHTML(q,t)}</span>`:`<button class="tile" ${q.answered?"disabled":""} data-a="${A(()=>{q.placed.push(t.id);render();})}">${tileHTML(q,t)}</button>`).join("")}</div>`;
  if(!q.answered)h+=`<button class="opt dk" style="margin-top:10px" data-a="${A(()=>{dontKnow(q);render();})}">I do not know</button>`;
  else{
    const got=placed.map(t=>t.text).join(q.mode==="toEn"?" ":"");
    h+=`<div class="fb ${q.correct?"ok":"no"}" role="status"><strong>${q.correct?"✅ Correct.":"❌ Incorrect."}</strong>${!q.correct&&!q.dk?`<p>Your answer: ${q.mode==="toEn"?esc(got):cjk(l,got)}</p>`:""}${!q.correct?`<p>The correct answer is:</p>`:""}<div style="margin-top:6px">${sentHTML(l,s,[])}</div></div>`;
  }
  return h;
}
function checkBuild(q){const got=q.placed.map(id=>q.tiles.find(t=>t.id===id).text);q.correct=got.length===q.answer.length&&got.every((x,i)=>normW(x)===normW(q.answer[i]));}

