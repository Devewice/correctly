import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/shared/api/client'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import { publicRoutes } from '@/router/routes/public.routes'
import { appRoutes } from '@/router/routes/app.routes'
import { adminRoutes } from '@/router/routes/admin.routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [...publicRoutes, ...appRoutes, ...adminRoutes],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  auth.bootstrapFromUrl()

  if (!auth.user && getToken()) {
    await auth.fetchMe()
  } else if (!getToken()) {
    auth.loading = false
  }

  const needsAuth = to.matched.some((r) => r.meta.auth)
  const isGuest = to.matched.some((r) => r.meta.guest)
  const needsSuper = to.matched.some((r) => r.meta.superadmin)

  if (needsAuth && !auth.user) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Tras Google OAuth: volver al enlace de amigos u otra ruta pendiente
  if (auth.user) {
    const pending = sessionStorage.getItem('correctly_redirect')
    if (pending && pending.startsWith('/')) {
      sessionStorage.removeItem('correctly_redirect')
      if (pending !== to.fullPath) return pending
    }
  }

  if (needsSuper && auth.user?.role !== 'superadmin') {
    return { name: 'dashboard' }
  }

  if (isGuest && auth.user) {
    return auth.user.onboardingCompleted
      ? { name: 'dashboard' }
      : { name: 'onboarding' }
  }

  if (to.path.startsWith('/admin')) return true

  if (
    to.name !== 'onboarding' &&
    auth.user &&
    !auth.user.onboardingCompleted &&
    needsAuth
  ) {
    return { name: 'onboarding' }
  }

  return true
})

export default router
