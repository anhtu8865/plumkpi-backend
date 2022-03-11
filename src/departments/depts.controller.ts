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
import { get } from 'http';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import Role from 'src/users/role.enum';
import RoleGuard from 'src/users/role.guard';
import FindOneParams from 'src/utils/findOneParams';
import { PaginationParams } from 'src/utils/types/paginationParams';
import DeptsService from './depts.service';
import CreateDeptDto from './dto/createDept.dto';
import UpdateDeptDto from './dto/updateDept.dto';

@Controller('depts')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthenticationGuard)
export default class DeptsController {
  constructor(private readonly deptsService: DeptsService) {}

  @UseGuards(RoleGuard([Role.Admin]))
  @Get()
  getDepts(@Query() { offset, limit, name }: PaginationParams) {
    return this.deptsService.getDepts(offset, limit, name);
  }

  @UseGuards(RoleGuard([Role.Admin, Role.Director]))
  @Get('all')
  getAllDepts() {
    return this.deptsService.getAllDepts();
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Get('manager')
  getDeptByManager(@Req() request: RequestWithUser) {
    return this.deptsService.getDeptByManager(request.user);
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Get(':id')
  getDeptById(@Param() { id }: FindOneParams) {
    return this.deptsService.getDeptById(Number(id));
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Post()
  async createDept(@Body() { dept_name, description }: CreateDeptDto) {
    return this.deptsService.createDept(dept_name, description);
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Put(':id')
  async replaceDept(
    @Param() { id }: FindOneParams,
    @Body() { dept_name, description, manager }: UpdateDeptDto,
  ) {
    return this.deptsService.updateDept(Number(id), {
      dept_name,
      description,
      manager,
    });
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Delete(':id')
  async deleteDept(@Param() { id }: FindOneParams) {
    return this.deptsService.deleteDept(Number(id));
  }
}
