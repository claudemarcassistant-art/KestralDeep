const sector=d=>(typeof route!=='undefined'&&route&&route.nodes&&!testMode)?BNAMES[route.sector%6].toUpperCase():(SECTORS[d-1]||'NO RECORD');
function isEquipped(id){return player.arms.some(s=>s.main===id||s.off===id);}
function unequipArm(id){for(const s of player.arms){if(s.main===id)s.main=null;if(s.off===id)s.off=null;}}
function equipArm(id,si){const d=ARM[id];if(!d||!player.has[id])return;si=si==null?player.armSet:si;unequipArm(id);const s=player.arms[si];
  const clearTwo=()=>{if(s.main&&ARM[s.main].hand==='two'){s.main=null;s.off=null;}};
  if(d.hand==='two'){s.main=id;s.off=id;}else if(d.hand==='main'){clearTwo();s.main=id;}else{clearTwo();s.off=id;}sfx('equip');}
function gainArm(id){player.has[id]=true;if(MAGS[id]&&!player.mag)player.mag={};if(MAGS[id]&&player.mag[id]==null)player.mag[id]=magCap(id);const d=ARM[id],s=player.arms[player.armSet];
  if(d.hand==='off'&&!s.off)equipArm(id);else if(d.hand==='main'&&!s.main&&!(s.off&&ARM[s.off].hand==='two'))equipArm(id);else if(d.hand==='two'&&!s.main&&!s.off)equipArm(id);
  say(d.name.toLowerCase()+(isEquipped(id)?' equipped':' stowed in your pack (TAB)'));}
function unequipHalf(si,half){const s=player.arms[si],id=s[half];if(!id)return;if(ARM[id].hand==='two'){s.main=null;s.off=null;}else s[half]=null;sfx('equip');}
function qInfo(id){if(!id)return null;
  if(TOOLS[id]){const T0=TOOLS[id];return {name:T0.name+(id==='glowstick'&&player.glowOn?' (on)':''),desc:T0.desc,tool:true,n:()=>player.tools[id]?1:0,cnt:()=>''};}
  if(id==='flask'){const f=player.flask;return {name:'Flask'+(f.kind?' ('+f.kind+')':''),desc:'Left click on a liquid tile to fill (up to 3), elsewhere to drink. Right click throws it, splashing what is inside. Water puts out fire and gives a small buff.',n:()=>f.has?1:0,cnt:()=>f.n,total:()=>(f.has?1:0)+(player.inv.flasks||0)};}if(id.startsWith('food:')){const k=id.slice(5),f=FOOD[k];return {name:f.name,desc:f.desc+' '+f.sat+' satiety, lasts '+f.lv+' deck'+(f.lv>1?'s':'')+'.',n:()=>player.food[k]||0,use:()=>eatFood(k)};}return QUICK[id];}
function qCap(){return Math.min(7,3+(S.qslots||0)+(player.qBonus||0));}
function selQuick(){return player.hotSel>=2?player.hotSel-2:-1;}
function hotCount(){return 2+qCap();}
function setHot(i){const P=player;i=Math.max(0,Math.min(hotCount()-1,i));P.hotSel=i;if(i<2)P.armSet=i;else P.quickSel=i-2;sfx('click');}
function flaskPrimary(){const P=player,f=P.flask;if(!f.has)return;const i=Math.floor(P.y/TS)*MW+Math.floor(P.x/TS);
  let src=null;if(oil[i]>0)src='oil';else if(hz[i]===2)src='toxic';else if(liq[i]>=1&&!ice[i])src='water';
  if(src&&f.n<3&&(!f.kind||f.kind===src)){f.kind=src;f.n++;if(src==='oil')oil[i]--;sfx('slosh');float(P.x,P.y-6,'+1 '+src,FLASKCOL[src]);return;}
  if(src&&f.kind&&f.kind!==src&&f.n<3){say('the flask already holds '+f.kind);sfx('click');return;}
  if(!f.n){say('the flask is empty. stand in a liquid and use it to fill');sfx('click');return;}
  const k=f.kind;f.n--;if(!f.n)f.kind=null;sfx('slosh');
  if(k==='water'){P.st.brn=0;P.st.wet=Math.min(100,P.st.wet+15);if(P.sat+4<=100){P.sat+=4;gainFoodXp(2);P.buffs.push({id:'water',lv:1});refreshStats();}say('you drink the water. cool and flat');}
  else if(k==='oil'){addStatus('psn',20);vomit('you drink oil. that comes straight back up');}
  else{addStatus('psn',50);say('that was not water');}}
function gainFlask(){const P=player;if(P.flask.has)P.inv.flasks=(P.inv.flasks||0)+1;else P.flask={has:true,kind:null,n:0};
  if(!P.quick.slice(0,qCap()).includes('flask')){const fr=P.quick.findIndex((q,qi)=>!q&&qi<qCap());if(fr>=0)P.quick[fr]='flask';
    else say('flask stowed in the pack. put it in a quick slot from the Pack tab (TAB)');}}
function throwFlask(){const P=player,f=P.flask;if(!f.has)return;if(P.liq===4){say('you cannot throw while swimming');return;}breakCloak();
  flasksOut.push({x:P.x,y:P.y,vx:Math.cos(P.ang)*170*(1+0.2*U('throw')),vy:Math.sin(P.ang)*170*(1+0.2*U('throw')),t:0.55,kind:f.kind,n:f.n});P.flask={has:false,kind:null,n:0};
  if((P.inv.flasks||0)>0){P.inv.flasks--;P.flask={has:true,kind:null,n:0};}sfx('whoosh');}
let flasksOut=[],soaks=[];
function tankSrcHere(){const P=player,i=Math.floor(P.y/TS)*MW+Math.floor(P.x/TS);if(oil[i]>0)return 'oil';if(hz[i]===2)return 'toxic';if(liq[i]>=1&&!ice[i])return 'water';return null;}
function fillTank(){const P=player;if(!P.tank)P.tank={kind:null,n:0};const T0=P.tank,src=tankSrcHere();
  if(src){if(T0.kind&&T0.kind!==src&&T0.n>0){T0.n=0;say('you flush the '+T0.kind+' out of the tank');}if(T0.n>=TANKMAX){say('the tank is full');sfx('deny');return true;}T0.kind=src;const add=src==='oil'?3:6;T0.n=Math.min(TANKMAX,T0.n+add);if(src==='oil'){const i=Math.floor(P.y/TS)*MW+Math.floor(P.x/TS);oil[i]=Math.max(0,oil[i]-1);paintTile(i%MW,(i/MW)|0);}sfx('slosh');float(P.x,P.y-8,src+' '+T0.n+'/'+TANKMAX,FLASKCOL[src]);return true;}
  const f=P.flask;if(f&&f.has&&f.n>0){if(T0.kind&&T0.kind!==f.kind&&T0.n>0){T0.n=0;}if(T0.n>=TANKMAX){say('the tank is full');sfx('deny');return true;}T0.kind=f.kind;T0.n=Math.min(TANKMAX,T0.n+4*f.n);f.n=0;f.kind=null;sfx('slosh');say('you pour the flask into the tank');return true;}
  return false;}
