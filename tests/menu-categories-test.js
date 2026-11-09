(async function () {
  const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));
  const frame = document.getElementById('menu-frame');
  const results = [];
  function check(label,value) { results.push((value?'PASS: ':'FAIL: ')+label); if (!value) throw new Error(label); }
  try {
    await new Promise(resolve => setTimeout(resolve, 600));
    frame.src = '../menu/index.html';
    for (let i=0;i<150 && !frame.contentDocument?.querySelector('.menu-category-lane')?.dataset.slideSeconds;i++) await sleep(100);
    const doc = frame.contentDocument, win = frame.contentWindow;
    const categories = [...doc.querySelectorAll('.menu-category')];
    check('7개 섹션(6개 카테고리 + 음식사진 갤러리)',categories.length===7);
    check('섹션 순서(사이드 아래 우동키노야 음식사진)',categories.map(c=>c.querySelector('h3').textContent).join('|')==='시그니처|붓카케·자루|카케|정식|사이드|음료·주류|우동키노야 음식사진');
    check('섹션별 카드 수(음식사진 20장 포함)',categories.map(c=>c.querySelectorAll('.menu-catalog-card').length).join(',')==='5,6,5,6,10,4,20');
    check('전체 56개 카드(메뉴 36 + 음식사진 20)',doc.querySelectorAll('.menu-catalog-card').length===56);
    check('6개 바로가기(음식사진 포함 · 음료·주류 제외)',doc.querySelectorAll('.section-jump a').length===6);
    check('정식·사이드 사진 영역 숨김',doc.querySelectorAll('#category-set .menu-catalog-photo, #category-side .menu-catalog-photo').length>0 && [...doc.querySelectorAll('#category-set .menu-catalog-photo, #category-side .menu-catalog-photo')].every(el=>win.getComputedStyle(el).display==='none'));
    check('음료·주류 섹션 숨김',win.getComputedStyle(doc.getElementById('category-drink')).display==='none');
    const foodSection = doc.getElementById('category-food-photos');
    const foodCards = [...(foodSection?.querySelectorAll('.menu-food-card')||[])];
    check('우동키노야 음식사진 20장 사진·설명 표시',foodCards.length===20 && foodCards.every((card,idx)=>{const p=card.querySelector('.menu-catalog-photo'),d=card.querySelector('.menu-food-caption');return p&&p.dataset.cms==='menu.food.'+String(idx+1).padStart(2,'0')+'.bg'&&win.getComputedStyle(p).backgroundImage.includes('url(')&&d&&d.dataset.cms==='menu.food.'+String(idx+1).padStart(2,'0')+'.desc'&&d.textContent.trim().length>5;}));
    check('메뉴명·가격 보임',categories.filter(c=>c.id!=='category-food-photos').every(c=>[...c.querySelectorAll('.menu-catalog-card')].every(card=>card.querySelector('h4').textContent && card.querySelector('.menu-catalog-price').textContent)));
    check('첨부되지 않은 assets 이미지 요청 없음',!doc.querySelector('[src^="assets/"]'));
    check('페이지 가로 넘침 없음',doc.documentElement.scrollWidth<=doc.documentElement.clientWidth+1);
    const category=categories[0],lane=category.querySelector('.menu-category-lane');
    const cards=[...lane.querySelectorAll('.menu-catalog-card')];
    check('표시되는 각 카테고리는 한 줄',categories.filter(c=>win.getComputedStyle(c).display!=='none').every(c=>{const a=[...c.querySelectorAll('.menu-catalog-card')];return a.every(el=>Math.abs(el.getBoundingClientRect().top-a[0].getBoundingClientRect().top)<1);}));
    const visible=win.innerWidth<=767?1:win.innerWidth<=1023?2:4;
    check('반응형 카드 너비',Math.abs(cards[0].getBoundingClientRect().width-(lane.clientWidth-(visible-1)*parseFloat(win.getComputedStyle(category.querySelector('.menu-category-track')).gap))/visible)<2);
    check('이전·재생·다음 버튼 완전 제거',!doc.querySelector('.menu-category-controls, [data-menu-direction], [data-menu-toggle]'));
    lane.dispatchEvent(new win.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); await sleep(900);
    check('키보드로 한 장 직접 이동',lane.scrollLeft>10);
    lane.dispatchEvent(new win.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true})); await sleep(900);
    check('키보드로 이전 위치 복귀',lane.scrollLeft<2);
    lane.scrollIntoView({block:'center'});await sleep(300);
    win.document.dispatchEvent(new win.CustomEvent('kinoya:cms-ready',{detail:{rows:{'menu.autoslide.seconds':{value:'1'}}}}));
    check('관리자 1초 설정 연동',lane.dataset.slideSeconds==='1');
    // Direct operation pauses autoplay for six seconds, then it resumes without a play button.
    lane.dispatchEvent(new win.WheelEvent('wheel',{bubbles:true}));
    await sleep(1200);check('직접 조작 후 자동 이동 유예',lane.scrollLeft<2);
    const moves=Number(lane.dataset.slideMoves||0);
    await sleep(6500);
    const step=cards[0].getBoundingClientRect().width+parseFloat(win.getComputedStyle(category.querySelector('.menu-category-track')).gap);
    check('버튼 없이 자동으로 정확히 한 장 이동',Number(lane.dataset.slideMoves)===moves+1&&Math.abs(lane.scrollLeft-step)<2);
    const foodLane = foodSection.querySelector('.menu-category-lane');
    foodLane.scrollIntoView({block:'center',behavior:'instant'});
    await sleep(1200);
    check('화면 안 우동키노야 음식사진 연속 자동 좌우 스크롤 동작',foodLane && foodLane.dataset.autoScrollMode==='continuous' && foodLane.scrollLeft>10 && Number(foodLane.dataset.slideMoves||0)>5);
    // Test actual HomeFull body composition using its real exported entry point.
    const home=new DOMParser().parseFromString('<main><section id="menu-preview"></section></main>','text/html');
    await HomeFull.prepare(home);
    const mounted=home.getElementById('menu-preview');
    check('홈페이지 조합도 7개 섹션(음식사진 포함)',mounted.querySelectorAll('.menu-category').length===7);
    check('홈페이지 조합도 56개 카드(메뉴 36 + 음식사진 20)',mounted.querySelectorAll('.menu-catalog-card').length===56);
    check('홈페이지 조합에도 버튼 없음',!mounted.querySelector('.menu-category-controls, [data-menu-direction], [data-menu-toggle]'));
    check('홈페이지 카테고리 앵커 재작성',!!home.getElementById('home-page-menu-preview-category-side') && !!home.getElementById('home-page-menu-preview-category-food-photos'));
    check('홈페이지 바로가기 앵커 존재',[...mounted.querySelectorAll('.section-jump a')].every(a=>home.getElementById(a.getAttribute('href').slice(1))));
    check('144개 관리자 카테고리 필드 + 20개 음식사진 슬롯',MenuCatalog.categories.reduce((n,c)=>n+c.items.length*4,0)===144 && MenuCatalog.foodPhotos.length===20);
    const sideSec = doc.getElementById('category-side');
    if (sideSec) win.scrollTo(0, Math.max(0, sideSec.offsetTop - 10));
    window.scrollTo(0, 0);
    console.log('[menu categories] '+results.length+'/'+results.length+' passed ('+win.innerWidth+'px)');
  } catch(error) { results.push('FAIL: 검사 실행 · '+error.message); console.error('[menu categories]',error.message); }
  document.getElementById('results').textContent=results.join('\n');
  document.getElementById('results').dataset.complete = 'true';
})();
