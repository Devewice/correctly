import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { loadThemeMode, resolveDark } from '@/shared/theme/themePrefs'

/** Tema Correctly — alineado a tokens.css */
const correctlyLight = {
  dark: false,
  colors: {
    background: '#F5F1EA',
    surface: '#FFFCF8',
    'surface-bright': '#FFFCF8',
    'surface-light': '#EBE4D8',
    'surface-variant': '#E0D7C9',
    primary: '#7F9F7C',
    'primary-darken-1': '#4A6648',
    secondary: '#EFC4A0',
    accent: '#C9B8D8',
    info: '#2A7396',
    success: '#3A8554',
    warning: '#A67C0A',
    error: '#B54F48',
    'on-background': '#2C2F2B',
    'on-surface': '#2C2F2B',
    'on-surface-light': '#2C2F2B',
    'on-surface-variant': '#2C2F2B',
    'on-primary': '#2C2F2B',
    'on-primary-darken-1': '#FFFFFF',
    'on-secondary': '#2C2F2B',
    'on-accent': '#2C2F2B',
    'on-info': '#FFFFFF',
    'on-success': '#FFFFFF',
    'on-warning': '#FFFFFF',
    'on-error': '#FFFFFF',
  },
}

const correctlyDark = {
  dark: true,
  colors: {
    background: '#1A1D19',
    surface: '#242822',
    'surface-bright': '#2C3129',
    'surface-light': '#30352E',
    'surface-variant': '#3A4037',
    primary: '#9BB898',
    'primary-darken-1': '#C5D9C3',
    secondary: '#E8B892',
    accent: '#C9B8D8',
    info: '#6BB3D1',
    success: '#6BBF86',
    warning: '#D4A84B',
    error: '#E07A72',
    'on-background': '#F2EFE8',
    'on-surface': '#F2EFE8',
    'on-surface-light': '#F2EFE8',
    'on-surface-variant': '#F2EFE8',
    'on-primary': '#1A1D19',
    'on-primary-darken-1': '#1A1D19',
    'on-secondary': '#1A1D19',
    'on-accent': '#1A1D19',
    'on-info': '#1A1D19',
    'on-success': '#1A1D19',
    'on-warning': '#1A1D19',
    'on-error': '#1A1D19',
  },
}

export function createCorrectlyVuetify() {
  const initial = resolveDark(loadThemeMode()) ? 'correctlyDark' : 'correctlyLight'
  return createVuetify({
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: { mdi },
    },
    theme: {
      defaultTheme: initial,
      themes: { correctlyLight, correctlyDark },
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
      VChip: { rounded: 'pill', elevation: 0, border: false },
      VAlert: { rounded: 'xl', variant: 'tonal', density: 'comfortable', border: false },
      VAppBar: { flat: true, color: 'background', elevation: 0 },
      VNavigationDrawer: { color: 'background', elevation: 0 },
      VBottomNavigation: { color: 'primary', elevation: 0 },
      VBottomSheet: { elevation: 0, scrim: 'rgba(20, 22, 18, 0.45)' },
      VList: { bgColor: 'transparent' },
      VListItem: { rounded: 'xl' },
      VProgressLinear: { rounded: true, color: 'primary', height: 6 },
      VProgressCircular: { color: 'primary' },
      VTabs: { color: 'primary', density: 'comfortable' },
      VTab: { style: 'text-transform: none; letter-spacing: 0.01em;' },
      VSnackbar: {
        rounded: 'xl',
        color: 'primary-darken-1',
        timeout: 3200,
        location: 'bottom',
      },
      VDialog: { scrim: 'rgba(20, 22, 18, 0.55)' },
      VAvatar: { rounded: 'lg' },
    },
  })
}
