/**
 * Catálogo de compañeros 2D.
 * Cada preset combina especie + partes + colores (mezclables en personalización).
 */

export const COMPANION_NONE = 'none'

export const BODY_PARTS = ['round', 'oval', 'bean', 'tall']
export const EAR_PARTS = ['cat', 'dog', 'bunny', 'fox', 'bear', 'none', 'chick', 'horn']
export const LEG_PARTS = ['stub', 'walk', 'hop', 'short']
export const TAIL_PARTS = ['cat', 'dog', 'fluff', 'none', 'bird', 'leaf']

/** Paletas reutilizables para mezclar */
export const COMPANION_PALETTES = [
  { id: 'sage', accent: '#7f9f7c', accent2: '#4a6648' },
  { id: 'peach', accent: '#efc4a0', accent2: '#c4895c' },
  { id: 'teal', accent: '#6b9e9a', accent2: '#3d6b68' },
  { id: 'lilac', accent: '#c9b8d8', accent2: '#8a739e' },
  { id: 'kiwi', accent: '#a8c26a', accent2: '#6a8a3a' },
  { id: 'sky', accent: '#8ec5d6', accent2: '#4a8496' },
  { id: 'coral', accent: '#e8a090', accent2: '#b56a5c' },
  { id: 'cream', accent: '#e8dcc8', accent2: '#b8a88a' },
  { id: 'ink', accent: '#5c6b6a', accent2: '#2f3a39' },
  { id: 'honey', accent: '#e0b85a', accent2: '#a87f2a' },
  { id: 'rose', accent: '#e6b0c0', accent2: '#b06a80' },
  { id: 'mint', accent: '#9dcfb8', accent2: '#5a9a7a' },
]

function p(id) {
  return COMPANION_PALETTES.find((x) => x.id === id) || COMPANION_PALETTES[0]
}

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   species: string,
 *   body: string,
 *   ears: string,
 *   legs: string,
 *   tail: string,
 *   accent: string,
 *   accent2: string,
 * }} CompanionPreset
 */

