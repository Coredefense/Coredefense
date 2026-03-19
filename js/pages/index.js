document.querySelectorAll('.add-to-cart').forEach(btn=>{
  btn.addEventListener('click',(e)=>{
    e.preventDefault()
    e.stopPropagation()
    const plan = btn.dataset.plan
    const price = Number(btn.dataset.price)
    if(window.CD_CART){
      window.CD_CART.addItem(plan, price)
      window.CD_CART.attachHeaderBadge()
      if(window.CD_TOAST){ window.CD_TOAST.show('Añadido al carrito') }
      btn.textContent = 'Añadido ✓'
      setTimeout(()=>{ btn.textContent = 'Añadir al carrito' },1200)
    }
  })
})