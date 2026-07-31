/**
 * Variantes de pregunta por día (estable el mismo día, cambia entre días).
 */
export function pickVariantIndex(dateKey, salt, count) {
  if (!count || count < 1) return 0
  const seed = `${dateKey || ''}:${salt}`
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h % count
}

/**
 * @param {(key: string, ...args: any[]) => string} t
 * @param {string} baseKey e.g. day.moodAsk
 * @param {string} dateKey
 * @param {number} [variants=3]
 */
export function tAsk(t, baseKey, dateKey, variants = 3) {
  const idx = pickVariantIndex(dateKey, baseKey, variants)
  if (idx === 0) return t(baseKey)
  const alt = `${baseKey}_${idx}`
  const translated = t(alt)
  return translated === alt ? t(baseKey) : translated
}
