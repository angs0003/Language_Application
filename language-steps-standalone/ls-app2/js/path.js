"use strict";
/* Language Steps: path.js. Next-step planning (planSteps, stepInfo) and the old library screen data.
   Files load in the order listed in js/loader.js (APP_FILES); they share one global scope. */
/* ---------- Simple home: one next step ---------- */
let libSec=null;
function histPush(l,label){const h=S[l].hist||(S[l].hist=[]);h.push(label);if(h.length>10)h.shift();}
function planSteps(l,count){
  const learned=new Set(learnedWords(l)),read=new Set(S[l].chRead||[]),td=S[l].tripDone||{},tdone=new Set(Object.keys(td).filter(k=>td[k]).map(Number)),ths=themes(l),n=S.settings.size,out=[];let lst=S[l].lst||0;
  const due=dueList(l).length;if(due>=5)out.push({k:"review",due});
  const sd=savedDue(l).length;if(sd>=5)out.push({k:"cards",due:sd});
  let guard=0;
  while(out.length<count&&guard++<50){
    let ch=-1;for(let i=0;i<STORY[l].length;i++){if(!read.has(i)&&ths[i]&&ths[i].words&&ths[i].words.every(w=>learned.has(w.w))){ch=i;break;}}
    if(ch>=0){out.push({k:"story",n:ch});read.add(ch);continue;}
    const nextTrip=()=>{for(let i=0;i<TRIP[l].length;i++)if(!tdone.has(i))return i;return -1;};
    if(false&&lst>=2){const ti=nextTrip();if(ti>=0){out.push({k:"trip",i:ti});tdone.add(ti);lst=0;continue;}}
    const ws=[],titles=[];for(const t of ths){if(!t.words)continue;for(const w of t.words){if(ws.length>=n)break;if(!learned.has(w.w)){ws.push(w);if(!titles.includes(t.title))titles.push(t.title);}}if(ws.length>=n)break;}
    if(!ws.length)break;
    out.push({k:"lesson",words:ws,titles});ws.forEach(w=>learned.add(w.w));lst++;
  }
  return out;
}
function stepInfo(l,st){
  if(st.k==="cards")return{e:"⭐",title:`My words: ${st.due} due`,desc:"Flashcards of the words you saved.",start:startCards};
  if(st.k==="review")return{e:"🔁",title:`Review: ${st.due} words`,desc:"Practise the words that are due today.",start:startReview};
  if(st.k==="story"){const c=chapter(l,st.n);return{e:"📖",title:`Story chapter ${st.n+1}: ${c.title}`,desc:"Read and listen to the whole chapter, then answer 2 questions.",start:()=>openChapter(st.n)};}
  if(st.k==="trip"){const d=TRIP[l][st.i];return{e:"✈️",title:`Travel: ${d.t}`,desc:d.intro,start:()=>openTrip(st.i)};}
  return{e:"🆕",title:`Lesson: ${st.titles.join(" and ")}`,desc:`${st.words.length} new words, grammar, a story, a dialogue and a quiz.`,start:()=>startLesson(st.words,st.titles.join(" and "))};
}
const LIB=[["path","🧭","Themes and words"],["trip","✈️","Travel situations"],["grammar","🧩","Grammar guide"],["stories","📖","Stories"],["talk","💬","AI conversations"],["review","🔁","Review"],["settings","⚙️","Settings"]];
const isOpen=(k,d)=>view.open&&k in view.open?view.open[k]:d;
document.addEventListener("toggle",e=>{const t=e.target;if(t.dataset&&t.dataset.k){view.open=view.open||{};view.open[t.dataset.k]=t.open;}},true);

