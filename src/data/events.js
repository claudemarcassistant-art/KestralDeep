// Between-deck events and transit stop text.
const ROOMDESC={merchant:'a lit landing with humming vending machines',gambler:'a landing where someone sits cross-legged, rolling bones',quarters:'an abandoned crew quarters, door ajar',arcade:'a dim landing full of glowing cabinets',camp:'a landing where someone has set up camp'};
const TEXTEV=[
  {title:'Stalled between floors',body:'The cab jolts and hangs in the dark shaft. There is a maintenance hatch above you, its latch rusted half open.',opts:[
    {label:'Climb through the hatch',act:()=>{if(Math.random()<0.6){player.inv.scrap+=3;player.inv.powder++;return 'On the roof you find a dead mechanic\'s kit. 3 scrap and some powder. The cab starts moving again.';}player.hp=Math.max(1,player.hp-8);return 'The latch gives way and you drop back into the cab hard. The lift starts moving on its own.';}},
    {label:'Wait it out',act:()=>'An hour, maybe more. Then the cables take the strain and you sink on.'}]},
  {title:'A voice on the intercom',body:'"Anyone riding? Leave a battery in the call box and I will tell you what is below." The voice sounds tired, and very far away.',opts:[
    {label:'Leave a battery',ok:()=>player.inv.battery>0,act:()=>{player.inv.battery--;revealNear(4);return '"Thank you." The next few stops appear on your route map.';}},
    {label:'Stay quiet',act:()=>'The voice asks again, then gives up.'}]},
  {title:'Emergency locker',body:'A sealed emergency locker is bolted to the cab wall, stencilled FOR CREW USE ONLY.',opts:[
    {label:'Pry it open with a crowbar',ok:()=>player.has.crowbar,act:()=>{player.inv.medpatch++;player.inv.flare++;return 'A med patch and a flare, still in their wrappers.';}},
    {label:'Use a key',ok:()=>player.inv.key>0,act:()=>{player.inv.key--;const g=randomGear();gainGear(g);return 'Inside: '+GEAR[g].name.toLowerCase()+'.';}},
    {label:'Leave it',act:()=>'You leave it sealed.'}]},
  {title:'The lights go out',body:'The cab goes black. Something drags itself slowly across the roof, stops, and listens.',opts:[
    {label:'Hold perfectly still',act:()=>'After a long time, it moves on.'},
    {label:'Bang on the roof',act:()=>{transitAfter={type:'ambush'};return 'It stops. Then the whole cab shakes as it drops onto the rail.';}}]},
  {title:'A stowaway',body:'A crew member is curled in the corner of the cab, clutching a bag. "Please. I will trade. I just want off at the next stop."',opts:[
    {label:'Trade 2 cloth for food',ok:()=>player.inv.cloth>=2,act:()=>{player.inv.cloth-=2;for(let k=0;k<2;k++){const f=randFood();player.food[f]=(player.food[f]||0)+1;}return 'Two wrapped meals. They thank you and stare at the doors.';}},
    {label:'Trade 3 scrap for raw ingredients',ok:()=>player.inv.scrap>=3,act:()=>{player.inv.scrap-=3;for(let k=0;k<3;k++){const r=randRaw();player.raw[r]=(player.raw[r]||0)+1;}return 'Flour, syrup, whatever they had. They seem relieved.';}},
    {label:'Leave them be',act:()=>'They get off at the next landing without a word.'}]},
  {title:'Cable strain',body:'A sharp twang overhead and the cab lurches. The brake is slipping. You could jettison some weight.',opts:[
    {label:'Dump 3 scrap down the shaft',ok:()=>player.inv.scrap>=3,act:()=>{player.inv.scrap-=3;return 'The cab steadies. The scrap clatters away into the dark.';}},
    {label:'Brace and ride it out',act:()=>{player.hp=Math.max(1,player.hp-6);return 'The cab slams to a stop below and you are thrown against the wall.';}}]}];
// Scenario lift events (v1.01): a TEXTEV with scen only comes up in that sector scenario (SCENARIOS[..].events weights them).
TEXTEV.push(
  {id:'quarantine',scen:'outbreak',title:'Quarantine checkpoint',body:'The cab stops at a sealed landing striped in biohazard yellow. A recorded voice asks all passengers to step into the decontamination spray. Beside the arch, an unattended supply shelf.',opts:[
    {label:'Step into the spray',act:()=>{player.st.psn=0;player.st.rad=0;player.hp=Math.min(maxHp(),player.hp+6);return 'It stings, then it is over. You feel cleaner than you have in days.';}},
    {label:'Take an antitoxin from the shelf',act:()=>{player.inv.antitox++;return 'One antitoxin, still sealed. The voice reminds you that theft is logged.';}},
    {label:'Pry open the sample fridge (crowbar)',ok:()=>player.has.crowbar,act:()=>{if(Math.random()<0.5){player.herbs.bitterwort=(player.herbs.bitterwort||0)+2;player.herbs.redroot=(player.herbs.redroot||0)+2;return 'Labelled samples: two bitterwort, two redroot.';}transitAfter={type:'ambush'};return 'Something in the fridge was not dead. It follows you back into the cab.';}}]},
  {id:'frost',scen:'coldsnap',title:'Frost on the cables',body:'The cab slows to a crawl. Ice has built up on the cables and the brake housing, and the motor whines against it.',opts:[
    {label:'Climb up and chip it clear',act:()=>{player.hp=Math.max(1,player.hp-4);player.inv.scrap+=2;return 'Numb fingers and a cut palm, but the cab picks up speed. You pocket a few loose fittings.';}},
    {label:'Burn it off with fuel',ok:()=>player.inv.fuel>=5,act:()=>{player.inv.fuel-=5;return 'The ice sloughs off in a hiss of steam. A smooth ride from here.';}},
    {label:'Wait in the cold',act:()=>'It takes an hour. You stop feeling your feet somewhere along the way.'}]},
  {id:'thaw',scen:'coldsnap',title:'A frozen crew member',body:'A crew member sits frozen solid against the cab wall, still in a parka, a sealed pouch clutched to their chest.',opts:[
    {label:'Work the pouch loose',act:()=>{player.inv.cloth+=2;player.herbs.emberleaf=(player.herbs.emberleaf||0)+2;return 'Two strips of insulating cloth, and two emberleaf, still faintly warm.';}},
    {label:'Take the parka',act:()=>{player.inv.cloth+=3;return 'Three good lengths of cloth. They will not need it now.';}},
    {label:'Leave them be',act:()=>'You give them the corner and ride on.'}]});
