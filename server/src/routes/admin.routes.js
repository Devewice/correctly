import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { requireSuperAdmin } from '../middleware/roles.js'
import { prisma } from '../config/database.js'
import {
  getAdminSettingsOverview,
  saveGoogleConfig,
  setSetting,
  KEYS,
} from '../services/settings.js'
import { refreshGoogleStrategy } from '../config/passport.js'
import { env } from '../config/env.js'
import { ROLES } from '../services/roles.js'

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
