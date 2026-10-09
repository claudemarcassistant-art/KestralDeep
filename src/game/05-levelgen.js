// ---------- level generation ----------
function setF(x,y){if(x>0&&y>0&&x<MW-1&&y<MH-1)map[y*MW+x]=0;}
let CW=2;
function hline(x0,x1,y){for(let x=Math.min(x0,x1);x<=Math.max(x0,x1)+CW-1;x++)for(let k=0;k<CW;k++)setF(x,y+k);}
function vline(y0,y1,x){for(let y=Math.min(y0,y1);y<=Math.max(y0,y1)+CW-1;y++)for(let k=0;k<CW;k++)setF(x+k,y);}
function corridor(a,b){if(Math.random()<.5){hline(a.cx,b.cx,a.cy);vline(a.cy,b.cy,b.cx);}else{vline(a.cy,b.cy,a.cx);hline(a.cx,b.cx,b.cy);}}
// Walking distance in tiles from (sx,sy) to every open tile; -1 where unreachable.
let bfsQ=new Int32Array(MW*MH);
function bfs(sx,sy,out){
  out.fill(-1);if(solid(sx,sy))return out;
  if(bfsQ.length<MW*MH)bfsQ=new Int32Array(MW*MH);const q=bfsQ;let h=0,t=0;const s=sy*MW+sx;out[s]=0;q[t++]=s;
  while(h<t)t=bfsExpand(q[h++],out,q,t);
  return out;
}
// Visit the open neighbours of tile c (same result as checking solid() on each of D4).
function bfsExpand(c,out,q,t){const cx=c%MW,cy=(c/MW)|0,d=out[c]+1;let n;
  n=c+1;if(cx<MW-1&&map[n]===0&&out[n]<0){out[n]=d;q[t++]=n;}
  n=c-1;if(cx>0&&map[n]===0&&out[n]<0){out[n]=d;q[t++]=n;}
  n=c+MW;if(cy<MH-1&&map[n]===0&&out[n]<0){out[n]=d;q[t++]=n;}
  n=c-MW;if(cy>0&&map[n]===0&&out[n]<0){out[n]=d;q[t++]=n;}
  return t;}
// The creature pathfinding field (`flow`, distance to the player) is rebuilt continuously in slices: each frame
// searches about an eighth of the deck into flowB, which replaces flow when complete. No frame pays for a
// whole-deck search, which matters on large decks. Setting flowT=0 (doors opening, walls breaking) restarts it at once.
let flowB=new Int16Array(MW*MH),flowQ=new Int32Array(MW*MH),flowJob=null;
function flowTick(){const p=player,N=MW*MH;
  if(flowT<=0||!flowJob){flowT=1;const sx=Math.floor(p.x/TS),sy=Math.floor(p.y/TS);flowJob=null;if(solid(sx,sy))return;
    flowB.fill(-1);const s=sy*MW+sx;flowB[s]=0;flowQ[0]=s;flowJob={h:0,t:1};}
  const J=flowJob,end=J.h+Math.max(256,Math.ceil(N/8));let t=J.t;
  while(J.h<t&&J.h<end)t=bfsExpand(flowQ[J.h++],flowB,flowQ,t);J.t=t;
  if(J.h>=J.t){const tmp=flow;flow=flowB;flowB=tmp;flowJob=null;}}
function attach(tt,W0,H0,KD){
  for(let t=0;t<400;t++){
    const fx=1+rnd(MW-2),fy=1+rnd(MH-2),fi=fy*MW+fx;
    if(map[fi]!==0||kind[fi]>=2)continue;
    const [dx,dy]=D4[rnd(4)],ex=fx+dx,ey=fy+dy;
    if(map[ey*MW+ex]!==1)continue;
    const w=W0||3+rnd(3),h=H0||3+rnd(3);let rx,ry;
    if(dx===1){rx=ex+1;ry=ey-rnd(h);}else if(dx===-1){rx=ex-w;ry=ey-rnd(h);}else if(dy===1){ry=ey+1;rx=ex-rnd(w);}else{ry=ey-h;rx=ex-rnd(w);}
    if(rx<2||ry<2||rx+w>MW-2||ry+h>MH-2)continue;
    let ok=true;for(let y=ry-1;y<=ry+h&&ok;y++)for(let x=rx-1;x<=rx+w;x++)if(map[y*MW+x]!==1){ok=false;break;}
    if(!ok)continue;
    if(Math.abs(ex-exitT.x)+Math.abs(ey-exitT.y)<3)continue;
    for(let y=ry;y<ry+h;y++)for(let x=rx;x<rx+w;x++){map[y*MW+x]=0;kind[y*MW+x]=KD||(tt===2?2:3);}
    map[ey*MW+ex]=tt;if(tt===3)secretHp[ey*MW+ex]=6;
    return {x:rx,y:ry,w,h,cx:rx+(w>>1),cy:ry+(h>>1),ex,ey,known:false,open:false};
  }
  return null;
}
let cables=[],cableMap=new Map(),barrels=[],risers=[];
let slime=new Uint8Array(MW*MH),slimeK=new Uint8Array(MW*MH);
function clearSlimeAround(x,y,rad){const tx=Math.floor(x/TS),ty=Math.floor(y/TS),r=Math.ceil(rad/TS);for(let yy=ty-r;yy<=ty+r;yy++)for(let xx=tx-r;xx<=tx+r;xx++){if(xx<0||yy<0||xx>=MW||yy>=MH)continue;const i=yy*MW+xx;if(slime[i]&&Math.hypot(xx*TS+6-x,yy*TS+6-y)<=rad+6){slime[i]=0;if(Math.random()<.5)parts.push({x:xx*TS+6,y:yy*TS+6,vx:rr(-6,6),vy:rr(-20,-8),t:0.5,m:0.5,c:'#6a6a50',s:2});}}}
function slimeAnchor(tx,ty){const h=hash(tx*7+3,ty*13+5);return [tx*TS+6+((h%7)-3)*1.1,ty*TS+6+(((h>>>4)%7)-3)*1.1];}
function drawSlime(tx,ty,sl,k){
  const i=ty*MW+tx,[ax,ay]=slimeAnchor(tx,ty),x=ax-camX,y=ay-camY,h=hash(tx,ty),a=0.13+0.07*sl;
  const col=k===2?`rgba(120,210,40,${a})`:`rgba(190,200,90,${a})`;
  ctx.strokeStyle=col;ctx.lineCap='round';
  const has=(xx,yy)=>xx>=0&&yy>=0&&xx<MW&&yy<MH&&slime[yy*MW+xx]>0;
  for(const [dx,dy] of D8){const nx=tx+dx,ny=ty+dy;if(!has(nx,ny))continue;if(dx&&dy&&(has(tx+dx,ty)||has(tx,ty+dy)))continue;
    const n=ny*MW+nx,[bx,by]=slimeAnchor(nx,ny),hp=hash(Math.min(i,n),Math.max(i,n)),len=Math.hypot(bx-ax,by-ay)||1;
    const bend=((hp%9)-4)*0.9,cx=(ax+bx)/2-(by-ay)/len*bend,cy=(ay+by)/2+(bx-ax)/len*bend;
    const mx=0.25*ax+0.5*cx+0.25*bx,my=0.25*ay+0.5*cy+0.25*by;
    ctx.lineWidth=2+Math.min(sl,slime[n])*0.6+((hp>>>5)%3)*0.4;
    ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo((ax+cx)/2-camX,(ay+cy)/2-camY,mx-camX,my-camY);ctx.stroke();}
  ctx.fillStyle=col;ctx.beginPath();
  const r1=2.2+sl*0.5+(h%3)*0.4,r2=1.6+sl*0.35;ctx.ellipse(x,y,r1,r2,(h%8)*0.4,0,6.283);
  if(sl>=2&&(h>>>7)%3===0){const ox=((h>>>9)%5)-2,oy=((h>>>12)%5)-2;ctx.moveTo(x+ox+2,y+oy);ctx.ellipse(x+ox,y+oy,2,1.4,(h%5)*0.6,0,6.283);}
  ctx.fill();
  if((h>>>14)%4===0){ctx.beginPath();ctx.ellipse(x+((h>>>16)%7)-3,y+((h>>>19)%7)-3,1,0.8,0,0,6.283);ctx.fill();}
  ctx.lineCap='butt';
  ctx.fillStyle=`rgba(255,255,230,${0.1+0.05*sl})`;ctx.fillRect(Math.round(x-1),Math.round(y-1),1,1);
  if(k===2&&Math.random()<0.01)parts.push({x:ax+rr(-2,2),y:ay+rr(-2,2),vx:0,vy:-8,t:0.5,m:0.5,c:'#a0e040',s:1});
}
let oil=new Uint8Array(MW*MH),oilIgnite=[],oilCur=0;
function oilOK(i){return map[i]===0&&liq[i]===0&&hz[i]!==1&&hz[i]!==2;}
function spillOil(tx,ty,R,amt){blob(tx,ty,R,(i,x,y,d)=>{if(!oilOK(i))return;const v=Math.max(1,Math.min(3,amt-d));if(v>oil[i])oil[i]=v;});}
function genOil(start){
  const n=aN(cond.haz==='volatile'?5+rnd(3):(Math.random()<0.5?1+rnd(2):0));
  for(let k=0;k<n;k++){for(let t=0;t<30;t++){const r=randomRoom(),x=r.x+rnd(r.w),y=r.y+rnd(r.h),i=y*MW+x;
    if(!oilOK(i)||Math.abs(x-start.cx)+Math.abs(y-start.cy)<5)continue;let nearFire=false;
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const j=(y+dy)*MW+x+dx;if(j>=0&&j<MW*MH&&hz[j]===1)nearFire=true;}if(nearFire)continue;
    spillOil(x,y,1+rnd(3),3);break;}}
  for(const b of barrels)if(!b.crate&&Math.random()<0.35)spillOil(b.tx,b.ty,1,2);
}
function oilSpillSize(tx,ty){let c=0;const seenS=new Set([ty*MW+tx]),q=[ty*MW+tx];for(let h=0;h<q.length&&c<24;h++){c++;const x=q[h]%MW,y=(q[h]/MW)|0;
  for(const [dx,dy] of D4){const n=(y+dy)*MW+x+dx;if(!seenS.has(n)&&oil[n]>0){seenS.add(n);q.push(n);}}}return c;}
function igniteOil(tx,ty){const i=ty*MW+tx;if(!oil[i])return;const amt=oil[i],size=oilSpillSize(tx,ty);oil[i]=0;
  hz[i]=1;fires.push({x:tx*TS+6,y:ty*TS+6,ph:Math.random()*6,temp:2.5+amt*1.5+Math.min(3,size*0.12),tx,ty});paintTile(tx,ty);paintScorch(tx,ty);
  for(const [dx,dy] of D8){const nx=tx+dx,ny=ty+dy;if(nx>=0&&ny>=0&&nx<MW&&ny<MH&&oil[ny*MW+nx])oilIgnite.push({tx:nx,ty:ny,t:rr(0.1,0.3)});}
  if(Math.hypot(tx*TS-player.x,ty*TS-player.y)<200&&Math.random()<0.4)sfx('whoosh');}
function igniteOilAround(x,y,rad){const tx=Math.floor(x/TS),ty=Math.floor(y/TS),r=Math.ceil(rad/TS);
  for(let yy=ty-r;yy<=ty+r;yy++)for(let xx=tx-r;xx<=tx+r;xx++){if(xx<0||yy<0||xx>=MW||yy>=MH)continue;if(oil[yy*MW+xx]&&Math.hypot(xx*TS+6-x,yy*TS+6-y)<=rad+6)igniteOil(xx,yy);}}
