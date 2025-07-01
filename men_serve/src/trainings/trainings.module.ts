import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrainingsController } from './trainings.controller';
import { TrainingsService } from './trainings.service';
import { TrainingLog, TrainingLogSchema, TrainingPlan, TrainingPlanSchema } from './schemas/training.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingLog.name, schema: TrainingLogSchema },
      { name: TrainingPlan.name, schema: TrainingPlanSchema }
    ])
  ],
  controllers: [TrainingsController],
  providers: [TrainingsService],
  exports: [TrainingsService],
})
export class TrainingsModule {}
