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
  content: z.string().min(1).max(10000),
  type: z.enum(['free', 'morning', 'evening']).optional(),
  prompt: z.string().max(255).optional(),
  loggedAt: z.string().datetime().optional(),
})

router.get('/', async (req, res) => {
  const date = typeof req.query.date === 'string' ? req.query.date : toDateKey()
  const { start, end } = dayBounds(date)
  const entries = await prisma.journalEntry.findMany({
    where: { userId: req.user.id, loggedAt: { gte: start, lte: end } },
    orderBy: { loggedAt: 'desc' },
  })
  res.json({ date, entries })
})

router.post('/', async (req, res) => {
  const data = schema.parse(req.body)
  const entry = await prisma.journalEntry.create({
    data: {
      userId: req.user.id,
      content: data.content,
      type: data.type || 'free',
      prompt: data.prompt,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
    },
  })
  await afterLog(prisma, req.user.id, XP.journal)
  res.status(201).json({ entry })
})

export default router
