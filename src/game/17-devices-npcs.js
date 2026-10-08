// ---------- input ----------
let spawnUI=null,testConsole=null;
let testDeck=false,biomeOverride=null,deckUI=null;
const DECKOPT=[
  {k:'depth',label:'Depth',vals:[1,2,3,4,5,6,7,8,9,10]},
  {k:'biome',label:'Biome',vals:['auto','Intake','Pump Hall','Sorting Floor','Cold Store','Brine Works','Relay Core']},
  {k:'type',label:'Deck type',vals:['station','flooded','cache']},
  {k:'size',label:'Size',vals:['random','small','medium','large']},
  {k:'light',label:'Lighting',vals:['random','normal','lit','dark']},
  {k:'haz',label:'Hazard',vals:['random','none','fog','steam','fire','toxic','anomaly','electrical','volatile','overgrowth','sprinklers','chasm','molten']},
  {k:'obj',label:'Lift',vals:['random','open','keycard','defend','both','arena']},
  {k:'waves',label:'Incoming waves',vals:['off','on']},
  {k:'haunt',label:'Haunted',vals:['off','on']},
  {k:'lowg',label:'Low gravity',vals:['off','on']}];
const deckCfg={seed:'',depth:1,biome:'auto',type:'station',size:'random',light:'random',haz:'random',obj:'random',waves:'off',haunt:'off',lowg:'off'};
const deckRows=()=>[...DECKOPT.map(o=>({opt:o})),{seedRow:true},{act:'go',label:'Go to this deck'},{act:'rand',label:'Go to a random deck'},{act:'stay',label:'Stay here'}];
function cycleDeck(o,d){const v=o.vals,i=v.indexOf(deckCfg[o.k]);deckCfg[o.k]=v[(i+d+v.length)%v.length];sfx('click');}
// the seed of the test deck in play, so a deck can be rebuilt: blank seed = a new random one each time
let testSeed=null;
function launchTestDeck(rand){const code=seedKey(deckCfg.seed||'')?deckCfg.seed:randomSeedCode();testSeed=code;
  withSeed(seedHash(seedKey(code)+'|test'),()=>launchTestDeck0(rand));state='play';say('test deck, seed '+code.toLowerCase()+'. reach the lift to come back');}
function launchTestDeck0(rand){const c=deckCfg,type=rand?wpick([['station',6],['flooded',2],['cache',2]]):c.type;depth=rand?1+rnd(8):c.depth;const rc=rollCond(type);
  cond={light:rand||c.light==='random'?rc.light:c.light,haz:rand||c.haz==='random'?rc.haz:(c.haz==='none'?null:c.haz),obj:rand||c.obj==='random'?rc.obj:c.obj,ev:rand?rc.ev:(c.waves==='on'?'waves':null),haunt:rand?rc.haunt:c.haunt==='on',lowg:rand?rc.lowg:c.lowg==='on',size:rand||c.size==='random'?rc.size:c.size[0]};
  biomeOverride=rand||c.biome==='auto'?null:DECKOPT[1].vals.indexOf(c.biome)-1;
  levelMods=type==='flooded'?{flood:0.85}:type==='cache'?{vaults:2,chests:2,enemyMul:1.35}:{};
  testDeck=true;deckUI=null;hazOff=false;levelLabel='TEST DECK';enterLevel();}
