// World: sectors, biome layouts and palettes, route node types, water depths, room modules and names, hidden room weights, deck conditions, hazard text, deck sizes, seed words.
// ---------- data ----------
const SECTORS=['INTAKE','PUMP HALL','SORTING FLOOR','COLD STORE','BRINE WORKS','RELAY CORE','THE DRY WELL'];
const BNAMES=['Intake','Pump Hall','Sorting Floor','Cold Store','Brine Works','Relay Core'];
const PAL=[
 {fl:'#1a1e1d',hi:'#242a28',lo:'#111413',riv:'#323a37',gr:'#0f1211',sl:'#222826',wall:'#2e3533',cap:'#4b5551',face:'#262c2a',faceHi:'#353d3a',faceLo:'#1b1f1e',pipe:'#56504a',pipeHi:'#7a7166',acc:'#d9a441',rock:'#161a19'},
 {fl:'#181c20',hi:'#22282e',lo:'#101316',riv:'#2f3740',gr:'#0e1114',sl:'#1f252c',wall:'#2c333b',cap:'#48525e',face:'#242a31',faceHi:'#333b44',faceLo:'#191d22',pipe:'#3f5a66',pipeHi:'#5f8290',acc:'#d9a441',rock:'#14171b'},
 {fl:'#1e1b17',hi:'#29241e',lo:'#13110e',riv:'#3a332a',gr:'#12100d',sl:'#262119',wall:'#36302a',cap:'#564c40',face:'#2c2721',faceHi:'#3d352d',faceLo:'#1e1a16',pipe:'#6b4a2e',pipeHi:'#916a44',acc:'#d9a441',rock:'#1a1714'},
 {fl:'#1a1f23',hi:'#262d33',lo:'#111518',riv:'#36414a',gr:'#0f1316',sl:'#232a31',wall:'#333d45',cap:'#5a6873',face:'#2a323a',faceHi:'#3b4650',faceLo:'#1d2328',pipe:'#8a9aa6',pipeHi:'#c2d0da',acc:'#8fc3d9',rock:'#161b1f'},
 {fl:'#161d1c',hi:'#1f2a28',lo:'#0e1312',riv:'#2c3a37',gr:'#0c1110',sl:'#1b2523',wall:'#28332f',cap:'#435650',face:'#212b28',faceHi:'#2f3d39',faceLo:'#161d1b',pipe:'#4d6b5f',pipeHi:'#73988a',acc:'#d9a441',rock:'#131917'},
 {fl:'#1c1a20',hi:'#27242d',lo:'#121116',riv:'#37333f',gr:'#100f13',sl:'#221f28',wall:'#312d38',cap:'#4f4959',face:'#28252e',faceHi:'#37323f',faceLo:'#1b1920',pipe:'#5a4a6b',pipeHi:'#806c96',acc:'#c47ad9',rock:'#17151b'}
];
const COND_LIGHT={normal:'',lit:'floodlit',dark:'blackout'};
const COND_HAZ={molten:'molten slag',chasm:'open chasms',overgrowth:'overgrowth',sprinklers:'fire sprinklers',fog:'thick fog',steam:'steam vents and risers',fire:'active fires',toxic:'toxic spill',anomaly:'gravity anomalies',electrical:'live cabling',volatile:'fuel stores'};
const MODS={
  greenhouse:{name:'greenhouse',kd:5,w:6,h:5,style:'slide',lock:0.1},
  lockers:{name:'locker room',kd:6,w:5,h:4,style:'swing',lock:0.15},
  bathroom:{name:'washroom',kd:7,w:3,h:3,style:'swing',lock:0},
  medbay:{name:'medbay',kd:8,w:5,h:4,style:'slide',lock:0.3},
  breakroom:{name:'break room',kd:9,w:5,h:4,style:'swing',lock:0.15},
  lab:{name:'laboratory',kd:10,w:6,h:4,style:'slide',lock:0.5},
  arcade:{name:'arcade',kd:11,w:5,h:4,style:'slide',lock:0.1},
  cafeteria:{name:'cafeteria',kd:13,w:7,h:5,style:'slide',lock:0.1},
  bathhouse:{name:'bathhouse',kd:14,w:6,h:5,style:'swing',lock:0.15},
  court:{name:'sportsball court',kd:15,w:8,h:6,style:'slide',lock:0},
  custodial:{name:'custodial closet',kd:16,w:3,h:3,style:'swing',lock:0.4}
};
const ROOMNAMES=[['filtration bay','intake hall','valve room','staging area','pump gallery','sluice office'],['pump hall','turbine room','pressure gallery','gauge room','sump','maintenance bay'],
  ['sorting floor','parcel hall','conveyor bay','tally office','dispatch room','crate stacks'],['cold store','freezer aisle','meat locker','frost hall','thaw room','loading dock'],
  ['brine works','salt pans','settling tank','pipe hall','evaporator','drain room'],['relay core','switch room','cable vault','signal hall','transformer bay','server stacks']];
