/** Parse "HH:mm" → minutos desde medianoche */
export function parseHm(hm, fallback = 7 * 60) {
  if (!hm || typeof hm !== 'string') return fallback
  const [h, m] = hm.split(':').map(Number)
  if (Number.isNaN(h)) return fallback
  return h * 60 + (Number.isNaN(m) ? 0 : m)
}

/** Hora local del navegador en minutos (aprox. timezone del dispositivo) */
export function nowMinutes() {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

/**
 * Franja del día según rutina del usuario.
 * @returns {'morning'|'midday'|'afternoon'|'evening'|'rest'}
 */
export function dayBand(wakeHm = '07:00', sleepHm = '23:00', minutes = nowMinutes()) {
  const wake = parseHm(wakeHm, 7 * 60)
  const sleep = parseHm(sleepHm, 23 * 60)
  const morningEnd = wake + 4 * 60
  const middayEnd = wake + 7 * 60
  const afternoonEnd = Math.max(middayEnd + 3 * 60, sleep - 3 * 60)

  // Ventana de descanso: sleep → wake (cruza medianoche)
  if (sleep > wake) {
    if (minutes >= sleep || minutes < wake) return 'rest'
  } else if (minutes >= sleep && minutes < wake) {
    return 'rest'
  }

  if (minutes >= wake && minutes < morningEnd) return 'morning'
  if (minutes >= morningEnd && minutes < middayEnd) return 'midday'
  if (minutes >= middayEnd && minutes < afternoonEnd) return 'afternoon'
  return 'evening'
}

export function mealTypeForBand(band, mealTimes = {}) {
  if (band === 'morning') return mealTimes.breakfast ? 'breakfast' : 'breakfast'
  if (band === 'midday') return 'lunch'
  if (band === 'afternoon') return 'snack'
  if (band === 'evening') return 'dinner'
  return 'night_snack'
}

export function activeModuleSet(user) {
  const raw = user?.activeModules
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === 'string'
      ? (() => {
          try {
            return JSON.parse(raw)
          } catch {
            return null
          }
        })()
      : null
  if (!list?.length) {
    return new Set(['meals', 'water', 'mood', 'sleep', 'habits'])
  }
  return new Set(list)
}

export function dateKeyLocal(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
