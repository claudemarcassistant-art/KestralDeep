// Character: crew files, substats, cores, skills, movement skills, psychic actions, sling, injuries, spacebar styles.
const SKILLS={
  sonar:{name:'Sonar pulse',desc:'Shows enemies and hidden passages nearby, through walls.',cd:20},
  adren:{name:'Adrenaline',desc:'5 seconds of extra speed with no backpedal penalty.',cd:30},
  cloak:{name:'Cloak',desc:'6 seconds where enemies cannot see you and lose track of you. Firing, throwing a charge or taking a hit drops it early. A shove from cloak is an ambush.',cd:35},
  slam:{name:'Ground slam',desc:'Knocks back everything around you and breaks weak walls.',cd:15},
  sling:{name:'Sling',desc:'Swaps your item slots for the resource ranger bar: sling debris, ammo and throwables. Hold left click to charge a shot (aiming with right click tightens it), tap for a quick one. Q goes back to items.',cd:0,mode:true},
  psych:{name:'Psych',desc:'Swaps your item slots (3 and up) for your psychic action bar. Left click uses the selected action, hold right click to aim first. Press Q to go back to your items.',cd:0,mode:true}
};
const ACTS={
  push:{name:'Telekinetic push',cd:3,col:'#9fc3ff',desc:'A wave of force in front of you. Throws enemies back hard, into walls if they are close.'},
  well:{name:'Gravity well',cd:10,col:'#a88af0',desc:'A point of crushing pull where you aim. Drags enemies in for a few seconds, then collapses on them.'},
  calm:{name:'Make friendly',cd:25,col:'#9fe0b0',desc:'Aim at a creature to turn it for 20 seconds. It stops hunting you and attacks others instead.'},
  pyro:{name:'Pyrokinesis',cd:8,col:'#ff9a4a',desc:'Sets the floor where you aim on fire, and ignites any oil there.'},
  orbit:{name:'Orbiting debris',cd:14,col:'#c8c0b0',desc:'Lifts scraps of the station to circle you for 10 seconds. Each piece hits creatures it touches for most of your main-hand damage.'},
  astral:{name:'Astral projection',cd:30,col:'#c8b8ff',desc:'Leave your body where it stands and drift as a ghost for up to 12 seconds: through walls, uncovering the map, but unable to touch anything. Your body is defenceless; if it is hurt you snap back. Press Q to return early.'},
  sense:{name:'Detect life',cd:14,col:'#f0d0e8',desc:'Reach out with your mind. For 8 seconds you sense every living thing within a wide radius, through walls: red for hostile, green for friendly, pale for people.'},
  hold:{name:'Immobilize',cd:15,col:'#7fd8e0',desc:'Aim at a spot to pin every creature nearby in place for 3.5 seconds. They cannot move or attack on their own, but pushes, slams, blasts and gravity still move them.'},
  hex:{name:'Unravel',cd:12,col:'#e070c0',desc:'Aim at a spot to mark every creature nearby for 8 seconds. Marked creatures take 35% more damage from everything.'}};
const SLING={debris:{name:'Debris',col:'#8e978b',dmg:-1,desc:'Scoop a chunk of rubble off the floor and sling it. Never runs out, but the damage is all over the place.'},
  rounds:{name:'Sidearm rounds',col:'#d8c070',ammo:'rounds',dmg:3,desc:'Flick a sidearm round. Uses 1 round.'},
  shells:{name:'Shells',col:'#c86a3a',ammo:'shells',dmg:2,pel:3,desc:'Burst a shell into three pellets. Uses 1 shell.'},
  nails:{name:'Nails',col:'#a0a8b0',ammo:'nails',dmg:1.6,pel:2,desc:'Two nails at once. Uses 1 nail.'},
  bolts:{name:'Bolts',col:'#7a9ab8',ammo:'bolts',dmg:6,pierce:true,desc:'A slung bolt that punches through a line of creatures. Uses 1 bolt.'},
  cells:{name:'Power cells',col:'#9fe0ff',ammo:'cells',dmg:3,shock:true,desc:'A crackling cell that stuns what it hits. Uses 1 cell.'},
  charge:{name:'Pipe charge',col:'#c8a060',thrown:'charge',desc:'Lob a pipe charge.'},
  flask:{name:'Flask',col:'#6fb3c3',thrown:'flask',desc:'Lob your flask, splashing what is inside.'},
  nade:{name:'Grenades',col:'#6a8a30',thrown:'nade',desc:'Lob a molotov, gas or smoke grenade, whichever you have.'}};
