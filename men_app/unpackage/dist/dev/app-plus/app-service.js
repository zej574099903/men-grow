if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const BASE_URL = "http://10.30.17.9:3000";
  const requestInterceptor = (config) => {
    const token = uni.getStorageSync("token");
    if (token) {
      config.header = {
        ...config.header,
        "Authorization": `Bearer ${token}`
      };
    }
    return config;
  };
  const responseInterceptor = (response) => {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.data;
    } else {
      const error = new Error(response.data.message || "请求失败");
      error.response = response;
      throw error;
    }
  };
  const request = (options) => {
    const config = {
      url: `${BASE_URL}${options.url}`,
      method: options.method || "GET",
      data: options.data || {},
      header: options.header || {
        "Content-Type": "application/json"
      },
      timeout: options.timeout || 3e4
    };
    const interceptedConfig = requestInterceptor(config);
    return new Promise((resolve, reject) => {
      uni.request({
        ...interceptedConfig,
        success: (res) => {
          try {
            const data = responseInterceptor(res);
            resolve(data);
          } catch (error) {
            if (res.statusCode === 401) {
              uni.removeStorageSync("token");
              uni.removeStorageSync("userInfo");
              uni.showToast({
                title: "登录已过期，请重新登录",
                icon: "none"
              });
              setTimeout(() => {
                uni.reLaunch({
                  url: "/pages/login/login"
                });
              }, 1500);
            } else {
              uni.showToast({
                title: error.message || "请求失败",
                icon: "none"
              });
            }
            reject(error);
          }
        },
        fail: (err) => {
          uni.showToast({
            title: "网络请求失败，请检查网络连接",
            icon: "none"
          });
          reject(new Error(err.errMsg || "网络请求失败"));
        }
      });
    });
  };
  const request$1 = {
    get: (url, data, options = {}) => {
      return request({
        url,
        method: "GET",
        data,
        ...options
      });
    },
    post: (url, data, options = {}) => {
      return request({
        url,
        method: "POST",
        data,
        ...options
      });
    },
    put: (url, data, options = {}) => {
      return request({
        url,
        method: "PUT",
        data,
        ...options
      });
    },
    delete: (url, data, options = {}) => {
      return request({
        url,
        method: "DELETE",
        data,
        ...options
      });
    }
  };
  const getTrainingPlans = () => {
    return request$1.get("/trainings/plans");
  };
  const getTrainingPlanDetail = (id) => {
    return request$1.get(`/trainings/plans/${id}`);
  };
  const getTrainingPlansByType = (type) => {
    return request$1.get(`/trainings/plans/type/${type}`);
  };
  const getUserTrainingLogs = (userId) => {
    if (userId) {
      return request$1.get(`/trainings/logs/user/${userId}`);
    }
    return request$1.get("/trainings/logs/me");
  };
  const createTrainingLog = (data) => {
    return request$1.post("/trainings/logs", data);
  };
  const selectTrainingPlan = (planId) => {
    return request$1.post("/trainings/plans/select", { planId });
  };
  const getCurrentTrainingPlan = () => {
    return request$1.get("/trainings/plans/current");
  };
  const getCampStats = (userId) => {
    const params = userId ? { userId } : {};
    return request$1.get("/trainings/camps/stats", { params });
  };
  const updateCampStats = (data, userId) => {
    const payload = { stats: data };
    if (userId)
      payload.userId = userId;
    return request$1.put("/trainings/camps/stats", payload);
  };
  const getUserMedals = (userId) => {
    if (!userId) {
      const store2 = uni.getStorageSync("user-store") || {};
      userId = store2.userId;
      if (!userId) {
        formatAppLog("warn", "at api/achievement.js:29", "用户未登录，无法获取勋章");
        return Promise.resolve([]);
      }
    }
    return request$1.get(`/achievements/user/${userId}`);
  };
  const AMAP_KEY = "339c7299cd4988e73ab098e50b09b2ff";
  function getCurrentLocation() {
    return new Promise((resolve, reject) => {
      uni.getLocation({
        type: "gcj02",
        // 使用国测局坐标系（火星坐标系）
        success: (res) => {
          formatAppLog("log", "at api/weather.js:12", "获取位置成功:", res);
          resolve({
            latitude: res.latitude,
            longitude: res.longitude
          });
        },
        fail: (err) => {
          formatAppLog("error", "at api/weather.js:19", "获取位置失败:", err);
          reject(err);
        }
      });
    });
  }
  function getCityByLocation(latitude, longitude) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: `https://restapi.amap.com/v3/geocode/regeo`,
        method: "GET",
        data: {
          key: AMAP_KEY,
          location: `${longitude},${latitude}`,
          extensions: "base",
          output: "json"
        },
        success: (res) => {
          if (res.data && res.data.status === "1" && res.data.regeocode) {
            const addressComponent = res.data.regeocode.addressComponent;
            resolve({
              province: addressComponent.province,
              city: addressComponent.city || addressComponent.province,
              // 直辖市可能没有city
              district: addressComponent.district,
              formatted_address: res.data.regeocode.formatted_address
            });
          } else {
            reject(new Error("解析地址信息失败"));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }
  function getDefaultWeather() {
    return {
      city: "北京市",
      weather: "晴朗",
      temperature: "25°C",
      icon: "🌞",
      advice: "适宜户外训练",
      windDirection: "东南",
      windPower: "3",
      humidity: "40",
      reportTime: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] + " 08:00:00"
    };
  }
  function getWeatherByCity(cityCode) {
    return new Promise((resolve, reject) => {
      formatAppLog("log", "at api/weather.js:76", "开始获取天气信息，城市编码:", cityCode || "默认北京");
      const defaultWeather = getDefaultWeather();
      uni.request({
        url: `https://restapi.amap.com/v3/weather/weatherInfo`,
        method: "GET",
        timeout: 8e3,
        // 8秒超时
        data: {
          key: AMAP_KEY,
          city: cityCode || "110000",
          // 默认北京
          extensions: "base",
          // 获取实时天气
          output: "json"
        },
        success: (res) => {
          formatAppLog("log", "at api/weather.js:92", "天气API响应:", res.data);
          if (res.data && res.data.status === "1" && res.data.lives && res.data.lives.length > 0) {
            const liveWeather = res.data.lives[0];
            let weatherIcon = "🌞";
            const weatherDesc = liveWeather.weather;
            if (weatherDesc.includes("雨")) {
              weatherIcon = weatherDesc.includes("大雨") ? "🌧" : "🌦";
            } else if (weatherDesc.includes("云") || weatherDesc.includes("阴")) {
              weatherIcon = weatherDesc.includes("多云") ? "🌤" : "☁️";
            } else if (weatherDesc.includes("雪")) {
              weatherIcon = "❄️";
            } else if (weatherDesc.includes("雾") || weatherDesc.includes("霾")) {
              weatherIcon = "🌫";
            } else if (weatherDesc.includes("风")) {
              weatherIcon = "🌬";
            }
            let trainingAdvice = "适宜户外训练";
            if (weatherDesc.includes("雨") || weatherDesc.includes("雪")) {
              trainingAdvice = "建议室内训练";
            } else if (weatherDesc.includes("雾") || weatherDesc.includes("霾")) {
              trainingAdvice = "空气质量差，建议室内训练";
            } else if (parseInt(liveWeather.temperature) > 30) {
              trainingAdvice = "温度较高，注意防晒降温";
            } else if (parseInt(liveWeather.temperature) < 5) {
              trainingAdvice = "温度较低，注意保暖";
            }
            resolve({
              city: liveWeather.city,
              weather: liveWeather.weather,
              temperature: `${liveWeather.temperature}°C`,
              icon: weatherIcon,
              advice: trainingAdvice,
              windDirection: liveWeather.winddirection,
              windPower: liveWeather.windpower,
              humidity: liveWeather.humidity,
              reportTime: liveWeather.reporttime
            });
          } else {
            formatAppLog("error", "at api/weather.js:136", "获取天气信息失败:", res.data);
            resolve(defaultWeather);
          }
        },
        fail: (err) => {
          formatAppLog("error", "at api/weather.js:142", "天气API请求失败:", err);
          resolve(defaultWeather);
        }
      });
    });
  }
  async function getCompleteWeatherInfo() {
    formatAppLog("log", "at api/weather.js:152", "开始获取完整天气信息");
    const weatherInfo = await getWeatherByCity();
    formatAppLog("log", "at api/weather.js:156", "天气信息获取成功:", weatherInfo);
    let locationInfo = {
      latitude: 39.9042,
      longitude: 116.4074,
      province: weatherInfo.city.includes("市") ? weatherInfo.city : weatherInfo.city + "省",
      city: weatherInfo.city,
      district: "",
      formatted_address: weatherInfo.city
    };
    try {
      formatAppLog("log", "at api/weather.js:170", "尝试获取位置信息");
      const location = await getCurrentLocation();
      formatAppLog("log", "at api/weather.js:172", "位置获取成功:", location);
      try {
        const cityInfo = await getCityByLocation(location.latitude, location.longitude);
        formatAppLog("log", "at api/weather.js:177", "城市信息获取成功:", cityInfo);
        locationInfo = {
          ...location,
          ...cityInfo
        };
      } catch (cityError) {
        formatAppLog("warn", "at api/weather.js:185", "获取城市信息失败:", cityError);
        locationInfo.latitude = location.latitude;
        locationInfo.longitude = location.longitude;
      }
    } catch (locError) {
      formatAppLog("warn", "at api/weather.js:191", "获取位置信息失败:", locError);
    }
    const result = {
      ...weatherInfo,
      location: locationInfo
    };
    formatAppLog("log", "at api/weather.js:200", "完整天气信息:", result);
    return result;
  }
  const initialState = {
    userInfo: null,
    // 用户信息
    isLoggedIn: false,
    // 登录状态
    trainingPlans: [],
    // 训练计划列表
    trainingLogs: [],
    // 训练记录
    medals: [],
    // 用户勋章
    currentTrainingPlan: null,
    // 当前选中的训练计划
    notifications: []
    // 通知消息
  };
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
    login(userData, token, expiresIn = 7 * 24 * 60 * 60 * 1e3) {
      const expiresAt = (/* @__PURE__ */ new Date()).getTime() + expiresIn;
      uni.setStorageSync("token", token);
      uni.setStorageSync("userInfo", userData);
      uni.setStorageSync("expiresAt", expiresAt);
      this.setState({
        userInfo: userData,
        isLoggedIn: true,
        expiresAt
      });
      return this.state;
    },
    // 检查token是否有效
    isTokenValid() {
      const expiresAt = uni.getStorageSync("expiresAt");
      const now = (/* @__PURE__ */ new Date()).getTime();
      return expiresAt && now < expiresAt;
    },
    // 用户登出
    logout() {
      uni.removeStorageSync("token");
      uni.removeStorageSync("userInfo");
      uni.removeStorageSync("expiresAt");
      this.resetState();
      uni.reLaunch({
        url: "/pages/login/login"
      });
      return this.state;
    },
    // 初始化状态（从本地存储加载）
    init() {
      const token = uni.getStorageSync("token");
      const userInfo = uni.getStorageSync("userInfo");
      const expiresAt = uni.getStorageSync("expiresAt");
      if (token && userInfo && expiresAt) {
        const now = (/* @__PURE__ */ new Date()).getTime();
        if (now < expiresAt) {
          this.setState({
            userInfo,
            isLoggedIn: true,
            expiresAt
          });
        } else {
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
      this.setState({ medals });
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
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$e = {
    data() {
      return {
        userInfo: {
          userRank: "new_recruit"
          // 默认为新兵
        },
        userStats: {
          trainingDays: 0,
          medalCount: 0
        },
        // 新兵营训练数据
        rookieStats: {
          // 拆分3个100为单独训练
          pushups: 0,
          // 俯卧撑完成次数
          situps: 0,
          // 卷腹完成次数
          squats: 0,
          // 深蹲完成次数
          runningCompleted: 0,
          // 3公里完成次数
          bestRunningTime: 0,
          // 最佳3公里时间（秒）
          examCompleted: false
          // 是否完成考核
        },
        // 天气信息
        weatherInfo: {
          weather: "晴朗",
          // 天气状况
          temperature: "25°C",
          // 温度
          icon: "🌞",
          // 天气图标
          advice: "适宜训练"
          // 训练建议
        },
        // 激励语
        motivationalQuote: "每一次的坚持都是在塑造更强大的自己，坚持就是胜利！",
        loading: {
          campData: false
        }
      };
    },
    onLoad() {
      store.init();
      this.userInfo = store.getState().userInfo || {};
    },
    onShow() {
      setTimeout(() => {
        this.setRandomMotivationalQuote();
        this.loadWeatherInfo();
      }, 100);
      setTimeout(() => {
        this.loadCampData();
      }, 500);
      setTimeout(() => {
        this.loadHomeData();
      }, 1e3);
    },
    onHide() {
      this.userInfo = {};
    },
    methods: {
      // 获取训练营状态文本
      getCampStatus(rank) {
        if (this.userInfo.userRank === rank) {
          return "进行中";
        } else if (rank === "veteran" && this.userInfo.userRank === "special_force" || rank === "new_recruit" && (this.userInfo.userRank === "veteran" || this.userInfo.userRank === "special_force")) {
          return "已完成";
        } else {
          return "未解锁";
        }
      },
      // 计算新兵营训练进度
      getRookieProgress(type) {
        const maxCounts = {
          pushups: 9e3,
          // 每项训练目标9000次
          situps: 9e3,
          squats: 9e3,
          running: 30
          // 跑步仍然保持30次
        };
        if (type === "pushups" || type === "situps" || type === "squats") {
          return Math.min(
            Math.round((this.rookieStats[type] || 0) / maxCounts[type] * 100),
            100
          );
        } else if (type === "running") {
          return Math.min(
            Math.round(
              (this.rookieStats.runningCompleted || 0) / maxCounts.running * 100
            ),
            100
          );
        }
        return 0;
      },
      // 导航到训练页面
      navigateToTraining(type) {
        uni.navigateTo({
          url: `/pages/training/exercise?type=${type}&count=100`
        });
      },
      // 导航到对应训练营
      navigateToCamp(campType) {
        if (campType === "rookie") {
          uni.navigateTo({
            url: `/pages/training/camp-detail`
          });
        } else {
          uni.showToast({
            title: "军衔不足，无法进入该训练营",
            icon: "none"
          });
        }
      },
      // 加载训练营数据
      async loadCampData() {
        try {
          const campStats = await getCampStats();
          formatAppLog("log", "at pages/home/home.vue:377", "获取训练营数据成功:", campStats);
          if (campStats) {
            this.rookieStats = {
              pushups: campStats.pushups || 0,
              situps: campStats.situps || 0,
              squats: campStats.squats || 0,
              runningCompleted: campStats.runningCompleted || 0,
              bestRunningTime: campStats.bestRunningTime || 0,
              examCompleted: campStats.examCompleted || false
            };
            this.userInfo.userRank = campStats.userRank || "new_recruit";
            this.userInfo.veteranUnlocked = campStats.veteranUnlocked || false;
            this.userInfo.specialForceUnlocked = campStats.specialForceUnlocked || false;
            uni.setStorageSync("userInfo", this.userInfo);
            uni.setStorageSync("rookieStats", this.rookieStats);
          }
        } catch (error) {
          formatAppLog("error", "at pages/home/home.vue:402", "加载训练营数据失败:", error);
          const localRookieStats = uni.getStorageSync("rookieStats");
          if (localRookieStats) {
            this.rookieStats = localRookieStats;
          }
        }
      },
      // 加载最新的用户信息
      loadUserInfo() {
        const localUserInfo = uni.getStorageSync("userInfo");
        if (localUserInfo) {
          this.userInfo = localUserInfo;
          formatAppLog("log", "at pages/home/home.vue:416", "首页从本地存储加载最新用户信息:", this.userInfo);
          return;
        }
        const storeUserInfo = store.getState().userInfo;
        if (storeUserInfo) {
          this.userInfo = storeUserInfo;
          formatAppLog("log", "at pages/home/home.vue:424", "首页从store获取用户信息:", this.userInfo);
        } else {
          this.userInfo = this.userInfo || {
            nickname: "战士",
            avatar: "",
            userRank: "新兵"
          };
        }
      },
      // 加载主页数据
      async loadHomeData() {
        try {
          const [medalsResult] = await Promise.all([
            getUserMedals()
          ]);
          if (medalsResult && Array.isArray(medalsResult)) {
            this.recentMedals = medalsResult.slice(0, 3);
            store.setMedals(medalsResult);
            this.userStats.medalCount = medalsResult.length;
          }
          await this.loadWeatherInfo();
          this.setRandomMotivationalQuote();
        } catch (error) {
          formatAppLog("error", "at pages/home/home.vue:456", "加载首页数据失败", error);
          uni.showToast({
            title: "加载数据失败，请重试",
            icon: "none"
          });
        } finally {
          await this.loadCampData();
        }
      },
      // 加载天气信息
      async loadWeatherInfo() {
        try {
          uni.showLoading({
            title: "获取天气信息中..."
          });
          formatAppLog("log", "at pages/home/home.vue:475", "开始获取天气信息");
          const weatherData = await getCompleteWeatherInfo();
          formatAppLog("log", "at pages/home/home.vue:478", "获取天气信息成功:", weatherData);
          this.weatherInfo = weatherData;
          uni.setStorageSync("weatherInfo", weatherData);
        } catch (error) {
          formatAppLog("error", "at pages/home/home.vue:486", "获取天气信息失败:", error);
          const localWeatherInfo = uni.getStorageSync("weatherInfo");
          if (localWeatherInfo) {
            this.weatherInfo = localWeatherInfo;
          } else {
            this.weatherInfo = {
              city: "北京市",
              weather: "晴朗",
              temperature: "25°C",
              icon: "🌞",
              advice: "适宜训练",
              location: {
                latitude: 39.9042,
                longitude: 116.4074,
                province: "北京市",
                city: "北京市",
                district: "东城区",
                formatted_address: "北京市东城区"
              }
            };
          }
          uni.showToast({
            title: "获取天气信息失败，请检查网络",
            icon: "none",
            duration: 2e3
          });
        } finally {
          uni.hideLoading();
        }
      },
      // 设置随机激励语
      setRandomMotivationalQuote() {
        const quotes = [
          "每一次的坚持都是在塑造更强大的自己，坚持就是胜利！",
          "不经一番寒彦彻骨，怎得梦里飞花满天下？",
          "身体是革命的本钩，强健的体魂是强健的精神的基础。",
          "永不言败，永不言弃，永不言败，永不言弃！",
          "每天都是新的开始，今天的你已经比昨天的你更强大。",
          "江山如此多娉，引无数英雄竞折腰。",
          "不要等待机会，而要创造机会。",
          "身体是革命的本钩，强健的体魂是强健的精神的基础。"
        ];
        this.motivationalQuote = quotes[Math.floor(Math.random() * quotes.length)];
      },
      // 开始训练
      startTraining() {
        uni.navigateTo({
          url: "/pages/training/plan-detail"
        });
      },
      // 查看全部训练计划
      goToPlans() {
        uni.navigateTo({
          url: "/pages/training/plan-list"
        });
      },
      // 查看训练计划详情
      viewPlanDetail(planId) {
        uni.navigateTo({
          url: `/pages/training/plan-detail?id=${planId}`
        });
      },
      // 查看训练营详情
      viewCampDetail(campType) {
        uni.navigateTo({
          url: `/pages/training/camp-detail?type=${campType}`
        });
      },
      // 更新新兵营训练进度
      async updateRookieCampProgress(type, value) {
        try {
          if (type === "pushups") {
            this.rookieStats.pushups += value;
          } else if (type === "situps") {
            this.rookieStats.situps += value;
          } else if (type === "squats") {
            this.rookieStats.squats += value;
          } else if (type === "running") {
            this.rookieStats.runningCompleted += 1;
            if (value && (this.rookieStats.bestRunningTime === 0 || value < this.rookieStats.bestRunningTime)) {
              this.rookieStats.bestRunningTime = value;
            }
          } else if (type === "exam") {
            this.rookieStats.examCompleted = value;
            if (value === true) {
              this.userInfo.veteranUnlocked = true;
              this.userInfo.userRank = "veteran";
            }
          }
          uni.setStorageSync("rookieStats", this.rookieStats);
          uni.setStorageSync("userInfo", this.userInfo);
          const updateData = {
            ...this.rookieStats,
            veteranUnlocked: this.userInfo.veteranUnlocked,
            specialForceUnlocked: this.userInfo.specialForceUnlocked,
            userRank: this.userInfo.userRank
          };
          const result = await updateCampStats(updateData);
          formatAppLog("log", "at pages/home/home.vue:606", "更新训练营数据成功:", result);
          uni.showToast({
            title: "训练进度已更新",
            icon: "success"
          });
          return result;
        } catch (error) {
          formatAppLog("error", "at pages/home/home.vue:616", "更新训练营数据失败:", error);
          uni.showToast({
            title: "更新失败，请重试",
            icon: "none"
          });
          return null;
        }
      },
      // 查看全部勋章
      goToMedals() {
        uni.switchTab({
          url: "/pages/achievements/medals"
        });
      },
      // 查看勋章详情
      viewMedalDetail(medalId) {
        uni.navigateTo({
          url: `/pages/achievements/medal-detail?id=${medalId}`
        });
      },
      // 获取难度文本
      getDifficultyText(level) {
        const levels = {
          1: "新兵",
          2: "下士",
          3: "中士",
          4: "上士",
          5: "军官"
        };
        return levels[level] || "新兵";
      }
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "home-container" }, [
      vue.createCommentVNode(" 顶部个人信息卡片 "),
      vue.createCommentVNode(` <view class="user-card">
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
    </view> `),
      vue.createCommentVNode(" 今日天气和激励语 - banner样式 "),
      vue.createElementVNode("view", { class: "today-training-banner" }, [
        vue.createElementVNode("view", { class: "today-training-bg" }),
        vue.createElementVNode("view", { class: "training-header" }, [
          vue.createElementVNode("view", { class: "training-header-left" }, [
            vue.createElementVNode("text", { class: "training-title" }, "今日天气"),
            vue.createElementVNode(
              "text",
              { class: "training-date" },
              vue.toDisplayString($data.weatherInfo.location ? $data.weatherInfo.location.city : ""),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "training-badge" }, [
            vue.createElementVNode(
              "text",
              { class: "training-badge-text" },
              vue.toDisplayString($data.weatherInfo.weather || "晴朗"),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "training-content" }, [
          vue.createElementVNode("view", { class: "training-icon" }, [
            vue.createElementVNode(
              "text",
              { class: "icon-text" },
              vue.toDisplayString($data.weatherInfo.icon || "🌞"),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "training-details" }, [
            vue.createElementVNode("view", { class: "training-info" }, [
              vue.createElementVNode(
                "text",
                { class: "training-name" },
                vue.toDisplayString($data.weatherInfo.temperature || "25°C"),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "training-desc" },
                vue.toDisplayString($data.weatherInfo.location ? $data.weatherInfo.location.formatted_address : "正在获取位置信息..."),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "training-status-tag" }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($data.weatherInfo.advice || "适宜训练"),
                1
                /* TEXT */
              )
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "motivational-quote" }, [
          vue.createElementVNode("view", { class: "quote-container" }, [
            vue.createElementVNode(
              "text",
              { class: "quote-text" },
              vue.toDisplayString($data.motivationalQuote),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "training-action" }, [
          vue.createElementVNode("button", {
            class: "action-button",
            onClick: _cache[0] || (_cache[0] = ($event) => $options.navigateToCamp("rookie"))
          }, [
            vue.createElementVNode("text", { class: "button-text" }, "进入新兵营训练"),
            vue.createElementVNode("text", { class: "button-icon" }, "→")
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "training-divider" }, [
        vue.createCommentVNode(" 训练营区域 "),
        vue.createElementVNode("view", { class: "training-camps" }, [
          vue.createElementVNode("view", { class: "section-header" }, [
            vue.createElementVNode("text", { class: "section-title" }, "体能训练营"),
            vue.createElementVNode("text", { class: "section-subtitle" }, "按军衔等级解锁更高级训练")
          ]),
          vue.createCommentVNode(" 训练营列表 "),
          vue.createElementVNode("view", { class: "camps-container" }, [
            vue.createCommentVNode(" 新兵营区块 - 默认可用 "),
            vue.createElementVNode("view", {
              class: "camp-block active",
              onClick: _cache[1] || (_cache[1] = ($event) => $options.navigateToCamp("rookie"))
            }, [
              vue.createElementVNode("view", { class: "camp-content" }, [
                vue.createElementVNode("view", { class: "camp-header" }, [
                  vue.createElementVNode("text", { class: "camp-title" }, "新兵营"),
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["camp-badge", {
                        "camp-active": $data.userInfo.userRank === "new_recruit"
                      }])
                    },
                    vue.toDisplayString($options.getCampStatus("new_recruit")),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                vue.createElementVNode("view", { class: "camp-progress" }, [
                  vue.createCommentVNode(" 训练项目：俯卧撑 "),
                  vue.createElementVNode("view", { class: "progress-item" }, [
                    vue.createElementVNode("view", { class: "progress-label" }, [
                      vue.createElementVNode("text", null, "俯卧撑 💪："),
                      vue.createElementVNode(
                        "text",
                        { class: "progress-count" },
                        vue.toDisplayString($data.rookieStats.pushups || 0) + "/9000",
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "progress-bar" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: "progress-fill",
                          style: vue.normalizeStyle({ width: $options.getRookieProgress("pushups") + "%" })
                        },
                        null,
                        4
                        /* STYLE */
                      )
                    ])
                  ]),
                  vue.createCommentVNode(" 训练项目：卷腹 "),
                  vue.createElementVNode("view", { class: "progress-item" }, [
                    vue.createElementVNode("view", { class: "progress-label" }, [
                      vue.createElementVNode("text", null, "卷腹 🙇‍♂️："),
                      vue.createElementVNode(
                        "text",
                        { class: "progress-count" },
                        vue.toDisplayString($data.rookieStats.situps || 0) + "/9000",
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "progress-bar" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: "progress-fill",
                          style: vue.normalizeStyle({ width: $options.getRookieProgress("situps") + "%" })
                        },
                        null,
                        4
                        /* STYLE */
                      )
                    ])
                  ]),
                  vue.createCommentVNode(" 训练项目：深蹲 "),
                  vue.createElementVNode("view", { class: "progress-item" }, [
                    vue.createElementVNode("view", { class: "progress-label" }, [
                      vue.createElementVNode("text", null, "深蹲 🏋️："),
                      vue.createElementVNode(
                        "text",
                        { class: "progress-count" },
                        vue.toDisplayString($data.rookieStats.squats || 0) + "/9000",
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "progress-bar" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: "progress-fill",
                          style: vue.normalizeStyle({ width: $options.getRookieProgress("squats") + "%" })
                        },
                        null,
                        4
                        /* STYLE */
                      )
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "progress-item" }, [
                    vue.createElementVNode("view", { class: "progress-label" }, [
                      vue.createElementVNode("text", null, "3公里 🏃‍♂️："),
                      vue.createElementVNode(
                        "text",
                        { class: "progress-count" },
                        vue.toDisplayString($data.rookieStats.runningCompleted || 0) + "/30",
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "progress-bar" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: "progress-fill",
                          style: vue.normalizeStyle({ width: $options.getRookieProgress("running") + "%" })
                        },
                        null,
                        4
                        /* STYLE */
                      )
                    ])
                  ])
                ])
              ])
            ]),
            vue.createCommentVNode(" 老兵营区块 - 需完成新兵营 "),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["camp-block", { disabled: $data.userInfo.userRank === "new_recruit" }]),
                onClick: _cache[2] || (_cache[2] = ($event) => $options.navigateToCamp("veteran"))
              },
              [
                vue.createElementVNode("view", { class: "camp-content" }, [
                  vue.createElementVNode("view", { class: "camp-header" }, [
                    vue.createElementVNode("text", { class: "camp-title" }, "老兵营"),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["camp-badge", { "camp-active": $data.userInfo.userRank === "veteran" }])
                      },
                      vue.toDisplayString($options.getCampStatus("veteran")),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  $data.userInfo.userRank === "new_recruit" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "camp-lock"
                  }, [
                    vue.createElementVNode("text", null, "完成新兵营训练后解锁")
                  ])) : vue.createCommentVNode("v-if", true)
                ])
              ],
              2
              /* CLASS */
            ),
            vue.createCommentVNode(" 特种兵营区块 - 需完成老兵营 "),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["camp-block", { disabled: $data.userInfo.userRank !== "special_force" }]),
                onClick: _cache[3] || (_cache[3] = ($event) => $options.navigateToCamp("special"))
              },
              [
                vue.createElementVNode("view", { class: "camp-content" }, [
                  vue.createElementVNode("view", { class: "camp-header" }, [
                    vue.createElementVNode("text", { class: "camp-title" }, "特种兵营"),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["camp-badge", {
                          "camp-active": $data.userInfo.userRank === "special_force"
                        }])
                      },
                      vue.toDisplayString($options.getCampStatus("special_force")),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  $data.userInfo.userRank !== "special_force" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "camp-lock"
                  }, [
                    vue.createElementVNode("text", null, "完成老兵营训练后解锁")
                  ])) : vue.createCommentVNode("v-if", true)
                ])
              ],
              2
              /* CLASS */
            )
          ])
        ]),
        vue.createCommentVNode(" 激励语 "),
        vue.createCommentVNode(' <view class="motivational-quote">\n        <view class="quote-container">\n          <text class="quote-text">{{ motivationalQuote }}</text>\n          <view class="quote-decoration left"></view>\n          <view class="quote-decoration right"></view>\n        </view>\n        <text class="quote-author">— 铁炼计划</text>\n      </view> ')
      ])
    ]);
  }
  const PagesHomeHome = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__file", "D:/zhouenjun/men-grow/men_app/pages/home/home.vue"]]);
  const _sfc_main$d = {
    data() {
      return {
        planId: "",
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
        return this.exercises.length > 0 ? this.currentExerciseIndex / this.exercises.length * 100 : 0;
      }
    },
    onLoad(options) {
      if (options.planId) {
        this.planId = options.planId;
        this.loadExerciseData();
      } else {
        const currentPlan = store.getState().currentTrainingPlan;
        if (currentPlan) {
          this.plan = currentPlan;
          this.exercises = currentPlan.exercises || [];
          this.setupCurrentExercise();
        } else {
          uni.showToast({
            title: "未找到训练计划",
            icon: "none"
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }
      }
    },
    onUnload() {
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
          uni.showToast({
            title: "训练数据加载失败",
            icon: "none"
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }
      },
      // 设置当前训练动作
      setupCurrentExercise() {
        if (this.exercises.length === 0)
          return;
        this.currentExercise = this.exercises[this.currentExerciseIndex];
        this.currentSet = 1;
        this.timerValue = this.currentExercise.type === "time" ? this.currentExercise.duration : 0;
        this.clearAllTimers();
        this.exerciseStarted = false;
      },
      // 开始训练
      startExercise() {
        if (this.exercises.length === 0)
          return;
        this.exerciseStarted = true;
        this.isPaused = false;
        if (!this.elapsedTimeInterval) {
          this.elapsedTimeInterval = setInterval(() => {
            this.elapsedTime++;
          }, 1e3);
        }
        if (this.currentExercise.type === "time" && !this.timerInterval) {
          this.timerInterval = setInterval(() => {
            if (this.timerValue > 0) {
              this.timerValue--;
            } else {
              this.completeCurrentExercise();
            }
          }, 1e3);
        }
      },
      // 暂停训练
      pauseExercise() {
        this.isPaused = true;
        this.clearAllTimers();
        uni.showModal({
          title: "训练暂停",
          content: "确定要暂停训练吗？",
          confirmText: "继续训练",
          cancelText: "退出训练",
          success: (res) => {
            if (res.confirm) {
              this.startExercise();
            } else if (res.cancel) {
              uni.navigateBack();
            }
          }
        });
      },
      // 完成当前训练
      completeCurrentExercise() {
        this.clearTimer();
        if (!this.completedSets.some((item) => item.exerciseId === this.currentExercise._id && item.set === this.currentSet)) {
          this.completedSets.push({
            exerciseId: this.currentExercise._id,
            set: this.currentSet,
            time: /* @__PURE__ */ new Date()
          });
        }
        if (this.currentSet < this.currentExercise.sets) {
          this.currentSet++;
          if (this.currentExercise.type === "time") {
            this.timerValue = this.currentExercise.duration;
            this.startExercise();
          } else {
            this.exerciseStarted = false;
          }
        } else {
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
          this.clearAllTimers();
          this.showCompletionModal = true;
        }
      },
      // 跳过当前训练动作
      skipExercise() {
        uni.showModal({
          title: "跳过训练",
          content: "确定要跳过这个训练动作吗？",
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
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      },
      // 格式化定时器时间
      formatTimer(seconds) {
        return seconds.toString().padStart(2, "0");
      },
      // 分享训练结果
      shareResults() {
        uni.showToast({
          title: "分享功能开发中",
          icon: "none"
        });
      },
      // 完成训练
      finishTraining() {
        const trainingLog = {
          planId: this.plan._id,
          duration: this.elapsedTime,
          completedExercises: this.completedExercises,
          totalExercises: this.exercises.length,
          completedSets: this.completedSets,
          date: /* @__PURE__ */ new Date()
        };
        createTrainingLog(trainingLog).then(() => {
          uni.showToast({
            title: "训练记录已保存",
            icon: "success"
          });
          setTimeout(() => {
            uni.redirectTo({
              url: "/pages/training/plan-list"
            });
          }, 1500);
        }).catch((error) => {
          formatAppLog("error", "at pages/training/exercise.vue:434", "保存训练记录失败:", error);
          uni.showToast({
            title: "保存失败，请重试",
            icon: "none"
          });
        });
      }
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "exercise-container" }, [
      vue.createCommentVNode(" 顶部进度条 "),
      vue.createElementVNode("view", { class: "progress-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: "progress-inner",
            style: vue.normalizeStyle({ width: $options.progressPercentage + "%" })
          },
          null,
          4
          /* STYLE */
        )
      ]),
      vue.createCommentVNode(" 训练信息 "),
      vue.createElementVNode("view", { class: "exercise-header" }, [
        vue.createElementVNode("view", { class: "plan-info" }, [
          vue.createElementVNode(
            "text",
            { class: "plan-name" },
            vue.toDisplayString($data.plan.name),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "exercise-count" },
            vue.toDisplayString($data.currentExerciseIndex + 1) + "/" + vue.toDisplayString($data.exercises.length),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "exercise-progress" }, [
          vue.createElementVNode(
            "text",
            null,
            vue.toDisplayString($options.formatTime($data.elapsedTime)),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 当前训练内容 "),
      vue.createElementVNode("view", { class: "current-exercise" }, [
        vue.createElementVNode("view", { class: "exercise-image-container" }, [
          vue.createElementVNode("image", {
            class: "exercise-image",
            src: $data.currentExercise.imageUrl || "/static/images/default-exercise.jpg",
            mode: "aspectFit"
          }, null, 8, ["src"])
        ]),
        vue.createElementVNode("view", { class: "exercise-details" }, [
          vue.createElementVNode(
            "text",
            { class: "exercise-name" },
            vue.toDisplayString($data.currentExercise.name),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "exercise-meta" }, [
            vue.createElementVNode(
              "text",
              { class: "meta-item" },
              vue.toDisplayString($data.currentExercise.sets) + "组",
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "meta-separator" }, "·"),
            $data.currentExercise.type === "time" ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "meta-item"
              },
              vue.toDisplayString($data.currentExercise.duration) + "秒",
              1
              /* TEXT */
            )) : (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 1,
                class: "meta-item"
              },
              vue.toDisplayString($data.currentExercise.reps) + "次",
              1
              /* TEXT */
            ))
          ])
        ])
      ]),
      vue.createCommentVNode(" 计时器/倒计时 "),
      $data.exerciseStarted ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "timer-container"
      }, [
        $data.currentExercise.type === "time" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "timer"
        }, [
          vue.createElementVNode(
            "text",
            { class: "timer-text" },
            vue.toDisplayString($options.formatTimer($data.timerValue)),
            1
            /* TEXT */
          )
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "counter"
        }, [
          vue.createElementVNode(
            "text",
            { class: "set-label" },
            "第 " + vue.toDisplayString($data.currentSet) + " 组",
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "counter-text" },
            vue.toDisplayString($data.currentExercise.reps) + "次",
            1
            /* TEXT */
          )
        ]))
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 训练描述 "),
      $data.currentExercise.description ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "exercise-description"
      }, [
        vue.createElementVNode("text", { class: "description-title" }, "动作说明"),
        vue.createElementVNode(
          "text",
          { class: "description-content" },
          vue.toDisplayString($data.currentExercise.description),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 训练提示 "),
      $data.currentExercise.tips ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "exercise-tips"
      }, [
        vue.createElementVNode("text", { class: "tips-title" }, "训练提示"),
        vue.createElementVNode(
          "text",
          { class: "tips-content" },
          vue.toDisplayString($data.currentExercise.tips),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 控制按钮 "),
      vue.createElementVNode("view", { class: "controls" }, [
        vue.createElementVNode("view", { class: "control-row" }, [
          vue.createElementVNode(
            "button",
            {
              class: vue.normalizeClass(["control-button", { primary: !$data.exerciseStarted }]),
              onClick: _cache[0] || (_cache[0] = ($event) => $data.exerciseStarted ? $options.pauseExercise() : $options.startExercise())
            },
            [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($data.exerciseStarted ? "暂停" : "开始"),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode("button", {
            class: "control-button",
            disabled: !$data.exerciseStarted,
            onClick: _cache[1] || (_cache[1] = ($event) => $options.completeCurrentExercise())
          }, [
            vue.createElementVNode(
              "text",
              null,
              vue.toDisplayString($data.currentExercise.type === "time" ? "提前完成" : "完成组数"),
              1
              /* TEXT */
            )
          ], 8, ["disabled"])
        ]),
        $data.exerciseStarted && $data.currentExercise.type !== "time" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "control-row"
        }, [
          vue.createElementVNode("button", {
            class: "control-button small",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.previousSet && $options.previousSet(...args)),
            disabled: $data.currentSet <= 1
          }, [
            vue.createElementVNode("text", null, "上一组")
          ], 8, ["disabled"]),
          vue.createElementVNode("button", {
            class: "control-button small",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.nextSet && $options.nextSet(...args)),
            disabled: $data.currentSet >= $data.currentExercise.sets
          }, [
            vue.createElementVNode("text", null, "下一组")
          ], 8, ["disabled"])
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createCommentVNode(" 底部导航 "),
      vue.createElementVNode("view", { class: "navigation-bar" }, [
        vue.createElementVNode("button", {
          class: "nav-button",
          onClick: _cache[4] || (_cache[4] = (...args) => $options.previousExercise && $options.previousExercise(...args)),
          disabled: $data.currentExerciseIndex <= 0
        }, [
          vue.createElementVNode("text", { class: "nav-button-text" }, "上一个")
        ], 8, ["disabled"]),
        vue.createElementVNode("button", {
          class: "nav-button primary",
          onClick: _cache[5] || (_cache[5] = (...args) => $options.skipExercise && $options.skipExercise(...args))
        }, [
          vue.createElementVNode("text", { class: "nav-button-text" }, "跳过")
        ]),
        vue.createElementVNode("button", {
          class: "nav-button",
          onClick: _cache[6] || (_cache[6] = (...args) => $options.nextExercise && $options.nextExercise(...args)),
          disabled: $data.currentExerciseIndex >= $data.exercises.length - 1
        }, [
          vue.createElementVNode("text", { class: "nav-button-text" }, "下一个")
        ], 8, ["disabled"])
      ]),
      vue.createCommentVNode(" 训练完成弹窗 "),
      $data.showCompletionModal ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "completion-modal"
      }, [
        vue.createElementVNode("view", { class: "modal-content" }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode("text", { class: "modal-title" }, "训练完成!")
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            vue.createElementVNode("view", { class: "stats-item" }, [
              vue.createElementVNode("text", { class: "stats-label" }, "训练时长:"),
              vue.createElementVNode(
                "text",
                { class: "stats-value" },
                vue.toDisplayString($options.formatTime($data.elapsedTime)),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "stats-item" }, [
              vue.createElementVNode("text", { class: "stats-label" }, "完成动作:"),
              vue.createElementVNode(
                "text",
                { class: "stats-value" },
                vue.toDisplayString($data.completedExercises) + "/" + vue.toDisplayString($data.exercises.length),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "stats-item" }, [
              vue.createElementVNode("text", { class: "stats-label" }, "消耗热量:"),
              vue.createElementVNode(
                "text",
                { class: "stats-value" },
                vue.toDisplayString(Math.round($data.elapsedTime / 60 * 6)) + "大卡",
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode("button", {
              class: "modal-button",
              onClick: _cache[7] || (_cache[7] = (...args) => $options.shareResults && $options.shareResults(...args))
            }, "分享成果"),
            vue.createElementVNode("button", {
              class: "modal-button primary",
              onClick: _cache[8] || (_cache[8] = (...args) => $options.finishTraining && $options.finishTraining(...args))
            }, "完成训练")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesTrainingExercise = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__file", "D:/zhouenjun/men-grow/men_app/pages/training/exercise.vue"]]);
  const _sfc_main$c = {
    data() {
      return {
        campType: "",
        // rookie, veteran, special
        campTypeText: "新兵训练",
        campDescription: "完成新兵营基础训练和体能训练，通过结业考核后晋升军衔",
        overallProgress: 0,
        trainingData: {
          pushups: 2500,
          // 俯卧撑完成个数
          situps: 1800,
          // 卷腹完成个数
          squats: 3200,
          // 深蹲完成个数
          runningCompleted: 12,
          // 3公里跑完成次数
          bestRunningTime: 15 * 60 + 30
          // 最佳时间 15分30秒
        },
        examStats: {
          completed: false,
          examTime: 0
        }
      };
    },
    computed: {
      // 判断是否可以参加结业考核
      canTakeFinalExam() {
        if (!this.trainingData)
          return false;
        const completed = this.trainingData.pushups >= 9e3 && this.trainingData.situps >= 9e3 && this.trainingData.squats >= 9e3 && this.trainingData.runningCompleted >= 30;
        return completed;
      }
    },
    onLoad(options) {
      this.campType = options.type || "rookie";
      if (this.campType === "rookie") {
        this.campTypeText = "新兵训练";
        this.campDescription = "完成新兵营基础训练和体能训练，通过结业考核后晋升军衔";
      } else if (this.campType === "veteran") {
        this.campTypeText = "老兵训练";
        this.campDescription = "系统化的进阶训练，适合已完成新兵训练的人";
      } else if (this.campType === "special") {
        this.campTypeText = "特种兵训练";
        this.campDescription = "高强度、高难度的极限训练，挑战你的身体极限";
      }
      this.loadCampData();
      this.calculateOverallProgress();
    },
    // 设置页面标题
    onReady() {
      uni.setNavigationBarTitle({
        title: this.campTypeText
      });
    },
    methods: {
      // 加载训练营数据
      loadCampData() {
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
            formatAppLog("error", "at pages/training/camp-detail.vue:389", "解析本地存储数据失败:", e);
            this.trainingData = {
              pushups: 0,
              situps: 0,
              squats: 0,
              runningCompleted: 0,
              bestRunningTime: 0
            };
          }
        }
      },
      // 计算总体进度
      calculateOverallProgress() {
        try {
          if (this.campType === "rookie") {
            if (!this.trainingData) {
              this.trainingData = {
                pushups: 0,
                situps: 0,
                squats: 0,
                runningCompleted: 0,
                bestRunningTime: 0
              };
            }
            if (!this.examStats) {
              this.examStats = {
                completed: false,
                examTime: 0
              };
            }
            const pushupProgress = Math.min(
              (this.trainingData.pushups || 0) / 9e3,
              1
            );
            const situpProgress = Math.min(
              (this.trainingData.situps || 0) / 9e3,
              1
            );
            const squatProgress = Math.min(
              (this.trainingData.squats || 0) / 9e3,
              1
            );
            const runningProgress = Math.min(
              (this.trainingData.runningCompleted || 0) / 30,
              1
            );
            const examProgress = this.examStats && this.examStats.completed ? 1 : 0;
            const basicAvgProgress = (pushupProgress + situpProgress + squatProgress) / 3;
            this.overallProgress = Math.floor(
              (basicAvgProgress * 0.6 + runningProgress * 0.3 + examProgress * 0.1) * 100
            );
          }
        } catch (e) {
          formatAppLog("error", "at pages/training/camp-detail.vue:459", "计算进度出错:", e);
          this.overallProgress = 0;
        }
      },
      // 获取训练项目状态
      getExerciseStatus(type) {
        if (type === "pushups") {
          return this.trainingData.pushups >= 9e3 ? "已完成" : "训练中";
        } else if (type === "situps") {
          return this.trainingData.situps >= 9e3 ? "已完成" : "训练中";
        } else if (type === "squats") {
          return this.trainingData.squats >= 9e3 ? "已完成" : "训练中";
        }
        return "训练中";
      },
      // 获取跑步训练状态
      getRunningStatus() {
        return this.trainingData.runningCompleted >= 30 ? "已完成" : "训练中";
      },
      // 获取跑步目标时间
      getRunningTargetTime() {
        const progress = this.trainingData.runningCompleted || 0;
        if (progress < 10) {
          return 18 * 60;
        } else if (progress < 20) {
          return 16 * 60;
        } else {
          return 15 * 60;
        }
      },
      // 格式化跑步时间显示
      formatRunningTime(seconds) {
        if (!seconds)
          return "00:00";
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      },
      // 获取考核等级
      getExamGrade() {
        if (!this.examStats.completed)
          return "-";
        const examTime = this.examStats.examTime;
        if (examTime <= 15 * 60) {
          return "优秀";
        } else if (examTime <= 18 * 60) {
          return "合格";
        } else {
          return "不合格";
        }
      },
      // 不再需要这个方法，转为computed属性
      // 开始基础训练项目
      startExercise(type) {
        uni.navigateTo({
          url: `./exercise?type=${type}`
        });
      },
      // 开始跑步训练
      startRunning() {
        uni.navigateTo({
          url: "/pages/training/running?type=3km"
        });
      },
      // 开始结业考核
      startFinalExam() {
        if (this.examStats.completed) {
          uni.showModal({
            title: "考核成绩",
            content: `考核时间: ${this.formatRunningTime(
              this.examStats.examTime
            )}
等级: ${this.getExamGrade()}`,
            showCancel: false
          });
          return;
        }
        if (!this.canTakeFinalExam) {
          uni.showToast({
            title: "需要完成所有训练项目后才能参加考核",
            icon: "none",
            duration: 2e3
          });
          return;
        }
        uni.showModal({
          title: "开始结业考核",
          content: "考核内容为3公里跑，完成时间<=15分钟评定为优秀，<=18分钟为合格",
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: "/pages/training/running?type=exam"
              });
            }
          }
        });
      },
      // 后退操作
      goBack() {
        uni.navigateBack();
      }
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "camp-detail-container" }, [
      vue.createCommentVNode(" 顶部信息 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "background-decoration" }),
        vue.createElementVNode("view", { class: "camp-info" }, [
          vue.createElementVNode(
            "view",
            { class: "camp-badge" },
            vue.toDisplayString($data.campTypeText),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "camp-name" }, "体能训练营"),
          vue.createElementVNode(
            "text",
            { class: "camp-description" },
            vue.toDisplayString($data.campDescription),
            1
            /* TEXT */
          ),
          vue.createCommentVNode(" 总体进度 "),
          vue.createElementVNode("view", { class: "progress-overview" }, [
            vue.createElementVNode("view", { class: "progress-stats" }, [
              vue.createElementVNode("view", { class: "progress-label" }, "总体训练进度"),
              vue.createElementVNode(
                "view",
                { class: "progress-percentage" },
                vue.toDisplayString($data.overallProgress) + "%",
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "progress-bar" }, [
              vue.createElementVNode(
                "view",
                {
                  class: "progress-fill",
                  style: vue.normalizeStyle({ width: $data.overallProgress + "%" })
                },
                null,
                4
                /* STYLE */
              )
            ])
          ])
        ])
      ]),
      vue.createCommentVNode(" 新兵营训练内容 "),
      $data.campType === "rookie" ? (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 0 },
        [
          vue.createCommentVNode(" 基础训练模块 - 3个100 "),
          vue.createElementVNode("view", { class: "training-module" }, [
            vue.createElementVNode("view", { class: "module-header" }, [
              vue.createElementVNode("view", { class: "module-title-container" }, [
                vue.createElementVNode("view", { class: "module-icon" }, "🎯"),
                vue.createElementVNode("text", { class: "module-title" }, "基础训练")
              ]),
              vue.createElementVNode("view", { class: "module-tag" }, "新兵必修")
            ]),
            vue.createElementVNode("view", { class: "module-description" }, "完成俯卧撑、卷腹、深蹲各9000个训练，打造军人基本体能素质"),
            vue.createElementVNode("view", { class: "training-list" }, [
              vue.createCommentVNode(" 俯卧撑训练项 "),
              vue.createElementVNode("view", {
                class: "exercise-card",
                onClick: _cache[0] || (_cache[0] = ($event) => $options.startExercise("pushups"))
              }, [
                vue.createElementVNode("view", { class: "exercise-icon-container pushups" }, [
                  vue.createElementVNode("text", { class: "exercise-icon" }, "💪")
                ]),
                vue.createElementVNode("view", { class: "exercise-content" }, [
                  vue.createElementVNode("view", { class: "exercise-header" }, [
                    vue.createElementVNode("text", { class: "exercise-name" }, "俯卧撑训练"),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass([
                          "exercise-status",
                          $data.trainingData.pushups >= 9e3 ? "completed" : "in-progress"
                        ])
                      },
                      vue.toDisplayString($options.getExerciseStatus("pushups")),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "exercise-progress-container" }, [
                    vue.createElementVNode(
                      "view",
                      { class: "exercise-count" },
                      vue.toDisplayString($data.trainingData.pushups || 0) + "/9000 次",
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "exercise-progress-bar" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: "exercise-progress-fill",
                          style: vue.normalizeStyle({
                            width: Math.min(
                              ($data.trainingData.pushups || 0) / 9e3 * 100,
                              100
                            ) + "%"
                          })
                        },
                        null,
                        4
                        /* STYLE */
                      )
                    ])
                  ])
                ])
              ]),
              vue.createCommentVNode(" 卷腹训练项 "),
              vue.createElementVNode("view", {
                class: "exercise-card",
                onClick: _cache[1] || (_cache[1] = ($event) => $options.startExercise("situps"))
              }, [
                vue.createElementVNode("view", { class: "exercise-icon-container situps" }, [
                  vue.createElementVNode("text", { class: "exercise-icon" }, "🙇‍♂️")
                ]),
                vue.createElementVNode("view", { class: "exercise-content" }, [
                  vue.createElementVNode("view", { class: "exercise-header" }, [
                    vue.createElementVNode("text", { class: "exercise-name" }, "卷腹训练"),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass([
                          "exercise-status",
                          $data.trainingData.situps >= 9e3 ? "completed" : "in-progress"
                        ])
                      },
                      vue.toDisplayString($options.getExerciseStatus("situps")),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "exercise-progress-container" }, [
                    vue.createElementVNode(
                      "view",
                      { class: "exercise-count" },
                      vue.toDisplayString($data.trainingData.situps || 0) + "/9000 次",
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "exercise-progress-bar" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: "exercise-progress-fill",
                          style: vue.normalizeStyle({
                            width: Math.min(
                              ($data.trainingData.situps || 0) / 9e3 * 100,
                              100
                            ) + "%"
                          })
                        },
                        null,
                        4
                        /* STYLE */
                      )
                    ])
                  ])
                ])
              ]),
              vue.createCommentVNode(" 深蹲训练项 "),
              vue.createElementVNode("view", {
                class: "exercise-card",
                onClick: _cache[2] || (_cache[2] = ($event) => $options.startExercise("squats"))
              }, [
                vue.createElementVNode("view", { class: "exercise-icon-container squats" }, [
                  vue.createElementVNode("text", { class: "exercise-icon" }, "🏋️")
                ]),
                vue.createElementVNode("view", { class: "exercise-content" }, [
                  vue.createElementVNode("view", { class: "exercise-header" }, [
                    vue.createElementVNode("text", { class: "exercise-name" }, "深蹲训练"),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass([
                          "exercise-status",
                          $data.trainingData.squats >= 9e3 ? "completed" : "in-progress"
                        ])
                      },
                      vue.toDisplayString($options.getExerciseStatus("squats")),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "exercise-progress-container" }, [
                    vue.createElementVNode(
                      "view",
                      { class: "exercise-count" },
                      vue.toDisplayString($data.trainingData.squats || 0) + "/9000 次",
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "exercise-progress-bar" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: "exercise-progress-fill",
                          style: vue.normalizeStyle({
                            width: Math.min(
                              ($data.trainingData.squats || 0) / 9e3 * 100,
                              100
                            ) + "%"
                          })
                        },
                        null,
                        4
                        /* STYLE */
                      )
                    ])
                  ])
                ])
              ])
            ])
          ]),
          vue.createCommentVNode(" 3公里跑训练模块 "),
          vue.createElementVNode("view", { class: "training-module" }, [
            vue.createElementVNode("view", { class: "module-header" }, [
              vue.createElementVNode("view", { class: "module-title-container" }, [
                vue.createElementVNode("view", { class: "module-icon" }, "🏃‍♂️"),
                vue.createElementVNode("text", { class: "module-title" }, "体能训练")
              ]),
              vue.createElementVNode("view", { class: "module-tag advanced" }, "战术体能")
            ]),
            vue.createElementVNode("view", { class: "module-description" }, "完成30次3公里跑训练，提升心肺能力和全身耐力"),
            vue.createElementVNode("view", { class: "run-card" }, [
              vue.createElementVNode("view", { class: "run-header" }, [
                vue.createElementVNode("text", { class: "run-title" }, "3公里耐力跑"),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass([
                      "run-status",
                      $data.trainingData.runningCompleted >= 30 ? "completed" : "in-progress"
                    ])
                  },
                  vue.toDisplayString($options.getRunningStatus()),
                  3
                  /* TEXT, CLASS */
                )
              ]),
              vue.createElementVNode("view", { class: "run-progress-container" }, [
                vue.createElementVNode(
                  "view",
                  { class: "run-count" },
                  vue.toDisplayString($data.trainingData.runningCompleted || 0) + "/30 次",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "run-progress-bar" }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: "run-progress-fill",
                      style: vue.normalizeStyle({
                        width: Math.min(
                          ($data.trainingData.runningCompleted || 0) / 30 * 100,
                          100
                        ) + "%"
                      })
                    },
                    null,
                    4
                    /* STYLE */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "run-stats-container" }, [
                vue.createElementVNode("view", { class: "run-stats" }, [
                  vue.createElementVNode("view", { class: "run-stat-item" }, [
                    vue.createElementVNode("view", { class: "run-stat-icon" }, "⏱️"),
                    vue.createElementVNode("view", { class: "run-stat-content" }, [
                      vue.createElementVNode("text", { class: "run-stat-label" }, "最佳时间"),
                      vue.createElementVNode(
                        "text",
                        { class: "run-stat-value" },
                        vue.toDisplayString($options.formatRunningTime($data.trainingData.bestRunningTime || 0)),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "run-stat-divider" }),
                  vue.createElementVNode("view", { class: "run-stat-item" }, [
                    vue.createElementVNode("view", { class: "run-stat-icon" }, "🎯"),
                    vue.createElementVNode("view", { class: "run-stat-content" }, [
                      vue.createElementVNode("text", { class: "run-stat-label" }, "目标时间"),
                      vue.createElementVNode(
                        "text",
                        { class: "run-stat-value" },
                        vue.toDisplayString($options.formatRunningTime($options.getRunningTargetTime())),
                        1
                        /* TEXT */
                      )
                    ])
                  ])
                ])
              ]),
              vue.createElementVNode("button", {
                class: "action-button",
                onClick: _cache[3] || (_cache[3] = (...args) => $options.startRunning && $options.startRunning(...args))
              }, [
                vue.createElementVNode("view", { class: "button-icon" }, "▶️"),
                vue.createElementVNode("text", null, "开始跑步训练")
              ])
            ])
          ]),
          vue.createCommentVNode(" 新兵结业考核模块 "),
          vue.createElementVNode("view", { class: "training-module" }, [
            vue.createElementVNode("view", { class: "module-header" }, [
              vue.createElementVNode("view", { class: "module-title-container" }, [
                vue.createElementVNode("view", { class: "module-icon" }, "🏅"),
                vue.createElementVNode("text", { class: "module-title" }, "结业考核")
              ]),
              vue.createElementVNode("view", { class: "module-tag special" }, "晋升必要")
            ]),
            vue.createElementVNode("view", { class: "module-description" }, "完成所有训练项目后参加结业考核，通过考核晋升军衔"),
            vue.createElementVNode("view", { class: "exam-card" }, [
              vue.createElementVNode("view", { class: "exam-info" }, [
                $data.examStats.completed ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "exam-content"
                }, [
                  vue.createElementVNode("view", { class: "exam-result-item" }, [
                    vue.createElementVNode("view", { class: "exam-result-label" }, "考核时间"),
                    vue.createElementVNode(
                      "view",
                      { class: "exam-result-value" },
                      vue.toDisplayString($options.formatRunningTime($data.examStats.examTime)),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "exam-result-item" }, [
                    vue.createElementVNode("view", { class: "exam-result-label" }, "考核评级"),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["exam-result-value", {
                          "exam-excellent": $options.getExamGrade() === "优秀",
                          "exam-pass": $options.getExamGrade() === "合格",
                          "exam-fail": $options.getExamGrade() === "不合格"
                        }])
                      },
                      vue.toDisplayString($options.getExamGrade()),
                      3
                      /* TEXT, CLASS */
                    )
                  ])
                ])) : (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "exam-status"
                }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["exam-status-icon", { available: $options.canTakeFinalExam }])
                    },
                    vue.toDisplayString($options.canTakeFinalExam ? "✓" : "✗"),
                    3
                    /* TEXT, CLASS */
                  ),
                  vue.createElementVNode(
                    "view",
                    { class: "exam-status-text" },
                    vue.toDisplayString($options.canTakeFinalExam ? "已满足考核条件" : "需完成所有训练"),
                    1
                    /* TEXT */
                  )
                ]))
              ]),
              vue.createElementVNode(
                "button",
                {
                  class: vue.normalizeClass(["action-button", { disabled: !$options.canTakeFinalExam && !$data.examStats.completed }]),
                  onClick: _cache[4] || (_cache[4] = (...args) => $options.startFinalExam && $options.startFinalExam(...args))
                },
                [
                  vue.createElementVNode(
                    "view",
                    { class: "button-icon" },
                    vue.toDisplayString($data.examStats.completed ? "🏆" : "🎯"),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString($data.examStats.completed ? "查看考核成绩" : "参加结业考核"),
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              )
            ])
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesTrainingCampDetail = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__file", "D:/zhouenjun/men-grow/men_app/pages/training/camp-detail.vue"]]);
  const _sfc_main$b = {
    data() {
      return {
        runningType: "3km",
        // 'exam' 或 '3km'
        runningState: "ready",
        // 'ready', 'running', 'paused', 'finished'
        distance: 0,
        // 单位米
        elapsedTime: 0,
        // 单位秒
        timer: null,
        startTime: 0,
        pausedTime: 0,
        isDarkMode: false,
        // 以下是模拟GPS相关参数
        speedFactor: 1
        // 模拟速度因子
      };
    },
    computed: {
      // 格式化距离显示
      formatDistance() {
        if (this.distance < 1e3) {
          return `${this.distance.toFixed(0)}m`;
        } else {
          return `${(this.distance / 1e3).toFixed(2)}km`;
        }
      },
      // 格式化时间显示
      formatTime() {
        const hours = Math.floor(this.elapsedTime / 3600);
        const minutes = Math.floor(this.elapsedTime % 3600 / 60);
        const seconds = Math.floor(this.elapsedTime % 60);
        if (hours > 0) {
          return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        } else {
          return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }
      },
      // 格式化配速显示
      formatPace() {
        if (this.distance < 100) {
          return "--:--";
        }
        const paceSeconds = this.elapsedTime / (this.distance / 1e3);
        const paceMinutes = Math.floor(paceSeconds / 60);
        const paceRemainSeconds = Math.floor(paceSeconds % 60);
        return `${paceMinutes}:${paceRemainSeconds.toString().padStart(2, "0")}`;
      },
      // 计算进度百分比
      progressPercentage() {
        return Math.min(Math.floor(this.distance / 3e3 * 100), 100);
      }
    },
    onLoad(options) {
      if (options && options.type) {
        this.runningType = options.type;
      }
      uni.setNavigationBarTitle({
        title: this.runningType === "exam" ? "结业考核" : "3公里跑训练"
      });
      uni.getSystemInfo({
        success: (res) => {
          this.isDarkMode = res.theme === "dark";
        }
      });
    },
    onUnload() {
      this.clearTimer();
    },
    methods: {
      // 开始跑步
      startRunning() {
        this.checkLocationPermission(() => {
          this.runningState = "running";
          this.startTime = Date.now() - (this.pausedTime || 0);
          this.timer = setInterval(() => {
            this.elapsedTime = (Date.now() - this.startTime) / 1e3;
            this.simulateDistanceIncrease();
          }, 1e3);
          uni.showToast({
            title: this.runningType === "exam" ? "考核开始" : "训练开始",
            icon: "success"
          });
        });
      },
      // 暂停跑步
      pauseRunning() {
        this.runningState = "paused";
        this.pausedTime = Date.now() - this.startTime;
        this.clearTimer();
        uni.showToast({
          title: "已暂停",
          icon: "none"
        });
      },
      // 继续跑步
      resumeRunning() {
        this.runningState = "running";
        this.startTime = Date.now() - this.pausedTime;
        this.timer = setInterval(() => {
          this.elapsedTime = (Date.now() - this.startTime) / 1e3;
          this.simulateDistanceIncrease();
        }, 1e3);
        uni.showToast({
          title: "继续训练",
          icon: "success"
        });
      },
      // 结束跑步
      stopRunning() {
        if (this.distance < 2850) {
          uni.showModal({
            title: "确定结束跑步?",
            content: "你还未完成3公里目标距离",
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
        this.runningState = "finished";
      },
      // 完成并返回
      finishRunning() {
        this.saveRunningRecord();
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
        setTimeout(() => {
          callback && callback();
        }, 500);
      },
      // 模拟距离增加（实际应用中应使用GPS数据）
      simulateDistanceIncrease() {
        const metersPerSecond = 3.33 * this.speedFactor;
        this.distance += metersPerSecond;
        const randomFactor = 0.9 + Math.random() * 0.2;
        this.speedFactor = Math.max(0.8, Math.min(1.2, this.speedFactor * randomFactor));
      },
      // 获取考核等级文本
      getGradeText() {
        if (this.runningType !== "exam")
          return "";
        if (this.distance < 2850) {
          return "未完成";
        }
        if (this.elapsedTime <= 15 * 60) {
          return "优秀";
        } else if (this.elapsedTime <= 18 * 60) {
          return "合格";
        } else {
          return "不合格";
        }
      },
      // 获取等级对应的样式类
      getGradeClass() {
        const grade = this.getGradeText();
        if (grade === "优秀")
          return "grade-excellent";
        if (grade === "合格")
          return "grade-pass";
        if (grade === "不合格")
          return "grade-fail";
        return "";
      },
      // 保存跑步记录
      saveRunningRecord() {
        try {
          if (this.runningType === "exam" && this.distance >= 2850) {
            const examData = {
              completed: true,
              examTime: this.elapsedTime,
              examDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
              grade: this.getGradeText()
            };
            uni.setStorageSync("rookieExamData", JSON.stringify(examData));
          } else if (this.runningType === "3km" && this.distance >= 2850) {
            let trainingData = uni.getStorageSync("rookieCampData");
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
            trainingData.runningCompleted = (trainingData.runningCompleted || 0) + 1;
            if (!trainingData.bestRunningTime || this.elapsedTime < trainingData.bestRunningTime) {
              trainingData.bestRunningTime = this.elapsedTime;
            }
            uni.setStorageSync("rookieCampData", JSON.stringify(trainingData));
          }
        } catch (e) {
          formatAppLog("error", "at pages/training/running.vue:354", "保存记录失败:", e);
        }
      }
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["running-container", { "dark-mode": $data.isDarkMode }])
      },
      [
        vue.createCommentVNode(" 顶部信息区 "),
        vue.createElementVNode("view", { class: "top-info" }, [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["type-badge", $data.runningType === "exam" ? "exam-badge" : "training-badge"])
            },
            [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($data.runningType === "exam" ? "结业考核" : "3公里跑训练"),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          )
        ]),
        vue.createCommentVNode(" 运动数据区 "),
        vue.createElementVNode("view", { class: "stats-card" }, [
          vue.createElementVNode("view", { class: "stat-row" }, [
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($options.formatDistance),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "距离")
            ]),
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($options.formatTime),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "时间")
            ]),
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($options.formatPace),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "配速")
            ])
          ]),
          vue.createElementVNode("view", { class: "progress-bar" }, [
            vue.createElementVNode(
              "view",
              {
                class: "progress-fill",
                style: vue.normalizeStyle({ width: $options.progressPercentage + "%" })
              },
              null,
              4
              /* STYLE */
            )
          ]),
          vue.createElementVNode(
            "text",
            { class: "progress-text" },
            vue.toDisplayString($options.progressPercentage) + "% 完成",
            1
            /* TEXT */
          )
        ]),
        vue.createCommentVNode(" 目标信息 "),
        vue.createElementVNode("view", { class: "target-info" }, [
          vue.createElementVNode("text", { class: "target-text" }, "目标：3.0公里"),
          $data.runningType === "exam" ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 0,
            class: "target-text"
          }, "优秀标准：≤15分钟")) : vue.createCommentVNode("v-if", true),
          $data.runningType === "exam" ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 1,
            class: "target-text"
          }, "合格标准：≤18分钟")) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createCommentVNode(" 控制区域 "),
        vue.createElementVNode("view", { class: "controls" }, [
          vue.createCommentVNode(" 未开始 "),
          $data.runningState === "ready" ? (vue.openBlock(), vue.createElementBlock("button", {
            key: 0,
            class: "start-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.startRunning && $options.startRunning(...args))
          }, "开始")) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 运行中 "),
          $data.runningState === "running" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "btn-group"
          }, [
            vue.createElementVNode("button", {
              class: "pause-btn",
              onClick: _cache[1] || (_cache[1] = (...args) => $options.pauseRunning && $options.pauseRunning(...args))
            }, "暂停"),
            vue.createElementVNode("button", {
              class: "stop-btn",
              onClick: _cache[2] || (_cache[2] = (...args) => $options.stopRunning && $options.stopRunning(...args))
            }, "结束")
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 已暂停 "),
          $data.runningState === "paused" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "btn-group"
          }, [
            vue.createElementVNode("button", {
              class: "resume-btn",
              onClick: _cache[3] || (_cache[3] = (...args) => $options.resumeRunning && $options.resumeRunning(...args))
            }, "继续"),
            vue.createElementVNode("button", {
              class: "stop-btn",
              onClick: _cache[4] || (_cache[4] = (...args) => $options.stopRunning && $options.stopRunning(...args))
            }, "结束")
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 已完成 "),
          $data.runningState === "finished" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 3,
            class: "result-card"
          }, [
            vue.createElementVNode(
              "text",
              { class: "result-title" },
              vue.toDisplayString($data.runningType === "exam" ? "考核完成" : "训练完成"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "result-stats" }, [
              vue.createElementVNode("view", { class: "result-item" }, [
                vue.createElementVNode("text", { class: "result-label" }, "总距离"),
                vue.createElementVNode(
                  "text",
                  { class: "result-value" },
                  vue.toDisplayString($options.formatDistance),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "result-item" }, [
                vue.createElementVNode("text", { class: "result-label" }, "总时间"),
                vue.createElementVNode(
                  "text",
                  { class: "result-value" },
                  vue.toDisplayString($options.formatTime),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "result-item" }, [
                vue.createElementVNode("text", { class: "result-label" }, "平均配速"),
                vue.createElementVNode(
                  "text",
                  { class: "result-value" },
                  vue.toDisplayString($options.formatPace) + " 分/公里",
                  1
                  /* TEXT */
                )
              ])
            ]),
            $data.runningType === "exam" ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "result-grade"
            }, [
              vue.createElementVNode("text", { class: "grade-label" }, "考核成绩"),
              vue.createElementVNode(
                "text",
                {
                  class: vue.normalizeClass(["grade-value", $options.getGradeClass()])
                },
                vue.toDisplayString($options.getGradeText()),
                3
                /* TEXT, CLASS */
              )
            ])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("button", {
              class: "done-btn",
              onClick: _cache[5] || (_cache[5] = (...args) => $options.finishRunning && $options.finishRunning(...args))
            }, "完成并返回")
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ],
      2
      /* CLASS */
    );
  }
  const PagesTrainingRunning = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__file", "D:/zhouenjun/men-grow/men_app/pages/training/running.vue"]]);
  const login = (data) => {
    return request$1.post("/auth/login", data);
  };
  const register = (data) => {
    return request$1.post("/auth/register", data);
  };
  const _imports_0$5 = "/static/login_bg.png";
  const _imports_1 = "/static/images/logo.png";
  const _sfc_main$a = {
    onLoad() {
      if (store.isTokenValid() && store.getState().isLoggedIn) {
        uni.switchTab({
          url: "/pages/home/home"
        });
      }
    },
    data() {
      return {
        loginForm: {
          username: "",
          password: ""
        },
        loading: false
      };
    },
    onLoad() {
      const token = uni.getStorageSync("token");
      if (token) {
        uni.switchTab({
          url: "/pages/home/home"
        });
      }
    },
    methods: {
      // 登录处理
      async handleLogin() {
        if (!this.loginForm.username) {
          uni.showToast({
            title: "请输入账号",
            icon: "none"
          });
          return;
        }
        if (!this.loginForm.password) {
          uni.showToast({
            title: "请输入密码",
            icon: "none"
          });
          return;
        }
        try {
          this.loading = true;
          const result = await login(this.loginForm);
          const expiresIn = result.expiresIn ? result.expiresIn * 1e3 : 7 * 24 * 60 * 60 * 1e3;
          store.login(result.user, result.token, expiresIn);
          uni.showToast({
            title: "登录成功",
            icon: "success"
          });
          setTimeout(() => {
            uni.switchTab({
              url: "/pages/home/home"
            });
          }, 1500);
        } catch (error) {
          uni.showToast({
            title: error.message || "登录失败，请检查账号密码",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      // 跳转到注册页
      goToRegister() {
        uni.navigateTo({
          url: "/pages/register/register"
        });
      }
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-container" }, [
      vue.createElementVNode("image", {
        class: "bg-image",
        src: _imports_0$5,
        mode: "aspectFill"
      }),
      vue.createElementVNode("view", { class: "overlay" }),
      vue.createElementVNode("view", { class: "login-content" }, [
        vue.createElementVNode("view", { class: "logo-area" }, [
          vue.createElementVNode("image", {
            class: "logo",
            src: _imports_1,
            mode: "aspectFit"
          }),
          vue.createElementVNode("text", { class: "app-name" }, "铁炼计划"),
          vue.createElementVNode("text", { class: "app-slogan" }, "每一次坚持，都是向更强大的自己致敬")
        ]),
        vue.createElementVNode("view", { class: "form-area" }, [
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "iconfont icon-user" }),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "text",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.loginForm.username = $event),
                placeholder: "请输入账号",
                "placeholder-style": "color: rgba(255, 255, 255, 0.9);",
                class: "input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.loginForm.username]
            ])
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "iconfont icon-lock" }),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "password",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.loginForm.password = $event),
                placeholder: "请输入密码",
                "placeholder-style": "color: rgba(255, 255, 255, 0.9);",
                class: "input",
                password: ""
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.loginForm.password]
            ])
          ]),
          vue.createElementVNode("button", {
            onClick: _cache[2] || (_cache[2] = (...args) => $options.handleLogin && $options.handleLogin(...args)),
            class: "login-button",
            loading: $data.loading
          }, "登 录", 8, ["loading"]),
          vue.createElementVNode("view", { class: "actions" }, [
            vue.createElementVNode("text", {
              onClick: _cache[3] || (_cache[3] = (...args) => $options.goToRegister && $options.goToRegister(...args)),
              class: "action-text"
            }, "注册账号")
          ])
        ])
      ])
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__file", "D:/zhouenjun/men-grow/men_app/pages/login/login.vue"]]);
  const _imports_0$4 = "/static/register_bg.png";
  const _sfc_main$9 = {
    onLoad() {
      if (store.isTokenValid() && store.getState().isLoggedIn) {
        uni.switchTab({
          url: "/pages/home/home"
        });
      }
    },
    data() {
      return {
        registerForm: {
          username: "",
          password: "",
          nickname: "",
          soldierType: "战士"
        },
        confirmPassword: "",
        soldierTypes: ["战士", "侦察兵-80s", "炮兵-90s", "装甲兵-00s"],
        soldierTypeIndex: 0,
        loading: false
      };
    },
    methods: {
      // 兵种选择功能已移除
      // 注册处理
      async handleRegister() {
        if (!this.registerForm.username) {
          uni.showToast({
            title: "请输入用户名",
            icon: "none"
          });
          return;
        }
        if (!this.registerForm.password) {
          uni.showToast({
            title: "请输入密码",
            icon: "none"
          });
          return;
        }
        if (this.registerForm.password !== this.confirmPassword) {
          uni.showToast({
            title: "两次输入的密码不一致",
            icon: "none"
          });
          return;
        }
        if (!this.registerForm.nickname) {
          uni.showToast({
            title: "请输入昵称",
            icon: "none"
          });
          return;
        }
        try {
          this.loading = true;
          await register(this.registerForm);
          uni.showToast({
            title: "注册成功，请登录",
            icon: "success"
          });
          setTimeout(() => {
            uni.navigateTo({
              url: "/pages/login/login"
            });
          }, 1500);
        } catch (error) {
          uni.showToast({
            title: error.message || "注册失败，请稍后重试",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      // 跳转到登录页
      goToLogin() {
        uni.navigateTo({
          url: "/pages/login/login"
        });
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "register-container" }, [
      vue.createElementVNode("image", {
        class: "bg-image",
        src: _imports_0$4,
        mode: "aspectFill"
      }),
      vue.createElementVNode("view", { class: "overlay" }),
      vue.createElementVNode("view", { class: "register-content" }, [
        vue.createElementVNode("view", { class: "header" }, [
          vue.createElementVNode("text", { class: "title" }, "新兵报到"),
          vue.createElementVNode("text", { class: "subtitle" }, "加入铁炼计划，开启你的军旅健身之路")
        ]),
        vue.createElementVNode("view", { class: "form-area" }, [
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "iconfont icon-user" }),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "text",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.registerForm.username = $event),
                placeholder: "请输入用户名",
                "placeholder-style": "color: rgba(255, 255, 255, 0.9);",
                class: "input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.registerForm.username]
            ])
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "iconfont icon-lock" }),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "password",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.registerForm.password = $event),
                placeholder: "请输入密码",
                "placeholder-style": "color: rgba(255, 255, 255, 0.9);",
                class: "input",
                password: ""
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.registerForm.password]
            ])
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "iconfont icon-check" }),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "password",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.confirmPassword = $event),
                placeholder: "请再次输入密码",
                "placeholder-style": "color: rgba(255, 255, 255, 0.9);",
                class: "input",
                password: ""
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.confirmPassword]
            ])
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "iconfont icon-user-tag" }),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "text",
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.registerForm.nickname = $event),
                placeholder: "请输入昵称",
                "placeholder-style": "color: rgba(255, 255, 255, 0.9);",
                class: "input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.registerForm.nickname]
            ])
          ]),
          vue.createCommentVNode(" 兵种选择已移除 "),
          vue.createElementVNode("button", {
            onClick: _cache[4] || (_cache[4] = (...args) => $options.handleRegister && $options.handleRegister(...args)),
            class: "register-button",
            loading: $data.loading
          }, "立即报到", 8, ["loading"]),
          vue.createElementVNode("view", { class: "actions" }, [
            vue.createElementVNode("text", {
              onClick: _cache[5] || (_cache[5] = (...args) => $options.goToLogin && $options.goToLogin(...args)),
              class: "action-text"
            }, "已有账号，直接登录")
          ])
        ])
      ])
    ]);
  }
  const PagesRegisterRegister = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__file", "D:/zhouenjun/men-grow/men_app/pages/register/register.vue"]]);
  const _imports_0$3 = "/static/images/empty-list.png";
  const _sfc_main$8 = {
    data() {
      return {
        plans: [],
        filteredPlans: [],
        currentType: "all",
        currentPlanId: null,
        trainingTypes: [
          { label: "全部", value: "all" },
          { label: "新兵训练", value: "rookie" },
          { label: "力量训练", value: "strength" },
          { label: "耐力训练", value: "endurance" },
          { label: "核心训练", value: "core" },
          { label: "战术训练", value: "tactical" },
          { label: "有氧训练", value: "cardio" }
        ],
        page: 1,
        pageSize: 10,
        hasMore: true,
        loading: false,
        // 本地训练计划数据
        localPlans: [
          {
            _id: "rookie-12-weeks",
            name: "新兵12周训练计划",
            description: "科学渐进式训练，从零基础到完成三个100和3公里跑",
            coverImage: "/static/images/default-plan.jpg",
            difficultyLevel: 1,
            duration: 84,
            // 12周，84天
            intensity: "渐进式",
            participants: 1268,
            type: "rookie",
            weeks: [
              // 第1-4周（适应期）
              {
                week: 1,
                title: "适应期第1周",
                description: "身体适应训练节奏",
                days: [
                  {
                    // 周一
                    dayNumber: 1,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 10, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 10, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 10, rest: 120 }
                    ]
                  },
                  {
                    // 周二
                    dayNumber: 2,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 1.5,
                        description: "快走/慢跑交替"
                      }
                    ]
                  },
                  {
                    // 周三
                    dayNumber: 3,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 10, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 10, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 10, rest: 120 }
                    ]
                  },
                  {
                    // 周四
                    dayNumber: 4,
                    exercises: [
                      { type: "休息", description: "主动恢复，适当拉伸" }
                    ]
                  },
                  {
                    // 周五
                    dayNumber: 5,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 10, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 10, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 10, rest: 120 }
                    ]
                  },
                  {
                    // 周六
                    dayNumber: 6,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 1.5,
                        description: "快走/慢跑交替"
                      }
                    ]
                  },
                  {
                    // 周日
                    dayNumber: 7,
                    exercises: [{ type: "休息", description: "完全休息" }]
                  }
                ]
              },
              {
                week: 2,
                title: "适应期第2周",
                description: "轻微提升训练量",
                days: [
                  {
                    // 周一
                    dayNumber: 1,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 12, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 12, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 12, rest: 120 }
                    ]
                  },
                  {
                    // 周二
                    dayNumber: 2,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 1.7,
                        description: "快走/慢跑交替"
                      }
                    ]
                  },
                  {
                    // 周三
                    dayNumber: 3,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 12, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 12, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 12, rest: 120 }
                    ]
                  },
                  {
                    // 周四
                    dayNumber: 4,
                    exercises: [
                      { type: "休息", description: "主动恢复，适当拉伸" }
                    ]
                  },
                  {
                    // 周五
                    dayNumber: 5,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 12, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 12, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 12, rest: 120 }
                    ]
                  },
                  {
                    // 周六
                    dayNumber: 6,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 1.8,
                        description: "快走/慢跑交替"
                      }
                    ]
                  },
                  {
                    // 周日
                    dayNumber: 7,
                    exercises: [{ type: "休息", description: "完全休息" }]
                  }
                ]
              },
              {
                week: 4,
                title: "适应期第4周",
                description: "逐渐适应更高强度",
                days: [
                  {
                    // 周一
                    dayNumber: 1,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 18, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 18, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 18, rest: 120 }
                    ]
                  },
                  {
                    // 周二
                    dayNumber: 2,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 2.5,
                        description: "持续慢跑"
                      }
                    ]
                  },
                  {
                    // 周三
                    dayNumber: 3,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 18, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 18, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 18, rest: 120 }
                    ]
                  },
                  {
                    // 周四
                    dayNumber: 4,
                    exercises: [
                      { type: "休息", description: "主动恢复，适当拉伸" }
                    ]
                  },
                  {
                    // 周五
                    dayNumber: 5,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 18, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 18, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 18, rest: 120 }
                    ]
                  },
                  {
                    // 周六
                    dayNumber: 6,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 2.5,
                        description: "持续慢跑"
                      }
                    ]
                  },
                  {
                    // 周日
                    dayNumber: 7,
                    exercises: [{ type: "休息", description: "完全休息" }]
                  }
                ]
              },
              // 第5-8周（强化期）
              {
                week: 8,
                title: "强化期第8周",
                description: "提升持久力和肌肉耐力",
                days: [
                  {
                    // 周一
                    dayNumber: 1,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 28, rest: 90 },
                      { type: "深蹲", sets: 7, reps: 28, rest: 90 },
                      { type: "卷腹", sets: 7, reps: 28, rest: 90 }
                    ]
                  },
                  {
                    // 周二
                    dayNumber: 2,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 3,
                        description: "持续中速跑"
                      }
                    ]
                  },
                  {
                    // 周三
                    dayNumber: 3,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 28, rest: 90 },
                      { type: "深蹲", sets: 7, reps: 28, rest: 90 },
                      { type: "卷腹", sets: 7, reps: 28, rest: 90 }
                    ]
                  },
                  {
                    // 周四
                    dayNumber: 4,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 3,
                        description: "持续中速跑"
                      }
                    ]
                  },
                  {
                    // 周五
                    dayNumber: 5,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 28, rest: 90 },
                      { type: "深蹲", sets: 7, reps: 28, rest: 90 },
                      { type: "卷腹", sets: 7, reps: 28, rest: 90 }
                    ]
                  },
                  {
                    // 周六
                    dayNumber: 6,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 3,
                        description: "持续中速跑"
                      }
                    ]
                  },
                  {
                    // 周日
                    dayNumber: 7,
                    exercises: [
                      { type: "休息", description: "主动恢复，拉伸和放松" }
                    ]
                  }
                ]
              },
              // 第9-12周（冲刺期）
              {
                week: 12,
                title: "冲刺期第12周",
                description: "最终冲刺，达到目标",
                days: [
                  {
                    // 周一
                    dayNumber: 1,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 45, rest: 60 },
                      { type: "深蹲", sets: 7, reps: 45, rest: 60 },
                      { type: "卷腹", sets: 7, reps: 45, rest: 60 }
                    ]
                  },
                  {
                    // 周二
                    dayNumber: 2,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 20,
                        distance: 3,
                        description: "3公里计时跑，目标20分钟以内"
                      }
                    ]
                  },
                  {
                    // 周三
                    dayNumber: 3,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 45, rest: 60 },
                      { type: "深蹲", sets: 7, reps: 45, rest: 60 },
                      { type: "卷腹", sets: 7, reps: 45, rest: 60 }
                    ]
                  },
                  {
                    // 周四
                    dayNumber: 4,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 20,
                        distance: 3,
                        description: "3公里计时跑，目标18分钟以内"
                      }
                    ]
                  },
                  {
                    // 周五
                    dayNumber: 5,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 45, rest: 60 },
                      { type: "深蹲", sets: 7, reps: 45, rest: 60 },
                      { type: "卷腹", sets: 7, reps: 45, rest: 60 }
                    ]
                  },
                  {
                    // 周六
                    dayNumber: 6,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 18,
                        distance: 3,
                        description: "3公里计时跑，目标15分钟以内"
                      }
                    ]
                  },
                  {
                    // 周日
                    dayNumber: 7,
                    exercises: [
                      {
                        type: "结业测试",
                        description: "三个100各做100个，3公里跑争取在15分钟内完成"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };
    },
    onLoad() {
      this.loadTrainingPlans();
    },
    onShow() {
      this.loadTrainingPlans();
      this.loadCurrentPlan();
      uni.setNavigationBarTitle({
        title: "训练计划"
      });
    },
    methods: {
      // 加载训练计划
      async loadTrainingPlans() {
        try {
          this.loading = true;
          let localResults = [];
          if (this.currentType === "all" || this.currentType === "rookie") {
            localResults = this.localPlans.filter(
              (plan) => this.currentType === "all" || plan.type === this.currentType
            );
          }
          let apiResults = [];
          try {
            if (this.currentType === "all") {
              apiResults = await getTrainingPlans();
            } else if (this.currentType !== "rookie") {
              apiResults = await getTrainingPlansByType(this.currentType);
            }
          } catch (apiError) {
            formatAppLog("error", "at pages/training/plan-list.vue:529", "API获取训练计划失败", apiError);
          }
          const mergedResults = [...localResults, ...apiResults];
          if (mergedResults && Array.isArray(mergedResults)) {
            this.plans = mergedResults;
            this.filteredPlans = mergedResults;
            this.hasMore = mergedResults.length >= this.pageSize;
          }
        } catch (error) {
          formatAppLog("error", "at pages/training/plan-list.vue:541", "获取训练计划失败", error);
          uni.showToast({
            title: "加载失败，请重试",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      // 按类型筛选
      async filterByType(type) {
        if (this.currentType === type)
          return;
        this.currentType = type;
        this.page = 1;
        this.filteredPlans = [];
        this.loadTrainingPlans();
      },
      // 加载更多
      async loadMore() {
        if (!this.hasMore || this.loading)
          return;
        this.page++;
        await this.loadTrainingPlans();
      },
      // 查看训练计划详情
      viewPlanDetail(planId) {
        const localPlan = this.localPlans.find((p) => p._id === planId);
        if (localPlan) {
          uni.navigateTo({
            url: `/pages/training/plan-detail?id=${planId}&isLocal=true`
          });
        } else {
          uni.navigateTo({
            url: `/pages/training/plan-detail?id=${planId}`
          });
        }
      },
      // 获取难度文本
      getDifficultyText(level) {
        const levels = {
          1: "新手",
          2: "初级",
          3: "中级",
          4: "高级"
        };
        return levels[level] || "新兵";
      },
      // 加载当前训练计划
      async loadCurrentPlan() {
        try {
          const storeCurrentPlan = store.getState().currentTrainingPlan;
          if (storeCurrentPlan && storeCurrentPlan._id) {
            this.currentPlanId = storeCurrentPlan._id;
            return;
          }
          const result = await getCurrentTrainingPlan();
          if (result && result._id) {
            this.currentPlanId = result._id;
            store.setCurrentTrainingPlan(result);
          }
        } catch (error) {
          formatAppLog("error", "at pages/training/plan-list.vue:614", "获取当前训练计划失败", error);
        }
      },
      // 选择训练计划
      async selectPlan(plan) {
        if (this.isCurrentPlan(plan._id)) {
          return;
        }
        try {
          uni.showLoading({ title: "选择中..." });
          formatAppLog("log", "at pages/training/plan-list.vue:629", "选择训练计划ID:", plan._id);
          formatAppLog("log", "at pages/training/plan-list.vue:630", "选择训练计划完整对象:", JSON.stringify(plan));
          const result = await selectTrainingPlan(plan._id);
          formatAppLog("log", "at pages/training/plan-list.vue:634", "选择训练计划API返回结果:", result);
          this.currentPlanId = plan._id;
          store.setCurrentTrainingPlan(plan);
          uni.hideLoading();
          uni.showToast({
            title: "训练计划选择成功",
            icon: "success"
          });
          setTimeout(() => {
            uni.switchTab({
              url: "/pages/home/home"
            });
          }, 1500);
        } catch (error) {
          uni.hideLoading();
          formatAppLog("error", "at pages/training/plan-list.vue:655", "选择训练计划失败", error);
          formatAppLog("error", "at pages/training/plan-list.vue:656", "错误详情:", error.response || error.message || error);
          let errorMsg = "选择失败，请重试";
          if (error.response && error.response.statusCode) {
            errorMsg = `错误代码: ${error.response.statusCode}, 请检查后端日志`;
          }
          uni.showToast({
            title: errorMsg,
            icon: "none",
            duration: 3e3
          });
        }
      },
      // 判断是否为当前计划
      isCurrentPlan(planId) {
        return this.currentPlanId === planId;
      }
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "plan-list-container" }, [
      vue.createCommentVNode(" 训练计划列表 "),
      $data.filteredPlans.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "plan-list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.filteredPlans, (plan, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: "plan-card",
              onClick: ($event) => $options.viewPlanDetail(plan._id)
            }, [
              vue.createElementVNode("image", {
                class: "plan-image",
                src: "/static/images/new_solider.png",
                mode: "aspectFill"
              }, null, 8, ["src"]),
              vue.createElementVNode("view", { class: "plan-info" }, [
                vue.createElementVNode("view", { class: "plan-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "plan-name" },
                    vue.toDisplayString(plan.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "difficulty" }, [
                    vue.createElementVNode(
                      "text",
                      {
                        class: vue.normalizeClass(["difficulty-level", "level-" + plan.difficultyLevel])
                      },
                      vue.toDisplayString($options.getDifficultyText(plan.difficultyLevel)),
                      3
                      /* TEXT, CLASS */
                    )
                  ])
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "plan-description" },
                  vue.toDisplayString(plan.description),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "plan-meta" }, [
                  vue.createElementVNode("view", { class: "meta-item" }, [
                    vue.createElementVNode("text", { class: "meta-icon" }, "⏱️"),
                    vue.createElementVNode(
                      "text",
                      { class: "meta-value" },
                      vue.toDisplayString(plan.duration) + "天",
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "meta-item" }, [
                    vue.createElementVNode("text", { class: "meta-icon" }, "🔥"),
                    vue.createElementVNode(
                      "text",
                      { class: "meta-value" },
                      vue.toDisplayString(plan.intensity || "中等") + "强度",
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "meta-item" }, [
                    vue.createElementVNode("text", { class: "meta-icon" }, "👥"),
                    vue.createElementVNode(
                      "text",
                      { class: "meta-value" },
                      vue.toDisplayString(plan.participants || 0) + "人已参与",
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", { class: "plan-actions" }, [
                  vue.createElementVNode("button", {
                    class: "view-button",
                    onClick: vue.withModifiers(($event) => $options.viewPlanDetail(plan._id), ["stop"])
                  }, " 查看详情 ", 8, ["onClick"]),
                  vue.createElementVNode("button", {
                    class: "select-button",
                    onClick: vue.withModifiers(($event) => $options.selectPlan(plan), ["stop"])
                  }, vue.toDisplayString($options.isCurrentPlan(plan._id) ? "当前计划" : "选择此计划"), 9, ["onClick"])
                ])
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 无训练计划提示 "),
          vue.createElementVNode("view", { class: "empty-state" }, [
            vue.createElementVNode("image", {
              class: "empty-image",
              src: _imports_0$3,
              mode: "aspectFit"
            }),
            vue.createElementVNode("text", { class: "empty-text" }, "暂无训练计划")
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      )),
      vue.createCommentVNode(" 加载更多 "),
      $data.hasMore && $data.filteredPlans.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "load-more"
      }, [
        $data.loading ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "加载中...")) : (vue.openBlock(), vue.createElementBlock("text", {
          key: 1,
          onClick: _cache[0] || (_cache[0] = (...args) => $options.loadMore && $options.loadMore(...args))
        }, "加载更多"))
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesTrainingPlanList = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__file", "D:/zhouenjun/men-grow/men_app/pages/training/plan-list.vue"]]);
  const _sfc_main$7 = {
    data() {
      return {
        planId: "",
        plan: {},
        userProgress: {
          started: false,
          completed: 0,
          completedExercises: []
        },
        loading: false,
        isLocalPlan: false,
        // 当前显示的周数索引
        currentWeekIndex: 0,
        // 本地计划数据
        localPlans: [
          {
            _id: "rookie-12-weeks",
            name: "新兵12周训练计划",
            description: "科学渐进式训练，从零基础到完成三个100和3公里跑",
            coverImage: "/static/images/default-plan.jpg",
            difficultyLevel: 1,
            duration: 84,
            // 12周，84天
            intensity: "渐进式",
            participants: 1268,
            type: "rookie",
            notes: "1. 每次训练前做好充分热身\n2. 训练量按照自身情况进行适当调整\n3. 保持良好饮食和充足休息\n4. 每周记录自己的进步\n5. 根据自己的恢复能力调整休息时间",
            weeks: [
              // 第1-4周（适应期）
              {
                week: 1,
                title: "适应期第1周",
                description: "身体适应训练节奏",
                days: [
                  {
                    // 周一
                    dayNumber: 1,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 10, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 10, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 10, rest: 120 }
                    ]
                  },
                  {
                    // 周二
                    dayNumber: 2,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 1.5,
                        description: "快走/慢跑交替"
                      }
                    ]
                  },
                  {
                    // 周三
                    dayNumber: 3,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 10, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 10, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 10, rest: 120 }
                    ]
                  },
                  {
                    // 周四
                    dayNumber: 4,
                    exercises: [
                      { type: "休息", description: "主动恢复，适当拉伸" }
                    ]
                  },
                  {
                    // 周五
                    dayNumber: 5,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 10, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 10, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 10, rest: 120 }
                    ]
                  },
                  {
                    // 周六
                    dayNumber: 6,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 1.5,
                        description: "快走/慢跑交替"
                      }
                    ]
                  },
                  {
                    // 周日
                    dayNumber: 7,
                    exercises: [{ type: "休息", description: "完全休息" }]
                  }
                ]
              },
              {
                week: 2,
                title: "适应期第2周",
                description: "轻微提升训练量",
                days: [
                  {
                    // 周一
                    dayNumber: 1,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 12, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 12, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 12, rest: 120 }
                    ]
                  },
                  {
                    // 周二
                    dayNumber: 2,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 1.7,
                        description: "快走/慢跑交替"
                      }
                    ]
                  },
                  {
                    // 周三
                    dayNumber: 3,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 12, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 12, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 12, rest: 120 }
                    ]
                  },
                  {
                    // 周四
                    dayNumber: 4,
                    exercises: [
                      { type: "休息", description: "主动恢复，适当拉伸" }
                    ]
                  },
                  {
                    // 周五
                    dayNumber: 5,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 12, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 12, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 12, rest: 120 }
                    ]
                  },
                  {
                    // 周六
                    dayNumber: 6,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 1.8,
                        description: "快走/慢跑交替"
                      }
                    ]
                  },
                  {
                    // 周日
                    dayNumber: 7,
                    exercises: [{ type: "休息", description: "完全休息" }]
                  }
                ]
              },
              {
                week: 4,
                title: "适应期第4周",
                description: "逐渐适应更高强度",
                days: [
                  {
                    // 周一
                    dayNumber: 1,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 18, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 18, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 18, rest: 120 }
                    ]
                  },
                  {
                    // 周二
                    dayNumber: 2,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 2.5,
                        description: "持续慢跑"
                      }
                    ]
                  },
                  {
                    // 周三
                    dayNumber: 3,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 18, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 18, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 18, rest: 120 }
                    ]
                  },
                  {
                    // 周四
                    dayNumber: 4,
                    exercises: [
                      { type: "休息", description: "主动恢复，适当拉伸" }
                    ]
                  },
                  {
                    // 周五
                    dayNumber: 5,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 18, rest: 120 },
                      { type: "深蹲", sets: 7, reps: 18, rest: 120 },
                      { type: "卷腹", sets: 7, reps: 18, rest: 120 }
                    ]
                  },
                  {
                    // 周六
                    dayNumber: 6,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 2.5,
                        description: "持续慢跑"
                      }
                    ]
                  },
                  {
                    // 周日
                    dayNumber: 7,
                    exercises: [{ type: "休息", description: "完全休息" }]
                  }
                ]
              },
              // 第5-8周（强化期）
              {
                week: 8,
                title: "强化期第8周",
                description: "提升持久力和肌肉耐力",
                days: [
                  {
                    // 周一
                    dayNumber: 1,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 28, rest: 90 },
                      { type: "深蹲", sets: 7, reps: 28, rest: 90 },
                      { type: "卷腹", sets: 7, reps: 28, rest: 90 }
                    ]
                  },
                  {
                    // 周二
                    dayNumber: 2,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 3,
                        description: "持续中速跑"
                      }
                    ]
                  },
                  {
                    // 周三
                    dayNumber: 3,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 28, rest: 90 },
                      { type: "深蹲", sets: 7, reps: 28, rest: 90 },
                      { type: "卷腹", sets: 7, reps: 28, rest: 90 }
                    ]
                  },
                  {
                    // 周四
                    dayNumber: 4,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 3,
                        description: "持续中速跑"
                      }
                    ]
                  },
                  {
                    // 周五
                    dayNumber: 5,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 28, rest: 90 },
                      { type: "深蹲", sets: 7, reps: 28, rest: 90 },
                      { type: "卷腹", sets: 7, reps: 28, rest: 90 }
                    ]
                  },
                  {
                    // 周六
                    dayNumber: 6,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 30,
                        distance: 3,
                        description: "持续中速跑"
                      }
                    ]
                  },
                  {
                    // 周日
                    dayNumber: 7,
                    exercises: [
                      { type: "休息", description: "主动恢复，拉伸和放松" }
                    ]
                  }
                ]
              },
              // 第9-12周（冲刺期）
              {
                week: 12,
                title: "冲刺期第12周",
                description: "最终冲刺，达到目标",
                days: [
                  {
                    // 周一
                    dayNumber: 1,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 45, rest: 60 },
                      { type: "深蹲", sets: 7, reps: 45, rest: 60 },
                      { type: "卷腹", sets: 7, reps: 45, rest: 60 }
                    ]
                  },
                  {
                    // 周二
                    dayNumber: 2,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 20,
                        distance: 3,
                        description: "3公里计时跑，目标20分钟以内"
                      }
                    ]
                  },
                  {
                    // 周三
                    dayNumber: 3,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 45, rest: 60 },
                      { type: "深蹲", sets: 7, reps: 45, rest: 60 },
                      { type: "卷腹", sets: 7, reps: 45, rest: 60 }
                    ]
                  },
                  {
                    // 周四
                    dayNumber: 4,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 20,
                        distance: 3,
                        description: "3公里计时跑，目标18分钟以内"
                      }
                    ]
                  },
                  {
                    // 周五
                    dayNumber: 5,
                    exercises: [
                      { type: "俯卧撑", sets: 7, reps: 45, rest: 60 },
                      { type: "深蹲", sets: 7, reps: 45, rest: 60 },
                      { type: "卷腹", sets: 7, reps: 45, rest: 60 }
                    ]
                  },
                  {
                    // 周六
                    dayNumber: 6,
                    exercises: [
                      {
                        type: "跑步",
                        duration: 18,
                        distance: 3,
                        description: "3公里计时跑，目标15分钟以内"
                      }
                    ]
                  },
                  {
                    // 周日
                    dayNumber: 7,
                    exercises: [
                      {
                        type: "结业测试",
                        description: "三个100各做100个，3公里跑争取在15分钟内完成"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };
    },
    onLoad(options) {
      if (options.id) {
        this.planId = options.id;
        this.isLocalPlan = options.isLocal === "true";
        this.loadPlanDetail();
      } else {
        uni.showToast({
          title: "未找到训练计划",
          icon: "none"
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    },
    methods: {
      // 加载训练计划详情
      async loadPlanDetail() {
        try {
          this.loading = true;
          if (this.isLocalPlan) {
            const localPlan = this.localPlans.find((p) => p._id === this.planId);
            if (localPlan) {
              this.plan = JSON.parse(JSON.stringify(localPlan));
              if (this.plan.weeks && this.plan.weeks.length > 0) {
                this.plan.currentWeek = this.plan.weeks[this.currentWeekIndex];
              }
              this.prepareExercisesForLocalPlan();
              store.setCurrentTrainingPlan(this.plan);
              try {
                const storedProgress = uni.getStorageSync(
                  `training_progress_${this.planId}`
                );
                if (storedProgress) {
                  this.userProgress = JSON.parse(storedProgress);
                } else {
                  this.userProgress = {
                    started: false,
                    completed: 0,
                    completedExercises: [],
                    currentWeekIndex: 0,
                    currentDayIndex: 0
                  };
                }
              } catch (e) {
                formatAppLog("error", "at pages/training/plan-detail.vue:572", "获取本地训练进度失败", e);
                this.userProgress = {
                  started: false,
                  completed: 0,
                  completedExercises: [],
                  currentWeekIndex: 0,
                  currentDayIndex: 0
                };
              }
            } else {
              throw new Error("找不到本地计划数据");
            }
          } else {
            const result = await getTrainingPlanDetail(this.planId);
            if (result) {
              this.plan = result;
              store.setCurrentTrainingPlan(result);
              this.userProgress = {
                started: false,
                completed: 0,
                completedExercises: []
              };
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/training/plan-detail.vue:601", "获取训练计划详情失败", error);
          uni.showToast({
            title: "加载失败，请重试",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      // 获取运动项目描述
      getExerciseDesc(exercise) {
        if (exercise.type === "time") {
          return `${exercise.sets}组 × ${exercise.duration}秒`;
        } else {
          return `${exercise.sets}组 × ${exercise.reps}次`;
        }
      },
      // 检查运动是否已完成
      isExerciseCompleted(exerciseId) {
        return this.userProgress.completedExercises.includes(exerciseId);
      },
      // 开始训练
      startTraining() {
        this.userProgress.started = true;
        uni.navigateTo({
          url: `/pages/training/exercise?planId=${this.planId}`
        });
      },
      // 分享训练计划
      sharePlan() {
        uni.share({
          provider: "weixin",
          scene: "WXSceneSession",
          type: 0,
          title: `铁炼计划 - ${this.plan.name}`,
          summary: this.plan.description,
          imageUrl: this.plan.coverImage,
          success: function(res) {
            formatAppLog("log", "at pages/training/plan-detail.vue:646", "success:" + JSON.stringify(res));
          },
          fail: function(err) {
            formatAppLog("log", "at pages/training/plan-detail.vue:649", "fail:" + JSON.stringify(err));
          }
        });
      },
      // 获取难度文本
      getDifficultyText(level) {
        const levels = {
          1: "新兵",
          2: "下士",
          3: "中士",
          4: "上士",
          5: "军官"
        };
        return levels[level] || "新兵";
      },
      // 返回上一级
      goBack() {
        uni.navigateBack();
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    var _a;
    return vue.openBlock(), vue.createElementBlock("view", { class: "plan-detail-container" }, [
      vue.createCommentVNode(" 顶部图片 "),
      vue.createElementVNode("view", { class: "plan-header" }, [
        vue.createElementVNode("image", {
          class: "cover-image",
          src: "/static/images/new_solider.png",
          mode: "aspectFill"
        }, null, 8, ["src"]),
        vue.createElementVNode("view", { class: "header-overlay" }),
        vue.createElementVNode("view", { class: "plan-title-container" }, [
          vue.createElementVNode(
            "text",
            { class: "plan-title" },
            vue.toDisplayString($data.plan.name),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "plan-badges" }, [
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["badge difficulty", "difficulty-" + $data.plan.difficultyLevel])
              },
              vue.toDisplayString($options.getDifficultyText($data.plan.difficultyLevel)),
              3
              /* TEXT, CLASS */
            ),
            vue.createElementVNode(
              "text",
              { class: "badge type" },
              vue.toDisplayString($data.plan.type),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 计划简介 "),
      vue.createElementVNode("view", { class: "plan-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "计划简介")
        ]),
        vue.createElementVNode("view", { class: "plan-description" }, [
          vue.createElementVNode(
            "text",
            null,
            vue.toDisplayString($data.plan.description),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "plan-meta" }, [
          vue.createElementVNode("view", { class: "meta-item" }, [
            vue.createElementVNode("text", { class: "meta-label" }, "训练天数"),
            vue.createElementVNode(
              "text",
              { class: "meta-value" },
              vue.toDisplayString($data.plan.duration) + "天",
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "meta-item" }, [
            vue.createElementVNode("text", { class: "meta-label" }, "训练强度"),
            vue.createElementVNode(
              "text",
              { class: "meta-value" },
              vue.toDisplayString($data.plan.intensity || "中等"),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "meta-item" }, [
            vue.createElementVNode("text", { class: "meta-label" }, "已有"),
            vue.createElementVNode(
              "text",
              { class: "meta-value" },
              vue.toDisplayString($data.plan.participants || 0) + "人参与",
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 训练内容 "),
      vue.createElementVNode("view", { class: "plan-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "训练内容"),
          vue.createElementVNode("view", { class: "progress-indicator" }, [
            vue.createElementVNode(
              "text",
              null,
              "进度: " + vue.toDisplayString($data.userProgress.completed || 0) + "/" + vue.toDisplayString(((_a = $data.plan.exercises) == null ? void 0 : _a.length) || 0),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "exercises-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.plan.exercises, (exercise, index) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: index,
                  class: vue.normalizeClass(["exercise-item", { completed: $options.isExerciseCompleted(exercise._id) }])
                },
                [
                  vue.createElementVNode("view", { class: "exercise-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "exercise-number" },
                      vue.toDisplayString(index + 1),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "exercise-details" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "exercise-name" },
                        vue.toDisplayString(exercise.name),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "exercise-desc" },
                        vue.toDisplayString($options.getExerciseDesc(exercise)),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "exercise-status" }, [
                    $options.isExerciseCompleted(exercise._id) ? (vue.openBlock(), vue.createElementBlock("text", {
                      key: 0,
                      class: "status-completed"
                    }, "已完成")) : (vue.openBlock(), vue.createElementBlock("text", {
                      key: 1,
                      class: "status-pending"
                    }, "未完成"))
                  ])
                ],
                2
                /* CLASS */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 注意事项 "),
      $data.plan.notes ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "plan-section"
      }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "注意事项")
        ]),
        vue.createElementVNode("view", { class: "notes" }, [
          vue.createElementVNode(
            "text",
            null,
            vue.toDisplayString($data.plan.notes),
            1
            /* TEXT */
          )
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 底部操作栏 "),
      vue.createElementVNode("view", { class: "action-bar" }, [
        vue.createElementVNode("button", {
          class: "share-button",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.sharePlan && $options.sharePlan(...args))
        }, [
          vue.createElementVNode("text", { class: "button-icon" }, "📢"),
          vue.createElementVNode("text", null, "分享")
        ]),
        vue.createElementVNode(
          "button",
          {
            class: "primary-button",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.startTraining && $options.startTraining(...args))
          },
          vue.toDisplayString($data.userProgress.started ? "继续训练" : "开始训练"),
          1
          /* TEXT */
        )
      ])
    ]);
  }
  const PagesTrainingPlanDetail = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__file", "D:/zhouenjun/men-grow/men_app/pages/training/plan-detail.vue"]]);
  const _imports_0$2 = "/static/images/empty-log.png";
  const _sfc_main$6 = {
    data() {
      return {
        tabs: ["全部记录", "本周", "本月"],
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
        if (this.currentTab === index)
          return;
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
        if (this.loading)
          return;
        this.loading = true;
        let timeRange = {};
        const now = /* @__PURE__ */ new Date();
        if (this.currentTab === 1) {
          const dayOfWeek = now.getDay() || 7;
          const startDate = new Date(now);
          startDate.setDate(now.getDate() - dayOfWeek + 1);
          startDate.setHours(0, 0, 0, 0);
          timeRange = {
            start: startDate.toISOString(),
            end: now.toISOString()
          };
        } else if (this.currentTab === 2) {
          const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          timeRange = {
            start: startDate.toISOString(),
            end: now.toISOString()
          };
        }
        getUserTrainingLogs({
          page: this.page,
          limit: 10,
          ...timeRange
        }).then((res) => {
          if (this.page === 1) {
            this.logs = [
              {
                _id: "1",
                planId: "plan1",
                planName: "军体拳基础训练",
                date: new Date((/* @__PURE__ */ new Date()).getTime() - 2 * 24 * 60 * 60 * 1e3),
                // 两天前
                duration: 1800,
                // 30分钟
                completedExercises: 10,
                totalExercises: 10
              },
              {
                _id: "2",
                planId: "plan2",
                planName: "体能强化训练",
                date: new Date((/* @__PURE__ */ new Date()).getTime() - 4 * 24 * 60 * 60 * 1e3),
                // 四天前
                duration: 2400,
                // 40分钟
                completedExercises: 8,
                totalExercises: 12
              },
              {
                _id: "3",
                planId: "plan3",
                planName: "战术体能训练",
                date: new Date((/* @__PURE__ */ new Date()).getTime() - 7 * 24 * 60 * 60 * 1e3),
                // 一周前
                duration: 3e3,
                // 50分钟
                completedExercises: 15,
                totalExercises: 15
              }
            ];
          } else {
            this.logs.push(
              {
                _id: "4",
                planId: "plan4",
                planName: "耐力训练课程",
                date: new Date((/* @__PURE__ */ new Date()).getTime() - 10 * 24 * 60 * 60 * 1e3),
                duration: 2700,
                completedExercises: 12,
                totalExercises: 12
              },
              {
                _id: "5",
                planId: "plan5",
                planName: "核心力量训练",
                date: new Date((/* @__PURE__ */ new Date()).getTime() - 14 * 24 * 60 * 60 * 1e3),
                duration: 1500,
                completedExercises: 6,
                totalExercises: 8
              }
            );
          }
          this.hasMore = this.page < 2;
          this.page++;
        }).catch((err) => {
          formatAppLog("error", "at pages/training/training-log.vue:199", "获取训练记录失败:", err);
          uni.showToast({
            title: "获取记录失败",
            icon: "none"
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
          title: "记录详情功能开发中",
          icon: "none"
        });
      },
      // 跳转到训练计划列表
      goToTrainingPlans() {
        uni.switchTab({
          url: "/pages/home/home"
        });
      },
      // 格式化日期
      formatDate(date) {
        if (!date)
          return "";
        const d = new Date(date);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
      },
      // 格式化时长
      formatDuration(seconds) {
        if (!seconds)
          return "0分钟";
        const minutes = Math.floor(seconds / 60);
        return `${minutes}分钟`;
      },
      // 计算卡路里消耗（简单估算）
      calculateCalories(duration) {
        return Math.round(duration / 60 * 6);
      },
      // 获取完成率
      getCompletionRate(log) {
        if (!log.totalExercises)
          return 0;
        return Math.round(log.completedExercises / log.totalExercises * 100);
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "training-log-container" }, [
      vue.createCommentVNode(" 头部标签切换 "),
      vue.createElementVNode("view", { class: "tab-header" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.tabs, (tab, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: vue.normalizeClass(["tab-item", { active: $data.currentTab === index }]),
              onClick: ($event) => $options.switchTab(index)
            }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString(tab),
                1
                /* TEXT */
              )
            ], 10, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 训练记录列表 "),
      $data.logs.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "training-logs"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.logs, (log, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "log-item",
              key: index,
              onClick: ($event) => $options.viewLogDetail(log)
            }, [
              vue.createElementVNode("view", { class: "log-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "log-plan-name" },
                  vue.toDisplayString(log.planName),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "log-date" },
                  vue.toDisplayString($options.formatDate(log.date)),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "log-body" }, [
                vue.createElementVNode("view", { class: "log-stat" }, [
                  vue.createElementVNode("text", { class: "log-stat-label" }, "训练时长"),
                  vue.createElementVNode(
                    "text",
                    { class: "log-stat-value" },
                    vue.toDisplayString($options.formatDuration(log.duration)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "log-stat" }, [
                  vue.createElementVNode("text", { class: "log-stat-label" }, "动作完成"),
                  vue.createElementVNode(
                    "text",
                    { class: "log-stat-value" },
                    vue.toDisplayString(log.completedExercises) + "/" + vue.toDisplayString(log.totalExercises),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "log-stat" }, [
                  vue.createElementVNode("text", { class: "log-stat-label" }, "消耗热量"),
                  vue.createElementVNode(
                    "text",
                    { class: "log-stat-value" },
                    vue.toDisplayString($options.calculateCalories(log.duration)) + " 大卡",
                    1
                    /* TEXT */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "log-footer" }, [
                $options.getCompletionRate(log) >= 100 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "log-tag"
                }, "全部完成")) : (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "log-tag partial"
                }, "部分完成")),
                vue.createElementVNode("view", { class: "view-detail" }, [
                  vue.createElementVNode("text", null, "查看详情"),
                  vue.createElementVNode("text", { class: "icon" }, ">")
                ])
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 空状态 "),
          vue.createElementVNode("view", { class: "empty-state" }, [
            vue.createElementVNode("image", {
              class: "empty-image",
              src: _imports_0$2,
              mode: "aspectFit"
            }),
            vue.createElementVNode("text", { class: "empty-text" }, "暂无训练记录"),
            vue.createElementVNode("button", {
              class: "start-training-btn",
              onClick: _cache[0] || (_cache[0] = (...args) => $options.goToTrainingPlans && $options.goToTrainingPlans(...args))
            }, "开始训练")
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      ))
    ]);
  }
  const PagesTrainingTrainingLog = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__file", "D:/zhouenjun/men-grow/men_app/pages/training/training-log.vue"]]);
  const _imports_0$1 = "/static/images/empty-medals.png";
  const _sfc_main$5 = {
    data() {
      return {
        categories: ["全部", "训练成就", "挑战成就", "坚持成就", "特殊成就"],
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
          return this.allMedals.filter((medal) => medal.category === this.currentCategory);
        }
      }
    },
    onLoad() {
      this.loadMedals();
    },
    methods: {
      // 加载勋章数据
      loadMedals() {
        this.allMedals = [
          {
            id: "1",
            name: "训练新兵",
            description: "完成第一次训练",
            requirement: "完成一次完整的训练计划",
            imageUrl: "/static/images/medals/training_rookie.png",
            lockedImageUrl: "/static/images/medals/locked.png",
            category: 1,
            // 训练成就
            earned: true,
            earnedDate: /* @__PURE__ */ new Date("2023-06-15")
          },
          {
            id: "2",
            name: "训练精英",
            description: "累计完成50次训练",
            requirement: "累计完成50次训练计划",
            imageUrl: "/static/images/medals/training_elite.png",
            lockedImageUrl: "/static/images/medals/locked.png",
            category: 1,
            // 训练成就
            earned: false
          },
          {
            id: "3",
            name: "体能王者",
            description: "在体能挑战中获得满分",
            requirement: "在任意一次体能挑战中获得100分",
            imageUrl: "/static/images/medals/fitness_king.png",
            lockedImageUrl: "/static/images/medals/locked.png",
            category: 2,
            // 挑战成就
            earned: false
          },
          {
            id: "4",
            name: "连续7天",
            description: "连续训练7天",
            requirement: "连续7天每天完成至少一次训练",
            imageUrl: "/static/images/medals/streak_7.png",
            lockedImageUrl: "/static/images/medals/locked.png",
            category: 3,
            // 坚持成就
            earned: true,
            earnedDate: /* @__PURE__ */ new Date("2023-06-22")
          },
          {
            id: "5",
            name: "连续30天",
            description: "连续训练30天",
            requirement: "连续30天每天完成至少一次训练",
            imageUrl: "/static/images/medals/streak_30.png",
            lockedImageUrl: "/static/images/medals/locked.png",
            category: 3,
            // 坚持成就
            earned: false
          },
          {
            id: "6",
            name: "首次突破",
            description: "首次突破个人训练记录",
            requirement: "在任意一个训练项目中突破个人最佳记录",
            imageUrl: "/static/images/medals/first_breakthrough.png",
            lockedImageUrl: "/static/images/medals/locked.png",
            category: 4,
            // 特殊成就
            earned: true,
            earnedDate: /* @__PURE__ */ new Date("2023-06-20")
          }
        ];
        this.earnedMedals = this.allMedals.filter((medal) => medal.earned);
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
        if (!date)
          return "";
        const d = new Date(date);
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "medals-container" }, [
      vue.createCommentVNode(" 头部统计信息 "),
      vue.createElementVNode("view", { class: "stats-header" }, [
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($data.earnedMedals.length),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "已获得勋章")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($data.totalMedals - $data.earnedMedals.length),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "待获得勋章")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString(Math.round($data.earnedMedals.length / $data.totalMedals * 100)) + "%",
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "完成度")
        ])
      ]),
      vue.createCommentVNode(" 勋章类别切换 "),
      vue.createElementVNode("view", { class: "category-tabs" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.categories, (category, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: vue.normalizeClass(["category-item", { active: $data.currentCategory === index }]),
              onClick: ($event) => $options.switchCategory(index)
            }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString(category),
                1
                /* TEXT */
              )
            ], 10, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 勋章网格 "),
      vue.createElementVNode("view", { class: "medals-grid" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($options.filteredMedals, (medal, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "medal-item",
              key: index,
              onClick: ($event) => $options.showMedalDetail(medal)
            }, [
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["medal-image-container", { "locked": !medal.earned }])
                },
                [
                  vue.createElementVNode("image", {
                    class: "medal-image",
                    src: medal.earned ? medal.imageUrl : medal.lockedImageUrl,
                    mode: "aspectFit"
                  }, null, 8, ["src"]),
                  !medal.earned ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "medal-lock"
                  }, [
                    vue.createElementVNode("text", { class: "iconfont icon-lock" })
                  ])) : vue.createCommentVNode("v-if", true)
                ],
                2
                /* CLASS */
              ),
              vue.createElementVNode(
                "text",
                { class: "medal-name" },
                vue.toDisplayString(medal.name),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "medal-status" },
                vue.toDisplayString(medal.earned ? "已获得" : "未获得"),
                1
                /* TEXT */
              )
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 空状态 "),
      $options.filteredMedals.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "empty-state"
      }, [
        vue.createElementVNode("image", {
          class: "empty-image",
          src: _imports_0$1,
          mode: "aspectFit"
        }),
        vue.createElementVNode(
          "text",
          { class: "empty-text" },
          "暂无" + vue.toDisplayString($data.categories[$data.currentCategory]) + "类勋章",
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 勋章详情弹窗 "),
      $data.selectedMedal ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "medal-detail-modal"
      }, [
        vue.createElementVNode("view", { class: "modal-content" }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode("text", { class: "modal-title" }, "勋章详情"),
            vue.createElementVNode("text", {
              class: "close-btn",
              onClick: _cache[0] || (_cache[0] = ($event) => $data.selectedMedal = null)
            }, "×")
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            vue.createElementVNode("view", { class: "medal-detail-image" }, [
              vue.createElementVNode("image", {
                src: $data.selectedMedal.earned ? $data.selectedMedal.imageUrl : $data.selectedMedal.lockedImageUrl,
                mode: "aspectFit"
              }, null, 8, ["src"])
            ]),
            vue.createElementVNode(
              "text",
              { class: "medal-detail-name" },
              vue.toDisplayString($data.selectedMedal.name),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["medal-detail-status", { "earned": $data.selectedMedal.earned }])
              },
              vue.toDisplayString($data.selectedMedal.earned ? "已获得" : "未获得"),
              3
              /* TEXT, CLASS */
            ),
            vue.createElementVNode(
              "text",
              { class: "medal-detail-description" },
              vue.toDisplayString($data.selectedMedal.description),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "medal-requirement" }, [
              vue.createElementVNode("text", { class: "requirement-title" }, "获取条件:"),
              vue.createElementVNode(
                "text",
                { class: "requirement-content" },
                vue.toDisplayString($data.selectedMedal.requirement),
                1
                /* TEXT */
              )
            ]),
            $data.selectedMedal.earned && $data.selectedMedal.earnedDate ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "medal-earned-date"
            }, [
              vue.createElementVNode("text", { class: "earned-date-title" }, "获得时间:"),
              vue.createElementVNode(
                "text",
                { class: "earned-date-content" },
                vue.toDisplayString($options.formatDate($data.selectedMedal.earnedDate)),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesAchievementsMedals = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__file", "D:/zhouenjun/men-grow/men_app/pages/achievements/medals.vue"]]);
  const getUser = (id) => {
    return request$1.get(`/users/${id}`);
  };
  const updateUser = (id, data) => {
    return request$1.put(`/users/${id}`, data);
  };
  const updateCurrentUser = (data) => {
    const userInfo = uni.getStorageSync("userInfo");
    if (!userInfo || !userInfo._id) {
      return Promise.reject(new Error("未获取到当前用户信息"));
    }
    return updateUser(userInfo._id, data);
  };
  const _sfc_main$4 = {
    data() {
      return {
        userInfo: {},
        trainingStats: {
          daysCount: 0,
          totalSessions: 0,
          totalDuration: 0
        }
      };
    },
    onShow() {
      this.loadUserProfile();
      this.loadTrainingStats();
    },
    methods: {
      // 加载用户资料
      loadUserProfile() {
        const userInfo = uni.getStorageSync("userInfo");
        if (userInfo) {
          this.userInfo = userInfo;
          formatAppLog("log", "at pages/profile/profile.vue:90", "从本地加载用户资料:", this.userInfo);
          return;
        }
        const storeUser = store.getState().userInfo;
        if (storeUser) {
          this.userInfo = storeUser;
          formatAppLog("log", "at pages/profile/profile.vue:98", "从store加载用户资料:", this.userInfo);
          return;
        }
        const userId = storeUser == null ? void 0 : storeUser._id;
        if (userId) {
          getUser(userId).then((res) => {
            if (res) {
              this.userInfo = res;
              uni.setStorageSync("userInfo", res);
              formatAppLog("log", "at pages/profile/profile.vue:110", "从API加载用户资料:", this.userInfo);
            } else {
              this.useDefaultUserInfo();
            }
          }).catch((err) => {
            formatAppLog("error", "at pages/profile/profile.vue:115", "获取用户资料失败:", err);
            this.useDefaultUserInfo();
            uni.showToast({
              title: "获取用户资料失败",
              icon: "none"
            });
          });
        } else {
          this.useDefaultUserInfo();
        }
      },
      // 使用默认用户信息
      useDefaultUserInfo() {
        const userInfo = getUserInfoFromStorage() || {
          nickname: "战士",
          avatar: "",
          userRank: "新兵"
        };
        this.userInfo = userInfo;
        formatAppLog("log", "at pages/profile/profile.vue:135", "使用默认用户资料");
      },
      // 加载训练统计数据
      loadTrainingStats() {
        this.trainingStats = {
          daysCount: 42,
          totalSessions: 87,
          totalDuration: 57600
          // 总训练时长（秒）
        };
      },
      // 获取军衔等级文字
      getUserRankText(rank) {
        if (!rank) {
          return "新兵";
        }
        const rankMap = {
          "new_recruit": "新兵",
          "veteran": "老兵",
          "special_force": "特种兵"
        };
        return rankMap[rank] || rank;
      },
      // 格式化时长
      formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        return `${hours}小时`;
      },
      // 页面导航
      navigateTo(url) {
        uni.navigateTo({
          url
        });
      },
      // 处理意见反馈
      handleFeedback() {
        uni.showToast({
          title: "反馈功能开发中",
          icon: "none"
        });
      },
      // 关于我们
      handleAbout() {
        uni.showModal({
          title: "关于铁炼计划",
          content: "铁炼计划是一款专为军人设计的健身训练应用，旨在提高军人身体素质和战斗力。版本号: v1.0.0",
          showCancel: false
        });
      },
      // 页面导航
      navigateTo(url) {
        uni.navigateTo({
          url
        });
      },
      // 退出登录
      logout() {
        uni.showModal({
          title: "提示",
          content: "确认退出登录？",
          success: (res) => {
            if (res.confirm) {
              store.logout();
              uni.reLaunch({
                url: "/pages/login/login"
              });
            }
          }
        });
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "profile-container" }, [
      vue.createCommentVNode(" 顶部个人信息卡片 "),
      vue.createElementVNode("view", { class: "profile-header" }, [
        vue.createElementVNode("view", { class: "avatar-container" }, [
          vue.createElementVNode("image", {
            class: "avatar",
            src: $data.userInfo.avatar || "/static/avatar.png",
            mode: "aspectFill"
          }, null, 8, ["src"]),
          vue.createElementVNode(
            "view",
            { class: "user-type" },
            vue.toDisplayString($options.getUserRankText($data.userInfo.userRank)),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "user-info" }, [
          vue.createElementVNode(
            "text",
            { class: "nickname" },
            vue.toDisplayString($data.userInfo.nickname || "未设置昵称"),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "username" },
            "账号: " + vue.toDisplayString($data.userInfo.username),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "training-stats" }, [
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($data.trainingStats.daysCount),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "训练天数")
            ]),
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($data.trainingStats.totalSessions),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "训练次数")
            ]),
            vue.createElementVNode("view", { class: "stat-item" }, [
              vue.createElementVNode(
                "text",
                { class: "stat-value" },
                vue.toDisplayString($options.formatDuration($data.trainingStats.totalDuration)),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "stat-label" }, "总时长")
            ])
          ])
        ])
      ]),
      vue.createCommentVNode(" 功能菜单 "),
      vue.createElementVNode("view", { class: "menu-section" }, [
        vue.createElementVNode("view", { class: "menu-header" }, [
          vue.createElementVNode("text", { class: "menu-title" }, "个人中心")
        ]),
        vue.createElementVNode("view", { class: "menu-list" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[0] || (_cache[0] = ($event) => $options.navigateTo("/pages/profile/edit-profile"))
          }, [
            vue.createElementVNode("text", { class: "menu-text" }, "编辑资料"),
            vue.createElementVNode("text", { class: "arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[1] || (_cache[1] = ($event) => $options.navigateTo("/pages/settings/settings"))
          }, [
            vue.createElementVNode("text", { class: "menu-text" }, "设置"),
            vue.createElementVNode("text", { class: "arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[2] || (_cache[2] = ($event) => $options.handleFeedback())
          }, [
            vue.createElementVNode("text", { class: "menu-text" }, "意见反馈"),
            vue.createElementVNode("text", { class: "arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[3] || (_cache[3] = ($event) => $options.handleAbout())
          }, [
            vue.createElementVNode("text", { class: "menu-text" }, "关于我们"),
            vue.createElementVNode("text", { class: "arrow" }, ">")
          ])
        ])
      ]),
      vue.createCommentVNode(" 退出登录按钮 "),
      vue.createElementVNode("view", { class: "logout-container" }, [
        vue.createElementVNode("button", {
          class: "logout-btn",
          onClick: _cache[4] || (_cache[4] = (...args) => $options.logout && $options.logout(...args))
        }, "退出登录")
      ])
    ]);
  }
  const PagesProfileProfile = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__file", "D:/zhouenjun/men-grow/men_app/pages/profile/profile.vue"]]);
  const _sfc_main$3 = {
    data() {
      return {
        formData: {
          nickname: "",
          avatar: "",
          bio: ""
        },
        userRank: "新兵",
        loading: false
      };
    },
    onLoad() {
      this.loadUserData();
    },
    methods: {
      // 加载用户数据
      loadUserData() {
        const localUserInfo = uni.getStorageSync("userInfo");
        if (localUserInfo) {
          formatAppLog("log", "at pages/profile/edit-profile.vue:61", "编辑页从本地存储加载用户数据:", localUserInfo);
          this.formData = {
            nickname: localUserInfo.nickname || "",
            avatar: localUserInfo.avatar || "",
            soldierType: localUserInfo.soldierType || "",
            bio: localUserInfo.bio || ""
          };
          const index = this.soldierTypeOptions.findIndex((item) => item === this.formData.soldierType);
          this.soldierTypeIndex = index >= 0 ? index : 0;
          return;
        }
        const userState = store.getState();
        const storeUserInfo = userState.userInfo;
        if (storeUserInfo) {
          formatAppLog("log", "at pages/profile/edit-profile.vue:82", "编辑页从store获取用户数据:", storeUserInfo);
          this.formData = {
            nickname: storeUserInfo.nickname || "",
            avatar: storeUserInfo.avatar || "",
            soldierType: storeUserInfo.soldierType || "",
            bio: storeUserInfo.bio || ""
          };
          const index = this.soldierTypeOptions.findIndex((item) => item === this.formData.soldierType);
          this.soldierTypeIndex = index >= 0 ? index : 0;
          return;
        }
        const userId = storeUserInfo == null ? void 0 : storeUserInfo._id;
        if (userId) {
          this.loading = true;
          getUser(userId).then((res) => {
            if (res) {
              formatAppLog("log", "at pages/profile/edit-profile.vue:103", "编辑页从API获取用户数据:", res);
              this.formData = {
                nickname: res.nickname || "",
                avatar: res.avatar || "",
                bio: res.bio || ""
              };
              this.userRank = res.userRank || "新兵";
            }
          }).catch((err) => {
            formatAppLog("error", "at pages/profile/edit-profile.vue:116", "获取用户数据失败:", err);
            uni.showToast({
              title: "获取用户数据失败",
              icon: "none"
            });
          }).finally(() => {
            this.loading = false;
          });
        } else {
          uni.reLaunch({
            url: "/pages/login/login"
          });
        }
      },
      // 选择头像
      chooseAvatar() {
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            this.formData.avatar = res.tempFilePaths[0];
            uni.showToast({
              title: "头像选择成功，保存后生效",
              icon: "none"
            });
          }
        });
      },
      // 保存资料
      saveProfile() {
        if (!this.formData.nickname) {
          uni.showToast({
            title: "请输入昵称",
            icon: "none"
          });
          return;
        }
        this.loading = true;
        updateCurrentUser(this.formData).then((res) => {
          uni.showToast({
            title: "保存成功",
            icon: "success"
          });
          const userState = store.getState();
          if (userState.userInfo) {
            const updatedUser = {
              ...userState.userInfo,
              nickname: this.formData.nickname,
              avatar: this.formData.avatar,
              bio: this.formData.bio,
              // 保持原有军衔等级，因为这是系统根据训练情况自动计算的
              userRank: userState.userInfo.userRank || "新兵"
            };
            formatAppLog("log", "at pages/profile/edit-profile.vue:189", "保存用户信息到store和本地存储:", updatedUser);
            store.setState({
              userInfo: updatedUser
            });
            uni.setStorageSync("userInfo", updatedUser);
          }
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }).catch((err) => {
          formatAppLog("error", "at pages/profile/edit-profile.vue:206", "保存失败:", err);
          uni.showToast({
            title: err.message || "保存失败",
            icon: "none"
          });
        }).finally(() => {
          this.loading = false;
        });
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "edit-profile-container" }, [
      vue.createElementVNode("view", { class: "form-section" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "头像"),
          vue.createElementVNode("view", {
            class: "avatar-uploader",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.chooseAvatar && $options.chooseAvatar(...args))
          }, [
            vue.createElementVNode("image", {
              class: "avatar",
              src: $data.formData.avatar || "/static/avatar.png",
              mode: "aspectFill"
            }, null, 8, ["src"]),
            vue.createElementVNode("text", { class: "upload-text" }, "点击更换")
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "昵称"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "form-input",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.formData.nickname = $event),
              placeholder: "请输入昵称"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.formData.nickname]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "军衔等级"),
          vue.createElementVNode("view", { class: "rank-display" }, [
            vue.createElementVNode(
              "text",
              null,
              vue.toDisplayString($data.userRank),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "rank-note" }, "(根据训练量和成就自动计算)")
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "个人简介"),
          vue.withDirectives(vue.createElementVNode(
            "textarea",
            {
              class: "form-textarea",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.formData.bio = $event),
              placeholder: "请输入个人简介"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.formData.bio]
          ])
        ])
      ]),
      vue.createElementVNode("button", {
        class: "submit-button",
        onClick: _cache[3] || (_cache[3] = (...args) => $options.saveProfile && $options.saveProfile(...args)),
        loading: $data.loading
      }, "保存", 8, ["loading"])
    ]);
  }
  const PagesProfileEditProfile = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__file", "D:/zhouenjun/men-grow/men_app/pages/profile/edit-profile.vue"]]);
  const _sfc_main$2 = {
    data() {
      return {
        // 账号设置
        phoneNumber: "138****6789",
        // 训练设置
        trainingReminder: true,
        reminderTime: "19:00",
        restDays: [0, 6],
        // 星期日、星期六
        // 应用设置
        soundEnabled: true,
        vibrationEnabled: true,
        cacheSize: "8.5MB",
        // 关于
        appVersion: "v1.0.0",
        // 时间选择器
        timePickerValue: [19, 0],
        hours: Array.from({ length: 24 }, (_, i) => i),
        minutes: Array.from({ length: 60 }, (_, i) => i),
        tempTimeValue: [19, 0]
      };
    },
    computed: {
      restDaysText() {
        const dayNames = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
        return this.restDays.map((day) => dayNames[day]).join("、");
      }
    },
    onLoad() {
      this.loadSettings();
    },
    methods: {
      // 加载设置
      loadSettings() {
        const savedSettings = uni.getStorageSync("appSettings");
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          this.trainingReminder = settings.trainingReminder !== void 0 ? settings.trainingReminder : true;
          this.reminderTime = settings.reminderTime || "19:00";
          this.restDays = settings.restDays || [0, 6];
          this.soundEnabled = settings.soundEnabled !== void 0 ? settings.soundEnabled : true;
          this.vibrationEnabled = settings.vibrationEnabled !== void 0 ? settings.vibrationEnabled : true;
          const [hours, minutes] = this.reminderTime.split(":").map(Number);
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
        uni.setStorageSync("appSettings", JSON.stringify(settings));
        uni.showToast({
          title: "设置已保存",
          icon: "success"
        });
      },
      // 页面导航
      navigateTo(url) {
        uni.showToast({
          title: "功能开发中",
          icon: "none"
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
          title: "正在清理...",
          mask: true
        });
        setTimeout(() => {
          uni.hideLoading();
          this.cacheSize = "0B";
          uni.showToast({
            title: "缓存已清理",
            icon: "success"
          });
        }, 1500);
      },
      // 检查更新
      checkUpdate() {
        uni.showLoading({
          title: "检查更新中...",
          mask: true
        });
        setTimeout(() => {
          uni.hideLoading();
          uni.showModal({
            title: "检查更新",
            content: "当前已是最新版本",
            showCancel: false
          });
        }, 1500);
      },
      // 显示时间选择器
      showTimePicker() {
        const [hours, minutes] = this.reminderTime.split(":").map(Number);
        this.tempTimeValue = [hours, minutes];
        this.timePickerValue = [hours, minutes];
        this.$refs.timePopup.open();
      },
      // 取消时间选择
      cancelTimePicker() {
        this.$refs.timePopup.close();
      },
      // 确认时间选择
      confirmTimePicker() {
        const [hour, minute] = this.tempTimeValue;
        this.reminderTime = `${hour < 10 ? "0" + hour : hour}:${minute < 10 ? "0" + minute : minute}`;
        this.saveSettings();
        this.$refs.timePopup.close();
      },
      // 时间选择器变化事件
      onTimePickerChange(e) {
        this.tempTimeValue = e.detail.value;
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_popup = vue.resolveComponent("uni-popup");
    return vue.openBlock(), vue.createElementBlock("view", { class: "settings-container" }, [
      vue.createCommentVNode(" 设置选项列表 "),
      vue.createElementVNode("view", { class: "settings-section" }, [
        vue.createElementVNode("view", { class: "settings-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "账号设置")
        ]),
        vue.createElementVNode("view", { class: "settings-list" }, [
          vue.createElementVNode("view", {
            class: "settings-item",
            onClick: _cache[0] || (_cache[0] = ($event) => $options.navigateTo("/pages/settings/change-password"))
          }, [
            vue.createElementVNode("text", { class: "item-text" }, "修改密码"),
            vue.createElementVNode("text", { class: "item-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "settings-item",
            onClick: _cache[1] || (_cache[1] = ($event) => $options.navigateTo("/pages/settings/bind-phone"))
          }, [
            vue.createElementVNode("text", { class: "item-text" }, "绑定手机"),
            vue.createElementVNode(
              "text",
              { class: "item-value" },
              vue.toDisplayString($data.phoneNumber || "未绑定"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "item-arrow" }, ">")
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "settings-section" }, [
        vue.createElementVNode("view", { class: "settings-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "训练设置")
        ]),
        vue.createElementVNode("view", { class: "settings-list" }, [
          vue.createElementVNode("view", { class: "settings-item" }, [
            vue.createElementVNode("text", { class: "item-text" }, "训练提醒"),
            vue.createElementVNode("switch", {
              checked: $data.trainingReminder,
              onChange: _cache[2] || (_cache[2] = (...args) => $options.toggleTrainingReminder && $options.toggleTrainingReminder(...args)),
              color: "#3F8463",
              style: { "transform": "scale(0.8)" }
            }, null, 40, ["checked"])
          ]),
          vue.createElementVNode("view", {
            class: "settings-item",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.showTimePicker && $options.showTimePicker(...args))
          }, [
            vue.createElementVNode("text", { class: "item-text" }, "提醒时间"),
            vue.createElementVNode(
              "text",
              { class: "item-value" },
              vue.toDisplayString($data.reminderTime),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "item-arrow" }, ">")
          ]),
          vue.createElementVNode("view", { class: "settings-item" }, [
            vue.createElementVNode("text", { class: "item-text" }, "休息日设置"),
            vue.createElementVNode(
              "text",
              { class: "item-value" },
              vue.toDisplayString($options.restDaysText),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "item-arrow" }, ">")
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "settings-section" }, [
        vue.createElementVNode("view", { class: "settings-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "应用设置")
        ]),
        vue.createElementVNode("view", { class: "settings-list" }, [
          vue.createElementVNode("view", { class: "settings-item" }, [
            vue.createElementVNode("text", { class: "item-text" }, "声音提示"),
            vue.createElementVNode("switch", {
              checked: $data.soundEnabled,
              onChange: _cache[4] || (_cache[4] = (...args) => $options.toggleSound && $options.toggleSound(...args)),
              color: "#3F8463",
              style: { "transform": "scale(0.8)" }
            }, null, 40, ["checked"])
          ]),
          vue.createElementVNode("view", { class: "settings-item" }, [
            vue.createElementVNode("text", { class: "item-text" }, "震动反馈"),
            vue.createElementVNode("switch", {
              checked: $data.vibrationEnabled,
              onChange: _cache[5] || (_cache[5] = (...args) => $options.toggleVibration && $options.toggleVibration(...args)),
              color: "#3F8463",
              style: { "transform": "scale(0.8)" }
            }, null, 40, ["checked"])
          ]),
          vue.createElementVNode("view", {
            class: "settings-item",
            onClick: _cache[6] || (_cache[6] = ($event) => $options.navigateTo("/pages/settings/data-privacy"))
          }, [
            vue.createElementVNode("text", { class: "item-text" }, "数据与隐私"),
            vue.createElementVNode("text", { class: "item-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "settings-item",
            onClick: _cache[7] || (_cache[7] = (...args) => $options.clearCache && $options.clearCache(...args))
          }, [
            vue.createElementVNode("text", { class: "item-text" }, "清除缓存"),
            vue.createElementVNode(
              "text",
              { class: "item-value" },
              vue.toDisplayString($data.cacheSize),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "item-arrow" }, ">")
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "settings-section" }, [
        vue.createElementVNode("view", { class: "settings-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "关于")
        ]),
        vue.createElementVNode("view", { class: "settings-list" }, [
          vue.createElementVNode("view", {
            class: "settings-item",
            onClick: _cache[8] || (_cache[8] = (...args) => $options.checkUpdate && $options.checkUpdate(...args))
          }, [
            vue.createElementVNode("text", { class: "item-text" }, "检查更新"),
            vue.createElementVNode(
              "text",
              { class: "item-value" },
              vue.toDisplayString($data.appVersion),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "item-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "settings-item",
            onClick: _cache[9] || (_cache[9] = ($event) => $options.navigateTo("/pages/settings/about"))
          }, [
            vue.createElementVNode("text", { class: "item-text" }, "关于铁炼计划"),
            vue.createElementVNode("text", { class: "item-arrow" }, ">")
          ])
        ])
      ]),
      vue.createCommentVNode(" 弹出的时间选择器 "),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "timePopup",
          type: "bottom"
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "time-picker-container" }, [
              vue.createElementVNode("view", { class: "picker-header" }, [
                vue.createElementVNode("text", {
                  class: "cancel-btn",
                  onClick: _cache[10] || (_cache[10] = (...args) => $options.cancelTimePicker && $options.cancelTimePicker(...args))
                }, "取消"),
                vue.createElementVNode("text", { class: "title" }, "设置提醒时间"),
                vue.createElementVNode("text", {
                  class: "confirm-btn",
                  onClick: _cache[11] || (_cache[11] = (...args) => $options.confirmTimePicker && $options.confirmTimePicker(...args))
                }, "确定")
              ]),
              vue.createElementVNode("picker-view", {
                class: "time-picker",
                value: $data.timePickerValue,
                onChange: _cache[12] || (_cache[12] = (...args) => $options.onTimePickerChange && $options.onTimePickerChange(...args))
              }, [
                vue.createElementVNode("picker-view-column", null, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.hours, (hour, index) => {
                      return vue.openBlock(), vue.createElementBlock(
                        "view",
                        {
                          class: "picker-item",
                          key: "hour-" + index
                        },
                        vue.toDisplayString(hour < 10 ? "0" + hour : hour),
                        1
                        /* TEXT */
                      );
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                vue.createElementVNode("picker-view-column", null, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.minutes, (minute, index) => {
                      return vue.openBlock(), vue.createElementBlock(
                        "view",
                        {
                          class: "picker-item",
                          key: "minute-" + index
                        },
                        vue.toDisplayString(minute < 10 ? "0" + minute : minute),
                        1
                        /* TEXT */
                      );
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ], 40, ["value"])
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const PagesSettingsSettings = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__file", "D:/zhouenjun/men-grow/men_app/pages/settings/settings.vue"]]);
  const _imports_0 = "/static/logo.png";
  const _sfc_main$1 = {
    data() {
      return {
        title: "Hello"
      };
    },
    onLoad() {
    },
    methods: {}
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      vue.createElementVNode("image", {
        class: "logo",
        src: _imports_0
      }),
      vue.createElementVNode("view", { class: "text-area" }, [
        vue.createElementVNode(
          "text",
          { class: "title" },
          vue.toDisplayString($data.title),
          1
          /* TEXT */
        )
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "D:/zhouenjun/men-grow/men_app/pages/index/index.vue"]]);
  __definePage("pages/home/home", PagesHomeHome);
  __definePage("pages/training/exercise", PagesTrainingExercise);
  __definePage("pages/training/camp-detail", PagesTrainingCampDetail);
  __definePage("pages/training/running", PagesTrainingRunning);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/register/register", PagesRegisterRegister);
  __definePage("pages/training/plan-list", PagesTrainingPlanList);
  __definePage("pages/training/plan-detail", PagesTrainingPlanDetail);
  __definePage("pages/training/training-log", PagesTrainingTrainingLog);
  __definePage("pages/achievements/medals", PagesAchievementsMedals);
  __definePage("pages/profile/profile", PagesProfileProfile);
  __definePage("pages/profile/edit-profile", PagesProfileEditProfile);
  __definePage("pages/settings/settings", PagesSettingsSettings);
  __definePage("pages/index/index", PagesIndexIndex);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/zhouenjun/men-grow/men_app/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
