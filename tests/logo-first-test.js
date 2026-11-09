(async function(){
  const out=document.getElementById('results');
  const assert=(condition,label)=>{if(!condition)throw new Error(label);console.log('PASS '+label);out.textContent+='\nPASS '+label;};
  const pause=ms=>new Promise(r=>setTimeout(r,ms));
  let frame;
  try {
    const source=await(await fetch('../index.html')).text();
    const doc=new DOMParser().parseFromString(source,'text/html');doc.querySelectorAll('script').forEach(el=>el.remove());
    const base=doc.createElement('base');base.href=new URL('../',location.href).href;doc.head.prepend(base);
    frame=document.createElement('iframe');frame.style.cssText='width:100%;height:700px';document.body.append(frame);
    await new Promise(ok=>{frame.onload=ok;frame.srcdoc=doc.documentElement.outerHTML;});
    const w=frame.contentWindow,d=w.document;
    // Isolated memory storage: tests do not overwrite the operator's actual cache.
    const store=new Map();const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
    Object.defineProperty(w,'localStorage',{value:storage});Object.defineProperty(w,'sessionStorage',{value:storage});
    const row={id:'test-header',key:'global.logo.header',value:'images/favicon.png',updated_at:10};
    let resolveLogo,fullResolved=false,requests=[];
    w.fetch=(url)=>{requests.push(String(url));return new Promise(ok=>{resolveLogo=()=>ok(new Response(JSON.stringify(row)));});};
    async function load(path){await new Promise((ok,no)=>{const s=d.createElement('script');s.src=path;s.onload=ok;s.onerror=no;d.head.append(s);});}
    await load('js/logo-first.js');
    w.HomeModel={build:()=>({apply:()=>{}}),fetchRows:()=>new Promise(()=>{})};
    await load('js/home-runtime.js');
    const img=d.querySelector('img[data-cms="global.logo.header"]');
    assert(requests.length===1 && requests[0].includes('/tables/site_content/'),'Header requested independently via single-record API');
    resolveLogo();await pause(100);
    assert(img.getAttribute('src').endsWith('/images/favicon.png'),'Cold visit applies logo-only response');
    assert(d.documentElement.classList.contains('home-cms-pending')&&!fullResolved,'Full CMS deliberately remains pending');
    assert(w.getComputedStyle(img).visibility==='visible'&&w.getComputedStyle(img).display!=='none','Logo visible while full CMS is pending');
    assert(w.getComputedStyle(img).animationName==='none','Logo has no reveal animation');
    assert(img.loading==='eager'&&img.getAttribute('fetchpriority')==='high','Logo eager and high priority');
    assert(JSON.parse(store.get('kinoya_logo_cache_v1'))['global.logo.header'].value===row.value,'Dedicated logo cache saved');
    w.KinoyaLogo.accept({'global.logo.header':{...row,value:'',updated_at:20}});
    assert(!img.hasAttribute('src')&&w.getComputedStyle(img).visibility==='hidden','Explicitly cleared logo stays hidden');
    w.KinoyaLogo.accept({'global.logo.header':row});assert(!img.hasAttribute('src'),'Older response cannot resurrect a cleared logo');
    w.KinoyaLogo.accept({'global.logo.header':{...row,updated_at:30}});
    assert(img.getAttribute('src').endsWith('/images/favicon.png'),'Newer logo restores display');
    // Re-run only the loader with the populated cache and a never-resolving request.
    delete w.KinoyaLogo;img.setAttribute('src','images/logo-header.png');
    w.fetch=()=>new Promise(()=>{});await load('js/logo-first.js?warm=1');
    assert(img.getAttribute('src').endsWith('/images/favicon.png'),'Warm visit displays cached logo without network completion');
    assert(w.getComputedStyle(img).visibility==='visible','Warm logo bypasses pending photo visibility');
    console.log('ALL TESTS PASSED');out.textContent+='\nALL TESTS PASSED';
  }catch(e){console.error('TEST FAILED '+e.message);out.textContent+='\nFAIL '+e.message;}
})();
