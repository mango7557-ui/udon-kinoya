import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');

test('Every sitemap page preserves its static search contract',async()=>{
  const sitemap=await read('sitemap.xml');
  const pages=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]));
  assert.ok(pages.length>=51);
  for(const url of pages){
    const path=url.pathname.slice(1)+(url.pathname.endsWith('/')?'index.html':'');
    const html=await read(path);
    assert.match(html,/<title>[^<]+<\/title>/i,path+' title');
    assert.match(html,/<meta\s+name="description"\s+content="[^"]+"/i,path+' description');
    assert.ok(html.includes('href="'+url.href+'"'),path+' canonical destination');
    assert.equal([...html.matchAll(/<h1(?:\s|>)/gi)].length,1,path+' one H1');
    assert.match(html,/<main(?:\s|>)/i,path+' static main');
    for(const match of html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)){
      assert.doesNotThrow(()=>JSON.parse(match[1]),path+' valid JSON-LD');
    }
  }
});

test('Administrator-first inquiry intake covers standalone and embedded contact',async()=>{
  const home=await read('index.html'),compose=await read('js/home-full.js'),runtime=await read('js/home-runtime.js');
  assert.match(home,/data-cms="home.hero.headline"/);
  assert.doesNotMatch(home,/<video class="hero-video"[^>]*poster=/);
  assert.match(home,/js\/inquiry-public\.mjs/);
  assert.match(compose,/id:'final',path:'contact\/'/);
  assert.match(runtime,/window\.homeContentReady/);
  const bind=await read('js/inquiry-public.mjs'),main=await read('js/main.js');
  assert.match(bind,/await Promise\.resolve\(window\.homeContentReady\)/);
  assert.match(bind,/source:form\.dataset\.inquirySource/);
  assert.doesNotMatch(main,/CONSULT_EMAIL_ENDPOINT|formsubmit\.co\/ajax/);
  for(const route of ['contact/','en/contact/','ja/contact/']){
    const hp=await read(route+'index.html');
    assert.equal([...hp.matchAll(/<form\b/g)].length,1);
    assert.ok(hp.includes('data-inquiry-source="/'+route+'"'));
    if(route==='contact/') assert.match(hp,/id="partner-contact"/);
    assert.match(hp,/<form[^>]+method="post"[^>]+inert/);
    assert.match(hp,/<button type="submit" class="form-submit" disabled/);
    assert.match(hp,/name="website"/);
    assert.match(hp,/name="consent" required/);
    assert.match(hp,/href="tel:15518748"/);
    assert.doesNotMatch(hp,/data-notify-email|formsubmit\.co/);
  }
  const admin=await read('admin/index.html'),auth=await read('admin/auth.js');
  assert.match(admin,/id="new-inquiries-section"/);assert.match(admin,/id="consultations-section"/);
  assert.match(admin,/inquiry-admin\.mjs/);assert.match(auth,/state\.subscribe/);
  assert.match(await read('robots.txt'),/Disallow: \/admin\//);
  const guide=await read('guide/index.html');assert.match(guide,/@type":"FAQPage"/);
  assert.equal([...guide.matchAll(/class="answer-text"/g)].length,8);
});
