/* Attached menu-board content. Missing assets are intentionally not replaced with unrelated photos. */
(function () {
  'use strict';
  const categories = [
    {id:'signature', name:'시그니처', en:'Signature', items:[
      ['eel','30cm 장어튀김 붓카케우동','15,900원','보양식 바다장어를 바삭하게 튀겨낸 스태미나 우동','냉 · 1일 15그릇 한정'],
      ['soba','자루소바 & 세트','자루소바 9,500원\n자루소바 + 한돈 돈카츠 14,900원','메밀 40%로 만든 키노야만의 직접 쯔유 소바'],
      ['maze','마제우동','11,000원','특제 민찌소스와 계란, 파 등을 버무려 감칠맛 나게 먹는 매콤한 비빔우동'],
      ['katsu','48시간 숙성 한돈 수제돈카츠','등심(로스) 11,500원\n안심(히레) 12,500원\n모짜렐라 치즈카츠 13,900원','국내산 한돈 · 100% 모짜렐라 치즈'],
      ['gyudon','규동','10,000원','최상의 우삼겹살을 특제소스로 요리한 일식 소고기 덮밥']
    ]},
    {id:'bukkake', name:'붓카케·자루', en:'Bukkake & Zaru', items:[
      ['basic','키노야 붓카케우동','8,000원','48시간 저온숙성 면의 쫄깃함과 특제 쯔유소스의 감칠맛이 일품인 기본 냉우동','냉'],
      ['zaru','자루우동','9,500원','키노야 특제 비법 쯔유 소스와 고소한 깨소스까지, 2가지 소스로 즐기는 쫄깃담백한 자루우동','냉'],
      ['toriten','토리텐(닭) 붓카케우동','11,000원','바삭한 닭튀김과 쫄깃한 우동','냉 · 온'],
      ['shrimp','단새우 붓카케우동','12,000원','풍미 좋은 단새우와 녹진함의 조화, 쫄깃한 맛이 일품인 단새우 우동','냉'],
      ['roe','참기름 명란 붓카케우동','12,000원','최상급 명란과 국산 저온압착 참기름으로 맛을 낸 이색우동','냉'],
      ['tempura','덴푸라 붓카케우동','12,500원','바삭하게 튀겨낸 새우, 야채 덴푸라와 쫄깃한 우동','냉 · 온']
    ]},
    {id:'kake', name:'카케', en:'Kake', items:[
      ['basic','키노야 카케우동','8,000원','매일 아침 직접 끓이는 뜨끈하고 진한 육수가 일품인 기본에 충실한 우동','온'],
      ['kitsune','키츠네(유부) 카케우동','9,000원','따뜻한 우동국물과 환상궁합인 달콤한 유부가 통째로!','온'],
      ['butter','명란버터우동','12,000원','명란의 짭조름함과 버터의 고소함을 비벼먹는 중독성 있는 우동','온'],
      ['curry','카레우동','12,500원','14가지 향신료를 황금비율로 배합하고, 24시간 저온숙성한 중독적인 카레우동\n토리텐 · 에비텐 · 고로케 카레우동','온'],
      ['niku','니꾸(소고기) 카케우동','13,000원','달큰한 우삼겹을 키노야 비법 쯔유로 정성껏 졸여 맛을 낸 진한 소고기 우동','온']
    ]},
    {id:'set', name:'정식', en:'Set Menu', items:[
      ['gyudon','규동 + 우동','14,500원',''],
      ['soba','자루소바 + 돈카츠','14,900원',''],
      ['maze','마제우동 + 돈카츠','14,900원',''],
      ['curry','카레우동 + 돈카츠','14,900원',''],
      ['zaru','자루우동 + 돈카츠','14,900원',''],
      ['katsu','한돈돈카츠 + 우동','14,900원','']
    ]},
    {id:'side', name:'사이드', en:'Side', items:[
      ['rice','간장 계란밥','3,500원',''],['salad','고마 샐러드','4,000원',''],
      ['curry','미니 카레라이스','4,000원',''],['shrimp','에비텐(새우튀김)','5,000원',''],
      ['croquette','수제 감자고로케','5,000원',''],['tempura','덴뿌라','5,000원',''],
      ['toriten','토리텐(닭튀김)','5,500원',''],['loin','등심돈카츠','9,000원',''],
      ['fillet','안심카츠','9,500원',''],['sando','가츠산도','10,000원','']
    ]},
    {id:'drink', name:'음료·주류', en:'Drinks', items:[
      ['soda','탄산음료','2,000원','사이다 · 콜라 · 제로콜라 · 펩시제로'],
      ['sapporo','삿포로','5,000원',''],['asahi','아사히 병','7,000원',''],
      ['highball','산토리 하이볼','9,000원','']
    ]}
  ];
  const foodPhotos = [
    ['01', 'images/food-abalone-bukkake.jpg', '3일숙성 완도전복 붓카케우동 — 완도전복을 비법 간장으로 3일 숙성한 키노야 시그니처 보양식 우동'],
    ['02', 'images/food-eel-bukkake.jpg', '30cm 장어튀김 붓카케우동 — 보양식 바다장어를 통째로 바삭하게 튀겨낸 스태미나 우동'],
    ['03', 'images/food-curry-udon.jpg', '카레우동 — 14가지 향신료를 황금비율로 배합하고 24시간 저온숙성한 중독적인 카레우동'],
    ['04', 'images/food-sesame-roe-bukkake.jpg', '참기름 명란 붓카케우동 — 최상급 명란과 국산 저온압착 참기름으로 맛을 낸 이색우동'],
    ['05', 'images/menu-amaebi-bukkake.jpg', '단새우 붓카케우동 — 풍미 좋은 단새우의 단맛과 녹진함이 쫄깃한 숙성면과 어우러진 우동'],
    ['06', 'images/food-kake-udon.jpg', '키노야 카케우동 — 매일 아침 직접 끓이는 뜨끈하고 진한 육수가 일품인 기본에 충실한 우동'],
    ['07', 'images/menu-niku-kake.jpg', '니꾸(소고기) 카케우동 — 얇게 썬 우삼겹을 키노야 비법 쯔유로 정성껏 졸여낸 진한 소고기 우동'],
    ['08', 'images/food-zaru-udon.jpg', '자루우동 — 키노야 특제 비법 쯔유 소스와 고소한 깨소스 2가지로 즐기는 쫄깃담백한 냉우동'],
    ['09', 'images/food-tempura-bukkake.jpg', '덴푸라 붓카케우동 — 즉석에서 바삭하게 튀겨낸 새우·야채 덴푸라와 48시간 숙성 우동'],
    ['10', 'images/food-kitsune-kake.jpg', '키츠네(유부) 카케우동 — 따뜻한 우동 국물과 환상 궁합을 이루는 달콤한 대왕 유부 우동'],
    ['11', 'images/food-maze-udon.jpg', '마제우동 — 특제 민찌소스와 계란 노른자, 파 등을 비벼 감칠맛 나게 즐기는 매콤 비빔우동'],
    ['12', 'images/food-basic-bukkake.png', '키노야 붓카케우동 — 48시간 저온숙성 면발의 쫄깃함과 특제 쯔유소스의 감칠맛이 살아있는 대표 냉우동'],
    ['13', 'images/food-toriten-bukkake.jpg', '토리텐(닭) 붓카케우동 — 겉바속촉 수제 닭다리살 튀김과 쫄깃한 숙성면의 조화'],
    ['14', 'images/food-mentaiko-butter.jpg', '명란버터우동 — 짭조름한 명란과 고소한 버터를 따뜻한 면에 비벼 먹는 중독성 우동'],
    ['15', 'images/menu-gyudon.jpg', '규동 — 최상의 우삼겹살을 키노야 특제 타레소스로 요리한 일식 소고기 덮밥'],
    ['16', 'images/food-pork-katsu.jpg', '48시간 숙성 한돈 수제돈카츠 — 국내산 한돈 등심을 48시간 저온숙성·레스팅해 튀겨낸 프리미엄 돈카츠'],
    ['17', 'images/menu-tempura.jpg', '수제 모둠 덴푸라 — 주문 즉시 깨끗한 기름에 바삭하게 튀겨내는 새우·단호박·고구마 튀김'],
    ['18', 'images/food-table-spread.jpg', '우동키노야 정식 & 한상차림 — 우동과 수제 돈카츠, 덮밥, 사이드를 풍성하게 즐기는 대표 한상'],
    ['19', 'images/udon-bowl-hero.jpg', '가케우동 & 수제 튀김 — 깊고 깔끔한 가쓰오 육수와 48시간 숙성 생면이 어우러진 클래식 우동'],
    ['20', 'images/udon-noodle-texture.jpg', '48시간 저온숙성 80cm 장척 생면 — 압도적인 탄력과 찰기를 자랑하는 우동키노야 자가제면']
  ];
  const assetRoot = new URL('../', document.currentScript.src);
  const photos = {
    'signature.eel':'images/food-eel-bukkake.jpg',
    'signature.soba':'images/food-zaru-udon.jpg',
    'signature.maze':'images/food-maze-udon.jpg',
    'signature.katsu':'images/food-pork-katsu.jpg',
    'signature.gyudon':'images/menu-gyudon.jpg',
    'bukkake.basic':'images/food-basic-bukkake.png',
    'bukkake.zaru':'images/food-zaru-udon.jpg',
    'bukkake.toriten':'images/food-toriten-bukkake.jpg',
    'bukkake.shrimp':'images/menu-amaebi-bukkake.jpg',
    'bukkake.roe':'images/food-sesame-roe-bukkake.jpg',
    'bukkake.tempura':'images/food-tempura-bukkake.jpg',
    'kake.basic':'images/food-kake-udon.jpg',
    'kake.kitsune':'images/food-kitsune-kake.jpg',
    'kake.butter':'images/food-mentaiko-butter.jpg',
    'kake.curry':'images/food-curry-udon.jpg',
    'kake.niku':'images/menu-niku-kake.jpg'
  };
  const photoURL = (category,item) => photos[category+'.'+item] ? new URL(photos[category+'.'+item],assetRoot).href : '';
  const foodPhotoURL = rel => rel ? new URL(rel, assetRoot).href : '';
  const escape = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = value => escape(value).replace(/\n/g,'<br>');
  function foodGalleryMarkup() {
    return '';
  }
  function markup() {
    return '<div class="menu-catalog">' + categories.map((category,index) =>
      '<section class="menu-category" id="category-' + category.id + '" data-category="' + category.id + '">' +
      '<header class="menu-category-heading"><div><span class="menu-category-number">0' + (index+1) + ' / ' + category.en + '</span><h3>' + category.name + '</h3></div>' +
      '</header>' +
      '<div class="menu-category-lane" tabindex="0" role="region" aria-label="' + category.name + ' 메뉴 · 좌우 슬라이드"><div class="menu-category-track">' +
      category.items.map(item => {
        const key = 'menu.catalog.' + category.id + '.' + item[0];
        const photo = photoURL(category.id,item[0]);
        return '<article class="menu-catalog-card"><div class="menu-catalog-photo'+(photo?' has-menu-photo':'')+'"'+(photo?' style="background-image:url(&quot;'+escape(photo)+'&quot;)"':'')+' role="img" aria-label="' + escape(item[1]) + ' 사진" data-cms="' + key + '.bg" data-cms-type="bg" data-cms-label="' + escape(item[1]) + ' 사진"></div>' +
          '<div class="menu-catalog-body">' + (item[4] ? '<span class="menu-catalog-badge">' + escape(item[4]) + '</span>' : '') +
          '<h4 data-cms="' + key + '.name" data-cms-label="' + escape(item[1]) + ' 메뉴명">' + escape(item[1]) + '</h4>' +
          '<p class="menu-catalog-description" data-cms="' + key + '.description" data-cms-label="' + escape(item[1]) + ' 설명">' + text(item[3]) + '</p>' +
          '<p class="menu-catalog-price" data-cms="' + key + '.price" data-cms-label="' + escape(item[1]) + ' 가격">' + text(item[2]) + '</p></div></article>';
      }).join('') + '</div></div></section>'
    ).join('') + foodGalleryMarkup() + '</div>';
  }
  function render(scope) {
    scope.querySelectorAll('.menu-page-grid').forEach(grid => {
      const template = grid.ownerDocument.createElement('template');
      template.innerHTML = markup();
      grid.replaceWith(template.content);
    });
    window.MenuPhotos?.apply(scope);
  }
  window.MenuCatalog = {categories, foodPhotos, photos, render, markup};
  // Admin uses the same canonical item list; old menu.item* values remain untouched.
  if (window.CMS_FIELDS) window.CMS_FIELDS.forEach(field => {
    if (/^menu\.item\d+\./.test(field.key)) { field.group = '메뉴소개 · 이전 16칸(보관용)'; field.label += ' · 새 카테고리에는 미사용'; }
  });
  if (window.CMS_FIELDS) {
    categories.forEach(category => category.items.forEach(item => {
      const prefix = 'menu.catalog.' + category.id + '.' + item[0];
      [['bg','사진','image',photoURL(category.id,item[0])],['name','메뉴명','text',item[1]],['description','설명','text',text(item[3])],['price','가격','text',text(item[2])]].forEach(field => {
        window.CMS_FIELDS.push({group:'메뉴소개 · '+category.name, key:prefix+'.'+field[0], label:item[1]+' '+field[1], type:field[2], current:field[3]});
      });
    }));
    window.CMS_FIELDS.push(
      {group:'메뉴소개 · 우동키노야 음식사진 (20장 슬라이드)', key:'menu.food.eyebrow', label:'섹션 상단 영문 라벨', type:'text', current:'06 / KINOYA FOOD GALLERY'},
      {group:'메뉴소개 · 우동키노야 음식사진 (20장 슬라이드)', key:'menu.food.title', label:'섹션 제목', type:'text', current:'우동키노야 음식사진'}
    );
    foodPhotos.forEach((entry, idx) => {
      const num = entry[0];
      const prefix = 'menu.food.' + num;
      window.CMS_FIELDS.push(
        {group:'메뉴소개 · 우동키노야 음식사진 (20장 슬라이드)', key:prefix+'.bg', label:'음식사진 ' + (idx + 1) + '번 이미지', type:'image', current:foodPhotoURL(entry[1])},
        {group:'메뉴소개 · 우동키노야 음식사진 (20장 슬라이드)', key:prefix+'.desc', label:'음식사진 ' + (idx + 1) + '번 설명', type:'text', current:entry[2]}
      );
    });
  }
  render(document);
})();
