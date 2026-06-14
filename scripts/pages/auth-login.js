/* Extracted from page inline <script>. */

const RANZAI_CONFIG = window.RANZAI_CONFIG || {};

const client = supabase.createClient(
  RANZAI_CONFIG.SUPABASE_URL,
  RANZAI_CONFIG.SUPABASE_ANON_KEY
);

const loadingScreen = document.getElementById("loadingScreen");
const mainWrap      = document.getElementById("mainWrap");
const alertError    = document.getElementById("alertError");
const alertSuccess  = document.getElementById("alertSuccess");
const submitBtn     = document.getElementById("submitBtn");
const submitText    = document.getElementById("submitText");
const spinner       = document.getElementById("spinner");

let turnstileToken = null;
function onTurnstileSuccess(token){ turnstileToken = token; }

function showError(msg){
  alertError.textContent = msg;
  alertError.style.display = "block";
  alertSuccess.style.display = "none";
}
function showSuccess(msg){
  alertSuccess.textContent = msg;
  alertSuccess.style.display = "block";
  alertError.style.display = "none";
}
function setLoading(state){
  submitBtn.disabled = state;
  spinner.style.display = state ? "block" : "none";
  submitText.textContent = state ? "Memproses..." : "Masuk";
}

function toggleEye(){
  const input = document.getElementById("passInput");
  const icon  = document.getElementById("eyeIcon");
  const isPass = input.type === "password";
  input.type = isPass ? "text" : "password";
  icon.innerHTML = isPass
    ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}

// ─── Google login ──────────────────────────────────────────────────
async function loginWithGoogle(){
  const btn = document.getElementById("googleBtn");
  btn.disabled = true;
  btn.style.opacity = ".6";

  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options:{
      redirectTo: window.location.origin + "/login"
    }
  });

  if(error){
    showError("Gagal masuk dengan Google. Coba lagi.");
    btn.disabled = false;
    btn.style.opacity = "1";
  }
}

// ─── Email login ───────────────────────────────────────────────────
async function handleLogin(){
  const email = document.getElementById("emailInput").value.trim();
  const pass  = document.getElementById("passInput").value;

  alertError.style.display   = "none";
  alertSuccess.style.display = "none";

  if(!email){
    showError("Email tidak boleh kosong."); return;
  }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    showError("Format email tidak valid."); return;
  }
  if(!pass){
    showError("Password tidak boleh kosong."); return;
  }
  if(!turnstileToken){
    showError("Selesaikan verifikasi CAPTCHA dulu."); return;
  }

  setLoading(true);

  const { data, error } = await client.auth.signInWithPassword({ email, password: pass });

  setLoading(false);

  if(error){
    // Pesan error spesifik yang lebih ramah
    if(error.message === "Invalid login credentials"){
      showError("Email atau password salah. Belum punya akun? Daftar dulu.");
    } else if(error.message.includes("Email not confirmed")){
      showError("Email belum dikonfirmasi. Cek inbox kamu dan klik link konfirmasi.");
    } else {
      showError("Gagal masuk: " + error.message);
    }
    return;
  }

  if(data?.session){
    // Cek terms_agreed — safety net
    const { data: profile } = await client
      .from("profiles")
      .select("terms_agreed")
      .eq("id", data.session.user.id)
      .single();

    if(profile?.terms_agreed){
      window.location.replace("/dashboard");
    } else {
      // Belum agree (edge case) → ke terms dulu
      window.location.replace("/auth/terms");
    }
  }
}

// ─── Forgot password ───────────────────────────────────────────────
function openForgot(e){
  e.preventDefault();
  document.getElementById("forgotModal").style.display = "flex";
  document.getElementById("forgotEmail").value = document.getElementById("emailInput").value || "";
  document.getElementById("forgotError").style.display   = "none";
  document.getElementById("forgotSuccess").style.display = "none";
}

function closeForgot(){
  document.getElementById("forgotModal").style.display = "none";
}

async function sendReset(){
  const email  = document.getElementById("forgotEmail").value.trim();
  const errEl  = document.getElementById("forgotError");
  const okEl   = document.getElementById("forgotSuccess");
  const btn    = document.getElementById("resetBtn");

  errEl.style.display = "none";
  okEl.style.display  = "none";

  if(!email){
    errEl.textContent = "Email tidak boleh kosong.";
    errEl.style.display = "block"; return;
  }

  btn.disabled = true;
  btn.textContent = "Mengirim...";

  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/reset-password"
  });

  btn.disabled = false;
  btn.textContent = "Kirim Link Reset";

  if(error){
    errEl.textContent = "Gagal: " + error.message;
    errEl.style.display = "block"; return;
  }

  okEl.textContent = "Link reset berhasil dikirim! Cek email kamu.";
  okEl.style.display = "block";
}

// ─── Deteksi redirect dari link aktivasi email ─────────────────────
// Supabase menyisipkan #access_token=...&type=signup di URL setelah
// user klik link konfirmasi email.
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const confirmType = hashParams.get("type"); // "signup" | "email_change" | "recovery" | dll
const isEmailConfirmation = confirmType === "signup" || confirmType === "email_change" || confirmType === "invite";

// ─── Init: kalau sudah login, redirect langsung ────────────────────
const sessionTimeout = setTimeout(() => {
  loadingScreen.style.display = "none";
  mainWrap.style.display = "block";
}, 4000);

async function init(){
  try{
    const { data, error } = await client.auth.getSession();
    clearTimeout(sessionTimeout);

    if(!error && data?.session){

      if(isEmailConfirmation){
        // Sesi otomatis dari link aktivasi → jangan langsung masuk.
        // Sign out dulu, lalu minta user login manual (email/password atau Google).
        await client.auth.signOut();

        // Bersihkan hash token dari URL
        history.replaceState(null, "", window.location.pathname);

        loadingScreen.style.display = "none";
        mainWrap.style.display = "block";
        showSuccess("Email berhasil diaktivasi! Silakan masuk untuk melanjutkan.");
        return;
      }

      const { data: profile } = await client
        .from("profiles")
        .select("terms_agreed")
        .eq("id", data.session.user.id)
        .single();

      if(profile?.terms_agreed){
        window.location.replace("/dashboard");
      } else {
        window.location.replace("/auth/terms");
      }
      return;
    }

    loadingScreen.style.display = "none";
    mainWrap.style.display = "block";
  } catch(e){
    clearTimeout(sessionTimeout);
    loadingScreen.style.display = "none";
    mainWrap.style.display = "block";
  }
}

init();
