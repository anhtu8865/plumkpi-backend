import { UsersService } from './../users/users.service';
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
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import RequestWithUser from './requestWithUser.interface';
import { LocalAuthenticationGuard } from './localAuthentication.guard';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import UpdateInfoDto from 'src/users/dto/updateInfo.dto';
import { time } from 'console';

@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor) //do not return password
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly usersService: UsersService,
  ) {}

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
    @Body() { user_name, email, phone, gender, address, dob }: UpdateInfoDto,
    @Req() request: RequestWithUser,
  ) {
    return this.authenticationService.updateInfo(request.user, {
      user_name,
      email,
      phone,
      gender,
      address,
      dob,
    });
  }

  @Post('avatar')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(
    @Req() request: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.addAvatar(
      request.user.user_id,
      file.buffer,
      file.originalname,
    );
  }

  @Delete('avatar')
  @UseGuards(JwtAuthenticationGuard)
  async deleteAvatar(@Req() request: RequestWithUser) {
    return this.usersService.deleteAvatar(request.user.user_id);
  }

  @Post('adminAndDirector')
  async createAdminAndDirector() {
    return this.usersService.createAdminAndDirector();
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('time')
  async getTime() {
    return this.usersService.getTime();
  }

  @UseGuards(JwtAuthenticationGuard)
  @Put('time')
  async updateTime(@Body() { time }) {
    return this.usersService.updateTime(time);
  }
}
