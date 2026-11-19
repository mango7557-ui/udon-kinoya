import {initializeApp,getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import {getAppCheck} from 'firebase-admin/app-check';
import {onRequest} from 'firebase-functions/v2/https';
import {onSchedule} from 'firebase-functions/v2/scheduler';
import {defineSecret,defineString} from 'firebase-functions/params';
import nodemailer from 'nodemailer';
import {createFirebaseInquiryAdapters} from './firebase-wiring.mjs';
import {outboxCollection} from './core.mjs';

const app=getApps()[0]||initializeApp();
const hmac=defineSecret('KINOYA_INQUIRY_HMAC');
const smtp=defineSecret('KINOYA_INQUIRY_SMTP_PASSWORD');
const databaseId=defineString('KINOYA_INQUIRY_DATABASE');
const origins=defineString('KINOYA_INQUIRY_ORIGINS');
const appIds=defineString('KINOYA_INQUIRY_APP_IDS');
const siteKey=defineString('KINOYA_INQUIRY_APPCHECK_SITE_KEY');
const consentVersion=defineString('KINOYA_INQUIRY_CONSENT_VERSION');
const workerIdentity=defineString('KINOYA_INQUIRY_WORKER_IDENTITY');
const apiIdentity=defineString('KINOYA_INQUIRY_API_IDENTITY');
const mailEnabled=defineString('KINOYA_INQUIRY_MAIL_ENABLED',{default:'false'});
const mailFrom=defineString('KINOYA_INQUIRY_SMTP_FROM',{default:''});
const mailTo=defineString('KINOYA_INQUIRY_MAIL_TO',{default:''});
const mailHost=defineString('KINOYA_INQUIRY_SMTP_HOST',{default:''});
const mailPort=defineString('KINOYA_INQUIRY_SMTP_PORT',{default:'587'});
const mailUser=defineString('KINOYA_INQUIRY_SMTP_USER',{default:''});
const region='asia-northeast3';
const words=s=>s.split(',').map(x=>x.trim()).filter(Boolean);
function runtime(serverRecipient) {
  const firestore=getFirestore(app,databaseId.value());
  const adapter=createFirebaseInquiryAdapters({firestore,auth:getAuth(app),appCheck:getAppCheck(app),
    allowedOrigins:words(origins.value()),allowedAppIds:words(appIds.value()),secret:hmac.value(),
    consentVersion:consentVersion.value(),serverRecipient});
  return {firestore,adapter};
}
export const kinoyaInquiryApi=onRequest({region,secrets:[hmac],serviceAccount:apiIdentity,
  timeoutSeconds:30,maxInstances:4,concurrency:15},async(req,res)=>{
  res.set('Cache-Control','no-store');
  try{
    if(req.path==='/api/inquiries/config'&&req.method==='GET')
      return res.status(200).json({appCheckSiteKey:siteKey.value()});
    return await runtime().adapter.firebaseHttp(req,res);
  }catch{
    return res.status(503).json({error:'temporarily_unavailable'});
  }
});
export const kinoyaInquiryMail=onSchedule({region,schedule:'every 5 minutes',timeZone:'Asia/Seoul',
  secrets:[hmac,smtp],serviceAccount:workerIdentity,retryCount:0,timeoutSeconds:110,maxInstances:1},async()=>{
  if(mailEnabled.value()!=='true')return;
  const port=Number(mailPort.value());
  if(![465,587].includes(port)||!mailHost.value()||!mailUser.value()||!mailFrom.value()||!mailTo.value())return;
  const {firestore,adapter}=runtime(mailTo.value());
  const transport=nodemailer.createTransport({
    host:mailHost.value(),port,secure:port===465,requireTLS:true,tls:{rejectUnauthorized:true,minVersion:'TLSv1.2'},
    auth:{user:mailUser.value(),pass:smtp.value()},connectionTimeout:8000,greetingTimeout:8000,socketTimeout:12000,
    logger:false,debug:false
  });
  try{
    const pending=await firestore.collection(outboxCollection).where('status','==','pending').limit(5).get();
    for(const job of pending.docs){
      try{await adapter.runMailJob({id:job.id,transport,verifiedSender:mailFrom.value()});}
      catch{/* Error details may contain customer information. Inspect private outbox state instead. */}
    }
  }finally{transport.close();}
});
