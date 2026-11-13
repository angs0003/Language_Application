"use strict";
/* Language Steps: core.js. State, saving, helpers, audio, review timing.
   Files load in the order listed in js/loader.js (APP_FILES); they share one global scope. */
/* Language Steps app. Content globals (ZH, JA, GR, STORY, TRIP_ZH, TRIP_JA, PARTS, LEVELS, VIDS)
   are provided by js/loader.js from the database, or by content/content.js when no database is set up. */

/* ---------- Built-in curriculum ---------- */
function parseLine(x){const i=x.lastIndexOf(" = ");const a=i>=0?x.slice(0,i):x,e=i>=0?x.slice(i+3):"";return{tokens:a.split(" / ").map(t=>{const p=t.split("|");return[p[0],p[1]||"",p[2]||""];}),english:e};}
function chapter(l,n){const d=STORY[l][n];if(!d)return null;if(!d._p)d._p={title:d.t,lines:d.l.map(parseLine),qs:d.q.map(q=>({after:q[0],question:q[1],options:q[2],answer:q[3],why:q[4]||""}))};return d._p;}
const CUR={
  zh:ZH.map(([t,ws,ss])=>({title:t,sents:(ss||[]).map(parseLine),words:ws.map(a=>({w:a[0],r:a[1],m:a[2],ex:[a[3],a[4],a[5]],tk:a[6]?parseLine(a[6]):null}))})),
  ja:JA.map(([t,ws,ss])=>({title:t,sents:(ss||[]).map(parseLine),words:ws.map(a=>({w:a[0],k:a[1],r:a[2],m:a[3],ex:[a[4],a[5],a[6]],tk:a[7]?parseLine(a[7]):null}))}))
};
const NUM={"一":"1","二":"2","三":"3","十":"10"};
const L={zh:{name:"Chinese",code:"zh-CN",hl:"zh-Hans",rd:"pinyin",full:"Mandarin Chinese, Simplified characters"},ja:{name:"Japanese",code:"ja-JP",hl:"ja",rd:"romaji",full:"Japanese"}};
const partOf=(l,ti)=>{let p=PARTS[l][0];PARTS[l].forEach(x=>{if(ti>=x.t)p=x;});return p;};
const LV_START={},GR_START={};
for(const l of ["ja","zh"]){LV_START[l]=[];GR_START[l]=[];PARTS[l].forEach(p=>{if(LV_START[l].length<p.lv){LV_START[l].push(p.t);GR_START[l].push(p.g);}});}
function lvOfTheme(l,ti){return partOf(l,ti).lv;}
function grFor(l,ti){const p=partOf(l,ti);return Math.min(GR[l].length-1,p.g+((ti-p.t)%p.n));}
const STEPS=["🆕 New words","🧩 Grammar","💬 Sentences","📖 Story","✏️ Quiz","✅ Summary"];
const DAY=864e5, INTERVAL=[0,1,2,4,8,16];

