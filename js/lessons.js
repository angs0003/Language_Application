"use strict";
/* Language Steps: lessons.js. View state, click handling, placement quiz, lesson flow, review session, settings.
   Files load in the order listed in js/loader.js (APP_FILES); they share one global scope. */
/* ---------- View state ---------- */
let view={s:"home"};
let acts={};
function A(fn){const k="a"+(++A.n);acts[k]=fn;return k;}A.n=0;
document.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b||b.disabled)return;buzz(10);const f=acts[b.dataset.a];if(f)f(e);});
document.addEventListener("change",e=>{if(e.target.id==="lvl"){LVSEL[S.lang]=+e.target.value;view.lvl=null;render();}});
document.addEventListener("input",e=>{if(e.target.id==="vsearch"){const q=e.target.value.trim().toLowerCase();document.querySelectorAll("#vlist li").forEach(li=>{li.style.display=!q||li.dataset.s.includes(q)?"":"none";});return;}if(e.target.id==="tin"&&view.q){view.q.input=e.target.value;const nb=document.getElementById("nextbtn");if(nb)nb.disabled=!canCheck(view.q);}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(document.getElementById("callout")){const b=closeCallout();if(b&&document.contains(b))b.focus();return;}if(view.sheet){closeSheet();return;}}if(e.key==="Enter"&&e.target.id==="tin"&&view.q&&canCheck(view.q)){checkQ(view.q);render();}});

function goHome(){try{playTok++;speechSynthesis.cancel();}catch(e){}view=libSec?{s:"lib",sec:libSec}:{s:"home"};noteText="";render();window.scrollTo(0,0);}
function setLang(l){S.lang=l;save();goHome();}
/* System Back (the Android back gesture or button, the browser back button): while a screen that is not a tab screen is open, one history entry is pushed.
   Going back then fires popstate and runs the same Back as the bottom bar (or goes to the tab screen). On a tab screen there is no extra entry, so Back leaves the app. */
/* Chrome skips history entries that a page adds without a tap, so one entry pushed inside the back handler is skipped by the next swipe and the app closes.
   Therefore several entries are pushed while a tap is handled (HIST_BUF) and refilled on later taps; histDepth counts the entries behind the current one. Leaving to a tab screen goes back over the rest. */
const HIST_BUF=8;let histDepth=0,histIgnore=0,histDeep=false,lastBack=null;
function histFill(){if(histIgnore>0)return;while(histDepth<HIST_BUF){try{history.pushState({ls:1},"",location.href);histDepth++;}catch(e){break;}}}
function syncHistory(deep){
  histDeep=deep;
  if(deep){if(histDepth===0)histFill();}
  else if(histDepth>0){const n=histDepth;histDepth=0;histIgnore++;try{history.go(-n);}catch(e){histIgnore--;}}
}
document.addEventListener("click",()=>{if(histDeep&&histDepth<HIST_BUF)histFill();},true);
window.addEventListener("popstate",()=>{
  if(histIgnore>0){histIgnore--;if(histIgnore===0&&histDeep&&histDepth===0)histFill();return;}
  if(histDepth<=0)return;
  histDepth--;
  if(document.getElementById("callout")){closeCallout();}
  else if(view.confirm){view.confirm=false;render();}
  else if(view.sheet){closeSheet();}
  else if(lastBack)lastBack();else goHome();
  if(histDeep&&histDepth===0)histFill();
});

/* ---------- Screens ---------- */
async function genTheme(l,gi){
  const s=await hasAI();if(!s)return "AI is not available in this view. AI is needed to create words for this theme.";
  const known=allWords(l).map(w=>w.w);
  const level=l==="zh"?"the HSK 1 vocabulary list (use HSK 2 words only if HSK 1 has no more words for this theme)":"the JLPT N5 vocabulary list";
  const prompt=`Create a vocabulary set for a learner of ${L[l].full}.
Theme: ${AI_THEMES[gi]}.
Choose 10 common words from ${level} that fit the theme.
Do NOT use any of these words, because the learner already has them: ${known.join(", ")}.
For each word write one short example sentence that uses the word plus simple words.
Rules: literal meanings, no idioms, no metaphors.
Reply with only JSON in this shape:
{"words":[{"w":"the word as normally written","k":"${l==="ja"?"hiragana reading":""}","r":"${l==="zh"?"pinyin with tone marks":"romaji, long vowels written as ou or uu"}","m":"English meaning, 1 to 4 words","ex":["example sentence","reading of the sentence in ${L[l].rd}","literal English translation"]}]}`;
  try{
    const d=await aiJSON(prompt,{cache:false});
    if(!d||!Array.isArray(d.words))throw{code:"invalid_json"};
    const seen=new Set(known),words=[];
    for(const x of d.words){
      if(!(x&&x.w&&x.r&&x.m&&Array.isArray(x.ex)&&x.ex.length===3))continue;
      const w=String(x.w);if(seen.has(w))continue;seen.add(w);
      const o={w,r:String(x.r),m:String(x.m),ex:x.ex.map(String)};if(l==="ja")o.k=String(x.k||x.w);
      words.push(o);if(words.length===10)break;
    }
    if(words.length<5)throw{code:"invalid_json"};
    S[l].gen[gi]=words;save();return "";
  }catch(e){return aiErr(e);}
}
async function startNext(){
  const l=S.lang,n=S.settings.size;let nw=nextWords(l,n),err="";
  while(nw.words.length<n&&nw.needGen!=null){
    view.gen="loading";view.genTitle=nw.genTitle;render();
    err=await genTheme(l,nw.needGen);nw=nextWords(l,n);if(err)break;
  }
  view.gen=err||null;
  if(!nw.words.length){render();return;}
  startLesson(nw.words,nw.titles.join(" and "));
}
async function startTest(i){
  const l=S.lang;let t=themes(l)[i];
  if(!t.words){
    view.gen="loading";view.genTitle=t.title;render();
    const err=await genTheme(l,t.gi);view.gen=err||null;if(err){render();return;}t=themes(l)[i];
  }
  const sh=shuffle(t.words),ws=[];for(let k=0;k<6;k++)ws.push(sh[k%sh.length]);const types=["meaning","listen","type"];
  view={s:"test",title:t.title,words:t.words,qs:ws.map((w,k)=>mkQ(types[k%3],w,l)),i:0,finished:false};render();window.scrollTo(0,0);
}
function screenTest(){
  const v=view,l=S.lang,need=Math.ceil(v.qs.length*5/6);
  if(v.finished){
    const c=v.qs.filter(q=>q.correct).length,pass=c>=need;
    return {row:"title",title:"Test out: "+v.title,prog:`<div class="ptext">Test out: finished</div><div class="psub">Correct: ${c} of ${v.qs.length}</div><div class="bar"><i style="width:100%"></i></div>`,
      main:`<div class="card"><h2>${pass?"Passed":"Not passed"}</h2><p>Correct: ${c} of ${v.qs.length}. The pass mark is ${need}.</p><p>${pass?`All ${v.words.length} words in “${esc(v.title)}” are marked as learned and added to your review list.`:"No words are marked as learned. This theme stays in your normal lessons."}</p></div>`,
      back:{label:"Back",dis:true},next:{label:pass?"Save and go to home":"Go to home",fn:()=>{if(pass){v.words.forEach((w,k)=>{if(!S[l].srs[w.w])S[l].srs[w.w]={b:3,d:Date.now()+(k%4)*DAY,u:Date.now()};});save();}goHome();}}};
  }
  const q=v.qs[v.i];view.q=q;
  const r={row:"title",title:"Test out: "+v.title,exit:true,prog:`<div class="ptext">Test out: question ${v.i+1} of ${v.qs.length}</div><div class="psub">Pass mark: ${need} correct</div><div class="bar"><i style="width:${Math.round(v.i/v.qs.length*100)}%"></i></div>`,
    main:`<div class="card">${qHTML(q,{noAI:true})}</div>`,back:{label:"Back",fn:()=>{if(v.i===0){view.confirm=true;render();window.scrollTo(0,0);}else{v.i--;render();window.scrollTo(0,0);}}}};
  if(!q.answered)r.next={label:"Check answer",fn:()=>{checkQ(q);render();},dis:!canCheck(q)};
  else r.next={label:"Continue",fn:()=>{if(v.i>=v.qs.length-1)v.finished=true;else v.i++;render();window.scrollTo(0,0);}};
  return r;
}

