/* Candidate modules: publish only after replacing, not supplementing, the old FormSubmit binding. */
const categories = new Map([
  ['신규창업','new'],['업종전환','conversion'],['기존점포보유','existing'],['미정','undecided'],
  ['업무제휴','partner'],['고객의소리','feedback'],['기타','other']
]);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function createInquirySubmitter({source,getAppCheckToken,fetcher=globalThis.fetch,makeId=()=>crypto.randomUUID()}) {
  let active=false, pending;
  return async form=>{
    if(active) return {state:'busy'};
    const category=categories.get(form.category)??'undecided';
    if(form.consent!==true || form.website!=='' || !form.name.trim() || !form.phone.trim())
      return {state:'invalid'};
    active=true;
    try {
      const fields={name:form.name,phone:form.phone,category,region:form.region??'',message:form.message??'',source,consent:true,website:''};
      const signature=JSON.stringify(fields); // tab memory only; never serialized to browser storage
      if(!pending || pending.signature!==signature) pending={signature,id:makeId()};
      const token=await getAppCheckToken();
      if(!token) return {state:'unavailable'};
      const res=await fetcher('/api/inquiries',{
        method:'POST',credentials:'omit',redirect:'error',cache:'no-store',
        headers:{'Content-Type':'application/json','X-Firebase-AppCheck':token},
        body:JSON.stringify({id:pending.id,...fields})
      });
      if(res.status!==202) return {state:res.status===429?'rate_limited':'unavailable'};
      const reply=await res.json();
      if(!uuid.test(reply?.receiptId??'')||reply.receiptId!==pending.id) return {state:'unavailable'};
      pending=undefined;
      return {state:'accepted',receiptId:reply.receiptId};
    }catch{
      return {state:'unavailable'};
    }finally{active=false;}
  };
}
export function createInquiryAdminClient({getIdToken,fetcher=globalThis.fetch}) {
  return async ({cursor,update}={})=>{
    const token=await getIdToken();
    if(!token) throw Error('authentication_required');
    const endpoint='/api/admin/inquiries'+(cursor?'?cursor='+encodeURIComponent(cursor):'');
    const response=await fetcher(endpoint,{method:update?'PATCH':'GET',credentials:'omit',redirect:'error',cache:'no-store',
      headers:{Authorization:'Bearer '+token,...(update?{'Content-Type':'application/json'}:{})},
      ...(update?{body:JSON.stringify(update)}:{})});
    if(!response.ok) throw Error('inquiry_api_'+response.status);
    return response.json();
  };
}
export function mountInquiryAdminViewer({root,request,subscribeAuth,document=root.ownerDocument}) {
  // Inquiry fields are text nodes, not HTML. Do not put them in URLs, attributes or browser storage.
  const make=(tag,text)=>{const el=document.createElement(tag);el.textContent=text??'';return el;};
  const rows=make('section'), feedback=make('p'), refresh=make('button','새로고침'), more=make('button','다음 목록');
  refresh.type=more.type='button';
  feedback.setAttribute('role','status');
  root.replaceChildren(make('h2','상담 접수'),feedback,refresh,more,rows);
  let generation=0, cursor=null, signedIn=false;
  more.hidden=true;
  const clear=()=>{generation++;rows.replaceChildren();more.hidden=true;cursor=null;};
  const load=async append=>{
    if(!signedIn) return;
    const epoch=++generation;
    feedback.textContent='불러오는 중…';
    try{
      const packet=await request({cursor:append?cursor:null});
      if(epoch!==generation||!signedIn) return;
      if(!Array.isArray(packet?.items)) throw Error('invalid_list');
      if(!append) rows.replaceChildren();
      for(const item of packet.items){
        const card=make('article');
        card.append(make('h3',item.name??''),make('p',item.phone??''),make('p',item.region??''),
          make('p',item.category??''),make('p',item.message??''),make('p',item.createdAt??''),make('p',item.id??''));
        const select=make('select');
        select.setAttribute('aria-label','상담 상태');
        for(const [key,val] of [['new','신규'],['contacted','연락 완료'],['closed','종료']]){
          const option=make('option',val);option.value=key;select.append(option);
        }
        select.value=item.status;
        const save=make('button','상태 저장');save.type='button';
        save.addEventListener('click',async()=>{
          if(!signedIn)return;
          const changeEpoch=generation;save.disabled=true;
          try{
            const result=await request({update:{id:item.id,expected:item.status,status:select.value}});
            if(!signedIn||changeEpoch!==generation)return;
            item.status=result.status; feedback.textContent='상담 상태를 저장했습니다.';
          }catch{
            if(signedIn&&changeEpoch===generation) feedback.textContent='상태를 저장하지 못했습니다. 새로고침해 주세요.';
          }finally{save.disabled=false;}
        });
        card.append(select,save);rows.append(card);
      }
      cursor=packet.nextCursor??null;more.hidden=!cursor;
      feedback.textContent=rows.childElementCount?'':'접수된 문의가 없습니다.';
    }catch{
      if(epoch!==generation||!signedIn)return;
      clear();feedback.textContent='관리자 권한 또는 연결을 확인해 주세요.';
    }
  };
  refresh.addEventListener('click',()=>load(false));more.addEventListener('click',()=>load(true));
  return subscribeAuth(user=>{
    clear();signedIn=Boolean(user);refresh.disabled=!signedIn;
    feedback.textContent=signedIn?'':'관리자 로그인이 필요합니다.';
    if(signedIn) load(false);
  });
}
