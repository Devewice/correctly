import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public')

function logoSvg(size, { maskable = false } = {}) {
  const pad = maskable ? size * 0.18 : size * 0.08
  const inner = size - pad * 2
  const s = inner / 64
  const tx = pad
  const ty = pad
  return Buffer.from(
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
  <rect width="${size}" height="${size}" fill="#8BA888"/>
  <g transform="translate(${tx},${ty}) scale(${s})">
    <path d="M18 34c0-8.3 6.3-15 14.5-15S47 25.7 47 34" stroke="#FAF8F5" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M22 34c0-5.5 4.3-10 9.5-10S41 28.5 41 34" stroke="#F4CBA8" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="32" cy="40" r="3.5" fill="#FAF8F5"/>
  </g>
</svg>`,
  )
}

const jobs = [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-192-maskable.png', 192, true],
  ['icon-512-maskable.png', 512, true],
  ['apple-touch-icon.png', 180, false],
]

for (const [name, size, maskable] of jobs) {
  const out = path.join(dir, name)
  await sharp(logoSvg(size, { maskable })).png().toFile(out)
  console.log('wrote', out)
}
