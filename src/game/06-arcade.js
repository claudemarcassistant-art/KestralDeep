// ---------- arcade cabinets (all original games)
const FW=160,FH=120;
const ARC={
 rift:{name:'Rift Runner',col:'#5af0ff',goal:'Survive 20 seconds. Grab gold shards for score. When a lane blinks red, a rift beam is coming: it wipes that lane clean, and you with it.',help:'A D switch lanes',
  init:a=>{a.lane=2;a.obs=[];a.toks=[];a.spawnT=0.8;a.time=0;a.tok=0;a.score=0;a.beam=null;a.beamAt=[rr(4,7),rr(10,13),rr(15.5,17.5)];},
  update:(a,dt)=>{a.time+=dt;a.spawnT-=dt;const spd=60+a.time*4;for(const o of a.obs)o.y+=spd*dt;for(const t of a.toks)t.y+=spd*dt;
    if(a.spawnT<=0){a.spawnT=Math.max(0.3,0.75-a.time*0.02);const free=[0,1,2,3,4];const n=1+(a.time>8&&Math.random()<0.4?1:0),used=[];for(let k=0;k<n;k++){const l=free.splice(rnd(free.length),1)[0];used.push(l);a.obs.push({l,y:-8,c:Math.random()<.5?'#ff5aa8':'#5af0ff'});}
      if(Math.random()<0.45){const risky=Math.random()<0.6;let l;if(risky){const u=used[rnd(used.length)];l=u+(Math.random()<0.5?-1:1);}else l=free[rnd(free.length)];if(l>=0&&l<5&&!used.includes(l))a.toks.push({l,y:risky?-14:-8});}}
    if(a.beamAt.length&&a.time>=a.beamAt[0]){a.beamAt.shift();a.beam={l:rnd(5),t:1.3,fire:0};sfx('alarm');}
    if(a.beam){const bm=a.beam;if(bm.t>0){bm.t-=dt;if(bm.t<=0){bm.fire=0.55;sfx('zap');a.obs=a.obs.filter(o=>o.l!==bm.l);a.toks=a.toks.filter(t=>t.l!==bm.l);}}
      else{bm.fire-=dt;if(a.lane===bm.l)return arcLose(a,'caught in the rift beam at '+a.time.toFixed(1)+'s');if(bm.fire<=0)a.beam=null;}}
    for(const t of a.toks)if(!t.got&&t.l===a.lane&&t.y>98&&t.y<116){t.got=true;a.tok++;a.score+=100;sfx('pick');}
    for(const o of a.obs)if(o.l===a.lane&&o.y>100&&o.y<114)return arcLose(a,'crashed at '+a.time.toFixed(1)+'s with '+a.tok+' shards');
    a.obs=a.obs.filter(o=>o.y<130);a.toks=a.toks.filter(t=>t.y<130&&!t.got);if(a.time>=20){a.bonus=Math.floor(a.tok/3);arcWin(a);}},
  key:(a,c)=>{if(c==='KeyA'||c==='ArrowLeft')a.lane=Math.max(0,a.lane-1);if(c==='KeyD'||c==='ArrowRight')a.lane=Math.min(4,a.lane+1);},
  draw:(a,gx,gy)=>{const lw=32;F('#0a0818',gx,gy,FW,FH);for(let l=1;l<5;l++)for(let yy=0;yy<FH;yy+=6)F('#2a1a4a',gx+l*lw,gy+yy+((a.time*40|0)%6),1,3);
    if(a.beam){const bm=a.beam,bx=gx+bm.l*lw;if(bm.t>0){if(Math.sin(T*(bm.t<0.5?40:18))>0)F('rgba(255,60,60,0.28)',bx,gy,lw,FH);F('#ff5a5a',bx,gy,1,FH);F('#ff5a5a',bx+lw-1,gy,1,FH);}
      else{F('rgba(255,90,90,0.55)',bx+4,gy,lw-8,FH);F('#fff0f0',bx+lw/2-2,gy,4,FH);}}
    for(const o of a.obs)if(o.y>-8&&o.y<FH)F(o.c,gx+o.l*lw+6,gy+Math.max(0,o.y),lw-12,6);
    for(const t of a.toks)if(t.y>-6&&t.y<FH){const x=gx+t.l*lw+lw/2,y=gy+t.y+3;ctx.fillStyle=Math.sin(T*12)>0?'#ffe070':'#c89a30';ctx.beginPath();ctx.moveTo(x,y-4);ctx.lineTo(x+3,y);ctx.lineTo(x,y+4);ctx.lineTo(x-3,y);ctx.closePath();ctx.fill();}
    const sx=gx+a.lane*lw+lw/2,sy=gy+110;ctx.fillStyle=a.over&&!a.win?'#ff5a5a':'#e8e0a0';ctx.beginPath();ctx.moveTo(sx,sy-6);ctx.lineTo(sx+6,sy+5);ctx.lineTo(sx-6,sy+5);ctx.closePath();ctx.fill();
    txt(a.time.toFixed(1)+'s',gx+FW-4,gy+3,'#e8e0a0','right');txt('score '+a.score,gx+4,gy+3,'#ffe070');}},
 moonrake:{name:'Moonrake',col:'#e8d070',goal:'Touch down on the lit pads in order. Knock rivals out from above.',help:'W thrust  A D drift',
  init:a=>{a.x=80;a.y=16;a.vx=0;a.vy=0;a.fuel=100;a.pad=0;a.pads=[{x:14,y:104,w:24},{x:118,y:74,w:24},{x:60,y:44,w:24}];a.riv=[{x:30,y:34,vx:26},{x:130,y:62,vx:-22}];a.thr=false;},
  update:(a,dt)=>{const up=(K.KeyW||K.ArrowUp||K.Space)&&a.fuel>0;a.thr=up;if(up){a.vy-=95*dt;a.fuel-=11*dt;}
    if(K.KeyA||K.ArrowLeft){a.vx-=55*dt;a.fuel-=3*dt;}if(K.KeyD||K.ArrowRight){a.vx+=55*dt;a.fuel-=3*dt;}
    a.vy+=42*dt;a.vx*=Math.pow(0.7,dt);const py=a.y;a.x=(a.x+a.vx*dt+FW)%FW;a.y+=a.vy*dt;if(a.y<4){a.y=4;a.vy=0;}
    for(let i=0;i<a.pads.length;i++){const pd=a.pads[i];if(a.vy>0&&py+4<=pd.y&&a.y+4>=pd.y&&a.x>pd.x&&a.x<pd.x+pd.w){if(a.vy>42)return arcLose(a,'came in too hot');a.y=pd.y-4;a.vy=0;a.vx*=0.5;if(i===a.pad){a.pad++;sfx('hackok');if(a.pad>=3)return arcWin(a);}}}
    if(a.y>112)return arcLose(a,'hit the regolith');
    for(const r of a.riv){if(r.dead)continue;r.x+=r.vx*dt;if(r.x<6||r.x>FW-6)r.vx*=-1;r.y+=Math.sin(T*2+r.x*0.05)*12*dt;
      if(Math.hypot(r.x-a.x,r.y-a.y)<8){if(a.y<r.y-2){r.dead=true;a.vy=-40;sfx('thud');}else return arcLose(a,'a rival came down on you');}}},
  draw:(a,gx,gy)=>{F('#05050c',gx,gy,FW,FH);for(let k=0;k<20;k++)F('#3a3a5a',gx+(k*37)%FW,gy+(k*53)%90,1,1);F('#3a3a4a',gx,gy+116,FW,4);
    a.pads.forEach((pd,i)=>F(i<a.pad?'#5fae6e':i===a.pad?(Math.sin(T*6)>0?AMBER:'#6b5220'):'#4a4a5a',gx+pd.x,gy+pd.y,pd.w,2));
    for(const r of a.riv)if(!r.dead){F('#c04040',gx+r.x-3,gy+r.y-2,6,4);F('#ff8080',gx+r.x-6+Math.round(Math.sin(T*12)),gy+r.y-3,3,1);F('#ff8080',gx+r.x+3,gy+r.y-3,3,1);}
    const x=gx+a.x,y=gy+a.y;ctx.fillStyle='#e8e0a0';ctx.beginPath();ctx.moveTo(x,y-5);ctx.lineTo(x+4,y+4);ctx.lineTo(x-4,y+4);ctx.closePath();ctx.fill();if(a.thr&&Math.random()<0.8)F('#ffb050',x-1,y+4,2,3);
    F('#141414',gx+4,gy+4,40,3);F(a.fuel>25?'#e8d070':'#c04040',gx+4,gy+4,Math.round(40*Math.max(0,a.fuel)/100),3);txt('pad '+a.pad+'/3',gx+FW-4,gy+3,'#e8d070','right');}},
 crossline:{name:'Crossline',col:'#7fd0e0',goal:'Guide the maintenance bot across the reactor floor three times. Dodge sweeper drones, time the pulse beams, and grab data chips for score.',help:'W A S D step',
  init:a=>{a.c=5;a.r=7;a.cross=0;a.lives=3;a.time=0;a.chips=0;a.score=0;
    a.drones={6:{v:34,objs:[0,60,120]},5:{v:-50,objs:[20,95]},4:{v:66,objs:[10,90]}};a.beams={2:{t:0,on:false,gap:3},1:{t:0.9,on:false,gap:6}};ARC.crossline.chipsNew(a);},
  chipsNew:a=>{a.chipL=[];for(let k=0;k<3;k++){const r=1+rnd(6);if(r===3){k--;continue;}a.chipL.push({c:rnd(10),r});}},
  update:(a,dt)=>{a.time+=dt;for(const r in a.drones){const L=a.drones[r];L.objs=L.objs.map(x=>((x+L.v*dt)%(FW+16)+FW+16)%(FW+16));}
    for(const r in a.beams){const B=a.beams[r];B.t-=dt;if(B.t<=0){B.on=!B.on;B.t=B.on?1.1:0.9;if(!B.on)B.gap=rnd(9);}}
    const L=a.drones[a.r];if(L&&L.objs.some(ox=>{const dc=(ox-8)/16;return Math.abs(dc-a.c)<0.8;}))return arcHit(a,'caught by a sweeper');
    const B=a.beams[a.r];if(B&&B.on&&!(a.c===B.gap||a.c===B.gap+1))return arcHit(a,'burned by a pulse beam');
    if(a.time>75)return arcLose(a,'the reactor vents. out of time');},
  key:(a,c)=>{if(c==='KeyW'||c==='ArrowUp')a.r--;else if(c==='KeyS'||c==='ArrowDown')a.r=Math.min(7,a.r+1);else if(c==='KeyA'||c==='ArrowLeft')a.c=Math.max(0,a.c-1);else if(c==='KeyD'||c==='ArrowRight')a.c=Math.min(9,a.c+1);else return;sfx('click');
    const ch=a.chipL.findIndex(q=>q.c===a.c&&q.r===a.r);if(ch>=0){a.chipL.splice(ch,1);a.chips++;a.score+=150;sfx('pick');}
    if(a.r<=0){a.cross++;a.score+=300;sfx('hackok');a.r=7;a.c=5;ARC.crossline.chipsNew(a);if(a.cross>=3){a.bonus=Math.floor(a.chips/2);arcWin(a);}}},
  draw:(a,gx,gy)=>{const rh=15;for(let r=0;r<8;r++){const c=r===0?'#16303a':r===3||r===7?'#1c2226':'#101418';F(c,gx,gy+r*rh,FW,rh);for(let x=0;x<FW;x+=16)F('#181e22',gx+x,gy+r*rh,1,rh);F('#0a0d0f',gx,gy+r*rh+rh-1,FW,1);}
    F('#7fd0e0',gx,gy+rh-2,FW,1);F('#7fd0e0',gx+FW/2-8,gy+5,16,1);
    for(const r in a.beams){const B=a.beams[r],y=gy+r*rh+7;const warn=!B.on&&B.t<0.25;for(let c=0;c<10;c++){if(c===B.gap||c===B.gap+1){F('#1e4a50',gx+c*16+6,y,4,1);continue;}
        if(B.on){F('#5af0ff',gx+c*16,y-1,16,3);F('#e0ffff',gx+c*16,y,16,1);}else F(warn&&Math.sin(T*30)>0?'#5af0ff':'#1e4a50',gx+c*16,y,16,1);}
      F('#8e978b',gx,y-3,3,7);F('#8e978b',gx+FW-3,y-3,3,7);}
    for(const r in a.drones){const L=a.drones[r];for(const ox of L.objs){const x=gx+ox-8+8,y=gy+r*rh+7;ctx.globalAlpha=0.18;ctx.fillStyle='#ff5a5a';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(L.v>0?14:-14),y-5);ctx.lineTo(x+(L.v>0?14:-14),y+5);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
      ctx.fillStyle='#6a7078';circ(x,y,5);ctx.fillStyle='#3a4046';circ(x,y,3);F(Math.sin(T*10)>0?'#ff5a5a':'#a02020',x+(L.v>0?1:-2),y-1,2,2);}}
    for(const q of a.chipL){const x=gx+q.c*16+5,y=gy+q.r*rh+4;F(Math.sin(T*6+q.c)>0?'#7fd08e':'#4a8a5a',x,y,6,6);F('#0a1a10',x+2,y+2,2,2);}
    const x=gx+a.c*16+3,y=gy+a.r*rh+3;F('#c8b030',x,y,10,9);F('#15110a',x+2,y+2,6,3);F('#7fd0e0',x+3,y+3,4,1);F('#3a403c',x+1,y+9,3,1);F('#3a403c',x+6,y+9,3,1);
    txt('x'+a.cross+'/3  lives '+a.lives,gx+FW-4,gy+4,'#e8e0a0','right');txt('score '+a.score,gx+4,gy+4,'#7fd08e');}},
 obelisk:{name:'Obelisk',col:'#c04040',goal:'Open every quiet cell. Do not open what is watching.',help:'W A S D move  R open  F mark',
  init:a=>{a.cw=8;a.ch=6;a.cx=0;a.cy=0;a.cells=[];for(let i=0;i<48;i++)a.cells.push({v:false,o:false,m:false,n:0});let k=0;while(k<9){const i=rnd(48);if(!a.cells[i].v&&i!==0){a.cells[i].v=true;k++;}}
    for(let i=0;i<48;i++){const x=i%8,y=(i/8)|0;let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<8&&Y<6&&a.cells[Y*8+X].v)n++;}a.cells[i].n=n;}a.whisper=0;},
  update:(a,dt)=>{a.whisper+=dt;},
  open:(a,x,y)=>{const c=a.cells[y*8+x];if(c.o||c.m)return;if(c.v){c.o=true;player.hp=Math.max(1,player.hp-3);return arcLose(a,'IT SAW YOU');}
    const q=[[x,y]];while(q.length){const [X,Y]=q.pop(),cc=a.cells[Y*8+X];if(cc.o)continue;cc.o=true;if(cc.n===0)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X2=X+dx,Y2=Y+dy;if(X2>=0&&Y2>=0&&X2<8&&Y2<6&&!a.cells[Y2*8+X2].o&&!a.cells[Y2*8+X2].v)q.push([X2,Y2]);}}
    sfx('click');if(a.cells.every(cc=>cc.v||cc.o)){player.st.rad=Math.min(100,player.st.rad+10);arcWin(a);a.msg+='. you feel watched';}},
  key:(a,c)=>{if(c==='KeyW'||c==='ArrowUp')a.cy=Math.max(0,a.cy-1);if(c==='KeyS'||c==='ArrowDown')a.cy=Math.min(5,a.cy+1);if(c==='KeyA'||c==='ArrowLeft')a.cx=Math.max(0,a.cx-1);if(c==='KeyD'||c==='ArrowRight')a.cx=Math.min(7,a.cx+1);
    if(c==='KeyR'||c==='Enter'||c==='Space')ARC.obelisk.open(a,a.cx,a.cy);if(c==='KeyF'){const cc=a.cells[a.cy*8+a.cx];if(!cc.o)cc.m=!cc.m;}},
  click:(a,mx,my)=>{const x=Math.floor((mx-8)/18),y=Math.floor((my-4)/18);if(x>=0&&y>=0&&x<8&&y<6){a.cx=x;a.cy=y;ARC.obelisk.open(a,x,y);}},
  draw:(a,gx,gy)=>{F('#040204',gx,gy,FW,FH);const W2=['DO NOT LOOK AWAY','THE COUNT IS WRONG','IT REMEMBERS YOU','NINE ARE WATCHING','YOU HAVE PLAYED BEFORE'];
    for(let i=0;i<48;i++){const x=i%8,y=(i/8)|0,c=a.cells[i],px=gx+8+x*18,py=gy+4+y*18,sel=x===a.cx&&y===a.cy;
      F(c.o?(c.v?'#6a0a0a':'#140a0c'):'#2a1016',px,py,16,16);if(sel)ctx.strokeStyle=Math.sin(T*8)>0?'#ff6060':'#801010',ctx.lineWidth=1,ctx.strokeRect(px+0.5,py+0.5,15,15);
      if(c.m&&!c.o){F('#c04040',px+7,py+4,2,8);F('#c04040',px+5,py+4,6,2);}
      if(c.o&&c.v){ctx.fillStyle='#ffdddd';circ(px+8,py+8,4);ctx.fillStyle='#200';circ(px+8,py+8,2);}
      else if(c.o&&c.n>0){ctx.strokeStyle='#d06060';ctx.beginPath();for(let k=0;k<c.n;k++){const an=k/c.n*6.283-1.57;ctx.moveTo(px+8,py+8);ctx.lineTo(px+8+Math.cos(an)*5,py+8+Math.sin(an)*5);}ctx.stroke();}}
    if(Math.random()<0.08)F('rgba(255,60,60,0.25)',gx,gy+rnd(FH),FW,1);
    if(Math.sin(a.whisper*0.9)>0.6)txt(W2[Math.floor(a.whisper/7)%W2.length],gx+FW/2,gy+FH-9,'rgba(200,60,60,0.7)','center');}},
 pyrite:{name:'Pyrite Steps',col:'#e0a030',goal:'Collect 8 pyrite crystals. Every tile you leave crumbles for a while, and an ember hunts you across the pillars.',help:'W A S D step',
  init:a=>{a.N=7;a.tiles=[];for(let i=0;i<49;i++)a.tiles.push({st:0,t:0,h:(i*7+(i/7|0)*3)%3});a.x=3;a.y=3;a.lives=3;a.got=0;a.time=0;a.em={x:0,y:0,t:1.2};a.crys=[];for(let k=0;k<2;k++)ARC.pyrite.newCrys(a);},
  idx:(x,y)=>y*7+x,
  newCrys:a=>{for(let t=0;t<40;t++){const x=rnd(7),y=rnd(7);if((x===a.x&&y===a.y)||a.tiles[y*7+x].st===2||a.crys.some(c=>c.x===x&&c.y===y))continue;a.crys.push({x,y});return;}},
  pos:(x,y,h)=>[80+(x-y)*11,24+(x+y)*6-(h||0)*2],
  update:(a,dt)=>{a.time+=dt;for(const t of a.tiles){if(t.st===1){t.t-=dt;if(t.t<=0){t.st=2;t.t=6;}}else if(t.st===2){t.t-=dt;if(t.t<=0){t.st=0;}}}
    const e=a.em;e.t-=dt;if(e.t<=0){e.t=Math.max(0.35,0.6-a.time*0.004);const opts=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>[e.x+dx,e.y+dy]).filter(([x,y])=>x>=0&&y>=0&&x<7&&y<7&&a.tiles[y*7+x].st!==2);
      if(opts.length){opts.sort((p,q)=>Math.abs(p[0]-a.x)+Math.abs(p[1]-a.y)-(Math.abs(q[0]-a.x)+Math.abs(q[1]-a.y))+(Math.random()-0.5)*0.8);[e.x,e.y]=opts[0];}}
    if(e.x===a.x&&e.y===a.y){a.em={x:a.x<3?6:0,y:a.y<3?6:0,t:1.2};return arcHit(a,'the ember caught you');}
    if(a.time>70)arcLose(a,'the lights went out. '+a.got+' crystals');},
  key:(a,c)=>{let nx=a.x,ny=a.y;if(c==='KeyW'||c==='ArrowUp')ny--;else if(c==='KeyS'||c==='ArrowDown')ny++;else if(c==='KeyA'||c==='ArrowLeft')nx--;else if(c==='KeyD'||c==='ArrowRight')nx++;else return;
    if(nx<0||ny<0||nx>=7||ny>=7||a.tiles[ny*7+nx].st===2){sfx('click');return;}const old=a.tiles[a.y*7+a.x];old.st=1;old.t=1.4;a.x=nx;a.y=ny;sfx('click');
    const ci=a.crys.findIndex(q=>q.x===nx&&q.y===ny);if(ci>=0){a.crys.splice(ci,1);a.got++;sfx('pick');if(a.got>=8){a.bonus=a.time<40?2:a.time<55?1:0;return arcWin(a);}ARC.pyrite.newCrys(a);}},
  draw:(a,gx,gy)=>{F('#0a0610',gx,gy,FW,FH);const P=ARC.pyrite.pos;
    for(let s2=0;s2<13;s2++)for(let y=0;y<7;y++){const x=s2-y;if(x<0||x>=7)continue;const t=a.tiles[y*7+x];if(t.st===2)continue;const [cx,cy]=P(x,y,t.h),X=gx+cx,Y=gy+cy,shake=t.st===1?rr(-0.6,0.6):0,dep=4+t.h*2;
      ctx.fillStyle=(x+y)%2?'#2a1e3a':'#261b35';ctx.beginPath();ctx.moveTo(X-11+shake,Y);ctx.lineTo(X+shake,Y+6);ctx.lineTo(X+shake,Y+6+dep);ctx.lineTo(X-11+shake,Y+dep);ctx.closePath();ctx.fill();
      ctx.fillStyle='#1a1428';ctx.beginPath();ctx.moveTo(X+11+shake,Y);ctx.lineTo(X+shake,Y+6);ctx.lineTo(X+shake,Y+6+dep);ctx.lineTo(X+11+shake,Y+dep);ctx.closePath();ctx.fill();
      ctx.fillStyle=t.st===1?'#6a4a2a':((x+y)%2?'#4a4060':'#40375a');ctx.beginPath();ctx.moveTo(X+shake,Y-6);ctx.lineTo(X+11+shake,Y);ctx.lineTo(X+shake,Y+6);ctx.lineTo(X-11+shake,Y);ctx.closePath();ctx.fill();
      if(t.st===1){F('#15110a',X-3+shake,Y-1,6,1);F('#15110a',X+shake,Y-3,1,5);}
      if(a.crys.some(q=>q.x===x&&q.y===y)){F('#e0a030',X-1,Y-6,3,5);F('#fff0a0',X,Y-6,1,2);}
      if(a.x===x&&a.y===y){ctx.fillStyle='#c8e0d0';circ(X,Y-5,3.5);F('#1a2a20',X,Y-6,2,1);}
      if(a.em.x===x&&a.em.y===y){ctx.globalAlpha=0.4;ctx.fillStyle='#ff5a2a';circ(X,Y-5,6);ctx.globalAlpha=1;ctx.fillStyle='#ffb050';circ(X,Y-5,2.5+Math.sin(T*14));}}
    txt('crystals '+a.got+'/8  lives '+a.lives,gx+FW-4,gy+FH-9,'#e0a030','right');txt(Math.max(0,70-a.time).toFixed(0)+'s',gx+4,gy+FH-9,'#8e978b');}},
 brickfall:{name:'Brickfall',col:'#ff8a5a',goal:'Clear 6 lines. The ball chews your stack.',help:'A D move  W rotate  S drop faster  SPACE slam',
  init:a=>{a.cw=10;a.chh=14;a.grid=Array.from({length:14},()=>Array(10).fill(0));a.lines=0;a.dropT=0;a.ball={x:40,y:30,vx:34,vy:26};arcNewPiece(a);},
  update:(a,dt)=>{a.dropT-=dt*(K.KeyS||K.ArrowDown?6:1);if(a.dropT<=0){a.dropT=Math.max(0.2,0.55-a.lines*0.04);if(!arcMove(a,0,1))arcLock(a);}if(a.over)return;
    const b=a.ball;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<2||b.x>78){b.vx*=-1;b.x=Math.max(2,Math.min(78,b.x));}if(b.y<2||b.y>110){b.vy*=-1;b.y=Math.max(2,Math.min(110,b.y));}
    const cx=Math.floor(b.x/8),cy=Math.floor(b.y/8);if(cy>=0&&cy<14&&cx>=0&&cx<10){if(a.grid[cy][cx]){a.grid[cy][cx]=0;b.vy*=-1;sfx('hit');}
      else if(arcCells(a).some(([x,y])=>x===cx&&y===cy)){b.vy*=-1;b.vx*=-1;}}},
  key:(a,c)=>{if(c==='KeyA'||c==='ArrowLeft')arcMove(a,-1,0);if(c==='KeyD'||c==='ArrowRight')arcMove(a,1,0);if(c==='KeyW'||c==='ArrowUp'){const old=a.rot;a.rot=(a.rot+1)%4;if(!arcFits(a,a.px,a.py))a.rot=old;}
    if(c==='Space'){while(arcMove(a,0,1));arcLock(a);}},
  draw:(a,gx,gy)=>{const ox=gx+40,oy=gy+4;F('#0a0a14',gx,gy,FW,FH);F('#1a1a2a',ox-1,oy-1,82,114);F('#05050a',ox,oy,80,112);
    for(let y=0;y<14;y++)for(let x=0;x<10;x++)if(a.grid[y][x]){F(a.grid[y][x],ox+x*8,oy+y*8,7,7);F('rgba(255,255,255,0.25)',ox+x*8,oy+y*8,7,1);}
    for(const [x,y] of arcCells(a))F(a.pc,ox+x*8,oy+y*8,7,7);
    ctx.fillStyle='#ffffff';circ(ox+a.ball.x,oy+a.ball.y,2);txt('lines '+a.lines+'/6',gx+4,gy+4,'#ff8a5a');}}
};
const ARC_IDS=Object.keys(ARC);
// n different arcade games in random order, so a room of cabinets never repeats a game
function arcPicks(n){return ARC_IDS.slice().sort(()=>Math.random()-0.5).slice(0,n);}
const PIECES=[[[0,0],[1,0],[2,0],[3,0]],[[0,0],[1,0],[0,1],[1,1]],[[1,0],[0,1],[1,1],[2,1]],[[0,0],[0,1],[1,1],[2,1]],[[2,0],[0,1],[1,1],[2,1]],[[1,0],[2,0],[0,1],[1,1]],[[0,0],[1,0],[1,1],[2,1]]];
const PCOL=['#5af0ff','#e8d070','#c08aff','#6a8aff','#ff9a4a','#7fd08e','#ff5a6a'];
function arcNewPiece(a){const i=rnd(7);a.pid=i;a.pc=PCOL[i];a.rot=0;a.px=3;a.py=0;if(!arcFits(a,a.px,a.py))arcLose(a,'the stack reached the top');}
function arcCells(a,px,py,rot){px=px==null?a.px:px;py=py==null?a.py:py;rot=rot==null?a.rot:rot;return PIECES[a.pid].map(([x,y])=>{let X=x,Y=y;for(let k=0;k<rot;k++){const t=X;X=1-Y+ (a.pid===0?1:0);Y=t;}return [px+X,py+Y];});}
function arcFits(a,px,py){return arcCells(a,px,py).every(([x,y])=>x>=0&&x<10&&y<14&&(y<0||!a.grid[y][x]));}
function arcMove(a,dx,dy){if(arcFits(a,a.px+dx,a.py+dy)){a.px+=dx;a.py+=dy;return true;}return false;}
function arcLock(a){for(const [x,y] of arcCells(a))if(y>=0)a.grid[y][x]=a.pc;let cl=0;for(let y=13;y>=0;y--)if(a.grid[y].every(v=>v)){a.grid.splice(y,1);a.grid.unshift(Array(10).fill(0));cl++;y++;}
  if(cl){a.lines+=cl;sfx('hackok');if(a.lines>=6)return arcWin(a);}arcNewPiece(a);}
