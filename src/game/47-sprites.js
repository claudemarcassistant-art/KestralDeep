// ---------- sprites: the art pass toolkit (Batch 5, ported from docs/art/sprite-study.html) ----------
// Shared drawing helpers, written the way the study draws: canvas calls at game pixel size, local frame facing +x.
// Names that the game already used are changed: the study's hash()/rng() are strHash()/artRng() (the game has a tile
// hash()), its px() is pxl(), and its creature palettes will be ART_PAL (PAL is the biome palette table).
// Data (PEOPLE, PLAYER_TINT, ART_LIGHT) is in src/data/art.js. Session 1 uses person() for the player.
const TAU=Math.PI*2;
function strHash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function artRng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function ell(g,x,y,rx,ry,rot,col){g.fillStyle=col;g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,TAU);g.fill();}
function line(g,x1,y1,x2,y2,w,col){g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.lineCap='butt';}
function pxl(g,x,y,col,s){s=s||1;g.fillStyle=col;g.fillRect(x-s/2,y-s/2,s,s);}
// a colour given as an rgba() string is parsed on every fill (about ten times the cost of a hex colour in Chromium),
// so translucent fills use a hex colour and globalAlpha instead
// Contact shadow (batch 6, the study's shadow()): a dark core with a soft edge, alpha x1.75 (at most .78) over a
// 1.18x larger ellipse, drawn from one cached gradient texture. shMode is set around a sprite by its caller
// (drawCreature(), drawPlayerBody()): 0 normal, 1 none (wading, ghosts), 2 flying (lighter, smaller, further below),
// 3 flying over water (a faint shadow on the surface, the study's shadowOnWater()).
let shMode=0,shTexC=null;
function shadowTex(){if(shTexC)return shTexC;const c=shTexC=document.createElement('canvas');c.width=c.height=32;const q=c.getContext('2d'),gr=q.createRadialGradient(16,16,0,16,16,16);
  gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(.62,'rgba(0,0,0,.8)');gr.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=gr;q.fillRect(0,0,32,32);return c;}
function shadow(g,x,y,rx,ry,a){if(shMode===1)return;const A0=g.globalAlpha;let k=Math.min(.78,(a==null?.35:a)*1.75);
  if(shMode===3){g.globalAlpha=A0*.3;ell(g,x,y+1,rx*.8,ry*.6,0,'#000a14');g.globalAlpha=A0;return;}
  if(shMode===2){k*=.45;y+=2.5;rx*=.75;ry*=.75;}
  rx*=1.18;ry*=1.18;const sm=g.imageSmoothingEnabled;g.imageSmoothingEnabled=true;g.globalAlpha=A0*k;g.drawImage(shadowTex(),x-rx,y-ry,rx*2,ry*2);g.globalAlpha=A0;g.imageSmoothingEnabled=sm;}
// Wading (batch 6, the study's wade() and waterline()): a walker in water of wading depth (liq 2-4) casts no floor
// shadow; it is drawn into a small offscreen canvas, its own pixels below the waterline are tinted with the water
// (source-atop, so the floor around it is never touched), and rings spread from it. fn draws with the global ctx in
// screen coordinates; the caller's transform (hulking scale) still applies when the picture is copied back. Flyers
// over water get the surface shadow instead. While an outline ring is being built (olPass) it just draws.
const wdC=document.createElement('canvas'),wdG=wdC.getContext('2d');
function wadeDraw(x,y,r,l,fly,ghost,fn){
  if(ghost){const m=shMode;shMode=1;fn();shMode=m;return;}
  if(fly){const m=shMode;shMode=l>=2?3:2;fn();shMode=m;return;}
  if(l<2||olPass){if(l<2)return fn();const m=shMode;shMode=1;fn();shMode=m;return;}
  const B=Math.ceil(Math.max(14,r*3+8)),S2=B*2;if(wdC.width<S2||wdC.height<S2){wdC.width=Math.max(wdC.width,S2);wdC.height=Math.max(wdC.height,S2);}
  const x0=Math.round(x)-B,y0=Math.round(y)-B,g0=ctx,m=shMode;
  wdG.setTransform(1,0,0,1,0,0);wdG.globalAlpha=1;wdG.globalCompositeOperation='source-over';wdG.clearRect(0,0,S2,S2);wdG.imageSmoothingEnabled=false;wdG.setTransform(1,0,0,1,-x0,-y0);
  ctx=wdG;shMode=1;try{fn();}finally{ctx=g0;shMode=m;}
  const wl=y+r*(l===2?.55:l===3?.1:-.45);wdG.globalCompositeOperation='source-atop';wdG.globalAlpha=l===4?.85:.66;wdG.fillStyle='#163e4e';wdG.fillRect(x0,wl,S2,y0+S2-wl);wdG.globalAlpha=1;wdG.globalCompositeOperation='source-over';
  g0.drawImage(wdC,0,0,S2,S2,x0,y0,S2,S2);
  const t=T+x*.013,A0=g0.globalAlpha;g0.strokeStyle='#aad7e1';g0.lineWidth=.6;g0.globalAlpha=A0*.55;g0.beginPath();g0.ellipse(x,wl,r*1.05+.5,r*.45+.3,0,0,Math.PI);g0.stroke();
  for(let k=0;k<2;k++){const q=(t*.6+k*.5)%1;g0.globalAlpha=A0*.4*(1-q);g0.beginPath();g0.ellipse(x,wl+r*.05,r*(1.1+q*1.4)+.5,r*(.45+q*.55)+.3,0,0,TAU);g0.stroke();}g0.globalAlpha=A0;}
