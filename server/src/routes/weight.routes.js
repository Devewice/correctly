import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

const schema = z.object({
  weight: z.number().positive().max(500),
  unit: z.enum(['kg', 'lb']).optional(),
  notes: z.string().max(1000).optional(),
  loggedAt: z.string().datetime().optional(),
})

router.get('/', async (req, res) => {
  const take = Math.min(Number(req.query.take) || 30, 100)
  const logs = await prisma.weightLog.findMany({
    where: { userId: req.user.id },
    orderBy: { loggedAt: 'desc' },
    take,
  })
  res.json({ logs })
})

router.post('/', async (req, res) => {
  const data = schema.parse(req.body)
  const log = await prisma.weightLog.create({
    data: {
      userId: req.user.id,
      weight: data.weight,
      unit: data.unit || 'kg',
      notes: data.notes,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
    },
  })
  res.status(201).json({ log })
})

export default router
