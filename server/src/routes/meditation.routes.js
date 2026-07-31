import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'
import { dayBounds, toDateKey } from '../utils/dates.js'
import { afterLog } from '../utils/progress.js'
import { XP } from '../utils/xp.js'

const router = Router()
router.use(requireAuth)

const schema = z.object({
  duration: z.number().int().min(1).max(180),
  type: z.enum(['free', 'breathing', 'body_scan', 'gratitude']).optional(),
  feeling: z.enum(['calmer', 'same', 'restless']).optional(),
  loggedAt: z.string().datetime().optional(),
})

router.get('/', async (req, res) => {
  const date = typeof req.query.date === 'string' ? req.query.date : toDateKey()
  const { start, end } = dayBounds(date)
  const logs = await prisma.meditationLog.findMany({
    where: { userId: req.user.id, loggedAt: { gte: start, lte: end } },
    orderBy: { loggedAt: 'desc' },
  })
  const totalMin = logs.reduce((s, l) => s + l.duration, 0)
  res.json({ date, totalMin, logs })
})

router.post('/', async (req, res) => {
  const data = schema.parse(req.body)
  const log = await prisma.meditationLog.create({
    data: {
      userId: req.user.id,
      duration: data.duration,
      type: data.type || 'free',
      feeling: data.feeling,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
    },
  })
  const progress = await afterLog(prisma, req.user.id, XP.meditation)
  res.status(201).json({ log, progress })
})

export default router
