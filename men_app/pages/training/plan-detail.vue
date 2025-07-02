<template>
  <view class="plan-detail-container">
    <!-- 返回按钮 -->
    <view class="back-button" @click="goBack">
      <text class="iconfont icon-back">←</text>
    </view>
    
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
      loading: false,
      isLocalPlan: false,
      // 当前显示的周数索引
      currentWeekIndex: 0,
      // 本地计划数据
      localPlans: [
        {
          _id: 'rookie-12-weeks',
          name: '新兵12周训练计划',
          description: '科学渐进式训练，从零基础到完成三个100和3公里跑',
          coverImage: '/static/images/default-plan.jpg',
          difficultyLevel: 1,
          duration: 84, // 12周，84天
          intensity: '渐进式',
          participants: 1268,
          type: 'rookie',
          notes: '1. 每次训练前做好充分热身\n2. 训练量按照自身情况进行适当调整\n3. 保持良好饮食和充足休息\n4. 每周记录自己的进步\n5. 根据自己的恢复能力调整休息时间',
          weeks: [
            // 第1-4周（适应期）
            {
              week: 1,
              title: '适应期第1周',
              description: '身体适应训练节奏',
              days: [
                { // 周一
                  dayNumber: 1,
                  exercises: [
                    { type: '俯卧撑', sets: 7, reps: 10, rest: 120 },
                    { type: '深蹲', sets: 7, reps: 10, rest: 120 },
                    { type: '卷腹', sets: 7, reps: 10, rest: 120 }
                  ]
                },
                { // 周二
                  dayNumber: 2,
                  exercises: [
                    { type: '跑步', duration: 30, distance: 1.5, description: '快走/慢跑交替' }
                  ]
                },
                { // 周三
                  dayNumber: 3,
                  exercises: [
                    { type: '俯卧撑', sets: 7, reps: 10, rest: 120 },
                    { type: '深蹲', sets: 7, reps: 10, rest: 120 },
                    { type: '卷腹', sets: 7, reps: 10, rest: 120 }
                  ]
                },
                { // 周四
                  dayNumber: 4,
                  exercises: [
                    { type: '休息', description: '主动恢复，适当拉伸' }
                  ]
                },
                { // 周五
                  dayNumber: 5,
                  exercises: [
                    { type: '俯卧撑', sets: 7, reps: 10, rest: 120 },
                    { type: '深蹲', sets: 7, reps: 10, rest: 120 },
                    { type: '卷腹', sets: 7, reps: 10, rest: 120 }
                  ]
                },
                { // 周六
                  dayNumber: 6,
                  exercises: [
                    { type: '跑步', duration: 30, distance: 1.5, description: '快走/慢跑交替' }
                  ]
                },
                { // 周日
                  dayNumber: 7,
                  exercises: [
                    { type: '休息', description: '完全休息' }
                  ]
                }
              ]
            },
            {
              week: 2,
              title: '适应期第2周',
              description: '轻微提升训练量',
              days: [
                { // 周一
                  dayNumber: 1,
                  exercises: [
                    { type: '俯卧撑', sets: 7, reps: 12, rest: 120 },
                    { type: '深蹲', sets: 7, reps: 12, rest: 120 },
                    { type: '卷腹', sets: 7, reps: 12, rest: 120 }
                  ]
                },
                { // 周二
                  dayNumber: 2,
                  exercises: [
                    { type: '跑步', duration: 30, distance: 1.7, description: '快走/慢跑交替' }
                  ]
                },
                { // 周三
                  dayNumber: 3,
                  exercises: [
                    { type: '俯卧撑', sets: 7, reps: 12, rest: 120 },
                    { type: '深蹲', sets: 7, reps: 12, rest: 120 },
                    { type: '卷腹', sets: 7, reps: 12, rest: 120 }
                  ]
                },
                { // 周四
                  dayNumber: 4,
                  exercises: [
                    { type: '休息', description: '主动恢复，适当拉伸' }
                  ]
                },
                { // 周五
                  dayNumber: 5,
                  exercises: [
                    { type: '俯卧撑', sets: 7, reps: 12, rest: 120 },
                    { type: '深蹲', sets: 7, reps: 12, rest: 120 },
                    { type: '卷腹', sets: 7, reps: 12, rest: 120 }
                  ]
                },
                { // 周六
                  dayNumber: 6,
                  exercises: [
                    { type: '跑步', duration: 30, distance: 1.8, description: '快走/慢跑交替' }
                  ]
                },
                { // 周日
                  dayNumber: 7,
                  exercises: [
                    { type: '休息', description: '完全休息' }
                  ]
                }
              ]
            },
            {
              week: 4,
              title: '适应期第4周',
              description: '逐渐适应更高强度',
              days: [
                { // 周一
                  dayNumber: 1,
                  exercises: [
                    { type: '俯卧撑', sets: 7, reps: 18, rest: 120 },
                    { type: '深蹲', sets: 7, reps: 18, rest: 120 },
                    { type: '卷腹', sets: 7, reps: 18, rest: 120 }
                  ]
                },
                { // 周二
                  dayNumber: 2,
                  exercises: [
                    { type: '跑步', duration: 30, distance: 2.5, description: '持续慢跑' }
                  ]
                },
                { // 周三
                  dayNumber: 3,
                  exercises: [
                    { type: '俯卧撑', sets: 7, reps: 18, rest: 120 },
                    { type: '深蹲', sets: 7, reps: 18, rest: 120 },
                    { type: '卷腹', sets: 7, reps: 18, rest: 120 }
                  ]
                },
                { // 周四
                  dayNumber: 4,
                  exercises: [
                    { type: '休息', description: '主动恢复，适当拉伸' }
                  ]
                },
                { // 周五
                  dayNumber: 5,
                  exercises: [
                    { type: '俯卧撑', sets: 7, reps: 18, rest: 120 },
                    { type: '深蹲', sets: 7, reps: 18, rest: 120 },
                    { type: '卷腹', sets: 7, reps: 18, rest: 120 }
                  ]
                },
                { // 周六
                  dayNumber: 6,
                  exercises: [
                    { type: '跑步', duration: 30, distance: 2.5, description: '持续慢跑' }
                  ]
                },
                { // 周日
                  dayNumber: 7,
                  exercises: [
                    { type: '休息', description: '完全休息' }
                  ]
                }
              ]
            },
            // 第5-8周（强化期）
            {
              week: 8,
              title: '强化期第8周',
              description: '提升持久力和肌肉耐力',
              days: [
                { // 周一
                  dayNumber: 1,
                  exercises: [
                    { type: '俯卧撑', sets: 7, reps: 28, rest: 90 },
                    { type: '深蹲', sets: 7, reps: 28, rest: 90 },
                    { type: '卷腹', sets: 7, reps: 28, rest: 90 }
                  ]
                },
                { // 周二
                  dayNumber: 2,
                  exercises: [
                    { type: '跑步', duration: 30, distance: 3, description: '持续中速跑' }
                  ]
                },
                { // 周三
                  dayNumber: 3,
                  exercises: [
                    { type: '俯卧撑', sets: 7, reps: 28, rest: 90 },
                    { type: '深蹲', sets: 7, reps: 28, rest: 90 },
                    { type: '卷腹', sets: 7, reps: 28, rest: 90 }
                  ]
                },
                { // 周四
                  dayNumber: 4,
                  exercises: [
                    { type: '跑步', duration: 30, distance: 3, description: '持续中速跑' }
                  ]
                },
                { // 周五
                  dayNumber: 5,
                  exercises: [
                    { type: '俯卧撑', sets: 7, reps: 28, rest: 90 },
                    { type: '深蹲', sets: 7, reps: 28, rest: 90 },
                    { type: '卷腹', sets: 7, reps: 28, rest: 90 }
                  ]
                },
                { // 周六
                  dayNumber: 6,
                  exercises: [
                    { type: '跑步', duration: 30, distance: 3, description: '持续中速跑' }
                  ]
                },
                { // 周日
                  dayNumber: 7,
                  exercises: [
                    { type: '休息', description: '主动恢复，拉伸和放松' }
                  ]
                }
              ]
            },
            // 第9-12周（冲刺期）
            {
              week: 12,
              title: '冲刺期第12周',
              description: '最终冲刺，达到目标',
              days: [
                { // 周一
                  dayNumber: 1,
                  exercises: [
                    { type: '俯卧撑', sets: 7, reps: 45, rest: 60 },
                    { type: '深蹲', sets: 7, reps: 45, rest: 60 },
                    { type: '卷腹', sets: 7, reps: 45, rest: 60 }
                  ]
                },
                { // 周二
                  dayNumber: 2,
                  exercises: [
                    { type: '跑步', duration: 20, distance: 3, description: '3公里计时跑，目标20分钟以内' }
                  ]
                },
                { // 周三
                  dayNumber: 3,
                  exercises: [
                    { type: '俯卧撑', sets: 7, reps: 45, rest: 60 },
                    { type: '深蹲', sets: 7, reps: 45, rest: 60 },
                    { type: '卷腹', sets: 7, reps: 45, rest: 60 }
                  ]
                },
                { // 周四
                  dayNumber: 4,
                  exercises: [
                    { type: '跑步', duration: 20, distance: 3, description: '3公里计时跑，目标18分钟以内' }
                  ]
                },
                { // 周五
                  dayNumber: 5,
                  exercises: [
                    { type: '俯卧撑', sets: 7, reps: 45, rest: 60 },
                    { type: '深蹲', sets: 7, reps: 45, rest: 60 },
                    { type: '卷腹', sets: 7, reps: 45, rest: 60 }
                  ]
                },
                { // 周六
                  dayNumber: 6,
                  exercises: [
                    { type: '跑步', duration: 18, distance: 3, description: '3公里计时跑，目标15分钟以内' }
                  ]
                },
                { // 周日
                  dayNumber: 7,
                  exercises: [
                    { type: '结业测试', description: '三个100各做100个，3公里跑争取在15分钟内完成' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
  },
  onLoad(options) {
    if (options.id) {
      this.planId = options.id;
      this.isLocalPlan = options.isLocal === 'true';
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
        
        if (this.isLocalPlan) {
          // 加载本地计划数据
          const localPlan = this.localPlans.find(p => p._id === this.planId);
          if (localPlan) {
            this.plan = JSON.parse(JSON.stringify(localPlan)); // 深拷贝防止修改原始数据
            
            // 添加当前正在查看的周信息
            if (this.plan.weeks && this.plan.weeks.length > 0) {
              this.plan.currentWeek = this.plan.weeks[this.currentWeekIndex];
            }
            
            // 为本地计划准备exercises数组以兼容原有UI
            this.prepareExercisesForLocalPlan();
            
            store.setCurrentTrainingPlan(this.plan);
            
            // 从本地存储获取用户对该计划的进度
            try {
              const storedProgress = uni.getStorageSync(`training_progress_${this.planId}`);
              if (storedProgress) {
                this.userProgress = JSON.parse(storedProgress);
              } else {
                this.userProgress = {
                  started: false,
                  completed: 0,
                  completedExercises: [],
                  currentWeekIndex: 0,
                  currentDayIndex: 0
                };
              }
            } catch (e) {
              console.error('获取本地训练进度失败', e);
              this.userProgress = {
                started: false,
                completed: 0,
                completedExercises: [],
                currentWeekIndex: 0,
                currentDayIndex: 0
              };
            }
          } else {
            throw new Error('找不到本地计划数据');
          }
        } else {
          // 加载API计划数据
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
    },
    
    // 返回上一级
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style>
/* 返回按钮样式 */
.back-button {
  position: fixed;
  top: 44px;
  left: 15px;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.5);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.back-button .iconfont {
  font-size: 20px;
}
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
