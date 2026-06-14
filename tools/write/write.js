(function () {
  window.RanzTools = window.RanzTools || {};

  window.RanzTools.write = {
    render(container) {
      const root = typeof container === "string" ? document.querySelector(container) : container;
      if (!root) return;

      let base64Data = "";
      let mimeType = "";
      let originalDataUrl = "";

      root.innerHTML = `
        <div class="ranz-tool ranz-write-tool">
          <div class="write-hero">
            <div class="write-badge">
              <span class="write-badge-dot"></span>
              RanzAI Write · Mesin Ketik Modal Foto
            </div>

            <h1 class="write-title">
              Mesin Ketik<br>
              <span>Modal Foto</span>
            </h1>

            <p class="write-sub">
              Foto dokumen, catatan, atau tulisan tangan langsung jadi teks siap edit, PDF, atau Word dalam hitungan detik.
            </p>
          </div>

          <div class="write-wrap">
            <div class="write-card">
              <div class="write-body">

                <div class="write-dropzone" data-dropzone>
                  <input type="file" data-file-input accept="image/jpeg,image/png,image/webp,image/gif"/>
                  <div class="write-dz-icon">📷</div>

                  <div class="write-dz-title">Upload Foto</div>
                  <p class="write-dz-hint">Klik atau seret & lepas foto ke sini</p>

                  <div class="write-dz-types">
                    <span>JPG</span>
                    <span>PNG</span>
                    <span>WEBP</span>
                    <span>GIF</span>
                  </div>
                </div>

                <div class="write-preview" data-preview>
                  <img data-preview-img src="" alt="Preview"/>
                  <button class="write-preview-change" type="button" data-change-btn>Ganti Foto</button>
                </div>

                <button class="write-generate-btn" type="button" data-generate-btn>
                  ✍️ Baca Teks dari Foto · 1 Coin
                </button>

                <div class="write-loading" data-loading>
                  <div class="write-loading-spinner"></div>
                  <p class="write-loading-text">AI sedang membaca teks...</p>
                </div>

                <div class="write-error" data-error></div>

                <div class="write-result" data-result>
                  <div class="write-result-header">
                    <div class="write-result-label">Hasil Transkrip</div>

                    <div class="write-result-actions">
                      <button class="write-action-btn" type="button" data-copy-btn>
                        Salin
                      </button>

                      <button class="write-action-btn" type="button" data-clear-btn>
                        Bersihkan
                      </button>

                      <button class="write-action-btn pdf" type="button" data-pdf-btn>
                        Export PDF
                      </button>

                      <button class="write-action-btn word" type="button" data-word-btn>
                        Export Word
                      </button>
                    </div>
                  </div>

                  <textarea class="write-result-box" data-result-box></textarea>

                  <p class="write-result-note">
                    Periksa kembali hasil terutama untuk tulisan tangan.
                  </p>
                </div>

              </div>
            </div>
          </div>

          <div class="write-tips">
            <div class="write-tips-head">
              <div class="write-section-label">Tips Penggunaan</div>
              <h2>Hasil <span>Lebih Akurat</span></h2>
            </div>

            <div class="write-tips-grid">
              <div class="write-tip-card">
                <div class="write-tip-icon">☀️</div>
                <div class="write-tip-title">Pencahayaan Cukup</div>
                <p>Foto di tempat terang agar teks terbaca jelas. Hindari bayangan atau foto terlalu gelap.</p>
              </div>

              <div class="write-tip-card">
                <div class="write-tip-icon">📐</div>
                <div class="write-tip-title">Posisi Lurus</div>
                <p>Foto dokumen dari posisi lurus ke depan. Sudut miring bisa mengurangi akurasi transkrip.</p>
              </div>

              <div class="write-tip-card">
                <div class="write-tip-icon">🔍</div>
                <div class="write-tip-title">Resolusi Tinggi</div>
                <p>Gunakan foto dengan resolusi tinggi agar teks kecil pun bisa terbaca dengan baik oleh AI.</p>
              </div>
            </div>
          </div>
        </div>
      `;

      const dropzone = root.querySelector("[data-dropzone]");
      const fileInput = root.querySelector("[data-file-input]");
      const preview = root.querySelector("[data-preview]");
      const previewImg = root.querySelector("[data-preview-img]");
      const changeBtn = root.querySelector("[data-change-btn]");
      const generateBtn = root.querySelector("[data-generate-btn]");
      const loading = root.querySelector("[data-loading]");
      const errorBox = root.querySelector("[data-error]");
      const result = root.querySelector("[data-result]");
      const resultBox = root.querySelector("[data-result-box]");
      const copyBtn = root.querySelector("[data-copy-btn]");
      const clearBtn = root.querySelector("[data-clear-btn]");
      const pdfBtn = root.querySelector("[data-pdf-btn]");
      const wordBtn = root.querySelector("[data-word-btn]");

      function getConfig() {
        return window.RANZAI_CONFIG || {};
      }

      function getWriteUrl() {
        const config = getConfig();
        const base = (config.SUPABASE_URL || "").replace(/\/$/, "");
        const path = config.FUNCTIONS && config.FUNCTIONS.WRITE
          ? config.FUNCTIONS.WRITE
          : "/functions/v1/write";

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
        const config = getConfig();
        const base = (config.SUPABASE_URL || "").replace(/\/$/, "");
        const key  = config.SUPABASE_ANON_KEY || "";

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

      function showError(message) {
        errorBox.textContent = message;
        errorBox.classList.add("show");
      }

      function hideError() {
        errorBox.textContent = "";
        errorBox.classList.remove("show");
      }

      function setProcessing(isProcessing) {
        generateBtn.style.display = isProcessing ? "none" : (base64Data ? "block" : "none");
        loading.classList.toggle("show", Boolean(isProcessing));
      }

      function handleFile(file) {
        if (!file) return;

        if (!file.type || !file.type.startsWith("image/")) {
          showError("Format tidak didukung. Upload file gambar.");
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          showError("Ukuran file terlalu besar. Maksimal 10MB.");
          return;
        }

        hideError();
        mimeType = file.type || "image/jpeg";

        const reader = new FileReader();

        reader.onload = function (event) {
          originalDataUrl = event.target.result;
          base64Data = originalDataUrl.split(",")[1];

          previewImg.src = originalDataUrl;
          preview.classList.add("show");
          dropzone.style.display = "none";
          generateBtn.style.display = "block";
          result.classList.remove("show");
          resultBox.value = "";
        };

        reader.onerror = function () {
          showError("Gagal membaca file gambar.");
        };

        reader.readAsDataURL(file);
      }

      async function analyze() {
        if (!base64Data) {
          showError("Pilih foto dulu.");
          return;
        }

        const url = getWriteUrl();
        const apiKey = getApiKey();

        if (!url || !apiKey) {
          showError("Config Supabase belum terbaca. Cek /scripts/core/app.js.");
          return;
        }

        // ── Coin guard ────────────────────────────────────────────
        const userId = await getUserId();

        if (!userId) {
          showError("Kamu harus login untuk menggunakan tool ini.");
          return;
        }

        const balance = await checkCoinBalance(userId);

        if (balance <= 0) {
          showError("Ranz Coin kamu habis. Top up dulu untuk lanjut transkrip.");
          return;
        }
        // ─────────────────────────────────────────────────────────

        hideError();
        result.classList.remove("show");
        setProcessing(true);

        try {
          const authToken = await getAuthToken();

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + authToken,
              "apikey": apiKey
            },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType
            })
          });

          let data = null;

          try {
            data = await response.json();
          } catch (e) {}

          if (!response.ok || !data || data.error) {
            throw new Error(data && data.error ? data.error : "Gagal membaca teks.");
          }

          const text =
            data.result ||
            data.text ||
            data.output ||
            (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) ||
            "";

          if (!text) {
            throw new Error("Respons kosong dari server. Coba lagi.");
          }

          resultBox.value = text;
          result.classList.add("show");
          result.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } catch (error) {
          showError("Gagal membaca teks: " + error.message);
        } finally {
          setProcessing(false);
        }
      }

      function copyText() {
        const text = resultBox.value;
        if (!text) return;

        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = "Tersalin!";
          copyBtn.classList.add("copied");

          setTimeout(function () {
            copyBtn.textContent = "Salin";
            copyBtn.classList.remove("copied");
          }, 2000);
        });
      }

      function exportPDF() {
        const text = resultBox.value;
        if (!text) return;

        try {
          if (!window.jspdf || !window.jspdf.jsPDF) {
            throw new Error("Library jsPDF belum tersedia.");
          }

          const { jsPDF } = window.jspdf;
          const doc = new jsPDF({ unit: "mm", format: "a4" });
          const pageW = doc.internal.pageSize.getWidth();
          const pageH = doc.internal.pageSize.getHeight();
          const margin = 20;
          const maxW = pageW - margin * 2;
          const lineH = 6;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(11);

          const lines = doc.splitTextToSize(text, maxW);
          let y = margin;

          lines.forEach(function (line) {
            if (y + lineH > pageH - margin) {
              doc.addPage();
              y = margin;
            }

            doc.text(line, margin, y);
            y += lineH;
          });

          doc.save("ranzai-transkrip.pdf");
        } catch (error) {
          showError("Gagal export PDF: " + error.message);
        }
      }

      function loadScriptOnce(src) {
        return new Promise(function (resolve, reject) {
          const existing = document.querySelector('script[src="' + src + '"]');

          if (existing) {
            resolve();
            return;
          }

          const script = document.createElement("script");
          script.src = src;
          script.onload = resolve;
          script.onerror = function () {
            reject(new Error("Gagal memuat library."));
          };

          document.head.appendChild(script);
        });
      }

      async function exportWord() {
        const text = resultBox.value;
        if (!text) return;

        try {
          await loadScriptOnce("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");

          const escaped = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

          const paragraphs = escaped.split("\n").map(function (line) {
            return '<w:p><w:r><w:rPr><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve">' + line + "</w:t></w:r></w:p>";
          }).join("");

          const docXml =
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
            "<w:body>" +
            paragraphs +
            '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>' +
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

          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = "ranzai-transkrip.docx";
          link.click();

          setTimeout(function () {
            URL.revokeObjectURL(blobUrl);
          }, 1000);
        } catch (error) {
          showError("Gagal export Word: " + error.message);
        }
      }

      function clearAll() {
        base64Data = "";
        mimeType = "";
        originalDataUrl = "";

        preview.classList.remove("show");
        dropzone.style.display = "";
        generateBtn.style.display = "none";
        result.classList.remove("show");
        hideError();

        previewImg.src = "";
        resultBox.value = "";
        fileInput.value = "";
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

      generateBtn.addEventListener("click", analyze);
      copyBtn.addEventListener("click", copyText);
      clearBtn.addEventListener("click", clearAll);
      pdfBtn.addEventListener("click", exportPDF);
      wordBtn.addEventListener("click", exportWord);
    }
  };
})();
