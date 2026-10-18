(function rpgApp(){
 "use strict";
 const API="https://sxmchnwzcbsanecxnqdt.supabase.co/functions/v1/english-rpg-api";
 const root=document.getElementById("root"),modal=document.getElementById("modal-root"),notice=document.getElementById("global-notice");
 const NPC=[
  {x:4,y:3,name:"Elder Rowan",face:"🧙",place:"Old Village",message:"Welcome, young explorer! A shadow has scattered the Eight Language Crystals. Help restore them."},
  {x:9,y:3,name:"Luna the Librarian",face:"🧝",place:"Library Lane",message:"The ancient scrolls contain clues. Find the words to uncover the next crystal."},
  {x:5,y:9,name:"Captain Kai",face:"🧑‍✈️",place:"Forest Gate",message:"Brave explorer! The forest spirits need your English wisdom."},
  {x:10,y:13,name:"Mage Asha",face:"🧙‍♀️",place:"Magic Garden",message:"The garden flowers will bloom when you answer my riddles."},
  {x:17,y:3,name:"Ranger Finn",face:"🧑‍🌾",place:"River Valley",message:"You crossed the bridge! The crystals on this side need your help."},
  {x:21,y:5,name:"Professor Pip",face:"👨‍🏫",place:"Clock Tower",message:"My clockwork machine requires the power of precise English."},
  {x:17,y:10,name:"Knight Nova",face:"🛡️",place:"Castle Approach",message:"Show your courage and language skills to protect the castle."},
  {x:21,y:13,name:"Crystal Keeper",face:"🧚",place:"Crystal Citadel",message:"The final crystal awaits. Restore all eight and save our world!"}
 ];
 const TREE=new Set(["1,1","2,2","5,1","7,5","2,8","9,10","10,4","3,12","7,13","10,15","14,1","15,6","18,6","20,2","23,6","15,12","19,14","23,15"]);
 const HEROES=[{name:"Explorer",icon:"🧑",shirt:"#65cfcb"},{name:"Knight",icon:"🛡️",shirt:"#89a7ed"},{name:"Wizard",icon:"🧙",shirt:"#e69de5"},{name:"Ranger",icon:"🧝",shirt:"#a3df85"}];
 const state={data:null,page:"home",classCode:"",studentId:"",hero:0,player:null,token:null,records:{},progress:null,teacher:null,teacherToken:sessionStorage.getItem("eqrpg-teacher")||null,teacherClass:"",teacherRows:[],teacherUpdated:null,busy:false,px:3,py:5,face:"down",quest:0,question:null,wrongFeedback:"",answerBusy:false};
 const h=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
 const number=n=>Number(n||0);
 let toastTimer=null,lastFrame=0;
 function toast(msg){notice.textContent=msg;clearTimeout(toastTimer);toastTimer=setTimeout(()=>notice.textContent="",4100);}
 function show(html){modal.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-label="Adventure dialog"><button type="button" class="close-x" data-act="close-modal" aria-label="Close dialog">×</button>${html}</div>`;}
 function close(){modal.innerHTML="";state.question=null;state.wrongFeedback="";}
 function loading(msg="Loading..."){show(`<div class="loading-page" style="padding:30px"><span class="spinner">⚔️</span><h2>${h(msg)}</h2></div>`);}
 function cls(){return state.data?.classes.find(c=>c.code===state.classCode);}
 async function api(path,body,token){
  let res,data;try{res=await fetch(API+"/"+path,{method:body===undefined?"GET":"POST",headers:{"Content-Type":"application/json",...(token?{"Authorization":"Bearer "+token}:{})},body:body===undefined?undefined:JSON.stringify(body),cache:"no-store"});data=await res.json();}catch{throw new Error("Cannot connect to the school server. Check your internet.");}
  if(!res.ok)throw new Error(data?.error||"School service is unavailable.");
  return data;
 }
 const qs=(params)=>new URLSearchParams(params).toString();
 function classSelect(){
  return state.data.classes.map(c=>`<button type="button" class="class-choice ${state.classCode===c.code?"selected":""}" data-act="class" data-class="${h(c.code)}"><b>${h(c.code)}</b><span>${h(c.name)}</span><small>Year ${c.year} · ${h(c.level)}</small></button>`).join("");
 }
 function pupilSelect(){
  const pupils=state.data.students.filter(s=>s.classCode===state.classCode);
  return `<option value="">-- CHOOSE YOUR OWN NAME --</option>`+pupils.map(s=>`<option value="${h(s.id)}" ${state.studentId===s.id?"selected":""}>${h(s.name)}</option>`).join("");
 }
 function renderHome(){
  state.page="home";document.title="English Quest RPG • Choose Your Class";
  const year=cls()?.year,topics=cls()?.questTopics||[];
  root.innerHTML=`<section class="hero"><div class="panel glow"><p class="eyebrow">The legend of the eight language crystals</p><h1>ENGLISH <em>QUEST</em><br>RPG ADVENTURE</h1><p class="hero-description">Explore a colourful fantasy world, meet 8 characters, complete 8 quests and save the kingdom with English skills aligned to your Year 1–6 DSKP.</p><div class="inven"><span class="item">🗺️ Explore</span><span class="item">💬 NPC Dialogues</span><span class="item">⚔️ 40 Challenges</span><span class="item">💎 Collect Crystals</span><span class="item">🏆 XP & Coins</span></div><p class="subline" style="margin-top:17px">You must choose YOUR OWN name. Your teacher can see your progress automatically.</p></div><div class="hero-art" aria-label="Pixel fantasy castle landscape"><div class="pixel-sun"></div><div class="mountains"></div><div class="grass"></div><div class="castle">🏰</div><div class="pixel-hero">🧝</div></div></section>
  <div class="banner"><h2>✦ BEGIN YOUR HERO'S JOURNEY ✦</h2><p class="muted">Select your class, select your OWN name, then pick a character.</p></div>
  <section class="columns"><div class="panel"><p class="eyebrow">Step 01</p><h2>Choose your class</h2><div class="choices">${classSelect()}</div></div>
  <div class="panel"><p class="eyebrow">Step 02</p><h2>Choose your OWN name</h2>${state.classCode?`<p class="subline">${h(cls().name)} · ${h(cls().teacher)} · ${h(cls().level)} level</p><label class="field-label" for="student">FULL NAME FROM YOUR CLASS LIST</label><select class="field" id="student">${pupilSelect()}</select><p class="eyebrow">Step 03 · Choose your character</p><div class="avatar-options">${HEROES.map((x,i)=>`<button type="button" class="avatar-btn ${i===state.hero?"selected":""}" data-act="hero" data-hero="${i}" title="${h(x.name)}">${x.icon}</button>`).join("")}</div>${topics.length?`<p class="subline"><strong>DSKP topics:</strong> ${h([...new Set(topics)].join(" · "))}</p>`:""}<div class="required-message">⚠️ IMPORTANT: Select YOUR OWN name only. Do not select another pupil's name.</div><button class="btn wide green" data-act="start" ${!state.studentId?"disabled":""}>⚔️ START MY ADVENTURE</button>`:`<p class="muted">Choose a class on the left to see the official pupil list.</p><div class="required-message">Your name must match your own class. No typing someone else's name.</div>`}</div></section>`;
 }
 function badgeInventory(){
  const n=state.progress?.missionsComplete||0;
  return n?NPC.slice(0,n).map((m,i)=>`<span class="item" title="${h(m.name)}">💎 Crystal ${i+1}</span>`).join(""):`<span class="inventory-note">Complete quests to collect magical crystals.</span>`;
 }
 function unlocked(i){return i===0||(state.progress?.missions[i-1]?.completed===5);}
 function nearby(n){return Math.abs(state.px-n.x)+Math.abs(state.py-n.y)<=2;}
 function renderGame(){
  if(!state.player)return renderHome();
  state.page="game";const p=state.progress,c=state.player.classInfo;
  document.title="English Quest RPG · "+state.player.pupil.name;
  root.innerHTML=`<div class="quest-title"><div><p class="eyebrow">The Crystal Kingdom · Year ${c.year} · ${h(c.level)}</p><h2>⚔️ ${h(state.player.pupil.name)}</h2><p>${h(c.code)} · ${h(c.teacher)} · Move with WASD / arrows or the buttons below</p></div><div style="margin-left:auto"><button class="btn outlined small" data-act="leave">🏠 Main menu</button></div></div>
  <div class="hud"><div class="hud-info"><span class="hud-chip">❤️❤️❤️</span><span class="hud-chip">⭐ Level <strong>${p.level}</strong></span><span class="hud-chip">✨ XP <strong>${p.xp}</strong></span><span class="hud-chip">🪙 Coins <strong>${p.coins}</strong></span><span class="hud-chip">💎 <strong>${p.missionsComplete}/8</strong></span></div><span class="save-label">☁️ ${h(p.updatedAt?"Progress saved online":"Ready to begin")}</span></div>
  <div class="adventure-layout"><div><div class="world-shell"><canvas id="world" class="world" width="960" height="640" aria-label="Top-down explorable RPG world with eight characters"></canvas><div class="world-overlay">🗺️ CRYSTAL KINGDOM · 8 NPC QUESTS</div></div><div class="world-bottom"><div><p class="game-tip">🎮 <b>HOW TO PLAY:</b> Move towards a glowing character, press <b>SPACE / ENTER</b> or tap them when nearby. Complete 5 challenges to earn each crystal. Cross the wooden bridge to reach the castle.</p><button class="btn small green" data-act="talk">💬 TALK TO NEAREST NPC</button><p class="game-tip">Walk around trees and cross the bridge. The next unlocked NPC has a bright yellow ring.</p></div><div class="dpad" aria-label="Move character"><button class="up" data-act="move" data-dx="0" data-dy="-1" aria-label="Up">▲</button><button class="left" data-act="move" data-dx="-1" data-dy="0" aria-label="Left">◀</button><button class="down" data-act="move" data-dx="0" data-dy="1" aria-label="Down">▼</button><button class="right" data-act="move" data-dx="1" data-dy="0" aria-label="Right">▶</button></div></div></div>
  <aside class="sidebar"><div class="panel"><h3>📜 Quest Journal</h3><div class="progressbar"><span style="width:${p.percent}%"></span></div><p class="subline">${p.completed}/40 tasks · ${p.percent}% · ${p.firstTry} first-try correct</p><div class="quest-list">${p.missions.map((m,i)=>`<button class="quest-row ${m.completed===5?"done":unlocked(i)?"active":"locked"}" data-act="locate" data-quest="${i}"><span>${m.completed===5?"✅":unlocked(i)?"✨":"🔒"}</span><span><b>${i+1}. ${h(NPC[i].name)}</b><small>${h(m.topic)} · ${m.completed}/5</small></span></button>`).join("")}</div></div><div class="panel"><h3>🎒 Inventory</h3><div class="inven">${badgeInventory()}</div><p class="inventory-note" style="margin-top:12px">Crystals are earned only once. Repeating a solved challenge cannot add XP.</p></div><div class="panel"><h3>📊 Your progress</h3><p>${p.completed} completed · ${p.wrong} wrong attempts</p><p class="subline">Your teacher sees your class progress automatically. No need to tell the teacher you are done.</p></div></aside></div>`;
  draw();
 }
 function tileBlocked(x,y){
  if(x<0||x>=24||y<0||y>=16)return true;
  if(x===12&&y!==7&&y!==8)return true;
  return TREE.has(x+","+y);
 }
 function rect(ctx,x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
 function draw(){
  const el=document.getElementById("world");if(!el||state.page!=="game")return;
  const ctx=el.getContext("2d");if(!ctx)return;ctx.imageSmoothingEnabled=false;
  const S=40;
  for(let y=0;y<16;y++)for(let x=0;x<24;x++){
   const road=(y===7||y===8||x===4&&y>=3&&y<=13||x===10&&y>=3&&y<=14||x===17&&y>=2&&y<=13||x===21&&y>=3&&y<=13);
   rect(ctx,x*S,y*S,S,S,road?"#c5af7b":((x*5+y*3)%7<3?"#7bc878":"#83ca7a"));
   if(road)rect(ctx,x*S+6,y*S+21,6,3,"#ac9568");
   else if((x*19+y*31)%11===0)rect(ctx,x*S+26,y*S+13,5,7,"#cfe591");
   else if((x*3+y*17)%19===0)rect(ctx,x*S+12,y*S+24,6,4,"#fce9a0");
  }
  for(let y=0;y<16;y++){
   if(y===7||y===8){rect(ctx,12*S,y*S,S,S,"#a16b3e");for(let x=0;x<3;x++)rect(ctx,12*S+x*13,y*S+4,4,32,"#d7b176");rect(ctx,12*S,y*S+1,S,4,"#5e3d24");}
   else{rect(ctx,12*S,y*S,S,S, y%2?"#359cc2":"#42acd0");rect(ctx,12*S+12,y*S+9,19,4,"#8bdde7");rect(ctx,12*S+5,y*S+29,18,3,"#70d4e0");}
  }
  // Trees and stumps have visual and collision footprints.
  TREE.forEach(t=>{const [x,y]=t.split(",").map(Number);rect(ctx,x*S+15,y*S+20,10,18,"#76512f");rect(ctx,x*S+3,y*S+3,34,26,"#256b4b");rect(ctx,x*S+7,y*S+2,26,22,"#399a58");rect(ctx,x*S+11,y*S+5,14,6,"#66bf6e");});
  // Houses on village and castle paths.
  for(const [x,y] of [[6,11],[7,1],[15,13],[20,9]]){rect(ctx,x*S,y*S+10,75,57,"#eacb8f");rect(ctx,x*S-7,y*S+6,90,13,"#975c43");rect(ctx,x*S+28,y*S+43,17,25,"#875a42");rect(ctx,x*S+10,y*S+27,14,14,"#75bbd3");}
  // Castles and quest destinations.
  rect(ctx,22*S,0*S+5,67,100,"#d3d6d0");rect(ctx,22*S-9,0,25,57,"#a5b4b9");rect(ctx,22*S+48,0,26,54,"#a5b4b9");rect(ctx,22*S+23,57,20,48,"#514d54");
  NPC.forEach((n,i)=>{
   const solved=state.progress?.missions[i]?.completed===5,can=unlocked(i);
   const x=n.x*S,y=n.y*S;
   ctx.fillStyle=solved?"#5bcf99":can?"#fbe186":"#8a9eae";
   ctx.globalAlpha=solved?.55:can?.8:.38;ctx.beginPath();ctx.ellipse(x+20,y+35,21,8,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
   drawHero(ctx,n.x,n.y,i%2?"#ef9bc9":"#f4b75c",false);
   rect(ctx,x+8,y-14,25,17,solved?"#4aa374":can?"#f7cc4f":"#657786");
   ctx.fillStyle="#172332";ctx.font="bold 14px sans-serif";ctx.fillText(solved?"✓":can?"!":"🔒",x+14,y-1);
   rect(ctx,x-13,y+41,66,16,"#192b3bc9");ctx.font="bold 10px sans-serif";ctx.fillStyle="white";ctx.textAlign="center";ctx.fillText(n.name.split(" ")[0],x+20,y+53);ctx.textAlign="start";
  });
  drawHero(ctx,state.px,state.py,HEROES[state.hero].shirt,true);
  if(state.progress?.completed===40){rect(ctx,300,275,360,74,"#234b54e9");ctx.font="bold 28px sans-serif";ctx.fillStyle="#ffe9a2";ctx.fillText("ALL CRYSTALS RESTORED!",315,316);}
 }
 function drawHero(ctx,x,y,shirt,player){
  const X=x*40,Y=y*40;
  rect(ctx,X+9,Y+35,22,4,"#2e514a");
  rect(ctx,X+13,Y+26,6,13,"#333a52");rect(ctx,X+22,Y+26,6,13,"#333a52");
  rect(ctx,X+8,Y+14,24,15,shirt);rect(ctx,X+5,Y+18,6,13,shirt);rect(ctx,X+30,Y+18,6,13,shirt);
  rect(ctx,X+11,Y+4,20,17,player?"#e5ad8c":"#f2c89c");
  rect(ctx,X+10,Y+1,22,7,player?"#643b3e":"#70514b");
  rect(ctx,X+15,Y+12,3,3,"#223d4b");rect(ctx,X+25,Y+12,3,3,"#223d4b");
  if(player){rect(ctx,X+2,Y+2,5,29,"#f2df91");rect(ctx,X+3,Y+0,3,8,"#fff5ba");}
 }
 function move(dx,dy){
  if(state.page!=="game"||modal.innerHTML)return;
  const x=state.px+dx,y=state.py+dy;
  if(tileBlocked(x,y)){toast("Blocked! Find a clear path or the wooden bridge.");return;}
  state.px=x;state.py=y;state.face=dx?"side":dy<0?"up":"down";draw();
  if(state.progress.completed===40&&x===23&&y===7)toast("The kingdom is safe, Hero!");
 }
 function talk(i){
  if(state.page!=="game"||state.busy)return;
  let who=Number.isInteger(i)?i:NPC.findIndex(n=>nearby(n)&&unlocked(NPC.indexOf(n)));
  if(who<0||who>=NPC.length){toast("Move close to a character first! Follow the glowing quest ring.");return;}
  const n=NPC[who];
  if(!nearby(n)){toast("Walk closer to "+n.name+" at "+n.place+".");return;}
  if(!unlocked(who)){show(`<h2>🔒 QUEST LOCKED</h2><p>Complete the previous crystal mission first.</p><div class="modal-actions"><button class="btn" data-act="close-modal">Got it</button></div>`);return;}
  const done=state.progress.missions[who].completed===5;
  state.quest=who;
  show(`<span class="character-portrait">${n.face}</span><p class="eyebrow">${h(n.place)} · ${h(n.name)}</p><h2>${h(done?"CRYSTAL COMPLETE!":"A NEW QUEST AWAITS")}</h2><div class="speech-bubble">${h(n.message)}</div><h3>${h(state.progress.missions[who].topic)}</h3><p>${done?"You have already earned this crystal. Your XP is saved.":"Answer 5 challenges to restore this crystal and unlock the next part of the world."}</p><div class="modal-actions"><button class="btn outlined" data-act="close-modal">Close</button>${done?`<button class="btn green" data-act="close-modal">💎 Collected</button>`:`<button class="btn green" data-act="begin-quest">⚔️ ACCEPT QUEST</button>`}</div>`);
 }
 function talkNearest(){
  const candidates=NPC.map((n,i)=>({...n,i,dist:Math.abs(n.x-state.px)+Math.abs(n.y-state.py)})).filter(n=>n.dist<=2).sort((a,b)=>a.dist-b.dist);
  if(!candidates.length){toast("Stand next to an NPC. Look for the yellow exclamation mark!");return;}
  talk(candidates[0].i);
 }
 async function loadQuestion(){
  const n=state.quest,year=state.player.classInfo.year;
  const index=Array.from({length:5},(_,i)=>i).find(i=>!state.records[year+"-"+n+"-"+i]?.solved);
  if(index===undefined){
   const done=state.progress.completed===40;
   show(`<h2>${done?"🏆 YOU SAVED THE KINGDOM!":"💎 CRYSTAL RESTORED!"}</h2><p>${done?"All 8 quests and 40 challenges are complete. Congratulations, hero!":"The next crystal is now unlocked. Explore the map to find its keeper."}</p><div class="speech-bubble">✨ +XP & coins saved automatically. Current XP: ${state.progress.xp} · Crystals: ${state.progress.missionsComplete}/8</div><div class="modal-actions"><button class="btn green" data-act="close-modal">🗺️ BACK TO WORLD</button></div>`);
   return;
  }
  loading("Loading quest challenge...");
  try{
   const d=await api("student/question?"+qs({quest:n,index}),undefined,state.token);
   if(d.alreadySolved){const fresh=await api("student/me",undefined,state.token);state.progress=fresh.progress;state.records=fresh.records;renderGame();return loadQuestion();}
   state.question={...d.question,quest:n,index};state.wrongFeedback="";renderQuestion();
  }catch(e){show(`<h2>⚠️ Quest unavailable</h2><p>${h(e.message)}</p><button class="btn" data-act="close-modal">Back</button>`);}
 }
 function renderQuestion(correctAnswer){
  const q=state.question;if(!q)return;
  const passed=!!correctAnswer,details=state.progress.missions[q.quest];
  show(`<p class="eyebrow">${h(NPC[q.quest].face)} ${h(NPC[q.quest].name)} · ${h(q.topic)}</p><h2>QUEST ${q.quest+1} · CHALLENGE ${q.index+1}/5</h2>
   <div class="quest-progress">${Array.from({length:5},(_,i)=>`<span class="${i<details.completed?"done":i===q.index?"current":""}"></span>`).join("")}</div>
   <div class="speech-bubble"><strong>${h(q.prompt)}</strong></div>
   ${passed?`<div class="feedback">✅ Correct! Great job, explorer. Your progress has been saved.</div><div class="modal-actions"><button class="btn green" data-act="next-question">➡️ ${q.index===4?"FINISH QUEST":"NEXT CHALLENGE"}</button></div>`:`<p class="subline">Choose the best answer. You can try again if it is wrong.</p>${q.options.map((o,i)=>`<button class="question-option" data-act="answer" data-answer="${h(o)}">${String.fromCharCode(65+i)}. ${h(o)}</button>`).join("")}${state.wrongFeedback?`<div class="feedback wrong">❌ Not yet. ${h(state.wrongFeedback)}</div>`:""}<div class="modal-actions"><button class="btn outlined" data-act="close-modal">Save & return to map</button></div>`}`);
 }
 async function answer(value){
  if(state.answerBusy||!state.question)return;
  state.answerBusy=true;
  const q=state.question;
  try{
   const r=await api("student/answer",{quest:q.quest,index:q.index,answer:value},state.token);
   state.progress=r.progress;state.records=r.records;renderGame();
   if(r.correct){renderQuestion(true);}
   else{state.wrongFeedback=r.hint||"Try a different answer.";renderQuestion(false);}
  }catch(e){toast(e.message);if(e.message.includes("Reload")){try{const fresh=await api("student/me",undefined,state.token);state.progress=fresh.progress;state.records=fresh.records;renderGame();await loadQuestion();}catch{}}}
  finally{state.answerBusy=false;}
 }
 async function start(){
  if(state.busy)return;
  if(!state.classCode||!state.studentId){toast("Select your own name from your class first.");return;}
  state.busy=true;loading("Entering the Crystal Kingdom...");
  try{
   const result=await api("student/start",{studentId:state.studentId,classCode:state.classCode});
   state.player=result;state.token=result.token;state.records=result.records;state.progress=result.progress;state.px=3;state.py=5;renderGame();close();
   toast("Welcome, "+result.pupil.name+"! Find Elder Rowan to begin.");
  }catch(e){close();renderHome();toast(e.message);}finally{state.busy=false;}
 }
 function leave(){close();state.player=null;state.token=null;state.records={};state.progress=null;state.studentId="";renderHome();}
 async function openTeacher(){
  close();state.page="teacher";if(!state.teacherToken){renderTeacher();return;}
  try{const d=await api("teacher/me",undefined,state.teacherToken);state.teacher=d.teacher;state.teacherClass=state.teacherClass||d.teacher.classes[0].code;await teacherLoad();}
  catch(e){state.teacherToken=null;state.teacher=null;sessionStorage.removeItem("eqrpg-teacher");renderTeacher();toast("Please sign in with your registered IC.");}
 }
 function renderTeacher(){
  state.page="teacher";document.title="Teacher Dashboard · English Quest RPG";
  if(!state.teacher){
   root.innerHTML=`<div class="teacher-heading"><div><p class="eyebrow">Secure Teacher Area</p><h1>🛡️ CLASS QUEST DASHBOARD</h1><p class="muted">Only teachers registered for these classes can see pupil progress.</p></div><button class="btn outlined" data-act="teacher-back">← BACK</button></div><div class="panel teacher-card"><h2>TEACHER SIGN IN</h2><p>Enter your registered 12-digit IC number to view your allocated classes.</p><form id="teacher-form"><label class="field-label" for="teacher-ic">IC Number</label><input class="field" id="teacher-ic" type="password" inputmode="numeric" maxlength="18" autocomplete="off" placeholder="12 digits" required/><button type="submit" class="btn green wide">🔑 SIGN IN</button></form><p class="tiny muted" style="margin-top:13px">Teacher access is verified on the school server. No IC is stored in the browser.</p></div>`;
   return;
  }
  const rows=state.teacherRows||[],started=rows.filter(x=>x.progress.status!=="not-started").length,finished=rows.filter(x=>x.progress.status==="complete").length,done=rows.reduce((n,x)=>n+x.progress.completed,0);
  root.innerHTML=`<div class="teacher-heading"><div><p class="eyebrow">🛡️ Teacher Area · English Quest RPG</p><h1>CLASS QUEST DASHBOARD</h1><p class="muted">Welcome, ${h(state.teacher.name)}. Progress refreshes every 15 seconds.</p></div><div style="display:flex;gap:7px;flex-wrap:wrap"><button class="btn outlined small" data-act="teacher-back">← BACK</button><button class="btn small red" data-act="teacher-logout">SIGN OUT</button></div></div>
  <section class="panel"><p class="eyebrow">Your allocated classes</p><div class="teacher-tabs">${state.teacher.classes.map(c=>`<button class="btn small ${c.code===state.teacherClass?"green":"outlined"}" data-act="teacher-class" data-class="${h(c.code)}">${h(c.code)} · ${h(c.name)}</button>`).join("")}</div>
  <div class="teacher-stats"><div class="teacher-stat"><b>${rows.length}</b><small>PUPILS</small></div><div class="teacher-stat"><b>${started}</b><small>STARTED</small></div><div class="teacher-stat"><b>${finished}</b><small>COMPLETED</small></div><div class="teacher-stat"><b>${rows.length?Math.round(done/(rows.length*40)*100):0}%</b><small>CLASS PROGRESS</small></div></div>
  <div class="teacher-toolbar"><p class="muted tiny">Last refresh: ${h(state.teacherUpdated?new Date(state.teacherUpdated).toLocaleString("en-GB"):"Not loaded")} · ${h(state.teacherClass)}</p><div style="display:flex;gap:7px"><button class="btn small outlined" data-act="teacher-refresh">↻ REFRESH</button><button class="btn small green" data-act="teacher-csv">⬇ CSV REPORT</button></div></div>
  <div class="table-wrap"><table class="teacher-table"><thead><tr><th>NO.</th><th>PUPIL</th><th>STATUS</th><th>CHALLENGES</th><th>FIRST TRY</th><th>XP / CRYSTALS</th><th>LAST SAVED</th><th>ACTIONS</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td><strong>${h(r.name)}</strong></td><td><span class="pill ${h(r.progress.status)}">${h(r.progress.status)}</span></td><td><b>${r.progress.completed}/40</b><div class="progressbar"><span style="width:${r.progress.percent}%"></span></div></td><td>${r.progress.firstTry}/40</td><td>${r.progress.xp} XP<small>${r.progress.missionsComplete}/8 crystals</small></td><td>${h(r.progress.updatedAt?new Date(r.progress.updatedAt).toLocaleString("en-GB"):"—")}</td><td><button class="btn outlined small" data-act="teacher-view" data-student="${h(r.id)}">View</button> <button class="btn red small" data-act="teacher-confirm" data-student="${h(r.id)}">Reset</button></td></tr>`).join("")||`<tr><td colspan="8">No pupils have been assigned to this class yet.</td></tr>`}</tbody></table></div><p class="tiny muted" style="margin-top:14px">First-try counts only answers correct before any wrong attempt. Reset is available only for your own classes and cannot be undone.</p></section>`;
 }
 async function teacherLoad(silent=false){
  if(!state.teacher||!state.teacherClass)return;
  try{const d=await api("teacher/progress?"+qs({classCode:state.teacherClass}),undefined,state.teacherToken);state.teacherRows=d.students;state.teacherUpdated=d.refreshedAt;renderTeacher();}
  catch(e){if(!silent)toast(e.message);if(e.message.toLowerCase().includes("expired")){state.teacher=null;state.teacherToken=null;sessionStorage.removeItem("eqrpg-teacher");}renderTeacher();}
 }
 async function teacherLogin(){
  if(state.busy)return;const input=document.getElementById("teacher-ic"),ic=String(input?.value||"").replace(/[\s-]/g,"");if(!/^\d{12}$/.test(ic)){toast("Enter your registered 12-digit IC.");return;}
  if(input)input.value="";state.busy=true;loading("Checking your teacher access...");
  try{const d=await api("teacher/login",{ic});state.teacher=d.teacher;state.teacherToken=d.token;sessionStorage.setItem("eqrpg-teacher",d.token);state.teacherClass=d.teacher.classes[0].code;close();await teacherLoad();toast("Signed in to your allocated classes.");}
  catch(e){close();renderTeacher();toast(e.message);}finally{state.busy=false;}
 }
 function teacherView(id){
  const r=state.teacherRows.find(x=>x.id===id);if(!r)return;
  show(`<p class="eyebrow">Pupil quest breakdown</p><h2>${h(r.name)}</h2><p>${r.progress.completed}/40 solved · ${r.progress.firstTry} first-try · ${r.progress.xp} XP</p><table class="teacher-mission"><thead><tr><th>QUEST</th><th>TOPIC</th><th>DONE</th><th>FIRST</th></tr></thead><tbody>${r.progress.missions.map((m,i)=>`<tr><td>${i+1}</td><td>${h(m.topic)}</td><td>${m.completed}/5</td><td>${m.firstTry}/5</td></tr>`).join("")}</tbody></table><div class="modal-actions"><button class="btn" data-act="close-modal">Close</button></div>`);
 }
 function teacherConfirm(id){
  const r=state.teacherRows.find(x=>x.id===id);if(!r)return;
  show(`<h2>⚠️ RESET PUPIL PROGRESS?</h2><p><strong>${h(r.name)}</strong></p><p>Resetting clears all 40 English RPG challenges, XP and crystals for this pupil. It does not affect GrammarCraft or any other school records.</p><p class="alert">This cannot be undone. The pupil must start again.</p><div class="modal-actions"><button class="btn outlined" data-act="close-modal">Cancel</button><button class="btn red" data-act="teacher-reset" data-student="${h(id)}" data-version="${r.progress.resetVersion}">YES, RESET RPG</button></div>`);
 }
 async function teacherReset(id,version){
  if(state.busy)return;state.busy=true;loading("Resetting only this RPG record...");
  try{await api("teacher/reset",{studentId:id,expectedResetVersion:version,confirm:true},state.teacherToken);close();await teacherLoad();if(state.player?.pupil.id===id){state.player=null;state.token=null;}toast("Only this pupil's English RPG progress was reset.");}
  catch(e){close();toast(e.message);}finally{state.busy=false;}
 }
 async function teacherLogout(){
  try{await api("teacher/logout",{},state.teacherToken);}catch{}
  state.teacher=null;state.teacherToken=null;state.teacherRows=[];sessionStorage.removeItem("eqrpg-teacher");renderTeacher();toast("Signed out.");
 }
 function exportCSV(){
  const rows=[["Pupil","Class","Status","Completed","Total","First try","Wrong attempts","XP","Coins","Crystals","Last saved"],...state.teacherRows.map(x=>[x.name,x.classCode,x.progress.status,x.progress.completed,40,x.progress.firstTry,x.progress.wrong,x.progress.xp,x.progress.coins,x.progress.missionsComplete,x.progress.updatedAt||""])];
  const cell=v=>'"'+String(v??"").replace(/^([=+@-])/,"'$1").replace(/"/g,'""')+'"';
  const csv="\ufeff"+rows.map(r=>r.map(cell).join(",")).join("\r\n"),link=document.createElement("a"),url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));link.href=url;link.download="English-Quest-RPG-"+state.teacherClass+"-2026.csv";link.click();URL.revokeObjectURL(url);
 }
 async function action(act,el){
  if(act==="close-modal"){close();return;}
  if(act==="class"){state.classCode=el.dataset.class;state.studentId="";renderHome();}
  if(act==="hero"){state.hero=Math.max(0,Math.min(HEROES.length-1,Number(el.dataset.hero)));renderHome();}
  if(act==="start")await start();
  if(act==="leave")leave();
  if(act==="move")move(Number(el.dataset.dx),Number(el.dataset.dy));
  if(act==="talk")talkNearest();
  if(act==="locate"){const i=Number(el.dataset.quest),n=NPC[i];if(nearby(n))talk(i);else toast("Find "+n.name+" at "+n.place+" (map: "+(n.x+1)+","+(n.y+1)+").");}
  if(act==="begin-quest")await loadQuestion();
  if(act==="answer")await answer(el.dataset.answer);
  if(act==="next-question")await loadQuestion();
  if(act==="teacher-back"){close();if(state.player)renderGame();else renderHome();}
  if(act==="teacher-class"){state.teacherClass=el.dataset.class;state.teacherRows=[];renderTeacher();await teacherLoad();}
  if(act==="teacher-refresh")await teacherLoad();
  if(act==="teacher-view")teacherView(el.dataset.student);
  if(act==="teacher-confirm")teacherConfirm(el.dataset.student);
  if(act==="teacher-reset")await teacherReset(el.dataset.student,Number(el.dataset.version));
  if(act==="teacher-csv")exportCSV();
  if(act==="teacher-logout")await teacherLogout();
 }
 document.addEventListener("click",async e=>{
  const el=e.target.closest("[data-act]");if(!el)return;e.preventDefault();
  try{await action(el.dataset.act,el);}catch(err){toast(err.message);}
 });
 document.addEventListener("change",e=>{if(e.target?.id==="student"){state.studentId=e.target.value;renderHome();}});
 document.addEventListener("submit",e=>{if(e.target?.id==="teacher-form"){e.preventDefault();teacherLogin();}});
 document.getElementById("teacher-nav").addEventListener("click",openTeacher);
 document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&modal.innerHTML){close();return;}
  if(state.page!=="game"||modal.innerHTML||["INPUT","SELECT","TEXTAREA"].includes(e.target?.tagName))return;
  const k=e.key.toLowerCase(),vectors={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]};
  if(vectors[k]){e.preventDefault();move(...vectors[k]);}
  else if(k===" "||k==="enter"){e.preventDefault();talkNearest();}
 });
 root.addEventListener("pointerdown",e=>{
  if(state.page!=="game"||modal.innerHTML||e.target?.id!=="world")return;
  const canvas=e.target,b=canvas.getBoundingClientRect(),x=Math.floor((e.clientX-b.left)/b.width*24),y=Math.floor((e.clientY-b.top)/b.height*16);
  const i=NPC.findIndex(n=>n.x===x&&n.y===y);
  if(i!==-1){talk(i);return;}
  const dx=x-state.px,dy=y-state.py;if(Math.abs(dx)>Math.abs(dy))move(Math.sign(dx),0);else if(dy)move(0,Math.sign(dy));
 });
 setInterval(()=>{if(state.page==="teacher"&&state.teacher&&!state.busy&&document.visibilityState==="visible"&&!modal.innerHTML)teacherLoad(true);},15000);
 api("bootstrap").then(d=>{state.data=d;renderHome();if(new URLSearchParams(location.search).get("teacher")==="1")openTeacher();}).catch(e=>{root.innerHTML=`<div class="panel teacher-card"><h2>School service unavailable</h2><p>${h(e.message)}</p><button class="btn" onclick="location.reload()">Retry</button></div>`;toast(e.message);});
})();