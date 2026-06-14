// supabase/functions/design/index.ts
// Pattern proper: verify JWT → cek coin → generate → deduct → log
// Image model: gpt-image-2 fallback gpt-image-1

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COIN_COST = { brief: 1, image: 3 };
const IMAGE_MODELS = ["gpt-image-2", "gpt-image-1"];

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type DesignPayload = {
  mode?: "brief" | "image";
  width?: string;
  height?: string;
  unit?: string;
  orientation?: string;
  resolution?: string;
  resolutionUnit?: string;
  topText?: string;
  middleText?: string;
  bottomText?: string;
  details?: string;
  notes?: string;
  visualStyle?: string;
  targetOutput?: string;
  assets?: Array<{
    filename?: string;
    description?: string;
    hasFile?: boolean;
    quantity?: number;
    assetType?: "model" | "logo" | "product" | "background" | "other";
  }>;
  brief?: string;
  imagePrompt?: string;
  imageSize?: string;
  images?: Array<{
    base64: string;
    mediaType: string;
    description?: string;
    assetType?: "model" | "logo" | "product" | "background" | "other";
  }>;
};

function getSupabaseHeaders(serviceKey: string) {
  return {
    "Content-Type": "application/json",
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };
}

async function getUserFromJWT(
  req: Request,
  supabaseUrl: string,
  serviceKey: string
): Promise<{ id: string; email: string } | null> {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;

  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.id ? { id: data.id, email: data.email } : null;
}

async function getCoinBalance(
  supabaseUrl: string,
  serviceKey: string,
  userId: string
): Promise<number> {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/coin_balance?user_id=eq.${userId}&select=balance`,
    { headers: getSupabaseHeaders(serviceKey) }
  );

  const data = await res.json().catch(() => []);
  return Array.isArray(data) && data[0] ? Number(data[0].balance) : 0;
}

async function deductCoin(
  supabaseUrl: string,
  serviceKey: string,
  userId: string,
  amount: number,
  tool: string,
  note: string
): Promise<void> {
  const headers = getSupabaseHeaders(serviceKey);
  const current = await getCoinBalance(supabaseUrl, serviceKey, userId);
  const newBalance = Math.max(0, current - amount);

  await fetch(`${supabaseUrl}/rest/v1/coin_balance?user_id=eq.${userId}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({
      balance: newBalance,
      updated_at: new Date().toISOString(),
    }),
  });

  const profRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=rza_id`,
    { headers }
  );

  const profData = await profRes.json().catch(() => []);
  const rzaId = Array.isArray(profData) && profData[0] ? profData[0].rza_id : "-";

  await fetch(`${supabaseUrl}/rest/v1/coin_logs`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({
      user_id: userId,
      rza_id: rzaId,
      type: "usage",
      amount: -amount,
      tool,
      note,
    }),
  });
}

async function callOpenAIImageWithFallback(
  makeRequest: (model: string) => Promise<Response>
): Promise<Response> {
  let lastRes: Response | null = null;

  for (const model of IMAGE_MODELS) {
    const res = await makeRequest(model);

    if (res.ok) return res;

    const clone = res.clone();
    const data = await clone.json().catch(() => null);
    const msg = String(data?.error?.message || "").toLowerCase();
    const code = String(data?.error?.code || "").toLowerCase();

    const isModelError =
      msg.includes("model") ||
      msg.includes("does not exist") ||
      msg.includes("not found") ||
      msg.includes("not supported") ||
      msg.includes("unsupported") ||
      code.includes("model");

    lastRes = res;

    if (isModelError) continue;
    return res;
  }

  return lastRes!;
}

function buildBriefPrompt(body: DesignPayload) {
  return `
Kamu adalah senior graphic designer dan print designer profesional spesialis banner, spanduk, baliho, poster, dan materi promosi UMKM Indonesia.
Buat brief desain lengkap, rapi, dan siap dipakai untuk produksi desain visual.

JENIS OUTPUT: ${body.targetOutput || "-"}
UKURAN: ${body.width || "-"} x ${body.height || "-"} ${body.unit || ""}
ORIENTASI: ${body.orientation || "-"}
RESOLUSI: ${body.resolution || "-"} ${body.resolutionUnit || ""}

