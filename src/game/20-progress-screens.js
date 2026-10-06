let fdSel=0;
let fdMode=0;
let cookOnly=false;
function foodList(){if(fdMode===1)return COOK.filter(c=>!cookOnly||cookOk(c)).map(c=>({cook:c}));const L=Object.keys(FOOD).filter(k=>player.food[k]>0).map(k=>({k}));if(player.inv.emetic>0)L.push({emetic:true});return L;}
function useFoodRow(r){if(r.cook)return cook(r.cook);if(r.emetic){if(player.sat<=0&&!player.buffs.length){say('nothing to bring up');sfx('click');return;}player.inv.emetic--;vomit('you drink the syrup. that was unpleasant');return;}eatFood(r.k);}
function drawFood(x,y,w,h){
  const P=player,L=foodList();fdSel=Math.max(0,Math.min(fdSel,L.length-1));const lx=x+8,lw=180;
  ['Pouch','Cook'].forEach((n,i)=>{const bx=lx+i*44,act=fdMode===i;ui(bx,y+2,40,11,{click:()=>{fdMode=i;fdSel=0;sfx('click');}});F(act?'#1c2220':'#0a0d0c',bx,y+2,40,11);F(act?AMBER:'#2a302e',bx,y+12,40,1);txt(n,bx+20,y+4,act?AMBER:'#8e978b','center');});
  txt(fdMode?'A D switch  R cook':'A D switch  R eat',lx+lw,y+4,'#3f4642','right');
  if(fdMode===1){{const fh=ui(lx-2,y+15,lw+4,11,{click:()=>{cookOnly=!cookOnly;fdSel=0;sfx('click');}});txt('X  only cookable: '+(cookOnly?'on':'off'),lx,y+17,cookOnly?AMBER:fh?'#c9cfc2':'#8e978b');}
    if(!L.length)wrap('Nothing you can cook with what you have. Turn the filter off to see every recipe.',lx,y+31,lw,9,'#5d655f');
    L.forEach((r,i)=>{const c=r.cook,f=FOOD[c.out],yy=y+30+i*10,sel=i===fdSel,ok=cookOk(c);const hov=ui(lx-2,yy-2,lw+4,10,{click:()=>{fdSel=i;cook(c);}});if(hov&&mouse.moved)fdSel=i;
      if(sel){F('#1c2220',lx-2,yy-2,lw+4,10);F(AMBER,lx-2,yy-2,2,10);}F(f.col,lx+2,yy,3,5);txt(f.name,lx+8,yy,ok?'#e3e6dc':'#6f7a6a');txt('x'+(P.food[c.out]||0),lx+lw,yy,'#5d655f','right');});
    const c=L[fdSel]&&L[fdSel].cook;if(c){const f=FOOD[c.out];F('#1f2524',lx,y+133,lw,1);txt(f.name,lx,y+137,AMBER);txt(f.sat+' sat  /  '+f.lv+' deck'+(f.lv>1?'s':''),lx+lw,y+137,'#8e978b','right');
      const parts=Object.entries(c.need).map(([k,v])=>v+' '+RAW[k].name.toLowerCase());if(c.water)parts.push(c.water+' swig of water');wrap(f.desc+' Needs '+parts.join(', ')+'.',lx,y+148,lw,9,cookOk(c)?'#9fcf9a':'#b9c0b3');}
    const sx=x+200,sw=w-208;F('#1f2524',x+192,y+4,1,h-10);txt('Raw ingredients',sx,y+4,AMBER);let yy=y+17;
    for(const k in RAW){const n=P.raw[k]||0;txt(RAW[k].name,sx,yy,n?'#c9cfc2':'#3f4642');txt(''+n,sx+sw,yy,n?'#e3e6dc':'#3f4642','right');yy+=10;}
    txt('Flask water: '+(P.flask.kind==='water'?P.flask.n:0)+' swig'+((P.flask.kind==='water'&&P.flask.n===1)?'':'s'),sx,yy+4,'#6fb3c3');
    const r2=L[fdSel]&&L[fdSel].cook;if(r2){const k0=Object.keys(r2.need)[0];wrap(RAW[k0].name+': '+RAW[k0].where+'.',sx,yy+16,sw,9,'#5d655f');}
    return;}
  if(!L.length)wrap('Empty. Food turns up in break rooms, greenhouses, lockers and chests.',lx,y+18,lw,10,'#5d655f');
  L.forEach((r,i)=>{const yy=y+17+i*12,sel=i===fdSel;const hov=ui(lx-2,yy-2,lw+4,12,{click:()=>{fdSel=i;useFoodRow(r);}});if(hov&&mouse.moved)fdSel=i;
    if(sel){F('#1c2220',lx-2,yy-2,lw+4,12);F(AMBER,lx-2,yy-2,2,12);}
    if(r.emetic){txt('Emetic syrup x'+P.inv.emetic,lx+6,yy,'#b8c060');txt('vomit',lx+lw,yy,'#6a726c','right');return;}
    const f=FOOD[r.k],full=P.sat+f.sat>100;F(f.col,lx+2,yy+1,3,5);txt(f.name+' x'+P.food[r.k],lx+8,yy,full?'#5d655f':'#e3e6dc');txt(f.sat+' sat',lx+lw,yy,full?'#6a4a40':'#8e978b','right');});
  const r=L[fdSel];F('#1f2524',lx,y+120,lw,1);
  if(r&&!r.emetic){const f=FOOD[r.k];txt(f.name,lx,y+125,AMBER);wrap(f.desc+' Lasts '+f.lv+' deck'+(f.lv>1?'s':'')+'.',lx,y+136,lw,9,'#b9c0b3');}
  else if(r)wrap('Empties your stomach, ends every food buff and costs 4 health.',lx,y+125,lw,9,'#b9c0b3');
  {const by=y+h-26,need=foodNeed(),fx=P.foodXp||0;F('#1f2524',lx,by-4,lw,1);txt('food level '+(P.foodLv||0),lx,by,'#e8c070');txt(P.ghost>0?'ghost '+Math.ceil(P.ghost):'',lx+lw,by,'#dfe8ff','right');
    txt(Math.floor(fx)+' / '+need+' xp',lx,by+10,'#8e978b');F('#141817',lx,by+20,lw,4);F('#e8c070',lx,by+20,Math.round(lw*fx/need),4);}
  const sx=x+200,sw=w-208;F('#1f2524',x+192,y+4,1,h-10);
  txt('Satiety',sx,y+4,AMBER);txt(Math.round(P.sat)+' / 100',sx+sw,y+4,'#c9cfc2','right');
  F('#141817',sx,y+16,sw,5);F('#c8a060',sx,y+16,Math.round(sw*P.sat/100),5);
  wrap('Eating earns food xp, cooked dishes half again. Each food level heals you and adds ghost health: it soaks hits after armor and never heals.',sx,y+26,sw,9,'#6f7a6a');
  txt('Active buffs',sx,y+72,AMBER);
  if(!P.buffs.length)txt('none',sx,y+84,'#3f4642');
  P.buffs.forEach((b,i)=>{const f=FOOD[b.id],yy=y+84+i*10;if(yy>y+h-10)return;txt(f.name,sx,yy,'#c9cfc2');txt(b.lv+' deck'+(b.lv>1?'s':''),sx+sw,yy,'#8e978b','right');});
}
let skSel=0,bxSel=0,bxScroll=0,bestiary=null;
const BEASTS=['husk','crawler','spitter','wasp','guard','warden','frog','spider','snake','arcsnake','lurker','grasper','snare','pod','trip','ghost','slug','toxslug','snail','charger','drone','brute'];
const BEASTINFO={
  husk:{name:'Husk',lore:'Station crew, or what the static left of them. Slow and stubborn, they follow noise through open doors and never quite give up.',move:'slow',attack:'claws at close range'},
  crawler:{name:'Crawler',lore:'Low, fast and many-legged. Something that grew in the brine tanks. Fragile, but it closes the gap before you can line up a shot.',move:'very fast',attack:'quick bites'},
  spitter:{name:'Spitter',lore:'Keeps its distance and lobs caustic globs, circling rather than charging. Shows up from the second deck down.',move:'slow, keeps range',attack:'ranged glob'},
  snake:{name:'Brine snake',lore:'Long, banded and quick, it lives in the flooded decks and moves faster through water than out of it. It weaves as it comes, darts off after every bite, and jinks aside when you line up a shot. Its long body makes a bigger target than its speed suggests.',move:'fast, erratic, quicker in water',attack:'bite, then darts away'},
  arcsnake:{name:'Arc snake',lore:'A brine snake that nested in live cabling and came out wrong. Every few seconds it discharges a pulse that shocks anything close, and anything standing in water it is touching. Watch for the sparks along its body.',move:'fast, erratic, quicker in water',attack:'bite and electric pulse'},
  warden:{name:'Sector stalker',lore:'Each part of the station has something huge that has learned to follow survivors from deck to deck: the Intake Maw charges, the Pressure Hulk slams the floor, the Sorter hurls crates, the Frost Matron breathes ice, the Brine Octopus drags you in under a cloud of ink, and the Arc Lord pulses with current. Kill one and it stops following you.'},
  wasp:{name:'Bloom wasp',move:'darting flight, keeps its distance, often in swarms',attack:'lunging sting, then dazed for a moment',lore:'Thumb-sized wasps that nest in the overgrowth and guard the blooms. They hover at a wary distance, then lunge with a sting. Each lunge leaves them dazed and drifting for a second, which is your opening. They fly over water and chasms.'},
  guard:{name:'Security guard',move:'slow, holds its range, follows you',attack:'sidearm shots, radios for backup',lore:'Station security, still on shift. Slow, well protected and armed with a sidearm. If one keeps you in sight for a few seconds it radios for backup and the deck alarm goes off, unless you drop it first. Biometric trip scanners call them too.'},
  pod:{name:'Seedpod bloom',move:'rooted in a wall',attack:'fans of seeds',lore:'A fleshy violet flower rooted in a wall seam. When something moves in front of it, it puffs out a fan of hard seeds. It cannot move and dies quickly once you reach it.'},
  trip:{name:'Tripwire vine',move:'rooted in a wall',attack:'tripwire tendril that drags you',lore:'A wall-rooted vine that lays a thorny tendril across the floor and waits. Cross the tendril and it snaps tight and drags you back to the wall. Dash, blink or hurt it to break free, and it takes a while to regrow.'},
  spider:{name:'Duct spider',move:'slow, keeps its distance',attack:'sticky web shots, strings web lines',lore:'A slow, long-legged thing that nests in the air ducts. It keeps its distance and spits sticky web, and now and then strings a web across a corridor. Webs slow anything that wades through them, but tear apart after one pass. Fire clears them.'},
  frog:{name:'Bog frog',move:'hops in short bursts, fast in water',attack:'tongue lash',lore:'A dog-sized frog bred in the hydroponics drains. It hops in short bursts, swims fast, and croaks loud enough to wake the deck. Its tongue lashes out like a whip from a few paces away, and anything in the way gets hit, including other creatures.'},
  charger:{name:'Ram',lore:'Heavy, low and armored at the front. It paws the floor, locks on, then builds speed in a straight line and cannot turn once it commits. Walls stop it cold and leave it dazed. Anything in its path gets flattened, including its own kind.',move:'plods, then charges in a straight line',attack:'charge impact, heavy knockback'},
  drone:{name:'Watcher drone',lore:'A station security drone still running old orders. It never attacks. It keeps its distance, follows you and sounds an alarm that brings everything nearby. Two hits bring it down, if you can catch it.',move:'flies, keeps its distance',attack:'none, calls others'},
  slug:{name:'Sludge slug',lore:'A bloated mutant slug the size of a dog. Slow and soft, but it coats every tile it crosses in sticky slime that clings to your boots. Dash over trails, burn them off, or scrape them thin by walking through.',move:'very slow, leaves sticky slime',attack:'crushing bite'},
  toxslug:{name:'Blight slug',lore:'A sludge slug that fed on the toxic spills. Its trail is still sticky, and it also poisons anything that wades through it. The bite poisons too.',move:'very slow, leaves toxic slime',attack:'poisoned bite'},
  snail:{name:'Plated snail',lore:'A huge snail with a shell of fused hull plating. Guns barely scratch the shell, and it pulls in tight when hurt. Explosions, rams and hazards get through fine. Leaves a sticky trail.',move:'crawls, leaves sticky slime',attack:'heavy bite, armored shell'},
  grasper:{name:'Grasper',lore:'A many-armed thing from the flooded depths that cannot leave deep water. It waits just under the surface near the edge, then lashes out a long tentacle to snatch anything within reach and haul it into the water, biting when it gets you close. Shoot the tentacle, shove it off, or dash free.',move:'deep and waist-deep water only',attack:'tentacle grab and drag, bite'},
  ghost:{name:'Ghost',lore:'A pale shape that drifts through walls on haunted decks. Bullets, shoves and blasts pass straight through it. It dashes through you, leaving a chill of radiation, and flees the moment you look straight at it. Only radiation weapons hurt it, and an anomaly core destroys it outright.',move:'drifts through walls, flees your gaze',attack:'dash through, radiation'},
  snare:{name:'Snarevine',lore:'A rooted, toothy bloom from overgrown decks. It cannot move, but it lashes a slow green tendril to catch anything nearby and reel it in to its poisoned core. Shoot the vine, shove it or dash free, and keep your distance.',move:'rooted in place',attack:'vine grab and pull, poisoned bite'},
  lurker:{name:'Lurker',lore:'Something big living in the deepest water, and it cannot leave it. It stays submerged, where bullets skip off the surface, and shows only a ripple. When you come close it rises and bites, then stays up a moment before diving. Stay out of the deep water, or wait for it to surface. Explosions reach it underwater.',move:'deep and waist-deep water only',attack:'rising bite'},
  brute:{name:'Brute',lore:'A husk that kept growing. Soaks a magazine, hits hard enough to crack plating, and barely moves when shoved. Deeper decks only.',move:'slow',attack:'heavy slam'}
};
let progMode=0,apSel=0;
const LVLSTAT=['kills','hacks','items','chests','rare','doors','secrets','dmg'];
function runStat(k){const P=player;return ((P.rs&&P.rs[k])||0)+(LVLSTAT.includes(k)&&lvl?(lvl[k]||0):0);}
const ACH=[
  {id:'blood',name:'First blood',desc:'Take out a creature.',pts:1,test:()=>runStat('kills')>=1},
  {id:'exterm',name:'Exterminator',desc:'Take out 50 creatures in one run.',pts:3,test:()=>runStat('kills')>=50},
  {id:'deep',name:'Deep diver',desc:'Reach depth 6.',pts:3,test:()=>depth>=6&&!testMode},
  {id:'clean',name:'Untouched',desc:'Finish a deck without taking any damage.',pts:3,test:()=>player.rs.clean},
  {id:'quiet',name:'Ghost of the deck',desc:'Finish a deck at depth 3 or deeper without drawing a wave.',pts:2,test:()=>player.rs.quiet},
  {id:'hacker',name:'Lockpicker',desc:'Pull off 8 hacks.',pts:2,test:()=>runStat('hacks')>=8},
  {id:'secret',name:'Treasure hunter',desc:'Find 4 secret rooms.',pts:2,test:()=>runStat('secrets')>=4},
  {id:'crits',name:'Sharpshooter',desc:'Land 25 critical hits.',pts:2,test:()=>(player.rs.crits||0)>=25},
  {id:'frenzy',name:'Frenzied',desc:'Reach a 15-hit combo.',pts:2,test:()=>(player.rs.maxCombo||0)>=15},
  {id:'cook',name:'Line cook',desc:'Cook 5 dishes.',pts:2,test:()=>(player.rs.cooked||0)>=5},
  {id:'fed',name:'Well fed',desc:'Reach food level 3.',pts:2,test:()=>(player.foodLv||0)>=3},
  {id:'files',name:'Archivist',desc:'Have 6 crew files.',pts:2,test:()=>player.found&&player.found.length>=6},
  {id:'arcade',name:'Arcade regular',desc:'Win 3 arcade games.',pts:1,test:()=>(player.rs.arcade||0)>=3}];
