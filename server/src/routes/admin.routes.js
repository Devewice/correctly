import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { requireSuperAdmin } from '../middleware/roles.js'
import { prisma } from '../config/database.js'
import webpush from 'web-push'
import {
  getAdminSettingsOverview,
  getVapidConfig,
  saveGoogleConfig,
  saveVapidConfig,
  setSetting,
  KEYS,
} from '../services/settings.js'
import { refreshGoogleStrategy } from '../config/passport.js'
import { refreshWebPush } from '../services/webPush.js'
import { startReminderPushJob } from '../services/reminderPushJob.js'
import { env } from '../config/env.js'
import { ROLES } from '../services/roles.js'

let pushJobStarted = false

const router = Router()
router.use(requireAuth, requireSuperAdmin)

router.get('/overview', async (_req, res) => {
  const [settings, usersCount, superadmins] = await Promise.all([
    getAdminSettingsOverview(),
    prisma.user.count(),
    prisma.user.findMany({
      where: { role: ROLES.SUPERADMIN },
      select: { id: true, email: true, name: true },
    }),
  ])
  res.json({
    settings,
    stats: { usersCount, superadmins },
  })
})

router.get('/settings', async (_req, res) => {
  const settings = await getAdminSettingsOverview()
  res.json({ settings })
})

const googleSchema = z.object({
  clientId: z.string().min(10).optional(),
  clientSecret: z.string().min(5).optional().or(z.literal('')),
  callbackUrl: z.string().url().optional(),
  wizardDone: z.boolean().optional(),
})

router.put('/settings/google', async (req, res) => {
  const data = googleSchema.parse(req.body)
  const google = await saveGoogleConfig(data, req.user.id)
  await refreshGoogleStrategy()
  res.json({
    google: {
      clientId: google.clientId,
      clientSecretSet: Boolean(google.clientSecret),
      callbackUrl: google.callbackUrl,
      configured: google.configured,
      wizardDone: google.wizardDone,
    },
  })
})

router.get('/wizard/google', async (_req, res) => {
  const settings = await getAdminSettingsOverview()
  res.json({
    steps: [
      {
        id: 'console',
        titleKey: 'admin.wizard.google.steps.console',
        url: 'https://console.cloud.google.com/apis/credentials',
      },
      {
        id: 'oauth_client',
        titleKey: 'admin.wizard.google.steps.oauthClient',
      },
      {
        id: 'origins',
        titleKey: 'admin.wizard.google.steps.origins',
        origins: [env.clientUrl],
        redirectUris: [
          `${env.clientUrl}/api/auth/google/callback`,
          settings.google.callbackUrl,
        ].filter((v, i, a) => a.indexOf(v) === i),
      },
      {
        id: 'paste',
        titleKey: 'admin.wizard.google.steps.paste',
      },
      {
        id: 'test',
        titleKey: 'admin.wizard.google.steps.test',
      },
    ],
    current: settings.google,
  })
})

router.post('/wizard/google/complete', async (req, res) => {
  await setSetting(KEYS.googleWizardDone, 'true', req.user.id)
  res.json({ ok: true })
})

const vapidSchema = z.object({
  publicKey: z.string().min(20).optional(),
  privateKey: z.string().min(10).optional().or(z.literal('')),
  subject: z
    .string()
    .regex(/^(mailto:|https?:\/\/).+/i)
    .optional(),
  wizardDone: z.boolean().optional(),
})

router.put('/settings/vapid', async (req, res) => {
  const data = vapidSchema.parse(req.body)
  const vapid = await saveVapidConfig(data, req.user.id)
  const ready = await refreshWebPush()
  if (ready && !pushJobStarted) {
    startReminderPushJob()
    pushJobStarted = true
  }
  res.json({
    vapid: {
      publicKey: vapid.publicKey,
      privateKeySet: Boolean(vapid.privateKey),
      subject: vapid.subject,
      configured: vapid.configured,
      wizardDone: vapid.wizardDone,
      runtimeReady: ready,
    },
  })
})

router.get('/wizard/vapid', async (_req, res) => {
  const settings = await getAdminSettingsOverview()
  res.json({
    steps: [
      {
        id: 'explain',
        titleKey: 'admin.wizard.vapid.steps.explain',
      },
      {
        id: 'generate',
        titleKey: 'admin.wizard.vapid.steps.generate',
      },
      {
        id: 'paste',
        titleKey: 'admin.wizard.vapid.steps.paste',
      },
      {
        id: 'hostinger',
        titleKey: 'admin.wizard.vapid.steps.hostinger',
        envHint: [
          'VAPID_PUBLIC_KEY=…',
          'VAPID_PRIVATE_KEY=…',
          'VAPID_SUBJECT=mailto:admin@jeisson.click',
        ],
        note: 'También puedes guardar solo en la base (este wizard) sin tocar el .env.',
      },
      {
        id: 'test',
        titleKey: 'admin.wizard.vapid.steps.test',
      },
    ],
    current: settings.vapid,
    app: settings.app,
  })
})

router.post('/wizard/vapid/generate', async (_req, res) => {
  const keys = webpush.generateVAPIDKeys()
  res.json({
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
    subject: 'mailto:admin@jeisson.click',
  })
})

router.post('/wizard/vapid/complete', async (req, res) => {
  await setSetting(KEYS.vapidWizardDone, 'true', req.user.id)
  const vapid = await getVapidConfig()
  res.json({
    ok: true,
    vapid: {
      configured: vapid.configured,
      wizardDone: true,
    },
  })
})

router.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      onboardingCompleted: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  res.json({ users })
})

const roleSchema = z.object({
  role: z.enum(['user', 'admin', 'superadmin']),
})

router.patch('/users/:id/role', async (req, res) => {
  const { role } = roleSchema.parse(req.body)
  if (req.params.id === req.user.id && role !== ROLES.SUPERADMIN) {
    return res.status(400).json({ error: 'No puedes quitarte el rol superadmin' })
  }
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, email: true, name: true, role: true },
  })
  res.json({ user })
})

export default router
