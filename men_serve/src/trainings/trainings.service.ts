import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrainingLog, TrainingLogDocument, TrainingPlan, TrainingPlanDocument } from './schemas/training.schema';

@Injectable()
export class TrainingsService {
  constructor(
    @InjectModel(TrainingLog.name, 'men-grow') private readonly trainingLogModel: Model<TrainingLogDocument>,
    @InjectModel(TrainingPlan.name, 'men-grow') private readonly trainingPlanModel: Model<TrainingPlanDocument>,
  ) {}

  async createLog(createTrainingLogDto: any): Promise<TrainingLog> {
    const createdLog = new this.trainingLogModel(createTrainingLogDto);
    return createdLog.save();
  }

  async findLogsByUser(userId: string): Promise<TrainingLog[]> {
    return this.trainingLogModel.find({ userId }).exec();
  }

  async createPlan(createTrainingPlanDto: any): Promise<TrainingPlan> {
    const createdPlan = new this.trainingPlanModel(createTrainingPlanDto);
    return createdPlan.save();
  }

  async findAllPlans(): Promise<TrainingPlan[]> {
    return this.trainingPlanModel.find().exec();
  }

  async findOnePlan(id: string): Promise<TrainingPlan | null> {
    return this.trainingPlanModel.findOne({ id }).exec();
  }

  async updatePlan(id: string, updateTrainingPlanDto: any): Promise<TrainingPlan | null> {
    return this.trainingPlanModel
      .findOneAndUpdate({ id }, updateTrainingPlanDto, { new: true })
      .exec();
  }

  async removePlan(id: string): Promise<TrainingPlan | null> {
    return this.trainingPlanModel.findOneAndDelete({ id }).exec();
  }
}
