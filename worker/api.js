/* The build embeds the existing game and the validated class roster here. */
/* EMBED_GAME */
/* EMBED_SCHOOL_LOGO */
/* EMBED_ROSTER */
/* EMBED_CONTENT */
/* EMBED_MODEL */
/* EMBED_ACCESS */

const STUDENT_IDS=new Set(ROSTER.students.map(s=>s.id));
const TEACHER_COOKIE='__Host-grammar_teacher';
let schoolLogoBytes;
function logoBytes(){
 if(!schoolLogoBytes){
  const binary=atob(SCHOOL_LOGO_BASE64);
  schoolLogoBytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)schoolLogoBytes[i]=binary.charCodeAt(i);
 }
 return schoolLogoBytes;
}
function json(data,status=200,headers={}){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});}
function problem(message,status=400,code='BAD_REQUEST',extra={}){return json({error:message,code,...extra},status);}
const teacherCookie=(token='',seconds=0)=>`${TEACHER_COOKIE}=${token}; Path=/; Max-Age=${seconds}; Secure; HttpOnly; SameSite=None; Partitioned`;
function teacherToken(request){const match=(request.headers.get('Cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(TEACHER_COOKIE+'='));const token=match?.slice(TEACHER_COOKIE.length+1)||'';return /^[a-f0-9]{64}$/.test(token)?token:null;}
class AuthError extends Error{constructor(status,message){super(message);this.status=status;}}
function permittedTeacher(env,id){return (env.TEACHER_ACCESS||TEACHER_ACCESS).find(t=>t.id===id);}
function teacherProfile(env,user){const access=permittedTeacher(env,user?.id);return access?{id:user.id,name:user.full_name,classes:access.classes.map(code=>classByCode(code))}:null;}
async function spbt(request,env,payload,token=null){
 try{if(!env.AUTH)throw new Error('School service is not configured.');return await env.AUTH(payload,token,request.headers.get('cf-connecting-ip')||request.headers.get('x-client-ip')||'shared');}
 catch(e){if(e.status===429)throw new AuthError(429,'Too many sign-in attempts. Please try again in 15 minutes.');if(e.status===401||e.status===403)throw new AuthError(401,'The IC number or teacher session is not valid.');throw new AuthError(503,'The school login service could not be reached. Please try again.');}
}
async function remoteTeacherAuth(env,payload,token,ip){
 const login=payload.action==='login',logout=payload.action==='logout',path=login?'/api/teacher/login':logout?'/api/teacher/logout':'/api/teacher/me';
 const headers=new Headers({'Content-Type':'application/json','x-client-ip':ip});if(token)headers.set('Cookie',TEACHER_COOKIE+'='+token);
 const r=await fetch(env.GRAMMARCRAFT_API_URL+path,{method:login||logout?'POST':'GET',headers,redirect:'manual',signal:AbortSignal.timeout(15000),body:login?JSON.stringify({ic:payload.ic}):logout?'{}':undefined});
 if(r.status>=300&&r.status<400)throw new Error('School sign-in redirected.');const data=await r.json();if(!r.ok){const e=new Error(data.error||'School sign-in failed.');e.status=r.status;throw e;}
 if(logout)return{ok:true};if(!data.teacher||(!login&&!data.isTeacher)){const e=new Error('Session expired.');e.status=401;throw e;}
 const user={id:data.teacher.id,full_name:data.teacher.name};if(!login)return{user};
 const issued=(r.headers.get('Set-Cookie')||'').match(/__Host-grammar_teacher=([a-f0-9]{64})/)?.[1];if(!issued)throw new Error('Invalid teacher session.');return{user,token:issued};
}
async function teacherIdentity(request,env){const token=teacherToken(request);if(!token)return null;
 try{const data=await spbt(request,env,{action:'bootstrap'},token);return teacherProfile(env,data.user);}catch(e){if(e.status===401)return null;throw e;}
}
async function body(request){const raw=await request.text();if(raw.length>65536)throw new Error('BODY_TOO_LARGE');let b;try{b=JSON.parse(raw)}catch{throw new Error('INVALID_JSON')}if(!b||typeof b!=='object'||Array.isArray(b))throw new Error('INVALID_JSON');return b;}
const hash=async token=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),b=>b.toString(16).padStart(2,'0')).join('');
const randomToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
async function ensureRow(db,id){await db.prepare('INSERT INTO game_progress (student_id) VALUES (?1) ON CONFLICT(student_id) DO NOTHING').bind(id).run();return db.prepare('SELECT * FROM game_progress WHERE student_id = ?1').bind(id).first();}
function fromRow(row){let p;try{p=JSON.parse(row.progress_json)}catch{p={}}return ProgressModel.clean(row.student_id,p,row.reset_version);}
function snapshot(row){return{progress:fromRow(row),resetVersion:row.reset_version,revision:row.revision,updatedAt:row.updated_at,resetAt:row.reset_at};}
async function saveMerged(db,row,incoming){
 const p=ProgressModel.merge(row.student_id,fromRow(row),incoming,row.reset_version);p.updatedAt=new Date().toISOString();
 const result=await db.prepare('UPDATE game_progress SET progress_json = ?1, revision = revision + 1, updated_at = ?2 WHERE student_id = ?3 AND revision = ?4 AND reset_version = ?5').bind(JSON.stringify(p),p.updatedAt,row.student_id,row.revision,row.reset_version).run();
 return result.meta?.changes===1?db.prepare('SELECT * FROM game_progress WHERE student_id = ?1').bind(row.student_id).first():null;
}
async function session(request,db){const auth=request.headers.get('Authorization')||'',token=auth.startsWith('Bearer ')?auth.slice(7):'';if(!/^[a-f0-9]{64}$/.test(token))return null;
 const s=await db.prepare('SELECT student_id, reset_version, expires_at FROM game_sessions WHERE token_hash = ?1').bind(await hash(token)).first();return s&&Date.parse(s.expires_at)>Date.now()?s:null;}
function teacherRow(student,row){const progress=row?fromRow(row):ProgressModel.clean(student.id,{});return{studentId:student.id,fullName:student.full_name,classCode:student.classCode,resetVersion:row?.reset_version||0,revision:row?.revision||0,lastSaved:row?.updated_at||null,resetAt:row?.reset_at||null,...ProgressModel.score(progress)};}
export default{
 async fetch(request,env){
  if(env.GRAMMARCRAFT_API_URL&&env.LOCAL_PROGRESS==='true'){const source=env;env={...env,AUTH:(payload,token,ip)=>remoteTeacherAuth(source,payload,token,ip)};}
  const url=new URL(request.url),path=url.pathname;
  if(path==='/assets/school-logo.png'){
   if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
   const bytes=request.method==='HEAD'?null:logoBytes();
   return new Response(bytes,{headers:{'Content-Type':'image/png','Cache-Control':url.searchParams.has('v')?'public, max-age=31536000, immutable':'public, max-age=86400','X-Content-Type-Options':'nosniff'}});
  }
  if(path==='/'||path==='/index.html')return new Response(GAME_HTML,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  if(!path.startsWith('/api/'))return problem('Page not found.',404,'NOT_FOUND');
  if(request.method!=='GET'&&request.method!=='POST')return problem('Method not allowed.',405,'METHOD_NOT_ALLOWED');
  if(request.method==='POST'){const origin=request.headers.get('Origin');if(origin&&origin!==url.origin)return problem('This request is not allowed.',403,'WRONG_ORIGIN');}
  if(env.GRAMMARCRAFT_API_URL&&env.LOCAL_PROGRESS!=='true'){
   const headers=new Headers({'Content-Type':'application/json'});for(const key of ['Cookie','Authorization']){const v=request.headers.get(key);if(v)headers.set(key,v);}headers.set('x-client-ip',request.headers.get('cf-connecting-ip')||request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'shared');
   try{const r=await fetch(env.GRAMMARCRAFT_API_URL+path+url.search,{method:request.method,headers,redirect:'manual',signal:AbortSignal.timeout(20000),body:request.method==='POST'?await request.arrayBuffer():undefined});if(r.status>=300&&r.status<400)return problem('The school service is unavailable.',503,'SERVICE_REDIRECT');return new Response(r.body,{status:r.status,headers:r.headers});}catch{return problem('The school service could not be reached.',503,'SERVICE_UNAVAILABLE');}
  }
  if(path==='/api/teacher/login'&&request.method==='POST'){
   try{const b=await body(request),ic=typeof b.ic==='string'?b.ic.replace(/[\s-]/g,''):'';if(!/^\d{12}$/.test(ic))return problem('Enter your 12-digit IC number.',400,'INVALID_IC');
    const data=await spbt(request,env,{action:'login',ic});
    if(!permittedTeacher(env,data.user?.id)){if(/^[a-f0-9]{64}$/.test(data.token||'')){try{await spbt(request,env,{action:'logout'},data.token)}catch{}}return problem('This IC is not authorised for the GrammarCraft teacher dashboard.',403,'TEACHER_NOT_ALLOWED');}
    if(!/^[a-f0-9]{64}$/.test(data.token||''))return problem('Sign-in could not be completed. Please try again.',503,'INVALID_SESSION');
    return json({ok:true,teacher:teacherProfile(env,data.user)},200,{'Set-Cookie':teacherCookie(data.token,8*3600)});
   }catch(e){if(e.message==='INVALID_JSON')return problem('Enter your IC number and try again.',400,'INVALID_JSON');if(e.message==='BODY_TOO_LARGE')return problem('The request is too large.',413,'BODY_TOO_LARGE');return problem(e.message,e.status||503,'SIGN_IN_FAILED');}
  }
  if(path==='/api/teacher/logout'&&request.method==='POST'){const token=teacherToken(request);if(token){try{await spbt(request,env,{action:'logout'},token)}catch{}}return json({ok:true},200,{'Set-Cookie':teacherCookie()});}

  let teacher=null;
  if(path.startsWith('/api/teacher/')){try{teacher=await teacherIdentity(request,env)}catch(e){return problem(e.message,e.status||503,'TEACHER_VERIFICATION_UNAVAILABLE');}}
  if(path==='/api/teacher/me'&&request.method==='GET')return json({isTeacher:!!teacher,teacher},200,!teacher&&teacherToken(request)?{'Set-Cookie':teacherCookie()}:{});
  if(path.startsWith('/api/teacher/')&&!teacher)return json({error:'Sign in with your registered IC number to continue.',code:'TEACHER_REQUIRED'},401,{'Set-Cookie':teacherCookie()});
  const db=env.DB;
  if(!db)return problem('Progress storage is not ready. Try again soon.',503,'STORAGE_UNAVAILABLE');
  try{
   if(path==='/api/health'&&request.method==='GET'){await db.prepare('SELECT revision FROM game_progress LIMIT 1').first();return json({ready:true});}
   if(path==='/api/student/start'&&request.method==='POST'){
    const b=await body(request),id=b.studentId;if(!STUDENT_IDS.has(id)||b.classCode!==studentById(id)?.classCode)return problem('Choose a name from your selected class.',400,'INVALID_STUDENT');
    let row=await ensureRow(db,id);
    if(b.localProgress&&((b.knownResetVersion===undefined&&row.reset_version===0)||b.knownResetVersion===row.reset_version)){
     for(let attempt=0;attempt<3;attempt++){const updated=await saveMerged(db,row,b.localProgress);if(updated){row=updated;break;}const latest=await ensureRow(db,id);if(latest.reset_version!==row.reset_version){row=latest;break;}row=latest;}
    }
    const token=randomToken(),expires=new Date(Date.now()+24*3600000).toISOString();
    await db.prepare('DELETE FROM game_sessions WHERE student_id = ?1 AND expires_at < ?2').bind(id,new Date().toISOString()).run();
    await db.prepare('INSERT INTO game_sessions (token_hash, student_id, reset_version, expires_at) VALUES (?1, ?2, ?3, ?4)').bind(await hash(token),id,row.reset_version,expires).run();
    return json({token,expiresAt:expires,...snapshot(row)});
   }
   if((path==='/api/student/progress'||path==='/api/student/poll')&&request.method==='POST'){
    const s=await session(request,db);if(!s)return problem('Reconnect to save your progress.',401,'SESSION_EXPIRED');
    const row=await ensureRow(db,s.student_id);
    if(row.reset_version!==s.reset_version)return problem('Your teacher reset this progress.',409,'RESET_CHANGED',snapshot(row));
    if(path==='/api/student/poll')return json(snapshot(row));
    const b=await body(request);if(!b.progress||b.progress.studentId!==s.student_id||b.progress.version!==1)return problem('This progress belongs to a different player.',400,'INVALID_PROGRESS');
    if(b.resetVersion!==row.reset_version||b.progress.resetVersion!==row.reset_version)return problem('Your teacher reset this progress.',409,'RESET_CHANGED',snapshot(row));
    if(b.revision!==row.revision)return problem('New progress is available.',409,'REVISION_MISMATCH',snapshot(row));
    const updated=await saveMerged(db,row,b.progress);
    if(!updated){const latest=await ensureRow(db,s.student_id);return problem('New progress is available.',409,latest.reset_version!==s.reset_version?'RESET_CHANGED':'REVISION_MISMATCH',snapshot(latest));}
    return json(snapshot(updated));
   }
   if(path==='/api/teacher/progress'&&request.method==='GET'){
    const code=url.searchParams.get('classCode')||teacher.classes[0].code;if(!teacher.classes.some(c=>c.code===code))return problem('This class is not assigned to your teacher account.',403,'CLASS_NOT_ALLOWED');const pupils=ROSTER.students.filter(s=>s.classCode===code),result=env.SCOPED_DB?await db.prepare('SELECT * FROM game_progress WHERE student_id IN CLASS').bind(...pupils.map(s=>s.id)).all():await db.prepare('SELECT * FROM game_progress').all(),rows=new Map((result.results||[]).map(r=>[r.student_id,r]));
    return json({classCode:code,className:classByCode(code).name,students:pupils.map(s=>teacherRow(s,rows.get(s.id))),refreshedAt:new Date().toISOString()});
   }
   if(path==='/api/teacher/reset'&&request.method==='POST'){
    const b=await body(request);if(!teacher.classes.some(c=>c.code===studentById(b.studentId)?.classCode))return problem('This pupil is not in your assigned classes.',403,'CLASS_NOT_ALLOWED');if(!STUDENT_IDS.has(b.studentId)||!Number.isInteger(b.expectedResetVersion)||b.confirm!==true)return problem('Choose a pupil and confirm the reset.',400,'RESET_CONFIRM_REQUIRED');
    const row=await ensureRow(db,b.studentId),now=new Date().toISOString();
    if(row.reset_version!==b.expectedResetVersion)return problem('This pupil was already reset. Refresh the dashboard.',409,'RESET_CONFLICT');
    const result=await db.prepare('UPDATE game_progress SET progress_json = ?1, reset_version = reset_version + 1, revision = revision + 1, updated_at = NULL, reset_at = ?2 WHERE student_id = ?3 AND reset_version = ?4').bind('{}',now,b.studentId,b.expectedResetVersion).run();
    if(result.meta?.changes!==1)return problem('The reset changed. Refresh the dashboard.',409,'RESET_CONFLICT');
    return json({ok:true,studentId:b.studentId,...snapshot(await ensureRow(db,b.studentId))});
   }
   if(path==='/api/teacher/import'&&request.method==='POST'){
    const b=await body(request);if(!Array.isArray(b.progress)||b.progress.length>ROSTER.students.length)return problem('Invalid practice data.');
    let imported=0,skipped=0;
    for(const p of b.progress){if(!STUDENT_IDS.has(p?.studentId)||!teacher.classes.some(c=>c.code===studentById(p.studentId)?.classCode)||p.version!==1){skipped++;continue;}let row=await ensureRow(db,p.studentId);if(!((p.resetVersion===undefined&&row.reset_version===0)||p.resetVersion===row.reset_version)){skipped++;continue;}
     let done=false;for(let i=0;i<3;i++){const update=await saveMerged(db,row,p);if(update){imported++;done=true;break;}const next=await ensureRow(db,p.studentId);if(next.reset_version!==row.reset_version)break;row=next;}if(!done)skipped++;
    }
    return json({imported,skipped});
   }
   return problem('Page not found.',404,'NOT_FOUND');
  }catch(e){if(e.message==='BODY_TOO_LARGE')return problem('Progress data is too large.',413,'BODY_TOO_LARGE');if(e.message==='INVALID_JSON')return problem('The request could not be read.',400,'INVALID_JSON');return problem('Progress could not be saved right now. Try again.',503,'TEMPORARILY_UNAVAILABLE');}
 }
};
