// ---------- liquids (Batch 5, the study's bakeWater(), liqNew() and blobPath()) ----------
// Water is a smooth depth field: depth is blended between tile centres (a puddle counts as LIQ_CFG.puddle of a step,
// ice as dry), coloured from shallow to deep to abyss with the biome's WATER_TINT, with a slight damp darkening just
// outside the shore and a pale wet line at it. The study read the floor's pixels back and blended into them; here
// the same result is baked as an overlay of colour and alpha into its own canvas (wcv, the size of the tile canvas),
// with no readback, and drawn tile by tile right after the floor (wetT marks the tiles that have any). Water and ice
// change during a deck (splashes, floods, drains, freezing, melting) from many places, so instead of hooking each one
// liqScanTick() compares a slice of the deck (1/LIQ_CFG.scanFrames a frame) with a snapshot (liqSnap) and re-bakes
// only the tiles around a change. Moving water (caustic light in the shallows, slow darker swells in the deep,
// drifting glints) is a light layer sampled on a sparse grid over the water tiles on screen. Ice, oil, toxic spills,
// slime trails and molten slag are drawn per frame for the tiles on screen, with soft edges (liqBlob()).
let wcv=null,wctx=null,wetT=null,liqSnap=null,liqCur=0,wTint=null;
const rgb3=s=>s.split(',').map(Number);
function waterTint(){const t=WATER_TINT[kitIdx()]||WATER_TINT[0];return {s:rgb3(t.s),d:rgb3(t.d),a:rgb3(t.a),sh:rgb3(t.sh),shs:t.sh};}
const liqD=i=>ice[i]||map[i]!==0?0:liq[i]===1?LIQ_CFG.puddle:liq[i];
// the whole deck (end of paintMap())
function waterBakeAll(){if(!mcv)return;if(!wcv)wcv=document.createElement('canvas');if(wcv.width!==mcv.width||wcv.height!==mcv.height){wcv.width=mcv.width;wcv.height=mcv.height;}
  wctx=wcv.getContext('2d');wctx.clearRect(0,0,wcv.width,wcv.height);wetT=new Uint8Array(MW*MH);liqSnap=new Uint8Array(MW*MH);wTint=waterTint();
  let x0=MW,y0=MH,x1=-1,y1=-1;for(let i=0;i<MW*MH;i++){liqSnap[i]=liq[i]|(ice[i]?8:0);if(liqD(i)>0){const x=i%MW,y=(i/MW)|0;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}}
  if(x1>=0)waterBake(x0-1,y0-1,x1+1,y1+1);}
// re-bake a block of tiles (each pixel's depth also reads the tiles around the block)
function waterBake(tx0,ty0,tx1,ty1){if(!wctx)return;tx0=Math.max(0,tx0);ty0=Math.max(0,ty0);tx1=Math.min(MW-1,tx1);ty1=Math.min(MH-1,ty1);if(tx1<tx0||ty1<ty0)return;
  const T_=wTint||(wTint=waterTint()),gw=tx1-tx0+3,gh=ty1-ty0+3,G=new Float32Array(gw*gh);
  for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){const X=tx0-1+x,Y=ty0-1+y;G[y*gw+x]=X<0||Y<0||X>=MW||Y>=MH?0:liqD(Y*MW+X);}
  const w=(tx1-tx0+1)*TS,h=(ty1-ty0+1)*TS,img=wctx.createImageData(w,h),d=img.data,S_=T_.s,D_=T_.d,A_=T_.a,SH=T_.sh;
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){let any=false;
    // a tile with no water anywhere around it stays clear
    const gx0=tx-tx0+1,gy0=ty-ty0+1;let near=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)near+=G[(gy0+dy)*gw+gx0+dx];
    if(near>0)for(let py=0;py<TS;py++)for(let px=0;px<TS;px++){
      const fx=(tx*TS+px+.5)/TS-.5,fy=(ty*TS+py+.5)/TS-.5,xi=Math.floor(fx),yi=Math.floor(fy),ax=fx-xi,ay=fy-yi,gx=xi-tx0+1,gy=yi-ty0+1;
      const q00=G[gy*gw+gx],q10=G[gy*gw+gx+1],q01=G[(gy+1)*gw+gx],q11=G[(gy+1)*gw+gx+1],dp=(q00*(1-ax)+q10*ax)*(1-ay)+(q01*(1-ax)+q11*ax)*ay;
      if(dp<.04)continue;const o=(((ty-ty0)*TS+py)*w+(tx-tx0)*TS+px)*4;any=true;
      if(dp<.18){d[o+3]=Math.round(dp*255);continue;}
      let c,a;if(dp<1.2){c=S_;a=.28+(dp-.18)*.25;}else if(dp<2.4){const k=(dp-1.2)/1.2;c=[0,1,2].map(j=>S_[j]+(D_[j]-S_[j])*k);a=.55+k*.2;}else{const k=Math.min(1,(dp-2.4)/1.4);c=[0,1,2].map(j=>D_[j]+(A_[j]-D_[j])*k);a=.75+k*.15;}
      if(dp<.3){const A=1-(1-a)*.55;for(let j=0;j<3;j++)d[o+j]=(c[j]*a*.55+SH[j]*.45)/A;d[o+3]=Math.round(A*255);}
      else{for(let j=0;j<3;j++)d[o+j]=c[j];d[o+3]=Math.round(a*255);}}
    wetT[ty*MW+tx]=any?1:0;}
  wctx.putImageData(img,tx0*TS,ty0*TS);}
