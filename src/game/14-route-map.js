// ---- route map
let bossPending=false;
function spawnBoss(){bossPending=false;const c=route.chaser;if(!c)return;const B=BOSSES[c.boss],P=player;let best=null,bd=0;for(const r of rooms){const d=Math.hypot(r.cx*TS-P.x,r.cy*TS-P.y);if(d>bd&&!(r.cx===exitT.x&&r.cy===exitT.y)){const t=freeTile(r);if(t){bd=d;best=t;}}}
  if(!best)return;const e=mkEnemy('warden',best.tx*TS+6,best.ty*TS+6);e.boss=c.boss;e.hp=e.mhp=c.hp!=null?c.hp:60+depth*6;e.mhp=60+depth*6;e.alert=true;enemies.push(e);bossRef=e;
  bannerBoss=4;say('the '+B.name.toLowerCase()+' is on this deck. kill it or reach the lift');sfx('alarm');shake=8;}
let bossRef=null,bannerBoss=0;
// Only about 1 in 40 attempts lands the exit 3-4 jumps away with every junction connected, so allow plenty of
// attempts (well under a millisecond on average). The straight-line fallback below is then never reached in practice.
function genSector(sec){
  for(let tries=0;tries<3000;tries++){const N=[{x:0.04,y:0.5,type:'station',known:true,cond:{light:'normal',haz:null},links:[]}];
    const tgt=12+rnd(4);for(let k=0;k<400&&N.length<tgt;k++){const x=0.14+Math.random()*0.72,y=0.08+Math.random()*0.84;if(N.some(n=>Math.hypot((n.x-x)*1.6,n.y-y)<0.2))continue;
      const d=depth+Math.round(x*3);const type=wpick([['station',60],['flooded',d>=2?13:6],['cache',12],['rest',5],['merchant',5],['event',5]]);N.push({x,y,type,known:false,links:[],cond:rollCond(type)});}
    N.push({x:0.96,y:0.15+Math.random()*0.7,type:'station',known:true,exit:true,links:[],cond:rollCond('station')});
    for(let i=0;i<N.length;i++)for(let j=i+1;j<N.length;j++){const dd=Math.hypot((N[i].x-N[j].x)*1.6,N[i].y-N[j].y);if(dd<0.42){N[i].links.push(j);N[j].links.push(i);}}
    const dist=new Array(N.length).fill(-1),q=[0];dist[0]=0;while(q.length){const k=q.shift();for(const j of N[k].links)if(dist[j]<0){dist[j]=dist[k]+1;q.push(j);}}
    const ex=N.length-1;if(dist[ex]<3||dist[ex]>4||dist.some(v=>v<0))continue;
    for(const n of N)n.links.sort((a,b)=>N[a].y-N[b].y);
    {const cand=N.map((n,i)=>i).filter(i=>i>0&&i!==ex&&(N[i].type==='station'||N[i].type==='flooded')&&dist[i]>=1);for(const n of N)if(n.cond&&n.cond.obj==='arena')n.cond.obj='open';
      const want=Math.min(cand.length,(depth>=2||sec>=1?1:0)+(Math.random()<0.55?1:0));for(let k=0;k<want;k++){const i=cand.splice(rnd(cand.length),1)[0];N[i].cond.obj='arena';}}
    // the exit deck and arena decks lean large
    for(const n of N)if(n.cond&&(n.exit||n.cond.obj==='arena'))n.cond.size=wpick(DECK_SIZE_ODDS.big);
    genExpress(N);genVaultJunctions(N,ex,sec);
    return {nodes:N,exit:ex};}
  const N=[{x:0.04,y:0.5,type:'station',known:true,links:[1],cond:{light:'normal',haz:null}}];for(let k=1;k<=3;k++)N.push({x:0.04+k*0.3,y:0.5,type:'station',known:k===3,exit:k===3,links:[k-1].concat(k<3?[k+1]:[]),cond:rollCond('station')});N[3].cond.size=wpick(DECK_SIZE_ODDS.big);return {nodes:N,exit:3};}
