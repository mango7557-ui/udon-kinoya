import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createHmac} from 'node:crypto';
import {createIntake, firestoreInquiryRepository, leadCollection,limitCollection,outboxCollection,
  requireInquiryAdmin,processInquiryOutbox,createInquiryHttp,createSmtpAdapter} from './core.mjs';

const ids=['b4b2e307-dcd1-4032-846c-8f64a900004f','20d8c016-29b5-459a-b85d-6bdd925900a2'];
const lead={id:ids[0],name:'Synthetic QA',phone:'010-0000-0000',category:'partner',
  region:'QA',message:'Test message only',source:'/contact/',consent:true,website:''};
const now=()=>1700000000000;
function fixture(limit=3) {
  const data=new Map();
  let serialize=Promise.resolve();
  const snapshot=id=>({exists:data.has(id),data:()=>data.get(id)});
  const db={
    collection:name=>({doc:id=>name+'/'+id}),
    runTransaction(fn){
      const awaited=serialize.then(async()=>{
        const writes=new Map(),tx={
          get:async id=>snapshot(id),
          set:(id,d)=>writes.set(id,d),
          update:(id,p)=>writes.set(id,{...data.get(id),...p}),
          create:(id,d)=>{if(data.has(id)||writes.has(id))throw Error('duplicate create');writes.set(id,d);}
        };
        const result=await fn(tx);
        for(const [k,v] of writes) data.set(k,v);
        return result;
      });
      serialize=awaited.catch(()=>{});
      return awaited;
    }
  };
  const repository=firestoreInquiryRepository(db);
  const intake=createIntake({repository,now,phoneLimit:limit,consentVersion:'synthetic-v1',
    keyedHash:s=>createHmac('sha256','local-test-only').update(s).digest('hex')});
  return {data,intake,repository};
}
const rejects=(p,status)=>assert.rejects(p,e=>e.status===status);

test('a durable receipt, deduplication and notification all commit exactly once',async()=>{
  const f=fixture();
  const [a,b]=await Promise.all([f.intake(lead),f.intake(lead)]);
  assert.deepEqual(a,b);
  assert.deepEqual(await f.intake({...lead,phone:'+82 10-0000-0000'}),a);
  assert.equal(f.data.get(leadCollection+'/'+lead.id).name,lead.name);
  assert.equal(f.data.get(outboxCollection+'/'+lead.id).status,'pending');
  assert.equal(f.data.get(outboxCollection+'/'+lead.id).message,undefined);
  assert.equal([...f.data].filter(([k])=>k.startsWith(limitCollection+'/')).every(([,v])=>v.count===1),true);
  await rejects(f.intake({...lead,message:'different'}),409);
});
test('invalid input and rate limit cannot create a lead or notification',async()=>{
  const f=fixture(1);
  for(const patch of [{consent:false},{website:'bot'},{phone:'bad'},{to:'unexpected@example.invalid'},{category:'arbitrary'},{message:'x'.repeat(2001)}]) await rejects(f.intake({...lead,...patch}),400);
  assert.equal(f.data.size,0);
  await f.intake(lead);
  await rejects(f.intake({...lead,id:ids[1]}),429);
  assert.equal(f.data.has(leadCollection+'/'+ids[1]),false);
  assert.equal(f.data.has(outboxCollection+'/'+ids[1]),false);
});
test('database outage cannot produce a receipt',async()=>{
  const intake=createIntake({repository:{accept:async()=>{throw Error('database down');}},keyedHash:()=> 'a'.repeat(64),now,consentVersion:'test'});
  await assert.rejects(intake(lead),/database down/);
});
test('admin authentication checks revocation and requires the explicit claim',async()=>{
  await rejects(requireInquiryAdmin(null,()=>{}),401);
  await rejects(requireInquiryAdmin('Bearer token',async()=>({uid:'member'})),403);
  assert.equal(await requireInquiryAdmin('Bearer token',async(token,revoked)=>{assert.equal(token,'token');assert.equal(revoked,true);return {uid:'staff',kinoyaInquiryAdmin:true};}),'staff');
});
test('email is only to the pinned recipient, redacts dedicated identifiers and claims once',async()=>{
  const f=fixture(), recipient='qa@example.invalid';
  await f.intake(lead);
  const calls=[];
  const mailAdapter={send:async x=>{calls.push(x);return {accepted:true,providerId:'stub-ref'};}};
  const args={id:lead.id,repository:f.repository,recipient,mailAdapter};
  const results=await Promise.all([processInquiryOutbox(args),processInquiryOutbox(args)]);
  assert.deepEqual(results.map(r=>r.status).sort(),['accepted','skipped']);
  assert.equal(calls.length,1);
  assert.equal(calls[0].to,recipient);
  assert.ok(calls[0].text.includes(lead.message));
  assert.ok(calls[0].text.includes(lead.id));
  assert.ok(!calls[0].text.includes(lead.phone));
  assert.ok(!calls[0].text.includes(lead.name));
  assert.equal(f.data.get(outboxCollection+'/'+lead.id).status,'accepted');
});
test('uncertain email acceptance never mutates intake or triggers blind repeat',async()=>{
  const f=fixture(), recipient='qa@example.invalid';
  await f.intake(lead);
  const args={id:lead.id,repository:f.repository,recipient,mailAdapter:{send:async()=>{throw Error('timeout');}}};
  assert.deepEqual(await processInquiryOutbox(args),{status:'uncertain'});
  assert.deepEqual(await processInquiryOutbox(args),{status:'skipped'});
  assert.equal(f.data.get(leadCollection+'/'+lead.id).status,'new');
});
test('HTTP responses fail closed; same origin + App Check + admin claim boundaries',async()=>{
  const host='https://www.udonkinoya.com', mk=(path,init)=>new Request(host+path,init);
  const f=fixture();
  const http=createInquiryHttp({intake:f.intake,repository:{list:async()=>({items:[]}),setStatus:f.repository.setStatus},
    allowedOrigins:[host],verifyAppCheck:async token=>token==='app',
    verifyIdToken:async token=>({uid:'staff',kinoyaInquiryAdmin:token==='admin'})});
  const post=(overrides={},body=JSON.stringify(lead))=>mk('/api/inquiries',{method:'POST',
    headers:{'Content-Type':'application/json',Origin:host,'X-Firebase-AppCheck':'app',...overrides},body});
  assert.equal((await http(post({Origin:'https://elsewhere.invalid'}))).status,403);
  assert.equal((await http(post({'X-Firebase-AppCheck':'invalid'}))).status,403);
  assert.equal((await http(post({},'x'.repeat(12001)))).status,413);
  const accepted=await http(post());
  assert.equal(accepted.status,202);assert.equal(accepted.headers.get('Cache-Control'),'no-store');
  assert.deepEqual(await accepted.json(),{receiptId:lead.id});
  assert.equal((await http(mk('/api/admin/inquiries'))).status,401);
  assert.equal((await http(mk('/api/admin/inquiries',{headers:{Authorization:'Bearer member'}}))).status,403);
  assert.equal((await http(mk('/api/admin/inquiries',{headers:{Authorization:'Bearer admin'}}))).status,200);
  const status=(expected)=>http(mk('/api/admin/inquiries',{method:'PATCH',headers:{Authorization:'Bearer admin',Origin:host,'Content-Type':'application/json'},body:JSON.stringify({id:lead.id,expected,status:'contacted'})}));
  assert.equal((await status('new')).status,200);assert.equal((await status('new')).status,409);
});

