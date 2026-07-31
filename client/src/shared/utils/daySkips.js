function key(userId, dateKey) {
  return `correctly_day_skips_${userId || 'anon'}_${dateKey}`
}

export function loadDaySkips(userId, dateKey) {
  try {
    const raw = localStorage.getItem(key(userId, dateKey))
    const arr = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

export function saveDaySkips(userId, dateKey, set) {
  try {
    localStorage.setItem(key(userId, dateKey), JSON.stringify([...set]))
  } catch {
    /* ignore quota */
  }
}

export function addDaySkip(userId, dateKey, stepId) {
  const set = loadDaySkips(userId, dateKey)
  set.add(stepId)
  saveDaySkips(userId, dateKey, set)
  return set
}
