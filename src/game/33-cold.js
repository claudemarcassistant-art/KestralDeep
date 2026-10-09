// ---------- cold and frozen ----------
// The player freezes when st.frz reaches 100 (addStatus in 22-actions.js calls freezePlayer()). Creatures have their
// own cold meter e.frz, filled through chillEnemy() by cold risers and vents, freezeAround(), the Frost Matron's breath
// and cryo clouds. Frozen creatures skip their AI in the enemy loop (24-update.js) and only slide. Numbers: FREEZE_CFG.
let meleeHit=false;   // true while a melee attack (swing, shove, kick) is dealing its damage
function asMelee(fn){meleeHit=true;try{return fn();}finally{meleeHit=false;}}
function freezePlayer(){const p=player,C=FREEZE_CFG.player;p.st.frz=100;p.frozenT=C.dur;p.frozeMash=0;p.frozeFire=false;p.dazeT=Math.max(p.dazeT||0,C.dur);p.vx*=0.2;p.vy*=0.2;
  if(p.reloadT>0)p.arPos=null;float(p.x,p.y-6,'frozen solid','#cfe8ff');sfx('crackle');shake=Math.max(shake,2);
  for(let k=0;k<12;k++)parts.push({x:p.x+rr(-5,5),y:p.y+rr(-5,5),vx:rr(-30,30),vy:rr(-30,30),t:0.5,m:0.5,c:k%2?'#e8f6ff':'#9fd8ff',s:1});}
function thawPlayer(quiet){const p=player,C=FREEZE_CFG.player;p.frozenT=0;p.dazeT=0;p.st.frz=Math.min(p.st.frz,C.after);p.frzImm=C.imm;
  sfx('icecrack');for(let k=0;k<14;k++)parts.push({x:p.x+rr(-4,4),y:p.y+rr(-4,4),vx:rr(-60,60),vy:rr(-60,60),t:0.45,m:0.45,c:k%3?'#cfe8ff':'#ffffff',s:rnd(2)+1});
  if(!quiet)float(p.x,p.y-6,'the ice cracks','#cfe8ff');}
// called from updateStatus() every frame
function updatePlayerCold(dt){const p=player;if(p.frzImm>0)p.frzImm-=dt;if(!(p.frozenT>0))return;
  p.st.frz=100;if((p.st.brn||0)>=100){thawPlayer();return;}
  p.frozenT-=dt;p.dazeT=Math.max(p.dazeT,p.frozenT);if(Math.random()<dt*14)parts.push({x:p.x+rr(-5,5),y:p.y+rr(-5,4),vx:rr(-6,6),vy:rr(-14,-4),t:0.5,m:0.5,c:'#e8f6ff',s:1});
  if(p.frozenT<=0)thawPlayer();}
// a new press of a movement key while frozen cracks the ice a little
function frozenMash(){const p=player,C=FREEZE_CFG.player;if(!(p.frozenT>0)||(p.frozeMash||0)>=C.mashMax-1e-6)return;
  p.frozeMash=(p.frozeMash||0)+C.mash;p.frozenT-=C.mash;sfx('crackle');for(let k=0;k<3;k++)parts.push({x:p.x+rr(-5,5),y:p.y+rr(-5,5),vx:rr(-30,30),vy:rr(-30,30),t:0.3,m:0.3,c:'#e8f6ff',s:1});}
// the first fire hit while frozen cracks it sooner (addStatus 'brn')
function frozenFireHit(){const p=player;if(!(p.frozenT>0)||p.frozeFire)return;p.frozeFire=true;p.frozenT-=FREEZE_CFG.player.fireCut;sfx('hiss');}
// melee hits on a frozen player hurt more (hurtPlayer): a creature hitting from close range
function frozenMeleeMul(src){const p=player;if(!(p.frozenT>0)||!src||!enemies.includes(src))return 1;return Math.hypot(src.x-p.x,src.y-p.y)<=(src.r||4)+p.r+12?FREEZE_CFG.player.melee:1;}

