/**
 * 用户API服务
 * 处理用户信息的CRUD操作
 */

import request from '../utils/request.js';

/**
 * 获取用户列表
 * @returns {Promise<Array>} - 返回用户列表的Promise
 */
export const getUsers = () => {
  return request.get('/users');
};

/**
 * 获取特定用户信息
 * @param {string} id - 用户ID
 * @returns {Promise<Object>} - 返回用户信息的Promise
 */
export const getUser = (id) => {
  return request.get(`/users/${id}`);
};

/**
 * 更新用户信息
 * @param {string} id - 用户ID
 * @param {Object} data - 更新的用户数据
 * @returns {Promise<Object>} - 返回更新后的用户信息
 */
export const updateUser = (id, data) => {
  return request.put(`/users/${id}`, data);
};

/**
 * 更新当前登录用户的信息
 * @param {Object} data - 更新的用户数据
 * @returns {Promise<Object>} - 返回更新后的用户信息
 */
export const updateCurrentUser = (data) => {
  const userInfo = uni.getStorageSync('userInfo');
  if (!userInfo || !userInfo._id) {
    return Promise.reject(new Error('未获取到当前用户信息'));
  }
  return updateUser(userInfo._id, data);
};
