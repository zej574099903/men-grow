<template>
  <view class="exercise-container">
    <!-- 顶部进度条 -->
    <view class="progress-bar">
      <view 
        class="progress-inner" 
        :style="{width: progressPercentage + '%'}"
      ></view>
    </view>
    
    <!-- 训练信息 -->
    <view class="exercise-header">
      <view class="plan-info">
        <text class="plan-name">{{ plan.name }}</text>
        <text class="exercise-count">{{ currentExerciseIndex + 1 }}/{{ exercises.length }}</text>
      </view>
      <view class="exercise-progress">
        <text>{{ formatTime(elapsedTime) }}</text>
      </view>
    </view>
    
    <!-- 当前训练内容 -->
    <view class="current-exercise">
      <view class="exercise-image-container">
        <image 
          class="exercise-image" 
          :src="currentExercise.imageUrl || '/static/images/default-exercise.jpg'" 
          mode="aspectFit"
        ></image>
      </view>
      
      <view class="exercise-details">
        <text class="exercise-name">{{ currentExercise.name }}</text>
        <view class="exercise-meta">
          <text class="meta-item">{{ currentExercise.sets }}组</text>
          <text class="meta-separator">·</text>
          <text class="meta-item" v-if="currentExercise.type === 'time'">{{ currentExercise.duration }}秒</text>
          <text class="meta-item" v-else>{{ currentExercise.reps }}次</text>
        </view>
      </view>
    </view>
    
    <!-- 计时器/倒计时 -->
    <view class="timer-container" v-if="exerciseStarted">
      <view class="timer" v-if="currentExercise.type === 'time'">
        <text class="timer-text">{{ formatTimer(timerValue) }}</text>
      </view>
      <view class="counter" v-else>
        <text class="set-label">第 {{ currentSet }} 组</text>
        <text class="counter-text">{{ currentExercise.reps }}次</text>
      </view>
    </view>
    
    <!-- 训练描述 -->
    <view class="exercise-description" v-if="currentExercise.description">
      <text class="description-title">动作说明</text>
      <text class="description-content">{{ currentExercise.description }}</text>
    </view>
    
    <!-- 训练提示 -->
    <view class="exercise-tips" v-if="currentExercise.tips">
      <text class="tips-title">训练提示</text>
      <text class="tips-content">{{ currentExercise.tips }}</text>
    </view>
    
    <!-- 控制按钮 -->
    <view class="controls">
      <view class="control-row">
        <button 
          class="control-button" 
          :class="{primary: !exerciseStarted}"
          @click="exerciseStarted ? pauseExercise() : startExercise()"
        >
          <text>{{ exerciseStarted ? '暂停' : '开始' }}</text>
        </button>
        
        <button 
          class="control-button" 
          :disabled="!exerciseStarted"
          @click="completeCurrentExercise()"
        >
          <text>{{ currentExercise.type === 'time' ? '提前完成' : '完成组数' }}</text>
        </button>
      </view>
      
      <view class="control-row" v-if="exerciseStarted && currentExercise.type !== 'time'">
        <button 
          class="control-button small"
          @click="previousSet"
          :disabled="currentSet <= 1"
        >
          <text>上一组</text>
        </button>
        
        <button 
          class="control-button small"
          @click="nextSet"
          :disabled="currentSet >= currentExercise.sets"
        >
          <text>下一组</text>
        </button>
      </view>
    </view>
    
    <!-- 底部导航 -->
    <view class="navigation-bar">
      <button class="nav-button" @click="previousExercise" :disabled="currentExerciseIndex <= 0">
        <text class="nav-button-text">上一个</text>
      </button>
      
      <button class="nav-button primary" @click="skipExercise">
        <text class="nav-button-text">跳过</text>
      </button>
      
      <button class="nav-button" @click="nextExercise" :disabled="currentExerciseIndex >= exercises.length - 1">
        <text class="nav-button-text">下一个</text>
      </button>
    </view>
    
    <!-- 训练完成弹窗 -->
    <view class="completion-modal" v-if="showCompletionModal">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">训练完成!</text>
        </view>
        <view class="modal-body">
          <view class="stats-item">
            <text class="stats-label">训练时长:</text>
            <text class="stats-value">{{ formatTime(elapsedTime) }}</text>
          </view>
          <view class="stats-item">
            <text class="stats-label">完成动作:</text>
            <text class="stats-value">{{ completedExercises }}/{{ exercises.length }}</text>
          </view>
          <view class="stats-item">
            <text class="stats-label">消耗热量:</text>
            <text class="stats-value">{{ Math.round(elapsedTime / 60 * 6) }}大卡</text>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-button" @click="shareResults">分享成果</button>
          <button class="modal-button primary" @click="finishTraining">完成训练</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import store from '../../store/index.js';
