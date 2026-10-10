// Progress: deck grades, run stats, work orders (ACH), point trades, challenge modifiers.
const GRADES=[['S',0.8,'#ffd070'],['A',0.6,'#9fe0b0'],['B',0.4,'#8fc3d9'],['C',0.2,'#c9cfc2'],['D',0,'#b8665a']];
const MODS_RUN=[{id:'glass',name:'Glass cannon',desc:'Half max health, but everything you do hits 40% harder.',unlock:'Complete the Sharpshooter work order.',ok:()=>META.ach.crits},
  {id:'dark',name:'Lights out',desc:'Every deck is dark.',unlock:'Complete the Ghost of the deck work order.',ok:()=>META.ach.quiet},
  {id:'hunted',name:'Hunted',desc:'A hunter stalks you from the very first sector.',unlock:'Kill a sector hunter.',ok:()=>META.hunters>0},
  {id:'lean',name:'Lean times',desc:'Far fewer supplies lying around.',unlock:'Complete the Deep diver work order.',ok:()=>META.ach.deep},
  {id:'swarm',name:'Swarming',desc:'Each deck holds about a third more creatures.',unlock:'Complete the Exterminator work order.',ok:()=>META.ach.exterm}];
const LVLSTAT=['kills','hacks','items','chests','rare','doors','secrets','dmg'];
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
  {id:'arcade',name:'Arcade regular',desc:'Win 3 arcade games.',pts:1,test:()=>(player.rs.arcade||0)>=3},
  {id:'vaults',name:'Vault breaker',desc:'Open a vault in 3 different sectors in one run.',pts:4,test:()=>new Set(player.vaultSecs||[]).size>=3},
  {id:'attune1',name:'Signed off',desc:'Attune your first crew file tier.',pts:1,test:()=>filesAttuned()>=1},
  {id:'cross',name:'Cross-trained',desc:'Attune at least one tier in 4 different crew files.',pts:2,test:()=>FILES.filter(f=>fileTier(f.id)>0).length>=4},
  {id:'spec',name:'Specialist',desc:'Fully attune a crew file.',pts:2,test:()=>FILES.some(f=>fileTier(f.id)>=f.tiers.length)},
  {id:'career',name:'Career track',desc:'Have 20 clearance invested in crew files.',pts:3,test:()=>filesInvested()>=20}];
const AP_TRADES=[{label:'1 clearance',cost:2,act:()=>{player.clear++;return '+1 clearance';}},
  {label:'a random tonic',cost:4,act:()=>{const ks=Object.keys(SUBS);gainTonic(ks[rnd(ks.length)]);return 'a tonic';}},
  {label:'an unfound crew file',cost:6,ok:()=>!!FILES.find(f=>!hasFile(f.id)&&f.kind!=='classified'),act:()=>{const L=FILES.filter(f=>!hasFile(f.id)&&f.kind!=='classified');gainFile(L[rnd(L.length)].id);return 'a crew file';}}];
