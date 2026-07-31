import { Router } from 'express'
import passport from 'passport'
import { env } from '../config/env.js'
import { prisma } from '../config/database.js'
import {
  clearAuthCookie,
  requireAuth,
  setAuthCookie,
  signToken,
} from '../middleware/auth.js'
import {
  isGoogleAuthConfigured,
  refreshGoogleStrategy,
} from '../config/passport.js'
import { getPublicAuthFlags } from '../services/settings.js'
import { ROLES, matchesSuperAdminIdentity } from '../services/roles.js'

const router = Router()

router.get('/google', async (req, res, next) => {
  const ok = await refreshGoogleStrategy()
  if (!ok && !(await isGoogleAuthConfigured())) {
    return res.status(503).json({
      error: 'Google OAuth no configurado',
      hint: 'El superadmin debe completarlo en /admin (wizard Google)',
    })
  }
  return passport.authenticate('google', {
    scope: ['openid', 'email', 'profile'],
    session: false,
  })(req, res, next)
})

router.get(
  '/google/callback',
  async (req, res, next) => {
    const ok = await refreshGoogleStrategy()
    if (!ok) {
      return res.redirect(`${env.clientUrl}/login?error=oauth_not_configured`)
    }
    return passport.authenticate('google', {
      session: false,
      failureRedirect: `${env.clientUrl}/login?error=oauth_failed`,
    })(req, res, next)
  },
  (req, res) => {
    const token = signToken(req.user)
    setAuthCookie(res, token)
    const dest = req.user.onboardingCompleted ? 'dashboard' : 'onboarding'
    res.redirect(`${env.clientUrl}/${dest}?token=${token}`)
  },
)

router.post('/dev-login', async (req, res) => {
  const flags = await getPublicAuthFlags()
  if (!flags.devLogin) {
    return res.status(404).json({ error: 'Not found' })
  }

  // Usuario demo normal (no admin). El admin demo va por /dev-login-admin.
  const email = (req.body?.email || 'user@correctly.app').toLowerCase()
  const name = req.body?.name || 'Demo Correctly'

  if (matchesSuperAdminIdentity({ email })) {
    return res.status(400).json({
      error: 'Usa el login admin demo para cuentas superadmin',
    })
  }

  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        language: req.body?.language || 'es',
        role: ROLES.USER,
        stats: { create: {} },
      },
    })
  } else {
    await prisma.userStats.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    })
  }

  const token = signToken(user)
  setAuthCookie(res, token)
  res.json({ token, user })
})

/** Login demo admin (demo@correctly.app) — solo si ALLOW_DEMO_LOGIN */
router.post('/dev-login-admin', async (req, res) => {
  const flags = await getPublicAuthFlags()
  if (!flags.devLogin) {
    return res.status(404).json({ error: 'Not found' })
  }

  const email = 'demo@correctly.app'
  const name = 'Jeisson'

  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        role: ROLES.SUPERADMIN,
        onboardingCompleted: true,
        language: req.body?.language || 'es',
        stats: { create: {} },
      },
    })
  } else if (user.role !== ROLES.SUPERADMIN) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: ROLES.SUPERADMIN, name: user.name || name },
    })
  }

  const token = signToken(user)
  setAuthCookie(res, token)
  res.json({ token, user })
})

router.post('/logout', (_req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

router.get('/status', async (_req, res) => {
  const flags = await getPublicAuthFlags()
  res.json(flags)
})

export default router
