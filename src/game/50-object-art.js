// ---------- items and interactables (Batch 5 session 4, from docs/art/sprite-study.html) ----------
// Items keep their size but are drawn as small objects lit from the top left, sitting on a soft pool of their category
// colour (ITEM_CAT in src/data/art.js), with a shine that sweeps across now and then. Items the study does not show
// (quick items, herbs, tonics, sigils, maps...) keep their own drawing and get the same pool, shadow and shine.
// Interactables are drawn by FIX_ART (fixArt()), each keeping every state it shows (used, opened, dead, empty,
// spinning, fuse, power off). Translucent fills use a hex colour with globalAlpha (see "Speed rules" in CLAUDE.md).

// ---------- items ----------
const itemPoolTex={};
function itemPool(cat,x,y){let c=itemPoolTex[cat.rgb];
  if(!c){c=itemPoolTex[cat.rgb]=document.createElement('canvas');c.width=c.height=12;const q=c.getContext('2d'),gr=q.createRadialGradient(6,6,0,6,6,6);
    gr.addColorStop(0,'rgba('+cat.rgb+',.28)');gr.addColorStop(1,'rgba('+cat.rgb+',0)');q.fillStyle=gr;q.fillRect(0,0,12,12);}
  ctx.drawImage(c,x-6,y-4);}
function FA(c,a,x,y,w,h){const A0=ctx.globalAlpha;ctx.globalAlpha=A0*a;ctx.fillStyle=c;ctx.fillRect(x,y,w,h);ctx.globalAlpha=A0;}
function itemCat(it){return ITEM_CAT[ITEM_CAT_OF[it.type]||'gear'];}
// it.icon: drawn in a menu or the HUD (no pool, no shine)
function drawItem(it){
  const gx=Math.round(it.x-camX),gy=Math.round(it.y-camY),x=gx,y=Math.round(it.y-camY-(it.pop>0?Math.sin(it.pop/0.35*Math.PI)*5:0));it.ph+=0.05;
  const cat=itemCat(it);
  if(!it.icon)itemPool(cat,gx,gy);
  shadow(ctx,gx+.5,gy+2.6,4,1.3,.45);
  olDraw(it.icon?null:olItemKey(it),cat.ol,x-8,y-8,16,16,()=>itemBody(it,x,y));
  if(!it.icon){const sw=(T*.5+it.x*.013)%3;if(sw<.25){const sx=x-5+Math.floor(sw*40);FA('#fffae6',.55,sx,y-4,1,1);FA('#fffae6',.55,sx+1,y-3,1,1);}}}
