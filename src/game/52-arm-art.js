// ---------- armaments in hand and on the floor (Batch 5, from the study's armaments section: WD, armPose, armOnFloor) ----------
// Each armament is drawn from its grip, pointing along +x (ARM_ART, keyed by ARM id). The study animated them on a
// timer; here every animation reads the player's real state, gathered once per frame by armState():
//   k     seconds since the last shot (player.shotT, set in fire()), for recoil, muzzle flash and the bolt's travel
//   hold  the trigger is held on a held-fire gun (smg, flamethrower, blower)
//   chg   the bow's draw (p.chg); nock: an arrow is on the string
//   jab   the spear's thrust 0-1 (jabT); lash: the whip's progress 0-1 (lashT, -1 when coiled)
//   rev   the chainsaw is running; spray: the soaker is spraying; up: the shield is raised (blocking)
//   ray   the ray gun's charge 0-1; zap: the stun gun just fired; tank: the liquid tank's fill 0-1
// On the floor (armOnFloor()) the same drawing lies on its side, still, with the gear pool under it.
// The game draws its own projectiles, flames, ray beams, stun arcs and swing arcs, so the study's copies of those
// are left out; muzzle flashes, recoil and the chainsaw's sparks now come from here.
function FR(g,c,x,y,w,h){g.fillStyle=c;g.fillRect(x,y,w,h);}
function FRA(g,c,a,x,y,w,h){const A0=g.globalAlpha;g.globalAlpha=A0*a;g.fillStyle=c;g.fillRect(x,y,w,h);g.globalAlpha=A0;}
function flashStar(g,x,y,s,c,a){const A0=g.globalAlpha;g.globalAlpha=A0*(a==null?.95:a);g.fillStyle=c||'#ffe68c';g.beginPath();
  for(let k=0;k<8;k++){const an=k/8*TAU,r=k%2?s*.45:s;k?g.lineTo(x+Math.cos(an)*r,y+Math.sin(an)*r):g.moveTo(x+r,y);}g.closePath();g.fill();g.globalAlpha=A0;pxl(g,x,y,'#ffffff',1);}
