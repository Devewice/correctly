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

function loginErrorRedirect(code) {
  return `${env.clientUrl}/login?error=${encodeURIComponent(code)}`
}

router.get('/google', async (req, res, next) => {
  try {
    const ok = await refreshGoogleStrategy()
    if (!ok && !(await isGoogleAuthConfigured())) {
      // Navegación del navegador → redirigir, no JSON crudo
      if (req.accepts('html')) {
        return res.redirect(loginErrorRedirect('oauth_not_configured'))
      }
      return res.status(503).json({
        error: 'Google OAuth no configurado',
        hint: 'Configura Google OAuth en el panel admin o variables de entorno',
      })
    }
    return passport.authenticate('google', {
      scope: ['openid', 'email', 'profile'],
      session: false,
    })(req, res, next)
  } catch (err) {
    console.error('[auth] /google', err)
    return res.redirect(loginErrorRedirect('oauth_failed'))
  }
})

router.get('/google/callback', async (req, res, next) => {
  try {
    const ok = await refreshGoogleStrategy()
    if (!ok) {
      return res.redirect(loginErrorRedirect('oauth_not_configured'))
    }

    passport.authenticate('google', { session: false }, (err, user) => {
      if (err) {
        console.error('[auth] google callback error:', err.message || err)
        return res.redirect(loginErrorRedirect('oauth_failed'))
      }
      if (!user) {
        return res.redirect(loginErrorRedirect('oauth_denied'))
      }

      try {
        const token = signToken(user)
        setAuthCookie(res, token)
        const dest = user.onboardingCompleted ? 'dashboard' : 'onboarding'
        return res.redirect(`${env.clientUrl}/${dest}?token=${token}`)
      } catch (signErr) {
        console.error('[auth] sign token', signErr)
        return res.redirect(loginErrorRedirect('oauth_failed'))
      }
    })(req, res, next)
  } catch (err) {
    console.error('[auth] /google/callback', err)
    return res.redirect(loginErrorRedirect('oauth_failed'))
  }
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
