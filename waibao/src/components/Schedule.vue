<template>
  <div class="schedule-container">
    <!-- 搜索框 -->
    <div class="search-container">
      <el-input
        v-model="teacherId"
        placeholder="请输入教师ID"
        style="width: 300px; margin-right: 10px;"
        clearable
      />
      <el-button type="primary" @click="fetchTimetable">搜索</el-button>
    </div>

    <!-- 视图切换按钮 -->
    <div class="view-toggle">
      <el-button-group>
        <el-button
          :type="currentView === 'month' ? 'primary' : 'default'"
          @click="currentView = 'month'"
        >
          月视图
        </el-button>
        <el-button
          :type="currentView === 'week' ? 'primary' : 'default'"
          @click="currentView = 'week'"
        >
          周视图
        </el-button>
      </el-button-group>
    </div>

    <!-- 月视图 -->
    <div v-if="currentView === 'month'" class="calendar-container">
      <div class="calendar-header">
        <span class="calendar-title">{{ currentDate.getFullYear() }}年{{ currentDate.getMonth() + 1 }}月</span>
        <el-button-group>
          <el-button size="small" @click="selectDate('prev-year')">上一年</el-button>
          <el-button size="small" @click="selectDate('prev-month')">上个月</el-button>
          <el-button size="small" @click="selectDate('today')">今天</el-button>
          <el-button size="small" @click="selectDate('next-month')">下个月</el-button>
          <el-button size="small" @click="selectDate('next-year')">下一年</el-button>
        </el-button-group>
      </div>
      <div class="calendar-weekdays">
        <span v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day">{{ day }}</span>
      </div>
      <div class="calendar-days">
        <div
          v-for="day in daysOfMonth"
          :key="day.date"
          :class="['calendar-day', { 'current-day': day.isToday }, { 'out-of-month': day.isOutOfMonth }]"
          @click="selectDay(day.date)"
        >
          <div class="day-number">{{ day.number }}</div>
          <div class="day-events" v-if="!day.isOutOfMonth">
            <div 
              v-for="event in getDayEvents(day.date)" 
              :key="event.id" 
              class="calendar-event"
              :style="{ backgroundColor: getEventColor(event) }"
            >
            
              <span class="event-title">{{ event.courseName }}</span>
              <span class="event-location">{{ event.classroomId }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 周视图 -->
    <div v-if="currentView === 'week'" class="week-view-container">
      <div class="week-header">
        <span class="week-title">
          {{ weekStartDate.toLocaleDateString('zh-CN') }} - {{ weekEndDate.toLocaleDateString('zh-CN') }}
        </span>
        <el-button-group>
          <el-button size="small" @click="selectWeek('prev-week')">上一周</el-button>
          <el-button size="small" @click="selectWeek('today')">本周</el-button>
          <el-button size="small" @click="selectWeek('next-week')">下一周</el-button>
        </el-button-group>
      </div>
      <div class="week-grid">
        <div class="week-row header-row">
          <div class="period-header">时间</div>
          <div 
            v-for="day in weekDays" 
            :key="day.date" 
            class="week-day-header"
          >
            <div class="weekday-name">{{ dayNames[day.date.getDay()] }}</div>
            <div class="weekday-date">{{ formatDate(day.date) }}</div>
          </div>
        </div>
        <div 
          v-for="period in 12" 
          :key="period" 
          class="week-row"
        >
          <div class="period-header">
            第 {{ period }} 节
          </div>
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="week-period"
            :class="{ 'has-class': hasClass(day.date, period) }"
          >
            <template v-if="hasClass(day.date, period)">
              <div class="course-name">{{ getCourseInfo(day.date, period).courseName }}</div>
              <div class="classroom">{{ getCourseInfo(day.date, period).classroomId }}</div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹出窗口显示课程详情 -->
    <el-dialog
      v-model="dialogVisible"
      title="课程详情"
      width="50%"
    >
      <div v-if="filteredTimetable.length">
        <el-table
          :data="filteredTimetable"
          style="width: 100%"
          :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="classroomId" label="教室" />
          <el-table-column prop="scheduleTime" label="时间" />
          <el-table-column prop="periodInfo" label="节次" />
          <el-table-column prop="dayOfWeek" label="星期" />
        </el-table>
      </div>
      <div v-else>
        <span>当天没有课程安排</span>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from 'axios';

export default {
  setup() {
    const teacherId = ref('');
    const timetable = ref([]);
    const dialogVisible = ref(false);
    const selectedDate = ref(null);
    const currentDate = ref(new Date());
    const daysOfMonth = ref([]);
    const currentView = ref('month');
    const weekStartDate = ref(new Date());
    const weekEndDate = ref(new Date());
    const weekDays = ref([]);
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    const colorPalette = ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F8B195', '#F67280', '#C06C84', '#6C5B7B', '#355C7D'];

    const fetchTimetable = async () => {
      if (!teacherId.value) {
        ElMessage.error('请输入教师ID');
        return;
      }
      try {
        const response = await axios.get(
          `http://127.0.0.1:8080/api/teachers/getTeacherTimeTable/${teacherId.value}`
        );
        timetable.value = response.data;
        generateDaysOfMonth();
        generateWeekDays();
        ElMessage.success('课表加载成功');
      } catch (error) {
        ElMessage.error('获取课表失败，请检查教师ID');
        console.error(error);
      }
    };

    const generateDaysOfMonth = () => {
      const date = new Date(currentDate.value);
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const daysInMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      ).getDate();
      const days = [];
      const startDayIndex = firstDay.getDay();

      // 添加上个月的剩余天数
      for (let i = startDayIndex; i > 0; i--) {
        days.push({
          number: new Date(
            firstDay.getFullYear(),
            firstDay.getMonth(),
            -i + 1
          ).getDate(),
          date: new Date(
            firstDay.getFullYear(),
            firstDay.getMonth(),
            -i + 1
          ),
          isOutOfMonth: true,
        });
      }

      // 添加本月的天数
      for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(firstDay);
        dayDate.setDate(i);
        days.push({
          number: i,
          date: dayDate,
          isToday: dayDate.toDateString() === new Date().toDateString(),
        });
      }

      // 添加下个月的天数
      const nextMonthFirstDay = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        1
      );
      const daysLeftInWeek = 7 - (days.length % 7 || 7);

      for (let i = 1; i <= daysLeftInWeek; i++) {
        days.push({
          number: i,
          date: new Date(
            nextMonthFirstDay.getFullYear(),
            nextMonthFirstDay.getMonth(),
            i
          ),
          isOutOfMonth: true,
        });
      }

      daysOfMonth.value = days;
    };

    const generateWeekDays = () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      weekStartDate.value = startOfWeek;
      weekEndDate.value = endOfWeek;

      const days = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        days.push({ date });
      }
      weekDays.value = days;
    };

    const selectDate = (option) => {
      const date = new Date(currentDate.value);
      switch (option) {
        case 'prev-year':
          date.setFullYear(date.getFullYear() - 1);
          break;
        case 'prev-month':
          date.setMonth(date.getMonth() - 1);
          break;
        case 'today':
          currentDate.value = new Date();
          generateDaysOfMonth();
          return;
        case 'next-month':
          date.setMonth(date.getMonth() + 1);
          break;
        case 'next-year':
          date.setFullYear(date.getFullYear() + 1);
          break;
      }
      currentDate.value = date;
      generateDaysOfMonth();
    };

    const selectWeek = (option) => {
      const startOfWeek = new Date(weekStartDate.value);
      switch (option) {
        case 'prev-week':
          startOfWeek.setDate(startOfWeek.getDate() - 7);
          break;
        case 'next-week':
          startOfWeek.setDate(startOfWeek.getDate() + 7);
          break;
        case 'today':
          const today = new Date();
          today.setDate(today.getDate() - today.getDay());
          weekStartDate.value = today;
          generateWeekDays();
          return;
      }
      weekStartDate.value = startOfWeek;
      generateWeekDays();
    };

    const getDayEvents = (date) => {
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
      return timetable.value.filter(item => item.dayOfWeek === dayOfWeek);
    };

    const hasClass = (date, period) => {
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
      return timetable.value.some(item => 
        item.dayOfWeek === dayOfWeek && 
        item.periodInfo.split(',').includes(String(period))
      );
    };

    const getCourseInfo = (date, period) => {
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
      const course = timetable.value.find(item => 
        item.dayOfWeek === dayOfWeek && 
        item.periodInfo.split(',').includes(String(period)));
      return course || {};
    };

    const getEventColor = (event) => {
      const index = (event.courseName?.charCodeAt(0) || 0) % colorPalette.length;
      return colorPalette[index];
    };

    const formatDate = (date) => {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    const selectDay = (date) => {
      selectedDate.value = date;
    };

    const showDetails = (dayOfWeek) => {
      selectedDate.value = dayOfWeek;
      dialogVisible.value = true;
    };

    const filteredTimetable = computed(() => {
      if (!selectedDate.value) return [];
      const dayOfWeek = selectedDate.value.getDay() === 0 ? 7 : selectedDate.value.getDay();
      return timetable.value.filter((entry) => entry.dayOfWeek === dayOfWeek);
    });

    onMounted(() => {
      generateDaysOfMonth();
      generateWeekDays();
    });

    return {
      teacherId,
      timetable,
      dialogVisible,
      selectedDate,
      currentDate,
      daysOfMonth,
      currentView,
      weekStartDate,
      weekEndDate,
      weekDays,
      dayNames,
      fetchTimetable,
      selectDate,
      selectWeek,
      getDayEvents,
      hasClass,
      getCourseInfo,
      getEventColor,
      formatDate,
      selectDay,
      showDetails,
      filteredTimetable,
    };
  },
};
</script>

