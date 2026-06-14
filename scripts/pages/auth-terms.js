/* Extracted from page inline <script>. */

const client = supabase.createClient(
  window.RANZAI_CONFIG.SUPABASE_URL,
  window.RANZAI_CONFIG.SUPABASE_ANON_KEY
);

const loadingScreen = document.getElementById("loadingScreen");
const mainWrap      = document.getElementById("mainWrap");

function toggleAgreeBtn(){
  const checked = document.getElementById('agreeCheckbox').checked;
  document.getElementById('agreeBtn').disabled = !checked;
}

async function init() {
  const { data: { session }, error } = await client.auth.getSession();

  if (error || !session) {
    loadingScreen.querySelector('.loading-box').innerHTML =
      '<p style="font-size:13px;color:#ef4444;font-weight:700">Sesi tidak ditemukan. Mengalihkan ke halaman login...</p>';
    setTimeout(() => window.location.replace('/login'), 2000);
    return;
  }

  const { data: profile } = await client
    .from('profiles')
    .select('terms_agreed')
    .eq('id', session.user.id)
    .single();

  if (profile?.terms_agreed) {
    window.location.replace('/dashboard');
    return;
  }

  loadingScreen.style.display = 'none';
  mainWrap.style.display = 'block';
}

async function handleAgree() {
  const btn     = document.getElementById('agreeBtn');
  const errorEl = document.getElementById('agreeError');

  btn.disabled = true;
  btn.textContent = 'Menyimpan...';
  errorEl.style.display = 'none';

  const { data: { session } } = await client.auth.getSession();
  if (!session) {
    errorEl.textContent = 'Sesi habis. Silakan login ulang.';
    errorEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Saya Setuju & Lanjutkan →';
    return;
  }

  const { error } = await client
    .from('profiles')
    .upsert({
      id: session.user.id,
      email: session.user.email,
      phone: session.user.user_metadata?.phone || null,
      terms_agreed: true
    }, { onConflict: 'id' });

  if (error) {
    errorEl.textContent = 'Gagal menyimpan. Coba lagi.';
    errorEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Saya Setuju & Lanjutkan →';
    return;
  }

  window.location.replace('/dashboard');
}

init();
