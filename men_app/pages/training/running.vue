<template>
  <view class="running-container" :class="{'dark-mode': isDarkMode}">
    <!-- 顶部信息区 -->
    <view class="top-info">
      <view class="type-badge" :class="runningType === 'exam' ? 'exam-badge' : 'training-badge'">
        <text>{{ runningType === 'exam' ? '结业考核' : '3公里跑训练' }}</text>
      </view>
    </view>
    
    <!-- 运动数据区 -->
    <view class="stats-card">
      <view class="stat-row">
        <view class="stat-item">
          <text class="stat-value">{{ formatDistance }}</text>
          <text class="stat-label">距离</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ formatTime }}</text>
          <text class="stat-label">时间</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ formatPace }}</text>
          <text class="stat-label">配速</text>
        </view>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{width: progressPercentage + '%'}"></view>
      </view>
      <text class="progress-text">{{ progressPercentage }}% 完成</text>
    </view>
    
    <!-- 目标信息 -->
    <view class="target-info">
      <text class="target-text">目标：3.0公里</text>
      <text class="target-text" v-if="runningType === 'exam'">优秀标准：≤15分钟</text>
      <text class="target-text" v-if="runningType === 'exam'">合格标准：≤18分钟</text>
    </view>
    
    <!-- 控制区域 -->
    <view class="controls">
      <!-- 未开始 -->
      <block v-if="runningState === 'ready'">
        <button class="start-btn" @click="startRunning">开始</button>
      </block>
      
      <!-- 运行中 -->
      <block v-if="runningState === 'running'">
        <view class="btn-group">
          <button class="pause-btn" @click="pauseRunning">暂停</button>
          <button class="stop-btn" @click="stopRunning">结束</button>
        </view>
      </block>
      
      <!-- 已暂停 -->
      <block v-if="runningState === 'paused'">
        <view class="btn-group">
          <button class="resume-btn" @click="resumeRunning">继续</button>
          <button class="stop-btn" @click="stopRunning">结束</button>
        </view>
      </block>
      
      <!-- 已完成 -->
      <block v-if="runningState === 'finished'">
        <view class="result-card">
          <text class="result-title">{{ runningType === 'exam' ? '考核完成' : '训练完成' }}</text>
          
          <view class="result-stats">
            <view class="result-item">
              <text class="result-label">总距离</text>
              <text class="result-value">{{ formatDistance }}</text>
            </view>
            <view class="result-item">
              <text class="result-label">总时间</text>
              <text class="result-value">{{ formatTime }}</text>
            </view>
            <view class="result-item">
              <text class="result-label">平均配速</text>
              <text class="result-value">{{ formatPace }} 分/公里</text>
            </view>
          </view>
          
          <view class="result-grade" v-if="runningType === 'exam'">
            <text class="grade-label">考核成绩</text>
            <text class="grade-value" :class="getGradeClass()">{{ getGradeText() }}</text>
          </view>
          
          <button class="done-btn" @click="finishRunning">完成并返回</button>
        </view>
      </block>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      runningType: '3km', // 'exam' 或 '3km'
      runningState: 'ready', // 'ready', 'running', 'paused', 'finished'
      distance: 0, // 单位米
      elapsedTime: 0, // 单位秒
      timer: null,
      startTime: 0,
      pausedTime: 0,
      isDarkMode: false,
      // 以下是模拟GPS相关参数
      speedFactor: 1.0 // 模拟速度因子
    };
  },
  
  computed: {
    // 格式化距离显示
    formatDistance() {
      if (this.distance < 1000) {
        return `${this.distance.toFixed(0)}m`;
      } else {
        return `${(this.distance / 1000).toFixed(2)}km`;
      }
    },
    
    // 格式化时间显示
    formatTime() {
      const hours = Math.floor(this.elapsedTime / 3600);
      const minutes = Math.floor((this.elapsedTime % 3600) / 60);
      const seconds = Math.floor(this.elapsedTime % 60);
      
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    },
    
    // 格式化配速显示
    formatPace() {
      if (this.distance < 100) {
        return '--:--'; // 距离太短，配速不准确
      }
      
      const paceSeconds = (this.elapsedTime / (this.distance / 1000));
      const paceMinutes = Math.floor(paceSeconds / 60);
      const paceRemainSeconds = Math.floor(paceSeconds % 60);
      
      return `${paceMinutes}:${paceRemainSeconds.toString().padStart(2, '0')}`;
    },
    
    // 计算进度百分比
    progressPercentage() {
      return Math.min(Math.floor((this.distance / 3000) * 100), 100);
    }
  },
  
  onLoad(options) {
    // 获取跑步类型参数
    if (options && options.type) {
      this.runningType = options.type;
    }
    
    // 设置导航栏标题
    uni.setNavigationBarTitle({
      title: this.runningType === 'exam' ? '结业考核' : '3公里跑训练'
    });
    
    // 检测是否为暗黑模式
    uni.getSystemInfo({
      success: (res) => {
        this.isDarkMode = res.theme === 'dark';
      }
    });
  },
  
  onUnload() {
    // 清除计时器
    this.clearTimer();
  },
  
  methods: {
    // 开始跑步
    startRunning() {
      // 请求定位权限（实际应用中需要实现）
      this.checkLocationPermission(() => {
        // 开始计时
        this.runningState = 'running';
        this.startTime = Date.now() - (this.pausedTime || 0);
        
        // 开始计时
        this.timer = setInterval(() => {
          this.elapsedTime = (Date.now() - this.startTime) / 1000;
          this.simulateDistanceIncrease(); // 模拟距离增加
        }, 1000);
        
        uni.showToast({
          title: this.runningType === 'exam' ? '考核开始' : '训练开始',
          icon: 'success'
        });
      });
    },
    
    // 暂停跑步
    pauseRunning() {
      this.runningState = 'paused';
      this.pausedTime = Date.now() - this.startTime;
      this.clearTimer();
      
      uni.showToast({
        title: '已暂停',
        icon: 'none'
      });
    },
    
    // 继续跑步
    resumeRunning() {
      this.runningState = 'running';
      this.startTime = Date.now() - this.pausedTime;
      
      this.timer = setInterval(() => {
        this.elapsedTime = (Date.now() - this.startTime) / 1000;
        this.simulateDistanceIncrease();
      }, 1000);
      
      uni.showToast({
        title: '继续训练',
        icon: 'success'
      });
    },
    
    // 结束跑步
    stopRunning() {
      // 如果距离不足3公里，显示确认弹窗
      if (this.distance < 2850) { // 允许5%误差
        uni.showModal({
          title: '确定结束跑步?',
          content: '你还未完成3公里目标距离',
          success: (res) => {
            if (res.confirm) {
              this.completeRunning();
            }
          }
        });
      } else {
        this.completeRunning();
      }
    },
    
    // 完成跑步
    completeRunning() {
      this.clearTimer();
      this.runningState = 'finished';
    },
    
    // 完成并返回
    finishRunning() {
      // 保存训练记录
      this.saveRunningRecord();
      
      // 返回上一页
      uni.navigateBack();
    },
    
    // 清除计时器
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    
    // 检查位置权限（实际应用中需要实现）
    checkLocationPermission(callback) {
      // 模拟权限检查和请求
      // 实际应用中使用 uni.getLocation 和 uni.authorize
      setTimeout(() => {
        callback && callback();
      }, 500);
    },
    
    // 模拟距离增加（实际应用中应使用GPS数据）
    simulateDistanceIncrease() {
      // 模拟每秒增加的距离，约等于12km/h的速度
      const metersPerSecond = 3.33 * this.speedFactor;
      this.distance += metersPerSecond;
      
      // 随机微调速度因子，让配速更真实
      const randomFactor = 0.9 + Math.random() * 0.2; // 0.9-1.1之间
      this.speedFactor = Math.max(0.8, Math.min(1.2, this.speedFactor * randomFactor));
    },
    
    // 获取考核等级文本
    getGradeText() {
      if (this.runningType !== 'exam') return '';
      
      if (this.distance < 2850) { // 小于3公里的95%
        return '未完成';
      }
      
      if (this.elapsedTime <= 15 * 60) { // 15分钟内
        return '优秀';
      } else if (this.elapsedTime <= 18 * 60) { // 18分钟内
        return '合格';
      } else {
        return '不合格';
      }
    },
    
    // 获取等级对应的样式类
    getGradeClass() {
      const grade = this.getGradeText();
      if (grade === '优秀') return 'grade-excellent';
      if (grade === '合格') return 'grade-pass';
      if (grade === '不合格') return 'grade-fail';
      return '';
    },
    
    // 保存跑步记录
    saveRunningRecord() {
      try {
        if (this.runningType === 'exam' && this.distance >= 2850) {
          // 保存考核结果
          const examData = {
            completed: true,
            examTime: this.elapsedTime,
            examDate: new Date().toISOString().split('T')[0],
            grade: this.getGradeText()
          };
          uni.setStorageSync('rookieExamData', JSON.stringify(examData));
        } 
        else if (this.runningType === '3km' && this.distance >= 2850) {
          // 读取当前训练数据
          let trainingData = uni.getStorageSync('rookieCampData');
          if (trainingData) {
            trainingData = JSON.parse(trainingData);
          } else {
            trainingData = {
              pushups: 0,
              situps: 0,
              squats: 0,
              runningCompleted: 0,
              bestRunningTime: 0
            };
          }
          
          // 更新训练次数
          trainingData.runningCompleted = (trainingData.runningCompleted || 0) + 1;
          
          // 更新最佳时间
          if (!trainingData.bestRunningTime || this.elapsedTime < trainingData.bestRunningTime) {
            trainingData.bestRunningTime = this.elapsedTime;
          }
          
          // 保存数据
          uni.setStorageSync('rookieCampData', JSON.stringify(trainingData));
        }
      } catch (e) {
        console.error('保存记录失败:', e);
      }
    }
  }
};
</script>

