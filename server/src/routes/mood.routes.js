import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'
import { dayBounds, toDateKey } from '../utils/dates.js'
import { XP } from '../utils/xp.js'
import { afterLog } from '../utils/progress.js'

const router = Router()
router.use(requireAuth)

const schema = z.object({
  mood: z.number().int().min(1).max(5),
  energy: z.enum(['low', 'medium', 'high']).optional(),
  stress: z.enum(['low', 'medium', 'high']).optional(),
  period: z.enum(['morning', 'afternoon', 'evening']).optional(),
  activities: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
  loggedAt: z.string().datetime().optional(),
})

router.get('/', async (req, res) => {
  const date = typeof req.query.date === 'string' ? req.query.date : toDateKey()
  const { start, end } = dayBounds(date)
  const logs = await prisma.moodLog.findMany({
    where: { userId: req.user.id, loggedAt: { gte: start, lte: end } },
    orderBy: { loggedAt: 'desc' },
  })
  res.json({ date, logs })
})

router.post('/', async (req, res) => {
  const data = schema.parse(req.body)
  const log = await prisma.moodLog.create({
    data: {
      userId: req.user.id,
      mood: data.mood,
      energy: data.energy,
      stress: data.stress,
      period: data.period,
      activities: data.activities || [],
      notes: data.notes,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
    },
  })
  await afterLog(prisma, req.user.id, XP.mood)
  res.status(201).json({ log })
})

export default router
