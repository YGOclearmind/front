<template>
    <div class="schedule-container">
        <el-config-provider :locale="zhCn">
      <el-calendar ref="calendar">
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
  import { ref } from 'vue'
  import { ElConfigProvider } from 'element-plus'
  import zhCn from 'element-plus/es/locale/lang/zh-cn'
  
  export default {
    setup() {
      const calendar = ref(null)
      const selectDate = (val) => {
        if (!calendar.value) return
        calendar.value.selectDate(val)
      }
  
      return {
        calendar,
        selectDate,
        zhCn,
      }
    },
  }
  </script>
  
  <style>
  .is-selected {
    color: #1989fa;
  }
  </style>