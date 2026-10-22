// ---------- HUD ability icons, hover tips and V-look descriptions (v0.98) ----------
// The E and F abilities sit as two icons left of the hotbar (which moved right to make room). Pointing at an ability
// icon or a hotbar slot shows its name and description in a box above the CREEPING line; holding V (the look key)
// and pointing at something visible in the world shows what it is in the same place. Text for fixtures and floor
// hazards: FIX_DESC and TILE_DESC (src/data/inspect.js).
const HUD_SW=17;
// left edge of the hotbar: nudged right of centre, and never so far left that the ability icons would meet the health bar
function hotbarX(){return Math.max(Math.round(W/2-hotCount()*HUD_SW/2)+10,152);}
const SKILL_COL={sonar:'#6fd0c0',adren:'#ff9a5a',cloak:'#9fc3ff',slam:'#d0a060',sling:'#c9b48a',psych:'#a88af0'};
let hudTip=null,hudStackTop=0;
const mouseIn=(x,y,w,h)=>mouse.sx>=x&&mouse.sx<x+w&&mouse.sy>=y&&mouse.sy<y+h;
function setTip(name,desc,col){if(!hudTip)hudTip={name,desc:desc||'',col:col||AMBER};}
function drawSkillGlyph(id,x,y,c){ctx.fillStyle=c;ctx.strokeStyle=c;ctx.lineWidth=1;
  if(id==='sonar'){F(c,x-1,y-1,2,2);ctx.beginPath();ctx.arc(x+0.5,y+0.5,3.5,0,6.283);ctx.stroke();ctx.globalAlpha=0.5;ctx.beginPath();ctx.arc(x+0.5,y+0.5,5.5,0,6.283);ctx.stroke();ctx.globalAlpha=1;}
  else if(id==='adren'){F(c,x,y-5,2,1);F(c,x-1,y-4,2,2);F(c,x-2,y-2,2,2);F(c,x-2,y,5,1);F(c,x+1,y+1,2,2);F(c,x,y+3,2,2);F(c,x-1,y+5,2,1);}
  else if(id==='cloak'){F(c,x-3,y-2,7,1);F(c,x-4,y-1,9,1);F(c,x-4,y,2,1);F(c,x+3,y,2,1);F(c,x-3,y+1,7,1);F(c,x-1,y-1,3,2);}
  else if(id==='slam'){F(c,x,y-5,1,6);F(c,x-2,y-1,5,1);F(c,x-1,y,3,1);F(c,x-5,y+3,11,1);F(c,x-4,y+4,2,1);F(c,x+3,y+4,2,1);}
  else if(id==='sling'){F(c,x-3,y-4,1,3);F(c,x+3,y-4,1,3);F(c,x-2,y-1,1,1);F(c,x+2,y-1,1,1);F(c,x-1,y,3,1);F(c,x,y+1,1,4);}
  else if(id==='psych'){F(c,x,y-4,1,1);F(c,x-1,y-3,3,1);F(c,x-3,y-2,7,1);F(c,x-4,y-1,9,2);F(c,x-3,y+1,7,1);F(c,x-1,y+2,3,1);F('#050607',x-1,y-1,3,2);F(c,x,y-1,1,1);}
  else txt((SKILLS[id]?SKILLS[id].name:'?')[0],x-2,y-3,c);}
