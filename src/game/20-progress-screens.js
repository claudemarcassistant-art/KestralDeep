let fdSel=0;
let fdMode=0;
let cookOnly=false;
function foodList(){if(fdMode===1)return COOK.filter(c=>!cookOnly||cookOk(c)).map(c=>({cook:c}));const L=Object.keys(FOOD).filter(k=>player.food[k]>0).map(k=>({k}));if(player.inv.emetic>0)L.push({emetic:true});return L;}
function useFoodRow(r){if(r.cook)return cook(r.cook);if(r.emetic){if(player.sat<=0&&!player.buffs.length){say('nothing to bring up');sfx('click');return;}player.inv.emetic--;vomit('you drink the syrup. that was unpleasant');return;}eatFood(r.k);}
function drawFood(x,y,w,h){
  const P=player,L=foodList();fdSel=Math.max(0,Math.min(fdSel,L.length-1));const lx=x+8,lw=180;
  ['Pouch','Cook'].forEach((n,i)=>{const bx=lx+i*44,act=fdMode===i;ui(bx,y+2,40,11,{click:()=>{fdMode=i;fdSel=0;sfx('click');}});F(act?'#1c2220':'#0a0d0c',bx,y+2,40,11);F(act?AMBER:'#2a302e',bx,y+12,40,1);txt(n,bx+20,y+4,act?AMBER:'#8e978b','center');});
  txt(fdMode?'A D switch  R cook':'A D switch  R eat',lx+lw,y+4,'#3f4642','right');
  if(fdMode===1){{const fh=ui(lx-2,y+15,lw+4,11,{click:()=>{cookOnly=!cookOnly;fdSel=0;sfx('click');}});txt('X  only cookable: '+(cookOnly?'on':'off'),lx,y+17,cookOnly?AMBER:fh?'#c9cfc2':'#8e978b');}
    if(!L.length)wrap('Nothing you can cook with what you have. Turn the filter off to see every recipe.',lx,y+31,lw,9,'#5d655f');
    L.forEach((r,i)=>{const c=r.cook,f=FOOD[c.out],yy=y+30+i*10,sel=i===fdSel,ok=cookOk(c);const hov=ui(lx-2,yy-2,lw+4,10,{click:()=>{fdSel=i;cook(c);}});if(hov&&mouse.moved)fdSel=i;
      if(sel){F('#1c2220',lx-2,yy-2,lw+4,10);F(AMBER,lx-2,yy-2,2,10);}F(f.col,lx+2,yy,3,5);txt(f.name,lx+8,yy,ok?'#e3e6dc':'#6f7a6a');txt('x'+(P.food[c.out]||0),lx+lw,yy,'#5d655f','right');});
    const c=L[fdSel]&&L[fdSel].cook;if(c){const f=FOOD[c.out];F('#1f2524',lx,y+133,lw,1);txt(f.name,lx,y+137,AMBER);txt(f.sat+' sat  /  '+f.lv+' deck'+(f.lv>1?'s':''),lx+lw,y+137,'#8e978b','right');
      const parts=Object.entries(c.need).map(([k,v])=>v+' '+RAW[k].name.toLowerCase());if(c.water)parts.push(c.water+' swig of water');wrap(f.desc+' Needs '+parts.join(', ')+'.',lx,y+148,lw,9,cookOk(c)?'#9fcf9a':'#b9c0b3');}
    const sx=x+200,sw=w-208;F('#1f2524',x+192,y+4,1,h-10);txt('Raw ingredients',sx,y+4,AMBER);let yy=y+17;
    for(const k in RAW){const n=P.raw[k]||0;txt(RAW[k].name,sx,yy,n?'#c9cfc2':'#3f4642');txt(''+n,sx+sw,yy,n?'#e3e6dc':'#3f4642','right');yy+=10;}
    txt('Flask water: '+(P.flask.kind==='water'?P.flask.n:0)+' swig'+((P.flask.kind==='water'&&P.flask.n===1)?'':'s'),sx,yy+4,'#6fb3c3');
    const r2=L[fdSel]&&L[fdSel].cook;if(r2){const k0=Object.keys(r2.need)[0];wrap(RAW[k0].name+': '+RAW[k0].where+'.',sx,yy+16,sw,9,'#5d655f');}
    return;}
  if(!L.length)wrap('Empty. Food turns up in break rooms, greenhouses, lockers and chests.',lx,y+18,lw,10,'#5d655f');
  L.forEach((r,i)=>{const yy=y+17+i*12,sel=i===fdSel;const hov=ui(lx-2,yy-2,lw+4,12,{click:()=>{fdSel=i;useFoodRow(r);}});if(hov&&mouse.moved)fdSel=i;
    if(sel){F('#1c2220',lx-2,yy-2,lw+4,12);F(AMBER,lx-2,yy-2,2,12);}
    if(r.emetic){txt('Emetic syrup x'+P.inv.emetic,lx+6,yy,'#b8c060');txt('vomit',lx+lw,yy,'#6a726c','right');return;}
    const f=FOOD[r.k],full=P.sat+f.sat>100;F(f.col,lx+2,yy+1,3,5);txt(f.name+' x'+P.food[r.k],lx+8,yy,full?'#5d655f':'#e3e6dc');txt(f.sat+' sat',lx+lw,yy,full?'#6a4a40':'#8e978b','right');});
  const r=L[fdSel];F('#1f2524',lx,y+120,lw,1);
  if(r&&!r.emetic){const f=FOOD[r.k];txt(f.name,lx,y+125,AMBER);wrap(f.desc+' Lasts '+f.lv+' deck'+(f.lv>1?'s':'')+'.',lx,y+136,lw,9,'#b9c0b3');}
  else if(r)wrap('Empties your stomach, ends every food buff and costs 4 health.',lx,y+125,lw,9,'#b9c0b3');
  {const by=y+h-26,need=foodNeed(),fx=P.foodXp||0;F('#1f2524',lx,by-4,lw,1);txt('food level '+(P.foodLv||0),lx,by,'#e8c070');txt(P.ghost>0?'ghost '+Math.ceil(P.ghost):'',lx+lw,by,'#dfe8ff','right');
    txt(Math.floor(fx)+' / '+need+' xp',lx,by+10,'#8e978b');F('#141817',lx,by+20,lw,4);F('#e8c070',lx,by+20,Math.round(lw*fx/need),4);}
  const sx=x+200,sw=w-208;F('#1f2524',x+192,y+4,1,h-10);
  txt('Satiety',sx,y+4,AMBER);txt(Math.round(P.sat)+' / 100',sx+sw,y+4,'#c9cfc2','right');
  F('#141817',sx,y+16,sw,5);F('#c8a060',sx,y+16,Math.round(sw*P.sat/100),5);
  wrap('Eating earns food xp, cooked dishes half again. Each food level heals you and adds ghost health: it soaks hits after armor and never heals.',sx,y+26,sw,9,'#6f7a6a');
  txt('Active buffs',sx,y+72,AMBER);
  if(!P.buffs.length)txt('none',sx,y+84,'#3f4642');
  P.buffs.forEach((b,i)=>{const f=FOOD[b.id],yy=y+84+i*10;if(yy>y+h-10)return;txt(f.name,sx,yy,'#c9cfc2');txt(b.lv+' deck'+(b.lv>1?'s':''),sx+sw,yy,'#8e978b','right');});
}
let skSel=0,bxSel=0,bxScroll=0,bestiary=null;
let progMode=0,apSel=0;
function runStat(k){const P=player;return ((P.rs&&P.rs[k])||0)+(LVLSTAT.includes(k)&&lvl?(lvl[k]||0):0);}
function apTrade(t){const P=player;if((P.ap||0)<t.cost||(t.ok&&!t.ok())){sfx('deny');return;}P.ap-=t.cost;const r=t.act();sfx('craft');say('traded '+t.cost+' points for '+r);}
let achT=0;
function checkAch(dt){const P=player;if(!P||!P.rs||testMode&&!testDeck)return;achT-=dt;if(achT>0)return;achT=0.5;P.rs.maxCombo=Math.max(P.rs.maxCombo||0,Math.floor(P.combo||0));
  for(const a of ACH){if(P.ach[a.id])continue;if(a.test()){P.ach[a.id]=true;if(!META.ach[a.id]){META.ach[a.id]=true;saveMeta();}P.ap=(P.ap||0)+a.pts;say('achievement: '+a.name.toLowerCase()+'  (+'+a.pts+' points, spend them in Progress)');float(P.x,P.y-16,a.name,'#ffe070');sfx('hackwin');}}}
