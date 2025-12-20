import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserProgress, ProgressDetails } from './user-progress.entity';
import { User } from '../users/user.entity'; // Assumed path

const TOTAL_TOPICS_AVAILABLE = 48;

@Injectable()
export class UserProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private progressRepo: Repository<UserProgress>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async updateProgress(userId: number, topicId: string, data: ProgressDetails) {
    let progress = await this.progressRepo.findOne({
      where: { userId, topicId },
    });

    if (progress) {
      progress.progressData = { ...progress.progressData, ...data };
      return this.progressRepo.save(progress);
    } else {
      progress = this.progressRepo.create({
        userId,
        topicId,
        progressData: data,
      });
      return this.progressRepo.save(progress);
    }
  }

  async getAllForUser(userId: number) {
    return this.progressRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async getByTopic(userId: number, topicId: string) {
    return this.progressRepo.findOne({ where: { userId, topicId } });
  }

  // --- NEW STATS AGGREGATION ---
  async getUserProfileStats(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const progressRecords = await this.progressRepo.find({ where: { userId } });

    // 1. Calculate Account Age
    const now = new Date();
    const joinedAt = user?.createdAt ? new Date(user.createdAt) : now;
    const diffTime = Math.abs(now.getTime() - joinedAt.getTime());
    const accountAgeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 2. Aggregate Topic Stats
    let completedTopics = 0;
    let inProgressTopics = 0;
    let totalScoreAccumulator = 0; // Sum of percentages per topic
    let totalBlocksRead = 0; // Derived metric
    let lastActiveAt: Date | null = null;
    let totalSubModulesCompleted = 0; // Count of (story+theory+lab)

    progressRecords.forEach((record) => {
      const { completed, lastUpdated: updatedAt } = record.progressData;
      
      // Determine completion status
      const modulesDone = 
        (completed.story ? 1 : 0) + 
        (completed.theory ? 1 : 0) + 
        (completed.lab ? 1 : 0);
      
      totalSubModulesCompleted += modulesDone;

      // Topic Completion Logic
      if (modulesDone === 3) {
        completedTopics++;
      } else if (modulesDone > 0) {
        inProgressTopics++;
      }

      // Calculate score for this topic (0 to 100)
      const topicScore = (modulesDone / 3) * 100;
      totalScoreAccumulator += topicScore;

      // "Blocks Read" Calculation (Proxy Logic)
      // 1 Completed Theory = ~20 blocks, 1 Story = ~10 blocks
      if (completed.theory) totalBlocksRead += 20;
      if (completed.story) totalBlocksRead += 10;
      // Add achievements as blocks if needed, but this is a good proxy

      // Track last active
      const recordDate = new Date(updatedAt || record.updatedAt);
      if (!lastActiveAt || recordDate > lastActiveAt) {
        lastActiveAt = recordDate;
      }
    });

    // 3. Final Calculations
    const totalInteracted = progressRecords.length;
    const notStarted = Math.max(0, TOTAL_TOPICS_AVAILABLE - (completedTopics + inProgressTopics));
    
    // Average percent across interacted topics (avoid NaN)
    const averagePercent = totalInteracted > 0 
      ? Math.round(totalScoreAccumulator / totalInteracted) 
      : 0;

    // Global completion rate (Total completed topics vs Total Available)
    // Or strictly based on sub-modules for accuracy: 
    // (Total SubModules Done / (48 * 3)) * 100
    const globalCompletionRate = Math.round(
      (totalSubModulesCompleted / (TOTAL_TOPICS_AVAILABLE * 3)) * 100
    );

    return {
      overview: {
        account_age_days: accountAgeDays,
        last_active_at: lastActiveAt ? (lastActiveAt as Date).toISOString() : null,
        global_completion_rate: globalCompletionRate,
      },
      topics: {
        total_interacted: totalInteracted,
        completed: completedTopics,
        in_progress: inProgressTopics,
        not_started: notStarted,
        average_percent: averagePercent,
        total_blocks_read: totalBlocksRead,
      },
      chapters: {
        // Assuming "Chapters" aggregates the same data for now
        total_interacted: totalInteracted,
        average_percent: averagePercent,
        progress_breakdown: {
          total_topics_available: TOTAL_TOPICS_AVAILABLE,
          total_topics_completed: completedTopics,
          remaining_topics: TOTAL_TOPICS_AVAILABLE - completedTopics,
        },
      },
    };
  }

  // --- NEW BATCH METHOD ---
  async getBatchProgress(userId: number, topicIds: string[]) {
    if (!topicIds.length) return [];
    
    return this.progressRepo.find({
      where: {
        userId,
        topicId: In(topicIds), // Fetches all matching topics in one query
      },
    });
  }

  async getLeaderboard(limit: number = 20) {
    // 1. Fetch all progress with user relations
    // In a production app with 1M+ rows, you would use a raw SQL query or a materialized view.
    const allProgress = await this.progressRepo.find({
      relations: ['user'],
      select: {
        id: true,
        progressData: true,
        user: {
          id: true,
          email: true, 
          // Add username here if your entity has it
        }
      }
    });

    // 2. Aggregate Data by User
    const userStats = new Map<number, {
      userId: number;
      email: string;
      score: number;
      topicsCompleted: number;
      achievements: number;
      lastActive: Date;
    }>();

    allProgress.forEach(record => {
      const uid = record.user.id;
      if (!userStats.has(uid)) {
        userStats.set(uid, {
          userId: uid,
          email: record.user.email,
          score: 0,
          topicsCompleted: 0,
          achievements: 0,
          lastActive: new Date(0) // Epoch
        });
      }

      const stats = userStats.get(uid)!;
      const data = record.progressData;

      // --- Calculate Score ---
      
      // 1. Achievements (50 pts each)
      const achievementCount = data.achievements ? data.achievements.length : 0;
      stats.achievements += achievementCount;
      stats.score += (achievementCount * 50);

      // 2. Completion
      const isFullTopic = data.completed.story && data.completed.theory && data.completed.lab;
      
      if (isFullTopic) {
        stats.topicsCompleted += 1;
        stats.score += 100; // Bonus for full completion
      } else {
        // Partial points (10 pts per section)
        if (data.completed.story) stats.score += 10;
        if (data.completed.theory) stats.score += 10;
        if (data.completed.lab) stats.score += 10;
      }

      // 3. Track Recency
      const recordDate = new Date(record.updatedAt);
      if (recordDate > stats.lastActive) {
        stats.lastActive = recordDate;
      }
    });

    // 3. Convert Map to Array, Sort, and Slice
    const leaderboard = Array.from(userStats.values())
      .sort((a, b) => b.score - a.score) // Descending Order
      .slice(0, limit)
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
        // Mask email for privacy (john.doe@gmail.com -> john.doe)
        username: entry.email.split('@')[0], 
      }));

    return leaderboard;
  }
}