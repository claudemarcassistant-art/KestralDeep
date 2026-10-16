// Art pass (Batch 5, from docs/art/sprite-study.html). Drawing helpers live in src/game/47-sprites.js.
// PEOPLE: one config per person drawn with person(): suit (main), hi (lit side), dark (rim), boot, head/headHi (helmet
// or hair), skin (hands, face), and optional parts: pack/packHi (back pack), lamp (helmet lamp pixel, faces the aim),
// cap, belt, strap, pads, accent, tails, visor, hat (a HATS id), eye. Take a (survey tech) is the player; b and c stay
// on file for future starter archetypes or crew (owner's decision, Batch 5).
const PEOPLE={
  a:{name:'Survey tech',suit:'#b2702e',hi:'#e3a456',dark:'#4a2a12',boot:'#231d18',pack:'#46504c',packHi:'#6e7a74',head:'#d6d3c7',headHi:'#ffffff',lamp:true,skin:'#c49a78'},
  b:{name:'Scavenger',suit:'#5c6048',hi:'#8a8b62',dark:'#22241a',boot:'#1c1a16',tails:'#46493a',head:'#34342c',headHi:'#55554a',accent:'#a8452e',strap:'#3a2a1c',skin:'#b48a6a'},
  c:{name:'Hardsuit',suit:'#6c777d',hi:'#a8b5bb',dark:'#262d31',boot:'#1e2224',pads:'#87939a',head:'#47525a',headHi:'#7a8a94',visor:'#6fd0c0'},
  guard:{suit:'#2c4264',hi:'#557aae',dark:'#121a28',boot:'#14161a',head:'#1c2636',headHi:'#3a4a62',cap:'#1a2230',skin:'#b08a6c',belt:'#0e1218'},
  // riot guards: the guard's body in darker armour with shoulder plates and a gas mask (Batch 5 session 3)
  riot:{suit:'#262e3c',hi:'#44506a',dark:'#0e1218',boot:'#121416',pads:'#3a4458',head:'#1a1e26',headHi:'#363e4c',skin:'#2a2e34',belt:'#0a0c10',hat:'gasmask'}
};
// crew (the npc fixtures), from the study's CREW: each faces down with its props and idle activity (49-crew-art.js).
// gambler is the sensitive (the psychic fixture: gambler stops, and now and then a room).
const CREW_CFG={
  scrapper:{suit:'#6a5a3a',hi:'#9a8458',dark:'#2a2216',boot:'#1e1a14',head:'#5a4a36',headHi:'#7a6a50',hood:'#4a3c2a',skin:'#c8a888',hat:'hood'},
  quarter:{suit:'#3a4a3a',hi:'#5e725e',dark:'#161e16',boot:'#1a1c18',head:'#3a2e24',headHi:'#5a4a3a',skin:'#b89878',hat:'cap'},
  cook:{suit:'#d8d0c0',hi:'#f4f0e6',dark:'#5e5a52',boot:'#22201c',head:'#5a3a2a',headHi:'#7a5a44',skin:'#c8a080',hat:'chef'},
  subject:{suit:'#e2e2e4',hi:'#ffffff',dark:'#6a6a72',boot:'#b8a8b0',head:'#d0c0d0',headHi:'#f0e4f0',skin:'#d0c0d0'},
  bomber:{suit:'#4a5a3a',hi:'#6e8256',dark:'#1e2618',boot:'#1a1c16',head:'#3a4a30',headHi:'#5a6a48',hat:'visor',pads:'#5e704c'},
  locksmith:{suit:'#5a4a6a',hi:'#8a76a0',dark:'#22192c',boot:'#1c1820',tails:'#46385a',head:'#3a2a22',headHi:'#5a4232',skin:'#c0a080'},
  android:{suit:'#8a969e',hi:'#c8d0d8',dark:'#2e3438',boot:'#3a4246',pads:'#a6b0b6',head:'#8a969e',headHi:'#d8e0e6',eye:true},
  pilot:{suit:'#7a4a2a',hi:'#a8683a',dark:'#2e1a0e',boot:'#1e1610',head:'#7a4a2a',headHi:'#c08a5a',skin:'#c09070',hat:'pilot'},
  detective:{suit:'#3a3a4a',hi:'#5e5e74',dark:'#16161e',boot:'#141418',tails:'#2e2e3c',head:'#2a2a32',headHi:'#4a4a5a',hat:'fedora'},
  gambler:{suit:'#3a2a52',hi:'#5e4880',dark:'#140e1e',boot:'#2a1e3a',head:'#2a1e3a',headHi:'#4a3a62',hood:'#2e2244',hat:'hood'}
};
// the player's tints on top of PEOPLE.a: hurt flash, adrenaline, night optics on the head
const PLAYER_TINT={hurt:{suit:'#d08070',hi:'#f0b0a0'},adren:{suit:'#a89a5a',hi:'#d8c880'},nvg:{head:'#4a6a4a',headHi:'#7a9a7a',lampCol:'#7fff8a'}};
// light direction on lit decks: overhead from the top left (radians); on dark decks sprites face the player's lamp
const ART_LIGHT={lit:-2.356,selfDark:-1.2};
// ART_PAL: each creature's four tones, darkest to lightest (paint() picks a tone per dab from its light side). The
// study's ramps (husk, crawler, spitter, brute, frog, wasp, slug, spider) are kept as they are; the rest follow the
// same rules from each creature's own colour. Types without a ramp get one made from ET col (artRamp()). FLASH is
// the hit flash: the body is drawn in pale tones.
const ART_PAL={
  husk:['#262a22','#474e3e','#6a745a','#8f9b78'],huskH:['#33342b','#575b4a','#80846a','#aaa98a'],
  crawler:['#341a10','#74361b','#ad5d2b','#e09050'],
  spitter:['#12213a','#284670','#4c79ae','#9cc0ec'],
  brute:['#260d14','#561c28','#873844','#bf6868'],bruteH:['#1e0a10','#3e141e','#62242f','#8a4048'],
  frog:['#11260e','#2b5520','#4c8632','#86bd5d'],
  wasp:['#2a1a06','#8a6010','#d4a42e','#f6de6e'],waspT:['#1e1406','#5a400c','#9a7418','#c8a034'],
  slug:['#36360f','#727227','#acac4c','#e6e68c'],toxslug:['#1e300c','#3e6a18','#68a02c','#a8d860'],
  snail:['#2e2818','#605438','#9a8a62','#cec09a'],shell:['#1e160c','#4a3a22','#7a6440','#b0966a'],
  spider:['#100d16','#251f31','#3f3552','#6e6086'],
  snake:['#0e2420','#22504a','#3e8478','#78c0b0'],arcsnake:['#121c3a','#2a3e7a','#4a6ab8','#90b0f0'],
  charger:['#20160c','#4a3622','#7a5a3a','#b08a62'],chargerH:['#140e08','#33251a','#55402c','#7a5c40'],
  lurker:['#081a20','#163a46','#2a6474','#5aa0b0'],grasper:['#1c0e22','#3e2248','#6a4078','#a878b8'],
  plant:['#0e1e08','#22401a','#3e6a2a','#70a050'],pod:['#1e0e24','#44204e','#74408a','#b078c0'],
  drone:['#16191a','#383e42','#626c70','#a0aaae'],riotdrone:['#121416','#2c3236','#4c5458','#7c868c'],
  FLASH:['#bdb8ac','#d8d4c8','#ece8dc','#ffffff']
};
// dab counts: kept low enough that a busy Large deck holds 60 fps (Batch 5 session 2); cut these first if it slows
const ART_DABS={husk:48,huskH:14,crawler:34,spitter:56,brute:90,bruteH:14,frog:50,wasp:26,waspT:12,slug:44,spider:34,spiderH:14,snakeH:16,charger:60,chargerH:16,lurker:40,grasper:56,plant:30,pod:20,drone:16,shell:22,warden:110,generic:40};
// item categories (Batch 5 session 4): the soft pool under every item on the floor and its outline colour.
// rgb is for the pool, ol for the optional outline. ITEM_CAT_OF maps an item type to its category (gear otherwise).
const ITEM_CAT={ammo:{rgb:'217,164,65',ol:'#d9a441',name:'ammo'},material:{rgb:'143,182,208',ol:'#8fb6d0',name:'materials'},
  medical:{rgb:'127,208,142',ol:'#7fd08e',name:'medical'},food:{rgb:'224,160,112',ol:'#e0a070',name:'food'},
  key:{rgb:'201,168,255',ol:'#c9a8ff',name:'keys and data'},gear:{rgb:'227,230,220',ol:'#e3e6dc',name:'weapons and gear'}};