const ARM_IDLE={k:99,hold:false,chg:0,nock:true,jab:0,lash:-1,rev:false,spray:false,up:false,ray:0,zap:false,tank:.6,t:0};
const ARM_ART={
  pistol(g,s){const f=s.k<.06,rc=f?-.8:0;g.translate(rc,0);FR(g,'#1a1d1c',-.6,-1,6.2,2);FR(g,'#5a6260',-.6,-1,6,.6);FR(g,'#2a2e2c',-.4,.4,1.6,1.8);if(f)flashStar(g,6.6,0,2.6);g.translate(-rc,0);},
  smg(g,s){const f=s.k<.05;FR(g,'#1a1d1c',-2,-1,9.5,2.1);FR(g,'#4a5250',-2,-1,9.5,.6);FR(g,'#2a2e2c',2.6,1,1.2,2.6);FR(g,'#121414',-3.4,-.6,1.6,1.3);FR(g,'#3a403e',7.5,-.5,1.5,1);
    if(f){flashStar(g,10,(s.t*37%1)-.5,2);pxl(g,1,-2.2,'#d8b450',.8);}},
  scatter(g,s){const kk=s.k/1.4,f=kk<.06,rc=f?-1.4:kk<.2?-(.2-kk)*5:0;g.translate(rc,0);FR(g,'#3a2414',-4,-1.1,4,2.2);FR(g,'#1c1f1e',0,-1.1,11,2.2);FR(g,'#5e6664',0,-1.1,11,.6);FR(g,'#6a4a2a',5,-1.4,3,2.8);FR(g,'#8a6a40',5,-1.4,3,.6);
    if(f){flashStar(g,12.5,0,3.4);for(let q=0;q<5;q++)FRA(g,'#ffdc8c',.8,14+q*1.4-.4,(q-2)*.9-.4,.8,.8);}g.translate(-rc,0);},
  nailer(g,s){const f=s.k<.04;FR(g,'#6a4a10',-.5,-1.4,7,2.8);FR(g,'#c89a28',-.5,-1.4,7,2.2);FR(g,'#e8c050',-.5,-1.4,7,.6);FR(g,'#2a2a2a',1,1.2,1.4,2);FR(g,'#4a5054',6.5,-.5,2.2,1);for(let q=0;q<4;q++)pxl(g,1+q*1.2,-2,'#b8c0c4',.6);if(f)flashStar(g,9.4,0,1.6,'#dce6f0',.9);},
  bolt(g,s){const kk=s.k/1.6;FR(g,'#22303a',-2,-.9,13,1.8);FR(g,'#5a7890',-2,-.9,13,.6);for(let c=0;c<4;c++)FR(g,'#8fb6d0',1+c*2.4,-1.2,.7,2.4);
    const bx=kk<.3?11+kk*40:9;if(bx<14){FR(g,'#e2f0f8',bx-3,-.3,3,.6);pxl(g,bx,0,'#ffffff',.8);}if(kk<.04)glow(g,11,0,3,'150,210,255',.5);},
  ray(g,s){const ch=s.ray;g.fillStyle='#2a2e3a';g.beginPath();g.arc(1.5,0,2.4,0,TAU);g.fill();g.fillStyle='#8a96a6';g.beginPath();g.arc(1.5,-.3,2,0,TAU);g.fill();FR(g,'#6a7686',2,-.8,5.5,1.6);
    for(const x of[3.4,5])FR(g,'#c0c8d4',x,-1.8,.6,3.6);FR(g,'#e05a5a',-1,-.6,1.4,1.2);const A0=g.globalAlpha;g.globalAlpha=A0*(.4+ch*.6);g.fillStyle='#78f0ff';g.beginPath();g.arc(8,0,.8+ch*.9,0,TAU);g.fill();g.globalAlpha=A0;
    if(ch>.1)glow(g,8,0,2+ch*3,'120,240,255',.35*ch);},
  flamer(g,s){FR(g,'#3a3a36',-2,-1.2,9,2.4);FR(g,'#6a6a60',-2,-1.2,9,.6);FR(g,'#a83a24',-.5,1.2,3,1.6);FR(g,'#1a1a1a',7,-.6,1.6,1.2);const A0=g.globalAlpha;g.globalAlpha=A0*.9;g.fillStyle='#78b4ff';g.beginPath();g.arc(9,0,.6+(s.hold?.5:Math.random()*.2),0,TAU);g.fill();g.globalAlpha=A0;},
  knives(g,s){if(s.k>.35){FR(g,'#5a3418',-1.5,-.5,2.4,1);FR(g,'#e0e6e6',.9,-.4,3.2,.8);pxl(g,4.2,-.1,'#ffffff',.6);}},
  bow(g,s){const pull=s.chg*3.6;g.strokeStyle='#4a3018';g.lineWidth=1.4;g.beginPath();g.moveTo(-1.5,-6);g.quadraticCurveTo(2.6,0,-1.5,6);g.stroke();g.strokeStyle='#7a5a34';g.lineWidth=.6;g.beginPath();g.moveTo(-1.2,-5.6);g.quadraticCurveTo(2.2,0,-1.2,5.6);g.stroke();
    FR(g,'#2a2a2a',-2,-6.4,1.2,1.2);FR(g,'#2a2a2a',-2,5.2,1.2,1.2);g.strokeStyle='#d8dcd4';g.lineWidth=.4;g.beginPath();g.moveTo(-1.5,-6);g.lineTo(-1.5-pull,0);g.lineTo(-1.5,6);g.stroke();
    if(s.nock||s.chg>0){line(g,-1.5-pull,0,6,0,.6,'#b8c0c4');pxl(g,6.4,0,'#e8ecec',.8);}},
  spear(g,s){const j=s.jab*7;g.translate(j,0);line(g,-9,0,13,0,1.2,'#5a3e1e');line(g,-9,-.3,13,-.3,.4,'#8a6a40');g.fillStyle='#9aa4a8';g.beginPath();g.moveTo(17.5,0);g.lineTo(13,-1.5);g.lineTo(13,1.5);g.closePath();g.fill();line(g,13,-.6,17,0,.4,'#e0e6e6');FR(g,'#3a2a1a',11.6,-1,1.2,2);
    if(s.jab>.3){const A0=g.globalAlpha;g.globalAlpha=A0*.5*s.jab;line(g,18.5,0,23,0,.8,'#fff0d2');g.globalAlpha=A0;}g.translate(-j,0);},
  cutter(g,s){FR(g,'#c8a030',-1,-.7,3.4,1.4);FR(g,'#e8c050',-1,-.7,3.4,.5);FR(g,'#d8dcdc',2.4,-.5,2.4,.9);pxl(g,4.8,-.2,'#ffffff',.6);},
  crowbar(g,s){line(g,-1,0,8,0,1.2,'#3a2a2a');line(g,-1,-.3,8,-.3,.4,'#8a5a50');g.strokeStyle='#3a2a2a';g.lineWidth=1.2;g.beginPath();g.arc(8,1.6,1.6,-Math.PI/2,Math.PI/2.5);g.stroke();line(g,-1,0,-2.2,1,1.1,'#3a2a2a');},
  bat(g,s){g.fillStyle='#6a4626';g.beginPath();g.moveTo(-1.5,-.5);g.lineTo(8.5,-1.5);g.quadraticCurveTo(10,0,8.5,1.5);g.lineTo(-1.5,.5);g.closePath();g.fill();line(g,0,-.6,8.5,-1.2,.5,'#9a7444');FR(g,'#222222',-1.6,-.7,1.6,1.4);},
  whip(g,s){if(s.lash<0){g.strokeStyle='#3a2a1a';g.lineWidth=.8;for(let c=0;c<2;c++){g.beginPath();g.arc(1.5,1.6,1.4+c*.8,0,TAU);g.stroke();}FR(g,'#2a1e14',-1,-.6,2.2,1.2);return;}
    const f=Math.sin(s.lash*Math.PI),L=4+f*((ARM.whip.melee.range||36)-6),bend=(1-f)*7*(s.lashS||1)+Math.sin(s.lash*12)*1.5;g.strokeStyle='#4a3420';g.lineWidth=.8;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(L*.5,bend,L,0);g.stroke();FR(g,'#2a1e14',-1,-.6,2.2,1.2);
    if(f>.85){pxl(g,L,0,'#fff0c0',1.2);glow(g,L,0,3,'255,240,192',.6);}},
  chainsaw(g,s){const rv=s.rev,jx=rv?(Math.random()-.5)*.8:0,jy=rv?(Math.random()-.5)*.8:0;g.translate(jx,jy);FR(g,'#7a3a10',-2,-2.4,6,4.8);FR(g,'#c8661e',-2,-2.4,6,4);FR(g,'#e8883a',-2,-2.4,6,.7);FR(g,'#2a2a2a',-1,-3,3,.8);
    FR(g,'#6a7276',4,-1.3,10,2.6);FR(g,'#9aa4a8',4,-1.3,10,.6);for(let c=0;c<6;c++)FR(g,'#2a2e30',4.5+((c*1.8+(rv?s.t*40:0))%10),c%2?-1.7:1,1,.7);g.fillStyle='#6a7276';g.beginPath();g.arc(14,0,1.3,0,TAU);g.fill();
    if(rv&&Math.random()<.5)pxl(g,14+Math.random()*2,(Math.random()-.5)*3,'#ffd070',.8);g.translate(-jx,-jy);},
  soaker(g,s){FR(g,'#c04a1a',-1.5,-1.5,8,3);FR(g,'#e06a2a',-1.5,-1.5,8,.8);const A0=g.globalAlpha;g.globalAlpha=A0*.85;g.fillStyle='#3c8cdc';g.beginPath();g.ellipse(1.5,-2.6,2.2,1.4,0,0,TAU);g.fill();g.globalAlpha=A0;pxl(g,.8,-3,'#bfe4ff',.8);FR(g,'#f0d040',6.5,-.6,2.4,1.2);FR(g,'#2a2a2a',0,1.4,1.4,1.8);
    if(s.spray){g.fillStyle='#78beff';for(let q=0;q<8;q++){const m=(s.t*2.2+q/8)%1;g.globalAlpha=A0*(.8-m*.6);g.fillRect(9+m*16,Math.sin(m*3)*1.2+m*m*2-.5,1,1);}g.globalAlpha=A0;}},
  shield(g,s){const up=s.up,r=up?6.5:5.5,a0=up?-1.15:-1.35;g.strokeStyle='#1a2026';g.lineWidth=2.6;g.beginPath();g.arc(-1,0,r,a0,-a0);g.stroke();g.strokeStyle='#5a666c';g.lineWidth=1.8;g.beginPath();g.arc(-1,0,r,a0,-a0);g.stroke();
    const A0=g.globalAlpha;g.globalAlpha=A0*.75;g.strokeStyle='#aad2e6';g.lineWidth=.6;g.beginPath();g.arc(-1,0,r,-.35,.35);g.stroke();g.globalAlpha=A0;},
  tank(g,s){line(g,-6,-3,1,1.6,.6,'#3a2e1c');FR(g,'#2e3438',-.5,.6,4.4,5);FR(g,'#6a7478',-.5,.6,4.4,.6);const lvl=Math.max(0,Math.min(1,s.tank));if(lvl>0)FRA(g,'#4696c8',.85,0,1.6+(1-lvl)*3.4,3.4,lvl*3.4);pxl(g,.6,2,'#cfeaff',.6);FR(g,'#8a6a2a',1,.1,1.6,.6);},
  blower(g,s){FR(g,'#2a3236',-2,-1.6,5,3.2);FR(g,'#5a646a',-2,-1.6,5,.7);g.fillStyle='#c8a030';g.beginPath();g.ellipse(-.5,2.4,2.4,1.4,0,0,TAU);g.fill();FR(g,'#3a4246',3,-1.2,6,2.4);FR(g,'#6a767c',3,-1.2,6,.5);FR(g,'#1a1e20',9,-1.8,1.4,3.6);
    if(s.hold)for(let q=0;q<10;q++){const m=(s.t*3.2+q/10)%1;FRA(g,'#dce8ee',.55*(1-m),10+m*20,(q%5-2)*1.6*(.4+m),2+m*2,.6);}},
  stungun(g,s){FR(g,'#1e2226',-1.5,-1,6,2);FR(g,'#4a545c',-1.5,-1,6,.5);FR(g,'#3a6aa0',1.5,-.4,2,.8);line(g,4.5,-.8,6.5,-.9,.5,'#c8d0d8');line(g,4.5,.8,6.5,.9,.5,'#c8d0d8');glow(g,6.8,0,s.zap?4:2.5,'120,180,255',s.zap?.8:.4);}};
