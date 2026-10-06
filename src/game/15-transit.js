// ---------- transit stops between decks ----------
let transitToast=0,runStops=0,nextTransit=null,pendingNode=null,stopMode=false,stopAmbush=false,stopWarnT=0;
function rollTransit(){if(depth<2)return {type:'none'};const guarantee=!runStops&&depth>=3;if(!guarantee&&Math.random()>0.6)return {type:'none'};
  const t=guarantee?wpick([['text',45],['room',45],['ambush',10]]):wpick([['passive',25],['text',30],['room',32],['ambush',13+(alertCarry?10:0)]]);
  if(t==='room')return {type:'room',room:wpick([['merchant',3],['gambler',2],['quarters',3],['arcade',2],['camp',3]])};if(t==='text')return {type:'text',ev:rnd(TEXTEV.length)};return {type:t};}
function transitDesc(tr){return tr.type==='none'?'a clear run down':tr.type==='passive'?'something useful lodged in the cab':tr.type==='text'?'the lift stalls between floors':tr.type==='ambush'?'something waiting on the cab roof':'the lift stopping at '+ROOMDESC[tr.room];}
let transitAfter=null;
function startTransit(tr,n){pendingNode=n;runStops++;
  if(tr.type==='passive'){const r=rnd(5);enterNode(n);
    if(r===0){player.inv.scrap+=2+rnd(3);say('scrap wedged in the cab floor. you pocket it');}else if(r===1){const f=randFood();player.food[f]=(player.food[f]||0)+1;say('a '+FOOD[f].name.toLowerCase()+' left in the cab panel');}
    else if(r===2){player.inv.cells+=4;say('a spent guard\'s pouch in the cab. 4 cells');}else if(r===3){const k=randRaw();player.raw[k]=(player.raw[k]||0)+1;say('someone left '+RAW[k].name.toLowerCase()+' in the cab');}else{player.inv.cloth++;player.inv.powder++;say('a torn kit bag: cloth and powder');}
    sfx('pick');transitToast=4;pendingNode=null;return;}
  if(tr.type==='text'){const e=TEXTEV[tr.ev];transitAfter=null;
    nodeUI={title:e.title,col:'#8ac0d0',transit:true,body:e.body,options:e.opts.map(o=>({label:o.label,ok:o.ok||(()=>true),act:o.act}))};state='node';nodeSel=0;return;}
  if(tr.type==='ambush'){if(tr.forced){startStop('ambush');return;}
    nodeUI={title:'The cab lurches to a halt',col:'#e05040',transit:true,body:'The doors grind open onto a bare, dim landing. Shapes are already moving out there, and something heavy lands on the roof. The lift will not move again until they are all dead.',
      options:[{label:'Brace yourself',ok:()=>true,act:()=>{startStop('ambush');return null;}},{label:'Hit the emergency drop (30% chance to get away)',ok:()=>true,act:()=>{if(Math.random()<0.3){return 'The brake releases and the cab falls away from them. You got clear.';}startStop('ambush');return null;}}]};state='node';nodeSel=0;return;}
  if(tr.type==='room'){if(tr.forced){startStop(tr.room);return;}
    nodeUI={title:'An unmarked landing',col:'#d9a441',transit:true,body:'The lift slows and stops at '+ROOMDESC[tr.room]+'. The doors stay open, waiting.',
      options:[{label:'Step out',ok:()=>true,act:()=>{startStop(tr.room);return null;}},{label:'Ride on',leave:true,ok:()=>true}]};state='node';nodeSel=0;return;}
  enterNode(n);}