// E and F icons, plus hover tips for them and for every hotbar slot (called from hud())
function drawSkillIcons(){const p=player,x0=hotbarX(),y0=H-16,live=!menuOpen&&state==='play';
  [[p.skillIdx,'E'],[p.skillIdx2,'F']].forEach(([ix,kk],k)=>{const x=x0-38+k*HUD_SW,id=ix!=null&&ix>=0?p.skills[ix]:null,S0=id?SKILLS[id]:null;
    if(!S0){box(x,y0,HUD_SW-1,15,'#0a0d0c','#1f2524');txt(kk,x+2,y0-8,'#3f4642');if(live&&mouseIn(x,y0,HUD_SW-1,15))setTip(kk+': no ability','Learn abilities from crew files and set them in Files > Skills.','#8e978b');return;}
    const cd=p.skillCd[id]||0,rdy=cd<=0,c=SKILL_COL[id]||'#9fe0b0';
    box(x,y0,HUD_SW-1,15,'#0a0d0c',rdy?c:'#2a302e');txt(kk,x+2,y0-8,rdy?c:'#5d655f');drawSkillGlyph(id,x+8,y0+7,rdy?c:'#4a524c');
    if(!rdy){const f=Math.min(1,cd/S0.cd),hh=Math.round(13*f);F('rgba(0,0,0,0.55)',x+1,y0+14-hh,HUD_SW-3,hh);txt(''+Math.ceil(cd),x+HUD_SW-2,y0+7,'#c9cfc2','right');}
    if(live&&mouseIn(x,y0,HUD_SW-1,15))setTip(kk+': '+S0.name,S0.desc+(rdy?'':'  recharging, '+Math.ceil(cd)+'s'),c);});
  // Q, left of E (v1.14.4): the item quickbar. Lit while an item slot is selected; in a skill set it reads as the way
  // back to the items
  {const x=x0-38-HUD_SW,act=!!p.actMode,c=act?'#a88af0':'#c9cfc2',sel=!act&&p.hotSel>=2;
    box(x,y0,HUD_SW-1,15,'#0a0d0c',sel?AMBER:act?'#3a3052':'#2a302e');txt('Q',x+2,y0-8,sel?AMBER:act?c:'#5d655f');
    // glyph: three stacked item cards, the front one lit
    F('#3f4642',x+6,y0+3,6,7);F('#5d655f',x+5,y0+4,6,7);F(sel?AMBER:c,x+4,y0+5,6,7);F('#0a0d0c',x+5,y0+6,4,5);F(sel?AMBER:c,x+6,y0+8,2,1);
    if(live&&mouseIn(x,y0,HUD_SW-1,15))setTip(act?'Q: back to items':'Q: item quickbar',act?'Leaves the skill set and puts your item slots (3-9) back on the hotbar.':'Steps to the next item slot (3-9) on the hotbar. In a skill set (Psych or Sling), Q puts the item slots back.',c);}
  if(!live)return;const n=hotCount();
  for(let i=0;i<n;i++){const x=x0+i*HUD_SW+(i>=2?3:0);if(!mouseIn(x,y0-8,HUD_SW-1,23))continue;
    if(i<2){const st=p.arms[i],m=st.main?ARM[st.main]:null,o=st.off&&st.off!==st.main?ARM[st.off]:null;
      setTip('Armament '+(i+1)+': '+(m?m.name:'Fists')+(o?' + '+o.name:''),(m?armDesc(st.main):'Bare hands. '+dmgRangeText('fists',FIST.dmg))+(o?'  Off hand: '+armDesc(st.off):''));}
    else if(p.actMode==='sling'){const a=p.slingbar[i-2];if(a)setTip(SLING[a].name,SLING[a].desc||'');else setTip('Empty sling slot','');}
    else if(p.actMode){const a=p.actbar[i-2];if(a)setTip(ACTS[a].name,ACTS[a].desc||'','#a88af0');else setTip('Empty action slot','');}
    else{const q=qInfo(p.quick[i-2]);if(q)setTip(q.name,q.desc||'');else setTip('Empty quick slot','Put items here from Pack > Items: select one and press 3-9.');}}}
