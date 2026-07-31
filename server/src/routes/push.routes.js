import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'
import { env, isWebPushConfigured } from '../config/env.js'

const router = Router()

router.get('/vapid-public-key', (_req, res) => {
  if (!isWebPushConfigured()) {
    return res.status(503).json({ configured: false, error: 'Web Push not configured' })
  }
  res.json({ configured: true, publicKey: env.vapid.publicKey })
})

router.use(requireAuth)

router.get('/status', async (req, res) => {
  const count = await prisma.pushSubscription.count({
    where: { userId: req.user.id },
  })
  res.json({
    configured: isWebPushConfigured(),
    subscribed: count > 0,
    devices: count,
  })
})

const subSchema = z.object({
  endpoint: z.string().url().max(500),
  keys: z.object({
    p256dh: z.string().min(1).max(200),
    auth: z.string().min(1).max(100),
  }),
  userAgent: z.string().max(255).optional(),
})

router.post('/subscribe', async (req, res) => {
  if (!isWebPushConfigured()) {
    return res.status(503).json({ error: 'Web Push not configured' })
  }
  const data = subSchema.parse(req.body)
  const row = await prisma.pushSubscription.upsert({
    where: {
      userId_endpoint: {
        userId: req.user.id,
        endpoint: data.endpoint,
      },
    },
    create: {
      userId: req.user.id,
      endpoint: data.endpoint,
      p256dh: data.keys.p256dh,
      auth: data.keys.auth,
      userAgent: data.userAgent?.slice(0, 255) || null,
    },
    update: {
      p256dh: data.keys.p256dh,
      auth: data.keys.auth,
      userAgent: data.userAgent?.slice(0, 255) || null,
    },
  })
  res.status(201).json({ ok: true, id: row.id })
})

router.delete('/subscribe', async (req, res) => {
  const endpoint =
    typeof req.body?.endpoint === 'string' ? req.body.endpoint : null
  if (endpoint) {
    await prisma.pushSubscription.deleteMany({
      where: { userId: req.user.id, endpoint },
    })
  } else {
    await prisma.pushSubscription.deleteMany({ where: { userId: req.user.id } })
  }
  res.json({ ok: true })
})

/** Prueba inmediata al dispositivo actual (o a todos del usuario) */
router.post('/test', async (req, res) => {
  const { sendPushToUser } = await import('../services/webPush.js')
  if (!isWebPushConfigured()) {
    return res.status(503).json({ error: 'Web Push not configured' })
  }
  const result = await sendPushToUser(req.user.id, {
    title: 'Correctly',
    body:
      req.user.language === 'en'
        ? 'Push works! Soft alarms can reach you in the background.'
        : req.user.language === 'pt'
          ? 'Push funciona! Os alarmes suaves chegam em segundo plano.'
          : '¡Push listo! Las alarmas suaves pueden llegarte en segundo plano.',
    url: '/reminders',
    tag: 'correctly-test',
  })
  if (!result.sent) {
    return res.status(400).json({ error: 'No push subscription', sent: 0 })
  }
  res.json({ ok: true, sent: result.sent })
})

export default router
