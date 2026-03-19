function render(){
  // Verificar que la API del carrito existe
  if(!window.CD_CART) return

  function labelForPlan(plan){
    const p = String(plan || '').trim().toLowerCase()
    if(p === 'usuario' || p === 'user' || p === 'pro' || p === 'ultimate') return 'Usuario'
    if(p === 'empresa' || p === 'company' || p === 'business') return 'Empresa'
    return plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Plan'
  }

  const items = window.CD_CART.getCart()
  const wrap = document.getElementById('cart-items')
  const empty = document.getElementById('empty')
  const sumCount = document.getElementById('sum-count')
  const sumTotal = document.getElementById('sum-total')
  const summaryPanel = document.querySelector('.cart-summary')
  const clearBtn = document.getElementById('clear')
  const checkoutBtn = document.getElementById('checkout')
  
  // Si no estamos en la página del carrito (elementos no encontrados), salir
  if(!wrap || !empty) return

  wrap.innerHTML = ''
  
  if(items.length===0){ 
    empty.hidden = false 
    // Asegurar que el contenedor de items está vacío visualmente
    wrap.style.display = 'none'
    // Ocultar resumen si está vacío
    if(summaryPanel) summaryPanel.style.display = 'none'
    
    // Deshabilitar botones de acción si está vacío (aunque estén ocultos)
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
  
  items.forEach(it=>{
    const price = Number(it.price)||0
    const qty = Number(it.qty)||1
    total += price * qty
    count += qty
    
    const row = document.createElement('div')
    row.className = 'cart-item'
    const planName = labelForPlan(it.plan)
    
    row.innerHTML = `
      <div class="cart-item-title">${planName}</div>
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
  
  // Reasignar eventos a botones dinámicos
  wrap.querySelectorAll('.qty').forEach(btn=>{
    btn.onclick = (e) => {
      e.stopPropagation()
      const id = btn.dataset.id
      const op = btn.dataset.op
      const currentItems = window.CD_CART.getCart()
      const it = currentItems.find(x=>x.id===id)
      if(!it) return
      
      const currentQty = Number(it.qty)||1
      const next = op==='+' ? currentQty+1 : currentQty-1
      
      window.CD_CART.updateQty(id, next)
      // El render se llamará automáticamente por el evento cd:cart:change
    }
  })
  
  wrap.querySelectorAll('.remove').forEach(btn=>{
    btn.onclick = (e) => { 
      e.stopPropagation()
      window.CD_CART.removeItem(btn.dataset.id) 
    }
  })
}

// Configurar botones estáticos una sola vez
function setupStaticButtons(){
  const clearBtn = document.getElementById('clear')
  const checkoutBtn = document.getElementById('checkout')
  const payState = document.getElementById('pay-state')
  const debug = (new URLSearchParams(location.search).get('debug') === '1') || (localStorage.getItem('cd.debug') === '1')
  function showPayState(t){
    if(payState){
      payState.hidden = false
      payState.textContent = t
    } else if(window.CD_TOAST){
      window.CD_TOAST.show(t)
    } else {
      alert(t)
    }
  }
  
  if(clearBtn){
    clearBtn.onclick = () => {
      window.CD_CART.clearCart()
      // Render se llama por evento
    }
  }
  
  if(checkoutBtn){
    checkoutBtn.onclick = async () => {
      const items = window.CD_CART.getCart()
      if(items.length===0) return
      
      const lines = items.map(i=>`${i.plan} x${i.qty} — ${window.CD_CART.formatEUR((Number(i.price)||0)*(Number(i.qty)||1))}`)
      const total = items.reduce((a,i)=>a+(Number(i.price)||0)*(Number(i.qty)||1),0)
      
      const s = window.CD_DB && window.CD_DB.client ? window.CD_DB.client : null
      if(s){
        if(location.protocol !== 'http:' && location.protocol !== 'https:'){
          showPayState('Para pagar con Stripe abre la web desde un dominio (https) o en localhost (http).')
          return
        }
        const { data: sess } = await s.auth.getSession()
        const hasSession = !!(sess && sess.session)
        if(!hasSession){
          location.href = `registro.html?next=${encodeURIComponent('comprar.html')}`
          return
        }
        const { data: refreshed, error: refreshError } = await s.auth.refreshSession()
        if(refreshError){
          showPayState('Tu sesión no es válida. Inicia sesión de nuevo para continuar.')
          location.href = `registro.html?next=${encodeURIComponent('comprar.html')}`
          return
        }
        const session = refreshed && refreshed.session ? refreshed.session : (sess && sess.session ? sess.session : null)
        if(!session){
          location.href = `registro.html?next=${encodeURIComponent('comprar.html')}`
          return
        }
        const payloadItems = items.map(i=>{
          const p = String(i.plan||'').trim().toLowerCase()
          const mapped = (p === 'pro' || p === 'ultimate' || p === 'usuario' || p === 'user') ? 'usuario'
            : (p === 'business' || p === 'empresa' || p === 'company') ? 'empresa'
            : p
          return { plan: mapped, qty: Number(i.qty)||1 }
        })
        checkoutBtn.disabled = true
        const siteUrl = String(window.CD_SITE_URL || '').trim() || new URL('.', location.href).toString().replace(/\/$/, '')
        if(debug) console.log('[CD] checkout session', { user: session.user && session.user.id, items: payloadItems, siteUrl })
        const { data, error } = await s.functions.invoke('create-checkout-session', {
          body: { items: payloadItems, site_url: siteUrl }
        })
        checkoutBtn.disabled = false
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
            location.href = `registro.html?next=${encodeURIComponent('comprar.html')}`
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
        return
      }
      showPayState('Para pagar con Stripe falta configurar Supabase en js/config.js.')
      const subject = `Pedido carrito — COREDEFENSE`
      const body = `Carrito:\n${lines.join('\n')}\n\nTotal mensual: ${window.CD_CART.formatEUR(total)}\n\nIndica datos de facturación y entorno objetivo.`
      location.href = `mailto:support@coredefense.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }
  }
}

document.addEventListener('DOMContentLoaded', () => { 
  setupStaticButtons()
  const qs = new URLSearchParams(location.search)
  const qp = String(qs.get('plan') || '').trim().toLowerCase()
  if(qp && window.CD_CART){
    const normalized = (qp === 'pro' || qp === 'ultimate' || qp === 'usuario' || qp === 'user') ? 'usuario'
      : (qp === 'business' || qp === 'empresa' || qp === 'company') ? 'empresa'
      : ''
    if(normalized){
      const prices = { usuario: 149, empresa: 399 }
      window.CD_CART.addItem(normalized, prices[normalized])
      qs.delete('plan')
      const nextUrl = `${location.pathname}${qs.toString() ? `?${qs.toString()}` : ''}${location.hash || ''}`
      history.replaceState({}, '', nextUrl)
    }
  }
  render()
  // Escuchar evento global de cambio
  window.addEventListener('cd:cart:change', render) 
})
