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

async function rememberGoogleError(message) {
  try {
    const { setSetting } = await import('../services/settings.js')
    await setSetting(
      'auth.lastGoogleError',
      `${new Date().toISOString()} ${String(message || '').slice(0, 400)}`,
    )
  } catch {
    /* ignore */
  }
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

    passport.authenticate('google', { session: false }, async (err, user, info) => {
      if (err) {
        const msg = err.message || String(err)
        console.error('[auth] google callback error:', msg, err.code || '', info || '')
        await rememberGoogleError(msg)
        if (err.code === 'oauth_no_email' || /sin email/i.test(msg)) {
          return res.redirect(loginErrorRedirect('oauth_no_email'))
        }
        if (/Unique constraint|P2002/i.test(msg)) {
          return res.redirect(loginErrorRedirect('oauth_db'))
        }
        if (/invalid_client|unauthorized_client/i.test(msg)) {
          return res.redirect(loginErrorRedirect('oauth_failed'))
        }
        if (/invalid_grant|Malformed auth code/i.test(msg)) {
          return res.redirect(loginErrorRedirect('oauth_retry'))
        }
        // Prisma / DB / avatar / etc.
        if (/prisma|Invalid|VarChar|Argument/i.test(msg)) {
          return res.redirect(loginErrorRedirect('oauth_db'))
        }
        return res.redirect(loginErrorRedirect('oauth_failed'))
      }
      if (!user) {
        console.warn('[auth] google callback sin user', info)
        await rememberGoogleError(info?.message || 'no user')
        return res.redirect(loginErrorRedirect('oauth_denied'))
      }

      try {
        const token = signToken(user)
        setAuthCookie(res, token)
        const dest = user.onboardingCompleted ? 'dashboard' : 'onboarding'
        return res.redirect(`${env.clientUrl}/${dest}?token=${token}`)
      } catch (signErr) {
        console.error('[auth] sign token', signErr)
        await rememberGoogleError(signErr.message)
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
