// /scripts/ui/cs-widget.js
// RanzAI Floating CS Widget
// Cara pakai: <script src="/scripts/ui/cs-widget.js" defer></script>
// Otomatis inject floating button ke semua halaman.

(function () {
  "use strict";

  const ACC = "#6C47FF";
  const SYSTEM_PROMPT = `Kamu adalah agen Customer Support RanzAI, platform AI kreatif Indonesia dengan tools: Design (generate gambar), Breakdown (analisis gambar), Write, Gel, Cut, Convert, Vector, Doc. Top up kredit via QRIS (Midtrans).
Jawab ramah, singkat, Bahasa Indonesia. Jika tidak bisa selesaikan masalah, arahkan ke halaman Support dengan mengetik "support". Jangan bahas topik di luar RanzAI.`;

  const FAQ = [
    "Cara top up kredit",
    "Gagal generate gambar",
    "Masalah login",
    "Cara pakai Design tool",
    "Masalah pembayaran",
  ];

  let isOpen = false;
  let msgs = [{ r: "a", t: "Halo! 👋 Saya CS RanzAI. Ada yang bisa dibantu?" }];
  let busy = false;
  let showTicket = false;
  let tkt = { name: "", email: "", cat: "Umum", desc: "" };

  // ─── Inject Styles ──────────────────────────────────────────────────────

  const style = document.createElement("style");
  style.textContent = `
#ranzcs-wrap{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;align-items:flex-end;gap:10px;pointer-events:none}
#ranzcs-wrap>*{pointer-events:auto}
#ranzcs-fab{width:52px;height:52px;border-radius:50%;background:${ACC};border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;box-shadow:0 4px 20px rgba(108,71,255,.4);transition:transform .15s,box-shadow .15s;position:relative}
#ranzcs-fab:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(108,71,255,.55)}
#ranzcs-badge{position:absolute;top:2px;right:2px;width:12px;height:12px;border-radius:50%;background:#4ade80;border:2px solid #0f0f1a}
#ranzcs-panel{width:320px;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:#111122;display:flex;flex-direction:column;box-shadow:0 8px 40px rgba(0,0,0,.6);transform-origin:bottom right;animation:ranzcs-in .18s ease}
@keyframes ranzcs-in{from{opacity:0;transform:scale(.92) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
#ranzcs-hdr{padding:12px 16px;background:${ACC};display:flex;align-items:center;justify-content:space-between}
.ranzcs-hdr-info{display:flex;align-items:center;gap:10px}
.ranzcs-hdr-av{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:17px;color:#fff}
.ranzcs-hdr-text h4{margin:0;font-size:14px;font-weight:600;color:#fff}
.ranzcs-hdr-text p{margin:2px 0 0;font-size:11px;color:rgba(255,255,255,.75);display:flex;align-items:center;gap:4px}
.ranzcs-online{width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block}
#ranzcs-close{background:none;border:none;color:rgba(255,255,255,.75);cursor:pointer;font-size:18px;padding:4px;display:flex;line-height:1}
#ranzcs-msgs{overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;max-height:260px;min-height:140px}
#ranzcs-msgs::-webkit-scrollbar{width:3px}
#ranzcs-msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:4px}
.ranzcs-bub{max-width:83%;padding:9px 13px;border-radius:16px;font-size:13px;line-height:1.55;font-family:inherit;word-break:break-word}
.ranzcs-bub.bot{align-self:flex-start;background:rgba(255,255,255,.07);color:#fff;border-radius:4px 16px 16px 16px}
.ranzcs-bub.usr{align-self:flex-end;background:${ACC};color:#fff;border-radius:16px 16px 4px 16px}
#ranzcs-chips{display:flex;flex-wrap:wrap;gap:5px;padding:2px 12px 10px}
.ranzcs-chip{padding:4px 11px;border-radius:20px;border:1px solid ${ACC};background:transparent;color:${ACC};font-size:11px;cursor:pointer;font-family:inherit;transition:background .12s}
.ranzcs-chip:hover{background:rgba(108,71,255,.12)}
#ranzcs-input-row{display:flex;gap:7px;padding:10px 12px;border-top:1px solid rgba(255,255,255,.08)}
#ranzcs-input{flex:1;padding:8px 11px;border-radius:9px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:#fff;font-size:13px;outline:none;font-family:inherit}
#ranzcs-input:focus{border-color:${ACC}}
#ranzcs-input::placeholder{color:rgba(255,255,255,.35)}
#ranzcs-send{padding:8px 13px;border-radius:9px;background:${ACC};border:none;color:#fff;cursor:pointer;font-size:15px;display:flex;align-items:center;transition:opacity .15s}
#ranzcs-send:hover{opacity:.85}
#ranzcs-send:disabled{opacity:.4;cursor:not-allowed}
#ranzcs-footer{text-align:center;padding:5px 0 10px;font-size:11px;color:rgba(255,255,255,.35)}
#ranzcs-footer a{color:${ACC};text-decoration:underline;cursor:pointer}
.ranzcs-tp span{display:inline-block;width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.45);margin:0 2px;animation:ranzcs-dot .9s infinite}
.ranzcs-tp span:nth-child(2){animation-delay:.2s}
.ranzcs-tp span:nth-child(3){animation-delay:.4s}
@keyframes ranzcs-dot{0%,60%,100%{opacity:.3;transform:scale(1)}30%{opacity:1;transform:scale(1.3)}}
#ranzcs-ticket{padding:14px;display:flex;flex-direction:column;gap:9px}
#ranzcs-ticket h4{margin:0 0 2px;font-size:14px;font-weight:600;color:#fff}
#ranzcs-ticket p{margin:0 0 4px;font-size:12px;color:rgba(255,255,255,.45);line-height:1.5}
.ranzcs-fl label{display:block;font-size:11px;color:rgba(255,255,255,.45);margin-bottom:4px}
.ranzcs-fl input,.ranzcs-fl select,.ranzcs-fl textarea{width:100%;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:#fff;font-size:13px;outline:none;box-sizing:border-box;font-family:inherit}
.ranzcs-fl input:focus,.ranzcs-fl select:focus,.ranzcs-fl textarea:focus{border-color:${ACC}}
.ranzcs-fl textarea{resize:none;height:66px}
.ranzcs-fl select option{background:#1a1a2e}
.ranzcs-tkt-btns{display:flex;gap:7px}
.ranzcs-tkt-btns button:first-child{flex:1;padding:9px;border-radius:9px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);cursor:pointer;font-size:13px;font-family:inherit}
.ranzcs-tkt-btns button:last-child{flex:2;padding:9px;border-radius:9px;background:${ACC};border:none;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity .15s}
.ranzcs-tkt-btns button:last-child:hover{opacity:.85}
`;
  document.head.appendChild(style);

  // ─── DOM ────────────────────────────────────────────────────────────────

  const wrap = document.createElement("div");
  wrap.id = "ranzcs-wrap";
  document.body.appendChild(wrap);

  // ─── Render ─────────────────────────────────────────────────────────────

  function render() {
    wrap.innerHTML = "";

    if (isOpen) {
      const panel = document.createElement("div");
      panel.id = "ranzcs-panel";

      if (!showTicket) {
        panel.innerHTML = `
<div id="ranzcs-hdr">
  <div class="ranzcs-hdr-info">
    <div class="ranzcs-hdr-av"><i class="ti ti-robot"></i></div>
    <div class="ranzcs-hdr-text">
      <h4>RanzAI Support</h4>
      <p><span class="ranzcs-online"></span>Online sekarang</p>
    </div>
  </div>
  <button id="ranzcs-close"><i class="ti ti-x"></i></button>
</div>
<div id="ranzcs-msgs"></div>
<div id="ranzcs-chips"></div>
<div id="ranzcs-input-row">
  <input id="ranzcs-input" type="text" placeholder="Ketik pertanyaan..." autocomplete="off"/>
  <button id="ranzcs-send"><i class="ti ti-send"></i></button>
</div>
<div id="ranzcs-footer">Tidak terselesaikan? <a id="ranzcs-to-ticket">Buat tiket</a></div>`;

        panel.querySelector("#ranzcs-close").onclick = () => { isOpen = false; render(); };
        panel.querySelector("#ranzcs-to-ticket").onclick = () => { showTicket = true; render(); };

        const msgBox = panel.querySelector("#ranzcs-msgs");
        msgs.forEach(m => appendBubble(msgBox, m.r, m.t));

        const chipsEl = panel.querySelector("#ranzcs-chips");
        if (msgs.length <= 2) {
          FAQ.forEach(f => {
            const c = document.createElement("button");
            c.className = "ranzcs-chip";
            c.textContent = f;
            c.onclick = () => sendMsg(f);
            chipsEl.appendChild(c);
          });
        }

        msgBox.scrollTop = msgBox.scrollHeight;

        const inp = panel.querySelector("#ranzcs-input");
        const snd = panel.querySelector("#ranzcs-send");
        inp.addEventListener("keydown", e => { if (e.key === "Enter") sendMsg(inp.value); });
        snd.addEventListener("click", () => sendMsg(inp.value));

      } else {
        // Ticket form
        panel.innerHTML = `
<div id="ranzcs-hdr">
  <div class="ranzcs-hdr-info">
    <div class="ranzcs-hdr-av"><i class="ti ti-ticket"></i></div>
    <div class="ranzcs-hdr-text">
      <h4>Buat Tiket</h4>
    </div>
  </div>
  <button id="ranzcs-close"><i class="ti ti-x"></i></button>
</div>
<div id="ranzcs-ticket">
  <p>Tim kami akan membalas via email dalam 1×24 jam.</p>
  <div class="ranzcs-fl"><label>Nama</label><input id="rt-name" placeholder="Nama kamu" type="text"/></div>
  <div class="ranzcs-fl"><label>Email</label><input id="rt-email" placeholder="email@kamu.com" type="email"/></div>
  <div class="ranzcs-fl"><label>Kategori</label>
    <select id="rt-cat">
      <option>Umum</option><option>Pembayaran / Top Up</option>
      <option>Generate Gambar</option><option>Login / Akun</option>
      <option>Bug / Error</option>
    </select>
  </div>
  <div class="ranzcs-fl"><label>Deskripsi</label><textarea id="rt-desc" placeholder="Ceritakan masalah kamu..."></textarea></div>
  <div class="ranzcs-tkt-btns">
    <button id="rt-cancel">Kembali</button>
    <button id="rt-submit">Kirim Tiket</button>
  </div>
</div>`;

        panel.querySelector("#ranzcs-close").onclick = () => { isOpen = false; render(); };
        panel.querySelector("#rt-cancel").onclick = () => { showTicket = false; render(); };

        // Restore field values
        panel.querySelector("#rt-name").value = tkt.name;
        panel.querySelector("#rt-email").value = tkt.email;
        panel.querySelector("#rt-cat").value = tkt.cat;
        panel.querySelector("#rt-desc").value = tkt.desc;

        ["rt-name","rt-email","rt-cat","rt-desc"].forEach(id => {
          panel.querySelector("#" + id).addEventListener("input", e => {
            const map = {"rt-name":"name","rt-email":"email","rt-cat":"cat","rt-desc":"desc"};
            tkt[map[id]] = e.target.value;
          });
        });

        panel.querySelector("#rt-submit").onclick = () => {
          const { name, email, desc } = tkt;
          if (!name.trim() || !email.trim() || !desc.trim()) {
            alert("Nama, email, dan deskripsi wajib diisi.");
            return;
          }
          const id = "RNZ" + Date.now().toString().slice(-6);
          msgs.push({ r: "a", t: `✅ Tiket #${id} berhasil dikirim! Kami akan menghubungi ${email} dalam 1×24 jam.` });
          tkt = { name: "", email: "", cat: "Umum", desc: "" };
          showTicket = false;
          render();
        };
      }

      wrap.appendChild(panel);
    }

    // FAB
    const fab = document.createElement("button");
    fab.id = "ranzcs-fab";
    fab.innerHTML = `<i class="ti ti-${isOpen ? "x" : "message-chatbot"}"></i>`;
    if (!isOpen) fab.innerHTML += `<span id="ranzcs-badge"></span>`;
    fab.onclick = () => { isOpen = !isOpen; render(); };
    wrap.appendChild(fab);
  }

  function appendBubble(box, role, text) {
    const b = document.createElement("div");
    b.className = "ranzcs-bub " + (role === "u" ? "usr" : "bot");
    b.textContent = text;
    box.appendChild(b);
  }

  function addTyping(box) {
    const b = document.createElement("div");
    b.className = "ranzcs-bub bot ranzcs-tp";
    b.id = "ranzcs-typing";
    b.innerHTML = "<span></span><span></span><span></span>";
    box.appendChild(b);
    box.scrollTop = box.scrollHeight;
  }

  async function sendMsg(text) {
    text = text.trim();
    if (!text || busy) return;

    const msgBox = document.querySelector("#ranzcs-msgs");
    const inp    = document.querySelector("#ranzcs-input");
    const snd    = document.querySelector("#ranzcs-send");
    if (!msgBox) return;

    // Hide chips after first message
    const chips = document.querySelector("#ranzcs-chips");
    if (chips) chips.innerHTML = "";

    msgs.push({ r: "u", t: text });
    if (inp) inp.value = "";
    appendBubble(msgBox, "u", text);
    msgBox.scrollTop = msgBox.scrollHeight;

    if (/tiket|ticket|support/i.test(text)) {
      const reply = "Oke, arahkan ke form tiket ya. Klik \"Buat tiket\" di bawah, atau buka halaman /dashboard/#support.";
      msgs.push({ r: "a", t: reply });
      appendBubble(msgBox, "a", reply);
      msgBox.scrollTop = msgBox.scrollHeight;
      return;
    }

    busy = true;
    if (snd) snd.disabled = true;
    addTyping(msgBox);

    try {
      const history = msgs.slice(-8).map(m => ({
        role: m.r === "u" ? "user" : "assistant",
        content: m.t
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: history
        })
      });
      const data = await res.json();
      const reply = (data.content || []).map(c => c.text || "").join("") || "Maaf ada kendala. Coba lagi ya.";

      const t = document.querySelector("#ranzcs-typing");
      if (t) t.remove();
      msgs.push({ r: "a", t: reply });
      appendBubble(msgBox, "a", reply);
    } catch {
      const t = document.querySelector("#ranzcs-typing");
      if (t) t.remove();
      appendBubble(msgBox, "a", "Koneksi bermasalah. Coba lagi.");
    }

    msgBox.scrollTop = msgBox.scrollHeight;
    busy = false;
    if (snd) snd.disabled = false;
  }

  // Init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }

})();
