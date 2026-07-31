/**
 * Copia el build de Vue a server/public para que Express lo sirva
 * aunque Hostinger mueva client/dist a public_html.
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'client', 'dist')
const dest = path.join(root, 'server', 'public')

if (!existsSync(path.join(src, 'index.html'))) {
  console.error('[prepare-hostinger] Falta client/dist/index.html — corre el build del client primero')
  process.exit(1)
}

rmSync(dest, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })

writeFileSync(
  path.join(dest, '.correctly-build'),
  new Date().toISOString(),
  'utf8',
)

console.log(`[prepare-hostinger] Copiado ${src} → ${dest}`)
