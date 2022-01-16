import { UpdateUserDto } from './../users/dto/updateUser.dto';
import {
  Body,
  Req,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  Put,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import RequestWithUser from './requestWithUser.interface';
import { LocalAuthenticationGuard } from './localAuthentication.guard';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import { ChangePasswordDto } from './dto/changePassword.dto';

@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor) //do not return password
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('log-in')
  async logIn(@Req() request: RequestWithUser) {
    const { user } = request;
    const cookie = this.authenticationService.getCookieWithJwtToken(
      user.user_id,
    );
    request.res.setHeader('Set-Cookie', cookie);
    return user;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('log-out')
  @HttpCode(200)
  async logOut(@Req() request: RequestWithUser) {
    request.res.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookieForLogOut(),
    );
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    return request.user;
  }

  @UseGuards(JwtAuthenticationGuard)
  @Put('password')
  async changePassword(
    @Body() changePasswordData: ChangePasswordDto,
    @Req() request: RequestWithUser,
  ) {
    return this.authenticationService.changePassword(
      request.user,
      changePasswordData,
    );
  }

  @UseGuards(JwtAuthenticationGuard)
  @Put('update')
  async updateInfo(
    @Body() updateUserData: UpdateUserDto,
    @Req() request: RequestWithUser,
  ) {
    return this.authenticationService.updateInfo(request.user, updateUserData);
  }
}