function updateOil(dt){
  for(const o of oilIgnite){o.t-=dt;if(o.t<=0){o.done=true;igniteOil(o.tx,o.ty);}}oilIgnite=oilIgnite.filter(o=>!o.done);
  // ice next to fire melts and oil next to fire catches. A share of the deck is checked each frame so a full sweep
  // takes 0.25 s whatever the deck size.
  if(hazOff)return;const N=MW*MH,n=Math.min(N,Math.ceil(N*dt/0.25));
  for(let k=0;k<n;k++){const i=oilCur;oilCur=oilCur+1<N?oilCur+1:0;if(!ice[i]&&!oil[i])continue;const x=i%MW,y=(i/MW)|0;
    for(const [dx,dy] of D8){const j=(y+dy)*MW+x+dx;if(j>=0&&j<N&&hz[j]===1){ice[i]=0;if(oil[i])oilIgnite.push({tx:x,ty:y,t:rr(0.05,0.3)});break;}}}
}
function oilAnchor(tx,ty){const h=hash(tx*11+5,ty*3+9);return [tx*TS+6+((h%7)-3)*1.1,ty*TS+6+(((h>>>4)%7)-3)*1.1];}
function drawOil(tx,ty,amt){
  const i=ty*MW+tx,[ax,ay]=oilAnchor(tx,ty),x=ax-camX,y=ay-camY,h=hash(tx*7,ty*5),a=0.38+0.1*amt;
  ctx.fillStyle=`rgba(18,14,10,${a})`;ctx.strokeStyle=`rgba(18,14,10,${a})`;ctx.lineCap='round';
  for(const [dx,dy] of D8){const nx=tx+dx,ny=ty+dy;if(nx<0||ny<0||nx>=MW||ny>=MH||!oil[ny*MW+nx])continue;if(dx<0||(dx===0&&dy<0))continue;
    const [bx,by]=oilAnchor(nx,ny),len=Math.hypot(bx-ax,by-ay)||1,bend=((hash(tx+nx*3,ty+ny*3)%7)-3)*0.8;
    ctx.lineWidth=4+Math.min(amt,oil[ny*MW+nx])*1.2;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo((ax+bx)/2-(by-ay)/len*bend-camX,(ay+by)/2+(bx-ax)/len*bend-camY,bx-camX,by-camY);ctx.stroke();}
  ctx.lineCap='butt';ctx.beginPath();ctx.ellipse(x,y,3.5+amt*0.9,2.8+amt*0.7,(h%8)*0.4,0,6.283);ctx.fill();
  const ph=T*0.8+tx*0.7+ty*0.3,cols=['rgba(170,90,200,0.45)','rgba(80,170,190,0.45)','rgba(210,180,80,0.45)'];
  for(let k=0;k<2;k++){ctx.fillStyle=cols[(k+Math.floor(ph))%3];ctx.fillRect(Math.round(x-2+((h>>>(k*5))%5)),Math.round(y-1+((h>>>(k*5+3))%3)),2,1);}
}
const MODKD={};for(const k in MODS)MODKD[MODS[k].kd]=k;
function foodNeed(){return 60+35*(player.foodLv||0);}
function gainFoodXp(a){const P=player;if(!a)return;P.foodXp=(P.foodXp||0)+a;
  while(P.foodXp>=foodNeed()){P.foodXp-=foodNeed();P.foodLv=(P.foodLv||0)+1;const heal=15+5*P.foodLv,g=5*P.foodLv;P.hp=Math.min(maxHp(),P.hp+heal);P.ghost=(P.ghost||0)+g;
    sfx('hackwin');float(P.x,P.y-12,'food level '+P.foodLv,'#e8c070');say('you feel stronger for eating well. food level '+P.foodLv+': +'+heal+' health, +'+g+' ghost health');
    for(let k=0;k<14;k++){const an=k/14*6.283;parts.push({x:P.x,y:P.y,vx:Math.cos(an)*50,vy:Math.sin(an)*50,t:0.5,m:0.5,c:k%2?'#e8c070':'#dfe8ff',s:1});}}}
const randRaw=()=>wpick([['flour',3],['syrup',2],['grubs',1]]);
function cookOk(c){const P=player;return Object.keys(c.need).every(k=>(P.raw[k]||0)>=c.need[k])&&(!c.water||P.flask.has&&P.flask.kind==='water'&&P.flask.n>=c.water);}
function cook(c){const P=player;if(cookOk(c))P.rs.cooked=(P.rs.cooked||0)+1;if(!cookOk(c)){say(c.water&&!(P.flask.kind==='water'&&P.flask.n>=c.water)?'you need a swig of water in your flask':'missing ingredients');sfx('deny');return;}
  for(const k in c.need)P.raw[k]-=c.need[k];if(c.water){P.flask.n-=c.water;if(!P.flask.n)P.flask.kind=null;}
  P.food[c.out]=(P.food[c.out]||0)+1;if(Math.random()<0.15*U('salv')){const k=Object.keys(c.need)[0];P.raw[k]++;}sfx('craft');say('cooked '+FOOD[c.out].name.toLowerCase());}
const randFood=()=>wpick([['ration',3],['beans',2],['paste',2],['coffee',2],['greens',1.5],['candy',2],['meat',1]]);
let modules=[],fixtures=[],modDoors=new Map(),arcadeUI=null;
// Size the deck ('s', 'm' or 'l', see DECK_SIZES) and reallocate every per-tile array and the pre-drawn tile layer.
// Called before generating any deck; fixed layouts (test range, arcade, lift landings) use 'm'.
function setDeckSize(k){if(!DECK_SIZES[k])k='m';deckSize=k;const D=DECK_SIZES[k];MW=D.w;MH=D.h;AREA=MW*MH/4096;const N=MW*MH;
  if(mcv.width!==MW*TS||mcv.height!==MH*TS){mcv.width=MW*TS;mcv.height=MH*TS;}
  map=new Uint8Array(N).fill(1);kind=new Uint8Array(N);seen=new Uint8Array(N);secretHp=new Float32Array(N);openDoor=new Uint8Array(N);
  liq=new Uint8Array(N);hz=new Uint8Array(N);furn=new Uint8Array(N);molten=new Uint8Array(N);webs=new Uint8Array(N);chasm=new Uint8Array(N);
  ice=new Uint8Array(N);flot=new Uint8Array(N);slime=new Uint8Array(N);slimeK=new Uint8Array(N);oil=new Uint8Array(N);openVent=new Uint8Array(N);rubble=new Uint8Array(N);
  flow=new Int16Array(N).fill(-1);flowB=new Int16Array(N);flowQ=new Int32Array(N);flowJob=null;oilCur=0;moltenCur=0;}
function resetHidden(){archive=null;incense=[];plateDoors=[];traps=[];darts=[];trapJets=[];falls=[];rubbleL=[];rubble=new Uint8Array(MW*MH);furn=new Uint8Array(MW*MH);lamps=[];arrival=null;trips=[];secT=0;molten=new Uint8Array(MW*MH);chasm=new Uint8Array(MW*MH);webs=new Uint8Array(MW*MH);ice=new Uint8Array(MW*MH);fans=[];plants=[];mists=[];sprinkT=0;sprWait=rr(25,45);freightT=null;pendingSkip=0;modules=[];fixtures=[];modDoors=new Map();flot=new Uint8Array(MW*MH);slime=new Uint8Array(MW*MH);oil=new Uint8Array(MW*MH);oilIgnite=[];slimeK=new Uint8Array(MW*MH);ventRooms=[];hatchRooms=[];hatches=[];levers=[];cages=[];openVent=new Uint8Array(MW*MH);cables=[];cableMap=new Map();barrels=[];risers=[];}
function mkBarrel(tx,ty){return {tx,ty,x:tx*TS+6,y:ty*TS+6,vx:0,vy:0,hp:4,fuse:-1,dead:false,ph:Math.random()*6,roll:0};}
function pushBarrel(b,dx,dy,f){if(!b||b.dead)return;const l=Math.hypot(dx,dy)||1;b.vx+=dx/l*f;b.vy+=dy/l*f;}
function barrelWall(x,y){const tx=Math.floor(x/TS),ty=Math.floor(y/TS);if(tx<0||ty<0||tx>=MW||ty>=MH)return true;return map[ty*MW+tx]!==0;}
function updateBarrels(dt){const R=4.5;
  for(const b of barrels){if(b.dead)continue;
    const sp=Math.hypot(b.vx,b.vy);
    if(sp>1){let nx=b.x+b.vx*dt,ny=b.y+b.vy*dt;let hit=false;
      if(barrelWall(nx+Math.sign(b.vx)*R,b.y)){b.vx*=-0.35;nx=b.x;hit=true;}
      if(barrelWall(b.x,ny+Math.sign(b.vy)*R)){b.vy*=-0.35;ny=b.y;hit=true;}
      b.x=nx;b.y=ny;b.roll+=sp*dt*0.4;
      if(hit&&sp>150){sfx('thud');hitBarrel(b,1);}
      for(const e of enemies){if(e.dead||sp<90)continue;const d=Math.hypot(e.x-b.x,e.y-b.y);if(d<e.r+R){damageEnemy(e,Math.min(6,sp/60),e.x-b.x,e.y-b.y,sp*0.6);b.vx*=0.4;b.vy*=0.4;}}
      const fr=Math.pow(ice[Math.floor(b.y/TS)*MW+Math.floor(b.x/TS)]||lowGrav()?0.5:0.03,dt);b.vx*=fr;b.vy*=fr;}
    else{b.vx=0;b.vy=0;}
    b.tx=Math.floor(b.x/TS);b.ty=Math.floor(b.y/TS);const ti=b.ty*MW+b.tx;
    {const hot=!b.crate&&(hz[ti]===1&&!hazOff||fires.some(f=>f.tx===b.tx&&f.ty===b.ty));if(hot){b.heat=(b.heat||0)+dt;if(Math.random()<0.3)parts.push({x:b.x+rr(-3,3),y:b.y+2,vx:rr(-6,6),vy:rr(-30,-10),t:0.3,m:0.3,c:'#ff9a4a',s:1});
      if(b.heat>=1.2&&b.fuse<0){b.fuse=1.4;sfx('hiss');float(b.x,b.y-8,'igniting','#ffb060');}}else if(b.heat>0)b.heat=Math.max(0,b.heat-dt*0.5);}
    if(chasm[ti]){b.dead=true;sfx('fall');say(b.crate?'a crate tips into the chasm':'a barrel tips into the chasm');for(let k=0;k<6;k++)parts.push({x:b.x,y:b.y,vx:rr(-10,10),vy:rr(-10,10),t:0.4,m:0.4,c:'#8a3a22',s:1});continue;}
    // bodies push barrels (and barrels push back a little)
    const bodies=[player,...enemies.filter(e=>!e.dead&&!ET[e.type].fly&&!ET[e.type].ghost)];
    for(const o of bodies){const orad=o===player?4:(o.r||5),dx=b.x-o.x,dy=b.y-o.y,d=Math.hypot(dx,dy)||0.01,ov=orad+R-d;if(ov<=0)continue;
      const ux=dx/d,uy=dy/d;if(!barrelWall(b.x+ux*(ov*0.7+R),b.y+uy*(ov*0.7+R))){b.x+=ux*ov*0.7;b.y+=uy*ov*0.7;}move(o,-ux*ov*0.3,-uy*ov*0.3);
      const ov2=Math.hypot(o.vx||0,o.vy||0),gm=lowGrav()?1.3:0.6;if(ov2>(lowGrav()?5:20)){const push=((o.vx||0)*ux+(o.vy||0)*uy);if(push>0){b.vx+=ux*push*gm;b.vy+=uy*push*gm;}}}}
  for(let i=0;i<barrels.length;i++){const a=barrels[i];if(a.dead)continue;for(let j=i+1;j<barrels.length;j++){const c=barrels[j];if(c.dead)continue;const dx=c.x-a.x,dy=c.y-a.y,d=Math.hypot(dx,dy)||0.01,ov=2*R-d;if(ov<=0)continue;
    const ux=dx/d,uy=dy/d;a.x-=ux*ov/2;a.y-=uy*ov/2;c.x+=ux*ov/2;c.y+=uy*ov/2;const rv=(c.vx-a.vx)*ux+(c.vy-a.vy)*uy;if(rv<0){a.vx+=ux*rv*0.9;a.vy+=uy*rv*0.9;c.vx-=ux*rv*0.9;c.vy-=uy*rv*0.9;if(-rv>160){hitBarrel(a,1);hitBarrel(c,1);}}}}}
