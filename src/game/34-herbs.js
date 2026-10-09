// ---------- herbs and herbalism ----------
// Herb tufts are items {type:'tuft',tuft:id} picked up into player.herbs. Preparations (HERBAL in src/data/herbs.js)
// are made in the Food tab's Herbalism view (fdMode 2). Poultices and incense are quick items (QUICK entries added
// below, counts in player.inv); draughts are FOOD entries eaten from the Pouch, giving timed buffs (player.tbuffs,
// added to stats in refreshStats()). Heal-over-time is player.hots. Burning incense sticks are in `incense`.
Object.assign(FOOD,DRAUGHTS);
for(const h of HERBAL)if(h.kind!=='draught')QUICK[h.id]={name:h.name,desc:h.desc,n:()=>player.inv[h.id]||0,use:()=>usePrep(h.id)};
const HERBBY={};for(const h of HERBAL)HERBBY[h.id]=h;
let incense=[];
const randHerb=()=>wpick(HERB_WEIGHTS);

// ---- generation (inside the deck's seeded scope)
function tuftAt(tx,ty,h){items.push({x:tx*TS+6+rr(-2,2),y:ty*TS+6+rr(-2,2),type:'tuft',tuft:h||randHerb(),ph:Math.random()*6});}
// a floor tile in room r against a wall
function wallSpotIn(r){for(let k=0;k<20;k++){const x=r.x+rnd(r.w),y=r.y+rnd(r.h),i=y*MW+x;if(map[i]!==0||liq[i]>=2||hz[i])continue;if(D4.some(([dx,dy])=>map[(y+dy)*MW+x+dx]===1))return [x,y];}return null;}
function genOvergrownHerbs(){const C=HERB_CFG,n=aN(C.overgrown[0]+rnd(C.overgrown[1]-C.overgrown[0]+1));
  for(let k=0;k<n;k++){let s=null;
    if(Math.random()<C.nearBloom&&plants.length){const q=plants[rnd(plants.length)],qx=Math.floor(q.x/TS),qy=Math.floor(q.y/TS);for(const [dx,dy] of D8){const x=qx+dx,y=qy+dy;if(!solid(x,y)&&liq[y*MW+x]<2&&!plants.some(z=>Math.floor(z.x/TS)===x&&Math.floor(z.y/TS)===y)){s=[x,y];break;}}}
    if(!s)s=wallSpotIn(randomRoom());if(s)tuftAt(s[0],s[1]);}}
function genGreenhouseHerbs(m){const C=HERB_CFG.greenhouse,n=C[0]+rnd(C[1]-C[0]+1);for(let k=0;k<n;k++){const q=spotIn(m);if(q)items.push({x:q.x,y:q.y,type:'tuft',tuft:randHerb(),ph:Math.random()*6});}}

// ---- the Herbalism view
function prepOk(h){const P=player;return Object.keys(h.need).every(k=>(P.herbs[k]||0)>=h.need[k])&&(!h.cloth||(P.inv.cloth||0)>=h.cloth)&&(!h.water||P.flask.has&&P.flask.kind==='water'&&P.flask.n>=h.water);}
function prepMissing(h){const P=player;if(Object.keys(h.need).some(k=>(P.herbs[k]||0)<h.need[k]))return 'missing herbs';if(h.cloth&&(P.inv.cloth||0)<h.cloth)return 'you need cloth';return 'you need a swig of water in your flask';}
function prepCount(h){return h.kind==='draught'?(player.food[h.id]||0):(player.inv[h.id]||0);}
function makePrep(h){const P=player;if(!prepOk(h)){say(prepMissing(h));sfx('deny');return;}
  for(const k in h.need)P.herbs[k]-=h.need[k];if(h.cloth)P.inv.cloth-=h.cloth;if(h.water){P.flask.n-=h.water;if(!P.flask.n)P.flask.kind=null;}
  if(h.kind==='draught')P.food[h.id]=(P.food[h.id]||0)+1;else P.inv[h.id]=(P.inv[h.id]||0)+1;
  P.rs.herbal=(P.rs.herbal||0)+1;sfx('craft');say((h.kind==='draught'?'brewed ':'made ')+h.name.toLowerCase());}
