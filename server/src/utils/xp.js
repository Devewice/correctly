export const XP = {
  meal: 10,
  mood: 10,
  sleep: 10,
  water: 5,
  habit: 15,
  activity: 15,
  meditation: 20,
  journal: 10,
  dayComplete: 50,
}

export function levelFromXp(totalXP) {
  // Soft curve: ~100 XP per early level
  return Math.max(1, Math.floor(Math.sqrt(totalXP / 50)) + 1)
}

export async function addXp(prisma, userId, amount) {
  const stats = await prisma.userStats.upsert({
    where: { userId },
    create: { userId, totalXP: amount, level: levelFromXp(amount) },
    update: { totalXP: { increment: amount } },
  })
  const level = levelFromXp(stats.totalXP)
  if (level !== stats.level) {
    return prisma.userStats.update({
      where: { userId },
      data: { level },
    })
  }
  return stats
}
