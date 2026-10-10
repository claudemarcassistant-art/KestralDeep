// ---------- menus ----------
function wbRows(){const rows=[];let cat=null;for(const r of RECIPES){if(onlyCraftable&&!canCraft(r))continue;if(r.cat!==cat){cat=r.cat;rows.push({hdr:cat});}rows.push({r});}return rows;}
function drawMenu(){
  const live=state==='play'&&!OPTS.pauseMenu;F(live?'rgba(4,5,6,0.6)':'rgba(4,5,6,0.88)',0,0,W,H);
  const pw=368,ph=200,px=(W-pw)>>1,py=(H-ph)>>1;
  box(px,py+12,pw,ph-12,'#0e1211','#2a302e');
  ['Pack','Equip','Craft','Food','Stats','Files','Progress'].forEach((n,i)=>{const x=px+i*52,act=menuTab===i;
    const hov=ui(x,py,51,13,{click:()=>{menuTab=i;sfx('click');}});
    F(act?'#0e1211':hov?'#141917':'#090b0b',x,py,51,13);F(act?AMBER:'#2a302e',x,py,51,act?2:1);
    txt(n,x+25,py+3,act?AMBER:'#8e978b','center');});

  if(menuTab!==1)eqPopup=null;
  if(live){F('#e07060',px,py-8,5,5);txt('LIVE: the deck keeps moving while this is open',px+9,py-9,Math.sin(T*3)>0?'#e07060':'#a05040');}
  if(menuTab===2)drawWorkbench(px,py+14,pw,ph-14);else if(menuTab===4)drawStats(px,py+14,pw,ph-14);else if(menuTab===1)drawEquip(px,py+14,pw,ph-14);else if(menuTab===0)drawPackTab(px,py+14,pw,ph-14);else if(menuTab===5)drawFilesTab(px,py+14,pw,ph-14);else if(menuTab===3)drawFood(px,py+14,pw,ph-14);else drawProgressTab(px,py+14,pw,ph-14);
}
function drawWorkbench(x,y,w,h){
  const rows=wbRows(),sel=[];rows.forEach((r,i)=>{if(r.r)sel.push(i);});
  wbSel=Math.max(0,Math.min(wbSel,sel.length-1));
  const on=onlyCraftable;
  const fh=ui(x+6,y+2,190,11,{click:()=>{onlyCraftable=!onlyCraftable;wbSel=0;wbScroll=0;sfx('click');}});
  txt('X  only craftable: '+(on?'on':'off'),x+8,y+4,on?AMBER:fh?'#c9cfc2':'#8e978b');
  const ly=y+18,rh=11,vis=Math.floor((y+h-6-ly)/rh);
  if(!sel.length){txt('nothing you can build right now',x+8,ly+2,'#5d655f');}
  else{
    const si=sel[wbSel];
    if(si<wbScroll)wbScroll=si;if(si>=wbScroll+vis)wbScroll=si-vis+1;
    if(wbScroll===si&&si>0&&rows[si-1].hdr)wbScroll=si-1;
    wbScroll=Math.max(0,Math.min(wbScroll,Math.max(0,rows.length-vis)));
    for(let k=0;k<vis&&wbScroll+k<rows.length;k++){const ri=wbScroll+k,row=rows[ri],yy=ly+k*rh;
      if(row.hdr){txt(row.hdr,x+8,yy+1,'#6f7a6a');F('#1f2524',x+8+ctx.measureText(row.hdr).width+6,yy+5,120,1);continue;}
      const idx=sel.indexOf(ri),r=row.r,ok=canCraft(r),done=r.ok&&!r.ok(),isSel=idx===wbSel;
      const hov=ui(x+6,yy-1,196,rh,{click:()=>{wbSel=idx;craft(r);}});
      if(hov&&mouse.moved)wbSel=idx;
      if(isSel){F('#1c2220',x+6,yy-1,196,rh);F(AMBER,x+6,yy-1,2,rh);}
      txt(rName(r),x+14,yy+1,done?'#3f4642':ok?'#e3e6dc':'#6a726c');
      txt(done?r.done:ok?'ready':'',x+198,yy+1,done?'#3f4642':'#9fcf9a','right');
    }
    if(wbScroll>0)txt('more above',x+198,y+4,'#5d655f','right');
    if(wbScroll+vis<rows.length)txt('more below',x+198,y+h-12,'#5d655f','right');
    // details
    const r=rows[sel[wbSel]].r,dx=x+214,dw=w-222;
    F('#1f2524',x+206,y+4,1,h-10);
    txt(rName(r),dx,y+6,AMBER);
    let yy=wrap(r.desc,dx,y+18,dw,10,'#b9c0b3')+4;
    if(r.cat==='Melee upgrades'){const m=melee();yy=wrap('now: dmg '+m.dmg+', reach '+m.range+', knock '+Math.round(m.kb)+', arc '+Math.round(m.arc*114)+'\u00b0, recover '+m.cd.toFixed(2)+'s',dx,yy,dw,10,'#6f7a6a')+4;}
    const done=r.ok&&!r.ok();
    if(!done){txt('Needs',dx,yy,'#8e978b');yy+=11;const n=rNeed(r);
      for(const k in n){const have=player.inv[k],okk=have>=n[k];txt(k,dx+6,yy,'#c9cfc2');txt(have+' / '+n[k],dx+dw,yy,okk?'#9fcf9a':'#c07060','right');yy+=10;}}
    yy+=4;txt(done?r.done:canCraft(r)?'R, Enter or click to build':'missing parts',dx,yy,done?'#5d655f':canCraft(r)?AMBER:'#6a726c');
  }
}
function drawTip(name,desc,note){const tw=150,tx=Math.min(W-tw-4,mouse.sx+10),lines=[];ctx.font='8px '+FONT;let line='';
  for(const wd of desc.split(' ')){const t=line?line+' '+wd:wd;if((ctx.measureText(t).width||0)>tw-10&&line){lines.push(line);line=wd;}else line=t;}if(line)lines.push(line);
  const th=16+lines.length*9+(note?10:0),ty=Math.min(H-th-4,mouse.sy+10);box(tx,ty,tw,th,'#070909','#3a423f');txt(name,tx+5,ty+4,AMBER);lines.forEach((l,i)=>txt(l,tx+5,ty+15+i*9,'#b9c0b3'));if(note)txt(note,tx+5,ty+th-11,'#5d655f');}
function drawEquip(x,y,w,h){
  hoverInfo=null;const gx=x+6,gy=y+4,cw=112,ch=34;let tip=null;
  for(const [k,c,r] of SLOTS){const bx=gx+c*(cw+3),by=gy+r*36,id=getSlot(k),sk=k.startsWith('acc')?'acc':k;
    const hov=eqPopup?false:ui(bx,by,cw,ch,{click:()=>{eqPopup={slot:k};epSel=0;sfx('click');}});
    box(bx,by,cw,ch,hov?'#151a18':'#0a0d0c',id?'#3a423f':'#1f2524');F(SLOTCOL[sk],bx+1,by+1,2,ch-2);
    txt(SLOTNAME[sk],bx+7,by+4,'#6f7a6a');txt(id?GEAR[id].name:'empty',bx+7,by+18,id?'#e3e6dc':'#343b38');
    if(hov)tip=id?[GEAR[id].name,GEAR[id].desc,'click to change']:['Empty '+SLOTNAME[sk],'Nothing equipped here.','click to choose'];}
  for(let si=0;si<2;si++){const bx=gx+2*(cw+3),by=gy+(1+si*2)*36,bh=70,st=player.arms[si],cur=si===player.armSet,two=st.main&&ARM[st.main].hand==='two';
    box(bx,by,cw,bh,'#0a0d0c',cur?AMBER:'#2a302e');txt('armament '+(si+1),bx+6,by+3,cur?AMBER:'#6f7a6a');if(cur)txt('active',bx+cw-6,by+3,AMBER,'right');
    if(!two)for(let k=bx+4;k<bx+cw-4;k+=4)F('#3a423f',k,by+Math.round(bh/2)+2,2,1);
    const hT=eqPopup?false:ui(bx,by+12,cw,bh/2-10,{click:()=>{eqPopup={si,half:'main'};epSel=0;sfx('click');}}),hB=eqPopup?false:ui(bx,by+bh/2+3,cw,bh/2-3,{click:()=>{eqPopup={si,half:'off'};epSel=0;sfx('click');}});
    if(two){txt(ARM[st.main].name,bx+6,by+28,'#e3e6dc');txt('two-handed',bx+6,by+40,'#5d655f');txt('LMB  RMB block',bx+6,by+54,'#3f4642');}
    else{txt('main',bx+6,by+15,'#5d655f');txt(st.main?ARM[st.main].name:'fists',bx+6,by+25,st.main?'#e3e6dc':'#5d655f');txt('LMB',bx+cw-6,by+15,'#3f4642','right');
      txt('off',bx+6,by+bh/2+6,'#5d655f');txt(st.off?ARM[st.off].name:'block',bx+6,by+bh/2+16,st.off?'#e3e6dc':'#5d655f');txt('RMB',bx+cw-6,by+bh/2+6,'#3f4642','right');}
    const hid=hT?st.main:hB?st.off:null;if(hid)tip=[ARM[hid].name,ARM[hid].desc,'click to change'];else if(hT||hB)tip=[hT?'Main hand':'Off hand',hT?'Empty: you strike with your fists.':'Empty: right click blocks.','click to choose'];}
  if(eqPopup)drawEqPopup();else if(tip)drawTip(tip[0],tip[1],tip[2]);
}
let eqPopup=null,epSel=0;
function popupOpts(){const P=player,O=[],pu=eqPopup;
  if(pu.slot){const k=pu.slot,sk=k.startsWith('acc')?'acc':k,cur=getSlot(k);
    if(cur)O.push({label:'Remove '+GEAR[cur].name,desc:'Back into your pack.',act:()=>{unequip(k);eqPopup=null;}});
    P.bag.filter(g=>GEAR[g].slot===sk).forEach(g=>O.push({label:GEAR[g].name,desc:GEAR[g].desc,gear:g,act:()=>{const c=getSlot(k);setSlot(k,g);P.bag.splice(P.bag.indexOf(g),1);if(c)P.bag.push(c);refreshStats();sfx('equip');eqPopup=null;}}));}
  else{const st=P.arms[pu.si],cur=st[pu.half],fits=k=>{const h=ARM[k].hand;return h==='two'||h===pu.half;};
    if(cur)O.push({label:'Remove '+ARM[cur].name,desc:pu.half==='main'?'Leaves your fists.':'Leaves an empty hand for blocking.',act:()=>{unequipHalf(pu.si,pu.half);eqPopup=null;}});
    Object.keys(ARM).filter(k=>P.has[k]&&fits(k)&&k!==cur).forEach(k=>{const where=P.arms.findIndex(q=>q.main===k||q.off===k);
      O.push({label:ARM[k].name+(where>=0?'  (from set '+(where+1)+')':''),desc:ARM[k].desc,arm:k,act:()=>{equipArm(k,pu.si);eqPopup=null;}});});}
  O.push({label:'Cancel',desc:'',act:()=>{eqPopup=null;}});return O;}
