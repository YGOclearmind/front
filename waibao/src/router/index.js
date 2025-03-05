import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/App.vue' // 主界面组件

const routes = [
  {
    path: '/',
    component: MainLayout, // 主界面作为根组件
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router