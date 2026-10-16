// ---------- crew, guards and anomalies (Batch 5 session 3, from docs/art/sprite-study.html) ----------
// Crew: the npc fixtures (NPCS) and the sensitive (the psychic fixture, the study's bone gambler) are drawn top-down by
// person() with CREW_CFG (src/data/art.js), facing down, each with its props and idle activity (drawCrew()). Guards and
// riot guards use person() with PEOPLE.guard / PEOPLE.riot (drawGuardBody(), called from drawEnemy()). Anomalies:
// drawAnomaly() picks the unstable look, or the crackling one on decks whose hazard is electrical; each keeps its own
// state on the anomaly object (a._an, a._cr), never in a shared global, and drawing never touches pull or damage.
const DOWN=Math.PI/2;
// the study's crate (a box with a lid line), with globalAlpha in place of an rgba() fill
function crewCrate(g,x,y,w,h,col,lid){g.fillStyle='#1a140c';g.fillRect(x-.5,y-.5,w+1,h+1);g.fillStyle=col;g.fillRect(x,y,w,h);g.fillStyle=lid;g.fillRect(x,y,w,1);const A0=g.globalAlpha;g.globalAlpha=A0*.3;g.fillStyle='#000';g.fillRect(x+w/2-.3,y+1,.6,h-1);g.globalAlpha=A0;}
HATS.gasmask=function(g,t,L){ell(g,1.3,0,1.2,1.6,0,'#14171a');ell(g,1.9,0,.7,.7,0,'#3a4048');pxl(g,2.3,0,'#8a9298',.8);pxl(g,.6,-1.4,'#d8d4a0',.7);};
const CREW_ART={
  scrapper(g,x,y,t,L,c){person(g,x,y,DOWN,t,L,c,{hands:[[-2.6+Math.sin(t*3)*.9,3.4],[1.2,-3.9]],
    over(g){ell(g,-3.6,0,3.3,4.6,0,'#2a2014');ell(g,-3.6,0,3,4.3,0,'#5a4a2a');ell(g,-3.2,-.6,2,2.8,0,'#7a6438');line(g,-6.6,-2.5,-4,-1.5,.9,'#8e978b');line(g,-6.8,1.4,-4.4,2.4,.9,'#6a7478');pxl(g,-5.6,-.2,'#c04030',1.1);pxl(g,-4.8,3,'#b8c4c8',.8);}});},
  quarter(g,x,y,t,L,c){crewCrate(g,x-11,y-3,6,6,'#5a4a30','#7a6440');crewCrate(g,x+5,y-3,6,6,'#4a5040','#646c56');pxl(g,x+8,y,'#d9a441',.8);
    person(g,x,y,DOWN,t,L,c,{hands:[[2.1,-1.6],[2.4,1.5]]});},
  cook(g,x,y,t,L,c){g.fillStyle='#202020';g.fillRect(x-3.5,y+4.5,7,4.5);const gl=.6+.4*Math.sin(t*5),A0=g.globalAlpha;g.globalAlpha=A0*gl;g.strokeStyle='#e65a28';g.lineWidth=.7;g.beginPath();g.arc(x,y+6.8,1.9,0,TAU);g.stroke();g.globalAlpha=A0;
    ell(g,x,y+6.8,2,1.8,0,'#8e978b');ell(g,x,y+6.8,1.5,1.3,0,'#7a4a24');
    person(g,x,y,DOWN,t,L,c,{hands:[[3.6+Math.cos(t*4)*.5,.6+Math.sin(t*4)*.5],[3.4,-2.2]],prop(g,t){line(g,3.6+Math.cos(t*4)*.5,.6+Math.sin(t*4)*.5,6.4+Math.cos(t*4)*.4,Math.sin(t*4)*.4,.6,'#b8a070');}});
    for(let k=0;k<4;k++){const m=(t*.5+k/4)%1;g.globalAlpha=A0*.45*(1-m);ell(g,x+Math.sin(k*2+t)*1.5,y+6-m*9,.8+m*1.2,.8+m*1.2,0,'#e8ece4');}g.globalAlpha=A0;},
  subject(g,x,y,t,L,c){const sw=Math.sin(t*.8)*.25;
    person(g,x,y,DOWN,t,L,c,{lean:sw,hands:[[.4,4.3],[.6,-4.3]],over(g,t){for(const [wy,cx,ex] of [[-.8,-4,-9],[0,-5,-10],[.8,-4.5,-8.5]]){g.strokeStyle='#3a3a48';g.lineWidth=.5;g.beginPath();g.moveTo(.3,wy);g.quadraticCurveTo(cx,wy*4,ex,wy*6+Math.sin(t+wy)*.6);g.stroke();}
      pxl(g,.9,-.9,'#c04040',.7);if((t*2.3)%1<.18)pxl(g,-9,-4.8,'#9fc3ff',1);if((t*1.7+.5)%1<.12)pxl(g,-9.8,.2,'#cfe6ff',.9);}});},
  bomber(g,x,y,t,L,c){g.fillStyle='#2a2a22';g.fillRect(x-5,y+4.5,10,4);for(const [cx,cy] of [[x-3,y+6.5],[x,y+7],[x+3,y+6.5]]){g.fillStyle='#8a3424';g.fillRect(cx-.8,cy-1.2,1.6,2.4);pxl(g,cx,cy-1.6,'#d9a441',.7);}
    const k=Math.floor(t*1.2)%3,tx=[[4.6,3],[5,0],[4.6,-3]][k];person(g,x,y,DOWN,t,L,c,{hands:[[tx[0],tx[1]],[3,-2.6+(k===2?1.2:0)]]});},
  locksmith(g,x,y,t,L,c){person(g,x,y,DOWN,t,L,c,{hands:[[3.3,1+Math.sin(t*5)*.3],[3.1,-1]],prop(g,t){for(const [hx,hy,s] of [[3.3,1,1],[3.1,-1,-1]])for(let k=0;k<3;k++){const ex=hx+1.6,ey=hy+s*(k-1)*.7;line(g,hx,hy,ex,ey,.4,'#b8b098');if(Math.sin(t*6+k*2+s)>.85)pxl(g,ex,ey,'#ffffff',.8);}}});},
  android(g,x,y,t,L,c){person(g,x,y,DOWN,t,L,c,{hands:[[1.6,4],[1.2,-4]],prop(g,t){ell(g,-.6,-2.2,1.5,1.8,0,'#15191b');pxl(g,-.9,-2.6,'#e0a040',.6);pxl(g,-.2,-1.7,'#e0a040',.6);pxl(g,-1,-1.6,'#c06030',.5);
      if((t*1.3)%1<.08){pxl(g,-1.8+Math.random(),-3.6,'#fff4c0',.9);pxl(g,-2.6,-4.3,'#ffd070',.7);}}});},
  pilot(g,x,y,t,L,c){shadow(g,x+1,y+3,10,6,.4);g.save();g.translate(x,y);paint(g,'mech',70,0,0,10,7.5,['#2a221a','#4a3a2a','#6a5238','#8a6e4a'],L,t,{wob:.04,size:1.5});
    for(const s of[-1,1]){g.fillStyle='#3a3026';g.fillRect(s*10-1.5,-2,3,6);pxl(g,s*10,4.2,'#5a4a36',1.4);}
    ell(g,0,-.5,5.6,4.6,0,'#120e0a');pxl(g,6,3.6,Math.sin(t*4)>0?'#ffb040':'#5a3a10',1.1);g.restore();
    person(g,x,y-.6,DOWN,t,L,c,{noShadow:true,noFeet:true,hands:[[2.6,4.2],[2.4,-4.2]]});
    g.strokeStyle='#5a4630';g.lineWidth=1.2;g.beginPath();g.ellipse(x,y-.5,5.6,4.6,0,.25,Math.PI-.25);g.stroke();},
  detective(g,x,y,t,L,c){person(g,x,y,DOWN,t,L,c,{hands:[[3.4+Math.sin(t*9)*.3,.9],[3.3,-1.2]],prop(g){g.fillStyle='#e8e4d8';g.fillRect(3.4,-2.2,2.4,2.6);g.fillStyle='#9a9688';g.fillRect(4.2,-1.8,1.2,.4);g.fillRect(4.2,-1.1,1.2,.4);line(g,3.4+Math.sin(t*9)*.3,.9,4.6+Math.sin(t*9)*.4,-.4,.4,'#2a2a2a');}});},
  // the sensitive: cross-legged, throwing bones that tumble and settle (a new throw every 2.4 s)
  gambler(g,x,y,t,L,c){const cy=t%2.4,throwing=cy<.35,tum=Math.min(1,cy/.9);
    person(g,x,y,DOWN,t,L,c,{sit:true,hands:[[throwing?4.6:2.6,1.6],[2.8,-1.8]]});
    const R=artRng(Math.floor(t/2.4)+3);for(let k=0;k<3;k++){const bx=x+(R()-.5)*7,by=y+7+R()*2.5,hop=(1-tum)*Math.abs(Math.sin(tum*9+k))*2;g.fillStyle='#e8e0cc';g.fillRect(bx-.6,by-.6-hop,1.3,1.3);pxl(g,bx,by-hop,'#5a4a3a',.4);}}
};
// an npc or psychic fixture at screen tile x,y (top left); the figure stands at the tile centre, a little high
function drawCrew(f,x,y){const id=f.kind==='psychic'?'gambler':f.npc,cfg=CREW_CFG[id],fn=CREW_ART[id];if(!cfg||!fn)return false;
  const cx=x+6,cy=y+5,t=T+(f.ph||0)+(f.tx*.37+f.ty*.61);olDraw(f,ART_OLC[id],cx-15,cy-13,30,26,()=>fn(ctx,cx,cy,t,spriteLight(cx+camX,cy+camY),cfg));
  if(f.kind==='psychic'){const A0=ctx.globalAlpha;ctx.globalAlpha=A0*.7;for(let k=0;k<3;k++){const a=T*1.2+k*2.1+(f.ph||0);pxl(ctx,cx+Math.cos(a)*7,cy-3+Math.sin(a)*4,'#c9a8ff',1);}ctx.globalAlpha=A0;}
  return true;}

