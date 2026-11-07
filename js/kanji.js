"use strict";
/* Language Steps: kanji.js. Kana and kanji lessons, kanji cards, furigana, TV list.
   Files load in the order listed in js/loader.js (APP_FILES); they share one global scope. */
/* ---------- あ Kana and 🈴 Kanji ---------- */
const KJ=()=>typeof KANJI_JA!=="undefined"?KANJI_JA:[];
const TVR=()=>typeof TVREC!=="undefined"?TVREC:{};
const R2H_MAP={a:"あ",i:"い",u:"う",e:"え",o:"お",ka:"か",ki:"き",ku:"く",ke:"け",ko:"こ",sa:"さ",shi:"し",si:"し",su:"す",se:"せ",so:"そ",ta:"た",chi:"ち",tsu:"つ",dzu:"づ",dji:"ぢ",tu:"つ",te:"て",to:"と",na:"な",ni:"に",nu:"ぬ",ne:"ね",no:"の",ha:"は",hi:"ひ",fu:"ふ",hu:"ふ",he:"へ",ho:"ほ",ma:"ま",mi:"み",mu:"む",me:"め",mo:"も",ya:"や",yu:"ゆ",yo:"よ",ra:"ら",ri:"り",ru:"る",re:"れ",ro:"ろ",wa:"わ",wo:"を",ga:"が",gi:"ぎ",gu:"ぐ",ge:"げ",go:"ご",za:"ざ",ji:"じ",zi:"じ",zu:"ず",ze:"ぜ",zo:"ぞ",da:"だ",de:"で",do:"ど",ba:"ば",bi:"び",bu:"ぶ",be:"べ",bo:"ぼ",pa:"ぱ",pi:"ぴ",pu:"ぷ",pe:"ぺ",po:"ぽ",kya:"きゃ",kyu:"きゅ",kyo:"きょ",sha:"しゃ",shu:"しゅ",sho:"しょ",she:"しぇ",cha:"ちゃ",chu:"ちゅ",cho:"ちょ",che:"ちぇ",nya:"にゃ",nyu:"にゅ",nyo:"にょ",hya:"ひゃ",hyu:"ひゅ",hyo:"ひょ",mya:"みゃ",myu:"みゅ",myo:"みょ",rya:"りゃ",ryu:"りゅ",ryo:"りょ",gya:"ぎゃ",gyu:"ぎゅ",gyo:"ぎょ",ja:"じゃ",ju:"じゅ",jo:"じょ",je:"じぇ",bya:"びゃ",byu:"びゅ",byo:"びょ",pya:"ぴゃ",pyu:"ぴゅ",pyo:"ぴょ",fa:"ふぁ",fi:"ふぃ",fe:"ふぇ",fo:"ふぉ",di:"でぃ"};
function toHira(r){
  r=String(r).toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z']/g,"");let out="",i=0;
  while(i<r.length){
    const c=r[i];
    if(c==="'"){i++;continue;}
    if(i+1<r.length&&c===r[i+1]&&c!=="n"&&!"aeiou".includes(c)){out+="っ";i++;continue;}
    if(c==="n"&&(i+1>=r.length||!"aeiouy".includes(r[i+1]))){out+="ん";i++;continue;}
    let hit=false;for(const n of [3,2,1]){const s=r.substr(i,n);if(R2H_MAP[s]){out+=R2H_MAP[s];i+=n;hit=true;break;}}
    if(!hit){out+=c;i++;}
  }
  return out;
}
const hasKanji=s=>/[\u4e00-\u9fff]/.test(s);
const kStore=k=>S.ja[k]||(S.ja[k]={});
function kSet(store,key,ok){const st=kStore(store),e=st[key]||{b:0,d:0};e.u=Date.now();e.b=ok?Math.min(5,(e.b||0)+1):1;e.d=Date.now()+(ok?INTERVAL[e.b]*DAY:0);st[key]=e;}
const kLearned=c=>{const e=(S.ja.kanji||{})[c];return !!e&&e.b>=2;};
const kSeen=c=>!!(S.ja.kanji||{})[c];
const kanaLearned=ch=>{const e=(S.ja.kana||{})[ch];return !!e&&e.b>=2;};
const kanjiByChar=c=>KJ().find(k=>k.c===c);
function kanjiWords(c){const out=[];themes("ja").forEach(t=>(t.words||[]).forEach(w=>{if(w.w.includes(c))out.push(w);}));return out;}
function kanaExample(ch){for(const t of themes("ja"))for(const w of (t.words||[]))if((w.k||w.w).includes(ch))return w;return null;}
const fmtKun=s=>String(s).replace(/\.(.+)$/,"($1)");
/* furigana in sentences */
function furiFor(l,t){
  if(l!=="ja"||!hasKanji(t[0])||!t[1])return null;
  const m=S.settings.furi||"fade";if(m==="never")return null;
  if(m==="fade"&&[...t[0]].filter(hasKanji).every(kLearned))return null;
  return toHira(t[1]);
}
/* home section */
function homeKanji(l,r,part){
  if(l!=="ja"){r.main=`<div class="card"><p style="margin:0">Character lessons are in the Japanese tab.</p></div>`;return;}
  const kn=KJ(),learned=kn.filter(k=>kLearned(k.c)).length,due=kn.filter(k=>{const e=(S.ja.kanji||{})[k.c];return e&&e.d<=Date.now();}).length;
  const next=kn.filter(k=>!kSeen(k.c)).slice(0,5);
  const kanaCard=(script,label)=>{const rows=KANA[script],all=rows.flatMap(x=>x[1]),n=all.filter(([c])=>kanaLearned(c)).length;
    return `<div class="card"><h2>${label}: ${n} of ${all.length} learned</h2><div class="krow">${rows.map((row,ri)=>{const c=row[1].filter(([ch])=>kanaLearned(ch)).length,tot=row[1].length;return `<button class="opt kbtn" data-a="${A(()=>startKana(script,ri))}"><span class="tag">${stEmoji(c,tot)} ${esc(row[0])}</span><span lang="ja" class="cjk2">${row[1].map(x=>x[0]).join(" ")}</span></button>`;}).join("")}</div></div>`;};
  let h=`<details class="card tint acc" data-k="in-kanji" ${isOpen("in-kanji",false)?"open":""}><summary>🈴 Kana and kanji (about)</summary><p>Japanese uses 3 scripts: hiragana and katakana (one sound per character), and kanji (characters with meanings). Learn hiragana first, then katakana, then kanji. Kanji are taught in the order they appear in your lessons.</p><p class="small muted" style="margin:0">Above each kanji you have not learned yet, sentences show its reading in small hiragana (furigana). The furigana disappears when you learn the kanji. Change this in ⚙️ Settings.</p></details>`;
  if(part!=="kanji")h+=kanaCard("hira","あ Hiragana")+kanaCard("kata","ア Katakana");
  if(part!=="kana")h+=`<div class="card"><h2>🈴 Kanji: ${learned} of ${kn.length} learned</h2>${next.length?`<p class="small">Next 5: <span lang="ja" class="cjk2">${next.map(k=>k.c).join(" ")}</span></p><button class="btn pri full" style="margin-bottom:8px" data-a="${A(startKanjiLesson)}">Learn the next ${next.length} kanji</button>`:`<p class="small">✅ All kanji in your lessons are started.</p>`}<button class="btn sec full" ${due?"":"disabled"} data-a="${A(startKanjiReview)}">🔁 Review kanji (${due} due)</button>
  <p class="small muted" style="margin:10px 0 6px">✅ learned · 🟡 started · ⭕ not started. Tap a kanji to open its card.</p><div class="kgrid">${kn.map(k=>`<button class="ktile ${kLearned(k.c)?"kl":kSeen(k.c)?"ks":""}" lang="ja" aria-label="${esc(k.c)}: ${esc(k.m[0]||"")}" data-a="${A(()=>openKanji(k.c))}">${esc(k.c)}</button>`).join("")}</div></div>`;
  r.main=h;
}
/* kana lesson */
function startKana(script,ri){const row=KANA[script][ri];view={s:"kana",script,ri,row,i:0};render();window.scrollTo(0,0);}
function kanaQuiz(script,chars){
  const pool=KANA[script].flatMap(x=>x[1]),qs=[];
  if(chars.length>=3){const q=mkMatch("ja",chars.map(([c,r])=>({w:c,r:"",m:r})));qs.push(q);}
  chars.forEach(([c,r])=>{
    const others=shuffle(pool.filter(x=>x[1]!==r)).slice(0,3);
    const q1=mkGramQ({question:"Which reading matches this character?",options:[r,...others.map(x=>x[1])],answer:0},"ja",true);q1.big=c;q1.kk={store:"kana",key:c};qs.push(q1);
    const q2=mkGramQ({question:"Listen, then choose the character.",options:[c,...others.map(x=>x[0])],answer:0},"ja",false);q2.audio=c;q2.kk={store:"kana",key:c};qs.push(q2);
  });
  return qs;
}
function screenKana(){
  const v=view,ch=v.row[1][v.i],[c,rm]=ch,ex=kanaExample(c);
  const r={row:"title",title:`${v.script==="hira"?"あ Hiragana":"ア Katakana"}: row ${v.row[0]}`,back:{label:"Back",fn:()=>{if(v.i>0){v.i--;render();}else goHome();}},main:""};
  r.prog=`<div class="ptext">Character ${v.i+1} of ${v.row[1].length}</div><div class="bar"><i style="width:${Math.round((v.i+1)/v.row[1].length*100)}%"></i></div>`;
  r.main=`<div class="card">${glyph("ja",{w:c})}<p class="meaning">${esc(rm)}</p><p class="center"><button class="play" aria-label="Play audio" title="Play audio" data-a="${A(()=>say(c,"ja"))}">${PLAY}</button></p></div>${ex?`<div class="card"><p class="q">Example word</p><p style="margin:0"><span class="cjk2" lang="ja">${esc(ex.w)}</span> <span lang="ja">${ex.k&&ex.k!==ex.w?esc(ex.k):""}</span> <span class="muted">${esc(ex.r)}</span>: ${esc(ex.m)} <button class="play" aria-label="Play audio" title="Play audio" data-a="${A(()=>say(ex.w,"ja"))}">${PLAY}</button></p></div>`:""}`;
  r.next=v.i<v.row[1].length-1?{label:"Next character",fn:()=>{v.i++;render();window.scrollTo(0,0);}}:{label:`Practise these ${v.row[1].length}`,fn:()=>{view={s:"review",qs:kanaQuiz(v.script,v.row[1]),i:0,finished:false,kq:true};render();window.scrollTo(0,0);}};
  return r;
}
/* stroke tracing: the learner draws one stroke in a box; it is compared with the KanjiVG stroke.
   All limits are fractions of the box size. Change them here to make tracing stricter or more lenient. */
