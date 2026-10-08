function skillList(){return [...spaceList().map((id,i)=>({t:'SPACE',id,i,d:SPACE_STYLES[id]})),...player.moveSkills.map((id,i)=>({t:'SHIFT',id,i,d:MOVES[id]})),...player.skills.map((id,i)=>({t:'E',id,i,d:SKILLS[id]}))];}
function floatCost(){return 10*Math.max(0.3,1-0.06*(subPts('perc')+subPts('resolve')));}
function lowGrav(){return !!(cond&&cond.lowg)&&state==='play';}
function kbFr(){return lowGrav()?0.08:0.0005;}
function critChance(k){const b=WCRIT[k]!=null?WCRIT[k]:0.05;return b?Math.min(0.75,b+(S.crit||0)):0;}
function critFx(e,d){if(player&&player.rs)player.rs.crits=(player.rs.crits||0)+1;float(e.x,e.y-10,'crit '+Math.round(d*10)/10,'#ffe070');sfx('hit');for(let k=0;k<6;k++)parts.push({x:e.x,y:e.y,vx:rr(-50,50),vy:rr(-50,50),t:0.25,m:0.25,c:'#ffe070',s:1});}
function layWeb(cx,cy,ang,n){const px=-Math.sin(ang),py=Math.cos(ang);let made=0;for(let k=0;k<n;k++){const o=k-(n-1)/2,x=Math.floor((cx+px*o*TS)/TS),y=Math.floor((cy+py*o*TS)/TS);if(x<0||y<0||x>=MW||y>=MH||solid(x,y)||chasm[y*MW+x]||liq[y*MW+x]>=3)continue;webs[y*MW+x]=1;made++;}return made;}
function tearWeb(i){webs[i]=0;const x=(i%MW)*TS+6,y=((i/MW)|0)*TS+6;for(let k=0;k<6;k++)parts.push({x:x+rr(-5,5),y:y+rr(-5,5),vx:rr(-20,20),vy:rr(-20,20),t:0.4,m:0.4,c:'#d8dcd4',s:1});}
let secT=0,secBeep=0,trips=[];
function raiseAlarm(x,y,n,why){secT=Math.max(secT,6);secBeep=0;shake=Math.max(shake,4);say(why==='backup'?'a guard radios for backup. the alarm is going off':'BIOMETRIC MATCH. the alarm is going off');alertAdd(15);
  const P=player,cand=[];for(let k=0;k<200&&cand.length<n;k++){const r=randomRoom();if(!r)break;const t=freeTile(r);if(!t)continue;const wx=t.tx*TS+6,wy=t.ty*TS+6,dd=Math.hypot(wx-P.x,wy-P.y);if(dd<90||dd>260)continue;cand.push([wx,wy]);}
  for(let k=0;k<600&&cand.length<n;k++){const tx=rnd(MW),ty=rnd(MH),i=ty*MW+tx;if(map[i]!==0||chasm[i]||molten[i]===1||liq[i]>=3)continue;const wx=tx*TS+6,wy=ty*TS+6,dd=Math.hypot(wx-P.x,wy-P.y);if(dd<90||dd>260)continue;cand.push([wx,wy]);}
  for(const [wx,wy] of cand){const e=mkEnemy('guard',wx,wy);e.alert=true;e.called=true;enemies.push(e);for(let k=0;k<8;k++)parts.push({x:wx,y:wy,vx:rr(-30,30),vy:rr(-30,30),t:0.4,m:0.4,c:'#5a8ac0',s:1});}}
function genTrips(){trips=[];if(depth<2||Math.random()>0.35)return;const n=Math.max(1,aN(1+(Math.random()<0.4?1:0)));
  for(let t=0;t<200&&trips.length<n;t++){const x=2+rnd(MW-4),y=2+rnd(MH-4),i=y*MW+x;if(map[i]!==0||chasm[i]||molten[i])continue;
    for(const [ax,ay] of [[1,0],[0,1]]){let a=0,b=0;while(a<5&&!solid(x-ax*(a+1),y-ay*(a+1)))a++;while(b<5&&!solid(x+ax*(b+1),y+ay*(b+1)))b++;const L=a+b+1;if(L>4||a>=5||b>=5)continue;
      if(!solid(x-ay,y-ax)&&!solid(x+ay,y+ax)&&!solid(x-ay*2,y-ax*2)&&!solid(x+ay*2,y+ax*2)){if(Math.hypot((x-rooms[0].cx),(y-rooms[0].cy))<6||trips.some(q=>Math.abs(q.cx-x)+Math.abs(q.cy-y)<10))continue;
        trips.push({x1:(x-ax*a)*TS+6-ax*6,y1:(y-ay*a)*TS+6-ay*6,x2:(x+ax*b)*TS+6+ax*6,y2:(y+ay*b)*TS+6+ay*6,cx:x,cy:y,on:true});break;}}}}
function updateAlarm(dt){const P=player;for(const t of trips){if(!t.on)continue;if(segDist(P.x,P.y,t.x1,t.y1,t.x2,t.y2)<P.r+1&&!(P.cloakT>0&&false)){t.on=false;raiseAlarm(P.x,P.y,3+rnd(3),'trip');}}
  if(secT>0){secT-=dt;secBeep-=dt;if(secBeep<=0){secBeep=0.8;sfx('klaxon');}}}
function hasMove(k){const P=player;return P&&P.moveSkills.includes(k)&&(k==='sprint'?!hasMove('float'):(P.moveOn||{})[k]!==false);}
function bindSkill(o){if(o.t==='SPACE'){player.space=o.id;say(o.d.name.toLowerCase()+' is on space');sfx('click');return;}if(o.t!=='E'&&o.id==='float'&&player.floating&&chasm[Math.floor(player.y/TS)*MW+Math.floor(player.x/TS)]){say('not while you are hanging over a chasm');sfx('click');return;}if(o.t==='E')player.skillIdx=o.i;else if(o.id!=='sprint'){player.moveOn=player.moveOn||{};player.moveOn[o.id]=!(player.moveOn[o.id]!==false);say(o.d.name.toLowerCase()+(player.moveOn[o.id]?' on':' off'));}sfx('click');}
function setWeapon(w){if(!player.has[w]){say('no '+WPN[w].name.toLowerCase()+' yet. build one at the workbench [C]');return;}
  if(player.weapon!==w){player.weapon=w;sfx('click');}}
function cycleWeapon(dir){const owned=WORDER.filter(w=>player.has[w]);if(owned.length<2)return;
  const i=owned.indexOf(player.weapon);player.weapon=owned[(i+dir+owned.length)%owned.length];sfx('click');}

