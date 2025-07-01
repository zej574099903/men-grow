<template>
  <view class="register-container">
    <view class="register-background">
      <image class="bg-image" src="/static/images/register-bg.jpg" mode="aspectFill"></image>
      <view class="overlay"></view>
    </view>
    
    <view class="register-content">
      <view class="header">
        <text class="title">新兵报到</text>
        <text class="subtitle">加入铁炼计划，开启你的军旅健身之路</text>
      </view>
      
      <view class="form-area">
        <view class="input-group">
          <text class="input-label">用户名</text>
          <input type="text" v-model="registerForm.username" placeholder="请输入用户名" class="input" />
        </view>
        
        <view class="input-group">
          <text class="input-label">密码</text>
          <input type="password" v-model="registerForm.password" placeholder="请输入密码" class="input" password />
        </view>
        
        <view class="input-group">
          <text class="input-label">确认密码</text>
          <input type="password" v-model="confirmPassword" placeholder="请再次输入密码" class="input" password />
        </view>
        
        <view class="input-group">
          <text class="input-label">昵称</text>
          <input type="text" v-model="registerForm.nickname" placeholder="请输入昵称" class="input" />
        </view>
        
        <view class="input-group">
          <text class="input-label">选择兵种</text>
          <picker @change="onSoldierTypeChange" :value="soldierTypeIndex" :range="soldierTypes">
            <view class="picker-view">
              <text v-if="registerForm.soldierType">{{ registerForm.soldierType }}</text>
              <text v-else class="placeholder">请选择兵种</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>
        
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
        soldierType: ''
      },
      confirmPassword: '',
      soldierTypes: ['侦察兵-80s', '炮兵-90s', '装甲兵-00s'],
      soldierTypeIndex: 0,
      loading: false
    };
  },
  methods: {
    // 兵种选择器变化
    onSoldierTypeChange(e) {
      this.soldierTypeIndex = e.detail.value;
      this.registerForm.soldierType = this.soldierTypes[this.soldierTypeIndex];
    },
    
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
      
      if (!this.registerForm.soldierType) {
        uni.showToast({
          title: '请选择兵种',
          icon: 'none'
        });
        return;
      }
      
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

.register-background {
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

.register-content {
  width: 85%;
  padding: 30px 0;
  margin-top: 10vh;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
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
  color: #e0e0e0;
  text-align: center;
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

.picker-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 45px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 0 15px;
  background-color: #fff;
}

.placeholder {
  color: #999;
}

.picker-arrow {
  color: #666;
  font-size: 12px;
}

.register-button {
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
