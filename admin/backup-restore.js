/* Versioned, complete backups. Restore is validated fully before the first write. */
(function(){
  'use strict';
  const A=AdminCore;
  const TABLES={
    site_content:['id','key','page','label','type','value'],
    consultations:['id','name','phone','region','startup_type','message','consent','source_page','status','created_at'],
    youtube_videos:['id','title','youtube_id','video_type','duration','thumbnail','views','published_at','source','sort_order'],
    partner_logos:['id','row','name','image','link_url','sort_order'],
    faq_items:['id','category','question','answer','sort_order','is_published'],
    news_items:['id','title','date','source','url','thumbnail','excerpt','sort_order','is_published'],
    resources:['id','title','description','category','link_type','file_url','file_data','file_name','sort_order','is_published'],
    store_items:['id','name','region','address','meta','phone','photo','naver_map_url','google_map_url','kakao_map_url','tmap_url','detail_url','sort_order','is_published']
  };
  let busy=false;
  const $=id=>document.getElementById(id);
  function status(text){$('backup-status').textContent=text;}
  function lock(value){busy=value;['backup-export-btn','backup-import-file','backup-excel-btn'].forEach(id=>{if($(id))$(id).disabled=value;});}
  function download(data,name){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
  function filename(label){return 'kinoya-'+label+'-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';}
  async function snapshot(){
    const tables={};
    // Any failed table aborts the backup; it can never silently become an empty sheet.
    for(const name of Object.keys(TABLES)){
      status(name+' 전체 조회 중…');
      tables[name]=(await A.all(name)).map(row=>{const out={};TABLES[name].forEach(k=>{if(row[k]!==undefined)out[k]=row[k];});return out;});
    }
    return {version:2,scope:'kinoya-admin',exported_at:new Date().toISOString(),source:A.root.href,counts:Object.fromEntries(Object.entries(tables).map(([k,v])=>[k,v.length])),tables};
  }
  async function exportAll(excel=false){
    if(busy)return;lock(true);
    try{
      const data=await snapshot();
      if(excel){
        if(!window.XLSX)throw new Error('엑셀 라이브러리를 불러오지 못했습니다. JSON 백업을 사용하세요.');
        for(const [table,rows]of Object.entries(data.tables))for(const row of rows)for(const [key,value]of Object.entries(row))if(String(value??'').length>32767)throw new Error(table+'.'+key+' 값이 엑셀 셀 제한을 초과합니다. 손실 없는 JSON 백업을 사용하세요.');
        const wb=XLSX.utils.book_new();Object.entries(data.tables).forEach(([name,rows])=>XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows,{header:TABLES[name]}),name));XLSX.writeFile(wb,'kinoya-backup-'+new Date().toISOString().slice(0,10)+'.xlsx');
      }else download(data,filename('backup'));
      status('백업 다운로드를 요청했습니다. 총 '+Object.values(data.counts).reduce((a,b)=>a+b,0)+'개 행 / '+Object.entries(data.counts).map(([k,v])=>k+': '+v).join(', ')+'. 개인정보 포함 파일이므로 안전하게 보관하세요. 첨부파일 원본은 별도 보관이 필요합니다.');
    }catch(e){status('백업 실패: '+e.message+' 불완전한 파일을 완료로 처리하지 않았습니다.');}finally{lock(false);}
  }
  function normalize(table,raw){
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('행 형식 오류');
    const row={};
    for(const [key,value]of Object.entries(raw)){
      if(!TABLES[table].includes(key))throw new Error(table+' 허용되지 않는 컬럼: '+key);
      if(key==='created_at')continue; // Server timestamps are exported for reference, not rewritten.
      if(['is_published','consent'].includes(key)){
        if([true,'TRUE','true',1,'1'].includes(value))row[key]=true;
        else if([false,'FALSE','false',0,'0'].includes(value))row[key]=false;
        else throw new Error(table+'.'+key+'는 true/false여야 합니다.');
      }else if(key==='sort_order'){
        if(value===''||!Number.isFinite(Number(value)))throw new Error(table+' 표시 순서 오류');row[key]=Number(value);
      }else{
        if(typeof value!=='string'&&value!=null)throw new Error(table+'.'+key+'는 문자열이어야 합니다.');row[key]=value??'';
      }
    }
    if(!row.id||row.id.length>200||/[\u0000-\u001f]/.test(row.id))throw new Error(table+' id 누락/형식 오류');
    for(const key of ['url','link_url','file_url','naver_map_url','google_map_url','kakao_map_url','tmap_url','detail_url'])if(row[key])A.safeURL(row[key]);
    if(row.type&&!['text','image','video'].includes(row.type))throw new Error('CMS type 오류');
    if(row.video_type&&!['영상','쇼츠'].includes(row.video_type))throw new Error('영상 분류 오류');
    if(row.link_type&&!['url','file'].includes(row.link_type))throw new Error('자료 링크 방식 오류');
    if(row.row&&!['top','middle','bottom'].includes(row.row))throw new Error('로고 행 구분 오류');
    if(row.region&&table==='store_items'&&!['seoul','gyeonggi','incheon','chungcheong','daegu','busan','jeju'].includes(row.region))throw new Error('매장 지역 구분 오류');
    if(row.category&&table==='faq_items'&&!['brand','cost','sales','ops','store','support'].includes(row.category))throw new Error('FAQ 카테고리 오류');
    if(row.status&&table==='consultations'&&!['new','contacted','closed'].includes(row.status))throw new Error('상담 상태 오류');
    return row;
  }
  async function plan(tables){
    const tasks=[],summary=[];
    for(const [table,rawRows]of Object.entries(tables)){
      if(!TABLES[table]||!Array.isArray(rawRows))throw new Error('알 수 없는 테이블/형식: '+table);
      const rows=rawRows.map(r=>normalize(table,r)),ids=new Set(),keys=new Set();
      for(const row of rows){if(ids.has(row.id))throw new Error(table+' 백업 내 중복 id: '+row.id);ids.add(row.id);if(table==='site_content'){if(!row.key||keys.has(row.key))throw new Error('CMS key 누락/중복');keys.add(row.key);}}
      const existing=await A.all(table),byId=new Map(existing.map(r=>[r.id,r]));let add=0,update=0,skip=0;
      for(const row of rows){
        const old=byId.get(row.id);
        if(!old){
          const required={site_content:['key','type'],consultations:['name','phone'],youtube_videos:['title','youtube_id','video_type'],partner_logos:['row','image'],faq_items:['category','question','answer'],news_items:['title'],resources:['title','link_type'],store_items:['name','address']};
          for(const key of required[table])if(typeof row[key]!=='string'||!row[key].trim())throw new Error(table+' 신규 행 필수값 누락: '+key);
          if(table==='resources'&&!row.file_url&&!row.file_data)throw new Error('자료 파일 또는 링크가 필요합니다.');
          if(table==='youtube_videos'&&!/^[A-Za-z0-9_-]{11}$/.test(row.youtube_id))throw new Error('유튜브 ID 형식 오류');
        }
        if(table==='site_content'){
          if(old&&old.key!==row.key)throw new Error('같은 id의 CMS key가 다릅니다: '+row.id);
          const same=existing.filter(r=>r.key===row.key);if(same.some(r=>r.id!==row.id))throw new Error('CMS key가 다른 id로 존재합니다: '+row.key+'. 자동 덮어쓰지 않습니다.');
        }
        const payload={};Object.entries(row).forEach(([key,value])=>{if(key!=='id'&&(!old||JSON.stringify(value)!==JSON.stringify(old[key])))payload[key]=value;});
        if(!old)payload.id=row.id;
        A.assertNoBinary(payload); // An unchanged legacy body is never re-sent; a new/replaced one is refused.
        if(!Object.keys(payload).length){skip++;continue;}
        if(old)update++;else add++;
        tasks.push({table,id:row.id,old,payload});
      }
      summary.push(table+': 추가 '+add+', 변경 '+update+', 동일 '+skip);
    }
    return {tasks,summary};
  }
  async function importAll(file){
    if(busy)return;lock(true);let done=0,prepared;
    try{
      if(file.size>50*1024*1024)throw new Error('50MiB 이하 백업을 선택해주세요.');
      let tables;
      if(/\.json$/i.test(file.name)){
        const data=JSON.parse(await file.text());if(data.version!==2||data.scope!=='kinoya-admin'||!data.tables||Array.isArray(data.tables))throw new Error('전체 관리자 v2 JSON 백업이 아닙니다.');tables=data.tables;
      }else{
        if(!window.XLSX)throw new Error('엑셀 라이브러리 로드 실패');const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});tables={};
        wb.SheetNames.forEach(name=>{if(!TABLES[name])throw new Error('허용되지 않는 시트: '+name);tables[name]=XLSX.utils.sheet_to_json(wb.Sheets[name],{defval:''});});
      }
      status('전체 파일 형식·중복·현재 데이터 검증 중…');prepared=await plan(tables);
      if(!prepared.tasks.length){status('변경할 데이터가 없습니다.');return;}
      if(!confirm('복원 사전검증 완료\n'+prepared.summary.join('\n')+'\n\n현재 출처: '+A.root.href+'\n기존에만 있는 행은 삭제하지 않습니다. 시스템 생성일은 복원하지 않습니다.\n다음 단계에서 현재 데이터를 백업합니다. 계속할까요?')){status('복원 취소');return;}
      const safety=await snapshot();download(safety,filename('before-restore'));
      if(!confirm('복원 전 백업 다운로드를 요청했습니다. 파일을 확인했나요?\n확인을 누르면 '+prepared.tasks.length+'개 행을 순차 저장합니다. 부분 실패는 자동 롤백되지 않으며 실패 시 즉시 중단합니다.')){status('복원 취소 — 백업만 요청했습니다.');return;}
      for(const task of prepared.tasks){
        status(task.table+'/'+task.id+' 저장 중 ('+(done+1)+'/'+prepared.tasks.length+')');
        if(task.old){
          const fresh=await(await A.fetch('tables/'+task.table+'/'+encodeURIComponent(task.id),{cache:'no-store'})).json();
          for(const key of Object.keys(task.payload))if(JSON.stringify(fresh[key])!==JSON.stringify(task.old[key]))throw new Error('동시 변경 충돌: '+task.table+'/'+task.id);
          await A.fetch('tables/'+task.table+'/'+encodeURIComponent(task.id),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(task.payload)});
        }else await A.write(task.table,null,task.payload);
        done++;
      }
      try{localStorage.removeItem('cms_cache');}catch(e){}
      status('복원 완료: '+done+'개 행 저장. 새로고침 후 확인하세요. 첨부파일 참조는 같은 출처에서만 유효할 수 있습니다.');
    }catch(e){status('복원 중단: '+e.message+' / 저장 성공 '+done+'개. 실패 입력은 유지됩니다. 자동 재시도·롤백하지 않습니다.');}
    finally{lock(false);}
  }
  window.KinoyaBackup={snapshot,plan,normalize,TABLES};
  document.addEventListener('DOMContentLoaded',()=>{
    const btn=$('backup-export-btn'),input=$('backup-import-file');if(!btn||!input)return;
    btn.textContent='전체 데이터 JSON 백업 (권장)';input.accept='.json,.xlsx,.xls';btn.onclick=()=>exportAll();
    const excel=document.createElement('button');excel.id='backup-excel-btn';excel.type='button';excel.className=btn.className;excel.textContent='엑셀 백업 (긴 값 제외 불가·초과 시 중단)';excel.onclick=()=>exportAll(true);btn.after(excel);
    input.onchange=()=>{if(input.files[0])importAll(input.files[0]);};
  });
  window.addEventListener('beforeunload',e=>{if(busy){e.preventDefault();e.returnValue='';}});
})();
