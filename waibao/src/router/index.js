import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/App.vue' // 主界面组件
import classrooms from '@/components/classrooms.vue' // 教室管理组件
import Course from '@/components/Course.vue' // 导入课程组件
import Teacher from '@/components/Teacher.vue' // 教师管理组件
import Classrooms from '@/components/classrooms.vue' // 教室管理组件
import Student from '@/components/Student.vue'

const routes = [
  {
    path: '/teacher',
    component: Teacher,
    children: [
      {
        path: 'course',
        name: 'TeacherCourse', // 修改名称为唯一值
        component: Course
      },
      {
        path: 'classrooms',
        name: 'TeacherClassrooms', // 修改名称为唯一值
        component: Classrooms
      }
    ]
  },
  {
    path: '/student',
    component: Student,
    children: [
      {
        path: 'classrooms',
        name: 'StudentClassrooms', // 修改名称为唯一值
        component: Classrooms
      },
      {
        path: 'course',
        name: 'StudentCourse', // 修改名称为唯一值
        component: Course
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router