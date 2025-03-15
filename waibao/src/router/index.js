import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/App.vue' // 主界面组件
import classrooms from '@/components/classrooms.vue' // 教室管理组件

const routes = [


  {
    path:'/classrooms',
    component:classrooms
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router