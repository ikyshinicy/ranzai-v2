(function () {
  window.RanzTools = window.RanzTools || {};

  window.RanzTools.convert = {
    render(container) {
      const root = typeof container === "string" ? document.querySelector(container) : container;
      if (!root) return;

      let selectedFile = null;
      let selectedInputFormat = "";
      let selectedOutputFormat = "pdf";

      root.innerHTML = `
        <div class="ranz-tool ranz-convert-tool">
          <section class="convert-hero">
            <div class="convert-badge">
              <span class="convert-badge-dot"></span>
              RanzAI Convert · Multi Format Converter
            </div>

            <h1 class="convert-title">
              Convert File<br>
              <span>Cepat & Rapi</span>
            </h1>

            <p class="convert-sub">
              Upload gambar, Word, Excel, PowerPoint, atau PDF lalu pilih format output yang kamu butuhkan.
            </p>
          </section>

          <main class="convert-wrap">
            <div class="convert-card">
              <div class="convert-body">

                <div class="convert-dropzone" data-dropzone>
                  <input
                    type="file"
                    data-file-input
                    accept=".jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf"
                  />

                  <div class="convert-dz-icon">📄</div>
                  <div class="convert-dz-title">Upload File</div>
                  <p class="convert-dz-hint">Klik atau seret file ke sini</p>

                  <div class="convert-dz-types">
                    <span>JPG</span>
                    <span>PNG</span>
                    <span>WEBP</span>
                    <span>DOCX</span>
                    <span>XLSX</span>
                    <span>PPTX</span>
                    <span>PDF</span>
                  </div>
                </div>

                <div class="convert-file-info" data-file-info>
                  <div class="convert-file-row">
                    <div class="convert-file-icon" data-file-icon>📄</div>

                    <div>
                      <div class="convert-file-name" data-file-name>file-name.docx</div>
                      <div class="convert-file-meta" data-file-meta>0 KB · DOCX</div>
                    </div>
                  </div>

                  <div class="convert-file-actions">
                    <button class="convert-small-btn" type="button" data-change-btn>Ganti File</button>
                    <button class="convert-small-btn" type="button" data-clear-btn>Hapus</button>
                  </div>
                </div>

                <div class="convert-output-wrap" data-output-wrap>
                  <div class="convert-output-label">Output Format</div>
                  <select class="convert-output-select" data-output-format></select>
                  <div class="convert-output-note" data-output-note></div>
                </div>

                <button class="convert-export-btn" type="button" data-export-btn>
                  📄 <span data-btn-text>Export ke PDF</span>
                </button>

                <div class="convert-status-box" data-status-box></div>

              </div>
            </div>
          </main>

          <section class="convert-info-section">
            <div class="convert-info-grid">
              <div class="convert-info-card">
                <div class="convert-info-icon">📄</div>
                <div class="convert-info-title">File ke PDF</div>
                <p>Support gambar, Word, Excel, PowerPoint, dan PDF ke berbagai format.</p>
              </div>

              <div class="convert-info-card">
                <div class="convert-info-icon">📝</div>
                <div class="convert-info-title">PDF ke Word</div>
                <p>Upload PDF lalu convert ke DOCX, JPG, PNG, PPTX, atau TXT.</p>
              </div>

              <div class="convert-info-card">
                <div class="convert-info-icon">⚡</div>
                <div class="convert-info-title">Engine RanzAI</div>
                <p>Semua proses konversi dijalankan oleh Engine RanzAI tanpa menampilkan sistem dapur.</p>
              </div>
            </div>
          </section>
        </div>
      `;

      const dropzone = root.querySelector("[data-dropzone]");
      const fileInput = root.querySelector("[data-file-input]");
      const fileInfo = root.querySelector("[data-file-info]");
      const fileIcon = root.querySelector("[data-file-icon]");
      const fileName = root.querySelector("[data-file-name]");
      const fileMeta = root.querySelector("[data-file-meta]");
      const changeBtn = root.querySelector("[data-change-btn]");
      const clearBtn = root.querySelector("[data-clear-btn]");
      const outputWrap = root.querySelector("[data-output-wrap]");
      const outputFormat = root.querySelector("[data-output-format]");
      const outputNote = root.querySelector("[data-output-note]");
      const exportBtn = root.querySelector("[data-export-btn]");
      const btnText = root.querySelector("[data-btn-text]");
      const statusBox = root.querySelector("[data-status-box]");

      function getConfig() {
        return window.RANZAI_CONFIG || {};
      }

      function getConvertUrl() {
        const config = getConfig();
        const base = (config.SUPABASE_URL || "").replace(/\/$/, "");
        const path = config.FUNCTIONS && config.FUNCTIONS.CONVERT
          ? config.FUNCTIONS.CONVERT
          : "/functions/v1/convert";

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

      function getExt(name) {
        return String(name || "").split(".").pop().toLowerCase();
      }

      function getIcon(ext) {
        if (["jpg", "jpeg", "png", "webp"].includes(ext)) return "🖼️";
        if (["doc", "docx"].includes(ext)) return "📝";
        if (["xls", "xlsx"].includes(ext)) return "📊";
        if (["ppt", "pptx"].includes(ext)) return "📽️";
        if (ext === "pdf") return "📕";
        return "📄";
      }

      function formatSize(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
      }

      function showStatus(type, message) {
        statusBox.className = "convert-status-box";

        if (type) {
          statusBox.classList.add(type);
        }

        statusBox.textContent = message;
        statusBox.classList.add("show");
      }

      function clearStatus() {
        statusBox.className = "convert-status-box";
        statusBox.textContent = "";
        statusBox.classList.remove("show");
      }

      function setupOutputOptions(inputFormat) {
        outputFormat.innerHTML = "";

        let options = [];

        if (inputFormat === "pdf") {
          options = [
            { value: "docx", label: "Word DOCX" },
            { value: "xlsx", label: "Excel XLSX" },
            { value: "pptx", label: "PowerPoint PPTX" },
            { value: "jpg", label: "Image JPG" },
            { value: "png", label: "Image PNG" },
            { value: "txt", label: "Text TXT" },
            { value: "html", label: "HTML" }
          ];
        } else if (["jpg", "jpeg", "png", "webp"].includes(inputFormat)) {
          options = [
            { value: "pdf", label: "PDF" },
            { value: "jpg", label: "Image JPG" },
            { value: "png", label: "Image PNG" },
            { value: "webp", label: "Image WEBP" }
          ];
        } else if (["doc", "docx"].includes(inputFormat)) {
          options = [
            { value: "pdf", label: "PDF" },
            { value: "txt", label: "Text TXT" },
            { value: "html", label: "HTML" }
          ];
        } else if (["xls", "xlsx"].includes(inputFormat)) {
          options = [
            { value: "pdf", label: "PDF" },
            { value: "csv", label: "CSV" },
            { value: "html", label: "HTML" }
          ];
        } else if (["ppt", "pptx"].includes(inputFormat)) {
          options = [
            { value: "pdf", label: "PDF" },
            { value: "jpg", label: "Image JPG" },
            { value: "png", label: "Image PNG" }
          ];
        } else {
          options = [{ value: "pdf", label: "PDF" }];
        }

        options = options.filter(function (opt) {
          return opt.value !== inputFormat;
        });

        if (options.length === 0) {
          options = [{ value: "pdf", label: "PDF" }];
        }

        options.forEach(function (opt) {
          const option = document.createElement("option");
          option.value = opt.value;
          option.textContent = opt.label;
          outputFormat.appendChild(option);
        });

        selectedOutputFormat = options[0].value;
        outputFormat.value = selectedOutputFormat;

        updateOutputNote();
        updateExportButton();
      }

      function updateOutputNote() {
        if (!selectedFile) {
          outputNote.textContent = "";
          return;
        }

        if (selectedInputFormat === "pdf") {
          outputNote.textContent = "File PDF bisa dikonversi ke Word, Excel, PowerPoint, gambar, teks, atau HTML.";
        } else if (["jpg", "jpeg", "png", "webp"].includes(selectedInputFormat)) {
          outputNote.textContent = "File gambar bisa dikonversi ke PDF, JPG, PNG, atau WEBP.";
        } else if (["doc", "docx"].includes(selectedInputFormat)) {
          outputNote.textContent = "File Word bisa dikonversi ke PDF, TXT, atau HTML.";
        } else if (["xls", "xlsx"].includes(selectedInputFormat)) {
          outputNote.textContent = "File Excel bisa dikonversi ke PDF, CSV, atau HTML.";
        } else if (["ppt", "pptx"].includes(selectedInputFormat)) {
          outputNote.textContent = "File PowerPoint bisa dikonversi ke PDF, JPG, atau PNG.";
        } else {
          outputNote.textContent = "Pilih format output yang kamu butuhkan.";
        }
      }

      function updateExportButton() {
        if (outputFormat && outputFormat.value) {
          selectedOutputFormat = outputFormat.value;
        }

        const label = selectedOutputFormat.toUpperCase();

        if (selectedOutputFormat === "pdf") {
          btnText.textContent = "Export ke PDF";
        } else {
          btnText.textContent = "Convert ke " + label;
        }

        updateOutputNote();
      }

      function handleFile(file) {
        if (!file) return;

        const allowed = ["jpg", "jpeg", "png", "webp", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "pdf"];
        const ext = getExt(file.name);

        if (!allowed.includes(ext)) {
          showStatus("error", "Format file belum didukung. Gunakan JPG, PNG, WEBP, DOCX, XLSX, PPTX, atau PDF.");
          return;
        }

        if (file.size > 20 * 1024 * 1024) {
          showStatus("error", "Ukuran file terlalu besar. Maksimal 20MB.");
          return;
        }

        selectedFile = file;
        selectedInputFormat = ext === "jpeg" ? "jpg" : ext;

        fileIcon.textContent = getIcon(ext);
        fileName.textContent = file.name;
        fileMeta.textContent = formatSize(file.size) + " · " + ext.toUpperCase();

        fileInfo.classList.add("show");
        outputWrap.classList.add("show");
        exportBtn.classList.add("show");

        setupOutputOptions(selectedInputFormat);
        clearStatus();
      }

      function clearFile() {
        selectedFile = null;
        selectedInputFormat = "";
        selectedOutputFormat = "pdf";

        fileInput.value = "";
        fileInfo.classList.remove("show");
        outputWrap.classList.remove("show");
        exportBtn.classList.remove("show");
        outputFormat.innerHTML = "";

        clearStatus();
      }

      function fileToBase64(file) {
        return new Promise(function (resolve, reject) {
          const reader = new FileReader();
          reader.onload = function () {
            resolve(reader.result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      function downloadBase64File(base64, filename, mimeType) {
        const cleanBase64 = String(base64 || "").includes(",")
          ? String(base64).split(",")[1]
          : String(base64 || "");

        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: mimeType || "application/octet-stream"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename || "converted-file";
        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
      }

      async function convertFile() {
        if (!selectedFile) return;

        const url = getConvertUrl();
        const apiKey = getApiKey();

        if (!url || !apiKey) {
          showStatus("error", "Config Supabase belum terbaca. Cek /scripts/core/app.js.");
          return;
        }

        exportBtn.disabled = true;
        showStatus("", "Sedang mengupload dan mengonversi file...");

        try {
          const fileBase64 = await fileToBase64(selectedFile);

          const payload = {
            filename: selectedFile.name,
            fileBase64,
            inputFormat: selectedInputFormat,
            outputFormat: selectedOutputFormat
          };

          const authToken = await getAuthToken();

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + authToken,
              "apikey": apiKey
            },
            body: JSON.stringify(payload)
          });

          let data = null;

          try {
            data = await response.json();
          } catch (e) {}

          if (!response.ok || !data || !data.success) {
            throw new Error(data && data.error ? data.error : "Conversion failed");
          }

          downloadBase64File(data.fileBase64, data.filename, data.mimeType);

          showStatus("success", "File berhasil dikonversi dan sedang didownload.");
        } catch (error) {
          showStatus("error", "Gagal convert file: " + error.message);
        } finally {
          exportBtn.disabled = false;
        }
      }

      dropzone.addEventListener("dragover", function (event) {
        event.preventDefault();
        dropzone.classList.add("drag-over");
      });

      dropzone.addEventListener("dragleave", function (event) {
        event.preventDefault();
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

      clearBtn.addEventListener("click", clearFile);
      outputFormat.addEventListener("change", updateExportButton);
      exportBtn.addEventListener("click", convertFile);
    }
  };
})();
