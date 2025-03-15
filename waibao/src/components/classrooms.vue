<template>
  <div class="classrooms">
    <h1>教室列表</h1>
    <div class="classroom-list">
      <div class="classroom-item" v-for="classroom in classrooms" :key="classroom.id">
        <div class="building">{{ classroom.building }}</div>
        <div class="room-number">{{ classroom.roomNumber }}</div>
        <div class="capacity">{{ classroom.capacity }} 人</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'

const classrooms = ref([])

onMounted(() => {
  // 假设这是从API获取数据的函数
  fetchClassrooms()
})

const fetchClassrooms = async () => {
 //apijson
  try{
    const response = await axios.get('http://localhost:8080/api/classrooms/getAllClassrooms')
    classrooms.value = response.data

  } catch(error) {
    console.error(error)
  }
}
</script>

<style scoped>
.classrooms {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.classrooms h1 {
  margin-bottom: 20px;
  color: #333;
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
  padding: 15px;
  width: calc(33% - 20px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.classroom-item:hover {
  transform: translateY(-5px);
}

.building, .room-number, .capacity {
  margin: 5px 0;
}

.building {
  font-weight: bold;
  color: #555;
}

.room-number {
  color: #777;
}

.capacity {
  color: #999;
}

/* 响应式设计 */
@media (max-width: 900px) {
  .classroom-item {
    width: calc(50% - 20px);
  }
}

@media (max-width: 600px) {
  .classroom-item {
    width: 100%;
  }
}
</style>
