<template>
  <view class="home-container">
    <!-- 顶部个人信息卡片 -->
    <view class="user-card">
      <image class="user-avatar" :src="userInfo.avatar || '/static/images/default-avatar.png'"></image>
      <view class="user-info">
        <text class="user-name">{{ userInfo.nickname || '战士' }}</text>
        <text class="user-rank">{{ userInfo.soldierType || '新兵' }}</text>
      </view>
      <view class="user-stats">
        <view class="stat-item">
          <text class="stat-value">{{ userStats.trainingDays || 0 }}</text>
          <text class="stat-label">训练天数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ userStats.medalCount || 0 }}</text>
          <text class="stat-label">勋章数</text>
        </view>
      </view>
    </view>
    
    <!-- 今日训练提示 -->
    <view class="today-training">
      <view class="section-header">
        <text class="section-title">今日训练</text>
      </view>
      <view class="training-status" v-if="todayTraining">
        <text class="status-label">{{ todayTraining.completed ? '已完成' : '未完成' }}</text>
        <text class="training-name">{{ todayTraining.name }}</text>
        <button class="action-button" @click="startTraining">{{ todayTraining.completed ? '查看详情' : '开始训练' }}</button>
      </view>
      <view class="no-training" v-else>
        <text>今日暂无训练安排</text>
        <button class="action-button" @click="goToPlans">选择训练计划</button>
      </view>
    </view>
    
    <!-- 训练计划推荐 -->
    <view class="training-plans">
      <view class="section-header">
        <text class="section-title">训练计划推荐</text>
        <text class="section-more" @click="goToPlans">查看全部</text>
      </view>
      
      <scroll-view scroll-x class="plan-scroll" show-scrollbar="false">
        <view class="plan-card" v-for="(plan, index) in recommendedPlans" :key="index" @click="viewPlanDetail(plan._id)">
          <image class="plan-image" :src="plan.coverImage || '/static/images/default-plan.jpg'"></image>
          <view class="plan-info">
            <text class="plan-name">{{ plan.name }}</text>
            <text class="plan-duration">{{ plan.duration }}天</text>
            <text class="plan-level" :class="'level-' + plan.difficultyLevel">{{ getDifficultyText(plan.difficultyLevel) }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 成就勋章展示 -->
    <view class="medals-showcase">
      <view class="section-header">
        <text class="section-title">最近获得的勋章</text>
        <text class="section-more" @click="goToMedals">查看全部</text>
      </view>
      
      <view class="medals-list" v-if="recentMedals.length > 0">
        <view class="medal-item" v-for="(medal, index) in recentMedals" :key="index" @click="viewMedalDetail(medal._id)">
          <image class="medal-image" :src="medal.imageUrl || '/static/images/default-medal.png'"></image>
          <text class="medal-name">{{ medal.name }}</text>
        </view>
      </view>
      
      <view class="no-medals" v-else>
        <text>暂无勋章，继续努力训练吧！</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getTrainingPlans } from '../../api/training.js';
import { getUserMedals } from '../../api/achievement.js';
import store from '../../store/index.js';

