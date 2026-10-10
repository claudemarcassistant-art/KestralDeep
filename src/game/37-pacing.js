// ---------- pacing: how long creatures hunt you, and arena waves ----------
// trackTick() runs for every creature in the enemy loop (24-update.js) right after its sight check. Numbers: TRACK_CFG
// and ARENA_WAVES (src/data/creatures.js).
function trackTick(e,b,los,d,dt){const C=TRACK_CFG;if(!e.alert){e.wasAlert=false;return;}
  if(b.warden||e.arena||b.guard&&secT>0)return;
  if(!e.wasAlert){e.wasAlert=true;if(!(e.huntT>0))e.huntT=e.drawn?C.wave:e.called?C.called:C.memory;}
  if(los&&d<C.see){e.huntT=Math.max(e.huntT,C.memory);return;}
  const f=flow&&flow[tileIdx(e)];e.huntT-=dt*(f==null||f<0||f>C.leash?C.leashDecay:1);
  if(e.huntT<=0){e.alert=false;e.wasAlert=false;e.huntT=0;e.wt=0;if(seen[tileIdx(e)]&&d<220)float(e.x,e.y-8,'?','#8e978b');}}
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
