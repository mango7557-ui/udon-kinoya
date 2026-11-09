/* =========================================================
   우동키노야 공통 JavaScript
   - Nav 스크롤 상태 / 모바일 메뉴
   - FAQ 아코디언
   - 모바일 플로팅 CTA
   - 상담 폼 제출 (RESTful Table API)
   - Reveal on scroll
   ========================================================= */

// Load shared validation/API without replacing window.fetch or touching external requests.
if (!window.KinoyaRuntimeReady) {
  window.KinoyaRuntimeReady = window.KinoyaRuntime ? Promise.resolve(window.KinoyaRuntime) : new Promise(function(resolve,reject){
    var curSrc = document.currentScript ? document.currentScript.src : location.href;
    var bridge = document.createElement('script');
    bridge.src = new URL('firebase-bridge.js', curSrc).href;
    document.head.append(bridge);
    var script=document.createElement('script');script.src=new URL('site-runtime.js',curSrc).href;
    script.onload=function(){resolve(window.KinoyaRuntime);};script.onerror=function(){reject(new Error('공통 API를 불러오지 못했습니다.'));};document.head.append(script);
  });
}

// Subpages share this loader; the home page starts it earlier in the head.
if (!window.KinoyaLogo && !document.getElementById('logo-first-script')) {
  var logoScript = document.createElement('script');
  logoScript.id = 'logo-first-script';
  logoScript.src = new URL('logo-first.js', document.currentScript.src).href;
  logoScript.async = true;
  document.head.appendChild(logoScript);
}

// Only hero pages need the mobile video composition helper.
if (document.querySelector('.hero > .hero-video') && !document.getElementById('hero-video-fit-script')) {
  var videoFitScript = document.createElement('script');
  videoFitScript.id = 'hero-video-fit-script';
  videoFitScript.src = new URL('hero-video-fit.js', document.currentScript.src).href;
  videoFitScript.async = true;
  document.head.appendChild(videoFitScript);
}

// Shared scroll/section navigation state for home and detail pages.
if (document.getElementById('nav') && !document.getElementById('nav-state-script')) {
  var navStateScript = document.createElement('script');
  navStateScript.id = 'nav-state-script';
  navStateScript.src = new URL('nav-state.js', document.currentScript.src).href;
  navStateScript.async = true;
  document.head.appendChild(navStateScript);
}