<style scoped>
.schedule-container {
  position: relative;
  padding: 20px;
  max-width: 1000px; /* 限制最大宽度 */
  margin: 0 auto;
}

.search-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.view-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.calendar-header,
.week-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px; /* 缩小字体 */
  font-weight: bold;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px; /* 缩小字体 */
  font-weight: bold;
  margin-bottom: 5px;
  color: #606266;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px; /* 减小间距 */
}

.calendar-day {
  min-height: 80px; /* 缩小高度 */
  padding: 6px; /* 减小内边距 */
  border-radius: 6px; /* 缩小圆角 */
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); /* 减小阴影 */
  transition: all 0.3s ease;
}

.calendar-day:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.current-day {
  border: 2px solid #409EFF;
  background-color: #f0f7ff;
}

.out-of-month {
  opacity: 0.4;
  background-color: #f9f9f9;
}

.day-number {
  font-size: 12px; /* 缩小字体 */
  font-weight: bold;
  margin-bottom: 4px;
  color: #303133;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 2px; /* 减小事件间距 */
}

.calendar-event {
  padding: 2px 4px; /* 减小内边距 */
  border-radius: 4px;
  font-size: 10px; /* 缩小字体 */
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-time {
  font-weight: bold;
  margin-right: 4px;
}

.event-title {
  font-weight: bold;
}

.event-location {
  display: block;
  font-size: 10px; /* 缩小字体 */
  opacity: 0.9;
}

/* 周视图样式 */
.week-view-container {
  width: 100%;
  overflow-x: auto;
  margin-top: 20px;
}

.week-grid {
  display: flex;
  flex-direction: column;
  min-width: fit-content;
  border: 1px solid #ebeef5;
  border-radius: 6px; /* 缩小圆角 */
  overflow: hidden;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.1); /* 减小阴影 */
}

