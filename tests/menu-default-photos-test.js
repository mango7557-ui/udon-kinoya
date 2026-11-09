(async function(){
 const out=document.getElementById('results'),frame=document.getElementById('menu');
 const wait=async fn=>{for(let i=0;i<400;i++){if(fn())return;await new Promise(r=>setTimeout(r,50));}throw Error('timeout');};
 try{
  const url=new URL('../menu/index.html',location.href),source=await(await fetch(url)).text(),doc=new DOMParser().parseFromString(source,'text/html');
  doc.querySelectorAll('script,link[rel="preload"]').forEach(el=>el.remove());
  const base=doc.createElement('base');base.href=url.href;doc.head.prepend(base);
  const script=doc.createElement('script');script.src=new URL('../js/menu-catalog.js',location.href).href;doc.body.append(script);
  frame.srcdoc=doc.documentElement.outerHTML;await wait(()=>frame.contentWindow?.MenuCatalog);
  const w=frame.contentWindow,d=w.document,photos=w.MenuCatalog.photos,logs=[];
  for(const [key,path] of Object.entries(photos)){
   const el=d.querySelector('[data-cms="menu.catalog.'+key+'.bg"]');if(!el?.style.backgroundImage.includes(path))throw Error('매칭 실패 '+key);
   const img=new w.Image();await new Promise((ok,no)=>{img.onload=ok;img.onerror=no;img.src=new URL('../'+path,location.href).href;});
   if(img.naturalWidth<100)throw Error('파일 손상 '+path);logs.push('PASS '+key+' → '+path);console.log(logs.at(-1));
  }
  if(d.querySelectorAll('.menu-catalog-photo.has-menu-photo').length!==4)throw Error('사진 개수 오류');
  logs.push('PASS 나머지 메뉴에 무관한 사진 사용 없음');
  /* Visual isolation keeps the real category/card DOM and original CSS. */
  d.querySelectorAll('.menu-category').forEach(section=>{if(!section.querySelector('.has-menu-photo'))section.style.display='none';});
  d.querySelectorAll('.menu-catalog-card').forEach(card=>{if(!card.querySelector('.has-menu-photo'))card.style.display='none';});
  const category=d.querySelector('#category-signature');
  const timer=setInterval(()=>w.scrollTo(0,category.getBoundingClientRect().top+w.scrollY-110),150);await new Promise(r=>setTimeout(r,2500));clearInterval(timer);
  out.hidden=true;document.body.dataset.testStatus='passed';console.log('ALL 5 TESTS PASSED');
 }catch(e){out.textContent='FAIL '+e.message;document.body.dataset.testStatus='failed';console.error(e);}
})();
