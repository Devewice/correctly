import { prisma } from '../config/database.js'
import { toDateKeyInTz } from '../utils/dates.js'
import { sendPushToUser, webPushReady } from './webPush.js'
import { reminderPayload } from './reminderMessages.js'

function nowHmInTz(timezone) {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone || 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date())
    const hour = parts.find((p) => p.type === 'hour')?.value || '00'
    const minute = parts.find((p) => p.type === 'minute')?.value || '00'
    return `${hour}:${minute}`
  } catch {
    const d = new Date()
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
}

/** Cada minuto: revisa recordatorios activos y envía Web Push */
export async function runReminderPushTick() {
  if (!webPushReady()) return { skipped: true }

  const users = await prisma.user.findMany({
    where: {
      pushSubscriptions: { some: {} },
    },
    select: {
      id: true,
      language: true,
      timezone: true,
      reminders: true,
    },
  })

  let sent = 0
  for (const user of users) {
    const list = Array.isArray(user.reminders) ? user.reminders : []
    const enabled = list.filter((r) => r && r.enabled && r.time)
    if (!enabled.length) continue

    const tz = user.timezone || 'America/Bogota'
    const hm = nowHmInTz(tz)
    const dateKey = toDateKeyInTz(tz)
    const due = enabled.filter((r) => r.time === hm)
    if (!due.length) continue

    for (const reminder of due) {
      try {
        await prisma.reminderFire.create({
          data: {
            userId: user.id,
            reminderId: String(reminder.id).slice(0, 40),
            dateKey,
          },
        })
      } catch {
        // unique → ya enviado hoy
        continue
      }

      const payload = reminderPayload(reminder, user.language || 'es')
      const result = await sendPushToUser(user.id, payload)
      sent += result.sent || 0
    }
  }

  return { sent, users: users.length }
}

export function startReminderPushJob() {
  const tick = () => {
    runReminderPushTick()
      .then((r) => {
        if (r?.sent) console.log(`[push] sent ${r.sent} reminder(s)`)
      })
      .catch((err) => console.warn('[push] tick', err.message))
  }
  // Alinear al siguiente minuto
  const ms = 60_000 - (Date.now() % 60_000) + 500
  setTimeout(() => {
    tick()
    setInterval(tick, 60_000)
  }, ms)
  console.log('[push] reminder job scheduled')
}