// ---- creatures
function canFreeze(e){const b=ET[e.type];return !e.dead&&!b.ghost&&!b.drone&&!(e.caged&&!e.caged.open);}
function chillEnemy(e,a){if(!canFreeze(e)||e.frozenT>0||inEmber(e.x,e.y,e.r))return;if(e.burnT>0){e.burnT=Math.max(0,e.burnT-a*0.05);return;}
  e.frz=Math.min(100,(e.frz||0)+a);if(e.frz>=100){if(e.frzImm>0)e.frz=99;else freezeEnemy(e);}}
function freezeEnemy(e){const C=FREEZE_CFG.creature,boss=!!ET[e.type].warden;e.frz=100;e.frozenT=boss?C.boss:C.dur;e.vx*=0.3;e.vy*=0.3;e.dash=0;
  float(e.x,e.y-8,'frozen','#cfe8ff');sfx('crackle');for(let k=0;k<8;k++)parts.push({x:e.x+rr(-e.r,e.r),y:e.y+rr(-e.r,e.r),vx:rr(-25,25),vy:rr(-25,25),t:0.4,m:0.4,c:'#e8f6ff',s:1});}
function thawEnemy(e){const C=FREEZE_CFG.creature;e.frozenT=0;e.frz=C.after;e.frzImm=ET[e.type].warden?C.bossImm:C.imm;
  if(Math.hypot(e.x-player.x,e.y-player.y)<220)sfx('icecrack');for(let k=0;k<10;k++)parts.push({x:e.x+rr(-e.r,e.r),y:e.y+rr(-e.r,e.r),vx:rr(-50,50),vy:rr(-50,50),t:0.4,m:0.4,c:k%3?'#cfe8ff':'#ffffff',s:1});}
// the frozen branch of the enemy loop: no AI, it only slides from knockback. Returns true when the creature is frozen.
function enemyFrozen(e,dt){if(!(e.frozenT>0))return false;e.frozenT-=dt;if(e.burnT>0)e.frozenT=0;
  move(e,e.vx*dt,e.vy*dt);const f=Math.pow(kbFr(),dt);e.vx*=f;e.vy*=f;if(Math.random()<dt*6)parts.push({x:e.x+rr(-e.r,e.r),y:e.y+rr(-e.r,e.r),vx:0,vy:rr(-10,-3),t:0.4,m:0.4,c:'#e8f6ff',s:1});
  if(e.frozenT<=0)thawEnemy(e);return true;}
function updateEnemyCold(dt){const C=FREEZE_CFG.creature;for(const e of enemies){if(e.frzImm>0)e.frzImm-=dt;if(e.frz>0&&!(e.frozenT>0))e.frz=Math.max(0,e.frz-C.decay*dt);}}
// melee on a frozen creature (damageEnemy)
function frozenEnemyMul(e){return e.frozenT>0&&meleeHit?FREEZE_CFG.creature.melee:1;}

// ---- drawing: a pale blue ice shell over a frozen body
function drawIceShell(x,y,r){x=Math.round(x);y=Math.round(y);const R=r+2.5;ctx.fillStyle='rgba(190,225,255,0.45)';circ(x,y,R);
  ctx.strokeStyle='rgba(235,248,255,0.85)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,R,0,6.283);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-R*0.5,y-R*0.2);ctx.lineTo(x-R*0.1,y+R*0.1);ctx.lineTo(x+R*0.3,y-R*0.3);ctx.moveTo(x+R*0.1,y+R*0.5);ctx.lineTo(x+R*0.35,y+R*0.15);ctx.stroke();
  F('rgba(255,255,255,0.8)',x-R*0.45,y-R*0.6,2,1);}

// ---- cryo grenade: a freezing cloud ('cryo' in CLOUD) fed for FREEZE_CFG.cryo.t seconds; water under it turns to ice
function cryoCloudTick(c,dt){const C=FREEZE_CFG.cryo;
  for(const e of enemies){if(!canFreeze(e))continue;if(c.blobs.some(b=>{const [bx,by,br]=blobPos(c,b);return Math.hypot(e.x-bx,e.y-by)<br*0.9;}))chillEnemy(e,C.creature*dt*Math.max(0.6,c.dens));}}
function cryoEmitterTick(m,dt){const C=FREEZE_CFG.cryo;m.iceT=(m.iceT||0)-dt;if(m.iceT<=0){m.iceT=C.iceEvery;freezeAround(m.x,m.y,C.iceR);}}
