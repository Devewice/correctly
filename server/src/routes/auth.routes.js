import { Router } from 'express'
import { env } from '../config/env.js'
import {
  clearAuthCookie,
  requireAuth,
  setAuthCookie,
  signToken,
} from '../middleware/auth.js'
import { upsertGoogleUser } from '../config/passport.js'
import { getGoogleConfig, getPublicAuthFlags } from '../services/settings.js'
import {
  buildGoogleAuthUrl,
  exchangeGoogleCode,
  fetchGoogleUserInfo,
  profileFromUserInfo,
} from '../services/googleOAuth.js'

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

function mapOAuthError(err) {
  const msg = err?.message || String(err)
  const code = err?.code || ''
  if (code === 'oauth_no_email' || /sin email/i.test(msg)) return 'oauth_no_email'
  if (code === 'oauth_retry' || /invalid_grant/i.test(msg)) return 'oauth_retry'
  if (code === 'oauth_network' || /Unexpected end of JSON|respuesta vacía|no-JSON/i.test(msg)) {
    return 'oauth_network'
  }
  if (/Unique constraint|P2002|prisma|VarChar|Argument/i.test(msg)) return 'oauth_db'
  return 'oauth_failed'
}

router.get('/google', async (req, res) => {
  try {
    const cfg = await getGoogleConfig()
    if (!cfg.configured) {
      if (req.accepts('html')) {
        return res.redirect(loginErrorRedirect('oauth_not_configured'))
      }
      return res.status(503).json({
        error: 'Google OAuth no configurado',
        hint: 'Configura Google OAuth en el panel admin o variables de entorno',
      })
    }

    const url = buildGoogleAuthUrl({
      clientId: cfg.clientId,
      callbackUrl: cfg.callbackUrl,
    })
    return res.redirect(url)
  } catch (err) {
    console.error('[auth] /google', err)
    await rememberGoogleError(err.message)
    return res.redirect(loginErrorRedirect('oauth_failed'))
  }
})

router.get('/google/callback', async (req, res) => {
  try {
    if (req.query.error) {
      await rememberGoogleError(`google_deny: ${req.query.error}`)
      return res.redirect(loginErrorRedirect('oauth_denied'))
    }

    const code = typeof req.query.code === 'string' ? req.query.code : ''
    if (!code) {
      await rememberGoogleError('callback sin code')
      return res.redirect(loginErrorRedirect('oauth_denied'))
    }

    const cfg = await getGoogleConfig()
    if (!cfg.configured) {
      return res.redirect(loginErrorRedirect('oauth_not_configured'))
    }

    console.log(
      `[auth] google callback → exchange redirect_uri=${cfg.callbackUrl} secretSource=${cfg.sources?.clientSecret}`,
    )

    const tokens = await exchangeGoogleCode({
      code,
      clientId: cfg.clientId,
      clientSecret: cfg.clientSecret,
      callbackUrl: cfg.callbackUrl,
    })

    const info = await fetchGoogleUserInfo(tokens.access_token)
    const profile = profileFromUserInfo(info)
    const user = await upsertGoogleUser(profile)

    const token = signToken(user)
    setAuthCookie(res, token)
    const dest = user.onboardingCompleted ? 'dashboard' : 'onboarding'
    return res.redirect(`${env.clientUrl}/${dest}?token=${token}`)
  } catch (err) {
    const msg = err.message || String(err)
    console.error('[auth] google callback error:', msg, err.code || '')
    await rememberGoogleError(msg)
    return res.redirect(loginErrorRedirect(mapOAuthError(err)))
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
