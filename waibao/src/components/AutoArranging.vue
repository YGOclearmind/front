<template>
    <div>
        <div class="settings-container">
            <el-form :model="scheduleSettings" ref="settingsForm">
                <h2>排课设置</h2>
                <el-form-item>
                    <el-button type="primary" @click="saveSettings">保存设置</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="arrange-container">
            <el-button type="success" @click="arrangeClasses">开始排课</el-button>
            <el-table
                :data="paginatedClasses"
                style="width: 100%"
                class="custom-table"
                :row-style="setRowStyle"
            >
                <el-table-column prop="courseId" label="课程编号" width="180"></el-table-column>
                <el-table-column prop="teacherId" label="教师编号" width="180"></el-table-column>
                <el-table-column prop="classroomId" label="教室编号" width="180"></el-table-column>
                <el-table-column label="时间段" width="180">
                    <template #default="scope">
                        {{ formatTimeSlot(scope.row) }}
                    </template>
                </el-table-column>
                <el-table-column label="星期几" width="180">
                    <template #default="scope">
                        {{ formatDayOfWeek(scope.row.dayOfWeek) }}
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页组件 -->
            <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="arrangedClasses.length"
                layout="prev, pager, next"
                @current-change="handlePageChange"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const arrangedClasses = ref([]) // 用于存储课表数据
const currentPage = ref(1) // 当前页码
const pageSize = ref(10) // 每页显示的条数

// 计算当前页显示的数据
const paginatedClasses = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return arrangedClasses.value.slice(start, end)
})

// 获取课表数据
const fetchTimetables = async () => {
    try {
        const response = await axios.get('http://localhost:8080/api/schedule/timetables')
        arrangedClasses.value = response.data // 将返回的数据赋值给 arrangedClasses
    } catch (error) {
        ElMessage.error('获取课表数据失败')
        console.error('获取课表数据失败', error)
    }
}

// 开始排课
const arrangeClasses = async () => {
    try {
        await axios.post('http://localhost:8080/api/schedule/autoSchedule')
        ElMessage.success('排课成功')
        fetchTimetables() // 排课成功后重新获取课表数据
    } catch (error) {
        ElMessage.error('排课失败')
        console.error('排课失败', error)
    }
}

// 格式化时间段
const formatTimeSlot = (row) => {
    return `第${row.periodInfo}节`
}

// 格式化星期几
const formatDayOfWeek = (dayOfWeek) => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    return days[dayOfWeek - 1] || '未知'
}

// 设置表格行样式
const setRowStyle = () => {
    return { height: '63px' } // 强制每行高度为 63px
}

// 处理页码变化
const handlePageChange = (page) => {
    currentPage.value = page
}

onMounted(async () => {
    await fetchTimetables() // 确保数据加载完成
})
</script>

<style scoped>
/* 设置表格行的固定高度 */
.custom-table .el-table__row {
    height: 63px; /* 固定行高，确保每行高度一致 */
}

/* 控制文字换行并限制显示两行 */
.custom-table .el-table__cell {
    display: -webkit-box; /* 使用 flex 布局 */
    -webkit-box-orient: vertical; /* 垂直布局方向 */
    -webkit-line-clamp: 2; /* 限制显示两行 */
    overflow: hidden; /* 隐藏超出部分 */
    text-overflow: ellipsis; /* 超出部分显示省略号 */
    word-break: break-word; /* 允许单词中间换行 */
    white-space: normal; /* 允许文字换行 */
    line-height: 1.5; /* 设置行高，确保两行文字显示良好 */
}
</style>