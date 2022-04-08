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
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import FindOneParams from 'src/utils/findOneParams';
import KpiTemplatesService from './kpiTemplates.service';
import CreateKpiTemplateDto from './dto/createKpiTemplate.dto';
import UpdateKpiTemplateDto from './dto/updateKpiTemplate.dto';
import RoleGuard from 'src/users/role.guard';
import Role from 'src/users/role.enum';
import {
  GetPersonalKpisParams,
  PaginationParams,
} from 'src/utils/types/paginationParams';
import { KpiTemplateParams } from 'src/utils/types/kpiTemplateParams';
import RequestWithUser from 'src/authentication/requestWithUser.interface';

@Controller('kpi-templates')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthenticationGuard)
export default class KpiTemplatesController {
  constructor(private readonly kpiTemplatesService: KpiTemplatesService) {}

  @UseGuards(RoleGuard([Role.Admin, Role.Director]))
  @Get()
  getKpiTemplates(@Query() params: KpiTemplateParams) {
    return this.kpiTemplatesService.getKpiTemplatesOfCategory(params);
  }

  @UseGuards(RoleGuard([Role.Manager, Role.Employee]))
  @Get('personal-kpis')
  getPersonalKpiTemplates(
    @Query() { offset, limit, name, plan_id }: GetPersonalKpisParams,
    @Req() request: RequestWithUser,
  ) {
    plan_id = Number(plan_id);
    const user = request.user;
    return this.kpiTemplatesService.getPersonalKpiTemplates(
      offset,
      limit,
      name,
      plan_id,
      user,
    );
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
      aggregation,
      unit,
      measures,
      kpi_category,
    }: CreateKpiTemplateDto,
  ) {
    return this.kpiTemplatesService.createKpiTemplate({
      kpi_template_name,
      description,
      aggregation,
      unit,
      measures,
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
      aggregation,
      unit,
      measures,
      kpi_category,
    }: UpdateKpiTemplateDto,
  ) {
    return this.kpiTemplatesService.updateKpiTemplate(Number(id), {
      kpi_template_name,
      description,
      aggregation,
      unit,
      measures,
      kpi_category,
    });
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Delete(':id')
  async deleteKpiTemplate(@Param() { id }: FindOneParams) {
    return this.kpiTemplatesService.deleteKpiTemplate(Number(id));
  }
}
