import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'

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
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { auth: true },
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

  if (to.meta.guest && auth.user) {
    return auth.user.onboardingCompleted
      ? { name: 'dashboard' }
      : { name: 'onboarding' }
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