TEKS UTAMA:
Atas: ${body.topText || "-"}
Tengah: ${body.middleText || "-"}
Bawah: ${body.bottomText || "-"}

DETAIL INFORMASI: ${body.details || "-"}
CATATAN TAMBAHAN: ${body.notes || "-"}
STYLE VISUAL: ${body.visualStyle || "-"}

ASSET / FOTO / LOGO:
${(body.assets || [])
  .map((a, i) => {
    const type = a.assetType || "other";
    return `${i + 1}. [${type}] ${a.description || "-"} × ${a.quantity || 1}`;
  })
  .join("\n") || "-"}

TUGAS:
Buat brief dalam bahasa Indonesia dengan struktur:
1. Ringkasan desain
2. Ukuran dan setting cetak
3. Struktur layout
4. Penempatan teks utama
5. Penempatan foto/logo/aset
6. Warna dan style visual
7. Tipografi
8. Komposisi dan hierarchy
9. Arahan background dan ornamen
10. Catatan teknis untuk desainer/AI
11. Prompt final siap generate gambar dalam bahasa Inggris

ATURAN PENTING UNTUK ASSET UPLOAD:
- Jika ada foto model/manusia, identitas wajah wajib dipertahankan.
- Jika ada logo, bentuk logo, tulisan, warna, dan proporsi wajib dipertahankan.
- Jika ada foto produk, bentuk produk, label, warna, dan detail utama wajib dipertahankan.
- Jika ada background/gambar lain, komposisi visual utama wajib tetap mirip.
- Asset boleh dirapikan, dibuat lebih tajam, lebih bersih, dan sedikit lebih profesional.
- Jangan mengubah asset menjadi objek/orang/logo/produk baru.

Jangan terlalu pendek. Buat jelas, praktis, dan siap dipakai.
`.trim();
}

function detectAssetType(text: string): "model" | "logo" | "product" | "background" | "other" {
  const t = text.toLowerCase();

  if (
    t.includes("model") ||
    t.includes("orang") ||
    t.includes("manusia") ||
    t.includes("wajah") ||
    t.includes("foto diri") ||
    t.includes("cewek") ||
    t.includes("cowok") ||
    t.includes("wanita") ||
    t.includes("pria")
  ) {
    return "model";
  }

  if (t.includes("logo") || t.includes("brand") || t.includes("lambang")) {
    return "logo";
  }

  if (
    t.includes("produk") ||
    t.includes("botol") ||
    t.includes("kemasan") ||
    t.includes("skincare") ||
    t.includes("makanan") ||
    t.includes("minuman")
  ) {
    return "product";
  }

  if (
    t.includes("background") ||
    t.includes("latar") ||
    t.includes("bg") ||
    t.includes("pemandangan")
  ) {
    return "background";
  }

  return "other";
}

function buildAssetLockBlock(body: DesignPayload): string {
  const images = body.images || [];
  const assets = body.assets || [];

  if (images.length === 0) {
    return `
NO UPLOADED IMAGE ASSETS:
- Generate a new original design based only on the brief.
- No need to preserve any face, logo, product, or uploaded image.
`.trim();
  }

  const lines = images.map((img, i) => {
    const asset = assets[i];
    const desc =
      img.description ||
      asset?.description ||
      `uploaded image asset ${i + 1}`;

    const type =
      img.assetType ||
      asset?.assetType ||
      detectAssetType(desc);

    if (type === "model") {
      return `
IMAGE ${i + 1} — MAIN HUMAN MODEL / FACE LOCK:
- Description: ${desc}
- Use this uploaded person as the main model.
- Preserve the same face identity, facial structure, eyes, nose, lips, jawline, skin tone, hairstyle, outfit, pose, and expression.
- Do not generate a new person.
- Do not beautify into a different person.
- Do not change age, gender, ethnicity, face shape, or recognizable identity.
- You may slightly enhance sharpness, lighting, clarity, and skin cleanliness while keeping the person realistic and recognizable.
`.trim();
    }

    if (type === "logo") {
      return `
