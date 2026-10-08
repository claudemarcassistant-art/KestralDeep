// ---------- plate doors and crates ----------
// A plate door is a wall tile that opens only while its floor plate holds PLATE_DOOR_CFG.need weight (weightAt() in
// 30-traps.js counts the player, walking creatures, crates and dropped items). genPlateDoors() places them during deck
// generation (seeded) in front of a small loot room, a vault-style room with a chest, or as a shortcut through a wall,
// always with a crate (or loose junk) near the plate. fillPlateRooms() stocks the rooms at the end of populate().
// Crates live in barrels[] with crate:true, so shoves, kicks, telekinesis, fans and gravity wells move them.
let plateDoors=[];
function itemWeight(it){return ITEM_WEIGHT[it.type]||1;}
function mkCrate(tx,ty,wood){const b=mkBarrel(tx,ty);b.crate=true;b.wood=wood!==false;return b;}
function breakCrate(b){if(b.dead||!b.wood)return;b.dead=true;sfx('crumble');shake=Math.max(shake,2);
  for(let k=0;k<10;k++)parts.push({x:b.x+rr(-4,4),y:b.y+rr(-4,4),vx:rr(-60,60),vy:rr(-60,60),t:0.4,m:0.4,c:k%2?'#8a6a3a':'#b08a50',s:rnd(2)+1});
  items.push({x:b.x,y:b.y,type:'scrap',amt:CRATE_CFG.scrap[0]+rnd(CRATE_CFG.scrap[1]-CRATE_CFG.scrap[0]+1),ph:0,pop:0.3});float(b.x,b.y-8,'the crate splinters','#c8a070');}
// loose items slide when thrown about (repulse): it.kvx/it.kvy decay to a stop
function updateLoose(dt){for(const it of items){if(!it.kvx&&!it.kvy)continue;const nx=it.x+it.kvx*dt,ny=it.y+it.kvy*dt;
  if(solidAt(nx,ny)){it.kvx=it.kvy=0;continue;}it.x=nx;it.y=ny;const f=Math.pow(0.02,dt);it.kvx*=f;it.kvy*=f;if(Math.hypot(it.kvx,it.kvy)<4)it.kvx=it.kvy=0;}}

// ---- generation
// a floor tile near (x,y) on the plate side for a crate: reachable from the plate, open on all four sides
function crateSpotNear(px,py,avoid){const dist=bfs(px,py,new Int16Array(MW*MH)),c=[];
  for(let y=py-5;y<=py+5;y++)for(let x=px-5;x<=px+5;x++){if(x<2||y<2||x>=MW-2||y>=MH-2)continue;const i=y*MW+x,d=dist[i];
    if(d<2||d>6||liq[i]>=2||chasm[i]||molten[i]||hz[i]||avoid.some(([ax,ay])=>Math.abs(ax-x)+Math.abs(ay-y)<2))continue;
    if(D4.some(([dx,dy])=>solid(x+dx,y+dy))||barrels.some(b=>b.tx===x&&b.ty===y))continue;c.push([x,y]);}
  return c.length?c[rnd(c.length)]:null;}
function plateSpot(dx0,dy0,ex,ey){for(const k of [3,2]){const x=ex+dx0*k,y=ey+dy0*k,i=y*MW+x;if(!solid(x,y)&&liq[i]<2&&!chasm[i]&&!molten[i]&&!hz[i]&&kind[i]<2)return [x,y];}return null;}
function addPlateDoor(kd,ex,ey,dx0,dy0,room){const ps=plateSpot(dx0,dy0,ex,ey);if(!ps)return null;
  const pd={tx:ex,ty:ey,px:ps[0],py:ps[1],dir:[dx0,dy0],kind:kd,room,state:'closed',t:0,hinted:false};
  const cs=crateSpotNear(ps[0],ps[1],[[ex,ey],ps]);
  if(cs)barrels.push(mkCrate(cs[0],cs[1],Math.random()<0.75));
  else{const d=bfs(ps[0],ps[1],new Int16Array(MW*MH));pd.junk=[];  // no room for a crate: fillPlateRooms() leaves loose junk nearby (populate() clears items)
    for(let y=ps[1]-3;y<=ps[1]+3;y++)for(let x=ps[0]-3;x<=ps[0]+3;x++)if(x>0&&y>0&&x<MW-1&&y<MH-1&&d[y*MW+x]>=1&&d[y*MW+x]<=3&&!(x===ex&&y===ey))pd.junk.push([x,y]);if(!pd.junk.length)return null;}
  plateDoors.push(pd);return pd;}
