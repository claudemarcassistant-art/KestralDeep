// ---------- actions ----------
let flames=[];
function magCap(w){return MAGS[w]?MAGS[w][0]:0;}
function curGun(){const P=player,st=P.arms[P.armSet];return st&&st.off&&ARM[st.off].gun?st.off:null;}
function magLeft(w){const P=player;if(!P.mag)P.mag={};if(P.mag[w]==null)P.mag[w]=0;return P.mag[w];}
function startReload(quiet){const P=player,w=curGun();if(!w)return false;if(!MAGS[w]){if(!quiet){say(ARM[w].name.toLowerCase()+' needs no reloading');sfx('deny');}return false;}
  const am=WPN[w].ammo;if(P.reloadT>0)return true;if(magLeft(w)>=magCap(w)){if(!quiet){say('already loaded');sfx('deny');}return false;}if(!(P.inv[am]>0)){if(!quiet){say('no '+am+' to load');sfx('deny');}return false;}
  P.reloadT=P.reloadMax=MAGS[w][1]*(1-0.08*U('trig'))*(1-0.04*subPts('dex'));P.reloadW=w;sfx('click');
  // active reload: a marker on the reload bar; a second R press inside it finishes at once (activeReloadPress())
  const A=ACTIVE_RELOAD;P.arW=Math.min(A.maxW,A.w+A.dexW*Math.max(0,subPts('dex')));P.arPos=rr(A.from,A.to);P.arFlash=0;P.arFail=0;return true;}
function finishReload(){const P=player,w=P.reloadW,am=WPN[w].ammo,n=Math.min(magCap(w)-magLeft(w),P.inv[am]||0);P.reloadT=0;P.arPos=null;P.mag[w]+=n;P.inv[am]-=n;}
function updateReload(dt){const P=player;if(P.arFlash>0)P.arFlash-=dt;if(P.arFail>0)P.arFail-=dt;if(!(P.reloadT>0))return;if(curGun()!==P.reloadW){P.reloadT=0;P.arPos=null;return;}P.reloadT-=dt;if(P.reloadT<=0){finishReload();sfx('equip');}}
// the timing press of R during a reload: inside the marker reloads at once, outside fumbles (50% longer). Returns true if R was used.
function activeReloadPress(){const P=player;if(!(P.reloadT>0)||P.arPos==null||curGun()!==P.reloadW)return false;
  const k=1-P.reloadT/P.reloadMax;
  if(k>=P.arPos&&k<=P.arPos+P.arW){finishReload();P.arFlash=ACTIVE_RELOAD.flash;sfx('qreload');float(P.x,P.y-10,'quick reload','#ffe08a');if(lvl)lvl.qreload=(lvl.qreload||0)+1;}
  else{const r=P.reloadT,f=ACTIVE_RELOAD.fumble;P.reloadT=r*f;P.reloadMax+=r*(f-1);P.arPos=null;P.arFail=0.4;sfx('clank');float(P.x,P.y-10,'fumble','#c09070');}
  return true;}
function useMag(w){const P=player;if(!MAGS[w])return true;if(P.reloadT>0)return false;if(magLeft(w)<=0){if(!startReload(true)){if(P.emptyT<=0){sfx('click');say('out of '+WPN[w].ammo);P.emptyT=1.2;}}return false;}P.mag[w]--;return true;}
function fireFlame(){const p=player;if(p.liq===4){p.cd=0.3;return;}if(p.reloadT>0){p.cd=0.1;return;}if(magLeft('flamer')<=0){useMag('flamer');p.cd=0.2;return;}
  p.flameN=(p.flameN||0)+1;if(p.flameN%3===0)p.mag.flamer--;p.cd=0.045;breakCloak();if(p.flameN%6===0){sfx('whoosh');noise(p.x,p.y,120);}
  const ca=Math.cos(p.ang),sa=Math.sin(p.ang);for(let k=0;k<2;k++){const a=p.ang+rr(-0.18,0.18)*(p.aiming&&S.laser?0.7:1),sp=rr(150,195);flames.push({x:p.x+ca*8,y:p.y+sa*8,vx:Math.cos(a)*sp+p.vx*0.4,vy:Math.sin(a)*sp+p.vy*0.4,t:0.42,m:0.42,hit:new Set()});}}
function updateFlames(dt){for(const f of flames){f.t-=dt;const nx=f.x+f.vx*dt,ny=f.y+f.vy*dt,tx=Math.floor(nx/TS),ty=Math.floor(ny/TS),i=ty*MW+tx;
    if(solidAt(nx,ny)){f.t=0;}else{f.x=nx;f.y=ny;}f.vx*=Math.pow(0.25,dt);f.vy*=Math.pow(0.25,dt);
    if(liq[i]>=2&&!ice[i]){f.t=Math.min(f.t,0.05);if(Math.random()<0.2)parts.push({x:f.x,y:f.y,vx:rr(-10,10),vy:rr(-25,-5),t:0.4,m:0.4,c:'rgba(220,220,220,0.5)',s:1});continue;}
    if(oil[i])igniteOil(tx,ty);if(webs[i])tearWeb(i);if(slime[i]){slime[i]=0;paintTile(tx,ty);}
    for(const e of enemies){if(e.dead||f.hit.has(e)||ET[e.type].ghost)continue;if(Math.hypot(e.x-f.x,e.y-f.y)<e.r+3){f.hit.add(e);const fw=fireWeak(e);damageEnemy(e,(f.trap?TRAP_TYPES.flame.perFlame:0.35)*(fw?3:1),f.vx,f.vy,6,true);e.burnT=Math.max(e.burnT||0,fw?5:3);}}
    if(f.trap&&f.jet.pHit<=0&&player&&Math.hypot(player.x-f.x,player.y-f.y)<player.r+3){const F0=TRAP_TYPES.flame;f.jet.pHit=F0.hitEvery;hurtPlayer(F0.burnHurt,false);addStatus('brn',F0.burn);}
    for(const b of barrels)if(!b.dead&&Math.hypot(b.x-f.x,b.y-f.y)<6)b.heat=(b.heat||0)+0.06;
    for(const pl of plants)if(!pl.burst&&Math.hypot(pl.x-f.x,pl.y-f.y)<6)burnPlant(pl);
    if(slime[i]){slime[i]=0;paintTile(tx,ty);}
    if(f.t<=0&&!solid(tx,ty)&&!liq[i]&&!hz[i]&&Math.random()<0.05){hz[i]=1;fires.push({x:tx*TS+6,y:ty*TS+6,ph:Math.random()*6,temp:3,tx,ty});paintTile(tx,ty);}
    if(Math.random()<dt*2)puff(f.x,f.y,'smoke',2);}
  flames=flames.filter(f=>f.t>0);
  for(const e of enemies){if(!(e.burnT>0)||e.dead)continue;e.burnT-=dt;const ei=Math.floor(e.y/TS)*MW+Math.floor(e.x/TS);if(liq[ei]>=2){e.burnT=0;continue;}
    e.burnAcc=(e.burnAcc||0)+dt;if(e.burnAcc>=0.5){e.burnAcc-=0.5;damageEnemy(e,0.8*(fireWeak(e)?3:1)*(e.oilT>0?2:1),0,0,0,true);}if(Math.random()<0.4)parts.push({x:e.x+rr(-3,3),y:e.y+rr(-3,3),vx:rr(-6,6),vy:rr(-30,-10),t:0.3,m:0.3,c:Math.random()<0.5?'#ff9a4a':'#ffd070',s:1});}}
