// ---------- HUD ----------
function hud(){
  const p=player;
  txt('DEPTH '+depth,6,5,AMBER);txt(levelLabel||sector(depth),6,14,'#7f8a7c');{const ct=condText(cond);if(ct&&(!testMode||testDeck))txt(ct+(hazOff&&cond.haz?' (purged)':''),6,23,'#b8665a');}
  txt('HP',6,H-22,'#9aa39a');
  if(p.ghost>0){const gw=Math.min(72,Math.round(72*p.ghost/maxHp()));F('#1a1e26',22,H-25,72,3);F('#dfe8ff',22,H-25,gw,3);txt(''+Math.ceil(p.ghost),98,H-28,'#dfe8ff');}
  {const bm=baseMaxHp(),mx=maxHp(),lost=Math.round(72*(bm-mx)/bm);F('#2a1512',22,H-21,72,6);F(p.hp>30?'#b84a3e':(Math.sin(T*10)>0?'#e0604e':'#8a3228'),22,H-21,Math.round(72*Math.min(1,p.hp/bm)),6);if(lost>0){F('#4a4a4a',22+72-lost,H-21,lost,6);for(let k=0;k<lost;k+=3)F('#3a3a3a',22+72-lost+k,H-21,1,6);}}
  if(p.stam<maxStam()||p.floating||p.sprinting){F('#1a1810',22,H-14,72,2);F(p.stamLock?'#6a5a30':'#c9b46a',22,H-14,Math.round(72*p.stam/maxStam()),2);}
  if(p.armor>0){txt('AR',6,H-12,'#9aa39a');F('#141c24',22,H-10,72,3);F('#6f93b3',22,H-10,Math.round(72*p.armor/50),3);}
  if(waves&&!testMode||waves&&waves.phase!=='wait'){const w=waves,yy=liftState==='alarm'?34:18;
    if(w.phase==='wait')txt('movement below: '+Math.ceil(w.trigT)+'s, or at '+Math.round(w.trigPct*100)+'% explored ('+Math.round(w.pct*100)+'%)',W/2,yy,'#8e978b','center');
    else if(w.phase==='warn'){if(Math.sin(T*8)>-0.2)txt('SOMETHING IS COMING',W/2,yy,'#ff8070','center');}
    else if(w.phase==='active')txt('WAVE '+w.wave+' / '+w.n+(w.wave<w.n?'   next in '+Math.ceil(w.t)+'s':''),W/2,yy,'#ff8070','center');}
  if(liftState==='alarm'){txt('LIFT INBOUND  '+fmtT(alarmT),W/2,6,Math.sin(T*8)>0?'#ff6050':'#a03020','center',16);const lc=cores.filter(c=>!c.dead).length;if(cores.length)txt(lc?lc+' breach'+(lc>1?'es':'')+' open':'breaches sealed',W/2,24,lc?'#ff8a9a':'#9fcf9a','center');}
  else if(liftState==='ready'){if(Math.sin(T*5)>-0.3)txt('LIFT READY',W/2,6,'#9fe0b0','center',16);}
  else if(liftState==='arena')txt('clear the arena: '+arenaFoes().length+' left',W/2,6,'#e8c070','center');
  else if(liftState==='locked')txt(liftCard?'':'objective: find the lift keycard',W/2,6,'#e8c070','center');
  else if(liftState==='idle')txt('objective: call the lift and hold out',W/2,6,'#e8c070','center');
  if(liftState==='alarm'){const a=0.08+0.06*Math.sin(T*8);F(`rgba(200,30,20,${a})`,0,0,W,4);F(`rgba(200,30,20,${a})`,0,H-4,W,4);F(`rgba(200,30,20,${a})`,0,0,4,H);F(`rgba(200,30,20,${a})`,W-4,0,4,H);}
  if(levelTimer>0)txt('LOCKDOWN  '+fmtT(levelTimer),W/2,6,Math.sin(T*8)>0?'#ff6050':'#a03020','center',16);
  else if(purgeGas)txt('PURGE GAS   get to the lift',W/2,6,Math.sin(T*6)>0?'#a0e060':'#608030','center');
  {let ry=H-40;
    const cds=[['strike',p.mcd,p.mcdMax,'#e8dcb0'],['fire',p.weapon?p.cd:0,p.cdMax,'#ffd98a'],['shove',p.shoveCd,p.shoveMax,'#c9b48a']];
    for(const [n,rem,mx,c] of cds){if(!(rem>0.02)||!(mx>0.05))continue;const f=1-Math.min(1,rem/mx);txt(n,6,ry-2,'#6f7a6a');F('#141817',40,ry,54,2);F(c,40,ry,Math.round(54*f),2);ry-=8;}
    if(p.combo>=1){const t=comboTier(),col=t?COMBO_T[3-t][2]:'#8e978b';txt('combo '+Math.floor(p.combo),6,ry-2,col);F('#141817',40,ry,54,2);F(col,40,ry,Math.round(54*p.combo/20),2);for(const q of [5,10,15])F('#050607',40+Math.round(54*q/20),ry,1,2);ry-=8;}
    if((p.o2==null?100:p.o2)<99.5){const o=p.o2/100;txt('air',6,ry-2,o<0.25?'#ff8a7a':'#6f7a6a');F('#141817',40,ry,54,2);F(o<0.25?(Math.sin(T*10)>0?'#ff8a7a':'#a04040'):'#9fd8ff',40,ry,Math.round(54*o),2);ry-=8;}
    if(p.guard<(p.guardMax||40)-0.5){txt('guard',6,ry-2,'#6f7a6a');F('#101820',40,ry,54,2);F('#bfe4ff',40,ry,Math.round(54*p.guard/(p.guardMax||40)),2);ry-=8;}
    for(const [k,n,c] of [['frz','cold','#9fd8ff'],['brn','burn','#ff8a3a'],['slk','slick','#b09060'],['rad','rads','#c9a8ff'],['stk','sticky','#c8d070'],['psn','poison','#8fcf40'],['shk','shock','#8fc3ff'],['stn','stun','#e8dcb0'],['wet','wet','#4a9ad0']]){const v=p.st[k];if(v<1)continue;
    txt(k==='frz'&&p.frozenT>0?'frozen':n,6,ry-2,c);F('#141817',40,ry,54,3);F(c,40,ry,Math.round(54*v/100),3);ry-=9;}}
  if(archive&&archive.unstT>0)txt('POWER FAILS IN '+Math.ceil(archive.unstT)+'s',W/2+20,H-64,Math.sin(T*6)>0?'#ff8a5a':'#c06040','center');
  if(p.frozenT>0)txt('FROZEN',W/2+20,H-54,'#cfe8ff','center');else if(p.dazeT>0)txt('DAZED',W/2+20,H-54,'#e8dcb0','center');
  if(p.cloakT>0){txt('CLOAKED '+Math.ceil(p.cloakT)+'s',W/2+20,H-64,'#9fc3ff','center');const a=0.05+0.03*Math.sin(T*4);F(`rgba(120,170,255,${a})`,0,0,W,3);F(`rgba(120,170,255,${a})`,0,H-3,W,3);}
  if(p.stimT>0)txt('stim '+Math.ceil(p.stimT)+'s',102,H-56,'#9fe0b0');
  if(p.liq===4)txt('no weapons, shove only',W/2+20,H-54,'#8fc3cf','center');
  if(p.liq>=2)txt(LIQNAME[p.liq],W/2+20,H-44,'#8fc3cf','center');
  if(p.creeping)txt('CREEPING',W/2+20,H-34,'#9fc3e0','center');
  else if(p.stamLock)txt('winded',W/2+20,H-34,'#8a7a50','center');
  [[p.skillIdx,'E',0],[p.skillIdx2,'F',1]].forEach(([ix,kk,row])=>{if(ix==null||ix<0||!p.skills[ix])return;const id=p.skills[ix],cd=p.skillCd[id]||0,rdy=cd<=0,yy=H-62+row*14;
    txt(kk+' '+SKILLS[id].name,102,yy,rdy?'#9fe0b0':'#5d655f');F('#141a17',102,yy+10,64,2);F(rdy?'#5fae6e':'#3a4a3f',102,yy+10,Math.round(64*(1-cd/SKILLS[id].cd)),2);});
  if(p.aiming&&p.moveMul<0.95)txt('backpedal slowed',W/2+20,H-74,'#8e978b','center');
  if(p.weapon==='ray'&&p.charge>0){F('#0a1a10',W-71,H-44,64,3);F('#8fffa8',W-71,H-44,Math.round(64*p.charge/1.2),3);}
  {const set=p.arms[p.armSet],two=set.main&&ARM[set.main].hand==='two';
    const qsHud=p.hotSel>=2,qid=qsHud?p.quick[selQuick()]:null,qq=qInfo(qid);
    if(qsHud&&p.actMode){txt('LMB cast',W-6,H-30,'#c9cfc2','right');}
    else if(qsHud){txt('LMB '+(qq?(qid==='flask'?'fill or drink':'use '+qq.name):'empty slot'),W-6,H-30,'#c9cfc2','right');}
    else txt('LMB '+(set.main?ARM[set.main].name:'Fists'),W-6,H-30,'#c9cfc2','right');
    const w=p.weapon?WPN[p.weapon]:null;
    if(qsHud&&p.actMode)txt('RMB aim',W-6,H-21,'#e3e6dc','right');else if(qsHud)txt('RMB '+(qid==='flask'?'throw':qq?'drop':'-'),W-6,H-21,'#e3e6dc','right');else txt('RMB '+(two?'Block':set.off?ARM[set.off].name:'Block'),W-6,H-21,'#e3e6dc','right');
    if(w&&MAGS[p.weapon]){const m=magLeft(p.weapon),cap=magCap(p.weapon);txt(m+'/'+cap+'  '+p.inv[w.ammo]+' '+w.ammo,W-6,H-12,m>0?AMBER:'#b84a3e','right');
      if(p.reloadT>0||p.arFlash>0){const k=p.reloadT>0?1-p.reloadT/p.reloadMax:1,bx=W-60,by=H-5,bw=54;F('#141817',bx,by,bw,4);F(p.arFail>0?'#a07050':'#d9a441',bx,by,Math.round(bw*k),4);
        if(p.arPos!=null&&p.reloadT>0){const mx=bx+Math.round(bw*p.arPos),mw=Math.max(2,Math.round(bw*p.arW));F('rgba(255,240,180,0.35)',mx,by-1,mw,6);F('#fff4c8',mx,by-1,1,6);F('#fff4c8',mx+mw-1,by-1,1,6);}
        if(p.arFlash>0)F(`rgba(255,250,220,${p.arFlash/ACTIVE_RELOAD.flash*0.9})`,bx-1,by-2,bw+2,8);}else if(m===0&&p.inv[w.ammo]>0&&Math.sin(T*6)>0)txt('R reload',W-6,H-39,'#ff8a7a','right');}
    else if(w)txt(p.inv[w.ammo]+' '+w.ammo,W-6,H-12,p.inv[w.ammo]>0?AMBER:'#b84a3e','right');
    else if(set.off==='tank'){const T0=p.tank||{n:0};txt('tank: '+(T0.kind||'empty')+' '+T0.n+'/'+TANKMAX,W-6,H-12,T0.n?(FLASKCOL[T0.kind]==='#3a3020'?'#b8a070':FLASKCOL[T0.kind]||AMBER):'#5d655f','right');}
    else txt('guard '+Math.round(p.guard)+'/'+Math.round(p.guardMax||40),W-6,H-12,'#bfe4ff','right');}
  {const n=hotCount(),sw=17,x0=Math.round(W/2-n*sw/2),y0=H-16;
    for(let i=0;i<n;i++){const x=x0+i*sw+(i>=2?3:0),sel=i===p.hotSel;box(x,y0,sw-1,15,sel?'#1c2220':'#0a0d0c',sel?AMBER:'#2a302e');txt(''+(i+1),x+2,y0-8,sel?AMBER:'#3f4642');
      if(i<2){const st=p.arms[i],show=st.off&&ARM[st.off].gun?st.off:st.main||st.off;if(show)drawItem({x:x+8+camX,y:y0+7+camY,type:'weapon',w:show,ph:0});else{ctx.fillStyle='#c9c1a0';circ(x+8,y0+7,2.5);}continue;}
      if(p.actMode==='sling'){const a=p.slingbar[i-2];if(a){const A=SLING[a];F(A.col,x+4,y0+3,8,8);F('#050607',x+6,y0+5,4,4);txt(slingCount(a)==='inf'?'':slingCount(a),x+sw-2,y0+7,'#e3e6dc','right');}continue;}
      if(p.actMode){const a=p.actbar[i-2];if(a){const A=ACTS[a],cd=p.actCd[a]||0;F(A.col,x+4,y0+3,8,8);F('#050607',x+6,y0+5,4,4);F(A.col,x+7,y0+6,2,2);if(cd>0){F('rgba(0,0,0,0.65)',x+1,y0+1,sw-3,13);txt(''+Math.ceil(cd),x+sw-2,y0+7,'#8e978b','right');}}continue;}
      const id=p.quick[i-2],q=qInfo(id),cnt=q?(q.cnt?q.cnt():q.n()):0,usable=q&&q.n()>0;if(id){ctx.globalAlpha=usable?1:0.35;qIcon(id,x+8,y0+7);ctx.globalAlpha=1;txt(''+cnt,x+sw-2,y0+7,usable?'#e3e6dc':'#5d655f','right');}}
    const lab=p.hotSel<2?'armament '+(p.hotSel+1):p.actMode==='sling'?(p.slingbar[selQuick()]?SLING[p.slingbar[selQuick()]].name:'empty sling slot'):p.actMode?(p.actbar[selQuick()]?ACTS[p.actbar[selQuick()]].name:'empty action slot')+'   (Q: items)':(qInfo(p.quick[selQuick()])||{name:'empty slot'}).name;if(p.actMode)F('#a88af0',x0+2*sw+3,y0+15,(n-2)*sw,1);txt(lab,W/2,y0-18,'#8e978b','center');}
  if(p.blocking||p.guard<(p.guardMax||40)-0.5){F('#101820',22,H-27,72,3);F('#bfe4ff',22,H-27,Math.round(72*p.guard/(p.guardMax||40)),3);}
  if((S.shield||0)>0){F('#181020',22,H-31,72,2);F('#c9a8ff',22,H-31,Math.round(72*(p.ward||0)/S.shield),2);}
  {const rs='scrap '+p.inv.scrap+' pwd '+p.inv.powder+' pipe '+p.inv.pipe+' batt '+p.inv.battery+' cloth '+p.inv.cloth;txt(rs,W-6,5,'#8e978b','right');ctx.font='8px '+FONT;const rw=ctx.measureText(rs).width||200;txt('keys '+p.inv.key+'   ',W-6-rw,5,p.inv.key?AMBER:'#5d655f','right');}
  txt('score '+(runScore+liveLevelScore()),W-6,14,'#8e978b','right');
  if(alertOn()||alertLock&&depth>=3){const a=alertLock?0:Math.min(1,alertM/100),st=a<0.25?0:a<0.5?1:a<0.75?2:3,ex=10,ey=36,col=['#6f7a6a','#c9b46a','#e0904a','#ff5a4a'][st];
    ctx.strokeStyle=col;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ex-5,ey);ctx.quadraticCurveTo(ex,ey-[0.5,2,3.5,5][st],ex+5,ey);ctx.quadraticCurveTo(ex,ey+[0.5,2,3.5,5][st],ex-5,ey);ctx.stroke();
    if(st>0){ctx.fillStyle=col;circ(ex,ey,st);if(st===3&&Math.sin(T*8)>0){ctx.fillStyle='#fff';circ(ex,ey,1);}}
    txt(alertLock?'dampened':'disturbance '+Math.floor(a*100)+'%',ex+9,ey-4,alertLock?'#7fd8e0':col);}
  msgs.forEach((m,i)=>{ctx.globalAlpha=Math.min(1,m.t);txt(m.s,W/2,26+i*10,'#e8dcb0','center');ctx.globalAlpha=1;});
  if(depth===1&&hintT>0){ctx.globalAlpha=Math.min(1,hintT/2);txt('1-2 armaments  3+ items  Q next item  E F skills  TAB pack',W/2,H-46,'#7f8a7c','center');ctx.globalAlpha=1;}
  if(transitToast>0&&state==='play'){transitToast-=1/60;const a=Math.min(1,transitToast);ctx.globalAlpha=a;box(W/2-80,H/2-58,160,14,'#0a0d0c','#d9a441');txt('found something on the ride down',W/2,H/2-54,'#e8dcb0','center');ctx.globalAlpha=1;}
  if(bannerBoss>0){bannerBoss-=1/60;const B=bossRef?BOSSES[bossRef.boss||0]:null;if(B){ctx.globalAlpha=Math.min(1,bannerBoss);txt(B.name.toUpperCase(),W/2,H/2-58,'#e05040','center',16);ctx.globalAlpha=1;}}
  if(bannerT>0){ctx.globalAlpha=Math.min(1,bannerT);txt(arcadeMode?'ARCADE':testMode&&!testDeck?'TEST RANGE':'DEPTH '+depth,W/2,H/2-30,AMBER,'center',16);txt(arcadeMode?'insert coin':levelLabel&&!(testMode&&!testDeck)?sector(depth)+'  /  '+levelLabel:sector(depth),W/2,H/2-12,'#c9cfc2','center');if(condText(cond)&&!testMode)txt(condText(cond),W/2,H/2-1,'#d07a60','center');ctx.globalAlpha=1;}
  const it=findInteract();
  if(it){const x=Math.round(it.x-camX),y=Math.round(it.y-camY)-16;const has=p.inv.key>0;
    if(it.k==='crawl')txt('R climb into the crawlway',x,y+4,'#e8c070','center');
    else if(it.k==='panel')txt('R hack: '+HACKR[it.pn.reward].label,x,y+4,'#6fd0c0','center');
    else if(it.k==='console')txt('R creature console',x,y-2,'#c9a8ff','center');
    else if(it.k==='mdoor'){const m2=map[it.ty*MW+it.tx],ins=doorInside(it.md);txt(m2===0?'R close door':m2===6?(ins?'R lock door':'R open door'):(ins?'R unlock and open':'R unlock (key)'),x,y-2,'#c9cfc2','center');}
    else if(it.k==='fix')txt(it.f.kind==='locker'?'R search locker':it.f.kind==='medstation'?'R use medstation':it.f.kind==='dispenser'?'R bang on the coin dispenser':it.f.kind==='grinder'?'R use the salvager':it.f.kind==='damper'?'R use the dampening terminal':it.f.kind==='freezer'?'R open the freezer':it.f.kind==='fountain'?'R drink from the fountain':it.f.kind==='closet'?(it.f.restroom?'R open the restroom door':it.f.janitor?'R open the janitor\'s closet':'R open the door'):it.f.kind==='stasis'?'R climb into the stasis pod':it.f.kind==='breaker'?'R use the breaker panel':it.f.kind==='liftdoor'?'R open the lift doors':it.f.kind==='npc'?'R talk to the '+NPCS[it.f.npc].name.toLowerCase():it.f.kind==='camera'?'R check the lift camera':it.f.kind==='psychic'?'R talk to the sensitive':'R play '+ARC[it.f.game||'rift'].name+' (1 scrap)',x,y-4,'#c9cfc2','center');
    else if(it.k==='lift')txt('R call the lift (sets off the alarm)',x,y-2,'#ff8070','center');
    else if(it.k==='hatch')txt('R climb down',x,y+6,'#c9b48a','center');
    else if(it.k==='ladder')txt('R climb up',x,y+4,'#c9b48a','center');
    else if(it.k==='lever')txt(it.l.effect==='release'?'R raise the cage':'R pull the emergency lever',x,y+4,'#e08070','center');
    else if(it.k==='vend'){const v=it.v,empty=!v.stock.some(o=>!o.sold);txt(v.state==='dead'?'out of order':empty?'sold out':'R use '+v.name,x,y+22,v.state==='dead'||empty?'#6a726c':'#ff9aa8','center');}
    else txt((it.k==='chest'?'R open chest':'R unlock door')+(has?'':'  no key'),x,y,has?AMBER:'#b8665a','center');}
}

