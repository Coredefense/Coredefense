const cf = document.getElementById('contactForm')
if (cf) {
  cf.addEventListener('submit', (ev) => {
    ev.preventDefault()
    const fd = new FormData(cf)
    const nombre = fd.get('nombre') || ''
    const email = fd.get('email') || ''
    const empresa = fd.get('empresa') || ''
    const asunto = fd.get('asunto') || 'Consulta'
    const mensaje = fd.get('mensaje') || ''
    const body = `Nombre: ${nombre}\nCorreo: ${email}\nEmpresa: ${empresa}\n\nMensaje:\n${mensaje}`
    const mailto = `mailto:supportcoredefense.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
  })
}