function fire(){
  if(player.weapon==='flamer')return fireFlame();
  const w=WPN[player.weapon],inv=player.inv;
  if(player.liq===4){if(player.emptyT<=0){say('no weapons while swimming. shove to fend them off');player.emptyT=2;}player.cd=0.3;return;}
  if(MAGS[player.weapon]){if(!useMag(player.weapon)){player.cd=0.15;return;}}else{if(inv[w.ammo]<=0){if(player.emptyT<=0){sfx('click');say('out of '+w.ammo);player.emptyT=1.2;}player.cd=0.25;return;}inv[w.ammo]--;}
  player.cd=w.cd*(1-S.rof)*(1-0.06*U('trig'));player.cdMax=player.cd;breakCloak();
  const mx=player.x+Math.cos(player.ang)*7,my=player.y+Math.sin(player.ang)*7;
  for(let i=0;i<w.pellets;i++){const sp=aimMul()*(perk('steady')?0.7:1)*(1-0.15*U('steady'))*w.spread*(player.aiming?(w.pellets>1?0.6:0.3)*(S.laser?0.6:1):1)*(player.sprinting?2.5:1),a=player.ang+rr(-sp,sp),s=w.speed*rr(.9,1.1);
    bullets.push({x:player.x,y:player.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0.6,dmg:w.dmg*(player.aiming&&S.laser?1.1:1)*(1+0.08*U('pen')),cc:critChance(player.weapon)+(player.aiming&&S.laser?0.03:0),p:true,kb:w.kb,pierce:!!w.pierce,kind:player.weapon,hits:w.pierce?new Set():null});}
  player.flashT=0.05;
  const lc=player.weapon==='bolt'?'140,200,255':'255,210,120';
  lights.push({x:mx,y:my,r:player.weapon==='nailer'?30:50,t:0.06,m:0.06,c:lc});
  for(let i=0;i<(player.weapon==='nailer'?1:4);i++)parts.push({x:mx,y:my,vx:Math.cos(player.ang+rr(-.6,.6))*rr(40,120),vy:Math.sin(player.ang+rr(-.6,.6))*rr(40,120),t:0.15,m:0.15,c:player.weapon==='bolt'?'#bfe4ff':'#ffd98a',s:1});
  if(player.weapon!=='bolt'&&player.weapon!=='nailer')parts.push({x:player.x,y:player.y,vx:Math.cos(player.ang+1.6)*rr(30,50),vy:Math.sin(player.ang+1.6)*rr(30,50),t:0.5,m:0.5,c:'#b89a4a',s:1});
  shake=Math.max(shake,w.shake);noise(player.x,player.y,w.noise*(1-S.quiet));sfx(w.sfx);
}
function shove(){return asMelee(shove0);}
function shove0(){
  if(state!=='play'||paused()||player.shoveCd>0||player.dazeT>0)return;
  const m0=melee(),cloaked=player.cloakT>0,tk=player.sprinting;const m=tk?Object.assign({},m0,{dmg:m0.dmg+1,kb:m0.kb*(perk('haymaker')?2.3:1.6),range:m0.range+5,arc:m0.arc*0.8}):m0;
  player.shoveCd=m.cd*(tk?1.3:1);player.shoveMax=player.shoveCd;player.shoveT=tk?0.22:0.12;sfx('shove');
  if(tk){player.tackleT=0.35;{const sv=Math.hypot(player.vx,player.vy)||1;player.vx+=player.vx/sv*120;player.vy+=player.vy/sv*120;}player.stam=Math.max(0,player.stam-12*(1-0.15*U('dashc')));float(player.x,player.y-8,'tackle','#e8dcb0');sfx('thud');}
  if(player.grabbedBy)severTentacle(player.grabbedBy,'shoved off');
  for(const pl of plants){if(pl.burst)continue;const dx=pl.x-player.x,dy=pl.y-player.y;if(Math.hypot(dx,dy)<m.range+4&&Math.abs(angDiff(Math.atan2(dy,dx),player.ang))<m.arc)burstPlant(pl);}
  for(const e of enemies){const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy);
    if(d<m.range+e.r){const da=Math.abs(angDiff(Math.atan2(dy,dx),player.ang));
      if(da<m.arc){const amb=(player.creeping||cloaked)&&!e.alert;if(amb){float(e.x,e.y,'ambush','#ff9a7a');if(lvl)lvl.ambush++;}
        damageEnemy(e,m.dmg*(amb?(perk('ambusher')?4:3):1),dx,dy,e.type==='brute'?m.kb*0.35:m.kb);e.cd=Math.max(e.cd,amb?1.2:0.6);}}}
  if(cloaked)breakCloak();
  for(const c of cores){if(c.dead)continue;const dx=c.x-player.x,dy=c.y-player.y;if(Math.hypot(dx,dy)<m.range+6&&Math.abs(angDiff(Math.atan2(dy,dx),player.ang))<m.arc)hitCore(c,m.dmg*2);}
  for(const bb of barrels){if(bb.dead)continue;const dx=bb.x-player.x,dy=bb.y-player.y;if(Math.hypot(dx,dy)<m.range+4&&Math.abs(angDiff(Math.atan2(dy,dx),player.ang))<m.arc)hitBarrel(bb,m.dmg,dx,dy,m.kb*0.9);}
  const ca=Math.cos(player.ang),sa=Math.sin(player.ang);
  for(let s=4;s<=m.range;s+=3){const tx=Math.floor((player.x+ca*s)/TS),ty=Math.floor((player.y+sa*s)/TS);
    if(solid(tx,ty)){if(map[ty*MW+tx]===3)damageSecret(tx,ty,m.dmg*2);else sfx('thud');break;}}
}
function liqAt(x,y){const tx=Math.floor(x/TS),ty=Math.floor(y/TS);if(tx<0||ty<0||tx>=MW||ty>=MH)return 0;const i=ty*MW+tx;return ice[i]?0:flot[i]?1:liq[i];}
let ice=new Uint8Array(MW*MH);
let flot=new Uint8Array(MW*MH);
function placeFlotsam(){flot=new Uint8Array(MW*MH);const deep=[];for(let i=0;i<MW*MH;i++)if(map[i]===0&&liq[i]===4)deep.push(i);
  if(deep.length<20||Math.random()>0.3)return;const n=1+(Math.random()<0.25?1:0);
  for(let k=0;k<n;k++){let i=deep[rnd(deep.length)];const len=2+rnd(3);
    for(let j=0;j<len;j++){flot[i]=1;const x=i%MW,y=(i/MW)|0,opts=D4.map(([dx,dy])=>(y+dy)*MW+x+dx).filter(q=>liq[q]===4&&map[q]===0&&!flot[q]);if(!opts.length)break;i=opts[rnd(opts.length)];}}}
function drawFlotsam(tx,ty){const x=tx*TS-camX,y=ty*TS-camY;if(x<-14||y<-14||x>W+14||y>H+14)return;const h=hash(tx*9+4,ty*6+1),bob=Math.round(Math.sin(T*2+h%10)*0.8);
  ctx.strokeStyle='rgba(170,210,215,0.35)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x+6,y+7,6.5+Math.sin(T*3+h)*0.5,5,0,0,6.283);ctx.stroke();
  F('rgba(0,0,0,0.35)',x+1,y+9+bob,10,2);const kind=h%3;
  if(kind===0){F('#2a1e12',x+1,y+2+bob,10,8);for(let k=0;k<3;k++){F('#7a5a34',x+1,y+2+k*3+bob,10,2);F('#a07a48',x+1,y+2+k*3+bob,10,1);}}
  else if(kind===1){F('#1e160c',x+2,y+2+bob,8,8);F('#6a4a2a',x+3,y+3+bob,6,6);F('#8a6a3a',x+3,y+3+bob,6,1);F('#4a3218',x+3,y+5+bob,6,1);F('#4a3218',x+5,y+3+bob,1,6);}
  else{F('#2a1e12',x,y+4+bob,12,5);F('#7a5a34',x,y+4+bob,12,2);F('#9a7446',x+1,y+4+bob,5,1);F('#6a4a2a',x+2,y+7+bob,9,2);}}
function U(k){return player&&player.upg&&player.upg[k]||0;}
function price(c){return Math.max(1,Math.ceil(c*(1-0.15*U('haggle'))));}
function maxStam(){return 100*(1+S.stamina+0.1*U('endur'));}
function blink(){const p=player;if(state!=='play'||paused()||menuOpen||(p.blinkCd||0)>0||p.dazeT>0)return;
  let dx=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0),dy=(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0);if(!dx&&!dy){dx=Math.cos(p.ang);dy=Math.sin(p.ang);}const l=Math.hypot(dx,dy);dx/=l;dy/=l;
  let bx=null,by=null;for(let d=4;d<=56;d+=2){const nx=p.x+dx*d,ny=p.y+dy*d,tx=Math.floor(nx/TS),ty=Math.floor(ny/TS);const m=map[ty*MW+tx];if(m===1||m===2||m===3||m===4||m===7)break;if(!chasm[ty*MW+tx]&&!blocked(nx,ny,3,true,p)){bx=nx;by=ny;}}
  if(bx===null){say('no room to blink');sfx('click');return;}
  const cost=22;if(p.stam>=cost)p.stam-=cost;else{const rest=cost-p.stam;p.stam=0;hurtPlayer(rest*0.5,true);float(p.x,p.y-10,'psychic strain','#c9a8ff');}p.stamDelay=0.6;
  for(let k=0;k<12;k++){const a=k/12*6.283;parts.push({x:p.x,y:p.y,vx:Math.cos(a)*40,vy:Math.sin(a)*40,t:0.3,m:0.3,c:'#c9a8ff',s:1});}
  if(p.grabbedBy)severTentacle(p.grabbedBy,'blinked free');p.x=bx;p.y=by;p.vx*=0.3;p.vy*=0.3;p.iframeT=0.5;p.blinkCd=0.9;breakCloak();sfx('sonar');noise(p.x,p.y,40);
  for(let k=0;k<12;k++){const a=k/12*6.283;parts.push({x:p.x+Math.cos(a)*10,y:p.y+Math.sin(a)*10,vx:-Math.cos(a)*40,vy:-Math.sin(a)*40,t:0.3,m:0.3,c:'#e0d0ff',s:1});}}
function dash(){
  const p=player;if(state!=='play'||paused()||p.dashCd>0||p.dazeT>0)return;
  const dc=34*(1-0.15*U('dashc'));if(p.stam<dc){say('too winded to dash');sfx('click');return;}
  p.stam-=dc;p.stamDelay=0.7;p.dashCd=0.35;if(p.grabbedBy)severTentacle(p.grabbedBy,'wrenched free');if(p.st&&p.st.brn>0){p.st.brn=Math.max(0,p.st.brn-35);float(p.x,p.y-6,'roll','#ffd060');}p.dashT=0.15;p.iframeT=0.2;p.postDash=0.3;
  let dx=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0),dy=(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0);
  if(!dx&&!dy){dx=Math.cos(p.ang);dy=Math.sin(p.ang);}const l=Math.hypot(dx,dy);
  const lm=LIQ[liqAt(p.x,p.y)];p.vx=dx/l*260*lm;p.vy=dy/l*260*lm;sfx('dash');noise(p.x,p.y,50);
}
function fireRay(c){const p=player;if(!useMag('ray'))return;breakCloak();const a=p.ang+rr(-0.02,0.02)*(1.2-c);
  bullets.push({x:p.x,y:p.y,vx:Math.cos(a)*520,vy:Math.sin(a)*520,life:0.7,dmg:(3+c*8)*(1+0.08*U('pen')),p:true,kb:20+c*40,pierce:true,kind:'ray',rad:true,hits:new Set(),w:1+Math.round(c*1.7)});
  lights.push({x:p.x+Math.cos(a)*9,y:p.y+Math.sin(a)*9,r:40+c*30,t:0.12,m:0.12,c:'120,255,150'});shake=Math.max(shake,1+c*3);noise(p.x,p.y,60);sfx('ray');}
function sawMelee(){const p=player;p.sawN=(p.sawN||0)+1;
  if(p.inv.cells>0){if(p.sawN%9===0)p.inv.cells--;noise(p.x,p.y,150);if(p.sawN%3===0){sfx('nail');for(let k=0;k<2;k++)parts.push({x:p.x+Math.cos(p.ang)*12,y:p.y+Math.sin(p.ang)*12,vx:rr(-40,40),vy:rr(-40,40),t:0.2,m:0.2,c:'#ffd070',s:1});}return ARM.chainsaw.melee;}
  if(p.sawN%12===1)say('the chainsaw coughs. it needs power cells');return {dmg:2,cd:0.55,range:14,arc:0.7,kb:120};}
