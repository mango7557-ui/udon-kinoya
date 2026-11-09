/* Logos are independent of the full CMS/photo reveal pipeline.
 * This file contains no image data. Existing published logos remain in site_content.
 * Cold visits still require a small logo-only request; warm visits use a logo cache. */
(function () {
  'use strict';
  if (window.KinoyaLogo) return;
  const KEYS = ['global.logo.header', 'global.logo.footer'];
  const CACHE = 'kinoya_logo_cache_v1';
  const assetRoot = new URL('../', document.currentScript.src).href;
  const logos = Object.create(null);
  let serverData = false;
  const selector = KEYS.map(k => 'img[data-cms="' + k + '"]').join(',');
  const stamp = r => Number(r.updated_at) || Date.parse(r.updated_at) || 0;
  function valid(value) {
    if (value === '') return true;
    if (typeof value !== 'string') return false;
    if (/^data:/i.test(value)) return false;
    try { return ['http:', 'https:'].includes(new URL(value, assetRoot).protocol); } catch (_) { return false; }
  }
  function apply() {
    document.querySelectorAll(selector).forEach(img => {
      img.loading = 'eager';
      img.decoding = 'sync';
      img.setAttribute('fetchpriority', img.dataset.cms === KEYS[0] ? 'high' : 'auto');
      img.classList.add('cms-revealed');
      const row = logos[img.dataset.cms];
      if (!row) return;
      if (!row.value) {
        img.removeAttribute('src'); img.style.visibility = 'hidden';
      } else {
        const value = row.value.startsWith('data:') ? row.value : new URL(row.value, assetRoot).href;
        const currentResolved = img.getAttribute('src') ? new URL(img.getAttribute('src'), document.baseURI).href : '';
        if (currentResolved !== value && img.getAttribute('src') !== row.value) img.setAttribute('src', value);
        img.style.removeProperty('visibility');
      }
    });
  }
  function persist() {
    const json = JSON.stringify(logos);
    try { localStorage.setItem(CACHE, json); } catch (_) {
      try { sessionStorage.setItem(CACHE, json); } catch (_) { /* Storage denied: keep memory copy. */ }
    }
  }
  function accept(rows, fromServer = true) {
    KEYS.forEach(key => {
      const row = rows[key];
      if (!row || !valid(row.value)) return;
      if (logos[key] && stamp(logos[key]) > stamp(row)) return;
      logos[key] = {value:row.value, updated_at:row.updated_at || 0, id:row.id || logos[key]?.id || ''};
    });
    if (fromServer) { serverData = true; persist(); }
    apply();
  }
  // Read only a compact logo cache before waiting for any network request.
  try { accept(JSON.parse(localStorage.getItem(CACHE) || '{}'), false); } catch (_) {}
  try { accept(JSON.parse(sessionStorage.getItem(CACHE) || '{}'), false); } catch (_) {}
  // One-time migration for visitors whose browser only has the old CMS cache.
  if (!logos[KEYS[0]]) {
    try { const old = JSON.parse(localStorage.getItem('cms_cache') || '{}'); accept(old, false); if(logos[KEYS[0]]) persist(); } catch (_) {}
  }
  window.KinoyaLogo = {accept, apply};
  if (window.__kinoyaLogoRows) { accept(window.__kinoyaLogoRows); delete window.__kinoyaLogoRows; }
  // The head script can run before the logo element has been parsed.
  if (document.readyState === 'loading') {
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, {childList:true, subtree:true});
    document.addEventListener('DOMContentLoaded', () => { apply(); observer.disconnect(); }, {once:true});
  }
  apply();
  // Only query a record ID learned from this visitor's actual CMS data.
  // A cold visit uses the normal full CMS load; never guess a production row ID.
  const headerId = logos[KEYS[0]]?.id;
  if (!headerId) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  fetch(new URL('tables/site_content/' + encodeURIComponent(headerId), assetRoot), {cache:'no-store', priority:'high', signal:controller.signal})
    .then(res => { if(!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
    .then(json => {
      if (serverData) return; // A completed full CMS load is authoritative.
      const rows = Object.create(null);
      [json].filter(r => r && r.key === KEYS[0] && !r.deleted).forEach(r => {
        if (!rows[r.key] || stamp(r) >= stamp(rows[r.key])) rows[r.key] = r;
      });
      accept(rows);
    })
    .catch(err => console.warn('[logo-first] Logo-only request unavailable; cached/full CMS fallback:', err.message))
    .finally(() => clearTimeout(timeout));
})();
