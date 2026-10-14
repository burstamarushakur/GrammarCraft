import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/index.js';
import {mkdtempSync,cpSync,existsSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
test('Vercel routes the configured rewrite to the shared backend and preserves the teacher cookie',async()=>{let call;globalThis.fetch=async(url,options)=>{call={url,options};return Response.json({isTeacher:true},{headers:{'Set-Cookie':'__Host-grammar_teacher='+'a'.repeat(64)+'; Path=/; Secure; HttpOnly; SameSite=None; Partitioned'}});};const response=await handler.fetch(new Request('https://grammarcraft.vercel.app/api/index?route=teacher/me',{headers:{Cookie:'__Host-grammar_teacher='+'a'.repeat(64)}}));assert.equal(call.url,'https://sxmchnwzcbsanecxnqdt.supabase.co/functions/v1/grammarcraft-api/api/teacher/me');assert.equal(call.options.headers.get('Cookie'),'__Host-grammar_teacher='+'a'.repeat(64));assert.equal(call.options.redirect,'manual');assert.equal(response.status,200);assert.ok(response.headers.get('Set-Cookie').includes('HttpOnly'));});
test('Vercel preserves class filtering and pupil payloads without needing environment secrets',async()=>{const calls=[];globalThis.fetch=async(url,options)=>{calls.push({url,options});return Response.json({ok:true});};await handler.fetch(new Request('https://grammarcraft.vercel.app/api/index?route=teacher/progress&classCode=3B'));assert.ok(calls[0].url.endsWith('/api/teacher/progress?classCode=3B'));await handler.fetch(new Request('https://grammarcraft.vercel.app/api/index?route=student/start',{method:'POST',headers:{Origin:'https://grammarcraft.vercel.app','Content-Type':'application/json'},body:JSON.stringify({classCode:'1S',studentId:'pupil'})}));assert.deepEqual(JSON.parse(new TextDecoder().decode(calls[1].options.body)),{classCode:'1S',studentId:'pupil'});assert.equal(calls[1].options.headers.get('Origin'),null);});
test('Vercel rejects cross-site writes before contacting Supabase',async()=>{globalThis.fetch=async()=>{throw new Error('Should not call school service');};const response=await handler.fetch(new Request('https://grammarcraft.vercel.app/api/index?route=teacher/reset',{method:'POST',headers:{Origin:'https://other.test'},body:'{}'}));assert.equal(response.status,403);});
test('The deployment works with only prepared files and no scripts, src or worker folder',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'grammarcraft-ready-'));
 try{
  for(const file of ['package.json','vercel.json','api/index.js','public/index.html','public/assets/school-logo.png'])cpSync(new URL('../'+file,import.meta.url),join(dir,file),{recursive:true});
  for(const folder of ['scripts','src','worker'])assert.equal(existsSync(join(dir,folder)),false);
  const config=JSON.parse(readFileSync(join(dir,'vercel.json'),'utf8'));
  assert.equal(config.buildCommand,'');assert.equal(config.framework,null);assert.equal(config.outputDirectory,'public');
  assert.match(execFileSync('npm',['run','build:vercel'],{cwd:dir,encoding:'utf8',stdio:['ignore','pipe','pipe']}),/No build scripts are required/);
  const portable=await import(pathToFileURL(join(dir,'api/index.js')));
  globalThis.fetch=async()=>Response.json({ready:true});
  const response=await portable.default.fetch(new Request('https://grammarcraft.vercel.app/api/index?route=health'));
  assert.equal(response.status,200);assert.equal((await response.json()).ready,true);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('The standalone API keeps direct routes, query filters and pupil bearer tokens',async()=>{
 let call;globalThis.fetch=async(url,options)=>{call={url,options};return Response.json({ok:true});};
 await handler.fetch(new Request('https://grammarcraft.vercel.app/api/student/poll',{method:'POST',headers:{Origin:'https://grammarcraft.vercel.app',Authorization:'Bearer '+'b'.repeat(64),'x-forwarded-for':'192.0.2.1, 192.0.2.2'},body:'{}'}));
 assert.equal(call.url,'https://sxmchnwzcbsanecxnqdt.supabase.co/functions/v1/grammarcraft-api/api/student/poll');assert.equal(call.options.headers.get('Authorization'),'Bearer '+'b'.repeat(64));assert.equal(call.options.headers.get('x-client-ip'),'192.0.2.1');
});
test('The standalone API blocks unknown routes and unsupported methods locally',async()=>{
 globalThis.fetch=async()=>{throw new Error('Should not forward');};
 assert.equal((await handler.fetch(new Request('https://grammarcraft.vercel.app/api/index?route=../../'))).status,404);
 assert.equal((await handler.fetch(new Request('https://grammarcraft.vercel.app/api/index?route=teacher/reset',{method:'DELETE'}))).status,405);
});
test('A backend redirect or outage cannot forward teacher credentials to another host',async()=>{
 globalThis.fetch=async(url,options)=>{assert.equal(options.redirect,'manual');return new Response(null,{status:302,headers:{Location:'https://other.test'}});};
 const request=()=>new Request('https://grammarcraft.vercel.app/api/index?route=teacher/me',{headers:{Cookie:'__Host-grammar_teacher='+'c'.repeat(64)}});
 const redirected=await handler.fetch(request());assert.equal(redirected.status,503);assert.equal(redirected.headers.get('Location'),null);
 globalThis.fetch=async()=>{throw new Error('network unavailable');};assert.equal((await handler.fetch(request())).status,503);
});
test('Decoded backend results do not retain compressed wire headers',async()=>{
 globalThis.fetch=async()=>Response.json({students:[]},{headers:{'Content-Encoding':'gzip','Content-Length':'25','Transfer-Encoding':'chunked','Set-Cookie':'__Host-grammar_teacher='+'a'.repeat(64)+'; Path=/; Secure; HttpOnly'}});
 const response=await handler.fetch(new Request('https://grammarcraft.vercel.app/api/index?route=teacher/progress&classCode=6S'));
 assert.equal(response.headers.get('Content-Encoding'),null);assert.equal(response.headers.get('Content-Length'),null);assert.equal(response.headers.get('Transfer-Encoding'),null);assert.match(response.headers.get('Set-Cookie'),/HttpOnly/);assert.deepEqual(await response.json(),{students:[]});
});
