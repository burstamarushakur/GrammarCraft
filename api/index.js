/* Standalone Vercel function. No generated worker or build scripts are needed. */
const SCHOOL_API='https://sxmchnwzcbsanecxnqdt.supabase.co/functions/v1/grammarcraft-api';
const ROUTES=new Set(['health','student/start','student/progress','student/poll','teacher/me','teacher/login','teacher/logout','teacher/progress','teacher/reset','teacher/import']);
function problem(error,status,code){
 return Response.json({error,code},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
export default{
 async fetch(request){
  const url=new URL(request.url);
  const route=url.searchParams.get('route')||url.pathname.replace(/^\/api\//,'');
  if(!ROUTES.has(route))return problem('Page not found.',404,'NOT_FOUND');
  url.searchParams.delete('route');
  if(!['GET','POST'].includes(request.method))return problem('Method not allowed.',405,'METHOD_NOT_ALLOWED');
  if(request.method==='POST'){
   const origin=request.headers.get('Origin');
   if(origin&&origin!==url.origin)return problem('This request is not allowed.',403,'WRONG_ORIGIN');
  }
  const headers=new Headers({'Content-Type':'application/json'});
  for(const key of ['Cookie','Authorization']){
   const value=request.headers.get(key);if(value)headers.set(key,value);
  }
  headers.set('x-client-ip',request.headers.get('cf-connecting-ip')||request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'shared');
  try{
   const response=await fetch(SCHOOL_API+'/api/'+route+url.search,{
    method:request.method,headers,redirect:'manual',signal:AbortSignal.timeout(20000),
    body:request.method==='POST'?await request.arrayBuffer():undefined
   });
   if(response.status>=300&&response.status<400)return problem('The school service is unavailable.',503,'SERVICE_REDIRECT');
   const responseHeaders=new Headers(response.headers);
   // Node fetch decodes compressed bodies; do not send the old wire headers.
   for(const key of ['Content-Encoding','Content-Length','Transfer-Encoding'])responseHeaders.delete(key);
   return new Response(response.body,{status:response.status,headers:responseHeaders});
  }catch{return problem('The school service could not be reached.',503,'SERVICE_UNAVAILABLE');}
 }
};
