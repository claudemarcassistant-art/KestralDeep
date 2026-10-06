// ---------- flow ----------
function initPlayer(){
  lvl=null;
  runStops=0;transitToast=0;nextTransit=null;pendingNode=null;stopMode=false;stopAmbush=false;transitAfter=null;
  runScore=0;alertM=0;alertWaves=0;runAlertWaves=0;alertCarry=false;report=null;bestiary={seen:{},kills:{}};
  depth=1;kills=0;msgs=[];hintT=20;sonarT=0;levelMods={};nextMods={};
  player={x:0,y:0,r:3.8,hp:100,armor:0,ang:0,weapon:'pistol',has:{pistol:true,scatter:false,nailer:false,bolt:false,ray:false,cutter:false,crowbar:false,bat:false,spear:false,shield:false},arms:[{main:null,off:'pistol'},{main:null,off:null}],armSet:0,mag:{pistol:10},reloadT:0,tank:{kind:null,n:0},injuries:[],injAcc:0,rs:{},ach:{},ap:0,subBonus:{},coreBonus:{},foodXp:0,foodLv:0,ghost:0,tools:{},glowOn:false,acts:[],actbar:[null,null,null,null,null,null,null],actMode:false,actCd:{},slActs:[],slingbar:[null,null,null,null,null,null,null],slCd:0,files:{},found:FILES.filter(f=>f.starter).map(f=>f.id),clear:1,raw:{},quick:['charge','flare','medpatch','stim','antitox','emetic',null],quickSel:0,hotSel:0,qBonus:0,skillIdx2:-1,flask:{has:false,kind:null,n:0},guard:40,ward:0,mcd:0,
    inv:{mine:0,surgery:0,knives:0,fuel:0,medkit:0,trauma:0,regen:0,molotov:0,gasnade:0,smokenade:0,medpatch:0,stim:0,antitox:0,rounds:30,shells:0,nails:0,bolts:0,cells:0,scrap:0,powder:0,pipe:0,battery:0,cloth:0,key:0,charge:1,flare:1},
    gear:{shoulders:null,head:'hardhat',body:null,hands:null,legs:null,feet:null,back:null,acc:[null,null,null,null]},bag:[],
    st:{psn:0,shk:0,stn:0,wet:0,stk:0,brn:0,rad:0,slk:0,frz:0},food:{},sat:0,buffs:[],vomitCd:0,dazeT:0,stnImm:0,psnAcc:0,skills:[],skillIdx:0,moveSkills:['sprint'],moveIdx:0,moveOn:{dash:true,creep:true,float:true},vx:0,vy:0,stam:100,stamLock:false,stamDelay:0,dashT:0,dashCd:0,iframeT:0,stimT:0,sprinting:false,creeping:false,stepT:0,skillCd:{},upg:{weight:0,knuck:0,haft:0,arc:0,quick:0},adrenT:0,regenAcc:0,
    cd:0,shoveCd:0,shoveT:0,hurtT:0,flashT:0,emptyT:0,aiming:false,moveMul:1,look:0.22,sloshT:0};
  refreshStats();newRoute();
}
let META={maxSector:0,ach:{},hunters:0,seen:{},setup:{start:0,mods:[]}};try{Object.assign(META,JSON.parse(localStorage.getItem('kd_meta')||'{}'));}catch(e){}
function saveMeta(){try{localStorage.setItem('kd_meta',JSON.stringify(META));}catch(e){}}
let runMods={};
const MODS_RUN=[{id:'glass',name:'Glass cannon',desc:'Half max health, but everything you do hits 40% harder.',unlock:'Earn the Sharpshooter achievement.',ok:()=>META.ach.crits},
  {id:'dark',name:'Lights out',desc:'Every deck is dark.',unlock:'Earn the Ghost of the deck achievement.',ok:()=>META.ach.quiet},
  {id:'hunted',name:'Hunted',desc:'A hunter stalks you from the very first sector.',unlock:'Kill a sector hunter.',ok:()=>META.hunters>0},
  {id:'lean',name:'Lean times',desc:'Far fewer supplies lying around.',unlock:'Earn the Deep diver achievement.',ok:()=>META.ach.deep},
  {id:'swarm',name:'Swarming',desc:'Each deck holds about a third more creatures.',unlock:'Earn the Exterminator achievement.',ok:()=>META.ach.exterm}];
