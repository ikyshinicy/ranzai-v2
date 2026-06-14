// RanzAI — Edge Function: create-payment (Mayar.id)
// Buat payment link dan simpan order pending ke coin_orders

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const PACKAGES: Record<string, { coin: number; amount: number; label: string }> = {
  'mini':         { coin: 8,   amount: 10000,  label: 'Mini - 8 Ranz Coin' },
  's':            { coin: 24,  amount: 30000,  label: 'Starter - 24 Ranz Coin' },
  'm':            { coin: 40,  amount: 50000,  label: 'Basic - 40 Ranz Coin' },
  'l':            { coin: 80,  amount: 100000, label: 'Pro - 80 Ranz Coin' },
  'early_access': { coin: 120, amount: 75000,  label: 'Akses Awal - 120 Ranz Coin' },
}

const CUSTOM_COIN_RATE = 1250
const MIN_CUSTOM_COIN  = 2

Deno.serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const bodyJson = await req.json()
    const {
      package_id,
      user_id,
      buyer_name,
      buyer_email,
      buyer_phone,
      custom_coin,
      custom_amount,
    } = bodyJson

    // ── Validasi input ────────────────────────────────────────────
    if (!package_id || !user_id || !buyer_email) {
      return new Response(
        JSON.stringify({ error: 'package_id, user_id, dan buyer_email wajib diisi.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Resolve paket ─────────────────────────────────────────────
    let pkg = PACKAGES[package_id]

    if (package_id === 'custom') {
      const coin   = Number(custom_coin)
      const amount = Number(custom_amount)

      if (!Number.isFinite(coin) || !Number.isInteger(coin) || coin < MIN_CUSTOM_COIN) {
        return new Response(
          JSON.stringify({ error: `Minimum custom top up adalah ${MIN_CUSTOM_COIN} Ranz Coin (angka bulat).` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (amount !== coin * CUSTOM_COIN_RATE) {
        return new Response(
          JSON.stringify({ error: 'Nominal custom tidak valid.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      pkg = { coin, amount, label: `Custom - ${coin} Ranz Coin` }
    }

    if (!pkg) {
      return new Response(
        JSON.stringify({ error: `package_id tidak valid. Pilihan: ${Object.keys(PACKAGES).join(', ')}, custom` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Env vars ──────────────────────────────────────────────────
    const MAYAR_API_KEY = Deno.env.get('MAYAR_API_KEY')!
    const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_KEY  = Deno.env.get('SERVICE_ROLE_KEY')!

    const isSandbox = MAYAR_API_KEY.includes('sandbox') || Deno.env.get('MAYAR_SANDBOX') === 'true'
    const MAYAR_BASE = isSandbox
      ? 'https://api.mayar.club/hl/v1'
      : 'https://api.mayar.id/hl/v1'

    const orderId   = `ranzai-${user_id.slice(0, 8)}-${Date.now()}`
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // ── Hit Mayar API ─────────────────────────────────────────────
    const mayarBody = {
      name:        buyer_name  || 'RanzAI User',
      email:       buyer_email,
      mobile:      buyer_phone || '08000000000',
      amount:      pkg.amount,
      description: `${pkg.label} — Order: ${orderId}`,
      redirectUrl: 'https://ranz-ai.com/topup-success',
      expiredAt,
    }

    console.log('📦 Mayar payload:', JSON.stringify(mayarBody))

    const mayarRes  = await fetch(`${MAYAR_BASE}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${MAYAR_API_KEY}`,
      },
      body: JSON.stringify(mayarBody),
    })

    const mayarData = await mayarRes.json()
    console.log('💳 Mayar response:', JSON.stringify(mayarData))

    if (mayarData.statusCode !== 200) {
      throw new Error(mayarData.messages || `Mayar error: ${JSON.stringify(mayarData)}`)
    }

    const paymentUrl    = mayarData.data?.link
    const mayarTrxId    = mayarData.data?.transactionId

    // ── Simpan ke coin_orders (pending) ───────────────────────────
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/coin_orders`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify({
        order_id:      orderId,
        user_id,
        package_id,
        package_label: pkg.label,
        coin:          pkg.coin,
        amount:        pkg.amount,
        status:        'pending',
        mayar_trx_id:  mayarTrxId,
        payment_url:   paymentUrl,
      }),
    })

    if (!insertRes.ok) {
      const insertErr = await insertRes.text()
      console.error('❌ Gagal simpan coin_orders:', insertErr)
      // Tidak throw — order tetap dibuat, webhook yang handle
    }

    return new Response(
      JSON.stringify({
        order_id:    orderId,
        payment_url: paymentUrl,
        amount:      pkg.amount,
        coin:        pkg.coin,
        package:     pkg.label,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('❌ create-payment error:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
