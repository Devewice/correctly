/** Rutas públicas (sin sesión) */
export const publicRoutes = [
  {
    path: '/login',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { guest: true },
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/modules/auth/views/LoginView.vue'),
      },
    ],
  },
]
