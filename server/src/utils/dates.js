/** @param {Date|string} [d] */
export function toDateKey(d = new Date()) {
  const date = typeof d === 'string' ? new Date(d) : d
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** @param {string} dateKey YYYY-MM-DD */
export function dayBounds(dateKey) {
  const start = new Date(`${dateKey}T00:00:00.000`)
  const end = new Date(`${dateKey}T23:59:59.999`)
  return { start, end }
}
