import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { mkdir, stat, writeFile, unlink } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const root = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(process.env.KINOYA_DATA_DIR || resolve(root, '.local'));
await mkdir(resolve(dataDir, 'files'), { recursive: true });
const db = new DatabaseSync(resolve(dataDir, 'kinoya.sqlite'));
db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS records (table_name TEXT, id TEXT, body TEXT NOT NULL, PRIMARY KEY(table_name,id)); CREATE TABLE IF NOT EXISTS uploads (key TEXT PRIMARY KEY, reference TEXT NOT NULL);');
const tables = new Set(['site_content', 'consultations', 'youtube_videos', 'partner_logos', 'faq_items', 'news_items', 'resources', 'store_items', 'visitor_logs']);
const collections = new Set(['cms-images', 'cms-videos', 'resources']);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.ico': 'image/x-icon' };
function fail(status, message) { throw Object.assign(new Error(message), { status }); }
function json(res, status, value) { res.writeHead(status, { 'Content-Type': mime['.json'], 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); }
async function body(req, max) {
  const chunks = []; let size = 0;
  for await (const chunk of req) { size += chunk.length; if (size > max) fail(413, 'Request too large'); chunks.push(chunk); }
  return Buffer.concat(chunks);
}
function save(table, row) { db.prepare('INSERT OR REPLACE INTO records VALUES (?,?,?)').run(table, row.id, JSON.stringify(row)); return row; }
async function tableAPI(req, res, url, parts) {
  const [, table, id, extra] = parts;
  if (!tables.has(table) || extra || parts.length > 3) fail(404, 'Unknown table');
  const existing = id ? db.prepare('SELECT body FROM records WHERE table_name=? AND id=?').get(table, id) : null;
  if (req.method === 'GET' || req.method === 'HEAD') {
    if (id) { if (!existing) fail(404, 'Record not found'); return json(res, 200, JSON.parse(existing.body)); }
    let rows = db.prepare('SELECT body FROM records WHERE table_name=? ORDER BY rowid').all(table).map(r => JSON.parse(r.body));
    const search = url.searchParams.get('search')?.toLowerCase();
    if (search) rows = rows.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(search)));
    const page = Math.max(1, Number.parseInt(url.searchParams.get('page'), 10) || 1);
    const limit = Math.max(1, Math.min(1000, Number.parseInt(url.searchParams.get('limit'), 10) || 100));
    return json(res, 200, { data: rows.slice((page - 1) * limit, page * limit), total: rows.length, page, limit });
  }
  if (req.method === 'DELETE') {
    if (!existing) fail(404, 'Record not found');
    db.prepare('DELETE FROM records WHERE table_name=? AND id=?').run(table, id);
    return json(res, 200, { id, deleted: true });
  }
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) fail(405, 'Method not allowed');
  if (req.method === 'POST' ? !!id : !id) fail(405, 'Invalid record route');
  let input;
  try { input = JSON.parse((await body(req, 2 * 1024 * 1024)).toString()); } catch (error) { if (error.status) throw error; fail(400, 'Invalid JSON'); }
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail(400, 'Expected an object');
  if (req.method !== 'POST' && !existing) fail(404, 'Record not found');
  const previous = existing ? JSON.parse(existing.body) : {};
  const row = { ...previous, ...input, id: id || input.id || randomUUID(), created_at: previous.created_at || input.created_at || Date.now(), updated_at: Date.now() };
  if (typeof row.id !== 'string' || !row.id || row.id.includes('/')) fail(400, 'Invalid id');
  if (req.method === 'POST' && db.prepare('SELECT 1 FROM records WHERE table_name=? AND id=?').get(table, row.id)) fail(409, 'Duplicate id');
  if (table === 'site_content' && db.prepare('SELECT body FROM records WHERE table_name=? AND id<>?').all(table, row.id).some(r => JSON.parse(r.body).key === row.key)) fail(409, 'Duplicate content key');
  return json(res, req.method === 'POST' ? 201 : 200, save(table, row));
}
async function staticFile(req, res, path) {
  let info;
  try { info = await stat(path); } catch { fail(404, 'File not found'); }
  if (info.isDirectory()) {
    if (!new URL(req.url, 'http://localhost').pathname.endsWith('/')) { res.writeHead(301, { Location: new URL(req.url, 'http://localhost').pathname + '/' + new URL(req.url, 'http://localhost').search }); return res.end(); }
    path = resolve(path, 'index.html');
    try { info = await stat(path); } catch { fail(404, 'File not found'); }
  }
  if (!info.isFile()) fail(404, 'File not found');
  let start = 0, end = info.size - 1, status = 200;
  const headers = { 'Content-Type': mime[extname(path).toLowerCase()] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' };
  if (req.headers.range) {
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!range || (!range[1] && !range[2])) fail(416, 'Invalid range');
    start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
    end = range[1] && range[2] ? Math.min(Number(range[2]), end) : end;
    if (start > end || start >= info.size) { res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }); return res.end(); }
    status = 206; headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
  }
  headers['Content-Length'] = Math.max(0, end - start + 1);
  res.writeHead(status, headers);
  if (req.method === 'HEAD' || !info.size) return res.end();
  const stream = createReadStream(path, { start, end });
  stream.on('error', () => res.destroy());
  res.on('close', () => stream.destroy());
  stream.pipe(res);
}
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    // This local server accepts browser writes only from its own origin.
    if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) fail(403, 'Cross-origin request denied');
    const parts = decodeURIComponent(url.pathname).split('/').filter(Boolean);
    if (parts.some(p => p === '..' || p.startsWith('.') || p.includes('\\') || p.includes('\0'))) fail(403, 'Private path');
    if (parts[0] === 'tables') return await tableAPI(req, res, url, parts);
    if (parts[0] === 'files') {
      const [, collection, name] = parts;
      if (!collections.has(collection) || parts.length > 3) fail(404, 'Unknown file collection');
      if (req.method === 'POST' && !name) {
        const key = `${collection}:${req.headers['idempotency-key'] || randomUUID()}`;
        const old = db.prepare('SELECT reference FROM uploads WHERE key=?').get(key);
        if (old) return json(res, 200, old);
        const bytes = await body(req, 10 * 1024 * 1024);
        const original = decodeURIComponent(req.headers['x-file-name'] || 'file');
        const extension = extname(original).toLowerCase();
        if (!['.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4', '.webm', '.pdf', '.xlsx', '.xls', '.docx', '.pptx', '.zip'].includes(extension)) fail(400, 'Unsupported file type');
        const filename = randomUUID() + extension;
        await mkdir(resolve(dataDir, 'files', collection), { recursive: true });
        await writeFile(resolve(dataDir, 'files', collection, filename), bytes);
        const reference = `/files/${collection}/${filename}`;
        db.prepare('INSERT INTO uploads VALUES (?,?)').run(key, reference);
        return json(res, 201, { reference });
      }
      if (!name) fail(404, 'File not found');
      const file = resolve(dataDir, 'files', collection, name);
      if (req.method === 'DELETE') {
        try { await unlink(file); } catch (e) { if (e.code !== 'ENOENT') throw e; }
        db.prepare('DELETE FROM uploads WHERE reference=?').run(`/files/${collection}/${name}`);
        return json(res, 200, { deleted: true });
      }
      if (!['GET', 'HEAD'].includes(req.method)) fail(405, 'Method not allowed');
      return await staticFile(req, res, file);
    }
    if (!['GET', 'HEAD'].includes(req.method)) fail(405, 'Method not allowed');
    if (parts.some(p => ['server.mjs', 'package.json', 'package-lock.json', 'node_modules', 'start.cmd'].includes(p))) fail(403, 'Private path');
    const file = resolve(root, ...parts);
    if (file !== root && !file.startsWith(root + sep)) fail(403, 'Private path');
    await staticFile(req, res, file);
  } catch (error) {
    if (res.headersSent) return res.destroy();
    json(res, error.status || 500, { error: error.status ? error.message : 'Internal server error' });
    if (!error.status) console.error(error);
  }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? 'Port is already in use. Set PORT to another number and restart.' : error);
  db.close();
  process.exit(1);
});
server.listen(Number(process.env.PORT || 3080), '127.0.0.1', () => {
  console.log(`Kinoya ready: http://localhost:${server.address().port}`);
  console.log(`Admin: http://localhost:${server.address().port}/admin/`);
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { db.close(); process.exit(0); }));
