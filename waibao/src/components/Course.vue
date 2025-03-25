<template>
  
  <div class="course-container">
    <h1>课程管理</h1>
    <div>
      <div class="search-container">
        <div class="search-item">
          <span class="label"></span>
          <el-input
            v-model="searchId"
            clearable
            class="inline-input"
            placeholder="请输入课程号"
          />
        </div>
        <div class="search-item">
          <span class="label"></span>
          <el-input
            v-model="searchName"
            clearable
            class="inline-input"
            placeholder="请输入课程名称"
          />
        </div>
        <div class="search-item">
          <span class="label"></span>
          <el-input
            v-model="searchCredit"
            clearable
            class="inline-input"
            placeholder="请输入学分"
          />
        </div>
        <div class="search-item">
          <span class="label"></span>
          <el-input
            v-model="searchTeacherId"
            clearable
            class="inline-input"
            placeholder="请输入教师号"
          />
        </div>
        <el-button :icon="Search" circle @click="handleSearch"></el-button>
        <el-button v-if="show1" :icon="Plus" circle @click="showAddCourseDialog"></el-button>
      </div>
    </div>
    <div class="course-list">
      <el-row :gutter="20">
        <!-- 使用 v-for 指令遍历 paginatedCourses 列表，生成课程卡片 -->
        <el-col :span="4" v-for="course in paginatedCourses" :key="course.id">
          <div class="course-item">
            <p><strong>课程ID:</strong> {{ course.id }}</p>
            <p><strong>课程名称:</strong> {{ course.courseName }}</p>
            <p><strong>学分:</strong> {{ course.credit }}</p>
            <p><strong>教师:</strong> {{ course.teacherName }}</p>
            <p v-if="course.beginTime"><strong>开始时间:</strong> {{ course.beginTime}}</p>
            <p v-if="course.endTime"><strong>结束时间:</strong> {{ course.endTime}}</p>
            <el-button v-if="show2"
              :icon="Delete"
              circle
              class="delete-button"
              @click="handleDeleteCourse(course.id)"
            ></el-button>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="pagination-container">
      <el-button
        v-if="currentPage > 1"
        :icon="ArrowLeftBold"
        circle
        @click="prevPage"
      ></el-button>
      <span class="page-number">{{ currentPage }}</span>
      <el-button
        v-if="currentPage"
        :icon="ArrowRightBold"
        circle
        @click="nextPage"
        
      ></el-button>
    </div>
    <!-- 添加课程对话框 -->
    <el-dialog title="添加课程" v-model="addCourseDialogVisible">
      <el-form :model="newCourse" ref="addCourseForm">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="newCourse.courseName" />
        </el-form-item>
        <el-form-item label="学分" prop="credit">
          <el-input v-model="newCourse.credit" />
        </el-form-item>
        <el-form-item label="教师ID" prop="teacherId">
          <el-input v-model="newCourse.teacherId" />
        </el-form-item>
        <el-form-item label="上课日期" prop="date">
          <el-date-picker
            v-model="newCourse.date"
            type="date"
            placeholder="选择日期"
            class="inline-input"
          />
        </el-form-item>
        <el-form-item label="课程时间" prop="timeRange">
    <el-time-picker
      v-model="newCourse.beginTime"
      placeholder="开始时间"
      class="inline-input"
    />
    <el-time-picker
      v-model="newCourse.endTime"
      placeholder="结束时间"
      class="inline-input"
    />
  </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addCourseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddCourse">添加</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
import { Search, Delete, ArrowLeftBold, ArrowRightBold, Plus } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'; // 引入 useRoute
const route = useRoute(); // 声明 useRoute 的返回值
// 定义 Course 接口
interface Course {
  id: string
  courseName: string
  credit: number
  teacherName: string
  teacherId: number
  date: string
  beginTime: string
  endTime: string
}
const show1 = ref(false)
const show2 = ref(false)
// 定义搜索框的绑定值
const searchId = ref('')
const searchName = ref('')
const searchCredit = ref('')
const searchTeacherId = ref('')

// 定义课程列表
const courses = ref<Course[]>([])

// 定义分页相关的状态
const currentPage = ref(1)
const pageSize = 12

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(courses.value.length / pageSize)
})

