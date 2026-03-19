(function(){
  const KEY = 'cd.cookies'
  function get(){ return localStorage.getItem(KEY) || '' }
  function set(v){ localStorage.setItem(KEY, v) }
  function remove(){ localStorage.removeItem(KEY) }

  function hide(){
    const el = document.getElementById('cd-cookies')
    if(el) el.remove()
  }

  function accept(){ set('accepted'); hide() }
  function reject(){ set('rejected'); hide() }
  function reset(){ remove(); hide(); show() }

  function show(){
    if(get()) return
    if(location.protocol !== 'http:' && location.protocol !== 'https:') return
    if(document.getElementById('cd-cookies')) return

    const wrap = document.createElement('div')
    wrap.id = 'cd-cookies'
    wrap.className = 'cookie-banner'
    wrap.innerHTML = `
      <div class="cookie-card">
        <div class="cookie-title">Cookies</div>
        <div class="cookie-text">
          Usamos almacenamiento local y tecnologías similares para el funcionamiento básico (carrito y sesión).
          Puedes leer más en <a class="cookie-link" href="cookies.html">Cookies</a> y <a class="cookie-link" href="privacidad.html">Privacidad</a>.
        </div>
        <div class="cookie-actions">
          <button class="btn btn-outline" type="button" data-cookie="reject">Rechazar</button>
          <button class="btn btn-primary" type="button" data-cookie="accept">Aceptar</button>
        </div>
      </div>
    `
    document.body.appendChild(wrap)

    wrap.querySelectorAll('[data-cookie]').forEach((b)=>{
      b.addEventListener('click', ()=>{
        const v = b.getAttribute('data-cookie')
        if(v === 'accept') accept()
        if(v === 'reject') reject()
      })
    })
  }

  window.CD_COOKIES = { get, accept, reject, reset }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show)
  else show()
})()
