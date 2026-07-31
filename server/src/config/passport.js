import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { prisma } from './database.js'
import { getGoogleConfig } from '../services/settings.js'
import { ROLES, matchesSuperAdminIdentity } from '../services/roles.js'

async function upsertGoogleUser(profile) {
  const email = profile.emails?.[0]?.value
  if (!email) throw new Error('Google account sin email')

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: profile.id }, { email }] },
  })

  const roleBoost = matchesSuperAdminIdentity({ email })
    ? ROLES.SUPERADMIN
    : undefined

  if (!user) {
    user = await prisma.user.create({
      data: {
        googleId: profile.id,
        email,
        name: profile.displayName || email.split('@')[0],
        avatar: profile.photos?.[0]?.value,
        role: roleBoost || ROLES.USER,
        stats: { create: {} },
      },
    })
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: user.googleId || profile.id,
        avatar: user.avatar || profile.photos?.[0]?.value,
        name: user.name || profile.displayName,
        ...(roleBoost ? { role: ROLES.SUPERADMIN } : {}),
      },
    })
  }

  await prisma.userStats.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  })

  return user
}

/** Recarga la estrategia Google desde DB (+ fallback env) */
export async function refreshGoogleStrategy() {
  const cfg = await getGoogleConfig()
  try {
    passport.unuse('google')
  } catch {
    /* no estaba registrada */
  }

  if (!cfg.configured) {
    console.warn('[auth] Google OAuth no configurado (env ni panel admin)')
    return false
  }

  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: cfg.clientId,
        clientSecret: cfg.clientSecret,
        callbackURL: cfg.callbackUrl,
        // Detrás de Passenger/proxy en Hostinger
        proxy: true,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await upsertGoogleUser(profile)
          return done(null, user)
        } catch (err) {
          return done(err)
        }
      },
    ),
  )

  console.log(
    `[auth] Google OAuth listo → callback=${cfg.callbackUrl} idSource=${cfg.sources?.clientId} secretSource=${cfg.sources?.clientSecret}`,
  )
  return true
}

export async function configurePassport() {
  await refreshGoogleStrategy()
}

export async function isGoogleAuthConfigured() {
  const cfg = await getGoogleConfig()
  return cfg.configured
}
