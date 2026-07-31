import { computed } from 'vue'
import { deferredInstall, pwaInstalled } from '@/shared/pwa/installState'

function isIos() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function usePwaInstall() {
  const canPrompt = computed(() => Boolean(deferredInstall.value) && !pwaInstalled.value)
  const isApp = computed(() => pwaInstalled.value)
  const showIosHelp = computed(() => isIos() && !pwaInstalled.value)

  async function promptInstall() {
    if (!deferredInstall.value) return { ok: false, reason: 'unavailable' }
    deferredInstall.value.prompt()
    const choice = await deferredInstall.value.userChoice
    deferredInstall.value = null
    if (choice.outcome === 'accepted') {
      pwaInstalled.value = true
      return { ok: true }
    }
    return { ok: false, reason: 'dismissed' }
  }

  return {
    canPrompt,
    isApp,
    showIosHelp,
    promptInstall,
  }
}

export async function ensurePwaServiceWorker() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.register('/sw.js', { scope: '/' })
  } catch {
    return null
  }
}
