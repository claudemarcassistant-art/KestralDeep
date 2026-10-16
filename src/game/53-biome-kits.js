// ---------- biome kits and room lights (Batch 5, the study's tilesKit(), placeLights(), drawLights(), drawCeiling()) ----------
// Tiles: each biome (KITS in src/data/art.js, same order as PAL) mixes 7 floor styles, 3 corridor styles and 6 wall
// styles. Each room picks its floor style by weight and each run of front wall picks its wall style by weight. The
// picks come from a hash of the deck's own seed value (`seed`, drawn during generation just before paintMap()) and
// the room or wall position, so the same run seed gives the same floors without drawing any extra random numbers
// (which would shift everything generated after them). Module rooms (kind >= 5) keep their own floors; below-deck
// rooms (kind 4) use the corridor style, darkened. Everything is painted into the cached tile canvas (mcv) by
// paintTile(); only the Relay Core rack lights blink, drawn per frame for the racks on screen (kitLeds).
// Room lights: placed per deck by placeRoomLights() (end of paintMap(), positions from the layout and the hash, no
// draws), drawn by drawRoomLights() just before the fog: a dimming layer with the pools cut out (each pool clipped to
// its room), a faint coloured glow in each pool, the wall lamps (caged lamps, status strips) and, last, the
// see-through ceiling fixtures with a little parallax. Visual only: they change nothing about light radius, fog,
// creature sight or cond.light. On dark decks (dark condition or the breaker thrown) they are dead housings, and
// about one in ten flickers weakly.
let kitSalt=0,kitRoomOf=null,kitRoomFS=[],kitLeds=new Map(),roomLights=[];
const kitIdx=()=>biomeOverride!=null?biomeOverride:(depth-1)%PAL.length;
function curKit(){return KITS[kitIdx()]||KITS[0];}
function kitPick(list,h){let tot=0;for(const e of list)tot+=e[1];let v=(h>>>0)%tot;for(const e of list){if(v<e[1])return e[0];v-=e[1];}return list[0][0];}
// rooms are looked up per tile, and each room's floor style picked once, whenever the whole deck is painted
function kitPrep(){const K=curKit();kitSalt=((seed|0)^0x5bd1e995)>>>0;kitLeds=new Map();kitRoomOf=new Int16Array(MW*MH).fill(-1);
  kitRoomFS=(rooms||[]).map((r,i)=>{for(let y=Math.max(0,r.y);y<Math.min(MH,r.y+r.h);y++)for(let x=Math.max(0,r.x);x<Math.min(MW,r.x+r.w);x++)kitRoomOf[y*MW+x]=i;return kitPick(K.floors,hash(kitSalt%9973+i*7,r.x*31+r.y*17));});}
