// ---------- security cameras (v1.00, batch 3 request 15) ----------
// Wall-mounted sensors that pan a vision cone (CAM_CFG, src/data/security.js). A camera is
// {tx,ty (its wall tile), dx,dy (out into the room), x,y (lens point), face, look, ph, hp, lockT, raised, off, broken, panel}.
// It sees the player like a creature would (line of sight and smokeBlocks(), never while cloaked); after CAM_CFG.lockT
// of continuous sight it raises the security alarm once, then keeps tracking. Broken (3 hits), switched off by its
// control panel (HACKR.cams) or dark while powerOff. secCams is reset in resetHidden().
let secCams=[];
function camState(c){return c.broken?'broken':c.off?'off':powerOff?'unpowered':c.raised?'alarm':c.lockT>0?'locked':'scanning';}
function camLive(c){return !c.broken&&!c.off&&!powerOff;}
function mkCam(tx,ty,dx,dy){return {tx,ty,dx,dy,x:tx*TS+6+dx*6,y:ty*TS+6+dy*6,face:Math.atan2(dy,dx),look:Math.atan2(dy,dx),ph:Math.random()*6.283,hp:CAM_CFG.hp,lockT:0,raised:false,off:false,broken:false,panel:null};}
// candidate wall spots: a wall tile with floor in front (dx,dy) and open floor out along the view for a few tiles
function camSpots(start){const out=[],inRoom=(x,y)=>rooms.some(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
  for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++){const i=y*MW+x;if(map[i]!==1)continue;
    for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){const fx=x+dx,fy=y+dy,fi=fy*MW+fx;if(map[fi]!==0||chasm[fi]||molten[fi])continue;
      let open=0;for(let k=1;k<=6;k++){const qx=x+dx*k,qy=y+dy*k;if(qx<0||qy<0||qx>=MW||qy>=MH||solid(qx,qy))break;open++;}if(open<4)continue;
      if(start&&fx>=start.x-1&&fx<=start.x+start.w&&fy>=start.y-1&&fy<=start.y+start.h)continue;if(nearLift(fx,fy)||nearLift(x,y))continue;
      if(panels.some(q=>q.tx===x&&q.ty===y)||vendors.some(v=>v.tx===x&&v.ty===y)||fixtures.some(f=>f.tx===x&&f.ty===y)||risers.some(r=>r.tx===x&&r.ty===y))continue;
      // what it watches: corridors and doorways (floor outside every room), and loot rooms (vaults). Not chests: they are
      // placed later, in populate(), and the list still holds the last deck's here
      const corridor=!inRoom(fx,fy),loot=vaults.some(v=>Math.hypot(v.x+v.w/2-fx,v.y+v.h/2-fy)<8);out.push({x,y,dx,dy,w:1+(corridor?2:0)+(loot?2:0)});}}
  return out;}
// a control panel on a nearby wall with floor below it, in sight of the camera (same rules as trap control panels)
function wireCam(c){const R=CAM_CFG.panelRange;let best=null,bd=1e9;
  for(let y=Math.max(1,c.ty-R);y<=Math.min(MH-3,c.ty+R);y++)for(let x=Math.max(1,c.tx-R);x<=Math.min(MW-2,c.tx+R);x++){const i=y*MW+x;
    if(map[i]!==1||solid(x,y+1)||(x===c.tx&&y===c.ty)||nearLift(x,y+1))continue;
    if(panels.some(q=>Math.abs(q.tx-x)+Math.abs(q.ty-y)<3)||vendors.some(v=>Math.abs(v.tx-x)+Math.abs(v.ty-y)<3)||fixtures.some(f=>f.tx===x&&f.ty===y)||risers.some(r=>r.tx===x&&r.ty===y)||secCams.some(q=>q.tx===x&&q.ty===y))continue;
    if(!hasLOS(x*TS+6,(y+1)*TS+6,c.x,c.y))continue;const d=Math.hypot(x-c.tx,y-c.ty);if(d<3)continue;if(d<bd){bd=d;best=[x,y];}}
  if(!best)return false;const pn={tx:best[0],ty:best[1],hack:true,reward:'cams',state:'idle',ph:Math.random()*6,cams:[c]};panels.push(pn);c.panel=pn;return true;}
