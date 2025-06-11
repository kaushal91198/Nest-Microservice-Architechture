// common/redis/redis.module.ts
import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisModule as IoRedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        IoRedisModule.forRootAsync({
            useFactory: (configService: ConfigService) => {
                return {
                    type: 'single',
                    url: `${configService.get('REDIS_HOST')}://${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`
                }
            },
            inject: [ConfigService],
        }),
    ],
    providers: [RedisService],
    exports: [RedisService], // 👈 very important
})
export class RedisModule { }
