/* Compose the existing Korean page bodies into the home document.
 * Same-origin static HTML only; scripts from those documents are never executed. */
(function(){
 'use strict';
 const root=new URL('../',document.currentScript.src);
 const pages=[
  {id:'brand-story',path:'brand/',label:'브랜드스토리'},
  {id:'noodle',path:'noodle/',label:'키노야의 신념과 경쟁력'},
  {id:'people',path:'people/',label:'우동키노야 사람들'},
  {id:'proof',path:'franchise/',label:'창업안내'},
  {id:'model',path:'franchise/cost/',label:'창업비용'},
  {id:'stores',path:'store/',label:'우리동네 키노야'},
  {id:'menu-preview',path:'menu/',label:'메뉴소개'},
  {id:'faq-preview',path:'franchise/faq/',label:'FAQ'},
  {id:'news-full',path:'news/',label:'뉴스'},
  {id:'resources-full',path:'resources/',label:'자료실'},
  {id:'final',path:'contact/',label:'창업상담'}
 ];
  const keepIds=new Set(['consult-form','consult-success','partner-contact','partner-contact-form','partner-contact-success','news-grid','news-empty','resources-list','resources-empty']);
 const normalize=p=>p.replace(/\/index\.html$/,'/').replace(/\/+$/,'');
 const pageByPath=new Map(pages.map(p=>[normalize(new URL(p.path,root).pathname),p]));
 const idFor=(page,id)=>keepIds.has(id)?id:'home-page-'+page.id+'-'+id;
 function safeURL(value,base=root,download=false){
  if(!value)return '';
  if(/^data:image\/(png|jpeg|webp|gif);base64,/i.test(value))return value;
  if(download&&/^data:(application\/|text\/plain[;,])/i.test(value))return value;
  try{const u=new URL(value,base);return ['http:','https:','tel:','mailto:'].includes(u.protocol)?u.href:'';}catch(e){return '';}
 }
 function link(value,base){
  const url=safeURL(value,base);if(!url)return '#';
  const u=new URL(url),page=u.origin===root.origin&&pageByPath.get(normalize(u.pathname));
  if(page){
   if(u.hash.startsWith('#cat-')&&page.id==='faq-preview')return u.hash;
   return u.hash?'#'+idFor(page,decodeURIComponent(u.hash.slice(1))):'#'+page.id;
  }
  return url;
 }
 function sanitize(doc,html,base=root){
  const t=doc.createElement('template');t.innerHTML=html;
  t.content.querySelectorAll('script,style,iframe,object,embed,link,meta,base,form,input,button').forEach(el=>el.remove());
  const tags=new Set(['BR','B','STRONG','EM','I','U','SPAN','P','DIV','UL','OL','LI','A','TABLE','THEAD','TBODY','TR','TH','TD','BLOCKQUOTE','H2','H3','H4','IMG']);
  const attrs=new Set(['class','title','href','target','rel','src','alt','width','height','colspan','rowspan']);
  t.content.querySelectorAll('*').forEach(el=>{
   if(!tags.has(el.tagName)){el.replaceWith(...el.childNodes);return;}
   [...el.attributes].forEach(a=>{
    if(!attrs.has(a.name))el.removeAttribute(a.name);
    else if(['href','src'].includes(a.name)){const value=a.name==='href'?link(a.value,base):safeURL(a.value,base);if(value)el.setAttribute(a.name,value);else el.removeAttribute(a.name);}
   });
   if(el.tagName==='A'&&el.target==='_blank')el.rel='noopener noreferrer';
  });return t.innerHTML;
 }
 async function request(url,format='text'){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{const res=await fetch(url,{cache:'no-store',signal:controller.signal});if(!res.ok)throw new Error('HTTP '+res.status);return await res[format]();}finally{clearTimeout(timer);}
 }
 function notice(doc,container,text,url){
  const p=doc.createElement('p');p.className='home-content-notice';p.setAttribute('role','status');p.textContent=text+' ';
  if(url){const a=doc.createElement('a');a.href=url;a.textContent='개별 페이지 보기 ↗';p.append(a);}container.append(p);return p;
 }
 function mount(doc,page,html){
  const parsed=new DOMParser().parseFromString(html,'text/html'),main=parsed.querySelector('main');
  if(!main)throw new Error('본문을 찾을 수 없습니다.');
  const base=new URL(page.path,root),holder=doc.createElement('div');
  [...main.children].forEach(child=>holder.append(doc.importNode(child,true)));
  holder.querySelectorAll('script,style,iframe,object,embed,base,meta,link').forEach(el=>el.remove());
  if(page.id==='menu-preview')window.MenuCatalog?.render(holder);
  holder.querySelectorAll('.breadcrumb').forEach(el=>el.remove());
  if(page.id!=='final')holder.querySelectorAll('.final-cta').forEach(el=>el.remove());
  holder.querySelectorAll('h1').forEach(el=>{const heading=doc.createElement('h2');[...el.attributes].forEach(a=>heading.setAttribute(a.name,a.value));heading.classList.add('h-display');heading.innerHTML=el.innerHTML;el.replaceWith(heading);});
  if(page.id==='stores'){
   holder.querySelectorAll('.store-card[id*="store-"]').forEach(card=>{
    const m=card.id.match(/store-(\d+)$/);if(!m)return;
    const num=m[1],telEl=card.querySelector('.store-actions a[href^="tel:"]');
    if(telEl)telEl.setAttribute('data-cms-tel','store.'+num+'.phone');
   });
  }
  holder.querySelectorAll('[id]').forEach(el=>{el.id=idFor(page,el.id);});
  holder.querySelectorAll('*').forEach(el=>{
   [...el.attributes].forEach(a=>{
    if(a.name.startsWith('on')||a.name==='srcdoc')el.removeAttribute(a.name);
    if(['for','aria-controls','aria-labelledby','aria-describedby'].includes(a.name))el.setAttribute(a.name,a.value.split(/\s+/).map(id=>idFor(page,id)).join(' '));
   });
   if(el.hasAttribute('href'))el.setAttribute('href',link(el.getAttribute('href'),base));
   ['src','poster'].forEach(attr=>{if(el.hasAttribute(attr))el.setAttribute(attr,safeURL(el.getAttribute(attr),base));});
   if(el.hasAttribute('style'))el.setAttribute('style',el.getAttribute('style').replace(/url\((['"]?)(.*?)\1\)/g,(_,quote,path)=>'url("'+safeURL(path,base).replace(/"/g,'%22')+'")'));
   if(el.tagName==='IMG')el.loading=(el.classList.contains('people-profile-portrait')||el.closest('.ba-img-crop,.slot-crop'))?'eager':'lazy';
  });
  let target=doc.getElementById(page.id);
  if(!target){target=doc.createElement('section');target.id=page.id;doc.querySelector('main').append(target);}
  target.className='home-full-section';target.dataset.homeFull=page.path;target.dataset.homeRoute=page.path;
  const heading=holder.querySelector('h2');if(heading){if(!heading.id)heading.id='home-page-'+page.id+'-title';target.setAttribute('aria-labelledby',heading.id);}
  target.replaceChildren(...holder.childNodes);
  target.querySelectorAll('video[autoplay]').forEach(v=>{v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;try{const p=v.play();if(p&&p.catch)p.catch(()=>{});}catch(e){}});
  const legacy=page.id==='noodle'?{'home-noodle-qna':'qna','home-noodle-aging':'aging','home-noodle-tech':'tech','home-noodle-numbers':'numbers'}:page.id==='menu-preview'?{'home-menu-kake':'category-kake','home-menu-bukkake':'category-bukkake'}:{};
  Object.entries(legacy).forEach(([alias,original])=>{const destination=doc.getElementById(idFor(page,original));if(destination){const marker=doc.createElement('span');marker.id=alias;marker.className='home-anchor-alias';marker.setAttribute('aria-hidden','true');destination.before(marker);}});
  if(page.id==='noodle'){const jump=target.querySelector('.section-jump');if(jump)jump.id='home-noodle-links';}
  const standalone=doc.createElement('div');standalone.className='home-standalone-link';
  const anchor=doc.createElement('a');anchor.href=base.href;anchor.target='_blank';anchor.rel='noopener';anchor.textContent=page.label+' 개별 페이지 열기 ↗';anchor.dataset.homeStandalone='true';standalone.append(anchor);target.append(standalone);
  if(page.id==='menu-preview')doc.dispatchEvent(new CustomEvent('home-menu-mounted',{detail:{element:target}}));
  return target;
 }
 function rewriteLinks(doc){
  // Preserve language links and intentional new-tab standalone links.
  doc.querySelectorAll('a[href]:not([data-home-standalone])').forEach(a=>{
   if(a.closest('.lang-switch-group'))return;
   const href=a.getAttribute('href');
   if(href.startsWith('#'))return;
   const rewritten=link(href,root);if(rewritten.startsWith('#'))a.setAttribute('href',rewritten);
  });
 }
 async function prepare(doc,options={}){
  const main=doc.querySelector('main');if(!main)return [];
  const results=await Promise.all(pages.map(async page=>{
   const existing=doc.getElementById(page.id);if(existing?.dataset.homeFull)return {id:page.id,ok:true};
   try{const html=await request(new URL(page.path+'index.html',root));mount(doc,page,html);return {id:page.id,ok:true};}
   catch(error){
    let target=existing;if(!target){target=doc.createElement('section');target.id=page.id;target.className='section sec-off';main.append(target);}
    notice(doc,target,page.label+' 전체 내용을 불러오지 못했습니다. 기존 내용은 유지합니다.',new URL(page.path,root));
    return {id:page.id,ok:false,error:error.message};
   }
  }));
  rewriteLinks(doc);doc.documentElement.dataset.homeContentState=results.every(r=>r.ok)?'ready':'partial';
  return results;
 }
 const rowCounts=Object.create(null);
 async function rows(table){
  if(window.KinoyaRuntime){const all=await KinoyaRuntime.all(table);rowCounts[table]=all.length;return all.filter(r=>r.is_published!==false).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));}
  const result=[];for(let page=1;page<=200;page++){
   const json=await request(new URL('tables/'+table+'?page='+page+'&limit=100',root).href,'json');
   if(!Array.isArray(json.data))throw new Error('응답 형식 오류');result.push(...json.data);
   if(result.length>=json.total||json.data.length<100){rowCounts[table]=result.length;return result.filter(r=>!r.deleted&&r.is_published!==false&&r.is_published!==0&&r.is_published!=='false'&&r.is_published!=='0').sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));}
  }throw new Error('데이터가 너무 많습니다.');
 }
 function element(doc,tag,text,cls){const el=doc.createElement(tag);if(text!=null)el.textContent=text;if(cls)el.className=cls;return el;}
 async function collections(doc){
  await Promise.all([
   (async()=>{
    const host=doc.getElementById('faq-preview'),list=host?.querySelector('.faq-list');if(!list)return;
    try{
     const items=await rows('faq_items');
     if(items.length||rowCounts.faq_items>0){list.replaceChildren();list.classList.add('home-dynamic-content');
      items.forEach((item,i)=>{const wrap=element(doc,'div',null,'faq-item');wrap.dataset.cat=item.category||'brand';const q=element(doc,'button',item.question||'','faq-q'),answer=element(doc,'div',null,'faq-a');q.type='button';answer.id='home-dynamic-faq-'+i;q.setAttribute('aria-controls',answer.id);q.append(element(doc,'span',null,'q-icon'));const inner=element(doc,'div',null,'faq-a-inner');inner.innerHTML=sanitize(doc,item.answer||'',new URL('franchise/faq/',root));answer.append(inner);wrap.append(q,answer);list.append(wrap);});
      const tabs=host.querySelector('.faq-category-tabs');if(tabs){const existing=new Set([...tabs.querySelectorAll('[data-cat]')].map(b=>b.dataset.cat));items.forEach(item=>{const category=item.category||'brand';if(!existing.has(category)){existing.add(category);const b=element(doc,'button',category);b.dataset.cat=category;tabs.append(b);}});}
     }
    }catch(e){notice(doc,host,'저장된 FAQ를 불러오지 못해 기본 FAQ를 표시합니다.',new URL('franchise/faq/',root));}
    list.querySelectorAll('.faq-item').forEach(item=>{item.classList.add('is-open');item.querySelector('.faq-q')?.setAttribute('aria-expanded','true');const a=item.querySelector('.faq-a');if(a)a.style.maxHeight='none';});
   })(),
   (async()=>{
    const grid=doc.getElementById('news-grid'),empty=doc.getElementById('news-empty');if(!grid)return;
    grid.classList.add('home-dynamic-content');
    const secContainer=grid.closest('.container');if(secContainer)secContainer.classList.add('news-section-container');
    const decodeEntities=str=>{const t=doc.createElement('textarea');t.innerHTML=String(str==null?'':str);return t.value;};
    try{const items=await rows('news_items');if(!items.length){empty.style.display='';return;}
     const scrollItems=[];
     for(let i=0;i<10;i++)scrollItems.push(items[i%items.length]);
     scrollItems.forEach((item,idx)=>{
      const detailHref=new URL('news/view/?id='+encodeURIComponent(item.id||''),root).href;
      const card=element(doc,'a',null,'news-list-card');
      card.href=detailHref;
      card.dataset.newsSlideIndex=String(idx);
      const cleanTitle=decodeEntities(item.title||'');
      const cleanExcerpt=decodeEntities(item.excerpt||'');
      const cleanSource=decodeEntities(item.source||'');
      const src=safeURL(item.thumbnail);
      if(src){const media=element(doc,'div',null,'news-list-thumb'),img=element(doc,'img');img.src=src;img.alt=(cleanTitle||'뉴스')+' 사진';img.loading='lazy';media.append(img);card.append(media);}
      const body=element(doc,'div',null,'news-list-body');
      body.append(element(doc,'div',String(item.date||'')+(cleanSource?' · '+cleanSource:''),'news-list-date'),element(doc,'h3',cleanTitle,'news-list-title'));
      if(cleanExcerpt)body.append(element(doc,'p',cleanExcerpt,'news-list-excerpt'));
      const footer=element(doc,'div',null,'news-list-footer');
      const more=element(doc,'span','더보기 →','news-more-btn');
      footer.append(more);
      body.append(footer);
      card.append(body);
      grid.append(card);
     });
     if(grid.dataset.newsAutoScroll!=='ready'){
      grid.dataset.newsAutoScroll='ready';
      const view=doc.defaultView||window;
      let newsSlideSeconds=3;
      const parseSec=(v,fb)=>{const n=Number(v);return Number.isFinite(n)&&n>=0.5&&n<=120?n:fb;};
      const applyNewsConfig=cmsRows=>{
       const raw=cmsRows&&cmsRows['news.autoslide.seconds']?cmsRows['news.autoslide.seconds'].value:undefined;
       if(raw!==undefined&&String(raw).trim()!=='')newsSlideSeconds=parseSec(raw,3);
       if(doc.documentElement)doc.documentElement.dataset.newsSlideSeconds=String(newsSlideSeconds);
      };
      try{
       if(doc.documentElement&&doc.documentElement.dataset.newsSlideSeconds)newsSlideSeconds=parseSec(doc.documentElement.dataset.newsSlideSeconds,3);
       applyNewsConfig(JSON.parse(view.localStorage.getItem('cms_cache')||'{}'));
      }catch(e){}
      ['kinoya:cms-ready','home-cms-loaded'].forEach(ev=>doc.addEventListener(ev,e=>applyNewsConfig(e.detail?.rows||{})));
      let paused=false,hover=false,focus=false,dragging=false,visible=true,holdUntil=0,direction=1,frame=0,lastTime=0,position=0;
      const getStepWidth=()=>{
       const firstCard=grid.querySelector('.news-list-card');
       const gap=parseFloat((view.getComputedStyle&&view.getComputedStyle(grid).gap)||'20')||20;
       return (firstCard?firstCard.getBoundingClientRect().width:260)+gap;
      };
      const cancel=()=>{if(frame)view.cancelAnimationFrame(frame);frame=0;lastTime=0;};
      const allowed=()=>visible&&!doc.hidden&&!paused&&!hover&&!focus&&!dragging&&!grid.classList.contains('is-all-grid');
      const tick=now=>{
       frame=0;if(!allowed()){lastTime=0;return;}
       const elapsed=lastTime?Math.min(60,Math.max(8,now-lastTime)):16;lastTime=now;
       if(now>=holdUntil){
        const max=grid.scrollWidth-grid.clientWidth;
        if(max>0){
         if(Math.abs(grid.scrollLeft-position)>2)position=grid.scrollLeft;
         const curSec=doc.documentElement?.dataset.newsSlideSeconds?parseSec(doc.documentElement.dataset.newsSlideSeconds,newsSlideSeconds):parseSec(newsSlideSeconds,3);
         const pxPerMs=getStepWidth()/(curSec*1000);
         position=Math.max(0,Math.min(max,position+direction*elapsed*pxPerMs));
         grid.scrollLeft=position;
         if(position>=max-1)direction=-1;else if(position<=1)direction=1;
        }
       }else position=grid.scrollLeft;
       frame=view.requestAnimationFrame(tick);
      };
      const sync=()=>{if(allowed()){if(!frame){position=grid.scrollLeft;frame=view.requestAnimationFrame(tick);}}else cancel();};
      const hold=()=>{holdUntil=(view.performance?view.performance.now():Date.now())+4500;position=grid.scrollLeft;};
      grid.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=true;sync();}});
      grid.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){hover=false;sync();}});
      grid.addEventListener('pointerdown',()=>{dragging=true;hold();sync();},{passive:true});
      const release=()=>{if(dragging){dragging=false;hold();sync();}};
      view.addEventListener('pointerup',release,{passive:true});
      view.addEventListener('pointercancel',release,{passive:true});
      grid.addEventListener('wheel',hold,{passive:true});
      grid.addEventListener('focusin',()=>{focus=true;sync();});
      grid.addEventListener('focusout',()=>view.setTimeout(()=>{focus=grid.contains(doc.activeElement);hold();sync();},0));
      if(view.IntersectionObserver){const obs=new view.IntersectionObserver(es=>{if(es&&es[0]){visible=Boolean(es[0].isIntersecting);sync();}},{threshold:0});obs.observe(grid);}
      view.setInterval(()=>{if(allowed()&&!frame)sync();},800);
      sync();
     }
    }catch(e){empty.style.display='';empty.textContent='뉴스를 불러오지 못했습니다. 잠시 후 새로고침해주세요.';}
   })(),
   (async()=>{
    const list=doc.getElementById('resources-list'),empty=doc.getElementById('resources-empty');if(!list)return;
    list.classList.add('home-dynamic-content');
    const fallbackBrochure=[{category:'회사소개서 · 브로슈어',title:'우동키노야 회사소개서 (브로슈어)',description:'우동키노야 브랜드 소개 및 합리적 창업 안내 브로슈어 (PDF · kinoya_company.pdf)',link_type:'url',file_url:'https://www.genspark.ai/api/files/s/Fjz7DCUP',file_name:'kinoya_company.pdf'}];
    try{let items=await rows('resources');if(!items.length)items=fallbackBrochure;empty.style.display='none';
     items.forEach(item=>{const row=element(doc,'article',null,'resource-item'),info=element(doc,'div',null,'resource-info');if(item.category)info.append(element(doc,'div',item.category,'resource-category'));info.append(element(doc,'h3',item.title||'','resource-title'));if(item.description)info.append(element(doc,'p',item.description,'resource-desc'));row.append(info);const file=item.link_type==='file',href=safeURL(item.file_url||(file?item.file_data:''),root,file);if(href){const a=element(doc,'a','다운로드','resource-download');a.href=href;a.download=item.file_name||item.title||'kinoya_company.pdf';if(!file){a.target='_blank';a.rel='noopener';}row.append(a);}list.append(row);});
    }catch(e){empty.style.display='none';fallbackBrochure.forEach(item=>{const row=element(doc,'article',null,'resource-item'),info=element(doc,'div',null,'resource-info');info.append(element(doc,'div',item.category,'resource-category'),element(doc,'h3',item.title,'resource-title'),element(doc,'p',item.description,'resource-desc'));const a=element(doc,'a','다운로드','resource-download');a.href=item.file_url;a.target='_blank';a.rel='noopener';a.download=item.file_name;row.append(info,a);list.append(row);});}
   })(),
   (async()=>{
    const host=doc.getElementById('stores');if(!host)return;
    try{
     const items=await rows('store_items');if(!items.length)return;
     items.forEach(item=>{
      const region=['seoul','gyeonggi','incheon','chungcheong','daegu','busan','jeju'].includes(item.region)?item.region:'seoul';
      const sec=host.querySelector('#home-page-stores-'+region)||host.querySelector(region==='seoul'?'#home-page-stores-seoul':'#home-page-stores-nationwide');
      const list=sec?.querySelector('.store-list');if(!list)return;
      const cardId='store-custom-'+String(item.id||'').replace(/[^a-zA-Z0-9_-]/g,'');
      if(list.querySelector('#'+cardId))return;
      const card=element(doc,'article',null,'store-card');card.id=cardId;
      const thumb=element(doc,'div',null,'store-thumb'),icon=element(doc,'i',null,'fa-solid fa-bowl-food store-icon');thumb.append(icon);
      const photoUrl=safeURL(item.photo);
      if(photoUrl){const img=element(doc,'img',null,'store-cms-photo cms-revealed');img.src=photoUrl;img.alt=(item.name||'매장')+' 사진';img.loading='lazy';thumb.prepend(img);}
      const body=element(doc,'div',null,'store-body'),h3=element(doc,'h3'),detailUrl=safeURL(item.detail_url);
      if(detailUrl){const a=element(doc,'a',(item.name||'')+' →');a.href=detailUrl;a.style.cssText='color:inherit;text-decoration:none;';h3.append(a);}else h3.textContent=item.name||'';
      body.append(h3,element(doc,'address',item.address||''));
      if(item.hours||item.closed_days||item.meta){const meta=element(doc,'div',null,'store-meta');if(item.hours||item.closed_days){const h=String(item.hours||'').replace(/^🕒\s*/,'').trim(),c=String(item.closed_days||'').trim();meta.append(element(doc,'span','🕒 '+(h&&c?(h+' · '+c):(h||c))));}if(item.meta)meta.append(element(doc,'span',item.meta));body.append(meta);}
      const actions=element(doc,'div',null,'store-actions');
      if(item.phone){const tel=element(doc,'a','전화하기','primary');tel.href='tel:'+String(item.phone).replace(/[^0-9+-]/g,'');actions.append(tel);}
      if(detailUrl){const det=element(doc,'a','매장 자세히 보기 →');det.href=detailUrl;actions.append(det);}
      const q=encodeURIComponent(item.name||'우동키노야');
      const gMap=safeURL(item.google_map_url)||('https://www.google.com/maps/search/'+q);
      const nMap=safeURL(item.naver_map_url)||('https://map.naver.com/p/search/'+q);
      const kMap=safeURL(item.kakao_map_url)||('https://map.kakao.com/link/search/'+q);
      const tMap=safeURL(item.tmap_url)||('https://tmap.life/search?query='+q);
      const gBtn=element(doc,'a','🗺 구글맵');gBtn.href=gMap;gBtn.target='_blank';gBtn.rel='noopener';
      const nBtn=element(doc,'a','🗺 네이버맵');nBtn.href=nMap;nBtn.target='_blank';nBtn.rel='noopener';
      const kBtn=element(doc,'a','🗺 카카오맵');kBtn.href=kMap;kBtn.target='_blank';kBtn.rel='noopener';
      const tBtn=element(doc,'a','🧭 티맵');tBtn.href=tMap;tBtn.target='_blank';tBtn.rel='noopener';
      actions.append(gBtn,nBtn,kBtn,tBtn);body.append(actions);card.append(thumb,body);list.append(card);
     });
     ['seoul','nationwide'].forEach(code=>{
      const sec=host.querySelector('#home-page-stores-'+code),h=sec?.querySelector('.store-group-heading'),l=sec?.querySelector('.store-list');
      if(h&&l)h.textContent=(code==='seoul'?'서울 지역':'전국 각지')+' · '+l.querySelectorAll('.store-card').length+'개 매장';
     });
    }catch(e){}
   })()
  ]);
 }
 window.HomeFull={pages,prepare,rewriteLinks,collections,sanitize,link,pageBase:path=>new URL(path,root)};
})();
