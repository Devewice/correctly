import { prisma } from '../config/database.js'
import { ROLES, getSuperAdminEmails, matchesSuperAdminIdentity } from './roles.js'

/**
 * MySQL a veces deja columnas Json como '' → Prisma revienta con
 * "Unexpected end of JSON input" (rompía el login Google al leer User).
 */
export async function repairInvalidUserJson() {
  try {
    const reminders = await prisma.$executeRawUnsafe(`
      UPDATE User
      SET reminders = '[]'
      WHERE reminders IS NULL
         OR CAST(reminders AS CHAR) = ''
         OR CAST(reminders AS CHAR) = 'null'
    `)
    const modules = await prisma.$executeRawUnsafe(`
      UPDATE User
      SET activeModules = '["meals","water","mood","sleep","habits"]'
      WHERE activeModules IS NULL
         OR CAST(activeModules AS CHAR) = ''
         OR CAST(activeModules AS CHAR) = 'null'
    `)
    if (reminders || modules) {
      console.log(
        `[bootstrap] JSON User reparado → reminders=${reminders} modules=${modules}`,
      )
    }
  } catch (err) {
    console.warn('[bootstrap] repairInvalidUserJson', err.message)
  }
}

/** Promueve solo emails de la allowlist a superadmin al arrancar */
export async function ensureSuperAdmins() {
  await repairInvalidUserJson()

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