// notice water and ice that changed since the bake, a slice of the deck a frame
function liqScanTick(){if(!liqSnap||liqSnap.length!==MW*MH)return;const N=MW*MH,n=Math.ceil(N/LIQ_CFG.scanFrames);let x0=MW,y0=MH,x1=-1,y1=-1;
  for(let k=0;k<n;k++){const i=liqCur;liqCur=liqCur+1<N?liqCur+1:0;const v=liq[i]|(ice[i]?8:0);if(v===liqSnap[i])continue;liqSnap[i]=v;const x=i%MW,y=(i/MW)|0;
    if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  if(x1>=0)waterBake(x0-1,y0-1,x1+1,y1+1);}
// a soft-edged patch over a set of tiles: a circle at each tile centre, joined to its right and lower neighbours
function liqBlob(g,list,has,r){g.beginPath();for(const i of list){const x=(i%MW)*TS+6-camX,y=((i/MW)|0)*TS+6-camY;g.moveTo(x+r,y);g.arc(x,y,r,0,TAU);}
  for(const i of list){const x=(i%MW)*TS+6-camX,y=((i/MW)|0)*TS+6-camY;if(has(i+1)&&i%MW<MW-1)g.rect(x,y-r*.85,TS,r*1.7);if(has(i+MW))g.rect(x-r*.85,y,r*1.7,TS);}}
function fillA(g,col,a){const A0=g.globalAlpha;g.globalAlpha=A0*a;g.fillStyle=col;g.fill();g.globalAlpha=A0;}
// moving water over the water tiles on screen: caustics in the shallows, swells in the deep, drifting glints
function drawWaterMotion(list){if(!list.length)return;const t=T,st=LIQ_CFG.step,sh='rgb('+(wTint?wTint.shs:'170,215,215')+')';
  const cau=[[],[],[]],swell=[];
  for(const i of list){const l=liq[i],x0=(i%MW)*TS,y0=((i/MW)|0)*TS,dp=l===1?LIQ_CFG.puddle:l,band=dp<1?0:dp<2.5?1:2;
    for(let py=1;py<TS;py+=st)for(let px=(py>>1)%2;px<TS;px+=st){const x=x0+px,y=y0+py,w=Math.sin(x*.55+t*1.6)+Math.sin(y*.7-t*1.3)+Math.sin((x+y)*.31+t*.9);
      if(dp<1.6&&w>2.15)cau[band].push(x-camX,y-camY);else if(dp>2.4&&w<-2.3)swell.push(x-camX,y-camY);}}
  const A0=ctx.globalAlpha;ctx.fillStyle=sh;
  [.22*1.05,.22*.6,.22*.1].forEach((a,b)=>{const P=cau[b];if(!P.length)return;ctx.globalAlpha=A0*a;ctx.beginPath();for(let k=0;k<P.length;k+=2)ctx.rect(P[k]-.5,P[k+1]-.5,1,1);ctx.fill();});
  if(swell.length){ctx.globalAlpha=A0*.18;ctx.fillStyle='#000';ctx.beginPath();for(let k=0;k<swell.length;k+=2)ctx.rect(swell[k]-.5,swell[k+1]-.5,1,1);ctx.fill();}
  ctx.fillStyle='#ffffff';for(const i of list){if(liq[i]<2)continue;const h=hash(i%MW+91,((i/MW)|0)+37);if(h%3)continue;const ph=(t*.25+(h%100)/100)%1;
    ctx.globalAlpha=A0*.5*Math.sin(ph*Math.PI);ctx.fillRect((i%MW)*TS+2+((h>>>4)%5)+ph*8-camX,((i/MW)|0)*TS+3+((h>>>9)%7)-camY,2,1);}
  ctx.globalAlpha=A0;}
// ice: a frozen patch with a white rim, frost, trapped bubbles, cracks and an occasional sparkle (the water under it is
// not drawn: the bake counts ice as dry)
function drawIceTiles(list){if(!list.length)return;const S=new Set(list),has=i=>S.has(i),t=T;ctx.save();
  liqBlob(ctx,list,has,8.2);fillA(ctx,'#ebf8ff',.75);liqBlob(ctx,list,has,7.2);fillA(ctx,'#badaec',.85);ctx.clip();
  for(const i of list){const x=(i%MW)*TS-camX,y=((i/MW)|0)*TS-camY,h=hash((i%MW)*2+7,((i/MW)|0)*5+3);
    for(let k=0;k<5;k++){const q=(h>>>(k*5))&31;FA(k%2?'#ffffff':'#8cb4d2',k%2?.55:.4,x+(q%11),y+((q*7)%11),1,1);}
    if(h%4===0){FA('#e0f0ff',.6,x+3+(h%5),y+4+((h>>>3)%4),1,1);FA('#e0f0ff',.45,x+5+(h%4),y+6+((h>>>6)%3),1,1);}
    if(h%3===0){ctx.globalAlpha=.75;ctx.strokeStyle='#6e96b9';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x+1+(h%5),y+1);ctx.lineTo(x+4+(h%4),y+6);ctx.lineTo(x+10,y+4+(h%5));ctx.stroke();ctx.globalAlpha=1;}
    if(((t*.5+(h%97)/97)%1)<.02){F('#ffffff',x+2+(h%7),y+2+((h>>>3)%7),1,1);FA('#ffffff',.3,x+1+(h%7),y+1+((h>>>3)%7),3,3);}}
  ctx.restore();}
