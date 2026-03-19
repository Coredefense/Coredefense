const ps = new URLSearchParams(location.search)
const el = document.getElementById('pay-state')
if(el){
  if(ps.get('success') === '1'){
    el.hidden = false
    el.textContent = 'Pago completado. Gracias. Tu pedido se está procesando.'
    if(window.CD_CART) window.CD_CART.clearCart()
    if(window.CD_TOAST) window.CD_TOAST.show('Pago completado')
  }
  if(ps.get('canceled') === '1'){
    el.hidden = false
    el.textContent = 'Pago cancelado. Puedes intentarlo de nuevo cuando quieras.'
    if(window.CD_TOAST) window.CD_TOAST.show('Pago cancelado')
  }
}
