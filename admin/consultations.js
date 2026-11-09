/* Consultation inbox. Admission must be protected by Hosted Access Rules. */
(function(){
 'use strict';
 document.addEventListener('DOMContentLoaded',()=>{
  const host=document.getElementById('consultations-section');if(!host)return;
  const A=AdminCore, node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
  const TARGET_EMAIL='udonkinoya@daum.net';
  host.append(
   node('h2','상담신청 · 문의 접수 내역 관리'),
   node('p','홈페이지에서 접수된 창업상담·업무제휴·고객의소리 내역이 실시간으로 저장되며, udonkinoya@daum.net 이메일로도 자동 발송됩니다.')
  );
  const emailNotice=node('div');
  emailNotice.style.cssText='background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 14px;margin:8px 0 12px;font-size:13px;color:#166534;line-height:1.6;';
  emailNotice.textContent='📧 실시간 이메일 자동 발송 연동됨 (수신처: '+TARGET_EMAIL+'): 홈페이지에서 상담·문의 신청 시 DB 저장과 동시에 '+TARGET_EMAIL+' 메일함으로 신청자 성함·연락처·희망지역·문의구분·문의내용이 자동 전송됩니다. (최초 1회 '+TARGET_EMAIL+' 메일함으로 도착하는 FormSubmit 인증 메일의 [Confirm] 버튼을 클릭하면 즉시 활성화됩니다.)';
  host.append(emailNotice);
  const search=node('input');search.type='search';search.placeholder='이름·연락처·지역·내용 검색';search.setAttribute('aria-label','상담 검색');
  const filter=node('select');filter.setAttribute('aria-label','처리 상태');[['','전체 상태'],['new','신규'],['contacted','연락 완료'],['closed','종료']].forEach(([value,label])=>{const o=node('option',label);o.value=value;filter.append(o);});
  const refresh=node('button','새로고침');refresh.type='button';refresh.className='collection-action';
  const status=node('p');status.setAttribute('role','status');status.style.fontWeight='600';const list=node('div');host.append(search,filter,refresh,status,list);let rows=[];

  async function sendDirectEmail(row, btn, msgEl){
   if(btn)btn.disabled=true;
   if(msgEl)msgEl.textContent=TARGET_EMAIL+'으로 이메일 발송 중…';
   try{
    const res=await window.fetch('https://formsubmit.co/ajax/'+encodeURIComponent(TARGET_EMAIL),{
     method:'POST',
     headers:{'Content-Type':'application/json','Accept':'application/json'},
     body:JSON.stringify({
      _subject:'[우동키노야 상담·문의] '+(row.name||'')+'님 ('+(row.startup_type||'미정')+' / '+(row.region||'-')+')',
      _template:'table',
      _captcha:'false',
      '신청자 성함':row.name||'-',
      '연락처':row.phone||'-',
      '희망지역':row.region||'-',
      '문의·상담 구분':row.startup_type||'-',
      '문의 내용':row.message||'(없음)',
      '접수 경로':row.source_page||'-',
      '접수 일시(KST)':row.created_at?new Date(row.created_at).toLocaleString('ko-KR'):'-'
     })
    });
    if(!res.ok)throw new Error('HTTP '+res.status);
    if(msgEl)msgEl.textContent='✅ '+TARGET_EMAIL+'으로 이메일 발송 완료 (최초 발송 시 메일함에서 FormSubmit 인증 메일을 확인해주세요)';
   }catch(e){
    if(msgEl)msgEl.textContent='❌ 자동 발송 실패 ('+e.message+'). 우측 [이메일 앱으로 열기] 버튼을 이용해주세요.';
   }finally{
    if(btn)btn.disabled=false;
   }
  }

  function updateHeaderBadge(){
   const newCount=rows.filter(r=>(r.status||'new')==='new').length;
   const jumpBtn=document.getElementById('jump-consultations-btn');
   if(jumpBtn){
    jumpBtn.textContent=newCount>0?'📬 상담신청 확인 (신규 '+newCount+'건)':'📬 상담신청 확인 ('+rows.length+'건)';
   }
  }

  function render(){
   updateHeaderBadge();
   const q=search.value.trim().toLowerCase();list.replaceChildren();
   const selected=rows.filter(r=>(!filter.value||(r.status||'new')===filter.value)&&[r.name,r.phone,r.region,r.startup_type,r.message].join(' ').toLowerCase().includes(q));
   if(!selected.length)list.append(node('p','조건에 맞는 상담·문의 내역이 없습니다.'));
   selected.forEach(row=>{
    const card=node('article');card.className='collection-card';
    const badge=(row.status||'new')==='new'?'🟢 [신규] ':(row.status==='contacted'?'🔵 [연락완료] ':'⚪ [종료] ');
    card.append(node('h3',badge+(row.name||'이름 없음')+' ('+(row.startup_type||'상담')+')'));
    for(const [label,key]of [['연락처','phone'],['희망 지역','region'],['문의·상담 구분','startup_type'],['문의 내용','message'],['접수 경로','source_page']])card.append(node('p',label+': '+(row[key]||'-')));
    card.append(node('p','접수일: '+(row.created_at?new Date(row.created_at).toLocaleString('ko-KR'):'-')));
    const select=node('select');select.setAttribute('aria-label','상담 처리 상태');[['new','신규'],['contacted','연락 완료'],['closed','종료']].forEach(([value,label])=>{const o=node('option',label);o.value=value;select.append(o);});select.value=row.status||'new';
    const save=node('button','상태 저장');save.type='button';save.className='collection-action';
    const resendBtn=node('button','📨 이메일 즉시 발송 ('+TARGET_EMAIL+')');resendBtn.type='button';resendBtn.className='collection-action';resendBtn.style.background='#047857';
    const mailBtn=node('a','✉️ 이메일 앱으로 열기 ('+TARGET_EMAIL+')');
    mailBtn.className='collection-action';
    mailBtn.style.cssText='text-decoration:none;text-align:center;background:#475569;';
    const mailSubj=encodeURIComponent('[우동키노야 상담·문의] '+(row.name||'')+'님 ('+(row.startup_type||'상담')+' / '+(row.region||'')+')');
    const mailBody=encodeURIComponent(
     '성함: '+(row.name||'-')+'\n'+
     '연락처: '+(row.phone||'-')+'\n'+
     '희망지역: '+(row.region||'-')+'\n'+
     '문의·상담 구분: '+(row.startup_type||'-')+'\n'+
     '문의내용: '+(row.message||'-')+'\n'+
     '접수경로: '+(row.source_page||'-')+'\n'+
     '접수일시: '+(row.created_at?new Date(row.created_at).toLocaleString('ko-KR'):'-')
    );
    mailBtn.href='mailto:'+TARGET_EMAIL+'?subject='+mailSubj+'&body='+mailBody;
    const delBtn=node('button','삭제');delBtn.type='button';delBtn.className='collection-action danger';
    const msg=node('p');msg.setAttribute('role','status');
    save.onclick=async()=>{save.disabled=true;select.disabled=true;try{const fresh=await(await A.fetch('tables/consultations/'+encodeURIComponent(row.id),{cache:'no-store'})).json();if(fresh.status!==row.status)throw new Error('다른 화면에서 상태가 바뀌었습니다. 새로고침하세요.');await A.fetch('tables/consultations/'+encodeURIComponent(row.id),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:select.value})});row.status=select.value;msg.textContent='저장 완료';updateHeaderBadge();}catch(e){msg.textContent=e.message;}finally{save.disabled=false;select.disabled=false;}};
    resendBtn.onclick=()=>sendDirectEmail(row,resendBtn,msg);
    delBtn.onclick=async()=>{if(!confirm((row.name||'해당')+' 상담 내역을 삭제하시겠습니까?'))return;delBtn.disabled=true;try{await A.fetch('tables/consultations/'+encodeURIComponent(row.id),{method:'DELETE'});rows=rows.filter(r=>r.id!==row.id);render();}catch(e){msg.textContent='삭제 실패: '+e.message;delBtn.disabled=false;}};
    card.append(select,save,resendBtn,mailBtn,delBtn,msg);list.append(card);
   });status.textContent='전체 '+rows.length+'건 (신규 '+rows.filter(r=>(r.status||'new')==='new').length+'건) / 표시 '+selected.length+'건';
  }
  async function load(){refresh.disabled=true;status.textContent='상담 목록 조회 중…';try{rows=await A.all('consultations');rows.sort((a,b)=>(b.created_at||0)-(a.created_at||0));render();}catch(e){status.textContent='조회 실패: '+e.message+' 기존 목록은 유지합니다.';}finally{refresh.disabled=false;}}
  search.oninput=render;filter.onchange=render;refresh.onclick=load;load();
 });
})();
