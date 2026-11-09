(async function(){
 const out=document.getElementById('results'),log=[];const ok=(condition,label)=>{if(!condition)throw new Error(label);log.push('PASS '+label);console.log('PASS '+label);out.textContent=log.join('\n');};
 try{
 const source=await (await fetch('../index.html')).text(),parse=()=>new DOMParser().parseFromString(source,'text/html');
 const doc=parse(),model=HomeModel.build(doc),other=HomeModel.build(parse());
 ok(model.fields.length>250,'More than 250 edit bindings: '+model.fields.length);
 ok(JSON.stringify(model.fields.map(f=>f.key))===JSON.stringify(other.fields.map(f=>f.key)),'Stable keys on original template');
 ok(model.fields.some(f=>f.key==='home.store.11.photo'),'All store photo slots');
 ok(model.fields.some(f=>f.key==='home.hero.video'),'Hero video binding');
 ok(doc.querySelectorAll('#noodle > .home-noodle-detail').length===4,'Four belief detail blocks are embedded in home');
 ok([...doc.querySelectorAll('.home-noodle-jump a')].every(a=>doc.getElementById(a.hash.slice(1))),'Belief section jump links resolve inside home');
 ok(doc.querySelector('.mobile-bottom-nav a[data-match="/noodle/"]').getAttribute('href')==='#noodle','Mobile belief link stays on home');
 model.apply({'noodle.qna.q':{value:'공통 신념 질문'},'noodle.qna.a':{value:'공통 신념 답변'}});ok(doc.getElementById('home-noodle-question').textContent==='공통 신념 질문'&&doc.querySelector('#home-noodle-qna p').textContent==='공통 신념 답변','Shared belief CMS data applies on home');
 const ids=[...doc.querySelectorAll('[id]')].map(el=>el.id);ok(new Set(ids).size===ids.length,'Embedded content introduces no duplicate IDs');
 const orderedIds=()=>Array.from(doc.querySelectorAll('main > section')).map(el=>el.id);
 const expected=['top','social','numbers','brand-story','noodle','people','proof','system','turnover','support','partner-logos-section','model','stores','menu-preview','faq-preview','final'];
 ok(JSON.stringify(orderedIds())===JSON.stringify(expected),'Default order follows all top menu groups');
 model.apply({'home.layout.v1':{value:JSON.stringify({order:['people','social'],hidden:{proof:true}})}});
 ok(JSON.stringify(orderedIds())===JSON.stringify(expected),'Legacy order does not undo requested menu alignment');
 ok(doc.querySelector('#proof').classList.contains('home-section-hidden'),'Legacy visibility settings retained');
 model.apply({'menu.hero.title':{value:'공통 메뉴 제목'}});ok(doc.querySelector('#menu-preview h2').textContent==='공통 메뉴 제목','Menu preview shares existing menu CMS values');
 model.apply({'home.hero.headline':{value:'새 제목<br><b>검증</b>'},'home.store.2.photo':{value:'images/store-guri-exterior.jpg'},'home.layout.v1':{value:JSON.stringify({mode:'custom',order:['numbers','top'],hidden:{proof:true}})}});
 ok(doc.querySelector('[data-cms="home.hero.headline"]').textContent==='새 제목검증','Text apply');
 ok(doc.querySelector('main > section').id==='numbers','Section reorder');
 ok(doc.querySelector('#proof').classList.contains('home-section-hidden'),'Section hide');
 ok(doc.querySelectorAll('[data-cms="home.store.2.photo"]')[1].getAttribute('src')==='images/store-guri-exterior.jpg','Store duplicate synchronization');
 model.apply({'home.store.2.photo':{value:''}});ok(!doc.querySelector('[data-cms="home.store.2.photo"]').hasAttribute('src'),'Photo clear does not restore default');
 let rejected=false;try{HomeModel.safeURL('javascript:alert(1)',false);}catch(e){rejected=true;}ok(rejected,'Unsafe link rejected');
 const fake=HomeModel.byKey([{key:'x',value:'old',updated_at:'2026-01-01'},{key:'x',value:'new',updated_at:'2026-02-01'}]);ok(fake.x.value==='new','Latest duplicate selection');
 const iframe=document.getElementById('admin');let html=await(await fetch('../admin/home.html')).text();const a=new DOMParser().parseFromString(html,'text/html');a.querySelectorAll('script').forEach(s=>s.remove());const base=a.createElement('base');base.href=new URL('../admin/',location.href).href;a.head.prepend(base);iframe.srcdoc=a.documentElement.outerHTML;await new Promise(r=>iframe.onload=r);
 const w=iframe.contentWindow,d=w.document;let records=[],writes=0,fail=false;
 w.fetch=async(url,options={})=>{
   if(String(url).includes('/tables/site_content')){
     if(fail)return new Response('failure',{status:503});
     if(options.method){writes++;const row=JSON.parse(options.body);records=records.filter(r=>r.key!==row.key);records.push(row);return new Response(JSON.stringify(row),{status:200});}
     return new Response(JSON.stringify({data:records,total:records.length}));
   }
   if(String(url).startsWith('../index.html'))return new Response(source);
   if((!options.method||options.method==='GET')&&String(url).includes('.html'))return fetch(url);
   throw new Error('Blocked unexpected test request: '+url);
 };
 async function script(src){await new Promise((r,j)=>{const s=d.createElement('script');s.src=src;s.onload=r;s.onerror=j;d.body.append(s);});}
 const wait=async(fn)=>{for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,50));}throw new Error('Timed out');};
 await script('../js/site-runtime.js');await script('core.js');await script('../js/menu-catalog.js');await script('../js/home-full.js');await script('../js/home-model.js');await script('../js/home-store-rows.js');await script('home.js');await wait(()=>d.getElementById('status').textContent.includes('편집 항목을 불러왔습니다'));
 ok(d.querySelectorAll('.layout-row').length===15,'15 visible full-content groups rendered');
 d.querySelector('.layout-row button[aria-label^="아래로"]').click();ok(d.getElementById('editor').textContent.includes('현재 정렬: 수동 순서'),'Arrow explicitly switches to custom layout mode');
 Array.from(d.querySelectorAll('#editor button')).find(b=>b.textContent==='상단 메뉴 순서로 맞추기').click();ok(d.querySelector('.layout-row label').textContent.includes('메인 영상'),'Reset restores menu order in editor');
 w.confirm=()=>true;d.getElementById('discard').click();
 Array.from(d.querySelectorAll('#groups button')).find(b=>b.textContent.includes('메인 영상')).click();
 const input=d.getElementById('field-home.hero.headline');input.value='TEST TITLE';input.dispatchEvent(new w.Event('input',{bubbles:true}));
 ok(!d.getElementById('save').disabled,'Dirty-state save enabled');
 d.getElementById('preview').click();ok(d.getElementById('preview-frame').srcdoc.includes('TEST TITLE'),'Preview includes unsaved change');ok(d.getElementById('preview-frame').srcdoc.includes('consult-form')&&d.getElementById('preview-frame').srcdoc.includes('home-page-faq-preview-faq-01'),'Preview includes composed form and full FAQ');ok(writes===0,'Preview makes no writes');d.getElementById('close-preview').click();
 d.getElementById('save').click();await wait(()=>d.getElementById('status').textContent.includes('저장 완료'));ok(writes===1 && records[0].value==='TEST TITLE','Changed-field save only');
 const edit=d.getElementById('field-home.hero.headline');edit.value='SECOND';edit.dispatchEvent(new w.Event('input',{bubbles:true}));records[0].value='OTHER EDITOR';d.getElementById('save').click();await wait(()=>d.getElementById('status').textContent.includes('다른 화면'));ok(writes===1,'Concurrent edit prevented');
 fail=true;d.getElementById('save').click();await wait(()=>d.getElementById('status').textContent.includes('503'));ok(writes===1 && d.getElementById('dirty-count').textContent.includes('1'),'Failure keeps draft without writes');
 w.confirm=()=>true;fail=false;records[0].value='TEST TITLE';d.getElementById('discard').click();
 const transfer=new w.DataTransfer();transfer.items.add(new w.File([JSON.stringify({version:1,scope:'ko-home',values:{'home.hero.headline':'RESTORED'}})],'home.json',{type:'application/json'}));const upload=d.getElementById('restore-file');upload.files=transfer.files;upload.dispatchEvent(new w.Event('change'));await wait(()=>d.getElementById('status').textContent.includes('백업을 편집 화면'));ok(d.getElementById('field-home.hero.headline').value==='RESTORED'&&writes===1,'Backup restore stages changes only');
 d.getElementById('save').click();await wait(()=>d.getElementById('status').textContent.includes('저장 완료'));ok(writes===2 && records[0].value==='RESTORED','Restored draft saves correctly');
 console.log('ALL TESTS PASSED');out.textContent+='\nALL TESTS PASSED';
 }catch(e){console.error('TEST FAILED',e.message);out.textContent+='\nFAIL '+e.message;}
})();