function drawEqPopup(){const O=popupOpts(),pu=eqPopup,pw=210,rh=12,ph=40+O.length*rh+34,px=(W-pw)>>1,py=Math.max(6,(H-ph)>>1);
  epSel=Math.max(0,Math.min(epSel,O.length-1));
  const title=pu.slot?(SLOTNAME[pu.slot.startsWith('acc')?'acc':pu.slot]+' slot'):('armament '+(pu.si+1)+'  /  '+(pu.half==='main'?'main hand':'off hand'));
  F('rgba(4,5,6,0.55)',0,0,W,H);box(px,py,pw,ph,'#0a0d0c','#3a423f');F(AMBER,px,py,pw,2);
  txt(title,px+10,py+7,AMBER);txt('ESC',px+pw-10,py+7,'#3f4642','right');
  if(O.length===1||(O.length===2&&O[0].label.startsWith('Remove')))txt('nothing in your pack fits here',px+10,py+20,'#5d655f');
  O.forEach((o,i)=>{const yy=py+32+i*rh,sel=i===epSel;const hov=ui(px+6,yy-2,pw-12,rh,{click:()=>{epSel=i;o.act();sfx('click');}});if(hov&&mouse.moved)epSel=i;
    if(sel){F('#1c2220',px+6,yy-2,pw-12,rh);F(AMBER,px+6,yy-2,2,rh);}
    if(o.gear){F(SLOTCOL[GEAR[o.gear].slot],px+12,yy+1,3,5);}
    txt(o.label,px+(o.gear?19:12),yy,o.label.startsWith('Remove')?'#c07060':o.label==='Cancel'?'#6f7a6a':'#e3e6dc');});
  const d=O[epSel]&&O[epSel].desc;if(d)wrap(d,px+10,py+36+O.length*rh,pw-20,9,'#8e978b');
  ui(0,0,W,H,{click:()=>{eqPopup=null;}});
}
let pkSel=0,pkScroll=0;
let pkMode=0;
function packRows(){const P=player,R=[];const hdr=t=>R.push({hdr:t});
  if(pkMode===0){const tl=Object.keys(TOOLS).filter(k=>P.tools[k]);if(tl.length){hdr('Tools');tl.forEach(k=>{const q=qInfo(k);R.push({kind:'quick',id:k,name:q.name,n:1,tool:true,desc:q.desc+' Tools are never used up.',note:'click: put in the highlighted quick slot, or 3-9',act:()=>assignQuick(k,P.quickSel)});});}}
  const arms=Object.keys(ARM).filter(k=>P.has[k]&&!isEquipped(k));
  if(pkMode===2){if(!arms.length&&!P.bag.length)hdr('Nothing unequipped');}
  if(pkMode===2&&arms.length){hdr('Armaments');arms.forEach(k=>R.push({kind:'arm',id:k,name:ARM[k].name,n:1,desc:ARM[k].desc,note:'click or R: equip to the active set',act:()=>equipArm(k)}));}
  if(pkMode===2&&P.bag.length){hdr('Gear');P.bag.forEach(g=>R.push({kind:'gear',id:g,name:GEAR[g].name,n:1,desc:GEAR[g].desc+' ('+SLOTNAME[GEAR[g].slot]+')',note:'click or R: equip',act:()=>equipBag(P.bag.indexOf(g))}));}
  const cons=Object.keys(QUICK).filter(k=>QUICK[k].n()>0),fq=qInfo('flask'),hasF=fq.total()>0;
  if(pkMode===0&&(cons.length||hasF)){hdr('Consumables');
    if(hasF)R.push({kind:'quick',id:'flask',name:fq.name+(P.flask.n?' '+P.flask.n+'/3':' (empty)'),n:fq.total(),desc:fq.desc+((P.inv.flasks||0)?' You carry '+P.inv.flasks+' spare empty flask'+(P.inv.flasks>1?'s':'')+'.':''),note:'click: put in the highlighted quick slot, or 3-9',act:()=>assignQuick('flask',P.quickSel)});
    cons.forEach(k=>R.push({kind:'quick',id:k,name:QUICK[k].name,n:QUICK[k].n(),desc:QUICK[k].desc,note:'click: put in the highlighted quick slot, or 3-9',act:()=>assignQuick(k,P.quickSel)}));}
  const fd=Object.keys(FOOD).filter(k=>P.food[k]>0);
  if(pkMode===0&&fd.length){hdr('Food');fd.forEach(k=>{const q=qInfo('food:'+k);R.push({kind:'quick',id:'food:'+k,name:q.name,n:q.n(),desc:q.desc,note:'click: put in the highlighted quick slot, or 3-9',act:()=>assignQuick('food:'+k,P.quickSel)});});}
  const am=['rounds','shells','nails','bolts','cells'].filter(k=>P.inv[k]>0);
  if(pkMode===1&&am.length){hdr('Ammo');am.forEach(k=>R.push({kind:'res',id:k,name:k,n:P.inv[k],desc:RESDESC[k]}));}
  if(pkMode===1){hdr('Materials');['scrap','powder','pipe','battery','cloth'].forEach(k=>R.push({kind:'res',id:k,name:k,n:P.inv[k],desc:RESDESC[k]}));
  hdr('Keys');R.push({kind:'res',id:'key',name:'keys',n:P.inv.key,desc:RESDESC.key});if(liftCard)R.push({kind:'res',id:'liftcard',name:'lift keycard',n:1,desc:RESDESC.liftcard});}
  if(pkMode===0&&!R.length)hdr('No consumables or tools');
  return R;}
function rowIcon(r,x,y){const di=(t,e)=>drawItem(Object.assign({x:x+camX,y:y+camY,type:t,ph:0},e||{}));
  if(r.kind==='arm')di('weapon',{w:r.id});else if(r.kind==='gear')di('gear',{gear:r.id});else if(r.kind==='quick')qIcon(r.id,x,y);else di(r.id);}
function drawPackTab(x,y,w,h){['Items','Resources','Equipment'].forEach((n,i)=>{const bx=x+8+i*84,act=pkMode===i;ui(bx,y+2,80,11,{click:()=>{pkMode=i;pkSel=0;pkScroll=0;sfx('click');}});F(act?'#1c2220':'#0a0d0c',bx,y+2,80,11);F(act?AMBER:'#2a302e',bx,y+12,80,1);txt(n,bx+40,y+4,act?AMBER:'#8e978b','center');});
  txt('A D switch view',x+w-8,y+4,'#3f4642','right');drawPack(x,y+14,w,h-14);}
function drawPack(x,y,w,h){
  const P=player,lx=x+8,lw=200;
  if(pkMode===0)for(let i=0;i<7;i++){const bx=lx+i*28,by=y+2,id=P.quick[i],q=qInfo(id),sel=i===P.quickSel,locked=i>=qCap();
    const hov=locked?false:ui(bx,by,26,22,{click:()=>{if(sel&&id){P.quick[i]=null;sfx('click');}else{P.quickSel=i;sfx('click');}}});
    box(bx,by,26,22,locked?'#060707':sel?'#1c2220':'#0a0d0c',locked?'#141817':sel?AMBER:hov?'#3a423f':'#1f2524');txt(''+(i+3),bx+2,by+2,locked?'#1f2524':sel?AMBER:'#3f4642');
    if(locked){F('#1f2524',bx+11,by+10,5,5);F('#1f2524',bx+12,by+7,3,3);continue;}
    if(id){ctx.globalAlpha=q.n()>0?1:0.35;qIcon(id,bx+14,by+12);ctx.globalAlpha=1;txt(''+(q.cnt?q.cnt():q.n()),bx+24,by+13,'#e3e6dc','right');}}
  const R=packRows(),sel=[];R.forEach((r,i)=>{if(!r.hdr)sel.push(i);});pkSel=Math.max(0,Math.min(pkSel,sel.length-1));
  const ly=pkMode===0?y+30:y+4,rh=11,vis=Math.floor((y+h-4-ly)/rh),si=sel[pkSel];
  if(si<pkScroll)pkScroll=si;if(si>=pkScroll+vis)pkScroll=si-vis+1;if(pkScroll===si&&si>0&&R[si-1].hdr)pkScroll=si-1;pkScroll=Math.max(0,Math.min(pkScroll,Math.max(0,R.length-vis)));
  for(let k=0;k<vis&&pkScroll+k<R.length;k++){const ri=pkScroll+k,r=R[ri],yy=ly+k*rh;
    if(r.hdr){txt(r.hdr,lx,yy+1,'#6f7a6a');F('#1f2524',lx+ctx.measureText(r.hdr).width+6,yy+5,100,1);continue;}
    const idx=sel.indexOf(ri),isSel=idx===pkSel,hov=ui(lx-2,yy-1,lw+4,rh,{click:()=>{pkSel=idx;if(r.act)r.act();}});if(hov&&mouse.moved)pkSel=idx;
    if(isSel){F('#1c2220',lx-2,yy-1,lw+4,rh);F(AMBER,lx-2,yy-1,2,rh);}
    rowIcon(r,lx+7,yy+5);txt(r.name,lx+16,yy+1,r.n>0?'#e3e6dc':'#5d655f');txt(r.kind==='arm'||r.kind==='gear'||r.tool?'':'x'+r.n,lx+lw,yy+1,'#8e978b','right');}
  if(pkScroll>0)txt('more above',lx+lw,y+32,'#4f5a55','right');if(pkScroll+vis<R.length)txt('more below',lx+lw,y+h-10,'#4f5a55','right');
  const r=R[sel[pkSel]],dx=x+220,dw=w-228;F('#1f2524',x+212,y+4,1,h-10);
  if(r){ctx.save();ctx.translate(dx+18,y+22);ctx.scale(3,3);rowIcon(r,0,0);ctx.restore();
    txt(r.name,dx+40,y+12,AMBER);if(r.tool)txt('tool',dx+40,y+22,'#8e978b');else if(r.kind!=='arm'&&r.kind!=='gear')txt('x'+r.n,dx+40,y+22,'#8e978b');
    const e=wrap(r.desc,dx,y+44,dw,10,'#b9c0b3');let e2=r.note?wrap(r.note,dx,e+4,dw,9,'#5d655f'):e;
    if(menuUsable(r)){const by=e2+6,food=r.id.startsWith('food:'),can=r.n>0,hov=ui(dx,by,96,13,{click:()=>useFromMenu(r)});box(dx,by,96,13,hov&&can?'#1c2220':'#0e1211',can?AMBER:'#2a302e');txt((food?'Eat':'Use')+' now   F',dx+48,by+3,can?(hov?AMBER:'#e3e6dc'):'#5d655f','center');}}
  txt('capacity: unlimited for now',dx,y+h-12,'#3f4642');
}
const MENUUSE=['surgery','medpatch','medkit','trauma','regen','stim','antitox','emetic'];
function menuUsable(r){return r&&r.kind==='quick'&&(r.id.startsWith('food:')||MENUUSE.includes(r.id));}
function useFromMenu(r){if(!menuUsable(r))return;const q=qInfo(r.id);if(!q||q.n()<=0){sfx('click');return;}q.use();}
let fileMode=0,flSel=0;
function drawFilesTab(x,y,w,h){const FW=[76,104,64,90];['Crew files','Upgrades & perks','Skills','Work orders'].forEach((n,i)=>{const bw=FW[i],bx=x+8+FW.slice(0,i).reduce((a,b)=>a+b+3,0),act=fileMode===i;ui(bx,y+2,bw,11,{click:()=>{fileMode=i;sfx('click');}});F(act?'#1c2220':'#0a0d0c',bx,y+2,bw,11);F(act?AMBER:'#2a302e',bx,y+12,bw,1);txt(n,bx+bw/2,y+4,act?AMBER:'#8e978b','center');});
  if(fileMode===3)drawAch(x,y+14,w,h-14);else if(fileMode===2)drawSkills(x,y+14,w,h-14);else if(fileMode===1)drawUpPerks(x,y+14,w,h-14);else drawFiles(x,y+14,w,h-14);}
function upPerkRows(){const P=player,R=[],{own,lock}=perkList();
  if((P.injuries||[]).length){R.push({hdr:'Injuries',col:'#ff8a7a'});for(const j of P.injuries)R.push({inj:j});}
  R.push({hdr:'Active perks',col:AMBER});if(own.length)for(const e of own)R.push({perk:e});else R.push({none:'none yet'});
  const ur=upRows();R.push({hdr:'Upgrades',col:AMBER});if(ur.length)for(const r of ur)R.push(r.u?{u:r.u}:{hdr:r.hdr,sub:true});else R.push({none:'none unlocked yet'});
  const lk=lock.filter(e=>e.found);if(lk.length){R.push({hdr:'Perks still to unlock',col:'#6f7a6a'});for(const e of lk)R.push({perk:e,locked:true});}
  return R;}
