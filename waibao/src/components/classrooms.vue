<template>
  <div class="classrooms">
    <h1>教室列表</h1>
    <div class="controls">
      <input type="text" v-model="searchQuery" placeholder="搜索教室" @input="filterClassrooms" class="search-input"/>
      <button v-if="show1" class="add-button" @click="toggleAddForm">新增教室</button>
    </div>
    <div class="classroom-list">
      <div class="classroom-item" v-for="classroom in paginatedClassrooms" :key="classroom.id">
        <div class="building"><strong>教学楼：</strong>{{ classroom.building }}</div>
        <div class="room-number"><strong>房间号：</strong>{{ classroom.name }}</div>
        <div class="floor"><strong>楼层：</strong>{{ classroom.floor }}</div>
        <div class="type"><strong>类型：</strong>{{ classroom.type }}</div>
        <div class="capacity"><strong>容量：</strong>{{ classroom.capacity }} 人</div>
        <div class="campus"><strong>校区：</strong>{{ classroom.campus }}</div>
        <div class="management-departme"><strong>管理学院：</strong>{{ classroom.managementDepartme }}</div>
        <button v-if="show2" class="delete-button" @click="deleteClassroom(classroom.id)">删除</button>
      </div>
    </div>
    <!-- 新增表单的遮罩层 -->
    <div v-if="showAddForm" class="overlay" @click="toggleAddForm">
      <!-- 新增表单的容器，点击事件需要停止冒泡，防止点击新增表单时关闭自身 -->
      <div class="add-form-container" @click.stop>
        <div class="add-form">
          <div class="form-group">
            <label for="building">教学楼：</label>
            <input type="text" id="building" v-model="newClassroom.building" required/>
          </div>
          <div class="form-group">
            <label for="name">房间号：</label>
            <input type="text" id="name" v-model="newClassroom.name" required/>
          </div>
          <div class="form-group">
            <label for="floor">楼层：</label>
            <input type="number" id="floor" v-model="newClassroom.floor" required/>
          </div>
          <div class="form-group">
            <label for="type">类型：</label>
            <input type="text" id="type" v-model="newClassroom.type" required/>
          </div>
          <div class="form-group">
            <label for="capacity">容量：</label>
            <input type="number" id="capacity" v-model="newClassroom.capacity" required/>
          </div>
          <div class="form-group">
            <label for="campus">校区：</label>
            <input type="text" id="campus" v-model="newClassroom.campus" required/>
          </div>
          <div class="form-group">
            <label for="managementDepartme">管理学院：</label>
            <input type="text" id="managementDepartme" v-model="newClassroom.managementDepartme" required/>
          </div>
          <button class="submit-button" @click="addClassroom">提交</button>
        </div>
      </div>
    </div>
    <!-- 分页按钮 -->
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const show1 = ref(false)
const show2 = ref(false)
const classrooms = ref([])
const searchQuery = ref('')
const showAddForm = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(8)

const newClassroom = ref({
  id: '',
  name: '',
  building: '',
  floor: 0,
  type: '',
  capacity: 0,
  campus: '',
  managementDepartme: ''
})

onMounted(() => {
  fetchClassrooms()
  if (route.path !== '/student/classrooms') {
    console.log(2)
    show1.value = true
    show2.value = true
  }
  console.log(route.path)
})

const fetchClassrooms = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/classrooms/getAllClassrooms')
    classrooms.value = response.data
    filteredClassrooms.value = response.data
  } catch (error) {
    console.error(error)
  }
}

const deleteClassroom = async (id) => {
  try {
    await axios.post(`http://localhost:8080/api/classrooms/deleteClassroom/${id}`)
    classrooms.value = classrooms.value.filter(classroom => classroom.id !== id)
    filteredClassrooms.value = filteredClassrooms.value.filter(classroom => classroom.id !== id)
  } catch (error) {
    console.error('删除教室时出错:', error)
  }
}

const filterClassrooms = () => {
  if (searchQuery.value === '') {
    filteredClassrooms.value = classrooms.value
  } else {
    filteredClassrooms.value = classrooms.value.filter(classroom =>
      classroom.building.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      classroom.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      classroom.floor.toString().includes(searchQuery.value) ||
      classroom.type.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      classroom.capacity.toString().includes(searchQuery.value) ||
      classroom.campus.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      classroom.managementDepartme.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
}

const toggleAddForm = () => {
  showAddForm.value = !showAddForm.value
}

const addClassroom = async () => {
  try {
    const response = await axios.post('http://localhost:8080/api/classrooms/insertClassroom', newClassroom.value)
    classrooms.value.push(response.data)
    filteredClassrooms.value.push(response.data)
    newClassroom.value = {
      id: '',
      name: '',
      building: '',
      floor: 0,
      type: '',
      capacity: 0,
      campus: '',
      managementDepartme: ''
    }
    showAddForm.value = false
  } catch (error) {
    console.error('新增教室时出错:', error)
  }
}

const filteredClassrooms = ref([])

const totalPages = computed(() => {
  return Math.ceil(filteredClassrooms.value.length / itemsPerPage.value)
})

const paginatedClassrooms = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredClassrooms.value.slice(start, end)
})

const changePage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return
  currentPage.value = newPage
}
</script>

<style scoped>
.classrooms {
  padding: 20px;
  font-family: Arial, sans-serif;
  width: 100%;
}

.classrooms h1 {
  margin-bottom: 20px;
  color: #333;
}

.controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 90%;
}

.add-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-button:hover {
  background-color: #218838;
}

.classroom-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.classroom-item {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px; /* 增加padding以使区块变大 */
  width: calc(20% - 20px); /* 每一行显示5个，需要计算宽度 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.7s;
}

.classroom-item:hover {
  transform: translateY(-10px);
}

.building, .room-number, .floor, .type, .capacity, .campus, .management-departme {
  margin: 10px 0; /* 增加margin以使内容间距更大 */
}

.delete-button {
  margin-top: 10px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-button:hover {
  background-color: #ff1a1a;
}

/* 用于遮罩层 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 新增表单容器样式 */
.add-form-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 300px;
  text-align: center;
}

/* 美化新增表单 */
.add-form .form-group {
  margin-bottom: 15px;
}

.add-form label {
  display: block;
  margin-bottom: 5px;
  text-align: left;
}

.add-form input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.submit-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover {
  background-color: #0056b3;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  margin: 0 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination button:hover {
  background-color: #0056b3;
}

.pagination span {
  margin: 0 5px;
}
</style>
