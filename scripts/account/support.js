// /tool/support-ranzai/support.js
// RanzAI Support Tool — FAQ + Sosmed + Review
// Expose: RanzTools.support.render(container, config)

(function () {
  "use strict";

  const ACC = "#6C47FF";
  const SUPABASE_URL = 'https://cavouyzyasnuygkuwizy.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhdm91eXp5YXNudXlna3V3aXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjQzMDIsImV4cCI6MjA5NDQ0MDMwMn0.P9TepO4RLhxHv03ybUlwGMefCwkdjCnDwNpfqzAS2lo';

  const FAQ_LIST = [
    // Top Up & Pembayaran
    { q: "Cara top up Ranz Coin", icon: "ti-wallet", cat: "Pembayaran", a: "Buka menu Pembayaran, pilih paket yang kamu inginkan (Starter, Basic, Pro, atau Early Access), lalu selesaikan pembayaran via QRIS/transfer. Koin otomatis bertambah setelah pembayaran dikonfirmasi." },
    { q: "Kredit tidak bertambah setelah bayar", icon: "ti-credit-card", cat: "Pembayaran", a: "Tunggu beberapa menit, lalu refresh dashboard. Jika dalam 10 menit masih belum bertambah, hubungi support dengan menyertakan ID transaksi dan screenshot bukti pembayaran." },
    { q: "Berapa harga masing-masing paket?", icon: "ti-tag", cat: "Pembayaran", a: "Starter: 24 koin / Rp30.000 · Basic: 40 koin / Rp50.000 · Pro: 80 koin / Rp100.000 · Early Access: 120 koin / Rp75.000. Harga bisa berubah sewaktu-waktu." },
    { q: "Apakah koin punya masa kadaluarsa?", icon: "ti-clock", cat: "Pembayaran", a: "Tidak. Ranz Coin tidak memiliki masa kadaluarsa. Koin tetap ada di akun selama kamu tidak menggunakannya." },
    { q: "Metode pembayaran apa saja yang tersedia?", icon: "ti-building-bank", cat: "Pembayaran", a: "Saat ini tersedia QRIS dan transfer bank melalui gateway Mayar.id. Kami akan terus menambah metode pembayaran." },

    // Tools
    { q: "Berapa biaya per tool?", icon: "ti-coins", cat: "Tools", a: "Breakdown: gratis · Cut, Write, Gel: 1 koin · Design (AI image FLUX): 20 koin. Biaya dikenakan per penggunaan sukses." },
    { q: "Cara pakai Design tool (AI Image)", icon: "ti-palette", cat: "Tools", a: "Buka menu Design, tulis deskripsi gambar yang kamu inginkan dalam bahasa Indonesia atau Inggris, lalu klik Generate. Pastikan saldo minimal 20 koin sebelum generate." },
    { q: "Cara pakai Write tool", icon: "ti-pencil", cat: "Tools", a: "Buka menu Write, pilih jenis konten (caption, artikel, iklan, dll), masukkan brief atau kata kunci, lalu klik Generate. Menghabiskan 1 koin per generate." },
    { q: "Cara pakai Gel tool", icon: "ti-sparkles", cat: "Tools", a: "Gel adalah tool untuk generate teks kreatif dengan gaya unik. Masukkan topik atau ide, lalu klik Generate. Menghabiskan 1 koin per generate." },
    { q: "Gagal generate gambar", icon: "ti-photo-ai", cat: "Tools", a: "Pastikan koneksi internet stabil dan saldo koin mencukupi (minimal 20 koin untuk Design). Jika error terus terjadi, coba refresh halaman. Koin tidak terpotong jika generate gagal." },
    { q: "Apakah ada tool gratis?", icon: "ti-gift", cat: "Tools", a: "Ya! Tool Breakdown sepenuhnya gratis tanpa batas penggunaan. Tool lainnya menggunakan sistem koin." },

    // Akun
    { q: "Masalah login atau lupa password", icon: "ti-lock", cat: "Akun", a: "Di halaman login, klik 'Lupa Password' dan masukkan email yang terdaftar. Link reset password akan dikirim ke email kamu. Cek folder spam jika tidak muncul di inbox." },
    { q: "Cara daftar akun RanzAI", icon: "ti-user-plus", cat: "Akun", a: "Kunjungi ranz-ai.com, klik tombol Daftar/Register, isi email dan password, lalu verifikasi email. Kamu juga bisa login langsung dengan Google." },
    { q: "Cara mengganti password", icon: "ti-key", cat: "Akun", a: "Masuk ke Pengaturan Akun, pilih opsi Ganti Password, masukkan password lama dan password baru, lalu simpan. Jika lupa password lama, gunakan fitur Reset Password di halaman login." },
    { q: "Bisakah satu email dipakai di beberapa akun?", icon: "ti-at", cat: "Akun", a: "Tidak. Setiap email hanya bisa digunakan untuk satu akun RanzAI. Gunakan email berbeda untuk akun berbeda." },

    // Teknis
    { q: "Error saat menggunakan tool", icon: "ti-alert-circle", cat: "Teknis", a: "Coba refresh halaman terlebih dahulu. Jika error masih muncul, pastikan browser kamu up-to-date dan cookies tidak diblokir. Jika masih gagal, hubungi support dengan menyertakan screenshot error dan tool yang digunakan." },
    { q: "Apakah RanzAI bisa dipakai di HP?", icon: "ti-device-mobile", cat: "Teknis", a: "Ya, RanzAI dioptimalkan untuk mobile browser. Buka ranz-ai.com dari browser HP kamu (Chrome, Safari, dll) tanpa perlu install aplikasi." },
    { q: "Tool lambat atau tidak responsif", icon: "ti-wifi", cat: "Teknis", a: "Periksa koneksi internet kamu. Tool seperti Design bisa memakan waktu 10–30 detik untuk generate gambar berkualitas tinggi. Jangan tutup tab saat proses berlangsung." },
  ];

  const SOCMED = [
    { icon: "📸", name: "Instagram", user: "@ranzaiofficial", url: "https://www.instagram.com/ranzaiofficial" },
    { icon: "🧵", name: "Threads",   user: "@ranzaiofficial", url: "https://www.threads.net/@ranzaiofficial" },
    { icon: "𝕏",  name: "X / Twitter", user: "@ranzaiofficial", url: "https://x.com/ranzaiofficial" },
    { icon: "f",  name: "Facebook",  user: "RanzAI Official",  url: "https://www.facebook.com/profile.php?id=61590414760258" },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  function render(container, config) {
    container.innerHTML = "";
    container.style.cssText = "padding:0;background:transparent;";

    const root = document.createElement("div");
    root.innerHTML = buildHTML();
    container.appendChild(root);

    initFAQ(container);
    initReviewForm(container);
    loadReviews(container);
  }

  // ─── HTML ─────────────────────────────────────────────────────────────────

  function buildHTML() {
    const faqByCategory = {};
    FAQ_LIST.forEach(f => {
      if (!faqByCategory[f.cat]) faqByCategory[f.cat] = [];
      faqByCategory[f.cat].push(f);
    });

    const catColors = {
      "Pembayaran": "rgba(108,71,255,0.15)",
      "Tools":      "rgba(0,212,200,0.12)",
      "Akun":       "rgba(74,222,128,0.12)",
      "Teknis":     "rgba(248,113,113,0.12)",
    };
    const catIconColors = {
      "Pembayaran": ACC,
      "Tools":      "#00d4c8",
      "Akun":       "#4ade80",
      "Teknis":     "#f87171",
    };

    const faqHTML = Object.entries(faqByCategory).map(([cat, items]) => `
      <div class="sup-cat-header">
        <span class="sup-cat-dot" style="background:${catIconColors[cat] || ACC}"></span>
        ${cat}
      </div>
      ${items.map(f => `
        <div class="sup-faq-item">
          <div class="sup-faq-q">
            <div class="sup-faq-icon" style="background:${catColors[cat] || 'rgba(108,71,255,0.15)'};color:${catIconColors[cat] || ACC}">
              <i class="ti ${f.icon}"></i>
            </div>
            <span class="sup-faq-label">${f.q}</span>
            <i class="ti ti-chevron-down sup-faq-chevron"></i>
          </div>
          <div class="sup-faq-answer">${f.a}</div>
        </div>
      `).join("")}
    `).join("");

    const socmedHTML = SOCMED.map(s => `
      <a class="sup-social-card" href="${s.url}" target="_blank" rel="noopener">
        <div class="sup-social-top">
          <div class="sup-social-icon">${s.icon}</div>
          <div class="sup-arrow">↗</div>
        </div>
        <div>
          <div class="sup-social-name">${s.name}</div>
          <div class="sup-social-user">${s.user}</div>
        </div>
      </a>
    `).join("");

    return `
<style>
/* ── Reset & Base ── */
.sup-root *{box-sizing:border-box}
.sup-root{font-family:'Montserrat','Syne',sans-serif;color:#0d1f3c;padding:24px;min-height:calc(100vh - 80px);background:#f5f6fa}
/* ── Layout ── */
.sup-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
.sup-full{margin-bottom:20px}
@media(max-width:860px){.sup-grid{grid-template-columns:1fr}}
/* ── Panel ── */
.sup-panel{background:#ffffff;border:1px solid rgba(108,71,255,.11);border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(108,71,255,.06)}
.sup-panel-head{padding:22px 22px 0}
.sup-panel-title{font-size:17px;font-weight:900;letter-spacing:-.02em;color:#0d1f3c;margin:0 0 4px}
.sup-panel-desc{font-size:12.5px;color:#6b84a8;margin:0 0 18px;line-height:1.6;font-weight:500}
/* ── Contact Items ── */
.sup-contact-list{display:flex;flex-direction:column;gap:10px;padding:0 22px 22px}
.sup-contact-item{display:flex;align-items:center;gap:13px;padding:14px 16px;border:1px solid rgba(108,71,255,.12);border-radius:14px;background:#fff;text-decoration:none;color:#0d1f3c;transition:.18s}
.sup-contact-item:hover{transform:translateY(-1px);border-color:rgba(108,71,255,.25);box-shadow:0 4px 14px rgba(108,71,255,.08)}
.sup-contact-icon{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,rgba(108,71,255,.12),rgba(0,212,200,.12));display:grid;place-items:center;font-size:19px;flex-shrink:0}
.sup-contact-label{font-size:11px;color:#6b84a8;font-weight:700;margin-bottom:2px}
.sup-contact-value{font-size:13.5px;font-weight:800;color:#0d1f3c}
.sup-note{margin:0 22px 22px;padding:14px 16px;border-radius:13px;border:1px solid rgba(0,212,200,.2);background:rgba(0,212,200,.07);color:#23506c;font-size:12px;line-height:1.65;font-weight:600}
/* ── Social Grid ── */
.sup-social-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 22px 22px}
.sup-social-card{min-height:106px;display:flex;flex-direction:column;justify-content:space-between;padding:16px;background:#fafafa;border:1px solid rgba(108,71,255,.1);border-radius:14px;color:#0d1f3c;text-decoration:none;transition:.18s}
.sup-social-card:hover{transform:translateY(-1px);border-color:rgba(108,71,255,.25);box-shadow:0 4px 14px rgba(108,71,255,.08)}
.sup-social-top{display:flex;justify-content:space-between;align-items:center}
.sup-social-icon{width:38px;height:38px;border-radius:12px;background:#eef0ff;display:grid;place-items:center;font-size:18px;font-weight:900}
.sup-arrow{color:${ACC};font-weight:900;font-size:16px}
.sup-social-name{font-size:14px;font-weight:900;margin-top:14px;color:#0d1f3c}
.sup-social-user{font-size:11.5px;color:#6b84a8;font-weight:700;margin-top:3px}
/* ── FAQ ── */
.sup-faq-body{padding:0 0 8px}
.sup-cat-header{display:flex;align-items:center;gap:8px;padding:14px 22px 8px;font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#6b84a8}
.sup-cat-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.sup-faq-item{border-bottom:1px solid rgba(108,71,255,.07)}
.sup-faq-item:last-child{border-bottom:none}
.sup-faq-q{display:flex;align-items:center;gap:10px;padding:12px 22px;cursor:pointer;transition:background .12s}
.sup-faq-q:hover{background:rgba(108,71,255,.04)}
.sup-faq-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.sup-faq-label{font-size:13px;color:#0d1f3c;flex:1;font-weight:600}
.sup-faq-chevron{color:#6b84a8;transition:transform .2s;flex-shrink:0;font-size:14px}
.sup-faq-item.open .sup-faq-chevron{transform:rotate(180deg)}
.sup-faq-answer{display:none;padding:0 22px 14px 60px;font-size:12.5px;line-height:1.75;color:#6b84a8;font-weight:500}
.sup-faq-item.open .sup-faq-answer{display:block}
/* ── Review Form ── */
.sup-review-form{padding:0 22px 22px;display:flex;flex-direction:column;gap:14px}
.sup-field label{display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#0d1f3c;margin-bottom:6px}
.sup-field input,.sup-field textarea{width:100%;padding:11px 14px;border-radius:12px;border:1px solid rgba(108,71,255,.15);background:#fff;color:#0d1f3c;font-size:13px;outline:none;box-sizing:border-box;font-family:inherit;transition:.15s}
.sup-field input:focus,.sup-field textarea:focus{border-color:${ACC};box-shadow:0 0 0 3px rgba(108,71,255,.08)}
.sup-field textarea{resize:none;height:100px}
/* star highlight trick */
.sup-stars-wrap{display:flex;flex-direction:row-reverse;gap:4px}
.sup-stars-wrap label{font-size:28px;cursor:pointer;color:#ddd;transition:.15s;line-height:1}
.sup-stars-wrap input[type=radio]{display:none}
.sup-stars-wrap label:hover,.sup-stars-wrap label:hover ~ label,
.sup-stars-wrap input[type=radio]:checked ~ label{color:#f59e0b}
.sup-submit-btn{width:100%;padding:12px;border-radius:12px;background:linear-gradient(135deg,${ACC},#00d4c8);border:none;color:#fff;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;transition:.15s}
.sup-submit-btn:hover{opacity:.88;transform:translateY(-1px)}
.sup-submit-btn:disabled{opacity:.45;cursor:not-allowed;transform:none}
.sup-err{font-size:11px;color:#d32f2f;margin-top:4px;min-height:14px}
.sup-msg{font-size:12.5px;text-align:center;margin-top:4px;display:none}
/* ── Reviews List ── */
.sup-reviews-list{padding:0 22px 22px;display:flex;flex-direction:column;gap:12px;max-height:520px;overflow-y:auto}
.sup-review-card{padding:15px;background:#fafafa;border:1px solid rgba(108,71,255,.08);border-radius:14px}
.sup-review-header{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px}
.sup-review-name{font-size:13px;font-weight:800;color:#0d1f3c}
.sup-review-date{font-size:11px;color:#6b84a8;margin-top:2px;font-weight:600}
.sup-review-stars{font-size:15px}
.sup-review-text{font-size:12.5px;line-height:1.65;color:#0d1f3c;font-weight:500}
</style>

<div class="sup-root">

  <!-- ROW 1: Kontak + Sosmed + FAQ (full width) -->
  <div class="sup-grid" style="margin-bottom:20px">

    <!-- Kontak Utama -->
    <div class="sup-panel">
      <div class="sup-panel-head">
        <div class="sup-panel-title">Kontak Utama</div>
        <div class="sup-panel-desc">Gunakan email untuk bantuan yang butuh detail atau pengecekan akun.</div>
      </div>
      <div class="sup-contact-list">
        <a class="sup-contact-item" href="mailto:bussinesranzai@gmail.com">
          <div class="sup-contact-icon">✉️</div>
          <div>
            <div class="sup-contact-label">Email Support</div>
            <div class="sup-contact-value">bussinesranzai@gmail.com</div>
          </div>
        </a>
        <a class="sup-contact-item" href="https://ranz-ai.com" target="_blank" rel="noopener">
          <div class="sup-contact-icon">🌐</div>
          <div>
            <div class="sup-contact-label">Website</div>
            <div class="sup-contact-value">ranz-ai.com</div>
          </div>
        </a>
      </div>
      <div class="sup-note">
        💡 Untuk masalah saldo atau transaksi, sertakan email akun, nominal top-up, waktu pembayaran, dan screenshot bukti agar pengecekan lebih cepat.
      </div>
    </div>

    <!-- Media Sosial -->
    <div class="sup-panel">
      <div class="sup-panel-head">
        <div class="sup-panel-title">Media Sosial</div>
        <div class="sup-panel-desc">Ikuti update fitur, demo tools, dan info terbaru dari RanzAI.</div>
      </div>
      <div class="sup-social-grid">
        ${socmedHTML}
      </div>
    </div>

  </div>

  <!-- ROW 2: FAQ full width -->
  <div class="sup-panel sup-full">
    <div class="sup-panel-head">
      <div class="sup-panel-title">Pertanyaan yang Sering Ditanya</div>
      <div class="sup-panel-desc">Temukan jawaban cepat sebelum menghubungi support.</div>
    </div>
    <div class="sup-faq-body" id="supFAQList">
      ${faqHTML}
    </div>
  </div>

  <!-- ROW 3: Review Form + Reviews List -->
  <div class="sup-grid">

    <!-- Form Review -->
    <div class="sup-panel">
      <div class="sup-panel-head">
        <div class="sup-panel-title">Berikan Review</div>
        <div class="sup-panel-desc">Pengalaman kamu membantu pengguna lain membuat keputusan yang lebih baik.</div>
      </div>
      <div class="sup-review-form" id="supReviewForm">
        <div class="sup-field">
          <label>Nama</label>
          <input id="supRName" type="text" placeholder="Nama atau username kamu"/>
          <div class="sup-err" id="supRNameErr"></div>
        </div>
        <div class="sup-field">
          <label>Email</label>
          <input id="supREmail" type="email" placeholder="email@kamu.com"/>
          <div class="sup-err" id="supREmailErr"></div>
        </div>
        <div class="sup-field">
          <label>Rating</label>
          <div class="sup-stars-wrap" id="supStarsWrap">
            <input type="radio" id="supStar5" name="supRating" value="5"/><label for="supStar5">★</label>
            <input type="radio" id="supStar4" name="supRating" value="4"/><label for="supStar4">★</label>
            <input type="radio" id="supStar3" name="supRating" value="3"/><label for="supStar3">★</label>
            <input type="radio" id="supStar2" name="supRating" value="2"/><label for="supStar2">★</label>
            <input type="radio" id="supStar1" name="supRating" value="1"/><label for="supStar1">★</label>
          </div>
          <div class="sup-err" id="supRRatingErr"></div>
        </div>
        <div class="sup-field">
          <label>Komentar</label>
          <textarea id="supRComment" placeholder="Ceritakan pengalaman kamu dengan RanzAI..."></textarea>
          <div class="sup-err" id="supRCommentErr"></div>
        </div>
        <button class="sup-submit-btn" id="supRSubmit">Kirim Review</button>
        <div class="sup-msg" id="supRMsg"></div>
      </div>
    </div>

    <!-- Reviews List -->
    <div class="sup-panel">
      <div class="sup-panel-head">
        <div class="sup-panel-title">Review Pengguna</div>
        <div class="sup-panel-desc">Apa kata komunitas RanzAI tentang platform kami.</div>
      </div>
      <div class="sup-reviews-list" id="supReviewsList">
        <div style="text-align:center;color:#6b84a8;padding:24px;font-size:13px;font-weight:600">Memuat review...</div>
      </div>
    </div>

  </div>

</div>`;
  }

  // ─── FAQ Accordion ───────────────────────────────────────────────────────

  function initFAQ(container) {
    container.querySelectorAll(".sup-faq-item").forEach(item => {
      item.querySelector(".sup-faq-q").addEventListener("click", () => {
        // close others
        container.querySelectorAll(".sup-faq-item.open").forEach(o => {
          if (o !== item) o.classList.remove("open");
        });
        item.classList.toggle("open");
      });
    });
  }

  // ─── Review Form ─────────────────────────────────────────────────────────

  function initReviewForm(container) {
    const submit = container.querySelector("#supRSubmit");
    const msg    = container.querySelector("#supRMsg");

    submit.addEventListener("click", async () => {
      const name    = container.querySelector("#supRName").value.trim();
      const email   = container.querySelector("#supREmail").value.trim();
      const rating  = container.querySelector("input[name='supRating']:checked")?.value;
      const comment = container.querySelector("#supRComment").value.trim();

      // Clear errors
      ["supRNameErr","supREmailErr","supRRatingErr","supRCommentErr"].forEach(id => {
        container.querySelector("#" + id).textContent = "";
      });

      let valid = true;
      if (!name)    { container.querySelector("#supRNameErr").textContent = "Nama wajib diisi"; valid = false; }
      if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) { container.querySelector("#supREmailErr").textContent = "Email tidak valid"; valid = false; }
      if (!rating)  { container.querySelector("#supRRatingErr").textContent = "Pilih rating terlebih dahulu"; valid = false; }
      if (!comment || comment.length < 10) { container.querySelector("#supRCommentErr").textContent = "Komentar minimal 10 karakter"; valid = false; }
      if (!valid) return;

      submit.disabled = true;
      submit.textContent = "Mengirim...";
      msg.style.display = "block";
      msg.style.color = "var(--muted,rgba(255,255,255,0.5))";
      msg.textContent = "Mengirim review...";

      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/submit-review`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ name, email, rating: parseInt(rating), comment })
        });

        if (!res.ok) throw new Error("Gagal mengirim review");

        msg.style.color = "#4ade80";
        msg.textContent = "✓ Review berhasil dikirim! Terima kasih.";

        container.querySelector("#supRName").value = "";
        container.querySelector("#supREmail").value = "";
        container.querySelector("#supRComment").value = "";
        container.querySelectorAll("input[name='supRating']").forEach(r => r.checked = false);

        await loadReviews(container);
        setTimeout(() => { msg.style.display = "none"; }, 4000);

      } catch (err) {
        msg.style.color = "#d32f2f";
        msg.textContent = "Error: " + (err.message || "Terjadi kesalahan");
      } finally {
        submit.disabled = false;
        submit.textContent = "Kirim Review";
      }
    });
  }

  // ─── Load Reviews ─────────────────────────────────────────────────────────

  async function loadReviews(container) {
    const list = container.querySelector("#supReviewsList");
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/reviews?order=created_at.desc`,
        { headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      if (!res.ok) throw new Error();
      const reviews = await res.json();

      if (!reviews.length) {
        list.innerHTML = '<div style="text-align:center;color:#6b84a8;padding:24px;font-size:13px;font-weight:600">Belum ada review. Jadilah yang pertama! 🎉</div>';
        return;
      }

      list.innerHTML = reviews.map(r => `
        <div class="sup-review-card">
          <div class="sup-review-header">
            <div>
              <div class="sup-review-name">${escapeHtml(r.name)}</div>
              <div class="sup-review-date">${new Date(r.created_at).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</div>
            </div>
            <div class="sup-review-stars">${"⭐".repeat(r.rating)}</div>
          </div>
          <div class="sup-review-text">${escapeHtml(r.comment)}</div>
        </div>
      `).join("");

    } catch {
      list.innerHTML = '<div style="text-align:center;color:#d32f2f;padding:24px;font-size:13px;font-weight:600">Gagal memuat review</div>';
    }
  }

  function escapeHtml(text) {
    const d = document.createElement("div");
    d.textContent = text;
    return d.innerHTML;
  }

  // ─── Export ───────────────────────────────────────────────────────────────

  window.RanzTools = window.RanzTools || {};
  window.RanzTools.support = { render };
  window.RanzAISupport = { render };

})();