function drawUpPerks(x,y,w,h){const rows=upPerkRows(),sel=[];rows.forEach((r,i)=>{if(!r.hdr&&!r.none)sel.push(i);});if(!sel.length)return;upSel=Math.max(0,Math.min(upSel,sel.length-1));
  const lw=200,ly=y+4,rh=11,vis=Math.floor((h-8)/rh),si=sel[upSel];if(si<upScroll)upScroll=si;if(si>=upScroll+vis)upScroll=si-vis+1;if(upScroll===si&&si>0&&rows[si-1].hdr)upScroll=si-1;upScroll=Math.max(0,Math.min(upScroll,Math.max(0,rows.length-vis)));
  for(let k=0;k<vis&&upScroll+k<rows.length;k++){const ri=upScroll+k,r=rows[ri],yy=ly+k*rh;
    if(r.hdr){txt(r.hdr,x+8,yy+1,r.sub?'#6f7a6a':r.col);ctx.font='8px '+FONT;F('#1f2524',x+8+ctx.measureText(r.hdr).width+6,yy+5,Math.max(10,lw-ctx.measureText(r.hdr).width-20),1);continue;}
    if(r.none){txt(r.none,x+14,yy+1,'#4f5a55');continue;}
    const idx=sel.indexOf(ri),isSel=idx===upSel;const hov=ui(x+6,yy-1,lw-4,rh,{click:()=>{upSel=idx;if(r.u)buyUpgrade(r.u);}});if(hov&&mouse.moved)upSel=idx;
    if(isSel){F('#1c2220',x+6,yy-1,lw-4,rh);F(AMBER,x+6,yy-1,2,rh);}
    if(r.u){const lv=U(r.u.k),need=r.u.cost[Math.min(2,lv)],ok=lv<3&&Object.keys(need).every(q=>(player.inv[q]||0)>=need[q]);txt(r.u.name,x+14,yy+1,lv>=3?'#5d655f':ok?'#e3e6dc':'#8e978b');for(let q=0;q<3;q++)F(q<lv?AMBER:'#2a302e',x+lw-30+q*8,yy+3,6,4);}
    else if(r.inj){F('#c04040',x+12,yy+2,3,5);txt(INJ[r.inj.id].name,x+18,yy+1,'#ff8a7a');txt(r.inj.left+'d',x+lw-6,yy+1,'#8a5a5a','right');}
    else if(r.perk){F(r.locked?'#2a302e':r.perk.kind==='classified'?'#e05040':'#a88af0',x+12,yy+2,3,5);txt(r.perk.name,x+18,yy+1,r.locked?'#5d655f':'#9fe0b0');}}
  if(rows.length>vis){const th=vis*rh,bh=Math.max(8,th*vis/rows.length),by=ly+(th-bh)*upScroll/Math.max(1,rows.length-vis);F('#141817',x+lw+2,ly,2,th);F('#5d655f',x+lw+2,by,2,bh);}
  const r=rows[sel[upSel]],dx=x+lw+12,dw=w-lw-20;F('#1f2524',x+lw+7,y+4,1,h-10);
  if(r.u){const u=r.u,lv=U(u.k);txt(u.name,dx,y+6,AMBER);txt(u.cat.toLowerCase()+'  /  level '+lv+' of 3',dx,y+17,'#6f7a6a');let yy=wrap(u.desc,dx,y+30,dw,10,'#b9c0b3')+4;
    if(lv<3){txt('Next level needs',dx,yy,'#8e978b');yy+=11;const n=u.cost[lv];for(const k in n){const have=player.inv[k]||0;txt(k,dx+6,yy,'#c9cfc2');txt(have+' / '+n[k],dx+dw,yy,have>=n[k]?'#9fcf9a':'#c07060','right');yy+=10;}
      yy+=4;txt(Object.keys(n).every(k=>(player.inv[k]||0)>=n[k])?'R, Enter or click to upgrade':'missing parts',dx,yy,AMBER);}else txt('maxed',dx,yy,'#5d655f');}
  else if(r.inj){const d=INJ[r.inj.id];txt(d.name,dx,y+6,'#ff8a7a');txt('injury  /  heals in '+r.inj.left+' deck'+(r.inj.left>1?'s':''),dx,y+17,'#8a5a5a');let yy=wrap(d.desc,dx,y+30,dw,10,'#c8a8a0')+6;wrap('Treat it with a surgery kit, a medstation, a stasis pod or a ginsu bean, or let it heal over lift rides.',dx,yy,dw,9,'#6f7a6a');}
  else if(r.perk){const e=r.perk;txt(e.name,dx,y+6,r.locked?'#8e978b':'#9fe0b0');txt((r.locked?'not yet unlocked  /  ':'perk  /  ')+e.file+' tier '+e.tier,dx,y+17,'#6f7a6a');wrap(e.desc||'',dx,y+30,dw,10,'#b9c0b3');}}
let prScroll=0;
function perkList(){const own=[],lock=[];for(const f of FILES){const t=fileTier(f.id);f.tiers.forEach((tr,i)=>{if(!tr.perk)return;const c=tr.desc.indexOf(':'),name=c>0?tr.desc.slice(0,c):tr.desc,desc=c>0?tr.desc.slice(c+1).trim():'';
  const e={name,desc:desc?desc[0].toUpperCase()+desc.slice(1):'',file:f.name,tier:i+1,kind:f.kind,found:hasFile(f.id)};if(i<t)own.push(e);else lock.push(e);});}return {own,lock};}
function drawPerks(x,y,w,h){const {own,lock}=perkList(),lx=x+10,lw=w-20,top=y+4,bottom=y+h-6;let yy=top-prScroll;
  ctx.save();ctx.beginPath();ctx.rect(x+4,top-2,w-8,h-8);ctx.clip();
  {const I=player.injuries||[];if(I.length){txt('Injuries  ('+I.length+')',lx,yy,'#ff8a7a');yy+=12;for(const j of I){const d=INJ[j.id];F('#c04040',lx,yy+1,3,5);txt(d.name,lx+7,yy,'#ff8a7a');txt('heals in '+j.left+' deck'+(j.left>1?'s':''),lx+lw,yy,'#8a5a5a','right');yy=wrap(d.desc,lx+7,yy+10,lw-7,9,'#c8a8a0')+4;}yy+=6;F('#1f2524',lx,yy-4,lw,1);}}
  txt('Active perks  ('+own.length+')',lx,yy,AMBER);yy+=12;
  if(!own.length){wrap('None yet. Perks come from the later tiers of crew files.',lx,yy,lw,9,'#5d655f');yy+=12;}
  for(const e of own){F(e.kind==='classified'?'#e05040':'#a88af0',lx,yy+1,3,5);txt(e.name,lx+7,yy,'#9fe0b0');txt(e.file+' tier '+e.tier,lx+lw,yy,'#5d655f','right');yy=wrap(e.desc,lx+7,yy+10,lw-7,9,'#b9c0b3')+4;}
  yy+=6;F('#1f2524',lx,yy-4,lw,1);txt('Not yet unlocked',lx,yy,'#6f7a6a');yy+=12;
  for(const e of lock){if(!e.found)continue;F('#2a302e',lx,yy+1,3,5);txt(e.name,lx+7,yy,'#8e978b');txt(e.file+' tier '+e.tier,lx+lw,yy,'#3f4642','right');yy+=10;}if(!lock.some(e=>e.found)){txt('none in the files you have found',lx+7,yy,'#4f5a55');yy+=10;}
  ctx.restore();const total=yy+prScroll-top;prScroll=Math.max(0,Math.min(prScroll,Math.max(0,total-(h-10))));
  if(total>h-10){const bh=Math.max(10,(h-10)*(h-10)/total),by=top+(h-10-bh)*prScroll/Math.max(1,total-(h-10));F('#141817',x+w-6,top,2,h-10);F('#5d655f',x+w-6,by,2,bh);}}
function drawFiles(x,y,w,h){const P=player,lx=x+8,lw=190,rh=11,FL=FILES.filter(f=>hasFile(f.id));flSel=Math.max(0,Math.min(flSel,FL.length-1));
  txt('earn it by finishing decks',lx+lw,y+2,'#3f4642','right');{const nf=FILES.length-FL.length;if(nf)txt(nf+' more files are out there to find',lx,y+h-10,'#5d655f');}
  txt('clearance '+P.clear,lx,y+2,P.clear?'#9fe0b0':'#6f7a6a');
  const vis=Math.floor((h-16)/rh),top=Math.max(0,Math.min(flSel-Math.floor(vis/2),FL.length-vis));
  for(let k=0;k<vis&&top+k<FL.length;k++){const i=top+k,f=FL[i],t=fileTier(f.id),yy=y+15+k*rh,sel=i===flSel,next=f.tiers[t],can=next&&P.clear>=next.cost&&reqMet(f);
    const hov=ui(lx-2,yy-2,lw+4,rh,{click:()=>{flSel=i;attuneFile(f);}});if(hov&&mouse.moved)flSel=i;
    if(sel){F('#1c2220',lx-2,yy-2,lw+4,rh);F(AMBER,lx-2,yy-2,2,rh);}
    F(f.kind==='flat'?'#6f7a6a':f.kind==='classified'?'#e05040':'#a88af0',lx+2,yy+1,3,5);txt(f.name,lx+8,yy,t?'#e3e6dc':sel?'#c9cfc2':'#8e978b');
    for(let q=0;q<f.tiers.length;q++)F(q<t?AMBER:can&&q===t?'#6b5220':'#2a302e',lx+lw+2-9*(f.tiers.length-q),yy+2,7,5);}
  const f=FL[flSel],t=fileTier(f.id),dx=x+212,dw=w-220;F('#1f2524',x+204,y+2,1,h-6);
  txt(f.name,dx,y+2,AMBER);txt(f.role+'  /  '+(f.kind==='flat'?'steady gains':f.kind==='classified'?'classified':'milestones'),dx,y+13,f.kind==='classified'?'#e05040':'#6f7a6a');if(FILESUB[f.id])txt('trains '+FILESUB[f.id].map(k=>SUBS[k].name.toLowerCase()).join(' and '),dx,y+23,CORES[SUBS[FILESUB[f.id][0]].core].col);
  let yy=y+36;if(f.req){txt('requires '+FILEBY[f.req.id].name.toLowerCase()+' tier '+f.req.t,dx,yy-2,reqMet(f)?'#6f7a6a':'#c07060');yy+=10;}
  f.tiers.forEach((tr,i)=>{const got=i<t,nx=i===t;F(got?AMBER:nx?'#6b5220':'#1f2524',dx,yy+1,6,6);txt(''+tr.cost,dx+dw,yy,got?'#6f7a6a':nx?AMBER:'#3f4642','right');
    yy=wrap(tr.desc,dx+10,yy,dw-22,9,got?'#9fcf9a':nx?'#e3e6dc':'#5d655f')+3;});
  const nx=f.tiers[t];txt(!nx?'fully attuned':!reqMet(f)?'requirement not met':P.clear>=nx.cost?'R, Enter or click to attune':'needs '+nx.cost+' clearance',dx,yy+2,!nx?'#5d655f':P.clear>=nx.cost&&reqMet(f)?AMBER:'#c07060');
  txt('numbers show clearance cost',dx,y+h-10,'#3f4642');}
