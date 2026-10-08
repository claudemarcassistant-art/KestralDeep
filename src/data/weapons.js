// Weapons: armaments, gun stats, magazines, crit chances, charge and combo timing.
const WORDER=['pistol','smg','knives','bow','scatter','nailer','bolt','ray','flamer'];
const ARM={
  pistol:{name:'Sidearm',hand:'off',gun:true,desc:'Off hand. Reliable semi-automatic, with a good eye for weak spots (10% crit). Hold right click to aim, then left click to fire.'},
  bow:{name:'Compound bow',hand:'two',gun:true,desc:'Two-handed. Quiet and fires bolts. Hold left click to draw and release for up to 2.5x power, letting go just as it fills for a perfect shot. Hold right click to aim and left click to loose arrows at a steady pace.'},
  knives:{name:'Throwing knives',hand:'off',gun:true,desc:'Off hand. Aim and throw one knife at a time: silent, accurate and good at finding weak spots (25% crit). Knives are their own ammo: pick them back up, though some snap on impact.'},
  flamer:{name:'Flamethrower',hand:'off',gun:true,desc:'Off hand. Hold to pour a short-range stream of fire. Sets creatures and floors burning, lights oil and heats barrels. Burns fuel.'},
  smg:{name:'Submachine gun',hand:'off',gun:true,desc:'Off hand. Hold to spray sidearm rounds fast. Loud, loose and hungry for ammo.'},
  scatter:{name:'Scattergun',hand:'off',gun:true,desc:'Off hand. Seven pellets per shot, brutal up close.'},
  nailer:{name:'Nailer',hand:'off',gun:true,desc:'Off hand. Rapid fire, weak per nail.'},
  bolt:{name:'Bolt driver',hand:'off',gun:true,desc:'Off hand. Slow, quiet bolts that pierce a whole line.'},
  ray:{name:'Ray gun',hand:'off',gun:true,desc:'Off hand. Aim with right click, hold left click to charge, release to fire a radiation bolt. Hurts ghosts.'},
  cutter:{name:'Box cutter',hand:'main',melee:{dmg:2,cd:0.22,range:13,arc:0.7,kb:40},desc:'Main hand. Fast, light slashes.'},
  crowbar:{name:'Crowbar',hand:'main',melee:{dmg:3,cd:0.42,range:16,arc:0.9,kb:150},desc:'Main hand. A solid all-rounder.'},
  bat:{name:'Bat',hand:'main',melee:{dmg:4,cd:0.6,range:17,arc:1.1,kb:260},desc:'Main hand. Slow, wide swings that send things flying. Tap to swing, or hold to charge up to 2.5x; release right as it fills for a perfect hit.'},
  spear:{name:'Spear',hand:'two',melee:{dmg:5,cd:0.7,range:30,arc:0.35,kb:180,jab:true},desc:'Two-handed. Long reach, narrow thrust. Tap to jab, or hold to charge up to 2.5x; a full charge lunges you forward, and releasing right as it fills is a perfect thrust. Right click blocks.'},
  soaker:{name:'Super soaker',hand:'main',melee:{dmg:1,cd:0.5,range:12,arc:0.8,kb:60},desc:'Main hand. Paired with a liquid tank in the off hand, hold left click to spray a stream of whatever the tank holds, leaving pools where it lands. Without a tank it is a plastic club.'},
  tank:{name:'Liquid tank',hand:'off',desc:'Off hand. A big flask on a strap: holds 12 measures of one liquid. R fills it from what you stand in, or pours your flask in. Right click drinks water from it. Feeds a super soaker.'},
  whip:{name:'Cable whip',hand:'main',melee:{dmg:1.4,cd:0.55,range:38,arc:0.2,kb:40,lash:true},desc:'Main hand. A long, thin lash that reaches far and hits weakly, but every crack builds up stun. Tap to crack, or hold to charge a lash up to 2.5x as strong; release right as it fills for a perfect crack.'},
  chainsaw:{name:'Chainsaw',hand:'main',melee:{dmg:1.3,cd:0.09,range:15,arc:0.5,kb:35},desc:'Main hand. Hold left click to rev and grind through anything in front of you. Burns power cells as it runs, and is very loud. Without cells it is a heavy club.'},
  shield:{name:'Riot shield',hand:'off',shield:80,desc:'Off hand. Right click blocks with an 80-point guard and less slowdown.'}
};
const FIST={dmg:1,cd:0.3,range:12,arc:0.8,kb:90};
const IMPLEMENTS=['cutter','crowbar','bat','spear','shield','chainsaw','whip'];
const WPN={
  pistol:{name:'SIDEARM',ammo:'rounds',dmg:2,cd:0.28,spread:0.04,speed:430,pellets:1,kb:40,noise:150,shake:1.5,sfx:'shot'},
  bow:{name:'BOW',ammo:'bolts',dmg:4,cd:0.6,spread:0.02,speed:330,pellets:1,kb:90,noise:35,shake:0.5,sfx:'whoosh'},
  knives:{name:'KNIVES',ammo:'knives',dmg:3.2,cd:0.38,spread:0.03,speed:280,pellets:1,kb:40,noise:25,shake:0,sfx:'whoosh'},
  flamer:{name:'FLAMER',ammo:'fuel',dmg:0.35,cd:0.045,spread:0.18,speed:170,pellets:2,kb:0,noise:120,shake:0,sfx:'whoosh'},
  smg:{name:'SMG',ammo:'rounds',dmg:1.3,cd:0.095,spread:0.11,speed:450,pellets:1,kb:25,noise:170,shake:1,sfx:'shot'},
  scatter:{name:'SCATTERGUN',ammo:'shells',dmg:1.4,cd:0.75,spread:0.32,speed:380,pellets:7,kb:70,noise:210,shake:4,sfx:'scatter'},
  nailer:{name:'NAILER',ammo:'nails',dmg:1,cd:0.085,spread:0.09,speed:470,pellets:1,kb:15,noise:110,shake:0.7,sfx:'nail'},
  ray:{name:'RAY GUN',ammo:'cells',dmg:3,cd:0.3,spread:0,speed:520,pellets:1,kb:20,noise:60,shake:2,sfx:'ray',pierce:true},
  bolt:{name:'BOLT DRIVER',ammo:'bolts',dmg:7,cd:0.9,spread:0,speed:720,pellets:1,kb:130,noise:80,shake:2.5,sfx:'bolt',pierce:true}
};
const WCRIT={kick:0.08,bow:0.15,knives:0.25,pistol:0.10,smg:0.04,scatter:0.03,nailer:0.06,bolt:0.20,ray:0.08,flamer:0,fists:0.05,cutter:0.18,crowbar:0.08,bat:0.06,spear:0.12,whip:0.15,chainsaw:0.02,shield:0.04};
const MAGS={pistol:[10,1.1],smg:[30,1.7],scatter:[4,2.2],nailer:[40,1.8],bolt:[1,1.4],ray:[8,1.6],flamer:[60,2.4]};
const CHARGE=['bat','whip','spear','bow'];
const COMBO_T=[[15,'frenzy','#ff7a5a'],[10,'momentum','#ffb050'],[5,'flow','#e8dcb0']];
