import { Command, CommandRunner } from 'nest-commander';
import { TrainingPlansSeedService } from './training-plans.seed';
import { MedalsSeedService } from './medals.seed';

@Command({ name: 'seed', description: '初始化数据库种子数据' })
export class SeedCommand extends CommandRunner {
  constructor(
    private readonly trainingPlansSeedService: TrainingPlansSeedService,
    private readonly medalsSeedService: MedalsSeedService,
  ) {
    super();
  }

  async run(): Promise<void> {
    console.log('开始初始化数据库种子数据...');
    
    try {
      await this.trainingPlansSeedService.seed();
      await this.medalsSeedService.seed();
      
      console.log('数据库种子数据初始化完成！');
    } catch (error) {
      console.error('初始化种子数据失败:', error);
    }
  }
}
