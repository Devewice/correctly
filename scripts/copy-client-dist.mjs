import { cpSync, existsSync, mkdirSync, rmSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const from = path.join(root, 'client', 'dist')
const to = path.join(root, 'server', 'public')

if (!existsSync(path.join(from, 'index.html'))) {
  console.error(`[copy-client-dist] No existe ${from}/index.html`)
  process.exit(1)
}

rmSync(to, { recursive: true, force: true })
mkdirSync(to, { recursive: true })
cpSync(from, to, { recursive: true })
console.log(`[copy-client-dist] ${from} → ${to}`)
