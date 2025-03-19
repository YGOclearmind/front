import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/App.vue' // 主界面组件
import classrooms from '@/components/classrooms.vue' // 教室管理组件
import Course from '@/components/Course.vue' // 导入课程组件
import Teacher from '@/components/Teacher.vue' // 教师管理组件
import Classrooms from '@/components/classrooms.vue' // 教室管理组件

const routes = [

  {
    path: '/teacher',
    component:Teacher,
    children: [
      {
        path: 'course',
        name: 'Course',
        component: Course
      },
      {
        path: 'classrooms',
        name: 'Classrooms',
        component: Classrooms
      }
    ]
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router