import { UserParams } from './../utils/types/userParams';
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
  Req,
} from '@nestjs/common';
import FindOneParams from 'src/utils/findOneParams';
import { UsersService } from './users.service';
import UpdateUserDto from './dto/updateUser.dto';
import CreateUserDto from './dto/createUser.dto';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import RoleGuard from './role.guard';
import Role from './role.enum';
import { get } from 'http';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import { PaginationParams } from 'src/utils/types/paginationParams';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthenticationGuard)
export default class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(RoleGuard([Role.Admin, Role.Director]))
  @Get()
  getAllUsers(
    @Query() { offset, limit, user_name, email, role, phone, dept }: UserParams,
  ) {
    return this.usersService.getAllUsers({
      offset,
      limit,
      user_name,
      email,
      role,
      phone,
      dept,
    });
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Get('employees')
  async getAllEmployees() {
    return this.usersService.getAllEmployees();
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Get(':id')
  getUserById(@Param() { id }: FindOneParams) {
    return this.usersService.getById(Number(id));
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Post()
  async createUser(@Body() { user_name, email, dept }: CreateUserDto) {
    return this.usersService.createUser(user_name, email, dept);
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Put(':id')
  async replaceUser(
    @Param() { id }: FindOneParams,
    @Body() { user_name, email, dept, password, is_active }: UpdateUserDto,
  ) {
    return this.usersService.updateUser(Number(id), {
      user_name,
      email,
      dept,
      password,
      is_active,
    });
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Delete(':id')
  async deleteUser(@Param() { id }: FindOneParams) {
    return this.usersService.deleteUser(Number(id));
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Get('employees/manager')
  async getEmployeesInDept(@Req() request: RequestWithUser) {
    const dept_id = request.user.manage.dept_id;
    return this.usersService.getEmployeesInDept(dept_id);
  }
}
