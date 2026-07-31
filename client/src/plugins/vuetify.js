import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

/** Tema Correctly — única fuente de verdad visual */
const correctlyLight = {
  dark: false,
  colors: {
    background: '#FAF8F5',
    surface: '#FFFFFF',
    'surface-bright': '#FFFFFF',
    'surface-light': '#F5EDE3',
    'surface-variant': '#EDE4D8',
    primary: '#8BA888',
    'primary-darken-1': '#5E7A5B',
    secondary: '#F4CBA8',
    accent: '#D4C5E2',
    // Azul legible (el #A8D4E6 anterior era casi invisible en tonal)
    info: '#2F7FA3',
    success: '#3F8F5B',
    warning: '#B8860B',
    error: '#C45B52',
    'on-background': '#3D3D3D',
    'on-surface': '#3D3D3D',
    'on-surface-light': '#3D3D3D',
    'on-surface-variant': '#3D3D3D',
    // Texto sobre primary: oscuro (el sage es claro; blanco “desaparecía” en tonal)
    'on-primary': '#2F3D2E',
    'on-primary-darken-1': '#FFFFFF',
    'on-secondary': '#3D3D3D',
    'on-accent': '#3D3D3D',
    'on-info': '#FFFFFF',
    'on-success': '#FFFFFF',
    'on-warning': '#FFFFFF',
    'on-error': '#FFFFFF',
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
      VCard: {
        rounded: 'xl',
        elevation: 0,
        border: true,
        color: 'surface',
      },
      VSheet: { rounded: 'xl' },
      VTextField: {
        variant: 'solo-filled',
        density: 'comfortable',
        hideDetails: 'auto',
        bgColor: 'surface-light',
      },
      VSelect: {
        variant: 'solo-filled',
        density: 'comfortable',
        hideDetails: 'auto',
        bgColor: 'surface-light',
      },
      VSlider: { color: 'primary', thumbLabel: true },
      VChip: { rounded: 'lg' },
      VAlert: { rounded: 'lg', variant: 'tonal', density: 'comfortable' },
      VAppBar: { flat: true, color: 'surface', border: 'b' },
      VNavigationDrawer: { color: 'surface' },
      VBottomNavigation: { color: 'primary', elevation: 8 },
      VList: { bgColor: 'transparent' },
      VProgressLinear: { rounded: true, color: 'primary' },
      VProgressCircular: { color: 'primary' },
    },
  })
}
