"use strict";
/* Language Steps: listen.js. Podcast, recap, saved words (My words), loop, text modes, Watch, player, video player.
   Files load in the order listed in js/loader.js (APP_FILES); they share one global scope. */
/* ---------- Podcast, recommendations, recap ---------- */
const EXT={
 ja:[{name:"Nihongo con Teppei for Beginners",url:"https://www.youtube.com/results?search_query=Nihongo+con+Teppei+for+beginners",note:"A free podcast in slow, simple Japanese."},
     {name:"Learn Japanese Pod",url:"https://www.youtube.com/results?search_query=Learn+Japanese+Pod",note:"Beginner episodes tagged N5 and N4, at a slow pace."},
     {name:"JapanesePod101",url:"https://www.youtube.com/results?search_query=JapanesePod101+absolute+beginner",note:"Short beginner audio lessons with English explanations."}],
 zh:[{name:"Coffee Break Chinese",url:"https://coffeebreaklanguages.com/coffeebreakchinese/",note:"A structured beginner course in episodes of 15 to 20 minutes."},
     {name:"Mandarin Corner (beginner series)",url:"https://www.youtube.com/results?search_query=Mandarin+Corner+beginner",note:"Slow, clear Mandarin about everyday situations, such as ordering food and taking a taxi."},
     {name:"ChinesePod",url:"https://www.youtube.com/results?search_query=ChinesePod+newbie",note:"Short beginner lessons. Episodes are free; the dialogue notes need a subscription."}]};
