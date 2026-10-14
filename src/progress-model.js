/* Shared client/server validation. Mission IDs and the v1 save format stay stable. */
const ProgressModel=(()=>{
 const avatars=new Set(['explorer','boy','girl','knight']);
 const date=v=>typeof v==='string'&&Number.isFinite(Date.parse(v))?v:null;
 const integer=(v,max=500)=>Number.isInteger(v)&&v>=0?Math.min(max,v):0;
 function clean(studentId,raw={},forcedVersion){
  if(!raw||raw.version!==1||raw.studentId!==studentId)raw={};
  const p={version:1,studentId,avatar:avatars.has(raw.avatar)?raw.avatar:'explorer',records:{},drafts:{},updatedAt:date(raw.updatedAt)};
  if(Number.isInteger(forcedVersion)&&forcedVersion>=0)p.resetVersion=forcedVersion;
  else if(Number.isInteger(raw.resetVersion)&&raw.resetVersion>=0)p.resetVersion=raw.resetVersion;
  for(const m of missionsFor(studentId))for(let i=0;i<m.tasks.length;i++){
   const key=m.id+':'+i,q=raw.records?.[key];if(!q||typeof q!=='object')continue;
   const wrong=integer(q.wrongAttempts),correct=q.correct===true,hints=q.hintsUsed===true;
   p.records[key]={correct,wrongAttempts:wrong,hintsUsed:hints,firstTry:correct&&q.firstTry===true&&wrong===0&&!hints,solvedAt:correct?date(q.solvedAt):null};
  }
  for(const m of missionsFor(studentId)){const d=raw.drafts?.[m.id];if(!d||!Number.isInteger(d.index)||d.index<0||d.index>=m.tasks.length||!Array.isArray(d.chosen)||p.records[m.id+':'+d.index]?.correct)continue;
   p.drafts[m.id]={index:d.index,chosen:[...new Set(d.chosen.filter(i=>Number.isInteger(i)&&i>=0&&i<(m.tasks[d.index].words?.length||0)))]};
  }
  return p;
 }
 function merge(studentId,previous,incoming,resetVersion){
  const old=clean(studentId,previous,resetVersion),fresh=clean(studentId,incoming,resetVersion),p=clean(studentId,fresh,resetVersion);
  for(const m of missionsFor(studentId))for(let i=0;i<m.tasks.length;i++){
   const k=m.id+':'+i,a=old.records[k],b=fresh.records[k];if(!a&&!b)continue;
   if(a?.correct){p.records[k]={...a};continue;}
   if(!b){p.records[k]={...a};continue;}
   const wrong=Math.max(a?.wrongAttempts||0,b.wrongAttempts),hints=Boolean(a?.hintsUsed||b.hintsUsed);
   p.records[k]={...b,wrongAttempts:wrong,hintsUsed:hints,firstTry:b.correct&&b.firstTry&&wrong===0&&!hints};
  }
  for(const m of missionsFor(studentId)){const d=p.drafts[m.id];if(d&&p.records[m.id+':'+d.index]?.correct)delete p.drafts[m.id];}
  return p;
 }
 function score(progress){let completed=0,firstTry=0,hints=0,wrong=0,started=false,reasoningCompleted=0,reasoningFirstTry=0;const bank=missionsFor(progress?.studentId),missions=bank.map(m=>{
   let done=0,first=0,help=0,errors=0,reasoningDone=0,reasoningFirst=0;for(let i=0;i<m.tasks.length;i++){const q=progress?.records?.[m.id+':'+i];if(!q)continue;if(q.correct){done++;if(q.firstTry)first++;if(m.tasks[i].kbat===true){reasoningDone++;if(q.firstTry)reasoningFirst++;}}if(q.hintsUsed)help++;errors+=q.wrongAttempts||0;if(q.correct||q.hintsUsed||q.wrongAttempts>0)started=true;}
   reasoningCompleted+=reasoningDone;reasoningFirstTry+=reasoningFirst;completed+=done;firstTry+=first;hints+=help;wrong+=errors;return{id:m.id,title:m.title,topic:m.topic,completed:done,total:m.tasks.length,firstTry:first,hints:help,wrong:errors,reasoningTotal:m.tasks.filter(t=>t.kbat===true).length,reasoningCompleted:reasoningDone,reasoningFirstTry:reasoningFirst};
  });const total=bank.reduce((n,m)=>n+m.tasks.length,0);return{completed,total,firstTry,hints,wrong,reasoningTotal:bank.flatMap(m=>m.tasks).filter(t=>t.kbat===true).length,reasoningCompleted,reasoningFirstTry,xp:completed*20+firstTry*10,percent:Math.round(completed/total*100),missionsComplete:missions.filter(m=>m.completed===m.total).length,status:completed===total?'complete':started?'in-progress':'not-started',missions};
 }
 return{clean,merge,score};
})();