function inLash(p,x,y,r,m){const ca=Math.cos(p.ang),sa=Math.sin(p.ang),rx=x-p.x,ry=y-p.y,t=rx*ca+ry*sa;if(t<4||t>m.range+2)return false;return Math.abs(rx*sa-ry*ca)<r+1.5;}
function inJab(p,x,y,r,m){const ca=Math.cos(p.ang),sa=Math.sin(p.ang),ox=p.x-sa*3,oy=p.y+ca*3,rx=x-ox,ry=y-oy,t=rx*ca+ry*sa;if(t<2||t>m.range+2)return false;return Math.abs(rx*sa-ry*ca)<r+3;}
function fireBow(c,perfect){const p=player,w=WPN.bow;if(p.liq===4){say('you cannot draw a bow while swimming');return;}if(p.inv.bolts<=0){sfx('deny');say('out of bolts');p.mcd=0.3;return;}p.inv.bolts--;breakCloak();
  const mult=(1+1.5*c)*(perfect?1.4:1),sp=w.speed*(0.8+0.6*c),a=p.ang+rr(-w.spread,w.spread)*(1-c*0.8);
  bullets.push({x:p.x,y:p.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:0.9,dmg:w.dmg*mult*(1+0.08*U('pen')),cc:critChance('bow')+(perfect?0.25:0),p:true,kb:w.kb*(1+0.5*c),pierce:perfect,kind:'bow',hits:perfect?new Set():null});
  p.mcd=w.cd*(1+0.3*c);p.mcdMax=p.mcd;sfx('whoosh');noise(p.x,p.y,35);if(perfect){float(p.x,p.y-12,'perfect','#fff0a0');sfx('crunch_bow');}else if(c>=1)sfx('thud');}
function releaseCharge(k){const p=player,c=Math.min(1,p.chg),full=p.chg>=1,perfect=full&&p.chgFull>0&&p.chgFull<=0.2;
  if(k==='bow'){p.chg=0;p.chgFull=0;return fireBow(c<0.12?0:c,perfect);}
  const base=ARM[k].melee;p.chg=0;p.chgFull=0;
  if(c<0.12){primaryAttack(base);return;}
  const mult=(1+1.5*c)*(perfect?1.4:1);const m=Object.assign({},base,{dmg:base.dmg*mult,kb:base.kb*(1+0.6*c)*(perfect?1.3:1),range:base.range*(1+0.12*c),perfect,mult});
  if(k==='spear'&&full){const ca=Math.cos(p.ang),sa=Math.sin(p.ang);p.vx=ca*250;p.vy=sa*250;p.dashT=0.12;p.iframeT=Math.max(p.iframeT||0,0.12);}
  primaryAttack(m);p.mcd=base.cd*(1+0.4*c)*(p.whiff?2:comboCd());p.mcdMax=p.mcd;shake=Math.max(shake,2+3*c);
  if(perfect){float(p.x,p.y-12,'perfect','#fff0a0');sfx('crunch_'+(k==='spear'||k==='whip'?k:'bat'));for(let q=0;q<12;q++){const a=p.ang+rr(-0.5,0.5);parts.push({x:p.x+Math.cos(p.ang)*10,y:p.y+Math.sin(p.ang)*10,vx:Math.cos(a)*rr(60,140),vy:Math.sin(a)*rr(60,140),t:0.3,m:0.3,c:'#fff0a0',s:1});}}
  else if(full)sfx('thud');}
function comboTier(){const c=player.combo||0;for(let i=0;i<COMBO_T.length;i++)if(c>=COMBO_T[i][0])return 3-i;return 0;}
function comboDmg(){return [1,1,1.2,1.35][comboTier()];}
function comboCd(){return [1,0.85,0.85,0.7][comboTier()];}
function comboAdd(n){const P=player,before=comboTier();P.combo=Math.min(20,(P.combo||0)+n*(perk('rhythm')?1.5:1));P.comboIdle=0;const t=comboTier();
  if(t>before){const T0=COMBO_T[3-t];float(P.x,P.y-14,T0[1],T0[2]);sfx('hackok');}}
function comboBreak(){const P=player;if((P.combo||0)<1)return;if(perk('secondnature')&&!P.comboShield&&P.combo>=5){P.comboShield=true;float(P.x,P.y-12,'combo held','#e8dcb0');return;}if(P.combo>=5)float(P.x,P.y-12,'combo broken','#ff8a7a');P.combo=0;P.comboShield=false;}
function primaryAttack(m){return asMelee(()=>primaryAttack0(m));}
function primaryAttack0(m){const p=player;p.mcd=m.cd;p.mcdMax=m.cd;p.swingT=m.jab||m.lash?0:0.12;p.jabT=m.jab?0.16:0;if(m.lash){p.lashT=0.24;p.lashS=Math.random()<0.5?1:-1;}p.swingR=m.range;p.swingA=m.arc;if(m!==ARM.chainsaw.melee)sfx('shove');
  const cloaked=p.cloakT>0,bonus=S.meleeDmg||0;let connected=0;p.flurryN=p.flurryN||0;
  for(const e of enemies){if(e.dead||ET[e.type].ghost)continue;const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);
    if(m.lash?inLash(p,e.x,e.y,e.r,m):m.jab?inJab(p,e.x,e.y,e.r,m):(d<m.range+e.r&&Math.abs(angDiff(Math.atan2(dy,dx),p.ang))<m.arc)){
      if(m.perfect&&!ET[e.type].dummy)e.stun=Math.max(e.stun||0,0.9);
      if(m.lash&&!ET[e.type].dummy){e.stunB=(e.stunB||0)+(e.type==='brute'?28:45)*(m.mult||1);if(e.stunB>=100){e.stunB=0;e.stun=Math.max(e.stun||0,1.4);float(e.x,e.y-8,'reeling','#e8dcb0');}sfx('hit');}const amb=(p.creeping||cloaked)&&!e.alert;if(amb){float(e.x,e.y,'ambush','#ff9a7a');if(lvl)lvl.ambush++;}
      {connected++;let md=(m.dmg+bonus)*(amb?(perk('ambusher')?4:3):1)*comboDmg();const mk=player.arms[player.armSet].main||'fists';const flurry=perk('flurry')&&comboTier()>=2&&connected===1&&(++p.flurryN)%5===0;if(flurry||Math.random()<critChance(mk)){md*=2;critFx(e,md);}damageEnemy(e,md,dx,dy,e.type==='brute'?m.kb*0.35:m.kb);}}}
  for(const bb of barrels){if(bb.dead)continue;const dx=bb.x-p.x,dy=bb.y-p.y;if(m.lash?inLash(p,bb.x,bb.y,4,m):m.jab?inJab(p,bb.x,bb.y,4,m):(Math.hypot(dx,dy)<m.range+4&&Math.abs(angDiff(Math.atan2(dy,dx),p.ang))<m.arc)){if(bb.crate&&(m.mult||1)>=CRATE_CFG.heavyMult)breakCrate(bb);else hitBarrel(bb,m.dmg,dx,dy,m.kb*0.9);connected++;}}
  for(const pl of plants){if(pl.burst)continue;const dx=pl.x-p.x,dy=pl.y-p.y;if(Math.hypot(dx,dy)<m.range+4&&Math.abs(angDiff(Math.atan2(dy,dx),p.ang))<m.arc)burstPlant(pl);}
  for(const c of cores){if(c.dead)continue;const dx=c.x-p.x,dy=c.y-p.y;if(Math.hypot(dx,dy)<m.range+6&&Math.abs(angDiff(Math.atan2(dy,dx),p.ang))<m.arc)hitCore(c,m.dmg*2);}
  const ca=Math.cos(p.ang),sa=Math.sin(p.ang);for(let s2=4;s2<=m.range;s2+=3){const tx=Math.floor((p.x+ca*s2)/TS),ty=Math.floor((p.y+sa*s2)/TS);if(solid(tx,ty)){if(map[ty*MW+tx]===3)damageSecret(tx,ty,m.dmg*2);break;}}
  const rapid=m.cd<0.2;
  if(connected){comboAdd(rapid?0.35:1.5);p.mcd=m.cd*comboCd();p.whiff=false;}
  else if(!rapid){p.mcd=m.cd*2;p.whiff=true;}
  p.mcdMax=p.mcd;
  if(cloaked)breakCloak();}
function breakCloak(){const p=player;if(p&&p.cloakT>0){p.cloakT=0;float(p.x,p.y-6,'uncloaked','#9fc3ff');sfx('click');}}
let nades=[],emitters=[],mines=[];
function placeMine(){const P=player;if(!(P.inv.mine>0)){sfx('deny');return;}if(P.liq>=3){say('not in deep water');sfx('deny');return;}P.inv.mine--;mines.push({x:P.x,y:P.y+2,arm:1.2,trig:-1});sfx('click');say('mine set. it arms in a moment');}
function updateMines(dt){for(const m of mines){if(m.arm>0){m.arm-=dt;continue;}if(m.trig<0){for(const e of enemies){if(e.dead)continue;const b=ET[e.type];if(b.ghost||b.fly||b.dummy||b.plant)continue;if(Math.hypot(e.x-m.x,e.y-m.y)<e.r+12){m.trig=0.3;sfx('beep');break;}}}else{m.trig-=dt;if(m.trig<=0){m.dead=true;explode(m.x,m.y);}}}mines=mines.filter(m=>!m.dead);}
function throwNade(k){const P=player;if(P.liq===4){say('you cannot throw while swimming');sfx('click');return;}if(!(P.inv[k]>0)){say('none left');sfx('click');return;}
  P.inv[k]--;breakCloak();const tv=175*(1+0.2*U('throw'));nades.push({x:P.x,y:P.y,vx:Math.cos(P.ang)*tv,vy:Math.sin(P.ang)*tv,t:0.75,kind:k,spin:0});sfx('whoosh');}
function landNade(n){const tx=Math.floor(n.x/TS),ty=Math.floor(n.y/TS);n.dead=true;if(chasm[ty*MW+tx]){items.push({x:n.x,y:n.y,type:n.kind,ph:0,fall:0.7,fallM:0.7,fx:1});sfx('fall');return;}
  if(n.kind==='molotov'){sfx('slosh');spillOil(tx,ty,1,3);igniteOil(tx,ty);for(let k=0;k<14;k++)parts.push({x:n.x,y:n.y,vx:rr(-60,60),vy:rr(-60,60),t:0.4,m:0.4,c:k%2?'#ffb050':'#9adfe8',s:1});noise(n.x,n.y,120);}
  else if(n.kind==='cryonade'){sfx('hiss');sfx('crackle');emitters.push({x:n.x,y:n.y,t:FREEZE_CFG.cryo.t,kind:'cryo'});for(let k=0;k<16;k++)parts.push({x:n.x,y:n.y,vx:rr(-70,70),vy:rr(-70,70),t:0.45,m:0.45,c:k%2?'#e8f6ff':'#9fd8ff',s:1});noise(n.x,n.y,90);}
  else{sfx('hiss');emitters.push({x:n.x,y:n.y,t:n.kind==='gasnade'?4.5:6,kind:n.kind==='gasnade'?'toxic':'smoke'});}}
