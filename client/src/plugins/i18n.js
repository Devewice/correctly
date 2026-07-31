import { createI18n } from 'vue-i18n'
import es from '@/locales/es.json'
import en from '@/locales/en.json'
import pt from '@/locales/pt.json'

const saved = localStorage.getItem('correctly_lang')
const browser = navigator.language?.slice(0, 2)
const locale = saved || (['es', 'en', 'pt'].includes(browser) ? browser : 'es')

export const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'es',
  messages: { es, en, pt },
})

export function setLocale(lang) {
  i18n.global.locale.value = lang
  localStorage.setItem('correctly_lang', lang)
  document.documentElement.lang = lang
}
