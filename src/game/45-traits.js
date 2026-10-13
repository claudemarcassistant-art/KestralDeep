// ---------- creature traits (v1.05, batch 4 request 22) ----------
// rollTraits() runs at the end of mkEnemy() (after rollKit()), so traits on generated creatures repeat on the same
// seed; wave and ambient spawns roll too. e.tr = {trait:true, ...}. Tables: TRAITS, TRAIT_CFG, TRAIT_DESC
// (src/data/creatures.js); scenarios weight them through SCENARIOS[..].traitW (traitWGuard for guards only).
// Effects: damageEnemy() (armoured), the enemy loop (frenzied attack speed, regenerating), trackTick() (frenzied hunt
// memory), sightMul()/seesPlayer()/noise() (keen), the death branch (volatile), hurtPlayer() (venomous), weightAt()
// (hulking), setTraits() (hulking size and health, frenzied speed). Each trait adds TRAIT_CFG.threat to threatOf().
const isHuman=e=>!!(ET[e.type].guard||e.kit);
function traitOK(e){const b=ET[e.type];return !b.simple&&!b.warden&&!b.dummy&&e.boss==null&&!e.mini;}
function traitWeights(e,not){const C=TRAIT_CFG,S=scen(),tw=C.typeW[e.type]||{},sw=(ET[e.type].guard&&S.traitWGuard)||S.traitW||{},hum=isHuman(e);
  return Object.keys(TRAITS).filter(k=>k!==not&&(!hum||TRAITS[k].human)).map(k=>[k,TRAITS[k].w*(tw[k]!=null?tw[k]:1)*(sw[k]!=null?sw[k]:1)]).filter(q=>q[1]>0);}
function traitChance(){const C=TRAIT_CFG;if(depth<C.minDepth)return 0;return Math.min(C.max,C.base+(depth-C.minDepth)*C.perDepth);}
function rollTraits(e,force){if(!traitOK(e))return e;const c=traitChance();if(!force&&(!c||Math.random()>=c))return e;
  const W=traitWeights(e);if(!W.length)return e;const a=wpick(W),L=[a];
  if(route&&(route.sector||0)+1>=TRAIT_CFG.secondFrom&&Math.random()<TRAIT_CFG.second){const W2=traitWeights(e,a);if(W2.length)L.push(wpick(W2));}
  return setTraits(e,L);}
function setTraits(e,L){if(e.tr){if(e.tr.hulking){e.r/=TRAITS.hulking.size;e.hp/=TRAITS.hulking.hp;e.mhp=e.hp;e.spd/=TRAITS.hulking.spd;}if(e.tr.frenzied)e.spd/=TRAITS.frenzied.spd;}
  delete e.tr;if(!L||!L.length)return e;e.tr={};for(const k of L)e.tr[k]=true;e.mhp=e.mhp||e.hp;
  if(e.tr.hulking){const H=TRAITS.hulking;e.r*=H.size;e.hp*=H.hp;e.mhp=e.hp;e.spd*=H.spd;}if(e.tr.frenzied)e.spd*=TRAITS.frenzied.spd;return e;}
const nTraits=e=>e&&e.tr?Object.keys(e.tr).length:0;
const traitMul=e=>1+TRAIT_CFG.threat*nTraits(e);
function threatOf(e){return (THREAT[e.type]||1.5)*traitMul(e);}
const hasTr=(e,k)=>!!(e&&e.tr&&e.tr[k]);
const sightMul=e=>hasTr(e,'keen')?TRAITS.keen.sight:1;
// enemy loop, each frame: frenzied attacks come round faster, regenerating heals when left alone
function traitTick(e,dt){if(!e.tr)return;if(e.tr.frenzied){e.cd-=dt*(TRAITS.frenzied.atk-1);if(e.kcd>0)e.kcd-=dt*(TRAITS.frenzied.atk-1);}
  if(e.tr.regenerating&&!(e.burnT>0)&&T-(e.hitT||-99)>TRAITS.regenerating.after&&e.hp<e.mhp){e.hp=Math.min(e.mhp,e.hp+TRAITS.regenerating.hps*dt);if(Math.random()<dt*3)parts.push({x:e.x+rr(-3,3),y:e.y+rr(-3,3),vx:0,vy:rr(-12,-4),t:0.4,m:0.4,c:'#7fd08e',s:1});}}