function kitFloorOf(i){if(!kitRoomOf)return curKit().floors[0][0];const r=kitRoomOf[i];return r>=0&&kitRoomFS[r]?kitRoomFS[r]:curKit().floors[0][0];}
// a run of front wall: walk left to its first tile, so the whole run shares one style
function kitWallOf(x,y){let xs=x;while(xs>0&&solid(xs-1,y)&&!solid(xs-1,y+1)&&x-xs<40)xs--;return kitPick(curKit().walls,hash(kitSalt%9973+xs*13,y*29+7));}
const KIT_FL={
  panel(px,py,x,y,h,P,K){R(P.fl,px,py,TS,TS);tW(((h>>>3)%5)*.006,px,py,TS,TS);if(x%2===0)R(P.hi,px,py,1,TS);else R(P.lo,px+TS-1,py,1,TS);if(y%2===0)R(P.hi,px,py,TS,1);else R(P.lo,px,py+TS-1,TS,1);
    if(x%2===1)tC(P.lo,.5,px,py+1,1,TS-2);if(y%2===1)tC(P.lo,.5,px+1,py,TS-2,1);const cx=x%2===0?px+2:px+TS-3,cy=y%2===0?py+2:py+TS-3;R(P.riv,cx,cy,1,1);
    for(let k=0;k<5;k++){const q=(h>>>(k*5))&31;tW(.025+(q%3)*.01,px+(q%11),py+((q*7)%11),1+(k%2),1);}const v=h%37;
    if(v<3){R(P.lo,px+3,py+3,6,6);R(P.gr,px+4,py+4,4,1);R(P.gr,px+4,py+6,4,1);R(P.hi,px+3,py+8,6,1);}else if(v<9){let a=px+3+(h>>>8)%4,b=py+2;for(let k=0;k<7;k++){R(P.lo,a,b,1,1);b++;a+=((h>>>k)&1)?1:-1;if(a<px+1||a>px+10)break;}}},
  tread(px,py,x,y,h,P,K){R(P.fl,px,py,TS,TS);for(let i=0;i<4;i++)for(let j=0;j<4;j++){const ax=px+1+i*3,ay=py+1+j*3;if((i+j)%2){tW(.1,ax,ay,2,1);tA(.25,ax,ay+1,2,1);}else{tW(.1,ax,ay,1,2);tA(.25,ax+1,ay,1,2);}}
    if(x%3===0)R(P.lo,px,py,1,TS);if(y%3===0)R(P.lo,px,py,TS,1);if(h%5===0)tW(.05,px+2,py+5,7,2);},
  concrete(px,py,x,y,h,P,K){R(P.fl,px,py,TS,TS);tC(P.hi,.4,px,py,TS,TS);for(let k=0;k<9;k++){const q=(h>>>(k*3))&127;(k%2?tW:tA)(.05+(q%3)*.02,px+(q%11),py+((q>>2)%11),1+(q%2),1);}
    if(x%3===0)tC(P.lo,.9,px,py,1,TS);if(y%3===0)tC(P.lo,.9,px,py,TS,1);
    if(h%7===0){mctx.globalAlpha=.14;mctx.fillStyle='#000';mctx.beginPath();mctx.ellipse(px+6,py+6,4,2.5,h%3,0,TAU);mctx.fill();mctx.globalAlpha=1;}
    if(h%29===0){mctx.fillStyle='#0a0c0b';mctx.beginPath();mctx.arc(px+6,py+6,2.5,0,TAU);mctx.fill();R(P.sl,px+4,py+5,5,1);R(P.sl,px+4,py+7,5,1);}
    if(K.lanes&&y%4===2){for(let k=0;k<TS;k+=4)tC('#b08a2e',.65,px+k,py+5,2,2);}},
  mesh(px,py,x,y,h,P,K){R(P.sl,px,py,TS,TS);mctx.globalAlpha=.75;mctx.fillStyle='#060807';for(let i=1;i<TS;i+=2)for(let j=1;j<TS;j+=2)mctx.fillRect(px+i+((j>>1)%2),py+j,1,1);mctx.globalAlpha=1;
    R(P.hi,px,py,TS,1);R(P.hi,px,py,1,TS);R(P.lo,px+TS-1,py,1,TS);R(P.lo,px,py+TS-1,TS,1);for(const [a,b] of [[1,1],[10,1],[1,10],[10,10]])R(P.riv,px+a,py+b,1,1);},
  ceramic(px,py,x,y,h,P,K){R(P.lo,px,py,TS,TS);for(let i=0;i<3;i++)for(let j=0;j<3;j++){const q=(h>>>((i*3+j)*2))&3,ax=px+i*4,ay=py+j*4;
      if(h%31===0&&i===1&&j===2){R('#0c0e0d',ax,ay,3,3);continue;}R(P.hi,ax,ay,3,3);tC(q&1?'#ffffff':'#000000',.04+(q>>1)*.03,ax,ay,3,3);tW(.06,ax,ay,3,1);}
    if(h%13===0){R(P.lo,px+5,py+2,1,2);R(P.lo,px+6,py+4,1,2);}if(K.frost)for(let k=0;k<3;k++){const q=(h>>>(k*7))&63;tC('#e4f2ff',.25,px+(q%11),py+((q>>2)%11),1,1);}},
  ribbed(px,py,x,y,h,P,K){R(P.gr,px,py,TS,TS);tC(P.fl,.6,px,py,TS,TS);for(let k=1;k<TS;k+=2)tW(.06,px+1,py+k,TS-2,1);if(x%2===0)R(P.lo,px,py,1,TS);if(y%3===0)R(P.lo,px,py,TS,1);
    if(K.frost)for(let k=0;k<5;k++){const q=(h>>>(k*5))&31;tC('#e4f2ff',.28,px+(q%11),py+((q*3)%11),1,1);}},
  duckboard(px,py,x,y,h,P,K){R('#081216',px,py,TS,TS);if(h%3===0)tC('#4a8a8a',.4,px+((h>>>4)%10),py+3,1,1);for(let k=0;k<3;k++){const ax=px+k*4;R('#3e3828',ax,py,3,TS);R('#5a5240',ax,py,1,TS);tA(.25,ax+2,py,1,TS);
      R('#2a2418',ax,py+((h>>>(k*3))%2?5:8),3,1);R('#8a8478',ax+1,py+2,1,1);R('#8a8478',ax+1,py+9,1,1);}if(K.wet)tW(.05,px,py+1,TS,2);}};
