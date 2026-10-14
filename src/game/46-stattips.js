// ---------- Stats tab links and tooltips (v1.06, batch 4 request 23) ----------
// drawStats() (27-menus.js) draws the left list (cores and substats, stCol 0, stSel) and the right rows (statRows(),
// stCol 1, stRow). A hovered or keyboard-selected right row lights up the cores and substats that change it
// (STAT_LINKS, src/data/character.js) and shows drawStatTip(); a left item outlines the rows it feeds in amber.
// Tables: STAT_LINKS (per point amounts) and STAT_TIPS (description, the S key to break down, other sources by name).
let stLeftKey=null,stRowKey=null;
// the multiplier addStatus() applies to every status but wet
function statusBuildMul(){return Math.max(0.3,1-0.08*U('resil')-0.05*coreLv('spirit')-0.05*subPts('resolve'));}
// is this core or substat lit (a right row is active and links to it)?
const stLit=k=>!!(stRowKey&&STAT_LINKS[stRowKey]&&STAT_LINKS[stRowKey][k]);
// does the left key k feed the row?
const stFeeds=(row,k)=>!!(k&&STAT_LINKS[row]&&STAT_LINKS[row][k]);
const stNameOf=k=>CORES[k]?CORES[k].name:SUBS[k]?SUBS[k].name:k;
const stFmt=(v,u)=>{const r=Math.round(v*100)/100;return (r>0?'+':'')+r+u;};
// "what affects it": lines [text, active]; active ones carry their current contribution
function statSources(row){const L=[],T=STAT_TIPS[row]||{},links=STAT_LINKS[row]||{};
  for(const k in links){const n=CORES[k]?coreLv(k):subPts(k),[a,u]=links[k];L.push(n?[stNameOf(k).toLowerCase()+' '+n+': '+stFmt(a*n,u),true]:[stNameOf(k).toLowerCase()+' ('+stFmt(a,u)+' a '+(CORES[k]?'level':'point')+')',false]);}
  const key=T.key;if(key&&player){const pc=v=>stFmt((T.neg?-v:v)*100,'%');
    for(const id of equippedList()){const g=GEAR[id];if(g&&g[key])L.push([g.name.toLowerCase()+': '+pc(g[key]),true]);}
    if(player.files)for(const f of FILES){const t=fileTier(f.id);let v=0;for(let i=0;i<t;i++){const st=f.tiers[i].stat;if(st&&st[key])v+=st[key];}if(v)L.push([f.name.toLowerCase()+' file: '+pc(v),true]);}
    for(const b of player.buffs||[]){const f=FOOD[b.id];if(f&&f.buff&&f.buff[key])L.push([f.name.toLowerCase()+': '+pc(f.buff[key]),true]);}
    for(const b of player.tbuffs||[])if(b.buff&&b.buff[key]){const f=FOOD[b.id]||HERBAL[b.id];L.push([(f?f.name.toLowerCase():b.id)+': '+pc(b.buff[key])+', '+Math.ceil(b.t)+'s',true]);}
    const ik={spd:'spd',rof:'rof',stamina:'stam'}[key];if(ik)for(const j of player.injuries||[]){const d=INJ[j.id];if(d[ik])L.push([d.name.toLowerCase()+': '+pc(d[ik]),true]);}}
  if(row==='Health')for(const j of (player&&player.injuries)||[]){const d=INJ[j.id];if(d.hp)L.push([d.name.toLowerCase()+': '+d.hp,true]);}
  if(row==='Status build-up'&&U('resil'))L.push(['resilience '+U('resil')+': '+stFmt(-8*U('resil'),'%'),true]);
  if(row==='Skill recharge'&&U('focus'))L.push(['focus '+U('focus')+': '+stFmt(-15*U('focus'),'% psychic'),true]);
  return L;}
// the tooltip, in the HUD tip style, kept inside the menu (x,y,w,h) and right of the divider so the lit cores and
// substats on the left stay visible; below the row at ry when it fits, otherwise above it
function drawStatTip(row,sx,ry,x,y,w,h){const T=STAT_TIPS[row];if(!T)return;ctx.font='8px '+FONT;
  const L0=x+190,R0=x+w-4,maxW=Math.min(200,R0-L0-12),desc=wrapLines(T.d,maxW),src=statSources(row),srcL=[];
  for(const [s,on] of src)for(const l of wrapLines(s,maxW-6))srcL.push([l,on]);
  const also=T.also?wrapLines('also: '+T.also,maxW):[];
  const all=[row,...desc,'what affects it',...srcL.map(q=>q[0]),...also];
  const bw=Math.round(Math.min(R0-L0,Math.max(...all.map(l=>ctx.measureText(l).width))+16));
  const none=!srcL.length&&!also.length;let lines=desc.length+(none?0:1)+srcL.length+also.length;const maxLines=Math.floor((h-8-14)/9);let cut=0;if(lines>maxLines){cut=lines-maxLines;}
  const shownAlso=also.slice(0,Math.max(0,also.length-cut));lines=desc.length+(none?0:1)+srcL.length+shownAlso.length;
  const bh=11+lines*9+5,bx=Math.round(Math.max(L0,R0-bw)),by=Math.round(ry+10+bh<=y+h-4?ry+10:ry-2-bh>=y+4?ry-2-bh:Math.max(y+4,y+h-4-bh));
  F('rgba(6,8,8,0.94)',bx,by,bw,bh);F('#2a302e',bx,by,bw,1);F('#2a302e',bx,by+bh-1,bw,1);F(AMBER,bx,by,2,bh);
  txt(row,bx+5,by+3,AMBER);let yy=by+13;
  for(const l of desc){txt(l,bx+5,yy,'#c9cfc2');yy+=9;}
  if(!none){txt('what affects it',bx+5,yy,'#6d7670');yy+=9;}
  for(const [l,on] of srcL){txt(l,bx+11,yy,on?'#e3e6dc':'#5d655f');yy+=9;}
  for(const l of shownAlso){txt(l,bx+5,yy,'#5d655f');yy+=9;}}
// keyboard: W/S move within a column, A/D switch columns (the left list has CORES + SUBS entries)
function statsKey(k){const nL=Object.keys(CORES).reduce((a,c)=>a+1+CORES[c].subs.length,0),nR=statRows().length;
  if(k==='KeyA'||k==='ArrowLeft'){stCol=0;return true;}
  if(k==='KeyD'||k==='ArrowRight'){stCol=1;statsKeepVis();return true;}
  const d=(k==='KeyW'||k==='ArrowUp')?-1:(k==='KeyS'||k==='ArrowDown')?1:0;if(!d)return false;mouse.moved=false;
  if(stCol===-1){stCol=1;statsKeepVis();return true;}
  if(stCol===0)stSel=(stSel+d+nL)%nL;else{stRow=(stRow+d+nR)%nR;statsKeepVis();}return true;}
// keep the keyboard row in view: the visible count is worked out the same way drawStats() does
function statsKeepVis(){const vis=Math.max(1,Math.floor((menuRect().ph-14-18)/9));if(stRow<stScroll)stScroll=stRow;else if(stRow>=stScroll+vis)stScroll=stRow-vis+1;}
