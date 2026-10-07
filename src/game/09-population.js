// ---------- population ----------
function mkEnemy(type,x,y){const b=ET[type],m=1+(depth-1)*0.12;
  return {seg:b.snake?Array.from({length:8},(_,i)=>({x:x-i*3,y:y+Math.sin(i*0.9)*2})):null,type,x,y,r:b.r,hp:b.hp*m,spd:b.spd*(1+(depth-1)*0.04),alert:false,cd:rr(0,1),flash:0,wx:0,wy:0,wt:0,vx:0,vy:0,ph:Math.random()*6,sd:Math.random()<.5?1:-1,dead:false};}
function freeTile(r){for(let t=0;t<30;t++){const tx=r.x+rnd(r.w),ty=r.y+rnd(r.h);
  if(map[ty*MW+tx]===0&&!chasm[ty*MW+tx]&&!(tx===exitT.x&&ty===exitT.y)&&!chests.some(c=>c.tx===tx&&c.ty===ty))return {tx,ty};}return null;}
function spotIn(r){const t=freeTile(r);return t?{x:t.tx*TS+TS/2+rr(-2,2),y:t.ty*TS+TS/2+rr(-2,2)}:null;}
function fixLoot(it){if(it.type==='food'&&!FOOD[it.food])it.food=randFood();if(it.type==='raw'&&!RAW[it.raw])it.raw=randRaw();if(it.type==='tool'&&!TOOLS[it.tool])it.tool=Object.keys(TOOLS)[rnd(Object.keys(TOOLS).length)];
  if(it.type==='gear'&&!GEAR[it.gear])it.gear=randomGear();if(it.type==='file'&&!it.file){const f=randomFileId();if(f)it.file=f;else{it.type='scrap';}}return it;}
function areaName(){const P=player,tx=Math.floor(P.x/TS),ty=Math.floor(P.y/TS),inR=r=>r&&tx>=r.x&&tx<r.x+r.w&&ty>=r.y&&ty<r.y+r.h;
  if(arcadeMode)return 'arcade';if(arrival&&Math.abs(tx-arrival.cx)<=1&&Math.abs(ty-arrival.cy)<=1)return 'lift cab';if(stopMode)return stopAmbush?'lift landing':'landing';if(testMode&&!testDeck)return 'test range';
  for(const m of modules||[])if(inR(m))return MODS[m.type].name;for(const v of vaults||[])if(inR(v))return 'vault';for(const r of secrets||[])if(inR(r))return 'secret room';
  for(const r of hatchRooms||[])if(inR(r))return 'below deck';for(const r of ventRooms||[])if(inR(r))return 'service crawlspace';
  for(let i=0;i<rooms.length;i++){const r=rooms[i];if(!inR(r))continue;if(i===0)return 'arrival landing';if(tx>=exitT.x-3&&tx<=exitT.x+3&&ty>=exitT.y-3&&ty<=exitT.y+3&&inR(r))return 'lift room';
    if(cond&&cond.obj==='arena'&&r.w>=20)return 'arena';const bi=biomeOverride!=null?biomeOverride:(depth-1)%BIOME.length,L=ROOMNAMES[bi%ROOMNAMES.length];return L[(r.x*7+r.y*13)%L.length]+(r.dark?' (no lights)':'');}
  return 'corridor';}
function addItem(r,type,extra){if(runMods.lean&&!testMode&&Math.random()<0.45)return;if(type==='food'&&!extra)extra={food:randFood()};if(type==='tool'&&!extra)extra={tool:Object.keys(TOOLS)[rnd(3)]};if(type==='raw'&&!extra)extra={raw:randRaw()};const p=spotIn(r);if(p)items.push(Object.assign({x:p.x,y:p.y,type,ph:Math.random()*6},extra||{}));}
function addChest(r,tier){const t=freeTile(r);if(t)chests.push({tx:t.tx,ty:t.ty,x:t.tx*TS+TS/2,y:t.ty*TS+TS/2,tier,opened:false});}
function randomRoom(){return rooms[1+rnd(rooms.length-1)];}
let wetness=0;
function pickType(){return wpick([['husk',5],['crawler',depth>=2?3:1],['spitter',depth>=2?2:0],['snake',(depth>=2?1.5:0.4)+wetness*25],['arcsnake',depth>=3?0.3+depth*0.08+wetness*15:0],['charger',depth>=2?0.4+depth*0.12:0],['drone',depth>=2?1:0.2],['slug',1.2],['toxslug',depth>=2?1:0],['snail',depth>=2?0.9:0.2],['wasp',0.25+(cond&&cond.haz==='overgrowth'?2.5:0)],['guard',depth>=4?0.3+(depth-4)*0.12:0],['spider',(depth>=2?0.9:0.2)+(cond&&cond.haz==='overgrowth'?1.5:0)+(cond&&cond.light==='dark'?1:0)],['frog',(depth>=2?0.9:0.2)+wetness*12+(cond&&cond.haz==='overgrowth'?2:0)],['brute',depth>=3?0.3+(depth-3)*0.18:0]]);}
function pickItem(){return wpick([['tool',0.2],['raw',0.5],['flask',0.3],['food',1.1],['rounds',4],['shells',depth>=2?2:0.5],['nails',depth>=2?1.5:0.5],['bolts',0.5],['scrap',4],['powder',3],['pipe',1.8],['battery',1.2],['cloth',2],['medkit',1.4]]);}
function ownedGear(){return [...equippedList(),...player.bag];}
function randomGear(){const own=ownedGear();let pool=Object.keys(GEAR).filter(k=>!own.includes(k));if(!pool.length)pool=Object.keys(GEAR);
  return wpick(pool.map(k=>[k,GEAR[k].w]));}
