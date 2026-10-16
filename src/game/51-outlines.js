// ---------- sprite outlines (Batch 5 session 4; Options > Sprite outlines, OPTS.outlines, off by default) ----------
// olDraw(key,col,x0,y0,w,h,fn) draws one sprite (fn draws it on the global ctx) with a one-pixel ring around its outer
// edge in col. The study rebuilt every ring from scratch each frame (OL()); here:
// - the sprite is drawn once into a small offscreen canvas (willReadFrequently, so reading it back is a plain memory
//   read), its solid pixels (alpha above OL_CFG.solid: soft shadows, glows and halos fall below it) are flood-filled
//   from the border so that only the outside gets a ring (gaps between paint dabs stay as they are), and the ring is
//   kept as a list of pixels and drawn as one path of 1x1 rects in col;
// - a sprite whose shape does not change from frame to frame (items, interactables) passes a key, and its ring is
//   cached under that key, so it costs one path fill a frame; key null rebuilds the ring every frame (creatures,
//   people), and the offscreen pass runs with olPass set so per-frame bookkeeping in the drawing code is not doubled;
// - drawing a painted creature into the offscreen canvas is the costly part (~0.2 ms: it is drawn in software so it
//   can be read back), so a creature or person passes itself as the key: its ring is kept for it (olInst, a WeakMap, so nothing lands in a saved run) and moved
//   with it, and rebuilt every OL_CFG.reuse seconds (about every third frame, staggered), which kept 40 crowded
//   creatures at 60 fps. Between rebuilds the ring can lag a turning sprite by a fraction of a pixel.
// The ring is worked out in canvas pixels through the current transform, so scaled sprites (hulking creatures,
// falling items) are outlined at their drawn size. With the option off, olDraw() is just fn().
const OL_CFG={solid:150,alpha:.92,maxCache:800,reuse:.05};
let olPass=false;
const olCv=document.createElement('canvas'),olG=olCv.getContext('2d',{willReadFrequently:true});olCv.width=olCv.height=64;
const olCache=new Map(),olInst=new WeakMap();
let olMask=new Uint8Array(0),olExt=new Uint8Array(0),olQ=new Int32Array(0);
function olRing(fn,m,bx,by,bw,bh){
  if(olCv.width<bw||olCv.height<bh){olCv.width=Math.max(olCv.width,bw);olCv.height=Math.max(olCv.height,bh);}
  olG.setTransform(1,0,0,1,0,0);olG.globalAlpha=1;olG.globalCompositeOperation='source-over';olG.clearRect(0,0,bw,bh);olG.imageSmoothingEnabled=false;
  olG.setTransform(m.a,m.b,m.c,m.d,m.e-bx,m.f-by);
  const keep=ctx;ctx=olG;olPass=true;try{fn();}finally{ctx=keep;olPass=false;}
  const d=olG.getImageData(0,0,bw,bh).data,n=bw*bh;
  if(olMask.length<n){olMask=new Uint8Array(n);olExt=new Uint8Array(n);olQ=new Int32Array(n);}
  const M=olMask,E=olExt,Q=olQ,th=OL_CFG.solid;let q=0,ns=0;
  for(let i=0,j=3;i<n;i++,j+=4){const s=d[j]>th?1:0;M[i]=s;E[i]=0;ns+=s;}
  const out=[];if(!ns)return out;
  // flood the empty pixels from the border (inlined: this runs for every outlined creature every frame)
  for(let x=0;x<bw;x++){let i=x;if(!M[i]&&!E[i]){E[i]=1;Q[q++]=i;}i=(bh-1)*bw+x;if(!M[i]&&!E[i]){E[i]=1;Q[q++]=i;}}
  for(let y=1;y<bh-1;y++){let i=y*bw;if(!M[i]&&!E[i]){E[i]=1;Q[q++]=i;}i+=bw-1;if(!M[i]&&!E[i]){E[i]=1;Q[q++]=i;}}
  while(q){const i=Q[--q],x=i%bw;let j;
    if(x>0){j=i-1;if(!M[j]&&!E[j]){E[j]=1;Q[q++]=j;}}if(x<bw-1){j=i+1;if(!M[j]&&!E[j]){E[j]=1;Q[q++]=j;}}
    if(i>=bw){j=i-bw;if(!M[j]&&!E[j]){E[j]=1;Q[q++]=j;}}if(i<n-bw){j=i+bw;if(!M[j]&&!E[j]){E[j]=1;Q[q++]=j;}}}
  // the ring: outside pixels touching a solid one (8 neighbours), found from the solid side; E=2 marks taken ones
  for(let y=0;y<bh;y++){const row=y*bw;for(let x=0;x<bw;x++){if(!M[row+x])continue;
    for(let dy=-1;dy<=1;dy++){const yy=y+dy;if(yy<0||yy>=bh)continue;const r2=yy*bw;
      for(let dx=-1;dx<=1;dx++){const xx=x+dx;if(xx<0||xx>=bw)continue;const k=r2+xx;if(E[k]===1){E[k]=2;out.push(xx,yy);}}}}}
  return out;}
