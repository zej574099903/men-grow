import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrainingsController } from './trainings.controller';
import { TrainingsService } from './trainings.service';
import { TrainingLog, TrainingLogSchema, TrainingPlan, TrainingPlanSchema } from './schemas/training.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { CampStats, CampStatsSchema } from './schemas/camp-stats.schema';
import { CampDetail, CampDetailSchema } from './models/camp-detail.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingLog.name, schema: TrainingLogSchema },
      { name: TrainingPlan.name, schema: TrainingPlanSchema },
      { name: User.name, schema: UserSchema },
      { name: CampStats.name, schema: CampStatsSchema },
      { name: CampDetail.name, schema: CampDetailSchema }
    ], 'men-grow')
  ],
  controllers: [TrainingsController],
  providers: [TrainingsService],
  exports: [TrainingsService],
})
export class TrainingsModule {}
