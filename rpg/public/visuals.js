(function RPGArtFactory(){
  "use strict";
  const S=40,W=960,H=640;
  const palette=[
    {kind:"hero",hair:"#633e32",highlight:"#b87a4e",top:"#3270a8",accent:"#e94d4d",cape:"#b53640",skin:"#f3c397",boot:"#5f3d46"},
    {kind:"knight",hair:"#d69b50",highlight:"#f8d07f",top:"#7895b4",accent:"#ffe28d",cape:"#4764b2",skin:"#f6cba1",boot:"#5d5362"},
    {kind:"wizard",hair:"#ad6bde",highlight:"#ecc1fd",top:"#7650c7",accent:"#fcc56c",cape:"#ab75df",skin:"#f1b8a0",boot:"#503d7a"},
    {kind:"ranger",hair:"#c78d4b",highlight:"#ffcd7a",top:"#3d9978",accent:"#e8d070",cape:"#47775c",skin:"#eebc93",boot:"#57452e"},
    {kind:"elder",hair:"#e2e9e4",highlight:"#ffffff",top:"#315e9f",accent:"#e2b65e",cape:"#533d8e",skin:"#e9bc9c",boot:"#4d435e"},
    {kind:"librarian",hair:"#efb954",highlight:"#ffeb9e",top:"#3e91b5",accent:"#f1d67c",cape:"#2b5f94",skin:"#f4bf9d",boot:"#4c6094"},
    {kind:"captain",hair:"#614036",highlight:"#bd8060",top:"#bb3548",accent:"#f8c653",cape:"#bb4a31",skin:"#f6bc94",boot:"#534353"},
    {kind:"asha",hair:"#df7bbd",highlight:"#ffbee4",top:"#8c49a8",accent:"#ffcf7f",cape:"#783a98",skin:"#e7af9f",boot:"#483a68"},
    {kind:"finn",hair:"#a96a35",highlight:"#f0c379",top:"#44895a",accent:"#d6c27b",cape:"#3d6241",skin:"#edbc87",boot:"#6c5036"},
    {kind:"professor",hair:"#a5afc1",highlight:"#eff5f8",top:"#51758d",accent:"#edcc7a",cape:"#7b5a56",skin:"#efc19f",boot:"#454c58"},
    {kind:"nova",hair:"#c18c61",highlight:"#eed2a0",top:"#a3b1c5",accent:"#f3cf5d",cape:"#c84d64",skin:"#f0b990",boot:"#404960"},
    {kind:"keeper",hair:"#c9adeb",highlight:"#fff1ff",top:"#83b8dd",accent:"#ffe797",cape:"#9e7fe4",skin:"#f6d1b5",boot:"#6655a4"}
  ];
  const NPC_SPRITES=[4,5,6,7,8,9,10,11];
  const cache=new Map(),portraitCache=new Map();
  let base=null;
  function box(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function rng(x,y,k=0){const v=Math.sin((x*127.1+y*311.7+k*74.7)*1.7)*43758.5453;return v-Math.floor(v);}
  function polygon(c,pts,color){c.fillStyle=color;c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();c.fill();}
  function sprite(actor,phase=0){
    const key=actor+"-"+phase;if(cache.has(key))return cache.get(key);
    const p=palette[actor]||palette[0],c=document.createElement("canvas");c.width=32;c.height=43;
    const d=c.getContext("2d");d.imageSmoothingEnabled=false;
    // Clear 1-pixel black silhouettes around all clothing, hands, and hair.
    box(d,7,23,19,13,"#302f45");
    box(d,6,24,21,8,p.cape);
    box(d,7,26,5,9,"#6c3555");box(d,24,26,4,10,p.cape);
    // Two moving boots: alternating feet when walking.
    const offset=phase?2:0;
    box(d,9,34-offset,6,6,"#242e43");box(d,19,34+offset,6,6,"#242e43");
    box(d,8,39-offset,9,2,p.boot);box(d,18,39+offset,9,2,p.boot);
    box(d,10,32-offset,6,4,"#414a6c");box(d,19,32+offset,6,4,"#414a6c");
    box(d,8,23,20,12,"#253443");box(d,10,24,16,9,p.top);
    box(d,12,24,3,8,p.accent);box(d,20,24,3,8,p.accent);
    box(d,12,26,12,3,"#ffffff32");box(d,12,32,12,2,"#374452");
    box(d,14,32,4,2,"#ebbe56");
    box(d,6,24,4,9,"#40364b");box(d,26,24,4,9,"#40364b");
    box(d,5,28,5,4,p.skin);box(d,27,28,5,4,p.skin);
    box(d,7,24,4,4,p.top);box(d,26,24,4,4,p.top);
    box(d,14,20,8,6,p.skin);
    // Head: darker silhouette, ears, subtle gradient skin shading.
    box(d,7,8,21,16,"#342e3c");box(d,8,6,18,18,"#342e3c");
    box(d,5,15,3,6,"#614c48");box(d,28,15,3,6,"#614c48");
    box(d,7,15,3,6,p.skin);box(d,27,15,3,6,p.skin);
    box(d,9,9,17,13,p.skin);
    box(d,10,18,15,4,"#e8a98c");box(d,11,13,15,5,"#f6caaa");
    // Fringe behind black-outlined eyes.
    box(d,8,5,20,8,p.hair);box(d,7,9,5,6,p.hair);box(d,25,8,5,7,p.hair);
    box(d,10,4,12,5,p.hair);box(d,12,4,10,3,p.highlight);
    box(d,8,11,7,3,p.hair);box(d,19,9,8,3,p.hair);
    box(d,12,13,5,4,"#fff8ed");box(d,20,13,5,4,"#fff8ed");
    box(d,14,14,2,3,"#272e3e");box(d,22,14,2,3,"#272e3e");
    box(d,14,14,1,1,"#ffffff");box(d,22,14,1,1,"#ffffff");
    box(d,11,18,3,1,"#da8b87");box(d,24,18,2,1,"#da8b87");
    box(d,17,20,4,1,"#a45e5f");box(d,18,20,2,1,"#ffded0");
    // Particular hats, beards, weapons, glasses and distinctive silhouettes.
    const k=p.kind;
    if(k==="hero"){
      box(d,6,6,4,5,p.hair);box(d,11,3,7,4,p.hair);box(d,22,3,5,5,p.hair);
      polygon(d,[[9,22],[28,20],[28,28],[15,26]],"#d33841");
      box(d,3,15,3,17,"#2b354f");box(d,4,11,2,21,"#e7d99d");box(d,2,9,6,5,"#a9d9e8");box(d,4,7,2,5,"#ffffff");
    }else if(k==="knight"||k==="nova"){
      box(d,6,5,22,7,"#475b7d");box(d,8,2,19,6,"#a8b9cf");
      box(d,10,3,15,2,"#f6f6e4");box(d,5,10,4,12,"#a6b1c0");box(d,27,10,4,12,"#8297ac");
      box(d,9,10,19,2,"#425473");box(d,3,15,3,19,"#414655");box(d,4,9,2,25,"#e8cc79");
      box(d,13,23,10,5,"#e9dc89");
      if(k==="nova"){box(d,13,0,11,5,"#e6c458");box(d,20,0,4,2,"#fff4ae");}
    }else if(k==="wizard"||k==="asha"){
      polygon(d,[[3,7],[16,0],[23,9]],"#392b65");
      polygon(d,[[5,7],[15,0],[21,8]],k==="asha"?"#874bd0":"#6549c8");
      box(d,5,7,24,4,"#37265b");box(d,7,8,20,2,"#dfb779");box(d,17,3,3,3,"#ffdc69");
      box(d,27,23,2,17,"#674d48");box(d,25,18,6,6,"#7de3ef");box(d,26,19,4,4,"#ecfff2");
    }else if(k==="elder"){
      box(d,8,4,21,8,"#dfe9f1");box(d,5,10,6,8,"#e0e6e9");box(d,24,9,5,9,"#e0e6e9");
      box(d,11,19,15,8,"#e7eaeb");box(d,14,24,8,5,"#b4bccc");box(d,14,17,3,2,"#e5e7e3");
      box(d,28,20,2,20,"#85674a");box(d,27,14,5,8,"#e6b85a");box(d,28,15,3,5,"#fff1bd");
    }else if(k==="librarian"){
      box(d,23,2,9,11,"#dba44d");box(d,26,4,5,8,p.highlight);
      box(d,6,7,24,4,"#234e7d");box(d,12,4,16,6,"#578db9");
      box(d,10,27,15,4,"#fff7db");box(d,9,27,6,3,"#e5c57e");box(d,28,25,3,9,"#d5bf95");
    }else if(k==="captain"){
      box(d,5,6,24,5,"#ad343a");box(d,7,2,20,7,"#c44b53");box(d,10,3,9,3,"#f2c361");box(d,4,11,7,3,"#5a3342");
      box(d,3,26,5,10,"#594657");box(d,4,23,3,5,"#ecc96c");
      polygon(d,[[22,25],[29,27],[29,35],[25,32]],"#f3bf62");
    }else if(k==="ranger"||k==="finn"){
      polygon(d,[[4,7],[26,2],[29,10]],"#2d6146");box(d,4,7,25,5,"#396b43");box(d,10,8,16,2,"#d3b46b");
      box(d,27,17,3,17,"#8c5836");box(d,26,17,4,2,"#f1cb83");
      if(k==="finn"){box(d,27,18,3,12,"#e8c779");}
    }else if(k==="professor"){
      box(d,6,7,23,6,"#b9c4cb");box(d,7,4,20,5,"#eef1d8");
      box(d,10,14,9,7,"#c4eafa");box(d,20,14,9,7,"#c4eafa");
      box(d,12,16,4,2,"#2e5778");box(d,22,16,4,2,"#2e5778");
      box(d,18,16,3,2,"#4e555e");box(d,9,14,1,7,"#597283");box(d,29,14,1,7,"#597283");
      box(d,13,25,12,5,"#e9ddc4");box(d,17,26,4,8,"#ad564c");
    }else if(k==="keeper"){
      box(d,5,6,5,14,"#b4a1e8");box(d,26,5,4,17,"#d3b4f9");box(d,12,4,15,4,"#e2cefb");
      for(let i=0;i<3;i++){box(d,5+i*8,2,3,5,"#fff0bc");box(d,6+i*8,1,1,2,"#f5b5ec");}
      polygon(d,[[2,24],[9,11],[12,24]],"#b3edf3");polygon(d,[[26,24],[31,11],[31,24]],"#b3edf3");
      box(d,16,29,6,5,"#e4f3f0");
    }
    // Reflective pixels and gold costume details.
    box(d,11,24,2,3,"#ffffff60");box(d,23,28,2,4,"#e7c660");
    cache.set(key,c);return c;
  }
  function portrait(i,player=false){
    const actor=player?i:NPC_SPRITES[i];const key=(player?"h":"n")+actor;
    if(portraitCache.has(key))return portraitCache.get(key);
    const cv=document.createElement("canvas");cv.width=128;cv.height=144;const ctx=cv.getContext("2d");ctx.imageSmoothingEnabled=false;
    ctx.fillStyle="#1c455e";ctx.fillRect(0,0,128,144);
    for(let j=0;j<7;j++){box(ctx,j*22,14+(j%3)*10,13,30,j%2?"#355d70":"#31526b");}
    ctx.drawImage(sprite(actor),12,-2,104,140);
    const out=cv.toDataURL("image/png");portraitCache.set(key,out);return out;
  }
  function tree(ctx,x,y,v){
    const X=x*S,Y=y*S;
    box(ctx,X+13,Y+29,13,11,"#3b5132");
    box(ctx,X+16,Y+25,8,11,"#85583e");
    box(ctx,X+18,Y+26,3,10,"#bd8650");
    // Tiered leafy clusters, three-tone with hand-set irregular silhouette.
    box(ctx,X+6,Y+16,29,15,"#1e6347");
    box(ctx,X+3,Y+18,34,9,"#1e6347");
    box(ctx,X+8,Y+8,25,18,"#2b8454");
    box(ctx,X+12,Y+4,18,9,"#2e8951");
    box(ctx,X+7,Y+20,27,5,"#41a565");
    box(ctx,X+13,Y+9,13,4,"#65b76d");
    box(ctx,X+22,Y+16,8,3,"#72c777");
    box(ctx,X+10,Y+14,6,3,"#4db76e");
    box(ctx,X+5,Y+25,9,3,"#348752");
    if(v%3===0){box(ctx,X+27,Y+21,3,3,"#fc6f90");box(ctx,X+18,Y+14,3,3,"#e5e68a");}
    else if(v%3===1){box(ctx,X+13,Y+18,3,3,"#f2cc75");}
    box(ctx,X+9,Y+27,4,2,"#173b30");
  }
  function flower(ctx,x,y,v){
    const colors=["#f398b6","#ffe2a5","#e6c6f6","#faf7e8","#9ce6df"];
    const base=colors[v%5];
    box(ctx,x+4,y+8,2,7,"#347d4c");box(ctx,x+0,y+5,9,8,base);box(ctx,x+3,y+2,4,15,base);
    box(ctx,x+3,y+7,3,3,"#ffe37a");
    box(ctx,x+2,y+13,5,2,"#316d42");
  }
  function house(ctx,x,y,roof){
    const X=x*S,Y=y*S;
    // Wooden shadows, floor, chimney, slanted roof and tiled highlights.
    box(ctx,X+4,Y+30,100,61,"#62473e");
    box(ctx,X+9,Y+34,90,54,"#e9c792");
    for(let row=0;row<4;row++)for(let col=0;col<8;col++)if((row+col)%3===0)box(ctx,X+12+col*10,Y+39+row*11,7,2,"#dbad77");
    box(ctx,X+73,Y-17,13,33,"#a66c56");
    box(ctx,X+75,Y-14,9,26,"#cc9983");
    polygon(ctx,[[X-5,Y+32],[X+53,Y-18],[X+111,Y+32]],"#493f54");
    polygon(ctx,[[X+1,Y+28],[X+53,Y-13],[X+105,Y+28]],roof);
    polygon(ctx,[[X+16,Y+22],[X+54,Y-7],[X+91,Y+22]],roof==="#9d3f4c"?"#c25b61":"#497daf");
    for(let row=0;row<4;row++)for(let col=0;col<7-row;col++){
      const xx=X+18+row*9+col*9,yy=Y+12+row*6;
      box(ctx,xx,yy,8,2,"#ffffff20");
    }
    box(ctx,X+44,Y+57,25,34,"#684a3f");box(ctx,X+47,Y+59,19,30,"#835b48");
    box(ctx,X+60,Y+74,3,3,"#f6d18b");
    for(const xx of [X+18,X+81]){box(ctx,xx-2,Y+50,17,19,"#654e4b");box(ctx,xx,Y+51,13,14,"#4ca2bd");box(ctx,xx+2,Y+52,4,12,"#9adfed");box(ctx,xx+6,Y+51,2,14,"#f8e5bb");}
    box(ctx,X-5,Y+89,118,5,"#745243");
    // Garden planter.
    box(ctx,X-5,Y+79,18,10,"#8e5a40");
    flower(ctx,X-2,Y+68,x+y);flower(ctx,X+5,Y+71,x+y+2);
  }
  function keep(ctx){
    const X=864,Y=1;
    box(ctx,X-10,Y+23,103,130,"#40565d");
    box(ctx,X,Y+19,87,122,"#96a9ad");
    for(let y=0;y<9;y++)for(let x=0;x<6;x++){box(ctx,X+x*15+(y%2?6:0),Y+23+y*12,13,10,(x+y)%3?"#b7b7a9":"#9eafb2");}
    for(const xx of [-15,73]){box(ctx,X+xx,Y+8,32,94,"#677f8e");box(ctx,X+xx+4,Y+12,24,86,"#a1b5bb");for(let j=0;j<3;j++)box(ctx,X+xx+j*11,Y+0,9,14,"#8faab1");}
    polygon(ctx,[[X-20,Y+4],[X+7,Y-30],[X+38,Y+4]],"#6d4664");
    polygon(ctx,[[X+55,Y+4],[X+91,Y-33],[X+107,Y+4]],"#6d4664");
    box(ctx,X+26,Y+75,37,66,"#4d3c50");box(ctx,X+32,Y+77,24,64,"#293c52");
    box(ctx,X+38,Y+30,13,26,"#36587c");box(ctx,X+41,Y+30,7,17,"#e5bf78");
    box(ctx,X+26,Y+67,39,7,"#dfc17a");
  }
  function drawStatic(treeSet){
    const canvas=document.createElement("canvas");canvas.width=W;canvas.height=H;const c=canvas.getContext("2d");c.imageSmoothingEnabled=false;
    for(let y=0;y<16;y++)for(let x=0;x<24;x++){
      const px0=x*S,py0=y*S,road=(y===7||y===8||x===4&&y>=3&&y<=13||x===10&&y>=3&&y<=14||x===17&&y>=2&&y<=13||x===21&&y>=3&&y<=13);
      if(road){
        box(c,px0,py0,40,40,((x+y)%5===0)?"#e1c69a":"#dfc69e");
        box(c,px0,py0,40,2,"#cdb18d");
        for(let k=0;k<6;k++){let xx=px0+Math.floor(rng(x,y,k)*37),yy=py0+Math.floor(rng(y,x,k)*38);box(c,xx,yy,2+(k%3),2,(k%2)?"#c9a77c":"#f5dcb0");}
      }else{
        const green=["#69b763","#72be67","#76c270","#7dc679","#6dbb65","#73c470"];box(c,px0,py0,40,40,green[(x*5+y*7)%green.length]);
        for(let k=0;k<12;k++){const xx=px0+Math.floor(rng(x,y,k)*38),yy=py0+Math.floor(rng(x+10,y+20,k)*37);box(c,xx,yy,3+(k%3),2,k%4===0?"#4b9a52":"#8bd184");}
        if(rng(x,y,90)>.75)flower(c,px0+Math.floor(rng(y,x,40)*23),py0+Math.floor(rng(y,x,41)*20),x+y);
        if(rng(x,y,78)>.9){box(c,px0+25,py0+19,9,6,"#908d78");box(c,px0+27,py0+19,6,2,"#d7dac0");}
      }
    }
    // Water is drawn on the central vertical channel and bridge is fully traversable at y7 and y8.
    for(let y=0;y<16;y++){
      if(y===7||y===8)continue;
      box(c,12*S,y*S,S,S,"#3cabc6");box(c,12*S+4,y*S,S-8,S,"#44bdd4");
      box(c,12*S,y*S,5,S,"#aaae87");box(c,13*S-5,y*S,5,S,"#b6c6a0");
      for(let k=0;k<4;k++)box(c,12*S+5+Math.floor(rng(12,y,k)*25),y*S+Math.floor(rng(y,12,k)*36),7,2,"#b0e8e7");
    }
    // No bridge blocks river crossing: shaded timber across y7-8.
    box(c,12*S-10,7*S,60,80,"#524339");
    box(c,12*S-7,7*S+2,54,76,"#b88453");
    for(let y=0;y<8;y++){box(c,12*S-5,7*S+y*10+1,50,8,(y%2)?"#b78350":"#d39b61");box(c,12*S-5,7*S+y*10+9,50,2,"#624c42");}
    for(const xx of [12*S-11,12*S+46]){box(c,xx,7*S-7,7,95,"#744d3b");for(let y=0;y<7;y++)box(c,xx,7*S+y*14,7,4,"#e0a66b");}
    // Houses stay behind the characters.
    house(c,6,10,"#9d3f4c");house(c,6,0,"#39729b");house(c,15,12,"#9d3f4c");house(c,20,8,"#39729b");
    keep(c);
    [...treeSet].forEach((loc,i)=>{const [x,y]=loc.split(",").map(Number);tree(c,x,y,i);});
    for(const [x,y] of [[2,4],[8,7],[19,2],[6,13],[15,8],[23,12],[14,4]]){
      box(c,x*S+11,y*S+12,22,7,"#f2d48d");box(c,x*S+15,y*S+20,4,17,"#74553d");box(c,x*S+12,y*S+13,3,5,"#916b3a");
    }
    base=canvas;
  }
  function aura(ctx,x,y,solved,active,time){
    const cx=x*S+20,cy=y*S+31;
    ctx.beginPath();ctx.ellipse(cx,cy+4,23+(active?Math.sin(time/290)*2:0),10,0,0,Math.PI*2);
    ctx.fillStyle=solved?"#50f4aa5b":active?"#fff0a675":"#b6cbe53b";ctx.fill();
    ctx.beginPath();ctx.ellipse(cx,cy+3,17,6,0,0,Math.PI*2);
    ctx.strokeStyle=solved?"#62efb6":active?"#f5d368":"#7a95a6";ctx.lineWidth=2;ctx.stroke();
  }
  function drawWorld(ctx,st,treeSet,npcs,unlockedFn){
    if(!base)drawStatic(treeSet);
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(base,0,0);
    const time=performance.now(),wave=Math.floor(time/180);
    // Water animations.
    for(let y=0;y<16;y++){if(y===7||y===8)continue;
      for(let k=0;k<3;k++){const x=486+((wave*3+y*13+k*9)%25),yy=y*40+((wave*2+k*14)%31);
        box(ctx,x,yy,7,2,k===1?"#b5eff0":"#70d9dc");}
    }
    // Magical fireflies on the path and flowers.
    for(let i=0;i<14;i++){
      const x=18+Math.floor(rng(i,3,2)*920),y=18+Math.floor(rng(i,9,2)*600);
      const glow=(Math.sin(time/420+i*3)+1)/2;
      ctx.globalAlpha=.15+glow*.65;box(ctx,x,y,3,3,i%3===0?"#fff4a3":"#eaffc1");ctx.globalAlpha=1;
    }
    npcs.forEach((n,i)=>{
      const solved=st.progress?.missions[i]?.completed===5,open=unlockedFn(i);
      aura(ctx,n.x,n.y,solved,open,time);
      const bob=Math.round(Math.sin(time/500+i*1.7)*1.3);
      ctx.drawImage(sprite(NPC_SPRITES[i],Math.floor(time/380)%2),n.x*S-4,n.y*S-9+bob,48,57);
      const X=n.x*S,Y=n.y*S;
      // Floating quest indicators; distinctive shimmering alerts.
      box(ctx,X+12,Y-22,19,17,solved?"#399d6e":open?"#f5cf68":"#687c90");
      box(ctx,X+14,Y-20,15,13,solved?"#a2f2b8":open?"#fff3c1":"#91a3a8");
      ctx.fillStyle=solved?"#275a46":"#654c2f";ctx.font="bold 15px Arial";ctx.textAlign="center";
      ctx.fillText(solved?"✓":open?"!":"•",X+21,Y-8);
      ctx.textAlign="left";
      ctx.font="bold 11px Nunito,Arial";
      const short=n.name.replace(" the Librarian","").replace("Crystal Keeper","Keeper");
      const tw=Math.min(102,Math.max(56,ctx.measureText(short).width+14));
      box(ctx,X+20-tw/2,Y+41,tw,17,"#172b45");
      box(ctx,X+20-tw/2,Y+41,tw,2,solved?"#60daa5":open?"#f5cc6e":"#4c7897");
      ctx.fillStyle="#fef6e5";ctx.textAlign="center";ctx.fillText(short,X+20,Y+53);ctx.textAlign="left";
    });
    aura(ctx,st.px,st.py,false,true,time);
    const walking=Number(st.movingUntil)>time;
    ctx.drawImage(sprite(st.hero,walking?Math.floor(time/110)%2:0),st.px*S-5,st.py*S-8+(walking?Math.round(Math.sin(time/100)*1.5):0),50,60);
    // A glowing hero marker remains distinguishable among NPCs.
    box(ctx,st.px*S+14,st.py*S-20,12,6,"#f8dfa4");
    box(ctx,st.px*S+18,st.py*S-22,4,2,"#fff8c8");
    if(st.progress?.completed===40){
      box(ctx,290,266,390,74,"#1e405bcc");box(ctx,296,272,378,61,"#f6d782");
      ctx.fillStyle="#403a57";ctx.font="bold 26px Nunito";ctx.textAlign="center";
      ctx.fillText("✨ ALL 8 CRYSTALS RESTORED ✨",485,308);ctx.textAlign="left";
    }
  }
  window.RPGArt={drawWorld,portrait,sprite};
})();