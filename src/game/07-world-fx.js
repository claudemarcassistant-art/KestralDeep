// ---- sprinklers
let sprinkT=0,sprWait=30;
function startSprinklers(t){sprinkT=Math.max(sprinkT,t);say('the fire sprinklers kick on');sfx('steam');}
function updateSprinklers(dt){const p=player;
  if(cond.haz==='sprinklers'&&!hazOff&&sprinkT<=0){sprWait-=dt;if(sprWait<=0){sprWait=rr(35,55);startSprinklers(20);}}
  if(sprinkT<=0)return;sprinkT-=dt;p.st.wet=Math.min(100,p.st.wet+30*dt);if(p.st.brn>0)p.st.brn=Math.max(0,p.st.brn-60*dt);
  if(Math.random()<dt*4){for(const f of fires){if(Math.hypot(f.x-p.x,f.y-p.y)<220&&Math.random()<0.3){const i=Math.floor(f.y/TS)*MW+Math.floor(f.x/TS);hz[i]=0;f.gone=true;paintTile(i%MW,(i/MW)|0);}}fires=fires.filter(f=>!f.gone);}
  if(sprinkT<=0)say('the sprinklers sputter off');}
// ---- wall fans
let fans=[];
function mkFan(tx,ty,dir,secret){return {tx,ty,dir,ang:Math.atan2(dir[1],dir[0]),x:dir[1]===1?tx*TS+6:dir[0]>0?(tx+1)*TS:tx*TS,y:dir[1]===1?(ty+1)*TS:ty*TS+6,t:rr(1,4),phase:'idle',hp:4,dead:false,secret:!!secret,spin:0};}
function fanLane(f,x,y){const dx=x-f.x,dy=y-f.y,al=dx*Math.cos(f.ang)+dy*Math.sin(f.ang),lat=Math.abs(-dx*Math.sin(f.ang)+dy*Math.cos(f.ang));return al>0&&al<72&&lat<10&&hasLOS(f.x+Math.cos(f.ang)*2,f.y+Math.sin(f.ang)*2,x,y);}
function hitFan(f,d){if(f.dead)return;f.hp-=d;sfx('thud');for(let k=0;k<3;k++)parts.push({x:f.x,y:f.y,vx:rr(-40,40),vy:rr(-40,40),t:0.2,m:0.2,c:'#ffe7a0',s:1});
  if(f.hp<=0){f.dead=true;sfx('crumble');say('the fan grinds to a halt');if(f.secret&&map[f.ty*MW+f.tx]===3)destroySecret(f.tx,f.ty);}}
function updateFans(dt){const p=player;
  for(const f of fans){if(f.dead)continue;f.t-=dt;f.spin+=dt*(f.phase==='gust'?30:f.phase==='spin'?12:2);
    if(f.phase==='idle'){if(f.t<=0){f.phase='spin';f.t=0.6;}}
    else if(f.phase==='spin'){if(f.t<=0){f.phase='gust';f.t=2;if(Math.hypot(f.x-p.x,f.y-p.y)<180)sfx('whoosh');}}
    else{const ux=Math.cos(f.ang),uy=Math.sin(f.ang);
      if(Math.random()<0.8)parts.push({x:f.x+rr(-6,6)*Math.abs(uy),y:f.y+rr(-6,6)*Math.abs(ux),vx:ux*rr(120,180),vy:uy*rr(120,180),t:0.4,m:0.4,c:'rgba(220,230,230,0.7)',s:1});
      if(fanLane(f,p.x,p.y)){move(p,ux*95*dt,uy*95*dt);if(p.st.brn>0)p.st.brn=Math.max(0,p.st.brn-30*dt);}
      for(const e of enemies){if(e.dead||ET[e.type].dummy)continue;if(fanLane(f,e.x,e.y))move(e,ux*110*dt,uy*110*dt);}
      for(const o of [...flares,...charges])if(fanLane(f,o.x,o.y)){o.vx+=ux*300*dt;o.vy+=uy*300*dt;}
      for(const bb of barrels)if(!bb.dead&&fanLane(f,bb.x,bb.y))pushBarrel(bb,ux,uy,520*dt);
      for(const it of items){if(it.dead||!fanLane(f,it.x,it.y))continue;const nx=it.x+ux*70*dt,ny=it.y+uy*70*dt;if(!solidAt(nx,ny)){it.x=nx;it.y=ny;}}
      for(const c of clouds){const inL=fanLane(f,c.x,c.y)||fanLane(f,c.x-ux*c.r*0.5,c.y-uy*c.r*0.5);if(inL){c.vx+=ux*160*dt;c.vy+=uy*160*dt;c.dens=Math.max(0,c.dens-dt*0.05);}}
      for(let k=1;k<=6;k++){const tx=Math.floor((f.x+ux*k*12)/TS),ty=Math.floor((f.y+uy*k*12)/TS);if(solid(tx,ty))break;const i=ty*MW+tx;if(hz[i]===1){hz[i]=0;paintTile(tx,ty);fires=fires.filter(q=>!(Math.floor(q.x/TS)===tx&&Math.floor(q.y/TS)===ty));}}
      if(f.t<=0){f.phase='idle';f.t=rr(3,6);}}}}
