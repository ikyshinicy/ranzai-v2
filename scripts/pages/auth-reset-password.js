/* Extracted from page inline <script>. */

const RANZAI_CONFIG = window.RANZAI_CONFIG || {};

const client = supabase.createClient(
  RANZAI_CONFIG.SUPABASE_URL,
  RANZAI_CONFIG.SUPABASE_ANON_KEY
);

const mainWrap    = document.getElementById("mainWrap");
const formCard    = document.getElementById("formCard");
const invalidCard = document.getElementById("invalidCard");
const alertError  = document.getElementById("alertError");
const alertSuccess= document.getElementById("alertSuccess");
const submitBtn   = document.getElementById("submitBtn");
const submitText  = document.getElementById("submitText");
const spinner     = document.getElementById("spinner");

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
  submitText.textContent = state ? "Menyimpan..." : "Simpan Password Baru";
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

function checkStrength(val){
  const fill  = document.getElementById("strengthFill");
  const label = document.getElementById("strengthLabel");
  if(!val){ fill.style.width="0"; label.textContent=""; return; }

  let score = 0;
  if(val.length >= 6)  score++;
  if(val.length >= 10) score++;
  if(/[A-Z]/.test(val)) score++;
  if(/[0-9]/.test(val)) score++;
  if(/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { w:"20%", color:"#ef4444", text:"Sangat lemah" },
    { w:"40%", color:"#f97316", text:"Lemah" },
    { w:"60%", color:"#eab308", text:"Cukup" },
    { w:"80%", color:"#22c55e", text:"Kuat" },
    { w:"100%",color:"#10b981", text:"Sangat kuat" },
  ];

  const lvl = levels[Math.min(score - 1, 4)] || levels[0];
  fill.style.width  = lvl.w;
  fill.style.background = lvl.color;
  label.style.color = lvl.color;
  label.textContent = lvl.text;
}

async function handleReset(){
  const pass    = document.getElementById("passInput").value;
  const confirm = document.getElementById("confirmInput").value;

  alertError.style.display = "none";
  alertSuccess.style.display = "none";

  if(!pass || pass.length < 6){
    showError("Password minimal 6 karakter.");
    return;
  }

  if(pass !== confirm){
    showError("Konfirmasi password tidak cocok.");
    return;
  }

  setLoading(true);

  const { error } = await client.auth.updateUser({ password: pass });

  setLoading(false);

  if(error){
    showError("Gagal mengubah password: " + error.message);
    return;
  }

  showSuccess("Password berhasil diubah! Mengalihkan ke dashboard...");
  submitBtn.style.display = "none";

  setTimeout(() => {
    window.location.replace("/dashboard");
  }, 2000);
}

// ─── Cek apakah ada session dari link reset ───────────────────────────
// Supabase otomatis parse token dari URL hash dan set session
async function init(){
  const hash        = window.location.hash;
  const queryParams = new URLSearchParams(window.location.search);

  // Deteksi recovery flow: PKCE (?code=) atau legacy hash (#access_token + type=recovery)
  const isPKCE   = queryParams.has("code");
  const isLegacy = hash.includes("type=recovery") && hash.includes("access_token");

  if(!isPKCE && !isLegacy){
    // Bukan dari link reset password → cek apakah user sudah login
    const { data } = await client.auth.getSession();
    mainWrap.style.display = "block";
    if(data?.session){
      // User login normal, redirect ke dashboard
      window.location.replace("/dashboard");
    } else {
      // Tidak ada session & bukan recovery link → link tidak valid
      formCard.style.display    = "none";
      invalidCard.style.display = "block";
    }
    return;
  }

  // Tunggu Supabase exchange code / parse hash jadi session
  await new Promise(r => setTimeout(r, 400));

  const { data, error } = await client.auth.getSession();

  mainWrap.style.display = "block";

  if(error || !data?.session){
    formCard.style.display    = "none";
    invalidCard.style.display = "block";
    return;
  }

  formCard.style.display = "block";
}

init();
// ─────────────────────────────────────────────────────────────────────
