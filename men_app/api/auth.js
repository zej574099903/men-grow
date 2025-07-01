/**
 * 认证API服务
 * 处理登录、注册等身份验证功能
 */

import request from '../utils/request.js';

/**
 * 用户登录
 * @param {Object} data - 包含username和password的对象
 * @returns {Promise<Object>} - 返回包含token和用户信息的Promise
 */
export const login = (data) => {
  return request.post('/auth/login', data);
};

/**
 * 用户注册
 * @param {Object} data - 包含username、password等用户信息的对象
 * @returns {Promise<Object>} - 返回注册结果的Promise
 */
export const register = (data) => {
  return request.post('/auth/register', data);
};

/**
 * 获取当前用户信息
 * @returns {Promise<Object>} - 返回用户信息的Promise
 */
export const getUserProfile = () => {
  return request.get('/auth/profile');
};