function startStop(sk){stopMode=true;stopAmbush=sk==='ambush';nodeUI=null;resetHidden();levelLabel=sk==='ambush'?'LIFT CAB':'LANDING';cond={light:sk==='ambush'?'normal':'lit',haz:null,obj:'open'};hazOff=false;
  map=new Uint8Array(MW*MH).fill(1);kind=new Uint8Array(MW*MH);secretHp=new Float32Array(MW*MH);openDoor=new Uint8Array(MW*MH);liq=new Uint8Array(MW*MH);hz=new Uint8Array(MW*MH);oil=new Uint8Array(MW*MH);slime=new Uint8Array(MW*MH);
  const cab={x:28,y:30,w:5,h:4,cx:30,cy:31};rooms=[cab];const carve=(r,k)=>{for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){map[y*MW+x]=0;kind[y*MW+x]=k;}};carve(cab,1);
  vaults=[];secrets=[];ventRooms=[];hatchRooms=[];fires=[];vents=[];anoms=[];panels=[];vendors=[];chests=[];items=[];enemies=[];barrels=[];risers=[];testLabels=[];
  if(sk==='ambush'){const land={x:25,y:21,w:11,h:7,cx:30,cy:24};rooms.push(land);carve(land,1);for(const [x,y] of [[29,28],[30,28],[31,28],[29,29],[30,29],[31,29]]){map[y*MW+x]=0;kind[y*MW+x]=1;}
    for(let k=0;k<3;k++){const bx=26+rnd(9),by=22+rnd(5);if(!(bx>=29&&bx<=31))barrels.push(mkBarrel(bx,by));}}
  if(sk!=='ambush'){const room={x:26,y:22,w:9,h:6,cx:30,cy:25};rooms.push(room);carve(room,1);map[28*MW+30]=0;map[29*MW+30]=0;
    if(sk==='merchant'){vendors.push(mkVendor(28,21),mkVendor(32,21));items.push({x:27*TS+6,y:26*TS+6,type:'raw',raw:randRaw(),ph:0});}
    else if(sk==='gambler'){fixtures.push({tx:30,ty:24,kind:'psychic',ph:0});items.push({x:33*TS+6,y:26*TS+6,type:'scrap',ph:0});}
    else if(sk==='quarters'){fixtures.push({tx:27,ty:21,kind:'locker',used:false,wall:true},{tx:29,ty:21,kind:'locker',used:false,wall:true},{tx:31,ty:21,kind:'locker',used:false,wall:true});
      chests.push({tx:33,ty:23,x:33*TS+6,y:23*TS+6,tier:'common',opened:false});items.push({x:27*TS+6,y:26*TS+6,type:'food',food:randFood(),ph:0},{x:28*TS+6,y:25*TS+6,type:'cloth',ph:0});
      if(Math.random()<0.4){const e=mkEnemy('husk',32*TS+6,25*TS+6);e.alert=false;enemies.push(e);}}
    else if(sk==='camp'){fixtures.push({tx:30,ty:23,kind:'npc',npc:NPC_IDS[rnd(NPC_IDS.length)],ph:Math.random()*6});items.push({x:27*TS+6,y:26*TS+6,type:'food',food:randFood(),ph:0});}
    else if(sk==='arcade'){for(let k=0;k<3;k++)fixtures.push({tx:27+k*3,ty:21,kind:'arcade',wall:true,won:false,game:ARC_IDS[rnd(ARC_IDS.length)]});items.push({x:30*TS+6,y:26*TS+6,type:'scrap',ph:0});}}
  exitT={x:30,y:32};seen=new Uint8Array(MW*MH);for(let y=19;y<=35;y++)for(let x=24;x<=37;x++)seen[y*MW+x]=1;seed=rnd(1e9);paintMap();
  player.x=30*TS+6;player.y=31*TS+6;player.vx=player.vy=0;resetLevelState();bfs(30,31,flow);setupObjective(null,null,'open');startLevelScore();state='play';bannerT=2.5;
  if(stopAmbush){const n=2+Math.floor(depth/3)+(alertCarry?2:0);
    for(let k=0;k<n;k++){const x=26+rnd(9),y=22+rnd(4);const e=mkEnemy(pickType(),x*TS+6,y*TS+6);if(ET[e.type].aquatic||ET[e.type].plant||ET[e.type].ghost){k--;continue;}e.alert=true;enemies.push(e);}
    queueSpawn({tx:30,ty:24});say('they are waiting on the landing, and more are coming down from above');sfx('alarm');}
  else say('step back onto the lift when you are ready to ride on');}
function endStop(){stopMode=false;stopAmbush=false;const n=pendingNode;pendingNode=null;if(n)enterNode(n);else openRoute();}
function enterNode(n){bossPending=!!(route&&route.chaser&&route.chaser.at===route.cur&&!testMode);
  levelMods=Object.assign({},nextMods);nextMods={};levelLabel='';cond=n.cond||{light:'normal',haz:null};hazOff=false;powerOff=false;
  if(n.type==='flooded'){levelMods.flood=0.85;levelLabel='FLOODED DECK';}
  if(n.type==='cache'){levelMods.vaults=(levelMods.vaults||0)+2;levelMods.chests=2;levelMods.enemyMul=(levelMods.enemyMul||1)*1.35;levelLabel='SUPPLY CACHE';}
  if(n.type==='station'||n.type==='flooded'||n.type==='cache'){enterLevel();state='play';say('the lift groans further down');if(bossPending)spawnBoss();return;}
  setupNode(n.type);state='node';nodeSel=0;
}
function say(s){msgs.push({s,t:3.5});if(msgs.length>3)msgs.shift();}
function float(x,y,s,col){texts.push({x,y,s,col,t:1.1});}

