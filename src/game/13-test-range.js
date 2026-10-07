// ---- test range
let arcadeMode=false;
function newArcadeHall(){testMode=true;arcadeMode=true;cond={light:'lit',haz:null,obj:'open'};hazOff=false;initPlayer();levelLabel='ARCADE';setDeckSize('m');resetHidden();
  map=new Uint8Array(MW*MH).fill(1);kind=new Uint8Array(MW*MH);secretHp=new Float32Array(MW*MH);openDoor=new Uint8Array(MW*MH);liq=new Uint8Array(MW*MH);hz=new Uint8Array(MW*MH);
  const carve=(x0,y0,w,h,k)=>{for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){map[y*MW+x]=0;kind[y*MW+x]=k;}};
  const room={x:20,y:20,w:14,h:10,cx:27,cy:25};rooms=[room];carve(20,20,14,10,11);
  for(const px of [23,27,31])map[24*MW+px]=1;               // three pillars down the middle, each carrying a cabinet
  carve(35,25,5,5,1);carve(34,27,1,1,11);                 // lift room on the right, opening from the hall
  carve(34,21,7,2,11);                                    // short hall above the lift room
  carve(35,17,5,3,9);carve(39,20,1,1,9);                  // restroom straight above the lift, door at the right end of the hall
  carve(41,21,1,1,11);carve(42,19,5,5,3);rooms.push({x:42,y:19,w:5,h:5,cx:44,cy:21,dark:true,warned:true});   // janitor's closet at the far end of the hall
  exitT={x:37,y:27};vaults=[];secrets=[];ventRooms=[];hatchRooms=[];fires=[];vents=[];anoms=[];panels=[];vendors=[];chests=[];items=[];enemies=[];
  const spots=[[21,19],[25,19],[29,19],[23,24],[27,24],[31,24]];ARC_IDS.forEach((g,i)=>{const [x,y]=spots[i%spots.length];fixtures.push({tx:x,ty:y,kind:'arcade',wall:true,won:false,game:g});});
  fixtures.push({tx:33,ty:19,kind:'dispenser',wall:true});
  for(let k=0;k<4;k++){const bx=21+k*3;for(const [dx,side] of [[0,-1],[1,0],[2,1]])for(const [yy,low] of [[28,false],[29,true]]){fixtures.push({tx:bx+dx,ty:yy,kind:'booth',side,low,shareL:side<0&&k>0,shareR:side>0&&k<3});furn[yy*MW+bx+dx]=1;}}
  fixtures.push({tx:35,ty:20,kind:'fountain',wall:true});
  fixtures.push({tx:35,ty:17,kind:'toilet'},{tx:37,ty:16,kind:'washbasin',wall:true},{tx:39,ty:20,kind:'closet',ph:0,restroom:true});furn[17*MW+35]=1;map[20*MW+39]=1;
  fixtures.push({tx:41,ty:21,kind:'closet',ph:0,janitor:true},{tx:43,ty:18,kind:'locker',used:false,wall:true},{tx:45,ty:18,kind:'washbasin',wall:true},{tx:46,ty:19,kind:'toolbench',part:0},{tx:46,ty:20,kind:'toolbench',part:1},
    {tx:43,ty:20,kind:'shelf',part:0},{tx:44,ty:20,kind:'shelf',part:1},{tx:44,ty:23,kind:'cot',part:0},{tx:45,ty:23,kind:'cot',part:1},{tx:46,ty:23,kind:'bookshelf'});map[21*MW+41]=1;
  for(const [x,y] of [[46,19],[46,20],[43,20],[44,20],[44,23],[45,23],[46,23]])furn[y*MW+x]=1;
  lamps.push({x:46*TS+7,y:23*TS+2,r:30,ph:Math.random()*6});
  seen=new Uint8Array(MW*MH);for(let y=16;y<=31;y++)for(let x=19;x<=41;x++)seen[y*MW+x]=1;seed=rnd(1e9);depth=1;paintMap();
  testLabels=ARC_IDS.map((g,i)=>{const [x,y]=spots[i%spots.length];return {x:x+0.5,y:y+1.4,s:ARC[g].name.split(' ')[0].toUpperCase(),c:true,sz:5};});testLabels.push({x:33.5,y:20.4,s:'COINS',c:true,sz:5},{x:37.5,y:25.3,s:'EXIT',c:true,sz:6});
  player.x=27*TS+6;player.y=26*TS+6;player.inv.scrap=10;resetLevelState();bfs(27,26,flow);ensureLayers();setupObjective(null,null,'open');startLevelScore();state='play';say('the arcade. the coin dispenser is broken in your favour');}
