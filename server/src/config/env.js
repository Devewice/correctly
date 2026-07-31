import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverEnv = path.resolve(__dirname, '../../.env')
const rootEnv = path.resolve(__dirname, '../../../.env')

dotenv.config({ path: serverEnv })
dotenv.config({ path: rootEnv, override: false })

/**
 * Hostinger a menudo corta variables con `&` o `;`.
 * Usa DATABASE_PASSWORD_B64 (base64) para evitarlo.
 */
function resolvePassword() {
  const b64 = process.env.DATABASE_PASSWORD_B64?.trim()
  if (b64) {
    try {
      return Buffer.from(b64, 'base64').toString('utf8')
    } catch {
      console.warn('[db] DATABASE_PASSWORD_B64 inválido')
    }
  }
  return process.env.DATABASE_PASSWORD || ''
}

function resolveDatabaseUrl() {
  const user = process.env.DATABASE_USER
  const password = resolvePassword()
  const host =
    process.env.DATABASE_HOST ||
    (process.env.NODE_ENV === 'production' ? 'localhost' : '127.0.0.1')
  const port = process.env.DATABASE_PORT || '3306'
  const name = process.env.DATABASE_NAME

  // Si hay piezas sueltas, reconstruir siempre (evita URL truncada en el panel)
  if (user && password && host && name) {
    const url = `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${name}`
    console.log(
      `[db] URL reconstruida → user=${user} host=${host} db=${name} passLen=${password.length}`,
    )
    return url
  }

  const raw = process.env.DATABASE_URL || ''
  const looksPlaceholder =
    !raw ||
    raw.includes(':PASSWORD@') ||
    raw.includes('PASSWORD_ENCODED') ||
    raw.includes('TU_PASSWORD')

  return looksPlaceholder ? '' : raw
}

const resolvedPassword = resolvePassword()
const databaseUrl = resolveDatabaseUrl()
if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl
}

export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').replace(
    /\/$/,
    '',
  ),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      `${(process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '')}/api/auth/google/callback`,
  },
  databaseUrl,
  dbMeta: {
    host: process.env.DATABASE_HOST || null,
    name: process.env.DATABASE_NAME || null,
    user: process.env.DATABASE_USER || null,
    passLen: resolvedPassword.length,
    usedB64: Boolean(process.env.DATABASE_PASSWORD_B64?.trim()),
  },
  isProd: (process.env.NODE_ENV || 'development') === 'production',
}

/** @deprecated usar services/settings getGoogleConfig / passport.isGoogleAuthConfigured */
export const isGoogleAuthConfigured = () =>
  Boolean(env.google.clientId && env.google.clientSecret)
