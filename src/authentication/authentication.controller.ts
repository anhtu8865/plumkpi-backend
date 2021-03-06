import { UsersService } from './../users/users.service';
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
import { CustomBadRequestException } from 'src/utils/exception/BadRequest.exception';
import { isImage } from 'src/utils/utils.file';

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
    if (!file) throw new CustomBadRequestException(`Kh??ng t??m th???y ???nh`);
    if (!isImage(file.originalname))
      throw new CustomBadRequestException(`?????nh d???ng ???nh kh??ng ph?? h???p`);
    if (file.size > 1000000)
      throw new CustomBadRequestException(`K??ch th?????c file v?????t qu?? 1MB`);

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
}
