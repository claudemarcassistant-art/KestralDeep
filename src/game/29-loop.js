// ---------- loop ----------
let last=performance.now();
function frame(now){
  requestAnimationFrame(frame);
  if(innerWidth!==lastIW||innerHeight!==lastIH)resize();
  try{
  const dt=Math.min(0.033,Math.max(0,(now-last)/1000));last=now;T+=dt;
  if(state==='play'&&hackUI)updateHack(dt);
  if(state==='play'&&arcadeUI)updateArcade(dt);
  if(state==='play'&&!paused())updatePlay(dt);
  if(state==='dead')deadT+=dt;
  if((state==='play'||state==='dead')&&!paused())updateFx(state==='dead'?dt*0.3:dt);
  render();
  }catch(err){if(window.__kdErr)window.__kdErr((err&&err.message||err)+'\n'+(err&&err.stack||'').split('\n').slice(1,4).join('\n'));}
}
requestAnimationFrame(frame);