function pxlA(g,x,y,col,a,s){const A0=g.globalAlpha;g.globalAlpha=A0*a;pxl(g,x,y,col,s);g.globalAlpha=A0;}
// a fixed dab layout per key, made once and reused
const DAB={};
function dabs(key,n){if(!DAB[key]){const R=artRng(strHash(key)),arr=[];for(let i=0;i<n;i++){const an=R()*TAU,r=Math.sqrt(R());arr.push({u:Math.cos(an)*r,v:Math.sin(an)*r,s:R(),j:R(),p:R()*TAU});}DAB[key]=arr;}return DAB[key];}
// painterly blob in the current (local) frame; L = direction toward the light, in that frame. The study set a colour
// and drew a rectangle per dab; here dabs are gathered per tone and each tone is filled once as one path (darkest
// first, so lit dabs sit on top), which draws the same dabs about five times faster (Batch 5 session 2).
const paintBuckets=[[],[],[],[],[],[],[],[]];
function paint(g,key,n,x,y,rx,ry,pal,L,t,o){o=o||{};const d=dabs(key,n),lx=Math.cos(L),ly=Math.sin(L),wob=o.wob==null?.2:o.wob,sz=o.size||1.15,np=pal.length;
  ell(g,x,y,rx*.92,ry*.92,0,pal[0]);
  for(let i=0;i<np;i++)paintBuckets[i].length=0;
  for(const q of d){const rr2=q.u*q.u+q.v*q.v;const sh=.42+.42*(q.u*lx+q.v*ly)+.28*(1-rr2)+(q.j-.5)*.5;
    const i=Math.max(0,Math.min(np-1,Math.floor(sh*np)));
    const dx=x+q.u*rx+Math.sin(t*(1.4+q.s)+q.p)*wob,dy=y+q.v*ry+Math.cos(t*(1.2+q.s)+q.p)*wob,s=sz*(.7+q.s*.7);
    paintBuckets[i].push(dx-s/2,dy-s/2,s);}
  for(let i=0;i<np;i++){const B=paintBuckets[i];if(!B.length)continue;g.fillStyle=pal[i];g.beginPath();for(let k=0;k<B.length;k+=3)g.rect(B[k],B[k+1],B[k+2],B[k+2]);g.fill();}}
// soft halo for anything that gives off light (rgb as 'r,g,b')
// (since Batch 5 session 4 the gradient is drawn once per colour into a small canvas and scaled with globalAlpha:
// the same picture as a fresh radial gradient, at a fraction of the cost)
const glowTex={};
function glowCanvas(rgb){let c=glowTex[rgb];if(c)return c;c=glowTex[rgb]=document.createElement('canvas');c.width=c.height=32;const q=c.getContext('2d'),gr=q.createRadialGradient(16,16,0,16,16,16);
  gr.addColorStop(0,'rgba('+rgb+',1)');gr.addColorStop(1,'rgba('+rgb+',0)');q.fillStyle=gr;q.fillRect(0,0,32,32);return c;}
