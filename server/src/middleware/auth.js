import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { prisma } from '../config/database.js'

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    env.jwtSecret,
    { expiresIn: '30d' },
  )
}

export function setAuthCookie(res, token) {
  res.cookie('correctly_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProd,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
}

export function clearAuthCookie(res) {
  res.clearCookie('correctly_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProd,
  })
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null
    const token = bearer || req.cookies?.correctly_token

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const payload = jwt.verify(token, env.jwtSecret)
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { stats: true },
    })

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
