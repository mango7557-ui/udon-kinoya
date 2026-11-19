import {createInquiryAdminClient,mountInquiryAdminViewer} from '../js/inquiry-client.mjs';
const root=document.getElementById('new-inquiries-section');
const auth=window.KinoyaAdminAuth;
if(root&&auth){
  await auth.ready;
  if(typeof auth.subscribe!=='function'||typeof auth.token!=='function')root.textContent='관리자 로그인 연결을 확인해 주세요.';
  else mountInquiryAdminViewer({root,request:createInquiryAdminClient({getIdToken:auth.token}),subscribeAuth:auth.subscribe});
}