function returnToTest(){testDeck=false;biomeOverride=null;levelMods={};cond={light:'normal',haz:null};hazOff=false;levelLabel='TEST RANGE';genTest();placeTestNpcs();player.liftCfgLock=true;say('back in the test range');}
function deckChoose(i,d){const r=deckRows()[i];if(!r)return;if(r.seedRow){editText(deckCfg.seed,20,v=>{deckCfg.seed=v;});return;}if(r.opt)return cycleDeck(r.opt,d||1);if(r.act==='go')launchTestDeck(false);else if(r.act==='rand')launchTestDeck(true);else deckUI=null;}
function drawDeckUI(){const R=deckRows(),pw=250,rh=11,ph=34+R.length*rh+18,px=(W-pw)>>1,py=Math.max(4,(H-ph)>>1);
  F('rgba(4,5,6,0.6)',0,0,W,H);box(px,py,pw,ph,'#0a0c0b','#2a2f2d');F(AMBER,px,py,pw,2);txt('Test lift',px+10,py+7,AMBER);txt('build a deck to visit',px+pw-10,py+7,'#5d655f','right');
  deckUI.sel=Math.max(0,Math.min(deckUI.sel,R.length-1));
  R.forEach((r,i)=>{const yy=py+22+i*rh+(r.act?4:0),sel=i===deckUI.sel;const hov=ui(px+6,yy-2,pw-12,rh,{click:()=>{deckUI.sel=i;deckChoose(i,1);}});if(hov&&mouse.moved)deckUI.sel=i;
    if(sel){F('#141917',px+6,yy-2,pw-12,rh);F(AMBER,px+6,yy-2,2,rh);}
    if(r.opt){txt(r.opt.label,px+14,yy,sel?'#e3e6dc':'#b9c0b3');txt('< '+deckCfg[r.opt.k]+' >',px+pw-12,yy,AMBER,'right');}
    else if(r.seedRow){const ed=textEdit&&sel;txt('Seed',px+14,yy,sel?'#e3e6dc':'#b9c0b3');txt(ed?textEdit.val+(Math.sin(T*8)>0?'_':' '):deckCfg.seed||'random',px+pw-12,yy,ed?'#e3e6dc':AMBER,'right');}
    else txt(r.label,px+14,yy,r.act==='stay'?'#6f7a6a':'#9fe0b0');});
  txt(textEdit?'type a seed   Enter to keep   ESC to cancel':'W S select   A D or click to change   Enter to go',px+pw/2,py+ph-12,'#4f5a55','center');}
let grindUI=null;
const yieldTxt=y=>Object.entries(y).map(([k,v])=>v+' '+k).join(', ');
function grindRows(){const P=player,R=[];
  for(const g of P.bag)R.push({label:GEAR[g].name,y:GEARY[GEAR[g].slot],act:()=>{P.bag.splice(P.bag.indexOf(g),1);}});
  for(const k of Object.keys(ARM))if(P.has[k]&&!isEquipped(k))R.push({label:ARM[k].name,y:ARMY[k],act:()=>{P.has[k]=false;}});
  for(const k of Object.keys(CONY))if((P.inv[k]||0)>0)R.push({label:QUICK[k].name+'  (have '+P.inv[k]+')',y:CONY[k],act:()=>{P.inv[k]--;}});
  if((P.inv.flasks||0)>0)R.push({label:'Spare flask  (have '+P.inv.flasks+')',y:{scrap:1},act:()=>{P.inv.flasks--;}});
  for(const [k,b,y] of AMMOY)if((P.inv[k]||0)>=b)R.push({label:b+' '+k+'  (have '+P.inv[k]+')',y,act:()=>{P.inv[k]-=b;}});
  R.push({leave:true,label:'Walk away'});return R;}
function grindChoose(i){const R=grindRows(),r=R[i];if(!r)return;if(r.leave){grindUI=null;return;}
  r.act();const got=Object.assign({},r.y);for(const k in got)player.inv[k]=(player.inv[k]||0)+got[k];
  if(Math.random()<0.15*U('salv')){player.inv.scrap++;got.scrap=(got.scrap||0)+1;}
  refreshStats();sfx('crumble');shake=Math.max(shake,2);noise(player.x,player.y,110);alertAdd(5);const f=grindUI.f;f.spinT=0.8;
  for(let k=0;k<10;k++)parts.push({x:f.tx*TS+6,y:(f.ty+1)*TS,vx:rr(-40,40),vy:rr(-10,50),t:0.4,m:0.4,c:k%2?'#ffd070':'#8e978b',s:1});
  grindUI.note='ground '+r.label.split('  ')[0].toLowerCase()+' into '+yieldTxt(got);}
