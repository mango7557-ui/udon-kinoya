document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var HOST_SOURCE_MAP = {
    'wowtv.co.kr': '한국경제TV',
    'hankyung.com': '한국경제',
    'mk.co.kr': '매일경제',
    'edaily.co.kr': '이데일리',
    'mt.co.kr': '머니투데이',
    'fnnews.com': '파이낸셜뉴스',
    'sedaily.com': '서울경제',
    'heraldcorp.com': '헤럴드경제',
    'asiae.co.kr': '아시아경제',
    'ajunews.com': '아주경제',
    'etoday.co.kr': '이투데이',
    'e2news.com': '이투뉴스',
    'chosun.com': '조선일보',
    'biz.chosun.com': '조선비즈',
    'joongang.co.kr': '중앙일보',
    'donga.com': '동아일보',
    'hani.co.kr': '한겨레',
    'khan.co.kr': '경향신문',
    'kmib.co.kr': '국민일보',
    'segye.com': '세계일보',
    'munhwa.com': '문화일보',
    'seoul.co.kr': '서울신문',
    'yna.co.kr': '연합뉴스',
    'newsis.com': '뉴시스',
    'news1.kr': '뉴스1',
    'nocutnews.co.kr': '노컷뉴스',
    'ytn.co.kr': 'YTN',
    'sbs.co.kr': 'SBS',
    'kbs.co.kr': 'KBS',
    'imbc.com': 'MBC',
    'jtbc.co.kr': 'JTBC',
    'mbn.co.kr': 'MBN',
    'tvchosun.com': 'TV조선',
    'ichannela.com': '채널A',
    'naver.com': '네이버 뉴스',
    'daum.net': '다음 뉴스'
  };

  function guessSourceFromUrl(rawUrl) {
    try {
      var u = new URL(rawUrl);
      var host = u.hostname.replace(/^www\./i, '').replace(/^m\./i, '').toLowerCase();
      for (var k in HOST_SOURCE_MAP) {
        if (host === k || host.endsWith('.' + k)) return HOST_SOURCE_MAP[k];
      }
      return host.split('.')[0].toUpperCase();
    } catch (e) {
      return '';
    }
  }

  function normalizeDateString(raw) {
    if (!raw) return '';
    var s = String(raw).trim();
    var mIso = s.match(/(20\d{2})[-./](0[1-9]|1[0-2])[-./](0[1-9]|[12]\d|3[01])/);
    if (mIso) return mIso[1] + '-' + mIso[2] + '-' + mIso[3];
    var m = s.match(/(20\d{2})\s*[-./년]\s*(0?[1-9]|1[0-2])\s*[-./월]\s*(0?[1-9]|[12]\d|3[01])/);
    if (m) {
      var y = m[1];
      var mo = m[2].length === 1 ? '0' + m[2] : m[2];
      var d = m[3].length === 1 ? '0' + m[3] : m[3];
      return y + '-' + mo + '-' + d;
    }
    var dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      var yy = dt.getFullYear();
      var mm = String(dt.getMonth() + 1).padStart(2, '0');
      var dd = String(dt.getDate()).padStart(2, '0');
      return yy + '-' + mm + '-' + dd;
    }
    return '';
  }

  function cleanText(str) {
    var t = document.createElement('textarea');
    t.innerHTML = String(str == null ? '' : str);
    return t.value
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function extractArticleFromHtml(htmlString, articleUrl) {
    var doc = new DOMParser().parseFromString(htmlString, 'text/html');
    function meta(selectors) {
      for (var i = 0; i < selectors.length; i++) {
        var el = doc.querySelector(selectors[i]);
        if (el) {
          var c = (el.getAttribute('content') || el.textContent || '').trim();
          if (c) return c;
        }
      }
      return '';
    }

    var ldTitle = '', ldDate = '', ldSource = '', ldDesc = '', ldBody = '', ldImage = '';
    var ldScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    ldScripts.forEach(function (sc) {
      try {
        var parsed = JSON.parse(sc.textContent || '{}');
        var list = Array.isArray(parsed) ? parsed : (parsed['@graph'] ? parsed['@graph'] : [parsed]);
        list.forEach(function (item) {
          if (!item || typeof item !== 'object') return;
          if (!ldTitle && (item.headline || item.name)) ldTitle = String(item.headline || item.name).trim();
          if (!ldDate && (item.datePublished || item.dateCreated || item.dateModified)) ldDate = String(item.datePublished || item.dateCreated || item.dateModified).trim();
          if (!ldSource && item.publisher && item.publisher.name) ldSource = String(item.publisher.name).trim();
          if (!ldSource && item.author && item.author.name) ldSource = String(item.author.name).trim();
          if (!ldDesc && item.description) ldDesc = String(item.description).trim();
          if (!ldBody && item.articleBody) ldBody = String(item.articleBody).trim();
          if (!ldImage && item.image) {
            if (typeof item.image === 'string') ldImage = item.image;
            else if (Array.isArray(item.image) && item.image[0]) ldImage = typeof item.image[0] === 'string' ? item.image[0] : (item.image[0].url || '');
            else if (item.image.url) ldImage = item.image.url;
          }
        });
      } catch (e) {}
    });

    var title = meta([
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'meta[name="title"]'
    ]) || ldTitle || meta([
      'h1#title_area',
      'h2#title_area',
      '.media_end_head_headline',
      '.article_title',
      '.news_title',
      'article h1',
      'h1'
    ]) || (doc.title ? doc.title.trim() : '');

    var source = meta([
      'meta[property="og:site_name"]',
      'meta[name="twitter:site"]',
      'meta[property="og:article:author"]',
      'meta[name="author"]',
      'meta[name="publisher"]'
    ]) || ldSource || guessSourceFromUrl(articleUrl);

    if (title && source && title.endsWith(' - ' + source)) {
      title = title.slice(0, -(' - ' + source).length).trim();
    } else if (title && title.indexOf(' : 네이버 뉴스') > 0) {
      title = title.split(' : 네이버 뉴스')[0].trim();
    }

    var rawDate = meta([
      'meta[property="article:published_time"]',
      'meta[property="og:regDate"]',
      'meta[name="pubdate"]',
      'meta[name="date"]',
      'meta[name="ptime"]',
      'meta[itemprop="datePublished"]',
      'time[datetime]'
    ]);
    if (!rawDate) {
      var timeEl = doc.querySelector('time[datetime], .media_end_head_info_datestamp_time, .date, .article_date, .news_date, .view_date, .reg_date');
      if (timeEl) rawDate = timeEl.getAttribute('datetime') || timeEl.getAttribute('data-date-time') || timeEl.textContent || '';
    }
    if (!rawDate) rawDate = ldDate;
    if (!rawDate) {
      var bodyTextForDate = (doc.body ? doc.body.textContent : '') || '';
      var dm = bodyTextForDate.match(/(?:입력|승인|등록|발행|기사입력|게재)\s*[:：]?\s*(20\d{2}[-./년\s]+\d{1,2}[-./월\s]+\d{1,2})/);
      if (dm) rawDate = dm[1];
    }
    var date = normalizeDateString(rawDate) || new Date().toISOString().slice(0, 10);

    var thumbUrl = meta([
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'meta[itemprop="image"]',
      'link[rel="image_src"]'
    ]) || ldImage;
    if (!thumbUrl) {
      var articleImg = doc.querySelector('#dic_area img, #articleBodyContents img, #newsEndContents img, .article_body img, .article-body img, .news_body img, .view_con img, article img');
      if (articleImg) thumbUrl = articleImg.getAttribute('data-src') || articleImg.getAttribute('src') || '';
    }
    if (thumbUrl && articleUrl) {
      try { thumbUrl = new URL(thumbUrl, articleUrl).href; } catch (e) {}
    }

    var ogDesc = meta([
      'meta[property="og:description"]',
      'meta[name="description"]',
      'meta[name="twitter:description"]'
    ]) || ldDesc;

    var bodySelectors = [
      '#dic_area',
      '#articleBodyContents',
      '#article-view-content-div',
      '#newsEndContents',
      '#articeBody',
      '#articleBody',
      '.article_body',
      '.article-body',
      '.article_view',
      '.article-view',
      '.article_txt',
      '.article-txt',
      '.art_txt',
      '.news_body',
      '.news_cnt_detail_wrap',
      '.view_con',
      '.read_body',
      '[itemprop="articleBody"]',
      'article',
      'main'
    ];
    var bodyParagraphs = [];
    for (var b = 0; b < bodySelectors.length; b++) {
      var container = doc.querySelector(bodySelectors[b]);
      if (container) {
        var clone = container.cloneNode(true);
        clone.querySelectorAll('script, style, iframe, nav, aside, header, footer, figure figcaption, .ad, .advertisement, .copyright, .reporter_area, .byline').forEach(function (n) { n.remove(); });
        var rawLines = (clone.innerHTML || '')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/(p|div|li|h[1-6]|blockquote|tr)>/gi, '\n\n');
        var tmp = document.createElement('div');
        tmp.innerHTML = rawLines;
        cleanText(tmp.textContent || '').split(/\n+/).forEach(function (line) {
          var t = line.trim();
          if (t.length >= 22 && bodyParagraphs.indexOf(t) === -1) bodyParagraphs.push(t);
        });
        if (bodyParagraphs.join('\n\n').length >= 160) break;
      }
    }

    var fullBody = ldBody ? cleanText(ldBody) : bodyParagraphs.join('\n\n');
    var excerpt = fullBody || cleanText(ogDesc);
    if (ogDesc && fullBody && fullBody.indexOf(ogDesc.slice(0, 25)) === -1 && fullBody.length < 220) {
      excerpt = cleanText(ogDesc) + '\n\n' + fullBody;
    }

    return {
      title: cleanText(title),
      date: date,
      source: cleanText(source),
      excerpt: cleanText(excerpt),
      thumbnailUrl: thumbUrl || ''
    };
  }

  async function fetchNewsMetadata(targetUrl) {
    var url = String(targetUrl || '').trim();
    if (!/^https?:\/\//i.test(url)) throw new Error('올바른 뉴스 원문 링크(http:// 또는 https://)를 입력해주세요.');

    var errors = [];

    // 1차: AllOrigins JSON / Raw CORS Proxy (원문 HTML 전체 추출로 기사 본문·메타태그 모두 파싱)
    var htmlProxies = [
      {
        name: 'allorigins-json',
        buildUrl: function (u) { return 'https://api.allorigins.win/get?url=' + encodeURIComponent(u); },
        parse: async function (res) { var j = await res.json(); return j && j.contents ? j.contents : ''; }
      },
      {
        name: 'codetabs',
        buildUrl: function (u) { return 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(u); },
        parse: async function (res) { return await res.text(); }
      }
    ];

    var htmlResult = null;
    for (var i = 0; i < htmlProxies.length; i++) {
      try {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, 9000);
        var res = await window.fetch(htmlProxies[i].buildUrl(url), { signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) {
          var html = await htmlProxies[i].parse(res);
          if (html && html.length > 150) {
            var extracted = extractArticleFromHtml(html, url);
            if (extracted.title || extracted.excerpt) {
              htmlResult = extracted;
              break;
            }
          }
        }
      } catch (e) {
        errors.push(htmlProxies[i].name + ': ' + (e.message || e));
      }
    }

    // 2차: Microlink OpenGraph API (빠르고 안정적인 메타데이터·대표 이미지 추출)
    var mlResult = null;
    if (!htmlResult || !htmlResult.title || !htmlResult.thumbnailUrl || !htmlResult.excerpt) {
      try {
        var mlRes = await window.fetch('https://api.microlink.io/?url=' + encodeURIComponent(url));
        if (mlRes.ok) {
          var mlJson = await mlRes.json();
          if (mlJson && mlJson.status === 'success' && mlJson.data) {
            var d = mlJson.data;
            mlResult = {
              title: cleanText(d.title || ''),
              date: normalizeDateString(d.date || '') || new Date().toISOString().slice(0, 10),
              source: cleanText(d.publisher || guessSourceFromUrl(url)),
              excerpt: cleanText(d.description || ''),
              thumbnailUrl: (d.image && d.image.url) ? d.image.url : ((d.logo && d.logo.url) ? d.logo.url : '')
            };
          }
        }
      } catch (e) {
        errors.push('microlink: ' + (e.message || e));
      }
    }

    if (!htmlResult && !mlResult) {
      throw new Error('해당 언론사 보안 정책으로 자동 불러오기에 실패했습니다. 제목·요약을 직접 입력하거나 다른 기사 링크로 시도해주세요.');
    }

    var finalTitle = (htmlResult && htmlResult.title) || (mlResult && mlResult.title) || '';
    var finalDate = (htmlResult && htmlResult.date) || (mlResult && mlResult.date) || new Date().toISOString().slice(0, 10);
    var finalSource = (htmlResult && htmlResult.source) || (mlResult && mlResult.source) || guessSourceFromUrl(url);
    var finalExcerpt = '';
    if (htmlResult && htmlResult.excerpt && (!mlResult || htmlResult.excerpt.length >= (mlResult.excerpt || '').length)) {
      finalExcerpt = htmlResult.excerpt;
    } else if (mlResult && mlResult.excerpt) {
      finalExcerpt = mlResult.excerpt;
    }
    var finalThumb = (htmlResult && htmlResult.thumbnailUrl) || (mlResult && mlResult.thumbnailUrl) || '';

    return {
      title: finalTitle,
      date: finalDate,
      source: finalSource,
      excerpt: finalExcerpt,
      thumbnailUrl: finalThumb
    };
  }

  async function tryFetchImageAsFile(imageUrl, titleHint) {
    if (!imageUrl) return null;
    var candidates = [
      imageUrl,
      'https://images.weserv.nl/?url=' + encodeURIComponent(imageUrl.replace(/^https?:\/\//i, '')) + '&output=jpg',
      'https://api.allorigins.win/raw?url=' + encodeURIComponent(imageUrl)
    ];
    for (var i = 0; i < candidates.length; i++) {
      try {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, 8000);
        var res = await window.fetch(candidates[i], { signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) continue;
        var blob = await res.blob();
        if (!blob || blob.size < 200) continue;
        var mime = (blob.type || '').toLowerCase();
        if (!/^image\/(png|jpe?g|webp|gif)/.test(mime)) {
          mime = 'image/jpeg';
        }
        var ext = mime.indexOf('png') >= 0 ? 'png' : (mime.indexOf('webp') >= 0 ? 'webp' : 'jpg');
        var safeName = String(titleHint || 'news-thumb').replace(/[^a-zA-Z0-9가-힣_-]/g, '_').slice(0, 30) || 'news-thumb';
        return new File([blob], safeName + '.' + ext, { type: mime === 'image/jpg' ? 'image/jpeg' : mime });
      } catch (e) {}
    }
    return null;
  }

  function enhanceNewsForm(formEl) {
    if (!formEl || formEl.dataset.newsAutofetchEnhanced === '1') return;
    formEl.dataset.newsAutofetchEnhanced = '1';

    var urlInput = formEl.querySelector('input[name="url"]');
    var titleInput = formEl.querySelector('input[name="title"]');
    var dateInput = formEl.querySelector('input[name="date"]');
    var sourceInput = formEl.querySelector('input[name="source"]');
    var excerptInput = formEl.querySelector('textarea[name="excerpt"]');
    var thumbInput = formEl.querySelector('input[name="thumbnail"]');
    if (!urlInput || !titleInput) return;

    var urlLabel = urlInput.closest('label');
    var thumbLabel = thumbInput ? thumbInput.closest('label') : null;
    if (excerptInput) {
      excerptInput.rows = 5;
      excerptInput.placeholder = '요약 및 기사 본문 내용 (카드에는 3줄 요약으로 표시되고, 더보기 클릭 시 상세 페이지에서 전체 내용이 표시됩니다)';
      var exLabel = excerptInput.closest('label');
      if (exLabel && exLabel.firstChild && exLabel.firstChild.nodeType === 3) {
        exLabel.firstChild.nodeValue = '요약 / 기사 내용';
      }
    }

    // 원문 링크 입력칸 바로 옆/아래에 [📰 뉴스 자동 가져오기] 툴바 구성
    var fetchBar = document.createElement('div');
    fetchBar.className = 'news-autofetch-bar';
    fetchBar.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:6px;';

    var fetchBtn = document.createElement('button');
    fetchBtn.type = 'button';
    fetchBtn.className = 'collection-action news-autofetch-btn';
    fetchBtn.style.cssText = 'background:#0f766e;border-color:#0f766e;color:#fff;font-size:12.5px;font-weight:700;padding:7px 14px;border-radius:7px;cursor:pointer;';
    fetchBtn.textContent = '📰 링크에서 뉴스 자동 가져오기 (제목·날짜·출처·내용·썸네일)';

    var fetchStatus = document.createElement('span');
    fetchStatus.className = 'news-autofetch-status';
    fetchStatus.style.cssText = 'font-size:12px;color:#0f766e;font-weight:600;line-height:1.4;';

    fetchBar.append(fetchBtn, fetchStatus);
    if (urlLabel) urlLabel.append(fetchBar);

    // 썸네일 미리보기 & 다운로드 도우미 박스
    var thumbHelper = document.createElement('div');
    thumbHelper.className = 'news-thumb-helper';
    thumbHelper.style.cssText = 'display:none;margin-top:8px;padding:10px 12px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;font-size:12px;color:#334155;';

    var thumbPreviewImg = document.createElement('img');
    thumbPreviewImg.alt = '추출된 뉴스 썸네일 미리보기';
    thumbPreviewImg.style.cssText = 'max-width:140px;aspect-ratio:3/4;object-fit:cover;border-radius:6px;border:1px solid #cbd5e1;margin-bottom:8px;display:none;background:#e2e8f0;';

    var thumbMsg = document.createElement('div');
    thumbMsg.style.cssText = 'margin-bottom:8px;line-height:1.5;font-weight:600;';

    var thumbActions = document.createElement('div');
    thumbActions.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;';

    var downloadImgBtn = document.createElement('a');
    downloadImgBtn.className = 'collection-action news-thumb-download-btn';
    downloadImgBtn.style.cssText = 'background:#1e293b;color:#fff;text-decoration:none;font-size:12px;font-weight:700;padding:6px 12px;border-radius:6px;display:inline-flex;align-items:center;gap:5px;cursor:pointer;';
    downloadImgBtn.textContent = '⬇️ 썸네일 사진 파일 다운로드';
    downloadImgBtn.target = '_blank';
    downloadImgBtn.rel = 'noopener noreferrer';

    var openOrigImgBtn = document.createElement('a');
    openOrigImgBtn.style.cssText = 'background:#fff;color:#334155;border:1px solid #94a3b8;text-decoration:none;font-size:12px;font-weight:600;padding:6px 10px;border-radius:6px;display:inline-flex;align-items:center;gap:4px;';
    openOrigImgBtn.textContent = '🔍 원본 사진 새창 열기';
    openOrigImgBtn.target = '_blank';
    openOrigImgBtn.rel = 'noopener noreferrer';

    var thumbUrlBox = document.createElement('div');
    thumbUrlBox.style.cssText = 'margin-bottom:8px;';
    var thumbUrlLabel = document.createElement('div');
    thumbUrlLabel.style.cssText = 'font-size:11.5px;font-weight:700;color:#0f766e;margin-bottom:4px;';
    thumbUrlLabel.textContent = '📌 자동 입력된 썸네일 주소 (그대로 [등록/저장]을 누르면 이 썸네일이 자동 반영됩니다):';
    var thumbUrlInput = document.createElement('input');
    thumbUrlInput.type = 'text';
    thumbUrlInput.className = 'news-thumb-auto-url-input';
    thumbUrlInput.placeholder = '썸네일 이미지 주소(URL)가 여기에 자동 입력됩니다 (직접 수정 가능)';
    thumbUrlInput.style.cssText = 'width:100%;padding:7px 9px;font-size:12px;border:1px solid #94a3b8;border-radius:6px;background:#fff;color:#0f172a;';
    thumbUrlInput.addEventListener('input', function () {
      var v = (thumbUrlInput.value || '').trim();
      if (thumbInput) thumbInput.dataset.autofetchedUrl = v;
      if (v) {
        thumbPreviewImg.src = v;
        thumbPreviewImg.style.display = 'block';
      }
      formEl.dataset.dirty = '1';
    });
    thumbUrlBox.append(thumbUrlLabel, thumbUrlInput);

    thumbActions.append(downloadImgBtn, openOrigImgBtn);
    thumbHelper.append(thumbUrlBox, thumbPreviewImg, thumbMsg, thumbActions);
    if (thumbLabel) thumbLabel.append(thumbHelper);

    if (thumbInput) {
      thumbInput.addEventListener('change', function () {
        if (thumbInput.files && thumbInput.files[0]) {
          if (currentFetchedBlobUrl) URL.revokeObjectURL(currentFetchedBlobUrl);
          currentFetchedBlobUrl = URL.createObjectURL(thumbInput.files[0]);
          thumbHelper.style.display = 'block';
          thumbPreviewImg.src = currentFetchedBlobUrl;
          thumbPreviewImg.style.display = 'block';
          thumbMsg.style.color = '#0f766e';
          thumbMsg.textContent = '✅ 선택한 사진 파일(' + thumbInput.files[0].name + ')이 준비되었습니다. 아래 [등록/변경사항 저장]을 눌러주세요.';
        }
      });
    }

    var currentFetchedBlobUrl = '';

    fetchBtn.addEventListener('click', async function () {
      var rawUrl = (urlInput.value || '').trim();
      if (!rawUrl) {
        var prompted = window.prompt('가져올 뉴스 기사 원문 링크(URL)를 입력해주세요:', 'https://');
        if (!prompted || !prompted.trim() || prompted.trim() === 'https://') return;
        rawUrl = prompted.trim();
        urlInput.value = rawUrl;
      }

      fetchBtn.disabled = true;
      fetchStatus.style.color = '#0f766e';
      fetchStatus.textContent = '⏳ 기사에서 제목·날짜·출처·내용·썸네일을 가져오는 중…';

      try {
        var meta = await fetchNewsMetadata(rawUrl);
        if (meta.title) titleInput.value = meta.title;
        if (meta.date && dateInput) dateInput.value = meta.date;
        if (meta.source && sourceInput) sourceInput.value = meta.source;
        if (meta.excerpt && excerptInput) excerptInput.value = meta.excerpt;
        formEl.dataset.dirty = '1';

        if (meta.thumbnailUrl && thumbInput) {
          thumbInput.dataset.autofetchedUrl = meta.thumbnailUrl;
          thumbUrlInput.value = meta.thumbnailUrl;
          thumbHelper.style.display = 'block';
          openOrigImgBtn.href = meta.thumbnailUrl;
          downloadImgBtn.href = meta.thumbnailUrl;
          downloadImgBtn.download = 'news-thumbnail.jpg';

          thumbPreviewImg.src = meta.thumbnailUrl;
          thumbPreviewImg.style.display = 'block';
          thumbPreviewImg.onerror = function () {
            thumbPreviewImg.src = 'https://images.weserv.nl/?url=' + encodeURIComponent(meta.thumbnailUrl.replace(/^https?:\/\//i, '')) + '&output=jpg';
          };

          var fileObj = await tryFetchImageAsFile(meta.thumbnailUrl, meta.title || 'news-thumb');
          if (fileObj) {
            if (currentFetchedBlobUrl) URL.revokeObjectURL(currentFetchedBlobUrl);
            currentFetchedBlobUrl = URL.createObjectURL(fileObj);
            thumbPreviewImg.src = currentFetchedBlobUrl;
            downloadImgBtn.href = currentFetchedBlobUrl;
            downloadImgBtn.download = fileObj.name || 'news-thumbnail.jpg';

            var attached = false;
            try {
              if (typeof DataTransfer !== 'undefined') {
                var dt = new DataTransfer();
                dt.items.add(fileObj);
                thumbInput.files = dt.files;
                attached = thumbInput.files && thumbInput.files.length > 0;
              }
            } catch (e) {}

            thumbMsg.style.color = '#0f766e';
            thumbMsg.textContent = '✅ 썸네일 사진이 자동 입력되었습니다! 별도로 파일 선택을 누르지 않고 바로 아래 [등록] 버튼만 누르면 썸네일까지 함께 등록됩니다.';
            fetchStatus.textContent = '✅ 제목·날짜·출처·요약·썸네일 사진까지 모두 자동 입력되었습니다! 바로 [등록]을 눌러주세요.';
          } else {
            // 원격 이미지 CORS 차단 시에도 URL이 자동 입력되어 바로 등록 시 썸네일로 저장됨
            var proxyDownloadUrl = 'https://images.weserv.nl/?url=' + encodeURIComponent(meta.thumbnailUrl.replace(/^https?:\/\//i, '')) + '&output=jpg&download=1';
            downloadImgBtn.href = proxyDownloadUrl;
            thumbMsg.style.color = '#0f766e';
            thumbMsg.textContent = '✅ 기사 대표 썸네일 이미지 주소가 자동 입력되었습니다! 그대로 [등록]을 누르면 이 썸네일이 자동 적용됩니다(직접 파일로 올리려면 아래 다운로드 버튼을 이용하세요).';
            fetchStatus.textContent = '✅ 제목·날짜·출처·내용·썸네일 자동 입력 완료! 바로 [등록]을 눌러주세요.';
          }
        } else {
          if (thumbInput) delete thumbInput.dataset.autofetchedUrl;
          thumbUrlInput.value = '';
          thumbHelper.style.display = 'none';
          fetchStatus.textContent = '✅ 제목·날짜·출처·내용을 가져왔습니다! (기사에 대표 썸네일이 없어 사진은 직접 선택해주세요)';
        }
      } catch (err) {
        fetchStatus.style.color = '#dc2626';
        fetchStatus.textContent = '❌ ' + (err.message || '뉴스 정보를 가져오지 못했습니다.');
      } finally {
        fetchBtn.disabled = false;
      }
    });
  }

  KinoyaCollections.mount({
    section: 'news-manage-section',
    table: 'news_items',
    fields: [
      { key: 'url', label: '원문 링크 (입력 후 [📰 링크에서 뉴스 자동 가져오기] 클릭)', url: true },
      { key: 'title', label: '제목', required: true },
      { key: 'date', label: '날짜', type: 'date' },
      { key: 'source', label: '출처' },
      { key: 'excerpt', label: '요약 / 기사 내용', type: 'textarea' },
      { key: 'thumbnail', label: '썸네일 교체', type: 'file', image: true, accept: 'image/png,image/jpeg,image/webp,image/gif' },
      { key: 'sort_order', label: '표시 순서', type: 'number', default: 0 },
      { key: 'is_published', label: '공개 화면에 표시', type: 'checkbox' }
    ]
  });

  var sectionEl = document.getElementById('news-manage-section');
  if (sectionEl) {
    var applyAll = function () {
      sectionEl.querySelectorAll('form.collection-card[data-collection="news_items"]').forEach(enhanceNewsForm);
    };
    applyAll();
    var observer = new MutationObserver(applyAll);
    observer.observe(sectionEl, { childList: true, subtree: true });
  }

  window.KinoyaNewsAutoFetch = {
    extractArticleFromHtml: extractArticleFromHtml,
    fetchNewsMetadata: fetchNewsMetadata,
    tryFetchImageAsFile: tryFetchImageAsFile,
    enhanceNewsForm: enhanceNewsForm
  };
});
