/* Rebuild only the two franchise case showcases, preserving existing CMS nodes. */
(function(){
 'use strict';
 const root=new URL('../',document.currentScript.src);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const img=(path,alt)=>{const e=document.createElement('img');e.src=new URL(path,root).href;e.alt=alt;e.draggable=false;return e;};
 function compare(name,index,original){
  const box=document.createElement('div');box.className='rc-compare';box.tabIndex=0;box.setAttribute('role','slider');box.setAttribute('aria-label',name+' 리뉴얼 전후 사진 비교');box.setAttribute('aria-valuemin','0');box.setAttribute('aria-valuemax','100');box.setAttribute('aria-valuenow','50');
  const after=document.createElement('div'),before=document.createElement('div');after.className='rc-image rc-after';before.className='rc-image rc-before';
  before.append(img('images/renewal-case'+(index+1)+'-before.png',name+' 리뉴얼 전'));
  after.append(img('images/renewal-case'+(index+1)+'-after.png',name+' 리뉴얼 후'));
  box.append(after,before);box.insertAdjacentHTML('beforeend','<span class="rc-tag rc-tag-before">BEFORE</span><span class="rc-tag rc-tag-after">AFTER · KINOYA</span><span class="rc-handle" aria-hidden="true"><span class="rc-knob">‹ &nbsp; ›</span></span><span class="rc-hint">좌우로 드래그해 비교해보세요</span>');
  let dragging=false,pos=50;
  const set=p=>{pos=Math.max(0,Math.min(100,p));box.style.setProperty('--pos',pos+'%');box.setAttribute('aria-valuenow',Math.round(pos));box.querySelector('.rc-tag-before').style.opacity=pos<14?'0':'1';box.querySelector('.rc-tag-after').style.opacity=pos>80?'0':'1';};
  const from=e=>{const r=box.getBoundingClientRect();if(r.width)set((e.clientX-r.left)*100/r.width);};
  box.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;box.classList.add('touched');box.setPointerCapture(e.pointerId);from(e);});
  box.addEventListener('pointermove',e=>{if(dragging)from(e);});
  ['pointerup','pointercancel','lostpointercapture'].forEach(t=>box.addEventListener(t,()=>{dragging=false;}));
  box.addEventListener('keydown',e=>{let p=pos;if(e.key==='ArrowLeft'||e.key==='ArrowDown')p-=5;else if(e.key==='ArrowRight'||e.key==='ArrowUp')p+=5;else if(e.key==='Home')p=0;else if(e.key==='End')p=100;else return;e.preventDefault();box.classList.add('touched');set(p);});
  if(!reduced&&'IntersectionObserver'in window){const obs=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;obs.disconnect();setTimeout(()=>{if(box.classList.contains('touched'))return;let start;const step=t=>{if(box.classList.contains('touched'))return;if(!start)start=t;const k=Math.min(1,(t-start)/1800);set(50+Math.sin(k*Math.PI*2)*22*(1-k));if(k<1)requestAnimationFrame(step);};requestAnimationFrame(step);},500);}),{threshold:.25});obs.observe(box);}
  return box;
 }
 function setup(){
  const ba=document.querySelector('#before-after, #home-page-proof-before-after');const conv=document.querySelector('#conversion-cases, #home-page-proof-conversion-cases');if(!ba||!conv||ba.dataset.renewalReady)return;ba.dataset.renewalReady='true';
  ba.classList.add('rc-renewal');conv.classList.add('rc-conversion');
  const baEyebrow=ba.querySelector('.fr-ba-head .eyebrow');
  if(baEyebrow)baEyebrow.textContent='Before & After · 리뉴얼 사례';
  const list=ba.querySelector('.fr-ba-list');if(!list)return;
  const rows=[...list.querySelectorAll('.fr-ba-card')];const scopes=['홀 + 다찌 리뉴얼','홀 + 주방 리뉴얼','홀 + 1인 닷지 설치'];
  const canonicalNames=['[건대점]','[일산차병원점]','[중앙대점]'];
  rows.forEach((old,i)=>{
   const name=old.querySelector('[data-cms$=".name"]'),spec=old.querySelector('[data-cms$=".spec"]');if(!name||!spec)return;
   if(canonicalNames[i] && ((i===0 && name.textContent.includes('중앙대')) || (i===2 && name.textContent.includes('건대')))) {
    name.textContent=canonicalNames[i];
   }
   const label=name.textContent.trim().replace(/[\[\]]/g,'');const row=document.createElement('article');row.className='rc-row';const comp=compare(label,i,old);
   const info=document.createElement('div');info.className='rc-info';info.innerHTML='<div class="rc-number">0'+(i+1)+'</div><div class="rc-case">Renewal Case 0'+(i+1)+'</div>';info.append(name);const desc=document.createElement('p');desc.className='rc-desc';desc.textContent='기존 매장을 활용한 우동키노야 리뉴얼 사례입니다.';info.append(desc);
   const dl=document.createElement('dl');dl.innerHTML='<div><dt>공사 범위</dt><dd>'+scopes[i]+'</dd></div><div><dt>창업 사례</dt><dd class="rc-spec"></dd></div>';dl.querySelector('.rc-spec').append(spec);info.append(dl);
   // Keep each prior combined-image CMS binding available without replacing its saved value.
   const legacy=old.querySelector('.ba-img-crop.is-before img');if(legacy){const details=document.createElement('details');details.className='rc-source';details.innerHTML='<summary>기존 전후 비교 이미지 보기</summary>';details.append(legacy);info.append(details);}
   row.append(comp,info);old.replaceWith(row);
  });
  const note=document.createElement('p');note.className='verify-note rc-note';note.textContent='※ 창업비용은 각 매장의 실제 오픈 사례이며, 점포 스펙·평수·별도공사 여부에 따라 달라질 수 있습니다. (점포비 별도)';list.after(note);
  conv.querySelectorAll('.fr-conversion-card').forEach((card,i)=>{
   const top=card.querySelector('.conv-card-top'),pair=card.querySelector('.conv-photo-pair'),body=card.querySelector('.conv-card-body');if(!top||!pair||!body)return;
   const growth=body.querySelector('[data-cms$=".growth"]');const bars=document.createElement('div');bars.className='rc-bars';const vals=i===0?[4000,9500]:[1900,8000];
   vals.forEach((v,n)=>{const bar=document.createElement('div');bar.className='rc-bar'+(n?' is-after':'');bar.innerHTML='<div class="rc-bar-label"><span>'+(n?'우동키노야':'변경 전')+' · 월매출</span><strong>'+v.toLocaleString('ko-KR')+'만원</strong></div><div class="rc-track"><span style="--bar:'+v/100+'%"></span></div>';bars.append(bar);});
   body.replaceChildren(bars);const multiple=document.createElement('div');multiple.className='rc-mult';if(growth)multiple.append(growth);body.append(multiple);
   if('IntersectionObserver'in window&&!reduced){const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){card.classList.add('rc-visible');observer.disconnect();}}),{threshold:.2});observer.observe(card);}else card.classList.add('rc-visible');
  });
 }
 if(window.homeContentReady)Promise.resolve(window.homeContentReady).then(setup).catch(setup);else if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
