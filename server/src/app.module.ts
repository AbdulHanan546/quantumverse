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
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: config.get<string>('DB_SYNC') === 'true',

        ssl: {
          rejectUnauthorized: false, // required for Neon
        },

        retryAttempts: 3,
      }),
    }),

    UsersModule,
    AuthModule,
    ProgressModule,
    UserProgressModule,
    GenerationModule,
  ],
})
export class AppModule {}
