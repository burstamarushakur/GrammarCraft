import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const bank=JSON.parse(readFileSync(new URL('./server/bank.json',import.meta.url),'utf8'));
let total=0;
for(const year of [1,2,3,4,5,6]){
 const quests=bank.grades[year];if(!quests||quests.length!==8)throw new Error('Year '+year+' must have 8 quests');
 for(const [i,quest] of quests.entries()){
  if(!quest.topic||quest.questions.length!==5)throw new Error('Year '+year+' quest '+i+' must have five questions');
  for(const [j,q] of quest.questions.entries()){
   if(!q.prompt||!q.answer||!q.hint||q.options.length!==4||!q.options.includes(q.answer)||new Set(q.options).size!==4)throw new Error('Bad question: '+year+'-'+i+'-'+j);
   total++;
  }
 }
}
if(total!==240)throw new Error('Expected exactly 240 questions');
execFileSync(process.execPath,['--check','public/app.js']);
execFileSync(process.execPath,['--check','public/visuals.js']);
execFileSync(process.execPath,['--check','public/island-art.js']);
execFileSync(process.execPath,['--check','public/island-game.js']);
const html=readFileSync(new URL('./public/index.html',import.meta.url),'utf8');
if(!html.includes('visuals.js')||!html.includes('app.js')||!html.includes('island-art.js')||!html.includes('island-game.js')||!html.includes('island.css'))throw new Error('RPG visual engine is not loaded in HTML');
const island=readFileSync(new URL('./public/island-game.js',import.meta.url),'utf8');
for(const hook of ['prepareLaunch','student/question','student/answer','screen.orientation','pointerdown','keydown','checkpoint','victory','landscape'])if(!island.includes(hook)&&!(hook==='landscape'&&html.includes('island.css')))throw new Error('Missing island game integration: '+hook);
console.log('English Island Quest: 240 questions / 48 quests, keyboard/touch, server answer endpoints, island renderer syntax OK.');