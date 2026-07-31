import { prisma } from '../config/database.js'
import { ROLES, matchesSuperAdminIdentity } from './roles.js'

/** Promueve a Jeisson (u SUPERADMIN_EMAIL) como superadmin al arrancar */
export async function ensureSuperAdmins() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
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
