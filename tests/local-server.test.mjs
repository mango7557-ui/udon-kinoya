import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
test('Local site, persistent CMS, uploads and route protection', { timeout: 30000 }, async () => {
  const dir = await mkdtemp(resolve(root, '.local-test-'));
  let child;
  async function start() {
    child = spawn(process.execPath, ['server.mjs'], { cwd: root, env: { ...process.env, PORT: '0', KINOYA_DATA_DIR: dir }, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    return await new Promise((ok, no) => {
      child.once('error', no);
      child.once('exit', code => no(new Error(`Server exited ${code}: ${output}`)));
      child.stderr.on('data', chunk => { output += chunk; });
      child.stdout.on('data', chunk => {
        output += chunk;
        const match = /Kinoya ready: http:\/\/localhost:(\d+)/.exec(output);
        if (match) ok(`http://127.0.0.1:${match[1]}`);
      });
    });
  }
  async function stop() {
    if (child && child.exitCode === null) { const exited = once(child, 'exit'); child.kill(); await exited; }
  }
  try {
    let base = await start();
    const request = (path, method, value) => fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: value === undefined ? undefined : JSON.stringify(value) });
    const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
    const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
    for (const path of new Set(['/', '/admin/', '/admin/home.html', ...routes])) {
      const response = await fetch(base + path);
      assert.equal(response.status, 200, path);
      const html = await response.text();
      assert.match(html, /<html/i, path);
      for (const [, asset] of html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css|png|jpe?g|webp|mp4))(?:\?[^"']*)?["']/g)) {
        const url = new URL(asset, base + path);
        if (url.origin === base) assert.equal((await fetch(url, { method: 'HEAD' })).status, 200, `${path}: ${asset}`);
      }
    }
    console.log(`Verified ${new Set(routes).size} sitemap pages and local linked assets`);
    const created = await request('/tables/site_content', 'POST', { key: 'local.test', type: 'text', value: '저장 확인' });
    assert.equal(created.status, 201);
    const row = await created.json();
    assert.equal((await request('/tables/site_content', 'POST', { key: 'local.test' })).status, 409);
    assert.equal((await request(`/tables/site_content/${row.id}`, 'PUT', { value: '수정 확인' })).status, 200);
    assert.equal((await (await fetch(base + '/tables/site_content?search=local.test&limit=1&page=1')).json()).total, 1);
    const upload = () => fetch(base + '/files/cms-images', { method: 'POST', headers: { 'Content-Type': 'image/png', 'X-File-Name': 'test.png', 'Idempotency-Key': 'test-upload' }, body: Buffer.from('test-upload-bytes') });
    const file = await (await upload()).json();
    assert.equal((await (await upload()).json()).reference, file.reference);
    assert.equal(await (await fetch(base + file.reference)).text(), 'test-upload-bytes');
    const range = await fetch(base + '/images/kinoya-7000-open.mp4', { headers: { Range: 'bytes=0-99' } });
    assert.equal(range.status, 206);
    assert.equal((await range.arrayBuffer()).byteLength, 100);
    assert.equal((await fetch(base + '/.local/kinoya.sqlite')).status, 403);
    assert.equal((await fetch(base + '/server.mjs')).status, 403);
    assert.equal((await fetch(base + '/tables/unknown')).status, 404);
    assert.equal((await request('/tables/site_content/missing', 'PATCH', { value: 'bad' })).status, 404);
    assert.equal((await fetch(base + '/tables/site_content', { method: 'POST', headers: { Origin: 'https://example.com' }, body: '{}' })).status, 403);
    assert.equal((await fetch(base + '/tables/site_content', { method: 'POST', body: '{' })).status, 400);
    await stop();
    base = await start();
    assert.equal((await (await fetch(base + `/tables/site_content/${row.id}`)).json()).value, '수정 확인');
    assert.equal(await (await fetch(base + file.reference)).text(), 'test-upload-bytes');
    assert.equal((await request(`/tables/site_content/${row.id}`, 'DELETE')).status, 200);
    assert.equal((await request(file.reference, 'DELETE')).status, 200);
    assert.equal((await fetch(base + file.reference)).status, 404);
    console.log('CMS CRUD, duplicate protection, upload idempotency, restart persistence, video ranges and private routes passed');
  } finally { await stop(); await rm(dir, { recursive: true, force: true }); }
});
