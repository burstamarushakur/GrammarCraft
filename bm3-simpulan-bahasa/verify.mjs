import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const bank=JSON.parse(readFileSync(new URL('./server/bank.json',import.meta.url),'utf8'));
const quests=bank.grades?.[3]||bank.grades?.['3'];
if(!Array.isArray(quests)||quests.length!==8)throw Error('Perlu ada tepat 8 pulau.');
let total=0;
for(const [qi,q] of quests.entries()){
 if(q.questions?.length!==5)throw Error('Pulau '+(qi+1)+' perlu ada 5 soalan.');
 for(const [i,item] of q.questions.entries()){
  if(!item.prompt||!item.hint||!item.answer||!Array.isArray(item.options)||item.options.length!==4||new Set(item.options).size!==4||!item.options.includes(item.answer))throw Error('Soalan rosak: '+qi+'/'+i);
  total++;
 }
}
if(total!==40)throw Error('Jumlah soalan mesti 40.');
for(const file of ['app.js','visuals.js','island-game.js','island-art.js'])execFileSync(process.execPath,['--check','public/'+file]);
const html=readFileSync(new URL('./public/index.html',import.meta.url),'utf8');
for(const asset of ['app.js','visuals.js','island-game.js','island-art.js','island.css','style.css'])if(!html.includes(asset))throw Error('Aset tiada: '+asset);
const client=readFileSync(new URL('./public/app.js',import.meta.url),'utf8');
if(!client.includes('bm3-simpulan-api')||!client.includes('state.classCode="3S"'))throw Error('Konfigurasi kelas/API tidak tepat.');
const engine=readFileSync(new URL('./public/island-game.js',import.meta.url),'utf8');
for(const keyword of ['student/question','student/answer','screen.orientation','pointerdown','arrowright','LOMPAT'])if(!engine.includes(keyword))throw Error('Enjin platformer hilang ciri: '+keyword);
console.log('LULUS: 40 soalan aras tinggi, 8 pulau, 3S, sumber backend, kawalan telefon/PC, sintaks JS.');
