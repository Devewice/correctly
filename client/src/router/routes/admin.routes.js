/** Rutas del panel superadmin */
export const adminRoutes = [
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { auth: true, superadmin: true },
    children: [
      {
        path: '',
        name: 'admin',
        component: () => import('@/modules/admin/views/AdminOverview.vue'),
      },
      {
        path: 'google',
        name: 'admin-google',
        component: () => import('@/modules/admin/views/AdminGoogleWizard.vue'),
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/modules/admin/views/AdminUsers.vue'),
      },
    ],
  },
]
