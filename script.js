<<<<<<< HEAD
<<<<<<< HEAD
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (!prefersReduced) {
  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in')
        const num = e.target.querySelector && e.target.querySelector('.stat-number')
        if (num && num.dataset && num.dataset.target) {
          const target = parseInt(num.dataset.target, 10) || 0
          const start = 0
          const dur = 1200
          const t0 = performance.now()
          const step = (now) => {
            const p = Math.min(1, (now - t0) / dur)
            const val = Math.floor(start + (target - start) * p)
            num.textContent = val.toLocaleString('es-ES')
            if (p < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
        observer.unobserve(e.target)
      }
    }
  }, { threshold: 0.12 })
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
}
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (ev) => {
    const id = a.getAttribute('href').slice(1)
    const target = document.getElementById(id)
    if (target) {
      ev.preventDefault()
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' })
    }
  })
})
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
    const mailto = `mailto:support@coredefense.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
  })
}
=======
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (!prefersReduced) {
  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in')
        const num = e.target.querySelector && e.target.querySelector('.stat-number')
        if (num && num.dataset && num.dataset.target) {
          const target = parseInt(num.dataset.target, 10) || 0
          const start = 0
          const dur = 1200
          const t0 = performance.now()
          const step = (now) => {
            const p = Math.min(1, (now - t0) / dur)
            const val = Math.floor(start + (target - start) * p)
            num.textContent = val.toLocaleString('es-ES')
            if (p < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
        observer.unobserve(e.target)
      }
    }
  }, { threshold: 0.12 })
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
}
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (ev) => {
    const id = a.getAttribute('href').slice(1)
    const target = document.getElementById(id)
    if (target) {
      ev.preventDefault()
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' })
    }
  })
})
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
    const mailto = `mailto:support@coredefense.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
  })
}
>>>>>>> master
=======
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (!prefersReduced) {
  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in')
        const num = e.target.querySelector && e.target.querySelector('.stat-number')
        if (num && num.dataset && num.dataset.target) {
          const target = parseInt(num.dataset.target, 10) || 0
          const start = 0
          const dur = 1200
          const t0 = performance.now()
          const step = (now) => {
            const p = Math.min(1, (now - t0) / dur)
            const val = Math.floor(start + (target - start) * p)
            num.textContent = val.toLocaleString('es-ES')
            if (p < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
        observer.unobserve(e.target)
      }
    }
  }, { threshold: 0.12 })
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
}
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (ev) => {
    const id = a.getAttribute('href').slice(1)
    const target = document.getElementById(id)
    if (target) {
      ev.preventDefault()
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' })
    }
  })
})
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
    const mailto = `mailto:support@coredefense.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
  })
}
>>>>>>> 1ab5bb8 (fix: supabase jwt + stripe)