// generation (inside the deck's seeded scope): from CAM_CFG.minDepth, a count scaled by deck area.
// levelMods.cams (test lift): 'off' = none, 'on' = at any depth and at least one, wired.
function genCams(start){secCams=[];const C=Object.assign({},CAM_CFG,scen().cams),mode=levelMods.cams||'normal';if(mode==='off'||(mode!=='on'&&depth<C.minDepth))return;
  let n=aN(C.count[0]+rnd(C.count[1]-C.count[0]+1));if(mode==='on')n=Math.max(1,n);if(!n)return;
  const spots=camSpots(start);
  for(let k=0;k<n&&spots.length;k++){const ok=spots.filter(s=>secCams.every(c=>Math.abs(c.tx-s.x)+Math.abs(c.ty-s.y)>=C.minApart));if(!ok.length)break;
    const s=wpick(ok.map(q=>[q,q.w])),c=mkCam(s.x,s.y,s.dx,s.dy);secCams.push(c);if(mode==='on'||Math.random()<C.wired)wireCam(c);}}
// sight: the player in the cone, in range, in line of sight and not hidden by smoke or cloak
function camSees(c){const p=player,dx=p.x-c.x,dy=p.y-c.y,d=Math.hypot(dx,dy);if(d>CAM_CFG.range||p.cloakT>0)return false;
  let da=Math.atan2(dy,dx)-c.look;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>CAM_CFG.half&&d>14)return false;
  return hasLOS(c.x,c.y,p.x,p.y)&&!smokeBlocks(c.x,c.y,p.x,p.y);}
function updateCams(dt){const C=CAM_CFG,p=player;if(!p)return;
  for(const c of secCams){if(!camLive(c)){if(!c.raised)c.lockT=0;continue;}
    const sees=camSees(c);
    if(sees){if(c.lockT===0&&!c.raised){sfx('beep');float(c.x,c.y-6,'!','#ffc060');}c.lockT+=dt;
      // follow the player while locked on, within the swing
      let want=Math.atan2(p.y-c.y,p.x-c.x)-c.face;want=Math.atan2(Math.sin(want),Math.cos(want));want=Math.max(-C.pan,Math.min(C.pan,want));
      let da=c.face+want-c.look;da=Math.atan2(Math.sin(da),Math.cos(da));c.look+=da*Math.min(1,dt*C.trackTurn);
      if(!c.raised&&c.lockT>=C.lockT){c.raised=true;raiseAlarm(c.x,c.y,C.guards[0]+rnd(C.guards[1]-C.guards[0]+1),'camera');float(c.x,c.y-8,'alarm','#ff6050');}}
    else{if(!c.raised)c.lockT=0;c.ph+=dt*C.panSpeed;const target=c.face+Math.sin(c.ph)*C.pan;let da=target-c.look;da=Math.atan2(Math.sin(da),Math.cos(da));c.look+=da*Math.min(1,dt*2);}}}
// damage from shots, melee and blasts: CAM_CFG.hp hits break it for good
function hitCam(c,n){if(c.broken)return;c.hp-=n||1;sfx('clank');for(let k=0;k<4;k++)parts.push({x:c.x,y:c.y,vx:rr(-50,50),vy:rr(-50,50),t:0.25,m:0.25,c:k%2?'#ffe7a0':'#9fd8ff',s:1});
  if(c.hp<=0){c.broken=true;c.lockT=0;sfx('zap');float(c.x,c.y-6,'camera down','#8e978b');for(let k=0;k<10;k++)parts.push({x:c.x,y:c.y,vx:rr(-70,70),vy:rr(-70,70),t:0.4,m:0.4,c:'#ffe7a0',s:1});}}