/* Placement */
function startPlacement(){
  const l=S.lang,qs=[];
  CUR[l].forEach((u,ui)=>{[0,3].forEach(wi=>{const q=mkQ("meaning",u.words[wi],l);q.unit=ui;qs.push(q);});});
  view={s:"place",qs,i:0,streak:0,finished:false};render();window.scrollTo(0,0);
}
function screenPlace(){
  const l=S.lang,v=view;
  if(v.finished){
    const passed=[];for(let u=0;u<CUR[l].length;u++){const qs=v.qs.filter(q=>q.unit===u);if(qs.every(q=>q.answered&&q.correct))passed.push(u);else break;}
    const start=passed.length;
    return {row:"title",title:"Placement quiz",prog:`<div class="ptext">Placement quiz: finished</div><div class="psub">Correct answers: ${v.qs.filter(q=>q.correct).length} of ${v.qs.filter(q=>q.answered).length}</div><div class="bar"><i style="width:100%"></i></div>`,
      main:`<div class="card"><h2>Result</h2><p>Your starting theme is Theme ${start+1}${start<CUR[l].length?", "+esc(CUR[l][start].title):", "+esc(AI_THEMES[0])}.</p>${start?`<p>Themes 1 to ${start} are marked as learned. Their words are added to your review list.</p>`:"<p>No themes are marked as learned.</p>"}</div>`,
      back:{label:"Back",dis:true},next:{label:"Save and go to home",fn:()=>{const st=S[l];st.placed=true;passed.forEach((u,ui)=>CUR[l][u].words.forEach((w,wi)=>{if(!S[l].srs[w.w])S[l].srs[w.w]={b:3,d:Date.now()+((ui+wi)%4)*DAY,u:Date.now()};}));save();goHome();}}};
  }
  const q=v.qs[v.i];view.q=q;
  const r={row:"title",title:"Placement quiz",exit:true,
    prog:`<div class="ptext">Placement quiz: question ${v.i+1} of up to ${v.qs.length}</div><div class="psub">Incorrect answers in a row: ${v.streak} of 3</div><div class="bar"><i style="width:${Math.round(v.i/v.qs.length*100)}%"></i></div>`,
    main:`<div class="card">${qHTML(q,{noAI:true})}</div>`,back:{label:"Back",fn:()=>{if(v.i===0){view.confirm=true;render();window.scrollTo(0,0);}else{v.i--;render();window.scrollTo(0,0);}}}};
  if(!q.answered)r.next={label:"Check answer",fn:()=>{checkQ(q);render();},dis:!canCheck(q)};
  else r.next={label:"Continue",fn:()=>{if(v.streak>=3||v.i>=v.qs.length-1)v.finished=true;else v.i++;render();window.scrollTo(0,0);}};
  return r;
}

