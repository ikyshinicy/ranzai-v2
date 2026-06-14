// RanzAI — Edge Function: payment-webhook (Mayar.id)
// Terima notifikasi dari Mayar, update coin_orders, tambah coin_balance, catat coin_logs

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log('🔔 Webhook payload:', JSON.stringify(payload))

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!

    const headers = {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    }

    const event       = payload.event
    const data        = payload.data || {}
    const mayarTrxId  = data.id
    const mayarStatus = data.status

    console.log('📌 Event:', event, '| TrxID:', mayarTrxId, '| Status:', mayarStatus)

    if (event === 'testing') {
      console.log('ℹ️ Testing event, diabaikan.')
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!mayarTrxId) {
      console.warn('⚠️ Webhook tanpa data.id, diabaikan.')
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const orderRes = await fetch(
      `${SUPABASE_URL}/rest/v1/coin_orders?mayar_trx_id=eq.${encodeURIComponent(mayarTrxId)}&select=*`,
      { headers }
    )
    const orders = await orderRes.json()
    const order  = Array.isArray(orders) ? orders[0] : null

    if (!order) {
      console.warn('⚠️ Order tidak ditemukan untuk mayar_trx_id:', mayarTrxId)
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (order.status !== 'pending') {
      console.log('ℹ️ Order sudah diproses sebelumnya:', order.status)
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const newStatus = mayarStatus === 'SUCCESS' ? 'paid'
                    : mayarStatus === 'FAILED'  ? 'failed'
                    : 'expired'

    await fetch(
      `${SUPABASE_URL}/rest/v1/coin_orders?mayar_trx_id=eq.${encodeURIComponent(mayarTrxId)}`,
      {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ status: newStatus, updated_at: new Date().toISOString() }),
      }
    )

    if (newStatus === 'paid') {
      const userId = order.user_id
      const coin   = order.coin

      const balRes  = await fetch(
        `${SUPABASE_URL}/rest/v1/coin_balance?user_id=eq.${userId}&select=balance`,
        { headers }
      )
      const balData = await balRes.json()
      const current = Array.isArray(balData) && balData[0] ? Number(balData[0].balance) : 0

      console.log(`💰 Balance saat ini: ${current}, akan ditambah: ${coin}`)

      // FIX: tambah ?on_conflict=user_id agar upsert bekerja di PostgREST modern
      await fetch(`${SUPABASE_URL}/rest/v1/coin_balance?on_conflict=user_id`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ user_id: userId, balance: current + coin, updated_at: new Date().toISOString() }),
      })

      console.log(`💾 Upsert coin_balance selesai: ${current} + ${coin} = ${current + coin}`)

      const profRes  = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=rza_id`,
        { headers }
      )
      const profData = await profRes.json()
      const rzaId    = Array.isArray(profData) && profData[0] ? profData[0].rza_id : '-'

      await fetch(`${SUPABASE_URL}/rest/v1/coin_logs`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          user_id: userId,
          rza_id:  rzaId,
          type:    'topup',
          amount:  coin,
          tool:    null,
          note:    `Topup via Mayar — ${order.package_label} — ${order.order_id}`,
        }),
      })

      console.log(`✅ Coin +${coin} untuk user ${userId} (${rzaId})`)
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('❌ payment-webhook error:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
