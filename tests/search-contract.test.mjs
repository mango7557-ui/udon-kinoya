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

test('Redesign preserves public CMS contracts and unified contact anchors',async()=>{
  const home=await read('index.html'),contact=await read('contact/index.html');
  assert.match(home,/data-cms="home.hero.headline"/);
  assert.doesNotMatch(home,/<video class="hero-video"[^>]*poster=/);
  assert.equal([...contact.matchAll(/<form\b/g)].length,1);
  assert.match(contact,/id="partner-contact"/);
  assert.match(contact,/id="consult-form"/);
  assert.match(contact,/data-notify-email="udonkinoya@daum.net"/);
  assert.match(contact,/name="consent" required/);
  const robots=await read('robots.txt');
  assert.match(robots,/Disallow: \/admin\//);
  const guide=await read('guide/index.html');
  assert.match(guide,/@type":"FAQPage"/);
  assert.equal([...guide.matchAll(/class="answer-text"/g)].length,8);
});
