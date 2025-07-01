<template>
  <view class="register-container">
    <image class="bg-image" src="/static/register_bg.png" mode="aspectFill"></image>
    <view class="overlay"></view>
    
    <view class="register-content">
      <view class="header">
        <text class="title">新兵报到</text>
        <text class="subtitle">加入铁炼计划，开启你的军旅健身之路</text>
      </view>
      
      <view class="form-area">
        <view class="input-group">
          <text class="iconfont icon-user"></text>
          <input type="text" v-model="registerForm.username" placeholder="请输入用户名" placeholder-style="color: rgba(255, 255, 255, 0.9);" class="input" />
        </view>
        
        <view class="input-group">
          <text class="iconfont icon-lock"></text>
          <input type="password" v-model="registerForm.password" placeholder="请输入密码" placeholder-style="color: rgba(255, 255, 255, 0.9);" class="input" password />
        </view>
        
        <view class="input-group">
          <text class="iconfont icon-check"></text>
          <input type="password" v-model="confirmPassword" placeholder="请再次输入密码" placeholder-style="color: rgba(255, 255, 255, 0.9);" class="input" password />
        </view>
        
        <view class="input-group">
          <text class="iconfont icon-user-tag"></text>
          <input type="text" v-model="registerForm.nickname" placeholder="请输入昵称" placeholder-style="color: rgba(255, 255, 255, 0.9);" class="input" />
        </view>
        
        <!-- 兵种选择已移除 -->
        
        <button @click="handleRegister" class="register-button" :loading="loading">立即报到</button>
        
        <view class="actions">
          <text @click="goToLogin" class="action-text">已有账号，直接登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { register } from '../../api/auth.js';

export default {
  data() {
    return {
      registerForm: {
        username: '',
        password: '',
        nickname: '',
        soldierType: '战士'
      },
      confirmPassword: '',
      soldierTypes: ['战士', '侦察兵-80s', '炮兵-90s', '装甲兵-00s'],
      soldierTypeIndex: 0,
      loading: false
    };
  },
  methods: {
    // 兵种选择功能已移除
    
    // 注册处理
    async handleRegister() {
      // 表单验证
      if (!this.registerForm.username) {
        uni.showToast({
          title: '请输入用户名',
          icon: 'none'
        });
        return;
      }
      
      if (!this.registerForm.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        });
        return;
      }
      
      if (this.registerForm.password !== this.confirmPassword) {
        uni.showToast({
          title: '两次输入的密码不一致',
          icon: 'none'
        });
        return;
      }
      
      if (!this.registerForm.nickname) {
        uni.showToast({
          title: '请输入昵称',
          icon: 'none'
        });
        return;
      }
      
      // 兵种默认为战士，无需验证
      
      try {
        this.loading = true;
        
        // 调用注册API
        await register(this.registerForm);
        
        uni.showToast({
          title: '注册成功，请登录',
          icon: 'success'
        });
        
        // 跳转到登录页
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }, 1500);
        
      } catch (error) {
        uni.showToast({
          title: error.message || '注册失败，请稍后重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 跳转到登录页
    goToLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    }
  }
};
</script>

<style>
.register-container {
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

.register-content {
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 6vh;
  margin-bottom: 6vh;
}

.title {
  font-size: 36px;
  color: #ffffff;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.subtitle {
  font-size: 16px;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.form-area {
  padding: 0 20px;
  width: 90%;
  margin: 0 auto;
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
  color: rgba(255, 255, 255, 1);
  font-weight: 500;
}

.picker-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  height: 50px;
  background-color: transparent;
  border: none;
  padding-right: 10px;
  color: #ffffff;
}

.placeholder {
  color: rgba(255, 255, 255, 1);
  font-weight: 500;
}

.picker-arrow {
  color: #ffffff;
  font-size: 14px;
}

.register-button {
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

.register-button:active {
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
