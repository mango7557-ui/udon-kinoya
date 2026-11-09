(async function () {
  const results=[];const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const check=(label,value)=>{results.push((value?'PASS: ':'FAIL: ')+label);if(!value)throw new Error(label);};
  async function until(test){for(let i=0;i<200;i++){if(test())return;await sleep(100);}throw new Error('검사 대기 시간 초과');}
  try {
    const frame=document.getElementById('people-editor-frame');
    const url=new URL('../admin/people.html',location.href);
    const html=await (await fetch(url)).text();
    const fixtureURL=new URL('people-editor-fixture.js',location.href);
    frame.srcdoc=html.replace('<head>','<head><base href="'+url.href+'"><'+'script src="'+fixtureURL.href+'"></'+'script>');
    await until(()=>frame.contentDocument?.getElementById('save-all-btn')?.disabled===false);
    const doc=frame.contentDocument,win=frame.contentWindow,fixture=win.peopleFixture;
    check('실제 소개 페이지 기반 37개 편집 항목',win.CMS_FIELDS.length===37);
    check('여섯 명의 사진 입력',doc.querySelectorAll('input[type="file"]').length===6);
    check('소개 및 인물별 일곱 그룹',doc.querySelectorAll('#group-nav a').length===7);
    check('100행 이후의 기존 사진까지 조회',fixture.requests.filter(r=>r.method==='GET').length===2);
    check('기존 사진 표시',doc.getElementById('preview-people-profile-1-image').src.includes('people-kim-minchan'));
    check('소개 제목 기본 문구 표시',doc.getElementById('text-people-team-title').value.includes('도대체 어떤 사람들이'));
    check('HTML 코드 대신 일반 글씨 편집',!doc.getElementById('text-people-team-source').value.includes('<a'));
    const beforeCount=fixture.rows.length;
    async function upload(color){
      const canvas=win.document.createElement('canvas');canvas.width=30;canvas.height=30;const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,30,30);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
      const file=new win.File([blob],'test-replacement.png',{type:'image/png'});
      const transfer=new win.DataTransfer();transfer.items.add(file);
      const input=doc.getElementById('file-people-profile-1-image');input.files=transfer.files;
      input.dispatchEvent(new win.Event('change',{bubbles:true}));
      await until(()=>!input.disabled);
    }
    await upload('#224477');
    const updated=fixture.rows.find(row=>row.id==='portrait-1');
    check('사진 선택만으로 자동 저장',updated.value.startsWith('/files/cms-images/mock-'));
    check('동일 id를 PUT으로 덮어쓰기',fixture.requests.filter(r=>r.method==='PUT'&&r.url.endsWith('/portrait-1')).length===1);
    check('사진 교체가 행/이력을 추가하지 않음',fixture.rows.length===beforeCount);
    check('기존 CMS 사진 값 제거',!JSON.stringify(updated).includes('people-kim-minchan.jpg'));
    check('저장된 새 사진 미리보기',doc.getElementById('preview-people-profile-1-image').getAttribute('src')===updated.value);
    const name=doc.getElementById('text-people-profile-1-name');name.value='수정된 이름';name.dispatchEvent(new win.Event('input',{bubbles:true}));
    const title=doc.getElementById('text-people-team-title');title.value='수정 제목\n둘째 줄';title.dispatchEvent(new win.Event('input',{bubbles:true}));
    doc.getElementById('save-all-btn').click();
    await until(()=>!doc.getElementById('save-all-btn').disabled);
    check('이름 글씨 수정 저장',fixture.rows.find(row=>row.id==='name-1').value==='수정된 이름');
    check('Enter 줄바꿈을 공개 페이지용으로 저장',fixture.rows.find(row=>row.key==='people.team.title').value==='수정 제목<br>둘째 줄');
    const previous=updated.value;
    fixture.failNext=true;await upload('#775522');
    check('교체 실패 시 이전 저장 사진 유지',fixture.rows.find(row=>row.id==='portrait-1').value===previous);
    check('교체 실패 시 이전 미리보기 유지',doc.getElementById('preview-people-profile-1-image').getAttribute('src')===previous);
    check('교체 실패 사용자 안내',doc.getElementById('save-status').textContent.includes('실패'));
    doc.querySelector('[data-clear-menu-photo="people-profile-1-image"]').click();
    await until(()=>!doc.getElementById('file-people-profile-1-image').disabled);
    check('사진 비우기도 자동 저장',fixture.rows.find(row=>row.id==='portrait-1').value==='');
    const nameInput=doc.getElementById('text-people-profile-1-name');nameInput.value='';nameInput.dispatchEvent(new win.Event('input',{bubbles:true}));doc.getElementById('save-all-btn').click();
    await until(()=>!doc.getElementById('save-all-btn').disabled);
    check('빈 글씨도 명시적으로 저장',fixture.rows.find(row=>row.id==='name-1').value==='');
    const publicDoc=new DOMParser().parseFromString(await (await fetch('../people/index.html')).text(),'text/html');
    const rows=Object.fromEntries(fixture.rows.map(row=>[row.key,row]));HomeModel.build(publicDoc).apply(rows);
    check('홈페이지 모델에서 교체/비우기 반영',!publicDoc.querySelector('[data-cms="people.profile.1.image"]').hasAttribute('src'));
    check('홈페이지 모델에서 빈 글씨 반영',publicDoc.querySelector('[data-cms="people.profile.1.name"]').textContent==='');
    check('개별 페이지의 분야 6개 글씨 연결',publicDoc.querySelectorAll('.people-profile-category[data-cms]').length===6);
    check('서버 파일 삭제 불가 안내 표시',doc.body.textContent.includes('원본 이미지 파일')&&doc.body.textContent.includes('자동 삭제되지 않습니다'));
    check('편집 화면 가로 넘침 없음',doc.documentElement.scrollWidth<=doc.documentElement.clientWidth+1);
    console.log('[people editor] '+results.length+'/'+results.length+' passed');
  } catch(error){results.push('FAIL: 검사 실행 · '+error.message);console.error('[people editor]',error.message);}
  document.getElementById('results').textContent=results.join('\n');document.body.dataset.testStatus=results.some(line=>line.startsWith('FAIL'))?'failed':'passed';
})();