/** @type {CompanionPreset[]} */
export const COMPANIONS = [
  { id: 'moka', name: 'Moka', species: 'cat', body: 'round', ears: 'cat', legs: 'walk', tail: 'cat', ...p('sage') },
  { id: 'pipa', name: 'Pipa', species: 'bird', body: 'oval', ears: 'chick', legs: 'hop', tail: 'bird', ...p('peach') },
  { id: 'nori', name: 'Nori', species: 'fox', body: 'bean', ears: 'fox', legs: 'walk', tail: 'fluff', ...p('teal') },
  { id: 'luma', name: 'Luma', species: 'bunny', body: 'round', ears: 'bunny', legs: 'hop', tail: 'fluff', ...p('lilac') },
  { id: 'kiwi', name: 'Kiwi', species: 'critter', body: 'round', ears: 'none', legs: 'stub', tail: 'leaf', ...p('kiwi') },
  { id: 'bruno', name: 'Bruno', species: 'bear', body: 'oval', ears: 'bear', legs: 'stub', tail: 'none', ...p('honey') },
  { id: 'cocoa', name: 'Cocoa', species: 'dog', body: 'bean', ears: 'dog', legs: 'walk', tail: 'dog', ...p('cream') },
  { id: 'nina', name: 'Nina', species: 'cat', body: 'tall', ears: 'cat', legs: 'walk', tail: 'cat', ...p('ink') },
  { id: 'polo', name: 'Polo', species: 'panda', body: 'round', ears: 'bear', legs: 'stub', tail: 'none', ...p('cream') },
  { id: 'rana', name: 'Rana', species: 'frog', body: 'bean', ears: 'none', legs: 'hop', tail: 'none', ...p('mint') },
  { id: 'buho', name: 'Búho', species: 'owl', body: 'oval', ears: 'none', legs: 'stub', tail: 'none', ...p('honey') },
  { id: 'piko', name: 'Piko', species: 'chick', body: 'round', ears: 'chick', legs: 'hop', tail: 'bird', ...p('honey') },
  { id: 'ping', name: 'Ping', species: 'penguin', body: 'tall', ears: 'none', legs: 'stub', tail: 'none', ...p('ink') },
  { id: 'kopa', name: 'Kopa', species: 'koala', body: 'round', ears: 'bear', legs: 'stub', tail: 'none', ...p('cream') },
  { id: 'mapu', name: 'Mapu', species: 'raccoon', body: 'bean', ears: 'bear', legs: 'walk', tail: 'fluff', ...p('ink') },
  { id: 'nuez', name: 'Nuez', species: 'squirrel', body: 'bean', ears: 'fox', legs: 'hop', tail: 'fluff', ...p('peach') },
  { id: 'pua', name: 'Púa', species: 'hedgehog', body: 'round', ears: 'none', legs: 'stub', tail: 'none', ...p('coral') },
  { id: 'lua', name: 'Lúa', species: 'otter', body: 'bean', ears: 'bear', legs: 'walk', tail: 'fluff', ...p('sky') },
  { id: 'selo', name: 'Selo', species: 'seal', body: 'bean', ears: 'none', legs: 'stub', tail: 'none', ...p('sky') },
  { id: 'ciro', name: 'Ciro', species: 'deer', body: 'tall', ears: 'fox', legs: 'walk', tail: 'fluff', ...p('peach') },
  { id: 'chino', name: 'Chino', species: 'pig', body: 'oval', ears: 'none', legs: 'stub', tail: 'none', ...p('rose') },
  { id: 'nena', name: 'Nena', species: 'cow', body: 'oval', ears: 'bear', legs: 'stub', tail: 'none', ...p('cream') },
  { id: 'lana', name: 'Lana', species: 'sheep', body: 'round', ears: 'none', legs: 'stub', tail: 'fluff', ...p('cream') },
  { id: 'pony', name: 'Pony', species: 'pony', body: 'oval', ears: 'fox', legs: 'walk', tail: 'fluff', ...p('coral') },
  { id: 'eli', name: 'Eli', species: 'elephant', body: 'oval', ears: 'none', legs: 'stub', tail: 'none', ...p('lilac') },
  { id: 'leo', name: 'Leo', species: 'lion', body: 'round', ears: 'bear', legs: 'walk', tail: 'cat', ...p('honey') },
  { id: 'tita', name: 'Tita', species: 'tiger', body: 'bean', ears: 'cat', legs: 'walk', tail: 'cat', ...p('peach') },
  { id: 'mono', name: 'Mono', species: 'monkey', body: 'bean', ears: 'bear', legs: 'hop', tail: 'cat', ...p('peach') },
  { id: 'miki', name: 'Miki', species: 'mouse', body: 'round', ears: 'bear', legs: 'hop', tail: 'cat', ...p('cream') },
  { id: 'hami', name: 'Hami', species: 'hamster', body: 'round', ears: 'bear', legs: 'stub', tail: 'none', ...p('peach') },
  { id: 'torti', name: 'Torti', species: 'turtle', body: 'oval', ears: 'none', legs: 'stub', tail: 'none', ...p('mint') },
  { id: 'dino', name: 'Dino', species: 'dino', body: 'bean', ears: 'none', legs: 'walk', tail: 'fluff', ...p('kiwi') },
  { id: 'drako', name: 'Drako', species: 'dragon', body: 'tall', ears: 'horn', legs: 'walk', tail: 'fluff', ...p('coral') },
  { id: 'uni', name: 'Uni', species: 'unicorn', body: 'oval', ears: 'horn', legs: 'walk', tail: 'fluff', ...p('lilac') },
  { id: 'axi', name: 'Axi', species: 'axolotl', body: 'bean', ears: 'none', legs: 'stub', tail: 'fluff', ...p('rose') },
  { id: 'abeja', name: 'Abeja', species: 'bee', body: 'oval', ears: 'none', legs: 'hop', tail: 'none', ...p('honey') },
  { id: 'mari', name: 'Mari', species: 'ladybug', body: 'round', ears: 'none', legs: 'stub', tail: 'none', ...p('coral') },
  { id: 'nemo', name: 'Nemo', species: 'fish', body: 'bean', ears: 'none', legs: 'stub', tail: 'none', ...p('sky') },
  { id: 'ballu', name: 'Ballu', species: 'whale', body: 'bean', ears: 'none', legs: 'stub', tail: 'none', ...p('sky') },
  { id: 'delfi', name: 'Delfi', species: 'dolphin', body: 'bean', ears: 'none', legs: 'stub', tail: 'none', ...p('teal') },
  { id: 'cactu', name: 'Cactu', species: 'cactus', body: 'tall', ears: 'none', legs: 'stub', tail: 'leaf', ...p('mint') },
  { id: 'nube', name: 'Nube', species: 'cloud', body: 'round', ears: 'none', legs: 'stub', tail: 'none', ...p('cream') },
  { id: 'estre', name: 'Estre', species: 'star', body: 'round', ears: 'bunny', legs: 'hop', tail: 'fluff', ...p('honey') },
  { id: 'hoja', name: 'Hoja', species: 'leaf', body: 'oval', ears: 'fox', legs: 'walk', tail: 'leaf', ...p('kiwi') },
  { id: 'meloc', name: 'Meloc', species: 'peach', body: 'round', ears: 'chick', legs: 'hop', tail: 'bird', ...p('peach') },
  { id: 'gris', name: 'Gris', species: 'wolf', body: 'bean', ears: 'fox', legs: 'walk', tail: 'fluff', ...p('ink') },
  { id: 'rosa', name: 'Rosa', species: 'pig', body: 'round', ears: 'none', legs: 'stub', tail: 'none', ...p('rose') },
  { id: 'menta', name: 'Menta', species: 'cat', body: 'oval', ears: 'cat', legs: 'walk', tail: 'cat', ...p('mint') },
  { id: 'sol', name: 'Sol', species: 'chick', body: 'round', ears: 'chick', legs: 'hop', tail: 'bird', ...p('honey') },
  { id: 'luna', name: 'Luna', species: 'owl', body: 'round', ears: 'none', legs: 'stub', tail: 'none', ...p('lilac') },
  { id: 'arena', name: 'Arena', species: 'dog', body: 'oval', ears: 'dog', legs: 'walk', tail: 'dog', ...p('peach') },
  { id: 'musgo', name: 'Musgo', species: 'frog', body: 'round', ears: 'none', legs: 'hop', tail: 'none', ...p('sage') },
  { id: 'nieve', name: 'Nieve', species: 'bunny', body: 'bean', ears: 'bunny', legs: 'hop', tail: 'fluff', ...p('cream') },
  { id: 'cobre', name: 'Cobre', species: 'fox', body: 'tall', ears: 'fox', legs: 'walk', tail: 'fluff', ...p('coral') },
  { id: 'jade', name: 'Jade', species: 'turtle', body: 'round', ears: 'none', legs: 'stub', tail: 'none', ...p('teal') },
]

export const COMPANION_IDS = COMPANIONS.map((c) => c.id)

export const COMPANION_SPECIES = [...new Set(COMPANIONS.map((c) => c.species))]

export function getCompanion(id) {
  return COMPANIONS.find((c) => c.id === id) || null
}

/**
 * Apariencia efectiva (preset + overrides de personalización + nombre).
 * @param {{ companionPetId?: string, companionName?: string, companionCustom?: object }} prefs
 */
export function resolveCompanionAppearance(prefs = {}) {
  const id = prefs.companionPetId
  if (id === COMPANION_NONE) return null
  const base = getCompanion(id) || COMPANIONS[0]
  const custom = prefs.companionCustom && typeof prefs.companionCustom === 'object' ? prefs.companionCustom : {}
  const name = String(prefs.companionName || '').trim() || base.name
  return {
    id: base.id,
    species: base.species,
    name,
    body: custom.body || base.body,
    ears: custom.ears || base.ears,
    legs: custom.legs || base.legs,
    tail: custom.tail || base.tail,
    accent: custom.accent || base.accent,
    accent2: custom.accent2 || base.accent2,
  }
}
