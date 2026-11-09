/* Admin UX and binary upload helpers. Route permissions belong to Hosted Access Rules. */
(function () {
  'use strict';
  const R = window.KinoyaRuntime;
  if (!R) throw new Error('공통 API 스크립트를 불러오지 못했습니다.');
  const uploads = new WeakMap();
  async function upload(file, collection) {
    let state = uploads.get(file);
    if (!state) { state = {key:crypto.randomUUID(),collection}; uploads.set(file,state); }
    if (state.collection !== collection) throw new Error('업로드 분류가 바뀌었습니다. 파일을 다시 선택해주세요.');
    if (state.result) return state.result.reference;
    if (file.size > 10*1024*1024) throw new Error('업로드 파일은 10MiB 이하여야 합니다.');
    const response = await window.fetch('/files/'+collection, {method:'POST',headers:{'Content-Type':file.type||'application/octet-stream','X-File-Name':encodeURIComponent(file.name||'file'),'Idempotency-Key':state.key},body:file});
    if ([404,500,502,503].includes(response.status)) {
      const unavailable = new Error('이 환경에서는 파일 업로드를 사용할 수 없습니다. 승인된 Hosted 배포·파일 서비스 활성화·이용 자격과 접근 규칙이 필요합니다. 원본 파일은 유지됩니다.');
      unavailable.status = response.status;
      unavailable.unavailable = true;
      throw unavailable;
    }
    await R.checked(response,'파일 업로드');
    const data = await response.json();
    if (typeof data.reference !== 'string' || !/^\/files\/[a-z][a-z0-9_-]*\/[^/?#]+$/.test(data.reference)) throw new Error('파일 참조 응답이 올바르지 않습니다. 다시 등록하지 말고 확인해주세요.');
    state.result = data; return data.reference;
  }
  const images = new WeakMap();
  function imageType(file) {
    const type=String(file.type||'').toLowerCase();
    if(/^image\/(png|jpeg|webp|gif)$/.test(type))return type;
    if(type==='image/jpg')return 'image/jpeg';
    if(!type){const ext=(file.name||'').toLowerCase().match(/\.(png|jpe?g|webp|gif)$/);if(ext)return 'image/'+(/^jpe?g$/.test(ext[1])?'jpeg':ext[1]);}
    return '';
  }
  const IMAGE_MAX_BYTES = 600*1024;
  // Conversion is local only. Upload and Table writes remain separate operations.
  async function prepareImage(file, bytes = IMAGE_MAX_BYTES) {
    if (!Number.isFinite(bytes)||bytes<1||bytes>IMAGE_MAX_BYTES) throw new Error('사진 변환 한도는 600KB 이하여야 합니다.');
    if (!imageType(file)) throw new Error('PNG/JPG/WebP/GIF 사진을 선택해주세요.');
    if (file.size>15*1024*1024) throw new Error('원본 사진은 15MB 이하여야 합니다.');
    let variants=images.get(file);
    if(!variants){variants=new Map();images.set(file,variants);}
    if(variants.has(bytes))return variants.get(bytes);
    const job=(async()=>{
      const url=URL.createObjectURL(file),img=new Image();
      try{
        await new Promise((ok,no)=>{img.onload=ok;img.onerror=()=>no(new Error('사진을 읽지 못했습니다. 다른 PNG/JPG 사진을 선택해주세요.'));img.src=url;});
        if(!img.naturalWidth||!img.naturalHeight)throw new Error('사진 크기를 확인하지 못했습니다.');
        const canvas=document.createElement('canvas');
        let scale=Math.min(1,2000/Math.max(img.naturalWidth,img.naturalHeight));
        for(let i=0;i<24;i++){
          canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
          canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
          const ctx=canvas.getContext('2d');if(!ctx)throw new Error('이 브라우저에서 사진 변환을 지원하지 않습니다.');
          ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
          ctx.drawImage(img,0,0,canvas.width,canvas.height);
          const blob=await new Promise(ok=>canvas.toBlob(ok,'image/png'));
          if(!blob||blob.type!=='image/png')throw new Error('PNG 변환에 실패했습니다. 사진을 다시 선택해주세요.');
          if(blob.size<=bytes){
            const name=(file.name||'photo').replace(/\.[^.]+$/,'')||'photo';
            return new File([blob],name+'.png',{type:'image/png'});
          }
          if(canvas.width===1&&canvas.height===1)break;
          scale*=Math.min(.9,Math.sqrt(bytes/blob.size)*.96);
        }
        throw new Error('사진을 600KB 이하로 축소하지 못했습니다. 다른 사진을 선택해주세요.');
      }finally{URL.revokeObjectURL(url);}
    })();
    variants.set(bytes,job);
    try{return await job;}catch(error){variants.delete(bytes);throw error;}
  }
  async function uploadImage(file, bytes = IMAGE_MAX_BYTES) {
    const converted=await prepareImage(file,bytes);
    return upload(converted,'cms-images');
  }
  async function deleteReplacedFile(previousValue, nextValue) {
    const prev=String(previousValue||'').trim(), next=String(nextValue||'').trim();
    if(!prev || prev===next || !/^\/files\/[a-z][a-z0-9_-]*\/[^/?#]+$/.test(prev))return false;
    try{
      const res=await window.fetch(prev,{method:'DELETE'});
      return res.ok || res.status===404;
    }catch(e){return false;}
  }
  function error(err) {
    let el=document.getElementById('admin-operation-error');
    if(!el){el=document.createElement('p');el.id='admin-operation-error';el.setAttribute('role','alert');el.style.cssText='position:sticky;top:0;z-index:100;padding:16px;background:#fff0f0;color:#9f2020;overflow-wrap:anywhere';document.body.prepend(el);}
    el.textContent=err.message||String(err);
  }
  async function remove(table,id,button,refresh) {
    if(button.disabled)return;
    if(!confirm('이 항목을 삭제하시겠습니까?'))return;
    button.disabled=true;
    try {await R.fetch('tables/'+table+'/'+encodeURIComponent(id),{method:'DELETE'});await refresh();}
    catch(e){error(e);}finally{button.disabled=false;}
  }
  window.AdminCore={...R,upload,prepareImage,uploadImage,deleteReplacedFile,imageType,IMAGE_MAX_BYTES,error,remove};
})();
