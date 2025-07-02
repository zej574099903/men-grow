<template>
  <view class="home-container">
    <!-- 顶部个人信息卡片 -->
    <!-- <view class="user-card">
      <view class="card-background"></view>
      <view class="card-content">
        <view class="user-header">
          <image class="user-avatar" :src="userInfo.avatar || '/static/avatar.png'"></image>
          <view class="user-main-info">
            <view class="user-name">{{ userInfo.nickname || '战士' }}</view>
            <view class="rank-badge">
              <view class="badge-icon"></view>
              <text>{{ userInfo.userRank || '新兵' }}</text>
            </view>
          </view>
        </view>
        
        <view class="user-stats">
          <view class="stat-item">
            <text class="stat-value">{{ userStats.trainingDays || 0 }}</text>
            <text class="stat-label">训练天数</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ userStats.medalCount || 0 }}</text>
            <text class="stat-label">勋章数</text>
          </view>
        </view>
      </view>
    </view> -->

    <!-- 今日训练提示 - banner样式 -->
    <view class="today-training-banner">
      <view class="today-training-bg"></view>
      <view class="training-header">
        <view class="training-header-left">
          <text class="training-title">今日训练</text>
          <text class="training-date"
            >{{ new Date().getMonth() + 1 }}月{{ new Date().getDate() }}日</text
          >
        </view>
        <view class="training-badge">
          <text class="training-badge-text">军事训练</text>
        </view>
      </view>

      <view class="training-content" v-if="todayTraining">
        <view class="training-icon">
          <text class="icon-text">{{
            todayTraining.completed ? "✓" : "➤"
          }}</text>
        </view>
        <view class="training-details">
          <view class="training-info">
            <text class="training-name">{{ todayTraining.name }}</text>
            <text class="training-desc">{{
              todayTraining.description || "完成今日训练，提升军事素养"
            }}</text>
          </view>
          <view
            class="training-status-tag"
            :class="{ completed: todayTraining.completed }"
          >
            <text>{{ todayTraining.completed ? "已完成" : "待完成" }}</text>
          </view>
        </view>
      </view>

      <view class="no-training-content" v-else>
        <view class="no-training-icon">
          <text class="icon-text">📋</text>
        </view>
        <view class="no-training-text">
          <text class="no-training-title">今日暂无训练安排</text>
          <p class="no-training-desc">选择一个训练计划开始你的军事训练</p>
        </view>
      </view>

      <view class="training-action">
        <button
          class="action-button"
          @click="startTraining"
          v-if="todayTraining"
        >
          <text class="button-text">{{
            todayTraining.completed ? "查看详情" : "立即开始"
          }}</text>
          <text class="button-icon">→</text>
        </button>
        <button class="action-button" @click="goToPlans" v-else>
          <text class="button-text">选择训练计划</text>
          <text class="button-icon">→</text>
        </button>
      </view>
    </view>
    <view class="training-divider">
      <!-- 训练营区域 -->
      <view class="training-camps">
        <view class="section-header">
          <text class="section-title">军事训练营</text>
          <text class="section-subtitle">按军衔等级解锁更高级训练</text>
        </view>

        <!-- 训练营列表 -->
        <view class="camps-container">
          <!-- 新兵营区块 - 默认可用 -->
          <view class="camp-block active" @click="navigateToCamp('rookie')">
            <view class="camp-content">
              <view class="camp-header">
                <text class="camp-title">新兵营</text>
                <view
                  class="camp-badge"
                  :class="{
                    'camp-active': userInfo.userRank === 'new_recruit',
                  }"
                  >{{ getCampStatus("new_recruit") }}</view
                >
              </view>
              <view class="camp-progress">
                <!-- 训练项目：俯卧撑 -->
                <view class="progress-item">
                  <view class="progress-label">
                    <text>俯卧撑 💪：</text>
                    <text class="progress-count"
                      >{{ rookieStats.pushups || 0 }}/9000</text
                    >
                  </view>
                  <view class="progress-bar">
                    <view
                      class="progress-fill"
                      :style="{ width: getRookieProgress('pushups') + '%' }"
                    ></view>
                  </view>
                </view>

                <!-- 训练项目：卷腹 -->
                <view class="progress-item">
                  <view class="progress-label">
                    <text>卷腹 🙇‍♂️：</text>
                    <text class="progress-count"
                      >{{ rookieStats.situps || 0 }}/9000</text
                    >
                  </view>
                  <view class="progress-bar">
                    <view
                      class="progress-fill"
                      :style="{ width: getRookieProgress('situps') + '%' }"
                    ></view>
                  </view>
                </view>

                <!-- 训练项目：深蹲 -->
                <view class="progress-item">
                  <view class="progress-label">
                    <text>深蹲 🏋️：</text>
                    <text class="progress-count"
                      >{{ rookieStats.squats || 0 }}/9000</text
                    >
                  </view>
                  <view class="progress-bar">
                    <view
                      class="progress-fill"
                      :style="{ width: getRookieProgress('squats') + '%' }"
                    ></view>
                  </view>
                </view>
                <view class="progress-item">
                  <view class="progress-label">
                    <text>3公里 🏃‍♂️：</text>
                    <text class="progress-count"
                      >{{ rookieStats.runningCompleted || 0 }}/30</text
                    >
                  </view>
                  <view class="progress-bar">
                    <view
                      class="progress-fill"
                      :style="{ width: getRookieProgress('running') + '%' }"
                    ></view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 老兵营区块 - 需完成新兵营 -->
          <view
            class="camp-block"
            :class="{ disabled: userInfo.userRank === 'new_recruit' }"
            @click="navigateToCamp('veteran')"
          >
            <view class="camp-content">
              <view class="camp-header">
                <text class="camp-title">老兵营</text>
                <view
                  class="camp-badge"
                  :class="{ 'camp-active': userInfo.userRank === 'veteran' }"
                  >{{ getCampStatus("veteran") }}</view
                >
              </view>
              <view
                class="camp-lock"
                v-if="userInfo.userRank === 'new_recruit'"
              >
                <text>完成新兵营训练后解锁</text>
              </view>
            </view>
          </view>

          <!-- 特种兵营区块 - 需完成老兵营 -->
          <view
            class="camp-block"
            :class="{ disabled: userInfo.userRank !== 'special_force' }"
            @click="navigateToCamp('special')"
          >
            <view class="camp-content">
              <view class="camp-header">
                <text class="camp-title">特种兵营</text>
                <view
                  class="camp-badge"
                  :class="{
                    'camp-active': userInfo.userRank === 'special_force',
                  }"
                  >{{ getCampStatus("special_force") }}</view
                >
              </view>
              <view
                class="camp-lock"
                v-if="userInfo.userRank !== 'special_force'"
              >
                <text>完成老兵营训练后解锁</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 激励语 -->
      <!-- <view class="motivational-quote">
        <view class="quote-container">
          <text class="quote-text">{{ motivationalQuote }}</text>
          <view class="quote-decoration left"></view>
          <view class="quote-decoration right"></view>
        </view>
        <text class="quote-author">— 铁炼计划</text>
      </view> -->
    </view>
  </view>
