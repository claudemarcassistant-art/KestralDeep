RECIPES.splice(0,RECIPES.length,...RECIPES.filter(r=>r.cat!=='Melee upgrades'));
let upSel=0,upScroll=0;
function upRows(){const R=[];let c=null;for(const u of UPGS){if(!upgUnlocked(u.k)&&!U(u.k))continue;if(u.cat!==c){c=u.cat;R.push({hdr:c});}R.push({u});}return R;}
function buyUpgrade(u){if(!upgUnlocked(u.k)){say('attune to the right crew file to unlock this');sfx('click');return;}const lv=U(u.k);if(lv>=3){say(u.name.toLowerCase()+' is maxed');sfx('deny');return;}const n=u.cost[lv];
  for(const k in n)if((player.inv[k]||0)<n[k]){say('missing parts for '+u.name.toLowerCase());sfx('deny');return;}
  for(const k in n)player.inv[k]-=n[k];player.upg[u.k]=lv+1;refreshStats();sfx('craft');say(u.name.toLowerCase()+' '+['I','II','III'][lv]);}
function drawUpgrades(x,y,w,h){
  if(!upRows().length){txt('No upgrades unlocked yet.',x+w/2,y+40,'#8e978b','center');wrap('Upgrades are unlocked by attuning to crew files. Your starter files, Deckhand and Rigger, unlock the first ones at tier 2. Open Files with K.',x+60,y+56,w-120,10,'#5d655f');return;}
  {const nl=UPGS.filter(u=>!upgUnlocked(u.k)&&!U(u.k)).length;if(nl)txt(nl+' more locked behind crew files',x+w-8,y+h-10,'#3f4642','right');}
  const rows=upRows(),sel=[];rows.forEach((r,i)=>{if(r.u)sel.push(i);});upSel=Math.max(0,Math.min(upSel,sel.length-1));
  const ly=y+4,rh=11,vis=Math.floor((y+h-4-ly)/rh),si=sel[upSel];
  if(si<upScroll)upScroll=si;if(si>=upScroll+vis)upScroll=si-vis+1;if(upScroll===si&&si>0&&rows[si-1].hdr)upScroll=si-1;upScroll=Math.max(0,Math.min(upScroll,Math.max(0,rows.length-vis)));
  for(let k=0;k<vis&&upScroll+k<rows.length;k++){const ri=upScroll+k,r=rows[ri],yy=ly+k*rh;
    if(r.hdr){txt(r.hdr,x+8,yy+1,'#6f7a6a');F('#1f2524',x+8+ctx.measureText(r.hdr).width+6,yy+5,100,1);continue;}
    const idx=sel.indexOf(ri),u=r.u,lv=U(u.k),isSel=idx===upSel,need=u.cost[Math.min(2,lv)],ok=lv<3&&Object.keys(need).every(q=>(player.inv[q]||0)>=need[q]);
    const hov=ui(x+6,yy-1,196,rh,{click:()=>{upSel=idx;buyUpgrade(u);}});if(hov&&mouse.moved)upSel=idx;
    if(isSel){F('#1c2220',x+6,yy-1,196,rh);F(AMBER,x+6,yy-1,2,rh);}
    txt(u.name,x+14,yy+1,lv>=3?'#5d655f':ok?'#e3e6dc':'#8e978b');
    for(let q=0;q<3;q++)F(q<lv?AMBER:'#2a302e',x+176+q*8,yy+3,6,4);}
  if(upScroll>0)txt('more above',x+198,y+2,'#5d655f','right');if(upScroll+vis<rows.length)txt('more below',x+198,y+h-10,'#5d655f','right');
  const u=rows[sel[upSel]].u,lv=U(u.k),dx=x+214,dw=w-222;F('#1f2524',x+206,y+4,1,h-10);
  txt(u.name,dx,y+6,AMBER);txt(u.cat.toLowerCase()+'  /  level '+lv+' of 3',dx,y+17,'#6f7a6a');
  let yy=wrap(u.desc,dx,y+30,dw,10,'#b9c0b3')+4;
  if(lv<3){txt('Next level needs',dx,yy,'#8e978b');yy+=11;const n=u.cost[lv];for(const k in n){const have=player.inv[k]||0,okk=have>=n[k];txt(k,dx+6,yy,'#c9cfc2');txt(have+' / '+n[k],dx+dw,yy,okk?'#9fcf9a':'#c07060','right');yy+=10;}
    yy+=4;txt(Object.keys(n).every(k=>(player.inv[k]||0)>=n[k])?'R, Enter or click to upgrade':'missing parts',dx,yy,AMBER);}
  else txt('maxed',dx,yy,'#5d655f');
}
const rName=r=>typeof r.name==='function'?r.name():r.name;
const rNeed=r=>typeof r.need==='function'?r.need():r.need;
function canCraft(r){if(r.ok&&!r.ok())return false;const n=rNeed(r);for(const k in n)if((player.inv[k]||0)<n[k])return false;return true;}
function craft(r){if(!r)return;
  if(!canCraft(r)){sfx('deny');say(r.ok&&!r.ok()?'nothing to gain from that right now':'missing parts for '+rName(r).toLowerCase());return;}
  const n=rNeed(r);for(const k in n)player.inv[k]-=n[k];say(r.make());sfx('craft');
  for(const k in n)if(Math.random()<0.15*U('salv')){player.inv[k]++;float(player.x,player.y-10,'salvaged '+k,'#9fcf9a');}}

