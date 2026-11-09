/* Only motion JS runs in the fixture; no CMS/analytics requests or data writes. */
(async function(){
  const results=document.getElementById('results');
  const ok=(test,label)=>{if(!test)throw new Error(label);console.log('PASS '+label);results.textContent+='\nPASS '+label;};
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  try {
    const html=await(await fetch('../index.html')).text();
    const doc=new DOMParser().parseFromString(html,'text/html');
    doc.querySelectorAll('script').forEach(el=>el.remove());
    const base=doc.createElement('base');base.href=new URL('../',location.href).href;doc.head.prepend(base);
    const iframe=document.getElementById('page');
    await new Promise(resolve=>{iframe.onload=resolve;iframe.srcdoc=doc.documentElement.outerHTML;});
    const w=iframe.contentWindow,d=w.document;
    let rafCount=0;const raf=w.requestAnimationFrame.bind(w);w.requestAnimationFrame=fn=>{rafCount++;return raf(fn);};
    // Controllable media signals test immediate cleanup after changing OS/input settings.
    const originalMedia=w.matchMedia.bind(w);const queries=new Map();
    w.matchMedia=query=>{if(!queries.has(query)){const signal=new w.EventTarget();signal.matches=originalMedia(query).matches;queries.set(query,signal);}return queries.get(query);};
    await new Promise((resolve,reject)=>{const s=d.createElement('script');s.src='js/pointer-motion.js';s.onload=resolve;s.onerror=reject;d.body.append(s);});
    const capability=[...queries.entries()].find(([q])=>q.includes('pointer: fine'))[1];
    const reduced=queries.get('(prefers-reduced-motion: reduce)');
    capability.matches=true;reduced.matches=false;capability.dispatchEvent(new w.Event('change'));
    const hero=d.querySelector('.hero'),card=d.querySelector('.model-card');
    const move=(el,type='mouse')=>{const r=el.getBoundingClientRect();el.dispatchEvent(new w.PointerEvent('pointermove',{pointerType:type,clientX:r.left+r.width*.85,clientY:r.top+r.height*.25,bubbles:true}));};
    ok(d.documentElement.classList.contains('pointer-motion-enabled'),'Fine-pointer mode enabled');
    move(hero);await wait(850);
    ok(parseFloat(hero.style.getPropertyValue('--motion-text-x'))>3,'Hero text follows pointer');
    ok(parseFloat(hero.style.getPropertyValue('--motion-bg-x'))< -8,'Background moves in opposite direction');
    ok(Math.abs(parseFloat(hero.style.getPropertyValue('--motion-bg-x')))<=14,'Background displacement bounded');
    const settled=rafCount;await wait(150);ok(rafCount===settled,'Animation frames stop after settling');
    hero.dispatchEvent(new w.PointerEvent('pointerleave',{pointerType:'mouse'}));await wait(850);
    ok(parseFloat(hero.style.getPropertyValue('--motion-text-x'))===0,'Pointer leave returns to center');
    ok(!hero.classList.contains('is-pointer-active'),'Compositing hint removed on idle');
    move(card);await wait(850);ok(parseFloat(card.style.getPropertyValue('--motion-tilt-y'))>1,'Card tilt follows pointer');
    const light=w.getComputedStyle(card,'::after');console.log('Motion CSS environment: '+w.innerWidth+'px / fine pointer '+originalMedia('(hover: hover) and (pointer: fine)').matches+' / pseudo content '+light.content);
    ok(light.content==='none'||light.content==='normal'||light.pointerEvents==='none','Light layer absent or non-interactive');
    d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',bubbles:true}));
    ok(card.style.getPropertyValue('--motion-tilt-y')==='','Keyboard navigation clears motion');
    move(hero,'touch');await wait(100);ok(!hero.style.getPropertyValue('--motion-text-x'),'Touch input ignored');
    move(hero);await wait(70);reduced.matches=true;reduced.dispatchEvent(new w.Event('change'));
    ok(!d.documentElement.classList.contains('pointer-motion-enabled')&&!hero.style.getPropertyValue('--motion-text-x'),'Reduced-motion change resets effects');
    move(hero);await wait(100);ok(!hero.style.getPropertyValue('--motion-text-x'),'Reduced-motion blocks pointer animation');
    reduced.matches=false;capability.matches=false;capability.dispatchEvent(new w.Event('change'));move(hero);await wait(100);
    ok(!d.documentElement.classList.contains('pointer-motion-enabled'),'Coarse/narrow mode disables animation');
    results.textContent+='\nALL TESTS PASSED';console.log('ALL TESTS PASSED');
  } catch(e){results.textContent+='\nFAIL '+e.message;console.error('TEST FAILED '+e.message);}
})();
