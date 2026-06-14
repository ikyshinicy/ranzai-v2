// /scripts/account/terms.js
// RanzAI Terms of Service — Syarat & Ketentuan
// Expose: RanzTools.terms.render(container, config)

(function () {
  "use strict";

  const ACC = "#6C47FF";
  const LAST_UPDATED = "14 Juni 2026";

  // ─── Konten Sections ──────────────────────────────────────────────────────

  const SECTIONS = [
    {
      id: "umum",
      icon: "ti-file-description",
      title: "1. Ketentuan Umum",
      color: "rgba(108,71,255,0.1)",
      colorIcon: ACC,
      content: [
        "Dengan mendaftar dan menggunakan layanan RanzAI (<strong>ranz-ai.com</strong>), kamu menyatakan telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan ini.",
        "RanzAI adalah platform kreasi berbasis kecerdasan buatan (AI) yang menyediakan berbagai tools untuk kebutuhan desain, penulisan, analisis konten, dan lainnya.",
        "Layanan ini diperuntukkan bagi pengguna berusia minimal <strong>17 tahun</strong>. Dengan mendaftar, kamu menyatakan telah memenuhi syarat usia tersebut.",
        "RanzAI berhak mengubah, memperbarui, atau menghentikan layanan sewaktu-waktu dengan atau tanpa pemberitahuan sebelumnya.",
      ]
    },
    {
      id: "akun",
      icon: "ti-user-shield",
      title: "2. Akun Pengguna",
      color: "rgba(74,222,128,0.1)",
      colorIcon: "#22c55e",
      content: [
        "Setiap pengguna hanya diizinkan memiliki <strong>satu akun aktif</strong>. Pembuatan akun ganda dapat mengakibatkan pemblokiran permanen.",
        "Kamu bertanggung jawab penuh atas keamanan email dan password akun. RanzAI tidak bertanggung jawab atas kerugian akibat akun yang dibobol karena kelalaian pengguna.",
        "Dilarang meminjamkan, menjual, atau memindahtangankan akun kepada pihak lain dalam bentuk apapun.",
        "RanzAI berhak menangguhkan atau menghapus akun yang terbukti melakukan penyalahgunaan layanan, penipuan, atau pelanggaran Syarat & Ketentuan ini.",
      ]
    },
    {
      id: "koin",
      icon: "ti-coins",
      title: "3. Ranz Coin & Pembayaran",
      color: "rgba(251,191,36,0.12)",
      colorIcon: "#f59e0b",
      content: [
        "Ranz Coin adalah mata uang virtual dalam platform RanzAI yang digunakan untuk mengakses fitur-fitur berbayar. Koin tidak memiliki nilai tukar terhadap mata uang nyata dan tidak dapat dicairkan.",
        "Pembelian Ranz Coin bersifat <strong>final dan tidak dapat dikembalikan (non-refundable)</strong>, kecuali terjadi kesalahan teknis dari pihak RanzAI yang terdokumentasi.",
        "Koin yang sudah dibeli tidak memiliki masa kadaluarsa selama akun aktif. Namun, jika akun diblokir akibat pelanggaran, koin di dalamnya dinyatakan hangus.",
        "Harga paket koin dan biaya per tool dapat berubah sewaktu-waktu. Perubahan harga tidak berlaku retroaktif terhadap koin yang sudah dibeli.",
        "RanzAI menggunakan gateway pembayaran pihak ketiga (Mayar.id). Dengan melakukan pembayaran, kamu juga tunduk pada syarat ketentuan penyedia gateway tersebut.",
      ]
    },
    {
      id: "penggunaan",
      icon: "ti-shield-check",
      title: "4. Penggunaan yang Diizinkan",
      color: "rgba(0,212,200,0.1)",
      colorIcon: "#00d4c8",
      content: [
        "Kamu diizinkan menggunakan output yang dihasilkan RanzAI (teks, gambar, analisis) untuk keperluan pribadi maupun komersial, selama tidak melanggar hukum yang berlaku.",
        "Output AI yang dihasilkan melalui RanzAI sepenuhnya menjadi hak pengguna yang membuat permintaan tersebut. RanzAI tidak mengklaim kepemilikan atas output yang dihasilkan.",
        "Pengguna wajib memastikan bahwa prompt/input yang dimasukkan tidak mengandung informasi rahasia pihak ketiga, data pribadi orang lain tanpa izin, atau materi berhak cipta yang dilindungi.",
      ]
    },
    {
      id: "larangan",
      icon: "ti-ban",
      title: "5. Larangan Penggunaan",
      color: "rgba(248,113,113,0.1)",
      colorIcon: "#ef4444",
      content: [
        "Dilarang menggunakan RanzAI untuk menghasilkan konten yang bersifat <strong>SARA, pornografi, kekerasan, ancaman, atau konten ilegal</strong> dalam bentuk apapun.",
        "Dilarang mencoba mengeksploitasi, meretas, atau memanipulasi sistem RanzAI termasuk namun tidak terbatas pada manipulasi saldo koin, bypass autentikasi, atau scraping data.",
        "Dilarang menggunakan layanan RanzAI untuk tujuan spam, penipuan, phishing, atau aktivitas yang merugikan pengguna lain maupun pihak ketiga.",
        "Dilarang melakukan reverse engineering, mendekompilasi, atau mendistribusikan ulang kode sumber platform RanzAI tanpa izin tertulis.",
        "Pelanggaran larangan di atas dapat berakibat penangguhan akun permanen tanpa pengembalian saldo koin.",
      ]
    },
    {
      id: "privasi",
      icon: "ti-lock-square",
      title: "6. Privasi & Data",
      color: "rgba(168,85,247,0.1)",
      colorIcon: "#a855f7",
      content: [
        "RanzAI mengumpulkan data yang kamu berikan saat registrasi (nama, email) dan data penggunaan (riwayat generate, log transaksi koin) untuk keperluan operasional layanan.",
        "RanzAI <strong>tidak menjual</strong> data pribadi pengguna kepada pihak ketiga untuk tujuan komersial.",
        "Prompt dan input yang kamu masukkan ke tools RanzAI dapat digunakan secara anonim untuk keperluan peningkatan kualitas layanan dan model AI.",
        "Dengan menggunakan layanan, kamu menyetujui pengumpulan dan penggunaan data sebagaimana dijelaskan di atas.",
      ]
    },
    {
      id: "tanggung-jawab",
      icon: "ti-alert-triangle",
      title: "7. Batasan Tanggung Jawab",
      color: "rgba(251,146,60,0.1)",
      colorIcon: "#f97316",
      content: [
        "RanzAI menyediakan layanan <strong>\"sebagaimana adanya\" (as-is)</strong> tanpa jaminan bahwa layanan akan selalu tersedia, bebas error, atau menghasilkan output yang sempurna.",
        "RanzAI tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul akibat penggunaan atau ketidakmampuan menggunakan layanan.",
        "Output yang dihasilkan AI bersifat generatif dan mungkin tidak selalu akurat. Pengguna bertanggung jawab penuh atas verifikasi dan penggunaan output tersebut.",
        "RanzAI tidak bertanggung jawab atas konten yang dihasilkan berdasarkan prompt pengguna. Tanggung jawab atas prompt dan penggunaannya sepenuhnya berada pada pengguna.",
      ]
    },
    {
      id: "perubahan",
      icon: "ti-refresh",
      title: "8. Perubahan Syarat & Ketentuan",
      color: "rgba(108,71,255,0.08)",
      colorIcon: ACC,
      content: [
        "RanzAI berhak memperbarui Syarat & Ketentuan ini kapan saja. Perubahan akan diumumkan melalui dashboard atau email terdaftar.",
        "Melanjutkan penggunaan layanan setelah perubahan diterbitkan berarti kamu menyetujui Syarat & Ketentuan yang telah diperbarui.",
        "Jika kamu tidak setuju dengan perubahan yang berlaku, kamu dapat menghentikan penggunaan layanan dan menutup akun.",
      ]
    },
    {
      id: "hukum",
      icon: "ti-gavel",
      title: "9. Hukum yang Berlaku",
      color: "rgba(0,212,200,0.08)",
      colorIcon: "#00d4c8",
      content: [
        "Syarat & Ketentuan ini diatur dan ditafsirkan berdasarkan hukum yang berlaku di <strong>Republik Indonesia</strong>.",
        "Setiap sengketa yang timbul akan diselesaikan secara musyawarah terlebih dahulu. Jika tidak tercapai kesepakatan, penyelesaian dilakukan melalui jalur hukum yang berlaku.",
        "Untuk pertanyaan atau keberatan terkait Syarat & Ketentuan ini, hubungi kami di <strong>bussinesranzai@gmail.com</strong>.",
      ]
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  function render(container, config) {
    container.innerHTML = "";
    container.style.cssText = "padding:0;background:transparent;";

    const root = document.createElement("div");
    root.innerHTML = buildHTML();
    container.appendChild(root);

    initAccordion(container);
  }

  // ─── HTML ─────────────────────────────────────────────────────────────────

  function buildHTML() {
    const sectionsHTML = SECTIONS.map((sec, idx) => `
      <div class="trm-section" id="trm-sec-${sec.id}">
        <div class="trm-sec-head" data-idx="${idx}">
          <div class="trm-sec-icon" style="background:${sec.color};color:${sec.colorIcon}">
            <i class="ti ${sec.icon}"></i>
          </div>
          <span class="trm-sec-title">${sec.title}</span>
          <i class="ti ti-chevron-down trm-chevron"></i>
        </div>
        <div class="trm-sec-body">
          <ul class="trm-list">
            ${sec.content.map(p => `<li>${p}</li>`).join("")}
          </ul>
        </div>
      </div>
    `).join("");

    const tocHTML = SECTIONS.map(sec => `
      <a class="trm-toc-item" href="#trm-sec-${sec.id}" onclick="event.preventDefault();document.getElementById('trm-sec-${sec.id}').scrollIntoView({behavior:'smooth'})">
        <i class="ti ${sec.icon}" style="color:${sec.colorIcon}"></i>
        <span>${sec.title}</span>
      </a>
    `).join("");

    return `
<style>
/* ── Base ── */
.trm-root *{box-sizing:border-box}
.trm-root{font-family:'Montserrat','Syne',sans-serif;color:#0d1f3c;padding:24px;min-height:calc(100vh - 80px);background:#f5f6fa}

/* ── Header ── */
.trm-hero{background:#ffffff;border:1px solid rgba(108,71,255,.11);border-radius:16px;padding:28px 28px 24px;margin-bottom:20px;box-shadow:0 2px 12px rgba(108,71,255,.06);display:flex;align-items:flex-start;gap:20px}
.trm-hero-icon{width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,${ACC},#00d4c8);display:grid;place-items:center;font-size:22px;color:#fff;flex-shrink:0}
.trm-hero-text{}
.trm-hero-title{font-size:20px;font-weight:900;letter-spacing:-.03em;color:#0d1f3c;margin:0 0 5px}
.trm-hero-sub{font-size:12.5px;color:#6b84a8;font-weight:600;margin:0;line-height:1.6}
.trm-hero-badge{display:inline-flex;align-items:center;gap:5px;margin-top:10px;padding:5px 12px;background:rgba(108,71,255,.08);border-radius:20px;font-size:11px;font-weight:800;color:${ACC};letter-spacing:.02em}

/* ── Layout ── */
.trm-layout{display:grid;grid-template-columns:240px 1fr;gap:20px;align-items:start}
@media(max-width:860px){.trm-layout{grid-template-columns:1fr}}

/* ── TOC Sidebar ── */
.trm-toc{background:#ffffff;border:1px solid rgba(108,71,255,.11);border-radius:16px;padding:20px;box-shadow:0 2px 12px rgba(108,71,255,.06);position:sticky;top:80px}
.trm-toc-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#6b84a8;margin-bottom:12px}
.trm-toc-item{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:10px;text-decoration:none;color:#0d1f3c;font-size:12px;font-weight:700;transition:.15s;margin-bottom:2px;line-height:1.35}
.trm-toc-item:hover{background:rgba(108,71,255,.06);color:${ACC}}
.trm-toc-item i{font-size:14px;flex-shrink:0}
@media(max-width:860px){.trm-toc{display:none}}

/* ── Sections ── */
.trm-sections{display:flex;flex-direction:column;gap:10px}
.trm-section{background:#ffffff;border:1px solid rgba(108,71,255,.11);border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(108,71,255,.05)}
.trm-sec-head{display:flex;align-items:center;gap:12px;padding:16px 20px;cursor:pointer;transition:background .15s;user-select:none}
.trm-sec-head:hover{background:rgba(108,71,255,.03)}
.trm-sec-icon{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;font-size:16px;flex-shrink:0}
.trm-sec-title{font-size:13.5px;font-weight:800;color:#0d1f3c;flex:1;letter-spacing:-.01em}
.trm-chevron{color:#6b84a8;transition:transform .22s;flex-shrink:0;font-size:15px}
.trm-section.open .trm-chevron{transform:rotate(180deg)}

/* ── Section Body ── */
.trm-sec-body{display:none;padding:0 20px 20px 20px;border-top:1px solid rgba(108,71,255,.07)}
.trm-section.open .trm-sec-body{display:block}
.trm-list{margin:16px 0 0;padding:0 0 0 6px;list-style:none;display:flex;flex-direction:column;gap:10px}
.trm-list li{font-size:12.5px;line-height:1.8;color:#374151;font-weight:500;padding-left:18px;position:relative}
.trm-list li::before{content:"";position:absolute;left:0;top:9px;width:6px;height:6px;border-radius:50%;background:rgba(108,71,255,.3);flex-shrink:0}
.trm-list li strong{color:#0d1f3c;font-weight:800}

/* ── Footer note ── */
.trm-footer{margin-top:20px;background:#ffffff;border:1px solid rgba(108,71,255,.11);border-radius:16px;padding:18px 22px;box-shadow:0 2px 8px rgba(108,71,255,.04);display:flex;align-items:center;gap:14px}
.trm-footer-icon{font-size:22px;flex-shrink:0}
.trm-footer-text{font-size:12px;line-height:1.7;color:#6b84a8;font-weight:600}
.trm-footer-text a{color:${ACC};font-weight:800;text-decoration:none}
.trm-footer-text a:hover{text-decoration:underline}
</style>

<div class="trm-root">

  <!-- Hero Header -->
  <div class="trm-hero">
    <div class="trm-hero-icon"><i class="ti ti-file-certificate"></i></div>
    <div class="trm-hero-text">
      <div class="trm-hero-title">Syarat & Ketentuan</div>
      <div class="trm-hero-sub">Harap baca dan pahami seluruh ketentuan penggunaan layanan RanzAI sebelum menggunakan platform kami.</div>
      <div class="trm-hero-badge"><i class="ti ti-calendar-event"></i> Terakhir diperbarui: ${LAST_UPDATED}</div>
    </div>
  </div>

  <!-- Layout: TOC + Sections -->
  <div class="trm-layout">

    <!-- TOC Sidebar -->
    <div class="trm-toc">
      <div class="trm-toc-label">Daftar Isi</div>
      ${tocHTML}
    </div>

    <!-- Sections -->
    <div class="trm-sections">
      ${sectionsHTML}
    </div>

  </div>

  <!-- Footer note -->
  <div class="trm-footer">
    <div class="trm-footer-icon">💬</div>
    <div class="trm-footer-text">
      Ada pertanyaan tentang Syarat & Ketentuan ini? Hubungi kami di
      <a href="mailto:bussinesranzai@gmail.com">bussinesranzai@gmail.com</a>
      atau kunjungi halaman <a href="#" onclick="event.preventDefault();window.RanzView&&window.RanzView.loadTool('support')">Support & Bantuan</a>.
    </div>
  </div>

</div>`;
  }

  // ─── Accordion ────────────────────────────────────────────────────────────

  function initAccordion(container) {
    container.querySelectorAll(".trm-sec-head").forEach(function (head) {
      head.addEventListener("click", function () {
        const section = head.closest(".trm-section");

        // close all others
        container.querySelectorAll(".trm-section.open").forEach(function (s) {
          if (s !== section) s.classList.remove("open");
        });

        section.classList.toggle("open");
      });
    });

    // Buka section pertama by default
    const first = container.querySelector(".trm-section");
    if (first) first.classList.add("open");
  }

  // ─── Export ───────────────────────────────────────────────────────────────

  window.RanzTools = window.RanzTools || {};
  window.RanzTools.terms = { render };
  window.RanzAITerms = { render };

})();
