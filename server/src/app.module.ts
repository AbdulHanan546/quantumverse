import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProgressModule } from './progress/progress.module';
import { GenerationModule } from './generation/generation.module';
import { UserProgressModule } from './user-progress/user-progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL')?.trim();
        if (!url) {
          throw new Error(
            'FATAL: DATABASE_URL environment variable is missing or empty! Please add DATABASE_URL in Render Dashboard -> Environment Variables.',
          );
        }
        const isMysql = url.startsWith('mysql://') || url.startsWith('mysql2://');
        return {
          type: isMysql ? 'mysql' : 'postgres',
          url,
          autoLoadEntities: true,
          synchronize: config.get<string>('DB_SYNC') === 'true',
          ...(!isMysql ? {
            ssl: {
              rejectUnauthorized: false, // required for Neon
            }
          } : {}),
          retryAttempts: 3,
        };
      },
    }),

    UsersModule,
    AuthModule,
    ProgressModule,
    UserProgressModule,
    GenerationModule,
  ],
})
export class AppModule {}
