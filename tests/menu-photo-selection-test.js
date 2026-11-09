(async function(){
 'use strict';
 const out=document.getElementById('results'),logs=[],frame=document.getElementById('admin');
 const wait=async fn=>{for(let i=0;i<400;i++){if(fn())return;await new Promise(r=>setTimeout(r,50));}throw new Error('대기시간 초과');};
 const check=(ok,label)=>{if(!ok)throw new Error(label);logs.push('PASS '+label);out.textContent=logs.join('\n');console.log('PASS '+label);};
 const cacheBackup=Object.fromEntries(['cms_cache','kinoya_menu_cache_v1'].map(key=>[key,localStorage.getItem(key)]));
 const view=document.body.classList.contains('view')||new URLSearchParams(location.search).has('view');if(view)document.body.classList.add('view');
 async function load(readfail){
  const url=new URL('../admin/index.html',location.href),html=await(await fetch(url)).text();
  const scripts=['admin-reliability-fixture.js','menu-photo-selection-fixture.js'+(readfail?'?readfail=1':'')].map(p=>'<'+'script src="'+new URL(p,location.href).href+'"></'+'script>').join('');
  frame.srcdoc=html.replace('<head>','<head><base href="'+url.href+'">'+scripts);
  await wait(()=>frame.contentWindow?.adminFixture&&frame.contentDocument?.getElementById('save-status')?.textContent.includes(readfail?'불러오지 못했습니다':'불러왔습니다'));
  return frame.contentWindow;
 }
 try{
  let w=await load(false),d=w.document,F=w.adminFixture;
  const id='menu-catalog-signature-eel-bg',input=()=>d.getElementById('file-'+id),preview=()=>d.getElementById('preview-'+id),status=()=>d.getElementById('photo-status-'+id),save=()=>d.querySelector('[data-save-menu-photo="'+id+'"]'),retry=()=>d.querySelector('[data-retry-photo="'+id+'"]');
  const files=()=>F.requests.filter(r=>r.url.includes('/files/')&&r.method==='POST'),writes=()=>F.requests.filter(r=>r.url.includes('/tables/')&&r.method!=='GET');
  const canvas=d.createElement('canvas');canvas.width=320;canvas.height=220;const ctx=canvas.getContext('2d');ctx.fillStyle='#d6bd83';ctx.fillRect(0,0,320,220);ctx.fillStyle='#243247';ctx.font='24px sans-serif';ctx.fillText('MENU PHOTO TEST',32,115);
  const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));
  async function choose(name='menu.png',type='image/png'){
   const dt=new w.DataTransfer();dt.items.add(new w.File([blob],name,{type}));input().files=dt.files;input().dispatchEvent(new w.Event('change',{bubbles:true}));
   await wait(()=>!input().disabled);return input().files[0];
  }
  check(!input().disabled&&w.getComputedStyle(input()).position!=='absolute','기본 파일 선택 입력 표시·활성');
  let clicked=0,orig=input().click;input().click=()=>clicked++;d.querySelector('[data-select-photo="'+id+'"]').click();input().click=orig;
  check(clicked===1,'사진 선택 버튼이 파일 입력 click에 직접 연결');
  await choose();check(preview().src.startsWith('blob:')&&preview().naturalWidth>0,'서버 없이 선택 즉시 로컬 사진 미리보기');
  check(files().length===0&&writes().length===0,'선택만으로 업로드·DB 쓰기 없음');
  check(status().textContent.includes('아직 저장되지'),'사진 옆 미저장 안내');
  if(view){
   let section=input().closest('section');const fields=d.getElementById('fields-container');
   if(document.body.dataset.clear==='true'){
    const clear=d.querySelector('[data-clear-menu-photo="menu-item1-bg"]');clear.click();
    await wait(()=>!fields.inert&&d.getElementById('photo-status-menu-item1-bg').textContent.includes('사진을 비웠습니다'));
    section=clear.closest('section');
   }
   /* Isolate the actual rendered group; leave its real HTML/CSS and handlers unchanged. */
   Array.from(fields.children).forEach(el=>{if(el!==section)el.hidden=true;});
   Array.from(fields.parentElement.children).forEach(el=>{if(el!==fields)el.hidden=true;});
   const nav=d.getElementById('group-nav');if(nav?.parentElement)nav.parentElement.hidden=true;
   const align=()=>w.scrollTo(0,0);
   const timer=setInterval(align,150);await new Promise(r=>setTimeout(r,3500));clearInterval(timer);align();
   document.body.dataset.testStatus='passed';return;
  }
  const local=preview().src;F.fail={method:'POST',status:503};save().click();await wait(()=>status().textContent.includes('저장 실패')&&!d.getElementById('fields-container').inert);
  check(preview().src===local&&input().files.length===1,'업로드 503 실패 시 선택 파일·미리보기 유지');
  check(status().textContent.includes('Hosted')&&writes().length===0,'사진 옆 활성화 오류 안내·DB fallback 없음');
  const key=files()[0].headers['Idempotency-Key'];F.fail={method:'PUT',table:'site_content',status:500};retry().click();await wait(()=>status().textContent.includes('HTTP 500')&&!d.getElementById('fields-container').inert);
  check(files().length===2&&files()[1].headers['Idempotency-Key']===key,'직접 재시도 때 같은 업로드 멱등키');
  check(F.uploads===1&&F.tables.site_content.find(r=>r.id==='menu-photo-1').value==='','업로드 성공·DB 실패 상태 분리');
  check(preview().src===local&&input().files.length===1,'DB 실패 후에도 선택 사진 보존');
  retry().click();await wait(()=>status().textContent.includes('저장 완료')&&!d.getElementById('fields-container').inert);
  check(files().length===2,'DB 재시도는 성공한 파일을 중복 업로드하지 않음');
  check(F.tables.site_content.find(r=>r.id==='menu-photo-1').value==='/files/cms-images/mock-1','실제 반환 참조만 기존 메뉴 행에 저장');
  check(writes().every(r=>r.method==='PUT'&&r.url.endsWith('/menu-photo-1')),'기존 메뉴 id PUT 유지·새 행 없음');
  check(input().files.length===0,'성공 이후에만 파일 선택 상태 정리');
  await choose('empty-mime.png','');check(preview().src.startsWith('blob:')&&status().textContent.includes('선택 완료'),'MIME 누락 PNG 로컬 선택 지원');
  d.getElementById('save-all-btn').click();await wait(()=>!d.getElementById('save-all-btn').disabled&&status().textContent.includes('저장 완료'));
  check(F.tables.site_content.find(r=>r.id==='menu-photo-1').value==='/files/cms-images/mock-2','전체 저장도 메뉴 사진 업로드와 연결 반영');
  const previous=preview().src;await choose('unsupported.heic','image/heic');check(status().textContent.includes('HEIC')&&preview().src===previous,'지원하지 않는 HEIC 안내·기존 미리보기 보존');
  await choose();const preClearUploads=files().length;
  d.querySelector('[data-clear-menu-photo="'+id+'"]').click();
  check(preview().hidden&&!preview().hasAttribute('src'),'비우기 클릭 즉시 이미지와 src 제거');
  await wait(()=>!d.getElementById('save-all-btn').disabled&&status().textContent.includes('사진을 비웠습니다'));
  check(F.tables.site_content.find(r=>r.id==='menu-photo-1').value==='','새 카테고리 사진 비우기는 전체 저장 없이 즉시 저장');
  check(files().length===preClearUploads&&input().files.length===0,'비우기는 파일 업로드 없이 선택 상태 정리');
  const legacy='menu-item1-bg',legacyPreview=d.getElementById('preview-'+legacy),legacyClear=d.querySelector('[data-clear-menu-photo="'+legacy+'"]'),legacyStatus=d.getElementById('photo-status-'+legacy),legacyBefore=legacyPreview.src;
  const text=d.getElementById('text-menu-item1-title');text.value='다른 미저장 글씨';text.dispatchEvent(new w.Event('input',{bubbles:true}));
  F.fail={method:'PUT',table:'site_content',status:500};const beforeFailed=writes().length;legacyClear.click();
  check(legacyPreview.hidden,'이전 16칸 사진도 클릭 즉시 숨김');
  await wait(()=>!d.getElementById('fields-container').inert);
  check(!legacyPreview.hidden&&legacyPreview.src===legacyBefore&&legacyStatus.textContent.includes('실패'),'비우기 500 실패 시 기존 사진 복원·현장 오류 표시');
  check(writes().length===beforeFailed+1&&F.tables.site_content.find(r=>r.id==='legacy-photo-1').value===legacyBefore,'비우기 실패에 자동 재시도 없음·DB 이전값 유지');
  legacyClear.click();await wait(()=>!d.getElementById('fields-container').inert);
  check(legacyPreview.hidden&&w.getComputedStyle(legacyPreview).display==='none'&&!legacyPreview.hasAttribute('src'),'이전 16칸 재시도 성공 시 깨진 아이콘·빈 이미지 박스 제거');
  check(F.tables.site_content.find(r=>r.id==='legacy-photo-1').value==='','이전 사진 동일 id에 빈값 저장');
  check(text.value==='다른 미저장 글씨'&&text.dataset.dirty==='1'&&!writes().some(r=>JSON.parse(r.body).key==='menu.item1.title'),'해당 사진만 저장·다른 미저장 글씨 보존');
  check(JSON.parse(localStorage.getItem('kinoya_menu_cache_v1'))['menu.item1.bg'].value==='','성공한 빈값을 현재 브라우저 메뉴 캐시에 반영');
  const defaultKey='menu.catalog.signature.gyudon.bg',defaultPreview=d.getElementById('preview-menu-catalog-signature-gyudon-bg');
  check(defaultPreview.src.includes('menu-gyudon.jpg'),'새 카테고리 기본 사진이 있는 항목 준비');
  d.querySelector('[data-clear-menu-photo="menu-catalog-signature-gyudon-bg"]').click();await wait(()=>!d.getElementById('fields-container').inert);
  check(defaultPreview.hidden&&F.tables.site_content.find(r=>r.key===defaultKey)?.value===''&&writes().some(r=>r.method==='POST'&&JSON.parse(r.body).key===defaultKey),'기존 CMS 행 없는 기본 사진도 명시적 빈값 생성하여 숨김');
  check(writes().every(r=>!/(?:data:|blob:)/i.test(JSON.parse(r.body).value)),'비우기 포함 모든 쓰기에 바이너리·Blob URL 없음');
  parent.menuPhotoTestSeed=F.tables.site_content;w=await load(false);d=w.document;F=w.adminFixture;delete parent.menuPhotoTestSeed;
  check(d.getElementById('preview-menu-item1-bg').hidden&&!d.getElementById('preview-menu-item1-bg').hasAttribute('src')&&preview().hidden&&d.getElementById('preview-menu-catalog-signature-gyudon-bg').hidden,'재진입 후 이전·신규 메뉴 사진 기본값으로 복원되지 않음');
  check(writes().every(r=>!/(?:data:|blob:)/i.test(JSON.parse(r.body).value)),'모든 DB 쓰기는 Base64·Blob URL 없음');
  w=await load(true);d=w.document;F=w.adminFixture;
  check(!input().disabled&&d.getElementById('save-all-btn').disabled,'CMS 조회 실패해도 로컬 선택 허용·전체 저장 차단');
  await choose();check(preview().src.startsWith('blob:'),'조회 실패 상태에서도 사진 로컬 미리보기');
  F.fail={method:'GET',table:'site_content',status:503};save().click();
  await wait(()=>!d.getElementById('fields-container').inert&&status().textContent.includes('저장 실패'));
  check(files().length===0&&writes().length===0,'해당 키 조회 실패 상태는 개별 저장 차단·업로드 없음');
  const readFailPreview=preview().src;F.fail={method:'GET',table:'site_content',status:503};d.querySelector('[data-clear-menu-photo="'+id+'"]').click();
  await wait(()=>!d.getElementById('fields-container').inert&&status().textContent.includes('실패'));
  check(preview().src===readFailPreview&&writes().length===0,'해당 키 조회 실패 중 비우기도 저장 차단·미리보기 보존');
  out.textContent+='\nALL '+logs.length+' TESTS PASSED';document.body.dataset.testStatus='passed';console.log('ALL '+logs.length+' TESTS PASSED');
 }catch(e){out.textContent+='\nFAIL '+e.message;document.body.dataset.testStatus='failed';console.error('TEST FAILED',e.stack||e.message);}
 finally{delete parent.menuPhotoTestSeed;Object.entries(cacheBackup).forEach(([key,value])=>{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);});}
})();
