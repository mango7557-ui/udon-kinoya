/* In-memory menu API only. The previous browser cache is restored by the test. */
window.menuPhotoCacheBackup = localStorage.getItem('kinoya_menu_cache_v1');
window.menuPhotoRequests = [];
Object.defineProperty(window, 'indexedDB', {value: undefined, configurable: true});
localStorage.setItem('kinoya_menu_cache_v1', JSON.stringify({
  'menu.item1.bg': {key: 'menu.item1.bg', value: '/images/udon-noodle-texture.jpg'},
  'menu.item1.title': {key: 'menu.item1.title', value: '캐시 메뉴'},
  'menu.item2.bg': {key: 'menu.item2.bg', value: ''}
}));
let release;
window.menuPhotoReply = new Promise(resolve => { release = resolve; });
window.releaseMenuPhotoReply = release;
window.fetch = async function (url) {
  if (!String(url).startsWith('/tables/site_content?search=menu.')) throw new Error('Unexpected API request: ' + url);
  window.menuPhotoRequests.push(String(url));
  const data = await window.menuPhotoReply;
  return new Response(JSON.stringify({data, total: data.length}), {status: 200, headers: {'Content-Type': 'application/json'}});
};