function itemBody(it,x,y){const t=T;
  switch(it.type){
    case 'rounds':F('#3a2a14',x-4,y,8,3);F('#5a4220',x-4,y,8,1);for(const dx of[-3,-1,1]){F('#8a6a24',x+dx,y-3,2,4);F('#d8b450',x+dx,y-3,1,4);F('#f0dc90',x+dx,y-4,2,1);}F('#2a1e0e',x+3,y+1,1,1);break;
    case 'shells':for(const [dx,dy] of [[-3,-2],[0,-1]]){F('#6a1e16',x+dx,y+dy,3,5);F('#c04a3a',x+dx,y+dy,2,4);F('#e07a64',x+dx,y+dy,1,3);F('#e0bc60',x+dx,y+dy+3,3,2);F('#a8842e',x+dx+2,y+dy+3,1,2);}break;
    case 'nails':F('#2e3438',x-4,y-2,8,5);F('#5a6468',x-4,y-2,8,1);F('#3e464a',x-4,y-1,8,3);F(AMBER,x-4,y+1,8,1);for(const dx of[-3,-1,1,3])F('#d0d8dc',x+dx,y-3,1,1);break;
    case 'bolts':for(const dy of[-2,1]){F('#3a5262',x-4,y+dy,8,1);F('#a8cce0',x-4,y+dy-1,7,1);F('#eef8ff',x+3,y+dy-1,2,1);F('#5a7890',x-5,y+dy-2,2,1);F('#5a7890',x-5,y+dy,2,1);}break;
    case 'knives':for(const dy of[-2,1]){F('#5a3418',x-4,y+dy,3,2);F('#8a5a2e',x-4,y+dy,3,1);F('#9aa2a6',x-1,y+dy,5,1);F('#e8ecec',x-1,y+dy,4,1);F('#e8ecec',x+4,y+dy+1,1,1);}break;
    case 'cells':{F('#0e1a12',x-4,y-2,8,5);F('#24382a',x-4,y-2,8,1);const p=.55+.45*Math.sin(t*3);for(const dx of[-3,-1,1]){F('#1e4a2a',x+dx,y-1,2,3);FA('#96ffaa',p,x+dx,y-1,1,3);}FA('#96ffaa',.15*p,x-5,y-3,10,7);break;}
    case 'scrap':F('#4a5256',x-4,y-1,5,3);F('#9aa6ac',x-4,y-1,5,1);F('#7a868c',x,y-3,3,4);F('#b8c4c8',x,y-3,1,4);F('#8a4a24',x-2,y,1,1);F('#8a4a24',x+1,y-1,1,1);F('#3a4246',x-1,y+2,4,1);break;
    case 'pipe':F('#3e4c52',x-4,y-1,8,3);F('#7a8c93',x-4,y-1,8,2);F('#c4d2d6',x-4,y-1,8,1);F('#121616',x+3,y-1,1,2);F('#9aa8ae',x+4,y-1,1,3);break;
    case 'battery':F('#1a241c',x-2,y-3,5,7);F('#2c3a2f',x-2,y-3,4,7);F('#46584a',x-2,y-3,1,7);F('#5fae6e',x-2,y-1,4,2);F('#9fe0a8',x-2,y-1,1,1);F('#8a6a24',x-1,y-4,2,1);F('#f0d070',x-1,y-4,1,1);break;
    case 'cloth':F('#8a8068',x-3,y-1,7,3);F('#c9bfa6',x-4,y-2,7,3);F('#e8e0cc',x-4,y-2,6,1);F('#a39a82',x-1,y-1,3,1);F('#b8ae92',x+2,y+1,2,1);break;
    case 'powder':F('#8a8e86',x-2,y-3,5,6);F('#d2d6cf',x-2,y-3,4,6);F('#eef0ea',x-2,y-3,1,6);F('#8a2d24',x-2,y-1,5,2);F('#c04a3a',x-2,y-1,1,2);F('#a8aca4',x-2,y-4,5,1);break;
    case 'chip':F('#12301c',x-3,y-2,7,5);F('#2a6a3e',x-3,y-2,6,1);F('#0a0e0c',x-1,y-1,3,3);for(const yy of[-1,1]){F('#e0bc60',x-4,y+yy,1,1);F('#e0bc60',x+4,y+yy,1,1);}F(Math.sin(t*4)>0?'#9fffb0':'#3a8a4a',x,y,1,1);break;
    case 'medkit':F('#6a6e66',x-4,y-2,8,5);F('#e4e8e0',x-4,y-2,8,4);F('#ffffff',x-4,y-2,8,1);F('#3e8a4e',x-1,y-2,2,4);F('#3e8a4e',x-3,y-1,6,2);F('#7fd08e',x-1,y-2,1,1);F('#8e978b',x-1,y-4,3,1);F('#8e978b',x-1,y-3,1,1);F('#8e978b',x+1,y-3,1,1);break;
    case 'herb':line(ctx,x+2,y+2,x-1,y-2,.8,'#4a3a1e');for(const [lx,ly,c2] of [[-2,-3,'#6ac04a'],[0,-1,'#4a9a3a'],[-3,0,'#3e7e30'],[1,-3,'#86d860'],[2,0,'#4a9a3a']])ell(ctx,x+lx,y+ly,1.5,.9,lx*.4,c2);F('#c8b890',x+1,y+1,2,1);break;
    case 'food':{if(!FOOD[it.food])fixLoot(it);const c=FOOD[it.food].col;F('#3a2414',x-3,y-2,6,5);F(c,x-3,y-1,5,3);FA('#ffffff',.3,x-3,y-1,1,3);F('#d8dcd4',x-3,y-3,6,1);F('#9aa29c',x-3,y-2,6,1);F('#f0e0b0',x-1,y,2,1);break;}
    case 'raw':{const c=RAW[it.raw].col;ell(ctx,x+.5,y+.5,3.4,2.4,0,'#1a120c');ell(ctx,x,y,3,2.1,0,c);{const A0=ctx.globalAlpha;ctx.globalAlpha=A0*.35;ell(ctx,x-1,y-.8,1.5,.8,0,'#ffffff');ctx.globalAlpha=A0;}FA('#000000',.25,x-2,y+1,5,1);break;}
    case 'key':ctx.strokeStyle='#c89a30';ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(x-3,y-1,1.6,0,TAU);ctx.stroke();F('#e8c050',x-4,y-2,1,1);F('#c89a30',x-1,y-1,5,1);FA('#f0d070',1,x-1,y-1,4,.6);F('#c89a30',x+2,y,1,2);F('#c89a30',x+4,y,1,1);break;
    case 'liftcard':F('#2a2f2c',x-4,y-2,8,5);F('#e0e4dc',x-4,y-3,8,5);F('#ffffff',x-4,y-3,8,1);F(AMBER,x-4,y-1,8,1);F('#c8a040',x-3,y,2,2);if(Math.sin(t*5)>0){F('#ffffff',x+2,y,1,1);FA('#ffffff',.2,x+1,y-1,3,3);}break;
    case 'file':F('#6a5430',x-4,y-2,9,6);F('#c8a868',x-4,y-2,8,5);F('#e0c890',x-4,y-2,8,1);F('#f0ece0',x-3,y-3,6,1);F('#a88af0',x-4,y-3,3,1);F('#8a7048',x-2,y,5,1);F('#8a7048',x-2,y+2,3,1);break;
    case 'clearpack':F('#6a5430',x-4,y-2,9,6);F('#c8a868',x-4,y-2,8,5);F('#e0c890',x-4,y-2,8,1);F('#f0ece0',x-3,y-3,6,1);F('#e8c070',x-4,y-3,3,1);F('#e8c070',x-1,y-1,3,3);F('#fff0b0',x-1,y-1,1,1);break;
    case 'routechart':F('#3a3e30',x-4,y-2,9,6);F('#c8d0b8',x-4,y-3,8,5);F('#eef2e0',x-4,y-3,8,1);F('#7fd08e',x-3,y-1,2,1);F('#7fd08e',x-1,y,2,1);F('#7fd08e',x+1,y+1,1,1);F('#3e8a4e',x+2,y-2,1,1);break;
    case 'schematic':F('#1e2e40',x-3,y-2,8,6);F('#3d5a78',x-3,y-3,7,6);F('#5a7a9a',x-3,y-3,7,1);F('#9fc3e0',x-2,y-1,5,1);F('#9fc3e0',x-2,y+1,3,1);F('#9fc3e0',x+1,y-2,1,3);break;
    case 'secretmap':F('#5a4a30',x-3,y-2,8,6);F('#b8a47a',x-3,y-3,7,6);F('#d8c89a',x-3,y-3,7,1);F('#8a7652',x+3,y-3,1,6);for(const [u,v] of [[-1,-1],[1,1],[0,0],[1,-1],[-1,1]])F('#b8493a',x+u,y+v,1,1);break;
    case 'medpatch':F('#8a8e86',x-3,y-1,7,4);F('#e4e8e0',x-3,y-2,6,4);F('#ffffff',x-3,y-2,6,1);F('#c04040',x-1,y-1,2,2);F('#ff8a80',x-1,y-1,1,1);break;
    case 'tonic':{const c=CORES[SUBS[it.sub].core].col;F('#15110a',x-2,y-4,5,9);F(c,x-1,y-1,3,4);F('#d8dcd4',x-1,y-3,3,1);F('#8e978b',x-1,y-4,3,1);FA('#ffffff',.5,x-1,y-1,1,2);break;}
    case 'emetic':F('#15110a',x-2,y-4,5,8);F('#8a9a40',x-1,y-2,3,5);F('#b8c860',x-1,y-2,1,5);F('#d8d0b0',x-1,y-3,3,1);break;
    case 'sigil':{const c=CORES[it.core].col,g=0.5+0.5*Math.sin(T*4);ctx.globalAlpha=0.35*g;ctx.fillStyle=c;circ(x,y,6);ctx.globalAlpha=1;F(c,x-1,y-4,2,8);F(c,x-4,y-1,8,2);F('#fff',x,y,1,1);break;}
    case 'weapon':F('#1a1e1c',x-5,y-1,10,3);F('#5a6260',x-5,y-2,9,2);F('#8a9290',x-5,y-2,9,1);F('#3a2614',x-2,y,2,3);F('#5a3e22',x-2,y,1,3);F(AMBER,x+3,y-2,1,1);break;
    case 'gear':{const c=GEAR[it.gear]?SLOTCOL[GEAR[it.gear].slot]:AMBER;F('#2a2014',x-3,y-2,7,6);F('#5a4a2e',x-3,y-2,6,5);F('#7a6440',x-3,y-2,6,1);F('#1a140c',x-1,y-3,2,2);F(c,x-3,y,6,1);F('#3a2e1c',x+2,y-2,1,5);break;}
    case 'tuft':drawTuft(it,x,y);break;
    case 'tool':qIcon(it.tool,x,y);break;
    default:qIcon(it.type,x,y);}}

