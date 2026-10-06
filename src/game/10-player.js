// ---------- player / gear ----------
function equippedList(){const g=player.gear;return [g.shoulders,g.head,g.body,g.hands,g.legs,g.feet,g.back,...g.acc].filter(Boolean);}
function getSlot(k){return k.startsWith('acc')?player.gear.acc[+k[3]]:player.gear[k];}
function setSlot(k,v){if(k.startsWith('acc'))player.gear.acc[+k[3]]=v;else player.gear[k]=v;}
function refreshStats(){
  const s={crit:0,sight:0,qslots:0,shield:0,poisonRes:0,shockRes:0,stunRes:0,hack:0,accel:0,stamina:0,dr:0,spd:0,rof:0,ammoBonus:0,quiet:0,luck:0,regen:0,backpedal:0,meleeDmg:0,chestBonus:0,lantern:false,nvg:false,pinger:false,compass:false,decoder:false,laser:false,beams:[]};
  for(const id of equippedList()){const g=GEAR[id];
    for(const k of ['crit','qslots','shield','poisonRes','shockRes','stunRes','hack','accel','stamina','dr','spd','rof','ammoBonus','quiet','luck','regen','backpedal','meleeDmg','chestBonus'])if(g[k])s[k]+=g[k];
    for(const k of ['lantern','nvg','pinger','compass','decoder','laser'])if(g[k])s[k]=true;
    if(g.beam)s.beams.push(g.beam);}
  if(player&&player.buffs)for(const b of player.buffs){const f=FOOD[b.id].buff;for(const k in f)s[k]+=f[k];}
  if(player&&player.files){const B=coreLv('body'),Sp=coreLv('spirit'),M=coreLv('mind');s.crit+=0.01*M+0.01*subPts('perc')+0.005*subPts('dex');s.spd+=0.02*B+0.02*subPts('agility');s.accel+=0.05*subPts('agility');s.stamina+=0.05*Sp+0.06*subPts('wind');s.dr+=0.02*subPts('grit');s.stunRes+=0.05*subPts('grit');
    s.rof+=0.03*M+0.02*subPts('dex');s.hack+=0.05*subPts('mem');s.luck+=0.03*subPts('perc');s.regen+=0.03*subPts('vit');s.sight=5*M+6*subPts('perc');}
  if(player&&player.files&&player.hp>maxHp())player.hp=maxHp();
  if(player&&player.files)for(const f of FILES){const t=fileTier(f.id);for(let i=0;i<t;i++){const st=f.tiers[i].stat;if(st)for(const k in st)s[k]+=st[k];}}
  for(const j of (player&&player.injuries)||[]){const d=INJ[j.id];if(d.spd)s.spd+=d.spd;if(d.rof)s.rof+=d.rof;if(d.stam)s.stamina+=d.stam;if(d.poisonRes)s.poisonRes+=d.poisonRes;}
  s.dr=Math.min(0.5,s.dr);s.backpedal=Math.min(1,s.backpedal);S=s;
}
function gainGear(id){const g=GEAR[id];let k=g.slot;
  if(k==='acc'){const j=player.gear.acc.indexOf(null);k=j>=0?'acc'+j:null;}
  if(k&&!getSlot(k)){setSlot(k,id);refreshStats();say('equipped '+g.name.toLowerCase());}
  else{player.bag.push(id);say(g.name.toLowerCase()+' stowed. TAB to equip');}
}
function equipBag(i){const id=player.bag[i];if(!id)return;const g=GEAR[id];let k=g.slot;
  if(k==='acc'){let j=player.gear.acc.indexOf(null);if(j<0)j=0;k='acc'+j;}
  const cur=getSlot(k);setSlot(k,id);player.bag.splice(i,1);if(cur)player.bag.push(cur);refreshStats();sfx('equip');
  eqSel=Math.max(0,Math.min(eqSel,player.bag.length-1));}
function unequip(k){const cur=getSlot(k);if(!cur)return;setSlot(k,null);player.bag.push(cur);refreshStats();sfx('equip');}
function learnSkill(){const pool=[...Object.keys(SKILLS).filter(k=>!player.skills.includes(k)),...Object.keys(MOVES).filter(k=>!player.moveSkills.includes(k))];
  if(!pool.length){player.inv.scrap+=2;say('the chip is blank. salvaged 2 scrap');return;}
  const id=pool[rnd(pool.length)];sfx('learn');
  if(MOVES[id]){player.moveSkills.push(id);say('learned '+MOVES[id].name.toLowerCase()+'. put it on SHIFT in the pack (TAB)');return;}
  player.skills.push(id);if(player.skills.length===1)player.skillIdx=0;else if(player.skills.length===2&&player.skillIdx2<0)player.skillIdx2=1;
  say('learned '+SKILLS[id].name.toLowerCase()+'. press E');}
const CORES={body:{name:'Body',col:'#e0806a',subs:['vit','might','agility'],desc:'Each level: +5 max health, +2% move speed.'},
  spirit:{name:'Spirit',col:'#9fe0b0',subs:['resolve','wind','grit'],desc:'Each level: +5% stamina, statuses build 5% slower.'},
  mind:{name:'Mind',col:'#9fc3ff',subs:['dex','mem','perc'],desc:'Each level: 4% tighter aim, 3% faster fire rate and skill recharge, +5 light radius.'}};
