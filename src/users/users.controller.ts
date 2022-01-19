import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
} from '@nestjs/common';
import FindOneParams from 'src/utils/findOneParams';
import { UsersService } from './users.service';
import UpdateUserDto from './dto/updateUser.dto';
import CreateUserDto from './dto/createUser.dto';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import RoleGuard from './role.guard';
import Role from './role.enum';
import { PaginationParams } from 'src/utils/types/paginationParams';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(RoleGuard(Role.Admin))
@UseGuards(JwtAuthenticationGuard)
export default class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllUsers(@Query() { offset, limit }: PaginationParams) {
    return this.usersService.getAllUsers(offset, limit);
  }

  @Get(':id')
  getUserById(@Param() { id }: FindOneParams) {
    return this.usersService.getById(Number(id));
  }

  @Post()
  async createUser(@Body() user: CreateUserDto) {
    return this.usersService.createUser(user);
  }

  @Put(':id')
  async replaceUser(
    @Param() { id }: FindOneParams,
    @Body() user: UpdateUserDto,
  ) {
    return this.usersService.updateUser(Number(id), user);
  }

  @Delete(':id')
  async deleteUser(@Param() { id }: FindOneParams) {
    return this.usersService.deleteUser(Number(id));
  }
}
