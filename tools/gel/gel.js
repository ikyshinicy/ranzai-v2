(function () {
  window.RanzTools = window.RanzTools || {};

  window.RanzTools.gel = {
    render(container) {
      const root = typeof container === "string" ? document.querySelector(container) : container;
      if (!root) return;

      let selectedScale = 4;
      let selectedCoin = 2;
      let originalDataUrl = "";
      let resultImageUrl = "";
      let sliderInitialized = false;

      root.innerHTML = `
        <div class="ranz-tool ranz-gel-tool">
          <div class="gel-hero">
            <div class="gel-badge">
              <span class="gel-badge-dot"></span>
              RanzAI Gel · Poles Foto Wajah
            </div>

            <h1 class="gel-title">
              Poles Foto Wajahmu<br>
              <span>Jadi Jernih & Tajam</span>
            </h1>

            <p class="gel-sub">
              Upload foto wajah buram, pecah, atau resolusi rendah. AI langsung poles jadi tajam dan jernih secara otomatis.
            </p>
          </div>

          <div class="gel-wrap">
            <div class="gel-card">
              <div class="gel-body">

                <div class="gel-dropzone" data-dropzone>
                  <input type="file" data-file-input accept="image/jpeg,image/png,image/webp"/>
                  <div class="gel-dz-icon">🖼️</div>

                  <div class="gel-dz-body">
                    <div class="gel-dz-title">Upload Foto Wajah</div>
                    <p class="gel-dz-hint">Seret & lepas foto ke sini, atau klik untuk pilih file</p>
                    <div class="gel-dz-types">
                      <span>JPG</span>
                      <span>PNG</span>
                      <span>WEBP</span>
                    </div>
                  </div>

                  <button type="button" class="gel-dz-btn">📁 Pilih File</button>
                </div>

                <div class="gel-preview" data-preview>
                  <div class="gel-preview-info">
                    <div class="gel-preview-icon">🖼️</div>

                    <div class="gel-preview-meta">
                      <div class="gel-preview-filename" data-preview-filename>foto.jpg</div>
                      <div class="gel-preview-details">
                        <span class="gel-preview-badge" data-preview-ext>JPG</span>
                        <span class="gel-preview-badge green" data-preview-size>—</span>
                        <span class="gel-preview-badge" data-preview-dims>—</span>
                      </div>
                    </div>

                    <button class="gel-preview-change" type="button" data-change-btn>Ganti Foto</button>
                  </div>

                  <div class="gel-preview-ready">Foto siap diproses</div>
                </div>

                <div class="gel-scale-wrap" data-scale-wrap>
                  <div class="gel-section-label">Tingkat Peningkatan</div>

                  <div class="gel-scale-options">
                    <button class="gel-scale-btn" type="button" data-scale="2" data-coin="1">
                      <div>2×</div>
                      <small>Ringan · 1 coin</small>
                    </button>

                    <button class="gel-scale-btn active" type="button" data-scale="4" data-coin="2">
                      <div>4×</div>
                      <small>Standar · 2 coin</small>
                    </button>

                    <button class="gel-scale-btn" type="button" data-scale="8" data-coin="3">
                      <div>8×</div>
                      <small>Maksimal · 3 coin</small>
                    </button>
                  </div>
                </div>

                <button class="gel-generate-btn" type="button" data-generate-btn>
                  ✨ Poles Sekarang · 2 coin
                </button>

                <div class="gel-loading" data-loading>
                  <div class="gel-loading-spinner"></div>
                  <p class="gel-loading-text" data-loading-text>AI sedang memoles foto kamu...</p>
                  <p class="gel-loading-sub">Biasanya selesai dalam 3–10 detik</p>
                </div>

                <div class="gel-error" data-error></div>

                <div class="gel-result" data-result>
                  <div class="gel-result-header">
                    <div class="gel-result-label">Hasil Peningkatan</div>

                    <div class="gel-result-actions">
                      <button class="gel-action-btn download" type="button" data-download-btn>
                        Download Foto
                      </button>

                      <button class="gel-action-btn" type="button" data-clear-btn>
                        Bersihkan
                      </button>
                    </div>
                  </div>

                  <div class="gel-slider" data-slider>
                    <img data-before-img src="" alt="Before" class="gel-slider-base"/>

                    <div class="gel-slider-overlay" data-slider-overlay>
                      <img data-after-img src="" alt="After"/>
                    </div>

                    <div class="gel-slider-line" data-slider-line>
                      <div class="gel-slider-btn">◀▶</div>
                    </div>

                    <div class="gel-slider-tag before">Before</div>
                    <div class="gel-slider-tag after">After ✨</div>
                  </div>

                  <p class="gel-result-note">
                    Hasil terbaik untuk foto wajah dengan pencahayaan cukup.
                  </p>

                  <button class="gel-generate-btn" type="button" data-download-bottom-btn style="margin-top:8px;">
                    ⬇️ Download Hasil
                  </button>
                </div>

              </div>
            </div>
          </div>

          <div class="gel-tips">
            <div class="gel-tips-head">
              <div class="gel-section-label">Tips Penggunaan</div>
              <h2>Hasil <span>Lebih Maksimal</span></h2>
            </div>

            <div class="gel-tips-grid">
              <div class="gel-tip-card">
                <div class="gel-tip-icon">👤</div>
                <div class="gel-tip-title">Fokus ke Wajah</div>
                <p>AI bekerja paling baik untuk foto yang ada wajah manusianya.</p>
              </div>

              <div class="gel-tip-card">
                <div class="gel-tip-icon">📸</div>
                <div class="gel-tip-title">Foto Lama Cocok Banget</div>
                <p>Foto lama yang buram atau pecah adalah kandidat terbaik.</p>
              </div>

              <div class="gel-tip-card">
                <div class="gel-tip-icon">⚖️</div>
                <div class="gel-tip-title">Pilih Scale yang Tepat</div>
                <p>Scale 2× untuk ringan, 4× standar, 8× untuk foto sangat buram.</p>
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
      const scaleWrap = root.querySelector("[data-scale-wrap]");
      const generateBtn = root.querySelector("[data-generate-btn]");
      const loading = root.querySelector("[data-loading]");
      const loadingText = root.querySelector("[data-loading-text]");
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

      function getGelUrl() {
        const config = getConfig();
        const base = (config.SUPABASE_URL || "").replace(/\/$/, "");
        const path = config.FUNCTIONS && config.FUNCTIONS.GEL
          ? config.FUNCTIONS.GEL
          : "/functions/v1/gel";

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
        scaleWrap.style.display = isProcessing ? "none" : (originalDataUrl ? "block" : "none");
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
          scaleWrap.style.display = "block";
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

      async function enhance() {
        if (!originalDataUrl) {
          showError("Pilih foto dulu.");
          return;
        }

        const url = getGelUrl();
        const apiKey = getApiKey();

        if (!url || !apiKey) {
          showError("Config Supabase belum terbaca. Cek /scripts/core/app.js.");
          return;
        }

        hideError();
        result.classList.remove("show");
        setProcessing(true);

        try {
          loadingText.textContent = "Mengupload foto...";
          const imageUrl = await uploadToImgBB();

          loadingText.textContent = "AI sedang memoles foto kamu...";

          const authToken = await getAuthToken();

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + authToken,
              "apikey": apiKey
            },
            body: JSON.stringify({
              imageUrl,
              scale: selectedScale
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
        link.download = "ranzai-gel-hasil.png";
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

        if (afterImg.complete) setup();
        else afterImg.onload = setup;

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
        scaleWrap.style.display = "none";
        result.classList.remove("show");
        hideError();

        beforeImg.src = "";
        afterImg.src = "";
        fileInput.value = "";

        sliderOverlay.style.width = "50%";
        sliderLine.style.left = "50%";
      }

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

      generateBtn.addEventListener("click", enhance);
      downloadBtn.addEventListener("click", downloadResult);
      if (downloadBottomBtn) downloadBottomBtn.addEventListener("click", downloadResult);
      clearBtn.addEventListener("click", clearAll);

      root.querySelectorAll("[data-scale]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          selectedScale = Number(btn.dataset.scale || 4);
          selectedCoin = Number(btn.dataset.coin || 2);

          root.querySelectorAll("[data-scale]").forEach(function (item) {
            item.classList.remove("active");
          });

          btn.classList.add("active");
          generateBtn.textContent = "✨ Poles Sekarang · " + selectedCoin + " coin";
        });
      });
    }
  };
})();
