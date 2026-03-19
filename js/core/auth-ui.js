(function(){
  const STATE_KEY = 'cd.auth.ui'
  function getClient(){ return window.CD_DB && window.CD_DB.client ? window.CD_DB.client : null }

  function nameFromUser(user){
    const m = user && user.user_metadata ? user.user_metadata : null
    const n = String((m && (m.nombre || m.name)) || '').trim()
    if(n) return n
    const email = String(user && user.email ? user.email : '').trim()
    if(email && email.includes('@')) return email.split('@')[0]
    return 'Cuenta'
  }

  function build(){
    const headerInner = document.querySelector('.header-inner')
    if(!headerInner) return null

    let nav = headerInner.querySelector('.nav')
    let actions = headerInner.querySelector('.header-actions')
    if(!actions){
      actions = document.createElement('div')
      actions.className = 'header-actions'
      if(nav){
        nav.insertAdjacentElement('beforebegin', actions)
        actions.appendChild(nav)
      } else {
        headerInner.appendChild(actions)
      }
    }

    let root = document.getElementById('cd-account')
    if(!root){
      root = document.createElement('div')
      root.id = 'cd-account'
      root.className = 'account'
      actions.appendChild(root)
    }
    return root
  }

  function renderLoggedOut(root){
    root.innerHTML = `
      <a class="btn btn-outline account-login" href="registro.html?next=${encodeURIComponent(location.pathname.split('/').pop() + location.search + location.hash)}">Iniciar sesión</a>
    `
  }

  function renderLoggedIn(root, user){
    const name = nameFromUser(user)
    root.innerHTML = `
      <button class="account-btn" type="button" aria-haspopup="menu" aria-expanded="false">
        <span class="account-avatar" aria-hidden="true"></span>
        <span class="account-name"></span>
        <span class="account-caret" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </button>
      <div class="account-menu" role="menu" hidden>
        <a class="account-item" role="menuitem" href="registro.html">Mi cuenta</a>
        <button class="account-item" role="menuitem" type="button" data-action="logout">Cerrar sesión</button>
      </div>
    `
    const btn = root.querySelector('.account-btn')
    const menu = root.querySelector('.account-menu')
    const nameEl = root.querySelector('.account-name')
    if(nameEl) nameEl.textContent = name

    function close(){
      if(!menu || !btn) return
      menu.hidden = true
      btn.setAttribute('aria-expanded', 'false')
      try{ sessionStorage.setItem(STATE_KEY, 'closed') }catch(_e){}
    }
    function open(){
      if(!menu || !btn) return
      menu.hidden = false
      btn.setAttribute('aria-expanded', 'true')
      try{ sessionStorage.setItem(STATE_KEY, 'open') }catch(_e){}
    }
    function toggle(){
      if(!menu || !btn) return
      if(menu.hidden) open()
      else close()
    }

    btn && btn.addEventListener('click', (e)=>{
      e.stopPropagation()
      toggle()
    })
    document.addEventListener('click', close)
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape') close()
    })
    root.querySelectorAll('[data-action="logout"]').forEach((b)=>{
      b.addEventListener('click', async ()=>{
        const s = getClient()
        if(!s) return
        await s.auth.signOut()
        close()
        location.href = 'index.html'
      })
    })

    try{
      const st = sessionStorage.getItem(STATE_KEY) || ''
      if(st === 'open') open()
    }catch(_e){}
  }

  async function refresh(){
    const root = build()
    if(!root) return
    const s = getClient()
    if(!s){ renderLoggedOut(root); return }
    const { data } = await s.auth.getSession()
    const session = data && data.session ? data.session : null
    if(!session){ renderLoggedOut(root); return }
    renderLoggedIn(root, session.user)
  }

  async function start(){
    const root = build()
    if(!root) return
    await refresh()
    const s = getClient()
    if(s && s.auth && typeof s.auth.onAuthStateChange === 'function'){
      s.auth.onAuthStateChange(() => { refresh() })
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
  else start()
  window.addEventListener('cd:db:ready', start)
})()
