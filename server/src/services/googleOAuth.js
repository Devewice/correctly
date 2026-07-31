/**
 * OAuth Google sin Passport en el callback.
 * Evita fallos opacos (p. ej. "Unexpected end of JSON input") al depurar
 * el intercambio code→token detrás de Passenger/proxy.
 */

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

export function buildGoogleAuthUrl({ clientId, callbackUrl, state }) {
  const url = new URL(AUTH_URL)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', callbackUrl)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('access_type', 'online')
  url.searchParams.set('prompt', 'select_account')
  if (state) url.searchParams.set('state', state)
  return url.toString()
}

async function readJsonResponse(res, label) {
  const text = await res.text()
  if (!text) {
    const err = new Error(
      `${label}: respuesta vacía (HTTP ${res.status}). Revisa salida HTTPS del servidor hacia Google.`,
    )
    err.code = 'oauth_network'
    throw err
  }
  let data
  try {
    data = JSON.parse(text)
  } catch {
    const err = new Error(
      `${label}: no-JSON (HTTP ${res.status}): ${text.slice(0, 180)}`,
    )
    err.code = 'oauth_network'
    throw err
  }
  return { data, status: res.status, text }
}

export async function exchangeGoogleCode({
  code,
  clientId,
  clientSecret,
  callbackUrl,
}) {
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: callbackUrl,
    grant_type: 'authorization_code',
  })

  let res
  try {
    res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body,
    })
  } catch (e) {
    const err = new Error(`token: red falló: ${e.message}`)
    err.code = 'oauth_network'
    throw err
  }

  const { data, status } = await readJsonResponse(res, 'token')

  if (!res.ok || data.error) {
    const desc = data.error_description || data.error || `HTTP ${status}`
    const err = new Error(`token: ${desc}`)
    if (data.error === 'invalid_grant') err.code = 'oauth_retry'
    else if (data.error === 'invalid_client' || data.error === 'unauthorized_client') {
      err.code = 'oauth_failed'
    } else if (data.error === 'redirect_uri_mismatch') err.code = 'oauth_failed'
    else err.code = 'oauth_failed'
    throw err
  }

  if (!data.access_token) {
    const err = new Error('token: sin access_token')
    err.code = 'oauth_failed'
    throw err
  }

  return data
}

export async function fetchGoogleUserInfo(accessToken) {
  let res
  try {
    res = await fetch(USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })
  } catch (e) {
    const err = new Error(`userinfo: red falló: ${e.message}`)
    err.code = 'oauth_network'
    throw err
  }

  const { data, status } = await readJsonResponse(res, 'userinfo')

  if (!res.ok || data.error) {
    const err = new Error(
      `userinfo: ${data.error_description || data.error || `HTTP ${status}`}`,
    )
    err.code = 'oauth_failed'
    throw err
  }

  return data
}

/** Normaliza userinfo de Google al shape que usa upsertGoogleUser / passport profile */
export function profileFromUserInfo(info) {
  const email = (info.email || '').toString().trim().toLowerCase()
  return {
    id: info.sub,
    displayName: info.name || email.split('@')[0] || 'Usuario',
    emails: email ? [{ value: email }] : [],
    photos: info.picture ? [{ value: info.picture }] : [],
    _json: info,
  }
}