const KIT_CORR={
  grate(px,py,x,y,h,P,K,vert){R(P.gr,px,py,TS,TS);for(let k=1;k<TS;k+=2){if(vert){R(P.sl,px+k,py+1,1,TS-2);tW(.06,px+k,py+1,1,1);}else{R(P.sl,px+1,py+k,TS-2,1);tW(.07,px+1,py+k,TS-2,.5);}}R(P.lo,px,py,TS,1);R(P.lo,px,py,1,TS);},
  catwalk(px,py,x,y,h,P,K,vert){R('#070909',px,py,TS,TS);if(h%4===0)tC('#3a3628',.6,px+2,py+4,8,3);const ox=vert?px+2:px,oy=vert?py:py+2,w=vert?8:TS,hh=vert?TS:8;
    R(P.sl,ox,oy,w,hh);mctx.globalAlpha=.7;mctx.fillStyle='#060807';for(let i=0;i<w;i+=2)for(let j=0;j<hh;j+=2)mctx.fillRect(ox+i+((j>>1)%2),oy+j,1,1);mctx.globalAlpha=1;
    if(vert){R(P.hi,px+1,py,1,TS);R(P.hi,px+10,py,1,TS);R(P.cap,px+1,py+5,1,2);R(P.cap,px+10,py+5,1,2);}else{R(P.hi,px,py+1,TS,1);R(P.hi,px,py+10,TS,1);R(P.cap,px+5,py+1,2,1);R(P.cap,px+5,py+10,2,1);}},
  grille(px,py,x,y,h,P,K){R(P.gr,px,py,TS,TS);for(let k=1;k<TS;k+=3){R(P.sl,px+k,py,1,TS);R(P.sl,px,py+k,TS,1);tW(.05,px+k,py,1,TS);}R(P.lo,px,py,TS,1);}};
