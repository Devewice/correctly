import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

const hm = z.string().regex(/^\d{2}:\d{2}$/)

const mealTimesSchema = z
  .object({
    breakfast: hm.optional(),
    lunch: hm.optional(),
    dinner: hm.optional(),
  })
  .optional()

const profileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  timezone: z.string().max(80).optional(),
  language: z.enum(['es', 'en', 'pt']).optional(),
  units: z.enum(['metric', 'imperial']).optional(),
  wakeTime: z.string().max(5).nullable().optional(),
  sleepTime: z.string().max(5).nullable().optional(),
  mainGoal: z.string().max(200).nullable().optional(),
  activeModules: z.array(z.string()).optional(),
  mealTimes: mealTimesSchema.nullable().optional(),
})

const onboardingSchema = z.object({
  language: z.enum(['es', 'en', 'pt']).optional(),
  timezone: z.string().max(80).optional(),
  mainGoal: z.string().max(200).optional(),
  wakeTime: z.string().max(5).optional(),
  sleepTime: z.string().max(5).optional(),
  activeModules: z.array(z.string()).min(1),
  mealTimes: mealTimesSchema,
  habits: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        icon: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .optional(),
})

router.get('/profile', (req, res) => {
  res.json({ user: req.user })
})

router.put('/profile', async (req, res) => {
  const data = profileSchema.parse(req.body)
  const { mealTimes, ...rest } = data
  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...rest,
      activeModules: data.activeModules ?? undefined,
    },
  })
  if (mealTimes !== undefined) {
    await prisma.$executeRawUnsafe(
      'UPDATE User SET mealTimes = ? WHERE id = ?',
      mealTimes === null ? null : JSON.stringify(mealTimes),
      req.user.id,
    )
  }
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { stats: true },
  })
  res.json({ user })
})

router.put('/onboarding', async (req, res) => {
  const data = onboardingSchema.parse(req.body)

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: req.user.id },
      data: {
        language: data.language,
        timezone: data.timezone,
        mainGoal: data.mainGoal,
        wakeTime: data.wakeTime,
        sleepTime: data.sleepTime,
        activeModules: data.activeModules,
        onboardingCompleted: true,
      },
      include: { stats: true },
    })

    if (data.mealTimes) {
      await tx.$executeRawUnsafe(
        'UPDATE User SET mealTimes = ? WHERE id = ?',
        JSON.stringify(data.mealTimes),
        req.user.id,
      )
    }

    if (data.habits?.length) {
      await tx.habitDefinition.createMany({
        data: data.habits.map((h) => ({
          userId: req.user.id,
          name: h.name,
          icon: h.icon || '✨',
          color: h.color || '#8BA888',
        })),
      })
    }

    // Releer por si mealTimes se guardó por SQL
    return tx.user.findUnique({
      where: { id: req.user.id },
      include: { stats: true },
    })
  })

  res.json({ user })
})

router.get('/stats', async (req, res) => {
  const stats = await prisma.userStats.findUnique({
    where: { userId: req.user.id },
  })
  res.json({ stats })
})

router.get('/achievements', async (req, res) => {
  const achievements = await prisma.achievement.findMany({
    where: { userId: req.user.id },
    orderBy: { unlockedAt: 'desc' },
  })
  res.json({ achievements })
})

const reminderItem = z.object({
  id: z.string().min(1).max(40),
  type: z.enum(['water', 'mood', 'sleep', 'meals', 'habits', 'summary', 'friends', 'custom']),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  enabled: z.boolean(),
  withSound: z.boolean().optional(),
  label: z.string().max(80).optional().nullable(),
})

const remindersSchema = z.object({
  reminders: z.array(reminderItem).max(24),
})

router.get('/reminders', (req, res) => {
  const list = Array.isArray(req.user.reminders) ? req.user.reminders : []
  res.json({ reminders: list })
})

router.put('/reminders', async (req, res) => {
  const { reminders } = remindersSchema.parse(req.body)
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { reminders },
    include: { stats: true },
  })
  res.json({ reminders: user.reminders, user })
})

export default router
