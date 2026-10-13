// Armed humans (v1.04, batch 4 request 21). Code: src/game/44-loadouts.js. A kit is rolled in mkEnemy() (so inside the
// deck's seeded scope at generation) for security guards, riot guards and some husks.
// LOADOUTS[type]: chance (of carrying anything; 1 = always) and bands by depth, each {from, kits:[[weight, kit]]}; the
// last band whose from <= depth is used. A kit: main (an ARM id: a gun from WPN or a melee armament), armor (a GEAR body
// piece: vest or platerig), head (filtermask = gas mask), quick (one QUICK item the AI can use: medkit, smokenade,
// flare), launcher (the riot guard's tear canister launcher, which is not a player armament).
// Names that differ from the request: the "wrench" is the crowbar; the "canister launcher" is the riot guard's own lob.
const LOADOUTS={
  guard:{chance:1,bands:[
    {from:1,kits:[[6,{main:'pistol'}],[3,{main:'pistol',armor:'vest'}]]},
    {from:5,kits:[[3,{main:'pistol',armor:'vest'}],[3,{main:'smg',armor:'vest'}],[2,{main:'pistol',armor:'vest',quick:'medkit'}],[2,{main:'smg',armor:'vest',quick:'medkit'}],[1,{main:'pistol',quick:'flare'}]]},
    {from:9,kits:[[3,{main:'smg',armor:'vest',quick:'medkit'}],[2,{main:'nailer',armor:'vest',quick:'medkit'}],[2,{main:'smg',armor:'vest',quick:'smokenade'}],[1,{main:'nailer',armor:'vest',quick:'smokenade'}],[1,{main:'smg',armor:'vest',quick:'flare'}]]}]},
  riotguard:{chance:1,bands:[
    {from:1,kits:[[1,{main:'crowbar',armor:'platerig',head:'filtermask',launcher:true}]]},
    {from:9,kits:[[3,{main:'smg',armor:'platerig',head:'filtermask',launcher:true,quick:'smokenade'}],[1,{main:'crowbar',armor:'platerig',head:'filtermask',launcher:true,quick:'smokenade'}]]}]},
  husk:{chance:0.25,bands:[
    {from:1,kits:[[3,{main:'crowbar'}],[3,{main:'cutter'}],[2,{main:'bat'}]]},
    {from:5,kits:[[3,{main:'crowbar'}],[3,{main:'cutter'}],[2,{main:'nailer'}]]},
    {from:9,kits:[[4,{main:'crowbar'}],[1,{main:'chainsaw'}],[3,{main:'nailer'}]]}]}
};
// gunDps: a creature gun's damage per second while firing if every shot landed (the old guard landed about 4.75 a
// second on a standing target), x gunDpsMul per weapon;
// cdMul: a creature fires at the weapon's own rate x this; spreadMul / spreadAdd: creature aim is looser than yours;
// speedMul: bullet speed x this (slow enough to dodge, like the old guard's 170 px/s); reserve: spare magazines [min,max];
// reloadMul: the weapon's reload time x this, in plain view; whip: pistol-whip or fists once out of ammo {dmg, cd, reach}.
// melee: a held melee weapon's hit = its ARM dmg x dmgMul, every cd x cdMul seconds, reach + range x reachMul (husks
// bare-handed hit 12 every 0.9 s). drMul: armour gear's damage reduction x this on a creature; armorGlance: added glance
// chance; armorSpd: move speed x this. maskNerve: nerve gas x this for a masked creature.
// medkit: used once below medAt of max health, after backing off for medBack seconds, heals medHeal of max health.
// smoke: thrown when below smokeAt of max health while it sees you within smokeRange px. flare: lit on a dark deck
// while it hunts you without seeing you. dropP: chance each other kit piece drops (the weapon always does);
// genericDrop: the old supply drop chance for an armed human is x this, since the kit now drops.
const LOADOUT_CFG={gunDps:5.5,gunDpsMul:{pistol:0.95,smg:2.6,nailer:1.8,scatter:1},cdMul:{pistol:3.6,smg:2.2,nailer:2.4,scatter:2},
  spreadMul:1,spreadAdd:0.02,speedMul:0.4,minSpeed:160,reserve:[1,2],reloadMul:1.2,whip:{dmg:4,cd:1.1,reach:4},
  melee:{dmgMul:4.5,cdMul:2.6,reachMul:0.35},drMul:0.6,armorGlance:{vest:0.04,platerig:0.08},armorSpd:{vest:0.95,platerig:0.88},maskNerve:0.5,
  medAt:0.35,medBack:1.2,medHeal:0.5,smokeAt:0.5,smokeRange:150,dropP:{armor:0.4,head:0.5,quick:1},genericDrop:0.3};
const LOADOUT_DESC='Station security, riot guards and about a quarter of the husks carry real equipment from the same tables as yours. What they hold is how they fight: a sidearm fires deliberate shots, an SMG sprays, a nailer rattles, a crowbar or bat hits harder and slower than bare hands, a box cutter quicker and lighter. Gun-armed humans carry a magazine and a spare or two: when the magazine runs dry they stop and reload in plain view (a "reloading" callout, the gun lowered), which is your moment to push in, and with nothing left they close in to pistol-whip you. A work vest or plate rig takes some damage off and makes your hits glance more, but slows them; a gas mask makes them immune to tear gas and halves nerve gas. Some carry a medkit (used once when badly hurt, after backing off), a smoke grenade (thrown to break your line of sight when they are losing) or a flare (lit on a dark deck while they hunt you). When they go down they drop their weapon, with whatever is left in the magazine, and often the rest of their kit. Hold V on one to see what it carries.';
// Test range creature console: the Kit row's choices for guards, riot guards and husks (auto rolls a kit as on a deck).
const KIT_PRESETS=[['auto',null],['none',{}],['sidearm',{main:'pistol'}],['smg',{main:'smg'}],['nailer',{main:'nailer'}],['crowbar',{main:'crowbar'}],['bat',{main:'bat'}],['box cutter',{main:'cutter'}],['chainsaw',{main:'chainsaw'}],
  ['smg, vest, medkit',{main:'smg',armor:'vest',quick:'medkit'}],['smg, vest, smoke',{main:'smg',armor:'vest',quick:'smokenade'}],['sidearm, flare',{main:'pistol',quick:'flare'}],['crowbar, plate, mask',{main:'crowbar',armor:'platerig',head:'filtermask'}]];
