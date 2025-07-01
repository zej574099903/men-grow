import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TrainingsService } from './trainings.service';

@Controller('trainings')
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Post('log')
  createLog(@Body() createTrainingLogDto: any) {
    return this.trainingsService.createLog(createTrainingLogDto);
  }

  @Get('logs/:userId')
  findLogs(@Param('userId') userId: string) {
    return this.trainingsService.findLogsByUser(userId);
  }

  @Get('plans')
  findAllPlans() {
    return this.trainingsService.findAllPlans();
  }

  @Get('plans/:id')
  findOnePlan(@Param('id') id: string) {
    return this.trainingsService.findOnePlan(id);
  }

  @Post('plans')
  createPlan(@Body() createTrainingPlanDto: any) {
    return this.trainingsService.createPlan(createTrainingPlanDto);
  }

  @Put('plans/:id')
  updatePlan(@Param('id') id: string, @Body() updateTrainingPlanDto: any) {
    return this.trainingsService.updatePlan(id, updateTrainingPlanDto);
  }

  @Delete('plans/:id')
  removePlan(@Param('id') id: string) {
    return this.trainingsService.removePlan(id);
  }
}