function drawGrindUI(){const R=grindRows(),pw=270,rh=11,ph=44+R.length*rh+14,px=(W-pw)>>1,py=Math.max(4,(H-ph)>>1);
  F('rgba(4,5,6,0.6)',0,0,W,H);box(px,py,pw,ph,'#0a0c0b','#2a2f2d');F('#d07030',px,py,pw,2);
  txt('Salvager',px+10,py+7,'#e08a50');txt('feed it, it grinds',px+pw-10,py+7,'#5d655f','right');
  txt('scrap '+player.inv.scrap+'  pwd '+player.inv.powder+'  pipe '+player.inv.pipe+'  batt '+player.inv.battery+'  cloth '+player.inv.cloth,px+10,py+19,'#6f7a6a');
  grindUI.sel=Math.max(0,Math.min(grindUI.sel,R.length-1));
  R.forEach((r,i)=>{const yy=py+32+i*rh+(r.leave?3:0),sel=i===grindUI.sel;const hov=ui(px+6,yy-2,pw-12,rh,{click:()=>{grindUI.sel=i;grindChoose(i);}});if(hov&&mouse.moved)grindUI.sel=i;
    if(sel){F('#141917',px+6,yy-2,pw-12,rh);F('#e08a50',px+6,yy-2,2,rh);}
    txt(r.label,px+14,yy,r.leave?'#6f7a6a':sel?'#e3e6dc':'#b9c0b3');if(r.y)txt(yieldTxt(r.y),px+pw-12,yy,'#9fcf9a','right');});
  if(R.length===1)txt('nothing to grind. equipped items stay safe',px+14,py+32+rh+4,'#5d655f');
  txt(grindUI.note||'W S or click   Enter to grind   ESC to leave',px+10,py+ph-12,grindUI.note?'#e8dcb0':'#4f5a55');}
function wallSpot(){const c=[];for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){const i=y*MW+x;if(map[i]===1&&!solid(x,y+1)&&map[i-1]===1&&map[i+1]===1&&kind[(y+1)*MW+x]===1&&Math.abs(x-exitT.x)+Math.abs(y+1-exitT.y)>2
    &&!panels.some(q=>Math.abs(q.tx-x)+Math.abs(q.ty-y)<3)&&!vendors.some(v=>Math.abs(v.tx-x)+Math.abs(v.ty-y)<3)&&!risers.some(r=>Math.abs(r.tx-x)+Math.abs(r.ty-y)<2)&&!fans.some(f=>Math.abs(f.tx-x)+Math.abs(f.ty-y)<2)&&!fixtures.some(f=>Math.abs(f.tx-x)+Math.abs(f.ty-y)<3))c.push([x,y]);}
  return c.length?c[rnd(c.length)]:null;}
function genFreezers(){const bi=biomeOverride!=null?biomeOverride:(depth-1)%BIOME.length,n=aN(bi===3?3+rnd(2):(Math.random()<0.2?1:0));
  for(let k=0;k<n;k++){const w=wallSpot();if(w)fixtures.push({tx:w[0],ty:w[1],kind:'freezer',wall:true,used:false});}}
function genCameras(){if(depth<2||Math.random()>0.25)return;const w=wallSpot();if(w)fixtures.push({tx:w[0],ty:w[1],kind:'camera',wall:true});}
function openCamera(f){if(!f.tr){f.tr=rollTransit();if(f.tr.type==='passive'||f.tr.type==='none')f.tr={type:'none'};}const tr=nextTransit||f.tr;
  choiceUI={title:'Lift security feed',col:'#7ad0b0',body:'Grainy footage of the shaft below. The next ride shows '+transitDesc(tr)+'.',opts:
    tr.type==='none'?[{label:'Leave',leave:true}]:[{label:'Flag the stop (the lift will stop there)',ok:()=>!(nextTransit&&nextTransit.forced),act:()=>{nextTransit=Object.assign({},tr,{forced:true});return 'flagged. the lift will stop there';}},
      {label:'Lock it out (ride straight past)',ok:()=>!(nextTransit&&nextTransit.type==='none'),act:()=>{nextTransit={type:'none'};return 'locked out. nothing will stop the lift next ride';}},{label:'Leave',leave:true}],note:''};mouse.l=false;mouse.r=false;sfx('map');}
