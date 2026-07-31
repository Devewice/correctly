/** @param {Date|string} [d] */
export function toDateKey(d = new Date()) {
  const date = typeof d === 'string' ? new Date(d) : d
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Fecha civil YYYY-MM-DD en una zona horaria IANA */
export function toDateKeyInTz(timezone = 'America/Bogota', d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d instanceof Date ? d : new Date(d))
}

/** Próxima medianoche (inicio del día siguiente) en la timezone del usuario */
export function nextMidnightInTz(timezone = 'America/Bogota', from = new Date()) {
  const today = toDateKeyInTz(timezone, from)
  let probe = from.getTime()
  while (toDateKeyInTz(timezone, new Date(probe)) === today) {
    probe += 60 * 60 * 1000
  }
  let lo = probe - 60 * 60 * 1000
  let hi = probe
  while (hi - lo > 500) {
    const mid = Math.floor((lo + hi) / 2)
    if (toDateKeyInTz(timezone, new Date(mid)) === today) lo = mid
    else hi = mid
  }
  return new Date(hi)
}

/** @param {string} dateKey YYYY-MM-DD */
export function dayBounds(dateKey) {
  const start = new Date(`${dateKey}T00:00:00.000`)
  const end = new Date(`${dateKey}T23:59:59.999`)
  return { start, end }
}