/* ---------- State and saving ---------- */
const KEY="language-steps-v1";
const blank=()=>({placed:false,unit:0,done:[],srs:{},custom:[],gen:{},gi:0,ref:{},lc:0,chRead:[],talkDone:{},tripDone:{},tripOpen:{},podDone:{},hist:[],lst:0,lastLesson:[],saved:[],videos:[],videosWatched:{},kana:{},kanji:{},mis:[],real:{},casualDone:{},resume:null});
const DEF={showReading:true,showEnglish:true,slow:false,speaking:true,speakMode:"",size:5,gloss:false,vib:true,speed:1,sub:"both",autoPause:false,furi:"fade",hlWord:true,autoRead:true};
function normalize(d){const s={v:1,updatedAt:d.updatedAt||0,lang:d.lang==="ja"?"ja":"zh",tab:d.tab||"path",lastActive:d.lastActive||0,settings:Object.assign({},DEF,d.settings||{}),zh:Object.assign(blank(),d.zh||{}),ja:Object.assign(blank(),d.ja||{})};for(const l of ["zh","ja"])if(!s[l].real||typeof s[l].real!=="object"||Array.isArray(s[l].real))s[l].real={};for(const l of ["zh","ja"])if(!s[l].casualDone||typeof s[l].casualDone!=="object"||Array.isArray(s[l].casualDone))s[l].casualDone={};for(const l of ["zh","ja"])if(!s[l].resume||typeof s[l].resume!=="object"||!Array.isArray(s[l].resume.words))s[l].resume=null;return s;}
let S=normalize({});
try{const t=localStorage.getItem(KEY);if(t){const d=JSON.parse(t);if(d&&d.v===1)S=normalize(d);}}catch(e){}
let dbRef=null,dbBusy=false,dbPending=false,storeWhere="this browser";
const CKEY="ls-c:",C={};let dbCol=null,previewStore=false,pvT=null,pcT=null;
try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(CKEY)){try{C[k.slice(CKEY.length)]=JSON.parse(localStorage.getItem(k));}catch(e){}}}}catch(e){}
function cset(k,v){C[k]=v;try{localStorage.setItem(CKEY+k,JSON.stringify(v));}catch(e){}
  if(dbCol)dbCol.doc(k).set({json:JSON.stringify(v)}).catch(()=>{});
  if(previewStore){clearTimeout(pcT);pcT=setTimeout(()=>{try{window.storage.set("content",JSON.stringify(C),false).catch(()=>{});}catch(e){}},500);}}
async function initPreview(){
  if(PUB||!window.storage)return;
  try{const r=await window.storage.get("state",false);if(r&&r.value){const d=JSON.parse(r.value);if(d&&d.v===1&&(d.updatedAt||0)>S.updatedAt)S=normalize(d);}}catch(e){}
  try{const r=await window.storage.get("content",false);if(r&&r.value)Object.assign(C,JSON.parse(r.value));}catch(e){}
  previewStore=true;storeWhere="this chat preview";render();
}
function save(){S.updatedAt=Date.now();S.lastActive=S.updatedAt;try{dbQueue();}catch(e){}try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}dbSave();if(previewStore){clearTimeout(pvT);pvT=setTimeout(()=>{try{window.storage.set("state",JSON.stringify(S),false).catch(()=>{});}catch(e){}},400);}}
async function dbSave(){if(!dbRef)return;if(dbBusy){dbPending=true;return;}dbBusy=true;try{await dbRef.set({json:JSON.stringify(S),updatedAt:S.updatedAt});}catch(e){}dbBusy=false;if(dbPending){dbPending=false;dbSave();}}
async function initDb(){
  try{
    if(!window.claude||!window.claude.use)return;
    const [db,user]=await Promise.all([window.claude.use("db"),window.claude.use("user")]);
    if(!db||!user)return;
    const id=await user.id(); if(!id)return;
    const ref=db.doc("data/users/"+id+"/app");
    const snap=await ref.get();
    dbRef=ref; storeWhere="your Claude account";
    dbCol=ref.collection("content");
    try{const qs=await dbCol.get();qs.docs.forEach(d=>{const x=d.data();if(x&&typeof x.json==="string"&&!(d.id in C)){try{C[d.id]=JSON.parse(x.json);}catch(e){}}});}catch(e){}
    if(snap.exists){
      const d=snap.data();
      if(d&&typeof d.json==="string"&&(d.updatedAt||0)>S.updatedAt&&(view.s==="home"||view.s==="settings")){
        const n=JSON.parse(d.json); if(n&&n.v===1){S=normalize(n);try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
      }
    } else if(S.updatedAt){dbSave();}
    render();
  }catch(e){}
}

/* ---------- Helpers ---------- */
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const AI_THEMES=[];
const PATH_TOTAL=l=>CUR[l].reduce((a,u)=>a+u.words.length,0)+AI_THEMES.length*10;
function themes(l){return CUR[l].map(u=>({title:u.title,words:u.words,ai:false})).concat(AI_THEMES.map((t,gi)=>({title:t,words:S[l].gen[gi]||null,ai:true,gi})));}
const allWords=l=>themes(l).flatMap(t=>t.words||[]);
const isL=(l,w)=>!!S[l].srs[w.w];
function nextWords(l,n){const out=[],titles=[];for(const t of themes(l)){if(out.length>=n)break;if(!t.words)return{words:out,titles,needGen:t.gi,genTitle:t.title};for(const w of t.words){if(out.length>=n)break;if(!isL(l,w)){out.push(w);if(!titles.includes(t.title))titles.push(t.title);}}}return{words:out,titles,needGen:null};}
const cjk=(l,t,cls)=>`<span class="${cls||"cjk"}" lang="${L[l].hl}">${esc(t)}</span>`;
function glyph(l,w){const ch=[...w.w];return `<div class="glyph" lang="${L[l].hl}" style="--n:${Math.max(ch.length,1)}">${ch.map(c=>`<span class="cell">${esc(c)}</span>`).join("")}</div>`;}
function readingHTML(l,w,force){
  if(!S.settings.showReading&&!force)return "";
  if(l==="ja"){const k=w.k&&w.k!==w.w?`<p class="kana" lang="ja">${esc(w.k)}</p>`:"";return k+`<p class="reading">${esc(w.r)}</p>`;}
  return `<p class="reading">${esc(w.r)}</p>`;
}
function hl(text,words){let h=esc(text);words.slice().sort((a,b)=>b.w.length-a.w.length).forEach(w=>{h=h.split(esc(w.w)).join("\u0000"+esc(w.w)+"\u0001");});return h.replace(/\u0000/g,"<mark>").replace(/\u0001/g,"</mark>");}
const fmtDate=t=>new Date(t).toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"});
function normPinyin(s){return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/v/g,"u").replace(/[^a-z]/g,"");}
function normRomaji(s){return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z]/g,"").replace(/ou/g,"o").replace(/oo/g,"o").replace(/uu/g,"u");}
function readingMatch(l,input,w){
  const t=String(input||"").trim(); if(!t)return false;
  if(l==="ja"){ if(/[\u3040-\u30ff]/.test(t))return t.replace(/\s/g,"")===(w.k||w.w); return normRomaji(t)===normRomaji(w.r); }
  return normPinyin(t)===normPinyin(w.r);
}
const PLAY=`<span aria-hidden="true">🔊</span>`;