<style>
/* 主容器 */
.running-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  padding: 20px;
  padding-top: calc(var(--status-bar-height) + 10px);
  box-sizing: border-box;
}

/* 暗黑模式 */
.dark-mode {
  background-color: #1c1c1e;
  color: #ffffff;
}

.dark-mode .stats-card,
.dark-mode .target-info,
.dark-mode .result-card {
  background-color: #2c2c2e;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

/* 顶部信息区 */
.top-info {
  margin-bottom: 20px;
}

/* 训练类型标签 */
.type-badge {
  display: inline-block;
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.training-badge {
  background: linear-gradient(135deg, #3A6B52, #2C5744);
  color: white;
}

.exam-badge {
  background: linear-gradient(135deg, #c23616, #e84118);
  color: white;
}

/* 运动数据卡片 */
.stats-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.dark-mode .stat-value {
  color: #fff;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.dark-mode .stat-label {
  color: #aaa;
}

/* 进度条 */
.progress-bar {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.dark-mode .progress-bar {
  background-color: #3a3a3c;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3A6B52, #4CAF50);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.dark-mode .progress-text {
  color: #aaa;
}

/* 目标信息 */
.target-info {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.target-text {
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
  color: #333;
}

.dark-mode .target-text {
  color: #ddd;
}

/* 控制区域 */
.controls {
  margin-top: auto;
  padding-top: 20px;
}

/* 按钮样式 */
.start-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #3A6B52, #2C5744);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(58, 107, 82, 0.3);
}

.btn-group {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.pause-btn,
.resume-btn {
  flex: 1;
  height: 50px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
}

.stop-btn {
  flex: 1;
  height: 50px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
}

/* 结果卡片 */
.result-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.result-title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 15px;
  color: #333;
  display: block;
}

.dark-mode .result-title {
  color: #fff;
}

.result-stats {
  margin-bottom: 20px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
}

.dark-mode .result-item {
  border-bottom: 1px solid #3a3a3c;
}

.result-label {
  color: #666;
}

.result-value {
  font-weight: 500;
  color: #333;
}

.dark-mode .result-label {
  color: #aaa;
}

.dark-mode .result-value {
  color: #fff;
}

.result-grade {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.dark-mode .result-grade {
  background-color: #2a2a2c;
}

.grade-label {
  font-weight: 500;
  color: #333;
}

.dark-mode .grade-label {
  color: #ddd;
}

.grade-value {
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 15px;
}

.grade-excellent {
  background-color: #2ecc71;
  color: white;
}

.grade-pass {
  background-color: #3498db;
  color: white;
}

.grade-fail {
  background-color: #e74c3c;
  color: white;
}

.done-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #3A6B52, #2C5744);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 15px;
}
</style>