// what is at world point (wx,wy), for V-look; null when nothing there or it cannot be seen
function itemLook(it){const t=it.type;
  if(t==='weapon'&&ARM[it.w])return {name:ARM[it.w].name,desc:armDesc(it.w)};
  if(t==='gear'&&GEAR[it.gear])return {name:GEAR[it.gear].name,desc:GEAR[it.gear].desc};
  if(t==='food'&&FOOD[it.food])return {name:FOOD[it.food].name,desc:FOOD[it.food].desc||'Food.'};
  if(t==='raw'&&RAW[it.raw])return {name:RAW[it.raw].name,desc:'A raw ingredient for cooking.'};
  if(t==='tuft'&&HERBS[it.tuft])return {name:HERBS[it.tuft].name,desc:HERBS[it.tuft].desc||'A wild herb.'};
  if(t==='tool'&&TOOLS[it.tool])return {name:TOOLS[it.tool].name,desc:TOOLS[it.tool].desc};
  if(t==='file')return {name:'Crew file',desc:'A personnel file. Attune it with clearance in Files.'};
  if(QUICK[t])return {name:QUICK[t].name,desc:QUICK[t].desc};
  const L=IT[t];return {name:L&&L.label?L.label[0].toUpperCase()+L.label.slice(1):t,desc:RESDESC[t]||CXRES&&CXRES[t]||''};}
function inspectAt(wx,wy){const tx=Math.floor(wx/TS),ty=Math.floor(wy/TS);if(tx<0||ty<0||tx>=MW||ty>=MH)return null;const i=ty*MW+tx;
  let be=null,bd=1e9;for(const e of enemies){if(e.dead)continue;const d=Math.hypot(e.x-wx,e.y-wy);if(d<e.r+5&&d<bd&&visible(e.x,e.y,e.r)){bd=d;be=e;}}
  if(be){const B=BEASTINFO[be.type]||{name:be.type},st=be.friendT>0?'friendly':be.frozenT>0?'frozen':be.alert?'hunting you':'unaware';
    return {name:(be.tr?traitNames(be)+' '+B.name.toLowerCase():B.name)+'  ('+st+')'+(be.kit?'  - '+kitText(be):''),desc:(B.move?'Moves: '+B.move+'. ':'')+(B.attack?'Attacks: '+B.attack+'.':''),col:'#e07060'};}
  {const cm=secCams.find(c=>Math.hypot(c.x-wx,c.y-wy)<7)||camAtTile(tx,ty);if(cm&&seen[(cm.ty+cm.dy)*MW+cm.tx+cm.dx]&&visible(cm.x,cm.y,4))return camLook(cm);}
  if(!seen[i]||!visible(wx,wy,0))return null;
  for(const it of items)if(!it.fall&&Math.hypot(it.x-wx,it.y-wy)<7)return itemLook(it);
  for(const c of chests)if(!c.opened&&Math.hypot(c.x-wx,c.y-wy)<8)return {name:c.tier==='rare'?'Rare chest':'Chest',desc:'Needs a key to open'+(c.caged?', and the cage around it raised':'')+'.'};
  for(const b of barrels)if(!b.dead&&Math.hypot(b.x-wx,b.y-wy)<7)return b.crate?{name:b.wood?'Wooden crate':'Metal crate',desc:'Heavy enough to hold down a floor plate. Push it with a shove or kick.'+(b.wood?' Breaks under a sledge, a heavy charged hit or a blast.':'')}:{name:'Fuel barrel',desc:'Rolls when pushed. Heat or fire sets it off: a big explosion.'};
  for(const pn of panels)if(pn.tx===tx&&pn.ty===ty)return pn.hack?{name:'Hack panel: '+(HACKR[pn.reward]?HACKR[pn.reward].label:'?'),desc:pn.state==='done'?'Already cracked.':pn.state==='dead'?'Burnt out.':'R to hack. Two misses short it out.',col:'#6fd0c0'}:{name:'Terminal',desc:'A station terminal.'};
  for(const v of vendors)if(v.tx===tx&&v.ty===ty)return {name:v.name,desc:v.state==='dead'?'Out of order.':'A vending machine. Pays in scrap; can be kicked.'};
  for(const f of fixtures)if(f.tx===tx&&f.ty===ty){if(f.kind==='npc'&&NPCS[f.npc])return {name:NPCS[f.npc].name,desc:NPCS[f.npc].body||'',col:'#c9a8ff'};const D=FIX_DESC[f.kind];if(D)return D;}
  for(const t of traps)if(t.found&&(t.tx===tx&&t.ty===ty||t.area&&tx>=t.tx&&tx<=t.tx+1&&ty>=t.ty&&ty<=t.ty+1))return {name:TRAP_TYPES[t.type].name+(t.off?' (locked)':''),desc:TRAP_TYPES[t.type].desc,col:'#e08060'};
  for(const c of crawls)for(const e of [c.a,c.b])if(e&&e.tx===tx&&e.ty===ty)return {name:'Crawlway hatch',desc:CRAWL_DESC};
  for(const pd of plateDoors){if(pd.tx===tx&&pd.ty===ty)return {name:'Plate door',desc:'Opens while its floor plate holds 3 weight'+(pd.room?'. A release button inside holds it open for a few seconds.':'.')};
    if(pd.px===tx&&pd.py===ty)return {name:'Door plate',desc:'Holds its door open while it carries 3 weight: you, a creature, a crate or dropped items.'};}
  if(exitT&&Math.max(Math.abs(tx-exitT.x),Math.abs(ty-exitT.y))<=1)return {name:'Exit lift',desc:'R anywhere on the plate to ride down'+(liftState==='open'||liftState==='ready'?'.':', once it opens.'),col:'#9fe0b0'};
  if(freightT&&Math.max(Math.abs(tx-freightT.x),Math.abs(ty-freightT.y))<=1)return {name:'Freight lift',desc:'R on the plate: drops you several decks at once.',col:'#e8c070'};
  if(map[i]===1)return null;
  {const g=gasLook(wx,wy);if(g)return g;}
  if(hz[i]===1)return TILE_DESC.fire;if(hz[i]===2)return TILE_DESC.toxic;if(hz[i]===5)return TILE_DESC.cable;
  if(chasm[i])return TILE_DESC.chasm;if(molten[i]===1)return TILE_DESC.molten;if(molten[i]===2)return TILE_DESC.crust;
  if(webs[i])return TILE_DESC.web;if(rubble&&rubble[i])return TILE_DESC.rubble;if(oil[i]>0)return TILE_DESC.oil;if(ice[i])return TILE_DESC.ice;if(slime[i])return TILE_DESC.slime;
  if(liq[i]>=1)return {name:'Water'+(LIQNAME[liq[i]]?', '+LIQNAME[liq[i]]:''),desc:TILE_DESC.water.desc};
  return null;}
