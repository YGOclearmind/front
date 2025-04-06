<template>
  <div class="schedule-container">
    <!-- 提示信息 -->
    <div v-if="isAdminRoute" class="admin-overlay">
      管理员无法使用此功能
    </div>

    <!-- 课表内容 -->
    <el-config-provider :locale="zhCn">
      <el-calendar ref="calendar" :class="{ blurred: isAdminRoute, 'no-pointer': isAdminRoute }">
        <template #header="{ date }">
          <span>课程表</span>
          <span>{{ date }}</span>
          <el-button-group>
            <el-button size="small" @click="selectDate('prev-year')">
              上一年
            </el-button>
            <el-button size="small" @click="selectDate('prev-month')">
              上个月
            </el-button>
            <el-button size="small" @click="selectDate('today')">今天</el-button>
            <el-button size="small" @click="selectDate('next-month')">
              下个月
            </el-button>
            <el-button size="small" @click="selectDate('next-year')">
              下一年
            </el-button>
          </el-button-group>
        </template>
      </el-calendar>
    </el-config-provider>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

export default {
  setup() {
    const calendar = ref(null)
    const route = useRoute()

    // 检查当前路由是否以 admin/ 开头
    const isAdminRoute = computed(() => route.path.startsWith('/admin/'))

    const selectDate = (val) => {
      if (!calendar.value) return
      calendar.value.selectDate(val)
    }

    return {
      calendar,
      selectDate,
      zhCn,
      isAdminRoute,
    }
  },
}
</script>

<style>
.schedule-container {
  position: relative;
}

.blurred {
  filter: blur(5px); /* 虚化效果 */
}

.no-pointer {
  pointer-events: none; /* 禁用交互 */
}

.admin-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: red;
  font-size: 18px;
  text-align: center;
  z-index: 10;
  pointer-events: none; /* 禁止交互 */
}
</style>