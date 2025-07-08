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

/**
 * 选择训练计划
 * @param {string} planId - 训练计划ID
 * @returns {Promise<Object>} - 返回选择结果
 */
export const selectTrainingPlan = (planId) => {
  return request.post('/trainings/plans/select', { planId });
};

/**
 * 获取当前选择的训练计划
 * @returns {Promise<Object>} - 返回当前训练计划
 */
export const getCurrentTrainingPlan = () => {
  return request.get('/trainings/plans/current');
};

/**
 * 获取用户训练营数据
 * @param {string} userId - 用户ID，不传则使用当前登录用户
 * @returns {Promise<Object>} - 返回训练营数据
 */
export const getCampStats = (userId) => {
  const params = userId ? { userId } : {};
  return request.get('/trainings/camps/stats', { params });
};

/**
 * 更新用户训练营数据
 * @param {Object} data - 训练营数据
 * @param {string} userId - 用户ID，不传则使用当前登录用户
 * @returns {Promise<Object>} - 返回更新后的训练营数据
 */
export const updateCampStats = (data, userId) => {
  const payload = { stats: data };
  if (userId) payload.userId = userId;
  return request.put('/trainings/camps/stats', payload);
};

/**
 * 获取训练营详情数据
 * @param {string} campType - 训练营类型，默认为'rookie'
 * @param {string} userId - 用户ID，不传则使用当前登录用户
 * @returns {Promise<Object>} - 返回训练营详情数据
 */
export const getCampDetail = (campType = 'rookie', userId) => {
  const params = { campType };
  if (userId) params.userId = userId;
  return request.get('/trainings/camps/detail', { params });
};

/**
 * 更新训练营详情数据
 * @param {Object} updateData - 要更新的训练营详情数据
 * @param {string} campType - 训练营类型，默认为'rookie'
 * @param {string} userId - 用户ID，不传则使用当前登录用户
 * @returns {Promise<Object>} - 返回更新后的训练营详情数据
 */
export const updateCampDetail = (updateData, campType = 'rookie', userId) => {
  const payload = { 
    updateData,
    campType
  };
  if (userId) payload.userId = userId;
  return request.put('/trainings/camps/detail', payload);
};
