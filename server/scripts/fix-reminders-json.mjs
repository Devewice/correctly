import { PrismaClient } from '@prisma/client'

const p = new PrismaClient()
try {
  const updated = await p.$executeRawUnsafe(`
    UPDATE User
    SET reminders = '[]'
    WHERE reminders IS NULL
       OR CAST(reminders AS CHAR) = ''
       OR CAST(reminders AS CHAR) = 'null'
  `)
  console.log('updated rows', updated)

  const users = await p.user.findMany({
    select: { id: true, email: true, googleId: true, reminders: true },
  })
  console.log('findMany ok', users)
} catch (e) {
  console.error('ERR', e.message)
  process.exitCode = 1
} finally {
  await p.$disconnect()
}
