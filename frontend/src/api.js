// Minimal API client
function apiFetch(path, token, opts = {}) {
  const base = import.meta.env.VITE_API_BASE || ''
  const headers = opts.headers || {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!headers['Content-Type'] && opts.body) headers['Content-Type'] = 'application/json'
  return fetch(base + path, { ...opts, headers }).then(async (res) => {
    const text = await res.text()
    try { const body = text ? JSON.parse(text) : null; if (!res.ok) throw body || { error: 'request_failed' }; return body } catch (e) { if (!res.ok) throw { error: 'request_failed', details: text }; return JSON.parse(text) }
  })
}

async function getSongs(token) { return apiFetch('/api/songs', token) }
async function createSong(token, payload) { return apiFetch('/api/songs', token, { method: 'POST', body: JSON.stringify(payload) }) }
async function getSetlists(token) { return apiFetch('/api/setlists', token) }
async function createSetlist(token, payload) { return apiFetch('/api/setlists', token, { method: 'POST', body: JSON.stringify(payload) }) }

export { apiFetch, getSongs, createSong, getSetlists, createSetlist }
