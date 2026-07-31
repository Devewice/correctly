import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'
import { toDateKey } from '../utils/dates.js'
import { addXp, XP } from '../utils/xp.js'

const router = Router()
router.use(requireAuth)

const habitSchema = z.object({
  name: z.string().min(1).max(120),
  icon: z.string().max(40).optional(),
  color: z.string().max(20).optional(),
  frequency: z.enum(['daily', 'custom']).optional(),
  customDays: z.array(z.number().int().min(0).max(6)).optional(),
  reminderTime: z.string().max(5).optional().nullable(),
})

router.get('/', async (req, res) => {
  const date = typeof req.query.date === 'string' ? req.query.date : toDateKey()
  const habits = await prisma.habitDefinition.findMany({
    where: { userId: req.user.id, active: true },
    include: {
      completions: { where: { date } },
    },
    orderBy: { createdAt: 'asc' },
  })
  res.json({
    date,
    habits: habits.map((h) => ({
      ...h,
      completedToday: h.completions.length > 0 && h.completions[0].completed,
      completions: undefined,
    })),
  })
})

router.post('/', async (req, res) => {
  const data = habitSchema.parse(req.body)
  const habit = await prisma.habitDefinition.create({
    data: {
      userId: req.user.id,
      name: data.name,
      icon: data.icon || '✨',
      color: data.color || '#8BA888',
      frequency: data.frequency || 'daily',
      customDays: data.customDays,
      reminderTime: data.reminderTime,
    },
  })
  res.status(201).json({ habit })
})

router.post('/:id/complete', async (req, res) => {
  const date = typeof req.body?.date === 'string' ? req.body.date : toDateKey()
  const habit = await prisma.habitDefinition.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  })
  if (!habit) return res.status(404).json({ error: 'Not found' })

  const completion = await prisma.habitCompletion.upsert({
    where: { habitId_date: { habitId: habit.id, date } },
    create: {
      habitId: habit.id,
      userId: req.user.id,
      date,
      completed: true,
    },
    update: { completed: true, loggedAt: new Date() },
  })
  await addXp(prisma, req.user.id, XP.habit)
  res.json({ completion })
})

router.delete('/:id/complete', async (req, res) => {
  const date = typeof req.query.date === 'string' ? req.query.date : toDateKey()
  const habit = await prisma.habitDefinition.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  })
  if (!habit) return res.status(404).json({ error: 'Not found' })

  await prisma.habitCompletion.deleteMany({
    where: { habitId: habit.id, date },
  })
  res.json({ ok: true })
})

export default router
