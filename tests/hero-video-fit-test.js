(async function(){
 const out=document.getElementById('results');
 const assert=(v,msg)=>{if(!v)throw new Error(msg);out.textContent+='\nPASS '+msg;console.log('PASS '+msg);};
 try{
  const source=await(await fetch('../index.html')).text();const doc=new DOMParser().parseFromString(source,'text/html');
  doc.querySelectorAll('script').forEach(s=>s.remove());doc.querySelectorAll('video').forEach(v=>{v.removeAttribute('autoplay');v.removeAttribute('src');v.querySelectorAll('source').forEach(s=>s.removeAttribute('src'));});
  const base=doc.createElement('base');base.href=new URL('../',location.href).href;doc.head.prepend(base);
  const frame=document.createElement('iframe');document.body.append(frame);await new Promise(ok=>{frame.onload=ok;frame.srcdoc=doc.documentElement.outerHTML;});
  const w=frame.contentWindow,d=w.document,video=d.querySelector('.hero-video'),hero=video.parentElement;
  const signal=new w.EventTarget();signal.matches=true;w.matchMedia=()=>signal;
  w.IntersectionObserver=class{observe(){}};
  let draws=0,paused=false,width=1280,height=720,ready=2,frameId=0,hidden=false;const callbacks=new Map();
  Object.defineProperty(d,'hidden',{get:()=>hidden});
  Object.defineProperties(video,{videoWidth:{get:()=>width},videoHeight:{get:()=>height},readyState:{get:()=>ready},paused:{get:()=>paused},ended:{get:()=>false}});
  video.requestVideoFrameCallback=cb=>{callbacks.set(++frameId,cb);return frameId;};video.cancelVideoFrameCallback=id=>callbacks.delete(id);
  w.HTMLCanvasElement.prototype.getContext=()=>({drawImage:()=>draws++,clearRect:()=>{}});
  await new Promise((ok,no)=>{const s=d.createElement('script');s.src='js/hero-video-fit.js';s.onload=ok;s.onerror=no;d.head.append(s);});
  const canvas=hero.querySelector('.hero-video-fill');
  assert(!!canvas&&hero.classList.contains('has-mobile-video-fill'),'Mobile composition enabled only after drawing a frame');
  assert(d.querySelectorAll('.hero video').length===1,'Original video reused: no duplicate stream');
  assert(canvas.width===320&&canvas.height===180,'Low-resolution canvas preserves source aspect');
  assert(canvas.getAttribute('aria-hidden')==='true','Decorative canvas excluded from accessibility tree');
  assert(callbacks.size===1,'Single scheduled frame callback');
  paused=true;video.dispatchEvent(new w.Event('pause'));assert(callbacks.size===0,'Pause cancels background work');
  ready=0;video.dispatchEvent(new w.Event('emptied'));assert(!hero.classList.contains('has-mobile-video-fill'),'CMS source clear removes previous background frame');
  width=720;height=1280;ready=2;video.dispatchEvent(new w.Event('loadeddata'));assert(canvas.width===320&&canvas.height===569,'Replacement video aspect applied');
  assert(hero.classList.contains('has-mobile-video-fill'),'Replacement source restores composition');
  signal.matches=false;signal.dispatchEvent(new w.Event('change'));assert(!hero.classList.contains('has-mobile-video-fill')&&callbacks.size===0,'Desktop mode clears mobile composition');
  signal.matches=true;paused=false;signal.dispatchEvent(new w.Event('change'));assert(callbacks.size===1,'Return to mobile resumes rendering');
  hidden=true;d.dispatchEvent(new w.Event('visibilitychange'));assert(callbacks.size===0,'Hidden tab stops background work');
  console.log('ALL TESTS PASSED');out.textContent+='\nALL TESTS PASSED';
 }catch(e){console.error('TEST FAILED '+e.message);out.textContent+='\nFAIL '+e.message;}
})();
