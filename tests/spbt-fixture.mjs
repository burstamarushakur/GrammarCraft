/* Synthetic school-auth fixture. These ICs are test values, not real users. */
export const TEST_TEACHER_ID='verified-teacher';
export const TEST_IC='900101012345';
export const TEST_OTHER_IC='900101019999';
export const TEST_TOKEN='a'.repeat(64);
export const TEST_OTHER_TOKEN='b'.repeat(64);
export const TEST_COOKIE='__Host-grammar_teacher='+TEST_TOKEN;
export const authEnv=(auth=schoolAuth())=>({TEACHER_ID:TEST_TEACHER_ID,SPBT_PUBLISHABLE_KEY:'test-publishable-key',TEACHER_ACCESS:[{id:TEST_TEACHER_ID,classes:['6B','4B','3K']},{id:'sujatha',classes:['5S','3B']},{id:'sukhairi',classes:['1S','2B']},{id:'izzati',classes:['6S','4K']},{id:'noor-afiq',classes:['2K','2S']}],AUTH:async(payload,token)=>{const response=await auth.fetch('https://school-auth.test',{body:JSON.stringify(payload),headers:{'x-spbt-token':token||''}});const data=await response.json();if(!response.ok){const error=new Error(data.error);error.status=response.status;throw error;}return data;}});
export function schoolAuth(){
 const sessions=new Map([[TEST_TOKEN,{id:TEST_TEACHER_ID,full_name:'Class Teacher',admin:true}]]),calls=[];let active=true,available=true;
 return{sessions,calls,setActive:v=>active=v,setAvailable:v=>available=v,
  async fetch(url,options){if(!available)throw new Error('School unavailable');const b=JSON.parse(options.body),headers=new Headers(options.headers),token=headers.get('x-spbt-token');calls.push({action:b.action});
   if(b.action==='login'){if(b.ic!==TEST_IC&&b.ic!==TEST_OTHER_IC)return Response.json({error:'Not registered'},{status:401});const user=b.ic===TEST_IC?{id:TEST_TEACHER_ID,full_name:'Class Teacher',admin:true}:{id:'other-teacher',full_name:'Other Teacher',admin:true};const issued=b.ic===TEST_IC?TEST_TOKEN:TEST_OTHER_TOKEN;sessions.set(issued,user);return Response.json({token:issued,user});}
   if(b.action==='logout'){sessions.delete(token);return Response.json({ok:true});}
   if(b.action==='bootstrap'){const user=sessions.get(token);return user&&active?Response.json({user,settings:{}}):Response.json({error:'Session expired'},{status:401});}
   return Response.json({error:'Unknown action'},{status:400});
  }};
}
