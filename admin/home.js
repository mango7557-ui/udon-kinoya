/* Home studio. Changed fields only; no production writes during preview/tests. */
(function(){
  'use strict';
  const fetch=AdminCore.fetch;
  const $=id=>document.getElementById(id), M=HomeModel;
  let source='', templateDoc, model, rows=Object.create(null), draft=Object.create(null), selected='layout', ready=false, busy=false;
  const status=(text,error=false)=>{$('status').textContent=text;$('status').classList.toggle('error',error);};
  const parse=()=>new DOMParser().parseFromString(source,'text/html');
  const current=key=>M.own(draft,key)?draft[key]:rows[key]?.value;
  const initial=f=>current(f.key) ?? f.initial;
  const original=key=>rows[key]?.value;
  const count=()=>Object.keys(draft).length;
  function updateButtons(){['save','discard'].forEach(id=>$(id).disabled=!ready||busy||!count());$('preview').disabled=!model||busy;$('export').disabled=!ready||busy;$('restore').disabled=!ready||busy;$('dirty-count').textContent='변경 '+count()+'개';$('editor').inert=busy;}
  function change(key,value){if(String(value)===String(original(key)??model.fields.find(f=>f.key===key)?.initial??''))delete draft[key];else draft[key]=value;updateButtons();}
  function layout(){let l={};try{l=JSON.parse(current('home.layout.v1')||'{}');}catch(e){}return M.resolveLayout(l,model.groups.filter(g=>g.section).map(g=>g.id));}
  function node(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
  function nav(){const root=$('groups');root.replaceChildren();[{id:'layout',label:'섹션 순서 · 표시'},...model.groups].forEach(g=>{const b=node('button',g.label);b.type='button';b.classList.toggle('active',g.id===selected);if(g.id!=='layout')b.append(node('small',model.fields.filter(f=>f.group===g.id).length));b.onclick=()=>{selected=g.id;$('search').value='';nav();render();};root.append(b);});}
  function render(){const root=$('editor');root.replaceChildren();const query=$('search').value.trim().toLowerCase();
    if(selected==='layout'&&!query){root.append(node('h2','섹션 순서 · 표시'));root.append(node('p','기본은 상단 메뉴와 같은 순서입니다. 체크 해제 시 숨김, ▲ ▼ 조작 시 수동 정렬로 전환됩니다. 변경 후 저장하세요. 각 상세 페이지의 문구·사진을 공통 키로 관리합니다. 운영 시스템·회전율·본사 지원의 예전 요약은 창업안내 전체에 통합되어 따로 표시되지 않습니다.','help'));const l=layout();root.append(node('p',l.mode==='menu'?'현재 정렬: 상단 메뉴 순서':'현재 정렬: 수동 순서','help'));const reset=node('button','상단 메뉴 순서로 맞추기');reset.type='button';reset.onclick=()=>{change('home.layout.v1',JSON.stringify({...l,mode:'menu'}));render();};root.append(reset);let legacy;try{legacy=JSON.parse(current('home.layout.v1')||'{}');}catch(e){}if(legacy&&Array.isArray(legacy.order)&&legacy.mode!=='custom'){const restore=node('button','저장된 수동 순서 사용');restore.type='button';restore.onclick=()=>{change('home.layout.v1',JSON.stringify({...legacy,mode:'custom'}));render();};root.append(restore);}l.order.forEach((id,i)=>{const r=node('div',undefined,'layout-row');const label=node('label');const check=node('input');check.type='checkbox';check.checked=!l.hidden[id];check.onchange=()=>{l.hidden[id]=!check.checked;change('home.layout.v1',JSON.stringify(l));};label.append(check,document.createTextNode(model.groups.find(g=>g.id===id).label));r.append(label);[-1,1].forEach(step=>{const b=node('button',step<0?'▲':'▼');b.setAttribute('aria-label',(step<0?'위로: ':'아래로: ')+id);b.disabled=i+step<0||i+step>=l.order.length;b.onclick=()=>{[l.order[i],l.order[i+step]]=[l.order[i+step],l.order[i]];l.mode='custom';change('home.layout.v1',JSON.stringify(l));render();};r.append(b);});root.append(r);});return;}
    const fields=model.fields.filter(f=>query?(f.label+' '+f.key+' '+f.type).toLowerCase().includes(query):f.group===selected);
    root.append(node('h2',query?'검색 결과':model.groups.find(g=>g.id===selected)?.label));root.append(node('p',fields.length+'개 항목 · 입력 후 저장 버튼을 눌러주세요. 기존 CMS 항목은 전체 관리자와 연동됩니다.','help'));
    fields.forEach(f=>{const wrap=node('article',undefined,'field'+(M.own(draft,f.key)?' changed':''));const label=node('label',f.label);const id='field-'+f.key;label.htmlFor=id;wrap.append(label);
      if(f.type==='image'){
        const tools=node('div',undefined,'image-tools'), img=node('img');img.alt=f.label+' 미리보기';const v=initial(f);if(v){const cached=window.__kinoyaGetCachedFileDataUrl?window.__kinoyaGetCachedFileDataUrl(v):'';try{img.src=cached||new URL(v.startsWith('/files/')?v.slice(1):v,AdminCore.root).href;}catch(e){}}else img.hidden=true;
        const input=node('input');input.id=id;input.type='file';input.accept='image/png,image/jpeg,image/webp,image/gif';
        input.onchange=async()=>{if(!input.files[0])return;busy=true;updateButtons();let uploadedOk=false;try{const url=await AdminCore.uploadImage(input.files[0]);change(f.key,url);const cached=window.__kinoyaGetCachedFileDataUrl?window.__kinoyaGetCachedFileDataUrl(url):'';img.src=cached||url;img.hidden=false;wrap.classList.add('changed');uploadedOk=true;status('사진 준비 완료. 저장 중입니다…');}catch(e){status(e.message,true);}finally{busy=false;updateButtons();}if(uploadedOk&&!window.adminFixture&&ready){await save();}};
        const clear=node('button','사진 비우기');clear.onclick=()=>{change(f.key,'');img.removeAttribute('src');img.hidden=true;wrap.classList.add('changed');};const retry=node('button','사진 업로드 다시 시도');retry.onclick=()=>{if(input.files[0])input.onchange();else status('먼저 사진을 선택해주세요.',true);};tools.append(img,input,retry,clear);wrap.append(tools,node('small','PNG 자동 축소 · Hosted 파일 업로드 후 참조만 저장. 프리뷰에서는 업로드 불가할 수 있습니다. 빈 사진은 표시하지 않습니다.'));
      }else{
        const input=node(['html','text'].includes(f.type)?'textarea':'input');input.id=id;input.value=initial(f);if(input.tagName==='INPUT')input.type='text';input.oninput=()=>{change(f.key,input.value);wrap.classList.toggle('changed',M.own(draft,f.key));};wrap.append(input);
        if(f.type==='html')wrap.append(node('small','줄바꿈 <br>, 강조 <b>·<em> 사용 가능. 상세 페이지 문구는 안전한 목록·표·링크도 유지하며, 스크립트와 실행 속성은 제거됩니다.'));
        if(['url','video'].includes(f.type))wrap.append(node('small',f.type==='video'?'MP4 파일 직접 주소를 입력하세요. 유튜브 페이지 주소는 배경 영상으로 재생되지 않습니다.':'내부 경로(/contact/), https://, tel:, mailto: 사용 가능'));
      }
      wrap.append(node('code',f.key));root.append(wrap);
    });if(!fields.length)root.append(node('p','일치하는 항목이 없습니다.','empty'));
  }
  function preview(){const doc=templateDoc?templateDoc.cloneNode(true):parse();doc.querySelectorAll('script').forEach(el=>el.remove());doc.querySelectorAll('base').forEach(el=>el.remove());const base=doc.createElement('base');base.href=new URL('../',document.baseURI).href;doc.head.prepend(base);const m=M.build(doc),values={...rows};Object.keys(draft).forEach(key=>values[key]={value:draft[key]});m.apply(values);
    if(window.HomeStoreRows){HomeStoreRows.prepare(doc);doc.querySelectorAll('.home-store-controls').forEach(el=>el.style.display='none');}
    doc.querySelectorAll('video').forEach(v=>{v.removeAttribute('autoplay');v.setAttribute('controls','');});
    doc.querySelectorAll('a[href]').forEach(a=>a.removeAttribute('href'));
    doc.querySelectorAll('form').forEach(form=>{form.removeAttribute('action');form.inert=true;});
    const style=doc.createElement('style');style.textContent='.home-section-hidden{display:none!important}[data-cms-type="img"],[data-cms-type="bg"]{visibility:visible;animation:none}.reveal{opacity:1!important;transform:none!important}.faq-a{max-height:none!important}';doc.head.append(style);
    $('preview-frame').srcdoc='<!doctype html>'+doc.documentElement.outerHTML;$('preview-dialog').showModal();
  }
  function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16);}
  async function save(){if(!ready||busy||!count())return;busy=true;updateButtons();status('최신 데이터 확인 후 변경사항을 저장합니다…');let saved=0;
    try{
      const fresh=await M.fetchRows();
      for(const key of Object.keys(draft)){if(String(fresh[key]?.value??'')!==String(rows[key]?.value??''))throw new Error('다른 화면에서 변경된 항목이 있습니다: '+key+'. 먼저 백업하고 새로고침 후 다시 편집해주세요.');}
      // Validate every value before the first write.
      Object.keys(draft).forEach(key=>{const f=model.fields.find(f=>f.key===key);if(f&&['url','video','image'].includes(f.type))M.safeURL(draft[key],f.type!=='url');AdminCore.assertNoBinary(draft[key]);});
      for(const key of Object.keys(draft)){
        const f=model.fields.find(f=>f.key===key),old=fresh[key],value=draft[key];
        const data={id:old?.id||'home-'+hash(key),key,page:f?(model.groups.find(g=>g.id===f.group)?.label||'홈'):'홈 - 섹션 설정',label:f?.label||'메인 섹션 순서 · 표시',type:f?.type==='image'?'image':'text',value};
        const res=await fetch('/tables/site_content'+(old?'/'+encodeURIComponent(old.id):''),{method:old?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
        if(!res.ok)throw new Error(key+' 저장 실패 (HTTP '+res.status+'). 남은 변경사항은 유지됩니다.');
        const stored=await res.json();if(!stored?.id)throw new Error('저장 응답 id가 없습니다. 새로고침으로 저장 여부를 먼저 확인하세요.');rows[key]=stored;delete draft[key];saved++;
        if (f?.type==='image' && old?.value && old.value !== value && AdminCore.deleteReplacedFile) {
          AdminCore.deleteReplacedFile(old.value, value);
        }
        if (/^global\.logo\.(header|footer)$/.test(key)) {
          try { const logos=JSON.parse(localStorage.getItem('kinoya_logo_cache_v1')||'{}');logos[key]={value,updated_at:rows[key].updated_at||Date.now(),id:rows[key].id};localStorage.setItem('kinoya_logo_cache_v1',JSON.stringify(logos)); } catch(e) {}
        }
      }
      try{
        localStorage.removeItem('cms_cache');
        localStorage.removeItem('cms_cache_v2');
        localStorage.removeItem('kinoya_menu_cache_v1');
        if(window.indexedDB){
          const req=indexedDB.open('kinoya_menu_photos_v1',1);
          req.onupgradeneeded=()=>{req.result.createObjectStore('snapshots');};
          req.onsuccess=()=>{try{const db=req.result,tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').delete('menu');tx.oncomplete=()=>db.close();}catch(e){}};
        }
      }catch(e){}
      status(saved+'개 항목 저장 완료. 사이트 보기에서 반영 내용을 확인하세요.');render();
    }catch(e){status((saved?saved+'개 저장 후 중단: ':'')+e.message,true);}finally{busy=false;updateButtons();}
  }
  function backup(){const values={};model.fields.forEach(f=>values[f.key]=initial(f));values['home.layout.v1']=JSON.stringify(layout());const blob=new Blob([JSON.stringify({version:1,exported_at:new Date().toISOString(),scope:'ko-home',values},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download='kinoya-home-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('restore').onclick=()=>$('restore-file').click();
  $('restore-file').onchange=async()=>{const file=$('restore-file').files[0];if(!file)return;try{if(file.size>25*1024*1024)throw new Error('25MB 이하 백업만 불러올 수 있습니다.');const data=JSON.parse(await file.text());if(data.version!==1||data.scope!=='ko-home'||!data.values||typeof data.values!=='object')throw new Error('메인 관리 화면에서 내보낸 JSON 백업이 아닙니다.');const allowed=new Set(model.fields.map(f=>f.key).concat('home.layout.v1'));for(const [key,value]of Object.entries(data.values)){if(!allowed.has(key)||typeof value!=='string')throw new Error('호환되지 않는 백업 항목: '+key);const f=model.fields.find(f=>f.key===key);if(f&&['image','video','url'].includes(f.type))M.safeURL(value,f.type!=='url');if(key==='home.layout.v1'){const l=JSON.parse(value);if(!Array.isArray(l.order)||!l.hidden||typeof l.hidden!=='object')throw new Error('섹션 설정 형식 오류');}}if(!confirm('백업 내용을 편집 화면에 불러올까요? 현재 미저장 값이 바뀔 수 있습니다. 실제 반영에는 저장이 필요합니다.'))return;Object.entries(data.values).forEach(([k,v])=>change(k,v));render();status('백업을 편집 화면에 불러왔습니다. 미리보기 확인 후 저장하세요.');}catch(e){status(e.message,true);}finally{$('restore-file').value='';}};
  $('search').oninput=()=>render();$('save').onclick=save;$('preview').onclick=preview;$('export').onclick=backup;
  $('discard').onclick=()=>{if(confirm('저장하지 않은 변경사항을 모두 취소할까요?')){draft=Object.create(null);render();updateButtons();status('미저장 변경사항을 취소했습니다.');}};
  $('close-preview').onclick=()=>$('preview-dialog').close();$('desktop-preview').onclick=()=>$('preview-frame').style.width='1280px';$('mobile-preview').onclick=()=>$('preview-frame').style.width='390px';
  window.addEventListener('beforeunload',e=>{if(count()){e.preventDefault();e.returnValue='';}});
  (async()=>{try{const response=await fetch('../index.html?_='+Date.now(),{cache:'no-store'});await AdminCore.checked(response,'홈페이지 원문 조회');source=await response.text();templateDoc=parse();if(window.HomeFull)await HomeFull.prepare(templateDoc);model=M.build(templateDoc);nav();render();updateButtons();rows=await M.fetchRows();ready=true;render();updateButtons();status(model.fields.length+'개 편집 항목을 불러왔습니다. 저장된 사진과 문구는 그대로 유지됩니다.');}catch(e){status(e.message+' · 저장이 차단되었습니다. 새로고침하여 다시 시도해주세요.',true);updateButtons();}})();
})();