function initKinoyaPage() {
  function fetch(url,options){return window.KinoyaRuntimeReady.then(function(R){return R.fetch(url,options);});}

  /* ---------- Autoplay loop videos ---------- */
  function keepAutoplayVideosRunning() {
    document.querySelectorAll('video[autoplay]').forEach(function (v) {
      v.muted = true;
      v.defaultMuted = true;
      v.loop = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      if (v.paused) {
        var p = v.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      }
      if (!v.dataset.autoplayLoopBound) {
        v.dataset.autoplayLoopBound = 'true';
        v.addEventListener('ended', function () {
          v.currentTime = 0;
          var p2 = v.play();
          if (p2 && typeof p2.catch === 'function') p2.catch(function () {});
        });
        v.addEventListener('pause', function () {
          if (!document.hidden && !v.controls) {
            var p3 = v.play();
            if (p3 && typeof p3.catch === 'function') p3.catch(function () {});
          }
        });
      }
    });
  }
  keepAutoplayVideosRunning();
  setInterval(keepAutoplayVideosRunning, 1500);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) keepAutoplayVideosRunning();
  });

  /* ---------- Mobile menu toggle ---------- */
  var toggle = document.querySelector('.nav-mobile-toggle');
  var panel = document.querySelector('.nav-mobile-panel');
  if (toggle && panel) {
    var previousOverflow = '';
    var openLabel = toggle.getAttribute('aria-label') || '메뉴 열기';
    panel.id = panel.id || 'site-mobile-menu';
    toggle.setAttribute('aria-controls', panel.id);
    panel.inert = true;
    function setMenuOpen(open, restoreFocus) {
      if (open && !panel.classList.contains('is-open')) previousOverflow = document.body.style.overflow;
      panel.classList.toggle('is-open', open);
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? (document.documentElement.lang === 'ko' ? '메뉴 닫기' : 'Close menu') : openLabel);
      panel.inert = !open;
      document.body.style.overflow = open ? 'hidden' : previousOverflow;
      if (open) panel.querySelector('a')?.focus();
      else if (restoreFocus) toggle.focus();
    }
    toggle.addEventListener('click', function () { setMenuOpen(!panel.classList.contains('is-open'), true); });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenuOpen(false, true); });
    });
    document.addEventListener('keydown', function (event) {
      if (!panel.classList.contains('is-open')) return;
      if (event.key === 'Escape') { event.preventDefault(); setMenuOpen(false, true); }
      if (event.key === 'Tab') {
        var items = [toggle].concat(Array.from(panel.querySelectorAll('a[href],button:not([disabled])')).filter(function (el) { return el.getClientRects().length; }));
        var first = items[0], last = items[items.length - 1];
        if (event.shiftKey && (document.activeElement === first || !items.includes(document.activeElement))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !items.includes(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', function () {
      if (panel.classList.contains('is-open') && getComputedStyle(toggle).display === 'none') setMenuOpen(false, false);
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    // set initial max-height for open items (server-rendered open state none by default)
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      // close siblings within same list (accordion behavior optional: allow multi-open)
      item.classList.toggle('is-open', !isOpen);
      if (!isOpen) {
        a.style.maxHeight = a.scrollHeight + 40 + 'px';
        q.setAttribute('aria-expanded', 'true');
      } else {
        a.style.maxHeight = '0px';
        q.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ---------- FAQ category tabs ---------- */
  var tabs = document.querySelectorAll('.faq-category-tabs button');
  if (tabs.length) {
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabs.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var cat = btn.getAttribute('data-cat');
        document.querySelectorAll('.faq-list [data-cat]').forEach(function (item) {
          if (cat === 'all' || item.getAttribute('data-cat') === cat) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    /* 상단 메뉴 드롭다운(#cat-브랜드 등)으로 진입 시 해당 카테고리 탭 자동 선택 */
    var applyCatHash = function () {
      var hash = window.location.hash;
      if (hash && hash.indexOf('#cat-') === 0) {
        var wantedCat = hash.slice(5);
        var targetTab = document.querySelector('.faq-category-tabs button[data-cat="' + wantedCat + '"]');
        if (targetTab) {
          targetTab.click();
          var tabsEl = document.querySelector('.faq-category-tabs');
          if (tabsEl) {
            setTimeout(function () { tabsEl.scrollIntoView({ block: 'start' }); }, 60);
          }
        }
      }
    };
    applyCatHash();
    window.addEventListener('hashchange', applyCatHash);
  }

  /* ---------- 모바일 하단 내비게이션: 현재 위치 강조 ---------- */
  var bottomNav = document.querySelector('.mobile-bottom-nav');
  if (bottomNav) {
    var stripIndex = function (pathname) {
      return pathname.replace(/\/index\.html$/, '/');
    };
    var curPath = stripIndex(new URL(document.baseURI).pathname);
    var homeLink = bottomNav.querySelector('a[data-match="/"]');
    var homeAbsPath = homeLink ? stripIndex(new URL(homeLink.getAttribute('href'), document.baseURI).pathname) : null;

    bottomNav.querySelectorAll('a[data-match]').forEach(function (a) {
      var match = a.getAttribute('data-match');
      if (match === '/') {
        if (homeAbsPath && curPath === homeAbsPath) { a.classList.add('is-active'); }
      } else if (curPath.indexOf(match) !== -1) {
        a.classList.add('is-active');
      }
    });
  }

  /* ---------- Footer: SNS 링크 통합 관리 (관리자 페이지에서 입력한 URL을 자동 반영 · 미입력 시 숨김) ----------
     관리자 페이지(/admin)의 "SNS 링크 관리" 항목(social.sns.*)에 URL을 입력·저장해두면,
     모든 페이지의 footer에 있는 SNS/지도 아이콘이 자동으로 표시되어 실제 링크로 연결됩니다.
     링크가 입력되지 않았거나 비워둔 항목은 화면에 노출되지 않습니다(display:none). */
  (function () {
    var snsItems = document.querySelectorAll('.footer-sns-item[data-label]:not(.footer-share-btn)');
    if (!snsItems.length) return;

    var snsKeyByLabel = {
      naver_map: 'social.sns.navermap',
      google_map: 'social.sns.googlemap',
      kakao_map: 'social.sns.kakaomap',
      tmap: 'social.sns.tmap',
      blog: 'social.sns.blog',
      youtube: 'social.sns.youtube',
      instagram: 'social.sns.instagram',
      threads: 'social.sns.threads',
      facebook: 'social.sns.facebook',
      kakao_channel: 'social.sns.kakaochannel',
      kakao_story: 'social.sns.kakaostory'
    };

    function applySnsRows(byKey) {
      snsItems.forEach(function (el) {
        var label = el.getAttribute('data-label');
        var key = snsKeyByLabel[label];
        var hasCustomRow = Boolean(key && Object.prototype.hasOwnProperty.call(byKey, key));
        var rawUrl = hasCustomRow ? String(byKey[key].value == null ? '' : byKey[key].value).trim() : null;

        if (rawUrl !== null) {
          if (!rawUrl || rawUrl === '#') {
            el.removeAttribute('href');
            el.classList.add('is-placeholder');
            el.style.display = 'none';
            return;
          }
          try {
            var safe = window.KinoyaRuntime ? window.KinoyaRuntime.safeURL(rawUrl) : rawUrl;
            el.setAttribute('href', safe);
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener');
            el.setAttribute('data-event', 'footer_sns_click');
            el.classList.remove('is-placeholder');
            el.style.display = '';
          } catch (e) {
            el.removeAttribute('href');
            el.classList.add('is-placeholder');
            el.style.display = 'none';
          }
        } else {
          // DB에 별도 저장값이 없을 때: 기본 href가 '#'이거나 is-placeholder이면 숨김 유지
          var curHref = (el.getAttribute('href') || '').trim();
          if (!curHref || curHref === '#' || el.classList.contains('is-placeholder')) {
            el.classList.add('is-placeholder');
            el.style.display = 'none';
          } else {
            el.classList.remove('is-placeholder');
            el.style.display = '';
          }
        }
      });
    }

    // 초기 즉시 동기화 (캐시 우선 적용 후 서버 값 반영)
    applySnsRows({});
    try {
      var cached = JSON.parse(localStorage.getItem('cms_cache') || '{}');
      if (cached && typeof cached === 'object') applySnsRows(cached);
    } catch (e) {}

    ['kinoya:cms-ready', 'home-cms-loaded'].forEach(function (evName) {
      document.addEventListener(evName, function (e) {
        if (e.detail && e.detail.rows) applySnsRows(e.detail.rows);
      });
    });

    if (window.KinoyaRuntimeReady) {
      window.KinoyaRuntimeReady.then(function (R) { return R.all('site_content'); })
        .then(function (rows) {
          var byKey = {};
          (rows || []).forEach(function (r) { if (r && r.key) byKey[r.key] = r; });
          applySnsRows(byKey);
        })
        .catch(function (err) {
          console.warn('[sns] SNS 링크를 불러오지 못했습니다(기본 상태 유지):', err);
        });
    }
  })();

  /* ---------- 협력사 로고 자동 스크롤 배너 (홈페이지에만 존재) ----------
     관리자 페이지(/admin)의 "협력사 로고 관리"에서 등록한 로고를 partner_logos
     테이블에서 읽어와, 상단(→왼쪽 흐름)/중간(→오른쪽 흐름)/하단(→왼쪽 흐름) 3줄로
     자동 스크롤 배너를 만듭니다. 등록된 로고가 하나도 없으면 섹션 자체를 숨깁니다. */
  (function () {
    var partnerSection = document.getElementById('partner-logos-section');
    if (!partnerSection) return; // 홈페이지가 아니면 아예 없음

    var rowContainers = {
      top: document.getElementById('partner-row-top'),
      middle: document.getElementById('partner-row-middle'),
      bottom: document.getElementById('partner-row-bottom')
    };

    var pEscapeHtml = function (value) {
      return String(value == null ? '' : value).replace(/&/g, '&amp;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    window.KinoyaRuntimeReady.then(function(R){return R.all('partner_logos');}).then(function(rows){return {data:rows};})
      .then(function (json) {
        var rows = (json && json.data) || [];
        if (!rows.length) return; // 등록된 로고가 없으면 섹션을 숨긴 채로 유지

        var byRow = { top: [], middle: [], bottom: [] };
        rows.forEach(function (r) {
          if (byRow[r.row] && r.image) byRow[r.row].push(r);
        });

        var anyRendered = false;
        ['top', 'middle', 'bottom'].forEach(function (rowKey) {
          var container = rowContainers[rowKey];
          var items = byRow[rowKey];
          if (!container || !items.length) return;

          items.sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });

          var itemHtml = items.map(function (item) {
            var img = '<img src="' + pEscapeHtml(item.image) + '" alt="' + pEscapeHtml(item.name || '') + '" loading="lazy">';
            var inner = item.link_url
              ? '<a href="' + pEscapeHtml((function(){try{return window.KinoyaRuntime.safeURL(item.link_url);}catch(e){return '#';}})()) + '" target="_blank" rel="noopener">' + img + '</a>'
              : img;
            return '<div class="partner-logo-item">' + inner + '</div>';
          }).join('');

          // 끊김 없는 무한 스크롤을 위해 동일한 로고 목록을 2번 이어붙입니다
          // (CSS 애니메이션이 -50% 만큼 이동 후 처음으로 되돌아가는 방식).
          container.innerHTML = '<div class="partner-logo-track">' + itemHtml + itemHtml + '</div>';
          anyRendered = true;
        });

        if (anyRendered) { partnerSection.style.display = ''; }
      })
      .catch(function (err) {
        console.warn('[partner] 협력사 로고를 불러오지 못했습니다(숨김 상태 유지):', err);
      });
  })();

  /* ---------- Footer: 공유하기 버튼 (Web Share API, 미지원 시 URL 복사) ---------- */
  document.querySelectorAll('.footer-share-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var shareData = {
        title: document.title,
        text: '우동키노야 · 木ノ屋',
        url: window.location.href
      };
      if (navigator.share) {
        navigator.share(shareData).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(function () {
          alert('링크가 복사되었습니다.');
        }).catch(function () {
          alert(window.location.href);
        });
      } else {
        alert(window.location.href);
      }
    });
  });

  /* ---------- Floating mobile CTA ---------- */
  var floatingCta = document.querySelector('.floating-cta');
  var heroEl = document.querySelector('.hero, .page-header');
  if (floatingCta) {
    var showFloating = function () {
      var triggerY = heroEl ? heroEl.offsetHeight * 0.6 : 300;
      floatingCta.classList.toggle('is-visible', window.scrollY > triggerY);
    };
    window.addEventListener('scroll', showFloating, { passive: true });
    showFloating();
  }

  /* ---------- Consultation & Contact Unified Form submit (Table API + FormSubmit email relay) ---------- */
  var DEFAULT_CONSULT_EMAIL = 'udonkinoya@daum.net';
  var consultNotifyEmail = DEFAULT_CONSULT_EMAIL;

  function bindConsultForm() {
    var consultForm = document.getElementById('consult-form');
    if (!consultForm || consultForm.dataset.bound === 'true') return;
    consultForm.dataset.bound = 'true';
    consultForm.inert = false;
    var readySubmit = consultForm.querySelector('.form-submit');
    if (readySubmit) readySubmit.disabled = false;

    var explicitEmailAttr = (consultForm.getAttribute('data-notify-email') || '').trim();
    if (explicitEmailAttr && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(explicitEmailAttr) && explicitEmailAttr !== 'delhi1984@naver.com') {
      consultNotifyEmail = explicitEmailAttr;
    }

    fetch('tables/site_content?limit=100')
      .then(function (r) { return r && r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !Array.isArray(j.data)) return;
        var row = j.data.find(function (item) { return item && item.key === 'contact.notify.email' && !item.deleted; });
        var configured = row && typeof row.value === 'string' ? row.value.trim() : '';
        if (configured && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configured) && configured !== 'delhi1984@naver.com') {
          consultNotifyEmail = configured;
        }
      })
      .catch(function () {});

    function sendConsultEmailNotification(payload, targetEmail) {
      var email = (targetEmail || DEFAULT_CONSULT_EMAIL).trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Promise.resolve(false);
      var endpoint = 'https://formsubmit.co/ajax/' + encodeURIComponent(email);
      var submittedAt = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
      var emailBody = {
        _subject: '[우동키노야 상담·문의] ' + payload.name + '님 (' + payload.startup_type + ' / ' + payload.region + ')',
        _template: 'table',
        _captcha: 'false',
        '신청자 성함': payload.name,
        '연락처': payload.phone,
        '희망지역': payload.region,
        '문의·상담 구분': payload.startup_type || '미정',
        '문의 내용': payload.message || '(없음)',
        '접수 페이지': payload.source_page || window.location.pathname,
        '접수 일시(KST)': submittedAt
      };
      return window.fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailBody)
      })
        .then(function (res) { return Boolean(res && res.ok); })
        .catch(function () { return false; });
    }

    consultForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = consultForm.querySelector('.form-submit');
      var origBtnText = submitBtn ? submitBtn.textContent : '상담 · 문의 신청하기';
      var name = consultForm.querySelector('[name="name"]').value.trim();
      var phone = consultForm.querySelector('[name="phone"]').value.trim();
      var rawRegion = consultForm.querySelector('[name="region"]') ? consultForm.querySelector('[name="region"]').value.trim() : '';
      var consent = consultForm.querySelector('[name="consent"]').checked;
      var startupTypeEl = consultForm.querySelector('[name="startup_type"]:checked');
      var startupType = startupTypeEl ? startupTypeEl.value : '미정';
      var region = rawRegion || ('[' + startupType + ']');

      if (!name || !phone) {
        alert('성함과 연락처는 필수 입력 항목입니다.');
        return;
      }
      if (!consent) {
        alert('개인정보 수집·이용에 동의해주세요.');
        return;
      }

      var payload = {
        name: name,
        phone: phone,
        region: region,
        startup_type: startupType,
        message: consultForm.querySelector('[name="message"]') ? consultForm.querySelector('[name="message"]').value.trim() : '',
        consent: consent,
        source_page: window.location.pathname,
        status: 'new'
      };

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '전송 중...'; }

      var dbSaved = false;
      fetch('/tables/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('submit failed');
          dbSaved = true;
          return res.json();
        })
        .catch(function () {
          dbSaved = false;
        })
        .then(function () {
          return sendConsultEmailNotification(payload, consultNotifyEmail).then(function (emailSent) {
            if (!dbSaved && !emailSent) {
              throw new Error('both submit methods failed');
            }
            consultForm.style.display = 'none';
            var success = document.getElementById('consult-success');
            if (success) success.classList.add('is-visible');
            if (window.dataLayer) {
              window.dataLayer.push({
                event: 'form_submit',
                form_name: 'consultation',
                notify_email: consultNotifyEmail,
                email_dispatched: emailSent
              });
            }
          });
        })
        .catch(function () {
          alert('전송 중 오류가 발생했습니다. 대표번호로 문의해주세요.');
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origBtnText; }
        });
    });
  }
  bindConsultForm();
  if (window.homeContentReady) {
    Promise.resolve(window.homeContentReady).then(bindConsultForm).catch(bindConsultForm);
  }

  /* ---------- Store slider: 자동 스크롤 + 마우스 드래그 + 터치 스와이프 ---------- */
  var slider = document.getElementById('store-slider');
  if (slider) {
    var track = slider.querySelector('.store-slider-track');
    if (track) {
      var isPointerDown = false;
      var isDragging = false;
      var startX = 0;
      var startScroll = 0;
      var autoPaused = false;
      var resumeTimer = null;
      var reduceMotion = false;

      /* 카드 세트 1벌의 너비(복제된 카드 시작 지점) 계산 → 무한 루프 리셋 기준 */
      var getHalfWidth = function () {
        return track.scrollWidth / 2;
      };

      /* 자동 스크롤 (요청된 프레임마다 아주 조금씩 이동) */
      var lastTs = null;
      var speed = 40; /* px per second */
      var rafId = null;
      var tick = function (ts) {
        if (!autoPaused && !isDragging && !reduceMotion) {
          if (lastTs !== null) {
            var dt = (ts - lastTs) / 1000;
            slider.scrollLeft += speed * dt;
            var half = getHalfWidth();
            if (half > 0 && slider.scrollLeft >= half) {
              slider.scrollLeft -= half;
            }
          }
          lastTs = ts;
        } else {
          lastTs = null;
        }
        rafId = window.requestAnimationFrame(tick);
      };
      if (!reduceMotion) {
        rafId = window.requestAnimationFrame(tick);
      }

      var pauseAuto = function () { autoPaused = true; };
      var resumeAutoLater = function (delay) {
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(function () { autoPaused = false; }, delay || 1200);
      };

      /* 마우스 드래그로 좌우 이동 */
      slider.addEventListener('pointerdown', function (e) {
        isPointerDown = true;
        isDragging = false;
        startX = e.clientX;
        startScroll = slider.scrollLeft;
        pauseAuto();
      });
      window.addEventListener('pointermove', function (e) {
        if (!isPointerDown) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 4) {
          isDragging = true;
          slider.classList.add('is-dragging');
        }
        if (isDragging) {
          slider.scrollLeft = startScroll - dx;
          e.preventDefault();
        }
      });
      var endDrag = function () {
        if (isPointerDown) {
          isPointerDown = false;
          slider.classList.remove('is-dragging');
          resumeAutoLater(1200);
          /* 클릭(드래그 아님)이었다면 이후 click 이벤트는 그대로 통과되어 카드 링크 이동 가능 */
          setTimeout(function () { isDragging = false; }, 0);
        }
      };
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);

      /* 드래그로 판단된 경우 카드 링크 클릭 막기(의도치 않은 페이지 이동 방지) */
      track.addEventListener('click', function (e) {
        if (isDragging) { e.preventDefault(); }
      });

      /* 터치 스와이프: 네이티브 스크롤을 사용하되, 스와이프 중엔 자동재생만 멈춤 */
      slider.addEventListener('touchstart', function () { pauseAuto(); }, { passive: true });
      slider.addEventListener('touchend', function () { resumeAutoLater(1200); }, { passive: true });

      /* 마우스 휠(세로 스크롤 포함)로도 슬라이더가 좌우로 움직이도록 처리합니다.
         트랙패드의 가로 스크롤(deltaX)은 물론, 일반 마우스 휠의 세로 스크롤(deltaY)도
         가로 이동량으로 변환해서 카드가 실제로 넘어가도록 합니다. */
      slider.addEventListener('wheel', function (e) {
        var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (delta === 0) return;
        pauseAuto();
        slider.scrollLeft += delta;
        var half = getHalfWidth();
        if (half > 0) {
          if (slider.scrollLeft >= half) { slider.scrollLeft -= half; }
          else if (slider.scrollLeft < 0) { slider.scrollLeft += half; }
        }
        e.preventDefault();
        resumeAutoLater(1500);
      }, { passive: false });

      /* 최초 로드 시 카드 세트 중간 지점부터 시작하지 않고 0부터 시작 (자연스러움) */
      slider.scrollLeft = 0;
    }
  }

  /* ---------- Reveal on scroll ---------- */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    var vh = window.innerHeight;
    document.querySelectorAll('.section .container > *, .page-header .container > *').forEach(function (el) {
      if (el.classList.contains('menu-page-grid')) return; // Menu photos should not wait for the reveal animation.
      var rect = el.getBoundingClientRect();
      if (rect.top > vh * 0.85 && rect.height <= vh * 1.5) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(16px)';
        el.style.transition = 'opacity 640ms cubic-bezier(0.16,1,0.3,1), transform 640ms cubic-bezier(0.16,1,0.3,1)';
        io.observe(el);
      }
    });
  }

  /* ---------- Analytics event hooks (no-op if no analytics loaded) ---------- */
  function track(eventName, params) {
    if (window.gtag) { window.gtag('event', eventName, params || {}); }
    if (window.dataLayer) { window.dataLayer.push(Object.assign({ event: eventName }, params || {})); }
    logVisitorEvent('click', eventName, (params && params.label) || '');
  }
  document.querySelectorAll('[data-event]').forEach(function (el) {
    el.addEventListener('click', function () {
      track(el.getAttribute('data-event'), { label: el.getAttribute('data-label') || '' });
    });
  });

  /* ---------- 방문자 통계 로깅 (자체 수집, visitor_logs 테이블) ----------
     관리자 페이지(/admin)의 "방문자 통계 리포트"에서 확인할 수 있도록, 페이지뷰(1회/페이지 로드)와
     [data-event] 클릭을 visitor_logs 테이블에 기록합니다. 세션ID는 로그인 없이 sessionStorage에
     저장해 "같은 방문(탭이 열려있는 동안)"을 구분하는 용도로만 사용하며, 개인을 식별하지 않습니다. */
  var VISITOR_SESSION_KEY = 'kinoya_visitor_session_id';
  function getVisitorSessionId() {
    try {
      var sid = sessionStorage.getItem(VISITOR_SESSION_KEY);
      if (!sid) {
        sid = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem(VISITOR_SESSION_KEY, sid);
      }
      return sid;
    } catch (e) {
      return 'v_nosession';
    }
  }
  function logVisitorEvent(eventType, labelOrEventName, extraLabel) {
    try {
      var payload = {
        session_id: getVisitorSessionId(),
        event_type: eventType,
        page_path: window.location.pathname,
        label: eventType === 'click' ? (labelOrEventName + (extraLabel ? (':' + extraLabel) : '')) : '',
        referrer: eventType === 'pageview' ? (document.referrer || '') : '',
        device_type: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      };
      fetch('/tables/visitor_logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(function () {}); // 통계 수집 실패는 화면에 영향을 주지 않도록 무시합니다.
    } catch (e) { /* 통계 수집 오류가 사이트 동작에 영향을 주지 않도록 무시합니다. */ }
  }
  logVisitorEvent('pageview');

  /* ---------- Social Media Section (YouTube 자동 연동) ---------- */
  // 관리자 페이지(/admin)에서 입력한 유튜브 API 키/채널ID(social.youtube.apikey,
  // social.youtube.channelid)를 site_content 테이블에서 읽어와, 값이 있으면 실제
  // 유튜브 채널에서 쇼츠와 최신 영상, 채널 통계(구독자/조회수/영상수)를 불러옵니다.
  // 샘플(더미) 데이터는 사용하지 않으며, API 연동이 되어 있지 않거나 실패하면
  // Shorts/최신동영상 영역 자체가 화면에 표시되지 않습니다(각 섹션은 기본 display:none).
  //
  // 보안 안내: 정적 사이트 구조상 이 키는 브라우저에서 완전히 숨겨지지 않습니다.
  // Google Cloud Console에서 반드시 "YouTube Data API v3"로만 API를 제한하고,
  // HTTP 리퍼러를 본인 도메인으로 제한해 등록해주세요.

    /* Admin navigation only. Authentication is enforced by platform route rules. */
    var footerLogo = document.querySelector('.footer-brand .footer-logo-img');
    if (footerLogo) {
      footerLogo.setAttribute('role','link');footerLogo.setAttribute('tabindex','0');footerLogo.setAttribute('aria-label','관리자 페이지로 이동');
      var openAdmin=function(){window.KinoyaRuntimeReady.then(function(R){window.location.href=new URL('admin/',R.root).href;}).catch(function(){alert('관리자 링크를 불러오지 못했습니다.');});};
      footerLogo.addEventListener('click',openAdmin);
      footerLogo.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openAdmin();}});
    }
  }

  /* ---------- Social Media Section (YouTube 자동 연동 · 즉시 시작) ---------- */
  function initSocialYoutubeFast() {
    if (window.__kinoyaSocialYtStarted) return;
    var shortsSection = document.getElementById('shorts-section');
    var videosSection = document.getElementById('videos-section');
    var shortsContainer = document.getElementById('shorts-slider');
    var videoRowContainers = [
      document.getElementById('videos-row-0'),
      document.getElementById('videos-row-1'),
      document.getElementById('videos-row-2')
    ];
    var videosContainer = videoRowContainers[0]; // 존재 여부 체크용(하위 호환)

    if (!shortsContainer || !videosContainer) return;
    window.__kinoyaSocialYtStarted = true;

    var ytEscapeHtml = function (value) {
      return String(value == null ? '' : value).replace(/&/g, '&amp;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    var formatCount = function (n) {
      n = Number(n) || 0;
      if (n >= 10000) { return (Math.floor(n / 1000) / 10).toFixed(1).replace(/\.0$/, '') + '만+'; }
      if (n >= 1000) { return Math.floor(n / 100) / 10 + '천+'; }
      return String(n) + '+';
    };

    var renderShorts = function (shorts) {
      if (!shorts || !shorts.length) { if (shortsSection) shortsSection.style.display = 'none'; return; }
      shortsContainer.innerHTML = shorts.map(function (s, idx) {
        var eager = idx < 4 ? 'loading="eager" fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"';
        return '<a href="https://www.youtube.com/shorts/' + encodeURIComponent(s.id) + '" target="_blank" rel="noopener noreferrer" class="short-card" aria-label="쇼츠 보기">' +
                 '<img src="' + ytEscapeHtml(s.thumbnail) + '" alt="" ' + eager + '>' +
                 '<div class="short-overlay">' +
                   '<div class="short-title">' + ytEscapeHtml(s.title) + '</div>' +
                   (s.views ? '<div class="short-views">조회수 ' + ytEscapeHtml(s.views) + '</div>' : '') +
                 '</div>' +
               '</a>';
      }).join('');
      if (shortsSection) shortsSection.style.display = '';
    };

    // 최신 동영상: 3행(행마다 최대 10개)으로 나누어 렌더링합니다.
    var videoCardHtml = function (v, idx) {
      var eager = idx < 4 ? 'loading="eager" fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"';
      return '<a href="https://www.youtube.com/watch?v=' + encodeURIComponent(v.id) + '" target="_blank" rel="noopener noreferrer" class="video-card">' +
               '<div class="video-thumb">' +
                 '<img src="' + ytEscapeHtml(v.thumbnail) + '" alt="" ' + eager + '>' +
                 (v.duration ? '<span class="video-duration">' + ytEscapeHtml(v.duration) + '</span>' : '') +
               '</div>' +
               '<div class="video-info">' +
                 '<div class="video-title">' + ytEscapeHtml(v.title) + '</div>' +
                 '<div class="video-meta">' + [v.views ? '조회수 ' + v.views : '', v.date || ''].filter(function (s) { return !!s; }).map(ytEscapeHtml).join(' · ') + '</div>' +
               '</div>' +
             '</a>';
    };

    var ROWS = 3;
    var PER_ROW = 10;

    var renderVideos = function (videos) {
      if (!videos || !videos.length) { if (videosSection) videosSection.style.display = 'none'; return; }
      for (var r = 0; r < ROWS; r++) {
        var container = videoRowContainers[r];
        if (!container) continue;
        var chunk = videos.slice(r * PER_ROW, r * PER_ROW + PER_ROW);
        container.innerHTML = chunk.map(function (v, idx) { return videoCardHtml(v, r === 0 ? idx : 99); }).join('');
        /* 영상 개수가 적어 뒤쪽 행(2행/3행)에 채울 카드가 없으면,
           화살표 버튼만 덩그러니 남지 않도록 해당 행(.video-row) 전체를 숨깁니다. */
        var rowEl = container.closest ? container.closest('.video-row') : container.parentElement;
        if (rowEl) { rowEl.style.display = chunk.length ? '' : 'none'; }
      }
      if (videosSection) videosSection.style.display = '';
    };

    // 샘플(더미) 데이터는 사용하지 않습니다. 실제 유튜브 연동 전까지는
    // Shorts/최신동영상 영역 자체가 화면에 표시되지 않습니다(HTML의 display:none 기본값 유지).

    var initShortsSlider = function () {
      var prevBtn = document.querySelector('.shorts-container .prev-btn');
      var nextBtn = document.querySelector('.shorts-container .next-btn');
      if (prevBtn && nextBtn) {
        prevBtn.onclick = function () { shortsContainer.scrollBy({ left: -300, behavior: 'smooth' }); };
        nextBtn.onclick = function () { shortsContainer.scrollBy({ left: 300, behavior: 'smooth' }); };
      }
    };
    initShortsSlider();

    // 최신 동영상 각 행의 좌우 화살표 버튼 연결 (수동 이동)
    var initVideoRowButtons = function () {
      document.querySelectorAll('.video-row').forEach(function (row) {
        var track = row.querySelector('.videos-track');
        var prevBtn = row.querySelector('.prev-btn');
        var nextBtn = row.querySelector('.next-btn');
        if (!track || !prevBtn || !nextBtn) return;
        prevBtn.onclick = function () { track.scrollBy({ left: -320, behavior: 'smooth' }); };
        nextBtn.onclick = function () { track.scrollBy({ left: 320, behavior: 'smooth' }); };
      });
    };
    initVideoRowButtons();

    // 최신 동영상 3행 + Shorts 슬라이더를 각각 한 장씩(카드 1개 폭만큼) 자동으로 슬라이드합니다.
    // 슬라이드 간격(초)은 관리자 페이지(social.youtube.autoslide.seconds)에서 설정하며,
    // 기본값은 4초입니다. 끝까지 이동하면 처음으로 되돌아갑니다.
    var videoAutoSlideTimer = null;
    var startVideoAutoSlide = function (seconds) {
      if (videoAutoSlideTimer) { clearInterval(videoAutoSlideTimer); videoAutoSlideTimer = null; }
      var intervalMs = (Number(seconds) > 0 ? Number(seconds) : 4) * 1000;
      videoAutoSlideTimer = setInterval(function () {
        document.querySelectorAll('.videos-track, .shorts-slider').forEach(function (track) {
          if (!track.children.length) return;
          var cardWidth = track.children[0].getBoundingClientRect().width + 16; // 카드폭 + gap
          var atEnd = Math.ceil(track.scrollLeft + track.clientWidth) >= track.scrollWidth;
          if (atEnd) {
            track.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            track.scrollBy({ left: cardWidth, behavior: 'smooth' });
          }
        });
      }, intervalMs);
    };
    startVideoAutoSlide(4);

    var YT_CACHE_KEY = 'kinoya_yt_fast_v1';
    var applyYoutubeStats = function (byKey) {
      if (!byKey) return;
      var autoSlideSecondsRaw = byKey['social.youtube.autoslide.seconds'] && byKey['social.youtube.autoslide.seconds'].value;
      var autoSlideSeconds = parseFloat(autoSlideSecondsRaw);
      if (Number.isFinite(autoSlideSeconds) && autoSlideSeconds >= 1 && autoSlideSeconds <= 120) { startVideoAutoSlide(autoSlideSeconds); }

      var statsSection = document.getElementById('social-stats');
      var subsEl = document.getElementById('stat-subscribers-value');
      var viewsEl = document.getElementById('stat-views-value');
      var videosEl = document.getElementById('stat-videos-value');
      var subsVal = byKey['social.youtube.stats.subscribers'] && byKey['social.youtube.stats.subscribers'].value;
      var viewsVal = byKey['social.youtube.stats.views'] && byKey['social.youtube.stats.views'].value;
      var videoCountVal = byKey['social.youtube.stats.videocount'] && byKey['social.youtube.stats.videocount'].value;
      if (subsEl && subsVal) subsEl.textContent = subsVal + '+';
      if (viewsEl && viewsVal) viewsEl.textContent = viewsVal + '+';
      if (videosEl && videoCountVal) videosEl.textContent = videoCountVal + '+';
      if (statsSection && (subsVal || viewsVal || videoCountVal)) { statsSection.style.display = ''; }
    };

    var applyYoutubeVideos = function (allVideos) {
      if (!Array.isArray(allVideos)) return;
      var sorted = allVideos.slice().sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
      var shorts = sorted.filter(function (v) { return v.video_type === '쇼츠'; }).map(function (v) {
        return { id: v.youtube_id, title: v.title, views: v.views, thumbnail: v.thumbnail };
      });
      var normalVideos = sorted.filter(function (v) { return v.video_type !== '쇼츠'; }).map(function (v) {
        return { id: v.youtube_id, title: v.title, views: v.views, date: v.published_at, duration: v.duration, thumbnail: v.thumbnail };
      });
      if (shorts.length) renderShorts(shorts.slice(0, 10));
      if (normalVideos.length) renderVideos(normalVideos.slice(0, ROWS * PER_ROW));
      initShortsSlider();
      initVideoRowButtons();
    };

    // 1) 로컬 캐시(kinoya_yt_fast_v1 / cms_cache)가 있으면 0ms 즉시 렌더링
    try {
      var cachedYt = JSON.parse(localStorage.getItem(YT_CACHE_KEY) || 'null');
      if (cachedYt) {
        if (cachedYt.stats) applyYoutubeStats(cachedYt.stats);
        if (cachedYt.videos) applyYoutubeVideos(cachedYt.videos);
      } else {
        var cachedCms = JSON.parse(localStorage.getItem('cms_cache') || 'null');
        if (cachedCms) applyYoutubeStats(cachedCms);
      }
    } catch (e) {}

    // 2) youtube_videos와 site_content를 서로 기다리지 않고 도착하는 즉시 개별 렌더링
    var latestStats = null;
    var latestVideos = null;
    var saveYtCache = function () {
      try {
        localStorage.setItem(YT_CACHE_KEY, JSON.stringify({
          stats: latestStats,
          videos: latestVideos,
          ts: Date.now()
        }));
      } catch (e) {}
    };

    window.KinoyaRuntimeReady.then(function (R) { return R.all('youtube_videos'); })
      .then(function (rows) {
        latestVideos = rows || [];
        applyYoutubeVideos(latestVideos);
        saveYtCache();
      })
      .catch(function (err) {
        console.warn('[social] 유튜브 영상 목록을 불러오지 못했습니다:', err);
      });

    window.KinoyaRuntimeReady.then(function (R) { return R.all('site_content'); })
      .then(function (rows) {
        var byKey = {};
        (rows || []).forEach(function (r) { if (r && r.key) byKey[r.key] = r; });
        latestStats = {
          'social.youtube.autoslide.seconds': byKey['social.youtube.autoslide.seconds'],
          'social.youtube.stats.subscribers': byKey['social.youtube.stats.subscribers'],
          'social.youtube.stats.views': byKey['social.youtube.stats.views'],
          'social.youtube.stats.videocount': byKey['social.youtube.stats.videocount']
        };
        applyYoutubeStats(byKey);
        saveYtCache();
      })
      .catch(function (err) {
        console.warn('[social] 유튜브 통계 데이터를 불러오지 못했습니다:', err);
      });
  }
  function readyKinoyaPage(){ initSocialYoutubeFast(); Promise.resolve(window.homeContentReady).then(initKinoyaPage); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',readyKinoyaPage,{once:true});
  else readyKinoyaPage();