function newSector(sec){seeded(['sector',sec],()=>newSector0(sec));}
function newSector0(sec){const g=genSector(sec);route.sector=sec;route.nodes=g.nodes;route.exit=g.exit;route.cur=0;route.chaser=null;route.lk=new Set();learnLinks(0);biomeOverride=testMode?biomeOverride:sec%6;
  if(sec>=1||runAlertWaves>=3){const far=route.nodes.map((n,i)=>i).filter(i=>i>0&&i!==route.exit&&route.nodes[i].x>0.45);if(far.length&&Math.random()<Math.min(0.9,0.45+sec*0.15+runAlertWaves*0.05))route.chaser={at:far[rnd(far.length)],boss:sec%6,hp:null};}
  ensureLayers();}
function newRoute(){route={sector:0,nodes:[],cur:0,exit:0,chaser:null};newSector(0);}
const curNode=()=>route.nodes[route.cur];
function nodeDist(from){const N=route.nodes,dist=new Array(N.length).fill(-1),q=[from];dist[from]=0;while(q.length){const k=q.shift();for(const j of N[k].links)if(dist[j]<0){dist[j]=dist[k]+1;q.push(j);}}return dist;}
const lkey=(i,j)=>i<j?i+'-'+j:j+'-'+i;
function learnLinks(i){if(!route.lk)route.lk=new Set();for(const j of route.nodes[i].links)route.lk.add(lkey(i,j));for(const j of route.nodes[i].xl||[])route.lk.add('x'+lkey(i,j));}
function knownDist(from){const N=route.nodes,dist=new Array(N.length).fill(-1),q=[from];dist[from]=0;while(q.length){const k=q.shift();for(const j of N[k].links)if(dist[j]<0&&linkKnown(k,j)){dist[j]=dist[k]+1;q.push(j);}}return dist;}
function linkKnown(i,j){return route.lk&&route.lk.has(lkey(i,j));}
function revealNear(r){const d=nodeDist(route.cur);route.nodes.forEach((n,i)=>{if(d[i]>=0&&d[i]<=r){n.known=true;if(d[i]<r)learnLinks(i);}});if(route.chaser&&d[route.chaser.at]>=0&&d[route.chaser.at]<=r)route.chaserSeen=2;}
function revealFar(){const N=route.nodes,L=N.map((n,i)=>i).filter(i=>!N[i].known&&i!==route.cur);if(!L.length)return 0;const i=L[rnd(L.length)];N[i].known=true;learnLinks(i);return 1;}
function ensureLayers(){if(S&&S.decoder)revealNear(2);}
function revealNextRoutes(){learnLinks(route.cur);for(const j of curNode().links){route.nodes[j].known=true;learnLinks(j);}}
function moveChaser(){const c=route.chaser;if(!c)return;if(c.rest>0){c.rest--;return;}const d=nodeDist(route.cur);let best=c.at;for(const j of route.nodes[c.at].links)if(d[j]>=0&&d[j]<d[best])best=j;if(Math.random()<0.75)c.at=best;}
function openRoute(){if(route.nodes&&route.cur===route.exit&&!testMode){newSector(route.sector+1);if(route.sector>META.maxSector){META.maxSector=route.sector;saveMeta();}say('the lift drops into a new section of the station: '+BNAMES[route.sector%6].toLowerCase());}setTimeout(saveRun,0);ensureLayers();state='route';routeSel=0;menuOpen=false;mapOpen=false;mouse.l=false;mouse.r=false;sfx('lift');}
// the lift ride between two junctions, keying its event and any landing it stops at
let liftKey=null;
// express: an express shaft (pickRoute() has already taken the batteries); it never stops on the way
function chooseRoute(j,express){tickInjuries();liftKey=['lift',route.sector,route.cur,j].concat(express?['x']:[]);route.cur=j;if(!(route.chaser&&route.chaser.at===j))moveChaser();depth++;const n=curNode();n.known=true;n.visited=true;learnLinks(j);if(route.chaserSeen>0)route.chaserSeen--;
  if(express){if(route.chaserSeen>0)route.chaserSeen--;enterNode(n);return;}
  const tr=nextTransit!==null?nextTransit:seeded(liftKey,rollTransit);nextTransit=null;if(tr&&tr.type!=='none'&&!testMode)return seeded(liftKey,()=>startTransit(tr,n));enterNode(n);}