const HAZDESC={fog:'Thick fog cuts how far you can see.',steam:'Wall risers and floor vents erupt with scalding steam.',fire:'Fires burn across the deck and spread through oil.',toxic:'Toxic spills poison anything wading through, and noxious pipes spray.',anomaly:'Gravity anomalies drift around, pulling everything in.',electrical:'Live cables arc across the floor. A breaker panel can cut the power.',volatile:'Fuel barrels everywhere.',overgrowth:'Plants have taken over: blooms, vines, wall plants and ingredients.',sprinklers:'Fire sprinklers soak the deck now and then.',chasm:'Open chasms you can only float across.',molten:'Molten slag burns anything touching it. Water turns it to crust.'};
const LIQ=[1,1,0.62,0.38,0.45],LIQNAME=['','','knee deep','waist deep','swimming'];
const BIOME=[
  {rooms:16,w:[4,8],h:[4,7],cw:2,pillars:.6,flood:.14},
  {rooms:11,w:[7,13],h:[6,10],cw:3,pillars:.3,flood:.55},
  {rooms:20,w:[4,7],h:[4,6],cw:2,pillars:.2,flood:.06},
  {rooms:14,w:[5,10],h:[5,9],cw:2,pillars:.95,flood:.03},
  {rooms:10,w:[8,14],h:[7,11],cw:3,pillars:.25,flood:.8},
  {rooms:15,w:[5,9],h:[5,8],cw:2,pillars:.5,flood:.3}
];
const NODE={
  station:{name:'Station deck',icon:'S',col:'#a8b0a4',desc:'A regular deck of the station.'},
  flooded:{name:'Flooded deck',icon:'W',col:'#6fb3c3',desc:'Much of this deck is under water. Slow, loud wading.'},
  cache:{name:'Supply cache',icon:'C',col:'#e08a3a',desc:'Extra locked rooms and chests, and more of them guarding it.'},
  rest:{name:'Rest bay',icon:'R',col:'#7fd08e',desc:'A dry, quiet room. Heal, patch armor or sort your pack.'},
  merchant:{name:'Scrapper',icon:'$',col:'#d9a441',desc:'Someone still trading down here. Takes scrap.'},
  event:{name:'Signal',icon:'!',col:'#c9a8ff',desc:'Something unusual. Could go either way.'}
};
const HIDDEN_TYPES=[['stash',3],['secops',2],['merchant',1.5],['control',2]];
// Deck sizes (tiles). Medium is the original 64x64 deck; AREA is each size's area relative to it.
const DECK_SIZES={s:{w:48,h:48,name:'small deck'},m:{w:64,h:64,name:'medium deck'},l:{w:96,h:80,name:'large deck'}};
// Size odds on ordinary junctions, and on a sector's exit deck and arena decks (which lean large)
const DECK_SIZE_ODDS={normal:[['s',25],['m',60],['l',15]],big:[['s',15],['m',35],['l',50]]};
// Words for readable random run seeds ("KESTREL-4471")
const SEED_WORDS=['KESTREL','BRINE','RELAY','INTAKE','SORTER','FROST','SLAG','BALLAST','ANCHOR','SIGNAL','HULL','VALVE','CABLE','SONAR','PUMP','LANTERN','HATCH','GANTRY','SILT','CINDER','DRIFT','TIDE','RIVET','BEACON'];
