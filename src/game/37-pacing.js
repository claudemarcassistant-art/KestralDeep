// ---------- pacing: how long creatures hunt you, and arena waves ----------
// trackTick() runs for every creature in the enemy loop (24-update.js) right after its sight check. Numbers: TRACK_CFG
// and ARENA_WAVES (src/data/creatures.js).
function trackTick(e,b,los,d,dt){const C=TRACK_CFG;if(!e.alert){e.wasAlert=false;return;}
  if(b.warden||e.arena||b.guard&&secT>0)return;
  if(!e.wasAlert){e.wasAlert=true;if(!(e.huntT>0))e.huntT=e.drawn?C.wave:e.called?C.called:C.memory;}
  if(los&&d<C.see){e.huntT=Math.max(e.huntT,C.memory);return;}
  const f=flow&&flow[tileIdx(e)];e.huntT-=dt*(f==null||f<0||f>C.leash?C.leashDecay:1)*(smokeBlocks(e.x,e.y,player.x,player.y)?SMOKE_BLIND.memMul:1);
  if(e.huntT<=0){e.alert=false;e.wasAlert=false;e.huntT=0;e.wt=0;if(seen[tileIdx(e)]&&d<220)float(e.x,e.y-8,'?','#8e978b');}}
// smoke: creatures cannot see the player through, into or out of a dense smoke cloud (SMOKE_BLIND)
function smokeBlocks(x0,y0,x1,y1){const C=SMOKE_BLIND,dx=x1-x0,dy=y1-y0,L2=dx*dx+dy*dy;if(L2<C.near*C.near)return false;
  for(const c of clouds){if(c.kind!=='smoke'||c.dens<C.dens)continue;const t=Math.max(0,Math.min(1,((c.x-x0)*dx+(c.y-y0)*dy)/L2)),qx=x0+dx*t-c.x,qy=y0+dy*t-c.y,R=c.r*C.core;if(qx*qx+qy*qy<R*R)return true;}return false;}
function seesPlayer(e){const p=player;return hasLOS(e.x,e.y,p.x,p.y)&&!smokeBlocks(e.x,e.y,p.x,p.y);}
// noise() helper: a creature's share of a noise's range (muffled through walls)
function noiseReach(e,x,y,rad){return hasLOS(e.x,e.y,x,y)?rad:rad*TRACK_CFG.throughWall;}

// ---- arena waves
let arenaW=null;   // {room,boss,left,t,done}
// called from enterLevel() on an arena deck: returns how many creatures to place now
// the boss is attached later (arenaW.boss, left=Infinity) once it is actually placed
function arenaStart(room,n,boss){const A=ARENA_WAVES;arenaW={room,boss:null,left:A.noBoss,t:A.firstDelay,done:false};return Math.max(A.minStart,Math.round(n*A.startShare));}
function arenaWaveSize(){const A=ARENA_WAVES;return Math.max(1,aN(A.size[0]+rnd(A.size[1]-A.size[0]+1)+Math.floor(depth*A.perDepth)));}
function updateArenaWaves(dt){const W=arenaW;if(!W||W.done||liftState!=='arena')return;
  if(W.boss&&W.boss.dead){W.done=true;say('the arena guardian is down. nothing more comes');return;}
  W.t-=dt;if(W.t>0)return;W.t=ARENA_WAVES.every;
  if(enemies.filter(e=>e.arena&&!e.dead).length+spawnQ.length>=Math.round(ARENA_WAVES.cap*AREA))return;
  const n=arenaWaveSize(),r=W.room,P=player;
  for(let k=0;k<n;k++){let tx=r.cx,ty=r.cy;for(let t=0;t<12;t++){const q=spotIn(r);if(q&&Math.hypot(q.x-P.x,q.y-P.y)>70){tx=Math.floor(q.x/TS);ty=Math.floor(q.y/TS);break;}}
    const before=spawnQ.length;queueSpawn({tx,ty});for(let i=before;i<spawnQ.length;i++)spawnQ[i].arena=true;}
  W.left--;sfx('alarm');say(W.boss?'more of them pour into the arena':W.left>0?'another wave pours into the arena':'the last wave pours into the arena');
  if(!W.boss&&W.left<=0)W.done=true;}

