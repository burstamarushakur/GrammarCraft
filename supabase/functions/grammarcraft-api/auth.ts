export const shaBytes=async(value:string)=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
export const shaHex=async(value:string)=>Array.from(await shaBytes(value),b=>b.toString(16).padStart(2,'0')).join('');
const schoolHash=async(value:string)=>btoa(String.fromCharCode(...await shaBytes(value))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
function denied(status=401,message='The IC number or teacher session is not valid.'){const error:any=new Error(message);error.status=status;throw error;}
export function schoolAuth(client:any,access:any[]){
 const ids=access.map(t=>t.id);
 async function checked(query:any){const {data,error}=await query;if(error)denied(503,'School sign-in is unavailable.');return data;}
 return async(payload:any,token:string|null,ip:string)=>{
  const now=new Date().toISOString();
  if(payload.action==='login'){
   const ic=typeof payload.ic==='string'?payload.ic.replace(/[\s-]/g,''):'';if(!/^\d{12}$/.test(ic))denied();
   const icHash=await schoolHash(ic),ipHash=await shaHex(ip);
   if(!await checked(client.rpc('grammarcraft_login_slot',{ic_hash:icHash,ip_hash:ipHash})))denied(429,'Too many sign-in attempts.');
   const user=await checked(client.from('teachers').select('id,full_name').in('id',ids).eq('active',true).eq('identification_hash',icHash).maybeSingle());if(!user)denied();
   const issued=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
   await checked(client.from('grammarcraft_teacher_sessions').delete().lt('expires_at',now));
   await checked(client.from('grammarcraft_teacher_sessions').insert({token_hash:await shaHex(issued),teacher_id:user.id,expires_at:new Date(Date.now()+8*3600000).toISOString()}));
   return{token:issued,user};
  }
  if(!/^[a-f0-9]{64}$/.test(token||''))denied();const hashed=await shaHex(token!);
  const session=await checked(client.from('grammarcraft_teacher_sessions').select('teacher_id,expires_at').eq('token_hash',hashed).gt('expires_at',now).maybeSingle());if(!session||!ids.includes(session.teacher_id))denied();
  const user=await checked(client.from('teachers').select('id,full_name').eq('id',session.teacher_id).eq('active',true).maybeSingle());if(!user)denied();
  if(payload.action==='logout'){await checked(client.from('grammarcraft_teacher_sessions').delete().eq('token_hash',hashed));return{ok:true};}
  if(payload.action==='bootstrap')return{user};denied(400,'Unknown sign-in operation.');
 };
}
