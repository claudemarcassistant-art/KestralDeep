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

// Smoke blinds creatures harder than it blinds you (v0.93): a creature cannot see you when the line between you
// passes through the core of a smoke cloud (within core x its radius) at least dens thick, unless it is within near px.
// While it cannot see you for smoke, a hunting creature forgets you memMul times faster.
const SMOKE_BLIND={dens:0.3,tearDens:0.35,core:0.8,near:16,memMul:3};

// Player stun (v0.94): every non-quiet hit adds perHit plus perDmg x damage; the meter drains decay per second.
// About 10 hits of any size inside ~2-3 s fill it (1-damage hits: 10 x 13 = 130 against ~30 drained).
// An explosion within blastNear x its radius stuns outright (blastFull, before resistances); further out it adds blast.
const STUN_CFG={perHit:11,perDmg:2,decay:12,blast:25,blastNear:0.35,blastFull:250};

// Glancing hits (v0.99, batch 3 request 17): the opposite of a crit, decided in the same roll so the two never stack.
// A glance does mul x damage, kbMul x knockback and no stun build-up. Player attacks: base chance, minus per Dexterity
// and Perception point, never below min; armoured targets (ET flagged armor, or listed in armoured, plus every warden
// and boss) add armoured. Perfect charged releases and ambushes never glance. Creature hits on you: base, plus armorPer
// per point of current armour (up to armorMax), plus shield while blocking with a riot shield; half damage, stunMul of
// the usual stun, and no combo break.
const GLANCE_CFG={mul:0.5,kbMul:0.3,base:0.08,dex:0.01,perc:0.005,min:0.02,armoured:0.08,armouredTypes:['brute','snail','guard','riotguard','warden'],
  vsPlayer:{base:0.05,armorPer:0.002,armorMax:0.10,shield:0.10,stunMul:0.5}};
// Tear gas and nerve gas (v1.02, batch 3 request 18). Code: src/game/42-gas.js. k below is how deep in a cloud you
// stand (0-1, its density at that point). maskMul: a filter mask (poisonRes from gear, 0.5 or more) halves both gases.
// tear: shroud (vision, like smoke's 0.75), irr per second at k=1 (the "irritated" meter, 0-100), irrDecay per second
// out of the cloud (100 fades in about 6 s), aim (+60% spread at a full meter), stam (stamina recovery x0.5 at full),
// cough: chance per second at a full meter (from coughMin), coughT seconds without sprinting; fade: density lost per
// second once unfed (poison clouds 0.2); creatures: back away at flee x speed, bullets jitter by jit radians while
// tearT (linger seconds after leaving) lasts. nerve: dps at k=1 (quiet hazard ticks), szr per second at k=1 toward
// a stun of stun seconds at 100, szrDecay out of the cloud, air drain like smoke; fade 0.1 (twice as long as poison);
// killMul: damage x for plants and slime creatures. nade: emitter seconds, rate and rmax for the two grenades;
// riot: the riot guard's lob (range px, cooldown s) and the riot drone's drop.
const GAS_CFG={maskMul:0.5,
  tear:{shroud:0.75,irr:45,irrDecay:17,aim:0.6,stam:0.5,cough:0.6,coughMin:35,coughT:0.6,fade:0.2,rmax:44,flee:1.1,linger:1.5,jit:0.35},
  nerve:{dps:3,szr:32,szrDecay:20,stun:1.5,shroud:0.35,fade:0.1,rmax:40,killMul:6},
  nade:{tear:{t:5,rate:26,rmax:46},nerve:{t:4,rate:22,rmax:40},nerveMax:2},
  riot:{lobMin:60,lobMax:140,lobCd:12,lobSpeed:150,dropRange:130,dropCd:15,hang:80},
  ampoule:{lab:0.35,archive:0.5,locker:0.6}};
const GAS_DESC={tear:'Pale yellow-white riot gas. Inside it you can barely see, your eyes stream and you get irritated: your aim spreads up to 60% wider, stamina comes back at half speed, and coughing fits stop you sprinting. It fades about 6 seconds after you get out. It does no damage and uses no air. Creatures cannot see you through it, and anything without a mask backs out of it and shoots wild. A filter mask halves it. Riot guards and riot drones lob it; you can throw it too.',
  nerve:'Dark violet nerve agent that hangs low and lingers about twice as long as poison. Inside it you take steady damage (about 3 a second at its thickest), your air runs down like in smoke, and a seizing meter builds until your muscles lock for a second and a half. It hits every creature the same way, except drones and ghosts, and kills plants and slime creatures fast. A filter mask halves it but does not make you safe. Nothing on the station uses it on you; the only source is a nerve agent ampoule.'};
