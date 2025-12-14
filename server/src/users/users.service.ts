import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

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

  sanitize(user: User) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}