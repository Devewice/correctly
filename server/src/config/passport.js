import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { env, isGoogleAuthConfigured } from './env.js'
import { prisma } from './database.js'

export function configurePassport() {
  if (!isGoogleAuthConfigured()) {
    console.warn('[auth] Google OAuth no configurado — usa /api/auth/dev-login en desarrollo')
    return
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: env.google.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value
          if (!email) return done(new Error('Google account sin email'))

          let user = await prisma.user.findFirst({
            where: {
              OR: [{ googleId: profile.id }, { email }],
            },
          })

          if (!user) {
            user = await prisma.user.create({
              data: {
                googleId: profile.id,
                email,
                name: profile.displayName || email.split('@')[0],
                avatar: profile.photos?.[0]?.value,
                stats: { create: {} },
              },
            })
          } else if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: profile.id,
                avatar: user.avatar || profile.photos?.[0]?.value,
                name: user.name || profile.displayName,
              },
            })
          }

          // Ensure stats row
          await prisma.userStats.upsert({
            where: { userId: user.id },
            create: { userId: user.id },
            update: {},
          })

          return done(null, user)
        } catch (err) {
          return done(err)
        }
      },
    ),
  )
}
