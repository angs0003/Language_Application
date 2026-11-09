"use strict";
/* Language Steps: sections.js. Section data, home sections (themes, grammar guide, stories, talk), theme and grammar pages, story reader, travel situations.
   Files load in the order listed in js/loader.js (APP_FILES); they share one global scope. */
/* ---------- Sections: data ---------- */
const SECS=[["path","🧭","Path"],["trip","✈️","Travel"],["pod","🎧","Podcast"],["watch","📺","Watch"],["kanji","🈴","Kanji"],["grammar","🧩","Grammar"],["stories","📖","Stories"],["review","🔁","Review"]];
const SITS=[["👋","Introducing yourself"],["🍜","Ordering food"],["🎫","Buying a train ticket"],["🧭","Asking for directions"],["🛍️","Shopping for clothes"],["📞","A phone call with a friend"],["🏨","Checking in at a hotel"],["🩺","At the doctor"]];
const CHARS={
  zh:"Main character: 小文 (Xiǎo Wén), a young woman from another country who has just moved to Beijing to study Chinese. Other characters: 大明 (Dàmíng), her Chinese classmate and friend; 李老师 (Lǐ lǎoshī), her teacher; 王阿姨 (Wáng āyí), the owner of a small shop near her home.",
  ja:"Main character: ゆい (Yui), a young woman from another country who has just moved to Tokyo to study Japanese. Other characters: けん (Ken), her Japanese classmate and friend; 田中先生 (Tanaka sensei), her teacher; 山田さん (Yamada-san), the owner of a small café near her home."
};
const CHAR_EN={zh:"小文 (Xiǎo Wén) has just moved to Beijing to study Chinese. You follow her daily life with her friend 大明 (Dàmíng), her teacher 李老师 (Lǐ lǎoshī) and the shop owner 王阿姨 (Wáng āyí).",ja:"ゆい (Yui) has just moved to Tokyo to study Japanese. You follow her daily life with her friend けん (Ken), her teacher 田中先生 (Tanaka sensei) and the café owner 山田さん (Yamada-san)."};
const stEmoji=(c,t)=>t&&c>=t?"✅":c?"🟡":"⭕";
const learnedWords=l=>allWords(l).filter(w=>isL(l,w)).map(w=>w.w);
function mkGramQ(q,l,plain){
  const opts=q.options.map((o,i)=>({text:String(o&&typeof o==="object"?o.text:o),reading:String(o&&o.reading||""),english:String(o&&o.english||""),ok:i===q.answer}));const sh=shuffle(opts);
  return {type:"gram",plain:!!plain,lang:l,question:String(q.question||"Choose the correct answer."),opts:sh,ans:sh.findIndex(o=>o.ok),why:String(q.why||""),answered:false,correct:false,sel:null,input:"",explain:null,word:null};
}
const validQ=q=>q&&Array.isArray(q.options)&&q.options.length>=2&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length;
function cleanLines(arr){return (Array.isArray(arr)?arr:[]).map(x=>{const c=cleanSent(x);if(!c)return null;c.speaker=String(x.speaker||"A").toUpperCase().startsWith("B")?"B":"A";
  c.wrong=(Array.isArray(x.wrong)?x.wrong:[]).filter(w=>w&&w.text).map(w=>({text:String(w.text),reading:String(w.reading||""),english:String(w.english||"")})).slice(0,2);return c;}).filter(Boolean);}
function linesHTML(l,lines,hw,youB){return lines.map(x=>`<div class="line"><div class="sent"><div class="sbody"><p class="spk">${x.speaker==="B"?(youB?"Person B (you)":"Person B"):"Person A"}</p>${glossHTML(l,x.tokens,hw||[])}${S.settings.showEnglish&&x.english?`<p class="eng">${esc(x.english)}</p>`:""}</div><button class="play" data-a="${A(()=>sayLines([x],l))}" aria-label="Play audio" title="Play audio">${PLAY}</button></div></div>`).join("");}
function genCard(){if(view.gen==="loading")return `<div class="card"><p><strong>✨ ${esc(view.genText||("Creating 10 words for “"+view.genTitle+"” with AI. This usually takes 10 to 60 seconds."))}</strong></p></div>`;if(view.gen)return `<div class="card"><p><strong>${esc(view.gen)}</strong></p></div>`;return "";}

