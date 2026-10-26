import {createClient} from 'npm:@supabase/supabase-js@2.57.4';
import bank from './bank.json' with {type:'json'};

const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
const CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,content-type,apikey,x-client-info','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const MAP=[
 ['3S','3 IBNU SINA',3,'Aras tinggi','Dalman']
] as const;
const TEACHERS={
 Dalman:{id:'e39b6074-9a80-5f00-a864-b2e1fb0ef2c0',name:'DALMAN BIN DASIRON'},
 Asraf:{id:'d69f2851-af80-5786-9bf8-7f7463c68418',name:'MOHD HASRUL ASRAF BIN OTHMAN'}
} as const;
const ADMIN_ID=TEACHERS.Asraf.id;
type Row={student_id:string,reset_version:number,revision:number,records:Record<string,{wrong:number,solved:boolean,firstTry:boolean,solvedAt?:string}>,updated_at:string|null,reset_at?:string|null};
class ApiError extends Error{status:number;constructor(status:number,m:string){super(m);this.status=status;}}
const fail=(code:number,msg:string)=>{throw new ApiError(code,msg);};
const sha=async(v:string)=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)));
const shaHex=async(v:string)=>Array.from(await sha(v),b=>b.toString(16).padStart(2,'0')).join('');
const schoolHash=async(v:string)=>btoa(String.fromCharCode(...await sha(v))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const randomToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
const now=()=>new Date().toISOString();
async function query<T=any>(promise:any):Promise<T>{const {data,error}=await promise;if(error){console.error('BM3 Simpulan Bahasa storage:',error.code);fail(503,'School data service is temporarily unavailable.');}return data as T;}
function result(data:any,status=200){return Response.json(data,{status,headers:CORS});}
function parseToken(req:Request){const m=/^Bearer ([a-f0-9]{64})$/.exec(req.headers.get('authorization')||'');if(!m)fail(401,'Please sign in again.');return m![1];}
async function json(req:Request){if(Number(req.headers.get('content-length')||0)>16000)fail(413,'Request too large.');let data:any;try{data=await req.json();}catch{fail(400,'Invalid JSON body.');}return data||{};}
function strip(q:any,year:number,quest:number,index:number){
 const rotated=[...q.options];
 const seed=year*19+quest*31+index*7;
 for(let i=rotated.length-1;i>0;i--){const j=(seed+i*17)% (i+1);[rotated[i],rotated[j]]=[rotated[j],rotated[i]];}
 return {id:year+'-'+quest+'-'+index,prompt:q.prompt,options:rotated,topic:(bank.grades as any)[year][quest].topic};
}
function score(row:Row|null,year:number){
 const records=row?.records||{};const quests=(bank.grades as any)[year];
 let completed=0,firstTry=0,wrong=0;
 const missions=quests.map((q:any,i:number)=>{
  let done=0,first=0,errors=0;
  for(let j=0;j<q.questions.length;j++){
   const r=records[year+'-'+i+'-'+j];if(r?.solved){done++;completed++;if(r.firstTry){first++;firstTry++;}}
   errors+=r?.wrong||0;wrong+=r?.wrong||0;
  }
  return{topic:q.topic,completed:done,total:q.questions.length,firstTry:first,wrong:errors};
 });
 const xp=completed*25+firstTry*10;
 return {completed,total:40,firstTry,wrong,xp,coins:completed*5,level:Math.floor(xp/100)+1,
   missionsComplete:missions.filter((x:any)=>x.completed===x.total).length,
   status:completed===40?'complete':Object.keys(records).length?'in-progress':'not-started',
   percent:Math.round(completed/40*100),missions,updatedAt:row?.updated_at||null,resetVersion:row?.reset_version||0};
}
function classInfo(m:any){return {code:m[0],name:m[1],year:m[2],level:m[3],teacher:TEACHERS[m[4] as keyof typeof TEACHERS].name,questTopics:(bank.grades as any)[m[2]].map((x:any)=>x.topic)};}
async function roster(){
 const session=await query<any>(db.from('academic_sessions').select('id').eq('year',2026).limit(1).maybeSingle());if(!session)fail(503,'2026 school session is missing.');
 const classes=await query<any[]>(db.from('classes').select('id,code').eq('session_id',session.id).in('code',MAP.map(m=>m[0])));
 const ids=classes.map(c=>c.id);
 const enrol=ids.length?await query<any[]>(db.from('student_enrolments').select('student_id,class_id').eq('session_id',session.id).eq('is_current',true).in('class_id',ids)):[];
 const pupilIds=[...new Set(enrol.map(e=>e.student_id))];
 const students=pupilIds.length?await query<any[]>(db.from('students').select('id,full_name,active').in('id',pupilIds)):[];
 const classById=new Map(classes.map(c=>[c.id,c.code]));const studentById=new Map(students.filter(s=>s.active).map(s=>[s.id,s.full_name]));
 const list=enrol.filter(e=>studentById.has(e.student_id)).map(e=>({id:e.student_id,name:studentById.get(e.student_id),classCode:classById.get(e.class_id)})).filter(e=>MAP.some(m=>m[0]===e.classCode));
 list.sort((a,b)=>a.classCode.localeCompare(b.classCode)||String(a.name).localeCompare(String(b.name)));
 return list;
}
async function pupilRow(id:string){
 await query(db.from('bm3_simpulan_progress').upsert({student_id:id},{onConflict:'student_id',ignoreDuplicates:true}));
 return await query<Row>(db.from('bm3_simpulan_progress').select('*').eq('student_id',id).single());
}
async function studentSession(req:Request){
 const token=parseToken(req),session=await query<any>(db.from('bm3_simpulan_student_sessions').select('student_id,reset_version,expires_at').eq('token_hash',await shaHex(token)).gt('expires_at',now()).maybeSingle());
 if(!session)fail(401,'Student session has expired.');
 const row=await pupilRow(session.student_id);if(row.reset_version!==session.reset_version)fail(401,'Progress was reset by your teacher. Please start again.');
 const names=await roster();const pupil=names.find(s=>s.id===session.student_id);if(!pupil)fail(403,'Student is no longer enrolled in this class.');
 const cls=MAP.find(m=>m[0]===pupil.classCode)!;
 return{row,pupil,cls,token};
}
async function teacherSession(req:Request){
 const token=parseToken(req),hash=await shaHex(token);
 const session=await query<any>(db.from('bm3_simpulan_teacher_sessions').select('teacher_id,expires_at').eq('token_hash',hash).gt('expires_at',now()).maybeSingle());if(!session)fail(401,'Sesi guru telah tamat. Sila log masuk semula.');
 const profile=Object.values(TEACHERS).find(t=>t.id===session.teacher_id);if(!profile)fail(403,'Guru tidak dibenarkan mengakses rekod ini.');
 const active=await query<any>(db.from('teachers').select('active').eq('id',profile.id).maybeSingle());if(!active?.active)fail(403,'Teacher is not active.');
 return{token,hash,profile,classes:MAP.filter(m=>profile.id===ADMIN_ID||TEACHERS[m[4] as keyof typeof TEACHERS].id===profile.id).map(classInfo)};
}
function unlocked(records:Row['records'],year:number,quest:number){
 if(quest===0)return true;for(let j=0;j<5;j++)if(!records[year+'-'+(quest-1)+'-'+j]?.solved)return false;return true;
}
async function route(req:Request,path:string){
 if(path==='health'&&req.method==='GET')return result({ok:true,service:'Simpulan Bahasa Tahun 3 SKSA',questionCount:40});
 if(path==='bootstrap'&&req.method==='GET')return result({school:'SK SUNGAI ABONG',classes:MAP.map(classInfo),students:await roster()});
 if(path==='student/start'&&req.method==='POST'){
  const body=await json(req),names=await roster(),p=names.find(s=>s.id===body.studentId&&s.classCode===body.classCode);
  if(!p)fail(400,'Pilih nama sendiri dalam kelas 3S.');
  const cls=MAP.find(m=>m[0]===p.classCode)!,row=await pupilRow(p.id),token=randomToken();
  await query(db.from('bm3_simpulan_student_sessions').insert({token_hash:await shaHex(token),student_id:p.id,reset_version:row.reset_version,expires_at:new Date(Date.now()+30*86400000).toISOString()}));
  return result({token,pupil:p,classInfo:classInfo(cls),progress:score(row,cls[2]),records:row.records});
 }
 if(path==='student/me'&&req.method==='GET'){
  const s=await studentSession(req);return result({pupil:s.pupil,classInfo:classInfo(s.cls),progress:score(s.row,s.cls[2]),records:s.row.records});
 }
 if(path==='student/question'&&req.method==='GET'){
  const s=await studentSession(req),url=new URL(req.url),quest=Number(url.searchParams.get('quest')),index=Number(url.searchParams.get('index'));
  if(!Number.isInteger(quest)||quest<0||quest>=8||!Number.isInteger(index)||index<0||index>=5)fail(400,'Unknown quest.');
  if(!unlocked(s.row.records,s.cls[2],quest))fail(403,'Complete the earlier mission first.');
  const id=s.cls[2]+'-'+quest+'-'+index;
  if(s.row.records[id]?.solved)return result({alreadySolved:true,progress:score(s.row,s.cls[2])});
  return result({question:strip((bank.grades as any)[s.cls[2]][quest].questions[index],s.cls[2],quest,index),attempts:s.row.records[id]?.wrong||0});
 }
 if(path==='student/answer'&&req.method==='POST'){
  const s=await studentSession(req),b=await json(req),quest=Number(b.quest),index=Number(b.index),answer=b.answer;
  if(!Number.isInteger(quest)||quest<0||quest>=8||!Number.isInteger(index)||index<0||index>=5||typeof answer!=='string'||answer.length>150)fail(400,'Invalid answer.');
  if(!unlocked(s.row.records,s.cls[2],quest))fail(403,'Complete earlier missions first.');
  const id=s.cls[2]+'-'+quest+'-'+index,question=(bank.grades as any)[s.cls[2]][quest].questions[index],previous=s.row.records[id];
  if(previous?.solved)return result({correct:true,alreadySolved:true,progress:score(s.row,s.cls[2]),records:s.row.records});
  const correct=answer===question.answer;const records={...s.row.records,
   [id]:{wrong:(previous?.wrong||0)+(correct?0:1),solved:correct,firstTry:correct&&!(previous?.wrong),...(correct?{solvedAt:now()}:{})}};
  const changed=await query<any[]>(db.from('bm3_simpulan_progress').update({records,revision:s.row.revision+1,updated_at:now()}).eq('student_id',s.pupil.id).eq('revision',s.row.revision).eq('reset_version',s.row.reset_version).select('*'));
  if(!changed.length)fail(409,'Your progress changed. Reload your adventure.');
  return result({correct,hint:correct?'Syabas, jawapan tepat!':question.hint,progress:score(changed[0],s.cls[2]),records:changed[0].records});
 }
 if(path==='teacher/login'&&req.method==='POST'){
  const b=await json(req),ic=String(b.ic||'').replace(/[\s-]/g,'');
  if(!/^\d{12}$/.test(ic))fail(401,'Invalid IC number.');
  const icHash=await schoolHash(ic),ipHash=await shaHex(req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')||'unknown');
  const allowed=await query<boolean>(db.rpc('bm3_simpulan_login_slot',{ic_hash:icHash,ip_hash:ipHash}));
  if(!allowed)fail(429,'Too many attempts. Try again later.');
  const profile=await query<any>(db.from('teachers').select('id,full_name,active').eq('identification_hash',icHash).eq('active',true).maybeSingle());
  const access=Object.values(TEACHERS).find(t=>t.id===profile?.id);if(!access)fail(401,'Nombor IC tidak sah atau tiada akses kelas 3S.');
  const token=randomToken();
  await query(db.from('bm3_simpulan_teacher_sessions').insert({token_hash:await shaHex(token),teacher_id:access.id,expires_at:new Date(Date.now()+8*3600000).toISOString()}));
  return result({token,teacher:{id:access.id,name:access.name,classes:MAP.filter(m=>access.id===ADMIN_ID||TEACHERS[m[4] as keyof typeof TEACHERS].id===access.id).map(classInfo)}});
 }
 if(path==='teacher/me'&&req.method==='GET'){const t=await teacherSession(req);return result({teacher:{id:t.profile.id,name:t.profile.name,classes:t.classes}});}
 if(path==='teacher/logout'&&req.method==='POST'){const t=await teacherSession(req);await query(db.from('bm3_simpulan_teacher_sessions').delete().eq('token_hash',t.hash));return result({ok:true});}
 if(path==='teacher/progress'&&req.method==='GET'){
  const t=await teacherSession(req),code=new URL(req.url).searchParams.get('classCode')||'';
  if(!t.classes.some(c=>c.code===code))fail(403,'You cannot view this class.');
  const pupils=(await roster()).filter(p=>p.classCode===code),m=MAP.find(m=>m[0]===code)!;
  const rows=pupils.length?await query<Row[]>(db.from('bm3_simpulan_progress').select('*').in('student_id',pupils.map(s=>s.id))):[];
  const mapped=new Map(rows.map(r=>[r.student_id,r]));
  return result({classCode:code,refreshedAt:now(),students:pupils.map(p=>({...p,progress:score(mapped.get(p.id)||null,m[2])}))});
 }
 if(path==='teacher/reset'&&req.method==='POST'){
  const t=await teacherSession(req),b=await json(req),p=(await roster()).find(p=>p.id===b.studentId);
  if(!p||!t.classes.some(c=>c.code===p.classCode))fail(403,'You cannot reset this pupil.');
  if(b.confirm!==true)fail(400,'Explicit confirmation required.');
  const row=await pupilRow(p.id);
  if(b.expectedResetVersion!==row.reset_version)fail(409,'Progress reset state changed. Refresh first.');
  const updated=await query<any[]>(db.from('bm3_simpulan_progress').update({records:{},reset_version:row.reset_version+1,revision:row.revision+1,updated_at:null,reset_at:now()}).eq('student_id',p.id).eq('revision',row.revision).eq('reset_version',row.reset_version).select('student_id'));
  if(!updated.length)fail(409,'Record changed. Try again.');
  await query(db.from('bm3_simpulan_student_sessions').delete().eq('student_id',p.id));
  return result({ok:true});
 }
 fail(404,'Unknown route.');
}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
 try{
  const path=new URL(req.url).pathname.split('/bm3-simpulan-api/')[1]||'health';
  if(!['GET','POST'].includes(req.method))fail(405,'Method not allowed.');
  return await route(req,path);
 }catch(e:any){const status=e instanceof ApiError?e.status:500;if(status===500)console.error('BM3 Simpulan Bahasa API unexpected error',e?.message||e);return result({error:status===500?'Unexpected server error.':e.message},status);}
});