/**
 * Lado / ancla del compañero según la pantalla (evita tapar CTAs).
 * @param {string} path
 * @returns {'left' | 'right'}
 */
export function companionSideForRoute(path = '') {
  const p = path || '/'
  if (p.startsWith('/friends')) return 'left'
  if (p.startsWith('/reminders')) return 'left'
  if (p.startsWith('/stats') || p.startsWith('/practices')) return 'left'
  if (p.startsWith('/profile')) return 'right'
  if (p.startsWith('/dashboard') || p === '/') return 'right'
  // Módulos wellness: alternar por ruta
  let h = 0
  for (let i = 0; i < p.length; i++) h = (h + p.charCodeAt(i) * (i + 1)) % 2
  return h === 0 ? 'left' : 'right'
}