// oil: the old slick shapes (drawOil's anchors and joins) on their own canvas, darker, with thin-film colours sliding
// across them (source-atop, so the colours stay on the oil) and a faint sheen
let oilCv=null;
function drawOilTiles(list){if(!list.length)return;if(!oilCv)oilCv=document.createElement('canvas');if(oilCv.width!==W||oilCv.height!==H){oilCv.width=W;oilCv.height=H;}
  const o=oilCv.getContext('2d'),keep=ctx;o.globalCompositeOperation='source-over';o.globalAlpha=1;o.clearRect(0,0,W,H);ctx=o;try{for(const i of list)oilShape(i%MW,(i/MW)|0,oil[i]);}finally{ctx=keep;}
  o.globalCompositeOperation='source-atop';const film=['#aa5ac8','#50aabe','#d2b450','#5ac882'],t=T;o.lineWidth=1;
  for(const i of list){const h=hash((i%MW)*7,((i/MW)|0)*5);if(h%2)continue;const cx=(i%MW)*TS+6-camX+Math.sin(t*.35+h)*4,cy=((i/MW)|0)*TS+6-camY+Math.cos(t*.27+h*1.3)*2;
    o.globalAlpha=.4;o.strokeStyle=film[h%4];o.beginPath();o.ellipse(cx,cy,4+(h>>>3)%4,2+(h>>>5)%2,.3,0,Math.PI*1.4);o.stroke();
    o.globalAlpha=.14;o.fillStyle='#ffffff';o.fillRect(cx-3,cy-2,4,1);}
  o.globalCompositeOperation='source-over';o.globalAlpha=1;ctx.drawImage(oilCv,0,0);}