// a wall one tile thick between two stretches of floor that are far apart on foot
function shortcutDoor(start){
  for(let tries=0;tries<30;tries++){const x=3+rnd(MW-6),y=3+rnd(MH-6),i=y*MW+x;if(map[i]!==1)continue;
    const dirs=[[1,0],[0,1]].filter(([dx,dy])=>!solid(x+dx,y+dy)&&!solid(x-dx,y-dy)&&kind[(y+dy)*MW+x+dx]<2&&kind[(y-dy)*MW+x-dx]<2);if(!dirs.length)continue;
    const [dx,dy]=dirs[0];if(Math.abs(x-exitT.x)+Math.abs(y-exitT.y)<5||Math.abs(x-start.cx)+Math.abs(y-start.cy)<6)continue;
    if(plateDoors.some(p=>Math.abs(p.tx-x)+Math.abs(p.ty-y)<6))continue;
    const d=bfs(x+dx,y+dy,new Int16Array(MW*MH))[(y-dy)*MW+x-dx];if(d<PLATE_DOOR_CFG.shortcutMin)continue;
    const s=Math.random()<0.5?1:-1;return addPlateDoor('shortcut',x,y,dx*s,dy*s,null);}
  return null;}
function genPlateDoors(start){const C=PLATE_DOOR_CFG,mode=levelMods.pdoor||'normal';
  if(mode==='off'||mode==='normal'&&depth<C.minDepth)return;
  const n=mode==='on'?Math.max(1,aN(1)):aN(C.chance);
  for(let k=0;k<n;k++){const kd=wpick(C.kinds);
    if(kd==='shortcut'){if(shortcutDoor(start))continue;}
    const r=attach(1,3+rnd(2),3+rnd(2),kd==='vault'?2:1);if(!r)continue;
    // the door tile stays wall until its plate is held; the plate goes on the far side, facing the door
    const out=D4.find(([dx,dy])=>{const x=r.ex+dx,y=r.ey+dy;return !solid(x,y)&&!(x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);});
    if(!out||!addPlateDoor(kd,r.ex,r.ey,out[0],out[1],r)){for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){map[y*MW+x]=1;kind[y*MW+x]=0;}}}}
// stock the rooms behind plate doors (called at the end of populate(), still in the deck's seeded scope)
function fillPlateRooms(){for(const pd of plateDoors){const r=pd.room;
  if(pd.junk)for(let k=0;k<PLATE_DOOR_CFG.need;k++){const [x,y]=pd.junk[rnd(pd.junk.length)];items.push({x:x*TS+6+rr(-3,3),y:y*TS+6+rr(-3,3),type:'scrap',amt:1,ph:Math.random()*6});}
  if(!r)continue;
  if(pd.kind==='vault'){addChest(r,Math.random()<0.4?'rare':'common');addItem(r,pickItem());}
  else{const n=2+rnd(3);for(let k=0;k<n;k++)addItem(r,pickItem());if(Math.random()<0.35)addItem(r,'gear',{gear:randomGear()});}}}

// ---- running
function plateWeight(pd){return weightAt(pd.px,pd.py);}
function doorBlocked(pd){const i=pd.ty*MW+pd.tx,p=player;if(p&&tileIdx(p)===i)return true;
  return enemies.some(e=>!e.dead&&tileIdx(e)===i)||barrels.some(b=>!b.dead&&b.tx===pd.tx&&b.ty===pd.ty);}