// ---------- guards ----------
// the body faces where the guard walks (or where it looks while standing); the head turns to e.look, which is what the
// sight cone in drawActWorld() follows. Gun kits are drawn by drawKit() (noGun); an unarmed old-style guard keeps the
// study's sidearm. The flashlight is a lit dot at the leading hand, drawn again after the dark by drawEmissives().
const guardTint={};
function guardCfg(e,riot){const k=(riot?'r':'g')+(e.flash>0?'f':'');if(!guardTint[k]){const c=Object.assign({},riot?PEOPLE.riot:PEOPLE.guard);if(e.flash>0)Object.assign(c,{suit:'#d8dce4',hi:'#ffffff',head:'#c8ccd4'});guardTint[k]=c;}return guardTint[k];}
function guardBodyDir(e){const look=e.look||0;if(e._bd==null)e._bd=look;if(olPass)return e._bd;let target=look;
  if((e._mv||0)>0.12&&e._px!=null){const dx=e.x-e._px,dy=e.y-e._py;if(dx*dx+dy*dy>0.0004)target=Math.atan2(dy,dx);}e._px=e.x;e._py=e.y;
  let d=target-e._bd;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;e._bd+=d*0.18;return e._bd;}
function drawGuardBody(e,x,y,t,L){const b=ET[e.type],body=guardBodyDir(e);let head=(e.look||0)-body;while(head>Math.PI)head-=TAU;while(head<-Math.PI)head+=TAU;head=Math.max(-1.3,Math.min(1.3,head));
  const k=e.kit,gun=!k||k.gun,melee=k&&!k.gun&&!e.dry;
  person(ctx,x,y,body,t,L,guardCfg(e,b.riot),{arms:gun&&!(e.reloadT>0)?'aim':'rest',walk:(e._mv||0)>0.12,head,noGun:!!k,hands:melee?[[3.8,2.6],null]:null,
    over(g){if(!b.riot&&gun){const A0=g.globalAlpha;g.globalAlpha=A0*.8;pxl(g,4.4,-.6,'#fff0c8',.9);g.globalAlpha=A0;}}});}

