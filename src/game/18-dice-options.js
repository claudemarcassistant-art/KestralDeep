// ---- Hands and Bones: roshambo decides who attacks, dice decide how hard
function startDice(bet){if(player.inv.scrap<bet)return;player.inv.scrap-=bet;choiceUI=null;
  diceUI={bet,hp:[12,12],phase:'roll1',r1:[0,0],r2:[0,0],pick:-1,npc:-1,msg:'Both of you roll your bones.',t:0,hunch:-1};diceRoll1();}
const d6=()=>1+rnd(6),HANDS=['rock','paper','scissors'];
function diceRoll1(){const d=diceUI;d.r1=[d6()+d6(),d6()+d6()];d.phase='rps';d.pick=-1;d.npc=rnd(3);d.hunch=Math.random()<0.5?(Math.random()<0.65?d.npc:rnd(3)):-1;
  d.msg='You rolled '+d.r1[0]+', she rolled '+d.r1[1]+'. Throw a hand: 1 rock, 2 paper, 3 scissors.';sfx('click');}
function diceThrow(h){const d=diceUI;if(d.phase!=='rps')return;d.pick=h;const n=d.npc,win=(h-n+3)%3;d.r2=[d6()+d6(),d6()+d6()];const a0=d.r1[0]+d.r2[0],a1=d.r1[1]+d.r2[1];
  if(win===0){d.hp[0]--;d.hp[1]--;d.msg='Both threw '+HANDS[h]+'. Standoff: both lose 1.';}
  else if(win===1){const dmg=Math.max(1,a0-a1);d.hp[1]-=dmg;d.msg=HANDS[h]+' beats '+HANDS[n]+'. You attack '+a0+' against her guard '+a1+': she loses '+dmg+'.';}
  else{const dmg=Math.max(1,a1-a0);d.hp[0]-=dmg;d.msg=HANDS[n]+' beats '+HANDS[h]+'. She attacks '+a1+' against your guard '+a0+': you lose '+dmg+'.';}
  d.phase='result';sfx('thud');
  if(d.hp[0]<=0||d.hp[1]<=0){d.phase='over';const won=d.hp[1]<=0&&d.hp[0]>0;if(won){player.inv.scrap+=d.bet*2;d.msg+=' You win '+d.bet*2+' scrap.';sfx('hackwin');}else{d.msg+=d.hp[0]<=0&&d.hp[1]<=0?' Nobody wins. Your stake is gone.':' She takes the pot.';sfx('zap');}}}