const AP_TRADES=[{label:'1 clearance',cost:2,act:()=>{player.clear++;return '+1 clearance';}},
  {label:'a random tonic',cost:4,act:()=>{const ks=Object.keys(SUBS);gainTonic(ks[rnd(ks.length)]);return 'a tonic';}},
  {label:'an unfound crew file',cost:6,ok:()=>!!FILES.find(f=>!hasFile(f.id)&&f.kind!=='classified'),act:()=>{const L=FILES.filter(f=>!hasFile(f.id)&&f.kind!=='classified');gainFile(L[rnd(L.length)].id);return 'a crew file';}}];
function apTrade(t){const P=player;if((P.ap||0)<t.cost||(t.ok&&!t.ok())){sfx('deny');return;}P.ap-=t.cost;const r=t.act();sfx('craft');say('traded '+t.cost+' points for '+r);}
let achT=0;
function checkAch(dt){const P=player;if(!P||!P.rs||testMode&&!testDeck)return;achT-=dt;if(achT>0)return;achT=0.5;P.rs.maxCombo=Math.max(P.rs.maxCombo||0,Math.floor(P.combo||0));
  for(const a of ACH){if(P.ach[a.id])continue;if(a.test()){P.ach[a.id]=true;if(!META.ach[a.id]){META.ach[a.id]=true;saveMeta();}P.ap=(P.ap||0)+a.pts;say('achievement: '+a.name.toLowerCase()+'  (+'+a.pts+' points, spend them in Progress)');float(P.x,P.y-16,a.name,'#ffe070');sfx('hackwin');}}}
