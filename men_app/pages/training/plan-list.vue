<template>
  <view class="plan-list-container">
    <!-- 顶部筛选栏 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll" show-scrollbar="false">
        <view 
          v-for="(type, index) in trainingTypes" 
          :key="index"
          class="filter-item"
          :class="{active: currentType === type.value}"
          @click="filterByType(type.value)"
        >
          <text>{{ type.label }}</text>
        </view>
      </scroll-view>
    </view>
    
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
        { label: '力量训练', value: 'strength' },
        { label: '耐力训练', value: 'endurance' },
        { label: '核心训练', value: 'core' },
        { label: '战术训练', value: 'tactical' },
        { label: '有氧训练', value: 'cardio' }
      ],
      page: 1,
      pageSize: 10,
      hasMore: true,
      loading: false
    };
  },
  onLoad() {
    this.loadTrainingPlans();
  },
  methods: {
    // 加载训练计划
    async loadTrainingPlans() {
      try {
        this.loading = true;
        let result;
        
        if (this.currentType === 'all') {
          result = await getTrainingPlans();
        } else {
          result = await getTrainingPlansByType(this.currentType);
        }
        
        if (result && Array.isArray(result)) {
          this.plans = result;
          this.filteredPlans = result;
          this.hasMore = result.length >= this.pageSize;
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
      uni.navigateTo({
        url: `/pages/training/plan-detail?id=${planId}`
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
.plan-list-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;
}

/* 筛选栏 */
.filter-bar {
  background-color: #fff;
  padding: 15px 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.filter-scroll {
  white-space: nowrap;
  padding: 0 15px;
}

.filter-item {
  display: inline-block;
  padding: 8px 20px;
  margin-right: 10px;
  background-color: #f0f0f0;
  border-radius: 20px;
  font-size: 14px;
  color: #333;
  transition: all 0.3s;
}

.filter-item.active {
  background-color: #3F8463;
  color: white;
}

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
