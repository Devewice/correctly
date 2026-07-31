/* Correctly — PWA + Web Push */
const CACHE = 'correctly-shell-v2'
const SHELL = ['/', '/dashboard', '/manifest.webmanifest', '/favicon.svg', '/icon-192.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL).catch(() => undefined))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

/** Necesario para que Chrome ofrezca “Instalar app” */
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  // API y uploads siempre de red
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/uploads')) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cachear navegación HTML básica para abrir offline suave
        if (request.mode === 'navigate' && response.ok) {
          const copy = response.clone()
          caches.open(CACHE).then((c) => c.put('/dashboard', copy)).catch(() => {})
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)
        if (cached) return cached
        if (request.mode === 'navigate') {
          return (await caches.match('/dashboard')) || (await caches.match('/'))
        }
        return Response.error()
      }),
  )
})

self.addEventListener('push', (event) => {
  let data = {
    title: 'Correctly',
    body: 'Recordatorio suave',
    url: '/dashboard',
    tag: 'correctly',
    silent: false,
  }
  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch {
    try {
      data.body = event.data?.text() || data.body
    } catch {
      /* ignore */
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Correctly', {
      body: data.body,
      tag: data.tag || 'correctly',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '/dashboard' },
      silent: Boolean(data.silent),
      renotify: true,
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const path = event.notification.data?.url || '/dashboard'
  const target = new URL(path, self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'correctly:navigate', url: path })
          return client.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target)
      return undefined
    }),
  )
})
