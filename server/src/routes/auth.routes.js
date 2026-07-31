import { Router } from 'express'
import passport from 'passport'
import { env, isGoogleAuthConfigured } from '../config/env.js'
import { prisma } from '../config/database.js'
import {
  clearAuthCookie,
  requireAuth,
  setAuthCookie,
  signToken,
} from '../middleware/auth.js'

const router = Router()

router.get('/google', (req, res, next) => {
  if (!isGoogleAuthConfigured()) {
    return res.status(503).json({
      error: 'Google OAuth no configurado',
      hint: 'Configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET, o usa POST /api/auth/dev-login',
    })
  }
  return passport.authenticate('google', {
    scope: ['openid', 'email', 'profile'],
    session: false,
  })(req, res, next)
})

router.get(
  '/google/callback',
  (req, res, next) => {
    if (!isGoogleAuthConfigured()) {
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
    const dest = req.user.onboardingCompleted
      ? `${env.clientUrl}/dashboard`
      : `${env.clientUrl}/onboarding`
    res.redirect(`${dest}?token=${token}`)
  },
)

/** Demo login — local siempre; en producción solo si ALLOW_DEMO_LOGIN=true */
router.post('/dev-login', async (req, res) => {
  const allowDemo =
    env.nodeEnv !== 'production' || process.env.ALLOW_DEMO_LOGIN === 'true'
  if (!allowDemo) {
    return res.status(404).json({ error: 'Not found' })
  }

  const email = (req.body?.email || 'demo@correctly.app').toLowerCase()
  const name = req.body?.name || 'Demo Correctly'

  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        language: req.body?.language || 'es',
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

router.post('/logout', (_req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

router.get('/status', (_req, res) => {
  res.json({
    googleConfigured: isGoogleAuthConfigured(),
    devLogin:
      env.nodeEnv !== 'production' || process.env.ALLOW_DEMO_LOGIN === 'true',
  })
})

export default router
