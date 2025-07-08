import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CampStatsDocument = CampStats & Document;

@Schema({
  timestamps: true,
})
export class CampStats {
  @Prop({ required: true })
  userId: string;

  @Prop({ default: 'new_recruit' })
  userRank: string; // 'new_recruit', 'veteran', 'special_force'

  // 新兵营训练数据
  @Prop({ default: 0 })
  pushups: number; // 俯卧撑完成次数

  @Prop({ default: 0 })
  situps: number; // 卷腹完成次数

  @Prop({ default: 0 })
  squats: number; // 深蹲完成次数

  @Prop({ default: 0 })
  runningCompleted: number; // 3公里完成次数

  @Prop({ default: 0 })
  bestRunningTime: number; // 最佳3公里时间（秒）

  @Prop({ default: false })
  examCompleted: boolean; // 是否完成考核

  // 老兵营训练数据
  @Prop({ default: false })
  veteranUnlocked: boolean;

  // 特种兵营训练数据
  @Prop({ default: false })
  specialForceUnlocked: boolean;
}

export const CampStatsSchema = SchemaFactory.createForClass(CampStats);