function updateNades(dt){for(const n of nades){n.t-=dt;n.spin+=dt*14;const nx=n.x+n.vx*dt,ny=n.y+n.vy*dt;if(solidAt(nx,ny)){n.vx*=-0.3;n.vy*=-0.3;landNade(n);continue;}n.x=nx;n.y=ny;
    if(enemies.some(e=>!e.dead&&!ET[e.type].ghost&&Math.hypot(e.x-n.x,e.y-n.y)<e.r+2)||n.t<=0)landNade(n);}nades=nades.filter(n=>!n.dead);
  for(const m of emitters){m.t-=dt;puff(m.x+rr(-3,3),m.y+rr(-3,3),m.kind,22*dt,m);if(m.kind==='cryo')cryoEmitterTick(m,dt);if(Math.random()<dt*20)parts.push({x:m.x,y:m.y,vx:rr(-20,20),vy:rr(-30,-5),t:0.4,m:0.4,c:m.kind==='toxic'?'#a8c848':m.kind==='cryo'?'#dff2ff':'#6a6a70',s:1});}
  for(const m of emitters)if(m.t<=0){for(const c of clouds)if(c.src===m)c.src=null;}emitters=emitters.filter(m=>m.t>0);}
function throwCharge(){
  if(player.liq===4){say('you cannot throw while swimming');sfx('click');return;}
  if(player.inv.charge<=0){say('no charges. build one at the workbench [C]');sfx('click');return;}
  player.inv.charge--;breakCloak();{const tv=190*(1+0.2*U('throw'));charges.push({x:player.x,y:player.y,vx:Math.cos(player.ang)*tv,vy:Math.sin(player.ang)*tv,t:1.3});}
}
function throwFlare(){
  if(player.liq===4){say('you cannot throw while swimming');sfx('click');return;}
  if(player.inv.flare<=0){say('no flares. build them at the workbench [C]');sfx('click');return;}
  player.inv.flare--;sfx('flare');
  flares.push({x:player.x,y:player.y,vx:Math.cos(player.ang)*170*(1+0.2*U('throw')),vy:Math.sin(player.ang)*170*(1+0.2*U('throw')),t:14,ph:Math.random()*6,pts:null,r:FLARE_R});
}
// the exit lift (and the test range's test lift and the arcade exit) is used with R, and wins over anything else in reach
function exitLiftAt(){const p=player;if(!exitT||state!=='play'||!p)return null;const cx=exitT.x*TS+6,cy=exitT.y*TS+6;if(Math.hypot(cx-p.x,cy-p.y)>=16)return null;
  if(testMode&&!testDeck&&!arcadeMode)return {k:'testlift',x:cx,y:cy};if(arcadeMode)return {k:'arcexit',x:cx,y:cy};
  if(liftState==='idle')return {k:'lift',x:cx,y:cy};return {k:liftState==='open'||liftState==='ready'?'liftgo':'liftshut',x:cx,y:cy};}
