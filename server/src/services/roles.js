export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
}

export function isAdmin(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.SUPERADMIN
}

export function isSuperAdmin(user) {
  return user?.role === ROLES.SUPERADMIN
}

/** ¿Debe este usuario ser superadmin por nombre/email? */
export function matchesSuperAdminIdentity(user) {
  const email = (user?.email || '').toLowerCase()
  const name = (user?.name || '').toLowerCase()
  const configured = (process.env.SUPERADMIN_EMAIL || '').toLowerCase().trim()

  if (configured && email === configured) return true
  if (email.includes('jeisson')) return true
  if (name.includes('jeisson')) return true
  return false
}
