// ---------- traps ----------
// Pressure plates fire a spike, flame, dart or debris trap (TRAP_TYPES) when enough weight is on them. genTraps()
// places them during deck generation (inside the deck's seeded scope), updateTraps() runs them, drawTraps() draws
// plates, wires, wall nozzles, rubble, darts and falling-debris shadows on the floor layer. Some traps are wired to a
// trap control panel: an ordinary hack panel whose reward is 'traps' (see HACKR.traps and hackTry()).
let traps=[],darts=[],trapJets=[],falls=[],rubbleL=[];
let rubble=new Uint8Array(MW*MH);
const trapTile=t=>t.ty*MW+t.tx;
const tileIdx=o=>Math.floor(o.y/TS)*MW+Math.floor(o.x/TS);
// creatures that can set off a plate: walking ones (not flying, ghostly, rooted or caged)
function walker(e){const b=ET[e.type];return !e.dead&&!b.fly&&!b.ghost&&!b.plant&&!b.dummy&&!e.caged;}
// weight on a tile. The player and walking creatures weigh 3; a floating player weighs nothing.
// Dropped items weigh ITEM_WEIGHT (1, gear and weapons 2) and crates CRATE_CFG.weight (3).
function weightAt(tx,ty){const i=ty*MW+tx,p=player;let w=0;
  if(p&&!p.floating&&tileIdx(p)===i)w+=3;
  for(const e of enemies)if(walker(e)&&tileIdx(e)===i)w+=3;
  for(const it of items)if(!it.dead&&!(it.fall>0)&&tileIdx(it)===i)w+=itemWeight(it);
  for(const b of barrels)if(b.crate&&!b.dead&&b.tx===tx&&b.ty===ty)w+=CRATE_CFG.weight;
  return w;}
// a trap can fire unless its panel locked it down, or it needs power and the deck power is cut
function trapLive(t){return !t.off&&!(TRAP_TYPES[t.type].powered&&powerOff);}

// ---- generation
function mkTrap(tx,ty,type){const t={tx,ty,type,state:'armed',t:0,found:false,off:false,panel:null,spikeT:0,glint:0};
  if(type==='flame'||type==='dart'){const o=D4.filter(([dx,dy])=>solid(tx+dx,ty+dy)&&!solid(tx-dx,ty-dy));if(!o.length)return null;t.dir=o[rnd(o.length)];}
  if(type==='debris'){let best=[0,0],bn=-1;for(const [ox,oy] of [[0,0],[-1,0],[0,-1],[-1,-1]]){let n=0;for(let y=0;y<2;y++)for(let x=0;x<2;x++)if(!solid(tx+ox+x,ty+oy+y))n++;if(n>bn){bn=n;best=[ox,oy];}}t.area=best;}
  return t;}
// a wall spot for a trap panel within range of the plate, facing open floor that can see the plate
function trapPanelSpot(t){const R=TRAP_CFG.panelRange,c=[];
  for(let y=Math.max(1,t.ty-R);y<=Math.min(MH-3,t.ty+R);y++)for(let x=Math.max(1,t.tx-R);x<=Math.min(MW-2,t.tx+R);x++){const i=y*MW+x;
    if(map[i]!==1||solid(x,y+1)||map[i-1]!==1||map[i+1]!==1||(x===exitT.x&&y+1===exitT.y))continue;
    if(panels.some(q=>Math.abs(q.tx-x)+Math.abs(q.ty-y)<3)||vendors.some(v=>Math.abs(v.tx-x)+Math.abs(v.ty-y)<3)||risers.some(r=>Math.abs(r.tx-x)+Math.abs(r.ty-y)<2)||fixtures.some(f=>f.tx===x&&f.ty===y))continue;
    if(!hasLOS(x*TS+6,(y+1)*TS+6,t.tx*TS+6,t.ty*TS+6))continue;c.push([x,y]);}
  return c.length?c[rnd(c.length)]:null;}
function wireTrap(t){const R=TRAP_CFG.panelRange;
  let pn=panels.find(q=>q.reward==='traps'&&q.traps.length<3&&Math.max(Math.abs(q.tx-t.tx),Math.abs(q.ty-t.ty))<=R&&hasLOS(q.tx*TS+6,(q.ty+1)*TS+6,t.tx*TS+6,t.ty*TS+6));
  if(!pn){const s=trapPanelSpot(t);if(!s)return false;pn={tx:s[0],ty:s[1],hack:true,reward:'traps',state:'idle',ph:Math.random()*6,traps:[]};panels.push(pn);}
  pn.traps.push(t);t.panel=pn;return true;}
