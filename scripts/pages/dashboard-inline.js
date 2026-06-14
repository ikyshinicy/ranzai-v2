/* Extracted from page inline <script>. */

/* ─────────────────────────────────────────
   DASHBOARD SCRIPT
   Translations & lang → /scripts/core/i18n.js
───────────────────────────────────────── */

/* ─────────────────────────────────────────
   SUPABASE CLIENT
───────────────────────────────────────── */
const RANZAI_CONFIG = window.RANZAI_CONFIG || {};

function getDashboardClient() {
  if (!window.supabase) {
    console.error("Supabase library belum terbaca.");
    return null;
  }
  if (window.RANZAI_SUPABASE) return window.RANZAI_SUPABASE;
  if (!RANZAI_CONFIG.SUPABASE_URL || !RANZAI_CONFIG.SUPABASE_ANON_KEY) {
    console.error("RANZAI_CONFIG belum terbaca. Pastikan /scripts/core/app.js tersedia.");
    return null;
  }
  window.RANZAI_SUPABASE = window.supabase.createClient(
    RANZAI_CONFIG.SUPABASE_URL,
    RANZAI_CONFIG.SUPABASE_ANON_KEY
  );
  return window.RANZAI_SUPABASE;
}

/* ─────────────────────────────────────────
   UI HELPERS
───────────────────────────────────────── */
function openSidebar()  { document.body.classList.add("sidebar-open"); }
function closeSidebar() { document.body.classList.remove("sidebar-open"); }
function hideLoading()  {
  const el = document.getElementById("loadingScreen");
  if (el) el.style.display = "none";
}

function updateCoinUI(balance) {
  const creditEl    = document.getElementById("creditNumber");
  const sidebarCoin = document.getElementById("sidebarCoinBalance");
  const val = balance ?? 0;
  if (creditEl)    creditEl.textContent = val;
  if (sidebarCoin) sidebarCoin.textContent = val + " coin";
}

function updateRzaIdUI(rzaId) {
  const el = document.getElementById("sidebarRzaId");
  if (el) el.textContent = rzaId || "—";
}

/* ─────────────────────────────────────────
   FETCH FUNCTIONS
───────────────────────────────────────── */
async function fetchCoinBalance(client, userId) {
  try {
    const { data, error } = await client
      .from("coin_balance")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();
    if (!error) updateCoinUI(data?.balance);
  } catch(e) {
    console.warn("Gagal fetch coin_balance:", e);
  }
}

async function fetchRzaId(client, userId) {
  try {
    const { data, error } = await client
      .from("profiles")
      .select("rza_id")
      .eq("id", userId)
      .maybeSingle();
    if (!error) updateRzaIdUI(data?.rza_id);
  } catch(e) {
    console.warn("Gagal fetch rza_id:", e);
  }
}

async function fetchActivityLog(client, userId) {
  try {
    const { data, error } = await client
      .from("coin_logs")
      .select("type, amount, tool, note, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8);

    if (error || !data) {
      renderActivityLog([]);
      return;
    }

    // Update stats
    const usageLogs = data.filter(l => l.type === "usage" || l.type === "deduct");
    const statEl = document.getElementById("statTotalGenerate");
    if (statEl) statEl.textContent = usageLogs.length;

    const lastToolEl = document.getElementById("statLastTool");
    const lastUsage = data.find(l => l.tool && l.tool !== "NULL");
    if (lastToolEl && lastUsage) lastToolEl.textContent = lastUsage.tool;

    window._activityLogCache = data;
    renderActivityLog(data);
  } catch(e) {
    console.warn("Gagal fetch coin_logs:", e);
    renderActivityLog([]);
  }
}

function renderActivityLog(logs) {
  const list = document.getElementById("activityList");
  if (!list) return;

  list.innerHTML = "";

  if (!logs || !logs.length) {
    list.innerHTML = `<p class="empty-note">${t("activity_empty")}</p>`;
    return;
  }

  logs.forEach(log => {
    const isTopup = log.type === "topup";
    const amountNum = Number(log.amount);
    const amountDisplay = amountNum > 0 ? `+${amountNum}` : `${amountNum}`;
    const statusClass = amountNum > 0
      ? "activity-status activity-status--topup"
      : "activity-status activity-status--deduct";

    const date = new Date(log.created_at);
    const timeStr = date.toLocaleDateString(window.getLang() === "id" ? "id-ID" : "en-US", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    });

    const iconHtml = isTopup
      ? `<img src="/assets/icons/r-coin.png" alt="coin" class="activity-coin-img"/>`
      : `<span class="activity-dot-icon">${log.type === "usage" ? "⚡" : "✦"}</span>`;

    const labelKey = isTopup ? "activity_topup"
      : log.type === "usage" ? "activity_usage"
      : "activity_deduct";

    const noteText = log.note || (log.tool ? log.tool : t(labelKey));

    list.innerHTML += `
      <div class="activity-item">
        <div class="activity-left">
          <div class="activity-dot">${iconHtml}</div>
          <div>
            <div class="activity-title">${noteText}</div>
            <div class="activity-time">${timeStr}</div>
          </div>
        </div>
        <div class="${statusClass}">${amountDisplay} coin</div>
      </div>
    `;
  });
}


function openTutorial() {
  const modal = document.getElementById("tutorialModal");
  if (!modal) return;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("tutorial-open");
}

function closeTutorial() {
  const modal = document.getElementById("tutorialModal");
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("tutorial-open");
}

