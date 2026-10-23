// ---------- HUD ----------
function hud(){
  const p=player;
  txt('DEPTH '+depth,6,5,AMBER);txt(levelLabel||sector(depth),6,14,'#7f8a7c');const ctL=condText(cond)&&(!testMode||testDeck)?condText(cond)+(hazOff&&cond.haz?' (purged)':''):'';if(ctL)txt(ctL,6,23,'#b8665a');
  hudCornerRects(ctL);
  txt('HP',6,H-22,'#9aa39a');
  if(p.ghost>0){const gw=Math.min(72,Math.round(72*p.ghost/maxHp()));F('#1a1e26',22,H-25,72,3);F('#dfe8ff',22,H-25,gw,3);txt(''+Math.ceil(p.ghost),6,H-31,'#dfe8ff');}  // the ghost health number sits above HP, left of the bars (v1.14.5), clear of the hotbar's Q icon
  {const bm=baseMaxHp(),mx=maxHp(),lost=Math.round(72*(bm-mx)/bm);F('#2a1512',22,H-21,72,6);F(p.hp>30?'#b84a3e':(Math.sin(T*10)>0?'#e0604e':'#8a3228'),22,H-21,Math.round(72*Math.min(1,p.hp/bm)),6);if(lost>0){F('#4a4a4a',22+72-lost,H-21,lost,6);for(let k=0;k<lost;k+=3)F('#3a3a3a',22+72-lost+k,H-21,1,6);}}
  if(p.stam<maxStam()||p.floating||p.sprinting){F('#1a1810',22,H-14,72,2);F(p.stamLock?'#6a5a30':'#c9b46a',22,H-14,Math.round(72*p.stam/maxStam()),2);}
  if(p.armor>0){txt('AR',6,H-12,'#9aa39a');F('#141c24',22,H-10,72,3);F('#6f93b3',22,H-10,Math.round(72*p.armor/50),3);}
  // left column, bottom up: recharge bars, combo, air, guard, then the status meters. Each bar starts after its label
  // and count, measured (v1.17), so two-digit counts never sit under the bar.
  {let ry=H-40;
    const lbx=lb=>{ctx.font='8px '+FONT;return Math.max(40,Math.ceil(8+(ctx.measureText(lb).width||0)+4));};
    const bar=(lb,lc,bg,c,f,h,marks)=>{txt(lb,6,ry-2,lc);const bx=lbx(lb),bw=94-bx;F(bg,bx,ry,bw,h);F(c,bx,ry,Math.round(bw*Math.max(0,Math.min(1,f))),h);if(marks)for(const q of marks)F('#050607',bx+Math.round(bw*q),ry,1,h);};
    const cds=[['strike',p.mcd,p.mcdMax,'#e8dcb0'],['fire',p.weapon?p.cd:0,p.cdMax,'#ffd98a'],['shove',p.shoveCd,p.shoveMax,'#c9b48a']];
    for(const [n,rem,mx,c] of cds){if(!(rem>0.02)||!(mx>0.05))continue;bar(n,'#6f7a6a','#141817',c,1-Math.min(1,rem/mx),2);ry-=8;}
    if(p.combo>=1){const t=comboTier(),col=t?COMBO_T[3-t][2]:'#8e978b';bar('combo '+Math.floor(p.combo),col,'#141817',col,p.combo/20,2,[.25,.5,.75]);ry-=8;}
    if((p.o2==null?100:p.o2)<99.5){const o=p.o2/100;bar('air',o<0.25?'#ff8a7a':'#6f7a6a','#141817',o<0.25?(Math.sin(T*10)>0?'#ff8a7a':'#a04040'):'#9fd8ff',o,2);ry-=8;}
    if(p.guard<(p.guardMax||40)-0.5){bar('guard','#6f7a6a','#101820','#bfe4ff',p.guard/(p.guardMax||40),2);ry-=8;}
    for(const [k,n,c] of [['frz','cold','#9fd8ff'],['brn','burn','#ff8a3a'],['slk','slick','#b09060'],['rad','rads','#c9a8ff'],['stk','sticky','#c8d070'],['psn','poison','#8fcf40'],['shk','shock','#8fc3ff'],['stn','stun','#e8dcb0'],['szr','seizing','#c89ae8'],['irr','irritated','#e8e4be'],['wet','wet','#4a9ad0']]){const v=p.st[k];if(!(v>=1))continue;
    bar(k==='frz'&&p.frozenT>0?'frozen':n,c,'#141817',c,v/100,3);ry-=9;}
    hudLeft=ry<H-40?{x1:98,y0:ry+4,y1:H-36}:null;}
  // top centre, top down (v1.14.4; placed round the corners in v1.17): the lockdown or purge line, the lift line, the
  // breach count, the wave line, then messages, each on its own row. topRow() moves a row down past any corner line it
  // would touch; a big banner first tries the small font on its own row before dropping below the corners.
  let ty=6;topW=0;
  const bigRow=(s0,col,blink)=>{ctx.font='16px '+FONT;const w=ctx.measureText(s0).width||0;let y=topRow(w,14,ty),sz=16;
    if(y!==ty||leftClash(w,y,14)){ctx.font='8px '+FONT;const w8=ctx.measureText(s0).width||0,y8=topRow(w8,8,ty);if(y8===ty||leftClash(w,y,14)){y=y8;sz=8;}}
    ctx.font=sz+'px '+FONT;topW=Math.max(topW,ctx.measureText(s0).width||0);if(!blink)txt(s0,W/2,y,col,'center',sz);ty=y+(sz===16?18:10);};
  const smallRow=(s0,col,show)=>{for(const l of leftWrap(s0,ty)){ctx.font='8px '+FONT;const w=ctx.measureText(l).width||0;topW=Math.max(topW,w);const y=topRow(w,8,ty);if(show!==false)txt(l,W/2,y,col,'center');ty=y+10;}};
  if(levelTimer>0)bigRow('LOCKDOWN  '+fmtT(levelTimer),Math.sin(T*8)>0?'#ff6050':'#a03020');
  else if(purgeGas)smallRow('PURGE GAS   get to the lift',Math.sin(T*6)>0?'#a0e060':'#608030');
  if(liftState==='alarm')bigRow('LIFT INBOUND  '+fmtT(alarmT),Math.sin(T*8)>0?'#ff6050':'#a03020');
  else if(liftState==='ready')bigRow('LIFT READY','#9fe0b0',!(Math.sin(T*5)>-0.3));
  else if(liftState==='arena')smallRow('clear the arena: '+arenaFoes().length+' left','#e8c070');
  else if(liftState==='locked'&&!liftCard)smallRow('objective: find the lift keycard','#e8c070');
  else if(liftState==='idle')smallRow('objective: call the lift and hold out','#e8c070');
  if(liftState==='alarm'){const a=0.08+0.06*Math.sin(T*8);F(`rgba(200,30,20,${a})`,0,0,W,4);F(`rgba(200,30,20,${a})`,0,H-4,W,4);F(`rgba(200,30,20,${a})`,0,0,4,H);F(`rgba(200,30,20,${a})`,W-4,0,4,H);}
  ty=Math.max(ty,18);
  if(liftState==='alarm'&&cores.length){const lc=cores.filter(c=>!c.dead).length;smallRow(lc?lc+' breach'+(lc>1?'es':'')+' open':'breaches sealed',lc?'#ff8a9a':'#9fcf9a');}
  if(waves&&!testMode||waves&&waves.phase!=='wait'){const w=waves;
    if(w.phase==='wait')smallRow('movement below: '+Math.ceil(w.trigT)+'s, or at '+Math.round(w.trigPct*100)+'% explored ('+Math.round(w.pct*100)+'%)','#8e978b');
    else if(w.phase==='warn')smallRow('SOMETHING IS COMING','#ff8070',Math.sin(T*8)>-0.2);
    else if(w.phase==='active')smallRow('WAVE '+w.wave+' / '+w.n+(w.wave<w.n?'   next in '+Math.ceil(w.t)+'s':''),'#ff8070');}
  // messages keep their old top (26) and each takes the next free row
  ty=Math.max(26,ty);const msgRows=msgs.map(m=>leftWrap(m.s,ty).map(l=>{ctx.font='8px '+FONT;const w=ctx.measureText(l).width||0;topW=Math.max(topW,w);const y=topRow(w,8,ty);ty=y+10;return [l,y];}));
  const stackBottom=ty;
  if(p.cloakT>0){const a=0.05+0.03*Math.sin(T*4);F(`rgba(120,170,255,${a})`,0,0,W,3);F(`rgba(120,170,255,${a})`,0,H-3,W,3);}
  if(p.stimT>0)txt('stim '+Math.ceil(p.stimT)+'s',102,H-56,'#9fe0b0');
  // bottom right, drawn upward from H-12, one 9 px line each (v1.14.6): ammo in reserve (or the tank, or guard), the
  // magazine on its own line above it, then RMB and LMB. The block is only as wide as its longest line; when the hotbar
  // would reach it on a narrow view it moves up above the hotbar (rLift)
  {const set=p.arms[p.armSet],two=set.main&&ARM[set.main].hand==='two';
    const qsHud=p.hotSel>=2,qid=qsHud?p.quick[selQuick()]:null,qq=qInfo(qid),w=p.weapon?WPN[p.weapon]:null,L=[];
    let lmb,rmb;
    if(qsHud&&p.actMode){const ak=p.actMode==='sling'?p.slingbar[selQuick()]:p.actbar[selQuick()],an=ak?(p.actMode==='sling'?SLING[ak]:ACTS[ak]).name:null;lmb=an?'LMB '+an.toLowerCase():'LMB empty slot';rmb='RMB aim';}
    else if(qsHud){lmb='LMB '+(qq?(qid==='flask'?'fill or drink':'use '+qq.name):'empty slot');rmb='RMB '+(qid==='flask'?'throw':qq?'drop':'-');}
    else{lmb='LMB '+(set.main?ARM[set.main].name:'Fists');rmb='RMB '+(two?'Block':set.off?ARM[set.off].name:'Block');}
    const mags=w&&MAGS[p.weapon],m=mags?magLeft(p.weapon):0;
    if(w)L.push([p.inv[w.ammo]+' '+w.ammo,p.inv[w.ammo]>0?(mags?'#c9a860':AMBER):'#b84a3e']);
    else if(set.off==='tank'){const T0=p.tank||{n:0};L.push(['tank: '+(T0.kind||'empty')+' '+T0.n+'/'+TANKMAX,T0.n?(FLASKCOL[T0.kind]==='#3a3020'?'#b8a070':FLASKCOL[T0.kind]||AMBER):'#5d655f']);}
    else L.push(['guard '+Math.round(p.guard)+'/'+Math.round(p.guardMax||40),'#bfe4ff']);
    if(mags)L.push([m+'/'+magCap(p.weapon),m>0?AMBER:'#b84a3e']);
    L.push([rmb,'#e3e6dc'],[lmb,'#c9cfc2']);
    ctx.font='8px '+FONT;const bw=Math.max(...L.map(l=>ctx.measureText(l[0]).width||0));
    const rLift=hotbarX()+hotCount()*HUD_SW+3>W-6-bw-4?-26:0;if(rLift){ctx.save();ctx.translate(0,rLift);}
    L.forEach(([t0,c],k)=>txt(t0,W-6,H-12-k*9,c,'right'));const topY=H-12-(L.length-1)*9;
    if(mags){if(p.reloadT>0||p.arFlash>0){const k=p.reloadT>0?1-p.reloadT/p.reloadMax:1,bx=W-60,by=H-4,bw2=54;F('#141817',bx,by,bw2,4);F(p.arFail>0?'#a07050':'#d9a441',bx,by,Math.round(bw2*k),4);
        if(p.arPos!=null&&p.reloadT>0){const mx=bx+Math.round(bw2*p.arPos),mw=Math.max(2,Math.round(bw2*p.arW));F('rgba(255,240,180,0.35)',mx,by-1,mw,6);F('#fff4c8',mx,by-1,1,6);F('#fff4c8',mx+mw-1,by-1,1,6);}
        if(p.arFlash>0)F(`rgba(255,250,220,${p.arFlash/ACTIVE_RELOAD.flash*0.9})`,bx-1,by-2,bw2+2,8);}
      else if(m===0&&p.inv[w.ammo]>0&&Math.sin(T*6)>0)txt('R reload',W-6,topY-9,'#ff8a7a','right');}
    if(p.weapon==='ray'&&p.charge>0){F('#0a1a10',W-71,topY-5,64,3);F('#8fffa8',W-71,topY-5,Math.round(64*p.charge/1.2),3);}
    if(rLift)ctx.restore();
    hudBR={x0:W-6-bw,y0:topY-(mags||p.weapon==='ray'?10:1)+rLift,y1:H};}
  // bottom centre (v1.14.4): the player's states stack upward from just above the hotbar, one row each, in this order
  // from the bottom; hudStackTop is where the stack ends, and the hover tip and V-look box sit above it
  {const rows=[];
    if(p.creeping)rows.push(['CREEPING','#9fc3e0']);else if(p.stamLock)rows.push(['winded','#8a7a50']);
    if(p.liq>=2)rows.push([LIQNAME[p.liq],'#8fc3cf']);
    if(p.liq===4)rows.push(['no weapons, shove only','#8fc3cf']);
    if(p.frozenT>0)rows.push(['FROZEN','#cfe8ff']);else if(p.dazeT>0)rows.push(['DAZED','#e8dcb0']);
    if(p.cloakT>0)rows.push(['CLOAKED '+Math.ceil(p.cloakT)+'s','#9fc3ff']);
    if(archive&&archive.unstT>0)rows.push(['POWER FAILS IN '+Math.ceil(archive.unstT)+'s',Math.sin(T*6)>0?'#ff8a5a':'#c06040']);
    if(p.aiming&&p.moveMul<0.95)rows.push(['backpedal slowed','#8e978b']);
    if(depth===1&&hintT>0)rows.push(['1-2 armaments  3+ items  Q next item  E F skills  TAB pack','#7f8a7c',Math.min(1,hintT/2)]);
    // a row that would reach the bottom-right block (or the left column) wraps onto two lines (v1.17)
    let k=0;const cx=W/2+20;for(const [s0,c,al] of rows){const y=H-34-k*10,R=hudBR,right=R&&y+8>R.y0&&y<R.y1?R.x0-6:W-6,maxW=2*Math.min(right-cx,cx-100);
      const L=wrapLines(s0,maxW);if(al!=null)ctx.globalAlpha=al;for(let q=L.length-1;q>=0;q--){txt(L[q],cx,H-34-k*10,c,'center');k++;}ctx.globalAlpha=1;}
    hudStackTop=k?H-34-(k-1)*10-2:H-38;}
  {const n=hotCount(),sw=HUD_SW,x0=hotbarX(),y0=H-16;drawSkillIcons();
    for(let i=0;i<n;i++){const x=x0+i*sw+(i>=2?3:0),sel=i===p.hotSel;box(x,y0,sw-1,15,sel?'#1c2220':'#0a0d0c',sel?AMBER:'#2a302e');txt(''+(i+1),x+2,y0-8,sel?AMBER:'#3f4642');
      if(i<2){const st=p.arms[i],show=st.off&&ARM[st.off].gun?st.off:st.main||st.off;if(show)drawItem({x:x+8+camX,y:y0+7+camY,type:'weapon',w:show,ph:0,icon:true});else{ctx.fillStyle='#c9c1a0';circ(x+8,y0+7,2.5);}continue;}
      if(p.actMode==='sling'){const a=p.slingbar[i-2];if(a){const A=SLING[a];F(A.col,x+4,y0+3,8,8);F('#050607',x+6,y0+5,4,4);txt(slingCount(a)==='inf'?'':slingCount(a),x+sw-2,y0+7,'#e3e6dc','right');}continue;}
      if(p.actMode){const a=p.actbar[i-2];if(a){const A=ACTS[a],cd=p.actCd[a]||0;F(A.col,x+4,y0+3,8,8);F('#050607',x+6,y0+5,4,4);F(A.col,x+7,y0+6,2,2);if(cd>0){F('rgba(0,0,0,0.65)',x+1,y0+1,sw-3,13);txt(''+Math.ceil(cd),x+sw-2,y0+7,'#8e978b','right');}}continue;}
      const id=p.quick[i-2],q=qInfo(id),cnt=q?(q.cnt?q.cnt():q.n()):0,usable=q&&q.n()>0;if(id){ctx.globalAlpha=usable?1:0.35;qIcon(id,x+8,y0+7);ctx.globalAlpha=1;txt(''+cnt,x+sw-2,y0+7,usable?'#e3e6dc':'#5d655f','right');}}
    if(p.actMode)F('#a88af0',x0+2*sw+3,y0+15,(n-2)*sw,1);}
  if(p.blocking||p.guard<(p.guardMax||40)-0.5){F('#101820',22,H-27,72,3);F('#bfe4ff',22,H-27,Math.round(72*p.guard/(p.guardMax||40)),3);}
  if((S.shield||0)>0){F('#181020',22,H-31,72,2);F('#c9a8ff',22,H-31,Math.round(72*(p.ward||0)/S.shield),2);}
  {const rs='scrap '+p.inv.scrap+' pwd '+p.inv.powder+' pipe '+p.inv.pipe+' batt '+p.inv.battery+' cloth '+p.inv.cloth;txt(rs,W-6,5,'#8e978b','right');ctx.font='8px '+FONT;const rw=ctx.measureText(rs).width||200;txt('keys '+p.inv.key+'   ',W-6-rw,5,p.inv.key?AMBER:'#5d655f','right');}
  {const ss='score '+(runScore+liveLevelScore());txt(ss,W-6,14,'#8e978b','right');ctx.font='8px '+FONT;const sw=ctx.measureText(ss).width||60;
    // clearance waiting to be spent on crew files, beside the score (green when there is any)
    txt('clearance '+(p.clear||0)+'   ',W-6-sw,14,p.clear?'#9fe0b0':'#5d655f','right');}
  // disturbance: the third line on the right, under the score, with its eye just left of the text (v1.14.7)
  if(alertOn()||alertLock&&depth>=3){const a=alertLock?0:Math.min(1,alertM/100),st=a<0.25?0:a<0.5?1:a<0.75?2:3,col=['#6f7a6a','#c9b46a','#e0904a','#ff5a4a'][st],dt0=alertLock?'dampened':'disturbance '+Math.floor(a*100)+'%';ctx.font='8px '+FONT;const ex=Math.round(W-6-(ctx.measureText(dt0).width||80)-9),ey=27;
    ctx.strokeStyle=col;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ex-5,ey);ctx.quadraticCurveTo(ex,ey-[0.5,2,3.5,5][st],ex+5,ey);ctx.quadraticCurveTo(ex,ey+[0.5,2,3.5,5][st],ex-5,ey);ctx.stroke();
    if(st>0){ctx.fillStyle=col;circ(ex,ey,st);if(st===3&&Math.sin(T*8)>0){ctx.fillStyle='#fff';circ(ex,ey,1);}}
    txt(dt0,W-6,ey-4,alertLock?'#7fd8e0':col,'right');}
  msgs.forEach((m,i)=>{ctx.globalAlpha=Math.min(1,m.t);for(const [l,y] of msgRows[i])txt(l,W/2,y,'#e8dcb0','center');ctx.globalAlpha=1;});
  // banners (v1.17): the boss name, the ride-down line and the arrival banner (DEPTH, area, conditions) are one block of
  // rows, never sharing a row. It sits where the arrival banner always did (DEPTH at H/2-30) unless the top-centre
  // stack reaches it, then just below the stack. hudBanner is its rect, which the interaction prompt keeps clear of.
  {const rows=[];
    if(bannerBoss>0){bannerBoss-=1/60;const B=bossRef?BOSSES[bossRef.boss||0]:null;if(B)rows.push({h:16,a:Math.min(1,bannerBoss),w:0,d:y=>txt(B.name.toUpperCase(),W/2,y,'#e05040','center',16)});}
    if(transitToast>0&&state==='play'){transitToast-=1/60;rows.push({h:16,a:Math.min(1,transitToast),w:160,d:y=>{box(W/2-80,y,160,14,'#0a0d0c','#d9a441');txt('found something on the ride down',W/2,y+4,'#e8dcb0','center');}});}
    let arrive=-1;
    if(bannerT>0){arrive=rows.length;const a=Math.min(1,bannerT),c=condText(cond)&&!testMode?condText(cond):'',ar=arcadeMode?'insert coin':levelLabel&&!(testMode&&!testDeck)?sector(depth)+'  /  '+levelLabel:sector(depth);
      rows.push({h:18,a,d:y=>txt(arcadeMode?'ARCADE':testMode&&!testDeck?'TEST RANGE':'DEPTH '+depth,W/2,y,AMBER,'center',16)});rows.push({h:c?11:9,a,d:y=>txt(ar,W/2,y,'#c9cfc2','center')});if(c)rows.push({h:9,a,d:y=>txt(c,W/2,y,'#d07a60','center')});}
    hudBanner=null;
    if(rows.length){const above=rows.slice(0,arrive<0?rows.length:arrive).reduce((s0,r)=>s0+r.h,0),hb=rows.reduce((s0,r)=>s0+r.h,0);
      let y=Math.max(stackBottom+4,Math.round((arrive<0?H/2-58:H/2-30)-above));
      const bw=Math.max(160,...rows.map(r=>r.w||0));
      hudBanner={x0:W/2-bw/2-90,x1:W/2+bw/2+90,y0:y,y1:y+hb};
      for(const r of rows){ctx.globalAlpha=r.a;r.d(y);ctx.globalAlpha=1;y+=r.h;}}
    // the whole top-centre area in use (stack and banners), which the interaction prompt keeps clear of
    const tw=topW+8;hudTop=hudBanner?{x0:Math.min(hudBanner.x0,W/2-tw/2-90),x1:Math.max(hudBanner.x1,W/2+tw/2+90),y0:0,y1:hudBanner.y1}:stackBottom>26?{x0:W/2-tw/2-90,x1:W/2+tw/2+90,y0:0,y1:stackBottom}:null;}
  drawHudTip();
  const it=findInteract();
  if(it){const x=Math.round(it.x-camX);let y=Math.round(it.y-camY)-16;const has=p.inv.key>0;
    // the prompt is always readable: below the banner block when it would touch it (v1.17)
    // (on a small view where that would reach the state rows above the hotbar, it stays put on a dark backing instead)
    promptBack=false;{const R=hudTop;if(R&&x>R.x0&&x<R.x1&&y+12>R.y0&&y-2<R.y1){if(R.y1+16<(hudStackTop||H-38))y=R.y1+6;else promptBack=true;}}
    if(it.k==='crawl')ptxt('R climb into the crawlway',x,y+4,'#e8c070','center');
    else if(it.k==='pdrelease')ptxt(it.pd.holdT>0?'door held open':'R door release',x,y+4,'#e0c080','center');
    else if(it.k==='panel')ptxt('R hack: '+HACKR[it.pn.reward].label,x,y+4,'#6fd0c0','center');
    else if(it.k==='console')ptxt('R creature console',x,y-2,'#c9a8ff','center');
    else if(it.k==='mdoor'){const m2=map[it.ty*MW+it.tx],ins=doorInside(it.md);ptxt(m2===0?'R close door':m2===6?(ins?'R lock door':'R open door'):(ins?'R unlock and open':'R unlock (key)'),x,y-2,'#c9cfc2','center');}
    else if(it.k==='fix')ptxt(it.f.kind==='locker'?'R search locker':it.f.kind==='medstation'?'R use medstation':it.f.kind==='dispenser'?'R bang on the coin dispenser':it.f.kind==='grinder'?'R use the salvager':it.f.kind==='damper'?'R use the dampening terminal':it.f.kind==='freezer'?'R open the freezer':it.f.kind==='fountain'?'R drink from the fountain':it.f.kind==='closet'?(it.f.restroom?'R open the restroom door':it.f.janitor?'R open the janitor\'s closet':'R open the door'):it.f.kind==='stasis'?'R climb into the stasis pod':it.f.kind==='breaker'?'R use the breaker panel':it.f.kind==='liftdoor'?'R open the lift doors':it.f.kind==='npc'?'R talk to the '+NPCS[it.f.npc].name.toLowerCase():it.f.kind==='camera'?'R check the lift camera':it.f.kind==='psychic'?'R talk to the sensitive':'R play '+ARC[it.f.game||'rift'].name+' (1 scrap)',x,y-4,'#c9cfc2','center');
    else if(it.k==='lift')ptxt('R call the lift (sets off the alarm)',x,y-2,'#ff8070','center');
    else if(it.k==='liftgo')ptxt(stopMode?'R ride on':'R take the lift down',x,y-2,'#9fe0b0','center');
    else if(it.k==='liftshut')ptxt(liftState==='arena'?'lift sealed':liftState==='locked'?'lift locked: needs the keycard':'lift on its way',x,y-2,'#c08070','center');
    else if(it.k==='testlift')ptxt('R test lift',x,y-2,'#e8c070','center');
    else if(it.k==='freight')ptxt('R ride the freight lift',x,y-2,'#e8c070','center');
    else if(it.k==='arcexit')ptxt('R leave the arcade',x,y-2,'#e8c070','center');
    else if(it.k==='hatch')ptxt('R climb down',x,y+6,'#c9b48a','center');
    else if(it.k==='ladder')ptxt('R climb up',x,y+4,'#c9b48a','center');
    else if(it.k==='lever')ptxt(it.l.effect==='release'?'R raise the cage':'R pull the emergency lever',x,y+4,'#e08070','center');
    else if(it.k==='vend'){const v=it.v,empty=!v.stock.some(o=>!o.sold);ptxt(v.state==='dead'?'out of order':empty?'sold out':'R use '+v.name,x,y+22,v.state==='dead'||empty?'#6a726c':'#ff9aa8','center');}
    else ptxt((it.k==='chest'?'R open chest':'R unlock door')+(has?'':'  no key'),x,y,has?AMBER:'#b8665a','center');}
}


