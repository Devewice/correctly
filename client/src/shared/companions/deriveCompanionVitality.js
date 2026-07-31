/**
 * Deriva el estado visual de la mascota a partir del día del usuario.
 * Prioridad: señales fuertes (destruido/enfermo) > necesidades (sueño/hambre/sed) > ánimo alto.
 *
 * @param {{ summary?: object, progress?: number } | null} today
 * @param {{ hour?: number }} [opts]
 * @returns {string}
 */
export function deriveCompanionVitality(today, opts = {}) {
  const hour = opts.hour ?? new Date().getHours()
  const s = today?.summary
  if (!s) return hour >= 22 || hour < 6 ? 'sleepy' : 'idle'

  const mood = s.latestMood?.mood // 1–5
  const energy = s.latestMood?.energy // low | medium | high
  const sleepQ = s.sleep?.quality // 1–5
  const waterMl = s.waterMl || 0
  const waterGoal = s.waterGoalMl || 2000
  const meals = s.mealsCount || 0
  const activities = s.activitiesCount || 0
  const progress = today?.progress ?? 0
  const night = hour >= 22 || hour < 6

  // —— Crítico ——
  if (mood === 1) {
    if (energy === 'low' || (sleepQ != null && sleepQ <= 2)) return 'sick'
    return 'destroyed'
  }

  if (energy === 'low' && mood != null && mood <= 2) return 'sick'

  // Sueño malo registrado
  if (sleepQ != null && sleepQ <= 2) return 'sleepy'

  // Hambre: mediodía/tarde sin comidas
  if (meals === 0 && hour >= 11 && hour < 21) return 'hungry'

  // Sed: muy por debajo del ritmo esperado
  if (hour >= 10) {
    const awakeH = Math.max(1, Math.min(hour, 22) - 6)
    const expected = (waterGoal * awakeH) / 16
    if (waterMl < expected * 0.3) return 'thirsty'
  }

  // Noche: somnoliento salvo ánimo alto
  if (night) {
    if (mood === 5 || (mood >= 4 && energy === 'high')) return 'great'
    if (mood >= 4) return 'happy'
    return 'sleepy'
  }

  // —— Bienestar alto ——
  if (mood === 5 || (mood >= 4 && energy === 'high')) return 'great'
  if ((mood >= 4 && activities > 0) || (progress >= 80 && mood >= 4)) return 'strong'
  if (mood === 4) return 'happy'
  if (mood === 3) return 'ok'
  if (mood === 2) return 'low'

  // Sin ánimo aún: señales suaves
  if (progress >= 70 && (waterMl >= waterGoal * 0.5 || meals >= 2)) return 'happy'
  if (waterMl < 200 && hour >= 12) return 'thirsty'
  if (meals === 0 && hour >= 13) return 'hungry'

  return 'idle'
}