function drawProgressTab(x,y,w,h){['Bestiary','Run stats','Achievements'].forEach((n,i)=>{const bx=x+8+i*84,act=progMode===i;ui(bx,y+2,80,11,{click:()=>{progMode=i;sfx('click');}});F(act?'#1c2220':'#0a0d0c',bx,y+2,80,11);F(act?AMBER:'#2a302e',bx,y+12,80,1);txt(n,bx+40,y+4,act?AMBER:'#8e978b','center');});
  txt('A D switch view',x+w-8,y+4,'#3f4642','right');if(progMode===0)return drawBestiary(x,y+14,w,h-14);if(progMode===1)return drawRunStats(x,y+14,w,h-14);drawAch(x,y+14,w,h-14);}
function drawRunStats(x,y,w,h){const P=player,R=P.rs||{},rows=[
  ['Deepest deck',depth],['Creatures taken out',runStat('kills')],['Damage dealt',Math.round(R.dealt||0)],['Damage taken',Math.round(runStat('dmg'))],['Critical hits',R.crits||0],['Best combo',Math.max(R.maxCombo||0,Math.floor(P.combo||0))],
  ['Items picked up',runStat('items')],['Chests opened',runStat('chests')+runStat('rare')],['Secrets found',runStat('secrets')],['Hacks pulled off',runStat('hacks')],['Doors forced',runStat('doors')],
  ['Dishes cooked',R.cooked||0],['Meals eaten',R.eaten||0],['Food level',P.foodLv||0],['Crew files',(P.found||[]).length+' of '+FILES.length],['Waves drawn',runAlertWaves],['Arcade wins',R.arcade||0],['Run score',runScore+liveLevelScore()]];
  const half=Math.ceil(rows.length/2),cw=(w-36)/2;rows.forEach((r,i)=>{const col=i<half?0:1,yy=y+6+(i%half)*11,cx=x+12+col*(cw+12);txt(r[0],cx,yy,'#8e978b');txt(''+r[1],cx+cw,yy,'#e3e6dc','right');});}
