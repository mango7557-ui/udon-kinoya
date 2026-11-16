/* Firebase administrator session; Firestore rules remain the authority. */
(function () {
  'use strict';
  const state = {user: null};
  window.KinoyaAdminAuth = state;
  state.ready = (async function () {
    const [appSdk, authSdk] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js')
    ]);
    const app = appSdk.getApps()[0] || appSdk.initializeApp(window.FIREBASE_CONFIG);
    const auth = authSdk.getAuth(app);
    await new Promise(resolve => authSdk.onAuthStateChanged(auth, user => { state.user = user; resolve(); }, () => resolve()));
    const bar = document.createElement('div');
    bar.style.cssText = 'padding:12px 20px;background:#f0eadf;color:#172735;display:flex;gap:12px;align-items:center;flex-wrap:wrap';
    const status = document.createElement('span');
    status.textContent = state.user ? '관리자 로그인: ' + state.user.email : '공유 사이트를 저장하려면 관리자 Google 계정으로 로그인하세요.';
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = state.user ? '로그아웃' : '관리자 Google 로그인';
    button.style.cssText = 'padding:8px 14px;background:#172735;color:white;border:0;border-radius:4px;cursor:pointer';
    button.addEventListener('click', async function () {
      button.disabled = true;
      try {
        if (auth.currentUser) await authSdk.signOut(auth);
        else await authSdk.signInWithPopup(auth, new authSdk.GoogleAuthProvider());
        location.reload();
      } catch (error) { status.textContent = '로그인 실패: ' + (error.message || '다시 시도해 주세요.'); button.disabled = false; }
    });
    bar.append(status, button); document.body.prepend(bar);
    state.token = async () => auth.currentUser ? auth.currentUser.getIdToken() : '';
  })().catch(function (error) { console.error('관리자 로그인 준비 실패', error); });
})();
