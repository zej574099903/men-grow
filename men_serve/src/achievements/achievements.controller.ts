import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AchievementsService } from './achievements.service';

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get('medals')
  findAllMedals() {
    return this.achievementsService.findAllMedals();
  }

  @Get('user/:userId')
  findUserAchievements(@Param('userId') userId: string) {
    return this.achievementsService.findUserAchievements(userId);
  }

  @Post('check/:userId')
  checkAchievements(@Param('userId') userId: string) {
    return this.achievementsService.checkAchievements(userId);
  }

  @Post('medals')
  createMedalRule(@Body() createMedalRuleDto: any) {
    return this.achievementsService.createMedalRule(createMedalRuleDto);
  }
}
