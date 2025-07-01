import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TrainingsModule } from './trainings/trainings.module';
import { AchievementsModule } from './achievements/achievements.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ContentFilterMiddleware } from './common/middleware/content-filter.middleware';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/men-grow', {
      connectionName: 'men-grow',
    }),
    UsersModule,
    TrainingsModule,
    AchievementsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*')
      .apply(ContentFilterMiddleware)
      .forRoutes('users', 'trainings', 'achievements');
  }
}