// the six corner lines as rects (top left: depth, area, conditions; top right: keys and materials, clearance and score,
// disturbance with its eye), so top-centre rows can keep clear of them (topRow())
let hudCorners=[],hudLeft=null,hudBanner=null,hudBR=null,hudTop=null,topW=0;
function hudCornerRects(ctL){const p=player,R=[],m=s0=>{ctx.font='8px '+FONT;return ctx.measureText(s0).width||0;};
  R.push([6,5,m('DEPTH '+depth)],[6,14,m(levelLabel||sector(depth))]);if(ctL)R.push([6,23,m(ctL)]);
  const rs='scrap '+p.inv.scrap+' pwd '+p.inv.powder+' pipe '+p.inv.pipe+' batt '+p.inv.battery+' cloth '+p.inv.cloth;R.push([W-6-m(rs)-m('keys '+p.inv.key+'   '),5,0,true]);
  const ss='score '+(runScore+liveLevelScore());R.push([W-6-m(ss)-m('clearance '+(p.clear||0)+'   '),14,0,true]);
  if(alertOn()||alertLock&&depth>=3){const d0=alertLock?'dampened':'disturbance '+Math.floor(Math.min(1,alertM/100)*100)+'%';R.push([W-6-m(d0)-15,22,0,true]);}
  hudCorners=R.map(([x,y,w,right])=>right?{x0:x,x1:W-6,y0:y,y1:y+(y===22?10:8)}:{x0:x,x1:x+w,y0:y,y1:y+8});}
