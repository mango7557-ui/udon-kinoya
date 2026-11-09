/* Memory only: ALL Table/file operations are intercepted before admin scripts run. */
(function(){
 'use strict';
 const real=window.fetch.bind(window),tables={site_content:Array.from({length:105},(_,i)=>({id:'content-'+i,key:'test.'+i,page:'test',label:'test',type:'text',value:''})),news_items:[{id:'news-1',title:'기존 뉴스',date:'2026-10-21',url:'https://example.com/',excerpt:'요약',sort_order:0,is_published:true}],resources:[{id:'res-1',title:'기존 자료',category:'안내',description:'설명',link_type:'url',file_url:'https://example.com/guide.pdf',sort_order:0,is_published:true}],partner_logos:[],faq_items:[],youtube_videos:[],store_items:[],consultations:[{id:'consult-1',name:'테스트 신청',phone:'010-0000-0000',region:'테스트 지역',status:'new',created_at:Date.now()}],visitor_logs:[]};
 const maxRead=new URL(document.currentScript.src).searchParams.get('maxread');
 const failRead=new URL(document.currentScript.src).searchParams.get('failread');
 const failSearch=new URL(document.currentScript.src).searchParams.get('failsearch');
 const failFiles=new URL(document.currentScript.src).searchParams.get('failfiles');
 const oversize=(new URL(document.currentScript.src).searchParams.get('oversize')||'').split(',').filter(Boolean);
 const fixture=window.adminFixture={tables,requests:[],fail:failRead?{method:'GET',table:'site_content',status:Number(failRead)}:null,failSearch:failSearch?Number(failSearch):0,failFiles:failFiles?Number(failFiles):0,malformed:false,uploads:0,oversizePrefixes:oversize,read413:maxRead===null?null:{table:'site_content',maxLimit:Number(maxRead),minPage:1}};
 function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});}
 window.confirm=()=>true;
 window.fetch=async(url,options={})=>{
  const u=new URL(url,document.baseURI),method=options.method||'GET';
  const match=u.pathname.match(/\/tables\/([a-z_]+)(?:\/([^/]+))?$/),file=u.pathname.startsWith('/files/');
  if(!match&&!file){if(method!=='GET')throw new Error('Blocked unexpected write');return real(url,options);}
  fixture.requests.push({url:u.href,method,headers:options.headers,body:options.body});
  const table=match?.[1];
  if(fixture.fail&&fixture.fail.method===method&&(!fixture.fail.table||fixture.fail.table===table)){
   const status=fixture.fail.status;fixture.fail=null;return json({error:'Simulated failure',login_url:status===401?'https://www.genspark.ai/login':undefined},status);
  }
  if(file){if(fixture.failFiles)return json({error:'Simulated file gateway error'},fixture.failFiles);fixture.uploads++;return json({id:'mock-'+fixture.uploads,reference:'/files/cms-images/mock-'+fixture.uploads},201);}
  if(!tables[table])throw new Error('Unknown test table');
  const id=match[2]&&decodeURIComponent(match[2]),rows=tables[table];
  if(method==='GET'){
   const search=u.searchParams.get('search'),cap=fixture.read413;
   if(fixture.failSearch&&table==='site_content'&&!id&&search)return json({error:'Simulated search 500'},fixture.failSearch);
   if(fixture.oversizePrefixes.length&&table==='site_content'&&!id&&(!search||fixture.oversizePrefixes.some(p=>search.startsWith(p)||p.startsWith(search))))return json({error:'Simulated oversized section'},413);
   if(cap&&table===cap.table&&!id&&Number(u.searchParams.get('limit')||100)>cap.maxLimit&&Number(u.searchParams.get('page')||1)>=(cap.minPage||1))return json({error:'Simulated read size limit'},413);
   if(fixture.malformed){fixture.malformed=false;return json({data:{message:'not an array'}});}
   if(id){const row=rows.find(r=>r.id===id);return row?json(row):json({error:'missing'},404);}
   let selected=rows;if(search)selected=rows.filter(r=>JSON.stringify(r).includes(search));
   const limit=Number(u.searchParams.get('limit')||100),page=Number(u.searchParams.get('page')||1);return json({data:selected.slice((page-1)*limit,page*limit),total:selected.length});
  }
  const index=rows.findIndex(r=>r.id===id);
  if(method==='DELETE'){if(index<0)return json({},404);rows.splice(index,1);return new Response(null,{status:204});}
  const body=JSON.parse(options.body);
  if(method==='POST'){const row={...body,id:body.id||'new-'+Date.now()+'-'+rows.length};rows.push(row);return json(row,201);}
  if(index<0)return json({},404);
  rows[index]=method==='PATCH'?{...rows[index],...body}:{...body,id};return json(rows[index]);
 };
})();