const ITEM_CAT_OF={rounds:'ammo',shells:'ammo',nails:'ammo',bolts:'ammo',knives:'ammo',cells:'ammo',
  scrap:'material',pipe:'material',battery:'material',cloth:'material',powder:'material',chip:'material',
  medkit:'medical',herb:'medical',medpatch:'medical',trauma:'medical',regen:'medical',surgery:'medical',stim:'medical',antitox:'medical',emetic:'medical',tuft:'medical',tonic:'medical',
  food:'food',raw:'food',
  key:'key',liftcard:'key',file:'key',clearpack:'key',routechart:'key',schematic:'key',secretmap:'key',sigil:'key'};
// outline colours (the optional Sprite outlines): a brightened version of each sprite's main colour, from the study's
// OLC. Creatures without an entry use their ET colour brightened (olColOf() in 51-outlines.js).
const ART_OLC={player:'#f2b464',husk:'#b4c296',crawler:'#f0a060',spitter:'#a8ccf4',brute:'#e08484',frog:'#a0dc74',wasp:'#f8e278',ghost:'#d0f4ff',slug:'#ecec96',spider:'#b49ad8',
  guard:'#84aae0',riotguard:'#7a8ab0',
  scrapper:'#c8a870',quarter:'#88a888',cook:'#f4f0e6',subject:'#f0e8f4',bomber:'#98b078',locksmith:'#b49ad0',android:'#d0dae0',pilot:'#e0a060',detective:'#9a9ab8',gambler:'#a48ad0',
  barrel:'#e07a4a',crate:'#c8a070',chest:'#e0b060',rare:'#c9a8ff',locker:'#a8b8c4',panel:'#7fe8d0',vend:'#ff8a9a',lever:'#ff7a60',breaker:'#e8c040',toolbench:'#c89a60',grinder:'#e08a40',
  medstation:'#ff8080',freezer:'#c8e4f4',dispenser:'#e0c56a',arcade:'#7af0ff',camera:'#7ad0b0',hatch:'#d9a441',fan:'#b8c4ca'};
// Codex Systems entry for the Sprite outlines option
const OUTLINE_DESC='Options > Sprite outlines (off by default) draws a thin line around you, creatures, crew, guards, items and interactables, each in a brighter shade of its own colour; items take the colour of their kind (ammo amber, materials blue, medical green, food orange, keys and data violet, weapons and gear white). Only the outer edge is outlined: shadows, glows and the gaps inside a creature are not. Hidden things stay hidden: undiscovered hatches and trap plates never get an outline, and neither do cloaked figures.';
