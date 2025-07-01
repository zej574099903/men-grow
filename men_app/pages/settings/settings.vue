<template>
  <view class="settings-container">
    <!-- 设置选项列表 -->
    <view class="settings-section">
      <view class="settings-header">
        <text class="section-title">账号设置</text>
      </view>
      <view class="settings-list">
        <view class="settings-item" @click="navigateTo('/pages/settings/change-password')">
          <text class="item-text">修改密码</text>
          <text class="item-arrow">></text>
        </view>
        <view class="settings-item" @click="navigateTo('/pages/settings/bind-phone')">
          <text class="item-text">绑定手机</text>
          <text class="item-value">{{ phoneNumber || '未绑定' }}</text>
          <text class="item-arrow">></text>
        </view>
      </view>
    </view>
    
    <view class="settings-section">
      <view class="settings-header">
        <text class="section-title">训练设置</text>
      </view>
      <view class="settings-list">
        <view class="settings-item">
          <text class="item-text">训练提醒</text>
          <switch :checked="trainingReminder" @change="toggleTrainingReminder" color="#3F8463" style="transform:scale(0.8)"/>
        </view>
        <view class="settings-item" @click="showTimePicker">
          <text class="item-text">提醒时间</text>
          <text class="item-value">{{ reminderTime }}</text>
          <text class="item-arrow">></text>
        </view>
        <view class="settings-item">
          <text class="item-text">休息日设置</text>
          <text class="item-value">{{ restDaysText }}</text>
          <text class="item-arrow">></text>
        </view>
      </view>
    </view>
    
    <view class="settings-section">
      <view class="settings-header">
        <text class="section-title">应用设置</text>
      </view>
      <view class="settings-list">
        <view class="settings-item">
          <text class="item-text">声音提示</text>
          <switch :checked="soundEnabled" @change="toggleSound" color="#3F8463" style="transform:scale(0.8)"/>
        </view>
        <view class="settings-item">
          <text class="item-text">震动反馈</text>
          <switch :checked="vibrationEnabled" @change="toggleVibration" color="#3F8463" style="transform:scale(0.8)"/>
        </view>
        <view class="settings-item" @click="navigateTo('/pages/settings/data-privacy')">
          <text class="item-text">数据与隐私</text>
          <text class="item-arrow">></text>
        </view>
        <view class="settings-item" @click="clearCache">
          <text class="item-text">清除缓存</text>
          <text class="item-value">{{ cacheSize }}</text>
          <text class="item-arrow">></text>
        </view>
      </view>
    </view>
    
    <view class="settings-section">
      <view class="settings-header">
        <text class="section-title">关于</text>
      </view>
      <view class="settings-list">
        <view class="settings-item" @click="checkUpdate">
          <text class="item-text">检查更新</text>
          <text class="item-value">{{ appVersion }}</text>
          <text class="item-arrow">></text>
        </view>
        <view class="settings-item" @click="navigateTo('/pages/settings/about')">
          <text class="item-text">关于铁炼计划</text>
          <text class="item-arrow">></text>
        </view>
      </view>
    </view>
    
    <!-- 弹出的时间选择器 -->
    <uni-popup ref="timePopup" type="bottom">
      <view class="time-picker-container">
        <view class="picker-header">
          <text class="cancel-btn" @click="cancelTimePicker">取消</text>
          <text class="title">设置提醒时间</text>
          <text class="confirm-btn" @click="confirmTimePicker">确定</text>
        </view>
        <picker-view
          class="time-picker"
          :value="timePickerValue"
          @change="onTimePickerChange"
        >
          <picker-view-column>
            <view class="picker-item" v-for="(hour, index) in hours" :key="'hour-'+index">
              {{ hour < 10 ? '0' + hour : hour }}</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(minute, index) in minutes" :key="'minute-'+index">
              {{ minute < 10 ? '0' + minute : minute }}</view>
          </picker-view-column>
        </picker-view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 账号设置
      phoneNumber: '138****6789',
      
      // 训练设置
      trainingReminder: true,
      reminderTime: '19:00',
      restDays: [0, 6], // 星期日、星期六
      
      // 应用设置
      soundEnabled: true,
      vibrationEnabled: true,
      cacheSize: '8.5MB',
      
      // 关于
      appVersion: 'v1.0.0',
      
      // 时间选择器
      timePickerValue: [19, 0],
      hours: Array.from({length: 24}, (_, i) => i),
      minutes: Array.from({length: 60}, (_, i) => i),
      tempTimeValue: [19, 0]
    };
  },
  computed: {
    restDaysText() {
      const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      return this.restDays.map(day => dayNames[day]).join('、');
    }
  },
  onLoad() {
    this.loadSettings();
  },
  methods: {
    // 加载设置
    loadSettings() {
      // 从本地存储或API加载设置
      // 这里使用模拟数据
      const savedSettings = uni.getStorageSync('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        this.trainingReminder = settings.trainingReminder !== undefined ? settings.trainingReminder : true;
        this.reminderTime = settings.reminderTime || '19:00';
        this.restDays = settings.restDays || [0, 6];
        this.soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
        this.vibrationEnabled = settings.vibrationEnabled !== undefined ? settings.vibrationEnabled : true;
        
        // 设置时间选择器的初始值
        const [hours, minutes] = this.reminderTime.split(':').map(Number);
        this.timePickerValue = [hours, minutes];
        this.tempTimeValue = [hours, minutes];
      }
    },
    
    // 保存设置
    saveSettings() {
      const settings = {
        trainingReminder: this.trainingReminder,
        reminderTime: this.reminderTime,
        restDays: this.restDays,
        soundEnabled: this.soundEnabled,
        vibrationEnabled: this.vibrationEnabled
      };
      uni.setStorageSync('appSettings', JSON.stringify(settings));
      uni.showToast({
        title: '设置已保存',
        icon: 'success'
      });
    },
    
    // 页面导航
    navigateTo(url) {
      // 实际项目中取消注释
      // uni.navigateTo({ url });
      
      // 开发阶段提示
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    },
    
    // 切换训练提醒
    toggleTrainingReminder(e) {
      this.trainingReminder = e.detail.value;
      this.saveSettings();
    },
    
    // 切换声音
    toggleSound(e) {
      this.soundEnabled = e.detail.value;
      this.saveSettings();
    },
    
    // 切换震动
    toggleVibration(e) {
      this.vibrationEnabled = e.detail.value;
      this.saveSettings();
    },
    
    // 清除缓存
    clearCache() {
      uni.showLoading({
        title: '正在清理...',
        mask: true
      });
      
      setTimeout(() => {
        uni.hideLoading();
        this.cacheSize = '0B';
        uni.showToast({
          title: '缓存已清理',
          icon: 'success'
        });
      }, 1500);
    },
    
    // 检查更新
    checkUpdate() {
      uni.showLoading({
        title: '检查更新中...',
        mask: true
      });
      
      setTimeout(() => {
        uni.hideLoading();
        uni.showModal({
          title: '检查更新',
          content: '当前已是最新版本',
          showCancel: false
        });
      }, 1500);
    },
    
    // 显示时间选择器
    showTimePicker() {
      // 初始化临时时间值
      const [hours, minutes] = this.reminderTime.split(':').map(Number);
      this.tempTimeValue = [hours, minutes];
      this.timePickerValue = [hours, minutes];
      
      // 显示弹窗
      this.$refs.timePopup.open();
    },
    
    // 取消时间选择
    cancelTimePicker() {
      this.$refs.timePopup.close();
    },
    
    // 确认时间选择
    confirmTimePicker() {
      const [hour, minute] = this.tempTimeValue;
      this.reminderTime = `${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}`;
      this.saveSettings();
      this.$refs.timePopup.close();
    },
    
    // 时间选择器变化事件
    onTimePickerChange(e) {
      this.tempTimeValue = e.detail.value;
    }
  }
};
</script>

<style>
.settings-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 20px;
}

/* 设置部分样式 */
.settings-section {
  margin: 15px;
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
}

.settings-header {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.settings-list {
  padding: 0 15px;
}

.settings-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.settings-item:last-child {
  border-bottom: none;
}

.item-text {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.item-value {
  font-size: 14px;
  color: #999;
  margin-right: 5px;
}

.item-arrow {
  font-size: 16px;
  color: #ccc;
}

/* 时间选择器样式 */
.time-picker-container {
  background-color: #fff;
  padding-bottom: 20px;
}

.picker-header {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.cancel-btn {
  font-size: 16px;
  color: #999;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
}

.confirm-btn {
  font-size: 16px;
  color: #3F8463;
}

.time-picker {
  width: 100%;
  height: 250px;
}

.picker-item {
  height: 40px;
  line-height: 40px;
  text-align: center;
}
</style>
