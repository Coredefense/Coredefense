let toastEl
function ensure(){
  if(!toastEl){
    toastEl = document.createElement('div')
    toastEl.className = 'toast'
    document.body.appendChild(toastEl)
  }
}
function show(msg){
  ensure()
  toastEl.textContent = msg
  toastEl.classList.add('show')
  setTimeout(()=>{ toastEl.classList.remove('show') }, 1400)
}
window.CD_TOAST = { show }