// 计算当前页显示的课程
const paginatedCourses = computed(() => {
  const start = 0
  const end = start + pageSize
  return courses.value.slice(start, end)
})

// 添加课程对话框的状态
const addCourseDialogVisible = ref(false)
const newCourse = ref<Course>({
  id: '',
  courseName: '',
  credit: 0,
  teacherName: '',
  teacherId: 0,
  date: '',
  beginTime: '',
  endTime: ''
})

// 显示添加课程对话框
const showAddCourseDialog = () => {
  addCourseDialogVisible.value = true
}

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
      course.courseName.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}

// 加载所有课程数据
const loadCourses = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/courses/getAllCourses', {
      params: {
        page: currentPage.value,
        num: pageSize
      }
    })
    courses.value = response.data
  } catch (error) {
    console.error('Failed to load courses:', error)
  }
}

// 搜索课程
const handleSearch = async () => {
  const params: Record<string, any> = {}
  if (searchId.value.trim() !== '') params.id = searchId.value
  if (searchName.value.trim() !== '') params.courseName = searchName.value
  if (searchCredit.value.trim() !== '') params.credit = searchCredit.value
  if (searchTeacherId.value.trim() !== '') params.teacherId = searchTeacherId.value

  if (Object.keys(params).length === 0) {
    // 搜索框为空时，加载所有课程
    await loadCourses()
  } else {
    // 有输入时，搜索特定课程
    try {
      const response = await axios.get('http://localhost:8080/api/courses/getCourse', { params })
      courses.value = response.data
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
  try {
        const response = await axios.post('http://localhost:8080/api/courses/insertCourse', newCourse.value)
    if (response.data === '添加成功') {
      courses.value.push(newCourse.value)
      ElMessage.success('添加课程成功')
      addCourseDialogVisible.value = false
    } else {
      ElMessage.error('添加课程失败:', response.data)
    }
  } catch (error) {
    console.error('Failed to add course:', error)
  }
}

// 处理删除课程事件
const handleDeleteCourse = async (id: string) => {
  try {
    const response = await axios.post(`http://localhost:8080/api/courses/deleteCourse/${id}`)
    if (response.data === '删除成功') {
      courses.value = courses.value.filter(course => course.id !== id)
      ElMessage.success('删除课程成功')
    } else {
      ElMessage.error('删除课程失败:', response.data)
    }
  } catch (error) {
    console.error('Failed to delete course:', error)
  }
}

// 切换到上一页
const prevPage= async () => {
  if (currentPage.value > 1) {
    currentPage.value--
    await loadCourses()
  }
}

// 切换到下一页
const nextPage = async () => {
  currentPage.value++
  await loadCourses()
  if(courses.value.length === 0){
    currentPage.value--
    await loadCourses()
    ElMessage.error('已经是最后一页了')
  }
  
}

// 在组件挂载时加载所有课程数据
onMounted(() => {
  loadCourses()
 if (route.path === '/teacher/course') {
    console.log('teacher')
    show1.value = true
    show2.value = true
}

}
)
</script>

<style scoped>
.course-container {
  width: 100%;
}

/*标题样式和切换搜索按钮*/
.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/*搜索框和按钮样式*/
.search-container {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 10px;
}

.search-item {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.label {
  margin-right: 5px;
}

.inline-input {
  width: 150px;
}

.small-input {
  width: 100px; /* 调整性别选择框的宽度 */
}

.sub-title {
  font-size: 16px;
  color: #1e90ff; /* 蓝色 */
}

/*课程卡片样式*/
.course-list {
  margin-top: 40px; /* 调整课程卡片与搜索框的距离 */
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  padding-left: 20px;
}

.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
}

.course-item {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  width: 80%; 
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.7s;
  margin-bottom: 20px;
  flex: 1;

}

.course-item:hover {
  transform: translateY(-15px);
}

.delete-button {
  margin-top: 10px;
  color: rgb(0, 0, 0);
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-button:hover {
  background-color: #ff1a1a;
}

/*分页样式*/
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  position: relative;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.page-number {
  margin: 0 10px;
  font-size: 16px;
}


</style>