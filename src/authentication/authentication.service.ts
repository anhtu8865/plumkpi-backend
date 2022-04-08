import { UpdateUserDto } from './../users/dto/updateUser.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import TokenPayload from './tokenPayload.interface';
import { ChangePasswordDto } from './dto/changePassword.dto';
import User from 'src/users/user.entity';
import { CustomBadRequestException } from 'src/utils/exception/BadRequest.exception';
import UpdateInfoDto from 'src/users/dto/updateInfo.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.usersService.getByEmail(email);
      if (!user.is_active)
        throw new CustomBadRequestException(
          `Tài khoản ${user.email} tạm thời bị khoá, vui lòng liên hệ Admin`,
        );
      await this.verifyPassword(plainTextPassword, user.password);
      user.password = undefined;
      return user;
    } catch (error) {
      throw error;
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new CustomBadRequestException(
        `Email hoặc Password không chính xác`,
      );
    }
  }

  public getCookieWithJwtToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_EXPIRATION_TIME',
    )}`;
  }

  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }

  public async changePassword(
    user: User,
    changePasswordData: ChangePasswordDto,
  ) {
    try {
      await this.verifyPassword(changePasswordData.oldPassword, user.password);
      const updateUserData: UpdateUserDto = {
        ...user,
        password: changePasswordData.newPassword,
      };
      return this.usersService.updateUser(user.user_id, updateUserData);
    } catch (error) {
      throw new CustomBadRequestException(`Password không chính xác`);
    }
  }

  public async updateInfo(user: User, data: UpdateInfoDto) {
    try {
      return this.usersService.updateInfo(user.user_id, data);
    } catch (error) {
      throw error;
    }
  }
}