const SIT_MAP={1:3,2:1,3:4,4:6,5:0,6:7};
let awayRecap=!!S.lastActive&&Date.now()-S.lastActive>6*3600e3;
function recapWords(l){const all=allWords(l),last=(S[l].lastLesson||[]).map(w=>all.find(x=>x.w===w)).filter(Boolean);const out=[];last.concat(dueList(l)).forEach(w=>{if(!out.includes(w))out.push(w);});return out.slice(0,5);}
function startRecap(){awayRecap=false;startReview(recapWords(S.lang),true);}
function homePod(l,r){
  const pd=S[l].podDone||{},ths=themes(l);
  r.main=`<details class="card tint acc" data-k="in-pod" ${isOpen("in-pod",false)?"open":""}><summary>🎧 Podcast (about)</summary><p style="margin:0">One episode per theme. Each episode plays the new words, the story chapter (each line, then English) and 2 questions, like a radio show. Use it while walking or travelling.</p></details><div class="card"><ul class="units">${ths.map((t,i)=>{const c=t.words.filter(w=>isL(l,w)).length;return `${LV_START[l].includes(i)?`<li class="lvh"><span><strong>Level ${LV_START[l].indexOf(i)+1}</strong></span></li>`:""}<li><button class="rowbtn" data-a="${A(()=>openPod(i))}"><span><span aria-hidden="true">${pd[i]?"✅":"⭕"}</span> Episode ${i+1}: ${esc(t.title)}<br><span class="status">${pd[i]?"Listened":c?"Theme in progress":"Theme not started yet"}</span></span><span class="chev" aria-hidden="true">›</span></button></li>`;}).join("")}</ul></div>
  <div class="card"><h2>🌐 Podcasts outside this app</h2><ul class="units">${EXT[l].map(x=>`<li><span><a href="${x.url}" target="_blank" rel="noopener">${esc(x.name)}</a><br><span class="small">${esc(x.note)}</span></span></li>`).join("")}</ul><p class="small muted" style="margin:8px 0 0">These links open outside this app. They were checked on 2 November 2026.</p></div>`;
}
const POD_PARTS=["Words","Story"];
function podSegs(l,i){
  const t=themes(l)[i],ch=chapter(l,i),segs=[];
  t.words.forEach(w=>segs.push({part:"Words",lang:l,text:w.w,rate:0.9,tokens:[[w.w,w.r,w.m]],rd:w.r,en:w.m,gap:1500}));
  const map=spkMap(ch.lines);
  ch.lines.forEach(x=>{const k=spkSkip(x),si=spkIdx(map,x),rd=x.tokens.map(y=>y[1]).filter(Boolean).join(" ");segs.push({part:"Story",lang:l,text:spokenText(x),rate:0.9,tokens:x.tokens,skip:k,si,rd,en:k?x.english.replace(/^[^:：]{1,30}[:：]\s*/,""):x.english,gap:900});});
  return segs;
}
function openPod(i){view={s:"pod",i,segs:podSegs(S.lang,i),idx:0,playing:false,slow:false,finished:false};render();window.scrollTo(0,0);}
function podMark(v){document.querySelectorAll(".podit.now").forEach(e=>e.classList.remove("now"));const el=document.querySelector(`[data-seg="${v.idx}"]`);if(el){el.classList.add("now");if(el.scrollIntoView)el.scrollIntoView({block:"center"});}const pt=document.getElementById("podpart");if(pt&&v.segs[v.idx])pt.textContent=podStatus(v);}
function podStop(v){playTok++;try{speechSynthesis.cancel();}catch(e){}v.playing=false;hlClear();}
function podPlay(v){
  if(!("speechSynthesis" in window)){note("This browser cannot play speech audio.");return;}
  speechSynthesis.cancel();const tok=++playTok,l=S.lang;v.playing=true;render();
  const step=()=>{
    if(tok!==playTok)return;
    if(v.idx>=v.segs.length){v.playing=false;v.finished=true;const pd=S[l].podDone||(S[l].podDone={});if(!pd[v.i]){pd[v.i]=true;histPush(l,"🎧 Episode "+(v.i+1));}save();if(view===v){render();window.scrollTo(0,0);}return;}
    const s=v.segs[v.idx];podMark(v);
    const u=new SpeechSynthesisUtterance(s.text);u.lang=L[s.lang].code;const vc=voiceFor(s.lang);if(vc)u.voice=vc;u.rate=s.rate*S.settings.speed;
    if(s.si!=null)applySpeaker(u,voicesFor(s.lang),s.si);
    if(s.tokens)hlTrack(u,s.tokens,()=>document.querySelector(`[data-seg="${v.idx}"]`),()=>tok===playTok,s.skip||0);
    let fin=false;const next=()=>{if(fin||tok!==playTok)return;fin=true;hlClear();if(!v.loop)v.idx++;setTimeout(step,s.gap);};u.onend=next;u.onerror=next;
    speechSynthesis.speak(u);
  };
  step();
}
/* Podcast episode: the words of the theme, then its story. Only the target language is spoken; the English is shown in the same box. */
function podStatus(v){const s=v.segs[Math.min(v.idx,v.segs.length-1)],inPart=v.segs.filter(x=>x.part===s.part);return `${s.part} · ${inPart.indexOf(s)+1} of ${inPart.length}`;}
function podGo(v,k){
  k=Math.max(0,Math.min(v.segs.length-1,k));if(k===v.idx)return;
  const was=v.playing;podStop(v);v.idx=k;if(was)podPlay(v);else{render();podMark(v);}
}
function screenPod(){
  const v=view,l=S.lang,t=themes(l)[v.i];
  const r={row:"title",title:`🎧 Episode ${v.i+1}: ${t.title}`,back:{label:"Back",fn:()=>{podStop(v);goHome();}},main:""};
  if(v.finished){
    r.prog=`<div class="ptext">Episode finished</div>`;
    r.main=`<div class="card tint"><h2>✅ Episode ${v.i+1} finished</h2><p style="margin:0">${esc(t.title)}</p><p class="small muted" style="margin:0">This episode is marked as listened.</p><button class="btn link" data-a="${A(()=>{v.finished=false;v.idx=0;podPlay(v);})}">Play again</button></div>`;
    r.next=nextAfter("pod",v.i,true);return r;
  }
  const sub=S.settings.sub,last=v.segs.length-1;
  r.prog=`<div class="ptext" id="podpart">${podStatus(v)}</div><div class="psub">Tap a line to jump to it.</div>`;
  let h=`<div class="card podctl"><div class="podnav"><button class="btn sec" ${v.idx<=0?"disabled":""} data-a="${A(()=>podGo(v,v.idx-1))}">${ico("prev",18)} Previous</button><button class="btn sec" ${v.idx>=last?"disabled":""} data-a="${A(()=>podGo(v,v.idx+1))}">Next ${ico("prev",18,'style="transform:scaleX(-1)"')}</button></div>
  <details class="acc podopt" data-k="podopt" ${isOpen("podopt",false)?"open":""}><summary>Options</summary><div style="margin-top:6px">${speedHTML()}</div><div style="margin-top:8px">${subChips()}</div><div class="inline" style="margin-top:8px"><button class="play" aria-pressed="${!!v.loop}" data-a="${A(()=>{v.loop=!v.loop;render();})}">${ico("loop",18)} Repeat line: ${v.loop?"on":"off"}</button></div><button class="btn sec full" style="margin-top:10px" data-a="${A(()=>{podStop(v);openPlayer("pod",v.i);})}">Player view</button></details></div>`;
  if(sub==="none"){h+=`<div class="card"><p class="small muted" style="margin:0">Text hidden (listening only). Change it in Options.</p></div>`;}
  else{
    h+=`<div class="card podlist">`;let lastPart="";
    v.segs.forEach((s,k)=>{
      if(s.part!==lastPart){lastPart=s.part;h+=`<p class="podlab">${esc(s.part)}</p>`;}
      const en=sub==="both"&&s.en?`<span class="en">– ${esc(s.en)}</span>`:"";
      h+=`<button class="podit${s.part==="Story"?" sent":""}${k===v.idx&&(v.playing||v.idx>0)?" now":""}" data-seg="${k}" data-a="${A(()=>podGo(v,k))}"><span lang="${L[l].hl}" class="cjk2">${s.tokens.map(x=>`<span class="tk pl">${esc(x[0])}</span>`).join("")}</span> <span class="rdg">${esc(s.rd||"")}</span> ${en}</button>`;
    });
    h+=`</div>`;
  }
  r.main=h;
  r.next=v.playing?{label:"⏸️ Pause",fn:()=>{podStop(v);render();}}:{label:v.idx>0?"▶️ Resume":"▶️ Play episode",fn:()=>podPlay(v)};
  return r;
}

