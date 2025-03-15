import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/App.vue' // 主界面组件
import classrooms from '@/components/classrooms.vue' // 教室管理组件
import Course from '@/components/Course.vue' // 导入课程组件

const routes = [


  {
    path:'/classrooms',
    component:classrooms
  },

  {
    path:'/Course',
    name: 'Course',
    component:Course
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router