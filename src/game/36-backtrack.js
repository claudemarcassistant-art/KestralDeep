// ---------- less backtracking: deck secured and ceiling crawlways ----------
// deckSecured is rechecked every SECURE_CFG.check seconds (updateSecure()); while it holds, the station map offers a
// walk back to the lift (walkBack()). Crawlways (crawls) are hatch pairs placed by genCrawls() at the end of genLevel(),
// used with R at a hatch plus a confirmation (crawlAsk). Both pass game time with passTime(). Numbers: SECURE_CFG,
// CRAWL_CFG (src/data/route.js).
let deckSecured=false,secureT=0,crawls=[],crawlAsk=null,fadeFx=null;

// ---- deck secured
function hostileCanReach(e){const b=ET[e.type];if(e.dead||b.dummy||b.plant||e.friendT>0||e.caged&&!e.caged.open)return false;
  if(b.aquatic&&liqAt(player.x,player.y)<2)return false;if(b.ghost)return true;const i=tileIdx(e);return flow&&flow[i]>=0;}
function checkSecure(){if(!player||state!=='play'||testMode&&!testDeck||stopMode)return false;
  if(!exitT||!seen[exitT.y*MW+exitT.x])return false;
  if(secT>0||spawnQ.length||alertRumble||liftState==='arena'||liftState==='alarm'||waves&&waves.phase!=='done'||bossPending)return false;
  if(enemies.some(e=>ET[e.type].warden&&!e.mini&&!e.dead))return false;
  return !enemies.some(hostileCanReach);}
function updateSecure(dt){secureT-=dt;if(secureT>0)return;secureT=SECURE_CFG.check;const s=checkSecure();
  if(s&&!deckSecured){say('deck secured. the way back to the lift is quiet');sfx('learn');}deckSecured=s;}
// the floor tile beside the exit lift that is nearest on foot
function liftSpot(){let best=null,bd=1e9;for(let y=exitT.y-2;y<=exitT.y+2;y++)for(let x=exitT.x-2;x<=exitT.x+2;x++){if(x<1||y<1||x>=MW-1||y>=MH-1||solid(x,y))continue;const d=flow[y*MW+x];if(d>=0&&d<bd){bd=d;best=[x,y];}}return best?{tx:best[0],ty:best[1],d:bd}:null;}
function walkBack(){if(!deckSecured){sfx('deny');return;}const s=liftSpot();if(!s){say('no clear way back to the lift');sfx('deny');return;}
  const P=player,secs=s.d*TS/(SECURE_CFG.walkSpeed*(1+(S.spd||0)));mapOpen=false;P.x=s.tx*TS+6;P.y=s.ty*TS+6;P.vx=P.vy=0;flowT=0;
  passTime(secs);fadeFx={t:SECURE_CFG.fade,m:SECURE_CFG.fade,msg:'you make your way back to the lift'};sfx('lift');say('you make your way back to the lift. '+fmtSecs(secs)+' pass');}
function fmtSecs(s){return s<60?Math.round(s)+' seconds':Math.round(s/60*10)/10+' minutes';}
// time passing off-screen: satiety, timed buffs and heals, incense, statuses, cooldowns and the deck clock
function passTime(secs){const P=player;let left=secs;while(left>0){const dt=Math.min(0.5,left);left-=dt;
    P.sat=Math.max(0,(P.sat||0)-dt/6);updateHerbs(dt);updateStatus(dt);if(P.repulseCd>0)P.repulseCd-=dt;if(P.cloakT>0)P.cloakT=Math.max(0,P.cloakT-dt);if(lvl)lvl.t+=dt;}
  P.stam=maxStam();}

// ---- ceiling crawlways (generated inside the deck's seeded scope)
function crawlOk(x,y,start,avoid){const i=y*MW+x;if(map[i]!==0||liq[i]>=2||chasm[i]||molten[i]||hz[i]||kind[i]===3||kind[i]===4)return false;
  if(x>=start.x-2&&x<start.x+start.w+2&&y>=start.y-2&&y<start.y+start.h+2)return false;if(Math.abs(x-exitT.x)+Math.abs(y-exitT.y)<3)return false;
  if(avoid.some(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h))return false;if(traps.some(t=>Math.abs(t.tx-x)+Math.abs(t.ty-y)<2)||plateDoors.some(p=>Math.abs(p.px-x)+Math.abs(p.py-y)<2))return false;
  return D4.some(([dx,dy])=>map[(y+dy)*MW+x+dx]===1);}
