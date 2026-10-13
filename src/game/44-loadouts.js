// ---------- armed humans (v1.04, batch 4 request 21) ----------
// Guards, riot guards and some husks carry a kit from LOADOUTS (src/data/loadouts.js), rolled by rollKit() at the end of
// mkEnemy(), so kits on generated creatures repeat on the same seed. e.kit {main, armor, head, quick, launcher, gun};
// gun kits also keep e.mag (rounds in the magazine), e.reserve (spare rounds) and e.reloadT; e.dry once both run out.
// The guard branch and the generic (husk) path in the enemy loop hand their attacks to kitAttack()/kitFire()/kitMelee();
// kitPre() runs the quick items. Armour sets e.dr (damageEnemy) and adds glance chance; a gas mask sets e.mask.
function rollKit(e){const L=LOADOUTS[e.type];if(!L)return e;if(L.chance<1&&Math.random()>=L.chance)return e;let band=L.bands[0];for(const b of L.bands)if(depth>=b.from)band=b;
  setKit(e,wpick(band.kits.map(([w,k])=>[k,w])));return e;}
function setKit(e,k){const C=LOADOUT_CFG;delete e.kit;e.dr=0;e.mask=false;e.dry=false;e.reloadT=0;e.qUsed=false;e.mhp=e.mhp||e.hp;e.spd=e.baseSpd||(e.baseSpd=e.spd);if(!k)return e;
  e.kit=Object.assign({},k);const w=k.main;
  if(WPN[w]&&MAGS[w]){e.kit.gun=true;const cap=MAGS[w][0];e.mag=cap;e.reserve=cap*(C.reserve[0]+rnd(C.reserve[1]-C.reserve[0]+1));}
  if(k.armor&&GEAR[k.armor]){e.dr=(GEAR[k.armor].dr||0)*C.drMul;e.spd*=C.armorSpd[k.armor]||1;}
  if(k.head)e.mask=true;return e;}
const masked=e=>!!(ET[e.type].mask||e.mask);
// --- guns: magazine, plain-view reloads, and a pistol-whip once there is nothing left
// kit attacks keep their own timer (e.kcd): the guard branch runs e.cd down twice a frame
function kitTick(e,dt){if(e.swingT>0)e.swingT-=dt;if(e.kcd>0)e.kcd-=dt;if(!(e.reloadT>0))return;e.reloadT-=dt;if(e.reloadT<=0){const cap=MAGS[e.kit.main][0],take=Math.min(cap,e.reserve);e.mag=take;e.reserve-=take;e.reloadT=0;}}
function kitFire(e,tx,ty){const C=LOADOUT_CFG,k=e.kit,w=WPN[k.main];if(e.reloadT>0||e.dry)return false;
  if(e.mag<=0){if(e.reserve>0){e.reloadT=MAGS[k.main][1]*C.reloadMul;if(seen[tileIdx(e)])float(e.x,e.y-9,'reloading','#e8dcb0');sfx('click');}else{e.dry=true;if(seen[tileIdx(e)])float(e.x,e.y-9,'out of ammo','#e8dcb0');}return true;}
  const cd=w.cd*(C.cdMul[k.main]||3),per=C.gunDps*(C.gunDpsMul[k.main]||1)*cd/(w.pellets||1),base=Math.atan2(ty-e.y,tx-e.x),sp=w.spread*C.spreadMul+C.spreadAdd,v=Math.max(C.minSpeed,w.speed*C.speedMul);
  e.kcd=cd*rr(0.9,1.1);e.mag--;e.look=base;
  for(let i=0;i<(w.pellets||1);i++){const a=base+rr(-sp,sp);bullets.push({x:e.x,y:e.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1.4,dmg:per,p:false,src:e,slug:true,kitGun:k.main});}
  sfx(w.sfx||'shot');noise(e.x,e.y,(w.noise||120)*0.8);return true;}
function kitMeleeStats(e){const C=LOADOUT_CFG,k=e.kit;if(!k)return null;if(k.gun)return e.dry?{dmg:C.whip.dmg,cd:C.whip.cd,reach:C.whip.reach}:null;
  const A=ARM[k.main]&&ARM[k.main].melee;if(!A)return null;return {dmg:A.dmg*C.melee.dmgMul,cd:A.cd*C.melee.cdMul,reach:A.range*C.melee.reachMul};}
// one melee swing at the player or a creature target when it is in reach; returns true if it swung
function kitMelee(e,t,d){const M=kitMeleeStats(e);if(!M)return false;if(e.kcd>0||d>e.r+(t.r||player.r)+3+M.reach)return false;e.kcd=M.cd*rr(0.9,1.1);
  if(t===player)hurtPlayer(M.dmg,false,e);else damageEnemy(t,M.dmg*0.5,t.x-e.x,t.y-e.y,60);sfx('thud');e.swingT=0.15;return true;}
