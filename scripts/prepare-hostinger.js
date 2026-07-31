/**
 * Copia el build de Vue a:
 * - server/public  → Hostinger lo publica en public_html (output directory)
 * - server/ui      → se queda con el proceso Node para que Express sirva /
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'client', 'dist')
const targets = [
  path.join(root, 'server', 'public'),
  path.join(root, 'server', 'ui'),
]

if (!existsSync(path.join(src, 'index.html'))) {
  console.error('[prepare-hostinger] Falta client/dist/index.html')
  process.exit(1)
}

for (const dest of targets) {
  rmSync(dest, { recursive: true, force: true })
  mkdirSync(dest, { recursive: true })
  cpSync(src, dest, { recursive: true })
  writeFileSync(path.join(dest, '.correctly-build'), new Date().toISOString(), 'utf8')
  console.log(`[prepare-hostinger] Copiado → ${dest}`)
}