function genCrawls(start,exitR){crawls=[];const C=CRAWL_CFG,R=C.perDeck[deckSize]||[0,0],n=R[0]+rnd(R[1]-R[0]+1);if(!n)return;
  const avoid=[...vaults,...secrets,...ventRooms,...hatchRooms,...modules,...plateDoors.filter(p=>p.room).map(p=>p.room),...(archive?[archive.room]:[])],dist=bfs(start.cx,start.cy,new Int16Array(MW*MH));
  const cand=[];for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++)if(dist[y*MW+x]>=0&&crawlOk(x,y,start,avoid))cand.push([x,y]);if(cand.length<2)return;
  const apart=Math.max(MW,MH)*C.minApart;
  for(let k=0;k<n;k++){for(let t=0;t<60;t++){let a;
      if(n===1&&t<40){const near=cand.filter(([x,y])=>Math.abs(x-exitT.x)+Math.abs(y-exitT.y)<=C.nearExit);a=near.length?near[rnd(near.length)]:cand[rnd(cand.length)];}else a=cand[rnd(cand.length)];
      const far=cand.filter(([x,y])=>Math.hypot(x-a[0],y-a[1])>=apart);if(!far.length)continue;const b=far[rnd(far.length)];
      if(crawls.some(c=>[c.a,c.b].some(h=>Math.abs(h.tx-a[0])+Math.abs(h.ty-a[1])<4||Math.abs(h.tx-b[0])+Math.abs(h.ty-b[1])<4)))continue;
      crawls.push({a:{tx:a[0],ty:a[1]},b:{tx:b[0],ty:b[1]},len:Math.hypot(a[0]-b[0],a[1]-b[1])*TS*1.25});break;}}}
// R at a hatch: ask first
function crawlAt(){const P=player;for(const c of crawls)for(const end of ['a','b']){const h=c[end];if(Math.hypot(h.tx*TS+6-P.x,h.ty*TS+6-P.y)<12)return {c,end};}return null;}
function crawlRefusal(){const P=player,C=CRAWL_CFG;if(T-(P.lastHitT||-99)<C.hurtWindow)return 'too hot to climb now. you were just hurt';
  if(enemies.some(e=>hostileCanReach(e)&&e.alert&&!ET[e.type].plant&&Math.hypot(e.x-P.x,e.y-P.y)<C.dangerR))return 'too hot to climb now. something is onto you';return null;}
function askCrawl(h){const why=crawlRefusal();if(why){say(why);sfx('deny');return;}crawlAsk=h;sfx('click');}
// onPress() hands every key here while the question is up
function crawlKey(code){const h=crawlAsk;crawlAsk=null;if(code!=='KeyR'){say('you stay where you are');return;}const why=crawlRefusal();if(why){say(why);sfx('deny');return;}
  const P=player,to=h.c[h.end==='a'?'b':'a'];P.x=to.tx*TS+6;P.y=to.ty*TS+6;P.vx=P.vy=0;flowT=0;h.c.used=true;passTime(h.c.len/CRAWL_CFG.speed);
  fadeFx={t:CRAWL_CFG.fade,m:CRAWL_CFG.fade,msg:'you crawl through the ceiling'};sfx('crawl');say('you drop out of the other hatch');}
function updateFade(dt){if(fadeFx){fadeFx.t-=dt;if(fadeFx.t<=0)fadeFx=null;}}

// ---- drawing
function drawCrawls(){for(const c of crawls)for(const h of [c.a,c.b]){if(!seen[h.ty*MW+h.tx])continue;const x=h.tx*TS-camX,y=h.ty*TS-camY;if(x<-TS||y<-TS||x>W||y>H)continue;
  F('#101210',x+1,y+1,TS-2,TS-2);for(let k=0;k<4;k++)F('#3a403c',x+2+k*2.5,y+2,1,TS-4);F('#8a7a50',x+3,y+2,1,TS-4);F('#8a7a50',x+8,y+2,1,TS-4);for(let k=0;k<3;k++)F('#b0a070',x+3,y+3+k*3,6,1);}}
