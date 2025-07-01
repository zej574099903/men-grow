import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type MedalRuleDocument = MedalRule & Document;

@Schema()
export class MedalRule {
  @Prop({ required: true })
  medalName: string;

  @Prop({ required: true })
  description: string;
  
  @Prop({ type: { type: String, enum: ['totalCount', 'continuousDays'], target: Number } })
  condition: {
    type: string;
    target: number;
  };

  @Prop()
  imageUrl: string;
}

export const MedalRuleSchema = SchemaFactory.createForClass(MedalRule);

export type UserAchievementDocument = UserAchievement & Document;

@Schema({
  timestamps: true,
})
export class UserAchievement {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop({ required: true })
  medalName: string;

  @Prop({ default: Date.now })
  awardedDate: Date;
}

export const UserAchievementSchema = SchemaFactory.createForClass(UserAchievement);
