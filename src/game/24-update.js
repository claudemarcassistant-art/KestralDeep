// ---------- update ----------
function pulseZone(e){const set=new Set(),tx=Math.floor(e.x/TS),ty=Math.floor(e.y/TS),i0=ty*MW+tx;if(liq[i0]<1)return set;
  const q=[[i0,0]];set.add(i0);for(let h=0;h<q.length;h++){const [i,d]=q[h];if(d>=6)continue;const x=i%MW,y=(i/MW)|0;
    for(const [dx,dy] of D4){const nx=x+dx,ny=y+dy;if(solid(nx,ny))continue;const n=ny*MW+nx;if(liq[n]>=1&&!set.has(n)){set.add(n);q.push([n,d+1]);}}}return set;}
let ghostOK=false;
function enemyHit(e,x,y,bb){if(ET[e.type].ghost&&!(bb&&bb.rad))return false;if(e.st==='sub'&&ET[e.type].aquatic)return false;if(Math.hypot(e.x-x,e.y-y)<e.r+1)return true;if(e.seg)for(let i=1;i<e.seg.length;i++){const q=e.seg[i];if(Math.hypot(q.x-x,q.y-y)<2.8)return true;}return false;}
function freeEnemy(e){const tx=Math.floor(e.x/TS),ty=Math.floor(e.y/TS);let best=null,bd=1e9;for(let r=0;r<=4&&!best;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=tx+dx,y=ty+dy;if(x<1||y<1||x>=MW-1||y>=MH-1)continue;const cx=x*TS+6,cy=y*TS+6;if(blocked(cx,cy,e.r,false,e))continue;const d=Math.hypot(cx-e.x,cy-e.y);if(d<bd){bd=d;best=[cx,cy];}}if(best){e.x=best[0];e.y=best[1];e.vx=0;e.vy=0;}}
function flowStep(e){
  const tx=Math.floor(e.x/TS),ty=Math.floor(e.y/TS);let best=flow[ty*MW+tx];if(best<0)return null;let bx=tx,by=ty;
  for(const [dx,dy] of D8){const nx=tx+dx,ny=ty+dy;if(solid(nx,ny))continue;if(dx&&dy&&(solid(tx+dx,ty)||solid(tx,ty+dy)))continue;
    const v=flow[ny*MW+nx];if(v>=0&&v<best){best=v;bx=nx;by=ny;}}
  return {x:bx*TS+TS/2,y:by*TS+TS/2};
}
function nearFlare(e){let best=null,bd=160;for(const f of flares){if(f.glow)continue;const d=Math.hypot(f.x-e.x,f.y-e.y);if(d<bd&&hasLOS(e.x,e.y,f.x,f.y)){bd=d;best=f;}}return best;}
function bounceMove(o,dt,fr){
  const f=Math.pow(fr,dt);o.vx*=f;o.vy*=f;
  const nx=o.x+o.vx*dt;if(solidAt(nx,o.y))o.vx*=-0.5;else o.x=nx;
  const ny=o.y+o.vy*dt;if(solidAt(o.x,ny))o.vy*=-0.5;else o.y=ny;
}
function updatePlay(dt){
  const p=player;
  let ix=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0),iy=(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0);if(menuOpen){ix=0;iy=0;}
  p.peek=!!K.KeyV&&!menuOpen&&!p.astral;if(p.peek){ix=0;iy=0;}
  if(p.astral){updateAstral(dt,ix,iy);ix=0;iy=0;mouse.l=false;mouse.r=false;}
  const il=Math.hypot(ix,iy);if(il){ix/=il;iy/=il;}
  p.ang=Math.atan2(mouse.sy+camY-p.y,mouse.sx+camX-p.x);
  if(p.hotSel>=hotCount())setHot(hotCount()-1);const _qs=p.hotSel>=2;
  const _set=p.arms[p.armSet],_gun=_set.off&&ARM[_set.off].gun?_set.off:null;p.weapon=_qs?null:_gun;
  p.aiming=!_qs&&!!_gun&&mouse.r&&liqAt(p.x,p.y)!==4;p.blocking=!_qs&&!_gun&&_set.off!=='tank'&&mouse.r&&liqAt(p.x,p.y)!==4&&!(p.dazeT>0);
  if(_qs&&!(p.dazeT>0)){if(p.actMode==='sling'){slingInput(dt);}else if(p.actMode){p.actAim=mouse.r;if(mouse.l&&!p.lPrev)castAct();}else{p.actAim=false;if(mouse.l&&!p.lPrev)quickPrimary();if(mouse.r&&!p.rPrev)quickSecondary();}}else p.actAim=false;p.lPrev=mouse.l;p.rPrev=mouse.r;p.adrenT-=dt;if(p.cloakT>0){p.cloakT-=dt;if(p.cloakT<=0){p.cloakT=0;float(p.x,p.y-6,'visible','#9fc3ff');sfx('cloak');}}p.stimT-=dt;p.dashT-=dt;p.dashCd-=dt;p.iframeT-=dt;p.stamDelay-=dt;
  const shift=K.ShiftLeft||K.ShiftRight,maxSt=maxStam(),pti=Math.floor(p.y/TS)*MW+Math.floor(p.x/TS);
  if(p.postDash>0)p.postDash-=dt;
  p.floating=hasMove('float')&&((shift&&!menuOpen&&!(p.dashT>0))||!!chasm[pti]);
  if(p.dashT>0&&Math.random()<0.8)parts.push({x:p.x+rr(-2,2),y:p.y+rr(-2,2),vx:-p.vx*0.1,vy:-p.vy*0.1,t:0.25,m:0.25,c:'#e8dcb0',s:1});
  p.sprinting=!p.floating&&hasMove('sprint')&&shift&&!menuOpen&&il>0&&!p.aiming&&!p.blocking&&!p.stamLock&&p.stam>0&&liqAt(p.x,p.y)!==4;
  p.creeping=hasMove('creep')&&!p.sprinting&&!p.floating;
  if(p.floating){if(p.stam>0){p.stam=Math.max(0,p.stam-floatCost()*dt);p.stamDelay=0.6;}else{p.floatHp=(p.floatHp||0)+dt;if(p.floatHp>=0.25){p.floatHp-=0.25;if(p.hp>2)hurtPlayer(1.2,true);if(Math.random()<0.3)say('floating is tearing at you');}}
    if(Math.random()<dt*10)parts.push({x:p.x+rr(-4,4),y:p.y+5,vx:rr(-6,6),vy:rr(4,10),t:0.35,m:0.35,c:'#b8a8e8',s:1});}
  const base=70*(1+S.spd)*(p.adrenT>0?1.4:1)*(p.stimT>0?1.1:1);
  const pl=p.floating?0:liqAt(p.x,p.y);p.liq=pl;
  {const wi=Math.floor(p.y/TS)*MW+Math.floor(p.x/TS);if(webs[wi]&&!p.floating){p.inWeb=wi;}else if(p.inWeb!=null&&p.inWeb!==wi){if(webs[p.inWeb]){tearWeb(p.inWeb);say('you tear through the web');}p.inWeb=null;}}
  let mv=base*(p.slChg>0.12?0.8:1)*(p.chg>0.12&&p.arms[p.armSet].main==='bow'?0.75:1)*(webs[Math.floor(p.y/TS)*MW+Math.floor(p.x/TS)]&&!p.floating?0.4:1)*(rubble[Math.floor(p.y/TS)*MW+Math.floor(p.x/TS)]&&!p.floating?TRAP_CFG.rubbleSlow:1)*(p.chg>0.12?0.75:1)*(p.floating?1.2:p.sprinting?(1.55+0.08*U('sprint')):p.creeping?0.9:1)*(p.grabbedBy?0.35:1)*(p.tackleT>0?1.3:1)*(p.blocking?(_set.off==='shield'?0.8:0.6):1)*LIQ[pl]*(!p.floating&&hz[Math.floor(p.y/TS)*MW+Math.floor(p.x/TS)]===2?0.7:1)*((p.shockT||0)>0?0.35:1)*(1-0.55*((p.st&&p.st.stk)||0)/100)*(1-0.5*((p.st&&p.st.frz)||0)/100);
  if(p.aiming&&il&&p.adrenT<=0){const dot=ix*Math.cos(p.ang)+iy*Math.sin(p.ang);if(dot<0)mv*=1+dot*0.55*(1-S.backpedal);}
  p.moveMul=p.sprinting?1:mv/base;
  if(p.sprinting){p.stam-=28*dt;p.stamDelay=0.7;if(p.stam<=0){p.stam=0;p.stamLock=true;}
    p.stepT-=dt;if(p.stepT<=0){p.stepT=0.3;noise(p.x,p.y,70);parts.push({x:p.x+rr(-2,2),y:p.y+4,vx:-p.vx*0.2,vy:-p.vy*0.2,t:0.4,m:0.4,c:'#3a403d',s:2});}}
  else if(p.stamDelay<=0)p.stam=Math.min(maxSt,p.stam+22*(1+S.stamina*0.5)*(p.stimT>0?2:1)*dt);
  if(p.stamLock&&p.stam>=30)p.stamLock=false;
  if(pl===4){if(il>0||Math.hypot(p.vx,p.vy)>6){p.stam=Math.max(0,p.stam-14*dt);p.stamDelay=0.5;}
    if(p.stam<=0){mv*=0.6;p.drownT=(p.drownT||0)+dt;if(p.drownT>=0.3){p.drownT-=0.3;hurtPlayer(1.5,true);if(Math.random()<.5)say('out of breath. get to shallower water');}}
    if(Math.random()<dt*2)parts.push({x:p.x+rr(-3,3),y:p.y-2,vx:0,vy:-8,t:0.4,m:0.4,c:'#8fc3cf',s:1});}
  let accelT=0.16/Math.max(0.3,1+S.accel+0.15*U('foot')+(p.stimT>0?0.6:0)+(p.adrenT>0?1:0));
  if(p.sprinting)accelT*=1.5;
  accelT*=1+((p.st&&p.st.slk)||0)/100*4;
  {const ii=Math.floor(p.y/TS)*MW+Math.floor(p.x/TS);if(ice[ii]&&!(p.dashT>0)&&!p.floating)accelT*=4;}
  if(p.floating&&!(p.postDash>0))accelT*=4;if(lowGrav()&&!(p.postDash>0))accelT*=3;
  if(p.dazeT>0){const f=Math.pow(0.05,dt);p.vx*=f;p.vy*=f;}
  else if(p.dashT<=0){const k=1-Math.exp(-3*dt/accelT);p.vx+=(ix*mv-p.vx)*k;p.vy+=(iy*mv-p.vy)*k;}
  else if(Math.random()<0.8)parts.push({x:p.x,y:p.y,vx:0,vy:0,t:0.25,m:0.25,c:'#8b8468',s:2});
  if(pl>=2&&Math.hypot(p.vx,p.vy)>15){p.sloshT-=dt;if(p.sloshT<=0){p.sloshT=0.45;noise(p.x,p.y,(pl===3?85:60)*(p.creeping?0.5:1));sfx('slosh');
    for(let k=0;k<4;k++)parts.push({x:p.x+rr(-3,3),y:p.y+3,vx:rr(-20,20),vy:rr(-25,-5),t:0.35,m:0.35,c:'#8fc3cf',s:1});}}
  p.kbT=(p.kbT||0)-dt;p.tackleT=(p.tackleT||0)-dt;
  const ox=p.x,oy=p.y;move(p,p.vx*dt,p.vy*dt);
  if(p.kbT>0){const sp=Math.hypot(p.vx,p.vy);if(sp>130){const bx=Math.abs(p.vx)>90&&Math.abs(p.x-ox)<Math.abs(p.vx*dt)*0.5,by=Math.abs(p.vy)>90&&Math.abs(p.y-oy)<Math.abs(p.vy*dt)*0.5;
    if(bx||by){const dmg=Math.min(10,(sp-100)/30);p.kbT=0;hurtPlayer(dmg,true);addStatus('stn',dmg*4);shake=Math.max(shake,4);sfx('thud');float(p.x,p.y-8,'slam','#ff9a7a');
      for(let k=0;k<8;k++)parts.push({x:p.x+Math.sign(p.vx)*4,y:p.y+Math.sign(p.vy)*4,vx:rr(-40,40),vy:rr(-40,40),t:0.35,m:0.35,c:'#8e978b',s:1});if(bx)p.vx*=-0.2;if(by)p.vy*=-0.2;}}}
  {const tx=Math.floor(p.x/TS),ty=Math.floor(p.y/TS),i=ty*MW+tx;if(map[i]===4){map[i]=0;openVent[i]=1;paintArea(tx,ty);flowT=0;sfx('vent');
    for(const v of ventRooms)if(v.ex===tx&&v.ey===ty){if(!v.open&&lvl)lvl.secrets++;v.open=true;v.known=true;}say('the grille gives. a crawlspace behind the wall');}}
  if(Math.abs(p.x-ox)<Math.abs(p.vx*dt)*0.5)p.vx*=0.5;
  if(Math.abs(p.y-oy)<Math.abs(p.vy*dt)*0.5)p.vy*=0.5;
  if(lvl)lvl.t+=dt;
  {const tx=Math.floor(p.x/TS),ty=Math.floor(p.y/TS),dr=rooms.find(r=>r.dark&&tx>=r.x&&tx<r.x+r.w&&ty>=r.y&&ty<r.y+r.h)||null;if(dr&&!dr.warned){dr.warned=true;say('the lights are out in this room');}p.darkRoom=!!dr;}
  p.sat=Math.max(0,(p.sat||0)-dt/6);p.vomitCd=(p.vomitCd||0)-dt;
  {const mm=modAt(p.x,p.y);if(mm&&!mm.entered){mm.entered=true;say('a '+MODS[mm.type].name+(mm.type==='bathroom'?'. lock the door to hide':''));}}
  p.cd-=dt;p.shoveCd-=dt;p.shoveT-=dt;p.hurtT-=dt;p.flashT-=dt;p.emptyT-=dt;
  for(const k in p.skillCd)p.skillCd[k]=Math.max(0,p.skillCd[k]-dt);
  if(p.regenT>0){p.regenT-=dt;p.regenAcc+=2*dt;if(Math.random()<dt*3)parts.push({x:p.x+rr(-4,4),y:p.y,vx:0,vy:-12,t:0.5,m:0.5,c:'#7fd08e',s:1});}
  if(p.regenT>0&&!S.regen){while(p.regenAcc>=1){p.regenAcc--;if(p.hp<maxHp())p.hp=Math.min(maxHp(),p.hp+1);}}
  if(S.regen){p.regenAcc+=S.regen*dt;while(p.regenAcc>=1){p.regenAcc--;if(p.hp<maxHp())p.hp=Math.min(maxHp(),p.hp+1);}}
  if(S.pinger&&markSecretsNear(p.x,p.y,70))say('your pinger clicks. a hollow wall nearby');
  sonarT-=dt;sonarRing+=dt;
  updateHazards(dt);updateHazards2(dt);updateObjective(dt);updateWaves(dt);updateAlert(dt);updateActs(dt);updateBarrels(dt);updateMines(dt);updateReload(dt);updateSoaks(dt);if(p.slCd>0)p.slCd-=dt;if(p.actMode!=='sling'&&p.slChg>0){p.slChg=0;p.slFull=false;}updateMolten(dt);updateTraps(dt);updatePlateDoors(dt);updateLoose(dt);updateSpace(dt);updateAlarm(dt);checkAch(dt);updateFlames(dt);updateNades(dt);updateClouds(dt);if(p.jabT>0)p.jabT-=dt;if(p.combo>0){p.comboIdle=(p.comboIdle||0)+dt;if(p.comboIdle>1.8){p.combo=Math.max(0,p.combo-dt*(perk('secondnature')?0.85:1.7));if(p.combo<=0)p.comboShield=false;}}if(p.lashT>0)p.lashT-=dt;if(p.sledgeCd>0)p.sledgeCd-=dt;if(p.blinkCd>0)p.blinkCd-=dt;if(p.scanCd>0)p.scanCd-=dt;if(scanT>0)scanT-=dt;updateStatus(dt);
  if(p.weapon==='ray'){if(p.aiming&&mouse.l&&!(p.dazeT>0)){if(p.reloadT>0){}else if(!p.charge&&magLeft('ray')<=0){useMag('ray');}else p.charge=Math.min(1.2,(p.charge||0)+dt);}
    else if(p.aiming&&(p.charge||0)>0.08){fireRay(p.charge);p.charge=0;}else p.charge=0;}
  else if(p.weapon&&p.aiming&&mouse.l&&p.cd<=0&&!(p.dazeT>0))fire();
  p.mcd=(p.mcd||0)-dt;p.swingT=(p.swingT||0)-dt;
  if(_set.off==='tank'&&!_qs&&mouse.r&&!p.tankR&&!menuOpen)drinkTank();p.tankR=mouse.r&&_set.off==='tank';
  if(_set.main==='soaker'&&!_qs&&!menuOpen&&mouse.l&&!(p.dazeT>0)&&p.liq!==4){if(_set.off==='tank')soakSpray(dt);else if(p.mcd<=0){primaryAttack(ARM.soaker.melee);if(p.emptyT<=0){say('the soaker needs a liquid tank in the off hand');p.emptyT=2;}}}
  const chargeable=CHARGE.includes(_set.main)&&_set.main!=='soaker';
  if(chargeable&&!_qs&&!p.aiming&&!(p.dazeT>0)&&p.liq!==4&&!menuOpen){
    if(mouse.l){if(p.mcd<=0){if(!(p.chg>0))p.chg=0.001;p.chg+=dt/0.9;if(p.chg>=1){if(!(p.chgFull>0))sfx('hackok');p.chgFull=(p.chgFull||0)+dt;}}}
    else if(p.chg>0){releaseCharge(_set.main);}}
  else{if(p.chg>0){p.chg=0;p.chgFull=0;}
    if(_set.main!=='soaker'&&!_qs&&mouse.l&&!p.aiming&&p.mcd<=0&&!(p.dazeT>0)&&p.liq!==4)primaryAttack(_set.main?(_set.main==='chainsaw'?sawMelee():ARM[_set.main].melee):FIST);}
  {const gm=_set.off==='shield'?80:40;p.guardMax=gm;p.guardDelay=(p.guardDelay||0)-dt;if(p.guard>gm)p.guard=gm;if(p.guardDelay<=0)p.guard=Math.min(gm,(p.guard||0)+20*dt);
   const wm=S.shield||0;p.wardDelay=(p.wardDelay||0)-dt;if(p.ward>wm)p.ward=wm;if(p.wardDelay<=0)p.ward=Math.min(wm,(p.ward||0)+12*dt);}
  for(const it of items){if(it.dead||it.fall)continue;if(it.pop>0||it.noPick>0)continue;if(Math.hypot(it.x-p.x,it.y-p.y)<9){
    switch(it.type){
      case 'medkit':{if(p.hp>=maxHp()){p.inv.medkit=(p.inv.medkit||0)+1;float(it.x,it.y,'medkit stored','#7fd08e');break;}const a=Math.round((it.amt||IT.medkit.amt())*(1+0.2*U('medic'))*(perk('fielddress')?1.5:1));p.hp=Math.min(maxHp(),p.hp+a);float(it.x,it.y,'+'+a+' hp','#7fd08e');break;}
      case 'gear':float(it.x,it.y,GEAR[it.gear].name.toLowerCase(),'#e8c070');gainGear(it.gear);break;
      case 'chip':float(it.x,it.y,'training chip','#9fe0b0');learnSkill();break;
      case 'schematic':float(it.x,it.y,'schematic','#9fc3e0');revealSchematic();revealNextRoutes();say('station schematic. map and lift routes filled in');break;
      case 'routechart':{float(it.x,it.y,'route chart','#7fd08e');let n=0;for(let k=0;k<3;k++)n+=revealFar();revealNear(1);say(n?'a lift route chart: '+n+' more junctions marked on your route map':'a lift route chart. you already know this sector');sfx('learn');break;}
      case 'herb':{if(p.hp>=maxHp())continue;const a=Math.round(15*(1+0.2*U('medic')));p.hp=Math.min(maxHp(),p.hp+a);float(it.x,it.y,'+'+a+' hp','#7fd08e');break;}
      case 'flask':gainFlask();float(it.x,it.y,'flask','#c9cfc2');break;
      case 'tonic':gainTonic(it.sub);float(it.x,it.y,SUBS[it.sub].name.toLowerCase()+' tonic',CORES[SUBS[it.sub].core].col);break;
      case 'sigil':gainSigil(it.core);float(it.x,it.y,CORES[it.core].name.toLowerCase()+' sigil',CORES[it.core].col);break;
      case 'tool':giveTool(it.tool);float(it.x,it.y,TOOLS[it.tool].name.toLowerCase(),'#c9cfc2');break;
      case 'knives':p.inv.knives+=it.amt||1;if(!p.has.knives)gainArm('knives');float(it.x,it.y,'+'+(it.amt||1)+' knife','#c8ccc4');break;
      case 'file':gainFile(hasFile(it.file)?randomFileId()||it.file:it.file);float(it.x,it.y,'crew file','#c9a8ff');break;
      case 'raw':p.raw[it.raw]=(p.raw[it.raw]||0)+1+(perk('forager')?1:0);float(it.x,it.y,RAW[it.raw].name.toLowerCase(),RAW[it.raw].col);if(it.raw==='spores'&&!S.poisonRes){addStatus('psn',15);say('the spores puff in your face');}break;
      case 'food':p.food[it.food]=(p.food[it.food]||0)+1;float(it.x,it.y,FOOD[it.food].name.toLowerCase(),'#e8c070');break;
      case 'emetic':p.inv.emetic=(p.inv.emetic||0)+1;float(it.x,it.y,'emetic syrup','#b8c060');break;
      case 'liftcard':liftCard=true;float(it.x,it.y,'lift keycard','#ffd070');if(liftState==='locked'){liftState=(cond&&cond.obj==='both')?'idle':'open';say(liftState==='idle'?'keycard in hand. the lift can be called now':'keycard in hand. the lift is unlocked');}break;
      case 'weapon':{const nm=ARM[it.w].name;gainArm(it.w);if(WPN[it.w])player.inv[WPN[it.w].ammo]+=10;float(it.x,it.y,nm.toLowerCase(),'#e8c070');break;}
      case 'secretmap':float(it.x,it.y,'scrawled map','#e0c89f');revealSecrets();say(secrets.length?'a scrawled map marks hidden rooms':'the scrawl marks nothing on this level');break;
      default:{let a=it.amt||IT[it.type].amt();if(IT[it.type].ammo)a=Math.round(a*(1+S.ammoBonus+0.1*U('scav')));p.inv[it.type]+=a;float(it.x,it.y,'+'+a+' '+IT[it.type].label,'#e8dcb0');}
    }
    it.dead=true;sfx('pick');if(lvl){if(it.type==='gear'||it.type==='chip'||it.type==='weapon')lvl.finds++;else lvl.items++;}}}
  items=items.filter(i=>!i.dead);
  for(const it of items){if(!it.fx){fixLoot(it);it.fx=1;}if(it.pop>0)it.pop-=dt;if(it.noPick>0)it.noPick-=dt;
    const ci=Math.floor(it.y/TS)*MW+Math.floor(it.x/TS);if(!it.fall&&chasm[ci]){it.fall=0.7;it.fallM=0.7;sfx('fall');}
    if(it.fall>0){it.fall-=dt;if(it.fall<=0)it.dead=true;continue;}
    if(perk('tether')&&!(it.noPick>0)&&!(it.pop>0)){const dx=p.x-it.x,dy=p.y-it.y,d=Math.hypot(dx,dy);if(d<95&&d>3){const sp=(60+(95-d)*1.6)*dt,nx=it.x+dx/d*sp,ny=it.y+dy/d*sp;if(!solidAt(nx,ny)){it.x=nx;it.y=ny;}if(Math.random()<dt*6)parts.push({x:it.x,y:it.y,vx:0,vy:0,t:0.3,m:0.3,c:'#a88af0',s:1});}}}
  items=items.filter(it=>!it.dead);
  updateFlasks(dt);
  {const onEx=Math.floor(p.x/TS)===exitT.x&&Math.floor(p.y/TS)===exitT.y;
    if(testMode&&!testDeck&&!arcadeMode){if(onEx){if(!p.liftCfgLock){p.liftCfgLock=true;deckUI={sel:0};mouse.l=false;mouse.r=false;sfx('map');}return;}else p.liftCfgLock=false;}}
  if(arcadeMode&&Math.floor(p.x/TS)===exitT.x&&Math.floor(p.y/TS)===exitT.y){state='title';arcadeMode=false;return;}
  if(freightT&&Math.floor(p.x/TS)===freightT.x&&Math.floor(p.y/TS)===freightT.y){pendingSkip=2+rnd(2);say('the freight lift drops like a stone');finishLevel();return;}
  if(Math.floor(p.x/TS)===exitT.x&&Math.floor(p.y/TS)===exitT.y){
    if(liftState==='open'||liftState==='ready'){finishLevel();return;}
    if(liftMsgT<=0){liftMsgT=3;say(liftState==='arena'?'the lift is sealed until every creature here is dead ('+arenaFoes().length+' left)':liftState==='locked'?'the lift is locked out. find the lift keycard':liftState==='idle'?'R to call the lift. it will take a while, and it is loud':'the lift is still on its way');}}

  flowTick();

  for(const e of enemies){
    const b=ET[e.type];e.flash=Math.max(0,e.flash-dt);e.cd-=dt;e.ph+=dt*6;
    if(e.caged&&!e.caged.open)continue;
    if(!b.ghost&&!b.plant&&!b.aquatic&&!b.dummy&&!e.boss&&!e.caged&&!e.seg){if(blocked(e.x,e.y,Math.max(1,e.r-1),false,e)){e.stuckT=(e.stuckT||0)+dt;if(e.stuckT>0.25){e.stuckT=0;freeEnemy(e);}}else e.stuckT=0;}
    if(e.stun>0){e.stun-=dt;continue;}
    if(e.holdT>0){e.holdT-=dt;move(e,e.vx*dt,e.vy*dt);const hf=Math.pow(kbFr(),dt);e.vx*=hf;e.vy*=hf;continue;}
    if(e.foeT>0&&e.foe&&!e.foe.dead&&!b.plant&&!b.guard&&b.spd>0){e.foeT-=dt;const fo=e.foe,fd=Math.hypot(fo.x-e.x,fo.y-e.y)||1;
      if(fd>e.r+fo.r+2)move(e,(fo.x-e.x)/fd*b.spd*dt,(fo.y-e.y)/fd*b.spd*dt);else if(e.cd<=0){e.cd=b.atk||1;damageEnemy(fo,Math.max(2,(b.dmg||6)*0.7),fo.x-e.x,fo.y-e.y,60);}
      e.cd-=dt;move(e,e.vx*dt,e.vy*dt);const ff2=Math.pow(kbFr(),dt);e.vx*=ff2;e.vy*=ff2;continue;}
    if(e.friendT>0){e.friendT-=dt;let tg=null,td=160;for(const o of enemies){if(o===e||o.dead||o.friendT>0||ET[o.type].dummy||ET[o.type].ghost||ET[o.type].plant)continue;const d=Math.hypot(o.x-e.x,o.y-e.y);if(d<td&&hasLOS(e.x,e.y,o.x,o.y)){td=d;tg=o;}}
      if(tg){const d=td||1;if(d>e.r+tg.r+2)move(e,(tg.x-e.x)/d*b.spd*dt,(tg.y-e.y)/d*b.spd*dt);else if(e.cd<=0){e.cd=b.atk||1;damageEnemy(tg,Math.max(2,(b.dmg||6)*0.6),tg.x-e.x,tg.y-e.y,60);}}
      move(e,e.vx*dt,e.vy*dt);const ff=Math.pow(kbFr(),dt);e.vx*=ff;e.vy*=ff;if(e.friendT<=0){e.alert=true;float(e.x,e.y-8,'snaps out of it','#ff8a7a');}continue;}
    if(b.dummy){move(e,e.vx*dt,e.vy*dt);const f0=Math.pow(kbFr(),dt);e.vx*=f0;e.vy*=f0;e.x+=(e.hx-e.x)*Math.min(1,dt*5);e.y+=(e.hy-e.y)*Math.min(1,dt*5);continue;}
    const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;
    const los=d<180&&hasLOS(e.x,e.y,p.x,p.y);
    if(p.cloakT>0&&!b.dummy)e.alert=false;
    if(!e.alert&&los&&d<(p.creeping?45:130)&&!(p.cloakT>0))e.alert=true;
    if(b.snake){e.wig=(e.wig||0)+dt*9;e.retreat=(e.retreat||0)-dt;e.jukeT=(e.jukeT||0)-dt;let tx=0,ty=0,mx=0,my=0;
      if(e.alert){if(los&&d<140){tx=dx/d;ty=dy/d;}else{const tg=flowStep(e);if(tg){const gx=tg.x-e.x,gy=tg.y-e.y,gl=Math.hypot(gx,gy)||1;if(gl>0.5){tx=gx/gl;ty=gy/gl;}}}
        if(e.retreat>0){tx=-tx;ty=-ty;}
        const side=Math.sin(e.wig)*0.9;mx=tx-ty*side;my=ty+tx*side;
        if(p.aiming&&d<130&&e.jukeT<=0&&Math.abs(angDiff(Math.atan2(-dy,-dx),p.ang))<0.25){e.jukeT=0.9;e.vx+=-dy/d*e.sd*160;e.vy+=dx/d*e.sd*160;e.sd*=-1;}
        if(Math.random()<dt*0.6)e.retreat=Math.max(e.retreat,0.35);
        if(d<e.r+p.r+3&&e.cd<=0&&e.retreat<=0){e.cd=b.atk;hurtPlayer(b.dmg,false,e);if(b.pulse)addStatus('shk',15);else addStatus('psn',25);e.retreat=0.7;}}
      else{e.wt-=dt;if(e.wt<=0){e.wt=rr(0.6,1.6);const a=Math.random()*6.283;e.wx=Math.cos(a);e.wy=Math.sin(a);}mx=e.wx;my=e.wy;}
      const ml=Math.hypot(mx,my)||1,lq=liqAt(e.x,e.y);let sp=e.spd*(lq>=2?b.swim:b.land)*(e.alert?1:0.4)*(hz[Math.floor(e.y/TS)*MW+Math.floor(e.x/TS)]===2?0.7:1);
      move(e,(mx/ml*sp+e.vx)*dt,(my/ml*sp+e.vy)*dt);const f=Math.pow(kbFr(),dt);e.vx*=f;e.vy*=f;
      if(b.pulse){e.pt=(e.pt==null?rr(1,3):e.pt)-dt;e.pulseT=(e.pulseT||0)-dt;
        if(e.pt<=0){e.pt=rr(2.6,3.6);e.pulseT=0.3;e.pz=pulseZone(e);lights.push({x:e.x,y:e.y,r:40,t:0.2,m:0.2,c:'150,200,255'});if(d<150)sfx('arc');
          const pi=Math.floor(p.y/TS)*MW+Math.floor(p.x/TS);if(d<24||e.pz.has(pi)){hurtPlayer(4*(p.st.wet>30?1.3:1),true);addStatus('shk',40);p.shockT=0.45;shake=Math.max(shake,3);sfx('zap');}}}
      let px=e.x,py=e.y;for(const sgm of e.seg){const gx=sgm.x-px,gy=sgm.y-py,gl=Math.hypot(gx,gy);if(gl>3){sgm.x=px+gx/gl*3;sgm.y=py+gy/gl*3;}px=sgm.x;py=sgm.y;}
      continue;}
    if(b.warden){const B=BOSSES[e.boss||0];const ff=Math.pow(kbFr(),dt);e.cd=(e.cd==null?1:e.cd)-dt;e.sp=(e.sp==null?4:e.sp)-dt;e.ph=(e.ph||0)+dt*4;
      if(e.dash>0){e.dash-=dt;move(e,e.dvx*dt,e.dvy*dt);if(d<e.r+p.r+2&&!(e.hitP>0)){e.hitP=0.5;hurtPlayer(b.dmg,false,e);player.vx+=e.dvx*0.6;player.vy+=e.dvy*0.6;player.kbT=0.4;}if(e.hitP>0)e.hitP-=dt;
        for(const o of enemies)if(o!==e&&!o.dead&&Math.hypot(o.x-e.x,o.y-e.y)<o.r+e.r)damageEnemy(o,6,o.x-e.x,o.y-e.y,250);continue;}
      move(e,e.vx*dt,e.vy*dt);e.vx*=ff;e.vy*=ff;
      const los=hasLOS(e.x,e.y,p.x,p.y);if(los&&d>e.r+8)move(e,dx/d*b.spd*dt,dy/d*b.spd*dt);else if(!los){const st=flowStep(e);if(st){const sx=st.x-e.x,sy=st.y-e.y,sd=Math.hypot(sx,sy)||1;move(e,sx/sd*b.spd*dt,sy/sd*b.spd*dt);}}
      if(d<e.r+p.r+4&&e.cd<=0){e.cd=b.atk;hurtPlayer(b.dmg,false,e);sfx('thud');}
      if(e.sp<=0&&los&&d<160){e.sp=rr(4.5,6.5);sfx('alarm');
        if(B.move==='charge'){e.dash=0.6;e.dvx=dx/d*270;e.dvy=dy/d*270;}
        else if(B.move==='slam'){shake=Math.max(shake,8);for(let k=0;k<24;k++){const a=k/24*6.283;parts.push({x:e.x,y:e.y,vx:Math.cos(a)*160,vy:Math.sin(a)*160,t:0.4,m:0.4,c:'#8e978b',s:2});}
          if(d<70){hurtPlayer(10,false,e);player.vx+=dx/d*260;player.vy+=dy/d*260;player.kbT=0.5;}for(const o of enemies)if(o!==e&&!o.dead&&Math.hypot(o.x-e.x,o.y-e.y)<70)damageEnemy(o,8,o.x-e.x,o.y-e.y,300);}
        else if(B.move==='throw'){for(const o of [-0.3,0,0.3]){const a=Math.atan2(dy,dx)+o;bullets.push({x:e.x,y:e.y,vx:Math.cos(a)*150,vy:Math.sin(a)*150,life:1.6,dmg:8,p:false,src:e,slug:true,big:true});}}
        else if(B.move==='breath'){for(let k=0;k<30;k++){const a=Math.atan2(dy,dx)+rr(-0.5,0.5),v=rr(60,140);parts.push({x:e.x,y:e.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0.6,m:0.6,c:'#cfe8ff',s:2});}
          let da=Math.atan2(dy,dx)-Math.atan2(dy,dx);if(d<95){addStatus('frz',45);hurtPlayer(6,false,e);}}
        else if(B.move==='grab'){if(d<90){e.pull=1.2;hurtPlayer(6,false,e);say('a tentacle wraps around you');}puff(e.x,e.y,'smoke',24);}
        else if(B.move==='pulse'){for(let k=0;k<20;k++){const a=k/20*6.283;parts.push({x:e.x+Math.cos(a)*30,y:e.y+Math.sin(a)*30,vx:Math.cos(a)*90,vy:Math.sin(a)*90,t:0.4,m:0.4,c:'#9fe0ff',s:1});}
          if(d<80){addStatus('shk',45);hurtPlayer(6,false,e);}for(const o of enemies)if(o!==e&&!o.dead&&Math.hypot(o.x-e.x,o.y-e.y)<80)damageEnemy(o,6,0,0,0,true);}}
      if(e.pull>0){e.pull-=dt;move(p,-dx/d*95*dt,-dy/d*95*dt);}
      continue;}
    if(b.wasp){e.wing=(e.wing||0)+dt*40;const ff=Math.pow(0.05,dt);
      if(e.st==='dash'){e.dt2-=dt;move(e,e.vx*dt,e.vy*dt);
        if(!e.hit&&Math.hypot(p.x-e.x,p.y-e.y)<p.r+e.r+1){e.hit=true;hurtPlayer(b.dmg,false,e);addStatus('psn',12,e);}
        for(const o of enemies){if(o===e||o.dead||ET[o.type].wasp||ET[o.type].ghost||e.hitO)continue;if(Math.hypot(o.x-e.x,o.y-e.y)<o.r+e.r){e.hitO=true;damageEnemy(o,b.dmg,e.vx,e.vy,40);}}
        if(e.dt2<=0||blocked(e.x+e.vx*0.02,e.y+e.vy*0.02,e.r,false,e)){e.st='idle';e.stun=1;e.daze=1;e.vx*=0.2;e.vy*=0.2;}continue;}
      if(e.daze>0)e.daze-=dt;e.vx*=ff;e.vy*=ff;move(e,e.vx*dt,e.vy*dt);
      if(!e.alert&&d<120&&hasLOS(e.x,e.y,p.x,p.y))e.alert=true;
      if(e.st==='wind'){e.wt-=dt;e.x+=rr(-0.6,0.6);if(e.wt<=0){e.st='dash';e.dt2=0.28;e.hit=false;e.hitO=false;const a=Math.atan2(p.y-e.y,p.x-e.x);e.vx=Math.cos(a)*270;e.vy=Math.sin(a)*270;}continue;}
      e.cd=(e.cd==null?rr(1,2.5):e.cd)-dt;
      if(e.alert){const want=e.hp<ET.wasp.hp*0.5?110:66;e.orb=(e.orb||Math.random()*6.283)+dt*(0.8+(e.ph%1));const tx=p.x+Math.cos(e.orb)*want,ty=p.y+Math.sin(e.orb)*want,ddx=tx-e.x,ddy=ty-e.y,dd=Math.hypot(ddx,ddy)||1;
        move(e,ddx/dd*Math.min(b.spd,dd*3)*dt+rr(-12,12)*dt,ddy/dd*Math.min(b.spd,dd*3)*dt+rr(-12,12)*dt);
        if(e.cd<=0&&d<95&&hasLOS(e.x,e.y,p.x,p.y)&&!enemies.some(o=>o!==e&&o.st==='wind'&&ET[o.type].wasp&&Math.hypot(o.x-e.x,o.y-e.y)<40)){e.cd=b.atk*rr(0.9,1.5);e.st='wind';e.wt=0.35;sfx('buzz');}}
      else{e.wan=(e.wan||0)-dt;if(e.wan<=0){e.wan=rr(0.6,1.4);e.wa=Math.random()*6.283;}move(e,Math.cos(e.wa)*b.spd*0.3*dt,Math.sin(e.wa)*b.spd*0.3*dt);}
      continue;}
    if(b.guard){const ff=Math.pow(kbFr(),dt);move(e,e.vx*dt,e.vy*dt);e.vx*=ff;e.vy*=ff;e.cd=(e.cd==null?1:e.cd)-dt;e.walk=(e.walk||0);if(e.look==null)e.look=Math.random()*6.283;
      const inCone=(tx,ty,range)=>{const ddx=tx-e.x,ddy=ty-e.y,dd=Math.hypot(ddx,ddy);if(dd>range)return false;let da=Math.atan2(ddy,ddx)-e.look;da=Math.atan2(Math.sin(da),Math.cos(da));return (Math.abs(da)<0.55||dd<22)&&hasLOS(e.x,e.y,tx,ty);};
      const seeP=!(p.cloakT>0)&&(e.alert?d<190&&hasLOS(e.x,e.y,p.x,p.y):inCone(p.x,p.y,150));if(seeP)e.alert=true;
      let tgt=null;if(seeP)tgt=p;else{let bd=150;for(const o of enemies){if(o===e||o.dead)continue;const ob=ET[o.type];if(ob.guard||ob.dummy||ob.ghost||ob.plant)continue;const od=Math.hypot(o.x-e.x,o.y-e.y);if(od<bd&&inCone(o.x,o.y,150)){bd=od;tgt=o;}}if(!tgt&&e.foeC&&!e.foeC.dead&&hasLOS(e.x,e.y,e.foeC.x,e.foeC.y))tgt=e.foeC;}
      if(tgt&&tgt!==p)e.foeC=tgt;
      if(tgt){const tx=tgt.x-e.x,ty=tgt.y-e.y,td=Math.hypot(tx,ty)||1,wa=Math.atan2(ty,tx);let da=wa-e.look;da=Math.atan2(Math.sin(da),Math.cos(da));e.look+=da*Math.min(1,dt*6);
        const want=td>110?1:td<55?-1:0;if(want){move(e,tx/td*b.spd*dt*want,ty/td*b.spd*dt*want);e.walk+=dt*6;}
        if(e.cd<=0){e.cd=b.atk*rr(0.9,1.25);sfx('shot');const aa=wa+rr(-0.06,0.06);bullets.push({x:e.x,y:e.y,vx:Math.cos(aa)*170,vy:Math.sin(aa)*170,life:1.4,dmg:b.dmg,p:false,src:e,slug:true});noise(e.x,e.y,120);}}
      else if(e.alert){const st=flowStep(e);if(st){const sx=st.x-e.x,sy=st.y-e.y,sd=Math.hypot(sx,sy)||1;move(e,sx/sd*b.spd*dt,sy/sd*b.spd*dt);e.walk+=dt*6;let da=Math.atan2(sy,sx)-e.look;da=Math.atan2(Math.sin(da),Math.cos(da));e.look+=da*Math.min(1,dt*4);}}
      else{e.patT=(e.patT||0)-dt;if(e.patT<=0){e.patT=rr(2,4);e.patA=e.look+rr(-1.6,1.6);}let da=e.patA-e.look;da=Math.atan2(Math.sin(da),Math.cos(da));e.look+=da*Math.min(1,dt*2);if(Math.random()<0.5){const nx=Math.cos(e.look),ny=Math.sin(e.look);if(!blocked(e.x+nx*8,e.y+ny*8,e.r,false,e)){move(e,nx*b.spd*0.5*dt,ny*b.spd*0.5*dt);e.walk+=dt*3;}else e.patT=0;}}
      if(!e.called&&!e.radioed){if(seeP){e.seeT=(e.seeT||0)+dt;if(e.seeT>1&&!(e.radT>0)){e.radT=1;sfx('radio');}if(e.seeT>=3.2){e.radioed=true;raiseAlarm(e.x,e.y,2+rnd(2),'backup');}}else e.seeT=Math.max(0,(e.seeT||0)-dt*0.6);}
      continue;}
    if(b.pod){e.cd=(e.cd==null?rr(0.5,2):e.cd)-dt;e.puff=(e.puff||0)-dt;const aimA=Math.atan2(dy,dx);let da=aimA-e.face;da=Math.atan2(Math.sin(da),Math.cos(da));
      if(d<130&&Math.abs(da)<1.3&&hasLOS(e.x,e.y,p.x,p.y)){e.alert=true;if(e.cd<=0){e.cd=b.atk*rr(0.9,1.2);e.puff=0.25;sfx('glob');for(const o of [-0.25,0,0.25]){const a=aimA+o;bullets.push({x:e.x,y:e.y,vx:Math.cos(a)*135,vy:Math.sin(a)*135,life:1.3,dmg:b.dmg,p:false,src:e,seed:true});}}}continue;}
    if(b.trip){const ca=Math.cos(e.face),sa=Math.sin(e.face);
      if(e.hold>0){e.hold-=dt;const tx=e.x+ca*8,ty=e.y+sa*8,ddx=tx-p.x,ddy=ty-p.y,dd=Math.hypot(ddx,ddy)||1;if(dd>6)move(p,ddx/dd*85*dt,ddy/dd*85*dt);e.hurtAcc=(e.hurtAcc||0)+dt;if(e.hurtAcc>=0.5){e.hurtAcc=0;hurtPlayer(b.dmg,true);}
        e.tl=Math.max(8,Math.min(e.len,dd+6));if(p.dashT>0||p.iframeT>0.25||e.hold<=0||(e.hp<e.holdHp-3)){e.hold=0;e.regrow=4;e.tl=0;p.tripped=null;say('the vine lets go');sfx('whoosh');}continue;}
      if(e.regrow>0){e.regrow-=dt;e.tl=Math.min(e.len,e.len*(1-e.regrow/4));continue;}e.tl=e.len;
      if(!p.tripped&&!p.floating&&segDist(p.x,p.y,e.x,e.y,e.x+ca*e.tl,e.y+sa*e.tl)<p.r+1.5){e.hold=3;e.holdHp=e.hp;p.tripped=e;e.alert=true;say('a vine snaps tight around your leg');sfx('thud');shake=Math.max(shake,3);}
      continue;}
    if(b.spider){e.cd=(e.cd||0)-dt;e.webT=(e.webT==null?rr(4,8):e.webT)-dt;e.leg=(e.leg||0)+dt*(Math.hypot(e.vx||0,e.vy||0)>2?10:2);
      if(!e.alert&&d<140&&hasLOS(e.x,e.y,p.x,p.y))e.alert=true;
      const ff=Math.pow(0.02,dt);e.vx*=ff;e.vy*=ff;move(e,e.vx*dt,e.vy*dt);
      if(e.alert){const want=d>95?1:d<60?-1:0;if(want){move(e,dx/d*b.spd*dt*want,dy/d*b.spd*dt*want);e.leg+=dt*8;}
        if(e.cd<=0&&d<150&&hasLOS(e.x,e.y,p.x,p.y)){e.cd=b.atk*rr(0.9,1.2);sfx('glob');bullets.push({x:e.x,y:e.y,vx:dx/d*120,vy:dy/d*120,life:1.6,dmg:b.dmg,p:false,src:e,web:true});}
        if(e.webT<=0&&d<130){e.webT=rr(9,13);const ang=Math.atan2(dy,dx),fx=e.x+dx*0.55,fy=e.y+dy*0.55;if(layWeb(fx,fy,ang,1+rnd(4))){sfx('whoosh');for(let k=0;k<8;k++){const t0=k/8;parts.push({x:e.x+(fx-e.x)*t0,y:e.y+(fy-e.y)*t0,vx:0,vy:0,t:0.4,m:0.4,c:'#d8dcd4',s:1});}}}}
      continue;}
    if(b.frog){e.st=e.st||'idle';e.hopT=(e.hopT==null?rr(0.3,1):e.hopT)-dt;e.crT=(e.crT==null?rr(1,4):e.crT)-dt;const inW=liqAt(e.x,e.y)>=2;
      if(e.crT<=0){e.crT=rr(3,6);if(Math.hypot(dx,dy)<260){sfx('croak');noise(e.x,e.y,120);}e.sac=0.4;}if(e.sac>0)e.sac-=dt;
      const ff=Math.pow(inW?0.05:0.004,dt);e.vx*=ff;e.vy*=ff;move(e,e.vx*dt,e.vy*dt);
      if(!e.alert&&d<130&&hasLOS(e.x,e.y,p.x,p.y))e.alert=true;
      if(e.st==='wind'){e.wt-=dt;if(e.wt<=0){e.st='lash';e.lt=0.3;e.hitDone=false;sfx('whoosh');}continue;}
      if(e.st==='lash'){e.lt-=dt;const ext=Math.sin((1-e.lt/0.3)*Math.PI);e.tongue=ext*36;
        if(!e.hitDone&&ext>0.85){e.hitDone=true;const ca=Math.cos(e.dir),sa=Math.sin(e.dir),tx=e.x+ca*36,ty=e.y+sa*36;
          if(segDist(p.x,p.y,e.x,e.y,tx,ty)<p.r+2.5){hurtPlayer(b.dmg,false,e);addStatus('stn',22,e);}
          for(const o of enemies){if(o===e||o.dead||ET[o.type].ghost)continue;if(segDist(o.x,o.y,e.x,e.y,tx,ty)<o.r+1.5)damageEnemy(o,b.dmg*0.7,ca,sa,90);}}
        if(e.lt<=0){e.st='idle';e.cd=b.atk;e.tongue=0;}continue;}
      e.cd-=dt;
      if(e.alert&&d<40&&e.cd<=0&&hasLOS(e.x,e.y,p.x,p.y)){e.st='wind';e.wt=0.32;e.dir=Math.atan2(dy,dx);continue;}
      if(e.hopT<=0){e.hopT=rr(0.6,1.1)*(inW?0.6:1);let a=e.alert?Math.atan2(dy,dx)+rr(-0.5,0.5):Math.random()*6.283;if(e.alert&&d<28)a+=Math.PI;const sp=rr(140,190)*(inW?1.15:1);e.vx=Math.cos(a)*sp;e.vy=Math.sin(a)*sp;e.hop=0.22;}
      if(e.hop>0)e.hop-=dt;continue;}
    if(b.charger){e.st=e.st||'walk';
      if(e.st==='stun'){e.stT-=dt;const f=Math.pow(kbFr(),dt);e.vx*=f;e.vy*=f;move(e,e.vx*dt,e.vy*dt);if(e.stT<=0)e.st='walk';continue;}
      if(e.st==='wind'){e.stT-=dt;if(e.stT>0.25)e.dir=Math.atan2(dy,dx);if(Math.random()<0.5)parts.push({x:e.x-Math.cos(e.dir)*5,y:e.y+4,vx:rr(-15,15),vy:rr(-10,0),t:0.3,m:0.3,c:'#5a5048',s:1});
        if(e.stT<=0){e.st='charge';e.cv=0;e.hitP=false;e.hitSet=new Set();}continue;}
      if(e.st==='charge'){const cap=200*LIQ[liqAt(e.x,e.y)];e.cv=Math.min(cap,e.cv+240*dt);const vx=Math.cos(e.dir)*e.cv,vy=Math.sin(e.dir)*e.cv,ox=e.x,oy=e.y;
        move(e,vx*dt,vy*dt);if(Math.random()<0.7)parts.push({x:e.x-Math.cos(e.dir)*6,y:e.y+3,vx:-vx*0.1+rr(-10,10),vy:-vy*0.1+rr(-10,10),t:0.4,m:0.4,c:'#4a4440',s:2});
        if(!e.hitP&&Math.hypot(p.x-e.x,p.y-e.y)<e.r+p.r+2){e.hitP=true;hurtPlayer(10+e.cv*0.05,false,e);addStatus('stn',40,e);p.vx+=Math.cos(e.dir)*240;p.vy+=Math.sin(e.dir)*240;p.kbT=0.5;shake=Math.max(shake,6);}
        for(const o of enemies){if(o===e||o.dead||e.hitSet.has(o)||ET[o.type].dummy)continue;if(Math.hypot(o.x-e.x,o.y-e.y)<e.r+o.r+1){e.hitSet.add(o);damageEnemy(o,4,Math.cos(e.dir),Math.sin(e.dir),260);}}
        let stop=false;for(const bb of barrels)if(!bb.dead&&Math.hypot(bb.x-e.x,bb.y-e.y)<e.r+6){hitBarrel(bb,99);stop=true;}
        const moved=Math.hypot(e.x-ox,e.y-oy);
        if(stop||(e.cv>40&&moved<Math.hypot(vx,vy)*dt*0.5)){e.st='stun';e.stT=1.4;e.cd=1.2;e.vx=e.vy=0;shake=Math.max(shake,Math.hypot(e.x-p.x,e.y-p.y)<160?3:0);sfx('thud');
          for(let k=0;k<10;k++)parts.push({x:e.x+Math.cos(e.dir)*6,y:e.y+Math.sin(e.dir)*6,vx:rr(-50,50),vy:rr(-50,50),t:0.5,m:0.5,c:'#8e978b',s:1});}
        continue;}
      let mx=0,my=0;
      if(e.alert){if(los&&d<170&&e.cd<=0){e.st='wind';e.stT=0.75;e.dir=Math.atan2(dy,dx);if(d<200)sfx('snort');continue;}
        const tg=flowStep(e);if(tg){const gx=tg.x-e.x,gy=tg.y-e.y,gl=Math.hypot(gx,gy)||1;if(gl>0.5){mx=gx/gl;my=gy/gl;}}}
      else{e.wt-=dt;if(e.wt<=0){e.wt=rr(1,3);const a=Math.random()*6.283,go=Math.random()<.5;e.wx=go?Math.cos(a):0;e.wy=go?Math.sin(a):0;}mx=e.wx;my=e.wy;}
      const sp=e.spd*LIQ[liqAt(e.x,e.y)]*(e.alert?1:0.5);move(e,(mx*sp+e.vx)*dt,(my*sp+e.vy)*dt);const f=Math.pow(kbFr(),dt);e.vx*=f;e.vy*=f;continue;}
    if(b.ghost){e.dashT=(e.dashT||0)-dt;e.fleeT=(e.fleeT||0)-dt;e.ph+=dt;
      const look=d<170&&!(p.cloakT>0)&&Math.abs(angDiff(Math.atan2(e.y-p.y,e.x-p.x),p.ang))<0.45;
      if((look||perk('ward')&&d<70)&&e.fleeT<=0&&e.dashT<=0){e.fleeT=1.3;}
      let vx=0,vy=0;
      if(e.fleeT>0){vx=-dx/d*150;vy=-dy/d*150;}
      else if(e.dashT>0){vx=e.dvx;vy=e.dvy;}
      else if(d<55&&e.cd<=0&&!(p.cloakT>0)){e.dashT=0.45;e.dvx=dx/d*200;e.dvy=dy/d*200;e.cd=2.6;e.hitP=false;if(d<200)sfx('wail');}
      else if(!(p.cloakT>0)){vx=dx/d*b.spd-dy/d*Math.sin(e.ph*2)*20;vy=dy/d*b.spd+dx/d*Math.sin(e.ph*2)*20;}
      e.x=Math.max(TS,Math.min((MW-1)*TS,e.x+vx*dt));e.y=Math.max(TS,Math.min((MH-1)*TS,e.y+vy*dt));
      if(e.dashT>0&&!e.hitP&&Math.hypot(p.x-e.x,p.y-e.y)<e.r+p.r+3&&perk('ward')){e.hitP=true;e.fleeT=1.5;float(p.x,p.y-6,'warded','#c8b8ff');}
      if(e.dashT>0&&!e.hitP&&Math.hypot(p.x-e.x,p.y-e.y)<e.r+p.r+3){e.hitP=true;hurtPlayer(b.dmg,true);addStatus('rad',25);float(p.x,p.y-6,'chill','#d8e8f0');}
      continue;}
    if(b.grasper){e.st=e.st||'sub';e.stT=(e.stT||0)-dt;e.bcd=(e.bcd||0)-dt;e.tip=e.tip||{x:e.x,y:e.y};let mx=0,my=0,sp=e.spd;
      if(e.st==='sub'){e.tip.x=e.x;e.tip.y=e.y;
        if(d<80&&e.cd<=0&&los){e.st='aim';e.stT=0.6;sfx('slosh');}
        else if(d<160){mx=dx/d;my=dy/d;sp*=0.7;}
        else{e.wt-=dt;if(e.wt<=0){e.wt=rr(1,2.5);const a=Math.random()*6.283;e.wx=Math.cos(a);e.wy=Math.sin(a);}mx=e.wx;my=e.wy;sp*=0.35;}}
      else if(e.st==='aim'){if(Math.random()<0.4)parts.push({x:e.x+rr(-5,5),y:e.y+rr(-3,3),vx:rr(-12,12),vy:rr(-20,-5),t:0.3,m:0.3,c:'#bfe0e8',s:1});
        if(e.stT<=0){e.st='lash';e.ldx=dx/d;e.ldy=dy/d;e.tip.x=e.x;e.tip.y=e.y;e.tHp=3;sfx('whoosh');}}
      else if(e.st==='lash'){const ls=b.plant?150:260;e.tip.x+=e.ldx*ls*dt;e.tip.y+=e.ldy*ls*dt;
        if(Math.hypot(e.tip.x-p.x,e.tip.y-p.y)<p.r+4&&!(p.dashT>0)&&!(p.cloakT>0)){e.st='hold';e.stT=4;p.grabbedBy=e;say('a tentacle wraps around you. shoot it, shove it or dash free');sfx('hurt');shake=Math.max(shake,3);}
        else if(Math.hypot(e.tip.x-e.x,e.tip.y-e.y)>(b.plant?72:88)||solidAt(e.tip.x,e.tip.y))e.st='retract';}
      else if(e.st==='hold'){if(p.grabbedBy!==e){e.st='retract';}
        else{e.tip.x=p.x;e.tip.y=p.y;const gx=e.x-p.x,gy=e.y-p.y,gl=Math.hypot(gx,gy)||1;if(gl>e.r+p.r+2)move(p,gx/gl*(b.plant?30:48)*dt,gy/gl*(b.plant?30:48)*dt);
          if(gl<e.r+p.r+5&&e.bcd<=0){e.bcd=1;hurtPlayer(b.dmg,false,e);if(b.biteP)addStatus('psn',b.biteP);}
          if(e.stT<=0){e.st='retract';p.grabbedBy=null;}}}
      else if(e.st==='retract'){const gx=e.x-e.tip.x,gy=e.y-e.tip.y,gl=Math.hypot(gx,gy);if(gl<6){e.st='sub';e.cd=3;}else{e.tip.x+=gx/gl*300*dt;e.tip.y+=gy/gl*300*dt;}}
      move(e,(mx*sp+e.vx)*dt,(my*sp+e.vy)*dt);const f=Math.pow(kbFr(),dt);e.vx*=f;e.vy*=f;if(e.st==='sub'){e.tip.x=e.x;e.tip.y=e.y;}continue;}
    if(b.aquatic){e.st=e.st||'sub';e.stT=(e.stT||0)-dt;const pw=liqAt(p.x,p.y)>=2;let mx=0,my=0,sp=e.spd;
      if(e.st==='sub'){if(pw&&d<110&&e.cd<=0){mx=dx/d;my=dy/d;if(d<24){e.st='rise';e.stT=0.35;sfx('slosh');}}
        else{e.wt-=dt;if(e.wt<=0){e.wt=rr(1,2.5);const a=Math.random()*6.283;e.wx=Math.cos(a);e.wy=Math.sin(a);}mx=e.wx;my=e.wy;sp*=0.4;}}
      else if(e.st==='rise'){if(Math.random()<0.5)parts.push({x:e.x+rr(-5,5),y:e.y+rr(-3,3),vx:rr(-15,15),vy:rr(-25,-5),t:0.3,m:0.3,c:'#bfe0e8',s:1});
        if(e.stT<=0){e.st='surf';e.stT=1.3;sfx('slosh');if(d<e.r+p.r+7)hurtPlayer(b.dmg,false,e);}}
      else{mx=dx/d*0.3;my=dy/d*0.3;if(e.stT<=0){e.st='sub';e.cd=0.9;}}
      move(e,(mx*sp+e.vx)*dt,(my*sp+e.vy)*dt);const f=Math.pow(kbFr(),dt);e.vx*=f;e.vy*=f;continue;}
    if(b.drone){e.bob=(e.bob||0)+dt*5;e.alarmT=(e.alarmT==null?rr(0.5,1.5):e.alarmT)-dt;e.beep=(e.beep||0)-dt;let mx=0,my=0;
      if(e.alert){let tx=0,ty=0;if(los){tx=dx/d;ty=dy/d;}else{const tg=flowStep(e);if(tg){const gx=tg.x-e.x,gy=tg.y-e.y,gl=Math.hypot(gx,gy)||1;tx=gx/gl;ty=gy/gl;}}
        const want=!los||d>60?1:d<35?-1:0;mx=tx*want-ty*0.5*e.sd;my=ty*want+tx*0.5*e.sd;if(Math.random()<dt*0.3)e.sd*=-1;
        if(los&&e.alarmT<=0){e.alarmT=2;e.beep=0.35;noise(e.x,e.y,220);lights.push({x:e.x,y:e.y,r:34,t:0.3,m:0.3,c:'255,40,40'});if(d<220)sfx('beep');}}
      else{e.wt-=dt;if(e.wt<=0){e.wt=rr(1,2.5);const a=Math.random()*6.283;e.wx=Math.cos(a)*0.5;e.wy=Math.sin(a)*0.5;}mx=e.wx;my=e.wy;}
      const ml=Math.hypot(mx,my);if(ml>1){mx/=ml;my/=ml;}move(e,(mx*e.spd+e.vx)*dt,(my*e.spd+e.vy)*dt);const f=Math.pow(kbFr(),dt);e.vx*=f;e.vy*=f;continue;}
    let mx=0,my=0,sp=e.spd;
    if(e.alert){
      if(b.ranged&&los&&d<150){
        if(d<70){mx=-dx/d;my=-dy/d;}else if(d>110){mx=dx/d;my=dy/d;}else{mx=-dy/d*0.6*e.sd;my=dx/d*0.6*e.sd;}
        if(e.cd<=0){e.cd=b.atk*rr(.8,1.2);sfx('glob');bullets.push({x:e.x,y:e.y,vx:dx/d*115,vy:dy/d*115,life:2,dmg:b.dmg,p:false,src:e});}
      }else if(los&&d<70){mx=dx/d;my=dy/d;}
      else{const tg=flowStep(e);if(tg){const tx=tg.x-e.x,ty=tg.y-e.y,tl=Math.hypot(tx,ty)||1;if(tl>0.5){mx=tx/tl;my=ty/tl;}}}
      if(!b.ranged&&d<e.r+p.r+0.5){mx=0;my=0;}
      if(!b.ranged&&d<e.r+p.r+3&&e.cd<=0&&!(e.shellT>0)){e.cd=b.atk;hurtPlayer(b.dmg,false,e);if(b.biteP)addStatus('psn',b.biteP);}
    }else{
      const f=flares.length?nearFlare(e):null;
      if(f){const fx=f.x-e.x,fy=f.y-e.y,fd=Math.hypot(fx,fy)||1;if(fd>14){mx=fx/fd;my=fy/fd;}else{mx=-fy/fd*e.sd;my=fx/fd*e.sd;}sp*=0.7;}
      else{e.wt-=dt;if(e.wt<=0){e.wt=rr(1,3);const a=Math.random()*6.283,go=Math.random()<.5;e.wx=go?Math.cos(a):0;e.wy=go?Math.sin(a):0;}
        mx=e.wx;my=e.wy;sp*=0.35;}
    }
    {const ti=Math.floor(e.y/TS)*MW+Math.floor(e.x/TS);if(slime[ti]&&!b.trail&&!b.fly)sp*=0.6;if(b.snail){e.shellT=(e.shellT||0)-dt;if(e.shellT>0)sp=0;}}
    sp*=(b.swim?(liqAt(e.x,e.y)>=2?b.swim:(b.land||1)):LIQ[liqAt(e.x,e.y)])*(hz[Math.floor(e.y/TS)*MW+Math.floor(e.x/TS)]===2?0.7:1);
    move(e,(mx*sp+e.vx)*dt,(my*sp+e.vy)*dt);
    if(b.trail){const ti=Math.floor(e.y/TS)*MW+Math.floor(e.x/TS);if(ti!==e.lastT){e.lastT=ti;if(map[ti]===0&&liq[ti]<2&&hz[ti]!==1){slime[ti]=3;slimeK[ti]=b.trail;}}}
    const f=Math.pow(kbFr(),dt);e.vx*=f;e.vy*=f;
  }
  for(let i=0;i<enemies.length;i++)for(let j=i+1;j<enemies.length;j++){
    const a=enemies[i],c=enemies[j],dx=c.x-a.x,dy=c.y-a.y,d=Math.hypot(dx,dy),mn=a.r+c.r;
    if(d<mn&&d>0){const push=(mn-d)/2;move(a,-dx/d*push,-dy/d*push);move(c,dx/d*push,dy/d*push);}}
  for(const e of enemies){if(e.dead)continue;e.kbT=(e.kbT||0)-dt;e.impT=(e.impT||0)-dt;if(!(e.kbT>0)||e.impT>0||ET[e.type].fly||ET[e.type].ghost)continue;
    const sp=Math.hypot(e.vx,e.vy);if(sp<110)continue;const ux=e.vx/sp,uy=e.vy/sp;
    if(blocked(e.x+ux*2.5,e.y+uy*2.5,e.r,false,e)){const dmg=Math.min(8,(sp-90)/35);e.impT=0.35;e.kbT=0;e.vx*=-0.2;e.vy*=-0.2;e.stun=Math.max(e.stun||0,0.35);
      damageEnemy(e,dmg,0,0,0,true);if(!e.dead)float(e.x,e.y-6,'slam','#e8dcb0');sfx('thud');shake=Math.max(shake,Math.hypot(e.x-p.x,e.y-p.y)<120?2:0);
      for(let k=0;k<6;k++)parts.push({x:e.x+ux*e.r,y:e.y+uy*e.r,vx:rr(-40,40)-ux*30,vy:rr(-40,40)-uy*30,t:0.35,m:0.35,c:'#8e978b',s:1});}}
  enemies=enemies.filter(e=>!e.dead);

  for(const b of bullets){
    const steps=Math.max(1,Math.ceil(Math.hypot(b.vx,b.vy)*dt/3));
    for(let s=0;s<steps&&!b.dead;s++){
      b.x+=b.vx*dt/steps;b.y+=b.vy*dt/steps;
      if(solidAt(b.x,b.y)){b.dead=true;const tx=Math.floor(b.x/TS),ty=Math.floor(b.y/TS);if(b.p)for(const f of fans)if(!f.dead&&f.tx===tx&&f.ty===ty)hitFan(f,b.dmg);
        if(b.p&&map[ty*MW+tx]===3)damageSecret(tx,ty,b.dmg);
        for(let k=0;k<3;k++)parts.push({x:b.x-b.vx*0.01,y:b.y-b.vy*0.01,vx:rr(-50,50),vy:rr(-50,50),t:0.18,m:0.18,c:b.p?(b.kind==='bolt'?'#bfe4ff':'#ffe7a0'):'#9fd4c8',s:1});break;}
      if(b.p){let hpl=null;for(const pl of plants)if(!pl.burst&&Math.hypot(pl.x-b.x,pl.y-b.y+3)<4){hpl=pl;break;}if(hpl){burstPlant(hpl);b.dead=true;break;}}
      if(b.p){let ht=null;for(const e of enemies)if(!e.dead&&e.tip&&(e.st==='lash'||e.st==='hold')&&segDist(b.x,b.y,e.x,e.y,e.tip.x,e.tip.y)<3.5&&Math.hypot(b.x-e.x,b.y-e.y)>e.r+1&&Math.hypot(b.x-player.x,b.y-player.y)>6){ht=e;break;}
        if(ht){ht.tHp-=b.dmg;b.dead=true;for(let k=0;k<3;k++)parts.push({x:b.x,y:b.y,vx:rr(-30,30),vy:rr(-30,30),t:0.3,m:0.3,c:'#9a5aa8',s:1});if(ht.tHp<=0)severTentacle(ht,'severed');break;}}
      {let hc=null;for(const c of cores)if(!c.dead&&Math.hypot(c.x-b.x,c.y-b.y)<6){hc=c;break;}if(hc&&b.p){hitCore(hc,b.dmg);b.dead=true;break;}}
      {let hb=null;for(const bb of barrels)if(!bb.dead&&Math.hypot(bb.x-b.x,bb.y-b.y)<4.5){hb=bb;break;}if(hb){hitBarrel(hb,b.p?b.dmg:3,b.vx,b.vy,70+(b.dmg||2)*8);b.dead=true;break;}}
      if(b.p){for(const e of enemies){if(e.dead||(b.hits&&b.hits.has(e)))continue;if(enemyHit(e,b.x,b.y,b)){b.hitE=true;if(!b.comboed){b.comboed=true;comboAdd(0.25);}if(b.shock&&!ET[e.type].dummy)e.stun=Math.max(e.stun||0,0.5);ghostOK=!!b.rad;let bd=b.dmg;if(b.cc&&!ET[e.type].dummy&&Math.random()<b.cc){bd*=2;critFx(e,bd);}else if(b.cc&&ET[e.type].dummy&&Math.random()<b.cc){bd*=2;critFx(e,bd);}damageEnemy(e,bd,b.vx,b.vy,b.kb);ghostOK=false;
        if(b.pierce){b.hits.add(e);b.dmg*=0.8;}else{b.dead=true;break;}}}}
      else{let hitE=null;for(const e of enemies){if(e.dead||e===b.src||ET[e.type].ghost||ET[e.type].dummy)continue;if(Math.hypot(e.x-b.x,e.y-b.y)<e.r+1){hitE=e;break;}}
        if(hitE){if(b.src&&ET[b.src.type]&&ET[b.src.type].guard&&!ET[hitE.type].guard){hitE.foe=b.src;hitE.foeT=7;hitE.alert=true;}if(b.web){hitE.stun=Math.max(hitE.stun||0,0.8);}else{damageEnemy(hitE,b.dmg*0.8,b.vx,b.vy,30);splat(b.x,b.y,'#1f3a36',6,4);}b.dead=true;break;}
        if(Math.hypot(p.x-b.x,p.y-b.y)<p.r+1.5){if(b.seed||b.slug){hurtPlayer(b.dmg,false,b);}else if(b.web){hurtPlayer(b.dmg,false,b);addStatus('stk',45);for(let k=0;k<5;k++)parts.push({x:b.x,y:b.y,vx:rr(-20,20),vy:rr(-20,20),t:0.4,m:0.4,c:'#d8dcd4',s:1});}else{hurtPlayer(b.dmg,false,b);addStatus('psn',20);splat(b.x,b.y,'#1f3a36',6,4);}b.dead=true;}}
    }
    b.life-=dt;if(b.life<=0)b.dead=true;
  }
  for(const b of bullets)if(b.dead&&b.kind==='knives'&&!b.done){b.done=true;
    if(Math.random()<(b.hitE?0.3:0.1)){for(let k=0;k<4;k++)parts.push({x:b.x,y:b.y,vx:rr(-40,40),vy:rr(-40,40),t:0.25,m:0.25,c:'#c8ccc4',s:1});float(b.x,b.y-4,'snapped','#8e978b');}
    else{let x=b.x,y=b.y;{const sp=Math.hypot(b.vx,b.vy)||1;for(let k=0;k<16&&solidAt(x,y);k++){x-=b.vx/sp*2;y-=b.vy/sp*2;}}if(!solidAt(x,y))items.push({x,y,type:'knives',amt:1,ph:0,noPick:0.25});}}
  bullets=bullets.filter(b=>!b.dead);
  for(const c of charges){bounceMove(c,dt,0.08);c.t-=dt;if(c.t<=0){c.dead=true;explode(c.x,c.y);}}
  charges=charges.filter(c=>!c.dead);
  for(const f of flares){bounceMove(f,dt,0.05);f.t-=dt;if(f.glow){f.age+=dt;if(Math.random()<0.08)parts.push({x:f.x,y:f.y,vx:rr(-6,6),vy:rr(-12,-4),t:0.5,m:0.5,c:'#9fff9a',s:1});
      if(f.age>0.6&&Math.hypot(f.x-p.x,f.y-p.y)<10&&!p.tools.glowstick){f.dead=true;p.tools.glowstick=true;float(p.x,p.y-8,'glowstick','#9fff9a');sfx('pick');}continue;}
    if(Math.random()<0.1)clearSlimeAround(f.x,f.y,10);{const fi=Math.floor(f.y/TS)*MW+Math.floor(f.x/TS);if(oil[fi])igniteOil(fi%MW,(fi/MW)|0);}
    if(Math.random()<0.5)parts.push({x:f.x,y:f.y,vx:rr(-20,20),vy:rr(-40,-5),t:0.3,m:0.3,c:Math.random()<.5?'#ff8a5a':'#ffd0a0',s:1});
    if(f.t<=0)f.dead=true;}
  flares=flares.filter(f=>!f.dead);
  if(Math.random()<0.0025)flickT=rr(0.05,0.18);
  hintT-=dt;
}
const PR=90;
function updateHazards(dt){
  if(levelTimer>0){levelTimer-=dt;if(levelTimer<=0){levelTimer=0;purgeGas=true;say('purge gas floods the deck. get to the lift');sfx('hiss');}}
  if(purgeGas){player.gasT=(player.gasT||0)+dt;if(player.gasT>=0.35){player.gasT-=0.35;hurtPlayer(1.3,true);}}
  const p=player,pi=Math.floor(p.y/TS)*MW+Math.floor(p.x/TS),ph=hz[pi];
  if(ph===1&&!hazOff){p.burn=(p.burn||0)+dt;if(p.burn>=0.25){p.burn-=0.25;hurtPlayer(1.5*(p.st.wet>30?0.5:1)*(p.floating?0.5:1),true);addStatus('brn',p.floating?7:15);p.st.wet=Math.max(0,p.st.wet-10);if(Math.random()<.5)parts.push({x:p.x,y:p.y,vx:rr(-10,10),vy:-30,t:0.4,m:0.4,c:'#ffb050',s:1});}}
  else if(ph===2&&!p.floating){addStatus('psn',35*dt);}
  for(const e of enemies){if(e.dead||ET[e.type].dummy&&!testMode||ET[e.type].fly)continue;const h=hz[Math.floor(e.y/TS)*MW+Math.floor(e.x/TS)];
    if((h===1&&!hazOff)||h===2){e.burn=(e.burn||0)+dt;if(e.burn>=0.3){e.burn-=0.3;const fw=h===1&&fireWeak(e);damageEnemy(e,h===1?4*(fw?3:1):2,0,0,0,true);if(fw)e.burnT=Math.max(e.burnT||0,5);}}}
  for(const v of vents){if(hazOff)break;v.t-=dt;const near=Math.hypot(v.x-p.x,v.y-p.y)<160;
    if(v.phase==='idle'&&v.t<=0){v.phase='warn';v.t=0.8;if(near)sfx('hiss');}
    else if(v.phase==='warn'&&v.t<=0){v.phase='burst';v.t=1.4;if(near)sfx('steam');if(v.cold)freezeAround(v.x,v.y,18);}
    else if(v.phase==='burst'){if(!v.cold)puff(v.x,v.y-6,'steam',14*dt,v);if(Math.random()<0.6)parts.push({x:v.x+rr(-4,4),y:v.y,vx:rr(-15,15),vy:rr(-60,-25),t:0.7,m:0.7,c:v.cold?'#cfe8ff':'#dfe4e2',s:2});
      if(Math.hypot(v.x-p.x,v.y-p.y)<20){p.steam=(p.steam||0)+dt;if(p.steam>=0.25){p.steam-=0.25;if(v.cold){addStatus('frz',15);hurtPlayer(0.5,true);}else hurtPlayer(2.5,true);}}
      for(const e of enemies)if(!e.dead&&Math.hypot(v.x-e.x,v.y-e.y)<20){e.burn=(e.burn||0)+dt;if(e.burn>=0.3){e.burn-=0.3;damageEnemy(e,2.5,0,0,0,true);}}
      if(v.t<=0){v.phase='idle';v.t=rr(2.5,5);}}}
  for(const a of anoms){
    if(!a.fixed){const nx=a.x+a.vx*dt,ny=a.y+a.vy*dt;if(solidAt(nx,a.y))a.vx*=-1;else a.x=nx;if(solidAt(a.x,ny))a.vy*=-1;else a.y=ny;}
    const drift=(o,sp)=>{const dx=a.x-o.x,dy=a.y-o.y,d=Math.hypot(dx,dy);if(d>PR||d<2)return d;const f=(1-d/PR)*sp;move(o,dx/d*f*dt,dy/d*f*dt);return d;};
    const pd=drift(p,80);if(pd<PR)addStatus('rad',(1-pd/PR)*30*dt);if(pd<12){p.void=(p.void||0)+dt;if(p.void>=0.2){p.void-=0.2;hurtPlayer(2,true);addStatus('rad',10);}}
    for(const e of enemies){if(e.dead||ET[e.type].dummy)continue;if(ET[e.type].ghost){if(Math.hypot(e.x-a.x,e.y-a.y)<12){ghostOK=true;damageEnemy(e,999,0,0,0,true);ghostOK=false;float(e.x,e.y,'unmade','#c9a8ff');}continue;}const d=drift(e,90);if(d<12){e.burn=(e.burn||0)+dt;if(e.burn>=0.2){e.burn-=0.2;damageEnemy(e,4,0,0,0,true);}}}
    for(const b of bullets){const dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);if(d>PR||d<2)continue;const sp=Math.hypot(b.vx,b.vy),f=(1-d/PR)*1400*dt;
      b.vx+=dx/d*f;b.vy+=dy/d*f;const ns=Math.hypot(b.vx,b.vy);b.vx*=sp/ns;b.vy*=sp/ns;if(d<8)b.dead=true;}
    for(const o of [...charges,...flares]){const dx=a.x-o.x,dy=a.y-o.y,d=Math.hypot(dx,dy);if(d>PR||d<2)continue;const f=(1-d/PR)*260*dt;o.vx+=dx/d*f;o.vy+=dy/d*f;}
    for(const it of items){const dx=a.x-it.x,dy=a.y-it.y,d=Math.hypot(dx,dy);if(d>PR||d<1)continue;const f=(1-d/PR)*40*dt;const nx=it.x+dx/d*f,ny=it.y+dy/d*f;if(!solidAt(nx,ny)){it.x=nx;it.y=ny;}
      if(d<6&&!testMode){it.dead=true;for(let k=0;k<5;k++)parts.push({x:it.x,y:it.y,vx:rr(-20,20),vy:rr(-20,20),t:0.3,m:0.3,c:'#c9a8ff',s:1});}}
    items=items.filter(i=>!i.dead);
  }
}
function updateFx(dt){
  {const f=Math.pow(0.03,dt);for(const q of parts){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=f;q.vy*=f;q.t-=dt;}}
  parts=parts.filter(q=>q.t>0);if(parts.length>900)parts.splice(0,parts.length-900);
  for(const t of texts){t.y-=12*dt;t.t-=dt;}texts=texts.filter(t=>t.t>0);
  for(const l of lights)l.t-=dt;lights=lights.filter(l=>l.t>0);
  for(const m of msgs)m.t-=dt;msgs=msgs.filter(m=>m.t>0);
  shake=Math.max(0,shake-dt*22);bannerT-=dt;flickT-=dt;
}