// place plates for this deck: mostly in corridors and doorways, never in the start room, the lift room or hidden rooms.
// levelMods.traps (test lift): 'off' = none, 'on' = at any depth and at least one of each type.
function genTraps(start,exitR){const C=TRAP_CFG,mode=levelMods.traps||'normal';
  if(mode==='off'||mode==='normal'&&depth<C.minDepth)return;
  const inR=(x,y,r,m)=>x>=r.x-m&&x<r.x+r.w+m&&y>=r.y-m&&y<r.y+r.h+m,special=[...vaults,...secrets,...ventRooms,...hatchRooms,...modules,...plateDoors.filter(p=>p.room).map(p=>p.room)],cor=[],rm=[];
  for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){const i=y*MW+x;
    if(map[i]!==0||liq[i]>=2||chasm[i]||molten[i]||hz[i]||kind[i]===3||kind[i]===4)continue;
    if(inR(x,y,start,2)||exitR&&inR(x,y,exitR,1)||Math.abs(x-exitT.x)+Math.abs(y-exitT.y)<4||special.some(r=>inR(x,y,r,0)))continue;
    if(plateDoors.some(p=>Math.abs(p.px-x)+Math.abs(p.py-y)<3||Math.abs(p.tx-x)+Math.abs(p.ty-y)<3))continue;
    (rooms.some(r=>inR(x,y,r,0))?rm:cor).push([x,y]);}
  const forced=mode==='on'?['spike','flame','dart','debris']:[],n=Math.max(forced.length,aN(C.perDeck[0]+rnd(C.perDeck[1]-C.perDeck[0]+1)));
  for(let k=0,tries=0;k<n&&tries<n*40;tries++){const L=Math.random()<C.corridorShare&&cor.length?cor:rm.length?rm:cor;if(!L.length)break;
    const [x,y]=L[rnd(L.length)];if(traps.some(t=>Math.abs(t.tx-x)+Math.abs(t.ty-y)<C.spacing))continue;
    let t=mkTrap(x,y,forced[k]||wpick(TRAP_WEIGHTS));if(!t){if(forced[k])continue;t=mkTrap(x,y,Math.random()<0.5?'spike':'debris');}
    traps.push(t);k++;}
  for(const t of traps)if(Math.random()<C.wired)wireTrap(t);
  if(mode==='on'&&!traps.some(t=>t.panel))for(const t of traps)if(wireTrap(t))break;}

