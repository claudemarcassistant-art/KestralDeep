// ---------- render helpers ----------
function txt(s,x,y,col,align,size){ctx.font=(size||8)+'px '+FONT;ctx.textAlign=align||'left';ctx.textBaseline='top';
  ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillText(s,x+1,y+1);ctx.fillStyle=col;ctx.fillText(s,x,y);}
function wrap(s,x,y,maxW,lh,col){ctx.font='8px '+FONT;const words=s.split(' ');let line='',yy=y;
  for(const w of words){const t=line?line+' '+w:w;if((ctx.measureText(t).width||0)>maxW&&line){txt(line,x,yy,col);line=w;yy+=lh;}else line=t;}
  if(line){txt(line,x,yy,col);yy+=lh;}return yy;}
function circ(x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,6.2832);ctx.fill();}
function F(c,x,y,w,h){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}
function box(x,y,w,h,fill,edge){F(fill,x,y,w,h);ctx.strokeStyle=edge;ctx.lineWidth=1;ctx.strokeRect(x+0.5,y+0.5,w-1,h-1);}
function ui(x,y,w,h,o){o.x=x;o.y=y;o.w=w;o.h=h;uiRects.push(o);return mouse.sx>=x&&mouse.sx<=x+w&&mouse.sy>=y&&mouse.sy<=y+h;}
const SLOTCOL={shoulders:'#8ab0a0',head:'#8fb6d0',body:'#8a9a7a',hands:'#c9a06a',legs:'#7a86a0',feet:'#a07a5a',back:'#b08a4a',acc:'#c47ad9'};
// drawItem() moved to 50-object-art.js (Batch 5 session 4)
function drawChest(c){const x=Math.round(c.x-camX),y=Math.round(c.y-camY);
  olDraw('chest'+c.tier+(c.opened?1:0),ART_OLC[c.tier==='rare'?'rare':'chest'],x-7,y-9,14,16,()=>chestArt(c,x,y));}