function drawFan(f){const x=f.tx*TS-camX,y=f.ty*TS-camY;if(x<-14||y<-14||x>W+14||y>H+14)return;
  const cx=x+6,cy=y+6;ctx.fillStyle='#0a0c0c';circ(cx,cy,5.5);ctx.fillStyle=f.dead?'#2a2a2a':'#3a4244';circ(cx,cy,4.5);
  if(!f.dead){ctx.strokeStyle='#8a969e';ctx.lineWidth=1;for(let k=0;k<3;k++){const a=f.spin+k*2.09;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*4,cy+Math.sin(a)*4);ctx.stroke();}}
  else{F('#1a1a1a',cx-2,cy-1,4,2);}
  ctx.strokeStyle='#5a6468';ctx.beginPath();ctx.arc(cx,cy,5,0,6.283);ctx.stroke();F(f.phase==='spin'&&!f.dead?'#ffd060':'#2a3032',cx-1,cy-1,2,2);}
let plants=[],mists=[],freightT=null,pendingSkip=0;
function fireWeak(e){const b=ET[e.type];return !!(b.plant||b.trail||e.type==='slug'||e.type==='toxslug'||e.type==='snail');}
function burnPlant(pl){if(pl.burst)return;pl.burst=true;pl.burnt=true;for(let k=0;k<10;k++)parts.push({x:pl.x+rr(-3,3),y:pl.y+rr(-3,3),vx:rr(-10,10),vy:rr(-30,-8),t:0.6,m:0.6,c:k%2?'#3a3028':'#ff9a4a',s:1});}
function burstPlant(pl){if(pl.burst)return;pl.burst=true;mists.push({x:pl.x,y:pl.y,kind:pl.type,t:5,r:4});sfx(pl.type==='mend'?'learn':'whoosh');
  for(let k=0;k<20;k++){const a=Math.random()*6.283,sp=rr(20,70);parts.push({x:pl.x,y:pl.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:0.8,m:0.8,c:pl.type==='mend'?'#e06a6a':'#b86ae0',s:1});}}
function updatePlants(dt){const p=player;
  for(const pl of plants){if(pl.burst)continue;if(Math.hypot(pl.x-p.x,pl.y-p.y)<8)burstPlant(pl);else for(const e of enemies)if(!e.dead&&!ET[e.type].fly&&!ET[e.type].plant&&Math.hypot(pl.x-e.x,pl.y-e.y)<7){burstPlant(pl);break;}}
  for(const m of mists){m.t-=dt;m.r=Math.min(28,m.r+60*dt);const inP=Math.hypot(m.x-p.x,m.y-p.y)<m.r;
    if(m.kind==='mend'){if(inP)p.hp=Math.min(maxHp(),p.hp+6*(1+0.2*U('medic'))*dt);for(const e of enemies)if(!e.dead&&Math.hypot(m.x-e.x,m.y-e.y)<m.r)e.hp+=2*dt;}
    else{if(inP){p.mistAcc=(p.mistAcc||0)+3*dt;while(p.mistAcc>=1){p.mistAcc--;hurtPlayer(1,true);}addStatus('psn',20*dt);}for(const e of enemies)if(!e.dead&&!ET[e.type].plant&&Math.hypot(m.x-e.x,m.y-e.y)<m.r){e.mistAcc=(e.mistAcc||0)+3*dt;if(e.mistAcc>=1){e.mistAcc--;damageEnemy(e,1,0,0,0,true);}}}
    if(Math.random()<0.5)parts.push({x:m.x+rr(-m.r,m.r)*0.7,y:m.y+rr(-m.r,m.r)*0.7,vx:rr(-5,5),vy:rr(-10,-2),t:0.6,m:0.6,c:m.kind==='mend'?'#e08080':'#c08ae0',s:1});}
  mists=mists.filter(m=>m.t>0);}
