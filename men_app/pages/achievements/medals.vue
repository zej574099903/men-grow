<template>
  <view class="medals-container">
    <!-- 头部统计信息 -->
    <view class="stats-header">
      <view class="stat-item">
        <text class="stat-value">{{ earnedMedals.length }}</text>
        <text class="stat-label">已获得勋章</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ totalMedals - earnedMedals.length }}</text>
        <text class="stat-label">待获得勋章</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ Math.round((earnedMedals.length / totalMedals) * 100) }}%</text>
        <text class="stat-label">完成度</text>
      </view>
    </view>
    
    <!-- 勋章类别切换 -->
    <view class="category-tabs">
      <view 
        v-for="(category, index) in categories" 
        :key="index"
        class="category-item"
        :class="{ active: currentCategory === index }"
        @click="switchCategory(index)"
      >
        <text>{{ category }}</text>
      </view>
    </view>
    
    <!-- 勋章网格 -->
    <view class="medals-grid">
      <view 
        class="medal-item" 
        v-for="(medal, index) in filteredMedals" 
        :key="index"
        @click="showMedalDetail(medal)"
      >
        <view class="medal-image-container" :class="{ 'locked': !medal.earned }">
          <image 
            class="medal-image" 
            :src="medal.earned ? medal.imageUrl : medal.lockedImageUrl" 
            mode="aspectFit"
          ></image>
          <view class="medal-lock" v-if="!medal.earned">
            <text class="iconfont icon-lock"></text>
          </view>
        </view>
        <text class="medal-name">{{ medal.name }}</text>
        <text class="medal-status">{{ medal.earned ? '已获得' : '未获得' }}</text>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view class="empty-state" v-if="filteredMedals.length === 0">
      <image class="empty-image" src="/static/images/empty-medals.png" mode="aspectFit"></image>
      <text class="empty-text">暂无{{ categories[currentCategory] }}类勋章</text>
    </view>
    
    <!-- 勋章详情弹窗 -->
    <view class="medal-detail-modal" v-if="selectedMedal">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">勋章详情</text>
          <text class="close-btn" @click="selectedMedal = null">×</text>
        </view>
        <view class="modal-body">
          <view class="medal-detail-image">
            <image 
              :src="selectedMedal.earned ? selectedMedal.imageUrl : selectedMedal.lockedImageUrl" 
              mode="aspectFit"
            ></image>
          </view>
          <text class="medal-detail-name">{{ selectedMedal.name }}</text>
          <text class="medal-detail-status" :class="{ 'earned': selectedMedal.earned }">
            {{ selectedMedal.earned ? '已获得' : '未获得' }}
          </text>
          <text class="medal-detail-description">{{ selectedMedal.description }}</text>
          <view class="medal-requirement">
            <text class="requirement-title">获取条件:</text>
            <text class="requirement-content">{{ selectedMedal.requirement }}</text>
          </view>
          <view class="medal-earned-date" v-if="selectedMedal.earned && selectedMedal.earnedDate">
            <text class="earned-date-title">获得时间:</text>
            <text class="earned-date-content">{{ formatDate(selectedMedal.earnedDate) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      categories: ['全部', '训练成就', '挑战成就', '坚持成就', '特殊成就'],
      currentCategory: 0,
      selectedMedal: null,
      totalMedals: 0,
      earnedMedals: [],
      allMedals: []
    };
  },
  computed: {
    filteredMedals() {
      if (this.currentCategory === 0) {
        return this.allMedals;
      } else {
        return this.allMedals.filter(medal => medal.category === this.currentCategory);
      }
    }
  },
  onLoad() {
    this.loadMedals();
  },
  methods: {
    // 加载勋章数据
    loadMedals() {
      // 这里应该调用API获取勋章数据，现在使用模拟数据
      this.allMedals = [
        {
          id: '1',
          name: '训练新兵',
          description: '完成第一次训练',
          requirement: '完成一次完整的训练计划',
          imageUrl: '/static/images/medals/training_rookie.png',
          lockedImageUrl: '/static/images/medals/locked.png',
          category: 1, // 训练成就
          earned: true,
          earnedDate: new Date('2023-06-15')
        },
        {
          id: '2',
          name: '训练精英',
          description: '累计完成50次训练',
          requirement: '累计完成50次训练计划',
          imageUrl: '/static/images/medals/training_elite.png',
          lockedImageUrl: '/static/images/medals/locked.png',
          category: 1, // 训练成就
          earned: false
        },
        {
          id: '3',
          name: '体能王者',
          description: '在体能挑战中获得满分',
          requirement: '在任意一次体能挑战中获得100分',
          imageUrl: '/static/images/medals/fitness_king.png',
          lockedImageUrl: '/static/images/medals/locked.png',
          category: 2, // 挑战成就
          earned: false
        },
        {
          id: '4',
          name: '连续7天',
          description: '连续训练7天',
          requirement: '连续7天每天完成至少一次训练',
          imageUrl: '/static/images/medals/streak_7.png',
          lockedImageUrl: '/static/images/medals/locked.png',
          category: 3, // 坚持成就
          earned: true,
          earnedDate: new Date('2023-06-22')
        },
        {
          id: '5',
          name: '连续30天',
          description: '连续训练30天',
          requirement: '连续30天每天完成至少一次训练',
          imageUrl: '/static/images/medals/streak_30.png',
          lockedImageUrl: '/static/images/medals/locked.png',
          category: 3, // 坚持成就
          earned: false
        },
        {
          id: '6',
          name: '首次突破',
          description: '首次突破个人训练记录',
          requirement: '在任意一个训练项目中突破个人最佳记录',
          imageUrl: '/static/images/medals/first_breakthrough.png',
          lockedImageUrl: '/static/images/medals/locked.png',
          category: 4, // 特殊成就
          earned: true,
          earnedDate: new Date('2023-06-20')
        },
      ];
      
      // 计算已获得的勋章
      this.earnedMedals = this.allMedals.filter(medal => medal.earned);
      this.totalMedals = this.allMedals.length;
    },
    
    // 切换勋章类别
    switchCategory(index) {
      this.currentCategory = index;
    },
    
    // 显示勋章详情
    showMedalDetail(medal) {
      this.selectedMedal = medal;
    },
    
    // 格式化日期
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
  }
};
</script>

