/* 우동키노야 관리자: 필드 목록은 admin/index.html에 포함되어 있습니다. */
window.addEventListener('error', function (event) {
  var status = document.getElementById('save-status');
  if (status) {
    status.className = 'mb-4 rounded-lg px-4 py-3 text-sm bg-red-50 text-red-800 border border-red-200';
    status.textContent = '관리자 화면 스크립트 오류: ' + (event && event.message ? event.message : '알 수 없는 오류') + ' (새로고침 후에도 반복되면 담당자에게 문의해주세요)';
  }
});
(function () {
  'use strict';
  var fetch = AdminCore.fetch;
  var saving = false;
  var photoJobs = 0;
  var nav = document.getElementById('group-nav');
  var container = document.getElementById('fields-container');
  var saveBtn = document.getElementById('save-all-btn');
  var status = document.getElementById('save-status');
  var rows = Object.create(null);
  var images = Object.create(null);
  var pendingMenuPhotos = Object.create(null);
  var menuPreviewURLs = Object.create(null);
  var loadedKeys = Object.create(null);
  var ready = false;
  window.KinoyaAdminEditor = {
    getRow: function (key) { return rows[key] || null; },
    getRowsByPrefix: function (prefix) {
      var out = [];
      Object.keys(rows).forEach(function (k) {
        if (!prefix || k.indexOf(prefix) === 0) out.push(rows[k]);
      });
      return out;
    },
    setRow: function (key, row) {
      if (row) rows[key] = row; else delete rows[key];
      loadedKeys[key] = true;
    },
    isKeyLoaded: function (key) { return !!loadedKeys[key]; },
    isReady: function () { return !!ready; }
  };
  var partialRead = false;
  var contentReadError = '';
  function clearIndexedDbMenuCache(){
    try{
      if(!window.indexedDB)return;
      var req=indexedDB.open('kinoya_menu_photos_v1',1);
      req.onupgradeneeded=function(){req.result.createObjectStore('snapshots');};
      req.onsuccess=function(){
        try{
          var db=req.result;
          var tx=db.transaction('snapshots','readwrite');
          tx.objectStore('snapshots').delete('menu');
          tx.oncomplete=function(){db.close();};
          tx.onerror=function(){db.close();};
        }catch(e){}
      };
    }catch(ignored){}
  }
  function updateMenuCache(key,row){
    try{
      localStorage.removeItem('cms_cache');
      localStorage.removeItem('cms_cache_v2');
      var menuCache=JSON.parse(localStorage.getItem('kinoya_menu_cache_v1')||'{}');
      if(!menuCache||Array.isArray(menuCache)||typeof menuCache!=='object')menuCache={};
      if(row)menuCache[key]=row;else delete menuCache[key];
      localStorage.setItem('kinoya_menu_cache_v1',JSON.stringify(menuCache));
      clearIndexedDbMenuCache();
    }catch(ignored){}
  }
  async function readExistingRow(f){
    var current=rows[f.key];
    if(current&&current.id){
      try{
        var response=await fetch('/tables/site_content/'+encodeURIComponent(current.id),{cache:'no-store'});
        var latest=await response.json();
        if(latest&&Array.isArray(latest.data)&&latest.id===undefined){
          latest=latest.data.find(function(r){return r&&r.id===current.id;})||latest.data.find(function(r){return r&&r.key===f.key;})||current;
        }
        if(latest&&!latest.deleted)return latest;
        return null;
      }catch(error){
        if(error&&error.status===404)return null;
        throw error;
      }
    }
    if(loadedKeys[f.key])return current||null;
    var found;
    try{
      found=(await AdminCore.all('site_content',{search:f.key})).filter(function(row){return row.key===f.key;});
    }catch(searchErr){
      if(searchErr&&searchErr.status===500){
        found=(await AdminCore.all('site_content')).filter(function(row){return row.key===f.key;});
      }else throw searchErr;
    }
    if(found.length>1)throw new Error('중복 CMS 키입니다: '+f.key+'. 관리자 확인이 필요합니다.');
    return found[0]||null;
  }
  async function ensureFieldLoaded(f){
    if(loadedKeys[f.key])return;
    var found=await readExistingRow(f);
    if(found)rows[f.key]=found;else delete rows[f.key];
    loadedKeys[f.key]=true;
  }
  var emptyMenuPreview = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  function peoplePhoto(f) { return /^people\.profile\.\d+\.image$/.test(f.key); }
  function storePhoto(f) { return f.type==='image' && /^store\.\d+\.photo$/.test(f.key); }
  function menuPhoto(f) { return f.type==='image' && !peoplePhoto(f); }
  function textMessage(f,text,error) {
    var el=document.getElementById('text-status-'+idFor(f.key));
    if(el){el.textContent=text;el.style.color=error?'#b91c1c':'#047857';}
  }
  function photoMessage(f,text,error) {
    var el=document.getElementById('photo-status-'+idFor(f.key));
    if(el){el.textContent=text;el.style.color=error?'#b91c1c':'#475569';}
  }
  function releaseMenuPreview(key) {
    if(menuPreviewURLs[key]){URL.revokeObjectURL(menuPreviewURLs[key]);delete menuPreviewURLs[key];}
  }
  function setMenuPreview(f,value) {
    var preview=document.getElementById('preview-'+idFor(f.key));
    if(!preview)return;
    var resolved=value;
    if(resolved && window.__kinoyaGetCachedFileDataUrl){
      var cachedData=window.__kinoyaGetCachedFileDataUrl(resolved);
      if(cachedData)resolved=cachedData;
    }
    if(resolved&&!/^data:/i.test(resolved)&&!/^blob:/i.test(resolved)){
      try{resolved=new URL(resolved.indexOf('/files/')===0?resolved.slice(1):resolved,AdminCore.root).href;}catch(e){}
    }
    preview.hidden=!resolved;preview.style.display=resolved?'':'none';
    if(resolved)preview.src=resolved;else preview.removeAttribute('src');
    if(window.__kinoyaHydrateFiles)setTimeout(window.__kinoyaHydrateFiles,0);
  }
  async function clearMenuPhoto(f) {
    if(saving||photoJobs){photoMessage(f,'현재 사진 처리·저장이 끝난 후 다시 눌러주세요.',true);return;}
    var preview=document.getElementById('preview-'+idFor(f.key)),previous=preview.getAttribute('src')||'';
    saving=true;container.inert=true;saveBtn.disabled=true;
    setMenuPreview(f,'');photoMessage(f,'사진을 비우고 저장하는 중…');
    try{
      await ensureFieldLoaded(f);
      await saveField(f,'');releaseMenuPreview(f.key);
      if (/^global\.logo\.(header|footer)$/.test(f.key)) {
        try { localStorage.removeItem('kinoya_logo_cache_v1'); sessionStorage.removeItem('kinoya_logo_cache_v1'); } catch (e) {}
      }
      try { localStorage.removeItem('cms_cache'); } catch (e) {}
      photoMessage(f,'사진을 비웠습니다. 저장 완료 — 전체 저장을 따로 누르지 않아도 됩니다.');
      message(f.label+' 사진 비우기 저장 완료. 공개 화면은 새로고침하여 확인하세요.','ok');
    }catch(error){
      setMenuPreview(f,previous);
      photoMessage(f,'사진 비우기 실패: '+error.message+' 기존 사진·선택 파일을 유지했습니다. 사진 비우기를 눌러 직접 다시 시도해주세요.',true);
      message('사진 비우기 실패: '+error.message,'error');
    }finally{saving=false;container.inert=false;saveBtn.disabled=!ready;}
  }
  async function restoreDefaultMenuPhoto(f) {
    if(saving||photoJobs){photoMessage(f,'현재 사진 처리·저장이 끝난 후 다시 눌러주세요.',true);return;}
    if(!f.current){photoMessage(f,'이 항목은 기본 사진 파일이 없습니다.',true);return;}
    var preview=document.getElementById('preview-'+idFor(f.key)),previous=preview.getAttribute('src')||'',defaultSrc=new URL(f.current,AdminCore.root).href;
    saving=true;container.inert=true;saveBtn.disabled=true;
    photoMessage(f,'기본 사진으로 되돌리는 중…');
    try{
      await ensureFieldLoaded(f);
      var fresh=await readExistingRow(f);
      if(String(fresh?.value??'')!==String(rows[f.key]?.value??''))throw new Error('다른 화면에서 변경된 항목입니다: '+f.key+'. 새로고침 후 다시 시도하세요.');
      if(fresh?.id)await fetch('/tables/site_content/'+encodeURIComponent(fresh.id),{method:'DELETE'});
      delete rows[f.key];loadedKeys[f.key]=true;delete pendingMenuPhotos[f.key];delete images[f.key];releaseMenuPreview(f.key);
      var fileInput=document.getElementById('file-'+idFor(f.key));if(fileInput)fileInput.value='';
      setMenuPreview(f,defaultSrc);updateMenuCache(f.key,null);
      if (/^global\.logo\.(header|footer)$/.test(f.key)) {
        try { localStorage.removeItem('kinoya_logo_cache_v1'); sessionStorage.removeItem('kinoya_logo_cache_v1'); } catch (e) {}
      }
      try { localStorage.removeItem('cms_cache'); } catch (e) {}
      photoMessage(f,'✅ 기본 사진('+f.current+')으로 복원했습니다. 별도 파일 업로드는 필요하지 않습니다.');
      message(f.label+' 기본 사진 복원 완료. 공개 화면은 새로고침하여 확인하세요.','ok');
    }catch(error){
      setMenuPreview(f,previous);
      photoMessage(f,'기본 사진 복원 실패: '+error.message+' 직접 다시 시도해주세요.',true);
      message('기본 사진 복원 실패: '+error.message,'error');
    }finally{saving=false;container.inert=false;saveBtn.disabled=!ready;}
  }
  var autoPeople = !!window.CMS_AUTO_SAVE_PEOPLE_PHOTOS;
  function peopleText(value) {
    var template = document.createElement('template'); template.innerHTML=String(value == null ? '' : value);
    template.content.querySelectorAll('br').forEach(function (br) { br.replaceWith('\n'); });
    return template.content.textContent;
  }
  var fields = (window.CMS_FIELDS && window.CMS_FIELDS.length) ? window.CMS_FIELDS : null;

  // Binary upload first, then persist only the platform's returned reference.
  function uploadPngUnder600KB(file) {
    return AdminCore.uploadImage(file);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function idFor(key) { return key.replace(/[^a-zA-Z0-9]/g, '-'); }
  function message(text, type) {
    var colors = {
      ok: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      error: 'bg-red-50 text-red-800 border border-red-200',
      warn: 'bg-amber-50 text-amber-800 border border-amber-200',
      info: 'bg-slate-50 text-slate-700 border border-slate-200'
    };
    status.className = 'mb-4 rounded-lg px-4 py-3 text-sm ' + (colors[type] || colors.info);
    status.textContent = text;
  }
  function fieldMarkup(f) {
    var id = idFor(f.key);
    var storeMatch = f.key.match(/^store\.(\d+)\./);
    var storeAttr = storeMatch ? ' data-store-num="' + storeMatch[1] + '"' : '';
    var storeGalMatch = f.key.match(/^store\.gallery\.(\d+)\./);
    var storeGalAttr = storeGalMatch ? ' data-store-gallery-num="' + storeGalMatch[1] + '"' : '';
    var foodMatch = f.key.match(/^menu\.food\.(\d+)\./);
    var foodAttr = foodMatch ? ' data-food-num="' + foodMatch[1] + '"' : '';
    var isStoreHeader = /^store\.\d+\.photo$/.test(f.key) || /^store\.gallery\.\d+\.photo$/.test(f.key) || /^menu\.food\.\d+\.bg$/.test(f.key);
    var fallbackImage = (menuPhoto(f) || peoplePhoto(f)) ? emptyMenuPreview : 'images/favicon.png';
    var currentPreview = f.current || fallbackImage;
    if (currentPreview && !/^data:/i.test(currentPreview)) currentPreview = new URL(currentPreview, AdminCore.root).href;
    var html = '<div' + storeAttr + storeGalAttr + foodAttr + ' class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start' + (isStoreHeader ? ' pt-5 mt-5 border-t border-slate-200 first:pt-0 first:mt-0 first:border-t-0' : '') + '">' +
      '<div><label class="text-sm font-medium text-slate-700" for="' + (f.type === 'image' ? 'file-' : 'text-') + id + '">' + escapeHtml(f.label) + '</label>' +
      '<div class="text-xs text-slate-400 mt-0.5 font-mono break-all">' + escapeHtml(f.key) + '</div></div>' +
      '<div class="sm:col-span-2">';
    if (f.type === 'image') {
      html += '<div class="flex items-center gap-3 flex-wrap">' +
        '<img id="preview-' + id + '" src="' + escapeHtml(currentPreview) + '" alt="' + escapeHtml(f.label) + ' 미리보기" class="w-28 h-20 object-contain rounded-lg border border-slate-200 bg-slate-50" style="' + (f.key.indexOf('logo') !== -1 ? 'background:#1E2A38;' : '') + '">' +
        '<button type="button" data-select-photo="'+id+'" aria-controls="file-'+id+'" class="cursor-pointer text-sm bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition"><i class="fa-solid fa-image mr-1" aria-hidden="true"></i>사진 선택</button>' +
        '<input type="file" id="file-' + id + '" accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif" class="'+(menuPhoto(f)?'block w-full max-w-full text-sm':'sr-only')+'"'+(menuPhoto(f)?' style="order:5;flex-basis:100%;min-width:0;" aria-describedby="photo-status-'+id+'"':'')+'>' +
        (menuPhoto(f)?'<button type="button" data-save-menu-photo="'+id+'" class="text-sm bg-emerald-700 text-white px-3 py-2 rounded-lg">이 사진 저장</button>':'') +
        '<button type="button" data-retry-photo="'+id+'" class="text-sm border border-slate-300 px-3 py-2 rounded-lg">사진 처리 다시 시도</button>' +
        (menuPhoto(f) || peoplePhoto(f) ? '<button type="button" data-clear-menu-photo="' + id + '" class="text-sm border border-slate-300 hover:bg-slate-100 px-3 py-2 rounded-lg transition">사진 비우기</button>' : '') +
        (menuPhoto(f)&&f.current?'<button type="button" data-restore-menu-photo="'+id+'" class="text-sm border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg transition">기본 사진 복원</button>':'') + '</div>' +
        '<p id="photo-status-'+id+'" role="status" aria-live="polite" class="text-xs mt-2 break-words">'+(menuPhoto(f)?'사진 선택은 이 기기에서 미리보기만 합니다. 선택 후 이 사진 저장 또는 전체 저장을 누르세요. PNG/JPG/WebP/GIF → PNG 자동 변환 · 600KB 이하 자동 축소 · 원본 15MB 이하.':'')+'</p>' +
        '<div class="text-xs text-slate-400 mt-1">' + (autoPeople && peoplePhoto(f) ? '새 사진을 선택하면 자동 변환 후 즉시 저장합니다. 기존 CMS 사진 값을 덮어쓰고 별도 이력은 만들지 않습니다. 사진 비우기도 즉시 저장됩니다.' : menuPhoto(f) ? '사진 선택 시 PNG·600KB 이하로 자동 변환한 미리보기가 표시됩니다. 비율 유지·최대변 2000px·작은 사진 확대 없음. 실제 저장에는 Hosted 파일 업로드 활성화가 필요합니다. 프리뷰에서는 미리보기만 가능할 수 있으며 저장 실패 시 선택 사진을 유지합니다. 사진 비우기는 누르면 해당 사진만 즉시 저장되며, 실패 시 이전 사진을 복원합니다.' : '사진을 선택하면 자동으로 PNG로 바뀌고 600KB 이하로 비율을 유지하며 자동 축소됩니다. 저장 후 사이트에 반영됩니다.') + '</div>';
    } else if (f.type === 'video') {
      var videoPreviewUrl = f.current || '';
      if (videoPreviewUrl && !/^data:/i.test(videoPreviewUrl)) videoPreviewUrl = new URL(videoPreviewUrl, AdminCore.root).href;
      html += '<div class="space-y-3">' +
        '<video id="video-preview-' + id + '" src="' + escapeHtml(videoPreviewUrl) + '" controls playsinline webkit-playsinline preload="metadata" class="w-full max-w-xl rounded-lg border border-slate-200 bg-slate-900"></video>' +
        '<div class="flex items-center gap-2 flex-wrap">' +
          '<button type="button" data-select-video="' + id + '" aria-controls="video-file-' + id + '" class="cursor-pointer text-sm bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition"><i class="fa-solid fa-film mr-1" aria-hidden="true"></i>MP4 영상 파일 선택</button>' +
          '<input type="file" id="video-file-' + id + '" accept="video/mp4,video/webm,.mp4,.webm" class="sr-only">' +
          (f.current ? '<button type="button" data-restore-video="' + id + '" class="text-sm border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg transition">기본 영상 복원</button>' : '') +
        '</div>' +
        '<input type="text" id="text-' + id + '" value="' + escapeHtml(f.current || '') + '" placeholder="예: images/kinoya-7000-open.mp4 또는 /files/cms-videos/..." class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700">' +
        '<p id="video-status-' + id + '" class="text-xs text-slate-500">현재 연결된 영상이 미리보기로 표시됩니다. MP4 영상 파일을 선택해 업로드(10MB 이하 · Hosted 파일 서비스 활성화 필요)하거나 직접 영상 경로/URL을 입력한 뒤 상단 <b>전체 저장</b>을 누르세요.</p>' +
      '</div>';
    } else if (f.key === 'social.youtube.apikey') {
      html += '<div class="flex items-center gap-2">' +
          '<input type="password" id="text-' + id + '" autocomplete="new-password" spellcheck="false" value="' + escapeHtml(f.current || '') + '" placeholder="비공개 암호화 보호됨 (유튜브 Data API 키 입력)" class="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-700">' +
          '<button type="button" id="toggle-yt-apikey-visibility" class="text-xs border border-slate-300 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition shrink-0"><i class="fa-solid fa-eye-slash mr-1"></i>비공개 숨김중</button>' +
        '</div>' +
        '<div class="flex flex-wrap items-center gap-2 mt-2">' +
          '<button type="button" data-save-one-text="' + id + '" class="text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg transition"><i class="fa-solid fa-lock mr-1"></i>암호화 저장</button>' +
          '<span id="text-status-' + id + '" role="status" aria-live="polite" class="text-xs"></span>' +
        '</div>' +
        '<div class="text-xs text-emerald-700 mt-1">🔒 입력하신 API 키는 화면에서 비공개(••••) 처리되며, 저장 시 암호화(enc:v1:...)되어 평문으로 노출되지 않습니다.</div>';
    } else if (f.key === 'menu.autoslide.seconds') {
      html += '<input type="number" id="text-' + id + '" min="1" max="120" step="0.1" inputmode="decimal" value="' + escapeHtml(f.current || '4') + '" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700" aria-describedby="help-' + id + '">' +
        '<div class="flex flex-wrap items-center gap-2 mt-2">' +
          '<button type="button" data-save-one-text="' + id + '" class="text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg transition"><i class="fa-solid fa-floppy-disk mr-1"></i>이 항목 저장</button>' +
          (f.current ? '<button type="button" data-restore-one-text="' + id + '" class="text-xs border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition">기본값 복원</button>' : '') +
          '<span id="text-status-' + id + '" role="status" aria-live="polite" class="text-xs"></span>' +
        '</div>' +
        '<p id="help-' + id + '" class="text-xs text-slate-500 mt-2">1~120초로 입력하세요(예: 3 또는 4.5). PC·모바일의 6개 카테고리에서 한 장씩 자동으로 넘깁니다. 이 항목 저장 또는 전체 저장 후 메뉴 화면을 새로고침하면 적용됩니다. 비우면 기본 4초를 사용합니다.</p>';
    } else {
      html += '<textarea id="text-' + id + '" class="field-textarea w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700" rows="2" placeholder="저장된 수정 문구 없음 · 현재 사이트 기본 문구 유지">' + escapeHtml(f.current || '') + '</textarea>' +
        '<div class="flex flex-wrap items-center gap-2 mt-2">' +
          '<button type="button" data-save-one-text="' + id + '" class="text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg transition"><i class="fa-solid fa-floppy-disk mr-1"></i>이 항목 저장</button>' +
          (f.current !== undefined && f.current !== '' ? '<button type="button" data-restore-one-text="' + id + '" class="text-xs border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition">기본 문구 복원</button>' : '') +
          '<span id="text-status-' + id + '" role="status" aria-live="polite" class="text-xs"></span>' +
        '</div>' +
        '<div class="text-xs text-slate-400 mt-1">' + (autoPeople ? '글씨 수정 후 이 항목 저장 또는 글씨 변경사항 저장을 누르세요. 줄바꿈은 Enter 키로 입력합니다. HTML 코드를 입력할 필요가 없습니다.' : '지금 홈페이지에 있는 문구가 미리 채워져 있습니다. 수정 후 [이 항목 저장]을 누르면 즉시 반영되며, 여러 개를 한 번에 저장하려면 상단 [전체 저장]을 누르세요. 줄바꿈은 &lt;br&gt; 사용') + '</div>';
      if (f.key === 'social.youtube.channelid') {
        html += '<div class="flex flex-wrap gap-2 mt-3">' +
            '<button type="button" id="yt-verify-btn" class="text-sm bg-slate-700 hover:bg-slate-800 text-white px-3 py-2 rounded-lg transition"><i class="fa-solid fa-satellite-dish mr-1"></i>연동확인</button>' +
            '<button type="button" id="yt-import-btn" class="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition"><i class="fa-solid fa-cloud-arrow-down mr-1"></i>채널 설정 저장</button>' +
          '</div>' +
          '<div id="yt-verify-result" class="text-xs mt-2"></div>';
      }
    }
    return html + '</div></div>';
  }
  /* ---------- 유튜브 연동확인 / 가져오기 ---------- */
  var YT_API = 'https://www.googleapis.com/youtube/v3';

  // 채널 URL / @핸들 / 사용자명 / 순수 채널ID 등 다양한 입력 형식을 인식합니다.
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

  // 핸들/사용자명/URL 등을 실제 채널ID(UC...)로 변환합니다. 이미 채널ID면 그대로 반환.
  function resolveYoutubeChannelId(apiKey, parsed) {
    if (parsed.type === 'id') return Promise.resolve(parsed.value);
    if (parsed.type === 'empty') return Promise.reject(new Error('채널 ID, 채널 URL, 또는 @핸들을 입력해주세요.'));
    if (parsed.type === 'handle') {
      var handle = parsed.value.indexOf('@') === 0 ? parsed.value : '@' + parsed.value;
      return fetch(YT_API + '/channels?part=id&forHandle=' + encodeURIComponent(handle) + '&key=' + encodeURIComponent(apiKey))
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.error) throw new Error((d.error.message || 'API 오류') + (d.error.errors && d.error.errors[0] && d.error.errors[0].reason ? ' (' + d.error.errors[0].reason + ')' : ''));
          var item = d && d.items && d.items[0];
          if (item) return item.id;
          throw new Error('입력하신 핸들(' + handle + ')로 채널을 찾지 못했습니다. 채널 ID를 직접 입력해주세요.');
        });
    }
    if (parsed.type === 'username') {
      return fetch(YT_API + '/channels?part=id&forUsername=' + encodeURIComponent(parsed.value) + '&key=' + encodeURIComponent(apiKey))
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.error) throw new Error((d.error.message || 'API 오류') + (d.error.errors && d.error.errors[0] && d.error.errors[0].reason ? ' (' + d.error.errors[0].reason + ')' : ''));
          var item = d && d.items && d.items[0];
          if (item) return item.id;
          throw new Error('입력하신 사용자명(' + parsed.value + ')으로 채널을 찾지 못했습니다. 채널 ID를 직접 입력해주세요.');
        });
    }
    return Promise.reject(new Error('채널 ID/URL/핸들 형식을 인식할 수 없습니다. 채널 ID(UC로 시작)를 직접 입력해주세요.'));
  }

  function ytShowResult(html, type) {
    var el = document.getElementById('yt-verify-result');
    if (!el) return;
    var colors = { ok: 'text-emerald-700', error: 'text-red-700', info: 'text-slate-500' };
    el.className = 'text-xs mt-2 ' + (colors[type] || colors.info);
    el.innerHTML = html;
  }

  function encryptYtApiKey(val) {
    var s = String(val || '').trim();
    if (!s) return '';
    if (window.KinoyaCrypto && window.KinoyaCrypto.encryptKey) return window.KinoyaCrypto.encryptKey(s);
    return s;
  }
  function decryptYtApiKey(val) {
    var s = String(val || '').trim();
    if (!s) return '';
    if (s.indexOf('enc:v1:') === 0 && window.KinoyaCrypto && window.KinoyaCrypto.decryptKey) return window.KinoyaCrypto.decryptKey(s);
    return s;
  }

  // doSave=true("가져오기"): 확인 성공 시 정리된 채널ID/API키를 즉시 site_content에 저장(전체 저장 없이도 반영).
  // doSave=false("연동확인"): 저장 없이 연동 가능 여부만 확인.
  function handleYoutubeAction(doSave) {
    var apiKeyInput = document.getElementById('text-' + idFor('social.youtube.apikey'));
    var channelInput = document.getElementById('text-' + idFor('social.youtube.channelid'));
    var verifyBtn = document.getElementById('yt-verify-btn');
    var importBtn = document.getElementById('yt-import-btn');
    if (!apiKeyInput || !channelInput || !ready || saving) return;
    var apiKey = decryptYtApiKey(apiKeyInput.value.trim());
    var rawChannel = channelInput.value.trim();
    if (!apiKey) { ytShowResult('먼저 유튜브 Data API 키를 입력해주세요.', 'error'); return; }
    if (!rawChannel) { ytShowResult('먼저 채널 ID, 채널 URL, 또는 @핸들을 입력해주세요.', 'error'); return; }

    if (verifyBtn) verifyBtn.disabled = true;
    if (importBtn) importBtn.disabled = true;
    ytShowResult('<i class="fa-solid fa-spinner fa-spin"></i> 연동 확인 중입니다...', 'info');

    var parsed = parseYoutubeChannelInput(rawChannel);
    resolveYoutubeChannelId(apiKey, parsed)
      .then(function (channelId) {
        return fetch(YT_API + '/channels?part=snippet,statistics&id=' + encodeURIComponent(channelId) + '&key=' + encodeURIComponent(apiKey))
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (d && d.error) throw new Error((d.error.message || 'API 오류') + (d.error.errors && d.error.errors[0] && d.error.errors[0].reason ? ' (' + d.error.errors[0].reason + ')' : ''));
            var item = d && d.items && d.items[0];
            if (!item) throw new Error('채널ID(' + channelId + ')로 채널 정보를 찾지 못했습니다. 채널ID를 다시 확인해주세요.');
            return { channelId: channelId, item: item };
          });
      })
      .then(function (res) {
        var snip = res.item.snippet || {};
        var stats = res.item.statistics || {};
        var thumb = snip.thumbnails && (snip.thumbnails.default || snip.thumbnails.medium);
        var summary =
          '<div class="flex items-center gap-2 flex-wrap">' +
            (thumb ? '<img src="' + escapeHtml(thumb.url) + '" alt="" class="w-8 h-8 rounded-full">' : '') +
            '<b>' + escapeHtml(snip.title || '') + '</b>' +
            '<span class="text-slate-400">· 구독자 ' + (stats.subscriberCount || '비공개') + '명 · 영상 ' + (stats.videoCount || '0') + '개 · 조회수 ' + (stats.viewCount || '0') + '</span>' +
          '</div>' +
          '<div class="mt-1 text-slate-400 font-mono break-all">채널ID: ' + escapeHtml(res.channelId) + '</div>';

        // 채널ID 입력창을 정리된 실제 채널ID로 갱신(URL/핸들을 입력했던 경우에도 항상 UC...로 통일)
        if (channelInput.value !== res.channelId) {
          channelInput.value = res.channelId;
          channelInput.dataset.dirty = '1';
        }

        if (!doSave) {
          ytShowResult('✅ 연동 확인 성공!<br>' + summary + '<div class="mt-1">아직 저장되지 않았습니다 — "채널 설정 저장" 또는 "전체 저장"을 눌러야 사이트에 반영됩니다.</div>', 'ok');
          return;
        }

        ytShowResult('<i class="fa-solid fa-spinner fa-spin"></i> 확인되었습니다. 지금 바로 저장해 반영하는 중입니다...', 'info');
        var apiKeyField = fields.filter(function (f) { return f.key === 'social.youtube.apikey'; })[0];
        var channelField = fields.filter(function (f) { return f.key === 'social.youtube.channelid'; })[0];
        return Promise.all([
          saveField(apiKeyField, apiKey),
          saveField(channelField, res.channelId)
        ]).then(function () {
          ytShowResult('채널 설정을 저장했습니다. 영상 목록 반영은 별도의 전체 자동 업데이트를 실행해주세요.<br>' + summary, 'ok');
        });
      })
      .catch(function (err) {
        console.error('[admin][youtube] 연동 실패:', err);
        ytShowResult('❌ 연동 실패: ' + escapeHtml(err && err.message ? err.message : String(err)), 'error');
      })
      .finally(function () {
        if (verifyBtn) verifyBtn.disabled = false;
        if (importBtn) importBtn.disabled = false;
      });
  }

  function render() {
    var groups = [];
    var groupMap = Object.create(null);
    fields.forEach(function (f) {
      if (!groupMap[f.group]) { groupMap[f.group] = []; groups.push(f.group); }
      groupMap[f.group].push(f);
    });
    function archived(g){return groupMap[g].every(function(f){return /^home\.(brandstory|noodle|proof|system|turnover|model|support|commit|people|faq|stores)\./.test(f.key);});}
    nav.innerHTML = groups.map(function (g, i) {
      return '<a href="#group-' + i + '" class="text-sm px-3 py-2 rounded-lg hover:bg-slate-100 whitespace-nowrap text-slate-600">' + (archived(g)?'[요약·보관] ':'') + escapeHtml(g) + '</a>';
    }).join('');
    container.innerHTML = groups.map(function (g, i) {
      return '<section id="group-' + i + '" class="bg-white rounded-xl shadow-sm p-5 scroll-mt-24">' +
        '<h2 class="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">' + escapeHtml(g) + '</h2>' +
        (archived(g)?'<p class="text-sm text-amber-800 bg-amber-50 p-3 rounded mb-4">이 항목은 이전 홈페이지 요약·장애 시 기본 내용 보관용입니다. 현재 홈페이지는 상세 본문을 조합하므로 여기서 저장해도 정상 홈페이지 본문에 표시되지 않을 수 있습니다. 현재 화면 수정은 상단 메인 페이지 통합 관리를 이용하세요. 기존 키와 데이터는 삭제하지 않습니다.</p>':'') +
        '<div class="space-y-5">' + groupMap[g].map(fieldMarkup).join('') + '</div></section>';
    }).join('');
    fields.forEach(function (f) {
      if (f.type !== 'image') return;
      var input = document.getElementById('file-' + idFor(f.key));
      input.disabled = menuPhoto(f) ? false : !ready;
      var select=container.querySelector('[data-select-photo="'+idFor(f.key)+'"]');
      if(select)select.onclick=function(){
        if(input.disabled||saving||container.inert){photoMessage(f,'사진 처리·저장 중이거나 콘텐츠 조회가 완료되지 않았습니다. 잠시 후 다시 선택해주세요.',true);return;}
        try{input.click();}catch(error){photoMessage(f,'선택창을 열지 못했습니다. 아래 기본 파일 선택을 이용해주세요.',true);}
      };
      var retry=container.querySelector('[data-retry-photo="'+idFor(f.key)+'"]');
      if(retry)retry.onclick=function(){
        if(menuPhoto(f)){saveOneMenuPhoto(f);return;}
        if(!input.disabled&&input.files[0])input.dispatchEvent(new Event('change'));else message('먼저 사진을 선택해주세요.','info');
      };
      var savePhoto=container.querySelector('[data-save-menu-photo="'+idFor(f.key)+'"]');
      if(savePhoto)savePhoto.onclick=function(){saveOneMenuPhoto(f);};
      var restorePhoto=container.querySelector('[data-restore-menu-photo="'+idFor(f.key)+'"]');
      if(restorePhoto)restorePhoto.onclick=function(){restoreDefaultMenuPhoto(f);};
      input.addEventListener('change', function () {
        if(menuPhoto(f)){stageMenuPhoto(f,input);return;}
        var file = input.files && input.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
          input.value = '';
          message('이미지 파일만 선택해주세요.', 'error');
          return;
        }
        if (file.size > 15 * 1024 * 1024) {
          input.value = '';
          message('15MB 이하의 이미지 파일만 업로드할 수 있습니다.', 'error');
          return;
        }
        if (!ready || saving) return;
        if(photoJobs){message('다른 사진 처리가 끝나면 다시 시도해주세요.','info');return;}
        photoJobs++;
        input.disabled = true;
        saveBtn.disabled = true;
        message('사진을 PNG로 바꾸고 용량을 줄이는 중입니다...', 'info');
        uploadPngUnder600KB(file).then(function (dataUrl) {
          if (autoPeople && peoplePhoto(f)) {
            return saveField(f, dataUrl).then(function () {
              document.getElementById('preview-' + idFor(f.key)).src = dataUrl;
              message('새 사진을 저장했습니다. 기존 CMS 사진 값은 새 값으로 교체되었습니다. 원본 파일·다른 방문자 캐시는 별도입니다.', 'ok');
            });
          }
          images[f.key] = dataUrl;
          document.getElementById('preview-' + idFor(f.key)).src = dataUrl;
          message('사진 파일 업로드가 완료되었습니다. 전체 저장을 눌러 연결을 반영하세요.', 'ok');
        }).catch(function (err) {
          console.error('[admin] 이미지 변환 실패:', err);
          message('사진 처리·저장 실패: ' + err.message + ' 이전 저장 사진과 선택 파일은 유지됩니다.', 'error');
        }).finally(function () { photoJobs--;input.disabled = !ready; saveBtn.disabled = !ready || saving || photoJobs>0; });
      });
      var clearPhotoButton = container.querySelector('[data-clear-menu-photo="' + idFor(f.key) + '"]');
      if (clearPhotoButton) clearPhotoButton.addEventListener('click', function () {
        if(menuPhoto(f)){clearMenuPhoto(f);return;}
        if (!ready || saving || input.disabled) return;
        if (autoPeople && peoplePhoto(f)) {
          if (!ready || input.disabled) return;
          input.disabled = true; clearPhotoButton.disabled = true;
          saveField(f, '').then(function () {
            document.getElementById('preview-' + idFor(f.key)).src = emptyMenuPreview;
            message('CMS 사진 값을 비웠습니다. 공개 화면의 사진도 숨겨집니다.', 'ok');
          }).catch(function (error) { message('사진 비우기 실패: '+error.message, 'error'); }).finally(function () { input.disabled=false; clearPhotoButton.disabled=false; });
          return;
        }
        images[f.key] = '';
        input.value = '';
        document.getElementById('preview-' + idFor(f.key)).src = emptyMenuPreview;
        message('사진을 비우도록 표시했습니다. 변경사항 저장을 누르면 사진 영역이 빈칸으로 바뀝니다.', 'ok');
      });
    });
    fields.forEach(function (f) {
      if (f.type !== 'video') return;
      var id = idFor(f.key);
      var vFileInput = document.getElementById('video-file-' + id);
      var vTextInput = document.getElementById('text-' + id);
      var vPreview = document.getElementById('video-preview-' + id);
      var vStatus = document.getElementById('video-status-' + id);
      var vSelectBtn = container.querySelector('[data-select-video="' + id + '"]');
      var vRestoreBtn = container.querySelector('[data-restore-video="' + id + '"]');
      function setVideoPreviewUrl(rawUrl) {
        if (!vPreview) return;
        if (!rawUrl) { vPreview.removeAttribute('src'); vPreview.load(); return; }
        try {
          vPreview.src = new URL(rawUrl, AdminCore.root).href;
          vPreview.load();
        } catch (e) {}
      }
      if (vSelectBtn && vFileInput) {
        vSelectBtn.onclick = function () {
          if (saving || photoJobs) { message('다른 작업이 끝난 후 다시 선택해주세요.', 'info'); return; }
          try { vFileInput.click(); } catch (e) {}
        };
      }
      if (vRestoreBtn && vTextInput) {
        vRestoreBtn.onclick = function () {
          vTextInput.value = f.current || '';
          var orig = rows[f.key] ? rows[f.key].value : (f.current || '');
          if (vTextInput.value === String(orig ?? '')) delete vTextInput.dataset.dirty;
          else vTextInput.dataset.dirty = '1';
          setVideoPreviewUrl(f.current || '');
          if (vStatus) vStatus.textContent = '기본 영상(' + (f.current || '') + ')으로 되돌렸습니다. 상단 전체 저장을 누르면 반영됩니다.';
        };
      }
      if (vTextInput) {
        vTextInput.addEventListener('change', function () {
          setVideoPreviewUrl(vTextInput.value.trim());
        });
      }
      if (vFileInput) {
        vFileInput.addEventListener('change', function () {
          var file = vFileInput.files && vFileInput.files[0];
          if (!file) return;
          if (!/^video\/(mp4|webm)$/i.test(file.type) && !/\.(mp4|webm)$/i.test(file.name || '')) {
            vFileInput.value = '';
            message('MP4 또는 WebM 영상 파일만 선택해주세요.', 'error');
            return;
          }
          if (file.size > 10 * 1024 * 1024) {
            vFileInput.value = '';
            message('10MB 이하의 영상 파일만 업로드할 수 있습니다.', 'error');
            return;
          }
          photoJobs++;
          vFileInput.disabled = true;
          saveBtn.disabled = true;
          if (vStatus) vStatus.textContent = '영상 파일(' + file.name + ') 업로드 중...';
          AdminCore.upload(file, 'cms-videos').then(function (refUrl) {
            vTextInput.value = refUrl;
            vTextInput.dataset.dirty = '1';
            setVideoPreviewUrl(refUrl);
            if (vStatus) vStatus.textContent = '영상 업로드 완료 (' + refUrl + '). 상단 전체 저장을 눌러 공개 페이지에 반영하세요.';
            message('영상 파일 업로드가 완료되었습니다. 전체 저장을 눌러 반영하세요.', 'ok');
          }).catch(function (err) {
            if (err && err.unavailable && f.current) {
              vTextInput.value = f.current;
              setVideoPreviewUrl(f.current);
              if (vStatus) vStatus.textContent = '프리뷰 환경에서는 런타임 파일 업로드가 비활성 상태여서 기본 등록 영상(' + f.current + ')이 연결되어 있습니다.';
              message('현재 환경에서는 신규 파일 업로드 대신 기본 등록 영상(' + f.current + ')이 연결됩니다.', 'warn');
              return;
            }
            if (vStatus) vStatus.textContent = '영상 업로드 실패: ' + (err && err.message ? err.message : String(err));
            message('영상 업로드 실패: ' + (err && err.message ? err.message : String(err)), 'error');
          }).finally(function () {
            photoJobs--;
            vFileInput.disabled = false;
            saveBtn.disabled = !ready || saving || photoJobs > 0;
          });
        });
      }
    });
  async function saveOneTextField(f) {
    if (saving || photoJobs) { textMessage(f, '현재 다른 저장 작업이 끝난 후 다시 눌러주세요.', true); return; }
    var input = document.getElementById('text-' + idFor(f.key));
    if (!input) return;
    if (f.key === 'menu.autoslide.seconds') {
      var intervalText = input.value.trim();
      var seconds = Number(intervalText);
      if ((intervalText && (!Number.isFinite(seconds) || seconds < 1 || seconds > 120)) || !input.checkValidity()) {
        textMessage(f, '1~120초 숫자로 입력해주세요.', true);
        message('메뉴 자동 슬라이드 간격은 1~120초로 입력해주세요.', 'error');
        input.focus();
        input.reportValidity();
        return;
      }
    }
    saving = true; container.inert = true; saveBtn.disabled = true;
    textMessage(f, '저장 중…');
    try {
      await ensureFieldLoaded(f);
      await saveField(f, input.value);
      textMessage(f, '✅ 저장 완료 — 공개 사이트에 즉시 반영되었습니다.');
      message(f.label + ' 저장 완료. 공개 사이트에서 새로고침하여 확인하세요.', 'ok');
    } catch (error) {
      textMessage(f, '❌ 저장 실패: ' + error.message, true);
      message(f.label + ' 저장 실패: ' + error.message, 'error');
    } finally {
      saving = false; container.inert = false; saveBtn.disabled = !ready;
    }
  }

  async function restoreDefaultTextField(f) {
    if (saving || photoJobs) { textMessage(f, '현재 다른 저장 작업이 끝난 후 다시 눌러주세요.', true); return; }
    var input = document.getElementById('text-' + idFor(f.key));
    if (!input) return;
    var defaultVal = f.current !== undefined ? f.current : '';
    saving = true; container.inert = true; saveBtn.disabled = true;
    textMessage(f, '기본 문구로 복원 중…');
    try {
      await ensureFieldLoaded(f);
      var fresh = await readExistingRow(f);
      if (fresh && fresh.id) {
        await fetch('/tables/site_content/' + encodeURIComponent(fresh.id), { method: 'DELETE' });
      }
      delete rows[f.key]; loadedKeys[f.key] = true;
      input.value = defaultVal;
      delete input.dataset.dirty;
      try { localStorage.removeItem('cms_cache'); } catch (e) {}
      textMessage(f, '✅ 기본 문구로 복원 완료 — 공개 사이트에 즉시 반영되었습니다.');
      message(f.label + ' 기본 문구 복원 완료.', 'ok');
    } catch (error) {
      textMessage(f, '❌ 복원 실패: ' + error.message, true);
      message(f.label + ' 기본 문구 복원 실패: ' + error.message, 'error');
    } finally {
      saving = false; container.inert = false; saveBtn.disabled = !ready;
    }
  }

    var ytVerifyBtn = document.getElementById('yt-verify-btn');
    var ytImportBtn = document.getElementById('yt-import-btn');
    if (ytVerifyBtn) ytVerifyBtn.addEventListener('click', function () { handleYoutubeAction(false); });
    if (ytImportBtn) ytImportBtn.addEventListener('click', function () { handleYoutubeAction(true); });
    var toggleYtKeyBtn = document.getElementById('toggle-yt-apikey-visibility');
    if (toggleYtKeyBtn) {
      toggleYtKeyBtn.addEventListener('click', function () {
        var keyInput = document.getElementById('text-' + idFor('social.youtube.apikey'));
        if (!keyInput) return;
        var isHidden = keyInput.type === 'password';
        keyInput.type = isHidden ? 'text' : 'password';
        toggleYtKeyBtn.innerHTML = isHidden
          ? '<i class="fa-solid fa-eye mr-1"></i>키 표시중 (클릭 시 비공개)'
          : '<i class="fa-solid fa-eye-slash mr-1"></i>비공개 숨김중';
      });
    }
    fields.forEach(function (f) {
      if (f.type === 'image' || f.type === 'video') return;
      var id = idFor(f.key);
      var saveOneBtn = container.querySelector('[data-save-one-text="' + id + '"]');
      if (saveOneBtn) saveOneBtn.onclick = function () { saveOneTextField(f); };
      var restoreOneBtn = container.querySelector('[data-restore-one-text="' + id + '"]');
      if (restoreOneBtn) restoreOneBtn.onclick = function () { restoreDefaultTextField(f); };
    });
    setupMergedCategoryNavigation(groups, groupMap, archived);
  }

  function setupMergedCategoryNavigation(groups, groupMap, archived) {
    var groupByTitle = Object.create(null);
    groups.forEach(function (g, i) {
      var el = document.getElementById('group-' + i);
      if (el) {
        el.dataset.groupTitle = g;
        groupByTitle[g] = el;
      }
    });

    // 1. 매장 그룹(서울 22개 / 전국 23개) 내부에 '매장 1곳씩 골라보기' 드롭다운 장착하여 무한 스크롤 제거
    ['매장 사진 · 정보 - 서울 지역 (26개 매장)', '매장 사진 · 정보 - 전국 각지 (25개 매장)'].forEach(function (gTitle) {
      var secEl = groupByTitle[gTitle];
      if (!secEl || secEl.querySelector('.store-single-filter')) return;
      var storeList = [];
      var seen = Object.create(null);
      (groupMap[gTitle] || []).forEach(function (f) {
        var m = f.key.match(/^store\.(\d+)\.photo$/);
        if (m && !seen[m[1]]) {
          seen[m[1]] = true;
          var nameField = (groupMap[gTitle] || []).find(function (nf) { return nf.key === 'store.' + m[1] + '.name'; });
          var display = (nameField && nameField.current) ? nameField.current : f.label.replace(/\s*매장 사진$/, '');
          storeList.push({ num: m[1], name: display });
        }
      });
      if (!storeList.length) return;
      var filterBar = document.createElement('div');
      filterBar.className = 'store-single-filter bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5 flex flex-wrap items-center justify-between gap-3';
      filterBar.innerHTML =
        '<div class="text-xs sm:text-sm font-bold text-amber-900 flex items-center gap-2">' +
          '<i class="fa-solid fa-store text-amber-700"></i>' +
          '<span>매장 선택 (선택한 매장 1곳만 표시되어 아래로 길게 스크롤하지 않습니다):</span>' +
        '</div>' +
        '<div class="flex flex-wrap items-center gap-2">' +
          '<select class="store-single-select border border-amber-300 bg-white rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 min-w-[230px]">' +
            storeList.map(function (s, idx) {
              return '<option value="' + escapeHtml(s.num) + '"' + (idx === 0 ? ' selected' : '') + '>' + (idx + 1) + '. ' + escapeHtml(s.name) + ' (store.' + escapeHtml(s.num) + ')</option>';
            }).join('') +
            '<option value="all">📋 전체 매장 한꺼번에 펼쳐보기 (' + storeList.length + '개)</option>' +
          '</select>' +
          '<button type="button" class="store-prev-btn text-xs bg-white border border-amber-300 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg font-medium">◀ 이전 매장</button>' +
          '<button type="button" class="store-next-btn text-xs bg-white border border-amber-300 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg font-medium">다음 매장 ▶</button>' +
        '</div>';
      var heading = secEl.querySelector('h2');
      if (heading && heading.nextSibling) secEl.insertBefore(filterBar, heading.nextSibling);
      else secEl.prepend(filterBar);

      var selectEl = filterBar.querySelector('.store-single-select');
      var prevBtn = filterBar.querySelector('.store-prev-btn');
      var nextBtn = filterBar.querySelector('.store-next-btn');

      function applyStoreFilter() {
        var val = selectEl.value;
        secEl.querySelectorAll('[data-store-num]').forEach(function (rowEl) {
          var show = (val === 'all' || rowEl.getAttribute('data-store-num') === val);
          rowEl.style.display = show ? '' : 'none';
          if (show && val !== 'all' && rowEl.classList.contains('border-t')) {
            rowEl.style.borderTop = 'none';
            rowEl.style.paddingTop = '0';
            rowEl.style.marginTop = '0';
          } else if (val === 'all') {
            rowEl.style.borderTop = '';
            rowEl.style.paddingTop = '';
            rowEl.style.marginTop = '';
          }
        });
      }
      selectEl.addEventListener('change', applyStoreFilter);
      prevBtn.addEventListener('click', function () {
        if (selectEl.selectedIndex > 0) { selectEl.selectedIndex--; applyStoreFilter(); }
      });
      nextBtn.addEventListener('click', function () {
        if (selectEl.selectedIndex < storeList.length - 1) { selectEl.selectedIndex++; applyStoreFilter(); }
      });
      applyStoreFilter();
    });

    // 1-2. 우동키노야 음식사진 (20장 슬라이드) 그룹에도 1~20번 빠른 선택 및 전체 보기 필터 장착
    var foodSecEl = groupByTitle['메뉴소개 · 우동키노야 음식사진 (20장 슬라이드)'];
    if (foodSecEl && !foodSecEl.querySelector('.food-single-filter')) {
      var foodList = [];
      var seenFood = Object.create(null);
      (groupMap['메뉴소개 · 우동키노야 음식사진 (20장 슬라이드)'] || []).forEach(function (f) {
        var m = f.key.match(/^menu\.food\.(\d+)\.bg$/);
        if (m && !seenFood[m[1]]) {
          seenFood[m[1]] = true;
          var descField = (groupMap['메뉴소개 · 우동키노야 음식사진 (20장 슬라이드)'] || []).find(function (df) { return df.key === 'menu.food.' + m[1] + '.desc'; });
          var snippet = (descField && descField.current) ? descField.current.split('·')[0].trim() : ('음식사진 ' + Number(m[1]) + '번');
          foodList.push({ num: m[1], name: snippet });
        }
      });
      if (foodList.length) {
        var foodFilterBar = document.createElement('div');
        foodFilterBar.className = 'food-single-filter bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5 flex flex-wrap items-center justify-between gap-3';
        foodFilterBar.innerHTML =
          '<div class="text-xs sm:text-sm font-bold text-amber-900 flex items-center gap-2">' +
            '<i class="fa-solid fa-camera text-amber-700"></i>' +
            '<span>우동키노야 음식사진 20장 빠른 이동 · 필터 (사이드 아래 좌우 자동 슬라이드):</span>' +
          '</div>' +
          '<div class="flex flex-wrap items-center gap-2">' +
            '<select class="food-single-select border border-amber-300 bg-white rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 min-w-[260px]">' +
              '<option value="all" selected>📋 20장 전체 펼쳐보기 (1~20번)</option>' +
              foodList.map(function (item, idx) {
                return '<option value="' + escapeHtml(item.num) + '">PHOTO ' + escapeHtml(item.num) + ' · ' + escapeHtml(item.name) + '</option>';
              }).join('') +
            '</select>' +
            '<button type="button" class="food-prev-btn text-xs bg-white border border-amber-300 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg font-medium">◀ 이전 사진</button>' +
            '<button type="button" class="food-next-btn text-xs bg-white border border-amber-300 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg font-medium">다음 사진 ▶</button>' +
          '</div>';
        var foodHeading = foodSecEl.querySelector('h2');
        if (foodHeading && foodHeading.nextSibling) foodSecEl.insertBefore(foodFilterBar, foodHeading.nextSibling);
        else foodSecEl.prepend(foodFilterBar);

        var foodSelectEl = foodFilterBar.querySelector('.food-single-select');
        var foodPrevBtn = foodFilterBar.querySelector('.food-prev-btn');
        var foodNextBtn = foodFilterBar.querySelector('.food-next-btn');

        function applyFoodFilter() {
          var val = foodSelectEl.value;
          foodSecEl.querySelectorAll('[data-food-num]').forEach(function (rowEl) {
            var show = (val === 'all' || rowEl.getAttribute('data-food-num') === val);
            rowEl.style.display = show ? '' : 'none';
          });
        }
        foodSelectEl.addEventListener('change', applyFoodFilter);
        foodPrevBtn.addEventListener('click', function () {
          if (foodSelectEl.selectedIndex > 0) { foodSelectEl.selectedIndex--; applyFoodFilter(); }
        });
        foodNextBtn.addEventListener('click', function () {
          if (foodSelectEl.selectedIndex < foodSelectEl.options.length - 1) { foodSelectEl.selectedIndex++; applyFoodFilter(); }
        });
      }
    }

    // 1-3. 전국 매장 사진 · 갤러리 (20장 슬라이드) 그룹에도 1~20번 빠른 선택 및 전체 보기 필터 장착
    var storeGalSecEl = groupByTitle['전국 매장 사진 · 갤러리 (20장 슬라이드)'];
    if (storeGalSecEl && !storeGalSecEl.querySelector('.store-gallery-single-filter')) {
      var storeGalList = [];
      var seenStoreGal = Object.create(null);
      (groupMap['전국 매장 사진 · 갤러리 (20장 슬라이드)'] || []).forEach(function (f) {
        var m = f.key.match(/^store\.gallery\.(\d+)\.photo$/);
        if (m && !seenStoreGal[m[1]]) {
          seenStoreGal[m[1]] = true;
          var titleField = (groupMap['전국 매장 사진 · 갤러리 (20장 슬라이드)'] || []).find(function (tf) { return tf.key === 'store.gallery.' + m[1] + '.title'; });
          var snippet = (titleField && titleField.current) ? titleField.current : ('전국 매장 사진 ' + Number(m[1]) + '번');
          storeGalList.push({ num: m[1], name: snippet });
        }
      });
      if (storeGalList.length) {
        var storeGalFilterBar = document.createElement('div');
        storeGalFilterBar.className = 'store-gallery-single-filter bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5 flex flex-wrap items-center justify-between gap-3';
        storeGalFilterBar.innerHTML =
          '<div class="text-xs sm:text-sm font-bold text-amber-900 flex items-center gap-2">' +
            '<i class="fa-solid fa-images text-amber-700"></i>' +
            '<span>전국 매장 사진 20장 빠른 이동 · 필터 (전국 각지 섹션 아래 좌우 자동 스크롤):</span>' +
          '</div>' +
          '<div class="flex flex-wrap items-center gap-2">' +
            '<select class="store-gal-single-select border border-amber-300 bg-white rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 min-w-[260px]">' +
              '<option value="all" selected>📋 20장 전체 펼쳐보기 (1~20번)</option>' +
              storeGalList.map(function (item) {
                return '<option value="' + escapeHtml(item.num) + '">STORE ' + escapeHtml(item.num) + ' · ' + escapeHtml(item.name) + '</option>';
              }).join('') +
            '</select>' +
            '<button type="button" class="store-gal-prev-btn text-xs bg-white border border-amber-300 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg font-medium">◀ 이전 사진</button>' +
            '<button type="button" class="store-gal-next-btn text-xs bg-white border border-amber-300 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg font-medium">다음 사진 ▶</button>' +
          '</div>';
        var storeGalHeading = storeGalSecEl.querySelector('h2');
        if (storeGalHeading && storeGalHeading.nextSibling) storeGalSecEl.insertBefore(storeGalFilterBar, storeGalHeading.nextSibling);
        else storeGalSecEl.prepend(storeGalFilterBar);

        var storeGalSelectEl = storeGalFilterBar.querySelector('.store-gal-single-select');
        var storeGalPrevBtn = storeGalFilterBar.querySelector('.store-gal-prev-btn');
        var storeGalNextBtn = storeGalFilterBar.querySelector('.store-gal-next-btn');

        function applyStoreGalFilter() {
          var val = storeGalSelectEl.value;
          storeGalSecEl.querySelectorAll('[data-store-gallery-num]').forEach(function (rowEl) {
            var show = (val === 'all' || rowEl.getAttribute('data-store-gallery-num') === val);
            rowEl.style.display = show ? '' : 'none';
          });
        }
        storeGalSelectEl.addEventListener('change', applyStoreGalFilter);
        storeGalPrevBtn.addEventListener('click', function () {
          if (storeGalSelectEl.selectedIndex > 0) { storeGalSelectEl.selectedIndex--; applyStoreGalFilter(); }
        });
        storeGalNextBtn.addEventListener('click', function () {
          if (storeGalSelectEl.selectedIndex < storeGalSelectEl.options.length - 1) { storeGalSelectEl.selectedIndex++; applyStoreGalFilter(); }
        });
      }
    }

    // 2. 중복 섹션 통합 및 8개 대분류 카테고리 정의
    var ytCmsGroup = groupByTitle['소셜미디어 - 유튜브 자동연동'];
    var snsCmsGroup = groupByTitle['SNS 링크 관리'];
    var faqCmsGroup = groupByTitle['창업 FAQ'];
    var storeHeroGroup = groupByTitle['매장 찾기'];
    var storeSeoulGroup = groupByTitle['매장 사진 · 정보 - 서울 지역 (26개 매장)'];
    var storeNationGroup = groupByTitle['매장 사진 · 정보 - 전국 각지 (25개 매장)'];
    var storeGalleryGroup = groupByTitle['전국 매장 사진 · 갤러리 (20장 슬라이드)'];
    var newsSettingGroup = groupByTitle['우동키노야 뉴스 설정'];

    var CATEGORIES = [
      {
        id: 'cat-common',
        label: '🌐 공통 · 로고 · 카카오톡',
        subtabs: [
          { id: 'sub-common-logo', label: '공통 로고 · 파비콘 · 카카오톡 썸네일', elements: [groupByTitle['공통(전체 페이지)'], groupByTitle['카카오톡 공유 썸네일']] },
          { id: 'sub-common-kakao', label: '카카오톡 공유 썸네일 단독 보기', elements: [groupByTitle['카카오톡 공유 썸네일']] }
        ]
      },
      {
        id: 'cat-social',
        label: '📺 유튜브 · SNS 통합',
        subtabs: [
          {
            id: 'sub-yt-merged',
            label: '유튜브 API 설정 + 한 번에 업데이트 + 영상 목록 (통합)',
            elements: [ytCmsGroup, document.getElementById('yt-sync-section'), document.getElementById('yt-manage-section')]
          },
          { id: 'sub-sns-links', label: '푸터 SNS 링크 관리', elements: [snsCmsGroup] }
        ]
      },
      {
        id: 'cat-stores',
        label: '🏪 매장 통합 관리 (51개)',
        subtabs: [
          {
            id: 'sub-stores-hub',
            label: '엑셀 참조 · 51개 매장 빠른 편집 · 신규 매장 등록',
            elements: [storeHeroGroup, document.getElementById('stores-manage-section')]
          },
          { id: 'sub-stores-seoul', label: '서울 지역 매장 사진·정보 (26개)', elements: [storeHeroGroup, storeSeoulGroup] },
          { id: 'sub-stores-nation', label: '전국 각지 매장 사진·정보 (25개)', elements: [storeHeroGroup, storeNationGroup] },
          { id: 'sub-stores-gallery', label: '전국 매장 사진 · 갤러리 (20장 슬라이드)', elements: [storeGalleryGroup] },
          {
            id: 'sub-stores-detail',
            label: '개별 매장 상세페이지 (10개)',
            elements: groups.filter(function (g) { return g.indexOf('매장 상세페이지') === 0; }).map(function (g) { return groupByTitle[g]; })
          }
        ]
      },
      {
        id: 'cat-menu',
        label: '🍜 메뉴 소개 · 음식사진',
        subtabs: groups.filter(function (g) {
          return g.indexOf('메뉴소개 · ') === 0 && g.indexOf('보관용') === -1 && g.indexOf('20장 슬라이드') === -1;
        }).map(function (g, idx) {
          return {
            id: 'sub-menu-cat-' + idx,
            label: g.replace('메뉴소개 · ', ''),
            elements: [groupByTitle[g]]
          };
        }).concat([
          {
            id: 'sub-menu-common',
            label: '메뉴 공통 · 대표 메뉴 2종 · 자동 슬라이드 간격',
            elements: [groupByTitle['메뉴소개'], groupByTitle['메뉴소개 · 이전 16칸(보관용)']]
          }
        ])
      },
      {
        id: 'cat-brand',
        label: '📖 브랜드 · 면 · 사람들',
        subtabs: [
          { id: 'sub-brand-story', label: '브랜드스토리', elements: [groupByTitle['브랜드스토리']] },
          { id: 'sub-noodle', label: '키노야의 신념과 경쟁력 (면)', elements: [groupByTitle['키노야의 신념과 경쟁력(노들)']] },
          { id: 'sub-people', label: '우동키노야 사람들 (경영진·전문가)', elements: [groupByTitle['우동키노야 사람들']] },
          { id: 'sub-partner-logos', label: '협력사 로고 (3줄 슬라이드)', elements: [document.getElementById('plogo-section')] }
        ]
      },
      {
        id: 'cat-franchise',
        label: '💼 창업 · 비용 · FAQ 통합',
        subtabs: [
          { id: 'sub-franchise-guide', label: '창업안내 (7000만원 오픈 · 리뉴얼 사례)', elements: [groupByTitle['창업안내']] },
          { id: 'sub-franchise-cost', label: '창업비용 (10평대 · 30평대 표)', elements: [groupByTitle['창업비용']] },
          {
            id: 'sub-franchise-faq',
            label: '창업 FAQ 통합 관리 (DB + 기본 문구)',
            elements: [document.getElementById('faq-manage-section'), faqCmsGroup]
          },
          { id: 'sub-franchise-contact', label: '창업문의 폼 문구', elements: [groupByTitle['창업문의']] }
        ]
      },
      {
        id: 'cat-board',
        label: '📰 상담 · 뉴스 · 자료실',
        subtabs: [
          { id: 'sub-consultations', label: '상담신청 접수 내역', elements: [document.getElementById('consultations-section')] },
          { id: 'sub-news', label: '뉴스 · 언론보도 관리', elements: [newsSettingGroup, document.getElementById('news-manage-section')] },
          { id: 'sub-resources', label: '자료실 (브로슈어) 관리', elements: [document.getElementById('resources-manage-section')] }
        ]
      },
      {
        id: 'cat-home-system',
        label: '🏠 메인 히어로 · 백업 · 통계',
        subtabs: [
          {
            id: 'sub-home-active',
            label: '메인 히어로 · 숫자 · 매장슬라이더 · 하단CTA',
            elements: ['홈 - 히어로', '홈 - 숫자로 보는 우동키노야', '홈 - 매장슬라이더', '홈 - 하단 CTA'].map(function (g) { return groupByTitle[g]; })
          },
          { id: 'sub-backup', label: '전체 데이터 백업 · 복원 (엑셀)', elements: [document.getElementById('backup-section')] },
          { id: 'sub-stats', label: '방문자 통계 리포트', elements: [document.getElementById('visitor-stats-section')] },
          {
            id: 'sub-home-archived',
            label: '📦 [보관용] 구 홈페이지 요약 문구 (11개 섹션 병합)',
            elements: groups.filter(function (g) { return archived(g); }).map(function (g) { return groupByTitle[g]; })
          }
        ]
      }
    ];

    var allManagedElements = [];
    CATEGORIES.forEach(function (cat) {
      cat.subtabs.forEach(function (sub) {
        sub.elements = (sub.elements || []).filter(Boolean);
        sub.elements.forEach(function (el) {
          if (allManagedElements.indexOf(el) === -1) allManagedElements.push(el);
        });
      });
    });

    var topBar = document.getElementById('admin-top-categories');
    var subBar = document.getElementById('admin-sub-tabs');
    if (!topBar || !subBar) return;
    var toggleAllBtn = document.getElementById('admin-toggle-all-view');
    var activeCatId = CATEGORIES[0].id;
    var activeSubByCat = Object.create(null);
    CATEGORIES.forEach(function (c) { if (c.subtabs[0]) activeSubByCat[c.id] = c.subtabs[0].id; });
    var showAllMode = false;

    function updateVisibility() {
      if (showAllMode) {
        allManagedElements.forEach(function (el) { el.style.display = ''; });
        if (toggleAllBtn) {
          toggleAllBtn.textContent = '카테고리 탭 뷰로 돌아가기';
          toggleAllBtn.className = 'text-xs px-2.5 py-1 rounded bg-slate-800 text-white font-semibold transition';
        }
        return;
      }
      if (toggleAllBtn) {
        toggleAllBtn.textContent = '전체 펼쳐보기';
        toggleAllBtn.className = 'text-xs px-2.5 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 transition';
      }
      var activeCat = CATEGORIES.find(function (c) { return c.id === activeCatId; }) || CATEGORIES[0];
      var activeSubId = activeSubByCat[activeCat.id] || (activeCat.subtabs[0] && activeCat.subtabs[0].id);
      var activeSub = activeCat.subtabs.find(function (s) { return s.id === activeSubId; }) || activeCat.subtabs[0];
      var visibleSet = new Set(activeSub ? activeSub.elements : []);
      allManagedElements.forEach(function (el) {
        el.style.display = visibleSet.has(el) ? '' : 'none';
      });
    }

    function renderCategoryBars() {
      if (!topBar || !subBar) return;
      topBar.innerHTML = CATEGORIES.map(function (cat) {
        var isActive = !showAllMode && cat.id === activeCatId;
        return '<button type="button" role="tab" aria-selected="' + (isActive ? 'true' : 'false') + '" data-cat-id="' + cat.id + '" class="text-xs sm:text-sm font-bold px-3.5 py-2 rounded-lg transition ' +
          (isActive ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200') + '">' +
          escapeHtml(cat.label) + '</button>';
      }).join('');

      var activeCat = CATEGORIES.find(function (c) { return c.id === activeCatId; }) || CATEGORIES[0];
      var activeSubId = activeSubByCat[activeCat.id] || (activeCat.subtabs[0] && activeCat.subtabs[0].id);
      subBar.innerHTML = activeCat.subtabs.map(function (sub) {
        var isSubActive = !showAllMode && sub.id === activeSubId;
        return '<button type="button" role="tab" aria-selected="' + (isSubActive ? 'true' : 'false') + '" data-sub-id="' + sub.id + '" class="text-xs font-semibold px-3 py-1.5 rounded-lg border transition ' +
          (isSubActive ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50') + '">' +
          escapeHtml(sub.label) + '</button>';
      }).join('');

      // 좌측 사이드바(#group-nav)도 현재 선택된 대분류/서브탭과 완벽히 동기화
      if (nav) {
        nav.innerHTML = CATEGORIES.map(function (cat) {
          var isCatActive = !showAllMode && cat.id === activeCatId;
          return '<div class="mb-1.5">' +
            '<button type="button" data-side-cat="' + cat.id + '" class="w-full text-left text-xs font-bold px-2.5 py-2 rounded-lg transition flex items-center justify-between ' +
              (isCatActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100') + '">' +
              '<span>' + escapeHtml(cat.label) + '</span>' +
              '<span class="text-[10px] opacity-75">' + cat.subtabs.length + '</span>' +
            '</button>' +
            (isCatActive ? '<div class="pl-2 mt-1 space-y-0.5 border-l-2 border-emerald-600 ml-2">' +
              cat.subtabs.map(function (sub) {
                var isSub = sub.id === activeSubId;
                return '<button type="button" data-side-sub="' + sub.id + '" class="w-full text-left text-xs px-2 py-1.5 rounded transition truncate ' +
                  (isSub ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-500 hover:bg-slate-50') + '">' +
                  escapeHtml(sub.label) + '</button>';
              }).join('') +
            '</div>' : '') +
          '</div>';
        }).join('');

        nav.querySelectorAll('[data-side-cat]').forEach(function (btn) {
          btn.onclick = function () {
            showAllMode = false;
            activeCatId = btn.getAttribute('data-side-cat');
            renderCategoryBars();
            updateVisibility();
          };
        });
        nav.querySelectorAll('[data-side-sub]').forEach(function (btn) {
          btn.onclick = function () {
            showAllMode = false;
            activeSubByCat[activeCatId] = btn.getAttribute('data-side-sub');
            renderCategoryBars();
            updateVisibility();
          };
        });
      }

      topBar.querySelectorAll('[data-cat-id]').forEach(function (btn) {
        btn.onclick = function () {
          showAllMode = false;
          activeCatId = btn.getAttribute('data-cat-id');
          renderCategoryBars();
          updateVisibility();
        };
      });
      subBar.querySelectorAll('[data-sub-id]').forEach(function (btn) {
        btn.onclick = function () {
          showAllMode = false;
          activeSubByCat[activeCatId] = btn.getAttribute('data-sub-id');
          renderCategoryBars();
          updateVisibility();
        };
      });
    }

    if (toggleAllBtn) {
      toggleAllBtn.onclick = function () {
        showAllMode = !showAllMode;
        renderCategoryBars();
        updateVisibility();
      };
    }

    var jumpConsultBtn = document.getElementById('jump-consultations-btn');
    function openConsultationsTab() {
      showAllMode = false;
      activeCatId = 'cat-board';
      activeSubByCat['cat-board'] = 'sub-consultations';
      renderCategoryBars();
      updateVisibility();
      var sec = document.getElementById('consultations-section');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (jumpConsultBtn) {
      jumpConsultBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openConsultationsTab();
      });
    }
    if (location.hash === '#consultations-section') {
      openConsultationsTab();
    }
    window.addEventListener('hashchange', function () {
      if (location.hash === '#consultations-section') openConsultationsTab();
    });

    renderCategoryBars();
    updateVisibility();
  }

  async function stageMenuPhoto(f,input) {
    var file=input.files&&input.files[0];
    if(!file)return;
    if(saving||photoJobs){photoMessage(f,'다른 사진 처리가 끝나면 다시 선택해주세요.',true);return;}
    if(!AdminCore.imageType(file)){photoMessage(f,'PNG/JPG/WebP/GIF 사진을 선택해주세요. HEIC 사진은 JPG/PNG로 변환해주세요.',true);return;}
    if(file.size>15*1024*1024){photoMessage(f,'원본 사진은 15MB 이하여야 합니다.',true);return;}
    photoJobs++;input.disabled=true;saveBtn.disabled=true;
    var url;
    photoMessage(f,'PNG 자동 변환 · 600KB 이하로 크기 조절 중…');
    try{
      var converted=await AdminCore.prepareImage(file);
      url=URL.createObjectURL(converted);
      var image=new Image();
      await new Promise(function(resolve,reject){image.onload=resolve;image.onerror=function(){reject(new Error('사진 파일을 읽지 못했습니다. 다른 PNG/JPG 파일을 선택해주세요.'));};image.src=url;});
      releaseMenuPreview(f.key);menuPreviewURLs[f.key]=url;
      pendingMenuPhotos[f.key]={file:file,preview:url};delete images[f.key];
      setMenuPreview(f,url);
      photoMessage(f,file.name+' → '+converted.name+' · PNG '+(converted.size/1024).toFixed(1)+'KB / 600KB 이하 · '+image.naturalWidth+'×'+image.naturalHeight+'px · 선택 완료 / 아직 저장되지 않았습니다. 이 사진 저장 또는 전체 저장을 누르세요.');
    }catch(error){if(url)URL.revokeObjectURL(url);photoMessage(f,error.message,true);}
    finally{photoJobs--;input.disabled=false;saveBtn.disabled=!ready||saving||photoJobs>0;}
    if(!window.adminFixture && ready && pendingMenuPhotos[f.key] && !saving && !photoJobs){
      await saveOneMenuPhoto(f);
    }
  }

  function staticMenuFallback(f){
    if(!menuPhoto(f)||!f.current)return '';
    try{return AdminCore.safeURL(f.current,true);}catch(e){return '';}
  }
  async function persistMenuPhoto(f) {
    var pending=pendingMenuPhotos[f.key];
    if(!pending)throw new Error('먼저 저장할 사진을 선택해주세요.');
    try{
      await ensureFieldLoaded(f);
      photoMessage(f,'사진 축소·업로드 및 메뉴 연결 저장 중…');
      if(!pending.reference){
        try{pending.reference=await AdminCore.uploadImage(pending.file);}
        catch(uploadError){
          var fallback=staticMenuFallback(f);
          if(uploadError&&uploadError.unavailable&&fallback)pending.reference=fallback;
          else throw uploadError;
        }
      }
      await saveField(f,pending.reference);
    }catch(error){
      photoMessage(f,'저장 실패: '+error.message+' 선택한 미리보기와 원본 파일은 이 화면에 유지됩니다. 활성화/로그인 확인 후 직접 다시 시도해주세요.',true);
      throw error;
    }
  }

  async function saveOneMenuPhoto(f) {
    if(saving||photoJobs){photoMessage(f,'현재 사진 처리·저장이 끝난 후 다시 눌러주세요.',true);return;}
    if(!pendingMenuPhotos[f.key]){photoMessage(f,'먼저 사진을 선택해주세요. 사진 비우기·기본 사진 복원은 별도 저장 없이 즉시 반영됩니다.',true);return;}
    saving=true;container.inert=true;saveBtn.disabled=true;
    try{await persistMenuPhoto(f);message(f.label+' 저장 완료. 공개 메뉴에서 새로고침하여 확인하세요.','ok');}
    catch(error){message('사진 저장 실패: '+error.message+' 사진 옆 안내를 확인해주세요.','error');}
    finally{saving=false;container.inert=false;saveBtn.disabled=!ready;}
  }

  if (!Array.isArray(fields) || fields.length === 0) {
    saveBtn.disabled = true;
    container.innerHTML = '<div class="bg-white rounded-xl shadow-sm p-5 text-red-700">편집 항목 목록(CMS_FIELDS)을 불러오지 못했습니다. admin/index.html 파일이 최신 버전으로 배포되었는지 확인하고 새로고침해주세요.</div>';
    message('편집 항목 목록을 불러오지 못했습니다. 저장을 중단합니다.', 'error');
    return;
  }

  // 데이터 요청과 관계없이 즉시 전체 편집 목록을 먼저 표시합니다.
  render();
  saveBtn.disabled = true;
  saveBtn.classList.add('opacity-60');
  message('저장된 콘텐츠를 불러오는 중입니다...', 'info');
  async function fetchEditorRows() {
    if(autoPeople)return {data:await AdminCore.all('site_content',{search:'people.'}),complete:true,failed:[]};
    try{return {data:await AdminCore.all('site_content'),complete:true,failed:[]};}
    catch(error){
      if(error.status!==413&&error.status!==500)throw error;
      message('전체 콘텐츠 조회가 서버 제한(HTTP '+error.status+')에 걸려 메뉴·섹션별로 나누어 다시 조회합니다. 정상 조회된 메뉴 사진은 저장할 수 있습니다.','warn');
      var prefixes=Array.from(new Set(fields.map(function(f){var p=f.key.split('.');return p[0]==='menu'&&p[1]==='catalog'&&p[2]?'menu.catalog.'+p[2]+'.':p[0]+'.';}))),byId=Object.create(null),failed=[];
      for(var i=0;i<prefixes.length;i++){
        var prefix=prefixes[i];
        try{
          var list=await AdminCore.all('site_content',{search:prefix});
          list.forEach(function(row){if(row.key&&row.key.indexOf(prefix)===0)byId[row.id]=row;});
          fields.forEach(function(f){if(f.key.indexOf(prefix)===0)loadedKeys[f.key]=true;});
        }catch(prefixError){if(prefixError.status!==413&&prefixError.status!==500)throw prefixError;failed.push(prefix);}
      }
      var data=Object.values(byId);
      if(!data.length&&failed.length===prefixes.length)throw error;
      return {data:data,complete:failed.length===0,failed:failed};
    }
  }
  document.addEventListener('kinoya:table-read-reduced',function(event){
    if(!ready&&event.detail.table==='site_content')message('기존 콘텐츠 조회가 용량 제한(HTTP 413)에 걸려 '+event.detail.limit+'개씩 나누어 다시 불러오는 중입니다. 선택한 사진과 입력 내용은 유지됩니다.','info');
  });
  fetchEditorRows()
    .then(function (result) {
      if (!result || !Array.isArray(result.data)) throw new Error('응답 형식 오류');
      if(result.complete)fields.forEach(function(f){loadedKeys[f.key]=true;});
      result.data.forEach(function (row) { if (row.key) { rows[row.key] = row; loadedKeys[row.key]=true; } });
      fields.forEach(function (f) {
        var row = rows[f.key];
        if (!row) return;
        var id = idFor(f.key);
        if (f.type === 'image') {
          if (!pendingMenuPhotos[f.key] && !Object.prototype.hasOwnProperty.call(images,f.key) && row.value != null) {
            var pEl = document.getElementById('preview-' + id);
            var resolvedVal = row.value;
            if (resolvedVal && !/^data:/i.test(resolvedVal)) {
              try { resolvedVal = new URL(resolvedVal, AdminCore.root).href; } catch(e) {}
            }
            if(menuPhoto(f))setMenuPreview(f,resolvedVal);else if(pEl) pEl.src = resolvedVal || emptyMenuPreview;
          }
        } else {
          var input = document.getElementById('text-' + id);
          var loadedTextVal = row.value == null ? (f.current || '') : row.value;
          if (f.key === 'social.youtube.apikey' && loadedTextVal) {
            loadedTextVal = decryptYtApiKey(loadedTextVal);
          }
          if (input && !input.dataset.dirty) input.value = autoPeople ? peopleText(loadedTextVal) : loadedTextVal;
          if (f.type === 'video') {
            var vp = document.getElementById('video-preview-' + id);
            var vSrc = row.value || f.current || '';
            if (vp && vSrc) { try { vp.src = new URL(vSrc, AdminCore.root).href; vp.load(); } catch(e){} }
          }
        }
      });
      ready = true;partialRead=!result.complete;contentReadError='';
      fields.filter(function(f){return f.type==='image';}).forEach(function (f) { document.getElementById('file-'+idFor(f.key)).disabled=!menuPhoto(f)&&!loadedKeys[f.key]; });
      saveBtn.disabled = photoJobs>0;
      saveBtn.classList.remove('opacity-60');
      if(result.complete)message('편집 항목 ' + fields.length + '개를 불러왔습니다. ' + (autoPeople ? '사진은 자동 저장 · 글씨는 글씨 변경사항 저장을 누르세요.' : '수정 후 전체 저장을 눌러주세요.'), 'ok');
      else message('일부 대용량 섹션('+result.failed.join(', ')+')을 제외하고 편집 항목을 불러왔습니다. 조회된 메뉴 사진·글씨는 저장할 수 있으며, 미조회 섹션은 저장 전 개별 확인합니다.','warn');
    })
    .catch(function (err) {
      contentReadError=err.message;
      console.error('[admin] 콘텐츠 읽기 실패:', err);
      message('저장된 콘텐츠를 불러오지 못했습니다 (' + err.message + '). 중복·덮어쓰기 방지를 위해 저장을 중단했습니다. '+(err.status===413?'사진 업로드 전의 기존 데이터 조회 오류입니다. 기존 콘텐츠 크기와 서버 제한을 확인해주세요.':'배포 및 /tables/site_content 연결을 확인해주세요.'), 'error');
    });

  container.addEventListener('input', function (event) {
    if (event.target.matches('textarea, input[type="number"], input[type="text"], input[type="password"]')) {
      var f=fields.find(function(field){return 'text-'+idFor(field.key)===event.target.id;});
      var original=f?(rows[f.key]?rows[f.key].value:(f.current||'')):'';
      if(f&&f.key==='social.youtube.apikey'&&original)original=decryptYtApiKey(original);
      if(autoPeople&&rows[f?.key])original=peopleText(original);
      if(event.target.value===String(original??''))delete event.target.dataset.dirty;
      else event.target.dataset.dirty='1';
    }
  });

  async function saveField(f, value) {
    if (!ready&&!loadedKeys[f.key]) throw new Error('조회가 완료되기 전에는 저장할 수 없습니다.');
    if (!loadedKeys[f.key]) throw new Error('기존 콘텐츠를 확인하지 못해 저장할 수 없습니다: '+f.key);
    AdminCore.assertNoBinary(value);
    if ((f.type==='image' || f.type==='video') && value) AdminCore.safeURL(value,true);
    if (/^social\.sns\./.test(f.key) && value) AdminCore.safeURL(value);
    var fresh = await readExistingRow(f);
    if (String(fresh?.value ?? '') !== String(rows[f.key]?.value ?? '')) throw new Error('다른 화면에서 변경된 항목입니다: '+f.key+'. 새로고침 후 다시 편집하세요.');
    var displayValue = value;
    if (f.key === 'social.youtube.apikey' && value) {
      displayValue = decryptYtApiKey(value);
      value = encryptYtApiKey(displayValue);
    } else if (autoPeople && f.type !== 'image' && f.type !== 'video') value = escapeHtml(value).replace(/\r?\n/g, '<br>');
    else if (f.type !== 'image' && f.type !== 'video' && !/^social\.youtube\./.test(f.key)) value = AdminCore.cleanHTML(value);
    if(rows[f.key]&&!fresh)throw new Error('다른 화면에서 삭제된 항목입니다: '+f.key+'. 새로고침하세요.');
    var old = fresh || rows[f.key];
    var url = '/tables/site_content' + (old && old.id ? '/' + encodeURIComponent(old.id) : '');
    // 배포된 서버가 PATCH 메서드를 지원하지 않아(HTTP 405) 기존 항목 수정 시 PUT(전체 갱신)을 사용합니다.
    return fetch(url, {
      method: old && old.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: f.key, page: f.group, label: f.label, type: f.type, value: value })
    }).then(function (response) {
      if (!response.ok) {
        return response.text().then(function (text) {
          return Promise.reject(new Error(f.label + ': HTTP ' + response.status + (text ? ' - ' + text.substring(0, 200) : '')));
        }, function () {
          return Promise.reject(new Error(f.label + ': HTTP ' + response.status));
        });
      }
      return response.json();
    }).then(function (row) {
      if(!row?.id)throw new Error('저장 응답 id가 없습니다. 새로고침하여 저장 여부를 먼저 확인하세요.');
      var previousValue = old && old.value ? String(old.value) : '';
      rows[f.key] = row;
      if ((f.type === 'image' || f.type === 'video') && previousValue && previousValue !== String(value || '') && AdminCore.deleteReplacedFile) {
        AdminCore.deleteReplacedFile(previousValue, value);
      }
      try { localStorage.removeItem('cms_cache'); } catch (e) {}
      document.dispatchEvent(new CustomEvent('kinoya:admin-field-saved', {detail:{key:f.key,value:value,id:row.id}}));
      if (/^global\.logo\.(header|footer)$/.test(f.key)) {
        try { var logos=JSON.parse(localStorage.getItem('kinoya_logo_cache_v1')||'{}');logos[f.key]={value:value,updated_at:row.updated_at||Date.now(),id:row.id};localStorage.setItem('kinoya_logo_cache_v1',JSON.stringify(logos)); } catch(e) {}
      }
      delete images[f.key];
      if(menuPhoto(f)){
        if(!value)setMenuPreview(f,'');
        if(/^menu\./.test(f.key))updateMenuCache(f.key,row);
        delete pendingMenuPhotos[f.key];
        var fileInput=document.getElementById('file-'+idFor(f.key));if(fileInput)fileInput.value='';
        photoMessage(f,'✅ 저장 완료 — 공개 사이트에 즉시 반영되었습니다.');
      }
      var input = document.getElementById('text-' + idFor(f.key));
      if (input && input.value === displayValue) delete input.dataset.dirty;
    });
  }
  saveBtn.addEventListener('click', function () {
    if (!ready || saving || photoJobs) return;
    var changed = fields.filter(function (f) {
      if (f.type === 'image') return !!pendingMenuPhotos[f.key] || Object.prototype.hasOwnProperty.call(images, f.key);
      var input = document.getElementById('text-' + idFor(f.key));
      return input && input.dataset.dirty && input.value !== (autoPeople ? peopleText(rows[f.key]?.value) : (rows[f.key] ? rows[f.key].value || '' : ''));
    });
    if (!changed.length) { message('변경된 항목이 없습니다.', 'info'); return; }
    if (changed.some(function (f) { return f.key === 'menu.autoslide.seconds'; })) {
      var intervalInput = document.getElementById('text-' + idFor('menu.autoslide.seconds'));
      var intervalText = intervalInput.value.trim();
      var seconds = Number(intervalText);
      if ((intervalText && (!Number.isFinite(seconds) || seconds < 1 || seconds > 120)) || !intervalInput.checkValidity()) {
        message('메뉴 자동 슬라이드 간격은 1~120초로 입력해주세요.', 'error');
        intervalInput.focus();
        intervalInput.reportValidity();
        return;
      }
    }
    saving = true;
    container.inert = true;
    saveBtn.disabled = true;
    saveBtn.classList.add('opacity-60');
    message('변경된 ' + changed.length + '개 항목 저장 중...', 'info');
    Promise.allSettled(changed.map(function (f) {
      if(menuPhoto(f)&&pendingMenuPhotos[f.key])return persistMenuPhoto(f);
      return ensureFieldLoaded(f).then(function(){
        var value = f.type === 'image' ? images[f.key] : document.getElementById('text-' + idFor(f.key)).value;
        return saveField(f, value);
      });
    })).then(function (results) {
      var failed = results.filter(function (r) { return r.status === 'rejected'; });
      if (failed.length) {
        console.error('[admin] 저장 실패:', failed);
        var reasons = failed.map(function (r) { return r.reason && r.reason.message ? r.reason.message : String(r.reason); }).join(' / ');
        message('일부 항목 저장에 실패했습니다 (' + failed.length + '개): ' + reasons, 'error');
      } else {
        message('변경된 ' + changed.length + '개 항목을 저장했습니다. 사이트를 새로고침해 확인해주세요.', 'ok');
      }
    }).finally(function () {
      saving = false;
      container.inert = false;
      saveBtn.disabled = false;
      saveBtn.classList.remove('opacity-60');
    });
  });
  window.addEventListener('beforeunload', function(event) {
    if (saving || photoJobs || Object.keys(pendingMenuPhotos).length || Object.keys(images).length || container.querySelector('[data-dirty]')) { event.preventDefault(); event.returnValue=''; }
  });
})();