// ---------- interactables ----------
// mix a hex colour toward white (k>0) or black (k<0)
const mixCache={};
function mixHex(h,k){const key=h+k;if(mixCache[key])return mixCache[key];const n=parseInt(h.slice(1),16),c=[n>>16,(n>>8)&255,n&255].map(v=>Math.round(k>0?v+(255-v)*k:v*(1+k)));
  return mixCache[key]='#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');}
function foot(cx,y,w,a){shadow(ctx,cx+.5,y+10.8,w,1.5,a||.4);}
// barrels and crates (b.x, b.y is the centre)
function barrelArt(b,cx,cy){const t=T;
  if(b.crate){const w=b.wood,c0=w?'#7a5e38':'#5a6066',c1=w?'#9a7a4a':'#8a9296',c2=w?'#5e4628':'#3e4448',c3=w?'#5a4224':'#3a4044';shadow(ctx,cx+.5,cy+4.8,5.5,1.5,.4);
    F('#1e140a',cx-5,cy-5,11,11);F(c0,cx-4,cy-4,9,9);for(let k=0;k<3;k++)F(c2,cx-4,cy-2+k*3,9,1);F(c1,cx-4,cy-4,9,1);F(c1,cx-4,cy-4,1,9);
    if(w){line(ctx,cx-3.5,cy+3.5,cx+3.5,cy-3.5,1,c3);line(ctx,cx-3,cy+3,cx+3,cy-3,.5,'#a8865a');}else{F('#2a3034',cx-1,cy-4,1,9);F('#c8d0d4',cx-3,cy-3,1,1);}
    for(const [nx,ny] of [[-4,-4],[4,-4],[-4,4],[4,4]])F(w?'#c8c0a8':'#d8e0e4',cx+nx,cy+ny,1,1);vshade(ctx,cx-4,cy-4,9,9,0,.18);return;}
  shadow(ctx,cx+.5,cy+4.8,5.2,1.5,.4);F('#120c08',cx-4,cy-5,9,11);F('#7a3020',cx-3,cy-4,7,9);F('#a84a2a',cx-3,cy-4,3,9);F('#c8663a',cx-3,cy-4,1,9);vshade(ctx,cx-3,cy-4,7,9,0,.25);
  ell(ctx,cx+.5,cy-4,3.5,1.4,0,'#5a2616');ell(ctx,cx+.5,cy-4.2,2.8,.9,0,'#8a3a22');F('#2a1a10',cx+1,cy-5,1,1);
  const o=Math.floor(b.roll||0)%4,dy=o===1?-1:o===3?1:0;F('#c8962e',cx-3,cy-1+dy,7,1);F('#1a1410',cx-3,cy+dy,7,1);F('#c8962e',cx-3,cy+3+dy,7,1);F('#f0c050',cx-3,cy-1+dy,2,1);FA('#5a2814',.6,cx+2,cy,1,3);
  if(b.hp<4){F('#2a1a10',cx+1,cy-3,1,2);F('#2a1a10',cx+2,cy-2,1,1);}
  if(b.fuse>=0&&Math.sin(t*30)>0){F('#fff0c0',cx,cy-6,1,1);glow(ctx,cx+.5,cy-5.5,3,'255,220,150',.6);}}
