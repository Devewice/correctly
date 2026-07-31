import { Router } from 'express'
import { prisma } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'
import { dayBounds, toDateKey } from '../utils/dates.js'

const router = Router()
router.use(requireAuth)

const MEAL_SLOTS = [
  'breakfast',
  'mid_morning',
  'lunch',
  'snack',
  'dinner',
  'night_snack',
]

router.get('/today', async (req, res) => {
  const date = typeof req.query.date === 'string' ? req.query.date : toDateKey()
  const { start, end } = dayBounds(date)
  const userId = req.user.id

  const [meals, waterLogs, moodLogs, sleepLogs, activities, habits, journal] =
    await Promise.all([
      prisma.mealLog.findMany({
        where: { userId, loggedAt: { gte: start, lte: end } },
        orderBy: { loggedAt: 'asc' },
      }),
      prisma.waterLog.findMany({
        where: { userId, loggedAt: { gte: start, lte: end } },
      }),
      prisma.moodLog.findMany({
        where: { userId, loggedAt: { gte: start, lte: end } },
        orderBy: { loggedAt: 'desc' },
      }),
      prisma.sleepLog.findMany({
        where: {
          userId,
          OR: [
            { bedTime: { gte: start, lte: end } },
            { wakeTime: { gte: start, lte: end } },
          ],
        },
        orderBy: { bedTime: 'desc' },
        take: 1,
      }),
      prisma.activityLog.findMany({
        where: { userId, loggedAt: { gte: start, lte: end } },
      }),
      prisma.habitDefinition.findMany({
        where: { userId, active: true },
        include: { completions: { where: { date } } },
      }),
      prisma.journalEntry.findMany({
        where: { userId, loggedAt: { gte: start, lte: end } },
        take: 3,
      }),
    ])

  const waterMl = waterLogs.reduce((s, l) => s + l.amount, 0)
  const mealTypesDone = new Set(meals.map((m) => m.type))
  const habitsDone = habits.filter(
    (h) => h.completions.some((c) => c.completed),
  ).length

  const checks = [
    mealTypesDone.has('breakfast'),
    mealTypesDone.has('lunch'),
    mealTypesDone.has('dinner'),
    waterMl >= 500,
    moodLogs.length > 0,
    habits.length === 0 ? true : habitsDone > 0,
  ]
  const done = checks.filter(Boolean).length
  const progress = Math.round((done / checks.length) * 100)

  res.json({
    date,
    progress,
    stats: req.user.stats,
    summary: {
      mealsCount: meals.length,
      mealSlotsDone: MEAL_SLOTS.filter((t) => mealTypesDone.has(t)).length,
      waterMl,
      waterGoalMl: 2000,
      latestMood: moodLogs[0] || null,
      sleep: sleepLogs[0] || null,
      activitiesCount: activities.length,
      habitsDone,
      habitsTotal: habits.length,
      journalCount: journal.length,
    },
    meals,
    habits: habits.map((h) => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      color: h.color,
      completedToday: h.completions.some((c) => c.completed),
    })),
  })
})

router.get('/timeline', async (req, res) => {
  const date = typeof req.query.date === 'string' ? req.query.date : toDateKey()
  const { start, end } = dayBounds(date)
  const userId = req.user.id

  const [meals, waterLogs, moodLogs, activities, sleepLogs] = await Promise.all([
    prisma.mealLog.findMany({
      where: { userId, loggedAt: { gte: start, lte: end } },
    }),
    prisma.waterLog.findMany({
      where: { userId, loggedAt: { gte: start, lte: end } },
    }),
    prisma.moodLog.findMany({
      where: { userId, loggedAt: { gte: start, lte: end } },
    }),
    prisma.activityLog.findMany({
      where: { userId, loggedAt: { gte: start, lte: end } },
    }),
    prisma.sleepLog.findMany({
      where: {
        userId,
        OR: [
          { bedTime: { gte: start, lte: end } },
          { wakeTime: { gte: start, lte: end } },
        ],
      },
    }),
  ])

  const items = [
    ...meals.map((m) => ({
      kind: 'meal',
      id: m.id,
      at: m.loggedAt,
      title: m.type,
      detail: m.description,
    })),
    ...waterLogs.map((w) => ({
      kind: 'water',
      id: w.id,
      at: w.loggedAt,
      title: 'water',
      detail: `${w.amount} ml`,
    })),
    ...moodLogs.map((m) => ({
      kind: 'mood',
      id: m.id,
      at: m.loggedAt,
      title: 'mood',
      detail: String(m.mood),
    })),
    ...activities.map((a) => ({
      kind: 'activity',
      id: a.id,
      at: a.loggedAt,
      title: a.type,
      detail: `${a.duration} min`,
    })),
    ...sleepLogs.map((s) => ({
      kind: 'sleep',
      id: s.id,
      at: s.bedTime,
      title: 'sleep',
      detail: s.durationMin ? `${s.durationMin} min` : null,
    })),
  ].sort((a, b) => new Date(a.at) - new Date(b.at))

  res.json({ date, items })
})

router.get('/insights', async (req, res) => {
  // Lightweight starter insights — expand later with correlations
  const stats = req.user.stats
  const insights = []

  if (stats?.currentStreak >= 3) {
    insights.push({
      id: 'streak',
      type: 'streak',
      messageKey: 'insights.streak',
      params: { days: stats.currentStreak },
    })
  } else {
    insights.push({
      id: 'welcome',
      type: 'tip',
      messageKey: 'insights.welcome',
      params: {},
    })
  }

  if ((stats?.totalXP || 0) < 50) {
    insights.push({
      id: 'log_meal',
      type: 'tip',
      messageKey: 'insights.logMeal',
      params: {},
    })
  }

  res.json({ insights })
})

export default router