IMAGE ${i + 1} — LOGO LOCK:
- Description: ${desc}
- Preserve the uploaded logo exactly.
- Keep the logo shape, lettering, symbol, color relationship, proportions, and brand identity.
- Do not redesign, rewrite, distort, simplify, or invent a new logo.
- You may slightly sharpen and clean the logo edges only.
`.trim();
    }

    if (type === "product") {
      return `
IMAGE ${i + 1} — PRODUCT LOCK:
- Description: ${desc}
- Preserve the uploaded product exactly.
- Keep the product shape, packaging, label, color, brand mark, and key details.
- Do not generate a different product.
- Do not change label text, bottle shape, box shape, food shape, or packaging design.
- You may slightly sharpen, clean, brighten, and improve product clarity.
`.trim();
    }

    if (type === "background") {
      return `
IMAGE ${i + 1} — BACKGROUND / SCENE LOCK:
- Description: ${desc}
- Preserve the main visual identity and composition of the uploaded background.
- Keep the same general scene, mood, perspective, and important shapes.
- Do not replace it with an unrelated background.
- You may slightly enhance sharpness, contrast, lighting, and cleanliness.
`.trim();
    }

    return `
IMAGE ${i + 1} — GENERAL ASSET LOCK:
- Description: ${desc}
- Preserve the uploaded image content as closely as possible.
- Do not transform it into a different object, person, logo, or style unless the brief explicitly asks.
- You may slightly sharpen, clean, brighten, and improve visual quality.
`.trim();
  });

  return `
UPLOADED IMAGE ASSET LOCK RULES:
${lines.join("\n\n")}

GLOBAL ASSET PRESERVATION RULES:
- Uploaded images are real source assets, not loose inspiration.
- Keep every uploaded asset recognizable and close to the original.
- Slightly improve clarity, sharpness, lighting, and print-readiness.
- Do not over-edit faces, logos, products, text labels, or important details.
- Do not create a replacement asset when an uploaded asset exists.
`.trim();
}

function buildImagePrompt(brief: string, body: DesignPayload): string {
  const texts = [
    body.topText,
    body.middleText,
    body.bottomText,
    body.details,
  ]
    .filter(Boolean)
    .join(", ");

  const orientation = body.orientation || "landscape";
  const style = body.visualStyle || "modern";
  const target = body.targetOutput || "banner";
  const assetLockBlock = buildAssetLockBlock(body);

  return `
Indonesian commercial ${target} design, ${orientation} orientation, professional advertising layout, bold readable typography, clean but eye-catching composition.

DESIGN BRIEF:
${brief}

TEXT THAT MUST APPEAR CLEARLY:
${texts || "-"}

${assetLockBlock}

