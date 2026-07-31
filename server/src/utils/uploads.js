import { mkdirSync, unlinkSync, existsSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const uploadsRoot = path.resolve(__dirname, '../../uploads')
export const dailyPhotosDir = path.join(uploadsRoot, 'daily')

export function ensureUploadDirs() {
  mkdirSync(dailyPhotosDir, { recursive: true })
}

/**
 * Guarda data URL (image/jpeg|png|webp) y devuelve path público `/uploads/daily/...`
 * @param {string} dataUrl
 * @param {string} userId
 */
export function saveDailyPhotoFromDataUrl(dataUrl, userId) {
  ensureUploadDirs()
  const match = /^data:(image\/(jpeg|jpg|png|webp));base64,(.+)$/i.exec(dataUrl)
  if (!match) {
    const err = new Error('Invalid image format')
    err.status = 400
    throw err
  }
  const ext = match[2].toLowerCase() === 'jpg' ? 'jpeg' : match[2].toLowerCase()
  const buf = Buffer.from(match[3], 'base64')
  if (buf.length > 2.5 * 1024 * 1024) {
    const err = new Error('Image too large (max 2.5MB)')
    err.status = 400
    throw err
  }
  const name = `${userId}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`
  const abs = path.join(dailyPhotosDir, name)
  writeFileSync(abs, buf)
  return `/uploads/daily/${name}`
}

/** @param {string|null|undefined} photoUrl */
export function deleteUploadFile(photoUrl) {
  if (!photoUrl || !photoUrl.startsWith('/uploads/')) return
  const abs = path.join(uploadsRoot, photoUrl.replace(/^\/uploads\//, ''))
  if (existsSync(abs)) {
    try {
      unlinkSync(abs)
    } catch {
      /* ignore */
    }
  }
}
