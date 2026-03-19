(async function(){
  if(!window.CD_DB_READY){
    window.CD_DB_READY = {}
    window.CD_DB_READY.promise = new Promise((resolve)=>{ window.CD_DB_READY.resolve = resolve })
  }
  function resolveDbReadyOnce(value){
    if(window.CD_DB_READY && window.CD_DB_READY.resolve){
      window.CD_DB_READY.resolve(value)
      window.CD_DB_READY.resolve = null
    }
  }
  const url = String(window.CD_SUPABASE_URL || '').trim()
  const key = String(window.CD_SUPABASE_ANON_KEY || '').trim()
  if(!url || !key){
    resolveDbReadyOnce(null)
    return
  }
  if(window.CD_DB_INIT === true && window.CD_DB && window.CD_DB.client) return
  if(window.CD_DB && window.CD_DB.client){
    resolveDbReadyOnce(window.CD_DB.client)
    return
  }
  window.CD_DB_INIT = true

  const debug = (new URLSearchParams(location.search).get('debug') === '1') || (localStorage.getItem('cd.debug') === '1')
  const siteUrl = String(window.CD_SITE_URL || '').trim() || new URL('.', location.href).toString().replace(/\/$/, '')
  window.CD_SITE_URL = siteUrl

  const storageKey = 'cd-auth'
  let defaultStorageKey = ''
  try{
    const projectRef = new URL(url).hostname.split('.')[0]
    if(projectRef) defaultStorageKey = `sb-${projectRef}-auth-token`
  }catch(_e){}
  try{
    if(defaultStorageKey){
      const cur = localStorage.getItem(storageKey)
      const def = localStorage.getItem(defaultStorageKey)
      if(!cur && def) localStorage.setItem(storageKey, def)
      if(cur && !def) localStorage.setItem(defaultStorageKey, cur)
    }
  }catch(_e){}

  let createClient = null
  if(window.supabase && typeof window.supabase.createClient === 'function'){
    createClient = window.supabase.createClient.bind(window.supabase)
  } else {
    try{
      const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
      createClient = mod && typeof mod.createClient === 'function' ? mod.createClient : null
    }catch(_e){
      window.CD_DB_INIT = false
      resolveDbReadyOnce(null)
      return
    }
  }
  if(!createClient){
    window.CD_DB_INIT = false
    resolveDbReadyOnce(null)
    return
  }
  try{
    if(!key.includes('.')){
      if(debug) console.warn('[CD] Supabase anon key no parece válida (debería ser JWT)')
    }
    const client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: false,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey,
        storage: window.localStorage
      },
      global: {
        headers: { 'x-client-info': 'coredefense-web' }
      }
    })
    window.CD_DB = { client }
    resolveDbReadyOnce(client)
    window.dispatchEvent(new CustomEvent('cd:db:ready'))

    try{
      const { data: sess } = await client.auth.getSession()
      const session = sess && sess.session ? sess.session : null
      if(debug) console.log('[CD] session inicial', session)
      if(debug) console.log('[CD] localStorage auth', {
        storageKey,
        hasCustom: !!localStorage.getItem(storageKey),
        defaultStorageKey,
        hasDefault: defaultStorageKey ? !!localStorage.getItem(defaultStorageKey) : false
      })
      client.auth.onAuthStateChange((event, session2) => {
        try{
          if(defaultStorageKey){
            const cur = localStorage.getItem(storageKey)
            if(cur) localStorage.setItem(defaultStorageKey, cur)
          }
        }catch(_e){}
        if(debug) console.log('[CD] auth event', event, session2 ? session2.user.id : null)
        window.dispatchEvent(new CustomEvent('cd:auth:change', { detail: { event } }))
      })
    }catch(e){
      if(debug) console.warn('[CD] supabase init validate error', e)
    }
  }catch(_e){
    window.CD_DB_INIT = false
    resolveDbReadyOnce(null)
  }
})()
