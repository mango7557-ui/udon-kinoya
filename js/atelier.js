/* Progressive navigation; never moves or rewrites CMS-bound content. */
(function () {
  'use strict';
  function enhance() {
    if (document.querySelector('.atelier-tools') || !document.querySelector('main')) return;
    const sections = [...document.querySelectorAll('main > section[id]')].filter(el => el.getClientRects().length && getComputedStyle(el).display !== 'none');
    const tools = document.createElement('div'); tools.className = 'atelier-tools';
    const top = document.createElement('button'); top.type = 'button'; top.textContent = '↑'; top.setAttribute('aria-label', '맨 위로 이동');
    top.onclick = () => window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    if (sections.length > 3) {
      const dialog = document.createElement('dialog'); dialog.className = 'atelier-index'; dialog.setAttribute('aria-label','섹션 바로가기');
      const header = document.createElement('header'), title = document.createElement('h2'), close = document.createElement('button');
      title.textContent = '섹션 바로가기'; close.textContent = '×'; close.type='button'; close.setAttribute('aria-label','바로가기 닫기'); close.onclick=()=>dialog.close();
      header.append(title,close); const links = document.createElement('nav'); links.setAttribute('aria-label','페이지 섹션');
      const names={'top':'우동키노야','social':'소셜미디어','numbers':'숫자로 보는 우동키노야','brand-story':'브랜드스토리','noodle':'키노야의 신념과 경쟁력','people':'우동키노야 사람들','proof':'창업안내','model':'창업비용','stores':'우리동네 키노야','menu-preview':'메뉴소개','faq-preview':'FAQ','news-full':'뉴스','resources-full':'자료실','final':'상담 · 문의'};
      sections.forEach((section,i)=>{const a=document.createElement('a'),n=document.createElement('small');a.href='#'+section.id;n.textContent=String(i+1).padStart(2,'0');a.append(n,document.createTextNode(names[section.id]||section.querySelector('h2,h3')?.textContent.trim()||section.id));a.onclick=()=>dialog.close();links.append(a);});
      dialog.append(header,links); document.body.append(dialog);
      const trigger=document.createElement('button');trigger.type='button';trigger.className='atelier-index-trigger';trigger.textContent='목차 +';trigger.setAttribute('aria-haspopup','dialog');trigger.onclick=()=>dialog.showModal();tools.append(trigger);
      dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
    }
    tools.append(top); document.body.append(tools);
    document.querySelectorAll('table').forEach(table=>{if(!table.getAttribute('aria-label')){const heading=table.closest('section,article,.cost-concept-block')?.querySelector('h2,h3,h4');if(heading)table.setAttribute('aria-label',heading.textContent.trim());}});
    // The former decorative social tabs now move to real destinations.
    const tabs=document.querySelectorAll('#social-channel-tabs button');
    tabs.forEach((button,i)=>{button.type='button';button.addEventListener('click',()=>{
      const destination=i===0?document.getElementById('shorts-section'):i===1?document.getElementById('videos-section'):null;
      if(destination?.getClientRects().length){destination.scrollIntoView({behavior:'smooth',block:'start'});}
      else {const link=document.querySelector(i===2?'.footer-sns-item[data-label="instagram"]':i===3?'.footer-sns-item[data-label="tiktok"]':'.btn-youtube');if(link?.href&&link.getAttribute('href')!=='#'){window.open(link.href,'_blank','noopener,noreferrer');}else{let status=document.getElementById('atelier-social-status');if(!status){status=document.createElement('p');status.id='atelier-social-status';status.setAttribute('role','status');button.closest('.social-tabs').after(status);}status.textContent='이 채널은 아직 등록되지 않았습니다.';}}
      tabs.forEach(t=>t.classList.toggle('active',t===button));
    });});

    // Smooth count-up for hero facts and key numeric cards on viewport entry
    const countElement = el => {
      const targetText = (el.dataset.countTarget || el.textContent || '').trim();
      if (!targetText) return;
      el.dataset.countTarget = targetText;
      const m = targetText.match(/^([^0-9]*)([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/);
      if (!m) return;
      const prefix = m[1] || '', numStr = m[2], suffix = m[3] || '';
      const hasComma = numStr.includes(','), dotIdx = numStr.indexOf('.');
      const decimals = dotIdx !== -1 ? (numStr.length - dotIdx - 1) : 0;
      const target = parseFloat(numStr.replace(/,/g, ''));
      if (!Number.isFinite(target) || target <= 0) return;
      if (el._atelierCountRaf) cancelAnimationFrame(el._atelierCountRaf);
      const start = performance.now(), dur = 1600;
      const fmt = v => {
        let fixed = decimals > 0 ? v.toFixed(decimals) : String(Math.round(v));
        if (hasComma) { const p = fixed.split('.'); p[0] = Number(p[0]).toLocaleString('ko-KR'); fixed = p.join('.'); }
        return prefix + fixed + suffix;
      };
      el.textContent = fmt(0);
      const tick = now => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 4);
        if (t < 1) { el.textContent = fmt(target * eased); el._atelierCountRaf = requestAnimationFrame(tick); }
        else { el.textContent = targetText; el._atelierCountRaf = null; }
      };
      el._atelierCountRaf = requestAnimationFrame(tick);
    };
    const countTargets = document.querySelectorAll('.hero-facts strong, .num-value');
    if ('IntersectionObserver' in window && countTargets.length) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) countElement(entry.target); });
      }, { threshold: 0.3 });
      countTargets.forEach(el => io.observe(el));
    }
    document.querySelectorAll('.hero-facts > div, .number-card').forEach(box => {
      box.addEventListener('mouseenter', () => {
        const num = box.querySelector('strong, .num-value');
        if (num) countElement(num);
      });
    });

    // Pointer-responsive layer across all sections, cards, and primary CTAs (desktop fine pointer only)
    if (matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const sectionSelector = 'main > section, .home-full-section > .section, .page-header, .footer';
      const cardSelector = '.stat-item, .number-card, .tech-card, .model-card, .store-card, .menu-catalog-card, .video-card, .people-profile-card, .news-list-card, .resource-item, .faq-item, .final-card, .fr-cost-guide-card, .cost-concept-block, .fr-conversion-card, .fr-compact-bar-card, .pos-proof-card, .discovery-link';
      const magnetSelector = '.btn-primary, .btn-ghost, .nav-cta, .btn-youtube, .btn-more-videos, .form-submit';

      let activeSec = null, activeCard = null, activeBtn = null, rafId = 0, lastEvent = null;

      const clearCard = card => {
        if (!card) return;
        card.style.setProperty('--card-spot-alpha', '0');
        card.style.setProperty('--ptr-tx', '0px');
      };
      const clearBtn = btn => {
        if (!btn) return;
        btn.style.setProperty('--btn-tx', '0px');
      };

      const flushPointer = () => {
        rafId = 0;
        const e = lastEvent;
        if (!e) return;
        const target = e.target instanceof Element ? e.target : null;
        if (!target) return;

        const sec = target.closest(sectionSelector);
        if (sec !== activeSec) {
          if (activeSec) activeSec.style.setProperty('--sec-spot-alpha', '0');
          activeSec = sec;
        }
        if (sec) {
          const sr = sec.getBoundingClientRect();
          sec.style.setProperty('--sec-mx', (e.clientX - sr.left).toFixed(1) + 'px');
          sec.style.setProperty('--sec-my', (e.clientY - sr.top).toFixed(1) + 'px');
          sec.style.setProperty('--sec-spot-alpha', '1');
        }

        const card = target.closest(cardSelector);
        if (card !== activeCard) {
          clearCard(activeCard);
          activeCard = card;
        }
        if (card) {
          const cr = card.getBoundingClientRect();
          const relX = e.clientX - cr.left;
          const relY = e.clientY - cr.top;
          const normX = cr.width > 0 ? ((relX / cr.width) - 0.5) : 0;
          card.style.setProperty('--mx', relX.toFixed(1) + 'px');
          card.style.setProperty('--my', relY.toFixed(1) + 'px');
          card.style.setProperty('--card-spot-alpha', '1');
          card.style.setProperty('--ptr-tx', (normX * 3).toFixed(2) + 'px');
        }

        const btn = target.closest(magnetSelector);
        if (btn !== activeBtn) {
          clearBtn(activeBtn);
          activeBtn = btn;
        }
        if (btn) {
          const br = btn.getBoundingClientRect();
          const bx = br.width > 0 ? ((e.clientX - br.left) / br.width - 0.5) : 0;
          btn.style.setProperty('--btn-tx', (bx * 4).toFixed(2) + 'px');
        }
      };

      document.addEventListener('pointermove', e => {
        if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
        lastEvent = e;
        if (!rafId) rafId = requestAnimationFrame(flushPointer);
      }, { passive: true });

      document.addEventListener('pointerleave', () => {
        if (activeSec) activeSec.style.setProperty('--sec-spot-alpha', '0');
        clearCard(activeCard);
        clearBtn(activeBtn);
        activeSec = activeCard = activeBtn = null;
      }, { passive: true });
    }
  }
  const ready=()=>Promise.resolve(window.homeContentReady).then(enhance);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
