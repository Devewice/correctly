import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

/** Tema Correctly — alineado a tokens.css */
const correctlyLight = {
  dark: false,
  colors: {
    background: '#F7F4EF',
    surface: '#FFFFFF',
    'surface-bright': '#FFFFFF',
    'surface-light': '#F3EBE1',
    'surface-variant': '#E8DFD2',
    primary: '#7F9F7C',
    'primary-darken-1': '#4F6B4C',
    secondary: '#EFC4A0',
    accent: '#C9B8D8',
    info: '#2A7396',
    success: '#3A8554',
    warning: '#A67C0A',
    error: '#B54F48',
    'on-background': '#2F322E',
    'on-surface': '#2F322E',
    'on-surface-light': '#2F322E',
    'on-surface-variant': '#2F322E',
    'on-primary': '#2F322E',
    'on-primary-darken-1': '#FFFFFF',
    'on-secondary': '#2F322E',
    'on-accent': '#2F322E',
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
      VBtn: {
        rounded: 'lg',
        elevation: 0,
        style: 'text-transform: none; letter-spacing: 0.01em; font-weight: 600;',
      },
      VCard: {
        rounded: 'xl',
        elevation: 0,
        border: false,
        color: 'surface',
      },
      VSheet: { rounded: 'xl' },
      VTextField: {
        variant: 'solo-filled',
        density: 'comfortable',
        hideDetails: 'auto',
        bgColor: 'surface-light',
        rounded: 'lg',
      },
      VTextarea: {
        variant: 'solo-filled',
        density: 'comfortable',
        hideDetails: 'auto',
        bgColor: 'surface-light',
        rounded: 'lg',
      },
      VSelect: {
        variant: 'solo-filled',
        density: 'comfortable',
        hideDetails: 'auto',
        bgColor: 'surface-light',
        rounded: 'lg',
      },
      VSlider: { color: 'primary', thumbLabel: true },
      VChip: { rounded: 'lg', elevation: 0 },
      VAlert: { rounded: 'lg', variant: 'tonal', density: 'comfortable' },
      VAppBar: { flat: true, color: 'surface', border: 'b', elevation: 0 },
      VNavigationDrawer: { color: 'surface', elevation: 0 },
      VBottomNavigation: { color: 'primary', elevation: 0 },
      VBottomSheet: { elevation: 0, scrim: 'rgba(47, 50, 46, 0.35)' },
      VList: { bgColor: 'transparent' },
      VListItem: { rounded: 'lg' },
      VProgressLinear: { rounded: true, color: 'primary' },
      VProgressCircular: { color: 'primary' },
      VTabs: { color: 'primary', density: 'comfortable' },
      VTab: { style: 'text-transform: none; letter-spacing: 0.01em;' },
      VSnackbar: {
        rounded: 'lg',
        color: 'primary-darken-1',
        timeout: 3200,
        location: 'bottom',
      },
      VDialog: { scrim: 'rgba(47, 50, 46, 0.45)' },
    },
  })
}
