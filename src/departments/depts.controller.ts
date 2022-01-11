import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import DeptsService from './depts.service';
import CreateDeptDto from './dto/createDept.dto';
import UpdateDeptDto from './dto/updateDept.dto';

@Controller('depts')
export default class DeptsController {
  constructor(private readonly deptsService: DeptsService) {}

  @Get()
  getAllDepts() {
    return this.deptsService.getAllDepts();
  }

  @Get(':id')
  getDeptById(@Param('id') id: string) {
    return this.deptsService.getDeptById(Number(id));
  }

  @Post()
  async createDept(@Body() dept: CreateDeptDto) {
    return this.deptsService.createDept(dept);
  }

  @Put(':id')
  async replaceDept(@Param('id') id: string, @Body() dept: UpdateDeptDto) {
    return this.deptsService.replaceDept(Number(id), dept);
  }

  @Delete(':id')
  async deleteDept(@Param('id') id: string) {
    this.deptsService.deleteDept(Number(id));
  }
}