const FT=(cost,desc,o)=>Object.assign({cost,desc},o||{});
const FILES=[
 {id:'deckhand',name:'Deckhand',role:'cargo crew',kind:'flat',starter:true,tiers:[FT(1,'Shoves hit 1 harder.',{stat:{meleeDmg:1}}),FT(1,'Unlocks the Weighted sleeve upgrade.',{upg:'weight'}),FT(1,'Shoves hit 1 harder.',{stat:{meleeDmg:1}}),FT(2,'Unlocks the Spiked knuckles upgrade.',{upg:'knuck'})]},
 {id:'rigger',name:'Rigger',role:'cable and winch',kind:'flat',starter:true,tiers:[FT(1,'+10% stamina.',{stat:{stamina:0.1}}),FT(1,'Unlocks the Endurance upgrade.',{upg:'endur'}),FT(1,'+10% stamina.',{stat:{stamina:0.1}}),FT(2,'Unlocks the Footwork upgrade.',{upg:'foot'})]},
 {id:'courier',name:'Courier',role:'internal post',kind:'flat',tiers:[FT(1,'+4% move speed.',{stat:{spd:0.04}}),FT(1,'Unlocks the Sprint training upgrade.',{upg:'sprint'}),FT(1,'+4% move speed.',{stat:{spd:0.04}}),FT(2,'Unlocks the Spring coil upgrade.',{upg:'dashc'})]},
 {id:'plating',name:'Plating tech',role:'hull repair',kind:'flat',tiers:[FT(1,'Take 3% less damage.',{stat:{dr:0.03}}),FT(1,'Unlocks the Toughness upgrade.',{upg:'tough'}),FT(1,'Take 3% less damage.',{stat:{dr:0.03}}),FT(1,'Take 3% less damage.',{stat:{dr:0.03}})]},
 {id:'hazmat',name:'Hazmat',role:'spill response',kind:'flat',tiers:[FT(1,'25% poison resistance.',{stat:{poisonRes:0.25}}),FT(1,'25% shock resistance.',{stat:{shockRes:0.25}}),FT(2,'Unlocks the Resilience upgrade.',{upg:'resil'}),FT(2,'25% stun resistance.',{stat:{stunRes:0.25}})]},
 {id:'brawler',name:'Brawler',role:'off-shift fight club',kind:'milestone',req:{id:'deckhand',t:2},tiers:[FT(1,'Unlocks the Long haft upgrade.',{upg:'haft'}),FT(1,'Unlocks the Wide swing upgrade.',{upg:'arc'}),FT(2,'Unlocks the Quick hands upgrade.',{upg:'quick'}),FT(3,'Haymaker: tackles knock enemies much further.',{perk:'haymaker'}),FT(2,'Rhythm: melee combos build 50% faster.',{perk:'rhythm'}),FT(3,'Flurry: at 10+ combo, every fifth connecting hit is a guaranteed crit.',{perk:'flurry'}),FT(3,'Second nature: combos drain half as fast, and a combo of 5+ survives one hit.',{perk:'secondnature'}),FT(2,'Learn Kick (SPACE style): a narrow, longer kick that hits harder and knocks twice as far as a shove. Sprint into it for a flying kick.',{space:'kick'})]},
 {id:'security',name:'Security officer',role:'deck patrol',kind:'milestone',tiers:[FT(2,'Guns fire 5% faster and crit 3% more.',{stat:{rof:0.05,crit:0.03}}),FT(1,'Unlocks the Trigger work upgrade.',{upg:'trig'}),FT(2,'Learn Adrenaline (active skill).',{skill:'adren'}),FT(2,'Unlocks the Steady hands upgrade.',{upg:'steady'}),FT(3,'Steady aim: 30% tighter spread.',{perk:'steady'})]},
 {id:'armorer',name:'Armorer',role:'security armoury',kind:'milestone',req:{id:'security',t:2},tiers:[FT(2,'Unlocks the Hot loads upgrade.',{upg:'pen'}),FT(2,"Unlocks the Scavenger's eye upgrade.",{upg:'scav'}),FT(2,'Ammo pickups give 10% more.',{stat:{ammoBonus:0.1}})]},
 {id:'surveyor',name:'Surveyor',role:'mapping team',kind:'milestone',tiers:[FT(2,'Hack window 25% wider.',{stat:{hack:0.25}}),FT(2,'Learn Sonar pulse (active skill).',{skill:'sonar'}),FT(2,'Unlocks the Haggling upgrade.',{upg:'haggle'}),FT(3,'Cartographer: the lift room is on your map when you arrive.',{perk:'cartog'})]},
 {id:'night',name:'Night shift',role:'after-hours staff',kind:'milestone',tiers:[FT(2,'Quieter footsteps, and 3% more critical hits.',{stat:{quiet:0.3,crit:0.03}}),FT(3,'Learn Cloak (active skill).',{skill:'cloak'}),FT(3,'Ambusher: surprise shoves hit four times as hard, not three.',{perk:'ambusher'}),FT(2,'Low profile: disturbance builds 20% slower.',{perk:'lowprofile'}),FT(3,'Duct rat: disturbance builds another 20% slower, and failed hacks only add half as much.',{perk:'ductrat'})]},
 {id:'medic',name:'Medic',role:'station infirmary',kind:'milestone',tiers:[FT(2,'Slowly regenerate health.',{stat:{regen:0.15}}),FT(1,'Unlocks the Field medic upgrade.',{upg:'medic'}),FT(2,'Field dressing: patches and medkits heal 50% more.',{perk:'fielddress'}),FT(3,'Second wind: once per deck, dropping below 20 health heals you 30.',{perk:'secondwind'})]},
 {id:'galley',name:'Galley cook',role:'crew mess',kind:'milestone',tiers:[FT(1,'Unlocks the Camp cook upgrade.',{upg:'cook'}),FT(2,'Unlocks the Salvager upgrade.',{upg:'salv'}),FT(2,'Forager: raw ingredients come in pairs.',{perk:'forager'})]},
 {id:'demo',name:'Demolitions',role:'blasting crew',kind:'milestone',tiers:[FT(2,'Shaped charges: your explosions hit 25% harder.',{perk:'boom'}),FT(1,'Unlocks the Throwing arm upgrade.',{upg:'throw'}),FT(2,'Learn Ground slam (active skill).',{skill:'slam'}),FT(3,'Blast plating: take half damage from explosions.',{perk:'blastplate'})]},
 {id:'psion',name:'Sensitive',role:'CLASSIFIED: project listener. subterfuge and movement',kind:'classified',tiers:[FT(2,'Learn Psych (psychic action bar) with Make friendly.',{skill:'psych',act:'calm'}),FT(3,'Learn Float (SHIFT move): hover over floors and chasms.',{move:'float'}),FT(2,'Unlocks the Focus upgrade: psychic actions recharge faster.',{upg:'focus'}),FT(3,'Learn Blink (SHIFT tap): a short psychic teleport.',{move:'blink'}),FT(2,'Quiet mind: disturbance builds 15% slower.',{perk:'quietmind'}),FT(3,'Mind shield: 30% stun resistance.',{stat:{stunRes:0.3}}),FT(3,'Adds Immobilize: pin creatures in place.',{act:'hold'}),FT(2,'Adds Detect life: sense every living thing nearby, through walls.',{act:'sense'}),FT(3,'Adds Astral projection: leave your body and scout as a ghost.',{act:'astral'}),FT(2,'Spirit ward: ghosts cannot touch you, and shy away from you.',{perk:'ward'})]},
 {id:'kinetic',name:'Kinetic',role:'CLASSIFIED: project hammer. force, damage and debuffs',kind:'classified',tiers:[FT(2,'Learn Psych (psychic action bar) with Telekinetic push.',{skill:'psych',act:'push'}),FT(2,'Adds Orbiting debris.',{act:'orbit'}),FT(3,'Adds Gravity well.',{act:'well'}),FT(2,'Adds Unravel: marked creatures take extra damage.',{act:'hex'}),FT(3,'Adds Pyrokinesis.',{act:'pyro'}),FT(3,'Shrapnel: three pieces of debris instead of two, each hitting harder.',{perk:'shrapnel'}),FT(3,'Concussive: Telekinetic push also stuns.',{perk:'concussive'}),FT(3,'Tether: loose items within reach drift toward you on their own.',{perk:'tether'}),FT(3,'Learn Repulse (SPACE style): a burst that throws everything around you away: creatures, barrels, crates, loose items and gas.',{space:'repulse'})]},
 {id:'ranger',name:'Ranger',role:'perimeter scouts',kind:'milestone',tiers:[FT(2,'Learn Sling: a resource ranger bar, with rubble and sidearm rounds.',{skill:'sling',sact:['debris','rounds']}),FT(2,'Sling shells and nails.',{sact:['shells','nails']}),FT(2,'Sling bolts and power cells.',{sact:['bolts','cells']}),FT(3,'Lob pipe charges, flasks and grenades from the sling.',{sact:['charge','flask','nade']}),FT(3,'Slinger: fully drawn sling shots crit 15% more often.',{perk:'slinger'})]},
 {id:'mover',name:'Mover',role:'loading dock',kind:'milestone',req:{id:'courier',t:1},tiers:[FT(2,'Learn Dash (SHIFT move).',{move:'dash'}),FT(2,'Learn Creep (SHIFT move).',{move:'creep'}),FT(2,'+15% acceleration.',{stat:{accel:0.15}})]}];
