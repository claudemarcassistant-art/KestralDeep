// Herbs and herbalism: wild herbs (stored in player.herbs, shown in the Food tab) and the preparations made from them
// in the Food tab's Herbalism view. Poultices and incense are quick items (player.inv); draughts are drunk like food
// (FOOD entries with draught:true) and give timed buffs (player.tbuffs) instead of per-deck food buffs.
const HERBS={
  redroot:{name:'Redroot',col:'#c8402e',look:'red stalks',desc:'Red stalks with a bitter sap. The base of most healing preparations.'},
  bitterwort:{name:'Bitterwort',col:'#8aa878',look:'grey-green leaves',desc:'Grey-green leaves that draw out poison and sickness.'},
  emberleaf:{name:'Emberleaf',col:'#e88a2a',look:'orange curled leaf',desc:'A curled orange leaf that stays warm to the touch. Keeps the cold out.'},
  greysage:{name:'Grey sage',col:'#c0c8c4',look:'silver-grey sprig',desc:'A silver-grey sprig. Its smoke steadies the nerves and quiets the deck.'},
  ironmoss:{name:'Ironmoss',col:'#3a6a32',look:'dark green moss',desc:'Dense dark moss that toughens the body.'}};
const HERB_WHERE='Overgrown decks (near walls and blooms), greenhouses, now and then in lockers, from the galley cook and at camp landings.';
// which herbs turn up, by weight
const HERB_WEIGHTS=[['redroot',3],['bitterwort',3],['ironmoss',2],['greysage',2],['emberleaf',2]];
const HERB_CFG={
  overgrown:[4,8],     // herb tufts on an overgrown Medium deck (scaled by deck area)
  greenhouse:[2,4],    // per greenhouse module
  nearBloom:0.5,       // share of overgrown tufts placed beside a bloom (the rest against a wall)
  locker:0.6,          // weight of a herb in a locker's loot roll
  camp:0.5,            // chance of a herb at a camp landing
  incense:{t:30,sageR:48,sageRegen:1,emberR:24,emberDry:12,emberThaw:60}};
// preparations. kind: poultice and incense go to player.inv as quick items; draught goes to player.food
const HERBAL=[
  {id:'p_redroot',kind:'poultice',name:'Redroot poultice',need:{redroot:2},cloth:1,col:'#c8402e',heal:35,over:5,desc:'Press it on: heals 35 over 5 seconds and puts out burning.'},
  {id:'p_bitter',kind:'poultice',name:'Bitterwort poultice',need:{bitterwort:2},cloth:1,col:'#8aa878',desc:'Clears poison and radiation sickness, then poison builds 40% slower for 60 seconds.'},
  {id:'p_mend',kind:'poultice',name:'Mending poultice',need:{redroot:1,bitterwort:1,ironmoss:1},cloth:1,col:'#d89a7a',heal:50,over:6,desc:'Heals 50 over 6 seconds, clears poison and burning, and your newest injury heals a deck sooner.'},
  {id:'i_sage',kind:'incense',name:'Grey sage incense',need:{greysage:2},col:'#c0c8c4',desc:'Set it down to burn for 30 seconds. Within about 48 px you regain 1 health a second, and disturbance does not build anywhere on the deck while it burns.'},
  {id:'i_ember',kind:'incense',name:'Emberleaf incense',need:{emberleaf:2},col:'#e88a2a',desc:'Set it down to burn for 30 seconds. A warm patch about 48 px across: nothing in it can freeze, frozen things thaw, and you slowly dry off.'},
  {id:'d_iron',kind:'draught',name:'Ironmoss draught',need:{ironmoss:2},water:1},
  {id:'d_ember',kind:'draught',name:'Emberleaf draught',need:{emberleaf:2},water:1},
  {id:'d_sage',kind:'draught',name:'Grey sage draught',need:{greysage:2},water:1},
  {id:'d_rest',kind:'draught',name:'Restorative draught',need:{redroot:1,ironmoss:1,greysage:1},water:1}];
// draughts are FOOD entries (see food.js); their effect is a timed buff: secs and tbuff (added to stats while it lasts)
const DRAUGHTS={
  d_iron:{name:'Ironmoss draught',sat:8,lv:0,col:'#3a6a32',draught:true,secs:60,tbuff:{dr:0.2},desc:'20% less damage taken for 60 seconds.',buff:{}},
  d_ember:{name:'Emberleaf draught',sat:8,lv:0,col:'#e88a2a',draught:true,secs:90,tbuff:{coldImm:1},desc:'Immune to cold and freezing for 90 seconds.',buff:{}},
  d_sage:{name:'Grey sage draught',sat:8,lv:0,col:'#c0c8c4',draught:true,secs:60,tbuff:{stunRes:0.5,steady:0.3},desc:'50% stun resistance and steadier aim for 60 seconds.',buff:{}},
  d_rest:{name:'Restorative draught',sat:10,lv:0,col:'#d89a7a',draught:true,secs:120,heal:25,tbuff:{stamRegen:0.15},desc:'Heals 25 at once, and stamina recovers 15% faster for 120 seconds.',buff:{}}};
