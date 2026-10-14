import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import worker from '../worker/index.js';
import {schoolAuth,authEnv,TEST_IC,TEST_COOKIE} from './spbt-fixture.mjs';
const roster=JSON.parse(readFileSync(new URL('../src/roster.json',import.meta.url),'utf8'));
const modules=['content.js','progress-model.js','art.js','loading.js','cloud.js','teacher.js','app.js'].map(f=>readFileSync(new URL('../src/'+f,import.meta.url),'utf8'));
function runtime(){
 const sql=new DatabaseSync(':memory:');for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())sql.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));
 const DB={prepare(q){let a=[];return{bind(...v){a=v;return this},async first(){return sql.prepare(q).get(...a)||null},async all(){return{results:sql.prepare(q).all(...a)}},async run(){return{meta:{changes:Number(sql.prepare(q).run(...a).changes)}}}}}};
 const auth=schoolAuth(),env={DB,...authEnv(auth)},pending=new Set();globalThis.fetch=auth.fetch;let offline=false,transportGate=null;
 async function server(path,opt={},teacher=false){const headers={...(opt.headers||{}),Origin:'https://game.test'};if(teacher)headers.Cookie=TEST_COOKIE;return worker.fetch(new Request('https://game.test'+path,{...opt,headers}),env);}
 function client(seed=new Map(),isTeacher=false){
  let cookie=null;const nodes=new Map(),events={};const el=id=>{if(!nodes.has(id)){const classes=new Set();nodes.set(id,{innerHTML:'',textContent:'',open:false,classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c)},showModal(){this.open=true},close(){this.open=false},focus(){},scrollIntoView(){},setAttribute(k,v){this[k]=v},removeAttribute(k){delete this[k]}});}return nodes.get(id);};
  const doc={getElementById:el,querySelectorAll:()=>[],visibilityState:'visible',addEventListener:(n,f)=>events[n]=f,body:{append(){}}};
  const fetcher=(path,opt={})=>{const promise=(async()=>{if(transportGate?.path===path){const gate=transportGate;transportGate=null;await gate.promise;}if(offline)throw new Error('offline');const response=await server(path,{...opt,headers:{...(opt.headers||{}),...(cookie?{Cookie:cookie}:{})}},isTeacher);const setCookie=response.headers.get('Set-Cookie');if(setCookie)cookie=setCookie.includes('Max-Age=0;')?null:setCookie.split(';')[0];return response})();pending.add(promise);promise.then(()=>pending.delete(promise),()=>pending.delete(promise));return promise;};
  const context=vm.createContext({console,ROSTER:roster,document:doc,localStorage:{getItem:k=>seed.get(k)||null,setItem:(k,v)=>seed.set(k,v)},fetch:fetcher,location:{protocol:'https:',search:''},URL,URLSearchParams,Blob,Date,Intl,Math,JSON,setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,matchMedia:()=>({matches:true}),window:{scrollTo(){},addEventListener(){},speechSynthesis:{cancel(){}}}});
  vm.runInContext(modules.join('\n')+'\nglobalThis.G={state,chooseClass,enter,openMission,answer,stats,save,switchStudent,CloudGame,TeacherUI,readProgress};',context);context.G.state.sound=false;
  return{g:context.G,seed,nodes,click(action){events.click({target:{closest:()=>({dataset:{action},disabled:false})},preventDefault(){}});},async submitIC(ic){el('teacher-ic').value=ic;events.submit({target:{id:'teacher-login-form'},preventDefault(){}});await drain();},async choose(i=0){context.G.chooseClass(roster.students[i].classCode);context.G.state.selectedId=roster.students[i].id;context.G.enter();await drain();}};
 }
 async function drain(){for(let i=0;i<15;i++){await new Promise(resolve=>setImmediate(resolve));if(pending.size)await Promise.allSettled([...pending]);else return;}throw new Error('Network did not settle');}
 return{client,drain,server,offline(v){offline=v;},holdNext(path){let release;const promise=new Promise(resolve=>release=resolve);transportGate={path,promise};return release;}};
}
test('The real client syncs an answer and the teacher UI displays that pupil result',async()=>{const r=runtime(),c=r.client();await c.choose();c.g.openMission('market');c.g.answer('am');await c.g.CloudGame.flush();await r.drain();const teacher=r.client(new Map(),true);await teacher.g.TeacherUI.open();await r.drain();assert.match(teacher.nodes.get('app').innerHTML,/Class progress\./);assert.ok(teacher.nodes.get('app').innerHTML.includes(roster.students[0].full_name));assert.match(teacher.nodes.get('app').innerHTML,/1\/40/);assert.equal(c.g.stats().solved,1);const nextDevice=r.client();await nextDevice.choose();assert.equal(nextDevice.g.stats().solved,1);});
test('The client discards an offline answer after a teacher reset and cannot restore it',async()=>{const r=runtime(),c=r.client();await c.choose();c.g.openMission('market');c.g.answer('am');await c.g.CloudGame.flush();await r.drain();r.offline(true);c.g.openMission('bridge');c.g.answer('He');await c.g.CloudGame.flush();assert.equal(c.g.stats().solved,2);r.offline(false);const reset=await r.server('/api/teacher/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentId:roster.students[0].id,confirm:true,expectedResetVersion:0})},true);assert.equal(reset.status,200);await c.g.CloudGame.poll();await r.drain();assert.equal(c.g.stats().solved,0);assert.equal(c.g.state.progress.resetVersion,1);assert.equal(c.g.state.page,'map');const reopened=r.client(c.seed);await reopened.choose();assert.equal(reopened.g.stats().solved,0);});
test('A teacher can see earlier local practice and reset it before it is imported',async()=>{const r=runtime(),id=roster.students[0].id,seed=new Map([['grammarcraft-6b-v1:'+id,JSON.stringify({version:1,studentId:id,avatar:'explorer',records:{'market:0':{correct:true,wrongAttempts:0,hintsUsed:false,firstTry:true}},drafts:{}})]]);const t=r.client(seed,true);await t.g.TeacherUI.open();await r.drain();assert.match(t.nodes.get('app').innerHTML,/Earlier practice found on this device/);t.g.TeacherUI.action('teacher-confirm-reset',{dataset:{student:id,version:'0'}});await r.drain();assert.equal(t.g.readProgress(id).resetVersion,1);assert.equal(t.g.readProgress(id).records['market:0'],undefined);const reopened=r.client(seed);await reopened.choose();assert.equal(reopened.g.stats().solved,0);});
test('A pupil account sees teacher sign-in instead of class results',async()=>{const r=runtime(),c=r.client();await c.g.TeacherUI.open();await r.drain();const html=c.nodes.get('app').innerHTML;assert.match(html,/Sign in with IC/);assert.doesNotMatch(html,/Sign in with ChatGPT/);assert.doesNotMatch(html,/teacher-table/);assert.doesNotMatch(html,/data-action="teacher-reset"/);});
test('The IC form signs in to the dashboard, clears the field, and can sign out',async()=>{const r=runtime(),c=r.client();await c.g.TeacherUI.open();await c.submitIC(TEST_IC);await r.drain();assert.match(c.nodes.get('app').innerHTML,/teacher-table/);assert.match(c.nodes.get('app').innerHTML,/Class Teacher/);assert.equal(c.nodes.get('teacher-ic').value,'');for(const value of c.seed.values())assert.ok(!String(value).includes(TEST_IC));c.g.TeacherUI.action('teacher-logout',{});await r.drain();assert.match(c.nodes.get('app').innerHTML,/Sign in with IC/);assert.doesNotMatch(c.nodes.get('app').innerHTML,/teacher-table/);});

test('The selected player stays in the game while loading and offline saves release feedback',async()=>{
 const r=runtime(),c=r.client(),id=roster.students[0].id,releaseStart=r.holdNext('/api/student/start');
 c.g.chooseClass('6B');c.g.state.selectedId=id;c.g.enter();
 assert.equal(c.nodes.get('game-loader').hidden,false);assert.equal(c.nodes.get('app').inert,true);
 assert.doesNotMatch(c.nodes.get('app').innerHTML,/Change player|data-action="switch"/);
 releaseStart();await r.drain();assert.equal(c.nodes.get('game-loader').hidden,true);
 c.g.openMission('market');c.click('switch');assert.equal(c.g.state.student.id,id);assert.equal(c.g.state.page,'mission');
 c.g.answer('am');const releaseSave=r.holdNext('/api/student/progress'),saving=c.g.CloudGame.flush();
 assert.equal(c.nodes.get('game-loader').hidden,false);assert.equal(c.nodes.get('game-loader').classList.contains('is-compact'),true);assert.equal(c.nodes.get('app').inert,false);
 r.offline(true);releaseSave();await saving;await r.drain();assert.equal(c.nodes.get('game-loader').hidden,true);assert.equal(c.g.state.student.id,id);assert.equal(c.g.stats().solved,1);assert.equal(c.g.readProgress(id).records['market:0'].correct,true);
});
test('Teacher connection errors clear loading and leave sign-in usable',async()=>{
 const r=runtime(),c=r.client(),release=r.holdNext('/api/teacher/me'),opening=c.g.TeacherUI.open();
 assert.equal(c.nodes.get('game-loader').hidden,false);assert.equal(c.nodes.get('app').inert,true);
 r.offline(true);release();await opening;await r.drain();assert.equal(c.nodes.get('game-loader').hidden,true);assert.equal(c.nodes.get('app').inert,false);assert.match(c.nodes.get('app').innerHTML,/Sign in with IC/);
});
test('Back to game returns from teacher sign-in to the class selection screen',async()=>{
 const r=runtime(),c=r.client();
 for(let visit=0;visit<2;visit++){
  c.click('teacher-open');await r.drain();assert.match(c.nodes.get('app').innerHTML,/teacher-login-form/);
  c.click('teacher-back');assert.equal(c.g.state.page,'lobby');
  assert.match(c.nodes.get('app').innerHTML,/class-select/);assert.doesNotMatch(c.nodes.get('app').innerHTML,/teacher-login-form|teacher-main/);
 }
});
test('Back to game returns an existing player from the dashboard to their map with progress intact',async()=>{
 const r=runtime(),c=r.client(new Map(),true);await c.choose();
 c.g.openMission('market');c.g.answer('am');await c.g.CloudGame.flush();await r.drain();
 const id=c.g.state.student.id;c.click('teacher-open');await r.drain();assert.match(c.nodes.get('app').innerHTML,/teacher-table/);
 c.click('teacher-back');assert.equal(c.g.state.page,'map');assert.equal(c.g.state.student.id,id);assert.equal(c.g.stats().solved,1);
 assert.doesNotMatch(c.nodes.get('app').innerHTML,/teacher-main|teacher-table/);assert.match(c.nodes.get('app').innerHTML,/data-action="mission"/);
});