/* ---------- Home ---------- */
function secsHTML(tab){return `<div class="secs" role="tablist">${SECS.filter(([k])=>k!=="kanji"||S.lang==="ja").map(([k,e,t])=>`<button class="sec" role="tab" aria-selected="${tab===k}" data-a="${A(()=>{S.tab=k;save();view={s:"home"};render();window.scrollTo(0,0);if(k==="stories")pregen(S.lang);})}"><span class="e" aria-hidden="true">${e}</span>${t}</button>`).join("")}</div>`;}
/* The level chosen in the level selector. It is kept for the whole session and is shared by the Learn and Listen tabs (view.lvl is only used by tests). */
const LVSEL={};
function viewLevel(l){return view.lvl||LVSEL[l]||curLevel(l);}
function lvPick(l,lv){const x=LEVELS[l][lv-1]||["Level "+lv,""];return `<label for="lvl" class="lvsel"><span><strong>${esc(x[0])}</strong> · ${esc(x[1])}</span><select id="lvl">${LEVELS[l].map((y,i)=>`<option value="${i+1}" ${lv===i+1?"selected":""}>${esc(y[0])}: ${esc(y[1])}${y[2]?"":" (not built yet)"}</option>`).join("")}</select></label>`;}
function curLevel(l){const nw=nextWords(l,1).words[0];return nw?lvOfTheme(l,themeIdxOf(l,nw)):LEVELS[l].filter(x=>x[2]).length;}
function homePath(l,r){
  const ths=themes(l),lv=viewLevel(l);let h="";
  const idx=ths.map((t,i)=>i).filter(i=>lvOfTheme(l,i)===lv),words=idx.flatMap(i=>ths[i].words||[]),nL=words.filter(w=>isL(l,w)).length;
  h+=`<div class="card"><label class="small muted" for="lvl">Level</label><select id="lvl">${LEVELS[l].map((x,i)=>`<option value="${i+1}" ${lv===i+1?"selected":""}>${x[0]}: ${x[1]}${x[2]?"":" (not built yet)"}</option>`).join("")}</select>${idx.length?`<p style="margin:8px 0 0">Words learned in this level: ${nL} of ${words.length}</p><div class="bar"><i style="width:${words.length?Math.round(nL/words.length*100):0}%"></i></div>`:""}</div>`;
  if(!idx.length){const x=LEVELS[l][lv-1];h+=`<div class="card"><h2>⭕ ${x[0]}: ${x[1]}</h2><p>This level is not built yet.</p><p>${esc(x[3])}</p><p class="small muted" style="margin:0">It will include the same parts as Level 1: themes with lessons, grammar points, story chapters and podcast episodes.</p></div>`;r.main=h;return;}
  h+=`<div class="card"><h2>Themes</h2><p class="small muted">Tap a theme to see its words, everyday phrases, usage notes, grammar and a short conversation.</p><ul class="units">${idx.map(i=>{const t=ths[i];
    const tot=t.words.length,c=t.words.filter(w=>isL(l,w)).length;
    const e=stEmoji(c,tot),status=c>=tot?"Learned":c?`${c} of ${tot} learned`:"Not started";
    return `<li><button class="rowbtn" data-a="${A(()=>openTheme(i))}"><span><span aria-hidden="true">${e}</span> Theme ${i+1}: ${esc(t.title)}<br><span class="status">${status}</span></span><span class="chev" aria-hidden="true">›</span></button></li>`;}).join("")}</ul></div>`;
  r.main=h;
}
function homeGrammar(l,r){
  const gi=S[l].gi,gd=S[l].grDone||[],nw=nextWords(l,1).words[0],ng=nw?grFor(l,themeIdxOf(l,nw)):-1;
  r.main=`<details class="card tint acc" data-k="in-gram" ${isOpen("in-gram",false)?"open":""}><summary>🧩 Grammar guide (about)</summary><p style="margin:0">Each lesson teaches the next grammar point. You can open any point at any time.</p></details><div class="card"><ul class="units">${GR[l].map((g,i)=>{
    const dn=gd.includes(i)||(i<10&&i<gi),e=dn?"✅":i===ng?"🟡":"⭕",st=dn?"Learned in a lesson":i===ng?"Next in your lessons":"Not started";const lvh=GR_START[l].indexOf(i);
    return `${lvh>=0?`<li class="lvh"><span><strong>Level ${lvh+1}</strong></span></li>`:""}<li><button class="rowbtn" data-a="${A(()=>openGram(i))}"><span><span aria-hidden="true">${e}</span> ${i+1}. ${esc(g[0])}<br><span class="status">${st}</span></span><span class="chev" aria-hidden="true">›</span></button></li>`;}).join("")}</ul></div>`;
  const nx=ng>=0?ng:0;r.next={label:"Open grammar point "+(nx+1),fn:()=>openGram(nx)};
}
function homeStories(l,r){
  const read=S[l].chRead||[],ths=themes(l);let rows="",nextFn=null,nextLabel="";
  STORY[l].forEach((c,n)=>{if(LV_START[l].includes(n))rows+=`<li class="lvh"><span><strong>Level ${LV_START[l].indexOf(n)+1}</strong></span></li>`;const t=ths[n],un=!!(t&&t.words&&t.words.every(w=>isL(l,w))),isR=read.includes(n);
    if(un){rows+=`<li><button class="rowbtn" data-a="${A(()=>openChapter(n))}"><span><span aria-hidden="true">${isR?"✅":"📖"}</span> Chapter ${n+1}: ${esc(c.t)}<br><span class="status">${isR?"Read":"Ready to read"}</span></span><span class="chev" aria-hidden="true">›</span></button></li>`;if(!isR&&!nextFn){nextFn=()=>openChapter(n);nextLabel="Read chapter "+(n+1);}}
    else rows+=`<li><span><span aria-hidden="true">⭕</span> Chapter ${n+1}: ${esc(c.t)}<br><span class="status">Unlocks when Theme ${n+1}: ${esc(t?t.title:"")} is learned</span></span></li>`;});
  r.main=`<details class="card tint acc" data-k="in-story" ${isOpen("in-story",false)?"open":""}><summary>📖 Your story (about)</summary><p style="margin:0">${esc(CHAR_EN[l])} There are ${STORY[l].length} chapters. Each chapter matches one theme and unlocks when you learn all words in that theme. Chapters are built into the app, so they open instantly.</p></details><div class="card"><ul class="units">${rows}</ul></div>`;
  r.next=nextFn?{label:nextLabel,fn:nextFn}:{label:"Learn a theme to unlock a chapter",dis:true};
}
function homeTalk(l,r){
  const done=S[l].talkDone||{};let first=-1;
  r.main=`<details class="card tint acc" data-k="in-talk" ${isOpen("in-talk",false)?"open":""}><summary>💬 Everyday conversations (about)</summary><p style="margin:0">Each situation has a conversation with audio, key phrases, and “Your turn”: you choose what Person B says.</p></details><div class="card"><ul class="units">${SITS.map(([e,t],i)=>{
    const has=!!C[`${l}.tk.${i}`],d=!!done[i];if(!d&&first<0)first=i;
    return `<li><button class="rowbtn" data-a="${A(()=>openTalk(i))}"><span><span aria-hidden="true">${d?"✅":has?"🟡":"⭕"}</span> ${e} ${esc(t)}<br><span class="status">${d?"Your turn completed":has?"Opened":"Not opened"}</span></span><span class="chev" aria-hidden="true">›</span></button></li>`;}).join("")}</ul></div>`;
  r.next=first>=0?{label:"Open: "+SITS[first][1],fn:()=>openTalk(first)}:{label:"All situations completed",dis:true};
}
function homeReview(l,r){
  const due=dueList(l).length,nd=nextDue(l),n=learnedWords(l).length;
  r.main=`<div class="card tint"><h2>🔁 Review</h2><p>Words due now: ${due}</p><p class="small muted">${due?"A review has up to 10 questions. Each answer is saved when you check it.":nd?"The next review is due on "+fmtDate(nd)+".":"Words are added to review after each lesson."}</p><p class="small muted" style="margin:0">Words learned in ${L[l].name}: ${n}</p></div>`;
  r.main+=myWordsCard(l);
  r.next={label:"Start review",fn:startReview,dis:!due};
}

