import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverEnv = path.resolve(__dirname, '../../.env')
const rootEnv = path.resolve(__dirname, '../../../.env')

dotenv.config({ path: serverEnv })
dotenv.config({ path: rootEnv, override: false })

/** Build MySQL URL from Hostinger panel vars if DATABASE_URL is missing/placeholder */
function resolveDatabaseUrl() {
  const raw = process.env.DATABASE_URL || ''
  const looksPlaceholder =
    !raw ||
    raw.includes(':PASSWORD@') ||
    raw.includes('PASSWORD@') ||
    raw.includes('TU_PASSWORD')

  if (!looksPlaceholder) return raw

  const user = process.env.DATABASE_USER
  const password = process.env.DATABASE_PASSWORD
  const host = process.env.DATABASE_HOST
  const port = process.env.DATABASE_PORT || '3306'
  const name = process.env.DATABASE_NAME

  if (user && password && host && name) {
    return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${name}`
  }

  return raw
}

/**
 * En Hostinger, desde la misma cuenta MySQL suele ser localhost.
 * Si DATABASE_HOST_REMOTE=true se respeta el host remoto del panel.
 */
function preferLocalMysqlHost(url) {
  if (!url || process.env.DATABASE_HOST_REMOTE === 'true') return url
  if (process.env.DATABASE_USE_LOCALHOST === 'false') return url
  // Solo reescribir hosts típicos de Hostinger cuando corremos en producción
  if (process.env.NODE_ENV !== 'production') return url
  try {
    const u = new URL(url)
    if (u.hostname.includes('hstgr.io') || u.hostname.startsWith('srv')) {
      u.hostname = 'localhost'
      console.log('[db] Usando localhost para MySQL (mismo hosting Hostinger)')
      return u.toString()
    }
  } catch {
    /* ignore */
  }
  return url
}

const databaseUrl = preferLocalMysqlHost(resolveDatabaseUrl())
if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl
}

export const env = {
  // Hostinger injects PORT — do NOT force 3000 in production panel
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
  isProd: (process.env.NODE_ENV || 'development') === 'production',
}

export const isGoogleAuthConfigured = () =>
  Boolean(env.google.clientId && env.google.clientSecret)