function drawPlant(pl){const x=Math.round(pl.x-camX),y=Math.round(pl.y-camY);if(x<-10||y<-10||x>W+10||y>H+10)return;const sw=Math.round(Math.sin(T*1.5+pl.ph));
  F('#2a5a1e',x,y-1,1,5);F('#3a7a2a',x-3,y+2,3,1);F('#3a7a2a',x+1,y+1,3,1);
  if(pl.type==='mend'){ctx.fillStyle='#8a2a2a';circ(x+sw,y-3,3.2);ctx.fillStyle='#d04a4a';circ(x+sw,y-3,2.4);F('#ffb0a0',x+sw-1,y-4,1,1);for(let k=0;k<5;k++){const a=k/5*6.283+T*0.3;F('#e06a6a',Math.round(x+sw+Math.cos(a)*3.5),Math.round(y-3+Math.sin(a)*3.5),1,1);}}
  else{ctx.fillStyle='#3a1a4a';circ(x+sw,y-3,3.2);ctx.fillStyle='#8a4aa0';circ(x+sw,y-3,2.4);for(let k=0;k<6;k++){const a=k/6*6.283;F('#e0c040',Math.round(x+sw+Math.cos(a)*4),Math.round(y-3+Math.sin(a)*4),1,1);}F('#e0c040',x+sw,y-3,1,1);}}
function drawMists(){for(const m of mists){const x=m.x-camX,y=m.y-camY,a=0.32*Math.min(1,m.t/1.5),c=m.kind==='mend'?'210,80,80':'160,90,200',lg=ctx.createRadialGradient(x,y,0,x,y,m.r);
  lg.addColorStop(0,`rgba(${c},${a})`);lg.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=lg;ctx.fillRect(x-m.r,y-m.r,m.r*2,m.r*2);}}
