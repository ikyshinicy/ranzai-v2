(function () {
  window.RanzTools = window.RanzTools || {};

  window.RanzTools.payment = {
    render(container) {
      const root = typeof container === "string" ? document.querySelector(container) : container;
      if (!root) return;

      const COIN_RATE = 1250;
      const MIN_CUSTOM_COIN = 2;

      let selectedPackage = null;
      let selectedPayload = null;

      root.innerHTML = `
        <div class="ranz-tool ranz-payment-tool">
          <section class="pay-hero">
            <div class="pay-hero-copy">
              <div class="pay-badge">
                <span></span>
                Ranz Coin Payment
              </div>

              <h1>
                Top Up Ranz Coin<br>
                <span>Pakai AI Tools Tanpa Langganan</span>
              </h1>

              <p>
                Beli coin sesuai kebutuhan. Coin dipakai untuk generate di tools RanzAI seperti
                Breakdown, Design, Write, Gel, Cut, dan Convert.
              </p>

              <div class="pay-hero-actions">
                <button class="pay-primary-btn" type="button" data-package="early_access">
                  Ambil Promo 120 Coin
                </button>
                <button class="pay-secondary-btn" type="button" data-scroll-custom>
                  Beli Custom Mulai 2 Coin
                </button>
              </div>
            </div>

            <div class="pay-promo-card">
              <div class="pay-promo-label">Promo Akses Awal</div>
              <div class="pay-promo-main">
                <div>
                  <div class="pay-promo-coins">120</div>
                  <div class="pay-promo-unit">Ranz Coin</div>
                </div>
                <div>
                  <div class="pay-promo-old">Normal Rp150.000</div>
                  <div class="pay-promo-price">Rp75.000</div>
                  <div class="pay-promo-save">Hemat 50%</div>
                </div>
              </div>

              <div class="pay-promo-points">
                <span>✓ Cocok untuk coba semua tools</span>
                <span>✓ Tanpa langganan bulanan</span>
                <span>✓ Coin masuk setelah pembayaran valid</span>
              </div>

              <button class="pay-promo-btn" type="button" data-package="early_access">
                Ambil Promo Sekarang
              </button>
            </div>
          </section>

          <section class="pay-rate-strip">
            <div>
              <strong>Rate Normal</strong>
              <span>1 Ranz Coin = Rp1.250</span>
            </div>
            <div>
              <strong>Minimum Custom</strong>
              <span>Mulai dari 2 coin / Rp2.500</span>
            </div>
            <div>
              <strong>Sistem</strong>
              <span>Top up sekali, pakai sesuai kebutuhan</span>
            </div>
          </section>

          <section class="pay-custom-card" data-custom-section>
            <div class="pay-section-head">
              <div>
                <span class="pay-section-kicker">Custom Top Up</span>
                <h2>Beli Coin Sesuai Kebutuhan</h2>
                <p>
                  Tidak harus ambil paket besar. Masukkan jumlah coin yang kamu mau.
                </p>
              </div>
            </div>

            <div class="pay-custom-box">
              <div class="pay-custom-input">
                <label>Jumlah Coin</label>
                <input type="number" min="2" step="1" value="8" data-custom-coin />
                <small>Minimum 2 coin</small>
              </div>

              <div class="pay-custom-summary">
                <span>Total Bayar</span>
                <strong data-custom-total>Rp10.000</strong>
                <small data-custom-note>8 coin × Rp1.250</small>
              </div>

              <button class="pay-custom-btn" type="button" data-buy-custom>
                Top Up Custom
              </button>
            </div>
          </section>

          <section class="pay-section-head pay-package-head">
            <div>
              <span class="pay-section-kicker">Paket Cepat</span>
              <h2>Pilih Paket Ranz Coin</h2>
              <p>
                Untuk user yang ingin langsung pilih nominal umum tanpa hitung manual.
              </p>
            </div>
          </section>

          <section class="pay-package-grid">
            <article class="pay-package-card">
              <div class="pay-package-name">Mini</div>
              <div class="pay-package-coins">8 <span>coin</span></div>
              <div class="pay-package-price">Rp10.000</div>
              <p>Cocok untuk coba 1–3 tools ringan.</p>
              <button type="button" data-package="mini">Top Up Mini</button>
            </article>

            <article class="pay-package-card">
              <div class="pay-package-name">Starter</div>
              <div class="pay-package-coins">24 <span>coin</span></div>
              <div class="pay-package-price">Rp30.000</div>
              <p>Untuk penggunaan ringan beberapa kali generate.</p>
              <button type="button" data-package="s">Top Up Starter</button>
            </article>

            <article class="pay-package-card">
              <div class="pay-package-name">Basic</div>
              <div class="pay-package-coins">40 <span>coin</span></div>
              <div class="pay-package-price">Rp50.000</div>
              <p>Pilihan aman untuk pemakaian lebih fleksibel.</p>
              <button type="button" data-package="m">Top Up Basic</button>
            </article>

            <article class="pay-package-card">
              <div class="pay-package-name">Pro</div>
              <div class="pay-package-coins">80 <span>coin</span></div>
              <div class="pay-package-price">Rp100.000</div>
              <p>Untuk user aktif yang sering memakai tools RanzAI.</p>
              <button type="button" data-package="l">Top Up Pro</button>
            </article>

            <article class="pay-package-card pay-featured-package">
              <div class="pay-package-ribbon">Best Deal</div>
              <div class="pay-package-name">Akses Awal</div>
              <div class="pay-package-coins">120 <span>coin</span></div>
              <div class="pay-package-old">Normal Rp150.000</div>
              <div class="pay-package-price">Rp75.000</div>
              <p>Promo terbaik untuk mencoba semua tools RanzAI.</p>
              <button type="button" data-package="early_access">Ambil Promo</button>
            </article>
          </section>

          <section class="pay-how-grid">
            <div class="pay-info-card">
              <span class="pay-section-kicker">Cara Top Up</span>
              <h2>3 Langkah Saja</h2>

              <div class="pay-steps">
                <div>
                  <span>1</span>
                  <p>Pilih paket atau tentukan jumlah coin sendiri.</p>
                </div>
                <div>
                  <span>2</span>
                  <p>Masukkan email dan nomor WhatsApp untuk pembayaran.</p>
                </div>
                <div>
                  <span>3</span>
                  <p>Selesaikan pembayaran, coin akan masuk setelah valid.</p>
                </div>
              </div>
            </div>

            <div class="pay-info-card">
              <span class="pay-section-kicker">Pemakaian Coin</span>
              <h2>Dipakai Saat Generate</h2>
              <p>
                Ranz Coin bukan langganan. Saldo hanya berkurang saat kamu memakai tools tertentu.
                Jadi lebih fleksibel untuk user baru maupun user aktif.
              </p>

              <div class="pay-note-box">
                Promo Akses Awal bersifat terbatas. Harga dan jumlah coin dapat berubah saat RanzAI resmi launch.
              </div>
            </div>
          </section>

          <div class="pay-modal" data-pay-modal>
            <div class="pay-modal-card">
              <button class="pay-modal-close" type="button" data-close-modal>✕</button>

              <div class="pay-modal-kicker">Checkout Ranz Coin</div>
              <h3 data-modal-title>Top Up Ranz Coin</h3>
              <p data-modal-subtitle></p>

              <label>Email</label>
              <input data-input-email type="email" placeholder="email@kamu.com" />

              <label>No. HP / WhatsApp</label>
              <input data-input-phone type="tel" placeholder="08xxxxxxxxxx" />

              <button class="pay-modal-btn" type="button" data-submit-payment>
                Lanjut Pembayaran →
              </button>

              <p class="pay-modal-note">
                Kamu akan diarahkan ke halaman pembayaran Mayar
              </p>
            </div>
          </div>
        </div>
      `;

      const packages = {
        mini: { label: "Mini — 8 Ranz Coin", price: "Rp10.000", coin: 8, amount: 10000 },
        s: { label: "Starter — 24 Ranz Coin", price: "Rp30.000", coin: 24, amount: 30000 },
        m: { label: "Basic — 40 Ranz Coin", price: "Rp50.000", coin: 40, amount: 50000 },
        l: { label: "Pro — 80 Ranz Coin", price: "Rp100.000", coin: 80, amount: 100000 },
        early_access: { label: "Promo Akses Awal — 120 Ranz Coin", price: "Rp75.000", coin: 120, amount: 75000 }
      };

      const customCoinInput = root.querySelector("[data-custom-coin]");
      const customTotal = root.querySelector("[data-custom-total]");
      const customNote = root.querySelector("[data-custom-note]");
      const buyCustomBtn = root.querySelector("[data-buy-custom]");
      const modal = root.querySelector("[data-pay-modal]");
      const closeModalBtn = root.querySelector("[data-close-modal]");
      const modalTitle = root.querySelector("[data-modal-title]");
      const modalSubtitle = root.querySelector("[data-modal-subtitle]");
      const inputEmail = root.querySelector("[data-input-email]");
      const inputPhone = root.querySelector("[data-input-phone]");
      const submitBtn = root.querySelector("[data-submit-payment]");
      const customSection = root.querySelector("[data-custom-section]");

      function formatRupiah(value) {
        return "Rp" + Number(value || 0).toLocaleString("id-ID");
      }

      function getConfig() {
        return window.RANZAI_CONFIG || {};
      }

      function getPaymentUrl() {
        const config = getConfig();
        const base = (config.SUPABASE_URL || "").replace(/\/$/, "");
        return base + "/functions/v1/create-payment";
      }

      function getSupabaseClient() {
        if (window.RANZAI_SUPABASE) {
          return window.RANZAI_SUPABASE;
        }
      
        if (window.ranzSupabaseClient) {
          return window.ranzSupabaseClient;
        }
      
        if (window.supabaseClient) {
          return window.supabaseClient;
        }
      
        if (window.sb) {
          return window.sb;
        }
      
        if (!window.supabase) {
          return null;
        }
      
        const config = getConfig();
      
        if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
          return null;
        }
      
        window.ranzSupabaseClient = window.supabase.createClient(
          config.SUPABASE_URL,
          config.SUPABASE_ANON_KEY
        );
      
        return window.ranzSupabaseClient;
      }

      function updateCustomTotal() {
        let coin = parseInt(customCoinInput.value || "0", 10);

        if (Number.isNaN(coin)) coin = MIN_CUSTOM_COIN;
        if (coin < MIN_CUSTOM_COIN) coin = MIN_CUSTOM_COIN;

        const total = coin * COIN_RATE;

        customTotal.textContent = formatRupiah(total);
        customNote.textContent = coin + " coin × " + formatRupiah(COIN_RATE);

        return { coin, amount: total };
      }

      function openModal(pkgId, customData) {
        selectedPackage = pkgId;

        if (pkgId === "custom") {
          selectedPayload = {
            package_id: "custom",
            custom_coin: customData.coin,
            custom_amount: customData.amount
          };

          modalTitle.textContent = "Custom — " + customData.coin + " Ranz Coin";
          modalSubtitle.textContent = formatRupiah(customData.amount) + " · Pembayaran via Mayar";
        } else {
          const pkg = packages[pkgId];

          selectedPayload = {
            package_id: pkgId
          };

          modalTitle.textContent = pkg.label;
          modalSubtitle.textContent = pkg.price + " · Pembayaran via Mayar";
        }

        modal.classList.add("show");
        tryPrefillEmail();
      }

      function closeModal() {
        modal.classList.remove("show");
        selectedPackage = null;
        selectedPayload = null;
        submitBtn.disabled = false;
        submitBtn.textContent = "Lanjut Pembayaran →";
      }

      async function tryPrefillEmail() {
        try {
          const sb = getSupabaseClient();
          if (!sb) return;

          const { data } = await sb.auth.getUser();

          if (data && data.user && data.user.email) {
            inputEmail.value = data.user.email;
          }
        } catch (e) {}
      }

      async function getUserId() {
        try {
          const sb = getSupabaseClient();
          if (!sb) return null;

          const { data } = await sb.auth.getUser();

          return data && data.user ? data.user.id : null;
        } catch (e) {
          return null;
        }
      }

      async function submitPayment() {
        const email = inputEmail.value.trim();
        const phone = inputPhone.value.trim();

        if (!email) {
          alert("Email wajib diisi.");
          return;
        }

        if (!selectedPayload) return;

        const userId = await getUserId();

        if (!userId) {
          alert("Kamu harus login dulu untuk top up.");
          window.location.href = "/auth/";
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "⏳ Memproses...";

        try {
          const res = await fetch(getPaymentUrl(), {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              ...selectedPayload,
              user_id: userId,
              buyer_email: email,
              buyer_phone: phone || "08000000000"
            })
          });

          const data = await res.json().catch(function () {
            return null;
          });

          if (data && data.payment_url) {
            window.location.href = data.payment_url;
            return;
          }

          throw new Error(data && data.error ? data.error : "Gagal membuat payment.");
        } catch (error) {
          alert("Error: " + error.message);
          submitBtn.disabled = false;
          submitBtn.textContent = "Lanjut Pembayaran →";
        }
      }

      customCoinInput.addEventListener("input", updateCustomTotal);

      customCoinInput.addEventListener("blur", function () {
        let coin = parseInt(customCoinInput.value || "0", 10);
        if (Number.isNaN(coin) || coin < MIN_CUSTOM_COIN) coin = MIN_CUSTOM_COIN;
        customCoinInput.value = coin;
        updateCustomTotal();
      });

      buyCustomBtn.addEventListener("click", function () {
        const customData = updateCustomTotal();
        openModal("custom", customData);
      });

      root.querySelectorAll("[data-package]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          openModal(btn.dataset.package);
        });
      });

      root.querySelectorAll("[data-scroll-custom]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          customSection.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        });
      });

      closeModalBtn.addEventListener("click", closeModal);

      modal.addEventListener("click", function (event) {
        if (event.target === modal) closeModal();
      });

      submitBtn.addEventListener("click", submitPayment);

      updateCustomTotal();
    }
  };
})();
