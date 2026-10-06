// Food: food values, raw ingredients, cooking recipes.
const FOOD={
  ginsu:{name:'Ginsu bean',sat:5,lv:1,col:'#5ac8ff',desc:'A glowing blue bean. Mends every injury you carry.',buff:{}},
  mushroom:{name:'Cave mushroom',sat:10,lv:1,col:'#c8a0a0',desc:'Poison builds 20% slower.',buff:{poisonRes:0.2}},
  fruit:{name:'Deck fruit',sat:12,lv:1,col:'#e0a030',desc:'+5% move speed.',buff:{spd:0.05}},
  nuts:{name:'Pale nuts',sat:15,lv:2,col:'#a07040',desc:'+10% max stamina.',buff:{stamina:0.1}},
  ration:{name:'Ration bar',sat:20,lv:1,col:'#c8a060',desc:'+15% max stamina.',buff:{stamina:0.15}},
  beans:{name:'Tinned beans',sat:30,lv:2,col:'#b86a3a',desc:'+8% move speed.',buff:{spd:0.08}},
  paste:{name:'Protein paste',sat:25,lv:2,col:'#d8d0b0',desc:'Shoves hit 1 harder.',buff:{meleeDmg:1}},
  coffee:{name:'Coffee pouch',sat:10,lv:1,col:'#6a4a2a',desc:'Snappier acceleration.',buff:{accel:0.3}},
  greens:{name:'Hydroponic greens',sat:15,lv:2,col:'#6ab04a',desc:'Poison builds 30% slower.',buff:{poisonRes:0.3}},
  candy:{name:'Candy brick',sat:10,lv:1,col:'#e06a9a',desc:'Fire 6% faster.',buff:{rof:0.06}},
  water:{name:'Water',sat:4,lv:1,col:'#6fb3c3',desc:'Stamina recovers a little faster.',buff:{stamina:0.05}},
  meat:{name:'Mystery meat',sat:35,lv:2,col:'#a0404a',desc:'Takes 6% off every hit. Best not to ask.',buff:{dr:0.06}},
  flatbread:{name:'Flatbread',sat:18,lv:1,col:'#d8b878',desc:'+10% max stamina.',buff:{stamina:0.1}},
  stew:{name:'Tuber stew',sat:30,lv:2,col:'#a8804a',desc:'+20% max stamina.',buff:{stamina:0.2}},
  skewer:{name:'Grub skewer',sat:20,lv:1,col:'#c0a068',desc:'Shoves hit 1 harder.',buff:{meleeDmg:1}},
  jam:{name:'Stingberry jam',sat:15,lv:2,col:'#c04a7a',desc:'Fire 8% faster.',buff:{rof:0.08}},
  broth:{name:'Freezer broth',sat:25,lv:2,col:'#c8b090',desc:'Takes 5% off every hit.',buff:{dr:0.05}},
  fishcake:{name:'Brine fishcake',sat:25,lv:2,col:'#a0b0a0',desc:'+8% move speed.',buff:{spd:0.08}},
  sporefry:{name:'Spore fry',sat:15,lv:1,col:'#b0907a',desc:'Much snappier acceleration.',buff:{accel:0.35}}
};
const RAW={glowcap:{name:'Glowcap fungus',col:'#5ac8ff',where:'overgrown decks, very rarely'},flour:{name:'Ration flour',col:'#e8e0c8',where:'lockers, break rooms, freezers'},syrup:{name:'Sweet syrup',col:'#d88a3a',where:'vending stock, break rooms'},
  tuber:{name:'Pale tuber',col:'#c8b89a',where:'overgrown decks'},spores:{name:'Cave spores',col:'#b0a0c0',where:'overgrown decks. puff poison when picked'},
  berries:{name:'Stingberries',col:'#c02a5a',where:'overgrown decks, next to stingblooms'},grubs:{name:'Wall grubs',col:'#d8c890',where:'overgrown decks, slugs'},
  fillet:{name:'Brine fillet',col:'#9ab0b8',where:'snakes, lurkers and graspers'},frozen:{name:'Frozen stock',col:'#b8d8e8',where:'freezers, mostly in the Cold Store'}};
const COOK=[
  {out:'ginsu',need:{glowcap:2}},
  {out:'flatbread',need:{flour:1},water:1},{out:'stew',need:{tuber:2},water:1},{out:'skewer',need:{grubs:2}},{out:'jam',need:{berries:2,syrup:1}},
  {out:'broth',need:{frozen:1},water:1},{out:'fishcake',need:{fillet:1,flour:1}},{out:'sporefry',need:{spores:2}},
  {out:'ration',need:{flour:1,syrup:1}},{out:'candy',need:{syrup:2}},{out:'paste',need:{grubs:1,fillet:1}}];
