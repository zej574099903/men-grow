<template>
  <view class="plan-detail-container">
    <!-- 顶部图片 -->
    <view class="plan-header">
      <image class="cover-image" :src="plan.coverImage || '/static/images/default-plan.jpg'" mode="aspectFill"></image>
      <view class="header-overlay"></view>
      <view class="plan-title-container">
        <text class="plan-title">{{ plan.name }}</text>
        <view class="plan-badges">
          <text class="badge difficulty" :class="'difficulty-' + plan.difficultyLevel">{{ getDifficultyText(plan.difficultyLevel) }}</text>
          <text class="badge type">{{ plan.type }}</text>
        </view>
      </view>
    </view>
    
    <!-- 计划简介 -->
    <view class="plan-section">
      <view class="section-header">
        <text class="section-title">计划简介</text>
      </view>
      <view class="plan-description">
        <text>{{ plan.description }}</text>
      </view>
      <view class="plan-meta">
        <view class="meta-item">
          <text class="meta-label">训练天数</text>
          <text class="meta-value">{{ plan.duration }}天</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">训练强度</text>
          <text class="meta-value">{{ plan.intensity || '中等' }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">已有</text>
          <text class="meta-value">{{ plan.participants || 0 }}人参与</text>
        </view>
      </view>
    </view>
    
    <!-- 训练内容 -->
    <view class="plan-section">
      <view class="section-header">
        <text class="section-title">训练内容</text>
        <view class="progress-indicator">
          <text>进度: {{ userProgress.completed || 0 }}/{{ plan.exercises?.length || 0 }}</text>
        </view>
      </view>
      <view class="exercises-list">
        <view 
          v-for="(exercise, index) in plan.exercises" 
          :key="index"
          class="exercise-item"
          :class="{completed: isExerciseCompleted(exercise._id)}"
        >
          <view class="exercise-info">
            <text class="exercise-number">{{ index + 1 }}</text>
            <view class="exercise-details">
              <text class="exercise-name">{{ exercise.name }}</text>
              <text class="exercise-desc">{{ getExerciseDesc(exercise) }}</text>
            </view>
          </view>
          <view class="exercise-status">
            <text v-if="isExerciseCompleted(exercise._id)" class="status-completed">已完成</text>
            <text v-else class="status-pending">未完成</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 注意事项 -->
    <view class="plan-section" v-if="plan.notes">
      <view class="section-header">
        <text class="section-title">注意事项</text>
      </view>
      <view class="notes">
        <text>{{ plan.notes }}</text>
      </view>
    </view>
    
    <!-- 底部操作栏 -->
    <view class="action-bar">
      <button class="share-button" @click="sharePlan">
        <text class="button-icon">📢</text>
        <text>分享</text>
      </button>
      <button class="primary-button" @click="startTraining">
        {{ userProgress.started ? '继续训练' : '开始训练' }}
      </button>
    </view>
  </view>
</template>

<script>
import { getTrainingPlanDetail } from '../../api/training.js';
import store from '../../store/index.js';

export default {
  data() {
    return {
      planId: '',
      plan: {},
      userProgress: {
        started: false,
        completed: 0,
        completedExercises: []
      },
      loading: false
    };
  },
  onLoad(options) {
    if (options.id) {
      this.planId = options.id;
      this.loadPlanDetail();
    } else {
      uni.showToast({
        title: '未找到训练计划',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  },
  methods: {
    // 加载训练计划详情
    async loadPlanDetail() {
      try {
        this.loading = true;
        
        const result = await getTrainingPlanDetail(this.planId);
        if (result) {
          this.plan = result;
          store.setCurrentTrainingPlan(result);
          
          // 这里应该从后端获取用户对该计划的进度
          // 暂时用模拟数据
          this.userProgress = {
            started: false,
            completed: 0,
            completedExercises: []
          };
        }
      } catch (error) {
        console.error('获取训练计划详情失败', error);
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 获取运动项目描述
    getExerciseDesc(exercise) {
      if (exercise.type === 'time') {
        return `${exercise.sets}组 × ${exercise.duration}秒`;
      } else {
        return `${exercise.sets}组 × ${exercise.reps}次`;
      }
    },
    
    // 检查运动是否已完成
    isExerciseCompleted(exerciseId) {
      return this.userProgress.completedExercises.includes(exerciseId);
    },
    
    // 开始训练
    startTraining() {
      // 更新进度
      this.userProgress.started = true;
      
      // 跳转到训练执行页面
      uni.navigateTo({
        url: `/pages/training/exercise?planId=${this.planId}`
      });
    },
    
    // 分享训练计划
    sharePlan() {
      uni.share({
        provider: "weixin",
        scene: "WXSceneSession",
        type: 0,
        title: `铁炼计划 - ${this.plan.name}`,
        summary: this.plan.description,
        imageUrl: this.plan.coverImage,
        success: function (res) {
          console.log("success:" + JSON.stringify(res));
        },
        fail: function (err) {
          console.log("fail:" + JSON.stringify(err));
        }
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
.plan-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px; /* 为底部操作栏留出空间 */
}

/* 顶部封面 */
.plan-header {
  position: relative;
  height: 220px;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7));
}

.plan-title-container {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
}

.plan-title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
  margin-bottom: 10px;
}

.plan-badges {
  display: flex;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  margin-right: 10px;
  color: white;
}

.badge.difficulty {
  background-color: #2C5744;
}

.difficulty-1 { background-color: #4CAF50; }
.difficulty-2 { background-color: #2196F3; }
.difficulty-3 { background-color: #FF9800; }
.difficulty-4 { background-color: #F44336; }
.difficulty-5 { background-color: #9C27B0; }

.badge.type {
  background-color: rgba(255,255,255,0.3);
}

/* 内容区块 */
.plan-section {
  background-color: white;
  margin: 15px;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.progress-indicator {
  color: #3F8463;
  font-size: 14px;
  background-color: rgba(63, 132, 99, 0.1);
  padding: 4px 12px;
  border-radius: 15px;
}

.plan-description {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 15px;
}

.plan-meta {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
  margin-top: 15px;
}

.meta-item {
  text-align: center;
  flex: 1;
}

.meta-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
  display: block;
}

.meta-value {
  font-size: 16px;
  color: #333;
  font-weight: bold;
}

/* 训练内容列表 */
.exercise-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.exercise-item:last-child {
  border-bottom: none;
}

.exercise-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.exercise-number {
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #3F8463;
  color: white;
  text-align: center;
  line-height: 24px;
  font-size: 14px;
  margin-right: 15px;
}

.exercise-details {
  flex: 1;
}

.exercise-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.exercise-desc {
  font-size: 14px;
  color: #666;
}

.exercise-status {
  margin-left: 10px;
}

.status-completed {
  color: #4CAF50;
}

.status-pending {
  color: #FF9800;
}

.exercise-item.completed .exercise-number {
  background-color: #4CAF50;
}

.exercise-item.completed .exercise-name {
  color: #4CAF50;
}

/* 注意事项 */
.notes {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

.share-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  width: 80px;
  height: 60px;
  margin-right: 15px;
  font-size: 12px;
}

.button-icon {
  font-size: 20px;
  margin-bottom: 5px;
}

.primary-button {
  flex: 1;
  background: linear-gradient(135deg, #3F8463 0%, #2C5744 100%);
  color: white;
  font-size: 16px;
  height: 45px;
  line-height: 45px;
  border-radius: 22.5px;
}
</style>