</template>

<script>
import { getTrainingPlans } from "../../api/training.js";
import { getUserMedals } from "../../api/achievement.js";
import store from "../../store/index.js";

export default {
  data() {
    return {
      userInfo: {
        userRank: "new_recruit", // 默认为新兵
      },
      userStats: {
        trainingDays: 0,
        medalCount: 0,
      },
      // 新兵营训练数据
      rookieStats: {
        // 拆分3个100为单独训练
        pushups: 0, // 俯卧撑完成次数
        situps: 0, // 卷腹完成次数
        squats: 0, // 深蹲完成次数
        runningCompleted: 0, // 3公里完成次数
        bestRunningTime: 0, // 最佳3公里时间（秒）
        examCompleted: false, // 是否完成考核
      },
      todayTraining: null,
      recommendedPlans: [],
      loading: {
        todayTraining: false,
        recommendedPlans: false,
      },
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
    // 每次显示页面时加载用户信息
    this.loadUserInfo();

    // 加载训练营数据
    this.loadCampData();

    // 加载今日训练
    this.loadTodayTraining();

    // 加载推荐训练计划
    this.loadRecommendedPlans();
  },
  onHide() {
    // 页面隐藏时清除一些缓存数据，确保下次显示时能获取最新数据
    this.userInfo = {};
  },
  methods: {
    // 获取训练营状态文本
    getCampStatus(rank) {
      if (this.userInfo.userRank === rank) {
        return "进行中";
      } else if (
        (rank === "veteran" && this.userInfo.userRank === "special_force") ||
        (rank === "new_recruit" &&
          (this.userInfo.userRank === "veteran" ||
            this.userInfo.userRank === "special_force"))
      ) {
        return "已完成";
      } else {
        return "未解锁";
      }
    },

    // 计算新兵营训练进度
    getRookieProgress(type) {
      const maxCounts = {
        pushups: 9000, // 每项训练目标9000次
        situps: 9000,
        squats: 9000,
        running: 30, // 跑步仍然保持30次
      };

      if (type === "pushups" || type === "situps" || type === "squats") {
        return Math.min(
          Math.round(((this.rookieStats[type] || 0) / maxCounts[type]) * 100),
          100
        );
      } else if (type === "running") {
        return Math.min(
          Math.round(
            ((this.rookieStats.runningCompleted || 0) / maxCounts.running) * 100
          ),
          100
        );
      }
      return 0;
    },

    // 导航到训练页面
    navigateToTraining(type) {
      uni.navigateTo({
        url: `/pages/training/exercise?type=${type}&count=100`,
      });
    },

    // 导航到对应训练营
    navigateToCamp(campType) {
      if (campType === "rookie") {
        // 使用navigateTo而不是跳转到根路由，确保可以返回
        uni.navigateTo({
          url: `/pages/training/camp-detail`,
        });
      } else {
        uni.showToast({
          title: "军衔不足，无法进入该训练营",
          icon: "none",
        });
      }
    },

    // 加载训练营数据
    loadCampData() {
      // 模拟加载数据，实际应该从API获取
      setTimeout(() => {
        // 模拟新兵营数据
        this.rookieStats = {
          pushups: 15, // 已完成15次俯卧撑
          situps: 12, // 已完成12次卷腹
          squats: 18, // 已完成18次深蹲
          runningCompleted: 15, // 已完成15次3公里
          bestRunningTime: 780, // 最佳时间13分钟
          examCompleted: false, // 未完成考核
        };
      }, 200);
    },
    // 加载最新的用户信息
    loadUserInfo() {
      // 优先从本地存储获取最新用户信息
      const localUserInfo = uni.getStorageSync("userInfo");
      if (localUserInfo) {
        this.userInfo = localUserInfo;
        console.log("首页从本地存储加载最新用户信息:", this.userInfo);
        return;
      }

      // 如果本地存储没有，则从store获取
      const storeUserInfo = store.getState().userInfo;
      if (storeUserInfo) {
        this.userInfo = storeUserInfo;
        console.log("首页从store获取用户信息:", this.userInfo);
      } else {
        this.userInfo = this.userInfo || {
          nickname: "战士",
          avatar: "",
          userRank: "新兵",
        };
      }
    },

    // 加载主页数据
    async loadHomeData() {
      try {
        // 同时请求多个API
        const [plansResult, medalsResult] = await Promise.all([
          getTrainingPlans(),
          getUserMedals(),
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
            completed: false,
          };
        }
      } catch (error) {
        console.error("加载首页数据失败", error);
        uni.showToast({
          title: "加载数据失败，请重试",
          icon: "none",
        });
      }
    },

    // 开始训练
    startTraining() {
      uni.navigateTo({
        url: "/pages/training/plan-detail",
      });
    },

    // 查看全部训练计划
    goToPlans() {
      uni.navigateTo({
        url: "/pages/training/plan-list",
      });
    },

    // 查看训练计划详情
    viewPlanDetail(planId) {
      uni.navigateTo({
        url: `/pages/training/plan-detail?id=${planId}`,
      });
    },

    // 查看全部勋章
    goToMedals() {
      uni.switchTab({
        url: "/pages/achievements/medals",
      });
    },

    // 查看勋章详情
    viewMedalDetail(medalId) {
      uni.navigateTo({
        url: `/pages/achievements/medal-detail?id=${medalId}`,
      });
    },

    // 获取难度文本
    getDifficultyText(level) {
      const levels = {
        1: "新兵",
        2: "下士",
        3: "中士",
        4: "上士",
        5: "军官",
      };
      return levels[level] || "新兵";
    },
  },
};
</script>

<style>
.home-container {
  /* padding: 20px; */
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 用户信息卡片 - 高大上版 */
.user-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(47, 85, 68, 0.3);
  margin-bottom: 25px;
  height: 200px;
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #3f8463 0%, #2c5744 100%);
  z-index: 1;
}

.card-background::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="rgba(255,255,255,0.03)" width="50" height="50" x="0" y="0"/><rect fill="rgba(255,255,255,0.03)" width="50" height="50" x="50" y="50"/></svg>');
  opacity: 0.4;
  z-index: -1;
}

