const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type BriefRequest = {
  width?: string;
  height?: string;
  unit?: string;
  orientation?: string;
  resolution?: string;
  resolutionUnit?: string;
  assets?: Array<{
    fileName?: string;
    description?: string;
  }>;
  topText?: string;
  middleText?: string;
  bottomText?: string;
  details?: string;
  notes?: string;
  language?: "id" | "en";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      return jsonResponse(
        { error: "OPENAI_API_KEY belum diset di Supabase Secret." },
        500
      );
    }

    const body = (await req.json()) as BriefRequest;

    const prompt = buildPrompt(body);

    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "Kamu adalah AI design brief engine untuk percetakan Indonesia. Tugasmu membuat brief desain yang jelas, rapi, siap dipakai desainer atau image generator. Jangan mengarang identitas orang dari foto. Jika ada asset foto/logo, gunakan hanya label/deskripsi dari user.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.55,
        max_output_tokens: 1400,
      }),
    });

    const openaiData = await openaiRes.json();

    if (!openaiRes.ok) {
      return jsonResponse(
        {
          error: "OpenAI API error",
          detail: openaiData,
        },
        openaiRes.status
      );
    }

    const brief =
      openaiData.output_text ||
      openaiData.output?.[0]?.content?.[0]?.text ||
      "Gagal membaca hasil brief dari AI.";

    return jsonResponse({
      brief,
      usage: openaiData.usage || null,
    });
  } catch (err) {
    return jsonResponse(
      {
        error: "Server error",
        detail: err instanceof Error ? err.message : String(err),
      },
      500
    );
  }
});

function buildPrompt(data: BriefRequest) {
  const assetsText = Array.isArray(data.assets) && data.assets.length
    ? data.assets
        .map((asset, index) => {
          return `${index + 1}. File: ${safe(asset.fileName)} | Deskripsi: ${safe(asset.description)}`;
        })
        .join("\n")
    : "-";

  const languageInstruction =
    data.language === "en"
      ? "Write the final brief in English."
      : "Tulis hasil akhir dalam Bahasa Indonesia.";

  return `
${languageInstruction}

Buat DESAIN BRIEF profesional untuk kebutuhan desain percetakan / promosi.

DATA UKURAN:
- Width: ${safe(data.width)} ${safe(data.unit)}
- Height: ${safe(data.height)} ${safe(data.unit)}
- Orientasi: ${safe(data.orientation)}
- Resolusi: ${safe(data.resolution)} ${safe(data.resolutionUnit)}

ASSET VISUAL:
${assetsText}

ISI UTAMA ATAS:
${safe(data.topText)}

ISI UTAMA TENGAH:
${safe(data.middleText)}

ISI UTAMA BAWAH:
${safe(data.bottomText)}

DETAIL INFORMASI:
${safe(data.details)}

CATATAN TAMBAHAN:
${safe(data.notes)}

FORMAT OUTPUT YANG DIINGINKAN:

1. RINGKASAN DESAIN
Jelaskan jenis desain, tujuan, dan pesan utama.

2. UKURAN & SETTING CETAK
Jelaskan ukuran, orientasi, resolusi, margin aman, dan hal teknis cetak.

3. STRUKTUR LAYOUT
Jelaskan susunan elemen dari atas, tengah, bawah, termasuk posisi teks, logo, foto, dan informasi penting.

4. ARAHAN VISUAL
Jelaskan gaya visual, warna, background, tipografi, kontras, dan nuansa desain.

5. ARAHAN ASSET
Jika ada logo/foto/pejabat/produk/background, jelaskan penggunaannya berdasarkan deskripsi user.
Jangan menebak siapa orang di foto.
Jangan membuat identitas palsu.
Jangan mengganti logo.

6. TEKS YANG HARUS MASUK
Susun ulang teks penting agar rapi dan mudah dibaca.

7. PROMPT GAMBAR SIAP PAKAI
Buat prompt final untuk image generator. Prompt harus detail, jelas, cocok untuk desain banner/spanduk/poster, dan siap dipakai.

8. NEGATIVE PROMPT
Berikan larangan desain: typo, teks kecil, layout berantakan, elemen terpotong, logo palsu, wajah berubah, dan sebagainya.

Prinsip utama:
- Ini tool desain, bukan sekadar prompt.
- Hasil harus terasa seperti arahan produksi desain profesional.
- Prioritaskan keterbacaan dari jauh.
- Cocok untuk percetakan Indonesia.
- Gunakan bahasa yang praktis dan siap dipakai.
`;
}

function safe(value: unknown) {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text || "-";
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
