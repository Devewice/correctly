import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'
import { dayBounds, toDateKey } from '../utils/dates.js'
import { addXp, XP } from '../utils/xp.js'

const router = Router()
router.use(requireAuth)

const schema = z.object({
  amount: z.number().int().min(1).max(5000),
  beverageType: z.string().max(40).optional(),
  loggedAt: z.string().datetime().optional(),
})

router.get('/', async (req, res) => {
  const date = typeof req.query.date === 'string' ? req.query.date : toDateKey()
  const { start, end } = dayBounds(date)
  const logs = await prisma.waterLog.findMany({
    where: { userId: req.user.id, loggedAt: { gte: start, lte: end } },
    orderBy: { loggedAt: 'asc' },
  })
  const totalMl = logs.reduce((sum, l) => sum + l.amount, 0)
  res.json({ date, totalMl, logs })
})

router.post('/', async (req, res) => {
  const data = schema.parse(req.body)
  const log = await prisma.waterLog.create({
    data: {
      userId: req.user.id,
      amount: data.amount,
      beverageType: data.beverageType || 'water',
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
    },
  })
  await addXp(prisma, req.user.id, XP.water)
  res.status(201).json({ log })
})

export default router
