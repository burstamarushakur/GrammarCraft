/* One shared loader: full screen for opening pages, a small badge for saves. */
const GameLoader=(()=>{
 const root=document.getElementById('game-loader');
 const message=document.getElementById('loader-message');
 const target=document.getElementById('app');
 const jobs=new Map();
 let sequence=0;
 const canPaint=()=>typeof requestAnimationFrame==='function';
 const now=()=>typeof performance!=='undefined'?performance.now():Date.now();
 const painted=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 function update(){
  const visible=[...jobs.values()].filter(job=>job.visible);
  const foreground=visible.filter(job=>job.blocking);
  const current=foreground.at(-1)||visible.at(-1);
  const blocking=foreground.length>0;
  if(target){target.inert=blocking;target.setAttribute?.('aria-busy',String(blocking));}
  if(!root)return;
  root.hidden=!current;
  root.setAttribute?.('aria-hidden',String(!current));
  if(!current){root.classList.remove('is-compact');return;}
  if(current.blocking)root.classList.remove('is-compact');else root.classList.add('is-compact');
  if(message)message.textContent=current.message;
 }
 function begin(label,{blocking=true,delay=0,minimum=280}={}){
  const id=++sequence;
  const job={message:label,blocking,visible:delay===0,started:now(),minimum,timer:null};
  jobs.set(id,job);
  if(delay)job.timer=setTimeout(()=>{if(jobs.has(id)){job.visible=true;job.started=now();update();}},delay);
  update();
  let finished=false;
  return()=>{
   if(finished)return;
   finished=true;
   clearTimeout(job.timer);
   const wait=job.visible&&canPaint()?Math.max(0,job.minimum-(now()-job.started)):0;
   const remove=()=>{jobs.delete(id);update();};
   if(wait)setTimeout(remove,wait);else remove();
  };
 }
 async function run(label,operation,options){
  const finish=begin(label,options);
  try{if(canPaint())await painted();return await operation();}
  finally{finish();}
 }
 function blocked(){return [...jobs.values()].some(job=>job.visible&&job.blocking);}
 function transition(label,operation,options){
  if(blocked())return;
  if(!canPaint())return operation();
  return run(label,operation,options).catch(()=>{if(typeof toast==='function')toast('Could not open this part. Please try again.');});
 }
 const finishBoot=begin('Loading GrammarCraft…',{minimum:320});
 function ready(){if(canPaint())painted().then(finishBoot);else finishBoot();}
 return{begin,run,transition,blocked,ready};
})();
