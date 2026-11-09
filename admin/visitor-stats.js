/* =========================================================
   우동키노야 관리자: 방문자 통계 리포트
   - visitor_logs 테이블(js/main.js가 모든 페이지에서 자동 기록)을 읽어
     선택한 기간의 일별 방문 추이 / 인기 페이지 / 인기 클릭 / 기기 비율을 보여줍니다.
   - "엑셀로 내보내기"는 원본 로그 전체를 다운로드합니다(Chart.js, xlsx는 admin/index.html에서 로드).
   ========================================================= */
(function () {
  'use strict';

  var chartInstance = null;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function setStatus(text, type) {
    var el = document.getElementById('vstat-status');
    if (!el) return;
    var colors = { ok: 'text-emerald-600', error: 'text-red-600', info: 'text-slate-500' };
    el.className = 'text-xs ' + (colors[type] || colors.info);
    el.textContent = text;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(date) { return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()); }

  function defaultDateRange() {
    var end = new Date();
    var start = new Date();
    start.setDate(start.getDate() - 29); // 최근 30일
    return { start: ymd(start), end: ymd(end) };
  }

  function fetchAllLogs() {
    return AdminCore.all('visitor_logs');
  }

  function withinRange(row, startMs, endMs) {
    var t = row.created_at;
    if (!t) return false;
    return t >= startMs && t <= endMs;
  }

  function renderTopTable(tbodyId, counts, labelHeader) {
    var tbody = document.getElementById(tbodyId);
    var entries = Object.keys(counts).map(function (k) { return [k, counts[k]]; });
    entries.sort(function (a, b) { return b[1] - a[1]; });
    entries = entries.slice(0, 10);
    if (!entries.length) {
      tbody.innerHTML = '<tr><td class="py-3 text-center text-slate-400">데이터가 없습니다.</td></tr>';
      return;
    }
    tbody.innerHTML = entries.map(function (e) {
      return '<tr class="border-b border-slate-50">' +
        '<td class="py-1.5 pr-2 truncate max-w-[220px]" title="' + escapeHtml(e[0]) + '">' + escapeHtml(e[0] || '(알 수 없음)') + '</td>' +
        '<td class="py-1.5 text-right font-semibold text-slate-700">' + e[1] + '</td>' +
        '</tr>';
    }).join('');
  }

  function renderDailyChart(dailyCounts, sortedDays) {
    var canvas = document.getElementById('vstat-daily-chart');
    if (!canvas || !window.Chart) return;
    if (chartInstance) { chartInstance.destroy(); }
    chartInstance = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: sortedDays,
        datasets: [{
          label: '일별 페이지뷰',
          data: sortedDays.map(function (d) { return dailyCounts[d] || 0; }),
          borderColor: '#059669',
          backgroundColor: 'rgba(5,150,105,0.12)',
          fill: true,
          tension: 0.25
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
  }

  function loadReport() {
    var startInput = document.getElementById('vstat-start');
    var endInput = document.getElementById('vstat-end');
    var startStr = startInput.value;
    var endStr = endInput.value;
    if (!startStr || !endStr) { setStatus('시작일과 종료일을 선택해주세요.', 'error'); return; }

    var startMs = new Date(startStr + 'T00:00:00').getTime();
    var endMs = new Date(endStr + 'T23:59:59.999').getTime();
    if (startMs > endMs) { setStatus('시작일이 종료일보다 늦을 수 없습니다.', 'error'); return; }

    setStatus('불러오는 중...', 'info');
    fetchAllLogs().then(function (rows) {
      var filtered = rows.filter(function (r) { return withinRange(r, startMs, endMs); });

      var pageviews = filtered.filter(function (r) { return r.event_type === 'pageview'; });
      var clicks = filtered.filter(function (r) { return r.event_type === 'click'; });
      var sessions = new Set(filtered.map(function (r) { return r.session_id; }));
      var mobileSessions = new Set(filtered.filter(function(r){return r.device_type==='mobile';}).map(function(r){return r.session_id;}));
      var mobileRatio = sessions.size ? Math.round((mobileSessions.size / sessions.size) * 100) : 0;

      document.getElementById('vstat-total-pv').textContent = pageviews.length.toLocaleString();
      document.getElementById('vstat-total-sessions').textContent = sessions.size.toLocaleString();
      document.getElementById('vstat-total-clicks').textContent = clicks.length.toLocaleString();
      document.getElementById('vstat-mobile-ratio').textContent = mobileRatio + '%';

      // 일별 페이지뷰 집계
      var dailyCounts = {};
      pageviews.forEach(function (r) {
        var d = new Date(r.created_at);
        var key = ymd(d);
        dailyCounts[key] = (dailyCounts[key] || 0) + 1;
      });
      var sortedDays = Object.keys(dailyCounts).sort();
      // 데이터가 없는 날짜도 0으로 표시되도록 시작~종료일 전체를 채웁니다.
      var allDays = [];
      var cursor = new Date(startStr + 'T00:00:00');
      var endDate = new Date(endStr + 'T00:00:00');
      while (cursor <= endDate) { allDays.push(ymd(cursor)); cursor.setDate(cursor.getDate() + 1); }
      renderDailyChart(dailyCounts, allDays);

      // 인기 페이지
      var pageCounts = {};
      pageviews.forEach(function (r) { pageCounts[r.page_path] = (pageCounts[r.page_path] || 0) + 1; });
      renderTopTable('vstat-top-pages', pageCounts);

      // 인기 클릭
      var clickCounts = {};
      clicks.forEach(function (r) { clickCounts[r.label || '(라벨 없음)'] = (clickCounts[r.label || '(라벨 없음)'] || 0) + 1; });
      renderTopTable('vstat-top-clicks', clickCounts);

      setStatus('✅ ' + startStr + ' ~ ' + endStr + ' 기준으로 조회했습니다. (총 ' + filtered.length + '개 로그)', 'ok');
    }).catch(function (err) {
      console.error('[admin][vstat] 실패:', err);
      setStatus('❌ 불러오기 실패: ' + (err && err.message ? err.message : String(err)), 'error');
    });
  }

  function exportRawLogs() {
    if (!window.XLSX) { setStatus('엑셀 라이브러리를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.', 'error'); return; }
    setStatus('내보낼 로그를 불러오는 중...', 'info');
    fetchAllLogs().then(function (rows) {
      var sheetRows = rows.map(function (r) {
        return {
          id: r.id,
          session_id: r.session_id,
          event_type: r.event_type,
          page_path: r.page_path,
          label: r.label,
          referrer: r.referrer,
          device_type: r.device_type,
          created_at: r.created_at ? new Date(r.created_at).toISOString() : ''
        };
      });
      var ws = XLSX.utils.json_to_sheet(sheetRows);
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'visitor_logs');
      var today = new Date();
      var fname = '우동키노야_방문자로그_' + today.getFullYear() + pad(today.getMonth() + 1) + pad(today.getDate()) + '.xlsx';
      XLSX.writeFile(wb, fname);
      setStatus('✅ 엑셀 파일이 다운로드되었습니다: ' + fname + ' (총 ' + rows.length + '건)', 'ok');
    }).catch(function (err) {
      console.error('[admin][vstat-export] 실패:', err);
      setStatus('❌ 내보내기 실패: ' + (err && err.message ? err.message : String(err)), 'error');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var loadBtn = document.getElementById('vstat-load-btn');
    var exportBtn = document.getElementById('vstat-export-btn');
    var startInput = document.getElementById('vstat-start');
    var endInput = document.getElementById('vstat-end');
    if (!loadBtn || !startInput || !endInput) return;

    var range = defaultDateRange();
    startInput.value = range.start;
    endInput.value = range.end;

    loadBtn.addEventListener('click', loadReport);
    if (exportBtn) exportBtn.addEventListener('click', exportRawLogs);

    loadReport(); // 기본(최근 30일) 리포트를 바로 보여줍니다.
  });
})();
