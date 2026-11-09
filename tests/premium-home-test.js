(async function () {
  'use strict';
  const frame = document.getElementById('site');
  const results = document.getElementById('results');
  const lines = [];
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  function check(name, condition) { lines.push((condition ? 'PASS ' : 'FAIL ') + name); console.log(lines[lines.length - 1]); }
  try {
    // Render the unmodified real page, not a copied design fixture. Delay only this harness.
    await sleep(650); frame.src = '../index.html';
    for (let i = 0; i < 600 && !frame.contentDocument?.documentElement.dataset.premiumReady; i++) await sleep(100);
    const d = frame.contentDocument, w = frame.contentWindow;
    check('실제 홈 CMS 준비 후 디자인 보강 완료', d.documentElement.dataset.premiumReady === 'true');
    if (!d.querySelector('.hero-facts')) throw new Error('홈 초기화 대기 시간 초과');
    await sleep(1200);
    check('음식사진 20장 보존', d.querySelectorAll('.menu-food-card').length === 20);
    check('매장사진 20장 보존', d.querySelectorAll('.store-gallery-card').length === 20);
    check('히어로 CMS 키 보존', !!d.querySelector('[data-cms="home.hero.headline"]'));
    check('새 바로가기 3개 및 프로젝트 경로', d.querySelectorAll('.discovery-link').length === 3 && [...d.querySelectorAll('.discovery-link')].every(a => new URL(a.href).pathname.startsWith(new URL('../', location.href).pathname)));
    check('문서 가로 넘침 없음', d.documentElement.scrollWidth <= w.innerWidth + 1);
    const nav = d.querySelector('.nav'), toggle = d.querySelector('.nav-mobile-toggle'), panel = d.querySelector('.nav-mobile-panel');
    check('상단 내비게이션 가로 넘침 없음', nav.scrollWidth <= nav.clientWidth + 1);
    const logo = d.querySelector('.nav-logo');
    check('상단 브랜드 표시', w.getComputedStyle(logo, '::after').content.includes('KINOYA') || [...logo.querySelectorAll('img')].some(img => img.complete && img.naturalWidth > 0 && w.getComputedStyle(img).display !== 'none'));
    check('상단 창업상담 버튼 표시', w.getComputedStyle(d.querySelector('.nav>.nav-cta')).display !== 'none');
    if (w.innerWidth <= 1150) {
      check('모바일 전체 메뉴 버튼 표시', w.getComputedStyle(toggle).display !== 'none');
      const logoBox = logo.getBoundingClientRect(), ctaBox = d.querySelector('.nav>.nav-cta').getBoundingClientRect(), toggleBox = toggle.getBoundingClientRect();
      check('모바일 로고·상담·메뉴 좌우 정렬 및 겹침 없음', logoBox.right <= ctaBox.left && ctaBox.right <= toggleBox.left && Math.abs(ctaBox.top - toggleBox.top) < 8);
      toggle.click(); await sleep(250);
      check('메뉴 열기와 접근성 상태', toggle.getAttribute('aria-expanded') === 'true' && !panel.inert && panel.contains(d.activeElement));
      d.dispatchEvent(new w.KeyboardEvent('keydown', {key:'Escape', bubbles:true}));
      check('ESC 닫기·포커스 복귀', toggle.getAttribute('aria-expanded') === 'false' && panel.inert && d.activeElement === toggle);
      toggle.blur();
    }
    const motion = d.querySelector('.motion-control');
    if (!w.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      motion.click();
      check('자동 움직임 정지 및 영상 일시정지', d.documentElement.dataset.kinoyaMotionPaused === 'true' && [...d.querySelectorAll('video[autoplay]')].every(v => v.paused));
      motion.click();
      check('자동 움직임 재개 상태', d.documentElement.dataset.kinoyaMotionPaused === 'false');
      const food = d.querySelector('.menu-food-gallery .menu-category-lane');
      food.scrollIntoView({block:'center',behavior:'instant'});
      await sleep(1500);
      const start = food.scrollLeft;
      await sleep(1200);
      check('음식 갤러리 화면 내 연속 자동 이동', food.scrollLeft > start + 5);
      d.documentElement.dataset.kinoyaMotionPaused = 'true';
      await sleep(100); const paused = food.scrollLeft;
      await sleep(350);
      check('사진도 정지 상태 유지', Math.abs(food.scrollLeft - paused) <= 1);
      d.documentElement.dataset.kinoyaMotionPaused = 'false';
      food.scrollLeft = food.scrollWidth - food.clientWidth;
      await sleep(600); const end = food.scrollLeft;
      await sleep(600);
      check('음식사진 끝에서 역방향 이동', food.scrollLeft < end - 5);
      w.scrollTo({top:0,behavior:'instant'}); await sleep(300);
      const offscreen = food.scrollLeft; await sleep(400);
      check('화면 밖 음식사진 자동 이동 정지', Math.abs(food.scrollLeft - offscreen) <= 1);
    }
    w.scrollTo({top:0,behavior:'instant'});
    if (frame.dataset.view === 'discovery') d.querySelector('.discovery-nav').scrollIntoView({block:'center',behavior:'instant'});
    if (frame.dataset.view === 'menu' && w.getComputedStyle(toggle).display !== 'none') toggle.click();
    console.log('HOME QUALITY: '+lines.filter(l=>l.startsWith('PASS')).length+'/'+lines.length+' PASS');
  } catch (error) { lines.push('FAIL '+error.message); console.error(error.message); }
  results.textContent = lines.join('\n');
  results.dataset.complete = 'true';
})();