// death: a volatile creature bursts into a small cloud
function traitDeath(e){if(!hasTr(e,'volatile'))return;const V=TRAITS.volatile,cold=scenId()==='coldsnap'||((biomeOverride!=null?biomeOverride:(depth-1))%6)===3,hot=cond&&TRAIT_CFG.volatileHot.includes(cond.haz);
  const kind=cold?'cryo':hot?'smoke':'toxic';emitters.push({x:e.x,y:e.y,t:V.t,kind,rate:V.cloud,rmax:28});sfx('glob');for(let k=0;k<10;k++)parts.push({x:e.x,y:e.y,vx:rr(-60,60),vy:rr(-60,60),t:0.35,m:0.35,c:kind==='cryo'?'#cfe8ff':kind==='smoke'?'#6a6e72':'#a8c848',s:1});}
// hurtPlayer(): a venomous creature (or its shot) poisons
function traitHit(src){const e=src&&(src.tr?src:src.src&&src.src.tr?src.src:null);if(e&&e.tr.venomous)addStatus('psn',TRAITS.venomous.psn);}
// names for V-look: "armoured, frenzied"
const traitNames=e=>e&&e.tr?Object.keys(e.tr).map(k=>TRAITS[k].name).join(', '):'';
// bestiary: traits seen on each creature, kept across runs (META.traitsSeen)
function noteTraits(e){if(!e.tr||testMode&&!testDeck)return;const M=META.traitsSeen=META.traitsSeen||{},s=M[e.type]=M[e.type]||{};let nw=false;for(const k in e.tr)if(!s[k]){s[k]=1;nw=true;}if(nw)saveMeta();}
function traitsSeenAll(){const M=META.traitsSeen||{},got={};for(const t in M)for(const k in M[t])got[k]=1;return Object.keys(TRAITS).every(k=>got[k]);}
// the marks, drawn after drawEnemy() (hulking is drawn bigger by scaling the sprite in render())
function drawTraits(e){const x=Math.round(e.x-camX),y=Math.round(e.y-camY),r=e.r,p=player,a=Math.atan2(p.y-e.y,p.x-e.x),ca=Math.cos(a),sa=Math.sin(a);
  if(e.tr.frenzied){ctx.strokeStyle=`rgba(255,70,50,${0.45+0.3*Math.sin(T*20+e.ph)})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x+rr(-0.5,0.5),y+rr(-0.5,0.5),r+1.5,0,6.283);ctx.stroke();ctx.fillStyle='rgba(255,40,30,0.18)';circ(x,y,r);}
  if(e.tr.armoured){for(const o of [-2.2,0,2.2]){const px=Math.round(x-ca*r*0.55+sa*o),py=Math.round(y-sa*r*0.55-ca*o);F('#2a2c2a',px-2,py-2,4,4);F('#7a7e76',px-1,py-1,2,2);}}
  if(e.tr.regenerating){const g=0.4+0.3*Math.sin(T*3+e.ph);ctx.strokeStyle=`rgba(120,230,140,${g})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,r+2.5,0,6.283);ctx.stroke();}
  if(e.tr.volatile){const g=0.6+0.4*Math.sin(T*5+e.ph);ctx.fillStyle='#2a3010';circ(x-sa*r*0.75,y+ca*r*0.75,2.2);circ(x+sa*r*0.7,y-ca*r*0.7,1.9);ctx.fillStyle=`rgba(210,240,90,${g})`;circ(x-sa*r*0.75,y+ca*r*0.75,1.6);circ(x+sa*r*0.7,y-ca*r*0.7,1.3);}
  if(e.tr.venomous&&Math.sin(T*4+e.ph)>-0.2)F('#8fdf40',Math.round(x+ca*(r+1)),Math.round(y+sa*(r+1)+(T*6+e.ph)%3),1,1);
  if(e.tr.keen){F('#fff4a0',Math.round(x+ca*r*0.5-sa*1.2),Math.round(y+sa*r*0.5+ca*1.2),1,1);F('#fff4a0',Math.round(x+ca*r*0.5+sa*1.2),Math.round(y+sa*r*0.5-ca*1.2),1,1);}}
// test range creature console: the Traits row (auto rolls as on a deck at the current depth)
const TRAIT_PRESETS=()=>[['auto',null],['none',[]],['random trait','random'],...Object.keys(TRAITS).map(k=>[k,[k]]),['armoured, frenzied',['armoured','frenzied']],['hulking, regenerating',['hulking','regenerating']]];
