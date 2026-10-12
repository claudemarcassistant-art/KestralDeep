// ---------- tear gas and nerve gas (v1.02, batch 3 request 18) ----------
// Two cloud kinds on the ordinary cloud system (puff(), updateClouds(), drawClouds()). Numbers: GAS_CFG
// (src/data/status.js). Tear gas: shrouds vision, blocks creature sight like smoke (smokeBlocks(), unless the viewer
// has a mask), builds the player's "irritated" meter (st.irr: aim spread, slower stamina recovery, coughs that stop
// sprinting), no damage, no air drain; unmasked creatures back out of it and shoot wild. Nerve gas: quiet damage,
// a "seizing" meter (st.szr) that ends in a stun, air drain; hurts every creature but drones and ghosts, and kills
// plants and slime creatures fast. A filter mask halves both. Riot guards and riot drones lob tear canisters.
CLOUD.tear={col:'232,228,190',a:0.38};
CLOUD.nerve={col:'96,52,128',a:0.44};
let gasN=0;
// how deep (0-1) the point x,y sits in cloud c, the same test updateClouds() uses for the player
function cloudK(c,x,y){let k=0;for(const b of c.blobs){const [bx,by,br]=blobPos(c,b),d=Math.hypot(x-bx,y-by);if(d<br*0.9)k=Math.max(k,c.dens*(1-d/br*0.5));}return k;}
function gasAt(x,y){let t=0,n=0,tc=null;if(!gasN)return {t,n,tc};for(const c of clouds){if(c.kind!=='tear'&&c.kind!=='nerve')continue;const k=cloudK(c,x,y);if(!k)continue;if(c.kind==='tear'){if(k>t){t=k;tc=c;}}else n=Math.max(n,k);}return {t,n,tc};}
const gasMask=()=>(S.poisonRes||0)>=0.5;
const gasMul=()=>gasMask()?GAS_CFG.maskMul:1;
// irritated: aim and stamina multipliers read by aimMul() and the stamina recovery in updatePlay()
function irrLv(){return player&&player.st?(player.st.irr||0)/100:0;}
function irrAimMul(){return 1+GAS_CFG.tear.aim*irrLv();}
function irrStamMul(){return 1-GAS_CFG.tear.stam*irrLv();}
// called from updateClouds() with the deepest tear and nerve exposure this frame
function gasPlayerTick(dt,tk,nk){const p=player,s=p.st,G=GAS_CFG,m=gasMul();if(!s)return;s.irr=s.irr||0;s.szr=s.szr||0;
  if(tk>0)s.irr=Math.min(100,s.irr+G.tear.irr*tk*m*dt);else s.irr=Math.max(0,s.irr-G.tear.irrDecay*dt);
  p.coughT=Math.max(0,(p.coughT||0)-dt);
  if(s.irr>=G.tear.coughMin&&!(p.coughT>0)&&Math.random()<G.tear.cough*s.irr/100*dt){p.coughT=G.tear.coughT;float(p.x,p.y-8,'cough','#e8e4be');sfx('thud');}
  if(s.irr>20&&Math.random()<s.irr/100*dt*5)parts.push({x:p.x+rr(-3,3),y:p.y-3,vx:rr(-5,5),vy:rr(-14,-6),t:0.4,m:0.4,c:'#e8e4be',s:1});
  if(nk>0){p.nerveAcc=(p.nerveAcc||0)+G.nerve.dps*nk*m*dt;while(p.nerveAcc>=1){p.nerveAcc-=1;hurtPlayer(1,true);}
    if(!(p.dazeT>0)){s.szr=Math.min(100,s.szr+G.nerve.szr*nk*m*dt);if(s.szr>=100){s.szr=0;p.dazeT=G.nerve.stun;float(p.x,p.y-8,'seizing','#c89ae8');sfx('thud');shake=Math.max(shake,4);}}
    p.hissT=(p.hissT||0)-dt;if(p.hissT<=0){p.hissT=2.5;sfx('hiss');}
    if(!(T-(p.nerveSay||-99)<10)){p.nerveSay=T;say('nerve gas. get out of the violet haze');}}
  else{s.szr=Math.max(0,s.szr-G.nerve.szrDecay*dt);p.hissT=0;}}