/* Lesson */
function cleanTok(a){if(!Array.isArray(a))return[];return a.filter(t=>Array.isArray(t)&&t[0]!=null&&String(t[0]).length).map(t=>[String(t[0]),String(t[1]==null?"":t[1]),String(t[2]==null?"":t[2])]);}
function cleanSent(x){if(!x)return null;const tokens=cleanTok(x.tokens);if(!tokens.length)return null;return{tokens,english:String(x.english||"")};}
const sentText=s=>s.tokens.map(t=>t[0]).join("");
const PUNCT=/^[\s。、，,.!?！？：:；;「」『』“”"'（）()…·\-]+$/;
function glossHTML(l,tokens,hw,plain){
  const set=new Set((hw||[]).map(w=>w.w));
  return `<div class="gl">${tokens.map(t=>{
    if(PUNCT.test(t[0])||(!t[1]&&!t[2]))return `<span class="tk pu"><span class="tx" lang="${L[l].hl}">${esc(t[0])}</span></span>`;
    return `<button class="tk${set.has(t[0])?" hw":""}" data-a="${A(e=>openWord(l,t,tokens,e))}"><span class="tx" lang="${L[l].hl}">${(()=>{const f=furiFor(l,t);return f?`<ruby>${esc(t[0])}<rt>${esc(f)}</rt></ruby>`:esc(t[0]);})()}</span>${S.settings.gloss&&!plain?`<span class="tr">${esc(t[1])}</span><span class="tm">${esc(t[2])}</span>`:""}</button>`;}).join("")}</div>`;
}
function sentHTML(l,s,hw){return `<div class="sent"><div class="sbody">${glossHTML(l,s.tokens,hw)}${S.settings.showEnglish&&s.english?`<p class="eng">${esc(s.english)}</p>`:""}</div><button class="play" data-a="${A(()=>say(spokenText(s),l))}" aria-label="Play audio" title="Play audio">${PLAY}</button></div>`;}
function builtinEx(l,w,hw){return `<div class="sent"><div class="sbody"><p class="ex" lang="${L[l].hl}">${hl(w.ex[0],hw||[w])}</p>${S.settings.showReading?`<p class="muted" style="margin:0 0 4px">${esc(w.ex[1])}</p>`:""}${S.settings.showEnglish?`<p class="eng">${esc(w.ex[2])}</p>`:""}</div><button class="play" data-a="${A(()=>say(w.ex[0],l))}" aria-label="Play audio" title="Play audio">${PLAY}</button></div>`;}
function voicesFor(l){const c=L[l].code.toLowerCase();let v=voices.filter(x=>x.lang.replace("_","-").toLowerCase()===c);if(!v.length)v=voices.filter(x=>x.lang.toLowerCase().startsWith(l));return v;}
/* Speaker lines: a story line starts with a name and a colon ("Ken ： good morning"). The name and colon are not spoken.
   Each speaker gets a different voice and pitch instead, in the order the speakers first appear in the text. */
function spkSkip(s){const t=s.tokens;return t&&t.length>2&&/^\s*[：:]\s*$/.test(t[1][0])&&!PUNCT.test(t[0][0])?2:0;}
function spkName(s){return spkSkip(s)?s.tokens[0][0]:(s.spk||"");}
function spokenText(s){return s.tokens.slice(spkSkip(s)).map(t=>t[0]).join("");}
function spkMap(lines){const m={};let n=0;lines.forEach(s=>{const k=spkName(s);if(k&&!(k in m))m[k]=n++;});return m;}
/* index of the speaker of line s, or undefined when the text has fewer than 2 speakers */
function spkIdx(map,s){return Object.keys(map).length>1?map[spkName(s)]:undefined;}
const FEM_RE=/female|woman|kyoko|haruka|ayumi|nanami|mizuki|sayaka|mei-?jia|ting-?ting|hanhan|huihui|yaoyao|xiaoxiao|xiaoyi|lili/i;
const SPK_PITCH=[1.1,0.85,1.3,0.7];
/* Sets the voice and pitch of utterance u for speaker number idx. pool = the voices of the language.
   Voices alternate between ones whose name looks female and the others (the name is the only hint the browser gives). */
function applySpeaker(u,pool,idx){
  if(idx==null||idx<0){if(pool[0])u.voice=pool[0];return;}
  const fem=pool.filter(v=>FEM_RE.test(v.name||"")),oth=pool.filter(v=>!FEM_RE.test(v.name||"")),order=[];
  for(let i=0;i<Math.max(fem.length,oth.length);i++){if(fem[i])order.push(fem[i]);if(oth[i])order.push(oth[i]);}
  if(order.length)u.voice=order[idx%order.length];
  u.pitch=SPK_PITCH[idx%SPK_PITCH.length];
}
/* Spoken-word highlight. hlTrack(u,tokens,rootFn,alive) marks the token being spoken by utterance u:
   by the voice's word boundary events when it sends them, otherwise by a timing estimate from the token lengths.
   rootFn returns the element that holds the .tk elements (one per token, in order); alive() says whether this playback is still current. */
const HL={t:[],msPerChar:220};
function hlDom(){document.querySelectorAll(".tk.spoken").forEach(e=>e.classList.remove("spoken"));}
function hlClear(){HL.t.forEach(clearTimeout);HL.t=[];hlDom();}
/* skip = number of leading tokens that are not spoken (a speaker name and colon). */
function hlTrack(u,tokens,rootFn,alive,skip=0){
  if(S.settings.hlWord===false||!tokens||tokens.length<=skip)return;
  const offs=[];let o=0;tokens.forEach((t,i)=>{offs.push(i<skip?-1:o);if(i>=skip)o+=t[0].length;});
  const mark=i=>{if(!alive())return;hlDom();const r=rootFn();if(!r)return;const el=r.querySelectorAll(".tk")[i];if(el)el.classList.add("spoken");};
  const at=c=>{let k=skip;for(let j=skip;j<offs.length;j++)if(offs[j]<=c)k=j;return k;};
  let gotB=false;
  u.onboundary=e=>{if(e.name&&e.name!=="word")return;if(!gotB){gotB=true;HL.t.forEach(clearTimeout);HL.t=[];}mark(at(e.charIndex||0));};
  u.onstart=()=>{
    if(!alive())return;mark(skip);HL.t.forEach(clearTimeout);HL.t=[];
    const per=HL.msPerChar/(0.9*S.settings.speed);let tm=0;
    tokens.forEach((t,i)=>{if(i<skip)return;if(i>skip)HL.t.push(setTimeout(()=>{if(!gotB)mark(i);},tm));tm+=PUNCT.test(t[0])?120:per*t[0].length;});
  };
}
function sayLines(lines,l){
  if(!("speechSynthesis" in window)){note("This browser cannot play speech audio.");return;}
  speechSynthesis.cancel();hlClear();const tok=++playTok,vs=voicesFor(l),map=spkMap(lines);
  const rootAt=k=>()=>{const r=document.querySelectorAll("#main .line");return r.length===lines.length?r[k]:null;};
  lines.forEach((x,k)=>{const u=new SpeechSynthesisUtterance(spokenText(x));u.lang=L[l].code;const si=spkIdx(map,x);
    if(si!=null)applySpeaker(u,vs,si);else{const b=x.speaker==="B";const v=vs.length>1?vs[b?1:0]:vs[0];if(v)u.voice=v;if(vs.length<2)u.pitch=b?0.75:1.25;}
    u.rate=0.9*S.settings.speed;hlTrack(u,x.tokens,rootAt(k),()=>tok===playTok,spkSkip(x));if(k===lines.length-1)u.onend=()=>{if(tok===playTok)hlClear();};speechSynthesis.speak(u);});
}
/* Word reference card */
/* Word callout: tapping a word opens a small box above it (below it when there is no room above) with the reading and the meaning, and reads the word aloud.
   It is not part of render(): render() closes it. The old bottom sheet (openWordSheet, sheetHTML) is kept for when AI is turned on. */
let calloutBtn=null;
function closeCallout(){const c=document.getElementById("callout");if(c)c.remove();if(calloutBtn){calloutBtn.classList.remove("on");calloutBtn.removeAttribute("aria-expanded");}const b=calloutBtn;calloutBtn=null;return b;}
function placeCallout(c,btn){
  const r=btn.getBoundingClientRect(),vw=document.documentElement.clientWidth,hd=document.getElementById("hd"),topLimit=Math.max(0,hd?hd.getBoundingClientRect().bottom:0);
  c.style.visibility="hidden";c.style.maxWidth=Math.min(280,vw-16)+"px";document.body.appendChild(c);
  const w=c.offsetWidth,h=c.offsetHeight,cx=r.left+r.width/2,left=Math.max(8,Math.min(cx-w/2,vw-w-8)),above=r.top-h-12>=topLimit+4;
  /* a word inside a fixed area (the quiz feedback panel) keeps the callout fixed too, so it does not drift when the page scrolls */
  let fixed=false;for(let p=btn;p&&p!==document.body;p=p.parentElement){if(getComputedStyle(p).position==="fixed"){fixed=true;break;}}
  c.style.position=fixed?"fixed":"";const ox=fixed?0:window.scrollX,oy=fixed?0:window.scrollY;
  c.style.left=(left+ox)+"px";c.style.top=((above?r.top-h-12:r.bottom+12)+oy)+"px";
  c.classList.toggle("below",!above);c.style.setProperty("--ax",Math.max(18,Math.min(w-18,cx-left))+"px");c.style.visibility="";
}
function openWord(l,t,toks,e){
  const btn=e&&e.target&&e.target.closest?e.target.closest(".tk,.wordrow"):null;
  if(!btn){openWordSheet(l,t,toks);return;}
  if(calloutBtn===btn&&document.getElementById("callout")){closeCallout();return;}
  const all=()=>[...document.querySelectorAll(".tk:not(.pu)")],idx=all().indexOf(btn);
  closeCallout();
  if(view.s==="player"&&view.playing)plStop(view);/* stopping may redraw the screen, so find the tapped word again */
  const b=document.contains(btn)?btn:all()[idx];if(!b)return;
  const k=allWords(l).find(w=>w.w===t[0]),sh={l,text:t[0],r:k?k.r:t[1],m:k?k.m:t[2],data:null,sent:toks?toks.map(x=>x[0]).join(""):"",tk:toks&&toks.length<=20?toks:null,src:srcLabel()};
  const c=document.createElement("div");c.id="callout";c.className="callout";c.setAttribute("role","status");c.setAttribute("aria-label","Word meaning");
  c.innerHTML=`<span class="cohd"><span class="tx" lang="${L[l].hl}">${esc(sh.text)}</span>${sh.r?`<span class="cor">${esc(sh.r)}</span>`:""}</span><span class="com">${esc(sh.m||"")}</span><i class="coar"></i>`;
  placeCallout(c,b);calloutBtn=b;b.classList.add("on");b.setAttribute("aria-expanded","true");
  if("speechSynthesis" in window)say(sh.text,l);/* the word is read aloud when you tap it; without speech the callout still opens (say() would show a note, and a note redraws the screen and closes the callout) */
}
document.addEventListener("click",e=>{if(document.getElementById("callout")&&!e.target.closest("#callout")&&!e.target.closest(".tk,.wordrow"))closeCallout();});
window.addEventListener("resize",closeCallout);
/* The star on the New word card of a lesson saves the word to My words (with its example sentence). */
function starWord(l,w,ev){
  const b=ev.target.closest("button"),sh={l,text:w.w,r:w.r,m:w.m,sent:w.ex[0],tk:w.tk&&w.tk.tokens.length<=20?w.tk.tokens:null,src:srcLabel()};
  toggleSave(sh,true);const s=isSaved(l,w.w);b.classList.toggle("on",s);b.setAttribute("aria-pressed",s);b.setAttribute("aria-label",s?"Remove from My words":"Save to My words");
}
function openWordSheet(l,t,toks){if(view.s==="player"&&view.playing)plStop(view);const k=allWords(l).find(w=>w.w===t[0]);view.sheet={l,text:t[0],r:k?k.r:t[1],m:k?k.m:t[2],state:"",data:null,sent:toks?toks.map(x=>x[0]).join(""):"",tk:toks&&toks.length<=20?toks:null,src:srcLabel()};if(!AI_OFF)loadRef(view.sheet);render();}
function closeSheet(){view.sheet=null;render();}
async function loadRef(sh){
  const c=S[sh.l].ref[sh.text];if(c){sh.data=c;return;}
  sh.state="loading";
  const s=await hasAI();if(!s){sh.state="AI is not available in this view. Only the reading and meaning are shown.";if(view.sheet===sh)render();return;}
  const l=sh.l;
  const prompt=`Give reference information about the ${L[l].full} word "${sh.text}" (reading: ${sh.r}; meaning in context: "${sh.m}") for a beginner who reads ${L[l].rd}, not characters.
Write exactly 3 short example sentences that show how people use this word in everyday life, at beginner level.
${TOKRULES(l)}
Language rules: literal, no idioms, no metaphors, no sarcasm.
Reply with only JSON in this shape:
{"type":"word type, for example noun, verb, adjective, particle, phrase","meaning":"main English meanings, short","note":"1 or 2 literal sentences about how and when people use this word","examples":[{"tokens":[["word","reading","meaning"]],"english":"literal English translation"}]}`;
  try{
    const d=await aiJSON(prompt);
    const data={type:String(d.type||""),meaning:String(d.meaning||""),note:String(d.note||""),examples:(Array.isArray(d.examples)?d.examples:[]).map(cleanSent).filter(Boolean).slice(0,3)};
    S[l].ref[sh.text]=data;const ks=Object.keys(S[l].ref);if(ks.length>150)delete S[l].ref[ks[0]];save();
    sh.data=data;sh.state="";
  }catch(e){sh.state=aiErr(e);}
  if(view.sheet===sh)render();
}
function sheetHTML(){
  const sh=view.sheet;if(!sh)return "";const l=sh.l,d=sh.data;
  return `<div class="scrim" data-a="${A(closeSheet)}"></div><div class="sheet" role="dialog" aria-label="Word reference"><div class="shead"><span class="tx big" lang="${L[l].hl}">${esc(sh.text)}</span><button class="hbtn" data-a="${A(closeSheet)}">Close</button></div>
  <p class="reading" style="text-align:left">${esc(sh.r)}</p><p><strong>${esc((d&&d.meaning)||sh.m)}</strong>${d&&d.type?` <span class="muted">(${esc(d.type)})</span>`:""}</p>
  <div class="inline" style="margin-bottom:8px"><button class="play" aria-label="Play audio" title="Play audio" data-a="${A(()=>say(sh.text,l))}">${PLAY}</button><button class="play" data-a="${A(()=>toggleSave(sh))}">${isSaved(l,sh.text)?"✅ Saved (tap to remove)":"⭐ Save word"}</button></div>
  ${d?`${d.note?`<p>${esc(d.note)}</p>`:""}${d.examples.length?`<p class="q" style="margin-top:8px">Everyday examples</p>`:""}${d.examples.map(s=>`<div class="line">${sentHTML(l,s,[{w:sh.text}])}</div>`).join("")}`:`<p class="small"><strong>${sh.state==="loading"?"Loading the usage note and 3 examples. This usually takes 5 to 30 seconds.":esc(sh.state)}</strong></p>`}</div>`;
}
/* AI lesson content */
const TOKRULES=l=>`Token rules: split every sentence into words. Each token is an array of 3 strings: [the word as written, its reading in ${l==="zh"?"pinyin with tone marks":"romaji (write the particles は and を as wa and o)"}, a short literal English meaning, or the grammar function in brackets such as "(topic marker)"]. Punctuation is its own token with an empty reading and an empty meaning. Joining the token texts in order must give the full sentence exactly.`;
function knownList(l,v){return allWords(l).filter(w=>isL(l,w)&&!v.words.includes(w)).map(w=>w.w).slice(-80);}
function baseInfo(l,v){return `Learner: beginner in ${L[l].full}. The learner cannot read the characters yet and relies on ${L[l].rd}.
Lesson words: ${v.words.map(w=>`${w.w} (${w.r}) = ${w.m}`).join("; ")}.
Words the learner already knows: ${knownList(l,v).join(", ")||"none"}.
Grammar point of this lesson: ${v.g[0]}. Pattern: ${v.g[1]}. Explanation: ${v.g[2]}`;}
async function loadA(v,fresh){
  const l=v.lang;v.aState="loading";if(view===v)render();
  const s=await hasAI();if(!s){v.aState="none";if(view===v)render();return;}
  const prompt=`You create study material.
${baseInfo(l,v)}
Tasks:
1. For EACH lesson word, write one short everyday example sentence that uses that word. Use only lesson words, known words and basic grammar words.
2. Write 3 short example sentences that show the grammar point.
3. Write 2 multiple-choice questions that test the grammar point. Each question has 3 sentence options. Exactly one option is correct. The wrong options are wrong only because of the grammar point.
${TOKRULES(l)}
Language rules: literal, no idioms, no metaphors, no sarcasm.
Reply with only JSON in this shape:
{"examples":[{"word":"the lesson word","tokens":[["word","reading","meaning"]],"english":"literal English translation"}],"grammar":{"examples":[{"tokens":[["word","reading","meaning"]],"english":"literal English translation"}],"quiz":[{"question":"instruction in English","options":[{"text":"sentence","reading":"reading of the sentence"}],"answer":0,"why":"one literal sentence that explains why the answer is correct"}]}}`;
  try{
    const d=await aiJSON(prompt,fresh?{cache:false}:{});
    const exs=Array.isArray(d.examples)?d.examples:[],ex={};
    exs.forEach(x=>{const c=cleanSent(x);if(c&&x.word)ex[String(x.word)]=c;});
    v.words.forEach((w,i)=>{if(!ex[w.w]){const c=cleanSent(exs[i]);if(c)ex[w.w]=c;}});
    const gr=d.grammar||{};
    v.gex=(Array.isArray(gr.examples)?gr.examples:[]).map(cleanSent).filter(Boolean).slice(0,3);
    v.gq=(Array.isArray(gr.quiz)?gr.quiz:[]).filter(q=>q&&Array.isArray(q.options)&&q.options.length>=2&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length).slice(0,2).map(q=>{
      const opts=q.options.map((o,i)=>({text:String(o&&o.text!=null?o.text:o),reading:String(o&&o.reading||""),ok:i===q.answer}));const sh=shuffle(opts);
      return {type:"gram",lang:l,question:String(q.question||"Choose the correct sentence."),opts:sh,ans:sh.findIndex(o=>o.ok),why:String(q.why||""),answered:false,correct:false,sel:null,input:"",explain:null,word:null};});
    v.ex=ex;v.aState="";
  }catch(e){v.aState=aiErr(e);}
  if(view===v)render();
}
async function loadB(v,fresh){
  const l=v.lang;v.bState="loading";if(view===v)render();
  const s=await hasAI();if(!s){v.bState="none";if(view===v)render();return;}
  const n=Math.min(12,Math.max(5,v.words.length));
  const prompt=`You create study material.
${baseInfo(l,v)}
Tasks:
1. Write a story of ${n} short sentences about one concrete everyday event with one or two people. Use every lesson word at least once. Use the grammar point at least twice.
2. Write a dialogue of 6 to 10 lines between Person A and Person B in an everyday situation, for example a shop, a station, a restaurant, a phone call or a home. Use lesson words and the grammar point. Use natural everyday speech at beginner level.
${TOKRULES(l)}
Language rules: literal, no idioms, no metaphors, no sarcasm.
Reply with only JSON in this shape:
{"story":{"title":"English title, 2 to 5 words","lines":[{"tokens":[["word","reading","meaning"]],"english":"literal English translation"}]},"dialogue":{"title":"English title, 2 to 5 words","situation":"one English sentence that says where the people are and who they are","lines":[{"speaker":"A","tokens":[["word","reading","meaning"]],"english":"literal English translation"}]}}`;
  try{
    const d=await aiJSON(prompt,fresh?{cache:false}:{});
    const st=d.story||{},lines=(Array.isArray(st.lines)?st.lines:[]).map(cleanSent).filter(Boolean).slice(0,14);
    if(!lines.length)throw{code:"invalid_json"};
    v.story={title:String(st.title||"Story"),lines};
    const di=d.dialogue||{},dl=(Array.isArray(di.lines)?di.lines:[]).map(x=>{const c=cleanSent(x);if(c)c.speaker=String(x.speaker||"A").toUpperCase().startsWith("B")?"B":"A";return c;}).filter(Boolean).slice(0,12);
    v.dia=dl.length?{title:String(di.title||"Dialogue"),situation:String(di.situation||""),lines:dl}:null;
    v.bState="";
  }catch(e){v.bState=aiErr(e);}
  if(view===v)render();
}
/* A lesson remembers where you stopped (S[lang].resume: theme, words, step, item). Starting the same lesson again continues there. */
/* New words step: when a word opens, the word and then its example sentence are read aloud (setting autoRead, on by default).
   Called after the screen is drawn from a tap (start, Continue, Back). Nothing is read again when the screen is redrawn for another reason. */
function readWordCard(){
  const v=view;if(!v||v.s!=="lesson"||v.step!==0||S.settings.autoRead===false||!("speechSynthesis" in window))return;
  const l=v.lang,w=v.words[v.i];if(!w)return;
  say(w.w,l);
  const u=new SpeechSynthesisUtterance(w.ex[0]);u.lang=L[l].code;const vc=voiceFor(l);if(vc)u.voice=vc;u.rate=0.9*S.settings.speed;
  if(w.tk&&S.settings.hlWord!==false){const tok=++playTok;hlClear();hlTrack(u,w.tk.tokens,()=>document.querySelector("#main .sent .gl"),()=>tok===playTok);u.onend=()=>{if(tok===playTok)hlClear();};}
  speechSynthesis.speak(u);
}
/* Quiz questions: when a question opens, the word or sentence it is about is read aloud (setting autoRead): the sentence of "Build the English meaning",
   the sentence of "Listen and build", the word of "What does this word mean?" and "Listen and choose". Never the missing-word question and not the questions
   where you type or say the answer. Called after a tap (start, Continue, Back), not on every redraw. */
function readQuestion(){
  if(S.settings.autoRead===false||!("speechSynthesis" in window))return;
  const v=view;let q=null;
  if(v.s==="lesson"&&v.step===4)q=v.quiz&&v.quiz[v.i];else if(v.s==="review"&&!v.finished)q=v.qs&&v.qs[v.i];
  if(!q||q.answered)return;
  const l=S.lang;
  if(q.type==="build"&&(q.mode==="toEn"||q.mode==="listen"))sayAt(sentText(q.sent),l,1);
  else if((q.type==="meaning"||q.type==="listen")&&q.word)say(q.word.w,l);
}
function lessonResumeFor(l,words){const r=S[l]&&S[l].resume;if(!r||!Array.isArray(r.words)||!words||!words.length)return null;return r.ti===themeIdxOf(l,words[0])&&r.words[0]===words[0].w&&r.words.length===words.length?r:null;}
function lessonResumeText(l,r){const n=r.words.length;return r.step===0?"New words, word "+(r.i+1)+" of "+n:STEPS[r.step].replace(/^\S+\s/,"");}
function lessonSave(v){if(!v||v.s!=="lesson"||v.repeat)return;const l=v.lang,st=S[l];if(v.step===0&&v.i===0)st.resume=null;else st.resume={ti:themeIdxOf(l,v.words[0]),words:v.words.map(w=>w.w),title:v.title,step:v.step,i:v.step===4?0:v.i,u:Date.now()};save();}
function startLesson(words,title,repeat,fresh){
  const l=S.lang,types=["meaning","listen","type","speak"];
  const quiz=buildQuiz(l,words,S[l].lc||0);
  const g=GR[l][grFor(l,themeIdxOf(l,words[0]))];
  view={s:"lesson",lang:l,words,title,repeat:!!repeat,g,sents:((CUR[l][themeIdxOf(l,words[0])]||{}).sents)||[],step:0,i:0,quiz,ex:{},gex:[],gq:[],aState:"loading",bState:"loading",story:null,dia:null,confirm:false,sheet:null};
  {const ch=chapter(l,themeIdxOf(l,words[0]));view.story=ch?{title:ch.title,lines:ch.lines}:null;view.aState="none";view.bState="";}
  const rs=!repeat&&!fresh?lessonResumeFor(l,words):null;
  if(rs){view.step=Math.max(0,Math.min(rs.step,5));view.i=view.step>=4?0:Math.max(0,Math.min(rs.i,lessonItemCount(view)-1));}
  else if(fresh&&!repeat&&S[l].resume){S[l].resume=null;save();}
  render();window.scrollTo(0,0);
  readWordCard();readQuestion();
}
function lessonItemCount(v){const n=v.words.length;return [n,1+v.gq.length,1,1,v.quiz.length,1][v.step];}
function lessonMove(d){
  const v=view;const n=lessonItemCount(v);
  if(d>0){if(v.i<n-1)v.i++;else{v.step++;v.i=0;}}
  else{if(v.i>0)v.i--;else if(v.step>0){v.step--;v.i=lessonItemCount(v)-1;}}
  if(v.step===2&&!v.sents.length){v.step+=d>0?1:-1;v.i=d>0?0:lessonItemCount(v)-1;}
  lessonSave(v);
  render();window.scrollTo(0,0);
  readWordCard();readQuestion();
}
function aiMsg(st,what){return st==="none"?"This version has no AI. "+what:st;}
function screenLesson(){
  const v=view,l=S.lang,ws=v.words,n=lessonItemCount(v);
  const unitLabel=(v.repeat?"Repeat: ":"Lesson: ")+v.title;
  const itemNames=["Word","Grammar item","","","Question",""];
  const counts=[ws.length,1+v.gq.length,1,1,v.quiz.length,1];let pos=0;for(let k=0;k<v.step;k++)pos+=counts[k];pos+=v.i;const total=counts.reduce((a,b)=>a+b,0);
  const r={row:"title",title:unitLabel,exit:true,
    prog:`<div class="ptext">Step ${v.step+1-(!v.sents.length&&v.step>2?1:0)} of ${v.sents.length?6:5}: ${STEPS[v.step]}</div><div class="psub">${itemNames[v.step]&&n>1?itemNames[v.step]+" "+(v.i+1)+" of "+n:""}</div><div class="bar"><i style="width:${Math.round(pos/total*100)}%"></i></div>`,
    back:{label:"Back",fn:()=>{if(v.step===0&&v.i===0)goHome();else lessonMove(-1);}},next:{label:"Continue",fn:()=>lessonMove(1)}};
  let h="";
  const retry=(fn,label)=>`<p><button class="btn sec full" data-a="${A(fn)}">${label}</button></p>`;
  if(v.step===0){
    const w=ws[v.i],ex=v.ex[w.w];
    const sv=isSaved(l,w.w);
    h=`<div class="card hasstar"><button class="ibtn starbtn${sv?" on":""}" aria-label="${sv?"Remove from My words":"Save to My words"}" aria-pressed="${sv}" data-a="${A(ev=>starWord(l,w,ev))}">${ico("star",22)}</button><p class="q">New word</p>${glyph(l,w)}${readingHTML(l,w)}<p class="meaning">${esc(w.m)}</p><p class="center"><button class="play" data-a="${A(()=>say(w.w,l))}" aria-label="Play audio" title="Play audio">${PLAY}</button></p></div>
    <div class="card"><p class="q">Example</p>${ex?sentHTML(l,ex,[w]):w.tk?sentHTML(l,w.tk,[w]):builtinEx(l,w)}${!ex&&v.aState==="loading"?`<p class="small muted" style="margin-top:6px">The word-by-word version is loading.</p>`:""}</div>`;
  }else if(v.step===1){
    if(v.i===0){
      const g=v.g;
      h=`<div class="card"><h2>Grammar: ${esc(g[0])}</h2><p class="pattern" lang="${L[l].hl}">${esc(g[1])}</p><p>${esc(g[2])}</p><p class="q">Example</p>${sentHTML(l,{tokens:g[3],english:g[4]},[])}</div>
      <div class="card"><p class="q">More examples</p>${v.gex.length?v.gex.map(s=>`<div class="line">${sentHTML(l,s,[])}</div>`).join(""):v.aState==="loading"?`<p class="small">3 more examples and 2 grammar questions are loading.</p>`:`<p class="small"><strong>${esc(aiMsg(v.aState,"Only the built-in example is shown."))}</strong></p>${v.aState!=="none"?retry(()=>loadA(v,true),"Try again"):""}`}</div>`;
    }else{
      const q=v.gq[v.i-1];view.q=q;
      h=`<div class="card"><p class="small muted" style="margin:0 0 4px">Grammar question ${v.i} of ${v.gq.length}</p>${qHTML(q,{noAI:true})}</div>`;
      r.back={label:"Back",fn:()=>lessonMove(-1)};
      if(!q.answered)r.next={label:"Check answer",fn:()=>{checkQ(q);render();},dis:!canCheck(q)};
    }
  }else if(v.step===2){
    h=`<div class="card"><h2>Sentences</h2><p class="small muted">These sentences use this lesson’s words. Lesson words are underlined. Tap any word to open its reference card.</p><p><button class="play" data-a="${A(()=>sayLines(v.sents,l))}">${PLAY}Play all sentences</button></p>${v.sents.map(x=>`<div class="line">${sentHTML(l,x,ws)}</div>`).join("")}</div>`;
  }else if(v.step===3){
    if(v.bState==="loading"){h=`<div class="card"><h2>Story</h2><p>Writing a story and a dialogue with this lesson’s words and grammar. This usually takes 20 to 90 seconds.</p></div>`;r.next.dis=true;}
    else if(v.story){
      h=`<div class="card"><h2>${esc(v.story.title)}</h2><p class="small muted">Lesson words are underlined. Tap any word to open its reference card.</p><p><button class="play" data-a="${A(()=>sayLines(v.story.lines,l))}">${PLAY}Play whole story</button></p>${v.story.lines.map(x=>`<div class="line">${sentHTML(l,x,ws)}</div>`).join("")}${AI_OFF?"":retry(()=>loadB(v,true),"Write a new story and dialogue")}</div>`;
    }else{
      h=`<div class="card"><h2>Practice sentences</h2><p class="small"><strong>${esc(aiMsg(v.bState,"The practice sentences below replace the story."))}</strong></p>${v.bState!=="none"?retry(()=>loadB(v,true),"Try to write the story again"):""}${ws.map(w=>`<div class="line">${builtinEx(l,w,ws)}</div>`).join("")}</div>`;
    }
  }else if(v.step===4){
    const q=v.quiz[v.i];view.q=q;
    h=`<div class="card">${qHTML(q)}</div>`;
    r.back={label:"Back",fn:()=>lessonMove(-1)};
    if(!q.answered){if(q.type==="speak")r.next={label:"Continue",dis:true};else r.next={label:"Check answer",fn:()=>{checkQ(q);render();},dis:!canCheck(q)};}
  }else{
    const res=ws.map(w=>({w,ok:v.quiz.filter(q=>q.word===w).every(q=>q.correct)}));
    const correct=v.quiz.filter(q=>q.correct).length,gc=v.gq.filter(q=>q.correct).length;
    h=`<div class="card"><h2>Summary</h2><p>You finished ${esc(unitLabel)}.</p><p>Quiz result: ${correct} of ${v.quiz.length} correct.</p>${v.gq.length?`<p>Grammar questions: ${gc} of ${v.gq.length} correct.</p>`:""}<p>Grammar point: ${esc(v.g[0])}.</p></div>
    <div class="card"><h2>Words</h2><ul class="units">${res.map(x=>`<li><span>${cjk(l,x.w.w)} ${esc(x.w.r)}<br><span class="status">${esc(x.w.m)}</span></span><span class="status">${x.ok?"Correct":"Incorrect: added to today’s review"}</span></li>`).join("")}</ul></div>
    <div class="card"><p class="small muted" style="margin:0">✅ Progress saved in ${storeWhere}.</p></div>`;
    if(!v.saved){v.saved=true;res.forEach(x=>{const e=S[l].srs[x.w.w];if(!e||!x.ok)srsSet(l,x.w.w,x.ok);});if(!v.repeat){S[l].gi++;{const gd=S[l].grDone||(S[l].grDone=[]),gx=GR[l].indexOf(v.g);if(!gd.includes(gx))gd.push(gx);}S[l].lc=(S[l].lc||0)+1;S[l].lst=(S[l].lst||0)+1;S[l].lastLesson=ws.map(w=>w.w);histPush(l,"🆕 Lesson: "+v.title);}S[l].resume=null;save();}
    h+=recsHTML(l,{k:"lesson",ti:themeIdxOf(l,ws[0]),g:GR[l].indexOf(v.g)});
    r.back={label:"Back",fn:()=>lessonMove(-1)};
    r.next={label:"Go to home",fn:goHome};
  }
  r.main=h;return r;
}

/* Review */
function startReview(given,recap){
  const l=S.lang;const ws=given&&given.length?given:shuffle(dueList(l)).slice(0,10);
  const types=S.settings.speaking?["meaning","listen","type","speak"]:["meaning","listen","type"];
  const pool=poolFor(l,ws),qs=ws.map((w,i)=>{if(i%4===1){const s2=pool.find(x=>x.tokens.some(z=>z[0]===w.w));const b=s2&&mkBlank(l,s2,w,pool);if(b)return b;}return mkQ(types[i%types.length],w,l);});
  const c=pool.filter(x=>{const n=contentToks(x).length;return n>=2&&n<=7;});if(c.length&&!recap)qs.push(mkBuild(l,shuffle(c)[0],"build",pool));
  view={s:"review",qs,i:0,finished:false};render();window.scrollTo(0,0);readQuestion();
}
function screenReview(){
  const v=view;
  if(v.finished&&v.mis){const n=misList(S.lang).length;
    return {row:"title",title:"Mistakes",prog:`<div class="ptext">Mistakes: finished</div><div class="psub">Still in Mistakes: ${n}</div><div class="bar"><i style="width:100%"></i></div>`,
      main:`<div class="card"><h2>Mistakes session finished</h2><p>Correct: ${v.qs.filter(q=>q.correct).length} of ${v.qs.length}.</p><p>Questions you answered correctly are removed from Mistakes. Questions you answered incorrectly stay in Mistakes for your next session.</p><p>Still in Mistakes: ${n}.</p></div>`,
      back:{label:"Back",dis:true},next:{label:"Go to home",fn:goHome}};}
  if(v.finished&&v.sents){const c=v.qs.filter(q=>q.correct).length;
    return {row:"title",title:"Sentences",prog:`<div class="ptext">Sentences: finished</div><div class="psub">Correct: ${c} of ${v.qs.length}</div><div class="bar"><i style="width:100%"></i></div>`,
      main:`<div class="card"><h2>Sentences session finished</h2><p>Correct: ${c} of ${v.qs.length}.</p><p>Sentences you answered incorrectly are saved in Mistakes, where you can repeat them.</p></div>`,
      back:{label:"Back",dis:true},next:{label:"Go to home",fn:()=>{histPush(S.lang,"🔁 Sentences");save();goHome();}}};}
  if(v.finished){const c=v.qs.filter(q=>q.correct).length;
    return {row:"title",title:"Review",prog:`<div class="ptext">Review: finished</div><div class="psub">Correct: ${c} of ${v.qs.length}</div><div class="bar"><i style="width:100%"></i></div>`,
      main:`<div class="card"><h2>Review finished</h2><p>Correct: ${c} of ${v.qs.length}.</p><p>Words you answered correctly move to a longer review interval. Words you answered incorrectly are due again now.</p></div>${recsHTML(S.lang,{k:"review"})}`,
      back:{label:"Back",dis:true},next:{label:"Go to home",fn:()=>{histPush(S.lang,"🔁 Review");save();goHome();}}};}
  const q=v.qs[v.i];view.q=q;const nm=v.mis?"Mistakes":v.sents?"Sentences":"Review";
  const r={row:"title",title:nm,exit:true,prog:`<div class="ptext">${nm}: question ${v.i+1} of ${v.qs.length}</div><div class="psub">Each answer is saved when you check it.</div><div class="bar"><i style="width:${Math.round(v.i/v.qs.length*100)}%"></i></div>`,
    main:`<div class="card">${qHTML(q)}</div>`,back:{label:"Back",fn:()=>{if(v.i===0){view.confirm=true;render();window.scrollTo(0,0);}else{v.i--;render();window.scrollTo(0,0);readQuestion();}}}};
  if(!q.answered){if(q.type==="speak")r.next={label:"Continue",dis:true};else r.next={label:"Check answer",fn:()=>{checkQ(q);render();},dis:!canCheck(q)};}
  else r.next={label:"Continue",fn:()=>{if(v.mis&&!q.correct&&!q.again){const x=misList(S.lang).find(m=>m.id===q.mid),nq=x&&misRebuild(x,S.lang);q.again=true;if(nq){nq.again=true;v.qs.push(nq);}}if(v.i>=v.qs.length-1)v.finished=true;else v.i++;render();window.scrollTo(0,0);readQuestion();}};
  return r;
}

/* Settings */
function screenSettings(){
  const st=S.settings,m=speakMode();
  const tg=(key,label,desc)=>`<label class="toggle"><input type="checkbox" ${st[key]?"checked":""} data-a="${A(()=>{st[key]=!st[key];save();render();})}"><span><strong>${label}</strong><br><span class="small muted">${desc}</span></span></label>`;
  const rd=(val,label,desc,avail)=>`<label class="toggle"><input type="radio" name="sm" ${m===val?"checked":""} ${avail?"":"disabled"} data-a="${A(()=>{st.speakMode=val;save();render();})}"><span><strong>${label}</strong>${avail?"":" (not available in this browser)"}<br><span class="small muted">${desc}</span></span></label>`;
  const vz=voiceFor("zh"),vj=voiceFor("ja");
  const reset=l=>view.reset===l?`<div class="confirm"><p><strong>Reset all ${L[l].name} progress?</strong> This deletes placement, learned words, review data and AI-created words for ${L[l].name}.</p><div class="inline"><button class="btn pri" data-a="${A(()=>{S[l]=blank();save();view.reset=null;render();})}">Reset ${L[l].name}</button><button class="btn sec" data-a="${A(()=>{view.reset=null;render();})}">Keep progress</button></div></div>`:`<button class="btn sec full" style="margin-bottom:10px" data-a="${A(()=>{view.reset=l;render();})}">Reset ${L[l].name} progress</button>`;
  return {row:"title",title:"Settings",prog:`<div class="ptext">Settings</div><div class="psub">Changes are saved immediately.</div>`,
    main:`<div class="card"><h2>Display and audio</h2>${tg("showReading","Show pinyin and romaji","Shows the pronunciation guide under words and answer options.")}${tg("autoRead","Read words and sentences aloud","In a lesson, each new word and then its example sentence are read aloud when the word opens. In quizzes, the word or sentence of a question is read aloud when the question opens (not the missing-word questions). You can still tap the speaker button or any word.")}${tg("hlWord","Highlight the spoken word","Marks the word being spoken in stories, podcast episodes and conversations. Some voices do not report word positions. The highlight then follows an estimate and can be slightly early or late.")}${tg("gloss","Show word-by-word reading and meaning","Shows the reading and English meaning under each word in sentences. Tap a word to open its reference card.")}${tg("showEnglish","Show full English translation","Shows the English translation under each sentence.")}</div><div class="card"><h2>🈴 Furigana (Japanese)</h2>${[["fade","Fade as I learn kanji","Readings appear above kanji you have not learned yet."],["always","Always","Readings appear above every kanji."],["never","Never","No readings above kanji."]].map(([k,t,d])=>`<label class="toggle"><input type="radio" name="furi" ${(S.settings.furi||"fade")===k?"checked":""} data-a="${A(()=>{S.settings.furi=k;save();render();})}"><span><strong>${t}</strong><br><span class="small muted">${d}</span></span></label>`).join("")}</div><div class="card"><h2>🔊 Audio speed</h2><p class="small muted">Applies to all audio in the app.</p>${speedHTML()}${tg("speaking","Speaking questions","Includes questions where you say a word aloud.")}${tg("vib","Vibration","Short vibration on every tap. One vibration for a correct answer, three for an incorrect answer.")}${view.vibMsg?`<p class="small"><strong>${esc(view.vibMsg)}</strong></p>`:""}<button class="btn sec full" data-a="${A(()=>{let ok=false;try{ok=!!(navigator.vibrate&&navigator.vibrate(300));}catch(e){}view.vibMsg=ok?"Vibration request sent. If your phone did not vibrate, this view or this phone blocks vibration.":"This browser or this view does not support vibration.";render();})}">Test vibration</button></div>
    <div class="card"><h2>Lesson size</h2>${[5,10,15].map(n=>`<label class="toggle"><input type="radio" name="ls" ${st.size===n?"checked":""} data-a="${A(()=>{st.size=n;save();render();})}"><span><strong>${n} new words per lesson</strong><br><span class="small muted">About ${n*2} minutes.</span></span></label>`).join("")}</div><div class="card"><h2>Speaking method</h2>${rd("recognize","Speech recognition","The app listens and checks the word automatically.",!!SR)}${rd("record","Record and compare","You record yourself, play both recordings, and mark yourself.",canRecord)}${rd("self","Listen and self-check","You play the audio, say the word, and mark yourself. No microphone is used.",true)}</div>
    <div class="card"><h2>🎤 Microphone test</h2><p class="small muted">This test shows whether this view can use the microphone and speech recognition. It uses the language of the selected tab.</p>${view.mic?`<ul class="small">${view.mic.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}<button class="btn sec full" data-a="${A(micTest)}">Run microphone test</button></div>
        ${accountCard()}<div class="card"><h2>Credits</h2><p class="small" style="margin:0">Kanji stroke order: KanjiVG, by Ulrich Apel, licensed CC BY-SA 3.0. Kanji meanings and readings: KANJIDIC2, by the Electronic Dictionary Research and Development Group, licensed CC BY-SA 4.0.</p></div><div class="card"><h2>Device check</h2><p>Chinese voice: ${vz?"found ("+esc(vz.name)+")":"not found. Audio may play in the wrong accent or not at all."}</p><p>Japanese voice: ${vj?"found ("+esc(vj.name)+")":"not found. Audio may play in the wrong accent or not at all."}</p><p>Progress is saved to your account.</p></div>
    <div class="card"><h2>Reset</h2>${reset("zh")}${reset("ja")}</div>`,
    back:{label:"Back",fn:goHome},next:{label:"Done",fn:goHome}};
}