function chestArt(c,cx,cy){const t=T,r=c.tier==='rare',body=r?'#3e3250':'#4e3a1e',lid=r?'#6e5e86':'#7a5f33',lh=r?'#8e7eaa':'#9a7a44',lk=r?'201,168,255':'217,164,65';
  shadow(ctx,cx+.5,cy+3.8,5.8,1.5,.4);
  if(c.opened){F('#120e08',cx-5,cy-7,11,11);F(lid,cx-4,cy-6,9,3);F(lh,cx-4,cy-6,9,1);F(body,cx-4,cy-2,9,5);F('#0b0805',cx-3,cy-2,7,2);vshade(ctx,cx-4,cy,9,3,.05,.3);
    for(const sx of[-4,4])F('#6a6a62',cx+sx,cy-2,1,5);return;}
  F('#120e08',cx-5,cy-4,11,8);F(body,cx-4,cy-3,9,6);F(lid,cx-4,cy-3,9,2);F(lh,cx-4,cy-3,9,1);F('#1a140c',cx-4,cy-1,9,1);vshade(ctx,cx-4,cy,9,3,.05,.3);
  for(const sx of[-4,4]){F('#9a9a90',cx+sx,cy-3,1,6);F('#c8c8c0',cx+sx,cy-3,1,1);}
  glow(ctx,cx+.5,cy,4,lk,.35+.15*Math.sin(t*3));F(r?'#c9a8ff':AMBER,cx,cy-1,1,2);F('#ffffff',cx,cy-1,1,1);}