// ---- running
function updateTraps(dt){const C=TRAP_CFG,p=player;
  for(const t of traps){if(t.spikeT>0)t.spikeT-=dt;if(t.glint>0)t.glint-=dt;
    if(t.state==='click'){t.t-=dt;if(t.t<=0){t.state='cool';t.t=C.rearm;if(trapLive(t))fireTrap(t);}continue;}
    if(t.state==='cool'){t.t-=dt;if(t.t<=0)t.state='armed';continue;}
    if(trapLive(t)&&weightAt(t.tx,t.ty)>=C.weight){t.state='click';t.t=C.click;t.found=true;sfx('plate');}}
  // sharp eyes: plates glint when you are close
  if(p&&!p.astral&&subPts('perc')>=C.glintPerc)for(const t of traps)if(!t.found&&seen[trapTile(t)]&&Math.hypot(t.tx*TS+6-p.x,t.ty*TS+6-p.y)<C.glintR){t.found=true;t.glint=1.5;float(t.tx*TS+6,t.ty*TS,'pressure plate','#e0a080');}
  // flame jets: the flamethrower's own flames, marked so they also burn the player (see updateFlames)
  for(const j of trapJets){const t=j.t;j.left-=dt;j.pHit-=dt;if(!trapLive(t)){j.left=0;continue;}const [dx,dy]=t.dir,ox=(t.tx+dx)*TS+6-dx*7,oy=(t.ty+dy)*TS+6-dy*7,a0=Math.atan2(-dy,-dx);
    for(j.acc+=dt;j.acc>0.03;j.acc-=0.03)for(let k=0;k<2;k++){const a=a0+rr(-0.16,0.16),sp=rr(104,126);flames.push({x:ox,y:oy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:0.42,m:0.42,hit:new Set(),trap:true,jet:j});}
    j.smoke+=dt;if(j.smoke>0.3){j.smoke=0;puff(ox-dx*18,oy-dy*18,'smoke',2,j);}}
  trapJets=trapJets.filter(j=>j.left>0);
  // darts
  {const D=TRAP_TYPES.dart;for(const d of darts){d.life-=dt;const nx=d.x+d.vx*dt,ny=d.y+d.vy*dt;if(solidAt(nx,ny)){d.life=0;parts.push({x:d.x,y:d.y,vx:rr(-20,20),vy:rr(-20,20),t:0.2,m:0.2,c:'#b8b09a',s:1});continue;}d.x=nx;d.y=ny;
    if(p&&Math.hypot(p.x-d.x,p.y-d.y)<p.r+2){d.life=0;hurtPlayer(D.dmg,false);addStatus('psn',D.psn);continue;}
    for(const e of enemies){if(e.dead||ET[e.type].ghost)continue;if(Math.hypot(e.x-d.x,e.y-d.y)<e.r+2){d.life=0;damageEnemy(e,D.dmg,d.vx,d.vy,30);e.tox=(e.tox||0)+D.tox;break;}}}
  darts=darts.filter(d=>d.life>0);}
  // falling debris
  {const B=TRAP_TYPES.debris;for(const f of falls){f.t-=dt;if(f.t>0){if(Math.random()<dt*12)parts.push({x:(f.x+rr(0,2))*TS,y:(f.y+rr(0,2))*TS,vx:rr(-5,5),vy:rr(5,25),t:0.4,m:0.4,c:'#8e8a7c',s:1});continue;}
    f.done=true;sfx('crumble');shake=Math.max(shake,4);noise((f.x+1)*TS,(f.y+1)*TS,120);
    for(let y=f.y;y<f.y+2;y++)for(let x=f.x;x<f.x+2;x++){if(solid(x,y))continue;const i=y*MW+x;rubble[i]=1;const r=rubbleL.find(q=>q.i===i);if(r)r.t=B.rubble;else rubbleL.push({i,t:B.rubble});
      for(let k=0;k<6;k++)parts.push({x:x*TS+rr(0,12),y:y*TS+rr(0,12),vx:rr(-40,40),vy:rr(-40,40),t:0.4,m:0.4,c:k%2?'#7a776c':'#a8a496',s:rnd(2)+1});}
    const under=o=>{const tx=Math.floor(o.x/TS),ty=Math.floor(o.y/TS);return tx>=f.x&&tx<f.x+2&&ty>=f.y&&ty<f.y+2;};
    if(p&&under(p)){hurtPlayer(B.dmg,false);p.dazeT=Math.max(p.dazeT||0,B.daze);float(p.x,p.y-8,'dazed','#d8d0b0');}
    for(const e of enemies)if(!e.dead&&!ET[e.type].ghost&&under(e)){damageEnemy(e,B.dmg,0,0,0);e.stun=Math.max(e.stun||0,B.dazeE);}}
  falls=falls.filter(f=>!f.done);}
  // rubble crumbles away
  for(const r of rubbleL){r.t-=dt;if(r.t<=0){rubble[r.i]=0;r.done=true;for(let k=0;k<4;k++)parts.push({x:(r.i%MW)*TS+rr(2,10),y:((r.i/MW)|0)*TS+rr(2,10),vx:rr(-10,10),vy:rr(-15,0),t:0.5,m:0.5,c:'#8e8a7c',s:1});}}
  rubbleL=rubbleL.filter(r=>!r.done);}
function fireTrap(t){const p=player,i=trapTile(t),cx=t.tx*TS+6,cy=t.ty*TS+6;t.found=true;
  if(t.type==='spike'){const S0=TRAP_TYPES.spike;t.spikeT=0.6;sfx('spikes');shake=Math.max(shake,2);
    for(let k=0;k<8;k++)parts.push({x:cx+rr(-4,4),y:cy+rr(-4,4),vx:rr(-15,15),vy:rr(-50,-10),t:0.25,m:0.25,c:'#d8dcd4',s:1});
    if(p&&!p.floating&&tileIdx(p)===i){hurtPlayer(S0.dmg,false);addStatus('stn',S0.stun);}
    for(const e of enemies)if(walker(e)&&tileIdx(e)===i){damageEnemy(e,S0.dmg,0,-1,40);e.stunB=(e.stunB||0)+S0.stunE;if(e.stunB>=100){e.stunB=0;e.stun=Math.max(e.stun||0,1.2);float(e.x,e.y-8,'reeling','#e8dcb0');}}}
  else if(t.type==='flame'){trapJets.push({t,left:TRAP_TYPES.flame.dur,acc:0,smoke:0,pHit:0});sfx('whoosh');noise(cx,cy,100);}
  else if(t.type==='dart'){const D=TRAP_TYPES.dart,[dx,dy]=t.dir,px=-dy,py=dx;
    for(let k=-1;k<=1;k++){const sx=(t.tx+dx+px*k)*TS+6-dx*7,sy=(t.ty+dy+py*k)*TS+6-dy*7;if(solidAt(sx,sy))continue;darts.push({x:sx,y:sy,vx:-dx*D.speed,vy:-dy*D.speed,life:0.7});}
    sfx('dart');}
  else if(t.type==='debris'){const B=TRAP_TYPES.debris;falls.push({x:t.tx+t.area[0],y:t.ty+t.area[1],t:B.delay,m:B.delay});sfx('rumble');}}
