import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MedalRule, MedalRuleDocument, UserAchievement, UserAchievementDocument } from './schemas/achievement.schema';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectModel(MedalRule.name) private medalRuleModel: Model<MedalRuleDocument>,
    @InjectModel(UserAchievement.name) private userAchievementModel: Model<UserAchievementDocument>,
  ) {}

  async findAllMedals(): Promise<MedalRule[]> {
    return this.medalRuleModel.find().exec();
  }

  async findUserAchievements(userId: string): Promise<UserAchievement[]> {
    return this.userAchievementModel.find({ userId }).exec();
  }

  async createMedalRule(createMedalRuleDto: any): Promise<MedalRule> {
    const createdRule = new this.medalRuleModel(createMedalRuleDto);
    return createdRule.save();
  }

  async awardMedal(userId: string, medalName: string): Promise<UserAchievement> {
    // 检查是否已经获得过该勋章
    const existing = await this.userAchievementModel.findOne({
      userId,
      medalName,
    }).exec();

    if (existing) {
      return existing;
    }

    const achievement = new this.userAchievementModel({
      userId,
      medalName,
      awardedDate: new Date(),
    });

    return achievement.save();
  }

  async checkAchievements(userId: string): Promise<UserAchievement[]> {
    // 在实际实现中，这里需要查询用户的训练记录
    // 并根据训练记录和成就规则检查是否达成成就
    // 本示例简化处理，仅作演示
    
    const rules = await this.medalRuleModel.find().exec();
    const results: UserAchievement[] = [];
    
    // 模拟逻辑：假设用户完成了所有成就
    for (const rule of rules) {
      const achievement = await this.awardMedal(userId, rule.medalName);
      if (achievement) {
        results.push(achievement);
      }
    }
    
    return results;
  }
}
