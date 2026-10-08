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
function drawItem(it){
  const x=Math.round(it.x-camX),y=Math.round(it.y-camY-(it.pop>0?Math.sin(it.pop/0.35*Math.PI)*5:0));it.ph+=0.05;
  F('rgba(0,0,0,0.4)',x-3,Math.round(it.y-camY)+2,7,2);
  switch(it.type){
    case 'rounds':F('#8a7431',x-3,y-2,6,4);F('#e0c56a',x-2,y-3,1,2);F('#e0c56a',x,y-3,1,2);F('#e0c56a',x+2,y-3,1,2);break;
    case 'shells':F('#b8493a',x-3,y-2,2,4);F('#b8493a',x,y-2,2,4);F('#d9b45a',x-3,y+1,2,1);F('#d9b45a',x,y+1,2,1);break;
    case 'nails':F('#4d5559',x-3,y-2,6,4);F('#a9b3b8',x-2,y-3,1,1);F('#a9b3b8',x,y-3,1,1);F('#a9b3b8',x+2,y-3,1,1);F('#6c767b',x-3,y-2,6,1);break;
    case 'bolts':F('#8fb6d0',x-4,y,8,1);F('#8fb6d0',x-4,y-2,8,1);F('#e2f0f8',x+4,y,1,1);F('#e2f0f8',x+4,y-2,1,1);break;
    case 'scrap':F('#8e9aa0',x-3,y-1,4,2);F('#8e9aa0',x,y-3,2,3);F('#5b6468',x-1,y+1,3,1);break;
    case 'powder':F('#d2d6cf',x-2,y-3,4,5);F('#8a2d24',x-2,y-1,4,1);break;
    case 'pipe':F('#7a8c93',x-4,y-1,8,2);F('#b4c3c8',x-4,y-1,8,1);break;
    case 'battery':F('#2c3a2f',x-2,y-3,4,6);F('#5fae6e',x-2,y-1,4,1);F(AMBER,x-1,y-4,2,1);break;
    case 'cloth':F('#c9bfa6',x-3,y-2,6,4);F('#a39a82',x-1,y-1,3,1);F('#e2dac4',x-3,y-2,2,1);break;
    case 'medkit':F('#d8dcd4',x-3,y-3,6,5);F('#4f9e5f',x-1,y-2,2,3);F('#4f9e5f',x-2,y-1,4,1);break;
    case 'key':F(AMBER,x-4,y-2,3,3);F('#050607',x-3,y-1,1,1);F(AMBER,x-1,y-1,5,1);F(AMBER,x+2,y,1,2);F(AMBER,x+4,y,1,1);break;
    case 'routechart':F('#15110a',x-4,y-3,9,7);F('#c8d0b8',x-3,y-2,7,5);F('#7fd08e',x-2,y-1,2,1);F('#7fd08e',x,y,2,1);F('#7fd08e',x+2,y+1,1,1);break;
    case 'schematic':F('#3d5a78',x-3,y-3,7,6);F('#9fc3e0',x-2,y-2,5,1);F('#9fc3e0',x-2,y,3,1);F('#9fc3e0',x+1,y-1,1,3);break;
    case 'secretmap':F('#b8a47a',x-3,y-3,7,6);F('#8a7652',x-3,y-3,7,1);F('#b8493a',x-1,y-1,1,1);F('#b8493a',x+1,y+1,1,1);F('#b8493a',x,y,1,1);F('#b8493a',x+1,y-1,1,1);F('#b8493a',x-1,y+1,1,1);break;
    case 'chip':F('#1f4a2e',x-3,y-2,6,5);F('#d9b45a',x-4,y-1,1,1);F('#d9b45a',x-4,y+1,1,1);F('#d9b45a',x+3,y-1,1,1);F('#d9b45a',x+3,y+1,1,1);F('#7fd08e',x-1,y-1,2,2);break;
    case 'herb':F('#1a300e',x-3,y-2,7,5);F('#4a9a3a',x-2,y-2,2,3);F('#6ac04a',x,y-3,2,4);F('#4a9a3a',x+2,y-1,2,2);break;
    case 'cells':F('#0a1a10',x-3,y-2,6,4);F('#8fffa8',x-2,y-1,1,2);F('#8fffa8',x,y-1,1,2);F('#8fffa8',x+2,y-1,1,2);break;
    case 'trauma':case 'regen':case 'mine':case 'surgery':qIcon(it.type,x,y);break;
    case 'flask':case 'charge':case 'flare':case 'stim':case 'antitox':case 'molotov':case 'gasnade':case 'smokenade':case 'cryonade':qIcon(it.type,x,y);break;
    case 'medpatch':F('#d8dcd4',x-3,y-2,6,4);F('#c04040',x-1,y-1,2,2);break;
    case 'tonic':{const c=CORES[SUBS[it.sub].core].col;F('#15110a',x-2,y-4,5,9);F(c,x-1,y-1,3,4);F('#d8dcd4',x-1,y-3,3,1);F('rgba(255,255,255,0.5)',x-1,y-1,1,2);break;}
    case 'sigil':{const c=CORES[it.core].col,g=0.5+0.5*Math.sin(T*4);ctx.globalAlpha=0.35*g;ctx.fillStyle=c;circ(x,y,6);ctx.globalAlpha=1;F(c,x-1,y-4,2,8);F(c,x-4,y-1,8,2);F('#fff',x,y,1,1);break;}
    case 'tool':qIcon(it.tool,x,y);break;
    case 'knives':F('#15110a',x-4,y-1,9,3);F('#c8ccc4',x-3,y,5,1);F('#5a3e22',x+2,y-1,2,3);break;
    case 'file':F('#15110a',x-4,y-3,9,7);F('#c8a868',x-3,y-2,7,5);F('#a88af0',x-3,y-3,3,1);F('#8a7048',x-2,y,5,1);break;
    case 'raw':{const c=RAW[it.raw].col;F('#15110a',x-3,y-2,6,5);F(c,x-2,y-1,4,3);F('rgba(255,255,255,0.35)',x-2,y-1,2,1);break;}
    case 'food':{if(!FOOD[it.food])fixLoot(it);const c=FOOD[it.food].col;F('#15110a',x-3,y-3,7,6);F(c,x-2,y-2,5,4);F('#e8e0c0',x-2,y-2,5,1);break;}
    case 'emetic':F('#15110a',x-2,y-4,5,8);F('#8a9a40',x-1,y-2,3,5);F('#d8d0b0',x-1,y-3,3,1);break;
    case 'liftcard':F('#15110a',x-4,y-3,9,7);F('#d8dcd4',x-3,y-2,7,5);F(AMBER,x-3,y-1,7,1);F('#3a423f',x+1,y+1,2,1);if(Math.sin(T*5)>0)F('#ffffff',x+3,y-2,1,1);break;
    case 'weapon':F('#15110a',x-5,y-2,11,5);F('#4a524f',x-4,y-1,9,2);F('#2a2014',x-2,y+1,2,2);F(AMBER,x+4,y-1,1,1);break;
    case 'gear':{const c=SLOTCOL[GEAR[it.gear].slot];F('#15110a',x-4,y-3,9,7);F('#4a3b24',x-3,y-2,7,5);F(c,x-3,y-1,7,1);F(c,x,y-2,1,5);break;}
  }
  if(Math.sin(it.ph*2)>0.85)F('rgba(255,240,200,0.8)',x+2,y-4,1,1);
}
function drawChest(c){
  const x=Math.round(c.x-camX),y=Math.round(c.y-camY),rare=c.tier==='rare',body=rare?'#4a3e5a':'#5a4526',lid=rare?'#6e5e86':'#7a5f33';
  F('rgba(0,0,0,0.45)',x-5,y+3,11,2);
  if(!c.opened){F('#120e08',x-5,y-4,11,8);F(body,x-4,y-3,9,6);F(lid,x-4,y-3,9,2);F('#1a140c',x-4,y-1,9,1);
    F('#8a8a80',x-4,y-3,1,1);F('#8a8a80',x+4,y-3,1,1);F(rare?'#c9a8ff':AMBER,x,y-1,1,2);}
  else{F('#120e08',x-5,y-6,11,10);F(lid,x-4,y-5,9,2);F(body,x-4,y-2,9,5);F('#0b0805',x-3,y-2,7,2);}
}
function wade(x,y,r,l){if(l<2)return;const w=Math.sin(T*6+x)*0.7;
  if(l===4){F('rgba(4,22,36,0.9)',x-r-2,y-2,r*2+5,r+5);F('rgba(4,22,36,0.55)',x-r-1,y-r,r*2+3,r-2);}
  else if(l===3){F('rgba(15,50,65,0.82)',x-r-1,y,r*2+3,r+2);}
  ctx.strokeStyle='rgba(170,220,225,0.45)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y+(l===3?0:r-1),r+2+w,2,0,0,6.283);ctx.stroke();}
function drawEnemy(e){
  const b=ET[e.type],x=Math.round(e.x-camX),y=Math.round(e.y-camY),col=e.flash>0?'#f2efe6':b.col;
  if(b.warden){const B=BOSSES[e.boss||0],c=B.col,r=e.r+3.5;F('rgba(0,0,0,0.45)',x-r,y+r-2,r*2,3);
    if(B.move==='grab'){ctx.strokeStyle=c;ctx.lineWidth=2;for(let k=0;k<8;k++){const a=k/8*6.283+Math.sin(e.ph+k)*0.3,L=r+5+Math.sin(e.ph*1.5+k*2)*2;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+Math.cos(a+0.4)*L*0.6,y+Math.sin(a+0.4)*L*0.6,x+Math.cos(a)*L,y+Math.sin(a)*L);ctx.stroke();}}
    else{for(let k=0;k<6;k++){const a=k/6*6.283+e.ph*0.2;F('#15110a',Math.round(x+Math.cos(a)*(r+1))-1,Math.round(y+Math.sin(a)*(r+1))-1,3,3);}}
    ctx.fillStyle='#0d0f0e';circ(x,y,r+1);ctx.fillStyle=e.flash>0?'#fff':c;circ(x,y,r);const a=Math.atan2(player.y-e.y,player.x-e.x);for(const sd of [-1,1]){const ex=x+Math.cos(a)*r*0.5-Math.sin(a)*sd*3,ey=y+Math.sin(a)*r*0.5+Math.cos(a)*sd*3;ctx.fillStyle='#ffe070';circ(ex,ey,1.6);}
    if(B.move==='breath'||B.move==='pulse'){F(B.move==='pulse'?'#9fe0ff':'#e8f4ff',x-1,y-r-3,2,2);}
    F('#141817',x-14,y-r-8,28,3);F('#e05040',x-14,y-r-8,Math.round(28*Math.max(0,e.hp)/(e.mhp||80)),3);return;}
  if(b.wasp){const a=e.st==='dash'?Math.atan2(e.vy,e.vx):Math.atan2(player.y-e.y,player.x-e.x),ca=Math.cos(a),sa=Math.sin(a),bob=e.st==='dash'?0:Math.sin(T*9+e.ph)*1.2,yy=y+bob;F('rgba(0,0,0,0.25)',x-2,y+5,5,1);
    ctx.globalAlpha=0.45;ctx.fillStyle='#e8f0ff';const wf=Math.sin(e.wing||0)>0?2.4:1.4;ctx.beginPath();ctx.ellipse(x-sa*1.5,yy-2+ca*0,2,wf,a+1.57,0,6.283);ctx.fill();ctx.beginPath();ctx.ellipse(x+sa*1.5,yy-2,2,wf,a-1.57,0,6.283);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle='#15110a';circ(x,yy,2.6);ctx.fillStyle=col;circ(x-ca*1,yy-sa*1,2);F('#15110a',Math.round(x-ca*1.2),Math.round(yy-sa*1.2),1,1);ctx.fillStyle='#2a2010';circ(x+ca*2,yy+sa*2,1.4);F('#15110a',Math.round(x-ca*3.4),Math.round(yy-sa*3.4),1,1);
    if(e.daze>0){for(let k=0;k<3;k++){const q=T*6+k*2.1;F('#fff0a0',Math.round(x+Math.cos(q)*4),Math.round(yy-5+Math.sin(q)*1.5),1,1);}}
    if(e.st==='wind'&&Math.sin(T*30)>0)F('#ff8a4a',Math.round(x),Math.round(yy-5),1,1);return;}
  if(b.guard){const a=e.look||0,ca=Math.cos(a),sa=Math.sin(a);F('rgba(0,0,0,0.4)',x-4,y+3,8,2);ctx.strokeStyle='#121514';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+ca*2,y+sa*2);ctx.lineTo(x+ca*6,y+sa*6);ctx.stroke();
    ctx.fillStyle='#0d0f0e';circ(x,y,5);ctx.fillStyle=e.flash>0?'#e0e8ff':'#5a7eb0';circ(x,y,4);F('#c8d8f0',Math.round(x+ca*2),Math.round(y+sa*2),1,1);
    if(e.seeT>0.3&&!e.radioed&&!e.called){const k=Math.min(1,e.seeT/3.2);F('#141817',x-5,y-11,10,2);F(k>0.7?'#ff5a4a':'#ffd070',x-5,y-11,Math.round(10*k),2);if(Math.sin(T*12)>0)txt('!',x,y-20,'#ff5a4a','center');}
    if(e.called)F('#5a8ac0',x+3,y-7,2,2);return;}
  if(b.pod){const ca=Math.cos(e.face||0),sa=Math.sin(e.face||0),sw=e.puff>0?1.4:1+0.08*Math.sin(T*3+e.ph);ctx.strokeStyle='#2e5a1e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-ca*5,y-sa*5);ctx.lineTo(x,y);ctx.stroke();
    for(let k=0;k<5;k++){const a=(e.face||0)+(k-2)*0.6;ctx.fillStyle=k%2?'#a85aba':col;ctx.beginPath();ctx.ellipse(x+Math.cos(a)*3*sw,y+Math.sin(a)*3*sw,2.6,1.5,a,0,6.283);ctx.fill();}
    ctx.fillStyle='#3a1a30';circ(x+ca*1.5,y+sa*1.5,1.8*sw);F('#e8d070',Math.round(x+ca*1.5),Math.round(y+sa*1.5),1,1);return;}
  if(b.trip){const ca=Math.cos(e.face||0),sa=Math.sin(e.face||0),L=e.tl||0;ctx.strokeStyle='#1e3a12';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);
    if(e.hold>0){const tx=player.x-camX,ty=player.y-camY;ctx.quadraticCurveTo((x+tx)/2-sa*3,(y+ty)/2+ca*3,tx,ty);}else{for(let k=1;k<=8&&L>0;k++){const t0=k/8*L;ctx.lineTo(x+ca*t0-sa*Math.sin(t0*0.4+T*1.5)*1.2,y+sa*t0+ca*Math.sin(t0*0.4+T*1.5)*1.2);}}ctx.stroke();
    if(!(e.hold>0))for(let t0=8;t0<L;t0+=7)F('#8ab060',Math.round(x+ca*t0-sa*2),Math.round(y+sa*t0+ca*2),1,1);
    ctx.fillStyle='#152a0c';circ(x,y,4.5);ctx.fillStyle=col;circ(x,y,3.6);F('#c04040',Math.round(x+ca*2),Math.round(y+sa*2),1,1);return;}
  if(b.spider){const lg=e.leg||0;F('rgba(0,0,0,0.35)',x-5,y+4,10,2);ctx.strokeStyle='#15131a';ctx.lineWidth=1;ctx.beginPath();
    for(let k=0;k<4;k++)for(const sd of [-1,1]){const a=(k-1.5)*0.45,sw=Math.sin(lg+k*1.3+(sd>0?1.5:0))*1.5,kx=x+sd*(4+Math.cos(a)*2),ky=y+Math.sin(a)*4+sw*0.5;ctx.moveTo(x+sd*2,y+a*2);ctx.lineTo(kx,ky-2);ctx.lineTo(kx+sd*2,ky+2+sw);}ctx.stroke();
    ctx.fillStyle='#08070a';circ(x,y+1,3.6);ctx.fillStyle=col;circ(x,y+1,3);ctx.fillStyle='#08070a';circ(x,y-3,2.2);ctx.fillStyle=col;circ(x,y-3,1.7);F('#e04050',x-1,y-4,1,1);F('#e04050',x+1,y-4,1,1);F('#8a8a9a',x-1,y+1,2,1);return;}
  if(b.frog){const air=e.hop>0?Math.sin(e.hop/0.22*Math.PI)*3:0,fa=e.st==='wind'||e.st==='lash'?e.dir:Math.atan2(e.vy||0.01,e.vx||1),ca=Math.cos(fa),sa=Math.sin(fa);
    F('rgba(0,0,0,0.35)',x-5,y+3,10,2);const yy=y-Math.round(air);ctx.fillStyle='#152a10';ctx.beginPath();ctx.ellipse(x,yy,6,4.5,0,0,6.283);ctx.fill();ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,yy,5,3.6,0,0,6.283);ctx.fill();
    F('#9ac070',x-2,yy+1,4,2);if(e.sac>0||e.st==='wind'){ctx.fillStyle='#d8d070';circ(x+ca*2,yy+2,2+(e.st==='wind'?1:0));}
    for(const sd of [-1,1]){const ex=x+ca*3-sa*sd*2.2,ey=yy+sa*3+ca*sd*2.2-2;ctx.fillStyle='#152a10';circ(ex,ey,1.8);F('#f0e070',Math.round(ex),Math.round(ey),1,1);}
    if(e.st==='lash'&&e.tongue>1){ctx.strokeStyle='#e06a8a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+ca*4,yy+sa*4);const L=e.tongue;ctx.quadraticCurveTo(x+ca*L*0.5-sa*2,yy+sa*L*0.5+ca*2,x+ca*L,yy+sa*L);ctx.stroke();ctx.fillStyle='#f08aa8';circ(x+ca*L,yy+sa*L,1.5);}
    return;}
  if(b.dummy){F('rgba(0,0,0,0.4)',x-5,y+5,11,2);F('#2a2014',x-1,y+3,2,4);F('#15110a',x-5,y-7,11,11);F(col,x-4,y-6,9,9);
    F('#6b5a3a',x-4,y-4,9,1);F('#6b5a3a',x-4,y,9,1);F('#b8493a',x-1,y-3,3,3);F('#e8dcb0',x,y-2,1,1);
    e.log=e.log.filter(q=>T-q.t<3);const tot=e.log.reduce((a,q)=>a+q.d,0);
    txt((tot/3).toFixed(1)+' dps',x,y-18,tot?'#e8dcb0':'#6f7a6a','center');return;}
  const a=Math.atan2(player.y-e.y,player.x-e.x),ca=Math.cos(a),sa=Math.sin(a),bob=Math.sin(e.ph)*0.6;
  F('rgba(0,0,0,0.35)',x-e.r,y+e.r-1,e.r*2,2);
  if(b.snake){
    const s1=e.seg[1],ha=Math.atan2(e.y-s1.y,e.x-s1.x),hc=Math.cos(ha),hs=Math.sin(ha);
    for(let i=e.seg.length-1;i>=1;i--){const q=e.seg[i],sx=Math.round(q.x-camX),sy=Math.round(q.y-camY),r=Math.max(1.1,2.3-i*0.15);
      ctx.fillStyle='#08110f';circ(sx,sy,r+0.8);ctx.fillStyle=e.flash>0?'#f2efe6':(i%2?b.stripe:col);circ(sx,sy,r);
      if(b.pulse&&e.pt<0.7&&Math.random()<0.4)F('#fff8a0',sx+rnd(3)-1,sy+rnd(3)-1,1,1);}
    ctx.fillStyle='#08110f';circ(x,y,e.r+1);ctx.fillStyle=col;circ(x,y,e.r);
    F('#f0e070',Math.round(x+hc*1.5-hs*1.2),Math.round(y+hs*1.5+hc*1.2),1,1);F('#f0e070',Math.round(x+hc*1.5+hs*1.2),Math.round(y+hs*1.5-hc*1.2),1,1);
    if(Math.sin(T*12+e.ph)>0.6)F('#d04050',Math.round(x+hc*4),Math.round(y+hs*4),1,1);
    if(b.pulse&&e.pulseT>0&&!e.portrait){ctx.strokeStyle=`rgba(190,225,255,${e.pulseT*3})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,22,0,6.283);ctx.stroke();
      for(let k=0;k<3;k++){ctx.beginPath();let qx=x,qy=y;ctx.moveTo(qx,qy);for(let j=0;j<4;j++){qx+=rr(-8,8);qy+=rr(-8,8);ctx.lineTo(qx,qy);}ctx.stroke();}
      if(e.pz)for(const i of e.pz){if(Math.random()<0.5)continue;F(Math.random()<.5?'#e0f0ff':'#6fa8ff',(i%MW)*TS-camX+rnd(TS),((i/MW)|0)*TS-camY+rnd(TS),1,1);}}
  }else if(b.ghost){
    const al=e.fleeT>0?0.3:0.6+0.15*Math.sin(T*5+e.ph);ctx.globalAlpha=e.portrait?0.9:al;
    ctx.fillStyle=e.flash>0?'#fff':col;ctx.beginPath();ctx.arc(x,y-2,4.5,Math.PI,0);ctx.lineTo(x+4.5,y+3);
    for(let k=0;k<4;k++){ctx.lineTo(x+4.5-(k+0.5)*2.25,y+3+(k%2?-1.5:1)+Math.sin(T*8+k)*0.6);}ctx.lineTo(x-4.5,y+3);ctx.closePath();ctx.fill();
    F('#1a2030',x-2,y-3,1,2);F('#1a2030',x+1,y-3,1,2);ctx.globalAlpha=1;
  }else if(b.plant){
    ctx.fillStyle='#10200a';circ(x,y,e.r+1.5);for(let k=0;k<6;k++){const a2=k/6*6.283+Math.sin(T*1.5+k)*0.1;ctx.fillStyle=k%2?'#3a6a22':'#4a8a2a';ctx.beginPath();ctx.ellipse(x+Math.cos(a2)*4,y+Math.sin(a2)*3,3.2,1.6,a2,0,6.283);ctx.fill();}
    ctx.fillStyle=e.flash>0?'#fff':'#8a3a4a';circ(x,y,2.8);F('#e8e0c0',x-2,y-1,1,1);F('#e8e0c0',x+1,y-1,1,1);F('#e8e0c0',x-1,y+1,1,1);
    if(e.tip&&e.st!=='sub'&&!e.portrait){const tx2=e.tip.x-camX,ty2=e.tip.y-camY,L=Math.hypot(tx2-x,ty2-y)||1,nx=-(ty2-y)/L,ny=(tx2-x)/L,N=12;let px2=x,py2=y;
      for(let k=1;k<=N;k++){const f=k/N,wob=Math.sin(f*7-T*6)*1.8*(1-f*0.5),qx=x+(tx2-x)*f+nx*wob,qy=y+(ty2-y)*f+ny*wob;
        ctx.strokeStyle='#1a300e';ctx.lineWidth=Math.max(1,3.5-f*2.2)+1;ctx.beginPath();ctx.moveTo(px2,py2);ctx.lineTo(qx,qy);ctx.stroke();
        ctx.strokeStyle=e.flash>0?'#fff':'#5a9a3a';ctx.lineWidth=Math.max(1,3.5-f*2.2);ctx.beginPath();ctx.moveTo(px2,py2);ctx.lineTo(qx,qy);ctx.stroke();
        if(k%3===0)F('#a0d070',Math.round(qx+nx*1.5),Math.round(qy+ny*1.5),1,1);px2=qx;py2=qy;}}
  }else if(b.grasper){
    const out=e.tip&&e.st!=='sub'&&!e.portrait,sub=e.st==='sub'&&!e.portrait;
    if(sub){ctx.fillStyle='rgba(20,0,24,0.45)';ctx.beginPath();ctx.ellipse(x,y,7.5,4.5,0,0,6.283);ctx.fill();
      ctx.strokeStyle='rgba(200,170,220,0.3)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,9+Math.sin(T*3+e.ph),5,0,0,6.283);ctx.stroke();}
    else{ctx.fillStyle='#140a18';ctx.beginPath();ctx.ellipse(x,y,e.r+1.5,e.r,0,0,6.283);ctx.fill();ctx.fillStyle=e.flash>0?'#fff':col;ctx.beginPath();ctx.ellipse(x,y-1,e.r+0.5,e.r-1,0,0,6.283);ctx.fill();
      ctx.fillStyle='#a06ab0';ctx.beginPath();ctx.ellipse(x-1,y-3,3,2,0,0,6.283);ctx.fill();
      F('#f0e070',Math.round(x-3),Math.round(y),2,1);F('#f0e070',Math.round(x+2),Math.round(y),2,1);F('#100008',Math.round(x-2),Math.round(y),1,1);F('#100008',Math.round(x+3),Math.round(y),1,1);
      ctx.strokeStyle='#5a3068';ctx.lineWidth=1;for(let k=0;k<5;k++){const q=k/4*Math.PI+T*2;ctx.beginPath();ctx.moveTo(x+Math.cos(q+Math.PI)*5,y+3);ctx.lineTo(x+Math.cos(q+Math.PI)*8,y+5+Math.sin(T*5+k)*1.5);ctx.stroke();}
      if(!e.portrait){ctx.strokeStyle='rgba(200,170,220,0.4)';ctx.beginPath();ctx.ellipse(x,y+2,e.r+4,3,0,0,6.283);ctx.stroke();}}
    if(out){const tx2=e.tip.x-camX,ty2=e.tip.y-camY,L=Math.hypot(tx2-x,ty2-y)||1,nx=-(ty2-y)/L,ny=(tx2-x)/L,N=12;let px2=x,py2=y;
      for(let k=1;k<=N;k++){const f=k/N,wob=Math.sin(f*9-T*12)*2.2*(1-f*0.5)*(e.st==='hold'?0.5:1),qx=x+(tx2-x)*f+nx*wob,qy=y+(ty2-y)*f+ny*wob;
        ctx.strokeStyle='#2a1030';ctx.lineWidth=Math.max(1,4-f*2.6)+1;ctx.beginPath();ctx.moveTo(px2,py2);ctx.lineTo(qx,qy);ctx.stroke();
        ctx.strokeStyle=e.flash>0?'#fff':'#9a5aa8';ctx.lineWidth=Math.max(1,4-f*2.6);ctx.beginPath();ctx.moveTo(px2,py2);ctx.lineTo(qx,qy);ctx.stroke();
        if(k%2===0)F('#e0b0d0',Math.round(qx+nx),Math.round(qy+ny),1,1);px2=qx;py2=qy;}}
    if(e.st==='aim'&&!e.portrait){const a2=Math.atan2(player.y-e.y,player.x-e.x);ctx.strokeStyle='#9a5aa8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a2)*7+Math.sin(T*20)*1.5,y+Math.sin(a2)*7);ctx.stroke();}
  }else if(b.aquatic){
    if(e.st==='sub'&&!e.portrait){ctx.fillStyle='rgba(0,8,16,0.45)';ctx.beginPath();ctx.ellipse(x,y,7,3.5,a,0,6.283);ctx.fill();
      ctx.strokeStyle='rgba(170,220,225,0.3)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,8+Math.sin(T*4+e.ph),4,a,0,6.283);ctx.stroke();}
    else{const ca2=Math.cos(a),sa2=Math.sin(a);ctx.fillStyle='#0a1a20';ctx.beginPath();ctx.ellipse(x,y,e.r+2,e.r-0.5,a,0,6.283);ctx.fill();
      ctx.fillStyle=e.flash>0?'#fff':col;ctx.beginPath();ctx.ellipse(x,y,e.r+1,e.r-1.5,a,0,6.283);ctx.fill();
      ctx.fillStyle='#3a7a8a';ctx.beginPath();ctx.ellipse(x-ca2*2,y-sa2*2,e.r-1,e.r-3,a,0,6.283);ctx.fill();
      for(const sd of [-1,1])F('#d0f0e0',Math.round(x+ca2*3-sa2*sd*2),Math.round(y+sa2*3+ca2*sd*2),1,1);
      for(let k=-1;k<=1;k++)F('#e8e0d0',Math.round(x+ca2*5-sa2*k*1.5),Math.round(y+sa2*5+ca2*k*1.5),1,1);
      if(!e.portrait){ctx.strokeStyle='rgba(190,230,235,0.45)';ctx.beginPath();ctx.ellipse(x,y+1,e.r+3+Math.sin(T*8)*0.6,3,0,0,6.283);ctx.stroke();}}
  }else if(b.slug||b.snail){
    const hd=Math.atan2(player.y-e.y,player.x-e.x),hc=Math.cos(hd),hs=Math.sin(hd),sq=1+Math.sin(e.ph*0.8)*0.12,hide=b.snail&&e.shellT>0;
    if(!hide){ctx.fillStyle='#10140a';ctx.beginPath();ctx.ellipse(x,y,6.5*sq,4,hd,0,6.283);ctx.fill();
      ctx.fillStyle=e.flash>0?'#fff':(b.snail?'#b0a080':col);ctx.beginPath();ctx.ellipse(x,y,5.5*sq,3,hd,0,6.283);ctx.fill();
      ctx.fillStyle='rgba(255,255,230,0.35)';ctx.fillRect(Math.round(x-hs*1.5),Math.round(y+hc*-1.5),2,1);
      ctx.strokeStyle=b.snail?'#6a5a3a':'#5a6a20';ctx.lineWidth=1;ctx.beginPath();
      for(const sd of [-1,1]){ctx.moveTo(x+hc*4-hs*sd,y+hs*4+hc*sd);ctx.lineTo(x+hc*7-hs*sd*2.5,y+hs*7+hc*sd*2.5);}ctx.stroke();
      for(const sd of [-1,1])F('#e8e0a0',Math.round(x+hc*7-hs*sd*2.5),Math.round(y+hs*7+hc*sd*2.5),1,1);
      if(e.type==='toxslug'&&Math.random()<0.1)parts.push({x:x+camX+rr(-3,3),y:y+camY-2,vx:0,vy:-10,t:0.4,m:0.4,c:'#a0e040',s:1});}
    if(b.snail){const sx=Math.round(x-hc*1.5),sy=Math.round(y-hs*1.5)-1;ctx.fillStyle='#1a140c';circ(sx,sy,4.6);ctx.fillStyle=e.flash>0?'#fff':'#6a5a3a';circ(sx,sy,3.8);
      ctx.strokeStyle='#a89060';ctx.beginPath();ctx.arc(sx,sy,2.4,0.5,5.2);ctx.stroke();F('#c8b080',sx,sy,1,1);F('#8a8a80',sx-3,sy-1,1,1);F('#8a8a80',sx+2,sy+2,1,1);}
  }else if(e.type==='charger'){
    const a2=e.dir!=null&&e.st!=='walk'?e.dir:a,c2=Math.cos(a2),s2=Math.sin(a2),sh=e.st==='wind'?Math.round(rr(-1,1)):0,xx=x+sh;
    ctx.fillStyle='#120a08';circ(xx,y,e.r+1);ctx.fillStyle=col;circ(xx,y,e.r);ctx.fillStyle=e.flash>0?'#fff':'#5a4030';circ(xx-c2*2,y-s2*2,e.r*0.6);
    ctx.fillStyle='#3a2a1a';circ(xx+c2*3,y+s2*3,e.r*0.55);
    F('#d8d0b0',Math.round(xx+c2*5-s2*3),Math.round(y+s2*5+c2*3),2,2);F('#d8d0b0',Math.round(xx+c2*5+s2*3),Math.round(y+s2*5-c2*3),2,2);
    F('#ff6040',Math.round(xx+c2*4-s2*1),Math.round(y+s2*4+c2*1),1,1);F('#ff6040',Math.round(xx+c2*4+s2*1),Math.round(y+s2*4-c2*1),1,1);
    if(e.st==='stun'&&!e.portrait)for(let k=0;k<3;k++){const q=T*6+k*2.1;F('#e8dcb0',Math.round(x+Math.cos(q)*6),Math.round(y-e.r-2+Math.sin(q)*1.5),1,1);}
  }else if(e.type==='drone'){
    const by=Math.round(Math.sin(e.bob||T*5)*1.5),yy=y-4+by;
    ctx.fillStyle='#0c0e0e';circ(x,yy,e.r+1);ctx.fillStyle=e.flash>0?'#fff':col;circ(x,yy,e.r);
    const sp=Math.sin(T*40)>0;F('#aab4b8',x-6,yy-3,sp?4:2,1);F('#aab4b8',x+3,yy-3,sp?4:2,1);F('#aab4b8',x-6,yy+2,sp?2:4,1);F('#aab4b8',x+3,yy+2,sp?2:4,1);
    F(e.beep>0||Math.sin(T*6)>0.8?'#ff3030':'#401010',x,yy-1,1,1);F('#9fd4ff',Math.round(x+Math.cos(a)*2),Math.round(yy+Math.sin(a)*2),1,1);
  }else if(e.type==='crawler'){
    ctx.strokeStyle='#3b2618';ctx.lineWidth=1;ctx.beginPath();
    for(let i=0;i<3;i++){const w=Math.sin(e.ph*2+i)*1.5;ctx.moveTo(x-4,y-2+i*2+w);ctx.lineTo(x+4,y-2+i*2-w);}ctx.stroke();
    ctx.fillStyle='#120c08';circ(x,y,e.r+1);ctx.fillStyle=col;circ(x,y,e.r);
    F('#f3dd8a',x+Math.round(ca*2),y+Math.round(sa*2),1,1);
  }else if(e.type==='brute'){
    F('#140a0d',x-e.r-1,y-e.r-1+bob,e.r*2+2,e.r*2+2);F(col,x-e.r,y-e.r+bob,e.r*2,e.r*2);
    const pc=e.flash>0?'#fff':'#5d2c38';F(pc,x-e.r+2,y-e.r+2+bob,e.r*2-4,3);F(pc,x-e.r+2,y+1+bob,e.r*2-4,2);
    F('#ffb070',x+Math.round(ca*4-sa*2),y+Math.round(sa*4+ca*2+bob),1,1);F('#ffb070',x+Math.round(ca*4+sa*2),y+Math.round(sa*4-ca*2+bob),1,1);
  }else{
    ctx.fillStyle='#0c0f0b';circ(x,y+bob,e.r+1);ctx.fillStyle=col;circ(x,y+bob,e.r);
    if(e.type==='spitter'){ctx.fillStyle=e.flash>0?'#fff':'#9fd4c8';circ(x-ca*2,y-sa*2+bob,2);}
    else{ctx.fillStyle=e.flash>0?'#fff':'#3c4733';circ(x-ca*1.2,y-sa*1.2+bob,e.r*0.45);}
    const ec=e.type==='spitter'?'#e2f2ee':'#e6d27a';
    F(ec,x+Math.round(ca*3-sa*1.5),y+Math.round(sa*3+ca*1.5+bob),1,1);F(ec,x+Math.round(ca*3+sa*1.5),y+Math.round(sa*3-ca*1.5+bob),1,1);
  }
  if(e.carrier&&!e.portrait){F(Math.sin(T*6)>0?AMBER:'#6b5220',x-1,y-e.r-4,3,2);}
  if(e.friendT>0&&!e.portrait){F('#9fe0b0',Math.round(x)-1,Math.round(y-e.r-4),3,1);F('#9fe0b0',Math.round(x),Math.round(y-e.r-5),1,3);}
  if(e.stun>0&&!e.portrait){for(let k=0;k<3;k++){const a=T*6+k*2.1;F('#e8dcb0',Math.round(x+Math.cos(a)*5),Math.round(y-e.r-2+Math.sin(a)*1.5),1,1);}}
  if(!e.portrait&&!b.aquatic)wade(x,y,e.r,liqAt(e.x,e.y));
}
const GUNLEN={pistol:7,scatter:9,nailer:8,bolt:10};
function drawPlayer(){
  if(player.cloakT>0)ctx.globalAlpha=0.22+0.12*Math.sin(T*9)+(player.cloakT<1.5&&Math.sin(T*20)>0?0.25:0);
  drawPlayerBody();ctx.globalAlpha=1;
  if(player.cloakT>0&&Math.random()<0.4)F('#9fc3ff',Math.round(player.x-camX)+rnd(9)-4,Math.round(player.y-camY)+rnd(9)-4,1,1);
}
function drawPlayerBody(){
  const p=player,x=Math.round(p.x-camX),y=Math.round(p.y-camY),ca=Math.cos(p.ang),sa=Math.sin(p.ang),len=GUNLEN[p.weapon]||4,set=p.arms[p.armSet];
  F('rgba(0,0,0,0.4)',x-4,y+3,8,2);
  if(p.weapon){ctx.strokeStyle=p.weapon==='bolt'?'#2a3a46':p.weapon==='nailer'?'#3a3320':'#121514';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x+ca*2,y+sa*2);ctx.lineTo(x+ca*len,y+sa*len);ctx.stroke();}
  if(set.main==='bow'){const c=Math.min(1,p.chg||0),ox=x+ca*5,oy=y+sa*5,px2=-sa,py2=ca;ctx.strokeStyle='#5a3e22';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ox+px2*6-ca*2,oy+py2*6-sa*2);ctx.quadraticCurveTo(ox+ca*4,oy+sa*4,ox-px2*6-ca*2,oy-py2*6-sa*2);ctx.stroke();
    const pull=c*5;ctx.strokeStyle='#d8dcd4';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ox+px2*6-ca*2,oy+py2*6-sa*2);ctx.lineTo(ox-ca*(2+pull),oy-sa*(2+pull));ctx.lineTo(ox-px2*6-ca*2,oy-py2*6-sa*2);ctx.stroke();
    if(c>0.05||p.aiming){ctx.strokeStyle='#b8c0c4';ctx.beginPath();ctx.moveTo(ox-ca*(2+pull),oy-sa*(2+pull));ctx.lineTo(ox+ca*7,oy+sa*7);ctx.stroke();}}
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
  if(p.blocking){const g=p.guardMax?p.guard/p.guardMax:0;ctx.strokeStyle=`rgba(190,228,255,${0.35+0.5*g})`;ctx.lineWidth=set.off==='shield'?3:2;ctx.beginPath();ctx.arc(x,y,8,p.ang-1.1,p.ang+1.1);ctx.stroke();}
  else if(set.off==='shield'){ctx.strokeStyle='#5a666c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,6,p.ang-2.2,p.ang-1.2);ctx.stroke();}
  if(S.beams.some(b=>b.r>170)){F('#d8dcd4',Math.round(x+ca*(len-2)),Math.round(y+sa*(len-2)),1,1);}
  ctx.fillStyle='#0d0f0e';circ(x,y,5);ctx.fillStyle=p.hurtT>0.2?'#e0a090':p.adrenT>0?'#b0a070':'#8b8468';circ(x,y,4);
  ctx.fillStyle=player.gear.head==='nvg'?'#4a6a4a':'#c9c1a0';circ(x+ca*0.8,y+sa*0.8,2.4);
  F(player.gear.head==='nvg'?'#7fff8a':AMBER,Math.round(x+ca*2),Math.round(y+sa*2),1,1);
  if(p.flashT>0){const fx=x+ca*(len+2),fy=y+sa*(len+2);ctx.fillStyle=p.weapon==='bolt'?'#bfe4ff':'#ffe39a';circ(fx,fy,p.weapon==='nailer'?2:3);ctx.fillStyle='#fff';circ(fx,fy,1.5);}
  if(p.shoveT>0){const m=melee(),tk=p.tackleT>0;ctx.strokeStyle=tk?'rgba(255,200,140,0.85)':'rgba(230,220,190,0.7)';ctx.lineWidth=tk?2:1;ctx.beginPath();ctx.arc(x,y,m.range-3+(tk?5:0),p.ang-m.arc*(tk?0.8:1),p.ang+m.arc*(tk?0.8:1));ctx.stroke();}
  if(p.chg>0){const c=Math.min(1,p.chg),win=p.chgFull>0&&p.chgFull<=0.2,col=win?(Math.sin(T*40)>0?'#ffffff':'#fff0a0'):c>=1?'#e0a040':'#d9a441';ctx.strokeStyle=col;ctx.lineWidth=win?2:1;ctx.beginPath();ctx.arc(x,y,9,-Math.PI/2,-Math.PI/2+6.283*c);ctx.stroke();}
  if(p.swingT>0&&set.main!=='chainsaw'&&set.main!=='whip'){ctx.strokeStyle='rgba(255,240,210,0.8)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,p.swingR-2,p.ang-p.swingA,p.ang+p.swingA);ctx.stroke();}
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

