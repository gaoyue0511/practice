<template>
  <div class="forgot-password-container">
    <div class="forgot-password-box">
      <h2>忘记密码</h2>
      <p>请输入您注册时使用的邮箱，我们将发送密码重置链接到您的邮箱。</p>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">邮箱地址</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="请输入邮箱地址"
            required
          />
        </div>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '发送中...' : '发送重置链接' }}
        </button>
      </form>
      <p class="link-text">
        <router-link to="/login">返回登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  try {
    alert(`密码重置链接已发送到邮箱: ${email.value}`)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.forgot-password-box {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 8px;
  color: #333;
}

p {
  text-align: center;
  color: #666;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link-text {
  text-align: center;
  margin-top: 20px;
}

.link-text a {
  color: #667eea;
  text-decoration: none;
}

.link-text a:hover {
  text-decoration: underline;
}
</style>