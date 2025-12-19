import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './progress.entity';
import { ChapterProgress } from './chapter-progress.entity';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { UsersModule } from '../users/users.module';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Progress, ChapterProgress]), UsersModule],
  providers: [ProgressService],
  controllers: [ProgressController],
})
export class ProgressModule {}
