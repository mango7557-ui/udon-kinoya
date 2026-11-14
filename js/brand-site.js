/* Dedicated Brand Site (/brand-site/) controller: syncs menu catalog, 51 nationwide stores, and brand news */
(function () {
  'use strict';

  function initMenuCatalogAndTabs() {
    var mount = document.getElementById('bs-menu-mount');
    if (mount && window.MenuCatalog) {
      var anchor = document.createElement('div');
      mount.appendChild(anchor);
      var dummyDisclaimer = document.createElement('div');
      dummyDisclaimer.className = 'cost-disclaimer';
      mount.appendChild(dummyDisclaimer);
      var sec = document.createElement('div');
      sec.id = 'signature';
      sec.appendChild(dummyDisclaimer);
      mount.innerHTML = '';
      mount.appendChild(sec);
      window.MenuCatalog.mount(document);
      dummyDisclaimer.remove();
      if (window.KinoyaMenuPhotos && window.KinoyaMenuPhotos.apply) {
        window.KinoyaMenuPhotos.apply(document);
      }
    }

    var tabs = document.querySelectorAll('#bs-menu-tabs button[data-menu-filter]');
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-menu-filter');
        tabs.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        document.querySelectorAll('#bs-menu-mount .menu-category').forEach(function (cat) {
          var code = cat.getAttribute('data-category');
          if (code === 'drink') return;
          cat.style.display = (filter === 'all' || filter === code) ? '' : 'none';
        });
      });
    });
  }

  async function initStoresDirectory() {
    var grid = document.getElementById('bs-store-grid');
    var countEl = document.getElementById('bs-store-count');
    var searchInput = document.getElementById('bs-store-search');
    var regionBtns = document.querySelectorAll('#bs-store-region-tabs button[data-region]');
    if (!grid) return;

    var allCards = [];
    try {
      var res = await fetch('../store/index.html', { cache: 'no-store' });
      if (res.ok) {
        var html = await res.text();
        var doc = new DOMParser().parseFromString(html, 'text/html');
        ['seoul', 'gyeonggi', 'incheon', 'chungcheong', 'daegu', 'busan', 'jeju'].forEach(function (region) {
          var sec = doc.getElementById(region);
          if (!sec) return;
          sec.querySelectorAll('.store-card').forEach(function (card) {
            var clone = card.cloneNode(true);
            clone.setAttribute('data-bs-region', region);
            clone.querySelectorAll('a[href]').forEach(function (a) {
              var h = a.getAttribute('href') || '';
              if (h && !/^(https?:|tel:|mailto:|#|\.\.\/)/.test(h)) {
                a.setAttribute('href', '../store/' + h.replace(/^\.\//, ''));
              }
            });
            allCards.push(clone);
            grid.appendChild(clone);
          });
        });
      }
    } catch (e) {
      console.warn('[brand-site] store load error:', e);
    }

    // Apply live CMS overrides for store names, addresses, hours, and photos
    try {
      var cmsRes = await fetch('../tables/site_content?limit=1000');
      if (cmsRes && cmsRes.ok) {
        var cmsJson = await cmsRes.json();
        var byKey = {};
        (cmsJson.data || []).forEach(function (r) { if (r && r.key && !r.deleted) byKey[r.key] = r; });
        grid.querySelectorAll('[data-cms]').forEach(function (el) {
          var k = el.getAttribute('data-cms');
          if (byKey[k] && byKey[k].value) el.textContent = byKey[k].value;
        });
        grid.querySelectorAll('.store-card[id^="store-"]').forEach(function (card) {
          var num = card.id.replace('store-', '');
          var photoRow = byKey['store.' + num + '.photo'];
          if (photoRow && photoRow.value) {
            var img = card.querySelector('.store-thumb img');
            if (img) {
              var cached = window.__kinoyaGetCachedFileDataUrl ? window.__kinoyaGetCachedFileDataUrl(photoRow.value) : '';
              var v = cached || (photoRow.value.indexOf('images/') === 0 ? '../' + photoRow.value : photoRow.value);
              img.setAttribute('src', v);
            }
          }
        });
        if (window.__kinoyaHydrateFiles) window.__kinoyaHydrateFiles();
      }
    } catch (e) {}

    var currentRegion = 'all';
    function filterStores() {
      var q = (searchInput ? searchInput.value : '').trim().toLowerCase();
      var shown = 0;
      allCards.forEach(function (card) {
        var r = card.getAttribute('data-bs-region');
        var matchRegion = currentRegion === 'all' || r === currentRegion;
        var matchQuery = !q || card.textContent.toLowerCase().indexOf(q) !== -1;
        var visible = matchRegion && matchQuery;
        card.style.display = visible ? '' : 'none';
        if (visible) shown++;
      });
      if (countEl) countEl.textContent = '표시 매장 ' + shown + '개 (전국 총 ' + allCards.length + '개점)';
    }

    regionBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentRegion = btn.getAttribute('data-region') || 'all';
        regionBtns.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        filterStores();
      });
    });

    if (searchInput) searchInput.addEventListener('input', filterStores);
    filterStores();
  }

  async function initBrandNews() {
    var listEl = document.getElementById('bs-news-list');
    if (!listEl) return;
    try {
      var res = await fetch('../tables/news_items?limit=20');
      if (!res || !res.ok) return;
      var json = await res.json();
      var items = (json.data || []).filter(function (n) { return n && !n.deleted && n.is_published !== false; });
      if (!items.length) return;
      items.sort(function (a, b) { return String(b.published_at || '').localeCompare(String(a.published_at || '')); });
      listEl.innerHTML = items.slice(0, 4).map(function (item) {
        var href = item.url || ('../news/view/?id=' + encodeURIComponent(item.id));
        var title = String(item.title || '').replace(/</g, '&lt;');
        var excerpt = String(item.excerpt || '').replace(/</g, '&lt;');
        var date = String(item.published_at || '').slice(0, 10);
        return '<a href="' + href + '" class="news-list-card">' +
          '<div class="news-list-body">' +
            (date ? '<div style="font-size:13px;font-weight:700;color:var(--atelier-gold-deep);margin-bottom:6px;">' + date + '</div>' : '') +
            '<div class="news-list-title">' + title + '</div>' +
            (excerpt ? '<p style="margin-top:8px;font-size:14px;">' + excerpt + '</p>' : '') +
          '</div>' +
        '</a>';
      }).join('');
    } catch (e) {}
  }

  function boot() {
    initMenuCatalogAndTabs();
    initStoresDirectory();
    initBrandNews();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
