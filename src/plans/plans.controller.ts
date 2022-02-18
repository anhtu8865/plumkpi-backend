import { DeleteKpiCategoryParams } from './types/deleteKpiCategoryParams';
import { AddKpiCategoryDto } from './dto/addKpiCategory.dto';
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
import Role from 'src/users/role.enum';
import RoleGuard from 'src/users/role.guard';
import FindOneParams from 'src/utils/findOneParams';
import { PaginationParams } from 'src/utils/types/paginationParams';
import PlansService from './plans.service';
import CreatePlanDto from './dto/createPlan.dto';
import UpdatePlanDto from './dto/updatePlan.dto';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import UpdateKpiCategoryDto from './dto/updateKpiCategory.dto';

@Controller('plans')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthenticationGuard)
export default class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @UseGuards(RoleGuard([Role.Director]))
  @Get()
  getAllPlans(@Query() { offset, limit, name }: PaginationParams) {
    return this.plansService.getAllPlans(offset, limit, name);
  }

  @Get(':id')
  getPlanById(@Param() { id }: FindOneParams) {
    return this.plansService.getPlanById(Number(id));
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Post()
  async createPlan(
    @Body() plan: CreatePlanDto,
    @Req() request: RequestWithUser,
  ) {
    const newPlan = { ...plan, user: request.user.user_id };
    return this.plansService.createPlan(newPlan);
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Put('update-kpi-category')
  async replaceKpiCategory(@Body() kpiCategory: UpdateKpiCategoryDto) {
    return this.plansService.updateKpiCategory(kpiCategory);
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Put(':id')
  async replacePlan(
    @Param() { id }: FindOneParams,
    @Body() plan: UpdatePlanDto,
  ) {
    return this.plansService.updatePlan(Number(id), plan);
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Delete('/delete-kpi-category')
  async deleteKpiCategory(
    @Query() { plan_id, kpi_category_id }: DeleteKpiCategoryParams,
  ) {
    return this.plansService.deleteKpiCategory(plan_id, kpi_category_id);
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Delete(':id')
  async deletePlan(@Param() { id }: FindOneParams) {
    return this.plansService.deletePlan(Number(id));
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Post('/add-kpi-category')
  async addKpiCategory(@Body() kpiCategory: AddKpiCategoryDto) {
    return this.plansService.addKpiCategory(kpiCategory);
  }
}
