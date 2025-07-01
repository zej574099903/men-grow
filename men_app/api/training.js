/**
 * 训练API服务
 * 处理训练计划和训练记录相关的API请求
 */

import request from '../utils/request.js';

// 训练计划相关API
/**
 * 获取所有训练计划
 * @returns {Promise<Array>} - 返回训练计划列表的Promise
 */
export const getTrainingPlans = () => {
  return request.get('/trainings/plans');
};

/**
 * 获取特定训练计划详情
 * @param {string} id - 训练计划ID
 * @returns {Promise<Object>} - 返回训练计划详情的Promise
 */
export const getTrainingPlanDetail = (id) => {
  return request.get(`/trainings/plans/${id}`);
};

/**
 * 根据类型筛选训练计划
 * @param {string} type - 训练类型
 * @returns {Promise<Array>} - 返回筛选后的训练计划列表
 */
export const getTrainingPlansByType = (type) => {
  return request.get(`/trainings/plans/type/${type}`);
};

// 训练记录相关API
/**
 * 获取用户的所有训练记录
 * @param {string} userId - 用户ID，不传则获取当前用户的训练记录
 * @returns {Promise<Array>} - 返回训练记录列表的Promise
 */
export const getUserTrainingLogs = (userId) => {
  if (userId) {
    return request.get(`/trainings/logs/user/${userId}`);
  }
  return request.get('/trainings/logs/me');
};

/**
 * 创建新的训练记录
 * @param {Object} data - 训练记录数据
 * @returns {Promise<Object>} - 返回创建的训练记录
 */
export const createTrainingLog = (data) => {
  return request.post('/trainings/logs', data);
};

/**
 * 更新训练记录
 * @param {string} id - 训练记录ID
 * @param {Object} data - 更新的训练记录数据
 * @returns {Promise<Object>} - 返回更新后的训练记录
 */
export const updateTrainingLog = (id, data) => {
  return request.put(`/trainings/logs/${id}`, data);
};

/**
 * 删除训练记录
 * @param {string} id - 训练记录ID
 * @returns {Promise<Object>} - 返回删除结果
 */
export const deleteTrainingLog = (id) => {
  return request.delete(`/trainings/logs/${id}`);
};

/**
 * 获取用户训练统计数据
 * @returns {Promise<Object>} - 返回统计数据
 */
export const getUserTrainingStats = () => {
  return request.get('/trainings/stats/me');
};