function liftShutMsg(){return liftState==='arena'?'the lift is sealed until every creature here is dead ('+arenaFoes().length+' left)'+(arenaW&&!arenaW.done?'. more are still coming':''):liftState==='locked'?'the lift is locked out. find the lift keycard':'the lift is still on its way';}
function findInteract(){
  const p=player;let best=null,bd=18;
  {const ex=exitLiftAt();if(ex)return ex;}
  {const h=crawlAt();if(h){const c=h.c[h.end],cx=c.tx*TS+6,cy=c.ty*TS+6,d=Math.hypot(cx-p.x,cy-p.y);if(d<bd){bd=d;best={k:'crawl',h,x:cx,y:cy};}}}
  if(testMode&&testConsole){const cx=testConsole.tx*TS+6,cy=testConsole.ty*TS+6,d=Math.hypot(cx-p.x,cy-p.y);if(d<bd){bd=d;best={k:'console',x:cx,y:cy};}}
  for(const h of hatches){let cx=h.tx*TS+6,cy=h.ty*TS+6,d=Math.hypot(cx-p.x,cy-p.y);if(d<Math.min(bd,12)){bd=d;best={k:'hatch',h,x:cx,y:cy};}
    cx=h.lx*TS+6;cy=h.ly*TS+6;d=Math.hypot(cx-p.x,cy-p.y);if(d<Math.min(bd,13)){bd=d;best={k:'ladder',h,x:cx,y:cy};}}
  for(const l of levers){if(l.used)continue;const cx=l.tx*TS+6,cy=l.ty*TS+6,d=Math.hypot(cx-p.x,cy-p.y);if(d<bd){bd=d;best={k:'lever',l,x:cx,y:cy};}}
  for(const c of chests){if(c.opened||(c.caged&&!c.caged.open))continue;const d=Math.hypot(c.x-p.x,c.y-p.y);if(d<bd){bd=d;best={k:'chest',c,x:c.x,y:c.y};}}
  for(const v of vendors){const cx=v.tx*TS+6,cy=v.ty*TS+8,d=Math.hypot(cx-p.x,cy-p.y);if(d<bd){bd=d;best={k:'vend',v,x:cx,y:cy};}}
  for(const pn of panels){if(!pn.hack||pn.state!=='idle')continue;const cx=pn.tx*TS+6,cy=pn.ty*TS+6,d=Math.hypot(cx-p.x,cy-p.y);if(d<bd){bd=d;best={k:'panel',pn,x:cx,y:cy};}}
  const tx=Math.floor(p.x/TS),ty=Math.floor(p.y/TS);
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=tx+dx,y=ty+dy;if(x<0||y<0||x>=MW||y>=MH)continue;
    if(map[y*MW+x]===2){const cx=x*TS+TS/2,cy=y*TS+TS/2,d=Math.hypot(cx-p.x,cy-p.y);if(d<bd){bd=d;best={k:'door',tx:x,ty:y,x:cx,y:cy};}}
    const md=modDoors.get(y*MW+x);if(md&&!md.broken){const cx=x*TS+TS/2,cy=y*TS+TS/2,d=Math.hypot(cx-p.x,cy-p.y);if(d<bd&&!(Math.floor(p.x/TS)===x&&Math.floor(p.y/TS)===y)){bd=d;best={k:'mdoor',tx:x,ty:y,x:cx,y:cy,md};}}}
  for(const f of fixtures){if(!(f.kind==='fountain'||f.kind==='closet'||f.kind==='stasis'&&!f.used||f.kind==='breaker'||f.kind==='liftdoor'||f.kind==='npc'||f.kind==='camera'||f.kind==='freezer'&&!f.used||f.kind==='locker'&&!f.used||f.kind==='medstation'&&!f.used||f.kind==='arcade'||f.kind==='dispenser'||f.kind==='grinder'||f.kind==='damper'||f.kind==='psychic'))continue;const cx=f.tx*TS+6,cy=f.ty*TS+(f.wall?8:6),d=Math.hypot(cx-p.x,cy-p.y)-(f.kind==='liftdoor'?14:0);if(d<bd){bd=d;best={k:'fix',f,x:cx,y:cy};}}
  return best;
}
function interact(){
  const it=findInteract();if(!it){const st=player.arms[player.armSet];if(st.off==='tank'&&fillTank())return;if(curGun())startReload(false);else if(st.off==='tank'){say('stand in water, oil or sludge to fill the tank, or carry a full flask');sfx('deny');}return;}
  if(it.k==='liftgo'){finishLevel();return;}
  if(it.k==='liftshut'){say(liftShutMsg());sfx('deny');return;}
  if(it.k==='testlift'){deckUI={sel:0};mouse.l=false;mouse.r=false;sfx('map');return;}
  if(it.k==='arcexit'){state='title';arcadeMode=false;return;}
  if(it.k==='crawl'){askCrawl(it.h);return;}
  if(it.k==='panel'){if(vaultPanelBlocked(it.pn))return;startHack(it.pn);return;}
  if(it.k==='mdoor'){const i=it.ty*MW+it.tx,m=map[i],inside=doorInside(it.md);
    if(m===0){map[i]=6;openDoor[i]=0;paintArea(it.tx,it.ty);sfx('door');flowT=0;return;}
    if(m===6){if(inside){map[i]=7;paintArea(it.tx,it.ty);sfx('click');say('door locked. nothing gets in');return;}map[i]=0;openDoor[i]=1;paintArea(it.tx,it.ty);sfx('door');flowT=0;return;}
    if(m===7){if(inside){map[i]=0;openDoor[i]=1;paintArea(it.tx,it.ty);sfx('door');flowT=0;return;}
      if(player.inv.key<=0){say('locked from the other side. a key or an explosion would do it');sfx('click');return;}player.inv.key--;map[i]=0;openDoor[i]=1;paintArea(it.tx,it.ty);sfx('door');flowT=0;if(lvl)lvl.doors++;return;}}
  if(it.k==='fix'){const f=it.f;
    if(f.kind==='locker'){f.used=true;sfx('door');const t=wpick([['food',3],['raw',1.5],['tuft',HERB_CFG.locker],['cloth',2],['scrap',2],['powder',1],['gear',0.7],['key',0.5],['emetic',0.5]]);const q={x:f.tx*TS+6,y:(f.ty+1)*TS+4,type:t,ph:0,pop:0.35};if(t==='gear')q.gear=randomGear();if(t==='tuft')q.tuft=randHerb();if(t==='food')q.food=randFood();if(t==='raw')q.raw=randRaw();items.push(q);return;}
    if(f.kind==='medstation'){f.used=true;if(cureInjury(false))say('the medstation sets your injury');player.hp=100;player.st.psn=0;player.st.rad=Math.max(0,player.st.rad-50);sfx('stim');say('the medstation patches you up. it powers down after');return;}
    if(f.kind==='stasis'){const P=player;f.used=true;const n=cureInjury(true);P.hp=maxHp();clearStatus();sfx('learn');say('the stasis pod hisses shut. you wake whole'+(n?', '+n+' injur'+(n>1?'ies':'y')+' mended':'')+'. the pod goes dark');return;}
    if(f.kind==='breaker'){openBreaker(f);return;}
    if(f.kind==='fountain'){const P=player;P.st.brn=0;P.st.wet=Math.min(100,P.st.wet+10);if(P.sat+3<=100)P.sat+=3;let fill='';if(P.flask&&P.flask.has&&(!P.flask.kind||P.flask.kind==='water')){P.flask.kind='water';P.flask.n=3;fill=' and top up your flask';}
      if(P.tank&&P.has.tank&&(!P.tank.kind||P.tank.kind==='water')){P.tank.kind='water';P.tank.n=TANKMAX;fill+=fill?' and tank':' and fill your tank';}sfx('slosh');say('you drink from the fountain'+fill);return;}
    if(f.kind==='closet'){const i=f.ty*MW+f.tx;map[i]=0;paintTile(f.tx,f.ty);fixtures=fixtures.filter(q=>q!==f);sfx('lift');say('the door slides open');return;}
    if(f.kind==='liftdoor'){openArrival(f);return;}
    if(f.kind==='npc'){openNpc(f);return;}
    if(f.kind==='camera'){openCamera(f);return;}
    if(f.kind==='freezer'){f.used=true;sfx('door');const n=1+rnd(2);for(let k=0;k<n;k++)items.push({x:f.tx*TS+6+rr(-3,3),y:(f.ty+1)*TS+4,type:'raw',raw:Math.random()<0.75?'frozen':'flour',ph:0,pop:0.35});
      if(Math.random()<0.45)items.push({x:f.tx*TS+6,y:(f.ty+1)*TS+6,type:'food',food:['meat','ration','paste'][rnd(3)],ph:0,pop:0.35});addStatus('frz',8);say('a breath of frost rolls out of the freezer');return;}
    if(f.kind==='damper'){openDamper(f);return;}
    if(f.kind==='psychic'){openPsychic(f);return;}
    if(f.kind==='grinder'){grindUI={f,sel:0,note:''};mouse.l=false;mouse.r=false;sfx('map');return;}
    if(f.kind==='dispenser'){player.inv.scrap+=10;sfx('pick');float(f.tx*TS+6,f.ty*TS+14,'+10 scrap','#e8dcb0');for(let k=0;k<6;k++)parts.push({x:f.tx*TS+6,y:f.ty*TS+12,vx:rr(-30,30),vy:rr(0,40),t:0.4,m:0.4,c:'#d9b45a',s:1});return;}
    if(f.kind==='arcade'){startArcade(f);return;}}
  if(it.k==='lift'){startAlarm();return;}
  if(it.k==='console'){spawnUI={sel:0,loc:spawnUI&&spawnUI.loc||'arena',alert:true,count:1,note:''};mouse.l=false;mouse.r=false;sfx('map');return;}
  if(it.k==='hatch'){const h=it.h;player.x=h.lx*TS+6;player.y=h.ly*TS+6;player.vx=player.vy=0;flowT=0;sfx('ladder');
    if(!h.found){h.found=true;if(lvl)lvl.secrets++;say('you drop through the hatch into a maintenance space');}return;}
  if(it.k==='ladder'){const h=it.h;player.x=h.tx*TS+6;player.y=h.ty*TS+6;player.vx=player.vy=0;flowT=0;sfx('ladder');return;}
  if(it.k==='lever'){pullLever(it.l);return;}
  if(it.k==='vend'){const v=it.v;if(v.state==='dead'){say('out of order. the screen just shows static');sfx('click');return;}
    if(!v.stock.some(o=>!o.sold)){say('sold out');sfx('click');return;}vendUI={v,sel:0,note:''};mouse.l=false;mouse.r=false;sfx('map');return;}
  if(player.inv.key<=0){say(it.k==='chest'?'the chest is locked. you need a key':'the door is locked. you need a key');sfx('click');return;}
  player.inv.key--;
  if(it.k==='chest')openChest(it.c);
  else{const i=it.ty*MW+it.tx;map[i]=0;openDoor[i]=1;paintArea(it.tx,it.ty);sfx('door');if(lvl)lvl.doors++;noise(it.x,it.y,60);flowT=0;say('the door grinds open');}
}
function pullLever(l){
  l.used=true;sfx('lever');shake=Math.max(shake,3);const bits=[];
  if(l.effect==='release'){const c=l.cage;c.open=true;for(const e of enemies)if(e.caged===c){e.caged=null;e.alert=true;}sfx('door');bits.push('the cage bars grind up. whatever was in there is out');}
  else if(l.effect==='flood'){floodRegion();bits.push('a valve gives. water floods part of the deck');}
  else if(l.effect==='anomaly'){const r=randomRoom();anoms.push({x:r.cx*TS+6,y:r.cy*TS+6,vx:rr(-14,14),vy:rr(-14,14),ph:0});bits.push('the air bends somewhere on the deck. a gravity anomaly');}
  else if(l.effect==='timer'){if(levelTimer<=0&&!purgeGas)levelTimer=90;sfx('alarm');bits.push('LOCKDOWN. purge gas in 90 seconds');}
  else if(l.effect==='horde'){const r=randomRoom();const n=2+rnd(2);for(let k=0;k<n;k++){const q=spotIn(r);if(q){const e=mkEnemy(pickType(),q.x,q.y);e.alert=true;enemies.push(e);}}bits.push('cell doors slam open somewhere nearby');}
  if(l.reward==='doors')bits.unshift(HACKR.doors.act());
  else if(l.reward==='map'){revealSchematic();bits.unshift('the deck map lights up');}
  else if(l.reward==='loot'){for(let k=0;k<3;k++){const t=lootRoll('common');const it={x:l.tx*TS+6+rr(-10,10),y:l.ty*TS+6+rr(-10,10),type:t,ph:0,pop:0.35};if(t==='gear')it.gear=randomGear();if(!blocked(it.x,it.y,2))items.push(it);}bits.unshift('a supply hatch pops open');}
  for(const b of bits)say(b);
}
function floodRegion(){
  const pool=rooms.slice(1);for(let n=0;n<2&&pool.length;n++){const r=pool.splice(rnd(pool.length),1)[0],R2=4+rnd(3);
    blob(r.cx,r.cy,R2,(i,x,y,d)=>{const v=(R2-d)/R2;const lv=v>0.5?3:v>0.2?2:(Math.random()<0.22?1:0);if(lv>liq[i]){liq[i]=lv;if(hz[i]===1)hz[i]=0;}});}
  for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++)if(liq[y*MW+x])paintTile(x,y);
  sfx('steam');
}
function startHack(pn){hackUI={pn,round:0,need:3,misses:0,pos:0,dir:1,flash:0,ok:0,barW:200};newHackWindow();mouse.l=false;mouse.r=false;sfx('map');}
function newHackWindow(){const h=hackUI;h.ww=Math.max(14,(46-h.round*10)*(1+S.hack))*(h.pn.hard?VAULT_CFG.hackMul:1);h.win=rr(0,h.barW-h.ww);h.speed=(130+h.round*55)*(1-S.hack*0.3);}
function hackTry(){const h=hackUI;if(!h)return;
  if(h.pos>=h.win&&h.pos<=h.win+h.ww){h.round++;h.ok=0.2;
    if(h.round>=h.need){const r=HACKR[h.pn.reward];h.pn.state='done';hackUI=null;sfx('hackwin');if(lvl)lvl.hacks++;say(r.act(h.pn));return;}
    sfx('hackok');newHackWindow();}
  else{h.misses++;h.flash=0.35;sfx('zap');alertAdd(perk('ductrat')?6:12);shake=Math.max(shake,5);hurtPlayer(9,true);addStatus('shk',30);
    if(!hackUI)return;
    if(h.misses>=2){h.pn.state='dead';hackUI=null;if(h.pn.reward==='traps')trapsSetOff(h.pn);else if(h.pn.reward==='vault')vaultFried(h.pn);else say('the panel shorts out in a shower of sparks');}}}
