import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const json = (data, status = 200) => new Response(JSON.stringify(data), {status});
const payload = {id:'test-id',created_at:1795161600000,name:'테스트',phone:'010-0000-0000',region:'테스트',startup_type:'기타',message:'테스트',consent:true,source_page:'/',status:'new'};
const fields = data => Object.fromEntries(Object.entries(data).map(([key,value])=>[key,typeof value==='number'?{integerValue:String(value)}:typeof value==='boolean'?{booleanValue:value}:{stringValue:value}]));
const doc = (id, collection='kinoya_consultations') => ({name:`projects/test/databases/(default)/documents/${collection}/kinoya__consultations__${id}`,fields:fields({...payload,id,__kinoya_table:'consultations',__kinoya_ns:'kinoya',__kinoya_kind:'record'})});

function bridge(fetch, admin=false) {
  const location = {href:'https://example.com/',origin:'https://example.com',hostname:'example.com',pathname:'/'};
  const writes = [];
  const window = {fetch,FIREBASE_CONFIG:{projectId:'test',apiKey:'test',namespace:'kinoya'}};
  if(admin) window.KinoyaAdminAuth={ready:Promise.resolve(),user:{email:'admin'},token:async()=>'admin-token'};
  vm.runInNewContext(read('js/firebase-bridge.js'),{window,location,document:{baseURI:location.href,readyState:'loading',addEventListener(){}},localStorage:{getItem(){return null;},setItem(...args){writes.push(args);}},URL,URLSearchParams,Request,Response,Headers,crypto:webcrypto,atob,btoa,console,setTimeout(){}});
  return {fetch:window.fetch,writes};
}

test('public consultation saves to a private collection and retries the same document',async()=>{
  const calls=[];
  const app=bridge(async(url,options)=>{calls.push({url,options});return json({fields:JSON.parse(options.body).fields});});
  for(let i=0;i<2;i++) assert.ok((await app.fetch('/tables/consultations',{method:'POST',body:JSON.stringify(payload)})).ok);
  assert.match(calls[0].url,/\/kinoya_consultations\/kinoya__consultations__test-id\?/);
  assert.equal(calls[0].options.body,calls[1].options.body);
  assert.equal(app.writes.length,0);
});

test('denied or offline storage never reports local-only consultation success',async()=>{
  for(const failure of [async()=>json({},403),async()=>{throw new Error('offline');}]) {
    const app=bridge(failure);
    assert.equal((await app.fetch('/tables/consultations',{method:'POST',body:JSON.stringify(payload)})).status,503);
    assert.equal((await app.fetch('/tables/consultations')).status,503);
    assert.equal(app.writes.length,0);
  }
});

test('administrator inbox combines paginated new submissions and legacy records',async()=>{
  const calls=[];
  const app=bridge(async(url,options)=>{
    calls.push(url);
    assert.equal(options.headers.get('Authorization'),'Bearer admin-token');
    if(url.includes('/site_config?')) return json({documents:[doc('legacy','site_config'),doc('new','site_config')]});
    return url.includes('pageToken=next') ? json({documents:[doc('newer')]}) : json({documents:[doc('new')],nextPageToken:'next'});
  },true);
  const result=await (await app.fetch('/tables/consultations?limit=100')).json();
  assert.deepEqual(result.data.map(row=>row.id).sort(),['legacy','new','newer']);
  assert.equal(calls.length,3);
});

test('administrator can update and delete legacy consultation records',async()=>{
  for(const method of ['PATCH','DELETE']) {
    const calls=[];
    const app=bridge(async(url,options)=>{
      calls.push({url,options});
      if(url.includes('/kinoya_consultations/')) return json({},404);
      if(options.method==='PATCH') return json({fields:JSON.parse(options.body).fields});
      return json(doc('legacy','site_config'));
    },true);
    assert.ok((await app.fetch('/tables/consultations/legacy',{method,body:JSON.stringify({status:'done'})})).ok);
    assert.match(calls.at(-1).url,/\/site_config\/kinoya__consultations__legacy\?/);
    assert.equal(calls.at(-1).options.method,method);
  }
});

function formHarness() {
  let submit, resolveSave;
  const saves=[],emails=[],alerts=[],events=[];
  const button={textContent:'신청하기',disabled:false};
  const inputs={'.form-submit':button,'[name="consent"]':{checked:true},'[name="startup_type"]:checked':{value:'기타'}};
  for(const name of ['name','phone','region','message']) inputs[`[name="${name}"]`]={value:payload[name]};
  const form={dataset:{},style:{},getAttribute:()=>'',querySelector:selector=>inputs[selector],addEventListener:(event,handler)=>{submit=handler;}};
  const success={visible:false,classList:{add(){success.visible=true;}}};
  const window={location:{pathname:'/'},dataLayer:{push:event=>events.push(event)},fetch:async(url,options)=>{emails.push({url,options});return json({});}};
  const source=read('js/main.js');
  vm.runInNewContext(source.slice(source.indexOf('  var DEFAULT_CONSULT_EMAIL'),source.indexOf('  /* ---------- Store slider')),{window,document:{getElementById:id=>id==='consult-form'?form:success},crypto:webcrypto,alert:message=>alerts.push(message),fetch:async(url,options)=>{
    if(url.includes('site_content')) return json({data:[{key:'contact.notify.email',value:'delhi1984@naver.com'}]});
    saves.push(JSON.parse(options.body));
    return new Promise(resolve=>{resolveSave=resolve;});
  }});
  return {submit:()=>submit({preventDefault(){}}),finish:async(status)=>{resolveSave(json({},status));for(let i=0;i<20;i++)await new Promise(resolve=>setImmediate(resolve));},form,success,button,saves,emails,alerts,events};
}

test('failed submission stays visible with no notification; retry keeps its identifier',async()=>{
  const app=formHarness();
  app.submit();app.submit();
  assert.equal(app.saves.length,1,'duplicate click ignored');
  await app.finish(503);
  assert.equal(app.success.visible,false);
  assert.notEqual(app.form.style.display,'none');
  assert.equal(app.alerts.length,1);
  assert.equal(app.emails.length,0);
  assert.equal(app.button.disabled,false);
  app.submit();
  assert.deepEqual(app.saves[0],app.saves[1]);
  await app.finish(201);
  assert.equal(app.success.visible,true);
  assert.equal(app.form.style.display,'none');
  assert.equal(app.emails.length,1);
  assert.equal(app.emails[0].url,'https://formsubmit.co/ajax/delhi1984%40naver.com');
  assert.equal(app.events.length,1);
});