let skScroll=0;
function drawSkills(x,y,w,h){
  const L=skillList();skSel=Math.max(0,Math.min(skSel,L.length-1));
  const lx=x+8,lw=172,rh=11,top=y+4,descH=76,listH=h-descH-10,vis=Math.floor(listH/rh);let hovO=null;
  const rows=[];for(const [title,t,sub] of [['Spacebar','SPACE','click: use on space'],['Movement','SHIFT','click: on or off'],['Abilities','E','bind to E or F']]){rows.push({hdr:title,sub});const mine=L.map((o,k)=>({o,k})).filter(q=>q.o.t===t);if(!mine.length)rows.push({none:true});else for(const q of mine)rows.push(q);rows.push({gap:true});}
  const selRow=rows.findIndex(r=>r.k===skSel);if(selRow>=0){if(selRow<skScroll)skScroll=Math.max(0,selRow-1);if(selRow>=skScroll+vis)skScroll=selRow-vis+1;}skScroll=Math.max(0,Math.min(skScroll,Math.max(0,rows.length-vis)));
  ctx.save();ctx.beginPath();ctx.rect(lx-4,top-3,lw+8,vis*rh+2);ctx.clip();
  for(let i=0;i<vis&&skScroll+i<rows.length;i++){const r=rows[skScroll+i],yy=top+i*rh;
    if(r.hdr){txt(r.hdr,lx,yy,AMBER);txt(r.sub,lx+lw,yy,'#3f4642','right');continue;}if(r.gap)continue;if(r.none){txt('none yet',lx+4,yy,'#3f4642');continue;}
    const o=r.o,k=r.k,t=o.t,onE=t==='E'&&o.i===player.skillIdx,onF=t==='E'&&o.i===player.skillIdx2,cur=t==='E'?(onE||onF):t==='SPACE'?activeSpace()===o.id:hasMove(o.id),sel=k===skSel;
    if(t==='E'){ui(lx+lw-30,yy-2,13,11,{click:()=>{skSel=k;if(player.skillIdx2===o.i)player.skillIdx2=player.skillIdx;player.skillIdx=o.i;sfx('click');}});
      ui(lx+lw-14,yy-2,13,11,{click:()=>{skSel=k;if(player.skillIdx===o.i)player.skillIdx=player.skillIdx2;player.skillIdx2=o.i;sfx('click');}});}
    const hov=ui(lx-2,yy-2,t==='E'?lw-30:lw+4,11,{click:()=>{skSel=k;bindSkill(o);}});if(hov){hovO=o;if(mouse.moved)skSel=k;}
    if(sel){F('#1c2220',lx-2,yy-2,lw+4,11);F(AMBER,lx-2,yy-2,2,11);}
    txt(o.d.name,lx+4,yy,cur?'#9fe0b0':sel?'#e3e6dc':'#8e978b');
    if(t==='E'){const cd=player.skillCd[o.id]||0;txt(cd>0?Math.ceil(cd)+'s':'',lx+lw-34,yy,'#5d655f','right');
      F(onE?AMBER:'#1f2524',lx+lw-30,yy-1,12,9);txt('E',lx+lw-24,yy,onE?'#050607':'#6f7a6a','center');F(onF?AMBER:'#1f2524',lx+lw-14,yy-1,12,9);txt('F',lx+lw-8,yy,onF?'#050607':'#6f7a6a','center');}
    else if(t==='SPACE')txt(cur?'SPACE':(o.id==='repulse'&&player.repulseCd>0?Math.ceil(player.repulseCd)+'s':''),lx+lw,yy,cur?AMBER:'#5d655f','right');
    else txt(o.id==='sprint'?(cur?'SHIFT':'replaced'):cur?'on':'off',lx+lw,yy,cur?AMBER:'#5d655f','right');}
  ctx.restore();
  if(rows.length>vis){const bh=Math.max(8,Math.round(vis*rh*vis/rows.length)),by=top-2+Math.round((vis*rh-bh)*skScroll/Math.max(1,rows.length-vis));F('#141817',lx+lw+5,top-2,2,vis*rh);F('#5d655f',lx+lw+5,by,2,bh);}
  const o=hovO||L[skSel],dy=y+h-descH;F('#1f2524',lx,dy-4,lw,1);
  ctx.save();ctx.beginPath();ctx.rect(lx-2,dy-2,lw+4,descH-2);ctx.clip();
  if(o){txt(o.d.name,lx,dy,AMBER);const cur=o.t==='E'?o.i===player.skillIdx:hasMove(o.id);
    wrap(o.d.desc,lx,dy+11,lw,9,'#b9c0b3');}
  else wrap('Training chips from chests, merchants and signals teach new skills.',lx,dy,lw,9,'#5d655f');
  ctx.restore();
  if(o){const cur=o.t==='E'?(o.i===player.skillIdx||o.i===player.skillIdx2):o.t==='SPACE'?activeSpace()===o.id:hasMove(o.id);txt(o.t==='SPACE'?(cur?'on space':'click to use on space'):o.t==='E'?(cur?'bound':'click E or F to bind'):o.id==='sprint'?'':(cur?'on. click to switch off':'off. click to switch on'),lx,y+h-10,'#5d655f');}
  F('#1f2524',x+186,y+4,1,h-10);ctx.save();ctx.beginPath();ctx.rect(x+190,y,w-194,h-2);ctx.clip();drawActBar(x+194,y,w-202,h);ctx.restore();
}
let actSel=0,actPick=0;
let skSet=null;
function setCfg(id){const P=player;return id==='sling'?{name:'Resource ranger',col:'#d9a441',defs:SLING,list:P.slActs,bar:P.slingbar,right:a=>{const c=slingCount(a);return c==='inf'?'endless':c;}}:{name:'Psychic',col:'#a88af0',defs:ACTS,list:P.acts,bar:P.actbar,right:a=>Math.round(ACTS[a].cd*actCdMul())+'s'};}
function drawActBar(x,y,w,h){const P=player,sets=[];if(P.acts.length)sets.push('psych');if(P.slActs.length)sets.push('sling');
  txt('Skill sets',x,y+4,AMBER);if(!sets.length){wrap('Some crew files teach a skill set: a skill that swaps your item slots for its own action bar. The Ranger file and the classified files have them. You have none yet.',x,y+18,w,9,'#5d655f');return;}
  if(!sets.includes(skSet))skSet=sets[0];sets.forEach((k,i)=>{const C=setCfg(k),bx=x+w-(sets.length-i)*52,act=skSet===k;ui(bx,y+2,50,10,{click:()=>{skSet=k;actSel=0;actPick=0;sfx('click');}});F(act?'#1c2220':'#0a0d0c',bx,y+2,50,10);F(act?C.col:'#2a302e',bx,y+11,50,1);txt(k==='sling'?'Ranger':'Psychic',bx+25,y+3,act?C.col:'#8e978b','center');});
  const C=setCfg(skSet),n=qCap(),sw=Math.min(22,Math.floor(w/n));
  for(let i=0;i<n;i++){const bx=x+i*sw,by=y+16,a=C.bar[i],sel=i===actSel;ui(bx,by,sw-2,18,{click:()=>{if(sel&&a){C.bar[i]=null;}actSel=i;sfx('click');}});box(bx,by,sw-2,18,sel?'#1c2220':'#0a0d0c',sel?C.col:'#2a302e');txt(''+(i+3),bx+2,by+1,'#3f4642');
    if(a){F(C.defs[a].col,bx+sw/2-4,by+6,8,8);F('#050607',bx+sw/2-2,by+8,4,4);}}
  let yy=y+42;txt('click an action to put it in slot '+(actSel+3),x,yy,'#5d655f');yy+=12;
  C.list.forEach((a,k)=>{const A=C.defs[a],on=C.bar.includes(a);const hov=ui(x-2,yy-2,w+2,11,{click:()=>{const j=C.bar.indexOf(a);if(j>=0)C.bar[j]=null;C.bar[actSel]=a;actPick=k;sfx('click');}});if(hov&&mouse.moved)actPick=k;
    if(k===actPick)F('#141917',x-2,yy-2,w+2,11);F(A.col,x,yy+1,3,5);txt(A.name,x+6,yy,on?'#e3e6dc':'#8e978b');txt(C.right(a),x+w,yy,'#5d655f','right');yy+=11;});
  const A=C.defs[C.list[Math.min(actPick,C.list.length-1)]];if(A)wrap(A.desc,x,yy+4,w,9,'#b9c0b3');}
