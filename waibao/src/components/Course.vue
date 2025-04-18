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
        <el-col :span="4" v-for="course in paginatedCourses" :key="`${course.id}-${course.compositionClasses}`">
          <div class="course-item">
            <!-- 内容区域 -->
            <div class="course-item-content">
              <p><strong>学期:</strong> {{ course.semester }}</p>
              <p><strong>课程ID:</strong> {{ course.id }}</p>
              <p><strong>课程名称:</strong> {{ course.courseName }}</p>
              <p><strong>学分:</strong> {{ course.credit }}</p>
              <p><strong>教师:</strong> {{ course.teacherName }}</p>
              <p v-if="course.beginWeek && course.endWeek"><strong>周次:</strong> {{ course.beginWeek }} — {{ course.endWeek }}</p>
              <p v-if="course.classroom || course.building"><strong>教室:</strong> {{course.building}} {{ course.classroom }}</p>
              <p v-if="course.compositionClasses"><strong>教学班:</strong> {{ course.compositionClasses }}</p>
        
            </div>
            <!-- 固定按钮区域 -->
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
import { nextTick } from 'vue';
const route = useRoute(); // 声明 useRoute 的返回值

// 定义 Course 接口
interface Course {
  semester: string
  id: string
  courseName: string
  credit: number
  teacherName: string
  teacherId: string
  classesName: string
  compositionClasses: string
  classroom: string
  building: string
  date: string
  beginWeek: number
  endWeek: number
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
let hasMoreData = ref(true)

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(courses.value.length / pageSize)
})

// 计算当前页显示的课程
const paginatedCourses = computed(() => {
  
  return courses.value
})

// 添加课程对话框的状态
const addCourseDialogVisible = ref(false)
const newCourse = ref<Course>({
  semester: '',
  id: '',
  courseName: '',
  credit: 0,
  teacherName: '',
  teacherId: '0',
  classesName: '',
  compositionClasses: '',
  classroom: '',
  building: '',
  date: '',
  beginWeek: 0,
  endWeek: 0,
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
const loadCourses = async (page: number = 1) => {
  try {
    const params = {
      num: pageSize,
      page: page
    }
    const response = await axios.get('http://localhost:8080/api/courses/getAllCourses', { params })
    if (response.data.length < pageSize) {
      hasMoreData.value = false
    }
    else {
      hasMoreData.value = true
    }
    courses.value = response.data
    await nextTick()
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
      const response = await axios.get('http://localhost:8080/api/courses/getCourses', { params })
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
      // 重新加载当前页的课程数据
      loadCourses(currentPage.value)
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
      // 重新加载当前页的课程数据
      loadCourses(currentPage.value)
    } else {
      ElMessage.error('删除课程失败:', response.data)
    }
  } catch (error) {
    console.error('Failed to delete course:', error)
  }
}

// 切换到上一页
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadCourses(currentPage.value)
  }
}

// 切换到下一页
const nextPage = () => {
  if (hasMoreData.value) {
    currentPage.value++
    loadCourses(currentPage.value)
  } else {
    ElMessage.warning('没有更多数据')
  }
  
}

// 在组件挂载时加载所有课程数据
onMounted(() => {
  loadCourses()
  if (route.path !== '/student/course') {
    console.log('not student')
    show1.value = true
    show2.value = true
  }
})
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
  margin-top: 20px; /* 调整课程卡片与搜索框的距离 */
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  padding-left: 20px;
  display: flex;
  min-height: 684px; /* 设置最小高度，确保始终容纳两排卡片 */
  box-sizing: border-box;
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
  min-height: 280px; /* 设置最小高度，确保卡片高度一致 */
  max-height: 280px; /* 设置最大高度，确保卡片高度一致 */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 内容和按钮分开布局 */
  overflow: hidden; /* 隐藏超出内容 */
}

.course-item:hover {
  transform: translateY(-15px);
  overflow: hidden; /* 鼠标悬停时不影响布局 */
}

.course-item-content {
  flex: 1;
  overflow: auto; /* 内容区域可以滚动 */
  scrollbar-width: none; /* 针对 Firefox 隐藏滚动条 */
  -ms-overflow-style: none; /* 针对 IE 和 Edge 隐藏滚动条 */
}

/* 针对 Webkit 浏览器（如 Chrome 和 Safari）隐藏滚动条 */
.course-item-content::-webkit-scrollbar {
  display: none;
}

.delete-button {
  margin-top: 10px;
  color: rgb(0, 0, 0);
  cursor: pointer;
  transition: background-color 0.2s;
  align-self: flex-end; /* 将按钮靠右对齐 */
}

.delete-button:hover {
  background-color: #ebe8e8;
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
