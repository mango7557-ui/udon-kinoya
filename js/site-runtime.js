/* Shared URL, Table API and content validation. This is NOT access control. */
(function () {
  'use strict';
  if (window.KinoyaRuntime) return;
  const root = new URL('../', document.currentScript.src);
  if (!window.__kinoyaFirebaseBridgeInstalled && !window.adminFixture && !/\/tests\//i.test(location.pathname || '')) {
    const cfgScript = document.createElement('script');
    cfgScript.src = new URL('firebase-config.js', root).href;
    document.head.append(cfgScript);
    const bridgeScript = document.createElement('script');
    bridgeScript.src = new URL('js/firebase-bridge.js', root).href;
    document.head.append(bridgeScript);
  }
  const inflightGet = new Map();

  function safeURL(value, media = false, legacy = false) {
    value = String(value == null ? '' : value).trim();
    if (!value) return '';
    if (legacy && media && /^data:image\/(png|jpeg|webp|gif);base64,/i.test(value)) return value;
    const local = value.startsWith('/') && !value.startsWith('//') ? value.slice(1) : value;
    const url = new URL(local, root);
    if (!(media ? ['http:', 'https:'] : ['http:', 'https:', 'tel:', 'mailto:']).includes(url.protocol)) throw new Error('허용되지 않는 주소 형식입니다.');
    return url.href;
  }
  function cleanHTML(value, doc = document) {
    const t = doc.createElement('template'); t.innerHTML = String(value || '');
    t.content.querySelectorAll('script,style,iframe,object,embed,link,meta,base,form,input,button,svg,math').forEach(el => el.remove());
    const tags = new Set(['BR','B','STRONG','EM','I','U','SPAN','P','DIV','UL','OL','LI','A','TABLE','THEAD','TBODY','TR','TH','TD','BLOCKQUOTE','H2','H3','H4']);
    t.content.querySelectorAll('*').forEach(el => {
      if (!tags.has(el.tagName)) { el.replaceWith(...el.childNodes); return; }
      Array.from(el.attributes).forEach(a => {
        if (!['class','title','href','target','rel','colspan','rowspan'].includes(a.name)) el.removeAttribute(a.name);
        else if (a.name === 'href') { try { el.setAttribute('href', safeURL(a.value)); } catch(e) { el.removeAttribute('href'); } }
        else if (a.name === 'class' && !/^[a-zA-Z0-9_\s-]*$/.test(a.value)) el.removeAttribute('class');
      });
      if (el.tagName === 'A' && el.target === '_blank') el.rel = 'noopener noreferrer';
    });
    return t.innerHTML;
  }
  function tableURL(path) {
    const text = String(path);
    if (!/^\/?tables\//.test(text)) throw new Error('잘못된 Table API 경로');
    const u = new URL(text.replace(/^\//, ''), root);
    if (!u.pathname.startsWith(root.pathname + 'tables/')) throw new Error('잘못된 Table API 경로');
    return u.href;
  }
  function isAdminPage() {
    if (window.AdminCore) return true;
    if (document.getElementById('admin-app') || document.getElementById('save-all-btn')) return true;
    return /\/admin(\/|$)/i.test(location.pathname || '');
  }
  function loginNotice(loginURL) {
    if (!isAdminPage()) return;
    try {
      const url = new URL(loginURL, location.href);
      if (url.protocol !== 'https:' && url.origin !== location.origin) return;
      let el = document.getElementById('admin-login-notice');
      if (!el) { el = document.createElement('p'); el.id = 'admin-login-notice'; el.setAttribute('role','alert'); el.style.cssText='padding:16px;background:#fff3cd;color:#382f1c;overflow-wrap:anywhere'; document.body.prepend(el); }
      el.replaceChildren(document.createTextNode('로그인이 필요합니다. 로그인 후 직접 다시 시도해주세요. '));
      const a = document.createElement('a'); a.href = url.href; a.textContent = '로그인하기'; a.style.textDecoration='underline'; el.append(a);
    } catch(e) {}
  }
  async function checked(response, action) {
    if (response.ok) return response;
    let body = {}; try { body = await response.clone().json(); } catch(e) {}
    if (response.status === 401 && body.login_url) loginNotice(body.login_url);
    const descriptions = {401:'로그인 후 직접 다시 시도해주세요.',403:'권한이 없습니다.',404:'API 연결 또는 해당 항목을 찾지 못했습니다.',409:'다른 작업과 충돌했습니다. 새로고침 후 확인하세요.',413:action==='조회'||action==='GET'?'기존 콘텐츠 조회가 용량 제한에 걸렸습니다. 선택한 새 사진의 업로드 오류가 아닙니다.':'요청 용량이 큽니다. 더 작은 파일/요청을 사용하세요.',503:'서비스가 활성화되지 않았거나 일시 중단됐습니다.'};
    const error = new Error((action || '요청') + ' 실패 (HTTP ' + response.status + '). ' + (descriptions[response.status] || '잠시 후 직접 다시 시도해주세요.'));
    error.status = response.status; throw error;
  }
  async function request(path, options = {}) {
    const isTable = /^\/?tables\//.test(String(path));
    const method = (options.method || 'GET').toUpperCase();
    const useTimeout = isTable && method === 'GET' && !options.signal;
    const controller = useTimeout ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 8000) : null;
    try {
      const response = await window.fetch(isTable ? tableURL(path) : path, controller ? {...options, signal: controller.signal} : options);
      await checked(response, options.method || '조회');
      return response;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  async function all(table, query = {}) {
    if (!/^[a-z][a-z0-9_]*$/.test(table)) throw new Error('잘못된 테이블명');
    // Only read pagination is retried. A smaller limit restarts at page 1:
    // retaining the old page number would skip or duplicate records.
    async function readPages(limit) {
    let rows = [], expected, previous = '';
    for (let page=1; page<=10000; page++) {
      const params = new URLSearchParams({...query,limit:String(limit),page:String(page),_:String(Date.now())});
      const response = await request('tables/'+table+'?'+params, {cache:'no-store'});
      const json = await response.json();
      if (!Array.isArray(json.data)) throw new Error(table+' 응답 형식 오류');
      if (typeof json.total === 'number') {
        if (expected !== undefined && expected !== json.total) throw new Error(table+' 조회 중 데이터가 바뀌었습니다. 다시 조회해주세요.');
        expected = json.total;
      }
      const signature = json.data.map(r=>r.id).join('|');
      if (page>1 && signature && signature===previous) throw new Error(table+' 페이지가 반복됩니다. 전체 조회를 중단했습니다.');
      previous = signature; rows.push(...json.data);
      if (expected !== undefined && rows.length >= expected) break;
      if (!json.data.length) { if (expected !== undefined && rows.length < expected) throw new Error(table+' 일부 행이 누락되었습니다.'); break; }
      if (expected === undefined && json.data.length < limit) break;
      if (page===10000) throw new Error('조회 페이지 안전 한도 초과');
    }
    const ids = rows.map(r=>r.id);
    if (new Set(ids).size !== ids.length) throw new Error(table+' 중복 응답입니다. 다시 조회해주세요.');
    return rows.filter(r=>!r.deleted);
    }
    const limits=[100,20,5,1];
    for(let attempt=0;attempt<limits.length;attempt++){
      try{
        return await readPages(limits[attempt]);
      }
      catch(error){
        const retryable=error&&error.status===413;
        if(!retryable)throw error;
        if(attempt===limits.length-1){
          const failure=new Error(table+' 조회 실패 (HTTP 413): 1개씩 조회해도 서버 용량 제한에 걸렸습니다. 기존 개별 콘텐츠 크기와 서버 제한 점검이 필요합니다. 새 사진 용량 문제가 아니며 저장은 중단했습니다.');
          failure.status=413;throw failure;
        }
        document.dispatchEvent(new CustomEvent('kinoya:table-read-reduced',{detail:{table,limit:limits[attempt+1]}}));
      }
    }
  }
  function assertNoBinary(value) {
    if (typeof value === 'string' && (/^\s*data:/i.test(value) || /data:[a-z0-9.+\/-]+;base64,/i.test(value))) throw new Error('DB에는 파일 본문을 저장할 수 없습니다. 파일 업로드 후 참조만 저장하세요.');
    if (value && typeof value === 'object') Object.values(value).forEach(assertNoBinary);
  }
  async function write(table, id, payload) {
    assertNoBinary(payload);
    const response = await request('tables/'+table+(id?'/'+encodeURIComponent(id):''), {method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const row = await response.json();
    if (!row || !row.id) throw new Error('저장 응답에 id가 없습니다. 중복 등록하지 말고 새로고침하여 확인하세요.');
    return row;
  }
  window.KinoyaRuntime = {root,safeURL,cleanHTML,tableURL,checked,fetch:request,all,write,assertNoBinary};
})();
