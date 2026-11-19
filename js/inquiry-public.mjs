import {createInquirySubmitter} from './inquiry-client.mjs';

if(window.homeContentReady) await Promise.resolve(window.homeContentReady).catch(()=>{});
const form=document.getElementById('consult-form');
if(form){
  const language=document.documentElement.lang.slice(0,2);
  const copy={
    ko:['접수 완료. 접수번호: ','온라인 접수를 확인하지 못했습니다. 전화 1551-8748로 문의해 주세요.','요청이 많습니다. 잠시 후 다시 시도하거나 전화로 문의해 주세요.','전송 중…'],
    en:['Inquiry recorded. Reference: ','We could not confirm the inquiry. Please call 1551-8748 (within Korea).','Please try again later or call us.','Sending…'],
    ja:['お問い合わせを受け付けました。受付番号：','送信を確認できません。韓国内の 1551-8748 にお電話ください。','時間をおいて再試行するか、お電話ください。','送信中…']
  };
  const messages=copy[language]||copy.ko;
  const state=document.createElement('p');state.setAttribute('role','status');
  const button=form.querySelector('.form-submit'), initial=button.textContent;
  form.before(state);
  form.addEventListener('submit',event=>event.preventDefault());
  (async()=>{
    const res=await fetch('/api/inquiries/config',{cache:'no-store',redirect:'error'});
    if(!res.ok) throw Error('unavailable');
    const cfg=await res.json();
    if(!cfg?.appCheckSiteKey||!window.FIREBASE_CONFIG)throw Error('missing public configuration');
    const [appSdk,checkSdk]=await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-check.js')
    ]);
    const app=appSdk.getApps()[0]||appSdk.initializeApp(window.FIREBASE_CONFIG);
    const appCheck=checkSdk.initializeAppCheck(app,{provider:new checkSdk.ReCaptchaEnterpriseProvider(cfg.appCheckSiteKey),isTokenAutoRefreshEnabled:true});
    const submit=createInquirySubmitter({source:form.dataset.inquirySource,getAppCheckToken:async()=>(await checkSdk.getToken(appCheck)).token});
    form.addEventListener('submit',async()=>{
      if(button.disabled)return;
      const fields=new FormData(form);
      button.disabled=true;button.textContent=messages[3];state.textContent='';
      try{
        const result=await submit({name:String(fields.get('name')??''),phone:String(fields.get('phone')??''),
          category:String(fields.get('startup_type')??''),region:String(fields.get('region')??''),
          message:String(fields.get('message')??''),consent:fields.has('consent'),website:String(fields.get('website')??'')});
        if(result.state==='accepted'){
          form.reset();form.hidden=true;form.inert=true;
          state.textContent=messages[0]+result.receiptId;
        }else state.textContent=result.state==='rate_limited'?messages[2]:messages[1];
      }finally{button.disabled=false;button.textContent=initial;}
    });
    form.inert=false;button.disabled=false;
  })().catch(()=>{state.textContent=messages[1];});
}
