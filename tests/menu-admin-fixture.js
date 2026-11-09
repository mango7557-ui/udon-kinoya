/* Only an isolated in-memory Table API. Tests NEVER write project or hosted rows. */
window.CMS_FIELDS = [{group: '메뉴소개', key: 'menu.autoslide.seconds', label: '자동 슬라이드 간격(초)', type: 'text', current: '4'}];
window.menuSettingTestRequests = [];
let row = {id: 'test-setting', key: 'menu.autoslide.seconds', value: '4', type: 'text'};
window.fetch = async function (url, options = {}) {
  if (!String(url).includes('/tables/site_content')) throw new Error('Unexpected request: ' + url);
  if (!options.method || options.method === 'GET') return new Response(JSON.stringify({data: [row], total: 1}), {status: 200, headers: {'Content-Type': 'application/json'}});
  if (options.method !== 'PUT') throw new Error('Unexpected write method: ' + options.method);
  const body = JSON.parse(options.body);
  window.menuSettingTestRequests.push({url, method: options.method, body});
  row = {...body, id: row.id};
  return new Response(JSON.stringify(row), {status: 200, headers: {'Content-Type': 'application/json'}});
};