function glow(g,x,y,r,rgb,a){if(!(r>0)||!(a>0))return;const A0=g.globalAlpha;g.globalAlpha=A0*Math.min(1,a);g.drawImage(glowCanvas(rgb),x-r,y-r,r*2,r*2);g.globalAlpha=A0;}
// vertical shading: alpha from top to bottom over h rows
// (cached per top/bottom/height as a 1-pixel-wide strip, stretched to the width)
const vshadeTex={};
function vshade(g,x,y,w,h,top,bot){h=Math.round(h);if(h<=0||w<=0)return;const k0=top+'|'+bot+'|'+h;let c=vshadeTex[k0];
  if(!c){c=vshadeTex[k0]=document.createElement('canvas');c.width=1;c.height=h;const q=c.getContext('2d');for(let k=0;k<h;k++){q.fillStyle='rgba(0,0,0,'+(top+(bot-top)*k/h)+')';q.fillRect(0,k,1,1);}}
  g.drawImage(c,x,y,w,h);}
// direction toward the light for a sprite at world x,y: overhead from the top left on lit decks; on dark decks the
// player's lamp (toward the player; the player itself uses a fixed angle). Same darkness test as the renderer.
function spriteLight(x,y){if(!cond||cond.light!=='dark'||!player)return ART_LIGHT.lit;const dx=player.x-x,dy=player.y-y;return dx*dx+dy*dy<1?ART_LIGHT.selfDark:Math.atan2(dy,dx);}

