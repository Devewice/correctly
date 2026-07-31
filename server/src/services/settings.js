import { prisma } from '../config/database.js'
import { env } from '../config/env.js'

const KEYS = {
  googleClientId: 'google.clientId',
  googleClientSecret: 'google.clientSecret',
  googleCallbackUrl: 'google.callbackUrl',
  googleWizardDone: 'google.wizardDone',
  allowDemoLogin: 'auth.allowDemoLogin',
}

export async function getSetting(key, fallback = '') {
  const row = await prisma.appSetting.findUnique({ where: { key } })
  return row?.value ?? fallback
}

export async function setSetting(key, value, updatedBy = null) {
  return prisma.appSetting.upsert({
    where: { key },
    create: { key, value: String(value ?? ''), updatedBy },
    update: { value: String(value ?? ''), updatedBy },
  })
}

export async function getGoogleConfig() {
  const [clientId, clientSecret, callbackUrl, wizardDone] = await Promise.all([
    getSetting(KEYS.googleClientId, env.google.clientId),
    getSetting(KEYS.googleClientSecret, env.google.clientSecret),
    getSetting(
      KEYS.googleCallbackUrl,
      env.google.callbackUrl || `${env.clientUrl}/api/auth/google/callback`,
    ),
    getSetting(KEYS.googleWizardDone, 'false'),
  ])

  return {
    clientId: clientId?.trim() || '',
    clientSecret: clientSecret?.trim() || '',
    callbackUrl:
      callbackUrl?.trim() || `${env.clientUrl}/api/auth/google/callback`,
    configured: Boolean(clientId?.trim() && clientSecret?.trim()),
    wizardDone: wizardDone === 'true',
  }
}

export async function saveGoogleConfig(data, updatedBy) {
  if (data.clientId !== undefined) {
    await setSetting(KEYS.googleClientId, data.clientId, updatedBy)
  }
  if (data.clientSecret !== undefined && data.clientSecret !== '') {
    await setSetting(KEYS.googleClientSecret, data.clientSecret, updatedBy)
  }
  if (data.callbackUrl !== undefined) {
    await setSetting(KEYS.googleCallbackUrl, data.callbackUrl, updatedBy)
  }
  if (data.wizardDone !== undefined) {
    await setSetting(
      KEYS.googleWizardDone,
      data.wizardDone ? 'true' : 'false',
      updatedBy,
    )
  }
  return getGoogleConfig()
}

export async function getPublicAuthFlags() {
  const google = await getGoogleConfig()
  const allowDemo =
    (await getSetting(KEYS.allowDemoLogin, '')) === 'true' ||
    env.nodeEnv !== 'production' ||
    process.env.ALLOW_DEMO_LOGIN === 'true'

  return {
    googleConfigured: google.configured,
    googleWizardDone: google.wizardDone,
    devLogin: allowDemo,
    callbackUrl: google.callbackUrl,
  }
}

export async function getAdminSettingsOverview() {
  const google = await getGoogleConfig()
  return {
    google: {
      clientId: google.clientId,
      // Nunca devolver el secret completo
      clientSecretSet: Boolean(google.clientSecret),
      callbackUrl: google.callbackUrl,
      configured: google.configured,
      wizardDone: google.wizardDone,
    },
    app: {
      clientUrl: env.clientUrl,
      nodeEnv: env.nodeEnv,
    },
  }
}

export { KEYS }
