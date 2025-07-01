<template>
  <view class="login-container">
    <view class="login-background">
      <image class="bg-image" src="/static/images/login-bg.jpg" mode="aspectFill"></image>
      <view class="overlay"></view>
    </view>
    
    <view class="login-content">
      <view class="logo-area">
        <image class="logo" src="/static/images/logo.png" mode="aspectFit"></image>
        <text class="app-name">铁炼计划</text>
        <text class="app-slogan">每一次坚持，都是向更强大的自己致敬</text>
      </view>
      
      <view class="form-area">
        <view class="input-group">
          <text class="input-label">账号</text>
          <input type="text" v-model="loginForm.username" placeholder="请输入账号" class="input" />
        </view>
        
        <view class="input-group">
          <text class="input-label">密码</text>
          <input type="password" v-model="loginForm.password" placeholder="请输入密码" class="input" password />
        </view>
        
        <button @click="handleLogin" class="login-button" :loading="loading">登 录</button>
        
        <view class="actions">
          <text @click="goToRegister" class="action-text">注册账号</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { login } from '../../api/auth.js';
import store from '../../store/index.js';

export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loading: false
    };
  },
  onLoad() {
    // 检查是否已经登录，若已登录则跳转到首页
    const token = uni.getStorageSync('token');
    if (token) {
      uni.switchTab({
        url: '/pages/home/home'
      });
    }
  },
  methods: {
    // 登录处理
    async handleLogin() {
      // 表单验证
      if (!this.loginForm.username) {
        uni.showToast({
          title: '请输入账号',
          icon: 'none'
        });
        return;
      }
      
      if (!this.loginForm.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        });
        return;
      }
      
      try {
        this.loading = true;
        
        // 调用登录API
        const result = await login(this.loginForm);
        
        // 登录成功，保存token和用户信息
        store.login(result.user, result.token);
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });
        
        // 跳转到首页
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/home/home'
          });
        }, 1500);
        
      } catch (error) {
        uni.showToast({
          title: error.message || '登录失败，请检查账号密码',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 跳转到注册页
    goToRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
      });
    }
  }
};
</script>

<style>
.login-container {
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.bg-image {
  width: 100%;
  height: 100%;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.login-content {
  width: 85%;
  padding: 30px 0;
  margin-top: 15vh;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60px;
}

.logo {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
}

.app-name {
  font-size: 36px;
  color: #ffffff;
  font-weight: bold;
  letter-spacing: 3px;
  margin-bottom: 10px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.app-slogan {
  font-size: 16px;
  color: #e0e0e0;
  text-align: center;
  margin-top: 10px;
}

.form-area {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  display: block;
  font-weight: bold;
}

.input {
  width: 100%;
  height: 45px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 0 15px;
  background-color: #fff;
  font-size: 16px;
}

.login-button {
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: linear-gradient(135deg, #3F8463 0%, #2C5744 100%);
  color: white;
  border-radius: 5px;
  margin-top: 20px;
  font-size: 18px;
  letter-spacing: 2px;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.action-text {
  color: #3F8463;
  font-size: 16px;
}
</style>
