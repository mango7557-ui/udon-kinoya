/* Behavior-only fixture: no production API calls. Layout is verified on the real page separately. */
(async function(){
 const out=document.getElementById('results'),delay=()=>new Promise(r=>setTimeout(r,80));
 const ok=(v,label)=>{if(!v)throw new Error(label);console.log('PASS '+label);out.textContent+='\nPASS '+label;};
 async function fixture(path){
  const url=new URL(path,location.href),html=await(await fetch(url)).text(),doc=new DOMParser().parseFromString(html,'text/html');
  doc.querySelectorAll('script').forEach(s=>s.remove());doc.querySelectorAll('video source').forEach(s=>s.remove());doc.querySelectorAll('video').forEach(v=>{v.removeAttribute('autoplay');v.removeAttribute('src');});
  const base=doc.createElement('base');base.href=url.href;doc.head.prepend(base);
  const frame=document.createElement('iframe');document.body.append(frame);await new Promise(r=>{frame.onload=r;frame.srcdoc=doc.documentElement.outerHTML;});
  return {frame,w:frame.contentWindow,d:frame.contentDocument};
 }
 async function load(d){await new Promise((r,j)=>{const s=d.createElement('script');s.src=new URL('../js/nav-state.js',location.href).href;s.onload=r;s.onerror=j;d.body.append(s);});await delay();}
 try{
  const {w,d}=await fixture('../index.html');let y=0;Object.defineProperty(w,'scrollY',{get:()=>y});
  for(const file of ['home-full.js','home-model.js'])await new Promise((r,j)=>{const s=d.createElement('script');s.src=new URL('../js/'+file,location.href).href;s.onload=r;s.onerror=j;d.head.append(s);});await w.HomeFull.prepare(d);w.HomeModel.build(d);
  const nav=d.getElementById('nav');nav.getBoundingClientRect=()=>({bottom:100});
  const sections=[...d.querySelectorAll('main > section')],positions=new Map(sections.map((s,i)=>[s.id,i*1000]));
  sections.forEach(s=>{s.getBoundingClientRect=()=>({top:positions.get(s.id)-y,height:1000,bottom:positions.get(s.id)-y+1000});});
  await load(d);
  const active=()=>d.querySelector('.nav-menu a.is-active, .nav > .nav-cta.is-active');
  const go=async id=>{y=positions.get(id)+20;w.dispatchEvent(new w.Event('scroll'));await delay();};
  ok(!nav.classList.contains('is-scrolled')&&!active(),'Top of hero has original color and no section highlight');
  await go('social');ok(nav.classList.contains('is-scrolled'),'Downward scroll switches header surface');
  ok(active()?.getAttribute('href')==='#social'&&active()?.getAttribute('aria-current')==='location','Social section highlighted accessibly');
  await go('brand-story');ok(active()?.getAttribute('href')==='#brand-story','Brand section matches Brand menu');
  await go('noodle');ok(active()?.getAttribute('href')==='#noodle','Embedded Noodle section matches same-page menu anchor');
  await go('model');ok(active()?.getAttribute('href')==='#model','Startup cost section matches Cost menu');
  await go('menu-preview');ok(active()?.getAttribute('href')==='#menu-preview','Menu preview matches Menu navigation');
  await go('stores');ok(active()?.getAttribute('href')==='#stores','Stores section matches Store menu');
  await go('people');ok(active()?.getAttribute('href')==='#people','People section matches People menu');
  await go('faq-preview');ok(active()?.getAttribute('href')==='#faq-preview','FAQ selects FAQ rather than Franchise');
  await go('final');ok(active()?.getAttribute('href')==='#final','Final CTA section matches consultation');
  const ranks=[];for(const id of ['social','numbers','brand-story','noodle','people','proof','system','turnover','support','model','stores','menu-preview','faq-preview']){await go(id);ranks.push([...d.querySelectorAll('.nav-menu a')].indexOf(active()));}ok(ranks.every((rank,i)=>rank>=0&&(!i||rank>=ranks[i-1])),'Scrolling progresses monotonically through header menu order');
  y=0;w.dispatchEvent(new w.Event('scroll'));await delay();ok(!nav.classList.contains('is-scrolled')&&!active(),'Scroll back to top restores initial state');
  positions.set('people',500);y=550;d.dispatchEvent(new w.CustomEvent('home-cms-loaded'));await delay();ok(active()?.getAttribute('href')==='#people','CMS reordered sections use visual positions');
  d.getElementById('people').style.display='none';d.dispatchEvent(new w.CustomEvent('home-cms-loaded'));await delay();ok(!active(),'Hidden section not selected');
  const sub=await fixture('../franchise/faq/index.html');await load(sub.d);
  const current=sub.d.querySelector('.nav-menu a.is-active');ok(current?.getAttribute('href')==='./'&&current?.getAttribute('aria-current')==='page','Relative detail-page links resolve and exact FAQ wins');
  out.textContent+='\nALL TESTS PASSED';console.log('ALL TESTS PASSED');
 }catch(e){out.textContent+='\nFAIL '+e.message;console.error('TEST FAILED '+e.message);}
})();
