<template>
  <view class="plan-list-container">
    
    <!-- 训练计划列表 -->
    <view class="plan-list" v-if="filteredPlans.length > 0">
      <view 
        v-for="(plan, index) in filteredPlans" 
        :key="index"
        class="plan-card"
        @click="viewPlanDetail(plan._id)"
      >
        <image class="plan-image" :src="plan.coverImage || '/static/images/default-plan.jpg'" mode="aspectFill"></image>
        <view class="plan-info">
          <view class="plan-header">
            <text class="plan-name">{{ plan.name }}</text>
            <view class="difficulty">
              <text class="difficulty-level" :class="'level-' + plan.difficultyLevel">{{ getDifficultyText(plan.difficultyLevel) }}</text>
            </view>
          </view>
          <text class="plan-description">{{ plan.description }}</text>
          <view class="plan-meta">
            <view class="meta-item">
              <text class="meta-icon">⏱️</text>
              <text class="meta-value">{{ plan.duration }}天</text>
            </view>
            <view class="meta-item">
              <text class="meta-icon">🔥</text>
              <text class="meta-value">{{ plan.intensity || '中等' }}强度</text>
            </view>
            <view class="meta-item">
              <text class="meta-icon">👥</text>
              <text class="meta-value">{{ plan.participants || 0 }}人已参与</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 无训练计划提示 -->
    <view class="empty-state" v-else>
      <image class="empty-image" src="/static/images/empty-list.png" mode="aspectFit"></image>
      <text class="empty-text">暂无训练计划</text>
    </view>
    
    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore && filteredPlans.length > 0">
      <text v-if="loading">加载中...</text>
      <text v-else @click="loadMore">加载更多</text>
    </view>
  </view>
</template>

<script>
import { getTrainingPlans, getTrainingPlansByType } from '../../api/training.js';

export default {
  data() {
    return {
      plans: [],
      filteredPlans: [],
      currentType: 'all',
      trainingTypes: [
        { label: '全部', value: 'all' },
        { label: '新兵训练', value: 'rookie' },
        { label: '力量训练', value: 'strength' },
        { label: '耐力训练', value: 'endurance' },
        { label: '核心训练', value: 'core' },
        { label: '战术训练', value: 'tactical' },
        { label: '有氧训练', value: 'cardio' }
      ],
      page: 1,
      pageSize: 10,
      hasMore: true,
      loading: false,
      // 本地训练计划数据
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
  onLoad() {
    this.loadTrainingPlans();
  },
  
  onShow() {
    // 确保页面在从其他页面导航时样式正确
    setTimeout(() => {
      this.loadTrainingPlans();
    }, 100);
  },
  methods: {
    // 加载训练计划
    async loadTrainingPlans() {
      try {
        this.loading = true;
        
        // 先加载本地计划数据
        let localResults = [];
        if (this.currentType === 'all' || this.currentType === 'rookie') {
          localResults = this.localPlans.filter(plan => 
            this.currentType === 'all' || plan.type === this.currentType
          );
        }
        
        let apiResults = [];
        try {
          if (this.currentType === 'all') {
            apiResults = await getTrainingPlans();
          } else if (this.currentType !== 'rookie') { // 不为rookie时才请求API
            apiResults = await getTrainingPlansByType(this.currentType);
          }
        } catch (apiError) {
          console.error('API获取训练计划失败', apiError);
        }
        
        // 合并本地数据和API数据
        const mergedResults = [...localResults, ...apiResults];
        
        if (mergedResults && Array.isArray(mergedResults)) {
          this.plans = mergedResults;
          this.filteredPlans = mergedResults;
          this.hasMore = mergedResults.length >= this.pageSize;
        }
      } catch (error) {
        console.error('获取训练计划失败', error);
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 按类型筛选
    async filterByType(type) {
      if (this.currentType === type) return;
      
      this.currentType = type;
      this.page = 1;
      this.filteredPlans = [];
      this.loadTrainingPlans();
    },
    
    // 加载更多
    async loadMore() {
      if (!this.hasMore || this.loading) return;
      
      this.page++;
      // 实际应用中应该添加分页参数
      await this.loadTrainingPlans();
    },
    
    // 查看训练计划详情
    viewPlanDetail(planId) {
      // 检查是否是本地计划
      const localPlan = this.localPlans.find(p => p._id === planId);
      
      if (localPlan) {
        uni.navigateTo({
          url: `/pages/training/plan-detail?id=${planId}&isLocal=true`
        });
      } else {
        uni.navigateTo({
          url: `/pages/training/plan-detail?id=${planId}`
        });
      }
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
.plan-list-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;
}

/* 移除了筛选栏样式 */

/* 训练计划列表 */
.plan-list {
  padding: 15px;
}

.plan-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.plan-image {
  width: 100%;
  height: 160px;
}

.plan-info {
  padding: 15px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.plan-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.difficulty-level {
  font-size: 12px;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
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

.plan-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plan-meta {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-icon {
  margin-right: 5px;
  font-size: 16px;
}

.meta-value {
  font-size: 12px;
  color: #666;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.empty-image {
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
}

.empty-text {
  color: #999;
  font-size: 16px;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 15px 0;
  color: #666;
  font-size: 14px;
}
</style>
