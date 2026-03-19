document.querySelectorAll('[data-cookie-action]').forEach((b)=>{
  b.addEventListener('click', ()=>{
    if(!window.CD_COOKIES) return
    const a = b.getAttribute('data-cookie-action')
    if(a === 'accept') window.CD_COOKIES.accept()
    if(a === 'reject') window.CD_COOKIES.reject()
    if(a === 'reset') window.CD_COOKIES.reset()
  })
})