function wallGrad(px,py,a){for(let k=0;k<TS;k++)tA(k/TS*a,px,py+k,TS,1);}
const KIT_WALL={
  pipes(px,py,x,y,h,P,K){R(P.face,px,py,TS,TS);wallGrad(px,py,.22);R(P.cap,px,py,TS,2);tW(.12,px,py,TS,1);R(P.faceHi,px,py+2,TS,1);if(x%2===0)R(P.faceLo,px,py+3,1,TS-5);
    const pr=hash(3,y)%3!==1;if(pr){R(P.pipe,px,py+6,TS,2);R(P.pipeHi,px,py+6,TS,1);tA(.3,px,py+8,TS,1);if(x%4===0){R(P.pipe,px+4,py+5,2,4);R(P.pipeHi,px+4,py+5,2,1);}if(h%3===0)tC('#6e401e',.55,px+2+(h%7),py+8,1,2);if(h%13===0)tC('#78a096',.35,px+7,py+8,1,2);}
    else if(h%8===0){R(P.faceLo,px+3,py+4,6,5);for(let k=0;k<3;k++)R(P.face,px+4,py+5+(k*1.5|0),4,1);}if(h%23===0&&!pr){R(P.acc,px+5,py+4,2,2);tC(P.acc,.12,px+3,py+3,6,4);}},
  bulkhead(px,py,x,y,h,P,K){R(P.face,px,py,TS,TS);wallGrad(px,py,.2);R(P.cap,px,py,TS,2);tW(.12,px,py,TS,1);if(x%2===0){R(P.faceLo,px,py+2,1,TS-4);tW(.05,px+1,py+2,1,TS-4);}
    for(let k=1;k<TS;k+=2){R(P.faceHi,px+k,py+3,1,1);tA(.4,px+k,py+4,1,1);R(P.faceHi,px+k,py+8,1,1);tA(.4,px+k,py+9,1,1);}R(P.faceLo,px,py+6,TS,1);if(h%11===0){R(P.acc,px+3,py+5,1,1);R(P.acc,px+5,py+5,3,1);}},
  concrete(px,py,x,y,h,P,K){R(P.face,px,py,TS,TS);tC(P.faceHi,.35,px,py,TS,TS);wallGrad(px,py,.18);R(P.cap,px,py,TS,2);for(let k=0;k<6;k++){const q=(h>>>(k*4))&63;(k%2?tW:tA)(.06,px+(q%11),py+3+((q>>2)%7),1,1);}
    if(x%3===1){tA(.5,px+3,py+5,1,1);tA(.5,px+8,py+5,1,1);}if(h%3===0){R(P.pipe,px+7,py+2,1,TS-4);R(P.pipeHi,px+7,py+2,1,1);if(h%9===0){R('#1e2220',px+5,py+5,5,3);R(P.acc,px+6,py+6,2,1);}}if(h%5===0)tA(.18,px+2,py+2,2,TS-5);},
  subway(px,py,x,y,h,P,K){R('#8a9498',px,py,TS,TS);R('#c8d0d4',px,py,TS,1);
    for(let row=0;row<5;row++){const ty=py+1+row*2,off=(row+y)%2?2:0,shade=row*.035;for(let tx=-off;tx<TS;tx+=4){const gx=px+tx,q=(h>>>((row*4+((tx+4)>>2))%28))&31;
      let c='#e4eaec',hi='#ffffff';if(q===5){c='#d6d2b8';hi='#e6e2ca';}if(q===11&&h%3===0){c='#30363a';hi=c;}
      const x0=Math.max(px,gx),x1=Math.min(px+TS,gx+3);if(x1>x0){R(c,x0,ty,x1-x0,1);if(gx>=px)R(hi,gx,ty,1,1);tA(shade,x0,ty,x1-x0,1);}}}
    if(h%7===0)tC('#6a5a3a',.22,px+(h%9)+1,py+2,1,7);R('#2c3436',px,py+TS-1,TS,1);
    if(K.frost)for(let k=0;k<2;k++){const q=(h>>>(k*7))&63;tC('#ffffff',.8,px+(q%11),py+1+((q>>3)%9),1,1);}},
  corroded(px,py,x,y,h,P,K){R(P.face,px,py,TS,TS);wallGrad(px,py,.22);R(P.cap,px,py,TS,2);
    if(h%3===0){mctx.globalAlpha=.5;mctx.fillStyle='#6e3a1e';mctx.beginPath();mctx.ellipse(px+3+(h%6),py+6,2.5,2,0,0,TAU);mctx.fill();mctx.globalAlpha=1;}for(let k=0;k<3;k++){const q=(h>>>(k*6))&63;tC('#d8dccc',.32,px+(q%11),py+2,1,2+(q%6));}
    if(h%4===1)tC('#4a8a6a',.5,px+(h%10),py+2,1,4+(h%4));if(h%7===0)R('#060706',px+(h%9)+1,py+7,2,1);R(P.faceLo,px,py+TS-2,TS,2);},
  rack(px,py,x,y,h,P,K){R('#0c0f12',px,py,TS,TS);R(P.cap,px,py,TS,2);R(P.faceHi,px,py+2,TS,1);R(P.faceLo,px+1,py+3,1,TS-5);R(P.faceLo,px+10,py+3,1,TS-5);const L=[];
    for(let k=py+4;k<py+TS-2;k+=2){R('#161b20',px+2,k,8,1);const q=(h>>>((k-py)*2))&7;if(q<5)L.push({x:px+3+((q*3)%6),y:k,c:['#7fffa0','#ffd070','#7fe8ff','#7fffa0','#ff6a5a'][q],ph:(h%97)/9+k});}
    tA(.3,px,py+TS-3,TS,1);if(L.length)kitLeds.set(y*MW+x,L);}};
