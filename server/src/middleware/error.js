import { ZodError } from 'zod'

export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.issues,
    })
  }

  // Body JSON vacío/malo (p. ej. GET con Content-Type: application/json)
  if (err instanceof SyntaxError && (err.status === 400 || 'body' in err)) {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  console.error(err)

  // Si el usuario iba a login OAuth, no mostrar JSON crudo en el navegador
  const path = req.path || ''
  if (path.includes('/auth/google') && req.accepts('html')) {
    const base = process.env.CLIENT_URL || ''
    return res.redirect(
      `${base.replace(/\/$/, '')}/login?error=oauth_failed`,
    )
  }

  const status = err.status || 500
  res.status(status).json({
    error: err.message || 'Internal server error',
  })
}
