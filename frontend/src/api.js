// Minimal API client

function getBase() {
  let base = import.meta.env.VITE_API_BASE || ''
  // Strip trailing slash to avoid double-slash issues
  return base.replace(/\/+$/, '')
}

// Export for Auth.jsx and other components that need the raw base URL
function getApiBase() { return getBase() }

function apiFetch(path, token, opts = {}) {
  const base = getBase()
  const headers = opts.headers || {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!headers['Content-Type'] && opts.body) headers['Content-Type'] = 'application/json'
  return fetch(base + path, { ...opts, headers }).then(async (res) => {
    const text = await res.text()
    try {
      const body = text ? JSON.parse(text) : null
      if (!res.ok) throw body || { error: 'request_failed' }
      return body
    } catch (e) {
      if (!res.ok) throw { error: 'request_failed', details: text }
      return JSON.parse(text)
    }
  })
}

async function getSongs(token) { return apiFetch('/api/songs/search', token) }
async function searchSongs(token, q) { return apiFetch(`/api/songs/search?q=${encodeURIComponent(q || '')}`, token) }
async function getSong(token, id) { return apiFetch(`/api/songs/${id}`, token) }
async function getVersion(token, id) { return apiFetch(`/api/versions/${id}`, token) }
async function createSong(token, payload) { return apiFetch('/api/songs', token, { method: 'POST', body: JSON.stringify(payload) }) }
async function getSetlists(token) { return apiFetch('/api/setlists', token) }
async function createSetlist(token, payload) { return apiFetch('/api/setlists', token, { method: 'POST', body: JSON.stringify(payload) }) }

// Teacher API helpers
async function getMyLessons(token) { return apiFetch('/api/my-lessons', token) }
async function updateVersion(token, id, payload) { return apiFetch(`/api/versions/${id}`, token, { method: 'PUT', body: JSON.stringify(payload) }) }
async function deleteVersion(token, id) { return apiFetch(`/api/versions/${id}`, token, { method: 'DELETE' }) }
async function updateSong(token, id, payload) { return apiFetch(`/api/songs/${id}`, token, { method: 'PUT', body: JSON.stringify(payload) }) }
async function createVersion(token, songId, payload) { return apiFetch(`/api/songs/${songId}/versions`, token, { method: 'POST', body: JSON.stringify(payload) }) }
async function getTeacherStats(token) { return apiFetch('/api/teacher/stats', token) }

// Purchase API helpers
async function getMyPurchases(token) { return apiFetch('/api/my-purchases', token) }
async function purchaseVersion(token, versionId) { return apiFetch(`/api/purchase/${versionId}`, token, { method: 'POST' }) }
async function checkAccess(token, versionId) { return apiFetch(`/api/versions/${versionId}/access`, token) }
async function getFullVersion(token, versionId) { return apiFetch(`/api/versions/${versionId}/full`, token) }

// Browse lessons (student discovery)
async function browseLessons(token, { q, key, minPrice, maxPrice, sort } = {}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (key) params.set('key', key)
  if (minPrice) params.set('minPrice', minPrice)
  if (maxPrice) params.set('maxPrice', maxPrice)
  if (sort) params.set('sort', sort)
  const qs = params.toString()
  return apiFetch(`/api/lessons/browse${qs ? '?' + qs : ''}`, token)
}

export { apiFetch, getApiBase, getSongs, searchSongs, getSong, getVersion, createSong, getSetlists, createSetlist,
  getMyLessons, updateVersion, deleteVersion, updateSong, createVersion, getTeacherStats,
  getMyPurchases, purchaseVersion, checkAccess, getFullVersion, browseLessons }