// hack panels (x,y is the tile's top left)
function panelArt(pn,x,y){const t=T+(pn.ph||0),px=x+2,py=y+2,dead=pn.state==='dead',done=pn.state==='done',trap=pn.reward==='traps';
  const scr=dead?'#141414':done?'#123a24':trap?'#38160e':pn.hack?'#0c2a26':'#121a28',lc=done?'#78e696':trap?'#f0785a':pn.hack?'#82f0dc':'#8caae6',lrgb=done?'120,230,150':trap?'240,120,90':pn.hack?'110,220,200':'140,170,230';
  if(!dead)glow(ctx,px+4,py+3,8,lrgb,.18+.06*Math.sin(t*2));
  F('#050706',px-1,py-1,10,9);F('#2a3230',px-1,py-1,10,1);F(scr,px,py,8,5);
  if(!dead){for(let k=0;k<5;k++){const on=Math.sin(t*3+k*1.7)>-.2;FA(lc,on?.55:.15,px+1,py+k,(k*3+Math.floor(t*4))%7+1,1);}FA('#000000',.25,px,py+((t*12)%5|0),8,1);}
  else if(Math.random()<0.02)parts.push({x:pn.tx*TS+6,y:pn.ty*TS+8,vx:rr(-30,30),vy:rr(-10,30),t:0.3,m:0.3,c:'#ffe7a0',s:1});
  for(let k=0;k<4;k++)F('#3a4442',px+k*2,py+6,1,1);
  if(pn.hack&&pn.state==='idle')F(Math.sin(t*5)>0?AMBER:'#5a4214',px+7,py+6,1,1);else if(done)F('#7fd08e',px+7,py+6,1,1);}
function vendArt(v,x,y){const t=T+(v.ph||0),st=VSTYLE[v.style],dead=v.state==='dead',empty=!v.stock.some(o=>!o.sold);
  const body=dead?'#2a2a2a':mixHex(st.body,-.12),hi=dead?'#3a3a3a':mixHex(st.body,.12),sign=dead?'#1a1a1a':empty?'#3a2a2a':st.sign;
  FA('#000000',.45,x,y+12,12,3);if(!dead&&!empty)glow(ctx,x+6,y+13,9,st.glow,.18);
  F('#070808',x-1,y-3,14,17);F(body,x,y-2,12,15);F(hi,x,y-2,1,15);vshade(ctx,x,y-2,12,15,0,.25);F(dead?'#333333':st.trim,x,y-2,12,1);
  const fl=!dead&&!empty&&Math.random()<.03?.3:1;FA(sign,fl,x+1,y-1,10,2);if(!dead&&!empty)glow(ctx,x+6,y,7,st.glow,.18*fl);
  F('#0b1412',x+1,y+2,7,8);v.stock.forEach((o,k)=>F(o.sold||dead?'#1a1f1e':['#e0c56a','#b8493a','#7fd08e','#8fb6d0','#e0c56a','#c9a8ff'][k%6],x+2+(k%2)*3,y+3+Math.floor(k/2)*2,2,1));FA('#dcfafa',.12,x+1,y+2,2,8);
  F('#2a2f2d',x+9,y+2,2,6);F(dead?'#3a1a1a':empty?'#6a4a20':(Math.sin(t*4)>0?'#7fff8a':'#2f6a3a'),x+9,y+3,2,1);F('#8e978b',x+9,y+6,2,1);F('#050606',x+1,y+10,7,1);
  if(dead&&Math.random()<0.015)parts.push({x:v.tx*TS+6,y:v.ty*TS+4,vx:rr(-30,30),vy:rr(-10,30),t:0.3,m:0.3,c:'#ffe7a0',s:1});}
function leverArt(l,x,y){const t=T;foot(x+6,y,4);F('#141817',x+3,y+6,6,4);F('#3a423f',x+3,y+6,6,1);
  if(l.used){F('#4a5450',x+5,y+6,6,2);F('#6a7470',x+5,y+6,6,1);ell(ctx,x+10.5,y+7,1.8,1.8,0,'#3a6a3a');F('#9fe0a8',x+10,y+6,1,1);F('#5fae6e',x+4,y+8,1,1);glow(ctx,x+4.5,y+8.5,3,'127,208,142',.35);return;}
  F('#4a5450',x+5,y+1,2,7);F('#6a7470',x+5,y+1,1,7);ell(ctx,x+7.5,y+1.5,1.8,1.8,0,'#8a2a1a');ell(ctx,x+7,y+1,1.2,1.2,0,'#e05a40');F('#ffd0c0',x+6.5,y+.5,1,1);
  const p=.5+.5*Math.sin(t*4);glow(ctx,x+4,y+8,3,'255,96,80',.4*p);FA('#ff6050',.4+.6*p,x+4,y+8,1,1);}
