import { createApp } from 'vue'
import App from '@/App.vue'
import { registerPlugins } from '@/plugins'
import { ensurePwaServiceWorker } from '@/shared/pwa/usePwaInstall'
import { initPwaInstallListeners } from '@/shared/pwa/installState'
import '@/assets/styles/main.css'

initPwaInstallListeners()

const app = createApp(App)
registerPlugins(app)
app.mount('#app')

ensurePwaServiceWorker().catch(() => {})
