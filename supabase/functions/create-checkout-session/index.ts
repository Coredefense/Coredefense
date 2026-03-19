import Stripe from 'https://esm.sh/stripe@14?target=denonext'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

function normalizePlan(plan: string): 'usuario' | 'empresa' | '' {
  const p = String(plan || '').trim().toLowerCase()
  if (p === 'usuario' || p === 'user' || p === 'ultimate' || p === 'pro') return 'usuario'
  if (p === 'empresa' || p === 'company' || p === 'business') return 'empresa'
  return ''
}

function priceId(plan: string): string {
  const p = normalizePlan(plan)
  if (p === 'usuario') {
    return (Deno.env.get('STRIPE_PRICE_USUARIO')
      || Deno.env.get('STRIPE_PRICE_USER')
      || Deno.env.get('STRIPE_PRICE_ULTIMATE')
      || '') as string
  }
  if (p === 'empresa') {
    return (Deno.env.get('STRIPE_PRICE_EMPRESA')
      || Deno.env.get('STRIPE_PRICE_COMPANY')
      || Deno.env.get('STRIPE_PRICE_BUSINESS')
      || '') as string
  }
  return ''
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })

  const missing: string[] = []
  ;['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'STRIPE_SECRET_KEY'].forEach((k) => {
    if (!Deno.env.get(k)) missing.push(k)
  })
  const hasUsuario =
    !!Deno.env.get('STRIPE_PRICE_USUARIO')
    || !!Deno.env.get('STRIPE_PRICE_USER')
    || !!Deno.env.get('STRIPE_PRICE_ULTIMATE')
  const hasEmpresa =
    !!Deno.env.get('STRIPE_PRICE_EMPRESA')
    || !!Deno.env.get('STRIPE_PRICE_COMPANY')
    || !!Deno.env.get('STRIPE_PRICE_BUSINESS')
  if (!hasUsuario) missing.push('STRIPE_PRICE_USUARIO|STRIPE_PRICE_USER|STRIPE_PRICE_ULTIMATE')
  if (!hasEmpresa) missing.push('STRIPE_PRICE_EMPRESA|STRIPE_PRICE_COMPANY|STRIPE_PRICE_BUSINESS')
  if (missing.length) {
    return new Response(JSON.stringify({ error: 'missing_env', missing }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
  const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY') as string
  const supabaseService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
  const authHeader = req.headers.get('Authorization') || ''

  const userClient = createClient(supabaseUrl, supabaseAnon, { global: { headers: { Authorization: authHeader } } })
  const adminClient = createClient(supabaseUrl, supabaseService)

  const { data: userData } = await userClient.auth.getUser()
  const user = userData.user
  if (!user) return new Response(JSON.stringify({ error: 'auth_required' }), { status: 401, headers: { ...corsHeaders, 'content-type': 'application/json' } })

  let body: any = null
  try { body = await req.json() } catch (_e) {}
  const items = Array.isArray(body?.items) ? body.items : (body?.plan ? [{ plan: body.plan, qty: 1 }] : [])
  if (items.length === 0) return new Response(JSON.stringify({ error: 'empty_cart' }), { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } })

  const line_items = items.map((it: any) => {
    const plan = String(it.plan || '').trim()
    const qty = Math.max(1, Math.min(99, Number(it.qty) || 1))
    const pid = priceId(plan)
    if (!pid) return null
    return { price: pid, quantity: qty }
  }).filter(Boolean)

  if (line_items.length === 0) return new Response(JSON.stringify({ error: 'invalid_items' }), { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } })

  const siteUrl = String(body?.site_url || Deno.env.get('PUBLIC_SITE_URL') || req.headers.get('origin') || '')
    .replace(/\/+$/, '')
  if (!siteUrl || siteUrl.includes('.functions.supabase.co')) {
    return new Response(JSON.stringify({ error: 'missing_site_url' }), { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } })
  }
  const success_url = `${siteUrl}/comprar.html?success=1&session_id={CHECKOUT_SESSION_ID}`
  const cancel_url = `${siteUrl}/comprar.html?canceled=1`

  let session: Stripe.Checkout.Session
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, { apiVersion: '2024-11-20' })
    session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items,
      customer_email: user.email || undefined,
      success_url,
      cancel_url,
      metadata: { user_id: user.id }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'stripe_error', message: String(e?.message || 'stripe_error') }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
  }

  const payloadItems = items.map((i: any) => ({
    plan: normalizePlan(String(i.plan || '')) || String(i.plan || '').trim().toLowerCase(),
    qty: Math.max(1, Math.min(99, Number(i.qty) || 1))
  }))
  const { error: insertError } = await adminClient.from('orders').insert({
    user_id: user.id,
    email: user.email || '',
    status: 'pending',
    currency: 'EUR',
    total: 0,
    items: payloadItems,
    stripe_session_id: session.id
  })
  if (insertError) {
    return new Response(JSON.stringify({ error: 'db_insert_failed', message: insertError.message }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } })
  }

  return new Response(JSON.stringify({ url: session.url, session_id: session.id }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
})