function drinkTank(){const P=player,T0=P.tank;if(!T0||!T0.n){say('the tank is empty. R fills it from a liquid you stand in');sfx('deny');return;}if(T0.kind!=='water'){say('you are not drinking '+T0.kind);sfx('deny');return;}T0.n--;if(!T0.n)T0.kind=null;P.st.brn=0;P.st.wet=Math.min(100,P.st.wet+15);if(P.sat+4<=100){P.sat+=4;gainFoodXp(2);}sfx('slosh');say('a long pull of tank water');}
function soakSpray(dt){const P=player,T0=P.tank;if(!T0||!T0.n){if(P.emptyT<=0){say('the tank is empty. R to fill it');sfx('deny');P.emptyT=1.2;}return;}
  P.soakAcc=(P.soakAcc||0)+dt;if(P.soakAcc>=0.3){P.soakAcc=0;T0.n--;if(!T0.n){const k=T0.kind;T0.kind=null;say('the tank runs dry');}}breakCloak();
  const kind=T0.kind||'water';for(let k=0;k<2;k++){const a=P.ang+rr(-0.08,0.08)*(P.aiming?0.5:1),sp=rr(190,230);soaks.push({x:P.x+Math.cos(P.ang)*7,y:P.y+Math.sin(P.ang)*7,vx:Math.cos(a)*sp+P.vx*0.3,vy:Math.sin(a)*sp+P.vy*0.3,t:0.42,m:0.42,kind,hit:new Set()});}
  if(Math.random()<dt*8)sfx('slosh');}
function soakPool(x,y,kind){const tx=Math.floor(x/TS),ty=Math.floor(y/TS),i=ty*MW+tx;if(tx<0||ty<0||tx>=MW||ty>=MH||solid(tx,ty)||chasm[i])return;
  if(kind==='water'){if(hz[i]===1){hz[i]=0;fires=fires.filter(f=>!(f.tx===tx&&f.ty===ty));}if(molten[i]===1){crustTile(i);return;}if(slime[i])slime[i]=0;if(!liq[i]&&Math.random()<0.35){liq[i]=1;paintTile(tx,ty);}}
  else if(kind==='oil'){if(!oil[i]&&Math.random()<0.4)spillOil(tx,ty,0,1);}
  else if(kind==='toxic'){if(hz[i]!==2&&Math.random()<0.3){hz[i]=2;paintTile(tx,ty);}}}
function updateSoaks(dt){for(const s0 of soaks){s0.t-=dt;s0.vy+=0;const nx=s0.x+s0.vx*dt,ny=s0.y+s0.vy*dt;if(solidAt(nx,ny)){s0.t=0;}else{s0.x=nx;s0.y=ny;}s0.vx*=Math.pow(0.3,dt);s0.vy*=Math.pow(0.3,dt);
    for(const e of enemies){if(e.dead||s0.hit.has(e)||ET[e.type].ghost)continue;if(Math.hypot(e.x-s0.x,e.y-s0.y)<e.r+2){s0.hit.add(e);const l=Math.hypot(s0.vx,s0.vy)||1;e.vx=(e.vx||0)+s0.vx/l*20;e.vy=(e.vy||0)+s0.vy/l*20;
      if(s0.kind==='water'){e.burnT=0;e.wetT=5;}else if(s0.kind==='oil'){e.oilT=8;}else if(s0.kind==='toxic'){e.tox=(e.tox||0)+0.25;if(e.tox>=1){e.tox-=1;damageEnemy(e,1,0,0,0,true);}}}}
    for(const b of barrels)if(!b.dead&&s0.kind==='water'&&Math.hypot(b.x-s0.x,b.y-s0.y)<6)b.heat=0;
    if(s0.t<=0)soakPool(s0.x,s0.y,s0.kind);}soaks=soaks.filter(q=>q.t>0);
  for(const e of enemies){if(e.wetT>0)e.wetT-=dt;if(e.oilT>0){e.oilT-=dt;if(e.burnT>0)e.burnT=Math.max(e.burnT,5);}}}
function splashFlask(o){const tx=Math.floor(o.x/TS),ty=Math.floor(o.y/TS);if(chasm[ty*MW+tx]){items.push({x:o.x,y:o.y,type:'flask',ph:0,fall:0.7,fallM:0.7,fx:1});sfx('fall');return;}sfx('slosh');
  for(let k=0;k<10;k++)parts.push({x:o.x,y:o.y,vx:rr(-50,50),vy:rr(-50,50),t:0.4,m:0.4,c:o.kind?FLASKCOL[o.kind]:'#c9cfc2',s:1});
  if(o.kind==='water'){for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=tx+dx,y=ty+dy;if(solid(x,y))continue;const i=y*MW+x;if(hz[i]===1){hz[i]=0;fires=fires.filter(f=>!(Math.floor(f.x/TS)===x&&Math.floor(f.y/TS)===y));}if(!liq[i]&&(dx===0&&dy===0||Math.random()<0.5+o.n*0.15))liq[i]=1;paintTile(x,y);}
    if(Math.hypot(player.x-o.x,player.y-o.y)<18){player.st.wet=Math.min(100,player.st.wet+30);player.st.brn=0;}}
  else if(o.kind==='oil')spillOil(tx,ty,o.n>=2?1:0,1+o.n);
  else if(o.kind==='toxic'){hz[ty*MW+tx]=2;paintTile(tx,ty);if(o.n>=2)for(const [dx,dy] of D4){if(Math.random()<0.5&&!solid(tx+dx,ty+dy)){hz[(ty+dy)*MW+tx+dx]=2;paintTile(tx+dx,ty+dy);}}}
  let x=o.x,y=o.y;if(blocked(x,y,2)){x-=o.vx*0.03;y-=o.vy*0.03;}items.push({x,y,type:'flask',ph:0,noPick:0.4});}
function updateFlasks(dt){for(const o of flasksOut){o.t-=dt;const nx=o.x+o.vx*dt,ny=o.y+o.vy*dt;if(solidAt(nx,ny)||o.t<=0){o.done=true;splashFlask(o);continue;}o.x=nx;o.y=ny;
  for(const e of enemies)if(!e.dead&&!ET[e.type].ghost&&Math.hypot(e.x-o.x,e.y-o.y)<e.r+2){o.done=true;splashFlask(o);damageEnemy(e,1,o.vx,o.vy,60);break;}}flasksOut=flasksOut.filter(o=>!o.done);}
