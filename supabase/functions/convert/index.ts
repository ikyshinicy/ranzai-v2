// supabase/functions/convert-file/index.ts

const CLOUDCONVERT_API_KEY = Deno.env.get("CLOUDCONVERT_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ConvertRequest = {
  filename: string;
  fileBase64: string;
  inputFormat: string;
  outputFormat: string;
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeFormat(format: string) {
  return String(format || "").toLowerCase().replace(".", "").trim();
}

function isAllowedConversion(input: string, output: string) {
  const allowed: Record<string, string[]> = {
    doc: ["pdf"],
    docx: ["pdf"],
    xls: ["pdf"],
    xlsx: ["pdf"],
    ppt: ["pdf"],
    pptx: ["pdf"],
    jpg: ["pdf"],
    jpeg: ["pdf"],
    png: ["pdf"],
    webp: ["pdf"],
    pdf: ["docx", "jpg", "png", "pptx", "txt"],
  };
  return Boolean(allowed[input]?.includes(output));
}

function base64ToUint8Array(base64: string) {
  const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
  const binary = atob(cleanBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function cloudConvertFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`https://api.cloudconvert.com/v2${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${CLOUDCONVERT_API_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data: unknown;
  try { data = text ? JSON.parse(text) : null; }
  catch { data = text; }

  if (!res.ok) {
    const d = data as Record<string, unknown>;
    throw new Error(typeof data === "string" ? data : String(d?.message || d?.error || `CloudConvert error: ${res.status}`));
  }

  return data;
}

// ── Coin helpers ──────────────────────────────────────────────────────────────

const COIN_COST = 1;

async function getUserIdFromJWT(req: Request, supabaseUrl: string, serviceKey: string): Promise<string | null> {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token || token === serviceKey) return null;
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { "apikey": serviceKey, "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) { console.error("❌ JWT validation failed:", res.status); return null; }
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
    { headers: { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}` } }
  );
  if (!res.ok) { console.error("❌ getCoinBalance error:", res.status); return 0; }
  const data = await res.json();
  const balance = Array.isArray(data) && data[0] ? Number(data[0].balance) : 0;
  console.log(`💰 getCoinBalance user=${userId} balance=${balance}`);
  return balance;
}

async function getRzaId(supabaseUrl: string, serviceKey: string, userId: string): Promise<string> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=rza_id`,
      { headers: { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}` } }
    );
    const data = await res.json();
    return Array.isArray(data) && data[0] ? data[0].rza_id : "-";
  } catch { return "-"; }
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
    body: JSON.stringify({ balance: newBalance, updated_at: new Date().toISOString() }),
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
      tool: "convert",
      note: "Konversi File",
    }),
  });

  if (!logRes.ok) console.error("❌ POST coin_logs gagal:", logRes.status, await logRes.text());
  else console.log("✅ coin_logs tercatat");
}

// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

    if (!CLOUDCONVERT_API_KEY) return jsonResponse({ error: "CLOUDCONVERT_API_KEY is not configured" }, 500);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY  = Deno.env.get("SERVICE_ROLE_KEY")!;

    // ── Auth: userId dari JWT ─────────────────────────────────
    const userId = await getUserIdFromJWT(req, SUPABASE_URL, SERVICE_KEY);
    if (!userId) return jsonResponse({ error: "Unauthorized. Silakan login ulang." }, 401);
    console.log("👤 userId dari JWT:", userId);
    // ─────────────────────────────────────────────────────────

    const body = (await req.json()) as ConvertRequest;
    const { filename, fileBase64 } = body;
    const inputFormat = normalizeFormat(body.inputFormat);
    const outputFormat = normalizeFormat(body.outputFormat);

    if (!filename || !fileBase64 || !inputFormat || !outputFormat) {
      return jsonResponse({ error: "Missing required fields: filename, fileBase64, inputFormat, outputFormat" }, 400);
    }

    if (!isAllowedConversion(inputFormat, outputFormat)) {
      return jsonResponse({ error: `Conversion ${inputFormat} to ${outputFormat} is not allowed yet` }, 400);
    }

    // ── Coin guard ────────────────────────────────────────────
    const balance = await getCoinBalance(SUPABASE_URL, SERVICE_KEY, userId);
    if (balance < COIN_COST) return jsonResponse({ error: "Ranz Coin kamu habis. Top up dulu untuk lanjut konversi." }, 402);
    // ─────────────────────────────────────────────────────────

    const fileBytes = base64ToUint8Array(fileBase64);

    // 1. Create CloudConvert job
    const job = await cloudConvertFetch("/jobs", {
      method: "POST",
      body: JSON.stringify({
        tasks: {
          "import-file": { operation: "import/upload" },
          "convert-file": {
            operation: "convert",
            input: "import-file",
            input_format: inputFormat,
            output_format: outputFormat,
          },
          "export-file": {
            operation: "export/url",
            input: "convert-file",
          },
        },
      }),
    });

    // job.data.tasks adalah object { "import-file": {...}, "convert-file": {...}, ... }
    // bukan array — akses langsung by key
    const jobData = (job as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
    const jobId = jobData?.id as string;
    const tasksMap = jobData?.tasks as Record<string, unknown> | undefined;

    console.log("📦 job.data keys:", jobData ? Object.keys(jobData) : "null");
    console.log("📦 tasks type:", typeof tasksMap, Array.isArray(tasksMap) ? "array" : "not array");

    // tasks bisa berupa object map atau array — handle keduanya
    let importTask: Record<string, unknown> | undefined;

    if (Array.isArray(tasksMap)) {
      importTask = (tasksMap as Record<string, unknown>[]).find((t) => t.name === "import-file");
    } else if (tasksMap && typeof tasksMap === "object") {
      importTask = tasksMap["import-file"] as Record<string, unknown> | undefined;
    }

    const uploadUrl = (importTask?.result as Record<string, unknown>)?.form as Record<string, unknown> | undefined;
    const uploadFormUrl = uploadUrl?.url as string | undefined;
    const uploadParameters = uploadUrl?.parameters as Record<string, unknown> | undefined;

    console.log("📤 importTask:", JSON.stringify(importTask)?.slice(0, 200));

    if (!uploadFormUrl || !uploadParameters) {
      return jsonResponse({ error: "Failed to create CloudConvert upload task" }, 500);
    }

    // 2. Upload file
    const formData = new FormData();
    for (const [key, value] of Object.entries(uploadParameters)) {
      formData.append(key, String(value));
    }
    formData.append("file", new Blob([fileBytes]), filename);

    const uploadRes = await fetch(uploadFormUrl, { method: "POST", body: formData });
    if (!uploadRes.ok) {
      throw new Error(await uploadRes.text() || "Failed to upload file to CloudConvert");
    }

    // 3. Poll until finished
    if (!jobId) throw new Error("CloudConvert job ID not found");

    let finishedJob: unknown = null;

    for (let i = 0; i < 60; i++) {
      const currentJob = await cloudConvertFetch(`/jobs/${jobId}`, { method: "GET" });
      const currentData = (currentJob as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
      const statusStr = currentData?.status as string;

      if (statusStr === "finished") { finishedJob = currentJob; break; }
      if (statusStr === "error") throw new Error("CloudConvert job failed");

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    if (!finishedJob) return jsonResponse({ error: "CloudConvert job timeout. Please try again." }, 504);

    // 4. Get export URL — tasks bisa object map atau array
    const finishedData = (finishedJob as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
    const finishedTasksRaw = finishedData?.tasks;

    let exportTaskItem: Record<string, unknown> | undefined;

    if (Array.isArray(finishedTasksRaw)) {
      exportTaskItem = (finishedTasksRaw as Record<string, unknown>[]).find((t) => t.name === "export-file");
    } else if (finishedTasksRaw && typeof finishedTasksRaw === "object") {
      exportTaskItem = (finishedTasksRaw as Record<string, unknown>)["export-file"] as Record<string, unknown> | undefined;
    }

    const exportResult = exportTaskItem?.result as Record<string, unknown> | undefined;
    const exportFiles = exportResult?.files as { url: string; filename: string }[] | undefined;
    const fileUrl = exportFiles?.[0]?.url;
    const outputFilename = exportFiles?.[0]?.filename || filename.replace(/\.[^/.]+$/, "") + "." + outputFormat;

    if (!fileUrl) return jsonResponse({ error: "CloudConvert did not return output file URL" }, 500);

    // 5. Download & return as base64
    const convertedRes = await fetch(fileUrl);
    if (!convertedRes.ok) throw new Error("Failed to download converted file");

    const convertedBytes = new Uint8Array(await convertedRes.arrayBuffer());
    let binary = "";
    for (let i = 0; i < convertedBytes.length; i++) binary += String.fromCharCode(convertedBytes[i]);
    const convertedBase64 = btoa(binary);

    // ── Potong coin setelah sukses ────────────────────────────
    const rzaId = await getRzaId(SUPABASE_URL, SERVICE_KEY, userId);
    await deductCoin(SUPABASE_URL, SERVICE_KEY, userId, balance, rzaId);
    // ─────────────────────────────────────────────────────────

    return jsonResponse({
      success: true,
      filename: outputFilename,
      outputFormat,
      mimeType: outputFormat === "pdf"
        ? "application/pdf"
        : outputFormat === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/octet-stream",
      fileBase64: convertedBase64,
      cloudConvertUrl: fileUrl,
    });

  } catch (error) {
    console.error("❌ convert-file error:", error);
    return jsonResponse({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
