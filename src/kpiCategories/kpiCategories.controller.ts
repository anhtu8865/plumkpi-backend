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
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import FindOneParams from 'src/utils/findOneParams';
import KpiCategoriesService from './kpiCategories.service';
import CreateKpiCategoryDto from './dto/createKpiCategory.dto';
import UpdateKpiCategoryDto from './dto/updateKpiCategory.dto';
import RoleGuard from 'src/users/role.guard';
import Role from 'src/users/role.enum';
import { PaginationParams } from 'src/utils/types/paginationParams';

@Controller('kpi-categories')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthenticationGuard)
export default class KpiCategoriesController {
  constructor(private readonly kpiCategoriesService: KpiCategoriesService) {}

  @UseGuards(RoleGuard([Role.Admin, Role.Director]))
  @Get()
  getKpiCategories(@Query() { offset, limit, name }: PaginationParams) {
    return this.kpiCategoriesService.getKpiCategories(offset, limit, name);
  }

  @UseGuards(RoleGuard([Role.Admin, Role.Director]))
  @Get('all')
  async getAllKpiCategories() {
    return this.kpiCategoriesService.getAllKpiCategories();
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Get(':id')
  getKpiCategoryById(@Param() { id }: FindOneParams) {
    return this.kpiCategoriesService.getKpiCategoryById(Number(id));
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Post()
  async createKpiCategory(
    @Body() { kpi_category_name, description }: CreateKpiCategoryDto,
  ) {
    return this.kpiCategoriesService.createKpiCategory({
      kpi_category_name,
      description,
    });
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Put(':id')
  async replaceKpiCategory(
    @Param() { id }: FindOneParams,
    @Body() { kpi_category_name, description }: UpdateKpiCategoryDto,
  ) {
    return this.kpiCategoriesService.updateKpiCategory(Number(id), {
      kpi_category_name,
      description,
    });
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Delete(':id')
  async deleteKpiCategory(@Param() { id }: FindOneParams) {
    return this.kpiCategoriesService.deleteKpiCategory(Number(id));
  }
}