// ---- ghosts: velocity steering with low acceleration, so they drift, overshoot and loop rather than home in.
// States (e.gst): 'float' (wander toward you within GHOST_CFG.track), 'windup' (shiver in place), 'lunge' (straight
// through you), 'drift' (coasting on along the lunge, slowing), and fleeing while you look straight at one (e.fleeT).
function ghostMove(e,b,dx,dy,d,dt){const G=GHOST_CFG,p=player,cloak=p.cloakT>0;e.ph+=dt;e.fleeT=(e.fleeT||0)-dt;
  if(!e.gst){e.gst='float';e.gvx=0;e.gvy=0;e.wob=Math.random()*6.283;e.gt=0;}
  e.gt-=dt;e.wob+=(Math.random()-0.5)*G.wobbleRate*dt*6;
  const look=d<170&&!cloak&&Math.abs(angDiff(Math.atan2(e.y-p.y,e.x-p.x),p.ang))<0.45;
  if((look||perk('ward')&&d<70)&&e.fleeT<=0&&e.gst!=='lunge'){e.fleeT=1.3;e.gst='float';}
  let tx=0,ty=0,acc=G.accel;
  if(e.fleeT>0){tx=-dx/d*G.fleeSpd;ty=-dy/d*G.fleeSpd;acc=G.fleeAccel;}
  else if(e.gst==='windup'){tx=0;ty=0;acc=4;if(Math.random()<dt*20)parts.push({x:e.x+rr(-4,4),y:e.y+rr(-4,4),vx:0,vy:0,t:0.25,m:0.25,c:'#e8f4ff',s:1});
    if(e.gt<=0){const a=Math.atan2(p.y-e.y,p.x-e.x);e.gst='lunge';e.gt=G.lungeT;e.gvx=Math.cos(a)*G.lungeSpd;e.gvy=Math.sin(a)*G.lungeSpd;e.hitP=false;if(d<200)sfx('wail');}}
  else if(e.gst==='lunge'){tx=e.gvx;ty=e.gvy;acc=0;if(Math.random()<0.7)parts.push({x:e.x,y:e.y,vx:-e.gvx*0.1,vy:-e.gvy*0.1,t:0.35,m:0.35,c:'rgba(216,232,240,0.6)',s:2});
    if(e.gt<=0){e.gst='drift';e.gt=G.driftT;const sp=Math.hypot(e.gvx,e.gvy)||1;e.gvx=e.gvx/sp*G.driftSpd;e.gvy=e.gvy/sp*G.driftSpd;e.cd=G.cd;}}
  else if(e.gst==='drift'){const k=Math.pow(G.driftDecay,dt);e.gvx*=k;e.gvy*=k;tx=e.gvx;ty=e.gvy;acc=0;if(e.gt<=0)e.gst='float';}
  else{const sv=1+G.speedVar*Math.sin(e.ph*1.7+e.wob)*Math.sin(e.ph*0.6);
    if(!cloak&&d<G.track){const a=Math.atan2(dy,dx)+Math.sin(e.wob)*G.wobble;tx=Math.cos(a)*G.spd*sv;ty=Math.sin(a)*G.spd*sv;
      if(d<G.lungeR&&e.cd<=0){e.gst='windup';e.gt=G.windup;}}
    else{tx=Math.cos(e.wob)*G.spd*0.5*sv;ty=Math.sin(e.wob)*G.spd*0.5*sv;}}
  if(acc>0){const k=Math.min(1,dt*acc);e.gvx+=(tx-e.gvx)*k;e.gvy+=(ty-e.gvy)*k;}
  e.x=Math.max(TS,Math.min((MW-1)*TS,e.x+e.gvx*dt));e.y=Math.max(TS,Math.min((MH-1)*TS,e.y+e.gvy*dt));
  if(e.gst==='lunge'&&!e.hitP&&Math.hypot(p.x-e.x,p.y-e.y)<e.r+p.r+3){e.hitP=true;
    if(perk('ward')){e.fleeT=1.5;float(p.x,p.y-6,'warded','#c8b8ff');}else{hurtPlayer(b.dmg,true);addStatus('rad',25);float(p.x,p.y-6,'chill','#d8e8f0');}}}