function olFill(ring,ox,oy,col){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha*=OL_CFG.alpha;ctx.fillStyle=col;ctx.beginPath();
  for(let k=0;k<ring.length;k+=2)ctx.rect(ox+ring[k],oy+ring[k+1],1,1);ctx.fill();ctx.restore();}
function olDraw(key,col,x0,y0,w,h,fn){
  if(!OPTS.outlines||olPass||!col){fn();return;}
  const m=ctx.getTransform(),plain=m.a===1&&m.d===1&&m.b===0&&m.c===0;
  // the box in canvas pixels, one pixel of margin for the ring
  let X0,Y0,X1,Y1;if(plain){X0=x0+m.e;Y0=y0+m.f;X1=X0+w;Y1=Y0+h;}
  else{const P=[[x0,y0],[x0+w,y0],[x0,y0+h],[x0+w,y0+h]].map(([u,v])=>[m.a*u+m.c*v+m.e,m.b*u+m.d*v+m.f]);X0=Math.min(...P.map(p=>p[0]));X1=Math.max(...P.map(p=>p[0]));Y0=Math.min(...P.map(p=>p[1]));Y1=Math.max(...P.map(p=>p[1]));}
  const bx=Math.floor(X0)-1,by=Math.floor(Y0)-1,bw=Math.ceil(X1)+1-bx,bh=Math.ceil(Y1)+1-by;
  if(bx+bw<0||by+bh<0||bx>cv.width||by>cv.height||bw>256||bh>256){fn();return;}
  let ring,ox=bx,oy=by;
  if(key&&typeof key==='object'){const o=olInst.get(key);
    if(o&&plain&&o.bw===bw&&o.bh===bh&&T-o.t<OL_CFG.reuse&&T>=o.t){ring=o.ring;ox=bx;oy=by;}
    else{ring=olRing(fn,m,bx,by,bw,bh);olInst.set(key,{ring,bw,bh,t:o?T:T-Math.random()*OL_CFG.reuse});}}
  else{const k2=key&&plain?key:null;
    if(k2&&olCache.has(k2))ring=olCache.get(k2);
    else{ring=olRing(fn,m,bx,by,bw,bh);if(k2){if(olCache.size>=OL_CFG.maxCache)olCache.clear();olCache.set(k2,ring);}}}
  olFill(ring,ox,oy,col);fn();}
// a creature's outline colour: its own from ART_OLC, otherwise its ET colour brightened
const olColTab={};
function olColOf(e){const k=e.type;if(olColTab[k]!==undefined)return olColTab[k];const b=ET[k];
  return olColTab[k]=ART_OLC[k]||(b&&!b.dummy&&/^#[0-9a-f]{6}$/i.test(b.col)?mixHex(b.col,.45):null);}
// the box a creature's outline pass covers: its body, legs and held kit; snakes and other segmented bodies
// take in their segments
function olEnemyBox(e){const x=e.x-camX,y=e.y-camY;let r=e.r*1.8+9;if(ET[e.type].guard||e.kit)r=Math.max(r,16);
  let x0=x-r,y0=y-r-4,x1=x+r,y1=y+r+2;
  if(e.seg)for(const s of e.seg){const sx=s.x-camX,sy=s.y-camY,sr=(s.r||e.r)+3;x0=Math.min(x0,sx-sr);y0=Math.min(y0,sy-sr);x1=Math.max(x1,sx+sr);y1=Math.max(y1,sy+sr);}
  return [x0,y0,x1-x0,y1-y0];}
