(function () {
  window.RanzTools = window.RanzTools || {};

  window.RanzTools.design = {
    render(container) {
      const root = typeof container === "string" ? document.querySelector(container) : container;
      if (!root) return;

      root.innerHTML = `
        <div class="ranz-tool ranz-design-tool">
          <main class="design-page">
            <section class="design-hero">
              <div class="design-hero-badge">
                <span class="design-hero-badge-dot"></span>
                RANZAI DESIGN · TOOL DESAIN ENGINE
              </div>

              <h1 class="design-hero-title">
                Desain Visual
                <span>Siap Cetak</span>
              </h1>

              <p class="design-hero-sub">
                Buat banner, baliho, spanduk, poster, dan materi promosi dengan brief desain yang rapi,
                cepat, dan siap diproses AI.
              </p>
            </section>

            <section class="design-card">
              <div class="design-body">
                <h2 class="design-page-title">
                  <span>Design Brief</span> & Generate Gambar
                </h2>

                <div class="design-mode-tabs">
                  <button class="design-tab active" type="button" data-tab="brief">1. Design Brief</button>
                  <button class="design-tab" type="button" data-tab="image">2. Generate Gambar</button>
                </div>

                <div class="design-brief-grid">
                  <div class="design-left-panel">
                    <div class="design-size-grid design-size-grid--ratio">
                      <div class="design-field-group" style="grid-column:1/-1">
                        <label class="design-field-label">Ukuran / Ratio Gambar</label>
                        <select data-ratio class="design-field-select">
                          <optgroup label="── Landscape ──">
                            <option value="16:9|1536x1024|Landscape">16:9 — Landscape (1536×1024)</option>
                            <option value="3:2|1536x1024|Landscape">3:2 — Landscape (1536×1024)</option>
                            <option value="4:3|1536x1024|Landscape">4:3 — Landscape (1536×1024)</option>
                            <option value="2:1|1536x1024|Landscape">2:1 — Landscape (1536×1024)</option>
                            <option value="21:9|1536x1024|Landscape">21:9 — Ultrawide (1536×1024)</option>
                            <option value="16:10|1536x1024|Landscape">16:10 — Landscape (1536×1024)</option>
                            <option value="5:4|1536x1024|Landscape">5:4 — Landscape (1536×1024)</option>
                          </optgroup>
                          <optgroup label="── Portrait ──">
                            <option value="9:16|1024x1536|Portrait">9:16 — Portrait (1024×1536)</option>
                            <option value="2:3|1024x1536|Portrait">2:3 — Portrait (1024×1536)</option>
                            <option value="3:4|1024x1536|Portrait">3:4 — Portrait (1024×1536)</option>
                            <option value="1:2|1024x1536|Portrait">1:2 — Portrait (1024×1536)</option>
                            <option value="9:21|1024x1536|Portrait">9:21 — Ultrawide Portrait (1024×1536)</option>
                            <option value="10:16|1024x1536|Portrait">10:16 — Portrait (1024×1536)</option>
                            <option value="4:5|1024x1536|Portrait">4:5 — Portrait (1024×1536)</option>
                          </optgroup>
                          <optgroup label="── Square ──">
                            <option value="1:1|1024x1024|Square">1:1 — Square (1024×1024)</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    <div class="design-upload-block">
                      <div class="design-section-label">Asset / Foto / Logo</div>
                      <p style="font-size:12px;color:var(--muted,#888);margin-bottom:10px;">Centang aset yang akan dipakai. Foto akan diupload saat Generate Gambar.</p>

                      <div class="design-checklist" data-asset-checklist style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px;">
                        <label class="design-check-item" style="display:flex;align-items:center;gap:8px;font-size:13px;">
                          <input type="checkbox" data-asset-type="foto produk"/> Foto Produk
                          <input type="number" min="1" max="5" value="1" class="design-check-qty" data-asset-qty style="width:44px;padding:2px 6px;border-radius:6px;border:1px solid #ddd;font-size:12px;"/>
                        </label>
                        <label class="design-check-item" style="display:flex;align-items:center;gap:8px;font-size:13px;">
                          <input type="checkbox" data-asset-type="logo"/> Logo
                          <input type="number" min="1" max="5" value="1" class="design-check-qty" data-asset-qty style="width:44px;padding:2px 6px;border-radius:6px;border:1px solid #ddd;font-size:12px;"/>
                        </label>
                        <label class="design-check-item" style="display:flex;align-items:center;gap:8px;font-size:13px;">
                          <input type="checkbox" data-asset-type="foto orang/pejabat"/> Foto Orang / Pejabat
                          <input type="number" min="1" max="5" value="1" class="design-check-qty" data-asset-qty style="width:44px;padding:2px 6px;border-radius:6px;border:1px solid #ddd;font-size:12px;"/>
                        </label>
                        <label class="design-check-item" style="display:flex;align-items:center;gap:8px;font-size:13px;">
                          <input type="checkbox" data-asset-type="foto lainnya"/> Foto Lainnya
                          <input type="number" min="1" max="5" value="1" class="design-check-qty" data-asset-qty style="width:44px;padding:2px 6px;border-radius:6px;border:1px solid #ddd;font-size:12px;"/>
                        </label>
                      </div>
                    </div>

                    <div class="design-main-copy">
                      <div class="design-main-copy-head">
                        <div class="design-section-label">Teks Utama</div>
                        <p>Isi teks utama desain. Boleh kosong kalau tidak diperlukan.</p>
                      </div>

                      <textarea data-top-text class="design-field-textarea design-main-textarea" placeholder="Teks atas, contoh: nama toko / judul acara"></textarea>
                      <textarea data-middle-text class="design-field-textarea design-main-textarea" placeholder="Teks tengah, contoh: produk utama / promo / layanan"></textarea>
                      <textarea data-bottom-text class="design-field-textarea design-main-textarea" placeholder="Teks bawah, contoh: kontak / alamat / tanggal"></textarea>
                    </div>

                    <div class="design-field-group" style="margin-top:16px;">
                      <label class="design-field-label">Style Visual</label>
                      <select data-style class="design-field-select">
                        <optgroup label="── UMKM / Usaha Kecil ──">
                          <option value="bold flat design, dark navy and vibrant orange, high contrast, icon-based layout, strong readable typography">Bold Flat — Toko / Warung</option>
                          <option value="vibrant street food style, warm red and yellow palette, hand-drawn food icons, energetic layout">Street Food / Kuliner</option>
                          <option value="clean retail promo, white background, bold price tags, product-focused layout, bright accent colors">Promo Retail / Diskon</option>
                          <option value="modern barbershop style, dark background, sharp geometric shapes, monochrome with gold accent">Barbershop / Salon</option>
                          <option value="fresh health aesthetic, green and white, organic shapes, clean sans-serif, natural feel">Kesehatan / Apotek / Herbal</option>
                          <option value="automotive bold, dark industrial background, metallic accents, aggressive typography, speed lines">Otomotif / Bengkel</option>
                          <option value="fashion boutique, soft pastel palette, elegant layout, feminine serif typography, minimal ornaments">Fashion / Butik</option>
                          <option value="tech gadget promo, dark gradient, neon blue accents, futuristic grid lines, bold product showcase">Elektronik / Gadget</option>
                        </optgroup>
                        <optgroup label="── Event / Acara ──">
                          <option value="elegant wedding style, soft gold and ivory, floral ornaments, flowing script typography, romantic mood">Pernikahan / Wedding</option>
                          <option value="professional seminar banner, clean corporate blue and white, structured grid layout, formal sans-serif">Seminar / Konferensi</option>
                          <option value="vibrant music concert poster, dark background, neon lights, dramatic typography, crowd energy">Konser / Musik</option>
                          <option value="festive celebration, bright confetti colors, balloon elements, playful bold typography, party atmosphere">Ulang Tahun / Pesta</option>
                          <option value="sporty event banner, dynamic diagonal lines, bold team colors, athletic typography, action energy">Olahraga / Tournament</option>
                          <option value="islamic event design, geometric arabesque patterns, green and gold palette, elegant calligraphy style">Event Islami / Ramadan</option>
                          <option value="graduation ceremony, navy and gold, formal academic layout, achievement and prestige aesthetic">Wisuda / Kelulusan</option>
                        </optgroup>
                        <optgroup label="── Pemerintahan / Instansi ──">
                          <option value="government formal, red and white Indonesian flag colors, official serif typography, structured hierarchical layout">Instansi Pemerintah</option>
                          <option value="military formal, dark olive and gold, strong structured layout, badges and insignia style">TNI / Polri / Dinas</option>
                          <option value="education institution, blue and white, academic formal, clean structured layout, professional">Sekolah / Universitas</option>
                          <option value="healthcare official, clean white and teal, medical cross symbol, sterile professional layout">Rumah Sakit / Puskesmas</option>
                          <option value="political campaign, bold red-white-blue, patriotic elements, strong leadership portrait placement">Kampanye / Politik</option>
                        </optgroup>
                        <optgroup label="── Premium / Modern ──">
                          <option value="luxury premium, deep black and gold, refined serif typography, minimal layout, high-end brand aesthetic">Luxury Elegant</option>
                          <option value="modern minimalist, clean white space, subtle gray, geometric precision, editorial layout">Modern Minimalist</option>
                          <option value="cinematic dark, dramatic lighting gradients, deep shadows, premium moody atmosphere">Cinematic Dark</option>
                          <option value="tech startup, gradient mesh background, glassmorphism cards, modern sans-serif, innovation feel">Tech / Startup / SaaS</option>
                          <option value="fun colorful, vibrant gradient palette, playful rounded shapes, bubbly typography, youthful energy">Fun Colorful / Youth</option>
                          <option value="retro vintage, muted earthy tones, distressed textures, classic serif, nostalgic feel">Retro / Vintage</option>
                        </optgroup>
                      </select>
                    </div>

                    <div class="design-field-group" style="margin-top:16px;">
                      <label class="design-field-label">Target Output</label>
                      <select data-target class="design-field-select">
                        <option value="banner/spanduk">Banner / Spanduk</option>
                        <option value="poster">Poster</option>
                        <option value="flyer">Flyer</option>
                        <option value="social media post">Social Media Post</option>
                        <option value="billboard/baliho">Billboard / Baliho</option>
                      </select>
                    </div>
                  </div>

                  <div class="design-right-panel">
                    <div class="design-field-group">
                      <label class="design-field-label">Detail Informasi</label>
                      <textarea data-details class="design-field-textarea" placeholder="Masukkan nama usaha/acara, judul utama, promo, harga, tanggal, alamat, kontak, nama pejabat, nama produk, atau detail penting lain."></textarea>
                    </div>

                    <div class="design-field-group">
                      <label class="design-field-label">Catatan Tambahan</label>
                      <textarea data-notes class="design-field-textarea" placeholder="Contoh: logo di kiri atas, foto pejabat di kanan, warna ikut logo, jangan terlalu ramai, teks harus besar dan mudah dibaca."></textarea>
                    </div>

                    <button data-generate-brief class="design-btn-brief" type="button">
                      Generate Brief · 1 Coin
                    </button>

                    <div class="design-field-group" style="flex:1;display:flex;flex-direction:column;">
                      <label class="design-field-label">Hasil Brief</label>
                      <textarea data-brief-result class="design-result-box" style="flex:1;min-height:0;" placeholder="Hasil brief akan muncul di sini..."></textarea>
                    </div>

                    <div class="design-result-actions">
                      <button data-copy-brief class="design-btn-small" type="button">Copy Brief</button>
                      <button data-reset class="design-btn-small" type="button">Reset</button>
                    </div>
                  </div>
                </div>

                <div class="design-soft-separator"></div>

                <div class="design-image-section">
                  <div class="design-image-head">
                    <div>
                      <div class="design-section-label">Generate Gambar</div>
                      <p>
                        Ukuran gambar otomatis mengikuti brief: width, height, dan orientasi.
                      </p>
                    </div>

                    <button data-use-brief class="design-btn-small" type="button">
                      Pakai Brief
                    </button>
                  </div>

                  <div class="design-upload-block" style="margin-bottom:16px;">
                    <div class="design-section-label">Upload Foto Asset</div>
                    <p style="font-size:12px;color:var(--muted,#888);margin-bottom:10px;">Upload foto sesuai aset yang diceklis di Brief. Foto akan ikut dikirim ke AI.</p>
                    <div data-image-upload-list class="design-upload-list"></div>
                    <button class="design-add-asset" type="button" data-add-image-asset>+ Tambah Foto</button>
                  </div>

                  <textarea data-image-prompt class="design-image-prompt" placeholder="Prompt gambar akan otomatis terisi dari hasil brief, atau tulis manual di sini."></textarea>

                  <div class="design-image-controls">
                    <div class="design-auto-size-box" data-auto-size-box>
                      Auto dari brief: <strong data-auto-size-label>Landscape · 1792x1024</strong>
                    </div>

                    <input type="hidden" data-image-size value="1792x1024"/>

                    <button data-generate-image class="design-btn-image" type="button">
                      Generate Gambar · 3 Coin
                    </button>
                  </div>

                  <div data-design-status class="design-status-box"></div>

                  <div data-image-result class="design-image-result">
                    <span class="design-image-placeholder" style="font-family:'Montserrat',sans-serif;font-weight:500;font-size:13px;color:#a9b8ce;">Hasil gambar akan muncul di sini...</span>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      `;

      const uploadList = root.querySelector("[data-upload-list]");
      const addAssetBtn = root.querySelector("[data-add-asset]");
      const imageUploadList = root.querySelector("[data-image-upload-list]");
      const addImageAssetBtn = root.querySelector("[data-add-image-asset]");
      const generateBriefBtn = root.querySelector("[data-generate-brief]");
      const copyBriefBtn = root.querySelector("[data-copy-brief]");
      const resetBtn = root.querySelector("[data-reset]");
      const briefResult = root.querySelector("[data-brief-result]");
      const imagePrompt = root.querySelector("[data-image-prompt]");
      const useBriefBtn = root.querySelector("[data-use-brief]");
      const generateImageBtn = root.querySelector("[data-generate-image]");
      const imageResult = root.querySelector("[data-image-result]");
      const statusBox = root.querySelector("[data-design-status]");
      const tabs = root.querySelectorAll("[data-tab]");

      bindAssetRows();

      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          tabs.forEach(function (item) {
            item.classList.remove("active");
          });

          tab.classList.add("active");

          if (tab.dataset.tab === "image") {
            root.querySelector(".design-image-section").scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          } else {
            root.querySelector(".design-brief-grid").scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }
        });
      });



      if (addImageAssetBtn) {
        addImageAssetBtn.addEventListener("click", function () {
          const index = imageUploadList.querySelectorAll("[data-image-asset-row]").length;
          imageUploadList.insertAdjacentHTML("beforeend", createImageAssetRow(index));
          bindImageAssetRows();
        });
        // Tambah 1 row default
        imageUploadList.insertAdjacentHTML("beforeend", createImageAssetRow(0));
        bindImageAssetRows();
      }

      generateBriefBtn.addEventListener("click", generateBrief);
      copyBriefBtn.addEventListener("click", copyBrief);
      resetBtn.addEventListener("click", resetTool);

      useBriefBtn.addEventListener("click", function () {
        imagePrompt.value = briefResult.value || "";
      });

      generateImageBtn.addEventListener("click", generateImage);

      const ratioEl = root.querySelector("[data-ratio]");
      if (ratioEl) {
        ratioEl.addEventListener("change", getAutoImageSize);
      }

      getAutoImageSize();

      function createAssetRow(index) {
        return `
          <div class="design-upload-row" data-asset-row="${index}">
            <div class="design-asset-preview" data-asset-preview>
              <div class="design-asset-preview-empty">Preview</div>
              <img data-asset-img src="" alt="Asset preview"/>
            </div>

            <div class="design-asset-fields">
              <div class="design-field-group">
                <label class="design-field-label">Upload</label>

                <div class="design-upload-control">
                  <button class="design-upload-btn" type="button" data-upload-btn>Pilih File</button>
                  <button class="design-folder-btn" type="button" data-upload-btn>📁</button>
                  <button class="design-remove-asset-btn" type="button" data-remove-asset>×</button>
                  <input class="design-hidden-file" type="file" accept="image/*" data-asset-input/>
                </div>

                <div class="design-asset-name" data-asset-name>Tambah foto / logo</div>
              </div>

              <div class="design-field-group">
                <label class="design-field-label">Deskripsi Asset</label>
                <input class="design-field-input" type="text" data-asset-desc placeholder="Contoh: logo toko, foto produk, foto pejabat"/>
              </div>
            </div>
          </div>
        `;
      }

      function bindAssetRows() {
        root.querySelectorAll("[data-upload-btn]").forEach(function (btn) {
          if (btn.dataset.bound === "1") return;
          btn.dataset.bound = "1";

          btn.addEventListener("click", function () {
            const row = btn.closest("[data-asset-row]");
            const input = row.querySelector("[data-asset-input]");
            input.click();
          });
        });

        root.querySelectorAll("[data-asset-input]").forEach(function (input) {
          if (input.dataset.bound === "1") return;
          input.dataset.bound = "1";

          input.addEventListener("change", function () {
            const row = input.closest("[data-asset-row]");
            const nameEl = row.querySelector("[data-asset-name]");
            const img = row.querySelector("[data-asset-img]");
            const preview = row.querySelector("[data-asset-preview]");
            const file = input.files && input.files[0] ? input.files[0] : null;

            if (!file) return;

            nameEl.textContent = file.name;

            if (img && preview) {
              const reader = new FileReader();

              reader.onload = function (event) {
                img.src = event.target.result;
                preview.classList.add("has-image");
              };

              reader.readAsDataURL(file);
            }
          });
        });

        root.querySelectorAll("[data-remove-asset]").forEach(function (btn) {
          if (btn.dataset.bound === "1") return;
          btn.dataset.bound = "1";

          btn.addEventListener("click", function () {
            const rows = root.querySelectorAll("[data-asset-row]");
            const row = btn.closest("[data-asset-row]");

            if (rows.length <= 1) {
              resetAssetRow(row);
              return;
            }

            row.remove();
          });
        });
      }

      function resetAssetRow(row) {
        row.querySelector("[data-asset-input]").value = "";
        row.querySelector("[data-asset-desc]").value = "";
        row.querySelector("[data-asset-name]").textContent = "Tambah foto / logo";

        const img = row.querySelector("[data-asset-img]");
        const preview = row.querySelector("[data-asset-preview]");

        if (img && preview) {
          img.src = "";
          preview.classList.remove("has-image");
        }
      }

      function createImageAssetRow(index) {
        return `
          <div class="design-upload-row" data-image-asset-row="${index}" style="grid-template-columns:1fr !important;">
            <input class="design-hidden-file" type="file" accept="image/*" data-image-asset-input/>

            <div class="design-dropzone" data-image-dropzone style="
              border:2px dashed rgba(255,184,0,.5);
              border-radius:14px;
              background:rgba(255,212,0,.06);
              padding:20px 18px 16px;
              cursor:pointer;
              transition:.2s;
              text-align:center;
              position:relative;
            ">
              <div data-image-dropzone-empty style="display:flex;flex-direction:column;align-items:center;gap:6px;">
                <div style="font-size:28px;">🖼️</div>
                <div style="font-size:13px;font-weight:800;color:#b88400;font-family:'Montserrat',sans-serif;">Klik atau seret foto ke sini</div>
                <div style="font-size:11px;color:#a9b8ce;font-weight:600;font-family:'Montserrat',sans-serif;">JPG, PNG, WEBP — maks 10MB</div>
              </div>
              <div data-image-dropzone-preview style="display:none;align-items:center;gap:14px;text-align:left;">
                <img data-image-asset-img src="" alt="preview" style="width:64px;height:64px;object-fit:cover;border-radius:10px;border:1.5px solid rgba(255,184,0,.4);flex-shrink:0;"/>
                <div>
                  <div data-image-asset-name style="font-size:12px;font-weight:800;color:#1a3560;font-family:'Montserrat',sans-serif;word-break:break-all;"></div>
                  <div style="font-size:11px;color:#a9b8ce;margin-top:2px;font-family:'Montserrat',sans-serif;">Klik untuk ganti foto</div>
                </div>
                <button type="button" data-remove-image-asset style="
                  margin-left:auto;
                  width:28px;height:28px;flex-shrink:0;
                  border-radius:6px;border:1.5px solid rgba(185,28,28,.2);
                  background:#fff;color:#b91c1c;font-size:16px;
                  cursor:pointer;display:flex;align-items:center;justify-content:center;
                ">×</button>
              </div>
            </div>

            <div class="design-field-group" style="margin-top:10px;">
              <label class="design-field-label">Deskripsi Foto</label>
              <input class="design-field-input" type="text" data-image-asset-desc placeholder="Contoh: Foto Bupati Budi Santoso, Logo Toko Maju Jaya"/>
            </div>
          </div>
        `;
      }

      function bindImageAssetRows() {
        root.querySelectorAll("[data-image-asset-row]").forEach(function (row) {
          if (row.dataset.bound === "1") return;
          row.dataset.bound = "1";

          const input = row.querySelector("[data-image-asset-input]");
          const dropzone = row.querySelector("[data-image-dropzone]");
          const emptyState = row.querySelector("[data-image-dropzone-empty]");
          const previewState = row.querySelector("[data-image-dropzone-preview]");
          const previewImg = row.querySelector("[data-image-asset-img]");
          const nameEl = row.querySelector("[data-image-asset-name]");
          const removeBtn = row.querySelector("[data-remove-image-asset]");

          function applyFile(file) {
            if (!file || !file.type.startsWith("image/")) return;
            nameEl.textContent = file.name;
            const reader = new FileReader();
            reader.onload = function (e) {
              previewImg.src = e.target.result;
              emptyState.style.display = "none";
              previewState.style.display = "flex";
            };
            reader.readAsDataURL(file);
          }

          // Klik dropzone → buka file picker
          dropzone.addEventListener("click", function (e) {
            if (e.target === removeBtn || removeBtn.contains(e.target)) return;
            input.click();
          });

          // Hover effect
          dropzone.addEventListener("mouseenter", function () {
            dropzone.style.borderColor = "rgba(255,138,0,.8)";
            dropzone.style.background = "rgba(255,212,0,.12)";
          });
          dropzone.addEventListener("mouseleave", function () {
            dropzone.style.borderColor = "rgba(255,184,0,.5)";
            dropzone.style.background = "rgba(255,212,0,.06)";
          });

          // Drag & drop
          dropzone.addEventListener("dragover", function (e) {
            e.preventDefault();
            dropzone.style.borderColor = "rgba(255,138,0,.8)";
            dropzone.style.background = "rgba(255,212,0,.18)";
          });
          dropzone.addEventListener("dragleave", function () {
            dropzone.style.borderColor = "rgba(255,184,0,.5)";
            dropzone.style.background = "rgba(255,212,0,.06)";
          });
          dropzone.addEventListener("drop", function (e) {
            e.preventDefault();
            dropzone.style.borderColor = "rgba(255,184,0,.5)";
            dropzone.style.background = "rgba(255,212,0,.06)";
            const file = e.dataTransfer.files && e.dataTransfer.files[0];
            if (file) applyFile(file);
          });

          // Input change
          input.addEventListener("change", function () {
            const file = input.files && input.files[0];
            if (file) applyFile(file);
          });

          // Remove
          if (removeBtn) {
            removeBtn.addEventListener("click", function (e) {
              e.stopPropagation();
              const rows = root.querySelectorAll("[data-image-asset-row]");
              if (rows.length <= 1) {
                input.value = "";
                previewImg.src = "";
                nameEl.textContent = "";
                emptyState.style.display = "flex";
                previewState.style.display = "none";
                return;
              }
              row.remove();
            });
          }
        });
      }

      function getAutoImageSize() {
        const ratioEl = root.querySelector("[data-ratio]");
        const val = ratioEl ? ratioEl.value : "16:9|1536x1024|Landscape";
        const parts = val.split("|");
        const ratio = parts[0] || "16:9";
        const size = parts[1] || "1536x1024";
        const orientation = parts[2] || "Landscape";

        const sizeInput = root.querySelector("[data-image-size]");
        const sizeLabel = root.querySelector("[data-auto-size-label]");

        if (sizeInput) sizeInput.value = size;
        if (sizeLabel) sizeLabel.textContent = orientation + " · " + ratio + " · " + size;

        return size;
      }

      function getConfig() {
        return window.RANZAI_CONFIG || {};
      }

      function getDesignUrl() {
        const config = getConfig();
        const base = (config.SUPABASE_URL || "").replace(/\/$/, "");
        const path = config.FUNCTIONS && config.FUNCTIONS.DESIGN
          ? config.FUNCTIONS.DESIGN
          : "/functions/v1/design";

        return base + path;
      }

      function getApiKey() {
        const config = getConfig();
        return config.SUPABASE_ANON_KEY || "";
      }

      function getSupabaseClient() {
        if (window.RANZAI_SUPABASE) return window.RANZAI_SUPABASE;
        if (!window.supabase) return null;

        const config = getConfig();
        const url = config.SUPABASE_URL;
        const key = config.SUPABASE_ANON_KEY;

        if (!url || !key) return null;

        window.RANZAI_SUPABASE = window.supabase.createClient(url, key);
        return window.RANZAI_SUPABASE;
      }

      async function getUserId() {
        const client = getSupabaseClient();
        if (!client) return null;

        try {
          const { data } = await client.auth.getSession();
          return data && data.session && data.session.user
            ? data.session.user.id
            : null;
        } catch (e) {
          return null;
        }
      }

      async function checkCoinBalance(userId) {
        // Coin check sekarang dilakukan di backend — ini hanya fallback display
        try {
          const client = window.RANZAI_SUPABASE;
          if (!client) return 0;
          const { data, error } = await client
            .from("coin_balance")
            .select("balance")
            .eq("user_id", userId)
            .maybeSingle();
          if (error) return 0;
          return data && data.balance ? Number(data.balance) : 0;
        } catch (e) {
          return 0;
        }
      }

      async function getAuthToken() {
        const client = getSupabaseClient();

        if (client && client.auth) {
          const { data, error } = await client.auth.getSession();

          if (!error && data && data.session && data.session.access_token) {
            return data.session.access_token;
          }
        }

        return getApiKey();
      }

      function showStatus(type, message) {
        statusBox.className = "design-status-box show";
        if (type) statusBox.classList.add(type);
        statusBox.textContent = message;
      }

      function clearStatus() {
        statusBox.className = "design-status-box";
        statusBox.textContent = "";
      }

      function collectAssets() {
        const checks = Array.from(root.querySelectorAll("[data-asset-type]"));
        return checks
          .filter(function (cb) { return cb.checked; })
          .map(function (cb) {
            const qty = cb.closest("label").querySelector("[data-asset-qty]");
            return {
              description: cb.dataset.assetType,
              quantity: qty ? parseInt(qty.value) || 1 : 1,
              hasFile: false
            };
          });
      }

      function collectImageAssets() {
        const rows = Array.from(root.querySelectorAll("[data-image-asset-row]"));
        const promises = rows.map(function (row) {
          const input = row.querySelector("[data-image-asset-input]");
          const file = input && input.files && input.files[0] ? input.files[0] : null;
          if (!file) return Promise.resolve(null);
          return new Promise(function (resolve) {
            const reader = new FileReader();
            const desc = row.querySelector("[data-image-asset-desc]");
            reader.onload = function (e) {
              const b64 = e.target.result.split(",")[1];
              resolve({
                base64: b64,
                mediaType: file.type || "image/jpeg",
                description: desc ? desc.value.trim() : ""
              });
            };
            reader.readAsDataURL(file);
          });
        });
        return Promise.all(promises).then(function (results) {
          return results.filter(Boolean);
        });
      }

      function collectPayload(mode) {
        return {
          mode,
          ratio: (root.querySelector("[data-ratio]") ? root.querySelector("[data-ratio]").value.split("|")[0] : "16:9"),
          orientation: (root.querySelector("[data-ratio]") ? root.querySelector("[data-ratio]").value.split("|")[2] : "Landscape"),
          imageSize: getAutoImageSize(),
          topText: root.querySelector("[data-top-text]").value.trim(),
          middleText: root.querySelector("[data-middle-text]").value.trim(),
          bottomText: root.querySelector("[data-bottom-text]").value.trim(),
          details: root.querySelector("[data-details]").value.trim(),
          notes: root.querySelector("[data-notes]").value.trim(),
          visualStyle: root.querySelector("[data-style]").value,
          targetOutput: root.querySelector("[data-target]").value,
          assets: collectAssets(),
          brief: briefResult.value.trim(),
          imagePrompt: imagePrompt.value.trim(),
          imageSize: getAutoImageSize()
        };
      }

      async function callDesignFunction(payload, userId, authToken) {
        const url = getDesignUrl();
        const apiKey = getApiKey();

        if (!url || !apiKey) {
          throw new Error("Config Supabase belum terbaca. Cek /scripts/core/app.js.");
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + authToken,
            "apikey": apiKey
          },
          body: JSON.stringify({ ...payload, user_id: userId })
        });

        const data = await response.json().catch(function () {
          return null;
        });

        if (!response.ok || !data || data.error) {
          throw new Error(data && data.error ? data.error : "Request gagal.");
        }

        return data;
      }

      async function generateBrief() {
        // ── Coin guard ────────────────────────────────────────────
        const userId = await getUserId();

        if (!userId) {
          showStatus("error", "Kamu harus login untuk menggunakan tool ini.");
          return;
        }

        // Coin check dilakukan di backend
        // ─────────────────────────────────────────────────────────

        generateBriefBtn.disabled = true;
        generateBriefBtn.textContent = "Generating brief...";
        clearStatus();

        try {
          const authToken = await getAuthToken();
          const payload = collectPayload("brief");
          const data = await callDesignFunction(payload, userId, authToken);

          briefResult.value = data.brief || data.result || "";
          imagePrompt.value = briefResult.value;

          if (!briefResult.value) {
            throw new Error("Hasil brief kosong.");
          }

          showStatus("success", "Brief berhasil dibuat.");
          if (typeof data.balance === "number") {
            const s = document.getElementById("sidebarCoinBalance");
            const c = document.getElementById("creditNumber");
            if (s) s.textContent = data.balance + " coin";
            if (c) c.textContent = data.balance;
          }
        } catch (error) {
          showStatus("error", "Gagal generate brief: " + error.message);
        } finally {
          generateBriefBtn.disabled = false;
          generateBriefBtn.textContent = "Generate Brief · 1 Coin";
        }
      }

      async function generateImage() {
        // ── Coin guard ────────────────────────────────────────────
        const userId = await getUserId();

        if (!userId) {
          showStatus("error", "Kamu harus login untuk menggunakan tool ini.");
          return;
        }

        // Coin check dilakukan di backend
        // ─────────────────────────────────────────────────────────

        generateImageBtn.disabled = true;
        generateImageBtn.textContent = "Generating...";
        clearStatus();

        imageResult.className = "design-image-result has-content";
        imageResult.innerHTML = "AI sedang membuat gambar...";

        try {
          const authToken = await getAuthToken();
          const payload = collectPayload("image");

          if (!payload.imagePrompt && !payload.brief) {
            throw new Error("Isi prompt gambar atau generate brief dulu.");
          }

          const images = await collectImageAssets();
          if (images.length > 0) payload.images = images;

          const data = await callDesignFunction(payload, userId, authToken);
          const imageUrl = data.imageUrl || data.url || data.output || "";

          if (!imageUrl) {
            throw new Error("Output gambar kosong.");
          }

          imageResult.className = "design-image-result has-image";
          imageResult.innerHTML = `
            <img src="${imageUrl}" alt="RanzAI Design Result"/>
            <div class="design-image-actions">
              <a href="${imageUrl}" target="_blank" rel="noopener" class="design-img-action-btn design-img-btn-open">
                🔗 Buka di Tab Baru
              </a>
              <button type="button" class="design-img-action-btn design-img-btn-download" data-img-url="${imageUrl}">
                ⬇️ Download
              </button>
            </div>
          `;

          // bind download button
          const dlBtn = imageResult.querySelector("[data-img-url]");
          if (dlBtn) {
            dlBtn.addEventListener("click", async function () {
              const url = dlBtn.dataset.imgUrl;
              try {
                const res = await fetch(url);
                const blob = await res.blob();
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "ranzai-design-" + Date.now() + ".png";
                a.click();
                URL.revokeObjectURL(a.href);
              } catch (e) {
                window.open(url, "_blank");
              }
            });
          }

          showStatus("success", "Gambar berhasil dibuat.");
          if (typeof data.balance === "number") {
            const s = document.getElementById("sidebarCoinBalance");
            const c = document.getElementById("creditNumber");
            if (s) s.textContent = data.balance + " coin";
            if (c) c.textContent = data.balance;
          }
        } catch (error) {
          imageResult.className = "design-image-result has-content";
          imageResult.textContent = "Gagal generate gambar: " + error.message;
          showStatus("error", "Gagal generate gambar: " + error.message);
        } finally {
          generateImageBtn.disabled = false;
          generateImageBtn.textContent = "Generate Gambar · 3 Coin";
        }
      }

      function copyBrief() {
        const text = briefResult.value;
        if (!text) return;

        navigator.clipboard.writeText(text).then(function () {
          copyBriefBtn.textContent = "Tersalin!";
          setTimeout(function () {
            copyBriefBtn.textContent = "Copy Brief";
          }, 1600);
        });
      }

      function resetTool() {
        root.querySelectorAll("input, textarea").forEach(function (el) {
          el.value = "";
        });

        const ratioReset = root.querySelector("[data-ratio]");
        if (ratioReset) ratioReset.value = "16:9|1536x1024|Landscape";
        root.querySelector("[data-style]").value = "bold flat design, dark navy and vibrant orange, high contrast, icon-based layout, strong readable typography";
        root.querySelector("[data-target]").value = "banner/spanduk";

        briefResult.value = "";
        imagePrompt.value = "";
        imageResult.className = "design-image-result";
        imageResult.innerHTML = '<span class="design-image-placeholder" style="font-family:\'Montserrat\',sans-serif;font-weight:500;font-size:13px;color:#a9b8ce;">Hasil gambar akan muncul di sini...</span>';

        // Reset checklist
        root.querySelectorAll("[data-asset-type]").forEach(function (cb) { cb.checked = false; });
        root.querySelectorAll("[data-asset-qty]").forEach(function (qty) { qty.value = 1; });

        // Reset image upload list
        if (imageUploadList) {
          imageUploadList.innerHTML = createImageAssetRow(0);
          bindImageAssetRows();
        }

        clearStatus();
        getAutoImageSize();
      }
    }
  };
})();
