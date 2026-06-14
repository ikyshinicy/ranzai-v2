(function () {
  window.RanzTools = window.RanzTools || {};

  window.RanzTools.vector = {
    render(container) {
      const root = typeof container === "string" ? document.querySelector(container) : container;
      if (!root) return;

      let imageBase64 = null;
      let imageMediaType = null;
      let resultImageBase64 = null;
      let currentStyleMode = "bw";

      const STYLE_MODES = [
        { id: "bw",          label: "Black & White" },
        { id: "clean_color", label: "Clean Color"   },
        { id: "logo",        label: "Logo Trace"    },
        { id: "sticker",     label: "Sticker"       },
        { id: "lineart",     label: "Line Art"      },
      ];

      root.innerHTML = `
        <div class="ranz-tool ranz-vector-tool">

          <div class="tool-hero">
            <div class="tool-chip"><span class="chip-dot"></span>Tool · Image Vectorizer</div>
            <h1>Upload Gambar,<br>Jadikan <span>Vektor.</span></h1>
            <p>Upload gambar apapun. AI akan mengubahnya menjadi PNG bergaya vektor clean sesuai style pilihan kamu.</p>
          </div>

          <div class="vector-workspace">

            <!-- KIRI: Upload -->
            <div class="vector-panel vector-panel--left">
              <div class="panel-label">Gambar Input</div>

              <div class="upload-zone" data-upload-zone>
                <input type="file" data-file-input accept="image/jpeg,image/png,image/webp,image/gif"/>
                <div class="upload-icon">⇧</div>
                <div class="upload-title">Drop gambar atau klik untuk pilih</div>
                <div class="upload-sub">JPG · PNG · WEBP · GIF · Maks 10MB</div>
              </div>

              <div class="preview-zone" data-preview-zone>
                <img data-preview-img src="" alt="preview"/>
                <div class="preview-actions">
                  <span class="file-name" data-file-name>—</span>
                  <button class="change-btn" type="button" data-change-btn>✕ Ganti</button>
                </div>
              </div>

              <div class="tool-option-group">
                <div class="section-label">Style Mode</div>
                <div class="style-row" data-style-row>
                  ${STYLE_MODES.map(function (m, i) {
                    return `<button type="button" class="style-btn${i === 0 ? " active" : ""}" data-style="${m.id}">${m.label}</button>`;
                  }).join("")}
                </div>
              </div>

              <button class="generate-btn" type="button" data-generate-btn disabled>
                ✦ Generate Vector &nbsp;<span class="coin-badge">3 Coin</span>
              </button>

              <div class="error-box" data-error-box></div>
            </div>

            <!-- KANAN: Hasil -->
            <div class="vector-panel vector-panel--right">
              <div class="panel-label">Hasil Vector</div>

              <div class="result-empty" data-result-empty style="display:flex;">
                <div class="result-empty-icon">◈</div>
                <div class="result-empty-text">Hasil akan muncul di sini</div>
              </div>

              <div class="loading-state" data-loading-state style="display:none;">
                <div class="loading-dots"><span></span><span></span><span></span></div>
                <div class="loading-text">AI Sedang Memproses...</div>
                <div class="loading-steps">
                  <div class="loading-step" data-step="1">Memproses gambar</div>
                  <div class="loading-step" data-step="2">Menganalisis struktur & bentuk</div>
                  <div class="loading-step" data-step="3">Menghasilkan style vektor</div>
                  <div class="loading-step" data-step="4">Menyempurnakan output</div>
                </div>
              </div>

              <div class="result-zone" data-result-zone style="display:none;">
                <img data-result-img src="" alt="Vector result" style="width:100%;border-radius:12px;cursor:zoom-in;" data-zoom-img/>
              </div>

              <button class="download-btn" type="button" data-download-btn disabled>
                ↓ Download PNG &nbsp;<span class="coin-badge">1 Coin</span>
              </button>

              <div class="error-box" data-error-box-right></div>
            </div>

          </div>
        </div>
      `;

      // ── Element refs ──────────────────────────────────────────────
      const uploadZone     = root.querySelector("[data-upload-zone]");
      const fileInput      = root.querySelector("[data-file-input]");
      const previewZone    = root.querySelector("[data-preview-zone]");
      const previewImg     = root.querySelector("[data-preview-img]");
      const fileNameEl     = root.querySelector("[data-file-name]");
      const changeBtn      = root.querySelector("[data-change-btn]");
      const generateBtn    = root.querySelector("[data-generate-btn]");
      const loadingState   = root.querySelector("[data-loading-state]");
      const resultEmpty    = root.querySelector("[data-result-empty]");
      const resultZone     = root.querySelector("[data-result-zone]");
      const resultImg      = root.querySelector("[data-result-img]");
      const downloadBtn    = root.querySelector("[data-download-btn]");
      const errorBox       = root.querySelector("[data-error-box]");
      const errorBoxRight  = root.querySelector("[data-error-box-right]");

      // ── Config helpers ────────────────────────────────────────────
      function getConfig() {
        return window.RANZAI_CONFIG || {};
      }

      function getVectorUrl() {
        const config = getConfig();
        const base   = (config.SUPABASE_URL || "").replace(/\/$/, "");
        const path   = config.FUNCTIONS && config.FUNCTIONS.VECTOR
          ? config.FUNCTIONS.VECTOR
          : "/functions/v1/vector";
        return base + path;
      }

      function getVectorDownloadUrl() {
        const config = getConfig();
        const base   = (config.SUPABASE_URL || "").replace(/\/$/, "");
        const path   = config.FUNCTIONS && config.FUNCTIONS.VECTOR_DOWNLOAD
          ? config.FUNCTIONS.VECTOR_DOWNLOAD
          : "/functions/v1/vector-download";
        return base + path;
      }

      function getAnonKey() {
        return getConfig().SUPABASE_ANON_KEY || "";
      }

      function getSupabaseClient() {
        if (window.RANZAI_SUPABASE) return window.RANZAI_SUPABASE;
        if (!window.supabase) return null;
        const config = getConfig();
        const url    = config.SUPABASE_URL;
        const key    = config.SUPABASE_ANON_KEY;
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

      async function checkCoinBalance(userId) {
        const config = getConfig();
        const base   = (config.SUPABASE_URL || "").replace(/\/$/, "");
        const key    = config.SUPABASE_ANON_KEY || "";
        try {
          const authToken = await getAuthToken();
          const res = await fetch(
            `${base}/rest/v1/coin_balance?user_id=eq.${userId}&select=balance`,
            {
              headers: {
                "apikey": key,
                "Authorization": "Bearer " + authToken
              }
            }
          );
          const data = await res.json();
          return Array.isArray(data) && data[0] ? data[0].balance : 0;
        } catch (e) {
          return 0;
        }
      }

      // ── Error helpers ─────────────────────────────────────────────
      function showError(msg) {
        errorBox.textContent = "⚠ " + msg;
        errorBox.classList.add("show");
      }

      function hideError() {
        errorBox.textContent = "";
        errorBox.classList.remove("show");
      }

      function showErrorRight(msg) {
        errorBoxRight.textContent = "⚠ " + msg;
        errorBoxRight.classList.add("show");
      }

      function hideErrorRight() {
        errorBoxRight.textContent = "";
        errorBoxRight.classList.remove("show");
      }

      // ── File handling ─────────────────────────────────────────────
      function handleFile(file) {
        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
          showError("Format tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.");
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          showError("Ukuran file terlalu besar. Maks 10MB.");
          return;
        }

        hideError();
        imageMediaType = file.type;
        fileNameEl.textContent = file.name;

        const reader = new FileReader();

        reader.onload = function (event) {
          const dataUrl    = event.target.result;
          imageBase64      = dataUrl.split(",")[1];
          previewImg.src   = dataUrl;
          uploadZone.style.display = "none";
          previewZone.classList.add("show");
          generateBtn.disabled = false;
        };

        reader.onerror = function () {
          showError("Gagal membaca file gambar.");
        };

        reader.readAsDataURL(file);
      }

      // ── Loading animation ─────────────────────────────────────────
      function animateSteps() {
        const steps = Array.from(root.querySelectorAll("[data-step]"));
        steps.forEach(function (s) { s.classList.remove("active", "done"); });
        steps.forEach(function (step, index) {
          setTimeout(function () {
            if (index > 0) {
              steps[index - 1].classList.remove("active");
              steps[index - 1].classList.add("done");
            }
            step.classList.add("active");
          }, index * 900);
        });
      }

      // ── Generate ──────────────────────────────────────────────────
      async function runGenerate() {
        if (!imageBase64) return;

        const apiKey    = getAnonKey();
        const authToken = await getAuthToken();
        const url       = getVectorUrl();

        if (!url || !apiKey || !authToken) {
          showError("Config/session Supabase belum terbaca. Silakan login ulang.");
          return;
        }

        const userId = await getUserId();
        if (!userId) {
          showError("Kamu harus login untuk menggunakan tool ini.");
          return;
        }

        const balance = await checkCoinBalance(userId);
        if (balance < 3) {
          showError("Ranz Coin tidak cukup. Top up dulu untuk generate.");
          return;
        }

        generateBtn.disabled = true;
        downloadBtn.disabled = true;
        hideError();
        hideErrorRight();

        resultEmpty.style.display    = "none";
        resultZone.style.display     = "none";
        loadingState.style.display = "flex";
        animateSteps();

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type":  "application/json",
              "Authorization": "Bearer " + authToken,
              "apikey":        apiKey
            },
            body: JSON.stringify({
              imageBase64,
              mediaType:  imageMediaType,
              styleMode:  currentStyleMode
            })
          });

          let payload = null;
          try { payload = await response.json(); } catch (e) {}

          if (!response.ok) {
            throw new Error(payload && payload.error ? payload.error : "Server error");
          }

          if (payload && payload.error) {
            throw new Error(payload.error);
          }

          resultImageBase64 = payload.imageBase64 || null;

          if (!resultImageBase64) {
            throw new Error("AI tidak mengembalikan gambar. Coba lagi.");
          }

          loadingState.style.display   = "none";
          resultImg.src                = "data:image/png;base64," + resultImageBase64;
          resultZone.style.display     = "block";
          downloadBtn.disabled         = false;

          resultZone.scrollIntoView({ behavior: "smooth", block: "nearest" });

        } catch (error) {
          loadingState.style.display  = "none";
          resultEmpty.style.display  = "flex";
          generateBtn.disabled      = false;
          showError("Gagal generate: " + error.message);
        }

        generateBtn.disabled = false;
      }

      // ── Download ──────────────────────────────────────────────────
      async function runDownload() {
        if (!resultImageBase64) return;

        const authToken = await getAuthToken();
        const userId    = await getUserId();

        if (!userId) {
          showErrorRight("Kamu harus login untuk download.");
          return;
        }

        const balance = await checkCoinBalance(userId);
        if (balance < 1) {
          showErrorRight("Ranz Coin tidak cukup untuk download. Top up dulu.");
          return;
        }

        downloadBtn.disabled      = true;
        downloadBtn.textContent   = "Memproses...";
        hideErrorRight();

        try {
          const dlUrl = getVectorDownloadUrl();
          const res   = await fetch(dlUrl, {
            method: "POST",
            headers: {
              "Content-Type":  "application/json",
              "Authorization": "Bearer " + authToken,
              "apikey":        getAnonKey()
            },
            body: JSON.stringify({ coin: 1 })
          });

          if (!res.ok) {
            let errPayload = null;
            try { errPayload = await res.json(); } catch (e) {}
            throw new Error(errPayload && errPayload.error ? errPayload.error : "Gagal memotong coin.");
          }

          // Trigger download
          const byteChars  = atob(resultImageBase64);
          const byteArr    = new Uint8Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteArr[i] = byteChars.charCodeAt(i);
          }
          const blob  = new Blob([byteArr], { type: "image/png" });
          const blobUrl = URL.createObjectURL(blob);
          const link  = document.createElement("a");
          link.href   = blobUrl;
          link.download = "ranzai-vector-" + currentStyleMode + ".png";
          link.click();
          setTimeout(function () { URL.revokeObjectURL(blobUrl); }, 1000);

        } catch (err) {
          showErrorRight("Gagal download: " + err.message);
        } finally {
          downloadBtn.disabled = false;
          downloadBtn.innerHTML = "↓ Download PNG &nbsp;<span class=\"coin-badge\">1 Coin</span>";
        }
      }

      // ── Events ────────────────────────────────────────────────────
      uploadZone.addEventListener("dragover", function (e) {
        e.preventDefault();
        uploadZone.classList.add("dragover");
      });

      uploadZone.addEventListener("dragleave", function () {
        uploadZone.classList.remove("dragover");
      });

      uploadZone.addEventListener("drop", function (e) {
        e.preventDefault();
        uploadZone.classList.remove("dragover");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
        }
      });

      uploadZone.addEventListener("click", function (e) {
        if (e.target === fileInput) return;
        fileInput.click();
      });

      fileInput.addEventListener("click", function (e) {
        e.stopPropagation();
      });

      fileInput.addEventListener("change", function (e) {
        if (e.target.files && e.target.files[0]) {
          handleFile(e.target.files[0]);
        }
      });

      changeBtn.addEventListener("click", function () {
        previewZone.classList.remove("show");
        uploadZone.style.display = "";
        fileInput.value          = "";
        imageBase64              = null;
        imageMediaType           = null;
        generateBtn.disabled     = true;
        hideError();
      });

      generateBtn.addEventListener("click", runGenerate);
      downloadBtn.addEventListener("click", runDownload);

      // ── Lightbox zoom ─────────────────────────────────────────────
      root.addEventListener("click", function (e) {
        if (!e.target.matches("[data-zoom-img]") || !resultImageBase64) return;
        const overlay = document.createElement("div");
        overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:20px;";
        const img = document.createElement("img");
        img.src = "data:image/png;base64," + resultImageBase64;
        img.style.cssText = "max-width:90vw;max-height:90vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.5);";
        overlay.appendChild(img);
        overlay.addEventListener("click", function () { document.body.removeChild(overlay); });
        document.body.appendChild(overlay);
      });

      root.querySelectorAll("[data-style]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          root.querySelectorAll("[data-style]").forEach(function (b) {
            b.classList.remove("active");
          });
          btn.classList.add("active");
          currentStyleMode = btn.dataset.style;
        });
      });
    }
  };
})();
