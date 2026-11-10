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
  }
  const ready=()=>Promise.resolve(window.homeContentReady).then(enhance);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
