<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from 'element-plus/es/components/loading/src/service'
import axios from 'axios'

const emit = defineEmits(['login-success'])

const form = ref({
  username: '',
  password: '',
  confirmPassword: ''
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
      password: form.value.password
    })
    if (response.data .includes('登录成功')) {
      ElMessage.success('登录成功')
      emit('login-success') // 触发登录成功事件
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

</script>

<template>
  <div class="login">
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
      <el-form-item class="button-group">
        <el-button type="primary" @click="isRegister ? handleRegister() : handleLogin()" :Loading="isLoading">
          {{ isRegister ? '注册' : '登录' }}
        </el-button>
        <el-button type="default" @click="isRegister = !isRegister">
          {{ isRegister ? '返回登录' : '注册' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.login {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.el-form {
  width: 300px;
  border-radius: 10px;
  padding: 5px;
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