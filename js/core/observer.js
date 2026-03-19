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