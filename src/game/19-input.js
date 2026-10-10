// keep the browser's own drag, select, middle-click scroll and shortcut behaviour out of the way of the game
for(const ev of ['dragstart','selectstart','drop','dragover'])addEventListener(ev,e=>e.preventDefault(),{capture:true});
addEventListener('mousedown',e=>{if(e.button===1||e.shiftKey||e.ctrlKey||e.altKey)e.preventDefault();if(document.activeElement!==cv)cv.focus({preventScroll:true});},{capture:true});
addEventListener('auxclick',e=>e.preventDefault(),{capture:true});
addEventListener('keydown',e=>{if(state==='play'||state==='route'||state==='node'){if(['Space','Tab','ShiftLeft','ShiftRight','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Slash','Quote','AltLeft','AltRight','F1'].includes(e.code))e.preventDefault();}},{capture:true});
function syncButtons(e){if(state==='play'&&!paused()&&!menuOpen&&typeof e.buttons==='number'){mouse.l=(e.buttons&1)!==0;mouse.r=(e.buttons&2)!==0;}}
addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();mouse.sx=(e.clientX-r.left)/r.width*W;mouse.sy=(e.clientY-r.top)/r.height*H;mouse.moved=true;syncButtons(e);});
cv.addEventListener('mousedown',e=>{if(state==='play'&&!paused()&&!menuOpen){if(e.button===0)mouse.l=true;else if(e.button===2)mouse.r=true;}});
addEventListener('mouseup',e=>{if(e.button===0)mouse.l=false;if(e.button===2)mouse.r=false;});
cv.addEventListener('pointerdown',e=>{
  initAudio();
  if(state==='dead'){if(deadT>1){state='title';titleSel=hasSave()?0:1;}return;}
  if(state==='report'){if(e.button===0)reportAdvance();return;}
  if(state==='title'&&histOpen){histOpen=false;return;}
  if(state==='title'||state==='route'||state==='node'){if(e.button===0)for(const r of uiRects)if(mouse.sx>=r.x&&mouse.sx<=r.x+r.w&&mouse.sy>=r.y&&mouse.sy<=r.y+r.h&&r.click){r.click();break;}return;}
  if(hackUI){if(e.button===0)hackTry();return;}
  if(arcadeUI){const a=arcadeUI;if(e.button!==0)return;if(a.over)startArcade(a.f);else if(ARC[a.g].click)ARC[a.g].click(a,mouse.sx-a.fx,mouse.sy-a.fy);return;}
  if(choiceUI||diceUI){if(e.button===0)for(const r of uiRects)if(mouse.sx>=r.x&&mouse.sx<=r.x+r.w&&mouse.sy>=r.y&&mouse.sy<=r.y+r.h&&r.click){r.click();break;}return;}
  if(grindUI){if(e.button===0)for(const r of uiRects)if(mouse.sx>=r.x&&mouse.sx<=r.x+r.w&&mouse.sy>=r.y&&mouse.sy<=r.y+r.h&&r.click){r.click();break;}return;}
  if(deckUI){if(e.button===0)for(const r of uiRects)if(mouse.sx>=r.x&&mouse.sx<=r.x+r.w&&mouse.sy>=r.y&&mouse.sy<=r.y+r.h&&r.click){r.click();break;}return;}
  if(spawnUI){if(e.button===0)for(const r of uiRects)if(mouse.sx>=r.x&&mouse.sx<=r.x+r.w&&mouse.sy>=r.y&&mouse.sy<=r.y+r.h&&r.click){r.click();break;}return;}
  if(vendUI){if(e.button===0)for(const r of uiRects)if(mouse.sx>=r.x&&mouse.sx<=r.x+r.w&&mouse.sy>=r.y&&mouse.sy<=r.y+r.h&&r.click){r.click();break;}return;}
  if(mapOpen)return;
  if(menuOpen){if(e.button===0)for(const r of uiRects)if(mouse.sx>=r.x&&mouse.sx<=r.x+r.w&&mouse.sy>=r.y&&mouse.sy<=r.y+r.h&&r.click){r.click();break;}return;}
  if(e.button===0)mouse.l=true;else if(e.button===2)mouse.r=true;
});
addEventListener('pointerup',e=>{if(e.button===0)mouse.l=false;if(e.button===2)mouse.r=false;syncButtons(e);});
addEventListener('wheel',e=>{
  if(state==='title'&&histOpen){histScroll+=e.deltaY>0?1:-1;return;}
  if(state!=='play'&&!(menuOpen&&(state==='route'||state==='node')))return;const d=e.deltaY>0?1:-1;
  if(menuOpen){mouse.moved=false;if(menuTab===2)wbSel+=d;else if(menuTab===5&&fileMode===1)upSel=Math.max(0,upSel+d);else if(menuTab===1){}else if(menuTab===0)pkSel=Math.max(0,pkSel+d);else if(menuTab===5&&fileMode!==1){if(fileMode===0)flSel=Math.max(0,Math.min(FILES.filter(f=>hasFile(f.id)).length-1,flSel+d));else skSel=Math.max(0,Math.min(skillList().length-1,skSel+d));}else if(menuTab===3)fdSel=Math.max(0,Math.min(foodList().length-1,fdSel+d));else bxSel=Math.max(0,Math.min(BEASTS.length-1,bxSel+d));return;}
  if(!mapOpen){const n=hotCount();setHot((player.hotSel+d+n)%n);}},{passive:true});