<style>
.medals-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 头部统计信息样式 */
.stats-header {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background-color: #3F8463;
  color: #fff;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
}

/* 勋章类别切换样式 */
.category-tabs {
  display: flex;
  background-color: #fff;
  padding: 15px 10px;
  border-bottom: 1px solid #e9ecef;
  overflow-x: auto;
}

.category-item {
  padding: 8px 15px;
  margin: 0 5px;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.category-item.active {
  background-color: #3F8463;
  color: #fff;
}

/* 勋章网格样式 */
.medals-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 15px;
}

.medal-item {
  width: 33.33%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.medal-image-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 10px;
  position: relative;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.medal-image-container.locked {
  opacity: 0.6;
}

.medal-image {
  width: 100%;
  height: 100%;
}

.medal-lock {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.3);
}

.icon-lock {
  font-size: 24px;
  color: #fff;
}

.medal-name {
  font-size: 14px;
  color: #333;
  text-align: center;
  margin-bottom: 5px;
}

.medal-status {
  font-size: 12px;
  color: #3F8463;
}

/* 空状态样式 */
.empty-state {
  padding: 50px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-image {
  width: 150px;
  height: 150px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 16px;
  color: #888;
}

/* 勋章详情弹窗样式 */
.medal-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  width: 80%;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 24px;
  color: #888;
  padding: 5px;
}

.modal-body {
  padding: 20px;
}

.medal-detail-image {
  width: 100px;
  height: 100px;
  margin: 0 auto 15px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(63, 132, 99, 0.2);
}

.medal-detail-image image {
  width: 100%;
  height: 100%;
}

.medal-detail-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 5px;
}

.medal-detail-status {
  font-size: 14px;
  color: #888;
  text-align: center;
  margin-bottom: 15px;
}

.medal-detail-status.earned {
  color: #3F8463;
}

.medal-detail-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
  text-align: center;
}

.medal-requirement {
  margin-bottom: 15px;
}

.requirement-title,
.earned-date-title {
  font-size: 14px;
  color: #888;
  margin-bottom: 5px;
}

.requirement-content,
.earned-date-content {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}
</style>
