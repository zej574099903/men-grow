<template>
  <view class="camp-detail-container">
    <!-- 顶部信息 -->
    <view class="header">
      <view class="background-decoration"></view>
      <view class="camp-info">
        <view class="camp-badge">{{ campTypeText }}</view>
        <text class="camp-name">体能训练营</text>
        <text class="camp-description">{{ campDescription }}</text>

        <!-- 总体进度 -->
        <view class="progress-overview">
          <view class="progress-stats">
            <view class="progress-label">总体训练进度</view>
            <view class="progress-percentage">{{ overallProgress }}%</view>
          </view>
          <view class="progress-bar">
            <view
              class="progress-fill"
              :style="{ width: overallProgress + '%' }"
            ></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 新兵营训练内容 -->
    <block v-if="campType === 'rookie'">
      <!-- 基础训练模块 - 3个100 -->
      <view class="training-module">
        <view class="module-header">
          <view class="module-title-container">
            <view class="module-icon">🎯</view>
            <text class="module-title">基础训练</text>
          </view>
          <view class="module-tag">新兵必修</view>
        </view>
        <view class="module-description"
          >完成俯卧撑、卷腹、深蹲各9000个训练，打造军人基本体能素质</view
        >

        <view class="training-list">
          <!-- 俯卧撑训练项 -->
          <view class="exercise-card" @click="startExercise('pushups')">
            <view class="exercise-icon-container pushups">
              <text class="exercise-icon">💪</text>
            </view>
            <view class="exercise-content">
              <view class="exercise-header">
                <text class="exercise-name">俯卧撑训练</text>
                <view
                  class="exercise-status"
                  :class="
                    trainingData.pushups >= 9000 ? 'completed' : 'in-progress'
                  "
                >
                  {{ getExerciseStatus("pushups") }}
                </view>
              </view>
              <view class="exercise-progress-container">
                <view class="exercise-count"
                  >{{ trainingData.pushups || 0 }}/9000 次</view
                >
                <view class="exercise-progress-bar">
                  <view
                    class="exercise-progress-fill"
                    :style="{
                      width:
                        Math.min(
                          ((trainingData.pushups || 0) / 9000) * 100,
                          100
                        ) + '%',
                    }"
                  ></view>
                </view>
              </view>
            </view>
          </view>

          <!-- 卷腹训练项 -->
          <view class="exercise-card" @click="startExercise('situps')">
            <view class="exercise-icon-container situps">
              <text class="exercise-icon">🙇‍♂️</text>
            </view>
            <view class="exercise-content">
              <view class="exercise-header">
                <text class="exercise-name">卷腹训练</text>
                <view
                  class="exercise-status"
                  :class="
                    trainingData.situps >= 9000 ? 'completed' : 'in-progress'
                  "
                >
                  {{ getExerciseStatus("situps") }}
                </view>
              </view>
              <view class="exercise-progress-container">
                <view class="exercise-count"
                  >{{ trainingData.situps || 0 }}/9000 次</view
                >
                <view class="exercise-progress-bar">
                  <view
                    class="exercise-progress-fill"
                    :style="{
                      width:
                        Math.min(
                          ((trainingData.situps || 0) / 9000) * 100,
                          100
                        ) + '%',
                    }"
                  ></view>
                </view>
              </view>
            </view>
          </view>

          <!-- 深蹲训练项 -->
          <view class="exercise-card" @click="startExercise('squats')">
            <view class="exercise-icon-container squats">
              <text class="exercise-icon">🏋️</text>
            </view>
            <view class="exercise-content">
              <view class="exercise-header">
                <text class="exercise-name">深蹲训练</text>
                <view
                  class="exercise-status"
                  :class="
                    trainingData.squats >= 9000 ? 'completed' : 'in-progress'
                  "
                >
                  {{ getExerciseStatus("squats") }}
                </view>
              </view>
              <view class="exercise-progress-container">
                <view class="exercise-count"
                  >{{ trainingData.squats || 0 }}/9000 次</view
                >
                <view class="exercise-progress-bar">
                  <view
                    class="exercise-progress-fill"
                    :style="{
                      width:
                        Math.min(
                          ((trainingData.squats || 0) / 9000) * 100,
                          100
                        ) + '%',
                    }"
                  ></view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 3公里跑训练模块 -->
      <view class="training-module">
        <view class="module-header">
          <view class="module-title-container">
            <view class="module-icon">🏃‍♂️</view>
            <text class="module-title">体能训练</text>
          </view>
          <view class="module-tag advanced">战术体能</view>
        </view>

        <view class="module-description"
          >完成30次3公里跑训练，提升心肺能力和全身耐力</view
        >

        <view class="run-card">
          <view class="run-header">
            <text class="run-title">3公里耐力跑</text>
            <view
              class="run-status"
              :class="
                trainingData.runningCompleted >= 30
                  ? 'completed'
                  : 'in-progress'
              "
            >
              {{ getRunningStatus() }}
            </view>
          </view>

          <view class="run-progress-container">
            <view class="run-count"
              >{{ trainingData.runningCompleted || 0 }}/30 次</view
            >
            <view class="run-progress-bar">
              <view
                class="run-progress-fill"
                :style="{
                  width:
                    Math.min(
                      ((trainingData.runningCompleted || 0) / 30) * 100,
                      100
                    ) + '%',
                }"
              ></view>
            </view>
          </view>

          <view class="run-stats-container">
            <view class="run-stats">
              <view class="run-stat-item">
                <view class="run-stat-icon">⏱️</view>
                <view class="run-stat-content">
                  <text class="run-stat-label">最佳时间</text>
                  <text class="run-stat-value">{{
                    formatRunningTime(trainingData.bestRunningTime || 0)
                  }}</text>
                </view>
              </view>

              <view class="run-stat-divider"></view>

              <view class="run-stat-item">
                <view class="run-stat-icon">🎯</view>
                <view class="run-stat-content">
                  <text class="run-stat-label">目标时间</text>
                  <text class="run-stat-value">{{
                    formatRunningTime(getRunningTargetTime())
                  }}</text>
                </view>
              </view>
            </view>
          </view>

          <button class="action-button" @click="startRunning">
            <view class="button-icon">▶️</view>
            <text>开始跑步训练</text>
          </button>
        </view>
      </view>

      <!-- 新兵结业考核模块 -->
      <view class="training-module">
        <view class="module-header">
          <view class="module-title-container">
            <view class="module-icon">🏅</view>
            <text class="module-title">结业考核</text>
          </view>
          <view class="module-tag special">晋升必要</view>
        </view>

        <view class="module-description"
          >完成所有训练项目后参加结业考核，通过考核晋升军衔</view
        >

        <view class="exam-card">
          <view class="exam-info">
            <view class="exam-content" v-if="examStats.completed">
              <view class="exam-result-item">
                <view class="exam-result-label">考核时间</view>
                <view class="exam-result-value">{{
                  formatRunningTime(examStats.examTime)
                }}</view>
              </view>
              <view class="exam-result-item">
                <view class="exam-result-label">考核评级</view>
                <view
                  class="exam-result-value"
                  :class="{
                    'exam-excellent': getExamGrade() === '优秀',
                    'exam-pass': getExamGrade() === '合格',
                    'exam-fail': getExamGrade() === '不合格',
                  }"
                  >{{ getExamGrade() }}</view
                >
              </view>
            </view>
            <view class="exam-status" v-else>
              <view
                class="exam-status-icon"
                :class="{ available: canTakeFinalExam }"
              >
                {{ canTakeFinalExam ? "✓" : "✗" }}
              </view>
              <view class="exam-status-text">{{
                canTakeFinalExam ? "已满足考核条件" : "需完成所有训练"
              }}</view>
            </view>
          </view>

          <button
            class="action-button"
            :class="{ disabled: !canTakeFinalExam && !examStats.completed }"
            @click="startFinalExam"
          >
            <view class="button-icon">{{
              examStats.completed ? "🏆" : "🎯"
            }}</view>
            <text>{{
              examStats.completed ? "查看考核成绩" : "参加结业考核"
            }}</text>
          </button>
        </view>
      </view>
    </block>
  </view>
