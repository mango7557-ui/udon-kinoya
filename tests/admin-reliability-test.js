(async function(){
 'use strict';
 const out=document.getElementById('results'),logs=[],wait=async fn=>{for(let i=0;i<400;i++){if(fn())return;await new Promise(r=>setTimeout(r,50));}throw new Error('검사 대기시간 초과');};
 const check=(value,label)=>{if(!value)throw new Error(label);logs.push('PASS '+label);console.log('PASS '+label);out.textContent=logs.join('\n');};
 try{
  const frame=document.getElementById('admin'),url=new URL('../admin/index.html',location.href),fixture=new URL('admin-reliability-fixture.js',location.href);
  const html=await(await fetch(url)).text();frame.srcdoc=html.replace('<head>','<head><base href="'+url.href+'"><'+'script src="'+fixture.href+'"></'+'script>');
  await wait(()=>frame.contentWindow?.AdminCore&&frame.contentDocument?.getElementById('save-all-btn')?.disabled===false&&frame.contentDocument.querySelector('form[data-id="news-1"]'));
  const w=frame.contentWindow,d=w.document,A=w.AdminCore,F=w.adminFixture,B=w.KinoyaBackup;
  const writes=()=>F.requests.filter(r=>r.method!=='GET'&&!r.url.includes('/files/')).length;
  check(writes()===0,'초기 화면은 데이터 쓰기 없음');
  check(d.getElementById('save-status').textContent.includes('불러왔습니다'),'실제 전체 관리자 조회 완료');
  check((await A.all('site_content')).length===105,'100행 이후까지 전체 조회');
  check(F.requests.filter(r=>r.url.includes('/tables/site_content')&&r.url.includes('page=2')).length>0,'실제 페이지2 요청 확인');
  check(A.tableURL('tables/site_content').startsWith(A.root.href+'tables/'),'프리뷰 프로젝트 경로와 tables 네임스페이스 보존');
  check(!d.getElementById('yt-list-tbody').textContent.includes('실패'),'빈 유튜브 목록 정상 처리');
  F.malformed=true;let rejected=false;try{await A.all('site_content');}catch(e){rejected=true;}check(rejected,'잘못된 data 구조 거부');
  const before=writes();F.fail={method:'POST',table:'news_items',status:500};rejected=false;try{await A.write('news_items',null,{title:'실패 테스트'});}catch(e){rejected=e.status===500;}
  check(rejected&&writes()===before+1,'500 저장 실패 인식·POST 자동 재시도 없음');
  F.fail={method:'DELETE',table:'news_items',status:403};rejected=false;try{await A.fetch('tables/news_items/news-1',{method:'DELETE'});}catch(e){rejected=e.status===403;}check(rejected&&F.tables.news_items.length===1,'삭제 403 인식·기존 데이터 유지');
  F.fail={method:'POST',table:'news_items',status:401};try{await A.write('news_items',null,{title:'인증 테스트'});}catch(e){}
  check(!!d.querySelector('#admin-login-notice a'),'401 로그인 링크 표시·본문 자동 재전송 없음');
  const safe=A.cleanHTML('<p onclick="alert(1)">안내<br><a href="javascript:alert(1)">링크</a><img src=x onerror="alert(1)"></p>');
  check(!/onclick|onerror|javascript:|<img/i.test(safe)&&safe.includes('<br>'),'HTML 실행 속성·위험 링크 제거 및 줄바꿈 유지');
  rejected=false;try{A.safeURL('javascript:alert(1)');}catch(e){rejected=true;}check(rejected,'위험 URL 거부');
  rejected=false;try{await A.write('news_items',null,{thumbnail:'data:image/png;base64,AAA'});}catch(e){rejected=true;}check(rejected,'DB Base64 저장 차단');
  const file=new w.File(['test binary'],'test.pdf',{type:'application/pdf'}),beforeUpload=writes();F.fail={method:'POST',status:503};
  rejected=false;try{await A.upload(file,'resources');}catch(e){rejected=e.message.includes('Hosted');}check(rejected&&writes()===beforeUpload,'업로드 미활성 안내·DB fallback 없음');
  const req1=F.requests.at(-1);const ref=await A.upload(file,'resources');const req2=F.requests.at(-1);
  check(req1.headers['Idempotency-Key']===req2.headers['Idempotency-Key'],'직접 재시도 시 동일 파일·동일 멱등키');
  check(ref.startsWith('/files/'),'서버가 반환한 파일 참조만 사용');
  const upCount=F.uploads;check(await A.upload(file,'resources')===ref&&F.uploads===upCount,'참조 저장 재시도 때 파일 중복 업로드 방지');
  const beforePlan=writes();rejected=false;try{await B.plan({news_items:[{id:'x',title:'a'},{id:'x',title:'b'}]});}catch(e){rejected=true;}check(rejected&&writes()===beforePlan,'복원 중복 ID 사전 차단·쓰기 없음');
  rejected=false;try{await B.plan({news_items:[{id:'x',unexpected:'bad'}]});}catch(e){rejected=true;}check(rejected,'복원 알 수 없는 컬럼 차단');
  rejected=false;try{await B.plan({news_items:[{id:'x',thumbnail:'data:image/png;base64,AAA'}]});}catch(e){rejected=true;}check(rejected&&writes()===beforePlan,'복원 신규 바이너리 본문 차단·쓰기 없음');
  const plan=await B.plan({news_items:[{...F.tables.news_items[0],title:'복원 제목'}]});check(plan.tasks.length===1&&plan.summary[0].includes('변경 1')&&writes()===beforePlan,'복원 변경 건수 미리보기는 쓰기 없음');
  const snap=await B.snapshot();check(Object.keys(snap.tables).length>=7&&snap.counts.site_content===105,'전체 테이블 완전 백업과 건수 검증');
  F.fail={method:'GET',table:'resources',status:500};rejected=false;try{await B.snapshot();}catch(e){rejected=true;}check(rejected,'백업 일부 테이블 실패 시 전체 성공 금지');
  const news=d.querySelector('form[data-id="news-1"]');news.elements.title.value='수정 뉴스';news.elements.title.dispatchEvent(new w.Event('input',{bubbles:true}));news.requestSubmit();await wait(()=>F.tables.news_items[0].title==='수정 뉴스');check(true,'실제 뉴스 편집 UI 수정 저장');
  await wait(()=>!d.querySelector('form[data-id="news-1"]').dataset.busy);
  const fresh=d.querySelector('form[data-id="news-1"]');fresh.elements.is_published.checked=false;fresh.requestSubmit();await wait(()=>F.tables.news_items[0].is_published===false);check(true,'실제 공개 표시 해제 저장');
  const newForm=d.querySelector('form[data-collection="news_items"]:not([data-id])');newForm.elements.title.value='실패 입력 유지';F.fail={method:'POST',table:'news_items',status:500};newForm.requestSubmit();await wait(()=>newForm.textContent.includes('저장 실패'));check(newForm.elements.title.value==='실패 입력 유지','등록 실패 시 입력 유지');
  check(d.getElementById('consultations-section').textContent.includes('테스트 신청'),'상담신청 목록 표시');
  const inbox=d.querySelector('#consultations-section article'),select=inbox.querySelector('select');select.value='contacted';inbox.querySelector('button').click();await wait(()=>F.tables.consultations[0].status==='contacted');check(true,'상담 처리 상태 저장');
  check(F.requests.filter(r=>r.method!=='GET'&&r.url.includes('/tables/')).every(r=>!/^\s*data:/i.test(JSON.parse(r.body||'{}').thumbnail||'')),'모든 테스트 DB 요청은 바이너리 본문 없음');
  out.textContent+='\nALL '+logs.length+' TESTS PASSED';document.body.dataset.testStatus='passed';console.log('ALL '+logs.length+' TESTS PASSED');
 }catch(e){out.textContent+='\nFAIL '+e.message;document.body.dataset.testStatus='failed';console.error('TEST FAILED',e.stack||e.message);}
})();
