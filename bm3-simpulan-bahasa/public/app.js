(function rpgApp(){
 "use strict";
 const API="https://sxmchnwzcbsanecxnqdt.supabase.co/functions/v1/bm3-simpulan-api";
 const root=document.getElementById("root"),modal=document.getElementById("modal-root"),notice=document.getElementById("global-notice");
 const NPC=[
  {x:4,y:3,name:"Elder Rowan",face:"🧙",place:"Old Village",message:"Selamat datang, young explorer! A shadow has scattered the Eight Language Crystals. Help restore them."},
  {x:9,y:3,name:"Luna the Librarian",face:"🧝",place:"Library Lane",message:"The ancient scrolls contain clues. Find the words to uncover the next crystal."},
  {x:5,y:9,name:"Captain Kai",face:"🧑‍✈️",place:"Forest Gate",message:"Brave explorer! The forest spirits need your English wisdom."},
  {x:10,y:13,name:"Mage Asha",face:"🧙‍♀️",place:"Magic Garden",message:"The garden flowers will bloom when you answer my riddles."},
  {x:17,y:3,name:"Renjer Finn",face:"🧑‍🌾",place:"River Valley",message:"You crossed the bridge! The crystals on this side need your help."},
  {x:21,y:5,name:"Professor Pip",face:"👨‍🏫",place:"Clock Tower",message:"My clockwork machine requires the power of precise English."},
  {x:17,y:10,name:"Kesatria Nova",face:"🛡️",place:"Castle Approach",message:"Show your courage and language skills to protect the castle."},
  {x:21,y:13,name:"Crystal Keeper",face:"🧚",place:"Crystal Citadel",message:"The final crystal awaits. Restore all eight and save our world!"}
 ];
 const TREE=new Set(["1,1","2,2","5,1","7,5","2,8","9,10","10,4","3,12","7,13","10,15","14,1","15,6","18,6","20,2","23,6","15,12","19,14","23,15"]);
 const HEROES=[{name:"Pengembara",icon:"🗡️",shirt:"#65cfcb"},{name:"Kesatria",icon:"🛡️",shirt:"#89a7ed"},{name:"Ahli Sihir",icon:"🔮",shirt:"#e69de5"},{name:"Renjer",icon:"🏹",shirt:"#a3df85"}];
 const state={data:null,page:"home",classCode:"",studentId:"",hero:0,player:null,token:null,records:{},progress:null,teacher:null,teacherToken:sessionStorage.getItem("bm3-simpulan-teacher")||null,teacherClass:"",teacherRows:[],teacherUpdated:null,busy:false,px:3,py:5,face:"down",quest:0,question:null,wrongFeedback:"",answerBusy:false,movingUntil:0};
 const h=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
 const number=n=>Number(n||0);
 let toastTimer=null,lastFrame=0;
 function toast(msg){notice.textContent=msg;clearTimeout(toastTimer);toastTimer=setTimeout(()=>notice.textContent="",4100);}
 function show(html){modal.innerHTML=`<div class="modal fantasy-modal" role="dialog" aria-modal="true" aria-label="Adventure dialog"><button type="button" class="close-x" data-act="close-modal" aria-label="Close dialog">×</button><div class="modal-ornament" aria-hidden="true">✦ ✧ ❧</div>${html}</div>`;}
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
  return state.data.classes.map(c=>`<button type="button" class="class-choice ${state.classCode===c.code?"selected":""}" data-act="class" data-class="${h(c.code)}"><b>${h(c.code)}</b><span>${h(c.name)}</span><small>Tahun ${c.year} · ${h(c.level)}</small></button>`).join("");
 }
 function pupilSelect(){
  const pupils=state.data.students.filter(s=>s.classCode===state.classCode);
  return `<option value="">-- PILIH NAMA SENDIRI --</option>`+pupils.map(s=>`<option value="${h(s.id)}" ${state.studentId===s.id?"selected":""}>${h(s.name)}</option>`).join("");
 }
 function renderHome(){
  state.page="home";document.title="Pulau Simpulan Bahasa • Choose Your Class";
  const year=cls()?.year,topics=cls()?.questTopics||[];
  root.innerHTML=`<section class="hero"><div class="panel glow"><p class="eyebrow">DSKP BM TAHUN 3 · SP 4.1.1 (i)</p><h1>PULAU <em>SIMPULAN</em><br>BAHASA</h1><p class="hero-description">Jelajah 8 pulau, berlari dan melompat untuk menewaskan musuh dengan soalan simpulan bahasa Tahun 3 aras tinggi. Kalahkan ketua pulau dan simpan markah secara automatik.</p><div class="inven"><span class="item">🏃 Lari & Lompat</span><span class="item">🐌 Lawan Musuh</span><span class="item">⚔️ 40 Soalan</span><span class="item">🏝️ 8 Pulau</span><span class="item">🏆 XP & Ketua Pulau</span></div><p class="subline" style="margin-top:17px">Pilih nama sendiri daripada senarai kelas 3S. Cikgu Dalman boleh menyemak kemajuan secara automatik.</p></div><div class="hero-art home-world" aria-label="Preview of the side-scrolling island platformer"><canvas id="preview-world" width="1280" height="720" aria-hidden="true"></canvas><div class="home-world-banner">🏝️ PENGEMBARAAN PULAU <span>Lari · Lompat · Kalahkan musuh</span></div></div></section>
  <div class="banner"><h2>✦ MULAKAN PENGEMBARAANMU ✦</h2><p class="muted">Pilih kelas 3 Ibnu Sina, pilih NAMA SENDIRI dan pilih watak.</p></div>
  <section class="columns"><div class="panel"><p class="eyebrow">Langkah 01</p><h2>Pilih kelas</h2><div class="choices">${classSelect()}</div></div>
  <div class="panel"><p class="eyebrow">Langkah 02</p><h2>Pilih NAMA SENDIRI</h2>${state.classCode?`<p class="subline">${h(cls().name)} · ${h(cls().teacher)} · ${h(cls().level)} level</p><label class="field-label" for="student">NAMA MURID KELAS 3S</label><select class="field" id="student">${pupilSelect()}</select><p class="eyebrow">Langkah 03 · Pilih watak</p><div class="avatar-options">${HEROES.map((x,i)=>`<button type="button" class="avatar-btn ${i===state.hero?"selected":""}" data-act="hero" data-hero="${i}" title="${h(x.name)}"><img class="avatar-art" src="${RPGArt.portrait(i,true)}" alt="${h(x.name)}"><span>${h(x.name)}</span></button>`).join("")}</div>${topics.length?`<p class="subline"><strong>Misi DSKP:</strong> ${h([...new Set(topics)].join(" · "))}</p>`:""}<div class="required-message">⚠️ PENTING: Pilih NAMA SENDIRI sahaja. Jangan pilih nama murid lain.</div><button class="btn wide green" data-act="start" ${!state.studentId?"disabled":""}>⚔️ MULA PERMAINAN</button>`:`<p class="muted">Pilih kelas 3S untuk melihat nama murid.</p><div class="required-message">Pilih nama sendiri daripada senarai rasmi sekolah.</div>`}</div></section>`;
  const pv=document.getElementById("preview-world");if(pv)window.EnglishIsland.drawPreview(pv,state.hero);
 }
 function badgeInventory(){
  const n=state.progress?.missionsComplete||0;
  return n?NPC.slice(0,n).map((m,i)=>`<span class="item" title="${h(m.name)}">💎 Crystal ${i+1}</span>`).join(""):`<span class="inventory-note">Complete quests to collect magical crystals.</span>`;
 }
 function unlocked(i){return i===0||(state.progress?.missions[i-1]?.completed===5);}
 function nearby(n){return Math.abs(state.px-n.x)+Math.abs(state.py-n.y)<=2;}
 function renderGame(){
  if(!state.player)return renderHome();
  state.page="platformer";
  document.title="Pulau Simpulan Bahasa · "+state.player.pupil.name;
  window.EnglishIsland.mount({
   name:state.player.pupil.name,
   year:state.player.classInfo.year,
   classCode:state.player.classInfo.code,
   hero:state.hero,progress:state.progress,records:state.records,
   api:(path,body)=>api(path,body,state.token),
   onProgress:(progress,records)=>{state.progress=progress;state.records=records;},
   onExit:()=>leave()
  });
 }
 function tileBlocked(x,y){
  if(x<0||x>=24||y<0||y>=16)return true;
  if(x===12&&y!==7&&y!==8)return true;
  return TREE.has(x+","+y);
 }
 function draw(){
  const el=document.getElementById("world");
  if(!el||state.page!=="game")return;
  const ctx=el.getContext("2d");if(!ctx)return;
  RPGArt.drawWorld(ctx,state,TREE,NPC,unlocked);
 }
  function move(dx,dy){
  if(state.page!=="game"||modal.innerHTML)return;
  const x=state.px+dx,y=state.py+dy;
  if(tileBlocked(x,y)){toast("Blocked! Find a clear path or the wooden bridge.");return;}
  state.px=x;state.py=y;state.face=dx?"side":dy<0?"up":"down";state.movingUntil=performance.now()+240;draw();
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
  show(`<div class="quest-giver"><img class="character-portrait" src="${RPGArt.portrait(who)}" alt="${h(n.name)}"><div><p class="eyebrow">${h(n.place)} · ${h(n.name)}</p><p class="npc-subtitle">✦ THE CRYSTAL KINGDOM ✦</p></div></div><h2>${h(done?"CRYSTAL COMPLETE!":"A NEW QUEST AWAITS")}</h2><div class="speech-bubble">${h(n.message)}</div><h3>${h(state.progress.missions[who].topic)}</h3><p>${done?"You have already earned this crystal. Your XP is saved.":"Answer 5 challenges to restore this crystal and unlock the next part of the world."}</p><div class="modal-actions"><button class="btn outlined" data-act="close-modal">Close</button>${done?`<button class="btn green" data-act="close-modal">💎 Collected</button>`:`<button class="btn green" data-act="begin-quest">⚔️ ACCEPT QUEST</button>`}</div>`);
 }
 function talkNearest(){
  const candidates=NPC.map((n,i)=>({...n,i,dist:Math.abs(n.x-state.px)+Math.abs(n.y-state.py)})).filter(n=>n.dist<=2).sort((a,b)=>a.dist-b.dist);
  if(!candidates.length){toast("Stand next to an NPC. Look for the yellow exclamation mark!");return;}
  talk(candidates[0].i);
 }
 async function loadMisiion(){
  const n=state.quest,year=state.player.classInfo.year;
  const index=Array.from({length:5},(_,i)=>i).find(i=>!state.records[year+"-"+n+"-"+i]?.betul);
  if(index===undefined){
   const done=state.progress.completed===40;
   show(`<h2>${done?"🏆 YOU SAVED THE KINGDOM!":"💎 CRYSTAL RESTORED!"}</h2><p>${done?"All 8 quests and 40 challenges are complete. Congratulations, hero!":"The next crystal is now unlocked. Explore the map to find its keeper."}</p><div class="speech-bubble">✨ +XP & coins saved automatically. Current XP: ${state.progress.xp} · Crystals: ${state.progress.missionsComplete}/8</div><div class="modal-actions"><button class="btn green" data-act="close-modal">🗺️ KEMBALI TO WORLD</button></div>`);
   return;
  }
  loading("Loading quest challenge...");
  try{
   const d=await api("student/question?"+qs({quest:n,index}),undefined,state.token);
   if(d.alreadySolved){const fresh=await api("student/me",undefined,state.token);state.progress=fresh.progress;state.records=fresh.records;renderGame();return loadMisiion();}
   state.question={...d.question,quest:n,index};state.wrongFeedback="";renderMisiion();
  }catch(e){show(`<h2>⚠️ Misi unavailable</h2><p>${h(e.message)}</p><button class="btn" data-act="close-modal">Back</button>`);}
 }
 function renderMisiion(correctAnswer){
  const q=state.question;if(!q)return;
  const passed=!!correctAnswer,details=state.progress.missions[q.quest];
  show(`<div class="quest-giver"><img class="character-portrait" src="${RPGArt.portrait(q.quest)}" alt="${h(NPC[q.quest].name)}"><div><p class="eyebrow">${h(NPC[q.quest].name)} · ${h(q.topic)}</p><p class="npc-subtitle">📜 CRYSTAL QUEST</p></div></div><h2>QUEST ${q.quest+1} · CHALLENGE ${q.index+1}/5</h2>
   <div class="quest-progress">${Array.from({length:5},(_,i)=>`<span class="${i<details.completed?"done":i===q.index?"current":""}"></span>`).join("")}</div>
   <div class="speech-bubble"><strong>${h(q.prompt)}</strong></div>
   ${passed?`<div class="feedback">✅ Correct! Great job, explorer. Your progress has been saved.</div><div class="modal-actions"><button class="btn green" data-act="next-question">➡️ ${q.index===4?"FINISH QUEST":"NEXT CHALLENGE"}</button></div>`:`<p class="subline">Choose the best answer. You can try again if it is wrong.</p>${q.options.map((o,i)=>`<button class="question-option" data-act="answer" data-answer="${h(o)}"><span class="answer-letter">${String.fromCharCode(65+i)}</span><span>${h(o)}</span></button>`).join("")}${state.wrongFeedback?`<div class="feedback wrong">❌ Not yet. ${h(state.wrongFeedback)}</div>`:""}<div class="modal-actions"><button class="btn outlined" data-act="close-modal">Save & return to map</button></div>`}`);
 }
 async function answer(value){
  if(state.answerBusy||!state.question)return;
  state.answerBusy=true;
  const q=state.question;
  try{
   const r=await api("student/answer",{quest:q.quest,index:q.index,answer:value},state.token);
   state.progress=r.progress;state.records=r.records;renderGame();
   if(r.correct){renderMisiion(true);}
   else{state.wrongFeedback=r.hint||"Try a different answer.";renderMisiion(false);}
  }catch(e){toast(e.message);if(e.message.includes("Reload")){try{const fresh=await api("student/me",undefined,state.token);state.progress=fresh.progress;state.records=fresh.records;renderGame();await loadMisiion();}catch{}}}
  finally{state.answerBusy=false;}
 }
 async function start(){
  if(state.busy)return;
  if(!state.classCode||!state.studentId){toast("Pilih nama sendiri sebelum mula bermain.");return;}
  state.busy=true;window.EnglishIsland.prepareLaunch();loading("Menyediakan Pulau Simpulan Bahasa...");
  try{
   const result=await api("student/start",{studentId:state.studentId,classCode:state.classCode});
   state.player=result;state.token=result.token;state.records=result.records;state.progress=result.progress;state.px=3;state.py=5;renderGame();close();
   toast("Selamat bermain di Pulau Simpulan Bahasa, "+result.pupil.name+"! Lari dan lompat untuk mengalahkan musuh.");
  }catch(e){window.EnglishIsland.destroy();close();renderHome();toast(e.message);}finally{state.busy=false;}
 }
 function leave(){window.EnglishIsland.destroy();close();state.player=null;state.token=null;state.records={};state.progress=null;state.studentId="";renderHome();}
 async function openTeacher(){
  close();state.page="teacher";if(!state.teacherToken){renderTeacher();return;}
  try{const d=await api("teacher/me",undefined,state.teacherToken);state.teacher=d.teacher;state.teacherClass=state.teacherClass||d.teacher.classes[0].code;await teacherLoad();}
  catch(e){state.teacherToken=null;state.teacher=null;sessionStorage.removeItem("bm3-simpulan-teacher");renderTeacher();toast("Sila log masuk menggunakan IC yang direkodkan.");}
 }
 function renderTeacher(){
  state.page="teacher";document.title="Pemantauan Guru · Pulau Simpulan Bahasa";
  if(!state.teacher){
   root.innerHTML=`<div class="teacher-heading"><div><p class="eyebrow">Kawasan Khas Guru</p><h1>🛡️ DASHBOARD PEMANTAUAN 3S</h1><p class="muted">Untuk Cikgu Dalman dan pentadbir sahaja.</p></div><button class="btn outlined" data-act="teacher-back">← KEMBALI</button></div><div class="panel teacher-card"><h2>LOG MASUK GURU</h2><p>Masukkan nombor IC 12 digit Cikgu Dalman yang telah direkodkan dalam Supabase.</p><form id="teacher-form"><label class="field-label" for="teacher-ic">No. Kad Pengenalan</label><input class="field" id="teacher-ic" type="password" inputmode="numeric" maxlength="18" autocomplete="off" placeholder="12 digits" required/><button type="submit" class="btn green wide">🔑 LOG MASUK</button></form><p class="tiny muted" style="margin-top:13px">IC disemak oleh pelayan sekolah. IC tidak disimpan dalam browser.</p></div>`;
   return;
  }
  const rows=state.teacherRows||[],started=rows.filter(x=>x.progress.status!=="not-started").length,finished=rows.filter(x=>x.progress.status==="complete").length,done=rows.reduce((n,x)=>n+x.progress.completed,0);
  root.innerHTML=`<div class="teacher-heading"><div><p class="eyebrow">🛡️ Kawasan Guru · Pulau Simpulan Bahasa</p><h1>DASHBOARD PEMANTAUAN 3S</h1><p class="muted">Selamat datang, ${h(state.teacher.name)}. Kemajuan dikemas kini setiap 15 saat.</p></div><div style="display:flex;gap:7px;flex-wrap:wrap"><button class="btn outlined small" data-act="teacher-back">← KEMBALI</button><button class="btn small red" data-act="teacher-logout">LOG KELUAR</button></div></div>
  <section class="panel"><p class="eyebrow">Kelas yang dibenarkan</p><div class="teacher-tabs">${state.teacher.classes.map(c=>`<button class="btn small ${c.code===state.teacherClass?"green":"outlined"}" data-act="teacher-class" data-class="${h(c.code)}">${h(c.code)} · ${h(c.name)}</button>`).join("")}</div>
  <div class="teacher-stats"><div class="teacher-stat"><b>${rows.length}</b><small>MURID</small></div><div class="teacher-stat"><b>${started}</b><small>BERMULA</small></div><div class="teacher-stat"><b>${finished}</b><small>SELESAI</small></div><div class="teacher-stat"><b>${rows.length?Math.round(done/(rows.length*40)*100):0}%</b><small>KEMAJUAN KELAS</small></div></div>
  <div class="teacher-toolbar"><p class="muted tiny">Kemaskini terakhir: ${h(state.teacherUpdated?new Date(state.teacherUpdated).toLocaleString("en-GB"):"Belum dimuat")} · ${h(state.teacherClass)}</p><div style="display:flex;gap:7px"><button class="btn small outlined" data-act="teacher-refresh">↻ SEMAK SEMULA</button><button class="btn small green" data-act="teacher-csv">⬇ MUAT TURUN CSV</button></div></div>
  <div class="table-wrap"><table class="teacher-table"><thead><tr><th>NO.</th><th>MURID</th><th>STATUS</th><th>SOALAN</th><th>CUBAAN PERTAMA</th><th>XP / CRYSTALS</th><th>TERAKHIR SIMPAN</th><th>TINDAKAN</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td><strong>${h(r.name)}</strong></td><td><span class="pill ${h(r.progress.status)}">${h(r.progress.status)}</span></td><td><b>${r.progress.completed}/40</b><div class="progressbar"><span style="width:${r.progress.percent}%"></span></div></td><td>${r.progress.firstTry}/40</td><td>${r.progress.xp} XP<small>${r.progress.missionsComplete}/8 crystals</small></td><td>${h(r.progress.updatedAt?new Date(r.progress.updatedAt).toLocaleString("en-GB"):"—")}</td><td><button class="btn outlined small" data-act="teacher-view" data-student="${h(r.id)}">Lihat</button> <button class="btn red small" data-act="teacher-confirm" data-student="${h(r.id)}">Set Semula</button></td></tr>`).join("")||`<tr><td colspan="8">Tiada murid untuk kelas ini.</td></tr>`}</tbody></table></div><p class="tiny muted" style="margin-top:14px">Cubaan pertama hanya dikira jika jawapan terus betul. Tetapan semula tidak boleh dibatalkan.</p></section>`;
 }
 async function teacherLoad(silent=false){
  if(!state.teacher||!state.teacherClass)return;
  try{const d=await api("teacher/progress?"+qs({classCode:state.teacherClass}),undefined,state.teacherToken);state.teacherRows=d.students;state.teacherUpdated=d.refreshedAt;renderTeacher();}
  catch(e){if(!silent)toast(e.message);if(e.message.toLowerCase().includes("expired")){state.teacher=null;state.teacherToken=null;sessionStorage.removeItem("bm3-simpulan-teacher");}renderTeacher();}
 }
 async function teacherLogin(){
  if(state.busy)return;const input=document.getElementById("teacher-ic"),ic=String(input?.value||"").replace(/[\s-]/g,"");if(!/^\d{12}$/.test(ic)){toast("Masukkan nombor IC 12 digit.");return;}
  if(input)input.value="";state.busy=true;loading("Menyemak akses guru...");
  try{const d=await api("teacher/login",{ic});state.teacher=d.teacher;state.teacherToken=d.token;sessionStorage.setItem("bm3-simpulan-teacher",d.token);state.teacherClass=d.teacher.classes[0].code;close();await teacherLoad();toast("Log masuk berjaya.");}
  catch(e){close();renderTeacher();toast(e.message);}finally{state.busy=false;}
 }
 function teacherView(id){
  const r=state.teacherRows.find(x=>x.id===id);if(!r)return;
  show(`<p class="eyebrow">Perincian misi murid</p><h2>${h(r.name)}</h2><p>${r.progress.completed}/40 betul · ${r.progress.firstTry} cubaan pertama · ${r.progress.xp} XP</p><table class="teacher-mission"><thead><tr><th>QUEST</th><th>TOPIC</th><th>DONE</th><th>FIRST</th></tr></thead><tbody>${r.progress.missions.map((m,i)=>`<tr><td>${i+1}</td><td>${h(m.topic)}</td><td>${m.completed}/5</td><td>${m.firstTry}/5</td></tr>`).join("")}</tbody></table><div class="modal-actions"><button class="btn" data-act="close-modal">Close</button></div>`);
 }
 function teacherConfirm(id){
  const r=state.teacherRows.find(x=>x.id===id);if(!r)return;
  show(`<h2>⚠️ RESET MURID PROGRESS?</h2><p><strong>${h(r.name)}</strong></p><p>Tindakan ini memadam kemajuan 40 soalan, XP dan tahap murid dalam game Simpulan Bahasa SAHAJA. Rekod game lain tidak disentuh.</p><p class="alert">Tindakan tidak boleh dibatalkan. Murid perlu mula semula.</p><div class="modal-actions"><button class="btn outlined" data-act="close-modal">Batal</button><button class="btn red" data-act="teacher-reset" data-student="${h(id)}" data-version="${r.progress.resetVersion}">YA, SET SEMULA</button></div>`);
 }
 async function teacherReset(id,version){
  if(state.busy)return;state.busy=true;loading("Menetapkan semula rekod game BM ini...");
  try{await api("teacher/reset",{studentId:id,expectedResetVersion:version,confirm:true},state.teacherToken);close();await teacherLoad();if(state.player?.pupil.id===id){state.player=null;state.token=null;}toast("Hanya rekod game Simpulan Bahasa murid ini ditetapkan semula.");}
  catch(e){close();toast(e.message);}finally{state.busy=false;}
 }
 async function teacherLogout(){
  try{await api("teacher/logout",{},state.teacherToken);}catch{}
  state.teacher=null;state.teacherToken=null;state.teacherRows=[];sessionStorage.removeItem("bm3-simpulan-teacher");renderTeacher();toast("Telah log keluar.");
 }
 function exportCSV(){
  const rows=[["Pupil","Class","Status","Completed","Total","First try","Wrong attempts","XP","Coins","Crystals","Last saved"],...state.teacherRows.map(x=>[x.name,x.classCode,x.progress.status,x.progress.completed,40,x.progress.firstTry,x.progress.wrong,x.progress.xp,x.progress.coins,x.progress.missionsComplete,x.progress.updatedAt||""])];
  const cell=v=>'"'+String(v??"").replace(/^([=+@-])/,"'$1").replace(/"/g,'""')+'"';
  const csv="\ufeff"+rows.map(r=>r.map(cell).join(",")).join("\r\n"),link=document.createElement("a"),url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));link.href=url;link.download="English-Misi-RPG-"+state.teacherClass+"-2026.csv";link.click();URL.revokeObjectURL(url);
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
  if(act==="begin-quest")await loadMisiion();
  if(act==="answer")await answer(el.dataset.answer);
  if(act==="next-question")await loadMisiion();
  if(act==="teacher-back"){close();if(state.player){state.player=null;window.EnglishIsland.destroy();}renderHome();}
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
 setInterval(()=>{if(state.page==="game"&&document.visibilityState==="visible")draw();},140);
 setInterval(()=>{if(state.page==="teacher"&&state.teacher&&!state.busy&&document.visibilityState==="visible"&&!modal.innerHTML)teacherLoad(true);},15000);
 api("bootstrap").then(d=>{state.data=d;state.classCode="3S";renderHome();if(new URLSearchParams(location.search).get("teacher")==="1")openTeacher();}).catch(e=>{root.innerHTML=`<div class="panel teacher-card"><h2>Pelayan sekolah tidak tersedia</h2><p>${h(e.message)}</p><button class="btn" onclick="location.reload()">Cuba Semula</button></div>`;toast(e.message);});
})();