function prepDesc(h){return h.kind==='draught'?FOOD[h.id].desc+' Takes '+FOOD[h.id].sat+' satiety.':h.desc;}
function prepNeedText(h){const parts=Object.entries(h.need).map(([k,v])=>v+' '+HERBS[k].name.toLowerCase());if(h.cloth)parts.push(h.cloth+' cloth');if(h.water)parts.push(h.water+' swig of water');return parts.join(', ');}

// ---- using preparations
function usePrep(id){const P=player,h=HERBBY[id];if(!(P.inv[id]>0)){say('none left');sfx('click');return;}
  if(h.kind==='incense'){if(P.liq>=2){say('not in deep water');sfx('click');return;}P.inv[id]--;incense.push({x:P.x,y:P.y+3,kind:id==='i_sage'?'sage':'ember',t:HERB_CFG.incense.t,ph:Math.random()*6});sfx('click');say('you set the '+h.name.toLowerCase()+' burning');return;}
  P.inv[id]--;sfx('pick');const med=1+0.2*U('medic');
  if(id==='p_redroot'){P.st.brn=0;addHot(h.heal*med,h.over);say('the poultice stings, then soothes');}
  else if(id==='p_bitter'){P.st.psn=0;P.st.rad=0;addTbuff(id,60,{poisonRes:0.4});say('the bitterness draws the sickness out');}
  else if(id==='p_mend'){P.st.psn=0;P.st.brn=0;addHot(h.heal*med,h.over);const j=(P.injuries||[])[(P.injuries||[]).length-1];
    if(j){j.left--;if(j.left<=0){P.injuries.pop();refreshStats();say('the mending poultice sets your '+INJ[j.id].name.toLowerCase()+' right');}else say('your '+INJ[j.id].name.toLowerCase()+' will heal a deck sooner');}else say('the mending poultice soothes you');}
  for(let k=0;k<8;k++)parts.push({x:P.x+rr(-4,4),y:P.y+rr(-4,4),vx:rr(-15,15),vy:rr(-25,-5),t:0.5,m:0.5,c:h.col,s:1});}
function addHot(amt,secs){player.hots=player.hots||[];player.hots.push({rate:amt/secs,t:secs});}
function addTbuff(id,secs,buff){const P=player;P.tbuffs=(P.tbuffs||[]).filter(b=>b.id!==id);P.tbuffs.push({id,t:secs,m:secs,buff});refreshStats();}
// called by eatFood() for draughts
function drinkDraught(id){const P=player,f=FOOD[id];if(f.heal){P.hp=Math.min(maxHp(),P.hp+f.heal);float(P.x,P.y-10,'+'+f.heal+' hp','#7fd08e');}addTbuff(id,f.secs,f.tbuff);if(f.tbuff.coldImm&&P.frozenT>0)thawPlayer();}
function tbuffName(b){return HERBBY[b.id]?HERBBY[b.id].name:FOOD[b.id]?FOOD[b.id].name:b.id;}

