/** Rituales: packs cortos que priorizan 2–3 pasos en Hoy */
export const RITUALS = [
  {
    id: 'morning',
    bands: ['morning', 'midday'],
    stepKeys: ['mood', 'water', 'habit'],
    icon: '🌅',
  },
  {
    id: 'evening',
    bands: ['afternoon', 'evening', 'rest'],
    stepKeys: ['meal', 'journal', 'sleep'],
    icon: '🌙',
  },
  {
    id: 'reset',
    bands: ['midday', 'afternoon', 'evening'],
    stepKeys: ['water', 'meditation', 'activity'],
    icon: '🍃',
  },
]

export function ritualById(id) {
  return RITUALS.find((r) => r.id === id) || null
}