/* ---------- Theme page ---------- */
function openTheme(i){view={s:"theme",ti:i,state:""};render();window.scrollTo(0,0);const l=S.lang;if(!AI_OFF&&themes(l)[i].words&&!C[`${l}.tg.${i}`])loadGuide(view);}
async function loadGuide(v){
  const l=S.lang,t=themes(l)[v.ti];v.state="loading";if(view===v)render();
  if(!(await hasAI())){v.state="AI is not available in this view. The theme guide needs AI.";if(view===v)render();return;}
  const prompt=`You write a short study guide for one theme for a beginner learner of ${L[l].full}. The learner cannot read the characters yet and relies on ${L[l].rd}.
Theme: ${t.title}.
Theme words: ${t.words.map(w=>`${w.w} (${w.r}) = ${w.m}`).join("; ")}.
Write:
1. "notes": 3 short literal notes in English about how and when people use these words in everyday life, for example politeness, which word is common in speech, or typical situations. Each note is 1 or 2 sentences.
2. "phrases": 5 useful everyday phrases or short sentences for this theme, at beginner level.
3. "dialogue": a short conversation of 6 lines between Person A and Person B that uses the theme words.
${TOKRULES(l)}
Language rules: literal, no idioms, no metaphors, no sarcasm.
Reply with only JSON in this shape:
{"notes":["note"],"phrases":[{"tokens":[["word","reading","meaning"]],"english":"literal English translation"}],"dialogue":{"situation":"one English sentence that says where the people are and who they are","lines":[{"speaker":"A","tokens":[["word","reading","meaning"]],"english":"literal English translation"}]}}`;
  try{
    const d=await aiJSON(prompt,{cache:false});
    const g={notes:(Array.isArray(d.notes)?d.notes:[]).map(String).slice(0,4),phrases:(Array.isArray(d.phrases)?d.phrases:[]).map(cleanSent).filter(Boolean).slice(0,6),dialogue:{situation:String(d.dialogue&&d.dialogue.situation||""),lines:cleanLines(d.dialogue&&d.dialogue.lines).slice(0,10)}};
    if(!g.notes.length&&!g.phrases.length)throw{code:"invalid_json"};
    cset(`${l}.tg.${v.ti}`,g);v.state="";
  }catch(e){v.state=aiErr(e);}
  if(view===v)render();
}
function screenTheme(){
  const v=view,l=S.lang,t=themes(l)[v.ti],g=C[`${l}.tg.${v.ti}`];
  const tot=t.words?t.words.length:10,c=t.words?t.words.filter(w=>isL(l,w)).length:0;
  const r={row:"title",title:`Theme ${v.ti+1}: ${t.title}`,prog:`<div class="ptext">${t.words?stEmoji(c,tot):"✨"} ${t.words?c+" of "+tot+" words learned":"Words not created yet"}</div>`,back:{label:"Back",fn:goHome},main:""};
  let h="";
  if(!t.words){
    h=`<div class="card"><p>✨ This theme’s 10 words are created by AI the first time. Chinese words come from HSK 1. Japanese words come from JLPT N5.</p>${v.state&&v.state!=="gen"?`<p><strong>${esc(v.state)}</strong></p>`:v.state==="gen"?"<p><strong>Creating the words. This usually takes 10 to 60 seconds.</strong></p>":""}</div>`;
    r.next={label:"Create words",dis:v.state==="gen",fn:async()=>{v.state="gen";render();const err=await genTheme(l,t.gi);v.state=err||"";if(view===v){render();if(!err)loadGuide(v);}}};
    r.main=h;return r;
  }
  h+=`<div class="card"><h2>🔤 Words</h2><p class="small muted">Tap a word to open its reference card.</p><ul class="units">${t.words.map(w=>`<li><button class="rowbtn" data-a="${A(()=>openWord(l,[w.w,w.r,w.m]))}"><span><span aria-hidden="true">${isL(l,w)?"✅":"⭕"}</span> <span class="cjk2" lang="${L[l].hl}">${esc(w.w)}</span>${l==="ja"&&w.k&&w.k!==w.w?` <span lang="ja">${esc(w.k)}</span>`:""} <span class="muted">${esc(w.r)}</span><br><span class="status">${esc(w.m)}</span></span></button><button class="play" aria-label="Play ${esc(w.r)}" data-a="${A(()=>say(w.w,l))}">${PLAY}</button></li>`).join("")}</ul></div>`;
  const ps=(CUR[l][v.ti]||{}).sents||[];
  if(ps.length)h+=`<div class="card"><h2>Sentences</h2><p class="small muted">${ps.length} practice sentences that use this theme’s words.</p><p><button class="play" data-a="${A(()=>sayLines(ps,l))}">${PLAY}Play all sentences</button></p>${ps.map(x=>`<div class="line">${sentHTML(l,x,t.words)}</div>`).join("")}</div>`;
  if(g){
    if(g.notes.length)h+=`<details class="card acc" data-k="notes" ${isOpen("notes",false)?"open":""}><summary>📝 How people use these words</summary>${g.notes.map(n=>`<p>${esc(n)}</p>`).join("")}</details>`;
    if(g.phrases.length)h+=`<details class="card acc" data-k="phr" ${isOpen("phr",false)?"open":""}><summary>💬 Everyday phrases</summary>${g.phrases.map(s=>`<div class="line">${sentHTML(l,s,t.words)}</div>`).join("")}</details>`;
  }else if(!AI_OFF)h+=`<div class="card"><p class="small"><strong>${v.state==="loading"?"✨ Writing usage notes, everyday phrases and a conversation. This usually takes 20 to 60 seconds.":esc(v.state)}</strong></p>${v.state&&v.state!=="loading"&&v.state.indexOf("not available")<0?`<button class="btn sec full" data-a="${A(()=>loadGuide(v))}">Try again</button>`:""}</div>`;
  const gp=GR[l][grFor(l,v.ti)];
  h+=`<details class="card acc" data-k="gr" ${isOpen("gr",false)?"open":""}><summary>🧩 Grammar for this theme</summary><p class="pattern" lang="${L[l].hl}">${esc(gp[1])}</p><p>${esc(gp[0])}</p><button class="btn sec full" data-a="${A(()=>openGram(grFor(l,v.ti)))}">Open this grammar point</button></details>`;
  if(g&&g.dialogue.lines.length)h+=`<details class="card acc" data-k="conv" ${isOpen("conv",false)?"open":""}><summary>🗣️ Short conversation</summary>${g.dialogue.situation?`<p class="small">${esc(g.dialogue.situation)}</p>`:""}<p><button class="play" data-a="${A(()=>sayLines(g.dialogue.lines,l))}">${PLAY}Play whole conversation</button></p>${linesHTML(l,g.dialogue.lines,t.words)}</details>`;
  r.main=h;
  r.next=c>=tot?{label:"Repeat lesson",fn:()=>startLesson(t.words,t.title,true)}:{label:"Test out of this theme",fn:()=>startTest(v.ti)};
  return r;
}

