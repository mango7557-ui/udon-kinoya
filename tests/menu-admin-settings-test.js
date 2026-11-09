(async function () {
  const tests = [];
  const check = (name, ok) => tests.push({name, ok: !!ok});
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  try {
    const button = document.getElementById('save-all-btn');
    for (let i = 0; i < 100 && button.disabled; i++) await delay(20);
    const input = document.getElementById('text-menu-autoslide-seconds');
    check('시간 설정은 숫자 입력 필드', input?.type === 'number');
    check('기본값 4초와 1~120초 범위', input.value === '4' && input.min === '1' && input.max === '120');
    const enter = value => { input.value = value; input.dispatchEvent(new Event('input', {bubbles: true})); };
    enter('2.5');
    button.click();
    await delay(100);
    const saved = window.menuSettingTestRequests[0];
    check('소수점 시간을 실제 저장 경로로 전달', saved?.method === 'PUT' && saved.body.value === '2.5' && saved.body.key === 'menu.autoslide.seconds');
    check('기존 테이블 형식 text 유지', saved?.body.type === 'text');
    enter('0'); button.click(); await delay(50);
    check('0초 저장 차단', window.menuSettingTestRequests.length === 1);
    enter('121'); button.click(); await delay(50);
    check('120초 초과 저장 차단', window.menuSettingTestRequests.length === 1);
    enter(''); button.click(); await delay(100);
    check('비우기 저장 지원: 기본 시간으로 복구', window.menuSettingTestRequests.length === 2 && window.menuSettingTestRequests[1].body.value === '');
    check('API 성공 후 저장 버튼 재활성화', !button.disabled);
  } catch (error) { check(error.message, false); }
  document.getElementById('results').textContent = tests.map(test => (test.ok ? 'PASS ' : 'FAIL ') + test.name).join('\n');
  const failed = tests.filter(test => !test.ok);
  document.body.dataset.testStatus = failed.length ? 'failed' : 'passed';
  failed.forEach(test => console.error('[menu admin tests] FAIL: ' + test.name));
  console.log('[menu admin tests] ' + (tests.length - failed.length) + '/' + tests.length + ' passed');
})();
