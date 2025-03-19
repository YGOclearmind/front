<script setup>
import { ref, reactive,onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import router from './router'

onMounted(() => {
  
  if(showLogin.value){
    router.push('/')
}});

const showLogin = ref(true)
const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  type: 'student' // 默认用户类型为学生
})

//定义表单校验规则
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /\w/, message: '用户名格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 18, message: '密码长度在6~18之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value !== form.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, trigger: 'blur'
    }
  ]
})
const formRef = ref()

//是否登录加载中
const isLoading = ref(false)

//当前是否是注册界面
const isRegister = ref(false)

//注册请求
const handleRegister = async () => {
  isLoading.value = true

  try {
    await formRef.value.validate()
    const response = await axios.post('http://localhost:8080/user/register', {
      username: form.value.username,
      password: form.value.password
    })
    if (response.data === '注册成功') {
      ElMessage.success('注册成功')
      isRegister.value = false // 注册成功后返回登录界面
    } else {
      ElMessage.error(response.data)
    }
  } catch (error) {
    ElMessage.error('表单校验失败')
    throw error
  } finally {
    isLoading.value = false
  }
}

//登录请求
const handleLogin = async () => {
  isLoading.value = true

  try {
    await formRef.value.validate()
    const response = await axios.post('http://localhost:8080/user/login', {
      username: form.value.username,
      password: form.value.password,
      type: form.value.type === 'student' ? 1 : 2 // 1代表学生，2代表教师
    })
    if (response.data.includes('登录成功')) {
      ElMessage.success('登录成功')
      showLogin.value = false
      if (form.value.type === 'student') {
        router.push('/student')
      } else if (form.value.type === 'teacher') {
        router.push('/teacher')
      }
    } else {
      ElMessage.error(response.data)
    }
  } catch (error) {
    console.error('登录请求失败:', error)
    ElMessage.error('用户或密码错误')
    throw error
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <router-view v-if="!showLogin"></router-view>
  <div class="login-container">
    <div class="login" v-if="showLogin">
      <el-form :model="form" :rules="rules" ref="formRef">
        <h2>{{ isRegister ? '注册' : '登录' }}</h2>
        <el-form-item label="账号 :" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码 :" prop="password">
          <el-input v-model="form.password" type="password" />
        </el-form-item>
        <el-form-item v-if="isRegister" label="确认密码 :" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" />
        </el-form-item>
        <el-form-item v-if="!isRegister" label="用户类型 :" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="student">学生</el-radio>
            <el-radio label="teacher">教师</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item class="button-group">
          <el-button type="primary" @click="isRegister ? handleRegister() : handleLogin()" :loading="isLoading">
            {{ isRegister ? '注册' : '登录' }}
          </el-button>
          <el-button type="default" @click="isRegister = !isRegister">
            {{ isRegister ? '返回登录' : '注册' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.login {
  width: 300px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-form-item {
  margin-top: 20px;
}

.button-group {
  display: flex;
  justify-content: space-between;
}

.el-button {
  width: 48%;
  margin-top: 10px;
}
</style>