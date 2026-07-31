import { playSoftChime } from '@/shared/reminders/sound'
import { routeForType } from '@/shared/reminders/presets'

const FIRED_KEY = 'correctly_reminder_fired'
let timer = null
let reminders = []
let getMessages = () => ({})
let onNavigate = null

function firedSet() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(FIRED_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

function markFired(key) {
  const set = firedSet()
  set.add(key)
  sessionStorage.setItem(FIRED_KEY, JSON.stringify([...set]))
}

function nowHm(timezone) {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone || undefined,
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

function todayKey(timezone) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone || undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}

async function fireOne(reminder, timezone) {
  const day = todayKey(timezone)
  const key = `${day}:${reminder.id}:${reminder.time}`
  if (firedSet().has(key)) return
  markFired(key)

  const msgs = getMessages()
  const title = msgs.title || 'Correctly'
  const body = msgs[reminder.type] || msgs.custom || reminder.label || 'Recordatorio suave'

  if (reminder.withSound !== false) {
    playSoftChime()
  }

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        tag: `correctly-${reminder.id}`,
        icon: '/favicon.svg',
        silent: reminder.withSound === false,
      })
      n.onclick = () => {
        window.focus()
        if (onNavigate) onNavigate(routeForType(reminder.type))
        n.close()
      }
    } catch {
      /* algunos navegadores restringen Notification desde workers no registrados */
    }
  }

  // Eco in-app si la pestaña está visible
  window.dispatchEvent(
    new CustomEvent('correctly:reminder', {
      detail: { reminder, body, route: routeForType(reminder.type) },
    }),
  )
}

function tick(timezone) {
  const hm = nowHm(timezone)
  for (const r of reminders) {
    if (!r.enabled) continue
    if (r.time !== hm) continue
    fireOne(r, timezone)
  }
}

/**
 * @param {object} opts
 * @param {Array} opts.list
 * @param {string} [opts.timezone]
 * @param {() => Record<string,string>} opts.messages
 * @param {(path: string) => void} [opts.navigate]
 */
export function startReminderScheduler(opts) {
  reminders = Array.isArray(opts.list) ? opts.list : []
  getMessages = opts.messages || (() => ({}))
  onNavigate = opts.navigate || null
  const timezone = opts.timezone

  stopReminderScheduler()
  tick(timezone)
  timer = setInterval(() => tick(timezone), 20_000)
}

export function updateReminderList(list) {
  reminders = Array.isArray(list) ? list : []
}

export function stopReminderScheduler() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

export async function ensureNotificationPermission() {
  if (typeof Notification === 'undefined') {
    return 'unsupported'
  }
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  const result = await Notification.requestPermission()
  return result
}

export function notificationSupport() {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}
