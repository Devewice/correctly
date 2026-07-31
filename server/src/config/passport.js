import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { prisma } from './database.js'
import { getGoogleConfig } from '../services/settings.js'
import { ROLES, matchesSuperAdminIdentity } from '../services/roles.js'

function pickEmail(profile) {
  return (
    profile.emails?.[0]?.value ||
    profile._json?.email ||
    profile._json?.emailAddresses?.[0]?.value ||
    ''
  )
    .toString()
    .trim()
    .toLowerCase()
}

/** Google a veces manda URLs de avatar > 500 chars → rompía el login */
function pickAvatar(profile) {
  const raw =
    profile.photos?.[0]?.value ||
    profile._json?.picture ||
    profile._json?.photo ||
    null
  if (!raw || typeof raw !== 'string') return null
  return raw.length > 1000 ? raw.slice(0, 1000) : raw
}

export async function upsertGoogleUser(profile) {
  const email = pickEmail(profile)
  if (!email) {
    const err = new Error('Google account sin email')
    err.code = 'oauth_no_email'
    throw err
  }

  const avatar = pickAvatar(profile)
  const name =
    profile.displayName ||
    profile._json?.name ||
    email.split('@')[0]

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
        name,
        avatar,
        role: roleBoost || ROLES.USER,
        stats: { create: {} },
      },
    })
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: user.googleId || profile.id,
        avatar: user.avatar || avatar,
        name: user.name || name,
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
