// Traps: pressure plates, what each one fires, and trap control panels.
// powered traps (flame, dart) stop working while the deck power is cut at a breaker.
const TRAP_TYPES={
  spike:{name:'Spike trap',powered:false,dmg:8,stun:40,stunE:45,
    desc:'A pressure plate that punches spikes up through the floor. 8 damage and a jolt of stun to whatever stands on it. Mechanical: cutting the power does not stop it.'},
  flame:{name:'Flame trap',powered:true,len:3,dur:1.5,burn:15,burnHurt:1,hitEvery:0.3,perFlame:0.12,
    desc:'A plate wired to a nozzle in the wall beside it. For a moment and a half it sprays a three-tile line of fire across the corridor, setting anything it touches burning and lighting any oil. Leaves smoke. Stops when the deck power is cut.'},
  dart:{name:'Dart trap',powered:true,n:3,dmg:3,psn:14,tox:1.5,speed:260,
    desc:'A plate wired to a launcher in the wall. It fires three darts across the plate and the tiles either side: 3 damage each and a little poison. The darts hit creatures too. Stops when the deck power is cut.'},
  debris:{name:'Falling debris',powered:false,delay:0.8,dmg:14,daze:0.8,dazeE:1,rubble:30,
    desc:'A plate that drops part of the ceiling. A shadow grows over a 2 by 2 patch for a moment, then rubble falls: 14 damage and a brief daze. The rubble slows movement like a web and crumbles away after 30 seconds. Mechanical: cutting the power does not stop it.'}};
// weights pick the trap type; a flame or dart trap needs a wall beside its plate, otherwise it becomes a spike or debris trap
const TRAP_WEIGHTS=[['spike',3],['flame',2],['dart',2],['debris',2]];
const TRAP_CFG={
  minDepth:2,          // no traps on depth 1
  perDeck:[2,5],       // plates on a Medium deck, scaled by deck area
  corridorShare:0.75,  // share placed in corridors and doorways rather than rooms
  spacing:4,           // tiles between plates
  click:0.4,           // seconds from stepping on a plate to the trap firing
  rearm:6,             // seconds before a plate can fire again
  weight:1,            // weight that sets a plate off (player and walking creatures are 3)
  wired:0.4,           // share of traps wired to a trap control panel
  panelRange:6,        // tiles from plate to its panel
  glintPerc:3,         // Perception needed to see plates glint
  glintR:30,           // px within which plates glint
  sonarR:200,scanR:160,// px within which a sonar pulse or the signal scanner reveals plates
  rubbleSlow:0.55};    // movement multiplier on rubble
const TRAP_PANEL_DESC='A wall panel wired to nearby pressure plates; a thin dashed line runs from it to each plate once either is spotted. Hacking it locks those plates down. Failing the hack sets them all off at once and adds to the disturbance.';