const TRACE={start:0.18,end:0.18,mean:0.12,minLen:0.08,box:109,n:20};
/* Converts SVG path data (M, L, H, V, C, S, Z; upper or lower case) to a list of [x,y] points. */
function flattenPath(d){
  const t=String(d).match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)/g)||[],pts=[];let i=0,cmd="",x=0,y=0,lc=null;
  const num=()=>parseFloat(t[i++]);
  while(i<t.length){
    if(/[a-zA-Z]/.test(t[i]))cmd=t[i++];
    const rel=cmd===cmd.toLowerCase(),C=cmd.toUpperCase(),ox=rel?x:0,oy=rel?y:0;
    if(C==="M"||C==="L"){x=num()+ox;y=num()+oy;pts.push([x,y]);lc=null;if(C==="M")cmd=rel?"l":"L";}
    else if(C==="H"){x=num()+ox;pts.push([x,y]);lc=null;}
    else if(C==="V"){y=num()+oy;pts.push([x,y]);lc=null;}
    else if(C==="C"||C==="S"){
      let x1,y1;if(C==="C"){x1=num()+ox;y1=num()+oy;}else if(lc){x1=2*x-lc[0];y1=2*y-lc[1];}else{x1=x;y1=y;}
      const x2=num()+ox,y2=num()+oy,x3=num()+ox,y3=num()+oy;
      for(let s=1;s<=12;s++){const u=s/12,v=1-u;pts.push([v*v*v*x+3*v*v*u*x1+3*v*u*u*x2+u*u*u*x3,v*v*v*y+3*v*v*u*y1+3*v*u*u*y2+u*u*u*y3]);}
      lc=[x2,y2];x=x3;y=y3;
    }
    else if(C==="Z"){cmd="";}
    else i++;
  }
  return pts;
}
/* Returns n points spaced evenly along a polyline, or null when the line has no length. */
function resamplePts(pts,n){
  if(!pts||pts.length<2)return null;
  const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  const len=cum[cum.length-1];if(!(len>0))return null;
  const out=[];let j=1;
  for(let k=0;k<n;k++){const tg=len*k/(n-1);while(j<pts.length-1&&cum[j]<tg)j++;
    const seg=cum[j]-cum[j-1],f=seg>0?(tg-cum[j-1])/seg:0;out.push([pts[j-1][0]+(pts[j][0]-pts[j-1][0])*f,pts[j-1][1]+(pts[j][1]-pts[j-1][1])*f]);}
  return out;
}
/* Compares a drawn line (points in the 0 to 109 box) with the target stroke path. Returns {skip} for a tap or a very short line. */
function traceCheck(d,drawn){
  const B=TRACE.box,n=TRACE.n,T=resamplePts(flattenPath(d),n);
  const D=resamplePts(drawn,n);
  let len=0;for(let i=1;i<(drawn||[]).length;i++)len+=Math.hypot(drawn[i][0]-drawn[i-1][0],drawn[i][1]-drawn[i-1][1]);
  if(!D||!T||len<TRACE.minLen*B)return {skip:true,ok:false};
  const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  const sd=dist(T[0],D[0])/B,ed=dist(T[n-1],D[n-1])/B;let m=0;for(let i=0;i<n;i++)m+=dist(T[i],D[i]);m/=n*B;
  return {ok:sd<=TRACE.start&&ed<=TRACE.end&&m<=TRACE.mean,sd,ed,m};
}
function curKanji(){return view.s==="klearn"?view.list[view.i]:view.s==="kanji"?kanjiByChar(view.c):null;}
/* Moves to a stroke and clears the tracing state. */
function kStep(n){view.ks=n;view.tdone=false;view.tmsg="";view.tshow=false;render();}
/* Tracing every stroke marks the kanji as learned (box 2 or higher). A second completion does not add credit. */
function kComplete(c){let g=0;while(!kLearned(c)&&g++<2)kSet("kanji",c,true);save();}
function traceSubmit(pts){
  const v=view,k=curKanji(),ks=v.ks;if(!k||ks==null||v.tdone)return;
  const r=traceCheck(k.p[ks-1],pts);
  if(r.skip)v.tmsg="That line was too short. Draw the whole stroke.";
  else if(r.ok){v.tshow=false;v.tmsg="";if(ks>=k.n){v.tdone=true;kComplete(k.c);}else v.ks=ks+1;}
  else v.tmsg="That stroke did not match. Check where the stroke starts and which way it goes, then try again.";
  render();
}
/* Pointer handling for the drawing box (#trace). The page does not scroll while drawing inside the box (touch-action: none). */
(function(){
  if(typeof document==="undefined")return;
  let cur=null;
  const pt=(e,s)=>{const r=s.getBoundingClientRect();return r.width?[(e.clientX-r.left)/r.width*TRACE.box,(e.clientY-r.top)/r.height*TRACE.box]:null;};
  document.addEventListener("pointerdown",e=>{const s=e.target.closest&&e.target.closest("#trace");if(!s||(e.button||0)>0)return;const p=pt(e,s);if(!p)return;e.preventDefault();cur={s,id:e.pointerId,pts:[p]};try{s.setPointerCapture(e.pointerId);}catch(_){}});
  document.addEventListener("pointermove",e=>{if(!cur||e.pointerId!==cur.id)return;const p=pt(e,cur.s);if(!p)return;cur.pts.push(p);const el=cur.s.querySelector("#tdraw");if(el)el.setAttribute("d","M"+cur.pts.map(q=>q[0].toFixed(1)+","+q[1].toFixed(1)).join("L"));});
  const end=e=>{if(!cur||e.pointerId!==cur.id)return;const pts=cur.pts;cur=null;if(e.type==="pointerup")traceSubmit(pts);else render();};
  document.addEventListener("pointerup",end);document.addEventListener("pointercancel",end);
})();
/* The drawing box under the stroke demonstration: pale guide of the whole kanji, strokes already traced in solid ink. */
function traceHTML(k,n){
  const v=view,done=!!v.tdone,solid=done?n:n-1;
  const svg=`<div class="kbox tbig"><svg id="trace" class="ksvg" viewBox="0 0 109 109" role="img" aria-label="Drawing box. Draw stroke ${n} of ${k.n} here.">${k.p.map(d=>`<path d="${d}" class="khide"/>`).join("")}${k.p.slice(0,solid).map(d=>`<path d="${d}"/>`).join("")}${v.tshow&&!done?`<path d="${k.p[n-1]}" class="kcur"/>`:""}<path id="tdraw" class="tdraw" d=""/></svg></div>`;
  const msg=done?`All ${k.n} strokes traced. This kanji is marked as learned.`:(v.tmsg||`Draw stroke ${n} of ${k.n} in the box, then lift your finger.`);
  const btn=done?`<button class="btn sec full" data-a="${A(()=>kStep(1))}">Trace again</button>`:`<button class="btn sec full" data-a="${A(()=>{view.tshow=true;render();})}">Show this stroke in the box</button>`;
  return `<div class="tarea">${svg}<p class="small tmsg" role="status" style="margin:0;text-align:center">${esc(msg)}</p>${btn}</div>`;
}
/* kanji card */
function kanjiCardHTML(k,ks){
  const n=ks==null?k.n:ks;
  const svg=`<svg class="ksvg" viewBox="0 0 109 109" role="img" aria-label="Stroke order of ${esc(k.c)}">${k.p.map((d,i)=>`<path d="${d}" class="${i<n?(ks!=null&&i===n-1?"kcur":""):"khide"}"/>`).join("")}</svg>`;
  const ws=kanjiWords(k.c).slice(0,5);
  return `<div class="card"><div class="kcard"><div class="kbox">${svg}</div><div><p class="meaning" style="text-align:left;margin:0 0 6px">${esc(k.m.join(", "))}</p><p class="small" style="margin:0">Strokes: ${k.n}</p>${k.on.length?`<p class="small" style="margin:4px 0 0">On reading: <span lang="ja">${esc(k.on.join("、"))}</span> (${esc(k.on.map(toRomaji).join(", "))})</p>`:""}${k.kun.length?`<p class="small" style="margin:4px 0 0">Kun reading: <span lang="ja">${esc(k.kun.map(fmtKun).join("、"))}</span> (${esc(k.kun.map(x=>toRomaji(x.replace(".",""))).join(", "))})</p>`:""}</div></div>
  ${ks!=null?`<div class="inline" style="margin-top:10px;justify-content:space-between"><button class="btn sec" ${ks<=1?"disabled":""} data-a="${A(()=>kStep(Math.max(1,ks-1)))}">⏮️ Stroke</button><span class="small">Stroke ${ks} of ${k.n}</span><button class="btn sec" ${ks>=k.n?"disabled":""} data-a="${A(()=>kStep(Math.min(k.n,ks+1)))}">Stroke ⏭️</button></div>${traceHTML(k,ks)}`:`<button class="btn sec full" style="margin-top:10px" data-a="${A(()=>kStep(1))}">Show the stroke order and trace it, one stroke at a time</button>`}</div>
  ${ws.length?`<div class="card"><p class="q">Words in your lessons with ${esc(k.c)}</p><ul class="units">${ws.map(w=>`<li><span><span class="cjk2" lang="ja">${esc(w.w)}</span> <span lang="ja">${esc(w.k||"")}</span> <span class="muted">${esc(w.r)}</span><br><span class="status">${esc(w.m)}</span></span><button class="play" aria-label="Play audio" title="Play audio" data-a="${A(()=>say(w.w,"ja"))}">${PLAY}</button></li>`).join("")}</ul></div>`:""}`;
}
const H2R=(()=>{const m={};for(const [r,h] of Object.entries(R2H_MAP))if(!m[h]||r.length<m[h].length)m[h]=r;Object.assign(m,{"し":"shi","ち":"chi","つ":"tsu","ふ":"fu","じ":"ji","しゃ":"sha","しゅ":"shu","しょ":"sho","ちゃ":"cha","ちゅ":"chu","ちょ":"cho","づ":"zu","ぢ":"ji","じゃ":"ja","じゅ":"ju","じょ":"jo","を":"o"});return m;})();
function toRomaji(h){
  h=String(h).replace(/[ァ-ン]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));let out="",i=0;
  while(i<h.length){if(h[i]==="っ"&&i+1<h.length){const nx=toRomaji(h[i+1]);out+=nx[0]||"";i++;continue;}if(h[i]==="ん"){out+="n";i++;continue;}if(h[i]==="ー"){out+=out.slice(-1);i++;continue;}
    const two=h.substr(i,2);if(H2R[two]){out+=H2R[two];i+=2;continue;}out+=H2R[h[i]]||h[i];i++;}
  return out;
}
function openKanji(c){view={s:"kanji",c,ks:null};render();window.scrollTo(0,0);}
function screenKanjiCard(){
  const v=view,k=kanjiByChar(v.c);
  const r={row:"title",title:`🈴 ${k.c}: ${k.m[0]||""}`,back:{label:"Back",fn:goHome},main:kanjiCardHTML(k,v.ks)};
  const e=(S.ja.kanji||{})[k.c];r.prog=`<div class="ptext">${kLearned(k.c)?"✅ Learned":e?"🟡 Started":"⭕ Not started"}</div>`;
  const all=KJ(),ni=all.findIndex(x=>x.c===k.c)+1;
  r.next=ni<all.length?{label:"Next kanji",fn:()=>openKanji(all[ni].c)}:{label:"Back to kanji list",fn:goHome};
  return r;
}
/* kanji lesson and practice */
function startKanjiLesson(){const list=KJ().filter(k=>!kSeen(k.c)).slice(0,5);if(!list.length)return;view={s:"klearn",list,i:0,ks:null};render();window.scrollTo(0,0);}
function screenKanjiLearn(){
  const v=view,k=v.list[v.i];
  const r={row:"title",title:"🈴 New kanji",back:{label:"Back",fn:()=>{if(v.i>0){v.i--;v.ks=null;render();}else goHome();}},main:kanjiCardHTML(k,v.ks)};
  r.prog=`<div class="ptext">Kanji ${v.i+1} of ${v.list.length}: ${esc(k.c)}</div><div class="bar"><i style="width:${Math.round((v.i+1)/v.list.length*100)}%"></i></div>`;
  r.next=v.i<v.list.length-1?{label:"Next kanji",fn:()=>{v.i++;v.ks=null;render();window.scrollTo(0,0);}}:{label:"Finish lesson",fn:()=>{v.list.forEach(k=>{if(!kSeen(k.c))kSet("kanji",k.c,true);});save();goHome();}};
  return r;
}
function kanjiQuestions(list){
  const all=KJ(),qs=[];
  if(list.length>=3)qs.push(mkMatch("ja",list.map(k=>({w:k.c,r:"",m:k.m[0]||""}))));
  list.forEach(k=>{
    const others=shuffle(all.filter(x=>x.c!==k.c&&(x.m[0]||"")!==(k.m[0]||""))).slice(0,3);
    const q1=mkGramQ({question:"What does this kanji mean?",options:[k.m.join(", "),...others.map(x=>x.m.join(", "))],answer:0},"ja",true);q1.big=k.c;q1.kk={store:"kanji",key:k.c};qs.push(q1);
    const q2=mkGramQ({question:`Which kanji means “${k.m[0]||""}”?`,options:[k.c,...others.map(x=>x.c)],answer:0},"ja",false);q2.kk={store:"kanji",key:k.c};qs.push(q2);
    const w=kanjiWords(k.c)[0];
    if(w&&w.k&&w.k!==w.w){const ow=shuffle(allWords("ja").filter(x=>x.k&&x.k!==w.k&&x.k!==x.w)).slice(0,2);
      const q3=mkGramQ({question:`How do you read ${w.w} (${w.m})?`,options:[{text:w.k,reading:w.r},...ow.map(x=>({text:x.k,reading:x.r}))],answer:0},"ja",false);q3.kk={store:"kanji",key:k.c};q3.audioAfter=w.w;qs.push(q3);}
  });
  return qs;
}
function startKanjiQuiz(list){view={s:"review",qs:kanjiQuestions(list),i:0,finished:false,kq:true};render();window.scrollTo(0,0);}
function startKanjiReview(){const now=Date.now(),due=KJ().filter(k=>{const e=(S.ja.kanji||{})[k.c];return e&&e.d<=now;});if(!due.length)return;startKanjiQuiz(shuffle(due).slice(0,8));}
function tvCard(l,lv){
  const list=(TVR()[l]||[]).filter(x=>lv==="all"||!x.lvn||x.lvn<=lv||true);
  if(!list.length)return "";
  return `<div class="card"><h2>📺 TV and documentaries</h2><p class="small muted">Watch on the service named. Ratings were checked on 2 November 2026. Turn on subtitles in your language first, then in the target language.</p><ul class="units">${list.map(x=>`<li><span><strong>${esc(x.t)}</strong><br><span class="small">${esc(x.why)}</span><br><span class="small">⭐ ${esc(x.rating)} · Suggested from Level ${x.lvn} · ${esc(x.len)} · ${esc(x.where)}</span></span></li>`).join("")}</ul></div>`;
}

