// Sector map extras: express shafts and vault junctions (archive vaults).
const EXPRESS_CFG={
  n:[2,4],             // express shafts per sector map
  cost:1,costExit:2,   // batteries to ride; one that arrives at the exit junction costs more
  maxPerNode:2};
const EXPRESS_DESC='An express shaft runs straight past a junction to the one beyond. Riding it costs batteries (1, or 2 if it drops you at the exit junction), skips the deck in between with its loot and score, and never stops on the way down. The hunter still moves one step, so it gains you ground. Shown on the sector map as a double amber line with a lightning mark, and hidden like any shaft until you stand at one end or find intel.';
const VAULT_CFG={
  perSector:[1,2],     // vault junctions per sector
  secondDanger:0.4,minSecond:2, // chance of a second danger, from sector 3 (index 2)
  minDist:0.35,        // the vault sits at least this share of the deck's width or height away from the arrival lift
  room:[5,4],          // archive vault size in tiles
  hackMul:0.6,         // the vault lock's timing window is this much narrower than an ordinary panel's
  blastR:16,           // an explosion within its radius plus this many px of the door blows it open
  blastAlert:10,       // extra disturbance from blowing the door
  eliteMul:1.4,        // threat budget on an elite garrison deck
  heavy:['brute','guard','charger','grasper'],
  lockdownWave2:12,    // seconds between the two lockdown waves of guards
  unstableT:60,unstableAlert:75,
  score:600,           // deck report bonus for cracking the vault
  stash:['rounds','shells','nails','medkit','scrap','scrap']};
const VAULT_DANGERS={
  guarded:{name:'guarded',desc:'A mini-boss waits in front of the vault. Its lock panel stays dead until the guardian is killed, though a blast still opens the door.'},
  elite:{name:'elite garrison',desc:'The deck is heavily held: 40% more creatures than usual, with at least one heavy among them.'},
  lockdown:{name:'lockdown',desc:'Opening the vault trips a lockdown: the klaxon sounds and two waves of security guards come for you.'},
  unstable:{name:'unstable',desc:'Opening the vault starts a 60 second countdown before the deck power fails and the lights go out, and the disturbance jumps to 75%.'}};
const VAULT_DESC='One or two junctions in every sector hold an archive vault, marked on the sector map by a faint gold signal from the start, though not how to reach it. They sit off the direct route and are always large decks. The vault is a sealed room behind an armoured door far from the arrival lift. Hack the lock beside the door (a harder hack than usual): fail, and the panel burns out, so only an explosion close to the door will open it. Inside: one or two crew files you have not found (2 clearance each if you have them all), a rare chest, ammo, a medkit and scrap. Every vault deck has a danger, named once you know the junction: guarded, elite garrison, lockdown or unstable. Cracking a vault scores a large bonus.';
// Less backtracking: "deck secured" walk-back and ceiling crawlways
const SECURE_CFG={
  check:0.5,           // seconds between checks
  walkSpeed:70,        // px per second used to work out how long the walk back takes
  key:'KeyG',keyName:'G',
  fade:1.4};
const CRAWL_CFG={
  perDeck:{s:[0,0],m:[0,1],l:[1,2]}, // crawlways per deck, by size (m: 0 or 1, l: 1 or 2)
  minApart:0.34,       // the two hatches at least this share of the deck's width apart
  nearExit:10,         // tiles: on a deck with one crawlway, one hatch sits this close to the exit lift if it can
  speed:30,            // px per second crawling, for the time that passes
  dangerR:120,hurtWindow:4,fade:1.1};
const SECURE_DESC='A deck is secured once you have found the exit lift and nothing hostile that can reach you is left: rooted plants, creatures sealed behind doors and creatures that cannot leave the water do not count. No wave, alarm or arena lock can be pending, and the sector hunter cannot be on the deck. Then the station map (M) offers a walk back to the lift (G): you skip the walk, but the time it would take still passes (food, buffs, statuses), and anything left on the floor stays behind. The offer vanishes the moment the deck stops being secure.';
const CRAWL_DESC='Some medium and large decks have ceiling crawlways: two vent hatches with short ladders, far apart and joined by a crawlspace above the deck. Press R at a hatch and confirm to climb through to the other end; time passes as you crawl. Nothing can follow you, but you cannot climb with an aware creature close by or if you were hurt in the last few seconds. The station map shows hatches once seen, and the line between them once you have seen both.';
