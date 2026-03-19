const params = new URLSearchParams(location.search)
const initialParamPlan = (params.get('plan') || '').toLowerCase()
const savedPlan = (localStorage.getItem('cd.plan') || '').toLowerCase()
const planInputs = Array.from(document.querySelectorAll('input[name="plan"]'))
const qtyEl = document.getElementById('qty')
const sumPlan = document.getElementById('sum-plan')
const sumPrice = document.getElementById('sum-price')
const sumTotal = document.getElementById('sum-total')
const plus = document.getElementById('plus')
const minus = document.getElementById('minus')
const checkout = document.getElementById('checkout')
let qty = Math.max(1, parseInt(localStorage.getItem('cd.qty') || '1', 10) || 1)
let current = null
function fmt(n){return `€${n.toLocaleString('es-ES')}`}
function update(){
  const price = current ? Number(current.dataset.price) : 0
  sumPlan.textContent = current ? current.value.charAt(0).toUpperCase()+current.value.slice(1) : '—'
  sumPrice.textContent = fmt(price)
  sumTotal.textContent = fmt(price * qty)
  qtyEl.textContent = qty
  checkout.disabled = !current
}
planInputs.forEach(i=>{
  if(i.value===initialParamPlan || i.value===savedPlan){ i.checked=true; current=i }
  i.addEventListener('change',()=>{ current=i; localStorage.setItem('cd.plan', current.value); update() })
})
if(!current && planInputs[0]){ planInputs[0].checked=true; current=planInputs[0]; localStorage.setItem('cd.plan', current.value) }
plus.addEventListener('click',()=>{ qty=Math.min(99,qty+1); localStorage.setItem('cd.qty', String(qty)); update() })
minus.addEventListener('click',()=>{ qty=Math.max(1,qty-1); localStorage.setItem('cd.qty', String(qty)); update() })
checkout.addEventListener('click',()=>{
  const plan = current ? current.value : ''
  const price = current ? Number(current.dataset.price) : 0
  const subject = `Pedido ${plan.toUpperCase()} — COREDEFENSE`
  const body = `Plan: ${plan}\nUnidades: ${qty}\nPrecio mensual: ${fmt(price)}\nTotal: ${fmt(price*qty)}\n\nPor favor, indícanos datos de facturación y entorno objetivo.`
  location.href = `mailto:supportcoredefense@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
})
update()