function scoreMul(){return 1+0.25*Object.keys(runMods).filter(k=>runMods[k]).length;}
function newGame(){arcadeMode=false;testMode=false;testDeck=false;biomeOverride=null;cond={light:'normal',haz:null};hazOff=false;clearSave();
  runMods={};for(const id of META.setup.mods||[]){const m=MODS_RUN.find(q=>q.id===id);if(m&&m.ok())runMods[id]=true;}
  initPlayer();testLabels=[];levelLabel='';
  const st=Math.max(0,Math.min(META.setup.start||0,META.maxSector||0));if(st>0){newSector(st);depth=1+st*4;player.clear+=2*st;player.inv.scrap+=10*st;player.inv.medkit=(player.inv.medkit||0)+st;for(let k=0;k<st;k++)gainGear(randomGear());}
  if(runMods.hunted&&!route.chaser){const far=route.nodes.map((n,i)=>i).filter(i=>i>0&&i!==route.exit&&route.nodes[i].x>0.45);if(far.length)route.chaser={at:far[rnd(far.length)],boss:route.sector%BOSSES.length};}
  refreshStats();player.hp=maxHp();enterLevel();state='play';}
function saveRun(){if(testMode||arcadeMode||!player||player.hp<=0)return;try{
  const pl=Object.assign({},player,{grabbedBy:null,tripped:null,astral:null,foeC:null});
  const data={v:1,player:pl,route:Object.assign({},route,{lk:[...(route.lk||[])]}),depth,runScore,runAlertWaves,alertCarry,runStops,nextMods,bestiary,runMods,nextTransit};
  localStorage.setItem('kd_save',JSON.stringify(data,(k,v)=>v instanceof Set?[...v]:v instanceof Map?undefined:v));
  for(const k in bestiary.seen)META.seen[k]=1;if(route.sector>META.maxSector)META.maxSector=route.sector;saveMeta();}catch(e){console.warn('save failed',e);}}
function hasSave(){try{return !!localStorage.getItem('kd_save');}catch(e){return false;}}
setTimeout(()=>{if(state==='title'&&!hasSave())titleSel=1;},0);
function clearSave(){try{localStorage.removeItem('kd_save');}catch(e){}}
function loadRun(){let d;try{d=JSON.parse(localStorage.getItem('kd_save'));}catch(e){d=null;}if(!d){say('no saved run');sfx('deny');return;}
  arcadeMode=false;testMode=false;testDeck=false;cond={light:'normal',haz:null};hazOff=false;initPlayer();Object.assign(player,d.player);
  route=d.route;route.lk=new Set(route.lk||[]);depth=d.depth;runScore=d.runScore||0;runAlertWaves=d.runAlertWaves||0;alertCarry=!!d.alertCarry;runStops=d.runStops||0;nextMods=d.nextMods||{};bestiary=d.bestiary||{seen:{},kills:{}};runMods=d.runMods||{};nextTransit=d.nextTransit||null;
  biomeOverride=route.sector%6;testLabels=[];levelLabel='';refreshStats();ensureLayers();state='route';routeSel=0;menuOpen=false;mapOpen=false;sfx('map');say('run resumed at depth '+depth);}