function drawAch(x,y,w,h){const P=player,lx=x+10,lw=w-152;txt('points '+(P.ap||0),lx,y+4,'#ffe070');
  let hv=null;ACH.forEach((a,i)=>{const yy=y+17+i*10,got=P.ach&&P.ach[a.id];if(ui(lx-2,yy-2,lw+4,10,{click:()=>{}}))hv=a;if(hv===a)F('#141917',lx-2,yy-2,lw+4,10);F(got?'#ffe070':'#2a302e',lx,yy+1,6,6);if(got)F('#0a0d0c',lx+2,yy+3,2,2);txt(a.name,lx+10,yy,got?'#e3e6dc':'#8e978b');txt(got?'done':'',lx+lw-22,yy,'#6f7a6a','right');txt('+'+a.pts,lx+lw,yy,got?'#ffe070':'#4f5a55','right');});
  {const a=hv||ACH.find(q=>!(P.ach&&P.ach[q.id]))||ACH[0];F('#1f2524',lx,y+h-24,lw,1);txt(a.name,lx,y+h-20,AMBER);wrap(a.desc,lx,y+h-10,lw,9,'#b9c0b3');}
  const tx=x+w-132;F('#1f2524',tx-6,y+4,1,h-10);txt('Trade points',tx,y+4,AMBER);
  AP_TRADES.forEach((t,i)=>{const yy=y+18+i*24,ok=(P.ap||0)>=t.cost&&(!t.ok||t.ok()),sel=i===apSel;const hov=ui(tx,yy,122,20,{click:()=>{apSel=i;apTrade(t);}});if(hov&&mouse.moved)apSel=i;
    box(tx,yy,122,20,sel?'#1c2220':'#0e1211',ok?(sel?AMBER:'#6b5220'):'#2a302e');txt(t.label,tx+6,yy+3,ok?'#e3e6dc':'#5d655f');txt(t.cost+' points',tx+6,yy+11,ok?'#ffe070':'#4f5a55');});
  wrap('Achievements last for this run. Points can be traded any time.',tx,y+94,122,9,'#4f5a55');}
