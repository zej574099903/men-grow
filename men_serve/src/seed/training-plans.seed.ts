import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrainingPlan } from '../trainings/schemas/training.schema';

@Injectable()
export class TrainingPlansSeedService {
  constructor(
    @InjectModel(TrainingPlan.name)
    private readonly trainingPlanModel: Model<TrainingPlan>,
  ) {}

  async seed() {
    const count = await this.trainingPlanModel.countDocuments();
    if (count > 0) {
      console.log('训练计划种子数据已存在，跳过...');
      return;
    }

    const seedPlans = [
      {
        name: '新兵体能特训',
        description: '适合初级训练者的基础军体拳和体能锻炼',
        level: 'beginner',
        soldierType: '步兵',
        duration: 14, // 14天计划
        drills: [
          {
            day: 1,
            activities: [
              { name: '基础军姿站立', description: '保持军姿站立10分钟', duration: 10, type: 'posture' },
              { name: '俯卧撑', description: '3组，每组10个', sets: 3, reps: 10, type: 'strength' },
              { name: '开合跳', description: '3组，每组20次', sets: 3, reps: 20, type: 'cardio' }
            ]
          },
          {
            day: 2,
            activities: [
              { name: '军体拳基本姿势', description: '民用简化版，学习基本站姿和手型', duration: 15, type: 'technique' },
              { name: '仰卧起坐', description: '3组，每组15个', sets: 3, reps: 15, type: 'strength' },
              { name: '原地跑步', description: '持续10分钟', duration: 10, type: 'cardio' }
            ]
          },
          {
            day: 3,
            activities: [
              { name: '基础障碍训练', description: '模拟翻越障碍物训练', duration: 15, type: 'technique' },
              { name: '深蹲', description: '3组，每组12个', sets: 3, reps: 12, type: 'strength' },
              { name: '间歇跑', description: '1分钟冲刺，1分钟慢跑，共10分钟', duration: 10, type: 'cardio' }
            ]
          }
          // 后续日程根据实际需要扩展
        ]
      },
      {
        name: '老兵体能强化',
        description: '适合中级训练者的进阶军体拳和耐力训练',
        level: 'intermediate',
        soldierType: '通信兵',
        duration: 21, // 21天计划
        drills: [
          {
            day: 1,
            activities: [
              { name: '军体拳组合动作', description: '民用简化版，练习基本组合', duration: 20, type: 'technique' },
              { name: '负重俯卧撑', description: '背包负重，3组，每组15个', sets: 3, reps: 15, type: 'strength' },
              { name: '5公里耐力跑', description: '保持中速完成5公里', distance: 5, type: 'cardio' }
            ]
          },
          {
            day: 2,
            activities: [
              { name: '战术移动训练', description: '模拟战场移动姿势和掩体利用', duration: 25, type: 'technique' },
              { name: '引体向上', description: '5组，每组至力竭', sets: 5, reps: 'max', type: 'strength' },
              { name: '间歇冲刺', description: '30秒冲刺，30秒休息，20分钟', duration: 20, type: 'cardio' }
            ]
          }
          // 后续日程根据实际需要扩展
        ]
      },
      {
        name: '特种兵极限挑战',
        description: '高强度军事体能训练，模拟特种作战环境下的体能要求',
        level: 'advanced',
        soldierType: '特种兵',
        duration: 30, // 30天计划
        drills: [
          {
            day: 1,
            activities: [
              { name: '军体拳完整套路', description: '民用简化版，完成完整套路训练', duration: 30, type: 'technique' },
              { name: '负重深蹲', description: '背包负重20kg，5组，每组20个', sets: 5, reps: 20, weight: 20, type: 'strength' },
              { name: '障碍跑', description: '完成模拟战场障碍跑道', duration: 25, type: 'cardio' }
            ]
          },
          {
            day: 2,
            activities: [
              { name: '战术攀爬', description: '模拟墙壁和绳索攀爬', duration: 25, type: 'technique' },
              { name: '波比跳', description: '7组，每组25个', sets: 7, reps: 25, type: 'strength' },
              { name: '负重行军', description: '背包负重10kg，快速行走5公里', distance: 5, weight: 10, type: 'endurance' }
            ]
          }
          // 后续日程根据实际需要扩展
        ]
      }
    ];

    await this.trainingPlanModel.insertMany(seedPlans);
    console.log(`已添加 ${seedPlans.length} 个训练计划种子数据`);
  }
}
