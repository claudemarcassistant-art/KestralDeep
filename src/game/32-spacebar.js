// ---------- spacebar styles ----------
// SPACE does the active style (player.space, chosen in Files > Skills): shove (always known, shove() in 22-actions.js),
// kick (Brawler tier 8) or repulse (Kinetic tier 9). Numbers are in SPACE_STYLES (src/data/character.js).
function spaceOwned(k){if(k==='shove')return true;if(!player||!player.files)return false;
  for(const f of FILES){const t=fileTier(f.id);for(let i=0;i<t;i++)if(f.tiers[i].space===k)return true;}return false;}
function spaceList(){return Object.keys(SPACE_STYLES).filter(spaceOwned);}
// falls back to shove if the chosen style was forgotten
function activeSpace(){const k=player&&player.space||'shove';return spaceOwned(k)?k:'shove';}
function spaceAct(){const k=activeSpace();if(k==='kick')kick();else if(k==='repulse')repulse();else shove();}
function updateSpace(dt){const P=player;if(P.repulseCd>0)P.repulseCd-=dt;}

// a narrow, longer, harder hit than a shove that counts as melee for combos and crits; sprint into it for a flying kick
function kick(){const P=player;if(state!=='play'||paused()||P.shoveCd>0||P.dazeT>0)return;const K0=SPACE_STYLES.kick;
  if(P.stam<K0.stam){say('too tired to kick');sfx('click');P.shoveCd=0.2;return;}P.stam-=K0.stam;
  const m0=melee(),fly=P.sprinting,cloaked=P.cloakT>0,range=K0.range+(fly?K0.flyRange:0),arc=K0.arc,kb=m0.kb*K0.kbMul*(fly?1.3:1),dmg=K0.dmg+(m0.dmg-1);
  P.shoveCd=m0.cd*K0.cdMul*(fly?1.3:1);P.shoveMax=P.shoveCd;P.shoveT=fly?0.26:0.14;sfx('shove');
  if(fly){P.tackleT=0.45;const ca=Math.cos(P.ang),sa=Math.sin(P.ang);P.vx+=ca*K0.flyBoost;P.vy+=sa*K0.flyBoost;float(P.x,P.y-8,'flying kick','#e8dcb0');sfx('thud');}
  if(P.grabbedBy)severTentacle(P.grabbedBy,'kicked off');
  const inArc=(x,y,r)=>{const dx=x-P.x,dy=y-P.y;return Math.hypot(dx,dy)<range+r&&Math.abs(angDiff(Math.atan2(dy,dx),P.ang))<arc;};
  let hits=0;
  for(const e of enemies){if(e.dead||ET[e.type].ghost||!inArc(e.x,e.y,e.r))continue;const dx=e.x-P.x,dy=e.y-P.y,amb=(P.creeping||cloaked)&&!e.alert;
    if(amb){float(e.x,e.y,'ambush','#ff9a7a');if(lvl)lvl.ambush++;}
    let d=dmg*(amb?(perk('ambusher')?4:3):1)*comboDmg();if(Math.random()<critChance('kick')){d*=2;critFx(e,d);}
    damageEnemy(e,d,dx,dy,e.type==='brute'?kb*0.35:kb);e.cd=Math.max(e.cd,0.7);hits++;}
  if(hits)comboAdd(1);if(cloaked)breakCloak();
  for(const pl of plants)if(!pl.burst&&inArc(pl.x,pl.y,4))burstPlant(pl);
  for(const c of cores)if(!c.dead&&inArc(c.x,c.y,6))hitCore(c,dmg*2);
  for(const bb of barrels)if(!bb.dead&&inArc(bb.x,bb.y,4))hitBarrel(bb,dmg,bb.x-P.x,bb.y-P.y,kb*0.9);
  const ca=Math.cos(P.ang),sa=Math.sin(P.ang);for(let s=4;s<=range;s+=3){const tx=Math.floor((P.x+ca*s)/TS),ty=Math.floor((P.y+sa*s)/TS);
    if(solid(tx,ty)){if(map[ty*MW+tx]===3)damageSecret(tx,ty,dmg*2);else sfx('thud');break;}}}

// a psychic burst all around: throws creatures, barrels, crates, loose items and gas clouds away
function repulse(){const P=player,R0=SPACE_STYLES.repulse;if(state!=='play'||paused()||P.dazeT>0||P.shoveCd>0)return;
  if(P.repulseCd>0){say('repulse is recharging');sfx('click');return;}
  if(P.stam>=R0.stam)P.stam-=R0.stam;else{const rest=R0.stam-P.stam;P.stam=0;hurtPlayer(rest*0.5,true);float(P.x,P.y-10,'it costs you','#e07070');}
  P.repulseCd=R0.cd*actCdMul();P.shoveCd=0.3;P.shoveMax=0.3;breakCloak();sfx('slam');shake=Math.max(shake,3);noise(P.x,P.y,120);
  if(P.grabbedBy)severTentacle(P.grabbedBy,'thrown off');
  const out=(x,y)=>{const dx=x-P.x,dy=y-P.y,d=Math.hypot(dx,dy)||1;return [dx/d,dy/d,d];};
  for(const e of enemies){if(e.dead||ET[e.type].ghost)continue;const [ux,uy,d]=out(e.x,e.y);if(d>R0.r+e.r)continue;damageEnemy(e,R0.dmg,ux,uy,(e.type==='brute'?200:360)*R0.kbMul);}
  for(const bb of barrels){if(bb.dead)continue;const [ux,uy,d]=out(bb.x,bb.y);if(d<R0.r+4)pushBarrel(bb,ux,uy,380*R0.kbMul);}
  for(const it of items){const [ux,uy,d]=out(it.x,it.y);if(d<R0.r&&d>1){it.kvx=ux*170;it.kvy=uy*170;}}
  for(const c of clouds){const [ux,uy,d]=out(c.x,c.y);if(d<R0.r+c.r){c.x+=ux*26;c.y+=uy*26;}}
  for(const pl of plants)if(!pl.burst&&Math.hypot(pl.x-P.x,pl.y-P.y)<R0.r)burstPlant(pl);
  for(let k=0;k<28;k++){const a=k/28*6.283,v=rr(110,160);parts.push({x:P.x+Math.cos(a)*6,y:P.y+Math.sin(a)*6,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0.3,m:0.3,c:'#a88af0',s:1});}}