function mkRiser(tx,ty,dir,cold){const R0=mkRiser0(tx,ty,dir);R0.cold=cold==null?Math.random()<0.25:cold;if(!R0.cold)R0.toxic=typeof cond!=='undefined'&&cond&&cond.haz==='toxic'?Math.random()<0.6:Math.random()<0.1;return R0;}
let clouds=[];
const CLOUD={steam:{col:'230,236,234',a:0.3},toxic:{col:'150,195,60',a:0.32},smoke:{col:'34,34,38',a:0.5},cryo:{col:'205,232,255',a:0.34},incense:{col:'205,210,200',a:0.16}};
function puff(x,y,kind,amt,src){let c=src?clouds.find(q=>q.src===src):null;if(c&&c.kind!==kind)c=null;
  if(!c)c=clouds.find(q=>q.kind===kind&&!q.src&&Math.hypot(q.x-x,q.y-y)<q.r*0.6);
  if(c){c.r=Math.min(c.rmax,c.r+amt);c.dens=Math.min(1,c.dens+amt*0.04);c.fed=true;if(src)c.src=src;return c;}
  if(clouds.length>80)return null;c={x,y,r:5+amt,rmax:kind==='smoke'?34:kind==='incense'?20:48,kind,dens:0.55,vx:rr(-5,5),vy:rr(-5,5),src:src||null,fed:true,blobs:mkBlobs()};clouds.push(c);return c;}
function mkBlobs(){const n=4+rnd(3),B=[{ox:0,oy:0,rs:0.62,ph:Math.random()*6,dx:0,dy:0}];for(let k=1;k<n;k++){const a=Math.random()*6.283,d=rr(0.3,0.7);B.push({ox:Math.cos(a)*d,oy:Math.sin(a)*d,rs:rr(0.32,0.55),ph:Math.random()*6,dx:rr(-0.05,0.05),dy:rr(-0.05,0.05)});}return B;}
function blobPos(c,b){const w=Math.sin(T*0.7+b.ph)*0.08;return [c.x+(b.ox+w)*c.r,c.y+(b.oy+Math.cos(T*0.6+b.ph)*0.08)*c.r,Math.max(3,b.rs*c.r*(1+0.08*Math.sin(T*1.1+b.ph)))];}
function updateClouds(dt){const p=player;let smoke=0,shroud=0;
  for(const c of clouds){if(!c.fed){c.src=null;c.dens-=dt*(c.kind==='smoke'?0.1:0.2);c.r=Math.min(c.rmax+10,c.r+dt*3);}c.fed=false;
    const nx=c.x+c.vx*dt,ny=c.y+c.vy*dt;if(solidAt(nx,c.y))c.vx*=-1;else c.x=nx;if(solidAt(c.x,ny))c.vy*=-1;else c.y=ny;c.vx*=Math.pow(0.5,dt);c.vy*=Math.pow(0.5,dt);
    for(const b of c.blobs){b.ox=Math.max(-0.9,Math.min(0.9,b.ox+b.dx*dt));b.oy=Math.max(-0.9,Math.min(0.9,b.oy+b.dy*dt));if(Math.random()<dt*0.3){b.dx=rr(-0.06,0.06);b.dy=rr(-0.06,0.06);}}
    let k=0;for(const b of c.blobs){const [bx,by,br]=blobPos(c,b),d=Math.hypot(p.x-bx,p.y-by);if(d<br*0.9)k=Math.max(k,c.dens*(1-d/br*0.5));}if(k>0){shroud=Math.max(shroud,k*(c.kind==='smoke'?0.75:c.kind==='toxic'?0.45:c.kind==='incense'?0.12:0.5));
      if(c.kind==='steam')addStatus('wet',22*dt*k);else if(c.kind==='toxic'){if(!p.floating||true)addStatus('psn',9*dt*k);}else if(c.kind==='cryo')addStatus('frz',FREEZE_CFG.cryo.player*dt*k);else if(c.kind!=='incense')smoke+=k;}
    if(c.kind==='cryo')cryoCloudTick(c,dt);
    if(c.kind==='toxic')for(const e of enemies){if(e.dead||ET[e.type].dummy||ET[e.type].plant)continue;if(c.blobs.some(b=>{const [bx,by,br]=blobPos(c,b);return Math.hypot(e.x-bx,e.y-by)<br*0.85;})){e.tox=(e.tox||0)+dt*c.dens;if(e.tox>=1){e.tox-=1;damageEnemy(e,1,0,0,0,true);}}}}
  clouds=clouds.filter(c=>c.dens>0.03);p.shroud=(p.shroud||0)+(Math.min(0.8,shroud)-(p.shroud||0))*Math.min(1,dt*4);
  // air: smoke and deep water use it up
  const under=p.liq===4&&!flot[Math.floor(p.y/TS)*MW+Math.floor(p.x/TS)];let drain=smoke*16*(S.poisonRes>0?0.5:1)+(under?6:0);
  if(p.o2==null)p.o2=100;if(drain>0){p.o2=Math.max(0,p.o2-drain*dt);}else p.o2=Math.min(100,p.o2+28*dt);
  if(p.o2<=0){p.choke=(p.choke||0)+dt;if(p.choke>=0.5){p.choke-=0.5;hurtPlayer(2,true);if(Math.random()<0.4)say(under?'you are running out of air':'you are choking on the smoke');}}}
function drawClouds(){const p=player,lr=lightR();for(const c of clouds){if(c.x-camX<-c.r*2||c.y-camY<-c.r*2||c.x-camX>W+c.r*2||c.y-camY>H+c.r*2)continue;const tx=Math.floor(c.x/TS),ty=Math.floor(c.y/TS);if(tx<0||ty<0||tx>=MW||ty>=MH||!seen[ty*MW+tx])continue;
  const x=c.x-camX,y=c.y-camY;if(x<-60||y<-60||x>W+60||y>H+60)continue;const vis=Math.hypot(c.x-p.x,c.y-p.y)<lr*1.1?1:0.35,C=CLOUD[c.kind];
  for(const b of c.blobs){const [wx,wy,br]=blobPos(c,b),bx=wx-camX,by=wy-camY,a=C.a*c.dens*vis*0.75;
    const g=ctx.createRadialGradient(bx,by,0,bx,by,br);g.addColorStop(0,`rgba(${C.col},${a})`);g.addColorStop(0.55,`rgba(${C.col},${a*0.6})`);g.addColorStop(1,`rgba(${C.col},0)`);ctx.fillStyle=g;ctx.fillRect(bx-br,by-br,br*2,br*2);}}}
function mkRiser0(tx,ty,dir){const x=dir[1]===1?tx*TS+6:dir[0]>0?(tx+1)*TS:tx*TS,y=dir[1]===1?(ty+1)*TS:ty*TS+6;
  return {tx,ty,dir,x,y,ang:Math.atan2(dir[1],dir[0]),t:rr(0,3),phase:'idle'};}
function addCable(tx,ty){const i=ty*MW+tx;hz[i]=5;const c={tx,ty,x:tx*TS+6,y:ty*TS+6,t:rr(0.5,4),phase:'idle',zone:null,hitP:false,hitE:null};cables.push(c);cableMap.set(i,c);}
function extraHazards(start){
  const safe=(x,y)=>Math.abs(x-start.cx)+Math.abs(y-start.cy)>6&&Math.abs(x-exitT.x)+Math.abs(y-exitT.y)>2;
  const spot=()=>{for(let t=0;t<40;t++){const r=randomRoom(),x=r.x+rnd(r.w),y=r.y+rnd(r.h),i=y*MW+x;if(map[i]===0&&!hz[i]&&safe(x,y))return [x,y];}return null;};
  const nC=aN(cond.haz==='electrical'?8+rnd(5):(Math.random()<0.55?2+rnd(3):0));
  for(let k=0;k<nC;k++){const s=spot();if(s)addCable(s[0],s[1]);}
  const nB=aN(cond.haz==='volatile'?12+rnd(7):(Math.random()<0.75?3+rnd(6):0));
  for(let k=0;k<nB;){const s=spot();k++;if(!s||liq[s[1]*MW+s[0]]>=2||barrels.some(b=>b.tx===s[0]&&b.ty===s[1]))continue;barrels.push(mkBarrel(s[0],s[1]));
    if(Math.random()<0.45)for(const [dx,dy] of D8){const x=s[0]+dx,y=s[1]+dy,i=y*MW+x;if(map[i]===0&&!hz[i]&&liq[i]<2&&safe(x,y)&&!barrels.some(b=>b.tx===x&&b.ty===y)){barrels.push(mkBarrel(x,y));k++;break;}}}
  const nR=aN(cond.haz==='steam'?4+rnd(3):(Math.random()<0.35?1+rnd(3):0));
  if(nR){const cand=[];for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){const i=y*MW+x;if(map[i]!==1)continue;
      if(!solid(x,y+1)&&map[i-1]===1&&map[i+1]===1&&safe(x,y+1))cand.push([x,y,[0,1]]);
      else if(!solid(x+1,y)&&solid(x-1,y)&&map[i-MW]===1&&map[i+MW]===1&&safe(x+1,y))cand.push([x,y,[1,0]]);
      else if(!solid(x-1,y)&&solid(x+1,y)&&map[i-MW]===1&&map[i+MW]===1&&safe(x-1,y))cand.push([x,y,[-1,0]]);}
    cand.sort(()=>Math.random()-.5);for(const [x,y,d] of cand){if(risers.length>=nR)break;if(risers.some(r=>Math.abs(r.tx-x)+Math.abs(r.ty-y)<8))continue;risers.push(mkRiser(x,y,d));}}
  {const nF=aN(Math.random()<0.3?1+rnd(2):0);const cand=[];for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){const i=y*MW+x;if(map[i]!==1)continue;if(!solid(x,y+1)&&map[i-1]===1&&map[i+1]===1&&safe(x,y+1))cand.push([x,y,[0,1]]);else if(!solid(x+1,y)&&solid(x-1,y)&&map[i-MW]===1&&map[i+MW]===1&&safe(x+1,y))cand.push([x,y,[1,0]]);else if(!solid(x-1,y)&&solid(x+1,y)&&map[i-MW]===1&&map[i+MW]===1&&safe(x-1,y))cand.push([x,y,[-1,0]]);}
    cand.sort(()=>Math.random()-.5);for(const [x,y,d] of cand){if(fans.length>=nF)break;if(risers.some(r=>Math.abs(r.tx-x)+Math.abs(r.ty-y)<4))continue;fans.push(mkFan(x,y,d));
      if(Math.random()<0.5){const px=d[1],py=d[0];let placed=false;
        if(Math.random()<0.5)for(const s2 of [1,-1,2,-2]){const rx=x+px*s2,ry=y+py*s2,ri=ry*MW+rx;if(map[ri]===1&&!solid(rx+d[0],ry+d[1])&&!fans.some(q=>q.tx===rx&&q.ty===ry)&&!risers.some(q=>q.tx===rx&&q.ty===ry)){risers.push(mkRiser(rx,ry,d));placed=true;break;}}
        if(!placed)for(const k of [2,3,1]){const vx=x+d[0]*k,vy=y+d[1]*k;if(solid(vx,vy)||liq[vy*MW+vx]>=2||(vx===exitT.x&&vy===exitT.y))continue;vents.push({tx:vx,ty:vy,x:vx*TS+6,y:vy*TS+6,t:rr(0,4),phase:'idle',cold:Math.random()<0.2});break;}}}
    for(const sc of secrets){if(Math.random()>0.4)continue;const x=sc.ex,y=sc.ey;const dirs=[[0,1],[1,0],[-1,0],[0,-1]].filter(([dx,dy])=>!solid(x+dx,y+dy)&&kind[(y+dy)*MW+x+dx]!==3);if(dirs.length)fans.push(mkFan(x,y,dirs[0],true));}}
}
function barrelAtTile(tx,ty){for(const b of barrels)if(!b.dead&&b.tx===tx&&b.ty===ty)return true;return false;}
function hitBarrel(b,d,dx,dy,kb){if(b.dead)return;if(kb)pushBarrel(b,dx,dy,kb);if(b.crate){sfx('thud');return;}b.hp-=d;sfx('barrelhit');if(b.hp>0)spillOil(b.tx,b.ty,1,2);
  for(let k=0;k<2;k++)parts.push({x:b.x+rr(-3,3),y:b.y+rr(-3,3),vx:rr(-30,30),vy:rr(-30,30),t:0.2,m:0.2,c:'#ffd070',s:1});
  if(b.hp<=0)boomBarrel(b);else if(b.hp<=2&&b.fuse<0){b.fuse=1.4;sfx('hiss');}}
