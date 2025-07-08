import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TrainingPlan } from '../../trainings/schemas/training.schema';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, unique: true })
  username: string;
  
  @Prop({ required: false, unique: true })
  phone: string;

  @Prop()
  nickname: string;

  @Prop({ enum: ['战士', '侦察兵-80s', '炮兵-90s', '装甲兵-00s'] })
  soldierType: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'TrainingPlan' })
  currentTrainingPlan: TrainingPlan;
}

export const UserSchema = SchemaFactory.createForClass(User);