// ---------- anomalies ----------
// hiccups come at irregular gaps: sometimes two or three close together, sometimes a long quiet stretch
function anomGap(){const r=Math.random();return r<.28?.12+Math.random()*.35:r<.7?1+Math.random()*2.6:3.2+Math.random()*4.5;}
function anomState(a,t){const s=a._an||(a._an={hic:-9,next:t+1.6,ring:-1,amp:1,flashy:true,fl:.07,len:.45,last:t,lastT:-1,tear:false});
  if(t<s.last-1){s.next=t+.5;s.ring=-1;}s.last=t;const moved=t!==s.lastT;s.lastT=t;
  if(t>s.next){s.hic=t;s.amp=.35+Math.random()*.9;s.flashy=s.amp>.75&&Math.random()<.8;s.fl=.04+Math.random()*.07;s.len=.3+Math.random()*.35;if(s.amp>.5)s.ring=t;s.next=t+anomGap();}
  const sinceH=t-s.hic,swell=sinceH<s.len?Math.sin(sinceH/s.len*Math.PI)*s.amp:0;
  const wob=Math.sin(t*3.1)*.7+Math.sin(t*7.3+1)*.45+Math.sin(t*17.9)*.25;
  if(moved)s.tear=sinceH<.05&&s.amp>.6||Math.random()<.008;
  return {r:7+wob+swell*4,swell,flash:s.flashy&&sinceH<s.fl,tear:s.tear,ringAge:s.ring>=0?t-s.ring:9};}