// a room or corridor floor tile in the deck's kit (paintTile() calls this for map 0, kind < 5)
function kitFloor(x,y,px,py,h,P,i){const K=curKit(),kd=kind[i];
  if(kd>=1&&kd<=3){const st=kitFloorOf(i);KIT_FL[st](px,py,x,y,h,P,K);
    // the old room variants that every style keeps: puddle stains, rust, the cable across a room
    if(st!=='duckboard'){const v=h%37;if(v>=3&&v<6){tC('#46788a',.2,px+2,py+4,7,4);tC('#bee1e6',.4,px+4,py+4,2,1);}else if(v===9||v===10){tC('#784623',.22,px+1+(h%4),py+3,5,4);tC('#965a28',.18,px+2+(h%4),py+4,2,2);}}
    if(hash(777,y)%9===0){for(let k=0;k<TS;k++){const yy=py+6+Math.round(Math.sin((px+k)*0.21)*2);R('#0a0c0b',px+k,yy,1,1);if(k%3===0)R(P.hi,px+k,yy-1,1,1);}}return;}
  const vert=solid(x-1,y)&&solid(x+1,y);KIT_CORR[K.corr](px,py,x,y,h,P,K,vert);
  // the old grate variants: drain stains, a wet glint, a hole
  if(h%3===0){if(vert)tC('#5a503c',.25,px+3,py,3,TS);else tC('#5a503c',.25,px,py+5,TS,3);}if(h%11===0)tC('#6eaab4',.3,px+3+(h%5),py+4,2,1);if(h%17===0)R('#0a0c0b',px+2,py+2,3,3);
  if(kd===4)tA(.25,px,py,TS,TS);}
// a front wall face in the deck's kit (wallTile() calls this); the edges, base and hazard stripes are shared
function kitWall(x,y,px,py,h,P){const K=curKit();kitLeds.delete(y*MW+x);KIT_WALL[kitWallOf(x,y)](px,py,x,y,h,P,K);
  tA(.25,px,py+TS-1,TS,1);if(hash(9,y)%4===0)for(let k=0;k<TS;k++)if(((px+k)>>1)%2===0)R('#6b5220',px+k,py+TS-2,1,1);
  if(!solid(x-1,y))R(P.faceHi,px,py,1,TS);if(!solid(x+1,y))R(P.faceLo,px+TS-1,py,1,TS);}

