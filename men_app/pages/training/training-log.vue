<template>
  <view class="training-log-container">
    <!-- 头部标签切换 -->
    <view class="tab-header">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-item"
        :class="{ active: currentTab === index }"
        @click="switchTab(index)"
      >
        <text>{{ tab }}</text>
      </view>
    </view>
    
    <!-- 训练记录列表 -->
    <view class="training-logs" v-if="logs.length > 0">
      <view 
        class="log-item" 
        v-for="(log, index) in logs" 
        :key="index"
        @click="viewLogDetail(log)"
      >
        <view class="log-header">
          <text class="log-plan-name">{{ log.planName }}</text>
          <text class="log-date">{{ formatDate(log.date) }}</text>
        </view>
        
        <view class="log-body">
          <view class="log-stat">
            <text class="log-stat-label">训练时长</text>
            <text class="log-stat-value">{{ formatDuration(log.duration) }}</text>
          </view>
          <view class="log-stat">
            <text class="log-stat-label">动作完成</text>
            <text class="log-stat-value">{{ log.completedExercises }}/{{ log.totalExercises }}</text>
          </view>
          <view class="log-stat">
            <text class="log-stat-label">消耗热量</text>
            <text class="log-stat-value">{{ calculateCalories(log.duration) }} 大卡</text>
          </view>
        </view>
        
        <view class="log-footer">
          <view class="log-tag" v-if="getCompletionRate(log) >= 100">全部完成</view>
          <view class="log-tag partial" v-else>部分完成</view>
          <view class="view-detail">
            <text>查看详情</text>
            <text class="icon">></text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <image class="empty-image" src="/static/images/empty-log.png" mode="aspectFit"></image>
      <text class="empty-text">暂无训练记录</text>
      <button class="start-training-btn" @click="goToTrainingPlans">开始训练</button>
    </view>
  </view>
</template>

<script>
import { getUserTrainingLogs } from '../../api/training.js';

export default {
  data() {
    return {
      tabs: ['全部记录', '本周', '本月'],
      currentTab: 0,
      logs: [],
      loading: false,
      page: 1,
      hasMore: true
    };
  },
  onLoad() {
    this.loadTrainingLogs();
  },
  onPullDownRefresh() {
    this.refreshData();
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.loadMoreLogs();
    }
  },
  methods: {
    // 切换标签
    switchTab(index) {
      if (this.currentTab === index) return;
      this.currentTab = index;
      this.refreshData();
    },
    
    // 刷新数据
    refreshData() {
      this.page = 1;
      this.logs = [];
      this.hasMore = true;
      this.loadTrainingLogs();
    },
    
    // 加载训练记录
    loadTrainingLogs() {
      if (this.loading) return;
      
      this.loading = true;
      
      // 根据当前标签过滤时间范围
      let timeRange = {};
      const now = new Date();
      
      if (this.currentTab === 1) { // 本周
        const dayOfWeek = now.getDay() || 7;
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek + 1);
        startDate.setHours(0, 0, 0, 0);
        timeRange = {
          start: startDate.toISOString(),
          end: now.toISOString()
        };
      } else if (this.currentTab === 2) { // 本月
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        timeRange = {
          start: startDate.toISOString(),
          end: now.toISOString()
        };
      }
      
      // 调用API获取训练记录
      getUserTrainingLogs({
        page: this.page,
        limit: 10,
        ...timeRange
      }).then(res => {
        // 模拟数据，实际项目中会使用真实数据
        // 临时示例数据
        if (this.page === 1) {
          this.logs = [
            {
              _id: '1',
              planId: 'plan1',
              planName: '军体拳基础训练',
              date: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // 两天前
              duration: 1800, // 30分钟
              completedExercises: 10,
              totalExercises: 10
            },
            {
              _id: '2',
              planId: 'plan2',
              planName: '体能强化训练',
              date: new Date(new Date().getTime() - 4 * 24 * 60 * 60 * 1000), // 四天前
              duration: 2400, // 40分钟
              completedExercises: 8,
              totalExercises: 12
            },
            {
              _id: '3',
              planId: 'plan3',
              planName: '战术体能训练',
              date: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 一周前
              duration: 3000, // 50分钟
              completedExercises: 15,
              totalExercises: 15
            }
          ];
        } else {
          // 第二页数据
          this.logs.push(
            {
              _id: '4',
              planId: 'plan4',
              planName: '耐力训练课程',
              date: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000),
              duration: 2700,
              completedExercises: 12,
              totalExercises: 12
            },
            {
              _id: '5',
              planId: 'plan5',
              planName: '核心力量训练',
              date: new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000),
              duration: 1500,
              completedExercises: 6,
              totalExercises: 8
            }
          );
        }
        
        // 判断是否还有更多数据
        this.hasMore = this.page < 2; // 示例中只有两页数据
        this.page++;
        
      }).catch(err => {
        console.error('获取训练记录失败:', err);
        uni.showToast({
          title: '获取记录失败',
          icon: 'none'
        });
      }).finally(() => {
        this.loading = false;
        uni.stopPullDownRefresh();
      });
    },
    
    // 加载更多记录
    loadMoreLogs() {
      this.loadTrainingLogs();
    },
    
    // 查看记录详情
    viewLogDetail(log) {
      uni.showToast({
        title: '记录详情功能开发中',
        icon: 'none'
      });
      // 实际项目中可以跳转到详情页
      // uni.navigateTo({
      //   url: `/pages/training/log-detail?id=${log._id}`
      // });
    },
    
    // 跳转到训练计划列表
    goToTrainingPlans() {
      uni.switchTab({
        url: '/pages/home/home'
      });
    },
    
    // 格式化日期
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    },
    
    // 格式化时长
    formatDuration(seconds) {
      if (!seconds) return '0分钟';
      const minutes = Math.floor(seconds / 60);
      return `${minutes}分钟`;
    },
    
    // 计算卡路里消耗（简单估算）
    calculateCalories(duration) {
      // 平均每分钟消耗6大卡
      return Math.round(duration / 60 * 6);
    },
    
    // 获取完成率
    getCompletionRate(log) {
      if (!log.totalExercises) return 0;
      return Math.round((log.completedExercises / log.totalExercises) * 100);
    }
  }
};
</script>

<style>
.training-log-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 20px;
}

/* 标签页样式 */
.tab-header {
  display: flex;
  background-color: #fff;
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 16px;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #3F8463;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 25%;
  width: 50%;
  height: 3px;
  background-color: #3F8463;
  border-radius: 3px;
}

/* 训练记录项样式 */
.log-item {
  background-color: #fff;
  margin: 15px;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.log-plan-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.log-date {
  font-size: 14px;
  color: #666;
}

.log-body {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  border-bottom: 1px dashed #e9ecef;
  padding-bottom: 15px;
}

.log-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.log-stat-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
}

.log-stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.log-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-tag {
  font-size: 14px;
  color: #3F8463;
  background-color: rgba(63, 132, 99, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.log-tag.partial {
  color: #ff9800;
  background-color: rgba(255, 152, 0, 0.1);
}

.view-detail {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #888;
}

.view-detail .icon {
  margin-left: 5px;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
}

.empty-image {
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 16px;
  color: #888;
  margin-bottom: 20px;
}

.start-training-btn {
  background-color: #3F8463;
  color: #fff;
  border: none;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(63, 132, 99, 0.2);
}
</style>
