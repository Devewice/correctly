import { toDateKey } from './dates.js'
import { XP, addXp, levelFromXp } from './xp.js'

const BADGES = [
  {
    id: 'first_step',
    check: async () => true, // awarded on first activity via unlocked check
  },
  {
    id: 'water_week',
    check: async (prisma, userId) => {
      const since = new Date()
      since.setDate(since.getDate() - 6)
      since.setHours(0, 0, 0, 0)
      const logs = await prisma.waterLog.findMany({
        where: { userId, loggedAt: { gte: since } },
        select: { loggedAt: true, amount: true },
      })
      const byDay = {}
      for (const l of logs) {
        const k = toDateKey(l.loggedAt)
        byDay[k] = (byDay[k] || 0) + l.amount
      }
      return Object.values(byDay).filter((ml) => ml >= 2000).length >= 7
    },
  },
  {
    id: 'streak_7',
    check: async (_p, _u, stats) => (stats?.currentStreak || 0) >= 7,
  },
  {
    id: 'streak_30',
    check: async (_p, _u, stats) => (stats?.currentStreak || 0) >= 30,
  },
  {
    id: 'zen_10',
    check: async (prisma, userId) =>
      (await prisma.meditationLog.count({ where: { userId } })) >= 10,
  },
  {
    id: 'home_chef',
    check: async (prisma, userId) => {
      const meals = await prisma.mealLog.findMany({
        where: { userId },
        select: { tags: true },
      })
      return meals.filter((m) => Array.isArray(m.tags) && m.tags.includes('homemade')).length >= 10
    },
  },
  {
    id: 'early_bird',
    check: async (prisma, userId) => {
      const meals = await prisma.mealLog.findMany({
        where: { userId, type: 'breakfast' },
        select: { loggedAt: true },
      })
      const early = meals.filter((m) => m.loggedAt.getHours() < 8).length
      return early >= 7
    },
  },
]

function yesterdayKey(dateKey) {
  const d = new Date(`${dateKey}T12:00:00`)
  d.setDate(d.getDate() - 1)
  return toDateKey(d)
}

/** Semana ISO YYYY-Www — un día de gracia por semana */
function isoWeekKey(dateKey) {
  const d = new Date(`${dateKey}T12:00:00`)
  const day = d.getDay() || 7
  d.setDate(d.getDate() + 4 - day)
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}

async function ensureWeeklyFreeze(prisma, userId, dateKey, stats) {
  const weekKey = `freeze_week_${isoWeekKey(dateKey)}`
  const already = await prisma.achievement.findUnique({
    where: { userId_badgeId: { userId, badgeId: weekKey } },
  })
  if (already) return stats
  await prisma.achievement.create({ data: { userId, badgeId: weekKey } })
  return prisma.userStats.update({
    where: { userId },
    data: {
      streakFreezesRemaining: Math.max(1, stats.streakFreezesRemaining || 0),
    },
  })
}

export async function touchStreak(prisma, userId, dateKey = toDateKey()) {
  let stats = await prisma.userStats.upsert({
    where: { userId },
    create: {
      userId,
      currentStreak: 1,
      bestStreak: 1,
      streakFreezesRemaining: 1,
      lastLogDate: dateKey,
    },
    update: {},
  })

  stats = await ensureWeeklyFreeze(prisma, userId, dateKey, stats)

  if (stats.lastLogDate === dateKey) {
    return stats
  }

  let currentStreak = 1
  let freezes = stats.streakFreezesRemaining || 0
  if (stats.lastLogDate === yesterdayKey(dateKey)) {
    currentStreak = (stats.currentStreak || 0) + 1
  } else if (freezes > 0 && stats.lastLogDate) {
    const gapYesterday = yesterdayKey(yesterdayKey(dateKey))
    if (stats.lastLogDate === gapYesterday) {
      currentStreak = (stats.currentStreak || 0) + 1
      freezes -= 1
    }
  }

  const bestStreak = Math.max(stats.bestStreak || 0, currentStreak)
  return prisma.userStats.update({
    where: { userId },
    data: {
      currentStreak,
      bestStreak,
      lastLogDate: dateKey,
      streakFreezesRemaining: freezes,
    },
  })
}

export async function unlockBadges(prisma, userId) {
  const stats = await prisma.userStats.findUnique({ where: { userId } })
  const existing = await prisma.achievement.findMany({
    where: { userId },
    select: { badgeId: true },
  })
  const have = new Set(existing.map((a) => a.badgeId))
  const unlocked = []

  // Always unlock first_step if they have any XP or logs
  if (!have.has('first_step') && (stats?.totalXP || 0) > 0) {
    await prisma.achievement.create({
      data: { userId, badgeId: 'first_step' },
    })
    unlocked.push('first_step')
    have.add('first_step')
  }

  for (const badge of BADGES) {
    if (badge.id === 'first_step' || have.has(badge.id)) continue
    const ok = await badge.check(prisma, userId, stats)
    if (ok) {
      await prisma.achievement.create({
        data: { userId, badgeId: badge.id },
      })
      unlocked.push(badge.id)
    }
  }

  return unlocked
}

export async function afterLog(prisma, userId, xpAmount, dateKey = toDateKey()) {
  await addXp(prisma, userId, xpAmount)
  const stats = await touchStreak(prisma, userId, dateKey)
  const badges = await unlockBadges(prisma, userId)

  // Soft day-complete bonus once per day when progress looks solid
  // (checked lightly via water+meal+mood counts)
  const start = new Date(`${dateKey}T00:00:00.000`)
  const end = new Date(`${dateKey}T23:59:59.999`)
  const [meals, water, moods] = await Promise.all([
    prisma.mealLog.count({ where: { userId, loggedAt: { gte: start, lte: end } } }),
    prisma.waterLog.aggregate({
      where: { userId, loggedAt: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    prisma.moodLog.count({ where: { userId, loggedAt: { gte: start, lte: end } } }),
  ])

  let dayBonus = false
  if (meals >= 2 && (water._sum.amount || 0) >= 1500 && moods >= 1) {
    const key = `day_bonus_${dateKey}`
    const already = await prisma.achievement.findUnique({
      where: { userId_badgeId: { userId, badgeId: key } },
    })
    if (!already) {
      await prisma.achievement.create({ data: { userId, badgeId: key } })
      await addXp(prisma, userId, XP.dayComplete)
      dayBonus = true
    }
  }

  const fresh = await prisma.userStats.findUnique({ where: { userId } })
  if (fresh) {
    const level = levelFromXp(fresh.totalXP)
    if (level !== fresh.level) {
      await prisma.userStats.update({ where: { userId }, data: { level } })
    }
  }

  return { stats, badges, dayBonus }
}

export { BADGES }
