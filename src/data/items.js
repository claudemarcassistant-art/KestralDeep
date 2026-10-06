// Items: gear, quick items, tools, pickups, flasks and the liquid tank, vending stock, resource descriptions.
const IT={
  rounds:{label:'rounds',amt:()=>6+rnd(5),ammo:1},shells:{label:'shells',amt:()=>2+rnd(2),ammo:1},
  nails:{label:'nails',amt:()=>10+rnd(8),ammo:1},cells:{label:'cells',amt:()=>3,ammo:1},knives:{label:'throwing knife',amt:()=>1,ammo:1},fuel:{label:'fuel',amt:()=>15,ammo:1},charge:{label:'pipe charge',amt:()=>1},mine:{label:'proximity mine',amt:()=>1},surgery:{label:'surgery kit',amt:()=>1},trauma:{label:'trauma kit',amt:()=>1},regen:{label:'regen shot',amt:()=>1},molotov:{label:'molotov',amt:()=>1},gasnade:{label:'gas grenade',amt:()=>1},smokenade:{label:'smoke grenade',amt:()=>1},flare:{label:'flare',amt:()=>1},medpatch:{label:'med patch',amt:()=>1},stim:{label:'stim shot',amt:()=>1},antitox:{label:'antitox',amt:()=>1},herb:{label:'herb',amt:()=>15},bolts:{label:'bolts',amt:()=>2,ammo:1},
  scrap:{label:'scrap',amt:()=>1},powder:{label:'powder',amt:()=>1},pipe:{label:'pipe',amt:()=>1},
  battery:{label:'battery',amt:()=>1},cloth:{label:'cloth',amt:()=>1},key:{label:'key',amt:()=>1},medkit:{label:'medkit',amt:()=>30}
};
const QUICK={
  charge:{name:'Pipe charge',desc:'Thrown explosive. Breaks weak walls, blows doors open and lights oil.',n:()=>player.inv.charge,use:()=>throwCharge()},
  flare:{name:'Flare',desc:'Thrown light that burns for 14 seconds and draws unaware enemies. Also on F.',n:()=>player.inv.flare,use:()=>throwFlare()},
  mine:{name:'Proximity mine',desc:'Set it at your feet. It arms after a second and blows when a creature steps close. You will not set it off, but you can be caught in the blast.',n:()=>player.inv.mine||0,use:()=>placeMine()},
  molotov:{name:'Molotov',desc:'Thrown bottle. Shatters into a burning oil spill.',n:()=>player.inv.molotov||0,use:()=>throwNade('molotov')},
  gasnade:{name:'Gas grenade',desc:'Thrown canister that hisses out a spreading poison cloud for a few seconds.',n:()=>player.inv.gasnade||0,use:()=>throwNade('gasnade')},
  smokenade:{name:'Smoke grenade',desc:'Thrown canister that pours out a thick smoke screen. Anyone inside can barely see, you included.',n:()=>player.inv.smokenade||0,use:()=>throwNade('smokenade')},
  medpatch:{name:'Med patch',desc:'Heals 25 hp.',n:()=>player.inv.medpatch||0,use:()=>{const p=player;if(p.hp>=maxHp()){say('already at full health');return;}p.inv.medpatch--;p.hp=Math.min(maxHp(),p.hp+Math.round(25*(1+0.2*U('medic'))*(perk('fielddress')?1.5:1)));sfx('stim');float(p.x,p.y-6,'+25 hp','#7fd08e');}},
  surgery:{name:'Surgery kit',desc:'Treats your worst injury on the spot.',n:()=>player.inv.surgery||0,use:()=>{const P=player;if(!P.injuries||!P.injuries.length){say('nothing to operate on');sfx('deny');return;}P.inv.surgery--;cureInjury(false);sfx('stim');}},
  medkit:{name:'Medkit',desc:'Heals 30 hp. Picked up when you are already healthy, it is kept for later.',n:()=>player.inv.medkit||0,use:()=>{const p=player;if(p.hp>=maxHp()){say('already at full health');return;}p.inv.medkit--;const a=Math.round(30*(1+0.2*U('medic'))*(perk('fielddress')?1.5:1));p.hp=Math.min(maxHp(),p.hp+a);sfx('stim');float(p.x,p.y-6,'+'+a+' hp','#7fd08e');}},
  trauma:{name:'Trauma kit',desc:'Heals 75 hp and clears poison, burning, bleeding slime and shock.',n:()=>player.inv.trauma||0,use:()=>{const p=player;p.inv.trauma--;const a=Math.round(75*(1+0.2*U('medic'))*(perk('fielddress')?1.5:1));p.hp=Math.min(maxHp(),p.hp+a);for(const k of ['psn','brn','stk','shk'])p.st[k]=0;sfx('stim');float(p.x,p.y-6,'+'+a+' hp','#7fd08e');}},
  regen:{name:'Regen shot',desc:'Heals 2 hp every second for 25 seconds.',n:()=>player.inv.regen||0,use:()=>{const p=player;p.inv.regen--;p.regenT=25;sfx('stim');say('warmth spreads through you');}},
  stim:{name:'Stim shot',desc:'30 seconds of sharper acceleration, 10% more speed and faster stamina.',n:()=>player.inv.stim||0,use:()=>{player.inv.stim--;player.stimT=30;sfx('stim');say('stim kicks in');}},
  antitox:{name:'Antitox shot',desc:'Clears poison and flushes 60% of radiation.',n:()=>player.inv.antitox||0,use:()=>{const p=player;if(!(p.st.psn>0||p.st.rad>0)){say('nothing to flush');return;}p.inv.antitox--;p.st.psn=0;p.st.rad=Math.max(0,p.st.rad-60);sfx('stim');say('antitox in. you feel cleaner');}},
  emetic:{name:'Emetic syrup',desc:'Empties your stomach and ends food buffs, for 4 health.',n:()=>player.inv.emetic||0,use:()=>useFoodRow({emetic:true})}
};
const FLASKCOL={water:'#6fb3c3',oil:'#3a3020',toxic:'#8ac040'};
const TANKMAX=12;
const GEAR={
  hardhat:{name:'Hard hat',slot:'head',desc:'Takes 8% off every hit.',dr:0.08,w:1},
  nvg:{name:'Night optics',slot:'head',desc:'See everything in line of sight, tinted green.',nvg:true,w:0.5},
  headlamp:{name:'Headlamp',slot:'head',desc:'A narrow beam wherever you look.',beam:{half:0.3,r:140},w:1.4},
  vest:{name:'Work vest',slot:'body',desc:'Takes 12% off every hit.',dr:0.12,w:1.2},
  platerig:{name:'Plate rig',slot:'body',desc:'Takes 22% off every hit, but you are 6% slower and heavier to get moving.',dr:0.22,spd:-0.06,accel:-0.25,w:0.7},
  gripgloves:{name:'Grip gloves',slot:'hands',desc:'Shoves hit 1 harder.',meleeDmg:1,w:1},
  loaders:{name:'Loader gloves',slot:'hands',desc:'Every weapon fires 12% faster.',rof:0.12,w:0.8},
  kneepads:{name:'Knee pads',slot:'legs',desc:'Halves the backpedal penalty while aiming.',backpedal:0.5,w:1},
  cargo:{name:'Cargo pants',slot:'legs',desc:'Ammo pickups give 25% more.',ammoBonus:0.25,w:1},
  runners:{name:'Runner boots',slot:'feet',desc:'Move 12% faster and pick up speed a little quicker.',spd:0.12,accel:0.2,w:1},
  cleats:{name:'Traction cleats',slot:'feet',desc:'Reach full speed and stop almost instantly.',accel:0.8,w:1},
  quietsoles:{name:'Quiet soles',slot:'feet',desc:'Your gunfire carries 30% less far.',quiet:0.3,w:0.9},
  lantern:{name:'Back lantern',slot:'back',desc:'Widens your light in every direction.',lantern:true,w:1.6},
  framepack:{name:'Frame pack',slot:'back',desc:'Chests give one extra item.',chestBonus:1,w:1},
  barrellight:{name:'Barrel light',slot:'acc',desc:'Throws a long cone of light where you aim.',beam:{half:0.42,r:178},w:2},
  pinger:{name:'Echo pinger',slot:'acc',desc:'Hidden passages close to you show up on their own.',pinger:true,w:1},
  luckytag:{name:'Lucky tag',slot:'acc',desc:'Enemies drop supplies more often, and your hits crit a little more.',luck:0.15,crit:0.03,w:1},
  loupe:{name:'Marksman loupe',slot:'acc',desc:'A clip-on eyepiece. +8% critical hit chance.',crit:0.08,w:1},
  injector:{name:'Slow injector',slot:'acc',desc:'Regain 1 hp every 4 seconds.',regen:0.25,w:0.8},
  lungs:{name:'Breath trainer',slot:'acc',desc:'40% more stamina, and it comes back faster.',stamina:0.4,w:1},
  splicer:{name:'Splicer kit',slot:'hands',desc:'Panel hacks get a wider window and a slower cursor.',hack:0.4,w:0.9},
  decoder:{name:'Signal decoder',slot:'acc',desc:'Shows what waits at the end of every lift route.',decoder:true,w:0.8},
  filtermask:{name:'Filter mask',slot:'head',desc:'Poison builds up half as fast.',poisonRes:0.5,w:1},
  rubberboots:{name:'Rubber boots',slot:'feet',desc:'Shock builds up half as fast, even when wet.',shockRes:0.5,w:1},
  padded:{name:'Padded jacket',slot:'body',desc:'Stun builds up 40% slower, so you get dazed less.',stunRes:0.4,w:1},
  lasersight:{name:'Laser sight',slot:'acc',desc:'A red laser out to 110 px that marks what it touches. While aiming, shots are 40% tighter and hit 10% harder.',laser:true,w:1.3},
  bandolier:{name:'Bandolier',slot:'shoulders',desc:'Two more quick slots.',qslots:2,w:1},
  utilbelt:{name:'Utility belt',slot:'legs',desc:'Two more quick slots.',qslots:2,w:1},
  pauldrons:{name:'Pauldrons',slot:'shoulders',desc:'Takes 5% off every hit and stun builds 20% slower.',dr:0.05,stunRes:0.2,w:1},
  poncho:{name:'Rubber poncho',slot:'shoulders',desc:'Poison and shock build 15% slower.',poisonRes:0.15,shockRes:0.15,w:1},
  saddlebag:{name:'Saddlebag',slot:'shoulders',desc:'Ammo pickups give 15% more.',ammoBonus:0.15,w:1},
  deflector:{name:'Deflector',slot:'acc',desc:'A 25-point energy ward that soaks hits without blocking. Recharges when you avoid damage.',shield:25,w:0.8},
  compass:{name:'Lift compass',slot:'acc',desc:'An arrow near you always points to the lift.',compass:true,w:1}
};
const VEND_POOL=[
  {label:'Rounds x12',cost:2,w:3,give:()=>{player.inv.rounds+=12;return '12 rounds';}},
  {label:'Shells x4',cost:3,w:2,give:()=>{player.inv.shells+=4;return '4 shells';}},
  {label:'Nails x25',cost:2,w:1.5,give:()=>{player.inv.nails+=25;return '25 nails';}},
  {label:'Bolts x3',cost:3,w:1,give:()=>{player.inv.bolts+=3;return '3 bolts';}},
  {label:'Ration pack (+25 hp)',cost:3,w:2.5,give:()=>{player.hp=Math.min(maxHp(),player.hp+25);return 'a ration pack (+25 hp)';}},
  {label:'Battery',cost:3,w:1.5,give:()=>{player.inv.battery++;return 'a battery';}},
  {label:'Cloth roll',cost:2,w:1.5,give:()=>{player.inv.cloth++;return 'cloth';}},
  {label:'Road flare',cost:2,w:1.5,give:()=>{player.inv.flare++;return 'a flare';}},
  {label:'Stim shot',cost:4,w:1,give:()=>{player.stimT=30;sfx('stim');return 'a stim (kicks in now)';}},
  {label:'Spare key',cost:4,w:0.8,give:()=>{player.inv.key++;return 'a key';}},
  {label:'Mystery capsule',cost:8,w:0.5,give:()=>{const g=randomGear();gainGear(g);return GEAR[g].name.toLowerCase();}}
];
const TOOLS={
  glowstick:{name:'Glowstick',desc:'Left click switches it on or off: a soft green light around you. Right click throws it to light a spot; walk over it to pick it back up.'},
  sledge:{name:'Sledgehammer',desc:'Left click swings it. Smashes weak walls and knocks back anything in front of you. Loud and tiring.'},
  scanner:{name:'Signal scanner',desc:'Left click sends a pulse. For a few seconds it shows which directions hold creatures, and how many.'}};
const RESDESC={rounds:'Sidearm ammo.',shells:'Scattergun ammo.',nails:'Nailer ammo.',bolts:'Bolt driver ammo.',cells:'Ray gun ammo.',scrap:'Salvage. Crafting, and currency for machines and traders.',powder:'Charges, shells, stims and flares.',pipe:'Weapons, bolts and charges.',battery:'Electronics, cells and weapons.',cloth:'Patches, flares and antitox.',key:'Opens locked doors, vaults and chests.',liftcard:'Unlocks this deck\'s lift.'};
const CXRES={scrap:'The station\'s currency, and the base of most recipes.',powder:'Gunpowder, for ammo, charges and grenades.',pipe:'Lengths of pipe for weapons and tools.',battery:'Power cells for gear, hacks and the android.',cloth:'Rags and webbing for bandages and kit.',key:'Opens locked doors and chests.',rounds:'Sidearm, SMG and sling ammo.',shells:'Scattergun ammo.',nails:'Nailer ammo.',bolts:'Bolt driver and bow ammo.',cells:'Ray gun ammo, and chainsaw power.',fuel:'Flamethrower fuel.',knives:'Throwing knives are their own ammo.'};
