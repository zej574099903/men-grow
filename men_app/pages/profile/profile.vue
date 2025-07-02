<template>
  <view class="profile-container">
    <!-- 顶部个人信息卡片 -->
    <view class="profile-header">
      <view class="avatar-container">
        <image class="avatar" :src="userInfo.avatar || '/static/avatar.png'" mode="aspectFill"></image>
        <view class="user-type">{{ getUserRankText(userInfo.userRank) }}</view>
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
        <text class="menu-title">个人中心</text>
      </view>
      <view class="menu-list">
        <view class="menu-item" @click="navigateTo('/pages/profile/edit-profile')">
          <text class="menu-text">编辑资料</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/settings/settings')">
          <text class="menu-text">设置</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="handleFeedback()">
          <text class="menu-text">意见反馈</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="handleAbout()">
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
import store from '../../store/index.js';
import { getUser } from '../../api/user.js';

export default {
  data() {
    return {
      userInfo: {},
      trainingStats: {
        daysCount: 0,
        totalSessions: 0,
        totalDuration: 0
      }
    };
  },
  onShow() {
    // 每次页面显示时都重新加载用户资料和训练统计
    this.loadUserProfile();
    this.loadTrainingStats();
  },
  methods: {
    // 加载用户资料
    loadUserProfile() {
      // 始终优先使用本地存储中的最新用户信息
      const userInfo = uni.getStorageSync('userInfo');
      if (userInfo) {
        // 直接使用本地存储的最新数据
        this.userInfo = userInfo;
        console.log('从本地加载用户资料:', this.userInfo);
        return;
      }
      
      // 如果本地存储没有，则尝试使用store中的数据
      const storeUser = store.getState().userInfo;
      if (storeUser) {
        this.userInfo = storeUser;
        console.log('从store加载用户资料:', this.userInfo);
        return;
      }
      
      // 如果store中也没有，则尝试从API获取
      const userId = storeUser?._id;
      if (userId) {
        getUser(userId).then(res => {
          if (res) {
            this.userInfo = res;
            // 更新本地存储
            uni.setStorageSync('userInfo', res);
            console.log('从API加载用户资料:', this.userInfo);
          } else {
            this.useDefaultUserInfo();
          }
        }).catch(err => {
          console.error('获取用户资料失败:', err);
          this.useDefaultUserInfo();
          uni.showToast({
            title: '获取用户资料失败',
            icon: 'none'
          });
        });
      } else {
        this.useDefaultUserInfo();
      }
    },
    
    // 使用默认用户信息
    useDefaultUserInfo() {
      const userInfo = getUserInfoFromStorage() || {
        nickname: '战士',
        avatar: '',
        userRank: '新兵'
      };
      this.userInfo = userInfo;
      console.log('使用默认用户资料');
    },
    
    // 加载训练统计数据
    loadTrainingStats() {
      // 使用本地模拟数据，避免API不存在导致的超时
      // 在实际项目中，这里应该调用后端API
      this.trainingStats = {
        daysCount: 42,
        totalSessions: 87,
        totalDuration: 57600 // 总训练时长（秒）
      };
      
      /* 当后端API准备好后，可以使用以下代码：
      import { getTrainingStatistics } from '../../api/training.js';
      const userInfo = uni.getStorageSync('userInfo') || {};
      const userId = userInfo._id || this.user?._id;
      
      if (userId) {
        getTrainingStatistics(userId).then(res => {
          if (res) {
            this.trainingStats = res;
          }
        }).catch(err => {
          console.error('获取训练统计失败:', err);
          uni.showToast({
            title: '获取训练统计失败',
            icon: 'none'
          });
        });
      }
      */
    },
    
    // 获取军衔等级文字
    getUserRankText(rank) {
      if (!rank) {
        return '新兵';
      }
      
      // 军衔等级映射
      const rankMap = {
        'new_recruit': '新兵',
        'veteran': '老兵',
        'special_force': '特种兵'
      };
      
      return rankMap[rank] || rank;
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
    
    // 页面导航
    navigateTo(url) {
      uni.navigateTo({
        url: url
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
            store.logout();
            
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
  background: linear-gradient(135deg, #3F8463 0%, #2C5744 100%);
  padding: 20px;
  display: flex;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.avatar-container {
  position: relative;
  margin-right: 5px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
  object-fit: cover;
}

.user-type {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #ffb700 0%, #ff9500 100%);
  color: #333;
  font-size: 12px;
  font-weight: bold;
  padding: 3px 10px;
  border-radius: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  border: 1px solid #fff;
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