/* ---------- Grammar page ---------- */
function openGram(i){view={s:"gram",gi:i,mode:"read",state:""};render();window.scrollTo(0,0);if(!AI_OFF&&!C[`${S.lang}.gx.${i}`])loadGx(view);}
async function loadGx(v){
  const l=S.lang,g=GR[l][v.gi];v.state="loading";if(view===v)render();
  if(!(await hasAI())){v.state="AI is not available in this view. Only the built-in example is shown.";if(view===v)render();return;}
  const prompt=`You create grammar study material for a beginner learner of ${L[l].full}. The learner cannot read the characters yet and relies on ${L[l].rd}.
Grammar point: ${g[0]}. Pattern: ${g[1]}. Explanation: ${g[2]}
Words the learner knows (use these where possible): ${learnedWords(l).slice(-100).join(", ")||"none"}.
Write:
1. 4 short everyday example sentences that show the grammar point.
2. 3 multiple-choice questions that test the grammar point. Each question has 3 sentence options. Exactly one option is correct. The wrong options are wrong only because of the grammar point.
3. 1 literal sentence in English about the most common mistake learners make with this grammar point.
${TOKRULES(l)}
Language rules: literal, no idioms, no metaphors, no sarcasm.
Reply with only JSON in this shape:
{"mistake":"one sentence","examples":[{"tokens":[["word","reading","meaning"]],"english":"literal English translation"}],"quiz":[{"question":"instruction in English","options":[{"text":"sentence","reading":"reading of the sentence"}],"answer":0,"why":"one literal sentence that explains why the answer is correct"}]}`;
  try{
    const d=await aiJSON(prompt,{cache:false});
    const x={mistake:String(d.mistake||""),examples:(Array.isArray(d.examples)?d.examples:[]).map(cleanSent).filter(Boolean).slice(0,4),quiz:(Array.isArray(d.quiz)?d.quiz:[]).filter(validQ).slice(0,3)};
    if(!x.examples.length)throw{code:"invalid_json"};
    cset(`${l}.gx.${v.gi}`,x);v.state="";
  }catch(e){v.state=aiErr(e);}
  if(view===v)render();
}
function screenGram(){
  const v=view,l=S.lang,g=GR[l][v.gi],x=C[`${l}.gx.${v.gi}`];
  const r={row:"title",title:`🧩 Grammar ${v.gi+1}: ${g[0]}`,prog:"",back:{label:"Back",fn:goHome},main:""};
  if(v.mode==="practice"){
    if(v.k>=v.qs.length){const c=v.qs.filter(q=>q.correct).length;
      r.prog=`<div class="ptext">Practice finished</div>`;
      r.main=`<div class="card tint"><h2>${c===v.qs.length?"✅":"🟡"} Practice finished</h2><p>Correct: ${c} of ${v.qs.length}</p></div>`;
      r.back={label:"Back",dis:true};r.next={label:"Back to grammar point",fn:()=>{v.mode="read";render();window.scrollTo(0,0);}};return r;}
    const q=v.qs[v.k];view.q=q;
    r.prog=`<div class="ptext">Practice: question ${v.k+1} of ${v.qs.length}</div>`;
    r.main=`<div class="card">${qHTML(q,{noAI:true})}</div>`;r.back={label:"Back",fn:()=>{if(v.k>0)v.k--;else v.mode="read";render();window.scrollTo(0,0);}};
    r.next=!q.answered?{label:"Check answer",fn:()=>{checkQ(q);render();},dis:!canCheck(q)}:{label:"Continue",fn:()=>{v.k++;render();window.scrollTo(0,0);}};
    return r;
  }
  let h=`<div class="card"><p class="pattern" lang="${L[l].hl}">${esc(g[1])}</p><p>${esc(g[2])}</p>${x&&x.mistake?`<p><strong>Common mistake:</strong> ${esc(x.mistake)}</p>`:""}<p class="q">Example</p>${sentHTML(l,{tokens:g[3],english:g[4]},[])}</div>`;
  if(x)h+=`<div class="card"><h2>More examples</h2>${x.examples.map(s=>`<div class="line">${sentHTML(l,s,[])}</div>`).join("")}</div>`;
  else if(!AI_OFF)h+=`<div class="card"><p class="small"><strong>${v.state==="loading"?"✨ Writing 4 more examples and 3 practice questions. This usually takes 10 to 40 seconds.":esc(v.state)}</strong></p>${v.state&&v.state!=="loading"&&v.state.indexOf("not available")<0?`<button class="btn sec full" data-a="${A(()=>loadGx(v))}">Try again</button>`:""}</div>`;
  r.main=h;
  r.next=AI_OFF&&!(x&&x.quiz.length)?{label:"Go to home",fn:goHome}:{label:x&&x.quiz.length?`Practice: ${x.quiz.length} questions`:"Practice",dis:!(x&&x.quiz.length),fn:()=>{v.mode="practice";v.k=0;v.qs=x.quiz.map(q=>mkGramQ(q,l,false));render();window.scrollTo(0,0);}};
  return r;
}