function drawProgressTab(x,y,w,h){['Bestiary','Run stats','Achievements'].forEach((n,i)=>{const bx=x+8+i*84,act=progMode===i;ui(bx,y+2,80,11,{click:()=>{progMode=i;sfx('click');}});F(act?'#1c2220':'#0a0d0c',bx,y+2,80,11);F(act?AMBER:'#2a302e',bx,y+12,80,1);txt(n,bx+40,y+4,act?AMBER:'#8e978b','center');});
  txt('A D switch view',x+w-8,y+4,'#3f4642','right');if(progMode===0)return drawBestiary(x,y+14,w,h-14);if(progMode===1)return drawRunStats(x,y+14,w,h-14);drawAch(x,y+14,w,h-14);}
function drawRunStats(x,y,w,h){const P=player,R=P.rs||{},rows=[
  ['Deepest deck',depth],['Creatures taken out',runStat('kills')],['Damage dealt',Math.round(R.dealt||0)],['Damage taken',Math.round(runStat('dmg'))],['Critical hits',R.crits||0],['Best combo',Math.max(R.maxCombo||0,Math.floor(P.combo||0))],
  ['Items picked up',runStat('items')],['Chests opened',runStat('chests')+runStat('rare')],['Secrets found',runStat('secrets')],['Hacks pulled off',runStat('hacks')],['Doors forced',runStat('doors')],
  ['Dishes cooked',R.cooked||0],['Meals eaten',R.eaten||0],['Food level',P.foodLv||0],['Crew files',(P.found||[]).length+' of '+FILES.length],['Waves drawn',runAlertWaves],['Arcade wins',R.arcade||0],['Run score',runScore+liveLevelScore()]];
  const half=Math.ceil(rows.length/2),cw=(w-36)/2;rows.forEach((r,i)=>{const col=i<half?0:1,yy=y+6+(i%half)*11,cx=x+12+col*(cw+12);txt(r[0],cx,yy,'#8e978b');txt(''+r[1],cx+cw,yy,'#e3e6dc','right');});}
