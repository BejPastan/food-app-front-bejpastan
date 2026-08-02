// src/router/index.ts
import ForgetPassword from '@/views/ForgetPassword.vue'
import Dashboard from '@/views/Logged/Dashboard.vue'
import RegisterConfirm from '@/views/RegisterConfirm.vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Register from '@/views/Register.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import Profile from '@/views/Logged/Profile.vue'
import Search from '@/views/Logged/Search.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'login',
    component: import('@/views/Login.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => Register,

  },
  {
    path: '/registerConfirm',
    name: 'registerConfirm',
    component: () => RegisterConfirm,

  },
  {
    path: '/forgetPassword',
    name: 'forgetPassword',
    component: () => ForgetPassword,

  },
  {
    path: '/resetPassword',
    name: 'resetPassword',
    component: () => ResetPassword,

  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => Profile,
    meta: { requiresAuth: true },
  },
  {
    path: '/search',
    name: 'search',
    component: () => Search,
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