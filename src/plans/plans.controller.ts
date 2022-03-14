import { RegisterKpisDto } from './dto/registerKpis.dto';
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
import { RegisterKpiCategoriesDto } from './dto/registerKpiCategories.dto';
import { KpisOfOneCategoryParams } from './params/kpisOfOneCategoryParams';
import { RegisterTargetDto } from './dto/registerTarget.dto';
import { AssignKpiDeptsDto } from './dto/assignKpiDepts.dto';
import { TargetKpiOfDeptsParams } from 'src/utils/types/targetKpiOfDeptsParams';
import { RegisterQuarterlyTargetDto } from './dto/registerQuarterlyTarget.dto';
import { ApproveQuarterlyTargetDto } from './dto/approveQuarterlyTarget.dto';
import { AssignKpiEmployeesDto } from './dto/assignKpiEmployees.dto';
import { RegisterMonthlyTargetDto } from './dto/registerMonthlyTarget.dto';

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

  @UseGuards(RoleGuard([Role.Director]))
  @Get(':id/kpi-categories/director')
  getPlanKpiCategories(@Param() { id }: FindOneParams) {
    return this.plansService.getPlanKpiCategories(Number(id));
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

  @UseGuards(RoleGuard([Role.Director]))
  @Post('register-kpi-categories')
  async registerKpiCategories(
    @Body() { plan_id, kpi_categories }: RegisterKpiCategoriesDto,
  ) {
    return this.plansService.registerKpiCategories(plan_id, kpi_categories);
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Post('register-kpis')
  async assignKpis(
    @Body() { plan_id, kpi_category_id, kpis }: RegisterKpisDto,
  ) {
    return this.plansService.registerKpis(plan_id, kpi_category_id, kpis);
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Get(':id/kpis/director')
  async getKpisOfOneCategory(
    @Param() { id }: FindOneParams,
    @Query() { offset, limit, name, kpi_category_id }: KpisOfOneCategoryParams,
  ) {
    return this.plansService.getKpisOfOneCategory(
      Number(id),
      offset,
      limit,
      name,
      kpi_category_id,
    );
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Put('register-target/director')
  async registerTarget(
    @Body() { plan_id, kpi_template_id, target }: RegisterTargetDto,
  ) {
    return this.plansService.registerTarget(plan_id, kpi_template_id, target);
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Post('assign-kpi-depts')
  async assignKpiDepts(
    @Body() { plan_id, kpi_template_id, depts }: AssignKpiDeptsDto,
  ) {
    return this.plansService.assignKpiDepts(plan_id, kpi_template_id, depts);
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Get('plan/target-kpi-of-depts')
  async getTargetKpiOfdepts(
    @Query() { plan_id, kpi_template_id }: TargetKpiOfDeptsParams,
  ) {
    return this.plansService.getTargetKpiOfdepts(plan_id, kpi_template_id);
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Get(':id/kpi-categories/manager')
  getPlanKpiCategoriesByManager(
    @Param() { id }: FindOneParams,
    @Req() request: RequestWithUser,
  ) {
    const dept_id = request.user.manage.dept_id;
    return this.plansService.getPlanKpiCategoriesByManager(Number(id), dept_id);
  }

  @UseGuards(RoleGuard([Role.Employee]))
  @Get(':id/kpi-categories/employee')
  getPlanKpiCategoriesByEmployee(
    @Param() { id }: FindOneParams,
    @Req() request: RequestWithUser,
  ) {
    const user_id = request.user.user_id;
    return this.plansService.getPlanKpiCategoriesByEmployee(
      Number(id),
      user_id,
    );
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Get(':id/kpis/manager')
  async getKpisOfOneCategoryByManager(
    @Param() { id }: FindOneParams,
    @Query() { offset, limit, name, kpi_category_id }: KpisOfOneCategoryParams,
    @Req() request: RequestWithUser,
  ) {
    const dept_id = request.user.manage.dept_id;
    return this.plansService.getKpisOfOneCategoryByManager(
      Number(id),
      offset,
      limit,
      name,
      kpi_category_id,
      dept_id,
    );
  }

  @UseGuards(RoleGuard([Role.Employee]))
  @Get(':id/kpis/employee')
  async getKpisOfOneCategoryByEmployee(
    @Param() { id }: FindOneParams,
    @Query() { offset, limit, name, kpi_category_id }: KpisOfOneCategoryParams,
    @Req() request: RequestWithUser,
  ) {
    const user_id = request.user.user_id;
    return this.plansService.getKpisOfOneCategoryByEmployee(
      Number(id),
      offset,
      limit,
      name,
      kpi_category_id,
      user_id,
    );
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Put('register-quarterly-target/manager')
  async registerQuarterlyTarget(
    @Body()
    { plan_id, kpi_template_id, target, quarter }: RegisterQuarterlyTargetDto,
    @Req() request: RequestWithUser,
  ) {
    const dept_id = request.user.manage.dept_id;
    return this.plansService.registerQuarterlyTarget(
      plan_id,
      kpi_template_id,
      target,
      quarter,
      dept_id,
    );
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Put('approve-quarterly-target/director')
  async approveQuarterlyTarget(
    @Body()
    {
      plan_id,
      kpi_template_id,
      dept_id,
      quarter,
      approve,
    }: ApproveQuarterlyTargetDto,
  ) {
    return this.plansService.approveQuarterlyTarget(
      plan_id,
      kpi_template_id,
      dept_id,
      quarter,
      approve,
    );
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Put('register-monthly-target/manager')
  async registerMonthlyTarget(
    @Body()
    {
      plan_id,
      kpi_template_id,
      target,
      month,
      users,
    }: RegisterMonthlyTargetDto,
    @Req() request: RequestWithUser,
  ) {
    const dept_id = request.user.manage.dept_id;
    return this.plansService.registerMonthlyTarget(
      plan_id,
      kpi_template_id,
      target,
      month,
      users,
      dept_id,
    );
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Post('assign-kpi-employees')
  async assignKpiEmployees(
    @Req() request: RequestWithUser,
    @Body() { plan_id, kpi_template_id, users }: AssignKpiEmployeesDto,
  ) {
    const dept_id = request.user.manage.dept_id;
    return this.plansService.assignKpiEmployees(
      plan_id,
      kpi_template_id,
      dept_id,
      users,
    );
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Get('plan/target-kpi-of-employees')
  async getTargetKpiOfEmployees(
    @Query() { plan_id, kpi_template_id }: TargetKpiOfDeptsParams,
    @Req() request: RequestWithUser,
  ) {
    const dept_id = request.user.manage.dept_id;
    return this.plansService.getTargetKpiOfEmployees(
      plan_id,
      kpi_template_id,
      dept_id,
    );
  }
}
