import webpush from 'web-push'
import { prisma } from '../config/database.js'
import { getVapidConfig } from './settings.js'

let configured = false

export async function refreshWebPush() {
  const cfg = await getVapidConfig()
  if (!cfg.configured) {
    configured = false
    console.warn('[push] VAPID keys missing — Web Push desactivado')
    return false
  }
  webpush.setVapidDetails(cfg.subject, cfg.publicKey, cfg.privateKey)
  configured = true
  console.log('[push] Web Push listo')
  return true
}

/** @deprecated usar refreshWebPush */
export async function setupWebPush() {
  return refreshWebPush()
}

export function webPushReady() {
  return configured
}

/**
 * @param {object} sub { endpoint, p256dh, auth }
 * @param {{ title: string, body: string, url?: string, tag?: string, silent?: boolean }} payload
 */
export async function sendPushToSubscription(sub, payload) {
  if (!webPushReady()) return { ok: false, reason: 'not_configured' }
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url || '/dashboard',
        tag: payload.tag || 'correctly',
        silent: Boolean(payload.silent),
      }),
      { TTL: 60 * 60 },
    )
    return { ok: true }
  } catch (err) {
    const status = err.statusCode || err.status
    if (status === 404 || status === 410) {
      await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } })
      return { ok: false, reason: 'gone' }
    }
    console.warn('[push] send failed', status || err.message)
    return { ok: false, reason: err.message }
  }
}

export async function sendPushToUser(userId, payload) {
  const subs = await prisma.pushSubscription.findMany({ where: { userId } })
  if (!subs.length) return { sent: 0 }
  let sent = 0
  for (const sub of subs) {
    const r = await sendPushToSubscription(sub, payload)
    if (r.ok) sent += 1
  }
  return { sent }
}
