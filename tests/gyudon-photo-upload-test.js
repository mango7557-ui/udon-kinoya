(async function(){
 'use strict';
 const out=document.getElementById('results'),frame=document.getElementById('admin'),logs=[];
 const cacheBackup=Object.fromEntries(['cms_cache','kinoya_menu_cache_v1'].map(key=>[key,localStorage.getItem(key)]));
 const wait=async fn=>{for(let i=0;i<600;i++){if(fn())return;await new Promise(r=>setTimeout(r,50));}throw Error('대기시간 초과');};
 const check=(ok,label)=>{if(!ok)throw Error(label);logs.push('PASS '+label);console.log(logs.at(-1));out.textContent=logs.join('\n');};
 async function mount(query){
  const url=new URL('../admin/index.html',location.href),html=await(await fetch(url)).text(),fixture=new URL('admin-reliability-fixture.js'+query,location.href);
  frame.srcdoc='<!doctype html><html><body></body></html>';await new Promise(r=>setTimeout(r,50));
  frame.srcdoc=html.replace('<head>','<head><base href="'+url.href+'"><'+'script src="'+fixture.href+'"></'+'script>');
  await wait(()=>frame.contentWindow?.AdminCore&&frame.contentWindow?.adminFixture&&frame.contentDocument?.getElementById('save-all-btn'));
  return frame.contentWindow;
 }
 try{
  const gyudonBlob=await(await fetch('../images/menu-gyudon.jpg')).blob();
  check(gyudonBlob.size===145499&&gyudonBlob.type==='image/jpeg','첨부 원본 규동 JPG(145,499B) 프로젝트 반영 확인');
  let w=await mount('?oversize=brand.'),d=w.document,F=w.adminFixture;
  const id='menu-catalog-signature-gyudon-bg',key='menu.catalog.signature.gyudon.bg';
  const input=()=>d.getElementById('file-'+id),preview=()=>d.getElementById('preview-'+id),status=()=>d.getElementById('photo-status-'+id),save=()=>d.querySelector('[data-save-menu-photo="'+id+'"]'),clear=()=>d.querySelector('[data-clear-menu-photo="'+id+'"]'),restore=()=>d.querySelector('[data-restore-menu-photo="'+id+'"]');
  await wait(()=>!d.getElementById('save-all-btn').disabled&&d.getElementById('save-status').textContent.includes('일부 대용량 섹션'));
  check(d.getElementById('save-status').textContent.includes('brand.'),'전체 조회 413 시 대용량 섹션만 분리하고 메뉴 섹션은 조회 완료');
  await wait(()=>preview().complete&&preview().naturalWidth>0);
  check(preview().src.includes('images/menu-gyudon.jpg')&&preview().naturalWidth===1024&&preview().naturalHeight===768,'초기 관리자 화면에 실제 규동 기본사진 표시');
  const dt=new w.DataTransfer();dt.items.add(new w.File([gyudonBlob],'규동.jpg',{type:'image/jpeg'}));input().files=dt.files;input().dispatchEvent(new w.Event('change',{bubbles:true}));
  await wait(()=>!input().disabled&&status().textContent.includes('규동.jpg → 규동.png'));
  check(preview().src.startsWith('blob:')&&status().textContent.includes('/ 600KB 이하'),'규동 JPG 선택 즉시 PNG 600KB 이하 변환 미리보기');
  if(document.body.classList.contains('view')){
   F.failSearch=500;F.failFiles=500;
   save().click();await wait(()=>!d.getElementById('fields-container').inert&&status().textContent.includes('저장 완료'));
   const section=input().closest('section'),fields=d.getElementById('fields-container');
   Array.from(fields.children).forEach(el=>{if(el!==section)el.style.display='none';});
   Array.from(fields.parentElement.children).forEach(el=>{if(el!==fields)el.style.display='none';});
   Array.from(section.querySelector('.space-y-5').children).forEach(row=>{if(!row.textContent.includes('규동'))row.style.display='none';});
   const nav=d.getElementById('group-nav');if(nav?.parentElement)nav.parentElement.style.display='none';
   const timer=setInterval(()=>w.scrollTo(0,0),150);await new Promise(r=>setTimeout(r,2500));clearInterval(timer);
   document.body.dataset.testStatus='passed';return;
  }
  save().click();await wait(()=>!d.getElementById('fields-container').inert&&status().textContent.includes('저장 완료'));
  const uploaded=F.requests.find(r=>r.url.includes('/files/cms-images')&&r.method==='POST');
  check(uploaded&&uploaded.body.type==='image/png'&&uploaded.body.name==='규동.png'&&uploaded.body.size<=600*1024,'실제 업로드 본문은 600KB 이하 규동.png');
  check(F.tables.site_content.find(r=>r.key===key)?.value==='/files/cms-images/mock-1','타 섹션 413과 무관하게 규동 사진 참조 저장 성공');
  check(F.requests.filter(r=>r.method!=='GET'&&r.url.includes('/tables/')).every(r=>!/(?:data:|blob:)/i.test(JSON.parse(r.body).value||'')),'DB에는 바이너리·Blob URL 없음');
  clear().click();await wait(()=>!d.getElementById('fields-container').inert&&status().textContent.includes('사진을 비웠습니다'));
  check(preview().hidden&&F.tables.site_content.find(r=>r.key===key)?.value==='','규동 사진 비우기 즉시 저장');
  const uploadsBeforeRestore=F.uploads;restore().click();await wait(()=>!d.getElementById('fields-container').inert&&status().textContent.includes('기본 사진'));
  check(!preview().hidden&&preview().src.includes('images/menu-gyudon.jpg')&&!F.tables.site_content.find(r=>r.key===key)&&F.uploads===uploadsBeforeRestore,'기본 사진 복원은 업로드 없이 기본 규동 사진으로 복구');
  F.failSearch=500;F.failFiles=500;
  const dt500=new w.DataTransfer();dt500.items.add(new w.File([gyudonBlob],'규동.jpg',{type:'image/jpeg'}));input().files=dt500.files;input().dispatchEvent(new w.Event('change',{bubbles:true}));
  await wait(()=>!input().disabled&&status().textContent.includes('선택 완료'));
  const reqStart=F.requests.length;save().click();await wait(()=>!d.getElementById('fields-container').inert&&status().textContent.includes('저장 완료'));
  check(F.tables.site_content.find(r=>r.key===key)?.value.includes('images/menu-gyudon.jpg'),'search 500 + 파일 업로드 500 환경에서도 규동 사진 저장 완료');
  check(!F.requests.slice(reqStart).some(r=>r.url.includes('search='+encodeURIComponent(key))),'저장 시 대용량 행 스캔을 유발하는 search 재조회 호출 없음');
  F.failSearch=0;F.failFiles=0;
  w=await mount('?failread=503');d=w.document;F=w.adminFixture;
  await wait(()=>d.getElementById('save-status').textContent.includes('불러오지 못했습니다'));
  const dt2=new w.DataTransfer();dt2.items.add(new w.File([gyudonBlob],'규동.jpg',{type:'image/jpeg'}));input().files=dt2.files;input().dispatchEvent(new w.Event('change',{bubbles:true}));
  await wait(()=>!input().disabled&&status().textContent.includes('선택 완료'));
  save().click();await wait(()=>!d.getElementById('fields-container').inert&&status().textContent.includes('저장 완료'));
  check(F.tables.site_content.find(r=>r.key===key)?.value==='/files/cms-images/mock-1','초기 전체 조회 실패 후에도 해당 규동 키 개별 확인으로 사진 저장 성공');
  F.fail={method:'GET',table:'site_content',status:503};const writesBeforeFail=F.requests.filter(r=>r.method!=='GET').length;
  clear().click();await wait(()=>!d.getElementById('fields-container').inert&&status().textContent.includes('실패'));
  check(F.requests.filter(r=>r.method!=='GET').length===writesBeforeFail,'개별 키 조회도 실패하면 저장·덮어쓰기 차단');
  out.textContent+='\nALL '+logs.length+' TESTS PASSED';document.body.dataset.testStatus='passed';console.log('ALL '+logs.length+' TESTS PASSED');
 }catch(e){out.textContent+='\nFAIL '+e.message;document.body.dataset.testStatus='failed';console.error('TEST FAILED',e.stack||e.message);}
 finally{Object.entries(cacheBackup).forEach(([key,value])=>{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);});}
})();
