(async function(){
 'use strict';
 const A=window.AdminCore,out=document.getElementById('results'),logs=[],requests=[];
 const check=(ok,label)=>{if(!ok)throw Error(label);logs.push('PASS '+label);out.textContent=logs.join('\n');console.log(logs.at(-1));};
 const png=canvas=>new Promise(ok=>canvas.toBlob(ok,'image/png'));
 async function dimensions(file){const url=URL.createObjectURL(file),img=new Image();try{await new Promise((ok,no)=>{img.onload=ok;img.onerror=no;img.src=url;});return {width:img.naturalWidth,height:img.naturalHeight,img};}finally{URL.revokeObjectURL(url);}}
 const real=window.fetch.bind(window);let failUpload=false;
 window.fetch=async(url,options={})=>{
  if(options.method&&options.method!=='GET'){
   if(String(url)!=='/files/cms-images'||options.method!=='POST')throw Error('Blocked unexpected write');
   requests.push(options);
   if(failUpload){failUpload=false;return new Response('{}',{status:503});}
   return new Response(JSON.stringify({id:'png-test',reference:'/files/cms-images/png-test'}),{status:201,headers:{'Content-Type':'application/json'}});
  }
  return real(url,options);
 };
 try{
  const original=await(await fetch('../images/menu-gyudon.jpg')).blob(),jpg=new File([original],'규동.jpg',{type:'image/jpeg'}),prepared=await A.prepareImage(jpg);
  check(prepared.type==='image/png'&&prepared.name==='규동.png','JPG 원본이 실제 PNG 파일·확장자로 변환');
  check(Array.from(new Uint8Array(await prepared.arrayBuffer()).slice(0,8)).join(',')==='137,80,78,71,13,10,26,10','확장자 변경뿐 아니라 PNG 바이너리 시그니처 확인');
  check(prepared.size<=600*1024&&prepared.size>0,'실제 메뉴 사진 변환 결과 600KB 이하');
  const size=await dimensions(prepared);check(Math.max(size.width,size.height)<=2000&&Math.abs(size.width/size.height-4/3)<.01,'사진 종횡비 유지·최대변 2000px');
  check(requests.length===0,'로컬 변환만으로 네트워크 쓰기 없음');
  const canvas=document.createElement('canvas');canvas.width=2400;canvas.height=1200;const ctx=canvas.getContext('2d'),data=ctx.createImageData(2400,1200);let seed=731;
  for(let i=0;i<data.data.length;i+=4){for(let j=0;j<3;j++){seed=(1664525*seed+1013904223)>>>0;data.data[i+j]=seed>>>24;}data.data[i+3]=255;}ctx.putImageData(data,0,0);
  const large=new File([await png(canvas)],'고해상도.png',{type:'image/png'});check(large.size>600*1024,'600KB 초과 고해상도 테스트 원본 준비');
  const resized=await A.prepareImage(large),s=await dimensions(resized);
  check(resized.size<=600*1024&&s.width<2400&&s.height<1200,'큰 PNG도 픽셀 크기를 자동 줄여 600KB 이하');
  check(Math.abs(s.width/s.height-2)<.01,'반복 축소 후에도 가로세로 비율 유지');
  check(await A.prepareImage(large)===resized,'동일 파일은 변환 결과 재사용');
  const stricter=await A.prepareImage(large,128*1024);check(stricter.size<=128*1024&&stricter!==resized,'용량 한도별 캐시 분리·더 작은 변환 한도도 준수');
  const small=document.createElement('canvas');small.width=20;small.height=10;small.getContext('2d').fillRect(0,0,5,5);
  const smallFile=new File([await png(small)],'small.png',{type:'image/png'}),smallPng=await A.prepareImage(smallFile),smallSize=await dimensions(smallPng);
  check(smallSize.width===20&&smallSize.height===10&&smallPng.size<600*1024,'작은 사진은 확대하거나 600KB로 부풀리지 않음');
  const decoded=document.createElement('canvas');decoded.width=20;decoded.height=10;decoded.getContext('2d').drawImage(smallSize.img,0,0);check(decoded.getContext('2d').getImageData(19,9,1,1).data[3]===0,'PNG 투명 배경 보존');
  const emptyMime=new File([original],'empty-mime.jpg');check((await A.prepareImage(emptyMime)).type==='image/png','MIME 정보 없는 JPG도 변환');
  let rejected=false;try{await A.prepareImage(new File(['broken'],'손상.jpg',{type:'image/jpeg'}));}catch(e){rejected=true;}check(rejected&&requests.length===0,'손상 파일은 업로드 전 차단');
  rejected=false;try{await A.prepareImage(new File(['unsupported'],'photo.heic',{type:'image/heic'}));}catch(e){rejected=true;}check(rejected,'미지원 HEIC는 변환 성공으로 처리하지 않음');
  failUpload=true;rejected=false;try{await A.uploadImage(large);}catch(e){rejected=e.message.includes('Hosted');}check(rejected&&requests.length===1,'파일 서비스 실패 시 자동 재업로드 없음');
  check(requests[0].body===resized&&requests[0].body.type==='image/png'&&requests[0].body.size<=600*1024&&requests[0].headers['Content-Type']==='image/png','실제 업로드 본문은 원본 아닌 600KB 이하 PNG');
  const reference=await A.uploadImage(large);check(reference==='/files/cms-images/png-test'&&requests[0].body===requests[1].body&&requests[0].headers['Idempotency-Key']===requests[1].headers['Idempotency-Key'],'직접 재시도 때 변환 PNG·같은 멱등키 유지');
  check(await A.uploadImage(large)===reference&&requests.length===2,'성공한 파일은 중복 업로드하지 않음');
  out.textContent+='\nALL '+logs.length+' TESTS PASSED\n실제 규동 사진: '+(prepared.size/1024).toFixed(1)+'KB · '+size.width+'×'+size.height+'px\n고해상도 PNG: '+(resized.size/1024).toFixed(1)+'KB · '+s.width+'×'+s.height+'px';
  document.body.dataset.testStatus='passed';console.log('ALL '+logs.length+' TESTS PASSED');console.log('RESULT menu '+(prepared.size/1024).toFixed(1)+'KB, noise '+(resized.size/1024).toFixed(1)+'KB');
 }catch(e){out.textContent+='\nFAIL '+e.message;document.body.dataset.testStatus='failed';console.error('TEST FAILED',e.stack||e.message);}
 finally{window.fetch=real;}
})();