// how far each armament reaches from its grip, for laying it on the floor
const ARM_FLOOR_LEN={spear:22,chainsaw:16,bolt:14,scatter:15,whip:6,bow:8,shield:8,tank:6,flamer:11,blower:12,ray:9};
const ARM_SWING={cutter:1,crowbar:1,bat:1};
const ARM_TWO_GUN={scatter:1,bolt:1,blower:1};
// the player's armament state for this frame (see the header)
function armState(){const p=player,set=p.arms[p.armSet],held=mouse.l&&!menuOpen&&!(p.dazeT>0);
  const k=p.shotT!=null&&T>=p.shotT?T-p.shotT:99;
  return {t:T,k,hold:held&&p.aiming&&(p.weapon==='smg'||p.weapon==='flamer'||p.weapon==='blower'),chg:set.main==='bow'?Math.min(1,p.chg||0):0,nock:p.aiming||(p.chg||0)>0,
    jab:p.jabT>0?Math.sin((1-p.jabT/0.16)*Math.PI):0,lash:p.lashT>0?1-p.lashT/0.24:-1,lashS:p.lashS||1,
    rev:set.main==='chainsaw'&&mouse.l&&!p.aiming&&p.hotSel<2&&!menuOpen&&p.inv.cells>0,spray:set.main==='soaker'&&held&&p.liq!==4,
    up:!!p.blocking,ray:p.weapon==='ray'?Math.min(1,(p.charge||0)):0,zap:p.zapT>0,tank:p.tank&&p.tank.n?p.tank.n/TANKMAX:0};}