function populate(startR,exitR){
  enemies=[];items=[];chests=[];const got={};
  {let budget=(4+depth*1.6)*AREA*(runMods.swarm?1.33:1)*(levelMods.enemyMul||1)*rr(0.9,1.1);const caps={brute:depth<3?0:1+Math.floor((depth-3)/3),guard:depth<4?0:1+Math.floor((depth-4)/3),charger:1+Math.floor(depth/4),grasper:1+Math.floor(depth/4)},cnt={};
    const pool=rooms.filter(r=>r!==startR);const wts=pool.map(r=>Math.max(1,r.w*r.h/12)+(r===exitR?2:0));let guard=0;
    while(budget>0.5&&pool.length&&guard++<200*AREA){let t=pickType();if(caps[t]!=null&&(cnt[t]||0)>=caps[t])t=depth>=3&&Math.random()<0.5?'crawler':'husk';const c=THREAT[t]||1.5;if(c>budget+0.5)t='husk';
      let x=Math.random()*wts.reduce((a,b)=>a+b,0),ri=0;while(x>wts[ri]&&ri<wts.length-1){x-=wts[ri];ri++;}const p=spotIn(pool[ri]);if(!p)continue;enemies.push(mkEnemy(t,p.x,p.y));cnt[t]=(cnt[t]||0)+1;budget-=THREAT[t]||1.5;
      if(t==='wasp'&&Math.random()<0.6){const extra=1+rnd(3);for(let k=0;k<extra;k++){enemies.push(mkEnemy('wasp',p.x+rr(-10,10),p.y+rr(-10,10)));budget-=THREAT.wasp;}}}}
  for(const r of rooms){if(r===startR)continue;
    const ni=rnd(3);
    for(let k=0;k<ni;k++){const t=pickItem();got[t]=1;addItem(r,t);}
  }
  if(Math.random()<0.3+Math.min(0.25,depth*0.03)){const fid=randomFileId();if(fid){const r=vaults.length&&Math.random()<0.6?vaults[rnd(vaults.length)]:randomRoom();addItem(r,'file',{file:fid});}}
  for(let k=aN(1);k>0;k--)if(Math.random()<0.45)addChest(randomRoom(),'common');
  for(let k=aN(levelMods.chests||0);k>0;k--)addChest(randomRoom(),Math.random()<.3?'rare':'common');
  for(const v of vaults){
    if(Math.random()<.65)addChest(v,'common');
    const ni=1+rnd(3);for(let k=0;k<ni;k++)addItem(v,pickItem());
    if(Math.random()<.5){const n=1+rnd(1+Math.floor(depth/2));for(let k=0;k<n;k++){const p=spotIn(v);if(p)enemies.push(mkEnemy(pickType(),p.x,p.y));}}
  }
  for(const s of secrets){
    if(Math.random()<.85)addChest(s,'rare');
    const ni=1+rnd(2);for(let k=0;k<ni;k++){if(Math.random()<.3)addItem(s,'gear',{gear:randomGear()});else addItem(s,pickItem());}
  }
  {const big=rooms.slice(1).filter(r=>r.w*r.h>=40&&r!==rooms[0]);big.sort(()=>Math.random()-.5);let nd=Math.random()<0.45?1+(Math.random()<0.3?1:0):0;for(const r of big){if(nd--<=0)break;r.dark=true;}}
  for(const m of modules)fillModule(m);
  for(const r of ventRooms)fillHidden(r,wpick(HIDDEN_TYPES));
  for(const r of hatchRooms)fillHidden(r,wpick([...HIDDEN_TYPES,['cage',2]]));
  if(Math.random()<0.25)addItem(randomRoom(),'schematic');
  if(secrets.length&&Math.random()<0.3)addItem(randomRoom(),'secretmap');
  if(Math.random()<0.2)addItem(randomRoom(),'gear',{gear:randomGear()});
  if(depth===1&&!ownedGear().includes('barrellight'))addItem(randomRoom(),'gear',{gear:'barrellight'});
  const nk=Math.max(1,vaults.length+chests.length-rnd(2));
  for(let k=0;k<nk;k++)addItem(randomRoom(),'key');
  for(const t of ['pipe','battery'])if(!got[t])addItem(randomRoom(),t);
  const og=cond&&cond.haz==='overgrowth';
  {const nm=aN(og?6+rnd(4):(Math.random()<0.2?1:0)),ns=aN(og?6+rnd(4):0);for(let k=0;k<nm+ns;k++){const q=spotIn(randomRoom());if(q)plants.push({x:q.x,y:q.y,type:k<nm?'mend':'sting',burst:false,ph:Math.random()*6});}}
  if(og){const nv=aN(2+rnd(3));for(let k=0;k<nv;k++){const q=spotIn(randomRoom());if(q)enemies.push(mkEnemy('snare',q.x,q.y));}
    placeWallPlants('pod',aN(3+rnd(3)));placeWallPlants('trip',aN(3+rnd(3)));
    {const bl=plants.slice().sort(()=>Math.random()-0.5).slice(0,1+rnd(2));for(const pl of bl){const n=2+rnd(3);for(let k=0;k<n;k++)enemies.push(mkEnemy('wasp',pl.x+rr(-12,12),pl.y+rr(-12,12)));}}
    const nh=aN(3+rnd(3));for(let k=0;k<nh;k++)addItem(randomRoom(),'herb');const nf=aN(3+rnd(3));for(let k=0;k<nf;k++)addItem(randomRoom(),'food',{food:['mushroom','fruit','nuts'][rnd(3)]});
    if(Math.random()<0.18)addItem(randomRoom(),'raw',{raw:'glowcap'});
    const nr=aN(5+rnd(4));for(let k=0;k<nr;k++){const id=['tuber','tuber','spores','grubs','berries'][rnd(5)];let placed=false;
      if(id==='berries'||Math.random()<0.4){const pl=plants.filter(q=>!q.burst&&(id==='berries'?q.type==='sting':true));if(pl.length){const q=pl[rnd(pl.length)],qx=Math.floor(q.x/TS),qy=Math.floor(q.y/TS);for(const [dx,dy] of D8){const x=qx+dx,y=qy+dy;if(!solid(x,y)&&!plants.some(z=>Math.floor(z.x/TS)===x&&Math.floor(z.y/TS)===y)){items.push({x:x*TS+6,y:y*TS+6,type:'raw',raw:id,ph:Math.random()*6});placed=true;break;}}}}
      if(!placed)addItem(randomRoom(),'raw',{raw:id});}}
  if(cond&&cond.haunt){const ng=Math.max(1,aN(3+rnd(3)));for(let k=0;k<ng;k++){const r=randomRoom();enemies.push(mkEnemy('ghost',r.cx*TS+6,r.cy*TS+6));}}
  {const deep=[];for(let i=0;i<MW*MH;i++)if(map[i]===0&&liq[i]>=3&&kind[i]>=1)deep.push(i);
    if(deep.length>=6){const n=Math.min(3,1+Math.floor(deep.length/30));for(let k=0;k<n;k++){const pick=deep.filter(i=>liq[i]===4);const src=pick.length?pick:deep;const i=src[rnd(src.length)];
      enemies.push(mkEnemy('lurker',(i%MW)*TS+6,((i/MW)|0)*TS+6));}
    if(depth>=2&&deep.length>=10){const shore=deep.filter(i=>{const x=i%MW,y=(i/MW)|0;return D4.some(([dx,dy])=>liq[(y+dy)*MW+x+dx]<3&&map[(y+dy)*MW+x+dx]===0);});
      const ng=Math.min(2,Math.floor(deep.length/40)+(Math.random()<0.6?1:0));for(let k=0;k<ng&&shore.length;k++){const i=shore[rnd(shore.length)];enemies.push(mkEnemy('grasper',(i%MW)*TS+6,((i/MW)|0)*TS+6));}}}}
}

