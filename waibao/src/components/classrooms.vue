<template>
  <div class="classrooms">
    <h1>教室列表</h1>
    <div class="controls">
      <input type="text" v-model="searchQuery" placeholder="搜索教室" @input="filterClassrooms" class="search-input"/>
      <!-- <button class="add-button" @click="toggleAddForm">新增教室</button> -->
    </div>
    <div class="classroom-list">
      <div class="classroom-item" v-for="classroom in filteredClassrooms" :key="classroom.id">
        <div class="building"><strong>教学楼：</strong>{{ classroom.building }}</div>
        <div class="room-number"><strong>房间号：</strong>{{ classroom.roomNumber }}</div>
        <div class="capacity"><strong>容量：</strong>{{ classroom.capacity }} 人</div>
        <!-- <button class="delete-button" @click="deleteClassroom(classroom.id)">删除</button> -->
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
            <label for="roomNumber">房间号：</label>
            <input type="text" id="roomNumber" v-model="newClassroom.roomNumber" required/>
          </div>
          <div class="form-group">
            <label for="capacity">容量：</label>
            <input type="number" id="capacity" v-model="newClassroom.capacity" required/>
          </div>
          <button class="submit-button" @click="addClassroom">提交</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'

const classrooms = ref([])
const filteredClassrooms = ref([])
const searchQuery = ref('')
const showAddForm = ref(false)
const newClassroom = ref({
  building: '',
  roomNumber: '',
  capacity: 0
})

onMounted(() => {
  fetchClassrooms()
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
      classroom.roomNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      classroom.id.toString().includes(searchQuery.value)
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
    newClassroom.value = { building: '', roomNumber: '', capacity: 0 }
    showAddForm.value = false
  } catch (error) {
    console.error('新增教室时出错:', error)
  }
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
  width: calc(20% - 20px); /* 每一行显示6个，需要计算宽度 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.7s;
}

.classroom-item:hover {
  transform: translateY(-10px);
}

.building, .room-number, .capacity {
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
</style>
