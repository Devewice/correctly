/**
 * Copia el front a:
 * - server/public → output Hostinger → public_html (Apache/assets)
 * - server/ui     → lo usa Node/Passenger cuando recibe /onboarding
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'client', 'dist')
const targets = [
  path.join(root, 'server', 'public'),
  path.join(root, 'server', 'ui'),
]
const htaccessSrc = path.join(root, 'client', 'public', '.htaccess')

if (!existsSync(path.join(src, 'index.html'))) {
  console.error('[prepare-hostinger] Falta client/dist/index.html')
  process.exit(1)
}

for (const dest of targets) {
  rmSync(dest, { recursive: true, force: true })
  mkdirSync(dest, { recursive: true })
  cpSync(src, dest, { recursive: true })
  if (existsSync(htaccessSrc)) {
    writeFileSync(path.join(dest, '.htaccess'), readFileSync(htaccessSrc, 'utf8'))
  }
  writeFileSync(
    path.join(dest, '.correctly-build'),
    `passenger-spa\n${new Date().toISOString()}\n`,
    'utf8',
  )
  console.log(`[prepare-hostinger] → ${dest}`)
}