let stSel=0;
function drawStats(x,y,w,h){
  {const lx=x+10,lw=176;let yy=y+4;txt('Core',lx,yy,AMBER);txt('every 3 points raise the core',lx+lw,yy,'#3f4642','right');yy+=13;const keys=[];
    for(const c in CORES){const C=CORES[c],lv=coreLv(c),pr=coreProg(c);const hov=ui(lx-2,yy-2,lw+4,11,{click:()=>{stSel=keys.length;}});keys.push({c});if(hov&&mouse.moved)stSel=keys.length-1;
      if(stSel===keys.length-1)F('#141917',lx-2,yy-2,lw+4,11);txt(C.name,lx,yy,C.col);txt('level '+lv,lx+90,yy,'#e3e6dc');for(let q=0;q<3;q++)F(q<pr?C.col:'#2a302e',lx+lw-26+q*9,yy+2,7,4);yy+=11;
      for(const k of C.subs){const n=subPts(k);const hv=ui(lx-2,yy-2,lw+4,10,{click:()=>{stSel=keys.length;}});keys.push({k});if(hv&&mouse.moved)stSel=keys.length-1;
        if(stSel===keys.length-1)F('#141917',lx-2,yy-2,lw+4,10);txt(SUBS[k].name,lx+10,yy,n?'#c9cfc2':'#5d655f');txt(''+n,lx+lw,yy,n?'#e3e6dc':'#3f4642','right');yy+=10;}yy+=4;}
    const sel=keys[Math.min(stSel,keys.length-1)];F('#1f2524',lx,yy,lw,1);yy+=5;
    if(sel.c){txt(CORES[sel.c].name,lx,yy,CORES[sel.c].col);yy=wrap(CORES[sel.c].desc,lx,yy+10,lw,9,'#b9c0b3');}
    else{txt(SUBS[sel.k].name,lx,yy,CORES[SUBS[sel.k].core].col);yy=wrap(SUBS[sel.k].desc,lx,yy+10,lw,9,'#b9c0b3');const fr=Object.keys(FILESUB).filter(f=>FILESUB[f].includes(sel.k)).map(f=>FILEBY[f].name);wrap('Trained by: '+fr.join(', ')+'.',lx,yy+2,lw,9,'#5d655f');}}
  F('#1f2524',x+194,y+4,1,h-10);
  const sx=x+204,sw=w-214,P=player,m=melee();
  txt('Stats',sx,y+4,AMBER);
  const pct=v=>(v>0?'+':'')+Math.round(v*100)+'%';
  const accel=0.16/Math.max(0.3,1+S.accel+(P.stimT>0?0.6:0)+(P.adrenT>0?1:0));
  const regen=22*(1+S.stamina*0.5)*(P.stimT>0?2:1);
  let lr=(S.lantern?108:BASE_R)+(S.sight||0);if(cond.light==='lit')lr=Math.max(lr,170);else if(cond.light==='dark')lr=S.lantern?85:22;if(S.nvg)lr=Math.max(lr,175);if(cond.haz==='fog'&&!hazOff)lr=Math.min(lr*0.55,100);
  const beam=S.beams.reduce((a,b)=>Math.max(a,b.r),0);
  const rows=[
    ['Health',Math.ceil(P.hp)+' / '+maxHp(),P.hp<maxHp()],
    ['Armor',Math.round(P.armor)+' / 50',P.armor>0],
    ['Damage taken',S.dr?'-'+Math.round(S.dr*100)+'%':'normal',S.dr>0],
    ['Move speed',S.spd?pct(S.spd):'normal',S.spd!==0],
    ['Acceleration',accel.toFixed(2)+'s to full',accel<0.159||accel>0.161],
    ['Stamina',Math.round(maxStam()),S.stamina>0],
    ['Stamina recovery',regen.toFixed(0)+' / s',regen>22.5],
    ['Backpedal slow',Math.round(55*(1-S.backpedal))+'%',S.backpedal>0],
    ['Fire rate',S.rof?pct(S.rof):'normal',S.rof>0],
    ['Ammo per pickup',S.ammoBonus?pct(S.ammoBonus):'normal',S.ammoBonus>0],
    ['Gunfire noise',S.quiet?'-'+Math.round(S.quiet*100)+'%':'normal',S.quiet>0],
    ['Critical chance',(()=>{const st=P.arms[P.armSet],g=st.off&&ARM[st.off].gun?st.off:null,mn=st.main||'fists';return Math.round(critChance(mn)*100)+'% melee'+(g?', '+Math.round(critChance(g)*100)+'% gun':'');})(),S.crit>0],
    ['Enemy drop chance',Math.round((0.3+S.luck)*100)+'%',S.luck>0],
    ['Regeneration',S.regen?(S.regen).toFixed(2)+' hp/s':'none',S.regen>0],
    ['Light radius',Math.round(lr)+' px'+(beam?', beam '+beam:''),beam>0||lr!==BASE_R],
    ['Hack window',S.hack?pct(S.hack):'normal',S.hack>0],
    ['Shove',(Math.round(m.dmg*10)/10)+' dmg, '+m.range+' reach',m.dmg>1||m.range>18],
    ['Shove knockback',Math.round(m.kb)+', arc '+Math.round(m.arc*114)+'\u00b0',m.kb>170||m.arc>1.1],
    ['Run','depth '+depth+', '+kills+' down',false]
  ];
  rows.forEach(([k,v,mod],i)=>{const ry=y+15+i*9;txt(k,sx,ry,'#8e978b');txt(''+v,sx+sw,ry,mod?AMBER:'#c9cfc2','right');});
}
function drawMap(){
  F('rgba(4,5,6,0.93)',0,0,W,H);
  // pixels per tile: the largest that fits between the legend and the disturbance meter, at most 3
  const s=Math.max(1,Math.min(3,Math.floor((W-180)/MW),Math.floor((H-8)/MH))),ox=(W-MW*s)>>1,oy=(H-MH*s)>>1;
  F('#0b0e0d',ox-2,oy-2,MW*s+4,MH*s+4);
  const open=i=>map[i]===0||map[i]===2;
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=y*MW+x,m=map[i];
    if(open(i)){if(!seen[i])continue;
      F(freightT&&x===freightT.x&&y===freightT.y?'#d9a441':(m===6||m===7)?(m===7?'#a04040':'#6a8a6a'):m===0&&kind[i]>=5?'#2e3530':m===0&&flot[i]?'#6a5434':m===0&&liq[i]>=2?(liq[i]===4?'#0f2432':liq[i]===3?'#1d3a48':'#2a4a52'):m===0?(kind[i]===4?'#1a2233':kind[i]===3?'#3a3226':kind[i]===2?'#2a2c30':kind[i]?'#2d3634':'#222928'):'#9a7a3a',ox+x*s,oy+y*s,s,s);continue;}
    let touch=false,below=false;
    for(const [dx,dy] of D8){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=MW||ny>=MH)continue;const n=ny*MW+nx;if(open(n)&&seen[n]){touch=true;if(kind[n]===4)below=true;}}
    if(!touch&&!seen[i])continue;if(!touch)continue;
    if(below)F((x+y)%2?'#7a9ad8':'#34486a',ox+x*s,oy+y*s,s,s);
    else F('#65726e',ox+x*s,oy+y*s,s,s);}
  for(let i=0;i<MW*MH;i++)if(oil[i]&&seen[i])F('#3a3020',ox+(i%MW)*s,oy+((i/MW)|0)*s,s,s);
  for(const h of hatches)if(h.found&&seen[h.ly*MW+h.lx]){F('#7a9ad8',ox+h.lx*s,oy+h.ly*s,s,s);}
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=y*MW+x;if(!seen[i]||!hz[i])continue;F(hz[i]===1?(hazOff?'#2a2420':'#a04a20'):hz[i]===2?'#6a8a20':hz[i]===5?'#6fa0e0':'#8e978b',ox+x*s,oy+y*s,s,s);}
  for(const v of vendors)if(seen[v.ty*MW+v.tx])F(v.state==='dead'?'#3a3a3a':v.stock.some(o=>!o.sold)?'#e0506a':'#5a3038',ox+v.tx*s,oy+v.ty*s,s,s);
  for(const pn of panels)if(pn.hack&&seen[pn.ty*MW+pn.tx])F(pn.state==='idle'?'#6fd0c0':pn.state==='done'?'#3a6a4a':'#3a3a3a',ox+pn.tx*s,oy+pn.ty*s,s,s);
  for(const sc of ventRooms)if(sc.known&&!sc.open&&Math.sin(T*5)>-0.2)F('#6fd0c0',ox+sc.ex*s,oy+sc.ey*s,s,s);
  for(const h of hatches)if(seen[h.ty*MW+h.tx]&&h.found){F('#b09a6a',ox+h.tx*s,oy+h.ty*s,s,s);}
  for(const l of levers)if(seen[l.ty*MW+l.tx])F(l.used?'#3a3a3a':'#e05040',ox+l.tx*s,oy+l.ty*s,s,s);
  for(const sc of secrets)if(sc.known&&!sc.open&&Math.sin(T*5)>-0.2)F('#e0b050',ox+sc.ex*s,oy+sc.ey*s,s,s);
  drawArchiveMap(ox,oy,s);drawCrawlMap(ox,oy,s);
  if(deckSecured&&state==='play'){const bw=170,bx=W-bw-8,by=H-34,hv=ui(bx,by,bw,16,{click:()=>walkBack()});box(bx,by,bw,16,hv?'#1c2220':'#0e1211','#7fd08e');txt(SECURE_CFG.keyName+'  walk back to the lift',bx+bw/2,by+5,'#9fe0b0','center');}
  for(const pd of plateDoors){if(seen[pd.ty*MW+pd.tx])F(pd.state==='closed'?'#d9a441':'#6a5a30',ox+pd.tx*s,oy+pd.ty*s,s,s);if(seen[pd.py*MW+pd.px])F('#e0e0a0',ox+pd.px*s,oy+pd.py*s,s,s);}
  for(const t of traps)if(t.found&&seen[t.ty*MW+t.tx])F(trapLive(t)?'#c8f060':'#4a5a3a',ox+t.tx*s,oy+t.ty*s,s,s);
  for(const c of chests){if(!seen[c.ty*MW+c.tx])continue;F(c.opened?'#4a3a22':c.tier==='rare'?'#c9a8ff':'#e08a3a',ox+c.tx*s,oy+c.ty*s,s,s);}
  for(const it of items){const tx=Math.floor(it.x/TS),ty=Math.floor(it.y/TS);if(seen[ty*MW+tx])F('#c9b46a',ox+tx*s+1,oy+ty*s+1,1,1);}
  for(const f of flares)F('#ff7a4a',ox+Math.floor(f.x/TS)*s,oy+Math.floor(f.y/TS)*s,s,s);
  for(const c of cores)if(!c.dead)F('#ff5a6a',ox+c.tx*s-1,oy+c.ty*s-1,s+2,s+2);
  if(seen[exitT.y*MW+exitT.x]){const on=Math.sin(T*6)>-0.3;F(on?AMBER:'#6b5220',ox+exitT.x*s-1,oy+exitT.y*s-1,s+2,s+2);}
  const px=ox+player.x/TS*s,py=oy+player.y/TS*s;
  if(Math.sin(T*8)>-0.5)F('#ffffff',Math.round(px)-1,Math.round(py)-1,3,3);
  F('#ffffff',Math.round(px+Math.cos(player.ang)*4),Math.round(py+Math.sin(player.ang)*4),1,1);
  txt('Station map',6,6,AMBER);txt('Depth '+depth,6,16,'#9aa39a');txt(sector(depth).toLowerCase(),6,25,'#6f7a6a');txt(areaName(),6,34,'#c9cfc2');if(deckSize!=='m')txt(DECK_SIZES[deckSize].name,6,43,'#6f7a6a');{const sc=runSeed?runSeed.code:testDeck?testSeed:null;if(sc)txt('seed '+sc,6,52,'#4f5a55');}
  const lx=6,ly=H-135;
  const leg=[['#ffffff','you'],[AMBER,'lift'],['#7a9ad8','below deck'],['#6fd0c0','hack panel'],['#e0506a','vending'],['#b09a6a','hatch'],['#e05040','lever'],['#a04a20','hazard'],['#9a7a3a','locked door'],['#c8f060','trap'],['#e08a3a','chest'],['#c9a8ff','rare chest'],['#e0b050','weak wall'],['#c9b46a','supplies'],['#ff7a4a','flare']];
  leg.forEach(([c,n],i)=>{F(c,lx,ly+i*9+2,3,3);txt(n,lx+8,ly+i*9,'#9aa39a');});
  txt('M to close',W-6,6,'#6f7a6a','right');
  if(depth>=3&&!arcadeMode&&!(testMode&&!testDeck)){const bx=W-86,by=28;txt('disturbance',W-6,by,'#8e978b','right');F('#141817',bx,by+11,80,4);
    const a=Math.min(1,alertM/100);F(a>0.75?(Math.sin(T*8)>0?'#e05040':'#a03020'):a>0.4?'#d9a441':'#8a9a6a',bx,by+11,Math.round(80*a),4);
    txt('waves drawn: '+alertWaves+(alertCarry?'  (following)':''),W-6,by+18,alertWaves?'#ff8a7a':'#5d655f','right');}
  let n=0,t=0;for(let i=0;i<seen.length;i++)if(map[i]===0&&kind[i]!==3){t++;if(seen[i])n++;}
  txt(Math.round(n/t*100)+'% explored',W-6,16,'#9aa39a','right');
}
let setupOpen=false,setupSel=0,histOpen=false,histScroll=0,optsOpen=false,optSel=0,codexOpen=false,cxCat=0,cxSel=0,cxScroll=0;
function codexCats(){const C=[];
  C.push(['Systems',[{n:'Movement and stamina',d:'WASD moves. SHIFT sprints, or floats if Float is on; with Dash on, tapping SHIFT dashes first. Running, dashing and some psychic powers use stamina, which refills when you rest. Creep, if learned and switched on, makes normal walking stealthy.'},{n:'Looking ahead',d:'Hold right click with a gun to aim: the view leans toward the mouse and spread tightens. Hold V to plant your feet and look much further in any direction, seeing further than usual while you stay on screen.'},{n:'Light and darkness',d:'You only see what your light reaches. Dark rooms, dark decks and a cut breaker shrink it; lanterns, glowsticks, flares, night vision and fires help. Creatures and items outside the light are hidden. The map remembers what you have seen.'},{n:'Melee and charging',d:'Left click attacks with your main hand. The bat, whip, spear and bow can be held to charge up to 2.5x; releasing during the white flash as the ring fills is a perfect hit, with extra damage, knockback and a stun. Swings that hit nothing take twice as long to recover.'},{n:'Combos',d:'Every connecting melee hit adds to your combo; ranged hits add a little. Flow at 5 speeds attacks up, momentum at 10 adds damage, frenzy at 15 does both. Getting hit breaks it, and it drains when you stop landing hits.'},{n:'Critical hits',d:'Most hits can crit for double damage. Each weapon has its own chance, raised by Mind, Perception, Dexterity, some gear and files. The Stats tab shows your current chances.'},{n:'Guns and ammo',d:'Each gun uses its own ammo and holds a magazine: the HUD shows loaded / carried. R reloads when there is nothing to interact with, and an empty gun reloads itself when you fire. Bigger guns take longer: sidearm 10 rounds, SMG 30, scattergun 4, nailer 40, bolt driver 1, ray gun 8, flamethrower 60 fuel. Bows, throwing knives and the sling never reload. Active reload: while a magazine reloads, a bright marker sits on the reload bar. Press R again while the fill is inside it and the reload finishes at once; press too early or late and you fumble, making the rest of the reload half as long again. Ignore it and the reload runs as normal. Dexterity widens the marker.'},{n:'Knockback and impacts',d:'Shoves, tackles, explosions and heavy hits throw things. Creatures (and you) slammed into walls take impact damage. Barrels are physical objects that roll, bounce and can be kicked into creatures.'},{n:'Creatures fighting each other',d:'Creature attacks hit whatever is in the way: globs, tongues, seeds and charges hurt other creatures too. Guards shoot any creature they see, and creatures they shoot fight back. Bumping into each other does nothing.'},{n:'Status effects',d:'Wet, poison, burning, shock, frozen, sticky, radiation and more build up as meters. Most hurt or hinder you while high; at 100% they hit hardest and can cause injuries. Water puts out burning; food and items can resist or clear statuses. A full cold meter freezes you solid for 1.5 seconds: you cannot move, attack or use anything, and melee hits do 60% more. Mash the movement keys or catch a fire hit to crack out sooner; being ablaze melts it at once. Afterwards the cold drops to 60 and you cannot freeze again for 3 seconds. Creatures have a cold meter too, filled by cold vents and risers, freezing water, the Frost Matron and cryo grenades: frozen creatures stand helpless for 2 seconds (hunters 1), take 60% more melee damage and twice the damage when knocked into a wall. Ghosts and drones never freeze.'},{n:'Injuries',d:'Taking heavy damage at low health, or with a status maxed out, can cause a lasting injury that lowers stats or max health (greyed out on your health bar). Injuries heal over a few lift rides, or with surgery kits, medstations, stasis pods or a ginsu bean.'},{n:'Health, food and satiety',d:'Eating fills satiety and grants a buff. Food also earns food experience; each food level heals you and adds ghost health, a pale bar that soaks damage before your health and never regenerates. You cannot eat while too full.'},{n:'Cooking',d:'Raw ingredients from lockers, freezers and overgrown decks cook into better dishes in the Food tab. Some recipes need water in your flask. Cooked food gives more food experience.'},{n:'Crafting',d:'The Workbench (Craft tab) turns materials into ammo, weapons, tools, gear, throwables and medicine. Recipes you cannot afford are dimmed and refuse with a thunk.'},{n:'Crew files and clearance',d:'Crew files are found on decks. Clearance, earned each deck and for good grades, attunes their tiers: stat gains, skills, moves and perks. Every tier also trains substats, which raise your Body, Spirit and Mind cores. Tonics and sigils add points directly.'},{n:'Skills and skill sets',d:'Abilities go on E and F. Movement skills are switched on or off. Skill sets like Psych and Sling swap your item slots for their own action bar; set them up in Files > Skills, and press Q to go back to items.'},{n:'Disturbance',d:'From depth 3, noise fills a hidden meter: fights, explosions, failed hacks, the salvager. The eye top left shows it. When it fills, a wave of creatures is drawn to you, and later waves can change the deck: low gravity, flooding, anomalies or blackouts.'},{n:'Gas clouds and air',d:'Steam, poison and smoke form drifting clouds that grow while their source runs and fade after. Steam wets you, poison poisons you lightly, smoke uses up air and blinds you. Clouds shroud your vision, and fans blow them around. Deep water also uses air.'},{n:'Hazards and fire',d:'Each deck may have a hazard: steam, fire, toxic spills, live cables, chasms, molten slag and more. Fire spreads through oil, ignites barrels and is deadly to plants and slimy creatures. Water turns slag to crust.'},{n:'Traps',d:'From depth 2, decks hide pressure plates, mostly in corridors and doorways: a slightly lighter floor tile with four rivets. Step on one and it clicks; 0.4 seconds later it fires a spike, flame, dart or falling-debris trap, then re-arms after 6 seconds. Walking creatures set them off too, so you can lure things onto them; flying creatures, ghosts and a floating player do not. With 3 Perception plates glint when you are close, and a sonar pulse or the signal scanner marks plates nearby. Some plates are wired to a trap control panel on a nearby wall: hack it to lock them down, but fail and they all fire. Cutting the deck power at a breaker stops flame and dart traps, not spikes or debris.'},{n:'Plate doors and crates',d:PLATE_DOOR_DESC+' Plate doors appear from depth 2, guarding a small loot room, a room with a chest, or a shortcut through a wall. Crates are pushed like barrels (shove, kick, telekinesis, fans) but never burn or explode; wooden ones break under a sledgehammer, a heavy charged hit or a blast and drop scrap. Dropped items and crates also set off trap plates.'},{n:'Spacebar styles',d:'SPACE does your active spacebar style; pick it in Files > Skills. Shove is always known: a quick push in front of you. Kick (Brawler file) is a narrower, longer hit for 3 damage plus your melee bonuses and double knockback; it counts as melee for combos and crits, and sprinting into it makes a flying kick. Repulse (Kinetic file) is a psychic burst all around you that throws creatures, barrels, crates, loose items and gas clouds away; it costs stamina (or health when you have none) and recharges for 4 seconds, faster with Focus.'},{n:'Herbalism',d:'Wild herbs grow on overgrown decks, against walls and beside blooms, and in greenhouses; a few turn up in lockers, from the galley cook and at camp landings. They go in your herb pouch (Food tab). The Herbalism view (A and D switch views) turns them into poultices and incense, which go in your quick slots, and draughts, which you drink from the pouch like food and which last a minute or two. Poultices need cloth and draughts a swig of water from your flask. Incense is set down and burns for 30 seconds: grey sage heals you nearby and stops disturbance building, emberleaf keeps a small patch warm so nothing in it freezes. Its smoke is harmless and drifts with fans.'},{n:'Hacking and terminals',d:'Hack panels open doors, loot, map data, power and more, if you hit the timing. Failed hacks add disturbance. Some terminals log routes, cameras show the next ride, and dampeners can quieten the deck.'},{n:'Security',d:'Biometric trip scanners trigger a klaxon and security guards when you cross them. Guards see with flashlight cones and radio for backup if they keep you in sight; guards called by an alarm cannot call more. A breaker panel cuts power to cables, lights and scanners.'},{n:'The lift and arrival',d:'You arrive on each deck sealed in the lift cab; open the doors with R when ready. The exit lift stands in the middle of a marked 3x3 floor plate: press R anywhere on the plate to ride it down and end the deck, sometimes only after an objective: a keycard, holding the lift, or clearing an arena. Standing on it does nothing, so you will not leave by accident. The rare freight lift, in its own small room, works the same way and drops you several decks at once.'},{n:'Sector map and travel',d:'Each sector is a map of junctions with the exit marked, three or four jumps away. Shafts and contents are hidden until you ride them or find intel. Stops between decks can bring finds, events, traders or ambushes.'},{n:'Express shafts',d:EXPRESS_DESC},{n:'Deck secured',d:SECURE_DESC},{n:'Ceiling crawlways',d:CRAWL_DESC},{n:'Vault junctions',d:VAULT_DESC+' Dangers: '+Object.values(VAULT_DANGERS).map(v=>v.name+': '+v.desc).join(' ')},{n:'Run seeds',d:'Every run has a seed, shown in Run stats and when you die. The same seed builds the same station: the sector maps, every deck and what is on it, chest contents and lift events. What you do there is up to you, and fights and luck in the moment still vary. A deck also depends on how deep you are when you reach it. Set the seed in Run setup: random, the daily seed (the same for everyone all day), or type one to replay or share a run. Typed and daily runs are marked as seeded.'},{n:'Deck sizes',d:'Decks come in three sizes. Most are medium; small decks are tight and crowded with fewer rooms, and large decks sprawl, with more rooms, loot, hazards and creatures to match. A sector\'s exit deck and arena decks are often large. Once a junction is known, the sector map shows if its deck is small or large, and the station map (M) shows the whole deck at any size. Exploring a large deck stirs up no more disturbance in total than exploring a medium one, and par times and scores scale with the deck.'},{n:'Hunters and arenas',d:'From the second sector, or after drawing many waves, a biome hunter roams the sector map and comes for you; if you share a deck, kill it or reach the lift. Every sector has one or two arena decks. An arena starts with a few creatures and more pour in every 15 seconds. If a mini-boss holds the arena, the waves keep coming until you kill it; otherwise three waves come. Clear what is left and the lift unlocks.'},{n:'Being hunted',d:'Creatures that see you, hear you or get hurt come after you, but they do not hunt forever: once they lose sight of you they keep looking for about 8 seconds (5 for a noise), less if they are far away or cannot reach you, and then go back to wandering. Seeing you again starts it over. Noise carries half as far through walls. Creatures drawn by disturbance waves and guards called by an alarm hunt longer; hunters, arena creatures and guards during an alarm never give up.'},{n:'The pack menu',d:'TAB opens your pack. By default the deck keeps moving while it is open, so find a safe spot first; this can be changed in Options. You can eat and heal straight from Pack > Items.'},{n:'Work orders and points',d:'Work orders in Files > Work orders earn points during a run, which can be traded for clearance, tonics or crew files.'}]]);
  C.push(['Creatures',BEASTS.map(k=>{const I=BEASTINFO[k]||{},E=ET[k]||{};return {n:I.name||k,col:E.col,d:(I.move?'Movement: '+I.move+'. ':'')+(I.attack?'Attack: '+I.attack+'. ':'')+(I.lore||'')};})]);
  C.push(['Perks',FILES.flatMap(f=>f.tiers.map((t,i)=>({t,i,f})).filter(q=>q.t.perk).map(q=>{const c=q.t.desc.indexOf(':');const dd=c>0?q.t.desc.slice(c+1).trim():'';return {n:c>0?q.t.desc.slice(0,c):q.t.desc,d:(dd?dd[0].toUpperCase()+dd.slice(1):'')+'  From '+q.f.name+', tier '+(q.i+1)+'.',col:q.f.kind==='classified'?'#e05040':'#a88af0'};}))]);
  C.push(['Injuries',Object.values(INJ).map(d=>({n:d.name,d:d.desc+' Heals over a few lift rides, or with a surgery kit, a medstation, a stasis pod or a ginsu bean.',col:'#c04040'}))]);
  C.push(['Weapons',Object.keys(ARM).map(k=>({n:ARM[k].name,d:ARM[k].desc||''}))]);
  C.push(['Items',Object.keys(QUICK).filter(k=>!k.startsWith('food')&&!HERBBY[k]).map(k=>({n:QUICK[k].name,d:QUICK[k].desc||''}))]);
  C.push(['Gear',Object.keys(GEAR).map(k=>({n:GEAR[k].name,d:(GEAR[k].desc||'')+' ('+GEAR[k].slot+')'}))]);
  C.push(['Resources',Object.keys(CXRES).map(k=>({n:k,d:CXRES[k]})).concat(Object.keys(RAW).map(k=>({n:RAW[k].name,d:'Cooking ingredient. Found: '+RAW[k].where+'.',col:RAW[k].col})))]);
  C.push(['Food',Object.keys(FOOD).filter(k=>!FOOD[k].draught).map(k=>({n:FOOD[k].name,d:FOOD[k].desc,col:FOOD[k].col}))]);
  C.push(['Herbalism',Object.keys(HERBS).map(k=>({n:HERBS[k].name,d:HERBS[k].desc+' ('+HERBS[k].look+')',col:HERBS[k].col})).concat(HERBAL.map(h=>({n:h.name,d:prepDesc(h)+' Made from '+prepNeedText(h)+'.',col:h.col||FOOD[h.id].col})))]);
  C.push(['Crew files',FILES.map(f=>({n:f.name,d:(f.role?f.role+'. ':'')+f.tiers.map((t,i)=>'Tier '+(i+1)+': '+t.desc).join('  '),col:f.kind==='classified'?'#e05040':null}))]);
  C.push(['Sectors',SECTORS.map((n,i)=>({n:n.toLowerCase(),d:BOSSES[i%BOSSES.length]?'Hunted by the '+BOSSES[i%BOSSES.length].name+'.':''}))]);
  C.push(['Hazards',Object.keys(HAZDESC).map(k=>({n:COND_HAZ[k]||k,d:HAZDESC[k]})).concat(Object.values(TRAP_TYPES).map(t=>({n:t.name.toLowerCase(),d:t.desc})),[{n:'trap control panel',d:TRAP_PANEL_DESC},{n:'toxic vent',d:'A floor vent with a sickly green grille. Each eruption pours out poison gas instead of steam, building a cloud the longer it runs; the jet right over the vent poisons heavily, the cloud it leaves lightly, and fans blow it along. Common on toxic-spill decks, rare elsewhere.'}])]);
  C.push(['People',Object.values(NPCS).map(N=>({n:N.name,d:N.body,col:N.robe}))]);
  C.push(['Rooms',Object.values(MODS).map(m=>({n:m.name,d:'A room type you can find on decks.'}))]);
  C.push(['Lift events',TEXTEV.map(e=>({n:e.title,d:e.body}))]);
  return C;}
