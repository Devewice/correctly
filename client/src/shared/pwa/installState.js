import { ref } from 'vue'

/** Estado global del prompt de instalación PWA (se captura al cargar la app) */
export const deferredInstall = ref(null)
export const pwaInstalled = ref(false)

export function initPwaInstallListeners() {
  if (typeof window === 'undefined') return

  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  pwaInstalled.value = standalone

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredInstall.value = e
  })

  window.addEventListener('appinstalled', () => {
    deferredInstall.value = null
    pwaInstalled.value = true
  })
}
