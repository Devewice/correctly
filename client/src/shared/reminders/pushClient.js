import { api, getToken } from '@/shared/api/client'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) arr[i] = raw.charCodeAt(i)
  return arr
}

export function pushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
  await navigator.serviceWorker.ready
  return reg
}

export async function getPushStatus() {
  if (!getToken()) return { configured: false, subscribed: false, devices: 0 }
  try {
    return await api('/push/status')
  } catch {
    return { configured: false, subscribed: false, devices: 0 }
  }
}

export async function subscribeWebPush() {
  if (!pushSupported()) {
    return { ok: false, reason: 'unsupported' }
  }

  const perm = await Notification.requestPermission()
  if (perm !== 'granted') {
    return { ok: false, reason: perm }
  }

  const meta = await api('/push/vapid-public-key')
  if (!meta.configured || !meta.publicKey) {
    return { ok: false, reason: 'not_configured' }
  }

  const reg = await registerServiceWorker()
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(meta.publicKey),
    })
  }

  const json = sub.toJSON()
  await api('/push/subscribe', {
    method: 'POST',
    body: {
      endpoint: json.endpoint,
      keys: {
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      },
      userAgent: navigator.userAgent,
    },
  })

  return { ok: true, subscription: json }
}

export async function unsubscribeWebPush() {
  if (!pushSupported()) return { ok: true }
  const reg = await navigator.serviceWorker.getRegistration()
  const sub = await reg?.pushManager.getSubscription()
  if (sub) {
    const endpoint = sub.endpoint
    await sub.unsubscribe()
    try {
      await api('/push/subscribe', { method: 'DELETE', body: { endpoint } })
    } catch {
      /* ignore */
    }
  } else {
    try {
      await api('/push/subscribe', { method: 'DELETE', body: {} })
    } catch {
      /* ignore */
    }
  }
  return { ok: true }
}

export async function sendTestPush() {
  return api('/push/test', { method: 'POST' })
}
