const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function getToken() {
  return localStorage.getItem('fashion_token')
}

export async function apiFetch(path, { method = 'GET', body, auth = false, headers = {} } = {}) {
  const opts = { method, headers: { 'Content-Type': 'application/json', ...headers } }
  if (auth) {
    const t = getToken()
    if (t) opts.headers.Authorization = `Bearer ${t}`
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${API}${path}`, opts)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.error || data.message || `Request failed ${res.status}`
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export { API }
