/* ═══════════════════════════════════════════════════════════
   RanzAI i18n — Global Translation Utility
   Default: "id" | Switch: setLang("en") → reload
═══════════════════════════════════════════════════════════ */

(function () {

  const TRANSLATIONS = {
    id: {
      /* loading */
      loading:                    "Memuat dashboard...",
      loading_tool:               "Memuat tool...",

      /* nav */
      nav_dashboard:              "Dashboard",
      nav_tools:                  "Tools",
      nav_account:                "Akun",
      nav_payment:                "Pembayaran",
      nav_contact:                "Kontak",
      nav_policy:                 "Kebijakan",
      nav_terms:                  "Ketentuan",

      /* sidebar */
      account_id:                 "ID Akun",
      topup_btn:                  "+ Top Up",
      logout:                     "Keluar",

      /* topbar */
      topbar_title:               "Dashboard Pengguna",
      workspace_active:           "Workspace Aktif",

      /* hero */
      badge_user_dashboard:       "Dashboard Pengguna",
      welcome_title_line1:        "Selamat Datang di",
      welcome_sub:                "Semua tools RanzAI dijalankan dari dashboard ini. Pilih tool dari sidebar kiri untuk membuka fitur sesuai kebutuhan.",
      dev_notice:                 "RanzAI masih dalam tahap pengembangan. Tools sudah bisa digunakan, namun beberapa fitur masih terus disempurnakan.",

      /* status card */
      account_status:             "Status Akun",
      coin_available:             "Sisa Ranz Coin tersedia",
      topup_coin_btn:             "+ Top Up Ranz Coin",

      /* stats */
      stat_total_generate:        "Total generate",
      stat_tools_available:       "Tools tersedia",
      stat_last_tool:             "Tool terakhir",
      stat_active:                "Aktif",
      stat_workspace_status:      "Status workspace",

      /* tools panel */
      panel_tools_title:          "Pilih Tools",
      panel_tools_sub:            "Akses semua produk RanzAI langsung dari dashboard.",
      tool_breakdown_desc:        "Bedah gambar menjadi prompt detail.",
      tool_design_desc:           "Buat brief desain banner, poster, dan visual.",
      tool_write_desc:            "Ubah foto dokumen menjadi teks.",
      tool_gel_desc:              "Poles foto wajah agar lebih tajam.",
      tool_cut_desc:              "Hapus background foto otomatis.",
      tool_convert_desc:          "Convert file ke format yang dibutuhkan.",
      tool_mockup_desc:           "Tempatkan desain ke mockup produk.",
      tool_doc_desc:              "Buat surat, proposal, dan kontrak profesional dengan AI.",
      tool_vector_desc:           "Ubah gambar apapun menjadi PNG bergaya vektor clean.",

      /* history */
      panel_history_title:        "Riwayat",
      panel_history_sub:          "Aktivitas terakhir akun kamu.",
      activity_empty:             "Belum ada aktivitas.",
      activity_topup:             "Top Up",
      activity_usage:             "Generate",
      activity_deduct:            "Dikurangi",

      /* tutorial */
      tutorial_open_btn:          "Panduan",
      tutorial_kicker:            "Panduan Workspace",
      tutorial_title:             "Tutorial Singkat RanzAI",
      tab_dashboard:              "Dashboard",
      tab_tools:                  "Tools",
      tab_payment:                "Payment",
      tutorial_dashboard_title:   "Pahami dashboard kamu",
      tutorial_dashboard_desc:    "Gunakan dashboard untuk memantau status akun, saldo Ranz Coin, tools yang tersedia, dan aktivitas terbaru.",
      tutorial_dashboard_li1:     "Cek saldo Ranz Coin di kartu akun atau sidebar.",
      tutorial_dashboard_li2:     "Gunakan panel riwayat untuk melihat top up dan pemakaian tool terbaru.",
      tutorial_dashboard_li3:     "Buka tools langsung tanpa keluar dari workspace.",
      tutorial_tools_title:       "Pilih dan jalankan tools",
      tutorial_tools_desc:        "Pilih tool RanzAI dari sidebar atau panel tools. Setiap tool terbuka di dalam dashboard ini.",
      tutorial_tools_li1:         "Breakdown mengubah gambar menjadi prompt detail.",
      tutorial_tools_li2:         "Design, Write, Gel, Cut, Convert, dan Mockup punya biaya penggunaan berbeda.",
      tutorial_tools_li3:         "Upload atau isi input yang dibutuhkan, generate, lalu download hasilnya.",
      tutorial_payment_title:     "Top up Ranz Coin",
      tutorial_payment_desc:      "Buka Payment, pilih paket, lalu selesaikan pembayaran. Saldo coin otomatis update setelah transaksi berhasil.",
      tutorial_payment_li1:       "Klik Top Up dari sidebar atau kartu akun.",
      tutorial_payment_li2:       "Selesaikan pembayaran lewat link pembayaran yang tersedia.",
      tutorial_payment_li3:       "Kembali ke dashboard dan tunggu update saldo realtime.",
      tutorial_payment_cta:       "Ke Payment",

      /* tour */
      tour_badge_welcome:         "Selamat Datang",
      tour_badge_coin:            "Langkah 1 dari 4",
      tour_badge_tools:           "Langkah 2 dari 4",
      tour_badge_generate:        "Langkah 3 dari 4",
      tour_badge_done:            "Siap digunakan",
      tour1_title:                "Selamat Datang di RanzAI Workspace!",
      tour1_desc:                 "Ini adalah dashboard pribadi kamu. Semua tools AI bisa diakses dari sini. Ikuti beberapa langkah singkat berikut untuk mulai.",
      tour2_title:                "Top Up Ranz Coin Dulu",
      tour2_desc:                 "Setiap tool menggunakan Ranz Coin per generate. Buka menu Payment di sidebar, pilih paket, dan bayar via Mayar ID. Coin otomatis masuk setelah pembayaran.",
      tour2_cta:                  "Buka Payment →",
      tour3_title:                "Pilih Tool dari Sidebar",
      tour3_desc:                 "Gunakan sidebar kiri untuk membuka tool — Breakdown, Design, Write, Gel, Cut, Convert, Mockup, Doc, Vector. Setiap tool terbuka di area utama tanpa meninggalkan halaman ini.",
      tour4_title:                "Generate & Download",
      tour4_desc:                 "Upload file atau isi input yang dibutuhkan, lalu klik Generate. Coin terpotong per penggunaan (1–5 coin). Download hasilnya langsung dari panel tool.",
      tour5_title:                "Siap Untuk Mulai!",
      tour5_desc:                 "Itu semua yang perlu kamu tahu. Mulai dengan Top Up, pilih tool, dan buat sesuatu yang keren. Panduan ini bisa dilihat lagi kapanpun dari dashboard.",
      tour_prev:                  "← Kembali",
      tour_next:                  "Lanjut →",
      tour_finish:                "Mulai! 🚀",
      tour_skip:                  "Lewati",

      /* breakdown tool */
      bd_chip:                    "Tool · Analisis Gambar",
      bd_title:                   "Bedah Gambar<br>Jadi <span>Prompt.</span>",
      bd_subtitle:                "Upload gambar apapun. AI akan membaca subjek, style, lighting, warna, komposisi, mood, dan detail visual menjadi prompt siap pakai.",
      bd_upload_title:            "Drop gambar di sini atau klik untuk pilih",
      bd_upload_sub:              "JPG · PNG · WEBP · GIF · Maks 10MB",
      bd_change_btn:              "✕ Ganti Gambar",
      bd_output_mode_label:       "Mode Output",
      bd_output_format_label:     "Format Output",
      bd_generate_btn:            "Breakdown Gambar",
      bd_loading_text:            "AI Sedang Menganalisis...",
      bd_step1:                   "Memproses gambar",
      bd_step2:                   "Mengidentifikasi subjek & style",
      bd_step3:                   "Menganalisis lighting & warna",
      bd_step4:                   "Menyusun prompt breakdown",
      bd_results_eyebrow:         "Output Breakdown",
      bd_results_title:           "Analisis Visual Selesai ✓",
      bd_reset_inline:            "↺ Analisis Baru",
      bd_copy_btn:                "Copy Prompt",
      bd_copied:                  "Tersalin!",
      bd_reset_btn2:              "↺ Upload Gambar Baru",
      bd_label_simple:            "Simple Prompt",
      bd_label_detailed:          "Detailed Breakdown",
      bd_label_simple_json:       "Simple Prompt — JSON",
      bd_label_detailed_json:     "Detailed Breakdown — JSON",
      bd_err_format:              "Format tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.",
      bd_err_size:                "Ukuran file terlalu besar. Maks 10MB.",
      bd_err_read:                "Gagal membaca file gambar.",
      bd_err_config:              "Config/session Supabase belum terbaca. Silakan login ulang.",
      bd_err_login:               "Kamu harus login untuk menggunakan tool ini.",
      bd_err_coin:                "Ranz Coin kamu habis. Top up dulu untuk lanjut generate.",
      bd_err_analyze:             "Gagal menganalisis: ",
    },

    en: {
      /* loading */
      loading:                    "Loading dashboard...",
      loading_tool:               "Loading tool...",

      /* nav */
      nav_dashboard:              "Dashboard",
      nav_tools:                  "Tools",
      nav_account:                "Account",
      nav_payment:                "Payment",
      nav_contact:                "Contact",
      nav_policy:                 "Policy",
      nav_terms:                  "Terms",

      /* sidebar */
      account_id:                 "Account ID",
      topup_btn:                  "+ Top Up",
      logout:                     "Logout",

      /* topbar */
      topbar_title:               "User Dashboard",
      workspace_active:           "Workspace Active",

      /* hero */
      badge_user_dashboard:       "User Dashboard",
      welcome_title_line1:        "Welcome to",
      welcome_sub:                "All RanzAI tools are accessible from this dashboard. Select a tool from the left sidebar to start working.",
      dev_notice:                 "RanzAI is still in active development. Tools are usable, but some features are still being refined.",

      /* status card */
      account_status:             "Account Status",
      coin_available:             "Ranz Coin available",
      topup_coin_btn:             "+ Top Up Ranz Coin",

      /* stats */
      stat_total_generate:        "Total generates",
      stat_tools_available:       "Tools available",
      stat_last_tool:             "Last tool used",
      stat_active:                "Active",
      stat_workspace_status:      "Workspace status",

      /* tools panel */
      panel_tools_title:          "Select Tools",
      panel_tools_sub:            "Access all RanzAI products directly from the dashboard.",
      tool_breakdown_desc:        "Analyze images into detailed prompts.",
      tool_design_desc:           "Generate design briefs for banners and posters.",
      tool_write_desc:            "Convert document photos into text.",
      tool_gel_desc:              "Enhance and sharpen portrait photos.",
      tool_cut_desc:              "Remove photo backgrounds automatically.",
      tool_convert_desc:          "Convert files to any format you need.",
      tool_mockup_desc:           "Place designs onto product mockups.",
      tool_doc_desc:              "Generate letters, proposals, and professional contracts.",
      tool_vector_desc:           "Convert any image into a clean vector-style PNG.",

      /* history */
      panel_history_title:        "History",
      panel_history_sub:          "Your recent account activity.",
      activity_empty:             "No activity yet.",
      activity_topup:             "Top Up",
      activity_usage:             "Generate",
      activity_deduct:            "Deducted",

      /* tutorial */
      tutorial_open_btn:          "Guide",
      tutorial_kicker:            "Workspace Guide",
      tutorial_title:             "RanzAI Quick Tutorial",
      tab_dashboard:              "Dashboard",
      tab_tools:                  "Tools",
      tab_payment:                "Payment",
      tutorial_dashboard_title:   "Understand your dashboard",
      tutorial_dashboard_desc:    "Use the dashboard to monitor your account status, Ranz Coin balance, available tools, and latest activity.",
      tutorial_dashboard_li1:     "Check your Ranz Coin balance in the account card or sidebar.",
      tutorial_dashboard_li2:     "Use the history panel to review recent top-ups and tool usage.",
      tutorial_dashboard_li3:     "Open tools directly without leaving the workspace.",
      tutorial_tools_title:       "Choose and run tools",
      tutorial_tools_desc:        "Select any RanzAI tool from the sidebar or the tools panel. Each tool opens inside this dashboard.",
      tutorial_tools_li1:         "Breakdown turns an image into a detailed prompt.",
      tutorial_tools_li2:         "Design, Write, Gel, Cut, Convert, and Mockup each have different usage costs.",
      tutorial_tools_li3:         "Upload or enter the required input, generate, then download the result.",
      tutorial_payment_title:     "Top up Ranz Coin",
      tutorial_payment_desc:      "Open Payment, choose a package, and complete the payment. Your coin balance updates automatically after a successful transaction.",
      tutorial_payment_li1:       "Click Top Up from the sidebar or account card.",
      tutorial_payment_li2:       "Complete payment through the available payment link.",
      tutorial_payment_li3:       "Return to the dashboard and wait for the realtime balance update.",
      tutorial_payment_cta:       "Go to Payment",

      /* tour */
      tour_badge_welcome:         "Welcome",
      tour_badge_coin:            "Step 1 of 4",
      tour_badge_tools:           "Step 2 of 4",
      tour_badge_generate:        "Step 3 of 4",
      tour_badge_done:            "You're all set",
      tour1_title:                "Welcome to RanzAI Workspace!",
      tour1_desc:                 "This is your personal dashboard. All AI tools are accessible from here. Let us walk you through the basics in a few quick steps.",
      tour2_title:                "Top Up Ranz Coin First",
      tour2_desc:                 "Every tool uses Ranz Coin per generation. Go to Payment in the sidebar, pick a package, and pay via Mayar ID. Coins are credited automatically.",
      tour2_cta:                  "Open Payment →",
      tour3_title:                "Pick a Tool from the Sidebar",
      tour3_desc:                 "Use the left sidebar to open any tool — Breakdown, Design, Write, Gel, Cut, Convert, Mockup, Doc, Vector. Each tool opens in the main area without leaving this page.",
      tour4_title:                "Generate & Download",
      tour4_desc:                 "Upload your file or fill in the input, then click Generate. Coins are deducted per use (1–5 coins). Download your result directly from the tool panel.",
      tour5_title:                "You're Ready to Go!",
      tour5_desc:                 "That's all you need to know. Start with a Top Up, pick a tool, and create something amazing. You can revisit the guide anytime from the dashboard.",
      tour_prev:                  "← Back",
      tour_next:                  "Next →",
      tour_finish:                "Let's Go! 🚀",
      tour_skip:                  "Skip",

      /* breakdown tool */
      bd_chip:                    "Tool · Image Analysis",
      bd_title:                   "Break Down Images<br>Into <span>Prompts.</span>",
      bd_subtitle:                "Upload any image. AI will read the subject, style, lighting, colors, composition, mood, and visual details into a ready-to-use prompt.",
      bd_upload_title:            "Drop image here or click to select",
      bd_upload_sub:              "JPG · PNG · WEBP · GIF · Max 10MB",
      bd_change_btn:              "✕ Change Image",
      bd_output_mode_label:       "Output Mode",
      bd_output_format_label:     "Output Format",
      bd_generate_btn:            "Breakdown Image",
      bd_loading_text:            "AI is Analyzing...",
      bd_step1:                   "Processing image",
      bd_step2:                   "Identifying subject & style",
      bd_step3:                   "Analyzing lighting & colors",
      bd_step4:                   "Composing breakdown prompt",
      bd_results_eyebrow:         "Breakdown Output",
      bd_results_title:           "Visual Analysis Complete ✓",
      bd_reset_inline:            "↺ New Analysis",
      bd_copy_btn:                "Copy Prompt",
      bd_copied:                  "Copied!",
      bd_reset_btn2:              "↺ Upload New Image",
      bd_label_simple:            "Simple Prompt",
      bd_label_detailed:          "Detailed Breakdown",
      bd_label_simple_json:       "Simple Prompt — JSON",
      bd_label_detailed_json:     "Detailed Breakdown — JSON",
      bd_err_format:              "Unsupported format. Use JPG, PNG, WEBP, or GIF.",
      bd_err_size:                "File too large. Max 10MB.",
      bd_err_read:                "Failed to read image file.",
      bd_err_config:              "Supabase config/session not loaded. Please log in again.",
      bd_err_login:               "You must be logged in to use this tool.",
      bd_err_coin:                "Your Ranz Coin is empty. Top up to continue.",
      bd_err_analyze:             "Analysis failed: ",
    }
  };

  /* ── Core functions ── */

  window.getLang = function () {
    return localStorage.getItem("ranzai_lang") || "id";
  };

  window.setLang = function (lang) {
    if (lang !== "en" && lang !== "id") return;
    localStorage.setItem("ranzai_lang", lang);
    location.reload();
  };

  window.t = function (key) {
    const lang = window.getLang();
    return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS["id"]?.[key] ?? key;
  };

  window.RANZAI_TRANSLATIONS = TRANSLATIONS;

})();
