import {createClient} from 'npm:@supabase/supabase-js@2.57.4';
import core from './core.js';
import {storage} from './db.ts';
import {schoolAuth} from './auth.ts';
import access from './teacher-access.json' with {type:'json'};
const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
const env={DB:storage(client),SCOPED_DB:true,AUTH:schoolAuth(client,access)};

export default{async fetch(request:Request){
 const url=new URL(request.url);if(request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin)return Response.json({error:'This request is not allowed.',code:'WRONG_ORIGIN'},{status:403});const marker='/grammarcraft-api',index=url.pathname.indexOf(marker);let path=index>=0?url.pathname.slice(index+marker.length):url.pathname;if(!path)path='/';
 const normalised=new URL(path+url.search,url.origin),headers=new Headers(request.headers);headers.delete('Origin');
 return core.fetch(new Request(normalised,{method:request.method,headers,body:request.method==='GET'||request.method==='HEAD'?undefined:request.body}),env);
}};
