// ---------- industrial blower and stun gun (v1.03, batch 3 requests 19 and 20) ----------
// Blower: an off-hand gun-style armament (ARM.blower, WPN.blower for the HUD's cell count). While aimed and held,
// updateBlower() (called from updatePlay()) runs an air lane BLOWER_CFG.len px ahead, stopped by walls, strongest
// near the nozzle: it pushes and thins clouds, puts out close fires, bends flame particles, shoves barrels, crates,
// items and creatures (scaled by size; ghosts and plants stay put), slows and turns slow enemy shots and trap darts,
// and pushes you back a little. Stun gun: a main-hand armament (ARM.stungun); stunZap() fires from the melee input
// path inside asMelee(), about 5 times a second, into the nearest creature in a narrow cone, filling the cable whip's
// stun meter (e.stunB). Numbers: BLOWER_CFG, STUNGUN_CFG (src/data/weapons.js).
let zaps=[];
// --- blower
function blowerLen(ux,uy){const P=player,C=BLOWER_CFG;let L=0;while(L<C.len&&!solidAt(P.x+ux*(L+4),P.y+uy*(L+4)))L+=4;return L;}
// strength 0-1 of the air at x,y (radius r) for the current lane, 0 outside it
function blowK(x,y,r,ux,uy,L){const P=player,C=BLOWER_CFG,dx=x-P.x,dy=y-P.y,al=dx*ux+dy*uy;if(al<=2||al>L+r)return 0;
  if(Math.abs(-dx*uy+dy*ux)>C.width/2+r)return 0;if(!hasLOS(P.x+ux*3,P.y+uy*3,x,y))return 0;return al<=C.near?1:1-(1-C.fall)*Math.min(1,(al-C.near)/Math.max(1,C.len-C.near));}
