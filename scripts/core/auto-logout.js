// auto-logout.js
const AUTO_LOGOUT = (() => {
  const TIMEOUT_MS = 30 * 60 * 1000; // 30 menit
  const WARN_MS = 2 * 60 * 1000;     // warning 2 menit sebelum logout

  let logoutTimer = null;
  let warnTimer = null;
  let warnToast = null;

  const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

  function resetTimer() {
    clearTimeout(logoutTimer);
    clearTimeout(warnTimer);
    hideWarning();

    warnTimer = setTimeout(showWarning, TIMEOUT_MS - WARN_MS);
    logoutTimer = setTimeout(doLogout, TIMEOUT_MS);
  }

  function showWarning() {
    if (warnToast) return;

    warnToast = document.createElement('div');
    warnToast.id = 'auto-logout-warn';
    warnToast.innerHTML = `
      <span>⚠️ Sesi akan berakhir dalam 2 menit karena tidak ada aktivitas.</span>
      <button onclick="AUTO_LOGOUT.reset()">Tetap Login</button>
    `;
    Object.assign(warnToast.style, {
      position: 'fixed', bottom: '24px', right: '24px', zIndex: '9999',
      background: '#1e293b', color: '#f1f5f9', padding: '14px 18px',
      borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', gap: '12px',
      fontSize: '14px', maxWidth: '360px'
    });
    warnToast.querySelector('button').style.cssText =
      'background:#6366f1;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;white-space:nowrap;';

    document.body.appendChild(warnToast);
  }

  function hideWarning() {
    if (warnToast) {
      warnToast.remove();
      warnToast = null;
    }
  }

  async function doLogout() {
    hideWarning();
    EVENTS.forEach(e => document.removeEventListener(e, resetTimer));

    const client = window.RANZAI_SUPABASE;
    if (client) await client.auth.signOut();

    // FIX: Redirect ke landing page (ranz-ai.com) bukan /login
    window.location.href = 'https://ranz-ai.com';
  }

  function init() {
    EVENTS.forEach(e => document.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    console.log('[AutoLogout] Aktif — timeout 30 menit');
  }

  return { init, reset: resetTimer };
})();

document.addEventListener('DOMContentLoaded', AUTO_LOGOUT.init);