function speedHTML(){return `<div class="inline speed"><span class="small">🔊 Speed</span>${[0.6,0.8,1,1.2,1.4].map(x=>`<button class="chip" aria-pressed="${S.settings.speed===x}" data-a="${A(()=>{S.settings.speed=x;save();if(view.s==="pod"&&view.playing){podStop(view);podPlay(view);}else render();})}">${x}×</button>`).join("")}</div>`;}
/* ---------- Saved words (My words), loop, subtitles, watch, backup ---------- */
const EMBED_OK=(()=>{try{return window.self===window.top;}catch(e){return false;}})();
function savedList(l){return S[l].saved||(S[l].saved=[]);}
function isSaved(l,w){return savedList(l).some(x=>x.w===w);}
function srcLabel(){const l=S.lang;try{if(view.s==="lesson")return "Lesson: "+view.title;if(view.s==="story")return "Story chapter "+(view.n+1);if(view.s==="trip")return "Travel: "+TRIP[l][view.i].t;if(view.s==="pod")return "Podcast episode "+(view.i+1);if(view.s==="player")return ({story:"Story chapter ",pod:"Podcast episode ",trip:"Travel: "}[view.kind])+(view.kind==="trip"?TRIP[l][view.i].t:(view.i+1));if(view.s==="video")return "Video: "+(view.item.title||"");if(view.s==="theme")return "Theme "+(view.ti+1);}catch(e){}return "";}
function toggleSave(sh,keep){const a=savedList(sh.l),i=a.findIndex(x=>x.w===sh.text);if(i>=0)a.splice(i,1);else{a.unshift({w:sh.text,r:sh.r,m:(sh.data&&sh.data.meaning)||sh.m,s:sh.sent||"",src:sh.src||"",b:0,d:Date.now(),t:Date.now(),u:Date.now(),tk:sh.tk||null});buzz(30);}save();if(!keep)render();}
function savedDue(l){const now=Date.now();return savedList(l).filter(x=>(x.d||0)<=now);}
function startCards(){const l=S.lang,due=savedDue(l),list=(due.length?due:savedList(l)).slice(0,20);if(!list.length){note("You have no saved words yet. Tap a word in any sentence, then tap “⭐ Save word”.");return;}view={s:"cards",list:shuffle(list),k:0,show:false,res:[]};render();window.scrollTo(0,0);}
function gradeCard(v,ok){const x=v.list[v.k];x.u=Date.now();x.b=ok?Math.min(5,(x.b||0)+1):1;x.d=Date.now()+(ok?INTERVAL[x.b]*DAY:0);v.res[v.k]=ok;save();buzz(ok?30:[40,60,40]);v.k++;v.show=false;render();window.scrollTo(0,0);}
function screenCards(){
  const v=view,l=S.lang;const r={row:"title",title:"⭐ My words",back:{label:"Back",fn:goHome},main:""};
  if(v.k>=v.list.length){const c=v.res.filter(Boolean).length;r.prog=`<div class="ptext">Practice finished</div>`;r.main=`<div class="card tint"><h2>✅ Practice finished</h2><p style="margin:0">You knew ${c} of ${v.list.length} words. Words you did not know come back today.</p></div>`;r.next={label:"Go to home",fn:goHome};return r;}
  const x=v.list[v.k];
  r.prog=`<div class="ptext">Card ${v.k+1} of ${v.list.length}</div><div class="bar"><i style="width:${Math.round(v.k/v.list.length*100)}%"></i></div>`;
  let h=`<div class="card">${glyph(l,{w:x.w})}<p class="center"><button class="play" aria-label="Play audio" title="Play audio" data-a="${A(()=>say(x.w,l))}">${PLAY}</button></p>`;
  if(v.show){h+=`<p class="reading">${esc(x.r)}</p><p class="meaning">${esc(x.m)}</p>${x.s?`<p class="ex" lang="${L[l].hl}">${hl(x.s,[{w:x.w}])}</p>`:""}${x.src?`<p class="small muted">Saved from: ${esc(x.src)}</p>`:""}
    <div class="stack" style="margin-top:10px"><button class="opt right" data-a="${A(()=>gradeCard(v,true))}">✅ I knew it</button><button class="opt wrong" data-a="${A(()=>gradeCard(v,false))}">❌ I did not know it</button></div>`;}
  else h+=`<p class="small muted center">Say the meaning in your head, then tap “Show answer”.</p>`;
  r.main=h+`</div>`;
  r.back={label:"Back",fn:()=>{if(v.k>0){v.k--;v.show=false;render();}else goHome();}};
  r.next=v.show?{label:"Choose an answer above",dis:true}:{label:"Show answer",fn:()=>{v.show=true;render();}};
  return r;
}
function myWordsCard(l){
  const a=savedList(l),due=savedDue(l).length;
  return `<div class="card"><h2>⭐ My words: ${a.length}</h2>${a.length?`<p class="small muted">Due now: ${due}. Tap “Practise my words” for flashcards.</p><button class="btn sec full" style="margin-bottom:8px" data-a="${A(openVocab)}">Open My words: search, filter and practise</button><ul class="units">${a.slice(0,40).map((x,i)=>`<li><span><span class="cjk2" lang="${L[l].hl}">${esc(x.w)}</span> <span class="muted">${esc(x.r)}</span><br><span class="status">${esc(x.m)}</span></span><button class="play" data-a="${A(()=>{a.splice(i,1);save();render();})}">Remove</button></li>`).join("")}</ul>${a.length>40?`<p class="small muted">Showing the newest 40 of ${a.length}.</p>`:""}`:`<p class="small muted" style="margin:0">No saved words yet. Tap a word in any sentence, then tap “⭐ Save word”.</p>`}</div>`;
}
function playLoop(s,l,i){
  if(!("speechSynthesis" in window)){note("This browser cannot play speech audio.");return;}
  speechSynthesis.cancel();const tok=++playTok,vs=voicesFor(l);
  const go=()=>{if(tok!==playTok)return;const u=new SpeechSynthesisUtterance(spokenText(s));u.lang=L[l].code;if(vs[0])u.voice=vs[0];u.rate=0.9*S.settings.speed;u.onstart=()=>{if(tok===playTok&&i!=null)markLine(i);};u.onend=()=>{if(tok===playTok)setTimeout(go,800);};speechSynthesis.speak(u);};
  go();
}
const SUBS=[["both","Both languages"],["target","Target only"],["none","No text"]];
function subChips(){return `<div class="inline speed"><span class="small">🔤 Text</span>${SUBS.map(([k,t])=>`<button class="chip" aria-pressed="${S.settings.sub===k}" data-a="${A(()=>{S.settings.sub=k;save();render();})}">${t}</button>`).join("")}</div>`;}
function storySentHTML(l,s){const m=S.settings.sub;if(m==="none")return `<p class="small muted" style="margin:0">Text hidden (listening only). Change it with 🔤 Text above.</p>`;return glossHTML(l,s.tokens,[],m==="target")+(m==="both"&&S.settings.showEnglish&&s.english?`<p class="eng">${esc(s.english)}</p>`:"");}
/* Watch */
function ytId(u){const m=String(u).trim().match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);return m?m[1]:null;}
function homeWatch(l,r){
  const mine=S[l].videos||(S[l].videos=[]),lv=view.vlv||curLevel(l),inLv=x=>lv==="all"||!x.lvn||x.lvn<=lv;
  const lib=(VIDS[l]||[]).filter(x=>x.id&&inLv(x)),chans=(VIDS[l]||[]).filter(x=>!x.id&&inLv(x));
  const nLv=Math.max(...(LEVELS[l]||[]).map((x,i)=>i+1),1);
  let h=`<details class="card tint acc" data-k="in-watch" ${isOpen("in-watch",false)?"open":""}><summary>📺 Watch (about)</summary><p>Hand-picked videos with slow, clear speech and visual support. Watch once without stopping. Then watch again at 0.75× and loop the parts you want to hear again.</p><p class="small muted" style="margin:0">${EMBED_OK?"Videos play inside the app, with speed control and section loop.":"In this version, videos open in YouTube."}</p></details>`;
  h+=`<div class="card"><div class="inline speed"><span class="small">Level</span><button class="chip" aria-pressed="${lv==="all"}" data-a="${A(()=>{view.vlv="all";render();})}">All</button>${Array.from({length:nLv},(_,i)=>i+1).map(n=>`<button class="chip" aria-pressed="${lv===n}" data-a="${A(()=>{view.vlv=n;render();})}">Level ${n}</button>`).join("")}</div></div>`;
  const card=(x,mineIdx)=>`<div class="line"><div class="vcard">${EMBED_OK&&x.id?`<img src="https://i.ytimg.com/vi/${x.id}/mqdefault.jpg" alt="" loading="lazy">`:""}<div><p class="q" style="margin:0">${x.watched?"✅":"⭕"} ${esc(x.title||"Video")}</p><p class="small" style="margin:2px 0">${esc(x.ch||"Added by you")}${x.lvn?` · Level ${x.lvn}`:""}${x.len?` · ${esc(x.len)}`:""}${x.transcript&&x.transcript.length?" · 📝 subtitles in the app":""}</p>${x.has?`<p class="small muted" style="margin:0">${esc(x.has)}</p>`:""}</div></div>
    <div class="inline" style="margin-top:8px"><button class="btn pri" data-a="${A(()=>openVideo(x.id))}">▶️ Watch${EMBED_OK?" in the app":" in YouTube"}</button>${mineIdx!=null?`<button class="play" data-a="${A(()=>{view.addw=view.addw===mineIdx?null:mineIdx;render();})}">⭐ Add a word I heard</button><button class="play" data-a="${A(()=>{mine.splice(mineIdx,1);save();render();})}">Remove</button>`:""}</div>
    ${mineIdx!=null&&view.addw===mineIdx?`<div style="margin-top:8px"><label class="sr" for="aw">Word</label><input id="aw" type="text" placeholder="Word (characters or reading)" autocomplete="off"><label class="sr" for="am">Meaning</label><input id="am" type="text" placeholder="Meaning in English" autocomplete="off"><button class="btn sec full" data-a="${A(()=>{const w=document.getElementById("aw").value.trim(),m=document.getElementById("am").value.trim();if(!w)return;savedList(l).unshift({w,r:"",m,s:"",src:"Video: "+x.title,b:0,d:Date.now(),t:Date.now(),u:Date.now()});view.addw=null;save();note("Saved to ⭐ My words.");})}">Save to My words</button></div>`:""}</div>`;
  if(lib.length)h+=`<div class="card"><h2>🎬 Video library</h2>${lib.map(x=>card(x)).join("")}</div>`;
  const mineF=mine.map((x,i)=>[x,i]).filter(([x])=>inLv(x));
  h+=`<div class="card"><h2>🎞️ Your videos</h2>${mineF.length?mineF.map(([x,i])=>card(x,i)).join(""):`<p class="small muted" style="margin:0">No videos at this level yet. Add one below.</p>`}</div>`;
  h+=`<div class="card"><h2>➕ Add a video</h2><p class="small muted">Find a video in YouTube, tap Share, copy the link, and paste it here.</p><label class="sr" for="vurl">YouTube link</label><input id="vurl" type="text" placeholder="https://youtu.be/..." autocomplete="off"><label class="sr" for="vtitle">Title</label><input id="vtitle" type="text" placeholder="Title (optional)" autocomplete="off"><label class="small muted" for="vlv">Level</label><select id="vlv">${Array.from({length:nLv},(_,i)=>i+1).map(n=>`<option value="${n}" ${n===(lv==="all"?1:lv)?"selected":""}>Level ${n}</option>`).join("")}</select>${view.vmsg?`<p class="small"><strong>${esc(view.vmsg)}</strong></p>`:""}<button class="btn sec full" style="margin-top:8px" data-a="${A(()=>{const u=document.getElementById("vurl").value,t=document.getElementById("vtitle").value.trim(),n=+document.getElementById("vlv").value||1,id=ytId(u);if(!id){view.vmsg="This is not a YouTube video link. Copy the link from YouTube’s Share button.";render();return;}if(mine.some(x=>x.id===id)){view.vmsg="This video is already in your list.";render();return;}mine.unshift({id,title:t||"Video "+(mine.length+1),lvn:n,watched:false,t:Date.now()});view.vmsg="Added.";save();render();})}">Add video</button></div>`;
  h+=tvCard(l,lv);
  if(chans.length)h+=`<div class="card"><h2>📌 Recommended channels</h2><p class="small muted">Open a channel, choose a video, then add it above with its link.</p><ul class="units">${chans.map(x=>`<li><span><strong>${esc(x.ch)}</strong>: ${esc(x.t)}<br><span class="small">${esc(x.lv)}. ${esc(x.len)}. ${esc(x.has)}</span><br><a href="${x.url}" target="_blank" rel="noopener">Open in YouTube 🌐</a></span></li>`).join("")}</ul></div>`;
  r.main=h;
}
/* ---------- 🎬 Player (stories, podcast episodes, travel conversations) ---------- */
function playerLinesStory(l,n){const ch=chapter(l,n);return ch.lines.map(s=>({tokens:s.tokens,english:s.english}));}
function playerLinesPod(l,i){
  const t=themes(l)[i],ch=chapter(l,i),out=[];
  t.words.forEach(w=>out.push({tokens:[[w.w,w.r,w.m]],english:w.m,label:"New word"}));
  ch.lines.forEach(s=>out.push({tokens:s.tokens,english:s.english,label:"Story"}));
  return out;
}
function playerLinesTrip(l,i){
  const d=trip(l,i),out=[];
  d.role.forEach(ref=>{const k=+ref.slice(1);const s=ref[0]==="h"?d._p.hear[k]:d._p.say[k].p;out.push({tokens:s.tokens,english:s.english,label:ref[0]==="h"?"🧑 Local":"🙋 You",spk:ref[0]==="h"?"Local":"You"});});
  return out;
}
function openPlayer(kind,i){
  const l=S.lang;let lines,title;
  if(kind==="story"){lines=playerLinesStory(l,i);title=`📖 Chapter ${i+1}: ${chapter(l,i).title}`;}
  else if(kind==="pod"){lines=playerLinesPod(l,i);title=`🎧 Episode ${i+1}: ${themes(l)[i].title}`;}
  else{lines=playerLinesTrip(l,i);title=`✈️ ${TRIP[l][i].t}`;}
  S[l].lastListen={kind,i};save();
  stopAudio();view={s:"player",kind,i,lines,title,idx:0,playing:false,loop:false,auto:!!S.settings.autoPause,done:false};render();window.scrollTo(0,0);
}
/* The item after this one, for the Next button once playback has finished. list=true opens the list view instead of the player. */
function nextAfter(kind,i,list){
  const l=S.lang,ths=themes(l),n=i+1;let ok=false,label="",fn;
  if(kind==="pod"){ok=!!(ths[n]&&ths[n].words&&chapter(l,n));label="Next episode";fn=list?()=>openPod(n):()=>openPlayer("pod",n);}
  else if(kind==="story"){ok=!!(ths[n]&&ths[n].words&&chapter(l,n)&&ths[n].words.every(w=>isL(l,w)));label="Next chapter";fn=list?()=>openChapter(n):()=>openPlayer("story",n);}
  else{ok=n<TRIP[l].length;label="Next situation";fn=()=>openPlayer("trip",n);}
  return ok?{label,fn}:{label:"Back to Listen",fn:()=>setTab("listen")};
}
/* Marks a story, podcast episode or travel conversation as done after it was played to the end. */
function plMarkDone(v){
  const l=S.lang,i=v.i;
  if(v.kind==="story"){const rd=S[l].chRead||(S[l].chRead=[]);if(!rd.includes(i)){rd.push(i);histPush(l,"📖 Chapter "+(i+1));}}
  else if(v.kind==="pod"){const pd=S[l].podDone||(S[l].podDone={});if(!pd[i]){pd[i]=true;histPush(l,"🎧 Episode "+(i+1));}}
  else{const td=S[l].tripDone||(S[l].tripDone={});td[i]=true;}
  save();
}
function plStop(v){playTok++;try{speechSynthesis.cancel();}catch(e){}v.playing=false;hlClear();}
function plPlay(v){
  if(!("speechSynthesis" in window)){note("This browser cannot play speech audio.");return;}
  speechSynthesis.cancel();const tok=++playTok,l=S.lang,vs=voicesFor(l),map=spkMap(v.lines);v.playing=true;v.done=false;render();
  const step=()=>{
    if(tok!==playTok)return;
    if(v.idx>=v.lines.length){v.playing=false;v.done=true;v.idx=v.lines.length-1;hlClear();plMarkDone(v);if(view===v)render();return;}
    const s=v.lines[v.idx],u=new SpeechSynthesisUtterance(spokenText(s));u.lang=L[l].code;applySpeaker(u,vs,spkIdx(map,s));u.rate=0.9*S.settings.speed;
    hlTrack(u,s.tokens,()=>document.querySelector(".plline"),()=>tok===playTok,spkSkip(s));
    let fin=false;const next=()=>{if(fin||tok!==playTok)return;fin=true;hlClear();
      if(v.loop){setTimeout(step,700);return;}
      if(v.auto&&v.idx<v.lines.length-1){v.playing=false;v.waiting=true;if(view===v)render();return;}
      v.idx++;if(view===v&&v.idx<v.lines.length)render();setTimeout(step,600);};
    u.onend=next;u.onerror=next;speechSynthesis.speak(u);
  };
  step();
}
function plGo(v,d){const was=v.playing;plStop(v);v.waiting=false;v.done=false;v.idx=Math.max(0,Math.min(v.lines.length-1,v.idx+d));render();if(was)plPlay(v);}
function screenPlayer(){
  const v=view,l=S.lang,s=v.lines[v.idx],m=S.settings.sub;
  const r={row:"title",title:v.title,back:{label:"Back",fn:()=>{plStop(v);goHome();}},main:""};
  r.prog=`<div class="ptext">🎬 Line ${v.idx+1} of ${v.lines.length}${s.label?": "+esc(s.label):""}</div><div class="bar"><i style="width:${Math.round((v.idx+1)/v.lines.length*100)}%"></i></div>`;
  let screen;
  if(m==="none")screen=`<p class="plhide">Text hidden (listening only)</p>`;
  else screen=`<div class="plline">${glossHTML(l,s.tokens,[],m==="target")}</div>${m==="both"&&S.settings.showEnglish&&s.english?`<p class="plen">${esc(s.english)}</p>`:""}`;
  r.main=`<div class="card plscreen" aria-live="polite">${screen}${v.done?`<p class="small center" style="margin-top:12px"><strong>✅ Finished. This ${({story:"chapter",pod:"episode",trip:"conversation"})[v.kind]} is marked as done.</strong></p><p class="center" style="margin:0"><button class="btn link" data-a="${A(()=>{v.idx=0;plPlay(v);})}">Play again</button></p>`:""}${v.waiting?`<p class="small center muted" style="margin-top:12px">Auto-pause: tap “⏭️ Next line” or “▶️ Play”.</p>`:""}</div>
  <div class="card"><div class="inline" style="justify-content:space-between"><button class="btn sec" ${v.idx===0?"disabled":""} data-a="${A(()=>plGo(v,-1))}">⏮️ Previous line</button><button class="btn sec" ${v.idx>=v.lines.length-1?"disabled":""} data-a="${A(()=>{v.waiting=false;plGo(v,1);})}">Next line ⏭️</button></div>
  <div class="inline" style="margin-top:10px"><button class="play" aria-pressed="${v.loop}" data-a="${A(()=>{v.loop=!v.loop;render();})}">🔁 Loop line: ${v.loop?"on":"off"}</button><button class="play" aria-pressed="${v.auto}" data-a="${A(()=>{v.auto=!v.auto;S.settings.autoPause=v.auto;save();render();})}">⏸️ Auto-pause after each line: ${v.auto?"on":"off"}</button></div>
  <div style="margin-top:10px">${speedHTML()}</div><div style="margin-top:8px">${subChips()}</div>
  <p class="small muted" style="margin:10px 0 0">Tap any word to see its meaning and ⭐ save it. Playback pauses while the word card is open.</p></div>`;
  r.next=v.playing?{label:"⏸️ Pause",fn:()=>{plStop(v);render();}}:v.done?nextAfter(v.kind,v.i):{label:v.waiting?"▶️ Play next line":"▶️ Play",fn:()=>{if(v.waiting){v.waiting=false;v.idx=Math.min(v.lines.length-1,v.idx+1);}plPlay(v);}};
  return r;
}