test('SMTP routes only to configured recipient and checks transport acceptance',async()=>{
  const recipient='qa@example.invalid', calls=[];
  const smtp=createSmtpAdapter({sender:'sender@example.invalid',recipient,
    transport:{sendMail:async m=>{calls.push(m);return {accepted:[recipient]};}}});
  const key='kinoya-inquiry:'+ids[0];
  await assert.rejects(smtp.send({to:'unapproved@example.invalid',subject:'subject',text:'stub',idempotencyKey:key}));
  assert.equal(calls.length,0);
  const out=await smtp.send({to:recipient,subject:'subject',text:'stub',idempotencyKey:key});
  assert.deepEqual(out,{accepted:true,providerId:'<kinoya-inquiry.'+ids[0]+'@example.invalid>'});
  assert.equal(calls[0].disableFileAccess,true);assert.equal(calls[0].disableUrlAccess,true);
});

import {createInquirySubmitter,createInquiryAdminClient,mountInquiryAdminViewer} from './browser.mjs';
test('the browser reuses one receipt ID after ambiguous failure without saving locally',async()=>{
  const seen=[];
  const submit=createInquirySubmitter({source:'/contact/',getAppCheckToken:async()=> 'stub',makeId:()=>ids[0],
    fetcher:async (path,options)=>{const x=JSON.parse(options.body);seen.push(x.id);
      assert.equal(path,'/api/inquiries');assert.equal(options.headers['X-Firebase-AppCheck'],'stub');
      if(seen.length===1)return new Response(JSON.stringify({receiptId:ids[1]}),{status:202});
      return new Response(JSON.stringify({receiptId:ids[0]}),{status:202});
    }});
  const f={...lead,category:'업무제휴'};
  assert.deepEqual(await submit(f),{state:'unavailable'});
  assert.deepEqual(await submit(f),{state:'accepted',receiptId:ids[0]});assert.deepEqual(seen,[ids[0],ids[0]]);
});
test('admin view uses text only and clears results on logout or server denial',async()=>{
  const output=[];
  function node(tag){return {tag,children:[],events:{},set textContent(v){output.push(v);this.text=v;},
    set innerHTML(v){assert.fail('innerHTML must not be set');},get childElementCount(){return this.children.length;},
    setAttribute(){},replaceChildren(...x){this.children=x;},append(...x){this.children.push(...x);},
    addEventListener(e,f){this.events[e]=f;}};}
  const document={createElement:node},root=node('main'),payload='<img src=x onerror=alert(1)>';
  let auth,allow=true;
  const request=createInquiryAdminClient({getIdToken:async()=> 'stub',fetcher:async(url,init)=>{
    assert.equal(url,'/api/admin/inquiries');assert.equal(init.headers.Authorization,'Bearer stub');
    return allow?new Response(JSON.stringify({items:[{...lead,message:payload,status:'new'}]})):new Response('{}',{status:403});}});
  mountInquiryAdminViewer({root,document,request,subscribeAuth(cb){auth=cb;return ()=>{};}});
  auth({});await new Promise(setImmediate);
  const rows=root.children.at(-1);assert.equal(rows.childElementCount,1);assert.ok(output.includes(payload));
  auth(null);assert.equal(rows.childElementCount,0);
  allow=false;auth({});await new Promise(setImmediate);
  assert.equal(rows.childElementCount,0);
});