function updateHack(dt){const h=hackUI;h.pos+=h.dir*h.speed*dt;if(h.pos>h.barW){h.pos=h.barW;h.dir=-1;}if(h.pos<0){h.pos=0;h.dir=1;}h.flash-=dt;h.ok-=dt;}
function drawHack(){
  const h=hackUI,px=(W-240)/2|0,py=(H-96)/2|0;
  F('rgba(4,5,6,0.6)',0,0,W,H);
  box(px,py,240,96,'#070b0a','#1f3a36');F('#6fd0c0',px,py,240,2);
  txt('PANEL ACCESS',px+10,py+8,'#6fd0c0');txt(HACKR[h.pn.reward].label,px+230,py+8,AMBER,'right');
  txt('lock the signal inside the window. 3 locks to break in.',px+10,py+20,'#6f7a6a');
  const bx=px+20,by=py+38;F('#0e1614',bx,by,h.barW,14);
  for(let k=0;k<h.barW;k+=4)F(`rgba(100,200,190,${0.05+Math.random()*0.1})`,bx+k,by+rnd(14),1,1);
  F(h.ok>0?'#9fe0b0':'#2f6a4a',bx+h.win,by,h.ww,14);F('#6fd0a0',bx+h.win,by,h.ww,1);
  F('#ffffff',bx+Math.round(h.pos)-1,by-3,2,20);
  for(let k=0;k<h.need;k++){ctx.fillStyle=k<h.round?'#9fe0b0':'#1f3a36';circ(px+100+k*14,py+66,3);}
  for(let k=0;k<2;k++){F(k<h.misses?'#e05040':'#2a1512',px+178+k*12,py+63,8,6);}
  txt('R, SPACE or click to lock    ESC to back out',px+120,py+80,'#4f5a55','center');
  if(h.flash>0){F(`rgba(180,220,255,${h.flash*1.2})`,0,0,W,H);ctx.strokeStyle=`rgba(200,240,255,${h.flash*2})`;ctx.beginPath();let x=rnd(W),y=0;ctx.moveTo(x,y);
    while(y<H){x+=rr(-20,20);y+=rr(10,30);ctx.lineTo(x,y);}ctx.stroke();}
}
function lootRoll(tier){
  return tier==='rare'
    ?wpick([['gear',3],['chip',1.2],['secretmap',0.4],['schematic',0.6],['key',0.8],['rounds',1.5],['shells',1],['bolts',0.8],['battery',1],['pipe',1]])
    :wpick([['food',1],['gear',1],['chip',0.4],['schematic',0.5],['secretmap',0.2],['rounds',2],['shells',1.2],['nails',1],['powder',1.5],['pipe',1.2],['battery',1],['cloth',1],['medkit',1]]);
}
function openChest(c){
  c.opened=true;sfx('chest');if(lvl){if(c.tier==='rare')lvl.rare++;else lvl.chests++;}
  // contents come from the chest's own loot seed, set when the deck was generated
  withSeed(c.ls!=null?c.ls:(realRandom()*4294967296)>>>0,()=>{const n=(c.tier==='rare'?3:2)+rnd(2)+S.chestBonus;
  for(let i=0;i<n;i++){const t=lootRoll(c.tier);let x=c.x,y=c.y;
    for(let k=0;k<8;k++){const a=Math.random()*6.283,d=rr(8,15),nx=c.x+Math.cos(a)*d,ny=c.y+Math.sin(a)*d;if(!blocked(nx,ny,2)){x=nx;y=ny;break;}}
    const it={x,y,type:t,ph:0,pop:0.35};if(t==='gear'){const im=IMPLEMENTS.filter(k=>!player.has[k]);if(Math.random()<0.25&&im.length){it.type='weapon';it.w=im[rnd(im.length)];}else it.gear=randomGear();}if(t==='food')it.food=randFood();items.push(it);}});
  for(let i=0;i<12;i++)parts.push({x:c.x,y:c.y-3,vx:rr(-40,40),vy:rr(-70,-10),t:0.5,m:0.5,c:c.tier==='rare'?'#c9a8ff':'#ffd98a',s:1});
  lights.push({x:c.x,y:c.y,r:40,t:0.4,m:0.4,c:c.tier==='rare'?'190,150,255':'255,200,110'});
}
function revealSchematic(){
  for(let i=0;i<MW*MH;i++){if(kind[i]===3)continue;if(map[i]===0||map[i]===2){seen[i]=1;const x=i%MW,y=(i/MW)|0;
    for(const [dx,dy] of D8){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=MW||ny>=MH)continue;const n=ny*MW+nx;if(map[n]!==0&&kind[n]!==3)seen[n]=1;}}}
}
function revealSecrets(){
  for(const s of [...secrets,...ventRooms]){s.known=true;seen[s.ey*MW+s.ex]=1;
    for(let y=s.y-1;y<=s.y+s.h;y++)for(let x=s.x-1;x<=s.x+s.w;x++)seen[y*MW+x]=1;}
}
function markSecretsNear(x,y,rad){let found=0;for(const s of [...secrets,...ventRooms]){if(s.open||s.known)continue;
  if(Math.hypot(s.ex*TS+TS/2-x,s.ey*TS+TS/2-y)<rad){s.known=true;seen[s.ey*MW+s.ex]=1;found++;}}return found;}
function damageSecret(tx,ty,dmg){
  const i=ty*MW+tx;if(map[i]!==3)return;secretHp[i]-=dmg;sfx('thud');
  for(let k=0;k<4;k++)parts.push({x:tx*TS+TS/2+rr(-4,4),y:ty*TS+TS/2+rr(-4,4),vx:rr(-30,30),vy:rr(-30,30),t:0.4,m:0.4,c:'#5d6663',s:1});
  if(secretHp[i]<=0)destroySecret(tx,ty);
}
function destroySecret(tx,ty){
  const i=ty*MW+tx;if(map[i]!==3)return;map[i]=0;paintArea(tx,ty);sfx('crumble');shake=Math.max(shake,3);flowT=0;
  for(const s of secrets)if(s.ex===tx&&s.ey===ty){s.open=true;s.known=true;if(lvl)lvl.secrets++;}
  for(let k=0;k<22;k++)parts.push({x:tx*TS+TS/2,y:ty*TS+TS/2,vx:rr(-80,80),vy:rr(-80,80),t:rr(.4,1),m:1,c:k%2?'#4a5450':'#2e3533',s:rnd(2)+1});
  splat(tx*TS+TS/2,ty*TS+TS/2,'#2a302e',16,8);say('the wall gives way. a hidden room');
}
function useSkill(slot){
  if(!player.skills.length){say('no skills yet. training chips teach them');sfx('click');return;}
  const ix=slot===2?player.skillIdx2:player.skillIdx;if(ix<0||ix==null){say('nothing bound to '+(slot===2?'F':'E')+'. bind a skill on the Skills tab (K)');sfx('click');return;}
  const id=player.skills[ix];
  if(SKILLS[id].mode){const P=player;P.actMode=P.actMode===id?false:id;if(P.actMode){setHot(2);say((id==='sling'?'sling':'psych')+': your actions are on 3 and up. Q goes back to items');}sfx('sonar');return;}
  if((player.skillCd[id]||0)>0){say(SKILLS[id].name.toLowerCase()+' is recharging');sfx('click');return;}
  player.skillCd[id]=SKILLS[id].cd*mindCd();
  if(id==='sonar'){sonarT=4;sonarRing=0;sfx('sonar');const f=markSecretsNear(player.x,player.y,200),tp=revealTraps(player.x,player.y,TRAP_CFG.sonarR);if(f)say('the pulse finds a hollow wall');else if(tp)say('the pulse picks out '+(tp>1?tp+' pressure plates':'a pressure plate'));}
  else if(id==='adren'){player.adrenT=5;sfx('adren');}
  else if(id==='cloak'){player.cloakT=6;sfx('cloak');for(const e of enemies)if(!ET[e.type].dummy)e.alert=false;
    for(let k=0;k<16;k++){const a=k/16*6.283;parts.push({x:player.x,y:player.y,vx:Math.cos(a)*50,vy:Math.sin(a)*50,t:0.35,m:0.35,c:'#9fc3ff',s:1});}}
  else if(id==='slam'){sfx('slam');shake=Math.max(shake,6);noise(player.x,player.y,140);
    for(const e of enemies){const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy);if(d<38+e.r)damageEnemy(e,2,dx,dy,e.type==='brute'?120:280);}
    const tx=Math.floor(player.x/TS),ty=Math.floor(player.y/TS);
    for(let y=ty-3;y<=ty+3;y++)for(let x=tx-3;x<=tx+3;x++)if(x>=0&&y>=0&&x<MW&&y<MH&&map[y*MW+x]===3&&Math.hypot(x*TS+6-player.x,y*TS+6-player.y)<38)destroySecret(x,y);
    for(let k=0;k<30;k++){const a=k/30*6.283;parts.push({x:player.x,y:player.y,vx:Math.cos(a)*140,vy:Math.sin(a)*140,t:0.3,m:0.3,c:'#8e978b',s:1});}}
}
let newSeen=0,alertM=0,alertWaves=0,runAlertWaves=0,alertCarry=false,alertRumble=false;
function alertOn(){return depth>=3&&!stopMode&&!arcadeMode&&!(testMode&&!testDeck)&&state==='play';}
let alertLock=false;
function alertMul(){return 1-(perk('lowprofile')?0.2:0)-(perk('ductrat')?0.2:0)-(perk('quietmind')?0.15:0);}
function alertAdd(v){if(!alertOn()||alertLock||sageCalm())return;alertM+=v*alertMul();}
function updateAlert(dt){if(!alertOn()||alertLock||sageCalm()){newSeen=0;return;}alertM+=newSeen*0.045*alertMul()/AREA;newSeen=0;
  if(alertM>=75&&!alertRumble){alertRumble=true;say('something far below is starting to stir');sfx('hiss');}
  if(alertM>=100){alertM=0;alertRumble=false;alertWaves++;runAlertWaves++;
    const cnt=3+Math.floor(depth/3)+alertWaves,p=player,far=rooms.filter(r=>Math.hypot(r.cx*TS-p.x,r.cy*TS-p.y)>100);
    for(let k=0;k<cnt;k++){const r=(far.length?far:rooms)[rnd(far.length||rooms.length)];queueSpawn({tx:r.cx,ty:r.cy});}
    say(alertWaves===1?'your noise has drawn something up from below':'they keep coming. wave '+alertWaves+' drawn this deck');sfx('alarm');shake=Math.max(shake,4);
    if(alertWaves>=2&&Math.random()<(alertWaves>=3?0.6:0.35))envShift();}}
function envShift(){const opts=['flood','anomaly','blackout'];if(!(cond&&cond.lowg))opts.push('lowgrav','lowgrav');const k=opts[rnd(opts.length)];shake=Math.max(shake,6);
  if(k==='lowgrav'){cond.lowg=true;setTimeout(()=>say('the gravity plates stutter and fail. everything feels light'),30);}
  else if(k==='flood'){let n=0;const rs=rooms.slice().sort(()=>Math.random()-0.5).slice(0,2+rnd(2));for(const r of rs)for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){const i=y*MW+x;if(map[i]!==0||chasm[i]||liq[i]>=2||hz[i])continue;liq[i]=Math.random()<0.6?1:2;paintTile(x,y);n++;}
    setTimeout(()=>say('pipes burst somewhere below. water spreads across the deck'),30);}
  else if(k==='anomaly'){for(let j=0;j<2+rnd(2);j++){const r=randomRoom(),t=freeTile(r);if(t)anoms.push({x:t.tx*TS+6,y:t.ty*TS+6,vx:rr(-14,14),vy:rr(-14,14),ph:Math.random()*6});}setTimeout(()=>say('the air bends. gravity anomalies tear open on this deck'),30);}
  else{const big=rooms.filter(r=>!r.dark&&r.w*r.h>=20).sort(()=>Math.random()-0.5).slice(0,2);for(const r of big){r.dark=true;r.warned=false;}setTimeout(()=>say('the lights die in part of the deck'),30);}}
