// ---------- creature art: painted creatures (Batch 5 session 2, from docs/art/sprite-study.html) ----------
// drawEnemy() (moved here from 25-render-helpers.js) draws every creature. The study's ten (husk, crawler, spitter,
// brute, bog frog, bloom wasp, ghost, slug, duct spider) are ported from its NEW functions; the rest follow the same
// rules (dabs in four tones of their own colour, lit from one side, no black outline, one signature movement). Every
// state the old drawing showed is kept: hit flash (pale tones), daze stars, the stun meter stars, carrier and friend
// marks, wading, submerged ripples, tongues and tentacles, the riot drone's canister, boss health bars and tells.
// Security guards and riot guards keep their old drawing until Session 3; the training dummy is a target, not a creature,
// and keeps its look. Emissive parts (spitter sac, spider eyes, arc snake pulse, drone lights, ghosts, warden and charger
// eyes) are drawn again after the darkness by drawEmissives() on dark decks, as the study's dark deck does.
// Palettes and dab counts: ART_PAL, ART_DABS (src/data/art.js).
let artFlash=false;
const artRampCache={};
// four tones from one colour, for types and bosses without their own ramp
function artRamp(hex){if(artRampCache[hex])return artRampCache[hex];const n=parseInt(hex.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255;
  const t=k=>'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v*k))).toString(16).padStart(2,'0')).join('');return artRampCache[hex]=[t(.3),t(.6),t(.95),t(1.35)];}
const AP=k=>artFlash?ART_PAL.FLASH:(ART_PAL[k]||artRamp(ET[k]?ET[k].col:'#808080'));
const AD=k=>ART_DABS[k]||ART_DABS.generic;
// per-creature animation clock offset and a smoothed movement measure (pixels a frame), so motion drives the art
function artPrep(e){if(e._to==null)e._to=((e.x*7.31+e.y*3.17)%10+10)%10;if(olPass)return T+e._to;const mv=e._ax==null?0:Math.hypot(e.x-e._ax,e.y-e._ay);e._ax=e.x;e._ay=e.y;e._mv=(e._mv||0)*0.8+Math.min(4,mv)*0.2;return T+e._to;}
const spitSwell=e=>{const m=(ET.spitter.atk||2)*1.2;return 1-Math.max(0,Math.min(1,(e.cd||0)/m));};

// ---------- the study's creatures, as in its NEW object (pal() picks the flash tones) ----------
const CART={
  husk(g,x,y,a,t,L){const sw=Math.sin(t*1.8)*.7;shadow(g,x+.4,y+2.4,4.6,2.6);
    g.save();g.translate(x,y);const aa=a+Math.sin(t*.9)*.15;g.rotate(aa);const Lr=L-aa;
    ell(g,-2.9,-1.6,1.4,.9,0,'#1c1f19');ell(g,1+Math.max(0,Math.sin(t*1.8))*1.6,1.8,1.4,.9,0,'#1c1f19');
    const r1=Math.sin(t*1.8)*.7,P=AP('husk');line(g,.3,-3,4.6+r1,-2.3,1.3,P[1]);line(g,.3,3,4.1-r1,2.1,1.3,P[1]);
    ell(g,4.6+r1,-2.3,.8,.8,0,P[3]);ell(g,4.1-r1,2.1,.8,.8,0,P[3]);
    g.save();g.rotate(.28);paint(g,'husk',AD('husk'),0,sw*.3,2.7,4.3,P,Lr-.28,t,{wob:.15});g.restore();
    const A0=g.globalAlpha,b=.55+.35*Math.sin(t*2.3);g.globalAlpha=A0*b;for(const [bx,by] of [[-.6,-2.6],[.2,-3.1],[-1.2,-1.9],[.4,-2.2]])pxl(g,bx,by,'#e2dca4',.95);g.globalAlpha=A0;
    paint(g,'huskh',AD('huskH'),1.4,1.5+sw*.4,1.8,1.8,AP('huskH'),Lr,t,{wob:.1});
    g.restore();},
  crawler(g,x,y,a,t,L,mv){const f=t*34;shadow(g,x,y+1.6,3.8,1.8,.3);
    g.save();g.translate(x,y);g.rotate(a);const Lr=L-a,P=AP('crawler'),A0=g.globalAlpha;
    if(mv){for(const k of[1,2]){g.globalAlpha=A0*.2/k;ell(g,-k*2.4,0,3.2,2,0,P[2]);}g.globalAlpha=A0;}
    for(const s of[-1,1])for(let k=0;k<3;k++){const fl=Math.sin(f+k*2+(s>0?1.5:0))*(mv?1.1:.15);const hx=1.2-k*1.4,kx=hx+.9-k*.3+fl*.5,ex=hx+1.4-k*.6+fl;
      line(g,hx,s*1.5,kx,s*3.1,.8,'#341a10');line(g,kx,s*3.1,ex,s*4.2,.6,'#5a2a14');}
    paint(g,'crawl',AD('crawler'),0,0,3.4,2.2,P,Lr,t,{wob:mv?.35:.12});
    for(let i=-2;i<=1;i++)pxl(g,i*1.1,0,'#2a120a',.9);
    ell(g,3.2,0,1.2,1.3,0,'#4e2412');pxl(g,4.4,-.7,'#e8b888',.7);pxl(g,4.4,.7,'#e8b888',.7);
    g.restore();},
  // the sac swells as its next glob comes round (sw 0-1), and glows
  spitter(g,x,y,a,t,L,sw){shadow(g,x,y+2.6,4.8,2.4,.35);
    g.save();g.translate(x,y);g.rotate(a);const Lr=L-a,P=AP('spitter');
    for(const s of[-1,1]){ell(g,1.6,s*3.3,1,.8,0,P[0]);ell(g,-1.8,s*3.3,1,.8,0,P[0]);}
    paint(g,'spit',AD('spitter'),-.3,0,3.5+sw*.9,3.7+sw*.9,P,Lr,t,{wob:.1,size:1.2});
    spitGlow(g,sw);
    pxl(g,-1.2,-1.7,'#eef8ff',.9);pxl(g,-.4,-2.1,'#cfe6ff',.6);
    ell(g,3.3+sw*.6,0,.7,1.3,0,'#0b1220');
    g.restore();},
  brute(g,x,y,a,t,L){const h=Math.sin(t*1.5);shadow(g,x+.5,y+3.2,7,3.4,.42);
    g.save();g.translate(x,y);g.rotate(a);const Lr=L-a,P=AP('brute');
    for(const s of[-1,1]){line(g,0,s*4.6,4.3,s*4.9,2.4,P[1]);ell(g,4.8,s*4.9,1.75,1.6,0,'#6e2a38');pxl(g,5.4,s*4.5,'#c87070',.8);pxl(g,5.7,s*5.2,'#a85a5e',.7);}
    paint(g,'brute',AD('brute'),-.4,0,4.4*(1+h*.03),6.2*(1+h*.045),P,Lr,t,{wob:.12,size:1.4});
    paint(g,'bh1',16,-1.8,-3,2.2,2.0,P,Lr,t,{wob:.1,size:1.3});paint(g,'bh2',16,-1.8,3,2.2,2.0,P,Lr,t,{wob:.1,size:1.3});
    paint(g,'bhd',AD('bruteH'),3.1,0,1.7,1.9,AP('bruteH'),Lr,t,{wob:.06});
    const A0=g.globalAlpha;g.globalAlpha=A0*.7;pxl(g,4.2,-.6,'#ffb070',.8);pxl(g,4.2,.6,'#ffb070',.8);g.globalAlpha=A0;
    if(h>.85){g.globalAlpha=A0*(h-.85)*4;pxl(g,5.6,0,'#cfd6d0',.8);pxl(g,6.4,-.4,'#cfd6d0',.7);g.globalAlpha=A0;}
    g.restore();},
  // hop: 0-1 from the frog's real hop; sac: the throat swells before a tongue lash
  frog(g,x,y,a,t,L,hop,sac){const lift=hop*3.2;shadow(g,x,y+2.2,4.4-hop,2.4-hop*.6,.35-hop*.15);
    g.save();g.translate(x,y-lift);g.rotate(a);const Lr=L-a,ext=hop*2.2,P=AP('frog');
    for(const s of[-1,1]){ell(g,-2.4-ext,s*(2.9+ext*.3),2.1+ext*.6,1.1,s*.4,P[1]);pxl(g,-4.2-ext*1.6,s*(3.3+ext*.4),P[2],.8);ell(g,2.4,s*2.5,.9,.7,0,P[2]);}
    paint(g,'frog',AD('frog'),0,0,3.6,3.2,P,Lr,t,{wob:.1});
    for(const [sx,sy] of [[-1.4,-1],[-.6,1.3],[-2.2,.6],[.4,-.2]])pxl(g,sx,sy,'#16240f',1);
    if(!hop){const sp=sac?1:Math.max(0,Math.sin(t*4.5))*.4;{const A1=g.globalAlpha;g.globalAlpha=A1*(.45+sp*.45);ell(g,3.0,0,.6+sp*1,.8+sp*1.2,0,'#d8c060');g.globalAlpha=A1;}}
    for(const s of[-1,1]){ell(g,1.9,s*1.7,1.05,1.05,0,P[2]);ell(g,2.1,s*1.7,.55,.55,0,'#0c1207');pxl(g,1.75,s*1.45,'#ffffff',.55);}
    const A0=g.globalAlpha;g.globalAlpha=A0*.85;for(let k=0;k<3;k++){const q=dabs('fgl',3)[k];pxl(g,q.u*2.6+Math.sin(t*.6+k)*.4,q.v*2.2,'#e8ffe0',.6);}g.globalAlpha=A0;
    g.restore();},
  // wf: wing spread; trail of pollen behind (its signature)
  wasp(g,x,y,a,t,L,wf,bob){shadow(g,x,y+5,2.6,1.1,.25);
    g.save();g.translate(x,y-1+bob);g.rotate(a);const Lr=L-a,A0=g.globalAlpha;
    for(let k=0;k<6;k++){const m=(t*.8+k/6)%1;pxlA(g,-3-m*8,Math.sin(k*2+t)*1.5*m,'#f6de6e',.6*(1-m),.8);}
    g.globalAlpha=A0*.35;for(const s of[-1,1])ell(g,-.4,s*2.4*wf,1.2,2.4*wf,0,'#e8f0ff');g.globalAlpha=A0;
    paint(g,'wab',AD('wasp'),-2,0,2.3,1.6,AP('wasp'),Lr,t,{wob:.08});
    for(const bx of[-1.4,-2.7])for(let yy=-1.2;yy<=1.21;yy+=.6)pxl(g,bx,yy,'#15110a',.8);
    paint(g,'wth',AD('waspT'),.6,0,1.4,1.3,AP('waspT'),Lr,t,{wob:.06});
    ell(g,2,0,1,1.1,0,'#2a2010');pxl(g,2.4,-.6,'#f6de6e',.6);pxl(g,2.4,.6,'#f6de6e',.6);pxl(g,-4.5,0,'#15110a',.8);
    g.restore();},
  // drifting motes of light; al is the ghost's state alpha
  ghost(g,x,y,a,t,al,flash){g.save();g.translate(x,y+Math.sin(t*1.3)*1);const A0=g.globalAlpha;
    const gr=g.createRadialGradient(0,0,0,0,0,9);gr.addColorStop(0,'rgba(170,225,240,'+(.3*al)+')');gr.addColorStop(1,'rgba(170,225,240,0)');g.fillStyle=gr;g.fillRect(-9,-9,18,18);
    g.globalCompositeOperation='lighter';const hue=(Math.sin(t*.7)+1)/2;
    for(const q of dabs('ghost',64)){const rr2=q.u*q.u+q.v*q.v,dr=(t*.35+q.s)%1,sc=1+dr*(rr2>.45?1.1:.2);
      const xx=q.u*4*sc+Math.sin(t*2+q.p)*.5,yy=q.v*4.4*sc+Math.cos(t*1.7+q.p)*.5;const cyan=q.j>hue;
      g.globalAlpha=A0*al*(1-dr)*(.35+(1-rr2)*.4);g.fillStyle=flash?'#ffffff':cyan?(q.j>.7?'#e6fbff':'#8fd4e8'):(q.j>.4?'#d8c8f0':'#9c88c8');g.fillRect(xx-.6,yy-.6,1.2,1.2);}
    g.globalCompositeOperation='source-over';g.globalAlpha=A0*al*.75;const ca=Math.cos(a),sa=Math.sin(a);
    for(const s of[-1,1])ell(g,ca*1.4-sa*s*1.2,sa*1.4+ca*s*1.2,.55,.85,a,'#14202a');g.globalAlpha=A0;
    g.restore();},
  // slug and blight slug: a peristaltic body and a glistening trail
  slug(g,x,y,a,t,L,key){shadow(g,x,y+1.5,5,2,.25);g.save();g.translate(x,y);g.rotate(a);const Lr=L-a,pe=Math.sin(t*2.2),P=AP(key),A0=g.globalAlpha;
    for(let i=0;i<11;i++){g.globalAlpha=A0*.3*(1-i/11);ell(g,-4-i*1.3,Math.sin(i*.6)*.3,1.2,1.5-i*.06,0,P[3]);}g.globalAlpha=A0;
    for(let k=0;k<3;k++){const gx=-4-((t*3+k*4.3)%13);pxlA(g,gx,-.4,'#ffffdc',.7,.8);}
    paint(g,'slug',AD('slug'),pe*.3,0,4.6+pe*.4,2-pe*.12,P,Lr,t,{wob:.12});
    for(let k=0;k<4;k++)pxl(g,-2+k*1.3+pe*.3,-.8,'#fffbd0',.6);
    for(const s of[-1,1]){const wv=Math.sin(t*3+s)*.5;line(g,3.6,s*.7,5.8,s*(1.8+wv),.6,P[1]);pxl(g,5.8,s*(1.8+wv),'#26260c',1);}
    g.restore();},
  // legs step with the spider's own walk cycle (lg) and twitch now and then
  spider(g,x,y,a,t,L,lg){shadow(g,x,y+2,5,2.4,.3);g.save();g.translate(x,y);g.rotate(a);const Lr=L-a,tw=(t%3.2)<.25?Math.sin(t*60)*.7:0,P=AP('spider');
    for(const s of[-1,1])for(let k=0;k<4;k++){const ph=lg+((k+(s>0?1:0))%2)*Math.PI,st=Math.sin(ph)*1.1;const hx=1.4-k*.9,kx=hx+1.5-k*1.05+st*.4,fx=kx+1.3-k*1.1+tw*.4+st,ky=s*(3.5+(k===1||k===2?.4:0))+tw*s*.3;
      line(g,hx,s*1,kx,ky,.8,'#1a1522');line(g,kx,ky,fx,s*5.4,.6,'#2a2238');pxl(g,kx,ky,P[3],.8);}
    paint(g,'spa',AD('spider'),-1.8,0,3,2.7,P,Lr,t,{wob:.06});
    pxl(g,-2.4,0,'#5a2448',1);pxl(g,-1.4,0,'#5a2448',.8);
    paint(g,'spc',AD('spiderH'),1.3,0,1.7,1.5,P,Lr,t,{wob:.05});
    spiderEyes(g,t);g.restore();}
};
function spitGlow(g,sw){const gg=g.createRadialGradient(1,0,0,1,0,3.8);gg.addColorStop(0,'rgba(190,232,255,'+(.25+sw*.6)+')');gg.addColorStop(1,'rgba(190,232,255,0)');g.fillStyle=gg;g.fillRect(-3,-4,8,8);}
function spiderEyes(g,t){const A0=g.globalAlpha,f=.65+.35*Math.sin(t*3.1);g.globalAlpha=A0*f;for(const [ex,ey] of [[2.5,-.45],[2.5,.45],[2.15,-1.05],[2.15,1.05]])pxl(g,ex,ey,'#ff4a3a',.8);g.globalAlpha=A0;}
// a painted body for any type without its own drawing: an oval of dabs and two eyes facing a
function genericArt(g,e,x,y,a,t,L){const r=e.r;shadow(g,x,y+r*.5,r,r*.5,.3);g.save();g.translate(x,y);g.rotate(a);
  paint(g,'gen'+e.type,AD('generic'),0,0,r*.9,r,AP(e.type),L-a,t,{wob:.12});pxl(g,r*.6,-r*.35,'#e6d27a',.9);pxl(g,r*.6,r*.35,'#e6d27a',.9);g.restore();}
// snakes: one painted head; body segments as two-tone lit discs (cheap enough for long bodies)
function snakeSegs(g,e,b,L){const P=AP(e.type),Sx=artFlash?P:[P[0],b.stripe||P[1],P[2],P[3]],lx=Math.cos(L),ly=Math.sin(L);
  const A0=g.globalAlpha;g.globalAlpha=A0*.25;for(let i=e.seg.length-1;i>=1;i--){const q=e.seg[i],r=Math.max(1.1,2.3-i*0.15);ell(g,q.x-camX,q.y-camY+.6,r+.4,r*.7,0,'#000');}g.globalAlpha=A0;
  for(let i=e.seg.length-1;i>=1;i--){const q=e.seg[i],sx=q.x-camX,sy=q.y-camY,r=Math.max(1.1,2.3-i*0.15);
    ell(g,sx,sy,r+.5,r+.5,0,P[0]);ell(g,sx,sy,r,r,0,i%2?Sx[1]:P[2]);ell(g,sx+lx*r*.4,sy+ly*r*.4,r*.45,r*.45,0,P[3]);}}

// ---------- emissive parts, again after the darkness (dark decks only) ----------
function drawEmissives(){if(!cond||cond.light!=='dark')return;
  for(const e of enemies){if(e.dead||(e.caged&&!e.caged.open)||!visible(e.x,e.y,e.r))continue;const b=ET[e.type],x=e.x-camX,y=e.y-camY,t=T+(e._to||0),a=Math.atan2(player.y-e.y,player.x-e.x);
    if(e.type==='spitter'){ctx.save();ctx.translate(x,y);ctx.rotate(a);spitGlow(ctx,spitSwell(e));ctx.restore();}
    else if(b.spider){ctx.save();ctx.translate(x,y);ctx.rotate(a);spiderEyes(ctx,t);ctx.restore();}
    else if(b.ghost){const al=ghostAlpha(e);CART.ghost(ctx,x,y,a,t,al*.75,false);}
    else if(b.drone){const yy=y-4+Math.round(Math.sin(e.bob||T*5)*1.5);glow(ctx,x,yy-1,4,'255,60,50',e.beep>0||Math.sin(T*6)>0.8?.6:.18);pxl(ctx,x,yy-1,e.beep>0||Math.sin(T*6)>0.8?'#ff3030':'#802020',1);}
    else if(b.pulse){if(e.pt<0.7)for(const q of e.seg)if(Math.random()<0.4)pxl(ctx,q.x-camX+rr(-1.5,1.5),q.y-camY+rr(-1.5,1.5),'#fff8a0',1);glow(ctx,x,y,6,'150,190,255',.25);}
    else if(b.warden){const r=e.r+3.5;for(const sd of [-1,1]){const ex=x+Math.cos(a)*r*0.5-Math.sin(a)*sd*3,ey=y+Math.sin(a)*r*0.5+Math.cos(a)*sd*3;glow(ctx,ex,ey,4,'255,224,112',.35);pxl(ctx,ex,ey,'#ffe070',1.4);}}
    else if(b.guard&&!b.riot&&e._bd!=null&&(!e.kit||e.kit.gun)){const c=Math.cos(e._bd),s2=Math.sin(e._bd),hx=x+c*4.4+s2*.6,hy=y+s2*4.4-c*.6;glow(ctx,hx,hy,3,'255,240,200',.3);pxl(ctx,hx,hy,'#fff0c8',1);}
    else if(e.type==='charger'){const a2=e.dir!=null&&e.st!=='walk'?e.dir:a,c2=Math.cos(a2),s2=Math.sin(a2);for(const sd of [-1,1])pxl(ctx,x+c2*4-s2*sd,y+s2*4+c2*sd,'#ff6040',1);}}}
function ghostAlpha(e){return e.fleeT>0?0.3:e.gst==='windup'?0.75+0.25*Math.sin(T*40):e.gst==='lunge'?0.9:e.gst==='drift'?0.45:0.6+0.15*Math.sin(T*5+e.ph);}

// ---------- drawEnemy ----------
function drawEnemy(e){
  const b=ET[e.type],x=Math.round(e.x-camX),y=Math.round(e.y-camY),col=e.flash>0?'#f2efe6':b.col,t=artPrep(e),L=e.portrait?ART_LIGHT.lit:spriteLight(e.x,e.y),g=ctx;
  artFlash=e.flash>0;
  if(b.warden){const B=BOSSES[e.boss||0],c=B.col,r=e.r+3.5,a=Math.atan2(player.y-e.y,player.x-e.x),P=artFlash?ART_PAL.FLASH:artRamp(c);shadow(g,x,y+r*.55,r+1,r*.5,.45);
    if(B.move==='grab'){g.strokeStyle=P[1];g.lineWidth=2;for(let k=0;k<8;k++){const q=k/8*6.283+Math.sin(e.ph+k)*0.3,Lg=r+5+Math.sin(e.ph*1.5+k*2)*2;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(q+0.4)*Lg*0.6,y+Math.sin(q+0.4)*Lg*0.6,x+Math.cos(q)*Lg,y+Math.sin(q)*Lg);g.stroke();}}
    else{for(let k=0;k<6;k++){const q=k/6*6.283+e.ph*0.2;ell(g,x+Math.cos(q)*(r+1),y+Math.sin(q)*(r+1),1.6,1.6,0,'#15110a');pxl(g,x+Math.cos(q)*(r+1.4),y+Math.sin(q)*(r+1.4),P[1],1);}}
    // its signature: the body heaves with its move (charge leans in, slam swells, others breathe)
    const k=B.move==='slam'?1+0.06*Math.max(0,Math.sin(t*2.2)):B.move==='charge'?1+0.03*Math.sin(t*4):1+0.035*Math.sin(t*1.6);
    g.save();g.translate(x,y);g.rotate(a);paint(g,'ward'+(e.boss||0),AD('warden'),B.move==='charge'?.6:0,0,r*k,r*k*.95,P,L-a,t,{wob:.14,size:1.5});g.restore();
    for(const sd of [-1,1]){const ex=x+Math.cos(a)*r*0.5-Math.sin(a)*sd*3,ey=y+Math.sin(a)*r*0.5+Math.cos(a)*sd*3;glow(g,ex,ey,3.5,'255,224,112',.25);ell(g,ex,ey,1.4,1.4,0,'#ffe070');}
    if(B.move==='breath'||B.move==='pulse'){F(B.move==='pulse'?'#9fe0ff':'#e8f4ff',x-1,y-r-3,2,2);}
    F('#141817',x-14,y-r-8,28,3);F('#e05040',x-14,y-r-8,Math.round(28*Math.max(0,e.hp)/(e.mhp||80)),3);artFlash=false;return;}
  if(b.wasp){const a=e.st==='dash'?Math.atan2(e.vy,e.vx):Math.atan2(player.y-e.y,player.x-e.x),bob=e.st==='dash'?0:Math.sin(T*9+e.ph)*1.2;
    CART.wasp(g,x,y,a,t,L,Math.sin(e.wing||0)>0?1:.6,bob);const yy=y+bob;
    if(e.daze>0){for(let k=0;k<3;k++){const q=T*6+k*2.1;F('#fff0a0',Math.round(x+Math.cos(q)*4),Math.round(yy-5+Math.sin(q)*1.5),1,1);}}
    if(e.st==='wind'&&Math.sin(T*30)>0)F('#ff8a4a',Math.round(x),Math.round(yy-5),1,1);artFlash=false;return;}
  if(b.guard){artFlash=false;drawGuardBody(e,x,y,t,L);
    if(e.seeT>0.3&&!e.radioed&&!e.called){const k=Math.min(1,e.seeT/3.2);F('#141817',x-5,y-11,10,2);F(k>0.7?'#ff5a4a':'#ffd070',x-5,y-11,Math.round(10*k),2);if(Math.sin(T*12)>0)txt('!',x,y-20,'#ff5a4a','center');}
    if(e.called)F('#5a8ac0',x+3,y-7,2,2);return;}
  if(b.pod){const fa=e.face||0,ca=Math.cos(fa),sa=Math.sin(fa),sw=e.puff>0?1.4:1+0.08*Math.sin(T*3+e.ph),P=AP('pod'),lx=Math.cos(L),ly=Math.sin(L);shadow(g,x,y+3,5,2,.3);
    line(g,x-ca*5,y-sa*5,x,y,2,'#2e5a1e');
    for(let k=0;k<5;k++){const q=fa+(k-2)*0.6,px2=x+Math.cos(q)*3*sw,py2=y+Math.sin(q)*3*sw,lit=Math.cos(q)*lx+Math.sin(q)*ly;ell(g,px2,py2,2.6,1.5,q,P[1]);ell(g,px2+lx*.4,py2+ly*.4,1.8,1,q,P[lit>0.3?3:2]);}
    ell(g,x+ca*1.5,y+sa*1.5,1.8*sw,1.8*sw,0,'#3a1a30');F('#e8d070',Math.round(x+ca*1.5),Math.round(y+sa*1.5),1,1);artFlash=false;return;}
  if(b.trip){const ca=Math.cos(e.face||0),sa=Math.sin(e.face||0),Lt=e.tl||0;ctx.strokeStyle='#1e3a12';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);
    if(e.hold>0){const tx=player.x-camX,ty=player.y-camY;ctx.quadraticCurveTo((x+tx)/2-sa*3,(y+ty)/2+ca*3,tx,ty);}else{for(let k=1;k<=8&&Lt>0;k++){const t0=k/8*Lt;ctx.lineTo(x+ca*t0-sa*Math.sin(t0*0.4+T*1.5)*1.2,y+sa*t0+ca*Math.sin(t0*0.4+T*1.5)*1.2);}}ctx.stroke();
    if(!(e.hold>0))for(let t0=8;t0<Lt;t0+=7)F('#8ab060',Math.round(x+ca*t0-sa*2),Math.round(y+sa*t0+ca*2),1,1);
    shadow(g,x,y+2.5,4.5,2,.3);paint(g,'trip',AD('plant'),x,y,4,3.8,AP('plant'),L,t,{wob:.15});F('#c04040',Math.round(x+ca*2),Math.round(y+sa*2),1,1);artFlash=false;return;}
  if(b.spider){const a=Math.atan2(player.y-e.y,player.x-e.x);CART.spider(g,x,y,a,t,L,e.leg||0);artFlash=false;return;}
  if(b.frog){const air=e.hop>0?Math.sin(e.hop/0.22*Math.PI):0,fa=e.st==='wind'||e.st==='lash'?e.dir:Math.atan2(e.vy||0.01,e.vx||1),ca=Math.cos(fa),sa=Math.sin(fa);
    CART.frog(g,x,y,fa,t,L,Math.max(0,air),e.sac>0||e.st==='wind');const yy=y-Math.round(air*3.2);
    if(e.st==='lash'&&e.tongue>1){ctx.strokeStyle='#e06a8a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+ca*4,yy+sa*4);const Lt=e.tongue;ctx.quadraticCurveTo(x+ca*Lt*0.5-sa*2,yy+sa*Lt*0.5+ca*2,x+ca*Lt,yy+sa*Lt);ctx.stroke();ctx.fillStyle='#f08aa8';circ(x+ca*Lt,yy+sa*Lt,1.5);}
    artFlash=false;return;}
  if(b.dummy){artFlash=false;F('rgba(0,0,0,0.4)',x-5,y+5,11,2);F('#2a2014',x-1,y+3,2,4);F('#15110a',x-5,y-7,11,11);F(col,x-4,y-6,9,9);
    F('#6b5a3a',x-4,y-4,9,1);F('#6b5a3a',x-4,y,9,1);F('#b8493a',x-1,y-3,3,3);F('#e8dcb0',x,y-2,1,1);
    e.log=e.log.filter(q=>T-q.t<3);const tot=e.log.reduce((s2,q)=>s2+q.d,0);
    txt((tot/3).toFixed(1)+' dps',x,y-18,tot?'#e8dcb0':'#6f7a6a','center');if(e.log.length)txt('avg '+(tot/e.log.length).toFixed(1)+' a hit',x,y-27,'#8e978b','center');return;}
  const a=Math.atan2(player.y-e.y,player.x-e.x),ca=Math.cos(a),sa=Math.sin(a);
  if(b.snake){
    const s1=e.seg[1],ha=Math.atan2(e.y-s1.y,e.x-s1.x),hc=Math.cos(ha),hs=Math.sin(ha);shadow(g,x,y+1.5,3.4,1.6,.3);
    snakeSegs(g,e,b,L);
    if(b.pulse&&e.pt<0.7&&!(cond&&cond.light==='dark'))for(const q of e.seg)if(Math.random()<0.4)F('#fff8a0',Math.round(q.x-camX)+rnd(3)-1,Math.round(q.y-camY)+rnd(3)-1,1,1);
    g.save();g.translate(x,y);g.rotate(ha);paint(g,'snk'+e.type,AD('snakeH'),.3,0,e.r+.6,e.r,AP(e.type),L-ha,t,{wob:.08});g.restore();
    F('#f0e070',Math.round(x+hc*1.5-hs*1.2),Math.round(y+hs*1.5+hc*1.2),1,1);F('#f0e070',Math.round(x+hc*1.5+hs*1.2),Math.round(y+hs*1.5-hc*1.2),1,1);
    if(Math.sin(T*12+e.ph)>0.6)F('#d04050',Math.round(x+hc*4),Math.round(y+hs*4),1,1);
    if(b.pulse&&e.pulseT>0&&!e.portrait){ctx.strokeStyle=`rgba(190,225,255,${e.pulseT*3})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,22,0,6.283);ctx.stroke();
      for(let k=0;k<3;k++){ctx.beginPath();let qx=x,qy=y;ctx.moveTo(qx,qy);for(let j=0;j<4;j++){qx+=rr(-8,8);qy+=rr(-8,8);ctx.lineTo(qx,qy);}ctx.stroke();}
      if(e.pz)for(const i of e.pz){if(Math.random()<0.5)continue;F(Math.random()<.5?'#e0f0ff':'#6fa8ff',(i%MW)*TS-camX+rnd(TS),((i/MW)|0)*TS-camY+rnd(TS),1,1);}}
  }else if(b.ghost){
    CART.ghost(g,x,y,a,t,e.portrait?0.9:ghostAlpha(e),e.flash>0);
  }else if(b.plant){
    // snare: a painted rosette of leaves that sways; the mouth and the vine stay as they were
    shadow(g,x,y+2.5,e.r+1,2.4,.3);g.save();g.translate(x,y);g.rotate(Math.sin(t*1.2)*0.12);paint(g,'snare',AD('plant'),0,0,e.r+1.5,e.r+.8,AP('plant'),L,t,{wob:.2,size:1.3});g.restore();
    ctx.fillStyle=e.flash>0?'#fff':'#8a3a4a';circ(x,y,2.8);F('#e8e0c0',x-2,y-1,1,1);F('#e8e0c0',x+1,y-1,1,1);F('#e8e0c0',x-1,y+1,1,1);
    if(e.tip&&e.st!=='sub'&&!e.portrait){const tx2=e.tip.x-camX,ty2=e.tip.y-camY,Ln=Math.hypot(tx2-x,ty2-y)||1,nx=-(ty2-y)/Ln,ny=(tx2-x)/Ln,N=12;let px2=x,py2=y;
      for(let k=1;k<=N;k++){const f=k/N,wob=Math.sin(f*7-T*6)*1.8*(1-f*0.5),qx=x+(tx2-x)*f+nx*wob,qy=y+(ty2-y)*f+ny*wob;
        ctx.strokeStyle='#1a300e';ctx.lineWidth=Math.max(1,3.5-f*2.2)+1;ctx.beginPath();ctx.moveTo(px2,py2);ctx.lineTo(qx,qy);ctx.stroke();
        ctx.strokeStyle=e.flash>0?'#fff':'#5a9a3a';ctx.lineWidth=Math.max(1,3.5-f*2.2);ctx.beginPath();ctx.moveTo(px2,py2);ctx.lineTo(qx,qy);ctx.stroke();
        if(k%3===0)F('#a0d070',Math.round(qx+nx*1.5),Math.round(qy+ny*1.5),1,1);px2=qx;py2=qy;}}
  }else if(b.grasper){
    const out=e.tip&&e.st!=='sub'&&!e.portrait,sub=e.st==='sub'&&!e.portrait;
    if(sub){ctx.fillStyle='rgba(20,0,24,0.45)';ctx.beginPath();ctx.ellipse(x,y,7.5,4.5,0,0,6.283);ctx.fill();
      ctx.strokeStyle='rgba(200,170,220,0.3)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,9+Math.sin(T*3+e.ph),5,0,0,6.283);ctx.stroke();}
    else{const P=AP('grasper');shadow(g,x,y+3,e.r+1.5,2.5,.3);
      ctx.strokeStyle=P[1];ctx.lineWidth=1;for(let k=0;k<5;k++){const q=k/4*Math.PI+T*2;ctx.beginPath();ctx.moveTo(x+Math.cos(q+Math.PI)*5,y+3);ctx.lineTo(x+Math.cos(q+Math.PI)*8,y+5+Math.sin(T*5+k)*1.5);ctx.stroke();}
      paint(g,'grasp',AD('grasper'),x,y-1,e.r+1,e.r-1,P,L,t,{wob:.18,size:1.3});paint(g,'grasph',14,x-1,y-3,3,2,P,L,t,{wob:.1});
      F('#f0e070',Math.round(x-3),Math.round(y),2,1);F('#f0e070',Math.round(x+2),Math.round(y),2,1);F('#100008',Math.round(x-2),Math.round(y),1,1);F('#100008',Math.round(x+3),Math.round(y),1,1);
      if(!e.portrait){ctx.strokeStyle='rgba(200,170,220,0.4)';ctx.beginPath();ctx.ellipse(x,y+2,e.r+4,3,0,0,6.283);ctx.stroke();}}
    if(out){const tx2=e.tip.x-camX,ty2=e.tip.y-camY,Ln=Math.hypot(tx2-x,ty2-y)||1,nx=-(ty2-y)/Ln,ny=(tx2-x)/Ln,N=12;let px2=x,py2=y;
      for(let k=1;k<=N;k++){const f=k/N,wob=Math.sin(f*9-T*12)*2.2*(1-f*0.5)*(e.st==='hold'?0.5:1),qx=x+(tx2-x)*f+nx*wob,qy=y+(ty2-y)*f+ny*wob;
        ctx.strokeStyle='#2a1030';ctx.lineWidth=Math.max(1,4-f*2.6)+1;ctx.beginPath();ctx.moveTo(px2,py2);ctx.lineTo(qx,qy);ctx.stroke();
        ctx.strokeStyle=e.flash>0?'#fff':'#9a5aa8';ctx.lineWidth=Math.max(1,4-f*2.6);ctx.beginPath();ctx.moveTo(px2,py2);ctx.lineTo(qx,qy);ctx.stroke();
        if(k%2===0)F('#e0b0d0',Math.round(qx+nx),Math.round(qy+ny),1,1);px2=qx;py2=qy;}}
    if(e.st==='aim'&&!e.portrait){ctx.strokeStyle='#9a5aa8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+ca*7+Math.sin(T*20)*1.5,y+sa*7);ctx.stroke();}
  }else if(b.aquatic){
    if(e.st==='sub'&&!e.portrait){ctx.fillStyle='rgba(0,8,16,0.45)';ctx.beginPath();ctx.ellipse(x,y,7,3.5,a,0,6.283);ctx.fill();
      ctx.strokeStyle='rgba(170,225,225,0.3)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,8+Math.sin(T*4+e.ph),4,a,0,6.283);ctx.stroke();}
    else{const P=AP('lurker');g.save();g.translate(x,y);g.rotate(a);const Lr=L-a,sw=Math.sin(t*3)*.6;
      ell(g,-e.r-1.5,sw,2.2,1.4,sw*.3,P[1]);paint(g,'lurk',AD('lurker'),0,0,e.r+1,e.r-1.5,P,Lr,t,{wob:.12});paint(g,'lurkb',10,-2,0,e.r-1,e.r-3.2,[P[0],P[1],P[1],P[2]],Lr,t,{wob:.06});
      for(const sd of [-1,1])pxl(g,3,sd*2,'#d0f0e0',1);for(let k=-1;k<=1;k++)pxl(g,5,k*1.5,'#e8e0d0',1);g.restore();
      if(!e.portrait){ctx.strokeStyle='rgba(190,230,235,0.45)';ctx.beginPath();ctx.ellipse(x,y+1,e.r+3+Math.sin(T*8)*0.6,3,0,0,6.283);ctx.stroke();}}
  }else if(b.slug||b.snail){
    const hd=Math.atan2(player.y-e.y,player.x-e.x),hc=Math.cos(hd),hs=Math.sin(hd),hide=b.snail&&e.shellT>0;
    if(!hide)CART.slug(g,x,y,hd,t,L,b.snail?'snail':e.type==='toxslug'?'toxslug':'slug');
    if(!hide&&!olPass&&e.type==='toxslug'&&Math.random()<0.1)parts.push({x:x+camX+rr(-3,3),y:y+camY-2,vx:0,vy:-10,t:0.4,m:0.4,c:'#a0e040',s:1});
    if(b.snail){const sx=x-hc*1.5,sy=y-hs*1.5-1;if(hide)shadow(g,sx,sy+3,4.6,2,.3);paint(g,'shell',AD('shell'),sx,sy,4.2,4,AP('shell'),L,t,{wob:.04,size:1.3});
      ctx.strokeStyle=artFlash?'#fff':'#c8a870';ctx.lineWidth=0.8;ctx.beginPath();ctx.arc(sx,sy,2.4,0.5,5.2);ctx.stroke();pxl(ctx,sx,sy,'#e0c890',1);}
  }else if(e.type==='charger'){
    const a2=e.dir!=null&&e.st!=='walk'?e.dir:a,c2=Math.cos(a2),s2=Math.sin(a2),sh=e.st==='wind'?Math.round(rr(-1,1)):0,xx=x+sh;
    shadow(g,xx,y+e.r*.5,e.r+1,e.r*.45,.35);
    // its signature: scraping its feet as it winds up, dust while it charges
    if((e.st==='wind'||e.st==='charge')&&!e.portrait&&!olPass&&Math.random()<0.5)parts.push({x:e.x-c2*e.r+rr(-2,2),y:e.y-s2*e.r+rr(-2,2),vx:-c2*rr(10,30)+rr(-10,10),vy:-s2*rr(10,30)+rr(-10,10),t:0.35,m:0.35,c:'#6a5a44',s:1});
    g.save();g.translate(xx,y);g.rotate(a2);const Lr=L-a2;paint(g,'chg',AD('charger'),-1,0,e.r,e.r*.9,AP('charger'),Lr,t,{wob:.1,size:1.3});paint(g,'chgh',AD('chargerH'),3,0,e.r*.55,e.r*.6,AP('chargerH'),Lr,t,{wob:.06});g.restore();
    F('#d8d0b0',Math.round(xx+c2*5-s2*3),Math.round(y+s2*5+c2*3),2,2);F('#d8d0b0',Math.round(xx+c2*5+s2*3),Math.round(y+s2*5-c2*3),2,2);
    F('#ff6040',Math.round(xx+c2*4-s2*1),Math.round(y+s2*4+c2*1),1,1);F('#ff6040',Math.round(xx+c2*4+s2*1),Math.round(y+s2*4-c2*1),1,1);
    if(e.st==='stun'&&!e.portrait)for(let k=0;k<3;k++){const q=T*6+k*2.1;F('#e8dcb0',Math.round(x+Math.cos(q)*6),Math.round(y-e.r-2+Math.sin(q)*1.5),1,1);}
  }else if(b.drone){
    const by=Math.round(Math.sin(e.bob||T*5)*1.5),yy=y-4+by,P=AP(e.type);shadow(g,x,y+3,e.r,1.3,.25);
    paint(g,'drn'+e.type,AD('drone'),x,yy,e.r+.6,e.r+.6,P,L,t,{wob:.03,size:1.2});
    const sp=Math.sin(T*40)>0,A0=g.globalAlpha;g.globalAlpha=A0*.8;F('#aab4b8',x-6,yy-3,sp?4:2,1);F('#aab4b8',x+3,yy-3,sp?4:2,1);F('#aab4b8',x-6,yy+2,sp?2:4,1);F('#aab4b8',x+3,yy+2,sp?2:4,1);g.globalAlpha=A0;
    F(e.beep>0||Math.sin(T*6)>0.8?'#ff3030':'#401010',x,yy-1,1,1);if(b.riot){F('#15181a',x-2,yy+e.r,4,3);F(e.gasCd>0?'#5a5a48':'#d8d4a0',x-1,yy+e.r+1,2,1);}F('#9fd4ff',Math.round(x+ca*2),Math.round(yy+sa*2),1,1);
  }else if(e.type==='crawler'){CART.crawler(g,x,y,a,t,L,(e._mv||0)>0.35);
  }else if(e.type==='brute'){CART.brute(g,x,y,a,t,L);
  }else if(e.type==='spitter'){CART.spitter(g,x,y,a,t,L,spitSwell(e));
  }else if(e.type==='husk'){CART.husk(g,x,y,a,t,L);
  }else genericArt(g,e,x,y,a,t,L);
  artFlash=false;
  if(e.carrier&&!e.portrait){F(Math.sin(T*6)>0?AMBER:'#6b5220',x-1,y-e.r-4,3,2);}
  if(e.friendT>0&&!e.portrait){F('#9fe0b0',Math.round(x)-1,Math.round(y-e.r-4),3,1);F('#9fe0b0',Math.round(x),Math.round(y-e.r-5),1,3);}
  if(e.stun>0&&!e.portrait){for(let k=0;k<3;k++){const q=T*6+k*2.1;F('#e8dcb0',Math.round(x+Math.cos(q)*5),Math.round(y-e.r-2+Math.sin(q)*1.5),1,1);}}
  if(!e.portrait&&!b.aquatic)wade(x,y,e.r,liqAt(e.x,e.y));
}