let liftState='open',liftCard=false,alarmT=0,alarmMax=0,cores=[],spawnQ=[],liftMsgT=0,alarmBeep=0,liftDefended=false,coresKilled=0;
function setupObjective(startR,exitR,forced){
  const obj=forced||(cond&&cond.obj)||'open';liftCard=false;alarmT=0;cores=[];spawnQ=[];liftDefended=false;coresKilled=0;
  waves=cond&&cond.ev==='waves'&&!forced?{phase:'wait',trigT:rr(60,90),trigPct:rr(0.4,0.6),wave:0,n:3,t:0,chk:0,pct:0}:null;
  liftState=obj==='arena'?'arena':obj==='keycard'||obj==='both'?'locked':obj==='defend'?'idle':'open';
  if(liftState==='locked'){
    const far=rooms.filter(r=>r!==startR&&r!==exitR&&Math.abs(r.cx-exitT.x)+Math.abs(r.cy-exitT.y)>12);
    const cand=enemies.filter(e=>!ET[e.type].dummy&&!e.caged&&Math.hypot(e.x-exitT.x*TS,e.y-exitT.y*TS)>120);
    if(Math.random()<0.4&&cand.length){const e=cand[rnd(cand.length)];e.carrier=true;e.hp*=1.5;}
    else addItem((far.length?far:rooms.slice(1))[rnd(far.length||rooms.length-1)],'liftcard');
  }
}
function startAlarm(){
  liftState='alarm';alarmMax=alarmT=Math.min(60,38+depth*3);alarmBeep=0;sfx('alarm');
  say('lift called. it is coming, and so is everything else');for(const e of enemies)if(!e.caged&&!ET[e.type].dummy)e.alert=true;
  const n=1+(depth>=4?1:0);
  for(let k=0;k<n;k++){for(let t=0;t<80;t++){const a=Math.random()*6.283,d=rr(6,10),tx=Math.round(exitT.x+Math.cos(a)*d),ty=Math.round(exitT.y+Math.sin(a)*d);
    if(solid(tx,ty)||liq[ty*MW+tx]>=3||hz[ty*MW+tx])continue;if(cores.some(c=>Math.abs(c.tx-tx)+Math.abs(c.ty-ty)<5))continue;
    cores.push({tx,ty,x:tx*TS+6,y:ty*TS+6,hp:25,max:25,t:rr(1,2.5),dead:false,flash:0,ph:Math.random()*6});break;}}
}
function queueSpawn(core){
  const p=player,near=[];
  for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const tx=core.tx+dx,ty=core.ty+dy;if(solid(tx,ty)||liq[ty*MW+tx]>=3)continue;
    if(Math.hypot(tx*TS+6-p.x,ty*TS+6-p.y)<40)continue;near.push([tx,ty]);}
  const walls=[];for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){const tx=core.tx+dx,ty=core.ty+dy;
    if(tx<1||ty<1||tx>=MW-1||ty>=MH-1||map[ty*MW+tx]!==1||solid(tx,ty+1)||map[ty*MW+tx-1]!==1||map[ty*MW+tx+1]!==1)continue;if(Math.hypot(tx*TS+6-p.x,(ty+1)*TS+6-p.y)<40)continue;walls.push([tx,ty]);}
  const kind=wpick([['floor',near.length?3:0],['wall',walls.length?2:0],['drop',near.length?3:0]]);
  if(kind==='wall'){const [tx,ty]=walls[rnd(walls.length)];spawnQ.push({kind,tx,ty,x:tx*TS+6,y:(ty+1)*TS+6,t:0.9});}
  else if(near.length){const [tx,ty]=near[rnd(near.length)];spawnQ.push({kind,tx,ty,x:tx*TS+6,y:ty*TS+6,t:0.9});}
}
function doSpawn(q){
  const e=mkEnemy(pickType(),q.x,q.y);e.alert=true;enemies.push(e);
  if(q.kind==='floor'){const px=q.tx*TS,py=q.ty*TS;mctx.fillStyle='#050606';mctx.fillRect(px+2,py+2,8,8);mctx.fillStyle='#3a423f';mctx.fillRect(px+1,py+2,2,1);mctx.fillRect(px+9,py+8,2,1);mctx.fillRect(px+4,py+10,3,1);
    for(let k=0;k<10;k++)parts.push({x:q.x,y:q.y,vx:rr(-60,60),vy:rr(-60,60),t:0.5,m:0.5,c:k%2?'#4a5450':'#8e978b',s:1});sfx('crumble');}
  else if(q.kind==='wall'){const px=q.tx*TS,py=q.ty*TS;mctx.fillStyle='#030404';mctx.fillRect(px+2,py+3,8,TS-3);mctx.fillStyle='#6b5220';mctx.fillRect(px+1,py+2,1,TS-2);mctx.fillRect(px+10,py+2,1,TS-2);
    mctx.fillStyle='#3a423f';mctx.fillRect(px+6,py+TS-1,5,1);for(let k=0;k<10;k++)parts.push({x:q.x,y:q.y-6,vx:rr(-50,50),vy:rr(-10,60),t:0.5,m:0.5,c:'#ffe7a0',s:1});sfx('door');}
  else{e.stun=1.2;for(let k=0;k<12;k++){const a=k/12*6.283;parts.push({x:q.x,y:q.y+2,vx:Math.cos(a)*40,vy:Math.sin(a)*20,t:0.4,m:0.4,c:'#6a726c',s:2});}sfx('thud');shake=Math.max(shake,2);}
}
function hitCore(c,d){if(c.dead)return;c.hp-=d;c.flash=0.08;sfx('hit');
  if(c.hp<=0){c.dead=true;coresKilled++;alarmT=Math.max(3,alarmT-10);sfx('crumble');shake=Math.max(shake,5);
    for(let k=0;k<30;k++){const a=Math.random()*6.283,sp=rr(30,140);parts.push({x:c.x,y:c.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:0.6,m:0.6,c:k%2?'#ff5a6a':'#c9a8ff',s:rnd(2)+1});}
    say(cores.every(q=>q.dead)?'last breach sealed. nothing more is coming through':'breach sealed. the lift is 10 seconds closer');}}
