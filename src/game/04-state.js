// ---------- state ----------
let vendors=[],vendUI=null,ventRooms=[],hatchRooms=[],hatches=[],levers=[],cages=[],openVent=new Uint8Array(MW*MH),levelTimer=0,purgeGas=false;
let lvl=null,runScore=0,report=null,bestScore=0;try{bestScore=+(localStorage.getItem('kd_best')||0);}catch(e){}
function startLevelScore(){
  if(lvl&&player&&player.rs)for(const k of LVLSTAT)player.rs[k]=(player.rs[k]||0)+(lvl[k]||0);
  lvl={t:0,killPts:0,kills:0,ambush:0,hacks:0,items:0,finds:0,chests:0,rare:0,doors:0,secrets:0,dmg:0,par:Math.round(60*AREA)+rooms.length*8};
  let pot=0;for(const e of enemies)pot+=KILLPTS[e.type]||0;
  for(const c of chests)pot+=c.tier==='rare'?150:75;
  pot+=(liftState==='idle'||(cond&&cond.obj==='both')?400+(1+(depth>=4?1:0))*200:0)+vaults.length*60+(secrets.length+ventRooms.length+hatchRooms.length)*250+panels.filter(q=>q.hack).length*150+vendors.length*150+lvl.par*4*0.5+150*AREA;
  lvl.pot=Math.max(300*AREA,pot);
}
function liveLevelScore(){if(!lvl)return 0;return lvl.killPts+lvl.ambush*25+lvl.hacks*150+lvl.items*10+lvl.finds*100+lvl.chests*75+lvl.rare*150+lvl.doors*60+lvl.secrets*250;}
function finishLevel(){
  if(bossRef&&!bossRef.dead&&route&&route.chaser){route.chaser.hp=bossRef.hp;route.chaser.rest=2;}bossRef=null;
  if(player&&player.rs&&lvl&&!testMode&&!stopMode){if(!lvl.dmg&&depth>=2)player.rs.clean=true;if(depth>=3&&!alertWaves)player.rs.quiet=true;}
  if(testDeck){returnToTest();return;}
  if(stopMode){if(stopAmbush&&(enemies.some(e=>!e.dead)||spawnQ.length)){if(T>stopWarnT){stopWarnT=T+2;say('the lift will not move with them in here');}return;}endStop();return;}
  const L=lvl,time=Math.round(Math.max(0,L.par-L.t)*4),clean=L.dmg<10?300:0;
  const lines=[
    ['Enemies put down',L.kills,L.killPts],['Ambushes',L.ambush,L.ambush*25],['Panels and machines hacked',L.hacks,L.hacks*150],
    ['Supplies picked up',L.items,L.items*10],['Gear and chips found',L.finds,L.finds*100],['Chests opened',L.chests+L.rare,L.chests*75+L.rare*150],
    ['Doors unlocked',L.doors,L.doors*60],['Secrets found',L.secrets,L.secrets*250],
    ['Time '+fmtT(L.t)+'  (par '+fmtT(L.par)+')','',time],['Lift held',liftDefended?'yes':'',liftDefended?400:0],['Breaches sealed',coresKilled||'',coresKilled*200],['Waves weathered',waves&&waves.wave?waves.wave:'',waves?waves.wave*150:0],['Waves drawn by noise',alertWaves||'',alertWaves*100],['Clean run (under 10 damage)',clean?'yes':'no',clean]];
  const total=Math.round(lines.reduce((a,l)=>a+l[2],0)*scoreMul()),ratio=total/scoreMul()/L.pot,g=GRADES.find(q=>ratio>=q[1]);
  const P=player,iv=P.inv;let reward='';
  if(g[0]==='S'){const id=randomGear();gainGear(id);iv.scrap+=5;iv.key++;reward=GEAR[id].name.toLowerCase()+', 5 scrap and a key';}
  else if(g[0]==='A'){iv.scrap+=4;iv.key++;reward='4 scrap and a key';}
  else if(g[0]==='B'){iv.scrap+=3;reward='3 scrap';}
  else if(g[0]==='C'){iv.scrap+=1;reward='1 scrap';}
  else reward='nothing';
  runScore+=total;
  if(alertWaves>=3&&Math.random()<0.35)alertCarry=true;else if(alertWaves>0&&!alertCarry)alertWaves=0;
  {const cl=1+(g[0]==='S'||g[0]==='A'?1:0);player.clear+=cl;reward+=(reward==='nothing'?'. ':' + ')+cl+' clearance';}
  report={lines,total,grade:g,reward,start:T,run:runScore,drawn:runAlertWaves,carry:alertCarry};
  state='report';menuOpen=false;mapOpen=false;mouse.l=false;mouse.r=false;sfx('lift');
}
function fmtT(t){t=Math.round(t);return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');}
function reportAdvance(){const shown=(T-report.start)/0.18;if(shown<report.lines.length+3){report.start=T-99;return;}report=null;if(pendingSkip>1){for(let k=0;k<pendingSkip-1;k++){if(route.cur===route.exit)break;const d=nodeDist(route.exit);let best=route.cur;for(const j of curNode().links)if(d[j]<d[best])best=j;route.cur=best;route.nodes[best].known=true;route.nodes[best].visited=true;depth++;}}pendingSkip=0;openRoute();}
function saveBest(){if(testMode)return;const tot=runScore+liveLevelScore();if(tot>bestScore){bestScore=tot;try{localStorage.setItem('kd_best',''+bestScore);}catch(e){}}}
function drawReport(){
  const r=report,pw=300,ph=206,px=(W-pw)>>1,py=(H-ph)>>1,shown=Math.floor((T-r.start)/0.18);
  F('#050607',0,0,W,H);box(px,py,pw,ph,'#0a0d0c','#1f2524');F(AMBER,px,py,pw,2);
  txt('DECK REPORT',px+10,py+8,AMBER);txt('depth '+depth+'  /  '+(levelLabel||sector(depth)).toLowerCase(),px+pw-10,py+8,'#5d655f','right');
  r.lines.forEach((l,i)=>{if(i>=shown)return;const yy=py+24+i*11,zero=!l[2];
    txt(l[0],px+10,yy,zero?'#4f5a55':'#b9c0b3');if(l[1]!=='')txt(''+l[1],px+200,yy,zero?'#4f5a55':'#8e978b','right');txt(l[2]?'+'+l[2]:'0',px+pw-10,yy,zero?'#4f5a55':'#e3e6dc','right');});
  const n=r.lines.length,base=py+24+n*11+4;
  if(shown>n){F('#1f2524',px+10,base,pw-20,1);txt('Deck score',px+10,base+5,AMBER);txt(''+r.total,px+pw-10,base+5,AMBER,'right');}
  if(shown>n+1){const g=r.grade;txt('Grade',px+10,base+19,'#8e978b');txt(g[0],px+62,base+14,g[2],'left',16);
    txt('reward: '+r.reward,px+pw-10,base+19,g[0]==='D'?'#5d655f':'#9fcf9a','right');}
  if(shown>n+2){txt('Run total',px+10,base+35,'#8e978b');txt(''+r.run,px+pw-10,base+35,'#e3e6dc','right');if(r.drawn)txt('waves drawn this run: '+r.drawn+(r.carry?'  (they are following you)':''),px+10,base+45,r.carry?'#ff8a7a':'#6f7a6a');
    if(Math.sin(T*4)>-0.3)txt('Enter or click to ride on',px+pw/2,py+ph-12,'#e8dcb0','center');}
}
let powerOff=false,powerPrev=null,cond={light:'normal',haz:null},hazOff=false,hz=new Uint8Array(MW*MH),fires=[],vents=[],anoms=[],panels=[],hackUI=null,glows=[];
function rollCond(type){if(!['station','flooded','cache'].includes(type))return null;
  const light=wpick([['normal',70],['lit',15],['dark',15]]);
  const haz=wpick([['none',45],['fog',12],['steam',11],['fire',type==='flooded'?0:11],['toxic',11],['anomaly',depth>=3?10:3],['electrical',type==='flooded'?12:9],['volatile',9],['overgrowth',depth>=2?8:3],['sprinklers',6],['chasm',depth>=2?8:2],['molten',depth>=3?7:0]]);
  const obj=wpick([['open',55],['keycard',17],['defend',depth>=2?16:6],['both',depth>=3?5:0],['arena',0]]);
  const ev=obj!=='arena'&&depth>=2&&Math.random()<0.12?'waves':null;
  const haunt=depth>=3&&Math.random()<0.08,lowg=depth>=3&&Math.random()<0.08;
  return {light,haz:haz==='none'?null:haz,obj,ev,haunt,lowg,size:wpick(DECK_SIZE_ODDS.normal)};}
const OBJNAME={arena:'arena',keycard:'lift keycard',defend:'hold the lift',both:'keycard, hold the lift'};
function condText(c){if(!c)return '';return [COND_LIGHT[c.light],c.haz?COND_HAZ[c.haz]:'',OBJNAME[c.obj]||'',c.ev==='waves'?'incoming waves':'',c.haunt?'haunted':'',c.lowg?'low gravity':'',c.size&&c.size!=='m'?DECK_SIZES[c.size].name:''].filter(Boolean).join(', ');}
let lamps=[],furn=new Uint8Array(MW*MH),molten=new Uint8Array(MW*MH),webs=new Uint8Array(MW*MH),chasm=new Uint8Array(MW*MH),liq=new Uint8Array(MW*MH),testMode=false,route=null,routeSel=0,levelMods={},nextMods={},nodeUI=null,nodeSel=0,titleSel=0,levelLabel='',testLabels=[];
let map,kind,seen,secretHp,openDoor,rooms,vaults=[],secrets=[],exitT,depth=1,player,S=null,curPal=PAL[0];
let enemies=[],bullets=[],items=[],parts=[],charges=[],flares=[],texts=[],lights=[],chests=[];
let flow=new Int16Array(MW*MH),flowT=0,shake=0,state='title',msgs=[],kills=0,menuOpen=false,menuTab=0,mapOpen=false;
let bannerT=0,hintT=0,deadT=0,seed=0,T=0,flickT=0,sonarT=0,sonarRing=0;
let camX=0,camY=0,uiRects=[],hoverInfo=null,onlyCraftable=false,wbSel=0,wbScroll=0,eqSel=0,eqScroll=0;
const K={},mouse={sx:W/2,sy:H/2,l:false,r:false,moved:false};

function solid(tx,ty){return tx<0||ty<0||tx>=MW||ty>=MH||map[ty*MW+tx]!==0;}
function solidAt(x,y){return solid(Math.floor(x/TS),Math.floor(y/TS));}
function cageAt(tx,ty){for(const c of cages)if(!c.open&&tx>=c.tx&&tx<c.tx+c.w&&ty>=c.ty&&ty<c.ty+c.h)return true;return false;}
function blockAt(x,y,pl,e){const tx=Math.floor(x/TS),ty=Math.floor(y/TS);if(tx<0||ty<0||tx>=MW||ty>=MH)return true;const m=map[ty*MW+tx];
  if(m!==0&&!(pl&&m===4))return true;
  if(furn[ty*MW+tx])return true;
  if(chasm[ty*MW+tx]){if(pl){if(!player.floating)return true;}else if(e&&e.type){const b=ET[e.type];if(!b.fly&&!b.ghost)return true;}}
  if(e&&!pl&&e.type){const b=ET[e.type],lq=liq[ty*MW+tx];if(b.aquatic){if(lq<3||ice[ty*MW+tx])return true;}else if(lq===4&&!b.swim&&!b.fly&&!flot[ty*MW+tx]&&!ice[ty*MW+tx])return true;}if(cages.length&&cageAt(tx,ty))return true;return false;}
function blocked(x,y,r,pl,e){return blockAt(x-r,y-r,pl,e)||blockAt(x+r,y-r,pl,e)||blockAt(x-r,y+r,pl,e)||blockAt(x+r,y+r,pl,e);}
function move(e,dx,dy){const pl=e===player;if(!blocked(e.x+dx,e.y,e.r,pl,e))e.x+=dx;if(!blocked(e.x,e.y+dy,e.r,pl,e))e.y+=dy;}
function hash(x,y){let h=(Math.imul(x,374761393)+Math.imul(y,668265263)+seed)|0;h=Math.imul(h^(h>>>13),1274126177);return (h^(h>>>16))>>>0;}

