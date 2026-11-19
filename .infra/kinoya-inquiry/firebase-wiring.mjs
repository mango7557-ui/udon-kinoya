/* Dependency injection keeps cloud credentials and SDK initialization outside this module. */
import {createHmac} from 'node:crypto';
import {createInquiryHttp,createIntake,createSmtpAdapter,firestoreInquiryRepository,processInquiryOutbox} from './core.mjs';

export function createFirebaseInquiryAdapters({firestore,auth,appCheck,allowedAppIds,allowedOrigins,
  secret,consentVersion,serverRecipient}) {
  if(!Array.isArray(allowedAppIds)||!allowedAppIds.length||typeof secret!=='string'||secret.length<32)
    throw Error('An App Check allowlist and server-side HMAC secret are required');
  const repository=firestoreInquiryRepository(firestore);
  const intake=createIntake({repository,consentVersion,keyedHash:data=>createHmac('sha256',secret).update(data).digest('hex')});
  const handle=createInquiryHttp({intake,repository,allowedOrigins,
    verifyIdToken:(token,revoked)=>auth.verifyIdToken(token,revoked),
    verifyAppCheck:async token=>allowedAppIds.includes((await appCheck.verifyToken(token)).appId)});
  return {
    async firebaseHttp(req,res) {
      const path=req.originalUrl??req.url;
      if(typeof path!=='string'||!path.startsWith('/')||path.startsWith('//')) return res.status(400).end();
      if(req.rawBody?.length>12000) return res.set('Cache-Control','no-store').status(413).end();
      const incoming=new Headers();
      for(const h of ['origin','authorization','content-type','x-firebase-appcheck']){
        const value=req.get(h);
        if(value) incoming.set(h,value);
      }
      const request=new Request(new URL(path,allowedOrigins[0]),{method:req.method,headers:incoming,
        ...(req.method==='GET'||req.method==='HEAD'?{}:{body:req.rawBody})});
      const result=await handle(request);
      for(const [k,v] of result.headers) res.set(k,v);
      return res.status(result.status).send(await result.text());
    },
    runMailJob({id,transport,verifiedSender}){
      const mailAdapter=createSmtpAdapter({transport,sender:verifiedSender,recipient:serverRecipient});
      return processInquiryOutbox({id,repository,recipient:serverRecipient,mailAdapter});
    }
  };
}
