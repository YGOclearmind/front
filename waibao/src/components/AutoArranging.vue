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
            <el-button type="success" @click="manualScheduleShow = true">手动排课</el-button>
            <el-button type="info" @click="fetchTimetables">刷新课表</el-button>
            <el-button type="warning" @click="exportTimetable">保存课表</el-button>
            <div class="table-and-error">
                <!-- 课表 -->
                <div class="table-container">
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
                <!-- 排课失败原因显示区域 -->
                <div v-if="scheduleError" class="error-container">
                    <el-alert
                        title="排课失败"
                        type="error"
                        :description="'失败原因：'+ scheduleError "
                        show-icon
                        closable
                        @close="scheduleError = ''"
                    />
                </div>
            </div>
        </div>
        <!-- 手动排课对话框 -->
        <el-dialog title="手动排课" v-model="manualScheduleShow" width="50%">
            <el-form :model="manualScheduleForm" ref="manualScheduleForm" label-width="120px">
                <el-form-item label="班级 ID">
                <el-input v-model="manualScheduleForm.classId" placeholder="请输入班级 ID"></el-input>
                </el-form-item>
                <el-form-item label="课程 ID">
                <el-input v-model="manualScheduleForm.courseId" placeholder="请输入课程 ID"></el-input>
                </el-form-item>
                <el-form-item label="教师 ID">
                <el-input v-model="manualScheduleForm.teacherId" placeholder="请输入教师 ID"></el-input>
                </el-form-item>
                <el-form-item label="教室 ID">
                <el-input v-model="manualScheduleForm.classroomId" placeholder="请输入教室 ID"></el-input>
                </el-form-item>
                <el-form-item label="星期几">
                <el-select v-model="manualScheduleForm.dayOfWeek" placeholder="请选择星期几">
                    <el-option v-for="(day, index) in days" :key="index" :label="day" :value="index + 1" />
                </el-select>
                </el-form-item>
                <el-form-item label="时间段">
                <el-input v-model="manualScheduleForm.periodInfo" placeholder="请输入时间段，例如：1,2,3"></el-input>
                </el-form-item>
            </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="manualScheduleShow = false">取消</el-button>
            <el-button type="primary" @click="submitManualSchedule">确定</el-button>
        </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const arrangedClasses = ref([]) // 用于存储课表数据
const currentPage = ref(1) // 当前页码
const pageSize = ref(10) // 每页显示的条数
const manualScheduleShow = ref(false) // 是否显示手动排课、
const scheduleError = ref('') // 用于存储排课失败的原因

// 手动排课表单数据
const manualScheduleForm = ref({
  classId: '',
  courseId: '',
  teacherId: '',
  classroomId: '',
  dayOfWeek: '',
  periodInfo: '',
})

const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']


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
        const classId = prompt('请输入班级数量', '1'); // 弹窗让用户输入班级ID
        if (!classId) {
            ElMessage.warning('班级数量不能为空');
            return;
        }
        else if(classId<=0){
            elMessage.warning('班级数量必须大于0');
            return;
        }
        const response = await axios.post(`http://localhost:8080/api/schedule/autoScheduleMultiClass/${classId}`);
        if (response.data.includes('失败')) {
            scheduleError.value = response.data; // 如果失败，显示失败原因
        } else {
            ElMessage.success(response.data || '排课成功');
            scheduleError.value = ''; // 清空失败原因
            fetchTimetables(); // 排课成功后重新获取课表数据
        }
    } catch (error) {
        scheduleError.value = error.response?.data || '排课失败，发生未知错误';
        console.error('排课失败', error);
    }
};

// 提交手动排课数据
const submitManualSchedule = async () => {
  try {
    const response = await axios.post('http://localhost:8080/api/schedule/manualSchedule', manualScheduleForm.value)
    ElMessage.success(response.data || '手动排课成功')
    manualScheduleShow.value = false // 关闭对话框
    fetchTimetables() // 刷新课表数据
  } catch (error) {
    ElMessage.error('手动排课失败')
    console.error('手动排课失败', error)
  }
}

// 导出课表
const exportTimetable = async () => {
    try {
        const classId = prompt('请输入班级ID以导出课表', '1'); // 弹窗让用户输入班级ID
        if (!classId) {
            ElMessage.warning('班级ID不能为空');
            return;
        }
        const response = await axios({
            url: `http://localhost:8080/api/schedule/exportExcel/${classId}`,
            method: 'GET',
            responseType: 'blob', // 确保接收的是文件流
        });

        // 创建下载链接
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `班级${classId}课表.xlsx`;
        link.click();
        window.URL.revokeObjectURL(link.href); // 释放 URL 对象
        ElMessage.success('课表已成功导出');
    } catch (error) {
        ElMessage.error('导出课表失败');
        console.error('导出课表失败', error);
    }
};


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

/*错误提示样式*/
.error-container {
    margin-top: 20px;
}

.arrange-container {
    margin-top: 20px;
}

.table-and-error {
    display: flex; /* 使用 flex 布局 */
    gap: 20px; /* 设置表格和错误信息之间的间距 */
}

.table-container {
    flex: 3; /* 表格占据更多空间 */
}

.error-container {
    flex: 1; /* 错误信息占据较少空间 */
    max-width: 300px; /* 限制错误信息的最大宽度 */
}
</style>