import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrainingPlansSeedService } from './training-plans.seed';
import { MedalsSeedService } from './medals.seed';
import { TrainingPlan, TrainingPlanSchema } from '../trainings/schemas/training.schema';
import { MedalRule, MedalRuleSchema } from '../achievements/schemas/achievement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingPlan.name, schema: TrainingPlanSchema },
      { name: MedalRule.name, schema: MedalRuleSchema },
    ], 'men-grow'),
  ],
  providers: [TrainingPlansSeedService, MedalsSeedService],
  exports: [TrainingPlansSeedService, MedalsSeedService],
})
export class SeedModule {}