CRITICAL DESIGN REQUIREMENTS:
- Create a COMPLETE, PRINT-READY ${target.toUpperCase()} design.
- All text must be clearly readable, correctly spelled, and not cut off.
- Use bold, high-contrast typography suitable for Indonesian promotional design.
- Include all promotional text, phone numbers, taglines, and details from the brief.
- No placeholder text.
- No lorem ipsum.
- No random extra text.
- No broken text.
- No fake unreadable letters.
- Layout must feel professionally designed, not random.
- Keep safe margins so important text, faces, logos, and products are not cropped.
- Place uploaded model/photo/logo/product assets according to the brief.
- Uploaded assets must remain similar to the original and slightly sharpened.
- Style direction: ${style}.
- Output should be sharp, clean, vivid, high-resolution, and suitable for digital poster/banner preview.
`.trim();
}

function base64ToBlob(base64: string, mediaType = "image/jpeg") {
  const cleanBase64 = base64.includes(",") ? base64.split(",").pop() || "" : base64;
  const byteStr = atob(cleanBase64);
  const arr = new Uint8Array(byteStr.length);

  for (let i = 0; i < byteStr.length; i++) {
    arr[i] = byteStr.charCodeAt(i);
  }

  return new Blob([arr], { type: mediaType });
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
  const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY")!;

  if (!OPENAI_KEY) {
    return jsonResponse({ error: "OPENAI_API_KEY belum dikonfigurasi." }, 500);
  }

  const user = await getUserFromJWT(req, SUPABASE_URL, SERVICE_KEY);
  if (!user) {
    return jsonResponse({ error: "Unauthorized. Silakan login ulang." }, 401);
  }

  let body: DesignPayload;

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Body JSON tidak valid." }, 400);
  }

  const mode = (body.mode || "brief") as "brief" | "image";
  const cost = COIN_COST[mode];

  const balance = await getCoinBalance(SUPABASE_URL, SERVICE_KEY, user.id);

  if (balance < cost) {
    return jsonResponse(
      {
        error: `Ranz Coin tidak cukup. Dibutuhkan ${cost} coin, kamu punya ${balance}.`,
        balance,
      },
      402
    );
  }

  try {
    if (mode === "brief") {
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + OPENAI_KEY,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 2500,
          messages: [
            {
              role: "system",
              content:
                "Kamu adalah senior graphic designer, print designer, dan creative director spesialis banner, spanduk, baliho, poster, dan materi promosi UMKM Indonesia.",
            },
            {
              role: "user",
              content: buildBriefPrompt(body),
            },
          ],
        }),
      });

      const data = await openaiRes.json().catch(() => null);

      if (!openaiRes.ok) {
        return jsonResponse(
          { error: data?.error?.message || `OpenAI error: ${openaiRes.status}` },
          openaiRes.status
        );
      }

      const brief = data?.choices?.[0]?.message?.content || "";

      if (!brief) {
        return jsonResponse({ error: "Hasil brief kosong." }, 500);
      }

      await deductCoin(
        SUPABASE_URL,
        SERVICE_KEY,
        user.id,
        cost,
        "design",
        "Generate brief — RanzAI Design"
      );

      return jsonResponse({
        success: true,
        mode: "brief",
        brief,
        balance: balance - cost,
      });
    }

    if (mode === "image") {
      const rawSource = body.imagePrompt || body.brief || "";

      if (!rawSource || rawSource.length < 20) {
        return jsonResponse({ error: "Prompt gambar kosong." }, 400);
      }

      const finalPrompt = buildImagePrompt(rawSource, body);
      const size = body.imageSize || "1536x1024";
      const images = body.images || [];

      let imageRes: Response;

      if (images.length > 0) {
        imageRes = await callOpenAIImageWithFallback(async (model) => {
          const form = new FormData();

          form.append("model", model);
          form.append("prompt", finalPrompt);
          form.append("size", size);
          form.append("n", "1");

          for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const mediaType = img.mediaType || "image/jpeg";
            const blob = base64ToBlob(img.base64, mediaType);
            const ext = mediaType.split("/")[1] || "jpg";

            form.append("image[]", blob, `asset_${i + 1}.${ext}`);
          }

          return fetch("https://api.openai.com/v1/images/edits", {
            method: "POST",
            headers: {
              Authorization: "Bearer " + OPENAI_KEY,
            },
            body: form,
          });
        });
      } else {
        imageRes = await callOpenAIImageWithFallback((model) => {
          return fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + OPENAI_KEY,
            },
            body: JSON.stringify({
              model,
              prompt: finalPrompt,
              size,
            }),
          });
        });
      }

      const imageData = await imageRes.json().catch(() => null);

      if (!imageRes.ok) {
        return jsonResponse(
          {
            error:
              imageData?.error?.message ||
              `OpenAI image error: ${imageRes.status}`,
          },
          imageRes.status
        );
      }

      const b64 = imageData?.data?.[0]?.b64_json;
      const url = imageData?.data?.[0]?.url;

      if (!b64 && !url) {
        return jsonResponse(
          { error: "Image API tidak mengembalikan gambar." },
          500
        );
      }

      await deductCoin(
        SUPABASE_URL,
        SERVICE_KEY,
        user.id,
        cost,
        "design",
        `Generate gambar${
          images.length > 0 ? " (+" + images.length + " foto asset)" : ""
        } — RanzAI Design`
      );

      return jsonResponse({
        success: true,
        mode: "image",
        imageUrl: b64 ? "data:image/png;base64," + b64 : url,
        balance: balance - cost,
      });
    }

    return jsonResponse({ error: "Mode tidak dikenal." }, 400);
  } catch (err) {
    return jsonResponse(
      {
        error:
          err instanceof Error
            ? "Server error: " + err.message
            : "Server error tidak diketahui.",
      },
      500
    );
  }
});
