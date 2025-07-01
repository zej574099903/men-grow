import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { MedalRule, MedalRuleSchema, UserAchievement, UserAchievementSchema } from './schemas/achievement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MedalRule.name, schema: MedalRuleSchema },
      { name: UserAchievement.name, schema: UserAchievementSchema }
    ], 'men-grow')
  ],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}
