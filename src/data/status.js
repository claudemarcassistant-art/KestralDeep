// Frozen status (player and creatures), the cryo grenade, and active reloads.
// cold meter: player.st.frz and e.frz (0-100). At 100 you (or a creature) freeze solid.
const FREEZE_CFG={
  player:{dur:1.5,       // seconds frozen
    after:60,            // cold meter left when the ice breaks
    imm:3,               // seconds before you can freeze again
    melee:1.6,           // melee damage taken while frozen
    mash:0.1,mashMax:0.4,// each new movement key press cracks 0.1 s off, up to 0.4 s
    fireCut:0.4},        // the first fire hit while frozen cracks 0.4 s off; being ablaze (burn 100) ends it at once
  creature:{dur:2,boss:1,imm:3,bossImm:8,decay:10,melee:1.6,wallMul:2,after:60},
  // cold added to creatures by each source
  chill:{riser:20,vent:20,freeze:40,breath:45},
  cryo:{t:3,player:25,creature:55,iceEvery:0.75,iceR:34}};
const ACTIVE_RELOAD={
  from:0.40,to:0.75,     // where the marker can start, as a share of the bar
  w:0.12,dexW:0.01,maxW:0.20, // marker width; Dexterity adds 1% of the bar per point
  fumble:1.5,            // a mistimed press makes the remaining time 50% longer
  flash:0.35};
