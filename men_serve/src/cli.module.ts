import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedModule } from './seed/seed.module';
import { SeedCommand } from './seed/seed.command';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/men-grow', {
      connectionName: 'men-grow',
    }),
    SeedModule,
  ],
  providers: [SeedCommand],
})
export class CliModule {}