const ANOM_PAL=['#2a0f4a','#5a2a9a','#9a6ae8','#e4ccff'];
// unstable: its size wanders on out-of-step rhythms, it hiccups (a swell, a flash, a ring), its rim is a broken ring of
// dabs. The study's tear read pixels back from the canvas; here the tear copies a band of the canvas onto itself,
// shifted (no readback), with the same two colour-split lines.
function anomUnstable(g,a,x,y,t){const st=anomState(a,t),r=st.r,A0=g.globalAlpha;
  let lg=g.createRadialGradient(x,y,0,x,y,34+st.swell*6);lg.addColorStop(0,'rgba(0,0,0,0.95)');lg.addColorStop(.38,'rgba(14,2,26,0.62)');lg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=lg;g.fillRect(x-42,y-42,84,84);
  g.strokeStyle='#7846c8';g.lineWidth=.6;for(let k=0;k<4;k++){const rr2=40-((t*14+k*10)%36);g.globalAlpha=A0*(.05+.1*(1-rr2/40));g.beginPath();g.ellipse(x,y,rr2,rr2*.96,t*.3,0,TAU);g.stroke();}g.globalAlpha=A0;
  g.globalCompositeOperation='lighter';lg=g.createRadialGradient(x,y,6,x,y,90);lg.addColorStop(0,'rgba(150,80,255,'+(.15+st.swell*.12)+')');lg.addColorStop(1,'rgba(150,80,255,0)');g.fillStyle=lg;g.fillRect(x-90,y-90,180,180);
  for(let k=0;k<26;k++){const ph=(t*.42+k*.0385)%1,rad=64*(1-ph)*(1-ph)+r+2,ang=k*2.399+t*(.9+k*.03)+ph*5.5,al=.15+.7*ph;g.fillStyle=k%7===0?'#8ce6ff':'#c496ff';
    for(let j=0;j<3;j++){const a2=ang-j*.09*(1+ph*2),r2=rad+j*1.2;g.globalAlpha=A0*al*(1-j*.33);g.fillRect(x+Math.cos(a2)*r2-.5,y+Math.sin(a2)*r2-.5,1,1);}}
  for(const q of dabs('anomrim',70)){const ang=q.p+t*(.6+q.s*.8)*(q.j>.5?1:-1),nz=Math.sin(ang*3+t*5.1)*.8+Math.sin(ang*5-t*3.7)*.6+(q.s-.5)*1.4;
    const rr2=r+1.6+nz+st.swell*1.5;if(Math.sin(ang*2+t*2.3)>.75)continue;const i=Math.min(3,Math.max(0,Math.floor((q.j*.6+.25+st.swell*.4+.2*Math.sin(t*9+q.p))*4)));
    g.fillStyle=ANOM_PAL[i];g.globalAlpha=A0*(.55+.45*q.s);g.fillRect(x+Math.cos(ang)*rr2-.6,y+Math.sin(ang)*rr2-.6,1.2,1.2);}
  g.globalAlpha=A0;
  if(st.ringAge<.7){const k=st.ringAge/.7;g.globalAlpha=A0*.6*(1-k);g.strokeStyle='#d2b4ff';g.lineWidth=1;g.beginPath();g.arc(x,y,r+4+k*30,0,TAU);g.stroke();g.globalAlpha=A0;}
  g.globalCompositeOperation='source-over';
  g.fillStyle=st.flash?'#e8d8ff':'#000';g.beginPath();for(let k=0;k<=20;k++){const an=k/20*TAU,rr2=r-1.2+Math.sin(an*3+t*6)*.5+Math.sin(an*5-t*9)*.35;k?g.lineTo(x+Math.cos(an)*rr2,y+Math.sin(an)*rr2):g.moveTo(x+Math.cos(an)*rr2,y+Math.sin(an)*rr2);}g.closePath();g.fill();
  if(!st.flash){g.globalAlpha=A0*.5;g.fillStyle='#3c146e';g.beginPath();g.arc(x-r*.25,y-r*.3,r*.35,0,TAU);g.fill();g.globalAlpha=A0;g.fillStyle='#000';g.beginPath();g.arc(x+.4,y+.3,r*.62,0,TAU);g.fill();}
  if(st.tear){const by=Math.round(y-12+((t*53)%24)),bh=2+Math.round((t*31)%3),sh=(Math.sin(t*91)>0?1:-1)*(2+Math.round((t*17)%3)),sx=Math.round(x-24);
    if(sx>=0&&by>=0&&sx+48<=W&&by+bh<=H)g.drawImage(cv,sx,by,48,bh,sx+sh,by,48,bh);
    g.globalAlpha=A0*.25;g.fillStyle='#ff3cc8';g.fillRect(x-20+sh,by,40,1);g.globalAlpha=A0*.2;g.fillStyle='#3cdcff';g.fillRect(x-20-sh,by+bh-1,40,1);g.globalAlpha=A0;}}
