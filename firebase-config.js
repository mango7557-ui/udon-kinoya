// Firebase 공유 설정 (Firestore 실시간 DB + Hosting — API 키 암호화 보호 적용)
(function () {
  var SALT = 'kinoya_sec_2026_v1';
  function encryptKey(plain) {
    var str = String(plain || '').trim();
    if (!str) return '';
    if (str.indexOf('enc:v1:') === 0) return str;
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i) ^ SALT.charCodeAt(i % SALT.length));
    }
    return 'enc:v1:' + btoa(String.fromCharCode.apply(null, bytes));
  }
  function decryptKey(cipher) {
    var str = String(cipher || '').trim();
    if (!str) return '';
    var rawB64 = str.indexOf('enc:v1:') === 0 ? str.slice(7) : str;
    try {
      var bin = atob(rawB64);
      var out = '';
      for (var i = 0; i < bin.length; i++) {
        out += String.fromCharCode(bin.charCodeAt(i) ^ SALT.charCodeAt(i % SALT.length));
      }
      return out;
    } catch (e) {
      return str;
    }
  }
  window.KinoyaCrypto = { encryptKey: encryptKey, decryptKey: decryptKey };
  var encApiKey = 'enc:v1:KiAUDioYHhI8VgdTUlxnOjAJDzs/HR8GACBdNSxhBGBMLz9wLRMN';
  window.FIREBASE_CONFIG = window.FIREBASE_CONFIG || {
    apiKey: decryptKey(encApiKey),
    apiKeyEncrypted: encApiKey,
    authDomain: 'gen-lang-client-0844079951.firebaseapp.com',
    projectId: 'gen-lang-client-0844079951',
    storageBucket: 'gen-lang-client-0844079951.firebasestorage.app',
    messagingSenderId: '495632671671',
    appId: '1:495632671671:web:1627dd6653a88263b43e32',
    collection: 'site_config',
    namespace: 'kinoya'
  };
})();
