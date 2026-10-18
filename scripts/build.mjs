import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>readFileSync(path.join(root,'src',f),'utf8');
const logo=readFileSync(path.join(root,'src/assets/school-logo.png'));
const logoURL='/assets/school-logo.png?v='+createHash('sha256').update(logo).digest('hex').slice(0,12);
const roster=JSON.parse(read('roster.json'));
const expectedCodes=['1S','2B','2K','2S','3B','3K','4B','4K','5S','6B','6S'];
if(roster.classes.map(c=>c.code).sort().join(',')!==expectedCodes.join(',')||roster.students.length!==337)throw new Error('Expected the eleven verified school classes.');
if(new Set(roster.students.map(s=>s.id)).size!==roster.students.length)throw new Error('Duplicate students.');
const packFiles={'y1-medium':'year1.json','y2-low':'year2-low.json','y2-challenge':'year2-challenge.json','y3-supported':'year3.json','y3-challenge':'year3-challenge.json','y4-foundation':'year4-foundation.json','y4-supported':'year4.json','y5-high':'year5.json','y6-supported':'year6.json','y6-high':'year6-high.json'};
const packs=Object.fromEntries(Object.entries(packFiles).map(([id,file])=>[id,JSON.parse(read(file))]));
const supportedTypes=new Set(['rune','bridge','train','build','mine','portal','place','compare']);
const missionIds=new Set();
for(const [id,pack] of Object.entries(packs)){
 if(pack.missions.length!==8||pack.missions.some(m=>m.tasks.length!==5)||!pack.rules.length||!pack.curriculum.url)throw new Error('Invalid pack or missing DSKP source: '+id);
 for(const m of pack.missions){
  if(!supportedTypes.has(m.type)||missionIds.has(m.id))throw new Error('Invalid or shared mission ID: '+m.id);missionIds.add(m.id);
  for(const t of m.tasks){
   if(!t.prompt||!t.answer||!t.full||!t.hint||!t.explain)throw new Error('Incomplete activity in '+m.id);
   if(t.words&&t.words.join(' ')!==t.answer)throw new Error('Word blocks do not form the answer in '+m.id);
   if(t.options&&(!t.options.includes(t.answer)||new Set(t.options).size!==t.options.length))throw new Error('Invalid choice in '+m.id);
   if(t.objects&&t.objects.filter(o=>o.id===t.answer).length!==1)throw new Error('Invalid object answer in '+m.id);
   if(['train','build'].includes(m.type)&&!t.words)throw new Error('Builder needs word blocks in '+m.id);
   if(['rune','bridge','mine','portal'].includes(m.type)&&!t.options)throw new Error('Choice activity needs options in '+m.id);
   if(m.type==='place'&&!['in','on','under','behind','between'].includes(t.answer))throw new Error('Invalid placement in '+m.id);
  }
 }
}
for(const c of roster.classes){if(packs[c.packId]?.year!==c.year||roster.students.filter(s=>s.classCode===c.code).length!==c.studentCount)throw new Error('Incorrect class mapping: '+c.code);}
for(const [id,levels] of [['y4-foundation',['low','lower-medium']],['y3-challenge',['medium','upper-medium']]]){
 const tasks=packs[id].missions.flatMap(m=>m.tasks);
 if(tasks.some(t=>!levels.includes(t.difficulty))||levels.some(level=>tasks.filter(t=>t.difficulty===level).length!==20))throw new Error('Incorrect class difficulty distribution: '+id);
}
const high=packs['y6-high'].missions.flatMap(m=>m.tasks);if(high.length!==40||high.filter(t=>t.kbat===true).length!==20||high.some(t=>typeof t.kbat!=='boolean'))throw new Error('6S must have exactly 20 of 40 KBAT activities.');
for(const t of high.filter(t=>t.kbat)){if(!['apply','analyse','evaluate','create'].includes(t.cognitiveLevel)||!t.kbatRationale)throw new Error('KBAT reasoning metadata is missing.');}
const curriculumLines=['# GrammarCraft — Pemetaan DSKP','', 'Latihan grammar terpilih bagi KSSR Bahasa Inggeris SK Tahun 1–6. Setiap kelas menggunakan dokumen DSKP tahun berkenaan. Ini tidak menentukan Tahap Penguasaan PBD secara automatik.','', '| Set | Tahun | Kelas | Aktiviti | Rujukan |','|---|---:|---|---:|---|'];
for(const [id,pack] of Object.entries(packs)){const codes=roster.classes.filter(c=>c.packId===id).map(c=>c.code).join(', ');curriculumLines.push(`| ${id} | ${pack.year} | ${codes} | 40 | [DSKP](${pack.curriculum.url}) — ${pack.curriculum.grammarPages||''} |`);}
for(const [id,pack] of Object.entries(packs)){curriculumLines.push('',`## ${id}`,'',pack.curriculum.note||'');if(pack.curriculum.mirrorUrl)curriculumLines.push('',`Dokumen KPM disemak pada ${pack.curriculum.reviewedAt}; [salinan dokumen yang boleh dibaca](${pack.curriculum.mirrorUrl}).`);if(pack.difficultyDistribution)curriculumLines.push('',Object.entries(pack.difficultyDistribution).map(([level,count])=>`${level}: ${count}/40`).join(' · '));curriculumLines.push('', '| Misi | Fokus grammar |','|---|---|');for(const m of pack.missions)curriculumLines.push(`| ${m.title} | ${m.topic.replaceAll('|','/')} |`);}
curriculumLines.push('','## 6S — 20 aktiviti KBAT (50%)','','Sumber definisi HOTS: DSKP Tahun 6, halaman cetak 12. Aktiviti terpilih memerlukan hubungan antara petunjuk atau penilaian pilihan dalam situasi. Label kognitif dan rasional diberikan untuk semakan guru.','','| Aktiviti | Aras | Rasional |','|---|---|');
for(const m of packs['y6-high'].missions)for(const [i,t] of m.tasks.entries())if(t.kbat)curriculumLines.push(`| ${m.id}:${i} | ${t.cognitiveLevel} | ${t.kbatRationale.replaceAll('|','/').replaceAll('\n',' ')} |`);
writeFileSync(path.join(root,'CURRICULUM.md'),curriculumLines.join('\n')+'\n');
const encode=v=>JSON.stringify(v).replace(/</g,'\\u003c');
const content=`/* Generated from ${Object.keys(packs).length} DSKP-reviewed packs for ${roster.classes.length} classes. */\nconst CONTENT_PACKS=${encode(packs)};\nconst classByCode=code=>ROSTER.classes.find(c=>c.code===code);\nconst studentById=id=>ROSTER.students.find(s=>s.id===id);\nconst packForClass=code=>CONTENT_PACKS[classByCode(code)?.packId||'y6-supported'];\nconst missionsFor=id=>packForClass(studentById(id)?.classCode).missions;\nlet MISSIONS=CONTENT_PACKS['y6-supported'].missions,RULES=CONTENT_PACKS['y6-supported'].rules;\nfunction usePack(code){const pack=packForClass(code);MISSIONS=pack.missions;RULES=pack.rules;}\n`;
writeFileSync(path.join(root,'src/content.js'),content);
const html=read('index.html').replace('/* INLINE_STYLES */',read('style.css')+'\n'+read('loading.css')).replace('/* INLINE_ROSTER */',`const ROSTER=${encode(roster)};`).replace('/* INLINE_CONTENT */',content).replace('/* INLINE_MODEL */',read('progress-model.js')).replace('/* INLINE_ART */',read('art.js')).replace('/* INLINE_LOADING */',read('loading.js')).replace('/* INLINE_CLOUD */',read('cloud.js')).replace('/* INLINE_TEACHER */',read('teacher.js')).replace('/* INLINE_APP */',read('app.js')).replaceAll('/* SCHOOL_LOGO_URL */',logoURL);
const access=JSON.parse(readFileSync(path.join(root,'server/teacher-access.json'),'utf8'));
const worker=readFileSync(path.join(root,'worker/api.js'),'utf8').replace('/* EMBED_GAME */',`const GAME_HTML=${encode(html)};`).replace('/* EMBED_ROSTER */',`const ROSTER=${encode(roster)};`).replace('/* EMBED_CONTENT */',content).replace('/* EMBED_MODEL */',read('progress-model.js')).replace('/* EMBED_ACCESS */',`const TEACHER_ACCESS=${encode(access)};`).replace('/* EMBED_SCHOOL_LOGO */','const SCHOOL_LOGO_BASE64='+JSON.stringify(logo.toString('base64'))+';');
writeFileSync(path.join(root,'worker/index.js'),worker);
const edgeDir=path.join(root,'supabase/functions/grammarcraft-api');writeFileSync(path.join(edgeDir,'core.js'),worker);writeFileSync(path.join(edgeDir,'teacher-access.json'),encode(access)+'\n');writeFileSync(path.join(edgeDir,'roster.json'),encode(roster)+'\n');
for(const directory of ['exports','public'])mkdirSync(path.join(root,directory),{recursive:true});
const standalone=html.replace(/^\s*<link rel="preload" as="image" href="[^"]+">\n/m,'').replaceAll(logoURL,'data:image/png;base64,'+logo.toString('base64'));
writeFileSync(path.join(root,'exports/GrammarCraft.html'),standalone);
mkdirSync(path.join(root,'public/assets'),{recursive:true});
writeFileSync(path.join(root,'public/assets/school-logo.png'),logo);writeFileSync(path.join(root,'public/index.html'),html);
console.log(JSON.stringify({build:'ok',classes:roster.classes.length,students:roster.students.length,challenges:Object.values(packs).reduce((n,p)=>n+p.missions.flatMap(m=>m.tasks).length,0),bytes:Buffer.byteLength(html)}));
