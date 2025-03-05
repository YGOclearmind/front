<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from 'element-plus/es/components/loading/src/service'


const emit = defineEmits(['login-success'])

const form = ref({
  username: '123',
  password: '123'
})

//定义表单校验规则
const rules=reactive({
    username:[
        {required:true,message:'请输入用户名',trigger:'blur'},
        {pattern:/\w/,message:'用户名格式不正确',trigger:'blur'}
    ],
    password:[
        {required:true,message:'请输入密码',trigger:'blur'},
        {min:6,max:18,message:'密码长度在6~18之间',trigger:'blur'}
    ]
})
const formRef=ref()

//登录请求
const handleLogin = async () => {

  isLoading.value=true

  try {
    await formRef.value.validate()
    ElMessage.success('登录成功')
    isLoading.value=false
    emit('login-success')
  } catch (error) {
    ElMessage.error('表单校验失败')
    isLoading.value=false
    throw error
  }
  isLoading.value=false
  console.log("正式登录请求")
}

//是否登录加载中
const isLoading=ref(false)

</script>

<template>
    <div class="login">
  <el-form :model="form" :rules="rules" ref="formRef" >
    <h2>登录</h2>
    <el-form-item label="账号 :" prop="username">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="密码 :" prop="password">
      <el-input v-model="form.password" type="password" />
    </el-form-item>
    <el-button type="primary" @click="handleLogin" :Loading="isLoading">登录</el-button>
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
.el-form{
    width: 300px;
    border-radius: 10px;
    padding: 5px;
}
.el-form-item{
    margin-top: 20px;
}
.el-button{
    width: 100%;
    margin-top: 10px;
}
</style>