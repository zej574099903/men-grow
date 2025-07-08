import { Controller, Get, Post, Body, Param, Put, Delete, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TrainingsService } from './trainings.service';
import { CampStats } from './schemas/camp-stats.schema';

@Controller('trainings')
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  // 日志相关路由
  @Post('log')
  createLog(@Body() createTrainingLogDto: any) {
    return this.trainingsService.createLog(createTrainingLogDto);
  }

  @Get('logs/:userId')
  findLogs(@Param('userId') userId: string) {
    return this.trainingsService.findLogsByUser(userId);
  }

  // 训练计划相关路由 - 注意路由顺序很重要
  // 先定义具体路由，再定义参数路由
  
  // 1. 选择训练计划
  @Post('plans/select')
  // 临时移除JWT认证守卫进行测试
  // @UseGuards(JwtAuthGuard)
  selectTrainingPlan(@Body() body: { planId: string, userId?: string }, @Req() req) {
    console.log('选择训练计划，planId:', body.planId);
    // 优先使用请求体中的userId，其次是JWT中的userId，最后使用默认测试ID
    const userId = body.userId || req.user?.userId || 'test-user-id';
    console.log('使用的用户ID:', userId);
    return this.trainingsService.selectTrainingPlan(userId, body.planId);
  }
  
  // 2. 创建训练计划
  @Post('plans')
  createPlan(@Body() createTrainingPlanDto: any) {
    return this.trainingsService.createPlan(createTrainingPlanDto);
  }
  
  // 3. 获取当前训练计划
  @Get('plans/current')
  // 临时移除JWT认证守卫进行测试
  // @UseGuards(JwtAuthGuard)
  async getCurrentTrainingPlan(@Req() req) {
    try {
      // 优先使用查询参数中的userId，其次是JWT中的userId，最后使用默认测试ID
      const userId = req.query.userId || req.user?.userId || 'test-user-id';
      console.log('获取当前训练计划，使用的用户ID:', userId);
      const result = await this.trainingsService.getCurrentTrainingPlan(userId);
      return result;
    } catch (error) {
      console.error('获取当前训练计划出错:', error);
      return {
        success: false,
        message: error.message || '获取当前训练计划失败',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
  }
  
  // 训练营相关路由
  
  // 1. 获取用户训练营数据
  @Get('camps/stats')
  // 临时移除JWT认证守卫进行测试
  // @UseGuards(JwtAuthGuard)
  async getCampStats(@Req() req) {
    try {
      // 优先使用查询参数中的userId，其次是JWT中的userId，最后使用默认测试ID
      const userId = req.query.userId || req.user?.userId || 'test-user-id';
      console.log('获取训练营数据，使用的用户ID:', userId);
      const result = await this.trainingsService.getCampStats(userId);
      return result;
    } catch (error) {
      console.error('获取训练营数据出错:', error);
      return {
        success: false,
        message: error.message || '获取训练营数据失败',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
  }
  
  // 2. 更新用户训练营数据
  @Put('camps/stats')
  // 临时移除JWT认证守卫进行测试
  // @UseGuards(JwtAuthGuard)
  async updateCampStats(@Body() body: { userId?: string, stats: Partial<CampStats> }, @Req() req) {
    try {
      // 优先使用请求体中的userId，其次是JWT中的userId，最后使用默认测试ID
      const userId = body.userId || req.user?.userId || 'test-user-id';
      console.log('更新训练营数据，使用的用户ID:', userId);
      const result = await this.trainingsService.updateCampStats(userId, body.stats);
      return result;
    } catch (error) {
      console.error('更新训练营数据出错:', error);
      return {
        success: false,
        message: error.message || '更新训练营数据失败',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
  }
  
  // 4. 获取所有训练计划
  @Get('plans')
  findAllPlans() {
    return this.trainingsService.findAllPlans();
  }

  // 5. 获取指定训练计划
  @Get('plans/:id')
  findOnePlan(@Param('id') id: string) {
    return this.trainingsService.findOnePlan(id);
  }

  @Put('plans/:id')
  updatePlan(@Param('id') id: string, @Body() updateTrainingPlanDto: any) {
    return this.trainingsService.updatePlan(id, updateTrainingPlanDto);
  }

  @Delete('plans/:id')
  removePlan(@Param('id') id: string) {
    return this.trainingsService.removePlan(id);
  }
  
  // 训练营详情相关路由
  
  // 获取训练营详情数据
  @Get('camps/detail')
  async getCampDetail(@Req() req) {
    try {
      // 优先使用查询参数中的userId，其次是JWT中的userId，最后使用默认测试ID
      const userId = req.query.userId || req.user?.userId || 'test-user-id';
      const campType = req.query.campType || 'rookie';
      
      console.log('获取训练营详情数据，用户ID:', userId, '训练营类型:', campType);
      
      const campDetail = await this.trainingsService.getCampDetail(userId, campType);
      
      return {
        success: true,
        data: campDetail
      };
    } catch (error) {
      console.error('获取训练营详情数据失败:', error);
      return {
        success: false,
        message: error.message || '获取训练营详情数据失败',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
  }
  
  // 更新训练营详情数据
  @Put('camps/detail')
  async updateCampDetail(@Body() body: { userId?: string, campType: string, updateData: any }, @Req() req) {
    try {
      // 优先使用请求体中的userId，其次是JWT中的userId，最后使用默认测试ID
      const userId = body.userId || req.user?.userId || 'test-user-id';
      const campType = body.campType || 'rookie';
      
      console.log('更新训练营详情数据，用户ID:', userId, '训练营类型:', campType);
      
      const campDetail = await this.trainingsService.updateCampDetail(userId, campType, body.updateData);
      
      return {
        success: true,
        data: campDetail
      };
    } catch (error) {
      console.error('更新训练营详情数据失败:', error);
      return {
        success: false,
        message: error.message || '更新训练营详情数据失败',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
  }
}
