const links = Array.from(document.querySelectorAll('.privacy-side-item[data-target]'))
const sections = Array.from(document.querySelectorAll('.privacy-block[data-section]'))

function setActive(id){
  links.forEach(a=>a.classList.toggle('is-active', a.dataset.target === id))
}

links.forEach(a=>{
  a.addEventListener('click', (e)=>{
    const id = String(a.dataset.target || '')
    const el = document.getElementById(id)
    if(!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
    setActive(id)
  })
})

if(sections.length){
  const io = new IntersectionObserver((entries)=>{
    const visible = entries
      .filter(x=>x.isIntersecting)
      .sort((a,b)=>(b.intersectionRatio||0)-(a.intersectionRatio||0))[0]
    if(visible){
      const id = String(visible.target.getAttribute('data-section') || '')
      if(id) setActive(id)
    }
  }, { rootMargin: '-20% 0px -70% 0px', threshold: [0.05, 0.15, 0.25] })
  sections.forEach(s=>io.observe(s))
}

const initial = location.hash ? location.hash.slice(1) : 'info'
setActive(initial)
