(async () => {
  const debug = (new URLSearchParams(location.search).get('debug') === '1') || (localStorage.getItem('cd.debug') === '1')
  try{
    const originalAssign = window.location.assign.bind(window.location)
    window.location.assign = function(url){
      console.log('🚨 REDIRECT assign:', url)
      console.trace('STACK TRACE REDIRECT')
      return originalAssign(url)
    }
  }catch(_e){}
  try{
    const proto = Object.getPrototypeOf(window.location)
    const hrefDesc = Object.getOwnPropertyDescriptor(proto, 'href')
    if(hrefDesc && typeof hrefDesc.set === 'function'){
      Object.defineProperty(proto, 'href', {
        configurable: true,
        enumerable: hrefDesc.enumerable,
        get: function(){ return hrefDesc.get.call(this) },
        set: function(url){
          console.log('🚨 REDIRECT href:', url)
          console.trace('STACK TRACE REDIRECT')
          return hrefDesc.set.call(this, url)
        }
      })
    }
  }catch(_e){}

  function supa(){
    return window.CD_DB && window.CD_DB.client ? window.CD_DB.client : null
  }

  async function waitDb(ms){
    const c = supa()
    if(c) return c
    if(window.CD_DB_READY && window.CD_DB_READY.promise){
      const readyClient = await Promise.race([
        window.CD_DB_READY.promise,
        new Promise((resolve)=>setTimeout(()=>resolve(null), ms))
      ])
      if(readyClient) return readyClient
    }
    return await new Promise((resolve)=>{
      let done = false
      const t = setTimeout(()=>{ if(done) return; done = true; resolve(null) }, ms)
      window.addEventListener('cd:db:ready', ()=>{
        if(done) return
        done = true
        clearTimeout(t)
        resolve(supa())
      }, { once: true })
    })
  }

  function hasStoredAuth(){
    const hasCustom = !!localStorage.getItem('cd-auth')
    const hasSb = Object.keys(localStorage).some(k=>k.startsWith('sb-') && k.endsWith('-auth-token') && !!localStorage.getItem(k))
    return { hasCustom, hasSb, any: hasCustom || hasSb }
  }

  async function waitSessionHydration(s, timeoutMs){
    const start = Date.now()
    while(Date.now() - start < timeoutMs){
      const { data: sess } = await s.auth.getSession()
      const session = sess && sess.session ? sess.session : null
      if(session) return session
      const stored = hasStoredAuth()
      if(debug && stored.any) console.log('[CD] waiting session hydration, storage present')
      await new Promise(r=>setTimeout(r, 120))
    }
    return null
  }

  function labelForPlan(plan){
    const p = String(plan || '').trim().toLowerCase()
    if(p === 'usuario' || p === 'user' || p === 'pro' || p === 'ultimate') return 'Usuario'
    if(p === 'empresa' || p === 'company' || p === 'business') return 'Empresa'
    return plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Plan'
  }

  function showPayState(t){
    const payState = document.getElementById('pay-state')
    if(payState){
      payState.hidden = false
      payState.textContent = t
      return
    }
    if(window.CD_TOAST){
      window.CD_TOAST.show(t)
      return
    }
    alert(t)
  }

  function render(){
    if(!window.CD_CART) return
    const items = window.CD_CART.getCart()
    const wrap = document.getElementById('cart-items')
    const empty = document.getElementById('empty')
    const sumCount = document.getElementById('sum-count')
    const sumTotal = document.getElementById('sum-total')
    const summaryPanel = document.querySelector('.cart-summary')
    const clearBtn = document.getElementById('clear')
    const checkoutBtn = document.getElementById('checkout')
    if(!wrap || !empty) return

    wrap.innerHTML = ''
    if(items.length === 0){
      empty.hidden = false
      wrap.style.display = 'none'
      if(summaryPanel) summaryPanel.style.display = 'none'
      if(clearBtn) clearBtn.disabled = true
      if(checkoutBtn) checkoutBtn.disabled = true
    } else {
      empty.hidden = true
      wrap.style.display = 'block'
      if(summaryPanel) summaryPanel.style.display = 'block'
      if(clearBtn) clearBtn.disabled = false
      if(checkoutBtn) checkoutBtn.disabled = false
    }

    let total = 0
    let count = 0
    items.forEach((it)=>{
      const price = Number(it.price) || 0
      const qty = Number(it.qty) || 1
      total += price * qty
      count += qty
      const row = document.createElement('div')
      row.className = 'cart-item'
      row.innerHTML = `
      <div class="cart-item-title">${labelForPlan(it.plan)}</div>
      <div class="cart-item-price">${window.CD_CART.formatEUR(price)}</div>
      <div class="cart-item-actions">
        <button class="qty" data-id="${it.id}" data-op="-">−</button>
        <span>${qty}</span>
        <button class="qty" data-id="${it.id}" data-op="+">+</button>
      </div>
      <button class="remove" data-id="${it.id}">Eliminar</button>
    `
      wrap.appendChild(row)
    })

    if(sumCount) sumCount.textContent = String(count)
    if(sumTotal) sumTotal.textContent = window.CD_CART.formatEUR(total)

    wrap.querySelectorAll('.qty').forEach((btn)=>{
      btn.onclick = (e) => {
        e.stopPropagation()
        const id = btn.dataset.id
        const op = btn.dataset.op
        const currentItems = window.CD_CART.getCart()
        const it = currentItems.find((x)=>x.id===id)
        if(!it) return
        const currentQty = Number(it.qty) || 1
        const next = op === '+' ? currentQty + 1 : currentQty - 1
        window.CD_CART.updateQty(id, next)
      }
    })

    wrap.querySelectorAll('.remove').forEach((btn)=>{
      btn.onclick = (e) => {
        e.stopPropagation()
        window.CD_CART.removeItem(btn.dataset.id)
      }
    })
  }

  async function onCheckout(){
    if(!window.CD_CART) return
    const checkoutBtn = document.getElementById('checkout')
    const items = window.CD_CART.getCart()
    if(items.length === 0) return

    const lines = items.map((i)=>`${i.plan} x${i.qty} — ${window.CD_CART.formatEUR((Number(i.price)||0)*(Number(i.qty)||1))}`)
    const total = items.reduce((a,i)=>a+(Number(i.price)||0)*(Number(i.qty)||1),0)

    let s = supa()
    if(!s) s = await waitDb(2000)
    if(!s){
      location.href = 'registro.html?next=comprar.html'
      return
    }
    if(location.protocol !== 'http:' && location.protocol !== 'https:'){
      showPayState('Para pagar con Stripe abre la web desde un dominio (https) o en localhost (http).')
      return
    }

    try{
      if(debug) console.log('[CD] comprar localStorage auth', hasStoredAuth())
      if(debug) console.log('CHECK STORAGE:', localStorage)
      console.log('===== DEBUG SESSION START =====')
      console.log('LOCALSTORAGE FULL:', localStorage)
      const hasCustom = !!localStorage.getItem('cd-auth')
      const hasSb = Object.keys(localStorage).some(k =>
        k.startsWith('sb-') && k.endsWith('-auth-token') && !!localStorage.getItem(k)
      )
      console.log('HAS cd-auth:', hasCustom)
      console.log('HAS sb token:', hasSb)
      const hydrated = await waitSessionHydration(s, 3000)
      console.log('HYDRATED SESSION:', hydrated)
      const { data: rawSess } = await s.auth.getSession()
      console.log('RAW getSession:', rawSess?.session || null)
      if(debug) console.log('SESSION:', hydrated)
      if(!hydrated){
        location.href = 'registro.html?next=comprar.html'
        return
      }

      let session = hydrated

      const payloadItems = items.map((i)=>{
        const p = String(i.plan || '').trim().toLowerCase()
        const mapped = (p === 'pro' || p === 'ultimate' || p === 'usuario' || p === 'user')
          ? 'usuario'
          : (p === 'business' || p === 'empresa' || p === 'company')
            ? 'empresa'
            : p
        return { plan: mapped, qty: Number(i.qty) || 1 }
      })
      const siteUrl = String(window.CD_SITE_URL || '').trim() || new URL('.', location.href).toString().replace(/\/$/, '')
      if(debug) console.log('[CD] checkout session', { user: session.user && session.user.id, items: payloadItems, siteUrl })

      const { data: sess } = await s.auth.getSession()
      const token = sess?.session?.access_token
      if(checkoutBtn) checkoutBtn.disabled = true
      const { data, error } = await s.functions.invoke('create-checkout-session', {
        body: { items: payloadItems, site_url: siteUrl },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if(checkoutBtn) checkoutBtn.disabled = false

      if(error){
        const ctx = error.context || {}
        const body = ctx.body || {}
        const status = ctx.status || ''
        if(debug) console.warn('[CD] checkout error', { status, message: error.message, body, ctx })
        let detail = String(error.message || body.message || body.error || 'No se pudo iniciar el pago')
        if(body && body.missing) detail = `${detail} (${body.missing.join(', ')})`
        if(status) detail = `${status}: ${detail}`
        const low = detail.toLowerCase()
        if(low.includes('invalid jwt') || low.includes('jwt') || String(status) === '401'){
          await s.auth.signOut()
          showPayState('Tu sesión no es válida. Inicia sesión de nuevo para continuar.')
          location.href = 'registro.html?next=comprar.html'
          return
        }
        showPayState(detail)
        return
      }

      if(!data || !data.url){
        showPayState('No se pudo iniciar el pago. Revisa la configuración de Stripe/Supabase.')
        return
      }
      location.href = data.url
    }catch(e){
      if(checkoutBtn) checkoutBtn.disabled = false
      if(debug) console.error('[CD] checkout unexpected error', e)
      showPayState('Error inesperado al iniciar el pago. Inténtalo de nuevo.')
      const subject = 'Pedido carrito — COREDEFENSE'
      const body = `Carrito:\n${lines.join('\n')}\n\nTotal mensual: ${window.CD_CART.formatEUR(total)}\n\nIndica datos de facturación y entorno objetivo.`
      location.href = `mailto:supportcoredefense@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }
  }

  function setup(){
    const clearBtn = document.getElementById('clear')
    const checkoutBtn = document.getElementById('checkout')
    if(clearBtn){
      clearBtn.onclick = () => {
        if(window.CD_CART) window.CD_CART.clearCart()
      }
    }
    if(checkoutBtn){
      checkoutBtn.onclick = async () => { await onCheckout() }
    }
  }

  function applyPlanFromQuery(){
    if(!window.CD_CART) return
    const qs = new URLSearchParams(location.search)
    const qp = String(qs.get('plan') || '').trim().toLowerCase()
    if(!qp) return
    const normalized = (qp === 'pro' || qp === 'ultimate' || qp === 'usuario' || qp === 'user')
      ? 'usuario'
      : (qp === 'business' || qp === 'empresa' || qp === 'company')
        ? 'empresa'
        : ''
    if(!normalized) return
    const prices = { usuario: 149, empresa: 399 }
    window.CD_CART.addItem(normalized, prices[normalized])
    qs.delete('plan')
    const nextUrl = `${location.pathname}${qs.toString() ? `?${qs.toString()}` : ''}${location.hash || ''}`
    history.replaceState({}, '', nextUrl)
  }

  document.addEventListener('DOMContentLoaded', () => {
    setup()
    applyPlanFromQuery()
    render()
    window.addEventListener('cd:cart:change', render)
  })
})()
