import { Controller, Get, Post, Req, Res, SetMetadata, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Response } from 'express';
import { CurrentUser, UserDocument } from '@app/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: UserDocument,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, request, response);
  }

  @Get('refresh-token')
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.getRefreshAndAccessToken(request, response);
    return response.status(200).json({ message: 'Token Generated successfully' });
  }

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(request, response);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async authStatus(
    @Req() request: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    return response.status(200).json(request?.user);
  }

  @Get('force-logout-all')
  @UseGuards(JwtAuthGuard)
  async logoutFromAllDevices(
    @Req() request: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logoutFromAllDevices(request?.user?._id);
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return response.status(200).json({ message: 'Logged out from all devices' });
  }


  @UseGuards(JwtAuthGuard)
  @MessagePattern('authenticate')
  async authenticate(@Payload() data: any) {
    return data.user;
  }
}