function dropQuick(id){const P=player,q=qInfo(id);if(!q||q.n()<=0)return;const x=P.x+Math.cos(P.ang)*8,y=P.y+Math.sin(P.ang)*8,ix=blocked(x,y,2)?P.x:x,iy=blocked(x,y,2)?P.y:y;
  if(id.startsWith('food:')){const k=id.slice(5);P.food[k]--;items.push({x:ix,y:iy,type:'food',food:k,ph:0,noPick:1.2});}
  else{P.inv[id]--;items.push({x:ix,y:iy,type:id,ph:0,noPick:1.2,amt:1});}sfx('click');float(P.x,P.y-6,'dropped '+q.name.toLowerCase(),'#8e978b');}
let scanT=0,scanBins=null;
function useTool(id){const P=player;
  if(id==='glowstick'){P.glowOn=!P.glowOn;sfx('click');say(P.glowOn?'the glowstick cracks on':'you cover the glowstick');return;}
  if(id==='sledge'){if((P.sledgeCd||0)>0)return;if(P.stam<12){say('too tired to swing');sfx('click');return;}P.stam-=12;P.sledgeCd=0.9;P.shoveT=0.18;
    const hx=P.x+Math.cos(P.ang)*13,hy=P.y+Math.sin(P.ang)*13,tx=Math.floor(hx/TS),ty=Math.floor(hy/TS);sfx('thud');shake=Math.max(shake,4);noise(P.x,P.y,170);alertAdd(2);
    if(tx>=0&&ty>=0&&tx<MW&&ty<MH&&map[ty*MW+tx]===3){destroySecret(tx,ty);say('the wall caves in');}
    else if(solid(tx,ty))for(let k=0;k<8;k++)parts.push({x:hx,y:hy,vx:rr(-40,40),vy:rr(-40,40),t:0.3,m:0.3,c:'#8e978b',s:1});
    for(const bb of barrels){if(bb.dead)continue;const dx=bb.x-P.x,dy=bb.y-P.y;if(Math.hypot(dx,dy)<26&&Math.abs(angDiff(Math.atan2(dy,dx),P.ang))<0.9){if(bb.crate)breakCrate(bb);else hitBarrel(bb,2,dx,dy,340);}}
    for(const e of enemies){if(e.dead)continue;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);if(d>24+e.r)continue;let da=Math.atan2(dy,dx)-P.ang;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)<0.9)damageEnemy(e,4,dx,dy,e.type==='brute'?140:300);}
    return;}
  if(id==='scanner'){if((P.scanCd||0)>0){say('the scanner is still charging');sfx('click');return;}P.scanCd=6;scanT=3.5;scanBins=new Array(8).fill(0);
    for(const e of enemies){if(e.dead||ET[e.type].dummy||ET[e.type].plant)continue;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);if(d>480)continue;const b=((Math.round(Math.atan2(dy,dx)/(Math.PI/4))%8)+8)%8;scanBins[b]+=d<160?1.5:1;}
    sfx('sonar');const tot=scanBins.reduce((a,b)=>a+b,0),tp=revealTraps(P.x,P.y,TRAP_CFG.scanR);say((tot?'the scanner crackles. contacts nearby':'the scanner hums. nothing close')+(tp?'. it marks '+(tp>1?tp+' pressure plates':'a pressure plate'):''));return;}}
function throwGlow(){const P=player;if(!P.tools.glowstick)return;P.tools.glowstick=false;P.glowOn=false;
  flares.push({x:P.x,y:P.y,vx:Math.cos(P.ang)*150*(1+0.2*U('throw')),vy:Math.sin(P.ang)*150*(1+0.2*U('throw')),t:1e6,ph:Math.random()*6,pts:null,r:FLARE_R*0.8,glow:true,age:0});sfx('whoosh');}
function giveTool(id){const P=player;if(P.tools[id]){P.inv.scrap+=2;say('you already have a '+TOOLS[id].name.toLowerCase()+'. stripped it for 2 scrap');return;}P.tools[id]=true;
  if(!P.quick.slice(0,qCap()).includes(id)){const fr=P.quick.findIndex((q,qi)=>!q&&qi<qCap());if(fr>=0)P.quick[fr]=id;}say('new tool: '+TOOLS[id].name.toLowerCase()+'. it lives in Pack > Items');}
function quickPrimary(){const P=player,id=P.quick[selQuick()],q=qInfo(id);if(!q){say('empty slot. fill it from the pack (TAB)');sfx('click');return;}
  if(id==='flask')return flaskPrimary();if(TOOLS[id]){if(!player.tools[id]){say('you do not have that tool right now');sfx('click');return;}return useTool(id);}if(q.n()<=0){say('out of '+q.name.toLowerCase());sfx('click');return;}q.use();}
