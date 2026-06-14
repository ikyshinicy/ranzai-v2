(function () {
  window.RanzTools = window.RanzTools || {};

  // ─── DOC TYPE CONFIG ──────────────────────────────────────────────
  const DOC_TYPES = [
    // Administrasi Bisnis
    {
      id: "surat_resmi",      group: "Administrasi",
      name: "Surat Resmi",   icon: "📄",
      coin: 1,               desc: "Surat formal keperluan bisnis atau institusi",
      fields: [
        { id: "pengirim",    label: "Nama / Instansi Pengirim", type: "text",     placeholder: "PT. Maju Bersama" },
        { id: "penerima",    label: "Nama / Instansi Penerima", type: "text",     placeholder: "Kepada Yth. ..." },
        { id: "perihal",     label: "Perihal",                  type: "text",     placeholder: "Permohonan Kunjungan" },
        { id: "isi",         label: "Isi / Maksud Surat",       type: "textarea", placeholder: "Jelaskan maksud dan tujuan surat..." }
      ]
    },
    {
      id: "surat_kuasa",     group: "Administrasi",
      name: "Surat Kuasa",  icon: "✍️",
      coin: 1,               desc: "Pemberian kuasa dari satu pihak ke pihak lain",
      fields: [
        { id: "pemberi",     label: "Nama Pemberi Kuasa",       type: "text",     placeholder: "Budi Santoso" },
        { id: "penerima",    label: "Nama Penerima Kuasa",      type: "text",     placeholder: "Siti Rahayu" },
        { id: "keperluan",   label: "Keperluan / Kuasa Untuk",  type: "textarea", placeholder: "Mengurus dokumen BPKB kendaraan..." }
      ]
    },
    {
      id: "surat_pernyataan", group: "Administrasi",
      name: "Surat Pernyataan", icon: "📝",
      coin: 1,               desc: "Pernyataan resmi dari seseorang atau instansi",
      fields: [
        { id: "nama",        label: "Nama Yang Menyatakan",     type: "text",     placeholder: "Ahmad Fauzi" },
        { id: "jabatan",     label: "Jabatan / Pekerjaan",      type: "text",     placeholder: "Direktur Utama" },
        { id: "isi",         label: "Isi Pernyataan",           type: "textarea", placeholder: "Menyatakan bahwa..." }
      ]
    },
    {
      id: "berita_acara",    group: "Administrasi",
      name: "Berita Acara",  icon: "📋",
      coin: 1,               desc: "Dokumen pencatatan kejadian atau kegiatan resmi",
      fields: [
        { id: "kegiatan",    label: "Nama Kegiatan",            type: "text",     placeholder: "Serah Terima Jabatan" },
        { id: "tanggal",     label: "Tanggal & Tempat",         type: "text",     placeholder: "10 Juni 2025, Kantor Pusat" },
        { id: "peserta",     label: "Pihak yang Terlibat",      type: "textarea", placeholder: "1. ...\n2. ..." },
        { id: "isi",         label: "Uraian Kegiatan",          type: "textarea", placeholder: "Jelaskan kronologi kegiatan..." }
      ]
    },
    {
      id: "spk",             group: "Administrasi",
      name: "Surat Perintah Kerja", icon: "🔧",
      coin: 1,               desc: "SPK untuk kontraktor atau vendor",
      fields: [
        { id: "pemberi",     label: "Nama Pemberi Kerja",       type: "text",     placeholder: "PT. Karya Mandiri" },
        { id: "pelaksana",   label: "Nama Pelaksana / Vendor",  type: "text",     placeholder: "CV. Bangun Jaya" },
        { id: "pekerjaan",   label: "Jenis Pekerjaan",          type: "textarea", placeholder: "Renovasi ruang kantor lantai 2..." },
        { id: "nilai",       label: "Nilai Kontrak",            type: "text",     placeholder: "Rp 45.000.000" },
        { id: "deadline",    label: "Batas Waktu",              type: "text",     placeholder: "30 hari kalender" }
      ]
    },
    {
      id: "surat_jalan",     group: "Administrasi",
      name: "Surat Jalan",   icon: "🚚",
      coin: 1,               desc: "Dokumen pengiriman barang",
      fields: [
        { id: "pengirim",    label: "Nama Pengirim",            type: "text",     placeholder: "Toko Sumber Makmur" },
        { id: "penerima",    label: "Nama Penerima",            type: "text",     placeholder: "Apotek Sehat Jaya" },
        { id: "alamat",      label: "Alamat Tujuan",            type: "text",     placeholder: "Jl. Merdeka No. 12, Sorong" },
        { id: "barang",      label: "Daftar Barang",            type: "textarea", placeholder: "1. Kertas A4 500 rim\n2. Tinta printer 10 box" },
        { id: "keterangan",  label: "Keterangan Tambahan",      type: "text",     placeholder: "Pengiriman via ekspedisi JNE" }
      ]
    },
    {
      id: "penawaran",       group: "Administrasi",
      name: "Penawaran Harga", icon: "💰",
      coin: 1,               desc: "Surat penawaran produk atau jasa",
      fields: [
        { id: "pengirim",    label: "Nama Perusahaan",          type: "text",     placeholder: "CV. Print Solusi" },
        { id: "penerima",    label: "Kepada",                   type: "text",     placeholder: "PT. Media Kreatif" },
        { id: "produk",      label: "Produk / Jasa Ditawarkan", type: "textarea", placeholder: "Cetak banner, brosur, kartu nama..." },
        { id: "harga",       label: "Rincian Harga",            type: "textarea", placeholder: "Banner 1x2m: Rp 80.000/pcs..." },
        { id: "validitas",   label: "Berlaku Hingga",           type: "text",     placeholder: "30 hari dari tanggal surat" }
      ]
    },
    {
      id: "proposal",        group: "Administrasi",
      name: "Proposal Bisnis", icon: "📊",
      coin: 3,               desc: "Proposal proyek atau kerjasama bisnis",
      fields: [
        { id: "judul",       label: "Judul Proposal",           type: "text",     placeholder: "Proposal Kerjasama Percetakan 2025" },
        { id: "pengaju",     label: "Diajukan Oleh",            type: "text",     placeholder: "CV. Ranz Print" },
        { id: "kepada",      label: "Ditujukan Kepada",         type: "text",     placeholder: "Dinas Pendidikan Kota Sorong" },
        { id: "latar",       label: "Latar Belakang",           type: "textarea", placeholder: "Jelaskan kondisi & masalah yang dihadapi..." },
        { id: "tujuan",      label: "Tujuan & Manfaat",         type: "textarea", placeholder: "Tujuan dari proposal ini..." },
        { id: "anggaran",    label: "Estimasi Anggaran",        type: "text",     placeholder: "Rp 25.000.000" }
      ]
    },
    {
      id: "kontrak",         group: "Administrasi",
      name: "Kontrak / MOU", icon: "🤝",
      coin: 3,               desc: "Perjanjian kerjasama antar pihak",
      fields: [
        { id: "pihak1",      label: "Pihak Pertama",            type: "text",     placeholder: "PT. Maju Bersama" },
        { id: "pihak2",      label: "Pihak Kedua",              type: "text",     placeholder: "CV. Karya Abadi" },
        { id: "perihal",     label: "Perihal Kerjasama",        type: "textarea", placeholder: "Kerjasama pengadaan bahan percetakan..." },
        { id: "nilai",       label: "Nilai / Kompensasi",       type: "text",     placeholder: "Rp 100.000.000 / tahun" },
        { id: "durasi",      label: "Durasi Kontrak",           type: "text",     placeholder: "1 tahun, dapat diperpanjang" },
        { id: "ketentuan",   label: "Ketentuan Khusus",         type: "textarea", placeholder: "Hak dan kewajiban masing-masing pihak..." }
      ]
    },
    // HR / Internal
    {
      id: "sk_kerja",        group: "HR / Internal",
      name: "Surat Keterangan Kerja", icon: "👔",
      coin: 1,               desc: "Keterangan resmi status karyawan",
      fields: [
        { id: "perusahaan",  label: "Nama Perusahaan",          type: "text",     placeholder: "PT. Ranz Solusi" },
        { id: "karyawan",    label: "Nama Karyawan",            type: "text",     placeholder: "Budi Santoso" },
        { id: "jabatan",     label: "Jabatan",                  type: "text",     placeholder: "Staff Marketing" },
        { id: "sejak",       label: "Bekerja Sejak",            type: "text",     placeholder: "1 Januari 2022" },
        { id: "keperluan",   label: "Keperluan Surat",          type: "text",     placeholder: "Pengajuan KPR / Kredit Bank" }
      ]
    },
    {
      id: "sp",              group: "HR / Internal",
      name: "Surat Peringatan", icon: "⚠️",
      coin: 1,               desc: "SP1 / SP2 untuk karyawan",
      fields: [
        { id: "perusahaan",  label: "Nama Perusahaan",          type: "text",     placeholder: "PT. Maju Bersama" },
        { id: "karyawan",    label: "Nama Karyawan",            type: "text",     placeholder: "Ahmad Fauzi" },
        { id: "jabatan",     label: "Jabatan",                  type: "text",     placeholder: "Operator Produksi" },
        { id: "tingkat",     label: "Tingkat SP",               type: "select",   options: ["SP 1 (Pertama)", "SP 2 (Kedua)", "SP 3 (Terakhir)"] },
        { id: "pelanggaran", label: "Pelanggaran",              type: "textarea", placeholder: "Jelaskan pelanggaran yang dilakukan..." }
      ]
    },
    {
      id: "resign",          group: "HR / Internal",
      name: "Surat Resign",  icon: "🚪",
      coin: 1,               desc: "Surat pengunduran diri karyawan",
      fields: [
        { id: "nama",        label: "Nama Karyawan",            type: "text",     placeholder: "Siti Rahayu" },
        { id: "jabatan",     label: "Jabatan",                  type: "text",     placeholder: "Desainer Grafis" },
        { id: "perusahaan",  label: "Nama Perusahaan",          type: "text",     placeholder: "PT. Kreatif Media" },
        { id: "tanggal",     label: "Tanggal Efektif Resign",   type: "text",     placeholder: "30 Juni 2025" },
        { id: "alasan",      label: "Alasan (opsional)",        type: "textarea", placeholder: "Alasan pengunduran diri..." }
      ]
    },
    {
      id: "lamaran",         group: "HR / Internal",
      name: "Surat Lamaran Kerja", icon: "📬",
      coin: 1,               desc: "Surat lamaran pekerjaan profesional",
      fields: [
        { id: "nama",        label: "Nama Pelamar",             type: "text",     placeholder: "Ahmad Rizki" },
        { id: "posisi",      label: "Posisi yang Dilamar",      type: "text",     placeholder: "Desainer Grafis" },
        { id: "perusahaan",  label: "Nama Perusahaan Tujuan",   type: "text",     placeholder: "PT. Kreatif Nusantara" },
        { id: "pengalaman",  label: "Pengalaman / Keahlian",    type: "textarea", placeholder: "Berpengalaman 3 tahun di bidang desain..." }
      ]
    }
  ];

  // Group doc types by group
  const GROUPS = {};
  DOC_TYPES.forEach(function (t) {
    if (!GROUPS[t.group]) GROUPS[t.group] = [];
    GROUPS[t.group].push(t);
  });

  // Coin per 2000 words
  function estimateCoin(docType, wordCount) {
    var base = docType.coin;
    // +1 coin per 2000 kata tambahan
    var extra = Math.floor(wordCount / 2000);
    return base + extra;
  }

  window.RanzTools.doc = {
    render(container) {
      const root = typeof container === "string"
        ? document.querySelector(container)
        : container;
      if (!root) return;

      let currentType = DOC_TYPES[0];
      let currentTone = "formal";
      let generatedText = "";

      // ── BUILD HTML ────────────────────────────────────────────────
      root.innerHTML = `
        <div class="ranz-tool ranz-doc-tool">

          <!-- RIBBON -->
          <div class="doc-ribbon">
            <div class="doc-ribbon-top">
              <div class="doc-ribbon-icon">📄</div>
              <div>
                <div class="doc-ribbon-title">RanzAI Doc</div>
                <div class="doc-ribbon-sub">Generator Dokumen Profesional · Powered by AI</div>
              </div>
            </div>
            <div class="doc-tabs">
              <button class="doc-tab active" data-tab="buat">Buat Dokumen</button>
              <button class="doc-tab" data-tab="riwayat" style="opacity:.55;cursor:not-allowed" disabled>Riwayat <span style="font-size:9px">(soon)</span></button>
            </div>
          </div>

          <!-- BODY -->
          <div class="doc-body">

            <!-- SIDEBAR -->
            <div class="doc-sidebar">
              <div class="doc-sidebar-label">Tipe Dokumen</div>
              <div class="doc-type-list" data-type-list></div>
            </div>

            <!-- MAIN -->
            <div class="doc-main">

              <!-- FORM AREA -->
              <div class="doc-form-area" data-form-area>
                <div class="doc-form-header">
                  <div>
                    <div class="doc-form-title" data-form-title>Surat Resmi</div>
                    <div class="doc-form-desc" data-form-desc>Surat formal keperluan bisnis atau institusi</div>
                  </div>
                  <div class="doc-coin-badge" data-coin-badge>
                    <span>🪙</span> <span data-coin-count>1</span> coin
                  </div>
                </div>

                <div class="doc-sidebar-label" style="margin-bottom:6px">Nada Penulisan</div>
                <div class="doc-tone-row">
                  <button class="doc-tone-btn active" data-tone="formal">Formal</button>
                  <button class="doc-tone-btn" data-tone="semiformal">Semi-Formal</button>
                  <button class="doc-tone-btn" data-tone="modern">Modern</button>
                </div>

                <div class="doc-fields" data-fields></div>

                <button class="doc-generate-btn" data-generate-btn>
                  ✨ Generate Dokumen
                </button>
                <div class="doc-error" data-error></div>
              </div>

              <!-- LOADING -->
              <div class="doc-loading" data-loading>
                <div class="doc-loading-spinner"></div>
                <div class="doc-loading-text">AI sedang menulis dokumen...</div>
                <div class="doc-loading-sub">Proses ini memakan 10–20 detik</div>
              </div>

              <!-- RESULT -->
              <div class="doc-result" data-result>
                <div class="doc-result-toolbar">
                  <div class="doc-result-info">
                    <div class="doc-result-label">Hasil Dokumen</div>
                    <div class="doc-word-count" data-word-count>0 kata</div>
                  </div>
                  <div class="doc-result-actions">
                    <button class="doc-action-btn" data-copy-btn>Salin</button>
                    <button class="doc-action-btn" data-edit-btn>Edit Lagi</button>
                    <button class="doc-action-btn export" data-export-btn>📥 Export Word · 1 coin</button>
                  </div>
                </div>
                <div class="doc-paper-wrap">
                  <div class="doc-paper">
                    <textarea class="doc-paper-editor" data-paper-editor spellcheck="false"></textarea>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- STATUS BAR -->
          <div class="doc-statusbar">
            <div class="doc-status-text" data-status-text>Pilih tipe dokumen dan isi form</div>
            <div class="doc-status-right">RanzAI Doc v1.0</div>
          </div>

        </div>
      `;

      // ── ELEMENT REFS ──────────────────────────────────────────────
      const typeList    = root.querySelector("[data-type-list]");
      const formTitle   = root.querySelector("[data-form-title]");
      const formDesc    = root.querySelector("[data-form-desc]");
      const coinBadge   = root.querySelector("[data-coin-count]");
      const toneRow     = root.querySelectorAll("[data-tone]");
      const fieldsWrap  = root.querySelector("[data-fields]");
      const generateBtn = root.querySelector("[data-generate-btn]");
      const errorBox    = root.querySelector("[data-error]");
      const loadingEl   = root.querySelector("[data-loading]");
      const formArea    = root.querySelector("[data-form-area]");
      const resultEl    = root.querySelector("[data-result]");
      const wordCount   = root.querySelector("[data-word-count]");
      const paperEditor = root.querySelector("[data-paper-editor]");
      const copyBtn     = root.querySelector("[data-copy-btn]");
      const editBtn     = root.querySelector("[data-edit-btn]");
      const exportBtn   = root.querySelector("[data-export-btn]");
      const statusText  = root.querySelector("[data-status-text]");

      // ── BUILD SIDEBAR ─────────────────────────────────────────────
      function buildSidebar() {
        let html = "";
        Object.keys(GROUPS).forEach(function (group) {
          html += `<div class="doc-type-group">
            <div class="doc-type-group-label">${group}</div>`;
          GROUPS[group].forEach(function (t) {
            const active = t.id === currentType.id ? " active" : "";
            html += `<button class="doc-type-btn${active}" data-type-id="${t.id}">
              <div class="doc-type-info">
                <div class="doc-type-name">${t.name}</div>
                <div class="doc-type-coin">${t.coin} coin generate</div>
              </div>
            </button>`;
          });
          html += `</div>`;
        });
        typeList.innerHTML = html;

        typeList.querySelectorAll("[data-type-id]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            const t = DOC_TYPES.find(function (x) { return x.id === btn.dataset.typeId; });
            if (t) selectType(t);
          });
        });
      }

      // ── SELECT TYPE ───────────────────────────────────────────────
      function selectType(t) {
        currentType = t;
        formTitle.textContent = t.name;
        formDesc.textContent  = t.desc;
        coinBadge.textContent = t.coin;
        generateBtn.textContent = `✨ Generate ${t.name} · ${t.coin} Coin`;
        setStatus(`Mengisi form ${t.name}`);
        buildFields(t);
        buildSidebar();
        showForm();
        hideError();
      }

      // ── BUILD FIELDS ──────────────────────────────────────────────
      function buildFields(t) {
        let html = "";
        t.fields.forEach(function (f) {
          const fullClass = f.type === "textarea" ? " doc-field-full" : "";
          html += `<div class="doc-field${fullClass}" data-field-wrap="${f.id}">
            <label for="doc_field_${f.id}">${f.label}</label>`;
          if (f.type === "textarea") {
            html += `<textarea id="doc_field_${f.id}" data-field="${f.id}" placeholder="${f.placeholder || ""}" rows="3"></textarea>`;
          } else if (f.type === "select") {
            html += `<select id="doc_field_${f.id}" data-field="${f.id}">`;
            f.options.forEach(function (o) {
              html += `<option value="${o}">${o}</option>`;
            });
            html += `</select>`;
          } else {
            html += `<input type="text" id="doc_field_${f.id}" data-field="${f.id}" placeholder="${f.placeholder || ""}"/>`;
          }
          html += `</div>`;
        });
        fieldsWrap.innerHTML = html;
      }

      // ── HELPERS ───────────────────────────────────────────────────
      function getConfig()  { return window.RANZAI_CONFIG || {}; }
      function getAnonKey() { return (getConfig().SUPABASE_ANON_KEY || ""); }

      function getSupabaseClient() {
        if (window.RANZAI_SUPABASE) return window.RANZAI_SUPABASE;
        if (!window.supabase) return null;
        const c = getConfig();
        if (!c.SUPABASE_URL || !c.SUPABASE_ANON_KEY) return null;
        window.RANZAI_SUPABASE = window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY);
        return window.RANZAI_SUPABASE;
      }

      async function getAuthToken() {
        const client = getSupabaseClient();
        if (client && client.auth) {
          const { data, error } = await client.auth.getSession();
          if (!error && data && data.session && data.session.access_token) {
            return data.session.access_token;
          }
        }
        return getAnonKey();
      }

      async function getUserId() {
        const client = getSupabaseClient();
        if (!client) return null;
        try {
          const { data } = await client.auth.getSession();
          return data && data.session && data.session.user ? data.session.user.id : null;
        } catch (e) { return null; }
      }

      async function getCoinBalance(userId) {
        const c = getConfig();
        const base = (c.SUPABASE_URL || "").replace(/\/$/, "");
        const key  = c.SUPABASE_ANON_KEY || "";
        try {
          const token = await getAuthToken();
          const res = await fetch(`${base}/rest/v1/coin_balance?user_id=eq.${userId}&select=balance`, {
            headers: { "apikey": key, "Authorization": "Bearer " + token }
          });
          const data = await res.json();
          return Array.isArray(data) && data[0] ? data[0].balance : 0;
        } catch (e) { return 0; }
      }

      function showError(msg) {
        errorBox.textContent = msg;
        errorBox.classList.add("show");
      }

      function hideError() {
        errorBox.textContent = "";
        errorBox.classList.remove("show");
      }

      function setStatus(msg) {
        statusText.textContent = msg;
      }

      function showForm() {
        formArea.style.display   = "";
        loadingEl.classList.remove("show");
        resultEl.classList.remove("show");
      }

      function showLoading() {
        formArea.style.display   = "none";
        loadingEl.classList.add("show");
        resultEl.classList.remove("show");
      }

      function showResult(text) {
        formArea.style.display   = "none";
        loadingEl.classList.remove("show");
        resultEl.classList.add("show");
        paperEditor.value = text;
        updateWordCount(text);
      }

      function updateWordCount(text) {
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        wordCount.textContent = words + " kata";
        // Update export coin estimate
        const exportCoin = 1;
        exportBtn.textContent = `📥 Export Word · ${exportCoin} coin`;
        return words;
      }

      function getFieldValues() {
        const values = {};
        fieldsWrap.querySelectorAll("[data-field]").forEach(function (el) {
          values[el.dataset.field] = el.value.trim();
        });
        return values;
      }

      function buildPrompt(docType, fields, tone) {
        const toneMap = {
          formal:     "Gunakan bahasa Indonesia yang sangat formal dan resmi sesuai standar surat dinas Indonesia.",
          semiformal: "Gunakan bahasa Indonesia semi-formal, tetap sopan namun lebih luwes.",
          modern:     "Gunakan bahasa Indonesia yang profesional dan modern, tidak kaku."
        };

        let fieldText = "";
        docType.fields.forEach(function (f) {
          const val = fields[f.id] || "-";
          fieldText += `- ${f.label}: ${val}\n`;
        });

        return `Kamu adalah asisten profesional pembuat dokumen bisnis Indonesia.

Buat dokumen "${docType.name}" berdasarkan data berikut:
${fieldText}

Petunjuk:
- ${toneMap[tone] || toneMap.formal}
- Sertakan kop/header yang sesuai
- Gunakan format surat resmi Indonesia yang benar (nomor surat, tanggal, perihal, salam, isi, penutup, tanda tangan)
- Tulis langsung isi dokumen lengkap, jangan ada penjelasan atau catatan di luar dokumen
- Gunakan tanda [___] untuk bagian yang perlu diisi manual (nomor, tanda tangan, dll)
- Pastikan kalimat lengkap, profesional, dan siap digunakan

Mulai dokumen sekarang:`;
      }

      // ── GENERATE ─────────────────────────────────────────────────
      async function generate() {
        hideError();

        const userId = await getUserId();
        if (!userId) {
          showError("Kamu harus login untuk menggunakan tools ini.");
          return;
        }

        const balance = await getCoinBalance(userId);
        const needed  = currentType.coin;

        if (balance < needed) {
          showError(`Coin tidak cukup. Butuh ${needed} coin, kamu punya ${balance} coin.`);
          return;
        }

        const fields = getFieldValues();
        const firstField = Object.values(fields)[0] || "";
        if (!firstField) {
          showError("Harap isi minimal satu field terlebih dahulu.");
          return;
        }

        showLoading();
        setStatus("AI sedang menulis dokumen...");
        generateBtn.disabled = true;

        try {
          const c = getConfig();
          const base = (c.SUPABASE_URL || "").replace(/\/$/, "");
          const token = await getAuthToken();

          // Determine edge function path
          const fnPath = c.FUNCTIONS && c.FUNCTIONS.DOC
            ? c.FUNCTIONS.DOC
            : "/functions/v1/generate-doc";

          const response = await fetch(base + fnPath, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + token,
              "apikey": getAnonKey()
            },
            body: JSON.stringify({
              docTypeId: currentType.id,
              docTypeName: currentType.name,
              fields: fields,
              tone: currentTone,
              prompt: buildPrompt(currentType, fields, currentTone),
              coin: currentType.coin
            })
          });

          let data = null;
          try { data = await response.json(); } catch (e) {}

          if (!response.ok || !data || data.error) {
            throw new Error(data && data.error ? data.error : "Gagal generate dokumen.");
          }

          const text = data.result || data.text || data.output || "";
          if (!text) throw new Error("Respons kosong dari server.");

          generatedText = text;
          showResult(text);
          setStatus("Dokumen berhasil dibuat ✓");

        } catch (err) {
          showForm();
          showError("Gagal: " + err.message);
          setStatus("Terjadi kesalahan");
        } finally {
          generateBtn.disabled = false;
        }
      }

      // ── EXPORT WORD ───────────────────────────────────────────────
      async function exportWord() {
        const text = paperEditor.value;
        if (!text) return;

        const userId = await getUserId();
        if (!userId) {
          showError("Kamu harus login untuk export.");
          return;
        }

        const balance = await getCoinBalance(userId);
        if (balance < 1) {
          showError("Coin tidak cukup untuk export. Butuh 1 coin.");
          return;
        }

        exportBtn.disabled = true;
        exportBtn.textContent = "Mengunduh...";
        setStatus("Menyiapkan file Word...");

        try {
          // Deduct coin for export via edge function
          const c = getConfig();
          const base  = (c.SUPABASE_URL || "").replace(/\/$/, "");
          const token = await getAuthToken();
          const fnPath = c.FUNCTIONS && c.FUNCTIONS.DOC_EXPORT
            ? c.FUNCTIONS.DOC_EXPORT
            : "/functions/v1/export-doc";

          await fetch(base + fnPath, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + token,
              "apikey": getAnonKey()
            },
            body: JSON.stringify({ docTypeId: currentType.id, coin: 1 })
          });

          // Build .docx
          await loadScriptOnce("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");

          const escaped = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

          const paragraphs = escaped.split("\n").map(function (line) {
            const isBold = line.startsWith("===") || line.match(/^[A-Z\s]{5,}$/);
            const clean  = line.replace(/^===\s*/, "").replace(/\s*===$/, "");
            const rpr    = isBold
              ? "<w:rPr><w:b/><w:sz w:val=\"26\"/><w:szCs w:val=\"26\"/></w:rPr>"
              : "<w:rPr><w:sz w:val=\"24\"/><w:szCs w:val=\"24\"/></w:rPr>";
            return `<w:p><w:r>${rpr}<w:t xml:space="preserve">${clean}</w:t></w:r></w:p>`;
          }).join("");

          const docXml =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"' +
            ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
            "<w:body>" +
            paragraphs +
            '<w:sectPr>' +
            '<w:pgSz w:w="12240" w:h="15840"/>' +
            '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1800"/>' +
            '</w:sectPr>' +
            "</w:body></w:document>";

          const relsXml =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
            "</Relationships>";

          const wordRelsXml =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';

          const contentTypesXml =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
            '<Default Extension="xml" ContentType="application/xml"/>' +
            '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
            "</Types>";

          const zip = new window.JSZip();
          zip.file("[Content_Types].xml", contentTypesXml);
          zip.file("_rels/.rels", relsXml);
          zip.file("word/document.xml", docXml);
          zip.file("word/_rels/document.xml.rels", wordRelsXml);

          const blob = await zip.generateAsync({
            type: "blob",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          });

          const fname = currentType.name.toLowerCase().replace(/\s+/g, "-") + ".docx";
          const url   = URL.createObjectURL(blob);
          const link  = document.createElement("a");
          link.href = url;
          link.download = fname;
          link.click();
          setTimeout(function () { URL.revokeObjectURL(url); }, 1000);

          setStatus("File berhasil diunduh ✓");

        } catch (err) {
          showError("Gagal export: " + err.message);
          setStatus("Gagal export");
        } finally {
          exportBtn.disabled = false;
          const wc = updateWordCount(paperEditor.value);
          exportBtn.textContent = "📥 Export Word · 1 coin";
        }
      }

      function loadScriptOnce(src) {
        return new Promise(function (resolve, reject) {
          if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
          const s = document.createElement("script");
          s.src = src;
          s.onload = resolve;
          s.onerror = function () { reject(new Error("Gagal memuat library.")); };
          document.head.appendChild(s);
        });
      }

      // ── EVENT LISTENERS ───────────────────────────────────────────

      // Tone buttons
      toneRow.forEach(function (btn) {
        btn.addEventListener("click", function () {
          toneRow.forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          currentTone = btn.dataset.tone;
        });
      });

      // Generate
      generateBtn.addEventListener("click", generate);

      // Copy
      copyBtn.addEventListener("click", function () {
        const text = paperEditor.value;
        if (!text) return;
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = "Tersalin!";
          setTimeout(function () { copyBtn.textContent = "Salin"; }, 2000);
        });
      });

      // Edit lagi
      editBtn.addEventListener("click", function () {
        showForm();
        setStatus("Edit form dan generate ulang");
      });

      // Export
      exportBtn.addEventListener("click", exportWord);

      // Update word count live
      paperEditor.addEventListener("input", function () {
        updateWordCount(paperEditor.value);
      });

      // ── INIT ──────────────────────────────────────────────────────
      buildSidebar();
      buildFields(currentType);
      setStatus("Pilih tipe dokumen dan isi form");
    }
  };
})();
