/* =========================================================
   우동키노야 관리자: FAQ 관리
   - franchise/faq/index.html 의 FAQ 목록을 테이블(faq_items) 기반으로 관리합니다.
   - 카테고리는 기존 페이지의 6개 탭(brand/cost/sales/ops/store/support)을 그대로 사용합니다.
   - 답변은 간단한 HTML(예: <div class="faq-meta">...</div> 링크 등)을 허용합니다.
   - 이 스크립트가 저장한 데이터를 공개 FAQ 페이지(js/main.js)가 읽어와
     기존 정적 목록을 대체해 표시합니다. 데이터가 하나도 없으면 기존 정적 목록이 그대로 유지됩니다.
   ========================================================= */
(function () {
  'use strict';
  var fetch = AdminCore.fetch;

  var CATEGORIES = [
    { value: 'brand', label: '브랜드·제품' },
    { value: 'cost', label: '창업비용' },
    { value: 'sales', label: '매출·수익' },
    { value: 'ops', label: '운영' },
    { value: 'store', label: '점포' },
    { value: 'support', label: '본사 지원' }
  ];

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function categoryLabel(v) {
    var found = CATEGORIES.filter(function (c) { return c.value === v; })[0];
    return found ? found.label : v;
  }

  function categoryOptionsHtml(selected) {
    return CATEGORIES.map(function (c) {
      return '<option value="' + c.value + '"' + (c.value === selected ? ' selected' : '') + '>' + c.label + '</option>';
    }).join('');
  }

  function fetchAll() {
    return AdminCore.all('faq_items');
  }

  function renderList() {
    var tbody = document.getElementById('faq-manage-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-slate-400">불러오는 중...</td></tr>';
    fetchAll().then(function (rows) {
      rows.sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-slate-400">등록된 FAQ가 없습니다. (등록 전까지는 페이지의 기존 FAQ가 그대로 표시됩니다)</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map(function (item) {
        return '<tr class="border-b border-slate-100 align-top" data-id="' + escapeHtml(item.id) + '">' +
          '<td class="py-2 pr-2 w-24">' +
            '<input type="number" class="faq-order-input w-16 border border-slate-300 rounded px-2 py-1 text-sm" value="' + (item.sort_order || 0) + '">' +
          '</td>' +
          '<td class="py-2 pr-2 w-36">' +
            '<select class="faq-cat-select w-full border border-slate-300 rounded px-2 py-1 text-sm">' + categoryOptionsHtml(item.category) + '</select>' +
          '</td>' +
          '<td class="py-2 pr-2">' +
            '<input type="text" class="faq-q-input w-full border border-slate-300 rounded px-2 py-1 text-sm mb-1" value="' + escapeHtml(item.question) + '" placeholder="질문">' +
            '<textarea class="faq-a-input w-full border border-slate-300 rounded px-2 py-1 text-sm field-textarea" placeholder="답변 (간단한 HTML 가능)">' + escapeHtml(item.answer) + '</textarea>' +
          '</td>' +
          '<td class="py-2 pr-2 w-40 whitespace-nowrap">' +
            '<label class="block text-xs mb-2"><input type="checkbox" class="faq-published"'+(item.is_published!==false?' checked':'')+'> 공개 표시</label>' +
            '<button type="button" class="faq-save-btn text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded mr-1">저장</button>' +
            '<button type="button" class="faq-del-btn text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded">삭제</button>' +
            '<div class="faq-row-status text-xs text-slate-400 mt-1"></div>' +
          '</td>' +
        '</tr>';
      }).join('');

      tbody.querySelectorAll('tr').forEach(function (tr) {
        var id = tr.getAttribute('data-id');
        var statusEl = tr.querySelector('.faq-row-status');
        tr.querySelector('.faq-save-btn').addEventListener('click', function () {
          var payload = {
            category: tr.querySelector('.faq-cat-select').value,
            question: tr.querySelector('.faq-q-input').value.trim(),
            answer: AdminCore.cleanHTML(tr.querySelector('.faq-a-input').value),
            is_published: tr.querySelector('.faq-published').checked,
            sort_order: Number(tr.querySelector('.faq-order-input').value) || 0
          };
          if (!payload.question || !payload.answer.trim()) { statusEl.textContent='질문과 답변을 입력해주세요.';return; }
          if (tr.dataset.busy) return;
          tr.dataset.busy='1';tr.querySelector('.faq-save-btn').disabled=true;
          statusEl.textContent = '저장 중...';
          fetch('/tables/faq_items/' + encodeURIComponent(id), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
            .then(function (res) { if (!res.ok) throw new Error('저장 실패'); })
            .then(function () { statusEl.textContent = '✅ 저장됨'; })
            .catch(function (err) { statusEl.textContent = '❌ ' + (err.message || String(err)); })
            .finally(function(){delete tr.dataset.busy;tr.querySelector('.faq-save-btn').disabled=false;});
        });
        tr.querySelector('.faq-del-btn').addEventListener('click', function () {
          AdminCore.remove('faq_items',id,tr.querySelector('.faq-del-btn'),renderList);
        });
      });
    }).catch(function (err) {
      tbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-red-600">불러오기 실패: ' + escapeHtml(err.message || String(err)) + '</td></tr>';
    });
  }

  function addNew() {
    var catEl = document.getElementById('faq-new-cat');
    var qEl = document.getElementById('faq-new-q');
    var aEl = document.getElementById('faq-new-a');
    var statusEl = document.getElementById('faq-new-status');
    var addBtn = document.getElementById('faq-new-add-btn');

    var question = qEl.value.trim();
    var answer = aEl.value.trim();
    if (!question || !answer) {
      statusEl.textContent = '❌ 질문과 답변을 모두 입력해주세요.';
      statusEl.className = 'text-xs text-red-600 mt-2';
      return;
    }

    addBtn.disabled = true;
    statusEl.textContent = '등록 중...';
    statusEl.className = 'text-xs text-slate-500 mt-2';

    fetchAll().then(function (rows) {
      var maxOrder = rows.reduce(function (m, r) { return Math.max(m, r.sort_order || 0); }, 0);
      return fetch('/tables/faq_items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: catEl.value,
          question: question,
          answer: AdminCore.cleanHTML(answer),
          sort_order: maxOrder + 1,
          is_published: true
        })
      });
    })
      .then(function (res) { if (!res.ok) throw new Error('등록 실패'); })
      .then(function () {
        statusEl.textContent = '✅ 등록되었습니다.';
        statusEl.className = 'text-xs text-emerald-600 mt-2';
        qEl.value = '';
        aEl.value = '';
        renderList();
      })
      .catch(function (err) {
        statusEl.textContent = '❌ ' + (err.message || String(err));
        statusEl.className = 'text-xs text-red-600 mt-2';
      })
      .finally(function () { addBtn.disabled = false; });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var catEl = document.getElementById('faq-new-cat');
    if (catEl) catEl.innerHTML = categoryOptionsHtml('brand');
    var addBtn = document.getElementById('faq-new-add-btn');
    if (addBtn) addBtn.addEventListener('click', addNew);
    var refreshBtn = document.getElementById('faq-list-refresh-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', renderList);
    renderList();
  });
})();