function arcHit(a,msg){a.lives--;sfx('zap');if(a.lives<=0)return arcLose(a,msg);a.flash=0.4;if(a.g==='crossline'){a.r=7;a.c=5;}}
function arcLose(a,msg){a.over=true;a.win=false;a.msg=msg;sfx('zap');}
function arcWin(a){a.over=true;a.win=true;sfx('hackwin');if(player.rs)player.rs.arcade=(player.rs.arcade||0)+1;
  if(!a.f.won){a.f.won=true;const r=Math.random();if(r<0.3){const g=randomGear();gainGear(g);a.msg='high score! prize: '+GEAR[g].name.toLowerCase();}
    else if(r<0.6){player.inv.key++;a.msg='high score! prize: a key';}else{player.inv.scrap+=5;a.msg='high score! prize: 5 scrap';}}
  else{player.inv.scrap+=2;a.msg='you win again: 2 scrap';}
  if(a.bonus>0){player.inv.scrap+=a.bonus;a.msg+='  +'+a.bonus+' bonus scrap';}}
function startArcade(f){if(!f.game)f.game='rift';if(player.inv.scrap<1){say('insert scrap to play');sfx('click');return;}player.inv.scrap--;
  arcadeUI={f,g:f.game,over:false,win:false,msg:'',flash:0};ARC[f.game].init(arcadeUI);sfx('beep');mouse.l=false;mouse.r=false;}