function genHazards(start){
  hz=new Uint8Array(MW*MH);fires=[];vents=[];anoms=[];
  const safe=(x,y)=>Math.abs(x-start.cx)+Math.abs(y-start.cy)>6&&Math.abs(x-exitT.x)+Math.abs(y-exitT.y)>1;
  const spot=()=>{for(let t=0;t<40;t++){const r=randomRoom(),x=r.x+rnd(r.w),y=r.y+rnd(r.h);if(!solid(x,y)&&safe(x,y))return [x,y];}return null;};
  if(cond.haz==='fire'){const n=5+rnd(4);for(let k=0;k<n;k++){const s=spot();if(!s)continue;
    blob(s[0],s[1],1+rnd(2),(i,x,y)=>{if(liq[i]<=1&&safe(x,y)){hz[i]=1;liq[i]=0;}});fires.push({x:s[0]*TS+6,y:s[1]*TS+6,ph:Math.random()*6});}}
  if(cond.haz==='toxic'){const n=4+rnd(3);for(let k=0;k<n;k++){const s=spot();if(!s)continue;blob(s[0],s[1],2+rnd(2),(i,x,y)=>{if(safe(x,y)){hz[i]=2;liq[i]=0;}});}}
  if(cond.haz==='steam'){const n=7+rnd(4);for(let k=0;k<n;k++){const s=spot();if(!s)continue;hz[s[1]*MW+s[0]]=3;vents.push({tx:s[0],ty:s[1],x:s[0]*TS+6,y:s[1]*TS+6,t:rr(0,4),phase:'idle',cold:Math.random()<0.25});}}
  if(cond.haz==='anomaly'){const n=2+(depth>=5?1:0);for(let k=0;k<n;k++){const s=spot();if(!s)continue;anoms.push({x:s[0]*TS+6,y:s[1]*TS+6,vx:rr(-14,14),vy:rr(-14,14),ph:Math.random()*6});}}
}
const HACKR={
  coolant:{label:'coolant override',ok:()=>vents.length+risers.length>0,act:()=>{for(const v of vents){v.cold=true;freezeAround(v.x,v.y,18);}for(const r of risers){r.cold=true;freezeAround(r.x+Math.cos(r.ang)*20,r.y+Math.sin(r.ang)*20,20);}return 'coolant rerouted. every vent on the deck runs freezing';}},
  sprinklers:{label:'fire suppression',ok:()=>true,act:()=>{startSprinklers(30);return 'fire suppression engaged';}},
  routes:{label:'lift route logs',ok:()=>true,act:()=>{revealNear(2);return 'lift logs pulled: the next two junctions and their conditions';}},
  vend:{label:'vending override',ok:()=>true,act:v=>{const got=[];for(const o of v.stock)if(!o.sold){o.sold=true;got.push(o.give());}v.state='done';
    for(let k=0;k<10;k++)parts.push({x:v.tx*TS+6,y:v.ty*TS+14,vx:rr(-40,40),vy:rr(-10,40),t:0.5,m:0.5,c:'#ffd98a',s:1});return 'the machine dumps everything: '+got.join(', ');}},
  doors:{label:'door override',ok:()=>map.some(v=>v===2),act:()=>{for(let i=0;i<MW*MH;i++)if(map[i]===2){map[i]=0;openDoor[i]=1;paintArea(i%MW,(i/MW)|0);if(lvl)lvl.doors++;}flowT=0;sfx('door');return 'every locked door on the deck unlatches';}},
  map:{label:'deck schematic',ok:()=>true,act:()=>{revealSchematic();revealNextRoutes();return 'schematic and lift routes downloaded';}},
  supplies:{label:'supply locker',ok:()=>true,act:()=>{const p=player;for(let k=0;k<3;k++){const t=lootRoll('common');const it={x:p.x+rr(-8,8),y:p.y+rr(4,10),type:t,ph:0,pop:0.35};if(t==='gear')it.gear=randomGear();if(!blocked(it.x,it.y,2))items.push(it);}p.inv.key++;return 'a wall locker pops open. +1 key';}},
  power:{label:'power relay',ok:()=>cond.light==='dark'||cond.haz==='steam',act:()=>{if(cond.light==='dark')cond.light='lit';if(cond.haz==='steam')hazOff=true;return 'deck power rerouted';}},
  purge:{label:'hazard purge',ok:()=>['fire','toxic','steam','fog','electrical','test'].includes(cond.haz)&&!hazOff,act:()=>{purgeHazards();return 'purge cycle complete';}}
};
function purgeHazards(){hazOff=true;fires=[];for(let i=0;i<MW*MH;i++)if(hz[i]===1||hz[i]===2){hz[i]=0;paintTile(i%MW,(i/MW)|0);}}
const VSTYLE=[{name:'Saltline canteen',body:'#6a2430',trim:'#a8404e',sign:'#ff8a9a',glow:'255,110,130'},
  {name:'DeepCo supply unit',body:'#1e4a4a',trim:'#2f7a74',sign:'#8af0e0',glow:'110,230,210'},
  {name:'Kestrel field stores',body:'#4a3a18',trim:'#8a6a24',sign:'#ffd070',glow:'255,200,110'},
  {name:'Hermit trader',body:'#4a4436',trim:'#8b8468',sign:'#ffd070',glow:'255,190,110'}];
function mkVendor(tx,ty){const st=rnd(3),stock=[],pool=VEND_POOL.slice();
  for(let k=0;k<4&&pool.length;k++){const o=wpick(pool.map(q=>[q,q.w]));pool.splice(pool.indexOf(o),1);stock.push(Object.assign({sold:false},o));}
  stock.sort((a,b)=>a.cost-b.cost);return {tx,ty,style:st,name:VSTYLE[st].name,stock,state:'idle',kicks:0,ph:Math.random()*6,reward:'vend',hack:true};}
