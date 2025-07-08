import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// 考核数据
export class ExamStats {
  @Prop({ default: false })
  completed: boolean;

  @Prop({ default: 0 })
  examTime: number;

  @Prop({ default: '' })
  grade: string;
}

// 训练数据
export class TrainingData {
  @Prop({ default: 0 })
  pushups: number;

  @Prop({ default: 0 })
  situps: number;

  @Prop({ default: 0 })
  squats: number;

  @Prop({ default: 0 })
  runningCompleted: number;

  @Prop({ default: 0 })
  bestRunningTime: number;
}

@Schema()
export class CampDetail extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: ['rookie', 'veteran', 'special'] })
  campType: string;

  @Prop()
  trainingData: TrainingData;

  @Prop()
  examStats: ExamStats;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CampDetailSchema = SchemaFactory.createForClass(CampDetail);
