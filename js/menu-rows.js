/* Per-category native scroll sliders, variable item counts, shared CMS interval.
 * Food gallery (#category-food-photos / .menu-food-gallery) uses continuous smooth ping-pong auto-scroll. */
(function () {
  'use strict';
  const states = new Set();
  const initialized = new WeakSet();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let intervalMs = 4000;
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    for (const state of states) if (state.lane === entry.target) {
      if (entry.isIntersecting && !state.visible) state.next = performance.now() + intervalMs;
      state.visible = entry.isIntersecting;
    }
  }));
  function configure(rows) {
    const raw = rows?.['menu.autoslide.seconds']?.value;
    const seconds = raw == null || String(raw).trim() === '' ? 4 : Number(raw);
    intervalMs = Number.isFinite(seconds) && seconds >= 1 && seconds <= 120 ? seconds * 1000 : 4000;
    document.documentElement.dataset.menuSlideSeconds = String(intervalMs / 1000);
    states.forEach(state => { state.next = performance.now() + intervalMs; state.lane.dataset.slideSeconds = String(intervalMs / 1000); });
  }
  function getStepWidth(state) {
    const cards = Array.from(state.track.children);
    if (!cards.length) return 300;
    return cards[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(state.track).gap) || 0);
  }
  function move(state, direction) {
    const cards = Array.from(state.track.children);
    if (!cards.length) return;
    const step = getStepWidth(state);
    const max = state.lane.scrollWidth - state.lane.clientWidth;
    if (max <= 1) return;
    const left = state.lane.scrollLeft;
    let target = Math.round(left / step) * step + direction * step;
    if (direction > 0 && left >= max - 2) target = 0;
    if (direction < 0 && left <= 2) target = max;
    const nextPos = Math.max(0, Math.min(max, target));
    if (state.continuous) {
      state.position = nextPos;
      state.lane.scrollLeft = nextPos;
    } else {
      state.lane.scrollTo({left:nextPos, behavior:'smooth'});
    }
    state.lane.dataset.slideMoves = String(Number(state.lane.dataset.slideMoves || 0) + 1);
  }
  function initialize() {
    document.querySelectorAll('.menu-category').forEach(category => {
      const lane = category.querySelector('.menu-category-lane');
      if (!lane || initialized.has(lane)) return;
      initialized.add(lane);
      const continuous = category.classList.contains('menu-food-gallery') || category.dataset.category === 'food-photos';
      const state = {
        category,
        lane,
        track: lane.querySelector('.menu-category-track'),
        continuous,
        visible: true,
        hover: false,
        focus: false,
        dragging: null,
        resume: 0,
        next: performance.now() + intervalMs,
        position: lane.scrollLeft || 0,
        direction: 1,
        lastTime: 0
      };
      states.add(state);
      lane.dataset.slideSeconds = String(intervalMs / 1000);
      lane.dataset.autoScrollMode = continuous ? 'continuous' : 'step';
      observer.observe(lane);
      const pause = () => {
        const holdMs = state.continuous ? 4000 : 6000;
        state.resume = performance.now() + holdMs;
        state.next = state.resume + intervalMs;
        state.position = lane.scrollLeft;
        state.lastTime = 0;
      };
      category.addEventListener('mouseenter', () => { state.hover = matchMedia('(hover: hover)').matches; state.lastTime = 0; });
      category.addEventListener('mouseleave', () => { state.hover = false; state.next = performance.now() + intervalMs; state.position = lane.scrollLeft; state.lastTime = 0; });
      category.addEventListener('focusin', event => { state.focus = event.target.matches(':focus-visible'); state.lastTime = 0; });
      category.addEventListener('focusout', () => { state.focus = false; pause(); });
      ['wheel','touchstart','touchmove','touchend'].forEach(type => lane.addEventListener(type, pause, {passive:true}));
      lane.addEventListener('keydown', event => {
        if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
        event.preventDefault(); pause(); move(state, event.key==='ArrowRight'?1:-1);
      });
      lane.addEventListener('pointerdown', event => {
        pause();
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        state.dragging = {id:event.pointerId, x:event.clientX, left:lane.scrollLeft};
        lane.setPointerCapture(event.pointerId); category.classList.add('is-dragging');
      });
      lane.addEventListener('pointermove', event => {
        if (!state.dragging || state.dragging.id !== event.pointerId) return;
        lane.scrollLeft = state.dragging.left + state.dragging.x - event.clientX;
        state.position = lane.scrollLeft;
      });
      const end = () => {
        if (!state.dragging) return;
        state.dragging = null; category.classList.remove('is-dragging'); pause();
      };
      ['pointerup','pointercancel','lostpointercapture'].forEach(type => lane.addEventListener(type, end));
    });
  }
  configure({});
  try { configure(JSON.parse(localStorage.getItem('cms_cache') || '{}')); } catch (error) {}
  ['kinoya:cms-ready','home-cms-loaded','menu-content-ready'].forEach(name => document.addEventListener(name, event => { configure(event.detail?.rows || {}); initialize(); }));
  initialize();
  new MutationObserver(initialize).observe(document.body, {childList:true, subtree:true});

  function stepContinuous(now) {
    for (const state of states) {
      if (!state.continuous) continue;
      if (!state.lane.isConnected) { states.delete(state); continue; }
      if (document.hidden || !state.visible || document.documentElement.dataset.kinoyaMotionPaused === 'true' || state.hover || state.focus || state.dragging || now < state.resume) {
        state.lastTime = 0;
        state.position = state.lane.scrollLeft;
        continue;
      }
      const max = state.lane.scrollWidth - state.lane.clientWidth;
      if (max > 1) {
        const elapsed = state.lastTime ? Math.min(64, Math.max(0, now - state.lastTime)) : 0;
        state.lastTime = now;
        if (Math.abs(state.lane.scrollLeft - state.position) > 5) state.position = state.lane.scrollLeft;
        const stepW = getStepWidth(state);
        const durationMs = Math.max(1500, Math.min(8000, intervalMs * 0.75));
        const pxPerMs = stepW / durationMs;
        state.position = Math.max(0, Math.min(max, state.position + state.direction * elapsed * pxPerMs));
        state.lane.scrollLeft = Math.round(state.position);
        state.lane.dataset.slideMoves = String(Number(state.lane.dataset.slideMoves || 0) + 1);
        if (state.position >= max - 1) state.direction = -1;
        else if (state.position <= 1) state.direction = 1;
      }
    }
  }

  let rafPending = false;
  function scheduleContinuous() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(now => {
      rafPending = false;
      stepContinuous(now);
      scheduleContinuous();
    });
  }
  scheduleContinuous();

  setInterval(() => {
    const now = performance.now();
    // Continuous galleries use one RAF clock only; the timer handles stepped rows.
    for (const state of states) {
      if (state.continuous) continue;
      if (!state.lane.isConnected) { observer.unobserve(state.lane); states.delete(state); continue; }
      if (document.hidden || !state.visible || document.documentElement.dataset.kinoyaMotionPaused === 'true' || state.hover || state.focus || state.dragging || now < state.resume || now < state.next) continue;
      move(state, 1); state.next = now + intervalMs;
    }
  }, 100);
})();
