/* Home-only store presentation. Run AFTER CMS binding/apply to preserve saved keys.
 * Reuse the original cards (no clones / duplicate IDs); standalone store stays unchanged. */
(function () {
  'use strict';
  let storeSlideSeconds = 3;

  function parseSeconds(val, fallback) {
    const n = Number(val);
    return Number.isFinite(n) && n >= 0.5 && n <= 120 ? n : fallback;
  }

  function configure(rows) {
    if (!rows || typeof rows !== 'object') return;
    const raw = rows['store.autoslide.seconds'] ? rows['store.autoslide.seconds'].value : undefined;
    if (raw !== undefined && String(raw).trim() !== '') {
      storeSlideSeconds = parseSeconds(raw, 3);
    }
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.dataset.storeSlideSeconds = String(storeSlideSeconds);
    }
  }

  try {
    configure(JSON.parse(localStorage.getItem('cms_cache') || '{}'));
  } catch (e) {}

  if (typeof document !== 'undefined') {
    ['kinoya:cms-ready', 'home-cms-loaded'].forEach(name => {
      document.addEventListener(name, event => configure(event.detail?.rows || {}));
    });
  }

  function prepare(doc) {
    const host = doc.querySelector('#stores[data-home-full="store/"]');
    if (!host || host.dataset.storeRows === 'ready') return host;
    const seoul = host.querySelector('#home-page-stores-seoul');
    const regions = ['gyeonggi', 'incheon', 'chungcheong', 'daegu', 'busan', 'jeju']
      .map(id => host.querySelector('#home-page-stores-' + id)).filter(Boolean);
    if (!seoul || !regions.length) return null;
    const national = regions[0];
    const nationalList = national.querySelector('.store-list');
    // Keep old regional anchors on their first card, including links from other sections.
    regions.forEach((region, index) => {
      const cards = [...region.querySelectorAll('.store-card')];
      if (cards.length) {
        const alias = doc.createElement('span');
        alias.id = region.id;
        alias.className = 'home-anchor-alias';
        alias.setAttribute('aria-hidden', 'true');
        cards[0].prepend(alias);
      }
      if (index) {
        cards.forEach(card => nationalList.append(card));
        region.remove();
      }
    });
    national.id = 'home-page-stores-nationwide';
    const gallerySec = host.querySelector('#home-page-stores-store-photo-gallery') || host.querySelector('#store-photo-gallery');
    if (gallerySec) {
      gallerySec.remove();
    }
    const groups = [
      { section: seoul, label: '서울 지역', code: 'seoul' },
      { section: national, label: '전국 각지', code: 'nationwide' }
    ];
    const jump = host.querySelector('.section-jump-links');
    if (jump) {
      jump.replaceChildren();
      groups.forEach(group => {
        const a = doc.createElement('a');
        a.href = '#' + group.section.id;
        a.textContent = group.label;
        jump.append(a);
      });
    }
    groups.forEach(({ section, label, code }) => {
      section.classList.add('home-store-region');
      const list = section.querySelector('.store-list');
      const heading = section.querySelector('.store-group-heading');
      heading.textContent = label + ' · ' + list.querySelectorAll('.store-card').length + '개 매장';
      heading.id = 'home-store-heading-' + code;
      section.setAttribute('aria-labelledby', heading.id);
      list.classList.add('home-store-track');
      list.id = 'home-store-track-' + code;
      list.tabIndex = 0;
      list.setAttribute('role', 'region');
      list.setAttribute('aria-label', label + ' 매장 가로 목록');
      const bar = doc.createElement('div');
      bar.className = 'home-store-row-heading';
      heading.before(bar);
      bar.append(heading);
      const hint = doc.createElement('p');
      hint.className = 'home-store-hint';
      hint.textContent = (code === 'nationwide' ? '경기 · 인천 · 충청 · 대구 · 부산 · 제주 | ' : '') + '좌우로 넘겨보세요. 자동으로 이동하며, 끝에서 반대 방향으로 돌아옵니다.';
      bar.after(hint);
    });
    host.dataset.storeRows = 'ready';
    return host;
  }

  function start(doc = document) {
    const host = prepare(doc);
    const scope = host || doc.querySelector('.store-photo-gallery-section');
    if (!scope || scope.dataset.storeMotion === 'ready') return;
    scope.dataset.storeMotion = 'ready';
    const view = doc.defaultView || window;
    const reduced = view.matchMedia ? view.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false, addEventListener: () => {} };

    const sections = host ? [...host.querySelectorAll('.home-store-region')] : [scope];
    sections.forEach(section => {
      const track = section.querySelector('.home-store-track');
      if (!track) return;
      let paused = Boolean(reduced.matches);
      let hover = false, focus = false, dragging = false;
      let visible = true, holdUntil = 0, direction = 1, frame = 0, lastTime = 0, position = 0;
      let stepTimer = 0;

      function getStepWidth() {
        const firstCard = track.querySelector('.store-card');
        const gap = parseFloat((view.getComputedStyle && view.getComputedStyle(track).gap) || '20') || 20;
        return (firstCard ? firstCard.getBoundingClientRect().width : 380) + gap;
      }

      function cancel() {
        if (frame) view.cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
      }

      function allowed() {
        return track.isConnected && visible && !doc.hidden && !paused && doc.documentElement.dataset.kinoyaMotionPaused !== 'true' && !hover && !focus && !dragging;
      }

      function tick(now) {
        frame = 0;
        if (!allowed()) {
          lastTime = 0;
          return;
        }
        const elapsed = lastTime ? Math.min(60, Math.max(8, now - lastTime)) : 16;
        lastTime = now;
        if (now >= holdUntil) {
          const max = track.scrollWidth - track.clientWidth;
          if (max > 0) {
            if (Math.abs(track.scrollLeft - position) > 2) position = track.scrollLeft;
            const sec = parseSeconds(storeSlideSeconds, 3);
            const pxPerMs = getStepWidth() / (sec * 1000);
            position = Math.max(0, Math.min(max, position + direction * elapsed * pxPerMs));
            track.scrollLeft = position;
            if (position >= max - 1) direction = -1;
            else if (position <= 1) direction = 1;
          }
        } else {
          position = track.scrollLeft;
        }
        frame = view.requestAnimationFrame(tick);
      }

      function sync() {
        if (allowed()) {
          if (!frame) {
            position = track.scrollLeft;
            frame = view.requestAnimationFrame(tick);
          }
        } else {
          cancel();
        }
      }

      function hold() {
        holdUntil = (view.performance ? view.performance.now() : Date.now()) + 4500;
        position = track.scrollLeft;
      }

      track.addEventListener('pointerenter', e => {
        if (e.pointerType === 'mouse') {
          hover = true;
          sync();
        }
      });
      track.addEventListener('pointerleave', e => {
        if (e.pointerType === 'mouse') {
          hover = false;
          sync();
        }
      });
      track.addEventListener('pointerdown', () => {
        dragging = true;
        hold();
        sync();
      }, { passive: true });
      const release = () => {
        if (dragging) {
          dragging = false;
          hold();
          sync();
        }
      };
      view.addEventListener('pointerup', release, { passive: true });
      view.addEventListener('pointercancel', release, { passive: true });
      track.addEventListener('wheel', hold, { passive: true });
      track.addEventListener('keydown', hold);
      track.addEventListener('focusin', () => {
        focus = true;
        sync();
      });
      track.addEventListener('focusout', () => view.setTimeout(() => {
        focus = track.contains(doc.activeElement);
        hold();
        sync();
      }, 0));
      doc.addEventListener('visibilitychange', sync);
      doc.addEventListener('kinoya:motion-change', sync);
      if (reduced && typeof reduced.addEventListener === 'function') {
        reduced.addEventListener('change', () => {
          paused = Boolean(reduced.matches);
          sync();
        });
      }
      if (view.IntersectionObserver) {
        const observer = new view.IntersectionObserver(entries => {
          if (entries && entries[0]) {
            visible = Boolean(entries[0].isIntersecting);
            sync();
          }
        }, { threshold: 0 });
        observer.observe(track);
      }
      // Fallback interval heartbeat in case requestAnimationFrame was throttled before layout settled
      stepTimer = view.setInterval(() => {
        if (allowed() && !frame) sync();
      }, 800);
      sync();
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (document.querySelector('.store-photo-gallery-section') && !document.querySelector('#stores[data-home-full="store/"]')) {
          start(document);
        }
      }, { once: true });
    } else if (document.querySelector('.store-photo-gallery-section') && !document.querySelector('#stores[data-home-full="store/"]')) {
      start(document);
    }
  }

  window.HomeStoreRows = { prepare, start, configure };
})();
