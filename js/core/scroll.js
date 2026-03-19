const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
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