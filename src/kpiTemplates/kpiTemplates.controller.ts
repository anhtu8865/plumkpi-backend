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
import KpiTemplatesService from './kpiTemplates.service';
import CreateKpiTemplateDto from './dto/createKpiTemplate.dto';
import UpdateKpiTemplateDto from './dto/updateKpiTemplate.dto';
import RoleGuard from 'src/users/role.guard';
import Role from 'src/users/role.enum';
import { PaginationParams } from 'src/utils/types/paginationParams';
import { KpiTemplateParams } from 'src/utils/types/kpiTemplateParams';

@Controller('kpi-templates')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthenticationGuard)
export default class KpiTemplatesController {
  constructor(private readonly kpiTemplatesService: KpiTemplatesService) {}

  @UseGuards(RoleGuard([Role.Admin, Role.Director]))
  @Get()
  getKpiTemplates(@Query() params: KpiTemplateParams) {
    return this.kpiTemplatesService.getKpiTemplates(params);
  }

  // @UseGuards(RoleGuard([Role.Admin, Role.Director]))
  // @Get(':id')
  // getKpiTemplateById(@Param() { id }: FindOneParams) {
  //   return this.kpiTemplatesService.getKpiTemplateById(Number(id));
  // }

  @UseGuards(RoleGuard([Role.Admin]))
  @Post()
  async createKpiTemplate(
    @Body()
    {
      kpi_template_name,
      description,
      frequency,
      direction,
      aggregation,
      unit,
      formula,
      red_threshold,
      red_yellow_threshold,
      yellow_green_threshold,
      green_threshold,
      kpi_category,
    }: CreateKpiTemplateDto,
  ) {
    return this.kpiTemplatesService.createKpiTemplate({
      kpi_template_name,
      description,
      frequency,
      direction,
      aggregation,
      unit,
      formula,
      red_threshold,
      red_yellow_threshold,
      yellow_green_threshold,
      green_threshold,
      kpi_category,
    });
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Put(':id')
  async replaceKpiTemplate(
    @Param() { id }: FindOneParams,
    @Body()
    {
      kpi_template_name,
      description,
      frequency,
      direction,
      aggregation,
      unit,
      formula,
      red_threshold,
      red_yellow_threshold,
      yellow_green_threshold,
      green_threshold,
      kpi_category,
    }: UpdateKpiTemplateDto,
  ) {
    return this.kpiTemplatesService.updateKpiTemplate(Number(id), {
      kpi_template_name,
      description,
      frequency,
      direction,
      aggregation,
      unit,
      formula,
      red_threshold,
      red_yellow_threshold,
      yellow_green_threshold,
      green_threshold,
      kpi_category,
    });
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Delete(':id')
  async deleteKpiTemplate(@Param() { id }: FindOneParams) {
    return this.kpiTemplatesService.deleteKpiTemplate(Number(id));
  }
}