const MOVES={
  sprint:{name:'Sprint',desc:'Hold SHIFT to run 55% faster. Drains stamina, your footsteps are loud, and your shots scatter. Always on unless Float replaces it.'},
  dash:{name:'Dash',desc:'While switched on, tapping SHIFT bursts forward with a split second where nothing can hurt you. Keep holding SHIFT to carry on running. Costs stamina.'},
  creep:{name:'Creep',desc:'While switched on, your normal walking is stealthy: unaware enemies only notice you up close, and shoves on them hit three times as hard. Running cancels it.'},
  float:{name:'Float',desc:'Replaces sprint while switched on. Hold SHIFT to hover and glide like you are on ice: ignores water, slime, oil, ice and toxic floors, crosses chasms, and halves fire damage. Drains stamina (less with Perception and Resolve), then health. Over a chasm you keep floating until you reach solid ground.'},
  blink:{name:'Blink',desc:'Psychic. While switched on, tapping SHIFT teleports you a short way in the direction you are moving, even across chasms, with a long moment where nothing can hurt you. Takes over the tap from Dash. Costs stamina, then health.'}
};
const CORES={body:{name:'Body',col:'#e0806a',subs:['vit','might','agility'],desc:'Each level: +5 max health, +2% move speed.'},
  spirit:{name:'Spirit',col:'#9fe0b0',subs:['resolve','wind','grit'],desc:'Each level: +5% stamina, statuses build 5% slower.'},
  mind:{name:'Mind',col:'#9fc3ff',subs:['dex','mem','perc'],desc:'Each level: 4% tighter aim, 3% faster fire rate and skill recharge, +5 light radius.'}};
