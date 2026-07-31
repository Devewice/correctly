import { Router } from 'express'
import passport from 'passport'
import { env } from '../config/env.js'
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

const router = Router()

router.get('/google', async (req, res, next) => {
  const ok = await refreshGoogleStrategy()
  if (!ok && !(await isGoogleAuthConfigured())) {
    return res.status(503).json({
      error: 'Google OAuth no configurado',
      hint: 'Configura Google OAuth en el panel admin o variables de entorno',
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
