/* Isolated in-memory API. Never forwards table writes to the project's database. */
(function () {
  const realFetch=window.fetch.bind(window);
  const rows=Array.from({length:101},(_,i)=>({id:'fixture-'+i,key:'people.fixture.'+i,value:'',type:'text'}));
  rows.push({id:'portrait-1',key:'people.profile.1.image',value:'/images/people-kim-minchan.jpg',type:'image'}, {id:'name-1',key:'people.profile.1.name',value:'김민찬',type:'text'});
  window.peopleFixture={rows,requests:[],failNext:false,uploadCount:0};
  window.fetch=async function (url,options={}) {
    const address=new URL(url,document.baseURI);
    if (address.pathname.startsWith('/files/')) return new Response(JSON.stringify({id:'mock-file',reference:'/files/cms-images/mock-'+(++window.peopleFixture.uploadCount)}),{status:201,headers:{'Content-Type':'application/json'}});
    if (!address.pathname.includes('/tables/')) return realFetch(url,options);
    const method=options.method||'GET';
    const fixture=window.peopleFixture;
    fixture.requests.push({url:address.href,method,body:options.body?JSON.parse(options.body):null});
    if (method==='GET') {
      const page=Number(address.searchParams.get('page')||1),limit=Number(address.searchParams.get('limit')||100);
      return new Response(JSON.stringify({data:rows.slice((page-1)*limit,page*limit),total:rows.length}),{status:200,headers:{'Content-Type':'application/json'}});
    }
    if (fixture.failNext) {fixture.failNext=false;return new Response('Simulated failure',{status:500});}
    const body=JSON.parse(options.body);
    if (method==='PUT') {
      const id=decodeURIComponent(address.pathname.split('/').pop());
      const index=rows.findIndex(row=>row.id===id);
      if(index<0)return new Response('Missing fixture row',{status:404});
      rows[index]={...body,id,updated_at:Date.now()};
      return new Response(JSON.stringify(rows[index]),{status:200,headers:{'Content-Type':'application/json'}});
    }
    if (method==='POST') {
      const row={...body,id:'new-'+rows.length,updated_at:Date.now()};rows.push(row);
      return new Response(JSON.stringify(row),{status:201,headers:{'Content-Type':'application/json'}});
    }
    return new Response('Method blocked in test',{status:405});
  };
})();