const SUBS={vit:{name:'Vitality',core:'body',desc:'+4 max health and slow regeneration per point.'},might:{name:'Might',core:'body',desc:'Shoves hit 6% harder and knock 8% further per point.'},agility:{name:'Agility',core:'body',desc:'+2% move speed and 5% sharper acceleration per point.'},
  resolve:{name:'Resolve',core:'spirit',desc:'Statuses build 5% slower per point.'},wind:{name:'Wind',core:'spirit',desc:'+6% stamina and 5% faster stamina recovery per point.'},grit:{name:'Grit',core:'spirit',desc:'Take 2% less damage and resist stun 5% per point.'},
  dex:{name:'Dexterity',core:'mind',desc:'5% tighter aim and 2% faster fire rate per point.'},mem:{name:'Memory',core:'mind',desc:'Skills and actions recharge 4% faster and the hack window is 5% wider per point.'},perc:{name:'Perception',core:'mind',desc:'+6 light radius and +3% drop chance per point.'}};
const FILESUB={ranger:['dex','perc'],deckhand:['might'],rigger:['wind'],courier:['agility'],plating:['grit'],hazmat:['resolve'],brawler:['might','agility'],security:['dex'],armorer:['dex','perc'],surveyor:['perc','mem'],night:['perc','agility'],medic:['vit','resolve'],galley:['vit','wind'],demo:['might','grit'],mover:['agility'],psion:['mem','agility'],kinetic:['might','mem']};
const INJ={arm:{name:'Broken arm',desc:'-1 Might, -20 max health.',sub:{might:-1},hp:-20,base:6},ribs:{name:'Cracked ribs',desc:'-20% stamina, -10 max health.',stam:-0.2,hp:-10,base:5},
  ankle:{name:'Sprained ankle',desc:'-10% movement speed.',spd:-0.1,base:4},concussion:{name:'Concussion',desc:'-1 Memory, and your shots scatter more.',sub:{mem:-1},aim:0.25,base:4},
  burn:{name:'Third-degree burn',desc:'-8% movement speed, -5 max health.',spd:-0.08,hp:-5,base:6},nerve:{name:'Nerve damage',desc:'-1 Dexterity, guns fire 10% slower.',sub:{dex:-1},rof:-0.1,base:5},
  blood:{name:'Poisoned blood',desc:'-10 max health, and poison builds faster.',hp:-10,poisonRes:-0.2,base:5},frost:{name:'Frostbite',desc:'-1 Agility, -5 max health.',sub:{agility:-1},hp:-5,base:5}};
