/*
 * KINOYA CMS Loader (공개 페이지용)
 * ------------------------------------------------------------
 * data-cms="키" 속성이 붙은 요소를 찾아, site_content 테이블에
 * 저장된 값이 있으면 그 값으로 텍스트/이미지를 덮어씁니다.
 * 저장된 값이 없으면 원래 페이지에 적힌 기본 텍스트/이미지를 그대로 둡니다.
 *
 * data-cms-type:
 *   (없음)    : innerHTML 텍스트 교체 (기본값)
 *   "img"     : <img> 태그의 src 교체
 *   "bg"      : style.backgroundImage 교체. data-cms-bg-template 안의
 *               '__IMG__' 자리를 실제 이미지 URL로 치환해서 사용
 *   "meta"    : <meta> 태그의 content 속성 교체 (카카오톡/SNS 공유 썸네일 제목·설명 등)
 *   "favicon" : <link rel="icon"> 태그의 href 속성 교체 (브라우저 탭/즐겨찾기 아이콘)
 */
(function () {
  const runtimeReady=window.KinoyaRuntimeReady || (window.KinoyaRuntime ? Promise.resolve(window.KinoyaRuntime) : new Promise(function(resolve,reject){
    const script=document.createElement('script');script.src=new URL('site-runtime.js',document.currentScript.src).href;
    script.onload=()=>resolve(window.KinoyaRuntime);script.onerror=()=>reject(new Error('CMS 공통 API 로드 실패'));document.head.append(script);
  }));
  function applyValue(el, row) {
    var type = el.getAttribute('data-cms-type') || 'text';
    if (!row || row.value === undefined || row.value === null) return;
    if (row.value === '' && type === 'bg' && /^menu\.(?:item\d+|catalog\.[a-z0-9_-]+\.[a-z0-9_-]+|food\.\d+)\.bg$/i.test(el.getAttribute('data-cms') || '')) {
      el.style.backgroundImage = 'none';
      el.classList.remove('has-menu-photo');
      return;
    }
    if (row.value === '' && /^menu\.item\d+\.title$/.test(el.getAttribute('data-cms') || '')) {
      el.innerHTML = '';
      return;
    }
    if (row.value === '' && /^(people\.|store\.(?:\d+|gallery\.\d+)\.photo$)/.test(el.getAttribute('data-cms') || '')) {
      if (type === 'img') { el.removeAttribute('src'); el.hidden = true; }
      else el.innerHTML = '';
      return;
    }
    if (row.value === '') {
      if(type==='img'){el.removeAttribute('src');el.hidden=true;}
      else if(type==='video'){var s0=el.querySelector('source');if(s0)s0.removeAttribute('src');el.removeAttribute('src');el.hidden=true;if(el.load)el.load();}
      else if(type==='bg')el.style.backgroundImage='none';
      else if(type==='meta')el.setAttribute('content','');
      else if(type==='favicon')el.removeAttribute('href');
      else el.innerHTML='';
      return;
    }
    if (type === 'img' && /^(people\.|store\.(?:\d+|gallery\.\d+)\.photo$)/.test(el.getAttribute('data-cms') || '')) el.hidden = false;

    if (type === 'img') {
      if (window.KinoyaLogo && /^global\.logo\.(header|footer)$/.test(el.getAttribute('data-cms'))) return;
      try{
        var cachedImg = window.__kinoyaGetCachedFileDataUrl ? window.__kinoyaGetCachedFileDataUrl(row.value) : '';
        el.setAttribute('src', cachedImg || KinoyaRuntime.safeURL(row.value,true,true));
        el.hidden=false;
      }catch(e){el.removeAttribute('src');el.hidden=true;}
    } else if (type === 'video') {
      try{
        var vUrl=KinoyaRuntime.safeURL(row.value,true,true);
        var srcEl=el.querySelector('source');
        if(srcEl)srcEl.setAttribute('src',vUrl);else el.setAttribute('src',vUrl);
        el.hidden=false;
        if(typeof el.load==='function'){
          el.load();
          if(el.hasAttribute('autoplay')){el.muted=true;el.loop=true;var p=el.play();if(p&&p.catch)p.catch(function(){});}
        }
      }catch(e){el.removeAttribute('src');el.hidden=true;}
    } else if (type === 'bg') {
      var tpl = el.getAttribute('data-cms-bg-template');
      var cachedBg = window.__kinoyaGetCachedFileDataUrl ? window.__kinoyaGetCachedFileDataUrl(row.value) : '';
      var safe;try{safe=(cachedBg || KinoyaRuntime.safeURL(row.value,true,true)).replace(/["'\\\n\r]/g,encodeURIComponent);}catch(e){el.style.backgroundImage='none';return;}
      var css = tpl ? tpl.replace('__IMG__', safe) : ("url('" + safe + "')");
      el.style.backgroundImage = css;
      if (/^menu\.(?:item\d+|catalog\.[a-z0-9_-]+\.[a-z0-9_-]+|food\.\d+)\.bg$/i.test(el.getAttribute('data-cms') || '')) el.classList.add('has-menu-photo');
    } else if (type === 'meta') {
      var metaKey = el.getAttribute('data-cms') || '';
      if (/\.image$/.test(metaKey)) {
        try { el.setAttribute('content', KinoyaRuntime.safeURL(row.value, true, true)); } catch (e) {}
      } else {
        el.setAttribute('content', row.value);
      }
    } else if (type === 'favicon') {
      try{el.setAttribute('href',KinoyaRuntime.safeURL(row.value,true,true));}catch(e){el.removeAttribute('href');}
    } else {
      var textVal = row.value || '';
      if (el.getAttribute('data-cms') === 'noodle.techcard.1' && /키노야\s*자체\s*제면공장/.test(textVal)) {
        textVal = '자가제면 방식 그대로,<br>매일 반죽부터 숙성까지.';
      }
      el.innerHTML = KinoyaRuntime.cleanHTML(textVal);
    }
  }

  // 사진류(img/bg) 요소는 kinoya.css가 기본적으로 visibility:hidden 처리해둡니다.
  // 최종적으로 보여줄 사진이 정해진 "직후" 이 클래스를 붙여서 한 번에 공개합니다.
  // (기본 사진이 잠깐 보였다가 바뀐 사진으로 전환되는 깜빡임을 원천적으로 제거)
  function revealPhotos(scopeNodes) {
    (scopeNodes || document.querySelectorAll('[data-cms-type="img"],[data-cms-type="bg"]'))
      .forEach(function (el) { el.classList.add('cms-revealed'); });
  }

  async function loadCms() {
    try{await runtimeReady;}catch(e){revealPhotos();console.warn('[cms]',e.message);return;}
    if (window.homeCmsManaged) return; // 메인은 전용 모델이 기존/확장 필드를 함께 적용
    // 개별 매장 상세페이지(store/<slug>/index.html)에서 사진 2배 크기(is-photo-large), 매장 사진 등록 연동, 6가지 버튼(전화하기·문의하기·구글맵·네이버맵·카카오맵·티맵) 자동 구성
    var detailStoreMap = {
      guri: '1',
      yongsan: '2',
      magok: '3',
      songdo: '4',
      euljiro: '5',
      hapjeong: '6',
      hanammisa: '10',
      guro: '15',
      seomyeon: '19',
      yeomchang: '40',
      gayang: 'gayang'
    };
    document.querySelectorAll('.store-card[id]').forEach(function (card) {
      var slug = card.id;
      if (!Object.prototype.hasOwnProperty.call(detailStoreMap, slug)) return;
      var num = detailStoreMap[slug];
      card.classList.add('is-photo-large');
      var thumb = card.querySelector('.store-thumb');
      var nameEl = card.querySelector('[data-cms="storydetail.' + slug + '.name"]') || card.querySelector('h3');
      var labelName = (nameEl ? nameEl.textContent : ('우동키노야 ' + slug)).replace(/\s*→\s*$/, '').trim();
      var photoKey = num === 'gayang' ? 'storydetail.gayang.photo' : ('store.' + num + '.photo');
      if (thumb) {
        var img = thumb.querySelector('img');
        if (!img) {
          img = document.createElement('img');
          img.className = 'store-cms-photo';
          img.alt = labelName + ' 사진';
          img.loading = 'lazy';
          img.hidden = true;
          thumb.prepend(img);
        }
        img.setAttribute('data-cms', photoKey);
        img.setAttribute('data-cms-type', 'img');
        img.setAttribute('data-cms-label', labelName + ' 매장 사진');
      }
      var actions = card.querySelector('.store-actions');
      if (actions) {
        var telLink = actions.querySelector('a[href^="tel:"]');
        var phoneTextEl = Array.from(card.querySelectorAll('.store-meta span')).find(function (s) { return /📞/.test(s.textContent || ''); });
        var defaultPhone = telLink ? (telLink.getAttribute('href') || '').replace(/^tel:/i, '').trim()
          : (phoneTextEl ? phoneTextEl.textContent.replace(/[^0-9+-]/g, '') : '0507-1408-1984');
        if (!defaultPhone) defaultPhone = '0507-1408-1984';
        var q = encodeURIComponent(labelName);
        var existKakao = actions.querySelector('a[href*="kakao.com"]');
        var kakaoHref = existKakao ? existKakao.getAttribute('href') : ('https://map.kakao.com/link/search/' + q);
        var prefix = num === 'gayang' ? 'storydetail.gayang' : ('store.' + num);

        actions.replaceChildren();

        var btnTel = document.createElement('a');
        btnTel.href = 'tel:' + defaultPhone;
        btnTel.className = 'primary';
        btnTel.setAttribute('data-event', 'store_phone_click');
        btnTel.setAttribute('data-label', slug + '_detail');
        btnTel.setAttribute('data-cms-tel', prefix + '.phone');
        btnTel.textContent = '전화하기';
        actions.appendChild(btnTel);

        var btnConsult = document.createElement('a');
        btnConsult.href = '../../contact/';
        btnConsult.setAttribute('data-event', 'franchise_cta_click');
        btnConsult.setAttribute('data-label', slug + '_detail');
        btnConsult.textContent = '문의하기';
        actions.appendChild(btnConsult);

        var btnGoogle = document.createElement('a');
        btnGoogle.href = 'https://www.google.com/maps/search/' + q;
        btnGoogle.target = '_blank';
        btnGoogle.rel = 'noopener';
        btnGoogle.setAttribute('data-map-type', 'google');
        btnGoogle.setAttribute('data-cms-href', prefix + '.google_map_url');
        btnGoogle.textContent = '🗺 구글맵';
        actions.appendChild(btnGoogle);

        var btnNaver = document.createElement('a');
        btnNaver.href = 'https://map.naver.com/p/search/' + q;
        btnNaver.target = '_blank';
        btnNaver.rel = 'noopener';
        btnNaver.setAttribute('data-map-type', 'naver');
        btnNaver.setAttribute('data-cms-href', prefix + '.naver_map_url');
        btnNaver.textContent = '🗺 네이버맵';
        actions.appendChild(btnNaver);

        var btnKakao = document.createElement('a');
        btnKakao.href = kakaoHref;
        btnKakao.target = '_blank';
        btnKakao.rel = 'noopener';
        btnKakao.setAttribute('data-map-type', 'kakao');
        btnKakao.setAttribute('data-cms-href', prefix + '.kakao_map_url');
        btnKakao.textContent = '🗺 카카오맵';
        actions.appendChild(btnKakao);

        var btnTmap = document.createElement('a');
        btnTmap.href = 'https://tmap.life/search?query=' + q;
        btnTmap.target = '_blank';
        btnTmap.rel = 'noopener';
        btnTmap.setAttribute('data-map-type', 'tmap');
        btnTmap.setAttribute('data-cms-href', prefix + '.tmap_url');
        btnTmap.textContent = '🧭 티맵';
        actions.appendChild(btnTmap);
      }
    });
    document.querySelectorAll('.store-card[id*="store-"]').forEach(function (card) {
      var m = card.id.match(/store-(\d+)$/);
      var thumb = card.querySelector('.store-thumb');
      if (!m || !thumb) return;
      var num = m[1];
      var nameEl = card.querySelector('[data-cms="store.' + num + '.name"]') || card.querySelector('h3');
      var labelName = (nameEl ? nameEl.textContent : ('매장 ' + num)).replace(/\s*→\s*$/,'').trim();
      var img = thumb.querySelector('img');
      if (!img) {
        img = document.createElement('img');
        img.className = 'store-cms-photo';
        img.alt = labelName + ' 사진';
        img.loading = 'lazy';
        img.hidden = true;
        thumb.prepend(img);
      }
      img.setAttribute('data-cms', 'store.' + num + '.photo');
      img.setAttribute('data-cms-type', 'img');
      img.setAttribute('data-cms-label', labelName + ' 매장 사진');
      var telEl = card.querySelector('.store-actions a[href^="tel:"]');
      if (telEl) telEl.setAttribute('data-cms-tel', 'store.' + num + '.phone');
      var actions = card.querySelector('.store-actions');
      if (actions) {
        var q = encodeURIComponent(labelName);
        Array.from(actions.querySelectorAll('a')).forEach(function (a) {
          var h = a.getAttribute('href') || '';
          if (/google\.com\/maps/i.test(h)) {
            a.setAttribute('data-map-type', 'google');
            a.setAttribute('data-cms-href', 'store.' + num + '.google_map_url');
            a.setAttribute('data-cms-label', labelName + ' 구글맵');
          } else if (/naver\.com|naver\.me/i.test(h)) {
            a.setAttribute('data-map-type', 'naver');
            a.setAttribute('data-cms-href', 'store.' + num + '.naver_map_url');
            a.setAttribute('data-cms-label', labelName + ' 네이버맵');
          } else if (!/^tel:/i.test(h) && !/kakao\.com|tmap\.life/i.test(h)) {
            a.setAttribute('data-cms-href', 'store.' + num + '.detail_url');
            a.setAttribute('data-cms-label', labelName + ' 상세페이지');
          }
        });
        if (!actions.querySelector('[data-map-type="kakao"]')) {
          var kBtn = document.createElement('a');
          kBtn.href = 'https://map.kakao.com/link/search/' + q;
          kBtn.target = '_blank';
          kBtn.rel = 'noopener';
          kBtn.setAttribute('data-map-type', 'kakao');
          kBtn.setAttribute('data-cms-href', 'store.' + num + '.kakao_map_url');
          kBtn.setAttribute('data-cms-label', labelName + ' 카카오맵');
          kBtn.textContent = '🗺 카카오맵';
          actions.appendChild(kBtn);
        }
        if (!actions.querySelector('[data-map-type="tmap"]')) {
          var tBtn = document.createElement('a');
          tBtn.href = 'https://tmap.life/search?query=' + q;
          tBtn.target = '_blank';
          tBtn.rel = 'noopener';
          tBtn.setAttribute('data-map-type', 'tmap');
          tBtn.setAttribute('data-cms-href', 'store.' + num + '.tmap_url');
          tBtn.setAttribute('data-cms-label', labelName + ' 티맵');
          tBtn.textContent = '🧭 티맵';
          actions.appendChild(tBtn);
        }
      }
    });
    // 우리동네 키노야 단독 페이지(store/index.html)에서 store_items 테이블의 추가 매장 렌더링
    if (document.getElementById('seoul') && document.querySelector('.store-list')) {
      KinoyaRuntime.all('store_items').then(function (items) {
        items = (items || []).filter(function (r) { return r.is_published !== false; })
          .sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
        if (!items.length) return;
        var regionNames = { seoul: 'Seoul · 서울', gyeonggi: 'Gyeonggi · 경기', incheon: 'Incheon · 인천', chungcheong: 'Chungcheong · 충청', daegu: 'Daegu · 대구', busan: 'Busan · 부산', jeju: 'Jeju · 제주' };
        var jumpNames = { seoul: '서울', gyeonggi: '경기', incheon: '인천', chungcheong: '충청', daegu: '대구', busan: '부산', jeju: '제주' };
        items.forEach(function (item) {
          var region = regionNames[item.region] ? item.region : 'seoul';
          var sec = document.getElementById(region);
          var list = sec && sec.querySelector('.store-list');
          if (!list) return;
          var cardId = 'store-custom-' + String(item.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
          if (document.getElementById(cardId)) return;
          var card = document.createElement('article');
          card.className = 'store-card';
          card.id = cardId;
          var thumb = document.createElement('div');
          thumb.className = 'store-thumb';
          var icon = document.createElement('i');
          icon.className = 'fa-solid fa-bowl-food store-icon';
          thumb.appendChild(icon);
          if (item.photo) {
            try {
              var photoUrl = KinoyaRuntime.safeURL(item.photo, true, true);
              var img = document.createElement('img');
              img.className = 'store-cms-photo cms-revealed';
              img.src = photoUrl;
              img.alt = (item.name || '매장') + ' 사진';
              img.loading = 'lazy';
              thumb.insertBefore(img, thumb.firstChild);
            } catch (e) {}
          }
          var body = document.createElement('div');
          body.className = 'store-body';
          var h3 = document.createElement('h3');
          var detailUrl = '';
          if (item.detail_url) { try { detailUrl = KinoyaRuntime.safeURL(item.detail_url); } catch (e) {} }
          if (detailUrl) {
            var a = document.createElement('a');
            a.href = detailUrl;
            a.style.cssText = 'color:inherit;text-decoration:none;';
            a.textContent = (item.name || '') + ' →';
            h3.appendChild(a);
          } else {
            h3.textContent = item.name || '';
          }
          body.appendChild(h3);
          var addr = document.createElement('address');
          addr.textContent = item.address || '';
          body.appendChild(addr);
          if (item.hours || item.closed_days || item.meta) {
            var meta = document.createElement('div');
            meta.className = 'store-meta';
            if (item.hours || item.closed_days) {
              var hSpan = document.createElement('span');
              var hText = String(item.hours || '').replace(/^🕒\s*/, '').trim();
              var cText = String(item.closed_days || '').trim();
              hSpan.textContent = '🕒 ' + (hText && cText ? (hText + ' · ' + cText) : (hText || cText));
              meta.appendChild(hSpan);
            }
            if (item.meta) {
              var span = document.createElement('span');
              span.textContent = item.meta;
              meta.appendChild(span);
            }
            body.appendChild(meta);
          }
          var actions = document.createElement('div');
          actions.className = 'store-actions';
          if (item.phone) {
            var tel = document.createElement('a');
            tel.className = 'primary';
            tel.href = 'tel:' + String(item.phone).replace(/[^0-9+-]/g, '');
            tel.textContent = '전화하기';
            actions.appendChild(tel);
          }
          if (detailUrl) {
            var det = document.createElement('a');
            det.href = detailUrl;
            det.textContent = '매장 자세히 보기 →';
            actions.appendChild(det);
          }
          var q = encodeURIComponent(item.name || '우동키노야');
          var gMap = 'https://www.google.com/maps/search/' + q;
          var nMap = 'https://map.naver.com/p/search/' + q;
          var kMap = 'https://map.kakao.com/link/search/' + q;
          var tMap = 'https://tmap.life/search?query=' + q;
          if (item.google_map_url) { try { gMap = KinoyaRuntime.safeURL(item.google_map_url); } catch (e) {} }
          if (item.naver_map_url) { try { nMap = KinoyaRuntime.safeURL(item.naver_map_url); } catch (e) {} }
          if (item.kakao_map_url) { try { kMap = KinoyaRuntime.safeURL(item.kakao_map_url); } catch (e) {} }
          if (item.tmap_url) { try { tMap = KinoyaRuntime.safeURL(item.tmap_url); } catch (e) {} }
          var gBtn = document.createElement('a');
          gBtn.href = gMap; gBtn.target = '_blank'; gBtn.rel = 'noopener'; gBtn.textContent = '🗺 구글맵';
          var nBtn = document.createElement('a');
          nBtn.href = nMap; nBtn.target = '_blank'; nBtn.rel = 'noopener'; nBtn.textContent = '🗺 네이버맵';
          var kBtn2 = document.createElement('a');
          kBtn2.href = kMap; kBtn2.target = '_blank'; kBtn2.rel = 'noopener'; kBtn2.textContent = '🗺 카카오맵';
          var tBtn2 = document.createElement('a');
          tBtn2.href = tMap; tBtn2.target = '_blank'; tBtn2.rel = 'noopener'; tBtn2.textContent = '🧭 티맵';
          actions.appendChild(gBtn);
          actions.appendChild(nBtn);
          actions.appendChild(kBtn2);
          actions.appendChild(tBtn2);
          body.appendChild(actions);
          card.appendChild(thumb);
          card.appendChild(body);
          list.appendChild(card);
        });
        Object.keys(regionNames).forEach(function (rKey) {
          var sec = document.getElementById(rKey);
          var list = sec && sec.querySelector('.store-list');
          var heading = sec && sec.querySelector('.store-group-heading');
          if (list && heading) {
            var count = list.querySelectorAll('.store-card').length;
            heading.textContent = regionNames[rKey] + ' (' + count + '개 매장)';
            var jumpLink = document.querySelector('.section-jump-links a[href="#' + rKey + '"]');
            if (jumpLink) jumpLink.textContent = jumpNames[rKey] + '(' + count + ')';
          }
        });
      }).catch(function () {});
    }
    var nodes = document.querySelectorAll('[data-cms]');
    if (!nodes.length) { revealPhotos(); return; }

    // 깜빡임 방지: 로컬 스토리지에 캐시된 값이 있으면 먼저 즉시 적용 (화면 전환 시 로고 깜빡임 완벽 제거)
    var hadCache = false;
    try {
      localStorage.removeItem('cms_cache');
      var cached = localStorage.getItem('cms_cache_v2');
      if (cached) {
        var cachedData = JSON.parse(cached);
        hadCache = true;
        nodes.forEach(function (el) {
          var key = el.getAttribute('data-cms');
          if (key && cachedData[key]) applyValue(el, cachedData[key]);
        });
      }
    } catch (e) {}
    if (window.MenuPhotos) MenuPhotos.apply(document);

    // 캐시된 값이 있으면 그 시점에 바로 사진을 공개합니다(= 기본 사진이 화면에
    // 그려지는 순간 자체가 없으므로 깜빡임 없음). 캐시가 없는 최초 방문 시에도
    // 최대 280ms 안에 사진을 즉시 공개해 사진 로딩 지연을 방지합니다.
    if (hadCache) revealPhotos();
    var fastTimer = setTimeout(function () { revealPhotos(); }, 280);

    // 캐시 무효화: 브라우저/CDN이 예전 응답을 재사용해 "저장했는데 반영 안 됨" 문제가
    // 생기지 않도록, 매 요청마다 캐시를 강제로 건너뛰고 새 요청으로 취급시킵니다.
    KinoyaRuntime.all('site_content').then(function(rows){return {data:rows};})
      .then(function (json) {
        var rows = (json && json.data) || [];
        var byKey = {};
        rows.forEach(function (r) { byKey[r.key] = r; });
        if (window.KinoyaLogo) window.KinoyaLogo.accept(byKey);
        else window.__kinoyaLogoRows = byKey;
        
        // 최신 데이터 적용 (상세페이지 전용 사진 storydetail.<slug>.photo 가 있으면 최우선 적용, 없으면 메인 매장 사진 store.<N>.photo 자동 적용)
        nodes.forEach(function (el) {
          var key = el.getAttribute('data-cms');
          if (!key) return;
          var row = byKey[key];
          if (/^store\.\d+\.photo$/.test(key)) {
            var cardEl = el.closest('.store-card[id]');
            var detailKey = cardEl && cardEl.id ? ('storydetail.' + cardEl.id + '.photo') : '';
            if (detailKey && byKey[detailKey] && byKey[detailKey].value) {
              row = byKey[detailKey];
            }
          }
          if (row) applyValue(el, row);
        });
        document.querySelectorAll('[data-cms-href]').forEach(function (el) {
          var hrefKey = el.getAttribute('data-cms-href');
          if (hrefKey && byKey[hrefKey] && byKey[hrefKey].value) {
            try { el.setAttribute('href', KinoyaRuntime.safeURL(byKey[hrefKey].value, false, true)); } catch (e) {}
          }
        });
        document.querySelectorAll('[data-cms-tel]').forEach(function (el) {
          var telKey = el.getAttribute('data-cms-tel');
          if (telKey && byKey[telKey] && byKey[telKey].value) {
            var clean = String(byKey[telKey].value).replace(/[^0-9+-]/g, '');
            if (clean) el.setAttribute('href', 'tel:' + clean);
          }
        });

        // 최초 방문(캐시 없음)이었다면 이제서야 최종 사진이 정해졌으므로 공개합니다.
        // 캐시가 있었어도 서버 최신값으로 또 바뀔 가능성이 있으니 다시 한 번 보장합니다.
        clearTimeout(fastTimer);
        revealPhotos();
        
        // 다음 페이지 이동 시 깜빡임이 없도록 캐시 저장
        try { localStorage.setItem('cms_cache_v2', JSON.stringify(byKey)); } catch (e) {}
        if (window.__kinoyaHydrateFiles) window.__kinoyaHydrateFiles();
        document.dispatchEvent(new CustomEvent('kinoya:cms-ready', { detail: { rows: byKey } }));
      })
      .catch(function (err) {
        console.warn('[cms] 콘텐츠를 불러오지 못했습니다(기본값 유지):', err);
        // 서버 요청 실패 시에도 기본 사진을 영구히 숨기지 않도록 공개합니다.
        clearTimeout(fastTimer);
        revealPhotos();
        document.dispatchEvent(new CustomEvent('kinoya:cms-ready', { detail: { rows: {} } }));
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCms);
  } else {
    loadCms();
  }
})();
