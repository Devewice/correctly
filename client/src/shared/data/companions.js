/**
 * Catálogo de compañeros — 12 categorías × 10 presets.
 * species = categoría de filtro; variant = morfología 3D específica.
 */

export const COMPANION_NONE = 'none'

export const BODY_PARTS = ['round', 'oval', 'bean', 'tall']
export const EAR_PARTS = ['cat', 'dog', 'bunny', 'fox', 'bear', 'none', 'chick', 'horn']
export const LEG_PARTS = ['stub', 'walk', 'hop', 'short']
export const TAIL_PARTS = ['cat', 'dog', 'fluff', 'none', 'bird', 'leaf']

/** Orden del filtro en el estudio */
export const COMPANION_CATEGORIES = [
  'cat',
  'dog',
  'bear',
  'bunny',
  'fox',
  'bird',
  'frog',
  'sea',
  'farm',
  'wild',
  'critter',
  'mythical',
  'nature',
]

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
  { id: 'amber', accent: '#d4a574', accent2: '#8b5a2b' },
  { id: 'snow', accent: '#f2efe8', accent2: '#b8b0a4' },
  { id: 'charcoal', accent: '#3a3f3c', accent2: '#1a1d19' },
]

function p(id) {
  return COMPANION_PALETTES.find((x) => x.id === id) || COMPANION_PALETTES[0]
}

function pet(id, name, species, variant, palette, extras = {}) {
  return {
    id,
    name,
    species,
    variant: variant || species,
    body: extras.body || 'round',
    ears: extras.ears || 'none',
    legs: extras.legs || 'walk',
    tail: extras.tail || 'none',
    ...p(palette),
  }
}

