import { computed, ref } from 'vue'
import { loadCarePrefs, saveCarePrefs } from '@/shared/utils/carePrefs'
import {
  COMPANION_NONE,
  getCompanion,
  resolveCompanionAppearance,
} from '@/shared/data/companions'
import { deriveCompanionVitality } from '@/shared/companions/deriveCompanionVitality'
import { api } from '@/shared/api/client'

/**
 * @typedef {'idle'|'ok'|'happy'|'great'|'strong'|'low'|'destroyed'|'sleepy'|'hungry'|'thirsty'|'sick'|'proud'|'wave'} CompanionMood
 */

export const companionPetId = ref(/** @type {string} */ ('moka'))
export const companionName = ref('')
export const companionCustom = ref(/** @type {object|null} */ (null))
export const companionBaseState = ref(/** @type {CompanionMood} */ ('idle'))
export const companionMood = ref(/** @type {CompanionMood} */ ('idle'))
/** Fuerza mostrar bocadillo al cambiar estado */
export const companionBubbleTick = ref(0)

export const companionAppearance = computed(() =>
  resolveCompanionAppearance({
    companionPetId: companionPetId.value,
    companionName: companionName.value,
    companionCustom: companionCustom.value,
  }),
)

let moodTimer = 0
let overlayActive = false
let lastToday = null

export function ambientCompanionMood() {
  return deriveCompanionVitality(lastToday)
}

export function syncCompanionFromPrefs(userId) {
  const prefs = loadCarePrefs(userId)
  const id = prefs.companionPetId
  if (id === COMPANION_NONE || getCompanion(id)) {
    companionPetId.value = id || 'moka'
  } else {
    companionPetId.value = 'moka'
  }
  companionName.value = prefs.companionName || ''
  companionCustom.value = prefs.companionCustom || null
}

/** @param {{ summary?: object, progress?: number } | null} today */
export function syncCompanionFromDay(today) {
  lastToday = today
  const next = deriveCompanionVitality(today)
  const changed = next !== companionBaseState.value
  companionBaseState.value = next
  if (!overlayActive) {
    companionMood.value = next
    if (changed) companionBubbleTick.value += 1
  }
}

export async function refreshCompanionVitality() {
  try {
    const today = await api('/dashboard/today')
    syncCompanionFromDay(today)
    return today
  } catch {
    if (!overlayActive) companionMood.value = ambientCompanionMood()
    return null
  }
}

export function setCompanionPet(userId, id) {
  const patch = { companionPetId: id }
  // Al elegir preset, resetear custom (se puede volver a mezclar)
  if (id !== COMPANION_NONE) {
    patch.companionCustom = null
    companionCustom.value = null
    const preset = getCompanion(id)
    if (preset && !String(loadCarePrefs(userId).companionName || '').trim()) {
      // no fuerza nombre si ya hay sobrenombre
    }
  }
  saveCarePrefs(userId, patch)
  companionPetId.value = id
  if (id !== COMPANION_NONE) celebrateCompanion('wave', 1600)
}

export function setCompanionName(userId, name) {
  const n = String(name || '').trim().slice(0, 24)
  saveCarePrefs(userId, { companionName: n })
  companionName.value = n
}

export function setCompanionCustom(userId, custom) {
  const next = custom && typeof custom === 'object' ? { ...custom } : null
  saveCarePrefs(userId, { companionCustom: next })
  companionCustom.value = next
  celebrateCompanion('wave', 1200)
}

/**
 * @param {CompanionMood} mood
 * @param {number} [ms]
 */
export function celebrateCompanion(mood = 'happy', ms = 2200) {
  if (companionPetId.value === COMPANION_NONE) return
  overlayActive = true
  companionMood.value = mood
  companionBubbleTick.value += 1
  window.clearTimeout(moodTimer)
  moodTimer = window.setTimeout(() => {
    overlayActive = false
    companionMood.value = companionBaseState.value || ambientCompanionMood()
  }, ms)
}
