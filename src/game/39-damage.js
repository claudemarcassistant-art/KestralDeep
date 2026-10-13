// ---------- damage ranges and glancing hits (v0.99, batch 3 request 17) ----------
// Every player attack rolls its base damage inside its weapon's range (DMG_VAR / DMG_CHAR in src/data/weapons.js) and
// one roll decides crit or glance (GLANCE_CFG in src/data/status.js), so the two never land together. Creature attacks on
// the player roll in hurtPlayer() through creatureHitRoll(). Trap, hazard and status damage stay fixed.
function dmgChar(kind){return DMG_CHAR[DMG_VAR[kind]||'reliable'];}
// a bell-shaped multiplier on [1-w, 1+w] with mean 1 (the average of two uniform draws)
function varRoll(w){return w?1+w*(Math.random()+Math.random()-1):1;}
function dmgVar(kind){return varRoll(dmgChar(kind).w);}
function isArmoured(e){const b=ET[e.type];return !!(b&&(b.armor||b.warden||GLANCE_CFG.armouredTypes.includes(e.type)))||e.boss!=null||!!e.mini;}
function glanceBase(){return Math.max(GLANCE_CFG.min,GLANCE_CFG.base-GLANCE_CFG.dex*subPts('dex')-GLANCE_CFG.perc*subPts('perc'));}
function glanceChance(e){return glanceBase()+(e&&isArmoured(e)?GLANCE_CFG.armoured:0)+(e&&e.kit&&e.kit.armor?LOADOUT_CFG.armorGlance[e.kit.armor]||0:0);}
// one roll for a player hit on creature e: {mul, crit, glance}; mul already holds the range roll and the crit or glance factor
function hitRoll(kind,cc,e,noGlance){const gc=noGlance?0:glanceChance(e),c=Math.min(cc||0,1-gc),u=Math.random(),crit=u<c,glance=!crit&&u>=1-gc;
  return {mul:dmgVar(kind)*(crit?2:glance?GLANCE_CFG.mul:1),crit,glance};}
function glanceFx(e){if(T-(e.glT||-9)<0.25)return;e.glT=T;float(e.x,e.y-6,'glance','#8e978b');sfx('tink');}
// creature hits on the player: the 85-115% range, then the glance roll
function glancePlayerChance(){const P=player,G=GLANCE_CFG.vsPlayer,set=P.arms[P.armSet];
  return G.base+Math.min(G.armorMax,(P.armor||0)*G.armorPer)+(P.blocking&&set.off==='shield'?G.shield:0);}
function creatureSrc(src){return !!src&&(!!(src.type&&ET[src.type])||src.p===false);}
// damage text for a weapon's base hit, "3-5", from its listed damage and its range width
const fmtD=v=>v>=10?''+Math.round(v):''+Math.round(v*10)/10;
function armBaseDmg(k){const A=ARM[k];if(!A)return null;if(A.melee)return {d:A.melee.dmg,n:1};const w=WPN[k];return w?{d:w.dmg,n:w.pellets||1}:null;}
function dmgRangeText(k,base){const b=base!=null?{d:base,n:1}:armBaseDmg(k);if(!b||!b.d)return '';const C=dmgChar(k);
  return 'damage '+(C.w?fmtD(b.d*(1-C.w))+'-'+fmtD(b.d*(1+C.w)):fmtD(b.d))+(b.n>1?' x'+b.n:'')+' ('+C.name+')';}
function armDesc(k){const A=ARM[k];if(!A)return '';const r=dmgRangeText(k);return A.desc+(r?' '+r[0].toUpperCase()+r.slice(1)+'.':'');}
// Workbench: a recipe that makes an armament (matched by name) shows its damage range
function recipeDmgText(r){const k=Object.keys(ARM).find(q=>ARM[q].name===r.name);const t=k?dmgRangeText(k):'';return t?' '+t[0].toUpperCase()+t.slice(1)+'.':'';}
