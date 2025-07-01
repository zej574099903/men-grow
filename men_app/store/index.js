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
  login(userData, token) {
    // 保存token到本地存储
    uni.setStorageSync('token', token);
    uni.setStorageSync('userInfo', userData);
    
    this.setState({
      userInfo: userData,
      isLoggedIn: true
    });
    
    return this.state;
  },
  
  // 用户登出
  logout() {
    // 清除本地存储
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
    
    this.resetState();
    
    // 跳转到登录页
    uni.reLaunch({
      url: '/pages/login/login'
    });
    
    return this.state;
  },
  
  // 初始化状态（从本地存储加载）
  init() {
    const token = uni.getStorageSync('token');
    const userInfo = uni.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.setState({
        userInfo,
        isLoggedIn: true
      });
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