function drawAch(x,y,w,h){const P=player,lx=x+10,lw=w-152;txt('points '+(P.ap||0),lx,y+4,'#ffe070');
  let hv=null;ACH.forEach((a,i)=>{const yy=y+17+i*10,got=P.ach&&P.ach[a.id];if(ui(lx-2,yy-2,lw+4,10,{click:()=>{}}))hv=a;if(hv===a)F('#141917',lx-2,yy-2,lw+4,10);F(got?'#ffe070':'#2a302e',lx,yy+1,6,6);if(got)F('#0a0d0c',lx+2,yy+3,2,2);txt(a.name,lx+10,yy,got?'#e3e6dc':'#8e978b');txt(got?'done':'',lx+lw-22,yy,'#6f7a6a','right');txt('+'+a.pts,lx+lw,yy,got?'#ffe070':'#4f5a55','right');});
  {const a=hv||ACH.find(q=>!(P.ach&&P.ach[q.id]))||ACH[0];F('#1f2524',lx,y+h-24,lw,1);txt(a.name,lx,y+h-20,AMBER);wrap(a.desc,lx,y+h-10,lw,9,'#b9c0b3');}
  const tx=x+w-132;F('#1f2524',tx-6,y+4,1,h-10);txt('Trade points',tx,y+4,AMBER);
  AP_TRADES.forEach((t,i)=>{const yy=y+18+i*24,ok=(P.ap||0)>=t.cost&&(!t.ok||t.ok()),sel=i===apSel;const hov=ui(tx,yy,122,20,{click:()=>{apSel=i;apTrade(t);}});if(hov&&mouse.moved)apSel=i;
    box(tx,yy,122,20,sel?'#1c2220':'#0e1211',ok?(sel?AMBER:'#6b5220'):'#2a302e');txt(t.label,tx+6,yy+3,ok?'#e3e6dc':'#5d655f');txt(t.cost+' points',tx+6,yy+11,ok?'#ffe070':'#4f5a55');});
  wrap('Achievements last for this run. Points can be traded any time.',tx,y+94,122,9,'#4f5a55');}
