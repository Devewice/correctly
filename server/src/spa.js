import path from 'path'
import express from 'express'
import { existsSync, readFileSync } from 'fs'

/**
 * Hostinger proxyea /, /login, /onboarding a Node.
 * Usamos readFileSync + res.send (sendFile a veces falla en ese entorno).
 */
export function mountSpa(app, clientDist) {
  if (!clientDist || !existsSync(path.join(clientDist, 'index.html'))) {
    return false
  }

  const indexHtmlPath = path.join(clientDist, 'index.html')
  let indexHtml = ''
  try {
    indexHtml = readFileSync(indexHtmlPath, 'utf8')
  } catch (err) {
    console.error('[spa] No se pudo leer index.html', err.message)
    return false
  }

  app.get('/api/__spa', (_req, res) => {
    res.json({
      ok: true,
      spa: true,
      indexHtmlPath,
      bytes: indexHtml.length,
      build: 'spa-v6-static',
    })
  })

  // sw.js, manifest, iconos, etc. ANTES del fallback HTML
  // (si no, /sw.js devolvía index.html → MIME text/html y fallaba el SW)
  app.use(
    express.static(clientDist, {
      index: false,
      fallthrough: true,
      maxAge: '1d',
      setHeaders(res, filePath) {
        if (filePath.endsWith(`${path.sep}sw.js`) || filePath.endsWith('/sw.js')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
          res.setHeader('Service-Worker-Allowed', '/')
          res.setHeader('Cache-Control', 'no-cache')
        }
        if (filePath.endsWith('.webmanifest')) {
          res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8')
        }
      },
    }),
  )

  app.use(
    '/assets',
    express.static(path.join(clientDist, 'assets'), {
      maxAge: '7d',
      fallthrough: true,
    }),
  )

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    if (req.path.startsWith('/api')) return next()
    if (req.path.startsWith('/assets')) return next()
    if (req.path.startsWith('/uploads')) return next()

    // Rutas con extensión (sw.js, .png…) que no existieron en static → 404, no HTML
    const ext = path.extname(req.path)
    if (ext && ext !== '.html') {
      return res.status(404).type('text').send('Not found')
    }

    res.setHeader('X-Correctly-Spa', 'spa-v6-static')
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).type('html').send(indexHtml)
  })

  return true
}
