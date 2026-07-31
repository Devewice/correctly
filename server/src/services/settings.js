import { prisma } from '../config/database.js'
import { env } from '../config/env.js'

const KEYS = {
  googleClientId: 'google.clientId',
  googleClientSecret: 'google.clientSecret',
  googleCallbackUrl: 'google.callbackUrl',
  googleWizardDone: 'google.wizardDone',
  allowDemoLogin: 'auth.allowDemoLogin',
  vapidPublicKey: 'vapid.publicKey',
  vapidPrivateKey: 'vapid.privateKey',
  vapidSubject: 'vapid.subject',
  vapidWizardDone: 'vapid.wizardDone',
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

/**
 * Prioridad: variables de entorno (panel Hostinger) > AppSetting (wizard) > default.
 * Así un redeploy con env correcto no queda tapado por un secret viejo en la DB.
 */
export async function getGoogleConfig() {
  const [dbId, dbSecret, dbCallback, wizardDone] = await Promise.all([
    getSetting(KEYS.googleClientId, ''),
    getSetting(KEYS.googleClientSecret, ''),
    getSetting(KEYS.googleCallbackUrl, ''),
    getSetting(KEYS.googleWizardDone, 'false'),
  ])

  const expected = `${env.clientUrl}/api/auth/google/callback`
  const clientId = (env.google.clientId || dbId || '').trim()
  const clientSecret = (env.google.clientSecret || dbSecret || '').trim()

  let resolved = (env.google.callbackUrl || dbCallback || expected).trim() || expected
  if (
    env.isProd &&
    env.clientUrl &&
    !env.clientUrl.includes('localhost') &&
    /localhost|127\.0\.0\.1/.test(resolved)
  ) {
    resolved = expected
  }

  return {
    clientId,
    clientSecret,
    callbackUrl: resolved,
    configured: Boolean(clientId && clientSecret),
    wizardDone: wizardDone === 'true',
    sources: {
      clientId: env.google.clientId ? 'env' : dbId ? 'db' : 'none',
      clientSecret: env.google.clientSecret ? 'env' : dbSecret ? 'db' : 'none',
      callbackUrl: env.google.callbackUrl ? 'env' : dbCallback ? 'db' : 'default',
    },
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

export async function getVapidConfig() {
  const [publicKey, privateKey, subject, wizardDone] = await Promise.all([
    getSetting(KEYS.vapidPublicKey, env.vapid.publicKey),
    getSetting(KEYS.vapidPrivateKey, env.vapid.privateKey),
    getSetting(KEYS.vapidSubject, env.vapid.subject || 'mailto:admin@jeisson.click'),
    getSetting(KEYS.vapidWizardDone, 'false'),
  ])

  return {
    publicKey: publicKey?.trim() || '',
    privateKey: privateKey?.trim() || '',
    subject: subject?.trim() || 'mailto:admin@jeisson.click',
    configured: Boolean(publicKey?.trim() && privateKey?.trim()),
    wizardDone: wizardDone === 'true',
  }
}

export async function saveVapidConfig(data, updatedBy) {
  if (data.publicKey !== undefined) {
    await setSetting(KEYS.vapidPublicKey, data.publicKey, updatedBy)
  }
  if (data.privateKey !== undefined && data.privateKey !== '') {
    await setSetting(KEYS.vapidPrivateKey, data.privateKey, updatedBy)
  }
  if (data.subject !== undefined) {
    await setSetting(KEYS.vapidSubject, data.subject, updatedBy)
  }
  if (data.wizardDone !== undefined) {
    await setSetting(
      KEYS.vapidWizardDone,
      data.wizardDone ? 'true' : 'false',
      updatedBy,
    )
  }
  return getVapidConfig()
}

export async function getPublicAuthFlags() {
  const google = await getGoogleConfig()

  return {
    googleConfigured: google.configured,
    googleWizardDone: google.wizardDone,
    devLogin: false,
    callbackUrl: google.callbackUrl,
  }
}

export async function getAdminSettingsOverview() {
  const [google, vapid] = await Promise.all([getGoogleConfig(), getVapidConfig()])
  return {
    google: {
      clientId: google.clientId,
      // Nunca devolver el secret completo
      clientSecretSet: Boolean(google.clientSecret),
      clientSecretPreview: google.clientSecret
        ? `${google.clientSecret.slice(0, 8)}…`
        : '',
      callbackUrl: google.callbackUrl,
      configured: google.configured,
      wizardDone: google.wizardDone,
      wizardCompleted: google.wizardDone,
      sources: google.sources,
    },
    vapid: {
      publicKey: vapid.publicKey,
      privateKeySet: Boolean(vapid.privateKey),
      subject: vapid.subject,
      configured: vapid.configured,
      wizardDone: vapid.wizardDone,
      wizardCompleted: vapid.wizardDone,
    },
    app: {
      clientUrl: env.clientUrl,
      nodeEnv: env.nodeEnv,
    },
  }
}

export { KEYS }
