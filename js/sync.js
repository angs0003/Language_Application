"use strict";
/* Language Steps: sync.js. Database sync with Supabase (word_progress, activity, user_settings).
   Files load in the order listed in js/loader.js (APP_FILES); they share one global scope. */
/* ---------- Database sync (Supabase) ----------
   Tables: word_progress (one row per word), activity (one row per finished item),
   user_settings (one row per user). See supabase.sql. */
const DB=window.LS_DB||null;
let dbUser=null,dbMsg="",dbT=null,syBusy=false,syAgain=false;
const dbLast={w:{},a:{},s:""};
const iso=t=>t?new Date(t).toISOString():null;
const ms=t=>t?Date.parse(t):0;
function stateRows(st,uid){
  const words=[],acts=[];
  for(const l of ["zh","ja"]){
    const s=st[l],saved={};(s.saved||[]).forEach(x=>{saved[x.w]=x;});
    const keys=new Set([...Object.keys(s.srs||{}),...Object.keys(saved)]);
    keys.forEach(w=>{const e=(s.srs||{})[w],x=saved[w];
      words.push({user_id:uid,lang:l,word:w,box:e?e.b:(x?x.b||0:0),due:iso(e?e.d:(x?x.d:0)),saved:!!x,reading:x?x.r||"":"",meaning:x?x.m||"":"",sentence:x?x.s||"":"",source:x?x.src||"":"",saved_box:x?x.b||0:0,saved_due:iso(x?x.d:0),saved_at:iso(x?x.t:0),sentence_tokens:x&&x.tk?x.tk:null,updated_at:iso(Math.max(e?(e.u||e.d||1):0,x?(x.u||x.t||1):0))});});
    if(l==="ja")for(const store of ["kana","kanji"])Object.entries(s[store]||{}).forEach(([k,e])=>words.push({user_id:uid,lang:"ja-"+store,word:k,box:e.b||0,due:iso(e.d),saved:false,reading:"",meaning:"",sentence:"",source:"",saved_box:0,saved_due:null,saved_at:null,sentence_tokens:null,updated_at:iso(e.u||e.d||1)}));
    (s.chRead||[]).forEach(n=>acts.push({user_id:uid,lang:l,kind:"chapter",key:String(n)}));
    Object.keys(s.tripDone||{}).filter(k=>s.tripDone[k]).forEach(k=>acts.push({user_id:uid,lang:l,kind:"trip",key:String(k)}));
    Object.keys(s.tripOpen||{}).filter(k=>s.tripOpen[k]).forEach(k=>acts.push({user_id:uid,lang:l,kind:"trip_open",key:String(k)}));
    Object.keys(s.podDone||{}).filter(k=>s.podDone[k]).forEach(k=>acts.push({user_id:uid,lang:l,kind:"podcast",key:String(k)}));
    (s.grDone||[]).forEach(g=>acts.push({user_id:uid,lang:l,kind:"grammar",key:String(g)}));
  }
  const per={};for(const l of ["zh","ja"]){const s=st[l];per[l]={placed:s.placed,gi:s.gi,lc:s.lc,lst:s.lst,hist:s.hist,lastLesson:s.lastLesson,videos:s.videos,videosWatched:s.videosWatched,mis:s.mis,real:s.real,casualDone:s.casualDone,resume:s.resume};}
  const settings={user_id:uid,data:{v:1,lang:st.lang,tab:st.tab,settings:st.settings,per,lastActive:st.lastActive},updated_at:iso(st.updatedAt||Date.now())};
  return {words,acts,settings};
}
const wKey=r=>r.lang+"|"+r.word,aKey=r=>r.lang+"|"+r.kind+"|"+r.key;
function mergeRemote(st,rw,ra,rs){
  /* Returns a new state: settings from the newer side, each word from the newer side, activity as a union. */
  const out=normalize(JSON.parse(JSON.stringify(st)));
  if(rs&&rs.data&&ms(rs.updated_at)>(st.updatedAt||0)){const d=rs.data;out.lang=d.lang||out.lang;out.tab=d.tab||out.tab;out.settings=Object.assign({},out.settings,d.settings||{});out.lastActive=Math.max(out.lastActive||0,d.lastActive||0);
    for(const l of ["zh","ja"])if(d.per&&d.per[l])Object.assign(out[l],d.per[l]);}
  (rw||[]).forEach(r=>{if(r.lang==="ja-kana"||r.lang==="ja-kanji"){const store=r.lang.slice(3),st=out.ja[store]||(out.ja[store]={}),e=st[r.word],ru=ms(r.updated_at);if(!e||ru>=(e.u||e.d||0))st[r.word]={b:r.box||0,d:ms(r.due),u:ru};return;}const s=out[r.lang];if(!s)return;const e=s.srs[r.word],lu=e?(e.u||e.d||1):0,ru=ms(r.updated_at);
    const sv=(s.saved||[]).find(x=>x.w===r.word),su=sv?(sv.u||sv.t||1):0;
    if(ru>=Math.max(lu,su)){
      if(r.due||r.box){s.srs[r.word]={b:r.box||0,d:ms(r.due),u:ru};}
      s.saved=(s.saved||[]).filter(x=>x.w!==r.word);
      if(r.saved)s.saved.push({w:r.word,r:r.reading,m:r.meaning,s:r.sentence,src:r.source,b:r.saved_box||0,d:ms(r.saved_due),t:ms(r.saved_at),u:ru,tk:r.sentence_tokens||null});
    }});
  for(const l of ["zh","ja"])out[l].saved=(out[l].saved||[]).sort((a,b)=>(b.t||0)-(a.t||0));
  (ra||[]).forEach(r=>{const s=out[r.lang];if(!s)return;
    if(r.kind==="chapter"){const n=+r.key;if(!s.chRead.includes(n))s.chRead.push(n);}
    else if(r.kind==="trip")s.tripDone[r.key]=true;else if(r.kind==="trip_open")s.tripOpen[r.key]=true;
    else if(r.kind==="podcast")s.podDone[r.key]=true;else if(r.kind==="grammar"){const g=+r.key;s.grDone=s.grDone||[];if(!s.grDone.includes(g))s.grDone.push(g);}});
  out.updatedAt=Math.max(st.updatedAt||0,rs?ms(rs.updated_at):0);
  return out;
}
async function dbSelect(table){const out=[];let from=0;for(;;){const {data,error}=await DB.from(table).select("*").eq("user_id",dbUser.id).range(from,from+999);if(error)throw error;out.push(...data);if(data.length<1000)break;from+=1000;}return out;}
async function dbPull(){
  if(!DB||!dbUser)return;
  try{
    const [rw,ra,rsA]=await Promise.all([dbSelect("word_progress"),dbSelect("activity"),dbSelect("user_settings")]);
    const rs=rsA[0]||null;
    S=mergeRemote(S,rw,ra,rs);try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}
    rw.forEach(r=>{dbLast.w[wKey(r)]=JSON.stringify(cmpW(r));});ra.forEach(r=>{dbLast.a[aKey(r)]=1;});if(rs)dbLast.s=JSON.stringify(rs.data);
    dbMsg="Progress loaded from your account at "+new Date().toLocaleTimeString()+".";
    if(view.s==="home"||view.s==="settings")render();
    await dbPush();
  }catch(e){dbMsg="Could not load progress from your account: "+(e.message||e)+". The copy on this device is used.";}
}
const cmpW=r=>[r.box,r.due,r.saved,r.reading,r.meaning,r.sentence,r.source,r.saved_box,r.saved_due,r.sentence_tokens||null];
function dbQueue(){if(!DB||!dbUser)return;clearTimeout(dbT);dbT=setTimeout(dbPush,1500);}
async function dbPush(){
  if(!DB||!dbUser)return;if(syBusy){syAgain=true;return;}syBusy=true;
  try{
    const {words,acts,settings}=stateRows(S,dbUser.id);
    const wNew=words.filter(r=>dbLast.w[wKey(r)]!==JSON.stringify(cmpW(r)));
    const present=new Set(words.map(wKey)),wDel=Object.keys(dbLast.w).filter(k=>!present.has(k));
    const aNew=acts.filter(r=>!dbLast.a[aKey(r)]);
    for(let i=0;i<wNew.length;i+=500){const {error}=await DB.from("word_progress").upsert(wNew.slice(i,i+500));if(error)throw error;}
    for(const k of wDel){const [lang,word]=k.split("|");const {error}=await DB.from("word_progress").delete().eq("user_id",dbUser.id).eq("lang",lang).eq("word",word);if(error)throw error;delete dbLast.w[k];}
    for(let i=0;i<aNew.length;i+=500){const {error}=await DB.from("activity").upsert(aNew.slice(i,i+500));if(error)throw error;}
    const sj=JSON.stringify(settings.data);if(sj!==dbLast.s){const {error}=await DB.from("user_settings").upsert(settings);if(error)throw error;dbLast.s=sj;}
    wNew.forEach(r=>{dbLast.w[wKey(r)]=JSON.stringify(cmpW(r));});aNew.forEach(r=>{dbLast.a[aKey(r)]=1;});
    dbMsg="Saved to your account at "+new Date().toLocaleTimeString()+".";
  }catch(e){dbMsg=(navigator.onLine===false?"Offline. Changes are kept on this device and saved when the connection returns.":"Could not save to your account: "+(e.message||e)+". Changes are kept on this device.");}
  syBusy=false;if(syAgain){syAgain=false;dbPush();}
  if(view.s==="settings")render();
}
async function dbInit(){
  if(!DB)return;
  try{const {data}=await DB.auth.getSession();dbUser=data&&data.session?data.session.user:null;}catch(e){}
  if(!dbUser)return;
  window.addEventListener("online",()=>dbPush());
  await dbPull();
}
function accountCard(){
  if(!DB)return `<div class="card"><h2>👤 Account</h2><p class="small" style="margin:0">The database is not set up, so progress is saved on this device only. See README step 2.</p></div>`;
  return `<div class="card"><h2>👤 Account</h2><p class="small">Signed in as ${esc(dbUser&&dbUser.email||"")}. All progress is saved to your account automatically.</p>${dbMsg?`<p class="small"><strong>${esc(dbMsg)}</strong></p>`:""}<p class="small muted">Content version: ${esc(window.LS_CONTENT_VERSION||"bundled")}.</p><div class="inline"><button class="btn sec" data-a="${A(()=>{dbPull().then(render);})}">Sync now</button><button class="btn sec" data-a="${A(async()=>{try{await DB.auth.signOut();}catch(e){}try{localStorage.removeItem(KEY);localStorage.removeItem("ls-content-cache");}catch(e){}location.reload();})}">Sign out</button></div></div>`;
}