function setupRows(){const R=[{k:'start'},{k:'seed'}];for(const m of MODS_RUN)R.push({k:'mod',m});R.push({k:'go'},{k:'back'});return R;}
function setupAct(r,dir){const S0=META.setup;if(r.k==='start'){const mx=META.maxSector||0;S0.start=dir?Math.max(0,Math.min(mx,(S0.start||0)+dir)):((S0.start||0)+1)%(mx+1);saveMeta();sfx('click');}
  else if(r.k==='mod'){if(!r.m.ok()){sfx('deny');return;}const L=S0.mods||(S0.mods=[]);const i=L.indexOf(r.m.id);if(i>=0)L.splice(i,1);else L.push(r.m.id);saveMeta();sfx('click');}
  else if(r.k==='seed'){const modes=['random','daily','typed'],m=S0.seedMode||'random';
    if(!dir&&m==='typed'){editText(S0.seedText,20,v=>{S0.seedText=v;if(!seedKey(v))S0.seedMode='random';saveMeta();});return;}
    S0.seedMode=modes[(modes.indexOf(m)+(dir||1)+3)%3];if(S0.seedMode==='typed'&&!seedKey(S0.seedText||''))editText('',20,v=>{S0.seedText=v;if(!seedKey(v))S0.seedMode='random';saveMeta();});saveMeta();sfx('click');}
  else if(r.k==='go'){setupOpen=false;newGame();}else{setupOpen=false;}}
// how the next run's seed reads in menus
function setupSeedText(){const S0=META.setup||{},m=S0.seedMode||'random';return m==='daily'?'daily  '+dailySeedCode():m==='typed'&&seedKey(S0.seedText||'')?S0.seedText:'random';}
function drawSetup(){const R=setupRows(),pw=Math.min(W-30,300),ph=Math.min(H-20,46+R.length*13+36),px=(W-pw)>>1,py=(H-ph)>>1;setupSel=Math.max(0,Math.min(setupSel,R.length-1));
  F('rgba(4,5,6,0.92)',0,0,W,H);box(px,py,pw,ph,'#0a0d0c','#1f2524');F(AMBER,px,py,pw,2);txt('Run setup',px+10,py+8,AMBER);
  const nm=Object.keys(META.seen||{}).length;txt('creatures logged across runs: '+nm+' / '+BEASTS.length,px+pw-10,py+8,'#4f5a55','right');
  R.forEach((r,i)=>{const yy=py+26+i*13,sel=i===setupSel;const hov=ui(px+6,yy-3,pw-12,12,{click:()=>{setupSel=i;setupAct(r,0);}});if(hov&&mouse.moved)setupSel=i;if(sel){F('#141917',px+6,yy-3,pw-12,12);F(AMBER,px+6,yy-3,2,12);}
    if(r.k==='start'){const st=Math.min(META.setup.start||0,META.maxSector||0);txt('Starting sector',px+14,yy,'#e3e6dc');txt((st?'< ':'  ')+BNAMES[st%6]+(st<(META.maxSector||0)?' >':'  '),px+pw-12,yy,AMBER,'right');}
    else if(r.k==='mod'){const ok=r.m.ok(),on=(META.setup.mods||[]).includes(r.m.id);F(on&&ok?AMBER:'#2a302e',px+14,yy+1,6,6);txt(ok?r.m.name:'locked',px+24,yy,ok?(on?'#e3e6dc':'#8e978b'):'#3f4642');txt(ok?(on?'on':'off'):'',px+pw-12,yy,on?AMBER:'#5d655f','right');}
    else if(r.k==='seed'){const ed=textEdit&&sel;txt('Seed',px+14,yy,'#e3e6dc');txt(ed?textEdit.val+(Math.sin(T*8)>0?'_':' '):'< '+setupSeedText()+' >',px+pw-12,yy,ed?'#e3e6dc':AMBER,'right');}
    else if(r.k==='go')txt('Start a run',px+14,yy,'#9fe0b0');else txt('Back',px+14,yy,'#6f7a6a');});
  const r=R[setupSel],dy=py+30+R.length*13;F('#1f2524',px+10,dy-4,pw-20,1);
  const d=r.k==='start'?'Start deeper in the station with a little extra kit. Reach a sector in any run to unlock starting there.':r.k==='mod'?(r.m.ok()?r.m.desc+' Each modifier adds 25% to your score.':'Unlock: '+r.m.unlock):r.k==='seed'?(textEdit?'Type a seed: letters, numbers and spaces. Enter to keep it, ESC to cancel.':'The seed decides the station: sector maps, decks, loot and lift events. Random picks a new one each run (shown in Run stats and when you die). Daily is the same for everyone all day. Typed: Enter to type one, to replay or share a run. Typed and daily runs are marked as seeded.'):r.k==='go'?'New game from the title also uses these settings.':'';
  wrap(d,px+10,dy,pw-20,9,'#8e978b');}
