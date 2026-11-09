/* Build the dedicated editor from the same public section, without duplicating profile content. */
(function () {
  'use strict';
  const root = new URL('../',document.currentScript.src);
  window.CMS_AUTO_SAVE_PEOPLE_PHOTOS = true;
  async function start() {
    const response = await fetch(new URL('people/index.html',root),{cache:'no-store'});
    if (!response.ok) throw new Error('소개 페이지 HTTP '+response.status);
    const source = new DOMParser().parseFromString(await response.text(),'text/html');
    const section = source.getElementById('team-introduction');
    if (!section) throw new Error('사람들 소개 영역을 찾지 못했습니다.');
    window.CMS_FIELDS = Array.from(section.querySelectorAll('[data-cms]')).map(element => {
      const profile = element.closest('.people-profile-card');
      let group = '소개 제목 · 공통 글씨';
      if (profile) {
        const name = profile.querySelector('.people-profile-name').textContent;
        group = (profile.closest('.people-leadership-grid') ? '경영진 · ' : '전문가 · ')+name;
      }
      const image = element.dataset.cmsType === 'img';
      const text = element.cloneNode(true);
      text.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
      return {key:element.dataset.cms,group,label:element.dataset.cmsLabel || element.dataset.cms,type:image?'image':'text',current:image?new URL(element.getAttribute('src'),new URL('people/',root)).href:text.textContent.trim()};
    });
    const script = document.createElement('script');
    script.src = new URL('admin/editor.js',root).href;
    script.onerror = () => { document.getElementById('save-status').textContent='편집 스크립트를 불러오지 못했습니다. 새로고침해주세요.'; };
    document.body.append(script);
  }
  start().catch(error => {
    document.getElementById('save-status').textContent='편집 화면을 준비하지 못했습니다: '+error.message;
  });
})();
