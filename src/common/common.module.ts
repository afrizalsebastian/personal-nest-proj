import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { redisStore } from 'cache-manager-redis-yet';
import { WinstonModule } from 'nest-winston';
import { TTL } from 'src/constants/cache';
import * as winston from 'winston';
import { ErrorFilter } from './error.filter';
import { PrismaService } from './prisma.service';
import { ValidationService } from './validation.service';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: process.env.REDIS_HOST,
            port: 6379,
          },
          username: process.env.REDIS_USERNAME,
          password: process.env.REDIS_PASSWORD,
          database: 0,
          ttl: TTL,
        });

        return {
          store: store as unknown as CacheStore,
          ttl: TTL,
        };
      },
    }),
  ],
  providers: [
    PrismaService,
    ValidationService,
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
  ],
  exports: [PrismaService, ValidationService],
})
export class CommonModule {}
