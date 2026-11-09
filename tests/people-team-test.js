(async function () {
  const tests = [];
  const check = (name, ok) => tests.push({name, ok: !!ok});
  try {
    const names = ['김민찬', '육승준', '이정구', '박민호', '이홍규', '김형석'];
    const html = await (await fetch('../people/index.html')).text();
    const source = new DOMParser().parseFromString(html, 'text/html');
    const cards = [...source.querySelectorAll('.people-profile-card')];
    check('출처 기준 프로필 여섯 명', cards.length === 6);
    check('이름·순서 보존', cards.every((card, index) => card.querySelector('.people-profile-name').textContent === names[index]));
    check('모든 사진 프로젝트 내부 파일 사용', cards.every(card => card.querySelector('img').getAttribute('src').startsWith('../images/people-')));
    check('사진·이름·직책·설명 CMS 연결', cards.every((card, index) => ['image', 'name', 'role', 'description'].every(field => card.querySelector('[data-cms="people.profile.' + (index + 1) + '.' + field + '"]'))));
    check('출처 링크 포함', !!source.querySelector('a[href="https://jinkinoya.mycafe24.com/company-basic/company-basic-organization/"]'));
    check('담당 조직 유지·사람들 신념 요약 제거', !!source.getElementById('roles') && !source.getElementById('belief') && !source.querySelector('a[href="#belief"]'));
    check('신규 세 개 바로가기 대상 존재', ['team-introduction', 'leadership-heading', 'experts-heading'].every(id => source.getElementById(id) && source.querySelector('a[href="#' + id + '"]')));
    const home = new DOMParser().parseFromString('<main></main>', 'text/html');
    await HomeFull.prepare(home);
    const people = home.getElementById('people');
    check('실제 홈페이지 조합에 여섯 명 포함', people.querySelectorAll('.people-profile-card').length === 6);
    check('메인 사람들에서도 신념 요약 제거', !people.querySelector('[data-cms="people.belief.title"]') && !people.querySelector('a[href="#home-page-people-belief"]'));
    check('별도 신념과 경쟁력 섹션 유지', !!home.getElementById('noodle') && home.getElementById('noodle').children.length > 0);
    check('메인 소개 앵커 변환', !!home.getElementById('home-page-people-team-introduction'));
    check('메인 사진은 로컬 파일 절대 주소로 변환', [...people.querySelectorAll('.people-profile-portrait')].every(image => image.src.includes('/images/people-')));
    check('메인 인물 사진 eager 유지', [...people.querySelectorAll('.people-profile-portrait')].every(image => image.loading === 'eager'));
    check('메인 내부 섹션 링크 변환', !!people.querySelector('a[href="#home-page-people-leadership-heading"]'));
  } catch (error) { check('검사 실행: ' + error.message, false); }
  document.getElementById('results').textContent = tests.map(test => (test.ok ? 'PASS ' : 'FAIL ') + test.name).join('\n');
  const failed = tests.filter(test => !test.ok);
  document.body.dataset.testStatus = failed.length ? 'failed' : 'passed';
  failed.forEach(test => console.error('[people team tests] FAIL: ' + test.name));
  console.log('[people team tests] ' + (tests.length - failed.length) + '/' + tests.length + ' passed');
})();
