import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import Role from 'src/users/role.enum';
import RoleGuard from 'src/users/role.guard';
import DashboardsService from './dashboards.service';
import { CreateDashboardDto, UpdateDashboardDto } from './dto/dashboard.dto';
import { DashboardIdParam, DashboardNameParam } from './params/dashboardParams';

@Controller('dashboards')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(RoleGuard([Role.Director, Role.Manager, Role.Employee]))
@UseGuards(JwtAuthenticationGuard)
export default class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Post()
  async createDashboard(
    @Body() { dashboard_name, description }: CreateDashboardDto,
    @Req() request: RequestWithUser,
  ) {
    const role = request.user.role;
    let data;
    if (role === Role.Director) {
      data = { dashboard_name, description };
    } else if (role === Role.Manager) {
      const dept_id = request.user.manage.dept_id;
      data = {
        dashboard_name,
        description,
        dept: { dept_id },
      };
    } else {
      const user_id = request.user.user_id;
      data = {
        dashboard_name,
        description,
        user: { user_id },
      };
    }
    return this.dashboardsService.createDashboard(data);
  }

  @Put('dashboard')
  async updateDashboard(
    @Query() { dashboard_id }: DashboardIdParam,
    @Body() { dashboard_name, description }: UpdateDashboardDto,
    @Req() request: RequestWithUser,
  ) {
    dashboard_id = Number(dashboard_id);
    const user = request.user;

    return this.dashboardsService.updateDashboard(
      { dashboard_name, description },
      dashboard_id,
      user,
    );
  }

  @Delete('dashboard')
  async deleteDashboard(
    @Query() { dashboard_id }: DashboardIdParam,
    @Req() request: RequestWithUser,
  ) {
    const user = request.user;
    dashboard_id = Number(dashboard_id);
    return this.dashboardsService.deleteDashboard(dashboard_id, user);
  }

  @Get()
  async getDashboards(
    @Req() request: RequestWithUser,
    @Query() { dashboard_name }: DashboardNameParam,
  ) {
    const user = request.user;
    return this.dashboardsService.getDashboards(user, dashboard_name);
  }
}
