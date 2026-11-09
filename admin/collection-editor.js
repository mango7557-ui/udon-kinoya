/* DOM-based shared collection editor; binary bodies never enter Table API requests. */
(function(){
  'use strict';
  const A=AdminCore;
  function el(tag,text){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;}
  function mount(config){
    const section=document.getElementById(config.section);if(!section)return;
    const title=section.querySelector('h2');section.replaceChildren(title);
    section.append(el('p','등록·수정·순서·공개 표시를 관리합니다. 사진/파일은 Hosted 파일 서비스에 올린 뒤 참조만 저장합니다. 실패하면 입력은 유지됩니다. 공개 해제는 화면 표시 설정이며 비밀 자료 접근 보호가 아닙니다.'));
    const status=el('p');status.setAttribute('role','status');section.append(status);
    const refresh=el('button','목록 새로고침');refresh.type='button';refresh.className='collection-action';section.append(refresh);
    const list=el('div');section.append(list);
    let records=[],loading=false;
    function form(record){
      const isNew=!record, baseline=record||{}, box=el('form');box.className='collection-card';box.dataset.collection=config.table;if(record)box.dataset.id=record.id;
      box.append(el('h3',isNew?'새 항목 등록':(record.title||record.name||'등록 항목')));
      const inputs={}, fields=config.fields;
      fields.forEach(f=>{
        const label=el('label',f.label), input=el(f.type==='textarea'?'textarea':f.options?'select':'input');
        input.name=f.key;input.id=config.table+'-'+(record?.id||'new')+'-'+f.key;label.htmlFor=input.id;
        if(f.options)f.options.forEach(([value,text])=>{const option=el('option',text);option.value=value;input.append(option);});
        else if(f.type!=='textarea')input.type=f.type||'text';
        if(f.type==='checkbox')input.checked=baseline[f.key]!==false;
        else if(f.type!=='file')input.value=f.key==='external_url'?(baseline.link_type==='url'?baseline.file_url||'':''):(baseline[f.key]??f.default??'');
        if(f.type==='file')input.accept=f.accept||'';
        if(f.required)input.required=isNew||f.type!=='file';
        if(f.type==='number')input.step='1';
        if(f.type==='file'&&record){const ref=record[f.key]||'';if(ref){const p=el('small',/^data:/i.test(ref)?'기존 본문 저장 파일 — 새 파일 선택 시 참조 방식으로 전환됩니다.':'현재 파일: '+ref);label.append(p);}}
        label.append(input);box.append(label);inputs[f.key]=input;
        if(f.image&&record&&record[f.key]){
          const preview=el('img');preview.alt=f.label+' 미리보기';preview.className='collection-image';
          try{preview.src=A.safeURL(record[f.key],true,true);}catch(e){preview.hidden=true;}
          preview.onerror=()=>{preview.hidden=true;};label.append(preview);
          if(!f.required){const clearLabel=el('label','사진 비우기'),clear=el('input');clear.type='checkbox';clear.name=f.key+'__clear';clearLabel.append(clear);box.append(clearLabel);inputs[f.key+'__clear']=clear;}
        }
      });
      const rowStatus=el('p');rowStatus.setAttribute('role','status');const save=el('button',isNew?'등록':'변경사항 저장');save.type='submit';save.className='collection-action';box.append(save,rowStatus);
      if(record){const del=el('button','삭제');del.type='button';del.className='collection-action danger';del.onclick=()=>A.remove(config.table,record.id,del,load);box.append(del);}
      box.oninput=()=>{box.dataset.dirty='1';};
      box.onsubmit=async event=>{
        event.preventDefault();if(box.dataset.busy)return;
        box.dataset.busy='1';save.disabled=true;Array.from(box.elements).forEach(n=>n.disabled=true);rowStatus.textContent='최신 데이터 확인 및 저장 중…';
        try{
          if(config.table==='resources'&&inputs.file_url.files[0]&&inputs.external_url.value.trim())throw new Error('파일과 외부 링크는 하나만 선택해주세요.');
          const payload={};
          // Read and validate text values before uploading any selected binary.
          fields.filter(f=>f.type!=='file').forEach(f=>{
            let value=f.type==='checkbox'?inputs[f.key].checked:f.type==='number'?Number(inputs[f.key].value):inputs[f.key].value.trim();
            if(f.type==='number'&&!Number.isFinite(value))throw new Error(f.label+' 값을 확인해주세요.');
            if(f.required&&typeof value==='string'&&!value)throw new Error(f.label+' 입력이 필요합니다.');
            if(f.url&&value)value=A.safeURL(value);
            if(isNew||String(value)!==String(baseline[f.key]??f.default??''))payload[f.key]=value;
          });
          if(record){
            const fresh=await(await A.fetch('tables/'+config.table+'/'+encodeURIComponent(record.id),{cache:'no-store'})).json();
            for(const key of [...Object.keys(payload).filter(k=>k!=='external_url'),...(config.table==='resources'&&inputs.external_url.value.trim()?['file_url','link_type']:[]),...fields.filter(f=>f.type==='file'&&(inputs[f.key].files[0]||inputs[f.key]?.dataset.autofetchedUrl||inputs[f.key+'__clear']?.checked)).map(f=>f.key)])if(String(fresh[key]??'')!==String(baseline[key]??''))throw new Error('다른 화면에서 변경됐습니다. 현재 입력을 복사한 뒤 목록을 새로고침하세요.');
          }
          for(const f of fields.filter(f=>f.type==='file')){
            const file=inputs[f.key].files[0];
            const autoUrl=inputs[f.key]?.dataset.autofetchedUrl?inputs[f.key].dataset.autofetchedUrl.trim():'';
            if(inputs[f.key+'__clear']?.checked){if(file)throw new Error('사진 교체와 비우기는 하나만 선택해주세요.');payload[f.key]='';}
            if(file){
              try{
                const reference=f.image?await A.uploadImage(file):await A.upload(file,'resources');
                payload[f.key]=reference;
                if(!f.image){payload.file_name=file.name;payload.file_data='';payload.link_type='file';}
              }catch(upErr){
                if(f.image&&autoUrl&&upErr&&upErr.unavailable){
                  payload[f.key]=A.safeURL(autoUrl,true);
                }else throw upErr;
              }
            }else if(f.image&&autoUrl&&(isNew||String(autoUrl)!==String(baseline[f.key]??''))){
              payload[f.key]=A.safeURL(autoUrl,true);
            }
          }
          if(config.table==='resources'){
            const file=inputs.file_url.files[0], url=inputs.external_url.value.trim();
            delete payload.external_url;
            if(file&&url)throw new Error('파일과 외부 링크는 하나만 선택해주세요.');
            if(!file&&url){payload.file_url=A.safeURL(url);payload.link_type='url';payload.file_data='';payload.file_name='';}
            if(isNew&&!file&&!url)throw new Error('파일 또는 외부 링크를 입력해주세요.');
          }
          A.assertNoBinary(payload);
          if(!Object.keys(payload).length){rowStatus.textContent='변경사항이 없습니다.';return;}
          if(record){await A.fetch('tables/'+config.table+'/'+encodeURIComponent(record.id),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});}
          else await A.write(config.table,null,payload);
          box.removeAttribute('data-dirty');rowStatus.textContent='저장 완료';await load();
        }catch(e){rowStatus.textContent='저장 실패: '+e.message;}
        finally{delete box.dataset.busy;Array.from(box.elements).forEach(n=>n.disabled=false);}
      };
      return box;
    }
    async function load(){
      if(loading)return;loading=true;refresh.disabled=true;status.textContent='전체 목록 조회 중…';
      try{
        records=await A.all(config.table);records.sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
        const draft=list.querySelector('form:not([data-id])');
        const preserved=new Map(Array.from(list.querySelectorAll('form[data-id][data-dirty]')).map(f=>[f.dataset.id,f]));
        const newForm=draft?.dataset.dirty?draft:form(null);
        list.replaceChildren(newForm,...records.map(record=>preserved.get(record.id)||form(record)));status.textContent=records.length+'개 항목을 확인했습니다.';
      }catch(e){status.textContent='조회 실패: '+e.message+' 기존 입력과 목록은 유지합니다.';if(!list.children.length){const f=form(null);f.inert=true;list.append(f);}}
      finally{loading=false;refresh.disabled=false;}
    }
    refresh.onclick=()=>{if(list.querySelector('[data-dirty]')&&!confirm('목록을 다시 불러오면 미저장 수정이 사라집니다. 계속할까요?'))return;list.querySelectorAll('[data-dirty]').forEach(f=>f.removeAttribute('data-dirty'));load();};
    load();
  }
  window.KinoyaCollections={mount};
  window.addEventListener('beforeunload',e=>{if(document.querySelector('.collection-card[data-dirty]')){e.preventDefault();e.returnValue='';}});
})();
