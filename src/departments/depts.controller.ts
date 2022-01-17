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
} from '@nestjs/common';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import Role from 'src/users/role.enum';
import RoleGuard from 'src/users/role.guard';
import FindOneParams from 'src/utils/findOneParams';
import DeptsService from './depts.service';
import CreateDeptDto from './dto/createDept.dto';
import UpdateDeptDto from './dto/updateDept.dto';

@Controller('depts')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(RoleGuard(Role.Admin))
@UseGuards(JwtAuthenticationGuard)
export default class DeptsController {
  constructor(private readonly deptsService: DeptsService) {}

  @Get()
  getAllDepts() {
    return this.deptsService.getAllDepts();
  }

  @Get(':id')
  getDeptById(@Param() { id }: FindOneParams) {
    return this.deptsService.getDeptById(Number(id));
  }

  @Post()
  async createDept(@Body() dept: CreateDeptDto) {
    return this.deptsService.createDept(dept);
  }

  @Put(':id')
  async replaceDept(
    @Param() { id }: FindOneParams,
    @Body() dept: UpdateDeptDto,
  ) {
    return this.deptsService.updateDept(Number(id), dept);
  }

  @Delete(':id')
  async deleteDept(@Param() { id }: FindOneParams) {
    return this.deptsService.deleteDept(Number(id));
  }
}