/* ---------- Stories ---------- */
let pregenBusy=false,pregenN=-1,pregenL="",pregenP=null;
async function pregen(l){return;
  // eslint-disable-next-line no-unreachable -- pre-generation is switched off while AI_OFF is true
  if(pregenBusy)return;const unlocked=Math.min(1+(S[l].lc||0),40);let n=-1;
  for(let k=0;k<unlocked;k++){if(!C[`${l}.ch.${k}`]){n=k;break;}}
  if(n<0||!(await hasAI()))return;
  pregenBusy=true;pregenN=n;pregenL=l;if(view.s==="home"&&S.tab==="stories")render();
  pregenP=genChapter(l,n);await pregenP;pregenBusy=false;pregenN=-1;
  if(view.s==="home"&&S.tab==="stories")render();
}
async function writeChapter(n){
  const l=S.lang;view={s:"home",gen:"loading",genText:`Writing chapter ${n+1} of your story with AI. This usually takes 20 to 60 seconds.`};render();
  let err;
  if(pregenBusy&&pregenN===n&&pregenL===l){await pregenP;err=C[`${l}.ch.${n}`]?"":"The chapter could not be written. Tap the chapter to try again.";}
  else err=await genChapter(l,n);
  if(err){view.gen=err;render();}else openChapter(n);
}
async function genChapter(l,n){
  if(!(await hasAI()))return "AI is not available in this view. Story chapters need AI.";
  const prev=[];for(let k=0;k<n;k++){const c=C[`${l}.ch.${k}`];if(c)prev.push(`Chapter ${k+1}: ${c.summary}`);}
  const gi=Math.max(1,Math.min(S[l].gi,GR[l].length));
  const prompt=`You write chapter ${n+1} of a continuing graded reader for a beginner learner of ${L[l].full}. The learner cannot read the characters yet and relies on ${L[l].rd}.
Characters: ${CHARS[l]}
Previous chapters: ${prev.join(" ")||"none. This is chapter 1: introduce the main character."}
Words the learner knows: ${learnedWords(l).slice(-150).join(", ")||"very few"}.
Grammar the learner knows: ${GR[l].slice(0,gi).map(g=>g[1]).join("; ")}.
Write 8 to 10 short sentences that continue the story with one concrete everyday event. Use mostly the known words. Use at most 3 new words. Literal language only: no idioms, no metaphors, no sarcasm, no implied meaning.
Write 3 comprehension questions in English about the meaning of the story. Each question has 3 English answer options. Exactly one option is correct. "after" is the 0-based index of the line after which the question appears; the answer must be in the lines up to and including that index.
${TOKRULES(l)}
Reply with only JSON in this shape:
{"title":"English title, 2 to 5 words","summary":"one English sentence that summarises this chapter","lines":[{"tokens":[["word","reading","meaning"]],"english":"literal English translation"}],"questions":[{"after":2,"question":"question in English","options":["option","option","option"],"answer":0,"why":"one literal sentence that explains the answer"}]}`;
  try{
    const d=await aiJSON(prompt,{cache:false});
    const lines=(Array.isArray(d.lines)?d.lines:[]).map(cleanSent).filter(Boolean).slice(0,12);
    if(lines.length<3)throw{code:"invalid_json"};
    const qs=(Array.isArray(d.questions)?d.questions:[]).filter(q=>validQ(q)&&Number.isInteger(q.after)&&q.after>=0&&q.after<lines.length).slice(0,4).map(q=>({after:q.after,question:String(q.question),options:q.options.map(String),answer:q.answer,why:String(q.why||"")}));
    cset(`${l}.ch.${n}`,{title:String(d.title||"Chapter "+(n+1)),summary:String(d.summary||""),lines,qs});return "";
  }catch(e){return aiErr(e);}
}
let playTok=0;
function markLine(i){document.querySelectorAll(".line.now").forEach(e=>e.classList.remove("now"));if(i<0)return;const el=document.querySelector(`[data-line="${i}"]`);if(el){el.classList.add("now");if(el.scrollIntoView)el.scrollIntoView({block:"center"});}}
function stopAudio(){playTok++;try{speechSynthesis.cancel();}catch(e){}markLine(-1);hlClear();}
function playStory(lines,l,start){
  if(!("speechSynthesis" in window)){note("This browser cannot play speech audio.");return;}
  speechSynthesis.cancel();const tok=++playTok,vs=voicesFor(l),map=spkMap(lines);
  lines.slice(start).forEach((x,j)=>{const i=start+j,u=new SpeechSynthesisUtterance(spokenText(x));u.lang=L[l].code;applySpeaker(u,vs,spkIdx(map,x));u.rate=0.9*S.settings.speed;
    hlTrack(u,x.tokens,()=>document.querySelector(`[data-line="${i}"]`),()=>tok===playTok,spkSkip(x));const st=u.onstart;
    u.onstart=()=>{if(st)st();if(tok===playTok)markLine(i);};if(i===lines.length-1)u.onend=()=>{if(tok===playTok){markLine(-1);hlClear();}};speechSynthesis.speak(u);});
}
function openChapter(n){
  const l=S.lang,ch=chapter(l,n);if(!ch)return;
  view={s:"story",n,phase:"read",qs:(ch.qs||[]).map(q=>mkGramQ(q,l,true)),k:0};render();window.scrollTo(0,0);
}
function screenStory(){
  const v=view,l=S.lang,ch=chapter(l,v.n);
  const r={row:"title",title:`📖 Chapter ${v.n+1}: ${ch.title}`,back:{label:"Back",fn:()=>{stopAudio();goHome();}},main:""};
  if(v.phase==="read"){
    r.prog=`<div class="ptext">Step 1 of 2: Read and listen</div><div class="psub">${ch.lines.length} lines. ${v.qs.length?v.qs.length+" questions after reading.":"No questions."}</div>`;
    r.main=`<div class="card"><button class="btn pri full" style="margin-bottom:10px" data-a="${A(()=>openPlayer("story",v.n))}">🎬 Play as a video, one line at a time</button><div class="inline" style="margin-bottom:8px"><button class="play" data-a="${A(()=>playStory(ch.lines,l,0))}">${PLAY}Play whole chapter</button><button class="play" data-a="${A(stopAudio)}">⏹️ Stop</button></div>${speedHTML()}<div style="margin-top:6px">${subChips()}</div><p class="small muted">The line being played is highlighted. 🔊 plays one line. ▶️ plays from that line to the end. 🔁 repeats one line until you tap ⏹️ Stop.</p>${ch.lines.map((x,i)=>`<div class="line" data-line="${i}"><div class="sent"><div class="sbody"><p class="spk">Line ${i+1}</p>${storySentHTML(l,x)}</div><div class="stack2"><button class="play" aria-label="Loop this line" title="Loop this line" data-a="${A(()=>playLoop(x,l,i))}">🔁</button><button class="play" aria-label="Play this line" title="Play this line" data-a="${A(()=>playStory([x],l,0))}">${PLAY}</button><button class="play" aria-label="Play from this line" title="Play from this line" data-a="${A(()=>playStory(ch.lines,l,i))}">▶️</button></div></div></div>`).join("")}</div>`;
    r.next=v.qs.length?{label:`Answer ${v.qs.length} questions`,fn:()=>{stopAudio();v.phase="q";v.k=0;render();window.scrollTo(0,0);}}:{label:"Finish chapter",fn:()=>{stopAudio();v.phase="done";render();window.scrollTo(0,0);}};
    return r;
  }
  if(v.phase==="q"&&v.k<v.qs.length){
    const q=v.qs[v.k];view.q=q;
    r.prog=`<div class="ptext">Step 2 of 2: Question ${v.k+1} of ${v.qs.length}</div><div class="bar"><i style="width:${Math.round(v.k/v.qs.length*100)}%"></i></div>`;
    r.main=`<div class="card">${qHTML(q,{noAI:true})}</div>`;
    r.back={label:v.k>0?"Back":"Chapter",fn:()=>{if(v.k>0)v.k--;else v.phase="read";render();window.scrollTo(0,0);}};
    r.next=!q.answered?{label:"Check answer",fn:()=>{checkQ(q);render();},dis:!canCheck(q)}:{label:"Continue",fn:()=>{v.k++;if(v.k>=v.qs.length)v.phase="done";render();window.scrollTo(0,0);}};
    return r;
  }
  const c=v.qs.filter(q=>q.correct).length;
  r.prog=`<div class="ptext">Chapter finished</div>`;r.back={label:"Back",dis:true};
  r.main=`<div class="card tint"><h2>✅ Chapter ${v.n+1} finished</h2><p>${esc(ch.title)}</p>${v.qs.length?`<p>Comprehension questions: ${c} of ${v.qs.length} correct</p>`:""}<p class="small muted">The next chapter unlocks when you learn all words in the next theme.</p></div>`;
  {const rd=S[l].chRead||(S[l].chRead=[]);if(!rd.includes(v.n)){rd.push(v.n);histPush(l,"📖 Chapter "+(v.n+1));save();}}
  r.main+=recsHTML(l,{k:"story",ti:v.n});
  r.next={label:"Go to home",fn:goHome};
  return r;
}