let waves=null;
function explored(){let n=0,t=0;for(let i=0;i<MW*MH;i++)if(map[i]===0&&kind[i]!==3&&kind[i]!==4){t++;if(seen[i])n++;}return t?n/t:0;}
function updateWaves(dt){
  const w=waves;if(!w||w.phase==='done')return;
  if(w.phase==='wait'){w.trigT-=dt;w.chk-=dt;if(w.chk<=0){w.chk=1;w.pct=explored();}
    if(w.trigT<=0||w.pct>=w.trigPct){w.phase='warn';w.t=5;say('the deck shudders. something is coming up from below');sfx('alarm');shake=Math.max(shake,4);}}
  else if(w.phase==='warn'){w.t-=dt;if(w.t<=0){w.phase='active';w.t=0;}}
  else{w.t-=dt;if(w.t<=0){if(w.wave>=w.n){w.phase='done';say('the deck goes quiet again');return;}
    w.wave++;w.t=13;const cnt=3+rnd(2)+Math.floor(depth/3),p=player;
    const far=rooms.filter(r=>Math.hypot(r.cx*TS-p.x,r.cy*TS-p.y)>100);
    for(let k=0;k<cnt;k++){const r=(far.length?far:rooms)[rnd(far.length||rooms.length)];queueSpawn({tx:r.cx,ty:r.cy});}
    say('wave '+w.wave+' of '+w.n);sfx('alarm');}}
}
function updateObjective(dt){
  const p=player;liftMsgT-=dt;
  if(liftState==='arena'&&!spawnQ.length&&!arenaFoes().length){liftState='open';say('the arena is clear. the lift unlocks');if(Math.random()<0.35){const ks=Object.keys(SUBS);items.push({x:exitT.x*TS+6,y:(exitT.y+1)*TS+6,type:'tonic',sub:ks[rnd(ks.length)],ph:0});say('something was left by the lift');}sfx('hackwin');shake=Math.max(shake,2);}
  for(const q of spawnQ){q.t-=dt;
    if(q.kind==='floor'&&Math.random()<0.4)parts.push({x:q.x+rr(-4,4),y:q.y+rr(-4,4),vx:0,vy:rr(-15,-5),t:0.3,m:0.3,c:'#6a726c',s:1});
    if(q.kind==='wall'&&Math.random()<0.4)parts.push({x:q.x+rr(-4,4),y:q.y-8,vx:rr(-20,20),vy:rr(-10,20),t:0.2,m:0.2,c:'#ffe7a0',s:1});
    if(q.t<=0){q.done=true;doSpawn(q);}}
  spawnQ=spawnQ.filter(q=>!q.done);
  if(liftState!=='alarm')return;
  alarmT-=dt;alarmBeep-=dt;if(alarmBeep<=0){alarmBeep=1.3;sfx('alarm');}
  for(const c of cores){if(c.dead)continue;c.flash-=dt;c.t-=dt;if(c.t<=0){c.t=rr(3.2,5)-Math.min(1.5,depth*0.15);queueSpawn(c);}}
  if(alarmT<=0){liftState='ready';liftDefended=true;spawnQ=[];sfx('hackwin');say('the lift is here. get on');}
}
function segDist(px,py,ax,ay,bx,by){const vx=bx-ax,vy=by-ay,l2=vx*vx+vy*vy||1;let t=((px-ax)*vx+(py-ay)*vy)/l2;t=Math.max(0,Math.min(1,t));return Math.hypot(px-ax-vx*t,py-ay-vy*t);}
function severTentacle(e,why){if(player.grabbedBy===e)player.grabbedBy=null;e.st='retract';e.cd=4;e.flash=0.1;sfx('thud');float(e.tip.x,e.tip.y-6,why,'#e0b0d0');
  for(let k=0;k<6;k++)parts.push({x:e.tip.x,y:e.tip.y,vx:rr(-40,40),vy:rr(-40,40),t:0.4,m:0.4,c:'#9a5aa8',s:1});e.hp-=1;if(e.hp<=0)damageEnemy(e,1,0,0,0);}