.card-content {
  position: relative;
  z-index: 2;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.user-header {
  display: flex;
  align-items: center;
}

/* 用户头像样式 */
.user-avatar {
  width: 75px;
  height: 75px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  margin-right: 15px;
  object-fit: cover;
}

.user-main-info {
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 激励语 */
.motivational-quote {
  margin: 25px 15px 30px;
  padding: 25px 20px;
  background: linear-gradient(145deg, #3f8463 0%, #2c5744 100%);
  border-radius: 15px;
  text-align: center;
  position: relative;
  box-shadow: 0 4px 15px rgba(63, 132, 99, 0.25);
  overflow: hidden;
}

.quote-content {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
}

.quote-text {
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin-bottom: 12px;
  line-height: 1.5;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.quote-author {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
  margin-top: 10px;
}

.quote-decoration {
  position: absolute;
  width: 60px;
  height: 60px;
  opacity: 0.15;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M6.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L9.758 4.03c0 0-.218.052-.597.144C8.97 4.222 8.737 4.278 8.472 4.345c-.271.05-.56.187-.882.312C7.272 4.799 6.904 4.895 6.562 5.123c-.344.218-.741.4-1.091.692C5.132 6.116 4.723 6.377 4.421 6.76c-.33.358-.656.734-.909 1.162C3.219 8.33 3.02 8.778 2.81 9.221c-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539.017.109.025.168.025.168l.026-.006C2.535 17.474 4.338 19 6.5 19c2.485 0 4.5-2.015 4.5-4.5S8.985 10 6.5 10zM17.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L20.758 4.03c0 0-.218.052-.597.144-.191.048-.424.104-.689.171-.271.05-.56.187-.882.312-.317.143-.686.238-1.028.467-.344.218-.741.4-1.091.692-.339.301-.748.562-1.05.944-.33.358-.656.734-.909 1.162C14.219 8.33 14.02 8.778 13.81 9.221c-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539.017.109.025.168.025.168l.026-.006C13.535 17.474 15.338 19 17.5 19c2.485 0 4.5-2.015 4.5-4.5S19.985 10 17.5 10z"/></svg>');
  background-repeat: no-repeat;
  z-index: 1;
}

.quote-decoration.left {
  top: 10px;
  left: 10px;
}

.quote-decoration.right {
  bottom: 10px;
  right: 10px;
  transform: rotate(180deg);
}

.rank-badge {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 4px 12px;
  width: fit-content;
}

.badge-icon {
  width: 14px;
  height: 14px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  margin-right: 6px;
}

.rank-badge text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.user-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 12px 15px;
  margin-top: 15px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background-color: rgba(255, 255, 255, 0.2);
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
  color: white;
  display: block;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
  display: block;
}

/* 训练营区域样式 */
.training-camps {
  margin-bottom: 20px;
}

.section-subtitle {
  font-size: 12px;
  color: #888;
  margin-left: 10px;
}

.camps-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px 0;
}

.camp-block {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid #eaeaea;
  position: relative;
}

.camp-block.active {
  border: 1px solid #3f8463;
}

.camp-block.disabled {
  opacity: 0.7;
}

.camp-content {
  padding: 15px;
}

.camp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.camp-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.camp-badge {
  background: #e0e0e0;
  color: #666;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 10px;
}

.camp-badge.camp-active {
  background: #3f8463;
  color: white;
}

.camp-progress {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.progress-item {
  width: 100%;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}

.progress-count {
  font-weight: bold;
  color: #3f8463;
}

.progress-bar {
  height: 8px;
  background: #eaeaea;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3f8463, #2c5744);
  border-radius: 4px;
}

/* 训练类型样式 */
.training-types {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.training-type-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
}

.type-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.type-icon.pushups {
  background: linear-gradient(135deg, #4a8c6f, #3f8463);
}

.type-icon.situps {
  background: linear-gradient(135deg, #5c9e80, #4a8c6f);
}

.type-icon.squats {
  background: linear-gradient(135deg, #6eaf92, #5c9e80);
}

.type-icon::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 1;
  color: white;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-icon.pushups::before {
  content: "💪";
}

.type-icon.situps::before {
  content: "🔄";
}

.type-icon.squats::before {
  content: "🏋️";
}

.type-info {
  flex: 1;
}

.type-name {
  color: white;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.type-progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.type-progress-fill {
  height: 100%;
  background: white;
  border-radius: 3px;
}

.type-count {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  text-align: right;
}

.camp-lock {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  color: #999;
  font-size: 14px;
}

/* 今日训练提示 */
/* 今日训练banner - 横向铺满 */
.today-training-banner {
  position: relative;
  padding: 20px;
  /* margin: -1px -15px 25px; */
  overflow: hidden;
  min-height: 150px;
  background: linear-gradient(135deg, #3a6755 0%, #2c5744 100%);
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.training-divider {
  padding: 20px;
}

.today-training-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  overflow: hidden;
}

.today-training-bg::before {
  content: "";
  position: absolute;
  top: -20%;
  right: -10%;
  width: 250px;
  height: 250px;
  background: radial-gradient(
    circle,
    rgba(98, 157, 128, 0.3) 0%,
    rgba(98, 157, 128, 0) 70%
  );
  border-radius: 50%;
  z-index: 0;
}

.today-training-bg::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="rgba(255,255,255,0.04)" width="50" height="50" x="0" y="0"/><rect fill="rgba(255,255,255,0.04)" width="50" height="50" x="50" y="50"/></svg>');
  opacity: 0.5;
  z-index: -1;
}

/* 训练标题区域 */
.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.training-header-left {
  display: flex;
  align-items: baseline;
}

.training-title {
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.training-date {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 10px;
}

.training-badge {
  background-color: rgba(74, 140, 111, 0.4);
  padding: 4px 12px;
  border-radius: 20px;
}

.training-badge-text {
  font-size: 13px;
  color: white;
}

/* 训练内容区域 */
.training-content {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.training-icon {
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.icon-text {
  font-size: 24px;
  color: white;
}

.training-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.training-info {
  flex: 1;
}

.training-name {
  font-size: 16px;
  font-weight: bold;
  color: white;
  margin-bottom: 4px;
}

.training-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.training-status-tag {
  padding: 4px 10px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  color: white;
  font-size: 12px;
}

.training-status-tag.completed {
  background-color: rgba(52, 199, 89, 0.3);
}

/* 无训练安排时的样式 */
.no-training-content {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.no-training-icon {
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.no-training-text {
  flex: 1;
}

.no-training-title {
  font-size: 16px;
  font-weight: bold;
  color: white;
  margin-bottom: 4px;
}

.no-training-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

/* 按钮样式 */
.training-action {
  display: flex;
  justify-content: flex-end;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 15px;
  padding: 0 18px;
  height: 40px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.action-button:active {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(0.98);
}

.button-text {
  font-weight: bold;
}

.button-icon {
  margin-left: 8px;
  font-weight: bold;
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
  color: #3f8463;
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
  background-color: #4caf50;
}

.level-2 {
  background-color: #2196f3;
}

.level-3 {
  background-color: #ff9800;
}

.level-4 {
  background-color: #f44336;
}

.level-5 {
  background-color: #9c27b0;
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
