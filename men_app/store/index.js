/**
 * 状态管理
 * 使用uni-app提供的globalData模式管理全局状态
 */

// 定义初始状态
const initialState = {
  userInfo: null,          // 用户信息
  isLoggedIn: false,       // 登录状态
  trainingPlans: [],       // 训练计划列表
  trainingLogs: [],        // 训练记录
  medals: [],              // 用户勋章
  currentTrainingPlan: null,  // 当前选中的训练计划
  notifications: []        // 通知消息
};

// 创建状态管理对象
const store = {
  state: { ...initialState },
  
  // 获取状态
  getState() {
    return this.state;
  },
  
  // 设置状态
  setState(newState) {
    this.state = { ...this.state, ...newState };
    return this.state;
  },
  
  // 重置状态
  resetState() {
    this.state = { ...initialState };
    return this.state;
  },
  
  // 用户登录
  login(userData, token, expiresIn = 7 * 24 * 60 * 60 * 1000) { // 默认7天过期
    // 计算过期时间
    const expiresAt = new Date().getTime() + expiresIn;
    
    // 保存token、用户信息和过期时间到本地存储
    uni.setStorageSync('token', token);
    uni.setStorageSync('userInfo', userData);
    uni.setStorageSync('expiresAt', expiresAt);
    
    this.setState({
      userInfo: userData,
      isLoggedIn: true,
      expiresAt: expiresAt
    });
    
    return this.state;
  },
  
  // 检查token是否有效
  isTokenValid() {
    const expiresAt = uni.getStorageSync('expiresAt');
    const now = new Date().getTime();
    return expiresAt && now < expiresAt;
  },
  
  // 用户登出
  logout() {
    // 清除本地存储
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
    uni.removeStorageSync('expiresAt');
    
    // 重置状态
    this.resetState();
    
    // 跳转到登录页
    uni.reLaunch({
      url: '/pages/login/login'
    });
    
    return this.state;
  },
  
  // 初始化状态（从本地存储加载）
  init() {
    // 从本地存储加载
    const token = uni.getStorageSync('token');
    const userInfo = uni.getStorageSync('userInfo');
    const expiresAt = uni.getStorageSync('expiresAt');
    
    // 检查token是否存在且未过期
    if (token && userInfo && expiresAt) {
      const now = new Date().getTime();
      
      // 如果token未过期，恢复登录状态
      if (now < expiresAt) {
        this.setState({
          userInfo,
          isLoggedIn: true,
          expiresAt
        });
      } else {
        // token已过期，清除登录状态
        this.logout();
      }
    }
    
    return this.state;
  },
  
  // 设置训练计划列表
  setTrainingPlans(plans) {
    this.setState({ trainingPlans: plans });
    return this.state.trainingPlans;
  },
  
  // 设置当前训练计划
  setCurrentTrainingPlan(plan) {
    this.setState({ currentTrainingPlan: plan });
    return this.state.currentTrainingPlan;
  },
  
  // 设置训练记录
  setTrainingLogs(logs) {
    this.setState({ trainingLogs: logs });
    return this.state.trainingLogs;
  },
  
  // 设置用户勋章
  setMedals(medals) {
    this.setState({ medals: medals });
    return this.state.medals;
  },
  
  // 添加通知
  addNotification(notification) {
    const notifications = [...this.state.notifications, notification];
    this.setState({ notifications });
    return this.state.notifications;
  },
  
  // 清除通知
  clearNotifications() {
    this.setState({ notifications: [] });
    return this.state.notifications;
  }
};

export default store;