function boomBarrel(b){if(b.dead||b.crate)return;b.dead=true;spillOil(b.tx,b.ty,2,3);explode(b.x,b.y);const i=b.ty*MW+b.tx;
  if(map[i]===0&&liq[i]<2){hz[i]=1;fires.push({x:b.x,y:b.y,ph:Math.random()*6,temp:7,tx:b.tx,ty:b.ty});paintTile(b.tx,b.ty);paintScorch(b.tx,b.ty);}}
function arcZone(c){const set=new Set(),q=[],i0=c.ty*MW+c.tx;set.add(i0);if(liq[i0]>=1)q.push([i0,0]);
  for(const [dx,dy] of D8){const nx=c.tx+dx,ny=c.ty+dy;if(solid(nx,ny))continue;const n=ny*MW+nx;set.add(n);if(liq[n]>=1)q.push([n,0]);}
  for(let h=0;h<q.length;h++){const [i,d]=q[h];if(d>=8)continue;const x=i%MW,y=(i/MW)|0;
    for(const [dx,dy] of D4){const nx=x+dx,ny=y+dy;if(solid(nx,ny))continue;const n=ny*MW+nx;if(liq[n]>=1&&!set.has(n)){set.add(n);q.push([n,d+1]);}}}
  return set;}
function updateHazards2(dt){
  updateOil(dt);updateFans(dt);updateSprinklers(dt);updatePlants(dt);
  for(const e of enemies)if(e.chillT>0)e.chillT-=dt;
  const p=player;p.shockT=(p.shockT||0)-dt;
  for(const c of cables){if(hazOff||powerOff)break;c.t-=dt;const near=Math.hypot(c.x-p.x,c.y-p.y)<150;
    if(c.phase==='idle'){if(c.t<=0){c.phase='warn';c.t=0.5;if(near)sfx('crackle');}}
    else if(c.phase==='warn'){if(c.t<=0){c.phase='arc';c.t=0.55;c.zone=arcZone(c);for(const zi of c.zone)if(oil[zi])igniteOil(zi%MW,(zi/MW)|0);c.hitP=false;c.hitE=new Set();if(near)sfx('arc');lights.push({x:c.x,y:c.y,r:55,t:0.25,m:0.25,c:'150,200,255'});}}
    else{const pi=Math.floor(p.y/TS)*MW+Math.floor(p.x/TS);
      if(!c.hitP&&c.zone.has(pi)){c.hitP=true;hurtPlayer(5*(p.st.wet>30?1.3:1),true);addStatus('shk',45);p.shockT=0.45;shake=Math.max(shake,4);sfx('zap');}
      for(const e of enemies){if(e.dead||c.hitE.has(e)||ET[e.type].dummy&&!testMode)continue;if(c.zone.has(Math.floor(e.y/TS)*MW+Math.floor(e.x/TS))){c.hitE.add(e);damageEnemy(e,5,0,0,0,true);}}
      if(c.t<=0){c.phase='idle';c.t=rr(1.5,4);c.zone=null;}}}
  for(const b of barrels){if(b.dead||b.fuse<0)continue;b.fuse-=dt;if(Math.random()<0.6)parts.push({x:b.x+rr(-2,2),y:b.y-4,vx:rr(-8,8),vy:rr(-40,-15),t:0.4,m:0.4,c:Math.random()<.5?'#ff8a2a':'#ffd060',s:1});if(b.fuse<=0)boomBarrel(b);}
  for(const f of fires)if(Math.random()<0.05)clearSlimeAround(f.x,f.y,16);
  for(const f of fires){const i=f.ty*MW+f.tx;if(webs[i])tearWeb(i);if(Math.random()<0.3)clearSlimeAround(f.x,f.y,14);for(const pl of plants)if(!pl.burst&&Math.abs(pl.x-f.x)<10&&Math.abs(pl.y-f.y)<10)burnPlant(pl);
    for(const e of enemies)if(!e.dead&&!(e.burnT>1)&&fireWeak(e)&&Math.hypot(e.x-f.x,e.y-f.y)<e.r+8)e.burnT=5;}
  for(const f of fires)if(Math.random()<dt*0.7)puff(f.x+rr(-4,4),f.y-5,'smoke',4);
  for(const f of fires){if(f.temp==null)continue;f.temp-=dt;if(f.temp<=0){f.gone=true;const i=f.ty*MW+f.tx;if(hz[i]===1){hz[i]=0;paintTile(f.tx,f.ty);}}}
  if(fires.some(f=>f.gone))fires=fires.filter(f=>!f.gone);
  for(const r of risers){if(hazOff)break;r.t-=dt;const near=Math.hypot(r.x-p.x,r.y-p.y)<160;
    if(r.phase==='idle'){if(r.t<=0){r.phase='warn';r.t=0.7;if(near)sfx('hiss');}}
    else if(r.phase==='warn'){if(Math.random()<0.4)parts.push({x:r.x,y:r.y,vx:Math.cos(r.ang)*rr(10,25)+rr(-6,6),vy:Math.sin(r.ang)*rr(10,25)+rr(-6,6),t:0.4,m:0.4,c:'#c9cfc2',s:1});
      if(r.t<=0){r.phase='spray';r.t=1.6;if(near)sfx('steam');if(r.cold){freezeAround(r.x+Math.cos(r.ang)*16,r.y+Math.sin(r.ang)*16,14);freezeAround(r.x+Math.cos(r.ang)*34,r.y+Math.sin(r.ang)*34,16);}}}
    else{for(let k=0;k<3;k++){const a=r.ang+rr(-0.35,0.35),sp=rr(80,150);parts.push({x:r.x,y:r.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:0.35,m:0.35,c:r.cold?'#cfe8ff':r.toxic?'#a8c848':'#e6ecea',s:2});}
      if(!r.cold)puff(r.x+Math.cos(r.ang)*30,r.y+Math.sin(r.ang)*30,r.toxic?'toxic':'steam',16*dt,r);
      const inCone=(x,y)=>{const dx=x-r.x,dy=y-r.y,d=Math.hypot(dx,dy);return d<46&&Math.abs(angDiff(Math.atan2(dy,dx),r.ang))<0.42&&hasLOS(r.x+Math.cos(r.ang)*2,r.y+Math.sin(r.ang)*2,x,y);};
      if(inCone(p.x,p.y)){p.rsteam=(p.rsteam||0)+dt;if(p.rsteam>=0.2){p.rsteam-=0.2;if(r.cold){addStatus('frz',14);hurtPlayer(0.5,true);}else if(r.toxic){addStatus('psn',30);hurtPlayer(0.6,true);}else hurtPlayer(2.2,true);}move(p,Math.cos(r.ang)*45*dt,Math.sin(r.ang)*45*dt);}
      for(const e of enemies){if(e.dead||ET[e.type].dummy)continue;if(inCone(e.x,e.y)){e.burn=(e.burn||0)+dt;if(e.burn>=0.3){e.burn-=0.3;damageEnemy(e,r.cold?1:2.5,0,0,0,true);if(r.cold){e.chillT=2;chillEnemy(e,FREEZE_CFG.chill.riser);}}move(e,Math.cos(r.ang)*45*dt,Math.sin(r.ang)*45*dt);}}
      if(r.t<=0){r.phase='idle';r.t=rr(2.5,5);}}}
}
function drawBarrel(b){const x=Math.round(b.x-camX),y=Math.round(b.y-camY);if(x<-10||y<-10||x>W+10||y>H+10)return;
  if(b.crate){F('rgba(0,0,0,0.45)',x-5,y+4,11,2);F('#120c08',x-5,y-5,11,10);const c0=b.wood?'#7a5a32':'#5a6066',c1=b.wood?'#a07a44':'#7a8288';F(c0,x-4,y-4,9,8);F(c1,x-4,y-4,9,1);F(c1,x-4,y-1,9,1);F(c1,x-4,y+2,9,1);if(b.wood){F('#4a3420',x-4,y-4,1,8);F('#4a3420',x+4,y-4,1,8);}else{F('#3a4044',x-1,y-4,1,8);}return;}
  F('rgba(0,0,0,0.45)',x-4,y+4,9,2);F('#120c08',x-4,y-5,9,10);F('#8a3a22',x-3,y-4,7,8);F('#b8552e',x-3,y-4,2,8);
  {const o=Math.floor((b.roll||0))%4;F('#d9a441',x-3,y-1+(o===1?-1:o===3?1:0),7,1);F('#1a1410',x-3,y+(o===1?-1:o===3?1:0),7,1);}F('#5a2616',x-3,y-4,7,1);
  if(b.hp<4)F('#2a1a10',x+1,y-3,1,2);if(b.fuse>=0&&Math.sin(T*30)>0)F('#fff0c0',x,y-5,1,1);}
function drawRiser(r){const x=r.tx*TS-camX,y=r.ty*TS-camY;if(x<-14||y<-14||x>W+14||y>H+14)return;
  if(r.dir[1]===1){F('#1a1e1d',x+3,y-2,6,TS+1);F('#6a7470',x+4,y-2,4,TS);F('#9aa5a0',x+4,y-2,1,TS);F('#3a423f',x+3,y+TS-3,6,3);
    F('#b8493a',x+2,y+3,8,1);F('#b8493a',x+5,y+1,2,5);F('#d8dcd4',x+8,y+7,2,2);}
  else{const ex=r.dir[0]>0?x+TS-5:x+1,nx=r.dir[0]>0?x+TS-1:x-2;F('#1a1e1d',ex-1,y-1,6,TS+2);F('#6a7470',ex,y,4,TS);F('#9aa5a0',ex,y,1,TS);
    F('#3a423f',nx,y+5,3,3);F('#b8493a',ex-1,y+3,6,1);F('#b8493a',ex+1,y+1,2,5);}
  if(r.toxic){const cx=Math.round(r.x-camX),cy=Math.round(r.y-camY);F('#8ab030',cx-2,cy-2,4,4);F('#d0e070',cx-1,cy-1,2,2);}
  if(r.phase==='warn'&&Math.random()<0.3)F(r.toxic?'#d0e070':'#fff',Math.round(r.x-camX),Math.round(r.y-camY),1,1);}