// What SPACE does. Shove is always known; kick (Brawler tier 8) and repulse (Kinetic tier 9) are learned from crew files
// (a tier with space:'kick'). The active one is player.space, chosen in Files > Skills.
const SPACE_STYLES={
  shove:{name:'Shove',desc:'A wide shove that knocks things back. Sprinting into it makes a tackle.'},
  kick:{name:'Kick',arc:0.5,range:26,dmg:3,kbMul:2,stam:12,cdMul:1.2,flyBoost:180,flyRange:6,
    desc:'A narrow kick with a longer reach: 3 damage plus your melee bonuses and twice a shove\'s knockback. It counts as a melee hit for combos and crits. 12 stamina. Sprint into it for a flying kick.'},
  repulse:{name:'Repulse',r:40,kbMul:0.7,dmg:1,stam:15,cd:4,
    desc:'A psychic burst all around you that throws creatures, barrels, crates, loose items and gas clouds away. 1 damage, but things slammed into walls take impact damage. 15 stamina (the rest comes out of your health), 4 second recharge, faster with the Focus upgrade.'}};
// Stats tab (v1.06, batch 4 request 23). Code: src/game/46-stattips.js and drawStats() in 27-menus.js.
// STAT_LINKS: for each Stats row, the substats and cores that change it, read from the formulas (refreshStats(),
// baseMaxHp(), aimMul(), mindCd(), melee(), glanceBase(), addStatus(), the Stats row code), with the amount one point
// or level adds: [amount, unit]. Hovering a row lights these up on the left; hovering one on the left outlines its rows.
const STAT_LINKS={
  'Health':{vit:[4,''],body:[5,'']},
  'Damage taken':{grit:[-2,'%']},
  'Move speed':{agility:[2,'%'],body:[2,'%']},
  'Acceleration':{agility:[5,'% quicker']},
  'Stamina':{wind:[6,'%'],spirit:[5,'%']},
  'Stamina recovery':{wind:[3,'%'],spirit:[2.5,'%']},
  'Fire rate':{dex:[2,'%'],mind:[3,'%']},
  'Crits':{perc:[1,'%'],dex:[0.5,'%'],mind:[1,'%']},
  'Glances':{dex:[-1,'%'],perc:[-0.5,'%']},
  'Enemy drop chance':{perc:[3,'%']},
  'Regeneration':{vit:[0.03,' hp/s']},
  'Light radius':{perc:[6,' px'],mind:[5,' px']},
  'Hack window':{mem:[5,'%']},
  'Shove':{might:[6,'% harder']},
  'Shove push':{might:[8,'% further']},
  'Status build-up':{resolve:[-5,'%'],spirit:[-5,'%']},
  'Skill recharge':{mem:[-4,'%'],mind:[-3,'%']},
  'Aim spread':{dex:[-5,'%'],mind:[-4,'%']},
  'Stun resistance':{grit:[5,'%']}
};
// STAT_TIPS: what each Stats row does (d), the S key that gear, crew file tiers, food and draught buffs add to (key;
// their current contributions are listed; neg: shown as a reduction, since the row counts down), and the other sources
// by name (also).
const STAT_TIPS={
  'Health':{d:'How much punishment you can take. Lost max health from injuries shows greyed out on the bar.',also:'injuries (some take max health away), the Glass cannon run modifier (halves it)'},
  'Armor':{d:'Soaks hits before health does. Picked up as plating; tops out at 50.',also:'armor plates you pick up and craft'},
  'Damage taken':{key:'dr',neg:true,d:'Takes a share off every hit that gets through your armor. Capped at 50%.',also:'gear (hard hat, work vest, plate rig, pauldrons), the Toughness upgrade (5% a level, not shown in the number), crew file tiers'},
  'Move speed':{key:'spd',d:'How fast you walk and run.',also:'gear (runner boots, plate rig), crew file tiers, food buffs, injuries (ankle, burns)'},
  'Acceleration':{key:'accel',d:'How quickly you reach full speed and stop. Lower is snappier.',also:'gear (cleats, runner boots, plate rig), the Footwork upgrade, stims and adrenaline'},
  'Stamina':{key:'stamina',d:'Fuel for sprinting, dashing, shoving and swinging.',also:'gear (breath trainer), the Endurance upgrade, crew file tiers, food buffs, injuries (cracked ribs)'},
  'Stamina recovery':{key:'stamina',d:'How fast stamina comes back once you stop using it.',also:'gear (breath trainer), stims, herbal draughts, being irritated by tear gas (halves it)'},
  'Backpedal slow':{key:'backpedal',neg:true,d:'How much aiming slows you while you walk backwards.',also:'gear (knee pads), crew file tiers'},
  'Fire rate':{key:'rof',d:'How fast every gun fires.',also:'gear (loader gloves), the Trigger work upgrade, crew file tiers, injuries (nerve damage)'},
  'Ammo per pickup':{key:'ammoBonus',d:'Extra rounds from every ammo pickup.',also:'gear (cargo pants, saddlebag), crew file tiers'},
  'Gunfire noise':{key:'quiet',neg:true,d:'How far your shots carry to creatures that can hear them.',also:'gear (quiet soles), crew file tiers'},
  'Melee dmg':{key:'meleeDmg',d:'The damage range of your main-hand weapon, or fists, per hit.',also:'your weapon, gear (grip gloves), crew file tiers, food buffs'},
  'Gun dmg':{d:'The damage range of your gun per shot (per pellet for the scattergun).',also:'your gun, the Hot loads upgrade, a laser sight while aiming'},
  'Crits':{key:'crit',d:'Chance a hit does double damage. Each weapon has its own base chance.',also:'your weapon, gear (marksman loupe, lucky tag), crew file tiers'},
  'Glances':{d:'Chance your hit only grazes, for half damage and little knockback. Armoured targets glance more.',also:'the target (armour, plating, traits)'},
  'Glance off you':{d:'Chance a creature\'s hit only grazes you, for half damage and half stun.',also:'your armor (up to a cap), blocking with a riot shield'},
  'Enemy drop chance':{key:'luck',d:'Chance a creature drops supplies when it goes down.',also:'gear (lucky tag), crew file tiers'},
  'Regeneration':{key:'regen',d:'Health you get back every second without doing anything.',also:'gear (slow injector), crew file tiers, food buffs'},
  'Light radius':{d:'How far your own light reaches, and any beam you carry.',also:'gear (back lantern, night optics, headlamp, barrel light), the deck\'s lighting, fog'},
  'Hack window':{key:'hack',d:'How wide the green window is on hack panels, and how much each lock fills a hack\'s progress bar (100 breaks in).',also:'gear (splicer kit), crew file tiers'},
  'Shove':{d:'Shove damage and reach.',also:'the Spiked knuckles and Long haft upgrades, gear (grip gloves)'},
  'Shove push':{d:'How far a shove knocks things back, and how wide it sweeps.',also:'the Weighted sleeve and Wide swing upgrades'},
  'Status build-up':{d:'How fast poison, shock, burning, cold and the rest fill up on you. Lower is better.',also:'the Resilience upgrade'},
  'Skill recharge':{d:'How fast your E and F abilities and psychic actions come back. Lower is quicker.',also:'the Focus upgrade (psychic actions)'},
  'Aim spread':{key:'steady',neg:true,d:'How far your shots scatter. Lower is tighter.',also:'aiming with right click, the Steady hands upgrade, a laser sight, ironmoss draughts (steady), injuries (concussion), being irritated by tear gas'},
  'Stun resistance':{key:'stunRes',d:'How slowly hits build up stun on you, before you are dazed.',also:'gear (padded jacket, pauldrons), crew file tiers'},
  'Run':{d:'How deep you are and how many creatures you have put down this run.',also:''}
};