function drawCodex(){const C=codexCats();cxCat=(cxCat+C.length)%C.length;const L=C[cxCat][1];cxSel=Math.max(0,Math.min(cxSel,L.length-1));const pw=W-20,ph=H-20,px=10,py=10;
  F('rgba(4,5,6,0.94)',0,0,W,H);box(px,py,pw,ph,'#0a0d0c','#1f2524');F(AMBER,px,py,pw,2);txt('Codex',px+8,py+6,AMBER);txt('A D category   W S entry   ESC back',px+pw-8,py+6,'#4f5a55','right');
  C.forEach((c,i)=>{const yy=py+20+i*10,act=i===cxCat;if(ui(px+6,yy-2,70,10,{click:()=>{cxCat=i;cxSel=0;sfx('click');}})&&mouse.moved){}if(act)F('#1c2220',px+6,yy-2,70,10);txt(c[0],px+10,yy,act?AMBER:'#8e978b');});
  const lx=px+82,lw=Math.min(130,pw*0.32),vis=Math.floor((ph-30)/10);if(cxSel<cxScroll)cxScroll=cxSel;if(cxSel>=cxScroll+vis)cxScroll=cxSel-vis+1;cxScroll=Math.max(0,Math.min(cxScroll,Math.max(0,L.length-vis)));
  F('#1f2524',lx-4,py+18,1,ph-24);ctx.save();ctx.beginPath();ctx.rect(lx-2,py+16,lw+2,ph-20);ctx.clip();for(let i=cxScroll;i<Math.min(L.length,cxScroll+vis);i++){const yy=py+20+(i-cxScroll)*10,sel=i===cxSel;if(ui(lx-2,yy-2,lw,10,{click:()=>{cxSel=i;sfx('click');}})&&mouse.moved)cxSel=i;if(sel){F('#1c2220',lx-2,yy-2,lw,10);F(AMBER,lx-2,yy-2,2,10);}F(L[i].col||'#3f4642',lx+2,yy+1,3,5);txt(L[i].n,lx+8,yy,sel?'#e3e6dc':'#8e978b');}ctx.restore();
  const dx=lx+lw+8,dw=px+pw-dx-8;F('#1f2524',dx-5,py+18,1,ph-24);const e=L[cxSel];if(e){txt(e.n,dx,py+20,AMBER);wrap(e.d||'',dx,py+32,dw,9,'#b9c0b3');}txt(C[cxCat][0]+'  '+(cxSel+1)+' / '+L.length,dx,py+ph-12,'#4f5a55');}
function optRows(){return [
  {label:'Pause while the pack is open',val:OPTS.pauseMenu?'on':'off',desc:'Off: creatures keep moving while you use the pack on a deck, so find a safe spot or lock a door first. On: the game waits for you.',act:()=>{OPTS.pauseMenu=!OPTS.pauseMenu;saveOpts();}},
  {label:'View size',val:VIEWS[viewIdx][0]+' x '+VIEWS[viewIdx][1],desc:'How much of the station fits on screen. Also V on the title screen.',act:()=>cycleView()},
  {label:'Back',back:true,desc:''}];}
function drawOptions(){const R=optRows(),pw=Math.min(W-40,300),ph=40+R.length*14+34,px=(W-pw)>>1,py=(H-ph)>>1;optSel=Math.max(0,Math.min(optSel,R.length-1));
  F('rgba(4,5,6,0.9)',0,0,W,H);box(px,py,pw,ph,'#0a0d0c','#1f2524');F(AMBER,px,py,pw,2);txt('Options',px+10,py+8,AMBER);
  R.forEach((r,i)=>{const yy=py+26+i*14,sel=i===optSel;const hov=ui(px+6,yy-3,pw-12,13,{click:()=>{optSel=i;if(r.back)optsOpen=false;else r.act();sfx('click');}});if(hov&&mouse.moved)optSel=i;
    if(sel){F('#141917',px+6,yy-3,pw-12,13);F(AMBER,px+6,yy-3,2,13);}txt(r.label,px+14,yy,r.back?'#6f7a6a':sel?'#e3e6dc':'#b9c0b3');if(r.val)txt(r.val,px+pw-12,yy,AMBER,'right');});
  const d=R[optSel].desc;if(d)wrap(d,px+10,py+30+R.length*14,pw-20,9,'#8e978b');txt('W S or click   Enter to change   ESC back',px+pw/2,py+ph-11,'#4f5a55','center');}
const TITLE_OPTS=[{n:'Continue',d:'Pick up your saved run between decks.',go:()=>{if(hasSave())loadRun();else{sfx('deny');}},dim:()=>!hasSave()},
  {n:'New game',d:'Ride the lift down. One life. Uses your run setup.',go:()=>newGame()},
  {n:'Run setup',d:'Starting sector and challenge modifiers you have unlocked.',go:()=>{setupOpen=true;setupSel=0;sfx('map');}},
  {n:'Arcade',d:'A dim arcade with every cabinet and a broken coin dispenser.',go:()=>newArcadeHall()},
  {n:'Test range',d:'Every weapon, item and piece of gear in one room, with dummies.',go:()=>newTest()},
  {n:'Codex',d:'Everything known about the station.',go:()=>{codexOpen=true;cxCat=0;cxSel=0;sfx('map');}},
  {n:'Options',d:'Game settings.',go:()=>{optsOpen=true;optSel=0;sfx('map');}},
  {n:'Version history',d:'What has changed, build by build.',go:()=>{histOpen=true;histScroll=0;sfx('map');}}];
function drawHistory(){
  const pw=Math.min(W-40,420),ph=H-30,px=(W-pw)>>1,py=15;
  F('rgba(4,5,6,0.9)',0,0,W,H);box(px,py,pw,ph,'#0a0d0c','#1f2524');F(AMBER,px,py,pw,2);
  txt('Version history',px+10,py+8,AMBER);txt('current v'+GAME_VERSION,px+pw-10,py+8,'#8e978b','right');
  histScroll=Math.max(0,Math.min(histScroll,VERSIONS.length-1));
  let y=py+24;const bottom=py+ph-18;
  for(let i=histScroll;i<VERSIONS.length;i++){const [v,d]=VERSIONS[i];if(y>bottom-10)break;
    txt('v'+v,px+10,y,i===0?AMBER:'#c9cfc2');y=wrap(d,px+62,y,pw-74,10,'#8e978b')+4;}
  if(histScroll>0)txt('more above',px+pw-10,py+24,'#4f5a55','right');
  txt('W S or wheel to scroll   ESC or click to close',px+pw/2,py+ph-12,'#4f5a55','center');
}
function menuButton(x,y){const w=112,h=14,hov=ui(x,y,w,h,{click:()=>{menuOpen=true;mapOpen=false;mouse.l=false;mouse.r=false;sfx('map');}});
  box(x,y,w,h,hov?'#1c2220':'#0e1211',hov?AMBER:'#3a423f');F(AMBER,x+6,y+4,6,6);F('#0e1211',x+8,y+6,2,2);txt('Open pack  TAB',x+w/2+7,y+4,hov?AMBER:'#c9cfc2','center');}
