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
  const handler=await read('js/main.js');
  assert.match(handler,/https:\/\/formsubmit\.co\/ajax\/delhi1984%40naver\.com/);
  for(const path of ['contact/index.html','en/contact/index.html','ja/contact/index.html']){
    const inquiry=await read(path);
    assert.match(inquiry,/<form[^>]+method="post"[^>]+inert/);
    assert.match(inquiry,/<button type="submit" class="form-submit" disabled/);
    assert.match(inquiry,/href="tel:15518748"/);
    assert.doesNotMatch(inquiry,/data-notify-email/);
  }
  assert.match(contact,/name="consent" required/);
  const robots=await read('robots.txt');
  assert.match(robots,/Disallow: \/admin\//);
  const guide=await read('guide/index.html');
  assert.match(guide,/@type":"FAQPage"/);
  assert.equal([...guide.matchAll(/class="answer-text"/g)].length,8);
});

const assertConsultationModes = async (handler, assert) => {
  const accepted = { success: true, message: 'The form was submitted successfully.' };
  const table = [
    ['native acceptance', 'native', accepted, true],
    ['string acceptance', 'native', { ...accepted, success: 'true' }, true],
    ['activation pending', 'native', { success: false, message: 'Activate your form' }, false],
    ['false string', 'native', { ...accepted, success: 'false' }, false],
    ['ambiguous activation', 'native', { ...accepted, message: 'Check activation email' }, false],
    ['unknown JSON', 'native', { status: 'ok' }, false],
    ['non-JSON', 'native', 'malformed', false],
    ['HTTP 403', 'native', '403', false],
    ['network rejection', 'native', 'network', false],
    ['blank field', 'native', accepted, false],
    ['no consent', 'native', accepted, false],
    ['controller timeout', 'controller', 'timeout', false],
    ['API absent', 'absent', accepted, true],
    ['sync fetch failure', 'absent', 'sync', false],
    ['sync timeout creation failure', 'throw-timeout', accepted, false],
    ['native timeout rejection', 'native', 'timeout', false],
    ['controller acceptance cleanup', 'controller', accepted, true],
    ['API absent network rejection', 'absent', 'network', false]
  ];
  for (const [label, api, outcome, delivered] of table) {
    let submit, success = false, reset = false, timer, cleared = false, abort;
    const calls = [], alerts = [];
    const button = { textContent:'submit', disabled:true };
    const values = { name:{ value:label === 'blank field' ? '' : 'Synthetic QA' }, phone:{ value:'000' },
      consent:{ checked:label !== 'no consent' }, region:{value:''}, message:{value:''}, startup_type:null };
    const form = { inert:true, dataset:{}, style:{}, reset(){reset=true;},
      querySelector(selector){return selector === '.form-submit' ? button : values[selector.match(/name="([^"]+)/)[1]];},
      addEventListener(event, listener){submit=listener;} };
    const w = {
      location:{pathname:'/contact/'},
      get localStorage(){throw Error('Unexpected browser storage');},
      fetch(url, options) {
        calls.push({url, options});
        if(outcome === 'sync') throw Error('Synchronous fetch failure');
        if(outcome === 'network') return Promise.reject(Error('Network rejection'));
        if(outcome === 'timeout') return new Promise((resolve,reject) => {
          abort = () => reject(Error('Timed out'));
        });
        return Promise.resolve({ok: outcome !== '403', async json(){
          if(outcome === 'malformed') throw Error('Invalid JSON');
          return outcome;
        }});
      }
    };
    if(api === 'native' || api === 'throw-timeout') w.AbortSignal={timeout(ms){
      assert.equal(ms,15000);if(api === 'throw-timeout') throw Error('timeout creation failed');
      return { kind:'native' };
    }};
    if(api === 'controller') {
      w.AbortSignal={};
      w.AbortController=class {constructor(){this.signal={kind:'controller'};} abort(){abort();}};
      w.setTimeout=(callback,ms)=>{assert.equal(ms,15000);timer=callback;return 0;};
      w.clearTimeout=id=>{assert.equal(id,0);cleared=true;};
    }
    handler({documentElement:{lang:'ko'},getElementById(id){
      return id === 'consult-form' ? form : {classList:{add(){success=true;}}};
    }},w,value=>alerts.push(value));
    submit({preventDefault(){}}); submit({preventDefault(){}});
    for(let i=0;i<12;i++) await Promise.resolve();
    if(outcome === 'timeout') api === 'controller' ? timer() : abort();
    for(let i=0;i<20;i++) await Promise.resolve();
    const skip = ['blank field','no consent','sync timeout creation failure'].includes(label);
    assert.equal(calls.length,skip ? 0 : 1,label+' fetch count');
    if(!skip) {
      assert.equal(calls[0].url,'https://formsubmit.co/ajax/delhi1984%40naver.com',label+' recipient');
      assert.equal(calls[0].options.redirect,'error',label+' no redirects');
      assert.equal(calls[0].options.signal?.kind,api === 'absent' ? undefined : api,label+' timeout mechanism');
    }
    assert.equal(success,delivered,label+' success');
    assert.equal(reset,delivered,label+' reset');
    assert.equal(alerts.length > 0,!delivered,label+' alert');
    assert.equal(button.disabled,false,label+' button restored');
    assert.equal(button.textContent,'submit',label+' button label restored');
    assert.equal(cleared,api === 'controller',label+' timer cleared');
  }
};

test('Public inquiry delivery fails closed and restores controls on unsupported timeout APIs', async()=>{
  const js=await read('js/main.js');
  const start=js.indexOf('  var CONSULT_EMAIL_ENDPOINT');
  const end=js.indexOf('  /* ---------- Store slider',start);
  assert.ok(start>=0 && end>start);
  const handler=new Function('document','window','alert',js.slice(start,end));
  await assertConsultationModes(handler, assert);
});
