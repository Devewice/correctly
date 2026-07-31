import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'
import { dayBounds, toDateKey } from '../utils/dates.js'
import { XP } from '../utils/xp.js'
import { afterLog } from '../utils/progress.js'

const router = Router()
router.use(requireAuth)

const mealSchema = z.object({
  type: z.enum([
    'breakfast',
    'mid_morning',
    'lunch',
    'snack',
    'dinner',
    'night_snack',
  ]),
  description: z.string().max(500).optional(),
  loggedAt: z.string().datetime().optional(),
  satisfaction: z.number().int().min(1).max(5).optional(),
  quality: z.number().int().min(1).max(5).optional(),
  calories: z.number().int().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
})

router.get('/', async (req, res) => {
  const date = typeof req.query.date === 'string' ? req.query.date : toDateKey()
  const { start, end } = dayBounds(date)
  const meals = await prisma.mealLog.findMany({
    where: { userId: req.user.id, loggedAt: { gte: start, lte: end } },
    orderBy: { loggedAt: 'asc' },
  })
  res.json({ date, meals })
})

router.post('/', async (req, res) => {
  const data = mealSchema.parse(req.body)
  const meal = await prisma.mealLog.create({
    data: {
      userId: req.user.id,
      type: data.type,
      description: data.description,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
      satisfaction: data.satisfaction,
      quality: data.quality,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      tags: data.tags || [],
      notes: data.notes,
    },
  })
  await afterLog(prisma, req.user.id, XP.meal)
  res.status(201).json({ meal })
})

router.put('/:id', async (req, res) => {
  const data = mealSchema.partial().parse(req.body)
  const existing = await prisma.mealLog.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  })
  if (!existing) return res.status(404).json({ error: 'Not found' })

  const meal = await prisma.mealLog.update({
    where: { id: existing.id },
    data: {
      ...data,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : undefined,
      tags: data.tags,
    },
  })
  res.json({ meal })
})

router.delete('/:id', async (req, res) => {
  const existing = await prisma.mealLog.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  })
  if (!existing) return res.status(404).json({ error: 'Not found' })
  await prisma.mealLog.delete({ where: { id: existing.id } })
  res.json({ ok: true })
})

export default router