function diceNext(){const d=diceUI;if(d.phase==='result')diceRoll1();else if(d.phase==='over')diceUI=null;}
function drawDie(x,y,v){F('#e8e0d0',x,y,11,11);F('#15110a',x,y+10,11,1);const P={1:[[5,5]],2:[[2,2],[8,8]],3:[[2,2],[5,5],[8,8]],4:[[2,2],[8,2],[2,8],[8,8]],5:[[2,2],[8,2],[5,5],[2,8],[8,8]],6:[[2,2],[8,2],[2,5],[8,5],[2,8],[8,8]]};for(const [a,b] of P[v]||[])F('#1a1410',x+a,y+b,2,2);}
function drawDiceUI(){const d=diceUI,pw=260,ph=150,px=(W-pw)>>1,py=(H-ph)>>1;
  F('rgba(4,5,6,0.65)',0,0,W,H);box(px,py,pw,ph,'#0a0c0b','#3a2a4a');F('#c9a8ff',px,py,pw,2);txt('Hands and Bones',px+10,py+7,'#c9a8ff');txt('stake '+d.bet+' scrap',px+pw-10,py+7,'#8e978b','right');
  [['You',0,px+20],['The sensitive',1,px+pw/2+10]].forEach(([n,i,x])=>{txt(n,x,py+22,i?'#c9a8ff':AMBER);for(let k=0;k<12;k++)F(k<d.hp[i]?(i?'#c9a8ff':AMBER):'#1f2524',x+k*8,py+33,6,4);
    txt('first '+d.r1[i],x,py+44,'#b9c0b3');if(d.phase!=='rps')txt('second '+d.r2[i],x+50,py+44,'#b9c0b3');
    if(d.phase!=='rps'){const hi=i?d.npc:d.pick;if(hi>=0)txt(HANDS[hi],x,py+56,'#e3e6dc');}});
  const x0=px+pw/2-26;drawDie(x0,py+72,Math.min(6,Math.max(1,Math.ceil(d.r1[0]/2))));drawDie(x0+15,py+72,Math.min(6,Math.max(1,d.r1[0]-Math.ceil(d.r1[0]/2))));
  drawDie(x0+32,py+72,Math.min(6,Math.max(1,Math.ceil(d.r1[1]/2))));drawDie(x0+47,py+72,Math.min(6,Math.max(1,d.r1[1]-Math.ceil(d.r1[1]/2))));
  wrap(d.msg,px+10,py+90,pw-20,10,'#e8dcb0');
  if(d.phase==='rps'){if(d.hunch>=0)txt('you get a strange feeling she will throw '+HANDS[d.hunch],px+10,py+ph-26,'#8a7ab0');
    HANDS.forEach((h,i)=>{const bx=px+30+i*70,by=py+ph-14;ui(bx,by-2,60,12,{click:()=>diceThrow(i)});box(bx,by-2,60,12,'#141917','#3a423f');txt((i+1)+' '+h,bx+30,by,'#e3e6dc','center');});}
  else{const lab=d.phase==='over'?'Enter or click to leave the table':'Enter or click for the next round';ui(px,py+ph-16,pw,14,{click:()=>diceNext()});txt(lab,px+pw/2,py+ph-12,'#8e978b','center');}
  txt('win the hand to attack: first + second roll against their total',px+pw/2,py+ph-38,'#4f5a55','center');}
const OPTS={pauseMenu:false};try{Object.assign(OPTS,JSON.parse(localStorage.getItem('kd_opts')||'{}'));}catch(e){}
function saveOpts(){try{localStorage.setItem('kd_opts',JSON.stringify(OPTS));}catch(e){}}
const paused=()=>(menuOpen&&(OPTS.pauseMenu||state!=='play'))||mapOpen||!!hackUI||!!vendUI||!!spawnUI||!!arcadeUI||!!deckUI||!!grindUI||!!choiceUI||!!diceUI;
const spawnOpts=()=>[...BEASTS.map(t=>({kind:'spawn',t})),{kind:'loc'},{kind:'alert'},{kind:'count'},{kind:'waves'},{kind:'clear'},{kind:'heal'},{kind:'close'}];
function spawnChoose(i){const o=spawnOpts()[i],u=spawnUI;if(!o)return;
  if(o.kind==='close'){spawnUI=null;return;}
  if(o.kind==='loc'){u.loc=u.loc==='arena'?'near':'arena';sfx('click');return;}
  if(o.kind==='alert'){u.alert=!u.alert;sfx('click');return;}
  if(o.kind==='count'){u.count=u.count===1?3:u.count===3?5:1;sfx('click');return;}
  if(o.kind==='clear'){let n=0;for(const e of enemies)if(e.testSpawn){e.dead=true;n++;for(let k=0;k<6;k++)parts.push({x:e.x,y:e.y,vx:rr(-40,40),vy:rr(-40,40),t:0.4,m:0.4,c:'#c9a8ff',s:1});}
    enemies=enemies.filter(e=>!e.dead);u.note='cleared '+n+' test creature'+(n===1?'':'s');sfx('craft');return;}
  if(o.kind==='waves'){waves={phase:'warn',t:3,n:3,wave:0,trigT:0,trigPct:0,chk:0,pct:0};u.note='wave event starting';spawnUI=null;return;}
  if(o.kind==='heal'){player.hp=100;player.armor=50;player.stam=maxStam();clearStatus();u.note='health, armor and stamina restored';sfx('stim');return;}
  let made=0;
  for(let k=0;k<u.count;k++){let x=0,y=0,ok=false;
    for(let t=0;t<30&&!ok;t++){if(u.loc==='near'){const a=player.ang+rr(-0.7,0.7),d=rr(38,64);x=player.x+Math.cos(a)*d;y=player.y+Math.sin(a)*d;}
      else{x=(10+rr(-3,3))*TS+6;y=(38+rr(-2,2))*TS+6;}ok=!blocked(x,y,5)&&hasLOS(u.loc==='near'?player.x:10*TS+6,u.loc==='near'?player.y:38*TS+6,x,y);}
    if(ET[o.t].aquatic){const cx=u.loc==='near'?player.x:15*TS,cy=u.loc==='near'?player.y:40*TS,w=[];
      for(let yy=0;yy<MH;yy++)for(let xx=0;xx<MW;xx++){const i=yy*MW+xx;if(map[i]===0&&liq[i]>=3&&Math.hypot(xx*TS+6-cx,yy*TS+6-cy)<110)w.push(i);}
      if(!w.length)break;const i=w[rnd(w.length)];x=(i%MW)*TS+6;y=((i/MW)|0)*TS+6;ok=true;}
    if(!ok)continue;const e=mkEnemy(o.t,x,y);e.alert=u.alert;e.testSpawn=true;enemies.push(e);made++;
    for(let q=0;q<10;q++)parts.push({x,y,vx:rr(-40,40),vy:rr(-40,40),t:0.4,m:0.4,c:'#c9a8ff',s:1});}
  sfx('learn');u.note=made?'released '+made+' '+BEASTINFO[o.t].name.toLowerCase()+(made>1?'s':'')+(u.loc==='near'?' near you':' in the arena'):'no room to place it there';}