/* ---------- ⭐ My words (search, filters, practice modes) ---------- */
const VSRC=[["all","All"],["Lesson","Lessons"],["Story","Stories"],["Travel","Travel"],["Podcast","Podcast"],["Video","Videos"],["Theme","Themes"]];
const srcKind=x=>{const s=x.src||"";for(const [k] of VSRC)if(k!=="all"&&s.startsWith(k))return k;return "Other";};
function openVocab(){view={s:"vocab",flt:"all"};render();window.scrollTo(0,0);}
function vocabItems(l,flt){return savedList(l).filter(x=>flt==="all"||srcKind(x)===flt);}
function screenVocab(){
  const v=view,l=S.lang,items=vocabItems(l,v.flt),all=savedList(l),due=savedDue(l).length;
  const r={row:"title",title:"⭐ My words",back:{label:"Back",fn:goHome},main:""};
  r.prog=`<div class="ptext">${all.length} saved words. Due now: ${due}.</div>`;
  let h=`<div class="card"><label class="sr" for="vsearch">Search</label><input id="vsearch" type="text" placeholder="🔍 Search word, reading or meaning" autocomplete="off">
  <div class="inline" style="margin-top:8px">${VSRC.map(([k,t])=>`<button class="chip" aria-pressed="${v.flt===k}" data-a="${A(()=>{v.flt=k;render();})}">${t}</button>`).join("")}</div></div>`;
  h+=`<div class="card"><h2>Practise (${items.length} words)</h2><div class="stack">
    <button class="opt" ${items.length?"":"disabled"} data-a="${A(()=>startVocabPractice("cards",v.flt))}">🃏 Flashcards</button>
    <button class="opt" ${items.some(x=>x.tk&&x.tk.length>1)?"":"disabled"} data-a="${A(()=>startVocabPractice("order",v.flt))}">🔨 Sentence order (from the sentence where you saved each word)</button>
    <button class="opt" ${items.length?"":"disabled"} data-a="${A(()=>startVocabPractice("meaning",v.flt))}">✏️ Meaning quiz</button>
    <button class="opt" ${items.length?"":"disabled"} data-a="${A(()=>startVocabPractice("listen",v.flt))}">👂 Listen and choose</button></div></div>`;
  h+=`<div class="card"><h2>Words</h2>${items.length?`<ul class="units" id="vlist">${items.map(x=>{const i=all.indexOf(x),dueNow=(x.d||0)<=Date.now();return `<li data-s="${esc((x.w+" "+x.r+" "+x.m).toLowerCase())}"><span><span class="cjk2" lang="${L[l].hl}">${esc(x.w)}</span> <span class="muted">${esc(x.r)}</span><br><strong>${esc(x.m)}</strong><br><span class="status">${esc(x.src||"")}${dueNow?" · 🔁 due":""}</span></span><span class="inline" style="flex:none"><button class="play" aria-label="Play audio" title="Play audio" data-a="${A(()=>say(x.w,l))}">${PLAY}</button><button class="play" data-a="${A(()=>{all.splice(i,1);save();render();})}">Remove</button></span></li>`;}).join("")}</ul>`:`<p class="small muted" style="margin:0">No saved words${v.flt==="all"?"":" from this source"}. Tap a word in any sentence, then tap “⭐ Save word”.</p>`}</div>`;
  r.main=h;r.next={label:"Practise flashcards",dis:!items.length,fn:()=>startVocabPractice("cards",v.flt)};
  return r;
}
function startVocabPractice(mode,flt){
  const l=S.lang,pool=vocabItems(l,flt||"all"),due=pool.filter(x=>(x.d||0)<=Date.now());let list=shuffle(due.length?due:pool).slice(0,12);
  if(mode==="cards"){if(!list.length)return;view={s:"cards",list,k:0,show:false,res:[]};render();window.scrollTo(0,0);return;}
  if(mode==="order")list=list.filter(x=>x.tk&&x.tk.length>1);
  const qs=list.map(x=>{const w={w:x.w,r:x.r||x.w,m:x.m||"(no meaning saved)"};let q;
    if(mode==="order"){q=mkBuild(l,{tokens:x.tk,english:`Rebuild the sentence where you saved ${x.w} (${x.m}).`},"build",[]);}
    else q=mkQ(mode==="listen"?"listen":"meaning",w,l);
    q.vitem=x;return q;});
  if(!qs.length)return;
  view={s:"review",qs,i:0,finished:false,vocab:true};render();window.scrollTo(0,0);
}