function noise(x,y,rad){if(rad>=200)alertAdd((rad-180)/18);for(const e of enemies){const dd=Math.hypot(e.x-x,e.y-y);if(dd>=rad||dd>=noiseReach(e,x,y,rad))continue;if(!e.alert)e.huntT=TRACK_CFG.noise;else e.huntT=Math.max(e.huntT||0,TRACK_CFG.noise);e.alert=true;}}
function damageEnemy(e,dmg,dx,dy,kb,quiet){if(e&&e.hexT>0)dmg*=1.35;if(e)dmg*=frozenEnemyMul(e);if(runMods.glass)dmg*=1.4;
  if(e.dead)return;if(ET[e.type].ghost&&!ghostOK)return;
  if(e.caged&&!e.caged.open){for(let i=0;i<2;i++)parts.push({x:e.x+rr(-4,4),y:e.y+rr(-4,4),vx:rr(-30,30),vy:rr(-30,30),t:0.15,m:0.15,c:'#ffe7a0',s:1});return;}
  if(ET[e.type].armor&&!quiet&&kb<200){dmg*=e.shellT>0?0.1:ET[e.type].armor;e.shellT=1.2;e.flash=0.05;
    for(let i=0;i<3;i++)parts.push({x:e.x+rr(-3,3),y:e.y+rr(-3,3),vx:rr(-50,50),vy:rr(-50,50),t:0.15,m:0.15,c:'#e8e0c0',s:1});}
  if(ET[e.type].dummy){e.flash=0.08;e.log.push({t:T,d:dmg});const l0=Math.hypot(dx,dy)||1;e.vx+=dx/l0*kb*0.3;e.vy+=dy/l0*kb*0.3;
    texts.push({x:e.x+rr(-4,4),y:e.y-6,s:''+Math.round(dmg*10)/10,col:'#ffd98a',t:0.8});sfx('hit');return;}e.hp-=dmg;e.flash=0.08;e.alert=true;const l=Math.hypot(dx,dy)||1;e.vx+=dx/l*kb;e.vy+=dy/l*kb;if(kb>0)e.kbT=0.45;
  if(!quiet){for(let i=0;i<3;i++)parts.push({x:e.x,y:e.y,vx:dx/l*rr(20,80)+rr(-30,30),vy:dy/l*rr(20,80)+rr(-30,30),t:0.35,m:0.35,c:'#39472a',s:1});sfx('hit');}
  if(!ET[e.type].dummy&&player&&player.rs)player.rs.dealt=(player.rs.dealt||0)+Math.max(0,dmg);
  if(e.hp<=0&&ET[e.type].warden&&e.mini){bossRef=null;const ks=Object.keys(SUBS);items.push({x:e.x,y:e.y,type:'tonic',sub:ks[rnd(ks.length)],ph:0,pop:0.3});items.push({x:e.x-8,y:e.y,type:'scrap',amt:6,ph:0,pop:0.3});say('the arena\'s '+BOSSES[e.boss||0].name.toLowerCase()+' is down');sfx('hackwin');shake=8;}
  else if(e.hp<=0&&ET[e.type].warden){const B=BOSSES[e.boss||0];if(!testMode){META.hunters=(META.hunters||0)+1;saveMeta();}if(route)route.chaser=null;bossRef=null;items.push({x:e.x,y:e.y,type:'sigil',core:['body','spirit','mind'][rnd(3)],ph:0,pop:0.3});{const ks=Object.keys(SUBS);items.push({x:e.x+8,y:e.y,type:'tonic',sub:ks[rnd(ks.length)],ph:0,pop:0.3});}items.push({x:e.x-8,y:e.y,type:'scrap',amt:10,ph:0,pop:0.3});say('the '+B.name.toLowerCase()+' is dead. it will not follow you any more');sfx('hackwin');shake=10;}
  if(e.hp<=0){e.dead=true;kills++;{const big=e.type==='brute'||e.type==='charger'||e.type==='grasper';if(big&&Math.random()<0.07){const ks=Object.keys(SUBS);items.push({x:e.x,y:e.y,type:'tonic',sub:ks[rnd(ks.length)],ph:0,pop:0.3});}if(big&&Math.random()<0.015)items.push({x:e.x,y:e.y,type:'sigil',core:['body','spirit','mind'][rnd(3)],ph:0,pop:0.3});}if((['snake','lurker','grasper','arcsnake'].includes(e.type)&&Math.random()<0.4)||(['slug','toxslug','snail'].includes(e.type)&&Math.random()<0.25)){let dx=e.x,dy=e.y;if(solidAt(dx,dy)||liqAt(dx,dy)===4){dx=player.x;dy=player.y;}items.push({x:dx,y:dy,type:'raw',raw:e.type.includes('slug')||e.type==='snail'?'grubs':'fillet',ph:0,pop:0.3});}if(player.grabbedBy===e)player.grabbedBy=null;if(e.carrier){items.push({x:e.x,y:e.y,type:'liftcard',ph:0,pop:0.35});say('it was carrying the lift keycard');}if(lvl){lvl.kills++;lvl.killPts+=KILLPTS[e.type]||0;}if(bestiary&&!ET[e.type].dummy){bestiary.kills[e.type]=(bestiary.kills[e.type]||0)+1;if(!bestiary.seen[e.type])bestiary.seen[e.type]=depth;}splat(e.x,e.y,'#1c2515',14+e.r*3,e.r+5);splat(e.x,e.y,'#2b3a1f',6,e.r);
    for(let i=0;i<10;i++)parts.push({x:e.x,y:e.y,vx:rr(-70,70),vy:rr(-70,70),t:0.5,m:0.5,c:i%2?'#2b3a1f':ET[e.type].col,s:rnd(2)+1});
    if(Math.random()<0.3+S.luck){const t=wpick([['rounds',3],['scrap',2],['powder',1],['cloth',1],['key',0.25],['routechart',0.12],['shells',depth>=2?1:0],['nails',player.has.nailer?1.5:0]]);items.push({x:e.x,y:e.y,type:t,ph:0});}}
}
function addStatus(k,a,src){const p=player,s=p.st;if(state!=='play'||!s)return;if(k!=='wet')a*=Math.max(0.3,1-0.08*U('resil')-0.05*coreLv('spirit')-0.05*subPts('resolve'));
  if(k==='shk')a*=(s.wet>30?1.6:1)*(1-S.shockRes);
  if(k==='psn')a*=(1-S.poisonRes);
  if(k==='frz'){if(p.frozenT>0||S.coldImm>0||inEmber(p.x,p.y))return;if(s.brn>0){s.brn=Math.max(0,s.brn-a);return;}if(s.wet>30)a*=1.4;if((s.frz||0)+a>=100){if(p.frzImm>0){s.frz=99;return;}freezePlayer();return;}}
  if(k==='brn'){frozenFireHit();a*=1+(s.slk||0)/100;if(s.wet>30)a*=0.3;if(s.frz>0)s.frz=Math.max(0,s.frz-a);if(liqAt(p.x,p.y)>=2)return;if(s.brn<100&&s.brn+a>=100){float(p.x,p.y-6,'ablaze','#ff8a3a');say('you are on fire. find water or dash to roll it out');}}
  if(k==='stn'){if(p.dazeT>0||p.stnImm>0)return;a*=(1-S.stunRes);}
  s[k]=Math.min(100,s[k]+a);
  if(k==='stn'&&s.stn>=100){s.stn=0;p.dazeT=1;p.stnImm=2.5;sfx('thud');shake=Math.max(shake,5);
    if(src){const dx=p.x-src.x,dy=p.y-src.y,l=Math.hypot(dx,dy)||1;p.vx+=dx/l*260;p.vy+=dy/l*260;p.kbT=0.5;}float(p.x,p.y-6,'dazed','#e8dcb0');}}
