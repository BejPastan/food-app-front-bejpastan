import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register.vue'),

  },
  {
    path: '/registerConfirm',
    name: 'registerConfirm',
    component: () => import('@/views/RegisterConfirm.vue'),

  },
  {
    path: '/forgetPassword',
    name: 'forgetPassword',
    component: () => import('@/views/ForgetPassword.vue'),

  },
  {
    path: '/resetPassword',
    name: 'resetPassword',
    component: () => import('@/views/ResetPassword.vue'),

  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/Logged/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Logged/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/Logged/Search.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/Logged/Admin/Admin.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})