/* ---------- Audio: speech output ---------- */
let voices=[];
function loadVoices(){try{voices=speechSynthesis.getVoices();}catch(e){voices=[];}}
if("speechSynthesis" in window){loadVoices();speechSynthesis.onvoiceschanged=()=>{loadVoices();/* view is defined later, in js/lessons.js; voices can load first */if(typeof view!=="undefined"&&view.s==="settings")render();};}
function voiceFor(l){const c=L[l].code.toLowerCase();return voices.find(v=>v.lang.replace("_","-").toLowerCase()===c)||voices.find(v=>v.lang.toLowerCase().startsWith(l));}
function say(text,l){
  if(!("speechSynthesis" in window)){note("This browser cannot play speech audio.");return;}
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);u.lang=L[l].code;const v=voiceFor(l);if(v)u.voice=v;u.rate=0.9*S.settings.speed;
  speechSynthesis.speak(u);
}
let noteText="";function note(t){noteText=t;render();}
function buzz(p){if(!S.settings.vib)return;try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}}

/* ---------- Audio: speech input ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const canRecord=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
function speakMode(){const m=S.settings.speakMode;if(m==="recognize"&&SR)return m;if(m==="record"&&canRecord)return m;if(m==="self")return m;return SR?"recognize":(canRecord?"record":"self");}
function speechMatch(alts,w){return alts.some(t=>{const s=String(t).replace(/[\s。、，,.!?！？]/g,"");return s.includes(w.w)||(w.k&&s.includes(w.k))||(NUM[w.w]&&s.includes(NUM[w.w]));});}
function startListen(q){
  const r=new SR();r.lang=L[q.lang].code;r.interimResults=false;r.maxAlternatives=5;
  let fin=false;q.listening=true;q.srMsg="";render();
  const done=()=>{fin=true;q.listening=false;};
  r.onresult=e=>{if(fin)return;done();const alts=[...e.results[0]].map(a=>a.transcript);const ok=speechMatch(alts,q.word);
    if(!q.answered){q.answered=true;q.correct=ok;q.heard=alts[0];onAnswer(q);}else{q.practice={ok,heard:alts[0]};}
    render();};
  r.onerror=e=>{if(fin)return;done();
    if(["not-allowed","service-not-allowed","audio-capture"].includes(e.error)){S.settings.speakMode=canRecord&&e.error!=="audio-capture"?"record":"self";save();q.srMsg="The browser blocked the microphone for this page. Speaking questions now use "+(S.settings.speakMode==="record"?"“Record and compare”.":"“Listen and self-check”.");}
    else if(e.error==="no-speech"){q.srMsg="No speech was heard. Tap “Start speaking” and say the word.";}
    else{q.srMsg="Speech recognition stopped with error “"+e.error+"”. Tap “Start speaking” to try again.";}
    render();};
  r.onend=()=>{if(fin)return;done();q.srMsg="No speech was heard. Tap “Start speaking” and say the word.";render();};
  try{r.start();}catch(e){done();q.srMsg="Speech recognition could not start.";render();}
}
async function startRec(q){
  try{
    const st=await navigator.mediaDevices.getUserMedia({audio:true});
    const mr=new MediaRecorder(st);const ch=[];
    mr.ondataavailable=e=>{if(e.data.size)ch.push(e.data);};
    mr.onstop=()=>{st.getTracks().forEach(t=>t.stop());q.recUrl=URL.createObjectURL(new Blob(ch,{type:mr.mimeType||"audio/webm"}));q.recording=false;render();};
    q.mr=mr;mr.start();q.recording=true;render();
  }catch(e){S.settings.speakMode="self";save();q.srMsg="The microphone is not available in this view. The app switched to “Listen and self-check”.";render();}
}

/* ---------- AI (Claude) ---------- */
let sampleP=null;
function getSample(){return Promise.resolve(null);}
function aiErr(e){const c=e&&e.code;
  if(c==="not_granted"||c==="sampling_disabled"||c==="not_declared"||c==="capability_disabled")return "AI is not allowed in this view. The app works without it.";
  if(c==="rate_limited")return "Too many AI requests. Wait a few minutes, then try again.";
  if(c==="session_expired")return "Your Claude session expired. Sign in again, then try again.";
  if(c==="invalid_json")return "The AI reply was not in the expected format. Tap the button to try again.";
  return "The AI request failed. Tap the button to try again.";}

