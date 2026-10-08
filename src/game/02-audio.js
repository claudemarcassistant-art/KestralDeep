// ---------- audio ----------
let AC=null,NB=null;
function initAudio(){
  if(AC){if(AC.state==='suspended')AC.resume();return;}
  try{AC=new (window.AudioContext||window.webkitAudioContext)();const len=AC.sampleRate;NB=AC.createBuffer(1,len,AC.sampleRate);
  const d=NB.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;}catch(e){AC=null;}
}
function env(g,t,vol,dur){g.gain.setValueAtTime(vol*0.6,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);}
function nz(dur,type,freq,vol){const t=AC.currentTime;const s=AC.createBufferSource();s.buffer=NB;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;
  const g=AC.createGain();env(g,t,vol,dur);s.connect(f);f.connect(g);g.connect(AC.destination);s.start(t,Math.random()*0.5);s.stop(t+dur+0.02);}
function tone(dur,type,f0,f1,vol){const t=AC.currentTime;const o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);
  o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);const g=AC.createGain();env(g,t,vol,dur);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+dur+0.02);}
function later(ms,f){setTimeout(()=>{if(AC)try{f();}catch(e){}},ms);}
function sfx(k){if(!AC)return;try{switch(k){
  case 'deny':tone(0.07,'square',150,110,0.12);tone(0.09,'square',95,70,0.1);nz(0.05,'lowpass',500,0.25);break;
  case 'croak':tone(0.16,'square',130,85,0.07);later(170,()=>tone(0.2,'square',110,70,0.07));break;
  case 'klaxon':tone(0.35,'sawtooth',520,380,0.07);later(380,()=>tone(0.35,'sawtooth',520,380,0.07));break;
  case 'radio':nz(0.15,'bandpass',2200,0.15);tone(0.1,'square',900,1200,0.04);break;
  case 'buzz':tone(0.18,'sawtooth',230,260,0.035);tone(0.18,'sawtooth',236,250,0.03);break;
  case 'fall':tone(1.0,'sine',1400,300,0.05);tone(0.9,'triangle',900,180,0.025);break;
  case 'shot':nz(0.09,'bandpass',1300,0.4);tone(0.08,'square',150,60,0.12);break;
  case 'scatter':nz(0.25,'lowpass',1000,0.6);tone(0.14,'square',95,40,0.16);break;
  case 'nail':nz(0.03,'highpass',3200,0.12);tone(0.04,'square',900,500,0.05);break;
  case 'bolt':tone(0.22,'sawtooth',1300,180,0.12);nz(0.1,'bandpass',600,0.3);break;
  case 'boom':nz(0.9,'lowpass',380,1);tone(0.5,'sine',80,30,0.4);break;
  case 'flare':nz(0.5,'highpass',2600,0.12);tone(0.15,'triangle',500,900,0.05);break;
  case 'pick':tone(0.07,'triangle',660,990,0.1);break;
  case 'craft':tone(0.06,'square',300,300,0.06);later(70,()=>tone(0.1,'triangle',520,780,0.1));break;
  case 'equip':tone(0.05,'square',400,300,0.06);later(50,()=>tone(0.05,'square',600,500,0.05));break;
  case 'hurt':tone(0.16,'sawtooth',190,80,0.14);break;
  case 'hit':nz(0.05,'highpass',1800,0.14);break;
  case 'crunch_bat':nz(0.09,'lowpass',700,0.38);nz(0.05,'highpass',1600,0.2);tone(0.08,'square',120,55,0.12);later(40,()=>nz(0.05,'bandpass',900,0.22));break;
  case 'crunch_spear':nz(0.06,'highpass',1900,0.3);nz(0.08,'bandpass',600,0.3);tone(0.06,'sawtooth',260,90,0.1);break;
  case 'crunch_whip':nz(0.03,'highpass',3200,0.35);later(25,()=>nz(0.05,'highpass',2200,0.3));tone(0.04,'square',900,300,0.07);break;
  case 'crunch_bow':nz(0.05,'highpass',1800,0.28);nz(0.07,'lowpass',800,0.3);tone(0.06,'square',180,70,0.1);break;
  case 'thud':nz(0.07,'lowpass',700,0.2);break;
  case 'click':tone(0.03,'square',1200,1100,0.05);break;
  case 'shove':nz(0.08,'lowpass',500,0.25);break;
  case 'glob':tone(0.12,'sine',300,120,0.08);break;
  case 'map':tone(0.05,'triangle',800,1200,0.05);break;
  case 'chest':tone(0.1,'square',220,180,0.08);later(90,()=>{tone(0.2,'triangle',520,1040,0.1);});break;
  case 'door':nz(0.4,'lowpass',300,0.35);tone(0.3,'sawtooth',90,60,0.08);break;
  case 'crumble':nz(0.7,'lowpass',260,0.8);nz(0.3,'bandpass',900,0.25);break;
  case 'sonar':tone(0.6,'sine',1400,700,0.15);later(250,()=>tone(0.5,'sine',1400,700,0.07));break;
  case 'adren':tone(0.3,'sawtooth',120,480,0.1);break;
  case 'slam':nz(0.4,'lowpass',200,0.9);tone(0.3,'sine',70,35,0.3);break;
  case 'learn':tone(0.1,'triangle',440,440,0.08);later(100,()=>tone(0.1,'triangle',660,660,0.08));later(200,()=>tone(0.2,'triangle',880,880,0.08));break;
  case 'dash':nz(0.12,'bandpass',1800,0.25);tone(0.1,'sine',500,200,0.06);break;
  case 'stim':tone(0.25,'triangle',300,900,0.08);break;
  case 'slosh':nz(0.25,'bandpass',500,0.12);break;
  case 'hiss':nz(0.8,'highpass',3000,0.08);break;
  case 'steam':nz(1.3,'bandpass',1200,0.25);break;
  case 'plate':tone(0.04,'square',420,380,0.12);tone(0.05,'square',260,240,0.1);break;
case 'spikes':nz(0.12,'highpass',3000,0.35);tone(0.08,'sawtooth',700,300,0.12);break;
case 'dart':nz(0.08,'bandpass',2600,0.3);nz(0.08,'bandpass',2200,0.25);break;
case 'rumble':nz(0.8,'lowpass',140,0.5);break;
case 'zap':nz(0.2,'highpass',2500,0.4);tone(0.2,'sawtooth',900,120,0.15);break;
  case 'hackok':tone(0.06,'square',880,880,0.07);break;
  case 'hackwin':tone(0.08,'square',660,660,0.07);later(90,()=>tone(0.08,'square',990,990,0.07));later(180,()=>tone(0.15,'square',1320,1320,0.07));break;
  case 'vent':nz(0.3,'bandpass',1400,0.2);tone(0.1,'square',300,200,0.05);break;
  case 'ladder':for(let k=0;k<3;k++)later(k*90,()=>tone(0.05,'square',180,160,0.06));break;
  case 'lever':nz(0.15,'lowpass',400,0.4);tone(0.25,'sawtooth',120,70,0.1);break;
  case 'alarm':tone(0.4,'square',880,660,0.08);later(450,()=>tone(0.4,'square',880,660,0.08));break;
  case 'crackle':nz(0.35,'highpass',4200,0.1);break;
  case 'arc':nz(0.5,'bandpass',2600,0.4);tone(0.4,'sawtooth',140,60,0.12);break;
  case 'barrelhit':tone(0.06,'square',320,260,0.06);break;
  case 'snort':nz(0.35,'lowpass',260,0.35);tone(0.2,'sawtooth',90,60,0.08);break;
  case 'beep':tone(0.12,'square',1400,1400,0.07);later(160,()=>tone(0.12,'square',1100,1100,0.07));break;
  case 'cloak':tone(0.3,'sine',900,300,0.08);nz(0.3,'highpass',3000,0.06);break;
  case 'whoosh':nz(0.5,'lowpass',700,0.35);break;
  case 'ray':tone(0.25,'sawtooth',1600,300,0.1);nz(0.15,'bandpass',2200,0.2);break;
  case 'wail':tone(0.7,'sine',520,260,0.07);tone(0.7,'sine',780,390,0.04);break;
  case 'lift':tone(0.8,'sine',220,70,0.2);nz(0.8,'lowpass',200,0.3);break;
  case 'die':tone(1.2,'sawtooth',160,30,0.2);break;
}}catch(e){}}

