// supabase/functions/write/index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Coin helpers ──────────────────────────────────────────────────────────────

const COIN_COST = 1;

async function getUserIdFromJWT(req: Request, supabaseUrl: string, serviceKey: string): Promise<string | null> {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token || token === serviceKey) return null;

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("❌ JWT validation failed, status:", res.status);
      return null;
    }

    const data = await res.json();
    return data?.id ?? null;
  } catch (e) {
    console.error("❌ Error validating JWT:", e);
    return null;
  }
}

async function getCoinBalance(supabaseUrl: string, serviceKey: string, userId: string): Promise<number> {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/coin_balance?user_id=eq.${userId}&select=balance`,
    {
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
      },
    }
  );

  if (!res.ok) {
    console.error("❌ getCoinBalance HTTP error:", res.status, await res.text());
    return 0;
  }

  const data = await res.json();
  const balance = Array.isArray(data) && data[0] ? Number(data[0].balance) : 0;
  console.log(`💰 getCoinBalance user=${userId} balance=${balance}`);
  return balance;
}

async function getRzaId(supabaseUrl: string, serviceKey: string, userId: string): Promise<string> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=rza_id`,
      {
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
        },
      }
    );
    const data = await res.json();
    return Array.isArray(data) && data[0] ? data[0].rza_id : "-";
  } catch {
    return "-";
  }
}

async function deductCoin(
  supabaseUrl: string,
  serviceKey: string,
  userId: string,
  currentBalance: number,
  rzaId: string,
): Promise<void> {
  const newBalance = currentBalance - COIN_COST;
  console.log(`💸 deductCoin: user=${userId} ${currentBalance} → ${newBalance}`);

  const patchRes = await fetch(`${supabaseUrl}/rest/v1/coin_balance?user_id=eq.${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Prefer": "return=representation",
    },
    body: JSON.stringify({
      balance: newBalance,
      updated_at: new Date().toISOString(),
    }),
  });

  const patchText = await patchRes.text();
  if (!patchRes.ok) {
    console.error("❌ PATCH coin_balance gagal:", patchRes.status, patchText);
    throw new Error(`PATCH coin_balance failed: ${patchRes.status} ${patchText}`);
  }
  console.log("✅ PATCH coin_balance sukses:", patchText);

  const logRes = await fetch(`${supabaseUrl}/rest/v1/coin_logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({
      user_id: userId,
      rza_id: rzaId,
      type: "deduct",
      amount: COIN_COST,
      tool: "write",
      note: "Transkrip Teks dari Foto",
    }),
  });

  if (!logRes.ok) {
    console.error("❌ POST coin_logs gagal:", logRes.status, await logRes.text());
  } else {
    console.log("✅ coin_logs tercatat");
  }
}

// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return jsonResponse({ error: "OPENAI_API_KEY belum dikonfigurasi di Supabase Secrets." }, 500);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY  = Deno.env.get("SERVICE_ROLE_KEY")!;

  // ── Auth: userId dari JWT ─────────────────────────────────
  const userId = await getUserIdFromJWT(req, SUPABASE_URL, SERVICE_KEY);
  if (!userId) {
    return jsonResponse({ error: "Unauthorized. Silakan login ulang." }, 401);
  }
  console.log("👤 userId dari JWT:", userId);
  // ─────────────────────────────────────────────────────────

  let body: { imageBase64?: string; mimeType?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Request body tidak valid." }, 400);
  }

  const { imageBase64, mimeType } = body;

  if (!imageBase64 || !mimeType) {
    return jsonResponse({ error: "imageBase64 dan mimeType wajib diisi." }, 400);
  }

  // ── Coin guard ────────────────────────────────────────────
  const balance = await getCoinBalance(SUPABASE_URL, SERVICE_KEY, userId);
  if (balance < COIN_COST) {
    return jsonResponse({ error: "Ranz Coin kamu habis. Top up dulu untuk lanjut transkrip." }, 402);
  }
  // ─────────────────────────────────────────────────────────

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            {
              type: "text",
              text: "Tolong transkrip semua teks yang ada di gambar ini persis seperti adanya. Pertahankan struktur paragraf dan baris jika ada. Jika ada tulisan tangan, coba baca sebaik mungkin. Hanya keluarkan teks saja tanpa penjelasan tambahan apapun.",
            },
          ],
        },
      ],
    }),
  });

  const data = await openaiRes.json().catch(() => null);

  if (!openaiRes.ok) {
    return jsonResponse(
      { error: data?.error?.message || data?.error || `OpenAI API error: ${openaiRes.status}` },
      openaiRes.status
    );
  }

  const result = data?.choices?.[0]?.message?.content || "";
  if (!result) {
    return jsonResponse({ error: "OpenAI mengembalikan hasil kosong." }, 500);
  }

  // ── Potong coin setelah sukses ────────────────────────────
  const rzaId = await getRzaId(SUPABASE_URL, SERVICE_KEY, userId);
  await deductCoin(SUPABASE_URL, SERVICE_KEY, userId, balance, rzaId);
  // ─────────────────────────────────────────────────────────

  return jsonResponse({ result });
});
