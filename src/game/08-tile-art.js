// ---------- tile art ----------
function R(c,x,y,w,h){mctx.fillStyle=c;mctx.fillRect(x,y,w,h);}
function paintMap(){
  curPal=PAL[biomeOverride!=null?biomeOverride:(depth-1)%PAL.length];
  R('#050607',0,0,mcv.width,mcv.height);
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)paintTile(x,y);
  for(let i=0;i<MW*MH;i++)if(hz[i]===1)paintScorch(i%MW,(i/MW)|0);
  if(cond&&cond.haz==='overgrowth')paintOvergrowthExtra();
  if(cond&&cond.haz==='overgrowth')for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++){const i=y*MW+x,px=x*TS,py=y*TS,h=hash(x*17+3,y*23+9);
    if(map[i]===0&&liq[i]<2){if(h%3===0){mctx.fillStyle='rgba(40,80,30,0.35)';mctx.fillRect(px+(h%6),py+((h>>>4)%6),6,5);}
      if(h%4===0)for(let k=0;k<3;k++){const gx=px+1+((h>>>(k*4))%10),gy=py+3+((h>>>(k*4+2))%8);R('#3a7a2a',gx,gy,1,2);R('#5aa03a',gx,gy-1,1,1);}
      if(h%9===0){const fx=px+2+((h>>>7)%8),fy=py+2+((h>>>10)%8);R('#3a7a2a',fx,fy+1,1,2);R(['#e06a9a','#e0d050','#8a7ae0','#e08a3a'][(h>>>12)%4],fx,fy,1,1);}}
    else if(map[i]===1&&!solid(x,y+1)&&h%2===0){for(let k=0;k<TS;k++){const vx=px+3+((h>>>3)%6)+Math.round(Math.sin(k*0.8+h)*1.5);R('#2e5a1e',vx,py+k,1,1);if(k%4===0)R('#4a8a2a',vx+1,py+k,2,1);}}}
}
function paintArea(cx,cy){for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++)if(x>=0&&y>=0&&x<MW&&y<MH)paintTile(x,y);}
function isoPuddle(px,py,h){
  const rot=((h>>>2)%8)*Math.PI/8,shape=(h>>>5)%4,cx=px+4+((h>>>8)%5),cy=py+4+((h>>>11)%5);
  const ca=Math.cos(rot),sa=Math.sin(rot),blob=(x,y,rx,ry,r)=>{mctx.moveTo(x+rx*Math.cos(r),y+rx*Math.sin(r));mctx.ellipse(x,y,rx,ry,r,0,6.283);};
  mctx.fillStyle='rgba(60,115,125,0.3)';mctx.beginPath();
  if(shape===0){blob(cx,cy,3+((h>>>14)%2),1.6+((h>>>15)%2)*0.8,rot);}
  else if(shape===1){blob(cx,cy,2.6,1.8,rot);blob(cx+ca*2.8,cy+sa*2.8,1.9,1.3,rot+0.6);}
  else if(shape===2){blob(cx,cy,1.6,1.3,rot);blob(cx+ca*3-sa*1.5,cy+sa*3+ca*1.5,1.2,1,rot);blob(cx-ca*2.2+sa*1.8,cy-sa*2.2-ca*1.8,1,0.8,rot);}
  else{blob(cx,cy,4.2,1.1,rot);blob(cx+ca*4.5,cy+sa*4.5,1.1,1,0);}
  mctx.fill();
  mctx.fillStyle='rgba(170,210,215,0.28)';mctx.fillRect(Math.round(cx-ca),Math.round(cy-sa-1),1,1);
}
function puddle(x,y,px,py,h){
  let sx=0,sy=0;for(const [dx,dy] of D8){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=MW||ny>=MH)continue;if(map[ny*MW+nx]===0&&liq[ny*MW+nx]>=2){sx+=dx;sy+=dy;}}
  let cx,cy;const r1=2.5+(h%3),r2=2+((h>>>3)%3);
  if(sx||sy){cx=px+(sx>0?TS-1.5:sx<0?1.5:6+((h>>>5)%3)-1);cy=py+(sy>0?TS-1.5:sy<0?1.5:6+((h>>>7)%3)-1);}
  else{isoPuddle(px,py,h);return;}
  const ox=((h>>>9)%5)-2,oy=((h>>>11)%5)-2;
  mctx.fillStyle='rgba(60,115,125,0.32)';mctx.beginPath();mctx.ellipse(cx,cy,r1,r1*0.8,0,0,6.283);
  mctx.moveTo(cx+ox+r2,cy+oy);mctx.ellipse(cx+ox,cy+oy,r2,r2*0.75,0,0,6.283);mctx.fill();
  mctx.fillStyle='rgba(170,210,215,0.3)';mctx.fillRect(Math.round(cx-1),Math.round(cy-1),1,1);
}
function waterLayer(x,y,px,py,k,col){
  const lo=(dx,dy)=>{const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=MW||ny>=MH||map[ny*MW+nx]!==0)return false;return liq[ny*MW+nx]<k;};
  const T_=lo(0,-1),B_=lo(0,1),L_=lo(-1,0),R_=lo(1,0),r=4;
  const tl=T_&&L_?r:0,tr=T_&&R_?r:0,br=B_&&R_?r:0,bl=B_&&L_?r:0,w=TS,h=TS;
  mctx.fillStyle=col;mctx.beginPath();mctx.moveTo(px+tl,py);
  mctx.arcTo(px+w,py,px+w,py+h,tr);mctx.arcTo(px+w,py+h,px,py+h,br);mctx.arcTo(px,py+h,px,py,bl);mctx.arcTo(px,py,px+w,py,tl);mctx.closePath();mctx.fill();
  mctx.strokeStyle=k===2?'rgba(170,215,215,0.12)':'rgba(120,180,195,0.08)';mctx.lineWidth=1;mctx.beginPath();
  const a=px+0.5,b=py+0.5,c=px+w-0.5,d=py+h-0.5;
  if(T_){mctx.moveTo(a+tl,b);mctx.lineTo(c-tr,b);}
  if(B_){mctx.moveTo(a+bl,d);mctx.lineTo(c-br,d);}
  if(L_){mctx.moveTo(a,b+tl);mctx.lineTo(a,d-bl);}
  if(R_){mctx.moveTo(c,b+tr);mctx.lineTo(c,d-br);}
  if(tl){mctx.moveTo(a,b+tl);mctx.arcTo(a,b,a+tl,b,tl-0.5);}
  if(tr){mctx.moveTo(c-tr,b);mctx.arcTo(c,b,c,b+tr,tr-0.5);}
  if(br){mctx.moveTo(c,d-br);mctx.arcTo(c,d,c-br,d,br-0.5);}
  if(bl){mctx.moveTo(a+bl,d);mctx.arcTo(a,d,a,d-bl,bl-0.5);}
  mctx.stroke();
}
function fireAnchor(tx,ty){const h=hash(tx*5+1,ty*11+7);return [tx*TS+6+((h%9)-4)*1.1,ty*TS+6+(((h>>>4)%9)-4)*1.1];}
function paintScorch(tx,ty){
  const [ax,ay]=fireAnchor(tx,ty),h=hash(tx*3+2,ty*7+1);
  mctx.fillStyle='rgba(8,6,4,0.5)';mctx.beginPath();mctx.ellipse(ax,ay,5+(h%3),3.8+((h>>>3)%3)*0.7,(h%8)*0.4,0,6.283);
  mctx.moveTo(ax+((h>>>6)%7)-3+3,ay+((h>>>9)%7)-3);mctx.ellipse(ax+((h>>>6)%7)-3,ay+((h>>>9)%7)-3,3.2,2.4,(h%5)*0.6,0,6.283);mctx.fill();
  mctx.strokeStyle='rgba(8,6,4,0.4)';mctx.lineCap='round';
  for(const [dx,dy] of D8){const nx=tx+dx,ny=ty+dy;if(nx<0||ny<0||nx>=MW||ny>=MH||hz[ny*MW+nx]!==1)continue;if(dx<0||(dx===0&&dy<0))continue;
    const [bx,by]=fireAnchor(nx,ny),len=Math.hypot(bx-ax,by-ay)||1,bend=((hash(tx+nx,ty+ny)%7)-3)*0.9;
    mctx.lineWidth=5+((h>>>12)%3);mctx.beginPath();mctx.moveTo(ax,ay);mctx.quadraticCurveTo((ax+bx)/2-(by-ay)/len*bend,(ay+by)/2+(bx-ax)/len*bend,bx,by);mctx.stroke();}
  mctx.lineCap='butt';
  for(let k=0;k<7;k++){const hk=hash(tx*13+k,ty*29+k*5),a=(hk%628)/100,d=4+(hk>>>10)%6;
    mctx.fillStyle=k%3?'rgba(20,15,10,0.45)':'rgba(70,30,12,0.5)';mctx.fillRect(Math.round(ax+Math.cos(a)*d),Math.round(ay+Math.sin(a)*d),1+(hk>>>14)%2,1);}
}
let fireDraw=[];
function drawFireTile(tx,ty){fireDraw.push(tx,ty);}
function fireNb(tx,ty){let c=0;for(const [dx,dy] of D8){const nx=tx+dx,ny=ty+dy;if(nx>=0&&ny>=0&&nx<MW&&ny<MH&&hz[ny*MW+nx]===1)c++;}return c;}
function drawFireBatch(){
  if(!fireDraw.length)return;
  const nbs=[];for(let q=0;q<fireDraw.length;q+=2)nbs.push(fireNb(fireDraw[q],fireDraw[q+1]));
  ctx.lineCap='round';
  for(let q=0,j=0;q<fireDraw.length;q+=2,j++){const tx=fireDraw[q],ty=fireDraw[q+1],nb=nbs[j],[ax,ay]=fireAnchor(tx,ty),h=hash(tx*3+2,ty*7+1);
    const x=ax-camX,y=ay-camY+1,fl=0.8+0.2*Math.sin(T*6+tx*1.3+ty*0.7),a=(0.2+nb*0.025)*fl;
    ctx.fillStyle=`rgba(210,80,25,${a})`;ctx.beginPath();ctx.ellipse(x,y,3+nb*0.4,2+nb*0.28,(h%8)*0.4,0,6.283);ctx.fill();
    ctx.strokeStyle=`rgba(230,100,30,${a*0.85})`;
    for(const [dx,dy] of D8){const nx=tx+dx,ny=ty+dy;if(nx<0||ny<0||nx>=MW||ny>=MH||hz[ny*MW+nx]!==1)continue;if(dx<0||(dx===0&&dy<0))continue;
      const [bx,by]=fireAnchor(nx,ny),len=Math.hypot(bx-ax,by-ay)||1,bend=((hash(tx+nx,ty+ny)%7)-3)*0.9;
      ctx.lineWidth=2.5+Math.min(nb,fireNb(nx,ny))*0.35;ctx.beginPath();ctx.moveTo(x,y);
      ctx.quadraticCurveTo((ax+bx)/2-(by-ay)/len*bend-camX,(ay+by)/2+(bx-ax)/len*bend-camY+1,bx-camX,by-camY+1);ctx.stroke();}
    if(nb>=3){ctx.fillStyle=`rgba(255,190,80,${a*0.55})`;ctx.beginPath();ctx.ellipse(x,y,1.5+nb*0.2,1+nb*0.12,0,0,6.283);ctx.fill();}}
  ctx.lineCap='butt';
  for(let q=0,j=0;q<fireDraw.length;q+=2,j++)drawFlames(fireDraw[q],fireDraw[q+1],nbs[j]);
  fireDraw=[];
}
function tongue(x,y,ht,sway,maxW){for(let j=0;j<ht;j++){const fr=j/ht,w=Math.max(1,Math.round((1-fr)*maxW)),c=fr<0.3?'#c8401a':fr<0.65?'#ff8a2a':'#ffd060';
  F(c,Math.round(x+sway*fr-w/2),Math.round(y-j),w,1);}}
