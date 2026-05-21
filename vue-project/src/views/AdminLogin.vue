<template>
  <div class="admin-login-container">
    <div class="admin-login-box">
      <h2>管理员登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="loginForm.email" 
            required 
            placeholder="请输入管理员邮箱"
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="loginForm.password" 
            required 
            placeholder="请输入管理员密码"
          />
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../services/authService'

const router = useRouter()
const loginForm = ref({
  email: 'admin@example.com', // 使用邮箱登录
  password: 'admin123'
})
const error = ref('')
const isLoading = ref(false)

// 管理员登录验证，调用后端API
const handleLogin = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    console.log('[AdminLogin] 开始登录，表单数据:', loginForm.value);
    
    // 调用登录API
    const response = await login(loginForm.value)
    
    console.log('[AdminLogin] 登录API返回:', response);
    
    // 检查响应是否有效
    if (!response) {
      console.error('[AdminLogin] 登录失败: 服务器返回空响应');
      error.value = '服务器返回空响应，请稍后重试'
      return
    }
    
    // 检查是否登录成功
    if (response.success && response.user) {
      // 检查是否是管理员
      if (response.user.role === 'admin') {
        // 登录成功且是管理员，保存登录信息到localStorage
        console.log('[AdminLogin] 登录成功且是管理员，保存登录信息');
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('userInfo', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        // 跳转到管理员主界面
        router.push('/admin');
      } else {
        // 不是管理员账号
        console.log('[AdminLogin] 不是管理员账号');
        error.value = '您没有管理员权限'
      }
    } else {
      // 登录失败，处理服务器返回的错误信息
      console.error('[AdminLogin] 登录失败: 服务器返回失败响应');
      error.value = response.error || '登录失败，请检查您的邮箱和密码'
    }
  } catch (err) {
    // 登录失败
    console.error('[AdminLogin] 登录失败:', err);
    // 确保错误消息总是可见
    error.value = err.message || '登录失败，请检查您的邮箱和密码'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.admin-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.admin-login-box {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.admin-login-box h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.error-message {
  color: #ff4d4f;
  margin-bottom: 1rem;
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #40a9ff;
}
</style>