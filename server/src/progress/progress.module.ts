import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './progress.entity';
import { ChapterProgress } from './chapter-progress.entity';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Progress, ChapterProgress]), UsersModule],
  providers: [ProgressService],
  controllers: [ProgressController],
})
export class ProgressModule {}
