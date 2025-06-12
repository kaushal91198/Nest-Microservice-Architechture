import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService, UserDocument } from '@app/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenPayload } from './interfaces/token-payload.interface';
import { v4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService
  ) { }

  async login(user: UserDocument, response: Response) {

    // const expires = new Date();
    // expires.setSeconds(
    //   expires.getSeconds() + this.configService.get('JWT_EXPIRATION'),
    // );

    // const token = this.jwtService.sign(tokenPayload);

    // response.cookie('Authentication', token, {
    //   httpOnly: true,
    //   expires,
    // });
    const sessionId = v4()
    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
      sessionId
    };

    const { accessToken, refreshToken } = await this.setToken(tokenPayload)

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

