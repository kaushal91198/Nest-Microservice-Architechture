import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService, UserDocument } from '@app/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenPayload } from './interfaces/token-payload.interface';
import { v4 } from 'uuid';
import { LoginHistoryRepository } from './loginHistory.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly loginHistoryRepository: LoginHistoryRepository
  ) { }

  async login(user: UserDocument, request: any, response: Response) {

    const sessionId = v4()
    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
      sessionId
    };

    const { accessToken, refreshToken } = await this.setToken(tokenPayload)
    const ipAddress: string =
      request.headers["x-forwarded-for"] || request.socket.remoteAddress || "";
    const userAgent: string = request.headers["user-agent"] || "";

    await this.loginHistoryRepository.create({
      userId: user._id.toHexString(),
      sessionId,
      ipAddress,
      userAgent,
      loginTime: new Date()
    });

    response
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'), // 15 min
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'), // 7 days
      });
  }

  async getRefreshAndAccessToken(request: any, response: Response) {


    const { accessToken, refreshToken } = await this.setToken(request['user'])

    response
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'), // 15 min
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'), // 7 days
      });
  }

  async logoutFromAllDevices(request: any, response: Response) {
    const userId = request.user._id; // Use middleware to extract user


    // hkeys means we’re retrieving all the field names (keys) within this Hash — each field typically corresponds to a sessionId.
    const sessions = await this.redisService.getClient().hkeys(`sessions:${userId}`);

    // We create a pipeline with Redis to perform multiple operations efficiently in a batch.
    const pipeline = this.redisService.getClient().pipeline();

    // We delete its associated refresh token from Redis.
    sessions.forEach(sessionId => {
      pipeline.del(`refresh:${userId}:${sessionId}`);
    });

    // After adding all delete commands to the pipeline, we delete the main sessions:userId Hash itself.
    pipeline.del(`sessions:${userId}`);
    await pipeline.exec();

    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return true
  }

  async logout(request: any, response: Response) {
    const refreshToken = request.cookies?.accessToken
    if (!refreshToken) return false

    try {
      const decoded = this.jwtService.verify(refreshToken, this.configService.get('JWT_SECRET'));
      const { userId, sessionId } = decoded;

      await this.redisService.del(`refresh:${userId}:${sessionId}`);
      await this.redisService.getClient().hdel(`sessions:${userId}`, sessionId);

      response.clearCookie('accessToken');
      response.clearCookie('refreshToken');
      return true
    } catch (err) {
      return response.sendStatus(403);
    }
  }

  async setToken(tokenPayload: TokenPayload) {
    const accessToken = await this.generateToken(tokenPayload, (this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION')));
    const refreshToken = await this.generateToken(tokenPayload, this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'));

    const redisKey = `refresh:${tokenPayload.userId}:${tokenPayload.sessionId}`;
    await this.redisService.set(redisKey, refreshToken, this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION')); // 7 days
    await this.redisService.hset(`sessions:${tokenPayload.userId}`, tokenPayload.sessionId, Date.now());
    return { accessToken, refreshToken }
  }


  async generateToken(payload: TokenPayload, expiresIn: string) {
    return this.jwtService.sign(payload, { expiresIn });
  }
}