function updateArcade(dt){const a=arcadeUI;a.flash=(a.flash||0)-dt;if(a.over)return;ARC[a.g].update(a,dt);}
function drawMarquee(g,G,x,y,w,h){
  const bg=ctx.createLinearGradient(0,y,0,y+h);bg.addColorStop(0,'#1a1026');bg.addColorStop(1,'#07050c');ctx.fillStyle=bg;ctx.fillRect(x,y,w,h);
  F(G.col,x,y,w,1);F(G.col,x,y+h-1,w,1);
  ctx.save();ctx.beginPath();ctx.rect(x+1,y+1,w-2,h-2);ctx.clip();
  const cx=x+w/2,cy=y+h/2;
  {const pulse=0.55+0.15*Math.sin(T*1.6),bl=ctx.createRadialGradient(cx,cy,2,cx,cy,w*0.6);bl.addColorStop(0,'rgba(255,250,235,'+(0.22*pulse)+')');bl.addColorStop(0.45,G.col+'33');bl.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=bl;ctx.fillRect(x,y,w,h);}
  if(g==='rift'){for(let k=-3;k<=3;k++){ctx.strokeStyle=k%2?'#ff5aa8':'#5af0ff';ctx.globalAlpha=0.5;ctx.beginPath();ctx.moveTo(cx+k*6,y+2);ctx.lineTo(cx+k*40,y+h);ctx.stroke();}ctx.globalAlpha=1;
    for(let k=0;k<4;k++){const yy=y+4+((T*30+k*7)%(h-6));F('#2a1a4a',x,Math.round(yy),w,1);}ctx.fillStyle='#e8e0a0';ctx.beginPath();ctx.moveTo(x+18,cy-5);ctx.lineTo(x+24,cy+6);ctx.lineTo(x+12,cy+6);ctx.closePath();ctx.fill();F('#ffe070',x+w-22,cy-2,3,3);}
  else if(g==='moonrake'){for(let k=0;k<14;k++)F('#6a6a8a',x+(k*29)%w,y+2+(k*13)%(h-5),1,1);ctx.fillStyle='#e8e0c8';circ(x+w-24,cy,9);ctx.fillStyle='#1a1026';circ(x+w-20,cy-2,8);
    ctx.fillStyle='#c8c0a0';ctx.beginPath();ctx.moveTo(x+22,cy-6);ctx.lineTo(x+28,cy+4);ctx.lineTo(x+16,cy+4);ctx.closePath();ctx.fill();if(Math.sin(T*20)>0)F('#ffb050',x+21,cy+4,2,3);F('#5fae6e',x+10,y+h-6,20,1);}
  else if(g==='crossline'){F('#101418',x,y,w,h);for(let k=0;k<w;k+=12)F('#181e22',x+k,y,1,h);F('#5af0ff',x,cy-1,w*0.42,2);F('#5af0ff',x+w*0.58,cy-1,w*0.42,2);F('#e0ffff',x,cy-0,w*0.42,1);
    ctx.fillStyle='#6a7078';circ(x+26,cy+6,5);F('#ff5a5a',x+27,cy+5,2,2);F('#c8b030',x+w-30,cy+2,8,7);F('#7fd0e0',x+w-28,cy+4,4,1);F('#7fd08e',x+w/2-2,cy-8,4,4);}
  else if(g==='obelisk'){F('#040204',x,y,w,h);for(let k=0;k<3;k++)F('rgba(200,40,40,0.25)',x,y+((T*20+k*9)%h),w,1);for(const ox of [x+22,x+w-22]){F('#0a0406',ox-5,y+2,10,h-4);F('#2a1016',ox-5,y+2,1,h-4);const o=Math.sin(T*1.5+ox);ctx.fillStyle='#ffdddd';circ(ox,cy,3);ctx.fillStyle='#600';circ(ox+o,cy,1.5);}}
  else if(g==='pyrite'){for(let k=0;k<5;k++){const X=x+26+k*14,Y=cy+2-(k%2)*3;ctx.fillStyle=k%2?'#4a4060':'#40375a';ctx.beginPath();ctx.moveTo(X,Y-3);ctx.lineTo(X+7,Y);ctx.lineTo(X,Y+3);ctx.lineTo(X-7,Y);ctx.closePath();ctx.fill();F('#2a1e3a',X-7,Y,7,3);}
    F('#e0a030',x+w-40,cy-6,3,6);F('#fff0a0',x+w-39,cy-6,1,2);ctx.globalAlpha=0.5;ctx.fillStyle='#ff5a2a';circ(x+w-22,cy,5);ctx.globalAlpha=1;ctx.fillStyle='#ffb050';circ(x+w-22,cy,2);}
  else if(g==='brickfall'){const bl=[[0,0,'#5af0ff'],[1,0,'#5af0ff'],[2,0,'#5af0ff'],[1,1,'#c08aff'],[5,1,'#ff9a4a'],[5,0,'#ff9a4a'],[6,1,'#ff9a4a'],[10,1,'#7fd08e'],[11,1,'#7fd08e'],[11,0,'#7fd08e'],[12,0,'#7fd08e']];
    for(const [bx,by,c] of bl){F(c,x+14+bx*6,cy-4+by*6,5,5);}ctx.fillStyle='#fff';circ(x+w-30+Math.sin(T*3)*8,cy-3+Math.cos(T*4)*3,2);F('#8e978b',x+w-40,y+h-6,20,2);}
  {const pulse=0.5+0.5*Math.sin(T*1.6);ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,245,220,'+(0.05+0.04*pulse)+')';ctx.fillRect(x,y,w,h);ctx.globalCompositeOperation='source-over';}
  ctx.restore();
  ctx.font='16px '+FONT;ctx.textAlign='center';ctx.textBaseline='top';const tt=G.name.toUpperCase();{const tw=ctx.measureText(tt).width||80;F('rgba(5,2,7,0.72)',cx-tw/2-5,cy-10,tw+10,19);}ctx.fillStyle='#050207';ctx.fillText(tt,cx+1,cy-7);ctx.fillStyle=G.col;ctx.fillText(tt,cx,cy-8);
  ctx.save();ctx.beginPath();ctx.rect(x,cy-8,w,5);ctx.clip();ctx.fillStyle='rgba(255,255,255,0.45)';ctx.fillText(tt,cx,cy-8);ctx.restore();ctx.font='8px '+FONT;}
