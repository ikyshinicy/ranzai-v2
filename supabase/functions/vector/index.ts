import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY   = Deno.env.get("OPENAI_API_KEY") || "";
const SUPABASE_URL     = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const COIN_COST = 3;

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

const RANZAI_VECTOR_PROMPT = `
You are RanzAI Vector.
Convert the uploaded image into a clean, sharp, print-ready vector-style result.
Main rules:
- Preserve the original design, shape, layout, proportion, text, logo identity, and composition exactly as shown.
- Do not redesign.
- Do not add new elements.
- Do not remove important details.
- Do not change the concept.
- Do not create a new logo.
- Do not make artistic interpretation.
Enhancement rules:
- Sharpen all details.
- Improve edge clarity.
- Clean rough edges.
- Remove blur, noise, compression artifacts, and pixelation.
- Make lines crisp and readable.
- Make the result high-resolution and print-ready.
Vector rules:
- Use clean vector-like shapes.
- Use smooth curves and sharp edges.
- Use solid flat colors only.
- No gradients.
- No shadows.
- No texture.
- No realistic photo effect.
- No 3D effect.
Background rules:
- Use pure white background by default.
- If the user asks for black and white, use pure black shapes on pure white background only.
- No grayscale unless specifically requested.
Output:
Clean vector trace style, high contrast, sharp, accurate, suitable for sticker, banner, screen printing, vinyl cutting, logo reproduction, and print production.
`.trim();

const STYLE_INSTRUCTIONS: Record<string, string> = {
  bw:          "Style: Black & White. Use pure black shapes on pure white background only. No gray tones.",
  clean_color: "Style: Clean Color. Use clean flat solid colors per region. No gradients, no shadows, no textures.",
  logo:        "Style: Logo Trace. Simplify details aggressively. Bold outlines, minimal shapes, solid colors. Suitable for branding and merchandise.",
  sticker:     "Style: Sticker. Clean outlines with bold black border around subject. Flat bright colors. White background. Suitable for sticker printing.",
  lineart:     "Style: Line Art. Black lines on white background only. No fill colors. Precise detailed outlines like a professional ink drawing.",
};

function buildPrompt(styleMode: string, userPrompt?: string): string {
  const styleInstruction = STYLE_INSTRUCTIONS[styleMode] || STYLE_INSTRUCTIONS["bw"];
  return `${RANZAI_VECTOR_PROMPT}

${styleInstruction}

User instruction:
${userPrompt || "Convert this image using the default RanzAI Vector rules."}`;
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

    // ── Body ─────────────────────────────────────────────────────────
    const body = await req.json();
    const { imageBase64, mediaType, styleMode, userPrompt } = body;

    if (!imageBase64 || !mediaType || !styleMode) {
      return new Response(JSON.stringify({ error: "Parameter tidak lengkap (imageBase64, mediaType, styleMode)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const validStyles = ["bw", "clean_color", "logo", "sticker", "lineart"];
    if (!validStyles.includes(styleMode)) {
      return new Response(JSON.stringify({ error: "styleMode tidak valid" }), {
        status: 400,
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

    // ── Call GPT Image 1 (edit endpoint) ────────────────────────────
    // Decode base64 → Blob untuk form-data
    const imageBytes  = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
    const imageBlob   = new Blob([imageBytes], { type: mediaType });

    const formData = new FormData();
    formData.append("model", "gpt-image-1");
    formData.append("image", imageBlob, "input.png");
    formData.append("prompt", buildPrompt(styleMode, userPrompt));
    formData.append("n", "1");
    formData.append("size", "1024x1024");

    const openaiRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + OPENAI_API_KEY
        // Content-Type TIDAK di-set manual — biarkan fetch set boundary FormData
      },
      body: formData
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
    const item       = openaiData?.data?.[0];
    let resultB64    = item?.b64_json || null;

    // Jika response berupa URL, fetch dan convert ke base64 di server
    if (!resultB64 && item?.url) {
      const imgRes = await fetch(item.url);
      if (!imgRes.ok) {
        return new Response(JSON.stringify({ error: "Gagal mengambil hasil gambar dari AI." }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const imgBuffer = await imgRes.arrayBuffer();
      resultB64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));
    }

    if (!resultB64) {
      return new Response(JSON.stringify({ error: "AI tidak mengembalikan gambar. Coba lagi." }), {
        status: 500,
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
      description: `Generate Vector: ${styleMode}`
    });

    return new Response(JSON.stringify({
      imageBase64: resultB64,
      coin_used:   COIN_COST
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("vector error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