function hatchArt(h,x,y){const t=T,cx=x+6,cy=y+6;shadow(ctx,cx+.5,cy+.8,5.5,5,.4);ctx.fillStyle='#0d100f';circ(cx,cy,5.2);
  if(!h.found){ctx.fillStyle='#1c2120';circ(cx,cy,4.6);ctx.fillStyle='#232927';circ(cx-.5,cy-.5,3.6);F('#3a3226',cx-2,cy,4,1);F('#2e3533',cx-3,cy-3,1,1);F('#2e3533',cx+2,cy+2,1,1);return;}
  ctx.fillStyle='#2a302e';circ(cx,cy,4.6);ctx.fillStyle='#161a19';circ(cx,cy,3.8);
  for(let k=0;k<6;k++){const a=k/6*TAU;F('#4a5250',cx+Math.cos(a)*4.2-.5,cy+Math.sin(a)*4.2-.5,1,1);}F('#4a4030',cx-2,cy-.5,4,1);F('#7a6a48',cx-2,cy-.5,4,.5);
  const A0=ctx.globalAlpha;ctx.globalAlpha=A0*(.25+.2*Math.sin(t*2.5));ctx.strokeStyle=AMBER;ctx.lineWidth=.6;ctx.beginPath();ctx.arc(cx,cy,5.6,0,TAU);ctx.stroke();ctx.globalAlpha=A0;}
function fanArt(f,x,y){const cx=x+6,cy=y+6;ctx.fillStyle='#060808';circ(cx,cy,5.6);ctx.fillStyle=f.dead?'#262828':'#2e3436';circ(cx,cy,4.8);
  if(f.dead){F('#1a1a1a',cx-2,cy-1,4,2);ctx.strokeStyle='#3a4244';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+3,cy+2);ctx.stroke();}
  else{const A0=ctx.globalAlpha;ctx.globalAlpha=A0*(f.phase==='idle'?.15:.35);ctx.fillStyle='#8a969e';circ(cx,cy,4);ctx.globalAlpha=A0;ctx.strokeStyle='#b8c4ca';ctx.lineWidth=1.1;
    for(let k=0;k<3;k++){const a=f.spin+k*2.09;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*4,cy+Math.sin(a)*4);ctx.stroke();}}
  ctx.strokeStyle='#5a6468';ctx.lineWidth=.8;for(let r2=2;r2<=5;r2+=1.5){ctx.beginPath();ctx.arc(cx,cy,r2,0,TAU);ctx.stroke();}
  F(f.phase==='spin'&&!f.dead?'#ffd060':'#2a3032',cx-1,cy-1,2,2);
  if(!f.dead&&f.phase==='gust'&&f.dir){for(let k=0;k<3;k++){const m=(T*1.6+k/3)%1;FA('#dce6eb',.4*(1-m),cx+f.dir[0]*(6+m*8)-1+f.dir[1]*(k-1)*2,cy+f.dir[1]*(6+m*8)+f.dir[0]*(k-1)*2,2,1);}}}
