import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

@Entity('progress')
@Unique(['user', 'topicDocumentId'])
export class Progress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar', length: 128 })
  topicDocumentId: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  chapterDocumentId: string | null;

  @Column({ type: 'int', default: 0 })
  lastIndex: number;

  @Column({ type: 'int', default: 0 })
  totalBlocks: number;

  @Column({ type: 'int', default: 0 })
  percent: number;

  @Column({ type: 'varchar', length: 32, default: 'not_started' })
  status: ProgressStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}