function resetLevelState(){levelTimer=0;if(player)player.grabbedBy=null;purgeGas=false;if(player)clearStatus();bullets=[];parts=[];charges=[];flares=[];texts=[];lights=[];flowT=0;bannerT=3;menuOpen=false;mapOpen=false;sonarT=0;player.vx=0;player.vy=0;}
function vomit(why){const p=player;p.sat=0;p.buffs=[];refreshStats();hurtPlayer(4,true);sfx('slosh');say(why);
  for(let k=0;k<14;k++)parts.push({x:p.x+Math.cos(p.ang)*4,y:p.y+Math.sin(p.ang)*4,vx:Math.cos(p.ang+rr(-0.6,0.6))*rr(30,70),vy:Math.sin(p.ang+rr(-0.6,0.6))*rr(30,70),t:0.5,m:0.5,c:'#9a9a50',s:2});
  splat(p.x+Math.cos(p.ang)*8,p.y+Math.sin(p.ang)*8,'#5a5a30',10,4);}
function eatFood(id){const p=player,f=FOOD[id];if(!p.food[id])return;const fs=Math.round(f.sat*(1-0.1*U('cook')));if(p.sat+fs>100){say('too full to eat that');sfx('click');return;}
  p.food[id]--;p.sat+=fs;if(id==='ginsu'){const n=cureInjury(true);setTimeout(()=>say(n?'warmth floods through you. '+n+' injur'+(n>1?'ies':'y')+' mended':'it tastes of nothing much'),60);}p.rs.eaten=(p.rs.eaten||0)+1;p.buffs.push({id,lv:f.lv+(U('cook')>=2?1:0)});gainFoodXp(Math.round(f.sat*(COOK.some(c=>c.out===id)?1.5:1)));refreshStats();sfx('pick');say('ate '+f.name.toLowerCase()+'. '+f.desc.toLowerCase());}
function enterLevel(){
  wells=[];orbiters=[];mines=[];soaks=[];senseT=0;if(player)player.astral=null;clouds=[];nades=[];emitters=[];flames=[];webs=new Uint8Array(MW*MH);if(player)player.blastDrill=false;if(player){player.windUsed=false;player.o2=100;}
  alertLock=false;choiceUI=null;diceUI=null;
  if(alertCarry){alertCarry=false;alertM=40;alertRumble=false;setTimeout(()=>say('they followed you down. the disturbance carries over'),50);}else{alertM=0;alertWaves=0;alertRumble=false;}
  if(player&&player.buffs){for(const b of player.buffs)b.lv--;player.buffs=player.buffs.filter(b=>b.lv>0);refreshStats();}
  testLabels=[];testConsole=null;spawnUI=null;
  const arenaLvl=cond&&cond.obj==='arena';const {start,exitR,arena}=arenaLvl?genArena():genLevel();
  player.x=start.cx*TS+TS/2;player.y=start.cy*TS+TS/2;arrival=makeArrivalCab(start);if(arrival){player.x=arrival.cx*TS+6;player.y=arrival.cy*TS+6;}
  if(perk('cartog'))for(let y=exitR.y-1;y<=exitR.y+exitR.h;y++)for(let x=exitR.x-1;x<=exitR.x+exitR.w;x++)if(x>=0&&y>=0&&x<MW&&y<MH)seen[y*MW+x]=1;
  resetLevelState();populate(start,exitR);if(!arrival)enemies=enemies.filter(e=>ET[e.type].plant||Math.hypot(e.x-player.x,e.y-player.y)>130);if(arenaLvl){const mini=depth>=3&&!bossPending&&Math.random()<0.5;const n=(mini?1:3)+Math.floor(depth/2)+rnd(3);for(let k=0;k<n;k++){const q=spotIn(arena);if(q)enemies.push(mkEnemy(pickType(),q.x,q.y));}
    if(mini){const t=freeTile(arena);if(t){const bi=(biomeOverride!=null?biomeOverride:(depth-1))%6,e=mkEnemy('warden',t.tx*TS+6,t.ty*TS+6);e.boss=bi;e.hp=e.mhp=36+depth*4;e.mini=true;enemies.push(e);bossRef=e;setTimeout(()=>{bannerBoss=3;say('a '+BOSSES[bi].name.toLowerCase()+' holds this arena');},60);}}}bfs(start.cx,start.cy,flow);ensureLayers();setupObjective(start,exitR);startLevelScore();
}
