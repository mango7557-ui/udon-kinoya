/* Navigation and accessibility enhancements, with no content writes. */
(function(){
  function init(){
    const nav=document.getElementById('group-nav');
    if(nav&&!document.getElementById('studio-search')){
      const box=document.createElement('div');box.className='studio-search';
      box.innerHTML='<label for="studio-search">관리 메뉴 빠른 검색</label><input id="studio-search" type="search" autocomplete="off" placeholder="메뉴, 매장, 상담, 로고…"><ul aria-label="검색 결과"></ul><p role="status"></p>';
      nav.before(box);const input=box.querySelector('input'),list=box.querySelector('ul'),status=box.querySelector('p');
      input.addEventListener('input',()=>{list.replaceChildren();const q=input.value.trim();if(!q){status.textContent='';return;}
        const api=window.KinoyaAdminNavigation;
        const matches=(api?.items||[]).filter(item=>item.label.includes(q)).sort((a,b)=>Number(b.title.includes(q))-Number(a.title.includes(q)));
        matches.forEach(item=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.textContent=item.label;b.onclick=()=>{api.open(item.category,item.id);input.value='';list.replaceChildren();status.textContent='';document.getElementById('admin-category-hub')?.scrollIntoView({block:'start'});};li.append(b);list.append(li);});status.textContent=matches.length+'개 메뉴';
      });
    }
    document.querySelectorAll('.studio-shortcuts a[href^="#"]').forEach(link=>{
      link.addEventListener('click',e=>{
        const id=decodeURIComponent(link.getAttribute('href').slice(1));
        if(window.KinoyaAdminNavigation?.openTarget?.(id)){
          e.preventDefault();
          history.replaceState(null,'','#'+id);
        }
      });
    });
    document.querySelectorAll('[role="tablist"]').forEach(list=>{
      list.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;const tabs=[...list.querySelectorAll('[role="tab"]')],i=tabs.indexOf(document.activeElement);if(i<0)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();list.querySelectorAll('[role="tab"]')[next]?.focus();});
    });
    // Reflect actual unsaved edits without interfering with existing save handlers.
    const save=document.getElementById('save-all-btn'),fields=document.getElementById('fields-container');
    if(save&&fields){const badge=document.createElement('span');badge.setAttribute('role','status');badge.style.cssText='font-size:12px;color:#795e3e;margin-right:12px';save.before(badge);const update=()=>{const count=fields.querySelectorAll('[data-dirty]').length;badge.textContent=count?'미저장 '+count+'개':'';};new MutationObserver(update).observe(fields,{attributes:true,subtree:true,attributeFilter:['data-dirty']});update();}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