// ---------- room lights ----------
const RL_WALL={cage:1,status:1};
function placeRoomLights(){roomLights=[];if(arcadeMode)return;const K=curKit(),Ts=TS,C=ROOM_LIGHT_CFG,H=(a,b)=>hash(kitSalt%9973+a,b);
  const clip=r=>[r.x*Ts,r.y*Ts,r.w*Ts,r.h*Ts];
  const topWalls=r=>{const out=[];for(let x=r.x;x<r.x+r.w;x++)if(r.y>0&&solid(x,r.y-1)&&map[(r.y-1)*MW+x]===1)out.push(x);return out;};
  const add=l=>{l.weak=H(Math.round(l.x),Math.round(l.y)*3)%10===0;roomLights.push(l);};
  (rooms||[]).forEach((r,i)=>{if(r.w<2||r.h<2)return;const k0=kind[(r.y+(r.h>>1))*MW+r.x+(r.w>>1)];if(k0>=5||k0===4)return;
    const cx=(r.x+r.w/2)*Ts,cy=(r.y+r.h/2)*Ts,cl=clip(r);
    if(K.light==='sodium'){const n=r.w>6?2:1;for(let k=0;k<n;k++)add({kind:'sodium',x:(r.x+r.w*(k+1)/(n+1))*Ts,y:cy,rx:30,ry:26,rgb:'255,184,104',ph:i*3+k,clip:cl});}
    if(K.light==='cage'){for(const x of topWalls(r))if((x-r.x)%3===1)add({kind:'cage',x:(x+.5)*Ts,y:r.y*Ts-3,rx:22,ry:20,half:true,rgb:'236,232,206',ph:x,flick:H(x,r.y)%5===1?.5:0,clip:cl});}
    if(K.light==='strip'){const n=Math.max(1,Math.floor(r.h/2));for(let k=0;k<n;k++){const yy=(r.y+(k+.5)*r.h/n)*Ts;add({kind:'strip',x:cx,y:yy,len:Math.max(10,Math.min(r.w*Ts-14,60)),rx:Math.min(r.w*Ts*.55,42),ry:14,rgb:'212,244,232',ph:i*7+k,flick:H(i,k)%6===0?.8:0,clip:cl});}}
    if(K.light==='panel'){for(let a=r.x+1;a<r.x+r.w;a+=4)for(let b=r.y+1;b<r.y+r.h;b+=3)add({kind:'panelL',x:(a+.5)*Ts,y:(b+.5)*Ts,rx:17,ry:17,square:true,rgb:'196,224,255',ph:a+b,dim:.75,clip:cl});}
    if(K.light==='teal'){if(H(i,r.x)%4!==0)add({kind:'teal',x:(r.x+r.w*.35)*Ts,y:(r.y+r.h*.45)*Ts,rx:24,ry:21,rgb:'120,224,184',ph:i*2,pulse:.35,flick:H(i,7)%3===0?.6:0,clip:cl});}
    if(K.light==='status'){for(const x of topWalls(r))add({kind:'status',x:(x+.5)*Ts,y:r.y*Ts+1,rx:9,ry:6,half:true,rgb:'170,124,255',ph:x*.7,pulse:.3,clip:cl});}});
  // a few corridor lights, spaced apart
  if(K.light!=='status'){const got=[];for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){const i=y*MW+x;if(map[i]!==0||kind[i]!==0||H(x,y)%C.corrEvery!==0)continue;
    if(got.some(([a,b])=>Math.abs(a-x)+Math.abs(b-y)<C.corrApart))continue;
    if(K.light==='cage'){if(!(solid(x,y-1)&&map[i-MW]===1))continue;add({kind:'cage',x:(x+.5)*Ts,y:y*Ts-3,rx:18,ry:16,half:true,rgb:'236,232,206',ph:x+y,flick:.7});}
    else add({kind:K.light==='panel'?'panelL':K.light,x:(x+.5)*Ts,y:(y+.5)*Ts,rx:18,ry:16,len:12,square:K.light==='panel',rgb:K.light==='sodium'?'255,184,104':K.light==='strip'?'212,244,232':K.light==='panel'?'196,224,255':'120,224,184',ph:x*1.3+y,pulse:K.light==='teal'?.5:0,dim:K.light==='panel'?.6:1,flick:K.light==='teal'?.6:0});
    got.push([x,y]);}}}
// brightness 0-1 now: slow pulse, and irregular flicker bursts (never on a fixed beat)
function lightLevel(l,t){let v=l.dim||1;if(l.pulse)v*=1-l.pulse*(.5+.5*Math.sin(t*1.3+l.ph));
  if(l.flick){const k=Math.floor(t*14+l.ph*13),q=((Math.sin(k*12.9898+l.ph*7.1)*43758.5453)%1+1)%1;const burst=Math.sin(t*.7+l.ph)>.55;if(burst&&q<l.flick*.6)v*=.15+q*.5;}return v;}