function oilShape(tx,ty,amt){const [ax,ay]=oilAnchor(tx,ty),x=ax-camX,y=ay-camY,h=hash(tx*7,ty*5);ctx.globalAlpha=.6+.12*amt;ctx.fillStyle='#0e0b08';ctx.strokeStyle='#0e0b08';ctx.lineCap='round';
  for(const [dx,dy] of D8){const nx=tx+dx,ny=ty+dy;if(nx<0||ny<0||nx>=MW||ny>=MH||!oil[ny*MW+nx])continue;if(dx<0||(dx===0&&dy<0))continue;
    const [bx,by]=oilAnchor(nx,ny),len=Math.hypot(bx-ax,by-ay)||1,bend=((hash(tx+nx*3,ty+ny*3)%7)-3)*0.8;
    ctx.lineWidth=4+Math.min(amt,oil[ny*MW+nx])*1.2;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo((ax+bx)/2-(by-ay)/len*bend-camX,(ay+by)/2+(bx-ax)/len*bend-camY,bx-camX,by-camY);ctx.stroke();}
  ctx.lineCap='butt';ctx.beginPath();ctx.ellipse(x,y,3.5+amt*0.9,2.8+amt*0.7,(h%8)*0.4,0,TAU);ctx.fill();ctx.globalAlpha=1;}
// toxic spill: a bright rim, a darker middle, bubbles that rise and pop, a little fume
function drawToxicTiles(list){if(!list.length)return;const S=new Set(list),has=i=>S.has(i),t=T;
  liqBlob(ctx,list,has,8);fillA(ctx,'#bef046',.55);liqBlob(ctx,list,has,7.1);fillA(ctx,'#568016',.92);
  const mid=list.filter(i=>has(i-1)&&has(i+1)&&has(i-MW)&&has(i+MW));if(mid.length){const M=new Set(mid);liqBlob(ctx,mid,i=>M.has(i),7);fillA(ctx,'#32500c',.45);}
  ctx.lineWidth=.5;for(const i of list){const x=(i%MW)*TS-camX,y=((i/MW)|0)*TS-camY,h=hash((i%MW)+5,((i/MW)|0)+11);
    for(let b=0;b<2;b++){const c=(t*.7+((h>>>(b*5))%10)/10)%1,bx=x+2+((h>>>(b*3))%8),by=y+2+((h>>>(b*3+7))%8);
      if(c<.8){ctx.globalAlpha=.3+c*.5;ctx.strokeStyle='#c8fa5a';ctx.beginPath();ctx.arc(bx,by,.4+c*1.4,0,TAU);ctx.stroke();}else{ctx.globalAlpha=Math.min(1,(1-c)*3);ctx.fillStyle='#dcff78';ctx.fillRect(bx-1,by-1,1,1);ctx.fillRect(bx+1,by+1,1,1);}}
    if(h%5===0){const m=(t*.3+(h%7)/7)%1;ctx.globalAlpha=.18*(1-m);ell(ctx,x+6+Math.sin(h+t)*3,y+4-m*10,2+m*3,1.5+m*2,0,'#b8e060');}}
  ctx.globalAlpha=1;}
// molten slag: a glowing core under drifting dark crust plates, sparks and a heat glow; cooled slag (painted as dark
// glass in the tile layer) gets cracks that glow and fade
function drawMoltenTiles(core,cool){const t=T;
  for(const i of cool){const x=(i%MW)*TS-camX,y=((i/MW)|0)*TS-camY,h=hash((i%MW)+3,((i/MW)|0)+17),e=.3+.25*Math.sin(t*1.1+(i%MW)*2+((i/MW)|0));
    ctx.globalAlpha=e;ctx.strokeStyle='#c83c14';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x+(h%6)+2,y+2);ctx.lineTo(x+5,y+6);ctx.lineTo(x+(h%4)+7,y+10);ctx.stroke();}
  ctx.globalAlpha=1;if(!core.length)return;const S=new Set(core),has=i=>S.has(i),fl=.85+.15*Math.sin(t*3);ctx.save();
  liqBlob(ctx,core,has,8.4);ctx.fillStyle='#3a0e04';ctx.fill();liqBlob(ctx,core,has,7.4);fillA(ctx,'#e65a1e',fl);ctx.clip();
  ctx.fillStyle='#2a0e06';ctx.beginPath();const specks=[];
  for(const i of core){const x=(i%MW)*TS-camX,y=((i/MW)|0)*TS-camY,h=hash((i%MW)+3,((i/MW)|0)+17);
    for(let c=0;c<3;c++){const q=(h>>>(c*6))&63,cx=x+(q%10)+Math.sin(t*.4+c+h)*1.5,cy=y+((q>>3)%10)+Math.cos(t*.3+c)*1.2;ctx.moveTo(cx+2.2,cy);ctx.ellipse(cx,cy,2.2,1.4,c,0,TAU);specks.push(cx-2,cy-1.5);}}
  ctx.fill();ctx.globalAlpha=.5;ctx.fillStyle='#ff8c3c';for(let k=0;k<specks.length;k+=2)ctx.fillRect(specks[k],specks[k+1],1,1);
  for(const i of core){const x=(i%MW)*TS-camX,y=((i/MW)|0)*TS-camY,h=hash((i%MW)+3,((i/MW)|0)+17);for(let c=0;c<3;c++){ctx.globalAlpha=fl;ctx.fillStyle=c%2?'#ffdc78':'#ffaa3c';ctx.fillRect(x+((h>>>(c*4+1))%10),y+((h>>>(c*4+3))%10),2,1);}}
  ctx.restore();for(const i of core){const h=hash(i%MW,(i/MW)|0);if(h%3)continue;glow(ctx,(i%MW)*TS+6-camX,((i/MW)|0)*TS+6-camY,22,'255,120,40',.12+.03*Math.sin(t*2+h));}}
