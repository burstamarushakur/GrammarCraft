function svg(body,view='0 0 32 32',cls=''){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" class="${cls}" aria-hidden="true" shape-rendering="crispEdges">${body}</svg>`;}
function r(x,y,w,h,c){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;}
function icon(name,size=24){
 const p={
 grass:r(2,3,28,26,'#6a4d32')+r(2,3,28,9,'#7ac556')+r(2,10,5,5,'#7ac556')+r(18,10,6,4,'#7ac556')+r(6,18,7,5,'#986c42')+r(20,24,7,4,'#986c42'),
 map:r(3,5,9,22,'#dfd797')+r(12,3,9,22,'#ece6b6')+r(21,5,8,22,'#b7cd83')+r(7,11,4,4,'#81a74f')+r(14,17,5,3,'#81a74f')+r(22,10,4,6,'#61956f'),
 diamond:`<path d="M10 3h12l9 11-15 17L1 14z" fill="#4ab4bd"/><path d="M10 5h11l-5 9H3z" fill="#a8f3ec"/><path d="m17 15 10-1-11 13z" fill="#337e8c"/>`,
 star:`<path d="M12 2h8v8h10v8h-6v11h-8v-5h-8v5H3V17H0v-7h12z" fill="#efb543"/><path d="M12 6h7v8h8v3H7v-3h5z" fill="#ffe38c"/>`,
 trophy:r(8,3,17,14,'#e7b43d')+r(5,5,3,10,'#bc832c')+r(25,5,3,10,'#bc832c')+r(10,17,12,4,'#d59e35')+r(14,20,4,6,'#be8a31')+r(8,26,16,4,'#735936')+r(11,6,4,7,'#ffe294'),
 sound:r(3,11,6,10,'#4e7854')+`<path d="M9 11 19 4v24L9 21z" fill="#4e7854"/>`+r(23,9,3,14,'#7fa36b')+r(28,5,3,22,'#a4bd8c'),
 mute:r(3,11,6,10,'#71816c')+`<path d="M9 11 19 4v24L9 21z" fill="#71816c"/><path d="m23 10 8 12m0-12-8 12" stroke="#b37065" stroke-width="3"/>`,
 help:r(5,4,22,23,'#eabf58')+r(3,7,3,15,'#eabf58')+r(27,7,3,15,'#eabf58')+r(12,7,9,4,'#fff1c0')+r(18,11,4,5,'#fff1c0')+r(13,16,5,4,'#fff1c0')+r(13,23,5,3,'#fff1c0'),
 book:r(4,4,23,25,'#678658')+r(7,5,20,21,'#ebe7c4')+r(9,8,14,3,'#a9b58a')+r(9,14,11,2,'#a9b58a')+r(9,19,14,2,'#a9b58a'),
 shop:r(5,12,23,17,'#d8b277')+r(3,4,27,8,'#da7856')+r(8,4,5,8,'#ffdb9e')+r(18,4,5,8,'#ffdb9e')+r(9,17,7,12,'#88694d')+r(19,17,6,6,'#93cad6'),
 bridge:r(1,19,30,5,'#b08455')+r(1,12,3,14,'#765b3c')+r(28,12,3,14,'#765b3c')+r(10,13,3,11,'#987146')+r(19,13,3,11,'#987146')+r(2,12,28,3,'#d6b380')+r(0,26,32,4,'#7abcc2'),
 train:r(3,11,25,15,'#4e9670')+r(8,5,15,9,'#39805a')+r(11,8,9,6,'#b7dfcf')+r(28,17,3,8,'#3c6b4c')+r(3,26,7,5,'#344637')+r(21,26,7,5,'#344637')+r(5,19,21,3,'#a2c278'),
 boat:r(4,18,24,6,'#b28752')+r(8,24,16,4,'#88643e')+r(14,3,3,16,'#4e654c')+`<path d="M17 4 29 16H17z" fill="#fff5cf"/>`+r(1,29,29,2,'#74c1d0'),
 pickaxe:`<path d="m8 24 14-14 4 4-14 14z" fill="#b38658"/><path d="m9 5 5-4 15 8 2 5-4 5-5-7z" fill="#81a8b2"/>`+r(3,26,6,5,'#916a43'),
 portal:r(5,1,22,5,'#66537f')+r(3,6,6,25,'#66537f')+r(24,6,6,25,'#66537f')+r(9,6,15,24,'#b59bee')+r(13,10,7,17,'#d6b8ff')+r(5,27,23,4,'#66537f'),
 cat:r(8,8,17,15,'#e69753')+r(7,3,6,8,'#c87940')+r(21,3,6,8,'#c87940')+r(10,14,4,4,'#294236')+r(20,14,4,4,'#294236')+r(15,19,4,3,'#a0523c')+r(6,23,22,6,'#f7bc72'),
 castle:r(5,8,23,22,'#9faebb')+r(3,2,7,10,'#7c94a7')+r(13,2,7,10,'#7c94a7')+r(23,2,7,10,'#7c94a7')+r(12,20,9,10,'#596e7d')+r(7,13,4,5,'#c5d8df')+r(22,13,4,5,'#c5d8df'),
 arrow:`<path d="M3 13h18V7l9 9-9 9v-6H3z" fill="currentColor"/>`,
 back:`<path d="M29 13H11V7l-9 9 9 9v-6h18z" fill="currentColor"/>`,
 check:`<path d="m4 14 7 7L26 6l4 4-19 18L0 18z" fill="#558842"/>`,
 chest:r(3,7,27,20,'#906338')+r(3,7,27,7,'#d5a44f')+r(5,18,24,3,'#634b2f')+r(13,11,6,10,'#ffd364'),
 flag:r(7,2,3,28,'#62533b')+r(10,3,18,12,'#79aa51')+r(25,6,5,7,'#79aa51'),
 leaf:r(9,4,18,18,'#79ab61')+r(4,9,10,18,'#629458')+r(12,24,5,7,'#517d4b')+r(15,8,4,13,'#a5c97a')
 };return svg(p[name]||p.grass).replace('<svg ','<svg width="'+size+'" height="'+size+'" ');
}
function avatarArt(kind='explorer',x=0,y=0,scale=1){
 const skins={explorer:['#c08a62','#815638','#e7ad53','#6a7853'],boy:['#d6a076','#593b2c','#6daeb7','#344e73'],girl:['#d6a076','#463538','#a48dc8','#4e476a'],knight:['#cbaa83','#6f808c','#98acb6','#596b77']};
 const [skin,hair,shirt,pants]=skins[kind]||skins.explorer;
 const body=r(8,2,26,27,skin)+r(8,2,26,7,hair)+r(8,8,5,8,hair)+r(17,14,4,4,'#26352d')+r(29,14,4,4,'#26352d')+r(22,22,6,2,'#9d6649')+r(7,29,29,24,shirt)+r(1,30,6,25,skin)+r(36,30,6,25,skin)+r(10,53,11,17,pants)+r(24,53,10,17,pants)+r(8,69,13,5,'#3d4339')+r(24,69,12,5,'#3d4339')+(kind==='explorer'?r(5,0,31,5,'#867244')+r(9,-5,24,6,'#b19a57'):kind==='girl'?r(32,8,5,23,hair):kind==='knight'?r(7,0,28,10,hair)+r(7,9,4,17,hair)+r(31,9,4,17,hair):'');
 return `<g transform="translate(${x} ${y}) scale(${scale})">${body}</g>`;
}
function avatar(kind,cls=''){return svg(avatarArt(kind,5,7,.9),'0 0 49 79',cls);}
function tree(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})">${r(-8,-4,15,44,'#856342')}${r(1,-4,6,44,'#695137')}${r(-31,-44,59,40,'#3f8653')}${r(-24,-58,49,27,'#57964f')}${r(-17,-65,33,18,'#77ad55')}${r(10,-49,18,38,'#32774b')}${r(-24,-48,13,10,'#81b45f')}${r(-8,-26,12,8,'#659b4f')}</g>`;}
function house(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})">${r(-35,-28,71,54,'#edd5a0')}${r(26,-28,11,54,'#ccb281')}${r(-39,-41,78,15,'#986b43')}${r(-29,-53,57,13,'#b18050')}${r(-19,-61,38,9,'#c8995f')}${r(-8,-3,20,29,'#805c3c')}${r(-27,-16,13,16,'#8ec5cf')}${r(19,-16,12,16,'#8ec5cf')}${r(-35,23,71,6,'#8c7551')}</g>`;}
function chest(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})">${r(-25,-21,51,36,'#9b6c3e')}${r(-25,-21,51,13,'#c5934c')}${r(-25,-6,51,5,'#634b33')}${r(-3,-11,9,16,'#ffd76d')}${r(21,-19,5,33,'#805532')}</g>`;}
function tower(x,y,s=1,lit=false){return `<g transform="translate(${x} ${y}) scale(${s})">${r(-24,-75,50,85,'#91a7b2')}${r(17,-75,9,85,'#738c99')}${r(-29,-91,14,20,'#8da3b0')}${r(-6,-91,13,20,'#8da3b0')}${r(18,-91,14,20,'#8da3b0')}${r(-26,-73,57,10,'#b1c4cd')}${r(-6,-39,13,21,lit?'#ffe695':'#405c6a')}${r(-8,-5,17,15,'#566a6e')}${r(-22,-60,11,5,'#a8bdc5')}${r(4,-49,13,5,'#b1c4cd')}</g>`;}
function cloud(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})" class="cloud-drift">${r(0,13,75,15,'#fffdf7')}${r(13,0,27,28,'#fffdf7')}${r(38,7,25,21,'#fffdf7')}</g>`;}
function portal(x,y,s=1,lit=false){return `<g transform="translate(${x} ${y}) scale(${s})">${r(-29,-91,60,94,'#6b5888')}${r(-20,-82,42,85,lit?'#ead5ff':'#b596e0')}${r(-11,-73,24,76,'#d6baff')}${r(-27,-98,56,9,'#69517f')}${r(-36,3,75,12,'#686273')}<g class="portal-glow">${r(-9,-52,8,8,'#fff0ff')}${r(4,-20,7,9,'#f5e6ff')}${r(1,-66,7,7,'#f5e6ff')}</g></g>`;}
function worldArt(hero=false){
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 670" class="world-svg" aria-hidden="true" shape-rendering="crispEdges">
 <defs><pattern id="waves" width="60" height="45" patternUnits="userSpaceOnUse"><path d="M4 21h18v3H4zm35-13h15v3H39z" fill="#a1d4e5"/></pattern><pattern id="grassbits" width="58" height="43" patternUnits="userSpaceOnUse"><path d="M6 18h4v5H6zm8 3h4v4h-4zm23-8h5v6h-5z" fill="#78b367"/></pattern></defs>
 ${r(0,0,1100,670,'#bee3ef')}${r(0,0,1100,670,'url(#waves)')}${cloud(87,28,1.2)}${cloud(898,54,.95)}${cloud(753,584,.8)}
 <path d="M149 202h110v-60h130v-44h297v38h160v37h112v107h74v187h-97v93H679v28H422v-38H207v-79h-89V304h31z" fill="#649094" opacity=".23" transform="translate(8 23)"/>
 <path d="M143 195h110v-60h130V91h297v38h160v37h112v107h74v187h-97v93H673v28H416v-38H201v-79h-89V297h31z" fill="#8b6342" transform="translate(0 25)"/>
 <path d="M143 195h110v-60h130V91h297v38h160v37h112v107h74v187h-97v93H673v28H416v-38H201v-79h-89V297h31z" fill="#93c475"/>
 <path d="M143 195h110v-60h130V91h297v38h160v37h112v107h74v187h-97v93H673v28H416v-38H201v-79h-89V297h31z" fill="url(#grassbits)"/>
 <path d="M334 144h94v67h88v113h47v84h135v63h-65v-34H510V334h-49V244h-84v-59h-43z" fill="#73bacb"/><path d="M352 152h69v66h77v115h49v88h127v25H529V340h-48V235h-82v-70h-47z" fill="#9dd9dc"/>
 <path d="M205 474v-96h157v-87h94V190h378" fill="none" stroke="#d2c391" stroke-width="25" stroke-linecap="square" stroke-linejoin="miter"/><path d="M414 378h193v-42h143v168h197" fill="none" stroke="#d2c391" stroke-width="25" stroke-linecap="square"/>
 ${tree(140,322,.85)}${tree(257,209,.8)}${tree(606,156,1.05)}${tree(887,281,.9)}${tree(985,419,.9)}${tree(276,520,.65)}${tree(368,488,.6)}${tree(746,565,.65)}${tree(921,536,.7)}${tree(587,560,.8)}
 ${house(176,477,1.03)}${house(256,453,.7)}${house(307,438,.55)}${tower(927,486,1.1,true)}${tower(858,490,.8,false)}${portal(867,185,.85,hero)}${chest(710,333,.65)}
 ${r(391,331,97,11,'#987143')}${r(394,323,94,7,'#c29a63')}${r(391,316,8,33,'#765a39')}${r(480,316,8,33,'#765a39')}${r(417,316,6,15,'#8b6741')}${r(451,316,6,15,'#8b6741')}
 ${r(177,227,86,9,'#785c40')}${r(186,218,5,27,'#956e49')}${r(205,218,5,27,'#956e49')}${r(226,218,5,27,'#956e49')}${r(246,218,5,27,'#956e49')}${r(193,199,47,22,'#609564')}${r(210,185,29,19,'#4d8056')}${r(216,190,16,11,'#baddc2')}${r(196,221,9,9,'#3c5542')}${r(226,221,9,9,'#3c5542')}
 ${r(494,119,30,18,'#f7e8cd')}${r(513,131,13,11,'#ddcdae')}${r(495,138,5,12,'#775f43')}${r(516,138,5,12,'#775f43')}${r(524,135,4,3,'#3b4337')}
 ${r(685,256,76,26,'#7f9298')}${r(699,244,48,13,'#9cafb0')}${r(716,266,18,23,'#35494f')}${r(707,259,6,6,'#89d3d0')}${r(735,269,5,5,'#9bdfdb')}
 ${avatarArt('explorer',344,387,.7)}${avatarArt('girl',782,426,.55)}${chest(365,192,.45)}
 ${[[-0,0],[85,40],[15,185],[155,-40]].map(([x,y])=>r(585+x,276+y,7,7,'#fcdf88')+r(592+x,280+y,5,5,'#eebd59')).join('')}
 </svg>`;
}
function sceneArt(m,completed,kind,won=false){
 let body=r(0,0,800,260,'#caeaf4')+cloud(35,25,.7)+cloud(624,18,.65)+r(0,180,800,80,'#a9cc7d')+r(0,210,800,50,'#90b867')+tree(45,188,.8)+tree(752,193,.85);
 let runner=avatarArt(kind,170,134,1.05);
 if(m.type==='rune'){body+=house(465,176,1.8)+chest(321,201,.75)+r(420,224,112,8,'#6f8750');runner=avatarArt(kind,250,141,1.05);}
 if(m.type==='bridge'){body+=r(235,182,357,78,'#82c6d3')+r(247,219,328,5,'#a4e0e7')+r(259,181,15,59,'#7b6541')+r(564,181,15,59,'#7b6541');for(let i=0;i<5;i++)if(i<completed+(won?1:0))body+=r(269+i*59,190,57,15,'#c9a06c')+r(270+i*59,185,55,5,'#e1c08b');runner=avatarArt(kind,163,124,1.1);}
 if(m.type==='train'){body+=r(105,224,585,5,'#7c6949');for(let i=0;i<18;i++)body+=r(112+i*32,215,6,17,'#8e7450');body+=r(175,177,69,34,'#5e9870')+r(213,150,33,31,'#3f7855')+r(220,157,17,18,'#d7efd9')+r(183,208,15,14,'#324f39')+r(223,208,15,14,'#324f39');for(let i=0;i<completed+(won?1:0);i++)body+=r(260+i*68,180,59,31,'#c69957')+r(269+i*68,208,11,13,'#3f5039')+r(300+i*68,208,11,13,'#3f5039');runner=avatarArt(kind,230,125,.75);}
 if(m.type==='build'){body+=r(0,199,800,61,'#77bbcb')+r(160,216,410,30,'#4d97b0')+r(329,202,146,17,'#b08854')+r(344,218,116,16,'#987142')+r(401,105,7,100,'#785b3b')+`<path d="M410 109 469 188h-59z" fill="#fff2bf"/>`;runner=avatarArt(kind,367,134,.9);}
 if(m.type==='mine'){body=r(0,0,800,260,'#354254')+r(0,175,800,85,'#52636f')+r(25,25,119,109,'#445363')+r(180,0,80,130,'#425262')+r(609,32,131,114,'#435364')+r(297,47,254,163,'#283546')+r(279,31,286,28,'#6b7882')+r(278,54,26,160,'#667881')+r(544,50,28,165,'#647681');for(let i=0;i<5;i++)body+=r(357+i*32,178,22,18,i<completed+(won?1:0)?'#73e0d5':'#728690');body+=r(669,129,8,63,'#af8653')+r(665,115,16,19,'#ffc562')+r(670,106,6,15,'#ffe7a0');runner=avatarArt(kind,229,136,1.1);}
 if(m.type==='portal'){body=r(0,0,800,260,'#d3d9ec')+r(0,192,800,68,'#a9b7b1')+r(54,83,86,110,'#adbac4')+r(679,69,81,121,'#adb5c5')+portal(474,204,1.65,won)+r(340,218,266,12,'#828b90');runner=avatarArt(kind,280,136,1.1);}
 if(m.type==='place'){body+=tree(510,184,1.1)+house(295,187,.9);runner=avatarArt(kind,208,133,.95);body+=r(477,185,36,27,'#edb16c')+r(477,177,9,15,'#cc8d51')+r(502,177,9,15,'#cc8d51')+r(485,193,5,5,'#314839')+r(503,193,5,5,'#314839');}
 if(m.type==='compare'){body+=tower(411,193,1.35,completed>1)+tower(538,193,1.7,completed>3)+tower(641,193,.9,won)+r(367,203,297,12,'#7d916b');runner=avatarArt(kind,227,139,1.05);}
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 260" class="scene-svg" aria-hidden="true" shape-rendering="crispEdges">${body}<g class="runner">${runner}</g></svg>`;
}
function rescueArt(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 310" preserveAspectRatio="none" aria-hidden="true" shape-rendering="crispEdges">${cloud(20,18,.5)}${cloud(238,32,.7)}${r(26,174,119,93,'#bf945a')}${r(26,174,119,14,'#e5bd79')}${r(33,190,103,64,'#957343')}${r(35,183,96,62,'#b58c55')}${r(206,164,139,17,'#a57b4c')}${r(213,181,12,107,'#795d3d')}${r(322,181,12,107,'#795d3d')}${r(204,153,144,12,'#d7b27b')}${tree(436,188,1)}${r(452,232,45,63,'#9babaa')}${r(464,220,32,21,'#bbc9ba')}${r(543,232,43,63,'#91a79b')}${r(543,221,33,21,'#b0c4ad')}${r(497,284,47,5,'#79a964')}</svg>`;}
function objectArt(kind,size,lit=false){if(kind==='chest')return svg(chest(31,28,.95),'0 0 62 48').replace('<svg ','<svg width="'+size+'" height="'+Math.round(size*.7)+'" ');return svg(tower(36,102,1,lit),'0 0 73 118').replace('<svg ','<svg width="'+Math.round(size*.48)+'" height="'+size+'" ');}
