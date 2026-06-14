(function () {
  window.RanzTools = window.RanzTools || {};

  window.RanzTools.cut = {
    render(container) {
      const root = typeof container === "string" ? document.querySelector(container) : container;
      if (!root) return;

      let selectedBg = "rgba";
      let originalDataUrl = "";
      let resultImageUrl = "";
      let sliderInitialized = false;

      root.innerHTML = `
        <div class="ranz-tool ranz-cut-tool">
          <div class="cut-hero">
            <div class="cut-badge">
              <span class="cut-badge-dot"></span>
              RanzAI Cut · Hapus Background Foto
            </div>

            <h1 class="cut-title">
              Hapus Background Foto<br>
              <span>Seketika & Akurat</span>
            </h1>

            <p class="cut-sub">
              Upload foto produk, portrait, atau objek. AI langsung hapus background dalam hitungan detik.
              Output PNG transparan siap pakai.
            </p>
          </div>

          <div class="cut-wrap">
            <div class="cut-card">
              <div class="cut-body">

                <div class="cut-dropzone" data-dropzone>
                  <input type="file" data-file-input accept="image/jpeg,image/png,image/webp"/>
                  <div class="cut-dz-icon">🖼️</div>

                  <div class="cut-dz-body">
                    <div class="cut-dz-title">Upload Foto</div>
                    <p class="cut-dz-hint">Seret & lepas foto ke sini, atau klik untuk pilih file</p>
                    <div class="cut-dz-types">
                      <span>JPG</span>
                      <span>PNG</span>
                      <span>WEBP</span>
                    </div>
                  </div>

                  <button type="button" class="cut-dz-btn">📁 Pilih File</button>
                </div>

                <div class="cut-preview" data-preview>
                  <div class="cut-preview-info">
                    <div class="cut-preview-icon">✂️</div>

                    <div class="cut-preview-meta">
                      <div class="cut-preview-filename" data-preview-filename>foto.jpg</div>
                      <div class="cut-preview-details">
                        <span class="cut-preview-badge" data-preview-ext>JPG</span>
                        <span class="cut-preview-badge green" data-preview-size>—</span>
                        <span class="cut-preview-badge" data-preview-dims>—</span>
                      </div>
                    </div>

                    <button class="cut-preview-change" type="button" data-change-btn>Ganti Foto</button>
                  </div>

                  <div class="cut-preview-ready">Foto siap diproses</div>
                </div>

                <button class="cut-generate-btn" type="button" data-generate-btn>
                  ✂️ Hapus Background Sekarang · 1 Coin
                </button>

                <div class="cut-loading" data-loading>
                  <div class="cut-loading-spinner"></div>
                  <p class="cut-loading-text">AI sedang memproses foto kamu...</p>
                  <p class="cut-loading-sub">Biasanya selesai dalam 3–10 detik</p>
                </div>

                <div class="cut-error" data-error></div>

                <div class="cut-result" data-result>
                  <div class="cut-result-header">
                    <div class="cut-result-label">Hasil Remove Background</div>

                    <div class="cut-result-actions">
                      <button class="cut-action-btn download" type="button" data-download-btn>
                        Download PNG
                      </button>

                      <button class="cut-action-btn" type="button" data-clear-btn>
                        Foto Baru
                      </button>
                    </div>
                  </div>

                  <div class="cut-slider" data-slider>
                    <img data-before-img src="" alt="Before" class="cut-slider-base"/>

                    <div class="cut-slider-overlay" data-slider-overlay>
                      <img data-after-img src="" alt="After"/>
                    </div>

                    <div class="cut-slider-line" data-slider-line>
                      <div class="cut-slider-btn">◀▶</div>
                    </div>

                    <div class="cut-slider-tag before">Before</div>
                    <div class="cut-slider-tag after">After ✂️</div>
                  </div>

                  <p class="cut-result-note">
                    Hasil terbaik untuk foto dengan background yang kontras dengan objek utama.
                  </p>

                  <button class="cut-generate-btn" type="button" data-download-bottom-btn style="margin-top:8px;">
                    ⬇️ Download PNG
                  </button>
                </div>

              </div>
            </div>
          </div>

          <div class="cut-tips">
            <div class="cut-tips-head">
              <div class="cut-section-label">Tips Penggunaan</div>
              <h2>Hasil <span>Lebih Sempurna</span></h2>
            </div>

            <div class="cut-tips-grid">
              <div class="cut-tip-card">
                <div class="cut-tip-icon">🎯</div>
                <div class="cut-tip-title">Background Kontras</div>
                <p>Foto dengan background polos atau warna solid menghasilkan potongan yang paling bersih.</p>
              </div>

              <div class="cut-tip-card">
                <div class="cut-tip-icon">🛍️</div>
                <div class="cut-tip-title">Cocok untuk Produk & Portrait</div>
                <p>Ideal untuk foto produk e-commerce, foto profil, atau gambar objek.</p>
              </div>

              <div class="cut-tip-card">
                <div class="cut-tip-icon">📐</div>
                <div class="cut-tip-title">Resolusi Tinggi = Edge Halus</div>
                <p>Semakin tinggi resolusi foto, semakin halus edge hasil potongannya.</p>
              </div>
            </div>
          </div>
        </div>
      `;

      const dropzone = root.querySelector("[data-dropzone]");
      const fileInput = root.querySelector("[data-file-input]");
      const preview = root.querySelector("[data-preview]");
      const previewFilename = root.querySelector("[data-preview-filename]");
      const previewExt = root.querySelector("[data-preview-ext]");
      const previewSize = root.querySelector("[data-preview-size]");
      const previewDims = root.querySelector("[data-preview-dims]");
      const changeBtn = root.querySelector("[data-change-btn]");
      const generateBtn = root.querySelector("[data-generate-btn]");
      const loading = root.querySelector("[data-loading]");
      const errorBox = root.querySelector("[data-error]");
      const result = root.querySelector("[data-result]");
      const beforeImg = root.querySelector("[data-before-img]");
      const afterImg = root.querySelector("[data-after-img]");
      const downloadBtn = root.querySelector("[data-download-btn]");
      const downloadBottomBtn = root.querySelector("[data-download-bottom-btn]");
      const clearBtn = root.querySelector("[data-clear-btn]");
      const slider = root.querySelector("[data-slider]");
      const sliderOverlay = root.querySelector("[data-slider-overlay]");
      const sliderLine = root.querySelector("[data-slider-line]");

      function getConfig() {
        return window.RANZAI_CONFIG || {};
      }

      function getCutUrl() {
        const config = getConfig();
        const base = (config.SUPABASE_URL || "").replace(/\/$/, "");
        const path = config.FUNCTIONS && config.FUNCTIONS.CUT
          ? config.FUNCTIONS.CUT
          : "/functions/v1/cut";

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

      function formatSize(bytes) {
        if (!bytes) return "—";
        if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + " MB";
        return Math.round(bytes / 1024) + " KB";
      }

      function showError(message) {
        errorBox.textContent = message;
        errorBox.classList.add("show");
      }

      function hideError() {
        errorBox.textContent = "";
        errorBox.classList.remove("show");
      }

      function setProcessing(isProcessing) {
        generateBtn.style.display = isProcessing ? "none" : (originalDataUrl ? "block" : "none");
        loading.classList.toggle("show", Boolean(isProcessing));
      }

      function handleFile(file) {
        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          showError("Format tidak didukung. Gunakan JPG, PNG, atau WEBP.");
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          showError("Ukuran file terlalu besar. Maksimal 10MB.");
          return;
        }

        hideError();

        const reader = new FileReader();

        reader.onload = function (event) {
          originalDataUrl = event.target.result;

          const ext = (file.name.split(".").pop() || "IMG").toUpperCase();

          previewFilename.textContent = file.name;
          previewExt.textContent = ext;
          previewSize.textContent = formatSize(file.size);

          const img = new Image();

          img.onload = function () {
            previewDims.textContent = img.width + " × " + img.height + " px";
          };

          img.src = originalDataUrl;

          dropzone.style.display = "none";
          preview.classList.add("show");
          generateBtn.style.display = "block";
          result.classList.remove("show");
        };

        reader.onerror = function () {
          showError("Gagal membaca file gambar.");
        };

        reader.readAsDataURL(file);
      }

      async function uploadToImgBB() {
        const base64Only = originalDataUrl.split(",")[1];
        const formData = new FormData();
        formData.append("image", base64Only);

        const response = await fetch("https://api.imgbb.com/1/upload?key=020265a5a22cd028911442244dd0c79b", {
          method: "POST",
          body: formData
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data && data.error && data.error.message ? data.error.message : "Gagal upload foto.");
        }

        return data.data.url;
      }

      async function processImage() {
        if (!originalDataUrl) {
          showError("Pilih foto dulu.");
          return;
        }

        const url = getCutUrl();
        const apiKey = getApiKey();

        if (!url || !apiKey) {
          showError("Config Supabase belum terbaca. Cek /scripts/core/app.js.");
          return;
        }

        hideError();
        result.classList.remove("show");
        setProcessing(true);

        try {
          const authToken = await getAuthToken();
          const imageUrl = await uploadToImgBB();

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + authToken,
              "apikey": apiKey
            },
            body: JSON.stringify({
              imageUrl,
              background: selectedBg
            })
          });

          let data = null;

          try {
            data = await response.json();
          } catch (e) {}

          if (!response.ok || !data || data.error) {
            throw new Error(data && data.error ? data.error : "Gagal memproses foto.");
          }

          resultImageUrl = data.output || data.image || data.url || "";

          if (!resultImageUrl) {
            throw new Error("Output gambar tidak ditemukan dari server.");
          }

          beforeImg.src = resultImageUrl;
          afterImg.src = originalDataUrl;
          result.classList.add("show");

          initSlider();

          result.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } catch (error) {
          showError("Gagal memproses: " + error.message);
        } finally {
          setProcessing(false);
        }
      }

      function downloadResult() {
        if (!resultImageUrl) return;

        const link = document.createElement("a");
        link.href = resultImageUrl;
        link.download = "ranzai-cut-hasil.png";
        link.target = "_blank";
        link.click();
      }

      function initSlider() {
        function setup() {
          const width = slider.offsetWidth;
          afterImg.style.width = width + "px";
          setPos(50);
        }

        function setPos(percent) {
          const pct = Math.max(2, Math.min(98, percent));
          sliderOverlay.style.width = pct + "%";
          sliderLine.style.left = pct + "%";
        }

        function getX(event) {
          return event.touches ? event.touches[0].clientX : event.clientX;
        }

        function move(event) {
          event.preventDefault();
          const rect = slider.getBoundingClientRect();
          const percent = ((getX(event) - rect.left) / rect.width) * 100;
          setPos(percent);
        }

        if (beforeImg.complete) setup();
        else beforeImg.onload = setup;

        if (!sliderInitialized) {
          sliderInitialized = true;

          slider.addEventListener("mousedown", function (event) {
            move(event);

            function off() {
              document.removeEventListener("mousemove", move);
              document.removeEventListener("mouseup", off);
            }

            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", off);
          });

          slider.addEventListener("touchstart", function (event) {
            move(event);

            function off() {
              document.removeEventListener("touchmove", move);
              document.removeEventListener("touchend", off);
            }

            document.addEventListener("touchmove", move, { passive: false });
            document.addEventListener("touchend", off);
          }, { passive: false });

          window.addEventListener("resize", setup);
        }
      }

      function clearAll() {
        originalDataUrl = "";
        resultImageUrl = "";
        sliderInitialized = false;

        preview.classList.remove("show");
        dropzone.style.display = "";
        generateBtn.style.display = "none";
        result.classList.remove("show");
        hideError();

        beforeImg.src = "";
        afterImg.src = "";
        fileInput.value = "";

        sliderOverlay.style.width = "50%";
        sliderLine.style.left = "50%";
      }

      generateBtn.addEventListener("click", processImage);
      downloadBtn.addEventListener("click", downloadResult);
      if (downloadBottomBtn) downloadBottomBtn.addEventListener("click", downloadResult);
      clearBtn.addEventListener("click", clearAll);

      dropzone.addEventListener("dragover", function (event) {
        event.preventDefault();
        dropzone.classList.add("drag-over");
      });

      dropzone.addEventListener("dragleave", function () {
        dropzone.classList.remove("drag-over");
      });

      dropzone.addEventListener("drop", function (event) {
        event.preventDefault();
        dropzone.classList.remove("drag-over");

        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
          handleFile(event.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener("change", function (event) {
        if (event.target.files && event.target.files[0]) {
          handleFile(event.target.files[0]);
        }
      });

      changeBtn.addEventListener("click", function () {
        fileInput.click();
      });

      generateBtn.addEventListener("click", processImage);
      downloadBtn.addEventListener("click", downloadResult);
      clearBtn.addEventListener("click", clearAll);
    }
  };
})();
