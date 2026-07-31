import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'

/** History mode — Apache (.htaccess) debe devolver index.html en /onboarding etc. */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
      meta: { auth: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { auth: true },
    },
    {
      path: '/meals',
      name: 'meals',
      component: () => import('@/views/MealsView.vue'),
      meta: { auth: true },
    },
    {
      path: '/water',
      name: 'water',
      component: () => import('@/views/WaterView.vue'),
      meta: { auth: true },
    },
    {
      path: '/mood',
      name: 'mood',
      component: () => import('@/views/MoodView.vue'),
      meta: { auth: true },
    },
    {
      path: '/sleep',
      name: 'sleep',
      component: () => import('@/views/SleepView.vue'),
      meta: { auth: true },
    },
    {
      path: '/habits',
      name: 'habits',
      component: () => import('@/views/HabitsView.vue'),
      meta: { auth: true },
    },
    {
      path: '/meditation',
      name: 'meditation',
      component: () => import('@/views/MeditationView.vue'),
      meta: { auth: true },
    },
    {
      path: '/activity',
      name: 'activity',
      component: () => import('@/views/ActivityView.vue'),
      meta: { auth: true },
    },
    {
      path: '/weight',
      name: 'weight',
      component: () => import('@/views/WeightView.vue'),
      meta: { auth: true },
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('@/views/StatsView.vue'),
      meta: { auth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { auth: true },
    },
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { auth: true, superadmin: true },
      children: [
        {
          path: '',
          name: 'admin',
          component: () => import('@/views/admin/AdminOverview.vue'),
        },
        {
          path: 'google',
          name: 'admin-google',
          component: () => import('@/views/admin/AdminGoogleWizard.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/AdminUsers.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  auth.bootstrapFromUrl()

  if (!auth.user && getToken()) {
    await auth.fetchMe()
  } else if (!getToken()) {
    auth.loading = false
  }

  if (to.meta.auth && !auth.user) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.superadmin && auth.user?.role !== 'superadmin') {
    return { name: 'dashboard' }
  }

  if (to.meta.guest && auth.user) {
    return auth.user.onboardingCompleted
      ? { name: 'dashboard' }
      : { name: 'onboarding' }
  }

  // Admin puede saltar onboarding de bienestar si entra al panel
  if (to.path.startsWith('/admin')) {
    return true
  }

  if (
    to.name !== 'onboarding' &&
    auth.user &&
    !auth.user.onboardingCompleted &&
    to.meta.auth
  ) {
    return { name: 'onboarding' }
  }

  return true
})

export default router
