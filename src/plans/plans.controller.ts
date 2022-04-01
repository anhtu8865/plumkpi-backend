import { ApproveMonthlyTargetDto } from './dto/approveMonthlyTarget.dto';
import { KpisDto, RegisterKpisDto } from './dto/registerKpis.dto';
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
import {
  KpiCategoriesDto,
  KpiCategoryDto,
  RegisterKpiCategoriesDto,
} from './dto/registerKpiCategories.dto';
import {
  KpisOfOneCategoryInDeptParams,
  KpisOfOneCategoryOfUserParams,
  KpisOfOneCategoryParams,
} from './params/kpisOfOneCategoryParams';
import { RegisterTargetDto } from './dto/registerTarget.dto';
import { AssignKpiDeptsDto } from './dto/assignKpiDepts.dto';
import { TargetKpiOfDeptsParams } from 'src/utils/types/targetKpiOfDeptsParams';
import {
  EnterDataMonthlyTargetDto,
  EnterDataQuarterlyTargetDto,
  RegisterQuarterlyTargetDto,
} from './dto/registerQuarterlyTarget.dto';
import { ApproveQuarterlyTargetDto } from './dto/approveQuarterlyTarget.dto';
import { AssignKpiEmployeesDto } from './dto/assignKpiEmployees.dto';
import { RegisterMonthlyTargetDto } from './dto/registerMonthlyTarget.dto';
import { RegisterPersonalKpisDto } from './dto/registerPersonalKpis.dto';
import { RegisterMonthlyTargetByEmployeeDto } from './dto/registerMonthlyTargetByEmployee.dto';
import { DeptParam, UserParam } from './params/deptParam';
import { monthParams, quarterParams } from 'src/utils/types/monthParams';

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

  @UseGuards(RoleGuard([Role.Director]))
  @Get(':id/kpi-categories/director/dept')
  getPlanKpiCategoriesDept(
    @Param() { id }: FindOneParams,
    @Query() { dept_id }: DeptParam,
  ) {
    return this.plansService.getPlanKpiCategoriesByManager(Number(id), dept_id);
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Get(':id/kpi-categories/manager/user')
  getPlanKpiCategoriesUser(
    @Param() { id }: FindOneParams,
    @Query() { user_id }: UserParam,
  ) {
    return this.plansService.getPlanKpiCategoriesByEmployee(
      Number(id),
      user_id,
    );
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Put(':id/kpi-categories/director/dept')
  updateWeightPlanKpiCategoriesDept(
    @Param() { id }: FindOneParams,
    @Query() { dept_id }: DeptParam,
    @Body() { kpi_categories }: KpiCategoriesDto,
  ) {
    return this.plansService.updateWeightPlanKpiCategoriesDept(
      Number(id),
      dept_id,
      kpi_categories,
    );
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Put(':id/kpi-categories/manager/user')
  updateWeightPlanKpiCategoriesUser(
    @Param() { id }: FindOneParams,
    @Query() { user_id }: UserParam,
    @Body() { kpi_categories }: KpiCategoriesDto,
  ) {
    return this.plansService.updateWeightPlanKpiCategoriesUser(
      Number(id),
      user_id,
      kpi_categories,
    );
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Put(':id/kpis/director/dept')
  updateWeightPlanKpiTemplatesDept(
    @Param() { id }: FindOneParams,
    @Query() { dept_id }: DeptParam,
    @Body() { kpi_templates }: KpisDto,
  ) {
    return this.plansService.updateWeightPlanKpiTemplatesDept(
      Number(id),
      dept_id,
      kpi_templates,
    );
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Put(':id/kpis/manager/user')
  updateWeightPlanKpiTemplatesUser(
    @Param() { id }: FindOneParams,
    @Query() { user_id }: UserParam,
    @Body() { kpi_templates }: KpisDto,
  ) {
    return this.plansService.updateWeightPlanKpiTemplatesUser(
      Number(id),
      user_id,
      kpi_templates,
    );
  }

  @Get('all')
  getAllPlans() {
    return this.plansService.getAllPlans();
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
  @Get(':id/kpis/director/dept')
  async getKpisOfOneCategoryInDept(
    @Param() { id }: FindOneParams,
    @Query()
    {
      offset,
      limit,
      name,
      kpi_category_id,
      dept_id,
    }: KpisOfOneCategoryInDeptParams,
  ) {
    return this.plansService.getKpisOfOneCategoryInDept(
      Number(id),
      offset,
      limit,
      name,
      kpi_category_id,
      dept_id,
    );
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Get(':id/kpis/manager/user')
  async getKpisOfOneCategoryOfUser(
    @Param() { id }: FindOneParams,
    @Query()
    {
      offset,
      limit,
      name,
      kpi_category_id,
      user_id,
    }: KpisOfOneCategoryOfUserParams,
  ) {
    return this.plansService.getKpisOfOneCategoryOfUser(
      Number(id),
      offset,
      limit,
      name,
      kpi_category_id,
      user_id,
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

  @UseGuards(RoleGuard([Role.Employee]))
  @Get(':id/performance/employee/month')
  getPerformanceOfEmployeeByMonth(
    @Param() { id }: FindOneParams,
    @Req() request: RequestWithUser,
    @Query() { month }: monthParams,
  ) {
    const user_id = request.user.user_id;
    return this.plansService.getPerformanceOfEmployee(Number(id), user_id, [
      Number(month),
    ]);
  }

  @UseGuards(RoleGuard([Role.Employee]))
  @Get(':id/performance/employee/quarter')
  getPerformanceOfEmployeeByQuarter(
    @Param() { id }: FindOneParams,
    @Req() request: RequestWithUser,
    @Query() { quarter }: quarterParams,
  ) {
    const user_id = request.user.user_id;
    quarter = Number(quarter);
    const months =
      quarter === 1
        ? [1, 2, 3]
        : quarter === 2
        ? [4, 5, 6]
        : quarter === 3
        ? [7, 8, 9]
        : [10, 11, 12];
    return this.plansService.getPerformanceOfEmployee(
      Number(id),
      user_id,
      months,
    );
  }

  @UseGuards(RoleGuard([Role.Employee]))
  @Get(':id/performance/employee/year')
  getPerformanceOfEmployeeByYear(
    @Param() { id }: FindOneParams,
    @Req() request: RequestWithUser,
  ) {
    const user_id = request.user.user_id;
    const N = 12;
    const months = [...Array(N + 1).keys()].slice(1);
    return this.plansService.getPerformanceOfEmployee(
      Number(id),
      user_id,
      months,
    );
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Get(':id/performance/manager/month')
  getPerformanceOfDeptByMonth(
    @Param() { id }: FindOneParams,
    @Req() request: RequestWithUser,
    @Query() { month }: monthParams,
  ) {
    const dept_id = request.user.manage.dept_id;
    return this.plansService.getPerformanceOfManager(Number(id), dept_id, [
      Number(month),
    ]);
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Get(':id/performance/director/month')
  getPerformanceOfDirectorByMonth(
    @Param() { id }: FindOneParams,
    @Query() { month }: monthParams,
  ) {
    return this.plansService.getPerformanceOfDirector(Number(id), [
      Number(month),
    ]);
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Get(':id/performance/manager/quarter')
  getPerformanceOfDeptByQuarter(
    @Param() { id }: FindOneParams,
    @Req() request: RequestWithUser,
    @Query() { quarter }: quarterParams,
  ) {
    const dept_id = request.user.manage.dept_id;
    quarter = Number(quarter);
    const months =
      quarter === 1
        ? [1, 2, 3]
        : quarter === 2
        ? [4, 5, 6]
        : quarter === 3
        ? [7, 8, 9]
        : [10, 11, 12];
    return this.plansService.getPerformanceOfManager(
      Number(id),
      dept_id,
      months,
    );
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Get(':id/performance/director/quarter')
  getPerformanceOfDirectorByQuarter(
    @Param() { id }: FindOneParams,
    @Query() { quarter }: quarterParams,
  ) {
    quarter = Number(quarter);
    const months =
      quarter === 1
        ? [1, 2, 3]
        : quarter === 2
        ? [4, 5, 6]
        : quarter === 3
        ? [7, 8, 9]
        : [10, 11, 12];
    return this.plansService.getPerformanceOfDirector(Number(id), months);
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Get(':id/performance/manager/year')
  getPerformanceOfDeptByYear(
    @Param() { id }: FindOneParams,
    @Req() request: RequestWithUser,
  ) {
    const dept_id = request.user.manage.dept_id;
    const N = 12;
    const months = [...Array(N + 1).keys()].slice(1);
    return this.plansService.getPerformanceOfManager(
      Number(id),
      dept_id,
      months,
    );
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Get(':id/performance/director/year')
  getPerformanceOfDirectorByYear(@Param() { id }: FindOneParams) {
    const N = 12;
    const months = [...Array(N + 1).keys()].slice(1);
    return this.plansService.getPerformanceOfDirector(Number(id), months);
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

  @UseGuards(RoleGuard([Role.Manager]))
  @Get(':id/kpis/manager/personal-kpis-of-employees')
  async getKpisOfPersonalKpisOfEmployeesByManager(
    @Param() { id }: FindOneParams,
    @Query() { offset, limit, name }: PaginationParams,
    @Req() request: RequestWithUser,
  ) {
    const dept_id = request.user.manage.dept_id;
    return this.plansService.getKpisOfPersonalKpisOfEmployeesByManager(
      Number(id),
      offset,
      limit,
      name,
      dept_id,
    );
  }

  @UseGuards(RoleGuard([Role.Director]))
  @Get(':id/kpis/director/personal-kpis-of-depts')
  async getKpisOfPersonalKpisOfDeptsByDirector(
    @Param() { id }: FindOneParams,
    @Query() { offset, limit, name }: PaginationParams,
  ) {
    return this.plansService.getKpisOfPersonalKpisOfDeptsByDirector(
      Number(id),
      offset,
      limit,
      name,
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

  @Get(':id/kpis/user')
  async getKpis(
    @Param() { id }: FindOneParams,
    @Req() request: RequestWithUser,
  ) {
    const user = request.user;
    const plan = await this.plansService.getPlanById(Number(id));
    return this.plansService.getKpis(plan, user);
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

  @UseGuards(RoleGuard([Role.Manager]))
  @Put('enter-data-quarterly-target/manager')
  async enterDataQuarterlyTarget(
    @Body()
    {
      plan_id,
      kpi_template_id,
      quarter,
      value,
      note,
    }: EnterDataQuarterlyTargetDto,
    @Req() request: RequestWithUser,
  ) {
    const dept_id = request.user.manage.dept_id;
    return this.plansService.enterDataQuarterlyTarget(
      plan_id,
      kpi_template_id,
      quarter,
      value,
      note,
      dept_id,
    );
  }

  @UseGuards(RoleGuard([Role.Employee]))
  @Put('enter-data-monthly-target/employee')
  async enterDataMonthlyTarget(
    @Body()
    { plan_id, kpi_template_id, month, value, note }: EnterDataMonthlyTargetDto,
    @Req() request: RequestWithUser,
  ) {
    const user_id = request.user.user_id;
    return this.plansService.enterDataMonthlyTarget(
      plan_id,
      kpi_template_id,
      month,
      value,
      note,
      user_id,
    );
  }

  @UseGuards(RoleGuard([Role.Employee]))
  @Put('register-monthly-target/employee')
  async registerMonthlyTargetByEmployee(
    @Body()
    {
      plan_id,
      kpi_template_id,
      target,
      month,
    }: RegisterMonthlyTargetByEmployeeDto,
    @Req() request: RequestWithUser,
  ) {
    const user_id = request.user.user_id;
    return this.plansService.registerMonthlyTargetByEmployee(
      plan_id,
      kpi_template_id,
      target,
      month,
      user_id,
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

  @UseGuards(RoleGuard([Role.Director]))
  @Put('approve-data-quarterly-target/director')
  async approveDataQuarterlyTarget(
    @Body()
    {
      plan_id,
      kpi_template_id,
      dept_id,
      quarter,
      approve,
    }: ApproveQuarterlyTargetDto,
  ) {
    return this.plansService.approveDataQuarterlyTarget(
      plan_id,
      kpi_template_id,
      dept_id,
      quarter,
      approve,
    );
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Put('approve-data-monthly-target/manager')
  async approveDataMonthlyTarget(
    @Body()
    {
      plan_id,
      kpi_template_id,
      user_id,
      month,
      approve,
    }: ApproveMonthlyTargetDto,
  ) {
    return this.plansService.approveDataMonthlyTarget(
      plan_id,
      kpi_template_id,
      user_id,
      month,
      approve,
    );
  }

  @UseGuards(RoleGuard([Role.Manager]))
  @Put('approve-monthly-target/manager')
  async approveMonthlyTarget(
    @Body()
    {
      plan_id,
      kpi_template_id,
      user_id,
      month,
      approve,
    }: ApproveMonthlyTargetDto,
  ) {
    return this.plansService.approveMonthlyTarget(
      plan_id,
      kpi_template_id,
      user_id,
      month,
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

  @UseGuards(RoleGuard([Role.Manager]))
  @Post('register-personal-kpis/manager')
  async registerPersonalKpisByManager(
    @Body() { plan_id, personal_kpis }: RegisterPersonalKpisDto,
    @Req() request: RequestWithUser,
  ) {
    const dept_id = request.user.manage.dept_id;
    return this.plansService.registerPersonalKpisByManager(
      plan_id,
      personal_kpis,
      dept_id,
    );
  }

  @UseGuards(RoleGuard([Role.Employee]))
  @Post('register-personal-kpis/employee')
  async registerPersonalKpisByEmployee(
    @Body() { plan_id, personal_kpis }: RegisterPersonalKpisDto,
    @Req() request: RequestWithUser,
  ) {
    const user_id = request.user.user_id;
    return this.plansService.registerPersonalKpisByEmployee(
      plan_id,
      personal_kpis,
      user_id,
    );
  }
}
