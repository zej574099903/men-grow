<template>
  <view class="edit-profile-container">
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">头像</text>
        <view class="avatar-uploader" @click="chooseAvatar">
          <image class="avatar" :src="formData.avatar || '/static/avatar.png'" mode="aspectFill"></image>
          <text class="upload-text">点击更换</text>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">昵称</text>
        <input class="form-input" v-model="formData.nickname" placeholder="请输入昵称" />
      </view>

      <view class="form-item">
        <text class="form-label">军衔等级</text>
        <view class="rank-display">
          <text>{{ userRank }}</text>
          <text class="rank-note">(根据训练量和成就自动计算)</text>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">个人简介</text>
        <textarea class="form-textarea" v-model="formData.bio" placeholder="请输入个人简介" />
      </view>
    </view>

    <button class="submit-button" @click="saveProfile" :loading="loading">保存</button>
  </view>
</template>

<script>
import { getUser, updateCurrentUser } from '../../api/user.js';
import store from '../../store/index.js';

export default {
  data() {
    return {
      formData: {
        nickname: '',
        avatar: '',
        bio: ''
      },
      userRank: '新兵',
      loading: false
    };
  },
  onLoad() {
    this.loadUserData();
  },
  methods: {
    // 加载用户数据
    loadUserData() {
      // 优先从本地存储获取用户信息，确保显示最新编辑的数据
      const localUserInfo = uni.getStorageSync('userInfo');
      
      if (localUserInfo) {
        console.log('编辑页从本地存储加载用户数据:', localUserInfo);
        
        // 使用本地存储中的数据填充表单
        this.formData = {
          nickname: localUserInfo.nickname || '',
          avatar: localUserInfo.avatar || '',
          soldierType: localUserInfo.soldierType || '',
          bio: localUserInfo.bio || ''
        };
        
        // 设置兵种选择器索引
        const index = this.soldierTypeOptions.findIndex(item => item === this.formData.soldierType);
        this.soldierTypeIndex = index >= 0 ? index : 0;
        return;
      }
      
      // 如果本地存储没有数据，则尝试从store获取
      const userState = store.getState();
      const storeUserInfo = userState.userInfo;
      
      if (storeUserInfo) {
        console.log('编辑页从store获取用户数据:', storeUserInfo);
        
        this.formData = {
          nickname: storeUserInfo.nickname || '',
          avatar: storeUserInfo.avatar || '',
          soldierType: storeUserInfo.soldierType || '',
          bio: storeUserInfo.bio || ''
        };
        
        const index = this.soldierTypeOptions.findIndex(item => item === this.formData.soldierType);
        this.soldierTypeIndex = index >= 0 ? index : 0;
        return;
      }
      
      // 最后尝试从API获取
      const userId = storeUserInfo?._id;
      if (userId) {
        this.loading = true;
        getUser(userId)
          .then(res => {
            if (res) {
              console.log('编辑页从API获取用户数据:', res);
              
              this.formData = {
                nickname: res.nickname || '',
                avatar: res.avatar || '',
                bio: res.bio || ''
              };
              
              // 设置用户军衔等级
              this.userRank = res.userRank || '新兵';
            }
          })
          .catch(err => {
            console.error('获取用户数据失败:', err);
            uni.showToast({
              title: '获取用户数据失败',
              icon: 'none'
            });
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        // 用户未登录，返回登录页
        uni.reLaunch({
          url: '/pages/login/login'
        });
      }
    },
    
    // 选择头像
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // 实际项目中，这里应该上传图片到服务器，获取URL后再赋值
          // 这里为了演示，直接使用本地临时路径
          this.formData.avatar = res.tempFilePaths[0];
          
          // 提示用户
          uni.showToast({
            title: '头像选择成功，保存后生效',
            icon: 'none'
          });
        }
      });
    },
    

    
    // 保存资料
    saveProfile() {
      // 简单表单验证
      if (!this.formData.nickname) {
        uni.showToast({
          title: '请输入昵称',
          icon: 'none'
        });
        return;
      }
      
      this.loading = true;
      
      // 调用更新用户信息的API
      updateCurrentUser(this.formData)
        .then(res => {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          });
          
          // 更新存储的用户信息
          const userState = store.getState();
          if (userState.userInfo) {
            // 确保所有字段都被更新，特别是头像和个人简介
            const updatedUser = {
              ...userState.userInfo,
              nickname: this.formData.nickname,
              avatar: this.formData.avatar,
              bio: this.formData.bio,
              // 保持原有军衔等级，因为这是系统根据训练情况自动计算的
              userRank: userState.userInfo.userRank || '新兵'
            };
            
            console.log('保存用户信息到store和本地存储:', updatedUser);
            
            // 更新store
            store.setState({
              userInfo: updatedUser
            });
            
            // 更新本地存储
            uni.setStorageSync('userInfo', updatedUser);
          }
          
          // 返回个人中心页
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        })
        .catch(err => {
          console.error('保存失败:', err);
          uni.showToast({
            title: err.message || '保存失败',
            icon: 'none'
          });
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style>
.edit-profile-container {
  padding: 20px;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.form-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.form-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  font-size: 15px;
  color: #333;
  margin-bottom: 10px;
  display: block;
}

.form-input {
  height: 40px;
  width: 100%;
  font-size: 16px;
  color: #333;
}

.form-textarea {
  width: 100%;
  height: 100px;
  font-size: 16px;
  color: #333;
}

.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.upload-text {
  color: #3F8463;
  font-size: 14px;
}

.rank-display {
  height: 40px;
  line-height: 40px;
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #666;
}

.rank-note {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.submit-button {
  background-color: #3F8463;
  color: white;
  font-size: 16px;
  padding: 12px 0;
  border-radius: 8px;
}
</style>
