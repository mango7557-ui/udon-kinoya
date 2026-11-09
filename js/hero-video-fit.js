/* Mobile wide-scene video with a blurred, full-height background.
 * Draw the already-playing video: no duplicate stream, export or network request.
 * Canvas may be tainted by a cross-origin video; rendering does not read its pixels.
 * Keep the original cover fallback until a frame has actually been drawn. */
(function () {
  'use strict';
  const query = window.matchMedia('(max-width: 768px), (max-width: 1024px) and (hover: none) and (pointer: coarse)');
  document.querySelectorAll('.hero > .hero-video').forEach(video => {
    const hero = video.parentElement;
    if (hero.querySelector('.hero-video-fill')) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'hero-video-fill';
    canvas.setAttribute('aria-hidden', 'true');
    // Append after source markup was parsed, preserving the original CMS bindings.
    hero.insertBefore(canvas, video);
    const context = canvas.getContext('2d', {alpha:false});
    if (!context) { canvas.remove(); return; }
    let callback = null, lastDraw = -Infinity, inView = true, failed = false;
    const videoCallback = typeof video.requestVideoFrameCallback === 'function';
    const allowed = () => query.matches && !document.hidden && inView && !failed;
    function stop() {
      if (callback === null) return;
      if (videoCallback) video.cancelVideoFrameCallback(callback);
      else cancelAnimationFrame(callback);
      callback = null;
    }
    function draw() {
      if (!allowed() || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return false;
      const width = Math.min(320, video.videoWidth);
      const height = Math.max(1, Math.round(width * video.videoHeight / video.videoWidth));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      try {
        context.drawImage(video, 0, 0, width, height);
        hero.classList.add('has-mobile-video-fill');
        return true;
      } catch (error) {
        failed = true; hero.classList.remove('has-mobile-video-fill');
        return false; // Unsupported devices retain the existing cover background.
      }
    }
    function schedule() {
      if (callback !== null || !allowed() || video.paused || video.ended) return;
      callback = videoCallback ? video.requestVideoFrameCallback(tick) : requestAnimationFrame(tick);
    }
    function tick(time) {
      callback = null;
      if (!allowed()) return;
      // Blur needs little detail: at most 12 canvas draws per second.
      if (time - lastDraw >= 1000 / 12) { if (draw()) lastDraw = time; }
      schedule();
    }
    function refresh() {
      stop();
      if (!query.matches) hero.classList.remove('has-mobile-video-fill');
      if (draw()) lastDraw = performance.now();
      schedule();
    }
    function clearSource() {
      stop(); failed = false; lastDraw = -Infinity;
      hero.classList.remove('has-mobile-video-fill');
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    video.addEventListener('loadeddata', refresh);
    video.addEventListener('playing', refresh);
    video.addEventListener('seeked', refresh);
    video.addEventListener('pause', () => { draw(); stop(); });
    video.addEventListener('ended', () => { draw(); stop(); });
    video.addEventListener('emptied', clearSource);
    video.addEventListener('error', clearSource);
    query.addEventListener('change', refresh);
    document.addEventListener('visibilitychange', refresh);
    document.addEventListener('home-cms-loaded', refresh);
    window.addEventListener('pagehide', stop);
    window.addEventListener('pageshow', refresh);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting; refresh();
      });
      observer.observe(hero);
    }
    refresh();
  });
})();