// fixtures (x,y is the tile's top left); returns false for kinds it does not draw
const FIX_ART={
  locker(f,x,y){const u=f.used;F('#101315',x+1,y-2,10,14);F(u?'#3a4248':'#4e5a62',x+2,y-1,8,12);F(u?'#4a545a':'#6a7882',x+2,y-1,1,12);F(u?'#5a646a':'#7a8890',x+2,y-1,8,1);F('#262c32',x+6,y-1,1,12);vshade(ctx,x+2,y-1,8,12,0,.3);
    for(let k=0;k<3;k++){F('#262c32',x+3,y+1+k*2,2,1);F('#262c32',x+7,y+1+k*2,2,1);}F('#b8c4cc',x+4,y+6,1,2);F('#b8c4cc',x+8,y+6,1,2);F('#3a444a',x+8,y+8,2,1);
    if(u){F('#0a0c0e',x+7,y-1,3,12);F('#3a4248',x+9,y-1,2,12);}shadow(ctx,x+6,y+12,4.5,1,.35);return true;},
  breaker(f,x,y){const t=T;F('#0e0c08',x+1,y-3,10,14);F('#4e545a',x+2,y-2,8,12);F('#6e767c',x+2,y-2,8,1);vshade(ctx,x+2,y-2,8,12,0,.25);for(let k=0;k<4;k++)F(k%2?'#15110a':'#e8c040',x+2+k*2,y+7,2,2);
    F('#1e2220',x+4,y,4,5);F('#3a3e3c',x+4,y,4,1);
    if(powerOff){F('#5a3030',x+5,y+3,2,2);F('#2a2f2c',x+5,y+5,2,3);F('#3a2a2a',x+3,y-1,1,1);}else{F('#c04040',x+5,y,2,2);F('#ff7a6a',x+5,y,1,1);F('#2a2f2c',x+5,y-6,2,4);const on=Math.sin(t*4)>0;F(on?'#7fd08e':'#3a6a4a',x+3,y-1,1,1);if(on)glow(ctx,x+3.5,y-.5,2.5,'127,208,142',.4);}return true;},
  toolbench(f,x,y){F('#1e140a',x,y-1,12,13);F('#6a4a2a',x+1,y,10,11);F('#8a6a40',x+1,y,10,1);for(let k=0;k<3;k++)F('#5a3e22',x+1,y+3+k*3,10,1);vshade(ctx,x+1,y,10,11,0,.2);
    if(!f.part){line(ctx,x+3,y+3,x+7,y+3,1,'#9aa4a8');ell(ctx,x+7.5,y+3,1,1,0,'#9aa4a8');line(ctx,x+3,y+7,x+5,y+9,1,'#6a4a28');F('#7a8488',x+5,y+6,3,2);F('#c04040',x+8,y+7,2,2);F('#e8c050',x+4,y+5,1,1);
      glow(ctx,x+9,y+2,5,'255,220,150',.22);F('#ffe0a0',x+9,y+1,1,1);}
    else{F('#4a5258',x+3,y+2,4,3);F('#7a848a',x+3,y+2,4,1);F('#3a4046',x+4,y+5,2,3);F(AMBER,x+8,y+4,1,4);F('#f0c870',x+8,y+4,1,1);}return true;},
  grinder(f,x,y){const t=T;f.spinT=(f.spinT||0)-1/60;const sp=f.spinT>0,jx=sp?(Math.random()-.5)*1.2:0;F('#0a0a0a',x+jx,y-3,12,15);F('#3e3022',x+1+jx,y-2,10,13);vshade(ctx,x+1+jx,y-2,10,13,0,.3);
    for(let k=0;k<10;k+=2)F(((k>>1)%2)?'#d07030':'#1a1410',x+1+k+jx,y-2,2,2);F('#0e0b08',x+2+jx,y+2,8,5);
    for(let k=0;k<4;k++)F('#a8b4ba',x+3+k*2+jx,y+(sp?3+((t*40+k)|0)%3:4),1,2);F('#2a2014',x+3+jx,y+8,6,2);
    if(sp){F('#ffd070',x+9+jx,y,1,1);if(Math.random()<.4)F('#ffe0a0',x+3+Math.random()*6+jx,y+1,1,1);}else F('#6a3a1a',x+9,y,1,1);return true;},
  medstation(f,x,y){const t=T,u=f.used;if(!u)glow(ctx,x+6,y+6,8,'220,80,80',.12+.06*Math.sin(t*2));F('#142222',x+1,y+1,10,10);F(u?'#3a4a4a':'#c8d8d8',x+2,y+2,8,8);F(u?'#4a5a5a':'#f0fafa',x+2,y+2,8,1);vshade(ctx,x+2,y+2,8,8,0,.2);
    F(u?'#4a5a5a':'#c03838',x+5,y+3,2,6);F(u?'#4a5a5a':'#c03838',x+3,y+5,6,2);if(!u){F('#ff8a80',x+5,y+3,1,1);for(let k=0;k<3;k++)F(['#7fd08e','#8fb6d0','#e0c56a'][k],x+3+k*2,y+9,1,1);}return true;},
  freezer(f,x,y){const t=T,u=f.used;F('#06090c',x,y-3,12,15);F(u?'#4a5a64':'#86a6b8',x+1,y-2,10,13);F(u?'#5a6a74':'#b8d4e2',x+1,y-2,10,1);F(u?'#52626c':'#a8c6d6',x+1,y-2,1,13);vshade(ctx,x+1,y-2,10,13,0,.25);F(u?'#3a4a54':'#5a7888',x+1,y+3,10,1);
    F('#2a3a44',x+8,y-1,2,3);F('#2a3a44',x+8,y+5,2,3);
    if(!u){const A0=ctx.globalAlpha;ctx.globalAlpha=A0*.8;ctx.fillStyle='#f0faff';for(const q of dabs('frost',9))ctx.fillRect(Math.round(x+6+q.u*4),Math.round(y+3+q.v*5),1,1);
      for(let k=0;k<3;k++){const m=(t*.4+k/3)%1;ctx.globalAlpha=A0*.35*(1-m);ell(ctx,x+3+k*3,y+12+m*4,1+m*1.5,.6+m,0,'#e0f0ff');}ctx.globalAlpha=A0;}return true;},
  dispenser(f,x,y){const t=T;F('#0a0a0a',x,y-2,12,14);F('#4e4a40',x+1,y-1,10,12);F('#6a6456',x+1,y-1,10,1);vshade(ctx,x+1,y-1,10,12,0,.25);F('#14120e',x+3,y+2,6,3);
    for(let k=0;k<3;k++){F('#8a6a24',x+4+k*1.5,y+2,1,3);F('#e0c56a',x+4+k*1.5,y+2,1,1);}F('#1a1814',x+4,y+6,4,2);F('#d9b45a',x+4,y+7,4,1);const on=Math.sin(t*9)>0;F(on?'#e04a40':'#401010',x+9,y,1,1);if(on)glow(ctx,x+9.5,y+.5,2.5,'224,74,64',.4);return true;},
  arcade(f,x,y){const t=T,gc=ARC[f.game||'rift'].col;glow(ctx,x+6,y+3,10,'90,240,255',.15);F('#06060c',x,y-3,12,15);F('#2e2248',x+1,y-2,10,13);F('#46366a',x+1,y-2,1,13);vshade(ctx,x+1,y-2,10,13,0,.3);
    F(gc,x+1,y-3,10,1);F(f.won?'#0e2a1e':'#08121e',x+2,y,8,5);F('#5af0ff',x+2+((t*6)%7|0),y+3,1,1);F('#ff5aa8',x+7-((t*4)%5|0),y+1,1,1);F('#e8e0a0',x+2+((t*9)%8|0),y+((t*7)%5|0),1,1);FA('#ffffff',.08,x+2,y,2,5);
    if(f.won)F('#7fd08e',x+8,y+4,1,1);F('#e8e0a0',x+3,y+7,2,1);F('#ff5a5a',x+7,y+7,2,1);F('#1a1426',x+2,y+9,8,2);return true;},
  camera(f,x,y){const t=T;F('#060606',x+1,y-2,10,13);F('#26302c',x+2,y-1,8,11);F('#3a4642',x+2,y-1,8,1);glow(ctx,x+6,y+3,6,'90,170,140',.15);F('#081812',x+3,y+1,6,5);
    for(let k=0;k<5;k++)F(((k+Math.floor(t*6))%3===0)?'#5aaa8a':'#1e4a3a',x+3,y+1+k,6,1);F('#9fe8c8',x+4+((t*3)%4|0),y+3,1,1);const rec=Math.sin(t*4)>0;F(rec?'#ff5040':'#401010',x+8,y-1,1,1);if(rec)glow(ctx,x+8.5,y-.5,2.2,'255,80,64',.45);return true;}};
