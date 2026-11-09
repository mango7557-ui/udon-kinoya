(async function () {
 'use strict';
 const root = new URL('../', location.href), origin = 'https://www.udonkinoya.com';
 const result = document.getElementById('results'), lines = [], docs = new Map();
 function check(name, ok) { const line=(ok?'PASS ':'FAIL ')+name; lines.push(line); console.log(line); result.textContent=lines.join('\n'); }
 async function text(path) { const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),15000); try { const response=await fetch(new URL(path,root),{signal:controller.signal}); if(!response.ok)throw new Error(path+' HTTP '+response.status); return await response.text(); } finally {clearTimeout(timer);} }
 const parse = source => new DOMParser().parseFromString(source,'text/html');
 const schemas = d => [...d.querySelectorAll('script[type="application/ld+json"]')].flatMap(s=>{const j=JSON.parse(s.textContent);return j['@graph']||[j];});
 const clean = s => String(s||'').replace(/\s+/g,' ').trim();
 try {
  const xml=new DOMParser().parseFromString(await text('sitemap.xml'),'application/xml');
  check('사이트맵 XML 파싱',!xml.querySelector('parsererror'));
  const urls=[...xml.getElementsByTagName('loc')].map(el=>el.textContent);
  check('canonical 도메인·중복 없는 공개 URL',urls.every(u=>u.startsWith(origin+'/'))&&new Set(urls).size===urls.length);
  check('관리자·API·테스트·이전 송도점 제외',!urls.some(u=>/\/(admin|tests|tables)\//.test(u)||u.endsWith('/store/songdo/')));
  check('공식 가이드 사이트맵 포함',urls.includes(origin+'/guide/'));
  let cursor=0; const failures=[];
  await Promise.all(Array.from({length:4},async()=>{
   while(cursor<urls.length){const url=urls[cursor++];try{
    const path=new URL(url).pathname.slice(1),d=parse(await text(path+'index.html'));docs.set(url,d);
    if(d.querySelectorAll('link[rel="canonical"]').length!==1 || d.querySelector('link[rel="canonical"]').getAttribute('href')!==url)failures.push(path+' canonical');
    if(!d.title||!d.querySelector('meta[name="description"]')?.content)failures.push(path+' title/description');
    if([...d.querySelectorAll('meta[name="robots"]')].some(el=>/noindex/.test(el.content)))failures.push(path+' noindex in sitemap');
    if(!schemas(d).length)failures.push(path+' JSON-LD missing');
   }catch(error){failures.push(url+' '+error.message);}}
  }));
  check('사이트맵 '+urls.length+'페이지 응답·제목·설명·canonical·JSON-LD 구문',failures.length===0);
  failures.forEach(f=>console.error(f));
  const reciprocal=[];
  docs.forEach((d,url)=>d.querySelectorAll('link[rel="alternate"][hreflang]').forEach(a=>{
   const href=a.getAttribute('href'),target=docs.get(href);
   if(!target||![...target.querySelectorAll('link[rel="alternate"][hreflang]')].some(back=>back.getAttribute('href')===url))reciprocal.push(url+' -> '+href);
  }));
  check('다국어 hreflang 대상·상호 링크',reciprocal.length===0); reciprocal.forEach(f=>console.error(f));
  const guide=docs.get(origin+'/guide/'),graph=schemas(guide),faq=graph.find(s=>s['@type']==='FAQPage');
  check('공식 가이드 질문 8개가 정적 HTML에 존재',guide.querySelectorAll('.guide-answer').length===8 && faq.mainEntity.length===8);
  check('FAQ 구조화 질문·답변과 표시 원문 완전 일치',faq.mainEntity.every(q=>{const section=guide.getElementById(new URL(q['@id']).hash.slice(1));return section&&clean(section.querySelector('h2').textContent)===clean(q.name)&&clean(section.querySelector('.answer-text').textContent)===clean(q.acceptedAnswer.text);}));
  check('앱 스크립트 없이 FAQ와 정보 기준 제공',!guide.querySelector('script[src]') && !!guide.getElementById('information-policy'));
  const anchors=[...guide.querySelectorAll('a[href^="#"]')];
  check('가이드 목차·접근성 바로가기 목적지',anchors.every(a=>guide.getElementById(a.getAttribute('href').slice(1))));
  check('가이드 답변별 공식 원문 링크', [...guide.querySelectorAll('.guide-source')].every(a=>docs.has(new URL(a.getAttribute('href'),origin+'/guide/').href)));
  check('홈에서 가이드 정적 링크 제공',!!docs.get(origin+'/').querySelector('a[href="guide/"]'));
  const store=docs.get(origin+'/store/');
  check('국문 매장 51개와 요약 일치',store.querySelectorAll('.store-card:not(.store-gallery-card)').length===51 && guide.getElementById('stores').textContent.includes('51개'));
  check('영문·일문 매장 수 동기화', ['en/','ja/','en/store/','ja/store/'].every(path=>{const d=docs.get(origin+'/'+path);return d.body.textContent.includes('51')&&!/45 stores|45店舗|45 Stores/.test(d.body.textContent);}));
  check('국문·영문·일문 지원조건의 이전 50호점 문구 제거',['franchise/','franchise/cost/','franchise/faq/','en/franchise/cost/','en/franchise/faq/','ja/franchise/cost/','ja/franchise/faq/'].every(path=>!/(?:가맹\s*50호점|50th (?:store|franchise)|50号店)/.test(docs.get(origin+'/'+path).documentElement.outerHTML)));
  const llms=await text('llms.txt'),robots=await text('robots.txt');
  check('llms 요약 최신 수치·공식 가이드·제약 안내',llms.includes('/guide/')&&llms.includes('51개')&&llms.includes('100호점')&&!llms.includes('45개')&&!llms.includes('50호점')&&llms.includes('보장하지'));
  check('공개 크롤링 유지·관리 경로 제외·사이트맵 연결',/User-agent: \*/.test(robots)&&/Allow: \//.test(robots)&&!/Disallow: \/\s*$/m.test(robots)&&robots.includes('Disallow: /admin/')&&robots.includes('Disallow: /tables/')&&robots.includes(origin+'/sitemap.xml'));
  const archive=parse(await text('store/songdo/index.html'));
  check('이전 매장 안내 보존·검색 제외·Restaurant 마크업 제외',archive.querySelector('meta[name="robots"]').content.includes('noindex')&&archive.body.textContent.includes('이전 매장 정보입니다')&&!schemas(archive).some(s=>s['@type']==='Restaurant'));
  check('가이드 허위 평점·리뷰·수익 보장 마크업 없음',!JSON.stringify(graph).match(/aggregateRating|reviewRating|guaranteed/));
 }catch(error){check('검사 실행: '+error.message,false);}
 result.dataset.complete='true';
 const passed=lines.filter(l=>l.startsWith('PASS')).length;
 console.log('AEO/GEO '+passed+'/'+lines.length+' PASS');
})();
