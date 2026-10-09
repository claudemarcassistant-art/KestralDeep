// ---------- express shafts and vault junctions ----------
// Express shafts: node.xl lists junctions two steps away reached by an express shaft (both ends list each other).
// Known like normal shafts through route.lk, with keys 'x'+lkey(i,j) (learnLinks() learns them too). Riding one costs
// batteries (EXPRESS_CFG), raises depth as usual, moves the hunter, and never stops on the way (chooseRoute()).
// Vault junctions: node.cond.vault={d:[dangers],opened}. Their decks build an archive vault (genArchiveVault() in
// genLevel(), stocked by fillArchive() at the end of populate()). Numbers: VAULT_CFG and VAULT_DANGERS (src/data/route.js).

// ---- sector generation (inside the sector's seeded scope, called from genSector())
function genExpress(N){const C=EXPRESS_CFG,want=C.n[0]+rnd(C.n[1]-C.n[0]+1),pairs=[];for(const n of N)n.xl=[];
  for(let a=0;a<N.length;a++)for(const m of N[a].links)for(const b of N[m].links){if(b<=a||N[a].links.includes(b)||pairs.some(p=>p[0]===a&&p[1]===b))continue;pairs.push([a,b]);}
  let k=0;while(k<want&&pairs.length){const [a,b]=pairs.splice(rnd(pairs.length),1)[0];if(N[a].xl.length>=C.maxPerNode||N[b].xl.length>=C.maxPerNode)continue;N[a].xl.push(b);N[b].xl.push(a);k++;}}
function graphDist(N,from){const d=new Array(N.length).fill(-1),q=[from];d[from]=0;while(q.length){const k=q.shift();for(const j of N[k].links)if(d[j]<0){d[j]=d[k]+1;q.push(j);}}return d;}
function genVaultJunctions(N,ex,sec){const C=VAULT_CFG,d0=graphDist(N,0),d1=graphDist(N,ex),L=d0[ex];
  const onPath=i=>d0[i]+d1[i]===L;
  // distance from the set of junctions on any shortest start-to-exit route
  const dp=new Array(N.length).fill(-1),q=[];N.forEach((n,i)=>{if(onPath(i)){dp[i]=0;q.push(i);}});while(q.length){const k=q.shift();for(const j of N[k].links)if(dp[j]<0){dp[j]=dp[k]+1;q.push(j);}}
  const cand=N.map((n,i)=>i).filter(i=>i>0&&i!==ex&&!onPath(i)&&(N[i].type==='station'||N[i].type==='flooded')&&N[i].cond&&N[i].cond.obj!=='arena');
  const want=Math.min(cand.length,C.perSector[0]+rnd(C.perSector[1]-C.perSector[0]+1)),picked=[];
  for(let k=0;k<want&&cand.length;k++){const w=cand.map(i=>(dp[i]*2+(N[i].links.length===1?2:0))*(picked.some(p=>N[p].links.includes(i))?0.2:1)+0.1);
    let x=Math.random()*w.reduce((a,b)=>a+b,0),ci=0;while(x>w[ci]&&ci<w.length-1){x-=w[ci];ci++;}const i=cand.splice(ci,1)[0];picked.push(i);
    const keys=Object.keys(VAULT_DANGERS),dd=[keys[rnd(keys.length)]];if(sec>=C.minSecond&&Math.random()<C.secondDanger){const rest=keys.filter(k=>k!==dd[0]);dd.push(rest[rnd(rest.length)]);}
    N[i].cond.vault={d:dd};N[i].cond.size='l';}}

// ---- route choice: options at the current junction are its shafts, then its known express shafts
function routeOpts(){const n=curNode(),L=n.links.map(j=>({j,x:false}));for(const j of n.xl||[])if(xKnown(route.cur,j))L.push({j,x:true});return L;}
function xKnown(i,j){return route.lk&&route.lk.has('x'+lkey(i,j));}
function expressCost(j){return j===route.exit?EXPRESS_CFG.costExit:EXPRESS_CFG.cost;}
function expressMid(i,j){const N=route.nodes;return N[i].links.find(m=>N[m].links.includes(j));}
function pickRoute(k){const o=routeOpts()[k];if(!o)return;if(!o.x)return chooseRoute(o.j);const c=expressCost(o.j),P=player;
  if((P.inv.battery||0)<c){sfx('deny');say('the express shaft needs '+c+' batter'+(c>1?'ies':'y')+'. you have '+(P.inv.battery||0));return;}
  P.inv.battery-=c;say('you feed '+c+' batter'+(c>1?'ies':'y')+' to the express car. it drops straight past a junction');chooseRoute(o.j,true);}