function fixArt(f,x,y){const fn=FIX_ART[f.kind];return fn?fn(f,x,y):false;}
// the other fixtures keep their drawing, lit by the same rules: a soft foot shadow under them and a shade falling
// toward the floor over their body ([x, y, w, h] of the body within the tile)
const FIX_SHADE={stasis:[1,-2,10,13],damper:[1,-1,10,12],shelf:[1,-1,10,12],bookshelf:[2,-2,8,13],cot:[0,3,12,7],closet:[1,1,10,10],washbasin:[2,2,8,10],planter:[2,4,8,6],
  table:[1,3,10,6],counter:[0,2,12,8],bucket:[3,4,6,6],bench:[1,2,10,6],booth:[1,1,10,10],toilet:[3,4,6,6],sink:[2,2,8,6],fountain:[3,6,6,3]};
function drawFixture(f){const x=f.tx*TS-camX,y=f.ty*TS-camY;if(x<-14||y<-14||x>W+14||y>H+14)return;
  if(FIX_ART[f.kind]){olDraw(olFixKey(f),ART_OLC[f.kind],x-2,y-8,16,24,()=>fixArt(f,x,y));return;}
  const sh=FIX_SHADE[f.kind];if(sh)shadow(ctx,x+sh[0]+sh[2]/2,y+sh[1]+sh[3]+.5,sh[2]/2+.5,1.3,.35);
  drawFixture0(f);
  if(sh)vshade(ctx,x+sh[0],y+sh[1],sh[2],sh[3],0,.22);}
// outline cache keys: one per drawn shape (null = the shape keeps changing, so the ring is rebuilt every frame)
function olFixKey(f){return f.kind==='grinder'?(f.spinT>0?null:'grinder'):f.kind==='locker'?'locker'+(f.used?1:0):f.kind==='toolbench'?'tb'+(f.part?1:0):f.kind;}
function olBarrelKey(b){return b.crate?'crate':'barrel'+(b.fuse>=0?1:0);}
function olItemKey(it){if(it.pop>0)return null;const s=it.type==='weapon'||it.type==='gear'||it.type==='tool'||it.type==='tuft'||it.type==='sigil'?'':
  it.type==='food'?it.food:it.type==='raw'?it.raw:it.type==='tonic'?it.sub:'';return 'it:'+it.type+':'+(it.gear||it.tool||it.tuft||it.core||s||'');}