// slime trail: drawSlime()'s ribbon shapes, see-through and glossy, with a highlight that creeps along and droplets
function drawSlime(tx,ty,sl,k){
  const i=ty*MW+tx,[ax,ay]=slimeAnchor(tx,ty),x=ax-camX,y=ay-camY,h=hash(tx,ty),a=0.13+0.07*sl;
  const col=k===2?'#78d228':'#bec85a',hi=k===2?'#c8ff8c':'#ffffdc';ctx.lineCap='round';
  const has=(xx,yy)=>xx>=0&&yy>=0&&xx<MW&&yy<MH&&slime[yy*MW+xx]>0,segs=[];
  for(const [dx,dy] of D8){const nx=tx+dx,ny=ty+dy;if(!has(nx,ny))continue;if(dx&&dy&&(has(tx+dx,ty)||has(tx,ty+dy)))continue;
    const n=ny*MW+nx,[bx,by]=slimeAnchor(nx,ny),hp=hash(Math.min(i,n),Math.max(i,n)),len=Math.hypot(bx-ax,by-ay)||1;
    const bend=((hp%9)-4)*0.9,cx=(ax+bx)/2-(by-ay)/len*bend,cy=(ay+by)/2+(bx-ax)/len*bend,mx=0.25*ax+0.5*cx+0.25*bx,my=0.25*ay+0.5*cy+0.25*by;
    segs.push([(ax+cx)/2-camX,(ay+cy)/2-camY,mx-camX,my-camY,2+Math.min(sl,slime[n])*0.6+((hp>>>5)%3)*0.4]);}
  const path=s=>{ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(s[0],s[1],s[2],s[3]);};const A0=ctx.globalAlpha;
  ctx.strokeStyle=col;ctx.globalAlpha=A0*a*1.4;for(const s of segs){ctx.lineWidth=s[4]+1.2;path(s);ctx.stroke();}
  ctx.globalAlpha=A0*a*1.2;for(const s of segs){ctx.lineWidth=s[4]*.5;path(s);ctx.stroke();}
  ctx.fillStyle=col;ctx.globalAlpha=A0*a*1.5;ctx.beginPath();const r1=2.2+sl*0.5+(h%3)*0.4,r2=1.6+sl*0.35;ctx.ellipse(x,y,r1,r2,(h%8)*0.4,0,TAU);
  if(sl>=2&&(h>>>7)%3===0){const ox=((h>>>9)%5)-2,oy=((h>>>12)%5)-2;ctx.moveTo(x+ox+2,y+oy);ctx.ellipse(x+ox,y+oy,2,1.4,(h%5)*0.6,0,TAU);}ctx.fill();
  // the gloss: a thin highlight creeping along the trail, and a droplet now and then
  ctx.strokeStyle=hi;ctx.globalAlpha=A0*.45;ctx.lineWidth=.6;ctx.setLineDash([2,5]);ctx.lineDashOffset=-T*6-h%7;for(const s of segs){path(s);ctx.stroke();}ctx.setLineDash([]);
  if((h>>>14)%4===0){ctx.fillStyle=col;ctx.globalAlpha=A0*.5;ctx.fillRect(x+((h>>>16)%7)-3,y+((h>>>19)%7)-3+2,1,1);}
  if(k===2&&Math.random()<0.01)parts.push({x:ax+rr(-2,2),y:ay+rr(-2,2),vx:0,vy:-8,t:0.5,m:0.5,c:'#a0e040',s:1});
  ctx.globalAlpha=A0;ctx.lineCap='butt';}
