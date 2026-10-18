(function IslandArtFactory(){
"use strict";
const W=1280,H=720,G=558,STAGE_LENGTH=3770;
const THEMES=[
 {name:"Sunny Shore",sky:"#67cfff",sky2:"#b3edfc",mount:"#68a7ba",mount2:"#358fa1",grass:"#89d65a",leaf:"#2fae72",soil:"#ad6c40",sea:"#21add0"},
 {name:"Coconut Jungle",sky:"#6bcbf8",sky2:"#d6f5ea",mount:"#81ad7d",mount2:"#497e7f",grass:"#93d35e",leaf:"#247e52",soil:"#906039",sea:"#43b3c3"},
 {name:"Waterfall Valley",sky:"#8ed8fb",sky2:"#d6edfb",mount:"#8bb6bf",mount2:"#5a8897",grass:"#78ce73",leaf:"#298972",soil:"#917157",sea:"#46c4e6"},
 {name:"Temple Ruins",sky:"#e1b4f8",sky2:"#f9d6c6",mount:"#b88eab",mount2:"#7e7096",grass:"#a1c96c",leaf:"#3a9874",soil:"#946c52",sea:"#50b7d0"},
 {name:"Volcano Ridge",sky:"#d9918c",sky2:"#f8c195",mount:"#a16b88",mount2:"#704d72",grass:"#a4c168",leaf:"#3e8c61",soil:"#89534b",sea:"#73afc7"},
 {name:"Cloud Gardens",sky:"#7fc7ff",sky2:"#ebf7ff",mount:"#91b8c9",mount2:"#5787a9",grass:"#9ad778",leaf:"#509b81",soil:"#9b755c",sea:"#6cbbd9"},
 {name:"Moonlight Woods",sky:"#32568c",sky2:"#847fb0",mount:"#455d8e",mount2:"#344866",grass:"#64b28e",leaf:"#397c82",soil:"#64566d",sea:"#559eb9"},
 {name:"Crystal Fortress",sky:"#6fa6d2",sky2:"#b6c8f3",mount:"#718bc5",mount2:"#55679a",grass:"#8ac9ae",leaf:"#438a9a",soil:"#7e728b",sea:"#56b5d7"}
];
const rand=(n,s=1)=>{const x=Math.sin(n*12.9898+s*78.233)*43758.5453;return x-Math.floor(x);};
const rect=(c,x,y,w,h,v)=>{c.fillStyle=v;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function poly(c,points,color){c.fillStyle=color;c.beginPath();c.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)c.lineTo(points[i][0],points[i][1]);c.closePath();c.fill();}
function oval(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function text(c,value,x,y,size=22,fill="#f5eccb",shadow="#233348"){
 c.font=`900 ${size}px system-ui`;c.textAlign="center";c.lineWidth=Math.max(3,size/4);c.strokeStyle=shadow;c.strokeText(value,x,y);c.fillStyle=fill;c.fillText(value,x,y);c.textAlign="left";
}
function cloud(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);const shadows=[[-65,7,42,20],[-18,-6,54,30],[32,0,40,25]];
 for(const [cx,cy,rx,ry] of shadows)oval(c,cx,cy+10,rx,ry,"#b2dfea");for(const [cx,cy,rx,ry]of shadows)oval(c,cx,cy,rx,ry,"#fbffff");
 rect(c,-58,6,105,17,"#f4ffff");c.restore();}
function hill(c,x,y,r,a,b){poly(c,[[x-r,y],[x,y-r*.68],[x+r,y]],a);poly(c,[[x-r*.18,y-r*.55],[x,y-r*.68],[x+r*.21,y-r*.51],[x+r*.04,y-r*.54]],b);}
function palm(c,x,y,size=1,bright=false){
 c.save();c.translate(x,y);c.scale(size,size);
 // Bent trunk with striped bark; curved palms in a silhouette.
 poly(c,[[-13,0],[13,0],[6,-60],[17,-122],[7,-164],[-7,-158],[-4,-110],[-16,-61]],"#70472f");
 poly(c,[[-8,-8],[0,-10],[-5,-64],[10,-125],[3,-153],[-2,-149],[-14,-67]],"#bf8643");
 for(let z=0;z<11;z++)rect(c,-7+z%4,-14-z*13,18,4,z%2?"#9d6838":"#dd9652");
 const arms=[[-130,21],[-99,-37],[-48,-86],[26,-100],[100,-71],[136,1],[-128,-34],[106,-120]];
 for(let k=0;k<arms.length;k++){const [tx,ty]=arms[k],col=k%2?"#237c56":"#2da65f";
 poly(c,[[0,-150],[tx*.36,-177],[tx*.72,ty-153],[tx,ty-150],[tx*.79,ty-142],[tx*.38,-163]],col);
 poly(c,[[0,-149],[tx*.47,-164],[tx*.78,ty-147],[tx*.73,ty-155]],k%2?"#56c975":"#4bbd69");
 }
 oval(c,3,-143,13,13,"#4e943e");
 for(const dx of [-15,10]){oval(c,dx,-130,11,12,"#7f4a31");oval(c,dx-2,-133,4,3,"#c8a05c");}
 if(bright){oval(c,-45,-55,4,4,"#ffc77b");}
 c.restore();
}
function blossom(c,x,y,s=1){rect(c,x,y+4*s,3*s,12*s,"#3d9d59");const v=["#ffa4c5","#ffe2a4","#f3caff","#a5e8e1"][Math.floor(rand(x+y)*4)];for(let k=0;k<4;k++){const a=k*Math.PI/2;oval(c,x+5*s+Math.cos(a)*5*s,y+Math.sin(a)*5*s,4*s,4*s,v);}oval(c,x+5*s,y,3*s,3*s,"#fbe17a");}
function forest(c,theme,camera,front=false){
const speed=front?.53:.24,off=camera*speed;
for(let i=Math.floor((off-250)/250);i<Math.ceil((off+W+300)/250);i++){
 const x=i*250-off+125+(rand(i,2)-.5)*60,size=(front? .68:.39)+rand(i,4)*.12,y=front?G+14:398+rand(i,7)*28;
 if(i%4===2||theme===6){palm(c,x,y,size,i%5===0);}
 else {
  const sh=front?100:80,leaf=THEMES[theme].leaf;
  rect(c,x-9,y-sh*.65,18,sh*.65,"#705540");rect(c,x-4,y-sh*.65,7,sh*.65,"#bc8756");
  for(const [dx,dy,rad] of [[-28,-sh,31],[17,-sh-13,39],[0,-sh-39,32],[43,-sh+9,22]]){oval(c,x+dx,y+dy,rad,rad*.9,i%2?"#245f59":leaf);oval(c,x+dx-8,y+dy-9,rad*.6,rad*.48,theme===6?"#428c9d":"#4cbd7a");}
 }
}
}
function hut(c,x,y){
 rect(c,x-57,y-82,114,83,"#654634");rect(c,x-49,y-79,99,78,"#edc68a");
 for(let j=0;j<4;j++)rect(c,x-46+j*25,y-63,17,3,"#dca96d");
 poly(c,[[x-75,y-78],[x,y-140],[x+75,y-78]],"#493a42");
 poly(c,[[x-70,y-78],[x,y-132],[x+67,y-78]],"#b54f4a");
 for(let j=0;j<6;j++)rect(c,x-39+j*14,y-100,12,4,j%2?"#d06a5d":"#e58d66");
 rect(c,x-18,y-47,38,46,"#563b43");rect(c,x-12,y-45,26,45,"#825041");rect(c,x+9,y-28,3,4,"#ffdd80");
 for(const dx of [-40,34]){rect(c,x+dx-2,y-55,21,22,"#5d5555");rect(c,x+dx,y-52,17,16,"#45adc8");rect(c,x+dx+2,y-51,5,11,"#c2f0ef");}
 rect(c,x-70,y,143,8,"#6d593b");
}
function bridge(c,x,y,w){
 rect(c,x,y+32,w,7,"#6a4131");rect(c,x,y+1,w,30,"#a6734c");
 for(let j=0;j<w/28;j++){const xx=x+j*28;rect(c,xx,y+3,26,27,j%2?"#ce955e":"#b77c4b");rect(c,xx+24,y+3,3,28,"#5a4035");rect(c,xx+6,y+13,4,4,"#f9c98c");}
 for(const xx of [x+4,x+w-8]){rect(c,xx,y-22,8,68,"#714935");rect(c,xx-2,y-24,12,8,"#c48f57");}
 rect(c,x,y-15,w,5,"#aa7450");rect(c,x,y-13,w,2,"#e7af76");
}
function ground(c,theme,stage,camera){
 const t=THEMES[theme],surface=G,tilestart=Math.max(0,Math.floor(camera/48)-2),tileEnd=Math.min(Math.ceil(STAGE_LENGTH/48)+1,Math.ceil((camera+W)/48)+2);
 // Water underneath gaps
 rect(c,0,G+15,W,H-G-15,t.sea);
 for(let k=0;k<24;k++){const x=(k*72-camera*.24)%1420;rect(c,x,G+38+(k%4)*21,43,3,k%2?"#a5f0db":"#76e9ee");}
 const gaps=stage.gaps;
 for(let i=tilestart;i<tileEnd;i++){
  const world=i*48,mid=world+24;
  const g=gaps.some(g=>mid>g.x+2&&mid<g.x+g.w-2);
  if(g)continue;
  const x=world-camera;
  rect(c,x,G,48,H-G,t.soil);
  rect(c,x,G,48,14,"#316448");rect(c,x,G+5,48,12,"#5dc76f");rect(c,x,G+10,48,12,t.grass);
  rect(c,x,G+20,48,5,"#583d32");
  for(let row=0;row<4;row++){
   const y=G+26+row*35;
   rect(c,x+1,y,46,29,((i+row)%3===0)?"#955939":"#ab6b43");
   rect(c,x+1,y,46,3,"#cd8c53");
   rect(c,x+7+((row+i)%4)*8,y+10,15,4,"#86563c");
   if(rand(i,row+theme)>.54)rect(c,x+31,y+21,7,5,"#d8975a");
  }
  if(i%4===0){for(const j of [11,17,28]){rect(c,x+j,G-4,3,6,"#38854e");rect(c,x+j+3,G-7,4,6,"#8ac95d");}}
  if(i%7===2)blossom(c,x+22,G-16,.64);
 }
 for(const gap of gaps){const x=gap.x-camera;if(x>W+50||x+gap.w<-50)continue;
  rect(c,x,G+11,gap.w,H-G-11,t.sea);
  for(let n=0;n<Math.ceil(gap.w/27);n++){const px=x+n*28;rect(c,px,G+16,20,4,"#c5f3e5");rect(c,px+8,G+24,11,3,"#98eeea");}
  // cliff faces around gaps
  rect(c,x-11,G+23,9,72,"#6d4b40");rect(c,x+gap.w,G+23,9,72,"#6d4b40");
 }
 // short elevated natural platforms with patterned wood underside
 for(const p of stage.platforms){
  const x=p.x-camera;if(x+p.w<0||x>W)continue;
  rect(c,x,p.y+9,p.w,15,"#584b3d");rect(c,x,p.y+2,p.w,13,"#846c4e");
  rect(c,x,p.y,p.w,10,"#6bc866");rect(c,x,p.y,p.w,3,"#b3e47d");
  for(let j=8;j<p.w;j+=30){rect(c,x+j,p.y+12,12,3,"#c19463");rect(c,x+j+2,p.y+16,7,2,"#473e37");}
 }
}
function token(c,x,y,type,frame){
 c.save();c.translate(x,y+Math.sin(frame/220+x*.021)*5);
 if(type==="coin"){oval(c,0,0,17,19,"#8c5c26");oval(c,0,-2,14,16,"#ffe06a");oval(c,0,-2,10,12,"#ffbd3f");text(c,"★",0,6,18,"#fff3b1","#bb781f");}
 else if(type==="banana"){
  c.strokeStyle="#8b6534";c.lineWidth=12;c.lineCap="round";c.beginPath();c.arc(-1,-4,23,.3,2.13);c.stroke();c.strokeStyle="#ffde53";c.lineWidth=8;c.stroke();
  rect(c,17,-3,6,6,"#735538");
 }else{
  poly(c,[[-15,-14],[-19,0],[-9,14],[9,14],[19,0],[15,-14]],"#be8738");
  poly(c,[[-12,-13],[-14,0],[-6,10],[7,10],[15,0],[12,-13]],"#f9d34b");
  for(let j=0;j<9;j++)rect(c,-10+(j%3)*9,-9+Math.floor(j/3)*8,3,3,"#dd9f37");
  for(let j=0;j<5;j++)poly(c,[[0,-13],[-17+j*8,-27],[-10+j*6,-19]],j%2?"#248957":"#3bad64");
 }
 c.restore();
}
function hero(c,x,y,actor=0,face=1,walking=false,tick=0){
 const pal=[
  {hat:"#6a3f33",hair:"#704b34",shine:"#b37c56",top:"#206fa7",cape:"#e94954",shoe:"#64453d",pants:"#344b75"},
  {hat:"#b4c5d4",hair:"#d6a46a",shine:"#fff2ac",top:"#4d90b4",cape:"#3967a4",shoe:"#65515c",pants:"#4a547b"},
  {hat:"#7a53a0",hair:"#a66ac5",shine:"#e7c6f5",top:"#6554b7",cape:"#d383df",shoe:"#4b4279",pants:"#645589"},
  {hat:"#386044",hair:"#94683d",shine:"#dcb984",top:"#4f9f7b",cape:"#4e8260",shoe:"#5c4739",pants:"#3b6a5d"}
 ][actor]||{hat:"#6a3f33",hair:"#704b34",shine:"#b37c56",top:"#206fa7",cape:"#e94954",shoe:"#64453d",pants:"#344b75"};
 c.save();c.translate(x,y);if(face<0)c.scale(-1,1); const step=walking?Math.sin(tick/74):0,bob=walking?Math.abs(step)*3:Math.sin(tick/420)*1.5;
 // all positions relative to ground at (0,0)
 oval(c,0,0,24,6,"#1c334040");
 poly(c,[[-13,-63],[-42,-39],[-27,-23],[-16,-28]],pal.cape);
 poly(c,[[-13,-59],[-37,-41],[-30,-35],[-17,-41]],"#ff7180");
 rect(c,-13,-31,11,24,pal.pants);
 rect(c,3,-31,12,24,pal.pants);
 rect(c,-14-step*4,-12-step*6,17,9,pal.shoe);
 rect(c,2+step*5,-10+step*5,18,10,pal.shoe);
 rect(c,-15,-64+bob,32,37,"#213747");rect(c,-11,-63+bob,28,34,pal.top);
 rect(c,-2,-57+bob,8,24,"#ffe09a");rect(c,3,-57+bob,4,22,"#c88a40");rect(c,-12,-30+bob,30,6,"#c48a4c");
 // bag on back
 rect(c,-26,-56+bob,15,25,"#714b35");rect(c,-22,-51+bob,11,15,"#ad7450");rect(c,-18,-47+bob,5,4,"#eac175");
 // waving arms
 rect(c,-16,-57+bob,9,25,pal.top);rect(c,-14,-34+bob,8,9,"#f4ba92");
 rect(c,16,-55+bob,10,20,pal.top);rect(c,17,-37+bob,10,10,"#f4ba92");
 rect(c,-11,-85+bob,30,26,"#2d333c");
 rect(c,-8,-86+bob,28,25,"#edb18d");
 rect(c,10,-76+bob,12,15,"#f6c39c");
 // luscious shaggy hair, eye highlight, face
 rect(c,-13,-98+bob,30,16,pal.hair);rect(c,-15,-89+bob,10,15,pal.hair);
 rect(c,14,-93+bob,11,12,pal.hair);rect(c,-10,-98+bob,22,4,pal.shine);
 rect(c,-15,-93+bob,13,8,pal.hair);rect(c,6,-91+bob,16,7,pal.hair);
 rect(c,14,-78+bob,5,8,"#fff4dd");rect(c,17,-77+bob,3,6,"#25303f");
 rect(c,13,-72+bob,5,2,"#d58177");rect(c,12,-65+bob,7,2,"#7c4b4a");
 if(actor===1){rect(c,-15,-99+bob,37,8,"#687f94");rect(c,-12,-104+bob,30,8,"#bed0d7");rect(c,14,-91+bob,9,7,"#7d99ae");}
 if(actor===2){poly(c,[[-21,-92+bob],[4,-125+bob],[19,-92+bob]],"#593575");rect(c,-23,-94+bob,42,9,"#7855a9");rect(c,-4,-118+bob,6,6,"#f1c878");}
 if(actor===3){rect(c,-17,-96+bob,36,6,"#3e6a41");rect(c,-19,-90+bob,13,7,"#396747");}
 // weapon/belt charm
 rect(c,24,-47+bob,4,21,"#e6cc89");rect(c,22,-52+bob,8,8,actor===2?"#a5e5fa":"#e0e1db");
 c.restore();
}
function snail(c,x,y,boss=false,tick=0){
 const scale=boss?1.45:1;c.save();c.translate(x,y+Math.sin(tick/320)*3);c.scale(scale,scale);
 oval(c,0,0,41,8,"#152d3d60");oval(c,4,-16,40,18,"#6cb54d");oval(c,-12,-35,24,27,"#b76937");
 oval(c,-11,-36,21,24,"#f09b45");oval(c,-11,-36,15,16,"#ce743b");oval(c,-11,-36,9,9,"#edaa55");
 rect(c,19,-45,6,26,"#528844");rect(c,35,-47,6,28,"#548c41");
 oval(c,21,-49,10,13,"#fff8e0");oval(c,39,-50,10,13,"#fff8e0");
 oval(c,25,-48,4,7,"#25374b");oval(c,41,-49,4,7,"#25374b");
 rect(c,17,-58,17,4,"#24362b");rect(c,32,-59,15,4,"#24362b");
 rect(c,31,-20,13,3,"#243f31");c.restore();
}
function crab(c,x,y,boss=false,tick=0){
 c.save();c.translate(x,y);const scale=boss?1.55:1;c.scale(scale,scale);
 oval(c,0,0,43,6,"#19324450");rect(c,-26,-28,52,26,"#bd3c38");rect(c,-21,-33,42,23,"#f16b51");
 rect(c,-21,-30,22,5,"#ff9d70");for(let k=0;k<3;k++){rect(c,-30+k*26,-7,12,8,"#722b39");}
 rect(c,-24,-38,16,18,"#f1f2e4");rect(c,5,-38,16,18,"#f1f2e4");
 rect(c,-20,-30,8,9,"#283d48");rect(c,9,-30,8,9,"#283d48");
 for(let side of [-1,1]){
  c.save();c.scale(side,1);
  rect(c,21,-29,21,7,"#ae3832");rect(c,36,-40,15,21,"#e05b47");
  poly(c,[[37,-40],[46,-54],[51,-35]],"#f67a58");
  poly(c,[[40,-38],[36,-51],[33,-32]],"#df493b");
  c.restore();
 }c.restore();
}
function bird(c,x,y,boss=false,tick=0){
 c.save();c.translate(x,y);const s=boss?1.35:1;c.scale(s,s);
 oval(c,0,0,39,7,"#23354355");
 const flap=Math.sin(tick/105)*17;
 poly(c,[[-10,-42],[-39,-57-flap],[-29,-30],[-5,-28]],"#915aa9");
 poly(c,[[11,-40],[41,-61-flap],[29,-26],[6,-27]],"#bb83d0");
 oval(c,0,-37,21,22,"#d6a2e2");rect(c,9,-42,13,16,"#fbfaf1");rect(c,14,-38,5,8,"#263048");
 poly(c,[[17,-33],[41,-30],[18,-23]],"#f5c56d");
 rect(c,-9,-17,8,14,"#ba8162");rect(c,7,-17,8,14,"#ba8162");
 c.restore();
}
function boar(c,x,y,boss=false,tick=0){
 c.save();c.translate(x,y);const s=boss?1.48:1;c.scale(s,s);
 oval(c,0,0,46,7,"#1b2f3b5c");
 rect(c,-42,-49,76,38,"#613e48");rect(c,-38,-54,69,35,"#8b5861");
 rect(c,-37,-52,21,8,"#b98271");rect(c,22,-45,21,25,"#a66b73");
 for(const dx of [-28,14]){rect(c,dx,-17,14,19,"#503d43");rect(c,dx,-3,17,5,"#342f35");}
 rect(c,11,-56,16,18,"#dcb9aa");rect(c,17,-52,6,10,"#302e35");
 rect(c,31,-29,24,15,"#dc938a");
 for(const y0 of [-22,-36]){poly(c,[[31,y0],[48,y0+5],[31,y0+11]],"#fff0cc");}
 rect(c,-29,-62,10,12,"#a76a70");rect(c,-31,-67,12,9,"#704a55");
 c.restore();
}
function enemy(c,kind,x,y,boss,time){
 if(kind==="snail")snail(c,x,y,boss,time);
 else if(kind==="crab")crab(c,x,y,boss,time);
 else if(kind==="bird")bird(c,x,y,boss,time);
 else boar(c,x,y,boss,time);
 if(boss){text(c,"⚡ BOSS ⚡",x,y-129,19,"#ffe193","#51324a");}
}
function checkpoint(c,x,theme,ready=false){
 rect(c,x,380,10,178,"#694636");rect(c,x+4,385,4,164,"#c48b4f");
 poly(c,[[x+11,396],[x+90,407],[x+11,442]],ready?"#46b77c":"#ca5e48");
 text(c,"✓",x+37,428,23,"#fff8e4","#356055");
 boxSign(c,x-33,448,108,"CHECKPOINT");
}
function boxSign(c,x,y,w,label){
 rect(c,x,y+4,w,31,"#4c3030");rect(c,x+2,y,w-4,31,"#a36843");rect(c,x+5,y+3,w-10,25,"#654531");
 text(c,label,x+w/2,y+21,13,"#fce6a8","#463737");
}
function flag(c,x,y){
 rect(c,x,G-150,11,150,"#5d473e");rect(c,x+4,G-152,5,140,"#edcb76");
 poly(c,[[x+12,G-148],[x+135,G-125],[x+12,G-89]],"#b54853");
 poly(c,[[x+15,G-143],[x+118,G-125],[x+15,G-103]],"#e96d54");
 text(c,"★",x+52,G-117,28,"#ffeb94","#823d3c");
}
function drawScene(c,stageIndex,stage,camera,time,player,enemies,pickups,sparks){
 const theme=THEMES[stageIndex%THEMES.length];c.clearRect(0,0,W,H);
 const grad=c.createLinearGradient(0,0,0,H);grad.addColorStop(0,theme.sky);grad.addColorStop(.73,theme.sky2);grad.addColorStop(1,"#f8e9c2");c.fillStyle=grad;c.fillRect(0,0,W,H);
 oval(c,1030-camera*.025,116,60,60,stageIndex===6?"#ffeccc":"#fff0a1");oval(c,1030-camera*.025,116,76,76,"#fff4bb40");
 for(let k=-1;k<9;k++){const x=k*300-(camera*.1)%300+rand(k,2)*90,y=80+(k*43)%125;cloud(c,x,y,.55+rand(k,4)*.4);}
 // broad parallax mountains
 for(let k=-2;k<12;k++){
 const x=k*250-(camera*.12)%250+60;hill(c,x,432,260,theme.mount,"#d8ecdf70");
 }
 for(let k=-2;k<14;k++){
 const x=k*190-(camera*.25)%190+45;hill(c,x,498,180,theme.mount2,"#9cbdc180");
 }
 rect(c,0,490,W,135,theme.sea);
 for(let j=0;j<21;j++){const x=j*72-(camera*.12)%72;rect(c,x,508+(j%3)*16,42,3,"#a6eeed");}
 forest(c,stageIndex,camera,false);
 // Decorative distant waterfall.
 if(stageIndex===2||stageIndex===7){const waterfall=1850-camera*.31;if(waterfall>-180&&waterfall<1450){rect(c,waterfall,343,100,210,"#65cce3");for(let j=0;j<7;j++)rect(c,waterfall+j*15,344,8,210,"#b9eff3");}}
 // Foreground far palm silhouettes before ground.
 for(let i=0;i<10;i++){const wx=i*476+140;const px=wx-camera*.8;if(px>-210&&px<W+210)palm(c,px,G+18,.64+(i%3)*.05,i%3===0);}
 if(stageIndex===0)hut(c,120-camera,G);
 ground(c,stageIndex,stage,camera);
 for(const ob of stage.obstacles){
   const x=ob.x-camera;if(x>W+70||x+ob.w<-70)continue;
   // Solid, highly visible jump-over timber barricade.
   rect(c,x,G-ob.h,ob.w,ob.h,"#57372c");rect(c,x+3,G-ob.h+4,ob.w-6,ob.h-9,"#a56b45");
   rect(c,x+8,G-ob.h+8,ob.w-15,5,"#e0a66c");
   rect(c,x+8,G-ob.h+18,ob.w-15,3,"#744633");
   for(let j=0;j<3;j++)rect(c,x+10+j*13,G-ob.h+4,5,4,"#edbe76");
   text(c,"↑",x+ob.w/2,G-ob.h-11,25,"#fff4ae","#5b4634");
 }
 for(const p of pickups){if(p.taken)continue;const x=p.x-camera;if(x>-80&&x<W+80)token(c,x,p.y,p.type,time);}
 for(let i=0;i<enemies.length;i++){
 const e=enemies[i];if(e.defeated)continue;let x=e.x-camera;
 if(x<-170||x>W+170)continue;
 const y=e.kind==="bird"?G-90+Math.sin(time/300+i)*25:G;
 enemy(c,e.kind,x,y,e.boss,time);
 const arrow=e.boss?"☠": "!";
 text(c,arrow,x,y-(e.boss?155:90)+Math.sin(time/220)*4,e.boss?28:30,"#fff3a3","#99433f");
 }
 const xx=player.x-camera,yy=player.y,walking=Math.abs(player.vx)>10&&player.grounded;
 hero(c,xx,yy,player.hero,player.facing,walking,time);
 for(const s of sparks){oval(c,s.x-camera,s.y,Math.max(1,s.life*4),Math.max(1,s.life*4),s.color);}
 const behind=stage.checkpoint||1760;
 if(behind-camera>-140&&behind-camera<1420)checkpoint(c,behind-camera,stageIndex,player.x>=behind);
 const finish=STAGE_LENGTH-115;if(finish-camera>-145&&finish-camera<1420)flag(c,finish-camera,G);
 // In-world scenery nameplate.
 if(player.x<320){boxSign(c,116-camera,G-122,250,"STAGE "+(stageIndex+1)+" · "+theme.name.toUpperCase());}
}
window.IslandArt={W,H,G,STAGE_LENGTH,THEMES,drawScene,hero,enemy,token,cloud};
})();