// sonar pulse and signal scanner
function revealTraps(x,y,r){let n=0;for(const t of traps)if(!t.found&&Math.hypot(t.tx*TS+6-x,t.ty*TS+6-y)<r){t.found=true;t.glint=1.5;n++;}return n;}
// trap control panels: a successful hack locks the wired plates down; a failed one sets them all off at once
function trapsLockDown(pn){for(const t of pn.traps)t.off=true;sfx('door');return (pn.traps.length>1?'the plates':'the plate')+' on this circuit lock down';}
function trapsSetOff(pn){for(const t of pn.traps)if(!t.off){t.found=true;if(trapLive(t))fireTrap(t);t.state='cool';t.t=TRAP_CFG.rearm;}alertAdd(8);say('the panel shorts and every plate on its circuit fires');}

// ---- drawing (floor layer, under the fog)
function drawTraps(){
  ctx.save();ctx.setLineDash([2,3]);ctx.lineWidth=1;
  for(const pn of panels){if(pn.reward!=='traps')continue;const ps=seen[pn.ty*MW+pn.tx];
    for(const t of pn.traps){if(!(ps||t.found))continue;ctx.strokeStyle=t.off||pn.state==='dead'?'rgba(120,120,110,0.25)':'rgba(224,96,64,0.4)';
      ctx.beginPath();ctx.moveTo(pn.tx*TS+6.5-camX,(pn.ty+1)*TS-camY);ctx.lineTo(t.tx*TS+6.5-camX,t.ty*TS+6.5-camY);ctx.stroke();}}
  ctx.restore();
  for(const r of rubbleL){const tx=r.i%MW,ty=(r.i/MW)|0,x=tx*TS-camX,y=ty*TS-camY;if(!seen[r.i]||x<-TS||y<-TS||x>W||y>H)continue;const h=hash(tx*31+7,ty*17+3);
    for(let k=0;k<5;k++){const sx=x+1+((h>>(k*3))&7),sy=y+1+((h>>(k*3+12))&7),s=2+((h>>(k+20))&1);F('#2a2924',sx,sy+1,s+1,s);F(k%2?'#7a776c':'#9a968a',sx,sy,s,s);}}
  for(const t of traps){const i=trapTile(t),x=t.tx*TS-camX,y=t.ty*TS-camY;if(x<-TS||y<-TS||x>W+TS||y>H+TS)continue;
    if(t.dir&&seen[(t.ty+t.dir[1])*MW+t.tx+t.dir[0]]){const [dx,dy]=t.dir,wx=x+6+dx*6,wy=y+6+dy*6;F(t.type==='flame'?'#3a2416':'#1c2220',wx-(dy?2:1),wy-(dx?2:1),dy?4:2,dx?4:2);}
    if(!seen[i])continue;const live=trapLive(t);
    F('rgba(214,218,204,0.07)',x+1,y+1,TS-2,TS-2);
    const rv=t.found?'rgba(225,200,160,0.6)':'rgba(190,195,180,0.22)';F(rv,x+2,y+2,1,1);F(rv,x+TS-3,y+2,1,1);F(rv,x+2,y+TS-3,1,1);F(rv,x+TS-3,y+TS-3,1,1);
    if(t.found){ctx.strokeStyle=live?'rgba(217,120,70,0.45)':'rgba(120,120,110,0.35)';ctx.lineWidth=1;ctx.strokeRect(x+1.5,y+1.5,TS-3,TS-3);}
    if(!live)F('rgba(0,0,0,0.35)',x+1,y+1,TS-2,TS-2);
    if(t.state==='click')F(`rgba(255,90,60,${0.25+0.25*Math.sin(T*40)})`,x+3,y+3,TS-6,TS-6);
    if(t.spikeT>0){const k=Math.min(1,t.spikeT/0.2);for(let s=0;s<4;s++){F('#2a2c28',x+2+s*2.5,y+3,1,6);F('#d8dcd4',x+2+s*2.5,y+3+Math.round(5*(1-k)),1,Math.max(1,Math.round(6*k)));}}
    if(t.glint>0&&Math.sin(T*12)>0)F('rgba(255,250,220,0.9)',x+2+Math.floor(T*16)%8,y+2,1,1);}
  for(const f of falls){const k=1-f.t/f.m,x=f.x*TS-camX,y=f.y*TS-camY;ctx.fillStyle=`rgba(0,0,0,${0.15+0.45*k})`;ctx.beginPath();ctx.ellipse(x+TS,y+TS,TS*(0.5+0.5*k),TS*(0.4+0.45*k),0,0,6.283);ctx.fill();}
  for(const d of darts){const a=Math.atan2(d.vy,d.vx),x=d.x-camX,y=d.y-camY;ctx.strokeStyle='#d8d0b0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-Math.cos(a)*3,y-Math.sin(a)*3);ctx.lineTo(x+Math.cos(a)*2,y+Math.sin(a)*2);ctx.stroke();}}
