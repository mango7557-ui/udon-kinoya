/* =========================================================
   창업 FAQ 페이지: 테이블(faq_items) 기반 동적 렌더링
   - 관리자 페이지(/admin)의 "FAQ 관리"에서 등록/수정/삭제한 내용을 읽어와
     기존 정적 FAQ 목록을 대체해 표시합니다.
   - faq_items 테이블에 데이터가 하나도 없으면(아직 관리자에서 아무것도 저장하지 않은 초기 상태)
     기존 정적 FAQ 목록을 그대로 유지합니다(즉, 이 스크립트는 아무 것도 하지 않습니다).
   - 카테고리 탭 필터(js/main.js)는 버튼 자체를 건드리지 않고 .faq-list 내부의
     [data-cat] 항목만 다시 그려서 그대로 동작합니다. 아코디언 펼치기/접기는
     이 스크립트가 새로 그려진 항목에 대해 다시 연결합니다.
   ========================================================= */
(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function bindAccordion(item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      if (!isOpen) {
        a.style.maxHeight = a.scrollHeight + 40 + 'px';
        q.setAttribute('aria-expanded', 'true');
      } else {
        a.style.maxHeight = '0px';
        q.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var listEl = document.querySelector('.faq-list');
    if (!listEl) return;

    window.KinoyaRuntimeReady.then(function(R){return R.all('faq_items');}).then(function(rows){return {data:rows};})
      .then(function (json) {
        var rows = (json && json.data) || [];
        var hasManagedRows = rows.length > 0;
        rows = rows.filter(function (r) { return r.is_published !== false; });
        if (!rows.length) { if(hasManagedRows)listEl.replaceChildren();return; } // 관리자에서 등록된 내용이 없으면 기존 정적 목록 유지

        rows.sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });

        listEl.innerHTML = rows.map(function (item, idx) {
          var domId = 'faq-dyn-' + (idx + 1);
          return '<div class="faq-item" data-cat="' + escapeHtml(item.category) + '">' +
            '<button class="faq-q" aria-expanded="false" aria-controls="' + domId + '">' +
              escapeHtml(item.question) + '<span class="q-icon"></span>' +
            '</button>' +
            '<div class="faq-a" id="' + domId + '"><div class="faq-a-inner">' + KinoyaRuntime.cleanHTML(item.answer || '') + '</div></div>' +
          '</div>';
        }).join('');

        listEl.querySelectorAll('.faq-item').forEach(bindAccordion);

        // 주소창에 #cat-xxx 로 진입한 경우를 위해 카테고리 탭을 다시 한번 적용합니다.
        if (window.location.hash && window.location.hash.indexOf('#cat-') === 0) {
          var wantedCat = window.location.hash.slice(5);
          var targetTab = document.querySelector('.faq-category-tabs button[data-cat="' + wantedCat + '"]');
          if (targetTab) { targetTab.click(); }
        }
      })
      .catch(function (err) {
        console.warn('[faq] FAQ 목록을 불러오지 못했습니다(기존 목록 유지):', err);
      });
  });
})();
