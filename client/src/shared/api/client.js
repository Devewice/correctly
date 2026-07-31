const TOKEN_KEY = 'correctly_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let body = options.body
  if (body !== undefined && body !== null && !(body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
    body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    ...options,
    headers,
    body,
  })

  const text = await res.text()
  let data = {}
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { error: text.slice(0, 200) || 'Invalid response' }
    }
  }

  if (!res.ok) {
    const err = new Error(data.error || 'Request failed')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}