function drawFlames(tx,ty,nb){
  const h=hash(tx*5+1,ty*11+7),scale=1+nb*0.09,n=2+(h%2)+(nb>=4?1:0)+(nb>=7?1:0);
  for(let k=0;k<n;k++){const hk=hash(tx*31+k*7,ty*17+k*3);
    const ax=tx*TS+6+((hk%11)-5)*1.0,ay=ty*TS+8+(((hk>>>4)%9)-4)*0.9,ph=(hk%100)/16;
    const flick=0.62+0.38*Math.sin(T*(7+(hk%5))+ph)+rr(-0.12,0.12),ht=Math.max(2,Math.round((4+(hk>>>8)%4)*flick*scale)),sway=Math.sin(T*3.1+ph)*(1.3+nb*0.1);
    const x=ax-camX,y=ay-camY;if(x<-14||y<-20||x>W+14||y>H+14)continue;
    F('rgba(140,40,12,0.7)',Math.round(x-2),Math.round(y),4,1);tongue(x,y,ht,sway,nb>=5?4:3);
    if(Math.random()<0.012*scale)parts.push({x:ax+sway,y:ay-ht,vx:rr(-6,6),vy:rr(-30,-15),t:0.6,m:0.6,c:Math.random()<.5?'#ffb050':'#ff7030',s:1});}
  for(let k=0;k<3+(nb>=4?2:0);k++){const hk=hash(tx*43+k*11,ty*19+k*7),cyc=Math.sin(T*(1.3+(hk%7)*0.35)+(hk%100)/10);if(cyc<0.45)continue;
    const vis=(cyc-0.45)/0.55,x=tx*TS+6+((hk>>>3)%13)-6-camX,y=ty*TS+7+((hk>>>7)%11)-5-camY;
    const ht=Math.max(1,Math.round((1.5+(hk>>>11)%3)*vis*scale));tongue(x,y,ht,Math.sin(T*4+k)*0.8,1+(vis>0.6?1:0));}
}
function moduleFloor(kd,x,y,px,py,h,P){
  const t=MODKD[kd];
  if(t==='greenhouse'){R('#1e1a12',px,py,TS,TS);R('#2a2418',px,py,TS,1);for(let k=0;k<4;k++)R('#3a3020',px+1+((h>>>(k*3))%10),py+1+((h>>>(k*3+2))%10),1,1);if(h%4===0)R('#3a6a2a',px+5,py+6,1,2);}
  else if(t==='bathroom'||t==='lab'){R(t==='lab'?'#c8ccc8':'#b8c4c8',px,py,TS,TS);for(let k=0;k<TS;k+=4){R('#8a9498',px+k,py,1,TS);R('#8a9498',px,py+k,TS,1);}mctx.fillStyle='rgba(0,0,0,0.35)';mctx.fillRect(px,py,TS,TS);}
  else if(t==='medbay'){R('#a8c8c4',px,py,TS,TS);R('#88a8a4',px,py,TS,1);R('#88a8a4',px,py,1,TS);mctx.fillStyle='rgba(0,0,0,0.35)';mctx.fillRect(px,py,TS,TS);}
  else if(t==='breakroom'){R(((x+y)%2)?'#3a3228':'#2a241c',px,py,TS,TS);}
  else if(t==='cafeteria'){R(((x+y)%2)?'#c8c0a8':'#a89e88',px,py,TS,TS);mctx.fillStyle='rgba(0,0,0,0.42)';mctx.fillRect(px,py,TS,TS);}
  else if(t==='bathhouse'){R('#8ab0b8',px,py,TS,TS);for(let k=0;k<TS;k+=3){R('#6a9098',px+k,py,1,TS);R('#6a9098',px,py+k,TS,1);}mctx.fillStyle='rgba(0,0,0,0.4)';mctx.fillRect(px,py,TS,TS);}
  else if(t==='court'){const m=modules.find(q=>x>=q.x&&x<q.x+q.w&&y>=q.y&&y<q.y+q.h);R('#6a4a28',px,py,TS,TS);for(let k=0;k<TS;k+=4)R('#5a3e22',px,py+k,TS,1);mctx.fillStyle='rgba(0,0,0,0.3)';mctx.fillRect(px,py,TS,TS);
    if(m){const lc='#d8d0b8';if(x===m.x)R(lc,px+1,py,1,TS);if(x===m.x+m.w-1)R(lc,px+TS-2,py,1,TS);if(y===m.y)R(lc,px,py+1,TS,1);if(y===m.y+m.h-1)R(lc,px,py+TS-2,TS,1);
      const mx=m.x+m.w/2;if(Math.abs(x+0.5-mx)<0.6)R(lc,Math.round((mx-x)*TS+px),py,1,TS);
      const cx2=(m.x+m.w/2)*TS,cy2=(m.y+m.h/2)*TS;mctx.strokeStyle=lc;mctx.lineWidth=1;mctx.save();mctx.beginPath();mctx.rect(px,py,TS,TS);mctx.clip();mctx.beginPath();mctx.arc(cx2,cy2,14,0,6.283);mctx.stroke();mctx.restore();}}
  else if(t==='custodial'){R('#2a2e2c',px,py,TS,TS);R('#3a403c',px+2,py+2,3,3);if(h%3===0){mctx.fillStyle='rgba(120,160,170,0.25)';mctx.fillRect(px+4,py+5,5,3);}}
  else if(t==='arcade'){R('#150f22',px,py,TS,TS);for(let k=0;k<3;k++)R(['#5a2a6a','#2a5a6a','#6a5a2a'][k],px+((h>>>(k*4))%11),py+((h>>>(k*4+2))%11),1,1);}
  else{R('#1e2224',px,py,TS,TS);for(let k=1;k<TS;k+=3)R('#262a2c',px,py+k,TS,1);}
}
function paintOvergrowthExtra(){
  const leaf=(x,y,c)=>{R(c,x,y,2,1);R(c,x+1,y-1,1,1);};
  // floor vines: winding stems across rooms
  const nv=10+rnd(7);
  for(let v=0;v<nv;v++){const r=rooms[rnd(rooms.length)];let x=r.x+rnd(r.w),y=r.y+rnd(r.h);if(map[y*MW+x]!==0)continue;
    let dir=D4[rnd(4)];const pts=[];const len=6+rnd(9);
    for(let k=0;k<len;k++){const h=hash(x*29+v,y*31+k);pts.push([x*TS+6+((h%7)-3),y*TS+6+(((h>>>3)%7)-3)]);
      if(Math.random()<0.3)dir=D4[rnd(4)];let nx=x+dir[0],ny=y+dir[1];if(solid(nx,ny)||liq[ny*MW+nx]>=3){dir=D4[rnd(4)];nx=x+dir[0];ny=y+dir[1];if(solid(nx,ny)||liq[ny*MW+nx]>=3)break;}x=nx;y=ny;}
    if(pts.length<3)continue;mctx.lineCap='round';
    for(const [col,wd,off] of [['#1e3a12',2.5,0],['#3a6a22',1.2,-0.5]]){mctx.strokeStyle=col;mctx.lineWidth=wd;mctx.beginPath();mctx.moveTo(pts[0][0],pts[0][1]+off);
      for(let k=1;k<pts.length-1;k++){const mx=(pts[k][0]+pts[k+1][0])/2,my=(pts[k][1]+pts[k+1][1])/2;mctx.quadraticCurveTo(pts[k][0],pts[k][1]+off,mx,my+off);}mctx.stroke();}
    mctx.lineCap='butt';
    for(let k=1;k<pts.length;k++){const [ax,ay]=pts[k-1],[bx,by]=pts[k];for(let f=0.25;f<1;f+=0.5){const lx=Math.round(ax+(bx-ax)*f),ly=Math.round(ay+(by-ay)*f);leaf(lx+(k%2?1:-2),ly+(k%2?-1:1),k%3?'#4a8a2a':'#6ab04a');}
      if(Math.random()<0.18){const [fx,fy]=pts[k];R(['#e06a9a','#e0d050','#f0f0f0'][rnd(3)],Math.round(fx)+1,Math.round(fy)-1,1,1);}}}
  for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++){const i=y*MW+x,px=x*TS,py=y*TS,h=hash(x*41+5,y*43+7);
    // tall grass near big puddles
    if(map[i]===0&&liq[i]<2){let near=false;for(const [dx,dy] of D8)if(liq[(y+dy)*MW+x+dx]>=2){near=true;break;}
      if(near&&h%3!==0)for(let k=0;k<6;k++){const gx=px+1+((h>>>(k*3))%10),gy=py+10-((h>>>(k*2+1))%3),ht=4+((h>>>(k+6))%4),lean=((h>>>(k+9))%3)-1;
        R('#2e6a22',gx,gy-Math.ceil(ht/2),1,Math.ceil(ht/2));R('#3a7a2a',gx+lean,gy-ht,1,Math.floor(ht/2)+1);R('#8ac860',gx+lean,gy-ht,1,1);}}
    // ivy and flowers on walls
    if(map[i]===1){let adj=false;for(const [dx,dy] of D8){const n=(y+dy)*MW+x+dx;if(map[n]===0){adj=true;break;}}if(!adj)continue;
      if(h%3===0){const cx=px+2+(h%7),cy=py+2+((h>>>4)%7),n=4+(h>>>8)%4;for(let k=0;k<n;k++){const lx=cx+((h>>>(k*2+11))%5)-2,ly=cy+((h>>>(k*2+14))%5)-2;R(k%2?'#3a7a2a':'#5aa03a',lx,ly,2,1);R('#2e5a1e',lx,ly+1,1,1);}}
      if(h%7===0){const fx=px+2+((h>>>5)%8),fy=py+2+((h>>>9)%7);R('#3a7a2a',fx,fy+1,1,2);R(['#e06a9a','#e0d050','#8a7ae0','#f0f0f0','#e08a3a'][(h>>>13)%5],fx-1,fy,3,1);R(['#e06a9a','#e0d050','#8a7ae0','#f0f0f0','#e08a3a'][(h>>>13)%5],fx,fy-1,1,3);R('#fff0a0',fx,fy,1,1);}
      if(h%11===0&&!solid(x,y+1)){for(let k=0;k<TS;k+=2)R(k%4?'#2e5a1e':'#4a8a2a',px+((h>>>(k%8))%10)+Math.round(Math.sin(k*0.7)),py+k,1,2);}}}
}
function paintTile(x,y){
  const P=curPal,i=y*MW+x,px=x*TS,py=y*TS,h=hash(x,y),m=map[i];
  if(m===0&&molten[i]===1){R('#5a1608',px,py,TS,TS);R('#c8401a',px+1,py+1,TS-2,TS-2);for(let k=0;k<4;k++){const a=(h>>>(k*4))%11,b2=(h>>>(k*4+2))%11;R(k%2?'#ff9a3a':'#ffd070',px+a,py+b2,2,1);}
    for(let k=0;k<3;k++)R('#3a0e04',px+((h>>>(k*3+9))%10),py+((h>>>(k*3+12))%10),3,1);return;}
  if(m===0&&molten[i]===2){R('#1e1a18',px,py,TS,TS);R('#2a2522',px+1,py+1,TS-2,TS-2);for(let k=0;k<3;k++)R(k?'#3a2a20':'#6a2a14',px+((h>>>(k*4))%10),py+((h>>>(k*4+2))%10),3,1);R('#141210',px+((h>>>14)%9),py+((h>>>17)%9),1,3);return;}
  if(m===0&&chasm[i]){R('#020303',px,py,TS,TS);const up=!chasm[i-MW],lf=!chasm[i-1],rt=!chasm[i+1],dn=!chasm[i+MW];
    if(up){R(P.faceLo||'#2a2f2c',px,py,TS,3);R('#0a0c0b',px,py+3,TS,2);}if(lf)R('#141816',px,py,1,TS);if(rt)R('#141816',px+TS-1,py,1,TS);if(dn)R('#1a1e1c',px,py+TS-1,TS,1);
    if(h%5===0)R('#0a0d0c',px+(h%9),py+5+(h>>>4)%5,2,1);return;}
  if(m===0&&openVent[i]){R('#0b0e0d',px,py,TS,TS);R(P.cap,px,py,TS,1);R(P.faceLo,px,py+TS-1,TS,1);for(let k=2;k<TS-1;k+=3)R('#1a1f1e',px+1,py+k,TS-2,1);return;}
  if(m===0){
    if(kind[i]>=5){moduleFloor(kind[i],x,y,px,py,h,P);}
    else if(kind[i]===4){grateFloor(x,y,px,py,h,P);mctx.fillStyle='rgba(0,0,0,0.25)';mctx.fillRect(px,py,TS,TS);}
    else if(kind[i])roomFloor(x,y,px,py,h,P);else grateFloor(x,y,px,py,h,P);
    const l=liq[i];
    if(l===1)puddle(x,y,px,py,h);
    else if(l>=2){waterLayer(x,y,px,py,2,'rgba(40,95,105,0.5)');if(l>=3)waterLayer(x,y,px,py,3,'rgba(5,32,46,0.62)');if(l===4)waterLayer(x,y,px,py,4,'rgba(0,10,22,0.62)');
      if(l===3&&h%5===0){mctx.fillStyle='rgba(120,180,190,0.2)';mctx.fillRect(px+3,py+5,5,1);}}
    const hh=hz[i];
    if(hh===1){/* scorch is drawn by paintScorch so it can spill across tile edges */}
    else if(hh===2){mctx.fillStyle='rgba(80,120,20,0.78)';mctx.fillRect(px,py,TS,TS);mctx.fillStyle='rgba(170,220,60,0.35)';
      for(const [dx,dy] of D4){const nx=x+dx,ny=y+dy;if(solid(nx,ny)||hz[ny*MW+nx]===2)continue;
        if(dx===1)mctx.fillRect(px+TS-1,py,1,TS);if(dx===-1)mctx.fillRect(px,py,1,TS);if(dy===1)mctx.fillRect(px,py+TS-1,TS,1);if(dy===-1)mctx.fillRect(px,py,TS,1);}
      mctx.fillStyle='rgba(40,60,10,0.6)';mctx.fillRect(px+3+(h%4),py+5,3,2);}
    else if(hh===5){R('#0a0c0b',px+2,py+2,8,8);R(P.cap,px+2,py+2,8,1);R('#15110a',px+1,py+1,1,1);R('#15110a',px+10,py+10,1,1);
      for(let k=0;k<9;k++){R('#7a4a22',px+2+k,py+5+Math.round(Math.sin(k*0.9+(h%5))*1.5),1,1);R('#4a5a6a',px+3+Math.round(Math.cos(k*0.8)*1.5),py+2+k,1,1);}
      R('#d0a060',px+9,py+5,1,1);R('#d0a060',px+3,py+9,1,1);}
    else if(hh===3){R('#0a0c0b',px+2,py+2,8,8);R(P.cap,px+2,py+2,8,1);for(let k=0;k<3;k++)R(P.faceLo,px+3,py+4+k*2,6,1);}
    if(kind[i]===3){mctx.fillStyle='rgba(90,60,30,0.16)';mctx.fillRect(px,py,TS,TS);}
    if(kind[i]===2){mctx.fillStyle='rgba(0,0,0,0.12)';mctx.fillRect(px,py,TS,TS);}
    if(openDoor[i]){if(solid(x-1,y)&&solid(x+1,y)){R(P.cap,px,py,2,TS);R(P.faceLo,px+TS-2,py,2,TS);}else{R(P.cap,px,py,TS,2);R(P.faceLo,px,py+TS-2,TS,2);}}
  }else if(m===2)doorTile(x,y,px,py,P);
  else if(m===6||m===7){const d=modDoors.get(i);modDoorTile(x,y,px,py,P,d?d.style:'slide',m===7);}
  else if(m===4){wallTile(x,y,px,py,h,P);if(!solid(x,y+1)){R(P.faceLo,px+3,py+6,6,1);R(P.faceLo,px+3,py+8,6,1);}else R(P.faceLo,px+4,py+5,4,1);}
  else{wallTile(x,y,px,py,h,P);if(m===3){R(P.faceLo,px+4,py+5,1,1);R(P.faceLo,px+5,py+6,1,1);R(P.faceLo,px+5,py+7,1,1);R(P.faceLo,px+7,py+6,1,1);}}
}
function doorTile(x,y,px,py,P){
  const lr=!solid(x-1,y)||!solid(x+1,y);
  R('#15110a',px,py,TS,TS);R('#3b3122',px+1,py+1,TS-2,TS-2);
  if(lr){for(let k=2;k<TS-1;k+=3)R('#2a2217',px+k,py+1,1,TS-2);}else{for(let k=2;k<TS-1;k+=3)R('#2a2217',px+1,py+k,TS-2,1);}
  for(let k=0;k<TS;k++)if(((k+x+y)>>1)%2===0){if(lr){R('#6b5220',px,py+k,1,1);R('#6b5220',px+TS-1,py+k,1,1);}else{R('#6b5220',px+k,py,1,1);R('#6b5220',px+k,py+TS-1,1,1);}}
  R('#0a0806',px+4,py+4,4,4);R('#8a6a24',px+5,py+5,2,2);
}
function roomFloor(x,y,px,py,h,P){
  R(P.fl,px,py,TS,TS);
  R(P.hi,px,py,TS,1);R(P.hi,px,py,1,TS);R(P.lo,px,py+TS-1,TS,1);R(P.lo,px+TS-1,py,1,TS);
  R(P.riv,px+2,py+2,1,1);R(P.riv,px+9,py+2,1,1);R(P.riv,px+2,py+9,1,1);R(P.riv,px+9,py+9,1,1);
  const v=h%37;
  if(v<3){R(P.lo,px+3,py+3,6,6);R(P.gr,px+4,py+4,4,1);R(P.gr,px+4,py+6,4,1);R(P.hi,px+3,py+8,6,1);}
  else if(v<6){mctx.fillStyle='rgba(70,120,130,0.22)';mctx.fillRect(px+2,py+4,7,4);mctx.fillRect(px+4,py+3,4,6);
    mctx.fillStyle='rgba(170,210,215,0.35)';mctx.fillRect(px+4,py+4,2,1);}
  else if(v<9){let cx=px+3+(h>>>8)%4,cy=py+2;for(let k=0;k<7;k++){R(P.lo,cx,cy,1,1);cy++;cx+=((h>>>k)&1)?1:-1;if(cx<px+1||cx>px+10)break;}}
  else if(v<11){mctx.fillStyle='rgba(120,70,35,0.25)';mctx.fillRect(px+1+(h%4),py+3,5,4);mctx.fillRect(px+3+(h%3),py+5,4,4);}
  else if(v<13){for(let k=0;k<3;k++)R(P.riv,px+3+((h>>>(k*4))%6),py+3+((h>>>(k*4+2))%6),1,1);}
  else if(v===13){R(P.lo,px+4,py+3,4,6);R(P.hi,px+5,py+4,2,1);R(P.hi,px+5,py+6,2,1);}
  if(hash(777,y)%9===0){for(let k=0;k<TS;k++){const yy=py+6+Math.round(Math.sin((px+k)*0.21)*2);R('#0a0c0b',px+k,yy,1,1);if(k%3===0)R(P.hi,px+k,yy-1,1,1);}}
}
function grateFloor(x,y,px,py,h,P){
  R(P.gr,px,py,TS,TS);
  const vert=solid(x-1,y)&&solid(x+1,y);
  if(vert){for(let k=1;k<TS;k+=2)R(P.sl,px+k,py+1,1,TS-2);}else{for(let k=1;k<TS;k+=2)R(P.sl,px+1,py+k,TS-2,1);}
  R(P.lo,px,py,TS,1);R(P.lo,px,py,1,TS);
  if(h%11===0){mctx.fillStyle='rgba(90,150,160,0.22)';mctx.fillRect(px+3+(h%5),py+4,2,1);}
  if(h%17===0)R('#0a0c0b',px+2,py+2,3,3);
}
function wallTile(x,y,px,py,h,P){
  const frontFace=!solid(x,y+1);
  let adj=false;for(const [dx,dy] of D8)if(!solid(x+dx,y+dy)){adj=true;break;}
  if(frontFace){
    R(P.face,px,py,TS,TS);R(P.cap,px,py,TS,2);R(P.faceHi,px,py+2,TS,1);
    if(x%2===0)R(P.faceLo,px,py+3,1,TS-5);
    R(P.faceHi,px+2,py+4,1,1);R(P.faceHi,px+TS-3,py+4,1,1);
    const pipeRow=hash(3,y)%3===0;
    if(pipeRow){R(P.pipe,px,py+6,TS,2);R(P.pipeHi,px,py+6,TS,1);
      if(x%4===0){R(P.pipe,px+4,py+5,2,4);R(P.pipeHi,px+4,py+5,2,1);}
      if(h%13===0){mctx.fillStyle='rgba(120,160,150,0.35)';mctx.fillRect(px+7,py+8,1,2);}}
    else if(h%8===0){R(P.faceLo,px+3,py+4,6,5);for(let k=0;k<3;k++)R(P.face,px+4,py+5+(k*1.5|0),4,1);R(P.faceHi,px+3,py+9,6,1);}
    else if(h%8===3){R(P.faceHi,px+3,py+4,6,4);R(P.faceLo,px+4,py+5,4,1);R(P.faceLo,px+4,py+6,3,1);}
    else if(h%8===5){R('#0e1110',px+2,py+3,1,TS-5);R('#0e1110',px+4,py+3,1,TS-5);R(P.faceHi,px+2,py+3,1,1);}
    if(h%23===0&&!pipeRow){R(P.acc,px+5,py+4,2,2);R('#fff3',px+5,py+4,1,1);}
    R(P.faceLo,px,py+TS-2,TS,2);
    if(hash(9,y)%4===0)for(let k=0;k<TS;k++)if(((px+k)>>1)%2===0)R('#6b5220',px+k,py+TS-2,1,2);
    if(!solid(x-1,y))R(P.faceHi,px,py,1,TS);
    if(!solid(x+1,y))R(P.faceLo,px+TS-1,py,1,TS);
  }else if(adj){
    R(P.wall,px,py,TS,TS);R(P.faceHi,px+2,py+2,TS-4,TS-4);R(P.wall,px+3,py+3,TS-6,TS-6);
    if(!solid(x,y-1))R(P.cap,px,py,TS,1);
    if(!solid(x-1,y))R(P.cap,px,py,1,TS);
    if(!solid(x+1,y))R(P.faceLo,px+TS-1,py,1,TS);
    if(h%3===0){R(P.cap,px+2,py+2,1,1);R(P.cap,px+9,py+9,1,1);}
    if(h%11===0)R(P.faceLo,px,py+5,TS,1);
  }else{
    R(P.rock,px,py,TS,TS);
    for(let k=0;k<4;k++)R(k%2?P.faceLo:P.wall,px+((h>>>(k*5))%11),py+((h>>>(k*5+3))%11),1,1);
  }
}
function splat(x,y,col,n,sp){mctx.fillStyle=col;for(let i=0;i<n;i++){const a=Math.random()*6.283,d=Math.random()*sp;const px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;
  if(solidAt(px,py))continue;const s=1+rnd(3);mctx.fillRect(px|0,py|0,s,s);}}

