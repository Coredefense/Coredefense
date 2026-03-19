const registerForm = document.getElementById('registerForm')
const loginForm = document.getElementById('loginForm')
const ok = document.getElementById('registerOk')
const loginOk = document.getElementById('loginOk')
const params = new URLSearchParams(location.search)
const next = params.get('next') || 'index.html'
function msg(t){
  if(window.CD_TOAST) window.CD_TOAST.show(t)
  else alert(t)
}
function explainAuthError(e){
  const m = String((e && e.message) || '').toLowerCase()
  if(m.includes('email not confirmed') || m.includes('not confirmed')){
    return 'Tu correo no está confirmado. Revisa tu email y confirma la cuenta antes de iniciar sesión.'
  }
  if(m.includes('invalid login credentials') || m.includes('invalid email or password') || m.includes('invalid credentials')){
    return 'Credenciales incorrectas. Revisa el correo y la contraseña.'
  }
  if(m.includes('too many requests')){
    return 'Demasiados intentos. Espera un momento y prueba de nuevo.'
  }
  return 'No se pudo iniciar sesión. Revisa los datos e inténtalo de nuevo.'
}
function supa(){
  return window.CD_DB && window.CD_DB.client ? window.CD_DB.client : null
}
const tabButtons = Array.from(document.querySelectorAll('[data-auth-tab]'))
const panels = Array.from(document.querySelectorAll('[data-auth-panel]'))
function selectTab(id){
  tabButtons.forEach((b)=>{
    const on = b.getAttribute('data-auth-tab') === id
    b.classList.toggle('is-active', on)
    b.setAttribute('aria-selected', on ? 'true' : 'false')
  })
  panels.forEach((p)=>{
    p.hidden = p.getAttribute('data-auth-panel') !== id
  })
}
tabButtons.forEach((b)=>{
  b.addEventListener('click', ()=> selectTab(String(b.getAttribute('data-auth-tab') || 'login')))
})
selectTab(params.get('mode') === 'register' ? 'register' : 'login')
if(registerForm){
  registerForm.addEventListener('submit', async (ev)=>{
    ev.preventDefault()
    const s = supa()
    if(!s){ msg('Configura la base de datos para habilitar registro'); return }
    const fd = new FormData(registerForm)
    const nombre = String(fd.get('nombre')||'').trim()
    const empresa = String(fd.get('empresa')||'').trim()
    const email = String(fd.get('email')||'').trim()
    const pass = String(fd.get('pass')||'')
    const pass2 = String(fd.get('pass2')||'')
    const validEmail = /.+@.+\..+/.test(email)
    if(!validEmail){ msg('Introduce un correo válido'); return }
    if(pass.length<8){ msg('La contraseña debe tener al menos 8 caracteres'); return }
    if(pass!==pass2){ msg('Las contraseñas no coinciden'); return }
    const { data, error } = await s.auth.signUp({ email, password: pass, options: { data: { nombre, empresa } } })
    if(error){ msg(error.message || 'No se pudo registrar'); return }
    const needsConfirm = !(data && data.session)
    if(ok){
      ok.hidden = false
      ok.textContent = needsConfirm
        ? 'Cuenta creada. Revisa tu correo para confirmar el acceso y luego inicia sesión.'
        : 'Cuenta creada. Ya puedes continuar.'
    }
    registerForm.reset()
    msg('Cuenta creada')
    if(data && data.session){
      location.href = next
      return
    }
    selectTab('login')
  })
}
if(loginForm){
  loginForm.addEventListener('submit', async (ev)=>{
    ev.preventDefault()
    const s = supa()
    if(!s){ msg('Configura la base de datos para habilitar login'); return }
    const fd = new FormData(loginForm)
    const email = String(fd.get('email')||'').trim()
    const pass = String(fd.get('pass')||'')
    const { error } = await s.auth.signInWithPassword({ email, password: pass })
    if(error){ msg(explainAuthError(error)); return }
    msg('Sesión iniciada')
    if(loginOk){
      loginOk.hidden = false
      loginOk.textContent = 'Sesión iniciada. Redirigiendo...'
    }
    location.href = next
  })
}
