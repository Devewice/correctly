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
      build: 'spa-v4-send',
    })
  })

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

    res.setHeader('X-Correctly-Spa', 'spa-v4')
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).type('html').send(indexHtml)
  })

  return true
}
