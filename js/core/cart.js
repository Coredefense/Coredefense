const CART_KEY = 'cd.cart'

const PLAN_PRICES = { usuario: 149, empresa: 399 }

function getCart(){
  try{
    const data = localStorage.getItem(CART_KEY)
    let items = data ? JSON.parse(data) : []
    
    // Validación y purga de items corruptos
    if(!Array.isArray(items)){
      items = []
    } else {
      const validItems = items.filter(i => i && i.id && typeof i.qty === 'number' && i.qty > 0 && i.price >= 0)
      if(validItems.length !== items.length){
        console.warn('Cart items purged due to corruption')
        items = validItems
        setCart(items) // Guardar versión limpia
      }
    }
    items = items.map(i=>{
      if(!i) return i
      const plan = normalizePlanName(i.plan || i.id || '')
      if(plan !== i.plan){
        return { ...i, plan, id: `plan:${plan}` }
      }
      return i
    })

    const merged = []
    const seen = {}
    items.forEach(i=>{
      if(!i) return
      const plan = normalizePlanName(i.plan || '')
      if(plan !== 'usuario' && plan !== 'empresa') return
      const id = `plan:${plan}`
      const qty = Math.max(1, Math.min(99, Number(i.qty) || 1))
      const price = PLAN_PRICES[plan]
      if(seen[id]){
        seen[id].qty = Math.min(99, (Number(seen[id].qty) || 1) + qty)
      } else {
        const it = { id, plan, price, qty }
        seen[id] = it
        merged.push(it)
      }
    })
    if(JSON.stringify(merged) !== JSON.stringify(items)){
      setCart(merged)
      return merged
    }
    return items
  }catch(e){
    console.error('Error reading cart:', e)
    return []
  }
}

function setCart(items){
  try{
    localStorage.setItem(CART_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent('cd:cart:change'))
  }catch(e){
    console.error('Error saving cart:', e)
  }
}

function count(){
  return getCart().reduce((a,i)=>a + (Number(i.qty)||1), 0)
}

function normalizePlanName(plan){
  const p = String(plan || '').trim().toLowerCase()
  if(p === 'usuario' || p === 'user') return 'usuario'
  if(p === 'empresa' || p === 'company') return 'empresa'
  if(p === 'pro') return 'usuario'
  if(p === 'ultimate') return 'usuario'
  if(p === 'business') return 'empresa'
  return p
}

function addItem(plan, price){
  if(!plan) return
  plan = normalizePlanName(plan)
  const id = `plan:${plan}`
  const items = getCart()
  const found = items.find(i=>i.id===id)
  
  if(found){
    found.qty = Math.min(99, (Number(found.qty)||1) + 1)
  } else {
    items.push({ 
      id, 
      plan, 
      price: Number(price)||0, 
      qty: 1 
    })
  }
  setCart(items)
}

function removeItem(id){
  const items = getCart().filter(i=>i.id!==id)
  setCart(items)
}

function updateQty(id, qty){
  const items = getCart()
  const it = items.find(i=>i.id===id)
  if(it){
    it.qty = Math.max(1, Math.min(99, Number(qty)))
    setCart(items)
  }
}

function clearCart(){
  setCart([])
}

function formatEUR(n){
  return `€${Number(n||0).toLocaleString('es-ES', {minimumFractionDigits: 0})}`
}

function attachHeaderBadge(){
  const el = document.getElementById('cart-count')
  if(el){
    const c = count()
    el.textContent = String(c)
    // Ocultar badge si es 0, opcional
    el.style.display = c > 0 ? 'grid' : 'none'
  }
}

// Inicialización y eventos
if(typeof window !== 'undefined'){
  // Escuchar cambios en otras pestañas
  window.addEventListener('storage', (e)=>{
    if(e.key === CART_KEY){
      attachHeaderBadge()
      // Si estamos en la página del carrito, recargar render
      if(window.location.pathname.includes('comprar.html') || window.location.pathname.includes('cart.html')){
         if(typeof render === 'function') render()
      }
    }
  })

  // Escuchar cambios locales
  window.addEventListener('cd:cart:change', attachHeaderBadge)
  
  // Exponer API global
  window.CD_CART = {
    getCart, setCart, count, addItem, removeItem, updateQty, clearCart, formatEUR, attachHeaderBadge
  }
  
  // Inicializar badge al cargar
  document.addEventListener('DOMContentLoaded', attachHeaderBadge)
}
