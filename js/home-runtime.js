/* Home CMS and full-page composition share one readiness promise. */
(function(){
 if(!window.HomeModel)return;
 window.homeCmsManaged=true;
 const initialHash=location.hash;let interacted=false;
 ['pointerdown','wheel','touchstart','keydown'].forEach(type=>window.addEventListener(type,()=>{interacted=true;},{once:true,passive:true}));
 document.documentElement.classList.add('home-cms-pending');
 const style=document.createElement('style');
 style.textContent='.home-section-hidden{display:none!important}.home-cms-pending [data-cms-type="img"]:not([data-cms="global.logo.header"]):not([data-cms="global.logo.footer"]),.home-cms-pending [data-cms-type="bg"]{visibility:hidden!important;animation:none!important}';document.head.append(style);
 let contentRows={};
 try{
  localStorage.removeItem('cms_cache');
  const cached=localStorage.getItem('cms_cache_v2');
  if(cached){const parsed=JSON.parse(cached);if(parsed&&typeof parsed==='object')contentRows=parsed;}
 }catch(e){}
 // Fast photo reveal failsafe: never keep photos hidden for more than 280ms on slow networks
 const fastRevealTimer=setTimeout(()=>{
  document.querySelectorAll('[data-cms-type="img"],[data-cms-type="bg"]').forEach(el=>el.classList.add('cms-revealed'));
  document.documentElement.classList.remove('home-cms-pending');
 },280);
 const data=HomeModel.fetchRows().catch(error=>{console.warn('[home CMS]',error.message);return {};});
 window.homeContentReady=(async()=>{
  try{
   if(window.HomeFull)await HomeFull.prepare(document);
   const model=HomeModel.build(document);
   if(Object.keys(contentRows).length){
    model.apply(contentRows);
    document.querySelectorAll('[data-cms-type="img"],[data-cms-type="bg"]').forEach(el=>el.classList.add('cms-revealed'));
    document.documentElement.classList.remove('home-cms-pending');
   }
   // Existing path-based CMS bindings now point to their original nodes; move the nodes only afterward.
   window.NoodleOrder?.arrange(document);
   const rows=await data;model.apply(rows);contentRows=rows;
   try{localStorage.setItem('cms_cache_v2',JSON.stringify(rows));}catch(e){}
   if(window.MenuPhotos)MenuPhotos.accept(rows);
   if(window.HomeStoreRows){if(HomeStoreRows.configure)HomeStoreRows.configure(rows);HomeStoreRows.start(document);}
   if(rows&&rows['news.autoslide.seconds']&&rows['news.autoslide.seconds'].value){
    const ns=Number(rows['news.autoslide.seconds'].value);
    if(Number.isFinite(ns)&&ns>=0.5&&ns<=120)document.documentElement.dataset.newsSlideSeconds=String(ns);
   }
   if(window.KinoyaLogo)window.KinoyaLogo.accept(rows);else window.__kinoyaLogoRows=rows;
   if(window.HomeFull){HomeFull.rewriteLinks(document);await HomeFull.collections(document);}
  }catch(error){console.warn('[home content]',error.message);}
  finally{
   window.NoodleOrder?.arrange(document);
   clearTimeout(fastRevealTimer);
   document.querySelectorAll('[data-cms-type="img"],[data-cms-type="bg"]').forEach(el=>el.classList.add('cms-revealed'));
   document.documentElement.classList.remove('home-cms-pending');
   document.documentElement.dataset.homeAllReady='true';
   document.dispatchEvent(new CustomEvent('home-cms-loaded',{detail:{rows:contentRows}}));
   if(initialHash&&location.hash===initialHash&&!interacted){
    try{const target=document.getElementById(decodeURIComponent(initialHash.slice(1)));if(target)Promise.resolve(document.fonts?.ready).then(()=>requestAnimationFrame(()=>{if(!interacted&&location.hash===initialHash)target.scrollIntoView({behavior:'instant',block:'start'});}));}catch(e){}
   }
  }
 })();
})();
