(() => {
  if (window.CD_SCROLL_INIT === true) return
  window.CD_SCROLL_INIT = true
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    if (a.dataset.cdScrollBound === '1') return
    a.dataset.cdScrollBound = '1'
    a.addEventListener('click', (ev) => {
      const href = a.getAttribute('href') || ''
      const id = href.slice(1)
      const target = document.getElementById(id)
      if (target) {
        ev.preventDefault()
        target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' })
      }
    })
  })
})()
