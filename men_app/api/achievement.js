/**
 * 成就系统API服务
 * 处理勋章和成就相关的API请求
 */

import request from '../utils/request.js';

/**
 * 获取所有勋章规则
 * @returns {Promise<Array>} - 返回勋章规则列表的Promise
 */
export const getMedalRules = () => {
  return request.get('/achievements/medals/rules');
};

/**
 * 获取用户的所有勋章
 * @param {string} userId - 用户ID，不传则获取当前用户的勋章
 * @returns {Promise<Array>} - 返回用户勋章列表的Promise
 */
export const getUserMedals = (userId) => {
  // 如果没有提供userId，则从store获取当前登录用户的ID
  if (!userId) {
    const store = uni.getStorageSync('user-store') || {};
    userId = store.userId;
    
    // 如果用户未登录，返回空数组
    if (!userId) {
      console.warn('用户未登录，无法获取勋章');
      return Promise.resolve([]);
    }
  }
  
  // 使用已实现的后端API路由
  return request.get(`/achievements/user/${userId}`);
};

/**
 * 获取特定勋章详情
 * @param {string} id - 勋章ID
 * @returns {Promise<Object>} - 返回勋章详情的Promise
 */
export const getMedalDetail = (id) => {
  return request.get(`/achievements/medals/${id}`);
};

/**
 * 获取用户成就统计数据
 * @returns {Promise<Object>} - 返回统计数据
 */
export const getUserAchievementStats = () => {
  return request.get('/achievements/stats/me');
};

/**
 * 获取勋章排行榜
 * @param {string} medalId - 勋章ID
 * @returns {Promise<Array>} - 返回排行榜数据
 */
export const getMedalLeaderboard = (medalId) => {
  return request.get(`/achievements/leaderboard/medal/${medalId}`);
};

/**
 * 获取总成就排行榜
 * @returns {Promise<Array>} - 返回总成就排行榜数据
 */
export const getOverallLeaderboard = () => {
  return request.get('/achievements/leaderboard/overall');
};