function genArena(){
  resetHidden();const B=BIOME[biomeOverride!=null?biomeOverride:(depth-1)%BIOME.length];CW=B.cw;
  map=new Uint8Array(MW*MH).fill(1);kind=new Uint8Array(MW*MH);secretHp=new Float32Array(MW*MH);openDoor=new Uint8Array(MW*MH);
  const aw=Math.round((24+rnd(9))*MW/64),ah=Math.round((15+rnd(6))*MH/64),ax=(MW-aw)>>1,ay=((MH-ah)>>1)+1,arena={x:ax,y:ay,w:aw,h:ah,cx:ax+(aw>>1),cy:ay+(ah>>1)};
  const start={x:arena.cx-2,y:ay+ah+2,w:5,h:3},exitR={x:arena.cx-2,y:ay-5,w:5,h:3};start.cx=start.x+2;start.cy=start.y+1;exitR.cx=exitR.x+2;exitR.cy=exitR.y+1;
  rooms=[start,arena,exitR];
  for(const r of rooms)for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){setF(x,y);kind[y*MW+x]=1;}
  for(let x=arena.cx-1;x<=arena.cx+1;x++){for(let y=ay+ah;y<start.y;y++){setF(x,y);kind[y*MW+x]=1;}for(let y=exitR.y+exitR.h;y<ay;y++){setF(x,y);kind[y*MW+x]=1;}}
  // symmetric cover: pillars and low walls, mirrored left to right
  const nb=aN(4+rnd(4));for(let k=0;k<nb;k++){const bw=1+rnd(3),bh=bw>1?1:1+rnd(3),bx=ax+2+rnd(Math.max(1,(aw>>1)-bw-3)),by=ay+2+rnd(Math.max(1,ah-bh-4));
    for(let y=by;y<by+bh;y++)for(let x=bx;x<bx+bw;x++){const mx=ax+aw-1-(x-ax);if(Math.abs(x-arena.cx)<=2||Math.abs(y-arena.cy)<=0&&Math.random()<0.5)continue;map[y*MW+x]=1;map[y*MW+mx]=1;}}
  {const sides=[],nsd=aN(2+rnd(2));for(let k=0;k<nsd;k++){const ry=ay+2+rnd(Math.max(1,ah-6)),rh=3+rnd(2),rw=3+rnd(2);sides.push({y:ry,h:rh,w:rw});}
    for(const sd of sides)for(const left of [true,false]){const rx=left?ax-sd.w-1:ax+aw+1,room={x:rx,y:sd.y,w:sd.w,h:sd.h};room.cx=rx+(sd.w>>1);room.cy=sd.y+(sd.h>>1);if(rx<2||rx+sd.w>MW-2||sd.y+sd.h>MH-2)continue;
      let ok=true;for(let y=sd.y-1;y<=sd.y+sd.h;y++)for(let x=rx-1;x<=rx+sd.w;x++)if(map[y*MW+x]===0)ok=false;if(!ok)continue;
      for(let y=sd.y;y<sd.y+sd.h;y++)for(let x=rx;x<rx+sd.w;x++){setF(x,y);kind[y*MW+x]=1;}const dyy=sd.y+(sd.h>>1),wx=left?ax-1:ax+aw;setF(wx,dyy);kind[dyy*MW+wx]=1;rooms.push(room);}
    const nw=aN(1+rnd(3));for(let k=0;k<nw;k++){const len=3+rnd(3),vert=Math.random()<0.5,bx=ax+3+rnd(Math.max(1,(aw>>1)-5)),by=ay+2+rnd(Math.max(1,ah-len-3));
      for(let q=0;q<len;q++){const x=vert?bx:bx+q,y=vert?by+q:by;if(Math.abs(x-arena.cx)<=2)continue;const mx=ax+aw-1-(x-ax);map[y*MW+x]=1;map[y*MW+mx]=1;}}}
  exitT={x:exitR.cx,y:exitR.cy};vaults=[];secrets=[];
  genLiquid(Math.min(0.3,levelMods.flood!=null?levelMods.flood:B.flood),start);{let w=0,f=0;for(let i=0;i<MW*MH;i++)if(map[i]===0){f++;if(liq[i]>=2)w++;}wetness=f?w/f:0;}
  for(let i=0;i<MW*MH;i++)if(liq[i]>=4)liq[i]=3;
  genHazards(start);extraHazards(start);genOil(start);
  seen=new Uint8Array(MW*MH);seed=rnd(1e9);paintMap();panels=[];vendors=[];genTraps(start,exitR);
  return {start,exitR,arena};}
function arenaFoes(){return enemies.filter(e=>!e.dead&&!ET[e.type].dummy&&!ET[e.type].plant&&!ET[e.type].aquatic&&!ET[e.type].ghost&&!e.caged);}
function chasmPathOk(start,exitR){const q=[start.cy*MW+start.cx],v=new Uint8Array(MW*MH);v[q[0]]=1;const goal=exitR.cy*MW+exitR.cx;
  while(q.length){const i=q.pop();if(i===goal)return true;const x=i%MW,y=(i/MW)|0;for(const [dx,dy] of D4){const j=(y+dy)*MW+x+dx;if(v[j]||chasm[j])continue;const m=map[j];if(m===1||m===3||m===4)continue;v[j]=1;q.push(j);}}return false;}
function genMolten(start,exitR){let made=0;const cand=rooms.filter(r=>r!==start&&r!==exitR&&r.w>=5&&r.h>=4),want=aN(3+rnd(3));
  for(let t=0;t<40*AREA&&made<want;t++){const r=cand.length?cand[rnd(cand.length)]:null;if(!r)break;const cx=r.x+1+rnd(r.w-2),cy=r.y+1+rnd(r.h-2),set=[];const n=4+rnd(9),q=[[cx,cy]];
    while(q.length&&set.length<n){const [x,y]=q.splice(rnd(q.length),1)[0],i=y*MW+x;if(x<=r.x||y<=r.y||x>=r.x+r.w-1||y>=r.y+r.h-1||map[i]!==0||molten[i]||liq[i]||chasm[i]||(x===exitT.x&&y===exitT.y))continue;molten[i]=1;set.push(i);for(const [dx,dy] of D4)q.push([x+dx,y+dy]);}
    const saved=chasm.slice();for(const i of set)chasm[i]=1;const ok=chasmPathOk(start,exitR);chasm.set(saved);if(!ok||!set.length){for(const i of set)molten[i]=0;continue;}for(const i of set){hz[i]=0;oil[i]=0;}made++;}}
function crustTile(i){molten[i]=2;paintTile(i%MW,(i/MW)|0);puff((i%MW)*TS+6,((i/MW)|0)*TS+6,'steam',8);sfx('hiss');}
let moltenCur=0;
// slag next to water crusts over. A share of the deck is checked each frame so a full sweep takes 0.3 s.
function updateMolten(dt){const p=player;
  {const N=MW*MH,n=Math.min(N,Math.ceil(N*dt/0.3));for(let k=0;k<n;k++){const i=moltenCur;moltenCur=moltenCur+1<N?moltenCur+1:0;if(molten[i]!==1)continue;let wet=liq[i]>=1&&!ice[i];if(!wet)for(const d of [1,-1,MW,-MW]){const j=i+d;if(liq[j]>=1&&!ice[j]&&molten[j]!==1){wet=true;break;}}if(wet){crustTile(i);continue;}
      if(webs[i])tearWeb(i);if(Math.random()<0.03)puff((i%MW)*TS+6,((i/MW)|0)*TS+6,'smoke',3);}}
  const pi=Math.floor(p.y/TS)*MW+Math.floor(p.x/TS);
  if(molten[pi]===1){p.moltenAcc=(p.moltenAcc||0)+dt;if(p.moltenAcc>=0.25){p.moltenAcc-=0.25;hurtPlayer(2.5*(p.floating?0.5:1)*(p.st.wet>30?0.6:1),true);addStatus('brn',p.floating?10:22);if(Math.random()<0.3)say('the slag sears your boots');}}else p.moltenAcc=0;
  for(const e of enemies){if(e.dead||ET[e.type].fly||ET[e.type].ghost||ET[e.type].dummy)continue;if(molten[Math.floor(e.y/TS)*MW+Math.floor(e.x/TS)]===1)e.burnT=Math.max(e.burnT||0,2.5);}
  for(const it of items){if(it.dead||it.fall)continue;if(molten[Math.floor(it.y/TS)*MW+Math.floor(it.x/TS)]===1){it.dead=true;for(let k=0;k<5;k++)parts.push({x:it.x,y:it.y,vx:rr(-15,15),vy:rr(-35,-10),t:0.4,m:0.4,c:'#ff9a4a',s:1});}}
  for(const b of barrels)if(!b.dead&&molten[b.ty*MW+b.tx]===1)b.heat=(b.heat||0)+dt*2;}
function placeWallPlants(type,n){let made=0;for(let t=0;t<120&&made<n;t++){const r=randomRoom();if(!r)break;const x=r.x+rnd(r.w),y=r.y+rnd(r.h),i=y*MW+x;if(map[i]!==0||chasm[i]||molten[i]||liq[i]>=2)continue;
    const opts=D4.filter(([dx,dy])=>solid(x+dx,y+dy)&&!solid(x-dx,y-dy)&&!solid(x-dx*2,y-dy*2));if(!opts.length)continue;const [wx,wy]=opts[rnd(opts.length)];
    if(enemies.some(e=>Math.hypot(e.x-(x*TS+6),e.y-(y*TS+6))<30))continue;const e=mkEnemy(type,x*TS+6+wx*3,y*TS+6+wy*3);e.face=Math.atan2(-wy,-wx);e.alert=false;
    if(type==='trip'){let L=0;for(let k=1;k<=5;k++){if(solid(x-wx*k,y-wy*k))break;L=k;}e.len=Math.max(2,L)*TS;e.tl=e.len;}enemies.push(e);made++;}}