// how far a kitted guard wants to stand: melee kits and dry guns close in
function kitWant(e,td){const M=kitMeleeStats(e);if(!M)return null;return td>e.r+player.r+M.reach?1:0;}
// quick items: medkit (back off, then heal once), smoke grenade (losing and seen), flare (dark deck, hunting blind).
// Returns true while the creature is busy (its AI is skipped).
function kitPre(e,b,dt,d){const C=LOADOUT_CFG,k=e.kit,p=player;if(!k)return false;kitTick(e,dt);
  if(e.medT>0){e.medT-=dt;const l=d||1;move(e,-(p.x-e.x)/l*e.spd*dt,-(p.y-e.y)/l*e.spd*dt);e.walk=(e.walk||0)+dt*6;
    if(e.medT<=0){e.hp=Math.min(e.mhp,e.hp+e.mhp*C.medHeal);if(seen[tileIdx(e)])float(e.x,e.y-9,'patches up','#7fd08e');sfx('stim');}return true;}
  if(e.qUsed||!k.quick)return false;
  if(k.quick==='medkit'&&e.hp<e.mhp*C.medAt){e.qUsed=true;e.medT=C.medBack;return true;}
  if(k.quick==='smokenade'&&e.hp<e.mhp*C.smokeAt&&d<C.smokeRange&&seesPlayer(e)){e.qUsed=true;const mx=(e.x+p.x)/2,my=(e.y+p.y)/2,dx=mx-e.x,dy=my-e.y,l=Math.hypot(dx,dy)||1;
    nades.push({x:e.x,y:e.y,vx:dx/l*150,vy:dy/l*150,t:l/150,kind:'smokenade',spin:0,by:e});sfx('whoosh');if(seen[tileIdx(e)])float(e.x,e.y-9,'smoke!','#a8acb0');return false;}
  if(k.quick==='flare'&&e.alert&&(cond.light==='dark'||powerOff)&&!seesPlayer(e)){e.qUsed=true;const a=Math.atan2(p.y-e.y,p.x-e.x);
    flares.push({x:e.x,y:e.y,vx:Math.cos(a)*120,vy:Math.sin(a)*120,t:14,ph:Math.random()*6,pts:null,r:FLARE_R});sfx('whoosh');}
  return false;}
// drops: the weapon always (guns keep what is left in the magazine), other pieces by LOADOUT_CFG.dropP
function dropKit(e){const C=LOADOUT_CFG,k=e.kit;if(!k)return;const at=(i)=>({x:e.x+rr(-6,6),y:e.y+rr(-6,6),ph:0,pop:0.3});
  if(ARM[k.main])items.push(Object.assign(at(),{type:'weapon',w:k.main},k.gun?{mag:Math.max(0,e.mag||0)}:{}));
  if(k.armor&&Math.random()<C.dropP.armor)items.push(Object.assign(at(),{type:'gear',gear:k.armor}));
  if(k.head&&Math.random()<C.dropP.head)items.push(Object.assign(at(),{type:'gear',gear:k.head}));
  if(k.quick&&!e.qUsed&&Math.random()<C.dropP.quick)items.push(Object.assign(at(),{type:k.quick}));}
// V-look and the console: "smg (12 rounds), work vest, gas mask, medkit"
function kitText(e){const k=e.kit;if(!k)return '';const L=[];const A=ARM[k.main];
  if(A)L.push(A.name.toLowerCase()+(k.gun?' ('+(e.reloadT>0?'reloading':e.dry?'empty':(e.mag||0)+' rounds')+')':''));
  if(k.launcher)L.push('canister launcher');if(k.armor)L.push(GEAR[k.armor].name.toLowerCase());if(k.head)L.push('gas mask');if(k.quick&&!e.qUsed)L.push(QUICK[k.quick]?QUICK[k.quick].name.toLowerCase():k.quick);return L.join(', ');}
// drawn over the creature: the held weapon, darker shoulders for armour, a mask
const KIT_COL={crowbar:'#8a9298',bat:'#7a5a32',cutter:'#c8ccc4',chainsaw:'#c8a040'};
function drawKit(e){const k=e.kit,x=Math.round(e.x-camX),y=Math.round(e.y-camY),p=player;
  const a0=e.look!=null&&ET[e.type].guard?e.look:Math.atan2(p.y-e.y,p.x-e.x),a=a0+(e.reloadT>0?0.9:0),ca=Math.cos(a),sa=Math.sin(a),px=-sa,py=ca;
  if(k.armor){const c=k.armor==='platerig'?'#1a1e22':'#2a3026';F(c,Math.round(x+px*e.r*0.8)-1,Math.round(y+py*e.r*0.8)-1,2,2);F(c,Math.round(x-px*e.r*0.8)-1,Math.round(y-py*e.r*0.8)-1,2,2);}
  if(k.head&&!ET[e.type].riot){F('#15181a',Math.round(x+ca*2)-1,Math.round(y+sa*2)-1,3,3);F('#8a9298',Math.round(x+ca*2),Math.round(y+sa*2),1,1);}
  const A=ARM[k.main];if(!A)return;
  if(k.gun){const L=Math.round((GUNLEN[k.main]||6)*0.7);ctx.strokeStyle='#101214';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+px*2+ca*2,y+py*2+sa*2);ctx.lineTo(x+px*2+ca*(2+L),y+py*2+sa*(2+L));ctx.stroke();
    if(e.reloadT>0&&Math.sin(T*10)>0)F('#e8dcb0',Math.round(x+px*2+ca*(2+L)),Math.round(y+py*2+sa*(2+L)),1,1);}
  else{const L=k.main==='cutter'?5:k.main==='chainsaw'?9:8,sw=e.swingT>0?0.8:0,b2=a+sw,c2=Math.cos(b2),s2=Math.sin(b2);ctx.strokeStyle=KIT_COL[k.main]||'#8a9298';ctx.lineWidth=k.main==='bat'||k.main==='chainsaw'?2:1;
    ctx.beginPath();ctx.moveTo(x+px*3+c2*2,y+py*3+s2*2);ctx.lineTo(x+px*3+c2*L,y+py*3+s2*L);ctx.stroke();}}
