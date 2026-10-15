// Art pass (Batch 5, from docs/art/sprite-study.html). Drawing helpers live in src/game/47-sprites.js.
// PEOPLE: one config per person drawn with person(): suit (main), hi (lit side), dark (rim), boot, head/headHi (helmet
// or hair), skin (hands, face), and optional parts: pack/packHi (back pack), lamp (helmet lamp pixel, faces the aim),
// cap, belt, strap, pads, accent, tails, visor, hat (a HATS id), eye. Take a (survey tech) is the player; b and c stay
// on file for future starter archetypes or crew (owner's decision, Batch 5).
const PEOPLE={
  a:{name:'Survey tech',suit:'#b2702e',hi:'#e3a456',dark:'#4a2a12',boot:'#231d18',pack:'#46504c',packHi:'#6e7a74',head:'#d6d3c7',headHi:'#ffffff',lamp:true,skin:'#c49a78'},
  b:{name:'Scavenger',suit:'#5c6048',hi:'#8a8b62',dark:'#22241a',boot:'#1c1a16',tails:'#46493a',head:'#34342c',headHi:'#55554a',accent:'#a8452e',strap:'#3a2a1c',skin:'#b48a6a'},
  c:{name:'Hardsuit',suit:'#6c777d',hi:'#a8b5bb',dark:'#262d31',boot:'#1e2224',pads:'#87939a',head:'#47525a',headHi:'#7a8a94',visor:'#6fd0c0'},
  guard:{suit:'#2c4264',hi:'#557aae',dark:'#121a28',boot:'#14161a',head:'#1c2636',headHi:'#3a4a62',cap:'#1a2230',skin:'#b08a6c',belt:'#0e1218'}
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
