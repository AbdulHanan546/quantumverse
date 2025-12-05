import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('chapter_progress')
@Unique(['user', 'chapterDocumentId'])
export class ChapterProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar', length: 128 })
  chapterDocumentId: string;

  @Column({ type: 'int', default: 0 })
  totalTopics: number;

  @Column({ type: 'int', default: 0 })
  completedTopics: number;

  @Column({ type: 'int', default: 0 })
  averagePercent: number; // 0..100

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