function drawRoute(){
  F('#050607',0,0,W,H);const N=route.nodes,cur=route.cur,dEx=nodeDist(cur)[route.exit];
  txt('SECTOR '+(route.sector+1)+'  /  '+BNAMES[route.sector%6].toUpperCase(),8,6,AMBER);const dK=knownDist(cur)[route.exit];txt('depth '+depth+'.  '+(dEx===0?'this is the exit lift':dK>0?'a charted route to the exit: '+dK+' jump'+(dK>1?'s':''):'the exit lift is marked, but not the way there'),8,16,'#8e978b');
  txt('W S or click   Enter to ride   TAB pack',W-8,6,'#4f5a55','right');if(!menuOpen)menuButton(W-120,18);
  const mx=26,my=38,mw=W-52,mh=H-104,X=n=>mx+n.x*mw,Y=n=>my+n.y*mh;
  for(let y=0;y<mh;y+=14)F('#0b0e0d',mx,my+y,mw,1);
  const RO=routeOpts(),opts=RO.map(o=>o.j);routeSel=Math.max(0,Math.min(routeSel,opts.length-1));const selX=RO[routeSel]&&RO[routeSel].x;
  N.forEach((n,i)=>n.links.forEach(j=>{if(j<i||!linkKnown(i,j))return;const hot=(i===cur&&j===opts[routeSel])||(j===cur&&i===opts[routeSel]),adj=i===cur||j===cur;ctx.strokeStyle=hot&&!selX?AMBER:adj?'#6b5220':'#1a201e';ctx.lineWidth=hot&&!selX?2:1;ctx.beginPath();ctx.moveTo(X(n),Y(n));ctx.lineTo(X(N[j]),Y(N[j]));ctx.stroke();}));
  // express shafts: a double amber line with a lightning mark
  N.forEach((n,i)=>(n.xl||[]).forEach(j=>{if(j<i||!xKnown(i,j))return;const hot=selX&&((i===cur&&j===opts[routeSel])||(j===cur&&i===opts[routeSel])),adj=i===cur||j===cur,x1=X(n),y1=Y(n),x2=X(N[j]),y2=Y(N[j]),L=Math.hypot(x2-x1,y2-y1)||1,px=-(y2-y1)/L*1.6,py=(x2-x1)/L*1.6;
    ctx.strokeStyle=hot?'#ffd070':adj?'#b08030':'#5a4418';ctx.lineWidth=1;for(const s of [1,-1]){ctx.beginPath();ctx.moveTo(x1+px*s,y1+py*s);ctx.lineTo(x2+px*s,y2+py*s);ctx.stroke();}
    const mx=(x1+x2)/2,my=(y1+y2)/2;ctx.fillStyle='#050607';ctx.fillRect(mx-4,my-5,8,10);ctx.strokeStyle=hot?'#ffe8a0':adj?'#d9a441':'#7a5a20';ctx.beginPath();ctx.moveTo(mx+2,my-4);ctx.lineTo(mx-2,my);ctx.lineTo(mx+1,my);ctx.lineTo(mx-2,my+4);ctx.stroke();}));
  N.forEach((n,i)=>{const x=X(n),y=Y(n),isCur=i===cur,oi=opts.indexOf(i),sel=oi>=0&&oi===routeSel,Nd=NODE[n.type],known=n.known;
    if(oi>=0){const hov=ui(x-11,y-11,22,22,{click:()=>{routeSel=oi;pickRoute(oi);}});if(hov&&mouse.moved)routeSel=oi;}
    if(n.cond&&n.cond.vault&&!isCur){const a=n.cond.vault.opened?0.25:0.35+0.25*Math.sin(T*2+i);ctx.strokeStyle=`rgba(232,192,112,${a})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y-13);ctx.lineTo(x+4,y-9);ctx.lineTo(x,y-5);ctx.lineTo(x-4,y-9);ctx.closePath();ctx.stroke();}
    ctx.fillStyle=isCur?'#2a2214':n.visited?'#0a0c0b':'#0e1211';circ(x,y,7);
    ctx.strokeStyle=sel?AMBER:isCur?'#8a6a24':n.exit?'#7fd08e':oi>=0?(known?Nd.col:'#8e978b'):(known?Nd.col+'88':'#2a302e');ctx.lineWidth=sel||n.exit?2:1;ctx.beginPath();ctx.arc(x,y,7,0,6.283);ctx.stroke();
    if(sel){ctx.strokeStyle=`rgba(217,164,65,${0.3+0.3*Math.sin(T*6)})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,10,0,6.283);ctx.stroke();}
    txt(isCur?'@':n.visited?'.':known?Nd.icon:'?',x,y-4,isCur?AMBER:known?Nd.col:oi>=0?'#c9cfc2':'#3f4642','center');
    if(n.exit)txt('EXIT',x,y+9,'#7fd08e','center');
    if(known&&!isCur&&n.cond&&!n.visited){if(n.cond.light!=='normal')F(n.cond.light==='dark'?'#4a5a8a':'#f0e8b0',x+5,y-8,3,3);if(n.cond.haz)F('#e05a40',x+5,y+5,3,3);}});
  const chD=route.chaser?nodeDist(cur)[route.chaser.at]:-1,chVis=route.chaser&&((chD>=0&&chD<=2)||route.chaserSeen>0);
  if(route.chaser&&!chVis)txt('something is hunting this sector',W-8,H-66,'#a05040','right');
  if(chVis){const c=N[route.chaser.at],x=X(c),y=Y(c),B=BOSSES[route.chaser.boss],pl=0.5+0.5*Math.sin(T*4);ctx.strokeStyle=`rgba(224,80,64,${0.4+0.5*pl})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,12+pl*2,0,6.283);ctx.stroke();
    ctx.fillStyle='#e05040';ctx.beginPath();ctx.moveTo(x,y-17);ctx.lineTo(x+4,y-11);ctx.lineTo(x-4,y-11);ctx.closePath();ctx.fill();txt(B.name.toLowerCase(),x,y-26,'#e07060','center');}
  const n=N[opts[routeSel]];if(!n)return;
  const iy=H-56;box(8,iy,W-16,50,'#0a0d0c','#1f2524');
  const hunt=chVis&&route.chaser.at===opts[routeSel]?'  The '+BOSSES[route.chaser.boss].name+' is there.':'';
  if(selX){const c=expressCost(opts[routeSel]),have=player.inv.battery||0;txt('express shaft: '+c+' batter'+(c>1?'ies':'y')+', skips a junction  (you have '+have+')',14,iy+39,have>=c?'#e8c070':'#c08070');}
  if(n.known){txt((n.exit?'Exit lift: ':'')+NODE[n.type].name,14,iy+5,n.exit?'#7fd08e':NODE[n.type].col);const ct=condText(n.cond);if(ct)txt(ct,W-14,iy+5,'#d07a60','right');wrap(NODE[n.type].desc+(n.exit?' Finish this deck to leave the sector.':'')+hunt,14,iy+16,W-30,10,'#b9c0b3');}
  else{txt('Unknown',14,iy+5,'#8e978b');wrap('No telling what is down this shaft, or where it leads. Schematics, route logs on terminals, a signal decoder or a chatty voice on the intercom fill in the map.'+hunt,14,iy+16,W-30,10,'#6f7a6a');}
}
function drawNode(){
  F('#050607',0,0,W,H);const u=nodeUI,pw=Math.min(W-68,440),px=(W-pw)>>1;
  box(px,14,pw,H-28,'#0a0d0c','#1f2524');F(u.col,px,14,pw,2);
  txt(u.title,px+10,22,u.col);txt('depth '+depth+'  /  '+sector(depth).toLowerCase(),px+pw-10,22,'#4f5a55','right');
  let y=wrap(u.body,px+10,38,pw-20,10,'#c9cfc2')+6;
  if(u.merchant)txt('your scrap: '+player.inv.scrap,px+10,y,AMBER),y+=14;
  if(u.result){y=wrap(u.result,px+10,y,pw-20,10,'#e8dcb0')+8;}
  nodeSel=Math.max(0,Math.min(nodeSel,u.options.length-1));
  u.options.forEach((o,i)=>{const yy=y+i*12,sold=o.ref&&o.ref.sold,ok=!sold&&o.ok(),sel=i===nodeSel;
    const hov=ui(px+6,yy-2,pw-12,12,{click:()=>{nodeSel=i;nodeChoose(i);}});if(hov&&mouse.moved)nodeSel=i;
    if(sel){F('#141917',px+6,yy-2,pw-12,12);F(AMBER,px+6,yy-2,2,12);}
    txt((i+1)+'  '+o.label,px+14,yy,sold?'#343b38':ok?(sel?'#e3e6dc':'#b9c0b3'):'#5d655f');
    if(o.cost!=null)txt(sold?'sold':price(o.cost)+' scrap',px+pw-12,yy,sold?'#343b38':ok?AMBER:'#6a4a40','right');});
  if(u.note)txt(u.note,px+10,H-30,'#9fcf9a');
  txt('W S or click   Enter to choose   TAB pack',px+pw-10,H-30,'#4f5a55','right');if(!menuOpen)menuButton(W-120,18);
}
const logoCv=document.createElement('canvas');logoCv.width=400;logoCv.height=40;const logoCtx=logoCv.getContext('2d');
function drawLogo(cx,y){const t='KESTREL DEEP',sz=24;ctx.font=sz+'px '+FONT;ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillStyle='#120804';ctx.fillText(t,cx+3,y+4);ctx.fillText(t,cx+2,y+4);
  ctx.fillStyle='#8a3414';ctx.fillText(t,cx+2,y+2);
  ctx.fillStyle='#050607';for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1]])ctx.fillText(t,cx+dx,y+dy);
  const flick=Math.random()<0.015?0.55:1;ctx.globalAlpha=flick;
  ctx.fillStyle=AMBER;ctx.fillText(t,cx,y);
  ctx.save();ctx.beginPath();ctx.rect(0,y,W,Math.round(sz*0.4));ctx.clip();ctx.fillStyle='#ffd88a';ctx.fillText(t,cx,y);ctx.restore();
  ctx.globalAlpha=1;
  const ph=(T%5)/5;if(ph<0.3){const lc=logoCtx;lc.globalCompositeOperation='source-over';lc.clearRect(0,0,400,40);lc.font=sz+'px '+FONT;lc.textAlign='center';lc.textBaseline='top';
    lc.fillStyle='#fff';lc.fillText(t,200,6);lc.globalCompositeOperation='source-in';const gx=-40+ph/0.3*480,g=lc.createLinearGradient(gx-14,0,gx+14,0);
    g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(0.5,'rgba(255,250,220,0.9)');g.addColorStop(1,'rgba(255,255,255,0)');lc.fillStyle=g;lc.fillRect(0,0,400,40);
    ctx.drawImage(logoCv,Math.round(cx-200),y-6);}
}
const LW=440,LH=72,logoA=document.createElement('canvas'),logoB=document.createElement('canvas');logoA.width=logoB.width=LW;logoA.height=logoB.height=LH;
function logoMask(g,lines,sp){g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,LW,LH);g.font='16px '+FONT;g.textBaseline='top';g.textAlign='left';g.fillStyle='#fff';
  lines.forEach((t,li)=>{let tw=0;for(const ch of t)tw+=(g.measureText(ch).width||10)+sp;tw-=sp;let x=(LW-tw)/2;
    for(const ch of t){for(const [dx,dy] of [[0,0],[1,0],[2,0],[0,0.6],[1,0.6],[2,0.6]]){g.setTransform(1,0,0,1.6,0,0);g.fillText(ch,x+dx,2+li*19+dy);}x+=(g.measureText(ch).width||10)+sp+2;}});
  g.setTransform(1,0,0,1,0,0);}
const dithA=document.createElement('canvas'),dithB=document.createElement('canvas');dithA.width=dithA.height=dithB.width=dithB.height=2;
{const a=dithA.getContext('2d'),b=dithB.getContext('2d');a.fillStyle='#000';a.fillRect(0,0,1,1);a.fillRect(1,1,1,1);b.fillStyle='#000';b.fillRect(1,0,1,1);b.fillRect(0,1,1,1);}
function logoShadow(A,L,sp,ox,y,ly,alpha,dith){if(alpha<=0.01)return;const sdy=Math.max(-4,Math.min(4,(LH/2-ly)/9));
  logoMask(A,L,sp);A.globalCompositeOperation='source-in';A.fillStyle='#2a0e06';A.fillRect(0,0,LW,LH);
  A.globalCompositeOperation='destination-out';const pat=A.createPattern(dith,'repeat');if(pat){A.fillStyle=pat;A.fillRect(0,0,LW,LH);}
  ctx.globalAlpha=alpha;ctx.drawImage(logoA,ox+2,y+Math.round(sdy)+2);ctx.globalAlpha=1;}
function drawLogoTitle(cx,y){const L=['KESTREL','DEEP'],sp=4,A=logoA.getContext('2d'),B=logoB.getContext('2d'),ox=Math.round(cx-LW/2);
  const lp=(T%7)/7,ly=LH+34-lp*(LH+68),la=Math.sin(Math.PI*lp);
  const ph=(T%4)/4,sOn=ph<0.35,gy=LH+12-(sOn?ph/0.35:0)*(LH+24),sa=sOn?Math.sin(Math.PI*ph/0.35):0;
  ctx.globalCompositeOperation='lighter';const gl=ctx.createRadialGradient(cx,y+ly,0,cx,y+ly,120);gl.addColorStop(0,`rgba(255,140,60,${0.07*la})`);gl.addColorStop(1,'rgba(255,140,60,0)');ctx.fillStyle=gl;ctx.fillRect(cx-120,y+ly-120,240,240);ctx.globalCompositeOperation='source-over';
  logoShadow(A,L,sp,ox,y,ly,0.35+0.65*la,dithA);
  logoShadow(A,L,sp,ox,y,gy,sa,dithB);
  logoMask(B,L,sp);B.globalCompositeOperation='source-in';B.fillStyle='#e0741e';B.fillRect(0,0,LW,LH);ctx.drawImage(logoB,ox,y);
  logoMask(A,L,sp);A.globalCompositeOperation='source-in';const gc=A.createLinearGradient(0,ly-28,0,ly+28);gc.addColorStop(0,'rgba(255,215,140,0)');gc.addColorStop(0.5,`rgba(255,215,140,${0.6*la})`);gc.addColorStop(1,'rgba(255,215,140,0)');
  A.fillStyle=gc;A.fillRect(0,0,LW,LH);ctx.drawImage(logoA,ox,y);
  if(sOn){logoMask(A,L,sp);A.globalCompositeOperation='source-in';const g=A.createLinearGradient(0,gy-9,0,gy+9);
    g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(0.5,`rgba(255,252,235,${0.95})`);g.addColorStop(1,'rgba(255,255,255,0)');A.fillStyle=g;A.fillRect(0,0,LW,LH);ctx.drawImage(logoA,ox,y);}}
function drawTitle(){
  F('#050607',0,0,W,H);
  for(let i=0;i<40;i++)F(`rgba(${120+rnd(60)},${120+rnd(60)},${100+rnd(40)},${Math.random()*0.1})`,rnd(W),rnd(H),rnd(3)+1,1);
  const y0=((H-216)>>1)+24;
  drawLogoTitle(W/2,y0-20);
  F('#e0741e',W/2-100,y0+44,200,1);
  txt('Survey station Kestrel went quiet 41 days ago.',W/2,y0+51,'#c9cfc2','center');
  txt('You rode the lift down to find out why.',W/2,y0+61,'#c9cfc2','center');
  txt('The lift only goes down now.',W/2,y0+71,'#c9cfc2','center');
  const half=Math.ceil(TITLE_OPTS.length/2);
  TITLE_OPTS.forEach((o,i)=>{const col=i<half?0:1,cx=W/2+(col?66:-66),y=y0+86+(i%half)*12,sel=i===titleSel;
    const hov=ui(cx-60,y-2,120,12,{click:()=>{titleSel=i;o.go();}});if(hov&&mouse.moved)titleSel=i;
    if(sel){F('#141917',cx-60,y-2,120,12);F(AMBER,cx-60,y-2,2,12);}
    txt(o.n,cx,y,o.dim&&o.dim()?'#3f4642':sel?AMBER:'#8e978b','center');});
  const dy=y0+86+half*12+1;
  txt(TITLE_OPTS[titleSel].d,W/2,dy,'#6f7a6a','center');{const L=[];if(bestScore)L.push('best score '+bestScore+(bestSeed?' (seeded: '+bestSeed.code+')':''));if((META.setup.seedMode||'random')!=='random')L.push('next run seed: '+setupSeedText());if(L.length)txt(L.join('   '),W/2,dy+11,'#8a6a24','center');}
  txt('v'+GAME_VERSION,W-6,H-12,'#4f5a55','right');
  const L=['WASD move  LMB strike  RMB aim or block  hold RMB + LMB to fire','1-2 armaments  3+ items (LMB use, RMB drop or throw)  Q next item',
    'SPACE shove  R interact  E F skills  SHIFT sprint  TAB pack  C U K B M V'];
  L.forEach((s2,i)=>txt(s2,W/2,H-34+i*10,'#4f5a55','center'));
  if(histOpen)drawHistory();
  if(optsOpen){uiRects=[];drawOptions();}
  if(codexOpen){uiRects=[];drawCodex();}
  if(setupOpen){uiRects=[];drawSetup();}
}

