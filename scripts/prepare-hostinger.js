/**
 * Opción A: prepara el front estático para public_html.
 * Copia client/dist → server/public (output directory en Hostinger).
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'client', 'dist')
const dest = path.join(root, 'server', 'public')
const htaccessSrc = path.join(root, 'client', 'public', '.htaccess')

if (!existsSync(path.join(src, 'index.html'))) {
  console.error('[prepare-hostinger] Falta client/dist/index.html')
  process.exit(1)
}

rmSync(dest, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })

// Asegurar .htaccess en la salida (Vite a veces no copia dotfiles en todos los entornos)
if (existsSync(htaccessSrc)) {
  writeFileSync(path.join(dest, '.htaccess'), readFileSync(htaccessSrc, 'utf8'))
}

writeFileSync(
  path.join(dest, '.correctly-build'),
  `option-a\n${new Date().toISOString()}\n`,
  'utf8',
)

console.log(`[prepare-hostinger] Opción A → ${dest}`)
console.log('[prepare-hostinger] En Hostinger: Output directory = server/public')
console.log('[prepare-hostinger] Tras deploy: verifica public_html/.htaccess (ver HOSTINGER.md)')
