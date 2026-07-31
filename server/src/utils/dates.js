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
    timeZone: timezone || 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d instanceof Date ? d : new Date(d))
}

/** Hora 0–23 en la timezone del usuario */
export function hourInTz(timezone = 'America/Bogota', d = new Date()) {
  const raw = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone || 'America/Bogota',
    hour: 'numeric',
    hourCycle: 'h23',
  }).format(d instanceof Date ? d : new Date(d))
  return Number(raw)
}

/**
 * Convierte fecha civil + HH:mm en una timezone a Instant UTC.
 */
export function zonedDateTimeToUtc(dateKey, timeHHmm = '00:00', timezone = 'America/Bogota') {
  const [y, mo, d] = dateKey.split('-').map(Number)
  const [hh, mm] = timeHHmm.split(':').map(Number)
  const tz = timezone || 'America/Bogota'

  let utc = new Date(Date.UTC(y, mo - 1, d, hh, mm, 0))

  for (let i = 0; i < 3; i += 1) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(utc)
    const get = (type) => Number(parts.find((p) => p.type === type)?.value)
    const asY = get('year')
    const asM = get('month')
    const asD = get('day')
    const asH = get('hour')
    const asMin = get('minute')
    const wanted = Date.UTC(y, mo - 1, d, hh, mm)
    const actual = Date.UTC(asY, asM - 1, asD, asH, asMin)
    utc = new Date(utc.getTime() + (wanted - actual))
  }
  return utc
}

/** Inicio/fin del día civil en la timezone del usuario (UTC Date) */
export function dayBoundsInTz(dateKey, timezone = 'America/Bogota') {
  const tz = timezone || 'America/Bogota'
  const start = zonedDateTimeToUtc(dateKey, '00:00', tz)
  const probe = new Date(start.getTime() + 36 * 60 * 60 * 1000)
  const nextKey = toDateKeyInTz(tz, probe)
  const nextStart = zonedDateTimeToUtc(nextKey, '00:00', tz)
  return { start, end: new Date(nextStart.getTime() - 1) }
}

/** @deprecated prefer dayBoundsInTz — interpreta dateKey en hora local del servidor */
export function dayBounds(dateKey) {
  const start = new Date(`${dateKey}T00:00:00.000`)
  const end = new Date(`${dateKey}T23:59:59.999`)
  return { start, end }
}

/** Próxima medianoche (inicio del día siguiente) en la timezone del usuario */
export function nextMidnightInTz(timezone = 'America/Bogota', from = new Date()) {
  const tz = timezone || 'America/Bogota'
  const today = toDateKeyInTz(tz, from)
  let probe = from.getTime()
  while (toDateKeyInTz(tz, new Date(probe)) === today) {
    probe += 60 * 60 * 1000
  }
  let lo = probe - 60 * 60 * 1000
  let hi = probe
  while (hi - lo > 500) {
    const mid = Math.floor((lo + hi) / 2)
    if (toDateKeyInTz(tz, new Date(mid)) === today) lo = mid
    else hi = mid
  }
  return new Date(hi)
}
