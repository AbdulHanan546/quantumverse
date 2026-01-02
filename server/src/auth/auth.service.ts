import { Injectable, UnauthorizedException, ConflictException, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
    ) { }

    async onModuleInit() {
        const email = this.config.get<string>('ADMIN_EMAIL');
        const password = this.config.get<string>('ADMIN_PASSWORD');
        if (email && password) {
            await this.usersService.createAdminIfNotExists(email, password);
        }
    }

    async registerStudent(dto: RegisterDto) {
        try {
            const user = await this.usersService.createUser({
                email: dto.email,
                password: dto.password,
                role: UserRole.STUDENT,
            });
            return this.issueTokenAndReturnUser(user);
        } catch (e) {
            if (e?.status === 409) {
                throw new ConflictException('Email already registered');
            }
            throw e;
        }
    }

    async registerAdmin(dto: RegisterDto) {
        try {
            const user = await this.usersService.createUser({
                email: dto.email,
                password: dto.password,
                role: UserRole.ADMIN,
            });
            return this.issueTokenAndReturnUser(user);
        } catch (e) {
            if (e?.status === 409) {
                throw new ConflictException('Email already registered');
            }
            throw e;
        }
    }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) throw new UnauthorizedException('Invalid credentials');
        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok) throw new UnauthorizedException('Invalid credentials');
        return this.issueTokenAndReturnUser(user);
    }

    private issueTokenAndReturnUser(user: User) {
        const payload = { sub: user.id, role: user.role } as const;

        const accessToken = this.jwt.sign(payload, {
            secret: this.config.get<string>('JWT_SECRET'),
            expiresIn: (this.config.get<string>('JWT_EXPIRES_IN') ?? '1d') as any,
        });

        const { passwordHash, ...safeUser } = user;
        return { accessToken, user: safeUser };
    }
}