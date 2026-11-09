/* Header color and current-location highlighting. No URL rewrites or data writes. */
(function () {
  'use strict';
  const nav = document.getElementById('nav');
  if (!nav) return;
  const root = new URL('../', document.currentScript.src);
  const normalize = path => path.replace(/\/index\.html$/, '/').replace(/\/+$/, '') || '/';
  const rootPath = normalize(root.pathname);
  function route(url) {
    if (url.origin !== root.origin) return null;
    let path = normalize(url.pathname);
    if (rootPath !== '/') {
      if (path !== rootPath && !path.startsWith(rootPath + '/')) return null;
      path = path.slice(rootPath.length);
    }
    return path.replace(/^\/(en|ja)(?=\/|$)/, '').replace(/^\/+/, '');
  }
  const page = route(new URL(document.baseURI));
  const home = page === '';
  const sectionRoutes = {
    social:'@social', numbers:'brand', 'brand-story':'brand', noodle:'noodle',
    proof:'franchise', system:'franchise', turnover:'franchise', model:'franchise',
    support:'franchise', 'partner-logos-section':'franchise', stores:'store',
    people:'people', 'menu-preview':'menu', 'faq-preview':'franchise/faq', 'news-full':'news', 'resources-full':'resources', final:'contact'
  };
  let frame = 0;
  function linkRoute(link) {
    try {
      const url = new URL(link.getAttribute('href'), document.baseURI);
      const key = route(url);
      if (key === '' && url.hash) {
        const id = decodeURIComponent(url.hash.slice(1));
        if (id.startsWith('home-noodle-')) return 'noodle';
        const group=Object.keys(sectionRoutes).find(name=>id.startsWith('home-page-'+name+'-'));
        return sectionRoutes[id] || (group&&sectionRoutes[group]) || key;
      }
      return key;
    } catch (_) { return null; }
  }
  function update() {
    frame = 0;
    nav.classList.toggle('is-scrolled', window.scrollY > 20);
    let active = page, sectionId = '';
    if (home) {
      // Read visual positions, not source order: CMS can reorder/hide sections.
      const line = nav.getBoundingClientRect().bottom + Math.min(64, innerHeight * .08);
      let nearestTop = -Infinity;
      active = null;
      document.querySelectorAll('main > section').forEach(section => {
        if (!section.getClientRects().length || getComputedStyle(section).display === 'none') return;
        const rect = section.getBoundingClientRect();
        if (rect.height > 0 && rect.top <= line && rect.top > nearestTop) {
          nearestTop = rect.top; sectionId = section.id;
          active = sectionRoutes[section.id] || null;
        }
      });
    }
    const links = [...document.querySelectorAll('.nav-menu a, .nav-mobile-panel a, .nav > .nav-cta')];
    // On detail pages pick the longest matching destination (e.g. FAQ rather than Franchise).
    let best = active;
    if (!home && active) {
      best = links.map(linkRoute).filter(key => key && key !== '@social' && (active === key || active.startsWith(key + '/'))).sort((a,b) => b.length - a.length)[0] || null;
    }
    links.forEach(link => {
      const selected = !!best && linkRoute(link) === best;
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', home ? 'location' : 'page');
      else link.removeAttribute('aria-current');
    });
    nav.dataset.activeSection = sectionId;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  window.addEventListener('hashchange', schedule);
  window.addEventListener('pageshow', schedule);
  window.addEventListener('load', schedule);
  document.addEventListener('home-cms-loaded', schedule);
  if ('ResizeObserver' in window) {
    const resize = new ResizeObserver(schedule);
    resize.observe(nav);
    const main = document.querySelector('main'); if (main) resize.observe(main);
  }
  // Keep matching CMS-managed links after href edits without observing our own classes.
  new MutationObserver(schedule).observe(nav, {attributes:true, attributeFilter:['href'], subtree:true});
  update();
})();