export default {
  data() {
    return {
      userInfo: {},
      userStats: {
        trainingDays: 0,
        medalCount: 0
      },
      todayTraining: null,
      recommendedPlans: [],
      recentMedals: []
    };
  },
  onLoad() {
    // 初始化状态
    store.init();
    
    // 获取用户信息
    this.userInfo = store.getState().userInfo || {};
    
    // 加载页面数据
    this.loadHomeData();
  },
  onShow() {
    // 每次显示页面时刷新数据
    this.loadHomeData();
  },
  methods: {
    // 加载主页数据
    async loadHomeData() {
      try {
        // 同时请求多个API
        const [plansResult, medalsResult] = await Promise.all([
          getTrainingPlans(),
          getUserMedals()
        ]);
        
        // 设置推荐的训练计划
        if (plansResult && Array.isArray(plansResult)) {
          this.recommendedPlans = plansResult.slice(0, 5);
          store.setTrainingPlans(plansResult);
        }
        
        // 设置最近获得的勋章
        if (medalsResult && Array.isArray(medalsResult)) {
          this.recentMedals = medalsResult.slice(0, 3);
          store.setMedals(medalsResult);
          this.userStats.medalCount = medalsResult.length;
        }
        
        // 设置今日训练（示例数据，实际应从后端获取）
        // 这里我们假设第一个训练计划是当前计划
        if (this.recommendedPlans.length > 0) {
          const currentPlan = this.recommendedPlans[0];
          this.todayTraining = {
            name: `${currentPlan.name} - 第1天`,
            completed: false
          };
        }
        
      } catch (error) {
        console.error('加载首页数据失败', error);
        uni.showToast({
          title: '加载数据失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 开始训练
    startTraining() {
      uni.navigateTo({
        url: '/pages/training/plan-detail'
      });
    },
    
    // 查看全部训练计划
    goToPlans() {
      uni.navigateTo({
        url: '/pages/training/plan-list'
      });
    },
    
    // 查看训练计划详情
    viewPlanDetail(planId) {
      uni.navigateTo({
        url: `/pages/training/plan-detail?id=${planId}`
      });
    },
    
    // 查看全部勋章
    goToMedals() {
      uni.switchTab({
        url: '/pages/achievements/medals'
      });
    },
    
    // 查看勋章详情
    viewMedalDetail(medalId) {
      uni.navigateTo({
        url: `/pages/achievements/medal-detail?id=${medalId}`
      });
    },
    
    // 获取难度文本
    getDifficultyText(level) {
      const levels = {
        1: '新兵',
        2: '下士',
        3: '中士',
        4: '上士',
        5: '军官'
      };
      return levels[level] || '新兵';
    }
  }
};
</script>

<style>
.home-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 用户信息卡片 */
.user-card {
  background: linear-gradient(135deg, #3F8463 0%, #2C5744 100%);
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: white;
  margin-bottom: 20px;
}

.user-avatar {
  width: 70px;
  height: 70px;
  border-radius: 35px;
  border: 2px solid white;
}

.user-info {
  flex: 1;
  margin-left: 15px;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
}

.user-rank {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 5px;
}

.user-stats {
  display: flex;
}

.stat-item {
  text-align: center;
  margin-left: 15px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

/* 今日训练提示 */
.today-training {
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.section-more {
  font-size: 14px;
  color: #3F8463;
}

.training-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-label {
  font-size: 14px;
  color: #3F8463;
  font-weight: bold;
  padding: 5px 10px;
  background-color: rgba(63, 132, 99, 0.1);
  border-radius: 20px;
}

.training-name {
  flex: 1;
  margin-left: 10px;
  font-weight: bold;
}

.no-training {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
}

.action-button {
  background-color: #3F8463;
  color: white;
  font-size: 14px;
  padding: 0 15px;
  height: 36px;
  line-height: 36px;
  border-radius: 18px;
  margin-left: 10px;
}

/* 训练计划推荐 */
.training-plans {
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.plan-scroll {
  white-space: nowrap;
  margin: 0 -15px;
  padding: 0 15px;
}

.plan-card {
  display: inline-block;
  width: 160px;
  margin-right: 15px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.plan-image {
  width: 100%;
  height: 90px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.plan-info {
  padding: 10px;
}

.plan-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.plan-duration {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  display: block;
}

.plan-level {
  display: inline-block;
  font-size: 12px;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 5px;
}

.level-1 {
  background-color: #4CAF50;
}

.level-2 {
  background-color: #2196F3;
}

.level-3 {
  background-color: #FF9800;
}

.level-4 {
  background-color: #F44336;
}

.level-5 {
  background-color: #9C27B0;
}

/* 勋章展示 */
.medals-showcase {
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.medals-list {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
}

.medal-item {
  text-align: center;
  width: 30%;
}

.medal-image {
  width: 60px;
  height: 60px;
  margin-bottom: 5px;
}

.medal-name {
  font-size: 12px;
  color: #333;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-medals {
  text-align: center;
  padding: 20px 0;
  color: #999;
}
</style>