// crackling (electrical decks): no big hiccups; it discharges in stuttering bursts of short jagged arcs from the rim,
// throws sparks, and its rim flickers with each burst; between bursts, the odd single snap
function anomCrack(g,a,x,y,t){let s=a._cr;if(!s||t<s.last-1)s=a._cr={last:t,arcs:[],sparks:[],burstEnd:0,next:t+.6};
  const dt=Math.max(0,Math.min(.05,t-s.last));s.last=t;const moving=dt>0,A0=g.globalAlpha;
  if(moving&&t>s.next){s.burstEnd=t+.15+Math.random()*1.1;s.next=s.burstEnd+(Math.random()<.35?.1+Math.random()*.4:.8+Math.random()*3.2);}
  const inBurst=t<s.burstEnd,wob=Math.sin(t*2.7)*.5+Math.sin(t*6.1+2)*.35,r=6.4+wob+(inBurst?.6:0);
  if(moving&&(inBurst?Math.random()<.45:Math.random()<.012)){const an=Math.random()*TAU,Ln=6+Math.random()*(inBurst?16:9),pts=[[Math.cos(an)*(r+1),Math.sin(an)*(r+1)]];
    const n=4+(Math.random()*3|0);for(let k=1;k<=n;k++){const d=r+1+Ln*k/n,j=(Math.random()-.5)*.55;pts.push([Math.cos(an+j)*d,Math.sin(an+j)*d]);}
    if(Math.random()<.4){const b=pts[2],ba=an+(Math.random()<.5?.6:-.6);pts.branch=[b,[b[0]+Math.cos(ba)*5,b[1]+Math.sin(ba)*5]];}
    s.arcs.push({pts,life:.05+Math.random()*.1,m:0,cyan:Math.random()<.35});
    for(let k=0;k<2;k++){const e=pts[pts.length-1],sa=an+(Math.random()-.5)*1.4,sp=20+Math.random()*40;s.sparks.push({x:e[0],y:e[1],vx:Math.cos(sa)*sp,vy:Math.sin(sa)*sp,life:.25+Math.random()*.2,m:0});}}
  for(const q of s.arcs)q.m+=dt;s.arcs=s.arcs.filter(q=>q.m<q.life);
  for(const q of s.sparks){q.m+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.92;q.vy*=.92;}s.sparks=s.sparks.filter(q=>q.m<q.life);
  let lg=g.createRadialGradient(x,y,0,x,y,32);lg.addColorStop(0,'rgba(0,0,0,0.95)');lg.addColorStop(.38,'rgba(10,4,24,0.6)');lg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=lg;g.fillRect(x-40,y-40,80,80);
  g.globalCompositeOperation='lighter';
  lg=g.createRadialGradient(x,y,6,x,y,80);lg.addColorStop(0,'rgba(140,110,255,'+(inBurst?.2:.12)+')');lg.addColorStop(1,'rgba(140,110,255,0)');g.fillStyle=lg;g.fillRect(x-80,y-80,160,160);
  g.fillStyle='#bea0ff';for(let k=0;k<20;k++){const ph=(t*.4+k*.05)%1,rad=58*(1-ph)*(1-ph)+r+2,ang=k*2.399+t*(.8+k*.03)+ph*5;g.globalAlpha=A0*(.15+.6*ph);g.fillRect(x+Math.cos(ang)*rad-.5,y+Math.sin(ang)*rad-.5,1,1);}
  const fl=inBurst?.5+.5*Math.random():.6;
  for(const q of dabs('crkrim',56)){const ang=q.p+t*(.5+q.s*.6),rr2=r+1.3+(q.s-.5)*1.2+(inBurst?(Math.random()-.5)*.8:0);
    g.fillStyle=q.j>.75?'#c8f0ff':q.j>.4?'#a88af0':'#5a2a9a';g.globalAlpha=A0*(.4+.5*q.s)*fl;g.fillRect(x+Math.cos(ang)*rr2-.6,y+Math.sin(ang)*rr2-.6,1.2,1.2);}
  g.globalAlpha=A0;
  for(const q of s.arcs){const k=1-q.m/q.life,P=q.pts,path=()=>{g.beginPath();g.moveTo(x+P[0][0],y+P[0][1]);for(let i=1;i<P.length;i++)g.lineTo(x+P[i][0],y+P[i][1]);if(P.branch){g.moveTo(x+P.branch[0][0],y+P.branch[0][1]);g.lineTo(x+P.branch[1][0],y+P.branch[1][1]);}};
    g.lineCap='round';g.globalAlpha=A0*(q.cyan?.35:.4)*k;g.strokeStyle=q.cyan?'#78dcff':'#aa6eff';g.lineWidth=2.2;path();g.stroke();
    g.globalAlpha=A0*.95*k;g.strokeStyle='#f5ebff';g.lineWidth=.7;path();g.stroke();g.lineCap='butt';}
  g.fillStyle='#fff0dc';for(const q of s.sparks){g.globalAlpha=A0*(1-q.m/q.life);g.fillRect(x+q.x-.5,y+q.y-.5,1,1);}g.globalAlpha=A0;
  g.globalCompositeOperation='source-over';
  const jx=inBurst?(Math.random()-.5)*.8:0,jy=inBurst?(Math.random()-.5)*.8:0;
  g.fillStyle='#000';g.beginPath();for(let k=0;k<=18;k++){const an=k/18*TAU,rr2=r-1+Math.sin(an*4+t*8)*.4;k?g.lineTo(x+jx+Math.cos(an)*rr2,y+jy+Math.sin(an)*rr2):g.moveTo(x+jx+Math.cos(an)*rr2,y+jy+Math.sin(an)*rr2);}g.closePath();g.fill();
  if(s.arcs.length){g.globalAlpha=A0*.35;g.fillStyle='#785ac8';g.beginPath();g.arc(x+jx,y+jy,r*.45,0,TAU);g.fill();g.globalAlpha=A0;g.fillStyle='#000';g.beginPath();g.arc(x+jx+.3,y+jy+.3,r*.3,0,TAU);g.fill();}}
function drawAnomaly(a,x,y){const t=T+(a.ph||0);if(cond&&cond.haz==='electrical')anomCrack(ctx,a,x,y,t);else anomUnstable(ctx,a,x,y,t);}