function placeTestNpcs(){NPC_IDS.forEach(k=>{for(let tries=0;tries<40;tries++){const t=freeTile(rooms[0]);if(t&&!fixtures.some(f=>Math.abs(f.tx-t.tx)+Math.abs(f.ty-t.ty)<2)&&Math.hypot(t.tx*TS+6-player.x,t.ty*TS+6-player.y)>20){fixtures.push({tx:t.tx,ty:t.ty,kind:'npc',npc:k,ph:Math.random()*6});break;}}});}
function newTest(){arcadeMode=false;testDeck=false;biomeOverride=null;testMode=true;cond={light:'normal',haz:null};hazOff=false;initPlayer();player.clear=60;Object.assign(player.inv,{molotov:5,gasnade:5,smokenade:5});player.tools={glowstick:true,sledge:true,scanner:true};player.found=FILES.map(f=>f.id);levelLabel='TEST RANGE';genTest();placeTestNpcs();state='play';say('test range. everything here is free to take');}
function genTest(){
  setDeckSize('m');resetHidden();
  map=new Uint8Array(MW*MH).fill(1);kind=new Uint8Array(MW*MH);secretHp=new Float32Array(MW*MH);openDoor=new Uint8Array(MW*MH);liq=new Uint8Array(MW*MH);
  const main={x:4,y:4,w:40,h:22,cx:24,cy:15};rooms=[main];
  const carve=(r,k)=>{for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){map[y*MW+x]=0;kind[y*MW+x]=k;}};
  carve(main,1);exitT={x:42,y:5};
  const v={x:20,y:27,w:7,h:5,cx:23,cy:29,ex:23,ey:26,known:false,open:false};carve(v,2);map[26*MW+23]=2;vaults=[v];
  const sc={x:45,y:9,w:5,h:5,cx:47,cy:11,ex:44,ey:11,known:false,open:false};carve(sc,3);map[11*MW+44]=3;secretHp[11*MW+44]=6;secrets=[sc];
  for(let y=15;y<26;y++)for(let x=30;x<44;x++)liq[y*MW+x]=x<33?(Math.random()<.5?1:0):x<37?2:x<40?3:4;
  for(const [x,y] of [[41,17],[42,17],[42,18]])flot[y*MW+x]=1;
  for(const [x,y] of [[16,18],[19,18],[16,21],[19,21]])map[y*MW+x]=1;
  seen=new Uint8Array(MW*MH);
  for(let y=3;y<=27;y++)for(let x=3;x<=44;x++)if(kind[y*MW+x]!==3&&kind[y*MW+x]!==2)seen[y*MW+x]=1;
  seed=rnd(1e9);depth=1;paintMap();
  enemies=[];items=[];chests=[];
  enemies.push(mkEnemy('lurker',42*TS+6,21*TS+6),mkEnemy('grasper',40*TS+6,24*TS+6));
  for(const x of [26,30,34]){const e=mkEnemy('dummy',x*TS+6,9*TS+6);e.hx=e.x;e.hy=e.y;e.log=[];enemies.push(e);}
  for(let k=0;k<2;k++){const p=spotIn(v);enemies.push(mkEnemy('husk',p.x,p.y));}
  addChest(v,'common');addChest(sc,'rare');
  chests.push({tx:8,ty:23,x:8*TS+6,y:23*TS+6,tier:'common',opened:false},{tx:11,ty:23,x:11*TS+6,y:23*TS+6,tier:'rare',opened:false});
  const put=(tx,ty,type,extra)=>items.push(Object.assign({x:tx*TS+6,y:ty*TS+6,type,ph:Math.random()*6},extra||{}));
  [['flask',1],['rounds',60],['shells',20],['nails',100],['bolts',15],['cells',20],['fuel',60],['scrap',30],['powder',15],['pipe',15],['battery',10],['cloth',10],['key',8],['medkit',30]].forEach(([t,a],i)=>put(6+i,6,t,{amt:a}));
  ['scatter','nailer','bolt','ray'].forEach((w,i)=>put(6+i,8,'weapon',{w}));IMPLEMENTS.forEach((w,i)=>put(6+i,9,'weapon',{w}));
  for(let i=0;i<Object.keys(SKILLS).length+Object.keys(MOVES).length-1;i++)put(10+i,8,'chip');
  put(16,8,'schematic');put(17,8,'secretmap');
  Object.keys(GEAR).filter(k=>k!=='hardhat').forEach((k,i)=>put(6+i%10,11+Math.floor(i/10)*2,'gear',{gear:k}));
  hz=new Uint8Array(MW*MH);fires=[];vents=[];anoms=[];
  for(let y=21;y<=23;y++){for(let x=22;x<=24;x++)hz[y*MW+x]=1;for(let x=26;x<=28;x++)hz[y*MW+x]=2;}
  fires.push({x:23*TS+6,y:22*TS+6,ph:0});hz[18*MW+25]=3;vents.push({tx:25,ty:18,x:25*TS+6,y:18*TS+6,t:2,phase:'idle'});
  anoms.push({x:35*TS+6,y:13*TS+6,vx:0,vy:0,ph:0,fixed:true});
  const vr={x:8,y:27,w:6,h:5,cx:10,cy:29,ex:10,ey:26,known:false,open:false,vent:true};carve(vr,3);map[26*MW+10]=4;ventRooms=[vr];
  const hrm={x:30,y:36,w:8,h:6,cx:34,cy:39};carve(hrm,4);hatchRooms=[hrm];hatches=[{tx:13,ty:17,lx:31,ly:39,room:hrm,found:false}];
  const arena={x:4,y:34,w:14,h:9,cx:11,cy:38};carve(arena,1);for(let y=26;y<34;y++)for(let x=16;x<18;x++){map[y*MW+x]=0;kind[y*MW+x]=0;}
  for(const [x,y] of [[8,37],[12,40]])map[y*MW+x]=1;
  for(let y=39;y<43;y++)for(let x=14;x<18;x++)liq[y*MW+x]=x>=16&&y>=40&&y<=41?4:x>=16?3:2;
  for(let y=25;y<=43;y++)for(let x=3;x<=18;x++)if(kind[y*MW+x]!==3)seen[y*MW+x]=1;
  testConsole={tx:14,ty:24};
  paintMap();
  panels=[];[['doors',14],['map',16],['supplies',18],['purge',20]].forEach(([r,x])=>panels.push({tx:x,ty:3,hack:true,reward:r,state:'idle',ph:Math.random()*6}));
  for(const x of [26,30,36])panels.push({tx:x,ty:3,hack:false,state:'idle',ph:Math.random()*6});
  vendors=[mkVendor(32,3),mkVendor(39,3)];
  fixtures.push({tx:34,ty:3,kind:'grinder',wall:true,spinT:0},{tx:24,ty:3,kind:'damper',wall:true,usedReset:false},{tx:9,ty:18,kind:'psychic',ph:0});
  fillHidden(vr,'secops');fillHidden(hrm,'cage');
  addCable(29,19);for(const [x,y] of [[30,18],[30,19],[30,20],[31,19]])liq[y*MW+x]=Math.max(liq[y*MW+x],1);for(const [x,y] of [[29,19],[30,18],[30,19],[30,20],[31,19]])paintTile(x,y);
  for(let y=23;y<=24;y++)for(let x=17;x<=20;x++)if(map[y*MW+x]===0)oil[y*MW+x]=(x===18||x===19)?3:2;
  barrels.push(mkBarrel(20,14),mkBarrel(21,14),mkBarrel(20,15),mkBarrel(24,15));
  risers.push(mkRiser(28,3,[0,1],false),mkRiser(3,13,[1,0],false));
  liq[25*MW+30]=Math.max(liq[25*MW+30],1);hz[25*MW+30]=3;vents.push({tx:30,ty:25,x:30*TS+6,y:25*TS+6,t:2,phase:'idle',cold:true});paintTile(30,25);
  fans.push(mkFan(22,3,[0,1]));vents.push({tx:22,ty:6,x:22*TS+6,y:6*TS+6,t:1,phase:'idle'});
  plants.push({x:13*TS+6,y:20*TS+6,type:'mend',burst:false,ph:0},{x:13*TS+6,y:22*TS+6,type:'sting',burst:false,ph:1});
  enemies.push(mkEnemy('snare',27*TS+6,16*TS+6));items.push({x:12*TS+6,y:21*TS+6,type:'herb',ph:0});levers.push({tx:6,ty:20,effect:'flood',reward:'loot',used:false});
  cond={light:'normal',haz:'test'};
  testLabels=[{x:14,y:4.6,s:'HACK PANELS'},{x:25,y:20.2,s:'HAZARDS'},{x:35,y:15.4,s:'ANOMALY'},{x:8,y:24.6,s:'LOOSE VENT (walk into it)'},{x:12,y:18.6,s:'HATCH'},{x:5,y:21.6,s:'LEVER'},{x:28.2,y:24.4,s:'COLD VENT'},{x:22,y:5.4,s:'FAN'},{x:13,y:23.6,s:'PLANTS'},{x:27,y:17.6,s:'SNAREVINE'},{x:18.5,y:25.2,s:'OIL'},{x:27,y:18.4,s:'LIVE CABLE'},{x:20.5,y:13.2,s:'BARRELS'},{x:28,y:5.4,s:'RISER'},{x:4.2,y:12,s:'RISER'},{x:6,y:5.2,s:'ARMORY'},{x:28,y:7.2,s:'DUMMIES'},{x:34,y:14,s:'WADE TEST'},{x:41.5,y:14,s:'DEEP'},{x:42,y:16.2,s:'FLOTSAM'},{x:23,y:24.8,s:'LOCKED VAULT'},{x:39,y:9,s:'HOLLOW WALL'},{x:8.5,y:21.6,s:'CHESTS'},{x:38.5,y:4.2,s:'LIFT (test decks)'},{x:33,y:5.4,s:'SALVAGER'},{x:23,y:5.4,s:'DAMPENER'},{x:8,y:19.6,s:'SENSITIVE'},{x:11,y:22.6,s:'CREATURE CONSOLE'},{x:15.2,y:26.8,s:'ARENA'},{x:6,y:33.2,s:'ARENA PEN'}];
  player.x=8*TS+6;player.y=16*TS+6;
  resetLevelState();bfs(8,16,flow);ensureLayers();setupObjective(null,null,'open');startLevelScore();
}
