/*
 * 우동키노야 Firebase Firestore + 공유 링크 실시간 연동 브리지
 * - 로컬 Node.js 서버(127.0.0.1 / localhost) 및 테스트 픽스처(window.adminFixture)는 그대로 통과
 * - GitHub Pages / Firebase Hosting 등 정적 공유 링크에서는 /tables/* 및 /files/* 요청을
 *   Firebase Firestore (gen-lang-client-0844079951) 실시간 DB로 연결
 */
(function () {
  'use strict';
  if (window.__kinoyaFirebaseBridgeInstalled) return;
  window.__kinoyaFirebaseBridgeInstalled = true;

  var KEY_SALT = 'kinoya_sec_2026_v1';
  function encryptSecretKey(plain) {
    var str = String(plain || '').trim();
    if (!str) return '';
    if (str.indexOf('enc:v1:') === 0) return str;
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i) ^ KEY_SALT.charCodeAt(i % KEY_SALT.length));
    }
    return 'enc:v1:' + btoa(String.fromCharCode.apply(null, bytes));
  }
  function decryptSecretKey(cipher) {
    var str = String(cipher || '').trim();
    if (!str) return '';
    var rawB64 = str.indexOf('enc:v1:') === 0 ? str.slice(7) : str;
    try {
      var bin = atob(rawB64);
      var out = '';
      for (var i = 0; i < bin.length; i++) {
        out += String.fromCharCode(bin.charCodeAt(i) ^ KEY_SALT.charCodeAt(i % KEY_SALT.length));
      }
      return out;
    } catch (e) {
      return str;
    }
  }
  window.KinoyaCrypto = window.KinoyaCrypto || { encryptKey: encryptSecretKey, decryptKey: decryptSecretKey };

  var DEFAULT_FIREBASE_CONFIG = {
    apiKey: decryptSecretKey('enc:v1:KiAUDioYHhI8VgdTUlxnOjAJDzs/HR8GACBdNSxhBGBMLz9wLRMN'),
    authDomain: 'gen-lang-client-0844079951.firebaseapp.com',
    projectId: 'gen-lang-client-0844079951',
    storageBucket: 'gen-lang-client-0844079951.firebasestorage.app',
    messagingSenderId: '495632671671',
    appId: '1:495632671671:web:1627dd6653a88263b43e32',
    collection: 'site_config',
    namespace: 'kinoya'
  };

  var CONFIG_STORAGE_KEY = 'kinoya_firebase_config_v1';
  var LOCAL_FALLBACK_KEY = 'kinoya_local_db_v1';
  var VALID_TABLES = new Set([
    'site_content',
    'consultations',
    'youtube_videos',
    'partner_logos',
    'faq_items',
    'news_items',
    'resources',
    'store_items',
    'visitor_logs'
  ]);
  var VALID_COLLECTIONS = new Set(['cms-images', 'cms-videos', 'resources']);
  var originalFetch = window.fetch.bind(window);
  var fileDataCache = new Map();

  function getFirebaseConfig() {
    var candidates = [];
    try {
      var saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) candidates.push(JSON.parse(saved));
    } catch (e) {}
    if (window.FIREBASE_CONFIG) candidates.push(window.FIREBASE_CONFIG);
    candidates.push(DEFAULT_FIREBASE_CONFIG);
    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      if (c && typeof c === 'object' && c.projectId && c.apiKey) {
        return {
          apiKey: String(c.apiKey).trim(),
          authDomain: String(c.authDomain || (c.projectId + '.firebaseapp.com')).trim(),
          projectId: String(c.projectId).trim(),
          storageBucket: String(c.storageBucket || (c.projectId + '.firebasestorage.app')).trim(),
          collection: String(c.collection || 'site_config').trim(),
          namespace: String(c.namespace || 'kinoya').trim()
        };
      }
    }
    return DEFAULT_FIREBASE_CONFIG;
  }

  window.FIREBASE_CONFIG = getFirebaseConfig();
  window.setKinoyaFirebaseConfig = function (config) {
    if (!config || !config.projectId || !config.apiKey) {
      throw new Error('projectId와 apiKey가 포함된 Firebase 설정이 필요합니다.');
    }
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    location.reload();
  };

  function isTestHarness() {
    if (window.adminFixture) return true;
    try {
      if (/\/tests\//i.test(location.pathname || '')) return true;
      if (window.parent && window.parent !== window && /\/tests\//i.test(window.parent.location.pathname || '')) return true;
    } catch (e) {}
    return false;
  }

  function isLocalServerHost() {
    var h = (location.hostname || '').toLowerCase();
    return h === 'localhost' || h === '127.0.0.1';
  }

  function jsonResponse(data, status) {
    return new Response(JSON.stringify(data), {
      status: status || 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  }

  function encodeDocKey(str) {
    return encodeURIComponent(String(str || '')).replace(/\./g, '%2E');
  }

  function recordDocId(cfg, table, id) {
    return cfg.namespace + '__' + table + '__' + encodeDocKey(id);
  }

  function fileDocId(cfg, collection, name) {
    return cfg.namespace + '__file__' + collection + '__' + encodeDocKey(name);
  }

  function toFirestoreValue(value) {
    if (value === null || value === undefined) return { nullValue: null };
    if (typeof value === 'boolean') return { booleanValue: value };
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) return { nullValue: null };
      return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    }
    if (typeof value === 'string') return { stringValue: value };
    if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
    if (typeof value === 'object') {
      var fields = {};
      Object.keys(value).forEach(function (k) {
        if (value[k] !== undefined) fields[k] = toFirestoreValue(value[k]);
      });
      return { mapValue: { fields: fields } };
    }
    return { stringValue: String(value) };
  }

  function fromFirestoreValue(value) {
    if (!value || typeof value !== 'object') return null;
    if ('nullValue' in value) return null;
    if ('booleanValue' in value) return Boolean(value.booleanValue);
    if ('integerValue' in value) return Number(value.integerValue);
    if ('doubleValue' in value) return Number(value.doubleValue);
    if ('timestampValue' in value) return value.timestampValue;
    if ('stringValue' in value) return value.stringValue;
    if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
    if ('mapValue' in value) return fromFirestoreFields((value.mapValue && value.mapValue.fields) || {});
    return null;
  }

  function fromFirestoreFields(fields) {
    var obj = {};
    Object.keys(fields || {}).forEach(function (k) {
      obj[k] = fromFirestoreValue(fields[k]);
    });
    return obj;
  }

  function stripInternalFields(row) {
    var copy = Object.assign({}, row);
    delete copy.__kinoya_ns;
    delete copy.__kinoya_table;
    delete copy.__kinoya_kind;
    return copy;
  }

  function firestoreCollectionBase(cfg) {
    return (
      'https://firestore.googleapis.com/v1/projects/' +
      encodeURIComponent(cfg.projectId) +
      '/databases/(default)/documents/' +
      encodeURIComponent(cfg.collection)
    );
  }

  var allDocsCache = { at: 0, promise: null, docs: null };

  async function listAllNamespaceDocs(cfg, forceRefresh) {
    var now = Date.now();
    if (!forceRefresh && allDocsCache.docs && now - allDocsCache.at < 1500) {
      return allDocsCache.docs;
    }
    if (!forceRefresh && allDocsCache.promise) {
      return allDocsCache.promise;
    }
    allDocsCache.promise = (async function () {
      var rows = [];
      var pageToken = '';
      var prefix = cfg.namespace + '__';
      do {
        var tokenParam = pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : '';
        var res = await originalFetch(
          firestoreCollectionBase(cfg) +
            '?pageSize=300&key=' +
            encodeURIComponent(cfg.apiKey) +
            tokenParam,
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error('Firestore list failed (' + res.status + ')');
        var data = await res.json();
        var docs = data.documents || [];
        for (var i = 0; i < docs.length; i++) {
          var doc = docs[i];
          var docName = doc.name ? decodeURIComponent(doc.name.split('/').pop()) : '';
          if (!docName.startsWith(prefix)) continue;
          var parsed = fromFirestoreFields(doc.fields || {});
          if (parsed && parsed.__kinoya_kind === 'file' && parsed.reference && parsed.data_url) {
            fileDataCache.set(parsed.reference, parsed.data_url);
          }
          rows.push({ docName: docName, data: parsed });
        }
        pageToken = data.nextPageToken || '';
      } while (pageToken);
      allDocsCache.docs = rows;
      allDocsCache.at = Date.now();
      allDocsCache.promise = null;
      setTimeout(hydrateUploadedFileElements, 0);
      return rows;
    })();
    try {
      return await allDocsCache.promise;
    } catch (err) {
      allDocsCache.promise = null;
      throw err;
    }
  }

  function invalidateDocsCache() {
    allDocsCache.at = 0;
    allDocsCache.docs = null;
    allDocsCache.promise = null;
  }

  async function readBodyObject(input, options) {
    var raw = options && options.body !== undefined
      ? options.body
      : input instanceof Request
      ? await input.clone().text()
      : '{}';
    if (typeof raw !== 'string') {
      if (raw instanceof URLSearchParams) raw = raw.toString();
      else if (raw && typeof raw.text === 'function') raw = await raw.text();
      else raw = JSON.stringify(raw || {});
    }
    var parsed = JSON.parse(raw || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Expected JSON object');
    }
    return parsed;
  }

  function filterAndPaginate(rows, url) {
    var search = (url.searchParams.get('search') || '').toLowerCase();
    var filtered = rows.filter(function (row) {
      if (row && row.deleted) return false;
      if (!search) return true;
      return Object.values(row).some(function (v) {
        return String(v == null ? '' : v).toLowerCase().includes(search);
      });
    });
    var sort = url.searchParams.get('sort');
    if (sort) {
      var desc = sort.startsWith('-');
      var field = desc ? sort.slice(1) : sort;
      filtered.sort(function (a, b) {
        var av = a[field] != null ? a[field] : '';
        var bv = b[field] != null ? b[field] : '';
        var cmp = typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv));
        return desc ? -cmp : cmp;
      });
    } else {
      filtered.sort(function (a, b) {
        return (Number(a.created_at) || 0) - (Number(b.created_at) || 0);
      });
    }
    var page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1);
    var limit = Math.max(1, Math.min(1000, Number.parseInt(url.searchParams.get('limit') || '100', 10) || 100));
    return jsonResponse({
      data: filtered.slice((page - 1) * limit, page * limit),
      total: filtered.length,
      page: page,
      limit: limit
    });
  }

  async function handleFirestoreTable(cfg, table, id, method, url, input, options) {
    var keyParam = 'key=' + encodeURIComponent(cfg.apiKey);
    var base = firestoreCollectionBase(cfg);

    if (method === 'GET' || method === 'HEAD') {
      if (id) {
        var singleUrl = base + '/' + encodeURIComponent(recordDocId(cfg, table, id)) + '?' + keyParam;
        var singleRes = await originalFetch(singleUrl, { cache: 'no-store' });
        if (singleRes.status === 404) return jsonResponse({ error: 'Record not found' }, 404);
        if (!singleRes.ok) throw new Error('Firestore get failed (' + singleRes.status + ')');
        var singleDoc = await singleRes.json();
        return jsonResponse(stripInternalFields(fromFirestoreFields(singleDoc.fields || {})));
      }
      var allDocs = await listAllNamespaceDocs(cfg, false);
      var tablePrefix = cfg.namespace + '__' + table + '__';
      var rows = allDocs
        .filter(function (entry) {
          return entry.docName.startsWith(tablePrefix) || entry.data.__kinoya_table === table;
        })
        .map(function (entry) {
          return stripInternalFields(entry.data);
        });
      return filterAndPaginate(rows, url);
    }

    if (method === 'DELETE' && id) {
      var delUrl = base + '/' + encodeURIComponent(recordDocId(cfg, table, id)) + '?' + keyParam;
      var checkDel = await originalFetch(delUrl, { cache: 'no-store' });
      if (checkDel.status === 404) return jsonResponse({ error: 'Record not found' }, 404);
      var delRes = await originalFetch(delUrl, { method: 'DELETE' });
      if (!delRes.ok) throw new Error('Firestore delete failed (' + delRes.status + ')');
      invalidateDocsCache();
      return jsonResponse({ id: id, deleted: true }, 200);
    }

    if ((method === 'POST' && !id) || ((method === 'PUT' || method === 'PATCH') && id)) {
      var body = await readBodyObject(input, options);
      var previous = {};
      if (id) {
        var existUrl = base + '/' + encodeURIComponent(recordDocId(cfg, table, id)) + '?' + keyParam;
        var existRes = await originalFetch(existUrl, { cache: 'no-store' });
        if (existRes.status === 404) return jsonResponse({ error: 'Record not found' }, 404);
        if (!existRes.ok) throw new Error('Firestore read failed (' + existRes.status + ')');
        previous = stripInternalFields(fromFirestoreFields((await existRes.json()).fields || {}));
      }
      var recordId = String(id || body.id || (table === 'site_content' && body.key ? 'cms-' + body.key.replace(/[^a-zA-Z0-9_-]/g, '-') : crypto.randomUUID()));
      var now = Date.now();
      var merged = Object.assign(
        {},
        previous,
        body,
        {
          id: recordId,
          created_at: previous.created_at || body.created_at || now,
          updated_at: now,
          __kinoya_ns: cfg.namespace,
          __kinoya_table: table,
          __kinoya_kind: 'record'
        }
      );
      var saveUrl = base + '/' + encodeURIComponent(recordDocId(cfg, table, recordId)) + '?' + keyParam;
      var saveRes = await originalFetch(saveUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: toFirestoreValue(merged).mapValue.fields })
      });
      if (!saveRes.ok) throw new Error('Firestore write failed (' + saveRes.status + ')');
      invalidateDocsCache();
      return jsonResponse(stripInternalFields(merged), method === 'POST' ? 201 : 200);
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  function blobToDataURL(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || '')); };
      reader.onerror = function () { reject(new Error('파일 인코딩 실패')); };
      reader.readAsDataURL(blob);
    });
  }

  function dataURLToResponse(dataURL) {
    var m = /^data:([^;,]+)?(?:;base64)?,(.*)$/i.exec(String(dataURL || ''));
    if (!m) return new Response('', { status: 404 });
    var mime = m[1] || 'application/octet-stream';
    var binary = atob(m[2]);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=86400'
      }
    });
  }

  async function fetchFileDataURL(cfg, collection, name) {
    var reference = '/files/' + collection + '/' + name;
    if (fileDataCache.has(reference)) return fileDataCache.get(reference);
    try {
      var keyParam = 'key=' + encodeURIComponent(cfg.apiKey);
      var docUrl = firestoreCollectionBase(cfg) + '/' + encodeURIComponent(fileDocId(cfg, collection, name)) + '?' + keyParam;
      var res = await originalFetch(docUrl);
      if (res.ok) {
        var doc = await res.json();
        var parsed = fromFirestoreFields(doc.fields || {});
        if (parsed && parsed.data_url) {
          fileDataCache.set(reference, parsed.data_url);
          return parsed.data_url;
        }
      }
    } catch (e) {}
    try {
      var localFiles = JSON.parse(localStorage.getItem(LOCAL_FALLBACK_KEY + ':files') || '{}');
      if (localFiles[reference]) {
        fileDataCache.set(reference, localFiles[reference]);
        return localFiles[reference];
      }
    } catch (e) {}
    return '';
  }

  async function handleFirestoreFile(cfg, collection, name, method, input, options) {
    var keyParam = 'key=' + encodeURIComponent(cfg.apiKey);
    var base = firestoreCollectionBase(cfg);

    if (method === 'POST' && !name) {
      var rawBody = options && options.body !== undefined ? options.body : input instanceof Request ? await input.clone().blob() : null;
      var blob = rawBody instanceof Blob ? rawBody : new Blob([rawBody || ''], { type: (options && options.headers && (options.headers['Content-Type'] || options.headers['content-type'])) || 'application/octet-stream' });
      if (blob.size > 750 * 1024) {
        return jsonResponse({ error: '공유 클라우드 DB에는 750KB 이하 파일만 직접 업로드할 수 있습니다. 이미지는 자동으로 600KB 이하로 압축됩니다.' }, 413);
      }
      var dataUrl = await blobToDataURL(blob);
      var extMatch = String((options && options.headers && (options.headers['X-File-Name'] || options.headers['x-file-name'])) || 'file.png').match(/\.[a-z0-9]+$/i);
      var ext = extMatch ? extMatch[0].toLowerCase() : '.png';
      var fileId = crypto.randomUUID() + ext;
      var reference = '/files/' + collection + '/' + fileId;
      var payload = {
        id: fileId,
        collection: collection,
        reference: reference,
        data_url: dataUrl,
        created_at: Date.now(),
        __kinoya_ns: cfg.namespace,
        __kinoya_kind: 'file'
      };
      try {
        var saveUrl = base + '/' + encodeURIComponent(fileDocId(cfg, collection, fileId)) + '?' + keyParam;
        var res = await originalFetch(saveUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: toFirestoreValue(payload).mapValue.fields })
        });
        if (!res.ok) throw new Error('Firestore file save failed (' + res.status + ')');
      } catch (err) {
        var localFiles = JSON.parse(localStorage.getItem(LOCAL_FALLBACK_KEY + ':files') || '{}');
        localFiles[reference] = dataUrl;
        localStorage.setItem(LOCAL_FALLBACK_KEY + ':files', JSON.stringify(localFiles));
      }
      fileDataCache.set(reference, dataUrl);
      return jsonResponse({ id: fileId, reference: reference }, 201);
    }

    if (name && (method === 'GET' || method === 'HEAD')) {
      var foundDataUrl = await fetchFileDataURL(cfg, collection, name);
      if (!foundDataUrl) return jsonResponse({ error: 'File not found' }, 404);
      return dataURLToResponse(foundDataUrl);
    }

    if (name && method === 'DELETE') {
      var referenceToDelete = '/files/' + collection + '/' + name;
      fileDataCache.delete(referenceToDelete);
      var delUrl = base + '/' + encodeURIComponent(fileDocId(cfg, collection, name)) + '?' + keyParam;
      await originalFetch(delUrl, { method: 'DELETE' }).catch(function () {});
      return jsonResponse({ deleted: true }, 200);
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  async function handleLocalFallbackTable(table, id, method, url, input, options) {
    var db = {};
    try { db = JSON.parse(localStorage.getItem(LOCAL_FALLBACK_KEY) || '{}'); } catch (e) {}
    var rows = Array.isArray(db[table]) ? db[table] : [];
    var idx = id ? rows.findIndex(function (r) { return r.id === id; }) : -1;

    if (method === 'GET' || method === 'HEAD') {
      if (id) return idx < 0 ? jsonResponse({ error: 'Record not found' }, 404) : jsonResponse(rows[idx], 200);
      return filterAndPaginate(rows, url);
    }
    if (method === 'DELETE' && id) {
      if (idx < 0) return jsonResponse({ error: 'Record not found' }, 404);
      rows.splice(idx, 1);
      db[table] = rows;
      localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(db));
      return jsonResponse({ id: id, deleted: true }, 200);
    }
    if ((method === 'POST' && !id) || ((method === 'PUT' || method === 'PATCH') && id)) {
      if (id && idx < 0) return jsonResponse({ error: 'Record not found' }, 404);
      var body = await readBodyObject(input, options);
      var now = Date.now();
      var recordId = String(id || body.id || crypto.randomUUID());
      var saved = Object.assign({}, id ? rows[idx] : {}, body, {
        id: recordId,
        created_at: id ? rows[idx].created_at : (body.created_at || now),
        updated_at: now
      });
      if (id) rows[idx] = saved;
      else rows.push(saved);
      db[table] = rows;
      localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(db));
      return jsonResponse(saved, method === 'POST' ? 201 : 200);
    }
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  function extractRoute(url) {
    if (url.origin !== location.origin) return null;
    var tableMatch = url.pathname.match(/(?:^|\/)tables\/([a-z0-9_]+)(?:\/([^/?#]+))?$/i);
    if (tableMatch) {
      var table = tableMatch[1];
      var id = tableMatch[2] ? decodeURIComponent(tableMatch[2]) : '';
      if (VALID_TABLES.has(table)) return { kind: 'table', table: table, id: id };
    }
    var fileMatch = url.pathname.match(/(?:^|\/)files\/([a-z0-9_-]+)(?:\/([^/?#]+))?$/i);
    if (fileMatch) {
      var collection = fileMatch[1];
      var name = fileMatch[2] ? decodeURIComponent(fileMatch[2]) : '';
      if (VALID_COLLECTIONS.has(collection)) return { kind: 'file', collection: collection, name: name };
    }
    return null;
  }

  var localServerState = isLocalServerHost() ? 'unknown' : 'serverless';

  function extractFileRef(raw) {
    var m = String(raw || '').match(/(?:^|\/)files\/([a-z0-9_-]+)\/([^/?#"')\s]+)$/i);
    if (!m) return null;
    var collection = m[1];
    var name = decodeURIComponent(m[2]);
    return {
      collection: collection,
      name: name,
      reference: '/files/' + collection + '/' + name
    };
  }

  window.__kinoyaGetCachedFileDataUrl = function (raw) {
    var info = extractFileRef(raw);
    if (!info) return '';
    return fileDataCache.get(info.reference) || '';
  };

  window.fetch = async function (input, options) {
    if (isTestHarness()) {
      return originalFetch(input, options);
    }
    var rawUrl = input instanceof Request ? input.url : String(input || '');
    var url;
    try {
      url = new URL(rawUrl, document.baseURI || location.href);
    } catch (e) {
      return originalFetch(input, options);
    }
    var route = extractRoute(url);
    if (!route) {
      return originalFetch(input, options);
    }

    var method = String((options && options.method) || (input instanceof Request ? input.method : 'GET') || 'GET').toUpperCase();
    var cfg = getFirebaseConfig();

    // 로컬 서버와 공유 링크(GitHub Pages)가 항상 100% 동일한 실시간 DB(Firestore)를 바라보도록 통합
    try {
      if (route.kind === 'table') {
        var tableRes = await handleFirestoreTable(cfg, route.table, route.id, method, url, input, options);
        if (isLocalServerHost() && method !== 'GET' && method !== 'HEAD') {
          originalFetch(input, options).catch(function () {});
        }
        setTimeout(hydrateUploadedFileElements, 0);
        return tableRes;
      }
      var fileRes = await handleFirestoreFile(cfg, route.collection, route.name, method, input, options);
      setTimeout(hydrateUploadedFileElements, 0);
      return fileRes;
    } catch (err) {
      if (localServerState !== 'serverless') {
        try {
          var localRes = await originalFetch(input, options);
          if (localRes.status !== 404 && localRes.status !== 405 && localRes.status !== 501) {
            localServerState = 'active';
            return localRes;
          }
        } catch (localErr) {}
      }
      console.warn('[kinoya-firebase] Firestore fallback to localStorage:', err.message);
      if (route.kind === 'table') {
        return await handleLocalFallbackTable(route.table, route.id, method, url, input, options);
      }
      return jsonResponse({ error: err.message || '파일 처리 실패' }, 500);
    }
  };

  function hydrateUploadedFileElements() {
    if (isTestHarness()) return;
    var cfg = getFirebaseConfig();
    document.querySelectorAll('img[src*="files/"], source[src*="files/"], video[src*="files/"], a[href*="files/"]').forEach(function (el) {
      var attr = el.tagName === 'A' ? 'href' : 'src';
      var val = el.getAttribute(attr) || '';
      var info = extractFileRef(val);
      if (!info) return;
      var cached = fileDataCache.get(info.reference);
      if (cached) {
        if (el.getAttribute(attr) !== cached) {
          el.setAttribute(attr, cached);
          if (el.tagName === 'SOURCE' && el.parentElement && typeof el.parentElement.load === 'function') {
            el.parentElement.load();
          }
        }
        return;
      }
      if (el.dataset.kinoyaFileLoading === info.reference) return;
      el.dataset.kinoyaFileLoading = info.reference;
      fetchFileDataURL(cfg, info.collection, info.name).then(function (dataUrl) {
        delete el.dataset.kinoyaFileLoading;
        if (!dataUrl) return;
        el.setAttribute(attr, dataUrl);
        if (el.tagName === 'SOURCE' && el.parentElement && typeof el.parentElement.load === 'function') {
          el.parentElement.load();
        }
      });
    });
    document.querySelectorAll('[style*="files/"]').forEach(function (el) {
      var bg = el.style.backgroundImage || '';
      var m = bg.match(/files\/([a-z0-9_-]+)\/([^"')?#\s]+)/i);
      if (!m) return;
      var collection = m[1];
      var name = decodeURIComponent(m[2]);
      var reference = '/files/' + collection + '/' + name;
      var applyBgDataUrl = function (dataUrl) {
        if (!dataUrl) return;
        var currentBg = el.style.backgroundImage || '';
        if (!/files\//i.test(currentBg)) return;
        el.style.backgroundImage = currentBg.replace(
          /url\((['"]?)[^)'"]*files\/[a-z0-9_-]+\/[^)'"]+\1\)/gi,
          "url('" + dataUrl + "')"
        );
      };
      var cached = fileDataCache.get(reference);
      if (cached) {
        applyBgDataUrl(cached);
        return;
      }
      if (el.dataset.kinoyaBgLoading === reference) return;
      el.dataset.kinoyaBgLoading = reference;
      fetchFileDataURL(cfg, collection, name).then(function (dataUrl) {
        delete el.dataset.kinoyaBgLoading;
        applyBgDataUrl(dataUrl);
      });
    });
  }
  window.__kinoyaHydrateFiles = hydrateUploadedFileElements;

  function mountAdminFirebaseBadge() {
    if (isTestHarness()) return;
    var isAdmin = /\/admin(\/|$|\.html)/i.test(location.pathname || '') || document.getElementById('admin-app');
    if (!isAdmin || document.getElementById('kinoya-firebase-badge')) return;
    var cfg = getFirebaseConfig();
    var btn = document.createElement('button');
    btn.id = 'kinoya-firebase-badge';
    btn.type = 'button';
    btn.textContent = '🔥 Firebase 연결됨 (' + cfg.projectId + ')';
    btn.style.cssText =
      'position:fixed;bottom:18px;right:18px;z-index:2147483647;padding:8px 14px;border-radius:999px;border:none;background:#059669;color:#fff;font:600 12px/1.2 -apple-system,BlinkMacSystemFont,"Pretendard",sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.22);cursor:pointer';
    btn.onclick = function () {
      var raw = prompt(
        'Firebase 웹앱 설정 JSON(projectId, apiKey 포함)을 확인하거나 변경할 수 있습니다.\n비우면 기본 Firebase 설정(' + DEFAULT_FIREBASE_CONFIG.projectId + ')으로 복원합니다.',
        localStorage.getItem(CONFIG_STORAGE_KEY) || JSON.stringify(cfg, null, 2)
      );
      if (raw === null) return;
      if (!raw.trim()) {
        localStorage.removeItem(CONFIG_STORAGE_KEY);
        location.reload();
        return;
      }
      try {
        var normalized = raw
          .replace(/^[^{]*({[\s\S]*})[^}]*$/, '$1')
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
          .replace(/'/g, '"')
          .replace(/,\s*([}\]])/g, '$1');
        window.setKinoyaFirebaseConfig(JSON.parse(normalized));
      } catch (err) {
        alert('설정 형식을 확인해 주세요: ' + err.message);
      }
    };
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      mountAdminFirebaseBadge();
      hydrateUploadedFileElements();
    });
  } else {
    mountAdminFirebaseBadge();
    hydrateUploadedFileElements();
  }

  if (typeof MutationObserver === 'function') {
    var obs = new MutationObserver(function () {
      hydrateUploadedFileElements();
    });
    if (document.documentElement) {
      obs.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'style', 'href'] });
    }
  }
})();
