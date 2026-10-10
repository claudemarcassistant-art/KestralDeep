// Creatures: stats, bestiary order and text, score values, threat costs, bosses.
const ET={
  husk:{hp:4,spd:34,r:4.5,dmg:12,col:'#7f8f68',atk:0.9},
  crawler:{hp:2,spd:74,r:3,dmg:6,col:'#b0714c',atk:0.6},
  spitter:{hp:5,spd:28,r:4.5,dmg:10,col:'#6c86ad',atk:1.9,ranged:true,swim:1},
  snake:{hp:3,spd:86,r:2.6,dmg:7,col:'#4a9a8a',stripe:'#2a5e54',atk:0.7,snake:true,swim:1.3,land:0.85},
  arcsnake:{hp:4,spd:80,r:2.8,dmg:6,col:'#5a7ad0',stripe:'#c8b040',atk:0.8,snake:true,swim:1.3,land:0.85,pulse:true},
  charger:{hp:12,spd:26,r:6,dmg:0,col:'#8a6a4a',atk:1,charger:true},
  frog:{hp:7,spd:30,r:5,dmg:6,col:'#4a8a3a',atk:1.3,frog:true,swim:1.4},
  warden:{hp:80,spd:24,r:5.5,dmg:12,col:'#8a3a3a',atk:1.4,warden:true},
  spider:{hp:6,spd:18,r:5,dmg:1,col:'#3a3640',atk:1.9,spider:true},
  guard:{hp:18,spd:17,r:5,dmg:5,col:'#34445e',atk:1.7,guard:true},
  wasp:{hp:2.5,spd:48,r:3,dmg:3,col:'#d8b030',atk:2.2,wasp:true,fly:true},
  drone:{hp:2,spd:62,r:3,dmg:0,col:'#7a868a',atk:1,drone:true,fly:true},
  grasper:{hp:12,spd:40,r:6,dmg:10,col:'#7a4a8a',atk:1.1,aquatic:true,swim:1,grasper:true},
  ghost:{hp:6,spd:30,r:4,dmg:3,col:'#d8e8f0',atk:1,ghost:true,fly:true},
  snare:{hp:10,spd:0,r:5,dmg:6,col:'#4a7a2a',atk:1,grasper:true,plant:true,biteP:10},
  pod:{hp:8,spd:0,r:5,dmg:3,col:'#8a4a9a',atk:2.6,plant:true,pod:true},
  trip:{hp:10,spd:0,r:5,dmg:2,col:'#3a6a22',atk:1,plant:true,trip:true},
  lurker:{hp:8,spd:70,r:5,dmg:12,col:'#2a5a6a',atk:1.2,aquatic:true,swim:1},
  slug:{hp:7,spd:18,r:5,dmg:8,col:'#a8b050',atk:1.1,trail:1,slug:true},
  toxslug:{hp:7,spd:18,r:5,dmg:7,col:'#78b030',atk:1.1,trail:2,slug:true,biteP:20},
  snail:{hp:10,spd:12,r:5,dmg:10,col:'#9a8a6a',atk:1.2,trail:1,snail:true,armor:0.4},
  brute:{hp:18,spd:24,r:7,dmg:26,col:'#9a4d5f',atk:1.3},
  dummy:{hp:1e9,spd:0,r:5,dmg:0,col:'#a89a70',atk:99,dummy:true}
};
const BOSSES=[{name:'Intake Maw',col:'#8a6a3a',move:'charge'},{name:'Pressure Hulk',col:'#5a6a8a',move:'slam'},{name:'The Sorter',col:'#8a7a3a',move:'throw'},{name:'Frost Matron',col:'#8ab0c8',move:'breath'},{name:'Brine Octopus',col:'#8a4a6a',move:'grab'},{name:'Arc Lord',col:'#6a8ac8',move:'pulse'}];
const KILLPTS={wasp:25,warden:600,guard:120,pod:60,trip:70,spider:70,frog:70,husk:50,crawler:40,spitter:70,brute:150,snake:60,arcsnake:90,charger:120,drone:50,slug:60,toxslug:70,snail:90,lurker:110,grasper:130,ghost:100,snare:80,dummy:0};
const THREAT={wasp:0.7,husk:1,crawler:1,slug:1,drone:1.3,spitter:1.6,snake:1.5,frog:1.6,spider:1.6,toxslug:1.6,snail:2,arcsnake:2.2,lurker:2.2,charger:2.6,grasper:2.6,ghost:2.6,guard:3,brute:3.6};
const BEASTS=['husk','crawler','spitter','wasp','guard','warden','frog','spider','snake','arcsnake','lurker','grasper','snare','pod','trip','ghost','slug','toxslug','snail','charger','drone','brute'];
const BEASTINFO={
  husk:{name:'Husk',lore:'Station crew, or what the static left of them. Slow and stubborn, they follow noise through open doors and never quite give up.',move:'slow',attack:'claws at close range'},
  crawler:{name:'Crawler',lore:'Low, fast and many-legged. Something that grew in the brine tanks. Fragile, but it closes the gap before you can line up a shot.',move:'very fast',attack:'quick bites'},
  spitter:{name:'Spitter',lore:'Keeps its distance and lobs caustic globs, circling rather than charging. Shows up from the second deck down.',move:'slow, keeps range',attack:'ranged glob'},
  snake:{name:'Brine snake',lore:'Long, banded and quick, it lives in the flooded decks and moves faster through water than out of it. It weaves as it comes, darts off after every bite, and jinks aside when you line up a shot. Its long body makes a bigger target than its speed suggests.',move:'fast, erratic, quicker in water',attack:'bite, then darts away'},
  arcsnake:{name:'Arc snake',lore:'A brine snake that nested in live cabling and came out wrong. Every few seconds it discharges a pulse that shocks anything close, and anything standing in water it is touching. Watch for the sparks along its body.',move:'fast, erratic, quicker in water',attack:'bite and electric pulse'},
  warden:{name:'Sector stalker',lore:'Each part of the station has something huge that has learned to follow survivors from deck to deck: the Intake Maw charges, the Pressure Hulk slams the floor, the Sorter hurls crates, the Frost Matron breathes ice, the Brine Octopus drags you in under a cloud of ink, and the Arc Lord pulses with current. Kill one and it stops following you.'},
  wasp:{name:'Bloom wasp',move:'darting flight, keeps its distance, often in swarms',attack:'lunging sting, then dazed for a moment',lore:'Thumb-sized wasps that nest in the overgrowth and guard the blooms. They hover at a wary distance, then lunge with a sting. Each lunge leaves them dazed and drifting for a second, which is your opening. They fly over water and chasms.'},
  guard:{name:'Security guard',move:'slow, holds its range, follows you',attack:'sidearm shots, radios for backup',lore:'Station security, still on shift. Slow, well protected and armed with a sidearm. If one keeps you in sight for a few seconds it radios for backup and the deck alarm goes off, unless you drop it first. Biometric trip scanners call them too.'},
  pod:{name:'Seedpod bloom',move:'rooted in a wall',attack:'fans of seeds',lore:'A fleshy violet flower rooted in a wall seam. When something moves in front of it, it puffs out a fan of hard seeds. It cannot move and dies quickly once you reach it.'},
  trip:{name:'Tripwire vine',move:'rooted in a wall',attack:'tripwire tendril that drags you',lore:'A wall-rooted vine that lays a thorny tendril across the floor and waits. Cross the tendril and it snaps tight and drags you back to the wall. Dash, blink or hurt it to break free, and it takes a while to regrow.'},
  spider:{name:'Duct spider',move:'slow, keeps its distance',attack:'sticky web shots, strings web lines',lore:'A slow, long-legged thing that nests in the air ducts. It keeps its distance and spits sticky web, and now and then strings a web across a corridor. Webs slow anything that wades through them, but tear apart after one pass. Fire clears them.'},
  frog:{name:'Bog frog',move:'hops in short bursts, fast in water',attack:'tongue lash',lore:'A dog-sized frog bred in the hydroponics drains. It hops in short bursts, swims fast, and croaks loud enough to wake the deck. Its tongue lashes out like a whip from a few paces away, and anything in the way gets hit, including other creatures.'},
  charger:{name:'Ram',lore:'Heavy, low and armored at the front. It paws the floor, locks on, then builds speed in a straight line and cannot turn once it commits. Walls stop it cold and leave it dazed. Anything in its path gets flattened, including its own kind.',move:'plods, then charges in a straight line',attack:'charge impact, heavy knockback'},
  drone:{name:'Watcher drone',lore:'A station security drone still running old orders. It never attacks. It keeps its distance, follows you and sounds an alarm that brings everything nearby. Two hits bring it down, if you can catch it.',move:'flies, keeps its distance',attack:'none, calls others'},
  slug:{name:'Sludge slug',lore:'A bloated mutant slug the size of a dog. Slow and soft, but it coats every tile it crosses in sticky slime that clings to your boots. Dash over trails, burn them off, or scrape them thin by walking through.',move:'very slow, leaves sticky slime',attack:'crushing bite'},
  toxslug:{name:'Blight slug',lore:'A sludge slug that fed on the toxic spills. Its trail is still sticky, and it also poisons anything that wades through it. The bite poisons too.',move:'very slow, leaves toxic slime',attack:'poisoned bite'},
  snail:{name:'Plated snail',lore:'A huge snail with a shell of fused hull plating. Guns barely scratch the shell, and it pulls in tight when hurt. Explosions, rams and hazards get through fine. Leaves a sticky trail.',move:'crawls, leaves sticky slime',attack:'heavy bite, armored shell'},
  grasper:{name:'Grasper',lore:'A many-armed thing from the flooded depths that cannot leave deep water. It waits just under the surface near the edge, then lashes out a long tentacle to snatch anything within reach and haul it into the water, biting when it gets you close. Shoot the tentacle, shove it off, or dash free.',move:'deep and waist-deep water only',attack:'tentacle grab and drag, bite'},
  ghost:{name:'Ghost',lore:'A pale shape that drifts through walls on haunted decks. Bullets, shoves and blasts pass straight through it. It drifts toward you slowly and unevenly, then gathers itself and lunges straight through you, leaving a chill of radiation, and coasts on for a few seconds before it loops back around. It flees the moment you look straight at it. Only radiation weapons hurt it, and an anomaly core destroys it outright.',move:'drifts through walls, loops back after a lunge, flees your gaze',attack:'lunges through you, radiation'},
  snare:{name:'Snarevine',lore:'A rooted, toothy bloom from overgrown decks. It cannot move, but it lashes a slow green tendril to catch anything nearby and reel it in to its poisoned core. Shoot the vine, shove it or dash free, and keep your distance.',move:'rooted in place',attack:'vine grab and pull, poisoned bite'},
  lurker:{name:'Lurker',lore:'Something big living in the deepest water, and it cannot leave it. It stays submerged, where bullets skip off the surface, and shows only a ripple. When you come close it rises and bites, then stays up a moment before diving. Stay out of the deep water, or wait for it to surface. Explosions reach it underwater.',move:'deep and waist-deep water only',attack:'rising bite'},
  brute:{name:'Brute',lore:'A husk that kept growing. Soaks a magazine, hits hard enough to crack plating, and barely moves when shoved. Deeper decks only.',move:'slow',attack:'heavy slam'}
};
// How long creatures keep hunting you (balance pass, v0.87). An alerted creature that cannot see you counts down its
// memory and then goes back to wandering; seeing you again refreshes it. Bosses, arena creatures and guards during an
// alarm never give up.
const TRACK_CFG={
  see:180,             // px: seeing you within this range refreshes the memory
  memory:8,            // seconds a creature keeps hunting after losing sight of you
  noise:5,             // seconds of interest from hearing a noise
  wave:30,called:20,   // disturbance waves and guards called by an alarm hunt longer
  leash:30,leashDecay:3, // beyond this walking distance (tiles), or with no way to you, memory runs out 3x faster
  throughWall:0.5};    // noise heard through walls carries this share of its range
// threat budget by deck size: large decks were crowded, so they get 20% fewer creatures than their area alone would give
const THREAT_SIZE_MUL={s:1,m:1,l:0.8};
// arenas: a smaller first group, then waves. With a biome mini-boss the waves keep coming until it dies.
const ARENA_WAVES={startShare:0.4,minStart:2,firstDelay:8,every:15,size:[2,3],perDepth:1/3,noBoss:3,cap:8};
// ghost movement (v0.88): floaty and erratic, a lunge through you when close, then a slow drift before it loops back
const GHOST_CFG={
  spd:30,accel:1.3,    // cruising speed (px/s) and how quickly it changes velocity (lower = floatier)
  wobble:0.9,wobbleRate:1.4,speedVar:0.4, // wandering off line (rad), how fast that wanders, and speed variation
  track:230,           // px: within this it comes for you; further off it just drifts about
  lungeR:62,windup:0.35,lungeSpd:210,lungeT:0.45,cd:3.2, // lunge range, wind-up, speed, duration, cooldown
  driftT:2.6,driftSpd:42,driftDecay:0.55, // after a lunge: seconds coasting on, starting speed, speed kept per second
  fleeSpd:110,fleeAccel:3};
