/** Cantidades cotidianas (el API sigue en ml) */
export const WATER_OPTIONS = [
  { ml: 250, key: 'sip' },
  { ml: 500, key: 'glass' },
  { ml: 1000, key: 'bottle' },
]

/** Un vaso ≈ 250 ml */
export function glassesFromMl(ml = 0) {
  return Math.max(0, Math.round(Number(ml) / 250))
}
