const SCHEMA_VERSION = 1
const PREFIX = 'guitarbuddy:'

function key(k) { return PREFIX + k }

function save(kind, obj) {
  const payload = { v: SCHEMA_VERSION, data: obj }
  localStorage.setItem(key(kind), JSON.stringify(payload))
}

function load(kind) {
  const raw = localStorage.getItem(key(kind))
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (!parsed.v || parsed.v !== SCHEMA_VERSION) {
      // handle migrations later
      return parsed.data
    }
    return parsed.data
  } catch (e) {
    return null
  }
}

export { save, load }
