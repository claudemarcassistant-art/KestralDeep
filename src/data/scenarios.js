// Sector scenarios (v1.01, batch 3 request 16). One is rolled for each sector after the first (the first is always
// normal), inside the sector's seeded scope, and saved with the route (route.scen). Code: src/game/41-scenarios.js.
// Every field is optional; a missing field means "as normal".
//   weight: odds of being rolled from the second sector on. score: multiplier on the sector's deck scores.
//   junc: junction type weights x (station, flooded, cache, rest, merchant, event). light/haz/obj: deck condition
//   weights x. size: DECK_SIZE_ODDS.normal weights x. haunt/lowg/waves: chance x for those deck events.
//   types: pickType() weights x; typesAdd: added to pickType() weights (from addFrom depth). threat: threat budget x
//   (at most 1.1: scenarios change what appears, not how much). guardFrom: depth from which guards can be rolled and
//   capped (normal 4); guardDeck: chance a deck from guardFrom gets at least one guard (swapped for a cheap creature,
//   so the count stays the same); guardCap: extra guards allowed per deck.
//   mods: room module weights x (normal: every module 1). modCount: extra chance of one more module.
//   npcs: NPC weights x (normal: every NPC 1); npcChance: chance x a deck has an NPC.
//   rooms: lift landing weights x; events: lift event weights by TEXTEV id (normal 1; a TEXTEV with scen only appears
//   under that scenario).
//   alert: disturbance build-up x. alarmExtra: guards an alarm calls on top. cams: camera settings over CAM_CFG.
//   trips: {chance, mul} trip scanner chance per deck (normal 0.35) and count x.
//   trapW: trap type weights x; toxicVent: toxic vent chance x. mini: arena mini-boss chance (normal 0.5);
//   vaultGuard: chance a vault junction's first danger is the guardian.
//   loot: pickItem() weights added; locker: locker loot weights added; herbs: herb count x; herbW: herb weights x.
//   flood: water added to station decks (genLiquid level). darkRooms: chance of dark rooms (normal 0.45).
//   breaker: chance a deck gets a breaker panel; breakerOff: chance that breaker starts thrown (deck dark).
//   traitW: creature trait weights x (TRAITS); traitWGuard: the same, for guards and riot guards only.
//   coldVent/coldRiser: chance a steam vent / riser blows cold (normal 0.2 / 0.25); freeze: chance per deck that
//   some standing water is frozen over.
const SCENARIOS={
  normal:{name:'Normal operations',weight:34,score:1,col:'#9aa69a',
    desc:'Nothing out of the ordinary, by the station\'s standards.'},
  crackdown:{name:'Security crackdown',weight:14,score:1.3,col:'#6a9ad8',
    desc:'Station security is locked down hard. Guards walk nearly every deck, drones are everywhere, cameras watch most corridors, there are twice the trip scanners, and every alarm calls an extra guard. Disturbance builds 15% faster. Locksmiths and inspectors are about; traders keep away. Lockers hold more ammo and keys.',
    obj:{defend:1.4},types:{drone:2.5,guard:1.5,riotguard:4,riotdrone:4},typesAdd:{guard:0.45},addFrom:2,threat:1.05,guardFrom:2,guardDeck:0.9,guardCap:1,
    npcs:{locksmith:4,detective:4,scrapper:0.25,quarter:0.5},npcChance:1.3,rooms:{merchant:0.3},
    alert:1.15,alarmExtra:1,cams:{minDepth:2,count:[1,2]},trips:{chance:0.85,mul:2},
    locker:{rounds:2.5,shells:1.2,key:2,ampoule:0.4},traitWGuard:{armoured:2.5,keen:2.5},mini:0.65,vaultGuard:0.35},
  outbreak:{name:'Lab outbreak',weight:13,score:1.2,col:'#8ac04a',
    desc:'Something got out of the labs. Overgrowth and toxic spills spread across the decks, with more plants, bloom wasps, duct spiders, slugs and bog frogs. Laboratories, greenhouses and medbays turn up more, and so do poison gas traps and toxic vents. Herbs grow thick. Subject Nine and the KR-7 android are seen more often, and the lifts pass quarantine checkpoints.',
    haz:{overgrowth:6,toxic:4,fire:0.6,molten:0.6},types:{wasp:0.8,spider:1.8,slug:1.8,toxslug:2,frog:1.8,husk:0.6,crawler:0.7},
    mods:{lab:4,greenhouse:4,medbay:3},modCount:0.25,npcs:{subject:5,android:5},trapW:{gas:3},toxicVent:3,
    herbs:1.6,locker:{tuft:1.5},events:{quarantine:3},traitW:{volatile:2.5,venomous:2.5}},
  flooded:{name:'Flooded section',weight:13,score:1.15,col:'#4aa8c8',
    desc:'A main has burst somewhere above. Flooded decks and standing water are far more common, and with them bog frogs, lurkers, graspers and brine snakes. Washrooms and bathhouses turn up more. Low gravity is rarer.',
    junc:{flooded:3.5},haz:{electrical:1.3,fire:0.5},types:{frog:2,snake:2,arcsnake:1.5,husk:0.8},flood:0.18,
    mods:{bathroom:4,bathhouse:4},lowg:0.3},
  blackout:{name:'Blackout',weight:13,score:1.2,col:'#8a7ab8',
    desc:'The station grid is failing. Dark decks and dark rooms are far more common, and many decks have their breaker already thrown. Ghosts and duct spiders like it this way. Flares, glowsticks and lanterns turn up more in the loot.',
    light:{dark:4,lit:0.3},haz:{electrical:1.5},types:{spider:2.2},typesAdd:{ghost:0.35},addFrom:2,haunt:3,
    darkRooms:0.9,breaker:0.8,breakerOff:0.75,loot:{flare:1.5},lightLoot:0.35},
  coldsnap:{name:'Cold snap',weight:13,score:1.15,col:'#a8d0f0',
    desc:'The coolant loops have failed open. Cold vents and cold risers are everywhere, standing water freezes over, and the Frozen status comes up far more. The lift rides turn frosty. Emberleaf grows where the heat leaks.',
    haz:{steam:3,fire:0.5,molten:0.5},coldVent:0.75,coldRiser:0.75,freeze:0.6,herbW:{emberleaf:3},herbs:1.2,events:{frost:3,thaw:3},traitW:{volatile:2}}
};
// the roll order (sector 1 on): every scenario including normal
const SCEN_IDS=Object.keys(SCENARIOS);
const SCEN_DESC='Every sector after the first runs under a scenario, rolled when you ride into it and announced on arrival: normal operations, a security crackdown, a lab outbreak, a flooded section, a blackout or a cold snap. A scenario changes what the station throws at you there (which creatures, hazards, rooms, people, lift events and loot turn up) much more than how much. The dangerous ones multiply every deck score in the sector. The sector map header and Progress > Run stats show the current one; the Codex lists them all.';
