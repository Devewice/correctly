import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

const profileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  timezone: z.string().max(80).optional(),
  language: z.enum(['es', 'en', 'pt']).optional(),
  units: z.enum(['metric', 'imperial']).optional(),
  wakeTime: z.string().max(5).nullable().optional(),
  sleepTime: z.string().max(5).nullable().optional(),
  mainGoal: z.string().max(200).nullable().optional(),
  activeModules: z.array(z.string()).optional(),
})

const onboardingSchema = z.object({
  language: z.enum(['es', 'en', 'pt']).optional(),
  mainGoal: z.string().max(200).optional(),
  wakeTime: z.string().max(5).optional(),
  sleepTime: z.string().max(5).optional(),
  activeModules: z.array(z.string()).min(1),
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
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...data,
      activeModules: data.activeModules ?? undefined,
    },
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
        mainGoal: data.mainGoal,
        wakeTime: data.wakeTime,
        sleepTime: data.sleepTime,
        activeModules: data.activeModules,
        onboardingCompleted: true,
      },
      include: { stats: true },
    })

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

    return updated
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

export default router
