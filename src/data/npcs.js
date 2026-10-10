// NPCs.
const NPCS={
  scrapper:{name:'Scrap trader',robe:'#6a5a3a',head:'#c8a888',acc:'pack',calm:'"Easy. I only bite on prices."',
    body:'A wiry trader with a pack of salvage bigger than they are. "Ammo, fuel, blades. Scrap only, no credit."',
    opts:f=>[['20 sidearm rounds',3,()=>{player.inv.rounds+=20;}],['6 shells',4,()=>{player.inv.shells+=6;}],['6 power cells',4,()=>{player.inv.cells+=6;}],['20 fuel',3,()=>{player.inv.fuel+=20;}],['3 throwing knives',2,()=>{player.inv.knives+=3;if(!player.has.knives)gainArm('knives');}]]},
  quarter:{name:'Quartermaster',robe:'#3a4a3a',head:'#b89878',acc:'cap',calm:'"At ease. I have no quarrel with you."',
    body:'A tired quartermaster guarding two crates of kit. "Signed out, never returned. Yours, for a price."',
    init:f=>{f.stock=[randomGear(),randomGear()];},opts:f=>f.stock.map((g,i)=>[i,g]).filter(q=>q[1]).map(([i,g])=>[GEAR[g].name,7,()=>{gainGear(g);f.stock[i]=null;},()=>!!f.stock[i]])},
  cook:{name:'Galley cook',robe:'#d8d0c0',head:'#c8a080',acc:'hat',calm:'"I feed everyone. Even you."',
    body:'Someone has a hot plate running in the dark. "Sit. Eat. Or take something for the road."',
    opts:f=>[['a hot meal',4,()=>{const L=COOK.map(c=>c.out);const k=L[rnd(L.length)];player.food[k]=(player.food[k]||0)+1;say('a '+FOOD[k].name.toLowerCase());}],['3 raw ingredients',3,()=>{for(let k=0;k<3;k++){const r=randRaw();player.raw[r]=(player.raw[r]||0)+1;}}],['a bundle of 3 herbs',3,()=>{for(let k=0;k<3;k++){const h=randHerb();player.herbs[h]=(player.herbs[h]||0)+1;}say('a bundle of herbs, tied with string');}],['fill your flask with water',0,()=>{player.flask.kind='water';player.flask.n=3;},()=>player.flask.has]]},
  subject:{name:'Subject Nine',robe:'#e8e8e8',head:'#d0c0d0',acc:'band',calm:'"You are already in here. I can feel you knocking."',
    body:'A patient in a torn white gown, wires still taped to their scalp. "They made me listen. I hear the whole deck. Want to borrow it?"',
    opts:f=>[['let them show you the deck (radiation)',0,()=>{f.read=true;for(let i=0;i<MW*MH;i++)if(map[i]===0)seen[i]=1;player.st.rad=Math.min(100,player.st.rad+25);say('the whole deck floods into your head. it hurts');},()=>!f.read],
      ['ask about the classified projects',5,()=>{const L=FILES.filter(q=>q.kind==='classified'&&!hasFile(q.id));if(L.length)gainFile(L[rnd(L.length)].id);f.told=true;},()=>!f.told&&FILES.some(q=>q.kind==='classified'&&!hasFile(q.id))]]},
  bomber:{name:'Demolition tech',robe:'#4a5a3a',head:'#b89070',acc:'visor',calm:'"Careful. My hands are the only steady thing here."',
    body:'A blast-suited tech sorting charges by touch. "I can sell you a bang, or teach you to live through one."',
    opts:f=>[['2 pipe charges',4,()=>{player.inv.charge+=2;}],['a molotov',3,()=>{player.inv.molotov=(player.inv.molotov||0)+1;}],['blast drills (half explosion damage this deck)',5,()=>{player.blastDrill=true;},()=>!player.blastDrill]]},
  locksmith:{name:'Locksmith',robe:'#5a4a6a',head:'#c0a080',acc:'ring',calm:'"Locks and people. Both open if you are gentle."',
    body:'A locksmith with a ring of picks on every finger. "Doors are just questions. I have answers."',
    opts:f=>[['a key',3,()=>{player.inv.key++;}],['open every locked door on this deck',7,()=>{HACKR.doors.act();},()=>map.some(v=>v===2)],['cut you a lift keycard',8,()=>{liftCard=true;if(liftState==='locked')liftState=(cond&&cond.obj==='both')?'idle':'open';say('the lift will take you now');},()=>liftState==='locked']]},
  android:{name:'KR-7 android',robe:'#8a969e',head:'#c8d0d8',acc:'eye',calm:'"Emotional override detected. Ignoring. Still friendly."',
    body:'A maintenance android, half its casing gone. "UNIT KR-7. WILL SERVICE FOR POWER."',
    opts:f=>[['patch your armor (2 batteries)',0,()=>{player.inv.battery-=2;player.armor=50;},()=>player.inv.battery>=2&&player.armor<50],['scan the deck (1 battery)',0,()=>{player.inv.battery--;sonarT=4;sonarRing=0;sfx('sonar');markSecretsNear(player.x,player.y,400);},()=>player.inv.battery>=1],['trade 4 cells for a battery',0,()=>{player.inv.cells-=4;player.inv.battery++;},()=>player.inv.cells>=4]]},
  pilot:{name:'Mech pilot',robe:'#7a4a2a',head:'#c09070',acc:'helmet',calm:'"I like you already. Help me get her running."',
    body:'A pilot sits in the open hatch of a dead loader mech. "Two batteries and a pipe and she walks again. I would owe you."',
    opts:f=>[['help fix the mech (2 battery, 1 pipe)',0,()=>{player.inv.battery-=2;player.inv.pipe--;f.fixed=true;let n=0;for(const e of enemies){if(e.dead||ET[e.type].dummy)continue;if(Math.hypot(e.x-player.x,e.y-player.y)<220){damageEnemy(e,14,e.x-player.x,e.y-player.y,200);n++;}}shake=12;sfx('boom');gainGear(randomGear());say('the mech stomps through the room'+(n?' and flattens '+n+' creatures':'')+'. the pilot tosses you some kit');},()=>!f.fixed&&player.inv.battery>=2&&player.inv.pipe>=1]]},
  detective:{name:'Inspector',robe:'#3a3a4a',head:'#c8a888',acc:'fedora',calm:'"Nice try. I read people for a living."',
    body:'An inspector in a damp coat, notebook out. "Somebody hid things on this deck. For a price, I tell you where."',
    opts:f=>[['where are the hidden rooms?',4,()=>{const n=markSecretsNear(player.x,player.y,9999);for(const v of vaults)for(let y=v.y;y<v.y+v.h;y++)for(let x=v.x;x<v.x+v.w;x++)seen[y*MW+x]=1;say(n?'the inspector circles '+n+' hollow walls on your map':'the inspector shrugs. nothing hidden here');}],
      ['what is on the next ride?',2,()=>{const tr=nextTransit||rollTransit();nextTransit=tr;say('the inspector says: '+transitDesc(tr));}],
      ['map the lift routes from here',3,()=>{revealNear(2);say('the inspector sketches the next junctions on your route map');}],
      ['case notes',0,()=>{const left=enemies.filter(e=>!e.dead&&!ET[e.type].dummy).length;say('"'+left+' creatures still breathing on this deck, and '+items.length+' things lying around."');}]]}};
const NPC_IDS=Object.keys(NPCS);

// Hands and Bones (the gambler's dice game): health each side starts with. 12 took ~8.5 rounds; 9 takes ~6.3, still an even game.
const DICE_HP=9;
