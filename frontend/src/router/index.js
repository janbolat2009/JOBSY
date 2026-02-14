import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue')
    },
    {
      path: '/employer',
      name: 'employer',
      component: () => import('@/views/EmployerDashboard.vue'),
      meta: { requiresAuth: true, role: 'employer' }
    },
    {
      path: '/employer/applications',
      name: 'employer-applications',
      component: () => import('@/views/EmployerApplicationsView.vue'),
      meta: { requiresAuth: true, role: 'employer' }
    },
    {
      path: '/employer/interviews',
      name: 'employer-interviews',
      component: () => import('@/views/EmployerInterviewsView.vue'),
      meta: { requiresAuth: true, role: 'employer' }
    },
    {
      path: '/candidate',
      name: 'candidate',
      component: () => import('@/views/CandidateDashboard.vue'),
      meta: { requiresAuth: true, role: 'candidate' }
    },
    {
      path: '/jobs',
      name: 'jobs',
      component: () => import('@/views/JobsView.vue'),
      meta: { requiresAuth: true, role: 'candidate' }
    },
    {
      path: '/job/:id',
      name: 'job-detail',
      component: () => import('@/views/JobDetailView.vue'),
      meta: { requiresAuth: true, role: 'candidate' }
    },
    {
      path: '/interview/:id',
      name: 'interview',
      component: () => import('@/views/InterviewView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/applications',
      name: 'applications',
      component: () => import('@/views/ApplicationsView.vue'),
      meta: { requiresAuth: true, role: 'candidate' }
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('@/views/MessagesView.vue'),
      meta: { requiresAuth: true, role: 'candidate' }
    },
    {
      path: '/employerjobs',
      name: 'employerjobs',
      component: () => import('@/views/EmployerJobsView.vue'),
      meta: { requiresAuth: true, role: 'employer' }
    },
    {
      path: '/career',
      name: 'career-copilot',
      component: () => import('@/views/CareerCopilot.vue'),
      meta: { requiresAuth: true, role: 'candidate' } // Assuming for candidates for now
    },
    {
      path: '/resume-feedback',
      name: 'resume-feedback',
      component: () => import('@/views/ResumeFeedback.vue'),
      meta: { requiresAuth: true, role: 'candidate' }
    },
    {
      path: '/employer/applications/:id/analysis',
      name: 'applications-analysis',
      component: () => import('@/views/ApplicationsAnalysis.vue'),
      meta: { requiresAuth: true, role: 'employer' }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/views/NotificationsView.vue')
    },
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Ждём загрузки сессии (если ещё не загрузилась)
  if (authStore.loading) {
    await new Promise(resolve => {
      const interval = setInterval(() => {
        if (!authStore.loading) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
    })
  }

  // Если пользователь авторизован
  if (authStore.isAuthenticated && authStore.user?.role) {
    const role = authStore.user.role
    const publicPaths = ['/', '/login', '/register']

    // Если зашёл на публичную страницу — кидаем на дашборд по роли
    if (publicPaths.includes(to.path)) {
      if (role === 'employer') {
        return next('/employer')
      } else if (role === 'candidate') {
        return next('/candidate')
      }
    }

    // Если зашёл на роут, который требует другую роль — кидаем на свой дашборд
    if (to.meta.role && to.meta.role !== role) {
      return next(role === 'employer' ? '/employer' : '/candidate')
    }
  }

  // Если роут требует авторизации, а пользователя нет — на логин
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  next()
})

export default router