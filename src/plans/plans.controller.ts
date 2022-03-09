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
import { AddKpiCategoriesDto } from './dto/addKpiCategories.dto';
import AssignKpi from './dto/assignKpi.dto';
import registerPersonalKpiDto from './dto/registerPersonalKpi.dto';
import DeletePersonalKpiParams from './params/deletePersonalKpiParams';
import { ApprovePersonalKpisDto } from './dto/approvePersonalKpis.dto';

@Controller('plans')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthenticationGuard)
export default class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @UseGuards(RoleGuard([Role.Director]))
  @Post()
  async createPlan(@Body() { plan_name, description, year }: CreatePlanDto) {
    return this.plansService.createPlan({ plan_name, description, year });
  }

  @Get(':id')
  getPlanById(@Param() { id }: FindOneParams) {
    return this.plansService.getPlanById(Number(id));
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Put(':id')
  async replacePlan(
    @Param() { id }: FindOneParams,
    @Body() { plan_name, description, year }: UpdatePlanDto,
  ) {
    return this.plansService.updatePlan(Number(id), {
      plan_name,
      description,
      year,
    });
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Delete(':id')
  async deletePlan(@Param() { id }: FindOneParams) {
    return this.plansService.deletePlan(Number(id));
  }

  @Get()
  getPlans(@Query() { offset, limit, name }: PaginationParams) {
    return this.plansService.getPlans(offset, limit, name);
  }

  /*

  @Get('user')
  getAllPlansOfUser(
    @Query() { offset, limit, name }: PaginationParams,
    @Req() request: RequestWithUser,
  ) {
    return this.plansService.getAllPlansOfUser(
      request.user,
      offset,
      limit,
      name,
    );
  }



  @Get('user/:id')
  getPlanOfUserById(
    @Param() { id }: FindOneParams,
    @Req() request: RequestWithUser,
  ) {
    return this.plansService.getPlanOfUserById(Number(id), request.user);
  }






  @UseGuards(RoleGuard([Role.Director]))
  @Post('add-kpi-categories')
  async addKpiCategories(@Body() body: AddKpiCategoriesDto) {
    return this.plansService.addKpiCategories(body);
  }

  @UseGuards(RoleGuard([Role.Director, Role.Manager]))
  @Post('assign-kpi')
  async assignKpi(@Body() body: AssignKpi) {
    return this.plansService.assignKpi(body);
  }

  @UseGuards(RoleGuard([Role.Employee, Role.Manager]))
  @Post('register-personal-kpi')
  async registerPersonalKpi(@Body() body: registerPersonalKpiDto) {
    return this.plansService.registerPersonalKpi(body);
  }

  @UseGuards(RoleGuard([Role.Manager, Role.Employee]))
  @Delete('plan/:plan_id/kpi-template/:kpi_template_id')
  async deletePersonalKpi(
    @Param() { plan_id, kpi_template_id }: DeletePersonalKpiParams,
  ) {
    return this.plansService.deletePersonalKpi(
      Number(plan_id),
      Number(kpi_template_id),
    );
  }

  @UseGuards(RoleGuard([Role.Director, Role.Manager]))
  @Get('plan/:plan_id/assign-kpi/:kpi_template_id')
  async getInfoAssignKpi(
    @Param() { plan_id, kpi_template_id }: DeletePersonalKpiParams,
  ) {
    return this.plansService.getInfoAssignKpi(
      Number(plan_id),
      Number(kpi_template_id),
    );
  }

  @UseGuards(RoleGuard([Role.Director, Role.Manager]))
  @Get('plan/:id/personal-kpis')
  async getPersonalKpis(
    @Query() { offset, limit, name }: PaginationParams,
    @Param() { id }: FindOneParams,
  ) {
    return this.plansService.getPersonalKpis(Number(id), offset, limit, name);
  }

  @UseGuards(RoleGuard([Role.Director, Role.Manager]))
  @Put('plan/:id/personal-kpis')
  async approvePersonalKpis(
    @Param() { id }: FindOneParams,
    @Body() body: ApprovePersonalKpisDto,
  ) {
    return this.plansService.approvePersonalKpis(Number(id), body);
  } */
}