function vaultDangerText(v){return 'vault deck: '+v.d.map(k=>VAULT_DANGERS[k].name).join(', ');}

// ---- the archive vault on a vault deck
let archive=null;   // {room,tx,ty,dir,panel,open,burnt,wave2,unstT}
const vaultDanger=k=>!!(cond&&cond.vault&&cond.vault.d.includes(k));
function genArchiveVault(start){archive=null;if(!(cond&&cond.vault))return;const C=VAULT_CFG,dist=bfs(start.cx,start.cy,new Int16Array(MW*MH)),need=Math.round(Math.max(MW,MH)*C.minDist);
  // try far from the arrival lift first, then relax the distance so a vault deck always gets its vault
  for(let t=0;t<140;t++){const small=t>=100,r=attach(1,small?4:C.room[0],small?3:C.room[1],2);if(!r){if(!small){t=99;continue;}break;}
    const out=D4.find(([dx,dy])=>{const x=r.ex+dx,y=r.ey+dy;return !solid(x,y)&&!(x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);});
    const od=out?dist[(r.ey+out[1])*MW+r.ex+out[0]]:-1;
    if(out&&od>=need*(t<60?1:t<90?0.6:0.2)&&od<30000){const [ox,oy]=out;let panel=null;
      for(const s of [1,-1]){const px=r.ex+oy*s,py=r.ey+ox*s;if(map[py*MW+px]===1&&!solid(px+ox,py+oy)){panel={tx:px,ty:py};break;}}
      if(!panel)panel={tx:r.ex,ty:r.ey};
      archive={room:r,tx:r.ex,ty:r.ey,dir:out,panel:{tx:panel.tx,ty:panel.ty,hack:true,reward:'vault',state:'idle',ph:0,hard:true},open:false,burnt:false,wave2:0,unstT:0};return;}
    for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){map[y*MW+x]=1;kind[y*MW+x]=0;}}}
// stock the vault, place its lock panel and any guardian (end of populate(), still seeded)
function fillArchive(){const A=archive;if(!A)return;const r=A.room,C=VAULT_CFG;panels.push(A.panel);
  subSeed(()=>{const n=1+(Math.random()<0.5?1:0),got=items.filter(i=>i.type==='file').map(i=>i.file);for(let k=0;k<n;k++){let id=null;for(let t=0;t<6&&!id;t++){const f=randomFileId();if(f&&!got.includes(f))id=f;}
      if(id){got.push(id);addItem(r,'file',{file:id});}else addItem(r,'clearpack',{amt:2});}});
  addChest(r,'rare');for(const t of C.stash)addItem(r,t);
  if(vaultDanger('guarded')){const ox=A.tx+A.dir[0]*2,oy=A.ty+A.dir[1]*2,ok=!solid(ox,oy),x=(ok?ox:A.tx+A.dir[0])*TS+6,y=(ok?oy:A.ty+A.dir[1])*TS+6;
    const bi=(biomeOverride!=null?biomeOverride:(depth-1))%6,e=mkEnemy('warden',x,y);e.boss=bi;e.hp=e.mhp=36+depth*4;e.mini=true;e.vaultGuard=true;enemies.push(e);A.guard=e;}}