// enemy loop, right after enemyFrozen(): nerve damage and seizing for all but drones and ghosts; unmasked creatures
// (not plants) back out of tear gas instead of acting. Returns true when the creature's AI is skipped this frame.
function gasEnemyTick(e,b,dt){if(e.tearT>0)e.tearT-=dt;if(!gasN||e.dead||b.dummy||b.drone||b.ghost||e.caged)return false;const G=GAS_CFG,g=gasAt(e.x,e.y);
  if(g.n>0){const mul=b.plant||b.slug||b.snail?G.nerve.killMul:1;e.nerveAcc=(e.nerveAcc||0)+G.nerve.dps*g.n*mul*dt;while(e.nerveAcc>=1&&!e.dead){e.nerveAcc-=1;damageEnemy(e,1,0,0,0,true);}if(e.dead)return true;
    if(!b.plant){e.szr=(e.szr||0)+G.nerve.szr*g.n*dt;if(e.szr>=100){e.szr=0;e.stun=Math.max(e.stun||0,G.nerve.stun);if(seen[tileIdx(e)])float(e.x,e.y-8,'seizing','#c89ae8');}}}
  else if(e.szr>0)e.szr=Math.max(0,e.szr-G.nerve.szrDecay*dt);
  if(g.t>0.05&&!b.plant&&!b.mask&&!(e.stun>0)){e.tearT=G.tear.linger;const c=g.tc,dx=e.x-c.x,dy=e.y-c.y,l=Math.hypot(dx,dy)||1,sp=(b.spd||20)*G.tear.flee;
    move(e,(dx/l*sp+e.vx)*dt,(dy/l*sp+e.vy)*dt);const f=Math.pow(kbFr(),dt);e.vx*=f;e.vy*=f;e.walk=(e.walk||0)+dt*6;if(Math.random()<dt*0.8&&seen[tileIdx(e)])float(e.x,e.y-8,'cough','#e8e4be');return true;}
  return false;}
// creature shots fired while tear gas stings go wide (once per bullet)
function gasJitter(bl){if(bl.p||bl.gj||!bl.src||!(bl.src.tearT>0))return;bl.gj=1;const a=rr(-1,1)*GAS_CFG.tear.jit,c=Math.cos(a),s=Math.sin(a),vx=bl.vx;bl.vx=vx*c-bl.vy*s;bl.vy=vx*s+bl.vy*c;}
// grenades and canisters
function gasLand(n){const N=GAS_CFG.nade;if(n.kind==='tearnade'||n.kind==='tearcan'){sfx('hiss');const C=N.tear;emitters.push({x:n.x,y:n.y,t:n.kind==='tearcan'?C.t*0.8:C.t,kind:'tear',rate:C.rate,rmax:C.rmax});noise(n.x,n.y,80);return true;}
  if(n.kind==='nervenade'){sfx('hiss');const C=N.nerve;emitters.push({x:n.x,y:n.y,t:C.t,kind:'nerve',rate:C.rate,rmax:C.rmax});noise(n.x,n.y,60);return true;}return false;}
// a creature lobs a tear canister so it lands at (tx,ty)
function lobCanister(e,tx,ty){const R=GAS_CFG.riot,dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy)||1;nades.push({x:e.x,y:e.y,vx:dx/d*R.lobSpeed,vy:dy/d*R.lobSpeed,t:d/R.lobSpeed,kind:'tearcan',spin:0,by:e});sfx('whoosh');}
// riot guard: inside the guard branch, when it sees you at lob range
function riotGuardTick(e,b,dt,seeP,td){if(!b.riot)return;e.gasCd=(e.gasCd==null?rr(2,5):e.gasCd)-dt;const R=GAS_CFG.riot,p=player;
  if(seeP&&td>=R.lobMin&&td<=R.lobMax&&e.gasCd<=0){e.gasCd=R.lobCd;e.pushT=6;lobCanister(e,p.x+rr(-6,6),p.y+rr(-6,6));if(seen[tileIdx(e)])float(e.x,e.y-8,'gas!','#e8e4be');}}
// riot drone: drops a canister on you when it spots you, then hangs back
function riotDroneTick(e,b,dt,los,d){if(!b.riot)return;e.gasCd=(e.gasCd==null?rr(1,3):e.gasCd)-dt;e.hangT=(e.hangT||0)-dt;const R=GAS_CFG.riot,p=player;
  if(e.alert&&los&&d<=R.dropRange&&e.gasCd<=0){e.gasCd=R.dropCd;e.hangT=5;lobCanister(e,p.x,p.y);if(seen[tileIdx(e)])float(e.x,e.y-8,'gas!','#e8e4be');}}
// V-look: the gas at a point
function gasLook(wx,wy){for(const c of clouds){if(c.kind!=='tear'&&c.kind!=='nerve')continue;if(cloudK(c,wx,wy)>0.05)return c.kind==='tear'?{name:'Tear gas',desc:GAS_DESC.tear,col:'#e8e4be'}:{name:'Nerve gas',desc:GAS_DESC.nerve,col:'#c89ae8'};}return null;}