function camAtTile(tx,ty){return secCams.find(c=>c.tx===tx&&c.ty===ty);}
function camsHitArc(px,py,ang,range,arc){for(const c of secCams){if(c.broken)continue;const dx=c.x-px,dy=c.y-py;if(Math.hypot(dx,dy)<range+5&&Math.abs(angDiff(Math.atan2(dy,dx),ang))<arc)hitCam(c,1);}}
function camsBlast(x,y,R){for(const c of secCams)if(!c.broken&&Math.hypot(c.x-x,c.y-y)<R+6)hitCam(c,CAM_CFG.hp);}
// control panel: a good hack loops the feed (off for the deck); a failed one sets off the alarm
HACKR.cams={label:'loop the camera feed',ok:()=>false,act:pn=>{for(const c of pn.cams){c.off=true;c.lockT=0;}sfx('door');return (pn.cams.length>1?'the camera feeds loop':'the camera feed loops')+'. the lens goes dark';}};
function camsHackFailed(pn){const c=pn.cams[0];raiseAlarm(c?c.x:player.x,c?c.y:player.y,CAM_CFG.guards[0]+rnd(CAM_CFG.guards[1]-CAM_CFG.guards[0]+1),'camera');say('the panel trips a security flag');}
// drawing: the cone (in drawActWorld's lighter pass), and the camera body on its wall
function drawCamCones(){for(const c of secCams){if(!camLive(c)||!seen[(c.ty+c.dy)*MW+c.tx+c.dx])continue;if(Math.abs(c.x-camX-W/2)>W/2+160||Math.abs(c.y-camY-H/2)>H/2+160)continue;
    const R=CAM_CFG.range,st=camState(c),col=st==='alarm'?'255,80,60':st==='locked'?'255,190,90':'215,228,255',a=st==='scanning'?0.10:st==='alarm'?0.30:0.24;
    const pts=[[c.x-camX,c.y-camY]];for(let k=0;k<=10;k++){const an=c.look-CAM_CFG.half+2*CAM_CFG.half*k/10,ca=Math.cos(an),sa=Math.sin(an),dd=castRay(c.x,c.y,ca,sa,R,false);pts.push([c.x+ca*dd-camX,c.y+sa*dd-camY]);}
    const g=ctx.createRadialGradient(c.x-camX,c.y-camY,3,c.x-camX,c.y-camY,R);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(const q of pts)ctx.lineTo(q[0],q[1]);ctx.closePath();ctx.fill();}}
function drawCams(){
  // a faint dashed wire from a control panel to its camera, once either has been seen
  ctx.save();ctx.setLineDash([2,3]);ctx.lineWidth=1;
  for(const pn of panels){if(pn.reward!=='cams')continue;const ps=seen[pn.ty*MW+pn.tx];
    for(const c of pn.cams){if(!(ps||seen[(c.ty+c.dy)*MW+c.tx+c.dx]))continue;ctx.strokeStyle=c.off||c.broken||pn.state==='dead'?'rgba(120,120,110,0.25)':'rgba(150,200,230,0.35)';
      ctx.beginPath();ctx.moveTo(pn.tx*TS+6.5-camX,(pn.ty+1)*TS-camY);ctx.lineTo(c.x-camX,c.y-camY);ctx.stroke();}}
  ctx.restore();
  for(const c of secCams){if(!seen[(c.ty+c.dy)*MW+c.tx+c.dx])continue;const x=Math.round(c.x-camX),y=Math.round(c.y-camY);if(x<-10||y<-10||x>W+10||y>H+10)continue;
    const st=camState(c),lens=st==='alarm'?'#ff5040':st==='locked'?'#ffc060':st==='scanning'?'#e8f0ff':'#2a2e2c';
    F('#15181a',x-3-c.dx*2,y-3-c.dy*2,6,6);F(c.broken?'#2a2420':'#4a5054',x-2-c.dx*2,y-2-c.dy*2,4,4);
    const lx=Math.round(x+Math.cos(c.look)*2),ly=Math.round(y+Math.sin(c.look)*2);F('#0c0e0f',lx-1,ly-1,3,3);F(lens,lx,ly,1,1);
    if(st==='scanning'&&Math.sin(T*3+c.ph)>0.6)F('#c04040',x-2-c.dx*2,y-2-c.dy*2,1,1);
    if(c.broken&&Math.random()<0.02)parts.push({x:c.x,y:c.y,vx:rr(-20,20),vy:rr(-30,0),t:0.2,m:0.2,c:'#ffe7a0',s:1});}}
function drawCamMap(ox,oy,s){for(const c of secCams){if(!seen[(c.ty+c.dy)*MW+c.tx+c.dx])continue;F(c.broken||!camLive(c)?'#4a4040':c.raised?'#ff5040':'#e8f0ff',ox+c.tx*s,oy+c.ty*s,Math.max(1,s),Math.max(1,s));}}
// V-look text
function camLook(c){const st=camState(c);return {name:'Security camera ('+(st==='locked'?'locked on':st==='alarm'?'alarm raised':st==='unpowered'?'no power':st)+')',
  desc:st==='broken'?'Smashed. It sees nothing now.':st==='off'?'Its feed is looped. It sees nothing.':st==='unpowered'?'Dead while the deck power is out.':'Sweeps a cone; stay in it for 1.5 seconds and the alarm goes off. Three hits break it'+(c.panel&&c.panel.state==='idle'?', or hack its panel to loop the feed':'')+'.',col:st==='scanning'?'#c9cfc2':'#ffc060'};}