function blowMass(e){const C=BLOWER_CFG.creature,b=ET[e.type];if(e.boss!=null||e.mini||b.warden)return C.boss;if(b.fly)return C.fly;if(e.type==='brute'||e.r>=6)return C.heavy;if(e.r<=3.5)return C.light;return C.small;}
function updateBlower(dt,on){const P=player,C=BLOWER_CFG;P.blowing=false;if(!on){P.blowSnd=0;return;}
  if(P.liq===4)return;
  if(!(P.inv.cells>0)){if(!(P.emptyT>0)){say('the blower needs power cells');sfx('click');P.emptyT=1.5;}return;}
  P.blowing=true;breakCloak();P.blowAcc=(P.blowAcc||0)+dt;if(P.blowAcc>=C.cell-1e-6){P.blowAcc-=C.cell;P.inv.cells--;}
  P.blowSnd=(P.blowSnd||0)-dt;if(P.blowSnd<=0){P.blowSnd=C.noiseEvery;noise(P.x,P.y,C.noise);sfx('whoosh');}
  const ux=Math.cos(P.ang),uy=Math.sin(P.ang),L=blowerLen(ux,uy);
  // you: a little recoil, more when floating or in low gravity
  {const m=(P.floating||lowGrav())?C.floatMul:1;move(P,-ux*C.recoil*m*dt,-uy*C.recoil*m*dt);}
  // air streaks and dust
  for(let k=0;k<3;k++){const a=P.ang+rr(-0.12,0.12),sp=rr(260,380),o=rr(-C.width/2,C.width/2)*0.6;parts.push({x:P.x+ux*9-uy*o*0.3,y:P.y+uy*9+ux*o*0.3,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:Math.min(0.3,L/sp),m:0.3,c:k?'rgba(225,235,235,0.75)':'#b8ad90',s:1});}
  for(const c of clouds){const k=Math.max(blowK(c.x,c.y,c.r*0.5,ux,uy,L),blowK(c.x-ux*c.r*0.5,c.y-uy*c.r*0.5,0,ux,uy,L));if(!k)continue;c.vx+=ux*C.cloud.push*k*dt;c.vy+=uy*C.cloud.push*k*dt;c.dens=Math.max(0,c.dens-C.cloud.thin*k*dt);}
  // fires close in go out after a moment of steady air
  for(const f of fires){const d=Math.hypot(f.x-P.x,f.y-P.y);if(d<=C.fire.fireR&&blowK(f.x,f.y,6,ux,uy,L)>0){f.blowT=(f.blowT||0)+dt;if(Math.random()<dt*6)puff(f.x,f.y,'smoke',2);}else f.blowT=0;}
  {const out=fires.filter(f=>f.blowT>=C.fire.fireT);for(const f of out){const tx=Math.floor(f.x/TS),ty=Math.floor(f.y/TS),i=ty*MW+tx;if(hz[i]===1){hz[i]=0;paintTile(tx,ty);}puff(f.x,f.y,'smoke',4);}
    if(out.length){fires=fires.filter(f=>!out.includes(f));sfx('hiss');}}
  for(const f of flames){const k=blowK(f.x,f.y,2,ux,uy,L);if(k){f.vx+=ux*C.flame*k*dt;f.vy+=uy*C.flame*k*dt;}}
  for(const bb of barrels){if(bb.dead)continue;const k=blowK(bb.x,bb.y,4,ux,uy,L);if(k)pushBarrel(bb,ux,uy,(bb.crate?C.crate:C.barrel)*k*dt);}
  for(const o of [...flares,...charges]){const k=blowK(o.x,o.y,2,ux,uy,L);if(k){o.vx+=ux*300*k*dt;o.vy+=uy*300*k*dt;}}
  for(const it of items){if(it.dead||it.fall)continue;const k=blowK(it.x,it.y,2,ux,uy,L);if(!k)continue;const v=C.item*k;if((it.kvx||0)*ux+(it.kvy||0)*uy<v){it.kvx=ux*v;it.kvy=uy*v;}}
  for(const e of enemies){if(e.dead)continue;const b=ET[e.type];if(b.dummy||b.ghost||b.plant||e.caged||e.seg)continue;const k=blowK(e.x,e.y,e.r,ux,uy,L);if(!k)continue;
    const m=blowMass(e);move(e,ux*C.creature.drift*m*k*dt,uy*C.creature.drift*m*k*dt);
    // after a wall slam the air only leans on it for a moment, so it cannot be hammered against the wall
    if(e.impT>0)e.blowRest=C.creature.rest;if(e.blowRest>0){e.blowRest-=dt;continue;}const a=C.creature.push*m*k*dt;e.vx=(e.vx||0)+ux*a;e.vy=(e.vy||0)+uy*a;const sp=Math.hypot(e.vx,e.vy);if(sp>C.creature.cap){e.vx*=C.creature.cap/sp;e.vy*=C.creature.cap/sp;}
    e.kbT=Math.max(e.kbT||0,0.15);}
  // slow enemy shots and trap darts are slowed and turned along the air
  const bend=(o)=>{const k=blowK(o.x,o.y,2,ux,uy,L);if(!k)return;const sp=Math.hypot(o.vx,o.vy)||1,f=Math.exp(-C.proj.slow*k*dt);o.vx=(o.vx+ux*sp*C.proj.turn*k*dt)*f;o.vy=(o.vy+uy*sp*C.proj.turn*k*dt)*f;};
  for(const o of bullets)if(!o.p&&!o.slug&&Math.hypot(o.vx,o.vy)<C.proj.max)bend(o);
  for(const o of darts)bend(o);}
