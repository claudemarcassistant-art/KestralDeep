(()=>{try{const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Silkscreen&display=swap';document.head.appendChild(l);}catch(e){}})();
(()=>{let shown=false;function showErr(msg){if(shown)return;shown=true;const d=document.createElement('div');
  d.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;padding:10px 12px;background:#1a0c0c;border:1px solid #c05040;color:#f0d0c0;font:13px monospace;z-index:9;white-space:pre-wrap;max-height:40%;overflow:auto';
  d.textContent='Kestrel Deep hit an error. Please share this message:\n'+msg;document.body.appendChild(d);}
  window.__kdErr=showErr;addEventListener('error',e=>showErr((e.message||'error')+(e.filename?'  line '+e.lineno:'')));addEventListener('unhandledrejection',e=>showErr(String(e.reason)));})();