// pool textures (64 px, unit circle, half circle or square), made once: white ones for cutting the dimming layer,
// tinted ones for the glow
const poolTex={};
function poolCanvas(shape,rgb){const key=shape+'|'+(rgb||'');if(poolTex[key])return poolTex[key];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  g.translate(32,32+(shape==='half'?0:0));g.scale(32,32);const gr=g.createRadialGradient(0,shape==='half'?-.15:0,0,0,0,1),col=rgb||'0,0,0',mid=rgb?.45:.7;
  gr.addColorStop(0,'rgba('+col+',1)');gr.addColorStop(shape==='square'?.7:.55,'rgba('+col+','+mid+')');gr.addColorStop(1,'rgba('+col+',0)');g.fillStyle=gr;
  g.beginPath();if(shape==='half')g.ellipse(0,0,1,1,0,0,Math.PI);else if(shape==='square')g.rect(-1,-1,2,2);else g.arc(0,0,1,0,TAU);g.fill();return poolTex[key]=c;}
function poolAt(g,l,sx,sy,a,rgb){if(a<=0)return;const sh=l.half?'half':l.square?'square':'round';g.globalAlpha=Math.min(1,a);g.drawImage(poolCanvas(sh,rgb),sx-l.rx,sy+(l.half?2:0)-l.ry,l.rx*2,l.ry*2);}
let rlCv=null;
function lightSeen(l){const tx=Math.floor(l.x/TS),ty=Math.floor((l.y+3)/TS);for(const [dx,dy] of [[0,0],[0,1],[0,-1]]){const x=tx+dx,y=ty+dy;if(x>=0&&y>=0&&x<MW&&y<MH&&seen[y*MW+x])return true;}return false;}
// rack lights, room pools, wall lamps and ceiling fixtures; called in render() just before the fog
function drawRoomLights(){const t=T,C=ROOM_LIGHT_CFG,dark=cond&&cond.light==='dark'||powerOff;
  // Relay Core rack lights (only the racks on screen)
  if(kitLeds.size){const tx0=Math.max(0,Math.floor(camX/TS)),ty0=Math.max(0,Math.floor(camY/TS)),tx1=Math.min(MW-1,Math.floor((camX+W)/TS)),ty1=Math.min(MH-1,Math.floor((camY+H)/TS));
    for(let y=ty0;y<=ty1;y++)for(let x=tx0;x<=tx1;x++){const L=kitLeds.get(y*MW+x);if(!L||!seen[y*MW+x])continue;
      for(const d of L){if(dark&&d.ph%7>2)continue;if(Math.sin(t*(2+d.ph%3)+d.ph)<=-.3)continue;const sx=d.x-camX,sy=d.y-camY;ctx.fillStyle=d.c;ctx.fillRect(sx,sy,1,1);ctx.globalAlpha=.25;ctx.fillRect(sx-1,sy-1,3,3);ctx.globalAlpha=1;}}}
  if(!roomLights.length)return;
  const vis=[];for(const l of roomLights){const sx=l.x-camX,sy=l.y-camY;if(sx<-l.rx-20||sy<-l.ry-20||sx>W+l.rx+20||sy>H+l.ry+20)continue;if(!lightSeen(l))continue;
    const v=dark?(l.weak?lightLevel(Object.assign({},l,{flick:.9}),t)*.35:0):lightLevel(l,t);vis.push([l,sx,sy,v]);}
  // the dimming layer with the pools cut out (lit and normal decks), then a faint glow in each pool
  const dim=dark?0:cond&&cond.light==='lit'?C.dimLit:C.dimNormal;
  if(dim>0){if(!rlCv)rlCv=document.createElement('canvas');if(rlCv.width!==W||rlCv.height!==H){rlCv.width=W;rlCv.height=H;}const m=rlCv.getContext('2d');
    m.globalCompositeOperation='source-over';m.globalAlpha=1;m.clearRect(0,0,W,H);m.fillStyle='#030507';m.globalAlpha=dim;m.fillRect(0,0,W,H);m.globalCompositeOperation='destination-out';
    for(const [l,sx,sy,v] of vis){if(l.clip){m.save();m.beginPath();m.rect(l.clip[0]-camX,l.clip[1]-camY,l.clip[2],l.clip[3]);m.clip();poolAt(m,l,sx,sy,v);m.restore();}else poolAt(m,l,sx,sy,v);}
    m.globalCompositeOperation='source-over';m.globalAlpha=1;ctx.drawImage(rlCv,0,0);}
  ctx.globalCompositeOperation='lighter';
  for(const [l,sx,sy,v] of vis){if(v<=0)continue;if(l.clip){ctx.save();ctx.beginPath();ctx.rect(l.clip[0]-camX,l.clip[1]-camY,l.clip[2],l.clip[3]);ctx.clip();poolAt(ctx,l,sx,sy,C.tint*v,l.rgb);ctx.restore();}else poolAt(ctx,l,sx,sy,C.tint*v,l.rgb);}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  // wall lamps sit on the walls
  for(const [l,sx,sy,v] of vis){if(!RL_WALL[l.kind])continue;
    if(l.kind==='cage'){F('#1a1c1a',sx-2.5,sy-2,5,4);FA('#f0ecd2',.25+.75*v,sx-1.5,sy-1,3,2);F('#2a2e2c',sx-1.5,sy-1,3,.5);F('#2a2e2c',sx-.25,sy-1,.5,2);if(v>.05)glow(ctx,sx,sy,4,l.rgb,.25*v);}
    if(l.kind==='status'){FA('#b48cff',.3+.7*v,sx-5,sy-.5,10,1);}}
  // ceiling fixtures: above everything, mostly see-through, nudged away from the middle of the view
  for(const [l,sx0,sy0,v] of vis){if(RL_WALL[l.kind])continue;const x=sx0+(sx0-W/2)*C.parallax,y=sy0+(sy0-H/2)*C.parallax;
    ctx.globalAlpha=C.ceil;
    if(l.kind==='sodium'){line(ctx,x,y-2.6,x,y-9,.6,'#3a3a36');ctx.fillStyle='#14110c';circ(x,y,2.8);ctx.fillStyle='#2a2620';circ(x-.6,y-.6,1.6);}
    if(l.kind==='strip'){F('#16191a',x-l.len/2-1,y-1.5,l.len+2,3);F('#3a403e',x-l.len/2-1,y-1.5,1.5,3);F('#3a403e',x+l.len/2-.5,y-1.5,1.5,3);for(let k=-l.len/2+8;k<l.len/2;k+=16)line(ctx,x+k,y-1.5,x+k,y-5,.5,'#3a3a36');}
    if(l.kind==='panelL')F('#141a20',x-3.5,y-3.5,7,7);
    if(l.kind==='teal'){line(ctx,x,y-2.4,x+1,y-8,.6,'#2a3430');ctx.fillStyle='#0c1412';circ(x,y,2.6);}
    // the lit part stays a little stronger, so the light still reads as coming from it
    ctx.globalAlpha=C.ceilLit*(.3+.7*v);
    if(v>0){if(l.kind==='sodium'){ctx.fillStyle='#ffc478';circ(x,y,1.6);F('#fff0d2',x-.5,y-.5,1,1);}
      if(l.kind==='strip')F('#dcfaf0',x-l.len/2,y-.5,l.len,1);
      if(l.kind==='panelL'){F('#cee6ff',x-3,y-3,6,6);F('#7896b4',x-.25,y-3,.5,6);F('#7896b4',x-3,y-.25,6,.5);}
      if(l.kind==='teal'){ctx.fillStyle='#82e6be';circ(x,y,1.4);}}
    ctx.globalAlpha=1;if(v>0)glow(ctx,x,y,5,l.rgb,.12*v);}}