.week-row {
  display: flex;
  min-height: 50px; /* 缩小高度 */
}

.header-row {
  background-color: #f5f7fa;
  font-weight: bold;
}

.period-header {
  width: 70px; /* 缩小宽度 */
  min-width: 60px;
  padding: 6px; /* 减小内边距 */
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  background-color: #f5f7fa;
  font-size: 12px; /* 缩小字体 */
}

.week-day-header {
  width: 100px; /* 缩小宽度 */
  min-width: 100px;
  padding: 6px; /* 减小内边距 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  text-align: center;
  font-size: 12px; /* 缩小字体 */
}

.weekday-name {
  font-size: 14px; /* 缩小字体 */
  color: #303133;
}

.weekday-date {
  font-size: 10px; /* 缩小字体 */
  color: #909399;
}

.week-period {
  width: 100px; /* 缩小宽度 */
  min-width: 100px;
  padding: 6px; /* 减小内边距 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  text-align: center;
  font-size: 10px; /* 缩小字体 */
}

.week-period.has-class {
  background-color: #f0f9eb;
}

.course-name {
  font-weight: bold;
  color: #67C23A;
  margin-bottom: 4px;
  font-size: 12px; /* 缩小字体 */
}

.classroom {
  font-size: 10px; /* 缩小字体 */
  color: #909399;
}
@media (max-width: 768px) {
  .schedule-container {
    padding: 10px;
  }

  .search-container {
    flex-direction: column;
    align-items: center;
  }

  .search-container .el-input {
    width: 100% !important;
    margin-bottom: 10px;
  }

  .view-toggle {
    flex-direction: column;
    align-items: center;
  }

  .calendar-header,
  .week-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .calendar-weekdays,
  .calendar-days {
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .calendar-day {
    min-height: 60px;
    padding: 4px;
  }

  .week-day-header,
  .week-period {
    min-width: 80px;
    width: 80px;
    padding: 4px;
    font-size: 10px;
  }

  .period-header {
    width: 60px;
    font-size: 10px;
  }

  .course-name {
    font-size: 10px;
  }

  .classroom {
    font-size: 9px;
  }
}

</style>