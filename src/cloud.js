/* Per-player sync with revision checks and teacher reset protection. */
const CloudGame=(()=>{
 let token=null,playerId=null,revision=0,version=0,nonce=0,timer=null,pollTimer=null,busy=false,dirty=false,connecting=false;
 let status='local';
 const supported=()=>typeof fetch==='function'&&typeof location!=='undefined'&&/^https?:$/.test(location.protocol);
 const copy=p=>JSON.parse(JSON.stringify(p));
 const fingerprint=p=>JSON.stringify({avatar:p.avatar,records:p.records,drafts:p.drafts});
 const current=(id,n)=>state.student?.id===id&&n===nonce;
 function text(){return status==='saved'?'Saved for your teacher':status==='saving'?'Saving your progress…':status==='connecting'?'Connecting to your teacher…':status==='offline'?'Offline — progress kept on this device':'Progress saved on this device';}
 function setStatus(next){status=next;document.querySelectorAll?.('[data-sync-status]').forEach(el=>{el.textContent=text();});}
 async function request(path,payload,useToken=false){const headers={'Content-Type':'application/json'};if(useToken)headers.Authorization='Bearer '+token;const r=await fetch(path,{method:'POST',headers,credentials:'same-origin',body:JSON.stringify(payload),keepalive:true});let d;try{d=await r.json()}catch{throw new Error('Network unavailable')}return{ok:r.ok,status:r.status,data:d};}
 function store(progress){state.progress=progress;state.avatar=progress.avatar;safeWrite(SAVE_PREFIX+progress.studentId,JSON.stringify(progress));}
 function adopt(data,forceReset=false){
  const local=state.progress,id=state.student.id,compatible=(local.resetVersion===undefined&&data.resetVersion===0)||local.resetVersion===data.resetVersion;
  const p=!forceReset&&compatible?ProgressModel.merge(id,data.progress,local,data.resetVersion):ProgressModel.clean(id,data.progress,data.resetVersion);
  p.updatedAt=data.updatedAt||data.progress.updatedAt||null;store(p);revision=data.revision;version=data.resetVersion;
  if(forceReset||!compatible){state.chosen=[];state.feedback=null;state.placement=null;state.hintOpen=false;if(state.page==='mission')state.page='map';toast('Your teacher reset this progress. You can start again.');}
  render();return fingerprint(p)!==fingerprint(data.progress);
 }
 async function start(showLoading=false){
  if(!supported()||!state.student)return;
  clearTimeout(timer);token=null;playerId=state.student.id;const id=playerId,n=++nonce;connecting=true;busy=false;dirty=false;setStatus('connecting');
  const finish=showLoading?GameLoader.begin('Opening your saved adventure…'):()=>{};
  const local=copy(state.progress);
  try{const result=await request('/api/student/start',{studentId:id,classCode:state.classCode,knownResetVersion:local.resetVersion,localProgress:local});if(!current(id,n))return;if(!result.ok)throw new Error(result.data.error);
   token=result.data.token;const unsaved=adopt(result.data);setStatus('saved');connecting=false;if(unsaved){dirty=true;queue();}
  }catch{if(!current(id,n))return;connecting=false;setStatus('offline');}finally{finish();}
 }
 function queue(){if(!supported()||!state.student)return;dirty=true;if(connecting||busy)return;if(!token){setStatus('offline');return;}setStatus('saving');clearTimeout(timer);timer=setTimeout(flush,250);}
 async function flush(){
  if(!token||busy||!dirty||state.student?.id!==playerId)return;busy=true;dirty=false;const id=playerId,n=nonce,p=copy(state.progress);
  const finish=GameLoader.begin('Saving your progress…',{blocking:false,minimum:350});
  try{const result=await request('/api/student/progress',{progress:p,resetVersion:version,revision},true);if(!current(id,n))return;
   if(result.ok){if(adopt(result.data))dirty=true;setStatus(dirty?'saving':'saved');}
   else if(result.data.code==='RESET_CHANGED'){adopt(result.data,true);token=null;busy=false;await start();return;}
   else if(result.data.code==='REVISION_MISMATCH'){adopt(result.data);dirty=true;setStatus('saving');}
   else if(result.status===401){busy=false;await start();return;}
   else throw new Error(result.data.error);
  }catch{if(current(id,n)){dirty=true;setStatus('offline');}}
  finally{finish();if(current(id,n)){busy=false;if(dirty&&status!=='offline')queue();}}
 }
 async function poll(){
  if(!supported()||!state.student||state.page==='teacher'||document.visibilityState==='hidden'||busy||connecting)return;
  if(!token){await start();return;}if(dirty){await flush();return;}
  const id=playerId,n=nonce;try{const r=await request('/api/student/poll',{},true);if(!current(id,n))return;
   if(r.data.code==='RESET_CHANGED'){adopt(r.data,true);token=null;await start();return;}
   if(r.status===401){await start();return;}
   if(!r.ok)throw new Error();if(r.data.revision!==revision){if(adopt(r.data))queue();}setStatus('saved');
  }catch{if(current(id,n))setStatus('offline');}
 }
 function stop(){nonce++;token=null;playerId=null;dirty=false;busy=false;connecting=false;clearTimeout(timer);setStatus('local');}
 function resetLocal(id,data){const p=ProgressModel.clean(id,data.progress,data.resetVersion);p.updatedAt=null;safeWrite(SAVE_PREFIX+id,JSON.stringify(p));if(state.student?.id===id){stop();store(p);state.chosen=[];state.feedback=null;state.placement=null;start();}}
 function init(){if(!supported())return;pollTimer=setInterval(poll,15000);window.addEventListener('online',()=>{if(state.student)start();});window.addEventListener('offline',()=>setStatus('offline'));}
 return{text,start,queue,flush,poll,stop,resetLocal,init,supported};
})();
