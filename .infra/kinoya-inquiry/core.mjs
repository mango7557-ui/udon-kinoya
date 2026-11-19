/* Server-side only. Do not serve this directory through Firebase Hosting. */
export const leadCollection = 'private_udon_inquiry_v1';
export const limitCollection = 'private_udon_inquiry_limits_v1';
export const outboxCollection = 'private_udon_inquiry_outbox_v1';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const statuses = new Set(['new','contacted','closed']);
const categories = new Set(['new','conversion','existing','undecided','partner','feedback','other']);
const pages = new Set(['/contact/','/en/contact/','/ja/contact/']);
export class RequestError extends Error {
  constructor(status,key){super(key);this.status=status;this.key=key;}
}
const bad = () => new RequestError(400,'invalid_request');
const str = (v,max,required=false)=>{
  if(typeof v!=='string' || v.length>max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(v)) throw bad();
  const s=v.trim().normalize('NFC');
  if(s.length>max || (required&&!s)) throw bad();
  return s;
};
const ref = v=> { if(typeof v!=='string'||!uuid.test(v)) throw bad(); return v; };
export function normalizeInquiry(input) {
  if(!input || typeof input!=='object' || Array.isArray(input)) throw bad();
  const known = new Set(['id','name','phone','category','region','message','source','consent','website']);
  if(Object.keys(input).some(k=>!known.has(k)) || input.website!=='' || input.consent!==true || !categories.has(input.category) || !pages.has(input.source)) throw bad();
  const rawPhone=str(input.phone,30,true);
  if(!/^\+?[0-9 ()-]+$/.test(rawPhone)) throw bad();
  const phone=rawPhone.replace(/\D/g,'').replace(/^82(?=10\d{8}$)/,'010');
  if(!/^\d{8,15}$/.test(phone)) throw bad();
  return {id:ref(input.id),name:str(input.name,60,true),phone,category:input.category,
    region:str(input.region??'',100),message:str(input.message??'',2000),source:input.source,consent:true};
}
function interval(now,minutes){const ms=minutes*60_000;return Math.floor(now/ms);}
export function createIntake({repository,keyedHash,now=Date.now,phoneLimit=3,globalLimit=120,consentVersion}) {
  if(typeof keyedHash!=='function'||!consentVersion) throw new Error('Missing server configuration');
  return async input=>{
    const lead=normalizeInquiry(input);
    const stamp=now(), fingerprint=await keyedHash('dedupe:'+JSON.stringify(lead));
    const phoneKey=await keyedHash('phone:'+lead.phone);
    if(!/^[a-f0-9]{64}$/.test(fingerprint)||!/^[a-f0-9]{64}$/.test(phoneKey)) throw new Error('Invalid digest');
    const limits=[
      {id:'phone-'+interval(stamp,15)+'-'+phoneKey,max:phoneLimit,expiresAt:new Date(stamp+2*60*60_000)},
      {id:'global-'+interval(stamp,1),max:globalLimit,expiresAt:new Date(stamp+2*60*60_000)}
    ];
    const createdAt=new Date(stamp);
    const result=await repository.accept({lead:{...lead,status:'new',createdAt,consentVersion,fingerprint},
      limits,
      notification:{id:lead.id,status:'pending',createdAt}});
    if(result!=='created' && result!=='duplicate') throw new Error('Unconfirmed database commit');
    return {receiptId:lead.id};
  };
}
export function firestoreInquiryRepository(db) {
  const leads=db.collection(leadCollection), limits=db.collection(limitCollection), outbox=db.collection(outboxCollection);
  return {
    accept({lead,limits:policies,notification}) {
      return db.runTransaction(async tx=>{
        const leadRef=leads.doc(lead.id);
        const old=await tx.get(leadRef);
        if(old.exists){
          if(old.data().fingerprint!==lead.fingerprint) throw new RequestError(409,'idempotency_conflict');
          return 'duplicate';
        }
        const counters=await Promise.all(policies.map(p=>tx.get(limits.doc(p.id))));
        for(let i=0;i<policies.length;i++) if((counters[i].data()?.count??0)>=policies[i].max) throw new RequestError(429,'rate_limited');
        for(let i=0;i<policies.length;i++){
          const p=policies[i];
          tx.set(limits.doc(p.id),{count:(counters[i].data()?.count??0)+1,expiresAt:p.expiresAt});
        }
        tx.create(leadRef,lead);
        tx.create(outbox.doc(notification.id),notification);
        return 'created';
      });
    },
    claimNotification(id, now=new Date()) {
      ref(id);
      return db.runTransaction(async tx=>{
        const job=outbox.doc(id), lead=leads.doc(id);
        const [state,record]=await Promise.all([tx.get(job),tx.get(lead)]);
        if(!state.exists||!record.exists||state.data().status!=='pending') return null;
        tx.update(job,{status:'sending',attemptedAt:now});
        return record.data();
      });
    },
    completeNotification(id, status, providerId) {
      ref(id);
      if(status!=='accepted'&&status!=='uncertain') throw bad();
      return db.runTransaction(async tx=>{
        const job=outbox.doc(id), old=await tx.get(job);
        if(!old.exists||old.data().status!=='sending') throw new Error('Notification state changed');
        tx.update(job,{status,finishedAt:new Date(),providerId:providerId??null});
      });
    },
    async list(cursor) {
      let q=leads.orderBy('createdAt','desc').limit(26);
      if(cursor){
        const after=await leads.doc(ref(cursor)).get();
        if(!after.exists) throw bad();
        q=q.startAfter(after);
      }
      const snap=await q.get();
      return {items:snap.docs.slice(0,25).map(d=>{
        const {id,name,phone,category,region,message,status,createdAt}=d.data();
        return {id,name,phone,category,region,message,status,createdAt:createdAt.toDate().toISOString()};
      }),nextCursor:snap.size>25?snap.docs[24].id:null};
    },
    setStatus(id,expected,status,by) {
      ref(id);
      if(!statuses.has(expected)||!statuses.has(status)) throw bad();
      return db.runTransaction(async tx=>{
        const d=leads.doc(id), old=await tx.get(d);
        if(!old.exists) throw new RequestError(404,'not_found');
        if(old.data().status!==expected) throw new RequestError(409,'stale_status');
        tx.update(d,{status,statusUpdatedAt:new Date(),statusUpdatedBy:by});
        return {id,status};
      });
    }
  };
}
export async function requireInquiryAdmin(authorization,verifyIdToken) {
  const token=typeof authorization==='string'&&authorization.match(/^Bearer ([A-Za-z0-9._-]{1,6000})$/)?.[1];
  if(!token) throw new RequestError(401,'authentication_required');
  let claims;
  try{claims=await verifyIdToken(token,true);}catch{throw new RequestError(401,'invalid_session');}
  if(!claims?.uid || claims.kinoyaInquiryAdmin!==true) throw new RequestError(403,'permission_required');
  return claims.uid;
}
export function makeInquiryNotification(lead,serverRecipient) {
  const recipient=str(serverRecipient,140,true);
  if(!/^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(recipient)) throw new Error('Invalid server notification recipient');
  const id=ref(lead.id), category=lead.category;
  if(!categories.has(category)) throw bad();
  return Object.freeze({to:recipient,subject:'우동키노야 문의 '+id,
    text:'접수번호: '+id+'\n문의 유형: '+category+'\n\n'+str(lead.message??'',2000)+'\n\n연락처는 관리자 화면에서 확인하세요.',
    idempotencyKey:'kinoya-inquiry:'+id});
}
/* The worker must supply a provider with durable, documented idempotency for this key. */
export async function deliverInquiryNotification({lead,recipient,mailAdapter}) {
  const result=await mailAdapter.send(makeInquiryNotification(lead,recipient));
  if(result?.accepted!==true||typeof result.providerId!=='string'||!result.providerId) throw new Error('Unconfirmed email provider acceptance');
  return {providerId:result.providerId};
}