function drawSpawnUI(){
  const u=spawnUI,O=spawnOpts(),pw=280,rh=10,ph=40+O.length*rh,px=(W-pw)>>1,py=Math.max(4,(H-ph)>>1);
  F('rgba(4,5,6,0.6)',0,0,W,H);box(px,py,pw,ph,'#0a0c0b','#2a2f2d');F('#c9a8ff',px,py,pw,2);
  txt('Creature console',px+10,py+7,'#c9a8ff');txt('test range only',px+pw-10,py+7,'#5d655f','right');
  u.sel=Math.max(0,Math.min(u.sel,O.length-1));
  O.forEach((o,i)=>{const yy=py+18+i*rh+(i>=BEASTS.length?3:0),sel=i===u.sel;
    const hov=ui(px+6,yy-2,pw-12,rh,{click:()=>{u.sel=i;spawnChoose(i);}});if(hov&&mouse.moved)u.sel=i;
    if(sel){F('#141917',px+6,yy-2,pw-12,rh);F('#c9a8ff',px+6,yy-2,2,rh);}
    let l='',r='',rc='#8e978b';
    if(o.kind==='spawn'){l=BEASTINFO[o.t].name;F(ET[o.t].col,px+14,yy+1,5,5);r='release';rc='#c9a8ff';const n=enemies.filter(e=>e.testSpawn&&e.type===o.t).length;if(n)r=n+' out   release';}
    else if(o.kind==='loc'){l='Where';r=u.loc==='arena'?'arena pen':'in front of you';}
    else if(o.kind==='alert'){l='Behavior';r=u.alert?'hunting you':'dormant';}
    else if(o.kind==='count'){l='How many';r='x'+u.count;}
    else if(o.kind==='clear'){l='Clear all test creatures';}
    else if(o.kind==='heal'){l='Refill health, armor, stamina';}
    else if(o.kind==='waves'){l='Start a wave event';}
    else l='Close';
    txt(l,px+(o.kind==='spawn'?24:14),yy,sel?'#e3e6dc':'#b9c0b3');if(r)txt(r,px+pw-12,yy,rc,'right');});
  txt(u.note||'W S or click   Enter to choose   ESC to close',px+10,py+ph-12,u.note?'#9fcf9a':'#4f5a55');
}
addEventListener('keydown',e=>{
  if(['Space','Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  if(!K[e.code])onPress(e.code);K[e.code]=true;
});
addEventListener('keyup',e=>{K[e.code]=false;});
addEventListener('blur',()=>{for(const k in K)K[k]=false;mouse.l=false;mouse.r=false;});
cv.addEventListener('contextmenu',e=>e.preventDefault());