function drawBestiary(x,y,w,h){
  const lx=x+8,lw=150;bxSel=Math.max(0,Math.min(bxSel,BEASTS.length-1));
  const found=BEASTS.filter(b=>bestiary.seen[b]).length,totalK=BEASTS.reduce((a,b)=>a+(bestiary.kills[b]||0),0);
  txt('Creatures this run',lx,y+4,AMBER);
  const visN=Math.max(4,Math.floor((h-62)/10));if(bxSel<bxScroll)bxScroll=bxSel;if(bxSel>=bxScroll+visN)bxScroll=bxSel-visN+1;bxScroll=Math.max(0,Math.min(bxScroll,BEASTS.length-visN));
  BEASTS.forEach((b,i)=>{if(i<bxScroll||i>=bxScroll+visN)return;const yy=y+17+(i-bxScroll)*10,known=!!bestiary.seen[b],sel=i===bxSel;
    const hov=ui(lx-2,yy-2,lw+4,10,{click:()=>{bxSel=i;sfx('click');}});if(hov&&mouse.moved)bxSel=i;
    if(sel){F('#1c2220',lx-2,yy-2,lw+4,11);F(AMBER,lx-2,yy-2,2,11);}
    F(known?ET[b].col:'#2a302e',lx+4,yy+1,5,5);
    txt(known?BEASTINFO[b].name:'???',lx+14,yy,known?(sel?'#e3e6dc':'#b9c0b3'):'#4f5a55');
    txt(known?(bestiary.kills[b]||0)+' killed':'unseen',lx+lw,yy,known?'#8e978b':'#3f4642','right');});
  if(BEASTS.length>visN){const th=visN*10,bh=Math.max(8,th*visN/BEASTS.length),bby=y+15+(th-bh)*bxScroll/Math.max(1,BEASTS.length-visN);F('#141817',lx+lw+4,y+15,2,th);F('#5d655f',lx+lw+4,bby,2,bh);}
  const fy=y+17+visN*10+2;F('#1f2524',lx,fy,lw,1);
  txt('discovered '+found+' of '+BEASTS.length,lx,fy+5,'#8e978b');
  txt(BEASTS.length-found?(BEASTS.length-found)+' not yet seen':'all logged',lx,fy+15,BEASTS.length-found?'#6f7a6a':'#9fcf9a');
  txt('total kills '+totalK,lx,fy+25,'#8e978b');
  // detail
  const dx=x+176,dw=w-184,b=BEASTS[bxSel],known=!!bestiary.seen[b];
  F('#1f2524',x+168,y+4,1,h-10);
  const bx=dx,by=y+4;box(bx,by,64,64,'#070908','#1f2524');
  if(known){const e=mkEnemy(b,camX,camY);e.portrait=true;e.ph=T*3;ctx.save();ctx.beginPath();ctx.rect(bx+1,by+1,62,62);ctx.clip();
    ctx.translate(bx+32,by+34);ctx.scale(4,4);drawEnemy(e);ctx.restore();}
  else txt('?',bx+32,by+24,'#3f4642','center',16);
  const tx=bx+72,tw=dw-72;
  if(!known){txt('Unknown',tx,by+2,'#6f7a6a');wrap('Nothing logged yet. Get it in your light to add it here.',tx,by+14,tw,9,'#4f5a55');return;}
  const I=Object.assign({move:'unknown',attack:'unknown'},BEASTINFO[b]),E=ET[b];
  txt(I.name,tx,by+2,AMBER);txt('first seen at depth '+bestiary.seen[b],tx,by+13,'#6f7a6a');
  const rows=[['Health',Math.round(E.hp*(1+(depth-1)*0.12)*10)/10+' (now)'],['Movement',I.move],['Attack',I.attack+(E.dmg?', '+E.dmg+' dmg':'')],['Points',KILLPTS[b]],['Killed',bestiary.kills[b]||0]];
  let yy=by+26;ctx.font='8px '+FONT;for(const [k,v] of rows){const vs=''+v,lw2=ctx.measureText(k).width+8;txt(k,tx,yy,'#8e978b');if(ctx.measureText(vs).width<=tw-lw2){txt(vs,tx+tw,yy,'#c9cfc2','right');yy+=9;}else{yy=wrap(vs,tx+8,yy+9,tw-8,9,'#c9cfc2')+1;}}
  {const ly=Math.max(by+70,yy+4),lines=Math.floor((y+h-6-ly)/9);ctx.save();ctx.beginPath();ctx.rect(dx-2,ly-2,dw+4,y+h-4-ly);ctx.clip();wrap(I.lore,dx,ly,dw,9,'#b9c0b3');ctx.restore();}
}