let arrival=null;
function makeArrivalCab(r){const sides=[[-1,0],[1,0],[0,-1],[0,1]].sort(()=>Math.random()-0.5);
  for(const [sx,sy] of sides){const span=sx?r.h:r.w;for(let t=0;t<span;t++){const o=Math.floor(span/2)+((t%2)?1:-1)*Math.ceil(t/2);if(o<1||o>=span-1)continue;
      const dx=sx<0?r.x-1:sx>0?r.x+r.w:r.x+o,dy=sy<0?r.y-1:sy>0?r.y+r.h:r.y+o,ccx=dx+sx*2,ccy=dy+sy*2;let ok=true;
      for(let y=ccy-2;y<=ccy+2&&ok;y++)for(let x=ccx-2;x<=ccx+2;x++){if(x<1||y<1||x>=MW-1||y>=MH-1){ok=false;break;}if(x===dx&&y===dy)continue;if(map[y*MW+x]!==1){ok=false;break;}}
      if(!ok||map[dy*MW+dx]!==1)continue;
      for(let y=ccy-1;y<=ccy+1;y++)for(let x=ccx-1;x<=ccx+1;x++){const i=y*MW+x;map[i]=0;kind[i]=kind[(r.cy)*MW+r.cx]||0;liq[i]=0;hz[i]=0;}
      for(let y=ccy-3;y<=ccy+3;y++)for(let x=ccx-3;x<=ccx+3;x++)if(x>=0&&y>=0&&x<MW&&y<MH)paintTile(x,y);
      fixtures.push({tx:dx,ty:dy,kind:'liftdoor',ph:0});return {cx:ccx,cy:ccy,dx,dy,sx,sy,open:false};}}
  if(r.w>=7&&r.h>=6){const sx=Math.random()<0.5?-1:1,ccx=sx<0?r.x+1:r.x+r.w-2,ccy=r.cy;const wx=ccx-sx*2,ring=[];
    for(let y=ccy-2;y<=ccy+2;y++)for(let x=ccx-2;x<=ccx+2;x++){if(Math.abs(x-ccx)<=1&&Math.abs(y-ccy)<=1)continue;if(x<r.x||x>=r.x+r.w||y<r.y||y>=r.y+r.h)continue;ring.push([x,y]);}
    if(ring.every(([x,y])=>map[y*MW+x]===0)){for(const [x,y] of ring){map[y*MW+x]=1;}const dx=ccx-sx*2,dy=ccy;for(let y=ccy-3;y<=ccy+3;y++)for(let x=ccx-3;x<=ccx+3;x++)if(x>=0&&y>=0&&x<MW&&y<MH)paintTile(x,y);
      fixtures.push({tx:dx,ty:dy,kind:'liftdoor',ph:0});return {cx:ccx,cy:ccy,dx,dy,sx:-sx,sy:0,open:false};}}
  return null;}
function openArrival(f){const i=f.ty*MW+f.tx;map[i]=0;kind[i]=kind[arrival.cy*MW+arrival.cx]||0;paintTile(f.tx,f.ty);arrival.open=true;fixtures=fixtures.filter(q=>q!==f);sfx('lift');shake=Math.max(shake,2);say('the lift doors grind open');
  for(let k=0;k<10;k++)parts.push({x:f.tx*TS+6,y:f.ty*TS+6,vx:rr(-20,20),vy:rr(-20,20),t:0.4,m:0.4,c:'#8e978b',s:1});}
function genChasms(start,exitR){let made=0;const cand=rooms.filter(r=>r!==start&&r!==exitR&&r.w>=6&&r.h>=5),want=aN(3+rnd(3));
  for(let t=0;t<40*AREA&&made<want;t++){const r=cand.length?cand[rnd(cand.length)]:null;if(!r)break;const w=2+rnd(Math.min(4,r.w-3)),h=2+rnd(Math.min(3,r.h-3)),x0=r.x+1+rnd(r.w-w-1),y0=r.y+1+rnd(r.h-h-1),set=[];
    for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const i=y*MW+x;if(map[i]!==0||chasm[i]||(x===exitT.x&&y===exitT.y))continue;if((x===x0||x===x0+w-1)&&(y===y0||y===y0+h-1)&&Math.random()<0.5)continue;chasm[i]=1;set.push(i);}
    if(!chasmPathOk(start,exitR)){for(const i of set)chasm[i]=0;continue;}for(const i of set){liq[i]=0;hz[i]=0;}made++;}}
function genLevel(){
  resetHidden();
  const B=BIOME[biomeOverride!=null?biomeOverride:(depth-1)%BIOME.length];CW=B.cw;
  const nRooms=Math.max(6,Math.round(B.rooms*AREA));
  for(let attempt=0;attempt<12;attempt++){
    map=new Uint8Array(MW*MH).fill(1);rooms=[];
    for(let t=0;t<500&&rooms.length<nRooms;t++){
      const w=B.w[0]+rnd(B.w[1]-B.w[0]+1),h=B.h[0]+rnd(B.h[1]-B.h[0]+1),x=2+rnd(MW-w-4),y=2+rnd(MH-h-4);
      if(rooms.some(r=>x<r.x+r.w+2&&x+w+2>r.x&&y<r.y+r.h+2&&y+h+2>r.y))continue;
      rooms.push({x,y,w,h,cx:x+(w>>1),cy:y+(h>>1)});
    }
    if(rooms.length>=6)break;
  }
  kind=new Uint8Array(MW*MH);secretHp=new Float32Array(MW*MH);openDoor=new Uint8Array(MW*MH);
  for(const r of rooms)for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){setF(x,y);kind[y*MW+x]=1;}
  const conn=[rooms[0]];
  for(let i=1;i<rooms.length;i++){const r=rooms[i];let best=conn[0],bd=1e9;
    for(const c of conn){const d=Math.abs(c.cx-r.cx)+Math.abs(c.cy-r.cy);if(d<bd){bd=d;best=c;}}corridor(r,best);conn.push(r);}
  for(let k=aN(3);k>0;k--){const a=rooms[rnd(rooms.length)],b=rooms[rnd(rooms.length)];if(a!==b)corridor(a,b);}
  for(const r of rooms)if(r.w>=8&&r.h>=7&&Math.random()<B.pillars)
    for(let yy=r.y+2;yy<r.y+r.h-2;yy+=3)for(let xx=r.x+2;xx<r.x+r.w-2;xx+=3)
      if(Math.random()<.5&&!(Math.abs(xx-r.cx)<=1&&Math.abs(yy-r.cy)<=1))map[yy*MW+xx]=1;
  const start=rooms[0];const dist=new Int16Array(MW*MH);bfs(start.cx,start.cy,dist);
  let exitR=rooms[1],bd=-1;for(const r of rooms){const d=dist[r.cy*MW+r.cx];if(r!==start&&d>bd){bd=d;exitR=r;}}
  exitT={x:exitR.cx,y:exitR.cy};
  vaults=[];secrets=[];
  const nv=aN(1+(Math.random()<0.35+depth*0.08?1:0)+(levelMods.vaults||0));
  for(let k=0;k<nv;k++){const v=attach(2);if(v)vaults.push(v);}
  const ns=aN(1+(depth>=3&&Math.random()<.5?1:0));
  for(let k=0;k<ns;k++){const s=attach(3);if(s)secrets.push(s);}
  for(let k=aN(0.5);k>0;k--){const v=attach(4);if(v){v.vent=true;ventRooms.push(v);}}
  if(Math.random()<0.06){const r=attach(2,4,3,12);if(r)freightT={x:r.cx,y:r.cy};}
  {const nm=aN((Math.random()<0.5?1:0)+(Math.random()<0.15?1:0));const types=Object.keys(MODS);
    for(let k=0;k<nm;k++){const ty=types[rnd(types.length)],M=MODS[ty],r=attach(6,M.w,M.h,M.kd);if(!r)continue;
      r.type=ty;r.entered=false;const lk=Math.random()<M.lock;map[r.ey*MW+r.ex]=lk?7:6;modDoors.set(r.ey*MW+r.ex,{style:M.style,mod:r,broken:false});modules.push(r);}}
  let hr=null;if(Math.random()<0.45){hr=carveIsolated(6+rnd(4),5+rnd(3));if(hr)hatchRooms.push(hr);}
  genLiquid(levelMods.flood!=null?levelMods.flood:B.flood,start);{let w=0,f=0;for(let i=0;i<MW*MH;i++)if(map[i]===0){f++;if(liq[i]>=2)w++;}wetness=f?w/f:0;}genHazards(start);extraHazards(start);genOil(start);
  if(hr){let placed=false;for(let t=0;t<60&&!placed;t++){const r=randomRoom();if(r===exitR)continue;const x=r.x+rnd(r.w),y=r.y+rnd(r.h),i=y*MW+x;
      if(map[i]===0&&liq[i]<=1&&!(x===exitT.x&&y===exitT.y)){hz[i]=0;hatches.push({tx:x,ty:y,lx:hr.x+1,ly:hr.cy,room:hr,found:false});placed=true;}}
    if(!placed){hatchRooms=[];for(let y=hr.y;y<hr.y+hr.h;y++)for(let x=hr.x;x<hr.x+hr.w;x++){map[y*MW+x]=1;kind[y*MW+x]=0;}}}
  chasm=new Uint8Array(MW*MH);if(cond&&cond.haz==='chasm')genChasms(start,exitR);
  molten=new Uint8Array(MW*MH);if(cond&&cond.haz==='molten')genMolten(start,exitR);
  if(runMods.dark&&!testMode&&cond)cond.light='dark';
  secT=0;genTrips();
  genArchiveVault(start);genPlateDoors(start);
  seen=new Uint8Array(MW*MH);seed=rnd(1e9);paintMap();genPanels(false);genVending();genGrinder();genListeners();genFreezers();
  if(freightT){const dec=panels.filter(q=>!q.hack);if(dec.length){const q=dec[rnd(dec.length)];q.hack=true;q.reward='doors';}}
  genTraps(start,exitR);
  return {start,exitR};
}
function blob(cx,cy,R,fn){const dist=new Map();const q=[cy*MW+cx];dist.set(q[0],0);
  for(let h=0;h<q.length;h++){const c=q[h],x=c%MW,y=(c/MW)|0,d=dist.get(c);fn(c,x,y,d);if(d>=R)continue;
    for(const [dx,dy] of D4){const nx=x+dx,ny=y+dy;if(solid(nx,ny))continue;const n=ny*MW+nx;if(!dist.has(n)&&Math.random()<0.85){dist.set(n,d+1);q.push(n);}}}}
function carveIsolated(w,h){for(let t=0;t<300;t++){const x=3+rnd(MW-w-6),y=3+rnd(MH-h-6);let ok=true;
    for(let yy=y-2;yy<y+h+2&&ok;yy++)for(let xx=x-2;xx<x+w+2;xx++)if(map[yy*MW+xx]!==1){ok=false;break;}
    if(!ok)continue;for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){map[yy*MW+xx]=0;kind[yy*MW+xx]=4;}
    return {x,y,w,h,cx:x+(w>>1),cy:y+(h>>1)};}return null;}