/* Web-standard API adapter. A Firebase Functions wrapper supplies the raw body and verifier. */
export function createInquiryHttp({intake,repository,verifyIdToken,verifyAppCheck,allowedOrigins}) {
  if(typeof verifyAppCheck!=='function'||!Array.isArray(allowedOrigins)||!allowedOrigins.length)
    throw new Error('App Check verifier and approved site origins are required');
  const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers:{
    'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
    'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'
  }});
  const payload=async request=>{
    if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')??'')) throw new RequestError(415,'json_required');
    const body=request.body;
    if(!body) throw bad();
    const reader=body.getReader(), decoder=new TextDecoder('utf-8',{fatal:true});
    let bytes=0,s='';
    try{
      for(;;){
        const part=await reader.read();
        if(part.done) break;
        bytes+=part.value.byteLength;
        if(bytes>12_000){await reader.cancel();throw new RequestError(413,'request_too_large');}
        s+=decoder.decode(part.value,{stream:true});
      }
      return JSON.parse(s+decoder.decode());
    }catch(e){if(e instanceof RequestError) throw e;throw bad();}
  };
  return async request=>{
    try{
      const url=new URL(request.url), method=request.method;
      if(url.pathname==='/api/inquiries'){
        if(method!=='POST') throw new RequestError(405,'method_not_allowed');
        if(!allowedOrigins.includes(request.headers.get('origin'))) throw new RequestError(403,'origin_denied');
        const appToken=request.headers.get('x-firebase-appcheck');
        if(!appToken||appToken.length>6000) throw new RequestError(403,'app_check_required');
        try{if(!await verifyAppCheck(appToken)) throw Error();}catch{throw new RequestError(403,'invalid_app_check');}
        return reply(202,await intake(await payload(request)));
      }
      if(url.pathname==='/api/admin/inquiries'){
        if(method!=='GET'&&method!=='PATCH') throw new RequestError(405,'method_not_allowed');
        if(method==='PATCH'&&!allowedOrigins.includes(request.headers.get('origin'))) throw new RequestError(403,'origin_denied');
        const uid=await requireInquiryAdmin(request.headers.get('authorization'),verifyIdToken);
        if(method==='GET') return reply(200,await repository.list(url.searchParams.get('cursor')));
        const body=await payload(request);
        if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!['id','expected','status'].includes(k))) throw bad();
        return reply(200,await repository.setStatus(body.id,body.expected,body.status,uid));
      }
      throw new RequestError(404,'not_found');
    }catch(error){
      return error instanceof RequestError ? reply(error.status,{error:error.key}) : reply(503,{error:'temporarily_unavailable'});
    }
  };
}

