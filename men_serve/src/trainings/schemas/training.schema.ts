import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type TrainingLogDocument = TrainingLog & Document;
export type TrainingPlanDocument = TrainingPlan & Document;

@Schema({
  timestamps: true,
})
export class TrainingLog {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop({ required: true })
  planId: string;

  @Prop({ required: true })
  drill: string;
  
  @Prop({ required: true })
  completed: number;
  
  @Prop()
  duration: number;

  @Prop({ default: Date.now })
  date: Date;
}

export const TrainingLogSchema = SchemaFactory.createForClass(TrainingLog);

@Schema()
export class TrainingPlan {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [{ name: String, target: Number, unit: String, video: String }] })
  drills: { name: string; target: number; unit: string; video?: string }[];
}

export const TrainingPlanSchema = SchemaFactory.createForClass(TrainingPlan);
