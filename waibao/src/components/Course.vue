<template>
  <div class="course-container">
    <h1>课程管理</h1>
    <div>
      <div class="sub-title my-2 text-sm text-blue-600">
        搜索课程
      </div>
      <div class="search-container">
        <el-autocomplete
          v-model="state1"
          :fetch-suggestions="querySearch"
          clearable
          class="inline-input"
          placeholder="Please Input"
          @select="handleSelect"
        />
        <el-button :icon="Search" circle @click="handleSearch" />
        <el-button type="primary" @click="handleAddCourse">添加</el-button> <!-- 添加按钮 -->
      </div>
    </div>
    <div>
      <el-row :gutter="20">
        <!-- 使用 v-for 指令遍历 courses 列表，生成课程卡片 -->
        <el-col :span="6" v-for="course in courses" :key="course.course_id">
          <div class="grid-content ep-bg-purple">
            <p><strong>课程ID:</strong> {{ course.course_id }}</p>
            <p><strong>课程名称:</strong> {{ course.course_name }}</p>
            <p><strong>学分:</strong> {{ course.credit }}</p>
            <p><strong>教师ID:</strong> {{ course.teacher_id }}</p>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import axios from 'axios'

// 定义 Course 接口
interface Course {
  course_id: number
  course_name: string
  credit: number
  teacher_id: number
}

// 定义搜索框的绑定值
const state1 = ref('')

// 定义课程列表
const courses = ref<Course[]>([])

// 搜索建议函数
const querySearch = (queryString: string, cb: any) => {
  const results = queryString
    ? courses.value.filter(createFilter(queryString))
    : courses.value
  // 调用回调函数返回建议列表
  cb(results)
}

// 创建过滤器函数
const createFilter = (queryString: string) => {
  return (course: Course) => {
    return (
      course.course_name.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

// 加载所有课程数据
const loadCourses = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/courses/getAllCourses')
    courses.value = response.data
  } catch (error) {
    console.error('Failed to load courses:', error)
  }
}

// 搜索课程
const handleSearch = async () => {
  if (state1.value.trim() === '') {
    // 搜索框为空时，加载所有课程
    await loadCourses()
  } else {
    // 有输入时，搜索特定课程
    try {
      const response = await axios.get(`http://localhost:8080/api/courses/getCourse/${state1.value}`)
      courses.value = [response.data]
    } catch (error) {
      console.error('Failed to search course:', error)
    }
  }
}

// 处理选择事件
const handleSelect = (item: Record<string, any>) => {
  console.log(item)
}

// 处理添加课程事件
const handleAddCourse = async () => {
  const newCourse: Course = {
    course_id: Date.now(), // 使用当前时间戳作为临时 ID
    course_name: state1.value,
    credit: 0, // 默认值，可以根据需要修改
    teacher_id: 0 // 默认值，可以根据需要修改
  }
  try {
    const response = await axios.post('http://localhost:8080/api/courses/insertCourse', newCourse)
    if (response.data === '添加成功') {
      courses.value.push(newCourse)
      console.log('添加课程成功')
    } else {
      console.error('添加课程失败:', response.data)
    }
  } catch (error) {
    console.error('Failed to add course:', error)
  }
}

// 在组件挂载时加载所有课程数据
onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.course-container {
  width: 100%;
}

/*搜索框和按钮样式*/
.search-container {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 10px;
}

.inline-input {
  flex: 1;
  margin-right: 10px;
}

.sub-title {
  font-size: 16px;
  color: #1e90ff; /* 蓝色 */
}

/*课程卡片样式*/
.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
  border: 1px solid #ccc; /* 添加边框 */
  padding: 10px;
  background-color: #f9f9f9;
}
</style>