function genBreaker(){if(!(cond&&cond.haz==='electrical')&&!(cables.length>=4&&Math.random()<0.3))return;for(let t=0;t<30;t++){const r=randomRoom(),q=freeTile(r);if(q&&r!==rooms[0]){fixtures.push({tx:q.tx,ty:q.ty,kind:'breaker',ph:0});return;}}}
function openBreaker(f){choiceUI={title:'Breaker panel',col:'#e8c040',body:powerOff?'The deck feed is cut. The main breaker sits in the off position, cold to the touch.':'The deck\'s main breaker, humming. Throwing it cuts every non-essential circuit on this deck: the live cabling goes dead, but so do the lights and the security scanners.',
  opts:[powerOff?{label:'Restore the power',act:()=>{setPower(true);return 'power restored';}}:{label:'Throw the breaker',act:()=>{setPower(false);return 'deck power cut';}},{label:'Leave it',leave:true}],note:''};sfx('map');}
function setPower(on){if(on){powerOff=false;if(powerPrev)cond.light=powerPrev;for(const t of trips)if(t.wasOn)t.on=true;say('the lights stutter back on. so do the cables');sfx('lift');}
  else{powerOff=true;powerPrev=cond.light;cond.light='dark';for(const t of trips){t.wasOn=t.on;t.on=false;}for(const c of cables)c.st='idle';say('a deep clunk, then darkness. the cables go dead');sfx('thud');shake=Math.max(shake,4);}}
function genStasis(){if(Math.random()>0.12)return;for(let t=0;t<30;t++){const r=randomRoom(),q=freeTile(r);if(q&&r!==rooms[0]){fixtures.push({tx:q.tx,ty:q.ty,kind:'stasis',ph:0});return;}}}
const MODNPC={medbay:['subject','android'],lab:['subject','android','bomber'],arcade:null,cafeteria:['cook','scrapper'],breakroom:['cook','detective','scrapper'],lockers:['quarter','locksmith'],greenhouse:['cook'],custodial:['locksmith','bomber'],court:['pilot','scrapper'],bathhouse:['detective','subject']};
// one chance of an NPC per Medium deck's worth of area
function genNpcs(){for(let k=aN(1);k>0;k--)genNpc();}
function genNpc(){if(depth<2||Math.random()>0.35)return;
  const mods=(modules||[]).filter(m=>m.type in MODNPC).sort(()=>Math.random()-0.5);if(mods.length&&Math.random()<0.6){const m=mods[0],L0=MODNPC[m.type]||NPC_IDS;for(let k=0;k<20;k++){const t=freeTile(m);if(t&&!fixtures.some(f=>Math.abs(f.tx-t.tx)+Math.abs(f.ty-t.ty)<2)){fixtures.push({tx:t.tx,ty:t.ty,kind:'npc',npc:L0[rnd(L0.length)],ph:Math.random()*6});return;}}}
  const L=rooms.filter((r,i)=>i>0&&r.w>=3&&r.h>=3&&!(modules||[]).includes(r)).sort(()=>Math.random()-0.5);
  for(const r of L){const c=carveCloset(r);if(c){fixtures.push({tx:c.cx,ty:c.cy,kind:'npc',npc:NPC_IDS[rnd(NPC_IDS.length)],ph:Math.random()*6});return;}}}
function carveCloset(r){const sides=[[-1,0],[1,0],[0,-1],[0,1]].sort(()=>Math.random()-0.5);
  for(const [sx,sy] of sides){const span=sx?r.h:r.w;for(let t=0;t<span;t++){const o=Math.floor(span/2)+((t%2)?1:-1)*Math.ceil(t/2);if(o<1||o>=span-1)continue;
      const dx=sx<0?r.x-1:sx>0?r.x+r.w:r.x+o,dy=sy<0?r.y-1:sy>0?r.y+r.h:r.y+o,ccx=dx+sx*2,ccy=dy+sy*2;let ok=true;
      for(let y=ccy-2;y<=ccy+2&&ok;y++)for(let x=ccx-2;x<=ccx+2;x++){if(x<1||y<1||x>=MW-1||y>=MH-1){ok=false;break;}if(x===dx&&y===dy)continue;if(map[y*MW+x]!==1){ok=false;break;}}
      if(!ok||map[dy*MW+dx]!==1)continue;if(fixtures.some(f=>Math.abs(f.tx-ccx)<4&&Math.abs(f.ty-ccy)<4))continue;
      for(let y=ccy-1;y<=ccy+1;y++)for(let x=ccx-1;x<=ccx+1;x++){const i=y*MW+x;map[i]=0;kind[i]=kind[r.cy*MW+r.cx]||0;liq[i]=0;hz[i]=0;}
      for(let y=ccy-3;y<=ccy+3;y++)for(let x=ccx-3;x<=ccx+3;x++)if(x>=0&&y>=0&&x<MW&&y<MH)paintTile(x,y);
      fixtures.push({tx:dx,ty:dy,kind:'closet',ph:0});return {cx:ccx,cy:ccy,dx,dy};}}return null;}
