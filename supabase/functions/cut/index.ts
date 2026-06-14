// supabase/functions/cut/index.ts
// Pattern: verify JWT → cek coin → process (Replicate) → deduct → log

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COIN_COST = 1; // 1 coin untuk background removal

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type CutPayload = {
  imageUrl?: string;
  background?: "rgba" | "white" | "green";
};

function getSupabaseHeaders(serviceKey: string) {
  return {
    "Content-Type": "application/json",
    "apikey": serviceKey,
    "Authorization": `Bearer ${serviceKey}`,
  };
}

async function getUserFromJWT(req: Request, supabaseUrl: string, serviceKey: string): Promise<{ id: string; email: string } | null> {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;

  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { "apikey": serviceKey, "Authorization": `Bearer ${token}` },
  });

  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.id ? { id: data.id, email: data.email } : null;
}

async function getCoinBalance(supabaseUrl: string, serviceKey: string, userId: string): Promise<number> {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/coin_balance?user_id=eq.${userId}&select=balance`,
    { headers: getSupabaseHeaders(serviceKey) }
  );
  const data = await res.json().catch(() => []);
  return Array.isArray(data) && data[0] ? Number(data[0].balance) : 0;
}

async function deductCoin(supabaseUrl: string, serviceKey: string, userId: string, amount: number, tool: string, note: string): Promise<void> {
  const headers = getSupabaseHeaders(serviceKey);
  const current = await getCoinBalance(supabaseUrl, serviceKey, userId);
  const newBalance = Math.max(0, current - amount);

  await fetch(`${supabaseUrl}/rest/v1/coin_balance?user_id=eq.${userId}`, {
    method: "PATCH",
    headers: { ...headers, "Prefer": "return=minimal" },
    body: JSON.stringify({ balance: newBalance, updated_at: new Date().toISOString() }),
  });

  const profRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=rza_id`, { headers });
  const profData = await profRes.json().catch(() => []);
  const rzaId = Array.isArray(profData) && profData[0] ? profData[0].rza_id : "-";

  await fetch(`${supabaseUrl}/rest/v1/coin_logs`, {
    method: "POST",
    headers: { ...headers, "Prefer": "return=minimal" },
    body: JSON.stringify({ user_id: userId, rza_id: rzaId, type: "usage", amount: -amount, tool, note }),
  });
}

function normalizeOutput(output: unknown) {
  if (typeof output === "string") return output;
  if (Array.isArray(output)) return typeof output[0] === "string" ? output[0] : "";

  if (output && typeof output === "object") {
    const obj = output as Record<string, unknown>;
    if (typeof obj.url === "string") return obj.url;
    if (typeof obj.image === "string") return obj.image;
    if (typeof obj.output === "string") return obj.output;
  }

  return "";
}

async function callReplicateAPI(imageUrl: string, replicateApiKey: string, background: string): Promise<string> {
  const createRes = await fetch(
    "https://api.replicate.com/v1/predictions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Token " + replicateApiKey,
      },
      body: JSON.stringify({
        version: "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc",
        input: {
          image: imageUrl,
          threshold: 0,
          reverse: false,
          background_type: background,
        },
      }),
    },
  );

  const prediction = await createRes.json().catch(() => null);

  if (!createRes.ok) {
    throw new Error(prediction?.detail || prediction?.error || `Replicate error: ${createRes.status}`);
  }

  const pollUrl = prediction?.urls?.get;
  if (!pollUrl) {
    throw new Error("Prediction URL Replicate tidak ditemukan.");
  }

  // Poll untuk hasil
  for (let i = 0; i < 60; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const pollRes = await fetch(pollUrl, {
      headers: {
        "Authorization": "Token " + replicateApiKey,
      },
    });

    const pollData = await pollRes.json().catch(() => null);

    if (!pollRes.ok) {
      throw new Error(pollData?.detail || pollData?.error || `Replicate polling error: ${pollRes.status}`);
    }

    if (pollData?.status === "succeeded") {
      const output = normalizeOutput(pollData.output);
      if (!output) {
        throw new Error("Output gambar tidak ditemukan dari Replicate.");
      }
      return output;
    }

    if (pollData?.status === "failed") {
      throw new Error(pollData.error || "Replicate gagal hapus background.");
    }

    if (pollData?.status === "canceled") {
      throw new Error("Proses Replicate dibatalkan.");
    }
  }

  throw new Error("Timeout: AI terlalu lama. Coba lagi.");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
  const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY")!;

  if (!REPLICATE_API_KEY) {
    return jsonResponse({ error: "REPLICATE_API_KEY belum dikonfigurasi." }, 500);
  }

  // 1. Verify JWT
  const user = await getUserFromJWT(req, SUPABASE_URL, SERVICE_KEY);
  if (!user) return jsonResponse({ error: "Unauthorized. Silakan login ulang." }, 401);

  // 2. Parse body
  let body: CutPayload;
  try { body = await req.json(); }
  catch { return jsonResponse({ error: "Body JSON tidak valid." }, 400); }

  const imageUrl = body.imageUrl;
  const background = body.background || "rgba";

  if (!imageUrl) {
    return jsonResponse({ error: "imageUrl wajib diisi." }, 400);
  }

  // 3. Cek coin
  const balance = await getCoinBalance(SUPABASE_URL, SERVICE_KEY, user.id);
  if (balance < COIN_COST) {
    return jsonResponse({
      error: `Ranz Coin tidak cukup. Dibutuhkan ${COIN_COST} coin, kamu punya ${balance}.`,
      balance,
    }, 402);
  }

  try {
    // 4. Process gambar dengan Replicate
    const outputUrl = await callReplicateAPI(imageUrl, REPLICATE_API_KEY, background);

    // 5. Deduct coin setelah sukses
    await deductCoin(SUPABASE_URL, SERVICE_KEY, user.id, COIN_COST, "cut", `Remove background (${background}) — RanzAI Cut`);

    return jsonResponse({
      success: true,
      output: outputUrl,
      image: outputUrl,
      url: outputUrl,
      background,
      status: "succeeded",
      balance: balance - COIN_COST,
    });

  } catch (err) {
    return jsonResponse({
      error: err instanceof Error ? err.message : "Server error tidak diketahui.",
    }, 500);
  }
});
