(async function () {
  const tests = [];
  const check = (name, ok) => tests.push({name, ok: !!ok});
  try {
    const first = document.querySelector('[data-cms="menu.item1.bg"]');
    const cleared = document.querySelector('[data-cms="menu.item2.bg"]');
    const empty = document.querySelector('[data-cms="menu.item3.bg"]');
    check('API 응답 전 캐시 사진 적용', first.style.backgroundImage.includes('udon-noodle-texture'));
    check('API 응답 전 캐시 메뉴명 적용', first.querySelector('figcaption').textContent === '캐시 메뉴');
    check('전체 홈페이지 pending 상태에서도 사진 즉시 공개', getComputedStyle(first).visibility === 'visible');
    check('캐시에서 지운 사진은 빈 화면 유지', cleared.style.backgroundImage === 'none' && !cleared.classList.contains('has-menu-photo'));
    check('미등록 사진은 기본 사진 없이 빈칸 유지', getComputedStyle(empty).backgroundImage === 'none');
    check('메뉴만 검색하는 우선 요청', window.menuPhotoRequests.length === 1 && window.menuPhotoRequests[0].includes('search=menu.'));
    const host = document.createElement('section');
    const mounted = document.createElement('figure');
    mounted.className = 'tech-card menu-card has-menu-photo';
    mounted.dataset.cms = 'menu.item1.bg';
    mounted.dataset.cmsType = 'bg';
    mounted.style.backgroundImage = 'url("/images/udon-bowl-hero.jpg")';
    host.className = 'menu-page-grid';
    host.append(mounted);
    document.querySelector('main').append(host);
    document.dispatchEvent(new CustomEvent('home-menu-mounted', {detail: {element: host}}));
    check('메뉴 본문이 새로 들어와도 캐시 사진 즉시 적용', mounted.style.backgroundImage.includes('udon-noodle-texture') && getComputedStyle(mounted).visibility === 'visible');
    const catalog = document.createElement('div');
    catalog.className = 'menu-catalog';
    catalog.innerHTML = '<article><div class="menu-catalog-photo" data-cms="menu.catalog.signature.eel.bg" data-cms-type="bg"></div><div class="menu-catalog-body"><h4 data-cms="menu.catalog.signature.eel.name">기본 메뉴명</h4></div></article>';
    document.querySelector('main').append(catalog);
    MenuPhotos.apply(catalog);
    const catalogPhoto = catalog.querySelector('.menu-catalog-photo');
    check('새 카테고리 무사진 영역도 pending 중 공개', getComputedStyle(catalogPhoto).visibility === 'visible');
    const latest = [
      {key: 'menu.item1.bg', value: '/images/udon-bowl-hero.jpg'},
      {key: 'menu.item1.title', value: '최신 메뉴'},
      {key: 'menu.item2.bg', value: ''},
      {key: 'menu.catalog.signature.eel.bg', value: '/images/udon-bowl-hero.jpg'},
      {key: 'menu.catalog.signature.eel.name', value: '카테고리 최신 메뉴명'}
    ];
    window.releaseMenuPhotoReply(latest);
    await window.MenuPhotos.ready;
    check('메뉴 우선 응답으로 사진 갱신', first.style.backgroundImage.includes('udon-bowl-hero') && mounted.style.backgroundImage.includes('udon-bowl-hero'));
    check('메뉴 우선 응답으로 이름 갱신', first.querySelector('figcaption').textContent === '최신 메뉴');
    check('새 카테고리 사진에 우선 조회 값 반영', catalogPhoto.style.backgroundImage.includes('udon-bowl-hero'));
    check('새 카테고리 메뉴명에 우선 조회 값 반영', catalog.querySelector('h4').textContent === '카테고리 최신 메뉴명');
    const stored = JSON.parse(localStorage.getItem('kinoya_menu_cache_v1'));
    check('최신 메뉴 값 캐시 저장', stored['menu.item1.bg'].value.includes('udon-bowl-hero'));
    first.style.backgroundImage = 'url("/images/udon-noodle-texture.jpg")';
    first.querySelector('figcaption').textContent = '오래된 전체 CMS';
    document.dispatchEvent(new CustomEvent('kinoya:cms-ready', {detail: {rows: {'menu.item1.bg': {value: '/images/udon-noodle-texture.jpg'}}}}));
    check('새 카테고리의 최신 사진도 유지', catalogPhoto.style.backgroundImage.includes('udon-bowl-hero'));
    check('느린 전체 CMS가 최신 사진을 덮어쓰지 않음', first.style.backgroundImage.includes('udon-bowl-hero'));
    check('느린 전체 CMS가 최신 메뉴명을 덮어쓰지 않음', first.querySelector('figcaption').textContent === '최신 메뉴');
    check('전체 페이지 로딩 완료를 기다리지 않음', document.documentElement.classList.contains('home-cms-pending') && getComputedStyle(first).visibility === 'visible');
  } catch (error) { check('검사 실행: ' + error.message, false); }
  finally {
    if (window.menuPhotoCacheBackup == null) localStorage.removeItem('kinoya_menu_cache_v1');
    else localStorage.setItem('kinoya_menu_cache_v1', window.menuPhotoCacheBackup);
  }
  document.getElementById('results').textContent = tests.map(test => (test.ok ? 'PASS ' : 'FAIL ') + test.name).join('\n');
  const failed = tests.filter(test => !test.ok);
  document.body.dataset.testStatus = failed.length ? 'failed' : 'passed';
  failed.forEach(test => console.error('[menu photo tests] FAIL: ' + test.name));
  console.log('[menu photo tests] ' + (tests.length - failed.length) + '/' + tests.length + ' passed');
})();