function genVending(){
  vendors=[];let n=(Math.random()<0.6?1:0)+(Math.random()<0.25?1:0);if(!n)return;
  const c=[];for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){const i=y*MW+x;
    if(map[i]===1&&!solid(x,y+1)&&map[y*MW+x-1]===1&&map[y*MW+x+1]===1&&Math.abs(x-exitT.x)+Math.abs(y+1-exitT.y)>2&&kind[(y+1)*MW+x]===1&&!panels.some(p=>Math.abs(p.tx-x)+Math.abs(p.ty-y)<3)&&!risers.some(r=>Math.abs(r.tx-x)+Math.abs(r.ty-y)<2))c.push([x,y]);}
  c.sort(()=>Math.random()-.5);
  for(const [x,y] of c){if(vendors.length>=n)break;if(vendors.some(v=>Math.abs(v.tx-x)+Math.abs(v.ty-y)<12))continue;vendors.push(mkVendor(x,y));}
}
const vendOpts=()=>{const v=vendUI.v,o=v.stock.map(s=>({kind:'buy',s}));if(!v.npc)o.push({kind:'hack'},{kind:'kick'});o.push({kind:'leave'});return o;};
function vendChoose(i){
  const v=vendUI.v,o=vendOpts()[i];if(!o)return;
  if(o.kind==='leave'){vendUI=null;return;}
  if(o.kind==='hack'){vendUI=null;startHack(v);return;}
  if(o.kind==='kick'){v.kicks++;noise(v.tx*TS+6,v.ty*TS+10,130);alertAdd(4);shake=Math.max(shake,3);sfx('thud');
    const left=v.stock.filter(s=>!s.sold),r=Math.random();
    if(r<0.3&&left.length){const s=left[rnd(left.length)];s.sold=true;vendUI.note='it rattles and drops '+s.give()+'. that was loud';sfx('pick');}
    else if(r<0.3+0.12*v.kicks){v.state='dead';vendUI=null;say('something cracks inside. out of order now');for(let k=0;k<8;k++)parts.push({x:v.tx*TS+6,y:v.ty*TS+8,vx:rr(-40,40),vy:rr(-30,20),t:0.4,m:0.4,c:'#ffe7a0',s:1});return;}
    else vendUI.note='it shudders. nothing falls out. that was loud';
    if(!v.stock.some(s=>!s.sold))vendUI=null;return;}
  const s=o.s;if(s.sold){sfx('click');return;}
  if(player.inv.scrap<price(s.cost)){sfx('deny');vendUI.note='not enough scrap';return;}
  player.inv.scrap-=price(s.cost);s.sold=true;vendUI.note='clunk. you get '+s.give();sfx('craft');
  for(let k=0;k<4;k++)parts.push({x:v.tx*TS+6,y:v.ty*TS+14,vx:rr(-20,20),vy:rr(0,20),t:0.3,m:0.3,c:VSTYLE[v.style].sign,s:1});
  if(!v.stock.some(q=>!q.sold)){v.state='done';vendUI=null;say('sold out. the sign flickers off');}
}
function drawHatch(h){const x=h.tx*TS-camX+6,y=h.ty*TS-camY+6;if(x<-10||y<-10||x>W+10||y>H+10)return;
  ctx.fillStyle='#0d100f';circ(x,y,5);ctx.fillStyle=h.found?'#000':'#1c2120';circ(x,y,4);
  if(h.found){F('#4a4030',x-2,y-2,4,1);F('#4a4030',x-2,y+1,4,1);}else{F('#3a3226',x-2,y,4,1);F('#2e3533',x-3,y-3,1,1);F('#2e3533',x+2,y+2,1,1);}}
function drawLadder(h){const x=h.lx*TS-camX,y=h.ly*TS-camY;if(x<-12||y<-12||x>W||y>H)return;
  F('#5a4a2e',x+2,y-2,1,TS+2);F('#5a4a2e',x+9,y-2,1,TS+2);for(let k=0;k<TS;k+=3)F('#8a7040',x+2,y+k,8,1);}
