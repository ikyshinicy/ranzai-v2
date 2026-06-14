import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const COIN_COST = 1;

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function getUserIdFromJWT(token: string): string | null {
  try {
    const parts = token.split(".");
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
    // ── Auth ────────────────────────────────────────────────────────
    const authHeader = req.headers.get("authorization") || "";
    const token      = authHeader.replace(/^Bearer\s+/i, "").trim();

    const userId = getUserIdFromJWT(token);
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ── Supabase admin ───────────────────────────────────────────────
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

    // ── Cek balance ──────────────────────────────────────────────────
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

    if (balData.balance < COIN_COST) {
      return new Response(JSON.stringify({
        error: `Coin tidak cukup. Butuh ${COIN_COST}, punya ${balData.balance}`
      }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ── Deduct coin ──────────────────────────────────────────────────
    const { error: deductErr } = await supabase
      .from("coin_balance")
      .update({ balance: balData.balance - COIN_COST })
      .eq("user_id", userId);

    if (deductErr) {
      console.error("Deduct error:", deductErr);
      return new Response(JSON.stringify({ error: "Gagal deduct coin" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ── Log ──────────────────────────────────────────────────────────
    await supabase.from("coin_logs").insert({
      user_id:     userId,
      amount:      -COIN_COST,
      type:        "usage",
      description: "Download Vector PNG"
    });

    return new Response(JSON.stringify({ success: true, coin_used: COIN_COST }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("vector-download error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