function fillHidden(r,type){
  r.type=type;
  if(type==='stash'){const n=3+rnd(3);for(let k=0;k<n;k++)addItem(r,pickItem());if(Math.random()<.4)addChest(r,'common');}
  else if(type==='secops'){const xs=[];const y=r.y-1;for(let x=r.x;x<r.x+r.w;x++)if(map[y*MW+x]===1&&map[y*MW+x-1]===1&&map[y*MW+x+1]===1)xs.push(x);
    const pick=xs.length>1?[xs[0],xs[xs.length-1]]:xs;const rw=['map','routes'];
    pick.forEach((x,k)=>panels.push({tx:x,ty:y,hack:true,reward:rw[k],state:'idle',ph:Math.random()*6}));
    addItem(r,'battery');addItem(r,pickItem());if(!pick.length)addItem(r,'schematic');}
  else if(type==='merchant'){const v=mkVendor(r.cx,r.cy);v.npc=true;v.style=3;v.name='Hermit trader';vendors.push(v);addItem(r,pickItem());}
  else if(type==='cage'&&r.w>=5&&r.h>=4){const c={tx:r.x+r.w-3,ty:r.y+1,w:3,h:2,open:false};cages.push(c);
    const e=mkEnemy(depth>=3?'brute':wpick([['husk',1],['spitter',1]]),(c.tx+2)*TS,(c.ty+1)*TS);e.caged=c;enemies.push(e);
    chests.push({tx:c.tx,ty:c.ty+1,x:c.tx*TS+6,y:(c.ty+1)*TS+6,tier:'rare',opened:false,caged:c,ls:(Math.random()*4294967296)>>>0});
    levers.push({tx:r.x,ty:r.y+r.h-1,effect:'release',cage:c,used:false});addItem(r,pickItem());}
  else{r.type='control';levers.push({tx:r.cx,ty:r.cy,effect:wpick([['flood',3],['anomaly',depth>=2?2:1],['timer',2],['horde',2]]),reward:wpick([['doors',1],['loot',2],['map',1]]),used:false});addItem(r,pickItem());}
}
function topWallTiles(m){const out=[];const y=m.y-1;for(let x=m.x;x<m.x+m.w;x++){const i=y*MW+x;if(map[i]===1&&map[i-1]!==0&&map[i+1]!==0&&!(x===m.ex&&y===m.ey))out.push(x);}return out;}
function fillModule(m){
  const tw=topWallTiles(m),put=(t,e)=>addItem(m,t,e);
  if(m.type==='greenhouse'){for(let x=m.x;x<m.x+m.w;x+=2)fixtures.push({tx:x,ty:m.y+m.h-1,kind:'planter'});put('food',{food:'greens'});put('food',{food:'greens'});put('food');put('cloth');genGreenhouseHerbs(m);if(Math.random()<0.4){const q=spotIn(m);if(q)enemies.push(mkEnemy('slug',q.x,q.y));}}
  else if(m.type==='lockers'){for(const x of tw.slice(0,5))fixtures.push({tx:x,ty:m.y-1,kind:'locker',used:false,wall:true});put('cloth');}
  else if(m.type==='bathroom'){fixtures.push({tx:m.x+m.w-1,ty:m.y,kind:'sink'});if(Math.random()<0.6)put('medkit');if(Math.random()<0.5)put('emetic');}
  else if(m.type==='medbay'){fixtures.push({tx:m.cx,ty:m.cy,kind:'medstation',used:false});if(tw.length)panels.push({tx:tw[tw.length-1],ty:m.y-1,hack:true,reward:'map',state:'idle',ph:0});put('cloth');put('cloth');put('medkit');}
  else if(m.type==='breakroom'){if(tw.length)vendors.push(mkVendor(tw[0],m.y-1));fixtures.push({tx:m.cx,ty:m.cy,kind:'table'});put('food');put('food');put('food');put('key');put('scrap');}
  else if(m.type==='lab'){put('powder');put('powder');put('battery');put('medkit');if(Math.random()<0.3)put('chip');fixtures.push({tx:m.x,ty:m.y,kind:'bench'},{tx:m.x+m.w-1,ty:m.y,kind:'bench'});
    for(let k=0;k<2;k++){const t=freeTile(m);if(t)hz[t.ty*MW+t.tx]=2;}if(Math.random()<0.5){const q=spotIn(m);if(q)enemies.push(mkEnemy('toxslug',q.x,q.y));}}
  else if(m.type==='arcade'){const g=arcPicks(2);tw.slice(0,2).forEach((x,k)=>fixtures.push({tx:x,ty:m.y-1,kind:'arcade',wall:true,won:false,game:g[k]}));put('scrap');put('scrap');}
  else if(m.type==='cafeteria'){if(tw.length)vendors.push(mkVendor(tw[tw.length-1],m.y-1));for(let x=m.x+1;x<m.x+m.w-1;x+=3)fixtures.push({tx:x,ty:m.y+2,kind:'table'});
    for(let x=m.x;x<m.x+Math.min(3,m.w);x++)fixtures.push({tx:x,ty:m.y,kind:'counter'});for(let k=0;k<3+rnd(2);k++)put('food');put('cloth');if(Math.random()<0.3){const q=spotIn(m);if(q)enemies.push(mkEnemy('slug',q.x,q.y));}}
  else if(m.type==='bathhouse'){for(let y=m.y+1;y<m.y+m.h-1;y++)for(let x=m.x+1;x<m.x+m.w-1;x++){const i=y*MW+x,edge=y===m.y+1||y===m.y+m.h-2||x===m.x+1||x===m.x+m.w-2;liq[i]=edge?2:3;paintTile(x,y);}
    fixtures.push({tx:m.x,ty:m.y,kind:'bench'},{tx:m.x+m.w-1,ty:m.y+m.h-1,kind:'bench'});put('cloth');put('medkit');if(Math.random()<0.5)put('emetic');if(Math.random()<0.3){const i=(m.y+2)*MW+m.x+2;enemies.push(mkEnemy('snake',(i%MW)*TS+6,((i/MW)|0)*TS+6));}}
  else if(m.type==='court'){fixtures.push({tx:m.x,ty:m.cy,kind:'goal'},{tx:m.x+m.w-1,ty:m.cy,kind:'goal'},{tx:m.cx,ty:m.cy,kind:'ball'});put('food');put('scrap');put('cloth');
    const n=1+rnd(3);for(let k=0;k<n;k++){const q=spotIn(m);if(q)enemies.push(mkEnemy(Math.random()<0.5?'husk':'crawler',q.x,q.y));}}
  else if(m.type==='custodial'){fixtures.push({tx:m.x+m.w-1,ty:m.y+m.h-1,kind:'bucket'});put('cloth');put('cloth');put('powder');if(Math.random()<0.5)put('key');if(Math.random()<0.4)put('emetic');
    if(Math.random()<0.35){const t=freeTile(m);if(t){hz[t.ty*MW+t.tx]=2;paintTile(t.tx,t.ty);}}}
}
function drawFixture(f){const x=f.tx*TS-camX,y=f.ty*TS-camY;if(x<-14||y<-14||x>W+14||y>H+14)return;
  if(f.kind==='locker'){F('#15181a',x+1,y-1,10,TS+1);F(f.used?'#3a4248':'#56626a',x+2,y,8,TS-1);F('#2a3036',x+6,y,1,TS-1);F('#8a969e',x+4,y+5,1,2);F('#8a969e',x+8,y+5,1,2);for(let k=0;k<2;k++)F('#2a3036',x+3,y+1+k*2,2,1);}
  else if(f.kind==='camera'){F('#0a0a0a',x+1,y-2,TS-2,TS+1);F('#2a3430',x+2,y-1,TS-4,TS-1);F('#0a1a14',x+3,y+1,6,5);
    for(let k=0;k<3;k++)F(Math.random()<0.5?'#3a6a5a':'#1a3a2e',x+3,y+2+k*2,6,1);F(Math.sin(T*4)>0?'#e05040':'#401010',x+8,y,1,1);}
  else if(f.kind==='freezer'){F('#0a0e12',x,y-3,TS,TS+3);F(f.used?'#4a5a64':'#9ab8c8',x+1,y-2,TS-2,TS+1);F('#6a8898',x+1,y+3,TS-2,1);F('#2a3a44',x+8,y-1,2,3);F('#2a3a44',x+8,y+5,2,3);
    if(!f.used){F('#e8f4ff',x+2,y-2,3,1);if(Math.random()<0.04)parts.push({x:x+camX+6,y:y+camY+TS,vx:rr(-5,5),vy:rr(4,10),t:0.8,m:0.8,c:'rgba(220,240,255,0.5)',s:1});}}
  else if(f.kind==='damper'){F('#0a0a12',x,y-2,TS,TS+2);F('#2a2440',x+1,y-1,TS-2,TS);F('#0a0818',x+2,y+1,8,6);ctx.strokeStyle=alertLock?'#6a5a8a':'#c9a8ff';ctx.lineWidth=1;ctx.beginPath();
    for(let k=0;k<8;k++){const yy=y+4+(alertLock?0:Math.round(Math.sin(T*6+k*1.3)*Math.min(2.5,alertM/30+0.3)));k?ctx.lineTo(x+2+k,yy):ctx.moveTo(x+2,yy);}ctx.stroke();F(f.usedReset?'#3a2a4a':'#a88af0',x+9,y+8,1,1);}
  else if(f.kind==='stasis'){F('#15110a',x,y-3,12,15);F(f.used?'#2a3036':'#3a4a58',x+1,y-2,10,13);F(f.used?'#1e2428':'#7fd0e0',x+3,y,6,8);if(!f.used&&Math.sin(T*2)>0)F('#e0ffff',x+4,y+1,1,6);F('#8e978b',x+1,y-2,10,1);}
  else if(f.kind==='breaker'){F('#15110a',x+1,y-2,10,12);F('#5a6066',x+2,y-1,8,10);for(let k=0;k<4;k++)F(k%2?'#15110a':'#e8c040',x+2+k*2,y+7,2,2);F('#2a2f2c',x+4,y+1,4,5);F(powerOff?'#5a3030':'#c04040',x+5,powerOff?y+4:y+1,2,2);F(powerOff?'#3a2a2a':(Math.sin(T*4)>0?'#7fd08e':'#3a6a4a'),x+3,y,1,1);}
  else if(f.kind==='booth'){if(f.side===0){F('#2a1e12',x+1,y,TS-2,TS);F('#6a5034',x+2,y+(f.low?0:1),TS-4,TS-1);if(!f.low){F('#d8d0b0',x+4,y+4,2,2);F('#c05a3a',x+7,y+6,2,1);}}
    else{F('#3a0e10',x,y,TS,TS);F('#a8303a',x+(f.side<0?3:1),y+(f.low?0:1),8,TS-1);F('#c8484e',x+(f.side<0?3:1),y+(f.low?0:1),8,1);F('#6a1a20',f.side<0?x+1:x+TS-3,y,2,TS);
      if(f.shareL)F('#1a1614',x,y,1,TS);if(f.shareR)F('#1a1614',x+TS-1,y,1,TS);}}
  else if(f.kind==='shelf'){F('#2a2f2c',x,y-2,TS,TS+2);F('#5a6066',x+1,y-1,TS-2,TS);for(const yy of [y+1,y+5,y+9])F('#3a4046',x+1,yy,TS-2,1);
    if(!f.part){F('#c8c0a0',x+2,y-1,3,2);F('#4a8ac0',x+6,y-1,3,2);F('#8a6a3a',x+3,y+2,4,3);F('#d8d0c0',x+2,y+6,2,3);F('#e06a2a',x+5,y+6,3,3);}else{F('#6a8a30',x+2,y-1,2,2);F('#d8d0c0',x+5,y-1,4,2);F('#4a4a4a',x+2,y+2,3,3);F('#c8a060',x+6,y+2,3,3);F('#9fd8ff',x+3,y+6,4,3);}}
  else if(f.kind==='toolbench'){F('#3a2a1a',x+1,y,TS-2,TS);F('#7a5a34',x+2,y+(f.part?0:1),TS-4,TS-1);if(!f.part){F('#8e978b',x+3,y+3,5,1);F('#8e978b',x+7,y+2,1,3);F('#c04040',x+4,y+6,2,2);}else{F('#5a6066',x+3,y+2,4,3);F('#3a4046',x+4,y+5,2,3);F('#d9a441',x+8,y+4,1,4);}}
  else if(f.kind==='cot'){F('#2a2a2a',x,y+2,TS,9);F('#7a8078',x,y+3,TS,7);if(!f.part){F('#d8d0c0',x+1,y+4,4,5);}else{F('#4a6a8a',x,y+3,TS-1,7);F('#5a7a9a',x,y+4,TS-1,1);}}
  else if(f.kind==='bookshelf'){F('#2a1a10',x+1,y-3,TS-2,TS+3);F('#5a3e22',x+2,y-2,TS-4,TS+1);for(let k=0;k<6;k++){F(['#a8303a','#3a6a9a','#d9a441','#4a8a4a','#8a4a9a','#c8c0a0'][k],x+2+k+(k>2?0:0),y+(k<3?-1:4),1,4);}
    F('#d9a441',x+7,y-6,3,2);F('#fff0b0',x+8,y-7,1,1);ctx.globalAlpha=0.25+0.05*Math.sin(T*1.3);ctx.fillStyle='#ffd890';circ(x+8,y-5,5);ctx.globalAlpha=1;}
  else if(f.kind==='washbasin'){F('#1a1e1c',x+1,y+1,10,11);F('#2a2f2c',x+2,y+2,8,10);F('#9ab8c8',x+3,y+3,6,4);F('#d8eef8',x+4,y+4,2,1);F('#d8eef8',x+7,y+5,1,1);
    F('#e8e8e8',x+2,y+8,8,3);F('#c8d4da',x+3,y+9,6,1);F('#6fb3c3',x+5,y+9,2,1);F('#8e978b',x+5,y+7,2,1);}
  else if(f.kind==='mirror'){F('#2a2f2c',x+2,y+2,8,8);F('#9ab8c8',x+3,y+3,6,6);F('#d8eef8',x+4,y+4,2,1);F('#d8eef8',x+7,y+6,1,2);}
  else if(f.kind==='fountain'){F('#2a2f2c',x+2,y+5,8,6);F('#b8c4c8',x+3,y+6,6,3);F('#6fb3c3',x+4,y+7,4,1);F('#8e978b',x+5,y+4,2,2);if(Math.sin(T*3)>0.7)F('#cfe8ff',x+6,y+5,1,1);}
  else if(f.kind==='toilet'){F('#8e978b',x+3,y,6,4);F('#e8e8e8',x+3,y+4,6,6);F('#c8d0d4',x+4,y+5,4,3);}
  else if(f.kind==='sink'){F('#8e978b',x+2,y+7,8,4);F('#e8e8e8',x+3,y+7,6,3);F('#6fb3c3',x+5,y+8,2,1);F('#b8c4c8',x+5,y+5,2,2);}
  else if(f.kind==='closet'){F('#2a2f2c',x,y,TS,TS);F('#5a524a',x+1,y+1,TS-2,TS-2);F('#3a342e',x+5,y+1,2,TS-2);F(Math.sin(T*2)>0?'#7fd08e':'#3a6a4a',x+8,y+5,1,2);F('#8e978b',x+1,y+1,TS-2,1);}
  else if(f.kind==='liftdoor'){const lit=0.6+0.4*Math.sin(T*3);F('#2a2f2c',x,y,TS,TS);F('#4a524e',x+1,y+1,TS-2,TS-2);F('#1a1e1c',x+5,y+1,2,TS-2);F(`rgba(217,164,65,${lit})`,x+4,y+5,1,2);F(`rgba(217,164,65,${lit})`,x+7,y+5,1,2);F('#d9a441',x+1,y+1,TS-2,1);}
  else if(f.kind==='npc'){const N=NPCS[f.npc],b=Math.round(Math.sin(T*1.6+(f.ph||0))*0.6),hx=x+6,hy=y+1+b;F('rgba(0,0,0,0.4)',x+2,y+9,9,2);
    ctx.fillStyle=N.robe;ctx.beginPath();ctx.moveTo(hx,y+1+b);ctx.lineTo(x+11,y+10);ctx.lineTo(x+1,y+10);ctx.closePath();ctx.fill();ctx.fillStyle=N.head;circ(hx,hy,2.4);F('#15110a',hx-1,hy,1,1);F('#15110a',hx+1,hy,1,1);
    const a=N.acc;if(a==='pack')F('#5a4a2a',x+8,y+2+b,4,6);else if(a==='cap'){F('#2a3a2a',hx-3,hy-3,6,2);F('#2a3a2a',hx,hy-2,4,1);}else if(a==='hat'){F('#f0f0f0',hx-2,hy-6,5,4);F('#f0f0f0',hx-3,hy-3,7,1);}
    else if(a==='band'){F('#c04040',hx-3,hy-2,6,1);if(Math.random()<0.1)F('#9fc3ff',hx+3,hy-4,1,1);}else if(a==='visor'){F('#3a4a30',hx-3,hy-3,6,2);F('#d9a441',hx-2,hy-1,5,1);}
    else if(a==='ring'){for(let k=0;k<3;k++)F('#c8c0a0',x+2+k*2,y+6+b,1,1);}else if(a==='eye'){F(Math.sin(T*3)>0?'#ff5a5a':'#601010',hx,hy-1,2,1);F('#5a6870',hx-3,hy-3,6,1);}
    else if(a==='helmet'){ctx.strokeStyle='#e0a040';ctx.lineWidth=1;ctx.beginPath();ctx.arc(hx,hy,3.5,Math.PI,0);ctx.stroke();}else if(a==='fedora'){F('#2a2a32',hx-4,hy-3,9,1);F('#2a2a32',hx-2,hy-5,5,2);}}
  else if(f.kind==='psychic'){const b=Math.round(Math.sin(T*1.5+(f.ph||0))*1);F('rgba(0,0,0,0.4)',x+2,y+9,9,2);ctx.fillStyle='#2a1e3a';ctx.beginPath();ctx.moveTo(x+6,y-1+b);ctx.lineTo(x+11,y+10);ctx.lineTo(x+1,y+10);ctx.closePath();ctx.fill();
    ctx.fillStyle='#b8a890';circ(x+6,y+1+b,2.3);F(Math.sin(T*3)>0?'#e0c8ff':'#8a6ab0',x+5,y+1+b,1,1);F(Math.sin(T*3)>0?'#e0c8ff':'#8a6ab0',x+7,y+1+b,1,1);
    for(let k=0;k<3;k++){const a=T*1.2+k*2.1+(f.ph||0);F('rgba(201,168,255,0.7)',Math.round(x+6+Math.cos(a)*7),Math.round(y+2+Math.sin(a)*4+b),1,1);}}
  else if(f.kind==='grinder'){f.spinT=(f.spinT||0)-1/60;const sp=f.spinT>0;const jx=sp?rnd(2)-1:0;
    F('#0a0a0a',x+jx,y-3,TS,TS+3);F('#4a3a2a',x+1+jx,y-2,TS-2,TS+1);for(let k=0;k<TS-2;k+=2)F(((k>>1)%2)?'#d07030':'#1a1410',x+1+k+jx,y-2,2,2);
    F('#15110a',x+2+jx,y+2,8,5);for(let k=0;k<4;k++)F('#8a969e',x+3+k*2+jx,y+(sp?3+((T*40+k)|0)%3:4),1,2);F('#2a2014',x+3+jx,y+8,6,2);F(sp&&Math.sin(T*30)>0?'#ffd070':'#6a3a1a',x+9+jx,y,1,1);}
  else if(f.kind==='dispenser'){F('#0a0a0a',x,y-2,TS,TS+2);F('#5a5448',x+1,y-1,TS-2,TS);F('#2a2620',x+3,y+2,6,3);F('#d9b45a',x+4,y+6,4,2);if(Math.random()<0.05)F('#ffe7a0',x+rnd(TS),y+rnd(TS),1,1);F(Math.sin(T*9)>0?'#c04040':'#401010',x+9,y,1,1);}
  else if(f.kind==='arcade'){const gc=ARC[f.game||'rift'].col;F('#0a0a12',x,y-3,TS,TS+3);F('#3a2a5a',x+1,y-2,TS-2,TS+1);F(gc,x+1,y-3,TS-2,1);F(f.won?'#1a3a2a':'#0a1a2a',x+2,y,8,5);
    for(let k=0;k<3;k++)F(Math.random()<.5?'#ff5aa8':'#5af0ff',x+2+rnd(8),y+rnd(5),1,1);F('#e8e0a0',x+3,y+7,2,1);F('#ff5a5a',x+7,y+7,2,1);}
  else if(f.kind==='medstation'){F('#1a2a2a',x+1,y+1,10,10);F(f.used?'#3a4a4a':'#d8e8e8',x+2,y+2,8,8);F(f.used?'#4a5a5a':'#d04040',x+5,y+3,2,6);F(f.used?'#4a5a5a':'#d04040',x+3,y+5,6,2);}
  else if(f.kind==='planter'){F('#2a1e12',x+1,y+3,10,8);F('#3a2a18',x+2,y+4,8,6);for(let k=0;k<3;k++){F('#4a9a3a',x+3+k*3,y+1+(k%2),1,4);F('#6ac04a',x+2+k*3,y+2,1,1);}}
  else if(f.kind==='sink'){F('#b8c0c0',x+2,y+2,8,6);F('#6a7a80',x+4,y+3,4,3);F('#8a969e',x+5,y+1,2,2);}
  else if(f.kind==='table'){F('#2a1e12',x,y+2,TS,8);F('#6a5034',x+1,y+3,TS-2,6);F('#d8d0b0',x+3,y+4,2,2);F('#c05a3a',x+7,y+5,2,2);}
  else if(f.kind==='counter'){F('#2a2420',x,y+1,TS,10);F('#8a8478',x,y+2,TS,3);F('#6a6458',x,y+5,TS,5);F('#c8a060',x+3,y+2,2,1);}
  else if(f.kind==='goal'){F('#d8d0b8',x+2,y-4,1,TS+8);F('#d8d0b8',x+9,y-4,1,TS+8);F('#d8d0b8',x+2,y-4,8,1);for(let k=0;k<TS+8;k+=2)F('rgba(216,208,184,0.35)',x+3,y-4+k,6,1);}
  else if(f.kind==='ball'){const b=Math.round(Math.sin(T*2)*0.5);F('rgba(0,0,0,0.4)',x+4,y+9,5,1);ctx.fillStyle='#e8e0d0';circ(x+6,y+6+b,3);F('#3a3a3a',x+5,y+5+b,2,2);}
  else if(f.kind==='bucket'){F('#15110a',x+2,y+3,8,8);F('#c8b030',x+3,y+4,6,6);F('#7a8c93',x+4,y+4,4,2);F('#8a6a3a',x+7,y-3,1,8);F('#d8d0b8',x+6,y-4,3,2);}
  else if(f.kind==='bench'){F('#1a1e20',x,y+1,TS,9);F('#8a969e',x+1,y+2,TS-2,6);F('#6ab04a',x+2,y+3,2,3);F('#c9a8ff',x+5,y+3,2,3);F('#e0c050',x+8,y+4,2,2);}
}
function modDoorTile(x,y,px,py,P,st,locked){const lr=!solid(x-1,y)||!solid(x+1,y);
  if(st==='swing'){R('#15110a',px,py,TS,TS);R('#5a4028',px+1,py+1,TS-2,TS-2);R('#6e5034',px+2,py+2,TS-4,TS-4);if(lr)R('#3a2a18',px+1,py+1,1,TS-2);else R('#3a2a18',px+1,py+1,TS-2,1);R('#d9b45a',lr?px+8:px+5,lr?py+5:py+8,2,1);}
  else{R('#101415',px,py,TS,TS);R('#5a666c',px+1,py+1,TS-2,TS-2);if(lr)R('#2a3236',px+6,py+1,1,TS-2);else R('#2a3236',px+1,py+6,TS-2,1);R('#8a969e',px+1,py+1,TS-2,1);}
  R(locked?'#d04040':'#5fae6e',px+(lr?9:4),py+(lr?3:2),2,2);}
function doorInside(d){const t=player?modAt(player.x,player.y):null;return t===d.mod;}
function modAt(x,y){const i=Math.floor(y/TS)*MW+Math.floor(x/TS);return MODKD[kind[i]]?modules.find(m=>x>=m.x*TS&&x<(m.x+m.w)*TS&&y>=m.y*TS&&y<(m.y+m.h)*TS)||null:null;}
function blowModDoor(i){const d=modDoors.get(i);if(!d||d.broken)return;d.broken=true;map[i]=0;openDoor[i]=1;paintArea(i%MW,(i/MW)|0);splat((i%MW)*TS+6,((i/MW)|0)*TS+6,'#2a2014',12,6);flowT=0;}
