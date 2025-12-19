import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progress } from './progress.entity';
import { ChapterProgress } from './chapter-progress.entity';
import { StartProgressDto } from './dto/start-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/user.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Progress) private readonly repo: Repository<Progress>,
    @InjectRepository(ChapterProgress) private readonly chapterRepo: Repository<ChapterProgress>,
    private readonly usersService: UsersService,
  ) { }

  async getUserStats(userId: number) {
    // 1. Get User Creation Date for "Account Age"
    // Assuming usersService has a generic findOne or we use a repo call here. 
    // If usersService.findOne returns a promise of a User:
    const user = await this.usersService.findById(userId); 
    
    // 2. Aggregate Topic (Progress) Stats
    // We use getRawOne to retrieve calculated fields directly from the DB
    const topicStats = await this.repo
      .createQueryBuilder('p')
      .select('COUNT(p.id)', 'totalInteracted')
      .addSelect('SUM(CASE WHEN p.status = :completed THEN 1 ELSE 0 END)', 'countCompleted')
      .addSelect('SUM(CASE WHEN p.status = :inProgress THEN 1 ELSE 0 END)', 'countInProgress')
      .addSelect('SUM(CASE WHEN p.status = :notStarted THEN 1 ELSE 0 END)', 'countNotStarted')
      .addSelect('AVG(p.percent)', 'avgTopicScore')
      .addSelect('SUM(p.lastIndex)', 'totalBlocksRead') // Approximate metric of reading volume
      .addSelect('MAX(p.updatedAt)', 'lastActivity')
      .where('p.userId = :userId', { 
        userId, 
        completed: 'completed', 
        inProgress: 'in_progress',
        notStarted: 'not_started' 
      })
      .getRawOne();

    // 3. Aggregate Chapter Stats
    const chapterStats = await this.chapterRepo
      .createQueryBuilder('cp')
      .select('COUNT(cp.id)', 'totalInteracted')
      .addSelect('AVG(cp.averagePercent)', 'avgChapterScore')
      .addSelect('SUM(cp.completedTopics)', 'totalTopicsDoneInChapters')
      .addSelect('SUM(cp.totalTopics)', 'totalTopicsAvailableInChapters')
      .where('cp.userId = :userId', { userId })
      .getRawOne();

    // 4. Calculate Derived Stats
    const now = new Date();
    const joinedAt = user ? user.createdAt : new Date();
    const daysSinceJoined = Math.max(1, Math.floor((now.getTime() - joinedAt.getTime()) / (1000 * 3600 * 24)));

    // Parse values (SQL aggregates often return strings in JS)
    const topicTotal = parseInt(topicStats.totalInteracted || '0', 10);
    const topicCompleted = parseInt(topicStats.countCompleted || '0', 10);
    const topicInProgress = parseInt(topicStats.countInProgress || '0', 10);
    const avgTopicPercent = parseFloat(topicStats.avgTopicScore || '0');
    
    const chapterTotal = parseInt(chapterStats.totalInteracted || '0', 10);
    const totalTopicsInChapters = parseInt(chapterStats.totalTopicsAvailableInChapters || '0', 10);
    const finishedTopicsInChapters = parseInt(chapterStats.totalTopicsDoneInChapters || '0', 10);

    // Calculate Global Completion Rate (Total Topics Completed / Total Topics Available across active chapters)
    // Avoid division by zero
    const globalCompletionRate = totalTopicsInChapters > 0 
      ? (finishedTopicsInChapters / totalTopicsInChapters) * 100 
      : 0;

    return {
      overview: {
        account_age_days: daysSinceJoined,
        last_active_at: topicStats.lastActivity || null,
        global_completion_rate: parseFloat(globalCompletionRate.toFixed(2)),
      },
      topics: {
        total_interacted: topicTotal,
        completed: topicCompleted,
        in_progress: topicInProgress,
        not_started: parseInt(topicStats.countNotStarted || '0', 10),
        average_percent: parseFloat(avgTopicPercent.toFixed(2)),
        total_blocks_read: parseInt(topicStats.totalBlocksRead || '0', 10),
      },
      chapters: {
        total_interacted: chapterTotal,
        average_percent: parseFloat((chapterStats.avgChapterScore || 0).toString()),
        progress_breakdown: {
          total_topics_available: totalTopicsInChapters,
          total_topics_completed: finishedTopicsInChapters,
          remaining_topics: totalTopicsInChapters - finishedTopicsInChapters
        }
      }
    };
  }

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
