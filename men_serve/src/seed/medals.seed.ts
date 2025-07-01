import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MedalRule } from '../achievements/schemas/achievement.schema';

@Injectable()
export class MedalsSeedService {
  constructor(
    @InjectModel(MedalRule.name)
    private readonly medalRuleModel: Model<MedalRule>,
  ) {}

  async seed() {
    const count = await this.medalRuleModel.countDocuments();
    if (count > 0) {
      console.log('勋章规则种子数据已存在，跳过...');
      return;
    }

    const seedMedals = [
      {
        medalName: '新兵铁人',
        description: '完成10次训练计划',
        condition: {
          type: 'totalCount',
          target: 10
        },
        imageUrl: '/assets/medals/iron-rookie.png'
      },
      {
        medalName: '钢铁意志',
        description: '连续7天完成训练',
        condition: {
          type: 'continuousDays',
          target: 7
        },
        imageUrl: '/assets/medals/iron-will.png'
      },
      {
        medalName: '百炼成钢',
        description: '累计完成50次训练',
        condition: {
          type: 'totalCount',
          target: 50
        },
        imageUrl: '/assets/medals/steel-forged.png'
      },
      {
        medalName: '坚如磐石',
        description: '连续30天完成训练',
        condition: {
          type: 'continuousDays',
          target: 30
        },
        imageUrl: '/assets/medals/rock-solid.png'
      },
      {
        medalName: '特级战士',
        description: '完成所有高级训练计划',
        condition: {
          type: 'totalCount',
          target: 3
        },
        imageUrl: '/assets/medals/elite-warrior.png'
      }
    ];

    await this.medalRuleModel.insertMany(seedMedals);
    console.log(`已添加 ${seedMedals.length} 个勋章规则种子数据`);
  }
}