// ---------- people ----------
// local frame faces +x. o: {arms:'rest'|'aim'|'swing', walk:bool, step:walk phase (overrides t), head:angle,
// cone:bool, hands:[[x,y],[x,y]] (overrides the pose's hands), noGun (the game draws its own gun), swingK (0-1 swing
// progress; overrides the study's looping swing), noBlade (the game draws its own melee weapon), lampCol, under, prop,
// over (callbacks in the local frame), noShadow, noFeet, sit, lean}. Alpha is multiplied, never reset, so cloaks and
// fades on the caller's globalAlpha carry through.
function person(g,x,y,a,t,L,c,o){
  const A0=g.globalAlpha;
  if(!o.noShadow)shadow(g,x+.5,y+2.3,4.6,2.6);
  a+=o.lean||0;g.save();g.translate(x,y);g.rotate(a);const Lr=L-a,lx=Math.cos(Lr),ly=Math.sin(Lr);
  if(o.under)o.under(g,t,Lr);
  const walk=!!o.walk,w=o.step!=null?o.step:t*9,st=walk?Math.sin(w)*1.7:0;
  if(o.cone){const h=o.head||0;g.save();g.rotate(h);const gr=g.createRadialGradient(2,0,0,2,0,34);gr.addColorStop(0,'rgba(255,240,200,.32)');gr.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=gr;g.beginPath();g.moveTo(2,0);g.arc(2,0,34,-.38,.38);g.closePath();g.fill();g.restore();}
  if(o.sit){for(const s of[-1,1]){ell(g,2.2,s*2.3,2.1,1.4,0,c.dark);ell(g,2.2,s*2.3,1.8,1.1,0,c.suit);}ell(g,3.3,0,1.2,1.6,0,c.boot);}
  else if(!o.noFeet){ell(g,st+.3,-1.7,1.5,.95,0,c.boot);ell(g,-st+.3,1.7,1.5,.95,0,c.boot);}
  if(c.tails){const sw=Math.sin(t*2.6)*.7+(walk?Math.sin(w)*.6:0);g.fillStyle=c.tails;g.beginPath();g.moveTo(-.8,-3.4);g.quadraticCurveTo(-4.8,-2.8+sw*.4,-6.3,sw);g.quadraticCurveTo(-4.8,2.8+sw*.4,-.8,3.4);g.closePath();g.fill();}
  if(c.pack){ell(g,-2.7,0,1.7,2.7,0,c.pack);ell(g,-2.7+lx*.5,ly*.6,1,1.8,0,c.packHi);}
  // hands
  // a free hand swings against the steps (right hand forward with the left foot); o.hands entries that are null
  // are free hands, so a person holding something in one hand swings only the other
  let hR,hL,sw=0;const ka=walk?Math.sin(w):Math.sin(t*1.4)*.15,rR=[1+ka*1.6,3.9],rL=[1-ka*1.6,-3.9];
  if(o.arms==='aim'){hR=[4.7,1.0];hL=[3.9,-.5];}
  else if(o.arms==='swing'){const k=o.swingK!=null?o.swingK:(t%.9)/.9;sw=k<.3?-1.4+k/.3*2.8:1.4-(k-.3)/.7*2.8;hR=[Math.cos(sw)*4.3+.4,Math.sin(sw)*4.3+.8];hL=[1.3,-3.7];}
  else{hR=rR;hL=rL;}
  if(o.hands){hR=o.hands[0]||rR;hL=o.hands[1]||rL;}
  if(o.arms==='aim'&&!o.noGun){line(g,3.0,.25,9.4,.25,1.6,'#121514');pxl(g,9.4,.25,'#3a403c',1);}
  // torso
  ell(g,0,0,2.75,4.35,0,c.dark);ell(g,0,0,2.35,3.95,0,c.suit);
  g.globalAlpha=A0*.6;ell(g,lx*.7,ly*1.1,1.5,2.7,0,c.hi);g.globalAlpha=A0;
  if(c.belt)line(g,-.6,-3.3,-.6,3.3,.7,c.belt);
  if(c.strap)line(g,1.6,-3,-1.8,2.8,.8,c.strap);
  if(c.pads){for(const s of[-1,1]){ell(g,.1,s*3.4,1.75,1.45,0,c.dark);ell(g,.1,s*3.4,1.45,1.15,0,c.pads);pxl(g,.1+lx*.6,s*3.4+ly*.5,'#cfd8dc',.8);}}
  if(c.accent){ell(g,1.1,0,1.0,2.1,0,c.accent);}
  // arms (o.wpn draws held armaments first, so the hands sit on their grips)
  if(o.wpn)o.wpn(g,t,Lr);
  for(const [h,s] of [[hR,1],[hL,-1]]){line(g,.5,s*3.0,h[0],h[1],1.5,c.dark);line(g,.5,s*3.0,h[0],h[1],.9,c.suit);ell(g,h[0],h[1],.8,.8,0,c.skin||c.pads||'#9aa4a8');}
  if(o.arms==='swing'&&!o.noBlade){const ex=hR[0]+Math.cos(sw)*6.5,ey=hR[1]+Math.sin(sw)*6.5;line(g,hR[0],hR[1],ex,ey,1.3,'#76828a');pxl(g,ex,ey,'#b8c4c8',.9);
    if((o.swingK!=null?o.swingK:(t%.9)/.9)<.32){g.strokeStyle='rgba(255,240,210,.55)';g.lineWidth=.8;g.beginPath();g.arc(.4,.8,10,-1.4,sw);g.stroke();}}
  if(o.prop)o.prop(g,t,Lr);
  // head
  g.save();g.translate(.35,0);g.rotate(o.head||0);
  ell(g,0,0,2.3,2.3,0,c.dark);ell(g,0,0,1.95,1.95,0,c.head);
  if(c.skin&&!c.lamp&&!c.visor&&!['chef','fedora','pilot','hood'].includes(c.hat))ell(g,1.35,0,.55,1.25,0,c.skin);
  g.globalAlpha=A0*.75;ell(g,Math.cos(Lr-(o.head||0))*.6,Math.sin(Lr-(o.head||0))*.6,.95,.95,0,c.headHi);g.globalAlpha=A0;
  if(c.cap){ell(g,1.9,0,.85,1.7,0,c.cap);}
  if(c.visor){g.strokeStyle=c.visor;g.lineWidth=.9;g.beginPath();g.arc(0,0,1.55,-.95,.95);g.stroke();}
  if(c.lamp)pxl(g,2.3,0,o.lampCol||c.lampCol||'#ffd070',1);
  if(c.hat)HATS[c.hat](g,t,Lr-(o.head||0),c);
  if(c.eye){const e=.5+.5*Math.sin(t*3);pxl(g,1.7,0,'rgba(255,'+Math.round(60+e*40)+',70,'+(.5+e*.5)+')',1);}
  g.restore();
  if(o.over)o.over(g,t,Lr);
  g.restore();
}
// headgear for crew (used from Session 3)
const HATS={
  hood(g,t,L,c){ell(g,-.7,0,2.5,2.4,0,c.dark);ell(g,-.4,0,2.2,2.1,0,c.hood||c.head);const A0=g.globalAlpha;g.globalAlpha=A0*.6;ell(g,Math.cos(L)*.6-.4,Math.sin(L)*.6,1.1,1.1,0,c.headHi);g.globalAlpha=A0;ell(g,1.5,0,.6,1.2,0,'#14110c');},
  chef(g,t,L){ell(g,-.2,0,2.6,2.6,0,'#8e8a80');ell(g,-.2,0,2.3,2.3,0,'#ece8dc');for(const q of dabs('chef',10))pxl(g,-.2+q.u*1.8,q.v*1.8,q.j>.5?'#ffffff':'#d8d2c4',.9);},
  fedora(g,t,L){ell(g,0,0,3.3,3.1,0,'#1c1c24');ell(g,0,0,1.9,1.8,0,'#3a3a48');g.strokeStyle='#121218';g.lineWidth=.6;g.beginPath();g.arc(0,0,1.9,0,TAU);g.stroke();pxl(g,Math.cos(L)*.8,Math.sin(L)*.8,'#5a5a6e',.9);},
  cap(g,t,L){ell(g,0,0,2.05,2.05,0,'#2a3a2a');ell(g,1.9,0,.9,1.7,0,'#22301f');pxl(g,Math.cos(L)*.7,Math.sin(L)*.7,'#4a5e44',.9);},
  band(g,t){g.strokeStyle='#b84040';g.lineWidth=.7;g.beginPath();g.arc(0,0,1.7,0,TAU);g.stroke();},
  visor(g,t){ell(g,-.1,0,2.05,2.05,0,'#3a4a30');g.strokeStyle='#d9a441';g.lineWidth=1;g.beginPath();g.arc(0,0,1.6,-1,1);g.stroke();},
  pilot(g,t,L){ell(g,0,0,2.2,2.2,0,'#4a2e1a');ell(g,0,0,1.95,1.95,0,'#7a4a2a');line(g,-1.8,0,1.8,0,.7,'#e0a040');const A0=g.globalAlpha;g.globalAlpha=A0*.6;pxl(g,Math.cos(L)*.8,Math.sin(L)*.8,'#c08a5a',1);g.globalAlpha=A0;g.strokeStyle='#2a1a10';g.lineWidth=.8;g.beginPath();g.arc(0,0,1.7,-.8,.8);g.stroke();}
};

