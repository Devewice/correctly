import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import router from '@/router'
import { i18n } from '@/plugins/i18n'
import { createCorrectlyVuetify } from '@/plugins/vuetify'

export function registerPlugins(app) {
  app.use(createPinia())
  app.use(router)
  app.use(i18n)
  app.use(createCorrectlyVuetify())
  app.use(MotionPlugin)
}
