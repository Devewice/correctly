export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
}

/** Superadmins semilla (solo email exacto). Ampliar con SUPERADMIN_EMAILS. */
const DEFAULT_SUPERADMIN_EMAILS = [
  'demo@correctly.app',
  'jeissondav1@gmail.com',
]

export function getSuperAdminEmails() {
  const fromEnv = [
    process.env.SUPERADMIN_EMAIL,
    ...(process.env.SUPERADMIN_EMAILS || '').split(','),
  ]
    .map((e) => (e || '').toLowerCase().trim())
    .filter(Boolean)

  return [...new Set([...DEFAULT_SUPERADMIN_EMAILS, ...fromEnv])]
}

export function isAdmin(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.SUPERADMIN
}

export function isSuperAdmin(user) {
  return user?.role === ROLES.SUPERADMIN
}

/** Solo email exacto en allowlist — nunca por nombre */
export function matchesSuperAdminIdentity(user) {
  const email = (user?.email || '').toLowerCase().trim()
  if (!email) return false
  return getSuperAdminEmails().includes(email)
}
