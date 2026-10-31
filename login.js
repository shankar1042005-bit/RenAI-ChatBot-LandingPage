/* RenAI ChatBot - member login sheet
   Loads login.html, puts its <dialog id="memberLoginSheet"> into the page, and wires up the form.
   The Login button (#openLoginSheet) is in the navigation bar of final.html. */
document.addEventListener('DOMContentLoaded', function () {
  const standalone = document.body.hasAttribute('data-login-standalone');   /* login.html opened on its own */
  const openLoginBtn = document.getElementById('openLoginSheet');
  let loginSheet = document.getElementById('memberLoginSheet');
  let loading = null;

  /* Fetch login.html once and add its login sheet to this page. */
  function loadSheet() {
    if (loginSheet) return Promise.resolve(loginSheet);
    if (!loading) {
      loading = fetch('login.html')
        .then((r) => { if (!r.ok) throw new Error('login.html not found'); return r.text(); })
        .then((text) => {
          const doc = new DOMParser().parseFromString(text, 'text/html');
          const found = doc.getElementById('memberLoginSheet');
          if (!found) throw new Error('login sheet missing in login.html');
          loginSheet = document.importNode(found, true);
          document.body.appendChild(loginSheet);
          wire(loginSheet);
          return loginSheet;
        });
    }
    return loading;
  }

  /* Close button, backdrop click, form submit and "Forgot Password?". */
  function wire(sheet) {
    const closeLoginBtn = sheet.querySelector('#closeLoginSheet');
    const loginForm = sheet.querySelector('#memberLoginForm');
    const loginMessage = sheet.querySelector('#loginMessage');
    const forgotPassword = sheet.querySelector('#forgotPassword');

    if (closeLoginBtn) closeLoginBtn.addEventListener('click', () => sheet.close());
    sheet.addEventListener('click', (event) => { if (event.target === sheet) sheet.close(); });

    if (loginForm) loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const username = sheet.querySelector('#loginUsername').value.trim();
      const password = sheet.querySelector('#loginPassword').value;
      if (!username || !password) { loginMessage.textContent = 'Please enter your username and password.'; return; }
      loginMessage.textContent = 'Login form is ready. Connect your authentication system to verify credentials.';
    });

    if (forgotPassword) forgotPassword.addEventListener('click', (event) => {
      event.preventDefault();
      loginMessage.textContent = 'Please contact the administrator to reset your password.';
    });
  }

  /* login.html opened directly: show the sheet, and go back to the site when it is closed. */
  if (standalone) {
    if (!loginSheet) return;
    wire(loginSheet);
    loginSheet.addEventListener('close', () => { window.location.href = 'final.html'; });
    loginSheet.showModal();
    return;
  }

  if (!openLoginBtn) return;

  /* Fetch early so the sheet opens instantly (a failure here is handled on click). */
  loadSheet().catch(() => {});

  openLoginBtn.addEventListener('click', () => {
    const menu = document.getElementById('mobile-menu');
    if (menu && !menu.hasAttribute('hidden')) {
      menu.setAttribute('hidden', '');
      const t = document.querySelector('.menu-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    }
    loadSheet()
      .then((sheet) => { if (!sheet.open) sheet.showModal(); })
      .catch(() => { window.location.href = 'login.html'; });   /* e.g. final.html opened by double-click (file://) */
  });
});
