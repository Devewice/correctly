import { ref } from 'vue'
import { loadCarePrefs, saveCarePrefs } from '@/shared/utils/carePrefs'
import { COMPANION_NONE, getCompanion } from '@/shared/data/companions'
import { deriveCompanionVitality } from '@/shared/companions/deriveCompanionVitality'
import { api } from '@/shared/api/client'

/**
 * @typedef {'idle'|'ok'|'happy'|'great'|'strong'|'low'|'destroyed'|'sleepy'|'hungry'|'thirsty'|'sick'|'proud'|'wave'} CompanionMood
 */

export const companionPetId = ref(/** @type {string} */ ('moka'))
/** Estado base según el día (sin overlays). */
export const companionBaseState = ref(/** @type {CompanionMood} */ ('idle'))
/** Estado mostrado (base o overlay temporal). */
export const companionMood = ref(/** @type {CompanionMood} */ ('idle'))

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
}

/** @param {{ summary?: object, progress?: number } | null} today */
export function syncCompanionFromDay(today) {
  lastToday = today
  const next = deriveCompanionVitality(today)
  companionBaseState.value = next
  if (!overlayActive) companionMood.value = next
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
  saveCarePrefs(userId, { companionPetId: id })
  companionPetId.value = id
  if (id !== COMPANION_NONE) celebrateCompanion('wave', 1600)
}

/**
 * @param {CompanionMood} mood
 * @param {number} [ms]
 */
export function celebrateCompanion(mood = 'happy', ms = 2200) {
  if (companionPetId.value === COMPANION_NONE) return
  overlayActive = true
  companionMood.value = mood
  window.clearTimeout(moodTimer)
  moodTimer = window.setTimeout(() => {
    overlayActive = false
    companionMood.value = companionBaseState.value || ambientCompanionMood()
  }, ms)
}