// the first free y at or below y for a centred row w wide and h tall, 4 px clear of every corner line
function topRow(w,h,y){const x0=W/2-w/2-4,x1=W/2+w/2+4;for(let k=0;k<8;k++){let moved=false;for(const r of hudCorners)if(x0<r.x1&&x1>r.x0&&y<r.y1+1&&y+h>r.y0-1){y=r.y1+2;moved=true;}if(!moved)break;}return y;}
// an interaction prompt: as txt(), on a dark backing when promptBack is set (it overlaps a banner)
let promptBack=false;
function ptxt(s0,x,y,col,align){if(promptBack){ctx.font='8px '+FONT;const w=ctx.measureText(s0).width||0;const A0=ctx.globalAlpha;ctx.globalAlpha=A0*.88;F('#050607',Math.round(x-w/2-3),y-2,Math.ceil(w+6),11);ctx.globalAlpha=A0;}txt(s0,x,y,col,align);}
// the left column of meters (hudLeft, set as it is drawn): a centred row w wide at y would touch it
function leftClash(w,y,h){const L=hudLeft;return !!L&&W/2-w/2-4<L.x1&&y+h>L.y0&&y<L.y1;}
// a top-centre line split into lines narrow enough to clear the left column, if the row at y would reach it
function leftWrap(s0,y){ctx.font='8px '+FONT;const w=ctx.measureText(s0).width||0;if(!leftClash(w,y,8))return [s0];return wrapLines(s0,2*(W/2-hudLeft.x1-4));}
