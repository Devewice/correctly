import { isAdmin, isSuperAdmin } from '../services/roles.js'

export function requireAdmin(req, res, next) {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ error: 'Forbidden', hint: 'Se requiere rol admin' })
  }
  next()
}

export function requireSuperAdmin(req, res, next) {
  if (!isSuperAdmin(req.user)) {
    return res.status(403).json({
      error: 'Forbidden',
      hint: 'Se requiere rol superadmin',
    })
  }
  next()
}
