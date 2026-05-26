/**
 * auth-nav.js
 * Script cek status login & update navbar secara otomatis.
 * Include di semua halaman: <script src="scripts/auth-nav.js"></script>
 */

(async function initAuthNav() {
  const authItem = document.getElementById('navAuthItem');
  if (!authItem) return;

  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();

    if (data.logged_in) {
      // Tampilkan info user + tombol logout
      authItem.innerHTML = `
        <div class="nav-user-info">
          <div class="nav-user-avatar">👤</div>
          <span>${data.user.username}</span>
          <button class="btn-nav-logout" onclick="logoutUser()">Keluar</button>
        </div>`;
    } else {
      // Tampilkan tombol Login
      authItem.innerHTML = `<a href="login.html" class="btn-nav-login">Masuk</a>`;
    }
  } catch (e) {
    // Server belum jalan / offline — tetap tampilkan tombol Login
    authItem.innerHTML = `<a href="login.html" class="btn-nav-login">Masuk</a>`;
  }
})();

async function logoutUser() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch(e) {}
  window.location.reload();
}
