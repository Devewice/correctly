import { prisma } from '../config/database.js'
import { ROLES, getSuperAdminEmails, matchesSuperAdminIdentity } from './roles.js'

/** Promueve solo emails de la allowlist a superadmin al arrancar */
export async function ensureSuperAdmins() {
  const allowlist = getSuperAdminEmails()
  const users = await prisma.user.findMany({
    where: { email: { in: allowlist } },
    select: { id: true, email: true, role: true },
  })

  for (const user of users) {
    if (matchesSuperAdminIdentity(user) && user.role !== ROLES.SUPERADMIN) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: ROLES.SUPERADMIN },
      })
      console.log(`[roles] Superadmin → ${user.email}`)
    }
  }
}
