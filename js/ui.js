"use strict";
/* Language Steps: ui.js. Icons, components, tab home screens (Learn, Practise, Listen, Travel), the render shell, start-up.
   Files load in the order listed in js/loader.js (APP_FILES); they share one global scope. */
/* ---------- UI foundation: icons, components, shell ---------- */
const ICONS={
 path:'<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>',
 practise:'<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
 listen:'<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-7h3z"/><path d="M3 19a2 2 0 0 0 2 2h1v-7H3z"/>',
 travel:'<path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 check:'<path d="M20 6L9 17l-5-5"/>', x:'<path d="M18 6L6 18"/><path d="M6 6l12 12"/>',
 back:'<path d="M15 6l-6 6 6 6"/>', chev:'<path d="M9 6l6 6-6 6"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 speaker:'<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>',
 play:'<path d="M7 4l13 8-13 8z"/>', pause:'<path d="M8 5v14"/><path d="M16 5v14"/>', stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>',
 prev:'<path d="M19 5l-9 7 9 7z"/><path d="M5 5v14"/>', next:'<path d="M5 5l9 7-9 7z"/><path d="M19 5v14"/>', rew:'<path d="M11 19l-9-7 9-7z"/><path d="M22 19l-9-7 9-7z"/>',
 loop:'<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
 star:'<path d="M12 3l2.7 5.6 6.2.9-4.5 4.3 1 6.2L12 17l-5.4 3 1-6.2L3.1 9.5l6.2-.9z"/>',
 book:'<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
 grammar:'<path d="M4 6h16"/><path d="M4 12h10"/><path d="M4 18h7"/>', video:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>',
 plus:'<path d="M12 5v14"/><path d="M5 12h14"/>', tv:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 21h8"/><path d="M12 18v3"/>',
 review:'<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>', chevd:'<path d="M6 9l6 6 6-6"/>',
};
function ico(n,size=22,extra=""){return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${ICONS[n]||""}</svg>`;}
const STATUS={ok:'<span class="st st-ok" aria-label="Done">'+'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg></span>',
 half:'<span class="st st-half" aria-label="In progress"></span>',todo:'<span class="st st-todo" aria-label="Not started"></span>',
 no:'<span class="st st-no" aria-label="Incorrect"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg></span>'};
const EMO_ICON={"🔊":"speaker","▶️":"play","▶":"play","⏸️":"pause","⏹️":"stop","⏮️":"prev","⏭️":"next","🔁":"loop","⭐":"star","⏪":"rew"};
const EMO_STATUS={"✅":"ok","🟡":"half","⭕":"todo","❌":"no"};
/* Removes emoji from visible text: meaningful ones become line icons or status marks, the rest are dropped. */
function deEmoji(html){
  return String(html).split(/(<[^>]*>)/).map(part=>{
    if(part.startsWith("<"))return part.replace(/(?:\p{Extended_Pictographic})\uFE0F?/gu,"").replace(/\uFE0F/g,"");
    return part.replace(/(🔊|▶️|⏸️|⏹️|⏮️|⏭️|🔁|⭐|⏪|✅|🟡|⭕|❌)/gu,m=>EMO_STATUS[m]?STATUS[EMO_STATUS[m]]:ico(EMO_ICON[m],18))
      .replace(/(?:\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}])\uFE0F?/gu,"").replace(/\uFE0F/g,"").replace(/^[ \t]+(?=\S)/,m=>m.length>1?" ":m).replace(/ {2,}/g," ");
  }).join("");
}
const TABS=[["learn","path","Learn"],["practise","practise","Practise"],["listen","listen","Listen"],["travel","travel","Travel"]];
const OLD_TAB={path:"learn",stories:"learn",trip:"travel",pod:"listen",watch:"listen",kanji:"practise",grammar:"practise",review:"practise",talk:"listen"};
function curTab(){let t=S.tab||"learn";if(OLD_TAB[t])t=OLD_TAB[t];if(!TABS.some(x=>x[0]===t))t="learn";return t;}
function secOf(){const m={home:curTab(),lesson:"learn",place:"learn",test:"learn",story:"learn",theme:"learn",gram:"practise",review:"practise",cards:"practise",vocab:"practise",kanji:"practise",klearn:"practise",kana:"practise",pod:"listen",player:"listen",video:"listen",trip:"travel",casual:"practise",settings:"learn",talk:"listen"};if(view.s==="lib")return LIB_SEC[view.sec]||curTab();return m[view.s]||"learn";}
function setTab(k){S.tab=k;libSec=null;save();view={s:"home"};render();window.scrollTo(0,0);}
function uiCard(inner,cls=""){return `<div class="card ${cls}">${inner}</div>`;}
function uiLabel(t){return `<span class="lbl">${esc(t)}</span>`;}
function uiBtn(t,fn,kind="pri",dis=false){return `<button class="btn ${kind} full" ${dis?"disabled":""} data-a="${A(fn)}">${t}</button>`;}
function uiSeg(opts,sel,fn){return `<div class="seg" role="tablist">${opts.map(([k,t])=>`<button role="tab" aria-selected="${k===sel}" data-a="${A(()=>fn(k))}">${t}</button>`).join("")}</div>`;}
function uiRow(lead,title,sub,fn,trail=""){return `<button class="lrow" data-a="${A(fn)}">${lead}<span class="lrt"><span class="lrh">${title}</span>${sub?`<span class="lrs">${sub}</span>`:""}</span>${trail}${ico("chev",20)}</button>`;}
function uiTileIcon(n){return `<span class="ti">${ico(n,24)}</span>`;}
function uiTileChar(c,big){return `<span class="tc${big?" big":""}" lang="${L[S.lang].hl}" aria-hidden="true">${esc(c)}</span>`;}
function uiBar(p){return `<div class="bar"><i style="width:${Math.max(0,Math.min(100,Math.round(p)))}%"></i></div>`;}
/* ---------- Tab home screens ---------- */
const LIB_SEC={themes:"learn",kanji:"practise",kana:"practise",grammar:"practise",watchadd:"listen",real:"travel",casual:"practise"};
function openSub(k){libSec=k;view={s:"lib",sec:k};render();window.scrollTo(0,0);}
function screenLib(){
  const l=S.lang,k=view.sec;
  const titles={themes:"All themes",kanji:"Kanji",kana:"Kana",grammar:"Grammar guide",watchadd:"Your videos",real:"Phrases to review",casual:"Casual speech"};
  const r={row:"title",title:titles[k]||"",prog:"",back:{label:"Back",fn:()=>{libSec=null;view={s:"home"};render();window.scrollTo(0,0);}},main:""};
  const fns={themes:homePath,kanji:(l,r)=>homeKanji(l,r,"kanji"),kana:(l,r)=>homeKanji(l,r,"kana"),grammar:homeGrammar,watchadd:homeWatch,real:homeReal,casual:homeCasual};
  (fns[k]||homePath)(l,r);r.main=genCard()+r.main;r.next=null;
  return r;
}
function screenHome(){
  const l=S.lang,tab=curTab();S.tab=tab;
  const r={tab,title:TABS.find(x=>x[0]===tab)[2],main:""};
  if(tab==="practise")homePractise(l,r);else if(tab==="listen")homeListen(l,r);else if(tab==="travel")homeTravel(l,r);else homeLearn(l,r);
  r.main=(noteText?uiCard(`<p style="margin:0"><strong>${esc(noteText)}</strong></p>`):"")+genCard()+r.main;
  return r;
}
/* Language drop-down in the top bar of the tab screens (replaces the full-width switch). */
const LANG_OPTS=[["ja","日本語","Japanese"],["zh","中文","Chinese"]];
function langMenuHTML(){
  const cur=LANG_OPTS.find(o=>o[0]===S.lang)||LANG_OPTS[0],open=!!view.langOpen;
  const btn=`<button class="langb" aria-haspopup="menu" aria-expanded="${open}" aria-label="Language: ${cur[2]}. Change language" data-a="${A(()=>{view.langOpen=!view.langOpen;render();})}"><span lang="${L[cur[0]].hl}">${cur[1]}</span>${ico("chevd",18)}</button>`;
  const menu=open?`<button class="langscrim" aria-label="Close language menu" data-a="${A(()=>{view.langOpen=false;render();})}"></button><div class="langmenu" role="menu">${LANG_OPTS.map(o=>`<button role="menuitemradio" aria-checked="${o[0]===S.lang}" data-a="${A(()=>{view.langOpen=false;if(o[0]!==S.lang)setLang(o[0]);else render();})}"><span lang="${L[o[0]].hl}">${o[1]}</span> ${o[2]}</button>`).join("")}</div>`:"";
  return {btn,menu};
}
/* Learn */
/* Mini preview inside the Learn hero card: up to 5 words of the lesson and one example sentence (or the first 2 story lines). */
function stepPreview(l,x){
  const t=CUR[l][x.i];if(!t)return "";
  const sentRow=s=>`<li><span class="pm"><span lang="${L[l].hl}">${esc(sentText(s))}</span>${s.english?`<br><span class="small muted">${esc(s.english)}</span>`:""}</span><button class="play" aria-label="Play audio" title="Play audio" data-a="${A(()=>say(spokenText(s),l))}">${PLAY}</button></li>`;
  if(x.kind==="story"){const c=chapter(l,x.i),ls=c&&c.lines?c.lines.slice(0,2):[];return ls.length?`<ul class="prevlist" aria-label="Story preview">${ls.map(sentRow).join("")}</ul>`:"";}
  const ws=(t.words||[]).slice(0,5),ss=(t.sents||[]).slice(0,2);
  const row=w=>`<li><span class="pw" lang="${L[l].hl}">${esc(w.w)}</span><span class="pm"><span class="small">${esc(l==="ja"&&w.k&&w.k!==w.w?w.k+" · "+w.r:w.r||"")}</span><br>${esc(w.m)}</span><button class="play" aria-label="Play audio" title="Play audio" data-a="${A(()=>say(w.w,l))}">${PLAY}</button></li>`;
  return `<ul class="prevlist" aria-label="Lesson preview">${ws.map(row).join("")}${ss.map(sentRow).join("")}</ul>${(t.words||[]).length>ws.length?`<p class="small muted" style="margin:0">and ${(t.words||[]).length-ws.length} more words in this lesson</p>`:""}`;
}
function homeLearn(l,r){
  const st=S[l];let h="";
  if(!st.placed){
    h+=uiCard(`${uiLabel("START HERE")}<h2>Placement quiz</h2><p>The quiz finds your starting point in ${L[l].name}. It asks for the meaning of one word at a time and stops after 3 incorrect answers in a row. Choose “I do not know” instead of guessing.</p>${uiBtn("Start placement quiz",startPlacement)}<button class="btn link" data-a="${A(()=>{st.placed=true;save();render();})}">Skip and start at Theme 1</button>`,"hero");
    r.main=h;return;
  }
  const ths=themes(l),lv=viewLevel(l),idx=ths.map((t,i)=>i).filter(i=>lvOfTheme(l,i)===lv);
  const words=idx.flatMap(i=>ths[i].words||[]),nL=words.filter(w=>isL(l,w)).length,lvx=LEVELS[l][lv-1]||["Level "+lv,""];
  h+=`<div class="lvline"><div class="lvtop">${lvPick(l,lv)}<span class="muted">${nL} of ${words.length} words</span></div>${uiBar(words.length?nL/words.length*100:0)}</div>`;
  if(!idx.length){h+=uiCard(`<h2>${esc(lvx[0])} is not built yet</h2><p style="margin:0">${esc(lvx[3]||"")}</p>`);r.main=h;return;}
  /* Three next items in the viewed level: the next theme to learn (the only primary button), the next story chapter not read, the next podcast episode not heard. */
  const due=planSteps(l,1)[0],read=st.chRead||[],pd=st.podDone||{};
  const lessonIdx=idx.find(i=>!(ths[i].words||[]).every(w=>isL(l,w))),storyIdx=idx.find(i=>chapter(l,i)&&!read.includes(i)),podIdx=idx.find(i=>chapter(l,i)&&!pd[i]);
  let path="";
  if(lessonIdx!==undefined){const t=ths[lessonIdx],todo=t.words.filter(w=>!isL(l,w));
    path+=uiCard(`<div class="nxt"><span class="pn big" lang="${L[l].hl}">${esc([...t.words[0].w][0])}</span><span class="lrt">${uiLabel("NEXT THEME")}<span class="nxh">${esc(t.title)}</span><span class="lrs">${esc(lessonDesc(todo.length))}</span></span></div>${stepPreview(l,{kind:"lesson",i:lessonIdx})}${uiBtn("Start lesson",()=>startLesson(todo,t.title))}`,"hero");
  }else path+=uiCard(`<h2>Level finished</h2><p style="margin:0">You learned every word in this level.</p>`);
  const rows=[];
  if(storyIdx!==undefined){const t=ths[storyIdx],c=chapter(l,storyIdx),open=(t.words||[]).every(w=>isL(l,w));
    rows.push(uiRow(uiTileIcon(open?"book":"lock"),`Next story: ${esc(c.title)}`,open?"Read and listen to the whole chapter, then answer 2 questions.":`Unlocks after Theme ${storyIdx+1}: ${esc(t.title)} is learned`,open?()=>openChapter(storyIdx):()=>openTheme(storyIdx)));}
  if(podIdx!==undefined){const t=ths[podIdx];
    rows.push(uiRow(uiTileIcon("listen"),`Next podcast: Episode ${podIdx+1}: ${esc(t.title)}`,"The new words, the story and 2 questions, like a radio show.",()=>openPod(podIdx)));}
  if(due&&(due.k==="review"||due.k==="cards")){const di=stepInfo(l,due);rows.push(uiRow(uiTileIcon("review"),esc(di.title),esc(di.desc),di.start));}
  if(rows.length)path+=uiCard(rows.join(""),"list");
  h+=`<div class="path">${path}</div><button class="btn link" data-a="${A(()=>openSub("themes"))}">All themes in this level</button>`;
  r.main=h;
}
/* Practise */
function kanjiDue(){const now=Date.now();return KJ().filter(k=>{const e=(S.ja.kanji||{})[k.c];return e&&e.d<=now;});}
function startMixed(any){
  const l=S.lang,ws=shuffle(dueList(l)).slice(0,8),ks=l==="ja"?shuffle(kanjiDue()).slice(0,4):[],sv=shuffle(savedDue(l)).slice(0,4);
  let qs=[];const types=["meaning","listen","type"];
  ws.forEach((w,i)=>qs.push(mkQ(types[i%3],w,l)));
  if(ks.length)qs=qs.concat(kanjiQuestions(ks).filter(q=>q.type!=="match"));
  sv.forEach(x=>{const q=mkQ("meaning",{w:x.w,r:x.r||x.w,m:x.m||""},l);q.vitem=x;qs.push(q);});
  if(!qs.length&&any){const lw=shuffle(allWords(l).filter(w=>isL(l,w))).slice(0,8);lw.forEach((w,i)=>qs.push(mkQ(types[i%3],w,l)));}
  if(!qs.length){note("You have no learned words yet. Start with a lesson in Learn.");return;}
  view={s:"review",qs,i:0,finished:false};render();window.scrollTo(0,0);
}
function startMistakes(){
  const l=S.lang,qs=[],bad=[];
  misList(l).slice(0,10).forEach(x=>{const q=misRebuild(x,l);if(q)qs.push(q);else bad.push(x.id);});
  bad.forEach(id=>misRemove(l,id));
  if(!qs.length){note("You have no mistakes to repeat.");return;}
  view={s:"review",qs,i:0,finished:false,mis:true};render();window.scrollTo(0,0);
}
function homePractise(l,r){
  const dw=dueList(l).length,dk=l==="ja"?kanjiDue().length:0,ds=savedDue(l).length,tot=dw+dk+ds;
  const parts=[dw?`${dw} words`:"",dk?`${dk} kanji`:"",ds?`${ds} saved words`:""].filter(Boolean).join(", ");
  let h=`<p class="hsub">${esc(L[l].name)}</p>`;
  h+=tot?uiCard(`${uiLabel("TODAY")}<div class="big"><span class="bign">${Math.min(tot,16)}</span><span class="bigt">items are due</span></div><p class="muted" style="margin:0">${esc(parts)}. One session, about ${Math.max(2,Math.round(Math.min(tot,16)*0.4))} minutes.</p>${uiBtn("Start practice",()=>startMixed(false))}`,"hero")
    :uiCard(`${uiLabel("TODAY")}<h2>Nothing is due now</h2><p class="muted" style="margin:0">${nextDue(l)?"The next review is due on "+fmtDate(nextDue(l))+".":"Words are added after each lesson."}</p>${uiBtn("Practise anyway",()=>startMixed(true),"sec")}`,"hero");
  const sv=savedList(l).length,kn=KJ(),kl=kn.filter(k=>kLearned(k.c)).length;
  const kanaN=l==="ja"?["hira","kata"].reduce((a,s)=>a+KANA[s].flatMap(x=>x[1]).filter(([c])=>kanaLearned(c)).length,0):0;
  const gd=(S[l].grDone||[]).length;
  let rows=uiRow(uiTileIcon("star"),"My words",`${sv} saved · ${ds} due`,openVocab);
  const mn=misList(l).length;rows+=uiRow(uiTileIcon("review"),"Mistakes",mn?`${mn} to repeat`:"None to repeat",startMistakes);
  if(l==="ja")rows+=uiRow(uiTileChar("私"),"Kanji",`${kl} of ${kn.length} learned`,()=>openSub("kanji"))+uiRow(uiTileChar("あ"),"Kana",`${kanaN} of 142 learned`,()=>openSub("kana"));
  rows+=uiRow(uiTileIcon("grammar"),"Grammar",`${gd} of ${GR[l].length} points`,()=>openSub("grammar"));
  if(casualList(l).length)rows+=uiRow(uiTileIcon("speaker"),"Casual speech",`${casualCount(l)} of ${casualList(l).length} lessons done`,()=>openSub("casual"));
  h+=uiCard(rows,"list");
  r.main=h;
}
/* Listen */
function homeListen(l,r){
  const f=view.lf||"all",lv=viewLevel(l),ths=themes(l),st=S[l];
  let h=`<div class="lvline"><div class="lvtop">${lvPick(l,lv)}</div></div>`+uiSeg([["all","All"],["stories","Stories"],["podcast","Podcast"],["video","Video"]],f,k=>{view.lf=k;render();});
  const last=st.lastListen;
  if(last){let title="",fn=null,ch="";
    if(last.kind==="story"&&chapter(l,last.i)){title="Story "+(last.i+1)+": "+chapter(l,last.i).title;fn=()=>openPlayer("story",last.i);ch=[...(ths[last.i].words[0].w)][0];}
    else if(last.kind==="pod"&&ths[last.i]){title="Episode "+(last.i+1)+": "+ths[last.i].title;fn=()=>openPlayer("pod",last.i);ch=[...(ths[last.i].words[0].w)][0];}
    else if(last.kind==="trip"&&TRIP[l][last.i]){title="Travel: "+TRIP[l][last.i].t;fn=()=>openPlayer("trip",last.i);ch="旅";}
    if(fn)h+=uiCard(`<div class="nxt">${uiTileChar(ch,true)}<span class="lrt">${uiLabel("CONTINUE")}<span class="nxh">${esc(title)}</span></span><button class="playbig" aria-label="Play" data-a="${A(fn)}">${ico("play",24)}</button></div>`,"hero");}
  const tiles=[];
  const lvIdx=ths.map((t,i)=>i).filter(i=>lvOfTheme(l,i)===lv);
  if(f==="all"||f==="stories")lvIdx.forEach(i=>{const t=ths[i],un=t.words.every(w=>isL(l,w));if(un&&chapter(l,i))tiles.push({k:"Story",ch:[...t.words[0].w][0],t:chapter(l,i).title,m:(st.chRead||[]).includes(i)?"Listened":`${chapter(l,i).lines.length} lines`,done:(st.chRead||[]).includes(i),fn:()=>openPlayer("story",i)});});
  if(f==="all"||f==="podcast")lvIdx.slice(0,f==="all"?4:99).forEach(i=>{const t=ths[i];tiles.push({k:"Podcast",ch:[...t.words[0].w][0],t:"Episode "+(i+1)+": "+t.title,m:(st.podDone||{})[i]?"Listened":"Words and story",done:!!(st.podDone||{})[i],fn:()=>openPod(i)});});
  if(f==="all"||f==="video"){(VIDS[l]||[]).filter(x=>x.id&&(!x.lvn||x.lvn<=lv)).forEach(x=>tiles.push({k:"Video",ico:"video",t:x.title,m:[x.len,x.ch].filter(Boolean).join(" · "),fn:()=>openVideo(x.id)}));
    (st.videos||[]).forEach(x=>tiles.push({k:"Video",ico:"video",t:x.title,m:x.watched?"Watched":"Your video",fn:()=>openVideo(x.id)}));}
  h+=`<div class="sechd"><h2>For ${esc((LEVELS[l][lv-1]||["Level "+lv])[0])}</h2></div>`;
  h+=tiles.length?`<div class="tgrid">${tiles.map(x=>`<button class="tile" data-a="${A(x.fn)}"><span class="tart" ${x.ch?`lang="${L[l].hl}"`:""}>${x.ch?esc(x.ch):ico(x.ico||"play",34)}<span class="tkind">${esc(x.k)}</span>${x.done?`<span class="tdone">${STATUS.ok}</span>`:""}</span><span class="tt">${esc(x.t)}</span><span class="tm">${esc(x.m||"")}</span></button>`).join("")}</div>`
    :uiCard(`<p style="margin:0" class="muted">${f==="stories"?"Story chapters unlock when you learn all words of their theme.":"Nothing here yet."}</p>`);
  if(f==="all"||f==="video")h+=uiCard(uiRow(uiTileIcon("plus"),"Add a video","Paste a YouTube link, then watch it here",()=>openSub("watchadd")),"list")+tvCard(l,lv);
  r.main=h;
}
/* Travel */
function homeTravel(l,r){
  let h="";
  const done=S[l].tripDone||{},list=TRIP[l],ni=list.findIndex((x,i)=>!done[i]);
  if(ni>=0){const d=list[ni];h+=uiCard(`${uiLabel("NEXT SITUATION")}<div class="nxt">${uiTileIcon("travel")}<span class="lrt"><span class="nxh">${esc(d.t)}</span><span class="lrs">${esc(d.intro)}</span></span></div>${uiBtn("Start",()=>openTrip(ni))}`,"hero");}
  else h+=uiCard(`<h2>All situations practised</h2><p class="muted" style="margin:0">Open any situation to practise it again.</p>`);
  h+=uiCard(list.map((d,i)=>uiRow(uiTileIcon("travel"),esc((i+1)+". "+d.t),esc(d.intro),()=>openTrip(i),done[i]?STATUS.ok:STATUS.todo)).join(""),"list");
  const rc=realCounts(l),nrev=realReview(l).length;
  h+=uiCard(`${uiLabel("REAL-SITUATION LOG")}<p style="margin:0 0 8px">${esc(realSummary(rc))}</p>`+uiRow(uiTileIcon("practise"),"Phrases to review",esc(nrev?nrev+(nrev===1?" phrase":" phrases")+" did not work yet":"No phrases to review"),()=>openSub("real")),"list");
  r.main=h;
}
/* Recommendations: one Next card plus up to 2 rows */
function recsHTML(l,ctx){
  const items=[],seen=new Set(),add=(t,fn)=>{if(items.length<3&&!seen.has(t)){seen.add(t);items.push({t,fn});}};
  const ths=themes(l),pd=S[l].podDone||{},read=S[l].chRead||[],ti=ctx.ti;
  const nx=planSteps(l,1)[0];if(nx){const c=stepInfo(l,nx);add(c.title,c.start);}
  const unlocked=n=>ths[n]&&ths[n].words&&ths[n].words.every(w=>isL(l,w));
  if(ti!=null&&ctx.k!=="story"&&unlocked(ti)&&!read.includes(ti))add(`Story: ${chapter(l,ti).title}`,()=>openChapter(ti));
  if(ti!=null&&ctx.k!=="pod"&&!pd[ti])add(`Podcast episode ${ti+1}: ${ths[ti].title}`,()=>openPod(ti));
  if(ctx.g!=null&&ctx.g>=0)add(`Grammar: ${GR[l][ctx.g][0]}`,()=>openGram(ctx.g));
  if(!items.length)return "";
  const [first,...rest]=items;
  return uiCard(`${uiLabel("NEXT")}<span class="nxh">${esc(first.t)}</span>${uiBtn("Continue with this",first.fn)}${rest.length?`<div class="list" style="margin-top:4px">${rest.map(x=>uiRow(uiTileIcon("chev"),esc(x.t),"",x.fn)).join("")}</div>`:""}`,"hero");
}
/* Shell */
function render(){if(typeof closeCallout==="function")closeCallout();
  acts={};A.n=0;
  document.body.dataset.lang=S.lang;document.body.dataset.sec=secOf();
  let r;const v=view.s;
  const map={place:screenPlace,lesson:screenLesson,review:screenReview,test:screenTest,theme:screenTheme,gram:screenGram,story:screenStory,talk:screenTalk,trip:screenTrip,casual:screenCasual,lib:screenLib,pod:screenPod,cards:screenCards,player:screenPlayer,vocab:screenVocab,video:screenVideo,kana:screenKana,kanji:screenKanjiCard,klearn:screenKanjiLearn,settings:screenSettings};
  r=(map[v]||screenHome)();
  const hd=document.getElementById("hd");
  if(r.tab){
    const lm=langMenuHTML();
    hd.innerHTML=`<div class="wrap hdrow"><h1 class="hdt">${esc(r.title)}</h1><span class="hdacts">${lm.btn}<button class="ibtn" aria-label="Profile and settings" data-a="${A(()=>{view={s:"settings"};render();window.scrollTo(0,0);})}">${ico("user")}</button></span></div>${lm.menu}<div id="prog" hidden></div>`;
  }else{
    const left=r.exit?`<button class="ibtn" aria-label="Exit" data-a="${A(()=>{view.confirm=true;render();window.scrollTo(0,0);})}">${ico("x")}</button>`:`<button class="ibtn" aria-label="Back" data-a="${A(r.back&&r.back.fn&&!r.back.dis?r.back.fn:goHome)}">${ico("back")}</button>`;
    hd.innerHTML=`<div class="wrap hdrow sm">${left}<div class="hdmid">${r.title?`<span class="hdt2">${esc(r.title)}</span>`:""}<div id="prog" class="prog">${r.prog||""}</div></div></div>`;
  }
  let pre="";
  if(view.confirm)pre=`<div class="confirm"><p><strong>Exit now?</strong> ${view.s==="review"?"Answers you already checked are saved. The rest of this session is not.":"Progress in this "+({place:"placement quiz",test:"test",story:"chapter",talk:"turn",trip:"practice"}[view.s]||"lesson")+" is not saved."}</p><div class="inline"><button class="btn pri" data-a="${A(()=>{if(view.s==="talk"||view.s==="trip"){view.mode="read";view.confirm=false;render();}else goHome();})}">Exit now</button><button class="btn sec" data-a="${A(()=>{view.confirm=false;render();})}">Stay</button></div></div>`;
  const main=document.getElementById("main");main.innerHTML=deEmoji(pre+r.main);
  hd.innerHTML=deEmoji(hd.innerHTML);
  document.getElementById("sheet").innerHTML=deEmoji(sheetHTML());
  const fbp=document.getElementById("fbp"),fb=main.querySelector(".fb");fbp.innerHTML="";document.body.classList.toggle("hasfb",!!fb);
  if(fb){fbp.appendChild(fb);}
  const bw=document.getElementById("bbarw"),tb=document.getElementById("tabs");
  if(r.tab){
    bw.hidden=true;tb.hidden=false;
    tb.innerHTML=`<div class="wrap tabrow">${TABS.map(([k,ic,t])=>`<button class="tabb" aria-current="${k===r.tab?"page":"false"}" data-a="${A(()=>setTab(k))}"><span class="tabi">${ico(ic,22)}</span>${t}</button>`).join("")}</div>`;
    document.getElementById("bbar").innerHTML="";
  }else{
    bw.hidden=false;tb.hidden=true;tb.innerHTML="";
    const b=r.back||{label:"Back",dis:true},n=r.next||{label:"Continue",dis:true};
    document.getElementById("bbar").innerHTML=deEmoji(`<button class="btn sec" ${b.dis||!b.fn?"disabled":""} data-a="${A(b.fn||(()=>{}))}">${esc(b.label)}</button><button id="nextbtn" class="btn pri${fb&&fb.classList.contains("ok")?" okbtn":""}" ${n.dis||!n.fn?"disabled":""} data-a="${A(n.fn||(()=>{}))}">${esc(n.label)}</button>`);
  }
  document.body.classList.toggle("istab",!!r.tab);
  if(view.scrollEnd){view.scrollEnd=false;setTimeout(()=>window.scrollTo(0,document.body.scrollHeight),0);}
}

render();
dbInit();
if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("sw.js").catch(()=>{});