function setTutorialTab(tab) {
  document.querySelectorAll("[data-tutorial-tab]").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-tutorial-tab") === tab);
  });
  document.querySelectorAll("[data-tutorial-panel]").forEach(panel => {
    panel.classList.toggle("active", panel.getAttribute("data-tutorial-panel") === tab);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeTutorial();
});

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
async function initDashboard() {
  // Apply language — read from localStorage via i18n.js
  const _lang = window.getLang();
  document.documentElement.lang = _lang;
  document.getElementById("lang-en")?.classList.toggle("active", _lang === "en");
  document.getElementById("lang-id")?.classList.toggle("active", _lang === "id");
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const val = window.t(key);
    if (el.tagName !== "INPUT") el.textContent = val;
  });

  const client  = getDashboardClient();
  const emailEl = document.getElementById("userEmail");

  if (!client) { hideLoading(); return; }

  try {
    const { data: sessionData } = await client.auth.getSession();
    const session = sessionData?.session ?? null;

    if (!session || !session.user) {
      hideLoading();
      window.location.replace("/login/");
      return;
    }

    const user = session.user;
    if (emailEl) emailEl.textContent = user.email || "User RanzAI";

    hideLoading();

    Promise.all([
      fetchCoinBalance(client, user.id),
      fetchRzaId(client, user.id),
      fetchActivityLog(client, user.id),
    ]);

    // Realtime: coin balance
    client
      .channel("coin_balance_realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "coin_balance",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const newBalance = payload.new?.balance;
        if (newBalance !== undefined) updateCoinUI(newBalance);
      })
      .subscribe();

    // Realtime: activity log
    client
      .channel("coin_logs_realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "coin_logs",
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchActivityLog(client, user.id);
      })
      .subscribe();

    // Handle topup redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("topup") === "success") {
      setTimeout(() => fetchCoinBalance(client, user.id), 2000);
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, "", cleanUrl);
    }

  } catch(error) {
    console.warn("Dashboard session tidak valid:", error);
    hideLoading();
    window.location.replace("/login/");
  }
}

async function logoutUser() {
  const client = getDashboardClient();
  try { if (client) await client.auth.signOut(); } catch(err) {}
  window.location.replace("/login/");
}

/* ─────────────────────────────────────────
   SAFE INIT — tunggu Supabase + RANZAI_CONFIG siap
   sebelum menjalankan initDashboard()
───────────────────────────────────────── */
function waitForSupabase(callback, attempt = 0) {
  const maxAttempts = 50; // 50 × 100ms = 5 detik timeout
  if (window.supabase && window.RANZAI_CONFIG?.SUPABASE_URL) {
    callback();
  } else if (attempt < maxAttempts) {
    setTimeout(() => waitForSupabase(callback, attempt + 1), 100);
  } else {
    console.error("Supabase atau RANZAI_CONFIG tidak tersedia setelah 5 detik.");
    hideLoading();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => waitForSupabase(initDashboard));
} else {
  waitForSupabase(initDashboard);
}

/* ═══════════════════════════════════════
   ONBOARDING TOUR
═══════════════════════════════════════ */
const TOUR_KEY     = "ranzai_tour_done";
const TOTAL_STEPS  = 5;
let   tourStep     = 1;

// Tour translations loaded from /scripts/core/i18n.js via window.t()

function buildDots() {
  const wrap = document.getElementById("tourDots");
  wrap.innerHTML = "";
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const d = document.createElement("div");
    d.className = "tour-dot" + (i === tourStep ? " active" : "");
    wrap.appendChild(d);
  }
}

function updateTourUI() {
  const prevBtn  = document.getElementById("tourPrev");
  const nextBtn  = document.getElementById("tourNext");
  const skipBtn  = document.getElementById("tourSkip");
  if (!prevBtn) return;

  prevBtn.textContent = window.t("tour_prev");
  nextBtn.textContent = tourStep === TOTAL_STEPS ? window.t("tour_finish") : window.t("tour_next");
  skipBtn.textContent = window.t("tour_skip");
  prevBtn.style.display = tourStep === 1 ? "none" : "";
  buildDots();
}

function showTourStep(step) {
  document.querySelectorAll(".tour-step").forEach(el => el.classList.remove("active"));
  const target = document.querySelector(`.tour-step[data-step="${step}"]`);
  if (target) target.classList.add("active");
  updateTourUI();
}

function startTour() {
  tourStep = 1;
  showTourStep(1);
  document.getElementById("tourBackdrop").classList.add("visible");
  document.getElementById("tourPopup").classList.add("visible");
}

function endTour() {
  localStorage.setItem(TOUR_KEY, "1");
  document.getElementById("tourBackdrop").classList.remove("visible");
  document.getElementById("tourPopup").classList.remove("visible");
}

document.getElementById("tourNext").addEventListener("click", () => {
  if (tourStep >= TOTAL_STEPS) { endTour(); return; }
  tourStep++;
  showTourStep(tourStep);
});

document.getElementById("tourPrev").addEventListener("click", () => {
  if (tourStep <= 1) return;
  tourStep--;
  showTourStep(tourStep);
});

document.getElementById("tourSkip").addEventListener("click", endTour);

// Auto-start for new users after dashboard loads
window.addEventListener("load", () => {
  if (!localStorage.getItem(TOUR_KEY)) {
    setTimeout(startTour, 800);
  }
});

// Allow re-open tour (e.g. from sidebar link in future)
window.openTour = startTour;
