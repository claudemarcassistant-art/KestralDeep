// ---------- world render ----------
function cutFogRadial(pts,cx,cy,Rr,a){
  const g=fctx.createRadialGradient(cx,cy,0,cx,cy,Rr);
  g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(0.55,`rgba(0,0,0,${a*0.94})`);g.addColorStop(1,'rgba(0,0,0,0)');
  fctx.fillStyle=g;poly(fctx,pts);
}
function poly(c,pts){c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.closePath();c.fill();}
function flarePoly(f){const N=120,pts=[];for(let i=0;i<N;i++){const a=i/N*6.2832,c=Math.cos(a),s=Math.sin(a);
  const d=Math.min(f.r,castRay(f.x,f.y,c,s,f.r,true)+6);pts.push(f.x+c*d-camX,f.y+s*d-camY);}return pts;}
function render(){
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;uiRects=[];
  F('#050607',0,0,W,H);
  if(state==='title'){drawTitle();ctx.drawImage(vcv,0,0);crosshair();return;}
  if(state==='report'){drawReport();ctx.drawImage(vcv,0,0);crosshair();return;}
  if(state==='route'||state==='node'){if(state==='route')drawRoute();else drawNode();ctx.drawImage(vcv,0,0);if(menuOpen){uiRects=[];drawMenu();}crosshair();return;}
  const p=player,sx=shake?rr(-shake,shake):0,sy=shake?rr(-shake,shake):0;
  const la=p.aiming?0.34:0.22;p.look+=(la-p.look)*0.12;const vo=viewOrigin();
  {let tx=(mouse.sx-W/2)*p.look,ty=(mouse.sy-H/2)*p.look;if(p.peek){tx=Math.max(-(W/2-18),Math.min(W/2-18,(mouse.sx-W/2)*1.4));ty=Math.max(-(H/2-18),Math.min(H/2-18,(mouse.sy-H/2)*1.4));}
    p.cox=(p.cox||0)+(tx-(p.cox||0))*(p.peek?0.12:0.5);p.coy=(p.coy||0)+(ty-(p.coy||0))*(p.peek?0.12:0.5);}
  camX=Math.round(vo.x+p.cox-W/2+sx);camY=Math.round(vo.y+p.coy-H/2+sy);
  // player light polygon with per-direction radius
  buildOcc(vo.x,vo.y,300);
  const N=240,outer=[],mid=[],inner=[],pcx=vo.x-camX,pcy=vo.y-camY;
  for(let i=0;i<N;i++){const a=i/N*6.2832,c=Math.cos(a),s=Math.sin(a),Rr=lightR(a);
    const hit=castRay(vo.x,vo.y,c,s,Rr,true),d=hit<Rr?Math.min(Rr,hit+6):Rr;
    let d2=Math.min(d,Rr*0.9),d3=Math.min(d,Rr*0.78),d1=d;

    outer.push(pcx+c*d1,pcy+s*d1);mid.push(pcx+c*d2,pcy+s*d2);inner.push(pcx+c*d3,pcy+s*d3);}
  for(const f of flares){f.r=FLARE_R+Math.sin(T*23+f.ph)*4;f.pts=flarePoly(f);}
  glows=[...flares];
  for(const L of lamps){if(Math.hypot(L.x-p.x,L.y-p.y)>260)continue;L.r=30+Math.sin(T*1.3+L.ph)*1.5;L.t=9;L.pts=flarePoly(L);glows.push(L);}
  if(p.st&&p.st.brn>40){const g={x:p.x,y:p.y,r:26+p.st.brn*0.18,t:9};g.pts=flarePoly(g);glows.push(g);}
  for(const f of fires){if(Math.hypot(f.x-p.x,f.y-p.y)>280)continue;f.r=46+Math.sin(T*17+f.ph)*3;f.t=9;f.pts=flarePoly(f);glows.push(f);}
  const tx0=Math.floor(camX/TS),ty0=Math.floor(camY/TS),tx1=Math.floor((camX+W)/TS),ty1=Math.floor((camY+H)/TS);
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){
    if(tx<0||ty<0||tx>=MW||ty>=MH||!seen[ty*MW+tx])continue;
    ctx.drawImage(mcv,tx*TS,ty*TS,TS,TS,tx*TS-camX,ty*TS-camY,TS,TS);
    if(ice[ty*MW+tx])drawIce(tx,ty);
    if(flot[ty*MW+tx])drawFlotsam(tx,ty);
    if(oil[ty*MW+tx])drawOil(tx,ty,oil[ty*MW+tx]);
    if(slime[ty*MW+tx])drawSlime(tx,ty,slime[ty*MW+tx],slimeK[ty*MW+tx]);
    const l=ice[ty*MW+tx]?0:liq[ty*MW+tx];if(l>=2){const ph=T*1.6+tx*0.9+ty*1.7;ctx.fillStyle=`rgba(170,220,225,${l===3?0.22:0.3})`;
      ctx.fillRect(tx*TS-camX+((Math.sin(ph)*3+5)|0),ty*TS-camY+((Math.cos(ph*0.8)*3+5)|0),2,1);}}
  for(const pn of panels){if(!seen[pn.ty*MW+pn.tx])continue;const x=pn.tx*TS-camX+2,y=pn.ty*TS-camY+3;
    if(x<-12||y<-12||x>W||y>H)continue;
    const base=pn.state==='dead'?'#141414':pn.state==='done'?'#16402a':pn.hack?'#10302c':'#141c2a';
    F('#070908',x-1,y-1,10,7);F(base,x,y,8,5);
    if(pn.state!=='dead'){for(let k=0;k<5;k++){const a=Math.random()*0.6;ctx.fillStyle=pn.state==='done'?`rgba(120,230,150,${a})`:pn.hack?`rgba(120,230,210,${a})`:`rgba(140,170,230,${a})`;ctx.fillRect(x+rnd(8),y+rnd(5),1,1);}
      if(Math.random()<0.06){ctx.fillStyle='rgba(200,240,240,0.5)';ctx.fillRect(x,y+rnd(5),8,1);}}
    else if(Math.random()<0.02)parts.push({x:pn.tx*TS+6,y:pn.ty*TS+8,vx:rr(-30,30),vy:rr(-10,30),t:0.3,m:0.3,c:'#ffe7a0',s:1});
    if(pn.hack&&pn.state==='idle'&&Math.sin(T*5+pn.ph)>0)F(AMBER,x+7,y+6,1,1);}
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){if(tx<0||ty<0||tx>=MW||ty>=MH||!seen[ty*MW+tx])continue;const hh=hz[ty*MW+tx];
    if(hh===1&&!hazOff){drawFireTile(tx,ty);}
    else if(hh===2&&Math.random()<0.03)parts.push({x:tx*TS+2+rnd(8),y:ty*TS+2+rnd(8),vx:0,vy:-6,t:0.6,m:0.6,c:'#b8e060',s:1});}
  drawFireBatch();
  drawMists();
  for(const v of vents){if(!seen[v.ty*MW+v.tx]||hazOff)continue;if(v.phase==='warn'&&Math.random()<0.4)parts.push({x:v.x+rr(-3,3),y:v.y,vx:rr(-5,5),vy:rr(-20,-8),t:0.5,m:0.5,c:'#c9cfc2',s:1});}
  for(const q of spawnQ){const x=Math.round(q.x-camX),y=Math.round(q.y-camY);if(q.kind==='drop'){const k=1-q.t/0.9;ctx.fillStyle=`rgba(0,0,0,${0.2+0.4*k})`;ctx.beginPath();ctx.ellipse(x,y+3,2+k*5,1+k*2,0,0,6.283);ctx.fill();}
    else if(q.kind==='floor'){for(let k=0;k<3;k++)F('#0a0c0b',x-4+rnd(8),y-4+rnd(8),2,1);}}
  for(const c of cores){if(c.dead)continue;const x=Math.round(c.x-camX),y=Math.round(c.y-camY);if(x<-20||y<-20||x>W+20||y>H+20)continue;
    ctx.fillStyle='#0a0406';circ(x,y,6);ctx.fillStyle=c.flash>0?'#fff':'#3a0a18';circ(x,y,5);
    for(let k=0;k<6;k++){const a=T*2+k*1.05+c.ph,r=4+Math.sin(T*5+k)*1.2;F(k%2?'#ff5a6a':'#c9a8ff',Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r),1,1);}
    F('#1a0a0c',x-7,y-10,14,2);F('#ff5a6a',x-7,y-10,Math.round(14*c.hp/c.max),2);}
  if(testMode&&testConsole){const x=testConsole.tx*TS-camX,y=testConsole.ty*TS-camY;F('rgba(0,0,0,0.45)',x+1,y+9,10,2);F('#15110a',x+1,y,10,10);F('#2e3533',x+2,y+1,8,8);
    F('#1a0f24',x+3,y+2,6,4);for(let k=0;k<3;k++)F(`rgba(200,160,255,${Math.random()*0.8})`,x+3+rnd(6),y+2+rnd(4),1,1);F('#c9a8ff',x+4,y+7,4,1);
    const px2=10*TS-camX+6,py2=38*TS-camY+6;ctx.strokeStyle=`rgba(201,168,255,${0.3+0.2*Math.sin(T*3)})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(px2,py2,10,0,6.283);ctx.stroke();ctx.beginPath();ctx.arc(px2,py2,5,0,6.283);ctx.stroke();}
  for(const r of risers)if(seen[r.ty*MW+r.tx])drawRiser(r);
  for(const f of fans)if(seen[f.ty*MW+f.tx])drawFan(f);
  for(const c of cables){if(hazOff||!seen[c.ty*MW+c.tx])continue;const x=c.tx*TS-camX,y=c.ty*TS-camY;if(x<-40||y<-40||x>W+40||y>H+40)continue;
    if(c.phase==='idle'){if(Math.random()<0.05)F('#cfe6ff',x+2+rnd(8),y+2+rnd(8),1,1);}
    else if(c.phase==='warn'){for(let k=0;k<3;k++)F(Math.random()<.5?'#ffffff':'#8fc3ff',x+2+rnd(8),y+2+rnd(8),1,1);}
    else{ctx.strokeStyle='rgba(190,225,255,0.9)';ctx.lineWidth=1;for(let k=0;k<2;k++){ctx.beginPath();let px=x+6,py=y+6;ctx.moveTo(px,py);for(let j=0;j<5;j++){px+=rr(-7,7);py+=rr(-7,7);ctx.lineTo(px,py);}ctx.stroke();}
      if(c.zone)for(const i of c.zone){if(!seen[i]||Math.random()<0.6)continue;F(Math.random()<.5?'#e0f0ff':'#6fa8ff',(i%MW)*TS-camX+rnd(TS),((i/MW)|0)*TS-camY+rnd(TS),1,1);}}}
  for(const b of barrels)if(!b.dead&&seen[b.ty*MW+b.tx])drawBarrel(b);
  for(const v of vendors){if(!seen[v.ty*MW+v.tx])continue;const x=v.tx*TS-camX,y=v.ty*TS-camY;if(x<-16||y<-16||x>W+16||y>H+16)continue;drawVendor(v,x,y);}
  for(const lb of testLabels)if(seen[Math.floor(lb.y)*MW+Math.floor(lb.x)])txt(lb.s,Math.round(lb.x*TS-camX+(lb.c?0:0)),Math.round(lb.y*TS-camY),'#5d6a66',lb.c?'center':'left',lb.sz||8);
  const ex=exitT.x*TS-camX,ey=exitT.y*TS-camY,exSeen=seen[exitT.y*MW+exitT.x];
  if(exSeen&&liftState!=='open'){const col=liftState==='locked'||liftState==='arena'?'#c04030':liftState==='idle'?AMBER:liftState==='alarm'?(Math.sin(T*10)>0?'#ff4030':'#601810'):'#7fe08e';
    F(col,ex-1,ey-1,TS+2,1);F(col,ex-1,ey+TS,TS+2,1);F(col,ex-1,ey-1,1,TS+2);F(col,ex+TS,ey-1,1,TS+2);}
  if(exSeen){const pu=0.5+0.5*Math.sin(T*4);F('#2a2214',ex,ey,TS,TS);
    ctx.fillStyle=`rgba(217,164,65,${0.35+0.4*pu})`;for(let i=0;i<4;i++)ctx.fillRect(ex+1,ey+1+i*3,TS-2,1);
    F(AMBER,ex+5,ey+3,2,4);F(AMBER,ex+3,ey+6,6,1);F(AMBER,ex+4,ey+7,4,1);F(AMBER,ex+5,ey+8,2,1);}
  for(const sc of ventRooms){if(!sc.known||sc.open||!seen[sc.ey*MW+sc.ex])continue;const x=sc.ex*TS-camX,y=sc.ey*TS-camY,a=0.4+0.35*Math.sin(T*4);
    ctx.fillStyle=`rgba(111,208,192,${a})`;for(let k=0;k<3;k++)ctx.fillRect(x+3,y+4+k*2,6,1);}
  for(const sc of secrets){if(!sc.known||sc.open||!seen[sc.ey*MW+sc.ex])continue;const x=sc.ex*TS-camX,y=sc.ey*TS-camY,a=0.45+0.35*Math.sin(T*4);
    ctx.fillStyle=`rgba(224,176,80,${a})`;[[3,3],[4,4],[5,5],[5,6],[6,7],[7,7],[8,8],[4,8],[3,9],[8,4],[9,3]].forEach(([u,v])=>ctx.fillRect(x+u,y+v,1,1));}
  drawSoftShadows();
  for(const h of hatches){if(seen[h.ty*MW+h.tx])drawHatch(h);if(seen[h.ly*MW+h.lx])drawLadder(h);}
  for(const f of fixtures)if(seen[f.ty*MW+f.tx])drawFixture(f);
  if(freightT&&seen[freightT.y*MW+freightT.x]){const x=freightT.x*TS-camX,y=freightT.y*TS-camY,pu=0.5+0.5*Math.sin(T*3);F('#15110a',x-6,y-6,24,24);F('#3a3020',x-5,y-5,22,22);
    for(let k=0;k<22;k+=3)F('#2a2014',x-5,y-5+k,22,1);for(let k=0;k<22;k++)if(((k)>>1)%2===0){F('#8a6a24',x-5+k,y-5,1,2);F('#8a6a24',x-5+k,y+15,1,2);}
    F(`rgba(217,164,65,${0.5+0.4*pu})`,x+3,y,6,1);txt('F',x+6,y+2,AMBER,'center');}
  for(const pl of plants)if(!pl.burst&&seen[Math.floor(pl.y/TS)*MW+Math.floor(pl.x/TS)])drawPlant(pl);
  for(const l of levers)if(seen[l.ty*MW+l.tx])drawLever(l);
  for(const c of chests)if(seen[c.ty*MW+c.tx])drawChest(c);
  for(const it of items){const t=Math.floor(it.y/TS)*MW+Math.floor(it.x/TS);if(!seen[t])continue;if(it.fall>0){const k=it.fall/it.fallM,x=it.x-camX,y=it.y-camY;ctx.save();ctx.globalAlpha=k;ctx.translate(x,y);ctx.scale(k,k);ctx.translate(-x,-y);drawItem(it);ctx.restore();}else drawItem(it);}
  for(const o of flasksOut){const x=Math.round(o.x-camX),y=Math.round(o.y-camY);F('#8a969e',x-1,y-2,3,4);if(o.n)F(FLASKCOL[o.kind],x-1,y,3,2);}
  for(const c of charges){const x=Math.round(c.x-camX),y=Math.round(c.y-camY);F('#7a8c93',x-2,y-1,4,2);if(Math.sin(c.t*30)>0)F('#ff5a3a',x,y-2,1,1);}
  for(const f of flares){const x=Math.round(f.x-camX),y=Math.round(f.y-camY);F('#8a2d24',x-2,y,4,1);F('#ffd0a0',x+1,y-1,2,2);}
  for(const e of enemies)if(e.caged&&!e.caged.open&&seen[Math.floor(e.y/TS)*MW+Math.floor(e.x/TS)]&&visible(e.x,e.y,e.r)){drawEnemy(e);}
  for(const c of cages)if(seen[c.ty*MW+c.tx])drawCage(c);
  for(const e of enemies)if(!(e.caged&&!e.caged.open)&&visible(e.x,e.y,e.r)){drawEnemy(e);if(bestiary&&!ET[e.type].dummy&&!bestiary.seen[e.type]){bestiary.seen[e.type]=depth;if(state==='play')say('new creature logged: '+BEASTINFO[e.type].name.toLowerCase()+'. B to view');}}
  if(state==='play'){drawPlayer();if(p.weapon==='ray'&&p.charge>0){const mx=p.x-camX+Math.cos(p.ang)*11,my=p.y-camY+Math.sin(p.ang)*11;ctx.fillStyle=`rgba(140,255,170,${0.4+0.3*Math.sin(T*30)})`;circ(mx,my,1+p.charge*2.5);}if(p.dazeT>0)for(let k=0;k<3;k++){const q=T*6+k*2.1;F('#e8dcb0',Math.round(p.x-camX+Math.cos(q)*6),Math.round(p.y-camY-8+Math.sin(q)*1.5),1,1);}wade(Math.round(p.x-camX),Math.round(p.y-camY),4,liqAt(p.x,p.y));}
  for(const b of bullets){const x=b.x-camX,y=b.y-camY;
    if(b.p&&b.kind==='sling'){const c=b.slk==='debris'?'#8e978b':(SLING[b.slk]||{}).col||'#ccc';F('#15110a',Math.round(x)-1,Math.round(y)-1,3,3);F(c,Math.round(x),Math.round(y)-1,1,2);}
    else if(b.p&&b.kind==='bow'){const sp=Math.hypot(b.vx,b.vy)||1,ux=b.vx/sp,uy=b.vy/sp;ctx.strokeStyle='#c8b090';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-ux*6,y-uy*6);ctx.lineTo(x+ux*2,y+uy*2);ctx.stroke();F('#d8dcd4',Math.round(x+ux*2),Math.round(y+uy*2),1,1);F('#e06a5a',Math.round(x-ux*6),Math.round(y-uy*6),1,1);}
    else if(b.p&&b.kind==='knives'){const a=(b.life||0)*40,ca=Math.cos(a)*3,sa=Math.sin(a)*3;ctx.strokeStyle='#d8dcd4';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-ca,y-sa);ctx.lineTo(x+ca,y+sa);ctx.stroke();F('#5a3e22',Math.round(x-ca),Math.round(y-sa),1,1);}
    else if(b.p){const tl=b.kind==='ray'?0.03:b.kind==='bolt'?0.02:0.012;ctx.strokeStyle=b.kind==='ray'?'#8fffa8':b.kind==='bolt'?'#bfe4ff':b.kind==='nailer'?'#c8ccc4':'#ffe7a0';ctx.lineWidth=b.kind==='ray'?(b.w||1):1;
      ctx.beginPath();ctx.moveTo(x-b.vx*tl,y-b.vy*tl);ctx.lineTo(x,y);ctx.stroke();}
    else if(b.big&&visible(b.x,b.y,2)){F('#3a2a14',Math.round(x)-3,Math.round(y)-3,6,6);F('#8a6a3a',Math.round(x)-2,Math.round(y)-2,4,4);}
    else if(b.slug&&visible(b.x,b.y,2)){F('#ffd070',Math.round(x)-1,Math.round(y),3,1);F('#fff0c0',Math.round(x),Math.round(y),1,1);}
    else if(b.seed&&visible(b.x,b.y,2)){F('#2a1a10',Math.round(x)-1,Math.round(y)-1,3,3);F('#c8a060',Math.round(x),Math.round(y)-1,1,1);}
    else if(b.web&&visible(b.x,b.y,2)){ctx.strokeStyle='#d8dcd4';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-2,y-2);ctx.lineTo(x+2,y+2);ctx.moveTo(x+2,y-2);ctx.lineTo(x-2,y+2);ctx.moveTo(x-3,y);ctx.lineTo(x+3,y);ctx.stroke();}
    else if(visible(b.x,b.y,2)){ctx.fillStyle='#1f3a36';circ(x,y,2.5);ctx.fillStyle='#9fd4c8';circ(x,y,1.5);}}
  for(const q of parts){const x=q.x-camX,y=q.y-camY;if(x<-4||y<-4||x>W+4||y>H+4)continue;ctx.globalAlpha=Math.max(0,q.t/q.m);F(q.c,Math.round(x),Math.round(y),q.s,q.s);}
  ctx.globalAlpha=1;
  // fog
  fctx.globalCompositeOperation='source-over';fctx.clearRect(0,0,W,H);
  fctx.fillStyle=cond.light==='dark'?'rgba(2,3,4,0.96)':cond.light==='lit'?'rgba(3,4,5,0.84)':'rgba(3,4,5,0.9)';fctx.fillRect(0,0,W,H);
  fctx.globalCompositeOperation='destination-out';
  fctx.fillStyle='rgba(0,0,0,0.55)';poly(fctx,outer);
  fctx.fillStyle='rgba(0,0,0,0.6)';poly(fctx,mid);
  fctx.fillStyle='rgba(0,0,0,1)';poly(fctx,inner);
  for(const f of glows)cutFogRadial(f.pts,f.x-camX,f.y-camY,f.r,Math.min(1,f.t/2));
  ctx.drawImage(fcv,0,0);
  if(S.nvg){ctx.globalCompositeOperation='multiply';F('#8fe39a',0,0,W,H);ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='rgba(120,255,140,0.04)';for(let y=(T*40|0)%3;y<H;y+=3)ctx.fillRect(0,y,W,1);}
  // lights
  ctx.globalCompositeOperation='lighter';
  for(const l of lights){const x=l.x-camX,y=l.y-camY,a=0.35*l.t/l.m,lg=ctx.createRadialGradient(x,y,0,x,y,l.r);
    lg.addColorStop(0,`rgba(${l.c},${a})`);lg.addColorStop(1,`rgba(${l.c},0)`);ctx.fillStyle=lg;ctx.fillRect(x-l.r,y-l.r,l.r*2,l.r*2);}
  for(const f of flares){const x=f.x-camX,y=f.y-camY,a=0.22*Math.min(1,f.t/2)*(0.85+0.15*Math.sin(T*31+f.ph)),lg=ctx.createRadialGradient(x,y,0,x,y,f.r);
    lg.addColorStop(0,`rgba(255,110,60,${a})`);lg.addColorStop(1,'rgba(255,110,60,0)');ctx.fillStyle=lg;ctx.fillRect(x-f.r,y-f.r,f.r*2,f.r*2);}
  if(exSeen){const pu=0.5+0.5*Math.sin(T*4);ctx.fillStyle=`rgba(217,164,65,${0.15+0.2*pu})`;ctx.fillRect(ex+4,ey+4,4,4);}
  for(const f of fires){const x=f.x-camX,y=f.y-camY;if(x<-80||y<-80||x>W+80||y>H+80)continue;const a=0.16+0.05*Math.sin(T*13+f.ph),lg=ctx.createRadialGradient(x,y,0,x,y,50);
    lg.addColorStop(0,`rgba(255,120,40,${a})`);lg.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=lg;ctx.fillRect(x-50,y-50,100,100);}
  for(const v of vendors){if(!seen[v.ty*MW+v.tx]||v.state==='dead')continue;const x=v.tx*TS-camX+6,y=v.ty*TS-camY+6;if(x<-30||y<-30||x>W+30||y>H+30)continue;
    const c=VSTYLE[v.style].glow,a=0.13+0.05*Math.random(),lg=ctx.createRadialGradient(x,y,0,x,y,26);lg.addColorStop(0,`rgba(${c},${a})`);lg.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=lg;ctx.fillRect(x-26,y-26,52,52);}
  for(const pn of panels){if(!seen[pn.ty*MW+pn.tx]||pn.state==='dead')continue;const x=pn.tx*TS-camX+6,y=pn.ty*TS-camY+5;if(x<-20||y<-20||x>W+20||y>H+20)continue;
    const c=pn.state==='done'?'110,230,140':pn.hack?'100,220,200':'120,150,230',a=0.1+0.06*Math.random(),lg=ctx.createRadialGradient(x,y,0,x,y,16);
    lg.addColorStop(0,`rgba(${c},${a})`);lg.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=lg;ctx.fillRect(x-16,y-16,32,32);}
  for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){if(tx<0||ty<0||tx>=MW||ty>=MH||hz[ty*MW+tx]!==2||!seen[ty*MW+tx])continue;ctx.fillStyle='rgba(140,200,40,0.05)';ctx.fillRect(tx*TS-camX-2,ty*TS-camY-2,TS+4,TS+4);}
  if(state==='play'&&p.aiming&&!paused())drawLaser();
  if(sonarT>0){const rr2=sonarRing*260;if(rr2<200){ctx.strokeStyle=`rgba(120,255,160,${0.4*(1-rr2/200)})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(pcx,pcy,rr2,0,6.283);ctx.stroke();}
    for(const e of enemies){const d=Math.hypot(e.x-p.x,e.y-p.y);if(d>200)continue;const a=Math.min(1,sonarT)*(0.5+0.4*Math.sin(T*10));
      ctx.fillStyle=`rgba(255,80,60,${a})`;const x=Math.round(e.x-camX),y=Math.round(e.y-camY);ctx.fillRect(x-1,y-1,3,3);
      ctx.strokeStyle=`rgba(255,80,60,${a*0.5})`;ctx.beginPath();ctx.arc(x,y,e.r+3,0,6.283);ctx.stroke();}}
  ctx.globalCompositeOperation='source-over';
  if(cores.length){ctx.globalCompositeOperation='lighter';for(const c of cores){if(c.dead)continue;const x=c.x-camX,y=c.y-camY,a=0.18+0.08*Math.sin(T*6+c.ph),lg=ctx.createRadialGradient(x,y,0,x,y,40);
    lg.addColorStop(0,`rgba(255,70,100,${a})`);lg.addColorStop(1,'rgba(255,70,100,0)');ctx.fillStyle=lg;ctx.fillRect(x-40,y-40,80,80);}ctx.globalCompositeOperation='source-over';}
  for(const r of risers){if(r.phase!=='spray'||hazOff)continue;const k=Math.min(1,r.t/0.4);
    for(let j=1;j<=3;j++){const gx=r.x-camX+Math.cos(r.ang)*j*12,gy=r.y-camY+Math.sin(r.ang)*j*12,rad=6+j*5,lg=ctx.createRadialGradient(gx,gy,0,gx,gy,rad);
      const cc=r.cold?'190,225,255':'220,228,228';lg.addColorStop(0,`rgba(${cc},${0.35*k})`);lg.addColorStop(1,`rgba(${cc},0)`);ctx.fillStyle=lg;ctx.fillRect(gx-rad,gy-rad,rad*2,rad*2);}}
  for(const v of vents){if(v.phase!=='burst'||hazOff)continue;const x=v.x-camX,y=v.y-camY,k=Math.min(1,v.t/0.4);
    for(let j=0;j<3;j++){const gy=y-6-j*9-((T*30)%9),r=12+j*5,lg=ctx.createRadialGradient(x,gy,0,x,gy,r);lg.addColorStop(0,`rgba(210,220,220,${0.4*k})`);lg.addColorStop(1,'rgba(210,220,220,0)');ctx.fillStyle=lg;ctx.fillRect(x-r,gy-r,r*2,r*2);}}
  if((cond.haz==='fog'||cond.haz==='steam')&&!hazOff){const fa=cond.haz==='fog'?0.2:0.08;
    for(let k=0;k<7;k++){const r=70+(k%3)*20,x=((k*131-camX*0.9+T*(6+k*2))%(W+2*r)+W+2*r)%(W+2*r)-r,y=((k*83-camY*0.9+T*(k%2?3:-3))%(H+2*r)+H+2*r)%(H+2*r)-r;
      const lg=ctx.createRadialGradient(x,y,0,x,y,r);lg.addColorStop(0,`rgba(140,150,150,${fa})`);lg.addColorStop(1,'rgba(140,150,150,0)');ctx.fillStyle=lg;ctx.fillRect(x-r,y-r,r*2,r*2);}}
  for(const a of anoms){const x=a.x-camX,y=a.y-camY;if(x<-100||y<-100||x>W+100||y>H+100)continue;
    let lg=ctx.createRadialGradient(x,y,0,x,y,30);lg.addColorStop(0,'rgba(0,0,0,0.95)');lg.addColorStop(0.4,'rgba(10,0,20,0.6)');lg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=lg;ctx.fillRect(x-30,y-30,60,60);
    ctx.globalCompositeOperation='lighter';lg=ctx.createRadialGradient(x,y,6,x,y,90);lg.addColorStop(0,'rgba(150,80,255,0.16)');lg.addColorStop(1,'rgba(150,80,255,0)');ctx.fillStyle=lg;ctx.fillRect(x-90,y-90,180,180);
    for(let k=0;k<18;k++){const rad=62-((T*26+k*11)%56),ang=T*(1.2+k*0.07)+k*2.1+(62-rad)*0.06;ctx.fillStyle=`rgba(190,140,255,${0.2+0.6*(1-rad/62)})`;ctx.fillRect(Math.round(x+Math.cos(ang)*rad),Math.round(y+Math.sin(ang)*rad),1,1);}
    ctx.globalCompositeOperation='source-over';ctx.strokeStyle=`rgba(190,140,255,${0.5+0.3*Math.sin(T*8+a.ph)})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,9,0,6.283);ctx.stroke();
    ctx.fillStyle='#000';circ(x,y,7);}
  if(S.compass&&state==='play'){const a=Math.atan2(exitT.y*TS+6-p.y,exitT.x*TS+6-p.x),x=pcx+Math.cos(a)*15,y=pcy+Math.sin(a)*15;
    ctx.fillStyle='rgba(217,164,65,0.85)';ctx.beginPath();ctx.moveTo(x+Math.cos(a)*3,y+Math.sin(a)*3);
    ctx.lineTo(x+Math.cos(a+2.4)*3,y+Math.sin(a+2.4)*3);ctx.lineTo(x+Math.cos(a-2.4)*3,y+Math.sin(a-2.4)*3);ctx.closePath();ctx.fill();}
  for(const t of texts){ctx.globalAlpha=Math.min(1,t.t*2);txt(t.s,Math.round(t.x-camX),Math.round(t.y-camY)-10,t.col,'center');}
  ctx.globalAlpha=1;
  if(p.st&&p.st.rad>40){for(let k=0;k<(p.st.rad-40)/4;k++)F(`rgba(201,168,255,${Math.random()*0.35})`,rnd(W),rnd(H),rnd(3)+1,1);}
  if(p.st&&p.st.brn>=100)F(`rgba(255,110,30,${0.05+0.03*Math.sin(T*9)})`,0,0,W,H);
  if(sprinkT>0){ctx.strokeStyle='rgba(170,200,220,0.35)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<60;k++){const rx=(k*53+T*40)%W,ry=((k*97)+T*260)%H;ctx.moveTo(rx,ry);ctx.lineTo(rx-1,ry+5);}ctx.stroke();}
  if(purgeGas)F(`rgba(90,140,30,${0.1+0.04*Math.sin(T*2)})`,0,0,W,H);
  if(p.hurtT>0)F(`rgba(140,20,15,${p.hurtT*0.6})`,0,0,W,H);
  drawActWorld();
  ctx.drawImage(vcv,0,0);
  hud();
  if(menuOpen)drawMenu();
  if(mapOpen)drawMap();
  if(vendUI)drawVend();
  if(spawnUI)drawSpawnUI();
  if(deckUI)drawDeckUI();
  if(grindUI)drawGrindUI();
  if(choiceUI)drawChoiceUI();
  if(diceUI)drawDiceUI();
  if(arcadeUI)drawArcade();
  if(hackUI)drawHack();
  if(state==='dead'){
    F(`rgba(4,5,6,${Math.min(0.85,deadT)})`,0,0,W,H);
    txt('SIGNAL LOST',W/2,H/2-34,'#b84a3e','center',16);
    txt('reached depth '+depth+', '+sector(depth).toLowerCase(),W/2,H/2-8,'#c9cfc2','center');
    txt(kills+' of them put down',W/2,H/2+3,'#c9cfc2','center');if(runAlertWaves)txt(runAlertWaves+' waves drawn by your noise',W/2,H/2+25,'#8e978b','center');txt('score '+(runScore+liveLevelScore())+(testMode?'':'   best '+bestScore),W/2,H/2+14,AMBER,'center');
    if(runSeed)txt('seed '+runSeed.code+(runSeed.kind!=='random'?'   seeded run ('+runSeed.kind+')':''),W/2,H/2+38,runSeed.kind!=='random'?'#d9a441':'#6f7a6a','center');
    if(deadT>1&&Math.sin(T*4)>-0.3)txt('Click to return to the title',W/2,H/2+(runSeed?50:28),'#e8dcb0','center');
  }
  if(!mapOpen)crosshair();
}
function crosshair(){const x=Math.round(mouse.sx),y=Math.round(mouse.sy),c=menuOpen||state!=='play'?'#e8dcb0':AMBER;
  F(c,x-4,y,2,1);F(c,x+3,y,2,1);F(c,x,y-4,1,2);F(c,x,y+3,1,2);F(c,x,y,1,1);}

