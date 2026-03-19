(async function(){
  const url = String(window.CD_SUPABASE_URL || '').trim()
  const key = String(window.CD_SUPABASE_ANON_KEY || '').trim()
  if(!url || !key) return
  if(window.CD_DB && window.CD_DB.client) return

  const debug = (new URLSearchParams(location.search).get('debug') === '1') || (localStorage.getItem('cd.debug') === '1')
  const siteUrl = String(window.CD_SITE_URL || '').trim() || new URL('.', location.href).toString().replace(/\/$/, '')
  window.CD_SITE_URL = siteUrl

  let createClient = null
  if(window.supabase && typeof window.supabase.createClient === 'function'){
    createClient = window.supabase.createClient.bind(window.supabase)
  } else {
    try{
      const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
      createClient = mod && typeof mod.createClient === 'function' ? mod.createClient : null
    }catch(_e){
      return
    }
  }
  if(!createClient) return
  try{
    const client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: 'cd-auth',
        storage: window.localStorage
      },
      global: {
        headers: { 'x-client-info': 'coredefense-web' }
      }
    })
    window.CD_DB = { client }
    window.dispatchEvent(new CustomEvent('cd:db:ready'))

    try{
      const { data: sess } = await client.auth.getSession()
      const session = sess && sess.session ? sess.session : null
      if(debug) console.log('[CD] supabase session', session)
      if(session){
        const { data: userData, error: userErr } = await client.auth.getUser()
        if(userErr){
          if(debug) console.warn('[CD] supabase getUser error', userErr)
          await client.auth.signOut()
        } else if(debug) {
          console.log('[CD] supabase user', userData && userData.user ? userData.user.id : null)
        }
      }
      client.auth.onAuthStateChange((event, session2) => {
        if(debug) console.log('[CD] auth event', event, session2 ? session2.user.id : null)
        window.dispatchEvent(new CustomEvent('cd:auth:change', { detail: { event } }))
      })
    }catch(e){
      if(debug) console.warn('[CD] supabase init validate error', e)
    }
  }catch(_e){}
})()
