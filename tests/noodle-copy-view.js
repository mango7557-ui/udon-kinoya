(async function(){
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const expected='우동키노야는 매장에서 직접 제면하는 방식과 노하우를 제조공정에 그대로 구현하여, 최상의 면 품질은 유지하면서도 매장에서는 간편하게 조리할 수 있도록 공급합니다.';
 const frame=document.getElementById('site'),out=document.getElementById('results');
 await sleep(650); frame.src='../noodle/index.html';
 for(let i=0;i<200&&!frame.contentDocument?.querySelector('[data-cms="noodle.hero.desc"]');i++)await sleep(100);
 await sleep(4000);
 const d=frame.contentDocument,el=d.querySelector('[data-cms="noodle.hero.desc"]');
 const correct=el?.textContent.trim()===expected;
 console.log((correct?'PASS':'FAIL')+' 독립 페이지 요청 문구 및 CMS 표시: '+(el?.textContent.trim()||'없음'));
 out.textContent=correct?'PASS 독립 페이지 요청 문구':'FAIL 독립 페이지 요청 문구';
 if(el)frame.contentWindow.scrollTo({top:0,behavior:'instant'});
 out.dataset.complete='true';
})();
