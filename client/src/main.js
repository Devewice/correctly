import { createApp } from 'vue'
import App from '@/App.vue'
import { registerPlugins } from '@/plugins'
import { ensurePwaServiceWorker } from '@/shared/pwa/usePwaInstall'
import { initPwaInstallListeners } from '@/shared/pwa/installState'
import { loadThemeMode, resolveDark } from '@/shared/theme/themePrefs'
import '@/assets/styles/main.css'

// Evita flash claro→oscuro al cargar
document.documentElement.setAttribute(
  'data-theme',
  resolveDark(loadThemeMode()) ? 'dark' : 'light',
)

initPwaInstallListeners()

const app = createApp(App)
registerPlugins(app)
app.mount('#app')

ensurePwaServiceWorker().catch(() => {})
