import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import worker from '../worker/index.js';
const source=readFileSync(new URL('../src/loading.js',import.meta.url),'utf8');
function loader(){
 let clock=0,id=0;const timers=new Map(),nodes=new Map();
 function element(name){
  if(!nodes.has(name)){const classes=new Set();nodes.set(name,{hidden:false,inert:false,textContent:'',classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c)},setAttribute(k,v){this[k]=v;}});}
  return nodes.get(name);
 }
 const schedule=(fn,delay)=>{const key=++id;timers.set(key,{fn,due:clock+delay});return key;};
 const context=vm.createContext({document:{getElementById:element},performance:{now:()=>clock},setTimeout:schedule,clearTimeout:key=>timers.delete(key),requestAnimationFrame:fn=>schedule(()=>fn(clock),16),console});
 vm.runInContext(source,context);const api=vm.runInContext('GameLoader',context);
 async function advance(ms){
  const end=clock+ms;
  while(true){const next=[...timers.entries()].sort((a,b)=>a[1].due-b[1].due)[0];if(!next||next[1].due>end)break;clock=next[1].due;timers.delete(next[0]);next[1].fn();await Promise.resolve();await Promise.resolve();}
  clock=end;await Promise.resolve();await Promise.resolve();
 }
 return{api,nodes,advance};
}
async function ready(){const l=loader();l.api.ready();await l.advance(400);assert.equal(l.nodes.get('game-loader').hidden,true);return l;}
test('The initial loader stays visible until the first screen can paint',async()=>{
 const l=loader();assert.equal(l.nodes.get('app').inert,true);l.api.ready();await l.advance(16);assert.equal(l.nodes.get('game-loader').hidden,false);await l.advance(400);assert.equal(l.nodes.get('game-loader').hidden,true);assert.equal(l.nodes.get('app').inert,false);
});
test('A foreground operation paints loading feedback before opening the next screen',async()=>{
 const l=await ready();let started=false,release;const pending=new Promise(resolve=>release=resolve);
 const result=l.api.run('Opening your world…',()=>{started=true;return pending;});
 assert.equal(l.nodes.get('app').inert,true);assert.equal(l.nodes.get('loader-message').textContent,'Opening your world…');
 await l.advance(31);assert.equal(started,false);await l.advance(1);assert.equal(started,true);
 assert.equal(l.nodes.get('game-loader').hidden,false);release('open');assert.equal(await result,'open');await l.advance(400);assert.equal(l.nodes.get('app').inert,false);assert.equal(l.nodes.get('game-loader').hidden,true);
});
test('Saving stays nonblocking and cannot hide an overlapping foreground load',async()=>{
 const l=await ready(),save=l.api.begin('Saving your progress…',{blocking:false});
 assert.equal(l.nodes.get('app').inert,false);assert.equal(l.nodes.get('game-loader').classList.contains('is-compact'),true);
 const open=l.api.begin('Opening your handbook…');assert.equal(l.nodes.get('app').inert,true);assert.equal(l.nodes.get('loader-message').textContent,'Opening your handbook…');
 const newerSave=l.api.begin('Saving your latest progress…',{blocking:false});
 save();await l.advance(400);assert.equal(l.nodes.get('loader-message').textContent,'Opening your handbook…');
 open();assert.equal(l.nodes.get('app').inert,false);assert.equal(l.nodes.get('loader-message').textContent,'Saving your latest progress…');assert.equal(l.nodes.get('game-loader').classList.contains('is-compact'),true);
 newerSave();assert.equal(l.nodes.get('game-loader').hidden,true);
});
test('A failed operation releases the loader and restores interaction',async()=>{
 const l=await ready();const result=l.api.run('Loading your classroom…',()=>{throw new Error('Network unavailable');});
 const rejected=assert.rejects(result,/Network unavailable/);await l.advance(32);await rejected;await l.advance(400);assert.equal(l.nodes.get('game-loader').hidden,true);assert.equal(l.nodes.get('app').inert,false);
});
test('The hosted school logo matches the supplied PNG and the portable asset',async()=>{
 const page=await worker.fetch(new Request('https://game.test/'),{});const html=await page.text();
 const url=html.match(/src="(\/assets\/school-logo\.png\?v=[a-f0-9]+)"/)?.[1];assert.ok(url);
 const response=await worker.fetch(new Request('https://game.test'+url),{});assert.equal(response.status,200);assert.equal(response.headers.get('Content-Type'),'image/png');assert.match(response.headers.get('Cache-Control'),/immutable/);
 const original=readFileSync(new URL('../src/assets/school-logo.png',import.meta.url));assert.ok(Buffer.from(await response.arrayBuffer()).equals(original));assert.ok(readFileSync(new URL('../public/assets/school-logo.png',import.meta.url)).equals(original));
});