function updateStatus(dt){const p=player,s=p.st;p.dazeT-=dt;p.stnImm-=dt;updatePlayerCold(dt);
  const l=p.floating?0:liqAt(p.x,p.y);
  if(l===3)s.wet=100;else if(l===2)s.wet=Math.min(100,s.wet+70*dt);else if(l===1&&s.wet<60)s.wet=Math.min(60,s.wet+20*dt);else if(l===0)s.wet=Math.max(0,s.wet-7*dt);
  if(s.wet>20&&Math.random()<s.wet/100*dt*8)parts.push({x:p.x+rr(-3,3),y:p.y+2,vx:0,vy:rr(10,25),t:0.3,m:0.3,c:'#6fb3c3',s:1});
  if(s.psn>0){s.psn=Math.max(0,s.psn-5*dt);p.psnAcc=(p.psnAcc||0)+s.psn/100*4*dt;while(p.psnAcc>=1){p.psnAcc-=1;hurtPlayer(1,true);}
    if(Math.random()<s.psn/100*dt*6)parts.push({x:p.x+rr(-3,3),y:p.y-2,vx:rr(-4,4),vy:rr(-18,-8),t:0.5,m:0.5,c:'#8fcf40',s:1});}
  if(s.shk>0){s.shk=Math.max(0,s.shk-9*dt);if(Math.random()<s.shk/100*1.6*dt){hurtPlayer(1.5,true);p.shockT=Math.max(p.shockT||0,0.2);shake=Math.max(shake,2);sfx('crackle');
      for(let k=0;k<5;k++)parts.push({x:p.x+rr(-4,4),y:p.y+rr(-4,4),vx:rr(-40,40),vy:rr(-40,40),t:0.2,m:0.2,c:Math.random()<.5?'#e0f0ff':'#6fa8ff',s:1});}
    if(s.shk>25&&Math.random()<dt*5)parts.push({x:p.x+rr(-4,4),y:p.y+rr(-4,4),vx:0,vy:0,t:0.1,m:0.1,c:'#cfe6ff',s:1});}
  if(p.dazeT<=0)s.stn=Math.max(0,s.stn-14*dt);
  if(s.brn>0){
    if(l>=2){s.brn=0;sfx('hiss');for(let k=0;k<8;k++)parts.push({x:p.x+rr(-4,4),y:p.y,vx:rr(-10,10),vy:rr(-35,-15),t:0.6,m:0.6,c:'#dfe4e2',s:2});}
    else if(l===1)s.brn=Math.max(0,s.brn-60*dt);
    else if(s.brn<100){const spd=Math.hypot(p.vx,p.vy);s.brn=Math.max(0,s.brn-(8+spd/70*14)*dt);}
    if(s.wet>30&&s.brn>0)s.brn=Math.max(0,s.brn-40*dt);
    p.brnAcc=(p.brnAcc||0)+s.brn/100*5*dt;while(p.brnAcc>=1){p.brnAcc-=1;hurtPlayer(1,true);}
    const n=s.brn>=100?3:s.brn>50?2:1;for(let k=0;k<n;k++)if(Math.random()<0.7)parts.push({x:p.x+rr(-4,4),y:p.y+rr(-3,2),vx:rr(-8,8),vy:rr(-45,-20),t:0.35,m:0.35,c:Math.random()<.5?'#ff8a2a':'#ffd060',s:1});}
  if(s.rad>=90&&p.sat>0&&p.vomitCd<=0){p.vomitCd=20;vomit('the radiation turns your stomach. everything comes back up');}
  if(s.rad>0){s.rad=Math.max(0,s.rad-3*dt);p.radAcc=(p.radAcc||0)+s.rad/100*3*dt;while(p.radAcc>=1){p.radAcc-=1;hurtPlayer(1,true);}
    if(Math.random()<s.rad/100*dt*5)parts.push({x:p.x+rr(-5,5),y:p.y+rr(-5,5),vx:0,vy:0,t:0.25,m:0.25,c:'#c9a8ff',s:1});}
  {const oi=Math.floor(p.y/TS)*MW+Math.floor(p.x/TS);
    if(s.frz>0)s.frz=Math.max(0,s.frz-10*dt);
    if(oil[oi]&&!(p.dashT>0)){s.slk=Math.min(100,(s.slk||0)+120*dt);if(Math.random()<dt*3)parts.push({x:p.x+rr(-3,3),y:p.y+3,vx:rr(-10,10),vy:0,t:0.3,m:0.3,c:'#3a3020',s:1});}
    else s.slk=Math.max(0,(s.slk||0)-(l>=2?60:18)*dt);}
  const ti=Math.floor(p.y/TS)*MW+Math.floor(p.x/TS);
  if(slime[ti]&&!(p.dashT>0)){p.slimeWear=(p.slimeWear||0)+Math.hypot(p.vx,p.vy)*dt;if(p.slimeWear>=16){p.slimeWear=0;slime[ti]--;for(let k=0;k<2;k++)parts.push({x:p.x+rr(-3,3),y:p.y+3,vx:rr(-15,15),vy:rr(-10,5),t:0.3,m:0.3,c:slimeK[ti]===2?'#a0e040':'#c8d070',s:1});}}else p.slimeWear=0;
  if(ti!==p.lastTile){p.lastTile=ti;if(slime[ti]&&!(p.dashT>0)){slime[ti]--;for(let k=0;k<3;k++)parts.push({x:p.x+rr(-3,3),y:p.y+3,vx:rr(-15,15),vy:rr(-10,5),t:0.3,m:0.3,c:slimeK[ti]===2?'#a0e040':'#c8d070',s:1});}}
  if(slime[ti]&&!(p.dashT>0)&&!p.floating){s.stk=Math.min(100,(s.stk||0)+(slimeK[ti]===2?50:90)*dt);if(slimeK[ti]===2)addStatus('psn',25*dt);}
  else s.stk=Math.max(0,(s.stk||0)-(l>=2?60:25)*dt);
}
function clearStatus(){const p=player;p.st={psn:0,shk:0,stn:0,wet:0,stk:0,brn:0,rad:0,slk:0,frz:0};p.brnAcc=0;p.radAcc=0;p.dazeT=0;p.stnImm=0;p.psnAcc=0;}
function hurtPlayer(d,quiet,src){
  if(player&&state==='play'&&!(player.iframeT>0)&&!testMode||player&&testDeck){const P=player,st=P.st||{},cause=st.brn>=100?'burn':st.shk>=100?'nerve':st.psn>=100?'blood':st.frz>=100?'frost':null;
    if(P.hp<maxHp()*0.25||cause){P.injAcc=(P.injAcc||0)+d;if(P.injAcc>=30){P.injAcc=0;if(Math.random()<0.6)giveInjury(cause);}}}
  if(player&&player.astral&&!quiet)endAstral('your body is hit. you snap back');
  if(state!=='play'||player.iframeT>0)return;if(!quiet||src){comboBreak();player.lastHitT=T;}d*=frozenMeleeMul(src);d*=1-S.dr;d*=1-0.05*U('tough');
  if(perk('secondwind')&&!player.windUsed&&player.hp-d<20&&player.hp-d>0){player.windUsed=true;setTimeout(()=>{if(state==='play'){player.hp=Math.min(maxHp(),player.hp+30);float(player.x,player.y-10,'second wind','#9fe0b0');sfx('learn');}},0);}
  if(!quiet){const p=player;
    if(p.blocking&&p.guard>0&&(!src||Math.abs(angDiff(Math.atan2(src.y-p.y,src.x-p.x),p.ang))<1.3)){const a=Math.min(p.guard,d);p.guard-=a;d-=a;p.guardDelay=1;sfx('thud');
      for(let k=0;k<4;k++)parts.push({x:p.x+Math.cos(p.ang)*6,y:p.y+Math.sin(p.ang)*6,vx:rr(-40,40),vy:rr(-40,40),t:0.2,m:0.2,c:'#bfe4ff',s:1});}
    if(d>0&&p.ward>0){const a=Math.min(p.ward,d);p.ward-=a;d-=a;p.wardDelay=1.5;}
    if(d<=0)return;}
  const a=Math.min(player.armor,d*0.6);player.armor-=a;let rest=d-a;if(player.ghost>0){const g=Math.min(player.ghost,rest);player.ghost-=g;rest-=g;if(g>0)for(let k=0;k<3;k++)parts.push({x:player.x,y:player.y,vx:rr(-30,30),vy:rr(-40,-10),t:0.4,m:0.4,c:'#dfe8ff',s:1});}player.hp-=rest;if(lvl)lvl.dmg+=d;
  if(!quiet)breakCloak();
  if(!quiet&&player.st){addStatus('stn',d*2.2,src);if(src&&player.dazeT<=0){const dx=player.x-src.x,dy=player.y-src.y,l=Math.hypot(dx,dy)||1;player.vx+=dx/l*70;player.vy+=dy/l*70;player.kbT=0.4;}}player.hurtT=quiet?Math.max(player.hurtT,0.15):0.35;if(!quiet){shake=Math.max(shake,4);sfx('hurt');}else if(Math.random()<.3)sfx('hurt');
  splat(player.x,player.y,'#3a1714',4,5);
  if(player.hp<=0){player.hp=0;hackUI=null;vendUI=null;saveBest();clearSave();for(const k in bestiary.seen)META.seen[k]=1;saveMeta();state='dead';deadT=0;menuOpen=false;mapOpen=false;mouse.l=false;mouse.r=false;sfx('die');}
}
function explode(x,y){puff(x,y,'smoke',16);
  const Rr=46;sfx('boom');shake=Math.max(shake,9);noise(x,y,320);
  lights.push({x,y,r:120,t:0.3,m:0.3,c:'255,150,60'});
  for(let i=0;i<40;i++){const a=Math.random()*6.283,s=rr(30,200);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:rr(.2,.7),m:.7,c:i%3?'#f0a040':'#ffe2a0',s:rnd(2)+1});}
  for(let i=0;i<16;i++){const a=Math.random()*6.283,s=rr(10,40);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:1.2,m:1.2,c:'#3a3d3b',s:3});}
  archiveBlast(x,y,Rr);splat(x,y,'#0b0d0c',50,Rr*0.5);clearSlimeAround(x,y,Rr);igniteOilAround(x,y,Rr);for(const pl of plants)if(!pl.burst&&Math.hypot(pl.x-x,pl.y-y)<Rr)burstPlant(pl);for(const f of fans)if(!f.dead&&Math.hypot(f.x-x,f.y-y)<Rr)hitFan(f,99);{const tx0=Math.floor(x/TS),ty0=Math.floor(y/TS);for(let yy=ty0-4;yy<=ty0+4;yy++)for(let xx=tx0-4;xx<=tx0+4;xx++)if(xx>=0&&yy>=0&&xx<MW&&yy<MH&&Math.hypot(xx*TS+6-x,yy*TS+6-y)<Rr)ice[yy*MW+xx]=0;}
  for(const c of cores)if(!c.dead&&Math.hypot(c.x-x,c.y-y)<Rr+6)hitCore(c,18);
  for(const bb of barrels)if(!bb.dead&&Math.hypot(bb.x-x,bb.y-y)<Rr+4){if(bb.crate){pushBarrel(bb,bb.x-x,bb.y-y,260);breakCrate(bb);continue;}bb.fuse=bb.fuse>=0?Math.min(bb.fuse,0.15):0.15;pushBarrel(bb,bb.x-x,bb.y-y,260);}
  for(const e of enemies){const d=Math.hypot(e.x-x,e.y-y);if(d<Rr+e.r&&hasLOS(x,y,e.x,e.y))damageEnemy(e,16*(perk('boom')?1.25:1)*(1-d/(Rr+e.r)*0.5),e.x-x,e.y-y,220);}
  const tx=Math.floor(x/TS),ty=Math.floor(y/TS);
  for(let yy=ty-5;yy<=ty+5;yy++)for(let xx=tx-5;xx<=tx+5;xx++)if(xx>=0&&yy>=0&&xx<MW&&yy<MH&&(map[yy*MW+xx]===6||map[yy*MW+xx]===7)&&Math.hypot(xx*TS+6-x,yy*TS+6-y)<Rr+6)blowModDoor(yy*MW+xx);
  for(let yy=ty-5;yy<=ty+5;yy++)for(let xx=tx-5;xx<=tx+5;xx++)
    if(xx>=0&&yy>=0&&xx<MW&&yy<MH&&map[yy*MW+xx]===3&&Math.hypot(xx*TS+6-x,yy*TS+6-y)<Rr+6)destroySecret(xx,yy);
  const pd=Math.hypot(player.x-x,player.y-y);if(pd<Rr&&hasLOS(x,y,player.x,player.y)){{const l=pd||1,f=260*(1-pd/Rr);player.vx+=(player.x-x)/l*f;player.vy+=(player.y-y)/l*f;player.kbT=0.5;}hurtPlayer(22*(1-pd/Rr)*(player.st.wet>30?0.7:1)*(perk('blastplate')?0.5:1)*(player.blastDrill?0.5:1),false,{x,y});addStatus('stn',25,{x,y});addStatus('brn',30*(1-pd/Rr));}
}