import { createTrainingLog } from '../../api/training.js';

export default {
  data() {
    return {
      planId: '',
      plan: {},
      exercises: [],
      currentExerciseIndex: 0,
      currentExercise: {},
      currentSet: 1,
      exerciseStarted: false,
      timerValue: 0,
      timerInterval: null,
      elapsedTime: 0,
      elapsedTimeInterval: null,
      completedExercises: 0,
      completedSets: [],
      showCompletionModal: false,
      isPaused: false
    };
  },
  computed: {
    progressPercentage() {
      return this.exercises.length > 0 
        ? (this.currentExerciseIndex / this.exercises.length) * 100 
        : 0;
    }
  },
  onLoad(options) {
    if (options.planId) {
      this.planId = options.planId;
      this.loadExerciseData();
    } else {
      // 尝试从全局状态获取
      const currentPlan = store.getState().currentTrainingPlan;
      if (currentPlan) {
        this.plan = currentPlan;
        this.exercises = currentPlan.exercises || [];
        this.setupCurrentExercise();
      } else {
        uni.showToast({
          title: '未找到训练计划',
          icon: 'none'
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    }
  },
  onUnload() {
    // 清除所有定时器
    this.clearAllTimers();
  },
  methods: {
    // 加载训练数据
    loadExerciseData() {
      const currentPlan = store.getState().currentTrainingPlan;
      if (currentPlan && currentPlan._id === this.planId) {
        this.plan = currentPlan;
        this.exercises = currentPlan.exercises || [];
        this.setupCurrentExercise();
      } else {
        // 如果没有在全局状态中，应该重新获取
        uni.showToast({
          title: '训练数据加载失败',
          icon: 'none'
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    },
    
    // 设置当前训练动作
    setupCurrentExercise() {
      if (this.exercises.length === 0) return;
      
      this.currentExercise = this.exercises[this.currentExerciseIndex];
      this.currentSet = 1;
      this.timerValue = this.currentExercise.type === 'time' 
        ? this.currentExercise.duration 
        : 0;
      
      // 重置计时器
      this.clearAllTimers();
      this.exerciseStarted = false;
    },
    
    // 开始训练
    startExercise() {
      if (this.exercises.length === 0) return;
      
      this.exerciseStarted = true;
      this.isPaused = false;
      
      // 开始总时间计时
      if (!this.elapsedTimeInterval) {
        this.elapsedTimeInterval = setInterval(() => {
          this.elapsedTime++;
        }, 1000);
      }
      
      // 时间类型的练习需要倒计时
      if (this.currentExercise.type === 'time' && !this.timerInterval) {
        this.timerInterval = setInterval(() => {
          if (this.timerValue > 0) {
            this.timerValue--;
          } else {
            this.completeCurrentExercise();
          }
        }, 1000);
      }
    },
    
    // 暂停训练
    pauseExercise() {
      this.isPaused = true;
      this.clearAllTimers();
      
      uni.showModal({
        title: '训练暂停',
        content: '确定要暂停训练吗？',
        confirmText: '继续训练',
        cancelText: '退出训练',
        success: (res) => {
          if (res.confirm) {
            // 继续训练
            this.startExercise();
          } else if (res.cancel) {
            // 退出训练
            uni.navigateBack();
          }
        }
      });
    },
    
    // 完成当前训练
    completeCurrentExercise() {
      // 清除当前定时器
      this.clearTimer();
      
      // 记录完成情况
      if (!this.completedSets.some(item => 
        item.exerciseId === this.currentExercise._id && 
        item.set === this.currentSet)) {
          
        this.completedSets.push({
          exerciseId: this.currentExercise._id,
          set: this.currentSet,
          time: new Date()
        });
      }
      
      // 检查是否完成了所有组
      if (this.currentSet < this.currentExercise.sets) {
        // 还有下一组
        this.currentSet++;
        if (this.currentExercise.type === 'time') {
          this.timerValue = this.currentExercise.duration;
          this.startExercise(); // 自动开始下一组
        } else {
          // 次数类型需要手动点击开始
          this.exerciseStarted = false;
        }
      } else {
        // 完成了所有组，进入下一个训练
        this.completedExercises++;
        this.nextExercise();
      }
    },
    
    // 上一个训练动作
    previousExercise() {
      if (this.currentExerciseIndex > 0) {
        this.currentExerciseIndex--;
        this.setupCurrentExercise();
      }
    },
    
    // 下一个训练动作
    nextExercise() {
      if (this.currentExerciseIndex < this.exercises.length - 1) {
        this.currentExerciseIndex++;
        this.setupCurrentExercise();
      } else {
        // 已经是最后一个训练，显示完成弹窗
        this.clearAllTimers();
        this.showCompletionModal = true;
      }
    },
    
    // 跳过当前训练动作
    skipExercise() {
      uni.showModal({
        title: '跳过训练',
        content: '确定要跳过这个训练动作吗？',
        success: (res) => {
          if (res.confirm) {
            this.nextExercise();
          }
        }
      });
    },
    
    // 上一组
    previousSet() {
      if (this.currentSet > 1) {
        this.currentSet--;
      }
    },
    
    // 下一组
    nextSet() {
      if (this.currentSet < this.currentExercise.sets) {
        this.currentSet++;
      }
    },
    
    // 清除计时器
    clearTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },
    
    // 清除所有计时器
    clearAllTimers() {
      this.clearTimer();
      
      if (this.elapsedTimeInterval) {
        clearInterval(this.elapsedTimeInterval);
        this.elapsedTimeInterval = null;
      }
    },
    
    // 格式化总时间
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // 格式化定时器时间
    formatTimer(seconds) {
      return seconds.toString().padStart(2, '0');
    },
    
    // 分享训练结果
    shareResults() {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      });
    },
    
    // 完成训练
    finishTraining() {
      // 创建训练记录
      const trainingLog = {
        planId: this.plan._id,
        duration: this.elapsedTime,
        completedExercises: this.completedExercises,
        totalExercises: this.exercises.length,
        completedSets: this.completedSets,
        date: new Date()
      };
      
      // 调用API保存训练记录
      createTrainingLog(trainingLog).then(() => {
        uni.showToast({
          title: '训练记录已保存',
          icon: 'success'
        });
        
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/training/plan-list'
          });
        }, 1500);
      }).catch(error => {
        console.error('保存训练记录失败:', error);
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        });
      });
    }
  }
};
</script>

