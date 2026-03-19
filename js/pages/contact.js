const cf = document.getElementById('contactForm')
if (cf) {
  const ts = document.getElementById('contact_ts')
  if (ts) ts.value = String(Date.now())
  const statusEl = document.getElementById('contactStatus')
  const setStatus = (text, ok) => {
    if (!statusEl) return
    statusEl.hidden = false
    statusEl.textContent = text
    statusEl.style.color = ok ? '#74f0c1' : '#ff9aa6'
  }
  cf.addEventListener('submit', (ev) => {
    ev.preventDefault()
    const fd = new FormData(cf)
    const nombre = String(fd.get('nombre') || '').trim()
    const email = String(fd.get('email') || '').trim()
    const telefono = String(fd.get('telefono') || '').trim()
    const asunto = String(fd.get('asunto') || '').trim()
    const mensaje = String(fd.get('mensaje') || '').trim()
    const honey = String(fd.get('website') || '').trim()
    const tsv = Number(fd.get('contact_ts') || 0)
    const elapsed = tsv ? Date.now() - tsv : 0
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const phoneOk = !telefono || /^[0-9+\s()-]{6,20}$/.test(telefono)
    if (honey) { setStatus('No se pudo enviar el mensaje.', false); return }
    if (elapsed > 0 && elapsed < 1200) { setStatus('Espera un momento antes de enviar.', false); return }
    if (!nombre || !email || !asunto || !mensaje) { setStatus('Completa todos los campos obligatorios.', false); return }
    if (!emailOk) { setStatus('Introduce un email válido.', false); return }
    if (!phoneOk) { setStatus('Introduce un teléfono válido o déjalo vacío.', false); return }
    setStatus('Enviando mensaje...', true)
    const payload = new FormData()
    payload.append('nombre', nombre)
    payload.append('email', email)
    payload.append('telefono', telefono || 'No indicado')
    payload.append('asunto', asunto)
    payload.append('mensaje', mensaje)
    payload.append('_subject', 'Nuevo mensaje desde el formulario')
    payload.append('_captcha', 'false')
    fetch('https://formsubmit.co/ajax/supportcoredefense@gmail.com', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: payload
    }).then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json().catch(() => ({}))
      if (data && data.success === 'true') {
        cf.reset()
        if (ts) ts.value = String(Date.now())
        setStatus('Mensaje enviado correctamente.', true)
        return
      }
      throw new Error('submit_failed')
    }).catch(() => {
      setStatus('No se pudo enviar ahora. Escríbenos a supportcoredefense@gmail.com.', false)
    })
  })
}
