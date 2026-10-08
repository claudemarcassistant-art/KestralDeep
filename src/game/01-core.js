let W=384,H=216;const TS=12;
// deck size in tiles, set per deck by setDeckSize(); AREA is the deck's area relative to a 64x64 Medium deck
let MW=64,MH=64,AREA=1,deckSize='m';
// scale a generation count by deck area, rounding randomly so the average stays exact
function aN(n){const v=n*AREA,f=Math.floor(v);return f+(Math.random()<v-f?1:0);}
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
cv.width=W;cv.height=H;ctx.imageSmoothingEnabled=false;
const fcv=document.createElement('canvas');fcv.width=W;fcv.height=H;const fctx=fcv.getContext('2d');
const vcv=document.createElement('canvas');vcv.width=W;vcv.height=H;
function buildVignette(){vcv.width=W;vcv.height=H;const c=vcv.getContext('2d');const g=c.createRadialGradient(W/2,H/2,H*0.35,W/2,H/2,W*0.62);
g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,0.55)');c.fillStyle=g;c.fillRect(0,0,W,H);
c.fillStyle='rgba(0,0,0,0.13)';for(let y=0;y<H;y+=2)c.fillRect(0,y,W,1);}
buildVignette();
const mcv=document.createElement('canvas');mcv.width=MW*TS;mcv.height=MH*TS;const mctx=mcv.getContext('2d');
const FONT='Silkscreen, "Courier New", monospace';
const AMBER='#d9a441';
const BASE_R=70,LASER_LEN=110,FLARE_R=72;

const VIEWS=[[384,216],[448,252],[512,288],[576,324],[640,360]];
let viewIdx=2;try{const v=+localStorage.getItem('kd_view');if(v>=0&&v<VIEWS.length&&localStorage.getItem('kd_view')!==null)viewIdx=v;}catch(e){}
let pixScale=1,lastIW=-1,lastIH=-1;
function resize(){
  const iw=innerWidth||document.documentElement.clientWidth||1280,ih=innerHeight||document.documentElement.clientHeight||720;lastIW=innerWidth;lastIH=innerHeight;
  let s=Math.min(iw/384,ih/216);if(!(s>0))s=1;if(s>=1)s=Math.floor(s);pixScale=s;
  const [vw,vh]=VIEWS[viewIdx];
  if(s>=1){W=Math.max(384,Math.min(vw,Math.floor(iw/s)));H=Math.max(216,Math.min(vh,Math.floor(ih/s)));}else{W=384;H=216;}
  cv.width=W;cv.height=H;ctx.imageSmoothingEnabled=false;fcv.width=W;fcv.height=H;buildVignette();
  cv.style.width=W*s+'px';cv.style.height=H*s+'px';
}
function cycleView(){viewIdx=(viewIdx+1)%VIEWS.length;try{localStorage.setItem('kd_view',''+viewIdx);}catch(e){}resize();
  const [vw,vh]=VIEWS[viewIdx];const note=(W<vw||H<vh)?' (window limits it to '+W+' x '+H+')':'';
  if(typeof say==='function'&&state==='play')say('view '+(viewIdx+1)+'/'+VIEWS.length+': '+vw+' x '+vh+note);sfx('click');}
addEventListener('resize',resize);resize();

const rnd=n=>Math.floor(Math.random()*n);
const rr=(a,b)=>a+Math.random()*(b-a);
// ---- run seeds
// The station is generated from the run seed. Generation runs inside seeded(keys,fn) scopes, which swap Math.random
// for a generator seeded by the run seed plus what is being generated (a sector, a deck, a lift ride), so playing
// differently on one deck never changes another. Everything outside a scope (combat, creature decisions, effects)
// keeps the ordinary Math.random.
const realRandom=Math.random;
function mulberry32(a){return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
// 32-bit hash of text (FNV-1a with a final mix)
function seedHash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}h^=h>>>16;h=Math.imul(h,2246822507);h^=h>>>13;return h>>>0;}
function withSeed(n,fn){const prev=Math.random;Math.random=mulberry32(n);try{return fn();}finally{Math.random=prev;}}
// the run's seed: {code:'40715382', kind:'random'|'typed'|'daily'}; null outside runs (test range, arcade)
let runSeed=null;
// typed seeds ignore case, spaces and punctuation: 'brine 4471' is the same seed as 'BRINE-4471'
const seedKey=code=>String(code).toUpperCase().replace(/[^A-Z0-9]/g,'');
// run fn on its own sub-stream: takes exactly one draw from the current stream whatever fn does, so rolls that depend
// on the player (files already found, gear owned) cannot shift the rest of a deck's generation
function subSeed(fn){return withSeed((Math.random()*4294967296)>>>0,fn);}
function seeded(keys,fn){return runSeed?withSeed(seedHash(seedKey(runSeed.code)+'|'+keys.join('|')),fn):fn();}
// random seeds are 8-digit numbers (no leading zero): 90 million possible stations
function randomSeedCode(){return String(10000000+Math.floor(realRandom()*90000000));}
function dailySeedCode(){const d=new Date();return 'DAILY-'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');}
const D4=[[1,0],[-1,0],[0,1],[0,-1]],D8=[...D4,[1,1],[1,-1],[-1,1],[-1,-1]];
function wpick(arr){let s=0;for(const a of arr)s+=a[1];let r=Math.random()*s;for(const a of arr){if((r-=a[1])<0)return a[0];}return arr[0][0];}
function angDiff(a,b){let d=a-b;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;}

