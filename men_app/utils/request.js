/**
 * 请求工具类
 * 封装uni.request方法，统一处理请求、响应和错误
 */

// 后端API基础URL
const BASE_URL = 'http://10.30.17.9:3000';

// 请求拦截器
const requestInterceptor = (config) => {
  // 添加token到请求头
  const token = uni.getStorageSync('token');
  if (token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${token}`
    };
  }
  return config;
};

// 响应拦截器
const responseInterceptor = (response) => {
  // 统一处理响应
  if (response.statusCode >= 200 && response.statusCode < 300) {
    return response.data;
  } else {
    // 处理错误响应
    const error = new Error(response.data.message || '请求失败');
    error.response = response;
    throw error;
  }
};

// 请求方法
const request = (options) => {
  // 合并默认配置和用户配置
  const config = {
    url: `${BASE_URL}${options.url}`,
    method: options.method || 'GET',
    data: options.data || {},
    header: options.header || {
      'Content-Type': 'application/json'
    },
    timeout: options.timeout || 30000
  };

  // 应用请求拦截器
  const interceptedConfig = requestInterceptor(config);

  // 返回Promise
  return new Promise((resolve, reject) => {
    uni.request({
      ...interceptedConfig,
      success: (res) => {
        try {
          const data = responseInterceptor(res);
          resolve(data);
        } catch (error) {
          // 处理HTTP错误
          if (res.statusCode === 401) {
            // 未授权，清除token并跳转到登录页
            uni.removeStorageSync('token');
            uni.removeStorageSync('userInfo');
            uni.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none'
            });
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/login/login'
              });
            }, 1500);
          } else {
            // 其他错误，显示提示信息
            uni.showToast({
              title: error.message || '请求失败',
              icon: 'none'
            });
          }
          reject(error);
        }
      },
      fail: (err) => {
        // 网络错误等
        uni.showToast({
          title: '网络请求失败，请检查网络连接',
          icon: 'none'
        });
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
};

// 导出请求方法
export default {
  get: (url, options = {}) => {
    // 处理查询参数
    let finalUrl = url;
    if (options.params) {
      const queryString = Object.entries(options.params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      finalUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
      // 删除params参数，因为已经处理到URL中
      delete options.params;
    }
    
    return request({
      url: finalUrl,
      method: 'GET',
      ...options
    });
  },
  post: (url, data, options = {}) => {
    return request({
      url,
      method: 'POST',
      data,
      ...options
    });
  },
  put: (url, data, options = {}) => {
    return request({
      url,
      method: 'PUT',
      data,
      ...options
    });
  },
  delete: (url, data, options = {}) => {
    return request({
      url,
      method: 'DELETE',
      data,
      ...options
    });
  }
};