function quickSecondary(){const P=player,id=P.quick[selQuick()];if(!id)return;if(id==='flask')return throwFlask();if(id==='glowstick')return throwGlow();if(TOOLS[id])return;dropQuick(id);}
function useQuick(){const id=player.quick[player.quickSel],q=qInfo(id);if(!q){say('empty quick slot. fill it from the pack (TAB)');sfx('click');return;}if(q.n()<=0){say('out of '+q.name.toLowerCase());sfx('click');return;}q.use();}
function assignQuick(id,slot){if(slot>=qCap()){say('that slot is locked. belt pouches and bandoliers add more');sfx('click');return;}const Q=player.quick;const j=Q.indexOf(id);if(j>=0)Q[j]=null;Q[slot]=id;sfx('click');}
function qIcon(id,x,y){if(!id)return;
  if(id==='glowstick'){const on=player&&player.glowOn;F('#15110a',x-2,y-5,5,11);F(on?'#9fff9a':'#4a7a4a',x-1,y-4,3,9);if(on){ctx.globalAlpha=0.3;ctx.fillStyle='#9fff9a';circ(x,y,5);ctx.globalAlpha=1;}return;}
  if(id==='sledge'){F('#15110a',x-4,y-5,9,5);F('#6a7078',x-3,y-4,7,3);F('#8a6a3a',x,y-1,1,7);return;}
  if(id==='scanner'){F('#15110a',x-3,y-4,7,9);F('#3a4a3a',x-2,y-3,5,7);F('#9fe0b0',x-1,y-2,3,2);F('#c8c0a0',x+2,y-6,1,3);return;}const di=(t,e)=>drawItem(Object.assign({x:x+camX,y:y+camY,type:t,ph:0},e||{}));
  if(id.startsWith('food:'))return di('food',{food:id.slice(5)});
  if(id==='medpatch')return di('medkit');if(id==='emetic')return di('emetic');
  if(id==='charge'){F('#15110a',x-4,y-2,9,5);F('#7a8c93',x-3,y-1,7,3);F('#c0402a',x+3,y-2,1,1);return;}
  if(id==='flare'){F('#15110a',x-4,y-1,9,4);F('#b8493a',x-3,y,7,2);F('#ffd0a0',x+3,y-1,2,2);return;}
  if(id==='stim'){F('#15110a',x-4,y-2,9,5);F('#d8dcd4',x-3,y-1,5,3);F('#5fae6e',x-2,y,3,1);F('#8a969e',x+2,y,2,1);return;}
  if(id==='mine'){F('#15110a',x-4,y-1,9,4);F('#5a6066',x-3,y-1,7,3);F(Math.sin(T*6)>0?'#ff5a4a':'#7a2020',x,y-2,1,1);return;}
  if(id==='surgery'){F('#15110a',x-4,y-3,9,7);F('#e8e8e8',x-3,y-2,7,5);F('#4a8ac0',x-3,y-2,7,1);F('#c04040',x,y,1,2);return;}
  if(id==='molotov'){F('#15110a',x-2,y-4,5,9);F('#6a8a4a',x-1,y-2,3,6);F('#c8b890',x-1,y-5,2,3);F('#ff9a4a',x,y-6,1,1);return;}
  if(id==='gasnade'){F('#15110a',x-3,y-3,7,8);F('#6a8a30',x-2,y-2,5,6);F('#c0d060',x-2,y-2,5,1);F('#3a403c',x-1,y-4,3,2);return;}
  if(id==='cryonade'){F('#15110a',x-3,y-3,7,8);F('#8ab8d8',x-2,y-2,5,6);F('#e8f6ff',x-2,y-2,5,1);F('#3a403c',x-1,y-4,3,2);return;}
  if(id==='smokenade'){F('#15110a',x-3,y-3,7,8);F('#6a6e72',x-2,y-2,5,6);F('#a8acb0',x-2,y-2,5,1);F('#3a403c',x-1,y-4,3,2);return;}
  if(id==='medkit'){F('#15110a',x-4,y-3,8,7);F('#d8dcd4',x-3,y-2,6,5);F('#c04040',x-1,y-1,2,3);F('#c04040',x-2,y,4,1);return;}
  if(id==='trauma'){F('#15110a',x-4,y-4,9,8);F('#d8dcd4',x-3,y-3,7,6);F('#c04040',x-1,y-2,2,4);F('#c04040',x-2,y-1,4,2);F('#7fd08e',x-3,y-3,7,1);return;}
  if(id==='regen'){F('#15110a',x-2,y-4,5,8);F('#7fd08e',x-1,y-2,3,5);F('#d8dcd4',x-1,y-3,3,1);F('#fff',x,y-1,1,1);return;}
  if(id==='antitox'){F('#15110a',x-2,y-4,5,8);F('#3a9a8a',x-1,y-2,3,5);F('#d8dcd4',x-1,y-3,3,1);return;}
  if(id==='flask'){const f=player.flask;F('#15110a',x-3,y-4,7,9);F('#8a969e',x-2,y-3,5,7);F('#6a4a2a',x-1,y-5,3,2);if(f.n)F(FLASKCOL[f.kind],x-2,y+3-f.n*2,5,f.n*2);return;}}
let orbiters=[],senseT=0,senseX=0,senseY=0,senseR=0;
function slingCount(a){const P=player,d=SLING[a];if(a==='debris')return 'inf';if(d.ammo)return ''+(P.inv[d.ammo]||0);if(a==='charge')return ''+(P.inv.charge||0);if(a==='flask')return P.flask.has?'1':'0';return ''+((P.inv.molotov||0)+(P.inv.gasnade||0)+(P.inv.smokenade||0));}
function fireSling(id,c){const P=player;if(!id){say('empty slot. set up the sling bar in Files > Skills');sfx('deny');return;}const d=SLING[id];if(P.liq===4){say('you cannot sling while swimming');return;}
  if(d.thrown){if(id==='charge'){if(!(P.inv.charge>0)){sfx('deny');say('no pipe charges');return;}throwCharge();}else if(id==='flask'){if(!P.flask.has){sfx('deny');say('no flask');return;}throwFlask();}
    else{const k=['molotov','gasnade','smokenade','cryonade'].find(q=>P.inv[q]>0);if(!k){sfx('deny');say('no grenades');return;}throwNade(k);}P.slCd=0.6;return;}
  if(d.ammo&&!(P.inv[d.ammo]>0)){sfx('deny');say('out of '+d.ammo);P.slCd=0.3;return;}if(d.ammo)P.inv[d.ammo]--;breakCloak();
  const mult=1+1.5*c,spread=(P.actAim?0.03:0.12)*(1-0.7*c),sp=240+220*c,n=d.pel||1;
  for(let k=0;k<n;k++){const a=P.ang+rr(-spread,spread)+(n>1?(k-(n-1)/2)*0.09:0),base=d.dmg<0?rr(1,5.5):d.dmg;
    bullets.push({x:P.x,y:P.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:0.8,dmg:base*mult,cc:0.06+(S.crit||0)+(perk('slinger')&&c>0.9?0.15:0),p:true,kb:50+80*c,kind:'sling',slk:id,pierce:!!d.pierce,hits:d.pierce?new Set():null,shock:!!d.shock});}
  P.slCd=0.55;sfx('whoosh');noise(P.x,P.y,30);if(c>=1)float(P.x,P.y-10,'full draw','#e8dcb0');}
function slingInput(dt){const P=player;P.actAim=mouse.r;
  if(mouse.l&&!(P.slCd>0)){if(!(P.slChg>0))P.slChg=0.001;P.slChg+=dt/0.8;if(P.slChg>=1&&!P.slFull){P.slFull=true;sfx('hackok');}}
  else if(!mouse.l&&P.slChg>0){const c=Math.min(1,P.slChg);P.slChg=0;P.slFull=false;fireSling(P.slingbar[selQuick()],c<0.12?0:c);}}
