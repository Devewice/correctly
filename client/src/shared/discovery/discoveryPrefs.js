const KEY = (userId) => `correctly_discovery_${userId || 'anon'}`

const DEFAULTS = {
  /** Tips completados (configurados o CTA hecho) — no vuelven */
  done: {},
  /** Snooze: tipId → timestamp ms hasta cuándo ocultar */
  snoozeUntil: {},
  /** Banderas de uso (visitas, elecciones…) */
  flags: {},
}

export function loadDiscovery(userId) {
  try {
    const raw = localStorage.getItem(KEY(userId))
    if (!raw) return structuredClone(DEFAULTS)
    const parsed = JSON.parse(raw)
    return {
      done: { ...DEFAULTS.done, ...(parsed.done || {}) },
      snoozeUntil: { ...DEFAULTS.snoozeUntil, ...(parsed.snoozeUntil || {}) },
      flags: { ...DEFAULTS.flags, ...(parsed.flags || {}) },
    }
  } catch {
    return structuredClone(DEFAULTS)
  }
}

function saveDiscovery(userId, data) {
  localStorage.setItem(KEY(userId), JSON.stringify(data))
  return data
}

export function patchDiscovery(userId, patch) {
  const cur = loadDiscovery(userId)
  const next = {
    done: { ...cur.done, ...(patch.done || {}) },
    snoozeUntil: { ...cur.snoozeUntil, ...(patch.snoozeUntil || {}) },
    flags: { ...cur.flags, ...(patch.flags || {}) },
  }
  return saveDiscovery(userId, next)
}

export function markDiscoveryDone(userId, tipId) {
  return patchDiscovery(userId, { done: { [tipId]: true } })
}

/** Ocultar ~7 días */
export function snoozeDiscovery(userId, tipId, days = 7) {
  const until = Date.now() + days * 24 * 60 * 60 * 1000
  return patchDiscovery(userId, { snoozeUntil: { [tipId]: until } })
}

export function setDiscoveryFlag(userId, flag, value = true) {
  return patchDiscovery(userId, { flags: { [flag]: value } })
}

export function isDiscoveryDone(userId, tipId) {
  return Boolean(loadDiscovery(userId).done[tipId])
}

export function isDiscoverySnoozed(userId, tipId) {
  const until = loadDiscovery(userId).snoozeUntil[tipId]
  return typeof until === 'number' && until > Date.now()
}