/* ---------- 📺 Video player (YouTube IFrame API) ---------- */
let ytReady=null;
function loadYT(){if(ytReady)return ytReady;ytReady=new Promise(res=>{if(window.YT&&window.YT.Player)return res();const prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{if(prev)prev();res();};const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";document.head.appendChild(s);});return ytReady;}
function findVideo(l,id){const lib=(VIDS[l]||[]).find(x=>x.id===id);if(lib){const w=S[l].videosWatched||{};return Object.assign(lib,{watched:!!w[id]});}return (S[l].videos||[]).find(x=>x.id===id);}
function openVideo(id){
  const l=S.lang,x=findVideo(l,id);if(!x)return;
  if(!EMBED_OK){window.open("https://www.youtube.com/watch?v="+id,"_blank","noopener");return;}
  stopAudio();view={s:"video",id,item:x,rate:1,a:null,b:null,loop:false,cur:-1};render();window.scrollTo(0,0);
  loadYT().then(()=>{if(view.s!=="video"||view.id!==id)return;
    view.player=new YT.Player("ytp",{videoId:id,playerVars:{rel:0,modestbranding:1,playsinline:1,cc_load_policy:1},events:{onReady:()=>{}}});
    clearInterval(view.timer);const v=view;v.timer=setInterval(()=>vidTick(v),300);});
}
function vidTime(v){try{return v.player&&v.player.getCurrentTime?v.player.getCurrentTime():0;}catch(e){return 0;}}
function vidTick(v){
  if(view!==v){clearInterval(v.timer);return;}
  const t=vidTime(v);
  if(v.loop&&v.a!=null&&v.b!=null&&v.b>v.a&&t>=v.b){try{v.player.seekTo(v.a,true);}catch(e){}}
  const tr=v.item.transcript;if(!tr||!tr.length)return;
  let k=-1;for(let i=0;i<tr.length;i++)if(t>=tr[i].t)k=i;
  if(k!==v.cur){v.cur=k;const el=document.getElementById("vsub");if(el)el.innerHTML=vidSubHTML(v);}
}
function vidSubHTML(v){
  const l=S.lang,tr=v.item.transcript;if(!tr)return "";if(v.cur<0)return `<p class="small muted center" style="margin:0">Subtitles appear here when the video plays.</p>`;
  const line=tr[v.cur],s=line.tokens?{tokens:line.tokens,english:line.english||""}:parseLine(line.line||"");
  const m=S.settings.sub;if(m==="none")return `<p class="small muted center" style="margin:0">Subtitles hidden. Change it with 🔤 Text.</p>`;
  return `<div class="plline">${glossHTML(l,s.tokens,[],m==="target")}</div>${m==="both"&&s.english?`<p class="plen">${esc(s.english)}</p>`:""}`;
}
const fmtT=t=>t==null?"not set":Math.floor(t/60)+":"+String(Math.floor(t%60)).padStart(2,"0");
function screenVideo(){
  const v=view,x=v.item,l=S.lang;
  const r={row:"title",title:"📺 "+(x.title||"Video"),back:{label:"Back",fn:()=>{clearInterval(v.timer);try{v.player&&v.player.destroy();}catch(e){}goHome();}},main:""};
  r.prog=`<div class="ptext">${esc(x.ch||"Your video")}${x.lvn?` · Level ${x.lvn}`:""}${x.len?` · ${esc(x.len)}`:""}</div>`;
  r.main=`<div class="card"><div class="vid"><div id="ytp"></div></div>${x.transcript&&x.transcript.length?`<div id="vsub" class="plscreen" style="margin-top:10px">${vidSubHTML(v)}</div><div style="margin-top:8px">${subChips()}</div>`:`<p class="small muted" style="margin:8px 0 0">This video has no transcript in the app. Use YouTube’s CC button for subtitles.</p>`}</div>
  <div class="card"><h2>Controls</h2><div class="inline"><button class="play" data-a="${A(()=>{try{v.player.seekTo(Math.max(0,vidTime(v)-5),true);}catch(e){}})}">⏪ Back 5 seconds</button></div>
  <p class="q" style="margin:12px 0 4px">🔁 Loop a section</p><p class="small muted" style="margin:0 0 6px">Start: ${fmtT(v.a)}. End: ${fmtT(v.b)}.</p>
  <div class="inline"><button class="play" data-a="${A(()=>{v.a=vidTime(v);if(v.b!=null&&v.b<=v.a)v.b=null;render();})}">Set start here</button><button class="play" data-a="${A(()=>{v.b=vidTime(v);render();})}">Set end here</button><button class="play" aria-pressed="${v.loop}" ${v.a!=null&&v.b!=null&&v.b>v.a?"":"disabled"} data-a="${A(()=>{v.loop=!v.loop;if(v.loop){try{v.player.seekTo(v.a,true);v.player.playVideo();}catch(e){}}render();})}">🔁 Loop: ${v.loop?"on":"off"}</button></div></div>`;
  const watched=!!x.watched;
  r.next={label:watched?"✅ Watched":"✅ Mark as watched",dis:watched,fn:()=>{x.watched=true;const vw=S[l].videosWatched||(S[l].videosWatched={});vw[x.id]=true;save();render();}};
  return r;
}

