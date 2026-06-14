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
const emailModal    = document.getElementById("emailModal");
const modalEmail    = document.getElementById("modalEmail");
const resendLink    = document.getElementById("resendLink");

let registeredEmail = null;
let resendCooldown  = 0;

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
  submitText.textContent = state ? "Memproses..." : "Buat Akun";
}

function toggleEye(inputId, iconId){
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);
  const isPass = input.type === "password";
  input.type = isPass ? "text" : "password";
  icon.innerHTML = isPass
    ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}

// ─── Password strength ─────────────────────────────────────────────
const levels = [
  { w:"20%", color:"#ef4444", text:"Sangat lemah" },
  { w:"40%", color:"#f97316", text:"Lemah" },
  { w:"60%", color:"#eab308", text:"Cukup" },
  { w:"80%", color:"#22c55e", text:"Kuat" },
  { w:"100%",color:"#10b981", text:"Sangat kuat" },
];

function checkStrength(val){
  const fill  = document.getElementById("strengthFill");
  const label = document.getElementById("strengthLabel");

  const reqs = {
    len:   val.length >= 8,
    upper: /[A-Z]/.test(val),
    num:   /[0-9]/.test(val),
    sym:   /[^A-Za-z0-9]/.test(val),
  };

  // Update pills
  Object.entries(reqs).forEach(([key, met]) => {
    document.getElementById("req-" + key).classList.toggle("met", met);
  });

  if(!val){ fill.style.width = "0"; label.textContent = ""; return; }

  const score = Object.values(reqs).filter(Boolean).length;
  if(score === 0){ fill.style.width = "0"; label.textContent = ""; return; }
  const lvl   = levels[Math.min(score - 1, 4)];
  fill.style.width      = lvl.w;
  fill.style.background = lvl.color;
  label.style.color     = lvl.color;
  label.textContent     = lvl.text;
}

function showEmailModal(email){
  registeredEmail = email;
  modalEmail.textContent = email;
  emailModal.style.display = "flex";
  startResendCooldown();
}

function goToLogin(){
  window.location.href = "/login";
}

function startResendCooldown(){
  resendCooldown = 60;
  updateResendUI();
  const timer = setInterval(() => {
    resendCooldown--;
    updateResendUI();
    if(resendCooldown <= 0) clearInterval(timer);
  }, 1000);
}

function updateResendUI(){
  if(resendCooldown > 0){
    resendLink.textContent = `Kirim ulang (${resendCooldown}s)`;
    resendLink.classList.add("disabled");
  } else {
    resendLink.textContent = "Kirim ulang";
    resendLink.classList.remove("disabled");
  }
}

async function resendEmail(){
  if(resendCooldown > 0 || !registeredEmail) return;

  const { error } = await client.auth.resend({
    type: "signup",
    email: registeredEmail
  });

  if(error){
    resendLink.textContent = "Gagal, coba lagi";
    setTimeout(updateResendUI, 2000);
    return;
  }

  startResendCooldown();
}

// ─── Email register ────────────────────────────────────────────────
async function handleRegister(){
  const name    = document.getElementById("nameInput").value.trim();
  const email   = document.getElementById("emailInput").value.trim();
  const phone   = document.getElementById("phoneInput").value.trim();
  const pass    = document.getElementById("passInput").value;
  const confirm = document.getElementById("confirmInput").value;

  alertError.style.display   = "none";
  alertSuccess.style.display = "none";

  if(!name){
    showError("Nama tidak boleh kosong."); return;
  }
  if(name.length < 3){
    showError("Nama minimal 3 karakter."); return;
  }
  if(!email){
    showError("Email tidak boleh kosong."); return;
  }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    showError("Format email tidak valid."); return;
  }
  if(!phone){
    showError("No. telepon tidak boleh kosong."); return;
  }
  if(!/^(08|628|\+628)[0-9]{7,12}$/.test(phone)){
    showError("Format no. telepon tidak valid. Contoh: 08xxxxxxxxxx"); return;
  }
  if(!pass || pass.length < 8){
    showError("Password minimal 8 karakter."); return;
  }
  if(!/[A-Z]/.test(pass)){
    showError("Password harus mengandung minimal 1 huruf besar."); return;
  }
  if(!/[0-9]/.test(pass)){
    showError("Password harus mengandung minimal 1 angka."); return;
  }
  if(pass !== confirm){
    showError("Konfirmasi password tidak cocok."); return;
  }
  if(!turnstileToken){
    showError("Selesaikan verifikasi CAPTCHA dulu."); return;
  }

  setLoading(true);

  // Cek apakah email sudah terdaftar
  const { data: emailExists, error: checkErr } = await client.rpc('check_email_exists', { p_email: email });
  if(checkErr){
    setLoading(false);
    showError("Gagal memverifikasi email. Coba lagi.");
    return;
  }
  if(emailExists){
    setLoading(false);
    showError("Email ini sudah terdaftar. Silakan login atau gunakan email lain.");
    return;
  }

  // Langsung daftar
  const { data, error: signupErr } = await client.auth.signUp({
    email,
    password: pass,
    options:{
      emailRedirectTo: window.location.origin + "/login",
      data: { phone, full_name: name }
    }
  });

  setLoading(false);

  if(signupErr){
    showError("Gagal mendaftar: " + signupErr.message);
    return;
  }

  // Email confirmation diaktifkan → tampilkan popup cek email
  if(data?.user && !data?.session){
    showEmailModal(email);
    return;
  }

  // Langsung dapat session (email confirm disabled) → ke login
  if(data?.session){
    window.location.replace("/login");
    return;
  }

  showEmailModal(email);
}

// ─── Init: kalau sudah login redirect ke dashboard ─────────────────
const sessionTimeout = setTimeout(() => {
  loadingScreen.style.display = "none";
  mainWrap.style.display = "block";
}, 4000);

async function init(){
  try{
    const { data, error } = await client.auth.getSession();
    clearTimeout(sessionTimeout);

    if(!error && data?.session){
      // Sudah login → cek terms dulu
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
