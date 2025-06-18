import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RedisService } from '@app/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private redisService: RedisService,
        private configService: ConfigService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const refreshToken = request.cookies?.['refreshToken'];

        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token found');
        }

        try {
            const payload = await this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_SECRET'),
            });
            const storedToken = await this.redisService.get(`refresh:${payload.userId}:${payload.sessionId}`);

            if (storedToken !== refreshToken) {
                throw new UnauthorizedException('Refresh token mismatch');
            }
            request['user'] = { userId: payload.userId, sessionId: payload.sessionId }
            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}
