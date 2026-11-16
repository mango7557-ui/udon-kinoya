import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loader(rows, fetch = async () => { throw new Error('network unavailable'); }) {
  let onReady;
  const runtime = {all: async () => rows};
  const window = {KinoyaRuntimeReady: Promise.resolve(runtime), fetch};
  const document = {addEventListener: (_, callback) => {onReady = callback;}, getElementById: () => null, createElement: () => ({set innerHTML(value) { this.value = value; }})};
  const context = {window, document, URL, AbortController, setTimeout, clearTimeout, console, KinoyaCollections: {mount() {}}};
  vm.runInNewContext(readFileSync(new URL('../admin/news-manage.js', import.meta.url), 'utf8'), context);
  onReady();
  return window.KinoyaNewsAutoFetch;
}

test('uses the saved article when external providers fail', async () => {
  const url = 'https://example.com/news?id=123';
  const api = loader([{url, title:'기존 제목', date:'2026-01-20', source:'언론사', excerpt:'기존 요약', thumbnail:'https://example.com/a.jpg'}]);
  const result = await api.fetchNewsMetadata(url + '#article');
  assert.equal(result.title, '기존 제목');
  assert.equal(result.date, '2026-01-20');
  assert.equal(result.thumbnailUrl, 'https://example.com/a.jpg');
  assert.equal(result.fromSaved, true);
});

test('reports a failure for unknown articles without inventing metadata', async () => {
  const api = loader([]);
  await assert.rejects(api.fetchNewsMetadata('https://example.com/missing'), /기존 입력 내용은 유지/);
});

test('recovers title and publication date from the reader when proxies fail', async () => {
  const api = loader([], async url => {
    if (url.startsWith('https://r.jina.ai/')) return {ok:true, text:async () => 'Title: 새 기사 제목\nPublished Time: 2026-01-20T09:07:02+09:00\n'};
    throw new Error('blocked');
  });
  const result = await api.fetchNewsMetadata('https://www.edaily.co.kr/news/123');
  assert.equal(result.title, '새 기사 제목');
  assert.equal(result.date, '2026-01-20');
  assert.equal(result.source, '이데일리');
  assert.equal(result.excerpt, '');
});
