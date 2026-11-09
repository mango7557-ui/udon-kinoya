/* Subtle pointer-follow motion; no libraries, timers, data writes or custom cursor. */
function initKinoyaPointerMotion() {
  'use strict';
  const capability = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 769px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('main .hero');
  if (!hero) return;
  const cards = [...document.querySelectorAll('main .number-card, main .model-card, main .final-card, main .miracle-visual')];
  const states = [hero, ...cards].map(el => ({ el, hero: el === hero, x: 0, y: 0, a: 0, tx: 0, ty: 0, ta: 0, rect: null }));
  const pending = new Set();
  const properties = ['--motion-bg-x','--motion-bg-y','--motion-text-x','--motion-text-y','--motion-light-x','--motion-light-y','--motion-light','--motion-tilt-x','--motion-tilt-y'];
  let enabled = false, frame = 0, lastTime = 0;
  const clamp = v => Math.max(-1, Math.min(1, v));
  function paint(s) {
    const set = (name, value) => s.el.style.setProperty(name, value);
    if (s.hero) {
      set('--motion-bg-x', (-s.x * 14).toFixed(3) + 'px');
      set('--motion-bg-y', (-s.y * 10).toFixed(3) + 'px');
      set('--motion-text-x', (s.x * 6).toFixed(3) + 'px');
      set('--motion-text-y', (s.y * 4).toFixed(3) + 'px');
    } else {
      set('--motion-tilt-x', (-s.y * 2.2).toFixed(3) + 'deg');
      set('--motion-tilt-y', (s.x * 2.2).toFixed(3) + 'deg');
    }
    set('--motion-light-x', ((s.x + 1) * 50).toFixed(2) + '%');
    set('--motion-light-y', ((s.y + 1) * 50).toFixed(2) + '%');
    set('--motion-light', s.a.toFixed(3));
  }
  function tick(time) {
    frame = 0;
    const blend = 1 - Math.exp(-Math.min(50, lastTime ? time - lastTime : 16.7) / 85);
    lastTime = time;
    pending.forEach(s => {
      s.x += (s.tx - s.x) * blend; s.y += (s.ty - s.y) * blend; s.a += (s.ta - s.a) * blend;
      if (Math.abs(s.tx-s.x) + Math.abs(s.ty-s.y) + Math.abs(s.ta-s.a) < .002) {
        s.x=s.tx; s.y=s.ty; s.a=s.ta; pending.delete(s);
        if (!s.ta) s.el.classList.remove('is-pointer-active');
      }
      paint(s);
    });
    if (pending.size) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  }
  function schedule(s) {
    pending.add(s);
    if (!frame) frame = requestAnimationFrame(tick);
  }
  function leave(s) {
    s.tx=0; s.ty=0; s.ta=0; s.rect=null;
    if (enabled && (s.x || s.y || s.a || pending.has(s))) schedule(s);
  }
  states.forEach(s => {
    if (!s.hero) s.el.classList.add('pointer-card');
    s.el.addEventListener('pointermove', e => {
      if (!enabled || e.pointerType !== 'mouse' || document.hidden) return;
      if (!s.rect) s.rect=s.el.getBoundingClientRect();
      if (!s.rect.width || !s.rect.height) return;
      s.tx=clamp((e.clientX-s.rect.left)/s.rect.width*2-1);
      s.ty=clamp((e.clientY-s.rect.top)/s.rect.height*2-1);
      s.ta=1; s.el.classList.add('is-pointer-active'); schedule(s);
    }, {passive:true});
    s.el.addEventListener('pointerleave', () => leave(s), {passive:true});
    s.el.addEventListener('pointercancel', () => leave(s), {passive:true});
  });
  function reset() {
    cancelAnimationFrame(frame); frame=0; lastTime=0; pending.clear();
    states.forEach(s => {
      s.x=s.y=s.a=s.tx=s.ty=s.ta=0; s.rect=null;
      s.el.classList.remove('is-pointer-active');
      properties.forEach(p => s.el.style.removeProperty(p));
    });
  }
  function sync() {
    enabled=capability.matches && !reduced.matches && !document.hidden;
    document.documentElement.classList.toggle('pointer-motion-enabled', enabled);
    reset();
  }
  capability.addEventListener('change', sync);
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('blur', reset);
  window.addEventListener('pagehide', reset);
  window.addEventListener('resize', reset, {passive:true});
  // Clear measured bounds when scrolling/reordering; never run a permanent RAF loop.
  window.addEventListener('scroll', () => states.forEach(leave), {passive:true});
  document.addEventListener('home-cms-loaded', reset);
  document.addEventListener('keydown', e => { if (e.key==='Tab') reset(); });
  sync();
}
Promise.resolve(window.homeContentReady).then(initKinoyaPointerMotion);
