(function EnglishIslandPlatformer(){
"use strict";
const art=window.IslandArt;
const W=art.W,H=art.H,G=art.G,L=art.PULAU_LENGTH;
const E=[620,1280,1860,2550,3380];
const KINDS=["snail","crab","bird","boar"];
const PULAU_INFO=[["PANTAI CERIA","Cari maksud tersirat dan kenal pasti sikap terpuji dalam cerita."],["RIMBA KELAPA","Fahami perasaan watak melalui simpulan bahasa."],["LEMBAH AIR TERJUN","Buktikan kebolehan mentafsir konteks dalam situasi pembelajaran."],["KOTA PURBA","Kenal sikap watak melalui tindakan dan dialog."],["BANJARAN GUNUNG","Huraikan tanggungjawab keluarga dan masyarakat."],["TAMAN AWAN","Cari jalan keluar apabila berhadapan cabaran."],["HUTAN BULAN","Teliti bukti untuk memilih simpulan bahasa yang paling tepat."],["KUBU PERMATA","Pertarungan akhir! Gunakan pemahaman dalam pelbagai situasi."]];
const SKINS=["Explorer","Knight","Wizard","Ranger"];
const CONFIG={maxStep:.032,runSpeed:355,jump:-875,gravity:2250};
let app=null,st=null,keys=new Set(),animation=0,prev=0,held={left:false,right:false},heldJump=false,launching=false;
const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
function stageData(index){
 const gaps=[{x:900,w:140},{x:2110,w:158},{x:2875,w:148}];
 const platforms=[
  {x:370,y:442,w:190},{x:785,y:455,w:135},{x:1080,y:420,w:210},
  {x:1560,y:440,w:190},{x:1995,y:440,w:120},{x:2380,y:437,w:160},
  {x:2755,y:418,w:120},{x:3070,y:460,w:150}
 ];
 const checkpoint=1780;
 const obstacles=[{x:1460,w:54,h:38},{x:2635,w:52,h:44}];
 const pickups=[];
 for(let j=0;j<36;j++){
  const x=220+j*96+(j%4)*8;if(gaps.some(g=>x>g.x-30&&x<g.x+g.w+20))continue;
  pickups.push({x,y:G-(j%3===0?160:j%3===1?113:67),type:j%9===0?"pineapple":j%3===0?"banana":"coin",taken:false});
 }
 const enemies=E.map((x,i)=>({id:i,x,kind:i===4?KINDS[(index+2)%4]:KINDS[(i+index)%4],defeated:false,boss:i===4}));
 return{index,gaps,platforms,checkpoint,obstacles,pickups,enemies};
}
function gameDom(){
 return `<div class="island-rotor"><div class="island-stage">
  <canvas id="island-canvas" width="${W}" height="${H}" aria-label="Side-scrolling English island adventure. Move and jump to confront enemies."></canvas>
  <div class="island-hud" id="island-hud">
   <div class="island-logo"><span>🏝️ BAHASA MELAYU</span><b>SIMPULAN BAHASA</b></div>
   <div class="island-hearts" aria-label="Health">♥ ♥ ♥</div>
   <div class="island-hero-info">🧑 <span id="island-player-label">HERO</span><b id="island-xp">⭐ XP 0</b></div>
   <div class="island-stage-chip"><span id="island-stage-number">PULAU 1 / 8</span><b id="island-stage-label">SUNNY SHORE</b></div>
   <div class="island-coin">🪙 <b id="island-coins">0</b></div>
   <div class="island-fruit">🍌 <b id="island-fruit">0</b></div>
   <button type="button" class="island-top-button" data-island="music" title="Sound" aria-label="Toggle sounds">🔊</button>
   <button type="button" class="island-top-button" data-island="pause" title="Pause" aria-label="Pause game">Ⅱ</button>
  </div>
  <div class="island-meter"><div class="island-meter-fill" id="island-meter-fill"></div><span id="island-meter-label">0 / 40 CABARAN</span></div>
  <div class="island-tutorial-chip" id="island-tutorial-chip">← → / A D LARI &nbsp; · &nbsp; SPACE / ↑ / W LOMPAT</div>
  <div class="island-touch-controls">
   <div class="island-move-pad"><button type="button" data-island-hold="left" aria-label="Move left">◀</button><button type="button" data-island-hold="right" aria-label="Move right">▶</button></div>
   <button type="button" class="island-jump-button" data-island-hold="jump" aria-label="Jump"><span>⬆</span><small>LOMPAT</small></button>
  </div>
  <div id="island-toast" class="island-toast" aria-live="polite"></div>
  <div id="island-dialog" class="island-dialog" role="dialog" aria-modal="true" aria-label="Adventure options"></div>
  <div class="island-creator-credit" aria-label="Permainan dibina oleh Cikgu Asraf"><span>✦ GAME DIBINA OLEH ✦</span><strong>CIKGU ASRAF</strong><small>SK SUNGAI ABONG · YEAR <span id="island-year">1</span> · <span id="island-class">CLASS</span></small></div>
  </div></div>`;
}
function by(id){return app?.querySelector("#"+id);}
function message(textValue,ms=2500){
 const el=by("island-toast");if(!el)return;
 el.textContent=textValue;el.classList.add("visible");clearTimeout(st?.toastTimeout);
 if(st)st.toastTimeout=setTimeout(()=>el?.classList.remove("visible"),ms);
}
function modal(html,type=""){
 const el=by("island-dialog");if(!el)return;
 el.innerHTML=`<div class="island-dialog-backdrop"></div><div class="island-dialog-box ${type}"><div class="island-modal-stars" aria-hidden="true">✦ ★ ✦</div>${html}</div><div class="island-overlay-credit">© CIKGU ASRAF</div>`;
 el.classList.add("open");releaseControls();
}
function hideModal(){const d=by("island-dialog");if(d){d.classList.remove("open");d.innerHTML="";}}
function questSummary(){return `${st.progress.completed} / ${st.progress.total||40} challenges · ${st.progress.missionsComplete}/8 stages`;}
function hud(){
 if(!st)return;
 const p=st.progress,t=art.THEMES[st.stage.index];
 by("island-player-label").textContent=st.name.slice(0,14);
 by("island-xp").textContent="XP "+p.xp;
 by("island-stage-number").textContent=`PULAU ${st.stage.index+1} / 8`;
 by("island-stage-label").textContent=t.name.toUpperCase();
 by("island-coins").textContent=st.coins;
 by("island-fruit").textContent=st.fruit;
 by("island-year").textContent=st.year;
 by("island-class").textContent=st.classCode;
 by("island-meter-fill").style.width=`${Math.min(100,(p.completed/40)*100)}%`;
 by("island-meter-label").textContent=`${p.completed} / 40 SOALAN`;
}
function startPosition(stageIndex){
 const miss=st.progress.missions[stageIndex];
 let solved=Math.min(5,Number(miss?.completed||0));
 for(let i=0;i<5;i++)st.stage.enemies[i].defeated=i<solved;
 const at=solved?Math.max(105,E[solved-1]+110):115;
 return Math.min(at,L-170);
}
function launchStage(index){
 if(!st)return;
 const stageIndex=Math.max(0,Math.min(7,index));
 st.stage=stageData(stageIndex);
 st.player={x:0,y:G,prevY:G,vx:0,vy:0,grounded:true,coyote:.1,facing:1,hero:st.hero};
 st.player.x=startPosition(stageIndex);
 st.camera=Math.max(0,Math.min(L-W,st.player.x-345));
 st.frame=0;st.sparks=[];
 st.phase="intro";hud();
 modal(`<div class="island-heading">🏝️ PULAU ${stageIndex+1} / 8</div>
 <h1>${esc(art.THEMES[stageIndex].name.toUpperCase())}</h1>
 <p>${esc(PULAU_INFO[stageIndex][1])}</p>
 <div class="island-topic">📚 ${esc(st.progress.missions[stageIndex]?.topic||"Misi Simpulan Bahasa")}</div>
 <div class="island-instructions">
  <div><strong>💻 LAPTOP / PC</strong><span>← → atau A / D untuk berlari</span><span>Space / ↑ / W untuk melompat</span><span>1–4 untuk memilih jawapan · Enter untuk mengesahkan</span><span>Esc untuk berhenti sementara</span></div>
  <div><strong>📱 TELEFON</strong><span>Gunakan ◀ ▶ untuk bergerak</span><span>Tekan LOMPAT untuk melompat</span><span>Game akan melintang selepas START</span><span>Jika perlu, pusingkan telefon</span></div>
 </div>
 <p class="island-important">⚔️ Berlari dan melompat! Apabila bertemu musuh, jawab soalan simpulan bahasa aras tinggi. Jawapan salah diberi petunjuk dan boleh dicuba semula.</p>
 <div class="island-dialog-actions"><button class="island-primary" data-island="continue">▶ MULA BERMAIN</button><button class="island-secondary" data-island="exit">⌂ MENU UTAMA</button></div>`,"intro");
}
function renderQuiz(){
 if(!st?.question)return;
 const q=st.question;const letters=["A","B","C","D"];
 modal(`<div class="island-enemy-title">⚔️ CABARAN MUSUH!</div>
 <div class="island-quiz-header"><span>PULAU ${st.stage.index+1} · MUSUH ${q.index+1}/5</span><span>📘 ${esc(q.topic)}</span></div>
 <div class="island-enemy-panel">
  <div class="island-enemy-image">${q.index===4?"👹":q.enemy.kind==="snail"?"🐌":q.enemy.kind==="crab"?"🦀":q.enemy.kind==="bird"?"🦅":"🐗"}</div>
  <div><strong>${q.index===4?"KETUA PULAU":q.enemy.kind.toUpperCase()}</strong><small>Kalahkan musuh dengan jawapan yang tepat!</small><span class="island-enemy-health">♥ ♥ ♥</span></div>
 </div>
 <div class="island-question">${esc(q.prompt)}</div>
 <p class="island-answer-tip">Pilih jawapan paling tepat. Tekan 1–4 atau sentuh pilihan.</p>
 <div class="island-answers">${q.options.map((o,i)=>`<button type="button" class="island-answer ${st.selection===i?"chosen":""}" data-island="answer" data-answer-index="${i}" ${st.answerBusy?"disabled":""}><span>${letters[i]}</span><b>${esc(o)}</b></button>`).join("")}</div>
 ${st.wrongHint?`<div class="island-feedback wrong">❌ Belum tepat! ${esc(st.wrongHint)} <br>Cuba lagi sehingga betul untuk mengalahkan musuh.</div>`:""}
 ${st.answerBusy?`<div class="island-saving">☁️ Menyemak dan menyimpan jawapan...</div>`:`<div class="island-quiz-bottom">🔒 Masa dibekukan semasa menjawab. Tiada penalti nyawa.</div>`}`,"quiz");
}
function quizError(error){
 st.phase="quiz";st.answerBusy=false;st.wrongHint="Pelayan sekolah belum dapat mengesahkan jawapan: "+error+". Cuba semula selepas internet pulih.";renderQuiz();
}
async function showEnemy(index){
 if(!st||st.phase!=="running")return;
 const enemy=st.stage.enemies[index];if(!enemy||enemy.defeated)return;
 releaseControls();st.player.vx=0;st.player.vy=0;st.player.y=G;st.player.grounded=true;
 st.player.x=Math.min(st.player.x,enemy.x-62);
 st.currentEnemy=index;st.phase="fetch";st.question=null;st.wrongHint="";st.selection=0;st.answerBusy=false;
 modal(`<div class="island-enemy-title">⚔️ MUSUH APPROACHING!</div><h2>Bersedia menjawab soalan simpulan bahasa...</h2><p>Memuatkan soalan Tahun ${st.year} dengan selamat.</p><div class="island-spinner">📜</div>`,"loading");
 try{
  const result=await st.api(`student/question?quest=${st.stage.index}&index=${index}`);
  if(!st||st.phase!=="fetch")return;
  if(result.alreadySolved){
   enemy.defeated=true;st.phase="running";hideModal();message("Soalan telah diselesaikan. Teruskan perjalanan!");return;
  }
  st.question={...result.question,enemy,index};st.phase="quiz";renderQuiz();
 }catch(e){if(!st)return;st.phase="network-error";modal(`<h2>⚠️ SAMBUNGAN TERPUTUS</h2><p>${esc(e.message)}</p><p>Jawapan yang sudah disimpan kekal selamat. Sambung internet dan cuba lagi.</p><div class="island-dialog-actions"><button class="island-primary" data-island="retry-question">↻ CUBA SEMULA</button><button class="island-secondary" data-island="exit">⌂ MENU UTAMA</button></div>`,"error");}
}
async function submitAnswer(index){
 if(!st||st.phase!=="quiz"||st.answerBusy)return;
 if(!Number.isInteger(index)||index<0||index>3)return;
 st.selection=index;const q=st.question;
 st.answerBusy=true;renderQuiz();
 try{
  const oldXp=st.progress.xp;
  const res=await st.api("student/answer",{quest:st.stage.index,index:q.index,answer:q.options[index]});
  if(!st)return;
  if(res.progress){st.progress=res.progress;st.records=res.records;st.onProgress?.(res.progress,res.records);}
  st.answerBusy=false;hud();
  if(res.correct){
   const e=st.stage.enemies[q.index];e.defeated=true;
   st.phase="defeat";st.question=null;hideModal();
   for(let j=0;j<34;j++)st.sparks.push({x:e.x+(Math.random()-.5)*70,y:G-45+(Math.random()-.5)*70,vx:(Math.random()-.5)*310,vy:-Math.random()*180-60,life:1,color:["#fff3a9","#f4be70","#aef5dd","#ffdbe7"][j%4]});
   playSound("victory");
   message(`✨ MUSUH DEFEATED! +${Math.max(0,st.progress.xp-oldXp)} XP · Jawapan telah disimpan!`,1700);
   st.resumeAt=performance.now()+1250;
   st.defeatedEnemy=q.index;
  }else{
   st.wrongHint=res.hint||"Teliti cerita dan pilih simpulan bahasa yang sesuai.";
   playSound("wrong");renderQuiz();
  }
 }catch(e){
  if(!st)return;
  st.answerBusy=false;
  // On revision conflicts, return to the server's authoritative question.
  if(String(e.message).includes("Reload")||String(e.message).includes("changed")){
   st.phase="running";hideModal();message("Rekod berubah. Memuat semula soalan...");
   await showEnemy(q.index);
  }else quizError(e.message);
 }
}
function stageClear(){
 if(!st||st.phase==="victory"||st.phase==="cleared")return;
 st.phase="cleared";releaseControls();playSound("stage");
 const final=st.progress.completed===40;
 modal(`<div class="island-heading">${final?"🏆 JUARA SIMPULAN BAHASA!":"⭐ PULAU CLEARED!"}</div>
 <h1>${final?"TAHNIAH, 8 PULAU BERJAYA!":"KETUA MUSUH BERJAYA DIKALAHKAN!"}</h1>
 <p>${final?"Syabas! Kamu berjaya menyelesaikan kesemua 40 soalan simpulan bahasa.":"Hebat! Kamu telah menewaskan 5 musuh dan membuka pulau baharu."}</p>
 <div class="island-clear-stats"><div><b>${st.progress.completed}/40</b><small>CABARAN SOLVED</small></div><div><b>${st.progress.xp}</b><small>JUMLAH XP</small></div><div><b>${st.progress.missionsComplete}/8</b><small>PULAUS CLEAR</small></div></div>
 <p class="island-important">☁️ Markah dan kemajuan disimpan secara automatik untuk semakan Cikgu Dalman.</p>
 <div class="island-dialog-actions">${final?`<button class="island-primary" data-island="exit">🏡 KEMBALI KE MENU</button>`:`<button class="island-primary" data-island="next-stage">🚀 PULAU SETERUSNYA →</button>`}<button class="island-secondary" data-island="exit">⌂ MENU UTAMA</button></div>`,"win");
}
function pause(){
 if(!st)return;
 if(st.phase==="running"){
  st.phase="paused";
  modal(`<div class="island-heading">⏸ PERMAINAN DIJEDA</div><h1>REHAT SEBENTAR</h1><p>${esc(art.THEMES[st.stage.index].name)} · ${questSummary()}</p>
  <div class="island-instructions"><div><strong>KEYBOARD</strong><span>← → atau A D = LARI</span><span>Space / ↑ / W = LOMPAT</span><span>1–4 = PILIH JAWAPAN</span></div><div><strong>SKRIN SENTUH</strong><span>Tahan ◀ ▶ untuk bergerak</span><span>Tekan LOMPAT</span><span>Sentuh jawapan ketika bertemu musuh</span></div></div>
  <div class="island-dialog-actions"><button class="island-primary" data-island="continue">▶ SAMBUNG MAIN</button><button class="island-secondary" data-island="exit">⌂ MENU UTAMA</button></div>`,"pause");
 }else if(st.phase==="paused"){st.phase="running";hideModal();}
}
function releaseControls(){held.left=held.right=false;heldJump=false;keys.clear();}
function doJump(){
 if(!st||st.phase!=="running")return;
 const p=st.player;
 if(p.grounded||p.coyote>0){
   p.vy=CONFIG.jump;p.grounded=false;p.coyote=0;playSound("jump");
 }
}
function gapUnder(x){return st.stage.gaps.some(g=>x>=g.x+5&&x<=g.x+g.w-5);}
function respawn(){
 const p=st.player,progress=st.progress.missions[st.stage.index],done=progress?.completed||0;
 p.x=Math.max(115,done?E[Math.min(4,done-1)]+100:115);
 if(gapUnder(p.x))p.x-=150;
 p.y=G;p.vy=0;p.vx=0;p.grounded=true;p.coyote=.1;st.camera=Math.max(0,p.x-320);
 playSound("fall");message("🌊 SPLASH! Kembali ke checkpoint. Rekod simpulan bahasa selamat.",2600);
}
function physics(dt){
 if(!st||st.phase!=="running")return;
 const p=st.player,dir=(held.right||keys.has("arrowright")||keys.has("d")?1:0)-(held.left||keys.has("arrowleft")||keys.has("a")?1:0);
 p.vx=dir*CONFIG.runSpeed;if(dir)p.facing=dir;
 const oldX=p.x,oldY=p.y;
 p.x=Math.max(36,Math.min(L-55,p.x+p.vx*dt));
 // Low obstacles require jumping; they cannot be bypassed just by walking.
 for(const ob of st.stage.obstacles){
  const x0=ob.x,y0=G-ob.h;
  if(p.x+19>ob.x&&p.x-19<ob.x+ob.w&&p.y>y0+4&&p.y-102<G&&oldX!==p.x){
   p.x=oldX;p.vx=0;
  }
 }
 if(p.grounded)p.coyote=.10;else p.coyote=Math.max(0,p.coyote-dt);
 p.vy=Math.min(1250,p.vy+CONFIG.gravity*dt);
 p.y+=p.vy*dt;
 p.grounded=false;
 const left=p.x-14,right=p.x+14;
 // Determine platform collisions only when falling onto a surface.
 let land=Infinity;
 if(!gapUnder(p.x)&&oldY<=G+4&&p.y>=G&&p.vy>=0)land=G;
 for(const platform of st.stage.platforms){
  if(right>platform.x+6&&left<platform.x+platform.w-6&&oldY<=platform.y+4&&p.y>=platform.y&&p.vy>=0)land=Math.min(land,platform.y);
 }
 for(const ob of st.stage.obstacles){
  if(right>ob.x+5&&left<ob.x+ob.w-5&&oldY<=G-ob.h+4&&p.y>=G-ob.h&&p.vy>=0)land=Math.min(land,G-ob.h);
 }
 if(land<Infinity){p.y=land;p.vy=0;p.grounded=true;p.coyote=.1;}
 if(p.y>H+145){respawn();return;}
 for(const pickup of st.stage.pickups){
  if(pickup.taken)continue;
  if(Math.abs(p.x-pickup.x)<38&&Math.abs((p.y-55)-pickup.y)<62){
   pickup.taken=true;
   if(pickup.type==="coin")st.coins+=1;
   else st.fruit+=pickup.type==="pineapple"?3:1;
   if(st.pickupSoundFrame!==Math.floor(st.frame/12)){playSound("coin");st.pickupSoundFrame=Math.floor(st.frame/12);}
   hud();
  }
 }
 // Each of the five enemies is an unavoidable language gate.
 for(const enemy of st.stage.enemies){
  if(enemy.defeated)continue;
  if(p.x+23>=enemy.x-45&&p.x<enemy.x+60){showEnemy(enemy.id);return;}
 }
 if(p.x>=L-150&&st.stage.enemies.every(e=>e.defeated)){stageClear();return;}
}
function frame(time){
 if(!st)return;
 const dt=prev?Math.min(CONFIG.maxStep,(time-prev)/1000):0;prev=time;
 if(st.phase==="running")physics(dt);
 else if(st.phase==="defeat"&&time>=st.resumeAt){
   st.phase="running";
   if(st.defeatedEnemy===4){message("🏆 KETUA MUSUH KALAH! Pergi ke bendera penamat!",2600);}
 }
 st.frame++;
 if(st.sparks.length){
   for(const s of st.sparks){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=500*dt;s.life-=dt*1.15;}
   st.sparks=st.sparks.filter(x=>x.life>0);
 }
 // Smoothed side-scrolling camera follows player's path.
 const target=Math.max(0,Math.min(L-W,st.player.x-390));
 st.camera+=Math.max(-450*dt,Math.min(450*dt,(target-st.camera)*Math.min(1,dt*6)));
 const can=by("island-canvas");
 if(can){const c=can.getContext("2d");if(c)art.drawScene(c,st.stage.index,st.stage,st.camera,time,st.player,st.stage.enemies,st.stage.pickups,st.sparks);}
 animation=requestAnimationFrame(frame);
}
function playSound(type){
 if(!st||st.muted)return;
 try{
  st.audio=st.audio||new (window.AudioContext||window.webkitAudioContext)();
  const context=st.audio;if(context.state==="suspended")context.resume();
  const notes={jump:[320,480],coin:[650,890],victory:[400,590,850],wrong:[220,190],fall:[240,170],stage:[500,620,740,1040]}[type]||[400];
  notes.forEach((freq,i)=>{
   const osc=context.createOscillator(),gain=context.createGain(),at=context.currentTime+i*.085;
   osc.type=type==="wrong"?"sawtooth":"square";osc.frequency.setValueAtTime(freq,at);
   gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.055,at+.012);
   gain.gain.exponentialRampToValueAtTime(.0001,at+.13);
   osc.connect(gain);gain.connect(context.destination);osc.start(at);osc.stop(at+.15);
  });
 }catch{}
}
function activate(action,button){
 if(!st)return;
 if(action==="continue"){if(st.phase==="intro"||st.phase==="paused"){st.phase="running";hideModal();message("🏝️ Lari, lompat dan hadapi musuh pertama!",1600);}}
 if(action==="pause")pause();
 if(action==="music"){st.muted=!st.muted;button.textContent=st.muted?"🔇":"🔊";}
 if(action==="exit"){const callback=st.onExit;destroy();callback?.();}
 if(action==="retry-question"){st.phase="running";hideModal();showEnemy(st.currentEnemy);}
 if(action==="answer")submitAnswer(Number(button.dataset.answerIndex));
 if(action==="next-stage"){const index=st.stage.index+1;hideModal();launchStage(index);}
}
function pointerHold(event){
 if(!st||st.phase!=="running")return;
 event.preventDefault();
 const el=event.currentTarget,key=el.dataset.islandHold;
 el.setPointerCapture?.(event.pointerId);
 if(key==="jump"){heldJump=true;doJump();}
 else held[key]=true;
 el.classList.add("down");
}
function releaseHold(event){
 const el=event.currentTarget,key=el.dataset.islandHold;
 if(key==="jump")heldJump=false;else held[key]=false;
 el.classList.remove("down");
}
function onKeyboardDown(ev){
 if(!st)return;
 const target=ev.target;
 if(["INPUT","TEXTAREA","SELECT"].includes(target?.tagName))return;
 const k=ev.key.toLowerCase();
 if(["arrowleft","arrowright","arrowup"," ","a","d","w","escape","enter","1","2","3","4"].includes(k))ev.preventDefault();
 if(k==="escape"){if(st.phase==="running"||st.phase==="paused")pause();return;}
 if(st.phase==="quiz"){
  if(["1","2","3","4"].includes(k)){st.selection=Number(k)-1;submitAnswer(st.selection);}
  else if(k==="arrowdown"||k==="arrowright"){st.selection=(st.selection+1)%4;renderQuiz();}
  else if(k==="arrowup"||k==="arrowleft"){st.selection=(st.selection+3)%4;renderQuiz();}
  else if(k==="enter"){submitAnswer(st.selection);}
  return;
 }
 if(k==="enter"){
  const visible=app.querySelector('.island-dialog.open [data-island="continue"],.island-dialog.open [data-island="next-stage"]');
  if(visible)visible.click();
  return;
 }
 if(st.phase!=="running")return;
 if(!keys.has(k)&&[" ","arrowup","w"].includes(k))doJump();
 keys.add(k);
}
function onKeyboardUp(ev){keys.delete(ev.key.toLowerCase());}
function onBlur(){releaseControls();if(st?.phase==="running")pause();}
function drawPreview(canvas,heroIndex=0){
 if(!canvas)return;
 const s=stageData(0),ctx=canvas.getContext("2d");if(!ctx)return;
 s.enemies=s.enemies.map((e,i)=>({...e,x:380+i*210}));
 art.drawScene(ctx,0,s,0,performance.now(),{x:250,y:G,vx:50,vy:0,grounded:true,hero:heroIndex,facing:1},s.enemies,s.pickups,[]);
}
function prepareLaunch(){
 if(app)destroy();
 app=document.createElement("div");app.id="island-game";
 app.innerHTML=`<div class="island-rotor"><div class="island-load"><div class="island-load-palm">🏝️</div><h2>PULAU SIMPULAN BAHASA</h2><p>Memuatkan permainan dan menyediakan paparan melintang...</p></div></div>`;
 document.body.appendChild(app);document.body.classList.add("island-active");
 launching=true;
 // Fullscreen and rotation permission must be requested inside the START tap event.
 try{
   if(app.requestFullscreen){const promise=app.requestFullscreen({navigationUI:"hide"});promise?.then(()=>screen.orientation?.lock?.("landscape")).catch(()=>{});}
 }catch{}
 // CSS rotates the entire playable landscape in portrait browsers, including iOS Safari.
}
function mount(config){
 if(!app)prepareLaunch();
 const progress=config.progress,records=config.records;
 const pending=progress.missions.findIndex(m=>m.completed<5);
 st={api:config.api,onExit:config.onExit,onProgress:config.onProgress,progress,records,hero:config.hero||0,
 name:config.name,year:config.year,classCode:config.classCode,coins:0,fruit:0,phase:"loading",stage:null,
 player:null,frame:0,camera:0,question:null,selection:0,wrongHint:"",answerBusy:false,
 currentEnemy:0,resumeAt:0,defeatedEnemy:0,sparks:[],muted:false,audio:null,toastTimeout:null};
 launching=false;app.innerHTML=gameDom();
 for(const button of app.querySelectorAll("[data-island-hold]")){
  button.addEventListener("pointerdown",pointerHold);button.addEventListener("pointerup",releaseHold);
  button.addEventListener("pointercancel",releaseHold);button.addEventListener("lostpointercapture",releaseHold);
  button.addEventListener("contextmenu",e=>e.preventDefault());
 }
 app.addEventListener("click",onAction);
 window.addEventListener("keydown",onKeyboardDown,{capture:true});window.addEventListener("keyup",onKeyboardUp,{capture:true});
 window.addEventListener("blur",onBlur);
 if(pending===-1){
  launchStage(7);st.stage.enemies.forEach(e=>e.defeated=true);st.phase="running";stageClear();
 }else launchStage(pending);
 prev=0;animation=requestAnimationFrame(frame);
}
function onAction(e){const btn=e.target.closest("[data-island]");if(!btn||!app?.contains(btn))return;e.preventDefault();activate(btn.dataset.island,btn);}
function destroy(){
 cancelAnimationFrame(animation);animation=0;releaseControls();
 window.removeEventListener("keydown",onKeyboardDown,{capture:true});window.removeEventListener("keyup",onKeyboardUp,{capture:true});window.removeEventListener("blur",onBlur);
 clearTimeout(st?.toastTimeout);try{st?.audio?.close();}catch{}
 if(app){const element=app;app=null;element.remove();}
 document.body.classList.remove("island-active");
 if(document.fullscreenElement){document.exitFullscreen?.().catch(()=>{});}
 try{screen.orientation?.unlock?.();}catch{}
 st=null;launching=false;prev=0;
}
window.EnglishIsland={prepareLaunch,mount,destroy,drawPreview,get active(){return!!st;}};
})();