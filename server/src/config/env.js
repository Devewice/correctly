import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverEnv = path.resolve(__dirname, '../../.env')
const rootEnv = path.resolve(__dirname, '../../../.env')

dotenv.config({ path: serverEnv })
dotenv.config({ path: rootEnv, override: false })

export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:3000/api/auth/google/callback',
  },
  databaseUrl: process.env.DATABASE_URL || '',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
}

export const isGoogleAuthConfigured = () =>
  Boolean(env.google.clientId && env.google.clientSecret)
