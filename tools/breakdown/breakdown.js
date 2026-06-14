(function () {
  window.RanzTools = window.RanzTools || {};

  window.RanzTools.breakdown = {
    render(container) {
      const root = typeof container === "string" ? document.querySelector(container) : container;
      if (!root) return;

      // i18n helper — falls back gracefully if i18n.js not loaded yet
      function T(key) {
        return (typeof window.t === "function") ? window.t(key) : key;
      }

      let imageBase64    = null;
      let imageMediaType = null;
      let currentData    = null;
      let currentFormat  = "plain";
      let outputMode     = "detailed";

      root.innerHTML = `
        <div class="ranz-tool ranz-breakdown-tool">
          <div class="tool-hero">
            <div class="tool-chip"><span class="chip-dot"></span><span data-i18n="bd_chip">${T("bd_chip")}</span></div>
            <h1 data-i18n="bd_title">${T("bd_title")}</h1>
            <p data-i18n="bd_subtitle">${T("bd_subtitle")}</p>
          </div>

          <div class="tool-panel">
            <div class="upload-section">
              <div class="upload-zone" data-upload-zone>
                <input type="file" data-file-input accept="image/jpeg,image/png,image/webp,image/gif"/>
                <div class="upload-icon">⇧</div>
                <div class="upload-title" data-i18n="bd_upload_title">${T("bd_upload_title")}</div>
                <div class="upload-sub" data-i18n="bd_upload_sub">${T("bd_upload_sub")}</div>
              </div>

              <div class="preview-zone" data-preview-zone>
                <img data-preview-img src="" alt="preview"/>
                <div class="preview-actions">
                  <span class="file-name" data-file-name>—</span>
                  <button class="change-btn" type="button" data-change-btn data-i18n="bd_change_btn">${T("bd_change_btn")}</button>
                </div>
              </div>

              <div class="tool-option-group">
                <div class="section-label" data-i18n="bd_output_mode_label">${T("bd_output_mode_label")}</div>
                <div class="format-row">
                  <button type="button" class="format-btn" data-mode="simple">Simple</button>
                  <button type="button" class="format-btn active" data-mode="detailed">Detailed</button>
                </div>
              </div>

              <div class="tool-option-group">
                <div class="section-label" data-i18n="bd_output_format_label">${T("bd_output_format_label")}</div>
                <div class="format-row">
                  <button type="button" class="format-btn active" data-format="plain">☰ Plain Text</button>
                  <button type="button" class="format-btn" data-format="json">{ } JSON</button>
                </div>
              </div>

              <button class="generate-btn" type="button" data-generate-btn disabled data-i18n="bd_generate_btn">
                ${T("bd_generate_btn")}
              </button>

              <div class="error-box" data-error-box></div>
            </div>
          </div>

          <div class="loading-state" data-loading-state>
            <div class="loading-dots"><span></span><span></span><span></span></div>
            <div class="loading-text" data-i18n="bd_loading_text">${T("bd_loading_text")}</div>
            <div class="loading-steps">
              <div class="loading-step" data-step="1" data-i18n="bd_step1">${T("bd_step1")}</div>
              <div class="loading-step" data-step="2" data-i18n="bd_step2">${T("bd_step2")}</div>
              <div class="loading-step" data-step="3" data-i18n="bd_step3">${T("bd_step3")}</div>
              <div class="loading-step" data-step="4" data-i18n="bd_step4">${T("bd_step4")}</div>
            </div>
          </div>

          <div class="results" data-results>
            <div class="results-header">
              <div>
                <div class="results-eyebrow" data-i18n="bd_results_eyebrow">${T("bd_results_eyebrow")}</div>
                <div class="results-title" data-i18n="bd_results_title">${T("bd_results_title")}</div>
              </div>
              <button class="reset-btn reset-inline" type="button" data-reset-btn data-i18n="bd_reset_inline">${T("bd_reset_inline")}</button>
            </div>

            <div class="full-prompt-section">
              <div class="prompt-header">
                <div class="prompt-header-left">
                  <div class="prompt-dot"></div>
                  <span class="prompt-title" data-prompt-label>${T("bd_label_detailed")}</span>
                </div>
                <button class="copy-btn" type="button" data-copy-btn data-i18n="bd_copy_btn">${T("bd_copy_btn")}</button>
              </div>
              <div class="prompt-body">
                <div class="prompt-text" data-prompt-text></div>
              </div>
            </div>

            <button class="reset-btn" type="button" data-reset-btn-2 data-i18n="bd_reset_btn2">${T("bd_reset_btn2")}</button>
          </div>
        </div>
      `;

      const uploadZone   = root.querySelector("[data-upload-zone]");
      const fileInput    = root.querySelector("[data-file-input]");
      const previewZone  = root.querySelector("[data-preview-zone]");
      const previewImg   = root.querySelector("[data-preview-img]");
      const fileNameEl   = root.querySelector("[data-file-name]");
      const changeBtn    = root.querySelector("[data-change-btn]");
      const generateBtn  = root.querySelector("[data-generate-btn]");
      const loadingState = root.querySelector("[data-loading-state]");
      const results      = root.querySelector("[data-results]");
      const promptText   = root.querySelector("[data-prompt-text]");
      const copyBtn      = root.querySelector("[data-copy-btn]");
      const errorBox     = root.querySelector("[data-error-box]");
      const promptLabel  = root.querySelector("[data-prompt-label]");

      function getConfig() {
        return window.RANZAI_CONFIG || {};
      }

      function getBreakdownUrl() {
        const config = getConfig();
        const base = (config.SUPABASE_URL || "").replace(/\/$/, "");
        const path = config.FUNCTIONS && config.FUNCTIONS.BREAKDOWN
          ? config.FUNCTIONS.BREAKDOWN
          : "/functions/v1/breakdown";
        return base + path;
      }

      function getAnonKey() {
        return getConfig().SUPABASE_ANON_KEY || "";
      }

      function getSupabaseClient() {
        if (window.RANZAI_SUPABASE) return window.RANZAI_SUPABASE;
        if (!window.supabase) return null;
        const config = getConfig();
        if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) return null;
        window.RANZAI_SUPABASE = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        return window.RANZAI_SUPABASE;
      }

      async function getUserId() {
        const client = getSupabaseClient();
        if (!client) return null;
        try {
          const { data } = await client.auth.getSession();
          return data?.session?.user?.id ?? null;
        } catch (e) {
          return null;
        }
      }

      async function getAuthToken() {
        const client = getSupabaseClient();
        if (client?.auth) {
          const { data, error } = await client.auth.getSession();
          if (!error && data?.session?.access_token) return data.session.access_token;
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
            { headers: { "apikey": key, "Authorization": "Bearer " + authToken } }
          );
          const data = await res.json();
          return Array.isArray(data) && data[0] ? data[0].balance : 0;
        } catch (e) {
          return 0;
        }
      }

      function showError(message) {
        errorBox.textContent = "Warning: " + message;
        errorBox.classList.add("show");
      }

      function hideError() {
        errorBox.textContent = "";
        errorBox.classList.remove("show");
      }

      function normalizeText(value) {
        if (value === undefined || value === null || value === "") return "-";
        if (Array.isArray(value)) return value.join(", ");
        if (typeof value === "object") {
          return Object.entries(value).map(([k, v]) => `${k}: ${v}`).join("\n");
        }
        return String(value);
      }

      function getPrompt(data) {
        if (data?.prompt) return String(data.prompt);
        if (data?.simple_prompt) return String(data.simple_prompt);
        return "";
      }

      function section(title, value) {
        return `${title}:\n${normalizeText(value)}\n`;
      }

      function buildPlainBreakdown(data) {
        if (!data) return "-";
        if (data.mode === "simple" || outputMode === "simple") {
          return getPrompt(data) || "-";
        }
        return [
          section("IMAGE CATEGORY",                           data.image_category),
          section("OVERALL SUMMARY",                         data.overall_summary),
          section("CANVAS ORIENTATION / RATIO",              data.canvas_orientation_ratio),
          section("MAIN SUBJECT",                            data.main_subject),
          section("SECONDARY SUBJECTS",                      data.secondary_subjects),
          section("PERSON / IDENTITY-NEUTRAL VISUAL TRAITS", data.person_identity_neutral_traits),
          section("POSE / EXPRESSION / BODY",                data.pose_expression_body),
          section("OUTFIT / ACCESSORIES / PROPS",            data.outfit_accessories_props),
          section("BACKGROUND BREAKDOWN",                    data.background_breakdown),
          section("FOREGROUND / MIDGROUND / BACKGROUND",     data.foreground_midground_background),
          section("LAYOUT STRUCTURE",                        data.layout_structure),
          section("VISUAL HIERARCHY / READING ORDER",        data.visual_hierarchy_reading_order),
          section("TEXT CONTENT",                            data.text_content),
          section("TEXT TYPOGRAPHY",                         data.text_typography),
          section("GRAPHIC ORNAMENTS",                       data.graphic_ornaments),
          section("PRODUCT / OBJECT DETAILS",                data.product_object_details),
          section("COMPOSITION",                             data.composition),
          section("CAMERA / PERSPECTIVE",                    data.camera_perspective),
          section("LIGHTING / SHADOW",                       data.lighting_shadow),
          section("COLOR PALETTE",                           data.color_palette),
          section("TEXTURE / MATERIAL",                      data.texture_material),
          section("STYLE / AESTHETIC",                       data.style_aesthetic),
          section("MOOD / ATMOSPHERE",                       data.mood_atmosphere),
          section("PRINT DESIGN NOTES",                      data.print_design_notes),
          section("QUALITY / RENDERING",                     data.quality_rendering),
          section("MISSING / UNCLEAR DETAILS",               data.missing_or_unclear_details),
          section("NEGATIVE PROMPT",                         data.negative),
          section("SIMPLE PROMPT",                           data.simple_prompt),
          section("FULL PROMPT",                             getPrompt(data) || "-")
        ].join("\n");
      }

      function updatePromptLabel() {
        if (outputMode === "simple") {
          promptLabel.textContent = currentFormat === "json" ? T("bd_label_simple_json") : T("bd_label_simple");
        } else {
          promptLabel.textContent = currentFormat === "json" ? T("bd_label_detailed_json") : T("bd_label_detailed");
        }
      }

      function updatePromptDisplay() {
        if (!currentData) return;
        if (currentFormat === "json") {
          promptText.textContent = JSON.stringify({
            output_mode:                      outputMode,
            image_category:                   currentData.image_category || "",
            overall_summary:                  currentData.overall_summary || "",
            canvas_orientation_ratio:         currentData.canvas_orientation_ratio || "",
            main_subject:                     currentData.main_subject || "",
            secondary_subjects:               currentData.secondary_subjects || "",
            person_identity_neutral_traits:   currentData.person_identity_neutral_traits || "",
            pose_expression_body:             currentData.pose_expression_body || "",
            outfit_accessories_props:         currentData.outfit_accessories_props || "",
            background_breakdown:             currentData.background_breakdown || "",
            foreground_midground_background:  currentData.foreground_midground_background || "",
            layout_structure:                 currentData.layout_structure || "",
            visual_hierarchy_reading_order:   currentData.visual_hierarchy_reading_order || "",
            text_content:                     currentData.text_content || "",
            text_typography:                  currentData.text_typography || "",
            graphic_ornaments:                currentData.graphic_ornaments || "",
            product_object_details:           currentData.product_object_details || "",
            composition:                      currentData.composition || "",
            camera_perspective:               currentData.camera_perspective || "",
            lighting_shadow:                  currentData.lighting_shadow || "",
            color_palette:                    currentData.color_palette || "",
            texture_material:                 currentData.texture_material || "",
            style_aesthetic:                  currentData.style_aesthetic || "",
            mood_atmosphere:                  currentData.mood_atmosphere || "",
            print_design_notes:               currentData.print_design_notes || "",
            quality_rendering:                currentData.quality_rendering || "",
            missing_or_unclear_details:       currentData.missing_or_unclear_details || "",
            negative_prompt:                  currentData.negative || "",
            simple_prompt:                    currentData.simple_prompt || "",
            prompt:                           getPrompt(currentData)
          }, null, 2);
        } else {
          promptText.textContent = buildPlainBreakdown(currentData);
        }
      }

      function setFormat(format) {
        currentFormat = format;
        root.querySelectorAll("[data-format]").forEach(btn => {
          btn.classList.toggle("active", btn.dataset.format === format);
        });
        updatePromptLabel();
        updatePromptDisplay();
      }

      function setOutputMode(mode) {
        outputMode = mode;
        root.querySelectorAll("[data-mode]").forEach(btn => {
          btn.classList.toggle("active", btn.dataset.mode === mode);
        });
        updatePromptLabel();
        updatePromptDisplay();
      }

      function handleFile(file) {
        if (!file) return;
        if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
          showError(T("bd_err_format"));
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          showError(T("bd_err_size"));
          return;
        }
        hideError();
        imageMediaType = file.type;
        fileNameEl.textContent = file.name;

        const reader = new FileReader();
        reader.onload = function (e) {
          const dataUrl = e.target.result;
          imageBase64 = dataUrl.split(",")[1];
          previewImg.src = dataUrl;
          uploadZone.style.display = "none";
          previewZone.classList.add("show");
          generateBtn.disabled = false;
        };
        reader.onerror = function () {
          showError(T("bd_err_read"));
        };
        reader.readAsDataURL(file);
      }

      function animateSteps() {
        const steps = Array.from(root.querySelectorAll("[data-step]"));
        steps.forEach(s => s.classList.remove("active", "done"));
        steps.forEach((step, i) => {
          setTimeout(() => {
            if (i > 0) {
              steps[i - 1].classList.remove("active");
              steps[i - 1].classList.add("done");
            }
            step.classList.add("active");
          }, i * 800);
        });
      }

      async function runBreakdown() {
        if (!imageBase64) return;

        const apiKey    = getAnonKey();
        const authToken = await getAuthToken();
        const url       = getBreakdownUrl();

        if (!url || !apiKey || !authToken) {
          showError(T("bd_err_config"));
          return;
        }

        const userId = await getUserId();
        if (!userId) {
          showError(T("bd_err_login"));
          return;
        }

        const balance = await checkCoinBalance(userId);
        if (balance <= 0) {
          showError(T("bd_err_coin"));
          return;
        }

        generateBtn.disabled = true;
        hideError();
        results.classList.remove("show");
        loadingState.classList.add("show");
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
              mediaType:    imageMediaType,
              outputFormat: currentFormat,
              outputMode,
              user_id:      userId
            })
          });

          let payload = null;
          try { payload = await response.json(); } catch (e) {}

          if (!response.ok) {
            throw new Error(payload?.error ?? "Server error");
          }

          currentData = payload || {};
          if (currentData.error) throw new Error(currentData.error);

          loadingState.classList.remove("show");
          updatePromptDisplay();
          results.classList.add("show");
          results.scrollIntoView({ behavior: "smooth", block: "start" });

        } catch (error) {
          loadingState.classList.remove("show");
          generateBtn.disabled = false;
          showError(T("bd_err_analyze") + error.message);
        }
      }

      function resetTool() {
        results.classList.remove("show");
        previewZone.classList.remove("show");
        uploadZone.style.display = "";
        fileInput.value     = "";
        imageBase64         = null;
        imageMediaType      = null;
        currentData         = null;
        generateBtn.disabled = true;
        promptText.textContent = "";
        hideError();
        root.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      /* ── Events ── */
      uploadZone.addEventListener("dragover", e => { e.preventDefault(); uploadZone.classList.add("dragover"); });
      uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("dragover"));
      uploadZone.addEventListener("drop", e => {
        e.preventDefault();
        uploadZone.classList.remove("dragover");
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
      });

      fileInput.addEventListener("change", e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); });

      changeBtn.addEventListener("click", () => {
        previewZone.classList.remove("show");
        uploadZone.style.display = "";
        fileInput.value     = "";
        imageBase64         = null;
        imageMediaType      = null;
        generateBtn.disabled = true;
      });

      generateBtn.addEventListener("click", runBreakdown);

      root.querySelectorAll("[data-format]").forEach(btn => {
        btn.addEventListener("click", () => setFormat(btn.dataset.format));
      });

      root.querySelectorAll("[data-mode]").forEach(btn => {
        btn.addEventListener("click", () => setOutputMode(btn.dataset.mode));
      });

      copyBtn.addEventListener("click", () => {
        const text = promptText.textContent;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.textContent = T("bd_copied");
          copyBtn.classList.add("copied");
          setTimeout(() => {
            copyBtn.textContent = T("bd_copy_btn");
            copyBtn.classList.remove("copied");
          }, 2000);
        });
      });

      root.querySelector("[data-reset-btn]").addEventListener("click", resetTool);
      root.querySelector("[data-reset-btn-2]").addEventListener("click", resetTool);

      // Re-apply dynamic labels when language switches
      const _origSetLang = window.setLang;
      window.setLang = function(lang) {
        if (typeof _origSetLang === "function") _origSetLang(lang);
        // tApply() handles data-i18n elements; update dynamic ones manually
        updatePromptLabel();
        if (copyBtn && !copyBtn.classList.contains("copied")) {
          copyBtn.textContent = T("bd_copy_btn");
        }
      };

      updatePromptLabel();
    }
  };
})();
