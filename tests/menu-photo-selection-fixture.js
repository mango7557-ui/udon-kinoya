/* Memory-only extension for the actual admin editor. */
(function(){
 const F=window.adminFixture;
 F.tables.site_content.push({id:'menu-photo-1',key:'menu.catalog.signature.eel.bg',page:'메뉴소개 · 시그니처',label:'메뉴 사진',type:'image',value:''});
 F.tables.site_content.push({id:'legacy-photo-1',key:'menu.item1.bg',page:'메뉴소개 · 이전 16칸(보관용)',label:'이전 메뉴 사진',type:'image',value:new URL('../images/udon-bowl-hero.jpg',document.currentScript.src).href});
 if(parent.menuPhotoTestSeed)F.tables.site_content=JSON.parse(JSON.stringify(parent.menuPhotoTestSeed));
 if(new URL(document.currentScript.src).searchParams.get('readfail')==='1')F.fail={method:'GET',table:'site_content',status:503};
})();
