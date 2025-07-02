<template>
  <view class="login-container">
    <image class="bg-image" src="/static/login_bg.png" mode="aspectFill"></image>
    <view class="overlay"></view>
    
    <view class="login-content">
      <view class="logo-area">
        <image class="logo" src="/static/images/logo.png" mode="aspectFit"></image>
        <text class="app-name">铁炼计划</text>
        <text class="app-slogan">每一次坚持，都是向更强大的自己致敬</text>
      </view>
      
      <view class="form-area">
        <view class="input-group">
          <text class="iconfont icon-user"></text>
          <input type="text" v-model="loginForm.username" placeholder="请输入账号" placeholder-style="color: rgba(255, 255, 255, 0.9);" class="input" />
        </view>
        
        <view class="input-group">
          <text class="iconfont icon-lock"></text>
          <input type="password" v-model="loginForm.password" placeholder="请输入密码" placeholder-style="color: rgba(255, 255, 255, 0.9);" class="input" password />
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
  onLoad() {
    // 检查是否已登录并且token未过期
    if (store.isTokenValid() && store.getState().isLoggedIn) {
      // 已登录用户重定向到首页
      uni.switchTab({
        url: '/pages/home/home'
      });
    }
  },
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
        
        // 登录成功，保存token和用户信息以及过期时间
        // 使用后端返回的过期时间，如果没有则默认7天
        const expiresIn = result.expiresIn ? result.expiresIn * 1000 : 7 * 24 * 60 * 60 * 1000;
        store.login(result.user, result.token, expiresIn);
        
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

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  object-fit: cover;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: -1;
}

.login-content {
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10vh;
  margin-bottom: 10vh;
}

.logo {
  width: 100px;
  height: 100px;
  margin-bottom: 16px;
}

.app-name {
  font-size: 36px;
  color: #ffffff;
  font-weight: bold;
  letter-spacing: 3px;
  margin-bottom: 8px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.app-slogan {
  font-size: 16px;
  color: #ffffff;
  text-align: center;
  margin-top: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.form-area {
  padding: 0 20px;
  width: 90%;
}

.input-group {
  margin-bottom: 25px;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
}

.iconfont {
  color: #ffffff;
  font-size: 22px;
  margin-right: 10px;
}

.input {
  flex: 1;
  height: 50px;
  background-color: transparent;
  border: none;
  color: #ffffff;
  font-size: 16px;
  padding-right: 10px;
}

.input::placeholder {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.login-button {
  width: 100%;
  height: 50px;
  background-color: #3F8463;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 25px;
  margin-top: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 10px rgba(63, 132, 99, 0.3);
}

.login-button:active {
  background-color: #346e52;
  transform: translateY(1px);
}

.actions {
  display: flex;
  justify-content: center;
}

.action-text {
  color: #ffffff;
  font-size: 16px;
  text-decoration: underline;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