export const COMPANIONS = [
  // —— Gatos (10) ——
  pet('moka', 'Moka', 'cat', 'cat', 'sage', { ears: 'cat', legs: 'walk', tail: 'cat' }),
  pet('nina', 'Nina', 'cat', 'cat', 'ink', { ears: 'cat', legs: 'walk', tail: 'cat', body: 'tall' }),
  pet('menta', 'Menta', 'cat', 'cat', 'mint', { ears: 'cat', legs: 'walk', tail: 'cat' }),
  pet('canela', 'Canela', 'cat', 'cat', 'amber', { ears: 'cat', legs: 'walk', tail: 'cat' }),
  pet('nube_cat', 'Nube', 'cat', 'cat', 'snow', { ears: 'cat', legs: 'walk', tail: 'cat' }),
  pet('tigre_cat', 'Rayas', 'cat', 'cat', 'honey', { ears: 'cat', legs: 'walk', tail: 'cat' }),
  pet('luna_cat', 'Lunita', 'cat', 'cat', 'lilac', { ears: 'cat', legs: 'walk', tail: 'cat' }),
  pet('oreo', 'Oreo', 'cat', 'cat', 'charcoal', { ears: 'cat', legs: 'walk', tail: 'cat' }),
  pet('miel_cat', 'Miel', 'cat', 'cat', 'peach', { ears: 'cat', legs: 'walk', tail: 'cat' }),
  pet('sage_cat', 'Salvia', 'cat', 'cat', 'teal', { ears: 'cat', legs: 'walk', tail: 'cat' }),

  // —— Perros (10) ——
  pet('cocoa', 'Cocoa', 'dog', 'dog', 'cream', { ears: 'dog', legs: 'walk', tail: 'dog' }),
  pet('arena', 'Arena', 'dog', 'dog', 'peach', { ears: 'dog', legs: 'walk', tail: 'dog' }),
  pet('bruno_dog', 'Bruno', 'dog', 'dog', 'amber', { ears: 'dog', legs: 'walk', tail: 'dog' }),
  pet('lucas', 'Lucas', 'dog', 'dog', 'honey', { ears: 'dog', legs: 'walk', tail: 'dog' }),
  pet('pinta', 'Pinta', 'dog', 'dog', 'ink', { ears: 'dog', legs: 'walk', tail: 'dog' }),
  pet('chispa', 'Chispa', 'dog', 'dog', 'coral', { ears: 'dog', legs: 'walk', tail: 'dog' }),
  pet('rocky', 'Rocky', 'dog', 'dog', 'charcoal', { ears: 'dog', legs: 'walk', tail: 'dog' }),
  pet('lola', 'Lola', 'dog', 'dog', 'rose', { ears: 'dog', legs: 'walk', tail: 'dog' }),
  pet('toby', 'Toby', 'dog', 'dog', 'sage', { ears: 'dog', legs: 'walk', tail: 'dog' }),
  pet('maxi', 'Maxi', 'dog', 'dog', 'sky', { ears: 'dog', legs: 'walk', tail: 'dog' }),

  // —— Osos (10) ——
  pet('bruno', 'Bruno', 'bear', 'grizzly', 'honey', { ears: 'bear', legs: 'stub' }),
  pet('polo', 'Polo', 'bear', 'panda', 'snow', { ears: 'bear', legs: 'stub' }),
  pet('bam', 'Bam', 'bear', 'grizzly', 'amber', { ears: 'bear', legs: 'stub' }),
  pet('nube_bear', 'Polar', 'bear', 'grizzly', 'snow', { ears: 'bear', legs: 'stub' }),
  pet('moka_bear', 'Moka Oso', 'bear', 'grizzly', 'amber', { ears: 'bear', legs: 'stub' }),
  pet('teddy', 'Teddy', 'bear', 'grizzly', 'peach', { ears: 'bear', legs: 'stub' }),
  pet('cocoa_bear', 'Cacao', 'bear', 'grizzly', 'charcoal', { ears: 'bear', legs: 'stub' }),
  pet('miel_bear', 'Meloso', 'bear', 'grizzly', 'honey', { ears: 'bear', legs: 'stub' }),
  pet('bambu', 'Bambú', 'bear', 'panda', 'mint', { ears: 'bear', legs: 'stub' }),
  pet('griz', 'Griz', 'bear', 'grizzly', 'ink', { ears: 'bear', legs: 'stub' }),

  // —— Conejos (10) ——
  pet('luma', 'Luma', 'bunny', 'bunny', 'lilac', { ears: 'bunny', legs: 'hop', tail: 'fluff' }),
  pet('nieve', 'Nieve', 'bunny', 'bunny', 'snow', { ears: 'bunny', legs: 'hop', tail: 'fluff' }),
  pet('algodon', 'Algodón', 'bunny', 'bunny', 'cream', { ears: 'bunny', legs: 'hop', tail: 'fluff' }),
  pet('zanahoria', 'Zana', 'bunny', 'bunny', 'peach', { ears: 'bunny', legs: 'hop', tail: 'fluff' }),
  pet('pompom', 'Pompóm', 'bunny', 'bunny', 'rose', { ears: 'bunny', legs: 'hop', tail: 'fluff' }),
  pet('salto', 'Salto', 'bunny', 'bunny', 'mint', { ears: 'bunny', legs: 'hop', tail: 'fluff' }),
  pet('orejas', 'Orejas', 'bunny', 'bunny', 'honey', { ears: 'bunny', legs: 'hop', tail: 'fluff' }),
  pet('lila_bun', 'Lila', 'bunny', 'bunny', 'lilac', { ears: 'bunny', legs: 'hop', tail: 'fluff' }),
  pet('gris_bun', 'Grisú', 'bunny', 'bunny', 'ink', { ears: 'bunny', legs: 'hop', tail: 'fluff' }),
  pet('copa', 'Copa', 'bunny', 'bunny', 'coral', { ears: 'bunny', legs: 'hop', tail: 'fluff' }),

  // —— Zorros (10) ——
  pet('nori', 'Nori', 'fox', 'fox', 'teal', { ears: 'fox', legs: 'walk', tail: 'fluff' }),
  pet('cobre', 'Cobre', 'fox', 'fox', 'coral', { ears: 'fox', legs: 'walk', tail: 'fluff' }),
  pet('gris', 'Gris', 'fox', 'wolf', 'ink', { ears: 'fox', legs: 'walk', tail: 'fluff' }),
  pet('zoro', 'Zoro', 'fox', 'fox', 'amber', { ears: 'fox', legs: 'walk', tail: 'fluff' }),
  pet('fuego', 'Fuego', 'fox', 'fox', 'honey', { ears: 'fox', legs: 'walk', tail: 'fluff' }),
  pet('plata', 'Plata', 'fox', 'wolf', 'snow', { ears: 'fox', legs: 'walk', tail: 'fluff' }),
  pet('kiwi_fox', 'Kiwi Z', 'fox', 'fox', 'kiwi', { ears: 'fox', legs: 'walk', tail: 'fluff' }),
  pet('arena_fox', 'Duna', 'fox', 'fox', 'peach', { ears: 'fox', legs: 'walk', tail: 'fluff' }),
  pet('noche', 'Noche', 'fox', 'wolf', 'charcoal', { ears: 'fox', legs: 'walk', tail: 'fluff' }),
  pet('rubi', 'Rubí', 'fox', 'fox', 'rose', { ears: 'fox', legs: 'walk', tail: 'fluff' }),

  // —— Aves (10) ——
  pet('pipa', 'Pipa', 'bird', 'chick', 'peach', { ears: 'chick', legs: 'hop', tail: 'bird' }),
  pet('piko', 'Piko', 'bird', 'chick', 'honey', { ears: 'chick', legs: 'hop', tail: 'bird' }),
  pet('sol', 'Sol', 'bird', 'chick', 'honey', { ears: 'chick', legs: 'hop', tail: 'bird' }),
  pet('buho', 'Búho', 'bird', 'owl', 'honey', { legs: 'stub' }),
  pet('luna', 'Luna', 'bird', 'owl', 'lilac', { legs: 'stub' }),
  pet('ping', 'Ping', 'bird', 'penguin', 'ink', { legs: 'stub', body: 'tall' }),
  pet('pingu', 'Pingü', 'bird', 'penguin', 'sky', { legs: 'stub', body: 'tall' }),
  pet('canto', 'Canto', 'bird', 'chick', 'mint', { ears: 'chick', legs: 'hop', tail: 'bird' }),
  pet('ala', 'Ala', 'bird', 'owl', 'teal', { legs: 'stub' }),
  pet('gavi', 'Gavi', 'bird', 'chick', 'cream', { ears: 'chick', legs: 'hop', tail: 'bird' }),

  // —— Ranas (10) ——
  pet('rana', 'Rana', 'frog', 'frog', 'mint', { legs: 'hop' }),
  pet('musgo', 'Musgo', 'frog', 'frog', 'sage', { legs: 'hop' }),
  pet('lima', 'Lima', 'frog', 'frog', 'kiwi', { legs: 'hop' }),
  pet('charco', 'Charco', 'frog', 'frog', 'teal', { legs: 'hop' }),
  pet('salto_f', 'Saltín', 'frog', 'frog', 'mint', { legs: 'hop' }),
  pet('verde', 'Verde', 'frog', 'frog', 'sage', { legs: 'hop' }),
  pet('burbu', 'Burbu', 'frog', 'frog', 'sky', { legs: 'hop' }),
  pet('hoja_f', 'Hojita', 'frog', 'frog', 'kiwi', { legs: 'hop' }),
  pet('lotus', 'Lotus', 'frog', 'frog', 'rose', { legs: 'hop' }),
  pet('pantano', 'Panta', 'frog', 'frog', 'ink', { legs: 'hop' }),

  // —— Mar (10) ——
  pet('selo', 'Selo', 'sea', 'seal', 'sky', { legs: 'stub' }),
  pet('lua', 'Lúa', 'sea', 'otter', 'sky', { ears: 'bear', legs: 'walk', tail: 'fluff' }),
  pet('nemo', 'Nemo', 'sea', 'fish', 'sky', { body: 'bean' }),
  pet('ballu', 'Ballu', 'sea', 'whale', 'sky', { body: 'bean' }),
  pet('delfi', 'Delfi', 'sea', 'dolphin', 'teal', { body: 'bean' }),
  pet('marea', 'Marea', 'sea', 'seal', 'teal', { legs: 'stub' }),
  pet('coral_s', 'Coral', 'sea', 'fish', 'coral', { body: 'bean' }),
  pet('espuma', 'Espuma', 'sea', 'dolphin', 'snow', { body: 'bean' }),
  pet('orca', 'Orca', 'sea', 'whale', 'charcoal', { body: 'bean' }),
  pet('nutria', 'Nutri', 'sea', 'otter', 'amber', { ears: 'bear', legs: 'walk', tail: 'fluff' }),

  // —— Granja (10) ——
  pet('chino', 'Chino', 'farm', 'pig', 'rose', { legs: 'stub' }),
  pet('rosa', 'Rosa', 'farm', 'pig', 'rose', { legs: 'stub' }),
  pet('nena', 'Nena', 'farm', 'cow', 'cream', { ears: 'bear', legs: 'stub' }),
  pet('lana', 'Lana', 'farm', 'sheep', 'cream', { legs: 'stub', tail: 'fluff' }),
  pet('pony', 'Pony', 'farm', 'pony', 'coral', { ears: 'fox', legs: 'walk', tail: 'fluff' }),
  pet('oink', 'Oink', 'farm', 'pig', 'peach', { legs: 'stub' }),
  pet('muu', 'Muu', 'farm', 'cow', 'snow', { ears: 'bear', legs: 'stub' }),
  pet('lana2', 'Nube Oveja', 'farm', 'sheep', 'snow', { legs: 'stub', tail: 'fluff' }),
  pet('troton', 'Trotón', 'farm', 'pony', 'amber', { ears: 'fox', legs: 'walk', tail: 'fluff' }),
  pet('cerdi', 'Cerdi', 'farm', 'pig', 'coral', { legs: 'stub' }),

  // —— Salvajes (10) ——
  pet('leo', 'Leo', 'wild', 'lion', 'honey', { ears: 'bear', legs: 'walk', tail: 'cat' }),
  pet('tita', 'Tita', 'wild', 'tiger', 'peach', { ears: 'cat', legs: 'walk', tail: 'cat' }),
  pet('eli', 'Eli', 'wild', 'elephant', 'lilac', { legs: 'stub' }),
  pet('ciro', 'Ciro', 'wild', 'deer', 'peach', { ears: 'fox', legs: 'walk', tail: 'fluff' }),
  pet('mono', 'Mono', 'wild', 'monkey', 'peach', { ears: 'bear', legs: 'hop', tail: 'cat' }),
  pet('kopa', 'Kopa', 'wild', 'koala', 'cream', { ears: 'bear', legs: 'stub' }),
  pet('mapu', 'Mapu', 'wild', 'raccoon', 'ink', { ears: 'bear', legs: 'walk', tail: 'fluff' }),
  pet('simba', 'Simba', 'wild', 'lion', 'amber', { ears: 'bear', legs: 'walk', tail: 'cat' }),
  pet('rayas', 'Bengala', 'wild', 'tiger', 'honey', { ears: 'cat', legs: 'walk', tail: 'cat' }),
  pet('tronco', 'Tronco', 'wild', 'elephant', 'ink', { legs: 'stub' }),

  // —— Bichitos (10) ——
  pet('miki', 'Miki', 'critter', 'critter', 'cream', { ears: 'bear', legs: 'hop', tail: 'cat' }),
  pet('hami', 'Hami', 'critter', 'critter', 'peach', { ears: 'bear', legs: 'stub' }),
  pet('pua', 'Púa', 'critter', 'critter', 'coral', { legs: 'stub' }),
  pet('nuez', 'Nuez', 'critter', 'critter', 'peach', { ears: 'fox', legs: 'hop', tail: 'fluff' }),
  pet('torti', 'Torti', 'critter', 'critter', 'mint', { legs: 'stub' }),
  pet('abeja', 'Abeja', 'critter', 'critter', 'honey', { legs: 'hop' }),
  pet('mari', 'Mari', 'critter', 'critter', 'coral', { legs: 'stub' }),
  pet('jade', 'Jade', 'critter', 'critter', 'teal', { legs: 'stub' }),
  pet('pipi', 'Pipí', 'critter', 'critter', 'sage', { ears: 'bear', legs: 'hop', tail: 'cat' }),
  pet('bolita', 'Bolita', 'critter', 'critter', 'lilac', { ears: 'bear', legs: 'stub' }),

  // —— Míticos (10) ——
  pet('dino', 'Dino', 'mythical', 'dino', 'kiwi', { legs: 'walk', tail: 'fluff' }),
  pet('drako', 'Drako', 'mythical', 'dragon', 'coral', { ears: 'horn', legs: 'walk', tail: 'fluff' }),
  pet('uni', 'Uni', 'mythical', 'unicorn', 'lilac', { ears: 'horn', legs: 'walk', tail: 'fluff' }),
  pet('axi', 'Axi', 'mythical', 'axolotl', 'rose', { legs: 'stub', tail: 'fluff' }),
  pet('rex', 'Rex', 'mythical', 'dino', 'sage', { legs: 'walk', tail: 'fluff' }),
  pet('fafnir', 'Fafnir', 'mythical', 'dragon', 'ink', { ears: 'horn', legs: 'walk', tail: 'fluff' }),
  pet('estrella', 'Estel', 'mythical', 'unicorn', 'snow', { ears: 'horn', legs: 'walk', tail: 'fluff' }),
  pet('neon', 'Neón', 'mythical', 'axolotl', 'sky', { legs: 'stub', tail: 'fluff' }),
  pet('spark', 'Spark', 'mythical', 'dragon', 'honey', { ears: 'horn', legs: 'walk', tail: 'fluff' }),
  pet('myth', 'Myth', 'mythical', 'unicorn', 'mint', { ears: 'horn', legs: 'walk', tail: 'fluff' }),

  // —— Naturaleza (10) ——
  pet('kiwi', 'Kiwi', 'nature', 'cactus', 'kiwi', { legs: 'stub', tail: 'leaf' }),
  pet('cactu', 'Cactu', 'nature', 'cactus', 'mint', { legs: 'stub', tail: 'leaf' }),
  pet('nube', 'Nube', 'nature', 'cloud', 'cream', { legs: 'stub' }),
  pet('estre', 'Estre', 'nature', 'star', 'honey', { ears: 'bunny', legs: 'hop', tail: 'fluff' }),
  pet('hoja', 'Hoja', 'nature', 'cactus', 'kiwi', { ears: 'fox', legs: 'walk', tail: 'leaf' }),
  pet('meloc', 'Meloc', 'nature', 'cloud', 'peach', { ears: 'chick', legs: 'hop', tail: 'bird' }),
  pet('flora', 'Flora', 'nature', 'cactus', 'sage', { legs: 'stub', tail: 'leaf' }),
  pet('cumulo', 'Cúmulo', 'nature', 'cloud', 'snow', { legs: 'stub' }),
  pet('astro', 'Astro', 'nature', 'star', 'lilac', { legs: 'hop' }),
  pet('semilla', 'Semilla', 'nature', 'cactus', 'honey', { legs: 'stub', tail: 'leaf' }),
]

export const COMPANION_IDS = COMPANIONS.map((c) => c.id)

/** @deprecated usar COMPANION_CATEGORIES */
export const COMPANION_SPECIES = COMPANION_CATEGORIES

export function getCompanion(id) {
  return COMPANIONS.find((c) => c.id === id) || null
}

export function companionsByCategory(category) {
  if (!category || category === 'all') return COMPANIONS
  return COMPANIONS.filter((c) => c.species === category)
}

/**
 * Apariencia efectiva (preset + overrides + nombre).
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
    variant: base.variant || base.species,
    name,
    body: custom.body || base.body,
    ears: custom.ears || base.ears,
    legs: custom.legs || base.legs,
    tail: custom.tail || base.tail,
    accent: custom.accent || base.accent,
    accent2: custom.accent2 || base.accent2,
  }
}
