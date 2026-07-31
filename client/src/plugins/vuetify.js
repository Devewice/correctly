import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

/** Tema Correctly — sage / sand / peach */
const correctlyLight = {
  dark: false,
  colors: {
    background: '#FAF8F5',
    surface: '#FFFFFF',
    primary: '#8BA888',
    'primary-darken-1': '#5E7A5B',
    secondary: '#F4CBA8',
    accent: '#D4C5E2',
    info: '#A8D4E6',
    success: '#7CB88F',
    warning: '#E8C468',
    error: '#D98880',
    'on-background': '#3D3D3D',
    'on-surface': '#3D3D3D',
  },
}

export function createCorrectlyVuetify() {
  return createVuetify({
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: { mdi },
    },
    theme: {
      defaultTheme: 'correctlyLight',
      themes: { correctlyLight },
    },
    defaults: {
      VBtn: { rounded: 'lg', elevation: 0 },
      VCard: { rounded: 'xl', elevation: 0, border: true },
      VTextField: {
        variant: 'solo-filled',
        density: 'comfortable',
        hideDetails: 'auto',
      },
      VSelect: {
        variant: 'solo-filled',
        density: 'comfortable',
        hideDetails: 'auto',
      },
      VChip: { rounded: 'lg' },
    },
  })
}
