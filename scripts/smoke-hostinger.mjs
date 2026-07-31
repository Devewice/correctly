const base = 'https://jeisson.click'

async function check(path, opts) {
  const res = await fetch(`${base}${path}`, opts)
  const text = await res.text()
  const preview = text.slice(0, 180).replace(/\s+/g, ' ')
  console.log(`${opts?.method || 'GET'} ${path} → ${res.status} | ${preview}`)
  return { res, text }
}

await check('/api/health')
await check('/api/auth/status')
await check('/')
await check('/login')
await check('/index.html')

const login = await fetch(`${base}/api/auth/dev-login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Probe', language: 'es' }),
})
const loginBody = await login.json()
console.log(
  `POST /api/auth/dev-login → ${login.status} | user=${loginBody.user?.email || loginBody.error} token=${Boolean(loginBody.token)}`,
)

if (loginBody.token) {
  const dash = await fetch(`${base}/api/dashboard/today`, {
    headers: { Authorization: `Bearer ${loginBody.token}` },
  })
  const dashBody = await dash.json()
  console.log(
    `GET /api/dashboard/today → ${dash.status} | progress=${dashBody.progress} meals=${dashBody.summary?.mealsCount}`,
  )
}