/* ---------- Conversations ---------- */
function openTalk(i){view={s:"talk",ci:i,mode:"read",state:""};render();window.scrollTo(0,0);if(!C[`${S.lang}.tk.${i}`])loadTalk(view);}
async function loadTalk(v){
  const l=S.lang;v.state="loading";if(view===v)render();
  if(!(await hasAI())){v.state="AI is not available in this view. Conversations need AI.";if(view===v)render();return;}
  const prompt=`Write a beginner-level everyday conversation in ${L[l].full} for this situation: ${SITS[v.ci][1]}.
The learner cannot read the characters yet and relies on ${L[l].rd}. Person B is the learner. Person A is the other person, for example the waiter, the clerk or a friend.
Words the learner knows (use them where possible): ${learnedWords(l).slice(-120).join(", ")||"very few"}.
Write 8 to 10 lines. The lines alternate between A and B, starting with A. Use short, common, polite everyday sentences that people really say in this situation.
For every line of Person B, also write 2 wrong replies: correct sentences that do not fit the conversation at that point.
Also write 5 key phrases for this situation.
${TOKRULES(l)}
Language rules: literal, no idioms, no metaphors, no sarcasm.
Reply with only JSON in this shape:
{"situation":"one English sentence that says where the people are and who they are","lines":[{"speaker":"A","tokens":[["word","reading","meaning"]],"english":"literal English translation"},{"speaker":"B","tokens":[["word","reading","meaning"]],"english":"literal English translation","wrong":[{"text":"sentence","reading":"reading of the sentence","english":"literal English translation"}]}],"phrases":[{"tokens":[["word","reading","meaning"]],"english":"literal English translation"}]}`;
  try{
    const d=await aiJSON(prompt,{cache:false});
    const lines=cleanLines(d.lines).slice(0,12);if(lines.length<4)throw{code:"invalid_json"};
    cset(`${l}.tk.${v.ci}`,{situation:String(d.situation||""),lines,phrases:(Array.isArray(d.phrases)?d.phrases:[]).map(cleanSent).filter(Boolean).slice(0,6)});v.state="";
  }catch(e){v.state=aiErr(e);}
  if(view===v)render();
}
function screenTalk(){
  const v=view,l=S.lang,x=C[`${l}.tk.${v.ci}`],[em,title]=SITS[v.ci];
  const r={row:"title",title:`💬 ${title}`,prog:"",back:{label:"Back",fn:goHome},main:""};
  if(!x){r.main=`<div class="card"><p class="small"><strong>${v.state==="loading"?"✨ Writing the conversation. This usually takes 20 to 60 seconds.":esc(v.state)}</strong></p>${v.state&&v.state!=="loading"&&v.state.indexOf("not available")<0?`<button class="btn sec full" data-a="${A(()=>loadTalk(v))}">Try again</button>`:""}</div>`;r.next={label:"Start your turn",dis:true};return r;}
  const turns=x.lines.map((ln,i)=>({ln,i})).filter(o=>o.ln.speaker==="B"&&o.ln.wrong.length);
  if(v.mode==="turn"){
    r.back={label:"Back",dis:true};r.exit=true;
    if(v.k>=v.qs.length){const c=v.qs.filter(q=>q.correct).length;r.exit=false;
      r.prog=`<div class="ptext">Your turn finished</div>`;
      r.main=`<div class="card tint"><h2>✅ Conversation completed</h2><p>Correct replies: ${c} of ${v.qs.length}</p></div>`;
      r.next={label:"Save and go back",fn:()=>{const d=S[l].talkDone||(S[l].talkDone={});d[v.ci]=true;save();v.mode="read";render();window.scrollTo(0,0);}};return r;}
    const q=v.qs[v.k],upto=turns[v.k].i;view.q=q;r.back={label:"Back",fn:()=>{if(v.k>0)v.k--;else v.mode="read";render();window.scrollTo(0,0);}};
    r.prog=`<div class="ptext">Your turn: reply ${v.k+1} of ${v.qs.length}</div><div class="bar"><i style="width:${Math.round(v.k/v.qs.length*100)}%"></i></div>`;
    r.main=`<div class="card">${linesHTML(l,x.lines.slice(0,upto),[],true)}</div><div class="card">${qHTML(q,{noAI:true})}</div>`;
    r.next=!q.answered?{label:"Check answer",fn:()=>{checkQ(q);render();},dis:!canCheck(q)}:{label:"Continue",fn:()=>{v.k++;v.scrollEnd=true;render();}};
    return r;
  }
  r.prog=`<div class="ptext">${S[l].talkDone&&S[l].talkDone[v.ci]?"✅ Your turn completed":"🟡 Read the conversation, then start your turn"}</div>`;
  r.main=`<div class="card"><p class="small">${esc(x.situation)}</p><p><button class="play" data-a="${A(()=>sayLines(x.lines,l))}">${PLAY}Play whole conversation</button></p>${linesHTML(l,x.lines,[],true)}</div>`
    +(x.phrases.length?`<div class="card"><h2>🔑 Key phrases</h2>${x.phrases.map(s=>`<div class="line">${sentHTML(l,s,[])}</div>`).join("")}</div>`:"");
  r.next={label:`Start your turn: ${turns.length} replies`,dis:!turns.length,fn:()=>{
    v.mode="turn";v.k=0;
    v.qs=turns.map(o=>{const ln=o.ln;return mkGramQ({question:"Choose what Person B (you) says next.",options:[{text:sentText(ln),reading:ln.tokens.map(t=>t[1]).filter(Boolean).join(" "),english:ln.english},...ln.wrong],answer:0,why:""},l,false);});
    render();window.scrollTo(0,0);}};
  return r;
}

/* ---------- Microphone test ---------- */
async function micTest(){
  view.mic=["Testing. If the browser asks for microphone access, choose Allow."];render();
  const out=["Speech recognition in this browser: "+(SR?"supported":"not supported")];
  let micOK=false;
  if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){try{const s=await navigator.mediaDevices.getUserMedia({audio:true});s.getTracks().forEach(t=>t.stop());micOK=true;out.push("Microphone access: allowed");}catch(e){out.push("Microphone access: blocked (browser error “"+(e.name||"unknown")+"”)");}}
  else out.push("Microphone access: not available in this view");
  view.mic=out.concat(SR?["Speech recognition test: say “你好” or “こんにちは” now."]:[]);render();
  if(!SR){view.mic=out;render();return;}
  const r=new SR();r.lang=L[S.lang].code;r.interimResults=false;let fin=false;
  const end=t=>{if(fin)return;fin=true;out.push(t);view.mic=out;render();};
  r.onresult=e=>{end("Speech recognition test: worked. It heard “"+e.results[0][0].transcript+"”.");S.settings.speakMode="recognize";save();out.push("Speaking questions now use speech recognition.");render();};
  r.onerror=e=>end("Speech recognition test: failed (browser error “"+e.error+"”)");
  r.onend=()=>end("Speech recognition test: no speech was heard.");
  try{r.start();}catch(e){end("Speech recognition test: could not start.");}
}