// V-look, then the tip box itself; the box sits above the CREEPING / winded line and grows upward
function wrapLines(s,maxW){ctx.font='8px '+FONT;const out=[];let line='';for(const w of s.split(' ')){const t=line?line+' '+w:w;if(line&&ctx.measureText(t).width>maxW){out.push(line);line=w;}else line=t;}if(line)out.push(line);return out;}
function drawHudTip(){const p=player;if(!p||state!=='play'||menuOpen||mapOpen)return;
  if(!hudTip&&p.peek){const r=inspectAt(mouse.sx+camX,mouse.sy+camY);if(r)hudTip={name:r.name,desc:r.desc||'',col:r.col||AMBER};}
  const t=hudTip;hudTip=null;if(!t)return;
  const maxW=Math.min(220,W-40),lines=t.desc?wrapLines(t.desc,maxW):[];ctx.font='8px '+FONT;
  const bw=Math.round(Math.max(ctx.measureText(t.name).width,...lines.map(l=>ctx.measureText(l).width))+10),bh=11+lines.length*9+3,cx=W/2+20,bx=Math.round(Math.max(4,Math.min(W-bw-4,cx-bw/2))),by=Math.min(H-40,hudStackTop||H-40)-bh;
  F('rgba(6,8,8,0.88)',bx,by,bw,bh);F('#2a302e',bx,by,bw,1);F('#2a302e',bx,by+bh-1,bw,1);F(t.col,bx,by,2,bh);
  txt(t.name,bx+5,by+3,t.col);lines.forEach((l,k)=>txt(l,bx+5,by+13+k*9,'#c9cfc2'));}
