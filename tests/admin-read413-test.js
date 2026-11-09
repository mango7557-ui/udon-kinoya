(async function(){
 'use strict';
 const frame=document.getElementById('admin'),out=document.getElementById('results'),logs=[];
 const cacheBackup=Object.fromEntries(['cms_cache','kinoya_menu_cache_v1'].map(key=>[key,localStorage.getItem(key)]));
 const wait=async fn=>{for(let i=0;i<600;i++){if(fn())return;await new Promise(r=>setTimeout(r,50));}throw Error('대기시간 초과');};
 const check=(ok,label)=>{if(!ok)throw Error(label);logs.push('PASS '+label);console.log(logs.at(-1));out.textContent=logs.join('\n');};
 try{
  const url=new URL('../admin/index.html',location.href),html=await(await fetch(url)).text(),fixture=new URL('admin-reliability-fixture.js?maxread=5',location.href);
  frame.srcdoc=html.replace('<head>','<head><base href="'+url.href+'"><'+'script src="'+fixture.href+'"></'+'script>');
  await wait(()=>frame.contentWindow?.AdminCore&&frame.contentDocument?.getElementById('save-all-btn')?.disabled===false);
  const w=frame.contentWindow,d=w.document,F=w.adminFixture,A=w.AdminCore;
  const reads=()=>F.requests.filter(r=>r.method==='GET'&&r.url.includes('/tables/site_content'));
  const writes=()=>F.requests.filter(r=>r.method!=='GET');
  check(d.getElementById('save-status').textContent.includes('불러왔습니다'),'실제 관리자 초기 조회 413 후 준비 완료·저장 활성화');
  const initial=reads().map(r=>new URL(r.url).searchParams);
  check(initial.some(p=>p.get('limit')==='100')&&initial.some(p=>p.get('limit')==='20')&&initial.some(p=>p.get('limit')==='5'&&p.get('page')==='21'),'100→20→5 축소 후 마지막 페이지까지 조회');
  check(writes().length===0,'조회 복구는 업로드·DB 쓰기 없음');
  const rows=await A.all('site_content');check(rows.length===105&&new Set(rows.map(r=>r.id)).size===105,'축소 조회의 전체 105행 누락·중복 없음');
  if(document.body.dataset.view==='true'){out.hidden=true;document.body.dataset.testStatus='passed';return;}
  const marker=F.requests.length;F.read413={table:'site_content',maxLimit:20,minPage:2};
  const restarted=await A.all('site_content'),requests=F.requests.slice(marker).map(r=>new URL(r.url).searchParams);
  check(restarted.length===105&&new Set(restarted.map(r=>r.id)).size===105,'페이지 중간 413도 이전 결과를 버리고 전체 재조회');
  check(requests.some(p=>p.get('limit')==='100'&&p.get('page')==='2')&&requests.some(p=>p.get('limit')==='20'&&p.get('page')==='1'),'묶음 크기 변경 후 page=1에서 재시작');
  F.read413={table:'site_content',maxLimit:1,minPage:1};check((await A.all('site_content')).length===105,'1개씩 조회하는 최종 단계도 전체 수집');
  F.read413={table:'site_content',maxLimit:0,minPage:1};const before=reads().length;let failure;
  try{await A.all('site_content');}catch(e){failure=e;}
  check(failure?.status===413&&reads().length===before+4,'1개 조회도 실패하면 4단계 후 중단·무한 재시도 없음');
  check(failure.message.includes('1개씩')&&failure.message.includes('새 사진 용량 문제가 아니'),'최종 413은 기존 조회 문제로 명확히 안내');
  F.read413=null;
  for(const code of [401,403,500]){
   const before=reads().length;F.fail={method:'GET',table:'site_content',status:code};let error;
   try{await A.all('site_content');}catch(e){error=e;}
   check(error?.status===code&&reads().length===before+1,'조회 '+code+'는 묶음 축소나 자동 재시도 없음');
  }
  const beforePost=writes().length;F.fail={method:'POST',table:'news_items',status:413};let postError;
  try{await A.write('news_items',null,{title:'실패 검사'});}catch(e){postError=e;}
  check(postError?.status===413&&writes().length===beforePost+1&&F.tables.news_items.length===1,'POST 413은 자동 재전송·중복 등록 없음');
  F.read413={table:'site_content',maxLimit:5,minPage:1};
  const title=d.getElementById('text-menu-catalog-signature-gyudon-name');title.value='조회 복구 후 규동';title.dispatchEvent(new w.Event('input',{bubbles:true}));
  d.getElementById('save-all-btn').click();await wait(()=>!d.getElementById('save-all-btn').disabled&&F.tables.site_content.some(r=>r.key==='menu.catalog.signature.gyudon.name'&&r.value==='조회 복구 후 규동'));
  check(true,'실제 관리자 조회 복구 후 변경 항목 저장 가능');
  const canvas=d.createElement('canvas');canvas.width=32;canvas.height=24;canvas.getContext('2d').fillRect(0,0,32,24);
  const blob=await new Promise(ok=>canvas.toBlob(ok,'image/png')),input=d.getElementById('file-menu-catalog-signature-gyudon-bg'),dt=new w.DataTransfer();dt.items.add(new w.File([blob],'413-recovered.png',{type:'image/png'}));input.files=dt.files;input.dispatchEvent(new w.Event('change',{bubbles:true}));
  const photoStatus=d.getElementById('photo-status-menu-catalog-signature-gyudon-bg');await wait(()=>!input.disabled&&photoStatus.textContent.includes('선택 완료'));
  check(d.getElementById('preview-menu-catalog-signature-gyudon-bg').src.startsWith('blob:'),'조회 413 복구 뒤 메뉴 사진 로컬 선택 유지');
  d.querySelector('[data-save-menu-photo="menu-catalog-signature-gyudon-bg"]').click();await wait(()=>!d.getElementById('fields-container').inert&&photoStatus.textContent.includes('저장 완료'));
  check(F.uploads===1&&F.tables.site_content.find(r=>r.key==='menu.catalog.signature.gyudon.bg')?.value==='/files/cms-images/mock-1','조회 복구 후 실제 메뉴 사진 저장 경로 실행·반환 참조 연결');
  check(F.requests.filter(r=>r.method!=='GET'&&r.url.includes('/tables/')).every(r=>!/(?:data:|blob:)/i.test(JSON.parse(r.body).value||'')),'413 복구 후에도 DB에는 Base64·Blob URL 저장 없음');
  document.body.dataset.testStatus='passed';console.log('ALL '+logs.length+' TESTS PASSED');out.textContent+='\nALL '+logs.length+' TESTS PASSED';
 }catch(e){document.body.dataset.testStatus='failed';out.textContent+='\nFAIL '+e.message;console.error('TEST FAILED',e.stack||e.message);}
 finally{Object.entries(cacheBackup).forEach(([key,value])=>{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);});}
})();