function setPlateDoor(pd,open){const i=pd.ty*MW+pd.tx;map[i]=open?0:1;paintArea(pd.tx,pd.ty);flowT=0;
  if(!open)for(const it of items)if(tileIdx(it)===i){it.x+=pd.dir[0]*TS;it.y+=pd.dir[1]*TS;}}
function updatePlateDoors(dt){const C=PLATE_DOOR_CFG,p=player;
  for(const pd of plateDoors){const held=plateWeight(pd)>=C.need;
    if(pd.state==='closed'){if(held){pd.state='open';setPlateDoor(pd,true);sfx('door');shake=Math.max(shake,1);}}
    else if(pd.state==='open'){if(!held){pd.state='closing';pd.t=C.warn;sfx('grind');}}
    else if(pd.state==='closing'){if(held){pd.state='open';continue;}pd.t-=dt;if(Math.random()<dt*10)parts.push({x:pd.tx*TS+rr(0,12),y:pd.ty*TS+rr(0,12),vx:rr(-10,10),vy:rr(-10,10),t:0.3,m:0.3,c:'#8e978b',s:1});
      if(pd.t<=0){if(doorBlocked(pd))pd.t=0.25;else{pd.state='closed';setPlateDoor(pd,false);sfx('thud');shake=Math.max(shake,2);}}}
    if(!pd.hinted&&pd.state==='closed'&&p&&Math.hypot(pd.tx*TS+6-p.x,pd.ty*TS+6-p.y)<22){pd.hinted=true;float(pd.tx*TS+6,pd.ty*TS,'heavy door. weigh its plate down','#e0c080');}}}

// ---- drawing (floor layer)
function drawPlateDoors(){
  for(const pd of plateDoors){const si=seen[pd.ty*MW+pd.tx],sp=seen[pd.py*MW+pd.px];if(!si&&!sp)continue;
    const dx=pd.tx*TS-camX,dy=pd.ty*TS-camY,px=pd.px*TS-camX,py=pd.py*TS-camY;if(Math.min(dx,px)>W+TS||Math.max(dx,px)<-2*TS||Math.min(dy,py)>H+TS||Math.max(dy,py)<-2*TS)continue;
    const w=plateWeight(pd),held=w>=PLATE_DOOR_CFG.need;
    ctx.strokeStyle=held?'rgba(140,220,150,0.35)':'rgba(217,164,65,0.3)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px+6.5,py+6.5);ctx.lineTo(dx+6.5,dy+6.5);ctx.stroke();
    // the plate: a framed steel plate with three weight pips
    F('#1a1c18',px,py,TS,TS);F(held?'#3a4a3a':'#4a4c44',px+1,py+1,TS-2,TS-2);for(let k=0;k<4;k++){F('#d9a441',px+k*3,py,2,1);F('#d9a441',px+1+k*3,py+TS-1,2,1);}
    for(let k=0;k<PLATE_DOOR_CFG.need;k++)F(k<w?(held?'#8fe09a':'#e0c060'):'#262824',px+3+k*2.5,py+5,2,2);
    // the door
    const vert=pd.dir[0]!==0;
    if(pd.state==='open'){if(vert){F('#3c423e',dx+4,dy,4,2);F('#3c423e',dx+4,dy+TS-2,4,2);}else{F('#3c423e',dx,dy+4,2,4);F('#3c423e',dx+TS-2,dy+4,2,4);}}
    else{const fl=pd.state==='closing'&&Math.sin(T*24)>0;F('#141614',dx,dy,TS,TS);F(fl?'#6a5a30':'#3c423e',dx+1,dy+1,TS-2,TS-2);
      for(let k=0;k<3;k++)F(fl?'#ffd060':'#d9a441',vert?dx+3:dx+2+k*3,vert?dy+2+k*3:dy+3,vert?6:2,vert?2:6);
      F(held?'#8fe09a':'#c04030',dx+5,dy+5,2,2);}}}