function drawArcade(){const a=arcadeUI,G=ARC[a.g],pw=200,ph=212,px=(W-pw)>>1,py=Math.max(2,(H-ph)>>1);
  F('rgba(4,5,6,0.7)',0,0,W,H);box(px,py,pw,ph,'#05040a','#3a2a5a');drawMarquee(a.g,G,px+4,py+4,pw-8,28);
  const gx=px+20,gy=py+38;a.fx=gx;a.fy=gy;
  ctx.save();ctx.beginPath();ctx.rect(gx,gy,FW,FH);ctx.clip();G.draw(a,gx,gy);ctx.restore();
  if(a.flash>0)F(`rgba(255,80,80,${a.flash})`,gx,gy,FW,FH);
  if(a.over){F('rgba(0,0,0,0.6)',gx,gy+FH/2-12,FW,24);txt(a.msg,gx+FW/2,gy+FH/2-8,a.win?'#9fcf9a':'#ff8a9a','center');txt('R again (1 scrap)   ESC leave',gx+FW/2,gy+FH/2+3,'#8e978b','center');}
  wrap(G.goal,px+10,gy+FH+4,pw-20,9,'#8e978b');txt(G.help,px+pw/2,py+ph-10,'#4f5a55','center');
}
function freezeAround(x,y,rad){const tx=Math.floor(x/TS),ty=Math.floor(y/TS),r=Math.ceil(rad/TS),q=[],seenF=new Set();
  for(let yy=ty-r;yy<=ty+r;yy++)for(let xx=tx-r;xx<=tx+r;xx++){if(xx<0||yy<0||xx>=MW||yy>=MH)continue;const i=yy*MW+xx;if(liq[i]>=1&&map[i]===0&&Math.hypot(xx*TS+6-x,yy*TS+6-y)<=rad+6){q.push([i,0]);seenF.add(i);}}
  for(let h=0;h<q.length;h++){const [i,d]=q[h];ice[i]=1;if(d>=4)continue;const X=i%MW,Y=(i/MW)|0;for(const [dx,dy] of D4){const n=(Y+dy)*MW+X+dx;if(n<0||n>=MW*MH||seenF.has(n)||liq[n]<1||map[n]!==0)continue;seenF.add(n);q.push([n,d+1]);}}
  if(!q.length)return;sfx('crackle');
  for(const e of enemies){if(e.dead||ET[e.type].fly||ET[e.type].ghost)continue;const i=Math.floor(e.y/TS)*MW+Math.floor(e.x/TS);if(!seenF.has(i))continue;
    if(ET[e.type].aquatic||ET[e.type].snake&&liq[i]>=3){damageEnemy(e,999,0,0,0,true);float(e.x,e.y,'frozen','#cfe8ff');}else{e.stun=Math.max(e.stun||0,1.5);damageEnemy(e,3,0,0,0,true);chillEnemy(e,FREEZE_CFG.chill.freeze);}}
  const pi=Math.floor(player.y/TS)*MW+Math.floor(player.x/TS);if(seenF.has(pi))addStatus('frz',40);}
function drawIce(tx,ty){const x=tx*TS-camX,y=ty*TS-camY,h=hash(tx*2+7,ty*5+3);F('rgba(200,230,245,0.55)',x,y,TS,TS);ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=1;ctx.beginPath();
  ctx.moveTo(x+1+(h%5),y+1);ctx.lineTo(x+4+(h%4),y+6);ctx.lineTo(x+10,y+4+(h%5));ctx.moveTo(x+4+(h%4),y+6);ctx.lineTo(x+3,y+11);ctx.stroke();F('#ffffff',x+2+(h%7),y+2+((h>>>3)%7),1,1);}
