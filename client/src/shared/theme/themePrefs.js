const KEY = 'correctly_theme'

/** @typedef {'light' | 'dark' | 'system'} ThemeMode */

export function loadThemeMode() {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    /* ignore */
  }
  return 'system'
}

/** @param {ThemeMode} mode */
export function saveThemeMode(mode) {
  try {
    localStorage.setItem(KEY, mode)
  } catch {
    /* ignore */
  }
  return mode
}

export function systemPrefersDark() {
  return Boolean(window.matchMedia?.('(prefers-color-scheme: dark)')?.matches)
}

/** @param {ThemeMode} mode */
export function resolveDark(mode) {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return systemPrefersDark()
}

/**
 * @param {import('vuetify').ThemeInstance} theme
 * @param {ThemeMode} mode
 */
export function applyTheme(theme, mode) {
  const dark = resolveDark(mode)
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', dark ? '#1a1d19' : '#F5F1EA')
  if (theme?.global?.name) {
    theme.global.name.value = dark ? 'correctlyDark' : 'correctlyLight'
  }
}