/* ---------- Travel ---------- */
const TRIP={ja:TRIP_JA,zh:TRIP_ZH},COUNTRY={ja:"Japan",zh:"China"};
function trip(l,i){const d=TRIP[l][i];if(!d._p)d._p={hear:d.hear.map(parseLine),say:d.say.map(x=>({p:parseLine(x[0]),c:x[1]?parseLine(x[1]):null}))};return d;}
function sayAt(text,l,rate){if(!("speechSynthesis" in window)){note("This browser cannot play speech audio.");return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=L[l].code;const v=voiceFor(l);if(v)u.voice=v;u.rate=rate*S.settings.speed;speechSynthesis.speak(u);}
function tripLine(l,s,label){return `<div class="line"><div class="sent"><div class="sbody">${label?`<p class="spk">${label}</p>`:""}${glossHTML(l,s.tokens,[])}${S.settings.showEnglish&&s.english?`<p class="eng">${esc(s.english)}</p>`:""}</div><div class="stack2"><button class="play" aria-label="Play audio" title="Play audio" data-a="${A(()=>sayAt(sentText(s),l,1))}">${PLAY}</button></div></div></div>`;}
/* Real-situation log: S[l].real = {phraseText:{r:"ok"|"repeat"|"english",t:timestamp}}; the latest result per phrase wins. */
const REAL_R={ok:"Understood",repeat:"Asked me to repeat",english:"Answered in English"};
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function realDate(t){const x=new Date(t);return x.getDate()+" "+MONTHS[x.getMonth()]+" "+x.getFullYear();}
function realSet(l,key,res){const o=S[l].real||(S[l].real={});o[key]={r:res,t:Date.now()};view.rl=null;save();render();}
function realCounts(l){const o=S[l].real||{},ks=Object.keys(o);return{used:ks.length,ok:ks.filter(k=>o[k].r==="ok").length};}
function realSummary(c){return c.used?`Used in real life: ${c.used} ${c.used===1?"phrase":"phrases"}. Understood: ${c.ok}.`:"Used in real life: 0 phrases. Open a situation and tap “I used this in real life” under a phrase.";}
function realPhrases(l){const m={};TRIP[l].forEach((x,i)=>{trip(l,i)._p.say.forEach(y=>{[y.p,y.c].forEach(s=>{if(s)m[sentText(s)]=s;});});});return m;}
function realReview(l){const o=S[l].real||{},m=realPhrases(l);return Object.keys(o).filter(k=>o[k].r!=="ok"&&m[k]).sort((a,b)=>o[b].t-o[a].t).map(k=>({key:k,s:m[k],e:o[k]}));}
function realBtns(l,key){return `<div class="stack2" role="group" aria-label="Result in real life">${Object.keys(REAL_R).map(k=>uiBtn(REAL_R[k],()=>realSet(l,key,k),"sec")).join("")}</div>`;}
function realBlock(l,s){const key=sentText(s),e=(S[l].real||{})[key],open=view.rl===key;
  return `<div class="realb">${e?`<p class="small muted" style="margin:4px 0">Real life: ${esc(REAL_R[e.r])}, ${esc(realDate(e.t))}</p>`:""}${open?realBtns(l,key):uiBtn(e?"Change the real-life result":"I used this in real life",()=>{view.rl=key;render();},"link")}</div>`;}
function homeReal(l,r){
  const list=realReview(l);
  let h=uiCard(`<p style="margin:0">${esc(realSummary(realCounts(l)))}</p>`);
  h+=list.length?uiCard(list.map(it=>{const rd=it.s.tokens.map(t=>t[1]).filter(Boolean).join(" "),open=view.rl===it.key;
    return `<div class="realit">`+uiRow(uiTileIcon("listen"),`<span lang="${L[l].hl}">${esc(it.key)}</span>`,esc([rd,it.s.english].filter(Boolean).join(" · "))+`<br>${esc(REAL_R[it.e.r])}, ${esc(realDate(it.e.t))}`,()=>{sayAt(it.key,l,1);view.rl=it.key;render();})+(open?realBtns(l,it.key):"")+`</div>`;}).join(""),"list")
    :uiCard(`<p style="margin:0" class="muted">No phrases to review. A phrase appears here when its latest result is “Asked me to repeat” or “Answered in English”.</p>`);
  r.main=h;
}
function homeTrip(l,r){
  const st=S[l],done=st.tripDone||{},op=st.tripOpen||{};let first=-1;
  r.main=`<details class="card tint acc" data-k="in-trip" ${isOpen("in-trip",false)?"open":""}><summary>✈️ Travel in ${COUNTRY[l]} (about)</summary><p>Situations in trip order: what locals say, what you say, how to sound local, and etiquette. Built into the app.</p><p class="small muted" style="margin:0">Practical facts were checked on 2 November 2026. Rules and apps can change, so check official sources before you travel.</p></details><div class="card"><ul class="units">${TRIP[l].map((s,i)=>{const d=!!done[i],o=!!op[i];if(!d&&first<0)first=i;
    return `<li><button class="rowbtn" data-a="${A(()=>openTrip(i))}"><span><span aria-hidden="true">${d?"✅":o?"🟡":"⭕"}</span> ${s.e} ${i+1}. ${esc(s.t)}<br><span class="status">${esc(s.intro)}</span></span><span class="chev" aria-hidden="true">›</span></button></li>`;}).join("")}</ul></div>`;
  r.next=first>=0?{label:`Open: ${TRIP[l][first].t}`,fn:()=>openTrip(first)}:{label:"All situations practised",dis:true};
}
function openTrip(i){const l=S.lang,o=S[l].tripOpen||(S[l].tripOpen={});if(!o[i]){o[i]=true;save();}view={s:"trip",i,mode:"read"};render();window.scrollTo(0,0);}
function optOf(s){return{text:sentText(s),reading:s.tokens.map(t=>t[1]).filter(Boolean).join(" "),english:s.english};}
function tripQ(l,d,correct,ctx){const others=shuffle(d._p.say.map((x,k)=>k).filter(k=>k!==correct)).slice(0,2);const q=mkGramQ({question:"Choose your reply.",options:[optOf(d._p.say[correct].p),...others.map(k=>optOf(d._p.say[k].p))],answer:0,why:""},l,false);q.ctx=ctx;return q;}
function startTripPractice(v){
  const l=S.lang,d=trip(l,v.i),items=[];
  d.drill.forEach(([h,s])=>items.push(tripQ(l,d,s,[{who:"A",s:d._p.hear[h]}])));
  const bp=d._p.say.map(x=>x.p),bc=shuffle(bp.filter(x=>{const n=contentToks(x).length;return n>=2&&n<=7;})).slice(0,2);bc.forEach(x=>{const q=mkBuild(l,x,"build",bp);q.ctx=[];items.push(q);});
  const ctx=[];d.role.forEach(ref=>{const k=+ref.slice(1);if(ref[0]==="h")ctx.push({who:"A",s:d._p.hear[k]});else{items.push(tripQ(l,d,k,ctx.slice()));ctx.push({who:"B",s:d._p.say[k].p});}});
  v.mode="practice";v.items=items;v.k=0;v.nDrill=d.drill.length+bc.length;render();window.scrollTo(0,0);
}
function screenTrip(){
  const v=view,l=S.lang,d=trip(l,v.i);
  const r={row:"title",title:`${d.e} ${d.t}`,prog:"",back:{label:"Back",fn:goHome},main:""};
  if(v.mode==="practice"){
    if(v.k>=v.items.length){const c=v.items.filter(q=>q.correct).length;r.prog=`<div class="ptext">Practice finished</div>`;r.back={label:"Back",dis:true};
      r.main=`<div class="card tint"><h2>✅ Practice finished</h2><p>Correct replies: ${c} of ${v.items.length}</p></div>`;
      {const dn=S[l].tripDone||(S[l].tripDone={});if(!dn[v.i]){dn[v.i]=true;S[l].lst=0;histPush(l,"✈️ Travel: "+d.t);save();}}
      r.main+=recsHTML(l,{k:"trip",i:v.i});
      r.next={label:"Go to home",fn:goHome};return r;}
    const q=v.items[v.k];view.q=q;const inRole=v.k>=v.nDrill,nR=v.items.length-v.nDrill;
    r.exit=true;
    r.prog=`<div class="ptext">${inRole?`Role-play: reply ${v.k-v.nDrill+1} of ${nR}`:`Quick replies: ${v.k+1} of ${v.nDrill}`}</div><div class="psub">${inRole?"Have the full conversation. Choose what you say.":"Listen to the local, then choose your reply."}</div><div class="bar"><i style="width:${Math.round(v.k/v.items.length*100)}%"></i></div>`;
    r.main=(q.ctx.length?`<div class="card">${q.ctx.map(c=>tripLine(l,c.s,c.who==="A"?"🧑 Local":"🙋 You")).join("")}</div>`:"")+`<div class="card">${qHTML(q,{noAI:true})}</div>`;
    r.back={label:"Back",fn:()=>{if(v.k>0)v.k--;else v.mode="read";render();window.scrollTo(0,0);}};
    r.next=!q.answered?{label:"Check answer",fn:()=>{checkQ(q);render();},dis:!canCheck(q)}:{label:"Continue",fn:()=>{v.k++;render();window.scrollTo(0,0);}};
    return r;
  }
  const done=S[l].tripDone&&S[l].tripDone[v.i],tt=v.tt||"hear";r.title=d.t;
  r.prog=`<div class="psub">${esc(COUNTRY[l])} · situation ${v.i+1} of ${TRIP[l].length}${done?" · ✅ Practised":""}</div>`;
  r.main=uiSeg([["hear","You will hear"],["say","You say"],["tips","Tips"]],tt,k=>{v.tt=k;render();})+`${tt==="tips"?`<div class="card"><h2>Good to know</h2>${d.facts.map(f=>`<p>${esc(f)}</p>`).join("")}</div>`:""}
  ${tt==="hear"?`<div class="card list">${d._p.hear.map(s=>tripLine(l,s,"Staff or local")).join("")}</div><button class="btn sec full" data-a="${A(()=>openPlayer("trip",v.i))}">Play the conversation, one line at a time</button>`:""}
  ${tt==="say"?`<div class="card list">${d._p.say.map(x=>tripLine(l,x.p,x.c?"Polite":"")+realBlock(l,x.p)+(x.c?tripLine(l,x.c,"Casual")+realBlock(l,x.c):"")).join("")}</div>`:""}
  ${tt==="tips"?`<div class="card"><h2>Sound local</h2><ul class="units">${d.local.map(w=>`<li><span><span class="cjk2" lang="${L[l].hl}">${esc(w[0])}</span> <span class="muted">${esc(w[1])}</span><br><strong>${esc(w[2])}</strong><br><span class="small">${esc(w[3])}</span></span><button class="play" aria-label="Play audio" title="Play audio" data-a="${A(()=>sayAt(w[0].replace(/[〜~]/g,""),l,1))}">${PLAY}</button></li>`).join("")}</ul></div><div class="card"><h2>Etiquette</h2><ul class="small">${d.etiq.map(e=>`<li>${esc(e)}</li>`).join("")}</ul></div>`:""}`;
  r.next={label:"Practise this situation",fn:()=>startTripPractice(v)};
  return r;
}

/* ---------- Casual speech (Practise tab) ----------
   CASUAL[l] = [{t, e, p:[[politeString, casualString, who], ...]}]. Progress: S[l].casualDone = {lessonIndex: timestamp}
   (saved inside user_settings.data.per[l], last-write-wins, like S[l].real). Wrong answers are not added to Mistakes. */
function casualList(l){return (typeof CASUAL!=="undefined"&&CASUAL&&Array.isArray(CASUAL[l]))?CASUAL[l]:[];}
function casualLesson(l,i){const d=casualList(l)[i];if(!d)return null;if(!d._p)d._p={t:d.t,e:d.e,p:d.p.map(x=>({p:parseLine(x[0]),c:parseLine(x[1]),who:String(x[2]||"a friend")}))};return d._p;}
function casualDoneObj(l){const s=S[l];if(!s.casualDone||typeof s.casualDone!=="object"||Array.isArray(s.casualDone))s.casualDone={};return s.casualDone;}
function casualCount(l){const o=casualDoneObj(l);return casualList(l).filter((c,i)=>o[i]).length;}
function casualMark(l,i){casualDoneObj(l)[i]=Date.now();save();}
function openCasual(i){view={s:"casual",i,mode:"read"};render();window.scrollTo(0,0);}
function homeCasual(l,r){
  const list=casualList(l),o=casualDoneObj(l),n=casualCount(l);
  r.main=uiCard(`<p style="margin:0">${n} of ${list.length} done. Each lesson shows how people say the same thing politely and casually.</p>`)
    +uiCard(list.map((c,i)=>uiRow(uiTileIcon("speaker"),esc(c.t),esc(o[i]?"Done":"Not done")+" · "+c.p.length+(c.p.length===1?" pair":" pairs"),()=>openCasual(i),o[i]?STATUS.ok:STATUS.todo)).join(""),"list");
}
function startCasualQuiz(v){
  const l=S.lang,c=casualLesson(l,v.i),fw=[],rv=[];
  c.p.forEach(x=>{const pt=sentText(x.p),ct=sentText(x.c);if(pt===ct)return;
    fw.push(mkGramQ({question:`Which would you say to ${x.who}?`,options:[optOf(x.c),optOf(x.p)],answer:0,why:`This is the casual version. People say it to ${x.who}. The other version is polite.`},l,false));
    rv.push(mkGramQ({question:"Which version is polite?",options:[optOf(x.p),optOf(x.c)],answer:0,why:`This is the polite version. The other version is casual, for ${x.who}.`},l,false));});
  v.items=shuffle(fw).concat(shuffle(rv));v.k=0;v.mode="quiz";render();window.scrollTo(0,0);
}
function screenCasual(){
  const v=view,l=S.lang,c=casualLesson(l,v.i);
  if(!c){libSec="casual";return {row:"title",title:"Casual speech",prog:"",back:{label:"Back",fn:()=>openSub("casual")},main:uiCard(`<p style="margin:0">This lesson is not available.</p>`),next:null};}
  const r={row:"title",title:c.t,prog:"",back:{label:"Back",fn:()=>openSub("casual")},main:""};
  if(v.mode==="quiz"){
    const n=v.items.length;
    if(v.k>=n){r.prog=`<div class="ptext">Practice finished</div><div class="bar"><i style="width:100%"></i></div>`;r.back={label:"Back",dis:true};
      r.main=uiCard(`<h2>Practice finished</h2><p>Correct: ${v.items.filter(q=>q.correct).length} of ${n}.</p><p class="muted" style="margin:0">This lesson is marked as done.</p>`,"tint");
      r.next={label:"Back to the list",fn:()=>openSub("casual")};return r;}
    const q=v.items[v.k];view.q=q;r.exit=true;
    r.prog=`<div class="ptext">Question ${v.k+1} of ${n}</div><div class="bar"><i style="width:${Math.round(v.k/n*100)}%"></i></div>`;
    r.main=uiCard(qHTML(q,{noAI:true}));
    r.back={label:"Back",fn:()=>{if(v.k>0)v.k--;else v.mode="read";render();window.scrollTo(0,0);}};
    r.next=!q.answered?{label:"Check answer",fn:()=>{checkQ(q);render();},dis:!canCheck(q)}:{label:"Continue",fn:()=>{if(v.k>=n-1)casualMark(l,v.i);v.k++;render();window.scrollTo(0,0);}};
    return r;
  }
  const done=!!casualDoneObj(l)[v.i];
  r.prog=`<div class="psub">${done?"Done":"Not done"} · lesson ${v.i+1} of ${casualList(l).length}</div>`;
  r.main=uiCard(`<p style="margin:0">${esc(c.e)}</p>`)+c.p.map(x=>`<div class="card list">${tripLine(l,x.p,"Polite")+tripLine(l,x.c,"Casual ("+esc(x.who)+")")}</div>`).join("");
  r.next={label:"Practise this lesson",fn:()=>startCasualQuiz(v),dis:!c.p.length};
  return r;
}
