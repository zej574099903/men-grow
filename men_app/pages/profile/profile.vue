<template>
  <view class="profile-container">
    <!-- 顶部个人信息卡片 -->
    <view class="profile-header">
      <view class="avatar-container">
        <image class="avatar" :src="userInfo.avatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
        <view class="soldier-type">{{ getSoldierTypeText(userInfo.soldierType) }}</view>
      </view>
      <view class="user-info">
        <text class="nickname">{{ userInfo.nickname || '未设置昵称' }}</text>
        <text class="username">账号: {{ userInfo.username }}</text>
        <view class="training-stats">
          <view class="stat-item">
            <text class="stat-value">{{ trainingStats.daysCount }}</text>
            <text class="stat-label">训练天数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ trainingStats.totalSessions }}</text>
            <text class="stat-label">训练次数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ formatDuration(trainingStats.totalDuration) }}</text>
            <text class="stat-label">总时长</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-header">
        <text class="menu-title">训练数据</text>
      </view>
      <view class="menu-list">
        <view class="menu-item" @click="navigateTo('/pages/training/training-log')">
          <text class="icon training-icon"></text>
          <text class="menu-text">训练记录</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/training/stats')">
          <text class="icon stats-icon"></text>
          <text class="menu-text">训练统计</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/achievements/medals')">
          <text class="icon medals-icon"></text>
          <text class="menu-text">勋章墙</text>
          <text class="arrow">></text>
        </view>
      </view>
    </view>
    
    <view class="menu-section">
      <view class="menu-header">
        <text class="menu-title">个人中心</text>
      </view>
      <view class="menu-list">
        <view class="menu-item" @click="navigateTo('/pages/profile/edit-profile')">
          <text class="icon edit-icon"></text>
          <text class="menu-text">编辑资料</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/settings/settings')">
          <text class="icon settings-icon"></text>
          <text class="menu-text">设置</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="handleFeedback()">
          <text class="icon feedback-icon"></text>
          <text class="menu-text">意见反馈</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="handleAbout()">
          <text class="icon about-icon"></text>
          <text class="menu-text">关于我们</text>
          <text class="arrow">></text>
        </view>
      </view>
    </view>
    
    <!-- 退出登录按钮 -->
    <view class="logout-container">
      <button class="logout-btn" @click="logout">退出登录</button>
    </view>
  </view>
</template>

<script>
import { getUserProfile } from '../../api/user.js';
import { getTrainingStats } from '../../api/training.js';
import { mapState } from 'vuex';

export default {
  data() {
    return {
      userInfo: {
        username: '',
        nickname: '',
        avatar: '',
        soldierType: 1
      },
      trainingStats: {
        daysCount: 0,
        totalSessions: 0,
        totalDuration: 0
      }
    };
  },
  computed: {
    ...mapState(['token', 'user'])
  },
  onShow() {
    this.loadUserProfile();
    this.loadTrainingStats();
  },
  methods: {
    // 加载用户资料
    loadUserProfile() {
      // 先使用store中的用户信息
      if (this.user) {
        this.userInfo = { ...this.user };
      }
      
      // 再从API获取最新信息
      getUserProfile().then(res => {
        // 实际项目中应该使用API返回的数据
        // 这里先使用模拟数据
        this.userInfo = {
          username: 'soldier001',
          nickname: '铁血战士',
          avatar: '/static/images/default-avatar.png',
          soldierType: 2 // 假设1=新兵，2=列兵，3=班长...
        };
      }).catch(err => {
        console.error('获取用户资料失败:', err);
      });
    },
    
    // 加载训练统计数据
    loadTrainingStats() {
      getTrainingStats().then(res => {
        // 实际项目中应该使用API返回的数据
        // 这里先使用模拟数据
        this.trainingStats = {
          daysCount: 42,
          totalSessions: 87,
          totalDuration: 57600 // 总训练时长（秒）
        };
      }).catch(err => {
        console.error('获取训练统计失败:', err);
      });
    },
    
    // 获取兵种/军衔文本
    getSoldierTypeText(type) {
      const typeMap = {
        1: '新兵',
        2: '列兵',
        3: '班长',
        4: '排长',
        5: '连长'
      };
      return typeMap[type] || '新兵';
    },
    
    // 格式化时长
    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600);
      return `${hours}小时`;
    },
    
    // 页面导航
    navigateTo(url) {
      uni.navigateTo({
        url: url
      });
    },
    
    // 处理意见反馈
    handleFeedback() {
      uni.showToast({
        title: '反馈功能开发中',
        icon: 'none'
      });
    },
    
    // 关于我们
    handleAbout() {
      uni.showModal({
        title: '关于铁炼计划',
        content: '铁炼计划是一款专为军人设计的健身训练应用，旨在提高军人身体素质和战斗力。版本号: v1.0.0',
        showCancel: false
      });
    },
    
    // 退出登录
    logout() {
      uni.showModal({
        title: '提示',
        content: '确认退出登录？',
        success: (res) => {
          if (res.confirm) {
            // 清除本地存储的token和用户信息
            this.$store.commit('logout');
            
            // 跳转到登录页
            uni.reLaunch({
              url: '/pages/login/login'
            });
          }
        }
      });
    }
  }
};
</script>

<style>
.profile-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 30px;
}

/* 顶部个人信息卡片样式 */
.profile-header {
  background-color: #3F8463;
  padding: 20px;
  display: flex;
  color: #fff;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.soldier-type {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #ffb700;
  color: #333;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  transform: translateX(30%);
}

.user-info {
  flex: 1;
  padding-left: 15px;
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.username {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 15px;
}

.training-stats {
  display: flex;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

/* 菜单样式 */
.menu-section {
  background-color: #fff;
  margin: 15px;
  border-radius: 10px;
  overflow: hidden;
}

.menu-header {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.menu-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.menu-list {
  padding: 0 15px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
  background-color: #f0f0f0;
  border-radius: 50%;
}

.menu-text {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.arrow {
  font-size: 16px;
  color: #ccc;
}

/* 退出登录按钮样式 */
.logout-container {
  padding: 20px 15px;
}

.logout-btn {
  background-color: #fff;
  color: #ff4d4f;
  border: none;
  padding: 12px 0;
  border-radius: 10px;
  font-size: 16px;
}
</style>