/* Invoke from a trusted private worker, not from a public endpoint. Do not log lead or provider payload. */
export async function processInquiryOutbox({id,repository,recipient,mailAdapter}) {
  const lead=await repository.claimNotification(id);
  if(!lead) return {status:'skipped'};
  let result;
  try{result=await deliverInquiryNotification({lead,recipient,mailAdapter});}
  catch{
    // Do not blindly retry: a transport failure can occur after provider acceptance.
    await repository.completeNotification(id,'uncertain');
    return {status:'uncertain'};
  }
  await repository.completeNotification(id,'accepted',result.providerId);
  return {status:'accepted'};
}

export function createSmtpAdapter({transport,sender,recipient}) {
  if(typeof transport?.sendMail!=='function'||typeof sender!=='string'||
      !/^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(sender))
    throw new Error('Configure an authenticated SMTP transport and verified sender');
  if(typeof recipient!=='string'||!/^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(recipient)) throw Error('Configure a fixed server recipient');
  const domain=sender.split('@')[1];
  return {async send({to,subject,text,idempotencyKey}) {
    if(to!==recipient||!idempotencyKey.startsWith('kinoya-inquiry:')) throw Error('Unexpected mail route');
    const id=ref(idempotencyKey.slice('kinoya-inquiry:'.length));
    const messageId='<kinoya-inquiry.'+id+'@'+domain+'>';
    const result=await transport.sendMail({from:sender,to,subject,text,messageId,disableFileAccess:true,disableUrlAccess:true});
    const accepted=Array.isArray(result?.accepted)&&result.accepted.length===1&&String(result.accepted[0]).toLowerCase()===to.toLowerCase();
    // Message-ID is for reconciliation. SMTP does not guarantee deduplication.
    return {accepted,providerId:messageId};
  }};
}
