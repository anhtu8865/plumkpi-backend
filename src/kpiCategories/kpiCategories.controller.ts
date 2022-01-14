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
import FindOneParams from 'src/utils/findOneParams';
import KpiCategoriesService from './kpiCategories.service';
import CreateKpiCategoryDto from './dto/createKpiCategory.dto';
import UpdateKpiCategoryDto from './dto/updateKpiCategory.dto';

@Controller('kpi-categories')
@UseInterceptors(ClassSerializerInterceptor)
//@UseGuards(JwtAuthenticationGuard)
export default class KpiCategoriesController {
  constructor(private readonly kpiCategoriesService: KpiCategoriesService) {}

  @Get()
  getAllKpiCategories() {
    return this.kpiCategoriesService.getAllKpiCategories();
  }

  @Get(':id')
  getKpiCategoryById(@Param() { id }: FindOneParams) {
    return this.kpiCategoriesService.getKpiCategoryById(Number(id));
  }

  @Post()
  async createKpiCategory(@Body() kpiCategory: CreateKpiCategoryDto) {
    return this.kpiCategoriesService.createKpiCategory(kpiCategory);
  }

  @Put(':id')
  async replaceKpiCategory(
    @Param() { id }: FindOneParams,
    @Body() kpiCategory: UpdateKpiCategoryDto,
  ) {
    return this.kpiCategoriesService.updateKpiCategory(Number(id), kpiCategory);
  }

  @Delete(':id')
  async deleteKpiCategory(@Param() { id }: FindOneParams) {
    return this.kpiCategoriesService.deleteKpiCategory(Number(id));
  }
}
