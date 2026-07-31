import { Router } from 'express'
import { prisma } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'
import { dayBoundsInTz, toDateKey, toDateKeyInTz } from '../utils/dates.js'

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

const DEFAULT_MODULES = ['meals', 'water', 'mood', 'sleep', 'habits']

function userModules(user) {
  const raw = user?.activeModules
  if (Array.isArray(raw) && raw.length) return raw
  return DEFAULT_MODULES
}

function userDay(req) {
  const tz = req.user.timezone || 'America/Bogota'
  const date =
    typeof req.query.date === 'string' ? req.query.date : toDateKeyInTz(tz)
  const { start, end } = dayBoundsInTz(date, tz)
  return { date, start, end, tz }
}

router.get('/today', async (req, res) => {
  const { date, start, end } = userDay(req)
  const userId = req.user.id
  const modules = userModules(req.user)

  const [
    meals,
    waterLogs,
    moodLogs,
    sleepLogs,
    activities,
    habits,
    journal,
    meditations,
  ] = await Promise.all([
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
    prisma.meditationLog.findMany({
      where: { userId, loggedAt: { gte: start, lte: end } },
    }),
  ])

  const waterMl = waterLogs.reduce((s, l) => s + l.amount, 0)
  const mealTypesDone = new Set(meals.map((m) => m.type))
  const habitsDone = habits.filter((h) =>
    h.completions.some((c) => c.completed),
  ).length
  const meditationMin = meditations.reduce((s, m) => s + m.duration, 0)

  const checks = []
  if (modules.includes('meals')) {
    checks.push(
      mealTypesDone.has('breakfast') ||
        mealTypesDone.has('lunch') ||
        mealTypesDone.has('dinner') ||
        meals.length > 0,
    )
  }
  if (modules.includes('water')) checks.push(waterMl >= 500)
  if (modules.includes('mood')) checks.push(moodLogs.length > 0)
  if (modules.includes('habits')) {
    checks.push(habits.length === 0 ? true : habitsDone > 0)
  }
  if (modules.includes('sleep')) checks.push(sleepLogs.length > 0)
  if (modules.includes('activity')) checks.push(activities.length > 0)
  if (modules.includes('meditation')) checks.push(meditationMin > 0)
  if (modules.includes('journal')) checks.push(journal.length > 0)

  if (!checks.length) checks.push(true)
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
      meditationMin,
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
  const { date, start, end } = userDay(req)
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

router.get('/weekly', async (req, res) => {
  const userId = req.user.id
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const start = new Date(end)
  start.setDate(start.getDate() - 6)
  start.setHours(0, 0, 0, 0)

  const [meals, waterLogs, moodLogs, sleepLogs, meditations, activities] =
    await Promise.all([
      prisma.mealLog.findMany({
        where: { userId, loggedAt: { gte: start, lte: end } },
        select: { loggedAt: true, type: true },
      }),
      prisma.waterLog.findMany({
        where: { userId, loggedAt: { gte: start, lte: end } },
        select: { loggedAt: true, amount: true },
      }),
      prisma.moodLog.findMany({
        where: { userId, loggedAt: { gte: start, lte: end } },
        select: { loggedAt: true, mood: true },
      }),
      prisma.sleepLog.findMany({
        where: { userId, bedTime: { gte: start, lte: end } },
        select: { bedTime: true, durationMin: true, quality: true },
      }),
      prisma.meditationLog.findMany({
        where: { userId, loggedAt: { gte: start, lte: end } },
        select: { loggedAt: true, duration: true },
      }),
      prisma.activityLog.findMany({
        where: { userId, loggedAt: { gte: start, lte: end } },
        select: { loggedAt: true, duration: true },
      }),
    ])

  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const key = toDateKey(d)
    const dayWater = waterLogs
      .filter((l) => toDateKey(l.loggedAt) === key)
      .reduce((s, l) => s + l.amount, 0)
    const dayMoods = moodLogs.filter((l) => toDateKey(l.loggedAt) === key)
    const avgMood = dayMoods.length
      ? dayMoods.reduce((s, m) => s + m.mood, 0) / dayMoods.length
      : null
    const daySleep = sleepLogs.find((l) => toDateKey(l.bedTime) === key)
    days.push({
      date: key,
      meals: meals.filter((m) => toDateKey(m.loggedAt) === key).length,
      waterMl: dayWater,
      avgMood,
      sleepMin: daySleep?.durationMin || null,
      sleepQuality: daySleep?.quality || null,
      meditationMin: meditations
        .filter((m) => toDateKey(m.loggedAt) === key)
        .reduce((s, m) => s + m.duration, 0),
      activityMin: activities
        .filter((a) => toDateKey(a.loggedAt) === key)
        .reduce((s, a) => s + a.duration, 0),
    })
  }

  const avg = (arr) =>
    arr.length ? Math.round((arr.reduce((s, n) => s + n, 0) / arr.length) * 10) / 10 : null

  res.json({
    from: toDateKey(start),
    to: toDateKey(end),
    days,
    totals: {
      meals: meals.length,
      waterMl: waterLogs.reduce((s, l) => s + l.amount, 0),
      avgMood: avg(moodLogs.map((m) => m.mood)),
      avgSleepMin: avg(sleepLogs.map((s) => s.durationMin).filter(Boolean)),
      meditationMin: meditations.reduce((s, m) => s + m.duration, 0),
      activityMin: activities.reduce((s, a) => s + a.duration, 0),
    },
    stats: req.user.stats,
  })
})

export default router
