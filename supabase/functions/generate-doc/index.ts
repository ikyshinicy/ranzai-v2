import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY  = Deno.env.get("OPENAI_API_KEY") || "";
const SUPABASE_URL    = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function getUserIdFromJWT(token: string): string | null {
  try {
    const parts  = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.sub || null;
  } catch (e) {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    // Auth
    const authHeader = req.headers.get("authorization") || "";
    const token      = authHeader.replace(/^Bearer\s+/i, "").trim();

    const userId = getUserIdFromJWT(token);
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const body         = await req.json();
    const { prompt, coin, docTypeId, docTypeName } = body;

    if (!prompt || !coin || !docTypeId) {
      return new Response(JSON.stringify({ error: "Parameter tidak lengkap" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const coinNeeded = Number(coin);
    if (isNaN(coinNeeded) || coinNeeded < 1) {
      return new Response(JSON.stringify({ error: "Nilai coin tidak valid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Init Supabase admin
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

    // Check balance
    const { data: balData, error: balErr } = await supabase
      .from("coin_balance")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (balErr || !balData) {
      return new Response(JSON.stringify({ error: "Gagal cek saldo coin" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (balData.balance < coinNeeded) {
      return new Response(JSON.stringify({ error: `Coin tidak cukup. Butuh ${coinNeeded}, punya ${balData.balance}` }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Call OpenAI
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + OPENAI_API_KEY,
        "Content-Type":  "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 4000,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: "Kamu adalah asisten profesional pembuat dokumen bisnis Indonesia. Tulis dokumen lengkap dan siap pakai tanpa penjelasan tambahan."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      console.error("OpenAI error:", errBody);
      return new Response(JSON.stringify({ error: "Gagal menghubungi AI. Coba lagi." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const openaiData = await openaiRes.json();
    const result = openaiData?.choices?.[0]?.message?.content || "";

    if (!result) {
      return new Response(JSON.stringify({ error: "AI tidak menghasilkan output. Coba lagi." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Hitung kata output untuk dynamic coin (tiap 2000 kata +1 coin)
    const wordCount  = result.trim().split(/\s+/).length;
    const extraCoins = Math.floor(wordCount / 2000);
    const totalCoin  = coinNeeded + extraCoins;

    // Cek ulang balance jika ada extra coin
    if (totalCoin > coinNeeded && balData.balance < totalCoin) {
      return new Response(JSON.stringify({ error: `Dokumen panjang (${wordCount} kata), butuh ${totalCoin} coin, punya ${balData.balance}` }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Deduct coin
    const { error: deductErr } = await supabase
      .from("coin_balance")
      .update({ balance: balData.balance - totalCoin })
      .eq("user_id", userId);

    if (deductErr) {
      return new Response(JSON.stringify({ error: "Gagal deduct coin" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Log transaksi
    await supabase.from("coin_logs").insert({
      user_id:     userId,
      amount:      -totalCoin,
      type:        "usage",
      description: `Generate ${docTypeName} (${wordCount} kata)`
    });

    return new Response(JSON.stringify({
      result,
      word_count:  wordCount,
      coin_used:   totalCoin
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("generate-doc error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