// an elite garrison always has at least one heavy creature (populate())
function eliteHeavy(){if(!vaultDanger('elite'))return;const H=VAULT_CFG.heavy;if(enemies.some(e=>H.includes(e.type)))return;const r=randomRoom(),p=r&&spotIn(r);if(p)enemies.push(mkEnemy(H[rnd(H.length)],p.x,p.y));}
function guardAlive(){return archive&&archive.guard&&!archive.guard.dead;}
// R on the lock panel: dead while the guardian lives
function vaultPanelBlocked(pn){if(pn.reward!=='vault')return false;if(guardAlive()){say('the lock panel is dead. whatever guards this vault keeps it that way');sfx('deny');return true;}return false;}
function vaultFried(pn){if(!archive)return;archive.burnt=true;float(pn.tx*TS+6,pn.ty*TS,'fried','#ff8a5a');say('the lock is fried. it will take a blast to open now');}
function openArchive(how){const A=archive;if(!A||A.open)return;A.open=true;const i=A.ty*MW+A.tx;map[i]=0;paintArea(A.tx,A.ty);flowT=0;if(A.panel.state==='idle')A.panel.state='done';
  const P=player;sfx(how==='blast'?'crumble':'door');shake=Math.max(shake,how==='blast'?8:3);if(how==='blast')say('the blast tears the vault door off its hinges');
  for(let k=0;k<16;k++)parts.push({x:A.tx*TS+6,y:A.ty*TS+6,vx:rr(-60,60),vy:rr(-60,60),t:0.6,m:0.6,c:k%2?'#d9a441':'#8e978b',s:2});
  if(lvl)lvl.vault=1;if(!testMode&&route&&curNode()){const v=curNode().cond&&curNode().cond.vault;if(v)v.opened=true;}
  if(!testMode||testDeck){P.vaultSecs=P.vaultSecs||[];if(!P.vaultSecs.includes(route?route.sector:0))P.vaultSecs.push(route?route.sector:0);}
  if(vaultDanger('lockdown')){raiseAlarm(P.x,P.y,3+rnd(2),'vault');A.wave2=VAULT_CFG.lockdownWave2;}
  if(vaultDanger('unstable')){A.unstT=VAULT_CFG.unstableT;alertM=Math.max(alertM,VAULT_CFG.unstableAlert);say('the deck shudders. the power will not hold for long');}}
// explosions near the door blow it open (explode())
function archiveBlast(x,y,R){const A=archive;if(!A||A.open)return;if(Math.hypot(A.tx*TS+6-x,A.ty*TS+6-y)<R+VAULT_CFG.blastR){alertAdd(VAULT_CFG.blastAlert);openArchive('blast');}}
function updateArchive(dt){const A=archive;if(!A)return;const P=player;
  if(A.wave2>0){A.wave2-=dt;if(A.wave2<=0)raiseAlarm(P.x,P.y,3+rnd(2),'vault');}
  if(A.unstT>0){A.unstT-=dt;if(A.unstT<=0){if(!powerOff)setPower(false);say('the deck power fails. the lights go out');}}
  if(!A.hinted&&!A.open&&Math.hypot(A.tx*TS+6-P.x,A.ty*TS+6-P.y)<30){A.hinted=true;float(A.tx*TS+6,A.ty*TS,'archive vault','#e8c070');}}
function drawArchive(){const A=archive;if(!A||!seen[A.ty*MW+A.tx])return;const x=A.tx*TS-camX,y=A.ty*TS-camY;if(x<-TS||y<-TS||x>W||y>H)return;
  const vert=A.dir[0]!==0;
  if(A.open){F('#2a2418',x,y,TS,TS);if(vert){F('#5a4a2a',x+4,y,4,2);F('#5a4a2a',x+4,y+TS-2,4,2);}else{F('#5a4a2a',x,y+4,2,4);F('#5a4a2a',x+TS-2,y+4,2,4);}return;}
  F('#0e0f0d',x,y,TS,TS);F('#4a4e4a',x+1,y+1,TS-2,TS-2);F('#5e625c',x+2,y+2,TS-4,TS-4);
  for(let k=0;k<2;k++)F('#d9a441',vert?x+1:x+3+k*5,vert?y+3+k*5:y+1,vert?TS-2:1,vert?1:TS-2);
  F('#2a2c28',x+4,y+4,4,4);F(A.burnt?'#5a2a20':guardAlive()?'#802020':(Math.sin(T*3)>0?'#e04030':'#a02818'),x+5,y+5,2,2);}
function drawArchiveMap(ox,oy,s){const A=archive;if(!A||!seen[A.ty*MW+A.tx])return;const r=A.room;ctx.strokeStyle='#d9a441';ctx.lineWidth=1;ctx.strokeRect(ox+r.x*s-0.5,oy+r.y*s-0.5,r.w*s+1,r.h*s+1);F(A.open?'#6a5a30':'#e8c070',ox+A.tx*s,oy+A.ty*s,s,s);}
function pickClearpack(it){const P=player,n=it.amt||2;P.clear=(P.clear||0)+n;float(it.x,it.y,'+'+n+' clearance','#e8c070');say('archive records. worth '+n+' clearance');sfx('learn');}
HACKR.vault={label:'archive vault lock',ok:()=>false,act:()=>{openArchive('hack');return 'the lock gives. the archive vault grinds open';}};
