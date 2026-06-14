// supabase/functions/breakdown/index.ts

const ALLOWED_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function safeText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim() || fallback;
}

function normalizeMode(value: string) {
  const mode = value.toLowerCase().trim();
  if (mode === "simple") return "simple";
  return "detailed";
}

function stripJsonFences(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json|JSON)?\s*\n?/m, "");
  cleaned = cleaned.replace(/\n?```\s*$/m, "");
  const firstBrace = cleaned.search(/[{[]/);
  if (firstBrace > 0) cleaned = cleaned.slice(firstBrace);
  const lastBrace = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  if (lastBrace !== -1 && lastBrace < cleaned.length - 1) cleaned = cleaned.slice(0, lastBrace + 1);
  return cleaned.trim();
}

const EMPTY_DETAIL = "Tidak terlihat jelas dari gambar.";

const DETAIL_FIELDS = [
  "image_category",
  "overall_summary",
  "canvas_orientation_ratio",
  "main_subject",
  "secondary_subjects",
  "person_identity_neutral_traits",
  "pose_expression_body",
  "outfit_accessories_props",
  "background_breakdown",
  "foreground_midground_background",
  "layout_structure",
  "visual_hierarchy_reading_order",
  "text_content",
  "text_typography",
  "graphic_ornaments",
  "product_object_details",
  "composition",
  "camera_perspective",
  "lighting_shadow",
  "color_palette",
  "texture_material",
  "style_aesthetic",
  "mood_atmosphere",
  "print_design_notes",
  "quality_rendering",
  "missing_or_unclear_details",
  "negative",
  "simple_prompt",
  "prompt",
];

function ensureString(value: unknown, fallback = EMPTY_DETAIL) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value) && value.length) return value.map(String).join(", ");
  if (value && typeof value === "object") {
    try {
      const text = Object.entries(value as Record<string, unknown>)
        .map(([key, val]) => `${key}: ${String(val)}`)
        .join("; ");
      return text.trim() || fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function oneParagraph(value: unknown) {
  return ensureString(value, "").replace(/\s*\n+\s*/g, " ").replace(/\s{2,}/g, " ").trim();
}

function normalizeResult(result: Record<string, unknown>, outputMode: string) {
  if (outputMode === "simple") {
    result.mode = "simple";
    result.prompt = oneParagraph(result.prompt);
    if (!result.prompt) {
      result.prompt = "Prompt tidak berhasil dibuat. Coba gunakan gambar yang lebih jelas.";
    }
    return result;
  }

  result.mode = "detailed";

  for (const field of DETAIL_FIELDS) {
    result[field] = ensureString(result[field]);
  }

  result.simple_prompt = oneParagraph(result.simple_prompt);
  result.prompt = oneParagraph(result.prompt);

  if (!result.simple_prompt || result.simple_prompt === EMPTY_DETAIL) {
    result.simple_prompt = result.prompt;
  }

  if (!result.prompt || result.prompt === EMPTY_DETAIL) {
    result.prompt = "Prompt tidak berhasil dibuat secara lengkap. Coba gunakan gambar yang lebih jelas.";
  }

  return result;
}

function buildSystemPrompt(outputMode: string): string {
  if (outputMode === "simple") {
    return `
You are RanzAI Breakdown Engine.
You analyze images and convert them into a single ready-to-copy image generation prompt.

SIMPLE MODE RULES:
- Output MUST be valid JSON only. No markdown. No explanation outside JSON.
- Generate ONE prompt only.
- The prompt must be ONE paragraph only. No line breaks inside the prompt.
- Length target: 180-320 words.
- Use natural prompt language suitable for general AI image generation.
- Describe only what is visible in the image. Do not invent new objects.
- Must include: main subject, visible objects, background, layout, composition, camera/framing, lighting, colors, mood, style, texture, materials, and atmosphere.
- If the image is graphic design/poster/banner/menu: include readable text, typography, ornaments, layout hierarchy, print style, and color treatment.
- If an element is unclear, describe it as unclear instead of leaving it out.
- Do not identify real people.

Return ONLY this JSON:
{
  "mode": "simple",
  "prompt": "one dense paragraph, no line breaks, ready to copy"
}
`;
  }

  return `
You are RanzAI Breakdown Engine.
You are a professional visual analyst, prompt engineer, print designer, layout analyst, typography analyst, and photography analyst.

Your task:
Analyze the uploaded image with maximum practical detail, then generate ONE final prompt for general AI image generation.

CRITICAL OUTPUT RULES:
- Output MUST be valid JSON only. No markdown. No explanation outside JSON.
- Do NOT leave any field empty.
- If a field is not visible or cannot be determined, fill it with: "Tidak terlihat jelas dari gambar."
- Preserve real visual structure. Do not invent elements.
- Do not identify real people.
- If the image contains text, transcribe all readable text accurately. If unreadable, say it is unreadable.
- Generate ONE final prompt only.

FIELD DEPTH RULES:
- image_category: identify whether it is photo, poster, banner, menu, product, document, illustration, UI, etc.
- overall_summary: summarize the full visual in 3-5 sentences.
- canvas_orientation_ratio: explain orientation and approximate ratio.
- main_subject: describe the primary subject in detail.
- secondary_subjects: describe supporting objects, icons, decorations, text blocks, people, products, or background objects.
- person_identity_neutral_traits: only non-identifying visible traits, no names.
- pose_expression_body: pose/expression/body position if people are visible; otherwise state not visible.
- outfit_accessories_props: clothing/accessories/props if visible; otherwise state not visible.
- background_breakdown: describe background layer by layer.
- foreground_midground_background: separate foreground, midground, background.
- layout_structure: describe grid, alignment, spacing, balance.
- visual_hierarchy_reading_order: explain what is seen/read first, second, third.
- text_content: transcribe all readable text.
- text_typography: describe font style, weight, stroke, shadow, size, color, alignment.
- graphic_ornaments: describe frames, icons, lines, brush, smoke, glow, particles, ornaments.
- product_object_details: describe each product/object individually.
- composition: describe framing and arrangement.
- camera_perspective: describe camera angle, lens feel, distance, perspective.
- lighting_shadow: describe light source, contrast, shadow, highlight.
- color_palette: list dominant colors and contrast.
- texture_material: describe material/texture/surface.
- style_aesthetic: describe visual style/genre.
- mood_atmosphere: describe emotional tone.
- print_design_notes: include print/layout production notes if relevant; otherwise state not visible.
- quality_rendering: describe sharpness, realism, resolution feel, finish.
- missing_or_unclear_details: list unclear parts.
- negative: generate negative prompt based on defects to avoid.
- simple_prompt: one paragraph summary prompt, no line breaks.
- prompt: one final detailed ready-to-copy prompt, 250-450 words, one paragraph, no line breaks.

Return ONLY this JSON structure:
{
  "mode": "detailed",
  "image_category": "...",
  "overall_summary": "...",
  "canvas_orientation_ratio": "...",
  "main_subject": "...",
  "secondary_subjects": "...",
  "person_identity_neutral_traits": "...",
  "pose_expression_body": "...",
  "outfit_accessories_props": "...",
  "background_breakdown": "...",
  "foreground_midground_background": "...",
  "layout_structure": "...",
  "visual_hierarchy_reading_order": "...",
  "text_content": "...",
  "text_typography": "...",
  "graphic_ornaments": "...",
  "product_object_details": "...",
  "composition": "...",
  "camera_perspective": "...",
  "lighting_shadow": "...",
  "color_palette": "...",
  "texture_material": "...",
  "style_aesthetic": "...",
  "mood_atmosphere": "...",
  "print_design_notes": "...",
  "quality_rendering": "...",
  "missing_or_unclear_details": "...",
  "negative": "...",
  "simple_prompt": "one paragraph summary prompt",
  "prompt": "one final detailed prompt, one paragraph, no line breaks"
}
`;
}


// ── Coin helpers ──────────────────────────────────────────────────────────────

const COIN_COST = 1;

// Ambil userId dari JWT token di Authorization header (secure, tidak bisa dimanipulasi)
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

async function deductCoin(
  supabaseUrl: string,
  serviceKey: string,
  userId: string,
  currentBalance: number,
  rzaId: string,
): Promise<void> {
  const newBalance = currentBalance - COIN_COST;

  console.log(`💸 deductCoin: user=${userId} ${currentBalance} → ${newBalance}`);

  // Update saldo
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

  // Catat coin_logs
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
      tool: "breakdown",
      note: "Generate Breakdown",
    }),
  });

  if (!logRes.ok) {
    console.error("❌ POST coin_logs gagal:", logRes.status, await logRes.text());
  } else {
    console.log("✅ coin_logs tercatat");
  }
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

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return jsonResponse({ error: "OPENAI_API_KEY is not configured" }, 500);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY  = Deno.env.get("SERVICE_ROLE_KEY")!;

    // ── Auth: ambil userId dari JWT (bukan dari body) ─────────
    const userId = await getUserIdFromJWT(req, SUPABASE_URL, SERVICE_KEY);
    if (!userId) {
      return jsonResponse({ error: "Unauthorized. Silakan login ulang." }, 401);
    }
    console.log("👤 userId dari JWT:", userId);
    // ─────────────────────────────────────────────────────────

    const body = await req.json();

    const imageBase64  = safeText(body.imageBase64);
    const mediaType    = safeText(body.mediaType, "image/jpeg");
    const outputFormat = safeText(body.outputFormat, "plain");
    const outputMode   = normalizeMode(safeText(body.outputMode, "detailed"));

    if (!imageBase64) {
      return jsonResponse({ error: "Missing imageBase64" }, 400);
    }

    // ── Coin guard ────────────────────────────────────────────
    const balance = await getCoinBalance(SUPABASE_URL, SERVICE_KEY, userId);

    if (balance < COIN_COST) {
      return jsonResponse({ error: "Ranz Coin tidak cukup. Top up dulu untuk generate." }, 402);
    }
    // ─────────────────────────────────────────────────────────

    if (!ALLOWED_MEDIA_TYPES.has(mediaType)) {
      return jsonResponse(
        { error: `Unsupported mediaType: ${mediaType}. Allowed: jpeg, png, gif, webp` },
        400,
      );
    }

    const systemPrompt = buildSystemPrompt(outputMode);

    const userInstruction = outputMode === "simple"
      ? "Analyze this image and generate ONE dense paragraph prompt. One paragraph only, no line breaks. Do not include breakdown sections."
      : "Analyze this image with maximum detail. Fill every field. If something is not visible, write exactly: Tidak terlihat jelas dari gambar. Then generate ONE final prompt as one paragraph.";

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.15,
        max_tokens: outputMode === "simple" ? 1800 : 7000,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userInstruction },
              { type: "image_url", image_url: { url: `data:${mediaType};base64,${imageBase64}` } },
            ],
          },
        ],
      }),
    });

    const openaiText = await openaiRes.text();

    let openaiData: Record<string, unknown>;
    try {
      openaiData = JSON.parse(openaiText);
    } catch {
      return jsonResponse({ error: "Failed to parse OpenAI response", raw: openaiText }, 500);
    }

    if (!openaiRes.ok) {
      const errData = openaiData as { error?: { message?: string } };
      return jsonResponse(
        { error: errData?.error?.message || "OpenAI request failed", detail: openaiData },
        openaiRes.status,
      );
    }

    const choices = openaiData?.choices as Array<{
      message: { content: string };
      finish_reason: string;
    }> | undefined;
    const content = choices?.[0]?.message?.content;
    const finishReason = choices?.[0]?.finish_reason;

    if (!content) {
      return jsonResponse({ error: "OpenAI returned empty content" }, 500);
    }

    if (finishReason === "length") {
      return jsonResponse(
        {
          error: "AI response was truncated. Try Simple mode or a smaller image.",
          finish_reason: "length",
          raw: content,
        },
        500,
      );
    }

    let result: Record<string, unknown>;
    try {
      result = JSON.parse(stripJsonFences(content));
    } catch {
      return jsonResponse({ error: "AI output was not valid JSON", raw: content }, 500);
    }

    result = normalizeResult(result, outputMode);

    result.meta = {
      outputFormat,
      outputMode,
      engine: "RanzAI Breakdown Engine",
    };

    // ── Potong coin setelah generate sukses ───────────────────
    // Tidak di-swallow — kalau gagal, throw agar ketahuan
    const rzaId = await getRzaId(SUPABASE_URL, SERVICE_KEY, userId);
    await deductCoin(SUPABASE_URL, SERVICE_KEY, userId, balance, rzaId);
    // ─────────────────────────────────────────────────────────

    return jsonResponse(result);

  } catch (error) {
    console.error("❌ breakdown error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      500,
    );
  }
});