</template>

<script>
// 导入训练API
import { getCampDetail, updateCampDetail } from '../../api/training.js';

// 添加goBack方法，用于返回上一级页面
export default {
  data() {
    return {
      campType: "", // rookie, veteran, special
      campTypeText: "新兵训练",
      campDescription: "完成新兵营基础训练和体能训练，通过结业考核后晋升军衔",
      overallProgress: 0,
      trainingData: {
        pushups: 2500, // 俯卧撑完成个数
        situps: 1800, // 卷腹完成个数
        squats: 3200, // 深蹲完成个数
        runningCompleted: 12, // 3公里跑完成次数
        bestRunningTime: 15 * 60 + 30, // 最佳时间 15分30秒
      },
      examStats: {
        completed: false,
        examTime: 0,
      },
    };
  },

  computed: {
    // 判断是否可以参加结业考核
    canTakeFinalExam() {
      if (!this.trainingData) return false;

      const completed =
        this.trainingData.pushups >= 9000 &&
        this.trainingData.situps >= 9000 &&
        this.trainingData.squats >= 9000 &&
        this.trainingData.runningCompleted >= 30;
      return completed;
    },
  },
  onLoad(options) {
    // 获取训练营类型
    this.campType = options.type || "rookie";
    // 根据训练营类型设置相应标题
    if (this.campType === "rookie") {
      this.campTypeText = "新兵训练";
      this.campDescription =
        "完成新兵营基础训练和体能训练，通过结业考核后晋升军衔";
    } else if (this.campType === "veteran") {
      this.campTypeText = "老兵训练";
      this.campDescription = "系统化的进阶训练，适合已完成新兵训练的人";
    } else if (this.campType === "special") {
      this.campTypeText = "特种兵训练";
      this.campDescription = "高强度、高难度的极限训练，挑战你的身体极限";
    }

    // 加载相应数据
    this.loadCampData();

    // 计算总体进度
    this.calculateOverallProgress();
  },

  // 设置页面标题
  onReady() {
    uni.setNavigationBarTitle({
      title: this.campTypeText,
    });
  },
  
  // 每次页面显示时都重新加载数据
  onShow() {
    // 重新加载训练营数据，确保显示最新数据
    this.loadCampData();
  },

  methods: {
    // 加载训练营数据
    async loadCampData() {
      try {
        console.log('开始从后端获取训练营详情数据');
        uni.showLoading({ title: '加载中...' });
        
        // 从后端获取训练营详情数据
        const result = await getCampDetail(this.campType);
        
        console.log('获取训练营详情数据成功:', result);
        
        if (result && result.data && result.success) {
          // 更新训练营详情数据
          if (result.data.trainingData) {
            this.trainingData = result.data.trainingData;
            // 同时保存到本地缓存
            uni.setStorageSync('rookieCampData', JSON.stringify(this.trainingData));
          }
          
          if (result.data.examStats) {
            this.examStats = result.data.examStats;
            // 同时保存到本地缓存
            uni.setStorageSync('rookieExamData', JSON.stringify(this.examStats));
          }
          
          // 计算总体进度
          this.calculateOverallProgress();
        } else {
          console.warn('获取训练营详情数据失败，尝试使用本地缓存');
          // 如果获取失败，尝试使用本地缓存
          this.loadLocalCampData();
        }
      } catch (error) {
        console.error('加载训练营数据失败:', error);
        // 如果出错，尝试使用本地缓存
        this.loadLocalCampData();
      } finally {
        uni.hideLoading();
      }
    },
    
    // 从本地缓存加载训练营数据
    loadLocalCampData() {
      if (this.campType === "rookie") {
        try {
          const savedData = uni.getStorageSync("rookieCampData");
          if (savedData) {
            this.trainingData = JSON.parse(savedData);
          }

          const examData = uni.getStorageSync("rookieExamData");
          if (examData) {
            this.examStats = JSON.parse(examData);
          }
        } catch (e) {
          console.error("解析本地存储数据失败:", e);
          // 重置为默认数据
          this.trainingData = {
            pushups: 0,
            situps: 0,
            squats: 0,
            runningCompleted: 0,
            bestRunningTime: 0,
          };
        }
      }
    },

    // 计算总体进度
    calculateOverallProgress() {
      try {
        if (this.campType === "rookie") {
          // 确保trainingData和examStats已初始化
          if (!this.trainingData) {
            this.trainingData = {
              pushups: 0,
              situps: 0,
              squats: 0,
              runningCompleted: 0,
              bestRunningTime: 0,
            };
          }

          if (!this.examStats) {
            this.examStats = {
              completed: false,
              examTime: 0,
            };
          }

          // 计算基础训练进度 (俯卧撑、卷腹、深蹲各9000次)
          const pushupProgress = Math.min(
            (this.trainingData.pushups || 0) / 9000,
            1
          );
          const situpProgress = Math.min(
            (this.trainingData.situps || 0) / 9000,
            1
          );
          const squatProgress = Math.min(
            (this.trainingData.squats || 0) / 9000,
            1
          );

          // 计算3公里跑进度 (30次完成)
          const runningProgress = Math.min(
            (this.trainingData.runningCompleted || 0) / 30,
            1
          );

          // 结业考核进度
          const examProgress =
            this.examStats && this.examStats.completed ? 1 : 0;

          // 总进度 = (基础训练进度 * 0.6 + 3公里跑进度 * 0.3 + 考核进度 * 0.1) * 100
          const basicAvgProgress =
            (pushupProgress + situpProgress + squatProgress) / 3;
          this.overallProgress = Math.floor(
            (basicAvgProgress * 0.6 +
              runningProgress * 0.3 +
              examProgress * 0.1) *
              100
          );
        }
      } catch (e) {
        console.error("计算进度出错:", e);
        // 设置默认进度为0
        this.overallProgress = 0;
      }
    },

    // 获取训练项目状态
    getExerciseStatus(type) {
      if (type === "pushups") {
        return this.trainingData.pushups >= 9000 ? "已完成" : "训练中";
      } else if (type === "situps") {
        return this.trainingData.situps >= 9000 ? "已完成" : "训练中";
      } else if (type === "squats") {
        return this.trainingData.squats >= 9000 ? "已完成" : "训练中";
      }
      return "训练中";
    },

    // 获取跑步训练状态
    getRunningStatus() {
      return this.trainingData.runningCompleted >= 30 ? "已完成" : "训练中";
    },

    // 获取跑步目标时间
    getRunningTargetTime() {
      // 3公里跑优秀标准，按照训练进度逐步提高要求
      const progress = this.trainingData.runningCompleted || 0;
      if (progress < 10) {
        return 18 * 60; // 18分钟
      } else if (progress < 20) {
        return 16 * 60; // 16分钟
      } else {
        return 15 * 60; // 15分钟
      }
    },

    // 格式化跑步时间显示
    formatRunningTime(seconds) {
      if (!seconds) return "00:00";
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    },

    // 获取考核等级
    getExamGrade() {
      if (!this.examStats.completed) return "-";
      const examTime = this.examStats.examTime;
      if (examTime <= 15 * 60) {
        // 15分钟内
        return "优秀";
      } else if (examTime <= 18 * 60) {
        // 18分钟内
        return "合格";
      } else {
        return "不合格";
      }
    },

    // 不再需要这个方法，转为computed属性

    // 开始基础训练项目
    startExercise(type) {
      uni.navigateTo({
        url: `/pages/training/exercise?type=${type}&campType=${this.campType}`,
      });
    },
    
    // 更新训练数据到后端
    async updateTrainingData(data) {
      try {
        console.log('开始更新训练数据到后端:', data);
        
        // 准备更新数据
        const updateData = {
          trainingData: { ...this.trainingData, ...data }
        };
        
        // 调用API更新数据
        const result = await updateCampDetail(updateData, this.campType);
        
        if (result && result.data && result.success) {
          console.log('更新训练数据成功:', result.data);
          
          // 更新本地数据
          if (result.data.trainingData) {
            this.trainingData = result.data.trainingData;
            // 同时更新本地缓存
            uni.setStorageSync('rookieCampData', JSON.stringify(this.trainingData));
          }
          
          // 重新计算总体进度
          this.calculateOverallProgress();
          
          // 显示成功提示
          uni.showToast({
            title: '训练数据更新成功',
            icon: 'success'
          });
          
          return true;
        } else {
          console.warn('更新训练数据失败:', result);
          
          // 显示错误提示
          uni.showToast({
            title: '更新训练数据失败',
            icon: 'none'
          });
          
          return false;
        }
      } catch (error) {
        console.error('更新训练数据异常:', error);
        
        // 显示错误提示
        uni.showToast({
          title: '更新训练数据失败',
          icon: 'none'
        });
        
        return false;
      }
    },

    // 开始跑步训练
    startRunning() {
      uni.navigateTo({
        url: "/pages/training/running?type=3km",
      });
    },

    // 开始结业考核
    startFinalExam() {
      if (!this.canTakeFinalExam) {
        uni.showToast({
          title: "请先完成所有训练项目",
          icon: "none",
        });
        return;
      }

      // 弹出确认对话框
      uni.showModal({
        title: "结业考核确认",
        content: "您即将开始新兵营结业考核，考核将测试您的综合体能水平。准备好了吗？",
        confirmText: "开始考核",
        cancelText: "稍后再说",
        success: async (res) => {
          if (res.confirm) {
            try {
              // 模拟考核过程，实际应跳转到考核页面
              uni.showLoading({
                title: "考核进行中...",
                mask: true,
              });

              // 模拟考核时间，实际应该是用户完成考核的时间
              // 随机生成一个考核时间，实际应该是用户真实的考核时间
              const examTime = Math.floor(Math.random() * (15 * 60 - 10 * 60 + 1)) + 10 * 60; // 10-15分钟之间
              const grade = examTime <= 15 * 60 ? (examTime <= 12 * 60 ? '优秀' : '合格') : '不合格';

              // 更新考核数据
              const newExamStats = {
                completed: true,
                examTime: examTime,
                grade: grade,
                date: new Date().toISOString()
              };
              
              // 准备更新数据
              const updateData = {
                examStats: newExamStats
              };
              
              // 调用API更新数据
              const result = await updateCampDetail(updateData, this.campType);
              
              if (result && result.data && result.success) {
                console.log('更新考核数据成功:', result.data);
                
                // 更新本地数据
                if (result.data.examStats) {
                  this.examStats = result.data.examStats;
                  // 同时更新本地缓存
                  uni.setStorageSync('rookieExamData', JSON.stringify(this.examStats));
                } else {
                  // 如果后端没有返回考核数据，使用本地数据
                  this.examStats = newExamStats;
                  uni.setStorageSync('rookieExamData', JSON.stringify(this.examStats));
                }
              } else {
                console.warn('更新考核数据失败，使用本地数据:', result);
                // 如果更新失败，使用本地数据
                this.examStats = newExamStats;
                uni.setStorageSync('rookieExamData', JSON.stringify(this.examStats));
              }

              // 计算总体进度
              this.calculateOverallProgress();

              // 显示成功对话框
              setTimeout(() => {
                uni.hideLoading();
                uni.showModal({
                  title: "考核完成",
                  content: `恭喜您完成新兵营结业考核！\n\n考核时间：${this.formatRunningTime(
                    this.examStats.examTime
                  )}\n考核等级：${this.examStats.grade}\n\n您已经成功毕业于新兵营，可以前往老兵营继续训练。`,
                  showCancel: false,
                  confirmText: "我知道了",
                  success: () => {
                    // 返回首页
                    uni.switchTab({
                      url: "/pages/home/home"
                    });
                  }
                });
              }, 3000);
            } catch (error) {
              console.error('考核过程出错:', error);
              uni.hideLoading();
              uni.showToast({
                title: '考核失败，请重试',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    
    // 后退操作
    goBack() {
      uni.navigateBack();
    },
  },
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
/* 训练营详情容器 */
.camp-detail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #3f8463 0%, #2c5744 100%);
  padding-bottom: 30px;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
    Helvetica Neue, Arial, sans-serif;
  color: #f5f5f5;
}

/* 顶部信息 */
.header {
  position: relative;
  padding: 40px 20px 50px;
  color: white;
  overflow: hidden;
  margin-bottom: 20px;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #3f8463, #2c5744);
  z-index: -1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.camp-info {
  position: relative;
  z-index: 1;
}

.camp-badge {
  background-color: rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 14px;
  font-weight: bold;
  padding: 5px 12px;
  border-radius: 15px;
  margin-bottom: 10px;
  display: inline-block;
}

.camp-name {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  display: block;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.camp-description {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 20px;
  display: block;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.progress-overview {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 15px;
  margin-top: 20px;
  .progress-label {
    color: white;
  }
}

.progress-text {
  font-size: 14px;
  margin-bottom: 10px;
  display: block;
  color: #555555;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 4px;
}

.progress-percentage {
  font-size: 12px;
  text-align: right;
  color: #fff;
}

/* 训练模块 */
.training-module {
  background-color: #ffffff;
  border-radius: 12px;
  margin: 15px 15px 25px;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(to right, #3a6b52, #2c5744);
  color: white;
}

.module-title-container {
  display: flex;
  align-items: center;
}

.module-icon {
  width: 32px;
  height: 32px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  margin-right: 10px;
}

.module-title {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.module-tag {
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 15px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}

.module-tag.advanced {
  background-color: rgba(255, 206, 86, 0.25);
  color: rgba(255, 255, 255, 0.95);
}

.module-tag.special {
  background-color: rgba(255, 140, 0, 0.25);
  color: rgba(255, 255, 255, 0.95);
}

.module-description {
  padding: 15px 20px 5px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.module-progress,
.module-status {
  font-size: 14px;
  color: #3f8463;
  font-weight: bold;
}

/* 训练列表样式 */
.training-list {
  padding: 0 15px 15px;
}

.exercise-card {
  display: flex;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 10px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}

.exercise-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.exercise-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: #3a6b52;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.exercise-icon-container.pushups {
  background: linear-gradient(135deg, #3a6b52, #2c5744);
}

.exercise-icon-container.situps {
  background: linear-gradient(135deg, #3f7aac, #2c5b87);
}

.exercise-icon-container.squats {
  background: linear-gradient(135deg, #7a6ba8, #554987);
}

.exercise-icon {
  font-size: 24px;
}

.exercise-content {
  flex: 1;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.exercise-name {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.exercise-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.exercise-status.in-progress {
  background-color: rgba(58, 107, 82, 0.1);
  color: #3a6b52;
}

.exercise-status.completed {
  background-color: rgba(58, 107, 82, 0.15);
  color: #2c5744;
}

.exercise-progress-container {
  margin-top: 5px;
}

.exercise-count {
  font-size: 14px;
  color: #777;
  margin-bottom: 5px;
}

.exercise-progress-bar {
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.exercise-progress-fill {
  height: 100%;
  background: linear-gradient(to right, #3a6b52, #2c5744);
  border-radius: 3px;
}

/* 训练项目 */
.exercise-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.exercise-item:hover,
.exercise-item:active {
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 15px 10px;
  transform: translateX(5px);
}

.exercise-name {
  font-size: 16px;
  color: #333333;
  font-weight: 500;
}

.exercise-count {
  color: #555555;
  font-size: 14px;
  margin-top: 5px;
}

.item-status {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 10px;
  background: #3f8463;
  color: white;
}

.status-icon {
  font-size: 20px;
  background: #f0f0f0;
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.status-icon.completed {
  background: rgba(63, 132, 99, 0.2);
  color: #3f8463;
}

/* 记录摘要 */
.records-summary {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 10px;
}

.record-item {
  text-align: center;
}

.record-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
  display: block;
}

.record-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
}

/* 结业考核 */
.module-locked {
  opacity: 0.7;
}

.locked-message {
  background: #f0f0f0;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  color: #666;
  text-align: center;
}

.exam-button {
  width: 100%;
  height: 45px;
  line-height: 45px;
  text-align: center;
  background: #3f8463;
  color: white;
  border-radius: 22.5px;
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0;
}

.action-button {
  background: linear-gradient(135deg, #3f8463, #2c5744);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: bold;
  margin-top: 20px;
  width: 100%;
  box-shadow: 0 4px 10px rgba(63, 132, 99, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.action-button:active {
  transform: translateY(2px);
  box-shadow: 0 2px 5px rgba(63, 132, 99, 0.3);
}

.exam-button[disabled] {
  background: #ccc;
  color: #666;
}

.exam-result {
  margin-top: 20px;
  text-align: center;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
}

.result-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  display: block;
}

.result-time {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  display: block;
}

.result-grade {
  display: inline-block;
  padding: 5px 15px;
  background: #3f8463;
  color: white;
  border-radius: 15px;
  font-weight: bold;
}

/* 跑步训练卡片 */
.run-card {
  padding: 15px 20px;
  background-color: #fafafa;
  border-radius: 10px;
  margin: 5px 15px 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.run-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.run-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.run-status {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 10px;
  font-weight: 500;
}

.run-status.in-progress {
  background-color: rgba(58, 107, 82, 0.1);
  color: #3a6b52;
}

.run-status.completed {
  background-color: rgba(58, 107, 82, 0.15);
  color: #2c5744;
}

.run-progress-container {
  margin-bottom: 15px;
}

.run-count {
  font-size: 14px;
  color: #777;
  margin-bottom: 5px;
}

.run-progress-bar {
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.run-progress-fill {
  height: 100%;
  background: linear-gradient(to right, #3a6b52, #2c5744);
  border-radius: 3px;
}

.run-stats-container {
  margin-bottom: 15px;
}

.run-stats {
  display: flex;
  padding: 10px;
  background-color: #f1f3f5;
  border-radius: 8px;
}

.run-stat-item {
  flex: 1;
  display: flex;
  align-items: center;
}

.run-stat-icon {
  font-size: 18px;
  margin-right: 10px;
  color: #3a6b52;
}

.run-stat-divider {
  width: 1px;
  background-color: #ddd;
  margin: 0 10px;
}

.run-stat-content {
  display: flex;
  flex-direction: column;
}

.run-stat-label {
  font-size: 12px;
  color: #777;
  margin-bottom: 2px;
}

.run-stat-value {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

/* 结业考核卡片 */
.exam-card {
  padding: 20px;
  background-color: #fafafa;
  border-radius: 10px;
  margin: 5px 15px 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.exam-info {
  margin-bottom: 20px;
}

.exam-content {
  display: flex;
  background-color: #f1f3f5;
  border-radius: 8px;
  padding: 15px;
}

.exam-result-item {
  flex: 1;
  text-align: center;
}

.exam-result-item:first-child {
  border-right: 1px solid #e9ecef;
}

.exam-result-label {
  font-size: 12px;
  color: #777;
  margin-bottom: 5px;
}

.exam-result-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.exam-result-value.exam-excellent {
  color: #4caf50;
}

.exam-result-value.exam-pass {
  color: #2196f3;
}

.exam-result-value.exam-fail {
  color: #f44336;
}

.exam-status {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f3f5;
  border-radius: 8px;
  padding: 20px;
}

.exam-status-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-right: 15px;
  color: #adb5bd;
}

.exam-status-icon.available {
  background-color: rgba(58, 107, 82, 0.15);
  color: #2c5744;
}

.exam-status-text {
  font-size: 16px;
  color: #666;
}

/* 按钮样式 */
.action-button {
  background: linear-gradient(135deg, #3a6b52, #2c5744);
  color: white;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.action-button:active {
  transform: scale(0.98);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.action-button.disabled {
  background: #c8c8c8;
  color: #888;
  box-shadow: none;
}

.button-icon {
  margin-right: 8px;
  font-size: 18px;
}

/* 适配暗黑模式 */
@media (prefers-color-scheme: dark) {
  .camp-detail-container {
    background-color: #1a1a1a;
    color: #e0e0e0;
  }

  .training-module {
    background-color: #2c2c2c;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
  }

  .module-header {
    background: linear-gradient(to right, #3a6b52, #254634);
  }

  .exercise-card,
  .run-card,
  .exam-card {
    background-color: #252525;
  }

  .exercise-name,
  .run-title {
    color: #e0e0e0;
  }

  .exercise-count,
  .run-count,
  .run-stat-label,
  .exam-result-label {
    color: #aaa;
  }

  .exercise-progress-bar,
  .run-progress-bar {
    background-color: #3a3a3a;
  }

  .run-stats,
  .exam-content,
  .exam-status {
    background-color: #333;
  }

  .run-stat-value,
  .exam-result-value {
    color: #e0e0e0;
  }
}
</style>
