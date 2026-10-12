// ---------- sector scenarios (v1.01, batch 3 request 16) ----------
// One scenario per sector, rolled in newSector0() before the sector map, in its own key under the sector's seeded
// scope (['sector',sec,'scen'], so the map's own stream does not shift) and saved as route.scen (a missing one means normal). The first sector of a
// run is always normal. Tables: SCENARIOS (src/data/scenarios.js). The generation hooks below read scen(), which is the
// sector's scenario in a run and the test lift's Scenario option (testScen) on a test deck.
let testScen=null;
function scenId(){if(arcadeMode)return 'normal';if(testMode)return testScen&&SCENARIOS[testScen]?testScen:'normal';const s=route&&route.scen;return SCENARIOS[s]?s:'normal';}
function scen(){return SCENARIOS[scenId()];}
const scenName=id=>(SCENARIOS[id||scenId()]||SCENARIOS.normal).name;
function scenScore(){return scen().score||1;}
// x1.3 -> "x1.3"; no multiplier -> ''
function scenMulText(id){const m=(SCENARIOS[id||scenId()]||SCENARIOS.normal).score||1;return m!==1?'x'+m:'';}
// a wpick list with the scenario's multipliers (mul) and additions (add) applied; returns the same list when untouched
function scenW(list,mul,add){if(!mul&&!add)return list;const L=list.map(([k,w])=>[k,w*(mul&&mul[k]!=null?mul[k]:1)+(add&&add[k]||0)]);
  if(add)for(const k in add)if(!list.some(q=>q[0]===k))L.push([k,add[k]]);return L;}
// creature weights: types multiply, typesAdd add from addFrom depth (so guards can come in from depth 2)
function scenTypes(list){const S=scen();if(!S.types&&!S.typesAdd)return list;return scenW(list,S.types,depth>=(S.addFrom||1)?S.typesAdd:null);}
function rollScenario(sec){if(sec<=(route.startSec||0))return 'normal';return wpick(SCEN_IDS.map(k=>[k,SCENARIOS[k].weight||0]));}
function announceScenario(){const id=scenId();if(id==='normal')return;setTimeout(()=>say('scenario: '+scenName(id).toLowerCase()+(scenMulText(id)?'. score '+scenMulText(id):'')),1600);}
// lift ride text events: scenario-only ones join in under their scenario, weighted by S.events
function scenTextEv(){const S=scen(),id=scenId(),L=TEXTEV.map((e,i)=>[i,e.scen&&e.scen!==id?0:(S.events&&e.id&&S.events[e.id]!=null?S.events[e.id]:1)]);
  return wpick(L);}
// populate(): guards on nearly every deck in a crackdown. One cheap creature becomes a guard, so the count holds.
function scenGuardDeck(startR){const S=scen();if(!S.guardDeck||depth<(S.guardFrom||4)||Math.random()>=S.guardDeck)return;
  if(enemies.some(e=>ET[e.type].guard))return;const cheap=enemies.filter(e=>['husk','crawler','slug','wasp','snail'].includes(e.type)&&!e.arena);
  if(!cheap.length)return;const e=cheap[rnd(cheap.length)],g=mkEnemy('guard',e.x,e.y);enemies[enemies.indexOf(e)]=g;}
// populate(): blackout decks drop extra light sources
function scenLightLoot(startR){const S=scen();if(!S.lightLoot||Math.random()>=S.lightLoot)return;const r=randomRoom();if(!r||r===startR)return;
  if(Math.random()<0.65)addItem(r,'tool',{tool:'glowstick'});else addItem(r,'gear',{gear:'lantern'});}
// genLevel(): a cold snap freezes over some standing water (shallow pools, so nothing is sealed in)
function scenFreeze(){const S=scen();if(!S.freeze||Math.random()>=S.freeze)return;const w=[];for(let i=0;i<MW*MH;i++)if(map[i]===0&&liq[i]>=1&&liq[i]<=2)w.push(i);if(!w.length)return;
  const n=Math.min(w.length,aN(2+rnd(3)));for(let k=0;k<n;k++){const i=w[rnd(w.length)];freezeAround((i%MW)*TS+6,((i/MW)|0)*TS+6,30);}}
// genBreaker(): a blackout puts a breaker on most decks; scenBreakerOff() (end of enterLevel()) starts some thrown
function scenBreaker(){const S=scen();return !!S.breaker&&Math.random()<S.breaker;}
function scenBreakerOff(){const S=scen(),b=fixtures.find(f=>f.kind==='breaker');if(!S.breakerOff||!b||Math.random()>=S.breakerOff)return;
  powerOff=true;powerPrev=cond.light;cond.light='dark';for(const t of trips){t.wasOn=t.on;t.on=false;}for(const c of cables)c.st='idle';
  setTimeout(()=>say('the deck is running dark. the breaker has been thrown somewhere'),900);}
// the sector map header and Run stats line
function scenLine(id){id=id||scenId();return 'scenario: '+scenName(id).toLowerCase()+(scenMulText(id)?'  (score '+scenMulText(id)+')':'');}
