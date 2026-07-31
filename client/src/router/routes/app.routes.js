/** Rutas de la app de bienestar (usuario autenticado) */
export const appRoutes = [
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { auth: true },
    children: [
      { path: '', redirect: { name: 'dashboard' } },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/modules/dashboard/views/DashboardView.vue'),
      },
      {
        path: 'meals',
        name: 'meals',
        component: () => import('@/modules/wellness/views/MealsView.vue'),
      },
      {
        path: 'water',
        name: 'water',
        component: () => import('@/modules/wellness/views/WaterView.vue'),
      },
      {
        path: 'mood',
        name: 'mood',
        component: () => import('@/modules/wellness/views/MoodView.vue'),
      },
      {
        path: 'sleep',
        name: 'sleep',
        component: () => import('@/modules/wellness/views/SleepView.vue'),
      },
      {
        path: 'habits',
        name: 'habits',
        component: () => import('@/modules/wellness/views/HabitsView.vue'),
      },
      {
        path: 'meditation',
        name: 'meditation',
        component: () => import('@/modules/wellness/views/MeditationView.vue'),
      },
      {
        path: 'activity',
        name: 'activity',
        component: () => import('@/modules/wellness/views/ActivityView.vue'),
      },
      {
        path: 'weight',
        name: 'weight',
        component: () => import('@/modules/wellness/views/WeightView.vue'),
      },
      {
        path: 'stats',
        name: 'stats',
        component: () => import('@/modules/wellness/views/StatsView.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/modules/profile/views/ProfileView.vue'),
      },
    ],
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/modules/onboarding/views/OnboardingView.vue'),
    meta: { auth: true },
  },
]
