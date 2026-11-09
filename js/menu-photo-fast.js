/* Menu-only early CMS query and cache. Other homepage sections never gate these photos. */
(function () {
  'use strict';
  const assetRoot = new URL('../', document.currentScript.src);
  const CACHE_KEY = 'kinoya_menu_cache_v1';
  const MENU_KEY = /^menu\./;
  const PHOTO_KEY = /^menu\.(?:item(\d+)|catalog\.[a-z]+\.[a-z]+|food\.\d+)\.bg$/;
  const warmed = new Set();
  const defaults = new WeakMap();
  let currentRows = {};
  let latestReady = false;
  let currentSource = 'default';
  let localSnapshot = false;
  let ownSnapshot = false;

  function validImage(value) {
    if (window.__kinoyaGetCachedFileDataUrl) {
      const cachedData = window.__kinoyaGetCachedFileDataUrl(value);
      if (cachedData) return cachedData;
    }
    if (/^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(value)) return value;
    try {
      const normalized = String(value || '').startsWith('/files/') ? String(value).slice(1) : value;
      const url = new URL(normalized, assetRoot);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (error) { return ''; }
  }
  function cleanCaption(doc, value) {
    if (window.HomeModel) return HomeModel.cleanHTML(doc, value);
    const template = doc.createElement('template');
    template.innerHTML = value;
    const allowed = new Set(['BR', 'B', 'STRONG', 'EM', 'I', 'U', 'SPAN']);
    template.content.querySelectorAll('*').forEach(element => {
      if (!allowed.has(element.tagName)) { element.replaceWith(doc.createTextNode(element.textContent)); return; }
      Array.from(element.attributes).forEach(attribute => element.removeAttribute(attribute.name));
    });
    return template.innerHTML;
  }
  function warmPhotos(rows) {
    Object.keys(rows).forEach(key => {
      if (!PHOTO_KEY.test(key) || !rows[key]?.value) return;
      const url = validImage(String(rows[key].value));
      if (!url || warmed.has(url)) return;
      warmed.add(url);
      const image = new Image();
      image.decoding = 'async';
      if (['1', '5', '9', '13'].includes(key.match(PHOTO_KEY)[1])) image.fetchPriority = 'high';
      image.src = url;
    });
  }
  function openImageCache() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error('IndexedDB unavailable')); return; }
      const request = indexedDB.open('kinoya_menu_photos_v1', 1);
      request.onupgradeneeded = () => { request.result.createObjectStore('snapshots'); };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Cache blocked'));
    });
  }
  function persist(rows) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(rows)); }
    catch (error) {
      // Do not leave an older small local snapshot ahead of the newer large IndexedDB snapshot.
      try { localStorage.removeItem(CACHE_KEY); } catch (ignored) {}
    }
    // IndexedDB can retain the existing CMS-uploaded image values beyond localStorage's small quota.
    openImageCache().then(db => {
      const transaction = db.transaction('snapshots', 'readwrite');
      transaction.objectStore('snapshots').put(rows, 'menu');
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => db.close();
      transaction.onabort = () => db.close();
    }).catch(() => {});
  }
  function publish(rows, source, fresh) {
    const filtered = {};
    Object.keys(rows || {}).forEach(key => { if (MENU_KEY.test(key) && rows[key]?.value != null) filtered[key] = rows[key]; });
    currentRows = filtered;
    currentSource = source;
    latestReady = fresh;
    if (fresh) persist(filtered);
    warmPhotos(filtered);
    apply(document);
    document.dispatchEvent(new CustomEvent('menu-content-ready', {detail: {rows: filtered, source}}));
  }
  function apply(scope) {
    scope.querySelectorAll('.menu-card[data-cms-type="bg"], .menu-catalog-photo[data-cms-type="bg"]').forEach(card => {
      if (!defaults.has(card)) defaults.set(card, {background: card.style.backgroundImage, photo: card.classList.contains('has-menu-photo')});
      const row = currentRows[card.dataset.cms];
      if (row && row.value != null) {
        const value = String(row.value);
        const url = value ? validImage(value) : '';
        if (url) {
          const template = card.dataset.cmsBgTemplate || 'url("__IMG__")';
          card.style.backgroundImage = template.replace('__IMG__', url.replace(/["'\\\n\r]/g, encodeURIComponent));
          card.classList.add('has-menu-photo');
        } else {
          card.style.backgroundImage = 'none';
          card.classList.remove('has-menu-photo');
        }
      } else if (latestReady) {
        const original = defaults.get(card);
        card.style.backgroundImage = original.background;
        card.classList.toggle('has-menu-photo', original.photo);
      }
      // No snapshot on a first visit: retain the existing public defaults immediately.
      card.classList.add('cms-revealed', 'menu-photo-ready');
      card.dataset.menuPhotoSource = currentSource;
    });
    if (window.__kinoyaHydrateFiles) window.__kinoyaHydrateFiles();
    scope.querySelectorAll('.menu-card .card-title[data-cms], .menu-catalog-body [data-cms]').forEach(caption => {
      if (!defaults.has(caption)) defaults.set(caption, caption.innerHTML);
      const row = currentRows[caption.dataset.cms];
      if (row && row.value != null) {
        const html = cleanCaption(caption.ownerDocument, String(row.value));
        if (caption.innerHTML !== html) caption.innerHTML = html;
      } else if (latestReady && caption.innerHTML !== defaults.get(caption)) caption.innerHTML = defaults.get(caption);
    });
  }

  try {
    const snapshot = localStorage.getItem(CACHE_KEY);
    if (snapshot) { currentRows = JSON.parse(snapshot); currentSource = 'cache'; localSnapshot = true; ownSnapshot = true; }
    else {
      const legacy = JSON.parse(localStorage.getItem('cms_cache') || '{}');
      Object.keys(legacy).forEach(key => { if (MENU_KEY.test(key)) currentRows[key] = legacy[key]; });
      if (Object.keys(currentRows).length) { currentSource = 'cache'; localSnapshot = true; }
    }
  } catch (error) { currentRows = {}; }
  if (!currentRows || typeof currentRows !== 'object' || Array.isArray(currentRows)) { currentRows = {}; currentSource = 'default'; localSnapshot = false; ownSnapshot = false; }
  warmPhotos(currentRows);
  apply(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => apply(document), {once: true});

  if (!ownSnapshot) {
    openImageCache().then(db => {
      const transaction = db.transaction('snapshots', 'readonly');
      const request = transaction.objectStore('snapshots').get('menu');
      request.onsuccess = () => {
        if (!latestReady && request.result && typeof request.result === 'object') {
          localSnapshot = true;
          publish(request.result, 'cache', false);
        }
      };
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => db.close();
    }).catch(() => {});
  }

  // Menu HTML can be mounted later by HomeFull; apply already-loaded rows synchronously then.
  document.addEventListener('home-menu-mounted', event => apply(event.detail?.element || document));
  function accept(rows) {
    if (rows && typeof rows === 'object') {
      const menuKeys = Object.keys(rows).filter(key => MENU_KEY.test(key) && rows[key]?.value != null);
      if (menuKeys.length) {
        const merged = {...currentRows};
        menuKeys.forEach(key => { merged[key] = rows[key]; });
        publish(merged, latestReady ? currentSource : 'full-cms', true);
        return;
      }
    }
    apply(document);
  }
  function acceptFullCms(event) { accept(event.detail?.rows || {}); }
  document.addEventListener('home-cms-loaded', acceptFullCms);
  document.addEventListener('kinoya:cms-ready', acceptFullCms);

  const ready = (async function () {
    try {
      const rows = {};
      let seen = 0;
      for (let page = 1; page <= 20; page++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        let response;
        try {
          response = await fetch(new URL('tables/site_content?search=menu.&limit=100&page=' + page + '&_=' + Date.now(), assetRoot), {cache: 'no-store', signal: controller.signal});
        } finally {
          clearTimeout(timer);
        }
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const result = await response.json();
        if (!Array.isArray(result.data)) throw new Error('Invalid menu response');
        seen += result.data.length;
        result.data.forEach(row => {
          if (!row.deleted && MENU_KEY.test(row.key || '')) rows[row.key] = row;
        });
        if (result.data.length < 100 || (typeof result.total === 'number' && seen >= result.total)) {
          publish(rows, 'latest', true);
          return rows;
        }
      }
      throw new Error('Menu pagination limit');
    } catch (error) {
      console.warn('[menu photos] Menu-only refresh unavailable; cache/default retained:', error.message);
      apply(document);
      document.dispatchEvent(new CustomEvent('menu-content-ready', {detail: {rows: currentRows, source: localSnapshot ? 'cache' : currentSource}}));
      return currentRows;
    }
  })();
  window.MenuPhotos = {apply, accept, ready, getRows: () => currentRows};
})();