// ---------- the player ----------
// Pose from game state: a melee swing in progress (swingT) -> swing, timed to the real swing; holding or aiming a gun
// -> aim; otherwise rest. Feet step with the distance actually moved. Tints (hurt, adrenaline, night optics) are
// variants of PEOPLE.a, made once. Hands and held armaments come from armHold() (52-arm-art.js): melee in the right
// hand, an off-hand gun forward in the left, both hands on two-handed armaments and on guns when the right is free.
let plStep=0,plLX=null,plLY=null,plMoving=0;
const plCfgCache={};
function playerCfg(){const p=player,k=(p.hurtT>0.2?'h':p.adrenT>0?'a':'n')+(p.gear&&p.gear.head==='nvg'?'v':'');
  if(!plCfgCache[k]){const c=Object.assign({},PEOPLE.a);if(k[0]==='h')Object.assign(c,PLAYER_TINT.hurt);else if(k[0]==='a')Object.assign(c,PLAYER_TINT.adren);if(k[1]==='v')Object.assign(c,PLAYER_TINT.nvg);plCfgCache[k]=c;}return plCfgCache[k];}
function playerPose(){const p=player,set=p.arms[p.armSet],m=set.main;
  if(plLX!=null){const d=Math.hypot(p.x-plLX,p.y-plLY);if(d<20){plStep+=d*0.55;plMoving=d>0.05?0.12:Math.max(0,plMoving-1/60);}}plLX=p.x;plLY=p.y;
  const o={walk:plMoving>0,step:plStep,noGun:true,noBlade:true,lampCol:p.gear&&p.gear.head==='nvg'?PLAYER_TINT.nvg.lampCol:null};
  // hands and held armaments from armHold() (52-arm-art.js); with nothing held, the arms rest (or swing for a punch)
  const H=armHold();o.arms=H.items.length?'aim':'rest';if(H.hands)o.hands=H.hands;o.held=H.items;
  return o;}
