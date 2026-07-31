import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'
import { dayBounds, toDateKey } from '../utils/dates.js'
import { addXp, XP } from '../utils/xp.js'

const router = Router()
router.use(requireAuth)

const schema = z.object({
  bedTime: z.string().datetime(),
  wakeTime: z.string().datetime().optional().nullable(),
  quality: z.number().int().min(1).max(5).optional(),
  interruptions: z.number().int().min(0).optional(),
  factors: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
})

router.get('/', async (req, res) => {
  const date = typeof req.query.date === 'string' ? req.query.date : toDateKey()
  const { start, end } = dayBounds(date)
  // Sleep that ended (wake) or started (bed) around that day
  const logs = await prisma.sleepLog.findMany({
    where: {
      userId: req.user.id,
      OR: [
        { bedTime: { gte: start, lte: end } },
        { wakeTime: { gte: start, lte: end } },
      ],
    },
    orderBy: { bedTime: 'desc' },
  })
  res.json({ date, logs })
})

router.post('/', async (req, res) => {
  const data = schema.parse(req.body)
  const bedTime = new Date(data.bedTime)
  const wakeTime = data.wakeTime ? new Date(data.wakeTime) : null
  const durationMin =
    wakeTime && wakeTime > bedTime
      ? Math.round((wakeTime - bedTime) / 60000)
      : null

  const log = await prisma.sleepLog.create({
    data: {
      userId: req.user.id,
      bedTime,
      wakeTime,
      durationMin,
      quality: data.quality,
      interruptions: data.interruptions,
      factors: data.factors || [],
      notes: data.notes,
    },
  })
  await addXp(prisma, req.user.id, XP.sleep)
  res.status(201).json({ log })
})

export default router
