// ---------- vision ----------
function castRay(ox,oy,dx,dy,maxD,mark){
  let mx=Math.floor(ox/TS),my=Math.floor(oy/TS);
  const sX=dx>0?1:-1,sY=dy>0?1:-1;
  const tdX=dx!==0?Math.abs(TS/dx):Infinity,tdY=dy!==0?Math.abs(TS/dy):Infinity;
  let tX=dx>0?((mx+1)*TS-ox)/dx:dx<0?(mx*TS-ox)/dx:Infinity;
  let tY=dy>0?((my+1)*TS-oy)/dy:dy<0?(my*TS-oy)/dy:Infinity;
  if(mark&&mx>=0&&my>=0&&mx<MW&&my<MH){const i0=my*MW+mx;if(!seen[i0]&&map[i0]===0)newSeen++;seen[i0]=1;}
  for(let i=0;i<80;i++){
    let t;if(tX<tY){t=tX;tX+=tdX;mx+=sX;}else{t=tY;tY+=tdY;my+=sY;}
    if(t>=maxD)return maxD;
    if(mx<0||my<0||mx>=MW||my>=MH)return t;
    if(mark){const i0=my*MW+mx;if(!seen[i0]&&map[i0]===0)newSeen++;seen[i0]=1;}
    if(map[my*MW+mx]!==0)return t;
  }
  return maxD;
}
function hasLOS(x0,y0,x1,y1){const d=Math.hypot(x1-x0,y1-y0);if(d<1)return true;return castRay(x0,y0,(x1-x0)/d,(y1-y0)/d,d,false)>=d-0.5;}
function lightR(a){
  let r=(S.lantern?108:BASE_R)+(S.sight||0);if(player&&player.glowOn&&player.tools&&player.tools.glowstick)r=Math.max(r,104);if(player&&player.darkRoom&&cond.light!=='dark')r=S.lantern?85:24;else if(cond.light==='lit')r=Math.max(r,170);else if(cond.light==='dark')r=S.lantern?85:22;
  if(flickT>0&&cond.light!=='lit')r*=0.6;if(S.nvg)r=Math.max(r,175);if(player&&player.peek)r+=70;if(player&&player.astral)r=Math.max(r,95);if(player&&player.shroud>0.02)r*=1-player.shroud;
  for(const b of S.beams){const da=Math.abs(angDiff(a,player.ang));
    if(da<b.half)r=Math.max(r,b.r);else if(da<b.half+0.14)r=Math.max(r,b.r+(r-b.r)*((da-b.half)/0.14));}
  if(cond.haz==='fog'&&!hazOff)r=Math.min(r*0.55,100);
  return r;
}
let occ=[];
function buildOcc(cx,cy,R){occ=[];const near=(x,y)=>Math.abs(x-cx)<R&&Math.abs(y-cy)<R;
  for(const b of barrels)if(!b.dead&&near(b.x,b.y))occ.push({x:b.x,y:b.y,r:4});
  for(const c of chests)if(near(c.x,c.y))occ.push({x:c.x,y:c.y-1,r:4.5});
  for(const v of vendors)if(v.npc&&near(v.tx*TS+6,v.ty*TS+5))occ.push({x:v.tx*TS+6,y:v.ty*TS+5,r:4});
  for(const e of enemies)if(!e.dead&&e.r>=3&&!ET[e.type].fly&&near(e.x,e.y))occ.push({x:e.x,y:e.y,r:e.r*0.85});}
function drawSoftShadows(){
  const p=player;if(!occ.length)return;
  for(const o of occ){const dx=o.x-p.x,dy=o.y-p.y,d=Math.hypot(dx,dy);if(d<o.r+3)continue;
    const R=lightR(Math.atan2(dy,dx));if(d>R)continue;if(!hasLOS(p.x,p.y,o.x,o.y))continue;
    const ux=dx/d,uy=dy/d,px=-uy,py=ux,L=Math.min(46,R-d+10),w0=o.r*0.9,w1=o.r*(d+L)/d*1.25;
    const ox=o.x-camX,oy=o.y-camY,fade=Math.min(1,(R-d)/30);
    const g=ctx.createLinearGradient(ox,oy,ox+ux*L,oy+uy*L);g.addColorStop(0,`rgba(0,0,0,${0.42*fade})`);g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;
    for(const k of [1,1.6]){ctx.globalAlpha=k===1?1:0.5;ctx.beginPath();ctx.moveTo(ox+px*w0*k,oy+py*w0*k);ctx.lineTo(ox+ux*L+px*w1*k,oy+uy*L+py*w1*k);
      ctx.lineTo(ox+ux*L-px*w1*k,oy+uy*L-py*w1*k);ctx.lineTo(ox-px*w0*k,oy-py*w0*k);ctx.closePath();ctx.fill();}
    ctx.globalAlpha=1;}
}
function rayOcc(ox,oy,dx,dy,maxD){let best=maxD;
  for(const o of occ){const fx=o.x-ox,fy=o.y-oy,tca=fx*dx+fy*dy;if(tca<0)continue;
    const d2=fx*fx+fy*fy-tca*tca,r2=o.r*o.r;if(d2>r2)continue;const t=tca-Math.sqrt(r2-d2);if(t>1&&t<best)best=t;}return best;}
function updateAstral(dt,ix,iy){const P=player,A=P.astral;A.t-=dt;const l=Math.hypot(ix,iy)||1,sp=120;let nx=A.x+ix/l*sp*dt*(ix||iy?1:0),ny=A.y+iy/l*sp*dt*(ix||iy?1:0);
  nx=Math.max(TS,Math.min(MW*TS-TS,nx));ny=Math.max(TS,Math.min(MH*TS-TS,ny));const dd=Math.hypot(nx-P.x,ny-P.y);if(dd>340){nx=P.x+(nx-P.x)*340/dd;ny=P.y+(ny-P.y)*340/dd;}A.x=nx;A.y=ny;
  const tx=Math.floor(A.x/TS),ty=Math.floor(A.y/TS);for(let y=ty-1;y<=ty+1;y++)for(let x=tx-1;x<=tx+1;x++)if(x>=0&&y>=0&&x<MW&&y<MH)seen[y*MW+x]=1;
  P.ang=Math.atan2(mouse.sy+camY-A.y,mouse.sx+camX-A.x);if(Math.random()<dt*8)parts.push({x:A.x+rr(-3,3),y:A.y+rr(-3,3),vx:0,vy:-8,t:0.6,m:0.6,c:'#c8b8ff',s:1});if(A.t<=0)endAstral('the projection fades. you are back in your body');}
function endAstral(msg){const P=player;if(!P.astral)return;P.astral=null;P.actCd.astral=Math.max(P.actCd.astral||0,ACTS.astral.cd*actCdMul());say(msg);sfx('sonar');}
function viewOrigin(){const P=player;return P&&P.astral?P.astral:P;}
function inLight(x,y,pad){const o=viewOrigin(),dx=x-o.x,dy=y-o.y,d=Math.hypot(dx,dy);if(d>260+pad)return false;
  if(d>lightR(Math.atan2(dy,dx))+pad)return false;return hasLOS(o.x,o.y,x,y);}
function visible(x,y,pad){return inLight(x,y,pad)||glows.some(f=>Math.hypot(x-f.x,y-f.y)<f.r&&hasLOS(f.x,f.y,x,y));}