const SUBS={vit:{name:'Vitality',core:'body',desc:'+4 max health and slow regeneration per point.'},might:{name:'Might',core:'body',desc:'Shoves hit 6% harder and knock 8% further per point.'},agility:{name:'Agility',core:'body',desc:'+2% move speed and 5% sharper acceleration per point.'},
  resolve:{name:'Resolve',core:'spirit',desc:'Statuses build 5% slower per point.'},wind:{name:'Wind',core:'spirit',desc:'+6% stamina and 5% faster stamina recovery per point.'},grit:{name:'Grit',core:'spirit',desc:'Take 2% less damage and resist stun 5% per point.'},
  dex:{name:'Dexterity',core:'mind',desc:'5% tighter aim and 2% faster fire rate per point.'},mem:{name:'Memory',core:'mind',desc:'Skills and actions recharge 4% faster and the hack window is 5% wider per point.'},perc:{name:'Perception',core:'mind',desc:'+6 light radius and +3% drop chance per point.'}};
const FILESUB={ranger:['dex','perc'],deckhand:['might'],rigger:['wind'],courier:['agility'],plating:['grit'],hazmat:['resolve'],brawler:['might','agility'],security:['dex'],armorer:['dex','perc'],surveyor:['perc','mem'],night:['perc','agility'],medic:['vit','resolve'],galley:['vit','wind'],demo:['might','grit'],mover:['agility'],psion:['mem','agility'],kinetic:['might','mem']};
function subPts(k){const P=player;if(!P||!P.files)return 0;let n=(P.subBonus&&P.subBonus[k])||0;for(const j of P.injuries||[]){const d=INJ[j.id].sub;if(d&&d[k])n+=d[k];}for(const f in FILESUB){const t=P.files[f]||0,L=FILESUB[f];for(let i=0;i<t;i++)if(L[i%L.length]===k)n++;}return n;}
function coreLv(c){const P=player;if(!P)return 0;return Math.max(0,Math.floor(CORES[c].subs.reduce((a,k)=>a+Math.max(0,subPts(k)),0)/3))+((P.coreBonus&&P.coreBonus[c])||0);}
function coreProg(c){return CORES[c].subs.reduce((a,k)=>a+subPts(k),0)%3;}
const INJ={arm:{name:'Broken arm',desc:'-1 Might, -20 max health.',sub:{might:-1},hp:-20,base:6},ribs:{name:'Cracked ribs',desc:'-20% stamina, -10 max health.',stam:-0.2,hp:-10,base:5},
  ankle:{name:'Sprained ankle',desc:'-10% movement speed.',spd:-0.1,base:4},concussion:{name:'Concussion',desc:'-1 Memory, and your shots scatter more.',sub:{mem:-1},aim:0.25,base:4},
  burn:{name:'Third-degree burn',desc:'-8% movement speed, -5 max health.',spd:-0.08,hp:-5,base:6},nerve:{name:'Nerve damage',desc:'-1 Dexterity, guns fire 10% slower.',sub:{dex:-1},rof:-0.1,base:5},
  blood:{name:'Poisoned blood',desc:'-10 max health, and poison builds faster.',hp:-10,poisonRes:-0.2,base:5},frost:{name:'Frostbite',desc:'-1 Agility, -5 max health.',sub:{agility:-1},hp:-5,base:5}};
function injHp(){const P=player;let n=0;for(const j of (P&&P.injuries)||[])n+=INJ[j.id].hp||0;return n;}
function baseMaxHp(){return 100+5*coreLv('body')+4*subPts('vit');}
function maxHp(){return Math.max(20,Math.round((baseMaxHp()+injHp())*(runMods.glass?0.5:1)));}
function injDecks(id){return Math.max(2,INJ[id].base-Math.floor((subPts('vit')+subPts('resolve'))/3)-(perk('fielddress')?1:0));}
function giveInjury(cause){const P=player;if(!P.injuries)P.injuries=[];if(P.injuries.length>=4)return;const have=P.injuries.map(j=>j.id);
  let id=cause;if(!id||have.includes(id)){const L=['arm','ribs','ankle','concussion'].filter(k=>!have.includes(k));if(!L.length)return;id=L[rnd(L.length)];}
  P.injuries.push({id,left:injDecks(id)});refreshStats();if(P.hp>maxHp())P.hp=maxHp();say('injury: '+INJ[id].name.toLowerCase()+'. '+INJ[id].desc.toLowerCase());float(P.x,P.y-14,INJ[id].name,'#ff8a7a');sfx('crunch_bat');shake=Math.max(shake,5);}
function cureInjury(all){const P=player;if(!P.injuries||!P.injuries.length)return 0;if(all){const n=P.injuries.length;P.injuries=[];refreshStats();return n;}P.injuries.sort((a,b)=>b.left-a.left);const j=P.injuries.shift();refreshStats();say(INJ[j.id].name.toLowerCase()+' treated');return 1;}
function tickInjuries(){const P=player;if(!P||!P.injuries)return;for(const j of P.injuries)j.left--;const healed=P.injuries.filter(j=>j.left<=0);P.injuries=P.injuries.filter(j=>j.left>0);if(healed.length){refreshStats();setTimeout(()=>say('your '+healed.map(j=>INJ[j.id].name.toLowerCase()).join(' and ')+' healed up'),80);}}
function mindCd(){return Math.max(0.5,1-0.03*coreLv('mind')-0.04*subPts('mem'));}
function aimMul(){let a=Math.max(0.4,1-0.04*coreLv('mind')-0.05*subPts('dex'));for(const j of (player&&player.injuries)||[])a+=INJ[j.id].aim||0;return a;}
function melee(){const u=player.upg,mg=subPts('might');return {dmg:(1+u.knuck+S.meleeDmg)*(1+0.06*mg),kb:170*(1+0.4*u.weight)*(1+0.08*mg),range:18+5*u.haft,arc:1.1+0.3*u.arc,cd:0.55*(1-0.15*u.quick)};}