function orbitDmg(){const P=player,m=P.arms[P.armSet].main?(ARM[P.arms[P.armSet].main].melee||FIST):FIST;return Math.max(1,(m.dmg+(S.meleeDmg||0))*0.8*(perk('shrapnel')?1.5:1));}
// psychic actions cost stamina (push 8, well 16, calm 18, pyro 10); without enough, the rest comes out of your health
let wells=[];
function actCdMul(){return (1-0.15*U('focus'))*mindCd();}
function castAct(){const P=player,id=P.actbar[selQuick()];if(!id){say('empty action slot. assign actions in Files > Skills (K)');sfx('click');return;}
  const A=ACTS[id],cd=P.actCd[id]||0;if(cd>0){say(A.name.toLowerCase()+' is recharging');sfx('click');return;}
  if(id==='calm'){const nf=npcNear(mouse.sx+camX,mouse.sy+camY,18);if(nf){const line=nf.kind==='psychic'?'"Kind of you. I was never against you." She smiles back, without opening her eyes.':NPCS[nf.npc].calm;say(line.replace(/"/g,''));float(nf.tx*TS+6,nf.ty*TS,'already friendly','#9fe0b0');sfx('learn');return;}}
  if(id==='astral'&&P.astral){endAstral('you return to your body');return;}
  {const cost={push:8,well:16,calm:18,pyro:10,orbit:14,hex:12,hold:16,sense:10,astral:20}[id]||10;if(P.stam>=cost)P.stam-=cost;else{const rest=cost-P.stam;P.stam=0;hurtPlayer(rest*0.5,true);float(P.x,P.y-10,'psychic strain','#c9a8ff');}P.stamDelay=0.6;}
  const wx=mouse.sx+camX,wy=mouse.sy+camY,dx=wx-P.x,dy=wy-P.y,dist=Math.hypot(dx,dy)||1,ux=dx/dist,uy=dy/dist;breakCloak();
  if(id==='push'){for(const bb of barrels){if(bb.dead)continue;const ex=bb.x-P.x,ey=bb.y-P.y,d=Math.hypot(ex,ey);if(d>85)continue;let da=Math.atan2(ey,ex)-P.ang;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)<0.65)pushBarrel(bb,ex,ey,380);}
    for(const e of enemies){if(e.dead||ET[e.type].ghost)continue;const ex=e.x-P.x,ey=e.y-P.y,d=Math.hypot(ex,ey);if(d>80+e.r)continue;
      let da=Math.atan2(ey,ex)-P.ang;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>0.65)continue;damageEnemy(e,2,ex,ey,e.type==='brute'?200:360);if(perk('concussive'))e.stun=Math.max(e.stun||0,1);}
    for(let k=0;k<24;k++){const a=P.ang+rr(-0.6,0.6),v=rr(90,180);parts.push({x:P.x,y:P.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0.35,m:0.35,c:A.col,s:1});}sfx('slam');shake=Math.max(shake,3);noise(P.x,P.y,90);}
  else if(id==='well'){const r=Math.min(110,dist),x=P.x+ux*r,y=P.y+uy*r;if(solidAt(x,y)||!hasLOS(P.x,P.y,x,y)){say('you cannot reach that spot');sfx('click');return;}wells.push({x,y,t:2.5,m:2.5});sfx('hiss');}
  else if(id==='orbit'){const n=perk('shrapnel')?3:2;orbiters=[];for(let k=0;k<n;k++)orbiters.push({a:k/n*6.283,t:10,hit:new Map()});sfx('sonar');float(P.x,P.y-10,'debris rises','#c8c0b0');}
  else if(id==='astral'){P.astral={x:P.x,y:P.y,t:12};P.vx=0;P.vy=0;sfx('learn');say('you slip out of your body. WASD to drift, Q to return');for(let k=0;k<14;k++)parts.push({x:P.x,y:P.y,vx:rr(-30,30),vy:rr(-30,30),t:0.5,m:0.5,c:'#c8b8ff',s:1});}
  else if(id==='sense'){senseT=8;senseX=P.x;senseY=P.y;senseR=0;sfx('sonar');let n=0;for(const e of enemies)if(!e.dead&&!ET[e.type].dummy&&Math.hypot(e.x-P.x,e.y-P.y)<320)n++;say(n?'you feel '+n+' living thing'+(n>1?'s':'')+' nearby':'nothing alive close by. just you');}
  else if(id==='hold'){const r=Math.min(110,dist),x=P.x+ux*r,y=P.y+uy*r;let n=0;for(const e of enemies){if(e.dead)continue;const b=ET[e.type];if(b.dummy||b.ghost||b.plant)continue;if(Math.hypot(e.x-x,e.y-y)<36){e.holdT=3.5;n++;}}
    for(let k=0;k<14;k++){const a=k/14*6.283;parts.push({x:x+Math.cos(a)*34,y:y+Math.sin(a)*34,vx:0,vy:0,t:0.6,m:0.6,c:A.col,s:1});}sfx('hackok');if(!n)say('nothing there to hold');}
  else if(id==='hex'){const r=Math.min(110,dist),x=P.x+ux*r,y=P.y+uy*r;let n=0;for(const e of enemies){if(e.dead||ET[e.type].dummy)continue;if(Math.hypot(e.x-x,e.y-y)<40){e.hexT=8;n++;}}
    for(let k=0;k<16;k++){const a=k/16*6.283;parts.push({x:x+Math.cos(a)*38,y:y+Math.sin(a)*38,vx:-Math.cos(a)*30,vy:-Math.sin(a)*30,t:0.5,m:0.5,c:A.col,s:1});}sfx('hiss');if(!n)say('nothing there to unravel');}
  else if(id==='calm'){let best=null,bd=26;for(const e of enemies){if(e.dead)continue;const b=ET[e.type];if(b.dummy||b.ghost||b.plant||b.drone)continue;const d=Math.hypot(e.x-wx,e.y-wy);if(d<bd&&Math.hypot(e.x-P.x,e.y-P.y)<140){bd=d;best=e;}}
    if(!best){say('there is no mind there to reach');sfx('click');return;}best.friendT=20;best.alert=false;float(best.x,best.y-8,'calmed','#9fe0b0');sfx('learn');
    for(let k=0;k<10;k++){const a=k/10*6.283;parts.push({x:best.x,y:best.y,vx:Math.cos(a)*30,vy:Math.sin(a)*30,t:0.5,m:0.5,c:A.col,s:1});}}
  else if(id==='pyro'){const r=Math.min(110,dist),x=P.x+ux*r,y=P.y+uy*r,tx=Math.floor(x/TS),ty=Math.floor(y/TS);if(solid(tx,ty)||!hasLOS(P.x,P.y,x,y)){say('you cannot reach that spot');sfx('click');return;}
    const i=ty*MW+tx;if(oil[i])igniteOil(tx,ty);else if(liq[i]>=2){say('the water hisses and the flame dies');for(let k=0;k<8;k++)parts.push({x,y,vx:rr(-20,20),vy:rr(-40,-10),t:0.6,m:0.6,c:'rgba(220,220,220,0.6)',s:1});}
    else{for(const [ddx,ddy] of [[0,0],...D4]){const X=tx+ddx,Y=ty+ddy,j=Y*MW+X;if((ddx||ddy)&&Math.random()<0.5)continue;if(solid(X,Y)||liq[j]>=2)continue;if(oil[j]){igniteOil(X,Y);continue;}hz[j]=1;fires.push({x:X*TS+6,y:Y*TS+6,ph:Math.random()*6,temp:4,tx:X,ty:Y});paintTile(X,Y);}}
    for(const e of enemies)if(!e.dead&&Math.hypot(e.x-x,e.y-y)<16){const fw=fireWeak(e);damageEnemy(e,3*(fw?3:1),0,0,0,true);if(fw)e.burnT=5;}sfx('whoosh');}
  P.actCd[id]=A.cd*actCdMul();}
function updateActs(dt){const P=player;if(senseT>0){senseT-=dt;senseR+=dt*420;}for(const k in P.actCd)if(P.actCd[k]>0)P.actCd[k]-=dt;
  for(const e of enemies){if(e.hexT>0)e.hexT-=dt;if(e.stunB>0)e.stunB=Math.max(0,e.stunB-22*dt);}
  for(const o of orbiters){o.t-=dt;o.a+=dt*4.2;const ox=P.x+Math.cos(o.a)*17,oy=P.y+Math.sin(o.a)*17;o.x=ox;o.y=oy;for(const [e,t] of o.hit)if(t-dt<=0)o.hit.delete(e);else o.hit.set(e,t-dt);
    for(const e of enemies){if(e.dead||ET[e.type].ghost||o.hit.has(e))continue;if(Math.hypot(e.x-ox,e.y-oy)<e.r+3){let od=orbitDmg();if(Math.random()<0.05+(S.crit||0)){od*=2;critFx(e,od);}damageEnemy(e,od,e.x-P.x,e.y-P.y,90);o.hit.set(e,0.45);sfx('hit');}}
    for(const bb of barrels){if(!bb.dead&&Math.hypot(bb.x-ox,bb.y-oy)<7)pushBarrel(bb,bb.x-P.x,bb.y-P.y,60*dt*10);}}
  orbiters=orbiters.filter(o=>o.t>0);
  for(const w of wells){w.t-=dt;for(const bb of barrels){if(bb.dead)continue;const dx=w.x-bb.x,dy=w.y-bb.y,d=Math.hypot(dx,dy);if(d<60&&d>3)pushBarrel(bb,dx,dy,380*dt);}for(const e of enemies){if(e.dead||ET[e.type].ghost)continue;const dx=w.x-e.x,dy=w.y-e.y,d=Math.hypot(dx,dy);if(d<60&&d>2){const f=(e.type==='brute'?140:260)*dt;move(e,dx/d*f*0.4,dy/d*f*0.4);}}
    if(Math.random()<0.6){const a=Math.random()*6.283;parts.push({x:w.x+Math.cos(a)*40,y:w.y+Math.sin(a)*40,vx:-Math.cos(a)*80,vy:-Math.sin(a)*80,t:0.45,m:0.45,c:ACTS.well.col,s:1});}
    if(w.t<=0){for(const e of enemies)if(!e.dead&&Math.hypot(e.x-w.x,e.y-w.y)<34)damageEnemy(e,5,e.x-w.x,e.y-w.y,120);shake=Math.max(shake,3);sfx('thud');for(let k=0;k<20;k++){const a=k/20*6.283;parts.push({x:w.x,y:w.y,vx:Math.cos(a)*120,vy:Math.sin(a)*120,t:0.3,m:0.3,c:ACTS.well.col,s:1});}}}
  wells=wells.filter(w=>w.t>0);}
function drawActWorld(){const P=player;
  for(const q of soaks){const k=q.t/q.m;ctx.globalAlpha=0.5+0.4*k;ctx.fillStyle=FLASKCOL[q.kind]||'#6fb3c3';circ(q.x-camX,q.y-camY,1.2+(1-k)*1.8);}ctx.globalAlpha=1;
  for(const m of mines){const x=Math.round(m.x-camX),y=Math.round(m.y-camY);if(!seen[Math.floor(m.y/TS)*MW+Math.floor(m.x/TS)])continue;F('#15110a',x-3,y-1,7,3);F('#5a6066',x-2,y-1,5,2);const blink=m.trig>=0?Math.sin(T*40)>0:m.arm>0?Math.sin(T*4)>0.6:Math.sin(T*8)>0.3;if(blink)F(m.arm>0?'#d9a441':'#ff5a4a',x,y-2,1,1);}
  if(P.astral){const A=P.astral,ax=A.x-camX,ay=A.y-camY,bx=P.x-camX,by=P.y-camY,k=Math.min(1,A.t/2);ctx.strokeStyle='rgba(200,184,255,0.25)';ctx.lineWidth=1;ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(ax,ay);ctx.stroke();ctx.setLineDash([]);
    ctx.globalAlpha=0.35+0.15*Math.sin(T*4);ctx.fillStyle='#c8b8ff';circ(ax,ay,5);ctx.fillStyle='#efe8ff';circ(ax,ay,3.5);ctx.globalAlpha=1;
    ctx.strokeStyle='rgba(200,184,255,0.5)';ctx.beginPath();ctx.arc(bx,by,7+Math.sin(T*3),0,6.283);ctx.stroke();txt(Math.ceil(A.t)+'s',ax,ay-12,'#c8b8ff','center');}
  if(senseT>0){const a=Math.min(1,senseT/1.5);if(senseR<340){ctx.strokeStyle=`rgba(240,208,232,${0.5*(1-senseR/340)})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(senseX-camX,senseY-camY,senseR,0,6.283);ctx.stroke();}
    const L=[...enemies.filter(e=>!e.dead&&!ET[e.type].dummy).map(e=>({x:e.x,y:e.y,r:e.r,c:e.friendT>0?'159,224,176':ET[e.type].plant?'200,170,90':'255,90,90'})),...fixtures.filter(f=>f.kind==='npc'||f.kind==='psychic').map(f=>({x:f.tx*TS+6,y:f.ty*TS+6,r:4,c:'240,230,220'}))];
    for(const q of L){if(Math.hypot(q.x-P.x,q.y-P.y)>320||Math.hypot(q.x-senseX,q.y-senseY)>senseR)continue;const x=q.x-camX,y=q.y-camY,pl=0.6+0.4*Math.sin(T*5+q.x*0.1);ctx.strokeStyle=`rgba(${q.c},${0.75*a*pl})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,q.r+3+Math.sin(T*4+q.y)*1,0,6.283);ctx.stroke();F(`rgba(${q.c},${0.9*a})`,Math.round(x),Math.round(y),1,1);}}
  ctx.save();ctx.globalCompositeOperation='lighter';for(const e of enemies){if(e.dead||!ET[e.type].guard)continue;const ex=e.x,ey=e.y;if(Math.abs(ex-camX-W/2)>W/2+150||Math.abs(ey-camY-H/2)>H/2+150)continue;
    const pts=[[ex-camX,ey-camY]];for(let k=0;k<=10;k++){const a=(e.look||0)-0.55+1.1*k/10,c=Math.cos(a),s2=Math.sin(a),dd=castRay(ex,ey,c,s2,150,false);pts.push([ex+c*dd-camX,ey+s2*dd-camY]);}
    const g=ctx.createRadialGradient(ex-camX,ey-camY,4,ex-camX,ey-camY,150);g.addColorStop(0,e.alert?'rgba(255,230,190,0.16)':'rgba(210,225,255,0.12)');g.addColorStop(1,'rgba(210,225,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.fill();}
  ctx.restore();
  for(const t of trips){const a1=[t.x1-camX,t.y1-camY],a2=[t.x2-camX,t.y2-camY];const tx=Math.floor((t.x1+t.x2)/2/TS),ty=Math.floor((t.y1+t.y2)/2/TS);if(!seen[ty*MW+tx])continue;
    F(t.on?'#c04040':'#3a2a2a',Math.round(a1[0])-1,Math.round(a1[1])-1,3,3);F(t.on?'#c04040':'#3a2a2a',Math.round(a2[0])-1,Math.round(a2[1])-1,3,3);
    if(t.on){ctx.strokeStyle=`rgba(255,60,60,${0.35+0.25*Math.sin(T*6)})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a1[0],a1[1]);ctx.lineTo(a2[0],a2[1]);ctx.stroke();}}
  if(secT>0&&Math.sin(T*14)>0.2)F(`rgba(220,30,30,${0.07+0.06*Math.min(1,secT/3)})`,0,0,W,H);
  {const x0=Math.max(0,Math.floor(camX/TS)),y0=Math.max(0,Math.floor(camY/TS)),x1=Math.min(MW-1,Math.ceil((camX+W)/TS)),y1=Math.min(MH-1,Math.ceil((camY+H)/TS));
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*MW+x;if(molten[i]!==1||!seen[i])continue;const px=x*TS-camX,py=y*TS-camY,g=0.18+0.12*Math.sin(T*2.2+x*1.7+y*1.3);F(`rgba(255,150,60,${g})`,px,py,TS,TS);
      if(Math.random()<0.02)parts.push({x:x*TS+rr(2,10),y:y*TS+rr(2,10),vx:rr(-4,4),vy:rr(-18,-6),t:0.5,m:0.5,c:'#ffb050',s:1});}}
  {const x0=Math.max(0,Math.floor(camX/TS)),y0=Math.max(0,Math.floor(camY/TS)),x1=Math.min(MW-1,Math.ceil((camX+W)/TS)),y1=Math.min(MH-1,Math.ceil((camY+H)/TS));ctx.strokeStyle='rgba(220,224,216,0.55)';ctx.lineWidth=1;ctx.beginPath();
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*MW+x;if(!webs[i]||!seen[i])continue;const cx=x*TS+6-camX,cy=y*TS+6-camY;for(let k=0;k<4;k++){const a=k*Math.PI/4+((x*7+y*3)%3)*0.2;ctx.moveTo(cx-Math.cos(a)*6,cy-Math.sin(a)*6);ctx.lineTo(cx+Math.cos(a)*6,cy+Math.sin(a)*6);}
      ctx.moveTo(cx+3,cy);ctx.arc(cx,cy,3,0,6.283);ctx.moveTo(cx+5.5,cy);ctx.arc(cx,cy,5.5,0,6.283);}ctx.stroke();}
  for(const f of flames){const k=f.t/f.m,x=f.x-camX,y=f.y-camY,r=2+(1-k)*4;ctx.globalAlpha=0.35+0.5*k;ctx.fillStyle=k>0.6?'#fff0a0':k>0.3?'#ffa040':'#c04020';circ(x,y,r);}ctx.globalAlpha=1;
  for(const n of nades){const x=Math.round(n.x-camX),y=Math.round(n.y-camY);if(n.kind==='molotov'){F('#6a8a4a',x-1,y-2,3,4);F('#ff9a4a',x+Math.round(Math.cos(n.spin)*2),y+Math.round(Math.sin(n.spin)*2)-2,1,1);}else{F(n.kind==='gasnade'?'#6a8a30':n.kind==='cryonade'?'#9fd0f0':'#6a6e72',x-2,y-2,4,4);F('#15110a',x-1,y-3,2,1);}}
  drawClouds();
  for(const o of orbiters){if(o.x==null)continue;const x=Math.round(o.x-camX),y=Math.round(o.y-camY);ctx.globalAlpha=0.35;ctx.fillStyle='#a88af0';circ(x,y,4);ctx.globalAlpha=1;F('#15110a',x-2,y-2,4,4);F('#8e978b',x-1,y-2,3,3);F('#c8c0b0',x-1,y-2,1,1);}
  for(const e of enemies)if(e.stunB>2&&!e.dead){const x=Math.round(e.x-camX),y=Math.round(e.y-camY);F('#141817',x-5,y-e.r-5,10,1);F('#e8dcb0',x-5,y-e.r-5,Math.round(10*Math.min(1,e.stunB/100)),1);}
  for(const e of enemies)if(e.holdT>0&&!e.dead){const x=Math.round(e.x-camX),y=Math.round(e.y-camY);for(let k=0;k<4;k++){const a=k*1.571+T*1.5;F('#7fd8e0',Math.round(x+Math.cos(a)*(e.r+2)),Math.round(y+Math.sin(a)*(e.r+2)),2,2);}}
  for(const e of enemies)if(e.hexT>0&&!e.dead){const x=Math.round(e.x-camX),y=Math.round(e.y-camY);ctx.strokeStyle='rgba(224,112,192,0.7)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,e.r+3+Math.sin(T*8),0,6.283);ctx.stroke();}
  if(lowGrav()&&Math.random()<0.4)parts.push({x:camX+rnd(W),y:camY+rnd(H),vx:rr(-4,4),vy:rr(-8,-2),t:1.2,m:1.2,c:'rgba(200,210,230,0.35)',s:1});
  if(P.floating&&state==='play'){const x=P.x-camX,y=P.y-camY;ctx.globalAlpha=0.5;ctx.strokeStyle='#b8a8e8';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y+6,6+Math.sin(T*6),2,0,0,6.283);ctx.stroke();ctx.globalAlpha=1;}
  for(const f of flares)if(f.glow){const x=Math.round(f.x-camX),y=Math.round(f.y-camY);F('#2a4a2a',x-2,y,5,2);F('#9fff9a',x-2,y-1,5,1);}
  if(scanT>0&&scanBins){const px=P.x-camX,py=P.y-camY,a=Math.min(1,scanT);for(let b=0;b<8;b++){const n=scanBins[b];if(!n)continue;const ang=b*Math.PI/4,k=Math.min(1,n/4);
    ctx.strokeStyle=`rgba(${Math.round(160+95*k)},${Math.round(220-150*k)},90,${(0.35+0.5*k)*a})`;ctx.lineWidth=1+Math.round(k*2);ctx.beginPath();ctx.arc(px,py,26+Math.sin(T*6+b)*1.5,ang-0.33,ang+0.33);ctx.stroke();}}for(const w of wells){const x=w.x-camX,y=w.y-camY,r=10+Math.sin(T*10)*2;ctx.strokeStyle='rgba(168,138,240,0.8)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.stroke();ctx.fillStyle='rgba(20,10,40,0.8)';circ(x,y,4);}
  if(P.actMode==='sling'&&P.hotSel>=2){const px=P.x-camX,py=P.y-camY;if(P.slChg>0){const c=Math.min(1,P.slChg);ctx.strokeStyle=P.slFull?(Math.sin(T*30)>0?'#fff':'#e8dcb0'):'#d9a441';ctx.lineWidth=1;ctx.beginPath();ctx.arc(px,py,9,-Math.PI/2,-Math.PI/2+6.283*c);ctx.stroke();}
    if(P.actAim){ctx.strokeStyle='rgba(232,220,176,0.35)';ctx.beginPath();ctx.moveTo(px+Math.cos(P.ang)*8,py+Math.sin(P.ang)*8);ctx.lineTo(px+Math.cos(P.ang)*70,py+Math.sin(P.ang)*70);ctx.stroke();}}
  if(P.actMode==='psych'&&P.hotSel>=2&&P.actAim){const id=P.actbar[selQuick()];if(!id)return;const px=P.x-camX,py=P.y-camY,wx=mouse.sx,wy=mouse.sy,d=Math.hypot(wx-px,wy-py)||1,c=ACTS[id].col;ctx.strokeStyle=c;ctx.globalAlpha=0.6;ctx.lineWidth=1;ctx.beginPath();
    if(id==='push'){ctx.moveTo(px,py);ctx.arc(px,py,80,P.ang-0.65,P.ang+0.65);ctx.closePath();}
    else if(id==='calm'){ctx.arc(wx,wy,10,0,6.283);}
    else if(id==='orbit'){ctx.moveTo(px+17,py);ctx.arc(px,py,17,0,6.283);}
    else{const r=Math.min(110,d),x=px+(wx-px)/d*r,y=py+(wy-py)/d*r;ctx.moveTo(px,py);ctx.lineTo(x,y);const rr2=id==='well'?30:id==='hex'?40:id==='hold'?36:id==='orbit'?17:8;ctx.moveTo(x+rr2,y);ctx.arc(x,y,rr2,0,6.283);}
    ctx.stroke();ctx.globalAlpha=1;}}

const FILEBY={};for(const f of FILES)FILEBY[f.id]=f;
function hasFile(id){return player&&player.found&&player.found.includes(id);}
function upgUnlocked(k){if(!player||!player.files)return false;for(const f of FILES){const t=fileTier(f.id);for(let i=0;i<t;i++)if(f.tiers[i].upg===k)return true;}return false;}
function reqMet(f){return !f.req||fileTier(f.req.id)>=f.req.t;}
function gainTonic(k){const P=player;P.subBonus[k]=(P.subBonus[k]||0)+1;refreshStats();sfx('learn');say('the tonic burns going down. +1 '+SUBS[k].name.toLowerCase());}
function gainSigil(c){const P=player;P.coreBonus[c]=(P.coreBonus[c]||0)+1;refreshStats();sfx('hackwin');say('the sigil sinks into your skin. +1 '+CORES[c].name.toLowerCase());}
function gainFile(id){const P=player;if(!id||hasFile(id)){P.clear++;say('a duplicate crew file. worth 1 clearance');return;}P.found.push(id);sfx('learn');say('found a crew file: '+FILEBY[id].name.toLowerCase()+'. attune to it in Files (K)');}
function randomFileId(){const left=FILES.filter(f=>!hasFile(f.id)&&(f.kind!=='classified'||depth>=4&&Math.random()<0.35)).map(f=>f.id);return left.length?left[rnd(left.length)]:null;}
function unlearnFile(f){const P=player,t=fileTier(f.id);if(!t)return;let spent=0;for(let i=0;i<t;i++){const tr=f.tiers[i];spent+=tr.cost;
    if(tr.skill&&!FILES.some(g=>g!==f&&g.tiers.slice(0,fileTier(g.id)).some(q=>q.skill===tr.skill))){const j=P.skills.indexOf(tr.skill);if(j>=0){P.skills.splice(j,1);P.skillIdx=Math.min(P.skillIdx,P.skills.length-1);if(P.skillIdx2>=P.skills.length)P.skillIdx2=-1;}}
    if(tr.sact){P.slActs=P.slActs.filter(a=>!tr.sact.includes(a));P.slingbar=P.slingbar.map(a=>tr.sact.includes(a)?null:a);}if(tr.skill==='sling'&&P.actMode==='sling')P.actMode=false;
    if(tr.act){P.acts=P.acts.filter(a=>a!==tr.act);P.actbar=P.actbar.map(a=>a===tr.act?null:a);}
    if(tr.skill==='psych'&&!P.acts.length&&P.actMode==='psych')P.actMode=false;
    if(tr.move&&tr.move!=='sprint'){const j=P.moveSkills.indexOf(tr.move);if(j>=0){P.moveSkills.splice(j,1);P.moveIdx=0;}}}
  P.files[f.id]=0;P.clear+=Math.max(0,spent-1);refreshStats();return spent-1;}
function fileTier(id){return player&&player.files&&player.files[id]||0;}
function perk(k){if(!player||!player.files)return false;for(const f of FILES){const t=fileTier(f.id);for(let i=0;i<t;i++)if(f.tiers[i].perk===k)return true;}return false;}
function attuneFile(f){const P=player,t=fileTier(f.id);if(!hasFile(f.id))return;if(!reqMet(f)){say('needs '+FILEBY[f.req.id].name.toLowerCase()+' tier '+f.req.t+' first');sfx('click');return;}if(t>=f.tiers.length){say(f.name.toLowerCase()+' is fully attuned');sfx('click');return;}const tr=f.tiers[t];
  if(P.clear<tr.cost){say('not enough clearance ('+tr.cost+' needed)');sfx('deny');return;}P.clear-=tr.cost;P.files[f.id]=t+1;
  if(tr.skill&&!P.skills.includes(tr.skill)){P.skills.push(tr.skill);if(P.skillIdx<0||P.skills.length===1)P.skillIdx=P.skills.length-1;else if(P.skillIdx2<0)P.skillIdx2=P.skills.length-1;}
  if(tr.move&&!P.moveSkills.includes(tr.move))P.moveSkills.push(tr.move);
  if(tr.sact)for(const a of tr.sact)if(!P.slActs.includes(a)){P.slActs.push(a);const fr=P.slingbar.findIndex(q=>!q);if(fr>=0)P.slingbar[fr]=a;}
  if(tr.act&&!P.acts.includes(tr.act)){P.acts.push(tr.act);const fr=P.actbar.findIndex(q=>!q);if(fr>=0)P.actbar[fr]=tr.act;}
  refreshStats();sfx('learn');say(f.name.toLowerCase()+' file: tier '+(t+1));}
const SLOTS=[['shoulders',2,0],['head',0,0],['body',0,1],['hands',0,2],['legs',0,3],['feet',0,4],['back',1,0],['acc0',1,1],['acc1',1,2],['acc2',1,3],['acc3',1,4]];
const SLOTNAME={shoulders:'shoulders',head:'head',body:'body',hands:'hands',legs:'legs',feet:'feet',back:'back',acc:'accessory'};