function drawBestiary(x,y,w,h){
  const lx=x+8,lw=150;bxSel=Math.max(0,Math.min(bxSel,BEASTS.length-1));
  const found=BEASTS.filter(b=>bestiary.seen[b]).length,totalK=BEASTS.reduce((a,b)=>a+(bestiary.kills[b]||0),0);
  txt('Creatures this run',lx,y+4,AMBER);
  const visN=Math.max(4,Math.floor((h-62)/10));if(bxSel<bxScroll)bxScroll=bxSel;if(bxSel>=bxScroll+visN)bxScroll=bxSel-visN+1;bxScroll=Math.max(0,Math.min(bxScroll,BEASTS.length-visN));
  BEASTS.forEach((b,i)=>{if(i<bxScroll||i>=bxScroll+visN)return;const yy=y+17+(i-bxScroll)*10,known=!!bestiary.seen[b],sel=i===bxSel;
    const hov=ui(lx-2,yy-2,lw+4,10,{click:()=>{bxSel=i;sfx('click');}});if(hov&&mouse.moved)bxSel=i;
    if(sel){F('#1c2220',lx-2,yy-2,lw+4,11);F(AMBER,lx-2,yy-2,2,11);}
    F(known?ET[b].col:'#2a302e',lx+4,yy+1,5,5);
    txt(known?BEASTINFO[b].name:'???',lx+14,yy,known?(sel?'#e3e6dc':'#b9c0b3'):'#4f5a55');
    txt(known?(bestiary.kills[b]||0)+' killed':'unseen',lx+lw,yy,known?'#8e978b':'#3f4642','right');});
  if(BEASTS.length>visN){const th=visN*10,bh=Math.max(8,th*visN/BEASTS.length),bby=y+15+(th-bh)*bxScroll/Math.max(1,BEASTS.length-visN);F('#141817',lx+lw+4,y+15,2,th);F('#5d655f',lx+lw+4,bby,2,bh);}
  const fy=y+17+visN*10+2;F('#1f2524',lx,fy,lw,1);
  txt('discovered '+found+' of '+BEASTS.length,lx,fy+5,'#8e978b');
  txt(BEASTS.length-found?(BEASTS.length-found)+' not yet seen':'all logged',lx,fy+15,BEASTS.length-found?'#6f7a6a':'#9fcf9a');
  txt('total kills '+totalK,lx,fy+25,'#8e978b');
  // detail
  const dx=x+176,dw=w-184,b=BEASTS[bxSel],known=!!bestiary.seen[b];
  F('#1f2524',x+168,y+4,1,h-10);
  const bx=dx,by=y+4;box(bx,by,64,64,'#070908','#1f2524');
  if(known){const e=mkEnemy(b,camX,camY);e.portrait=true;e.ph=T*3;ctx.save();ctx.beginPath();ctx.rect(bx+1,by+1,62,62);ctx.clip();
    ctx.translate(bx+32,by+34);ctx.scale(4,4);drawEnemy(e);ctx.restore();}
  else txt('?',bx+32,by+24,'#3f4642','center',16);
  const tx=bx+72,tw=dw-72;
  if(!known){txt('Unknown',tx,by+2,'#6f7a6a');wrap('Nothing logged yet. Get it in your light to add it here.',tx,by+14,tw,9,'#4f5a55');return;}
  const I=Object.assign({move:'unknown',attack:'unknown'},BEASTINFO[b]),E=ET[b];
  txt(I.name,tx,by+2,AMBER);txt('first seen at depth '+bestiary.seen[b],tx,by+13,'#6f7a6a');
  const rows=[['Health',Math.round(E.hp*(1+(depth-1)*0.12)*10)/10+' (now)'],['Movement',I.move],['Attack',I.attack+(E.dmg?', '+E.dmg+' dmg':'')],['Points',KILLPTS[b]],['Killed',bestiary.kills[b]||0]];
  let yy=by+26;ctx.font='8px '+FONT;for(const [k,v] of rows){const vs=''+v,lw2=ctx.measureText(k).width+8;txt(k,tx,yy,'#8e978b');if(ctx.measureText(vs).width<=tw-lw2){txt(vs,tx+tw,yy,'#c9cfc2','right');yy+=9;}else{yy=wrap(vs,tx+8,yy+9,tw-8,9,'#c9cfc2')+1;}}
  {const ly=Math.max(by+70,yy+4),lines=Math.floor((y+h-6-ly)/9);ctx.save();ctx.beginPath();ctx.rect(dx-2,ly-2,dw+4,y+h-4-ly);ctx.clip();wrap(I.lore,dx,ly,dw,9,'#b9c0b3');ctx.restore();}
}