function drawLever(l){const x=l.tx*TS-camX,y=l.ty*TS-camY;if(x<-12||y<-12||x>W||y>H)return;
  F('rgba(0,0,0,0.4)',x+2,y+9,8,2);F('#1a1e1d',x+3,y+6,6,4);F('#3a423f',x+5,y+2,2,6);
  if(l.used){F('#5fae6e',x+6,y+7,4,2);}else{F('#c0402a',x+6,y,3,3);if(Math.sin(T*6)>0)F('#ff6050',x+3,y+7,1,1);}}
function drawCage(c){const x=c.tx*TS-camX,y=c.ty*TS-camY,w=c.w*TS,h=c.h*TS;if(x>W||y>H||x+w<0||y+h<0)return;
  if(c.open){F('#3a3f3c',x,y-3,w,2);return;}
  F('#4a504d',x,y,w,2);F('#4a504d',x,y+h-2,w,2);for(let k=0;k<w;k+=3){F('#7a807c',x+k,y,1,h);F('#2a2f2d',x+k+1,y,1,h);}}
function drawVendor(v,x,y){
  if(v.npc){F('rgba(0,0,0,0.45)',x+1,y+9,10,2);ctx.fillStyle='#15130e';circ(x+6,y+5,5);ctx.fillStyle='#4a4436';circ(x+6,y+5,4);ctx.fillStyle='#8b8468';circ(x+6,y+3,2.2);
    F('#ffd070',x+10,y+4,2,3);if(Math.random()<0.5)F('rgba(255,210,120,0.6)',x+10,y+3,2,1);return;}
  const st=VSTYLE[v.style],dead=v.state==='dead',empty=!v.stock.some(o=>!o.sold);
  F('rgba(0,0,0,0.45)',x,y+TS,TS,3);
  F('#070808',x-1,y-3,TS+2,TS+5);F(dead?'#2a2a2a':st.body,x,y-2,TS,TS+3);F(dead?'#333':st.trim,x,y-2,TS,1);
  const sign=dead?'#1a1a1a':empty?'#3a2a2a':(Math.random()<0.04?'#fff':st.sign);F(sign,x+1,y-1,TS-2,2);
  F('#0b1210',x+1,y+2,7,7);
  v.stock.forEach((o,k)=>{const cx=x+2+(k%2)*3,cy=y+3+Math.floor(k/2)*3;F(o.sold||dead?'#1a1f1e':['#e0c56a','#b8493a','#7fd08e','#8fb6d0'][k],cx,cy,2,2);});
  if(!dead&&Math.random()<0.3)F('rgba(200,240,240,0.18)',x+1,y+2+rnd(7),7,1);
  F('#2a2f2d',x+9,y+2,2,5);F(dead?'#3a1a1a':empty?'#6a4a20':(Math.sin(T*4+v.ph)>0?'#7fff8a':'#2f6a3a'),x+9,y+3,2,1);
  F('#050606',x+1,y+10,7,1);
  if(dead&&Math.random()<0.015)parts.push({x:v.tx*TS+6,y:v.ty*TS+4,vx:rr(-30,30),vy:rr(-10,30),t:0.3,m:0.3,c:'#ffe7a0',s:1});
}
function drawVend(){
  const v=vendUI.v,st=VSTYLE[v.style],O=vendOpts(),pw=270,ph=60+O.length*12,px=(W-pw)>>1,py=(H-ph)>>1;
  F('rgba(4,5,6,0.55)',0,0,W,H);box(px,py,pw,ph,'#0a0c0b','#2a2f2d');F(st.sign,px,py,pw,2);
  txt(v.name,px+10,py+8,st.sign);txt('your scrap: '+player.inv.scrap,px+pw-10,py+8,AMBER,'right');
  txt(v.npc?'"Scrap. Nothing else. And keep your voice down."':'insert scrap. no refunds.',px+10,py+19,'#5d655f');
  vendUI.sel=Math.max(0,Math.min(vendUI.sel,O.length-1));
  O.forEach((o,i)=>{const yy=py+34+i*12,sel=i===vendUI.sel;
    const hov=ui(px+6,yy-2,pw-12,12,{click:()=>{vendUI.sel=i;vendChoose(i);}});if(hov&&mouse.moved)vendUI.sel=i;
    if(sel){F('#141917',px+6,yy-2,pw-12,12);F(st.sign,px+6,yy-2,2,12);}
    let label,right='',col='#b9c0b3',rc=AMBER;
    if(o.kind==='buy'){label=o.s.label;right=o.s.sold?'sold':price(o.s.cost)+' scrap';if(o.s.sold){col='#343b38';rc='#343b38';}else if(player.inv.scrap<price(o.s.cost))rc='#6a4a40';}
    else if(o.kind==='hack'){label='Hack the coin lock';right='panel minigame';rc='#6fd0c0';}
    else if(o.kind==='kick'){label='Give it a kick';right='loud';rc='#c07060';}
    else{label='Walk away';}
    txt((i+1)+'  '+label,px+14,yy,sel&&col!=='#343b38'?'#e3e6dc':col);if(right)txt(right,px+pw-12,yy,rc,'right');});
  txt(vendUI.note||'W S or click   Enter to choose   ESC to leave',px+10,py+ph-13,vendUI.note?'#9fcf9a':'#4f5a55');
}
function genPanels(test){
  panels=[];if(test)return;
  const c=[];for(let y=1;y<MH-2;y++)for(let x=1;x<MW-1;x++){const i=y*MW+x;if(map[i]===1&&!solid(x,y+1)&&map[(y)*MW+x-1]===1&&map[y*MW+x+1]===1&&!(x===exitT.x&&y+1===exitT.y))c.push([x,y]);}
  c.sort(()=>Math.random()-.5);const nh=2+rnd(2),nd=8+rnd(6);let placed=0;
  for(const [x,y] of c){if(placed>=nh+nd)break;if(panels.some(p=>Math.abs(p.tx-x)+Math.abs(p.ty-y)<4)||risers.some(r=>Math.abs(r.tx-x)+Math.abs(r.ty-y)<2))continue;
    const hack=placed<nh;placed++;let reward=null;
    if(hack){const opts=['map','supplies','supplies'];if(HACKR.coolant.ok())opts.push('coolant');if(fires.length)opts.push('sprinklers','sprinklers');if(HACKR.doors.ok())opts.push('doors','doors');if(HACKR.power.ok())opts.push('power','power');if(HACKR.purge.ok())opts.push('purge','purge');reward=opts[rnd(opts.length)];}
    panels.push({tx:x,ty:y,hack,reward,state:'idle',ph:Math.random()*6});}
}
function genLiquid(a,start){
  liq=new Uint8Array(MW*MH);flot=new Uint8Array(MW*MH);if(a<=0)return;
  const seeds=Math.max(1,Math.round(a*9)),dist=new Int16Array(MW*MH);
  for(let sd=0;sd<seeds;sd++){
    const r=rooms[rnd(rooms.length)],sx=r.x+rnd(r.w),sy=r.y+rnd(r.h);if(solid(sx,sy))continue;
    const R=3+rnd(3)+Math.round(a*6);dist.fill(-1);const q=[sy*MW+sx];dist[q[0]]=0;
    for(let h=0;h<q.length;h++){const c=q[h],cx=c%MW,cy=(c/MW)|0,d=dist[c];
      const v=(R-d)/R+rr(-0.12,0.12);const lv=v>0.82&&a>=0.55?4:v>0.55&&a>=0.4?3:v>0.28?2:(Math.random()<0.22?1:0);if(lv>liq[c])liq[c]=lv;
      if(d>=R)continue;for(const [dx,dy] of D4){const nx=cx+dx,ny=cy+dy;if(solid(nx,ny))continue;const n=ny*MW+nx;if(dist[n]<0){dist[n]=d+1;q.push(n);}}}
  }
  const np=Math.round(1+a*5);for(let k=0;k<np;k++){const x=1+rnd(MW-2),y=1+rnd(MH-2);if(!solid(x,y)&&!liq[y*MW+x])liq[y*MW+x]=1;}
  liq[exitT.y*MW+exitT.x]=0;placeFlotsam();
  for(let y=start.cy-1;y<=start.cy+1;y++)for(let x=start.cx-1;x<=start.cx+1;x++)liq[y*MW+x]=Math.min(liq[y*MW+x],1);
}

