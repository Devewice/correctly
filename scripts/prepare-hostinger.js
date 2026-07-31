/**
 * Opción A: prepara el front para public_html e incluye .htaccess
 * (Hostinger usa el "Directorio de salida" = server/public).
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'client', 'dist')
const dest = path.join(root, 'server', 'public')

/** .htaccess Opción A — Apache sirve Vue; /api lo deja al proxy Node de Hostinger */
const HTACCESS = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # 1) Archivos reales (js, css, index.html, favicon…)
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # 2) /api → no reescribir a index.html (Hostinger proxyea al proceso Node)
  RewriteRule ^api(?:/|$) - [L]

  # 3) Rutas Vue (/login, /onboarding, /dashboard…) → index.html
  RewriteRule ^ index.html [L]
</IfModule>
`

if (!existsSync(path.join(src, 'index.html'))) {
  console.error('[prepare-hostinger] Falta client/dist/index.html')
  process.exit(1)
}

rmSync(dest, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })

// Siempre escribir .htaccess (Vite a veces no copia dotfiles)
writeFileSync(path.join(dest, '.htaccess'), HTACCESS, 'utf8')
writeFileSync(
  path.join(dest, '.correctly-build'),
  `option-a\n${new Date().toISOString()}\n`,
  'utf8',
)

console.log(`[prepare-hostinger] Copiado → ${dest}`)
console.log('[prepare-hostinger] .htaccess generado en server/public/.htaccess')
