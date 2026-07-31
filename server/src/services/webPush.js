import webpush from 'web-push'
import { env, isWebPushConfigured } from '../config/env.js'
import { prisma } from '../config/database.js'

let configured = false

export function setupWebPush() {
  if (!isWebPushConfigured()) {
    console.warn('[push] VAPID keys missing — Web Push desactivado')
    return false
  }
  webpush.setVapidDetails(
    env.vapid.subject,
    env.vapid.publicKey,
    env.vapid.privateKey,
  )
  configured = true
  console.log('[push] Web Push listo')
  return true
}

export function webPushReady() {
  return configured && isWebPushConfigured()
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
    // Suscripción muerta → borrar
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
