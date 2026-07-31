const KEY = (userId) => `correctly_care_prefs_${userId || 'anon'}`

const DEFAULTS = {
  lowEnergy: false,
  ritualId: null, // 'morning' | 'evening' | null
  companionPetId: 'moka', // companions id | 'none'
  companionName: '', // sobrenombre opcional
  /** Overrides mezclables: body, ears, legs, tail, accent, accent2 */
  companionCustom: null,
}

export function loadCarePrefs(userId) {
  try {
    const raw = localStorage.getItem(KEY(userId))
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveCarePrefs(userId, patch) {
  const next = { ...loadCarePrefs(userId), ...patch }
  localStorage.setItem(KEY(userId), JSON.stringify(next))
  return next
}
