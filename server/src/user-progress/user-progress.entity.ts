import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity'; // Adjust path to your User entity

export interface ProgressDetails {
  completed: {
    story: boolean;
    theory: boolean;
    lab: boolean;
  };
  timeSpent: {
    story: number;
    theory: number;
    lab: number;
    total: number;
  };
  achievements: string[];
  lastStage: string;
  lastUpdated: string; // ISO Date string
}

@Entity('user_progress')
// Ensures a user has only one record per topic
@Unique(['user', 'topicId']) 
export class UserProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  topicId: string;

  // Stores the massive JSON blob of stats
  @Column({ type: 'json', default: {} })
  progressData: ProgressDetails;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}