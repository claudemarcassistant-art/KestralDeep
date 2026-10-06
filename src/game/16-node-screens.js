// ---------- node screens ----------
function setupNode(type){
  const P=player,iv=P.inv;
  if(type==='rest'){nodeUI={title:'Rest bay',col:'#7fd08e',body:'A dry maintenance bay. The heater still works and the door locks from the inside. You have time for one thing.',options:[
    {label:'Sleep it off (heal to full)',ok:()=>P.hp<maxHp(),act:()=>{P.hp=maxHp();clearStatus();P.stam=maxStam();return 'You wake stiff but whole.';}},
    {label:'Patch your plating (+30 armor)',ok:()=>P.armor<50,act:()=>{P.armor=Math.min(50,P.armor+30);return 'You hammer the dents flat and strap it back on.';}},
    {label:'Sort the pack (+3 scrap, +1 powder, +1 cloth)',ok:()=>true,act:()=>{iv.scrap+=3;iv.powder++;iv.cloth++;return 'Buried under the junk, a few useful bits.';}}]};}
  else if(type==='merchant'){
    const pool=[
      ()=>{const g=randomGear();return {label:GEAR[g].name,cost:8,act:()=>{gainGear(g);return 'bought '+GEAR[g].name.toLowerCase();}};},
      ()=>({label:'Key',cost:3,act:()=>{iv.key++;return '+1 key';}}),
      ()=>({label:'Training chip',cost:10,act:()=>{learnSkill();return msgs.length?msgs[msgs.length-1].s:'chip read';}}),
      ()=>({label:'Rounds x15',cost:2,act:()=>{iv.rounds+=15;return '+15 rounds';}}),
      ()=>({label:'Shells x6',cost:3,act:()=>{iv.shells+=6;return '+6 shells';}}),
      ()=>({label:'Nails x30',cost:2,act:()=>{iv.nails+=30;return '+30 nails';}}),
      ()=>({label:'Bolts x4',cost:3,act:()=>{iv.bolts+=4;return '+4 bolts';}}),
      ()=>({label:'Battery',cost:3,act:()=>{iv.battery++;return '+1 battery';}}),
      ()=>({label:'Pipe',cost:3,act:()=>{iv.pipe++;return '+1 pipe';}}),
      ()=>({label:'Field dressing (+30 hp)',cost:3,act:()=>{P.hp=Math.min(maxHp(),P.hp+30);return '+30 hp';}}),
      ()=>({label:'Pipe charge',cost:4,act:()=>{iv.charge++;return '+1 pipe charge';}})
    ];
    const offers=[pool[1](),pool[0]()];const rest=pool.slice(2).sort(()=>Math.random()-.5).slice(0,4).map(f=>f());offers.push(...rest);
    nodeUI={title:'The scrapper',col:AMBER,merchant:true,body:'A figure in a patched hazard suit sits behind a crate of salvage. "Scrap only. No questions."',
      options:[...offers.map(o=>({label:o.label,cost:o.cost,ok:()=>iv.scrap>=price(o.cost),act:()=>{iv.scrap-=price(o.cost);o.sold=true;return o.act();},ref:o})),{label:'Leave',leave:true,ok:()=>true}]};}
  else{
    const EV=[
      {body:'A locker, welded shut, hums faintly. Something inside is still powered.',options:[
        {label:'Cut it open (costs 1 battery)',ok:()=>iv.battery>=1,act:()=>{iv.battery--;const g=randomGear();gainGear(g);return 'Inside: '+GEAR[g].name.toLowerCase()+'.';}},
        {label:'Pry it by hand (lose 15 hp)',ok:()=>P.hp>15,act:()=>{P.hp-=15;if(Math.random()<.6){const g=randomGear();gainGear(g);return 'Your hands bleed, but it gives. Inside: '+GEAR[g].name.toLowerCase()+'.';}iv.scrap+=2;return 'It gives, eventually. Only 2 scrap inside.';}},
        {label:'Leave it',ok:()=>true,act:()=>'You leave it humming.'}]},
      {body:'A crew terminal still has power. Routing tables for the lower decks scroll past.',options:[
        {label:'Download the routes',ok:()=>true,act:()=>{revealNear(2);return 'The next two lift junctions are mapped.';}},
        {label:'Strip it for parts (+2 battery, +1 scrap)',ok:()=>true,act:()=>{iv.battery+=2;iv.scrap++;return 'The screen dies as you pull the cells.';}}]},
      {body:'Something heavy moves in a flooded stairwell beside the lift doors.',options:[
        {label:'Drop a charge into it (1 charge)',ok:()=>iv.charge>=1,act:()=>{iv.charge--;iv.rounds+=12;iv.key++;return 'A muffled thump. Debris floats up: 12 rounds and a key.';}},
        {label:'Wade past quietly',ok:()=>true,act:()=>{if(Math.random()<.5){P.hp=Math.max(1,P.hp-20);return 'It catches your leg on the way. -20 hp.';}return 'It never notices you.';}}]},
      {body:'A survivor cache, marked with a painted tally: 41. Someone meant to come back for it.',options:[
        {label:'Take everything',ok:()=>true,act:()=>{iv.scrap+=3;iv.powder+=2;iv.rounds+=10;iv.cloth+=2;nextMods.enemyMul=1.4;return 'You fill your pack. Somewhere below, something heard you. The next deck will be busier.';}},
        {label:'Take only what you need',ok:()=>true,act:()=>{P.hp=Math.min(maxHp(),P.hp+20);iv.key++;return 'A dressing and a key. You leave the rest.';}}]},
      {body:'A training console with a cracked screen blinks: CERTIFICATION INCOMPLETE.',options:[
        {label:'Run the program (lose 10 hp)',ok:()=>P.hp>10,act:()=>{P.hp-=10;learnSkill();return msgs.length?msgs[msgs.length-1].s:'Something new settles in.';}},
        {label:'Leave it blinking',ok:()=>true,act:()=>'You leave it.'}]}
    ];
    const e=EV[rnd(EV.length)];nodeUI={title:'Signal',col:'#c9a8ff',body:e.body,options:e.options};
  }
  nodeUI.result=null;nodeUI.note='';
}
function nodeChoose(i){
  const o=nodeUI.options[i];if(!o)return;
  if(o.leave){if(nodeUI.transit){const n=pendingNode;pendingNode=null;nodeUI=null;if(transitAfter&&transitAfter.type==='ambush'){transitAfter=null;pendingNode=n;startStop('ambush');return;}enterNode(n);}else openRoute();return;}
  if(nodeUI.transit&&!o.ok()){sfx('deny');return;}
  if(nodeUI.transit){const r=o.act();if(r===null||state!=='node')return;sfx('craft');nodeUI.result=r;nodeUI.options=[{label:'Ride on',leave:true,ok:()=>true}];nodeSel=0;return;}
  if(o.ref&&o.ref.sold)return;
  if(!o.ok()){sfx('click');return;}
  const r=o.act();sfx('craft');
  if(nodeUI.merchant){nodeUI.note=r;return;}
  nodeUI.result=r;nodeUI.options=[{label:'Ride on',leave:true,ok:()=>true}];nodeSel=0;
}

