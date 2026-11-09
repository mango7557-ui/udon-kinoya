/* Reorder only after the home CMS has captured its original DOM-path bindings,
 * and apply the latest flour-mixing, noodle-texture, and one-pack photos directly by replacing any stale cached image attributes. */
(function(){
 'use strict';
 const script=document.currentScript;
 const rootUrl=new URL('../',script?script.src:location.href);
 function mixingPhoto(doc){
  const mixingUrl=new URL('images/noodle-flour-mixing.png',rootUrl).href;
  const textureUrl=new URL('images/udon-noodle-texture.jpg',rootUrl).href;
  const packedUrl=new URL('images/noodle-packed-udon.png',rootUrl).href;
  try{
   localStorage.removeItem('cms_cache');
   localStorage.removeItem('cms_cache_v2');
  }catch(e){}
  doc.querySelectorAll('[data-cms="noodle.techcard.1"]').forEach(el=>{
   if(/키노야\s*자체\s*제면공장/.test(el.textContent||'')){
    el.innerHTML='자가제면 방식 그대로,<br>매일 반죽부터 숙성까지.';
   }
  });
  doc.querySelectorAll('[data-cms="noodle.aging.img"]').forEach(cmsImg=>{
   const visual=cmsImg.closest('.miracle-visual');
   if(!visual)return;
   visual.style.backgroundImage='linear-gradient(180deg, rgba(15,20,28,0.05), rgba(15,20,28,0.4))';
   let display=visual.querySelector('img[data-aging-display]');
   if(!display){
    display=doc.createElement('img');
    display.setAttribute('data-aging-display','true');
    display.alt=cmsImg.alt || '우동키노야 자체 제면공장 밀가루 배합 공정';
    display.loading='lazy';
    display.width=cmsImg.width || 1024;
    display.height=cmsImg.height || 1024;
    display.style.cssText='width:100%;height:100%;object-fit:cover;position:absolute;inset:0;z-index:0;';
    visual.prepend(display);
   }
   display.src=mixingUrl;
   cmsImg.setAttribute('src',mixingUrl);
   cmsImg.hidden=true;
   cmsImg.style.display='none';
   const miracle=visual.closest('.miracle');
   const body=miracle && miracle.querySelector('.miracle-body');
   if(miracle && body && miracle.firstElementChild===visual)miracle.append(visual);
  });
  [
   ['[data-cms="noodle.techcard.1.bg"]',textureUrl,'rgba(15,20,28,0.55)','rgba(15,20,28,0.85)'],
   ['[data-cms="noodle.techcard.2.bg"]',packedUrl,'rgba(15,20,28,0.40)','rgba(15,20,28,0.82)']
  ].forEach(([selector,url,topShade,bottomShade])=>{
   doc.querySelectorAll(selector).forEach(card=>{
    card.removeAttribute('data-cms-stored-bg');
    card.style.backgroundImage='linear-gradient(180deg, '+topShade+', '+bottomShade+'), url("'+url+'")';
    card.classList.add('cms-revealed');
   });
  });
 }
 function arrange(doc){
  const home=doc.getElementById('noodle');
  const root=home || doc.querySelector('main');
  if(!root)return;
  const full=home && home.dataset.homeFull;
  const qna=doc.getElementById(home?(full?'home-page-noodle-qna':'home-noodle-qna'):'qna');
  const numbers=doc.getElementById(home?(full?'home-page-noodle-numbers':'home-noodle-numbers'):'numbers');
  const links=root.querySelector('.section-jump-links');
  if(links && !links.dataset.noodleOrdered && links.children.length===4){
   links.append(links.children[0]);
   links.dataset.noodleOrdered='true';
  }
  if(qna && numbers && qna.parentNode===numbers.parentNode){
   const alias=full && doc.getElementById('home-noodle-qna');
   if(alias && alias.classList.contains('home-anchor-alias'))numbers.after(alias,qna);
   else numbers.after(qna);
  }
  mixingPhoto(doc);
 }
 window.NoodleOrder={arrange,mixingPhoto};
 // The individual page is not built by HomeModel; leave home to home-runtime.
 if((!document.getElementById('noodle') && document.getElementById('qna')) || (document.getElementById('noodle') && !window.HomeModel)){
  arrange(document);
  document.addEventListener('kinoya:cms-ready',()=>mixingPhoto(document));
 }
})();