<style>
.exercise-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: 130px; /* 为底部导航栏留出空间 */
  position: relative;
  background-color: #f8f9fa;
}

/* 进度条样式 */
.progress-bar {
  width: 100%;
  height: 6px;
  background-color: #e9ecef;
  position: relative;
}

.progress-inner {
  height: 100%;
  background-color: #3F8463; /* 军绿色 */
  transition: width 0.3s ease;
}

/* 训练信息样式 */
.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #fff;
  border-bottom: 1px solid #e9ecef;
}

.plan-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.exercise-count {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.exercise-progress {
  font-size: 18px;
  color: #3F8463;
  font-weight: bold;
}

/* 当前训练内容样式 */
.current-exercise {
  background-color: #fff;
  padding: 15px;
  margin: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.exercise-image-container {
  width: 100%;
  height: 180px;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}

.exercise-image {
  width: 100%;
  height: 100%;
}

.exercise-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.exercise-meta {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.meta-item {
  font-size: 14px;
  color: #666;
}

.meta-separator {
  margin: 0 8px;
  color: #ccc;
}

/* 计时器/倒计时样式 */
.timer-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  margin: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.timer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timer-text {
  font-size: 50px;
  font-weight: bold;
  color: #3F8463;
}

.counter {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.set-label {
  font-size: 16px;
  color: #666;
  margin-bottom: 5px;
}

.counter-text {
  font-size: 50px;
  font-weight: bold;
  color: #3F8463;
}

/* 训练描述和提示样式 */
.exercise-description,
.exercise-tips {
  background-color: #fff;
  padding: 15px;
  margin: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.description-title,
.tips-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.description-content,
.tips-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

/* 控制按钮样式 */
.controls {
  padding: 15px;
  margin-top: 10px;
}

.control-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.control-button {
  flex: 1;
  height: 44px;
  margin: 0 5px;
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  display: flex;
  justify-content: center;
  align-items: center;
}

.control-button.primary {
  background-color: #3F8463;
  border: none;
}

.control-button.primary text {
  color: #fff;
}

.control-button text {
  font-size: 16px;
  color: #333;
}

.control-button.small {
  height: 38px;
}

.control-button.small text {
  font-size: 14px;
}

/* 底部导航栏 */
.navigation-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 15px;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.nav-button {
  flex: 1;
  height: 44px;
  margin: 0 5px;
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-button.primary {
  background-color: #3F8463;
  border: none;
}

.nav-button.primary .nav-button-text {
  color: #fff;
}

.nav-button-text {
  font-size: 16px;
  color: #333;
}

/* 完成弹窗样式 */
.completion-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 80%;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.modal-header {
  padding: 15px;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #3F8463;
}

.modal-body {
  padding: 20px;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.stats-label {
  font-size: 14px;
  color: #666;
}

.stats-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.modal-footer {
  display: flex;
  padding: 15px;
  border-top: 1px solid #e9ecef;
}

.modal-button {
  flex: 1;
  height: 44px;
  margin: 0 5px;
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  color: #333;
}

.modal-button.primary {
  background-color: #3F8463;
  border: none;
  color: #fff;
}
</style>