function onPress(code){
  initAudio();
  const up=code==='ArrowUp'||code==='KeyW',down=code==='ArrowDown'||code==='KeyS',go=code==='Enter'||code==='Space'||code==='KeyR';
  if(state==='title'&&code==='KeyV'){cycleView();return;}
  if(state==='title'&&setupOpen){const R=setupRows(),n=R.length;if(code==='Escape'||code==='Backspace'){setupOpen=false;return;}if(code==='KeyW'||code==='ArrowUp')setupSel=(setupSel+n-1)%n;if(code==='KeyS'||code==='ArrowDown')setupSel=(setupSel+1)%n;
    if(code==='KeyA'||code==='ArrowLeft')setupAct(R[setupSel],-1);if(code==='KeyD'||code==='ArrowRight')setupAct(R[setupSel],1);if(code==='Enter'||code==='Space')setupAct(R[setupSel],0);return;}
  if(state==='title'&&codexOpen){if(code==='Escape'||code==='Backspace'){codexOpen=false;return;}if(code==='KeyA'||code==='ArrowLeft'){cxCat--;cxSel=0;cxScroll=0;}if(code==='KeyD'||code==='ArrowRight'){cxCat++;cxSel=0;cxScroll=0;}if(code==='KeyW'||code==='ArrowUp')cxSel--;if(code==='KeyS'||code==='ArrowDown')cxSel++;sfx('click');return;}
  if(state==='title'&&optsOpen){const R=optRows(),n=R.length;if(code==='Escape'||code==='Backspace'){optsOpen=false;return;}if(up)optSel=(optSel+n-1)%n;if(down)optSel=(optSel+1)%n;if(code==='Enter'||code==='Space'){const r=R[optSel];if(r.back)optsOpen=false;else r.act();sfx('click');}return;}
  if(state==='title'&&histOpen){if(up)histScroll--;if(down)histScroll++;if(code==='Escape'||code==='Enter'||code==='Space'||code==='Backspace')histOpen=false;return;}
  if(state==='title'){const n=TITLE_OPTS.length;if(up)titleSel=(titleSel+n-1)%n;if(down)titleSel=(titleSel+1)%n;if(code==='Enter'||code==='Space')TITLE_OPTS[titleSel].go();return;}
  if(state==='dead'){if((code==='Enter'||code==='Space')&&deadT>1)state='title';titleSel=hasSave()?0:1;return;}
  if(state==='report'){if(go)reportAdvance();return;}
  if(hackUI){if(code==='Escape')hackUI=null;else if(go)hackTry();return;}
  if(arcadeUI){const a=arcadeUI;if(code==='Escape'||code==='Tab'){arcadeUI=null;return;}
    if(!a.over){const G=ARC[a.g];if(G.key)G.key(a,code);}
    else if(code==='KeyR'||code==='Enter'||code==='Space')startArcade(a.f);return;}
  if(diceUI){if(code==='Escape'&&diceUI.phase!=='rps'){diceUI=null;return;}const n=code.startsWith('Digit')?+code.slice(5):0;if(diceUI.phase==='rps'&&n>=1&&n<=3)diceThrow(n-1);else if(go)diceNext();return;}
  if(choiceUI){const n=choiceUI.opts.length;if(code==='Escape'||code==='Tab'){choiceUI=null;return;}choiceUI.sel=choiceUI.sel||0;if(up)choiceUI.sel=(choiceUI.sel+n-1)%n;if(down)choiceUI.sel=(choiceUI.sel+1)%n;
    const d=code.startsWith('Digit')?+code.slice(5):0;if(d>=1&&d<=n)choicePick(d-1);else if(go)choicePick(choiceUI.sel);return;}
  if(grindUI){const n=grindRows().length;if(code==='Escape'||code==='Tab'){grindUI=null;return;}if(up)grindUI.sel=(grindUI.sel+n-1)%n;if(down)grindUI.sel=(grindUI.sel+1)%n;if(go)grindChoose(grindUI.sel);return;}
  if(deckUI){const n=deckRows().length;if(code==='Escape'||code==='Tab'){deckUI=null;return;}if(up)deckUI.sel=(deckUI.sel+n-1)%n;if(down)deckUI.sel=(deckUI.sel+1)%n;
    const r=deckRows()[deckUI.sel];if(r.opt&&(code==='KeyA'||code==='ArrowLeft'))cycleDeck(r.opt,-1);else if(r.opt&&(code==='KeyD'||code==='ArrowRight'))cycleDeck(r.opt,1);else if(go)deckChoose(deckUI.sel,1);return;}
  if(spawnUI){const n=spawnOpts().length;if(code==='Escape'||code==='Tab'){spawnUI=null;return;}if(up)spawnUI.sel=(spawnUI.sel+n-1)%n;if(down)spawnUI.sel=(spawnUI.sel+1)%n;if(go)spawnChoose(spawnUI.sel);return;}
  if(vendUI){const n=vendOpts().length;if(code==='Escape'||code==='Tab'){vendUI=null;return;}if(up)vendUI.sel=(vendUI.sel+n-1)%n;if(down)vendUI.sel=(vendUI.sel+1)%n;
    if(go)vendChoose(vendUI.sel);const d=code.startsWith('Digit')?+code.slice(5):0;if(d>=1&&d<=n)vendChoose(d-1);return;}
  if(code==='Tab'){menuOpen=!menuOpen;mapOpen=false;mouse.l=false;mouse.r=false;sfx('map');return;}
  if(state==='route'||state==='node'){
    if(menuOpen){if(code==='Escape')menuOpen=false;else menuKey(code);return;}
    if(state==='route'){const n=routeOpts().length;if(up)routeSel=(routeSel+n-1)%n;if(down)routeSel=(routeSel+1)%n;if(go)pickRoute(routeSel);}
    else{const n=nodeUI.options.length;if(up)nodeSel=(nodeSel+n-1)%n;if(down)nodeSel=(nodeSel+1)%n;if(go)nodeChoose(nodeSel);
      const d=code.startsWith('Digit')?+code.slice(5):0;if(d>=1&&d<=n)nodeChoose(d-1);}
    return;}
  if(code==='KeyC'){if(menuOpen&&menuTab===2)menuOpen=false;else{menuOpen=true;menuTab=2;}mapOpen=false;mouse.l=false;mouse.r=false;return;}
  if(code==='KeyB'){if(menuOpen&&menuTab===6&&progMode===0)menuOpen=false;else{menuOpen=true;menuTab=6;progMode=0;}mapOpen=false;mouse.l=false;mouse.r=false;return;}
  if(code==='KeyK'){if(menuOpen&&menuTab===5)menuOpen=false;else{menuOpen=true;menuTab=5;}mapOpen=false;mouse.l=false;mouse.r=false;return;}
  if(code==='KeyM'){mapOpen=!mapOpen;menuOpen=false;mouse.l=false;sfx('map');return;}
  if(code==='KeyU'&&(state==='play')){if(menuOpen&&menuTab===5&&fileMode===1)menuOpen=false;else{menuOpen=true;menuTab=5;fileMode=1;}mapOpen=false;mouse.l=false;mouse.r=false;return;}
  if(code==='Escape'){if(menuOpen&&eqPopup){eqPopup=null;return;}menuOpen=false;mapOpen=false;return;}
  if(menuOpen){menuKey(code);return;}
  if(mapOpen){if(code===SECURE_CFG.key&&deckSecured)walkBack();return;}
  if(crawlAsk&&state==='play'){crawlKey(code);return;}
  if(player&&player.astral){if(code==='KeyQ'||code==='Escape'){endAstral('you snap back into your body');}else if(code.startsWith('Digit')){const n0=+code.slice(5);if(n0>=3)setHot(n0-1);}else if(code==='KeyE'||code==='KeyF'){}return;}
  const n=code.startsWith('Digit')?+code.slice(5):-1;
  if(n===1||n===2)setHot(n-1);
  else if(n>=3&&n<=9){if(n-3<qCap())setHot(n-1);else{say('slot '+n+' is locked');sfx('click');}}
  else if(code==='KeyQ'&&player.actMode){player.actMode=false;setHot(2);say('back to your items');}
  else if(code==='KeyQ'){const qs=selQuick();setHot(2+((qs<0?-1:qs)+1)%qCap());}
  else if(player.frozenT>0&&['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(code))frozenMash();
  else if(player.frozenT>0&&['KeyF','KeyE','Space','KeyR'].includes(code)){sfx('click');}
  else if(code==='KeyF')useSkill(2);
  else if(code==='Space')spaceAct();
  else if(code==='KeyR'){if(exitLiftAt()||!activeReloadPress())interact();}
  else if(code==='KeyE')useSkill(1);
  else if((code==='ShiftLeft'||code==='ShiftRight')&&hasMove('blink'))blink();
  else if((code==='ShiftLeft'||code==='ShiftRight')&&hasMove('dash'))dash();
}
function menuKey(code){
  mouse.moved=false;
  if(code==='KeyQ'||(code==='ArrowLeft'||code==='KeyA')&&menuTab!==0&&menuTab!==5&&menuTab!==3&&menuTab!==6){menuTab=(menuTab+6)%7;sfx('click');return;}
  if(code==='KeyE'||(code==='ArrowRight'||code==='KeyD')&&menuTab!==0&&menuTab!==5&&menuTab!==3&&menuTab!==6){menuTab=(menuTab+1)%7;sfx('click');return;}
  const up=code==='ArrowUp'||code==='KeyW',down=code==='ArrowDown'||code==='KeyS',go=code==='Enter'||code==='KeyR'||code==='Space';
  if(menuTab===2){
    if(code==='KeyX'){onlyCraftable=!onlyCraftable;wbSel=0;wbScroll=0;sfx('click');return;}
    if(up)wbSel--;if(down)wbSel++;
    if(go){const sel=wbRows().filter(r=>r.r);craft(sel[Math.max(0,Math.min(wbSel,sel.length-1))]&&sel[Math.max(0,Math.min(wbSel,sel.length-1))].r);}
  }else if(menuTab===4){
  }else if(menuTab===5&&fileMode===1&&!(code==='KeyA'||code==='KeyD'||code==='ArrowLeft'||code==='ArrowRight')){if(up)upSel=Math.max(0,upSel-1);if(down)upSel++;if(go){const sel=upPerkRows().filter(r=>!r.hdr);const r=sel[Math.min(upSel,sel.length-1)];if(r&&r.u)buyUpgrade(r.u);}
  }else if(menuTab===1){if(eqPopup){const O=popupOpts();if(up)epSel=(epSel+O.length-1)%O.length;if(down)epSel=(epSel+1)%O.length;if(go&&O[epSel])O[epSel].act();}
  }else if(menuTab===0&&(code==='KeyA'||code==='KeyD'||code==='ArrowLeft'||code==='ArrowRight')){pkMode=(pkMode+(code==='KeyA'||code==='ArrowLeft'?2:1))%3;pkSel=0;pkScroll=0;sfx('click');
  }else if(menuTab===0){const R=packRows().filter(r=>!r.hdr);if(up)pkSel=Math.max(0,pkSel-1);if(down)pkSel=Math.min(R.length-1,pkSel+1);
    if(code==='KeyF'&&R[pkSel]){useFromMenu(R[pkSel]);return;}
    if(go&&R[pkSel]&&R[pkSel].act)R[pkSel].act();const n=code.startsWith('Digit')?+code.slice(5):-1;if(n>=3&&n<=9&&R[pkSel]&&R[pkSel].kind==='quick')assignQuick(R[pkSel].id,n-3);
  }else if(menuTab===5&&(code==='KeyA'||code==='KeyD'||code==='ArrowLeft'||code==='ArrowRight')){fileMode=(fileMode+(code==='KeyA'||code==='ArrowLeft'?2:1))%3;sfx('click');
  }else if(menuTab===5&&fileMode===0){const FL=FILES.filter(f=>hasFile(f.id));if(up)flSel=Math.max(0,flSel-1);if(down)flSel=Math.min(FL.length-1,flSel+1);if(go&&FL[flSel])attuneFile(FL[flSel]);
  }else if(menuTab===5&&fileMode===3){if(up)prScroll=Math.max(0,prScroll-20);if(down)prScroll+=20;
  }else if(menuTab===5){
    const L=skillList();if(up)skSel=Math.max(0,skSel-1);if(down)skSel=Math.min(L.length-1,skSel+1);
    if(go&&L[skSel])bindSkill(L[skSel]);
  }else if(menuTab===3&&fdMode===1&&code==='KeyX'){cookOnly=!cookOnly;fdSel=0;sfx('click');
  }else if(menuTab===3){if(code==='KeyA'||code==='KeyD'||code==='ArrowLeft'||code==='ArrowRight'){fdMode=(fdMode+(code==='KeyA'||code==='ArrowLeft'?2:1))%3;fdSel=0;sfx('click');return;}const L=foodList();if(up)fdSel=Math.max(0,fdSel-1);if(down)fdSel=Math.min(L.length-1,fdSel+1);if(go&&L[fdSel])useFoodRow(L[fdSel]);}
  else if(code==='KeyA'||code==='KeyD'||code==='ArrowLeft'||code==='ArrowRight'){progMode=(progMode+(code==='KeyA'||code==='ArrowLeft'?2:1))%3;sfx('click');}
  else if(progMode===2){const n=AP_TRADES.length;if(up)apSel=(apSel+n-1)%n;if(down)apSel=(apSel+1)%n;if(go)apTrade(AP_TRADES[apSel]);}
  else{if(up)bxSel=Math.max(0,bxSel-1);if(down)bxSel=Math.min(BEASTS.length-1,bxSel+1);}
}