// ---- every frame
function updateHerbs(dt){const P=player,C=HERB_CFG.incense;
  if(P.hots&&P.hots.length){for(const h of P.hots){const d=Math.min(h.t,dt);h.t-=dt;P.hp=Math.min(maxHp(),P.hp+h.rate*d);}P.hots=P.hots.filter(h=>h.t>0);if(Math.random()<dt*6)parts.push({x:P.x+rr(-4,4),y:P.y+rr(-3,3),vx:0,vy:-12,t:0.5,m:0.5,c:'#7fd08e',s:1});}
  if(P.tbuffs&&P.tbuffs.length){let gone=false;for(const b of P.tbuffs){b.t-=dt;if(b.t<=0)gone=true;}if(gone){for(const b of P.tbuffs)if(b.t<=0)say(tbuffName(b).toLowerCase()+' wears off');P.tbuffs=P.tbuffs.filter(b=>b.t>0);refreshStats();}}
  if(!incense.length)return;
  for(const s of incense){s.t-=dt;s.ph+=dt;if(Math.random()<dt*3)puff(s.x,s.y-6,'incense',3,s);if(Math.random()<dt*8)parts.push({x:s.x+rr(-1,1),y:s.y-3,vx:rr(-3,3),vy:rr(-18,-10),t:0.8,m:0.8,c:s.kind==='sage'?'rgba(210,215,215,0.8)':'rgba(240,170,100,0.8)',s:1});
    const d=Math.hypot(P.x-s.x,P.y-s.y);
    if(s.kind==='sage'){if(d<C.sageR&&P.hp<maxHp())P.hp=Math.min(maxHp(),P.hp+C.sageRegen*dt);}
    else{if(d<C.emberR){if(P.frozenT>0)thawPlayer();P.st.frz=Math.max(0,P.st.frz-C.emberThaw*dt);P.st.wet=Math.max(0,P.st.wet-C.emberDry*dt);}
      for(const e of enemies){if(e.dead||Math.hypot(e.x-s.x,e.y-s.y)>=C.emberR+e.r)continue;if(e.frozenT>0)thawEnemy(e);e.frz=0;}}}
  for(const s of incense)if(s.t<=0)for(const c of clouds)if(c.src===s)c.src=null;
  incense=incense.filter(s=>s.t>0);}
// grey sage incense stops disturbance building (alertAdd / updateAlert)
function sageCalm(){return incense.some(s=>s.kind==='sage');}
// emberleaf warmth: nothing freezes inside it (addStatus 'frz', chillEnemy)
function inEmber(x,y,r){return incense.some(s=>s.kind==='ember'&&Math.hypot(x-s.x,y-s.y)<HERB_CFG.incense.emberR+(r||0));}

// ---- drawing
function drawTuft(it,x,y){const H=HERBS[it.tuft]||HERBS.redroot,c=H.col,k=it.tuft;F('#14200e',x-3,y-1,7,4);
  if(k==='redroot'){F(c,x-2,y-4,1,5);F(c,x,y-5,1,6);F(c,x+2,y-3,1,4);F('#ff8a6a',x,y-5,1,1);}
  else if(k==='bitterwort'){F(c,x-3,y-2,3,2);F(c,x,y-4,3,3);F('#5a7a4a',x-1,y-1,4,2);}
  else if(k==='emberleaf'){F(c,x-2,y-3,4,3);F('#ffc070',x-1,y-4,2,1);F('#a85a1a',x+1,y-1,2,1);}
  else if(k==='greysage'){F(c,x,y-5,1,6);F(c,x-2,y-3,2,1);F(c,x+1,y-2,2,1);F('#e8eeea',x-1,y-4,1,1);}
  else{F(c,x-3,y-2,7,3);F('#4a8a3e',x-2,y-3,2,1);F('#2a4a22',x+1,y-1,2,1);}}
function prepIcon(id,x,y){const h=HERBBY[id];if(!h)return false;
  if(h.kind==='poultice'){F('#15110a',x-4,y-3,9,7);F('#d8d0b8',x-3,y-2,7,5);F(h.col,x-2,y-1,5,3);return true;}
  if(h.kind==='incense'){F('#15110a',x-1,y-5,3,10);F('#6a5a40',x,y-4,1,8);F(h.col,x,y-5,1,2);F('#3a3028',x-2,y+3,5,2);return true;}
  F('#15110a',x-3,y-4,7,9);F('#5a6a6a',x-2,y-3,5,7);F(h.col||FOOD[id].col,x-2,y-1,5,4);return true;}
function drawIncense(){for(const s of incense){const x=Math.round(s.x-camX),y=Math.round(s.y-camY);if(x<-40||y<-40||x>W+40||y>H+40)continue;
  const warm=s.kind==='ember',R=warm?HERB_CFG.incense.emberR:18,g=ctx.createRadialGradient(x,y-2,1,x,y-2,R);g.addColorStop(0,warm?'rgba(255,160,80,0.28)':'rgba(220,230,220,0.18)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-R,y-2-R,R*2,R*2);
  F('#3a3028',x-2,y,5,2);F('#6a5a40',x,y-5,1,5);F(Math.sin(s.ph*9)>0?'#ffb060':'#ff7a3a',x,y-6,1,1);}}
