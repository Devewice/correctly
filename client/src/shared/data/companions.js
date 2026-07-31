/** Mascotas 2D solo visuales (ids estables). */
export const COMPANIONS = [
  { id: 'moka', accent: '#7f9f7c', accent2: '#4a6648' },
  { id: 'pipa', accent: '#efc4a0', accent2: '#c4895c' },
  { id: 'nori', accent: '#6b9e9a', accent2: '#3d6b68' },
  { id: 'luma', accent: '#c9b8d8', accent2: '#8a739e' },
  { id: 'kiwi', accent: '#a8c26a', accent2: '#6a8a3a' },
]

export const COMPANION_IDS = COMPANIONS.map((c) => c.id)

export const COMPANION_NONE = 'none'

export function getCompanion(id) {
  return COMPANIONS.find((c) => c.id === id) || null
}