function drawCrawlMap(ox,oy,s){for(const c of crawls){const sa=seen[c.a.ty*MW+c.a.tx],sb=seen[c.b.ty*MW+c.b.tx];
  if(sa&&sb){ctx.save();ctx.setLineDash([2,2]);ctx.strokeStyle='rgba(176,160,112,0.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ox+c.a.tx*s+s/2,oy+c.a.ty*s+s/2);ctx.lineTo(ox+c.b.tx*s+s/2,oy+c.b.ty*s+s/2);ctx.stroke();ctx.restore();}
  if(sa)F('#b0a070',ox+c.a.tx*s,oy+c.a.ty*s,s,s);if(sb)F('#b0a070',ox+c.b.tx*s,oy+c.b.ty*s,s,s);}}
function drawFadeAndAsk(){if(fadeFx){const k=fadeFx.t/fadeFx.m,a=k>0.5?1:k*2;F(`rgba(3,4,4,${a})`,0,0,W,H);if(a>0.3)txt(fadeFx.msg,W/2,H/2-4,`rgba(201,207,194,${a})`,'center');}
  if(crawlAsk){const w=300,x=(W-w)>>1,y=H/2+30;box(x,y,w,26,'#0a0d0c','#5a5030');txt('Climb into the ceiling crawlway?',W/2,y+5,'#e8c070','center');txt('R to confirm, any other key to cancel',W/2,y+15,'#8e978b','center');}}

// ---- keep the exit lift clear: R at the lift takes the lift, so nothing else usable may sit on or beside its tile.
// Runs at the end of enterLevel() (after the objective, which can add a keycard panel). Moves hack panels, chests,
// fixtures, vending machines, levers and hatches at least two tiles away (to the nearest valid spot), or drops a panel.
function nearLift(x,y){return Math.max(Math.abs(x-exitT.x),Math.abs(y-exitT.y))<=1;}
function wallSpotFrom(x0,y0,taken){for(let r=2;r<=8;r++)for(let y=y0-r;y<=y0+r;y++)for(let x=x0-r;x<=x0+r;x++){if(Math.max(Math.abs(x-x0),Math.abs(y-y0))!==r||x<1||y<1||x>=MW-1||y>=MH-2)continue;
  if(nearLift(x,y)||Math.max(Math.abs(x-exitT.x),Math.abs(y-exitT.y))<2)continue;const i=y*MW+x;if(map[i]!==1||solid(x,y+1)||map[i-1]!==1||map[i+1]!==1)continue;if(taken(x,y))continue;return [x,y];}return null;}
function floorSpotFrom(x0,y0,taken){for(let r=1;r<=8;r++)for(let y=y0-r;y<=y0+r;y++)for(let x=x0-r;x<=x0+r;x++){if(Math.max(Math.abs(x-x0),Math.abs(y-y0))!==r||x<1||y<1||x>=MW-1||y>=MH-1)continue;
  if(Math.max(Math.abs(x-exitT.x),Math.abs(y-exitT.y))<2)continue;const i=y*MW+x;if(solid(x,y)||liq[i]>=2||chasm[i]||molten[i]||hz[i])continue;if(taken(x,y))continue;return [x,y];}return null;}
function clearLiftArea(){if(!exitT)return;
  const wallUsed=(x,y)=>panels.some(q=>q.tx===x&&q.ty===y)||vendors.some(v=>v.tx===x&&v.ty===y)||fixtures.some(f=>f.tx===x&&f.ty===y)||risers.some(r=>r.tx===x&&r.ty===y);
  const floorUsed=(x,y)=>chests.some(c=>c.tx===x&&c.ty===y)||fixtures.some(f=>f.tx===x&&f.ty===y)||levers.some(l=>l.tx===x&&l.ty===y)||barrels.some(b=>!b.dead&&b.tx===x&&b.ty===y);
  for(const pn of panels.slice())if(nearLift(pn.tx,pn.ty)){const s=wallSpotFrom(pn.tx,pn.ty,wallUsed);if(s){pn.tx=s[0];pn.ty=s[1];}else panels=panels.filter(q=>q!==pn);}
  for(const v of vendors.slice())if(nearLift(v.tx,v.ty)){const s=wallSpotFrom(v.tx,v.ty,wallUsed);if(s){v.tx=s[0];v.ty=s[1];if(v.x!=null){v.x=s[0]*TS+6;v.y=s[1]*TS+6;}}else vendors=vendors.filter(q=>q!==v);}
  for(const c of chests)if(nearLift(c.tx,c.ty)){const s=floorSpotFrom(c.tx,c.ty,floorUsed);if(s){c.tx=s[0];c.ty=s[1];c.x=s[0]*TS+TS/2;c.y=s[1]*TS+TS/2;}}
  for(const f of fixtures)if(f.kind!=='liftdoor'&&nearLift(f.tx,f.ty)){const s=f.wall?wallSpotFrom(f.tx,f.ty,wallUsed):floorSpotFrom(f.tx,f.ty,floorUsed);if(s){f.tx=s[0];f.ty=s[1];}}
  for(const l of levers)if(nearLift(l.tx,l.ty)){const s=floorSpotFrom(l.tx,l.ty,floorUsed);if(s){l.tx=s[0];l.ty=s[1];}}
  for(const h of hatches)if(nearLift(h.tx,h.ty)){const s=floorSpotFrom(h.tx,h.ty,floorUsed);if(s){h.tx=s[0];h.ty=s[1];}}}
