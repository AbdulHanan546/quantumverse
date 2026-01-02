import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserProgress } from '../user-progress/user-progress.entity';
import { ChapterProgress } from '../progress/chapter-progress.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    @InjectRepository(UserProgress) private readonly userProgressRepo: Repository<UserProgress>,
    @InjectRepository(ChapterProgress) private readonly chapterProgressRepo: Repository<ChapterProgress>,
  ) { }

  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.repo.create({
      email: dto.email,
      passwordHash,
      role: dto.role ?? UserRole.STUDENT,
    });
    return this.repo.save(user);
  }

  async createAdminIfNotExists(email: string, password: string): Promise<User | null> {
    if (!email || !password) return null;
    const existing = await this.repo.findOne({ where: { email } });
    if (existing) return null;
    const passwordHash = await bcrypt.hash(password, 12);
    const user = this.repo.create({ email, passwordHash, role: UserRole.ADMIN });
    const saved = await this.repo.save(user);
    // eslint-disable-next-line no-console
    console.log(`Admin user created: ${email}`);
    return saved;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async findByIdWithStats(id: number) {
    const user = await this.findById(id);

    // Aggregate stats
    const userProgress = await this.userProgressRepo.find({ where: { userId: id } });
    const chapterProgress = await this.chapterProgressRepo.find({ where: { user: { id } } });

    // Calculate core metrics
    const topicsStarted = userProgress.length;
    const topicsCompleted = userProgress.filter(up => {
      // Assume completed if all substeps are done or some other metric. 
      // Based on entity, progressData.completed has story/theory/lab boolean.
      const { story, theory, lab } = up.progressData?.completed || {};
      return story && theory && lab;
    }).length;

    // Average score across chapters
    const totalAvgPercent = chapterProgress.reduce((acc, cp) => acc + cp.averagePercent, 0);
    const globalAvg = chapterProgress.length > 0 ? Math.round(totalAvgPercent / chapterProgress.length) : 0;

    // Collect achievements
    const achievements = new Set<string>();
    userProgress.forEach(up => {
      up.progressData?.achievements?.forEach(a => achievements.add(a));
    });

    const lastActive = userProgress.length > 0
      ? userProgress.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0].updatedAt
      : user.createdAt;

    return {
      ...this.sanitize(user),
      stats: {
        topicsStarted,
        topicsCompleted,
        globalAverageScore: globalAvg,
        totalAchievements: achievements.size,
        lastActive,
        subscriptionDays: Math.floor((new Date().getTime() - user.createdAt.getTime()) / (1000 * 3600 * 24))
      }
    };
  }

  sanitize(user: User) {
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async deleteUser(id: number) {
    const user = await this.findById(id);
    return this.repo.remove(user);
  }

  async updateUser(id: number, attrs: Partial<User>) {
    const user = await this.findById(id);
    Object.assign(user, attrs);
    return this.repo.save(user);
  }
}