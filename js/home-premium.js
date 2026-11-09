/* Presentation enhancements run after existing path-based CMS bindings are built.
 * No table writes, storage changes, cloned CMS nodes or authentication logic. */
(function () {
  'use strict';
  const root = new URL('../', document.currentScript.src);
  document.documentElement.dataset.kinoyaMotionPaused = 'false';

  function ensureVideosPlaying() {
    document.querySelectorAll('video[autoplay]').forEach(video => {
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      if (video.paused) {
        const play = video.play();
        if (play && typeof play.catch === 'function') play.catch(() => {});
      }
      if (!video.dataset.keepPlayingBound) {
        video.dataset.keepPlayingBound = 'true';
        video.addEventListener('ended', () => {
          video.currentTime = 0;
          const p = video.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        });
        video.addEventListener('pause', () => {
          if (!document.hidden && document.documentElement.dataset.kinoyaMotionPaused !== 'true') {
            const p = video.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          }
        });
      }
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) ensureVideosPlaying();
  });
  setInterval(ensureVideosPlaying, 1500);
  ensureVideosPlaying();

  Promise.resolve(window.homeContentReady).then(() => {
    const hero = document.querySelector('.hero');
    if (!hero || hero.querySelector('.hero-facts')) return;
    hero.querySelectorAll('.motion-control').forEach(el => el.remove());
    const facts = document.createElement('div');
    facts.className = 'hero-facts';
    facts.setAttribute('aria-label', '키노야의 면에 담은 시간');
    facts.innerHTML = '<div><strong>48시간</strong><span>저온숙성의 기다림</span></div><div><strong>13개월</strong><span>면을 위한 연구</span></div><div><strong>한 그릇</strong><span>타협하지 않는 원칙</span></div>';
    hero.querySelector('.hero-inner').append(facts);
    const nav = document.createElement('nav');
    nav.className = 'discovery-nav';
    nav.setAttribute('aria-label', '우동키노야 주요 안내');
    const inner = document.createElement('div');
    inner.className = 'discovery-inner';
    [['01 / OUR MENU','오늘 만날 한 그릇','menu/'],['02 / FIND KINOYA','우리 동네 키노야','store/'],['03 / WITH KINOYA','키노야와 함께하기','franchise/']].forEach(([label,title,path]) => {
      const a = document.createElement('a');
      a.className = 'discovery-link';
      a.href = new URL(path, root).href;
      const small = document.createElement('small'); small.textContent = label;
      const strong = document.createElement('strong'); strong.textContent = title;
      const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true');
      a.append(small, strong, arrow); inner.append(a);
    });
    nav.append(inner); hero.after(nav);
    ensureVideosPlaying();
    document.documentElement.dataset.premiumReady = 'true';
  }).catch(error => console.warn('[home refinement]', error.message));
})();
