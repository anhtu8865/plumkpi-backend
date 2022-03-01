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
  getAllKpiTemplates(@Query() kpiTemplateParams: KpiTemplateParams) {
    return this.kpiTemplatesService.getAllKpiTemplates(kpiTemplateParams);
  }

  @UseGuards(RoleGuard([Role.Admin, Role.Director]))
  @Get(':id')
  getKpiTemplateById(@Param() { id }: FindOneParams) {
    return this.kpiTemplatesService.getKpiTemplateById(Number(id));
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Post()
  async createKpiTemplate(@Body() kpiTemplate: CreateKpiTemplateDto) {
    return this.kpiTemplatesService.createKpiTemplate(kpiTemplate);
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Put(':id')
  async replaceKpiTemplate(
    @Param() { id }: FindOneParams,
    @Body() kpiTemplate: UpdateKpiTemplateDto,
  ) {
    return this.kpiTemplatesService.updateKpiTemplate(Number(id), kpiTemplate);
  }

  @UseGuards(RoleGuard([Role.Admin]))
  @Delete(':id')
  async deleteKpiTemplate(@Param() { id }: FindOneParams) {
    return this.kpiTemplatesService.deleteKpiTemplate(Number(id));
  }
}
