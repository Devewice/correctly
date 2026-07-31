import { prisma } from '../config/database.js'
import { deleteUploadFile } from '../utils/uploads.js'

/** Borra shares vencidos (medianoche) y sus archivos */
export async function purgeExpiredShares() {
  const expired = await prisma.dailyShare.findMany({
    where: { expiresAt: { lte: new Date() } },
    select: { id: true, photoUrl: true },
  })
  if (!expired.length) return 0

  for (const row of expired) {
    deleteUploadFile(row.photoUrl)
  }
  await prisma.dailyShare.deleteMany({
    where: { id: { in: expired.map((r) => r.id) } },
  })
  return expired.length
}

export function startFriendsCleanupJob() {
  const run = () => {
    purgeExpiredShares()
      .then((n) => {
        if (n) console.log(`[friends] purged ${n} expired daily shares`)
      })
      .catch((err) => console.warn('[friends] cleanup', err.message))
  }
  run()
  // Cada 15 min + al arrancar (cubre medianoche sin cron externo)
  return setInterval(run, 15 * 60 * 1000)
}
