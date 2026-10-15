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
