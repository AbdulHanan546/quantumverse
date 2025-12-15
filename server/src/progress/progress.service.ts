import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progress } from './progress.entity';
import { ChapterProgress } from './chapter-progress.entity';
import { StartProgressDto } from './dto/start-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress) private readonly repo: Repository<Progress>,
    @InjectRepository(ChapterProgress) private readonly chapterRepo: Repository<ChapterProgress>,
    private readonly usersService: UsersService,
  ) { }

  async getAllForUser(userId: number) {
    return this.repo.find({ where: { user: { id: userId } } });
  }

  async getForUserAndTopic(userId: number, topicDocumentId: string) {
    return this.repo.findOne({ where: { user: { id: userId }, topicDocumentId } });
  }

  private computePercent(lastIndex: number, totalBlocks: number) {
    if (!totalBlocks || totalBlocks <= 0) return 0;
    const raw = Math.round((Math.min(lastIndex, totalBlocks) / totalBlocks) * 100);
    return Math.max(0, Math.min(100, raw));
  }

  async start(userId: number, dto: StartProgressDto) {
    const user = await this.usersService.findById(userId);

    await this.repo.upsert(
      {
        user,
        topicDocumentId: dto.topicDocumentId,
        chapterDocumentId: dto.chapterDocumentId ?? null,
        lastIndex: 0,
        totalBlocks: dto.totalBlocks,
        percent: this.computePercent(0, dto.totalBlocks),
        status: dto.totalBlocks > 0 ? 'in_progress' : 'not_started',
        completedAt: null,
      },
      {
        conflictPaths: ['user', 'topicDocumentId'],
      },
    );

    const saved = await this.getForUserAndTopic(userId, dto.topicDocumentId);

    if (saved?.chapterDocumentId) {
      await this.recomputeChapter(userId, saved.chapterDocumentId);
    }

    return saved;
  }


  async update(userId: number, topicDocumentId: string, patch: UpdateProgressDto) {
    const row = await this.getForUserAndTopic(userId, topicDocumentId);
    if (!row) throw new NotFoundException('Progress not found');

    if (typeof patch.totalBlocks === 'number') {
      row.totalBlocks = patch.totalBlocks;
    }
    row.lastIndex = patch.lastIndex;
    row.percent = this.computePercent(row.lastIndex, row.totalBlocks);
    if (row.percent >= 100) {
      row.status = 'completed';
      row.completedAt = row.completedAt ?? new Date();
    } else {
      row.status = 'in_progress';
      row.completedAt = null;
    }
    const saved = await this.repo.save(row);
    if (saved.chapterDocumentId) {
      await this.recomputeChapter(userId, saved.chapterDocumentId);
    }
    return saved;
  }

  async complete(userId: number, topicDocumentId: string) {
    const row = await this.getForUserAndTopic(userId, topicDocumentId);
    if (!row) throw new NotFoundException('Progress not found');
    row.status = 'completed';
    row.percent = 100;
    row.completedAt = new Date();
    const saved = await this.repo.save(row);
    if (saved.chapterDocumentId) {
      await this.recomputeChapter(userId, saved.chapterDocumentId);
    }
    return saved;
  }

  async recomputeChapter(userId: number, chapterDocumentId: string) {
    const rows = await this.repo.find({ where: { user: { id: userId }, chapterDocumentId } });
    const totalTopics = rows.length;
    const completedTopics = rows.filter((r) => r.status === 'completed').length;
    const avg = totalTopics === 0 ? 0 : Math.round(rows.reduce((acc, r) => acc + (r.percent || 0), 0) / totalTopics);

    let cp = await this.chapterRepo.findOne({ where: { user: { id: userId }, chapterDocumentId } });
    if (!cp) {
      const user = await this.usersService.findById(userId);
      cp = this.chapterRepo.create({ user, chapterDocumentId, totalTopics, completedTopics, averagePercent: avg });
    } else {
      cp.totalTopics = totalTopics;
      cp.completedTopics = completedTopics;
      cp.averagePercent = avg;
    }
    await this.chapterRepo.save(cp);
    return cp;
  }
}
