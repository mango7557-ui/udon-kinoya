/* Shared binding model: public home and admin use the same original HTML.
 * Existing CMS keys are reused; supplemental keys are versioned DOM paths.
 * Keep source DOM paths stable when changing the template in future. */
(function () {
  'use strict';
  const modelRoot = new URL('../', document.currentScript.src);
  const titles = {header:'상단 로고 · 메뉴',top:'메인 영상 · 히어로',social:'소셜미디어',numbers:'숫자로 보는 키노야','brand-story':'브랜드 이야기',noodle:'키노야의 신념과 경쟁력',proof:'창업안내 전체',system:'운영 시스템',turnover:'회전율',model:'창업비용 · 창업모델',support:'본사 지원',stores:'매장 카드','partner-logos-section':'협력사',people:'사람들','menu-preview':'메뉴소개','faq-preview':'FAQ 전체','news-full':'뉴스','resources-full':'자료실',final:'창업상담',footer:'푸터 · 연락처',floating:'플로팅 상담',bottom:'모바일 하단 메뉴',meta:'검색 · 공유 정보'};
  const MENU_ORDER = ['top','social','numbers','brand-story','noodle','people','proof','system','turnover','support','partner-logos-section','model','stores','menu-preview','faq-preview','news-full','resources-full','final'];
  const own = (o,k) => Object.prototype.hasOwnProperty.call(o,k);
  function resolveLayout(layout, ids) {
    layout = layout && typeof layout === 'object' ? layout : {};
    const mode = layout.mode === 'custom' ? 'custom' : 'menu';
    const requested = mode === 'custom' && Array.isArray(layout.order) ? layout.order : MENU_ORDER;
    return {mode, order:[...new Set([...requested, ...MENU_ORDER, ...ids])].filter(id=>ids.includes(id)), hidden:layout.hidden && typeof layout.hidden === 'object' ? layout.hidden : {}};
  }
  function arrange(sections, order) {
    const main = sections[0]?.parentNode;
    if (!main) return;
    order.forEach((id,index) => {
      const section = sections.find(el=>el.id===id);
      if (section && main.children[index] !== section) main.insertBefore(section, main.children[index] || null);
    });
  }
  function safeURL(value, media) {
    if (!value) return '';
    if (media && /^data:image\/(png|jpeg|webp|gif);base64,/i.test(value)) return value;
    const u = new URL(value, modelRoot);
    if (!(media ? ['http:','https:'] : ['http:','https:','tel:','mailto:']).includes(u.protocol)) throw new Error('허용되지 않는 주소 형식입니다.');
    return value;
  }
  function cleanHTML(doc, value) {
    const t = doc.createElement('template'); t.innerHTML = value;
    t.content.querySelectorAll('*').forEach(el => {
      if (!['BR','B','STRONG','EM','I','U','SPAN'].includes(el.tagName)) { el.replaceWith(doc.createTextNode(el.textContent)); return; }
      Array.from(el.attributes).forEach(a => { if (!(a.name === 'class' && /^(q-icon|arrow)$/.test(a.value))) el.removeAttribute(a.name); });
    });
    return t.innerHTML;
  }
  function build(doc) {
    const fields = [], map = new Map(), groups = [];
    const sections = Array.from(doc.querySelectorAll('main > section'));
    arrange(sections, resolveLayout({}, sections.map(el=>el.id)).order);
    if(doc.querySelector('[data-home-full="franchise/"]'))['system','turnover','support'].forEach(id=>doc.getElementById(id)?.classList.add('home-redundant-section'));
    function add(key, group, label, type, initial, apply) {
      let f = map.get(key);
      if (!f) { f = {key,group,label,type,initial:initial || '',apply:[]}; map.set(key,f); fields.push(f); }
      f.apply.push(apply);
    }
    function path(el, root) {
      const p = [];
      while (el && el !== root) { p.unshift(Array.prototype.indexOf.call(el.parentNode.childNodes,el)); el = el.parentNode; }
      return p.join('_');
    }
    // Add photo slots to all 11 original and repeated store cards, without removing their badges.
    doc.querySelectorAll('.store-slider-track .news-card').forEach((card,i) => {
      const thumb = card.querySelector('.news-thumb'); if (!thumb || thumb.querySelector('img')) return;
      const img = doc.createElement('img'); img.alt = (card.querySelector('.title') || card).textContent.trim() + ' 사진'; img.loading='lazy';
      img.setAttribute('data-cms', 'home.store.' + (i % 11 + 1) + '.photo'); img.setAttribute('data-cms-type','img');
      img.style.cssText='width:100%;height:100%;object-fit:cover;position:absolute;inset:0;visibility:hidden;';
      thumb.prepend(img);
    });
    // Add photo slots to all regional store cards (#store-1 ~ #store-45) in 서울 지역 & 전국 각지.
    doc.querySelectorAll('.store-card[id*="store-"]').forEach(card => {
      const m = card.id.match(/store-(\d+)$/);
      const thumb = card.querySelector('.store-thumb');
      if (!m || !thumb) return;
      const num = m[1];
      const nameEl = card.querySelector('[data-cms="store.' + num + '.name"]') || card.querySelector('h3');
      const labelName = (nameEl ? nameEl.textContent : ('매장 ' + num)).replace(/\s*→\s*$/,'').trim();
      let img = thumb.querySelector('img');
      if (!img) {
        img = doc.createElement('img');
        img.className = 'store-cms-photo';
        img.alt = labelName + ' 사진';
        img.loading = 'lazy';
        img.hidden = true;
        thumb.prepend(img);
      }
      img.setAttribute('data-cms', 'store.' + num + '.photo');
      img.setAttribute('data-cms-type', 'img');
      img.setAttribute('data-cms-label', labelName + ' 매장 사진');
      const telEl = card.querySelector('.store-actions a[href^="tel:"]');
      if (telEl) telEl.setAttribute('data-cms-tel', 'store.' + num + '.phone');
      const actions = card.querySelector('.store-actions');
      if (actions) {
        const q = encodeURIComponent(labelName);
        Array.from(actions.querySelectorAll('a')).forEach(a => {
          const h = a.getAttribute('href') || '';
          if (/google\.com\/maps/i.test(h)) {
            a.dataset.mapType = 'google';
            a.dataset.cmsHref = 'store.' + num + '.google_map_url';
            a.setAttribute('data-cms-label', labelName + ' 구글맵');
          } else if (/naver\.com|naver\.me/i.test(h)) {
            a.dataset.mapType = 'naver';
            a.dataset.cmsHref = 'store.' + num + '.naver_map_url';
            a.setAttribute('data-cms-label', labelName + ' 네이버맵');
          } else if (!/^tel:/i.test(h) && !/kakao\.com|tmap\.life/i.test(h)) {
            a.dataset.cmsHref = 'store.' + num + '.detail_url';
            a.setAttribute('data-cms-label', labelName + ' 상세페이지');
          }
        });
        if (!actions.querySelector('[data-map-type="kakao"]')) {
          const kBtn = doc.createElement('a');
          kBtn.href = 'https://map.kakao.com/link/search/' + q;
          kBtn.target = '_blank';
          kBtn.rel = 'noopener';
          kBtn.dataset.mapType = 'kakao';
          kBtn.dataset.cmsHref = 'store.' + num + '.kakao_map_url';
          kBtn.setAttribute('data-cms-label', labelName + ' 카카오맵');
          kBtn.textContent = '🗺 카카오맵';
          actions.append(kBtn);
        }
        if (!actions.querySelector('[data-map-type="tmap"]')) {
          const tBtn = doc.createElement('a');
          tBtn.href = 'https://tmap.life/search?query=' + q;
          tBtn.target = '_blank';
          tBtn.rel = 'noopener';
          tBtn.dataset.mapType = 'tmap';
          tBtn.dataset.cmsHref = 'store.' + num + '.tmap_url';
          tBtn.setAttribute('data-cms-label', labelName + ' 티맵');
          tBtn.textContent = '🧭 티맵';
          actions.append(tBtn);
        }
      }
    });
    const roots = [[doc.head,'meta'],[doc.querySelector('body > header'),'header'], ...Array.from(doc.querySelectorAll('main > section')).map(el=>[el,el.id]), [doc.querySelector('footer'),'footer'], [doc.querySelector('.floating-cta'),'floating'],[doc.querySelector('.mobile-bottom-nav'),'bottom']];
    roots.forEach(([root,g]) => {
      if (!root || root.classList.contains('home-redundant-section')) return;
      groups.push({id:g,label:titles[g] || g,section:root.matches('main > section')});
      const keyFor = (el,suffix) => (root.dataset.homeFull?'home.edit.v2.full.':'home.edit.v1.') + g + '.' + path(el,root) + '.' + suffix;
      const caption = el => (el.getAttribute('data-cms-label') || el.getAttribute('alt') || el.textContent || el.tagName).trim().replace(/\s+/g,' ').slice(0,65);
      root.querySelectorAll('[data-cms]').forEach(el => {
        const key=el.dataset.cms, t=el.dataset.cmsType || 'text';
        if (t==='text'||t==='html') add(key,g,caption(el),'html',el.innerHTML,v=>{el.innerHTML=root.dataset.homeFull&&window.HomeFull?HomeFull.sanitize(doc,v,HomeFull.pageBase(root.dataset.homeFull)):cleanHTML(doc,v);});
        if (['img','bg','favicon','meta'].includes(t)) {
          let initial = t==='img' ? el.getAttribute('src') : t==='favicon' ? el.getAttribute('href') : t==='meta' ? el.content : ((el.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)||[])[1] || '');
          const image = t!=='meta' || key.endsWith('.image');
          add(key,g,caption(el),image?'image':'text',initial,v=>{
            if (image) safeURL(v,true);
            if (t==='img') {
              if (window.KinoyaLogo && /^global\.logo\.(header|footer)$/.test(key)) return;
              if(v) {
                const cachedFile = window.__kinoyaGetCachedFileDataUrl ? window.__kinoyaGetCachedFileDataUrl(v) : '';
                const targetVal = cachedFile || v;
                const resolvedNew = targetVal.startsWith('data:') ? targetVal : new URL(targetVal.startsWith('/files/') ? targetVal.slice(1) : targetVal, doc.baseURI || modelRoot).href;
                const resolvedCur = el.getAttribute('src') ? (el.getAttribute('src').startsWith('data:') ? el.getAttribute('src') : new URL(el.getAttribute('src'), doc.baseURI || modelRoot).href) : '';
                if (resolvedCur !== resolvedNew && el.getAttribute('src') !== targetVal) el.src = targetVal;
              } else {
                el.removeAttribute('src');
              }
              if(/^(people\.profile\.\d+\.image|store\.(?:\d+|gallery\.\d+)\.photo)$/.test(key)) el.hidden=!v;
              el.style.visibility=v?'visible':'hidden';
              el.classList.add('cms-revealed');
            }
            if (t==='bg') {
              const cachedBg = v && window.__kinoyaGetCachedFileDataUrl ? window.__kinoyaGetCachedFileDataUrl(v) : '';
              const bgVal = cachedBg || v;
              el.style.backgroundImage=bgVal ? (el.dataset.cmsBgTemplate || 'url("__IMG__")').replace('__IMG__',bgVal.replace(/["'\\\n\r]/g,encodeURIComponent)) : 'none';
              if (/^menu\.(?:item\d+|catalog\.[a-z0-9_-]+\.[a-z0-9_-]+|food\.\d+)\.bg$/i.test(key)) el.classList.toggle('has-menu-photo', !!bgVal);
            }
            if (t==='favicon') {if(v) el.href=v; else el.removeAttribute('href');}
            if (t==='meta') el.content=v;
          });
        }
      });
      if(g==='meta') {
        const title=doc.querySelector('title'), description=doc.querySelector('meta[name="description"]');
        if(title) add('home.seo.title',g,'브라우저 · 검색 제목','text',title.textContent,v=>title.textContent=v);
        if(description) add('home.seo.description',g,'검색 설명','text',description.content,v=>description.content=v);
        return;
      }
      const walker=doc.createTreeWalker(root,4); let n;
      while((n=walker.nextNode())) {
        const el=n.parentElement;
        if(!n.textContent.trim() || el.closest('script,style,[aria-hidden="true"],#social-stats,.nav-mobile-panel')) continue;
        if(el.closest('[data-cms]:not([data-cms-type="bg"]):not([data-cms-type="img"])')) continue;
        const node=n;
        add(keyFor(n,'text'),g,n.textContent.trim().slice(0,65),'text',n.textContent.trim(),v=>{node.textContent=v;});
      }
      root.querySelectorAll('a[href]').forEach(el=>{
        if(el.closest('[aria-hidden="true"],.nav-mobile-panel')) return;
        const sns={naver_map:'navermap',google_map:'googlemap',kakao_map:'kakaomap',youtube:'youtube',blog:'blog',instagram:'instagram',threads:'threads',facebook:'facebook',kakao_channel:'kakaochannel',kakao_story:'kakaostory',tmap:'tmap'};
        const shared=el.matches('.footer-sns-item') && sns[el.dataset.label];
        const customKey=el.dataset.cmsHref || (shared?'social.sns.'+shared:keyFor(el,'href'));
        const initHref=el.getAttribute('href')==='# '?'':(el.getAttribute('href')==='#'?'':el.getAttribute('href'));
        add(customKey,g,caption(el)+' — 링크','url',initHref,v=>{
          const trimmed=String(v==null?'':v).trim();
          if(!trimmed || trimmed==='#'){
            if(el.matches('.footer-sns-item')){el.removeAttribute('href');el.classList.add('is-placeholder');el.style.display='none';}
            return;
          }
          el.setAttribute('href',safeURL(trimmed,false));
          if(el.matches('.footer-sns-item')){el.classList.remove('is-placeholder');el.style.display='';}
        });
      });
      root.querySelectorAll('video').forEach(el=>{
        const source=el.querySelector('source'),cmsKey=el.dataset.cms;
        if(cmsKey){
          add(cmsKey,g,caption(el)||'영상 주소 (MP4 직접 URL)','video',source ? source.getAttribute('src') : el.getAttribute('src'),v=>{safeURL(v,true); if(source) source.removeAttribute('src'); if(v){el.src=v;el.hidden=false;} else {el.removeAttribute('src');el.hidden=true;} el.load(); if(v&&el.hasAttribute('autoplay')){el.muted=true;el.loop=true;const p=el.play();if(p&&p.catch)p.catch(()=>{});}});
          return;
        }
        add('home.hero.video',g,'배경 영상 주소 (MP4 직접 URL)','video',source ? source.getAttribute('src') : el.getAttribute('src'),v=>{safeURL(v,true); if(source) source.removeAttribute('src'); if(v) el.src=v; else el.removeAttribute('src'); el.load();});
        add('home.hero.poster',g,'영상 로딩 중 배경 사진','image',el.getAttribute('poster'),v=>{safeURL(v,true); if(v) el.poster=v; else el.removeAttribute('poster');});
      });
    });
    function apply(rows) {
      fields.forEach(f=>{
        const row=rows[f.key]; if(!row || row.value==null) return;
        try{ f.apply.forEach(fn=>fn(String(row.value))); }catch(e){console.warn('[home CMS]',f.key,e.message);}
      });
      doc.querySelectorAll('[data-cms-tel]').forEach(el=>{
        const key=el.getAttribute('data-cms-tel');
        if(rows[key]&&rows[key].value){
          const clean=String(rows[key].value).replace(/[^0-9+-]/g,'');
          if(clean)el.setAttribute('href','tel:'+clean);
        }
      });
      let layout; try {layout=JSON.parse(rows['home.layout.v1']?.value || '{}');} catch(e){layout={};}
      const resolved=resolveLayout(layout, sections.map(el=>el.id));
      arrange(sections, resolved.order);
      sections.forEach(el=>el.classList.toggle('home-section-hidden',!!resolved.hidden[el.id]));
      // Synchronize marquee duplicate cards after edits, preserving their accessibility exclusion.
      const cards=doc.querySelectorAll('.store-slider-track .news-card');
      for(let i=11;i<cards.length;i++){cards[i].innerHTML=cards[i%11].innerHTML;cards[i].setAttribute('href',cards[i%11].getAttribute('href'));}
      if(window.HomeFull)HomeFull.rewriteLinks(doc);
      doc.querySelectorAll('[data-cms="noodle.techcard.1"]').forEach(el=>{
        if(/키노야\s*자체\s*제면공장/.test(el.textContent||'')){
          el.innerHTML='자가제면 방식 그대로,<br>매일 반죽부터 숙성까지.';
        }
      });
      if(window.__kinoyaHydrateFiles)window.__kinoyaHydrateFiles();
    }
    return {fields,groups,apply};
  }
  function byKey(rows) {
    const map=Object.create(null);
    rows.filter(r=>!r.deleted).forEach(r=>{if(!r.key)return;const old=map[r.key];if(!old || (Date.parse(r.updated_at)||Number(r.updated_at)||0)>=(Date.parse(old.updated_at)||Number(old.updated_at)||0))map[r.key]=r;});
    return map;
  }
  async function fetchRows() {
    if (window.KinoyaRuntime) return byKey(await KinoyaRuntime.all('site_content'));
    let all=[],page=1;
    while(true){const res=await fetch(new URL('tables/site_content?limit=100&page='+page+'&_='+Date.now(), modelRoot).href,{cache:'no-store'});if(!res.ok)throw new Error('콘텐츠 조회 실패: HTTP '+res.status);const j=await res.json();if(!Array.isArray(j.data))throw new Error('콘텐츠 응답 형식 오류');all.push(...j.data);if(all.length>=j.total || j.data.length<100)break;if(++page>100)throw new Error('데이터가 너무 많습니다.');}
    return byKey(all);
  }
  window.HomeModel={build,byKey,fetchRows,safeURL,cleanHTML,own,resolveLayout};
})();
