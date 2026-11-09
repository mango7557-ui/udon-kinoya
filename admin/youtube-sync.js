/* =========================================================
   우동키노야 관리자: 유튜브 채널 자동 연동 고도화
   - "한 번에 전체 자동 업데이트": 채널 통계 조회 → 최신 영상/쇼츠 가져오기 → DB(youtube_videos, site_content) 저장
   - 영상 목록 관리(수동 등록/삭제/새로고침)
   - 이 스크립트가 저장한 데이터를 홈페이지(js/main.js)가 그대로 읽어서 표시합니다
     (방문자 브라우저는 더 이상 유튜브 API를 직접 호출하지 않습니다).
   ========================================================= */
(function () {
  'use strict';
  var fetch=AdminCore.fetch;

  var YT_API = 'https://www.googleapis.com/youtube/v3';
  /* 홈페이지 표시 목표: 쇼츠 10개 + 영상(일반) 3행 x 10개 = 30개, 총 40개.
     채널에 충분한 영상이 없으면 그만큼만 채워지고(3행 자동으로 비어있는 줄은 숨김),
     다시 동기화할 때는 최신 항목이 우선 선택되어 오래된 항목은 자동으로 밀려납니다(삭제). */
  var TARGET_SHORTS = 10;
  var TARGET_VIDEOS = 30;
  var MAX_PLAYLIST_PAGES = 10; // 안전장치: 페이지당 최대 50개 x 10페이지 = 최대 500개까지 탐색

  function idFor(key) { return key.replace(/[^a-zA-Z0-9]/g, '-'); }
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getInputValue(key) {
    var el = document.getElementById('text-' + idFor(key));
    var val = el ? el.value.trim() : '';
    if (key === 'social.youtube.apikey' && val && val.indexOf('enc:v1:') === 0 && window.KinoyaCrypto && window.KinoyaCrypto.decryptKey) {
      return window.KinoyaCrypto.decryptKey(val);
    }
    return val;
  }

  /* ---------- 채널 입력값(URL/@핸들/ID) 해석 ---------- */
  function parseYoutubeChannelInput(raw) {
    raw = (raw || '').trim();
    if (!raw) return { type: 'empty', value: '' };
    var m = raw.match(/\/channel\/(UC[0-9A-Za-z_-]{10,})/);
    if (m) return { type: 'id', value: m[1] };
    m = raw.match(/^(UC[0-9A-Za-z_-]{10,})$/);
    if (m) return { type: 'id', value: m[1] };
    m = raw.match(/\/@([A-Za-z0-9_.\-]+)/);
    if (m) return { type: 'handle', value: '@' + m[1] };
    m = raw.match(/^@([A-Za-z0-9_.\-]+)$/);
    if (m) return { type: 'handle', value: '@' + m[1] };
    m = raw.match(/\/(?:c|user)\/([A-Za-z0-9_.\-]+)/);
    if (m) return { type: 'username', value: m[1] };
    if (!/[\/\s]/.test(raw)) return { type: 'handle', value: raw };
    return { type: 'unknown', value: raw };
  }

  function resolveYoutubeChannelId(apiKey, parsed) {
    if (parsed.type === 'id') return Promise.resolve(parsed.value);
    if (parsed.type === 'empty') return Promise.reject(new Error('채널 ID, 채널 URL, 또는 @핸들을 입력해주세요.'));
    var handle = parsed.type === 'handle' ? (parsed.value.indexOf('@') === 0 ? parsed.value : '@' + parsed.value) : null;
    if (handle) {
      return fetch(YT_API + '/channels?part=id&forHandle=' + encodeURIComponent(handle) + '&key=' + encodeURIComponent(apiKey))
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.error) throw new Error(d.error.message || 'API 오류');
          var item = d && d.items && d.items[0];
          if (item) return item.id;
          throw new Error('핸들(' + handle + ')로 채널을 찾지 못했습니다.');
        });
    }
    if (parsed.type === 'username') {
      return fetch(YT_API + '/channels?part=id&forUsername=' + encodeURIComponent(parsed.value) + '&key=' + encodeURIComponent(apiKey))
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.error) throw new Error(d.error.message || 'API 오류');
          var item = d && d.items && d.items[0];
          if (item) return item.id;
          throw new Error('사용자명(' + parsed.value + ')으로 채널을 찾지 못했습니다.');
        });
    }
    return Promise.reject(new Error('채널 ID/URL/핸들 형식을 인식할 수 없습니다.'));
  }

  function isoDurationToSeconds(iso) {
    var m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || '');
    if (!m) return 0;
    return (parseInt(m[1] || 0, 10) * 3600) + (parseInt(m[2] || 0, 10) * 60) + parseInt(m[3] || 0, 10);
  }
  function secondsToDuration(sec) {
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    var mm = h > 0 ? (m < 10 ? '0' + m : String(m)) : String(m);
    var ss = s < 10 ? '0' + s : String(s);
    return (h > 0 ? h + ':' : '') + mm + ':' + ss;
  }
  function formatUploadDate(iso) {
    try {
      var d = new Date(iso);
      var mo = d.getMonth() + 1, da = d.getDate();
      return d.getFullYear() + '.' + (mo < 10 ? '0' + mo : mo) + '.' + (da < 10 ? '0' + da : da);
    } catch (e) { return ''; }
  }
  function formatCount(n) {
    n = Number(n) || 0;
    if (n >= 10000) { return (Math.floor(n / 1000) / 10).toFixed(1).replace(/\.0$/, '') + '만'; }
    if (n >= 1000) { return Math.floor(n / 100) / 10 + '천'; }
    return String(n);
  }
  function extractYoutubeId(url) {
    url = (url || '').trim();
    var m = url.match(/(?:youtu\.be\/|shorts\/|v=)([A-Za-z0-9_-]{11})(?:[?&#/]|$)/);
    if (m) return m[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url; // 이미 ID만 입력한 경우
    return '';
  }

  /* ---------- site_content 테이블 upsert (통계값 저장용 — search= HTTP 500 우회 지원) ---------- */
  var ytKnownStatRows = Object.create(null);

  function findSiteContentRow(key) {
    if (ytKnownStatRows[key] && ytKnownStatRows[key].id) return Promise.resolve(ytKnownStatRows[key]);
    var editorApi = window.KinoyaAdminEditor;
    if (editorApi && typeof editorApi.getRow === 'function') {
      var fromEditor = editorApi.getRow(key);
      if (fromEditor && fromEditor.id) {
        ytKnownStatRows[key] = fromEditor;
        return Promise.resolve(fromEditor);
      }
      if (typeof editorApi.isKeyLoaded === 'function' && editorApi.isKeyLoaded(key)) {
        return Promise.resolve(null);
      }
    }
    try {
      var cached = JSON.parse(localStorage.getItem('cms_cache') || '{}');
      var cachedRows = (cached && Array.isArray(cached.data)) ? cached.data : [];
      var hit = cachedRows.filter(function (r) { return r && r.key === key && r.id; })[0];
      if (hit) {
        ytKnownStatRows[key] = hit;
        return Promise.resolve(hit);
      }
    } catch (e) {}
    return AdminCore.all('site_content', { search: key })
      .catch(function () {
        return AdminCore.all('site_content', { search: 'social.youtube.' });
      })
      .catch(function () {
        return [];
      })
      .then(function (rows) {
        var existing = (rows || []).filter(function (r) { return r && r.key === key; })[0] || null;
        if (existing) ytKnownStatRows[key] = existing;
        return existing;
      });
  }

  function upsertSiteContent(key, group, label, value) {
    var strVal = String(value == null ? '' : value);
    var inputEl = document.getElementById('text-' + idFor(key));
    if (inputEl) {
      inputEl.value = strVal;
      delete inputEl.dataset.dirty;
    }
    return findSiteContentRow(key)
      .then(function (existing) {
        var url = '/tables/site_content' + (existing && existing.id ? '/' + encodeURIComponent(existing.id) : '');
        return fetch(url, {
          method: existing && existing.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: key, page: group, label: label, type: 'text', value: strVal })
        });
      })
      .then(function (r) { return r.json(); })
      .then(function (saved) {
        if (saved && saved.id) {
          ytKnownStatRows[key] = saved;
          if (window.KinoyaAdminEditor && typeof window.KinoyaAdminEditor.setRow === 'function') {
            window.KinoyaAdminEditor.setRow(key, saved);
          }
        }
        return saved;
      });
  }

  /* ---------- 업로드 재생목록을 페이지 단위로 순회하며, 목표 개수(쇼츠/영상)를
     채울 때까지 상세정보(재생시간 등)를 함께 가져옵니다. ---------- */
  function fetchVideoDetailsBatch(apiKey, ids) {
    var chunks = [];
    for (var i = 0; i < ids.length; i += 50) { chunks.push(ids.slice(i, i + 50)); }
    return chunks.reduce(function (p, chunk) {
      return p.then(function (acc) {
        return fetch(YT_API + '/videos?part=contentDetails,statistics,snippet&id=' + chunk.join(',') + '&key=' + encodeURIComponent(apiKey))
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (d && d.error) throw new Error(d.error.message || '영상 상세 API 오류');
            return acc.concat((d && d.items) || []);
          });
      });
    }, Promise.resolve([]));
  }

  function collectClassifiedVideos(apiKey, uploadsPlaylistId, onProgress) {
    var shorts = [];
    var videos = [];
    var pageToken;
    var pages = 0;

    function fetchPage() {
      pages++;
      var url = YT_API + '/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=' + encodeURIComponent(uploadsPlaylistId) + '&key=' + encodeURIComponent(apiKey);
      if (pageToken) { url += '&pageToken=' + encodeURIComponent(pageToken); }
      return fetch(url).then(function (r) { return r.json(); }).then(function (plData) {
        if (plData && plData.error) throw new Error(plData.error.message || '영상 목록 API 오류');
        pageToken = plData.nextPageToken;
        var items = (plData && plData.items) || [];
        var videoIds = items.map(function (it) { return it.contentDetails && it.contentDetails.videoId; }).filter(Boolean);
        if (!videoIds.length) { return; }
        return fetchVideoDetailsBatch(apiKey, videoIds).then(function (vids) {
          vids.forEach(function (v) {
            var durSec = isoDurationToSeconds(v.contentDetails && v.contentDetails.duration);
            if (durSec > 0 && durSec <= 180) { shorts.push({ v: v, durSec: durSec }); }
            else { videos.push({ v: v, durSec: durSec }); }
          });
        });
      }).then(function () {
        if (onProgress) { onProgress(shorts.length, videos.length, pages); }
        var enough = shorts.length >= TARGET_SHORTS && videos.length >= TARGET_VIDEOS;
        if (enough || !pageToken || pages >= MAX_PLAYLIST_PAGES) {
          return { shorts: shorts, videos: videos };
        }
        return fetchPage();
      });
    }
    return fetchPage();
  }

  /* ---------- youtube_videos 테이블 upsert (youtube_id 기준 자연키 + HTTP 500 안전 재시도) ---------- */
  var lastLoadedVideoRows = [];

  function loadAllVideos() {
    return AdminCore.all('youtube_videos')
      .then(function (rows) {
        lastLoadedVideoRows = Array.isArray(rows) ? rows.slice() : [];
        return lastLoadedVideoRows.slice();
      })
      .catch(function (err) {
        if (lastLoadedVideoRows.length) return lastLoadedVideoRows.slice();
        throw err;
      });
  }

  function upsertVideo(existingRows, entry) {
    var matches = existingRows.filter(function (r) { return r.youtube_id === entry.youtube_id; });
    var existing = matches[0];
    if (existing && existing.source === '수동' && entry.source === '자동') return Promise.resolve(existing);
    var dupes = matches.slice(1);
    var cleanupDupes = dupes.length
      ? Promise.all(dupes.map(function (d) {
          return fetch('/tables/youtube_videos/' + encodeURIComponent(d.id), { method: 'DELETE' }).catch(function () {});
        }))
      : Promise.resolve();
    return cleanupDupes.then(function () {
      var url = '/tables/youtube_videos' + (existing && existing.id ? '/' + encodeURIComponent(existing.id) : '');
      var method = existing && existing.id ? 'PUT' : 'POST';
      function sendWrite(attempt) {
        return fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        }).then(function (r) { return r.json(); }).catch(function (err) {
          if (attempt < 2 && err && (err.status === 500 || err.status === 502 || err.status === 503 || err.status === 504)) {
            return new Promise(function (res) { setTimeout(res, 250 * (attempt + 1)); }).then(function () {
              return sendWrite(attempt + 1);
            });
          }
          throw err;
        });
      }
      return sendWrite(0);
    });
  }

  /* ---------- 🚀 한 번에 전체 자동 업데이트 ---------- */
  function runFullSync() {
    var btn = document.getElementById('yt-full-sync-btn');
    var statusEl = document.getElementById('yt-full-sync-status');
    var previewEl = document.getElementById('yt-full-sync-preview');
    var apiKey = getInputValue('social.youtube.apikey');
    var rawChannel = getInputValue('social.youtube.channelid');

    if (!apiKey) { statusEl.textContent = '❌ 먼저 위쪽 "유튜브 Data API 키"를 입력해주세요.'; statusEl.className = 'text-xs text-red-600 mt-2'; return; }
    if (!rawChannel) { statusEl.textContent = '❌ 먼저 위쪽 "채널 ID/URL/@핸들"을 입력해주세요.'; statusEl.className = 'text-xs text-red-600 mt-2'; return; }

    btn.disabled = true;
    statusEl.className = 'text-xs text-slate-500 mt-2';
    statusEl.textContent = '① 채널 정보를 확인하는 중...';

    var parsed = parseYoutubeChannelInput(rawChannel);
    var channelId;

    resolveYoutubeChannelId(apiKey, parsed)
      .then(function (id) {
        channelId = id;
        return fetch(YT_API + '/channels?part=statistics,contentDetails,snippet&id=' + encodeURIComponent(channelId) + '&key=' + encodeURIComponent(apiKey));
      })
      .then(function (r) { return r.json(); })
      .then(function (chData) {
        if (chData && chData.error) throw new Error(chData.error.message || '채널 조회 API 오류');
        var ch = chData && chData.items && chData.items[0];
        if (!ch) throw new Error('채널 정보를 찾지 못했습니다.');
        var stats = ch.statistics || {};

        statusEl.textContent = '② 채널 통계를 저장하는 중...';
        var saveStatsPromise = upsertSiteContent('social.youtube.stats.subscribers', '소셜미디어 - 유튜브 자동연동', '구독자 수', formatCount(stats.subscriberCount || 0))
          .then(function () {
            return upsertSiteContent('social.youtube.stats.views', '소셜미디어 - 유튜브 자동연동', '총 조회수', formatCount(stats.viewCount || 0));
          })
          .then(function () {
            return upsertSiteContent('social.youtube.stats.videocount', '소셜미디어 - 유튜브 자동연동', '총 업로드 영상 수', formatCount(stats.videoCount || 0));
          })
          .catch(function (statErr) {
            console.warn('[admin][yt-sync] 통계 DB 저장 경고(계속 진행):', statErr);
          });

        document.getElementById('yt-sync-subs').textContent = formatCount(stats.subscriberCount || 0) + '+';
        document.getElementById('yt-sync-views').textContent = formatCount(stats.viewCount || 0) + '+';
        previewEl.classList.remove('hidden');

        var uploadsPlaylistId = ch.contentDetails && ch.contentDetails.relatedPlaylists && ch.contentDetails.relatedPlaylists.uploads;
        if (!uploadsPlaylistId) { return saveStatsPromise.then(function () { return null; }); }

        statusEl.textContent = '③ 최신 영상/쇼츠를 가져오는 중... (목표: 쇼츠 ' + TARGET_SHORTS + '개 + 영상 ' + TARGET_VIDEOS + '개)';
        return saveStatsPromise.then(function () {
          return collectClassifiedVideos(apiKey, uploadsPlaylistId, function (shortsCount, videosCount, pages) {
            statusEl.textContent = '③ 최신 영상/쇼츠를 가져오는 중... (쇼츠 ' + shortsCount + '개 · 영상 ' + videosCount + '개 확인, ' + pages + '페이지 조회)';
          });
        });
      })
      .then(function (classified) {
        if (!classified) {
          statusEl.textContent = '✅ 통계 저장 완료. (채널에 가져올 영상이 없습니다)';
          statusEl.className = 'text-xs text-emerald-600 mt-2';
          document.getElementById('yt-sync-count').textContent = '0개';
          return;
        }
        /* 업로드 재생목록은 최신순으로 오므로, 앞에서부터 목표 개수만큼만 선택합니다.
           (쇼츠 10개, 영상 30개 = 3행 x 10개) */
        var selectedShorts = classified.shorts.slice(0, TARGET_SHORTS);
        var selectedVideos = classified.videos.slice(0, TARGET_VIDEOS);
        var selected = selectedShorts.concat(selectedVideos);

        if (!selected.length) {
          statusEl.textContent = '✅ 통계 저장 완료. (채널에 가져올 영상이 없습니다)';
          statusEl.className = 'text-xs text-emerald-600 mt-2';
          document.getElementById('yt-sync-count').textContent = '0개';
          return;
        }

        statusEl.textContent = '④ 영상/쇼츠를 데이터베이스에 고속 병렬 저장하는 중... (0/' + selected.length + ')';
        return loadAllVideos().then(function (existingRows) {
          var savedCount = 0;
          var selectedYoutubeIds = {};
          var entries = [];

          selectedShorts.forEach(function (item, idx) {
            var v = item.v;
            selectedYoutubeIds[v.id] = true;
            var thumbObj = v.snippet && v.snippet.thumbnails && (v.snippet.thumbnails.high || v.snippet.thumbnails.medium || v.snippet.thumbnails.default);
            entries.push({
              title: (v.snippet && v.snippet.title) || '',
              youtube_id: v.id,
              video_type: '쇼츠',
              duration: secondsToDuration(item.durSec),
              thumbnail: thumbObj ? thumbObj.url : '',
              views: v.statistics && v.statistics.viewCount ? formatCount(v.statistics.viewCount) + ' 회' : '',
              published_at: formatUploadDate(v.snippet && v.snippet.publishedAt),
              source: '자동',
              sort_order: idx
            });
          });
          selectedVideos.forEach(function (item, idx) {
            var v = item.v;
            selectedYoutubeIds[v.id] = true;
            var thumbObj = v.snippet && v.snippet.thumbnails && (v.snippet.thumbnails.high || v.snippet.thumbnails.medium || v.snippet.thumbnails.default);
            entries.push({
              title: (v.snippet && v.snippet.title) || '',
              youtube_id: v.id,
              video_type: '영상',
              duration: secondsToDuration(item.durSec),
              thumbnail: thumbObj ? thumbObj.url : '',
              views: v.statistics && v.statistics.viewCount ? formatCount(v.statistics.viewCount) + ' 회' : '',
              published_at: formatUploadDate(v.snippet && v.snippet.publishedAt),
              source: '자동',
              sort_order: idx
            });
          });

          var batches = [];
          for (var i = 0; i < entries.length; i += 3) {
            batches.push(entries.slice(i, i + 3));
          }
          var chain = batches.reduce(function (p, batch) {
            return p.then(function () {
              return Promise.all(batch.map(function (entry) {
                return upsertVideo(existingRows, entry).then(function () {
                  savedCount++;
                  statusEl.textContent = '④ 영상/쇼츠를 데이터베이스에 저장하는 중... (' + savedCount + '/' + selected.length + ')';
                });
              }));
            });
          }, Promise.resolve());

          return chain.then(function () {
            try { localStorage.removeItem('kinoya_yt_fast_v1'); localStorage.removeItem('cms_cache'); } catch (e) {}
            /* 밀어내기: 이번 동기화에서 선택되지 않은, 예전에 자동으로 저장된 항목은
               삭제합니다(수동으로 등록한 항목은 건드리지 않습니다). 오래된 영상/쇼츠가
               자연스럽게 밀려나고 최신 목표 개수(쇼츠 10 · 영상 30)만 유지됩니다. */
            var toDelete = existingRows.filter(function (r) {
              return r.source === '자동' && !selectedYoutubeIds[r.youtube_id];
            });
            return Promise.all(toDelete.map(function (r) {
              return fetch('/tables/youtube_videos/' + encodeURIComponent(r.id), { method: 'DELETE' });
            })).then(function () {
              return { savedCount: savedCount, deletedCount: toDelete.length, shortsCount: selectedShorts.length, videosCount: selectedVideos.length };
            });
          });
        }).then(function (summary) {
          statusEl.textContent = '🎉 전체 자동 업데이트 완료! (쇼츠 ' + summary.shortsCount + '개 · 영상 ' + summary.videosCount + '개 저장' +
            (summary.deletedCount ? ', 오래된 항목 ' + summary.deletedCount + '개 정리' : '') + ') 홈페이지에서 새로고침하면 바로 반영됩니다.';
          statusEl.className = 'text-xs text-emerald-600 mt-2 font-semibold';
          document.getElementById('yt-sync-count').textContent = (summary.shortsCount + summary.videosCount) + '개';
          loadVideoList();
        });
      })
      .catch(function (err) {
        console.error('[admin][yt-sync] 실패:', err);
        statusEl.textContent = '❌ 실패: ' + (err && err.message ? err.message : String(err));
        statusEl.className = 'text-xs text-red-600 mt-2';
      })
      .finally(function () {
        btn.disabled = false;
      });
  }

  /* ---------- 수동 영상 등록 (oEmbed로 API 키 없이 제목/썸네일 자동조회) ---------- */
  function addManualVideo() {
    var typeEl = document.getElementById('yt-new-type');
    var urlEl = document.getElementById('yt-new-url');
    var titleEl = document.getElementById('yt-new-title');
    var statusEl = document.getElementById('yt-new-status');
    var btn = document.getElementById('yt-new-add-btn');

    var youtubeId = extractYoutubeId(urlEl.value);
    if (!youtubeId) { statusEl.textContent = '❌ 올바른 유튜브 URL을 입력해주세요.'; statusEl.className = 'text-xs text-red-600 mt-2'; return; }

    btn.disabled = true;
    statusEl.className = 'text-xs text-slate-500 mt-2';
    statusEl.textContent = '영상 정보를 확인하는 중...';

    var watchUrl = 'https://www.youtube.com/watch?v=' + youtubeId;
    fetch('https://www.youtube.com/oembed?url=' + encodeURIComponent(watchUrl) + '&format=json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (oembed) {
        var title = titleEl.value.trim() || (oembed && oembed.title) || ('유튜브 영상 (' + youtubeId + ')');
        var thumbnail = (oembed && oembed.thumbnail_url) || ('https://i.ytimg.com/vi/' + youtubeId + '/hqdefault.jpg');
        return loadAllVideos().then(function (existingRows) {
          var entry = {
            title: title,
            youtube_id: youtubeId,
            video_type: typeEl.value,
            duration: '',
            thumbnail: thumbnail,
            views: '',
            published_at: '',
            source: '수동',
            sort_order: existingRows.length
          };
          return upsertVideo(existingRows, entry);
        });
      })
      .then(function () {
        statusEl.textContent = '✅ 등록되었습니다.';
        statusEl.className = 'text-xs text-emerald-600 mt-2';
        urlEl.value = '';
        titleEl.value = '';
        loadVideoList();
      })
      .catch(function (err) {
        console.error('[admin][yt-manual-add] 실패:', err);
        statusEl.textContent = '❌ 등록 실패: ' + (err && err.message ? err.message : String(err));
        statusEl.className = 'text-xs text-red-600 mt-2';
      })
      .finally(function () { btn.disabled = false; });
  }

  /* ---------- 영상 목록 렌더링 / 삭제 ---------- */
  function loadVideoList() {
    var tbody = document.getElementById('yt-list-tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-slate-400">불러오는 중...</td></tr>';
    loadAllVideos().then(function (rows) {
      rows.sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-slate-400">등록된 영상이 없습니다.</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map(function (row) {
        return '<tr class="border-b border-slate-50">' +
          '<td class="py-2 pr-2"><img src="' + escapeHtml(row.thumbnail || '') + '" alt="" class="w-20 h-12 object-cover rounded bg-slate-100"></td>' +
          '<td class="py-2 pr-2"><select class="yt-type-select border rounded p-1" aria-label="영상 분류"><option'+(row.video_type==='영상'?' selected':'')+'>영상</option><option'+(row.video_type==='쇼츠'?' selected':'')+'>쇼츠</option></select></td>' +
          '<td class="py-2 pr-2"><input class="yt-title-input border rounded p-1" aria-label="영상 제목" value="'+escapeHtml(row.title||'')+'"></td>' +
          '<td class="py-2 pr-2 text-xs text-slate-400">' + escapeHtml(row.source || '-') + '</td>' +
          '<td class="py-2 pr-2"><button type="button" class="yt-save-btn text-xs px-2 py-1 rounded bg-slate-700 text-white" data-id="'+escapeHtml(row.id)+'">수정 저장</button><small class="yt-row-status block"></small><button type="button" class="yt-del-btn text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded" data-id="' + escapeHtml(row.id) + '">삭제</button></td>' +
          '</tr>';
      }).join('');
      tbody.querySelectorAll('.yt-save-btn').forEach(function(btn){
        btn.addEventListener('click',async function(){
          if(btn.disabled)return;const tr=btn.closest('tr'),status=tr.querySelector('.yt-row-status'),original=rows.find(function(row){return row.id===btn.dataset.id;}),title=tr.querySelector('.yt-title-input').value.trim(),video_type=tr.querySelector('.yt-type-select').value;
          if(!title){status.textContent='제목을 입력해주세요.';return;}
          btn.disabled=true;status.textContent='저장 중…';
          try{const fresh=await(await fetch('tables/youtube_videos/'+encodeURIComponent(original.id),{cache:'no-store'})).json();if(fresh.title!==original.title||fresh.video_type!==original.video_type)throw new Error('다른 화면에서 변경됐습니다. 입력을 복사하고 새로고침하세요.');await fetch('tables/youtube_videos/'+encodeURIComponent(original.id),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:title,video_type:video_type,source:'수동'})});original.title=title;original.video_type=video_type;original.source='수동';status.textContent='저장 완료 · 수동 분류 보존';}catch(e){status.textContent=e.message;}finally{btn.disabled=false;}
        });
      });
      tbody.querySelectorAll('.yt-del-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          AdminCore.remove('youtube_videos',btn.dataset.id,btn,loadVideoList);
        });
      });
    }).catch(function (err) {
      console.error('[admin][yt-list] 실패:', err);
      tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-red-600">불러오기 실패: ' + escapeHtml(err.message || String(err)) + '</td></tr>';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var fullSyncBtn = document.getElementById('yt-full-sync-btn');
    var addBtn = document.getElementById('yt-new-add-btn');
    var refreshBtn = document.getElementById('yt-list-refresh-btn');
    if (fullSyncBtn) fullSyncBtn.addEventListener('click', runFullSync);
    if (addBtn) addBtn.addEventListener('click', addManualVideo);
    if (refreshBtn) refreshBtn.addEventListener('click', loadVideoList);
    loadVideoList();
  });
})();
