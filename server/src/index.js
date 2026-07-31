import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { env } from './config/env.js'
import { checkDatabase, prisma } from './config/database.js'
import { configurePassport } from './config/passport.js'
import { errorHandler } from './middleware/error.js'

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import mealsRoutes from './routes/meals.routes.js'
import waterRoutes from './routes/water.routes.js'
import moodRoutes from './routes/mood.routes.js'
import sleepRoutes from './routes/sleep.routes.js'
import habitsRoutes from './routes/habits.routes.js'
import activitiesRoutes from './routes/activities.routes.js'
import journalRoutes from './routes/journal.routes.js'
import meditationRoutes from './routes/meditation.routes.js'
import weightRoutes from './routes/weight.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDistCandidates = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), 'dist'),
]
const clientDist = clientDistCandidates.find((p) => existsSync(path.join(p, 'index.html')))

configurePassport()

const app = express()

app.set('trust proxy', 1)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  }),
)

const allowedOrigins = new Set(
  [env.clientUrl, 'http://localhost:5173', 'http://localhost:3000']
    .filter(Boolean)
    .map((o) => o.replace(/\/$/, '')),
)

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.has(origin.replace(/\/$/, '')) || env.isProd) {
        return cb(null, true)
      }
      return cb(null, false)
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(passport.initialize())
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)

app.get('/api/health', async (_req, res) => {
  try {
    await checkDatabase()
    res.json({ ok: true, db: 'up', name: 'correctly' })
  } catch (err) {
    res.status(503).json({ ok: false, db: 'down', error: err.message })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/meals', mealsRoutes)
app.use('/api/water', waterRoutes)
app.use('/api/mood', moodRoutes)
app.use('/api/sleep', sleepRoutes)
app.use('/api/habits', habitsRoutes)
app.use('/api/activities', activitiesRoutes)
app.use('/api/journal', journalRoutes)
app.use('/api/meditation', meditationRoutes)
app.use('/api/weight', weightRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Hostinger / production: serve Vue build from the same Node process
if (clientDist) {
  app.use(express.static(clientDist, { index: false, maxAge: '1h' }))
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
} else if (env.isProd) {
  console.warn('[correctly] No se encontró client/dist/index.html — solo API')
  console.warn('[correctly] Candidatos:', clientDistCandidates.join(' | '))
}

app.use(errorHandler)

const server = app.listen(env.port, '0.0.0.0', () => {
  console.log(`Correctly → port ${env.port} (${env.nodeEnv}) cwd=${process.cwd()}`)
  console.log(`Static UI → ${clientDist || 'NONE'}`)
  console.log(`DB URL set → ${Boolean(env.databaseUrl)}`)
})

async function shutdown() {
  await prisma.$disconnect()
  server.close(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
