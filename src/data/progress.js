// Progress: deck grades, run stats, work orders (ACH), point trades, challenge modifiers.
const GRADES=[['S',0.8,'#ffd070'],['A',0.6,'#9fe0b0'],['B',0.4,'#8fc3d9'],['C',0.2,'#c9cfc2'],['D',0,'#b8665a']];
const MODS_RUN=[{id:'glass',name:'Glass cannon',desc:'Half max health, but everything you do hits 40% harder.',unlock:'Complete the Sharpshooter work order.',ok:()=>META.ach.crits},
  {id:'dark',name:'Lights out',desc:'Every deck is dark.',unlock:'Complete the Ghost of the deck work order.',ok:()=>META.ach.quiet},
  {id:'hunted',name:'Hunted',desc:'A hunter stalks you from the very first sector.',unlock:'Kill a sector hunter.',ok:()=>META.hunters>0},
  {id:'lean',name:'Lean times',desc:'Far fewer supplies lying around.',unlock:'Complete the Deep diver work order.',ok:()=>META.ach.deep},
  {id:'swarm',name:'Swarming',desc:'Each deck holds about a third more creatures.',unlock:'Complete the Exterminator work order.',ok:()=>META.ach.exterm}];
const LVLSTAT=['kills','hacks','items','chests','rare','doors','secrets','dmg'];
// Work orders. One-off orders have test(); tiered orders (v0.99) have lv thresholds for levels I-IV and cnt(), and each new
// level pays pts x level. player.ach[id] and META.ach[id] hold the level reached (true in older saves means level I).
const WO_ROMAN=['I','II','III','IV'];
const ACH=[
  {id:'specimen',name:'Specimen collector',desc:'See every creature trait at least once (kept across runs).',pts:3,test:()=>traitsSeenAll()},
  {id:'blood',name:'First blood',desc:'Take out a creature.',pts:1,test:()=>runStat('kills')>=1},
  {id:'exterm',name:'Exterminator',desc:'Take out creatures in one run.',pts:3,lv:[50,100,200,400],cnt:()=>runStat('kills')},
  {id:'deep',name:'Deep diver',desc:'Reach a deep enough deck.',pts:3,lv:[6,10,14,18],cnt:()=>testMode?0:depth},
  {id:'clean',name:'Untouched',desc:'Finish decks (depth 2 or deeper) without taking any damage.',pts:3,lv:[1,3,6,10],cnt:()=>player.rs.cleanN||(player.rs.clean?1:0)},
  {id:'quiet',name:'Ghost of the deck',desc:'Finish decks at depth 3 or deeper without drawing a wave.',pts:2,lv:[1,3,6,10],cnt:()=>player.rs.quietN||(player.rs.quiet?1:0)},
  {id:'hacker',name:'Lockpicker',desc:'Pull off hacks.',pts:2,lv:[8,16,32,64],cnt:()=>runStat('hacks')},
  {id:'secret',name:'Treasure hunter',desc:'Find secret rooms.',pts:2,lv:[4,8,16,32],cnt:()=>runStat('secrets')},
  {id:'crits',name:'Sharpshooter',desc:'Land critical hits.',pts:2,lv:[25,50,100,200],cnt:()=>player.rs.crits||0},
  {id:'frenzy',name:'Frenzied',desc:'Reach a 15-hit combo.',pts:2,test:()=>(player.rs.maxCombo||0)>=15},
  {id:'cook',name:'Line cook',desc:'Cook dishes.',pts:2,lv:[5,10,20,40],cnt:()=>player.rs.cooked||0},
  {id:'fed',name:'Well fed',desc:'Reach food level 3.',pts:2,test:()=>(player.foodLv||0)>=3},
  {id:'files',name:'Archivist',desc:'Have 6 crew files.',pts:2,test:()=>player.found&&player.found.length>=6},
  {id:'arcade',name:'Arcade regular',desc:'Win arcade games.',pts:1,lv:[3,6,12,24],cnt:()=>player.rs.arcade||0},
  {id:'vaults',name:'Vault breaker',desc:'Open vaults in different sectors in one run.',pts:4,lv:[3,5,7,9],cnt:()=>new Set(player.vaultSecs||[]).size},
  {id:'attune1',name:'Signed off',desc:'Attune your first crew file tier.',pts:1,test:()=>filesAttuned()>=1},
  {id:'cross',name:'Cross-trained',desc:'Attune at least one tier in 4 different crew files.',pts:2,test:()=>FILES.filter(f=>fileTier(f.id)>0).length>=4},
  {id:'spec',name:'Specialist',desc:'Fully attune a crew file.',pts:2,test:()=>FILES.some(f=>fileTier(f.id)>=f.tiers.length)},
  {id:'career',name:'Career track',desc:'Have 20 clearance invested in crew files.',pts:3,test:()=>filesInvested()>=20}];
const AP_TRADES=[{label:'1 clearance',cost:2,act:()=>{player.clear++;return '+1 clearance';}},
  {label:'a random tonic',cost:4,act:()=>{const ks=Object.keys(SUBS);gainTonic(ks[rnd(ks.length)]);return 'a tonic';}},
  {label:'an unfound crew file',cost:6,ok:()=>!!FILES.find(f=>!hasFile(f.id)&&f.kind!=='classified'),act:()=>{const L=FILES.filter(f=>!hasFile(f.id)&&f.kind!=='classified');gainFile(L[rnd(L.length)].id);return 'a crew file';}}];
