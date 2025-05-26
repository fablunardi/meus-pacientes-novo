const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/consults'
      },
      {
        path: 'consults',
        name: 'consults',
        component: () => import('pages/User/ConsultsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'drugs',
        name: 'drugs',
        component: () => import('pages/User/DrugsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'patients',
        name: 'patients',
        component: () => import('pages/User/PatientsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'patient-records/:pacienteId',
        name: 'patient-records',
        component: () => import('pages/User/PatientRecordsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'chats',
        name: 'chats',
        component: () => import('pages/User/ChatsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('pages/User/ReportsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('pages/User/SettingsPage.vue'),
        meta: { requiresAuth: true }
      }



    ]
  },

  {
    path: '/login',
    name: 'login',
    component: () => import('pages/auth/LoginPage.vue')
  },
  {
    path: '/recovery-password',
    name: 'recovery-password',
    component: () => import('pages/auth/RecoveryPasswordPage.vue')
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('pages/auth/ResetPassword.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('pages/auth/RegisterPage.vue')
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