// --- stun gun
function machine(e){return !!ET[e.type].drone;}
function addStunB(e,amt,reel){if(ET[e.type].dummy)return;e.stunB=(e.stunB||0)+amt;if(e.stunB>=100){e.stunB=0;e.stun=Math.max(e.stun||0,reel);if(seen[tileIdx(e)])float(e.x,e.y-8,'reeling','#e8dcb0');}}
const wetCreature=e=>e.wetT>0||(!ET[e.type].fly&&liqAt(e.x,e.y)>=1);
function stunZap(){return asMelee(()=>stunZap0());}
function stunZap0(){const P=player,C=STUNGUN_CFG,powered=P.inv.cells>0;P.mcd=C.zapCd;P.mcdMax=C.zapCd;P.zapT=0.1;
  if(powered){P.zapAcc=(P.zapAcc||0)+C.zapCd;if(P.zapAcc>=C.cell-1e-6){P.zapAcc-=C.cell;P.inv.cells--;}noise(P.x,P.y,C.noise);}
  else if(!(P.emptyT>0)){say('the stun gun fizzles. it needs power cells');P.emptyT=2;}
  const ux=Math.cos(P.ang),uy=Math.sin(P.ang),tipX=P.x+ux*9,tipY=P.y+uy*9;
  let best=null,bd=1e9;for(const e of enemies){if(e.dead||ET[e.type].ghost||e.caged&&!e.caged.open)continue;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);
    if(d<C.range+e.r&&Math.abs(angDiff(Math.atan2(dy,dx),P.ang))<C.arc&&d<bd&&hasLOS(P.x,P.y,e.x,e.y)){bd=d;best=e;}}
  let ex,ey;
  if(best){ex=best.x;ey=best.y;const e=best,b=ET[e.type],hr=hitRoll('stungun',critChance('stungun'),e,false),mm=machine(e)?C.machine:1;
    const dmg=(C.dmg+(S.meleeDmg||0)*0.25)*(powered?1:C.noCell)*mm*comboDmg()*hr.mul;if(hr.crit)critFx(e,dmg);if(hr.glance)glanceFx(e);
    damageEnemy(e,dmg,e.x-P.x,e.y-P.y,10);comboAdd(C.combo);
    if(powered&&!hr.glance&&!e.dead){const wet=wetCreature(e),amt=(e.type==='brute'?C.stunBrute:C.stun)*(wet?C.wetMul:1);addStunB(e,amt,C.stunT*(machine(e)?C.machineStun:1));
      // the jolt runs through shared water to everything else standing in it
      if(!b.fly&&liqAt(e.x,e.y)>=1)for(const o of enemies){if(o===e||o.dead||ET[o.type].ghost||ET[o.type].fly||liqAt(o.x,o.y)<1)continue;if(Math.hypot(o.x-e.x,o.y-e.y)>C.chain)continue;
        damageEnemy(o,C.dmg*C.chainMul*(machine(o)?C.machine:1),0,0,0,true);addStunB(o,C.stun*C.wetMul*C.chainMul,C.stunT);zaps.push({x0:e.x,y0:e.y,x1:o.x,y1:o.y,t:0.1,m:0.1});}}
    if(powered)sfx('crackle');else sfx('shove');}
  else{const a=P.ang+rr(-0.4,0.4),l=rr(12,20);ex=P.x+Math.cos(a)*l;ey=P.y+Math.sin(a)*l;if(powered&&Math.random()<0.5)sfx('crackle');}
  // cameras in front take the arc too: machines take triple damage, so each zap is one of a camera's three hits
  if(powered){for(const c of secCams){if(c.broken)continue;const dx=c.x-P.x,dy=c.y-P.y,d=Math.hypot(dx,dy);if(d<C.range+4&&Math.abs(angDiff(Math.atan2(dy,dx),P.ang))<C.arc+0.2){hitCam(c,1);if(!best){ex=c.x;ey=c.y;}}}
    // you in water: a bite of your own
    if(liqAt(P.x,P.y)>=1&&!P.floating)addStatus('shk',C.selfShock);
    // oil under the arc's end can catch
    {const tx=Math.floor(ex/TS),ty=Math.floor(ey/TS);if(tx>=0&&ty>=0&&tx<MW&&ty<MH&&oil[ty*MW+tx]&&Math.random()<C.oil)igniteOil(tx,ty);}
    zaps.push({x0:tipX,y0:tipY,x1:ex,y1:ey,t:0.1,m:0.1});lights.push({x:ex,y:ey,r:26,t:0.08,m:0.08,c:'140,190,255'});}
  else zaps.push({x0:tipX,y0:tipY,x1:tipX+ux*4,y1:tipY+uy*4,t:0.06,m:0.06,dim:true});}
function updateZaps(dt){for(const z of zaps)z.t-=dt;zaps=zaps.filter(z=>z.t>0);if(player&&player.zapT>0)player.zapT-=dt;}
// drawn in drawActWorld()'s lighter pass: jagged blue arcs
function drawZaps(){for(const z of zaps){const a=z.t/z.m,dx=z.x1-z.x0,dy=z.y1-z.y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,n=Math.max(2,Math.round(L/5));
    ctx.strokeStyle=z.dim?`rgba(120,150,200,${0.5*a})`:`rgba(150,200,255,${0.9*a})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(z.x0-camX,z.y0-camY);
    for(let k=1;k<n;k++){const t=k/n,j=rr(-2.5,2.5);ctx.lineTo(z.x0+dx*t+nx*j-camX,z.y0+dy*t+ny*j-camY);}ctx.lineTo(z.x1-camX,z.y1-camY);ctx.stroke();}}