// where the hands go and where each held armament sits, in the player's frame (+x forward, +y to the right).
// A main-hand armament is in the right hand, an off-hand gun forward in the left; with the right hand free, guns are
// held in both hands as on the study page. Returns {hands, items:[{k,grip,rot}]}.
function armHold(){const p=player,set=p.arms[p.armSet],M=set.main,O=set.off,items=[];let hR=null,hL=null;
  const gunO=O&&ARM[O]&&ARM[O].gun&&O!=='knives'?O:null,lowered=gunO&&p.weapon!==gunO;
  if(M==='bow'){const c=Math.min(1,p.chg||0);hR=[3.6-c*3.6,.4];hL=[5.4,-.2];items.push({k:'bow',grip:[5.2,0],rot:0});return {hands:[hR,hL],items};}
  if(M==='spear'){const j=(p.jabT>0?Math.sin((1-p.jabT/0.16)*Math.PI):0)*7;hR=[3.2+j,1];hL=[6+j,-.2];items.push({k:'spear',grip:[3.4,.3],rot:0});return {hands:[hR,hL],items};}
  if(ARM_SWING[M]){if(p.swingT>0){const q=Math.max(0,Math.min(1,(0.12-p.swingT)/0.12)),sw=(p.swingDir||1)*(-1.4+q*2.8);hR=[Math.cos(sw)*4.3+.4,Math.sin(sw)*4.3+.8];items.push({k:M,grip:hR,rot:sw});}
    else{hR=[2.2,3.6];items.push({k:M,grip:hR,rot:.55});}}
  else if(M==='whip'||M==='chainsaw'||M==='soaker'||M==='stungun'){hR=[3.6,1.6];items.push({k:M,grip:[3.6,1.2],rot:0});if(M==='chainsaw'&&!O)hL=[3.6,-.8];}
  else if(!M&&p.swingT>0){const q=Math.max(0,Math.min(1,(0.12-p.swingT)/0.12)),pR=Math.sin(q*Math.PI)*3;hR=[2.6+pR,2.2];if(!O)hL=[2.6,-2.2];}
  if(gunO){const two=ARM_TWO_GUN[gunO];
    if(lowered){hL=[1.6,-3.8];items.push({k:gunO,grip:[1.6,-3.6],rot:-.35});}
    else if(!M&&!(p.swingT>0)){if(two){hR=[3.2,1];hL=[6,-.2];items.push({k:gunO,grip:[3.4,.3],rot:0});}else{hR=[4.6,.9];hL=[3.8,-.5];items.push({k:gunO,grip:[4,.4],rot:0});}}
    else{hL=two?[6,-1.2]:[4.6,-1.1];items.push({k:gunO,grip:two?[3.4,-.9]:[4,-.9],rot:0});}}
  else if(O==='knives'){const e=(p.shotT!=null&&T-p.shotT<.35&&T>=p.shotT)?2.2:0;hL=[3+e,-1.6];items.push({k:'knives',grip:[3+e,-1.6],rot:0});}
  else if(O==='shield'){hL=[3,-1.2];items.push({k:'shield',grip:[3,0],rot:0});}
  else if(O==='tank'){hL=[.6,-3.9];items.push({k:'tank',grip:[-1.6,-3.6],rot:0});}
  return {hands:(hR||hL)?[hR,hL]:null,items};}
// draws the held armaments inside person() (its wpn hook: the local frame, under the hands)
function drawHeldArms(g,items,s){for(const it of items){const fn=ARM_ART[it.k];if(!fn)continue;g.save();g.translate(it.grip[0],it.grip[1]);if(it.rot)g.rotate(it.rot);fn(g,s);g.restore();}}
// an armament lying on the floor (or as a menu icon, scaled to fit when icon is set)
function armOnFloor(k,x,y,icon){const fn=ARM_ART[k];if(!fn)return false;const L=ARM_FLOOR_LEN[k]||9;
  if(!icon)shadow(ctx,x+.8,y+1.8,Math.min(9,L*.45),1.6,.35);
  ctx.save();ctx.translate(x,y);const sc=icon?Math.min(1,13/(L+4)):1;if(sc<1)ctx.scale(sc,sc);ctx.translate(-L/2*.86+(k==='shield'?3:0),L/2*.5);ctx.rotate(-.5);
  fn(ctx,ARM_IDLE);ctx.restore();return true;}