function genListeners(){genCameras();genNpcs();genBreaker();genStasis();if(depth<3)return;
  if(Math.random()<0.12){const w=wallSpot();if(w)fixtures.push({tx:w[0],ty:w[1],kind:'damper',wall:true,usedReset:false});}
  if(Math.random()<0.1){const r=randomRoom(),t=freeTile(r);if(t)fixtures.push({tx:t.tx,ty:t.ty,kind:'psychic',ph:Math.random()*6});}}
function genGrinder(){if(Math.random()>0.45)return;const c=[];
  for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){const i=y*MW+x;if(map[i]===1&&!solid(x,y+1)&&map[i-1]===1&&map[i+1]===1&&kind[(y+1)*MW+x]===1&&Math.abs(x-exitT.x)+Math.abs(y+1-exitT.y)>2
    &&!panels.some(q=>Math.abs(q.tx-x)+Math.abs(q.ty-y)<3)&&!vendors.some(v=>Math.abs(v.tx-x)+Math.abs(v.ty-y)<3)&&!risers.some(r=>Math.abs(r.tx-x)+Math.abs(r.ty-y)<2)&&!fans.some(f=>Math.abs(f.tx-x)+Math.abs(f.ty-y)<2))c.push([x,y]);}
  if(c.length){const [x,y]=c[rnd(c.length)];fixtures.push({tx:x,ty:y,kind:'grinder',wall:true,spinT:0});}}
let choiceUI=null,diceUI=null;
function openDamper(f){choiceUI={title:'Dampening terminal',col:'#a88af0',body:'An old acoustic-control console. The readout shows a jagged line: everything on this deck that has heard you.',
  opts:[{label:'Purge the disturbance log',right:f.usedReset?'used':'free, once',ok:()=>!f.usedReset,act:()=>{f.usedReset=true;alertM=0;alertRumble=false;return 'the log clears. the line goes flat, for now';}},
    {label:'Engage dampening for this deck',right:'2 battery',ok:()=>!alertLock&&player.inv.battery>=2,act:()=>{player.inv.battery-=2;alertLock=true;alertM=0;return 'the vents hum. nothing will hear you on this deck';}},
    {label:'Leave',leave:true}],note:''};mouse.l=false;mouse.r=false;sfx('map');}
function openNpc(f){const N=NPCS[f.npc];if(N.init&&!f.inited){N.init(f);f.inited=true;}
  choiceUI={title:N.name,col:N.robe==='#e8e8e8'?'#d0c0d0':'#d9a441',body:N.body,opts:[...N.opts(f).map(o=>({label:o[0],right:o[1]?price(o[1])+' scrap':'',ok:()=>(!o[3]||o[3]())&&player.inv.scrap>=(o[1]?price(o[1]):0),act:()=>{player.inv.scrap-=o[1]?price(o[1]):0;o[2]();refreshStats();setTimeout(()=>{if(choiceUI&&choiceUI.title===N.name)openNpc(f);},0);return 'done';}})),{label:'Leave',leave:true}],note:''};
  mouse.l=false;mouse.r=false;sfx('map');}