function wade(x,y,r,l){if(l<2)return;const w=Math.sin(T*6+x)*0.7;
  if(l===4){F('rgba(4,22,36,0.9)',x-r-2,y-2,r*2+5,r+5);F('rgba(4,22,36,0.55)',x-r-1,y-r,r*2+3,r-2);}
  else if(l===3){F('rgba(15,50,65,0.82)',x-r-1,y,r*2+3,r+2);}
  ctx.strokeStyle='rgba(170,220,225,0.45)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y+(l===3?0:r-1),r+2+w,2,0,0,6.283);ctx.stroke();}
// drawEnemy() is in 48-creature-art.js (painted creatures, Batch 5 session 2)
const GUNLEN={pistol:7,scatter:9,nailer:8,bolt:10,blower:9};
function drawPlayer(){
  if(player.cloakT>0)ctx.globalAlpha=0.22+0.12*Math.sin(T*9)+(player.cloakT<1.5&&Math.sin(T*20)>0?0.25:0);
  drawPlayerBody();ctx.globalAlpha=1;
  if(player.cloakT>0&&Math.random()<0.4)F('#9fc3ff',Math.round(player.x-camX)+rnd(9)-4,Math.round(player.y-camY)+rnd(9)-4,1,1);
}
// the player: the survey tech drawn by person() (47-sprites.js; pose from playerPose()), holding the weapon drawn by
// drawPlayerWeapon() (called from inside person(), back in screen space, so it sits between the arms and the head);
// the overlays (shield and block arcs, beam dot, muzzle flash, shove, charge ring, swing arc) are drawn on top
function drawPlayerBody(){
  const p=player,x=Math.round(p.x-camX),y=Math.round(p.y-camY),ca=Math.cos(p.ang),sa=Math.sin(p.ang),len=GUNLEN[p.weapon]||4,set=p.arms[p.armSet];
  const o=playerPose();o.prop=g=>{g.save();g.rotate(-p.ang);g.translate(-x,-y);drawPlayerWeapon(x,y,ca,sa,len,set);g.restore();};
  olDraw(p,p.cloakT>0?null:ART_OLC.player,x-14,y-14,28,28,()=>person(ctx,x,y,p.ang,T,spriteLight(p.x,p.y),playerCfg(),o));
  if(p.blocking){const g=p.guardMax?p.guard/p.guardMax:0;ctx.strokeStyle=`rgba(190,228,255,${0.35+0.5*g})`;ctx.lineWidth=set.off==='shield'?3:2;ctx.beginPath();ctx.arc(x,y,8,p.ang-1.1,p.ang+1.1);ctx.stroke();}
  else if(set.off==='shield'){ctx.strokeStyle='#5a666c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,6,p.ang-2.2,p.ang-1.2);ctx.stroke();}
  if(S.beams.some(b=>b.r>170)){F('#d8dcd4',Math.round(x+ca*(len-2)),Math.round(y+sa*(len-2)),1,1);}
  if(p.flashT>0){const fx=x+ca*(len+2),fy=y+sa*(len+2);ctx.fillStyle=p.weapon==='bolt'?'#bfe4ff':'#ffe39a';circ(fx,fy,p.weapon==='nailer'?2:3);ctx.fillStyle='#fff';circ(fx,fy,1.5);}
  if(p.shoveT>0){const m=melee(),tk=p.tackleT>0;ctx.strokeStyle=tk?'rgba(255,200,140,0.85)':'rgba(230,220,190,0.7)';ctx.lineWidth=tk?2:1;ctx.beginPath();ctx.arc(x,y,m.range-3+(tk?5:0),p.ang-m.arc*(tk?0.8:1),p.ang+m.arc*(tk?0.8:1));ctx.stroke();}
  if(p.chg>0){const c=Math.min(1,p.chg),win=p.chgFull>0&&p.chgFull<=0.2,col=win?(Math.sin(T*40)>0?'#ffffff':'#fff0a0'):c>=1?'#e0a040':'#d9a441';ctx.strokeStyle=col;ctx.lineWidth=win?2:1;ctx.beginPath();ctx.arc(x,y,9,-Math.PI/2,-Math.PI/2+6.283*c);ctx.stroke();}
  if(p.swingT>0&&set.main!=='chainsaw'&&set.main!=='whip'){ctx.strokeStyle='rgba(255,240,210,0.8)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,p.swingR-2,p.ang-p.swingA,p.ang+p.swingA);ctx.stroke();}
}
function drawPlayerWeapon(x,y,ca,sa,len,set){const p=player;
  if(p.weapon){ctx.strokeStyle=p.weapon==='bolt'?'#2a3a46':p.weapon==='nailer'?'#3a3320':'#121514';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x+ca*2,y+sa*2);ctx.lineTo(x+ca*len,y+sa*len);ctx.stroke();
    if(p.weapon==='blower'){const j=p.blowing?rr(-0.4,0.4):0;ctx.strokeStyle='#4a5258';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+ca*4+j,y+sa*4+j);ctx.lineTo(x+ca*9+j,y+sa*9+j);ctx.stroke();F('#8a7a40',Math.round(x-sa*3-ca*1)-1,Math.round(y+ca*3-sa*1)-1,3,3);F('#c8ccc4',Math.round(x+ca*9)-1,Math.round(y+sa*9)-1,2,2);}}
  if(set.main==='bow'){const c=Math.min(1,p.chg||0),ox=x+ca*5,oy=y+sa*5,px2=-sa,py2=ca;ctx.strokeStyle='#5a3e22';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ox+px2*6-ca*2,oy+py2*6-sa*2);ctx.quadraticCurveTo(ox+ca*4,oy+sa*4,ox-px2*6-ca*2,oy-py2*6-sa*2);ctx.stroke();
    const pull=c*5;ctx.strokeStyle='#d8dcd4';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ox+px2*6-ca*2,oy+py2*6-sa*2);ctx.lineTo(ox-ca*(2+pull),oy-sa*(2+pull));ctx.lineTo(ox-px2*6-ca*2,oy-py2*6-sa*2);ctx.stroke();
    if(c>0.05||p.aiming){ctx.strokeStyle='#b8c0c4';ctx.beginPath();ctx.moveTo(ox-ca*(2+pull),oy-sa*(2+pull));ctx.lineTo(ox+ca*7,oy+sa*7);ctx.stroke();}}
  else if(set.main==='stungun'){const ox=x-sa*3,oy=y+ca*3,tip=11;ctx.strokeStyle='#2a2e34';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ox+ca*2,oy+sa*2);ctx.lineTo(ox+ca*tip,oy+sa*tip);ctx.stroke();
    for(const s2 of [-1.2,1.2])F('#b8c0c4',Math.round(ox+ca*(tip+2)-sa*s2),Math.round(oy+sa*(tip+2)+ca*s2),1,1);const g=p.zapT>0?0.9:0.35+0.15*Math.sin(T*8);ctx.fillStyle=`rgba(140,190,255,${g})`;circ(ox+ca*(tip+2),oy+sa*(tip+2),p.zapT>0?2.5:1.5);}
  else if(set.main==='spear'){const j=p.jabT>0?Math.sin((1-p.jabT/0.16)*Math.PI)*9:0,ox=x-sa*3,oy=y+ca*3,b0=-7+j,b1=17+j;
    ctx.strokeStyle='#7a5a32';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ox+ca*b0,oy+sa*b0);ctx.lineTo(ox+ca*b1,oy+sa*b1);ctx.stroke();
    ctx.fillStyle='#b8c0c4';ctx.beginPath();ctx.moveTo(ox+ca*(b1+5),oy+sa*(b1+5));ctx.lineTo(ox+ca*b1-sa*1.8,oy+sa*b1+ca*1.8);ctx.lineTo(ox+ca*b1+sa*1.8,oy+sa*b1-ca*1.8);ctx.closePath();ctx.fill();
    if(p.jabT>0.05){ctx.strokeStyle='rgba(255,240,210,0.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ox+ca*(b1+6),oy+sa*(b1+6));ctx.lineTo(ox+ca*(b1+11),oy+sa*(b1+11));ctx.stroke();}}
  else if(set.main==='whip'){const hx=x-sa*3+ca*2,hy=y+ca*3+sa*2;F('#3a2a1a',Math.round(hx)-1,Math.round(hy)-1,2,2);
    if(p.lashT>0){const pr=1-p.lashT/0.24,f=Math.sin(pr*Math.PI),L=6+f*(ARM.whip.melee.range-6),ex=hx+ca*L,ey=hy+sa*L,bend=(1-f)*9*(p.lashS||1)+Math.sin(pr*12)*2;
      const mx=hx+ca*L*0.5-sa*bend,my=hy+sa*L*0.5+ca*bend;ctx.strokeStyle='#5a3e22';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hx,hy);ctx.quadraticCurveTo(mx,my,ex,ey);ctx.stroke();
      if(f>0.85){F('#fff0c0',Math.round(ex),Math.round(ey),1,1);if(Math.random()<0.5)parts.push({x:p.x+(ex-x),y:p.y+(ey-y),vx:rr(-20,20),vy:rr(-20,20),t:0.15,m:0.15,c:'#fff0c0',s:1});}}
    else{ctx.strokeStyle='#5a3e22';ctx.lineWidth=1;ctx.beginPath();ctx.arc(hx+ca*1.5-sa*2,hy+sa*1.5+ca*2,2.2,0,6.283);ctx.stroke();}}
  else if(set.main==='soaker'){const ox=x-sa*3+ca*3,oy=y+ca*3+sa*3;ctx.save();ctx.translate(ox,oy);ctx.rotate(p.ang);F('#e06a2a',-2,-2,8,4);F('#3a8ad0',2,-3,3,2);F('#f0d040',6,-1,4,2);F('#2a2a2a',-1,1,2,3);ctx.restore();}
  else if(set.main==='chainsaw'){const rev=mouse.l&&!p.aiming&&p.hotSel<2&&!menuOpen&&p.inv.cells>0,jx=rev?rr(-0.8,0.8):0,jy=rev?rr(-0.8,0.8):0,ox=x-sa*3+jx,oy=y+ca*3+jy;
    ctx.fillStyle='#b8631e';ctx.save();ctx.translate(ox+ca*4,oy+sa*4);ctx.rotate(p.ang);ctx.fillRect(-2,-2.5,6,5);ctx.fillStyle='#8e978b';ctx.fillRect(4,-1.5,9,3);ctx.fillStyle='#3a403c';for(let k=0;k<4;k++)ctx.fillRect(5+k*2+((rev?Math.floor(T*40):0)%2),-2,1,1);ctx.restore();
    if(rev&&Math.random()<0.12)parts.push({x:p.x+ca*15-sa*3,y:p.y+sa*15+ca*3,vx:ca*rr(20,60)+rr(-30,30),vy:sa*rr(20,60)+rr(-30,30),t:0.25,m:0.25,c:'#ffd070',s:1});}
  else if(set.main){const two=ARM[set.main].hand==='two',a2=p.ang+(p.swingT>0?-0.6+(0.12-p.swingT)*10:two?0:0.7),L2=two?12:set.main==='cutter'?6:9;
    ctx.strokeStyle=set.main==='bat'?'#6a4a2a':'#6a7478';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+Math.cos(a2)*3,y+Math.sin(a2)*3);ctx.lineTo(x+Math.cos(a2)*L2,y+Math.sin(a2)*L2);ctx.stroke();}
}
function circleR(){let r=S.lantern?108:BASE_R;if(cond.light==='lit')r=Math.max(r,170);else if(cond.light==='dark')r=S.lantern?85:22;if(S.nvg)r=Math.max(r,175);if(cond.haz==='fog'&&!hazOff)r=Math.min(r*0.55,100);return r;}
function drawLaser(){
  const p=player,ca=Math.cos(p.ang),sa=Math.sin(p.ang),len=GUNLEN[p.weapon]||4;
  const ox=p.x+ca*len,oy=p.y+sa*len;
  if(!S.laser){const L=Math.max(14,circleR()*0.5),d=castRay(ox,oy,ca,sa,L,false),x0=ox-camX,y0=oy-camY;
    for(let i=0;i<d;i++){const f=1-i/L;if(i%2&&f<0.45)continue;ctx.fillStyle=`rgba(235,240,230,${0.28*f})`;ctx.fillRect(Math.round(x0+ca*i),Math.round(y0+sa*i),1,1);}
    return;}
  let d=castRay(ox,oy,ca,sa,LASER_LEN,false),hitE=false;
  for(const e of enemies){const rx=e.x-ox,ry=e.y-oy,t=rx*ca+ry*sa;if(t<0||t>d)continue;const perp=Math.abs(rx*sa-ry*ca);
    if(perp<e.r){const tt=t-Math.sqrt(e.r*e.r-perp*perp);if(tt<d){d=Math.max(0,tt);hitE=true;}}}
  const x0=ox-camX,y0=oy-camY,steps=Math.floor(d);
  for(let i=0;i<steps;i++){const f=1-i/LASER_LEN;if(i%2&&f<0.5)continue;
    ctx.fillStyle=`rgba(255,40,30,${0.55*f+0.05})`;ctx.fillRect(Math.round(x0+ca*i),Math.round(y0+sa*i),1,1);}
  if(d<LASER_LEN-0.5){const hx=Math.round(x0+ca*d),hy=Math.round(y0+sa*d),fl=0.7+0.3*Math.sin(T*40);
    ctx.fillStyle=`rgba(255,60,40,${fl})`;ctx.fillRect(hx-1,hy,3,1);ctx.fillRect(hx,hy-1,1,3);
    if(hitE){ctx.fillStyle='rgba(255,90,70,0.35)';ctx.fillRect(hx-2,hy-2,5,5);}}
}

