import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection('men-grow') private readonly mongoConnection: Connection,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  
  @Get('health')
  async checkHealth() {
    try {
      // 检查MongoDB连接状态
      const isMongoConnected = this.mongoConnection.readyState === 1;
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          database: {
            status: isMongoConnected ? 'up' : 'down',
            type: 'mongodb',
          },
          app: {
            status: 'up',
            version: process.env.npm_package_version || '0.0.1',
          },
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        message: error.message,
      };
    }
  }
}