function npcNear(x,y,r){return fixtures.find(f=>(f.kind==='npc'||f.kind==='psychic')&&Math.hypot(f.tx*TS+6-x,f.ty*TS+6-y)<r);}
function openPsychic(f){const cost=c=>price(c);choiceUI={title:'The sensitive',col:'#c9a8ff',body:'A thin figure in layered cloth, eyes half closed. "They are listening for you. I can make them forget, or listen somewhere else. Or sit, and play."',
  opts:[{label:'Blur their memory (reset the disturbance)',right:cost(4)+' scrap',ok:()=>player.inv.scrap>=cost(4)&&alertM>0,act:()=>{player.inv.scrap-=cost(4);alertM=0;alertRumble=false;return '"There. They were never sure you were here."';}},
    {label:'Send them elsewhere (no disturbance this deck)',right:cost(8)+' scrap',ok:()=>player.inv.scrap>=cost(8)&&!alertLock,act:()=>{player.inv.scrap-=cost(8);alertLock=true;alertM=0;return '"They are chasing an echo now. Go quietly."';}},
    {label:'Shake them off your trail',right:cost(5)+' scrap',ok:()=>player.inv.scrap>=cost(5)&&(alertWaves>0||alertCarry),act:()=>{player.inv.scrap-=cost(5);alertWaves=0;alertCarry=false;return '"The ones following you have lost the scent."';}},
    {label:'Let her wipe a crew file (refund clearance)',right:price(3)+' scrap',ok:()=>player.inv.scrap>=price(3)&&FILES.some(f=>fileTier(f.id)>0),act:()=>{openWipe();return null;}},
    {label:'Play Hands and Bones for 2 scrap',right:'win 4',ok:()=>player.inv.scrap>=2,act:()=>{startDice(2);return null;}},
    {label:'Play Hands and Bones for 5 scrap',right:'win 10',ok:()=>player.inv.scrap>=5,act:()=>{startDice(5);return null;}},
    {label:'Leave',leave:true}],note:''};mouse.l=false;mouse.r=false;sfx('map');}
function openWipe(){const L=FILES.filter(f=>fileTier(f.id)>0).slice(0,7);
  choiceUI={title:'The sensitive',col:'#c9a8ff',body:'"Which of them do you want to forget? You keep most of what it cost you. Not all."',
    opts:[...L.map(f=>{let sp=0;for(let i=0;i<fileTier(f.id);i++)sp+=f.tiers[i].cost;return {label:'Forget '+f.name+' (tier '+fileTier(f.id)+')',right:'+'+Math.max(0,sp-1)+' clearance',ok:()=>player.inv.scrap>=price(3),act:()=>{player.inv.scrap-=price(3);const r=unlearnFile(f);choiceUI.opts=[{label:'Leave',leave:true}];return f.name+' fades. You get back '+r+' clearance.';}};}),{label:'Leave',leave:true}],note:''};}
function choicePick(i){const o=choiceUI.opts[i];if(!o)return;if(o.leave){choiceUI=null;return;}if(o.ok&&!o.ok()){sfx('deny');return;}const r=o.act();sfx('craft');if(r&&choiceUI)choiceUI.note=r;}
function drawChoiceUI(){const u=choiceUI,pw=280,rh=12,px=(W-pw)>>1;ctx.font='8px '+FONT;
  const lines=[];let line='';for(const w of u.body.split(' ')){const t=line?line+' '+w:w;if((ctx.measureText(t).width||0)>pw-20&&line){lines.push(line);line=w;}else line=t;}if(line)lines.push(line);
  const ph=26+lines.length*10+u.opts.length*rh+22,py=Math.max(4,(H-ph)>>1);u.sel=Math.max(0,Math.min(u.sel||0,u.opts.length-1));
  F('rgba(4,5,6,0.6)',0,0,W,H);box(px,py,pw,ph,'#0a0c0b','#2a2f2d');F(u.col,px,py,pw,2);txt(u.title,px+10,py+7,u.col);
  lines.forEach((l,i)=>txt(l,px+10,py+20+i*10,'#b9c0b3'));
  const oy=py+26+lines.length*10;
  u.opts.forEach((o,i)=>{const yy=oy+i*rh,sel=i===u.sel,ok=!o.ok||o.ok();const hov=ui(px+6,yy-2,pw-12,rh,{click:()=>{u.sel=i;choicePick(i);}});if(hov&&mouse.moved)u.sel=i;
    if(sel){F('#141917',px+6,yy-2,pw-12,rh);F(u.col,px+6,yy-2,2,rh);}txt((i+1)+'  '+o.label,px+14,yy,o.leave?'#6f7a6a':ok?(sel?'#e3e6dc':'#b9c0b3'):'#5d655f');if(o.right)txt(o.right,px+pw-12,yy,ok?AMBER:'#5d655f','right');});
  txt(u.note||'W S or click   Enter to choose   ESC to leave',px+10,py+ph-12,u.note?'#e8dcb0':'#4f5a55');}
