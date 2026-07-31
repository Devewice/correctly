/** Plantillas amigables — no son mediciones exactas, solo toques a tiempo */
export const REMINDER_TYPES = [
  'water',
  'mood',
  'meals',
  'habits',
  'sleep',
  'summary',
  'friends',
  'custom',
]

export function defaultReminders(sleepTime = '23:00') {
  const sleepHour = softBedReminder(sleepTime)
  return [
    { id: 'water-am', type: 'water', time: '10:00', enabled: false, withSound: true },
    { id: 'water-pm', type: 'water', time: '15:00', enabled: false, withSound: true },
    { id: 'mood-mid', type: 'mood', time: '12:30', enabled: false, withSound: false },
    { id: 'meals-lunch', type: 'meals', time: '13:00', enabled: false, withSound: false },
    { id: 'habits-eve', type: 'habits', time: '18:00', enabled: false, withSound: false },
    { id: 'sleep-wind', type: 'sleep', time: sleepHour, enabled: false, withSound: true },
    { id: 'summary-night', type: 'summary', time: '21:00', enabled: false, withSound: false },
    { id: 'friends-day', type: 'friends', time: '20:00', enabled: false, withSound: false },
  ]
}

/** ~30 min antes de la hora de dormir (HH:mm) */
function softBedReminder(sleepTime) {
  const [h, m] = String(sleepTime || '23:00').split(':').map(Number)
  let total = (h || 23) * 60 + (m || 0) - 30
  if (total < 0) total += 24 * 60
  const hh = String(Math.floor(total / 60) % 24).padStart(2, '0')
  const mm = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

export function routeForType(type) {
  const map = {
    water: '/water',
    mood: '/mood',
    meals: '/meals',
    habits: '/habits',
    sleep: '/sleep',
    summary: '/dashboard',
    friends: '/friends',
    custom: '/dashboard',
  }
  return map[type] || '/dashboard'
}