const PUB=false,AI_OFF=true;
async function hasAI(){return false;}
async function aiJSON(prompt,opts){const s=await getSample();if(s)return s.json(prompt,opts||{});return previewCall(prompt,true);}
async function aiText(prompt,opts){const s=await getSample();if(s)return (await s(prompt,opts||{})).text;return previewCall(prompt,false);}
async function previewCall(prompt,json){
  if(PUB)throw{code:"not_granted"};
  let r;try{r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,messages:[{role:"user",content:prompt+(json?"\n\nReply with only the JSON value. No other text and no Markdown code fences.":"")}]})});}catch(e){throw{code:"not_granted"};}
  if(!r.ok)throw{code:r.status===429?"rate_limited":"upstream_error"};
  const d=await r.json();const t=(d.content||[]).filter(x=>x.type==="text").map(x=>x.text).join("\n").trim();
  if(!json)return t;
  const c=t.replace(/```json|```/g,"").trim(),i=c.search(/[\[{]/),j=Math.max(c.lastIndexOf("}"),c.lastIndexOf("]"));
  try{return JSON.parse(c.slice(i,j+1));}catch(e){throw{code:"invalid_json"};}
}
/* ---------- Spaced repetition ---------- */
function srsSet(l,w,ok){const e=S[l].srs[w]||{b:0,d:0};e.u=Date.now();e.b=ok?Math.min(5,e.b+1):1;e.d=Date.now()+(ok?INTERVAL[e.b]*DAY:0);S[l].srs[w]=e;}
function dueList(l){const now=Date.now();return allWords(l).filter(w=>S[l].srs[w.w]&&S[l].srs[w.w].d<=now);}
function nextDue(l){const ds=Object.values(S[l].srs).map(e=>e.d);return ds.length?Math.min(...ds):0;}

